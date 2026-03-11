import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import { serializeTask, TaskPriority } from "@/lib/tasks";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function invalidIdResponse() {
  return Response.json({ message: "Invalid task id" }, { status: 400 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  try {
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
        return Response.json(
          { message: "Title must be at least 3 characters" },
          { status: 400 }
        );
      }

      updateData.title = title;
    }

    if (typeof body.completed === "boolean") {
      updateData.completed = body.completed;
    }

    if (["low", "medium", "high"].includes(body.priority)) {
      updateData.priority = body.priority as TaskPriority;
    }

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return Response.json({ message: "Task not found" }, { status: 404 });
    }

    return Response.json(
      {
        message: "Task updated successfully",
        task: serializeTask(task),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: "Failed to update task", error },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  try {
    await connectToDatabase();

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return Response.json({ message: "Task not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: "Failed to delete task", error },
      { status: 500 }
    );
  }
}
