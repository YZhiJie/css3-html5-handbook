# 漫画 · 第 41 话 @container 进阶：组件不问屏幕，问容器状态

> 对应正文：[docs/css/26-container-advanced.md](../../docs/css/26-container-advanced.md) ｜ 原画：[EP.41-container-advanced.svg](./EP.41-container-advanced.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。基础容器查询用熟了，但暗色侧栏里的卡片还是白色皮肤——尺寸查询管不了「容器是什么状态」，只能给卡片传 class，业务方和组件耦合越来越深。
- **标签君**：HTML5 结构师，搬出进阶三件套——style queries 查容器的自定义属性、容器单位让组件内部随容器缩放、命名容器防嵌套串台。

## 剧情梗概

EP.22 解决了「按容器宽度换布局」，但像素酱很快撞上三堵新墙：暗色侧栏要换皮肤（查状态）、卡片内文字要随容器缩放（vw 被视口绑架）、仪表盘嵌套查询串台。标签君逐件拆解：`@container style(--theme: dark)` 直接查容器的自定义属性，无需 `container-type`；`cqi/cqw` 单位按最近尺寸容器缩放，clamp 兜底极值；`container: widget / inline-size` 命名后查询不再串台。最后 `@scope` 封装样式边界、`@container` 提供断点，组件真正「装哪美哪」。

## 分格解读

### 格1 · 痛点现场

基础容器查询只能查尺寸。暗色侧栏要换皮肤？尺寸查询做不到，只能给卡片传 class——业务方被迫知道组件内部结构，复用成本飙升。

### 格2 · 机制登场

style queries 查容器的 `--*` 自定义属性值，无需声明 `container-type`；容器单位 `cqi/cqb/cqmin/cqmax` 按最近尺寸容器缩放，不受视口绑架；命名容器 `@container widget (min-width)` 精确指向目标层，嵌套不串台。

### 格3 · 落地收束

四大场景：暗色侧栏自适应（`--theme` 开关零 class）、流式组件排版（`clamp` + `cqi`）、嵌套仪表盘（widget 查自己、dashboard 查外层）、`@container × @scope` 组合（组件样式完全自包含）。记住边界：style queries **只查自定义属性**，Firefox 尚未支持需渐进增强。

## 码叔划重点

1. style queries 只查自定义属性 --*；容器无需 container-type，默认即可查。
2. 容器单位 cqi/cqw 按最近尺寸容器缩放；无容器时回退为视口单位。
3. 嵌套容器必须命名：@container 名字 (条件)，否则查最近容器会串台。

## 自测一题

**问**：为什么 style queries 不需要给容器声明 `container-type`，而尺寸查询必须声明？

**答**：尺寸查询需要容器建立独立的格式化上下文（`container-type: inline-size` 或 `size`），浏览器才能确定查询基准尺寸；style queries 只读取自定义属性的计算值，任何元素都有计算后的自定义属性，所以所有元素默认就是 style 查询容器（`container-type: normal` 的默认行为）。

## 动手实验

- 暗色侧栏 style queries + 容器单位排版 + 嵌套命名容器 + @container × @scope 组合：[examples/css/26-container-advanced/](../../examples/css/26-container-advanced/index-01-container-advanced.html)

## 下一话预告

第 42 话《Web Locks API》——多标签同时写 localStorage 数据互相覆盖？浏览器原生锁帮你排队：独占锁写、共享锁读、ifAvailable 不排队、AbortSignal 可超时。
