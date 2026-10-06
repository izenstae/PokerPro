/* Skill Builder service worker: the hub, PokerPro and the Math 340 tool all work offline after one visit.
   Pages: network first (the newest version when online), falling back to the cache. Everything else: cache first.
   The cache name carries a hash of the build, so a new build replaces the old cache on the next load. */
var CACHE = "skillbuilder-2d14767099";
var CORE = [
 "./",
 "./index.html",
 "./manifest.webmanifest",
 "./icon.svg",
 "./poker/",
 "./poker/index.html",
 "./poker/manifest.webmanifest",
 "./poker/icon.svg",
 "./school/math340/",
 "./school/math340/index.html",
 "./school/math340/css/styles.css",
 "./school/math340/data/ch1.js",
 "./school/math340/data/ch2.js",
 "./school/math340/data/ch3.js",
 "./school/math340/data/distributions.js",
 "./school/math340/data/manifest.js",
 "./school/math340/js/app.js",
 "./school/math340/js/exam.js",
 "./school/math340/js/flashcards.js",
 "./school/math340/js/practice.js",
 "./school/math340/js/store.js",
 "./school/math340/lib/katex/contrib/auto-render.min.js",
 "./school/math340/lib/katex/fonts/KaTeX_AMS-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_AMS-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_AMS-Regular.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Caligraphic-Bold.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Caligraphic-Bold.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Caligraphic-Bold.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Caligraphic-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Caligraphic-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Caligraphic-Regular.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Fraktur-Bold.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Fraktur-Bold.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Fraktur-Bold.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Fraktur-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Fraktur-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Fraktur-Regular.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Main-Bold.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Main-Bold.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Main-Bold.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Main-BoldItalic.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Main-BoldItalic.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Main-BoldItalic.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Main-Italic.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Main-Italic.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Main-Italic.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Main-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Main-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Main-Regular.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Math-BoldItalic.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Math-BoldItalic.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Math-BoldItalic.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Math-Italic.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Math-Italic.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Math-Italic.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_SansSerif-Bold.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_SansSerif-Bold.woff",
 "./school/math340/lib/katex/fonts/KaTeX_SansSerif-Bold.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_SansSerif-Italic.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_SansSerif-Italic.woff",
 "./school/math340/lib/katex/fonts/KaTeX_SansSerif-Italic.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_SansSerif-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_SansSerif-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_SansSerif-Regular.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Script-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Script-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Script-Regular.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Size1-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Size1-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Size1-Regular.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Size2-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Size2-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Size2-Regular.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Size3-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Size3-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Size3-Regular.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Size4-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Size4-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Size4-Regular.woff2",
 "./school/math340/lib/katex/fonts/KaTeX_Typewriter-Regular.ttf",
 "./school/math340/lib/katex/fonts/KaTeX_Typewriter-Regular.woff",
 "./school/math340/lib/katex/fonts/KaTeX_Typewriter-Regular.woff2",
 "./school/math340/lib/katex/katex.min.css",
 "./school/math340/lib/katex/katex.min.js"
];

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
