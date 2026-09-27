# 漫画 · 第 26 话 :has() 选择器：CSS 的「父选择器」

> 对应正文：[docs/css/16-has-selector.md](../../docs/css/16-has-selector.md) ｜ 原画：[EP.26-has-selector.svg](./EP.26-has-selector.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。每次遇到「卡片有图/无图」「表单是否有效」「导航有没有子菜单」都要写 JS 检测子元素再切换类名，样式逻辑分散在 JS 和 CSS 两处。
- **标签君**：HTML5 结构师，搬出 `:has()` 选择器，让 CSS 从「只能向下选」进化为「可以向上选」，DOM 反向匹配零 JS。

## 剧情梗概

选择器章（EP.01）讲了后代、子代、兄弟选择器，但都是单向的——只能从父到子、从前到后。像素酱被「选中包含图片的卡片」折磨：JS 检测、类名切换、SSR 样式闪烁。标签君引入 `:has()`，相对选择器作为参数，实现父选择器、兄弟前置选择器、数量感知布局。

## 分格解读

### 格1 · 痛点现场

CSS 单向选择限制：`.parent .child` 只能向下，`prev + next` 只能向后。「如何选中包含 .child 的父元素？」传统方案是 JS 检测 + 类名切换，导致 JS 与 CSS 耦合、SSR 时样式闪烁、新增状态需改两处。

### 格2 · 机制登场

`:has()` 接受相对选择器参数：`.card:has(img)` 匹配包含图片的卡片，`img:has(+ figcaption)` 匹配后面跟着标题的图片，`form:has(input:invalid)` 匹配有无效字段的表单。DOM 变化时自动重新匹配，无需 JS 监听。

### 格3 · 落地收束

四大实战场景：表单验证（`form:has(input:invalid)` 禁用提交按钮）、卡片有图变布局（`.card:has(img)` 切换 flex 方向）、导航子菜单标记（`li:has(> ul)` 添加箭头）、数量感知布局（`:has(> :nth-child(5))` 检测子元素数量）。

## 码叔划重点

1. :has() 接受相对选择器，实现「父选择器」和「兄弟前置选择器」。
2. 表单验证、卡片布局、导航标记、数量感知——四大场景零 JS。
3. 性能注意：避免 :has(*)，尽量用子选择器（＞）缩小匹配范围。

## 自测一题

**问**：`:not(:has(img))` 和 `:has(:not(img))` 语义相同吗？为什么？

**答**：不同。`:not(:has(img))` 表示「不包含 img 的元素」——对元素的否定。`:has(:not(img))` 表示「包含至少一个非 img 子元素的元素」——对子元素的否定。前者是「没有图片」，后者是「有非图片内容」。一个包含图片和文字的 div 会匹配 `:has(:not(img))` 但不匹配 `:not(:has(img))`。

## 动手实验

- 父选择器基础 + 表单验证状态 + 数量感知布局 + 兄弟前置选择 + 导航子菜单标记：[examples/css/16-has-selector/](../../examples/css/16-has-selector/index-01-has-selector.html)

## 下一话预告

第 27 话《View Transitions》——`document.startViewTransition()` 与 `view-transition-name`，页面/元素过渡动画，单页应用体验升级的关键 API。
