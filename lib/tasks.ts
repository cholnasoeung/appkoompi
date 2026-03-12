import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";

export type TaskPriority = "low" | "medium" | "high";

export type TaskItem = {
  _id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
};

export function serializeTask(task: {
  _id: { toString(): string };
  title: string;
  completed: boolean;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}): TaskItem {
  return {
    _id: task._id.toString(),
    title: task.title,
    completed: task.completed,
    priority: task.priority,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function getTasks(userId: string) {
  await connectToDatabase();

  let tasks = await Task.find({ userId }).sort({ createdAt: -1 }).lean();

  // Claim legacy tasks created before ownership was added so existing data
  // remains editable after auth is enabled.
  if (tasks.length === 0) {
    const legacyTasks = await Task.find({
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: "" },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (legacyTasks.length > 0) {
      await Task.updateMany(
        {
          _id: { $in: legacyTasks.map((task) => task._id) },
        },
        {
          $set: { userId },
        }
      );

      tasks = await Task.find({ userId }).sort({ createdAt: -1 }).lean();
    }
  }

  return tasks.map((task) =>
    serializeTask({
      ...task,
      _id: task._id,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    })
  );
}
