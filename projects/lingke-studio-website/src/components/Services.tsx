/**
 * 服务区块（#services）：四张服务卡片 + 玻璃质感 3D 图标
 * ===========================================================================
 * 【改文案 / 业务范围】改下面 `items` 数组里 title、desc、scope；不要改 id 除非同步改 `../lib/homeNav` 里 `homeHash` 与导航。
 * 【换图标】改本文件上方「玻璃图标」一节中的 SVG / Icon* 组件。
 * 【卡片动效】改 container / card 两个 Variants；hover 金边在 motion.article 的 className 里。
 * 【噪点/装饰】CARD_NOISE_BG 为内联 SVG 纹理；CardCornerDecor 为右下角线框图案（variant 0～3）。
 * 【栅格】窄屏 1 列，md 起 2 列，xl 起 4 列并排；改 className 可调整断点。
 */
import { motion, type Variants } from "framer-motion";
import { useId, type ReactNode } from "react";
import {
  fadeInUp,
  sectionEyebrowClass,
  sectionHeaderStagger,
  sectionTitleClass,
  viewportFade,
} from "../lib/motionFade";

/** 统一的立体感投影（规范给定） */
const ICON_DROP_SHADOW = "drop-shadow(0 15px 25px rgba(0, 0, 0, 0.2))";

const floatLoop = {
  y: [0, -8, 0],
  transition: { duration: 5.5, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as const },
};

function FloatWrap({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="relative mx-auto mb-8 h-[104px] w-[104px] opacity-100"
      animate={floatLoop}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

function IconStage({
  children,
  rotate3d,
}: {
  children: ReactNode;
  rotate3d?: { x?: number[]; y?: number[] };
}) {
  return (
    <motion.div
      className="flex h-full w-full items-center justify-center opacity-100"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{ filter: ICON_DROP_SHADOW }}
    >
      <div className="inline-flex" style={{ perspective: "640px" }}>
        <motion.div
          className="relative flex items-center justify-center opacity-100"
          animate={rotate3d ? { rotateX: rotate3d.x, rotateY: rotate3d.y } : undefined}
          transition={rotate3d ? { duration: 9, repeat: Infinity, ease: "easeInOut" } : undefined}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}

function IconMiniProgramTorus() {
  const uid = useId().replace(/:/g, "");
  return (
    <FloatWrap>
      <IconStage
        rotate3d={{
          x: [-6, 4, -6],
          y: [8, 18, 8],
        }}
      >
        <svg width="92" height="92" viewBox="0 0 100 100" className="overflow-visible opacity-100" aria-hidden>
          <defs>
            <linearGradient id={`${uid}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#f0f2f6" stopOpacity="1" />
              <stop offset="70%" stopColor="#d8dce3" stopOpacity="1" />
              <stop offset="100%" stopColor="#a8b0bc" stopOpacity="1" />
            </linearGradient>
            <linearGradient id={`${uid}-ring-edge`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C5A059" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#C5A059" stopOpacity="0.12" />
            </linearGradient>
            <radialGradient id={`${uid}-core`} cx="35%" cy="30%">
              <stop offset="0%" stopColor="#f0d78c" />
              <stop offset="45%" stopColor="#C5A059" />
              <stop offset="100%" stopColor="#8a6634" />
            </radialGradient>
            <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b" />
              <feOffset dx="0" dy="1" in="b" result="s" />
              <feComponentTransfer in="s">
                <feFuncA type="linear" slope="0.25" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter={`url(#${uid}-soft)`}>
            <ellipse
              cx="50"
              cy="50"
              rx="38"
              ry="15"
              fill="none"
              stroke={`url(#${uid}-ring)`}
              strokeWidth="14"
              transform="rotate(-18 50 50)"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="38"
              ry="15"
              fill="none"
              stroke={`url(#${uid}-ring-edge)`}
              strokeWidth="1.2"
              transform="rotate(-18 50 50)"
              opacity="1"
            />
          </g>
          <circle cx="50" cy="50" r="11" fill={`url(#${uid}-core)`} opacity="1" />
          <ellipse
            cx="46"
            cy="44"
            rx="5"
            ry="3"
            fill="rgba(255,255,255,0.55)"
            transform="rotate(-25 46 44)"
            opacity="1"
          />
        </svg>
      </IconStage>
    </FloatWrap>
  );
}

function IconH5MobileWeb() {
  const uid = useId().replace(/:/g, "");
  return (
    <FloatWrap>
      <IconStage
        rotate3d={{
          x: [-5, 6, -5],
          y: [9, 17, 9],
        }}
      >
        <svg width="92" height="92" viewBox="0 0 100 100" className="overflow-visible opacity-100" aria-hidden>
          <defs>
            <linearGradient id={`${uid}-glass`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#eef1f6" />
              <stop offset="100%" stopColor="#cfd5df" />
            </linearGradient>
            <linearGradient id={`${uid}-rim`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C5A059" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#C5A059" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id={`${uid}-shine`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            x="27"
            y="13"
            width="46"
            height="74"
            rx="9"
            fill={`url(#${uid}-glass)`}
            stroke={`url(#${uid}-rim)`}
            strokeWidth="1.25"
          />
          <rect x="33" y="21" width="34" height="54" rx="3.5" fill="rgba(255,255,255,0.42)" stroke="rgba(197,160,89,0.35)" strokeWidth="0.65" />
          <rect x="36" y="26" width="28" height="4" rx="1" fill="rgba(197,160,89,0.22)" />
          <path
            d="M38 38 h24 M38 46 h17 M38 54 h21 M38 62 h14"
            stroke="rgba(55,55,62,0.38)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <ellipse cx="50" cy="28" rx="5" ry="1.2" fill="rgba(40,40,45,0.2)" />
          <rect x="41" y="81" width="18" height="3.5" rx="1.75" fill="rgba(197,160,89,0.5)" />
          <path d="M30 18 L50 10 L70 18" fill="none" stroke={`url(#${uid}-shine)`} strokeWidth="1.2" opacity="0.45" />
        </svg>
      </IconStage>
    </FloatWrap>
  );
}

function IconWebsiteLayers() {
  return (
    <FloatWrap>
      <IconStage
        rotate3d={{
          x: [-10, -6, -10],
          y: [-14, -8, -14],
        }}
      >
        <div className="relative h-[76px] w-[76px] opacity-100 [transform-style:preserve-3d]">
          {[
            { z: 0, x: 0, y: 10 },
            { z: 10, x: 8, y: 4 },
            { z: 20, x: 16, y: -2 },
          ].map((layer, i) => (
            <div
              key={`layer-${i}`}
              className="absolute left-1/2 top-1/2 h-[52px] w-[52px] rounded-lg opacity-100"
              style={{
                transform: `translate(-50%, -50%) translate(${layer.x}px, ${layer.y}px) translateZ(${layer.z}px) rotateX(52deg) rotateZ(-8deg)`,
                transformStyle: "preserve-3d",
                opacity: 1,
                border: "1px solid rgba(197, 160, 89, 0.65)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -2px 8px rgba(0,0,0,0.06), 0 2px 0 rgba(197,160,89,0.15)",
                background:
                  i === 2
                    ? "linear-gradient(148deg, rgba(255,255,255,0.98) 0%, rgba(245,246,248,0.92) 55%, rgba(210,214,222,0.55) 100%)"
                    : i === 1
                      ? "linear-gradient(148deg, rgba(255,255,255,0.92) 0%, rgba(235,237,242,0.85) 50%, rgba(190,196,208,0.45) 100%)"
                      : "linear-gradient(148deg, rgba(250,251,253,0.88) 0%, rgba(225,228,235,0.75) 100%)",
              }}
              aria-hidden
            />
          ))}
        </div>
      </IconStage>
    </FloatWrap>
  );
}

function IconAppPrism() {
  const uid = useId().replace(/:/g, "");
  return (
    <FloatWrap>
      <IconStage
        rotate3d={{
          x: [12, 18, 12],
          y: [-22, -14, -22],
        }}
      >
        <svg width="92" height="92" viewBox="0 0 100 100" className="overflow-visible opacity-100" aria-hidden>
          <defs>
            <linearGradient id={`${uid}-face-l`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a4a4e" />
              <stop offset="100%" stopColor="#2c2c30" />
            </linearGradient>
            <linearGradient id={`${uid}-face-r`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3a3a40" />
              <stop offset="100%" stopColor="#1e1e22" />
            </linearGradient>
            <linearGradient id={`${uid}-face-f`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#505058" />
              <stop offset="100%" stopColor="#2a2a2f" />
            </linearGradient>
            <radialGradient id={`${uid}-apex`} cx="50%" cy="50%">
              <stop offset="0%" stopColor="#fff4d4" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#C5A059" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#C5A059" stopOpacity="0" />
            </radialGradient>
            <filter id={`${uid}-glow`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.2" />
            </filter>
          </defs>
          <path d="M50 22 L28 78 L50 62 Z" fill={`url(#${uid}-face-l)`} opacity="1" />
          <path d="M50 22 L72 78 L50 62 Z" fill={`url(#${uid}-face-r)`} opacity="1" />
          <path d="M28 78 L72 78 L50 62 Z" fill={`url(#${uid}-face-f)`} opacity="1" />
          <path
            d="M50 22 L28 78 L50 62 Z"
            fill="none"
            stroke="rgba(197,160,89,0.45)"
            strokeWidth="0.85"
            opacity="1"
          />
          <path
            d="M50 22 L72 78 L50 62 Z"
            fill="none"
            stroke="rgba(197,160,89,0.28)"
            strokeWidth="0.65"
            opacity="1"
          />
          <circle cx="50" cy="22" r="11" fill={`url(#${uid}-apex)`} opacity="1" filter={`url(#${uid}-glow)`} />
          <circle cx="50" cy="20" r="4" fill="#fff8e8" opacity="0.85" />
        </svg>
      </IconStage>
    </FloatWrap>
  );
}

/** 极淡噪点叠在卡片上，增加纸质感；opacity 在下方 mix-blend 控制 */
const CARD_NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/** 每张卡片右下角一种线稿装饰，对应 items[].decor（0～3） */
function CardCornerDecor({ variant }: { variant: 0 | 1 | 2 | 3 }) {
  const cls = "pointer-events-none absolute bottom-4 right-4 z-0 h-[5.5rem] w-[5.5rem] text-black/[0.055]";
  if (variant === 0) {
    return (
      <svg className={cls} viewBox="0 0 88 88" fill="none" aria-hidden>
        <circle cx="56" cy="56" r="28" stroke="currentColor" strokeWidth="1" />
        <path d="M44 72 L72 44" stroke="currentColor" strokeWidth="1" />
        <rect x="12" y="12" width="20" height="20" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  if (variant === 1) {
    return (
      <svg className={cls} viewBox="0 0 88 88" fill="none" aria-hidden>
        <path d="M20 68 L44 20 L68 68 Z" stroke="currentColor" strokeWidth="1" />
        <rect x="36" y="48" width="32" height="32" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      </svg>
    );
  }
  if (variant === 2) {
    return (
      <svg className={cls} viewBox="0 0 88 88" fill="none" aria-hidden>
        <rect x="24" y="24" width="48" height="48" stroke="currentColor" strokeWidth="1" transform="rotate(12 48 48)" />
        <circle cx="48" cy="48" r="14" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 88 88" fill="none" aria-hidden>
      <path d="M18 52 Q44 38 70 52" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M18 64 Q44 50 70 64" stroke="currentColor" strokeWidth="1" opacity="0.65" fill="none" />
      <rect x="36" y="22" width="16" height="26" rx="3" stroke="currentColor" strokeWidth="1" />
      <line x1="40" y1="30" x2="52" y2="30" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
    </svg>
  );
}

/**
 * 四列数据源：顺序即大屏从左到右（小屏自上而下）。
 * Figure：React 组件；decor：传给 CardCornerDecor 的图案编号 0～3。
 */
const items = [
  {
    id: "mini",
    title: "小程序开发",
    decor: 0 as const,
    Figure: IconMiniProgramTorus,
    desc: "全场景移动互联时代，移动应用已涵盖多个领域。我们致力于量身定制化应用，提升用户体验。",
    scope: ["微信小程序开发", "抖音小程序开发", "支付宝小程序开发"],
  },
  {
    id: "h5",
    title: "H5 开发",
    decor: 3 as const,
    Figure: IconH5MobileWeb,
    desc: "面向传播与转化的移动端网页体验：从创意互动到落地闭环，兼顾微信生态适配与多端浏览器性能，让每一次投放都可追踪、可迭代。",
    scope: [
      "品牌活动 / 营销落地页",
      "微信生态内传播 H5 与互动玩法",
      "自适应布局与主流机型兼容",
      "动画叙事与加载性能优化",
      "埋点、转化与数据回流对接",
    ],
  },
  {
    id: "web",
    title: "网站定制",
    decor: 1 as const,
    Figure: IconWebsiteLayers,
    desc: "拥有资深设计团队，将品牌时代思维融入商业，赋予网站活力，快速建立品牌信任感。",
    scope: [
      "集团/公司品牌官网",
      "高端企业网站设计",
      "政务/协会官方门户",
      "品牌电商网站开发",
      "独立站搭建",
    ],
  },
  {
    id: "app",
    title: "App 开发",
    decor: 2 as const,
    Figure: IconAppPrism,
    desc: "从首屏动效到底层同步策略，构建可长期迭代的原生体验；把复杂度留在工程侧，把极致留给用户。",
    scope: [
      "iOS / Android 原生开发",
      "Flutter / React Native 跨平台开发",
      "行业应用级 App 定制",
      "移动端交互 UI/UX 设计",
      "App Store 上架与全流程维护",
    ],
  },
] as const;

/** 卡片依次出现的 stagger */
const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.05 },
  },
};

/** 单张卡片入场：淡入 + 上移 */
const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Services() {
  return (
    <section id="services" className="border-t border-neutral-300/60 bg-[#EBEBEB]">
      <div className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-32">
        <motion.div
          variants={sectionHeaderStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportFade}
        >
          <motion.p variants={fadeInUp} className={sectionEyebrowClass}>
            01 / SCOPE
          </motion.p>
          <motion.h2 variants={fadeInUp} className={`max-w-4xl ${sectionTitleClass} mb-12`}>
            我们的服务
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 xl:grid-cols-4 xl:gap-8 2xl:gap-10"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={viewportFade}
        >
          {items.map((item) => {
            const Figure = item.Figure;
            const article = (
              <motion.article
                variants={card}
                className="group relative cursor-default overflow-hidden rounded-2xl border border-neutral-300/90 bg-white px-6 pb-8 pt-7 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08),0_2px_0_rgba(255,255,255,0.9)_inset] transition-[border-color,box-shadow] duration-300 ease-out hover:border-[#C5A059] hover:shadow-[0_16px_44px_-14px_rgba(0,0,0,0.1),0_0_0_1px_rgba(197,160,89,0.12)] md:px-7 md:pb-9 md:pt-8"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-multiply"
                  style={{ backgroundImage: CARD_NOISE_BG }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-50/80"
                  aria-hidden
                />
                <CardCornerDecor variant={item.decor} />

                <div className="relative z-[1]">
                  <Figure />
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h3 className="font-sans text-[15px] font-semibold tracking-tight text-black md:text-base">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-[14px] font-normal leading-[1.75] tracking-[0.02em] text-[#666666]">
                      {item.desc}
                    </p>
                    <p className="mt-8 font-sans text-[10px] font-medium tracking-[0.2em] text-zinc-400 sm:text-[11px]">
                      业务范围清单
                    </p>
                    <ul className="mt-3 flex flex-col">
                      {item.scope.map((label) => (
                        <li key={label} className="flex items-start gap-3 py-2 text-base leading-relaxed text-[#666666]">
                          <span className="mt-2 h-1 w-1 shrink-0 bg-[#C5A059]" aria-hidden />
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.article>
            );

            return <div key={item.id}>{article}</div>;
          })}
        </motion.div>
      </div>
    </section>
  );
}
