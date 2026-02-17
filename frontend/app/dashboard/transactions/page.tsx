"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Transaction } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  useEffect(() => {
    api.categories.list().then((list) => setCategories(list));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: { month?: string; category_id?: string } = {};
    if (month) params.month = month;
    if (categoryId) params.category_id = categoryId;
    api.transactions
      .list(params)
      .then(setTransactions)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [month, categoryId]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this expense?")) return;
    try {
      await api.transactions.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Transactions
        </h1>
        <Link
          href="/dashboard/transactions/new"
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 sm:w-auto"
        >
          Add expense
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-6 sm:p-5">
        <div className="min-w-0 flex-1 basis-[140px]">
          <label
            htmlFor="month"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Month
          </label>
          <input
            id="month"
            type="month"
            value={month || currentMonth}
            onChange={(e) => setMonth(e.target.value || "")}
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900"
          />
        </div>
        <div className="min-w-0 flex-1 basis-[140px]">
          <label
            htmlFor="category"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 sm:p-8">
          No transactions found.
        </div>
      ) : (
        <>
          <ul className="space-y-3 sm:hidden">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {tx.category?.name ?? "—"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(tx.date)}
                    </p>
                    {tx.note ? (
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {tx.note}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-semibold text-slate-900">
                    £{Number(tx.amount).toFixed(2)}
                  </p>
                </div>
                <div className="mt-3 flex gap-3 border-t border-slate-100 pt-3">
                  <Link
                    href={`/dashboard/transactions/${tx.id}/edit`}
                    className="min-h-[44px] flex-1 rounded-lg border border-slate-300 bg-white py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(tx.id)}
                    className="min-h-[44px] flex-1 rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                    Note
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {tx.category?.name ?? "—"}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-sm text-slate-500">
                      {tx.note || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">
                      £{Number(tx.amount).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/transactions/${tx.id}/edit`}
                        className="mr-2 text-sm font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(tx.id)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
