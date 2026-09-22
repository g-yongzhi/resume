/**
 * 首页主体：Hero → 服务 → 作品 → 理念 → 联系
 */
import { lazy, Suspense, type RefObject } from "react";
import { motion } from "framer-motion";
import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import Philosophy from "../components/Philosophy";
import { fadeInUp, viewportFade } from "../lib/motionFade";

const SelectedWork = lazy(() =>
  import("../components/SelectedWork").then((m) => ({ default: m.SelectedWork })),
);
const Contact = lazy(() =>
  import("../components/Contact").then((m) => ({ default: m.Contact })),
);
import { SiteFooter } from "../components/SiteFooter";

function SectionFallback({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center bg-zinc-50"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportFade}
        className="text-[11px] font-medium tracking-[0.2em] text-zinc-400"
      >
        {label}
      </motion.p>
    </div>
  );
}

type HomePageProps = {
  heroRef: RefObject<HTMLElement | null>;
  onHeroReady: () => void;
};

export function HomePage({ heroRef, onHeroReady }: HomePageProps) {
  return (
    <main id="main-content">
      <Hero ref={heroRef} onVideoReady={onHeroReady} />
      <Services />
      <Suspense fallback={<SectionFallback label="作品" />}>
        <SelectedWork />
      </Suspense>
      <Philosophy />
      <Suspense fallback={<SectionFallback label="联系" />}>
        <Contact />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
