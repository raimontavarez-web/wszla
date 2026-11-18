/* 在 GitHub Actions 里运行：按 links/data.json 重写 links/index.html 的列表部分 */
import fs from "node:fs";

const DATA = "links/data.json";
const PAGE = "links/index.html";

function host(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return url; }
}
function hue(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function card(item, index) {
  const h = host(item.url);
  const key = `${item.name} ${item.desc || ""} ${h}`.toLowerCase();
  const initial = String(item.name).trim().slice(0, 1).toUpperCase();
  return `<a class="link-card" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" style="--h:${hue(item.name)};--i:${index}" data-key="${esc(key)}">
  <span class="link-avatar" aria-hidden="true">${esc(initial)}</span>
  <span class="link-body">
    <span class="link-name">${esc(item.name)}</span>
    <span class="link-desc">${esc(item.desc || "")}</span>
    <span class="link-host">${esc(h)}</span>
  </span>
</a>`;
}

const data = JSON.parse(fs.readFileSync(DATA, "utf8"));
const cats = data.categories || [];
const pinned = [];
cats.forEach((c) => (c.items || []).forEach((it) => { if (it.pin) pinned.push(it); }));

const pinBlock = pinned.length
  ? `<section class="links-group links-pin" data-cat="pin">
  <h2>常用 <em>${pinned.length}</em></h2>
  <div class="links-grid">${pinned.map(card).join("\n")}</div>
</section>`
  : "";

const groups = cats
  .map((c) => {
    const items = (c.items || []).filter((it) => !it.pin);
    return `<section class="links-group" data-cat="${esc(c.name)}">
  <h2>${esc(c.name)} <em>${items.length}</em></h2>
  <div class="links-grid">${items.map(card).join("\n")}</div>
</section>`;
  })
  .join("\n");

let html = fs.readFileSync(PAGE, "utf8");
const start = html.indexOf("<!--LINKS_START-->");
const end = html.indexOf("<!--LINKS_END-->");
if (start === -1 || end === -1) {
  console.log("markers not found, abort");
  process.exit(1);
}
html = html.slice(0, start + "<!--LINKS_START-->".length) + "\n" + pinBlock + "\n" + groups + "\n" + html.slice(end);

html = html.replace(
  /(<script type="application\/json" id="links-data">)[\s\S]*?(<\/script>)/,
  (m, a, b) => a + JSON.stringify(data).replace(/</g, "\\u003c") + b
);

html = html.replace(
  /<p>([^<]*)共 \d+ 个站点，\d+ 个分类。<\/p>/,
  (m) => {
    const total = cats.reduce((n, c) => n + (c.items || []).length, 0);
    return `<p>${esc(data.subtitle || "")} 共 ${total} 个站点，${cats.length} 个分类。</p>`;
  }
);

fs.writeFileSync(PAGE, html, "utf8");
console.log("links/index.html rebuilt from links/data.json");
