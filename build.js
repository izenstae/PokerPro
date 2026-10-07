/* Builds two self-contained pages. No bundler, no deps.
     index.html         the Skill Builder hub: sb/ modules + the poker schedule/game/level modules it shares
                        + the Math 340 manifest, content and whole app (its views draw inside the hub)
     poker/index.html   PokerPro, from src/; the hub shows it inside its own shell at #/poker
   The Math 340 app is also served as-is from school/math340/ (its tests, and an app of its own). */
const fs = require("fs");
const path = require("path");

const read = (dir, f) => fs.readFileSync(path.join(__dirname, dir, f), "utf8");
const strip = (dir, f) => read(dir, f).replace(/\nif \(typeof module[\s\S]*$/, "");   /* drop the node export block */
/* a "</script" inside inlined code (even in a comment) would end the page's script element early, and a "<script src"
   there (a comment in the Math 340 manifest has one) is fetched by the browser's speculative preload scanner, which does
   not know it is inside script text. "\u0073" is "s" in a comment, a string and a regex alike. */
const safe = js => js.replace(/<\/script/gi, "<\\/script").replace(/<script/gi, "<\\u0073cript");
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
/* a course app's stylesheet, scoped to the hub's container for it. Every selector is prefixed with the scope, so the
   course's .card, .btn and .hero never reach the hub's screens; :root and body become the container (the hub maps the
   course's colour variables onto its own palette first, in app.tpl.html, so the course's own :root rules are dropped);
   "body.printing-sheet …", which the Reference page sets to print the formula sheet, keeps its body class. */
function scopeCss(css, scope) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const theme = /^(:root|\[data-theme="dark"\])$/;
  const one = x => {
    if (x === "html") return null;
    if (theme.test(x) || x === "body" || x === ":root[data-theme=\"dark\"]") return scope;
    if (/^body\./.test(x)) return x.replace(/^body(\.[\w-]+)/, "body$1 " + scope);
    return scope + " " + x;
  };
  const sel = list => list.split(",").map(x => x.trim()).filter(Boolean).map(one).filter(Boolean).join(", ");
  let out = "", buf = "";
  const stack = [];   /* per open brace: "nested" (selectors inside: @media…), "plain" (declarations inside) or "skip" (dropped) */
  for (const ch of css) {
    if (ch === "{") {
      const head = buf.trim(); buf = "";
      const parent = stack[stack.length - 1], skipping = stack.includes("skip");
      let kind = "plain", text = head;
      if (head.startsWith("@")) kind = /^@(media|supports|container|layer)\b/.test(head) ? "nested" : "plain";
      else if (!parent && head.split(",").every(x => theme.test(x.trim()))) kind = "skip";    /* the course's own theme variables */
      else if (!parent || parent === "nested") text = sel(head);
      stack.push(kind);
      if (!skipping && kind !== "skip") out += text + "{";
    } else if (ch === "}") {
      const kind = stack.pop();
      if (kind !== "skip" && !stack.includes("skip")) out += buf.trim() + "}";
      buf = "";
    } else buf += ch;
  }
  if (stack.length) throw new Error("unbalanced braces in the course stylesheet");
  return out.replace(/\s+/g, " ").replace(/ ?([{};:,]) ?/g, "$1");
}

/* the Math 340 course: its content in the order its own index.html loads it, then its app (store, flashcards, practice,
   exam, shell) in a scope of its own, registering under the hub's course id so the hub draws its pages at
   #/school/math340/<page>. Its store reads the same localStorage key the standalone app uses. */
const m340Index = read("school/math340", "index.html");
const m340Files = [...m340Index.matchAll(/<script src="((?:data|js)\/[^"]+)"><\/script>/g)].map(m => m[1]);
const m340Data = m340Files.filter(f => f.startsWith("data/")), m340App = m340Files.filter(f => f.startsWith("js/"));
if (!m340Data.length || !m340App.length) throw new Error("no Math 340 data or app files found in school/math340/index.html");
const m340 = m340Data.map(f => read("school/math340", f)).join("\n") +
  "\n(function () {\n" + m340App.map(f => read("school/math340", f)).join("\n") + "\nSCHOOL_APPS[\"math340\"] = App;\n})();";
const m340Css = scopeCss(read("school/math340", "css/styles.css"), ".m340");
const ui = fs.readdirSync(path.join(__dirname, "sb", "ui")).filter(f => f.endsWith(".js")).sort().map(f => read("sb/ui", f)).join("\n");
const hub = fill(read("sb", "app.tpl.html"), { "/*__SHARED__*/": shared, "/*__SB__*/": sb, "/*__MATH340__*/": m340, "/*__MATH340_CSS__*/": m340Css, "/*__UI__*/": ui });
/* the hub's script is one block from four sources: a name declared twice (the course app's const against a hub var, say)
   would stop the whole page at parse time, so compile it here, where the error names the line */
new (require("vm").Script)(hub.slice(hub.lastIndexOf("<script>") + 8, hub.lastIndexOf("</script>")), { filename: "index.html(script)" });
fs.writeFileSync(path.join(__dirname, "index.html"), hub);
console.log("built index.html  " + (hub.length / 1024).toFixed(0) + "kb  (" + m340Data.length + " Math 340 content files, " + m340App.length + " app files, " + ui.split("\n").length + " lines of UI)");

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
