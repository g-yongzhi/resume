/**
 * 首页首屏 Hero（大图/视频 + LINGKE 标题 + 副标题）
 * ===========================================================================
 * 【你要改文案】搜正文里的中文，或下面 motion.p 里的句子。
 * 【你要换视频】改 VIDEO_SRC，文件放在 public/video/ 下；POSTER_FALLBACK 是视频未加载时的占位图。
 * 【你要改背景灰】改 HERO_BASE、HERO_EDGE_TINT（与视频边缘渐变相配）。
 * 【你要改滚动动画】videoScale / contentY 的 useTransform 数字。
 * ---------------------------------------------------------------------------
 * forwardRef：父组件 App 要把 ref 绑在这一整块 <section> 上，用来算滚动进度（见 App 里 ScrollAmbient）。
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
  type RefObject,
} from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCursor } from "../context/CursorContext";
import { fadeInUp } from "../lib/motionFade";

// ---------- 资源路径（相对网站根路径，对应 public/ 目录） ----------
const VIDEO_SRC = "/video/hero.mp4";
/** 视频还没挂载或失败时显示的静态图；建议与视频第一帧风格接近 */
const POSTER_FALLBACK = "/video/poster.svg";

/** 截取视频帧做 poster 时，画布最长边上限，避免超大视频占内存 */
const MAX_POSTER_EDGE = 1920;

/** 主背景填充色，须与视频底色一致，否则四周会露馅 */
const HERO_BASE = "#e8e8e8";
/** 左右/上下边缘渐变里用到的深色灰，微调「边框」软硬 */
const HERO_EDGE_TINT = "#c9c9c9";

/** 将截帧导出为 poster：优先 WebP（文字边缘更干净），否则用较高质量 JPEG，避免低质量 JPEG 在文案周围产生杂色/色块 */
function canvasToPosterDataUrl(canvas: HTMLCanvasElement): string | null {
  try {
    const webp = canvas.toDataURL("image/webp", 0.92);
    if (webp.startsWith("data:image/webp")) return webp;
  } catch {
    /* 部分环境不支持 webp 编码 */
  }
  try {
    return canvas.toDataURL("image/jpeg", 0.93);
  } catch {
    return null;
  }
}

/**
 * 从已加载的 <video> 里截一帧转成静态 poster（比纯 SVG 更接近成片；高质量导出以减轻文案处 JPEG 杂色）。
 * enabled=false 时不跑逻辑；依赖同源视频，跨域视频会导致 canvas 污染而失败（走 catch）。
 */
function useCaptureVideoPoster(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const v = videoRef.current;
    if (!v) return;

    let cancelled = false;

    const captureFrame = () => {
      try {
        const w = v.videoWidth;
        const h = v.videoHeight;
        if (!w || !h) return;
        const scale = w > MAX_POSTER_EDGE ? MAX_POSTER_EDGE / w : 1;
        const cw = Math.max(1, Math.floor(w * scale));
        const ch = Math.max(1, Math.floor(h * scale));
        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(v, 0, 0, cw, ch);
        const url = canvasToPosterDataUrl(canvas);
        if (!cancelled && url) setDataUrl(url);
      } catch {
        /* 跨域或安全策略导致无法导出：忽略，继续用 POSTER_FALLBACK */
      }
    };

    const finish = () => {
      captureFrame();
      try {
        v.currentTime = 0;
        void v.play().catch(() => {});
      } catch {
        /* noop */
      }
    };

    const seekAndCapture = () => {
      const t =
        v.duration && !Number.isNaN(v.duration) ? Math.min(0.08, Math.max(0.02, v.duration * 0.015)) : 0.06;
      const onSeeked = () => {
        v.removeEventListener("seeked", onSeeked);
        finish();
      };
      v.addEventListener("seeked", onSeeked);
      try {
        v.pause();
        v.currentTime = t;
      } catch {
        finish();
      }
    };

    const onReady = () => {
      if (cancelled) return;
      seekAndCapture();
    };

    if (v.readyState >= 2) onReady();
    else v.addEventListener("loadeddata", onReady, { once: true });

    return () => {
      cancelled = true;
      v.removeEventListener("loadeddata", onReady);
    };
  }, [enabled, videoRef]);

  return dataUrl;
}

/** 同时转发 ref 给内部 DOM 和父组件传来的 ref（React 合并多个 ref 的惯例写法） */
function mergeRefs<T>(...refs: Array<ForwardedRef<T> | React.RefObject<T | null> | null | undefined>) {
  return (node: T | null) => {
    refs.forEach((r) => {
      if (!r) return;
      if (typeof r === "function") r(node);
      else (r as React.MutableRefObject<T | null>).current = node;
    });
  };
}

type HeroProps = {
  /** 视频可播放（或超时兜底）时回调一次，用于关掉全屏 Loading */
  onVideoReady?: () => void;
};

export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero({ onVideoReady }, ref) {
  /** 绑定本区块，用于 useScroll 计算「滚离 Hero」的比例 */
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  /** 防止 onVideoReady 被重复触发多次 */
  const readySent = useRef(false);
  /** false：先显示静态 poster；true：再挂载 <video>，减轻首屏负担 */
  const [loadVideo, setLoadVideo] = useState(false);
  const { setVariant } = useCursor();

  const notifyReady = useCallback(() => {
    if (readySent.current) return;
    readySent.current = true;
    onVideoReady?.();
  }, [onVideoReady]);

  const capturedPoster = useCaptureVideoPoster(videoRef, loadVideo);
  const poster = capturedPoster ?? POSTER_FALLBACK;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
    layoutEffect: false,
  });

  /** 向下滚动时视频轻微放大（数字可调：后面 [1, 1.06]） */
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  /** 向下滚动时前景文案轻微下移，增加层次 */
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 48]);

  /**
   * 延迟挂载视频：优先用浏览器空闲时间 requestIdleCallback；
   * 不支持则用 setTimeout 120ms。避免阻塞首屏排版。
   */
  useEffect(() => {
    const run = () => setLoadVideo(true);
    const idleId = window.requestIdleCallback?.(run, { timeout: 1200 });
    const timeoutId =
      idleId === undefined ? setTimeout(run, 120) : undefined;

    return () => {
      if (idleId !== undefined) cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  /**
   * 最长等待 14 秒仍无就绪信号则强制认为「可进入页面」，避免用户一直卡在 Loading。
   * 想改等待时间：改 14000（毫秒）。
   */
  useEffect(() => {
    const t = setTimeout(notifyReady, 14000);
    return () => clearTimeout(t);
  }, [notifyReady]);

  return (
    <section
      ref={mergeRefs(sectionRef, ref)}
      id="about"
      className="relative flex min-h-[100dvh] flex-col justify-end bg-transparent"
    >
      {/* ========== 底层：视频 / 渐变遮罩 / 四边压暗（全是装饰层） ========== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          style={{
            scale: videoScale,
            backgroundColor: HERO_BASE,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          className="absolute inset-0 isolate origin-center transform-gpu will-change-transform"
        >
          <div
            className="absolute inset-0 flex items-center justify-center px-0"
            style={{ backgroundColor: HERO_BASE }}
          >
            <div className="relative mx-auto aspect-video w-full max-h-[min(100dvh,56.25vw)] max-w-[100vw]">
              {loadVideo ? (
                <>
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full border-0 object-contain object-center shadow-none outline-none ring-0 [--webkit-tap-highlight-color:transparent]"
                    style={{
                      backgroundColor: HERO_BASE,
                      transform: "translateZ(0)",
                    }}
                    width={1920}
                    height={1080}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={poster}
                    onCanPlayThrough={notifyReady}
                    onLoadedData={() => {
                      const v = videoRef.current;
                      if (v && v.readyState >= 3) notifyReady();
                    }}
                    onError={notifyReady}
                  >
                    <source src={VIDEO_SRC} type="video/mp4" />
                  </video>
                  {/*
                    透明层：只有鼠标在这层上时才把光标切成「播放」样式；
                    pointer-events-auto 让事件能进这层（下面整区是 pointer-events-none）
                  */}
                  <div
                    role="presentation"
                    className="absolute inset-0 z-[6] cursor-none pointer-events-auto"
                    onMouseEnter={() => setVariant("play")}
                    onMouseLeave={() => setVariant("default")}
                  />
                </>
              ) : (
                <img
                  src={POSTER_FALLBACK}
                  alt=""
                  width={1920}
                  height={1080}
                  className="absolute inset-0 h-full w-full object-contain object-center opacity-100"
                  style={{ backgroundColor: HERO_BASE }}
                  decoding="async"
                  fetchPriority="high"
                />
              )}
            </div>
          </div>
          {/* 左下角轻微暗角，让左下文字更易读（可选） */}
          <div
            className="pointer-events-none absolute bottom-0 left-6 h-[min(50vh,440px)] w-[min(calc(100vw-3rem),40rem)] bg-gradient-to-t from-zinc-900/15 to-transparent md:left-10"
            aria-hidden
          />
        </motion.div>
        {/* 左 / 右 / 上 / 下：柔化视频与灰边的接缝，颜色由 HERO_EDGE_TINT + HERO_BASE 组成 */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 z-[2] w-[clamp(48px,min(32vw,420px),420px)]"
          style={{
            background: `linear-gradient(to right, ${HERO_EDGE_TINT} 0%, #d2d2d2 14%, #dedede 32%, #e4e4e4 55%, ${HERO_BASE} 78%, transparent 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 z-[2] w-[clamp(48px,min(32vw,420px),420px)]"
          style={{
            background: `linear-gradient(to left, ${HERO_EDGE_TINT} 0%, #d2d2d2 14%, #dedede 32%, #e4e4e4 55%, ${HERO_BASE} 78%, transparent 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-[2] h-[clamp(12px,2.8dvh,48px)]"
          style={{
            background: `linear-gradient(to bottom, ${HERO_EDGE_TINT} 0%, ${HERO_BASE} 55%, transparent 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-[2] h-[clamp(10px,2dvh,36px)]"
          style={{
            background: `linear-gradient(to top, ${HERO_EDGE_TINT} 0%, ${HERO_BASE} 50%, transparent 100%)`,
          }}
        />
      </div>

      {/* ========== 前景：标题 + 副标题（z-10 保证在视频之上） ========== */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-auto w-full max-w-[1400px] shrink-0 px-6 pb-16 pt-32 md:px-10 md:pb-24"
      >
        <motion.div
          className="w-full overflow-visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
          }}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={fadeInUp}
            className="max-w-[40vw] font-sans text-[clamp(2.375rem,7.25vw,5.125rem)] font-light uppercase tracking-tight leading-[1.1] text-black antialiased md:max-w-[38%]"
          >
            <span className="sr-only">灵壳 </span>
            LINGKE
          </motion.h1>
          {/*
            副标题宽度：max-w-[calc(32rem-5em)] 用来「少排几个字」避免和右侧主视觉重叠；
            想恢复更宽：可改回 max-w-xl md:max-w-2xl 等 Tailwind 标准类
          */}
          <motion.p
            variants={fadeInUp}
            className="mt-5 max-w-[calc(32rem-5em)] text-[15px] font-normal leading-[1.75] tracking-[0.02em] text-[#666666] antialiased md:mt-7 md:max-w-[calc(36rem-5em)] md:text-[16px]"
          >
            为企业交付「网站 · 小程序 · H5 · 应用」全链路数字体验：自品牌叙事到发布运维，以克制的工程与版式，放大每一笔数字投资的回报。
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
});
