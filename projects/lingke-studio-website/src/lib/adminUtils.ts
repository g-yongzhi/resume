import type { ContactStatus, Submission } from "./adminApi";

export const GOLD = "#C5A059";

export const STATUS_LABEL: Record<ContactStatus, string> = {
  pending: "待处理",
  read: "已读",
  archived: "已归档",
};

export function fmtDateTime(iso: string) {
  const d = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("zh-CN", { hour12: false });
}

export function fmtRelative(iso: string) {
  const d = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  return fmtDateTime(iso);
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export function mailtoLead(item: Submission) {
  const subject = encodeURIComponent(`灵壳 LINGKE — 回复 ${item.name} 的合作咨询`);
  const body = encodeURIComponent(
    `您好 ${item.name}：\n\n感谢联系灵壳。关于您的需求：\n${item.brief}\n\n——\n灵壳团队`,
  );
  return `mailto:${item.email}?subject=${subject}&body=${body}`;
}

export function initials(name: string) {
  const t = name.trim();
  if (!t) return "?";
  if (/[\u4e00-\u9fff]/.test(t)) return t.slice(0, 1);
  return t
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function exportSubmissionsCsv(items: Submission[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    ["ID", "姓名", "邮箱", "手机", "状态", "星标", "提交时间", "备注", "合作需求"].join(","),
    ...items.map((r) =>
      [
        r.id,
        esc(r.name),
        esc(r.email),
        esc(r.phone),
        esc(STATUS_LABEL[r.status]),
        r.starred ? "是" : "否",
        esc(fmtDateTime(r.created_at)),
        esc(r.notes ?? ""),
        esc(r.brief),
      ].join(","),
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lingke-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
