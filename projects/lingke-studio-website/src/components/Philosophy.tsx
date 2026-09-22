/**
 * 经营理念（Philosophy）：案例后、联系前 — 单轴版式 + 一体成本仪表
 * ---------------------------------------------------------------------------
 * 文案与图表同宽对齐，避免「左字右图」中空带；主条与图例同一容器收边。
 */
import type { FC } from "react";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { homeHash, HomeHashLink } from "../lib/homeNav";

const BAR_SEGMENTS = [
  { basis: 40, bg: "#E5E5E5", label: "商务与销售提成" },
  { basis: 20, bg: "#D1D5DB", label: "多层项目协调" },
  { basis: 20, bg: "#B0B0B0", label: "模板/分包加价" },
  { basis: 15, bg: "#9B9B9B", label: "重复造轮子" },
] as const;

const EASE: [number, number, number, number] = [0.42, 0, 0.58, 1];
const SEG_DUR = 0.32;
const GOLD_DELAY = 0.88;
const GOLD_DUR = 0.5;
const INVALID_DELAY = 1.05;
const INVALID_DUR = 0.35;

const Philosophy: FC = () => {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const active = useInView(sectionRef, { once: true, amount: 0.25 });
  const instant = !!reducedMotion;

  const shrinkDelay = (index: number) => (BAR_SEGMENTS.length - 1 - index) * SEG_DUR;

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="bg-[#FAF9F7] py-16 md:py-20"
      aria-labelledby="philosophy-heading"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="max-w-3xl">
          <div className="h-5 w-px bg-[#C5A059]" aria-hidden />
          <p className="mt-4 text-xs tracking-[0.2em] text-[#C5A059]">— 你的交付成本构成 —</p>

          <h2
            id="philosophy-heading"
            className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight text-[#1A1A1A] md:text-[2rem] lg:text-[2.125rem]"
          >
            你的预算在养中间商，还是在养工程师？
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#6B6B6B] md:text-lg">
            我们客户的平均交付成本仅为行业均值的 60%。差额来自被我们砍掉的四层无效结构。
          </p>
        </div>

        {/* 一体式仪表：与全站内容区同宽，图例与主条同列宽 */}
        <div className="mt-8 overflow-hidden rounded-xl border border-[#E0DCD4] bg-[#F3F1ED] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
          <div
            className="grid border-b border-[#E0DCD4] bg-[#FAF9F7]"
            style={{ gridTemplateColumns: "40fr 20fr 20fr 15fr 5fr" }}
          >
            {BAR_SEGMENTS.map((seg, i) => (
              <motion.div
                key={seg.label}
                className={`border-[#E8E4DC] px-1.5 py-2.5 text-center text-[10px] font-medium leading-tight text-[#6B6B6B] sm:px-2 sm:text-[11px] md:py-3 md:text-xs lg:text-[13px] ${i > 0 ? "border-l" : ""}`}
                initial={false}
                animate={{ opacity: active ? 0 : 1 }}
                transition={{
                  duration: instant ? 0 : 0.22,
                  delay: instant ? 0 : shrinkDelay(i),
                  ease: EASE,
                }}
              >
                <span className="line-clamp-2 md:line-clamp-none">{seg.label}</span>
              </motion.div>
            ))}
            <motion.div
              className="relative border-l border-[#E8E4DC] px-1 py-2.5 text-center sm:px-1.5"
              initial={false}
            >
              <motion.span
                className="block text-[10px] font-semibold text-[#C5A059] sm:text-[11px] md:text-xs lg:text-[13px]"
                initial={false}
                animate={{ opacity: active ? 0 : 1 }}
                transition={{ duration: instant ? 0 : 0.2, delay: instant ? 0 : GOLD_DELAY * 0.35, ease: EASE }}
              >
                实际工程
              </motion.span>
              <motion.span
                className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 block text-[10px] font-bold text-[#C5A059] sm:text-[11px] md:text-xs lg:text-[13px]"
                initial={false}
                animate={{ opacity: active ? 1 : 0 }}
                transition={{
                  duration: instant ? 0 : 0.28,
                  delay: instant ? 0 : GOLD_DELAY + GOLD_DUR * 0.4,
                  ease: EASE,
                }}
              >
                60% 直达
              </motion.span>
            </motion.div>
          </div>

          <div className="p-2.5 sm:p-3 md:p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <motion.p
                className="font-mono text-sm font-bold tabular-nums text-[#C5A059] sm:text-base"
                initial={false}
                animate={{ opacity: active ? 1 : 0 }}
                transition={{
                  duration: instant ? 0 : INVALID_DUR,
                  delay: instant ? 0 : INVALID_DELAY,
                  ease: EASE,
                }}
              >
                − 40% 无效成本
              </motion.p>
              <span className="text-right text-[11px] text-[#6B6B6B] sm:text-xs">宽度 = 同一预算口径</span>
            </div>

            <div className="flex h-14 w-full items-stretch overflow-hidden rounded-lg bg-[#DDD8CF] sm:h-16 md:h-[4.5rem]">
              {BAR_SEGMENTS.map((seg, index) => (
                <motion.div
                  key={`bar-${seg.label}`}
                  className="min-w-0 overflow-hidden"
                  initial={false}
                  animate={{
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: active ? "0%" : `${seg.basis}%`,
                    opacity: active ? 0 : 1,
                  }}
                  transition={{
                    duration: instant ? 0 : SEG_DUR,
                    delay: instant ? 0 : shrinkDelay(index),
                    ease: EASE,
                  }}
                >
                  <div className="h-full w-full" style={{ backgroundColor: seg.bg }} />
                </motion.div>
              ))}

              <motion.div
                className={`min-w-0 overflow-hidden ${active ? "ml-auto" : ""}`}
                initial={false}
                animate={{
                  flexGrow: 0,
                  flexShrink: 0,
                  flexBasis: active ? "60%" : "5%",
                }}
                transition={{
                  duration: instant ? 0 : GOLD_DUR,
                  delay: instant ? 0 : GOLD_DELAY,
                  ease: EASE,
                }}
              >
                <div className="relative flex h-full w-full items-center justify-center bg-[#C5A059]">
                  <motion.span
                    className="absolute inset-0 flex items-center justify-center px-1 text-center text-[11px] font-semibold text-white/95 sm:text-xs"
                    initial={false}
                    animate={{ opacity: active ? 0 : 1 }}
                    transition={{
                      duration: instant ? 0 : 0.22,
                      delay: instant ? 0 : GOLD_DELAY + 0.12,
                      ease: EASE,
                    }}
                  >
                    工程
                  </motion.span>
                  <motion.span
                    className="relative z-[1] px-2 text-center text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl"
                    initial={false}
                    animate={{ opacity: active ? 1 : 0 }}
                    transition={{
                      duration: instant ? 0 : 0.32,
                      delay: instant ? 0 : GOLD_DELAY + GOLD_DUR * 0.35,
                      ease: EASE,
                    }}
                  >
                    60% 直达工程
                  </motion.span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-0 divide-y divide-[#E8E6E1] border-y border-[#E8E6E1] sm:mt-9 sm:flex-row sm:divide-x sm:divide-y-0">
          <div className="py-4 sm:flex-1 sm:py-5 sm:pr-6">
            <p className="text-2xl font-bold tabular-nums text-[#C5A059]">100%</p>
            <p className="mt-1 text-sm leading-snug text-[#6B6B6B]">源码留存，无供应商锁定</p>
          </div>
          <div className="py-4 sm:flex-1 sm:px-6 sm:py-5">
            <p className="text-2xl font-bold tabular-nums text-[#C5A059]">0</p>
            <p className="mt-1 text-sm leading-snug text-[#6B6B6B]">中间商，技术合伙人直接签约</p>
          </div>
          <div className="py-4 sm:flex-1 sm:py-5 sm:pl-6">
            <p className="text-xl font-bold leading-snug text-[#C5A059] sm:text-2xl">较行业缩短 35%</p>
            <p className="mt-1 text-sm leading-snug text-[#6B6B6B]">平均交付周期（基于过往案例）</p>
          </div>
        </div>

        <div className="mt-9">
          <HomeHashLink
            to={homeHash.contact}
            className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#C5A059] px-10 py-3.5 text-[15px] font-semibold text-white shadow-[0_6px_24px_-4px_rgba(197,160,89,0.45)] transition-all duration-300 hover:bg-[#A08040] hover:shadow-[0_8px_28px_-4px_rgba(197,160,89,0.5)] sm:w-auto"
          >
            查看你的项目报价
            <ArrowRight
              className="h-[18px] w-[18px] shrink-0 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={2.2}
              aria-hidden
            />
          </HomeHashLink>
          <p className="mt-3 text-xs leading-relaxed text-[#B0B0B0]">
            仅展示过往项目真实周期与成本结构，不含商业敏感信息。
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#B0B0B0]">仅与追求工程效率的团队同行。</p>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
