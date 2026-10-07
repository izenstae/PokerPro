/* Headless smoke test of the built hub with Playwright and the preinstalled Chromium:
   every route draws without a console error, a drill answers end to end, a checkpoint passes,
   the planner draws a day, the quant game runs, Math 340 runs inside the hub, PokerPro runs inside the hub's frame. */
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf" };
/* the hub's manifest and icons live in site/ and are copied to the root by the deploy; serve them from there */
const server = http.createServer((q, s) => { let u = decodeURIComponent(q.url.split("?")[0]); if (u.endsWith("/")) u += "index.html"; if (/^\/(manifest\.webmanifest|icon\.svg|icon-180\.png)$/.test(u)) u = "/site" + u; const fp = path.join(root, u); fs.readFile(fp, (e, b) => { if (e) { s.statusCode = 404; s.end("nf"); return; } s.setHeader("content-type", types[path.extname(fp)] || "application/octet-stream"); s.end(b); }); });
(async () => {
  await new Promise(r => server.listen(8765, r));
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  const cspHits = [];
  page.on("console", m => { if (/Content Security Policy/.test(m.text())) cspHits.push(m.text()); else if (m.type() === "error") errors.push("console: " + m.text()); });
  page.on("response", r => { if (r.status() === 404) errors.push("404: " + r.url()); });
  const base = "http://localhost:8765/";
  let fails = 0, n = 0;
  const ok = (c, m) => { n++; if (!c) { fails++; console.log("  FAIL " + m); } };
  const go = async (hash) => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(120); };
  const text = async () => (await page.textContent("#main")) || "";

  await page.goto(base + "#/home", { waitUntil: "load" });
  await page.waitForTimeout(300);
  ok((await text()).indexOf("Today") >= 0 || (await text()).indexOf("plan") >= 0, "home draws");
  const routes = ["#/calendar/week", "#/calendar/forecast", "#/calendar/month", "#/calendar/settings", "#/skills", "#/school", "#/quant",
    "#/school/math340", "#/school/math340/flashcards", "#/school/math340/practice", "#/school/math340/exam", "#/school/math340/reference", "#/school/math340/schedule", "#/school/math340/progress", "#/library/all", "#/library/glossary", "#/library/reading", "#/library/method", "#/sync", "#/method",
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
  /* a failed checkpoint, then Try again: the result panel is already at #/drill, so it must redraw the table itself */
  await go("#/c/chess/learn/ch_value"); await page.click("text=Retake checkpoint"); await page.waitForTimeout(200);
  for (let i = 0; i < 40; i++) { const st = await page.evaluate(() => ({ cp: !!cp, answered, done: !document.querySelector(".cpdone").hidden })); if (st.done || !st.cp) break; if (st.answered) { await page.evaluate(() => advance()); await page.waitForTimeout(60); continue; } await page.evaluate(() => submit(q.kind === "choice" ? (q.options.filter(o => o !== q.answer)[0] || "zzz") : "zzz")); await page.waitForTimeout(60); if (await page.evaluate(() => !!(q && q.confPending))) await page.evaluate(() => pickConfidence("s")); }
  ok(await page.evaluate(() => !document.querySelector(".cpdone").hidden && !!document.querySelector(".cpdone h3.fail")), "a checkpoint answered wrong fails");
  await page.click("text=Try again"); await page.waitForTimeout(200);
  ok(await page.evaluate(() => location.hash === "#/drill" && !document.querySelector(".table").hidden && document.querySelector(".cpdone").hidden && !!q && !!cp), "Try again shows the table again and hides the result");
  /* Enter on a focused option answers with that option */
  for (let i = 0; i < 10 && !(await page.evaluate(() => q && q.kind === "choice" && !answered)); i++) await page.evaluate(() => { answered = false; cp.marks = []; cp.asked = []; next(); });
  if (await page.evaluate(() => q && q.kind === "choice")) {
    const picked = await page.evaluate(() => { const bs = document.querySelectorAll("#controls .opts button"); const b = bs[bs.length - 1]; b.focus(); return b.textContent.replace(/\d$/, ""); });
    await page.keyboard.press("Enter"); await page.waitForTimeout(80);
    ok(await page.evaluate(p => answered && (q.confPending ? q.confPending.said === p : true), picked), "Enter on a focused choice button answers with it");
    if (await page.evaluate(() => !!q.confPending)) { await page.evaluate(() => { document.querySelectorAll("#reveal .confq button")[1].focus(); }); await page.keyboard.press("Enter"); await page.waitForTimeout(80); ok(await page.evaluate(() => q.conf === "f" && !q.confPending), "Enter on a focused confidence button picks it"); }
  } else ok(false, "no choice question reached for the Enter check");
  await page.evaluate(() => { cp = null; sess = null; });
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
  /* Math 340 inside the hub: its links point back into the hub, KaTeX typesets, a cram session runs on the keyboard, the exam clock stops on leaving */
  await go("#/school/math340"); await page.waitForTimeout(200);
  ok(await page.evaluate(() => [...document.querySelectorAll("#schoolApp a[href^='#/']")].every(a => a.getAttribute("href").indexOf("#/school/math340/") === 0)), "the course dashboard's links stay in the hub");
  await go("#/school/math340/reference"); await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.querySelectorAll("#schoolApp .katex").length > 20), "the reference page is typeset by KaTeX inside the hub");
  await go("#/school/math340/flashcards"); await page.click("text=Cram all decks"); await page.waitForTimeout(150);
  ok(await page.evaluate(() => !!document.querySelector("#schoolApp #fcCard")), "a cram session shows a card");
  await page.keyboard.press("Space"); await page.waitForTimeout(80);
  ok(await page.evaluate(() => !!document.querySelector("#schoolApp #fcGot")), "space reveals the card");
  await page.keyboard.press("2"); await page.waitForTimeout(80);
  ok(await page.evaluate(() => { const st = JSON.parse(localStorage.getItem("math340-progress-v1") || "{}"); return st.cards && Object.keys(st.cards).length === 1 && document.querySelector("#schoolApp .fc-progress").textContent.indexOf("1 ✓") >= 0; }), "2 grades it and the course store saved it");
  await page.click("#pnav, nav.subnav >> text=Flashcards").catch(() => {}); await page.waitForTimeout(120);
  ok(await page.evaluate(() => !!document.querySelector("#schoolApp #fcAll")), "the tab you are on redraws the page out of the session");
  await go("#/school/math340/exam"); await page.click("text=Wednesday quiz"); await page.waitForTimeout(200);
  ok(await page.evaluate(() => SCHOOL_APPS.math340.inProgress() && !!document.querySelector("#schoolApp .exam-clock")), "a quiz sitting is in progress with its clock");
  await go("#/home"); ok((await text()).indexOf("MATH 340") >= 0, "Today draws after the course page");
  await go("#/school/math340/exam"); await page.waitForTimeout(150);
  ok(await page.evaluate(() => !!document.querySelector("#schoolApp .exam-clock")), "coming back resumes the sitting, as the app does on its own");
  await page.evaluate(() => SCHOOL_APPS.math340.leave());
  /* PokerPro inside the hub: the hub's header and tabs, the app in its frame with no header of its own, the hub's hash following the app */
  await go("#/poker/learn"); await page.waitForTimeout(900);
  const pokerFrameOf = () => page.frames().find(f => f !== page.mainFrame() && f.url().indexOf("/poker/") >= 0);
  const pf = pokerFrameOf();
  ok(!!pf, "PokerPro's frame loaded");
  ok(pf && (await pf.textContent("body")).indexOf("PokerPro") >= 0 && await pf.evaluate(() => document.documentElement.classList.contains("embedded") && getComputedStyle(document.querySelector(".top")).display === "none"), "the frame is in embedded mode without its own header");
  ok(await page.evaluate(() => document.querySelector("#pnav a[aria-current=page]").textContent === "Learn" && document.querySelector("#phead h1").textContent === "Poker"), "the hub draws Poker's header and the Learn tab");
  ok(await page.evaluate(() => parseInt(document.getElementById("pframe").style.height) > 400), "the frame took its content's height: " + await page.evaluate(() => document.getElementById("pframe").style.height));
  await pf.evaluate(() => { location.hash = "#/level"; }); await page.waitForTimeout(300);
  ok(await page.evaluate(() => location.hash === "#/poker/level" && document.querySelector("#pnav a[aria-current=page]").textContent === "Level"), "the app moving to Level moved the hub's hash and tab: " + await page.evaluate(() => location.hash));
  await page.click("#pnav >> text=Practice"); await page.waitForTimeout(300);
  ok(pokerFrameOf() === pf && /^#\/practice/.test(await pf.evaluate(() => location.hash)), "the hub's tab steered the same frame, no reload");
  await page.click("#themeBtn"); await page.waitForTimeout(150);
  ok(await pf.evaluate(() => document.documentElement.classList.contains("light")) === await page.evaluate(() => themeNow() === "light"), "the frame follows the hub's theme");
  await page.click("#themeBtn");
  /* the standalone apps still load on their own */
  await page.goto(base + "poker/#/home", { waitUntil: "load" }); await page.waitForTimeout(400);
  ok((await page.textContent("body")).indexOf("PokerPro") >= 0 && await page.evaluate(() => !document.documentElement.classList.contains("embedded")), "PokerPro loads on its own, with its header");
  await page.goto(base + "school/math340/#/dashboard", { waitUntil: "load" }); await page.waitForTimeout(600);
  ok((await page.textContent("body")).indexOf("Probability Studio") >= 0, "Math 340 loads on its own");
  ok(errors.length === 0, "no console errors at all: " + errors.slice(0, 6).join(" | "));
  /* a phone-width pass */
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto(base + "#/home", { waitUntil: "load" }); await page.waitForTimeout(300);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  ok(!wide, "no horizontal overflow at phone width");
  for (const r of ["#/quant", "#/c/chess/apply", "#/library/all", "#/calendar/week", "#/school/math340/practice", "#/poker"]) { await go(r); await page.waitForTimeout(100); const w = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]); ok(w[0] <= w[1] + 2, "no horizontal overflow at 390px on " + r + " (" + w.join("/") + ")"); }
  ok(cspHits.length === 0, "no Content-Security-Policy violations: " + cspHits.slice(0, 3).join(" | "));
  console.log("smoke: " + (n - fails) + "/" + n + " passed" + (errors.length ? "\n" + errors.join("\n") : ""));
  await browser.close(); server.close();
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(1); });
