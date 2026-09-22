import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../lib/adminApi";
import { GOLD } from "../../lib/adminUtils";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await adminApi.login(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in srgb, ${GOLD} 18%, transparent), transparent), linear-gradient(165deg, #ececec, #fafafa)`,
      }}
    >
      <span className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: GOLD }} aria-hidden />
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={onSubmit}
        className="relative w-full max-w-[420px] rounded-2xl border border-white/60 bg-white/90 p-10 shadow-[0_32px_80px_rgba(0,0,0,0.08)] backdrop-blur-md"
      >
        <p className="text-[10px] font-bold tracking-[0.24em]" style={{ color: GOLD }}>
          LINGKE ADMIN
        </p>
        <h1 className="mt-3 text-[1.75rem] font-semibold tracking-tight text-zinc-900">咨询工作台</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">登录以管理官网客户咨询与跟进记录</p>

        <label className="mt-8 block text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500" htmlFor="admin-pw">
          密码
        </label>
        <div className="relative mt-2">
          <input
            id="admin-pw"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-0 bg-zinc-100/80 py-3.5 pl-4 pr-12 text-[15px] outline-none ring-1 ring-zinc-200/80 focus:bg-white focus:ring-2 focus:ring-[#C5A059]/35"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-400 hover:text-zinc-600"
            aria-label={showPw ? "隐藏" : "显示"}
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#141414] py-3.5 text-sm font-semibold tracking-wide text-white hover:bg-black disabled:opacity-50"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}
          {busy ? "验证中…" : "进入工作台"}
        </button>

        <p className="mt-8 text-center text-xs text-zinc-400">
          <Link to="/" className="hover:text-zinc-700 hover:underline">
            ← 返回灵壳官网
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
