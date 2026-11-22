/* =========================================================
   Lumen · 渲染层
   输入一份配置，输出整站 DOM 字符串。只负责「长什么样」，
   不绑定事件；交互统一放在 main.js 里做事件委托。
   ========================================================= */
(function () {
  var SF = (window.SiteForge = window.SiteForge || {});

  /* ---------- 工具 ---------- */
  var ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ESC_MAP[ch];
    });
  }
  SF.esc = esc;

  function svg(paths) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      paths +
      "</svg>"
    );
  }

  SF.icons = {
    sparkles: svg('<path d="M12 3.5l1.8 4.9 4.9 1.8-4.9 1.8L12 16.9l-1.8-4.9L5.3 10.2l4.9-1.8z"/><path d="M18 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>'),
    cube: svg('<path d="M12 2.9 20.5 7v10L12 21.1 3.5 17V7z"/><path d="M3.5 7 12 11.1 20.5 7M12 11.1V21.1"/>'),
    layout: svg('<rect x="3" y="4" width="18" height="16" rx="2.2"/><path d="M3 10h18M9.5 10v10"/>'),
    moon: svg('<path d="M20.2 14.7A8.6 8.6 0 1 1 9.3 3.8a6.9 6.9 0 0 0 10.9 10.9z"/>'),
    code: svg('<path d="m8.5 8.5-4 3.5 4 3.5M15.5 8.5l4 3.5-4 3.5M13.6 5.2l-3.2 13.6"/>'),
    shield: svg('<path d="M12 3.2 20 6v6.1c0 4.9-3.4 7.9-8 8.9-4.6-1-8-4-8-8.9V6z"/><path d="m9 12 2.2 2.2L15.2 10"/>'),
    bolt: svg('<path d="M13.2 2.5 4.5 13.8h6.4l-1.1 7.7 8.7-11.3h-6.4z"/>'),
    globe: svg('<circle cx="12" cy="12" r="8.8"/><path d="M3.2 12h17.6M12 3.2c2.4 2.5 3.8 5.6 3.8 8.8s-1.4 6.3-3.8 8.8c-2.4-2.5-3.8-5.6-3.8-8.8s1.4-6.3 3.8-8.8z"/>'),
    chart: svg('<path d="M4 20V10M10 20V4M16 20v-6.5M22 20H2"/>'),
    heart: svg('<path d="M12 20.3C8.4 17.9 3.6 14.4 3.6 9.8a4.6 4.6 0 0 1 8.4-2.2 4.6 4.6 0 0 1 8.4 2.2c0 4.6-4.8 8.1-8.4 10.5z"/>'),
    layers: svg('<path d="m12 3 9 4.8-9 4.8-9-4.8z"/><path d="m3.4 12.6 8.6 4.6 8.6-4.6"/>'),
    check: svg('<path d="m5 12.5 4.4 4.4L19 7.5"/>'),
    sun: svg('<circle cx="12" cy="12" r="4.1"/><path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2 6.8 6.8M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>'),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    arrow: svg('<path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/>')
  };

  SF.iconNames = ["sparkles", "cube", "layout", "moon", "code", "shield", "bolt", "globe", "chart", "heart", "layers"];

  function icon(name) {
    return SF.icons[name] || SF.icons.sparkles;
  }

  function heroButton(btn, cls, action) {
    var label = esc(btn && btn.label);
    var href = btn && btn.href ? btn.href : "#";
    if (href === "customizer" || action) {
      return '<button class="btn ' + cls + '" type="button" data-act="open-customizer">' + label +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/></svg></button>';
    }
    return '<a class="btn ' + cls + '" href="' + esc(href) + '">' + label + "</a>";
  }

  /* ---------- 头部 ---------- */
  function renderHeader(c, mode) {
    var nav = (c.nav || [])
      .map(function (item) {
        if (item.href === "design") {
          return (
            '<button class="nav-link nav-link-btn" type="button" data-act="open-customizer">' +
            esc(item.label) +
            "</button>"
          );
        }
        return '<a class="nav-link" href="' + esc(item.href) + '">' + esc(item.label) + "</a>";
      })
      .join("");

    return (
      '<div class="wrap header-inner">' +
      '<a class="brand" href="#top" aria-label="' + esc(c.brand.name) + ' 首页">' +
      '<span class="brand-mark">' + esc(c.brand.mark) + "</span>" +
      '<span class="brand-text"><strong>' + esc(c.brand.name) + "</strong><small>" + esc(c.brand.tagline) + "</small></span>" +
      "</a>" +
      '<nav class="nav" aria-label="主导航">' + nav + "</nav>" +
      '<div class="header-actions">' +
      '<button class="icon-btn" type="button" data-act="theme" aria-label="切换深浅色" title="切换深浅色">' +
      (mode === "dark" ? SF.icons.sun : SF.icons.moon) +
      "</button>" +
      '<button class="btn btn-sm btn-solid" type="button" data-act="open-customizer">定制</button>' +
      '<button class="icon-btn nav-toggle" type="button" data-act="nav" aria-label="展开菜单" aria-expanded="false">' + SF.icons.menu + "</button>" +
      "</div>" +
      "</div>"
    );
  }

  /* ---------- 各区块 ---------- */
  function renderHero(c) {
    var h = c.hero;
    var stats = (h.stats || [])
      .map(function (s) {
        return '<div class="stat"><b>' + esc(s.value) + "</b><span>" + esc(s.label) + "</span></div>";
      })
      .join("");

    return (
      '<section class="hero" id="hero">' +
      '<div class="wrap hero-grid">' +
      '<div class="hero-copy reveal">' +
      (h.eyebrow ? '<p class="eyebrow"><span class="eyebrow-dot"></span>' + esc(h.eyebrow) + "</p>" : "") +
      '<h1 class="hero-title">' + esc(h.title) + ' <span class="hl">' + esc(h.highlight) + "</span></h1>" +
      '<p class="lede">' + esc(h.subtitle) + "</p>" +
      '<div class="hero-cta">' +
      heroButton(h.primary, "btn-solid btn-lg") +
      heroButton(h.secondary, "btn-ghost btn-lg") +
      "</div>" +
      (stats ? '<div class="stats">' + stats + "</div>" : "") +
      "</div>" +
      '<div class="hero-visual reveal" style="--d:120ms">' +
      '<div class="mock" aria-hidden="true">' +
      '<div class="mock-bar"><span class="mock-dot"></span><span class="mock-dot"></span><span class="mock-dot"></span><span class="mock-url">' +
      esc((c.brand.name || "site").toLowerCase()) + ".site</span></div>" +
      '<div class="mock-body">' +
      '<div class="mock-blob"></div>' +
      '<div class="mock-nav"><b>' + esc(c.brand.name) + "</b><i></i><i></i><i></i></div>" +
      '<div class="mock-hero">' +
      '<div class="mock-line w92"></div>' +
      '<div class="mock-line w74"></div>' +
      '<div class="mock-line accent"></div>' +
      '<div class="mock-line w46"></div>' +
      '<div class="mock-cta"><span></span><span></span></div>' +
      "</div>" +
      '<div class="mock-cards"><div class="mock-card"></div><div class="mock-card"></div><div class="mock-card"></div></div>' +
      "</div>" +
      "</div>" +
      '<div class="float-note fn-a">' + icon("sparkles") + "实时预览</div>" +
      '<div class="float-note fn-b">' + icon("check") + "配置已保存</div>" +
      "</div>" +
      "</div>" +
      "</section>"
    );
  }

  function renderLogos(c) {
    var items = (c.logos || [])
      .map(function (name) {
        return '<span class="logo">' + esc(name) + "</span>";
      })
      .join("");
    return (
      '<section class="logos" id="logos"><div class="wrap">' +
      '<span class="logos-label">已经有人在用</span>' +
      '<div class="logos-row reveal">' + items + "</div>" +
      "</div></section>"
    );
  }

  function renderPosts(c) {
    var posts = c.posts || [];
    if (!posts.length) return "";
    var cards = posts
      .slice(0, 3)
      .map(function (p, i) {
        var d = String(p.date || "").split("-");
        return (
          '<a class="post-card reveal" style="--d:' + i * 70 + 'ms" href="/blog/' + esc(p.slug) + '.html">' +
          '<time class="post-card-date">' + esc(d.join(".")) + "</time>" +
          "<h3>" + esc(p.title) + "</h3>" +
          "<p>" + esc(p.summary) + "</p>" +
          '<span class="post-card-more">' + esc(p.minutes) + " 分钟读完 →</span>" +
          "</a>"
        );
      })
      .join("");

    return (
      '<section class="section" id="posts"><div class="wrap">' +
      '<div class="section-head reveal"><p class="eyebrow"><span class="eyebrow-dot"></span>文章</p>' +
      "<h2>最近写的</h2>" +
      '<p class="sub">建站、工具，和一些想明白的事。</p></div>' +
      '<div class="posts-grid">' + cards + "</div>" +
      '<div class="posts-all"><a class="btn btn-ghost" href="/blog/">全部文章 →</a></div>' +
      "</div></section>"
    );
  }

  function renderFeatures(c) {
    var f = c.features;
    var cards = (f.items || [])
      .map(function (item, i) {
        return (
          '<article class="card reveal" style="--d:' + i * 60 + 'ms">' +
          '<div class="ficon">' + icon(item.icon) + "</div>" +
          "<h3>" + esc(item.title) + "</h3>" +
          "<p>" + esc(item.text) + "</p>" +
          "</article>"
        );
      })
      .join("");

    return (
      '<section class="section" id="features"><div class="wrap">' +
      '<div class="section-head reveal"><p class="eyebrow"><span class="eyebrow-dot"></span>关于</p>' +
      "<h2>" + esc(f.title) + "</h2>" +
      '<p class="sub">' + esc(f.subtitle) + "</p></div>" +
      '<div class="cards">' + cards + "</div>" +
      "</div></section>"
    );
  }

  function renderShowcase(c) {
    var s = c.showcase;
    var tiles = (s.items || [])
      .map(function (item, i) {
        /* 有 href 的条目整块可点，渲染成 <a> */
        var inner =
          '<div class="thumb"><span></span></div>' +
          '<div class="tile-body"><span class="tag">' + esc(item.tag) + "</span>" +
          "<h3>" + esc(item.title) + "</h3>" +
          "<p>" + esc(item.text) + "</p></div>";
        if (item.href) {
          return (
            '<a class="tile tile-link reveal" href="' + esc(item.href) + '" style="--d:' + i * 70 + 'ms">' +
            inner + "</a>"
          );
        }
        return '<article class="tile reveal" style="--d:' + i * 70 + 'ms">' + inner + "</article>";
      })
      .join("");

    return (
      '<section class="section" id="showcase"><div class="wrap">' +
      '<div class="section-head reveal"><p class="eyebrow"><span class="eyebrow-dot"></span>工具</p>' +
      "<h2>" + esc(s.title) + "</h2>" +
      '<p class="sub">' + esc(s.subtitle) + "</p></div>" +
      '<div class="tiles' + (tiles.length === 4 ? " tiles-4" : "") + '">' + tiles + "</div>" +
      "</div></section>"
    );
  }

  function renderPricing(c) {
    var p = c.pricing;
    var cards = (p.items || [])
      .map(function (item, i) {
        var feats = (item.features || [])
          .map(function (line) {
            return "<li>" + SF.icons.check + "<span>" + esc(line) + "</span></li>";
          })
          .join("");
        return (
          '<article class="price' + (item.featured ? " is-featured" : "") + ' reveal" style="--d:' + i * 70 + 'ms">' +
          (item.featured ? '<span class="price-badge">推荐</span>' : "") +
          '<span class="price-name">' + esc(item.name) + "</span>" +
          '<div class="amount"><b>' + esc(item.price) + "</b><span>" + esc(item.unit) + "</span></div>" +
          '<p class="price-desc">' + esc(item.desc) + "</p>" +
          '<ul class="price-feats">' + feats + "</ul>" +
          '<a class="btn ' + (item.featured ? "btn-solid" : "btn-ghost") + ' price-cta" href="#cta">' +
          esc(item.cta) + "</a>" +
          "</article>"
        );
      })
      .join("");

    return (
      '<section class="section" id="pricing"><div class="wrap">' +
      '<div class="section-head reveal"><p class="eyebrow"><span class="eyebrow-dot"></span>价格</p>' +
      "<h2>" + esc(p.title) + "</h2>" +
      '<p class="sub">' + esc(p.subtitle) + "</p></div>" +
      '<div class="price-grid">' + cards + "</div>" +
      "</div></section>"
    );
  }

  function renderTestimonials(c) {
    var t = c.testimonials;
    var cards = (t.items || [])
      .map(function (item, i) {
        var initial = String(item.name || "?").trim().slice(0, 1);
        return (
          '<article class="quote-card reveal" style="--d:' + i * 70 + 'ms">' +
          '<p class="quote">' + esc(item.quote) + "</p>" +
          '<div class="who"><span class="avatar">' + esc(initial) + "</span>" +
          "<span><strong>" + esc(item.name) + "</strong><small>" + esc(item.role) + "</small></span></div>" +
          "</article>"
        );
      })
      .join("");

    return (
      '<section class="section" id="testimonials"><div class="wrap">' +
      '<div class="section-head reveal"><p class="eyebrow"><span class="eyebrow-dot"></span>评价</p>' +
      "<h2>" + esc(t.title) + "</h2></div>" +
      '<div class="quotes">' + cards + "</div>" +
      "</div></section>"
    );
  }

  function renderFaq(c) {
    var f = c.faq;
    var items = (f.items || [])
      .map(function (item, i) {
        return (
          '<details class="faq-item" ' + (i === 0 ? "open" : "") + ">" +
          "<summary>" + esc(item.q) + "</summary>" +
          '<div class="faq-a">' + esc(item.a) + "</div>" +
          "</details>"
        );
      })
      .join("");

    return (
      '<section class="section" id="faq"><div class="wrap">' +
      '<div class="section-head reveal"><p class="eyebrow"><span class="eyebrow-dot"></span>问答</p>' +
      "<h2>" + esc(f.title) + "</h2></div>" +
      '<div class="faq-list reveal">' + items + "</div>" +
      "</div></section>"
    );
  }

  function renderCta(c) {
    var label = esc(c.cta.buttonLabel);
    var action = c.cta.href
      ? '<a class="btn btn-solid btn-lg" href="' + esc(c.cta.href) + '">' + label + "</a>"
      : '<button class="btn btn-solid btn-lg" type="button" data-act="open-customizer">' + label + "</button>";
    return (
      '<section class="cta-band" id="cta"><div class="wrap"><div class="cta-inner reveal">' +
      '<h2 class="cta-title">' + esc(c.cta.title) + "</h2>" +
      '<p class="cta-text">' + esc(c.cta.text) + "</p>" +
      action +
      "</div></div></section>"
    );
  }

  var RENDERERS = {
    hero: renderHero,
    logos: renderLogos,
    features: renderFeatures,
    showcase: renderShowcase,
    posts: renderPosts,
    pricing: renderPricing,
    testimonials: renderTestimonials,
    faq: renderFaq,
    cta: renderCta
  };

  /* 区块的中文名，供定制面板复用 */
  SF.sectionLabels = {
    hero: "首屏",
    logos: "客户 Logo",
    features: "关于这个站",
    showcase: "工具",
    posts: "文章",
    pricing: "价格",
    testimonials: "评价",
    faq: "问答",
    cta: "结尾行动"
  };

  /* ---------- 页脚 ---------- */
  function renderFooter(c) {
    var links = (c.footer.links || [])
      .map(function (l) {
        return '<a href="' + esc(l.href) + '">' + esc(l.label) + "</a>";
      })
      .join("");

    return (
      '<div class="wrap">' +
      '<div class="footer-inner">' +
      '<div class="footer-brand">' +
      '<a class="brand" href="#top"><span class="brand-mark">' + esc(c.brand.mark) + "</span>" +
      '<span class="brand-text"><strong>' + esc(c.brand.name) + "</strong><small>" + esc(c.brand.tagline) + "</small></span></a>" +
      '<p class="footer-note">' + esc(c.footer.note) + "</p>" +
      "</div>" +
      '<nav class="footer-links" aria-label="页脚链接">' + links +
      '<button class="footer-link-btn" type="button" data-act="open-customizer">定制这个站点</button>' +
      "</nav>" +
      "</div>" +
      '<div class="footer-bottom"><span>' + esc(c.footer.copyright) + "</span>" +
      "<span>静态输出 · 零依赖 · 可被收录</span></div>" +
      "</div>"
    );
  }

  /* ---------- 入口 ---------- */
  /* 纯函数版：构建脚本在 Node 里也能调用，用来预渲染静态 HTML */
  SF.renderParts = function (cfg, opts) {
    opts = opts || {};
    var order = (cfg.layout.order || []).filter(function (id) {
      return RENDERERS[id] && (cfg.layout.hidden || []).indexOf(id) === -1;
    });
    return {
      header: renderHeader(cfg, opts.mode || "light"),
      main: order.map(function (id) { return RENDERERS[id](cfg); }).join(""),
      footer: renderFooter(cfg),
      sections: order
    };
  };

  /* DOM 版：浏览器里把 three 块写回去 */
  SF.render = function (cfg, opts) {
    opts = opts || {};
    var header = document.getElementById("site-header");
    var main = document.getElementById("main");
    var footer = document.getElementById("site-footer");
    var site = document.getElementById("site");
    if (!header || !main || !footer) return;

    var mode = document.documentElement.getAttribute("data-theme") || "light";
    var parts = SF.renderParts(cfg, { mode: mode });

    site.classList.toggle("is-instant", !!opts.instant);
    header.className = "site-header" + (window.scrollY > 8 ? " is-scrolled" : "");
    header.innerHTML = parts.header;
    main.innerHTML = parts.main;
    footer.innerHTML = parts.footer;
  };
})();
