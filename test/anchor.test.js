// 6 个藏历年正月初一锚点（含 1951 起锚 + 2026 当下）
const lib = require("./lib");

lib.run("anchor", (check) => {
  const M = lib.loadMain();
  const W = lib.loadWx();
  for (const [d, expected] of lib.ANCHORS) {
    const r = M.getZangli(new Date(d + "T12:00:00"));
    check(`main  ${d} \u2192 ${expected}`, r.day === "\u521d\u4e00", r.value);
    const r2 = W.getZangli(new Date(d + "T12:00:00"));
    check(`wxapp ${d} \u2192 ${expected}`, r2.day === "\u521d\u4e00", r2.value);
  }
});
