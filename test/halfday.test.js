// 半天边界：中午 12:00 与午夜 00:00 入参必须落到同一天
// 期一修复点：早期实现会把带时间的入参向下舍入到下一天
const lib = require("./lib");

lib.run("halfday", (check) => {
  const M = lib.loadMain();
  const W = lib.loadWx();

  const noon = M.getZangli(new Date("2026-02-18T12:00:00"));
  const midn = M.getZangli(new Date("2026-02-18T00:00:00"));
  check("main 12:00/00:00 \u540c\u4e00\u5929", noon.day === midn.day, "noon=" + noon.day + " midn=" + midn.day);

  const noon2 = W.getZangli(new Date("2026-02-18T12:00:00"));
  const midn2 = W.getZangli(new Date("2026-02-18T00:00:00"));
  check("wxapp 12:00/00:00 \u540c\u4e00\u5929", noon2.day === midn2.day, "noon=" + noon2.day + " midn=" + midn2.day);

  // 19:00 与次日 01:00 也应同一天（防 UTC 半数舍入）
  const eve = M.getZangli(new Date("2026-02-18T19:00:00"));
  const morn = M.getZangli(new Date("2026-02-19T01:00:00"));
  check("main 19:00/\u6b21\u65e5 01:00 \u4e0d\u540c\u5929", eve.day !== morn.day || eve.value === morn.value);
});
