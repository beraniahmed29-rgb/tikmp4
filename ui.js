/* TikMP4 shared UI: theme toggle + back-to-top */
(function () {
  "use strict";
  try {
    // Theme (default dark)
    var root = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem("tikmp4_theme"); } catch (e) {}
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
    var tBtn = document.getElementById("themeToggle");
    function paintBtn() {
      if (!tBtn) return;
      var light = root.getAttribute("data-theme") === "light";
      tBtn.innerHTML = '<svg class="ic" aria-hidden="true"><use href="icons.svg?v=1#' + (light ? "i-moon" : "i-sun") + '"></use></svg>';
      tBtn.title = light ? "Dark mode" : "Light mode";
    }
    paintBtn();
    if (tBtn) tBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("tikmp4_theme", next); } catch (e) {}
      paintBtn();
    });

    // Back to top
    var toTop = document.getElementById("toTop");
    if (toTop) {
      window.addEventListener("scroll", function () {
        toTop.style.display = window.scrollY > 600 ? "flex" : "none";
      }, { passive: true });
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Copy download link button (reads the HD link already resolved on page)
    var copyBtn = document.getElementById("copyLinkBtn");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var a = document.getElementById("btnNoWatermark");
      var link = a && a.href && a.href !== "#" ? a.href : "";
      var box = document.getElementById("status");
      function note(type, msg) {
        if (!box) return;
        box.hidden = false;
        box.className = "status " + type;
        box.textContent = msg;
      }
      if (!link) { note("error", document.documentElement.lang === "en" ? "No link yet." : "لا يوجد رابط بعد."); return; }
      function done() { note("success", document.documentElement.lang === "en" ? "Link copied!" : "تم نسخ الرابط!"); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(done, function () { note("error", link); });
      } else {
        var ta = document.createElement("textarea");
        ta.value = link;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { note("error", link); }
        ta.remove();
      }
    });

    // First click anywhere opens the direct ad link once per session (click-anywhere ad)
    document.addEventListener("click", function () {
      try {
        if (typeof ADSTERRA_CONFIG !== "undefined" && ADSTERRA_CONFIG.directLinkSmartlink && !sessionStorage.getItem("dl_ad_shown")) {
          sessionStorage.setItem("dl_ad_shown", "1");
          window.open(ADSTERRA_CONFIG.directLinkSmartlink, "_blank", "noopener");
        }
      } catch (e) {}
    }, { capture: true });
  } catch (e) {}
})();
