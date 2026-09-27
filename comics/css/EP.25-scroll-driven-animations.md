# 漫画 · 第 25 话 滚动驱动动画：scroll()/view() 纯 CSS 实现视差与进出场

> 对应正文：[docs/css/15-scroll-driven-animations.md](../../docs/css/15-scroll-driven-animations.md) ｜ 原画：[EP.25-scroll-driven-animations.svg](./EP.25-scroll-driven-animations.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。为博客添加阅读进度条和卡片进出场动画，写了 60 行 JS——scroll 监听、rAF、IntersectionObserver，维护成本高。
- **标签君**：HTML5 结构师，搬出 `animation-timeline: scroll()` 和 `view()`，让 CSS 动画从「时间驱动」进化为「滚动驱动」。

## 剧情梗概

动画过渡章（EP.02）讲了 `@keyframes` + `animation-duration` 的时间驱动动画，但滚动场景需要「滚动位置决定动画进度」。像素酱先被 JS 滚动监听折磨——scroll 事件高频触发、主线程阻塞时动画卡顿、IntersectionObserver 需要手动管理。标签君引入滚动驱动动画：scroll() 跟踪滚动容器位置，view() 跟踪元素在视口中的可见进度，animation-range 精确控制触发区间。

## 分格解读

### 格1 · 痛点现场

JS 滚动监听三大坑：scroll 事件在主线程高频触发，JS 阻塞时动画卡顿；IntersectionObserver 需要手动创建、观察、断开；60 行 JS 代码只为一个进度条和几个淡入动画。

### 格2 · 机制登场

`animation-timeline: scroll()` 将动画进度绑定到滚动容器位置，`animation-timeline: view()` 绑定到元素在视口中的可见进度。`animation-range: entry 0% entry 100%` 精确控制触发区间——刚进入视口时开始，完全进入时结束。`animation-duration` 被忽略，进度完全由滚动决定。

### 格3 · 落地收束

三种时间轴对比：文档时间轴（默认）、scroll()（滚动容器）、view()（视口可见性）。animation-range 四种区间：entry（进入）、exit（离开）、cover（覆盖）、contain（完全可见）。命名时间轴 `scroll-timeline-name` + `timeline-scope` 实现跨元素联动。动画在合成器线程运行，零 JS，优先使用 transform 和 opacity。

## 码叔划重点

1. scroll() 跟踪滚动容器，view() 跟踪元素在视口中的可见进度。
2. animation-range 精确控制触发区间：entry / exit / cover / contain。
3. 动画在合成器线程运行，优先使用 transform 和 opacity 避免 layout。

## 自测一题

**问**：`animation-timeline: view()` 的默认 `animation-range` 是什么？为什么进出场动画通常需要显式指定 `entry 0% entry 100%`？

**答**：默认是 `cover 0% cover 100%`，即元素从进入视口底部到离开视口顶部的整个过程。这意味着动画进度在元素完全离开后才会到达 100%——进出场动画（如淡入）在元素完全进入视口时就应该播完，所以需要显式指定 `entry 0% entry 100%`，让动画在元素完全进入视口时结束。

## 动手实验

- 页面进度条 + 卡片进出场 + 视差滚动 + 图片揭示 + timeline-scope 跨元素联动：[examples/css/15-scroll-driven-animations/](../../examples/css/15-scroll-driven-animations/index-01-scroll-driven-animations.html)

## 下一话预告

第 26 话《:has() 选择器》——CSS 的「父选择器」终于落地，表单验证、卡片有图变布局、数量感知，纯 CSS 实现 DOM 反向匹配。
