//index.js
const app = (typeof getApp === 'function') ? getApp() : { globalData: {} }
var touchDot,touchMove,touchTime;
wx.reportMonitor('0', 1);
if (typeof Page === 'function') Page({
  data: {
    currentMonth:"",
    currentDate:"",
    tibetenMonth:"",
    zangliData: [],
    arrowup: "-1.25",
    arrowdown: "arrow-hide"
  },
  onLoad: function () {
    var data= getZangliData();
    this.setData(data);
  },
  // 触摸开始事件 
  touchStart: function (e) {
    touchDot = {
      x: e.touches[0].pageX, 
      y: e.touches[0].pageY
      }; // 获取触摸时的原点 
    touchTime= new Date();
  },
  // 触摸移动事件 
  touchMove: function (e) {
    touchMove = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY
    };
    var y = touchDot.y - touchMove.y;
    if (y<=0 &&  y >= -50) {
      var d = this.data;
      d.arrowup = -1.25-y/40;
      this.setData(d);
    } else if (y < -50) {
      var d = this.data;
      d.arrowup = 0;
      this.setData(d);
    }else if (y > 50) {
      var d = this.data;
      d.arrowdown = "arrow-show";
      this.setData(d);
    } else if (Math.abs(y) <= 50) {
      var d = this.data;
      d.arrowup="-1.25";
      d.arrowdown = "arrow-hide";
      this.setData(d);
    }
  },
  // 触摸结束事件 
  touchEnd: function (e) {
    if (!touchMove) return;
    if((new Date()-touchTime)>100 &&  Math.abs(touchDot.y-touchMove.y)>50){

      if(touchDot.y>touchMove.y){
        this.nextMonth();
      }else{
        this.previousMonth();
      }
      touchMove=null;
    }else{
      var d = this.data;
      d.arrowup = "-1.25";
      d.arrowdown = "arrow-hide";
      this.setData(d);
    }
  }, 
  previousMonth: function(){
    var d=new Date(this.data.currentDate);
    d.setMonth(d.getMonth()-1);
    // 不能早于数据起始月（1951-01）。原先硬编码 1951/2/1，会漏掉 1951 年 1 月
    if(d >= new Date(startDate.getFullYear(), startDate.getMonth(), 1)){
      this.setData(getZangliData(d));
    }
  },
 nextMonth: function() {
   var d = new Date(this.data.currentDate);
   d.setMonth(d.getMonth() + 1);
   // 不能晚于数据截止月（2051-02）。原先硬编码 2051/1/12，会少掉藏历铁马年十二月整整一个月
   if (d <= new Date(endDate.getFullYear(), endDate.getMonth(), 1)){
     this.setData(getZangliData(d));
   }
 },
  datePickerBindchange:function(e){
    var d = new Date(e.detail.value);
    this.setData(getZangliData(d));
  }
})
var cache={};
function getZangliData(d) {
  wx.reportMonitor('1', 1);
  if (!d) d = new Date();
  if(cache[d.getFullYear()+"/"+d.getMonth()]){
    console.log("cached!")
    return cache[d.getFullYear() + "/" + d.getMonth()];
  } 
  var result = {extraInfo:[]};
  var d0 = new Date(d.getFullYear(), d.getMonth(), 1),//月初
  d1 = new Date(d.getFullYear(), d.getMonth() + 1, 0)//月末
  if (d0 < startDate) d0 = startDate;
  if (d1 > endDate) d1 = endDate;
  result.currentMonth = d0.getFullYear() + "年" + (d0.getMonth() + 1) + "月";
  var td0=getZangli(d0),td1=getZangli(d1);
  result.currentDate = d0;

  result.tibetenMonth = td0.year+"年"+td0.month +"月 到 "+(td0.year==td1.year?"":td1.year+"年")+td1.month+"月";
  result.zangliData=[[]];
  for (var i = 0; i < d0.getDay(); i++) {
    result.zangliData[0].push({ year: "　", month: "", date: "　",class:"td"},);
  }

  for (var i = d0.getDate(); i <= d1.getDate(); i++) {
    var d3 = new Date(d.getFullYear(), d.getMonth(), i);
    if (d3.getDay() == 0) {
      result.zangliData.push([]);
    }
    var z = getZangli(d3);
    var ecl = getEclipse(d3);
    var isToday = d3.getFullYear()==new Date().getFullYear() &&d3.getMonth()==new Date().getMonth() &&d3.getDate()==new Date().getDate();
    var t = { year: "　", month: "", date: z.day,day:i};
    if (i == d0.getDate() || z.day == "初一" || (z.day == "初二" && z.dayMiss)) {
      t.month= z.month+"月";
    }
    if (z.month == '正' && !z.monthLeap && z.day == "初一" || (z.day == "初二" && z.dayMiss)){
      t.year=z.year+"年";
    }else if(z.value!="error"){
      t.year=i;
    }
    t.class="td";
    if (ecl.value != "") {
      t.month=ecl.value;
      result.extraInfo.push(
        d3.getFullYear() + "年" + (d3.getMonth() + 1) + "月" + d3.getDate() + "日 "+ecl.value+"，"+
        ecl.extraInfo
        );
      t.class=/日/.test(ecl.value)?"td solar-eclipse":"td lunar-eclipse";
    }else{
      if(isToday)
        t.class="td today"
    }
    result.zangliData[result.zangliData.length - 1].push(t);
  }
  for (var i = d3.getDay(); i < 6; i++) {
    result.zangliData[result.zangliData.length-1].push({ year: "　", month: "", date: "　",class:"td"});
  }
  
  result.extraInfo = result.extraInfo.join("\n");
  result.arrowdown= "arrow-hide";
  result.arrowup="-1.25";
  cache[d.getFullYear() + "/" + d.getMonth()]=result;
  return result;
}
function checkLine(t){
  if (t) {
    var m = false;
    for (var j = 0; j < t.length; j++) {
      if (t[j].month.length > 0) m = true;
    }
    if (m) {
      for (var j = 0; j < t.length; j++) {
        if (t[j].month.length == 0) t[j].month = " ";
      }
    }
  }


}
/*!
 * zangli - v1.0 - 2019-01-29
 * Copyright Stone Huang and other contributors
 * https://github.com/stonelf/zangli
 * 本项目提供1951年1月8日到2051年1月12日之间到公历藏历对照查询。数据来源于《藏历、公历、农历对照百年历书（1951-2050）》
 */

/* 缺日闰日表
 * 第一层代表一年，第二层代表一月。
 * 数组中负数表示当天缺日，正数表示当天闰日
 * 0表示该月是个闰月。
 * 空数组表示该月没有闰日没有缺日(吉祥月)。
 * 从铁虎年十二月初一（1951.1.8）开始推算。
 */

/* 期二重构（2026-09-09）：数据从 wxapp/zangli/data/ 共享，wxapp/、主库、测试三方 require 同一份 */
var _sd = require('../../data/special-days');
var _el = require('../../data/eclipse-list');
var specialDays = _sd.specialDays;
var startDate = new Date(_sd.startDate);
var endDate = new Date(_sd.endDate);
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
    console.info("尝试把数字 " + p + " 按毫秒转换成日期");
    d = new Date(d);
  }

  if (d.constructor != Date) {
    console.error("错误：只能接受日期类型数字类型或者标准格式的字符串类型输入,当前输入的是" + p.constructor.toString());
    return { value: "error" };
  }
  d = new Date(d.getFullYear(), d.getMonth(), d.getDate());//抹掉时分秒	
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
    var leapMonths = 0;//这一年前面闰了几个月
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
      if (countingDays + tDays <= days) { //还没到当前月，直接累加日子
        countingDays += tDays;
      } else {
        var dayLeap = false, dayMiss = false, monthLeap = false;
        var tDays = days - countingDays;
        for (var i = 0; i < specialDays[years][months].length; i++) {
          if (specialDays[years][months][i] == 0) {//闰月
            monthLeap = true;
          } else {
            var sd = specialDays[years][months][i];
            if (sd + 1 == -tDays) {//当天缺日
              dayMiss = true;
              tDays++;
            } else if (sd == tDays) {//当天闰日
              dayLeap = true;
              tDays--;
            } else if (sd > 0 && sd < tDays) {//前面出现一个闰日
              tDays--;
            } else if (sd < 0 && -sd - 1 < tDays) {//前面出现一个缺日
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
        result.tMonth = (monthLeap ? "闰" : "") + ["神变", "苦行", "具香", "萨嘎", "作净", "明净", "具醉", "具贤", "天降", "持众", "庄严", "满意"][months - leapMonths]
        result.day = (dayLeap ? "闰" : "") + ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"][tDays];
        result.dayLeap = dayLeap;
        result.monthLeap = monthLeap;
        result.dayMiss = dayMiss;
        result.value = result.year + "年" + result.month + "月(" + result.tMonth + "月)" + result.day;
        var extraInfo = "",extraInfo2 = "";
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

var eclipseType = _el.eclipseType;
var eclipseList = _el.eclipseList;

function eclipse() {
  this.value = "";
  this.extraInfo = "";
  this.extraInfo2 = "";
  this.toString = function () { return this.value; }
}
var eclipseDate = {};
var ms_oneday = 86400000;
var ms_8hr = 28800000;//东八区固定偏移

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
  eclipseDate[eclipseDayKey(eclipseList[i][0])] = eclipseList[i];//按照日期映射成哈希表方便查询。
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


if (typeof zangli_callback == "function") {
  zangli_callback();
}