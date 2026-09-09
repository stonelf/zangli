// 日月食：覆盖数据呈现与「食甚」时刻必出
//   - 8 个近期日月食，主库 / 小程序两端都能查到
//   - 食甚 / \u521d\u4e8f / \u590d\u5706 \u5b57\u6bb5\u51fa\u73b0
//   - 主库 getEclipse 不再用 toDateString() 取\u9521\u51fa\u73b0\u9519\u4f4d\uff0c\u4e0d\u518d\u6709 +28800000 \u53cc\u91cd\u504f\u79fb
const lib = require("./lib");

lib.run("eclipse", (check) => {
  const M = lib.loadMain();
  const W = lib.loadWx();

  for (const d of lib.ECLIPSE_DATES) {
    const eM = M.getEclipse(new Date(d + "T00:00:00"));
    const eW = W.getEclipse(new Date(d + "T00:00:00"));
    const hasM = !!eM.value;
    const hasW = !!eW.value;
    check(`${d} main \u6709\u8bb0\u5f55`, hasM, eM.value);
    check(`${d} wxapp \u6709\u8bb0\u5f55`, hasW, eW.value);
    if (hasM) {
      const allInfo = (eM.extraInfo || "") + (eM.extraInfo2 || "");
      check(`${d} main \u542b\u98df\u751a/\u521d\u4e8f/\u590d\u5706`, /\u98df\u751a|\u521d\u4e8f|\u590d\u5706/.test(allInfo), allInfo);
    }
  }

  // \u9759\u6001\u68c0\u67e5\uff1a\u4e3b\u5e93\u4e0d\u518d\u6709\u53cc\u91cd\u504f\u79fb
  const mainSrc = require("fs").readFileSync(lib.ROOT + "/zangli.js", "utf8");
  check("main getEclipse \u4f7f\u7528 getUTCHours", /getUTCHours/.test(mainSrc));
  check("main getEclipse \u65e0 \u201c\u98df\u751a\u201d+\u672c\u5730\u65f6 + \u201c\u70b9\u201d + getUTCHours \u53cc\u91cd\u504f\u79fb",
        !/extraInfo\s*=\s*"\u98df\u751a"\s*\+\s*d\.getHours\s*\(\)\s*\+\s*"\u70b9"/.test(mainSrc));
  // eclipse.js \u540c\u6837\u68c0\u67e5
  const eclSrc = require("fs").readFileSync(lib.ROOT + "/eclipse.js", "utf8");
  check("eclipse.js \u4f7f\u7528 getUTCHours", /getUTCHours/.test(eclSrc));
  check("eclipse.js \u65e0 getHours() \u672c\u5730\u504f\u79fb",
        !/getHours\s*\(\s*\)/.test(eclSrc));
});
