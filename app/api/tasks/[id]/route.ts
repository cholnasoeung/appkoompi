import { auth } from "@/auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";

type TaskPriority = "low" | "medium" | "high";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function invalidIdResponse() {
  return NextResponse.json({ message: "Invalid task id" }, { status: 400 });
}

async function findTaskForUser(id: string, userId: string) {
  const ownedTask = await Task.findOne({ _id: id, userId });

  if (ownedTask) {
    return ownedTask;
  }

  const legacyTask = await Task.findOne({
    _id: id,
    $or: [{ userId: { $exists: false } }, { userId: null }, { userId: "" }],
  });

  if (!legacyTask) {
    return null;
  }

  legacyTask.userId = userId;
  await legacyTask.save();
  return legacyTask;
}

function serializeTask(task: {
  _id: { toString(): string };
  title: string;
  completed: boolean;
  priority: TaskPriority;
  createdAt: Date | string;
  updatedAt: Date | string;
}) {
  return {
    _id: task._id.toString(),
    title: task.title,
    completed: task.completed,
    priority: task.priority,
    createdAt:
      task.createdAt instanceof Date
        ? task.createdAt.toISOString()
        : task.createdAt,
    updatedAt:
      task.updatedAt instanceof Date
        ? task.updatedAt.toISOString()
        : task.updatedAt,
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidIdResponse();
    }

    await connectToDatabase();

    const body = await request.json();

    const updateData: {
      title?: string;
      completed?: boolean;
      priority?: TaskPriority;
    } = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();

      if (title.length < 3) {
        return NextResponse.json(
          { message: "Title must be at least 3 characters" },
          { status: 400 }
        );
      }

      updateData.title = title;
    }

    if (typeof body.completed === "boolean") {
      updateData.completed = body.completed;
    }

    if (
      typeof body.priority === "string" &&
      ["low", "medium", "high"].includes(body.priority)
    ) {
      updateData.priority = body.priority as TaskPriority;
    }

    const existingTask = await findTaskForUser(id, session.user.id);

    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    existingTask.set(updateData);
    await existingTask.save();

    return NextResponse.json(
      {
        message: "Task updated successfully",
        task: serializeTask(existingTask),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update task",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidIdResponse();
    }

    await connectToDatabase();

    const existingTask = await findTaskForUser(id, session.user.id);

    if (!existingTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    await existingTask.deleteOne();

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete task",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
