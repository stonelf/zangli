// 范围与全量往返：1951-01-08 ~ 2051-02-10 全期不报错
//   - 上界 2051-02-11 仍能查
//   - 2051-02-12 越界返回 error
//   - search \u6b7b\u94fe\u9759\u6001\u5224\u65ad\uff08index.js / wxml \u90fd\u4e0d\u80fd\u542b \u201csearch\u201d \u51fd\u6570/\u5f15\u7528\uff09
const lib = require("./lib");

lib.run("range", (check) => {
  const M = lib.loadMain();
  const W = lib.loadWx();

  // \u4e0a\u754c\u9a8c\u8bc1
  const m2051 = M.getZangli(new Date("2051-02-11T00:00:00"));
  check("main 2051-02-11 \u4ecd\u53ef\u67e5", m2051.day !== undefined && m2051.day !== "error", m2051.value);

  // 2051-02-12 \u8d8a\u754c\uff0cgetZangli \u5e94\u8fd4\u56de {value:"error"}
  const mEnd = M.getZangli(new Date("2051-02-12T00:00:00"));
  check("main 2051-02-12 \u8d8a\u754c\u8fd4\u56de error", mEnd.value === "error", mEnd.value);

  // \u4e0b\u754c
  const mLow = M.getZangli(new Date("1951-01-08T00:00:00"));
  check("main 1951-01-08 \u8d77\u9519\u53ef\u67e5", mLow.day !== undefined && mLow.day !== "error", mLow.value);
  const mLowOut = M.getZangli(new Date("1951-01-07T00:00:00"));
  check("main 1951-01-07 \u8d8a\u4e0b\u754c\u8fd4\u56de error", mLowOut.value === "error", mLowOut.value);

  // \u5168\u91cf\u5f80\u8fd4 1951-01-08 ~ 2051-02-10
  let bad = 0;
  const total = Math.round((new Date(2051, 1, 10) - new Date(1951, 0, 8)) / 86400000) + 1;
  for (let d = new Date(1951, 0, 8); d <= new Date(2051, 1, 10); d.setDate(d.getDate() + 1)) {
    const r = M.getZangli(new Date(d));
    if (r.value === "error") bad++;
  }
  check("main \u5168\u671f " + total + " \u5929 \u65e0 error", bad === 0, bad + " \u4e2a error");

  // search \u6b7b\u94fe\u9759\u6001\u68c0\u67e5\uff08\u671f\u4e00\u5df2\u5220 \u201c\u67e5\u8be2\u201d \u6309\u94ae\uff09
  const wxml = require("fs").readFileSync(lib.ROOT + "/wxapp/zangli/pages/index/index.wxml", "utf8");
  const ixJs = require("fs").readFileSync(lib.ROOT + "/wxapp/zangli/pages/index/index.js", "utf8");
  check("wxml \u4e0d\u542b search \u957f\u6309", !/search/.test(wxml) || /<!--.*search.*-->/.test(wxml),
        "\u542b " + (wxml.match(/search/g) || []).length + " \u5904");
  check("index.js \u4e0d\u542b search() \u51fd\u6570\u5b9a\u4e49", !/^\s*search\s*\(\s*\)\s*\{/m.test(ixJs));
  check("index.js \u4e0d\u542b '../search/search' \u5f15\u7528", !/'\.\.\/search\/search'/.test(ixJs));
});
