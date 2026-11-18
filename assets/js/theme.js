/* =========================================================
   Lumen · 设计令牌
   浏览器和构建脚本共用：把一份配置翻译成 CSS 变量。
   构建时用它把品牌色内联进 HTML，首屏不会闪默认色。
   ========================================================= */
(function () {
  var SF = (window.SiteForge = window.SiteForge || {});

  function hexToRgb(hex) {
    var value = String(hex || "").trim().replace("#", "");
    if (value.length === 3) {
      value = value.split("").map(function (ch) { return ch + ch; }).join("");
    }
    if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16)
    ];
  }

  function rgbToHsl(rgb) {
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0;
    var l = (max + min) / 2;
    var d = max - min;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [h * 360, s * 100, l * 100];
  }

  function hslToHex(h, s, l) {
    h = (((h % 360) + 360) % 360) / 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    function hue(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    var r = Math.round(hue(p, q, h + 1 / 3) * 255);
    var g = Math.round(hue(p, q, h) * 255);
    var b = Math.round(hue(p, q, h - 1 / 3) * 255);
    return "#" + [r, g, b].map(function (v) {
      return v.toString(16).padStart(2, "0");
    }).join("");
  }

  function luminance(rgb) {
    var ch = rgb.map(function (v) {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }

  SF.resolveMode = function (mode, prefersDark) {
    if (mode === "auto") return prefersDark ? "dark" : "light";
    return mode === "dark" ? "dark" : "light";
  };

  /* 返回 { mode, bg, css: {变量名: 值}, font } */
  SF.tokens = function (cfg, mode) {
    var t = cfg.theme;
    var rgb = hexToRgb(t.accent) || [255, 90, 54];
    var hsl = rgbToHsl(rgb);
    var ink = luminance(rgb) > 0.52 ? "#14130f" : "#ffffff";

    return {
      mode: mode,
      bg: t.bg || "mesh",
      font: t.font,
      css: {
        "--accent": t.accent,
        "--accent-ink": ink,
        "--accent-soft": "rgba(" + rgb.join(",") + ",0.13)",
        "--accent-line": "rgba(" + rgb.join(",") + ",0.38)",
        "--accent-2": hslToHex(hsl[0] + 26, Math.min(94, hsl[1] + 8), Math.min(66, hsl[2] + 6)),
        "--accent-3": hslToHex(hsl[0] - 42, Math.min(90, hsl[1]), Math.max(38, hsl[2] - 6)),
        "--r": (Number(t.radius) || 0) + "px",
        "--page-max": (Number(t.max) || 1180) + "px",
        "--font-display":
          t.font === "serif" ? "var(--font-serif)" : t.font === "mono" ? "var(--font-mono)" : "var(--font-sans)"
      }
    };
  };
})();
