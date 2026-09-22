import type { ContactStatus } from "../../lib/adminApi";
import { STATUS_LABEL } from "../../lib/adminUtils";

const STYLE: Record<ContactStatus, string> = {
  pending: "bg-amber-50 text-amber-900 ring-amber-300/50",
  read: "bg-emerald-50 text-emerald-900 ring-emerald-300/50",
  archived: "bg-zinc-100 text-zinc-600 ring-zinc-300/40",
};

export function StatusBadge({ status, size = "sm" }: { status: ContactStatus; size?: "sm" | "md" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full font-semibold ring-1 ring-inset ${
        size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]"
      } ${STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
