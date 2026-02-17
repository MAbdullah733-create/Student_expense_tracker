"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Category } from "@/lib/api";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  useEffect(() => {
    if (!id) return;
    api.transactions
      .get(id)
      .then((tx) => {
        setCategoryId(String(tx.category_id));
        setAmount(String(tx.amount));
        setDate(tx.date.slice(0, 10));
        setNote(tx.note ?? "");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setInitialLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!categoryId || !amount || !date) {
      setError("Please fill in category, amount and date.");
      return;
    }
    setLoading(true);
    try {
      await api.transactions.update(id, {
        category_id: Number(categoryId),
        amount: Number(amount),
        date,
        note: note || undefined,
      });
      router.push("/dashboard/transactions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (error && !categoryId) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/transactions"
          className="text-blue-600 hover:underline"
        >
          ← Back to transactions
        </Link>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Link
          href="/dashboard/transactions"
          className="min-h-[44px] flex items-center text-slate-600 hover:text-slate-900"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Edit expense
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label
            htmlFor="category"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Category *
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="amount"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Amount (£) *
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="date"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Date *
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="note"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Note (optional)
          </label>
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-3">
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:flex-none"
          >
            {loading ? "Saving…" : "Update expense"}
          </button>
          <Link
            href="/dashboard/transactions"
            className="min-h-[44px] flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 sm:flex-none"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
