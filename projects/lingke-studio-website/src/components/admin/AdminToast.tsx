import { AnimatePresence, motion } from "framer-motion";
import { GOLD } from "../../lib/adminUtils";

export function AdminToast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-[300] -translate-x-1/2"
        >
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white/95 px-5 py-2.5 text-[13px] text-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">
            <span className="font-bold tracking-[0.16em]" style={{ color: GOLD }}>
              LK
            </span>
            {message}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
