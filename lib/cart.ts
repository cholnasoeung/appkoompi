import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Cart from "@/models/Cart";

export type CartLine = {
  productId: string;
  slug: string;
  nameSnapshot: string;
  priceSnapshot: number;
  imageSnapshot: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
  subtotal: number;
};

export async function getCurrentUserCart() {
  const session = await auth();

  if (!session?.user?.id || !mongoose.Types.ObjectId.isValid(session.user.id)) {
    return null;
  }

  await connectToDatabase();

  const cart = await Cart.findOne({
    userId: new mongoose.Types.ObjectId(session.user.id),
  }).lean();

  if (!cart) {
    return null;
  }

  return {
    _id: cart._id.toString(),
    totalItems: cart.totalItems,
    items: cart.items.map((item) => ({
      productId: item.productId.toString(),
      slug: item.slug,
      nameSnapshot: item.nameSnapshot,
      priceSnapshot: item.priceSnapshot,
      imageSnapshot: item.imageSnapshot ?? null,
      quantity: item.quantity,
      size: item.size ?? null,
      color: item.color ?? null,
      subtotal: item.subtotal,
    })) satisfies CartLine[],
  };
}

export async function getCurrentUserCartCount() {
  const cart = await getCurrentUserCart();
  return cart?.totalItems ?? 0;
}
