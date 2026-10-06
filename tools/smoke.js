/* Headless smoke test of the built hub with Playwright and the preinstalled Chromium:
   every route draws without a console error, a drill answers end to end, a checkpoint passes,
   the planner draws a day, the quant game runs, and PokerPro and the Math 340 tool load. */
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf" };
const server = http.createServer((q, s) => { let u = decodeURIComponent(q.url.split("?")[0]); if (u.endsWith("/")) u += "index.html"; const fp = path.join(root, u); fs.readFile(fp, (e, b) => { if (e) { s.statusCode = 404; s.end("nf"); return; } s.setHeader("content-type", types[path.extname(fp)] || "application/octet-stream"); s.end(b); }); });
(async () => {
  await new Promise(r => server.listen(8765, r));
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  const base = "http://localhost:8765/";
  let fails = 0, n = 0;
  const ok = (c, m) => { n++; if (!c) { fails++; console.log("  FAIL " + m); } };
  const go = async (hash) => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(120); };
  const text = async () => (await page.textContent("#main")) || "";

  await page.goto(base + "#/home", { waitUntil: "load" });
  await page.waitForTimeout(300);
  ok((await text()).indexOf("Today") >= 0 || (await text()).indexOf("plan") >= 0, "home draws");
  const routes = ["#/calendar/week", "#/calendar/forecast", "#/calendar/month", "#/calendar/settings", "#/skills", "#/school", "#/poker", "#/quant", "#/library/all", "#/library/glossary", "#/library/reading", "#/library/method", "#/sync", "#/method",
    "#/c/chess", "#/c/chess/practice", "#/c/chess/apply", "#/c/chess/apply/rush", "#/c/chess/level", "#/c/chess/library", "#/c/chess/library/glossary", "#/c/chess/library/reading",
    "#/c/sv", "#/c/sv/practice", "#/c/sv/apply", "#/c/sv/apply/listen", "#/c/sv/apply/write", "#/c/sv/apply/log", "#/c/sv/level", "#/c/sv/library",
    "#/c/he", "#/c/he/apply", "#/c/he/level", "#/c/es", "#/c/es/apply", "#/c/es/level"];
  for (const r of routes) { await go(r); const t = await text(); ok(t.length > 50 && t.indexOf("Something went wrong") < 0, "route " + r + " draws (" + t.slice(0, 60).replace(/\s+/g, " ") + ")"); }
  /* every lesson of every course renders */
  const lessons = await page.evaluate(() => COURSE_ORDER.flatMap(cid => COURSES[cid].lessonList.map(L => "#/c/" + cid + "/learn/" + L.id)));
  for (const r of lessons) { await go(r); const t = await text(); ok(t.indexOf("Something went wrong") < 0 && t.length > 200, "lesson " + r); }
  ok(errors.length === 0, "no console errors so far: " + errors.slice(0, 5).join(" | "));

  /* a checkpoint, answered with the right answers, passes and schedules skills */
  await go("#/c/chess/learn/ch_value");
  await page.click("text=Start checkpoint");
  await page.waitForTimeout(200);
  for (let i = 0; i < 40; i++) {
    const state = await page.evaluate(() => ({ cp: !!cp, answered, kind: q && q.kind, ans: q && q.answer, done: !document.querySelector(".cpdone").hidden }));
    if (state.done) break;
    if (!state.cp) break;
    if (state.answered) { await page.evaluate(() => advance()); await page.waitForTimeout(80); continue; }
    await page.evaluate(() => submit(q.answer));
    await page.waitForTimeout(80);
    const conf = await page.evaluate(() => !!(q && q.confPending)); if (conf) { await page.evaluate(() => pickConfidence("s")); await page.waitForTimeout(50); }
  }
  const passedCp = await page.evaluate(() => !!progress["chess:ch_value"] && !!skills["chess:chvalue"]);
  ok(passedCp, "checkpoint passed and the drill joined the schedule");
  /* a vocabulary checkpoint in Hebrew */
  await go("#/c/he/learn/he_v1"); await page.click("text=Start checkpoint"); await page.waitForTimeout(200);
  for (let i = 0; i < 40; i++) { const st = await page.evaluate(() => ({ cp: !!cp, answered, done: !document.querySelector(".cpdone").hidden })); if (st.done || !st.cp) break; if (st.answered) { await page.evaluate(() => advance()); await page.waitForTimeout(60); continue; } await page.evaluate(() => submit(q.answer)); await page.waitForTimeout(60); if (await page.evaluate(() => !!(q && q.confPending))) await page.evaluate(() => pickConfidence("f")); }
  ok(await page.evaluate(() => !!progress["he:he_v1"] && Object.keys(skills).filter(k => k.indexOf("he:w:he_v1:") === 0).length === 30), "Hebrew vocabulary checkpoint graduates 30 words");
  /* make them due and run a review session */
  await page.evaluate(() => { Object.keys(skills).forEach(k => { skills[k].due = 0; }); saveNow(); });
  await go("#/home"); const home = await text(); ok(home.indexOf("review") >= 0, "home shows reviews due");
  await page.evaluate(() => startSession("due", null)); await page.waitForTimeout(200);
  let answered = 0;
  for (let i = 0; i < 8; i++) { const st = await page.evaluate(() => ({ s: !!sess, answered, kind: q && q.kind })); if (!st.s) break; if (st.answered) { await page.evaluate(() => advance()); await page.waitForTimeout(60); continue; } if (st.kind === "recall") { await page.evaluate(() => { showRule(); submit("had"); }); } else if (st.kind === "speak") { await page.evaluate(() => submit(q.answer, true)); } else await page.evaluate(() => submit(q.answer)); answered++; await page.waitForTimeout(60); if (await page.evaluate(() => !!(q && q.confPending))) await page.evaluate(() => pickConfidence("s")); }
  ok(answered >= 4, "review session answered " + answered + " questions");
  ok(await page.evaluate(() => gmToday().x > 0), "XP paid");
  /* placement in Spanish passes stage 0 with right answers */
  await page.evaluate(() => startPlacement("es", 0)); await page.waitForTimeout(200);
  for (let i = 0; i < 14; i++) { const st = await page.evaluate(() => ({ cp: !!cp, answered, done: !document.querySelector(".cpdone").hidden })); if (st.done || !st.cp) break; if (st.answered) { await page.evaluate(() => advance()); await page.waitForTimeout(60); continue; } await page.evaluate(() => submit(q.answer)); await page.waitForTimeout(60); if (await page.evaluate(() => !!(q && q.confPending))) await page.evaluate(() => pickConfidence("s")); }
  ok(await page.evaluate(() => !!progress["es:es_sounds"] && !!progress["es:es_stress"]), "placement passed stage 0 of Spanish");
  /* the quant game runs */
  await go("#/quant/sprint"); await page.click("text=Start");
  await page.waitForTimeout(100);
  await page.evaluate(() => { for (let i = 0; i < 5; i++) { const inp = document.getElementById("qinp"); inp.value = String(qrun.q.a); inp.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" })); } qrun.end = Date.now() - 1; });
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => HUB.quant.runs.length === 1 && HUB.quant.runs[0].score === 5), "quant run recorded with score 5");
  /* play: one engine move */
  await go("#/c/chess/apply"); await page.click("text=Start the game"); await page.waitForTimeout(200);
  await page.evaluate(() => { const m = chLegal(game.s)[0]; heroPlays(m); }); await page.waitForTimeout(800);
  ok(await page.evaluate(() => game.moves.length >= 2 && game.moves[0].grade), "play: hero move graded and engine replied");
  /* calendar settings: add a class and a hockey block, the plan respects them */
  await page.evaluate(() => { HUB.plan.week[new Date().getDay()] = [{ n: "Hockey", k: "hockey", f: "19:00", t: "21:00" }]; saveNow(); });
  await go("#/calendar/week"); ok((await text()).indexOf("Hockey") >= 0 && (await text()).indexOf("hockey day") >= 0, "calendar shows hockey and the lower cap");
  /* conversation: one turn */
  await go("#/c/sv/apply"); await page.click("text=Hello, who are you?"); await page.waitForTimeout(150);
  await page.fill("input[type=text]", "Jag heter Erik"); await page.keyboard.press("Enter"); await page.waitForTimeout(150);
  ok((await text()).indexOf("does the job") >= 0, "conversation grades a turn");
  /* the other two apps load */
  await page.goto(base + "poker/#/home", { waitUntil: "load" }); await page.waitForTimeout(400);
  ok((await page.textContent("body")).indexOf("PokerPro") >= 0, "PokerPro loads");
  await page.goto(base + "school/math340/#/dashboard", { waitUntil: "load" }); await page.waitForTimeout(600);
  ok((await page.textContent("body")).indexOf("Probability Studio") >= 0, "Math 340 loads");
  ok(errors.length === 0, "no console errors at all: " + errors.slice(0, 6).join(" | "));
  /* a phone-width pass */
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto(base + "#/home", { waitUntil: "load" }); await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  ok(!wide, "no horizontal overflow at phone width");
  console.log("smoke: " + (n - fails) + "/" + n + " passed" + (errors.length ? "\n" + errors.join("\n") : ""));
  await browser.close(); server.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
