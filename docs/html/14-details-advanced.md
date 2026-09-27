# details 与 summary 进阶

> 面向前端开发人员的 HTML5 高级特性参考资料 —— `<details>`/`<summary>` 是浏览器原生折叠面板，无需 JS 即可实现展开/收起。进阶用法包括 `::details-content` 伪元素动画、互斥手风琴（exclusive accordion）、`open` 属性控制、以及与 View Transitions 配合的平滑高度过渡。告别手风琴组件库，原生就能打。

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
| [index-01-details-advanced.html](../../examples/html/14-details-advanced/index-01-details-advanced.html) | 基础折叠 + 互斥手风琴 + ::details-content 动画 + open 属性控制 + 与 View Transitions 配合 |

---

## 1. 概念解释

### 1.1 details/summary 是什么

`<details>` 是 HTML5 原生折叠容器，`<summary>` 是其可见标题。点击 summary 切换 `open` 属性，浏览器自动展开/收起内容：

```html
<details>
  <summary>点击展开</summary>
  <p>隐藏的内容</p>
</details>
```

零 JS、零 CSS，天然支持键盘（Enter/Space 切换）和屏幕阅读器。

### 1.2 解决什么问题

| 痛点 | 传统方案 | details/summary 方案 |
| --- | --- | --- |
| FAQ 折叠面板 | 引入 accordion 组件库 | 原生 `<details>` 零依赖 |
| 手风琴互斥（只开一个） | JS 监听点击，关闭其他 | `name` 属性声明互斥组 |
| 展开/收起动画 | 手写 height 过渡或 JS 动画 | `::details-content` 伪元素 + CSS transition |
| 默认展开某项 | JS 初始化 | `open` 属性直接写在 HTML |

### 1.3 底层原理

- **`open` 属性**：布尔属性，存在即展开，不存在即收起。浏览器通过 `toggle` 事件通知状态变化。
- **`::details-content` 伪元素**（Chrome 131+）：选中 `<details>` 的内容区域（不含 `<summary>`），可对其应用 `height`、`opacity`、`transform` 过渡。
- **互斥手风琴**：多个 `<details>` 使用相同 `name` 属性，浏览器自动保证同一时刻最多一个处于 `open` 状态。
- **高度动画**：传统 `height: auto` 无法过渡；`::details-content` 结合 `interpolate-size: allow-keywords`（Chrome 129+）实现平滑高度动画。

---

## 2. 语法说明

### 2.1 基础结构

```html
<details open>                    <!-- open：默认展开 -->
  <summary>标题</summary>          <!-- 可点击区域 -->
  <div class="content">内容</div>  <!-- 任意内容 -->
</details>
```

| 属性/元素 | 说明 |
| --- | --- |
| `open` | 布尔属性，控制展开状态 |
| `name` | 字符串，相同 name 的 details 互斥（同时只开一个） |
| `<summary>` | 必须作为 `<details>` 的第一个子元素 |

### 2.2 ::details-content 伪元素动画

```css
/* 选中 details 的内容区域（不含 summary） */
details::details-content {
  transition: height 0.3s ease, opacity 0.3s ease;
  height: 0;
  opacity: 0;
}
details[open]::details-content {
  height: auto;   /* 需 interpolate-size 支持 */
  opacity: 1;
}

/* 允许 height: auto 过渡（Chrome 129+） */
:root {
  interpolate-size: allow-keywords;
}
```

### 2.3 互斥手风琴

```html
<details name="faq">
  <summary>问题 1</summary>
  <p>答案 1</p>
</details>
<details name="faq">
  <summary>问题 2</summary>
  <p>答案 2</p>
</details>
```

- 相同 `name` 的 details 自动互斥，无需 JS。
- 浏览器支持：Chrome 120+、Safari 17.2+、Firefox 130+。

### 2.4 自定义 summary 标记

```css
summary {
  list-style: none;   /* 隐藏默认三角 */
  cursor: pointer;
}
summary::after {
  content: '+';
  float: right;
}
details[open] summary::after {
  content: '-';
}
```

---

## 3. 浏览器兼容性

| 浏览器 | 基础 details | name 互斥 | ::details-content |
| --- | --- | --- | --- |
| Chrome / Edge | 12+（2011） | 120+（2023） | 131+（2024） |
| Safari | 6+（2012） | 17.2+（2023） | 18.4+（2024） |
| Firefox | 49+（2016） | 130+（2024） | 136+（2025） |

基础功能全绿；`::details-content` 与 `interpolate-size` 为 2024 新特性，建议 `@supports` 渐进增强。

---

## 4. 使用场景示例

### 4.1 FAQ 手风琴（互斥）

```html
<details name="faq">
  <summary>如何退款？</summary>
  <p>7 天内无理由退款。</p>
</details>
<details name="faq">
  <summary>支持哪些支付？</summary>
  <p>微信、支付宝、银行卡。</p>
</details>
```

### 4.2 带过渡动画的折叠面板

```css
details::details-content {
  transition: height 0.3s ease;
  height: 0;
}
details[open]::details-content {
  height: auto;
}
```

### 4.3 嵌套折叠（目录树）

```html
<details>
  <summary>第一章</summary>
  <details>
    <summary>1.1 节</summary>
    <p>内容</p>
  </details>
</details>
```

### 4.4 与 View Transitions 配合

```js
details.addEventListener('toggle', () => {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      // DOM 已更新，VT 自动拍快照
    });
  }
});
```

---

## 5. 实际应用案例分析

**场景：文档站点的「目录 + 内容」折叠导航。**

旧实现：引入 accordion 组件库（~15KB），JS 控制互斥，CSS 手写 height 动画。

迁移后：

1. **结构**：`<details name="nav">` 互斥组，零 JS。
2. **动画**：`::details-content` + `interpolate-size: allow-keywords` 实现平滑高度过渡。
3. **样式**：`summary::after` 自定义 +/- 标记，与品牌色对齐。

收益：删除组件库依赖，包体积减少 15KB，可访问性天然达标。

---

## 6. 最佳实践与常见坑

1. **`<summary>` 必须是第一个子元素**：否则浏览器会忽略 `<summary>`，整个 details 无法折叠。
2. **`height: auto` 过渡需 `interpolate-size`**：Chrome 129+ 支持，否则 `::details-content` 的 height 过渡无效；可用 `grid-template-rows: 0fr/1fr` 作为降级方案。
3. **互斥 `name` 不要与表单 `name` 混淆**：details 的 `name` 仅用于互斥分组，不提交表单数据。
4. **默认展开**：`open` 属性直接写在 HTML 中，比 JS 初始化更可靠（SSR 友好）。
5. **动画性能**：`::details-content` 的 height 过渡会触发重排；内容复杂时考虑 `content-visibility: auto` 优化。
6. **降级处理**：不支持 `::details-content` 的浏览器退化为无动画的瞬时展开，功能不受影响。

---

## 7. 参考资料

- [HTML Standard：details](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element)
- [MDN：details](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details)
- [MDN：::details-content](https://developer.mozilla.org/en-US/docs/Web/CSS/::details-content)
- [web.dev：details 动画](https://developer.chrome.com/docs/css-ui/details-content)
- 相关文档：[View Transitions 进阶（CSS 篇 24）](../css/24-view-transitions-advanced.md) ｜ [@starting-style（CSS 篇 22）](../css/22-starting-style.md)
