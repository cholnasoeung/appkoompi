import TaskManager from "@/components/TaskManager";
import { getTasks } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialTasks = await getTasks();

  return <TaskManager initialTasks={initialTasks} />;
}
