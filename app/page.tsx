import TaskManager from "@/components/TaskManager";
import { getTasks, type TaskItem } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let initialTasks: TaskItem[] = [];
  let initialError: string | undefined;

  try {
    initialTasks = await getTasks();
  } catch (error) {
    initialError =
      error instanceof Error
        ? error.message
        : "Unable to load tasks from MongoDB.";
  }

  return <TaskManager initialTasks={initialTasks} initialError={initialError} />;
}
