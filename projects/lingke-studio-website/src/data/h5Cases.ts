/**
 * H5 案例 —— 路由 `/h5/:slug`；配图 `public/cases/{folder}/`。
 * 子页视觉与 App / 小程序案例区分：偏浏览器投放、编辑型叙事与 web-native 动效。
 */
export type H5Screen = {
  src: string;
  caption: string;
  summary?: string;
};

export type H5EditorialBlock = {
  kicker: string;
  body: string;
};

export type H5Capability = {
  title: string;
  description: string;
};

export type H5Case = {
  slug: string;
  heroTitle: string;
  heroLead: string;
  tagline: string;
  coverImage: string;
  screens: readonly H5Screen[];
  editorial: readonly H5EditorialBlock[];
  capabilities: readonly H5Capability[];
  deliverables: readonly string[];
  seoTitle?: string;
  seoDescription?: string;
  themeColor?: string;
  /** 主按钮等强调色，如 `#34d399` */
  accentColor?: string;
  /** Hero 展台背后光晕径向中心色 */
  heroGlow?: string;
  /** 未设置时默认 Campaign / Overseas */
  heroBadge?: { line1: string; line2: string };
};

export const H5_CASES: readonly H5Case[] = [
  {
    slug: "overseas-drama",
    heroTitle: "海外短剧平台",
    heroLead: "H5 投放与活动子站",
    tagline: "在浏览器里做出「流媒体级」叙事，而不是把 App 界面再框一遍。",
    coverImage: "/cases/overseas-drama-h5/cover.png",
    screens: [
      {
        src: "/cases/overseas-drama-h5/cover.png",
        caption: "发现页 · 暗黑信息流",
        summary: "搜索、历史与福利入口；必看短剧横滑海报与 R 独占角标，贴近海外短剧消费心智。",
      },
      {
        src: "/cases/overseas-drama-h5/02-player.png",
        caption: "沉浸播放 · 竖屏剧场",
        summary: "全屏画面 + 右侧互动栈与集数条，承接 TikTok 系交互习惯，便于投放落地后直接转化观看。",
      },
      {
        src: "/cases/overseas-drama-h5/03-welfare.png",
        caption: "福利中心 · 任务与签到",
        summary: "积分总览、七日签到与新手任务分 Tab，用高对比红金在暗色底上拉出 CTA 层级。",
      },
      {
        src: "/cases/overseas-drama-h5/04-profile.png",
        caption: "我的 · 会员与钱包",
        summary: "周卡订阅卡、积分钱包与分销/语言/设置入口，把付费与增长模块收敛在一屏可扫范围内。",
      },
    ],
    editorial: [
      {
        kicker: "01 · Web native",
        body: "H5 运行在浏览器与投放链接中，用户往往「单刀直入」一条活动链路。版式上用横向叙事、 skew 卡片与浏览器视窗隐喻，强调可分享、可嵌入，而不是模拟系统级底部 Tab。",
      },
      {
        kicker: "02 · 与 App 案例的边界",
        body: "App / 小程序案例页侧重设备框与界面胶片，便于对齐交付像素。本页则刻意弱化「手机外壳」，把截屏当作剧场画幅的一部分，让阅读节奏更像专题站或 streaming landing。",
      },
      {
        kicker: "03 · 出海语境",
        body: "英文片名、独占角标与美元周卡等要素，要求在中文说明与国际视觉之间做平衡；色彩与对比度按 OLED 友好方向调校，适配海外机型与夜间阅读。",
      },
    ],
    capabilities: [
      {
        title: "投放级首屏",
        description: "首屏承担渠道参数与剧集钩子，搜索与福利入口并列，减少从广告点击进入后的迷路率。",
      },
      {
        title: "竖屏剧场壳",
        description: "播放态全屏 + 互动数据外露，进度与选集条固定在安全区内，兼容手势与系统返回。",
      },
      {
        title: "增长与留存组件",
        description: "签到、任务分桶与积分总览形成闭环，可在 H5 内完成拉新任务而不强制下载 App。",
      },
      {
        title: "订阅与钱包",
        description: "周卡定价与积分商城并列，支持后续接支付 SDK 与多币种文案扩展。",
      },
      {
        title: "全机型适配",
        description: "安全区、dvh 与横滑容器的组合，覆盖 iOS Safari、Android WebView 与社媒内置浏览器。",
      },
    ],
    deliverables: [
      "响应式页面结构与主题变量（暗色主站 + 强调色）",
      "播放页交互状态与选集抽屉（可对接真实媒资接口）",
      "福利任务配置化 JSON / CMS 字段预留",
      "埋点钩子：曝光、播放、签到、下单转化",
    ],
    themeColor: "#0a0a0a",
    seoTitle: "海外短剧平台 H5 案例 | 灵壳 LINGKE",
    seoDescription:
      "海外短剧平台 H5 投放页：暗黑信息流、竖屏沉浸播放、福利任务与个人中心界面案例 — 灵壳 LINGKE。",
  },
  {
    slug: "marisfrolg-match3",
    heroTitle: "会员节消消乐",
    heroLead: "消消乐 H5 · Marisfrolg 会员节",
    tagline: "以品牌绿为底的轻量闯关：首屏叙事、棋盘关卡、奖品池与排行榜在同一投放链路里闭环。",
    coverImage: "/cases/marisfrolg-match3-h5/cover.png",
    heroBadge: { line1: "H5 · 消消乐", line2: "Marisfrolg 会员节" },
    accentColor: "#3d9a72",
    heroGlow: "rgba(61, 154, 114, 0.2)",
    screens: [
      {
        src: "/cases/marisfrolg-match3-h5/cover.png",
        caption: "活动落地 · 首屏",
        summary: "衣架符号、双语标题与「开始游戏」主 CTA，绿色纵渐变与中心视觉锚定会员节氛围。",
      },
      {
        src: "/cases/marisfrolg-match3-h5/02-game.png",
        caption: "第 1 关 · 棋盘",
        summary: "倒计时与目标分值条、品牌纹样方块矩阵，兼顾可读性与点击热区。",
      },
      {
        src: "/cases/marisfrolg-match3-h5/03-prize-pool.png",
        caption: "奖品池",
        summary: "TOP 榜单礼品与闯关券并列，图文卡 + 官方售价强调，支持后续接 CMS 配置。",
      },
      {
        src: "/cases/marisfrolg-match3-h5/04-leaderboard.png",
        caption: "游戏排名",
        summary: "Tab 切换公告与榜单、表头与「我的成绩」固定行，空态与有数据态共用骨架。",
      },
      {
        src: "/cases/marisfrolg-match3-h5/05-my-prizes.png",
        caption: "我的奖品",
        summary: "弹层内积分券与「立即使用」动作，与侧栏入口（活动公告 / 排行榜等）形成侧边导航结构。",
      },
    ],
    editorial: [
      {
        kicker: "01 · 品牌场",
        body: "会员节类 H5 要在「促销感」与「时装屋气质」之间找平衡：主色沿用品牌绿，留白与线框克制，用排版层级替代大面积贴纸化装饰。",
      },
      {
        kicker: "02 · 玩法与转化",
        body: "消消乐核心棋盘与外围运营页（奖品池、排行、我的奖品）拆成清晰路由，便于埋点区分「游玩时长 / 关卡完成 / 领奖转化」。",
      },
      {
        kicker: "03 · 微信内传播",
        body: "分享晒图、长按保存等动作预留按钮位与海报画布；侧栏入口在窄屏内垂直收纳，减少与棋盘操作区抢手势。",
      },
    ],
    capabilities: [
      {
        title: "首屏与关卡壳",
        description: "全屏渐变背景 + 居中叙事，进入关卡后切换 HUD（倒计时、目标分、进度条），状态可配置。",
      },
      {
        title: "棋盘与素材",
        description: "方块皮肤支持品牌纹样与多 set 扩展；棋盘尺寸与边距按主流机型安全区适配。",
      },
      {
        title: "奖品与券展示",
        description: "榜单礼品卡、闯关券双模块，价格与说明字段化，便于运营改稿不上线。",
      },
      {
        title: "排行与空态",
        description: "表格 + 个人成绩吸底；无数据时展示占位文案，接口就绪后无缝替换。",
      },
      {
        title: "弹层与侧栏",
        description: "「我的奖品」等二级信息用模态呈现，侧栏多入口折叠，减少首屏信息堆叠。",
      },
    ],
    deliverables: [
      "活动首页 + 关卡页 + 奖品池 + 排行榜 + 奖品弹层等页面结构与样式变量",
      "棋盘与关卡配置 JSON / 接口占位",
      "分享图 / 长按保存按钮与埋点钩子",
      "微信 WebView 与常见内置浏览器兼容说明",
    ],
    themeColor: "#0f2218",
    seoTitle: "玛丝菲尔会员节消消乐 H5 案例 | 灵壳 LINGKE",
    seoDescription:
      "Marisfrolg 会员节消消乐互动 H5：绿色主题落地页、消消乐棋盘、奖品池、游戏排名与我的奖品弹层 — 灵壳 LINGKE。",
  },
  {
    slug: "balabala-poster-diy",
    heroTitle: "带娃姿势大比拼",
    heroLead: "海报 DIY H5 · 巴拉巴拉 × 森马服饰",
    tagline: "从品牌加载、身份分流到海报拼贴与邀友抽奖，整条链路用高饱和插画风统一，适合亲子类社传播。",
    coverImage: "/cases/balabala-poster-h5/cover.png",
    heroBadge: { line1: "H5 · 海报 DIY", line2: "巴拉巴拉 × 森马" },
    accentColor: "#2563eb",
    heroGlow: "rgba(250, 204, 21, 0.22)",
    screens: [
      {
        src: "/cases/balabala-poster-h5/cover.png",
        caption: "品牌加载 · 进度首屏",
        summary: "蓝底方格 + 主标题画板与百分比进度条，承接渠道落地首帧与资源预载心智。",
      },
      {
        src: "/cases/balabala-poster-h5/02-identity.png",
        caption: "身份选择 · 男生 / 女生",
        summary: "双头像 + 双 CTA，为后续海报素材与文案分支预留入口；「我想去抽奖」强化转化。",
      },
      {
        src: "/cases/balabala-poster-h5/03-editor.png",
        caption: "海报工坊 · 场景与素材",
        summary: "画布预览 + 场景 / 姿势 / 宝宝等 Tab 与缩略图条，典型「图层式」DIY 结构，可接素材包版本管理。",
      },
      {
        src: "/cases/balabala-poster-h5/04-invite.png",
        caption: "邀友开奖 · 增长位",
        summary: "明星直播开奖叙事 + 邀请占位与 MacBook 奖品图，侧栏「我的奖品」与主按钮形成闭环。",
      },
      {
        src: "/cases/balabala-poster-h5/05-prizes.png",
        caption: "我的奖品 · 优惠券",
        summary: "Tab 切换优惠券 / 开奖码，券面分栏与「微信-卡包」引导，贴合微信内核销路径。",
      },
    ],
    editorial: [
      {
        kicker: "01 · 亲子向视觉",
        body: "巴拉巴拉活动更偏「插画综艺感」：粗描边、高对比色块与少量 3D 字效，和成人服饰官网的克制风拉开距离，同时保持森马系活动的可识别度。",
      },
      {
        kicker: "02 · DIY 与增长",
        body: "海报编辑器承担停留时长；邀友页把「+ 好友」与奖品实物图放在同一视线，降低从创作到拉新的心理跳转成本。",
      },
      {
        kicker: "03 · 微信内闭环",
        body: "奖品页显式提示卡包路径，券面字段（面额、门槛、立即领取）结构化，便于后续接券平台接口与风控文案。",
      },
    ],
    capabilities: [
      {
        title: "首屏与预载",
        description: "进度条与主 KV 同步展示，可配置百分比动画与跳过策略，兼顾弱网与首包体积。",
      },
      {
        title: "身份与任务路由",
        description: "性别/角色选择与后续素材包、默认模板绑定，支持 AB 实验与渠道参数回传。",
      },
      {
        title: "海报编辑器壳",
        description: "场景 / 姿势 / 道具等多类 Tab + 横向素材带；完成态导出图片或进入下一环节。",
      },
      {
        title: "裂变与开奖",
        description: "邀请卡片、好友列表占位与开奖说明同屏，埋点区分曝光、点击邀请、成功回流。",
      },
      {
        title: "奖品与券 UI",
        description: "券样式、Tab 与领取态组件化，对接卡券系统时只换数据不改版式。",
      },
    ],
    deliverables: [
      "加载页 + 身份选择 + 编辑器 + 邀友开奖 + 我的奖品等页面结构与主题变量",
      "素材 Tab 与缩略图 JSON / CMS 字段示例",
      "导出海报 / 分享卡片尺寸与裁切说明",
      "微信 WebView 与卡包跳转文案占位",
    ],
    themeColor: "#0a1628",
    seoTitle: "巴拉巴拉带娃姿势海报 DIY H5 案例 | 灵壳 LINGKE",
    seoDescription:
      "森马服饰巴拉巴拉「带娃姿势大比拼」海报 DIY H5：加载首屏、身份选择、海报编辑器、邀友开奖与我的奖品券页 — 灵壳 LINGKE。",
  },
];

export function getH5CaseBySlug(slug: string | undefined): H5Case | undefined {
  if (!slug) return undefined;
  return H5_CASES.find((c) => c.slug === slug);
}
