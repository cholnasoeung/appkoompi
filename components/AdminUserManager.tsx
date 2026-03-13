"use client";

import { useState, useTransition } from "react";
import type { AdminUserSummary } from "@/lib/admin";

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default function AdminUserManager({
  initialUsers,
}: {
  initialUsers: AdminUserSummary[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateUser(userId: string, payload: { role?: "customer" | "admin"; phone?: string | null }) {
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : "Unable to update user."
        );
        return;
      }

      const updatedUser =
        data && "user" in data && data.user ? (data.user as AdminUserSummary) : null;

      if (!updatedUser) {
        setError("User updated, but the response was invalid.");
        return;
      }

      setUsers((current) =>
        current.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );
      setFeedback("User updated.");
    });
  }

  function deleteUser(userId: string) {
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : "Unable to delete user."
        );
        return;
      }

      setUsers((current) => current.filter((user) => user._id !== userId));
      setFeedback("User deleted.");
    });
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            User Management
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
            Manage users
          </h2>
        </div>
        <p className="text-sm text-slate-500">{users.length} users</p>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {feedback ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {users.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
            No users found.
          </div>
        ) : (
          users.map((user) => (
            <article
              key={user._id}
              className="rounded-[1.6rem] border border-slate-200 p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-1">
                  <p className="text-lg font-bold text-slate-950">{user.name}</p>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <p className="text-sm text-slate-500">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:w-[30rem]">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Role
                    </p>
                    <select
                      value={user.role}
                      disabled={isPending}
                      onChange={(event) =>
                        updateUser(user._id, {
                          role: event.target.value as "customer" | "admin",
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Phone
                    </p>
                    <input
                      defaultValue={user.phone ?? ""}
                      disabled={isPending}
                      onBlur={(event) =>
                        updateUser(user._id, {
                          phone: event.target.value,
                        })
                      }
                      placeholder="No phone"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none"
                    />
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Addresses
                    </p>
                    <p className="mt-3 text-lg font-bold text-slate-950">
                      {user.addressCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => deleteUser(user._id)}
                  className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  Delete user
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
