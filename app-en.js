/* TikMP4 - TikTok MP4 Downloader (English version) */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var urlInput = $("tiktokUrl");
  var downloadBtn = $("downloadBtn");
  var pasteBtn = $("pasteBtn");
  var clearBtn = $("clearBtn");
  var statusBox = $("status");
  var resultBox = $("result");
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

  var currentFiles = { hd: "", wm: "", music: "", title: "tiktok-video" };

  function showStatus(type, msg) {
    statusBox.hidden = false;
    statusBox.className = "status " + type;
    statusBox.textContent = msg;
  }
  function hideStatus() {
    statusBox.hidden = true;
    statusBox.textContent = "";
  }
  function isValidTikTokUrl(u) {
    if (!u) return false;
    u = u.trim();
    return /(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|tiktokv\.com)/i.test(u);
  }
  function cleanUrl(u) {
    return u.trim().split("?")[0].split(" ")[0];
  }

  pasteBtn.addEventListener("click", function () {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (t) {
        if (t) { urlInput.value = t.trim(); urlInput.focus(); }
      }).catch(function () {
        showStatus("error", "Clipboard blocked. Paste manually (Ctrl+V).");
      });
    } else {
      urlInput.focus();
      showStatus("error", "Auto-paste not supported. Paste manually: Ctrl+V");
    }
  });

  clearBtn.addEventListener("click", function () {
    urlInput.value = "";
    resultBox.hidden = true;
    hideStatus();
    urlInput.focus();
  });

  newBtn.addEventListener("click", function () {
    resultBox.hidden = true;
    urlInput.value = "";
    hideStatus();
    urlInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  urlInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { downloadBtn.click(); }
  });

  downloadBtn.addEventListener("click", function () {
    try {
      if (typeof ADSTERRA_CONFIG !== "undefined" && ADSTERRA_CONFIG.directLinkSmartlink && !sessionStorage.getItem("dl_ad_shown")) {
        sessionStorage.setItem("dl_ad_shown", "1");
        window.open(ADSTERRA_CONFIG.directLinkSmartlink, "_blank", "noopener");
      }
    } catch (e) {}
    var raw = urlInput.value || "";
    var url = cleanUrl(raw);
    if (!url) { showStatus("error", "Please paste a TikTok video link first."); urlInput.focus(); return; }
    if (!isValidTikTokUrl(url)) { showStatus("error", "This does not look like a valid TikTok link."); return; }
    fetchVideo(url);
  });

  function fetchVideo(tiktokUrl) {
    downloadBtn.disabled = true;
    downloadBtn.textContent = "Fetching video...";
    resultBox.hidden = true;
    showStatus("loading", "Contacting download server, please wait...");
    previewVideo.removeAttribute("src");
    previewVideo.load();

    var api = "https://www.tikwm.com/api/?url=" + encodeURIComponent(tiktokUrl);

    fetch(api, { method: "GET" })
      .then(function (res) {
        if (!res.ok) throw new Error("http_" + res.status);
        return res.json();
      })
      .then(function (json) {
        if (!json || json.code !== 0 || !json.data) {
          throw new Error(json && json.msg ? json.msg : "api_error");
        }
        renderResult(json.data);
      })
      .catch(function (err) {
        console.error(err);
        showStatus("error", "Could not fetch the video. Make sure the link is correct and the video is public.");
      })
      .finally(function () {
        downloadBtn.disabled = false;
        downloadBtn.textContent = "Download MP4";
      });
  }

  function renderResult(d) {
    var hd = d.hdplay || d.play || "";
    var wm = d.wmplay || d.play || "";
    var music = d.music || d.music_info && d.music_info.play || "";
    var cover = d.cover || "";
    var title = d.title || "TikTok video";
    var authorName = (d.author && (d.author.nickname || d.author.unique_id)) || "TikTok User";
    var authorId = (d.author && d.author.unique_id) || "";
    var duration = d.duration ? d.duration + "s" : "";

    currentFiles.hd = hd;
    currentFiles.wm = wm;
    currentFiles.music = music;
    currentFiles.title = (authorId ? authorId + "-" : "") + (d.id || "tiktok") ;

    if (hd) {
      previewVideo.src = hd;
      previewVideo.poster = cover || "";
      previewVideo.hidden = false;
      previewCover.hidden = true;
    } else if (cover) {
      previewVideo.hidden = true;
      previewCover.src = cover;
      previewCover.hidden = false;
    }

    videoTitle.textContent = title.length > 140 ? title.slice(0, 140) + "..." : title;
    videoAuthor.textContent = authorName + (authorId ? " (@" + authorId + ")" : "");
    videoMeta.textContent = [
      duration ? duration : "",
      d.play_count ? formatNum(d.play_count) + " views" : "",
      d.digg_count ? formatNum(d.digg_count) + " likes" : ""
    ].filter(Boolean).join("  -  ") || "MP4 - best quality available";

    btnNoWatermark.href = hd || "#";
    btnWatermark.href = wm || "#";
    btnMusic.href = music || "#";
    if (!music) { btnMusic.style.display = "none"; } else { btnMusic.style.display = ""; }

    resultBox.hidden = false;
    showStatus("success", "Video found! Choose quality and download.");
    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function formatNum(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return String(n);
  }

  btnForceDl.addEventListener("click", function () {
    var fileUrl = currentFiles.hd || currentFiles.wm;
    if (!fileUrl) return;
    btnForceDl.disabled = true;
    btnForceDl.textContent = "Downloading...";
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
        btnForceDl.textContent = "Direct MP4 download";
      })
      .catch(function () {
        window.open(fileUrl, "_blank", "noopener");
        btnForceDl.disabled = false;
        btnForceDl.textContent = "Direct MP4 download";
      });
  });

  function sanitizeName(s) {
    return String(s || "tiktok-video").replace(/[\\/:*?"<>|]/g, "").slice(0, 60) || "tiktok-video";
  }
})();

/* Viral share buttons */
(function () {
  "use strict";
  try {
    var pageUrl = "https://beraniahmed29-rgb.github.io/tikmp4/en.html";
    var shareText = "Download TikTok videos in HD MP4 with no watermark - 100% free";
    function set(id, href) { var el = document.getElementById(id); if (el) el.href = href; }
    set("shareWa", "https://wa.me/?text=" + encodeURIComponent(shareText + " " + pageUrl));
    set("shareTg", "https://t.me/share/url?url=" + encodeURIComponent(pageUrl) + "&text=" + encodeURIComponent(shareText));
    set("shareFb", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(pageUrl));
    set("shareX", "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText) + "&url=" + encodeURIComponent(pageUrl));
    var nativeBtn = document.getElementById("shareNative");
    if (nativeBtn) {
      if (!navigator.share) { nativeBtn.style.display = "none"; }
      nativeBtn.addEventListener("click", function () {
        if (navigator.share) { navigator.share({ title: "TikMP4", text: shareText, url: pageUrl }).catch(function () {}); }
      });
    }
  } catch (e) {}
})();
