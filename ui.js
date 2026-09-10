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
      tBtn.textContent = root.getAttribute("data-theme") === "light" ? "🌙" : "☀️";
      tBtn.title = root.getAttribute("data-theme") === "light" ? "Dark mode" : "Light mode";
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
  } catch (e) {}
})();
