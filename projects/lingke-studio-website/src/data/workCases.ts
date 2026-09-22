/**
 * 网站定制案例数据 —— 在 `WORK_CASES` 追加一条 + 封面图放 `public`。
 *
 * ## 两种录入方式
 *
 * **A. 手动品牌色（最准）**  
 * 填 `palette` + 可选 `visualIdentity`（色板格文案、字体说明等）。适合已定稿 VI 的项目。
 *
 * **B. 极简：只要「外站网址 + 首页截图」**（仍建议写客户名称 `heroTitle`）  
 * 1. 设 `paletteFromCover: true`，并把 `coverImage` 指向本站 **同域** 图片（如 `/cases/xxx/cover.png`）。  
 * 2. 子页打开后会在浏览器里从封面 **自动抽样四色**，驱动首屏背景、设备框、视觉识别色块（未手写 `visualIdentity.swatches` 时，色块说明为通用中文标签 + 自动 hex）。  
 * 3. **无法从网址自动抓取** 客户真实字体/VI 手册；字体区仍为模板默认（或你在该条里写 `visualIdentity` 覆盖）。  
 * 4. 跨域外链图无法读像素，取色会失败并回退到默认色板。
 *
 * 【必填】slug、heroTitle、liveUrl、coverImage  
 * 【建议】tagline、locationLine、seoDescription（均可省略，子页会用简短默认文案）  
 * 【可选】palette、paletteFromCover、visualIdentity、heroAtmosphere、metaRows、themeColor
 *
 * 首页作品卡片：`SelectedWork` 里 `detailPath: "/work/{slug}"`。
 */
export type CasePalette = {
  paper: string;
  mist: string;
  cinnabar: string;
  brass: string;
};

/** 视觉识别色板格：每条案例可写任意条（常见 4 格）；不写则从 palette 拆四条并带默认说明 */
export type CaseSwatch = { hex: string; label: string };

export type CaseVisualIdentity = {
  sectionEyebrow?: string;
  sectionTitle?: string;
  cnTypefaceLabel?: string;
  cnTypefaceName?: string;
  /** 展示用 font-family，需与站点已加载字体一致或系统栈 */
  cnTypefaceCss?: string;
  cnScaleLine?: string;
  enTypefaceLabel?: string;
  enTypefaceName?: string;
  enTypefaceCss?: string;
  enScaleLine?: string;
  swatches?: CaseSwatch[];
};

/** 首屏氛围层 CSS；任一项省略时由 resolveHeroAtmosphere 用 palette 推导 */
export type CaseHeroAtmosphere = {
  baseGradient?: string;
  accentRadial?: string;
  vignette?: string;
  /** 右侧主色光斑不透明度 0–1，默认 0.45 */
  accentOpacity?: number;
};

export type WorkCaseMetaRow = { label: string; value: string };

export type ResolvedVisualIdentity = {
  sectionEyebrow: string;
  sectionTitle: string;
  cnTypefaceLabel: string;
  cnTypefaceName: string;
  cnTypefaceCss: string;
  cnScaleLine: string;
  enTypefaceLabel: string;
  enTypefaceName: string;
  enTypefaceCss: string;
  enScaleLine: string;
  swatches: CaseSwatch[];
};

export type WorkCase = {
  slug: string;
  heroTitle: string;
  /** 省略则子页显示简短默认说明 */
  tagline?: string;
  /** 省略则显示「项目案例」 */
  locationLine?: string;
  liveUrl: string;
  /** public 下路径，如 /cases/jingwei/cover.png（取色须同域） */
  coverImage: string;
  /** 浏览器标签；未填则用 heroTitle */
  seoTitle?: string;
  /** 省略则生成一句通用 SEO 描述 */
  seoDescription?: string;
  themeColor?: string;
  palette?: Partial<CasePalette>;
  /**
   * 为 true 时：在子页根据 `coverImage` 用 canvas 抽样生成四色（与 `palette` 合并，手写项优先）。
   * 仅同域图片可靠；不配 `palette` 时也能随封面变主色。
   */
  paletteFromCover?: boolean;
  visualIdentity?: CaseVisualIdentity;
  heroAtmosphere?: CaseHeroAtmosphere;
  metaRows?: WorkCaseMetaRow[];
};

const defaultPalette: CasePalette = {
  paper: "#ffffff",
  mist: "#efece9",
  cinnabar: "#8c2620",
  brass: "#958a70",
};

export function resolvePalette(caseData: WorkCase): CasePalette {
  return { ...defaultPalette, ...caseData.palette };
}

/** 封面取色成功时与默认、手写 palette 合并（手写键优先） */
export function mergeCoverPalette(caseData: WorkCase, fromCover: CasePalette): CasePalette {
  return { ...defaultPalette, ...fromCover, ...caseData.palette };
}

export function resolveSeoDescription(caseData: WorkCase): string {
  return (
    caseData.seoDescription ??
    `「${caseData.heroTitle}」网站定制案例展示 — 灵壳 LINGKE。以下为首页摘录示意，实际内容以外站为准。`
  );
}

export function resolveTagline(caseData: WorkCase): string {
  return caseData.tagline ?? `${caseData.heroTitle} · 定制官网 / 首页展示`;
}

export function resolveLocationLine(caseData: WorkCase): string {
  return caseData.locationLine ?? "项目案例";
}

const viFallback = {
  sectionEyebrow: "01. Visual Recognition",
  sectionTitle: "视觉识别",
  cnTypefaceLabel: "中文字体",
  cnTypefaceName: "微软雅黑",
  cnTypefaceCss: '"Microsoft YaHei","PingFang SC",sans-serif',
  cnScaleLine: "字阶参考 · 46px / 44px / 16px",
  enTypefaceLabel: "英文字体",
  enTypefaceName: "Arial",
  enTypefaceCss: "Arial, sans-serif",
  enScaleLine: "字阶参考 · 46px / 44px / 16px",
} as const;

export function defaultSwatchesFromPalette(p: CasePalette): CaseSwatch[] {
  return [
    { hex: p.paper, label: "主背景 / 留白" },
    { hex: p.mist, label: "铺色 / 分隔" },
    { hex: p.cinnabar, label: "主品牌色" },
    { hex: p.brass, label: "辅助点缀色" },
  ];
}

export function resolveVisualIdentity(caseData: WorkCase, palette: CasePalette): ResolvedVisualIdentity {
  const v = caseData.visualIdentity ?? {};
  const swatches = v.swatches?.length ? v.swatches : defaultSwatchesFromPalette(palette);
  return {
    sectionEyebrow: v.sectionEyebrow ?? viFallback.sectionEyebrow,
    sectionTitle: v.sectionTitle ?? viFallback.sectionTitle,
    cnTypefaceLabel: v.cnTypefaceLabel ?? viFallback.cnTypefaceLabel,
    cnTypefaceName: v.cnTypefaceName ?? viFallback.cnTypefaceName,
    cnTypefaceCss: v.cnTypefaceCss ?? viFallback.cnTypefaceCss,
    cnScaleLine: v.cnScaleLine ?? viFallback.cnScaleLine,
    enTypefaceLabel: v.enTypefaceLabel ?? viFallback.enTypefaceLabel,
    enTypefaceName: v.enTypefaceName ?? viFallback.enTypefaceName,
    enTypefaceCss: v.enTypefaceCss ?? viFallback.enTypefaceCss,
    enScaleLine: v.enScaleLine ?? viFallback.enScaleLine,
    swatches,
  };
}

export type ResolvedHeroAtmosphere = {
  baseGradient: string;
  accentRadial: string;
  vignette: string;
  accentOpacity: number;
};

export function resolveHeroAtmosphere(caseData: WorkCase, palette: CasePalette): ResolvedHeroAtmosphere {
  const h = caseData.heroAtmosphere ?? {};
  const { paper, mist, brass, cinnabar } = palette;
  const baseGradient =
    h.baseGradient ??
    `linear-gradient(108deg,
      ${paper} 0%,
      color-mix(in srgb, ${mist} 88%, ${brass}) 16%,
      color-mix(in srgb, ${brass} 52%, ${cinnabar}) 38%,
      color-mix(in srgb, ${cinnabar} 48%, #2a2220) 62%,
      color-mix(in srgb, ${cinnabar} 22%, #141110) 82%,
      #171210 100%)`;
  const accentRadial =
    h.accentRadial ??
    `radial-gradient(ellipse 65% 55% at 72% 32%, color-mix(in srgb, ${cinnabar} 70%, transparent), transparent 58%)`;
  const vignette =
    h.vignette ?? "radial-gradient(ellipse 100% 90% at 0% 100%, #0a0808, transparent 50%)";
  return {
    baseGradient,
    accentRadial,
    vignette,
    accentOpacity: h.accentOpacity ?? 0.45,
  };
}

export const WORK_CASES: readonly WorkCase[] = [
  {
    slug: "jingwei-futea",
    heroTitle: "泾渭茯茶",
    tagline: "茶叶企业 / 定制设计 / 高端网站",
    locationLine: "客户所在区域 · 陕西",
    liveUrl: "http://www.jingweifutea.com/",
    coverImage: "/cases/website-case-01/shouye-hero.png",
    seoTitle: "泾渭茯茶官方网站 — 网站定制案例 | 灵壳 LINGKE",
    seoDescription:
      "文化茶饮品牌官网：分屏叙事、设备级呈现与可维护内容架构——灵壳网站定制案例。",
    themeColor: "#1c1715",
    palette: {
      paper: "#f7f3ed",
      mist: "#e8dfd4",
      cinnabar: "#8c2620",
      brass: "#b89b6a",
    },
    visualIdentity: {
      sectionEyebrow: "01. Visual Recognition",
      sectionTitle: "视觉识别",
      cnTypefaceLabel: "中文字体",
      cnTypefaceName: "微软雅黑",
      cnTypefaceCss: '"Microsoft YaHei","PingFang SC",sans-serif',
      cnScaleLine: "字阶参考 · 标题 46px / 小标题 44px / 正文 16px",
      enTypefaceLabel: "英文字体",
      enTypefaceName: "Arial",
      enTypefaceCss: "Arial, Helvetica, sans-serif",
      enScaleLine: "字阶参考 · Display 46px / Lead 44px / Body 16px",
      swatches: [
        { hex: "#f7f3ed", label: "纸色底 / 留白与阅读区" },
        { hex: "#e8dfd4", label: "茶区铺色 / 分隔与卡片底" },
        { hex: "#8c2620", label: "茯茶绛红 / 主视觉与强调" },
        { hex: "#b89b6a", label: "古金点缀 / 纹样与次级强调" },
      ],
    },
    metaRows: [
      { label: "客户 / 行业", value: "泾渭茯茶 · 文化茶饮" },
      { label: "交付", value: "品牌官网 · 响应式 · 栏目规划" },
      { label: "灵壳角色", value: "设计 · 前端体验 · 交付协同" },
    ],
  },
  {
    slug: "wuahi-hotel",
    heroTitle: "西安华海酒店",
    tagline: "高端酒店 / 官网定制 / 预订与品牌体验",
    locationLine: "客户所在区域 · 陕西西安",
    liveUrl: "http://www.wuahihotel.com/",
    coverImage: "/cases/wuahi-hotel/cover.png",
    seoTitle: "西安华海酒店官方网站 — 网站定制案例 | 灵壳 LINGKE",
    seoDescription:
      "园林式商务会议型酒店官网：奢华客房展示、在线预订与 360° 全景等功能模块——灵壳网站定制案例。",
    themeColor: "#0f172a",
    palette: {
      paper: "#f4f1ea",
      mist: "#e2dcd2",
      cinnabar: "#152238",
      brass: "#c4a055",
    },
    visualIdentity: {
      sectionEyebrow: "01. Visual Recognition",
      sectionTitle: "视觉识别",
      cnTypefaceLabel: "中文字体",
      cnTypefaceName: "微软雅黑",
      cnTypefaceCss: '"Microsoft YaHei","PingFang SC",sans-serif',
      cnScaleLine: "字阶参考 · 标题 46px / 小标题 44px / 正文 16px",
      enTypefaceLabel: "英文字体",
      enTypefaceName: "Arial",
      enTypefaceCss: "Arial, Helvetica, sans-serif",
      enScaleLine: "字阶参考 · Display 46px / Lead 44px / Body 16px",
      swatches: [
        { hex: "#f4f1ea", label: "纸色底 / 留白与阅读区" },
        { hex: "#e2dcd2", label: "暖灰铺色 / 分隔与卡片底" },
        { hex: "#152238", label: "华海深海蓝 / 顶栏与主视觉" },
        { hex: "#c4a055", label: "古金强调 / 标识与按钮点缀" },
      ],
    },
    metaRows: [
      { label: "客户 / 行业", value: "西安华海酒店 · WUAHI GRAND HOTEL" },
      { label: "交付", value: "品牌官网 · 预订动线 · 全景与栏目架构" },
      { label: "灵壳角色", value: "设计 · 前端体验 · 交付协同" },
    ],
  },
  {
    slug: "spa-case-01",
    heroTitle: "四季花城",
    tagline: "高端 SPA / 官网定制 / 品牌与预约体验",
    locationLine: "客户所在区域 · 陕西西安",
    liveUrl: "https://www.sjhcspa.com/",
    coverImage: "/cases/spa-case-01/spa.png",
    seoTitle: "四季花城 SPA 官方网站 — 网站定制案例 | 灵壳 LINGKE",
    seoDescription: "全国直营连锁品牌 · 男士专业抗衰调养——灵壳网站定制案例。",
    themeColor: "#14110e",
    /** 不写 palette：打开子页后从封面图自动抽四色；视觉识别色块说明为通用中文 + 实时 hex */
    paletteFromCover: true,
    metaRows: [
      { label: "客户 / 行业", value: "四季花城 · 男士专业 SPA 调养" },
      { label: "交付", value: "品牌官网 · 响应式 · 预约与品牌叙事" },
      { label: "灵壳角色", value: "设计 · 前端体验 · 交付协同" },
    ],
  },
  {
    slug: "landwave-education",
    heroTitle: "澜大教育",
    tagline: "留学语培 / 门户型官网 / 课程与资讯体系",
    locationLine: "客户所在区域 · 上海",
    liveUrl: "https://www.landwave.cn/",
    coverImage: "/cases/landwave-education/cover.png",
    seoTitle: "澜大教育官方网站 — 网站定制案例 | 灵壳 LINGKE",
    seoDescription:
      "托福、雅思、SAT 等留学考试培训门户：课程中心、热门头条、留资条与在线咨询——灵壳网站定制案例。",
    themeColor: "#0d6b63",
    palette: {
      paper: "#ffffff",
      mist: "#e8f2f1",
      cinnabar: "#0f9b8e",
      brass: "#ea6b2d",
    },
    visualIdentity: {
      sectionEyebrow: "01. Visual Recognition",
      sectionTitle: "视觉识别",
      cnTypefaceLabel: "中文字体",
      cnTypefaceName: "微软雅黑",
      cnTypefaceCss: '"Microsoft YaHei","PingFang SC",sans-serif',
      cnScaleLine: "字阶参考 · 标题 46px / 小标题 44px / 正文 16px",
      enTypefaceLabel: "英文字体",
      enTypefaceName: "Arial",
      enTypefaceCss: "Arial, Helvetica, sans-serif",
      enScaleLine: "字阶参考 · Display 46px / Lead 44px / Body 16px",
      swatches: [
        { hex: "#ffffff", label: "主背景 / 顶栏与内容区留白" },
        { hex: "#e8f2f1", label: "浅青灰铺色 / 分隔与卡片底" },
        { hex: "#0f9b8e", label: "澜大青绿 / 课程中心与主按钮" },
        { hex: "#ea6b2d", label: "行动橙 / 价格与留资强调" },
      ],
    },
    metaRows: [
      { label: "客户 / 行业", value: "澜大教育 · 留学考试培训（托福 / 雅思 / SAT 等）" },
      { label: "交付", value: "品牌门户 · 课程导航 · 资讯与留资动线" },
      { label: "灵壳角色", value: "设计 · 前端体验 · 交付协同" },
    ],
  },
  {
    slug: "ailand-jewelry",
    heroTitle: "爱恋珠宝",
    tagline: "珠宝零售 / 品牌官网 / 全屏叙事与系列展示",
    locationLine: "客户所在区域 · 四川成都",
    liveUrl: "https://www.ailend.com/",
    coverImage: "/cases/ailand-jewelry/cover.png",
    seoTitle: "爱恋珠宝官方网站 — 网站定制案例 | 灵壳 LINGKE",
    seoDescription:
      "四川省爱恋珠宝有限公司品牌官网：极地之光等系列全屏主视觉、栏目导航与加盟服务入口——灵壳网站定制案例。",
    themeColor: "#1a3329",
    palette: {
      paper: "#faf9f7",
      mist: "#e6ebe7",
      cinnabar: "#1e3d32",
      brass: "#c6a04a",
    },
    visualIdentity: {
      sectionEyebrow: "01. Visual Recognition",
      sectionTitle: "视觉识别",
      cnTypefaceLabel: "中文字体",
      cnTypefaceName: "微软雅黑",
      cnTypefaceCss: '"Microsoft YaHei","PingFang SC",sans-serif',
      cnScaleLine: "字阶参考 · 标题 46px / 小标题 44px / 正文 16px",
      enTypefaceLabel: "英文字体",
      enTypefaceName: "Georgia",
      enTypefaceCss: "Georgia, 'Times New Roman', serif",
      enScaleLine: "字阶参考 · Display 46px / Lead 44px / Body 16px",
      swatches: [
        { hex: "#faf9f7", label: "暖白底 / 顶栏留白与阅读区" },
        { hex: "#e6ebe7", label: "雾绿灰铺色 / 分隔与辅底" },
        { hex: "#1e3d32", label: "森绿主色 / 主视觉与高级质感" },
        { hex: "#c6a04a", label: "香槟金 / 珠宝高光与标识点缀" },
      ],
    },
    metaRows: [
      { label: "客户 / 行业", value: "爱恋珠宝 · AILAND JEWELRY · 珠宝零售" },
      { label: "交付", value: "品牌官网 · 系列展示 · 加盟与售后入口" },
      { label: "灵壳角色", value: "设计 · 前端体验 · 交付协同" },
    ],
  },
];

export function getWorkCaseBySlug(slug: string | undefined): WorkCase | undefined {
  if (!slug) return undefined;
  return WORK_CASES.find((c) => c.slug === slug);
}
