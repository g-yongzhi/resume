/**
 * 全站动效与标题样式（Framer Motion）
 * ---------------------------------------------------------------------------
 * 改「动画快慢 / 淡入距离」：改下面各 Variants 里的 transition、y、opacity。
 * 改「金标/大标题」字体大小颜色：改 sectionEyebrowClass、sectionTitleClass 的 Tailwind 字符串。
 * 其他组件通过 import { fadeInUp, ... } from "../lib/motionFade" 引用这里。
 */
import type { Variants } from "framer-motion";

/** 通用：从下方淡入并上移（入场动画） */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

/** 位移稍小的淡入（载入层、导航等短动画） */
export const fadeInUpShort: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * whileInView 用的「进入视口再播一次」配置。
 * once: true = 滚回来不再重复播；margin / amount 控制多早触发。
 */
export const viewportFade = {
  once: true as const,
  margin: "-10% 0px -10% 0px" as const,
  amount: 0.2 as const,
};

/**
 * 区块标题区： eyebrow（02 / WORK）→ 大标题 → 副文案，按顺序错开出现。
 * staggerChildren：每个子元素间隔秒数；delayChildren：整体延迟。
 */
export const sectionHeaderStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.02 } },
};

/** 移动端全屏导航面板内链接依次出现 */
export const navMobileMenuStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

/** 金棕色小标签，如「02 / WORK」 */
export const sectionEyebrowClass =
  "font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-[#C5A059]";

/** 区块主标题「精选案例」等 */
export const sectionTitleClass =
  "mt-3 text-3xl font-semibold tracking-[-0.03em] text-black md:text-5xl md:leading-[1.08]";
