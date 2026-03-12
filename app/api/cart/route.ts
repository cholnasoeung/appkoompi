import mongoose from "mongoose";
import { auth } from "@/auth";
import { getDatabaseConfigurationError } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

type CartRequestBody = {
  productId?: string;
  quantity?: number;
  size?: string | null;
  color?: string | null;
};

function unauthorizedResponse() {
  return Response.json({ message: "Unauthorized" }, { status: 401 });
}

function invalidProductResponse() {
  return Response.json({ message: "Invalid product id." }, { status: 400 });
}

async function getUserId() {
  const session = await auth();

  if (!session?.user?.id || !mongoose.Types.ObjectId.isValid(session.user.id)) {
    return null;
  }

  return new mongoose.Types.ObjectId(session.user.id);
}

function normalizeOption(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function GET() {
  try {
    const configurationError = getDatabaseConfigurationError();

    if (configurationError) {
      return Response.json({ message: configurationError }, { status: 503 });
    }

    const userId = await getUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    await connectToDatabase();

    const cart = await Cart.findOne({ userId }).lean();

    return Response.json({
      cart: cart
        ? {
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
            })),
          }
        : {
            _id: null,
            totalItems: 0,
            items: [],
          },
    });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to load cart.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const configurationError = getDatabaseConfigurationError();

    if (configurationError) {
      return Response.json({ message: configurationError }, { status: 503 });
    }

    const userId = await getUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const body = (await request.json()) as CartRequestBody;
    const productId =
      typeof body.productId === "string" ? body.productId.trim() : "";
    const quantity =
      typeof body.quantity === "number" && body.quantity > 0 ? body.quantity : 1;
    const size = normalizeOption(body.size);
    const color = normalizeOption(body.color);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return invalidProductResponse();
    }

    await connectToDatabase();

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return Response.json({ message: "Product not found." }, { status: 404 });
    }

    if (product.sizes.length > 0 && !size) {
      return Response.json(
        { message: "Please select a size." },
        { status: 400 }
      );
    }

    if (product.colors.length > 0 && !color) {
      return Response.json(
        { message: "Please select a color." },
        { status: 400 }
      );
    }

    if (size && !product.sizes.includes(size)) {
      return Response.json({ message: "Invalid size." }, { status: 400 });
    }

    if (color && !product.colors.includes(color)) {
      return Response.json({ message: "Invalid color." }, { status: 400 });
    }

    if (product.stock < quantity) {
      return Response.json(
        { message: "Not enough stock available." },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId });
    const activePrice = product.discountPrice ?? product.price;
    const primaryImage =
      product.images.find((image) => image.isPrimary) ?? product.images[0];

    if (!cart) {
      const newCart = await Cart.create({
        userId,
        sessionId: null,
        items: [
          {
            productId: product._id,
            slug: product.slug,
            nameSnapshot: product.name,
            priceSnapshot: activePrice,
            imageSnapshot: primaryImage?.url ?? null,
            quantity,
            variant: [size, color].filter(Boolean).join(" / ") || null,
            size,
            color,
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
      (item) =>
        item.productId.toString() === product._id.toString() &&
        (item.size ?? null) === size &&
        (item.color ?? null) === color
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
      existingItem.variant = [size, color].filter(Boolean).join(" / ") || null;
    } else {
      cart.items.push({
        productId: product._id,
        slug: product.slug,
        nameSnapshot: product.name,
        priceSnapshot: activePrice,
        imageSnapshot: primaryImage?.url ?? null,
        quantity,
        variant: [size, color].filter(Boolean).join(" / ") || null,
        size,
        color,
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

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    await connectToDatabase();

    const body = (await request.json()) as CartRequestBody;
    const productId =
      typeof body.productId === "string" ? body.productId.trim() : "";
    const quantity =
      typeof body.quantity === "number" && body.quantity >= 0 ? body.quantity : 0;
    const size = normalizeOption(body.size);
    const color = normalizeOption(body.color);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return invalidProductResponse();
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return Response.json({ message: "Cart not found." }, { status: 404 });
    }

    const item = cart.items.find(
      (cartItem) =>
        cartItem.productId.toString() === productId &&
        (cartItem.size ?? null) === size &&
        (cartItem.color ?? null) === color
    );

    if (!item) {
      return Response.json({ message: "Cart item not found." }, { status: 404 });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (cartItem) =>
          !(
            cartItem.productId.toString() === productId &&
            (cartItem.size ?? null) === size &&
            (cartItem.color ?? null) === color
          )
      );
    } else {
      item.quantity = quantity;
      item.subtotal = item.priceSnapshot * quantity;
    }

    cart.totalItems = cart.items.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    await cart.save();

    return Response.json({ message: "Cart updated.", totalItems: cart.totalItems });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to update cart item.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    await connectToDatabase();

    const body = (await request.json()) as CartRequestBody;
    const productId =
      typeof body.productId === "string" ? body.productId.trim() : "";
    const size = normalizeOption(body.size);
    const color = normalizeOption(body.color);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return invalidProductResponse();
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return Response.json({ message: "Cart not found." }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          (item.size ?? null) === size &&
          (item.color ?? null) === color
        )
    );
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    await cart.save();

    return Response.json({ message: "Item removed.", totalItems: cart.totalItems });
  } catch (error) {
    return Response.json(
      {
        message: "Failed to remove cart item.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
