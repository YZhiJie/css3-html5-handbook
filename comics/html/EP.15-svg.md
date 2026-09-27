# 漫画 · 第 15 话 SVG：图形即 DOM 的矢量语言

> 对应正文：[docs/html/04-svg.md](../../docs/html/04-svg.md) ｜ 原画：[EP.15-svg.svg](./EP.15-svg.svg)

## 登场角色

- **像素酱**：CSS 造型师，给站点图标切了 16/32/48 三套 PNG，改主题色还要重出图；hover 高亮更是无从下手，怀念起字体图标的时候。
- **标签君**：HTML5 结构师，本话主角。演示 viewBox 的逻辑坐标、path 指令族，以及 symbol/use 搭一套可上色、可点击、可动画的图标系统。

## 剧情梗概

SVG 是 Canvas 的反面：它是 XML 描述的**保留模式**矢量图，每个图形都是真实的 DOM 节点——浏览器替你记住"这里有个圆"，你改属性它自动重绘。配合 viewBox 的逻辑坐标系，一份图形定义可以从 16px 无损放到 1600px；图形能绑事件、用 CSS 上色、`currentColor` 跟随文字色，图标系统由此诞生。

## 分格解读

### 格1 · 痛点现场

位图图标的三重税：多尺寸切图、改色重出图、无法交互。雪碧图维护麻烦，字体图标在对齐、语义和多色上都有包袱。当需求是"缩放无损 + 能 hover 能点击 + 随主题变色"，位图路线已经走到头。

### 格2 · 机制登场

`viewBox="x y w h"` 建立一套**逻辑坐标系**，浏览器把它等比映射到 SVG 元素的实际视口——这就是矢量无损缩放的原理。保留模式意味着图形即 DOM：`<circle>`、`<rect>`、`<path>` 都是节点，改属性触发重绘、可以绑 click、CSS 能直接控制 fill/stroke。代价是图形数量成千上万时 DOM 成本高（那时才轮到 Canvas）。

### 格3 · 落地收束

`path` 一支笔画万物：`M` 起笔、`L/H/V` 直线、`Q/C` 二次/三次贝塞尔、`A` 圆弧（七参数）、`Z` 闭合，小写字母表示相对坐标。描边生长动画：`getTotalLength()` 取路径总长 L → `stroke-dasharray:L` → `stroke-dashoffset` 从 L 动到 0，线条就像被一笔笔画出。图标系统：`defs` 里放 `<symbol>` 定义一次，各处 `<use href="#id">` 引用，配合内联使用（外链 `<img>` 无法用外部 CSS/JS 控制内部）与 `currentColor`，改一处色全站生效。

## 码叔划重点

1. SVG 保留模式：图形即 DOM、浏览器自动重绘、可绑事件可上 CSS；海量图形场景才换 Canvas。
2. viewBox 建逻辑坐标系并等比映射视口，一份定义无损缩放；要外部控制样式必须内联。
3. 描边生长靠 dasharray=总长 + offset 动画到 0；symbol/use 让一份图标定义全站复用。

## 自测一题

**问**：同一个 SVG 图标，用 `<img src="icon.svg">` 引入时外部 CSS 改不了它的颜色，改成内联 `<svg>` 就可以，为什么？

**答**：`<img>` 引入的 SVG 处于独立的图片资源上下文，与外部文档的 DOM、CSS 完全隔离（同源策略式的边界），外部选择器进不去，JS 也拿不到内部节点。内联 SVG 的图形节点直接存在于当前文档 DOM 中，外部 CSS 规则、`:hover`、媒体查询和 JS 都能直接作用于它们——这也是图标方案常把 SVG 内联或用 symbol/use（symbol 定义需在同一文档或可被引用的 sprite 中）的根本原因。

## 动手实验

- 基本形状与 path：rect/circle/polygon 与 M/L/Q/C/A/Z 指令：[examples/html/04-svg/index-01-shapes-path.html](../../examples/html/04-svg/index-01-shapes-path.html)
- viewBox 缩放原理与 stroke 描边行为：[index-02-viewbox-stroke.html](../../examples/html/04-svg/index-02-viewbox-stroke.html)
- 渐变、滤镜与各种视觉效果：[index-03-gradient-filter.html](../../examples/html/04-svg/index-03-gradient-filter.html)
- 图标系统与描边生长动画：[index-04-icon-animation.html](../../examples/html/04-svg/index-04-icon-animation.html)

## 下一话预告

第 16 话《Web Storage》——刷新不丢、关掉再开还在：localStorage 与 sessionStorage 的取舍与封装。
