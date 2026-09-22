import {
  CheckSquare,
  Download,
  Inbox,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Settings,
  Square,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { adminApi, type ContactStatus, type ExtendedStats, type Submission } from "../../lib/adminApi";
import { exportSubmissionsCsv, fmtDateTime, fmtRelative, GOLD } from "../../lib/adminUtils";
import { AdminToast } from "./AdminToast";
import { InsightsPanel } from "./InsightsPanel";
import { StatusBadge } from "./StatusBadge";
import { SiteContactSettings } from "./SiteContactSettings";
import { SubmissionDetailPanel } from "./SubmissionDetailPanel";

const STATUS_TABS: { key: ContactStatus | ""; label: string }[] = [
  { key: "", label: "全部" },
  { key: "pending", label: "待处理" },
  { key: "read", label: "已读" },
  { key: "archived", label: "已归档" },
];

type AdminView = "inbox" | "settings";

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<AdminView>("inbox");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [stats, setStats] = useState<ExtendedStats | null>(null);
  const [items, setItems] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [tab, setTab] = useState<ContactStatus | "">("");
  const [period, setPeriod] = useState<"" | "today" | "week">("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const filters = useMemo(
    () => ({ status: tab || undefined, q: q || undefined, page, period: period || undefined, starred: starredOnly }),
    [tab, q, page, period, starredOnly],
  );

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setRefreshing(true);
      try {
        const [s, list] = await Promise.all([adminApi.stats(), adminApi.list(filters)]);
        setStats(s.stats);
        setItems(list.items);
        setPages(list.pages);
        setTotal(list.total);
        setPage(list.page);
        setError("");
        setSelected((cur) => (cur ? (list.items.find((i) => i.id === cur.id) ?? null) : null));
        setChecked(new Set());
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 320);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => void load(true), 30_000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const duplicateEmail = useMemo(() => {
    if (!selected) return false;
    return items.some((i) => i.id !== selected.id && i.email.toLowerCase() === selected.email.toLowerCase());
  }, [items, selected]);

  async function selectItem(item: Submission) {
    setSelected(item);
    if (item.status === "pending") {
      try {
        await adminApi.update(item.id, { status: "read" });
        const next = { ...item, status: "read" as const };
        setSelected(next);
        setItems((list) => list.map((r) => (r.id === item.id ? next : r)));
        showToast("已标为已读");
        void load(true);
      } catch {
        /* ignore */
      }
    }
  }

  function toggleCheck(id: number, e: MouseEvent) {
    e.stopPropagation();
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (checked.size === items.length) setChecked(new Set());
    else setChecked(new Set(items.map((i) => i.id)));
  }

  async function bulkArchive() {
    const ids = [...checked];
    if (!ids.length) return showToast("请先勾选记录");
    await adminApi.bulkStatus(ids, "archived");
    showToast(`已归档 ${ids.length} 条`);
    void load(true);
  }

  async function bulkRead() {
    const ids = [...checked];
    if (!ids.length) return showToast("请先勾选记录");
    await adminApi.bulkStatus(ids, "read");
    showToast(`已标为已读 ${ids.length} 条`);
    void load(true);
  }

  async function handleExport() {
    try {
      const list = await adminApi.list({ ...filters, page: 1, limit: 5000 });
      if (!list.items.length) return showToast("无数据可导出");
      exportSubmissionsCsv(list.items);
      showToast(`已导出 ${list.items.length} 条`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "导出失败");
    }
  }

  return (
    <div
      className="min-h-dvh text-zinc-900"
      style={{
        background: `radial-gradient(ellipse 120% 80% at 50% -20%, color-mix(in srgb, ${GOLD} 6%, transparent), transparent), #ebebeb`,
      }}
    >
      <AdminToast message={toast} />

      <header className="sticky top-0 z-50 border-b border-black/[0.05] bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#141414] text-[11px] font-bold tracking-wider text-white">
              LK
            </Link>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em]" style={{ color: GOLD }}>
                WORKSPACE
              </p>
              <h1 className="text-base font-semibold">{view === "inbox" ? "咨询工作台" : "网站设置"}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-zinc-200/80 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setView("inbox")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  view === "inbox" ? "bg-[#141414] text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                咨询
              </button>
              <button
                type="button"
                onClick={() => setView("settings")}
                className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  view === "settings" ? "bg-[#141414] text-white" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Settings size={13} />
                联系方式
              </button>
            </div>
            {view === "inbox" ? (
              <>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white px-3 py-1.5 text-[11px] text-zinc-600">
                  <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded" />
                  自动刷新
                </label>
                <ToolbarBtn icon={<Download size={14} />} onClick={() => void handleExport()}>
                  导出
                </ToolbarBtn>
                <ToolbarBtn icon={<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />} onClick={() => void load()}>
                  刷新
                </ToolbarBtn>
              </>
            ) : null}
            <button type="button" onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black">
              <LogOut size={14} />
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        {view === "settings" ? (
          <SiteContactSettings onToast={showToast} />
        ) : (
          <>
        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

        {stats ? (
          <InsightsPanel
            stats={stats}
            activePeriod={period}
            starredOnly={starredOnly}
            onPeriod={(p) => {
              setPeriod(p);
              setPage(1);
            }}
            onStarred={(v) => {
              setStarredOnly(v);
              setPage(1);
            }}
          />
        ) : null}

        {stats ? (
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["", stats.total, "全部"],
                ["pending", stats.pending, "待处理"],
                ["read", stats.read, "已读"],
                ["archived", stats.archived, "已归档"],
              ] as const
            ).map(([key, n, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTab(key);
                  setPage(1);
                }}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  tab === key ? "border-[#C5A059]/50 bg-white shadow-sm ring-1 ring-[#C5A059]/20" : "border-transparent bg-white/60 hover:bg-white"
                }`}
              >
                <p className="text-xl font-bold tabular-nums">{n}</p>
                <p className="text-[11px] text-zinc-500">{label}</p>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
                  tab === t.key ? "bg-[#141414] text-white" : "bg-white/80 text-zinc-600 ring-1 ring-zinc-200/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative max-w-md flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              ref={searchRef}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索… 按 / 聚焦"
              className="w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm ring-1 ring-zinc-200/80 outline-none focus:ring-2 focus:ring-[#C5A059]/30"
            />
          </div>
        </div>

        {checked.size > 0 ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-[#141414] px-4 py-2.5 text-white">
            <span className="text-xs font-medium">已选 {checked.size} 条</span>
            <button type="button" onClick={() => void bulkRead()} className="rounded-lg bg-white/15 px-3 py-1 text-xs hover:bg-white/25">
              标为已读
            </button>
            <button type="button" onClick={() => void bulkArchive()} className="rounded-lg bg-white/15 px-3 py-1 text-xs hover:bg-white/25">
              批量归档
            </button>
            <button type="button" onClick={() => setChecked(new Set())} className="ml-auto text-xs text-white/70 hover:text-white">
              取消
            </button>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <Inbox size={14} />
                {total} 条
              </span>
              <button type="button" onClick={toggleAll} className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800">
                {checked.size === items.length && items.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                全选
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center gap-2 py-24 text-sm text-zinc-500">
                <Loader2 className="animate-spin" size={20} />
                加载中…
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center text-sm text-zinc-500">暂无记录</div>
            ) : (
              <ul className="max-h-[min(58vh,640px)] divide-y divide-zinc-50 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => void selectItem(item)}
                      onKeyDown={(e) => e.key === "Enter" && void selectItem(item)}
                      className={`flex cursor-pointer gap-3 px-3 py-3 transition sm:px-4 ${
                        selected?.id === item.id ? "bg-[#C5A059]/[0.08] shadow-[inset_3px_0_0_#C5A059]" : "hover:bg-zinc-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => toggleCheck(item.id, e)}
                        className="mt-1 shrink-0 text-zinc-400 hover:text-zinc-700"
                        aria-label="选择"
                      >
                        {checked.has(item.id) ? <CheckSquare size={16} className="text-[#C5A059]" /> : <Square size={16} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {item.starred ? <Star size={12} className="shrink-0 fill-[#C5A059] text-[#C5A059]" /> : null}
                          <span className="truncate font-semibold text-zinc-900">{item.name}</span>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[13px] text-zinc-500">{item.brief}</p>
                        <p className="mt-1 text-[10px] text-zinc-400" title={fmtDateTime(item.created_at)}>
                          {fmtRelative(item.created_at)}
                          {item.notes ? " · 有备注" : ""}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {pages > 1 ? (
              <div className="flex justify-center gap-4 border-t border-zinc-100 py-3 text-xs text-zinc-500">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-35">
                  上一页
                </button>
                <span className="tabular-nums">
                  {page}/{pages}
                </span>
                <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-35">
                  下一页
                </button>
              </div>
            ) : null}
          </section>

          <SubmissionDetailPanel
            selected={selected}
            duplicateEmail={duplicateEmail}
            onUpdated={(item) => {
              setSelected(item);
              setItems((list) => list.map((r) => (r.id === item.id ? item : r)));
            }}
            onDeleted={() => {
              showToast("已删除");
              setSelected(null);
              void load(true);
            }}
            onToast={showToast}
          />
        </div>
          </>
        )}
      </main>
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
    >
      {icon}
      {children}
    </button>
  );
}
