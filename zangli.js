/*!
 * zangli - v1.1 - 2026-09-09
 * Copyright Stone Huang and other contributors
 * https://github.com/stonelf/zangli
 * 本项目提供1951年1月8日到2051年2月11日之间到公历藏历对照查询。数据来源于《藏历、公历、农历对照百年历书（1951-2050）》
 *
 * 期二重构（2026-09-09）：数据/算法分离
 *   - 缺日闰日表（specialDays）移至 wxapp/zangli/data/special-days.js
 *   - 日月食数据（eclipseList）移至 wxapp/zangli/data/eclipse-list.js
 *   - 本文件仅保留算法 + UMD 外壳
 */

/* 缺日闰日表语义：
 * 第一层代表一年，第二层代表一月。
 * 数组中负数表示当天缺日，正数表示当天闰日
 * 0表示该月是个闰月。
 * 空数组表示该月没有闰日没有缺日(吉祥月)。
 * 从铁虎年十二月初一（1951.1.8）开始推算。
 */

/*方法说明
 *@method getZangli
 *@param{String,Date,Number}p 可以转换成标准日期的入参
 *@return {
 * @value 藏历日期
 * @extraInfo 附加信息
 * @month 藏历月份信息
 * @tMonth 藏历月份名
 * @day 藏历日期
 * @dayLeap 这一天为闰日
 * @monthLeap 这个月是闰月
 * @dayMiss 这一天藏历缺日，往后顺推一天
 * }
*/

(function (global, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    // Node / npm 包 / 测试
    var sd = require("./wxapp/zangli/data/special-days");
    var el = require("./wxapp/zangli/data/eclipse-list");
    module.exports = factory(sd, el);
  } else {
    // 浏览器：数据已先于本文件被 <script defer> 加载到 window.ZANGLI_DATA
    var data = global.ZANGLI_DATA || {};
    var api = factory(data, data);
    global.zangli = api;
    // 兼容旧 HTML：index.html / zangli.html 仍以顶层 var 形式引用
    // startDate / endDate / getZangli / getEclipse。挂到 window 维持兼容。
    global.startDate = new Date(data.startDate);
    global.endDate   = new Date(data.endDate);
    global.getZangli = api.getZangli;
    global.getEclipse = api.getEclipse;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (sd, el) {
  "use strict";

  var specialDays = sd.specialDays;
  var startDate   = new Date(sd.startDate);
  var endDate     = new Date(sd.endDate);
  var eclipseList = el.eclipseList;
  var eclipseType = el.eclipseType;

  function getZangli(p) {
    var d = p;
    if (typeof d == "undefined" || d == "") {
      d = new Date();
    }
    if (typeof d == "string") {
      d = new Date(d);
      if ("Invalid Date" == d.toString()) {
        console.error("错误：\"" + p + "\" 字符串的日期格式不对");
        return "error";
      }
    }
    if (typeof d == "number") {
      console.warn("警告：尝试把数字 " + p + " 按毫秒转换成日期");
      d = new Date(d);
    }

    if (d.constructor != Date) {
      console.error("错误：只能接受日期类型数字类型或者标准格式的字符串类型输入,当前输入的是" + p.constructor.toString());
      return { value: "error" };
    }
    // 抹掉时分秒：否则带时间的入参会被下面的 Math.round 舍入到下一天
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (d.getTime() < startDate.getTime()) {
      console.error("错误:不能转换早于" + startDate.getFullYear() + "年" + (startDate.getMonth() + 1) + "月" + startDate.getDate() + "日的日期");
      return { value: "error" };
    }
    if (d.getTime() >= (endDate.getTime() + 86400000)) {
      console.error("错误:不能转换晚于" + endDate.getFullYear() + "年" + (endDate.getMonth() + 1) + "月" + endDate.getDate() + "日的日期");
      return { value: "error" };
    }

    var days = Math.round((d - startDate) / 86400 / 1000);
    var countingDays = 0;
    var countingMonth = 0;
    for (var years = 0; years < specialDays.length; years++) {
      var leapMonths = 0; // 这一年前面闰了几个月
      for (var months = 0; months < specialDays[years].length; months++) {
        var tDays = 30;
        for (var i = 0; i < specialDays[years][months].length; i++) {
          if (specialDays[years][months][i] < 0)
            tDays--;
          else if (specialDays[years][months][i] > 0)
            tDays++;
          else if (specialDays[years][months][i] == 0)
            leapMonths++;
        }
        if (countingDays + tDays <= days) { // 还没到当前月，直接累加日子
          countingDays += tDays;
        } else {
          var dayLeap = false, dayMiss = false, monthLeap = false;
          var tDays = days - countingDays;
          for (var i = 0; i < specialDays[years][months].length; i++) {
            if (specialDays[years][months][i] == 0) { // 闰月
              monthLeap = true;
            } else {
              var sd = specialDays[years][months][i];
              if (sd + 1 == -tDays) { // 当天缺日
                dayMiss = true;
                tDays++;
              } else if (sd == tDays) { // 当天闰日
                dayLeap = true;
                tDays--;
              } else if (sd > 0 && sd < tDays) { // 前面出现一个闰日
                tDays--;
              } else if (sd < 0 && -sd - 1 < tDays) { // 前面出现一个缺日
                tDays++;
              }
            }
          }
          if (years == 0) {
            months = 12 - specialDays[0].length;
          }
          var result = {};
          result.year = "铁水木火土".substr(Math.floor((years) / 2) % 5, 1) + "虎兔龙蛇马羊猴鸡狗猪鼠牛".substr(years % 12, 1);

          result.month = (monthLeap ? "闰" : "") + ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"][months - leapMonths];
          result.tMonth = (monthLeap ? "闰" : "") + ["神变", "苦行", "具香", "萨嘎", "作净", "明净", "具醉", "具贤", "天降", "持众", "庄严", "满意"][months - leapMonths];
          result.day = (dayLeap ? "闰" : "") + ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"][tDays];
          result.dayLeap = dayLeap;
          result.monthLeap = monthLeap;
          result.dayMiss = dayMiss;
          result.value = result.year + "年" + result.month + "月(" + result.tMonth + "月)" + result.day;
          var extraInfo = "";
          var extraInfo2 = "";
          if (!dayLeap) switch (tDays) {
            case 0:
              if (months == 0) extraInfo = "神变节"; else { extraInfo = "禅定胜王佛节日"; extraInfo2 = "作何善恶成百倍"; }
              break;
            case 3: if (months == 5) extraInfo = "释迦牟尼佛<br>初转法轮日"; break;
            case 6: if (months == 3) extraInfo = "释迦牟尼佛诞辰"; break;
            case 7: extraInfo = "药师佛节日"; extraInfo2 = "作何善恶成千倍"; break;
            case 9: extraInfo = "莲师荟供日"; extraInfo2 = "作何善恶成十万倍"; break;
            case 14:
              if (months == 3) extraInfo = "释迦牟尼佛<br>成道日涅槃日";
              else if (months == 5) extraInfo = "释迦牟尼佛入胎日";
              else extraInfo = "阿弥陀佛节日"; extraInfo2 = "作何善恶成百万倍";
              break;
            case 17: extraInfo = "观音菩萨节日"; extraInfo2 = "作何善恶成千万倍"; break;
            case 19: if (months == 8) extraInfo = "释迦牟尼佛天降日"; break;
            case 20: extraInfo = "地藏王菩萨节日"; extraInfo2 = "作何善恶成亿倍"; break;
            case 24: extraInfo = "空行母荟供日"; break;
            case 29: extraInfo = "释迦牟尼佛节日"; extraInfo2 = "作何善恶成九亿倍"; break;
          }
          result.extraInfo = extraInfo;
          result.extraInfo2 = extraInfo2;
          result.toString = function () {
            return this.value
          }
          return result;
        }
      }
    }
  }

  function eclipse() {
    this.value = "";
    this.extraInfo = "";
    this.toString = function () { return this.value; }
  }
  var eclipseDate = {};
  var ms_oneday = 86400000;
  var ms_8hr = 28800000; // 东八区固定偏移
  /* 日月食时刻记录的是北京时间，所以日期键必须固定按东八区计算。
   * 早期实现用 toDateString()（运行环境本地时区）建键，导致非东八区用户查不到当天的日月食。 */
  function eclipseDayKey(t) {
    var x = new Date(t + ms_8hr);
    return x.getUTCFullYear() + "/" + (x.getUTCMonth() + 1) + "/" + x.getUTCDate();
  }
  /* 查询键取入参的「本地年月日」，把它当作东八区的年月日来查。 */
  function civilDayKey(d) {
    return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
  }
  /* 把时间戳换算成东八区的「X点Y分」 */
  function bjTime(t) {
    var x = new Date(t + ms_8hr);
    return x.getUTCHours() + "点" + x.getUTCMinutes() + "分";
  }
  for (var i = 0; i < eclipseList.length; i++) {
    eclipseDate[eclipseDayKey(eclipseList[i][0])] = eclipseList[i]; // 按照日期映射成哈希表方便查询。
  }

  function getEclipse(date) {
    var result = new eclipse();
    var e = eclipseDate[civilDayKey(date)];
    if (e) {
      result.value = eclipseType[e[1]];
      result.extraInfo2 = "食甚" + bjTime(e[0]);
      if (e.length > 2) {
        result.extraInfo = "初亏" + bjTime(e[2]) + "，" + result.extraInfo2 + "，复圆" + bjTime(e[3]);
      } else {
        result.extraInfo = result.extraInfo2;
      }
    }
    return result;
  }

  return {
    getZangli: getZangli,
    getEclipse: getEclipse
  };
});

if (typeof zangli_callback == "function") {
  zangli_callback();
}
