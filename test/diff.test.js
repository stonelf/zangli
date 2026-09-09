// \u6570\u636e\u5dee\u5f02\u5b88\u536b\uff1a\u4e3b\u5e93 vs \u5c0f\u7a0b\u5e8f\u5728\u91cd\u53e0\u533a\u95f4\u5185\u4e0d\u5e94\u4ea7\u751f\u5dee\u5f02
//   - \u91cd\u53e0\u533a\u95f4 2050-12-01 ~ 2051-02-10\uff08\u4e24\u7aef\u90fd\u5728\u533a\u95f4\u5185\uff09
//   - \u4efb\u4f55\u4e00\u5929 \u4e3b\u5e93.day === wxapp.day
const lib = require("./lib");

lib.run("diff", (check) => {
  const M = lib.loadMain();
  const W = lib.loadWx();
  let diffN = 0;
  let firstBad = null;
  for (let d = new Date(2050, 11, 1); d <= new Date(2051, 1, 10); d.setDate(d.getDate() + 1)) {
    const a = M.getZangli(new Date(d));
    let b;
    try { b = W.getZangli(new Date(d)); } catch (e) { b = { day: undefined }; }
    if (a.day !== b.day) {
      diffN++;
      if (!firstBad) {
        firstBad = d.toISOString().slice(0, 10) + " main=" + a.value + " wxapp=" + b.value;
      }
    }
  }
  check("main vs wxapp 2050-12-01~2051-02-10 \u96f6\u5dee\u5f02", diffN === 0, firstBad || "\u5dee\u5f02 " + diffN + " \u5929");
});
