# 漫画 · 第 11 话 CSS 进阶技巧：散装高频军火库

> 对应正文：[docs/css/11-pro-tips.md](../../docs/css/11-pro-tips.md) ｜ 原画：[EP.11-pro-tips.svg](./EP.11-pro-tips.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。封面图加载前布局疯狂跳动、竖版视频被拉成圆脸、目录吸顶时灵时不灵——三个事故在同一天找上门。
- **标签君**：HTML5 结构师，摊开一排"一格属性解决一类问题"的技巧卡片，并预告 HTML 篇即将开播。

## 剧情梗概

本章是 CSS 篇收官，汇集十余个每个项目都会用到、却散落在各篇文档里的高频属性：宽高比、媒体适配、粘性定位、滚动捕捉、几何裁剪、键盘焦点。像素酱发现这些翻车事故的共同点——都只要一行属性就能解决，只是没人把它们摆在一起讲过。

## 分格解读

### 格1 · 痛点现场

三类经典事故：`<img>` 只给宽度没给高度，图片加载前浏览器无法预留空间，加载瞬间布局跳动（CLS）；竖版视频在横屏容器里被 `fill` 拉伸，人脸变形；导航写了 `position: sticky` 却不吸顶——往往不是属性失效，而是祖先链上的 `overflow: hidden` 改变了吸附参考系。

### 格2 · 机制登场

六个一行属性对应六类问题：`aspect-ratio: 16/9` 让宽度响应式、高度自动成比例；`object-fit: cover` 保持比例填满并裁掉超出；`position: sticky` 在阈值前是 relative、到达后变 fixed，但始终占位；`scroll-snap-type` 让滚动停止时自动对齐到卡片；`clip-path: polygon` 做几何裁剪且裁剪区外不响应事件；`:focus-visible` 只在键盘导航时显示焦点环。同区还有 inset、accent-color、color-scheme、gap、pointer-events、backdrop-filter。

### 格3 · 落地收束

组合用法：封面墙用 `aspect-ratio:16/9 + object-fit:cover` 让图位先占位、零 CLS，hover 放大交给 transform；长表格用 sticky 的 thead 吸顶、首列吸左形成冻结窗格（必须 `border-collapse: separate` + 不透明背景）；横滑卡片用原生 scroll-snap，触屏惯性与键盘全部免费支持；固定头站点补一个 `scroll-padding-top` 同时解决锚点与吸附遮挡，键盘焦点统一交给 `:focus-visible`。

## 码叔划重点

1. aspect-ratio 是偏好不是强制：内容能撑高盒子，硬锁比例配 `overflow:hidden`。
2. 内容图用 `img + object-fit`（可读屏、可懒加载），装饰图才用背景；sticky 失效先查祖先链 overflow。
3. 居中选型：流内 flex/grid，浮层 transform 回拉；别裸删 outline，用 `:focus-visible`。

## 自测一题

**问**：容器写了 `aspect-ratio: 1/1`，里面文字一多，正方形还是被撑高了，为什么？怎么锁死？

**答**：aspect-ratio 是"首选尺寸约束"而非强制——它只在一个方向尺寸为 auto 时生效，而 `min-height: auto` 允许内容把盒子撑高（古老的 `padding-top:100%` hack 是 padding 算出的硬高度，没这个弹性）。锁死比例：给容器加 `overflow: hidden`，或显式 `max-height`，并给背景色避免图片加载前白块。这也是图位容器的推荐标配：`aspect-ratio + overflow:hidden + 底色`。

## 动手实验

- 比例按钮 + object-fit 五态图墙（含 object-position 切换）：[examples/css/11-pro-tips/index-01-aspect-object.html](../../examples/css/11-pro-tips/index-01-aspect-object.html)
- sticky 吸顶目录（overflow 坑对照）+ 双粘性表格 + 四种居中方案：[index-02-sticky-center.html](../../examples/css/11-pro-tips/index-02-sticky-center.html)
- scroll-snap 轮播/分屏 + 自定义滚动条 + 平滑锚点：[index-03-scroll-snap-bar.html](../../examples/css/11-pro-tips/index-03-scroll-snap-bar.html)
- 镂空字、clip-path 动效、focus-visible/accent-color/color-scheme、外边距折叠：[index-04-blend-clip-misc.html](../../examples/css/11-pro-tips/index-04-blend-clip-misc.html)

## 下一话预告

CSS 篇完结！第 12 话《语义化标签》——HTML 篇开播：header、main、article、section 到底怎么分工，为什么搜索引擎和读屏器都在意它。
