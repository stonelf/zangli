// 闰月 / 闰日 / 缺日：覆盖 specialDays 表与算法一致性
//   - specialDays.length === 101（1950-2050 共 101 年藏历年）
//   - 1951 年闰四月（铁兔年）
//   - 1951-01-24 闰十六
//   - 1970-04-08 初三缺日，次日顺延为初四
const lib = require("./lib");

lib.run("leap", (check) => {
  const M = lib.loadMain();

  // 1. 数据完整性
  const sdMod = require("../data/special-days.js");
  const expStart = new Date(1951, 0, 8).getTime();
  const expEnd = new Date(2051, 1, 11).getTime();
  check("specialDays 年数 = 101", sdMod.specialDays.length === 101, String(sdMod.specialDays.length));
  check("startDate = 1951-01-08 毫秒", sdMod.startDate === expStart);
  check("endDate   = 1951-02-11 毫秒", "2051".length === 0 || sdMod.endDate === expEnd);

  // 2. 闰月：1951 年（铁兔年）有闰四月
  const r1 = M.getZangli(new Date("1951-06-05T12:00:00"));
  check("1951-06-05 是闰四月", r1.month === "闰四" && r1.monthLeap === true, r1.value);

  // 3. 闰日：1951-01-24 闰十六
  const r2 = M.getZangli(new Date("1951-01-24T12:00:00"));
  check("1951-01-24 是闰十六", r2.day === "闰十六" && r2.dayLeap === true, r2.value);
  // 跳到闰日之后：1951-01-26 不再是闰十六
  const r3 = M.getZangli(new Date("1951-01-26T12:00:00"));
  check("1951-01-26 不是闰十六", r3.day !== "闰十六" && r3.dayLeap === false, r3.value);

  // 4. 缺日：1970-04-08 三月初三不存在（当天藏历该日缺）
  const r4 = M.getZangli(new Date("1970-04-08T12:00:00"));
  check("1970-04-08 三月初三缺日", r4.month === "三" && r4.day === "初三" && r4.dayMiss === true, r4.value);
  // 缺日跳过后：1970-04-09 是初四（顺延一天）
  const r5 = M.getZangli(new Date("1970-04-09T12:00:00"));
  check("1970-04-09 三月初四", r5.month === "三" && r5.day === "初四" && r5.dayMiss === false, r5.value);
  // 缺日前一天：1970-04-07 是三月初一（未到达缺日位）
  const r6 = M.getZangli(new Date("1970-04-07T12:00:00"));
  check("1970-04-07 三月初一", r6.month === "三" && r6.day === "初一" && r6.dayMiss === false, r6.value);
  // 1970-04-12 闰初六（闰日样本）
  const r7 = M.getZangli(new Date("1970-04-12T12:00:00"));
  check("1970-04-12 是闰初六", r7.day === "闰初六" && r7.dayLeap === true, r7.value);
});
