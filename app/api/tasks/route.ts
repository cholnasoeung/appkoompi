import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";
import { getTasks, serializeTask, TaskPriority } from "@/lib/tasks";

export async function GET() {
  try {
    const tasks = await getTasks();
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
