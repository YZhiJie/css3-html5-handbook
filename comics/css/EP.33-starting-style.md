# 漫画 · 第 33 话 @starting-style：让「从无到有」也能平滑过渡

> 对应正文：[docs/css/22-starting-style.md](../../docs/css/22-starting-style.md) ｜ 原画：[EP.33-starting-style.svg](./EP.33-starting-style.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。每个新插入的 DOM 都要写 `requestAnimationFrame` 拆帧加类，display 切换更是要强制 reflow，动画时长在 CSS 和 JS 里双写。
- **标签君**：HTML5 结构师，搬出 `@starting-style` 与 `transition-behavior: allow-discrete`，一句声明让浏览器自动补帧。

## 剧情梗概

像素酱被「新元素入场动画」折磨：`appendChild` 后元素直接闪现，只能手动加 `.enter` 类再删掉；`display: none` 切换更是要先显示、强制 reflow、再过渡。标签君引入 `@starting-style` —— 浏览器在首次渲染前读入起点样式，与终态形成差值，过渡自动发生；`allow-discrete` 让 `display` 和 `overlay` 也能参与过渡。像素酱发现连 Popover 的进出场都能零 JS 完成。

## 分格解读

### 格1 · 痛点现场

传统方案命令式拆帧：`classList.add('enter')` → `rAF` → `remove`。`display: none` 切换更麻烦：先显示、强制 reflow、再写终态。叠加痛苦：Popover 弹出瞬间闪现、离场动画等 `setTimeout`、CSS 时长与 JS 定时器双写，改一处忘另一处就出 bug。

### 格2 · 机制登场

`@starting-style` 凭空造一帧：浏览器在元素首次参与样式计算时，把起点声明当作「第 0 帧」，与常规样式形成差值 → 过渡自然发生。`transition-behavior: allow-discrete` 让 `display`、`overlay` 这些离散属性延迟到过渡结束才切换，离场动画播完再隐藏。

### 格3 · 落地收束

四大场景：新节点自动入场、display 切换平滑过渡、Popover 零 JS 进出场、Toast `transitionend` 自动清理。记住边界：`@starting-style` 只对**首次渲染**生效，已渲染过的元素改样式不会重新触发。

## 码叔划重点

1. @starting-style 只在首次渲染时生效：已渲染过的元素改样式不会重新触发。
2. display/overlay 必须加 allow-discrete，否则动画播到一半元素就消失。
3. 与 Popover 是黄金搭档：`:popover-open` 起点 + `:not(:popover-open)` 离场态，零 JS 进出场。

## 自测一题

**问**：为什么 `@starting-style` 里写 `display: none` 没有意义？

**答**：元素要参与渲染才能过渡。`display: none` 的元素不生成盒模型，没有「前一帧」可供插值。起点规则里应该写 `opacity`、`translate` 等可动画属性，`display` 留在常规声明里由 `allow-discrete` 延迟切换。

## 动手实验

- 新节点入场 + display 切换 + Popover 进出场 + Toast 自动消失 + 嵌套写法：[examples/css/22-starting-style/](../../examples/css/22-starting-style/index-01-starting-style.html)

## 下一话预告

第 34 话《Observer 三件套》——IntersectionObserver / ResizeObserver / MutationObserver：浏览器原生推送替代轮询，懒加载、无限滚动、响应式组件、水印防删，全部零 scroll 监听。
