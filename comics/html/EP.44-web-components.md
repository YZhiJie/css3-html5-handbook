# 漫画 · 第 44 话 Web Components 入门：浏览器原生组件化

> 对应正文：[docs/html/16-web-components.md](../../docs/html/16-web-components.md) ｜ 原画：[EP.44-web-components.svg](./EP.44-web-components.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。团队维护的 React 组件库，隔壁 Vue 项目想用只能重新实现一遍——同一个按钮写两套，升级还要同步改两处，样式冲突靠 BEM 命名苦苦支撑。
- **标签君**：HTML5 结构师，搬出浏览器原生三件套：`<template>` 惰性模板、`<slot>` 插槽分发、`customElements.define` 自定义元素——零依赖、跨框架，React/Vue/Angular 都能直接用。

## 剧情梗概

框架组件生态各自为战：React 的 `<NeonButton />` 到了 Vue 项目就是废铁。Web Components 把组件化能力下沉到浏览器本身——template 定义惰性模板，slot 做内容分发，customElements.define 注册新标签，Shadow DOM 提供样式隔离。写一次，到处运行，与框架无关。

## 分格解读

### 格1 · 痛点现场

React 组件 Vue 用不了，同个按钮写两套、升级同步改两处；样式冲突靠 BEM 命名纪律维持；跨框架复用等于重写。框架锁定了组件生态，复用成本随团队技术栈数量线性膨胀。

### 格2 · 机制登场

`<template>` 里的内容不渲染、脚本不执行，克隆后才激活；`customElements.define('neon-card', Class)` 注册新标签，标签名必须含短横线以避免与原生元素冲突；Shadow DOM 完全隔离内外样式，穿透靠 CSS 自定义属性 `--*`。

### 格3 · 落地收束

四大场景：跨框架按钮（React/Vue/原生 HTML 三处直接用）、Shadow DOM 封装（内外样式互不干扰）、插槽分发（组件定义占位符、业务方填充内容，注意插槽是投影不是移动）、设计系统组件库（升级组件只改一处，全项目同步生效）。Chrome 54+ / Safari 10.1+ / Firefox 63+ 全绿。

## 码叔划重点

1. 标签名必须含短横线（`<my-button>` 合法，`<mybutton>` 报错）——避免与原生冲突。
2. Shadow DOM 样式完全隔离；穿透用 CSS 自定义属性 --*。
3. 生命周期顺序：constructor → connectedCallback → attributeChangedCallback。

## 自测一题

**问**：为什么自定义元素标签名必须包含短横线（如 `<neon-card>`），而不能是 `<neoncard>`？

**答**：HTML 规范保证原生元素永远不会带短横线，强制短横线等于给自定义元素划出独立命名空间，永久避免与未来新增原生元素撞名。`customElements.define` 遇到无短横线的名字会直接抛 `SyntaxError`。

## 动手实验

- template 克隆 + neon-card 三插槽 + neon-button 三变体 + live-counter 属性监听：[examples/html/16-web-components/](../../examples/html/16-web-components/index-01-web-components.html)

## 下一话预告

第 45 话《@layer 进阶》——层叠层基础用熟了？嵌套层、匿名层、revert-layer 三连，让第三方库样式想压就压、想掀就掀。
