import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentCategoryId?: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [80, "Category name must be less than 80 characters"],
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    image: {
      type: String,
      default: null,
      trim: true,
    },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ parentCategoryId: 1, isActive: 1 });

const existingCategoryModel =
  mongoose.models.Category as Model<ICategory> | undefined;
const shouldRecompileCategoryModel =
  process.env.NODE_ENV !== "production" ||
  (existingCategoryModel &&
    (!existingCategoryModel.schema.path("slug") ||
      !existingCategoryModel.schema.path("parentCategoryId")));

if (shouldRecompileCategoryModel && mongoose.models.Category) {
  delete mongoose.models.Category;
}

const Category: Model<ICategory> =
  (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
