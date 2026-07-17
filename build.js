/* Inlines every module into one self-contained HTML file. No bundler, no deps. */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const read = f => fs.readFileSync(path.join(SRC, f), "utf8");
const strip = f => read(f).replace(/\nif \(typeof module[\s\S]*$/, "");   /* drop the node export block */

const engine = ["engine.js", "range.js", "cfr.js", "leduc.js", "river.js", "turn.js", "drills.js"].map(strip).join("\n");
const course = ["lessons.js", "course.js"].map(read).join("\n");

let out = read("app.tpl.html");
for (const slot of ["/*__ENGINE__*/", "/*__LESSONS__*/"]) {
  if (!out.includes(slot)) throw new Error("template is missing " + slot);
}
out = out.replace("/*__ENGINE__*/", engine).replace("/*__LESSONS__*/", course);

if (out.includes("module.exports")) throw new Error("a node export leaked into the build");
if (out.includes("/*__")) throw new Error("an unfilled placeholder survived");

const dest = path.join(__dirname, "index.html");
fs.writeFileSync(dest, out);
console.log("built index.html  " + (out.length / 1024).toFixed(0) + "kb  (" + course.split("\n").length + " lines of course, " + engine.split("\n").length + " lines of engine)");
