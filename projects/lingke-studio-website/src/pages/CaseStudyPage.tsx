/**
 * 网站定制案例 —— 单一模版，数据驱动：`src/data/workCases.ts`。
 * 路由：`/work/:slug`。新增案例只改数据 + 上传 public 配图。
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { JsonLd } from "../components/JsonLd";
import { buildCaseStudySchemaGraph } from "../lib/schemaMarkup";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Plus } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import {
  getWorkCaseBySlug,
  mergeCoverPalette,
  resolveHeroAtmosphere,
  resolveLocationLine,
  resolvePalette,
  resolveSeoDescription,
  resolveTagline,
  resolveVisualIdentity,
  WORK_CASES,
  type CasePalette,
  type ResolvedVisualIdentity,
  type WorkCase,
} from "../data/workCases";
import { extractPaletteFromCover } from "../lib/extractPaletteFromCover";
import { homeHash, HomeHashLink } from "../lib/homeNav";
import { useSiteContact } from "../context/SiteSettingsContext";

const DEFAULT_SITE = "https://lingke.studio";
const DISCLAIMER_PHONE = "029-88661315";

function absoluteUrl(path: string, base: string) {
  if (path.startsWith("http")) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function scrollToVisualIdentity() {
  document.getElementById("visual-identity")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function DeviceFrame({ src, alt, palette }: { src: string; alt: string; palette: CasePalette }) {
  return (
    <div className="relative mx-auto flex w-full max-w-[min(100%,min(96vw,760px))] justify-center lg:mx-0 lg:max-w-[min(100%,min(62vw,980px))] xl:max-w-[min(100%,1040px)] lg:justify-end">
      <div className="relative w-full [transform-style:preserve-3d]" style={{ perspective: "1400px" }}>
        <motion.div
          initial={{ opacity: 0, rotateY: -14, x: 28 }}
          animate={{ opacity: 1, rotateY: -7, x: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative origin-center will-change-transform max-lg:[transform:none] lg:[transform:rotateY(-7deg)_rotateX(3deg)]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -left-[8%] -right-[8%] -top-[8%] bottom-[6%] -z-10 opacity-70 blur-3xl"
            style={{
              background: `radial-gradient(ellipse 50% 42% at 55% 38%, ${palette.cinnabar}40 0%, transparent 58%)`,
            }}
          />
          <div
            className="rounded-lg p-[7px] shadow-[0_24px_70px_-30px_rgba(0,0,0,0.55)] md:rounded-xl md:p-[9px]"
            style={{
              background: `linear-gradient(145deg, ${palette.cinnabar} 0%, color-mix(in srgb, ${palette.cinnabar} 58%, black) 30%, color-mix(in srgb, ${palette.cinnabar} 22%, black) 72%, #141110 100%)`,
              boxShadow: `0 0 0 1px ${palette.brass}33 inset, 0 24px 60px -12px rgba(0,0,0,0.5)`,
            }}
          >
            <div className="overflow-hidden rounded-md ring-1 ring-black/60 md:rounded-lg" style={{ background: "#0a0908" }}>
              <img
                src={src}
                alt={alt}
                width={1600}
                height={1000}
                className="block h-auto w-full object-cover object-top"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function VisualIdentitySection({ visual }: { visual: ResolvedVisualIdentity }) {
  return (
    <section
      id="visual-identity"
      className="scroll-mt-6 border-b border-zinc-200/80 bg-white px-6 py-16 md:px-10 md:py-20"
      aria-labelledby="visual-identity-heading"
    >
      <div className="mx-auto max-w-[1400px]">
        <p className="font-sans text-[13px] font-normal tracking-wide text-zinc-500">{visual.sectionEyebrow}</p>
        <h2 id="visual-identity-heading" className="mt-2 text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-tight text-zinc-950">
          {visual.sectionTitle}
        </h2>

        <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-16">
          <div className="relative flex flex-col gap-10 sm:flex-row sm:items-start">
            <div
              className="select-none font-sans text-[clamp(6rem,22vw,11rem)] font-extralight leading-none tracking-tight text-transparent sm:text-[clamp(7rem,14vw,10.5rem)]"
              style={{
                WebkitTextStroke: "1.5px rgba(228, 228, 228, 0.95)",
                textShadow: "0 1px 0 rgba(0,0,0,0.04)",
              }}
              aria-hidden
            >
              Aa
            </div>
            <div className="min-w-0 flex-1 space-y-10 pt-1 sm:pt-4">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-zinc-400">{visual.cnTypefaceLabel}</p>
                <p
                  className="mt-2 font-sans text-2xl font-semibold tracking-tight text-zinc-900"
                  style={{ fontFamily: visual.cnTypefaceCss }}
                >
                  {visual.cnTypefaceName}
                </p>
                <p className="mt-3 font-sans text-[13px] tabular-nums tracking-wide text-zinc-500">{visual.cnScaleLine}</p>
              </div>
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-zinc-400">{visual.enTypefaceLabel}</p>
                <p
                  className="mt-2 font-sans text-2xl font-semibold tracking-tight text-zinc-900"
                  style={{ fontFamily: visual.enTypefaceCss }}
                >
                  {visual.enTypefaceName}
                </p>
                <p className="mt-3 font-sans text-[13px] tabular-nums tracking-wide text-zinc-500">{visual.enScaleLine}</p>
              </div>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:gap-5" role="list">
            {visual.swatches.map((s) => (
              <li key={`${s.label}-${s.hex}`} className="flex flex-col overflow-hidden border border-zinc-200">
                <div className="aspect-[5/3] w-full shrink-0" style={{ backgroundColor: s.hex }} aria-hidden />
                <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 sm:py-3.5">
                  <p className="text-[13px] font-semibold leading-snug text-zinc-900">{s.label}</p>
                  <p className="mt-1 font-mono text-[12px] font-medium uppercase tracking-wider text-zinc-500">{s.hex}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CaseDisclaimerSection() {
  return (
    <section className="border-t border-zinc-200/80 bg-white px-6 py-14 md:px-10 md:py-16" aria-labelledby="case-disclaimer-heading">
      <div className="mx-auto max-w-[720px]">
        <h2 id="case-disclaimer-heading" className="sr-only">
          网站使用声明
        </h2>
        <div className="space-y-4 text-[14px] leading-[1.85] text-zinc-500 md:text-[15px]">
          <p className="font-semibold text-zinc-700">非常感谢您访问我们的网站</p>
          <p className="font-medium text-zinc-600">在您使用本网站之前，请您仔细阅读本声明的所有条款。</p>
          <ol className="list-decimal space-y-3 pl-5 marker:text-zinc-400">
            <li>本站部分内容来源自网络，涉及到图片版权属于原作者。</li>
            <li>本站不承担用户因使用这些资源对自己和他人造成任何形式的损失或伤害。</li>
            <li>如果侵害了您的权益，请您及时与我们联系，我们会在第一时间删除相关内容！</li>
          </ol>
          <p className="pt-2 text-zinc-600">
            联系方式：
            <a
              href={`tel:${DISCLAIMER_PHONE.replace(/-/g, "")}`}
              className="ml-1 font-semibold text-zinc-800 underline decoration-zinc-300 underline-offset-2 hover:decoration-[#C5A059]"
            >
              {DISCLAIMER_PHONE}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

const FALLBACK_RELATED = [
  {
    id: "showroom",
    title: "灵壳数字化展厅",
    line: "3D 叙事与性能优化",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=82",
    href: homeHash.work,
  },
  {
    id: "brand",
    title: "科技品牌官网重塑",
    line: "设计系统一体落地",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=82",
    href: homeHash.work,
  },
] as const;

type RelatedCaseCard = {
  id: string;
  title: string;
  line: string;
  image: string;
  href: string | null;
  current: boolean;
};

function buildRelatedCases(current: WorkCase): RelatedCaseCard[] {
    const lineShort = (t: string) => t.replace(/\s*\/\s*/g, " · ");
    const first: RelatedCaseCard = {
      id: current.slug,
      title: current.heroTitle,
      line: lineShort(resolveTagline(current)),
    image: current.coverImage,
    href: null,
    current: true,
  };
  const others: RelatedCaseCard[] = WORK_CASES.filter((c) => c.slug !== current.slug)
    .slice(0, 2)
    .map((c) => ({
      id: c.slug,
      title: c.heroTitle,
      line: lineShort(resolveTagline(c)),
      image: c.coverImage,
      href: `/work/${c.slug}`,
      current: false,
    }));
  const pad: RelatedCaseCard[] = FALLBACK_RELATED.filter((_, i) => i < 2 - others.length).map((p) => ({
    id: p.id,
    title: p.title,
    line: p.line,
    image: p.image,
    href: p.href,
    current: false,
  }));
  const rest = [...others, ...pad].slice(0, 2);
  return [first, ...rest];
}

export function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const { phone: sitePhone } = useSiteContact();
  const caseData = getWorkCaseBySlug(slug);
  const site = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || DEFAULT_SITE;
  const [coverPalette, setCoverPalette] = useState<CasePalette | null | undefined>(undefined);

  useEffect(() => {
    if (!caseData?.paletteFromCover) {
      setCoverPalette(undefined);
      return;
    }
    let cancelled = false;
    setCoverPalette(undefined);
    void extractPaletteFromCover(caseData.coverImage).then((p) => {
      if (!cancelled) setCoverPalette(p);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, caseData?.paletteFromCover, caseData?.coverImage]);

  const basePalette = useMemo(() => (caseData ? resolvePalette(caseData) : null), [caseData]);
  const palette = useMemo(() => {
    if (!caseData || !basePalette) return null;
    if (caseData.paletteFromCover && coverPalette) return mergeCoverPalette(caseData, coverPalette);
    return basePalette;
  }, [caseData, basePalette, coverPalette]);
  const visual = useMemo(
    () => (caseData && palette ? resolveVisualIdentity(caseData, palette) : null),
    [caseData, palette],
  );
  const heroAtm = useMemo(
    () => (caseData && palette ? resolveHeroAtmosphere(caseData, palette) : null),
    [caseData, palette],
  );
  const related = useMemo(() => (caseData ? buildRelatedCases(caseData) : []), [caseData]);

  if (!caseData || !palette || !visual || !heroAtm) {
    return <Navigate to={homeHash.work} replace />;
  }

  const liveDisplay = caseData.liveUrl.replace(/\/$/, "");
  const canonical = `${site}/work/${caseData.slug}`;
  const ogImage = absoluteUrl(caseData.coverImage, site);
  const docTitle = caseData.seoTitle ?? `${caseData.heroTitle} — 网站定制案例 | 灵壳 LINGKE`;
  const seoDescription = resolveSeoDescription(caseData);
  const tagline = resolveTagline(caseData);
  const locationLine = resolveLocationLine(caseData);
  const metaRows =
    caseData.metaRows ??
    ([
      { label: "客户 / 行业", value: caseData.heroTitle },
      { label: "交付", value: "定制官网" },
      { label: "灵壳角色", value: "设计 · 前端体验 · 交付协同" },
    ] satisfies WorkCase["metaRows"]);

  const caseSchema = buildCaseStudySchemaGraph({
    name: docTitle,
    breadcrumbName: caseData.heroTitle,
    description: seoDescription,
    url: canonical,
    image: ogImage,
    categoryLabel: "网站定制案例",
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
        <meta name="theme-color" content={caseData.themeColor ?? "#1c1715"} />
      </Helmet>

      <article
        className="relative min-h-dvh overflow-x-hidden text-zinc-900"
        style={
          {
            backgroundColor: caseData.themeColor ?? "#1c1715",
            ["--case-paper" as string]: palette.paper,
          } as CSSProperties
        }
      >
        <HomeHashLink
          to={homeHash.work}
          className="fixed left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-[10100] text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-800/90 hover:text-zinc-950 md:left-8 md:text-[12px]"
        >
          ← 作品
        </HomeHashLink>

        <section className="relative min-h-[100dvh] overflow-hidden border-b border-black/25">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 min-h-[100dvh]"
            style={{ background: heroAtm.baseGradient }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[25%] top-0 min-h-[70vh] w-[75%]"
            style={{
              opacity: heroAtm.accentOpacity,
              background: heroAtm.accentRadial,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 min-h-[100dvh] opacity-[0.12]"
            style={{ background: heroAtm.vignette }}
          />

          <div className="relative z-[1] mx-auto grid min-h-[100dvh] max-w-[1680px] grid-cols-1 items-center gap-y-12 px-5 pb-20 pt-[max(3.25rem,env(safe-area-inset-top))] md:gap-y-14 md:px-10 md:pb-24 md:pt-[max(3.5rem,env(safe-area-inset-top))] lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)] lg:gap-x-0 lg:gap-y-0 lg:px-12 lg:pb-28 xl:px-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="order-2 max-w-[32rem] lg:order-1 lg:border-r lg:border-black/[0.08] lg:pr-14 xl:max-w-[34rem] xl:pr-20"
            >
              <p className="flex items-center gap-2 text-[13px] font-medium text-zinc-700">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: palette.cinnabar }} aria-hidden />
                <span>{locationLine}</span>
              </p>
              <h1 className="mt-7 font-sans text-[clamp(2.5rem,5.8vw,4rem)] font-bold leading-[1.04] tracking-tight text-zinc-950">
                {caseData.heroTitle}
              </h1>
              <p className="mt-4 max-w-[22rem] text-[14px] font-normal leading-relaxed tracking-wide text-zinc-700 md:text-[15px]">
                {tagline}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={caseData.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={liveDisplay}
                  aria-label={`进入${caseData.heroTitle}官网（${liveDisplay}）`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-zinc-900 bg-transparent px-8 py-2.5 text-[13px] font-semibold tracking-wide text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-[var(--case-paper)]"
                >
                  进入官网<span aria-hidden>→</span>
                </a>
                <HomeHashLink
                  to={homeHash.contact}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-zinc-900 bg-transparent px-8 py-2.5 text-[13px] font-semibold tracking-wide text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-[var(--case-paper)]"
                >
                  在线咨询<span aria-hidden>→</span>
                </HomeHashLink>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                <button
                  type="button"
                  onClick={scrollToVisualIdentity}
                  className="text-left text-[13px] font-medium text-zinc-700 underline decoration-zinc-500/60 decoration-1 underline-offset-[6px] transition-colors hover:text-zinc-950 hover:decoration-zinc-950"
                >
                  视觉规范<span aria-hidden>→</span>
                </button>
                <span className="text-[11px] leading-relaxed text-zinc-600">外站新窗口 · 内容以外站为准</span>
              </div>

              <div className="mt-14 grid max-w-lg grid-cols-[5.5rem_1fr] gap-6 border-t border-zinc-900/12 pt-10">
                <div className="flex aspect-square w-[5.5rem] items-center justify-center border border-dashed border-zinc-800/35 text-center text-[9px] font-medium uppercase leading-snug tracking-wide text-zinc-500">
                  QR
                  <br />
                  待置
                </div>
                <div>
                  <p className="text-[13px] font-medium text-zinc-800">扫码预约顾问沟通</p>
                  <p className="mt-1 text-[12px] text-zinc-600">亦可直接致电下方专线</p>
                </div>
              </div>

              <div className="mt-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">立即咨询</p>
                <a
                  href={`tel:${sitePhone.replace(/\s/g, "")}`}
                  className="mt-2 block font-sans text-[clamp(1.5rem,4vw,2.125rem)] font-bold tabular-nums tracking-tight text-zinc-950 transition-opacity hover:opacity-70"
                >
                  {sitePhone}
                </a>
              </div>
            </motion.div>

            <div className="order-1 flex min-h-[min(52vh,520px)] items-center justify-center lg:order-2 lg:min-h-0 lg:pl-6 xl:pl-10">
              <DeviceFrame
                src={caseData.coverImage}
                alt={`${caseData.heroTitle}官网首页展示`}
                palette={palette}
              />
            </div>
          </div>
        </section>

        <VisualIdentitySection visual={visual} />

        <section
          className="border-y border-zinc-200 px-6 py-12 md:px-10 md:py-14"
          style={{ backgroundColor: `color-mix(in srgb, ${palette.paper} 88%, ${palette.mist})` }}
        >
          <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
            {metaRows.map((item, i) => (
              <div key={item.label} className={`min-w-0 flex-1 ${i > 0 ? "md:border-l md:border-zinc-200 md:pl-12" : ""}`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">{item.label}</p>
                <p className="mt-2 text-[15px] font-semibold leading-snug text-zinc-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="px-6 py-16 md:px-10 md:py-24"
          style={{ backgroundColor: `color-mix(in srgb, ${palette.mist} 82%, ${palette.paper})` }}
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-[1.65rem]">相关探索</h2>
              <HomeHashLink
                to={homeHash.work}
                className="inline-flex items-center gap-2 self-start rounded-full bg-zinc-900 px-5 py-2.5 text-[12px] font-semibold tracking-wide text-white transition-colors hover:bg-black sm:self-auto"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                浏览全部案例
              </HomeHashLink>
            </div>
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {related.map((item) => {
                const inner = (
                  <>
                    <div className="absolute inset-0 z-0 bg-zinc-300" aria-hidden />
                    <img
                      src={item.image}
                      alt=""
                      className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/75 via-black/20 to-transparent" aria-hidden />
                    <div className="absolute inset-x-0 bottom-0 z-[3] p-5 md:p-6">
                      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
                        {item.current ? "CURRENT" : "WORK"}
                      </p>
                      <p className="mt-1.5 text-lg font-bold tracking-tight text-white md:text-xl">{item.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/85">{item.line}</p>
                    </div>
                    {item.current ? (
                      <span className="absolute right-4 top-4 z-[4] rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-800">
                        当前案例
                      </span>
                    ) : null}
                  </>
                );
                const cardClass =
                  "group relative block aspect-[4/3] overflow-hidden border border-zinc-300/90 bg-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ebe8e4]";
                if (item.href) {
                  if (item.href.startsWith("/work/")) {
                    return (
                      <Link key={item.id} to={item.href} className={cardClass}>
                        {inner}
                      </Link>
                    );
                  }
                  return (
                    <HomeHashLink key={item.id} to={item.href} className={cardClass}>
                      {inner}
                    </HomeHashLink>
                  );
                }
                return (
                  <div key={item.id} className={`${cardClass} cursor-default`}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <CaseDisclaimerSection />
        <SiteFooter />
      </article>
    </>
  );
}
