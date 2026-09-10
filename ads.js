/* ============================================================
   TikMP4 - إعدادات إعلانات Adsterra
   ------------------------------------------------------------
   خطوات إضافة الإعلانات (من حسابك):
   1) ادخل إلى: https://beta.publishers.adsterra.com/websites
   2) أضف موقعك (الدومين) وانتظر الموافقة.
   3) من قسم Ads أنشئ: Banner 728x90 + Banner 300x250 +
      Native Banner + Social Bar + Popunder + Direct Link
   4) انسخ الأكواد والصقها هنا بدل "" ثم احفظ وارفع الموقع.

   ملاحظة: الموقع يعمل بدون إعلانات أيضاً. الأماكن الفارغة
   تظهر كـ "مساحة إعلانية" فقط ولن تسبب أي خطأ.
   ============================================================ */

var ADSTERRA_CONFIG = {
  // مثال Banner: "<script src='https://.../invoke.js'><\/script>"
  banner728x90: '<script>atOptions={"key":"00f9e9bea6f3dff4274e81a91e7a7c99","format":"iframe","height":90,"width":728,"params":{}};<\/script><script src="https://www.highrevenueformat.com/00f9e9bea6f3dff4274e81a91e7a7c99/invoke.js"><\/script>', // بانر علوي وسفلي
  banner728x90_bottom: '<script>atOptions={"key":"1c61f1e375b70ab6e5bae6f4c9a449a0","format":"iframe","height":90,"width":728,"params":{}};<\/script><script src="https://www.highrevenueformat.com/1c61f1e375b70ab6e5bae6f4c9a449a0/invoke.js"><\/script>', // بانر سفلي 728x90
  banner300x250: '<script>atOptions={"key":"d2ca658790a59d0d0428b0e267f1e8f0","format":"iframe","height":250,"width":300,"params":{}};<\/script><script src="https://www.highrevenueformat.com/d2ca658790a59d0d0428b0e267f1e8f0/invoke.js"><\/script>', // بانر وسط الموقع
  nativeBanner: '<script async="async" data-cfasync="false" src="https://pl31253904.profitableratecpmnetwork.com/1411c5176b6b2b811285c52be6193cf9/invoke.js"><\/script><div id="container-1411c5176b6b2b811285c52be6193cf9"></div>', // إعلان Native قبل الأسئلة الشائعة
  socialBar: '<script src="https://pl31253905.profitableratecpmnetwork.com/74/3e/18/743e18726d51ad171863d67345f1306d.js"><\/script>', // شريط اجتماعي (يُنشئ إعلاناً مرئياً)
  popunder: '<script src="https://pl31253903.profitableratecpmnetwork.com/44/ef/e6/44efe6e15169e347812fef7a194a9190.js"><\/script>', // منبثقة عند النقر بعد 3 ثوانٍ
  directLinkSmartlink: "https://www.profitableratecpmnetwork.com/nzy8zn9j?key=c4197a1a9282418d8258286bc9916413" // رابط مباشر محفوظ (اختياري)
};

(function () {
  "use strict";
  try {
    function injectHTML(slotId, html) {
      if (!html) return false;
      var el = document.getElementById(slotId);
      if (!el) return false;
      // إزالة نص "مساحة إعلانية" وإظهار الإعلان الحقيقي
      var small = el.querySelector("small");
      if (small) small.remove();
      el.style.border = "none";
      el.style.background = "transparent";
      el.style.minHeight = "0";
      el.insertAdjacentHTML("beforeend", html);
      // تفعيل سكريبتات الإعلان: insertAdjacentHTML يدرجها دون تنفيذ، فنعيد إنشاءها لتعمل
      var slotScripts = el.querySelectorAll("script");
      slotScripts.forEach(function (old) {
        var s = document.createElement("script");
        s.type = old.type || "text/javascript";
        s.async = false;
        if (old.src) s.src = old.src;
        if (old.textContent) s.textContent = old.textContent;
        Array.prototype.forEach.call(old.attributes, function (a) {
          if (a.name !== "src" && a.name !== "type") s.setAttribute(a.name, a.value);
        });
        old.replaceWith(s);
      });
      return true;
    }
    function injectScript(code) {
      if (!code) return;
      var tmp = document.createElement("div");
      tmp.innerHTML = code;
      var scripts = tmp.querySelectorAll("script");
      // أولاً أضف أي HTML غير سكريبت
      document.body.appendChild(tmp);
      // ثم نفّذ السكريبتات بشكل آمن
      scripts.forEach(function (old) {
        var s = document.createElement("script");
        if (old.src) s.src = old.src;
        s.type = old.type || "text/javascript";
        if (old.textContent) s.textContent = old.textContent;
        Array.prototype.forEach.call(old.attributes, function (a) { s.setAttribute(a.name, a.value); });
        document.body.appendChild(s);
      });
    }

    document.addEventListener("DOMContentLoaded", function () {
      var hasTop = injectHTML("ad-top-banner", ADSTERRA_CONFIG.banner728x90);
      var hasBottom = injectHTML("ad-bottom-banner", ADSTERRA_CONFIG.banner728x90_bottom || ADSTERRA_CONFIG.banner728x90);
      var hasMiddle = injectHTML("ad-middle-banner", ADSTERRA_CONFIG.banner300x250 || ADSTERRA_CONFIG.nativeBanner);
      var hasNative = injectHTML("ad-native", ADSTERRA_CONFIG.nativeBanner || ADSTERRA_CONFIG.banner300x250);
      // إخفاء أي خانة إعلانية فارغة حتى لا تظهر للزوار قبل إضافة أكواد Adsterra
      ["ad-top-banner", "ad-bottom-banner", "ad-middle-banner", "ad-native"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !el.querySelector("script") && !el.querySelector("iframe") && !el.querySelector("ins")) {
          el.style.display = "none";
        }
      });
      injectScript(ADSTERRA_CONFIG.socialBar);
      // Popunder يؤخر 3 ثواني حتى لا يؤثر على سرعة التحميل
      if (ADSTERRA_CONFIG.popunder) {
        setTimeout(function () { injectScript(ADSTERRA_CONFIG.popunder); }, 3000);
      }
      // وضع التشخيص: افتح index.html?debug=ads لرؤية حالة الإعلانات على الصفحة
      if (/[?&]debug=ads/.test(location.search)) {
        setTimeout(function () {
          function slotInfo(id) {
            var el = document.getElementById(id);
            if (!el) return id + ": missing";
            var nScript = el.querySelectorAll("script").length;
            var nFrame = el.querySelectorAll("iframe").length;
            return id + ": scripts=" + nScript + " iframes=" + nFrame + " height=" + el.offsetHeight + "px display=" + getComputedStyle(el).display;
          }
          var lines = [
            "banner728x90 configured: " + (ADSTERRA_CONFIG.banner728x90 ? "YES" : "NO"),
            slotInfo("ad-top-banner"),
            slotInfo("ad-bottom-banner"),
            slotInfo("ad-middle-banner"),
            slotInfo("ad-native")
          ];
          var topFrames = document.querySelectorAll("#ad-top-banner iframe").length;
          var botFrames = document.querySelectorAll("#ad-bottom-banner iframe").length;
          var verdict = (topFrames + botFrames) > 0
            ? "✅ الإعلانات تعمل وتظهر."
            : (document.querySelectorAll("#ad-top-banner script").length > 0
              ? "⛔ سكريبت Adsterra يصل للمتصفح لكنه لا يعرض إعلاناً. الغالب: الموقع/الوحدة غير معتمد بعد في Adsterra (الحالة Pending) أو لا يوجد إعلان متاح. راجع صفحة Websites في حسابك."
              : "⚠ لا يوجد كود إعلان في هذه الصفحة.");
          lines.push(verdict);
          var box = document.createElement("div");
          box.style.cssText = "position:fixed;bottom:10px;left:10px;right:10px;z-index:9999;background:#000;color:#0f0;border:2px solid #0f0;border-radius:10px;padding:12px;font:13px monospace;direction:ltr;text-align:left;white-space:pre-wrap";
          box.textContent = "ADS DEBUG\n" + lines.join("\n");
          document.body.appendChild(box);
        }, 4000);
      }
    });
  } catch (e) { console.warn("ads.js:", e); }
})();
