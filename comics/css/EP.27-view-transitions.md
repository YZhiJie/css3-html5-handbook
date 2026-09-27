# 漫画 · 第 27 话 View Transitions：告别手写 FLIP

> 对应正文：[docs/css/17-view-transitions.md](../../docs/css/17-view-transitions.md) ｜ 原画：[EP.27-view-transitions.svg](./EP.27-view-transitions.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。给作品集网站做「点击缩略图放大」效果，手写 FLIP 动画 50 行 JS，快速连点时位置错乱、滚动时定位偏差，苦不堪言。
- **标签君**：HTML5 结构师，搬出 `document.startViewTransition()`——浏览器自动拍旧照、更新 DOM、拍新照、补间过渡，JS 从 50 行降到 1 行。

## 剧情梗概

动画章（EP.02）讲的是「时间驱动」的补间，滚动驱动章（EP.25）讲的是「滚动驱动」的补间，本话补全第三块拼图：「状态驱动」的补间。像素酱被 FLIP 流程（First-Last-Invert-Play）折磨，标签君引出 View Transitions——DOM 更新包一层函数，浏览器自动完成快照与补间，同名单元格自动飞过去。

## 分格解读

### 格1 · 痛点现场

传统 DOM 更新是瞬间跳变：`item.remove()` 之后元素立刻消失，前后两帧之间没有任何过渡。想要平滑效果只能手写 FLIP：记录旧位置、更新 DOM、计算差值、transform 补位——流程繁琐，且连续操作时第一个动画未结束第二个就来了，位置计算直接穿帮。

### 格2 · 机制登场

`document.startViewTransition(() => updateDOM())` 三步走：拍旧照 → 执行回调更新 DOM → 拍新照并交叉淡化。两张快照都是位图，在合成器线程运行，不阻塞主线程。给元素加 `view-transition-name`，新旧两帧同名元素自动配对，位置与尺寸平滑补间——这就是「共享元素过渡」。

### 格3 · 落地收束

四大实战场景：列表增删（`view-transition-class` 批量复用动画 + 临时命名触发离场）、卡片↔详情（同名配对自动形变，`old/new` 关掉交叉淡化只留补间）、标签页切换（`.active` 持有名字，旧淡出/新延迟淡入）、暗色模式（`vt.ready` 后对 `::view-transition-new(root)` 播 `clip-path: circle()` 展开）。

## 码叔划重点

1. startViewTransition 把 DOM 更新包成快照过渡动画，零手动计算位置。
2. view-transition-name 同名配对实现「共享元素」补间；名字须唯一，用完即释放。
3. 务必特性检测 if (document.startViewTransition)，不支持的浏览器直接更新 DOM。

## 自测一题

**问**：为什么 `view-transition-name` 在同一时刻必须全页唯一？同名会发生什么？

**答**：因为浏览器靠名字配对「旧元素 → 新元素」。同一帧出现两个同名元素，浏览器无法判断谁配谁，会**跳过该名字的整组过渡**（控制台警告），视觉上退化为普通的交叉淡化。动态列表场景应在过渡前临时命名、结束后释放（设回空串），或改用 `view-transition-class`。

## 动手实验

- 列表增删过渡 + 卡片↔详情共享元素 + 标签页切换 + 暗色圆形展开：[examples/css/17-view-transitions/](../../examples/css/17-view-transitions/index-01-view-transitions.html)

## 下一话预告

第 28 话《CSS 嵌套》——规则套规则，`&` 引用父选择器，Sass 的招牌语法终于成为原生标准，组件样式一个块内收拢。
