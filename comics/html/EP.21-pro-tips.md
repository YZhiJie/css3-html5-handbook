# 漫画 · 第 21 话 原生造好的轮子：少写一千行（HTML 篇完结）

> 对应正文：[docs/html/10-pro-tips.md](../../docs/html/10-pro-tips.md) ｜ 原画：[EP.21-pro-tips.svg](./EP.21-pro-tips.svg)

## 登场角色

- **像素酱**：CSS 造型师，维护着一个几百行的自制模态框：遮罩、滚动锁、Tab 焦点循环、ESC、aria-modal 各写一遍还总出 bug；下拉提示又引了一整个定位库；列表渲染用 `innerHTML +=` 拼接，被安全同学提了存储型 XSS。
- **标签君**：HTML5 结构师，本话主角，也是全篇收官人。掏出浏览器原生造好的轮子：dialog、Popover、inert、template，以及一批"写对属性就生效"的资源优化能力。

## 剧情梗概

前 20 话讲的是大块头能力，这一话补另一类高频但零散的轮子：过去需要大量 JS 手写、如今浏览器原生内建。共同心法只有一句——**能写属性解决的别写 JS，能用浏览器保证质量的别自己重造**。弹层进 Top Layer、模板天然防 XSS、资源提示写在 link 上，样板代码一片片消失。

## 分格解读

### 格1 · 痛点现场

成熟的自定义模态要翻三座大山：遮罩层与背景滚动锁、焦点陷阱（Tab 循环、关闭后焦点归还）、ESC 与 aria-modal；浮层还要自己算定位、处理"点外面关闭"。再加上 `innerHTML +=` 拼接用户数据是存储型 XSS 的头号入口。z-index 大战、被父容器 overflow 裁切、焦点跑丢轮番上演。

### 格2 · 机制登场

钥匙是**顶层（Top Layer）**：浏览器维护一个脱离普通层叠上下文的特殊渲染层，置顶于所有 z-index 之上，父容器裁不掉也盖不住。三件套：①`<dialog>.showModal()` 打开即进顶层，内建 `::backdrop` 遮罩、Tab 焦点陷阱、关闭自动归还焦点、ESC 关；`<form method="dialog">` 提交不发请求而是关框并把按钮 value 写入 `returnValue`；`show()` 是非模态版，适合侧栏。②**Popover API**：`popovertarget` 属性让按钮零 JS 控制浮层，light dismiss（点外部/ESC）自动关，`:popover-open` 挂进场动画；auto 单组互斥适合菜单，manual 可堆叠适合 Toast。③**inert**：给容器加上后整棵子树不可点、不可聚焦、读屏器不可见——模态打开时一行属性锁死背景。

### 格3 · 落地收束

安全渲染：`<template>` 内容是惰性 DocumentFragment，不渲染、脚本不执行、图片不加载，需要时 `cloneNode(true)` 取出，用 `textContent/createTextNode` 填用户数据——文本永远是文本，不可能被解析成 `<img onerror>`；行为绑定靠 data-* + 事件委托。资源优化大多只需属性：资源提示五兄弟 `dns-prefetch → preconnect → preload（当前页确定要用）→ prefetch（下一页可能用）→ modulepreload`，preconnect 最多 3~4 个关键域；`loading="lazy"`、`decoding="async"` 延迟非首屏图片；`<img width height>` 让浏览器预留默认宽高比，配合 `height:auto` 是消灭 CLS 成本最低的手段。移动端 `inputmode="numeric|decimal"` 直接弹数字/小数键盘、`enterkeyhint="search"` 把回车变"搜索"——它们只改键盘不改值类型，金额、验证码场景优先于 type="number"。

## 码叔划重点

1. showModal 内建焦点陷阱/ESC/遮罩且进顶层；Popover 零 JS + light dismiss；inert 一行锁背景。
2. template + cloneNode + textContent 渲染用户数据，结构与数据分离天然防 XSS。
3. 能写属性解决的别写 JS：lazy/decoding、width/height 防 CLS、五类资源提示、inputmode。

## 自测一题

**问**：用 `<dialog>` 做"确认/取消"框，为什么可以不写任何状态变量就知道用户点了哪个按钮？直接给 dialog 加 `open` 属性打开，为什么又得不到这些能力？

**答**：在 dialog 内放 `<form method="dialog">`，点提交按钮不会发生网络提交，而是直接关闭对话框，并把提交按钮的 `value` 写入 `dialog.returnValue`；随后触发的 `close` 事件里读 `returnValue`（如 `"ok"` / `"cancel"`）即可分支——二态结果由浏览器替你传递，无需自建变量。但 `returnValue`、焦点陷阱、ESC、`::backdrop` 这些都只属于 `showModal()`（或 `show()`）的运行时行为；直接在标签上写 `open` 属性只是让它按普通元素显示出来，既不进顶层、也没有遮罩和焦点管理——所以打开弹框必须调方法，不要手动操作 open 属性。

## 动手实验

- dialog 模态全流程：showModal + method=dialog + 焦点陷阱 + ::backdrop + 点遮罩关闭：[examples/html/10-pro-tips/index-01-dialog-modal.html](../../examples/html/10-pro-tips/index-01-dialog-modal.html)
- Popover 三种触发 + :popover-open 动画 + light dismiss + inert 锁背景：[index-02-popover-inert.html](../../examples/html/10-pro-tips/index-02-popover-inert.html)
- template + cloneNode 列表渲染 + innerHTML XSS 对比 + data-* 委托：[index-03-template-render.html](../../examples/html/10-pro-tips/index-03-template-render.html)
- lazy/decoding/fetchpriority/防 CLS + 资源提示速查 + inputmode/enterkeyhint：[index-04-resource-hints.html](../../examples/html/10-pro-tips/index-04-resource-hints.html)

## 全篇收束

21 话到此完结：CSS 篇（EP.01–11）从选择器、动画、Flex/Grid 一路到 transform 与生产技巧；HTML 篇（EP.12–21）从语义骨架、表单、Canvas/SVG，到存储、Worker、定位、拖放、多媒体与原生交互轮子。像素酱、标签君和码叔的建议始终没变——先读规范与文档，让浏览器干它擅长的事，把自己的代码花在真正的业务上。霓虹墨漫画剧场，我们在下一本手册再见。
