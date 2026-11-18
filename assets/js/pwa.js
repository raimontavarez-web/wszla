/* =========================================================
   WSZLA · PWA
   注册 Service Worker；在安卓 Chrome 上弹出「安装到桌面」提示。
   ========================================================= */
(function () {
  var isSecure =
    location.protocol === "https:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

  if ("serviceWorker" in navigator && isSecure) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {
        /* 注册失败不影响正常浏览 */
      });
    });
  }

  var deferred = null;
  var bar = null;

  function buildBar() {
    if (bar) return bar;
    bar = document.createElement("div");
    bar.className = "install-bar";
    bar.hidden = true;
    bar.innerHTML =
      '<span>装到桌面，像 App 一样打开</span>' +
      '<button type="button" class="install-btn" data-install>安装</button>' +
      '<button type="button" class="install-close" data-dismiss aria-label="关闭">✕</button>';
    document.body.appendChild(bar);

    bar.addEventListener("click", function (e) {
      if (e.target.closest("[data-dismiss]")) {
        bar.hidden = true;
        try {
          localStorage.setItem("wszla.install.dismissed", "1");
        } catch (err) {}
        return;
      }
      if (e.target.closest("[data-install]") && deferred) {
        deferred.prompt();
        deferred.userChoice.then(function () {
          deferred = null;
          bar.hidden = true;
        });
      }
    });
    return bar;
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    try {
      if (localStorage.getItem("wszla.install.dismissed") === "1") return;
    } catch (err) {}
    buildBar().hidden = false;
  });

  window.addEventListener("appinstalled", function () {
    if (bar) bar.hidden = true;
    deferred = null;
  });
})();
