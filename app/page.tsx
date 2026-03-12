import { auth } from "@/auth";
import TaskManager from "@/components/TaskManager";
import { getTasks, type TaskItem } from "@/lib/tasks";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let initialTasks: TaskItem[] = [];
  let initialError: string | undefined;

  try {
    initialTasks = await getTasks(session.user.id);
  } catch (error) {
    initialError =
      error instanceof Error
        ? error.message
        : "Unable to load tasks from MongoDB.";
  }

  return <TaskManager initialTasks={initialTasks} initialError={initialError} />;
}
