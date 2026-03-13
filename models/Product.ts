import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IProductImage {
  url: string;
  alt?: string | null;
  isPrimary: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  discountPrice?: number | null;
  categoryId: Types.ObjectId;
  brand?: string | null;
  images: IProductImage[];
  stock: number;
  sku: string;
  ratingAverage: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  attributes: Map<string, string[]>;
  sizes: string[];
  colors: string[];
  targetGender: "men" | "women" | "unisex";
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    alt: {
      type: String,
      default: null,
      trim: true,
      maxlength: [160, "Image alt text must be less than 160 characters"],
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [140, "Product name must be less than 140 characters"],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    shortDescription: {
      type: String,
      default: null,
      trim: true,
      maxlength: [240, "Short description must be less than 240 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, "Discount price cannot be negative"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    brand: {
      type: String,
      default: null,
      trim: true,
      maxlength: [80, "Brand must be less than 80 characters"],
    },
    images: {
      type: [ProductImageSchema],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating average cannot be negative"],
      max: [5, "Rating average cannot be greater than 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    attributes: {
      type: Map,
      of: [String],
      default: {},
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    targetGender: {
      type: String,
      enum: ["men", "women", "unisex"],
      default: "unisex",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.pre("validate", function validateProduct() {
  if (
    this.discountPrice !== null &&
    this.discountPrice !== undefined &&
    this.discountPrice > this.price
  ) {
    throw new Error("Discount price cannot be greater than price.");
  }

  const primaryImages = this.images.filter((image) => image.isPrimary);

  if (primaryImages.length > 1) {
    throw new Error("Only one product image can be primary.");
  }
});

ProductSchema.index({ categoryId: 1, isActive: 1, createdAt: -1 });
ProductSchema.index({ name: "text", description: "text", shortDescription: "text" });

const existingProductModel = mongoose.models.Product as Model<IProduct> | undefined;
const shouldRecompileProductModel =
  process.env.NODE_ENV !== "production" ||
  (existingProductModel &&
    (!existingProductModel.schema.path("slug") ||
      !existingProductModel.schema.path("sku") ||
      !existingProductModel.schema.path("categoryId") ||
      !existingProductModel.schema.path("targetGender")));

if (shouldRecompileProductModel && mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
