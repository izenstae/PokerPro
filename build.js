/* Builds two self-contained pages. No bundler, no deps.
     index.html         the Skill Builder hub: sb/ modules + the poker schedule/game/level modules it shares
                        + the Math 340 manifest, content and store, so the hub can read that course's progress
     poker/index.html   PokerPro, exactly as before, from src/
   The Math 340 app itself is served as-is from school/math340/. */
const fs = require("fs");
const path = require("path");

const read = (dir, f) => fs.readFileSync(path.join(__dirname, dir, f), "utf8");
const strip = (dir, f) => read(dir, f).replace(/\nif \(typeof module[\s\S]*$/, "");   /* drop the node export block */
/* a "</script" inside inlined code (even in a comment) would end the page's script element early */
const safe = js => js.replace(/<\/script/gi, "<\\/script");
const fill = (tpl, slots) => {
  let out = tpl;
  for (const k of Object.keys(slots)) {
    if (!out.includes(k)) throw new Error("template is missing " + k);
    out = out.replace(k, () => safe(slots[k]));
  }
  if (out.includes("module.exports")) throw new Error("a node export leaked into the build");
  if (out.includes("/*__")) throw new Error("an unfilled placeholder survived");
  return out;
};

/* ---- PokerPro (unchanged) ---- */
const pokerEngine = ["engine.js", "range.js", "cfr.js", "leduc.js", "river.js", "turn.js", "drills.js", "drills2.js", "holdem.js", "bots.js", "coach.js", "play.js", "level.js", "game.js", "srs.js", "sync.js", "library.js"].map(f => strip("src", f)).join("\n");
const pokerCourse = ["lessons.js", "course.js", "lessons2.js", "path.js"].map(f => read("src", f)).join("\n");
const poker = fill(read("src", "app.tpl.html"), { "/*__ENGINE__*/": pokerEngine, "/*__LESSONS__*/": pokerCourse });
fs.mkdirSync(path.join(__dirname, "poker"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "poker", "index.html"), poker);
console.log("built poker/index.html  " + (poker.length / 1024).toFixed(0) + "kb");

/* ---- the hub ---- */
const shared = ["srs.js", "game.js", "level.js", "sync.js"].map(f => strip("src", f)).join("\n");
const sb = ["lang.js", "core.js", "planner.js", "school.js", "method.js", "hubsync.js", "quant.js", "chess.js", "chess_drills.js", "chess_course.js",
  "sv_data.js", "sv_course.js", "he_data.js", "he_data2.js", "he_course.js", "es_data.js", "es_course.js"].map(f => strip("sb", f)).join("\n");
/* the Math 340 content, in the order its own index.html loads it; its store reads the same localStorage key the app uses */
const m340Index = read("school/math340", "index.html");
const m340Files = [...m340Index.matchAll(/<script src="(data\/[^"]+)"><\/script>/g)].map(m => m[1]);
if (!m340Files.length) throw new Error("no Math 340 data files found in school/math340/index.html");
const m340 = m340Files.map(f => read("school/math340", f)).join("\n") + "\n" + read("school/math340", "js/store.js").replace(/\bconst Store\b/, "var M340Store");
const ui = fs.readdirSync(path.join(__dirname, "sb", "ui")).filter(f => f.endsWith(".js")).sort().map(f => read("sb/ui", f)).join("\n");
const hub = fill(read("sb", "app.tpl.html"), { "/*__SHARED__*/": shared, "/*__SB__*/": sb, "/*__MATH340__*/": m340, "/*__UI__*/": ui });
fs.writeFileSync(path.join(__dirname, "index.html"), hub);
console.log("built index.html  " + (hub.length / 1024).toFixed(0) + "kb  (" + m340Files.length + " Math 340 content files, " + ui.split("\n").length + " lines of UI)");

/* ---- the service worker: every file the three apps need, so all of it works offline after one visit ---- */
function walk(dir, out) {
  for (const f of fs.readdirSync(path.join(__dirname, dir))) {
    const rel = dir + "/" + f, abs = path.join(__dirname, rel);
    if (fs.statSync(abs).isDirectory()) { if (f !== "docs" && f !== "tools") walk(rel, out); }
    else if (!/\.(md|py|txt)$/.test(f) && f !== ".nojekyll") out.push(rel);
  }
  return out;
}
const core = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-180.png", "./poker/", "./poker/index.html", "./poker/manifest.webmanifest", "./poker/icon.svg", "./poker/icon-180.png", "./school/math340/", "./school/math340/index.html"]
  .concat(walk("school/math340", []).filter(f => f !== "school/math340/index.html").map(f => "./" + f));
const swTpl = read("site", "sw.tpl.js");
/* the stamp covers the two built pages and every precached file's contents, so editing Math 340's own app.js or
   a KaTeX file (served cache-first, not inlined into the hub) also replaces the cache on the next load */
const precached = core.filter(f => !/\/$/.test(f) && !/^\.\/(index\.html|poker\/index\.html)$/.test(f))
  .map(f => fs.readFileSync(path.join(__dirname, /^\.\/(manifest\.webmanifest|icon\.svg|icon-180\.png)$/.test(f) ? "site/" + f.slice(2) : f.slice(2))));   /* the hub's own PWA files live in site/ */
const stamp = require("crypto").createHash("md5").update(hub + poker + core.join("\n")).update(Buffer.concat(precached)).digest("hex").slice(0, 10);
fs.writeFileSync(path.join(__dirname, "sw.js"), swTpl.replace("/*__CACHE__*/", JSON.stringify("skillbuilder-" + stamp)).replace("/*__CORE__*/", JSON.stringify(core, null, 1)));
console.log("built sw.js  " + core.length + " files cached offline, cache " + stamp);
