# 漫画 · 第 22 话 容器查询：组件不问屏幕，只问容器

> 对应正文：[docs/css/12-container-queries.md](../../docs/css/12-container-queries.md) ｜ 原画：[EP.22-container-queries.svg](./EP.22-container-queries.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。同一张卡片在侧栏被挤爆、在主区却正常，气得跳脚——媒体查询只看屏幕宽度，不管组件实际多宽。
- **标签君**：HTML5 结构师，搬出"container-type + @container"组合拳，让组件自带断点，消费者零媒体查询。

## 剧情梗概

响应式章（EP.05）讲了媒体查询管设备、clamp 管流式排版，但组件级响应还有最后一块拼图：容器查询。像素酱先被"同一张卡片两种命运"折磨，再学会 `container: card / inline-size` 声明容器、用 `@container card (min-width: 400px)` 写组件断点，最后用 `cqi` 单位让标题字号随容器宽度平滑缩放。

## 分格解读

### 格1 · 痛点现场

侧栏 240px 里的卡片被 `@media (min-width: 768px)` 强制横排——屏幕够宽，但卡片实际只有 240px，文字挤成一团。主区 720px 里的同一张卡片横排正常。媒体查询的盲区：它只看视口，不看组件容器。

### 格2 · 机制登场

`container: card / inline-size` 把包裹元素变成尺寸容器；`@container card (min-width: 400px)` 让后代元素查询容器而非视口。命名容器防止嵌套时外层干扰内层。`cqi/cqw/cqh` 单位让组件内元素随容器宽度缩放，比 `clamp()` 的 `vw` 更精准。

### 格3 · 落地收束

同一段 HTML，放进 320px 容器自动竖排，放进 720px 容器自动横排。卡片组件自带断点，页面消费者只需 `<div class="card-wrapper">` 包裹，无需再写媒体查询。设计系统的复用成本断崖式下降。

## 码叔划重点

1. `container-type` 写在包裹容器上，不是组件根元素——否则尺寸计算会递归。
2. 给容器命名：`container: card / inline-size`，防止嵌套时外层干扰内层。
3. 容器单位 `cqi/cqw` 按容器宽度缩放，比 `clamp()` 的 `vw` 更精准——它缩放的是容器不是视口。

## 自测一题

**问**：为什么容器查询不能直接把 `container-type` 写在卡片组件的根元素上？

**答**：`container-type` 需要容器有明确的尺寸来源。如果写在组件根元素上，组件的尺寸由内容撑开，而内容又依赖 `@container` 查询的结果——形成循环依赖。正确做法是把 `container-type` 写在**包裹组件的父容器**上，让父容器提供稳定的尺寸基准。

## 动手实验

- 卡片组件自适应 + 嵌套容器 + 容器单位 + 导航栏自适应：[examples/css/12-container-queries/](../../examples/css/12-container-queries/index-01-container-queries.html)

## 下一话预告

第 23 话《层叠层》——`@layer` 显式分层，终结 `!important` 战争与特异性军备竞赛。
