/*!
 * zangli/eclipse - 日月食查询页专用
 *
 * 期二重构（2026-09-09）：从 wxapp/zangli/data/eclipse-list.js 共享数据
 *
 * 数据结构 [食甚，类型，初亏、复圆]
 * 由于地球上不通位置看到的初亏复圆的时间会不同，nasa没有提供初亏复圆时间，需要根据地理位置自行换算
 * 根据网传的北京地区的初亏复圆数据补齐了一部分。
 *
 * 注意：getEclipse 实现与 zangli.js 略有不同，本页支持"一天后有"/"两天后有"提示。
 * 数据本体（eclipseList/eclipseType）与 zangli.js 共用同一份，eclipseType 文案以 zangli.js 版本为准
 * （"金边日食"，用户在 index.html / 小程序长期看到的版本）。
 */

(function (global, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    var el = require("./data/eclipse-list");
    module.exports = factory(el);
  } else {
    var data = global.ZANGLI_DATA || {};
    global.eclipse = factory(data);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (el) {
  "use strict";

  var eclipseList = el.eclipseList;
  var eclipseType = el.eclipseType;

  function eclipse() {
    this.value = "";
    this.extraInfo = "";
    this.toString = function () { return this.value; }
  }
  function getEclipse(date) {
    var result = new eclipse();
    var ms_oneday = 86400000;
    var ms_8hr = ms_oneday / 3;
    for (var i = 0; i < eclipseList.length; i++) {
      var d = new Date(eclipseList[i][0] + ms_8hr); // 把月食的时间转换成东八区的时间来获得日期
      if (d.toDateString() == date.toDateString()) {
        result.value = "有" + eclipseType[eclipseList[i][1]];
        result.extraInfo = "食甚" + d.getUTCHours() + "点" + d.getUTCMinutes() + "分";
        result.extraInfo2 = "";
        if (eclipseList[i].length > 2) {
          result.extraInfo2 = result.extraInfo;
          d = new Date(eclipseList[i][2] + ms_8hr);
          result.extraInfo = "初亏" + d.getUTCHours() + "点" + d.getUTCMinutes() + "分";
          d = new Date(eclipseList[i][3] + ms_8hr);
          result.extraInfo += "，复圆" + d.getUTCHours() + "点" + d.getUTCMinutes() + "分";
        }
      }
      d = new Date(eclipseList[i][0] + ms_8hr - ms_oneday);
      if (d.toDateString() == date.toDateString())
        result.extraInfo = "一天后有" + eclipseType[eclipseList[i][1]];
      d = new Date(eclipseList[i][0] + ms_8hr - ms_oneday * 2);
      if (d.toDateString() == date.toDateString())
        result.extraInfo = "两天后有" + eclipseType[eclipseList[i][1]];
    }
    return result;
  }

  return {
    getEclipse: getEclipse,
    eclipse: eclipse
  };
});
