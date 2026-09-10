/* TikMP4 download history (shared AR/EN, stored locally on visitor device) */
(function () {
  "use strict";
  var KEY = "tikmp4_history_v1";
  var MAX = 6;

  function isEn() { return document.documentElement.lang === "en"; }
  function T(k) {
    var en = {
      itemDl: "MP4", clear: "Clear history", empty: "",
      alt: "cover"
    };
    var ar = {
      itemDl: "تحميل", clear: "مسح السجل", empty: "",
      alt: "غلاف"
    };
    var d = isEn() ? en : ar;
    return d[k];
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function render() {
    var sec = document.getElementById("historySection");
    var list = document.getElementById("historyList");
    var clearBtn = document.getElementById("historyClear");
    if (!sec || !list) return;
    var items = load();
    if (!items.length) { sec.hidden = true; return; }
    sec.hidden = false;
    if (clearBtn) clearBtn.textContent = T("clear");
    list.innerHTML = items.map(function (it) {
      var img = it.cover ? '<img src="' + esc(it.cover) + '" alt="' + esc(T("alt")) + '" loading="lazy">' : '<div class="no-cover">🎬</div>';
      return '<div class="history-item">' + img +
        '<div class="history-txt"><strong>' + esc(it.title) + '</strong><span>' + esc(it.author || "") + '</span></div>' +
        '<a class="btn btn-primary" href="' + esc(it.hd) + '" target="_blank" rel="noopener">' + esc(T("itemDl")) + '</a></div>';
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    var clearBtn = document.getElementById("historyClear");
    if (clearBtn) clearBtn.addEventListener("click", function () {
      save([]);
      render();
    });
  });

  window.TikMP4History = {
    push: function (item) {
      if (!item || !item.hd) return;
      var items = load().filter(function (x) { return x.hd !== item.hd; });
      items.unshift(item);
      save(items.slice(0, MAX));
      render();
    }
  };
})();
