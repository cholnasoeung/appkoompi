import mongoose from "mongoose";
import { getAdminApiSession, serializeAdminProduct } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

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
      attributes:
        body.attributes && typeof body.attributes === "object"
          ? body.attributes
          : {},
      isFeatured: Boolean(body.isFeatured),
      isActive: body.isActive !== false,
      images: imageUrl
        ? [{ url: imageUrl, alt: imageAlt || name, isPrimary: true }]
        : [],
    },
  };
}

export async function GET() {
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
        category: populatedCategory ? { name: populatedCategory.name as string } : null,
      });
    })
  );
}

export async function POST(request: Request) {
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
        category: populatedCategory ? { name: populatedCategory.name as string } : null,
      }),
    },
    { status: 201 }
  );
}
