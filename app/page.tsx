import TaskManager from "@/components/TaskManager";
import { getTasks } from "@/lib/tasks";

export default async function HomePage() {
  const initialTasks = await getTasks();

  return <TaskManager initialTasks={initialTasks} />;
}
