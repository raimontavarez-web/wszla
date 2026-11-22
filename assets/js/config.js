/* =========================================================
   Lumen · 站点配置
   整站内容都由这份数据驱动：改这里 + 刷新 = 换一个站。
   运行时也可以用右侧「定制」面板改动，并导出 JSON 覆盖这里。
   ========================================================= */
window.SiteForge = window.SiteForge || {};

window.SiteForge.defaults = {
  meta: {
    title: "WSZLA · 工具与随笔",
    description: "WSZLA 的个人站点：忍野忍、ManifestHub2、抖音续火花助手、ClimberFly 几个自己写的工具，以及关于建站、上线、SEO 和折腾的随笔记录。",
    lang: "zh-CN",
    url: "https://wszla.cn",
    /* IndexNow 提交用的 key：构建时会在根目录生成 <key>.txt */
    indexnowKey: "b7f3c9a1e5d2488fb6c0a7d4e21f9b35"
  },

  /* 搜索引擎站长验证：从各平台拿到验证码后填在这里，构建时会注入 meta 标签 */
  verify: {
    baidu: "",
    google: "",
    bing: ""
  },

  brand: {
    name: "WSZLA",
    mark: "◆",
    tagline: "工具与随笔"
  },

  theme: {
    mode: "light",        // light | dark | auto
    accent: "#ff5a36",
    radius: 16,
    font: "sans",         // sans | serif | mono
    bg: "mesh",           // mesh | grid | plain
    max: 1180
  },

  nav: [
    { label: "导航", href: "/links/" },
    { label: "影视", href: "https://llc-cage-dancing-mid.trycloudflare.com", external: true },
    { label: "工具", href: "/tools/" },
    { label: "文章", href: "/blog/" },
    { label: "关于", href: "/about/" },
    { label: "设计", href: "design" }
  ],

  hero: {
    eyebrow: "影视 · 工具 · 随笔",
    title: "15555 部影视，",
    highlight: "一个站看完",
    subtitle: "番剧、电影、剧集、综艺、纪录片分类整理，14 万集分集索引，支持筛选、排行、排期与追番。",
    primary: { label: "进入影视站", href: "https://llc-cage-dancing-mid.trycloudflare.com" },
    secondary: { label: "看看工具", href: "/tools/" },
    stats: [
      { value: "40+", label: "区块组合" },
      { value: "0", label: "外部依赖" },
      { value: "3 min", label: "改完一版" }
    ]
  },

  logos: ["Northwind", "Mono", "Kite", "Fern", "Atlas", "平流层"],

  features: {
    title: "这个站是怎么搭的",
    subtitle: "没有 CMS，没有数据库，也没有月费。一份配置、一个构建脚本，剩下的都在你眼前。",
    items: [
      { icon: "sparkles", title: "实时定制", text: "面板一开，配色、字体、文案、区块顺序即时生效，看到什么就是什么。" },
      { icon: "cube", title: "零依赖", text: "纯 HTML / CSS / JavaScript，一个静态目录丢到任何托管都能跑。" },
      { icon: "layout", title: "响应式", text: "从 320px 手机到超宽屏，栅格与字号自动收放，不靠裁切将就。" },
      { icon: "moon", title: "深浅双色", text: "一套设计令牌驱动两套外观，跟随系统或手动锁定都行。" },
      { icon: "code", title: "配置即数据", text: "整站内容是一份 JSON，导出、备份、迁移、走 Git 都轻松。" },
      { icon: "shield", title: "可访问性", text: "语义化结构、键盘可达、对比度达标，细节不糊弄人。" }
    ]
  },

  showcase: {
    title: "影视站 + 我自己写的小工具",
    subtitle: "第一个是影视索引站，其余几个是日常在用的小工具。",
    items: [
      { tag: "影视索引", title: "鲸幕影视", text: "15555 部番剧电影剧集，14 万集分集索引，筛选、排行、排期与追番。", href: "https://llc-cage-dancing-mid.trycloudflare.com" },
      { tag: "桌面助手", title: "忍野忍", text: "状态面板、启动停止、人格模式、语音和日志，一个窗口全管。" },
      { tag: "入库工具", title: "ManifestHub2", text: "清单批量入库，绿色免安装，拖进去就跑完。" },
      { tag: "自动化", title: "抖音续火花助手", text: "每天定时给好友发表情码，火花自动续上，不用惦记。" },
      { tag: "游戏助手", title: "ClimberFly", text: "Climber Animals 的飞天小助手，手残也能上墙。" }
    ]
  },

  pricing: {
    title: "先用起来，再决定要不要付钱",
    subtitle: "模板永久免费，需要人一起搭的时候再说。",
    items: [
      {
        name: "个人",
        price: "¥0",
        unit: "永久",
        desc: "自用、练手、放个简历都够用。",
        features: ["完整单页模板", "全部主题预设", "本地配置保存", "导出 JSON"],
        cta: "直接开始",
        featured: false
      },
      {
        name: "团队",
        price: "¥39",
        unit: "/ 月",
        desc: "给客户交付和小团队协作准备。",
        features: ["多项目管理", "品牌色板预设", "自定义域名指引", "邮件支持"],
        cta: "选这个",
        featured: true
      },
      {
        name: "定制",
        price: "面议",
        unit: "按项目",
        desc: "从零设计，按你的业务长出来。",
        features: ["专属视觉设计", "区块定制开发", "内容迁移", "上线陪跑"],
        cta: "聊聊需求",
        featured: false
      }
    ]
  },

  testimonials: {
    title: "有人已经用它上线了",
    items: [
      { quote: "以前改一个落地页要等排期，现在自己弄一下午就上线，客户还以为是外包做的。", name: "阿澈", role: "独立开发者" },
      { quote: "默认配色和字体就很好看，第一版提案直接过了，省了我两轮返工。", name: "Momo", role: "自由设计师" },
      { quote: "导出 JSON 丢进仓库，改文案走 PR，流程居然能这么顺。", name: "老周", role: "前端负责人" }
    ]
  },

  faq: {
    title: "几个常被问到的问题",
    items: [
      { q: "需要会写代码吗？", a: "不需要。所有内容都在定制面板里改；要接表单、接后端时再加代码，模板本身不挡路。" },
      { q: "能绑定自己的域名吗？", a: "能。这是纯静态站点，丢到任意静态托管（对象存储、Pages、Nginx）后绑定域名即可。" },
      { q: "改的数据存在哪里？", a: "默认存在浏览器的 localStorage，导出 JSON 就是你的备份，也可以直接覆盖 config.js。" },
      { q: "可以商用吗？", a: "可以。把示例文案和品牌换成你自己的，就是你的站点。" },
      { q: "手机上能改吗？", a: "面板是自适应的，手机上也能改，只是长文案敲起来慢一些。" }
    ]
  },

  cta: {
    title: "想改什么，直接改",
    text: "右下角「定制」里调配色、字体和文案，改完在「数据」页导出 JSON，我构建上线。",
    buttonLabel: "打开定制面板",
    href: ""
  },

  footer: {
    note: "WSZLA 的门面，随时可以拆了重来。",
    links: [
      { label: "GitHub", href: "#" },
      { label: "邮件", href: "mailto:hi@example.com" },
      { label: "更新日志", href: "#" }
    ],
    copyright: "© 2026 WSZLA"
  },

  layout: {
    order: ["hero", "cta", "showcase", "posts", "features", "faq", "logos", "pricing", "testimonials"],
    hidden: ["posts", "features", "faq", "logos", "pricing", "testimonials"]
  }
};

/* 深拷贝：配置对象在运行时会被反复读写，避免共享引用 */
window.SiteForge.clone = function (value) {
  return JSON.parse(JSON.stringify(value));
};

/* 用默认值兜底地合并用户配置：缺字段补默认，类型不对就用默认 */
window.SiteForge.merge = function merge(base, patch) {
  if (Array.isArray(base)) {
    return Array.isArray(patch) ? patch.slice() : base;
  }
  if (base && typeof base === "object") {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) return base;
    var out = {};
    Object.keys(base).forEach(function (key) {
      out[key] = merge(base[key], patch[key]);
    });
    return out;
  }
  if (patch === undefined || patch === null) return base;
  return typeof patch === typeof base ? patch : base;
};
