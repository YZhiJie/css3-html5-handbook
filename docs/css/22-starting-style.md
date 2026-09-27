# @starting-style 与入场/离场动画

> 面向前端开发人员的 CSS3 高级特性参考资料 —— `@starting-style` 补上了 CSS 过渡的最后一块拼图：让「从无到有」的元素（新插入 DOM、`display: none` 切换、Popover 打开）也能从指定的起始状态平滑过渡到最终状态。配合 `transition-behavior: allow-discrete`，连 `display`、`overlay` 这些「离散属性」都能参与过渡，入场/离场动画从此可以纯 CSS 完成。

## 目录

- [1. 概念解释 —— 是什么、解决什么问题、底层原理](#1-概念解释)
- [2. 语法说明 —— 完整语法、属性/参数表、代码片段](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（单文件 HTML，双击即开）：

| 示例文件 | 演示内容 |
| --- | --- |
| [index-01-starting-style.html](../../examples/css/22-starting-style/index-01-starting-style.html) | 新节点入场 + display 切换过渡 + Popover 进出场 + allow-discrete 离场 + 纯 CSS Toast |

---

## 1. 概念解释

### 1.1 @starting-style 是什么

`@starting-style` 是一条 CSS 规则，用来声明元素**「参与过渡之前的起始样式」**：

```css
.card {
  opacity: 1;
  translate: 0 0;
  transition: opacity .3s, translate .3s;
}
@starting-style {
  .card {
    opacity: 0;
    translate: 0 12px;   /* 入场前：透明 + 下沉 12px */
  }
}
```

浏览器在**首次渲染前**读入这组样式作为过渡起点，然后平滑过渡到常规样式——元素「凭空出现」时不再闪跳，而是淡入上浮。

### 1.2 解决什么问题

| 痛点 | 传统方案 | @starting-style 方案 |
| --- | --- | --- |
| 新插入 DOM 的元素无入场过渡 | JS 先加 `.enter` 类，下一帧再删掉 | 纯 CSS 声明起点，浏览器自动过渡 |
| `display: none` → `block` 无动画 | 两帧内切换 class、强制 reflow | `allow-discrete` + `@starting-style` |
| Popover/dialog 弹出瞬间闪现 | JS 监听 toggle 事件手动加类 | `@starting-style` 直接作用于 `:popover-open` |
| 离场动画需要等动画结束再删节点 | `setTimeout` 与动画时长耦合 | `allow-discrete` 让 display 参与过渡，transitionend 后清理 |

### 1.3 底层原理

CSS 过渡的触发条件是「**同一元素在两个渲染帧之间，某属性的计算值发生变化**」。而新插入 DOM 或 `display: none` 切换的元素，第一帧就拥有最终样式——没有「前一帧的值」，过渡无从谈起。

`@starting-style` 的解法：

- **凭空造一帧**：浏览器在元素首次参与样式计算时，把 `@starting-style` 里的声明当作「第 0 帧」，与常规样式形成差值 → 过渡自然发生。
- **`transition-behavior: allow-discrete`**：默认 `display`、`overlay` 等离散属性在过渡中瞬间跳变；开启后浏览器把它们推迟到过渡结束时才切换（离场）或在开始时切换并配合 `@starting-style` 入场。
- **零 JS 时序**：整个流程由浏览器的样式/动画引擎驱动，无需 `requestAnimationFrame` 或 `setTimeout` 手动拆帧。

## 2. 语法说明

### 2.1 @starting-style 两种写法

```css
/* 写法一：独立 at-rule（推荐，可跨文件复用） */
@starting-style {
  .item {
    opacity: 0;
    scale: .8;
  }
}

/* 写法二：嵌套在规则内部（CSS 嵌套语法） */
.item {
  opacity: 1;
  scale: 1;
  transition: opacity .25s, scale .25s;

  @starting-style {
    opacity: 0;
    scale: .8;
  }
}
```

- 内部声明的优先级与同位置常规声明一致；「起点」只在**首次样式计算**时生效，之后不再参与。
- 对已经渲染过的元素无效——它只管「第一次」。

### 2.2 transition-behavior: allow-discrete

```css
.toast {
  display: block;
  opacity: 1;
  transition:
    opacity .3s,
    display .3s allow-discrete,   /* display 参与过渡：延迟到结束才切换 */
    overlay .3s allow-discrete;   /* top layer 同理 */
  transition-behavior: allow-discrete; /* 或简写：对该元素所有可过渡离散属性生效 */
}
```

| 值 | 含义 |
| --- | --- |
| `normal`（默认） | 离散属性瞬间跳变，不参与过渡 |
| `allow-discrete` | 离散属性参与过渡：入场时第一帧切到最终值（配合 `@starting-style` 有过渡效果），离场时延迟到过渡结束才切换 |

### 2.3 入场三件套（完整范式）

```css
/* 1️⃣ 终态：元素正常样式 */
.popover {
  opacity: 1;
  translate: 0 0;
  transition: opacity .25s ease, translate .25s ease, overlay .25s allow-discrete, display .25s allow-discrete;
}

/* 2️⃣ 起点：@starting-style */
@starting-style {
  .popover {
    opacity: 0;
    translate: 0 8px;
  }
}

/* 3️⃣ 离场：用 :not() 或 closed 态描述「离开时」的样式 */
.popover:not(:popover-open) {
  opacity: 0;
  translate: 0 8px;
}
```

三件套齐备后，打开 = 从起点过渡到终态，关闭 = 从终态过渡到「离场态」，display/overlay 由 `allow-discrete` 保证动画播完才隐藏。

### 2.4 与 @keyframes 的关系

- `@keyframes`：**主动动画**，不依赖状态变化，循环/无限播放都行，但无法表达「从样式 A 到样式 B」的语义。
- `transition` + `@starting-style`：**被动过渡**，语义清晰（状态变了所以动），天然适合入场/离场；缺点是只播一次、方向固定。

实践中两者搭配：进出场用 transition 三件套，加载中用 `@keyframes` 循环呼吸。

## 3. 浏览器兼容性

| 浏览器 | @starting-style | allow-discrete | 说明 |
| --- | --- | --- | --- |
| Chrome / Edge | 117+（2023-09） | 117+ | 首发 |
| Safari | 17.5+（2024-05） | 17.5+ | 已落地 |
| Firefox | 129+（2024-08） | 129+ | 已落地 |

主流浏览器 2024 年下半年已全绿，可放心用于生产；不支持的老浏览器直接无动画（功能正常）。

```css
/* 可选：能力检测分层 */
@supports (transition-behavior: allow-discrete) {
  .toast { transition: opacity .3s, display .3s allow-discrete; }
}
```

## 4. 使用场景示例

### 4.1 列表项新增入场

```css
.list-item {
  opacity: 1;
  translate: 0 0;
  transition: opacity .25s, translate .25s;
}
@starting-style {
  .list-item { opacity: 0; translate: -12px 0; }
}
```

```js
list.appendChild(newItem); // 自动淡入 + 右滑，无需手动加类
```

### 4.2 display 切换的淡入淡出

```css
.panel {
  display: block;
  opacity: 1;
  transition: opacity .2s, display .2s allow-discrete;
}
.panel.hidden {
  display: none;
  opacity: 0;
}
@starting-style {
  .panel { opacity: 0; }   /* 从 hidden 切回显示时淡入 */
}
```

### 4.3 Popover 进出场（黄金搭档）

```css
[popover] {
  opacity: 1;
  scale: 1;
  transition:
    opacity .2s, scale .2s,
    overlay .2s allow-discrete,
    display .2s allow-discrete;
}
[popover]:not(:popover-open) {
  opacity: 0;
  scale: .92;
}
@starting-style {
  [popover]:popover-open {
    opacity: 0;
    scale: .92;
  }
}
```

打开弹层：从 `.92` 放大淡入；关闭：缩到 `.92` 淡出后退出 top layer。零 JS。

### 4.4 Toast 自动消失

```css
.toast {
  opacity: 1;
  translate: 0 0;
  transition: opacity .3s, translate .3s, display .3s allow-discrete;
}
.toast.leaving {
  opacity: 0;
  translate: 0 -8px;
}
@starting-style {
  .toast { opacity: 0; translate: 0 8px; }
}
```

```js
toast.addEventListener('transitionend', () => toast.remove(), { once: true });
setTimeout(() => toast.classList.add('leaving'), 2400);
```

## 5. 实际应用案例分析

**场景：设计系统的 Toast / Notification 组件。**

旧实现：JS 维护两个 class（`.enter` / `.leave`），用 `requestAnimationFrame` 拆帧，`setTimeout` 与 CSS 时长硬编码同步；动画时长一改，JS 里的定时器全要跟着改。

迁移后：

1. **入场**：新节点插入即自动从 `@starting-style` 过渡到终态，JS 只负责 `appendChild`。
2. **离场**：定时器只负责加 `.leaving` 类，`transitionend` 后 `remove()`——CSS 时长是唯一事实源。
3. **Popover 化**：Toast 改用 `popover` 属性，免费获得 top layer 与 light dismiss，进出场动画直接作用于 `:popover-open` 状态。

收益：动画时序代码清零、CSS/JS 时长不再双写、SSR 输出的初始 HTML 自带正确动画语义。

## 6. 最佳实践与常见坑

1. **只对「首次渲染」生效**：已渲染过的元素再改样式，`@starting-style` 不会重新触发。需要「再次出现」的动画请先把元素 `display: none` 或移除 DOM。
2. **别忘 `allow-discrete`**：`display` / `overlay` 不写它，动画播到一半元素就消失了（离场）或入场无过渡。
3. **`@starting-style` 里别写 display**：起点规则中的 `display` 没有意义（元素要渲染才能过渡），把它留在常规声明里。
4. **优先级陷阱**：`@starting-style` 与常规声明同优先级——如果常规声明特异性更高，起点会被覆盖。保持两者特异性一致最稳妥。
5. **与 View Transitions 的分工**：单元素进出场用 `@starting-style`；跨页面/跨组件的共享元素转场用 View Transitions（见 `docs/css/17-view-transitions.md`）。
6. **Popover 的 `:popover-open`**：给 popover 做进出场时，起点规则写 `:popover-open` 选择器，离场用 `:not(:popover-open)`，别写裸 `[popover]`。
7. **性能**：`opacity` + `transform/translate/scale` 是最佳搭档（合成器动画）；避免在 `@starting-style` 里过渡 `width/height/top/left` 引发布局抖动。

## 7. 参考资料

- [CSS Transitions Level 2 — @starting-style（W3C）](https://www.w3.org/TR/css-transitions-2/#starting-style)
- [MDN：@starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style)
- [MDN：transition-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-behavior)
- [Chrome for Developers：Four new CSS features for smooth entry and exit animations](https://developer.chrome.com/blog/entry-exit-animations)
- 相关文档：[Popover API（HTML 篇 10）](../html/10-popover.md) ｜ [动画与过渡（CSS 篇 02）](02-animation-transition.md) ｜ [View Transitions（CSS 篇 17）](17-view-transitions.md)
