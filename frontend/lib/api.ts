const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getUser(): { id: number; name: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: number; name: string; email: string };
  } catch {
    return null;
  }
}

export function setAuth(
  token: string,
  user: { id: number; name: string; email: string }
): void {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...init } = options;
  const url = new URL(`${API_URL}/api${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url.toString(), { ...init, headers });
  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (data: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) =>
      request<{ user: { id: number; name: string; email: string }; token: string }>(
        "/register",
        { method: "POST", body: JSON.stringify(data) }
      ),
    login: (data: { email: string; password: string }) =>
      request<{ user: { id: number; name: string; email: string }; token: string }>(
        "/login",
        { method: "POST", body: JSON.stringify(data) }
      ),
    logout: () => request<{ message: string }>("/logout", { method: "POST" }),
    user: () =>
      request<{ user: { id: number; name: string; email: string } }>("/user"),
  },
  categories: {
    list: () => request<Category[]>("/categories"),
    create: (data: { name: string; color?: string }) =>
      request<Category>("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { name?: string; color?: string }) =>
      request<Category>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/categories/${id}`, { method: "DELETE" }),
  },
  transactions: {
    list: (params?: { month?: string; category_id?: string }) =>
      request<Transaction[]>("/transactions", {
        params: params as Record<string, string>,
      }),
    get: (id: number) => request<Transaction>(`/transactions/${id}`),
    create: (data: {
      category_id: number;
      amount: number;
      date: string;
      note?: string;
    }) =>
      request<Transaction>("/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (
      id: number,
      data: {
        category_id?: number;
        amount?: number;
        date?: string;
        note?: string;
      }
    ) =>
      request<Transaction>(`/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/transactions/${id}`, { method: "DELETE" }),
    summary: () => request<Summary>("/transactions/summary"),
  },
};

export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Summary {
  total_this_month: number;
  by_category: {
    category_id: number;
    category_name: string;
    color: string | null;
    total: number;
  }[];
  recent_transactions: Transaction[];
}
