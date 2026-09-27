# @scope 作用域样式（Scoped Styles）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— `@scope` 让 CSS 第一次拥有了真正的「样式作用域」：规则只在指定根元素的子树内生效，还可以用 `to` 划定「甜甜圈」边界（外壳生效、内核不生效）。不依赖 Shadow DOM、不引入构建工具，就能解决组件样式泄漏与第三方内容污染问题。

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
| [index-01-scope.html](../../examples/css/19-scope/index-01-scope.html) | 基础作用域 + 甜甜圈边界 + 近距优先 + 富文本保护区 |

---

## 1. 概念解释

### 1.1 @scope 是什么

`@scope` 是 CSS 的 at-规则，语法核心是「**根（root）+ 限界（limit）**」：

```css
/* 根：.card 子树内生效 */
@scope (.card) {
  img { border-radius: 8px; }   /* 只影响 .card 里的 img，页面其他 img 不受影响 */
}

/* 根 + 限界：甜甜圈作用域（donut scope） */
@scope (.article) to (.widget) {
  p { line-height: 1.8; }       /* 作用于 .article 内、但不进入 .widget 子树 */
}
```

与嵌套（EP.28）的对比：`.card { img { } }` 展开为 `.card img`——**匹配范围仍然是全局的**，任何地方的 `.card img` 都会命中。`@scope (.card) { img { } }` 则把规则**绑定**到这个作用域子树，且可与 `to` 配合挖出「洞」。

### 1.2 解决什么问题

| 痛点 | 传统方案 | @scope 方案 |
| --- | --- | --- |
| 组件样式泄漏 | BEM 命名、CSS Modules、Shadow DOM | `@scope (.my-component)` 直接圈地 |
| 第三方组件污染页面 | 提高特异性硬压、`!important` | 作用域根天然隔离，特异性不变 |
| CMS 富文本需要排版但怕误伤 | `.richtext p` 长链选择器，嵌套太深易误伤子组件 | `@scope (.richtext) to ([data-component])` 甜甜圈 |
| 主题区域覆盖 | `.dark .btn` 逐类重写，组合爆炸 | `@scope ([data-theme=dark])` 整域接管 |

### 1.3 底层原理

@scope 引入两条新规则：

1. **作用域匹配**：内部选择器只有在其祖先链上能找到作用域根时才匹配。`@scope (.card) { img {} }` 的 `img` 必须位于某个 `.card` 的子树内。
2. **近距优先（proximity）**：当**两个作用域根**都能匹配同一元素时，**DOM 上离元素更近的根获胜**——不考虑选择器特异性、不考虑书写顺序。这是层叠规则中前所未有的维度。

```css
@scope (.theme-a) { .btn { color: red; } }
@scope (.theme-b) { .btn { color: blue; } }
```

```html
<div class="theme-a">
  <div class="theme-b">
    <button class="btn">我是蓝色</button>  <!-- theme-b 更近，获胜 -->
  </div>
</div>
```

**特异性说明**：作用域根选择器**不参与**内部规则的特异性计算。`@scope (#app) { .btn {} }` 的特异性仍是 (0,1,0)，`#app` 不会把特异性抬到 ID 级——这与手写 `#app .btn`（1,1,0）完全不同，也是「第三方样式易覆盖」的关键。

---

## 2. 语法说明

### 2.1 完整语法

```css
@scope <scope-root> [to <scope-limit>]? {
  <rules>
}
```

```css
/* 仅根 */
@scope (.card) { ... }

/* 根 + 限界（甜甜圈） */
@scope (.article) to (.ad-slot) { ... }

/* 多个根 / 多个限界 */
@scope (.card, .panel) { ... }
@scope (.article) to (.ad-slot, .widget) { ... }

/* 根选择器可用 & 引用（配合嵌套） */
@scope (.card) {
  & { border-radius: 12px; }    /* 根元素自身 */
  .title { color: navy; }       /* 子树内 */
}
```

### 2.2 隐式作用域根（scoped 样式表写法）

在 HTML 内联 `<style scoped>` 尚未标准化的今天，组件文件内可省略根——**不写根的 @scope** 以样式表「宿主」为根，仅适用于 `<style>` 写在组件容器内部的情况（浏览器将其视为最近祖先元素为根）：

```html
<div class="card">
  <style>
    @scope {
      p { color: gray; }   /* 只影响这个 .card 内的 p */
    }
  </style>
  <p>scoped</p>
</div>
```

> 该用法 Chromium 系支持；生产环境建议显式写根，可读性更好。

### 2.3 与层叠层（@layer）的关系

正交关系，可叠加：

```css
@layer components {
  @scope (.card) {
    .title { color: navy; }   /* 既在 components 层，又在 .card 作用域 */
  }
}
```

层叠层决定「层的输赢」，作用域决定「规则是否命中」，近距优先只在**同一层内**的两个作用域之间裁决。

### 2.4 在 JS 中动态构造

```js
const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  @scope (.${ns}) to ([data-slot=free]) {
    * { box-sizing: border-box; }
  }
`);
document.adoptedStyleSheets.push(sheet);
```

微前端/微件场景下可按命名空间动态注入作用域样式。

---

## 3. 浏览器兼容性

| 浏览器 | 版本 | 发布时间 |
| --- | --- | --- |
| Chrome / Edge | 118+ | 2023-10 |
| Safari | 17.4+ | 2024-03 |
| Firefox | 128+ | 2024-07 |

> 2024 年中起全面可用。降级方案：`@supports (@scope)` 不可用时回退到「长链选择器」或构建期前缀（PostCSS）。

---

## 4. 使用场景示例

### 场景 1：组件样式圈地

```css
@scope (.rating-card) {
  & { background: #fff; border-radius: 12px; padding: 16px; }
  .stars { color: gold; letter-spacing: 2px; }
  .count { font-size: 12px; color: #888; }
}
/* 页面其他地方的 .stars / .count 完全不受影响 */
```

### 场景 2：甜甜圈——富文本保护区

```css
/* 排版规则只覆盖纯文本，遇到嵌入组件立即「挖洞」 */
@scope (.richtext) to ([data-component]) {
  p { margin: 1em 0; line-height: 1.8; }
  img { max-width: 100%; border-radius: 8px; }
  h2 { font-size: 1.4em; margin-top: 1.6em; }
}
```

```html
<div class="richtext">
  <p>正文段落，享受排版规则。</p>
  <div data-component="chart"><p>图表内部说明——不被 .richtext 的 p 规则命中</p></div>
</div>
```

### 场景 3：主题区域接管

```css
@scope ([data-theme="ocean"]) {
  & { background: #e0f2fe; }
  .btn { background: #0284c7; color: #fff; }
  a { color: #0369a1; }
}
@scope ([data-theme="sunset"]) {
  & { background: #fff7ed; }
  .btn { background: #ea580c; color: #fff; }
  a { color: #c2410c; }
}
/* 同一页面两个主题区域并存，互不污染；嵌套时近者胜 */
```

### 场景 4：第三方微件隔离

```css
/* 微件作者的样式整体打包进作用域，宿主页面零冲突 */
@scope (#pay-widget) {
  * { margin: 0; font-family: inherit; }
  .primary { background: #16a34a; }
}
```

---

## 5. 实际应用案例分析

### 案例：老系统接入新组件库

**背景**：某后台系统演进多年，全局样式里躺着 `.title { font-size: 20px; color: #333; }` 之类的「上古规则」。新组件库（内部叫 Nova UI）的组件也用了 `.title` 这种通用类名，一接入就被全局规则污染：标题字号被强制覆盖、链接颜色被全局面包屑样式劫持。

**尝试过**：

1. 提高组件选择器特异性（`.nova-card .title`）——能赢上古规则，但业务方再包一层又输回去，特异性军备竞赛；
2. Shadow DOM——隔离彻底，但全局字体、CSS 变量全被挡在门外，主题定制方案要重做；
3. CSS-in-JS 运行时加 hash 类名——构建链改造成本高。

**终案：@scope 圈地**：

```css
/* nova-ui.css：整个组件库包进一个作用域 */
@scope (.nova-root) to ([data-nova-free]) {
  .title { font-size: 16px; color: #1e293b; }
  .btn { padding: 8px 16px; border-radius: 8px; }
  a { color: #2563eb; text-decoration: none; }
}
```

使用方只需在组件根节点挂 `class="nova-root"`：

- 上古全局 `.title` 特异性 (0,1,0)，组件作用域内 `.title` 也是 (0,1,0)——**但作用域规则命中于更近的子树**，且作用域内外规则比较时，作用域规则被视为「更具体」的那一类，稳定获胜；
- 组件想给业务方留自定义口子，在元素上加 `data-nova-free` 即挖出甜甜圈洞，业务样式从洞口注入；
- 字体、CSS 变量照常继承（作用域不做 Shadow DOM 那样的硬隔离），主题系统零改动。

**收益**：接入成本从「逐组件改类名」降为「根节点挂一个 class」；样式冲突工单归零。

---

## 6. 最佳实践与常见坑

1. **@scope 不提升特异性**：作用域根不参与特异性计算。想让组件样式「稳赢」外部，靠作用域命中 + 近距优先，不要再叠 ID 选择器。
2. **近距优先只裁决作用域之间**：同一元素被两个作用域的规则命中时，DOM 更近的根获胜；但作用域规则 vs 普通全局规则，仍走正常层叠（层叠层 → 特异性 → 顺序），作用域匹配只是「多一个命中条件」。
3. **甜甜圈的洞是整棵子树**：`to (.widget)` 后，`.widget` 自身及其**所有后代**都不受规则影响，没有「只排除自身」的写法。
4. **& 引用根**：`@scope (.card) { & { } }` 样式作用于根元素自身；不写 & 的选择器至少要是根的后代（根自身不匹配 `.card .card` 之外的规则）。
5. **别拿 @scope 当 Shadow DOM**：作用域不隔离 ID、不隔离脚本、不阻止全局高特异性规则强行命中（如 `[class] *`）。它是「低成本的圈地」，不是「硬隔离」。
6. **与 BEM 的关系**：上了 @scope 后 BEM 的长命名（`card__title--featured`）可以瘦身回 `.title`、`.featured`，命名负担显著降低——但组件库对外发布时保留前缀更稳妥。
7. **降级**：`@supports not (@scope)` 下把关键样式展开成长链选择器；或干脆把 @scope 当渐进增强——老浏览器看到未隔离但可用的基础样式。
8. **性能**：作用域匹配在样式重算时多一次祖先链检查，成本与一层后代选择器相当，无需担心。

---

## 7. 参考资料

- [MDN: @scope](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@scope)
- [Can I use: @scope](https://caniuse.com/css-cascade-scope)
- [CSS Spec: Cascading Level 6 — Scoped Styles](https://drafts.csswg.org/css-cascade-6/#scoped-styles)
- [Chrome for Developers: @scope](https://developer.chrome.com/docs/css-ui/at-scope)
- [OddBird: CSS @scope 深入](https://www.oddbird.net/2023/01/17/scope/)
