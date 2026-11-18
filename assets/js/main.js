/* =========================================================
   Lumen · 启动与状态
   负责：读配置、应用主题令牌、渲染、持久化、站点内交互委托。
   ========================================================= */
(function () {
  var SF = window.SiteForge;
  var KEY = "lumen.site.v1";
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: dark)");

  var cfg = load();

  /* 构建时注入的文章列表：前端重绘时也要带着，否则首页的「最近写的」会消失 */
  if (window.__SITE_POSTS__ && Array.isArray(window.__SITE_POSTS__)) {
    cfg.posts = window.__SITE_POSTS__;
  }

  /* 全站偏好：博客页读同一份，保证「一个设置窗口，两个页面一起变」 */
  var PREF_KEY = "wszla.prefs";
  var prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "{}"); } catch (e) { prefs = {}; }

  function savePrefs(patch) {
    prefs = Object.assign({}, prefs, patch);
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {}
  }
  SF.prefs = {
    get: function () { return prefs; },
    set: savePrefs
  };
  var raf = 0;
  var saveTimer = 0;
  var observer = null;

  /* ---------- 配置读写 ---------- */
  function load() {
    var base = SF.clone(SF.defaults);
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return SF.merge(base, JSON.parse(raw));
    } catch (err) {
      console.warn("[Lumen] 本地配置读取失败，使用默认配置", err);
    }
    return base;
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(KEY, JSON.stringify(cfg));
      } catch (err) {
        /* 隐私模式下写入会失败，站点照常可用 */
      }
    }, 200);
  }

  /* ---------- 主题令牌 ---------- */
  function applyTheme() {
    var mode = SF.resolveMode(cfg.theme.mode, mq.matches);
    var tokens = SF.tokens(cfg, mode);

    root.setAttribute("data-theme", tokens.mode);
    document.body.setAttribute("data-bg", tokens.bg);

    Object.keys(tokens.css).forEach(function (name) {
      root.style.setProperty(name, tokens.css[name]);
    });

    document.title = cfg.meta.title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", cfg.meta.description);
    if (cfg.meta.lang) root.setAttribute("lang", cfg.meta.lang);

    /* 把外观写进共享偏好，博客页打开时直接沿用 */
    savePrefs({ theme: tokens.mode, accent: cfg.theme.accent, scale: prefs.blogScale || 1 });
  }

  /* ---------- 渲染 ---------- */
  function draw(instant) {
    applyTheme();
    SF.render(cfg, { instant: !!instant });

    var nodes = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (instant || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) { node.classList.add("in"); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    }
    nodes.forEach(function (node) {
      if (!node.classList.contains("in")) observer.observe(node);
    });
  }

  function scheduleDraw() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      draw(true);
    });
  }

  function commit() {
    persist();
    scheduleDraw();
  }

  /* ---------- 交互 ---------- */
  function toggleTheme() {
    var current = SF.resolveMode(cfg.theme.mode, mq.matches);
    cfg.theme.mode = current === "dark" ? "light" : "dark";
    commit();
  }

  function closeNav() {
    var header = document.getElementById("site-header");
    if (!header) return;
    header.classList.remove("is-open");
    var toggle = header.querySelector(".nav-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function onSiteClick(e) {
    /* 移动端点完导航项顺手收起菜单 */
    if (e.target.closest(".nav-link")) closeNav();

    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var act = btn.getAttribute("data-act");

    if (act === "open-customizer") {
      e.preventDefault();
      SF.customizer.open();
      return;
    }
    if (act === "theme") {
      toggleTheme();
      return;
    }
    if (act === "nav") {
      var header = document.getElementById("site-header");
      var open = header.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  function onScroll() {
    var header = document.getElementById("site-header");
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function onSchemeChange() {
    if (cfg.theme.mode === "auto") draw(true);
  }

  /* ---------- 对外 API ---------- */
  SF.app = {
    get cfg() { return cfg; },
    commit: commit,
    replace: function (next) {
      cfg = SF.merge(SF.clone(SF.defaults), next || {});
      persist();
      draw(true);
    },
    reset: function () {
      try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
      cfg = SF.clone(SF.defaults);
      persist();
      draw(true);
    }
  };

  /* ---------- 启动 ---------- */
  function boot() {
    draw(false);
    SF.customizer.init();
    onScroll();
    document.getElementById("site").addEventListener("click", onSiteClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (mq.addEventListener) mq.addEventListener("change", onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);

    /* /?design=1 直接打开设计面板；带 tab 参数就定位到对应标签 */
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.has("design")) SF.customizer.open(params.get("tab") || "");
    } catch (err) {
      /* ignore */
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
