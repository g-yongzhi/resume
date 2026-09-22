/**
 * 精选案例（#work）：分类 Tab + 上排 2 大 + 下排 3 小
 * ===========================================================================
 * 【加案例】在 PROJECTS 数组里追加对象；filter 必须对应 FILTER_TABS 里除「全部」外的 id（含 h5）。本区块 `id="work"` 与 `../lib/homeNav` 中 `homeHash.work` 一致。若填写 `detailPath`，卡片链到站内案例子页；否则仍指向联系区。
 * 【改 Tab 文案】改 FILTER_TABS。
 * 【缩略图】image 用外链 URL 或放到 public/ 后写 "/xxx.jpg"。
 * 【布局】filtered 前 2 条进 featured，第 3～5 条进下面一行；筛选项导致不足 5 条时自动少格。
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { homeHash, HomeHashLink } from "../lib/homeNav";
import { useCursor } from "../context/CursorContext";
import type { CasePalette } from "../data/workCases";
import { extractPaletteFromCover } from "../lib/extractPaletteFromCover";
import {
  fadeInUp,
  sectionEyebrowClass,
  sectionHeaderStagger,
  sectionTitleClass,
  viewportFade,
} from "../lib/motionFade";

/** 案例卡片外框：大卡与三卡共用，避免两处 class 漂移 */
const WORK_CARD_LINK_CLASS =
  "relative block overflow-hidden rounded-xl border border-black/5 bg-gray-300 outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EBEBEB]";

type FilterId = "all" | "web" | "mini" | "app" | "h5";

/** 顶部分类按钮：id 要和 Project.filter 对应（web / mini / app / h5） */
const FILTER_TABS: { id: FilterId; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "web", label: "网站定制" },
  { id: "mini", label: "小程序" },
  { id: "app", label: "App 开发" },
  { id: "h5", label: "H5 开发" },
];

/** 网站横图用 cover；小程序竖屏截屏用 mini-portrait（居中手机框，避免横版强裁模糊） */
type ProjectImageVariant = "cover" | "mini-portrait";

type Project = {
  id: string;
  filter: Exclude<FilterId, "all">;
  typeLabel: string;
  title: string;
  line: string;
  keyword: string;
  image: string;
  /** 若填写，则卡片进入案例子页而非联系区 */
  detailPath?: string;
  imageVariant?: ProjectImageVariant;
};

function resolveImageVariant(project: Project): ProjectImageVariant {
  return project.imageVariant ?? (project.filter === "mini" ? "mini-portrait" : "cover");
}

/** 取色失败或跨域图时使用的中性底（与旧版冷灰接近） */
const FALLBACK_MINI_COVER_PALETTE: CasePalette = {
  paper: "#f1f4f8",
  mist: "#e2e8f0",
  cinnabar: "#475569",
  brass: "#64748b",
};

/** 从封面抽样主色（仅同域图可靠）；用于小程序卡片画布与强调色 */
function useCoverPalette(imageSrc: string): CasePalette {
  const [palette, setPalette] = useState<CasePalette>(FALLBACK_MINI_COVER_PALETTE);

  useEffect(() => {
    if (!imageSrc) {
      setPalette(FALLBACK_MINI_COVER_PALETTE);
      return;
    }
    let cancelled = false;
    setPalette(FALLBACK_MINI_COVER_PALETTE);
    void extractPaletteFromCover(imageSrc).then((p) => {
      if (!cancelled && p) setPalette(p);
    });
    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  return palette;
}

/** 案例数据源：增删项目只改这里 */
const PROJECTS: readonly Project[] = [
  {
    id: "jingwei-futea",
    filter: "web",
    typeLabel: "网站定制",
    title: "泾渭茯茶官方网站",
    line: "文化茶饮品牌的叙事型官网与产品展示体系",
    keyword: "BRAND WEB",
    image: "/cases/website-case-01/shouye-hero.png",
    detailPath: "/work/jingwei-futea",
  },
  {
    id: "wuahi-hotel",
    filter: "web",
    typeLabel: "网站定制",
    title: "西安华海酒店官方网站",
    line: "园林式商务会议酒店：预订、全景与奢华客房叙事官网",
    keyword: "LUXURY WEB",
    image: "/cases/wuahi-hotel/cover.png",
    detailPath: "/work/wuahi-hotel",
  },
  {
    id: "spa-case-01",
    filter: "web",
    typeLabel: "网站定制",
    title: "四季花城 SPA 官方网站",
    line: "全国直营连锁 · 男士专业抗衰调养与品牌官网",
    keyword: "SPA BRAND",
    image: "/cases/spa-case-01/spa.png",
    detailPath: "/work/spa-case-01",
  },
  {
    id: "landwave-education",
    filter: "web",
    typeLabel: "网站定制",
    title: "澜大教育官方网站",
    line: "留学语培门户：课程中心、资讯头条与在线咨询留资",
    keyword: "EDU PORTAL",
    image: "/cases/landwave-education/cover.png",
    detailPath: "/work/landwave-education",
  },
  {
    id: "ailand-jewelry",
    filter: "web",
    typeLabel: "网站定制",
    title: "爱恋珠宝官方网站",
    line: "全屏系列叙事：极地之光与经典珠宝的品牌官网",
    keyword: "LUXURY RETAIL",
    image: "/cases/ailand-jewelry/cover.png",
    detailPath: "/work/ailand-jewelry",
  },
  {
    id: "showroom",
    filter: "web",
    typeLabel: "网站定制",
    title: "灵壳数字化展厅",
    line: "极致 3D 视觉叙事与性能优化",
    keyword: "3D INTERACTIVE",
    // 稳定可用的展厅 / 科技视觉类配图（避免首张裂图）
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=2000&q=85",
  },
  {
    id: "taixijia",
    filter: "mini",
    typeLabel: "小程序",
    title: "泰熙家",
    line: "餐饮点餐 · 堂食自提与门店订单",
    keyword: "F&B ORDERING",
    image: "/cases/taixijia-mini/cover.png",
    detailPath: "/mini/taixijia",
  },
  {
    id: "lianyin",
    filter: "mini",
    typeLabel: "小程序",
    title: "恋银手作",
    line: "珠宝零售 · 会员等级与积分卡券",
    keyword: "MEMBER RETAIL",
    image: "/cases/lianyin-mini/cover.png",
    detailPath: "/mini/lianyin",
  },
  {
    id: "tingmanyi",
    filter: "mini",
    typeLabel: "小程序",
    title: "婷曼逸时尚女装",
    line: "品牌女装电商 · 分类导购与商详购物车",
    keyword: "FASHION RETAIL",
    image: "/cases/tingmanyi-mini/cover.png",
    detailPath: "/mini/tingmanyi",
  },
  {
    id: "qinghe-24h",
    filter: "mini",
    typeLabel: "小程序",
    title: "青禾24小时自助棋牌室",
    line: "棋牌娱乐台球 · 预约包间与卡券套餐",
    keyword: "SELF-SERVICE MAHJONG",
    image: "/cases/qinghe-24h-mini/cover.png",
    detailPath: "/mini/qinghe-24h",
  },
  {
    id: "yueqiwan",
    filter: "mini",
    typeLabel: "小程序",
    title: "约起玩",
    line: "社群主题游 · 同频约搭子社交旅游平台",
    keyword: "SOCIAL TRAVEL",
    image: "/cases/yueqiwan-mini/cover.png",
    detailPath: "/mini/yueqiwan",
  },
  {
    id: "certificate-assistant",
    filter: "app",
    typeLabel: "App 开发",
    title: "证件管理助手",
    line: "快速办事指南 · 证照办理与城市管理",
    keyword: "CIVIC UTILITY",
    image: "/cases/certificate-assistant-app/cover.png",
    detailPath: "/app/certificate-assistant",
    imageVariant: "mini-portrait",
  },
  {
    id: "youpin-tianxia",
    filter: "app",
    typeLabel: "App 开发",
    title: "优品天下",
    line: "穿搭收纳 · 造型工具与多账本记账",
    keyword: "LIFESTYLE APP",
    image: "/cases/youpin-tianxia-app/cover.png",
    detailPath: "/app/youpin-tianxia",
    imageVariant: "mini-portrait",
  },
  {
    id: "haihaome",
    filter: "app",
    typeLabel: "App 开发",
    title: "还好么",
    line: "每日健康签到 · 亲友守护与能量激励",
    keyword: "WELLNESS CHECK-IN",
    image: "/cases/haihaome-app/cover.png",
    detailPath: "/app/haihaome",
    imageVariant: "mini-portrait",
  },
  {
    id: "youya",
    filter: "app",
    typeLabel: "App 开发",
    title: "游鸭",
    line: "本地活动结伴 · 搭子与向导服务",
    keyword: "LOCAL SOCIAL",
    image: "/cases/youya-app/cover.png",
    detailPath: "/app/youya",
    imageVariant: "mini-portrait",
  },
  {
    id: "diaoyuren",
    filter: "app",
    typeLabel: "App 开发",
    title: "钓鱼人",
    line: "钓场天气与社区 · 正品渔具商城",
    keyword: "ANGLER UTILITY",
    image: "/cases/diaoyuren-app/cover.png",
    detailPath: "/app/diaoyuren",
    imageVariant: "mini-portrait",
  },
  {
    id: "neura",
    filter: "app",
    typeLabel: "App 开发",
    title: "NEURA 智能监控",
    line: "毫秒级原生体验与跨端同步",
    keyword: "NATIVE PERFORMANCE",
    image:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=2000&q=85",
  },
  {
    id: "supply",
    filter: "app",
    typeLabel: "应用开发",
    title: "数字化供应链管理",
    line: "复杂流程的极简交互重塑",
    keyword: "PIPELINE UX",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=85",
  },
  {
    id: "brand-site",
    filter: "web",
    typeLabel: "网站定制",
    title: "科技品牌官网重塑",
    line: "叙事节奏与组件化设计系统一体落地",
    keyword: "BRAND SYSTEM",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85",
  },
  {
    id: "overseas-drama-h5",
    filter: "h5",
    typeLabel: "H5 开发",
    title: "海外短剧平台 H5",
    line: "投放级暗黑信息流 · 竖屏剧场与福利增长",
    keyword: "DRAMA H5",
    image: "/cases/overseas-drama-h5/cover.png",
    detailPath: "/h5/overseas-drama",
    imageVariant: "mini-portrait",
  },
  {
    id: "marisfrolg-match3-h5",
    filter: "h5",
    typeLabel: "H5 开发",
    title: "消消乐 H5丨玛丝菲尔 · 会员节消消乐",
    line: "会员节主题闯关 · 奖品池与排行榜一体化活动页",
    keyword: "MATCH-3 H5",
    image: "/cases/marisfrolg-match3-h5/cover.png",
    detailPath: "/h5/marisfrolg-match3",
    imageVariant: "mini-portrait",
  },
  {
    id: "balabala-poster-h5",
    filter: "h5",
    typeLabel: "H5 开发",
    title: "海报 DIY H5丨森马服饰—巴拉巴拉 · 带娃姿势",
    line: "加载首屏 · 身份分流 · 海报拼贴工坊与邀友开奖",
    keyword: "POSTER DIY H5",
    image: "/cases/balabala-poster-h5/cover.png",
    detailPath: "/h5/balabala-poster-diy",
    imageVariant: "mini-portrait",
  },
  {
    id: "h5-campaign",
    filter: "h5",
    typeLabel: "H5 开发",
    title: "品牌年度传播互动 H5",
    line: "全机型适配与动效叙事，微信/浏览器双端一致体验",
    keyword: "CAMPAIGN H5",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=2000&q=85",
  },
];

/** 图片加载失败时显示灰色底，避免裂图 */
function CoverImage({
  src,
  alt,
  eager,
}: {
  src: string;
  alt: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <>
      <motion.div className="absolute inset-0 z-0 bg-zinc-300" aria-hidden />
      {!failed ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 z-[1] h-full w-full object-cover transform-gpu will-change-transform transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : undefined}
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : null}
    </>
  );
}

function miniPortraitCanvasStyle(p: CasePalette): CSSProperties {
  const top = `color-mix(in srgb, ${p.paper} 90%, white)`;
  const bottom = `color-mix(in srgb, ${p.mist} 62%, ${p.cinnabar} 22%)`;
  return {
    background: `radial-gradient(ellipse 74% 80% at 50% 24%, color-mix(in srgb, ${p.paper} 86%, white) 0%, transparent 56%),
      linear-gradient(170deg, ${top} 0%, ${p.mist} 46%, ${bottom} 100%)`,
  };
}

function miniPortraitAmbientStyle(p: CasePalette): CSSProperties {
  return {
    background: `radial-gradient(circle, color-mix(in srgb, ${p.cinnabar} 26%, transparent) 0%, transparent 72%)`,
  };
}

/** 小程序竖屏截图：画布与设备描边随封面主色自适应（同域图取色） */
function MiniPortraitCardVisual({
  src,
  alt,
  compact,
  eager,
  palette,
}: {
  src: string;
  alt: string;
  compact?: boolean;
  eager?: boolean;
  palette: CasePalette;
}) {
  const [failed, setFailed] = useState(false);

  const shellStyle: CSSProperties = {
    boxShadow: `0 22px 52px -24px color-mix(in srgb, ${palette.cinnabar} 26%, transparent), 0 4px 16px -6px rgba(15,23,42,0.07)`,
    border: `1px solid color-mix(in srgb, ${palette.cinnabar} 14%, ${palette.paper})`,
  };

  const screenWell: CSSProperties = {
    backgroundColor: `color-mix(in srgb, ${palette.paper} 38%, #fafafa)`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${palette.cinnabar} 8%, transparent)`,
  };

  const notchStyle: CSSProperties = {
    backgroundColor: `color-mix(in srgb, ${palette.mist} 50%, white)`,
  };

  return (
    <>
      <motion.div aria-hidden className="absolute inset-0 z-0" style={miniPortraitCanvasStyle(palette)} />
      <motion.div
        className={`absolute inset-0 z-[1] flex items-center justify-center ${
          compact ? "px-5 py-6 sm:px-6" : "px-6 py-7 sm:px-8 sm:py-8"
        }`}
      >
        <motion.div
          className={`relative flex h-full w-auto shrink-0 ${
            compact ? "max-h-[min(100%,300px)]" : "max-h-[min(100%,min(72vh,440px))]"
          } max-w-[46%] min-w-[108px] sm:max-w-[42%] sm:min-w-[120px] md:max-w-[38%] md:min-w-[132px]`}
          style={{ aspectRatio: "9 / 19.5" }}
          whileHover={{ y: -2, scale: 1.012 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <div
            className="absolute -inset-[12%] -z-10 rounded-[1.75rem] opacity-75 blur-2xl"
            style={miniPortraitAmbientStyle(palette)}
            aria-hidden
          />
          <div
            className="flex h-full w-full flex-col rounded-[1.2rem] bg-white p-[5px]"
            style={shellStyle}
          >
            <div
              className="mx-auto mt-[4px] h-[4px] w-[24%] shrink-0 rounded-full"
              style={notchStyle}
              aria-hidden
            />
            <motion.div
              className="relative mt-[5px] min-h-0 flex-1 overflow-hidden rounded-[0.72rem]"
              style={screenWell}
            >
              {!failed ? (
                <img
                  src={src}
                  alt={alt}
                  className="h-full w-full object-cover object-top"
                  loading={eager ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={eager ? "high" : undefined}
                  draggable={false}
                  onError={() => setFailed(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-zinc-400">
                  SCREEN
                </div>
              )}
            </motion.div>
            <div
              className="mx-auto mb-[3px] mt-[5px] h-[2.5px] w-[28%] rounded-full opacity-90"
              style={notchStyle}
              aria-hidden
            />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

function WorkCardMedia({
  project,
  eager,
  compact,
  coverPalette,
}: {
  project: Project;
  eager?: boolean;
  compact?: boolean;
  /** 小程序封面取色；网站横图不传 */
  coverPalette?: CasePalette;
}) {
  const variant = resolveImageVariant(project);
  if (variant === "mini-portrait") {
    return (
      <MiniPortraitCardVisual
        src={project.image}
        alt={project.title}
        compact={compact}
        eager={eager}
        palette={coverPalette ?? FALLBACK_MINI_COVER_PALETTE}
      />
    );
  }
  return <CoverImage src={project.image} alt={project.title} eager={eager} />;
}

/** 右上角英文标签：网站类偏暖金；小程序在取色后使用封面主色强调 */
function KeywordBadge({
  children,
  tone = "warm",
  accentColor,
}: {
  children: string;
  tone?: "warm" | "cool";
  accentColor?: string;
}) {
  if (accentColor) {
    return (
      <span
        className="pointer-events-none absolute right-3 top-3 z-[25] max-w-[58%] text-right font-sans text-[10px] font-semibold uppercase tracking-[0.14em] drop-shadow-[0_1px_0_rgba(255,255,255,0.88)] md:right-4 md:top-4"
        style={{ color: accentColor }}
      >
        {children}
      </span>
    );
  }
  const cls =
    tone === "cool"
      ? "text-zinc-600 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"
      : "text-[#C5A059]";
  return (
    <span
      className={`pointer-events-none absolute right-3 top-3 z-[25] max-w-[58%] text-right font-sans text-[10px] font-semibold uppercase tracking-[0.14em] md:right-4 md:top-4 ${cls}`}
    >
      {children}
    </span>
  );
}

/** 图内底部渐变上的标题与说明（始终可见）；compact 给下面一排稍小字号 */
function ImageInfoOverlay({
  project,
  compact,
  tone = "warm",
  accentColor,
}: {
  project: Project;
  compact?: boolean;
  tone?: "warm" | "cool";
  accentColor?: string;
}) {
  const cool = tone === "cool";
  const grad = cool
    ? "bg-gradient-to-t from-slate-900/[0.9] via-slate-800/55 to-transparent"
    : "bg-gradient-to-t from-black/[0.94] via-black/60 to-transparent";
  const typeCls = accentColor === undefined ? (cool ? "text-sky-200/95" : "text-[#C5A059]") : "";
  const typeStyle: CSSProperties | undefined = accentColor ? { color: accentColor } : undefined;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
      <div
        className={`${grad} ${
          compact ? "px-4 pb-4 pt-10 md:px-5 md:pb-5" : "px-5 pb-5 pt-16 md:px-6 md:pb-6 md:pt-20"
        }`}
      >
        <p
          className={`font-sans font-semibold uppercase tracking-[0.28em] ${typeCls} drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] ${
            compact ? "text-[9px]" : "text-[10px]"
          }`}
          style={typeStyle}
        >
          {project.typeLabel}
        </p>
        <h3
          className={`mt-1.5 font-sans font-bold leading-snug tracking-tight text-white ${
            compact ? "text-sm md:text-[15px]" : "text-base md:text-lg lg:text-xl"
          }`}
        >
          {project.title}
        </h3>
        <p
          className={`mt-1.5 font-sans leading-relaxed text-white/90 ${
            compact ? "text-[11px] md:text-[12px] line-clamp-2" : "text-[12px] md:text-[13px] line-clamp-2"
          }`}
        >
          {project.line}
        </p>
      </div>
    </div>
  );
}

/** 鼠标悬停时略微压暗（小程序浅底用更轻的遮罩） */
function HoverDimLayer({ tone = "warm" }: { tone?: "warm" | "cool" }) {
  if (tone === "cool") {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-[15] bg-slate-900 opacity-[0.05] transition-opacity duration-200 ease-out group-hover:opacity-[0.14]"
        aria-hidden
      />
    );
  }
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[15] bg-black opacity-[0.18] transition-opacity duration-200 ease-out group-hover:opacity-[0.4]"
      aria-hidden
    />
  );
}

/** 有 detailPath 时进入案例子页，否则进入联系区 */
function WorkCardLink({
  project,
  className,
  children,
}: {
  project: Project;
  className: string;
  children: ReactNode;
}) {
  if (project.detailPath) {
    return (
      <Link to={project.detailPath} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <HomeHashLink to={homeHash.contact} className={className}>
      {children}
    </HomeHashLink>
  );
}

/** 第一行大卡：比例 aspect-[16/10] 等在此组件改 */
function FeaturedCard({ project, eagerLoad }: { project: Project; eagerLoad?: boolean }) {
  const mini = resolveImageVariant(project) === "mini-portrait";
  const tone = mini ? "cool" : "warm";
  const coverPalette = useCoverPalette(mini ? project.image : "");
  const accentColor = mini ? coverPalette.cinnabar : undefined;
  const typeAccentColor = mini ? coverPalette.brass : undefined;

  return (
    <article className="group min-w-0">
      <WorkCardLink
        project={project}
        className={WORK_CARD_LINK_CLASS}
        aria-label={`${project.title}，查看详情`}
      >
        <motion.div
          className={`relative isolate w-full min-h-[200px] sm:min-h-[240px] md:min-h-0 ${
            mini ? "aspect-[16/11] md:aspect-[16/10]" : "aspect-[16/10] md:aspect-[16/9]"
          }`}
        >
          <WorkCardMedia project={project} eager={eagerLoad} coverPalette={mini ? coverPalette : undefined} />
          <HoverDimLayer tone={tone} />
          <KeywordBadge tone={tone} accentColor={accentColor}>
            {project.keyword}
          </KeywordBadge>
          <ImageInfoOverlay project={project} tone={tone} accentColor={typeAccentColor} />
        </motion.div>
      </WorkCardLink>
    </article>
  );
}

/** 第二行三卡：16:9 + compact 叠字 */
function CompactCard({ project }: { project: Project }) {
  const mini = resolveImageVariant(project) === "mini-portrait";
  const tone = mini ? "cool" : "warm";
  const coverPalette = useCoverPalette(mini ? project.image : "");
  const accentColor = mini ? coverPalette.cinnabar : undefined;
  const typeAccentColor = mini ? coverPalette.brass : undefined;

  return (
    <article className="group min-w-0">
      <WorkCardLink
        project={project}
        className={WORK_CARD_LINK_CLASS}
        aria-label={`${project.title}，查看详情`}
      >
        <motion.div
          className={`relative isolate w-full ${mini ? "aspect-[4/3]" : "aspect-video"}`}
        >
          <WorkCardMedia project={project} compact coverPalette={mini ? coverPalette : undefined} />
          <HoverDimLayer tone={tone} />
          <KeywordBadge tone={tone} accentColor={accentColor}>
            {project.keyword}
          </KeywordBadge>
          <ImageInfoOverlay project={project} compact tone={tone} accentColor={typeAccentColor} />
        </motion.div>
      </WorkCardLink>
    </article>
  );
}

export function SelectedWork() {
  /** 鼠标进整块案例区时，自定义光标切「探索」样式（见 CursorContext） */
  const { setVariant } = useCursor();
  const [filter, setFilter] = useState<FilterId>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return [...PROJECTS];
    return PROJECTS.filter((p) => p.filter === filter);
  }, [filter]);

  /** 筛选后：前两条上大图区，第 3～5 条进下一行（最多显示 5 条） */
  const featured = filtered.slice(0, 2);
  const rowBottom = filtered.slice(2, 5);

  return (
    <section
      id="work"
      className="w-full bg-[#EBEBEB]"
      onMouseEnter={() => setVariant("explore")}
      onMouseLeave={() => setVariant("default")}
    >
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <motion.div
          className="mb-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] md:items-end md:gap-x-10"
          variants={sectionHeaderStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportFade}
        >
          <div className="md:col-span-2 lg:col-span-1">
            <motion.p variants={fadeInUp} className={sectionEyebrowClass}>
              02 / WORK
            </motion.p>
            <motion.h2 variants={fadeInUp} className={`max-w-xl ${sectionTitleClass}`}>
              精选案例
            </motion.h2>
          </div>
          <motion.p
            variants={fadeInUp}
            className="text-[13px] font-normal leading-relaxed text-[#666666] md:self-end md:text-[14px]"
          >
            我们不只是在写代码，更是在雕琢品牌的数字门面，见证从平庸到卓越的跨越。
          </motion.p>
        </motion.div>

        <div
          className="mb-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-black/[0.06] pb-4"
          role="tablist"
          aria-label="案例分类"
        >
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={`relative pb-2 font-sans text-[13px] transition-colors md:text-[14px] ${
                  active
                    ? "font-bold text-[#111]"
                    : "font-normal text-[#737373] hover:text-[#111]"
                }`}
              >
                {tab.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#C5A059] transition-opacity duration-300 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center font-sans text-[14px] text-[#737373]">
            该分类下暂无案例，试试「全部」。
          </p>
        ) : (
          <motion.div layout className="flex flex-col gap-8 md:gap-10 lg:gap-12">
            {featured.length > 0 ? (
              <div className="grid grid-cols-1 min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
                {featured.map((p, i) => (
                  <FeaturedCard key={p.id} project={p} eagerLoad={i === 0} />
                ))}
              </div>
            ) : null}

            {rowBottom.length > 0 ? (
              <div className="grid grid-cols-1 min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {rowBottom.map((p) => (
                  <CompactCard key={p.id} project={p} />
                ))}
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </section>
  );
}
