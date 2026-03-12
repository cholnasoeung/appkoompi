import { auth } from "@/auth";
import { getAppConfigurationError } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { redirect } from "next/navigation";

export type AdminProductSummary = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  sku: string;
  isFeatured: boolean;
  isActive: boolean;
  brand: string | null;
  categoryId: string;
  categoryName: string | null;
  tags: string[];
  sizes: string[];
  colors: string[];
  shortDescription: string | null;
  description: string | null;
  attributes: Record<string, string[]>;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategorySummary = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export async function requireAdminPageSession() {
  const configurationError = getAppConfigurationError();

  if (configurationError) {
    throw new Error(configurationError);
  }

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return session;
}

export async function getAdminApiSession() {
  const configurationError = getAppConfigurationError();

  if (configurationError) {
    return {
      ok: false as const,
      response: Response.json({ message: configurationError }, { status: 503 }),
    };
  }

  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false as const,
      response: Response.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "admin") {
    return {
      ok: false as const,
      response: Response.json({ message: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    session,
  };
}

export function serializeAdminProduct(product: {
  _id: { toString(): string };
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  sku: string;
  isFeatured: boolean;
  isActive: boolean;
  brand?: string | null;
  categoryId: { toString(): string };
  shortDescription?: string | null;
  description?: string | null;
  tags?: string[];
  sizes?: string[];
  colors?: string[];
  attributes?: Map<string, string[]> | Record<string, string[]>;
  images?: Array<{ url: string }>;
  createdAt: Date | string;
  updatedAt: Date | string;
  category?: { name?: string | null } | null;
}) {
  const rawAttributes =
    product.attributes instanceof Map
      ? Object.fromEntries(product.attributes.entries())
      : product.attributes ?? {};

  return {
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    price: product.price,
    discountPrice: product.discountPrice ?? null,
    stock: product.stock,
    sku: product.sku,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    brand: product.brand ?? null,
    categoryId: product.categoryId.toString(),
    categoryName: product.category?.name ?? null,
    tags: product.tags ?? [],
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    shortDescription: product.shortDescription ?? null,
    description: product.description ?? null,
    attributes: rawAttributes,
    imageUrl: product.images?.[0]?.url ?? null,
    createdAt:
      product.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product.createdAt,
    updatedAt:
      product.updatedAt instanceof Date
        ? product.updatedAt.toISOString()
        : product.updatedAt,
  } satisfies AdminProductSummary;
}

export async function getAdminCategories(): Promise<AdminCategorySummary[]> {
  await connectToDatabase();

  const categories = await Category.find().sort({ name: 1 }).lean();

  return categories.map((category) => ({
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    isActive: category.isActive,
  }));
}

export async function getAdminProducts(): Promise<AdminProductSummary[]> {
  await connectToDatabase();

  const products = await Product.find()
    .populate("categoryId", "name")
    .sort({ updatedAt: -1 })
    .lean();

  return products.map((product) => {
    const populatedCategory =
      product.categoryId && typeof product.categoryId === "object" && "name" in product.categoryId
        ? product.categoryId
        : null;

    return serializeAdminProduct({
      ...product,
      categoryId: populatedCategory?._id ?? product.categoryId,
      category: populatedCategory ? { name: populatedCategory.name as string } : null,
    });
  });
}

export async function getAdminDashboardStats() {
  await connectToDatabase();

  const [productCount, categoryCount, orderCount, userCount, featuredCount, lowStockCount] =
    await Promise.all([
      Product.countDocuments({}),
      Category.countDocuments({}),
      Order.countDocuments({}),
      User.countDocuments({}),
      Product.countDocuments({ isFeatured: true, isActive: true }),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
    ]);

  return {
    productCount,
    categoryCount,
    orderCount,
    userCount,
    featuredCount,
    lowStockCount,
  };
}
