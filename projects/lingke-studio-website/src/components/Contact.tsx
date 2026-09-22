/**
 * 联系区块：表单、邮箱/电话、磁吸 CTA
 * ---------------------------------------------------------------------------
 * 邮箱/电话由后台「联系方式」设置，经 `useSiteContact` 全站同步。
 * 【改主题色金】改 GOLD 常量或各处 #C5A059。
 */
import { AnimatePresence, motion } from "framer-motion";
import { type FormEvent, type ReactNode, useCallback, useId, useRef, useState } from "react";
import { useMagnetic } from "../hooks/useMagnetic";
import {
  fadeInUp,
  sectionEyebrowClass,
  sectionHeaderStagger,
  sectionTitleClass,
  viewportFade,
} from "../lib/motionFade";
import { useSiteContact } from "../context/SiteSettingsContext";
import { submitContactForm } from "../lib/submitContact";

const GOLD = "#C5A059";

function MagneticCta({
  href,
  className,
  children,
  strength = 0.22,
}: {
  href: string;
  className: string;
  children: ReactNode;
  strength?: number;
}) {
  const { ref, style } = useMagnetic<HTMLAnchorElement>(strength);
  return (
    <motion.a ref={ref} style={style} href={href} className={`inline-flex ${className}`}>
      {children}
    </motion.a>
  );
}

function FloatingField({
  id,
  label,
  type = "text",
  name,
  autoComplete,
  required,
  rows,
}: {
  id: string;
  label: string;
  type?: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
  rows?: number;
}) {
  const isArea = rows != null && rows > 0;
  const inputPad = isArea ? "pt-9 pb-3 min-h-[132px] resize-y" : "pt-7 pb-2.5";

  return (
    <motion.div variants={fadeInUp} className="group relative">
      {isArea ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required={required}
          autoComplete={autoComplete}
          aria-required={required}
          className={`peer relative z-10 block w-full border-0 bg-transparent px-0 ${inputPad} text-[15px] font-normal leading-[1.55] text-black outline-none ring-0 transition-colors placeholder:text-transparent focus:ring-0`}
          placeholder=" "
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          aria-required={required}
          className={`peer relative z-10 block w-full border-0 bg-transparent px-0 ${inputPad} text-[15px] font-normal leading-[1.55] text-black outline-none ring-0 transition-colors placeholder:text-transparent focus:ring-0`}
          placeholder=" "
        />
      )}
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-0 z-0 origin-left text-[15px] font-normal text-[#666666] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isArea ? "top-9" : "top-7"
        } peer-focus:top-0 peer-focus:text-[11px] peer-focus:font-medium peer-focus:tracking-[0.14em] peer-focus:text-[#C5A059] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:tracking-[0.14em] peer-[:not(:placeholder-shown)]:text-[#C5A059]`}
      >
        {label}
        {required ? <span className="sr-only">（必填）</span> : null}
      </label>
      <span
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px origin-center bg-zinc-300/85 transition-[height,background-color,background-image] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-within:h-[2px] group-focus-within:bg-gradient-to-r group-focus-within:from-transparent group-focus-within:via-[#C5A059] group-focus-within:to-transparent"
        aria-hidden
      />
    </motion.div>
  );
}

export function Contact() {
  const { email: siteEmail, phone: sitePhone } = useSiteContact();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintId = useId();
  const formHintId = useId();

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 2600);
  }, []);

  const copyToClipboard = useCallback(
    async (text: string, okLabel: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(okLabel);
      } catch {
        showToast("无法自动复制，请手动选择文本");
      }
    },
    [showToast],
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setSent(false);

    const result = await submitContactForm({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      brief: String(fd.get("brief") ?? ""),
      website: String(fd.get("website") ?? ""),
    });

    setSubmitting(false);

    if (result.ok) {
      setSent(true);
      showToast(result.message);
      formRef.current?.reset();
      return;
    }

    showToast(result.message);
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-zinc-200/80 bg-zinc-50"
      aria-labelledby="contact-heading"
    >
      <span
        className="pointer-events-none absolute left-[4%] top-[42%] z-0 -translate-y-1/2 select-none font-sans text-[clamp(7rem,28vw,15rem)] font-semibold leading-none tracking-tighter text-zinc-900/[0.045] md:left-[6%] md:text-[clamp(9rem,22vw,14rem)]"
        aria-hidden
      >
        04
      </span>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key="toast"
            role="status"
            aria-live="polite"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="pointer-events-none fixed bottom-10 left-1/2 z-[10002] max-w-[90vw] -translate-x-1/2 px-4"
          >
            <div className="pointer-events-auto rounded-full border border-zinc-200/90 bg-white/95 px-5 py-2.5 text-[13px] font-normal text-zinc-800 shadow-sm backdrop-blur-sm">
              <span style={{ color: GOLD }} className="mr-2 font-sans text-[11px] font-semibold tracking-wider">
                LINGKE
              </span>
              {toast}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-28 md:min-h-[min(72vh,820px)] md:px-10 md:py-32 md:pb-36">
        <div className="grid gap-16 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start md:gap-x-12 md:gap-y-0 lg:gap-x-16">
          <motion.div
            variants={sectionHeaderStagger}
            initial="hidden"
            whileInView="visible"
            viewport={viewportFade}
            className="flex flex-col justify-between gap-12 md:min-h-[min(56vh,640px)]"
          >
            <motion.div variants={fadeInUp}>
              <p className={sectionEyebrowClass}>04 / CONTACT</p>
              <h2 id="contact-heading" className={`max-w-[14ch] ${sectionTitleClass}`}>
                为您专属定制
              </h2>
              <p className="mb-12 mt-4 max-w-xl text-xl font-semibold tracking-tight text-black sm:text-2xl md:text-[clamp(1.25rem,2.2vw,1.65rem)]">
                获取《方案与报价》
              </p>
              <p
                id={hintId}
                className="mt-0 max-w-md text-[14px] font-normal leading-[1.75] tracking-[0.02em] text-[#666666]"
              >
                填写表单，我们将在两个工作日内与您对接。亦可直接邮件或电话联系。
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col gap-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#666666]/90">邮箱</p>
              <button
                type="button"
                onClick={() => void copyToClipboard(siteEmail, "已复制邮箱")}
                className="w-full max-w-md text-left font-sans text-[clamp(1.125rem,2.8vw,1.75rem)] font-bold leading-snug tracking-tight text-black transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/35"
              >
                {siteEmail}
              </button>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#666666]/90">电话</p>
              <button
                type="button"
                onClick={() => void copyToClipboard(sitePhone, "已复制电话")}
                className="w-full max-w-md text-left font-sans text-[clamp(1.125rem,2.8vw,1.75rem)] font-bold tabular-nums tracking-tight text-black transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/35"
              >
                {sitePhone}
              </button>
              <p className="max-w-sm text-[12px] font-normal leading-relaxed text-[#666666]/90">点击可复制</p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <MagneticCta
                strength={0.34}
                href={`mailto:${siteEmail}`}
                className="items-center justify-center bg-[#141414] px-10 py-4 text-[13px] font-semibold tracking-[0.12em] text-white shadow-sm transition-[background-color,transform] duration-300 hover:bg-[#0a0a0a] active:scale-[0.99]"
              >
                发送邮件
              </MagneticCta>
            </motion.div>
          </motion.div>

          <motion.form
            ref={formRef}
            id="contact-form"
            aria-label="项目合作咨询表单"
            aria-describedby={`${formHintId} ${hintId}`}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={viewportFade}
            onSubmit={onSubmit}
            className="relative flex flex-col gap-11 md:pt-1"
          >
            <p id={formHintId} className="sr-only">
              必填项须完整填写。提交后我们将保存您的咨询并在两个工作日内回复。
            </p>
            <motion.div variants={fadeInUp} className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
              <label htmlFor="contact-website">网站</label>
              <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </motion.div>
            <FloatingField id="contact-name" label="姓名" name="name" autoComplete="name" required />
            <FloatingField id="contact-email" label="电子邮箱" type="email" name="email" autoComplete="email" required />
            <FloatingField id="contact-phone" label="手机" type="tel" name="phone" autoComplete="tel" required />
            <FloatingField id="contact-brief" label="合作需求" name="brief" rows={5} required />
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-6 pt-1">
              <button
                type="submit"
                disabled={submitting}
                aria-label="提交合作需求"
                aria-busy={submitting}
                className="inline-flex border-0 bg-[#141414] px-10 py-3.5 text-[12px] font-semibold tracking-[0.12em] text-white transition-[background-color,transform,opacity] duration-300 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/45 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "提交中…" : "提交"}
              </button>
              <span
                id="contact-status"
                role="status"
                aria-live="polite"
                className={`text-[13px] font-normal ${sent ? "text-[#666666]" : "sr-only"}`}
              >
                {sent ? "提交成功，感谢信任。" : ""}
              </span>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
