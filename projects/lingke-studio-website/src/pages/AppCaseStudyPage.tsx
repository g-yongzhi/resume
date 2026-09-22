/**
 * App 案例子页 —— 数据：`src/data/appCases.ts`，路由 `/app/:slug`。
 * 视觉：浅色政务/工具风格，首屏设备框 + 界面胶片 + 能力点 / 动线 / 色板。
 */
import { useMemo, useState, type CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { JsonLd } from "../components/JsonLd";
import { buildCaseStudySchemaGraph } from "../lib/schemaMarkup";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Layers, LayoutGrid, MapPin } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import {
  APP_CASES,
  getAppCaseBySlug,
  resolveAppLocationLine,
  resolveAppPalette,
  resolveAppPortfolioNote,
  resolveAppSeoDescription,
  resolveAppTagline,
  type AppCase,
} from "../data/appCases";
import type { MiniCapability, MiniCasePalette, MiniFlowStep, MiniScreen } from "../data/miniCases";
import { homeHash, HomeHashLink } from "../lib/homeNav";

const DEFAULT_SITE = "https://lingke.studio";

function absoluteUrl(path: string, base: string) {
  if (path.startsWith("http")) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function ScreenImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <motion.div
        layout
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-zinc-200 to-zinc-300 px-4 text-center ${className ?? ""}`}
        aria-hidden
      >
        <LayoutGrid className="h-8 w-8 text-zinc-400" strokeWidth={1.25} />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">SCREEN</span>
      </motion.div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function PhoneFrameLight({
  src,
  alt,
  palette,
  className,
}: {
  src: string;
  alt: string;
  palette: MiniCasePalette;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative mx-auto w-full max-w-[280px] sm:max-w-[300px] ${className ?? ""}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-[14%] -z-10 rounded-[3rem] blur-3xl opacity-70"
        style={{
          background: `radial-gradient(ellipse 55% 48% at 50% 42%, ${palette.accent}35 0%, transparent 68%)`,
        }}
      />
      <div
        className="relative rounded-[2.2rem] bg-white p-[9px] shadow-[0_28px_64px_-24px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/90"
        style={{ boxShadow: `0 28px 64px -24px color-mix(in srgb, ${palette.accent} 22%, rgba(15,23,42,0.12))` }}
      >
        <div className="mx-auto mt-[6px] h-[5px] w-[26%] rounded-full bg-slate-200/95" aria-hidden />
        <div
          className="relative mt-[8px] overflow-hidden rounded-[1.45rem] bg-slate-100 ring-1 ring-slate-900/[0.06]"
          style={{ aspectRatio: "9 / 19.5" }}
        >
          <ScreenImage src={src} alt={alt} className="h-full w-full object-cover object-top" />
        </div>
        <div className="mx-auto mt-2 h-1 w-[30%] rounded-full bg-slate-200/90" aria-hidden />
      </div>
    </motion.div>
  );
}

function AppFilmStripSection({
  screens,
  palette,
  title,
}: {
  screens: readonly MiniScreen[];
  palette: MiniCasePalette;
  title: string;
}) {
  return (
    <section
      id="app-screens"
      className="scroll-mt-8 border-t border-slate-200/90 bg-[color-mix(in_srgb,var(--app-mist)_100%,white)] px-5 py-16 md:px-10 md:py-24"
      aria-labelledby="app-screens-heading"
    >
      <motion.div
        className="mx-auto max-w-[1500px]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">02 · Screens</p>
            <h2 id="app-screens-heading" className="mt-2 text-[clamp(1.65rem,3.5vw,2.35rem)] font-bold tracking-tight text-slate-900">
              界面胶片
            </h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-slate-600">
              横滑浏览 {title} 的关键界面 — 每一帧均为实际上线或高保真交付稿摘录。
            </p>
          </motion.div>
          <motion.p
            className="hidden text-[12px] font-medium uppercase tracking-[0.2em] text-slate-400 md:block"
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            Drag →
          </motion.p>
        </div>

        <div className="relative mt-10 md:mt-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[color-mix(in_srgb,var(--app-mist)_100%,white)] to-transparent md:w-20"
          />
          <motion.div
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-7 [&::-webkit-scrollbar]:hidden"
            drag="x"
            dragConstraints={{ left: -480, right: 0 }}
            dragElastic={0.08}
          >
            {screens.map((screen, i) => (
              <motion.article
                key={`${screen.src}-${screen.caption}`}
                className="group w-[min(72vw,240px)] shrink-0 snap-center sm:w-[220px] md:w-[240px]"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <div className="overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white p-[7px] shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                  <motion.div
                    className="relative overflow-hidden rounded-[1rem] bg-slate-100 ring-1 ring-slate-900/[0.05]"
                    style={{ aspectRatio: "9 / 19.2" }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 380, damping: 24 }}
                  >
                    <ScreenImage src={screen.src} alt={screen.caption} className="h-full w-full object-cover object-top" />
                  </motion.div>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <span
                    className="mt-0.5 font-mono text-[11px] font-semibold tabular-nums tracking-wider"
                    style={{ color: palette.accent }}
                  >
                    {screen.index ?? String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[13px] leading-snug text-slate-700">{screen.caption}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[color-mix(in_srgb,var(--app-mist)_100%,white)] to-transparent md:w-20"
          />
        </div>
      </motion.div>
    </section>
  );
}

function PortfolioNoteCardLight({
  note,
  platform,
  palette,
  compact,
}: {
  note: string;
  platform: string;
  palette: MiniCasePalette;
  compact?: boolean;
}) {
  return (
    <motion.div
      className={`flex gap-4 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm backdrop-blur-sm ${
        compact ? "flex-row items-start" : "flex-col sm:flex-row sm:items-start"
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <motion.div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50"
        style={{ color: palette.accent }}
        aria-hidden
        whileHover={{ scale: 1.05 }}
      >
        <Layers className="h-5 w-5" strokeWidth={1.5} />
      </motion.div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Screen Archive</p>
        <p className="mt-1 text-[14px] font-semibold leading-snug text-slate-900">界面截屏 · 案例实录展示</p>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{note}</p>
        <p className="mt-2 font-mono text-[11px] tracking-wide text-slate-400">{platform}</p>
      </div>
    </motion.div>
  );
}

function CapabilitiesAppSection({ items, palette }: { items: readonly MiniCapability[]; palette: MiniCasePalette }) {
  return (
    <section id="app-capabilities" className="scroll-mt-8 border-t border-slate-200/90 bg-white px-5 py-16 md:px-10 md:py-20">
      <motion.div className="mx-auto max-w-[1200px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">03 · Capabilities</p>
        <h2 className="mt-2 text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-tight text-slate-900">从界面归纳的能力点</h2>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-slate-600">
          以下根据交付截屏中的信息架构与模块归纳，用于说明产品能力边界（非运营数据承诺）。
        </p>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {items.map((item, i) => (
            <motion.li
              key={item.title}
              className="border border-slate-200/90 bg-[color-mix(in_srgb,var(--app-paper)_100%,white)] p-6 transition-colors hover:border-slate-300 hover:shadow-md"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <span
                className="font-mono text-[11px] font-semibold tabular-nums tracking-wider"
                style={{ color: palette.accent }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[17px] font-bold tracking-tight text-slate-900">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{item.description}</p>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}

function FlowAppSection({ steps, palette }: { steps: NonNullable<AppCase["flowSteps"]>; palette: MiniCasePalette }) {
  return (
    <section className="border-t border-slate-200/90 bg-slate-50/80 px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">04 · Journey</p>
        <h2 className="mt-2 text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-tight text-slate-900">体验动线</h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              className="relative border-t border-slate-200 pt-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <span className="font-mono text-[clamp(3rem,8vw,4.5rem)] font-extralight leading-none tracking-tight text-slate-200" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="-mt-6 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-600">{step.description}</p>
              <motion.span
                className="mt-5 inline-block h-px w-12"
                style={{ backgroundColor: palette.accent }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.05 }}
              />
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PaletteAppSection({ palette }: { palette: MiniCasePalette }) {
  const swatches = [
    { hex: palette.paper, label: "界面底 / 留白" },
    { hex: palette.mist, label: "卡片 / 分隔" },
    { hex: palette.accent, label: "主色 / 按钮" },
    { hex: palette.ink, label: "深色 / 正文" },
  ];
  return (
    <section id="app-palette" className="scroll-mt-8 border-t border-slate-200/90 bg-white px-5 py-16 md:px-10 md:py-20">
      <motion.div
        className="mx-auto max-w-[1200px]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">05 · Palette</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-[1.65rem]">界面色彩</h2>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          {swatches.map((s, i) => (
            <motion.li
              key={s.label}
              className="overflow-hidden border border-slate-200 bg-white"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="aspect-[4/3] w-full" style={{ backgroundColor: s.hex }} aria-hidden />
              <motion.div className="border-t border-slate-100 px-3 py-3" whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                <p className="text-[12px] font-semibold text-slate-900">{s.label}</p>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-500">{s.hex}</p>
              </motion.div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}

type RelatedAppCard = {
  id: string;
  title: string;
  line: string;
  image: string;
  href: string | null;
  current: boolean;
};

function buildRelatedAppCases(current: AppCase): RelatedAppCard[] {
  const lineShort = (t: string) => t.replace(/\s*\/\s*/g, " · ");
  const first: RelatedAppCard = {
    id: current.slug,
    title: current.heroTitle,
    line: lineShort(resolveAppTagline(current)),
    image: current.coverImage,
    href: null,
    current: true,
  };
  const others = APP_CASES.filter((c) => c.slug !== current.slug)
    .slice(0, 2)
    .map((c) => ({
      id: c.slug,
      title: c.heroTitle,
      line: lineShort(resolveAppTagline(c)),
      image: c.coverImage,
      href: `/app/${c.slug}`,
      current: false,
    }));
  return [first, ...others].slice(0, 3);
}

export function AppCaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const caseData = getAppCaseBySlug(slug);
  const site = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || DEFAULT_SITE;

  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.35], [0, 36]);
  const heroFade = useTransform(scrollYProgress, [0, 0.25], [1, 0.92]);

  const palette = useMemo(() => (caseData ? resolveAppPalette(caseData) : null), [caseData]);
  const related = useMemo(() => (caseData ? buildRelatedAppCases(caseData) : []), [caseData]);

  if (!caseData || !palette) {
    return <Navigate to={homeHash.work} replace />;
  }

  const ink =
    typeof palette.ink === "string" && palette.ink.startsWith("color-mix") ? "#0f172a" : palette.ink;

  const docTitle = caseData.seoTitle ?? `${caseData.heroTitle} — App 案例 | 灵壳 LINGKE`;
  const seoDescription = resolveAppSeoDescription(caseData);
  const tagline = resolveAppTagline(caseData);
  const locationLine = resolveAppLocationLine(caseData);
  const canonical = `${site}/app/${caseData.slug}`;
  const ogImage = absoluteUrl(caseData.coverImage, site);
  const portfolioNote = resolveAppPortfolioNote(caseData);
  const screens = caseData.screens ?? [];
  const capabilities = caseData.capabilities ?? [];
  const flowSteps = caseData.flowSteps ?? [];

  const caseSchema = buildCaseStudySchemaGraph({
    name: docTitle,
    breadcrumbName: caseData.heroTitle,
    description: seoDescription,
    url: canonical,
    image: ogImage,
    categoryLabel: "App 开发案例",
  });

  return (
    <>
      <JsonLd data={caseSchema} />
      <Helmet prioritizeSeoTags>
        <title>{docTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="灵壳 LINGKE" />
        <meta property="og:title" content={docTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:locale" content="zh_CN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={docTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="theme-color" content={caseData.themeColor ?? palette.accent} />
      </Helmet>

      <article
        className="relative min-h-dvh overflow-x-hidden text-slate-900"
        style={
          {
            ["--app-paper" as string]: palette.paper,
            ["--app-mist" as string]: palette.mist,
            ["--app-accent" as string]: palette.accent,
            ["--app-ink" as string]: ink,
            backgroundColor: palette.paper,
          } as CSSProperties
        }
      >
        <HomeHashLink
          to={homeHash.work}
          className="fixed left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-[10100] text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 hover:text-slate-800 md:left-8"
        >
          ← 作品
        </HomeHashLink>

        <section className="relative min-h-[100dvh] overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 90% 65% at 80% 12%, ${palette.accent}22 0%, transparent 52%),
                radial-gradient(ellipse 55% 50% at 12% 88%, ${palette.mist} 0%, transparent 48%),
                linear-gradient(180deg, ${palette.paper} 0%, color-mix(in srgb, ${palette.mist} 88%, white) 55%, ${palette.mist} 100%)`,
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-[18%] top-[8%] h-[50vh] w-[50vh] rounded-full blur-[100px] opacity-50"
            style={{ backgroundColor: `${palette.accent}28` }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.5, 0.35] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-[1] mx-auto grid min-h-[100dvh] max-w-[1500px] grid-cols-1 items-center gap-12 px-5 pb-20 pt-[max(3.5rem,env(safe-area-inset-top))] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-8 lg:px-12 lg:pb-24 xl:px-16">
            <motion.div style={{ y: heroParallax, opacity: heroFade }} className="order-2 max-w-xl lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm backdrop-blur-sm"
              >
                <LayoutGrid className="h-3.5 w-3.5" style={{ color: palette.accent }} aria-hidden />
                {caseData.platform}
                {caseData.categoryLabel ? (
                  <>
                    <span className="text-slate-300" aria-hidden>
                      ·
                    </span>
                    <span>{caseData.categoryLabel}</span>
                  </>
                ) : null}
              </motion.div>

              <p className="mt-6 flex items-center gap-2 text-[13px] font-medium text-slate-600">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: palette.accent }} aria-hidden />
                <span>{locationLine}</span>
              </p>

              <h1 className="mt-5 font-sans text-[clamp(2.1rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-slate-900">
                {caseData.heroTitle}
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">{tagline}</p>

              <motion.div className="mt-10 flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <a
                  href="#app-screens"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-7 text-[13px] font-semibold text-white shadow-md transition-opacity hover:opacity-90"
                  style={{ backgroundColor: palette.accent }}
                >
                  浏览界面截屏
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
                <HomeHashLink
                  to={homeHash.contact}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300 bg-white/80 px-7 text-[13px] font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                >
                  咨询同类项目
                </HomeHashLink>
              </motion.div>

              <motion.div className="mt-12 hidden max-w-sm lg:block">
                <PortfolioNoteCardLight note={portfolioNote} palette={palette} platform={caseData.platform} compact />
              </motion.div>
            </motion.div>

            <motion.div
              className="order-1 flex justify-center lg:order-2 lg:justify-end"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            >
              <PhoneFrameLight src={caseData.coverImage} alt={`${caseData.heroTitle}主界面`} palette={palette} />
            </motion.div>
          </div>

          <motion.div
            aria-hidden
            className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-slate-400"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.3em]">Scroll</span>
            <span className="h-8 w-px bg-gradient-to-b from-slate-300 to-transparent" />
          </motion.div>
        </section>

        {screens.length > 0 ? <AppFilmStripSection screens={screens} palette={palette} title={caseData.heroTitle} /> : null}

        {capabilities.length > 0 ? <CapabilitiesAppSection items={capabilities} palette={palette} /> : null}

        {flowSteps.length > 0 ? <FlowAppSection steps={flowSteps} palette={palette} /> : null}

        <PaletteAppSection palette={palette} />

        {related.length > 1 ? (
          <section className="border-t border-slate-200 bg-slate-50 px-5 py-16 md:px-10 md:py-20">
            <motion.div className="mx-auto max-w-[1200px]" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">更多 App 案例</h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {related.map((item) => {
                  const inner = (
                    <>
                      <div className="absolute inset-0 bg-slate-200" aria-hidden />
                      <img
                        src={item.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                      <motion.div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" whileHover={{ opacity: 0.95 }} />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                          {item.current ? "CURRENT" : "APP"}
                        </p>
                        <p className="mt-1 text-lg font-bold text-white">{item.title}</p>
                        <p className="mt-1 text-[13px] text-white/85">{item.line}</p>
                      </div>
                    </>
                  );
                  const cardClass =
                    "group relative block aspect-[4/5] overflow-hidden border border-slate-200 bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15";
                  if (item.href) {
                    return (
                      <Link key={item.id} to={item.href} className={cardClass}>
                        {inner}
                      </Link>
                    );
                  }
                  return (
                    <motion.div key={item.id} className={cardClass} whileHover={{ y: -2 }}>
                      {inner}
                    </motion.div>
                  );
                })}
              </div>
              <HomeHashLink
                to={homeHash.work}
                className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-slate-800 hover:text-slate-950"
              >
                返回全部作品
                <ArrowRight className="h-4 w-4" aria-hidden />
              </HomeHashLink>
            </motion.div>
          </section>
        ) : null}

        <SiteFooter />
      </article>
    </>
  );
}
