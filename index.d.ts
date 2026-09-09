// TypeScript 声明 — 与 package.json 的 "types" 字段配对
//
// 用法：
//   import zangli = require("zangli");
//   const info: zangli.ZangliInfo = zangli.getZangli(new Date(2026, 1, 18));
//
// 或 ESM 风格：
//   import { getZangli, getEclipse } from "zangli";

declare module "zangli" {
  /**
   * getZangli 返回的藏历日期信息。
   * 失败时直接返回字符串 "error"（与主库行为一致）。
   */
  interface ZangliInfo {
    /** 干支生肖年，如 "铁马" */
    year: string;
    /** 藏历月份名（不含"月"字），闰月带前缀"闰"，如 "正" / "闰四" */
    month: string;
    /** 藏月份名（意译），如 "神变" / "具香" */
    tMonth: string;
    /** 藏历日期名（含"初N/十N/廿N/三十"，闰日带前缀"闰"），如 "初一" / "闰十六" */
    day: string;
    /** 该天是否为闰日（重复一天） */
    dayLeap: boolean;
    /** 该月是否为闰月 */
    monthLeap: boolean;
    /** 该天藏历日期是否缺失（藏历该日不存在，公历日对应被跳过） */
    dayMiss: boolean;
    /** 拼好的完整字符串，如 "铁马年正月(神变月)初一" */
    value: string;
    /** 节日 / 佛诞等附加信息（HTML 安全，含有 <br>） */
    extraInfo: string;
    /** 附加信息的次行（如 "作何善恶成百倍"） */
    extraInfo2: string;
  }

  /**
   * getEclipse 返回的日月食信息。
   * 无食时 value === ""。
   */
  interface EclipseInfo {
    /** 类型描述，如 "日全食" / "月偏食" / "金边日食" */
    value: string;
    /** 起始三段："初亏 17:30，食甚 18:45，复圆 20:00"，无初亏复圆时仅含食甚 */
    extraInfo: string;
    /** 仅含食甚一行 */
    extraInfo2: string;
    /** 兼容主库的 toString */
    toString(): string;
  }

  /**
   * 公历日期 → 藏历信息。
   * 入参：Date 对象 / ISO 字符串 / 毫秒数。返回值结构见 ZangliInfo。
   * 越界（早于 1951-01-08 或晚于 2051-02-11）时返回字符串 "error"。
   */
  export function getZangli(input: Date | string | number): ZangliInfo | "error";

  /**
   * 公历日期 → 当日日月食信息。东八区换算（即使运行环境在其它时区，输入日期按本地年月查东八区日历日）。
   * 入参：Date / 字符串 / 毫秒数。
   */
  export function getEclipse(input: Date | string | number): EclipseInfo;
}

declare module "zangli/eclipse" {
  /**
   * 公历日期 → 日月食信息（与 zangli.getEclipse 略有不同，额外支持 "一天后有" / "两天后有" 提示）。
   */
  export function getEclipse(input: Date | string | number): import("zangli").EclipseInfo;
}
