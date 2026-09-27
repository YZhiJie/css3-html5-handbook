# CSS 逻辑属性进阶

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 逻辑属性让布局自动适配书写方向：inline-start/block-end 取代 left/right/top/bottom，国际化不再写两套样式。本章聚焦进阶用法：逻辑简写、逻辑单位、与物理属性的混用边界。

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
| [index-01-logical-properties.html](../../examples/css/29-logical-properties/index-01-logical-properties.html) | 逻辑属性基础 + RTL 自动适配 + 逻辑简写 + 与物理属性混用 |

---

## 1. 概念解释

### 1.1 逻辑属性是什么

CSS 逻辑属性（Logical Properties）用「书写方向」替代「物理方向」：

| 物理属性 | 逻辑属性（LTR） | 逻辑属性（RTL） |
| --- | --- | --- |
| margin-left | margin-inline-start | margin-inline-end |
| margin-right | margin-inline-end | margin-inline-start |
| padding-top | padding-block-start | padding-block-start |
| padding-bottom | padding-block-end | padding-block-end |
| width | inline-size | inline-size |
| height | block-size | block-size |
| left | inset-inline-start | inset-inline-end |
| right | inset-inline-end | inset-inline-start |
| top | inset-block-start | inset-block-start |
| bottom | inset-block-end | inset-block-end |

### 1.2 解决什么问题

- **国际化**：阿拉伯语、希伯来语是 RTL（从右到左），物理属性 left/right 全错，逻辑属性自动适配。
- **垂直书写**：中文古籍、日文 manga 是 vertical-rl，物理属性 top/bottom 全错，逻辑属性自动适配。
- **一套代码多语言**：不用为每种语言写一套 CSS，逻辑属性自动映射。

### 1.3 底层原理

浏览器根据 `direction`（ltr/rtl）和 `writing-mode`（horizontal-tb/vertical-rl/vertical-lr）计算逻辑方向到物理方向的映射。逻辑属性在样式计算阶段转换为物理属性，参与布局。

---

## 2. 语法说明

### 2.1 逻辑属性基础

```css
.card {
  margin-inline-start: 16px;   /* LTR = margin-left，RTL = margin-right */
  margin-inline-end: 16px;     /* LTR = margin-right，RTL = margin-left */
  padding-block-start: 8px;    /* 永远 = padding-top */
  padding-block-end: 8px;      /* 永远 = padding-bottom */
  inline-size: 200px;          /* LTR = width，vertical-rl = height */
  block-size: 100px;           /* LTR = height，vertical-rl = width */
}
```

### 2.2 逻辑简写

```css
.card {
  margin-inline: 16px;         /* margin-inline-start + margin-inline-end */
  margin-block: 8px;           /* margin-block-start + margin-block-end */
  padding-inline: 16px;
  padding-block: 8px;
  inset-inline: 0;             /* inset-inline-start + inset-inline-end */
  inset-block: 0;              /* inset-block-start + inset-block-end */
}
```

### 2.3 逻辑单位

| 单位 | 含义 |
| --- | --- |
| vi | 视口内联尺寸的 1%（LTR = vw，vertical-rl = vh） |
| vb | 视口块尺寸的 1%（LTR = vh，vertical-rl = vw） |
| cqi | 容器内联尺寸的 1% |
| cqb | 容器块尺寸的 1% |

---

## 3. 浏览器兼容性

- **Chrome / Edge**：87+（2020-11，逻辑属性）；89+（2021-03，逻辑简写）
- **Firefox**：66+（2019-01，逻辑属性）；70+（2019-10，逻辑简写）
- **Safari**：14.1+（2021-04，逻辑属性）；15+（2021-09，逻辑简写）

所有现代浏览器均支持，生产环境可放心使用。

---

## 4. 使用场景示例

### 场景 1：RTL 语言自动适配

```css
.nav-item {
  margin-inline-start: 16px;   /* LTR 左间距，RTL 右间距 */
  text-align: start;           /* LTR 左对齐，RTL 右对齐 */
}
```

```html
<!-- LTR -->
<div dir="ltr" class="nav-item">Home</div>

<!-- RTL -->
<div dir="rtl" class="nav-item">الرئيسية</div>
```

### 场景 2：垂直书写模式

```css
.vertical-text {
  writing-mode: vertical-rl;
  inline-size: 200px;          /* vertical-rl = height */
  block-size: 100px;           /* vertical-rl = width */
}
```

### 场景 3：逻辑单位

```css
.hero {
  min-block-size: 50vb;        /* LTR = 50vh，vertical-rl = 50vw */
  inline-size: 100vi;          /* LTR = 100vw，vertical-rl = 100vh */
}
```

---

## 5. 实际应用案例分析

### 案例：国际化电商站点

**背景**：站点支持英语（LTR）和阿拉伯语（RTL），之前用物理属性写了两套 CSS，维护成本高。

**改造前**：

```css
/* LTR */
.nav-item { margin-left: 16px; text-align: left; }

/* RTL */
[dir="rtl"] .nav-item { margin-right: 16px; text-align: right; }
```

**改造后**：

```css
/* 一套代码，自动适配 */
.nav-item {
  margin-inline-start: 16px;
  text-align: start;
}
```

**收益**：CSS 代码量减少 40%，新增语言（如希伯来语）零改动。

---

## 6. 最佳实践与常见坑

1. **优先用逻辑属性**：margin/padding/inset/size 全部用逻辑版本，物理版本只在明确需要时用。
2. **text-align 用 start/end**：`text-align: start` 自动适配 LTR/RTL，比 left/right 好。
3. **不要混用物理与逻辑**：同一元素上 `margin-left: 8px; margin-inline-start: 16px;` 会冲突，逻辑属性胜出。
4. **逻辑单位慎用**：vi/vb/cqi/cqb 在 vertical-rl 下与 vw/vh 互换，调试时注意。
5. **旧浏览器回退**：如需支持 IE11，用 PostCSS 插件自动降级为物理属性。

---

## 7. 参考资料

- [MDN: CSS Logical Properties](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_logical_properties_and_values)
- [Can I use: CSS Logical Properties](https://caniuse.com/css-logical-props)
- [CSS Spec: CSS Logical Properties Level 1](https://drafts.csswg.org/css-logical-1/)
