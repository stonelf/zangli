// 期二：6 子套件共用的加载器 / 断言工具
// 单一数据源：test/run.js 顺序 spawn 跑各子套件，lib 是单例，pass/fail 跨文件累加

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

let pass = 0;
let fail = 0;

function check(label, ok, detail) {
  if (ok) {
    pass++;
    console.log("  \u2713 " + label);
  } else {
    fail++;
    console.log("  \u2717 " + label + (detail ? "  [" + detail + "]" : ""));
  }
}

// 主库：UMD 在 Node 端走 module.exports 分支
// 同时屏蔽主库自带的 console.error/warn（越界/格式错误时主库会主动输出）
function loadMain() {
  const main = require.resolve(path.join(ROOT, "zangli.js"));
  delete require.cache[main];
  const origErr = console.error, origWarn = console.warn;
  console.error = function () {};
  console.warn = function () {};
  let api;
  try { api = require(main); } finally {
    console.error = origErr;
    console.warn = origWarn;
  }
  return api;
}

// 小程序：用 vm 沙箱注入 require/getApp/Page/wx mock 让 pages/index/index.js 跑起来
function loadWx() {
  const fs2 = require("fs");
  const vm = require("vm");
  const wxPath = path.join(ROOT, "wxapp/zangli/pages/index/index.js");
  const src = fs2.readFileSync(wxPath, "utf8");
  const ctx = {
    console: { error() {}, warn() {}, log() {} },
    Date, Object, Array, Math, JSON, Number, String, Boolean, RegExp, Error,
    require: (id) => {
      const abs = id.startsWith(".") ? path.resolve(path.dirname(wxPath), id) : id;
      delete require.cache[abs];
      return require(abs);
    },
    getApp: () => ({ globalData: {} }),
    Page: function () {},
    App: function () {},
    wx: {
      reportMonitor() {},
      getSystemInfoSync() { return {}; },
      cloud: { init() {} },
      vibrateLong() {}, vibrateShort() {},
      navigateBack() {}, navigateTo() {},
      showToast() {}, showModal() {},
      hideLoading() {}, showLoading() {},
      setStorageSync() {}, getStorageSync() { return ""; }, removeStorageSync() {},
    },
  };
  ctx.global = ctx;
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return { getZangli: ctx.getZangli, getEclipse: ctx.getEclipse };
}

const ANCHORS = [
  ["2026-02-18", "\u94c1\u9a6c\u5e74\u6b63\u6708\u521d\u4e00"],
  ["2025-02-28", "\u6728\u86c7\u5e74\u6b63\u6708\u521d\u4e00"],
  ["2024-02-10", "\u9f99\u5e74\u6b63\u6708\u521d\u4e00"],
  ["2023-02-21", "\u6c34\u5154\u5e74\u6b63\u6708\u521d\u4e00"],
  ["2019-02-05", "\u571f\u8c6c\u5e74\u6b63\u6708\u521d\u4e00"],
  ["1951-02-07", "\u94c1\u5154\u5e74\u6b63\u6708\u521d\u4e00"],
];

const ECLIPSE_DATES = [
  "2025-09-08", "2024-10-03", "2023-04-20", "2022-11-08",
  "2022-05-01", "2021-12-04", "2021-06-10", "2020-06-21",
];

function run(name, fn) {
  console.log("\n=== " + name + " ===");
  fn(check);
  console.log("  [" + name + " \u5b50\u8ba1] \u901a\u8fc7 " + pass + " / \u5931\u8d25 " + fail);
}

function getCounters() {
  return { pass, fail };
}

module.exports = {
  ROOT,
  check,
  loadMain,
  loadWx,
  ANCHORS,
  ECLIPSE_DATES,
  run,
  getCounters,
};
