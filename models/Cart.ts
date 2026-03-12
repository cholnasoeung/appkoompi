import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  slug: string;
  nameSnapshot: string;
  priceSnapshot: number;
  imageSnapshot?: string | null;
  quantity: number;
  variant?: string | null;
  size?: string | null;
  color?: string | null;
  subtotal: number;
}

export interface ICart extends Document {
  userId?: Types.ObjectId | null;
  sessionId?: string | null;
  items: ICartItem[];
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      lowercase: true,
    },
    nameSnapshot: {
      type: String,
      required: [true, "Name snapshot is required"],
      trim: true,
      maxlength: [140, "Name snapshot must be less than 140 characters"],
    },
    priceSnapshot: {
      type: Number,
      required: [true, "Price snapshot is required"],
      min: [0, "Price snapshot cannot be negative"],
    },
    imageSnapshot: {
      type: String,
      default: null,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    variant: {
      type: String,
      default: null,
      trim: true,
    },
    size: {
      type: String,
      default: null,
      trim: true,
    },
    color: {
      type: String,
      default: null,
      trim: true,
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
  },
  {
    _id: false,
  }
);

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    totalItems: {
      type: Number,
      default: 0,
      min: [0, "Total items cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

CartSchema.pre("validate", function validateCart() {
  if (!this.userId && !this.sessionId) {
    throw new Error("A cart must belong to a user or a guest session.");
  }
});

CartSchema.index({ userId: 1, updatedAt: -1 });
CartSchema.index({ sessionId: 1, updatedAt: -1 });

const existingCartModel = mongoose.models.Cart as Model<ICart> | undefined;
const shouldRecompileCartModel =
  process.env.NODE_ENV !== "production" ||
  (existingCartModel &&
    (!existingCartModel.schema.path("items") ||
      !existingCartModel.schema.path("sessionId")));

if (shouldRecompileCartModel && mongoose.models.Cart) {
  delete mongoose.models.Cart;
}

const Cart: Model<ICart> =
  (mongoose.models.Cart as Model<ICart>) ||
  mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
