# 滚动驱动动画（Scroll-Driven Animations）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— `animation-timeline: scroll()` 与 `view()` 让 CSS 动画从「时间驱动」进化为「滚动驱动」，纯 CSS 实现滚动视差、进出场动画、进度条指示器，告别 JavaScript `scroll` 事件监听与 `getBoundingClientRect` 计算。

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
| [index-01-scroll-driven-animations.html](../../examples/css/15-scroll-driven-animations/index-01-scroll-driven-animations.html) | scroll() 页面进度条 + view() 进出场动画 + 命名时间轴滚动视差 + timeline-scope 跨元素联动 |

---

## 1. 概念解释

### 1.1 滚动驱动动画是什么

传统 CSS 动画（`@keyframes` + `animation`）由**时间**驱动——动画从 `0%` 播放到 `100%`，时长由 `animation-duration` 决定。

滚动驱动动画引入了新的时间轴：

| 时间轴类型 | 驱动方式 | 典型场景 |
| --- | --- | --- |
| **文档时间轴**（默认） | 页面加载后按时间播放 | 传统动画 |
| **滚动时间轴** `scroll()` | 元素/视口的滚动位置 | 阅读进度条、滚动指示器 |
| **视图时间轴** `view()` | 元素在视口中的可见进度 | 进出场动画、图片揭示 |

动画的 `0%` 和 `100%` 不再对应"第 0 秒"和"第 3 秒"，而是对应"滚动到起始位置"和"滚动到结束位置"。

### 1.2 解决什么问题

- **滚动视差**：多层背景以不同速度滚动，过去需要 JS 监听 `scroll` + `requestAnimationFrame` + `transform` 计算。
- **进出场动画**：元素进入视口时淡入上移，离开时淡出——过去需要 Intersection Observer + 类名切换。
- **阅读进度条**：顶部进度条随页面滚动增长——过去需要 JS 计算 `scrollTop / scrollHeight`。
- **性能**：JS 滚动监听在主线程执行，滚动驱动动画在**合成器线程**运行，不受主线程阻塞影响。

### 1.3 底层原理

滚动驱动动画的核心是 **Animation Timeline** 概念。CSS Animations Level 2 将时间轴从动画中解耦：

```
@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }

/* 传统：时间驱动 */
animation: slide-in 1s ease-out;

/* 滚动驱动：滚动位置决定播放进度 */
animation: slide-in linear;
animation-timeline: scroll();        /* 匿名滚动时间轴 */
animation-timeline: view();          /* 匿名视图时间轴 */
animation-timeline: --my-timeline;   /* 命名时间轴 */
```

浏览器将滚动位置映射为动画进度：`0%` = 滚动起始，`100%` = 滚动结束。`animation-duration` 被忽略，进度完全由滚动决定。

**scroll() vs view() 的区别**：

- `scroll()`：跟踪**滚动容器**的滚动进度。默认跟踪最近的滚动祖先（通常是视口）。
- `view()`：跟踪**元素自身**在视口中的可见进度。元素刚进入视口底部 = 0%，完全离开视口顶部 = 100%。

---

## 2. 语法说明

### 2.1 scroll() — 滚动时间轴

```css
/* 匿名滚动时间轴：跟踪最近的滚动祖先 */
.progress-bar {
  animation: grow linear;
  animation-timeline: scroll();
}

/* 指定轴方向：block（默认，垂直） | inline（水平） | x | y */
animation-timeline: scroll(block);
animation-timeline: scroll(inline);

/* 指定滚动容器 */
animation-timeline: scroll(root);      /* 视口滚动（默认） */
animation-timeline: scroll(nearest);   /* 最近滚动祖先 */
animation-timeline: scroll(self);      /* 元素自身滚动 */
```

### 2.2 view() — 视图时间轴

```css
/* 匿名视图时间轴：元素进入/离开视口的进度 */
.reveal {
  animation: fade-in-up linear;
  animation-timeline: view();
}

/* 指定进入范围（animation-range 的简写） */
animation-timeline: view(block);        /* 垂直方向（默认） */
animation-timeline: view(inline);       /* 水平方向 */

/* 使用 animation-range 精确控制触发范围 */
.reveal {
  animation: fade-in-up linear;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;  /* 刚进入视口就开始，完全进入时结束 */
}
```

### 2.3 animation-range — 精确控制触发区间

```css
/* 语法：animation-range: <start-name> <start-offset> <end-name> <end-offset> */

/* entry：元素进入视口 */
animation-range: entry 0% entry 100%;

/* exit：元素离开视口 */
animation-range: exit 0% exit 100%;

/* cover：元素覆盖视口的整个期间 */
animation-range: cover 0% cover 100%;

/* contain：元素完全包含在视口中的期间 */
animation-range: contain 0% contain 100%;

/* 组合：进入时播放到 50%，离开时从 50% 播放到 100% */
animation-range: entry 0% exit 100%;
```

范围名称对照表：

| 名称 | 含义 | 0% 位置 | 100% 位置 |
| --- | --- | --- | --- |
| `entry` | 进入视口 | 元素底边进入视口底边 | 元素顶边到达视口顶边 |
| `exit` | 离开视口 | 元素底边离开视口底边 | 元素顶边离开视口顶边 |
| `cover` | 覆盖视口 | 元素底边进入视口底边 | 元素顶边离开视口顶边 |
| `contain` | 完全可见 | 元素完全进入视口 | 元素开始离开视口 |

### 2.4 命名时间轴 — 跨元素联动

```css
/* 在滚动容器上声明命名时间轴 */
.scroll-container {
  scroll-timeline-name: --my-scroll;
  scroll-timeline-axis: block;
}

/* 在任何元素上使用 */
.parallax-layer {
  animation: parallax linear;
  animation-timeline: --my-scroll;
}

/* 视图时间轴同理 */
.card {
  view-timeline-name: --card-view;
  view-timeline-axis: block;
}

.card-image {
  animation: reveal linear;
  animation-timeline: --card-view;
}
```

### 2.5 timeline-scope — 扩大命名时间轴作用域

命名时间轴默认只对声明元素的后代可见。`timeline-scope` 让兄弟元素也能使用：

```css
.parent {
  timeline-scope: --shared-timeline;
}

.scroller {
  scroll-timeline-name: --shared-timeline;
}

.sibling-element {
  animation-timeline: --shared-timeline;
}
```

---

## 3. 浏览器兼容性

| 特性 | Chrome | Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| `animation-timeline: scroll()` | 115+（2023-07） | 115+ | 110+（2024-01） | 26+（2025-09） |
| `animation-timeline: view()` | 115+ | 115+ | 110+ | 26+ |
| 命名时间轴 | 115+ | 115+ | 110+ | 26+ |
| `timeline-scope` | 116+ | 116+ | 110+ | 26+ |
| `animation-range` | 115+ | 115+ | 110+ | 26+ |

> Safari 26（2025-09）是最后一个加入的主流浏览器。此前需 `@supports (animation-timeline: scroll())` 做特性检测降级。

---

## 4. 使用场景示例

### 场景 1：页面阅读进度条

```css
.progress-bar {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transform-origin: left;
  transform: scaleX(0);

  animation: progress linear;
  animation-timeline: scroll();
}

@keyframes progress {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

### 场景 2：卡片进入视口淡入

```css
.card {
  animation: fade-in-up linear;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 场景 3：滚动视差背景

```css
/* 前景正常滚动，背景慢速移动 */
.hero-bg {
  animation: slow-scroll linear;
  animation-timeline: scroll();
}

@keyframes slow-scroll {
  from { transform: translateY(0); }
  to   { transform: translateY(-200px); }
}
```

### 场景 4：图片滚动揭示

```css
.image-reveal {
  animation: clip-reveal linear;
  animation-timeline: view();
  animation-range: entry 25% cover 50%;
}

@keyframes clip-reveal {
  from { clip-path: inset(100% 0 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}
```

---

## 5. 实际应用案例分析

### 案例：长文阅读页改造

**背景**：某技术博客的长文页面，原有功能：

1. 顶部阅读进度条（JS `scroll` 监听 + 计算 `scrollTop / scrollHeight`）；
2. 章节标题进入视口时高亮（Intersection Observer）；
3. 配图懒加载揭示（Intersection Observer + 类名切换）。

**改造前 JS 代码**（约 60 行）：

```js
// 进度条
window.addEventListener('scroll', () => {
  const progress = window.scrollTop / (document.body.scrollHeight - innerHeight);
  progressBar.style.transform = `scaleX(${progress})`;
}, { passive: true });

// 章节高亮
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting));
}, { threshold: 0.5 });
document.querySelectorAll('.section-title').forEach(el => observer.observe(el));

// 图片揭示
const imgObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('revealed');
  });
}, { threshold: 0.3 });
document.querySelectorAll('.article-img').forEach(el => imgObserver.observe(el));
```

**改造后 CSS**（约 30 行，零 JS）：

```css
/* 进度条 */
.progress-bar {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 4px;
  background: #3b82f6;
  transform-origin: left;
  animation: progress linear;
  animation-timeline: scroll();
}
@keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* 章节高亮 */
.section-title {
  animation: highlight linear;
  animation-timeline: view();
  animation-range: entry 20% entry 80%;
}
@keyframes highlight { from { opacity: 0.3; } to { opacity: 1; } }

/* 图片揭示 */
.article-img {
  animation: reveal linear;
  animation-timeline: view();
  animation-range: entry 25% cover 50%;
}
@keyframes reveal { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0); } }
```

**收益**：

- JS 从 60 行降至 0 行；
- 动画在合成器线程运行，主线程不阻塞；
- `prefers-reduced-motion` 自动降级（动画进度停在当前位置而非播放）。

---

## 6. 最佳实践与常见坑

1. **animation-duration 被忽略**：滚动驱动动画的进度完全由滚动位置决定，写 `animation-duration: 3s` 无效。如需控制"播放速度"，调整 `animation-range` 的范围。
2. **动画填充模式**：默认 `animation-fill-mode: none`，元素在动画范围外会回到 `from` 状态。如需保持结束状态，加 `animation-fill-mode: both`。
3. **scroll() 的默认容器**：`scroll()` 跟踪最近的滚动祖先。如果元素在 `overflow: auto` 的容器内，会跟踪该容器而非视口。用 `scroll(root)` 强制跟踪视口。
4. **view() 的轴方向**：默认跟踪垂直（block）方向。水平滚动场景需写 `view(inline)`。
5. **animation-range 的默认值**：`view()` 默认 range 是 `cover 0% cover 100%`，即元素从进入视口底部到离开视口顶部的整个过程。这通常不是想要的效果——进出场动画建议用 `entry 0% entry 100%`。
6. **与 prefers-reduced-motion 的配合**：滚动驱动动画在用户开启减少动画时不会自动禁用，但动画进度会跟随滚动位置（而非时间播放），本质上已经是"减少动画"的行为。如需完全禁用，用 `@media (prefers-reduced-motion: reduce) { animation: none; }`。
7. **降级方案**：不支持时用 `@supports not (animation-timeline: scroll())` 包裹静态样式或 JS 回退。
8. **性能**：滚动驱动动画在合成器线程运行，不受主线程 JS 阻塞影响。但如果动画属性触发 layout（如 `width`、`height`），仍会走主线程。优先用 `transform` 和 `opacity`。

---

## 7. 参考资料

- [MDN: CSS scroll-driven animations](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_scroll-driven_animations)
- [Can I use: Scroll-driven animations](https://caniuse.com/mdn-css_properties_animation-timeline_scroll)
- [CSS Spec: Scroll-driven Animations](https://drafts.csswg.org/scroll-animations-1/)
- [web.dev: Scroll-driven animations](https://web.dev/articles/scroll-driven-animations)
- [Bramus: Scroll-driven animations tutorial](https://scroll-driven-animations.style/)
