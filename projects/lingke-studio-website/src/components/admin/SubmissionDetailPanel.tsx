import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Check,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Star,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ContactStatus, Submission } from "../../lib/adminApi";
import { adminApi } from "../../lib/adminApi";
import {
  copyText,
  fmtDateTime,
  fmtRelative,
  initials,
  mailtoLead,
  STATUS_LABEL,
} from "../../lib/adminUtils";
import { StatusBadge } from "./StatusBadge";

type Props = {
  selected: Submission | null;
  duplicateEmail: boolean;
  onUpdated: (item: Submission) => void;
  onDeleted: () => void;
  onToast: (msg: string) => void;
};

export function SubmissionDetailPanel({ selected, duplicateEmail, onUpdated, onDeleted, onToast }: Props) {
  const [notes, setNotes] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNotes(selected?.notes ?? "");
    setSaveState("idle");
  }, [selected?.id, selected?.notes]);

  useEffect(() => {
    if (!selected) return;
    if (notes === (selected.notes ?? "")) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(() => {
      void adminApi
        .update(selected.id, { notes })
        .then(() => {
          setSaveState("saved");
          onUpdated({ ...selected, notes });
          setTimeout(() => setSaveState("idle"), 1500);
        })
        .catch(() => {
          setSaveState("idle");
          onToast("备注保存失败");
        });
    }, 700);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [notes, selected, onUpdated, onToast]);

  async function copyField(text: string, label: string) {
    try {
      await copyText(text);
      onToast(`已复制${label}`);
    } catch {
      onToast("复制失败");
    }
  }

  async function toggleStar() {
    if (!selected) return;
    const starred = !selected.starred;
    await adminApi.update(selected.id, { starred });
    onUpdated({ ...selected, starred: starred ? 1 : 0 });
    onToast(starred ? "已加星标" : "已取消星标");
  }

  async function setStatus(status: ContactStatus) {
    if (!selected) return;
    await adminApi.update(selected.id, { status });
    onUpdated({ ...selected, status });
    onToast(`已更新为「${STATUS_LABEL[status]}」`);
  }

  return (
    <section className="flex min-h-[min(62vh,680px)] flex-col rounded-2xl border border-black/[0.06] bg-white shadow-sm lg:sticky lg:top-[88px] lg:max-h-[calc(100dvh-120px)]">
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
              <Mail size={28} strokeWidth={1.2} />
            </div>
            <p className="mt-5 text-sm font-medium text-zinc-700">选择一条咨询</p>
            <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-zinc-400">
              支持星标、内部备注、批量操作。快捷键 <kbd className="rounded bg-zinc-100 px-1">/</kbd> 搜索
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
              <div className="flex gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-md"
                  style={{ background: "linear-gradient(145deg, #141414, #3a3a3a)" }}
                >
                  {initials(selected.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{selected.name}</h2>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void toggleStar()}
                        className={`rounded-lg p-2 transition ${
                          selected.starred ? "bg-[#C5A059]/15 text-[#C5A059]" : "text-zinc-400 hover:bg-zinc-100"
                        }`}
                        aria-label={selected.starred ? "取消星标" : "加星标"}
                      >
                        <Star size={18} fill={selected.starred ? "currentColor" : "none"} />
                      </button>
                      <StatusBadge status={selected.status} size="md" />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500" title={fmtDateTime(selected.created_at)}>
                    #{selected.id} · {fmtRelative(selected.created_at)}
                    {selected.updated_at !== selected.created_at ? ` · 更新 ${fmtRelative(selected.updated_at)}` : ""}
                  </p>
                  {duplicateEmail ? (
                    <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                      该邮箱在近期有其他咨询记录
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              <FieldRow icon={<Mail size={15} />} label="邮箱" value={selected.email} href={`mailto:${selected.email}`} onCopy={() => void copyField(selected.email, "邮箱")} />
              <FieldRow icon={<Phone size={15} />} label="手机" value={selected.phone} href={`tel:${selected.phone}`} onCopy={() => void copyField(selected.phone, "电话")} />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    合作需求
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyField(selected.brief, "需求")}
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800"
                  >
                    <Copy size={12} /> 复制
                  </button>
                </div>
                <p className="whitespace-pre-wrap rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3.5 text-[14px] leading-[1.8] text-zinc-800">
                  {selected.brief}
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    <StickyNote size={14} />
                    内部备注
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {saveState === "saving" ? "保存中…" : saveState === "saved" ? "已保存" : ""}
                  </span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="跟进记录、报价、下次联系时间…"
                  className="w-full resize-y rounded-xl border border-zinc-200/90 bg-white px-3.5 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[#C5A059]/25"
                />
              </div>

              {selected.ip ? <p className="text-[11px] text-zinc-400">IP · {selected.ip}</p> : null}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-zinc-100 px-5 py-4 sm:px-6">
              <a
                href={mailtoLead(selected)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#141414] px-4 py-2.5 text-xs font-semibold text-white hover:bg-black"
              >
                <ExternalLink size={14} />
                写邮件
              </a>
              {selected.status !== "read" ? (
                <ActionChip icon={<Check size={14} />} gold onClick={() => void setStatus("read")}>
                  已读
                </ActionChip>
              ) : null}
              {selected.status !== "archived" ? (
                <ActionChip icon={<Archive size={14} />} onClick={() => void setStatus("archived")}>
                  归档
                </ActionChip>
              ) : null}
              {selected.status !== "pending" ? (
                <ActionChip onClick={() => void setStatus("pending")}>待处理</ActionChip>
              ) : null}
              <ActionChip
                icon={<Trash2 size={14} />}
                danger
                onClick={() => {
                  if (!confirm("确定删除？不可恢复。")) return;
                  void adminApi.remove(selected.id).then(onDeleted);
                }}
              >
                删除
              </ActionChip>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function FieldRow({
  icon,
  label,
  value,
  href,
  onCopy,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/40 px-4 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        {href ? (
          <a href={href} className="break-all text-[15px] font-medium text-zinc-900 hover:underline">
            {value}
          </a>
        ) : (
          <span className="break-all text-[15px] font-medium">{value}</span>
        )}
        <button type="button" onClick={onCopy} className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-white hover:text-zinc-700" aria-label={`复制${label}`}>
          <Copy size={15} />
        </button>
      </div>
    </div>
  );
}

function ActionChip({
  children,
  onClick,
  icon,
  gold,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
  gold?: boolean;
  danger?: boolean;
}) {
  const cls = danger
    ? "bg-red-50 text-red-700 hover:bg-red-100"
    : gold
      ? "bg-[#C5A059]/12 text-[#8a6d2b] hover:bg-[#C5A059]/20"
      : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50";
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${cls}`}>
      {icon}
      {children}
    </button>
  );
}
