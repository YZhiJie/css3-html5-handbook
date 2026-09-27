# View Transitions（视图过渡）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— `document.startViewTransition()` 与 `view-transition-name` 让「DOM 状态变化」变成一场自动补间的过场动画：浏览器对旧状态和新状态各拍一张快照，交叉淡入淡出，并可对指定元素做位置/尺寸补间。过去需要手写 FLIP 动画（First-Last-Invert-Play）的页面切换、列表增删、图片放大，现在一行 JS + 几行 CSS 即可完成。

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
| [index-01-view-transitions.html](../../examples/css/17-view-transitions/index-01-view-transitions.html) | 列表增删过渡 + 卡片↔详情共享元素 + 标签页切换 + view-transition-class 批量复用 |

---

## 1. 概念解释

### 1.1 View Transitions 是什么

传统 DOM 更新是「瞬间切换」——上一帧还是旧内容，下一帧直接变成新内容，中间没有过渡。

View Transitions API 把 DOM 更新包装成一场**快照过渡动画**：

```js
document.startViewTransition(() => {
  // 在这个回调里做 DOM 更新（增删改、切换类名、换路由…）
  list.removeChild(item);
});
```

浏览器自动完成三件事：

1. **拍旧照**：更新前对页面（或指定元素）渲染一张位图快照；
2. **执行更新**：运行回调，DOM 变为新状态；
3. **拍新照 + 补间**：对新状态再拍一张快照，旧照淡出、新照淡入，名字相同的元素对做位置/尺寸补间。

### 1.2 解决什么问题

| 痛点 | 传统方案 | View Transitions 方案 |
| --- | --- | --- |
| 列表项增删跳动 | 手写 FLIP：记录位置→更新→计算差值→transform 补间 | 给每项加 `view-transition-name`，一行 `startViewTransition` |
| 卡片→详情放大 | JS 克隆元素 + 全屏定位 + 动画 | 两处元素共用 `view-transition-name`，自动补间 |
| SPA 路由切换生硬 | 手动维护离场/入场两套类名 | 路由渲染包一层 `startViewTransition` |
| 暗色模式切换闪烁 | 全屏遮罩 + 淡入淡出 | `startViewTransition` 切换 class，圆形展开动画 |

FLIP 动画是社区多年摸索出的最佳实践，但实现繁琐（约 50 行 JS），且容易在快速连续操作时穿帮。View Transitions 把这套模式**收进了浏览器**，开发者只需声明「谁在动」。

### 1.3 底层原理

一次视图过渡会产生一棵**伪元素树**，可以在 DevTools 的 Animations 面板里看到：

```
::view-transition                    ← 过渡根（覆盖整个视口）
└── ::view-transition-group(root)    ← 每组一个容器，负责位置/尺寸补间
    ├── ::view-transition-old(root)  ← 旧快照（位图）
    └── ::view-transition-new(root)  ← 新快照（位图）
```

- `::view-transition-old` / `::view-transition-new` 本质是**静态位图**，类似 `<img>`，因此过渡期间原元素不响应交互——这就是为什么浏览器在过渡期间会阻止页面点击。
- 默认动画只有一组：旧快照 `fade-out`，新快照 `fade-in`（各 250ms）。
- 设置 `view-transition-name` 的元素会**脱离根快照**，成为独立的 group，浏览器对比它在新旧两帧的位置和尺寸，自动生成补间动画——这就是「共享元素过渡」。
- 整个过程发生在合成器线程，动画流畅且不会阻塞主线程渲染。

---

## 2. 语法说明

### 2.1 基本用法

```js
// 最小示例：DOM 更新包一层即可
document.startViewTransition(() => {
  updateDOM();
});

// 返回值是 ViewTransition 对象，带三个 Promise
const vt = document.startViewTransition(() => updateDOM());

vt.ready.then(() => console.log('快照完成，动画即将开始'));
vt.finished.then(() => console.log('动画播放完毕'));
vt.updateCallbackDone.then(() => console.log('DOM 更新回调已执行完'));
```

> 回调可以是同步函数，也可以返回 Promise——浏览器会等 Promise 解决后才拍新快照，适合「先请求数据再渲染」的场景。

### 2.2 view-transition-name — 让元素独立补间

```css
/* 给元素命名（同一时刻页面内必须唯一） */
.avatar { view-transition-name: user-avatar; }

/* 动态元素可用 JS 在过渡前临时命名 */
clickedCard.style.viewTransitionName = 'active-card';
```

**关键规则**：

- `view-transition-name` 必须**唯一**——同一帧出现两个同名元素，过渡会跳过（控制台有警告）。
- 值为 `none`（默认）表示不参与独立补间；`auto` 由浏览器分配（配合 `view-transition-class` 使用更方便）。
- 名字相同的旧元素和新元素会自动配对：旧位置 → 新位置、旧尺寸 → 新尺寸，平滑补间。

### 2.3 自定义过渡动画

```css
/* 全局：改默认交叉淡化的时长与缓动 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 400ms;
  animation-timing-function: ease-in-out;
}

/* 针对某个命名组自定义 */
::view-transition-old(active-card) {
  animation: 300ms ease-out fade-out;
}
::view-transition-new(active-card) {
  animation: 300ms ease-in fade-in;
}

/* group 容器负责位置/尺寸补间，也可以改 */
::view-transition-group(active-card) {
  animation-duration: 500ms;
}
```

### 2.4 view-transition-class — 批量复用动画

很多元素需要同一套动画（如列表里每一项），逐个起名写规则太啰嗦：

```css
/* 给所有列表项分配唯一名（可用 auto 或 JS 生成） */
.todo-item { view-transition-name: auto; }

/* 用 class 统一声明动画 */
.todo-item { view-transition-class: todo; }

::view-transition-old(todo) { animation: 200ms ease-out slide-out; }
::view-transition-new(todo) { animation: 200ms ease-in slide-in; }
```

一个元素可带多个 class：`view-transition-class: todo card;`

### 2.5 过渡类型（types）—— 按场景换动画

```js
// 前进/后退用不同动画
document.startViewTransition({
  update: () => navigate(url),
  types: ['slide-forward'],   // 或 ['slide-backward']
});
```

```css
/* 只在类型匹配时生效 */
html:active-view-transition-type(slide-forward)::view-transition-old(root) {
  animation-name: slide-to-left;
}
html:active-view-transition-type(slide-backward)::view-transition-old(root) {
  animation-name: slide-to-right;
}
```

### 2.6 跳过/禁用过渡

```js
const vt = document.startViewTransition(() => updateDOM());
vt.skipTransition();   // DOM 照常更新，但不播放动画
```

```css
/* 用户偏好减少动画时全局禁用 */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

### 2.7 跨文档视图过渡（MPA，了解即可）

多页应用之间也能过渡，需要页面双方加：

```css
@view-transition { navigation: auto; }
```

配合 `:active-view-transition` 定制。目前仅 Chromium 系支持（Chrome 126+），可作渐进增强。

---

## 3. 浏览器兼容性

| 特性 | Chrome | Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| 同文档 `startViewTransition()` | 111+（2023-03） | 111+ | 128+（2024-07） | 18+（2024-09） |
| `view-transition-class` | 125+ | 125+ | 128+ | 18.2+ |
| 过渡类型 types | 125+ | 125+ | 128+ | 18.2+ |
| 跨文档 `@view-transition` | 126+ | 126+ | ❌ | ❌ |

> 2024 年底起三大引擎均已支持同文档视图过渡。未支持的浏览器调用 `document.startViewTransition` 会抛 `TypeError`（函数不存在），必须做特性检测降级。

---

## 4. 使用场景示例

### 场景 1：列表增删过渡

```js
function removeItem(el) {
  if (!document.startViewTransition) { el.remove(); return; }  // 降级
  el.style.viewTransitionName = 'removing';      // 临时命名
  document.startViewTransition(() => el.remove());
}
```

```css
::view-transition-old(removing) {
  animation: 250ms ease-out both slide-out;
}
@keyframes slide-out {
  to { transform: translateX(100%); opacity: 0; }
}
```

### 场景 2：卡片 → 详情共享元素

```css
/* 列表卡片和详情页头图共用同一个名字 */
.card.is-active,
.detail-hero {
  view-transition-name: hero-image;
}
```

```js
card.addEventListener('click', () => {
  document.startViewTransition(() => {
    card.classList.add('is-active');   // 旧状态：卡片上有名字
    renderDetail();                    // 新状态：详情头图有名字
  });
});
```

浏览器自动把「小卡片图」补间成「详情大图」，位置、尺寸、圆角全部平滑过渡。

### 场景 3：标签页切换

```js
tabs.forEach(tab => tab.addEventListener('click', () => {
  document.startViewTransition(() => {
    document.querySelector('.panel.active')?.classList.remove('active');
    document.querySelector(`#${tab.dataset.target}`).classList.add('active');
  });
}));
```

```css
.panel { view-transition-name: none; }
.panel.active { view-transition-name: panel; }
::view-transition-old(panel) { animation: 180ms ease-out fade-out; }
::view-transition-new(panel) { animation: 250ms 80ms ease-in both fade-in; }
```

### 场景 4：暗色模式圆形展开

```js
toggleBtn.addEventListener('click', (e) => {
  const x = e.clientX, y = e.clientY;
  const vt = document.startViewTransition(() => {
    document.documentElement.classList.toggle('dark');
  });
  vt.ready.then(() => {
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.animate(
      { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 500, pseudoElement: '::view-transition-new(root)' }
    );
  });
});
```

---

## 5. 实际应用案例分析

### 案例：图片画廊「点击放大」改造

**背景**：某作品集网站，缩略图网格点击后打开全屏查看器。原方案手写 FLIP（约 80 行 JS），问题频发：

- 快速连点两张图时，第一张的补间未结束，位置计算错乱；
- 滚动状态下打开，克隆元素定位偏差；
- 图片懒加载未完成时快照闪白。

**改造后**（核心代码约 15 行）：

```js
let current = null;

function openViewer(img) {
  if (current) return;
  current = img;
  document.startViewTransition(() => {
    img.style.viewTransitionName = 'zoom';        // 旧状态命名
    viewer.src = img.src;
    viewer.style.viewTransitionName = 'zoom';     // 新状态同名
    viewer.show();                                // 显示查看器
  }).finished.finally(() => {
    viewer.style.viewTransitionName = 'none';     // 动画结束释放名字
  });
}

function closeViewer() {
  document.startViewTransition(() => {
    viewer.close();
    current.style.viewTransitionName = 'none';
    current = null;
  });
}
```

```css
::view-transition-group(zoom) { animation-duration: 350ms; }
::view-transition-old(zoom),
::view-transition-new(zoom) { animation: none; }  /* 只要位置补间，不要淡化 */
```

**收益**：

- JS 从 80 行降到 15 行，且无需关心位置计算；
- 浏览器自动处理「上一个动画未结束又来一个」——新过渡从当前快照状态接续，不穿帮；
- 快照是位图，懒加载图片未完成时显示占位，不闪白。

**注意**：`viewTransitionName` 用完要释放（设回 `none`），否则下次命名可能冲突。

---

## 6. 最佳实践与常见坑

1. **名字必须唯一**：同一帧两个同名 `view-transition-name` 会导致整组过渡被跳过。动态列表建议「过渡前临时命名、结束后释放」，或用 `view-transition-class`。
2. **务必特性检测**：`if (!document.startViewTransition) { updateDOM(); return; }`——直接调用在不支持的浏览器会抛错，DOM 更新丢失。
3. **回调里只做 DOM 更新**：不要在里面做耗时计算或同步请求。回调可以返回 Promise（等数据再拍新照），但等待期间页面停留在旧快照，超过几秒会有「假死」感。
4. **过渡期间页面不可交互**：快照是位图，输入事件被屏蔽。动画时长建议控制在 200~500ms，避免影响操作。
5. **大页面快照成本**：默认对整个视口拍快照。如果只有局部变化，给容器单独命名可以缩小快照范围，减少内存与光栅化开销。
6. **`::view-transition-group` 的默认动画**：只补间 `transform`（位置）和 `width/height`（尺寸快照缩放）。`border-radius`、`background` 等差异由 old/new 两张位图交叉淡化遮盖，视觉上是平滑的，但并非真正逐属性补间。
7. **配合 prefers-reduced-motion**：用 `::view-transition-group(*) { animation: none }` 一行全局禁用，尊重用户偏好。
8. **与滚动驱动动画正交**：View Transitions 处理「离散状态切换」，滚动驱动动画处理「连续滚动进度」，两者可叠加使用（如路由切换过渡 + 新页面内滚动视差）。

---

## 7. 参考资料

- [MDN: View Transition API](https://developer.mozilla.org/zh-CN/docs/Web/API/View_Transition_API)
- [Can I use: View Transitions](https://caniuse.com/view-transitions)
- [Chrome for Developers: View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions)
- [WICG Spec: View Transitions](https://drafts.csswg.org/css-view-transitions/)
- [web.dev: View Transitions case studies](https://web.dev/articles/view-transitions)
