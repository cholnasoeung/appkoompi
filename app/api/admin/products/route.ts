import mongoose from "mongoose";
import { getAdminApiSession, serializeAdminProduct } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

function buildErrorResponse(error: unknown, fallbackMessage: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    const duplicateField = Object.keys(
      (error as { keyPattern?: Record<string, number> }).keyPattern ?? {}
    )[0];

    return Response.json(
      {
        message: duplicateField
          ? `${duplicateField} already exists.`
          : "A unique field already exists.",
      },
      { status: 409 }
    );
  }

  if (error instanceof Error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json({ message: fallbackMessage }, { status: 500 });
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseList(value: unknown) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseImages(value: unknown, fallbackName: string) {
  if (!Array.isArray(value)) {
    return [];
  }

  const images = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const url =
        typeof (item as { url?: unknown }).url === "string"
          ? (item as { url: string }).url.trim()
          : "";

      if (!url) {
        return null;
      }

      const alt =
        typeof (item as { alt?: unknown }).alt === "string"
          ? (item as { alt: string }).alt.trim()
          : "";

      return {
        url,
        alt: alt || fallbackName,
        isPrimary: Boolean((item as { isPrimary?: unknown }).isPrimary),
      };
    })
    .filter(
      (
        image
      ): image is { url: string; alt: string; isPrimary: boolean } => image !== null
    );

  if (images.length === 0) {
    return [];
  }

  const primaryIndex = images.findIndex((image) => image.isPrimary);
  const normalizedPrimaryIndex = primaryIndex >= 0 ? primaryIndex : 0;

  return images.map((image, index) => ({
    ...image,
    isPrimary: index === normalizedPrimaryIndex,
  }));
}

function normalizeAttributes(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const normalizedEntries = Object.entries(value as Record<string, unknown>).map(
    ([key, itemValue]) => {
      if (!Array.isArray(itemValue)) {
        throw new Error(`Attribute "${key}" must be an array of strings.`);
      }

      return [
        key,
        itemValue
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean),
      ] as const;
    }
  );

  return Object.fromEntries(normalizedEntries);
}

async function parseProductPayload(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = normalizeSlug(typeof body.slug === "string" ? body.slug : name);
  const categoryId =
    typeof body.categoryId === "string" ? body.categoryId.trim() : "";
  const sku = typeof body.sku === "string" ? body.sku.trim() : "";
  const price = Number(body.price);
  const stock = Number(body.stock);
  const discountPrice =
    body.discountPrice === null || body.discountPrice === ""
      ? null
      : Number(body.discountPrice);

  if (name.length < 2) {
    return { error: "Product name must be at least 2 characters." };
  }

  if (!slug) {
    return { error: "Product slug is required." };
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return { error: "Choose a valid category." };
  }

  if (!sku) {
    return { error: "SKU is required." };
  }

  if (Number.isNaN(price) || price < 0) {
    return { error: "Price must be a valid non-negative number." };
  }

  if (
    discountPrice !== null &&
    (Number.isNaN(discountPrice) || discountPrice < 0)
  ) {
    return { error: "Discount price must be a valid non-negative number." };
  }

  if (Number.isNaN(stock) || stock < 0) {
    return { error: "Stock must be a valid non-negative number." };
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    return { error: "Category not found." };
  }

  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const imageAlt = typeof body.imageAlt === "string" ? body.imageAlt.trim() : "";
  const images =
    parseImages(body.images, name).length > 0
      ? parseImages(body.images, name)
      : imageUrl
        ? [{ url: imageUrl, alt: imageAlt || name, isPrimary: true }]
        : [];

  return {
    data: {
      name,
      slug,
      description:
        typeof body.description === "string" ? body.description.trim() : null,
      shortDescription:
        typeof body.shortDescription === "string"
          ? body.shortDescription.trim()
          : null,
      price,
      discountPrice,
      categoryId,
      brand: typeof body.brand === "string" ? body.brand.trim() : null,
      sku,
      stock,
      tags: parseList(body.tags),
      sizes: parseList(body.sizes),
      colors: parseList(body.colors),
      attributes: normalizeAttributes(body.attributes),
      isFeatured: Boolean(body.isFeatured),
      isActive: body.isActive !== false,
      images,
    },
  };
}

export async function GET() {
  try {
    const authResult = await getAdminApiSession();

    if (!authResult.ok) {
      return authResult.response;
    }

    await connectToDatabase();

    const products = await Product.find()
      .populate("categoryId", "name")
      .sort({ updatedAt: -1 })
      .lean();

    return Response.json(
      products.map((product) => {
        const populatedCategory =
          product.categoryId &&
          typeof product.categoryId === "object" &&
          "name" in product.categoryId
            ? product.categoryId
            : null;

        return serializeAdminProduct({
          ...product,
          categoryId: populatedCategory?._id ?? product.categoryId,
          category: populatedCategory
            ? { name: populatedCategory.name as string }
            : null,
        });
      })
    );
  } catch (error) {
    return buildErrorResponse(error, "Failed to fetch products.");
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await getAdminApiSession();

    if (!authResult.ok) {
      return authResult.response;
    }

    await connectToDatabase();

    const body = (await request.json()) as Record<string, unknown>;
    const parsed = await parseProductPayload(body);

    if ("error" in parsed) {
      return Response.json({ message: parsed.error }, { status: 400 });
    }

    const product = await Product.create(parsed.data);
    await product.populate("categoryId", "name");

    const productObject = product.toObject();
    const populatedCategory =
      productObject.categoryId &&
      typeof productObject.categoryId === "object" &&
      "name" in productObject.categoryId
        ? productObject.categoryId
        : null;

    return Response.json(
      {
        message: "Product created successfully.",
        product: serializeAdminProduct({
          ...productObject,
          categoryId: populatedCategory?._id ?? productObject.categoryId,
          category: populatedCategory
            ? { name: populatedCategory.name as string }
            : null,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    return buildErrorResponse(error, "Failed to create product.");
  }
}
