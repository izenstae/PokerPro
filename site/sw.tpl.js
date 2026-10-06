/* Skill Builder service worker: the hub, PokerPro and the Math 340 tool all work offline after one visit.
   Pages: network first (the newest version when online), falling back to the cache. Everything else: cache first.
   The cache name carries a hash of the build, so a new build replaces the old cache on the next load. */
var CACHE = /*__CACHE__*/;
var CORE = /*__CORE__*/;

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    /* add one at a time so a single missing file does not abort the whole install */
    return Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;   /* sync (api.github.com) and fonts go straight to the network */
  if (req.mode === "navigate" || /\.html$/.test(new URL(req.url).pathname) || /\/$/.test(new URL(req.url).pathname)) {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match(req.url.replace(/\/$/, "/index.html")) || caches.match("./index.html"); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    return hit || fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    });
  }));
});
