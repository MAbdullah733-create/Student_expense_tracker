"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { api, type Summary } from "@/lib/api";
import { formatDate } from "@/lib/format";

function CategoryChart({
  data,
}: {
  data: { category_name: string; total: number; color: string | null }[];
}) {
  const chartData = data.map((d) => ({
    name: d.category_name,
    value: d.total,
    color: d.color || "#94a3b8",
  }));
  if (chartData.length === 0)
    return <p className="text-sm text-slate-500">No data</p>;
  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value }) => `${name} £${value.toFixed(0)}`}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => `£${v.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.transactions
      .summary()
      .then(setSummary)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-slate-500">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          Dashboard
        </h1>
        <Link
          href="/dashboard/transactions/new"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Add expense
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 text-base font-medium text-slate-900 sm:mb-4 sm:text-lg">
          Spent this month
        </h2>
        <p className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          £{Number(summary.total_this_month).toFixed(2)}
        </p>
      </div>

      {summary.by_category.length > 0 && (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 text-base font-medium text-slate-900 sm:mb-4 sm:text-lg">
              By category
            </h2>
            <ul className="space-y-2">
              {summary.by_category.map((row) => (
                <li
                  key={row.category_id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-2"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: row.color || "#94a3b8" }}
                  />
                  <span className="flex-1 pl-2 font-medium text-slate-700">
                    {row.category_name}
                  </span>
                  <span className="text-slate-900">
                    £{row.total.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 text-base font-medium text-slate-900 sm:mb-4 sm:text-lg">
              Spending by category
            </h2>
            <div className="min-h-[200px] sm:min-h-[256px]">
              <CategoryChart data={summary.by_category} />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-medium text-slate-900 sm:text-lg">
            Recent transactions
          </h2>
          <Link
            href="/dashboard/transactions"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {summary.recent_transactions.length === 0 ? (
          <p className="text-slate-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {summary.recent_transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">
                    {tx.category?.name ?? "Uncategorised"}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {formatDate(tx.date)}
                    {tx.note ? ` · ${tx.note}` : ""}
                  </p>
                </div>
                <span className="shrink-0 font-medium text-slate-900">
                  £{Number(tx.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
