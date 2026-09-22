export type ContactStatus = "pending" | "read" | "archived";

export type Submission = {
  id: number;
  name: string;
  email: string;
  phone: string;
  brief: string;
  status: ContactStatus;
  notes: string;
  starred: number;
  created_at: string;
  updated_at: string;
  ip: string | null;
  user_agent: string | null;
};

export type ExtendedStats = {
  pending: number;
  read: number;
  archived: number;
  total: number;
  today: number;
  week: number;
  starred: number;
  trend: { date: string; count: number }[];
};

export type ListFilters = {
  status?: string;
  q?: string;
  page: number;
  limit?: number;
  period?: "today" | "week";
  starred?: boolean;
};

export type SubmissionPatch = {
  status?: ContactStatus;
  notes?: string;
  starred?: boolean;
};

export type SiteContact = {
  email: string;
  phone: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || data.ok === false) {
    throw new Error(data.message ?? "请求失败");
  }
  return data as T;
}

export const adminApi = {
  config: () => request<{ ok: true; loginEnabled: boolean }>("/config"),
  me: () => request<{ ok: true; authenticated: boolean }>("/me"),
  login: (password: string) =>
    request<{ ok: true }>("/login", { method: "POST", body: JSON.stringify({ password }) }),
  logout: () => request<{ ok: true }>("/logout", { method: "POST" }),
  stats: () => request<{ ok: true; stats: ExtendedStats }>("/stats"),
  list: (params: ListFilters) => {
    const q = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit ?? 20),
    });
    if (params.status) q.set("status", params.status);
    if (params.q) q.set("q", params.q);
    if (params.period) q.set("period", params.period);
    if (params.starred) q.set("starred", "1");
    return request<{ ok: true; items: Submission[]; total: number; pages: number; page: number }>(
      `/submissions?${q}`,
    );
  },
  update: (id: number, patch: SubmissionPatch) =>
    request<{ ok: true }>(`/submissions/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  bulkStatus: (ids: number[], status: ContactStatus) =>
    request<{ ok: true; count: number }>("/submissions/bulk-status", {
      method: "POST",
      body: JSON.stringify({ ids, status }),
    }),
  remove: (id: number) => request<{ ok: true }>(`/submissions/${id}`, { method: "DELETE" }),
  getSiteContact: () => request<{ ok: true; contact: SiteContact }>("/site-contact"),
  updateSiteContact: (contact: SiteContact) =>
    request<{ ok: true; contact: SiteContact }>("/site-contact", {
      method: "PATCH",
      body: JSON.stringify(contact),
    }),
};
