# SVG 图形

> SVG（Scalable Vector Graphics，可缩放矢量图形）是基于 XML 的保留模式矢量图形语言。图形即 DOM，天然无限缩放、可用 CSS/JS 操控，是图标系统、插画、数据图表与描边动画的首选。本章覆盖三种使用方式、基本形状与 path 指令、viewBox 缩放原理、描边动画、渐变与滤镜、symbol/use 复用、三种动画方案与无障碍。

## 目录

- [1. 概念解释](#1-概念解释)
- [2. 语法说明](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（双击即可运行，零依赖）：

| 示例 | 说明 | 路径 |
| --- | --- | --- |
| 形状与 path | 基本形状 + M/L/C/Q/A/Z 指令逐个演示 | ../../examples/html/04-svg/index-01-shapes-path.html |
| viewBox 与描边动画 | 缩放原理 + stroke-dasharray 流水灯 | ../../examples/html/04-svg/index-02-viewbox-stroke.html |
| 渐变与滤镜 | linearGradient/radialGradient + feGaussianBlur 等 | ../../examples/html/04-svg/index-03-gradient-filter.html |
| 图标系统与动画 | symbol/use 复用 + SMIL/CSS/JS 三方案对比 | ../../examples/html/04-svg/index-04-icon-animation.html |

## 1. 概念解释 —— 是什么、解决什么问题、底层原理

### 1.1 是什么

SVG 是 W3C 制定的**矢量图形标记语言**，用 XML 标签描述"如何画"：矩形、圆、路径……它直接写进 HTML（内联 SVG），也可以作为独立 `.svg` 文件引用。与 Canvas 的本质区别：

| 维度 | SVG | Canvas |
| --- | --- | --- |
| 模式 | 保留模式（图形是 DOM 节点，浏览器持续跟踪） | 即时模式（画完即忘，动画须整帧重绘） |
| 缩放 | 无损（矢量描述），改 viewBox 即可 | 放大即模糊（位图） |
| 事件 | 每个图形可绑定 DOM 事件 | 需自己算命中 |
| 性能 | 元素上万时吃力（DOM 开销） | 适合海量元素、逐像素操作 |
| 适用 | 图标、插画、图表、UI 装饰 | 游戏、粒子、图像处理、大场景 |

### 1.2 解决什么问题

- **无限缩放不失真**：一个 16px 图标和 1600px 海报可以共用同一份 SVG，这对多端适配（2x/3x 屏、响应式）是刚需。
- **图形可交互、可样式化**：每个 `<rect>`、`<circle>` 都是元素，可以用 CSS 改颜色、加 hover、绑 click——浏览器免费提供事件系统。
- **体积小、可压缩**：矢量描述往往比等价位图小得多，且可 gzip/手写精简，图标系统普遍用 SVG 替代雪碧图与字体图标。

### 1.3 底层原理

- SVG 文档被解析为一棵 DOM 树，浏览器把每个图形节点光栅化到屏幕；**修改属性（如 `cx`）会触发浏览器自动重绘该元素**，不需要你"清屏重画"。
- 坐标系统分两层：**视口（viewport）**是 SVG 元素在页面上的实际大小；**viewBox** 定义逻辑坐标系。viewBox 通过"平移 + 缩放"映射到视口，这就是 SVG 无限缩放的核心（见 2.4 节）。
- `<defs>` 定义、`<use>` 引用构成内部"组件系统"；`<symbol>` 是带独立 viewBox 的延迟渲染 defs，是图标系统的基石。
- 描边动画原理：`stroke-dasharray` 把线切成"实-空"段，`stroke-dashoffset` 把虚线段整体向前/后推移——把实段长度设为路径总长，动画 offset 从总长到 0，就得到"线条生长"效果。

### 1.4 三种使用方式

1. **内联 SVG**：标签直接写进 HTML。可被页面 CSS/JS 完全控制（能用 `currentColor` 继承文字颜色），图标系统首选。
2. **外链**：`<img src="icon.svg">` 或 CSS `background: url(icon.svg)`。优点是独立缓存、触发不了 XSS；缺点是**无法用外部 CSS/JS 修改其内部元素**（SVG 内部的 `<style>` 仍然生效）。
3. **Data URI**：`background: url("data:image/svg+xml,...")`。省一个 HTTP 请求，适合构建工具内联小图标；注意 `#` 等字符需转义（`%23`）。

## 2. 语法说明 —— 完整语法、属性/参数表、代码片段

### 2.1 基本形状

```html
<svg width="200" height="120" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="50" rx="8" fill="#3b82f6"/>
  <circle cx="130" cy="35" r="25" fill="#ef4444"/>
  <ellipse cx="40" cy="95" rx="28" ry="14" fill="#22c55e"/>
  <line x1="90" y1="70" x2="180" y2="110" stroke="#111" stroke-width="2"/>
  <polyline points="200,10 210,30 220,15" fill="none" stroke="#f59e0b"/>
  <polygon points="30,130 60,150 45,160" fill="#8b5cf6"/> <!-- 闭合区域，自动封口 -->
</svg>
```

| 元素 | 关键属性 | 说明 |
| --- | --- | --- |
| `rect` | x, y, width, height, rx/ry | 矩形；rx/ry 圆角半径 |
| `circle` | cx, cy, r | 圆 |
| `ellipse` | cx, cy, rx, ry | 椭圆 |
| `line` | x1, y1, x2, y2 | 线段（只有 stroke 有意义） |
| `polyline` | points | 折线（不闭合） |
| `polygon` | points | 多边形（自动闭合） |

### 2.2 path 指令详解（重点）

`<path d="...">` 用一条字符串描述任意形状，是 SVG 最强大也最难的部分：

| 指令 | 全称 | 参数 | 说明 |
| --- | --- | --- | --- |
| `M x,y` | MoveTo | 点 | 抬笔移动到起点（不画线） |
| `L x,y` | LineTo | 点 | 画直线到目标点 |
| `H x` / `V y` | 水平/垂直线 | 坐标 | 沿水平/垂直画线（简写） |
| `Q cx,cy x,y` | 二次贝塞尔 | 1 控制点 + 终点 | 抛物线式弧度 |
| `C c1x,c1y c2x,c2y x,y` | 三次贝塞尔 | 2 控制点 + 终点 | 曲线造型主力 |
| `A rx,ry rot large-arc sweep x,y` | Elliptical Arc | 见下 | 圆弧，最难也最常用 |
| `Z` | ClosePath | 无 | 闭合回起点 |

**A（圆弧）指令的 7 个参数**：`rx, ry` 椭圆半径；`rot` 椭圆旋转角；`large-arc-flag`（1=取大弧 / 0=取小弧，两点间有大、小两种弧）；`sweep-flag`（1=顺时针 / 0=逆时针）；最后是终点坐标。例如 `M 20,60 A 40,40 0 0 1 100,60` 从 (20,60) 沿顺时针小弧画到 (100,60)，是一条向上的半圆拱。

小写指令（`m/l/c/a`）表示**相对坐标**（相对上一个点），长路径中更易手算。一个完整例子：

```html
<!-- 从起点出发：三次贝塞尔画波浪 → 圆弧画桥拱 → Z 闭合 -->
<path d="M 10,80 C 40,20 70,20 100,80 S 130,140 160,80"
      fill="none" stroke="#3b82f6" stroke-width="3"/>
<!-- S 指令是 C 的简写：自动镜像上一个控制点，画连续平滑曲线最常用 -->
```

### 2.3 viewBox 与 preserveAspectRatio（关键概念）

```html
<svg width="300" height="150" viewBox="0 0 100 50">
  <circle cx="50" cy="25" r="20" fill="red"/>
</svg>
```

- `viewBox="minX minY width height"` 建立一个**逻辑坐标系**；上面例子里逻辑 100×50 被**等比放大 3 倍**画进 300×150 的视口——圆的逻辑半径 20，实际显示 60px。这就是"一个图标定义一次，到处无损缩放"的原理。
- `preserveAspectRatio` 控制 viewBox 与视口**宽高比不一致**时的对齐与填充策略，格式 `preserveAspectRatio="xMidYMid meet"`：
  - 前段 `xMidYMid`：水平/垂直对齐方式（Min/ Mid / Max）；
  - 后段 `meet`（等比缩放完整显示，可能留白）| `slice`（等比缩放铺满并裁切多余）| `none`（直接拉伸变形）。
- 经验：图标 `<symbol>` 自带 viewBox，引用处只管给尺寸；全屏插画用 `slice` 做类似 background-cover 的效果。

### 2.4 fill / stroke 系列

| 属性 | 说明 |
| --- | --- |
| `fill` | 填充色；**默认是黑**，透明须显式 `fill="none"` |
| `fill-opacity` / `stroke-opacity` | 透明度（也可用 rgba/hex8 颜色） |
| `stroke` | 描边色，默认 none |
| `stroke-width` | 描边宽度（沿路径向两侧扩散） |
| `stroke-linecap` | 端点：`butt` / `round` / `square` |
| `stroke-linejoin` | 转角：`miter` / `round` / `bevel` |
| `stroke-dasharray` | 虚线模式：`5 3` = 实 5 空 3 循环 |
| `stroke-dashoffset` | 虚线起点偏移（**描边动画核心**） |
| `fill-rule` | 填充规则：`nonzero`(默认) / `evenodd`（镂空字/环形常用） |

**描边动画配方**（最经典的 SVG 动画）：

```css
.path {
  /* 1. 总长可用 JS getTotalLength() 精确获得，这里写个足够大的值也可以 */
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;        /* 2. 初始：实段整体推出可视范围 = 看不见 */
  animation: draw 2s ease forwards;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }    /* 3. 偏移归零 → 线条像被"画出来" */
}
```

### 2.5 渐变与 filter

渐变定义在 `<defs>` 里，通过 `fill="url(#id)"` 引用：

```html
<defs>
  <!-- 线性渐变：x1/y1/x2/y2 用百分比定义方向（这里自左向右） -->
  <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#3b82f6"/>
    <stop offset="100%" stop-color="#8b5cf6"/>
  </linearGradient>
  <!-- 径向渐变：模拟球面/光晕 -->
  <radialGradient id="rg" cx="50%" cy="40%" r="60%">
    <stop offset="0%" stop-color="#fff"/>
    <stop offset="100%" stop-color="#2563eb"/>
  </radialGradient>
</defs>
<rect width="100" height="100" fill="url(#lg)"/>
```

filter 用 SVG 滤镜原语（fe 系列）组合出模糊、阴影、发光等效果：

```html
<filter id="blur-shadow" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b"/> <!-- 高斯模糊 -->
  <feOffset in="b" dx="3" dy="5" result="o"/>                    <!-- 偏移出阴影 -->
  <feFlood flood-color="#000" flood-opacity="0.4"/>
  <feComposite in2="o" operator="in" result="s"/>                <!-- 裁出阴影形状 -->
  <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<circle r="30" fill="#22c55e" filter="url(#blur-shadow)"/>
```

**注意 filter 区域**：滤镜默认只作用于元素外接框 ±10%，模糊/阴影会被裁切，通常要放大 `x/y/width/height`（如上例）。CSS `filter` 属性在 SVG 元素上同样可用，简单场景优先用 CSS。

### 2.6 g / defs / use / symbol 复用

```html
<svg style="display:none"> <!-- 图标雪碧图：隐藏的定义集合 -->
  <defs>
    <!-- symbol：自带 viewBox 的"组件模板"，默认不渲染 -->
    <symbol id="icon-home" viewBox="0 0 24 24">
      <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/>
    </symbol>
  </defs>
</svg>
<!-- 任意位置引用：use 复制 symbol 内容，尺寸由 width/height 决定 -->
<svg width="24" height="24"><use href="#icon-home"/></svg>
```

| 元素 | 作用 |
| --- | --- |
| `g` | 分组：子元素共享 transform/fill 等属性，像"图层文件夹" |
| `defs` | 定义区：内部元素不直接渲染，供引用（渐变、滤镜、路径模板） |
| `use` | 引用：可跨同文档引用任意元素/symbol，相当于深拷贝实例 |
| `symbol` | 带 viewBox 的模板 + 懒渲染，专为图标系统设计 |

### 2.7 动画三种方案对比

| 方案 | 写法 | 优点 | 缺点 | 适用 |
| --- | --- | --- | --- | --- |
| SMIL | `<animate>` `<animateTransform>` 等标签 | 无需 JS/CSS；可精确编排时间轴、path morph | 语法繁琐；Chrome 曾宣布弃用（后撤回）；属性可读性差 | 无构建环境的纯 SVG 文件、复杂时间轴 |
| CSS | `@keyframes` + transition | 简单直观；硬件加速 transform/opacity | 无法改路径数据 `d`（Chromium 除外）；不能做路径 morph | hover 效果、描边动画、加载 spinner |
| JS（rAF / Web Animations API / GSAP） | 修改属性 + `requestAnimationFrame` | 最强控制力：沿路径运动、逐帧 morph、与数据联动 | 要写代码；注意自行做 rAF 循环管理 | 交互驱动、数据可视化、复杂编排 |

```html
<!-- SMIL：圆心 cx 从 20 动画到 180，无限往复 -->
<circle cy="30" r="10" fill="#ef4444">
  <animate attributeName="cx" from="20" to="180" dur="2s" repeatCount="indefinite"/>
</circle>
```

### 2.8 无障碍（title/desc/aria）

```html
<svg role="img" aria-labelledby="t d">
  <title id="t">近 30 天销量趋势</title>   <!-- 悬停提示 + 读屏朗读 -->
  <desc id="d">折线整体上升，9 月 1 日达到峰值 420 单</desc>
  ...
</svg>
<!-- 纯装饰性 SVG：加 aria-hidden="true" + focusable="false"，让读屏跳过 -->
```

原则：**承载信息的 SVG 必须有 title/desc**（`<title>` 是 SVG 子元素而非 attribute）；**装饰性 SVG 必须标记 aria-hidden**，否则读屏软件会念出无意义内容。

## 3. 浏览器兼容性

> 以下为大致基线（数据参考 caniuse），使用前请以 caniuse 实时数据为准。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| 内联 SVG / 基本形状 / path | 4+ | 12+ | 3.6+ | 3.1+ | iOS 3.2+ / Android 3+ | 主体能力极稳定 |
| `<img>` 外链 SVG | 4+ | 12+ | 3.6+ | 3.1+ | 全支持 | 外链方式内部元素无法被页面 CSS/JS 控制 |
| `<use>` 跨元素引用 | 4+ | 12+ | 3.6+ | 5.1+ | iOS 5.1+ | 旧版 Safari 对外部文件引用支持差，推荐内联 |
| `viewBox` / `preserveAspectRatio` | 4+ | 12+ | 3.6+ | 3.1+ | 全支持 | 无 |
| `linearGradient / radialGradient` | 4+ | 12+ | 3.6+ | 3.1+ | 全支持 | 渐变单位忘写 % 会按对象包围盒外坐标算 |
| `filter`（SVG 滤镜原语） | 5+ | 12+ | 3.6+ | 5.1+ | 全支持 | 默认滤镜区域会裁切模糊/阴影，需放大 x/y/w/h |
| CSS 动画作用 SVG 属性 | 4+ | 12+ | 3.6+ | 5.1+ | 全支持 | `d` 属性动画仅 Chromium 系稳定支持 |
| SMIL（`<animate>` 等） | 4+ | 12+ | 3.6+ | 5.1+ | 全支持 | Chrome 曾弃用后撤回；Edge Legacy 不支持 |
| `stroke-dasharray/-offset` | 4+ | 12+ | 3.6+ | 5.1+ | 全支持 | Safari 对带小数的 dash 值渲染偶有毛边 |
| `getTotalLength / getPointAtLength` | 4+ | 12+ | 3.6+ | 5.1+ | 全支持 | 仅对图形元素有效，`<g>` 等容器调用会报错 |

**总备注**：SVG 1.1 主体能力自 2012 年前后全绿，是兼容性最好的现代 Web 图形方案之一；差异集中在 SMIL 的态度、CSS 动画 `d` 属性等"锦上添花"特性上。

## 4. 使用场景示例

### 4.1 场景一：基本形状与 path 指令速览

**场景描述**：一页看全六种基本形状与 M/L/C/Q/A/Z 指令画出的图形，作为 path 语法对照表。

**完整代码**（节选，完整版见 [../../examples/html/04-svg/index-01-shapes-path.html](../../examples/html/04-svg/index-01-shapes-path.html)）：

```html
<svg viewBox="0 0 260 140" width="520" role="img" aria-label="path 指令演示">
  <!-- M+Z：移动并闭合，画三角形 -->
  <path d="M 20,30 L 60,30 L 40,10 Z" fill="#3b82f6"/>
  <!-- C：三次贝塞尔画波浪；S 自动镜像控制点，续接平滑曲线 -->
  <path d="M 80,30 C 95,10 110,10 125,30 S 155,50 170,30"
        fill="none" stroke="#ef4444" stroke-width="2"/>
  <!-- Q：二次贝塞尔画抛物拱 -->
  <path d="M 20,110 Q 55,70 90,110" fill="none" stroke="#22c55e" stroke-width="2"/>
  <!-- A：圆弧。0 0 1 = 小弧 + 顺时针 → 向上的半圆拱 -->
  <path d="M 110,110 A 45,45 0 0 1 200,110" fill="none" stroke="#8b5cf6" stroke-width="2"/>
</svg>
```

**逐段注释**：`Z` 让子路径自动回到起点闭合；`C` 的两个控制点"拉扯"曲线，`S` 省去第一个控制点（自动镜像上一个），是画连续平滑曲线的利器；`Q` 只有一个控制点、曲线更"硬"；`A` 的两个 flag 组合决定从两段可能弧中选哪一段。

**预期效果**：蓝色三角形、红色波浪线、绿色抛物拱、紫色圆拱并排展示，直观对比各指令的曲线性格。

### 4.2 场景二：viewBox 缩放原理演示

**场景描述**：同一份 100×50 的 viewBox，放进不同尺寸/比例的视口，观察 meet/slice/none 的差异。见 [../../examples/html/04-svg/index-02-viewbox-stroke.html](../../examples/html/04-svg/index-02-viewbox-stroke.html)。

```html
<!-- 视口 300×100（宽扁），viewBox 100×50（比例 2:1 vs 3:1） -->
<svg width="300" height="100" viewBox="0 0 100 50" preserveAspectRatio="xMidYMid meet">
  <!-- meet：等比放大到"放得下"为止，内容完整但左右留白 -->
</svg>
<svg width="300" height="100" viewBox="0 0 100 50" preserveAspectRatio="xMidYMid slice">
  <!-- slice：等比放大到"铺满"为止，多余部分被裁掉（类似 CSS background-cover） -->
</svg>
<svg width="300" height="100" viewBox="0 0 100 50" preserveAspectRatio="none">
  <!-- none：强行拉伸到视口，图形变形 -->
</svg>
```

**逐段注释**：viewBox 是"逻辑图纸"，视口是"相框"，preserveAspectRatio 决定图纸在相框里的装裱方式；实际项目里图标用默认 meet，全屏背景插画用 slice 实现无失真铺满。

**预期效果**：三个框中同一图案分别呈现"完整留白 / 铺满裁切 / 拉伸变形"，配合网格参考线可看清坐标映射。

### 4.3 场景三：stroke 描边动画（流水灯进度环）

**场景描述**：用 `stroke-dasharray/-offset` 实现"线条生长"：加载进度环、签名动画、流水灯边框都基于它。见 [../../examples/html/04-svg/index-02-viewbox-stroke.html](../../examples/html/04-svg/index-02-viewbox-stroke.html)。

```css
.ring {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 8;
  stroke-linecap: round;
  /* 圆周长 = 2πr = 2π×45 ≈ 283；dasharray 设为周长，实段=整圈 */
  stroke-dasharray: 283;
  stroke-dashoffset: 283;               /* 初始把实段推出去 = 看不见 */
  animation: ring 2.4s ease-in-out infinite alternate;
}
@keyframes ring { to { stroke-dashoffset: 0; } }
```

**逐段注释**：`dasharray: 283` 把线切成"283 实 + 283 空"的循环；`offset` 从 283 递减到 0，实段像蛇一样"爬进"视口——对圆来说就是进度环从 0% 到 100%。真项目用 `getTotalLength()` 取精确周长，避免手算。

**预期效果**：一圈蓝色圆环循环"生长—倒退"，另一条折线以描边动画循环描画，可点击按钮暂停/继续。

### 4.4 场景四：渐变、滤镜与发光按钮

**场景描述**：linearGradient 填充按钮、radialGradient 造球体高光、feGaussianBlur 做霓虹发光。见 [../../examples/html/04-svg/index-03-gradient-filter.html](../../examples/html/04-svg/index-03-gradient-filter.html)。

```html
<filter id="glow">
  <!-- 先把源图形的透明通道模糊，再叠回原图，形成外发光 -->
  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/>
  <feMerge>
    <feMergeNode in="b"/><feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
<circle cx="70" cy="60" r="30" fill="#38bdf8" filter="url(#glow)"/>
```

**逐段注释**：滤镜链是"数据处理管道"，`in/result` 就是管道变量名；发光的本质 = 模糊副本垫底 + 原图叠上；`feMerge` 负责把多层合在一起。

**预期效果**：渐变按钮、高光球、霓虹发光圆与投影方块并排，滤镜区域被正确放大（否则光晕会被裁成方块）。

### 4.5 场景五：symbol/use 图标系统

**场景描述**：定义 4 个 24×24 图标 symbol，页面任意位置用 `<use>` 引用，颜色随文字色自动变化（`fill="currentColor"`）。见 [../../examples/html/04-svg/index-04-icon-animation.html](../../examples/html/04-svg/index-04-icon-animation.html)。

```html
<!-- 隐藏雪碧图（建议放 body 最前面） -->
<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="i-heart" viewBox="0 0 24 24">
    <path d="M12 21s-7.5-4.8-10-9.3C.5 8 2.5 4 6.5 4 9 4 11 5.5 12 7c1-1.5 3-3 5.5-3 4 0 6 4 4.5 7.7C19.5 16.2 12 21 12 21z"/>
  </symbol>
</svg>
<!-- 引用：width/height 决定显示大小；fill=currentColor 继承文字颜色 -->
<button style="color:#ef4444"><svg width="24" height="24"><use href="#i-heart"/></svg>喜欢</button>
```

**逐段注释**：symbol 自带 viewBox，引用处只管尺寸；`currentColor` 让图标颜色 = 按钮 `color`，实现"一份图标、多主题复用"；雪碧图容器加 `display:none` 防止占位。

**预期效果**：一排按钮共用同一组 symbol 定义，图标随文字变色、随按钮 hover 动画，新增图标只需加一个 symbol。

## 5. 实际应用案例分析

### 5.1 案例：中后台系统的 SVG 图标体系

某企业级中后台项目有 200+ 个图标，历史上用过三套方案，踩坑后收敛到"内联 symbol 雪碧图"：

- **字体图标（iconfont）时代**：一包字体全站共用，但图标只能单色、新增要重新打包字体、偶发 FOUT 闪动；亚像素渲染在 Windows 上发糊。
- **雪碧图 + background-position 时代**：改一个图标要重切整张雪碧图，`position` 魔法数字难维护，高分屏对位问题多。
- **SVG symbol 方案（现状）**：构建时把所有 `.svg` 图标合并为一份内联雪碧图注入 HTML；业务处写 `<svg><use href="#icon-xxx"/></svg>`。图标可继承 `currentColor` 实现一键换主题，可对单个 path 做描边动画（如"收藏成功"的心跳），CDN 缓存一份、全站复用。

**踩坑记录**：`<use>` 引用外部文件的写法在旧 Safari/微信 WebView 里不稳，改为构建期全部内联；图标源文件必须统一"24×24 viewBox + 单色 path + currentColor"规范，否则合雪碧图后尺寸错乱；`aria-hidden="true"` 要在组件里默认加，否则读屏重复朗读。

### 5.2 案例：营销 H5 的"长页面手绘风"描边动画

某品牌新品发布 H5：长滚动页面中，产品轮廓线、装饰波浪、数据标注全部"随滚动逐段画出"，最后整体填色点亮。

- **技术选型**：设计师从 AI 导出分层 SVG；开发用 CSS `stroke-dashoffset` 动画 + IntersectionObserver 触发，进入视口才播——比整页 SMIL 时间轴可控、可暂停、可与滚动进度联动。
- **路径长度问题**：`getTotalLength()` 逐条读取后写入 CSS 变量 `--len`，keyframes 里 `stroke-dasharray: var(--len)`，避免"写死 1000 导致短路径延迟出线、长路径提前断线"。
- **性能要点**：只动画 `stroke-dashoffset/transform/opacity`（不触发重排）；几百条路径统一在 `will-change` 控制下分层；低端机用 `matchMedia('(prefers-reduced-motion)')` 降级为直接显示。
- **踩坑记录**：`stroke-width` 沿路径两侧扩散，细线放大后边缘超出裁切区被切掉，统一给导出 SVG 加 8% 的 viewBox 内边距；iOS Safari 对含大量 filter 的 SVG 滚动掉帧，把滤镜效果换成预烘焙的双层 path（模糊层用半透明宽描边模拟）。

## 6. 最佳实践与常见坑

1. **`fill` 默认是黑色**，`stroke` 默认是 none——画一条"看不见的线"，十有八九是忘了写 `stroke`；想只要描边就显式 `fill="none"`。
2. **分清 width/height（视口）与 viewBox（逻辑坐标）**：viewBox 决定坐标系与缩放，width/height 决定占位大小；改大小请动 width/height 或 CSS，别乱改 viewBox。
3. **比例不一致时记得 `preserveAspectRatio`**：默认 `xMidYMid meet` 会留白，做全屏 cover 效果用 `slice`，强行变形才用 `none`。
4. **图标系统统一规范**：单一 viewBox（如 24×24）、单色用 `currentColor`、多色图标分层命名 class；雪碧图内联进 HTML，别依赖外部文件 `<use>`。
5. **描边动画先 `getTotalLength()`**：写死 dasharray 阈值会在不同路径上错拍；动画只改 `stroke-dashoffset`，性能最好。
6. **filter 会裁切**：模糊/阴影默认超出包围盒 10% 就没了，给 `<filter>` 放大 `x/y/width/height`（如 -50% / 200%）。
7. **装饰性 SVG 必须 `aria-hidden="true"`，信息性 SVG 必须配 `<title>`/`<desc>`**——这是无障碍审查的高频扣分项；`<title>` 是子元素，不是属性。
8. **CSS 不能直接动画路径数据 `d`**（Chromium 支持但别依赖）；需要 morph 用 SMIL `<animate attributeName="d">` 或 JS 插值（flubber/GSAP MorphSVG 思路）。
9. **SMIL 适合"文件内自播"**（独立 .svg 文件被 `<img>` 引用时，CSS/JS 都失效，只有 SMIL 能动）；页面内动画优先 CSS，交互驱动用 JS。
10. **元素越多越慢**：SVG 每个图形都是 DOM 节点，上千个节点 + 频繁改属性会引发大面积重绘；大数据量散点/连线场景请换 Canvas。
11. **Data URI 里的 `#` 要转义成 `%23`**，否则 CSS `url()` 解析直接断裂；换行引号在部分构建管线也会出问题，建议构建工具自动内联。
12. **缩放文字别用 transform 放大**：矢量本身无损，直接给 SVG/文字更大尺寸即可；transform 放大触发重光栅化，在低分屏会出现先糊后清的闪变。

## 7. 参考资料

- MDN SVG 入门教程：<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial>
- MDN `<path>` 指令参考：<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths>
- MDN viewBox 与 preserveAspectRatio：<https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/viewBox>
- MDN SMIL 动画（SVG Animation）：<https://developer.mozilla.org/zh-CN/docs/Web/SVG/SVG_animation_with_SMIL>
- MDN SVG 无障碍：<https://developer.mozilla.org/zh-CN/docs/Web/SVG/SVG_as_an_image>
- W3C SVG 2 规范：<https://www.w3.org/TR/SVG2/>
- caniuse · Inline SVG：<https://caniuse.com/inline-svg>
- caniuse · SVG filters：<https://caniuse.com/svg-filters>
