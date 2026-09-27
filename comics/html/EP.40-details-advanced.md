# 漫画 · 第 40 话 details 与 summary 进阶：原生折叠面板

> 对应正文：[docs/html/14-details-advanced.md](../../docs/html/14-details-advanced.md) ｜ 原画：[EP.40-details-advanced.svg](./EP.40-details-advanced.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话苦主。为 FAQ 页引了 15KB 的 accordion 组件库，互斥逻辑手写 JS，高度动画靠 JS 算 scrollHeight，键盘和屏幕阅读器支持全靠库赏饭，SSR hydration 还闪动。
- **标签君**：HTML5 结构师，掏出原生双件套——`<details>`/`<summary>` 零 JS 折叠，再加进阶三件套：`name` 互斥、`::details-content` 动画、`interpolate-size` 开关。

## 剧情梗概

像素酱被「折叠面板必引库」的思维定式困住：包体积 +15KB、互斥手写、动画手写、可访问性全靠库。标签君翻开 HTML 规范——`<details>` 天生支持键盘与屏幕阅读器，`open` 属性 SSR 友好；相同 `name` 的 details 自动互斥，一行 JS 不用写；`::details-content` 伪元素配合 `interpolate-size: allow-keywords`，`height: auto` 平滑过渡终于原生可用。像素酱发现连 View Transitions 都能和 toggle 事件配合出丝滑快照补间。

## 分格解读

### 格1 · 痛点现场

组件库方案的隐性成本：包体积、JS 互斥逻辑、JS 高度动画、SSR 闪动、可访问性外包。每一个都是原生两行 HTML 就能解决的事。

### 格2 · 机制登场

`<details open>` + `<summary>` 就是完整折叠面板，键盘/读屏天然支持。进阶三件套：`name="faq"` 让同组 details 互斥（同时只开一个）；`::details-content` 选中内容容器做动画；`interpolate-size: allow-keywords` 是 `height: auto` 可过渡的关键开关。

### 格3 · 落地收束

四大场景：FAQ 手风琴（name 互斥零 JS）、平滑动画（`::details-content` 过渡高度与透明度）、自定义标记（`list-style: none` + `::after` 换 +/-）、与 View Transitions 配合（toggle 事件里 `startViewTransition`）。记住边界：**`<summary>` 必须是第一个子元素**；name 互斥组不提交表单数据。

## 码叔划重点

1. `<summary>` 必须是第一个子元素；open 属性控制默认展开，SSR 友好。
2. 相同 name 的 details 自动互斥；`::details-content` 实现 height 平滑过渡。
3. `interpolate-size: allow-keywords` 是 height: auto 过渡的关键开关。

## 自测一题

**问**：为什么给 `::details-content` 写了 `transition: height .3s` 却没有动画效果？

**答**：因为 `height` 在收起态是 `0`、展开态是 `auto`——`auto` 是关键字，默认不可插值。需要在 `:root`（或祖先）声明 `interpolate-size: allow-keywords` 解锁关键字插值，过渡才会生效。该特性 Chrome 129+ 支持，旧浏览器回退为瞬时展开（渐进增强，功能无损）。

## 动手实验

- 基础折叠 + name 互斥手风琴 + `::details-content` 高度动画 + View Transitions 配合：[examples/html/14-details-advanced/](../../examples/html/14-details-advanced/index-01-details-advanced.html)

## 下一话预告

第 41 话《@container 进阶》——style queries 按容器样式查样式、容器查询单位 cqw/cqi 免算百分比、与 @scope 组合拳，组件真正「装哪美哪」。
