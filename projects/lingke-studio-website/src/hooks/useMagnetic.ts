/**
 * 「磁吸按钮」：鼠标在元素上移动时，整块轻微跟指针偏移（高级站点常用交互）
 * ---------------------------------------------------------------------------
 * 用法：const { ref, style } = useMagnetic<HTMLAnchorElement>(0.26);
 *      <motion.a ref={ref} style={style} ...>
 * strength：吸力大小，0.2～0.45 较克制；越大飘得越明显。
 */
import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, type MotionStyle } from "framer-motion";

/** 弹簧手感：stiffness 越大越硬，damping 越大越快停 */
const DEFAULT_SPRING = { stiffness: 180, damping: 22, mass: 0.35 };

export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.32) {
  const ref = useRef<T | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, DEFAULT_SPRING);
  const springY = useSpring(y, DEFAULT_SPRING);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, x, y]);

  const style: MotionStyle = { x: springX, y: springY };

  return { ref, style };
}
