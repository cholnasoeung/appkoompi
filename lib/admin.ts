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
  images: Array<{
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategorySummary = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type AdminOrderSummary = {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  totalAmount: number;
  itemCount: number;
  placedAt: string;
};

export type AdminUserSummary = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone: string | null;
  addressCount: number;
  createdAt: string;
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
  images?: Array<{ url: string; alt?: string | null; isPrimary?: boolean }>;
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
    imageUrl:
      product.images?.find((image) => image.isPrimary)?.url ??
      product.images?.[0]?.url ??
      null,
    images:
      product.images?.map((image) => ({
        url: image.url,
        alt: image.alt ?? null,
        isPrimary: Boolean(image.isPrimary),
      })) ?? [],
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

export async function getAdminOrders(): Promise<AdminOrderSummary[]> {
  await connectToDatabase();

  const orders = await Order.find({})
    .populate("userId", "name email")
    .sort({ placedAt: -1 })
    .lean();

  return orders.map((order) => {
    const user =
      order.userId && typeof order.userId === "object" && "email" in order.userId
        ? (order.userId as { name?: string; email?: string })
        : null;

    return {
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerName: (user?.name as string | undefined) ?? "Customer",
      customerEmail: (user?.email as string | undefined) ?? "",
      orderStatus: order.orderStatus,
      paymentStatus: order.payment.status,
      paymentMethod: order.payment.method,
      totalAmount: order.pricing.totalAmount,
      itemCount: order.items.length,
      placedAt:
        order.placedAt instanceof Date
          ? order.placedAt.toISOString()
          : new Date(order.placedAt).toISOString(),
    } satisfies AdminOrderSummary;
  });
}

export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  await connectToDatabase();

  const users = await User.find({}).sort({ createdAt: -1 }).lean();

  return users.map((user) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? null,
    addressCount: Array.isArray(user.addresses) ? user.addresses.length : 0,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : new Date(user.createdAt).toISOString(),
  }));
}
