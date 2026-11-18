/* =========================================================
   Lumen · 定制面板
   读取 / 写入 window.SiteForge.app.cfg，改动即时反映到站点上。
   所有字段都用 data-path 描述位置，事件统一委托，面板可以随时重建。
   ========================================================= */
(function () {
  var SF = window.SiteForge;
  var esc = SF.esc;

  var bodyEl, panelEl, backdropEl, openBtn;
  var built = false;
  var lastTab = "theme";

  var TABS = [
    { id: "theme", label: "主题" },
    { id: "blog", label: "博客" },
    { id: "content", label: "内容" },
    { id: "layout", label: "区块" },
    { id: "data", label: "数据" }
  ];

  var PRESETS = ["#ff5a36", "#2563eb", "#0ea5e9", "#10b981", "#a855f7", "#f43f5e", "#eab308", "#111827"];

  var ICON_LABELS = {
    sparkles: "星光", cube: "方块", layout: "布局", moon: "月亮", code: "代码",
    shield: "盾牌", bolt: "闪电", globe: "地球", chart: "图表", heart: "爱心", layers: "层叠"
  };

  /* ---------- 读写路径 ---------- */
  function cfg() { return SF.app.cfg; }

  function getPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc == null ? acc : acc[key];
    }, obj);
  }

  function setPath(obj, path, value) {
    var keys = path.split(".");
    var last = keys.pop();
    var target = keys.reduce(function (acc, key) { return acc[key]; }, obj);
    target[last] = value;
  }

  /* ---------- 字段工厂 ---------- */
  function attr(v) { return esc(v == null ? "" : v); }

  function text(label, path, value, placeholder) {
    return '<label class="cf-field"><span>' + label + "</span>" +
      '<input type="text" data-path="' + path + '" value="' + attr(value) +
      '" placeholder="' + attr(placeholder || "") + '" spellcheck="false"></label>';
  }

  function area(label, path, value, rows) {
    return '<label class="cf-field"><span>' + label + "</span>" +
      '<textarea rows="' + (rows || 3) + '" data-path="' + path + '">' + attr(value) + "</textarea></label>";
  }

  function lines(label, path, arr) {
    var list = Array.isArray(arr) ? arr : [];
    return '<label class="cf-field"><span>' + label + '<b>每行一条</b></span>' +
      '<textarea rows="' + Math.min(7, Math.max(3, list.length + 1)) + '" data-type="lines" data-path="' + path + '">' +
      attr(list.join("\n")) + "</textarea></label>";
  }

  function colorField(label, path, value) {
    return '<div class="cf-field"><span>' + label + "</span>" +
      '<div class="cf-color"><input type="color" data-path="' + path + '" value="' + attr(value) + '" aria-label="选择颜色">' +
      '<input type="text" class="cf-hex" data-path="' + path + '" value="' + attr(value) + '" spellcheck="false" aria-label="颜色十六进制值"></div></div>';
  }

  function range(label, path, value, min, max, step) {
    return '<label class="cf-field"><span>' + label + ' <b data-out="' + path + '">' + attr(value) + "</b></span>" +
      '<input type="range" data-type="number" data-path="' + path + '" min="' + min + '" max="' + max +
      '" step="' + (step || 1) + '" value="' + attr(value) + '"></label>';
  }

  function select(label, path, value, options) {
    var opts = options.map(function (o) {
      return '<option value="' + attr(o.value) + '"' + (String(o.value) === String(value) ? " selected" : "") + ">" +
        esc(o.label) + "</option>";
    }).join("");
    return '<label class="cf-field"><span>' + label + "</span>" +
      '<select data-path="' + path + '">' + opts + "</select></label>";
  }

  function toggle(label, path, checked) {
    return '<label class="cf-check"><input type="checkbox" data-type="bool" data-path="' + path + '"' +
      (checked ? " checked" : "") + "><span>" + label + "</span></label>";
  }

  function seg(path, value, options) {
    var items = options.map(function (o) {
      var on = String(o.value) === String(value);
      return '<button type="button" data-act="set" data-path="' + path + '" data-value="' + attr(o.value) + '"' +
        (on ? ' class="is-on"' : "") + ">" + esc(o.label) + "</button>";
    }).join("");
    return '<div class="cf-seg">' + items + "</div>";
  }

  function listEditor(path, items, renderItem, addLabel) {
    var list = Array.isArray(items) ? items : [];
    var rows = list.map(function (item, i) {
      return '<div class="cf-item">' +
        '<div class="cf-item-top"><span class="cf-item-no">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<div class="cf-item-tools">' +
        '<button type="button" data-act="move" data-list="' + path + '" data-index="' + i + '" data-dir="-1" title="上移"' + (i === 0 ? " disabled" : "") + ">↑</button>" +
        '<button type="button" data-act="move" data-list="' + path + '" data-index="' + i + '" data-dir="1" title="下移"' + (i === list.length - 1 ? " disabled" : "") + ">↓</button>" +
        '<button type="button" data-act="remove" data-list="' + path + '" data-index="' + i + '" title="删除">✕</button>' +
        "</div></div>" + renderItem(item, i, path) + "</div>";
    }).join("");

    return '<div class="cf-list">' + rows +
      '<button type="button" class="cf-add" data-act="add" data-list="' + path + '">+ ' + esc(addLabel) + "</button></div>";
  }

  /* 新增项模板 */
  var ADDERS = {
    nav: function () { return { label: "新链接", href: "#features" }; },
    "hero.stats": function () { return { value: "10", label: "新指标" }; },
    "features.items": function () { return { icon: "sparkles", title: "新能力", text: "一句话说清它解决什么问题。" }; },
    "showcase.items": function () { return { tag: "新案例", title: "项目名", text: "一句话描述这个项目。" }; },
    "pricing.items": function () {
      return { name: "新方案", price: "¥0", unit: "/ 月", desc: "一句话说明适合谁。", features: ["要点一", "要点二"], cta: "选这个", featured: false };
    },
    "testimonials.items": function () { return { quote: "一句真实的使用感受。", name: "名字", role: "身份" }; },
    "faq.items": function () { return { q: "新问题？", a: "把答案写在这里。" }; },
    "footer.links": function () { return { label: "新链接", href: "#" }; }
  };

  /* ---------- 四个面板 ---------- */
  function themePane(c) {
    var swatches = PRESETS.map(function (hex) {
      var on = hex.toLowerCase() === String(c.theme.accent).toLowerCase();
      return '<button type="button" class="swatch' + (on ? " is-on" : "") + '" data-act="set" data-path="theme.accent" data-value="' + hex +
        '" style="background:' + hex + '" aria-label="主色 ' + hex + '"></button>';
    }).join("");

    return '' +
      '<div class="cf-group"><div class="cf-group-inner">' +
      '<div class="cf-field"><span>外观模式</span>' +
      seg("theme.mode", c.theme.mode, [
        { value: "light", label: "浅色" },
        { value: "dark", label: "深色" },
        { value: "auto", label: "跟随系统" }
      ]) + "</div>" +
      '<div class="cf-field"><span>主色</span></div>' +
      '<div class="cf-swatches">' + swatches + "</div>" +
      colorField("自定义颜色", "theme.accent", c.theme.accent) +
      '<div class="cf-field"><span>背景质感</span>' +
      seg("theme.bg", c.theme.bg, [
        { value: "mesh", label: "光晕" },
        { value: "grid", label: "网格" },
        { value: "plain", label: "纯色" }
      ]) + "</div>" +
      range("圆角", "theme.radius", c.theme.radius, 0, 28, 1) +
      select("标题字体", "theme.font", c.theme.font, [
        { value: "sans", label: "无衬线（现代）" },
        { value: "serif", label: "衬线（书卷）" },
        { value: "mono", label: "等宽（技术）" }
      ]) +
      range("版心宽度", "theme.max", c.theme.max, 1040, 1440, 20) +
      "</div></div>";
  }

  function blogPane() {
    var scale = String((SF.prefs && SF.prefs.get().blogScale) || 1);
    var sizes = [
      { value: "0.94", label: "小" },
      { value: "1", label: "标准" },
      { value: "1.08", label: "大" }
    ];
    var seg = sizes
      .map(function (s) {
        return '<button type="button" data-act="blog-scale" data-value="' + s.value + '"' +
          (s.value === scale ? ' class="is-on"' : "") + ">" + s.label + "</button>";
      })
      .join("");

    return '<div class="cf-group"><div class="cf-group-inner">' +
      '<div class="cf-field"><span>博客正文字号</span><div class="cf-seg">' + seg + "</div></div>" +
      '<p class="cf-hint">博客页（/blog/）和首页共用这里的「主题」设置——主色、深浅色一改两边都变。字号只影响文章正文。</p>' +
      '<a class="cf-btn cf-btn-wide" href="/blog/" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none">打开博客看效果 →</a>' +
      "</div></div>";
  }

  function contentPane(c) {
    return "<div>" +
      '<details class="cf-group" open><summary>品牌</summary><div class="cf-group-inner">' +
      text("品牌名", "brand.name", c.brand.name) +
      text("标志字符", "brand.mark", c.brand.mark, "一个字符，如 ◆") +
      text("品牌副标题", "brand.tagline", c.brand.tagline) +
      "</div></details>" +

      '<details class="cf-group"><summary>站点信息（SEO）</summary><div class="cf-group-inner">' +
      text("网页标题", "meta.title", c.meta.title) +
      area("网页描述", "meta.description", c.meta.description, 3) +
      text("站点地址", "meta.url", c.meta.url, "https://example.com") +
      '<p class="cf-hint">标题建议 30 字以内，描述 50~160 字；站点地址用于生成 canonical、分享图和 sitemap，构建时生效。</p>' +
      "</div></details>" +

      '<details class="cf-group"><summary>导航</summary><div class="cf-group-inner">' +
      listEditor("nav", c.nav, function (item, i) {
        return '<div class="cf-row">' + text("文字", "nav." + i + ".label", item.label) +
          text("链接", "nav." + i + ".href", item.href) + "</div>";
      }, "添加导航项") +
      "</div></details>" +

      '<details class="cf-group" open><summary>首屏</summary><div class="cf-group-inner">' +
      text("小标题", "hero.eyebrow", c.hero.eyebrow) +
      text("主标题", "hero.title", c.hero.title) +
      text("高亮词", "hero.highlight", c.hero.highlight) +
      area("副文案", "hero.subtitle", c.hero.subtitle, 3) +
      '<div class="cf-row">' + text("主按钮", "hero.primary.label", c.hero.primary.label) +
      text("主按钮链接", "hero.primary.href", c.hero.primary.href) + "</div>" +
      '<div class="cf-row">' + text("次按钮", "hero.secondary.label", c.hero.secondary.label) +
      text("次按钮链接", "hero.secondary.href", c.hero.secondary.href) + "</div>" +
      '<p class="cf-hint">主按钮链接填 customizer 会直接打开这个面板。</p>' +
      listEditor("hero.stats", c.hero.stats, function (item, i) {
        return '<div class="cf-row">' + text("数值", "hero.stats." + i + ".value", item.value) +
          text("说明", "hero.stats." + i + ".label", item.label) + "</div>";
      }, "添加指标") +
      "</div></details>" +

      '<details class="cf-group"><summary>能力卡片</summary><div class="cf-group-inner">' +
      text("区块标题", "features.title", c.features.title) +
      area("区块说明", "features.subtitle", c.features.subtitle, 2) +
      listEditor("features.items", c.features.items, function (item, i) {
        var opts = SF.iconNames.map(function (name) {
          return { value: name, label: ICON_LABELS[name] || name };
        });
        return select("图标", "features.items." + i + ".icon", item.icon, opts) +
          text("标题", "features.items." + i + ".title", item.title) +
          area("说明", "features.items." + i + ".text", item.text, 2);
      }, "添加卡片") +
      "</div></details>" +

      '<details class="cf-group"><summary>案例</summary><div class="cf-group-inner">' +
      text("区块标题", "showcase.title", c.showcase.title) +
      area("区块说明", "showcase.subtitle", c.showcase.subtitle, 2) +
      listEditor("showcase.items", c.showcase.items, function (item, i) {
        return text("标签", "showcase.items." + i + ".tag", item.tag) +
          text("名称", "showcase.items." + i + ".title", item.title) +
          area("描述", "showcase.items." + i + ".text", item.text, 2);
      }, "添加案例") +
      "</div></details>" +

      '<details class="cf-group"><summary>价格</summary><div class="cf-group-inner">' +
      text("区块标题", "pricing.title", c.pricing.title) +
      area("区块说明", "pricing.subtitle", c.pricing.subtitle, 2) +
      listEditor("pricing.items", c.pricing.items, function (item, i) {
        var base = "pricing.items." + i + ".";
        return '<div class="cf-row">' + text("方案名", base + "name", item.name) +
          text("价格", base + "price", item.price) + "</div>" +
          '<div class="cf-row">' + text("单位", base + "unit", item.unit) +
          text("按钮", base + "cta", item.cta) + "</div>" +
          area("一句话说明", base + "desc", item.desc, 2) +
          lines("包含内容", base + "features", item.features) +
          toggle("标记为推荐", base + "featured", item.featured);
      }, "添加方案") +
      "</div></details>" +

      '<details class="cf-group"><summary>评价</summary><div class="cf-group-inner">' +
      text("区块标题", "testimonials.title", c.testimonials.title) +
      listEditor("testimonials.items", c.testimonials.items, function (item, i) {
        var base = "testimonials.items." + i + ".";
        return area("评价内容", base + "quote", item.quote, 3) +
          '<div class="cf-row">' + text("名字", base + "name", item.name) +
          text("身份", base + "role", item.role) + "</div>";
      }, "添加评价") +
      "</div></details>" +

      '<details class="cf-group"><summary>问答</summary><div class="cf-group-inner">' +
      text("区块标题", "faq.title", c.faq.title) +
      listEditor("faq.items", c.faq.items, function (item, i) {
        var base = "faq.items." + i + ".";
        return text("问题", base + "q", item.q) + area("回答", base + "a", item.a, 3);
      }, "添加问题") +
      "</div></details>" +

      '<details class="cf-group"><summary>结尾行动</summary><div class="cf-group-inner">' +
      text("标题", "cta.title", c.cta.title) +
      area("文案", "cta.text", c.cta.text, 2) +
      text("按钮文字", "cta.buttonLabel", c.cta.buttonLabel) +
      text("按钮链接", "cta.href", c.cta.href || "", "/blog/") +
      '<p class="cf-hint">留空时按钮会打开这个定制面板。</p>' +
      "</div></details>" +

      '<details class="cf-group"><summary>页脚</summary><div class="cf-group-inner">' +
      area("一句话", "footer.note", c.footer.note, 2) +
      text("版权", "footer.copyright", c.footer.copyright) +
      listEditor("footer.links", c.footer.links, function (item, i) {
        return '<div class="cf-row">' + text("文字", "footer.links." + i + ".label", item.label) +
          text("链接", "footer.links." + i + ".href", item.href) + "</div>";
      }, "添加链接") +
      "</div></details>" +
      "</div>";
  }

  function layoutPane(c) {
    var hidden = c.layout.hidden || [];
    var rows = (c.layout.order || []).map(function (id, i, arr) {
      var off = hidden.indexOf(id) !== -1;
      return '<li class="' + (off ? "is-off" : "") + '">' +
        '<label class="cf-check"><input type="checkbox" data-act="section" data-id="' + id + '"' + (off ? "" : " checked") +
        "><span>" + esc(SF.sectionLabels[id] || id) + "</span></label>" +
        '<div class="cf-tools">' +
        '<button type="button" data-act="order" data-id="' + id + '" data-dir="-1"' + (i === 0 ? " disabled" : "") + ">↑</button>" +
        '<button type="button" data-act="order" data-id="' + id + '" data-dir="1"' + (i === arr.length - 1 ? " disabled" : "") + ">↓</button>" +
        "</div></li>";
    }).join("");

    return '<ul class="cf-order">' + rows + "</ul>" +
      '<p class="cf-hint">取消勾选只是不显示，内容仍然保留；上下箭头调整顺序，首屏之外都可以移动。</p>';
  }

  function dataPane(c) {
    return '<div class="cf-actions-grid">' +
      '<button type="button" class="cf-btn" data-act="export">导出 JSON</button>' +
      '<button type="button" class="cf-btn" data-act="copy">复制 JSON</button>' +
      '<button type="button" class="cf-btn" data-act="import">导入文件</button>' +
      '<button type="button" class="cf-btn cf-danger" data-act="reset">恢复默认</button>' +
      "</div>" +
      '<input type="file" id="cf-file" accept="application/json,.json" hidden>' +
      '<label class="cf-field"><span>当前配置<b>可编辑</b></span>' +
      '<textarea id="cf-json" rows="16" spellcheck="false">' + attr(JSON.stringify(c, null, 2)) + "</textarea></label>" +
      '<button type="button" class="cf-btn cf-btn-wide" data-act="apply">应用这段 JSON</button>' +
      '<p class="cf-hint">配置实时存在浏览器 localStorage。导出的 JSON 可以直接替换 assets/js/config.js 里的默认值，这样任何人打开都是你的版本。</p>';
  }

  /* ---------- 构建 ---------- */
  function tabsHTML() {
    return '<nav class="cf-tabs" role="tablist">' + TABS.map(function (t) {
      return '<button type="button" class="cf-tab' + (t.id === lastTab ? " is-on" : "") +
        '" data-act="tab" data-tab="' + t.id + '" role="tab">' + t.label + "</button>";
    }).join("") + "</nav>";
  }

  function build() {
    var c = cfg();
    bodyEl.innerHTML = tabsHTML() +
      '<div class="cf-pane' + (lastTab === "theme" ? " is-on" : "") + '" data-pane="theme">' + themePane(c) + "</div>" +
      '<div class="cf-pane' + (lastTab === "blog" ? " is-on" : "") + '" data-pane="blog">' + blogPane() + "</div>" +
      '<div class="cf-pane' + (lastTab === "content" ? " is-on" : "") + '" data-pane="content">' + contentPane(c) + "</div>" +
      '<div class="cf-pane' + (lastTab === "layout" ? " is-on" : "") + '" data-pane="layout">' + layoutPane(c) + "</div>" +
      '<div class="cf-pane' + (lastTab === "data" ? " is-on" : "") + '" data-pane="data">' + dataPane(c) + "</div>";
    built = true;
  }

  function rebuild() {
    var openGroups = [];
    Array.prototype.forEach.call(bodyEl.querySelectorAll("details.cf-group"), function (d, i) {
      if (d.open) openGroups.push(i);
    });
    var scroll = bodyEl.scrollTop;
    build();
    Array.prototype.forEach.call(bodyEl.querySelectorAll("details.cf-group"), function (d, i) {
      d.open = openGroups.indexOf(i) !== -1;
    });
    bodyEl.scrollTop = scroll;
  }

  function activate(tab) {
    lastTab = tab;
    Array.prototype.forEach.call(bodyEl.querySelectorAll(".cf-tab"), function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-tab") === tab);
    });
    Array.prototype.forEach.call(bodyEl.querySelectorAll(".cf-pane"), function (pane) {
      pane.classList.toggle("is-on", pane.getAttribute("data-pane") === tab);
    });
  }

  /* ---------- 同步与提交 ---------- */
  function syncInputs(path, value) {
    if (value == null || typeof value === "object") return;
    Array.prototype.forEach.call(bodyEl.querySelectorAll('[data-path="' + path + '"]'), function (el) {
      if (el === document.activeElement) return;
      if (el.type === "range") {
        el.value = value;
        var out = bodyEl.querySelector('[data-out="' + path + '"]');
        if (out) out.textContent = value;
      } else if (el.type === "color" || el.type === "text") {
        el.value = value;
      }
    });
  }

  function syncSwatches() {
    var current = String(cfg().theme.accent).toLowerCase();
    Array.prototype.forEach.call(bodyEl.querySelectorAll(".swatch"), function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-value").toLowerCase() === current);
    });
  }

  function syncSegs(path) {
    var value = String(getPath(cfg(), path));
    Array.prototype.forEach.call(bodyEl.querySelectorAll('[data-act="set"][data-path="' + path + '"]'), function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-value") === value);
    });
  }

  function commit() {
    SF.app.commit();
  }

  function applyField(el) {
    var path = el.getAttribute("data-path");
    if (!path) return;
    var value;
    if (el.getAttribute("data-type") === "lines") {
      value = el.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    } else if (el.getAttribute("data-type") === "number") {
      value = Number(el.value);
    } else if (el.type === "checkbox") {
      value = el.checked;
    } else {
      value = el.value;
    }
    setPath(cfg(), path, value);
    syncInputs(path, value);
    if (path === "theme.accent") syncSwatches();
    commit();
  }

  /* ---------- 事件 ---------- */
  function onInput(e) {
    var el = e.target;
    if (el.type === "checkbox" || el.tagName === "SELECT") return;
    if (!el.getAttribute("data-path")) return;
    applyField(el);
  }

  function onChange(e) {
    var el = e.target;
    if (el.id === "cf-file") {
      importFile(el.files && el.files[0]);
      return;
    }
    if (el.type === "checkbox" && el.getAttribute("data-path")) {
      applyField(el);
      return;
    }
    if (el.tagName === "SELECT" && el.getAttribute("data-path")) {
      applyField(el);
      return;
    }
    if (el.getAttribute("data-act") === "section") {
      var id = el.getAttribute("data-id");
      var hidden = cfg().layout.hidden;
      var index = hidden.indexOf(id);
      if (el.checked && index !== -1) hidden.splice(index, 1);
      if (!el.checked && index === -1) hidden.push(id);
      el.closest("li").classList.toggle("is-off", !el.checked);
      commit();
    }
  }

  function onClick(e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var act = btn.getAttribute("data-act");

    if (act === "tab") { activate(btn.getAttribute("data-tab")); return; }

    if (act === "blog-scale") {
      var scaleValue = Number(btn.getAttribute("data-value"));
      if (SF.prefs) SF.prefs.set({ blogScale: scaleValue });
      Array.prototype.forEach.call(btn.parentElement.querySelectorAll("button"), function (b) {
        b.classList.toggle("is-on", b === btn);
      });
      SF.toast("已保存，博客正文会跟着变");
      return;
    }

    if (act === "set") {
      var path = btn.getAttribute("data-path");
      var value = btn.getAttribute("data-value");
      setPath(cfg(), path, value);
      syncSegs(path);
      if (path === "theme.accent") syncSwatches();
      commit();
      return;
    }

    if (act === "move" || act === "remove" || act === "add") {
      var listPath = btn.getAttribute("data-list");
      var arr = getPath(cfg(), listPath);
      if (!Array.isArray(arr)) return;
      if (act === "add") {
        var factory = ADDERS[listPath];
        if (factory) arr.push(factory());
      } else {
        var i = Number(btn.getAttribute("data-index"));
        if (act === "remove") {
          if (arr.length <= 1) { SF.toast("至少保留一项"); return; }
          arr.splice(i, 1);
        } else {
          var dir = Number(btn.getAttribute("data-dir"));
          var j = i + dir;
          if (j < 0 || j >= arr.length) return;
          var tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
        }
      }
      commit();
      rebuild();
      return;
    }

    if (act === "order") {
      var orderId = btn.getAttribute("data-id");
      var dir2 = Number(btn.getAttribute("data-dir"));
      var order = cfg().layout.order;
      var from = order.indexOf(orderId);
      var to = from + dir2;
      if (from === -1 || to < 0 || to >= order.length) return;
      order.splice(to, 0, order.splice(from, 1)[0]);
      commit();
      rebuild();
      return;
    }

    if (act === "export") {
      var data = JSON.stringify(cfg(), null, 2);
      var blob = new Blob([data], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "lumen-site-config.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      SF.toast("已导出配置 JSON");
      return;
    }

    if (act === "copy") {
      var text = JSON.stringify(cfg(), null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          SF.toast("配置已复制");
        }, function () {
          SF.toast("复制失败，请手动全选");
        });
      } else {
        var ta = bodyEl.querySelector("#cf-json");
        if (ta) { ta.focus(); ta.select(); }
        SF.toast("已选中配置，按 Ctrl+C 复制");
      }
      return;
    }

    if (act === "import") {
      var input = bodyEl.querySelector("#cf-file");
      if (input) input.click();
      return;
    }

    if (act === "reset") {
      SF.app.reset();
      rebuild();
      SF.toast("已恢复默认配置");
      return;
    }

    if (act === "apply") {
      var raw = bodyEl.querySelector("#cf-json");
      if (!raw) return;
      try {
        var parsed = JSON.parse(raw.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("不是对象");
        SF.app.replace(parsed);
        rebuild();
        SF.toast("配置已应用");
      } catch (err) {
        SF.toast("JSON 解析失败，检查一下格式");
      }
      return;
    }
  }

  function importFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("不是对象");
        SF.app.replace(parsed);
        rebuild();
        SF.toast("已导入配置");
      } catch (err) {
        SF.toast("这个文件不是有效的配置 JSON");
      }
    };
    reader.readAsText(file);
  }

  /* ---------- 打开 / 关闭 ---------- */
  function open(tab) {
    if (!built) build();
    if (tab) activate(tab);
    document.body.classList.add("is-panel-open");
    panelEl.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
    backdropEl.hidden = false;
    var firstTab = bodyEl.querySelector(".cf-tab");
    if (firstTab) firstTab.focus({ preventScroll: true });
  }

  function close() {
    document.body.classList.remove("is-panel-open");
    panelEl.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    backdropEl.hidden = true;
    openBtn.focus({ preventScroll: true });
  }

  function togglePanel() {
    if (document.body.classList.contains("is-panel-open")) close();
    else open();
  }

  function init() {
    panelEl = document.getElementById("customizer");
    bodyEl = document.getElementById("cf-body");
    backdropEl = document.getElementById("cf-backdrop");
    openBtn = document.getElementById("cf-open");

    bodyEl.addEventListener("input", onInput);
    bodyEl.addEventListener("change", onChange);
    bodyEl.addEventListener("click", onClick);

    openBtn.addEventListener("click", open);
    document.getElementById("cf-close").addEventListener("click", close);
    backdropEl.addEventListener("click", close);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("is-panel-open")) close();
    });

    build();
  }

  /* toast 挂在对外 API 上，方便别处调用 */
  SF.toast = function (message) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-on");
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove("is-on"); }, 2200);
  };

  SF.customizer = {
    init: init,
    open: open,
    close: close,
    toggle: togglePanel
  };
})();
