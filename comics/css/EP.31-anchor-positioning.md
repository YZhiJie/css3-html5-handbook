# 漫画 · 第 31 话 锚点定位：把元素钉在另一个元素旁边

> 对应正文：[docs/css/21-anchor-positioning.md](../../docs/css/21-anchor-positioning.md) ｜ 原画：[EP.31-anchor-positioning.svg](./EP.31-anchor-positioning.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。每个 Tooltip 都要写 `getBoundingClientRect()` + scroll 监听 + rAF 节流，定位 JS 比样式还多。
- **标签君**：HTML5 结构师，搬出 `anchor-name` 与 `position-anchor`，一句声明建立几何绑定，布局引擎接管跟随。

## 剧情梗概

像素酱被「让 Tooltip 永远贴在按钮上方」折磨：监听 scroll/resize、手动节流、快速滚动还抖动。标签君引入锚点定位——锚元素声明 `anchor-name: --tip`，漂浮物声明 `position-anchor: --tip` + `bottom: anchor(top)`，跟随变成浏览器的布局职责。像素酱发现 `position-try: flip-block` 连「空间不足自动翻转」都内建了。

## 分格解读

### 格1 · 痛点现场

传统方案命令式重算：`getBoundingClientRect()` + 滚动监听 + rAF 节流。定位 JS 占组件库三分之一体积，SSR 输出结构不完整，快速滚动时跳帧抖动。叠加痛苦还有翻转、等宽、overflow 裁切，每个都需要 Popper.js 中间件。

### 格2 · 机制登场

锚点定位是**布局期**声明：`anchor-name` 建立名字，`position-anchor` 完成绑定，`anchor()` 函数或 `position-area` 九宫格决定位置。高级工具箱：`position-try` 防溢出翻转、`anchor-size()` 读锚尺寸。滚动跟随由布局引擎逐帧保证，零 JS、零抖动。

### 格3 · 落地收束

四大场景：Tooltip 正上方居中、下拉菜单等宽、防溢出自动翻转、角标骑角落。记住分界：锚点定位**只管几何、不管层叠**——被 overflow 裁切或需要 z-index 霸权时，请搭配下一话的 Popover top layer。

## 码叔划重点

1. 锚点定位发生在布局阶段：锚移动 → 漂浮物下一帧自动重算，零 JS 参与。
2. position-try 翻转无动画：这是布局期一次性决策，不要期待过渡。
3. 只管几何、不管层叠：被 overflow 裁切请搭配 Popover top layer。

## 自测一题

**问**：`position: fixed` 的漂浮物能用锚点定位跟随页面滚动吗？为什么？

**答**：不能。`fixed` 相对视口定位，锚移动后不会自动重算。要跟随滚动请用 `position: absolute` 并确保漂浮物与锚在同一滚动上下文中。

## 动手实验

- 基础 Tooltip + position-area 九宫格切换 + 防溢出翻转 + anchor-size 等宽菜单 + 滚动跟随：[examples/css/21-anchor-positioning/](../../examples/css/21-anchor-positioning/index-01-anchor-positioning.html)

## 下一话预告

第 32 话《Popover API》——`popover` 属性与 `popovertarget`，浏览器原生顶层弹出层：top layer 层叠、light dismiss、Esc 关闭、焦点管理，全部零 JS。
