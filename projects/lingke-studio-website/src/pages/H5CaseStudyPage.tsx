/**
 * H5 案例子页 —— 数据 `src/data/h5Cases.ts`，路由 `/h5/:slug`。
 * 视觉与 App / 小程序案例区分：深色基调、Hero 展台式画幅编排、静态栅格与编辑型分栏。
 */
import { type CSSProperties } from "react";
import { Helmet } from "react-helmet-async";
import { JsonLd } from "../components/JsonLd";
import { buildCaseStudySchemaGraph } from "../lib/schemaMarkup";
import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clapperboard, Globe, Sparkles } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { getH5CaseBySlug, type H5Case, type H5Screen } from "../data/h5Cases";
import { homeHash, HomeHashLink } from "../lib/homeNav";

const DEFAULT_SITE = "https://lingke.studio";

function absoluteUrl(path: string, base: string) {
  if (path.startsWith("http")) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function HeroShowcase({
  coverImage,
  coverAlt,
  secondary,
  glowCenter = "rgba(251, 113, 133, 0.14)",
}: {
  coverImage: string;
  coverAlt: string;
  secondary: readonly H5Screen[];
  glowCenter?: string;
}) {
  return (
    <motion.div
      className="relative isolate w-full max-w-[min(100%,400px)] justify-self-center lg:max-w-[440px] lg:justify-self-end"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-12 rounded-[2.75rem] blur-2xl"
        style={{
          backgroundImage: `radial-gradient(ellipse 72% 60% at 50% 45%, ${glowCenter}, transparent 68%)`,
        }}
      />
      <div className="relative rounded-[1.75rem] bg-[#090909] p-3 shadow-[0_36px_80px_-36px_rgba(0,0,0,0.92),inset_0_1px_0_0_rgba(255,255,255,0.055)] ring-1 ring-zinc-800/75 md:rounded-[2rem] md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-4">
          <div className="relative shrink-0 overflow-hidden rounded-xl bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
            <div className="relative mx-auto aspect-[9/16] w-[min(100%,280px)] max-h-[min(54vh,520px)] md:mx-0 md:w-[258px] lg:w-[274px]">
              <img src={coverImage} alt={coverAlt} className="h-full w-full object-cover object-top" loading="eager" decoding="async" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/[0.12]" aria-hidden />
            </div>
          </div>
          {secondary.length > 0 ? (
            <div className="flex min-h-0 flex-1 flex-row gap-2.5 md:w-[120px] md:flex-col md:shrink-0 md:gap-3 lg:w-[128px]">
              {secondary.map((shot, i) => (
                <motion.div
                  key={shot.src}
                  className="relative min-h-[112px] min-w-0 flex-1 overflow-hidden rounded-xl bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.035)] ring-1 ring-zinc-800/70 md:min-h-0 md:flex-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.18 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img
                    src={shot.src}
                    alt=""
                    className="h-full w-full min-h-[112px] object-cover object-top md:absolute md:inset-0 md:min-h-0"
                    loading="lazy"
                    decoding="async"
                    aria-hidden
                  />
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function ScreenStill({ src, alt, caption, summary }: { src: string; alt: string; caption: string; summary?: string }) {
  return (
    <article className="group flex flex-col">
      <div className="overflow-hidden rounded-2xl bg-black shadow-[0_24px_48px_-32px_rgba(0,0,0,0.85)] ring-1 ring-zinc-800/55 transition-[box-shadow,ring-color] duration-300 group-hover:shadow-[0_28px_56px_-28px_rgba(0,0,0,0.9)] group-hover:ring-zinc-600/45">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[280px] bg-zinc-950">
          <img src={src} alt={alt} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
        </div>
      </div>
      <div className="mt-5 space-y-2 border-t border-zinc-800/50 pt-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--h5-accent)] opacity-80">
          Screen
        </p>
        <h3 className="text-base font-semibold tracking-tight text-zinc-100">{caption}</h3>
        {summary ? <p className="text-[13px] leading-relaxed text-zinc-500">{summary}</p> : null}
      </div>
    </article>
  );
}

function BentoCapabilities({ items }: { items: H5Case["capabilities"] }) {
  const spans = [
    "md:col-span-7",
    "md:col-span-5",
    "md:col-span-5",
    "md:col-span-7",
    "md:col-span-12",
  ];
  return (
    <section className="relative border-t border-white/[0.08] px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">03 · Capabilities</p>
        <h2 className="mt-3 max-w-xl text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-white">
          能力拆解
        </h2>
        <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-zinc-400">
          以 H5 投放链路为主轴归纳模块边界，便于后续接真实接口与多语言文案。
        </p>
        <ul className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
          {items.map((item, i) => (
            <motion.li
              key={item.title}
              className={`rounded-2xl border border-white/[0.08] bg-zinc-900/90 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] md:p-8 ${spans[i % spans.length]}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-24px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
            >
              <span className="font-mono text-[11px] text-[color:var(--h5-accent)] opacity-90">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-xl font-semibold text-zinc-50">{item.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">{item.description}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function H5CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const data = getH5CaseBySlug(slug);
  const site = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || DEFAULT_SITE;

  if (!data) {
    return <Navigate to={homeHash.work} replace />;
  }

  const docTitle = data.seoTitle ?? "H5 案例 | 灵壳 LINGKE";
  const seoDescription =
    data.seoDescription ?? "灵壳 LINGKE H5 与活动页案例 — 全机型适配、动效叙事与投放转化。";

  const canonical = `${site}/h5/${data.slug}`;
  const ogImage = absoluteUrl(data.coverImage, site);
  const heroBadge = data.heroBadge ?? { line1: "H5 · Campaign", line2: "Overseas" };
  const accent = data.accentColor ?? "#fb7185";

  const caseSchema = buildCaseStudySchemaGraph({
    name: docTitle,
    breadcrumbName: data.heroTitle,
    description: seoDescription,
    url: canonical,
    image: ogImage,
    categoryLabel: "H5 开发案例",
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
        <meta name="theme-color" content={data.themeColor ?? "#0a0a0a"} />
      </Helmet>

      <article
        className="relative min-h-dvh overflow-x-hidden bg-[#030303] text-zinc-100"
        style={
          {
            ["--h5-accent" as string]: accent,
          } as CSSProperties
        }
      >
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(251,113,133,0.22), transparent),
              radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139,92,246,0.12), transparent),
              radial-gradient(ellipse 50% 30% at 0% 100%, rgba(34,211,238,0.08), transparent)`,
          }}
          aria-hidden
        />
        <HomeHashLink
          to={homeHash.work}
          className="fixed left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-[10100] text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500 transition-colors hover:text-zinc-200 md:left-8"
        >
          ← 作品
        </HomeHashLink>

        <header className="relative overflow-hidden px-5 pb-16 pt-[max(4.25rem,env(safe-area-inset-top))] md:px-12 md:pb-20 lg:pb-24">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_100%_0%,rgba(251,113,133,0.07),transparent_50%)]"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:gap-16 xl:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-zinc-800/90 bg-zinc-900/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <Clapperboard className="h-4 w-4 shrink-0 text-[color:var(--h5-accent)]" aria-hidden />
                {heroBadge.line1}
                <span className="text-zinc-600">/</span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-[color:var(--h5-accent)] opacity-80" aria-hidden />
                  {heroBadge.line2}
                </span>
              </div>
              <h1 className="mt-6 max-w-[14ch] text-[clamp(2.35rem,6.5vw,4.1rem)] font-bold leading-[0.96] tracking-[-0.02em] text-white md:mt-7">
                {data.heroTitle}
              </h1>
              <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.22em] text-zinc-500 md:text-[13px]">{data.heroLead}</p>
              <p className="mt-7 max-w-xl text-[15px] leading-[1.65] text-zinc-400 md:mt-8 md:text-[16px]">{data.tagline}</p>
              <motion.div
                className="mt-10 flex flex-wrap gap-3 md:mt-11"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
              >
                <a
                  href="#h5-frames"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[color:var(--h5-accent)] px-8 text-[13px] font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.99]"
                  style={{
                    boxShadow: `0 0 40px -10px color-mix(in srgb, ${accent} 52%, transparent)`,
                  }}
                >
                  查看界面
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
                <HomeHashLink
                  to={homeHash.contact}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-zinc-600/90 bg-zinc-900/90 px-8 text-[13px] font-semibold text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800/90"
                >
                  委托同类 H5
                </HomeHashLink>
              </motion.div>
            </motion.div>

            <HeroShowcase
              coverImage={data.coverImage}
              coverAlt={`${data.heroTitle} 案例主视觉`}
              secondary={data.screens.slice(1, 3)}
              glowCenter={data.heroGlow}
            />
          </div>

          <div className="pointer-events-none mt-12 flex flex-col items-center gap-2 text-zinc-600 lg:absolute lg:bottom-8 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.35em]">Scroll</span>
            <span className="h-8 w-px bg-gradient-to-b from-zinc-500 to-transparent" />
          </div>
        </header>

        <section className="relative border-t border-white/[0.07] px-5 py-20 md:px-12 md:py-28" aria-labelledby="h5-editorial-heading">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">01 · Editorial</p>
                <h2 id="h5-editorial-heading" className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  设计立场
                </h2>
              </div>
              <Sparkles className="hidden h-8 w-8 text-[color:var(--h5-accent)] opacity-40 md:block" aria-hidden />
            </div>
            <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              {data.editorial.map((block) => (
                <div
                  key={block.kicker}
                  className="border-l pl-6"
                  style={{ borderLeftWidth: 1, borderColor: "color-mix(in srgb, var(--h5-accent) 50%, transparent)" }}
                >
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--h5-accent)]">
                    {block.kicker}
                  </p>
                  <p className="mt-4 text-[14px] leading-relaxed text-zinc-400">{block.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="h5-frames"
          className="relative scroll-mt-10 border-t border-white/[0.07] bg-[#050505] px-5 py-14 md:px-12 md:py-16"
          aria-labelledby="h5-frames-heading"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">02 · Screens</p>
            <h2 id="h5-frames-heading" className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              关键界面
            </h2>
            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-zinc-400 md:text-[15px]">
              竖屏截屏平铺展示，无设备外壳，便于对照线上样式。
            </p>
            <div className="mt-10 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-3 lg:gap-8 xl:grid-cols-5">
              {data.screens.map((s) => (
                <ScreenStill key={s.src} src={s.src} alt={s.caption} caption={s.caption} summary={s.summary} />
              ))}
            </div>
          </div>
        </section>

        <BentoCapabilities items={data.capabilities} />

        <section className="border-t border-white/[0.08] px-5 py-20 md:px-12 md:py-24">
          <div className="mx-auto max-w-[720px]">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">04 · Deliverables</p>
            <h2 className="mt-3 text-2xl font-bold text-white">交付清单（可裁剪）</h2>
            <ul className="mt-10 space-y-4">
              {data.deliverables.map((line) => (
                <li
                  key={line}
                  className="border-l-2 pl-5 text-[14px] leading-relaxed text-zinc-300"
                  style={{ borderLeftColor: "color-mix(in srgb, var(--h5-accent) 65%, transparent)" }}
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <SiteFooter />
      </article>
    </>
  );
}
