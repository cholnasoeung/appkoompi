import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { getAppConfigurationError } from "@/lib/env";
import Task from "@/models/Task";
import { getTasks, serializeTask, TaskPriority } from "@/lib/tasks";

export async function GET() {
  try {
    const configurationError = getAppConfigurationError();

    if (configurationError) {
      return Response.json({ message: configurationError }, { status: 503 });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tasks = await getTasks(session.user.id);
    return Response.json(tasks, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Failed to fetch tasks", error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const configurationError = getAppConfigurationError();

    if (configurationError) {
      return Response.json({ message: configurationError }, { status: 503 });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const priority = body.priority as TaskPriority | undefined;

    if (title.length < 3) {
      return Response.json(
        { message: "Title must be at least 3 characters" },
        { status: 400 }
      );
    }

    const newTask = await Task.create({
      userId: session.user.id,
      title,
      completed: body.completed ?? false,
      priority: priority ?? "medium",
    });

    return Response.json(
      {
        message: "Task created successfully",
        task: serializeTask(newTask),
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { message: "Failed to create task", error },
      { status: 500 }
    );
  }
}
