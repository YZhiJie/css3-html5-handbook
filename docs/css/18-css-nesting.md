# CSS 嵌套（CSS Nesting）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— CSS Nesting 让原生 CSS 支持「规则套规则」：子选择器直接写在父规则内部，`&` 引用父选择器，`&:hover`、`.card &`、`@media` 统统可以嵌套。Sass/Less 用户熟悉的写法终于成为标准，无需预处理器即可获得更紧凑、更具结构感的样式代码。

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
| [index-01-css-nesting.html](../../examples/css/18-css-nesting/index-01-css-nesting.html) | 基础嵌套 + `&` 父引用 + 嵌套 @media/@supports + 组件状态变体 + 与层叠层配合 |

---

## 1. 概念解释

### 1.1 CSS 嵌套是什么

传统 CSS 的规则是**扁平**的——相关样式散落在多条独立规则里，父选择器要反复书写：

```css
/* 传统写法：父选择器重复 4 次 */
.card { padding: 16px; }
.card .title { font-size: 18px; }
.card .title:hover { color: blue; }
.card.featured { border-color: gold; }
```

CSS Nesting 允许把子规则**写进父规则内部**：

```css
/* 嵌套写法：结构一目了然 */
.card {
  padding: 16px;

  .title {
    font-size: 18px;
    &:hover { color: blue; }
  }

  &.featured { border-color: gold; }
}
```

两段代码**完全等价**，但嵌套版把「卡片相关的一切」收拢在一个代码块里。

### 1.2 解决什么问题

| 痛点 | 传统方案 | CSS Nesting 方案 |
| --- | --- | --- |
| 父选择器反复书写 | `.card` 写 N 遍，改名要全局替换 | 写一次，子规则全部内嵌 |
| 组件样式散落 | 同一组件的规则间隔几十行 | 一个块内收拢，结构即文档 |
| 依赖预处理器 | 引入 Sass/Less 工具链才能嵌套 | 原生支持，零构建 |
| @media 重复选择器 | 每个断点重写一遍选择器 | `@media` 直接嵌套在规则内 |
| 伪类/状态分散 | `:hover`、`:focus`、`.active` 各写一条 | `&:hover`、`&.active` 紧跟主规则 |

### 1.3 底层原理

CSS Nesting 是**解析期**的语法糖：浏览器在解析样式表时把嵌套规则**展开**成等价的长形式，再进入正常的层叠与匹配流程。

```css
.card {
  .title { color: red; }
}
/* 浏览器内部展开为 */
.card .title { color: red; }
```

关键机制是 **`&` 嵌套选择器**（nesting selector）：它引用「父规则匹配到的元素」。`&` 可以出现在子选择器的任何位置，从而支持 Sass 无法表达的反向场景：

```css
.title {
  .card & { color: red; }   /* 展开为 .card .title —— 祖先条件 */
}
```

**与 Sass 的重要区别**：原生嵌套中，以**类型选择器**开头的嵌套规则在早期规范中要求加 `&`（如 `& div`），2023 年规范修订后已可省略（"relaxed nesting"），现代浏览器均支持直接写 `div { }`。

---

## 2. 语法说明

### 2.1 基础嵌套

```css
.parent {
  color: black;

  /* 后代选择器：等价于 .parent .child */
  .child { color: blue; }

  /* 子代选择器：等价于 .parent > .item */
  > .item { margin: 8px; }

  /* 兄弟选择器：等价于 .parent + .sibling */
  + .sibling { border-top: 1px solid; }
}
```

### 2.2 `&` 父选择器引用

```css
.btn {
  background: gray;

  /* & 拼接：等价于 .btn:hover（不是后代！） */
  &:hover { background: darkgray; }
  &:focus-visible { outline: 2px solid; }

  /* 状态类：等价于 .btn.active */
  &.active { background: blue; }

  /* 复合：等价于 .btn.primary:hover */
  &.primary:hover { background: darkblue; }
}
```

**`&` vs 空格的坑**：

```css
.card {
  &.featured { }   /* .card.featured —— 同一个元素 */
  .featured { }    /* .card .featured —— 后代元素 */
}
```

少写一个 `&`，选择器语义完全不同——这是从 Sass 迁移时最常见的错误来源（Sass 中行为一致，原生 CSS 中同样一致，但手写扁平 CSS 的人容易混淆）。

### 2.3 `&` 在非开头位置 —— 祖先/兄弟条件

```css
.title {
  /* 等价于 .card .title —— 卡片内的标题 */
  .card & { font-size: 18px; }

  /* 等价于 .dark .title —— 暗色主题下的标题 */
  .dark & { color: white; }

  /* 等价于 li:first-child + li .title —— 第二个列表项里的标题 */
  li:first-child + li & { margin-top: 0; }
}
```

### 2.4 嵌套 @media / @supports

```css
.card {
  width: 100%;

  /* 等价于 @media (min-width: 768px) { .card { ... } } */
  @media (min-width: 768px) {
    width: 50%;
    .title { font-size: 20px; }   /* 断点内还能继续嵌套 */
  }

  @supports (display: grid) {
    display: grid;
  }
}
```

媒体查询跟着组件走，不再需要跳转到文件底部的「响应式专区」。

### 2.5 嵌套中的声明与规则顺序

```css
.card {
  color: black;
  .title { color: blue; }
  padding: 16px;      /* ⚠️ 注意：嵌套规则后面的声明 */
}
```

**重要坑点**：嵌套规则**之后**的声明仍然生效（规范修订后），解析时浏览器会把它们视为在嵌套规则之前。但为了可读性，**强烈建议所有普通声明写在嵌套规则之前**，团队约定一次到位。

### 2.6 多层嵌套

```css
.nav {
  ul {
    display: flex;
    li {
      padding: 8px;
      a {
        color: #333;
        &:hover { color: blue; }
      }
    }
  }
}
```

嵌套层数**没有语法上限**，但最佳实践建议不超过 3 层（见第 6 节）。

---

## 3. 浏览器兼容性

| 浏览器 | 版本 | 发布时间 |
| --- | --- | --- |
| Chrome / Edge | 112+（宽松嵌套 120+） | 2023-04 |
| Firefox | 117+ | 2023-08 |
| Safari | 16.5+（宽松嵌套 17.2+） | 2023-05 |

> 2023 年底起全面可用。「宽松嵌套」（类型选择器开头可省略 `&`）Chrome 120 / Safari 17.2 起支持；如需兼容更早版本，类型选择器前统一加 `&`。

---

## 4. 使用场景示例

### 场景 1：按钮组件全状态收拢

```css
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  background: #334155;
  color: white;

  &:hover { background: #475569; }
  &:focus-visible { outline: 2px solid #22d3ee; outline-offset: 2px; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  &.primary { background: #22d3ee; color: #0b1220;
    &:hover { background: #67e8f9; }
  }
  &.danger { background: #ef4444;
    &:hover { background: #f87171; }
  }

  .icon { width: 16px; margin-right: 6px; }
}
```

### 场景 2：主题适配（暗色模式）

```css
.card {
  background: white;
  color: #1e293b;

  [data-theme="dark"] & {
    background: #1e293b;
    color: #e2e8f0;

    .title { color: #fbbf24; }
  }
}
```

### 场景 3：响应式跟着组件走

```css
.sidebar {
  width: 280px;

  @media (max-width: 1024px) { width: 220px; }
  @media (max-width: 768px) {
    width: 100%;
    position: fixed;
    inset: auto 0 0 0;      /* 移动端变底部抽屉 */
  }
}
```

### 场景 4：表单字段组

```css
.field {
  margin-bottom: 16px;

  label { display: block; margin-bottom: 4px; font-weight: 600; }

  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;

    &:focus { border-color: #3b82f6; outline: none; }
    &:invalid:not(:placeholder-shown) { border-color: #ef4444; }
  }

  .error-msg {
    display: none;
    color: #ef4444;
    font-size: 12px;
  }
  &:has(input:invalid:not(:placeholder-shown)) .error-msg { display: block; }
}
```

---

## 5. 实际应用案例分析

### 案例：Sass 组件库迁移到原生 CSS

**背景**：某内部组件库用 Sass 编写，随着构建链升级（Vite 6），团队评估「去掉 Sass，回归原生 CSS」，理由：

- 现代浏览器原生支持嵌套、自定义属性、`color-mix()` 等，Sass 的核心卖点已被标准覆盖；
- 少一层编译，热更新更快，源码即产物，调试无 source map 错位；
- 减少依赖（`sass` + 插件约 30MB node_modules）。

**迁移对照**（以卡片组件为例）：

```scss
/* 迁移前：card.scss */
.card {
  padding: $sp-md;                    // Sass 变量
  @include shadow(2);                 // Sass mixin
  .title { font-size: rem(18); }
  &.featured { border-color: $gold; }
  @media (min-width: $bp-md) { padding: $sp-lg; }
}
```

```css
/* 迁移后：card.css —— 全部原生 */
.card {
  padding: var(--sp-md);              /* CSS 自定义属性 */
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.15);
  .title { font-size: 1.125rem; }
  &.featured { border-color: var(--gold); }
  @media (min-width: 768px) { padding: var(--sp-lg); }
}
```

**迁移清单**：

| Sass 特性 | 原生替代 |
| --- | --- |
| `$var` 变量 | `var(--x)` 自定义属性（运行时可变，更强） |
| 嵌套 | CSS Nesting（语法几乎一致） |
| `@mixin` / `@include` | 无直接替代；简单场景复制声明，复杂场景用 `@utility`（Tailwind）或保留少量 PostCSS |
| `darken()` 等颜色函数 | `color-mix(in oklab, c, black 20%)` |
| `@extend` | 无替代（本身也是反模式），改为公共类 |

**收益**：构建步骤 -1，HMR 提速约 40%，新成员无需学 Sass 语法。唯一保留 Sass 的场景是复杂数学函数（`math.sin` 等）与循环生成类。

---

## 6. 最佳实践与常见坑

1. **`&` 与空格的区别**：`&.featured`（同元素状态）vs `.featured`（后代）。写错不会报错，只是选择器静默失效——Code Review 重点检查项。
2. **嵌套深度 ≤ 3 层**：嵌套每深一层，展开后的选择器就长一截，特异性也随之叠加。`.a { .b { .c { .d { } } } }` 展开为 `.a .b .c .d`，特异性 (0,4,0)，覆写困难。深层嵌套本质是「把 HTML 结构硬编码进 CSS」，HTML 一变样式全崩。
3. **声明写在嵌套规则之前**：虽然规范允许混写，但团队约定「先声明、后嵌套」，避免阅读时跳行。
4. **特异性计算**：嵌套展开后与手写长选择器特异性相同。但 `&:is(...)`、`:where()` 包裹会改变特异性——`&:where(.featured)` 的 `.featured` 部分特异性为 0。
5. **不要嵌套 `@layer` 的声明顺序幻觉**：`@layer` 优先级高于特异性，嵌套内外都遵守层叠层规则，嵌套不改变层叠结果，只改变书写结构。
6. **类型选择器开头**：兼容旧浏览器（Chrome <120 / Safari <17.2）时，`div { }` 写成 `& div { }`；新代码可直接写。
7. **与预处理器混用**：Sass 文件里写原生嵌套语法会被 Sass 先编译——行为一致，但团队要统一「只用一套」，避免心智分裂。
8. **嵌套不是作用域**：`.card { .title { } }` 的 `.title` 依然是全局匹配 `.card` 的后代，不是「只属于这个组件」。需要真正的作用域隔离请用 `@scope`（Chrome 118+）。

---

## 7. 参考资料

- [MDN: CSS nesting](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_nesting)
- [MDN: & 嵌套选择器](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Nesting_selector)
- [Can I use: CSS Nesting](https://caniuse.com/css-nesting)
- [CSS Spec: CSS Nesting Module](https://drafts.csswg.org/css-nesting-1/)
- [web.dev: CSS Nesting](https://web.dev/articles/css-nesting)
