# Observer 三件套（Intersection / Resize / Mutation）

> 面向前端开发人员的 HTML5 高级特性参考资料 —— 三大 Observer 是浏览器提供的「元素级事件总线」：`IntersectionObserver` 监听元素是否进入视口、`ResizeObserver` 监听元素尺寸变化、`MutationObserver` 监听 DOM 树增删改。它们把「scroll 监听 + getBoundingClientRect」「window.resize + offsetWidth」「轮询 DOM」这些性能黑洞，换成浏览器原生推送——懒加载、无限滚动、虚拟列表、响应式组件、水印防删，全靠这三件。

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
| [index-01-observers.html](../../examples/html/11-observers/index-01-observers.html) | 图片懒加载 + 无限滚动 + 吸顶导航 + ResizeObserver 响应式卡片 + MutationObserver DOM 变化日志 |

---

## 1. 概念解释

### 1.1 三大 Observer 是什么

浏览器把三类「元素状态变化」封装成推送式 API：

```js
// 1. IntersectionObserver：元素与视口/祖先的交叉状态
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => e.isIntersecting && loadImage(e.target));
});
io.observe(document.querySelector('img[data-src]'));

// 2. ResizeObserver：元素 content-box 尺寸变化
const ro = new ResizeObserver((entries) => {
  console.log('新宽度：', entries[0].contentRect.width);
});
ro.observe(document.querySelector('.card'));

// 3. MutationObserver：DOM 子树增删、属性变化
const mo = new MutationObserver((mutations) => {
  mutations.forEach(m => console.log(m.type, m.addedNodes));
});
mo.observe(document.body, { childList: true, subtree: true });
```

共同模式：`new XxxObserver(callback)` → `.observe(target, options?)` → 不再关心时 `.unobserve()` / `.disconnect()`。

### 1.2 解决什么问题

| 痛点 | 传统方案 | Observer 方案 |
| --- | --- | --- |
| 图片懒加载 | scroll + getBoundingClientRect 节流 | IntersectionObserver，浏览器合成器级推送 |
| 无限滚动 | scroll 到底部判断 | 哨兵元素进入视口即加载 |
| 响应式组件（卡片宽度变就换布局） | window.resize + offsetWidth | ResizeObserver 精确到元素 |
| 富文本编辑器内容变化 | 轮询 innerHTML / input 事件 | MutationObserver 推送所有增删改 |
| 水印防删 | 定时器检查 | MutationObserver 监听 DOM 移除立即重挂 |

### 1.3 底层原理

- **推送而非轮询**：Observer 由浏览器在**布局/绘制之后、下一帧之前**批量回调，自带节流，不会在 scroll/resize 高频触发。
- **异步批量**：回调拿到的 `entries` / `mutations` 是数组——同一帧内的多次变化合并成一次回调，天然防抖。
- **不阻塞主线程**：IntersectionObserver 的交叉计算在合成器线程完成，主线程只收结果；ResizeObserver 在布局后触发，读取 `contentRect` 不会强制 reflow。
- **生命周期手动管理**：不 unobserve 就持续推送，内存泄漏的常客——组件卸载时务必 `disconnect()`。

## 2. 语法说明

### 2.1 IntersectionObserver

```js
const io = new IntersectionObserver(callback, {
  root: null,            // 参照物：null=视口；或指定祖先元素
  rootMargin: '0px',     // 参照物边距：'100px' 提前 100px 触发（懒加载常用）
  threshold: [0, 0.5, 1] // 交叉比例阈值数组：进入 0%/50%/100% 时各触发一次
});

io.observe(el);      // 开始观察
io.unobserve(el);    // 停止观察单个
io.disconnect();     // 停止全部
```

回调参数 `entries` 每项：

| 字段 | 含义 |
| --- | --- |
| `isIntersecting` | 是否进入交叉区（最常用） |
| `intersectionRatio` | 可见比例 0~1 |
| `boundingClientRect` | 元素矩形（已算好，直接用） |
| `target` | 被观察的元素 |

### 2.2 ResizeObserver

```js
const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;   // content-box 尺寸
    // entry.borderBoxSize / entry.devicePixelContentBoxSize 更精确
  }
});
ro.observe(el, { box: 'border-box' });  // 可选：观察 border-box
```

- 观察 `display: none` 的元素：尺寸变化为 0 时也会触发（可用于检测隐藏）。
- **循环警告**：在回调里修改被观察元素的尺寸会触发 `ResizeObserver loop completed with undelivered notifications`——用 `requestAnimationFrame` 延迟修改可破。

### 2.3 MutationObserver

```js
const mo = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.type === 'childList') {
      console.log('新增节点：', m.addedNodes);
      console.log('移除节点：', m.removedNodes);
    }
    if (m.type === 'attributes') {
      console.log('属性变化：', m.attributeName, m.target);
    }
    if (m.type === 'characterData') {
      console.log('文本变化：', m.target.data);
    }
  }
});
mo.observe(target, {
  childList: true,        // 子节点增删
  attributes: true,       // 属性变化
  characterData: true,    // 文本内容变化
  subtree: true,          // 观察整个子树
  attributeFilter: ['class', 'style'],  // 只观察特定属性
  attributeOldValue: true // 记录旧值
});
```

## 3. 浏览器兼容性

| Observer | Chrome | Safari | Firefox | 说明 |
| --- | --- | --- | --- | --- |
| IntersectionObserver | 51+ | 12.1+ | 55+ | 2019 年起全绿 |
| ResizeObserver | 64+ | 13.1+ | 69+ | 2020 年起全绿 |
| MutationObserver | 26+ | 6+ | 14+ | 最老资格，全平台支持 |

均可放心用于生产；不支持的老浏览器可用 polyfill（`intersection-observer` 等）。

## 4. 使用场景示例

### 4.1 图片懒加载（IntersectionObserver）

```js
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const img = e.target;
    img.src = img.dataset.src;
    io.unobserve(img);   // 加载完即停止观察
  });
}, { rootMargin: '200px' });  // 提前 200px 加载，避免白屏

document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
```

### 4.2 无限滚动（哨兵模式）

```js
const sentinel = document.querySelector('#sentinel');
const io = new IntersectionObserver(([e]) => {
  if (e.isIntersecting) loadNextPage();
});
io.observe(sentinel);
```

### 4.3 吸顶导航（IntersectionObserver 替代 scroll）

```js
const io = new IntersectionObserver(([e]) => {
  header.classList.toggle('stuck', !e.isIntersecting);
});
io.observe(document.querySelector('#sentinel-top'));
```

### 4.4 响应式组件（ResizeObserver）

```js
const ro = new ResizeObserver(([e]) => {
  const w = e.contentRect.width;
  card.classList.toggle('compact', w < 400);
});
ro.observe(card);
```

### 4.5 富文本编辑器（MutationObserver）

```js
const mo = new MutationObserver(() => {
  const text = editor.innerText;
  if (text.length > 5000) showWarning('内容过长');
});
mo.observe(editor, { childList: true, characterData: true, subtree: true });
```

## 5. 实际应用案例分析

**场景：长列表 + 响应式卡片 + 水印防删的后台系统。**

旧架构：scroll 监听 300ms 节流做懒加载、window.resize 做卡片布局切换、定时器 1s 轮询水印节点。三个定时器/监听器在页面停留期间持续耗电。

迁移后：

1. **懒加载**：`IntersectionObserver` 观察所有 `img[data-src]`，`rootMargin: '200px'` 提前加载，加载完 `unobserve`。
2. **响应式卡片**：`ResizeObserver` 观察卡片容器，宽度变化时切换 `compact` 类——与 window.resize 解耦，卡片在侧边栏收起时也能正确响应。
3. **水印防删**：`MutationObserver` 观察 `document.body`，发现水印节点被移除立即重挂——比定时器更及时、更省 CPU。

收益：主线程从 3 个轮询循环中解放，滚动流畅度提升；卡片布局与窗口解耦，组件化更彻底；水印防删从「1 秒内发现」变为「下一帧发现」。

## 6. 最佳实践与常见坑

1. **用完即 disconnect**：组件卸载、路由切换时务必 `disconnect()`，否则 Observer 持续持有元素引用，内存泄漏。
2. **ResizeObserver 循环**：回调里直接改被观察元素尺寸会触发循环警告——用 `requestAnimationFrame(() => { ... })` 延迟到下一帧。
3. **IntersectionObserver 的 threshold 数组**：`threshold: [0, 0.5, 1]` 会在进入 0%、50%、100% 各触发一次；只关心「是否进入」用 `[0]` 或省略即可。
4. **rootMargin 提前量**：懒加载建议 `rootMargin: '100px~200px'`，避免用户滚动到才加载的白屏。
5. **MutationObserver 的 subtree 性能**：观察 `document.body` + `subtree: true` 会推送全页面变化，回调里务必快速过滤，别做重计算。
6. **SSR 场景**：Observer 是浏览器 API，Node 环境不存在——组件里用 `typeof IntersectionObserver !== 'undefined'` 做能力检测。
7. **与 @starting-style 的联动**：懒加载图片入场时用 `@starting-style` 做淡入，体验更顺滑（见 `docs/css/22-starting-style.md`）。

## 7. 参考资料

- [Intersection Observer API（MDN）](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Resize Observer API（MDN）](https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API)
- [MutationObserver（MDN）](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [W3C：Intersection Observer](https://www.w3.org/TR/intersection-observer/)
- [Chrome for Developers：IntersectionObserver v2](https://developer.chrome.com/blog/intersectionobserver-v2/)
- 相关文档：[@starting-style 入场动画（CSS 篇 22）](../css/22-starting-style.md) ｜ [Web Workers（HTML 篇 06）](06-web-workers.md) ｜ [响应式设计（CSS 篇 05）](../css/05-responsive.md)
