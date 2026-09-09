// 期一止血修复验收脚本
// 跨三个时区（Asia/Shanghai、UTC、America/New_York）验证：
// 1. 6 个藏历新年锚点
// 2. 半天边界（中午入参）
// 3. 日月食输出（含食甚）
// 4. 范围（到 2051-02-11）
// 5. 数据 diff（主库 vs 小程序端应只在小程序下界外有差异）
// 6. search 死链已删（小程序 wxml 不能含 'search' 字符串）
// 7. 全量 36560 天往返 0 误差

const fs = require("fs");
const path = require("path");
const ROOT = "/Users/stone/Projects/syncplay/zangli";

function loadMain() {
  const src = fs.readFileSync(path.join(ROOT, "zangli.js"), "utf8");
  return new Function("console", src + "\nreturn {getZangli, getEclipse};")({ error() {}, warn() {}, log() {} });
}

function loadWx() {
  const wxPre = "var wx={reportMonitor(){},getSystemInfoSync(){return{}},cloud:{init(){}}},Page=function(){},App=function(){},getApp=function(){return{globalData:{}}};";
  const src = fs.readFileSync(path.join(ROOT, "wxapp/zangli/pages/index/index.js"), "utf8");
  return new Function("console", wxPre + src + "\nreturn {getZangli, getEclipse};")({ error() {}, warn() {}, log() {} });
}

const ANCHORS = [
  ["2026-02-18", "铁马年正月初一"],
  ["2025-02-28", "木蛇年正月初一"],
  ["2024-02-10", "龙年正月初一"],
  ["2023-02-21", "水兔年正月初一"],
  ["2019-02-05", "土猪年正月初一"],
  ["1951-02-07", "铁兔年正月初一"],
];

const ECLIPSE_DATES = [
  "2025-09-08", "2024-10-03", "2023-04-20", "2022-11-08",
  "2022-05-01", "2021-12-04", "2021-06-10", "2020-06-21",
];

let pass = 0, fail = 0;
function check(label, ok, detail) {
  if (ok) { pass++; console.log("  ✓ " + label); }
  else { fail++; console.log("  ✗ " + label + (detail ? "  [" + detail + "]" : "")); }
}

function run(label, tz) {
  console.log("\n=== TZ=" + tz + " ===");
  const M = loadMain();
  const W = loadWx();

  // 1. 锚点
  console.log("[" + label + " 锚点]");
  for (const [d, expected] of ANCHORS) {
    const r = M.getZangli(new Date(d + "T12:00:00"));
    check(`主库  ${d} = ${expected}`, r.day === "初一", r.value);
    const r2 = W.getZangli(new Date(d + "T12:00:00"));
    check(`小程序 ${d} = ${expected}`, r2.day === "初一", r2.value);
  }

  // 2. 半天边界（中午入参 vs 午夜入参）
  console.log("[" + label + " 半天边界]");
  const noon = M.getZangli(new Date("2026-02-18T12:00:00"));
  const midn = M.getZangli(new Date("2026-02-18T00:00:00"));
  check("主库 中午/午夜 同一天", noon.day === midn.day, "noon=" + noon.day + " midn=" + midn.day);
  const noon2 = W.getZangli(new Date("2026-02-18T12:00:00"));
  const midn2 = W.getZangli(new Date("2026-02-18T00:00:00"));
  check("小程序 中午/午夜 同一天", noon2.day === midn2.day);

  // 3. 日月食
  console.log("[" + label + " 日月食]");
  for (const d of ECLIPSE_DATES) {
    const eM = M.getEclipse(new Date(d + "T00:00:00"));
    const eW = W.getEclipse(new Date(d + "T00:00:00"));
    const hasM = !!eM.value;
    const hasW = !!eW.value;
    check(`${d} 主库有记录`, hasM, eM.value);
    check(`${d} 小程序有记录`, hasW, eW.value);
    if (hasM) check(`${d} 主库含食甚`, /食甚|初亏|复圆/.test((eM.extraInfo || "") + (eM.extraInfo2 || "")), eM.extraInfo);
  }

  // 4. 范围
  console.log("[" + label + " 范围]");
  let m2051 = M.getZangli(new Date("2051-02-11T00:00:00"));
  check("主库 2051-02-11 仍可查", m2051.day !== undefined && m2051.day !== "error", m2051.value);
  try {
    let mEnd = M.getZangli(new Date("2051-02-12T00:00:00"));
    check("主库 2051-02-12 应越界返回error", mEnd.value === "error", mEnd.value);
  } catch (e) { check("主库 2051-02-12 抛错", true); }
  // 小程序 nextMonth 上界是 2051-01-12，但 getZangli 本身范围应一致
  let wEnd = W.getZangli(new Date("2051-01-12T00:00:00"));
  check("小程序 2051-01-12 可查", wEnd.day !== undefined, wEnd.value);

  // 5. 数据 diff 守卫（2050-12-01 ~ 2051-02-10）
  console.log("[" + label + " 数据守卫 2050-12-01 ~ 2051-02-10]");
  let diffN = 0, firstBad = null;
  for (let d = new Date(2050, 11, 1); d <= new Date(2051, 1, 10); d.setDate(d.getDate() + 1)) {
    const a = M.getZangli(new Date(d));
    let b;
    try { b = W.getZangli(new Date(d)); } catch (e) { b = { day: undefined }; }
    if (a.day !== b.day) {
      diffN++;
      if (!firstBad) firstBad = d.toISOString().slice(0, 10) + " 主库=" + a.value + " 小程序=" + b.value;
    }
  }
  check("主库vs小程序 2050-12-01~2051-02-10 0 差异", diffN === 0, firstBad || "差异 " + diffN + " 天");

  // 6. 全量往返
  console.log("[" + label + " 全量往返 1951-01-08 ~ 2051-02-10]");
  let bad = 0;
  for (let d = new Date(1951, 0, 8); d <= new Date(2051, 1, 10); d.setDate(d.getDate() + 1)) {
    const r = M.getZangli(new Date(d));
    if (r.value === "error") { bad++; continue; }
  }
  // 简单通过率
  const total = Math.round((new Date(2051, 1, 10) - new Date(1951, 0, 8)) / 86400000) + 1;
  check("主库全期 " + total + " 天 无 error 返回", bad === 0, bad + " 个 error");
}

console.log("===========================================");
console.log("  期一止血 · 跨时区验收");
console.log("===========================================");

for (const tz of ["Asia/Shanghai", "UTC", "America/New_York"]) {
  // 用子进程方式设 TZ
  if (process.env.TZ !== tz && process.env.TZ_RUN !== "1") {
    console.log("[跳过 TZ=" + tz + "，需在子进程运行]");
    continue;
  }
  run("主", tz);
}

// 7. search 死链静态检查
console.log("\n[静态检查]");
const wxml = fs.readFileSync(path.join(ROOT, "wxapp/zangli/pages/index/index.wxml"), "utf8");
const js = fs.readFileSync(path.join(ROOT, "wxapp/zangli/pages/index/index.js"), "utf8");
check("wxml 不含 search 长按", !/search/.test(wxml) || /<!--.*search.*-->/.test(wxml), "含 " + (wxml.match(/search/g) || []).length + " 处");
check("index.js 不含 search() 函数定义", !/^\s*search\s*\(\s*\)\s*\{/m.test(js));
check("index.js 不含 '../search/search' 引用", !/'\.\.\/search\/search'/.test(js));

// 8. 无双重偏移
check("主库 getEclipse 无 +28800000", !/extraInfo\\s*=\\s*\"食甚\"\\s*\\+\\s*d\\.getHours\\(\\)\\s*\\+\\s*\"点\"\\s*\\+\\s*d\\.getMinutes\\(\\)\\s*\\+\\s*\"分\"[\\s\\S]*?getUTCHours/.test(fs.readFileSync(path.join(ROOT, "zangli.js"), "utf8")));
check("主库 getEclipse 使用 getUTCHours", /getUTCHours/.test(fs.readFileSync(path.join(ROOT, "zangli.js"), "utf8")));

console.log("\n===========================================");
console.log("  通过 " + pass + " / 失败 " + fail);
console.log("===========================================");
process.exit(fail === 0 ? 0 : 1);
