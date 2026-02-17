"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getToken, getUser } from "@/lib/api";
import { api } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const u = getUser();
    if (u) {
      setUser(u);
      setLoading(false);
    } else {
      api.auth
        .user()
        .then((res) => setUser(res.user))
        .catch(() => router.replace("/login"))
        .finally(() => setLoading(false));
    }
  }, [router]);

  async function handleLogout() {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    clearAuth();
    router.replace("/login");
  }

  function NavLink({
    href,
    label,
    active,
    onClick,
  }: {
    href: string;
    label: string;
    active: boolean;
    onClick?: () => void;
  }) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition sm:inline-block ${
          active
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        {label}
      </Link>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/transactions", label: "Transactions" },
    { href: "/dashboard/transactions/new", label: "Add expense" },
    { href: "/dashboard/categories", label: "Categories" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="shrink-0"
            />
            <span className="truncate font-semibold text-slate-900 sm:whitespace-normal">
              Expense Tracker
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(({ href, label }) => {
              const active =
                pathname === href ||
                (href === "/dashboard/transactions/new" &&
                  pathname.startsWith("/dashboard/transactions/new"));
              return (
                <NavLink key={href} href={href} label={label} active={active} />
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <span className="max-w-[140px] truncate text-sm text-slate-600 lg:max-w-[200px]">
              {user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-0.5">
              {nav.map(({ href, label }) => {
                const active =
                  pathname === href ||
                  (href === "/dashboard/transactions/new" &&
                    pathname.startsWith("/dashboard/transactions/new"));
                return (
                  <NavLink
                    key={href}
                    href={href}
                    label={label}
                    active={active}
                    onClick={() => setMenuOpen(false)}
                  />
                );
              })}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <p className="truncate px-3 py-1 text-sm text-slate-500">
                {user.email}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        {children}
      </main>
    </div>
  );
}
