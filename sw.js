/* TikMP4 service worker: offline shell for core pages (ads always bypass cache) */
var CACHE = "tikmp4-v1";
var CORE = [
  "./", "index.html", "en.html", "style.css",
  "app.js", "app-en.js", "ui.js", "history.js",
  "manifest.json", "favicon.svg", "icons.svg",
  "icon-192.png", "icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () {})
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  // Never cache: ad scripts, API calls, non-GET
  if (e.request.method !== "GET") return;
  if (url.origin !== location.origin) return;
  if (/ads\.js/i.test(url.pathname)) return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      var fresh = fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || fresh;
    })
  );
});
