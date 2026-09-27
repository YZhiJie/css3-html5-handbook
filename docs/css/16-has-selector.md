# :has() 选择器（Relational Pseudo-class）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— `:has()` 是 CSS 选择器 20 年来最重要的语法变革：它让选择器从「只能向下/向后匹配」进化为「可以向上/向前匹配」，实现了真正的「父选择器」和「兄弟前置选择器」，大量过去必须用 JavaScript 实现的 UI 状态联动现在纯 CSS 就能完成。

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
| [index-01-has-selector.html](../../examples/css/16-has-selector/index-01-has-selector.html) | 父选择器基础 + 表单验证状态 + 卡片有图变布局 + 兄弟前置选择 + 数量感知布局 |

---

## 1. 概念解释

### 1.1 :has() 是什么

CSS 传统选择器的匹配方向是**单向**的：

```
.parent .child     /* 从 .parent 向下找 .child */
.prev + .next      /* 从 .prev 向后找 .next */
```

`:has()` 打破了单向限制，允许**反向匹配**：

```css
/* 包含 .child 的 .parent —— 父选择器 */
.parent:has(.child)

/* 后面跟着 .next 的 .prev —— 兄弟前置选择器 */
.prev:has(+ .next)

/* 包含 checked 复选框的 label */
label:has(input:checked)
```

### 1.2 解决什么问题

| 痛点 | 传统方案 | :has() 方案 |
| --- | --- | --- |
| 表单验证样式 | JS 监听 `input` 事件，切换类名 | `form:has(input:invalid)` |
| 卡片有图/无图布局 | JS 检测子元素，切换类名 | `.card:has(img)` |
| 导航栏有子菜单 | JS 检测 `<ul>`，添加箭头 | `li:has(ul)` |
| 数量感知布局 | JS 计算子元素数量，切换类名 | `.list:has(> :nth-child(5))` |
| 兄弟元素前置联动 | JS 监听事件，修改前一个元素 | `.a:has(+ .b)` |

### 1.3 底层原理

`:has()` 接受一个**相对选择器**（relative selector）作为参数，匹配「至少包含一个符合相对选择器的后代/兄弟元素」的元素。

浏览器在**样式重计算**阶段执行 `:has()` 匹配。与 JS 的 `querySelector` 不同，`:has()` 是声明式的——DOM 变化时浏览器自动重新评估，无需手动监听。

**性能考虑**：`:has()` 需要浏览器检查每个候选元素的后代/兄弟，复杂度高于普通选择器。现代浏览器通过「选择器筛选」（selector filtering）优化：先快速排除不可能的候选，再对剩余元素执行 `:has()` 检查。

---

## 2. 语法说明

### 2.1 基本语法

```css
/* 相对选择器作为参数 */
:has(<relative-selector>)

/* 示例 */
div:has(p)              /* 包含 <p> 的 <div> */
div:has(> img)          /* 直接子元素包含 <img> 的 <div> */
div:has(+ p)            /* 后面紧跟 <p> 的 <div> */
div:has(~ p)            /* 后面有 <p> 兄弟的 <div> */
```

### 2.2 与其他选择器组合

```css
/* 与类选择器组合 */
.card:has(.card-image) { /* 有图片的卡片 */ }

/* 与属性选择器组合 */
form:has([required]) { /* 包含必填字段的表单 */ }

/* 与伪类组合 */
label:has(input:checked) { /* 复选框已选中的 label */ }
label:has(input:focus-visible) { /* 输入框聚焦的 label */ }

/* 与否定伪类组合 */
.card:not(:has(img)) { /* 没有图片的卡片 */ }
```

### 2.3 多个条件

```css
/* AND：同时满足 */
form:has(input:invalid):has(button:not([disabled])) { }

/* OR：逗号分隔 */
.card:has(img), .card:has(video) { }

/* 嵌套 :has() */
div:has(> section:has(article)) { }
```

### 2.4 数量感知

```css
/* 至少有 5 个子元素 */
.list:has(> :nth-child(5)) { }

/* 恰好 3 个子元素 */
.list:has(> :nth-child(3):last-child) { }

/* 最多 3 个子元素 */
.list:not(:has(> :nth-child(4))) { }

/* 奇数个 */
.list:has(> :nth-child(odd):last-child) { }
```

### 2.5 伪元素中的 :has()

```css
/* :has() 不能用于伪元素内部，但可以作为伪元素的宿主条件 */
.card:has(img)::before {
  content: "📷";
}
```

---

## 3. 浏览器兼容性

| 浏览器 | 版本 | 发布时间 |
| --- | --- | --- |
| Chrome / Edge | 105+ | 2022-08 |
| Firefox | 121+ | 2023-12 |
| Safari | 15.4+ | 2022-03 |

> 2023 年底起全面可用。Safari 是最早支持的浏览器（15.4），Firefox 最晚（121）。旧浏览器需 `@supports selector(:has(*))` 做特性检测降级。

---

## 4. 使用场景示例

### 场景 1：表单验证状态

```css
/* 有无效输入的表单高亮边框 */
form:has(input:invalid) {
  border-color: #ef4444;
}

/* 有无效输入的提交按钮禁用 */
form:has(input:invalid) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
}

/* 聚焦的输入框的 label 高亮 */
label:has(input:focus-visible) {
  color: #3b82f6;
  font-weight: 600;
}
```

### 场景 2：卡片有图/无图布局

```css
/* 有图片的卡片：图片在上，文字在下 */
.card:has(img) {
  display: flex;
  flex-direction: column;
}
.card:has(img) img {
  order: -1;
  margin-bottom: 12px;
}

/* 没有图片的卡片：纯文字，更大内边距 */
.card:not(:has(img)) {
  padding: 32px;
}
```

### 场景 3：导航栏有子菜单

```css
/* 有子菜单的 li 添加箭头 */
li:has(> ul) > a::after {
  content: " ▼";
  font-size: 0.8em;
}

/* 悬停时展开子菜单 */
li:has(> ul):hover > ul {
  display: block;
}
```

### 场景 4：数量感知布局

```css
/* 网格项 ≤ 3 个时，每项更大 */
.grid:has(> :nth-child(3):last-child) .item {
  font-size: 1.2em;
}

/* 网格项 ≥ 6 个时，每项更小 */
.grid:has(> :nth-child(6)) .item {
  font-size: 0.85em;
}

/* 奇数项时最后一个居中 */
.grid:has(> :nth-child(odd):last-child) .item:last-child {
  grid-column: 1 / -1;
  justify-self: center;
}
```

### 场景 5：兄弟前置选择

```css
/* 后面跟着 <figcaption> 的 <img> */
img:has(+ figcaption) {
  border-radius: 8px 8px 0 0;
}

/* 后面跟着 <aside> 的 <main> 调整宽度 */
main:has(+ aside) {
  width: 70%;
}
```

---

## 5. 实际应用案例分析

### 案例：电商产品卡片重构

**背景**：某电商产品卡片组件，产品可能有图也可能无图（缺货/下架），有促销标签也可能没有。原有方案用 JS 在渲染时检测子元素，动态添加类名：

```js
// 改造前：JS 检测 + 类名切换
function renderCard(product) {
  const card = document.createElement('div');
  card.className = 'card';
  if (product.image) card.classList.add('has-image');
  if (product.badge) card.classList.add('has-badge');
  if (product.soldOut) card.classList.add('is-sold-out');
  // ... 更多条件
}
```

问题：

- JS 与 CSS 耦合，样式逻辑分散在两个地方；
- 服务端渲染（SSR）时 JS 未执行，样式闪烁；
- 新增状态需要同时改 JS 和 CSS。

**改造后**：

```css
/* 有图片的卡片 */
.card:has(img) {
  grid-template-rows: auto 1fr auto;
}
.card:has(img) img {
  aspect-ratio: 1;
  object-fit: cover;
}

/* 有促销标签的卡片 */
.card:has(.badge) {
  border-color: #ef4444;
}

/* 已售罄的卡片（包含 disabled 按钮） */
.card:has(button[disabled]) {
  opacity: 0.6;
}
.card:has(button[disabled]) img {
  filter: grayscale(1);
}

/* 有图片但已售罄的卡片：图片置灰 + 徽章显示 */
.card:has(img):has(button[disabled]) .badge {
  display: block;
}
```

**收益**：

- 样式逻辑全部收拢到 CSS，JS 只负责数据渲染；
- SSR 首屏样式正确，无闪烁；
- 新增状态只需在 CSS 中添加 `:has()` 规则。

---

## 6. 最佳实践与常见坑

1. **性能考虑**：`:has()` 的匹配成本高于普通选择器。避免在 `:has()` 中使用过于宽泛的相对选择器（如 `div:has(*)`），尽量缩小范围（如 `div:has(> img)`）。
2. **特异性计算**：`:has()` 的特异性由参数中最具体的选择器决定。`.card:has(#id)` 的特异性是 (1,1,0)——`#id` 贡献了 ID 级特异性。
3. **不能嵌套 :has()**：`:has(:has(...))` 不被支持。如需多层条件，拆分为多个规则。
4. **伪元素限制**：`:has()` 不能用于伪元素内部，也不能匹配伪元素（`div:has(::before)` 无效）。
5. **与 :not() 的组合**：`:not(:has(...))` 是合法的，表示「不包含…的元素」。注意这与 `:has(:not(...))` 语义不同。
6. **DOM 变化自动响应**：`:has()` 是声明式的——JS 添加/移除子元素时，`:has()` 匹配自动更新，无需手动触发重排。
7. **降级方案**：不支持时用 `@supports not selector(:has(*))` 包裹静态样式或 JS 回退。对于渐进增强场景（如 `:has()` 只负责装饰性样式），不降级也安全。
8. **与 JS 的边界**：`:has()` 适合**基于 DOM 结构/状态的样式联动**。如果需要基于数据（如 API 返回的状态）的样式，仍需 JS 设置类名或 `data-*` 属性，然后用 `:has()` 匹配。

---

## 7. 参考资料

- [MDN: :has()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:has)
- [Can I use: :has()](https://caniuse.com/css-has)
- [CSS Spec: Selectors Level 4 — :has()](https://drafts.csswg.org/selectors-4/#relational)
- [web.dev: :has() — the family selector](https://web.dev/articles/has)
- [CSS-Tricks: :has() recipes](https://css-tricks.com/css-has-recipes/)
