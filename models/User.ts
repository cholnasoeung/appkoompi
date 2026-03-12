import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserAddress {
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string | null;
  role: "customer" | "admin";
  phone?: string | null;
  avatar?: string | null;
  image?: string | null;
  githubId?: string | null;
  addresses: IUserAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IUserAddress>(
  {
    label: {
      type: String,
      required: [true, "Address label is required"],
      trim: true,
      maxlength: [40, "Address label must be less than 40 characters"],
    },
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
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name must be less than 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      index: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
      maxlength: [30, "Phone must be less than 30 characters"],
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
    image: {
      type: String,
      default: null,
      trim: true,
    },
    githubId: {
      type: String,
      default: null,
      index: true,
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("validate", function syncAvatarAndImage() {
  if (!this.avatar && this.image) {
    this.avatar = this.image;
  }

  if (!this.image && this.avatar) {
    this.image = this.avatar;
  }

  const defaultAddresses = this.addresses.filter((address) => address.isDefault);

  if (defaultAddresses.length > 1) {
    throw new Error("Only one address can be marked as default.");
  }
});

const existingUserModel = mongoose.models.User as Model<IUser> | undefined;
const shouldRecompileUserModel =
  process.env.NODE_ENV !== "production" ||
  (existingUserModel &&
    (!existingUserModel.schema.path("passwordHash") ||
      !existingUserModel.schema.path("role") ||
      !existingUserModel.schema.path("addresses")));

if (shouldRecompileUserModel && mongoose.models.User) {
  delete mongoose.models.User;
}

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
