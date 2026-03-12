import mongoose from "mongoose";
import { auth } from "@/auth";
import { getDatabaseConfigurationError } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

type CartRequestBody = {
  productId?: string;
  quantity?: number;
  sessionId?: string;
};

function buildCartOwner(sessionUserId: string | undefined, sessionId: string | undefined) {
  if (sessionUserId && mongoose.Types.ObjectId.isValid(sessionUserId)) {
    return {
      query: { userId: new mongoose.Types.ObjectId(sessionUserId) },
      userId: new mongoose.Types.ObjectId(sessionUserId),
      sessionId: null,
    };
  }

  if (sessionId && sessionId.trim()) {
    return {
      query: { sessionId: sessionId.trim() },
      userId: null,
      sessionId: sessionId.trim(),
    };
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const configurationError = getDatabaseConfigurationError();

    if (configurationError) {
      return Response.json({ message: configurationError }, { status: 503 });
    }

    const session = await auth();
    const body = (await request.json()) as CartRequestBody;
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const quantity = typeof body.quantity === "number" && body.quantity > 0 ? body.quantity : 1;
    const owner = buildCartOwner(session?.user?.id, body.sessionId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return Response.json({ message: "Invalid product id." }, { status: 400 });
    }

    if (!owner) {
      return Response.json(
        { message: "A signed-in user or guest session is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return Response.json({ message: "Product not found." }, { status: 404 });
    }

    if (product.stock < quantity) {
      return Response.json(
        { message: "Not enough stock available." },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne(owner.query);
    const activePrice = product.discountPrice ?? product.price;
    const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

    if (!cart) {
      const newCart = await Cart.create({
        userId: owner.userId,
        sessionId: owner.sessionId,
        items: [
          {
            productId: product._id,
            slug: product.slug,
            nameSnapshot: product.name,
            priceSnapshot: activePrice,
            imageSnapshot: primaryImage?.url ?? null,
            quantity,
            variant: null,
            size: null,
            color: null,
            subtotal: activePrice * quantity,
          },
        ],
        totalItems: quantity,
      });

      return Response.json(
        {
          message: "Added to cart.",
          cart: {
            _id: newCart._id.toString(),
            totalItems: newCart.totalItems,
          },
        },
        { status: 201 }
      );
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === product._id.toString()
    );

    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;

      if (product.stock < nextQuantity) {
        return Response.json(
          { message: "Not enough stock available." },
          { status: 400 }
        );
      }

      existingItem.quantity = nextQuantity;
      existingItem.priceSnapshot = activePrice;
      existingItem.subtotal = activePrice * nextQuantity;
    } else {
      cart.items.push({
        productId: product._id,
        slug: product.slug,
        nameSnapshot: product.name,
        priceSnapshot: activePrice,
        imageSnapshot: primaryImage?.url ?? null,
        quantity,
        variant: null,
        size: null,
        color: null,
        subtotal: activePrice * quantity,
      });
    }

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    await cart.save();

    return Response.json({
      message: "Added to cart.",
      cart: {
        _id: cart._id.toString(),
        totalItems: cart.totalItems,
      },
    });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to update cart.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
