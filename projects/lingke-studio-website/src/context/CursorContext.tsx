/**
 * 自定义光标：Context + 渲染组件（原拆在 CursorContext / CustomCursor 两处）
 * ---------------------------------------------------------------------------
 * - CursorProvider：包在 App 最外层。
 * - 子组件：const { setVariant } = useCursor();
 * - 新光标样式：先改 CursorVariant，再改本文件下方 CustomCursor 的分支 UI。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

export type CursorVariant = "default" | "play" | "view" | "explore";

type CursorContextValue = {
  variant: CursorVariant;
  setVariant: (v: CursorVariant) => void;
};

const CursorContext = createContext<CursorContextValue | null>(null);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [variant, setVariantState] = useState<CursorVariant>("default");

  const setVariant = useCallback((v: CursorVariant) => {
    setVariantState(v);
  }, []);

  const value = useMemo(() => ({ variant, setVariant }), [variant, setVariant]);

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
}

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursor must be used within CursorProvider");
  return ctx;
}

export function CustomCursor() {
  const { variant } = useCursor();
  const [finePointer, setFinePointer] = useState(false);
  /** 用 ref + rAF 写 transform，避免每帧 setState 拖慢案例区等 hover 合成 */
  const rootRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!finePointer) return;
    const flush = () => {
      rafRef.current = 0;
      const el = rootRef.current;
      if (!el) return;
      const { x, y } = posRef.current;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) rafRef.current = requestAnimationFrame(flush);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.classList.add("hide-system-cursor");
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("hide-system-cursor");
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [finePointer]);

  if (!finePointer) return null;

  const size = variant === "default" ? 28 : variant === "explore" ? 52 : 44;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed left-0 top-0 z-[16000] will-change-transform"
      style={{ transform: "translate3d(0,0,0)" }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <motion.div
          className={`flex items-center justify-center ${
            variant === "explore"
              ? "rounded-full border-2 border-[#C5A059] bg-[#fafafa]/96 shadow-[0_0_0_1px_rgba(197,160,89,0.25)]"
              : "rounded-full border border-zinc-900/25 bg-[#fafafa]/92 shadow-[0_0_0_1px_rgba(255,255,255,0.55)]"
          }`}
          animate={{
            width: size,
            height: size,
            /* 与 12 同为 px 数值，避免 Framer 无法从 999 插值到 12 的告警 */
            borderRadius: variant === "default" || variant === "explore" ? 9999 : 12,
          }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
          <AnimatePresence mode="wait">
            {variant === "explore" ? (
              <motion.span
                key="explore"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="px-1.5 text-center font-sans text-[6.5px] font-semibold leading-tight tracking-[0.18em] text-[#C5A059]"
              >
                EXPLORE
              </motion.span>
            ) : variant === "default" ? (
              <motion.span
                key="dot"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="block h-1 w-1 rounded-full bg-zinc-900"
              />
            ) : variant === "play" ? (
              <motion.svg
                key="play"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="text-zinc-900"
                aria-hidden
              >
                <path fill="currentColor" d="M9 6.5v11l9.5-5.5L9 6.5z" />
              </motion.svg>
            ) : (
              <motion.svg
                key="view"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="text-zinc-900"
                aria-hidden
              >
                <path
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"
                />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
