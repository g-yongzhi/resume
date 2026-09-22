/**
 * 小程序案例数据 —— 路由 `/mini/:slug`；配图放 `public/cases/{folder}/`。
 *
 * ## 录入方式（仅需截屏，无需小程序码）
 * 1. 把竖屏截图放进 `public/cases/{folder}/`（见下方文件清单）
 * 2. 在 `screens` 里写每张图的 `caption`（界面名称）；`summary` 写该屏功能说明（可由交付方提供，灵壳根据截屏润色）
 * 3. 填写 `capabilities` / `flowSteps` / `tagline` 等文案（根据截屏内容归纳）
 * 4. 可选 `paletteFromCover: true` 从封面自动取色
 *
 * 【必填】slug、heroTitle、platform、coverImage、screens（≥1）
 * 【建议】tagline、capabilities、flowSteps、portfolioNote、metaRows
 *
 * 首页卡片：`SelectedWork` → `detailPath: "/mini/{slug}"`，`filter: "mini"`。
 */
export type MiniCasePalette = {
  paper: string;
  mist: string;
  accent: string;
  ink: string;
};

export type MiniScreen = {
  src: string;
  /** 界面标题，如「首页 · 选品瀑布流」 */
  caption: string;
  /** 根据截屏归纳的 1～2 句功能说明 */
  summary?: string;
  index?: string;
};

export type MiniCapability = {
  title: string;
  description: string;
};

export type MiniFlowStep = {
  title: string;
  description: string;
};

export type MiniCaseMetaRow = { label: string; value: string };

export type MiniCase = {
  slug: string;
  heroTitle: string;
  tagline?: string;
  locationLine?: string;
  platform: string;
  categoryLabel?: string;
  coverImage: string;
  screens: readonly MiniScreen[];
  /** 首屏说明卡片文案；未填时使用 `DEFAULT_MINI_PORTFOLIO_NOTE` */
  portfolioNote?: string;
  seoTitle?: string;
  seoDescription?: string;
  themeColor?: string;
  palette?: Partial<MiniCasePalette>;
  paletteFromCover?: boolean;
  /** 由截屏内容归纳的核心能力（3～6 条为宜） */
  capabilities?: readonly MiniCapability[];
  flowSteps?: readonly MiniFlowStep[];
  metaRows?: readonly MiniCaseMetaRow[];
};

const defaultPalette: MiniCasePalette = {
  paper: "#f7f5f2",
  mist: "#ebe6df",
  accent: "#2d6a4f",
  ink: "#141210",
};

export const DEFAULT_MINI_PORTFOLIO_NOTE =
  "本页展示内容为项目交付界面的高清截屏实录，用于呈现设计与交互品质。";

export function resolveMiniPalette(caseData: MiniCase): MiniCasePalette {
  return { ...defaultPalette, ...caseData.palette };
}

export function mergeMiniCoverPalette(caseData: MiniCase, fromCover: MiniCasePalette): MiniCasePalette {
  return { ...defaultPalette, ...fromCover, ...caseData.palette };
}

export function resolveMiniTagline(caseData: MiniCase): string {
  return caseData.tagline ?? `${caseData.heroTitle} · ${caseData.platform}定制`;
}

export function resolveMiniLocationLine(caseData: MiniCase): string {
  return caseData.locationLine ?? "小程序案例";
}

export function resolveMiniPortfolioNote(caseData: MiniCase): string {
  return caseData.portfolioNote ?? DEFAULT_MINI_PORTFOLIO_NOTE;
}

export function resolveMiniSeoDescription(caseData: MiniCase): string {
  return (
    caseData.seoDescription ??
    `「${caseData.heroTitle}」${caseData.platform}界面与体验案例展示 — 灵壳 LINGKE。`
  );
}

export function mapCoverPaletteToMini(p: {
  paper: string;
  mist: string;
  cinnabar: string;
  brass: string;
}): MiniCasePalette {
  return {
    paper: p.paper,
    mist: p.mist,
    accent: p.cinnabar,
    ink: "#12100e",
  };
}

export const MINI_CASES: readonly MiniCase[] = [
  {
    slug: "qinghe-24h",
    heroTitle: "青禾24小时自助棋牌室",
    tagline: "自助棋牌与台球 · 预约包间 · 卡券套餐与订单闭环",
    locationLine: "客户所在行业 · 棋牌娱乐 / 台球",
    platform: "微信小程序",
    categoryLabel: "棋牌娱乐台球",
    coverImage: "/cases/qinghe-24h-mini/cover.png",
    screens: [
      {
        index: "01",
        src: "/cases/qinghe-24h-mini/cover.png",
        caption: "首页 · 门店与快捷入口",
        summary:
          "品牌头图与会员入口；立即预约、团购验券、联系客服三大主操作；门店切换与预约指引、积分商城等辅助模块。",
      },
      {
        index: "02",
        src: "/cases/qinghe-24h-mini/02-booking.png",
        caption: "预约 · 棋牌与台球分区",
        summary:
          "棋牌 / 台球 Tab 切换；营业时间、空闲房间筛选与包间列表；套餐价、小时价与时段占用条一目了然。",
      },
      {
        index: "03",
        src: "/cases/qinghe-24h-mini/03-packages.png",
        caption: "卡券套餐 · 储值与次卡",
        summary:
          "门店维度下的储值卡、卡券与兑换；小包/中包棋牌时长卡与台球券等 SKU 卡片化陈列，便于比价下单。",
      },
      {
        index: "04",
        src: "/cases/qinghe-24h-mini/04-orders.png",
        caption: "我的订单 · 时段与状态",
        summary:
          "多门店、多状态筛选；订单卡片展示包间、门店、起止时间与实付金额，完成态与售后入口清晰。",
      },
      {
        index: "05",
        src: "/cases/qinghe-24h-mini/05-profile.png",
        caption: "个人中心 · 会员与工具",
        summary:
          "账户与卡包统计、会员成长与权益入口；团购验券、全部门店、联系商家等高频工具与协议合规入口。",
      },
    ],
    capabilities: [
      {
        title: "首页转化与门店心智",
        description: "会员与预约主路径前置，门店地址与切换同屏完成，降低「找店—下单」的跳转成本。",
      },
      {
        title: "棋牌 / 台球双业态预约",
        description: "分类 Tab、营业规则与空闲筛选组合，包间卡片承载设施标签、套餐与可约时段。",
      },
      {
        title: "卡券与套餐售卖",
        description: "多规格时长卡、台球券与储值入口分层展示，适配美团抖音验券与店内二次消费。",
      },
      {
        title: "订单列表与状态管理",
        description: "门店与订单类型筛选、时间轴式展示与金额汇总，方便用户自查与客服协同。",
      },
      {
        title: "会员与个人中心",
        description: "成长值、卡包与营销位（如好评激励）集中承载，工具区覆盖验券、多店与商家联系。",
      },
    ],
    palette: {
      paper: "#f4faf7",
      mist: "#dff0ea",
      accent: "#2a9d7a",
      ink: "#14221c",
    },
    themeColor: "#14221c",
    paletteFromCover: true,
    flowSteps: [
      {
        title: "发现",
        description: "从首页进入预约、验券或客服，并确认目标门店。",
      },
      {
        title: "下单",
        description: "选择棋牌或台球包间，查看时段与套餐后完成预约或购券。",
      },
      {
        title: "履约",
        description: "在订单与个人中心查看进度、到店使用并复购会员权益。",
      },
    ],
    metaRows: [
      { label: "客户 / 产品", value: "青禾24小时自助棋牌室 · 棋牌娱乐台球" },
      { label: "交付", value: "微信小程序 · 预约 · 卡券 · 订单 · 会员" },
      { label: "展示形式", value: "界面截屏实录 · 案例页展示" },
    ],
    seoTitle: "青禾24小时自助棋牌室小程序 — 棋牌台球案例 | 灵壳 LINGKE",
    seoDescription:
      "青禾24小时自助棋牌室微信小程序：自助棋牌与台球预约、卡券套餐与订单管理界面案例展示 — 灵壳 LINGKE。",
  },
  {
    slug: "tingmanyi",
    heroTitle: "婷曼逸时尚女装",
    tagline: "品牌女装电商 · 分类导购 · 商品详情与购物车一体",
    locationLine: "客户所在行业 · 时尚女装 / 零售",
    platform: "微信小程序",
    categoryLabel: "时尚女装",
    coverImage: "/cases/tingmanyi-mini/cover.png",
    screens: [
      {
        index: "01",
        src: "/cases/tingmanyi-mini/cover.png",
        caption: "首页 · 品牌主视觉与行动点",
        summary:
          "全屏形象与 TMY SHAPEWEAR 品牌字标；季节主题与「即刻购买」主按钮，底部主导航串联首页、分类、购物车与个人中心。",
      },
      {
        index: "02",
        src: "/cases/tingmanyi-mini/02-category.png",
        caption: "分类 · 搜索与双列货架",
        summary:
          "顶部搜索 + 横向类目（全部、预售、洗护、护肤等）；双列商品卡展示主图、款号与价格，预售角标突出活动款。",
      },
      {
        index: "03",
        src: "/cases/tingmanyi-mini/03-product-detail.png",
        caption: "商品详情 · 图集与规格",
        summary:
          "多图轮播与款号、价格、销量；已选参数、发货地与收货地址、用户评价分区承接下单前的关键决策。",
      },
      {
        index: "04",
        src: "/cases/tingmanyi-mini/04-cart.png",
        caption: "购物车 · 结算条",
        summary:
          "空态插画与文案引导；底部全选、合计金额与「去结算」固定条，适配多件凑单与编辑场景。",
      },
      {
        index: "05",
        src: "/cases/tingmanyi-mini/05-profile.png",
        caption: "个人中心 · 订单与客服",
        summary:
          "订单、收藏、地址、售后快捷入口；推送与消息、关于与反馈、设置；微信客服时段与 400 热线并列展示。",
      },
    ],
    capabilities: [
      {
        title: "品牌首页与营销位",
        description: "大图叙事 + 明确购买入口，强化季节上新与品牌形象，缩短从种草到进店的路径。",
      },
      {
        title: "分类检索与商品矩阵",
        description: "搜索与多级类目组合，双列卡片统一承载图、名、价与预售标签，适合 SKU 较多的女装陈列。",
      },
      {
        title: "商详与交易决策信息",
        description: "图集、价格销量、规格与物流、评价模块分层呈现，底部加购与立即购买双 CTA。",
      },
      {
        title: "购物车与结算动线",
        description: "全选、合计与结算数量联动，空态友好提示，为凑单与活动叠加留足空间。",
      },
      {
        title: "账户与售后触达",
        description: "个人中心聚合订单与地址，客服入口含在线时段与热线，便于高客单场景的咨询转化。",
      },
    ],
    palette: {
      paper: "#faf8f5",
      mist: "#f3ece6",
      accent: "#ea580c",
      ink: "#1c1917",
    },
    themeColor: "#1c1917",
    paletteFromCover: true,
    flowSteps: [
      {
        title: "逛",
        description: "从首页或分类进入搜索与货架，筛选预售与系列款。",
      },
      {
        title: "选",
        description: "在商详查看图集、规格与配送评价，加入购物车或立即购买。",
      },
      {
        title: "付",
        description: "购物车确认金额后结算；个人中心跟踪订单并联系客服。",
      },
    ],
    metaRows: [
      { label: "客户 / 产品", value: "婷曼逸时尚女装 · 女装零售" },
      { label: "交付", value: "微信小程序 · 商城 · 分类 · 购物车 · 个人中心" },
      { label: "展示形式", value: "界面截屏实录 · 案例页展示" },
    ],
    seoTitle: "婷曼逸时尚女装小程序 — 女装电商案例 | 灵壳 LINGKE",
    seoDescription:
      "婷曼逸时尚女装微信小程序：品牌首页、分类导购、商品详情与购物车界面案例展示 — 灵壳 LINGKE。",
  },
  {
    slug: "lianyin",
    heroTitle: "恋银手作",
    tagline: "会员等级与积分 · 流水可查 · 卡券资产一页掌握",
    locationLine: "客户所在行业 · 珠宝零售 / 会员运营",
    platform: "微信小程序",
    categoryLabel: "珠宝手作",
    coverImage: "/cases/lianyin-mini/cover.png",
    screens: [
      {
        index: "01",
        src: "/cases/lianyin-mini/cover.png",
        caption: "个人中心 · 会员尊享",
        summary:
          "顶部商品搜索与会员公告；头像、等级徽章与积分、优惠券概览；银卡 / 金卡权益、折扣梯度与积分换礼说明集中呈现。",
      },
      {
        index: "02",
        src: "/cases/lianyin-mini/02-points.png",
        caption: "积分流水 · 规则与门店",
        summary:
          "当前积分余额与临期提示；近 30 笔变动列表展示来源门店、时间与增减额，并引导跳转积分商城。",
      },
      {
        index: "03",
        src: "/cases/lianyin-mini/03-coupons.png",
        caption: "我的卡券 · 多类型资产",
        summary:
          "优惠券、包邮券、储值券 Tab 切换；空态插画与文案；底部兑换、购买与转赠记录入口，覆盖全链路卡券运营。",
      },
    ],
    capabilities: [
      {
        title: "会员体系可视化",
        description: "等级名称、升级条件与折扣权益分层说明，个人中心一眼看懂「下一级还差什么」。",
      },
      {
        title: "积分透明与可追溯",
        description: "余额、规则入口与门店维度流水，增强到店消费与总部对账的信任感。",
      },
      {
        title: "卡券分类与空态体验",
        description: "按券种分 Tab 管理资产，空态友好提示并衔接兑换与转赠，降低客服咨询量。",
      },
      {
        title: "搜索与触达",
        description: "个人中心内嵌商品快速搜索，缩短老客复购路径。",
      },
    ],
    palette: {
      paper: "#fdf8f8",
      mist: "#f0e8ec",
      accent: "#b4535c",
      ink: "#1c1416",
    },
    themeColor: "#1c1416",
    paletteFromCover: true,
    flowSteps: [
      {
        title: "入会",
        description: "在个人中心查看等级与权益，完成激活与会员认知。",
      },
      {
        title: "累积",
        description: "到店或线上消费写入积分流水，随时核对门店与金额。",
      },
      {
        title: "兑换",
        description: "在卡券中心管理优惠券与储值券，并前往积分商城或兑换入口使用。",
      },
    ],
    metaRows: [
      { label: "客户 / 产品", value: "恋银手作 · 珠宝手作零售" },
      { label: "交付", value: "微信小程序 · 会员 · 积分 · 卡券" },
      { label: "展示形式", value: "界面截屏实录 · 案例页展示" },
    ],
    seoTitle: "恋银手作小程序 — 会员积分与卡券案例 | 灵壳 LINGKE",
    seoDescription:
      "恋银手作微信小程序：个人中心会员权益、积分流水与我的卡券界面案例展示 — 灵壳 LINGKE。",
  },
  {
    slug: "taixijia",
    heroTitle: "泰熙家",
    tagline: "堂食扫码与自提 · 附近门店 · 订单与个人中心一体",
    locationLine: "客户所在行业 · 餐饮连锁 / 点餐自提",
    platform: "微信小程序",
    categoryLabel: "餐饮点餐",
    coverImage: "/cases/taixijia-mini/cover.png",
    screens: [
      {
        index: "01",
        src: "/cases/taixijia-mini/cover.png",
        caption: "首页 · 点餐入口与会员运营",
        summary:
          "季节主题 Banner 与品牌心智；堂食扫码、打包带走、储值有礼三大主路径；积分商城、卡券包与完善会员信息领券等运营位。",
      },
      {
        index: "02",
        src: "/cases/taixijia-mini/02-stores.png",
        caption: "附近门店 · 搜索与导航",
        summary:
          "附近 / 收藏切换，城市选择与门店搜索；卡片展示营业时段、地址、自提标签与距离，一键去下单并支持导航与电话。",
      },
      {
        index: "03",
        src: "/cases/taixijia-mini/03-orders.png",
        caption: "我的订单 · 当前与历史",
        summary:
          "当前订单与历史订单 Tab；进行中与空态插画提示，与首页、我的形成闭环动线。",
      },
      {
        index: "04",
        src: "/cases/taixijia-mini/04-mine.png",
        caption: "我的 · 资产与工具矩阵",
        summary:
          "登录态下优惠券、余额、积分概览；我的资产与地址、会员卡、会员码、券包、礼品卡兑换、开票助手等功能宫格化收纳。",
      },
    ],
    capabilities: [
      {
        title: "多场景点餐入口",
        description: "堂食扫码、打包自提与储值权益并列，适配门店客流与外卖自提双场景。",
      },
      {
        title: "门店发现与履约",
        description: "附近门店列表 + 距离与营业信息，降低选店成本并直连下单与导航。",
      },
      {
        title: "订单状态与空态",
        description: "当前 / 历史订单分区，空数据友好提示，减少用户「是否下单成功」的焦虑。",
      },
      {
        title: "会员资产与工具箱",
        description: "券、余额、积分同屏；地址、会员码、券包与发票等长尾能力集中收纳。",
      },
      {
        title: "首页运营位",
        description: "季节主题与完善资料领券等模块，支撑拉新、促活与储值转化。",
      },
    ],
    palette: {
      paper: "#f5faf7",
      mist: "#e3f0e8",
      accent: "#2f7d4f",
      ink: "#141a16",
    },
    themeColor: "#141a16",
    paletteFromCover: true,
    flowSteps: [
      {
        title: "选店",
        description: "在附近门店中按距离与营业状态选择门店，或收藏常去门店。",
      },
      {
        title: "点餐",
        description: "堂食扫码或打包带走进入菜单，结合储值与券包完成支付前决策。",
      },
      {
        title: "查看",
        description: "在订单与个人中心跟踪进度、管理资产与开票等售后动作。",
      },
    ],
    metaRows: [
      { label: "客户 / 产品", value: "泰熙家 · 餐饮点餐" },
      { label: "交付", value: "微信小程序 · 门店 · 点餐 · 订单 · 会员" },
      { label: "展示形式", value: "界面截屏实录 · 案例页展示" },
    ],
    seoTitle: "泰熙家小程序 — 餐饮点餐案例 | 灵壳 LINGKE",
    seoDescription:
      "泰熙家微信小程序：首页点餐入口、附近门店、我的订单与个人中心界面案例展示 — 灵壳 LINGKE。",
  },
  {
    slug: "yueqiwan",
    heroTitle: "约起玩",
    tagline: "社群主题游 · 同频约搭子社交旅游平台",
    locationLine: "客户所在行业 · 社交旅游 / 户外主题游",
    platform: "微信小程序",
    categoryLabel: "社群主题游",
    coverImage: "/cases/yueqiwan-mini/cover.png",
    screens: [
      {
        index: "01",
        src: "/cases/yueqiwan-mini/cover.png",
        caption: "爆款 · 首页与线路发现",
        summary:
          "定位成都等城市，搜索徒步露营等目的地；主 Banner 强调「同频社交搭子旅行」与反向定制主题游，近期活动入口 + 报名滚动提示。",
      },
      {
        index: "02",
        src: "/cases/yueqiwan-mini/02-theme.png",
        caption: "主题分类 · 户外主题矩阵",
        summary:
          "户外旅行 / 徒步 / 露营 / 赏花等八大主题入口；支持按日期、天数、标签与综合排序筛选线路。",
      },
      {
        index: "03",
        src: "/cases/yueqiwan-mini/04-vip.png",
        caption: "权益 · VIP 会员与合伙人",
        summary:
          "VIP 与旅游合伙人双 Tab；展示专属客服、报名返现最高 25%、分享佣金与 ¥499 旅行会员套餐权益说明。",
      },
      {
        index: "04",
        src: "/cases/yueqiwan-mini/03-profile.png",
        caption: "我的 · 订单与个人中心",
        summary:
          "待付款 / 待出行 / 待点评 / 退款与我的订单五宫格；公告、客服中心、关于品牌等常用服务入口。",
      },
    ],
    capabilities: [
      {
        title: "同频社交与主题游发现",
        description:
          "首页聚合爆款线路、近期活动与实时报名动态，突出「和同龄人、志同道合的人一起旅游」的平台定位。",
      },
      {
        title: "多维度线路筛选",
        description: "按日期、天数、主题标签与排序快速缩小选择范围，适配徒步、露营、赏花等户外场景。",
      },
      {
        title: "组队报名与成团机制",
        description: "线路卡片展示成团进度、倒计时、起价与「我要加入」，强化社交拼团与紧迫感。",
      },
      {
        title: "会员权益与裂变体系",
        description: "VIP 消费金返现、分享佣金、拉新奖励分层呈现，支撑社群运营与复购。",
      },
      {
        title: "全链路订单服务",
        description: "个人中心覆盖待付款至退款全流程，并衔接公告、客服与品牌信息。",
      },
    ],
    palette: {
      paper: "#ffffff",
      mist: "#fff3ee",
      accent: "#e84b4b",
      ink: "#1c1416",
    },
    themeColor: "#1c1416",
    paletteFromCover: true,
    flowSteps: [
      {
        title: "发现",
        description: "从爆款首页或主题分类进入，按城市与户外主题找到同频线路。",
      },
      {
        title: "组队",
        description: "查看成团人数、倒计时与标签详情，一键加入意向行程。",
      },
      {
        title: "留存",
        description: "权益体系与个人中心承接会员升级、订单管理与客服触达。",
      },
    ],
    metaRows: [
      { label: "客户 / 产品", value: "约起玩 · 社群主题游" },
      { label: "交付", value: "微信小程序 · 线路发现 · 组队报名 · 会员权益" },
      { label: "展示形式", value: "界面截屏实录 · 案例页展示" },
    ],
    seoTitle: "约起玩小程序 — 社交旅游案例 | 灵壳 LINGKE",
    seoDescription:
      "约起玩微信小程序：社群主题游、同频约搭子与户外线路组队报名界面案例展示 — 灵壳 LINGKE。",
  },
  {
    slug: "tea-commerce",
    heroTitle: "某新锐茶饮社交电商",
    tagline: "点单 · 会员 · 活动 — 截屏实录下的交易与留存动线",
    locationLine: "客户所在行业 · 新式茶饮",
    platform: "微信小程序",
    categoryLabel: "社交电商",
    coverImage:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=85",
    screens: [
      {
        index: "01",
        src: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=85",
        caption: "首页 · 选品与活动入口",
        summary: "顶部运营位 + 商品瀑布流，把当季爆款与限时活动压到首屏。",
      },
      {
        index: "02",
        src: "https://images.unsplash.com/photo-1546173159-3157242f82ed?auto=format&fit=crop&w=900&q=85",
        caption: "点单 · 规格与加料",
        summary: "SKU 规格、甜度冰度与加料在同一面板完成，减少反复跳转。",
      },
      {
        index: "03",
        src: "https://images.unsplash.com/photo-1525385133512-2f3bdd039bcd?auto=format&fit=crop&w=900&q=85",
        caption: "结算 · 优惠与支付",
        summary: "优惠券、满减与配送方式集中确认，支付步骤收敛到最少点击。",
      },
      {
        index: "04",
        src: "https://images.unsplash.com/photo-1515823064-6f99a6f977ca?auto=format&fit=crop&w=900&q=85",
        caption: "会员 · 积分与权益",
        summary: "等级、积分与专属券包可视化，承接复购与分享裂变触达。",
      },
    ],
    capabilities: [
      {
        title: "首页运营与选品",
        description: "活动 Banner、分类入口与瀑布流商品卡，支持快速加购与爆款曝光。",
      },
      {
        title: "点单与规格体系",
        description: "多规格、加料与数量步进在同一浮层完成，适配高峰时段的快速下单。",
      },
      {
        title: "结算与营销叠加",
        description: "券包、满减与配送选项同屏决策，降低放弃率。",
      },
      {
        title: "会员与复购触达",
        description: "积分、等级与订阅消息入口集中，便于运营做留存与唤醒。",
      },
    ],
    palette: {
      paper: "#faf8f5",
      mist: "#efe8df",
      accent: "#3d5c45",
      ink: "#12100e",
    },
    themeColor: "#12100e",
    flowSteps: [
      {
        title: "逛",
        description: "从首页活动与瀑布流进入选品，路径短、信息层级清晰。",
      },
      {
        title: "买",
        description: "规格确认 → 购物车 → 结算支付，三步内完成核心交易。",
      },
      {
        title: "留",
        description: "会员中心承接积分与券包，为二次到店与分享裂变留接口。",
      },
    ],
    metaRows: [
      { label: "客户 / 行业", value: "新式茶饮 · 连锁零售" },
      { label: "交付", value: "微信小程序 · 交易与会员" },
      { label: "展示形式", value: "界面截屏实录 · 案例页展示" },
    ],
  },
];

export function getMiniCaseBySlug(slug: string | undefined): MiniCase | undefined {
  if (!slug) return undefined;
  return MINI_CASES.find((c) => c.slug === slug);
}
