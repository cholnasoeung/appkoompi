import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISlide extends Document {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  badge?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SlideSchema = new Schema<ISlide>(
  {
    title: {
      type: String,
      required: [true, "Slide title is required"],
      trim: true,
      maxlength: [140, "Slide title must be less than 140 characters"],
    },
    subtitle: {
      type: String,
      default: null,
      trim: true,
      maxlength: [120, "Slide subtitle must be less than 120 characters"],
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: [320, "Slide description must be less than 320 characters"],
    },
    imageUrl: {
      type: String,
      required: [true, "Slide image is required"],
      trim: true,
    },
    ctaLabel: {
      type: String,
      default: null,
      trim: true,
      maxlength: [60, "CTA label must be less than 60 characters"],
    },
    ctaHref: {
      type: String,
      default: null,
      trim: true,
    },
    badge: {
      type: String,
      default: null,
      trim: true,
      maxlength: [60, "Badge must be less than 60 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const existingSlideModel = mongoose.models.Slide as Model<ISlide> | undefined;
const shouldRecompileSlideModel =
  process.env.NODE_ENV !== "production" ||
  (existingSlideModel &&
    (!existingSlideModel.schema.path("imageUrl") ||
      !existingSlideModel.schema.path("sortOrder")));

if (shouldRecompileSlideModel && mongoose.models.Slide) {
  delete mongoose.models.Slide;
}

const Slide: Model<ISlide> =
  (mongoose.models.Slide as Model<ISlide>) ||
  mongoose.model<ISlide>("Slide", SlideSchema);

export default Slide;
