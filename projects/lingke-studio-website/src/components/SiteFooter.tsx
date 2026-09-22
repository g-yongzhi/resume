/**
 * 全站页脚：品牌叙事、服务入口、转化与合规条
 * —— 视觉对齐全站金点缀色与 1400px 内容宽；联系方式见后台设置
 */
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInUp, viewportFade } from "../lib/motionFade";
import { homeHash, HomeHashLink } from "../lib/homeNav";
import { useSiteContact } from "../context/SiteSettingsContext";

const GOLD = "#C5A059";

const linkMuted =
  "text-[13px] font-normal leading-relaxed text-zinc-600 transition-colors hover:text-[#C5A059] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function FootCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-900">{title}</p>
      <ul className="mt-5 space-y-3" role="list">
        {children}
      </ul>
    </div>
  );
}

function FootLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <HomeHashLink to={to} className={linkMuted}>
        {children}
      </HomeHashLink>
    </li>
  );
}

export function SiteFooter() {
  const { email: siteEmail, phone: sitePhone } = useSiteContact();
  const year = new Date().getFullYear();
  const telHref = sitePhone.replace(/\s/g, "");

  return (
    <footer className="relative border-t border-zinc-200/90 bg-white text-zinc-900" aria-labelledby="site-footer-heading">
      <div className="relative mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20">
        <motion.div
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={viewportFade}
          className="grid gap-12 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-14"
        >
          {/* 品牌 */}
          <motion.div variants={fadeInUp} className="lg:col-span-3">
            <p id="site-footer-heading" className="sr-only">
              页脚：灵壳 LINGKE 网站地图与联系方式
            </p>
            <HomeHashLink
              to={homeHash.mainContent}
              className="group inline-flex flex-col gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/35 focus-visible:ring-offset-4"
            >
              <span className="font-sans text-2xl font-semibold tracking-[0.12em] text-black md:text-[1.65rem]">
                <span style={{ color: GOLD }}>LINGKE</span>
                <span className="ml-2 text-[1.05em] font-semibold tracking-tight text-zinc-900">灵壳</span>
              </span>
              <span className="text-[12px] font-normal leading-relaxed tracking-[0.08em] text-zinc-500">
                高端数字创意与产品工作室
              </span>
            </HomeHashLink>
            <p className="mt-5 max-w-[260px] text-[13px] leading-[1.75] text-zinc-600">
              以编辑级版式与工程级可靠度，为重视长期价值的团队交付网站、小程序与应用全链路体验。
            </p>
            <div className="mt-8 flex flex-wrap gap-3" aria-label="快速联系">
              <a
                href={`mailto:${siteEmail}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:border-[#C5A059]/45 hover:text-[#C5A059]"
                aria-label="发送邮件"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M4 7h16v10H4z" />
                  <path d="M4 7l8 6 8-6" />
                </svg>
              </a>
              <a
                href={`tel:${telHref}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:border-[#C5A059]/45 hover:text-[#C5A059]"
                aria-label="拨打电话"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M8 3h3l2 5-2 1a12 12 0 006 6l1-2 5 2v3a2 2 0 01-2 2h-1C9.4 18 6 14.6 6 10V9a2 2 0 012-2z" />
                </svg>
              </a>
              <HomeHashLink
                to={homeHash.contact}
                className="inline-flex h-10 items-center rounded-full border border-zinc-200 bg-zinc-50 px-4 text-[12px] font-medium tracking-wide text-zinc-600 transition-colors hover:border-[#C5A059]/45 hover:text-[#C5A059]"
              >
                微信 / 商务
              </HomeHashLink>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="grid gap-10 sm:grid-cols-3 lg:col-span-6 lg:grid-cols-3">
            <FootCol title="核心能力">
              <FootLink to={homeHash.services}>网站定制</FootLink>
              <FootLink to={homeHash.services}>小程序开发</FootLink>
              <FootLink to={homeHash.services}>H5 与活动页</FootLink>
              <FootLink to={homeHash.services}>App 与跨端应用</FootLink>
            </FootCol>
            <FootCol title="典型场景">
              <FootLink to={homeHash.services}>集团 / 品牌官网</FootLink>
              <FootLink to={homeHash.services}>政务与协会门户</FootLink>
              <FootLink to={homeHash.services}>品牌电商与独立站</FootLink>
              <FootLink to={homeHash.services}>营销落地与增长闭环</FootLink>
            </FootCol>
            <FootCol title="探索">
              <FootLink to={homeHash.about}>工作室与主张</FootLink>
              <FootLink to={homeHash.work}>精选作品</FootLink>
              <FootLink to={homeHash.philosophy}>交付理念</FootLink>
              <FootLink to={homeHash.contact}>项目联系</FootLink>
            </FootCol>
          </motion.div>

          {/* 转化侧栏 */}
          <motion.div variants={fadeInUp} className="border-t border-zinc-100 pt-10 lg:col-span-3 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="font-sans text-lg font-semibold leading-snug tracking-tight md:text-xl" style={{ color: GOLD }}>
              叙事 · 体验 · 工程
            </p>
            <p className="mt-4 text-[13px] leading-[1.8] text-zinc-600">
              从品牌叙事到发布运维，把复杂度留在工程侧，把清晰留给用户与增长团队。欢迎带预算与时间表来聊——我们会在两个工作日内响应首轮沟通。
            </p>
            <div className="mt-8 space-y-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">咨询专线</p>
                <a
                  href={`tel:${telHref}`}
                  className="mt-1 block font-sans text-xl font-bold tabular-nums tracking-tight text-zinc-900 transition-opacity hover:opacity-80"
                >
                  {sitePhone}
                </a>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">商务邮箱</p>
                <a
                  href={`mailto:${siteEmail}`}
                  className="mt-1 block break-all text-[15px] font-semibold text-zinc-900 underline-offset-4 transition-opacity hover:opacity-80"
                  style={{ textDecorationColor: `${GOLD}55` }}
                >
                  {siteEmail}
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 合作条 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportFade}
          className="mt-16 flex flex-col gap-4 border-t border-zinc-100 pt-10 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-zinc-500">
            <span className="font-medium text-zinc-700">合作与外链</span>
            <span className="hidden text-zinc-300 sm:inline" aria-hidden>
              |
            </span>
            <span className="max-w-xl leading-relaxed">
              设计机构、技术伙伴与渠道欢迎交换推荐位；请将品牌简介与站点地址发至邮箱，主题注明「友情链接」。
            </span>
          </div>
          <HomeHashLink
            to={homeHash.contact}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-[12px] font-semibold tracking-wide text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/45"
          >
            申请合作推荐
          </HomeHashLink>
        </motion.div>
      </div>

      {/* 底栏 */}
      <div className="border-t border-zinc-200/80 bg-zinc-50/90">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-6 text-[11px] text-zinc-500 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-6 md:px-10">
          <p className="order-2 text-center md:order-1 md:text-left">
            © {year} 灵壳科技{" "}
            <span className="font-sans font-medium tracking-[0.14em] text-zinc-600">LINGKE</span>
            <span className="mx-2 text-zinc-300" aria-hidden>
              ·
            </span>
            lingke.studio
          </p>
          <p className="order-1 flex flex-wrap items-center justify-center gap-3 md:order-2">
            <span className="rounded border border-zinc-200/90 bg-white px-2 py-0.5 text-[10px] tracking-wide text-zinc-500">
              公安备案号待登记
            </span>
            <span className="rounded border border-zinc-200/90 bg-white px-2 py-0.5 text-[10px] tracking-wide text-zinc-500">
              ICP 备案号待登记
            </span>
          </p>
          <div className="order-3 flex justify-center gap-6 md:justify-end">
            <HomeHashLink to={homeHash.mainContent} className={linkMuted}>
              站点地图
            </HomeHashLink>
            <HomeHashLink to={homeHash.contact} className={linkMuted}>
              法律与合规咨询
            </HomeHashLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
