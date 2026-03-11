// import mongoose from "mongoose";
// import { connectToDatabase } from "@/lib/mongodb";
// import Task from "@/models/Task";
// import { serializeTask, TaskPriority } from "@/lib/tasks";

// type RouteContext = {
//   params: Promise<{ id: string }>;
// };

// function invalidIdResponse() {
//   return Response.json({ message: "Invalid task id" }, { status: 400 });
// }

// export async function PATCH(request: Request, context: RouteContext) {
//   const { id } = await context.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return invalidIdResponse();
//   }

//   try {
//     await connectToDatabase();

//     const body = await request.json();
//     const updateData: {
//       title?: string;
//       completed?: boolean;
//       priority?: TaskPriority;
//     } = {};

//     if (typeof body.title === "string") {
//       const title = body.title.trim();

//       if (title.length < 3) {
//         return Response.json(
//           { message: "Title must be at least 3 characters" },
//           { status: 400 }
//         );
//       }

//       updateData.title = title;
//     }

//     if (typeof body.completed === "boolean") {
//       updateData.completed = body.completed;
//     }

//     if (["low", "medium", "high"].includes(body.priority)) {
//       updateData.priority = body.priority as TaskPriority;
//     }

//     const task = await Task.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!task) {
//       return Response.json({ message: "Task not found" }, { status: 404 });
//     }

//     return Response.json(
//       {
//         message: "Task updated successfully",
//         task: serializeTask(task),
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     return Response.json(
//       { message: "Failed to update task", error },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(_request: Request, context: RouteContext) {
//   const { id } = await context.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return invalidIdResponse();
//   }

//   try {
//     await connectToDatabase();

//     const deletedTask = await Task.findByIdAndDelete(id);

//     if (!deletedTask) {
//       return Response.json({ message: "Task not found" }, { status: 404 });
//     }

//     return Response.json(
//       { message: "Task deleted successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     return Response.json(
//       { message: "Failed to delete task", error },
//       { status: 500 }
//     );
//   }
// }



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

function serializeTask(task: any) {
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

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Task updated successfully",
        task: serializeTask(task),
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
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidIdResponse();
    }

    await connectToDatabase();

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

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