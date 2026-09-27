# 漫画 · 第 36 话 dialog 元素：原生模态一句话入场

> 对应正文：[docs/html/12-dialog.md](../../docs/html/12-dialog.md) ｜ 原画：[EP.36-dialog.svg](./EP.36-dialog.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话痛点担当。自研 Modal 组件 400 行：portal 挂 body、z-index 战争、80 行 focus trap、Esc 与遮罩监听，仍叠错序。
- **标签君**：HTML5 结构师，掏出自己的本家元素 `<dialog>`——`showModal()` 一句进入 top layer，页面自动惰性化，模态语义浏览器原生实现。

## 剧情梗概

像素酱被手搓模态折磨：焦点漏到背景、两层遮罩叠错序、读屏器读出背景内容，无障碍审计过不去。标签君请出 `<dialog>`——`showModal()` 自动 top layer + inert 页面 + 焦点圈禁 + Esc 关闭；`form method="dialog"` 让按钮 value 直接写入 returnValue，确认/取消分流零 JS。码叔最后补刀：进出场动画交给 `@starting-style` 三件套，分工记牢——要答案用 dialog，展示信息用 popover。

## 分格解读

### 格1 · 痛点现场

自研 Modal 四件套：portal 挂载、z-index 9999、focus trap、Esc/遮罩监听。叠加痛苦：焦点漏背景、遮罩叠错序、读屏器读背景、动画时长 CSS/JS 双写——400 行代码仍有 bug。

### 格2 · 机制登场

`showModal()` 一句全包：top layer 最顶层（不受 z-index 战争影响）、页面自动 inert（不可点不可聚焦）、焦点圈禁、Esc 触发 cancel 后默认关闭；`::backdrop` 纯 CSS 定制遮罩模糊。`form method="dialog"`：点按钮即关窗，value 自动写入 returnValue。

### 格3 · 落地收束

四大场景：确认对话框（零 JS 分流）、拦截 Esc（cancel 可 preventDefault，保护未保存表单）、closedby 轻关闭（`any` 点外部关 / `none` 强制确认）、进出场动画（`@starting-style` + `allow-discrete`，遮罩同步淡入淡出）。

## 码叔划重点

1. showModal() 进 top layer：页面自动 inert、焦点圈禁、Esc 关闭、::backdrop 可定制。
2. form method="dialog"：按钮 value 自动写入 returnValue，确认/取消分流零 JS。
3. 分工：打断流程要答案用 dialog，顺手展示补充信息用 popover。

## 自测一题

**问**：Esc 关闭模态框时，`cancel` 和 `close` 事件谁先谁后？如何阻止 Esc 关闭？

**答**：Esc → 先触发 `cancel`，随后默认执行 `close`。在 `cancel` 里 `preventDefault()` 即可阻止后续关闭（`close` 不再触发）——未保存表单保护就靠它。`close` 事件本身不可拦截。

## 动手实验

- 确认分流 + 拦截 Esc + closedby 轻关闭 + 进出场动画 + 非模态抽屉：[examples/html/12-dialog/](../../examples/html/12-dialog/index-01-dialog.html)

## 下一话预告

CSS 篇与 HTML 篇的现代扩展持续进行中——锚点定位、Popover、@starting-style、Observer、滚动吸附、dialog 已就位，下一站将由大家票选：View Transitions 进阶还是 CSS 函数新玩法？
