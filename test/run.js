// \u4e2d\u63a7\uff1a\u987a\u5e8f spawnSync 8 \u4e2a\u5b50\u5957\u4ef6\uff0c\u7edf\u8ba1\u603b\u8ba1
//   - \u9879\u76ee\u811a\u672c npm test \u8c03\u672c\u6587\u4ef6
//   - \u4e09\u65f6\u533a\u8c03\u5ea6\u7531 CI / \u5916\u5c42 shell \u5b8c\u6210\uff08TZ=... node test/run.js\uff09
const { spawnSync } = require("child_process");
const path = require("path");

const SUITES = ["anchor", "halfday", "leap", "eclipse", "range", "diff"];

let totalPass = 0;
let totalFail = 0;

const tzLabel = process.env.TZ ? "[TZ=" + process.env.TZ + "] " : "";

console.log("\n===========================================");
console.log("  " + tzLabel + "zangli \u671f\u4e8c\u9a8c\u6536 \u00b7 \u8de8\u5957\u4ef6");
console.log("===========================================");

for (const name of SUITES) {
  const r = spawnSync(process.execPath, [path.join(__dirname, name + ".test.js")], {
    encoding: "utf8",
  });
  process.stdout.write(r.stdout || "");
  if (r.stderr) process.stderr.write(r.stderr);
  const m = (r.stdout || "").match(/\u901a\u8fc7 (\d+) \/ \u5931\u8d25 (\d+)/g) || [];
  if (m.length > 0) {
    const last = m[m.length - 1].match(/\u901a\u8fc7 (\d+) \/ \u5931\u8d25 (\d+)/);
    if (last) {
      totalPass += parseInt(last[1], 10);
      totalFail += parseInt(last[2], 10);
    }
  }
  if (r.status !== 0) {
    console.log("\n[\u4ed3\u4f0d\u5931\u8d25: " + name + " \u9000\u51fa\u7801 " + r.status + "]");
    process.exit(r.status || 1);
  }
}

console.log("\n===========================================");
console.log("  " + tzLabel + "\u603b\u8ba1 \u2713 " + totalPass + " \u2717 " + totalFail);
console.log("===========================================");
process.exit(totalFail === 0 ? 0 : 1);
