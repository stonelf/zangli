# 公历 / 藏历转换工具

[![npm](https://img.shields.io/npm/v/zangli.svg)](https://www.npmjs.com/package/zangli)
[![CI](https://github.com/stonelf/zangli/actions/workflows/test.yml/badge.svg)](https://github.com/stonelf/zangli/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

公历 ↔ 藏历对照查询 + 日月食查询，数据范围 **1951-01-08 ~ 2051-02-11**。
数据来源：[《藏历、公历、农历对照百年历书（1951-2050）》](https://item.jd.com/11574570.html)。
日月食数据来源 NASA Five Millennium Canon，部分初亏/复圆时刻由北京地区实测数据补齐。

UMD 打包，**Node / 浏览器 / 微信小程序** 三端通用同一份源码。

## 安装

```bash
npm install zangli
```

或直接 clone 本仓库，UMD 文件直接 `<script>` 引用即可。

## 使用

### Node / npm

```js
const zangli = require("zangli");
console.log(zangli.getZangli(new Date("2026-02-18T12:00:00")).value);
// → 火马年正月(神变月)初一
console.log(zangli.getEclipse(new Date("2025-09-08T00:00:00")).value);
// → 日全食
```

### 浏览器

```html
<script defer src="https://unpkg.com/zangli/data/special-days.js"></script>
<script defer src="https://unpkg.com/zangli/data/eclipse-list.js"></script>
<script defer src="https://unpkg.com/zangli/zangli.js"></script>
<script>
  document.write(getZangli(new Date("2026-02-18T12:00:00")).value);
  // startDate / endDate / getZangli / getEclipse 挂在 window 上
</script>
```

### 微信小程序

小程序目录下已经有完整工程 `wxapp/zangli/`，开发者工具直接"导入项目"指向该目录即可。
小程序代码通过 `require('../../data/...')` 加载共享数据，无 npm 依赖。

## API

| 函数 | 入参 | 返回 | 说明 |
|---|---|---|---|
| `getZangli(date)` | `Date` / `string` / `number`（毫秒） | `ZangliInfo \| "error"` | 越界（早于 1951-01-08 或晚于 2051-02-11）返回字符串 `"error"` |
| `getEclipse(date)` | 同上 | `EclipseInfo`（无食时 `value === ""`） | 入参本地年月日按东八区日历查 |

`ZangliInfo` 字段：`year` / `month` / `tMonth` / `day` / `dayLeap` / `monthLeap` / `dayMiss` / `value` / `extraInfo` / `extraInfo2`。
详情见 [index.d.ts](./index.d.ts)。

## 浏览器 demo

- [http://www.zangli.pro](http://www.zangli.pro)（月历视图）
- [index.html](./index.html)（日历）
- [zangli.html](./zangli.html)（单日查询）
- [eclipse.html](./eclipse.html)（日月食）

## 测试

```bash
# 当前时区（CI 默认）
npm test

# 跨三个时区跑全测（库内日食按东八区换算，必须跨时区验证 TZ 实现正确）
npm run test:tz
# 等价于：
for tz in Asia/Shanghai UTC America/New_York; do
  TZ=$tz node test/run.js
done
```

CI 已在 GitHub Actions [`.github/workflows/test.yml`](.github/workflows/test.yml) 配置三时区矩阵。

测试分 6 个子套件：

| 套件 | 覆盖 |
|---|---|
| `test/anchor.test.js` | 6 个藏历年正月初一锚点 |
| `test/halfday.test.js` | 半天边界（中午 / 午夜 / 跨夜入参） |
| `test/leap.test.js` | 闰月 / 闰日 / 缺日 |
| `test/eclipse.test.js` | 日月食输出与食甚时刻，getEclipse 时区实现静态检查 |
| `test/range.test.js` | 1951-01-08 ~ 2051-02-10 全量往返 + 上下界 + search 死链静态 |
| `test/diff.test.js` | 主库 vs 小程序 2050-12-01 ~ 2051-02-10 数据守卫 |

## 数据文件

`data/` 是符号链接 → `wxapp/zangli/data/`，所有端（Node 测试 / 微信小程序 / 浏览器）实际加载同一份真实数据。
发布到 npm 时 npm 解析软链，tarball 里 `data/` 是真实文件。

## License

[MIT](./LICENSE.md)
