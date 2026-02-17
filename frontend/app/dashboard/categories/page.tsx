"use client";

import { useEffect, useState } from "react";
import { api, type Category } from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    api.categories
      .list()
      .then(setCategories)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError("");
    try {
      await api.categories.create({
        name: newName.trim(),
        color: newColor || undefined,
      });
      setNewName("");
      setNewColor("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditColor(c.color ?? "");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (editingId == null) return;
    setError("");
    try {
      await api.categories.update(editingId, {
        name: editName.trim(),
        color: editColor || undefined,
      });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handleDelete(id: number) {
    if (
      !confirm(
        "Delete this category? Expenses in it will need to be reassigned."
      )
    )
      return;
    setError("");
    try {
      await api.categories.delete(id);
      load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cannot delete (may have expenses)"
      );
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
        Categories
      </h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 text-base font-medium text-slate-900 sm:mb-4 sm:text-lg">
          Add category
        </h2>
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900"
            />
          </div>
          <div className="w-full sm:w-32">
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="Color (e.g. #2563eb)"
              className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="min-h-[44px] shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:py-2"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-medium text-slate-900 sm:text-lg">
            Your categories
          </h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0"
            >
              {editingId === c.id ? (
                <form
                  onSubmit={handleUpdate}
                  className="flex w-full flex-col gap-2 sm:flex-row sm:flex-1 sm:items-center sm:gap-3"
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    placeholder="#hex"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 sm:w-24"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="min-h-[44px] flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:flex-none"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="min-h-[44px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 sm:flex-none"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className="inline-block h-4 w-4 shrink-0 rounded-full"
                      style={{
                        backgroundColor: c.color || "#94a3b8",
                      }}
                    />
                    <span className="truncate font-medium text-slate-900">
                      {c.name}
                    </span>
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="min-h-[44px] min-w-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:min-w-0"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="min-h-[44px] min-w-[44px] rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 sm:min-w-0"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
