# 层叠层（Cascade Layers）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— `@layer` 在层叠顺序中插入了一个新的维度：开发者可以主动把样式分层，让"基础层 < 组件层 < 工具层 < 覆盖层"的优先级关系清晰可预期，从根本上终结 `!important` 战争和选择器特异性竞赛。

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
| [index-01-cascade-layers.html](../../examples/css/13-cascade-layers/index-01-cascade-layers.html) | 层声明与块语法 + 层顺序控制 + 层内优先级 + 匿名层与嵌套层 |

---

## 1. 概念解释

### 1.1 层叠层是什么

**层叠层（Cascade Layers）** 通过 `@layer` 规则，让开发者显式定义 CSS 规则的**层优先级顺序**。层在"来源"之后、"特异性"之前参与层叠决胜。

没有 `@layer` 时的层叠顺序（简化）：

```
来源与重要性 → 特异性 → 出现顺序
```

引入 `@layer` 后的层叠顺序：

```
来源与重要性 → 层（@layer 顺序） → 特异性 → 出现顺序
```

关键洞察：**层顺序比特异性更强**。`base` 层里一个 `!important` 之外的 `#id` 选择器，优先级仍然低于 `utilities` 层里一个 `.class` 选择器——只要 `utilities` 层在声明顺序上更晚。

### 1.2 解决什么问题

- **第三方 CSS 覆盖难题**：引入 UI 框架后，自己的覆盖样式需要写更具体的选择器或 `!important`，陷入军备竞赛。
- **设计系统分层**：重置样式（reset）< 基础变量 < 组件样式 < 工具类（utility）< 页面覆盖，每一层的位置是架构决策而非巧合。
- **!important 泛滥**：当覆盖规则需要比框架规则更强时，团队往往集体依赖 `!important`，导致后续调试成本指数上升。

### 1.3 底层原理

浏览器在**来源与重要性**决胜之后，先比较规则所属的**层**。层有两种状态：

- **分层（layered）**：在 `@layer` 块内或关联了 `@layer` 声明的规则。
- **未分层（unlayered）**：普通样式表中的规则，优先级最高。

分层规则之间，按 `@layer` 的**首次声明顺序**排序：先声明的层 < 后声明的层。

```css
@layer base { /* 层 1：优先级最低 */ }
@layer components { /* 层 2 */ }
@layer utilities { /* 层 3：优先级最高（在分层规则中） */ }

/* 未分层规则：优先级高于所有分层规则 */
.override { color: red; }
```

**!important 在层中的行为**：与普通层叠相反，分层规则中的 `!important` 按**层声明顺序的逆序**生效。这意味着 `base !important` > `utilities !important`，防止工具层用 `!important` 彻底封死下层覆盖。

---

## 2. 语法说明

### 2.1 声明层顺序

```css
/* 方法 1：先声明层名，后写层块（推荐） */
@layer reset, base, components, utilities;

@layer reset { /* ... */ }
@layer base { /* ... */ }
@layer components { /* ... */ }
@layer utilities { /* ... */ }
```

```css
/* 方法 2：直接写层块，顺序即优先级 */
@layer base { /* 低优先级 */ }
@layer components { /* 中优先级 */ }
@layer utilities { /* 高优先级 */ }
```

```css
/* 方法 3：匿名层（一次性，不可复用） */
@layer { /* 匿名层，每次声明都是独立的新层 */ }
```

### 2.2 层块内写规则

```css
@layer components {
  .btn {
    padding: 8px 16px;
    border-radius: 6px;
  }
  .btn-primary {
    background: #3b82f6;
    color: #fff;
  }
}
```

层块内的选择器特异性正常计算，但层优先级优先于特异性。

### 2.3 嵌套层

```css
@layer framework {
  @layer reset { /* framework.reset */ }
  @layer components { /* framework.components */ }
}
```

嵌套层展开为 `framework.reset`、`framework.components`。同名外层层会被合并，但嵌套子层保持独立。

### 2.4 `@import` 指定层

```css
@import url("reset.css") layer(reset);
@import url("buttons.css") layer(components);
```

外部样式表直接归入指定层，无需修改第三方文件。

### 2.5 `layer()` 在 `@layer` 顺序声明中使用

```css
@layer reset, framework.layer(reset), base, components, utilities;
```

可以精确控制嵌套层在整个层序中的位置。

---

## 3. 浏览器兼容性

- **Chrome / Edge**：99+（2022-03）
- **Firefox**：97+（2022-02）
- **Safari**：15.4+（2022-03）

`@import layer()` 与嵌套层语法同时期支持。全面可用，无需 polyfill。

---

## 4. 使用场景示例

### 场景 1：设计系统五层架构

```css
@layer reset, tokens, base, components, utilities, overrides;

@layer reset { /* normalize / sanitize */ }
@layer tokens { /* CSS 变量：颜色、间距、字号 */ }
@layer base { /* 元素默认样式：body、heading、link */ }
@layer components { /* 按钮、卡片、表单、导航 */ }
@layer utilities { /* .text-center、.hidden、.flex */ }
/* 未分层：页面特有覆盖，优先级最高 */
```

### 场景 2：第三方框架隔离

```css
@layer vendor {
  @import url("bootstrap.min.css") layer(bootstrap);
  @import url("swiper-bundle.css") layer(swiper);
}

@layer my-app {
  /* 自己的样式，优先级高于 vendor 层 */
}
```

### 场景 3：A/B 测试与主题切换

```css
@layer theme-a, theme-b;

@layer theme-a { :root { --primary: #3b82f6; } }
@layer theme-b { :root { --primary: #ef4444; } }

/* 切换时只改层声明顺序：@layer theme-b, theme-a; */
```

---

## 5. 实际应用案例分析

### 案例：从 `!important` 地狱迁移到 `@layer`

**背景**：某电商项目引入 Tailwind CSS 后，业务代码频繁需要覆盖框架的工具类。团队约定"不准改 node_modules"，于是覆盖层不断堆高特异性：

```css
/* 业务代码 */
.product-page .product-card .product-title {
  font-size: 18px !important;
}

/* 另一处覆盖 */
[data-theme="promotion"] .product-page .product-card .product-title {
  font-size: 24px !important;
}
```

问题：

- 特异性军备竞赛，DOM 结构变化即样式崩；
- `!important` 密度过高，DevTools 里找不到谁在生效；
- 新人无法判断该把新规则写在哪个文件。

**改造后**：

```css
@layer tw-base, tw-components, tw-utilities, app-base, app-components, app-overrides;

@import "tailwindcss/base" layer(tw-base);
@import "tailwindcss/components" layer(tw-components);
@import "tailwindcss/utilities" layer(tw-utilities);

@layer app-base { /* 业务基础 */ }
@layer app-components { /* 业务组件 */ }
@layer app-overrides { /* 临时覆盖，优先级最高（分层中） */ }
```

覆盖规则不再需要 `!important`：

```css
@layer app-overrides {
  .product-title { font-size: 18px; }
}
```

因为 `app-overrides` 在层序上晚于 `tw-utilities`，所以即使工具类用了 `!text-xl`（带 `!important`），`app-overrides` 层内的普通规则也能正常覆盖——除非工具类也用了 `!important`，此时按层逆序：`app-overrides !important` > `tw-utilities !important`。

**收益**：

- `!important` 使用率从 12% 降至 0.3%；
- 新增覆盖时只需决定"属于哪一层"，无需计算特异性；
- 重构 DOM 结构时样式稳定性大幅提升。

---

## 6. 最佳实践与常见坑

1. ** always 先声明层序**：`@layer a, b, c;` 放在样式表最顶部，让团队一眼看懂架构优先级。
2. **未分层规则是隐藏的刀**：写在 `@layer` 外的普通规则优先级高于所有分层规则。建议设计系统里"页面覆盖"也放进 `@layer overrides`，只在真正需要打破一切时才用未分层。
3. **!important 在层中的反直觉行为**：`base !important` > `utilities !important`。这意味着层不是 `!important` 的免死金牌——如果你滥用 `!important`，层叠层只能把战场换到"层内逆序"，问题依然存在。
4. **层只影响同一来源**：用户代理样式、用户样式、作者样式之间的来源优先级不受 `@layer` 影响。`@layer` 解决的是**作者样式内部**的优先级问题。
5. **嵌套层命名要简短**：`framework.components` 在实际调试中可读性较差，建议最多两层嵌套。
6. **DevTools 支持**：Chrome DevTools 在 Styles 面板中显示每条规则所属的层（`@layer components`），调试时先看层名再看特异性。
7. **与 CSS Modules / Scoped CSS 的配合**：层叠层是全局概念，与 CSS Modules 的局部类名不冲突——Module 生成唯一类名解决命名空间问题，`@layer` 解决优先级问题，两者互补。

---

## 7. 参考资料

- [MDN: @layer](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@layer)
- [Can I use: CSS Cascade Layers](https://caniuse.com/css-cascade-layers)
- [CSS Spec: CSS Cascading and Inheritance Level 5](https://drafts.csswg.org/css-cascade-5/#layering)
- [web.dev: Getting started with CSS cascade layers](https://web.dev/articles/css-cascade-layers)
- [Miriam Suzanne: A Complete Guide to CSS Cascade Layers](https://css-tricks.com/css-cascade-layers/)
