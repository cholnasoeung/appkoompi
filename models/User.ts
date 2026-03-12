import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string | null;
  passwordHash?: string | null;
  githubId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
    },
    image: {
      type: String,
      default: null,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    githubId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const existingUserModel = mongoose.models.User as Model<IUser> | undefined;

if (existingUserModel && !existingUserModel.schema.path("passwordHash")) {
  delete mongoose.models.User;
}

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
