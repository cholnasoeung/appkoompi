import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  userId: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must be less than 100 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ userId: 1, createdAt: -1 });

const existingTaskModel = mongoose.models.Task as Model<ITask> | undefined;

if (existingTaskModel && !existingTaskModel.schema.path("userId")) {
  delete mongoose.models.Task;
}

const Task: Model<ITask> =
  (mongoose.models.Task as Model<ITask>) ||
  mongoose.model<ITask>("Task", TaskSchema);

export default Task;
