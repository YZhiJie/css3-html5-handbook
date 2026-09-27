# 漫画 · 第 32 话 Popover API：弹出层的原生答案

> 对应正文：[docs/html/10-popover.md](../../docs/html/10-popover.md) ｜ 原画：[EP.32-popover.svg](./EP.32-popover.svg)

## 登场角色

- **标签君**：HTML5 结构师，本话主角。曾经被弹出层的 z-index 军备竞赛、portal DOM 撕裂、JS 监听全家桶折磨得筋疲力尽。
- **像素酱**：CSS 造型师，搬出 `popover` 属性与 `::backdrop`，把弹出层交给浏览器原生管——层叠、关闭、焦点，全部内建。

## 剧情梗概

弹出层曾经是最繁琐的组件：算 z-index、portal 到 body、全局监听外点和 Esc、焦点陷阱与还原、SSR 结构不一致。标签君引入 Popover API——给元素加 `popover` 属性，`popovertarget` 声明式绑定按钮，浏览器接管 top layer 层叠、light dismiss、Esc 关闭和焦点管理。像素酱补充 `::backdrop` 伪元素做遮罩，锚点定位（见 EP.31）补上贴边位置——黄金搭档成型。

## 分格解读

### 格1 · 痛点现场

弹出层痛苦全家桶：z-index 9999 不够用，总被 overflow:hidden 裁切，只能 portal 到 body；点击外部关闭、Esc 监听、焦点陷阱与还原全要 JS 自己写；快速连开两层时外点监听互相干扰，是组件库的经典顽固 bug。

### 格2 · 机制登场

`popover` 属性 + `popovertarget` 声明式绑定：零 JS 开关，浏览器内建 light dismiss 和 Esc。top layer 无视 z-index 与 overflow，专属 `::backdrop` 做遮罩。三种模式 auto / manual / hint 覆盖不同场景。事件钩子 `beforetoggle` / `toggle` 留给动画编排。

### 格3 · 落地收束

四大场景：零 JS 菜单（auto）、manual 模态（带 `::backdrop`）、Toast 队列（manual + JS API）、与锚点定位的黄金搭档（位置 + 层叠）。记住分工：Popover 管层叠与行为，锚点定位管几何位置。

## 码叔划重点

1. top layer 无视 z-index 与 overflow，弹出层从此告别 portal 和层叠常量表。
2. auto 的链式关闭：非祖先链上的 auto popover 自动互斥，嵌套写内部 DOM。
3. Popover 管层叠与行为，锚点定位管几何位置——两者搭档 = 完整原生弹出方案。

## 自测一题

**问**：`popover="auto"` 和 `popover="manual"` 在「关闭行为」上有什么本质区别？Toast 通知该用哪个？

**答**：auto 默认点外部关闭、按 Esc 关闭，并且打开时会关闭其他不在祖先链上的 auto。manual 不自动关闭，必须由显式代码调用 `hidePopover()`。Toast 通知用 manual：它不需要 light dismiss（通知要持续几秒），也不需要被 Esc 关闭，用 `setTimeout` 到期后显式关闭并移除 DOM。

## 动手实验

- 声明式菜单 + manual 模态 + 进出场动画 + 锚点定位搭档 + JS API 与事件：[examples/html/10-popover/](../../examples/html/10-popover/index-01-popover.html)

## 系列结语

批次 4 完结：锚点定位（EP.31）+ Popover API（EP.32），HTML5 篇扩展至 10 章，全 32 话。CSS 与 HTML 各补一根关键支柱：位置层叠终于告别 JS，前端弹出层体系进入原生时代。
