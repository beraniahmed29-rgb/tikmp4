/* TikMP4 Premium engine (English): staged loading, video/photo/audio results */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var urlInput = $("tiktokUrl");
  var downloadBtn = $("downloadBtn");
  var pasteBtn = $("pasteBtn");
  var clearBtn = $("clearBtn");
  var statusBox = $("status");
  var loader = $("loader");
  var loadStep = $("loadStep");
  var loadBar = $("loadBar");
  var resultBox = $("result");
  var photoBox = $("photoResult");
  var previewVideo = $("previewVideo");
  var previewCover = $("previewCover");
  var videoTitle = $("videoTitle");
  var videoAuthor = $("videoAuthor");
  var videoMeta = $("videoMeta");
  var btnNoWatermark = $("btnNoWatermark");
  var btnWatermark = $("btnWatermark");
  var btnMusic = $("btnMusic");
  var btnForceDl = $("btnForceDl");
  var newBtn = $("newBtn");
  var audioSection = $("audioSection");
  var audioPlayer = $("audioPlayer");
  var photoTitle = $("photoTitle");
  var photoAuthor = $("photoAuthor");
  var photoGrid = $("photoGrid");
  var btnDlAll = $("btnDlAll");
  var newBtnPhoto = $("newBtnPhoto");
  var menuBtn = $("menuBtn");
  var mobileMenu = $("mobileMenu");
  var toasts = $("toasts");

  var currentFiles = { hd: "", wm: "", music: "", title: "tiktok-video", images: [] };
  var stepTimer = null;

  var STEPS = ["Analyzing video...", "Fetching media...", "Preparing download..."];
  var ERR_INVALID = "Please enter a valid TikTok URL.";
  var ERR_EMPTY = "Please paste a TikTok video link first.";
  var ERR_GENERIC = "Unable to process this video right now. Please try again.";
  var ERR_PRIVATE = "This video is private or unavailable.";

  /* ---------- toast ---------- */
  function toast(msg) {
    if (!toasts) return;
    var el = document.createElement("div");
    el.className = "pm-toast pm-in";
    el.textContent = msg;
    toasts.appendChild(el);
    setTimeout(function () {
      el.classList.add("pm-out");
      setTimeout(function () { el.remove(); }, 300);
    }, 2600);
  }

  /* ---------- status ---------- */
  function showStatus(type, msg) {
    if (!statusBox) return;
    statusBox.hidden = false;
    statusBox.className = "status " + type;
    statusBox.textContent = msg;
  }
  function hideStatus() {
    if (!statusBox) return;
    statusBox.hidden = true;
    statusBox.textContent = "";
  }

  /* ---------- helpers ---------- */
  function isValidTikTokUrl(u) {
    if (!u) return false;
    u = u.trim();
    return /(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|tiktokv\.com)/i.test(u);
  }
  function cleanUrl(u) {
    return String(u || "").trim().split("?")[0].split(" ")[0];
  }
  function safeHttp(u) {
    return typeof u === "string" && /^https?:\/\//i.test(u) ? u : "";
  }
  function formatNum(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }
  function formatSize(bytes) {
    bytes = Number(bytes) || 0;
    if (!bytes) return "";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
    return Math.max(1, Math.round(bytes / 1024)) + " KB";
  }
  function sanitizeName(s) {
    return String(s || "tiktok-video").replace(/[\\/:*?"<>|]/g, "").slice(0, 60) || "tiktok-video";
  }

  /* ---------- mobile menu ---------- */
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var open = mobileMenu.hidden;
      mobileMenu.hidden = !open;
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.textContent = open ? "✕" : "☰";
    });
    mobileMenu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        mobileMenu.hidden = true;
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.textContent = "☰";
      }
    });
  }

  /* ---------- paste / clear ---------- */
  pasteBtn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (t) {
        if (t && t.trim()) {
          urlInput.value = t.trim();
          urlInput.focus();
          toast("Link pasted!");
        } else {
          toast("Clipboard is empty.");
        }
      }).catch(function (err) {
        console.error("paste failed:", err);
        showStatus("error", "Clipboard blocked. Paste manually (Ctrl+V).");
      });
    } else {
      urlInput.focus();
      showStatus("error", "Auto-paste not supported. Paste manually: Ctrl+V");
    }
  });

  clearBtn.addEventListener("click", function () {
    urlInput.value = "";
    hideResult();
    hideStatus();
    urlInput.focus();
  });

  function resetNew() {
    urlInput.value = "";
    hideResult();
    hideStatus();
    urlInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  newBtn.addEventListener("click", resetNew);
  newBtnPhoto.addEventListener("click", resetNew);

  urlInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") downloadBtn.click();
  });

  /* ---------- main action ---------- */
  downloadBtn.addEventListener("click", function () {
    try {
      if (typeof ADSTERRA_CONFIG !== "undefined" && ADSTERRA_CONFIG.directLinkSmartlink && !sessionStorage.getItem("dl_ad_shown")) {
        sessionStorage.setItem("dl_ad_shown", "1");
        window.open(ADSTERRA_CONFIG.directLinkSmartlink, "_blank", "noopener");
      }
    } catch (e) {}
    var url = cleanUrl(urlInput.value);
    if (!url) { showStatus("error", ERR_EMPTY); urlInput.focus(); return; }
    if (!isValidTikTokUrl(url)) { showStatus("error", ERR_INVALID); urlInput.focus(); return; }
    fetchVideo(url);
  });

  /* ---------- loading UI ---------- */
  function startLoading() {
    hideResult();
    hideStatus();
    loader.hidden = false;
    var i = 0;
    loadStep.textContent = STEPS[0];
    loadBar.style.width = "12%";
    clearInterval(stepTimer);
    stepTimer = setInterval(function () {
      i = Math.min(i + 1, STEPS.length - 1);
      loadStep.textContent = STEPS[i];
      loadBar.style.width = (12 + (i + 1) * 26) + "%";
    }, 800);
    downloadBtn.disabled = true;
  }
  function stopLoading() {
    clearInterval(stepTimer);
    loader.hidden = true;
    loadBar.style.width = "0%";
    downloadBtn.disabled = false;
  }
  function hideResult() {
    resultBox.hidden = true;
    photoBox.hidden = true;
    previewVideo.removeAttribute("src");
    previewVideo.load();
    previewVideo.hidden = true;
    previewCover.hidden = true;
  }

  function fetchVideo(tiktokUrl) {
    startLoading();
    var api = "https://www.tikwm.com/api/?url=" + encodeURIComponent(tiktokUrl);
    var settled = false;

    fetch(api, { method: "GET" })
      .then(function (res) {
        if (!res.ok) throw { http: res.status };
        return res.json();
      })
      .then(function (json) {
        settled = true;
        if (!json || json.code !== 0 || !json.data) {
          var msg = json && json.msg ? String(json.msg).toLowerCase() : "";
          if (/private|deleted|unavailable|not found|permission/.test(msg)) {
            showStatus("error", ERR_PRIVATE);
          } else {
            showStatus("error", ERR_GENERIC);
          }
          console.error("api error:", json);
          return;
        }
        renderData(json.data);
      })
      .catch(function (err) {
        if (settled) return;
        console.error("fetch failed:", err);
        if (err && err.http === 429) {
          showStatus("error", "Too many requests. Please wait a minute and try again.");
        } else {
          showStatus("error", ERR_GENERIC);
        }
      })
      .finally(function () {
        stopLoading();
      });
  }

  /* ---------- render ---------- */
  function renderData(d) {
    var images = Array.isArray(d.images) ? d.images.filter(safeHttp) : [];
    if (images.length) {
      renderPhotos(d, images);
    } else {
      renderVideo(d);
    }
    try {
      if (window.TikMP4History) {
        TikMP4History.push({
          cover: d.cover || images[0] || "",
          title: (d.title || "TikTok post").slice(0, 90),
          author: (d.author && (d.author.nickname || d.author.unique_id)) || "",
          hd: safeHttp(d.hdplay || d.play) || images[0] || ""
        });
      }
    } catch (e) {}
  }

  function metaChips(items) {
    videoMeta.innerHTML = "";
    items.forEach(function (it) {
      if (!it[1]) return;
      var s = document.createElement("span");
      s.className = "pm-chip";
      var b = document.createElement("b");
      b.textContent = it[0];
      s.appendChild(b);
      s.appendChild(document.createTextNode(it[1]));
      videoMeta.appendChild(s);
    });
  }

  function probeSize(url, done) {
    try {
      fetch(url, { method: "HEAD" }).then(function (r) {
        var len = r.headers.get("content-length");
        done(formatSize(len));
      }).catch(function () { done(""); });
    } catch (e) { done(""); }
  }

  function renderVideo(d) {
    var hd = safeHttp(d.hdplay || d.play);
    var wm = safeHttp(d.wmplay || d.play);
    var music = safeHttp(d.music || (d.music_info && d.music_info.play));
    var cover = safeHttp(d.cover);
    var title = d.title || "TikTok video";
    var authorName = (d.author && (d.author.nickname || d.author.unique_id)) || "TikTok User";
    var authorId = (d.author && d.author.unique_id) || "";

    currentFiles = {
      hd: hd, wm: wm, music: music,
      title: (authorId ? authorId + "-" : "") + (d.id || "tiktok"),
      images: []
    };

    if (!hd && !wm) {
      showStatus("error", ERR_GENERIC);
      return;
    }

    if (hd) {
      previewVideo.src = hd;
      if (cover) previewVideo.poster = cover;
      previewVideo.hidden = false;
      previewVideo.muted = true;
      previewCover.hidden = true;
    } else if (cover) {
      previewVideo.hidden = true;
      previewCover.src = cover;
      previewCover.hidden = false;
    }

    videoTitle.textContent = title.length > 140 ? title.slice(0, 140) + "..." : title;
    videoAuthor.textContent = authorName + (authorId ? " (@" + authorId + ")" : "");

    var chips = [
      ["Duration", d.duration ? d.duration + "s" : ""],
      ["Quality", d.hdplay ? "HD" : "Standard"],
      ["Format", "MP4"],
      ["Size", "…"],
      ["Views", d.play_count ? formatNum(d.play_count) : ""]
    ];
    metaChips(chips);

    btnNoWatermark.href = hd || "#";
    btnNoWatermark.style.display = hd ? "" : "none";
    btnWatermark.href = wm || "#";
    btnWatermark.style.display = wm ? "" : "none";

    if (music) {
      audioSection.hidden = false;
      audioPlayer.src = music;
      btnMusic.href = music;
      btnMusic.style.display = "";
    } else {
      audioSection.hidden = true;
    }

    photoBox.hidden = true;
    resultBox.hidden = false;
    toast("Video ready!");
    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });

    if (hd) {
      probeSize(hd, function (size) {
        if (!size || resultBox.hidden) return;
        var chips2 = [
          ["Duration", d.duration ? d.duration + "s" : ""],
          ["Quality", d.hdplay ? "HD" : "Standard"],
          ["Format", "MP4"],
          ["Size", size],
          ["Views", d.play_count ? formatNum(d.play_count) : ""]
        ];
        metaChips(chips2);
      });
    }
  }

  function renderPhotos(d, images) {
    var title = d.title || "Photo Slideshow";
    var authorName = (d.author && (d.author.nickname || d.author.unique_id)) || "TikTok User";
    var authorId = (d.author && d.author.unique_id) || "";
    currentFiles.images = images;

    photoTitle.textContent = "Photo Slideshow (" + images.length + " photos)";
    photoAuthor.textContent = (title.length > 120 ? title.slice(0, 120) + "..." : title) +
      " — " + authorName + (authorId ? " (@" + authorId + ")" : "");

    photoGrid.innerHTML = "";
    images.forEach(function (src, i) {
      var card = document.createElement("div");
      card.className = "pm-photo pm-in";
      var img = document.createElement("img");
      img.src = src;
      img.alt = "Slide " + (i + 1);
      img.loading = "lazy";
      var a = document.createElement("a");
      a.href = src;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "btn btn-secondary";
      a.textContent = "Download Image";
      card.appendChild(img);
      card.appendChild(a);
      photoGrid.appendChild(card);
    });

    resultBox.hidden = true;
    photoBox.hidden = false;
    toast("Slideshow ready!");
    photoBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btnDlAll.addEventListener("click", function () {
    var list = currentFiles.images || [];
    if (!list.length) return;
    toast("Opening " + list.length + " images...");
    list.forEach(function (src, i) {
      setTimeout(function () { window.open(src, "_blank", "noopener"); }, i * 700);
    });
  });

  btnForceDl.addEventListener("click", function () {
    var fileUrl = currentFiles.hd || currentFiles.wm;
    if (!fileUrl) return;
    btnForceDl.disabled = true;
    fetch(fileUrl)
      .then(function (r) {
        if (!r.ok) throw new Error("dl");
        return r.blob();
      })
      .then(function (blob) {
        var a = document.createElement("a");
        var objUrl = URL.createObjectURL(new Blob([blob], { type: "video/mp4" }));
        a.href = objUrl;
        a.download = sanitizeName(currentFiles.title) + ".mp4";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(objUrl); a.remove(); }, 4000);
        btnForceDl.disabled = false;
        toast("Download started!");
      })
      .catch(function (err) {
        console.error("direct download failed:", err);
        window.open(fileUrl, "_blank", "noopener");
        btnForceDl.disabled = false;
      });
  });
})();
