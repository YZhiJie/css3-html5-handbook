# 漫画 · 第 34 话 Observer 三件套：浏览器原生推送替代轮询

> 对应正文：[docs/html/11-observers.md](../../docs/html/11-observers.md) ｜ 原画：[EP.34-observers.svg](./EP.34-observers.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。懒加载写 scroll 监听 + 节流、卡片宽度写 window.resize、DOM 变化写 setInterval 轮询，三个定时器同时耗电。
- **标签君**：HTML5 结构师，搬出 IntersectionObserver、ResizeObserver、MutationObserver 三件套，浏览器原生推送替代一切轮询。

## 剧情梗概

像素酱被「监听元素状态」折磨：scroll 事件高频触发、getBoundingClientRect 强制布局、setInterval 轮询 DOM 变化。标签君引入三大 Observer —— 浏览器在布局后批量回调，推送而非轮询。像素酱发现懒加载、无限滚动、响应式卡片、DOM 变化日志，全部可以零 scroll 监听完成。

## 分格解读

### 格1 · 痛点现场

传统方案全是轮询：scroll 监听 + 节流 + getBoundingClientRect 做懒加载；window.resize 监听卡片宽度；setInterval 轮询 DOM 变化。三个定时器同时耗电，组件卸载忘清理就内存泄漏，SSR 环境直接报错。

### 格2 · 机制登场

三大 Observer 推送式 API：`IntersectionObserver` 监听元素与视口交叉（合成器级计算，主线程零负担）；`ResizeObserver` 监听元素尺寸变化（布局后触发，不强制 reflow）；`MutationObserver` 监听 DOM 增删改（批量回调，天然防抖）。

### 格3 · 落地收束

四大场景：图片懒加载提前 200px、无限滚动哨兵模式、响应式卡片与 window.resize 解耦、DOM 变化日志实时推送。记住铁律：**用完即 disconnect**——Observer 持续持有引用，不清理就是内存泄漏。

## 码叔划重点

1. Observer 是推送而非轮询：浏览器布局后批量回调，自带节流，不阻塞主线程。
2. 用完即 disconnect：组件卸载时不清理，Observer 持续持有引用导致内存泄漏。
3. ResizeObserver 回调里改尺寸会触发循环警告，用 requestAnimationFrame 延迟到下一帧。

## 自测一题

**问**：为什么 IntersectionObserver 比 scroll 监听 + getBoundingClientRect 性能好？

**答**：scroll 监听在主线程高频触发，每次都要同步调用 `getBoundingClientRect()` 强制布局；IntersectionObserver 的交叉计算在合成器线程完成，主线程只收批量回调结果，且自带节流，不阻塞渲染。

## 动手实验

- 图片懒加载 + 无限滚动 + 吸顶导航 + 响应式卡片 + DOM 变化日志：[examples/html/11-observers/](../../examples/html/11-observers/index-01-observers.html)

## 下一话预告

第 35 话《……》—— 批次 6 待续，更多 CSS/HTML 高级特性正在路上。
