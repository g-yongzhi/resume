/**
 * 顶部固定导航
 * ===========================================================================
 * 【改菜单文字 / 锚点】改 `../lib/homeNav` 里 `homeNavLinks` 与 `homeHash`。
 * 【滚动后背景】scrolled 为 true 时出现半透明底；阈值改 useEffect 里的数字 24。
 * 【磁吸强度】MagneticNavLink 里 useMagnetic(0.26) 的数字越大飘得越明显。
 * 【移动端菜单】窄屏显示汉堡按钮 + 全屏下拉列表；Escape 关闭、打开时自动 focus 第一项。
 * 【无障碍】首链「跳转至主要内容」是给键盘用户跳过导航直达 #main-content。
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMagnetic } from "../hooks/useMagnetic";
import { fadeInUpShort, navMobileMenuStagger } from "../lib/motionFade";
import { homeHash, homeNavLinks, HomeHashLink } from "../lib/homeNav";

/** 磁吸位移作用在外层 div，内层为 HomeHashLink（同页 # 锚点滚动逻辑已封装） */
function MagneticNavLink({
  to,
  className,
  children,
  onClick,
}: {
  to: string;
  className: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const { ref, style } = useMagnetic<HTMLDivElement>(0.26);

  return (
    <motion.div
      ref={ref}
      style={style}
      className="inline-block rounded-sm outline-none ring-offset-2 focus-within:ring-2 focus-within:ring-zinc-900/30"
    >
      <HomeHashLink to={to} onClick={() => onClick?.()} className={`block rounded-sm outline-none ${className}`}>
        {children}
      </HomeHashLink>
    </motion.div>
  );
}

export function Navbar() {
  /** 页面滚动超过阈值后为 true，导航条出现浅色背景 */
  const [scrolled, setScrolled] = useState(false);
  /** 移动端汉堡菜单是否展开 */
  const [open, setOpen] = useState(false);
  /** 打开菜单后把焦点移到面板内第一个链接（无障碍） */
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** 菜单打开时禁止背后页面滚动 */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /** 打开菜单：焦点进面板；按 Escape 关闭 */
  useEffect(() => {
    if (!open) return;
    const first = menuPanelRef.current?.querySelector<HTMLElement>("a[href]");
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* 键盘用户第一条 Tab 聚焦此处可跳过导航（视觉上默认隐藏，聚焦时出现） */}
      <HomeHashLink
        to={homeHash.mainContent}
        className="fixed left-4 top-4 z-[10100] -translate-y-[200%] rounded bg-zinc-900 px-4 py-2 text-[12px] font-medium tracking-wide text-white transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-zinc-400"
      >
        跳转至主要内容
      </HomeHashLink>
      <header
        className={`fixed inset-x-0 top-0 z-[10050] transition-colors duration-500 ${
          scrolled ? "bg-zinc-50/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <nav
          className="mx-auto flex max-w-[1400px] items-center justify-end px-6 py-5 md:px-10"
          aria-label="主导航"
        >
          {/* md 及以上：横向链接 */}
          <ul className="hidden items-center gap-10 md:flex" role="list">
            {homeNavLinks.map((item) => (
              <li key={item.to} role="none">
                <MagneticNavLink
                  to={item.to}
                  className={`text-[13px] font-medium tracking-wide transition-colors hover:text-[#C5A059] ${
                    scrolled ? "text-zinc-600" : "text-zinc-800/90"
                  }`}
                >
                  {item.label}
                </MagneticNavLink>
              </li>
            ))}
          </ul>

          {/* 窄屏：汉堡按钮 */}
          <button
            type="button"
            className="flex h-11 min-w-11 items-center justify-center rounded-sm md:hidden"
            aria-label={open ? "关闭导航菜单" : "打开导航菜单"}
            aria-expanded={open}
            aria-controls="primary-menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "关闭菜单" : "打开菜单"}</span>
            <span className="flex flex-col gap-1.5" aria-hidden>
              <motion.span
                animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                className={`block h-px w-5 ${scrolled ? "bg-zinc-900" : "bg-zinc-800"}`}
              />
              <motion.span
                animate={open ? { opacity: 0 } : { opacity: 1 }}
                className={`block h-px w-5 ${scrolled ? "bg-zinc-900" : "bg-zinc-800"}`}
              />
              <motion.span
                animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                className={`block h-px w-5 ${scrolled ? "bg-zinc-900" : "bg-zinc-800"}`}
              />
            </span>
          </button>
        </nav>

        {/* 移动端全屏菜单面板 */}
        <AnimatePresence>
          {open ? (
            <motion.div
              ref={menuPanelRef}
              id="primary-menu-mobile"
              role="dialog"
              aria-modal="true"
              aria-label="移动端导航"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-[72px] z-40 overflow-y-auto bg-zinc-50 md:hidden"
            >
              <motion.ul
                className="flex flex-col gap-8 px-6 py-12"
                role="list"
                variants={navMobileMenuStagger}
                initial="hidden"
                animate="visible"
              >
                {homeNavLinks.map((item) => (
                  <motion.li key={item.to} role="none" variants={fadeInUpShort}>
                    <MagneticNavLink
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="text-2xl font-normal tracking-tight leading-[1.25] text-zinc-900 transition-colors hover:text-[#C5A059]"
                    >
                      {item.label}
                    </MagneticNavLink>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  );
}
