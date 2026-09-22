/**
 * App 案例数据 —— 路由 `/app/:slug`；配图放 `public/cases/{folder}/`。
 *
 * 【必填】slug、heroTitle、platform、coverImage、screens（≥1）
 * 【建议】tagline、capabilities、flowSteps、portfolioNote、palette
 *
 * 首页卡片：`SelectedWork` → `detailPath: "/app/{slug}"`，`filter: "app"`；竖屏封面可加 `imageVariant: "mini-portrait"`。
 */
import type { MiniCapability, MiniCasePalette, MiniFlowStep, MiniScreen } from "./miniCases";
import { DEFAULT_MINI_PORTFOLIO_NOTE } from "./miniCases";

export type AppCase = {
  slug: string;
  heroTitle: string;
  tagline?: string;
  locationLine?: string;
  platform: string;
  categoryLabel?: string;
  coverImage: string;
  screens: readonly MiniScreen[];
  palette?: Partial<MiniCasePalette>;
  capabilities?: readonly MiniCapability[];
  flowSteps?: readonly MiniFlowStep[];
  seoTitle?: string;
  seoDescription?: string;
  themeColor?: string;
  portfolioNote?: string;
};

const defaultPalette: MiniCasePalette = {
  paper: "#f5f8fc",
  mist: "#e3eef8",
  accent: "#3b82f6",
  ink: "#0f172a",
};

export function resolveAppPalette(caseData: AppCase): MiniCasePalette {
  return { ...defaultPalette, ...caseData.palette };
}

export function resolveAppTagline(caseData: AppCase): string {
  return caseData.tagline ?? `${caseData.heroTitle} · ${caseData.platform}`;
}

export function resolveAppLocationLine(caseData: AppCase): string {
  return caseData.locationLine ?? "移动应用案例";
}

export function resolveAppPortfolioNote(caseData: AppCase): string {
  return caseData.portfolioNote ?? DEFAULT_MINI_PORTFOLIO_NOTE;
}

export function resolveAppSeoDescription(caseData: AppCase): string {
  return (
    caseData.seoDescription ??
    `「${caseData.heroTitle}」${caseData.platform}界面与体验案例展示 — 灵壳 LINGKE。`
  );
}

export const APP_CASES: readonly AppCase[] = [
  {
    slug: "certificate-assistant",
    heroTitle: "证件管理助手",
    tagline: "快速办事指南 · 城市维度下的证照办理与步骤拆解",
    locationLine: "产品类型 · 政务办事 / 证照指南",
    platform: "iOS · Android",
    categoryLabel: "办事指南",
    coverImage: "/cases/certificate-assistant-app/cover.png",
    screens: [
      {
        index: "01",
        src: "/cases/certificate-assistant-app/cover.png",
        caption: "首页 · 服务分类与热门办事",
        summary:
          "城市切换与搜索；户政、社保医保、车辆、教育四大入口；热门办事卡片展示办理周期与难度标签。",
      },
      {
        index: "02",
        src: "/cases/certificate-assistant-app/02-id-guide.png",
        caption: "身份证办理 · 步骤与材料",
        summary:
          "办理时间、难度与更新时间摘要；分步说明申领登记表、现场拍照、缴费与领证，信息层级清晰可扫读。",
      },
      {
        index: "03",
        src: "/cases/certificate-assistant-app/03-mine.png",
        caption: "我的 · 待办与最近浏览",
        summary:
          "游客态与城市展示；待办空态；最近浏览保留驾驶证、不动产等高频指南入口，缩短回访路径。",
      },
      {
        index: "04",
        src: "/cases/certificate-assistant-app/04-city-picker.png",
        caption: "选择城市 · 热门与全列表",
        summary:
          "热门城市标签与全量城市列表单选；与首页、个人中心的城市上下文一致，支撑异地办事查询。",
      },
    ],
    capabilities: [
      {
        title: "城市与搜索入口",
        description: "顶部城市选择与办事指南搜索，把「在哪办、办什么」收敛到首屏。",
      },
      {
        title: "服务分类矩阵",
        description: "户政、社保、车辆、教育等大类图标化入口，适配高频证照与民生场景。",
      },
      {
        title: "热门办事卡片",
        description: "标题、摘要、办理周期与难度标签组合，帮助用户预估成本与复杂度。",
      },
      {
        title: "分步办事详情",
        description: "关键字段摘要 + 步骤拆解 + 浮动操作入口，兼顾首读与深度阅读。",
      },
      {
        title: "个人中心与浏览记忆",
        description: "待办占位与最近浏览列表，承接跨会话的办事进度与回访。",
      },
    ],
    flowSteps: [
      {
        title: "选城",
        description: "在首页或个人中心确认办事城市，保证政策与网点信息一致。",
      },
      {
        title: "找事",
        description: "通过分类或搜索定位具体证照/事项，阅读摘要与步骤。",
      },
      {
        title: "跟办",
        description: "收藏或记录待办，按步骤准备材料并线下/线上完成办理。",
      },
    ],
    palette: {
      paper: "#f6f8fc",
      mist: "#e8f0fa",
      accent: "#3b82f6",
      ink: "#0f172a",
    },
    themeColor: "#3b82f6",
    seoTitle: "证件管理助手 App — 办事指南案例 | 灵壳 LINGKE",
    seoDescription:
      "证件管理助手移动应用：快速办事指南、身份证办理分步说明、个人中心与城市管理界面案例展示 — 灵壳 LINGKE。",
  },
  {
    slug: "youpin-tianxia",
    heroTitle: "优品天下",
    tagline: "穿搭收纳 · 造型工具与记账一体的轻生活 App",
    locationLine: "产品类型 · 衣橱 / 影像工具 / 记账",
    platform: "iOS · Android",
    categoryLabel: "生活服务",
    coverImage: "/cases/youpin-tianxia-app/cover.png",
    screens: [
      {
        index: "01",
        src: "/cases/youpin-tianxia-app/cover.png",
        caption: "主视觉 · 穿搭收纳",
        summary:
          "绿色主调推广位突出「分类收纳、解决穿搭难题」；与衣柜模块的品类结构（上装、下装、鞋包配饰）形成一致心智。",
      },
      {
        index: "02",
        src: "/cases/youpin-tianxia-app/02-wardrobe.png",
        caption: "衣柜展示 · 登录与品类",
        summary:
          "首页衣柜：登录引导与运营 Banner；横向品类 Tab 切换；悬浮「+」承载新增单品，列表区展示缩略图、尺码与价格。",
      },
      {
        index: "03",
        src: "/cases/youpin-tianxia-app/03-tools.png",
        caption: "工具 · 造型工具箱",
        summary:
          "「一键换装」「眼镜试戴」等入口卡片 + 工具网格：自拍相机、换发型、脸型分析、智能/海报拼图、长图拼接等。",
      },
      {
        index: "04",
        src: "/cases/youpin-tianxia-app/04-bookkeeping.png",
        caption: "记账 · 价值统计",
        summary:
          "结余/收支总览大卡；默认、工作、旅行等多账本横向切换；最近账单区承接流水列表与空态插画。",
      },
      {
        index: "05",
        src: "/cases/youpin-tianxia-app/05-profile.png",
        caption: "个人中心 · 合规与偏好",
        summary:
          "隐私政策、使用条款、意见反馈、关于我们；个性化广告推荐开关；个人信息与第三方共享清单入口。",
      },
    ],
    capabilities: [
      {
        title: "衣柜与穿搭收纳",
        description: "品类 Tab、单品列表与删除、悬浮添加，把实体衣橱数字化管理。",
      },
      {
        title: "影像与造型工具矩阵",
        description: "换装、试戴眼镜、拼图与长图拼接等工具聚合，降低跳转成本。",
      },
      {
        title: "多账本记账",
        description: "结余与收支摘要 + 多账本切换，适配工作、旅行等场景分账。",
      },
      {
        title: "账号与合规区",
        description: "登录态提示、协议与清单入口、广告偏好开关，满足应用商店常见合规展示。",
      },
      {
        title: "底部主导航",
        description: "首页 / 工具 / 记账 / 我的四 Tab 架构，主色高亮当前模块。",
      },
    ],
    flowSteps: [
      {
        title: "逛衣柜",
        description: "从首页进入衣柜展示，按品类浏览或添加单品，配合 Banner 获取穿搭灵感。",
      },
      {
        title: "用工具",
        description: "在工具页选择拼图、换发型等能力，完成图片处理或趣味造型尝试。",
      },
      {
        title: "记一笔",
        description: "切换到记账 Tab，选择账本并记录收支，查看结余与最近账单。",
      },
      {
        title: "调偏好",
        description: "在个人中心查看协议、反馈入口，并管理个性化推荐等隐私相关设置。",
      },
    ],
    palette: {
      paper: "#fff8fb",
      mist: "#fce4ec",
      accent: "#e91e8c",
      ink: "#1a0a12",
    },
    themeColor: "#e91e8c",
    seoTitle: "优品天下 App — 衣橱与工具案例 | 灵壳 LINGKE",
    seoDescription:
      "优品天下移动应用：穿搭收纳衣柜、造型工具箱、多账本记账与个人中心合规界面案例展示 — 灵壳 LINGKE。",
  },
  {
    slug: "haihaome",
    heroTitle: "还好么",
    tagline: "每日健康签到 · 亲友守护与能量激励",
    locationLine: "产品类型 · 健康关怀 / 社交守护",
    platform: "iOS · Android",
    categoryLabel: "健康打卡",
    coverImage: "/cases/haihaome-app/cover.png",
    screens: [
      {
        index: "01",
        src: "/cases/haihaome-app/cover.png",
        caption: "签到 · 今天还好么",
        summary:
          "中心圆形签到区强化「点击确认一切安好」；顶部总收益与能量豆；奖励卡拆分基础 / 团队 / 守护三类；在线好友邀请位与底部守护·签到·我的导航。",
      },
      {
        index: "02",
        src: "/cases/haihaome-app/02-guard.png",
        caption: "守护 · 我守护的人",
        summary:
          "双 Tab 切换「我守护的人」与「守护我的人」；空态说明注册后可守护、异常签到可联系；主按钮引导输入守护码添加对象。",
      },
      {
        index: "03",
        src: "/cases/haihaome-app/03-login.png",
        caption: "登录 · 今天，你还好么",
        summary:
          "密码登录与验证码登录切换；手机号 + 密码表单、忘记密码入口；底部协议勾选与《隐私政策》《用户协议》链接。",
      },
    ],
    capabilities: [
      {
        title: "每日签到与状态确认",
        description: "24 小时周期签到收集能量，文案强化「确认平安」的情绪价值与使用动机。",
      },
      {
        title: "能量豆与奖励结构",
        description: "总收益与「基础 / 团队 / 守护」奖励分列展示，支撑拉新与守护链路的数值反馈。",
      },
      {
        title: "亲友守护网络",
        description: "守护码添加、双向 Tab（我守护 / 被守护），异常签到时可触达联系方式。",
      },
      {
        title: "好友与邀请",
        description: "在线好友列表与邀请占位，把社交裂变嵌入主流程附近。",
      },
      {
        title: "账号与合规登录",
        description: "双因子登录方式切换、密码显隐、协议勾选，符合应用上架常见账号页规范。",
      },
    ],
    flowSteps: [
      {
        title: "注册登录",
        description: "完成手机号登录并同意隐私与用户协议，进入主站三 Tab 架构。",
      },
      {
        title: "每日签到",
        description: "在签到页点击确认当日状态，积累能量豆并查看分时奖励摘要。",
      },
      {
        title: "邀请守护",
        description: "在守护 Tab 输入对方守护码或邀请好友，建立互相查看与联络的守护关系。",
      },
      {
        title: "持续回访",
        description: "通过好友在线状态与奖励进度，形成周期性打开与关怀提醒。",
      },
    ],
    palette: {
      paper: "#f0fdf4",
      mist: "#dcfce7",
      accent: "#16a34a",
      ink: "#14532d",
    },
    themeColor: "#16a34a",
    seoTitle: "还好么 App — 每日健康打卡与守护案例 | 灵壳 LINGKE",
    seoDescription:
      "还好么移动应用：每日签到确认平安、能量豆激励、亲友守护与登录合规界面案例展示 — 灵壳 LINGKE。",
  },
  {
    slug: "youya",
    heroTitle: "游鸭",
    tagline: "本地活动结伴 · 搭子撮合与向导服务一体",
    locationLine: "产品类型 · 本地社交 / 活动发现",
    platform: "iOS · Android",
    categoryLabel: "本地生活",
    coverImage: "/cases/youya-app/cover.png",
    screens: [
      {
        index: "01",
        src: "/cases/youya-app/cover.png",
        caption: "瞬间 · 推荐信息流",
        summary:
          "全国 / 附近 / 推荐 / 最新 Tab 与搜索；卡片式动态含活动类型标签、图文与互动栏；悬浮「发布」降低 UGC 门槛。",
      },
      {
        index: "02",
        src: "/cases/youya-app/02-dazi.png",
        caption: "搭子 · 搜索与邀约卡片",
        summary:
          "热搜与「个人偏好模式」开关；每张邀约含标题图、实名与年龄标签、地点/时段/人数与「已搭 / 上限」进度，便于快速决策是否加入。",
      },
      {
        index: "03",
        src: "/cases/youya-app/03-local.png",
        caption: "本地通 · 分类与向导服务",
        summary:
          "双行场景图标矩阵（吃喝、讲解、拍照、户外等）；土著攻略横滑卡 + 服务列表展示时价与标签，承接从内容到交易的转化。",
      },
      {
        index: "04",
        src: "/cases/youya-app/04-messages.png",
        caption: "消息 · 互动与系统",
        summary:
          "互动消息与系统消息分区入口，结构清晰，为后续会话列表与推送留足扩展空间。",
      },
      {
        index: "05",
        src: "/cases/youya-app/05-mine.png",
        caption: "我的 · 资料与资产",
        summary:
          "头图区展示粉丝/关注/好友/获赞与编辑资料；订单、钱包、红包快捷入口；作品下二级 Tab（瞬间 / 攻略 / 土著 tips 等）与空态占位。",
      },
    ],
    capabilities: [
      {
        title: "多维度内容发现",
        description: "瞬间流按地域与算法 Tab 切换，帖子聚合活动类型与多媒体，强化「找玩法」的心智。",
      },
      {
        title: "搭子邀约与组队进度",
        description: "结构化卡片呈现地点、时间、人数与已加入状态，降低线下约伴的沟通成本。",
      },
      {
        title: "本地向导商业化",
        description: "本地通将攻略内容与服务定价并列，用分类与横滑内容带动向导与套餐曝光。",
      },
      {
        title: "消息与通知分层",
        description: "互动与系统消息分桶，避免运营类通知淹没社交提醒。",
      },
      {
        title: "个人主页与履约资产",
        description: "我的页串联社交数据、订单钱包与多类型作品 Tab，形成闭环个人品牌展示。",
      },
    ],
    flowSteps: [
      {
        title: "逛瞬间",
        description: "在推荐或附近流浏览本地玩家的图文与活动标签，收藏或互动感兴趣的内容。",
      },
      {
        title: "组搭子",
        description: "在搭子 Tab 搜索或打开偏好模式，查看邀约详情并加入，直至人数满足约定。",
      },
      {
        title: "找向导",
        description: "切换到本地通，按场景筛选或阅读土著攻略，进入带时价的服务详情完成预约。",
      },
      {
        title: "履约与沉淀",
        description: "通过消息查看邀约与系统提醒；在我的管理订单资金并发布作品，形成长期活跃。",
      },
    ],
    palette: {
      paper: "#fafaf9",
      mist: "#ecfccb",
      accent: "#65a30d",
      ink: "#1c1917",
    },
    themeColor: "#65a30d",
    seoTitle: "游鸭 App — 本地活动与搭子案例 | 灵壳 LINGKE",
    seoDescription:
      "游鸭移动应用：瞬间信息流、搭子邀约、本地通向导服务、消息与个人中心界面案例展示 — 灵壳 LINGKE。",
  },
  {
    slug: "diaoyuren",
    heroTitle: "钓鱼人",
    tagline: "钓场天气与技巧内容 · 正品商城与同城钓友社区",
    locationLine: "产品类型 · 钓鱼工具 / 垂类社区电商",
    platform: "iOS · Android",
    categoryLabel: "钓鱼工具",
    coverImage: "/cases/diaoyuren-app/cover.png",
    screens: [
      {
        index: "01",
        src: "/cases/diaoyuren-app/cover.png",
        caption: "首页 · 搜索与入口矩阵",
        summary:
          "搜钓场、技巧、视频；视频/技巧/商城/卫星钓位/二手等彩色入口 + 鱼竿饵料等装备线框入口；本地钓场数量、出钓指数与天气卡片；社区精选与全国/附近 Tab。",
      },
      {
        index: "02",
        src: "/cases/diaoyuren-app/02-local.png",
        caption: "同城 · 我在泸州",
        summary:
          "城市站聚合本地钓场、出钓评分、附近钓友与周边渔具店数据；最新/精华/二手等 Tab 承载同城帖流与活动招募、问答等内容形态。",
      },
      {
        index: "03",
        src: "/cases/diaoyuren-app/03-mall.png",
        caption: "正品商城 · 分类与心智",
        summary:
          "「用心选 放心购」品牌区 + 领券/热销/新品等运营入口；鱼竿饵料线钩等品类栅格；智能仓储与假一赔十等服务承诺卡强化信任。",
      },
      {
        index: "04",
        src: "/cases/diaoyuren-app/04-messages.png",
        caption: "我的消息 · 互动分类",
        summary:
          "系统消息、私信、发现周边钓友、评论、回复与被赞分渠道入口，列表+彩色图标降低认知成本。",
      },
      {
        index: "05",
        src: "/cases/diaoyuren-app/05-mine.png",
        caption: "我 · 订单与工具服务",
        summary:
          "等级与签到金币；发布/收藏/关注/粉丝数据；订单状态五宫格；会员、优惠券、金币商城、配节售后、本地钓场等工具与服务矩阵。",
      },
    ],
    capabilities: [
      {
        title: "内容与搜索一体首页",
        description: "全局搜索 + 多媒体/知识/交易入口矩阵，把「学、买、找钓场」收敛到首屏。",
      },
      {
        title: "本地化钓况与社区",
        description: "城市站展示钓场规模、天气适宜度与同城 UGC，支撑线下出钓决策。",
      },
      {
        title: "垂类正品电商",
        description: "渔具全品类导航叠加券与热销模块，服务承诺卡对齐高客单信任诉求。",
      },
      {
        title: "社交消息分层",
        description: "系统、私信、附近钓友与互动类通知拆分，避免社区噪音淹没交易与客服。",
      },
      {
        title: "个人履约与增长",
        description: "订单动线、金币任务、会员与配节售后等模块，承接电商与工具双业务。",
      },
    ],
    flowSteps: [
      {
        title: "看天看场",
        description: "在首页或同城站查看出钓指数、天气与本地钓场/钓友密度，决定是否出行。",
      },
      {
        title: "逛内容下单",
        description: "浏览社区精选与技巧视频，需要时进入正品商城完成渔具选购与支付。",
      },
      {
        title: "同城互动",
        description: "在同城帖流参与问答或活动招募，通过消息与评论维护钓友关系。",
      },
      {
        title: "资产与售后",
        description: "在我的查看订单物流、金币与优惠券，必要时走配节与退换售后通道。",
      },
    ],
    palette: {
      paper: "#f8fafc",
      mist: "#e0f2fe",
      accent: "#2563eb",
      ink: "#0f172a",
    },
    themeColor: "#2563eb",
    seoTitle: "钓鱼人 App — 钓鱼工具与社区电商案例 | 灵壳 LINGKE",
    seoDescription:
      "钓鱼人移动应用：首页钓场天气、同城社区、正品渔具商城、消息与个人中心界面案例展示 — 灵壳 LINGKE。",
  },
];

export function getAppCaseBySlug(slug: string | undefined): AppCase | undefined {
  if (!slug) return undefined;
  return APP_CASES.find((c) => c.slug === slug);
}
