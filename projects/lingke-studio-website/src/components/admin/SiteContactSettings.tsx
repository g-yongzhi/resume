import { Loader2, Mail, Phone, Save } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi";
import { GOLD } from "../../lib/adminUtils";
import { useSiteSettings } from "../../context/SiteSettingsContext";

export function SiteContactSettings({ onToast }: { onToast: (msg: string) => void }) {
  const { refresh: refreshPublic } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminApi
      .getSiteContact()
      .then((res) => {
        if (!cancelled) {
          setEmail(res.contact.email);
          setPhone(res.contact.phone);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await adminApi.updateSiteContact({ email: email.trim(), phone: phone.trim() });
      setEmail(res.contact.email);
      setPhone(res.contact.phone);
      await refreshPublic();
      onToast("联系方式已保存，官网已同步更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-sm text-zinc-500">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.2em]" style={{ color: GOLD }}>
          SITE SETTINGS
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">官网联系方式</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          修改后将同步至首页联系区块、页脚及案例页中的邮箱与电话展示。
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm sm:p-8">
        <label className="block">
          <span className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <Mail size={14} />
            对外邮箱
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#C5A059]/30"
            placeholder="hello@lingke.studio"
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            <Phone size={14} />
            对外电话
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[15px] outline-none focus:bg-white focus:ring-2 focus:ring-[#C5A059]/30"
            placeholder="+86 21 6888 0000"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#141414] py-3.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "保存中…" : "保存并同步官网"}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-zinc-200 bg-white/60 p-4 text-xs leading-relaxed text-zinc-500">
        <p className="font-medium text-zinc-700">预览</p>
        <p className="mt-2">
          邮箱：<a className="text-zinc-900 underline" href={`mailto:${email}`}>{email || "—"}</a>
        </p>
        <p className="mt-1">
          电话：<a className="text-zinc-900 underline" href={`tel:${phone.replace(/\s/g, "")}`}>{phone || "—"}</a>
        </p>
      </div>
    </div>
  );
}
