# Web Components 入门（template · slot · Custom Elements）

> 面向前端开发人员的 HTML5 高级特性参考资料 —— Web Components 三件套：`<template>` 惰性模板、`slot` 插槽分发、`customElements.define` 自定义元素，浏览器原生组件化方案，零依赖、跨框架复用。

## 目录

- [1. 概念解释](#1-概念解释)
- [2. 语法说明](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（单文件 HTML，双击即开）：

| 示例文件 | 演示内容 |
| --- | --- |
| [index-01-web-components.html](../../examples/html/16-web-components/index-01-web-components.html) | template 克隆 + slot 分发 + 自定义元素 + Shadow DOM 封装 |

---

## 1. 概念解释

### 1.1 解决什么问题

前端组件化长期依赖框架（React/Vue/Angular），跨框架复用组件几乎不可能。Web Components 提供**浏览器原生组件化**：

- `<template>`：惰性 HTML 模板，不渲染不执行，按需克隆。
- `<slot>`：插槽分发，组件定义占位符，使用者填充内容。
- `customElements.define`：注册自定义元素，标签名即组件名。
- **Shadow DOM**：样式与 DOM 隔离，组件内部不影响外部。

### 1.2 三件套协作

```
<template id="card">   ← 惰性模板（不渲染）
  <style>...</style>   ← Shadow DOM 内样式隔离
  <slot name="title"></slot>  ← 插槽占位
</template>

<user-card>            ← 自定义元素
  <span slot="title">标题</span>  ← 填充插槽
</user-card>
```

---

## 2. 语法说明

### 2.1 template：惰性模板

```html
<template id="user-card-tpl">
  <style>
    .card { border: 1px solid #ccc; padding: 16px; }
  </style>
  <div class="card">
    <slot name="avatar"></slot>
    <slot name="name"></slot>
  </div>
</template>

<script>
  const tpl = document.getElementById('user-card-tpl');
  const clone = tpl.content.cloneNode(true); // 克隆模板内容
  document.body.appendChild(clone);
</script>
```

- `<template>` 内的内容**不渲染、不执行脚本、不加载资源**。
- `tpl.content` 是 `DocumentFragment`，`cloneNode(true)` 深克隆。

### 2.2 slot：插槽分发

```html
<!-- 组件定义 -->
<template id="layout-tpl">
  <header><slot name="header"></slot></header>
  <main><slot></slot></main>  <!-- 默认插槽 -->
</template>

<!-- 使用 -->
<my-layout>
  <h1 slot="header">标题</h1>
  <p>正文内容</p>  <!-- 进入默认插槽 -->
</my-layout>
```

- `slot="name"` 指定插槽名；无 `slot` 属性进入默认插槽。
- 插槽内容在 Shadow DOM 渲染时「投影」到占位符位置。

### 2.3 customElements：注册自定义元素

```js
class UserCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const tpl = document.getElementById('user-card-tpl');
    shadow.appendChild(tpl.content.cloneNode(true));
  }
  
  connectedCallback() {
    // 元素插入 DOM 时调用
  }
  
  disconnectedCallback() {
    // 元素移出 DOM 时调用
  }
  
  attributeChangedCallback(name, oldVal, newVal) {
    // 监听属性变化
  }
  
  static get observedAttributes() {
    return ['data-user-id'];
  }
}

customElements.define('user-card', UserCard);
```

- 标签名必须含 `-`（如 `<user-card>`），避免与原生元素冲突。
- Shadow DOM `mode: 'open'` 允许外部通过 `element.shadowRoot` 访问；`'closed'` 完全封闭。

---

## 3. 浏览器兼容性

| 特性 | Chrome | Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| `<template>` | 26+ | 79+ | 22+ | 8+ |
| `<slot>` | 53+ | 79+ | 63+ | 10+ |
| Custom Elements v1 | 54+ | 79+ | 63+ | 10.1+ |
| Shadow DOM v1 | 53+ | 79+ | 63+ | 10+ |

> 全部现代浏览器均已支持，无需 Polyfill。

---

## 4. 使用场景示例

### 场景 1：跨框架按钮组件

```js
class NeonButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        button {
          background: linear-gradient(90deg, #22d3ee, #a78bfa);
          border: none; padding: 10px 20px; border-radius: 8px;
          color: #0b1220; font-weight: 700; cursor: pointer;
        }
      </style>
      <button><slot></slot></button>
    `;
  }
}
customElements.define('neon-button', NeonButton);
```

```html
<neon-button>点击我</neon-button>
```

React/Vue/Angular 项目里直接 `<neon-button>` 使用，零适配。

### 场景 2：卡片布局组件

```html
<template id="card-layout">
  <style>
    .card { display: grid; gap: 12px; padding: 16px; }
    .header { font-size: 18px; font-weight: 700; }
  </style>
  <div class="card">
    <div class="header"><slot name="title"></slot></div>
    <div><slot name="content"></slot></div>
    <div><slot name="footer"></slot></div>
  </div>
</template>

<card-layout>
  <span slot="title">文章标题</span>
  <p slot="content">正文内容...</p>
  <button slot="footer">阅读更多</button>
</card-layout>
```

---

## 5. 实际应用案例分析

**设计系统组件库**：团队维护一套「设计系统组件」，需要在 React 管理后台、Vue 移动端、原生 HTML 营销页三处复用。

- 用 Web Components 封装 `<ds-button>`、`<ds-card>`、`<ds-modal>`。
- Shadow DOM 隔离样式，三处项目样式互不干扰。
- 插槽分发内容，业务方填充文本/图片。
- 升级组件只需改一处，三处项目同步生效。

---

## 6. 最佳实践与常见坑

1. **标签名必须含 `-`**：`customElements.define('my-button')` 合法，`mybutton` 报错。
2. **Shadow DOM 样式隔离**：内部样式不影响外部，外部也不影响内部——用 CSS 自定义属性（`--*`）穿透。
3. **template 不执行脚本**：`<script>` 在 template 内不执行，克隆后也不执行——脚本放在自定义元素类里。
4. **插槽内容不移动**：插槽是「投影」不是「移动」，原始 DOM 仍在 Light DOM 中，只是渲染位置在 Shadow DOM 内。
5. **生命周期回调顺序**：`constructor` → `connectedCallback` → `attributeChangedCallback`（每个属性）→ `disconnectedCallback`。
6. **SSR 不友好**：Web Components 依赖 JS 运行，SSR 需 Declarative Shadow DOM（Chrome 90+ 支持）。

---

## 7. 参考资料

- [MDN — Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [MDN — template 元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template)
- [MDN — slot 元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot)
- [MDN — Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [caniuse — Custom Elements v1](https://caniuse.com/custom-elementsv1)
- [caniuse — Shadow DOM v1](https://caniuse.com/shadowdomv1)
