import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IOrderAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrderItem {
  productId: Types.ObjectId;
  slug: string;
  nameSnapshot: string;
  priceSnapshot: number;
  imageSnapshot?: string | null;
  quantity: number;
  variant?: string | null;
  size?: string | null;
  color?: string | null;
}

export interface IOrderPricing {
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export interface IOrderPayment {
  method: string;
  status: "pending" | "paid" | "failed" | "refunded";
  transactionId?: string | null;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  billingAddress: IOrderAddress;
  pricing: IOrderPricing;
  payment: IOrderPayment;
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  notes?: string | null;
  placedAt: Date;
  paidAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name must be less than 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      maxlength: [30, "Phone must be less than 30 characters"],
    },
    street: {
      type: String,
      required: [true, "Street is required"],
      trim: true,
      maxlength: [160, "Street must be less than 160 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [80, "City must be less than 80 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [80, "State must be less than 80 characters"],
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
      maxlength: [20, "Postal code must be less than 20 characters"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: [80, "Country must be less than 80 characters"],
    },
  },
  {
    _id: false,
  }
);

const OrderItemSchema = new Schema<IOrderItem>(
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
  },
  {
    _id: false,
  }
);

const OrderPricingSchema = new Schema<IOrderPricing>(
  {
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, "Tax amount cannot be negative"],
    },
    shippingAmount: {
      type: Number,
      default: 0,
      min: [0, "Shipping amount cannot be negative"],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
  },
  {
    _id: false,
  }
);

const OrderPaymentSchema = new Schema<IOrderPayment>(
  {
    method: {
      type: String,
      required: [true, "Payment method is required"],
      trim: true,
      maxlength: [40, "Payment method must be less than 40 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    items: {
      type: [OrderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: (value: IOrderItem[]) => value.length > 0,
        message: "An order must contain at least one item.",
      },
    },
    shippingAddress: {
      type: OrderAddressSchema,
      required: [true, "Shipping address is required"],
    },
    billingAddress: {
      type: OrderAddressSchema,
      required: [true, "Billing address is required"],
    },
    pricing: {
      type: OrderPricingSchema,
      required: [true, "Pricing is required"],
    },
    payment: {
      type: OrderPaymentSchema,
      required: [true, "Payment is required"],
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: [1000, "Notes must be less than 1000 characters"],
    },
    placedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    shippedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.pre("validate", function validateOrder() {
  if (this.pricing.totalAmount < 0) {
    throw new Error("Total amount cannot be negative.");
  }

  if (
    this.payment.status === "paid" &&
    !this.paidAt
  ) {
    this.paidAt = new Date();
  }
});

OrderSchema.index({ userId: 1, placedAt: -1 });
OrderSchema.index({ orderStatus: 1, placedAt: -1 });

const existingOrderModel = mongoose.models.Order as Model<IOrder> | undefined;
const shouldRecompileOrderModel =
  process.env.NODE_ENV !== "production" ||
  (existingOrderModel &&
    (!existingOrderModel.schema.path("orderNumber") ||
      !existingOrderModel.schema.path("pricing") ||
      !existingOrderModel.schema.path("payment")));

if (shouldRecompileOrderModel && mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
