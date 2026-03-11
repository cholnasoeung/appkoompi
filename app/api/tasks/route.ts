import { connectToDatabase } from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET() {
  try {
    await connectToDatabase();

    const tasks = await Task.find().sort({ createdAt: -1 });

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

    const newTask = await Task.create({
      title: body.title,
      completed: body.completed ?? false,
      priority: body.priority ?? "medium",
    });

    return Response.json(
      {
        message: "Task created successfully",
        task: newTask,
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