"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import type { TaskItem, TaskPriority } from "@/lib/tasks";

type Filter = "all" | "active" | "completed";

type TaskManagerProps = {
  initialTasks: TaskItem[];
  initialError?: string | null;
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-sm",
  medium: "border-amber-200/80 bg-amber-50 text-amber-700 shadow-sm",
  high: "border-rose-200/80 bg-rose-50 text-rose-700 shadow-sm",
};

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function sortTasks(tasks: TaskItem[]) {
  return [...tasks].sort((first, second) => {
    if (first.completed !== second.completed) {
      return Number(first.completed) - Number(second.completed);
    }

    return priorityOrder[first.priority] - priorityOrder[second.priority];
  });
}

export default function TaskManager({
  initialTasks,
  initialError = null,
}: TaskManagerProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(sortTasks(initialTasks));
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingPriority, setEditingPriority] = useState<TaskPriority>("medium");
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === "active") {
        return !task.completed;
      }

      if (filter === "completed") {
        return task.completed;
      }

      return true;
    });
  }, [filter, tasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;

    return {
      total: tasks.length,
      completed,
      active: tasks.length - completed,
      highPriority: tasks.filter((task) => task.priority === "high").length,
    };
  }, [tasks]);

  async function parseResponse(response: Response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? "Request failed");
    }

    return data;
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 3) {
      setError("Task title must be at least 3 characters.");
      return;
    }

    setError(null);

    const optimisticTask: TaskItem = {
      _id: `temp-${Date.now()}`,
      title: trimmedTitle,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const previousTasks = tasks;
    setTasks((currentTasks) => sortTasks([optimisticTask, ...currentTasks]));
    setTitle("");
    setPriority("medium");

    startTransition(async () => {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: trimmedTitle,
            priority: optimisticTask.priority,
          }),
        });

        const data = await parseResponse(response);

        setTasks((currentTasks) =>
          sortTasks(
            currentTasks.map((task) =>
              task._id === optimisticTask._id ? data.task : task
            )
          )
        );
      } catch (requestError) {
        setTasks(previousTasks);
        setTitle(trimmedTitle);
        setPriority(optimisticTask.priority);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to create task."
        );
      }
    });
  }

  function handleStartEdit(task: TaskItem) {
    setEditingId(task._id);
    setEditingTitle(task.title);
    setEditingPriority(task.priority);
    setError(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditingTitle("");
    setEditingPriority("medium");
  }

  function handleToggleComplete(task: TaskItem) {
    const previousTasks = tasks;
    const optimisticTask = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date().toISOString(),
    };

    setError(null);
    setTasks((currentTasks) =>
      sortTasks(
        currentTasks.map((item) =>
          item._id === task._id ? optimisticTask : item
        )
      )
    );

    startTransition(async () => {
      try {
        const response = await fetch(`/api/tasks/${task._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: optimisticTask.completed,
          }),
        });

        const data = await parseResponse(response);

        setTasks((currentTasks) =>
          sortTasks(
            currentTasks.map((item) =>
              item._id === task._id ? data.task : item
            )
          )
        );
      } catch (requestError) {
        setTasks(previousTasks);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to update task."
        );
      }
    });
  }

  function handleSaveEdit(task: TaskItem) {
    const trimmedTitle = editingTitle.trim();

    if (trimmedTitle.length < 3) {
      setError("Task title must be at least 3 characters.");
      return;
    }

    const previousTasks = tasks;
    const optimisticTask = {
      ...task,
      title: trimmedTitle,
      priority: editingPriority,
      updatedAt: new Date().toISOString(),
    };

    setError(null);
    setTasks((currentTasks) =>
      sortTasks(
        currentTasks.map((item) =>
          item._id === task._id ? optimisticTask : item
        )
      )
    );
    handleCancelEdit();

    startTransition(async () => {
      try {
        const response = await fetch(`/api/tasks/${task._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: trimmedTitle,
            priority: editingPriority,
          }),
        });

        const data = await parseResponse(response);

        setTasks((currentTasks) =>
          sortTasks(
            currentTasks.map((item) =>
              item._id === task._id ? data.task : item
            )
          )
        );
      } catch (requestError) {
        setTasks(previousTasks);
        setEditingId(task._id);
        setEditingTitle(trimmedTitle);
        setEditingPriority(editingPriority);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to update task."
        );
      }
    });
  }

  function handleDelete(task: TaskItem) {
    const previousTasks = tasks;

    setError(null);
    setTasks((currentTasks) =>
      currentTasks.filter((item) => item._id !== task._id)
    );

    startTransition(async () => {
      try {
        const response = await fetch(`/api/tasks/${task._id}`, {
          method: "DELETE",
        });

        await parseResponse(response);
      } catch (requestError) {
        setTasks(previousTasks);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to delete task."
        );
      }
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_45%,_#f8fafc_100%)] px-6 py-12 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8">
          <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/60 backdrop-blur-xl sm:p-10">
            <span className="inline-flex rounded-full border border-sky-200/80 bg-sky-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-sky-700 shadow-sm">
              Server + Client Data Flow
            </span>

            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
              Full CRUD task manager with Next.js, MongoDB, and Tailwind.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Initial tasks are rendered on the server, then form submissions and
              task updates run through `fetch` calls with optimistic UI for a
              faster experience on the client.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-lg shadow-slate-900/10">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Total
                </p>
                <p className="mt-3 text-4xl font-black">{stats.total}</p>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Active
                </p>
                <p className="mt-3 text-4xl font-black text-slate-950">
                  {stats.active}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Done
                </p>
                <p className="mt-3 text-4xl font-black text-slate-950">
                  {stats.completed}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  High
                </p>
                <p className="mt-3 text-4xl font-black text-slate-950">
                  {stats.highPriority}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleCreateTask}
              className="mt-8 rounded-[1.75rem] border border-slate-200/80 bg-white/70 p-5 shadow-inner shadow-slate-100 sm:p-6"
            >
              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <div>
                  <label
                    htmlFor="task-title"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Task title
                  </label>
                  <input
                    id="task-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Enter a task title"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="task-priority"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as TaskPriority)
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none transition duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Create Task"}
                </button>
                <p className="text-sm text-slate-500">
                  Controlled form inputs with client-side validation.
                </p>
              </div>
            </form>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
                {error}
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/60 backdrop-blur-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Task Board
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
                  Manage your work
                </h2>
              </div>

              <div className="rounded-full border border-slate-200 bg-slate-50/80 p-1 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {(["all", "active", "completed"] as Filter[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFilter(option)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition duration-200 ${
                        filter === option
                          ? "bg-slate-950 text-white shadow-md"
                          : "bg-transparent text-slate-700 hover:bg-white hover:text-slate-950"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {visibleTasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-14 text-center">
                  <p className="text-lg font-semibold text-slate-800">
                    No tasks in this view.
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Add a task above or switch filters.
                  </p>
                </div>
              ) : null}

              {visibleTasks.map((task) => {
                const isEditing = editingId === task._id;

                return (
                  <article
                    key={task._id}
                    className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(task)}
                            className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition duration-200 ${
                              task.completed
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                                : "border-slate-300 bg-white text-transparent hover:border-sky-500 hover:ring-4 hover:ring-sky-100"
                            }`}
                            aria-label={
                              task.completed
                                ? "Mark task as incomplete"
                                : "Mark task as complete"
                            }
                          >
                            •
                          </button>

                          <div>
                            {isEditing ? (
                              <div className="space-y-3">
                                <input
                                  value={editingTitle}
                                  onChange={(event) =>
                                    setEditingTitle(event.target.value)
                                  }
                                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none transition duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                />
                                <select
                                  value={editingPriority}
                                  onChange={(event) =>
                                    setEditingPriority(
                                      event.target.value as TaskPriority
                                    )
                                  }
                                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm outline-none transition duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>
                            ) : (
                              <>
                                <h3
                                  className={`text-lg font-semibold tracking-[-0.02em] ${
                                    task.completed
                                      ? "text-slate-400 line-through"
                                      : "text-slate-950"
                                  }`}
                                >
                                  {task.title}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                  Updated{" "}
                                  {new Date(task.updatedAt).toLocaleDateString()}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${priorityStyles[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(task)}
                              disabled={isPending}
                              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-950 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(task)}
                              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-slate-950 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(task)}
                              disabled={isPending}
                              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition duration-200 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 text-sm text-slate-600 shadow-inner">
              {isPending
                ? "Syncing optimistic changes with MongoDB..."
                : "All changes are synced with MongoDB."}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
