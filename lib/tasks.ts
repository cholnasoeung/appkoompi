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

export async function getTasks() {
  await connectToDatabase();

  const tasks = await Task.find().sort({ createdAt: -1 }).lean();

  return tasks.map((task) =>
    serializeTask({
      ...task,
      _id: task._id,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    })
  );
}
