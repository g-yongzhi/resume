/**
 * 整站路由：首页；首页保留 ScrollAmbient + Hero 载入层。
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { fadeInUpShort } from "./lib/motionFade";
import { HOME_DESCRIPTION, HOME_KEYWORDS, HOME_TITLE } from "./lib/siteSeo";
import { getSiteBaseUrl } from "./lib/schemaMarkup";
import { scrollToHashId } from "./lib/homeNav";
import { CursorProvider, CustomCursor } from "./context/CursorContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { CaseStudyPage } from "./pages/CaseStudyPage";
import { MiniCaseStudyPage } from "./pages/MiniCaseStudyPage";
import { AppCaseStudyPage } from "./pages/AppCaseStudyPage";
import { H5CaseStudyPage } from "./pages/H5CaseStudyPage";
import { AdminPage } from "./pages/AdminPage";

const DEFAULT_SITE = "https://lingke.studio";

function absoluteUrl(path: string, base: string) {
  if (path.startsWith("http")) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

/** 页面 head：SEO / OG（首页身份 JSON-LD 见 index.html，避免与静态标签重复） */
function SiteHead() {
  const site = getSiteBaseUrl();
  const title = HOME_TITLE;
  const description = HOME_DESCRIPTION;
  const ogImage = absoluteUrl("/apple-touch-icon.png", site);
  const baiduVerify = import.meta.env.VITE_BAIDU_SITE_VERIFICATION as string | undefined;

  return (
    <Helmet htmlAttributes={{ lang: "zh-CN" }} prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={HOME_KEYWORDS} />
      {baiduVerify ? <meta name="baidu-site-verification" content={baiduVerify} /> : null}
      <link rel="canonical" href={`${site}/`} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="灵壳 LINGKE" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${site}/`} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="180" />
      <meta property="og:image:height" content="180" />
      <meta property="og:locale" content="zh_CN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <meta name="theme-color" content="#fafafa" />
      <meta name="robots" content="index,follow" />
    </Helmet>
  );
}

function ScrollAmbient({ heroRef }: { heroRef: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
    layoutEffect: false,
  });
  const from = "#e8e8e8";
  const to = "#fafafa";
  const bg = useTransform(scrollYProgress, [0, 0.62, 0.92, 1], [from, from, to, to]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ backgroundColor: bg }}
    />
  );
}

function LoadingOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="loader"
          role="status"
          aria-live="polite"
          aria-label="正在加载"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#e8e8e8]"
        >
          <motion.div
            className="flex flex-col items-center gap-6"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
            }}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeInUpShort}
              className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-800/40 to-transparent"
            />
            <motion.p
              variants={fadeInUpShort}
              className="font-sans text-[10px] font-medium uppercase tracking-[0.45em] text-zinc-500"
            >
              LINGKE
            </motion.p>
            <motion.p
              variants={fadeInUpShort}
              className="text-[12px] font-normal tracking-[0.2em] text-zinc-500"
            >
              载入画面
            </motion.p>
            <motion.div
              className="h-0.5 w-32 origin-left bg-zinc-900/20"
              initial={{ scaleX: 0.08 }}
              animate={{ scaleX: [0.08, 0.35, 0.75, 0.95] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function scrollWindowTopHard() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** 进入案例子页时立刻置顶（instant），避免继承首页滚动且受 html scroll-behavior:smooth 影响出现「先中段再滑顶」 */
function ScrollToTopOnCaseRoutes() {
  const location = useLocation();
  useLayoutEffect(() => {
    const p = location.pathname;
    if (
      !p.startsWith("/work/") &&
      !p.startsWith("/mini/") &&
      !p.startsWith("/app/") &&
      !p.startsWith("/h5/")
    ) {
      return;
    }
    scrollWindowTopHard();
  }, [location.pathname]);
  return null;
}

/** 首页：有 hash 则滚到对应区块；无 hash 则置顶（含从子页返回 `/`） */
function ScrollToHash() {
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    const raw = location.hash;
    if (!raw || raw.length < 2) {
      scrollWindowTopHard();
      requestAnimationFrame(scrollWindowTopHard);
      return;
    }
    const id = decodeURIComponent(raw.slice(1));
    scrollToHashId(id);
  }, [location.pathname, location.hash]);

  return null;
}

/** 首页带 hash 时点进子案例：去掉当前历史条目里的 hash，避免「返回」误回 /#contact */
function StripHomeHashBeforeLeavingToChildRoutes() {
  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as HTMLElement | null)?.closest("a[href]");
      if (!a) return;
      if (a.getAttribute("target") === "_blank") return;

      const hrefAttr = a.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("#") || hrefAttr.startsWith("mailto:") || hrefAttr.startsWith("tel:"))
        return;

      if (window.location.pathname !== "/" || !window.location.hash || window.location.hash.length < 2) return;

      let path: string;
      try {
        const resolved = new URL(hrefAttr, window.location.origin);
        if (resolved.origin !== window.location.origin) return;
        path = resolved.pathname || "/";
      } catch {
        return;
      }
      if (path === "/" || path === "") return;

      try {
        window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
      } catch {
        /* ignore */
      }
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, []);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const heroRef = useRef<HTMLElement | null>(null);
  const [heroMediaReady, setHeroMediaReady] = useState(false);

  const onHeroReady = useCallback(() => {
    setHeroMediaReady(true);
  }, []);

  const isHome = location.pathname === "/";
  const isAdmin = location.pathname.startsWith("/admin");
  const hideSiteChrome =
    isAdmin ||
    location.pathname.startsWith("/work/") ||
    location.pathname.startsWith("/mini/") ||
    location.pathname.startsWith("/app/") ||
    location.pathname.startsWith("/h5/");

  return (
    <CursorProvider>
      {isHome ? <SiteHead /> : null}
      {isHome && !isAdmin && (
        <>
          <ScrollAmbient heroRef={heroRef} />
          <LoadingOverlay visible={!heroMediaReady} />
        </>
      )}
      {!isAdmin ? <CustomCursor /> : null}
      {!hideSiteChrome ? <Navbar /> : null}
      <ScrollToHash />
      <StripHomeHashBeforeLeavingToChildRoutes />
      <div className="relative z-[1] min-h-dvh text-zinc-900">
        {/* 勿用 AnimatePresence mode="wait" 包 Routes：会阻塞下一页挂载，易白屏 */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <ScrollToTopOnCaseRoutes />
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/" element={<HomePage heroRef={heroRef} onHeroReady={onHeroReady} />} />
            <Route path="/work/:slug" element={<CaseStudyPage />} />
            <Route path="/mini/:slug" element={<MiniCaseStudyPage />} />
            <Route path="/app/:slug" element={<AppCaseStudyPage />} />
            <Route path="/h5/:slug" element={<H5CaseStudyPage />} />
          </Routes>
        </motion.div>
      </div>
    </CursorProvider>
  );
}

export default function App() {
  return (
    <SiteSettingsProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SiteSettingsProvider>
  );
}
