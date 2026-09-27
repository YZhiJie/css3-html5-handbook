# 漫画 · 第 28 话 CSS 嵌套：规则套规则

> 对应正文：[docs/css/18-css-nesting.md](../../docs/css/18-css-nesting.md) ｜ 原画：[EP.28-css-nesting.svg](./EP.28-css-nesting.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。维护一套扁平 CSS，`.card` 相关的规则散落在文件各处，改个类名要全局搜索替换；想引入 Sass 又要拉起一整套工具链。
- **标签君**：HTML5 结构师，搬出 CSS Nesting 标准——子规则直接写进父规则，`&` 引用父选择器，浏览器解析期自动展开，与手写完全等价。

## 剧情梗概

层叠层章（EP.23）解决了「优先级管理」，本话解决「书写结构」。像素酱被扁平 CSS 的重复与散落折磨，标签君引入原生嵌套：`&:hover` 同元素状态、`&.featured` 同元素变体、`.card &` 祖先条件、`@media` 嵌套断点——Sass 用户几乎零学习成本，且不需要任何构建工具。

## 分格解读

### 格1 · 痛点现场

扁平 CSS 里同一个组件的规则被拆成多条：`.card`、`.card .title`、`.card .title:hover`、`.card.featured`……父选择器重复书写，组件样式散落几十行。引入预处理器能解决问题，但要付出工具链成本：编译、source map、额外依赖。

### 格2 · 机制登场

CSS Nesting 是解析期语法糖：浏览器把嵌套规则展开成等价长形式再进入层叠。核心是 `&` 嵌套选择器——引用父规则匹配的元素。`&:hover`（无空格）= 同元素加伪类；`.featured`（有空格）= 后代元素。`&` 还能出现在任意位置：`.card &` 展开为 `.card .title`，实现祖先条件反向书写。

### 格3 · 落地收束

四大实战场景：按钮全状态收拢（`&:hover`/`&:disabled`/`&.primary:hover` 全在一个块内）、响应式跟着组件走（`@media` 嵌套在 `.sidebar` 内部）、祖先条件反向写（`[data-theme=dark] &` 驱动主题）、嵌套 + `:has()` 组合拳（零 JS 表单验证提示）。

## 码叔划重点

1. &.featured 是同元素状态，.featured 是后代元素——一字之差语义不同。
2. 嵌套深度 ≤ 3 层，别把 HTML 结构硬编码进选择器。
3. @media 直接嵌套在组件内部，响应式不再跳转文件底部。

## 自测一题

**问**：`.card { &.featured { } }` 和 `.card { .featured { } }` 展开后分别是什么？匹配的元素有何不同？

**答**：前者展开为 `.card.featured`——匹配**同时**带有 card 和 featured 两个类的**同一个**元素（空格都没有）；后者展开为 `.card .featured`——匹配 `.card` 元素**后代中**带 featured 类的元素。少写一个 `&`，选择器从「状态变体」变成「后代查找」，静默失效不报错，是嵌套迁移时最高发的错误。

## 动手实验

- 基础嵌套 + `&` 父引用 + 嵌套 @media + 主题切换 + 嵌套:has() 表单：[examples/css/18-css-nesting/](../../examples/css/18-css-nesting/index-01-css-nesting.html)

## 系列结语

至此「霓虹墨」漫画剧场 CSS 篇扩展完结（EP.22–28）：容器查询、层叠层、现代颜色、滚动驱动动画、:has()、View Transitions、CSS 嵌套——现代 CSS 的七件新装备全部到手。
