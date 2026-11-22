/* WSZLA · Service Worker：离线可用 + 快速打开 */
const VERSION = "wszla-v2";
const PRECACHE = [
  "/",
  "/site/",
  "/blog/",
  "/tools/",
  "/about/",
  "/assets/css/style.css",
  "/assets/css/blog.css",
  "/assets/js/main.js",
  "/assets/js/config.js",
  "/assets/js/theme.js",
  "/assets/js/render.js",
  "/assets/js/customizer.js",
  "/assets/js/pwa.js",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/favicon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }
  if (url.origin !== self.location.origin) return;

  /* 页面导航：先网络，失败回落缓存，再回落首页 */
  /* 后台页永远走网络，避免缓存旧版本 */
  if (url.pathname.startsWith("/admin/")) {
    event.respondWith(fetch(req));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match("/").then((home) => home || Response.error()))
        )
    );
    return;
  }

  /* 静态资源：先缓存 */
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
