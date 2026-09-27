# color-mix() · light-dark() · color-scheme 进阶

> 面向前端开发人员的 CSS3 高级特性参考资料 —— `color-mix()` 让两种颜色在指定色彩空间按比例混合，`light-dark()` 根据用户明暗偏好自动切换颜色，`color-scheme` 声明元素支持的色彩方案。三者组合，无需 CSS 预处理器或 JS 即可实现「动态调色 + 明暗自适应」的现代颜色体系。

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
| [index-01-color-mix-light-dark.html](../../examples/css/25-color-mix-light-dark/index-01-color-mix-light-dark.html) | color-mix 四色彩空间混合 + light-dark 明暗切换 + color-scheme 控件适配 + 组合实战 |

---

## 1. 概念解释

### 1.1 三件套是什么

| 特性 | 作用 | 一句话 |
| --- | --- | --- |
| `color-mix()` | 两种颜色按比例混合 | 浏览器原生「调色盘」 |
| `light-dark()` | 根据明暗偏好二选一 | 浏览器原生「主题开关」 |
| `color-scheme` | 声明元素支持的色彩方案 | 告诉浏览器「我支持暗色」 |

传统暗色模式需要 CSS 预处理器变量 + JS 切换 class，或媒体查询 `@media (prefers-color-scheme: dark)` 写两套。三件套把「调色」和「明暗切换」收进浏览器原生能力。

### 1.2 解决什么问题

| 痛点 | 传统方案 | 现代方案 |
| --- | --- | --- |
| 品牌色变体 | 预处理器 `lighten()`/`darken()` 生成 | `color-mix(in oklch, brand, white 20%)` |
| 暗色模式 | 媒体查询写两套颜色 | `light-dark(lightColor, darkColor)` |
| 表单控件暗色适配 | 浏览器默认白色突兀 | `color-scheme: light dark` |
| 动态主题色 | JS 读取 CSS 变量再计算 | 纯 CSS `color-mix` 实时混合 |

### 1.3 底层原理

**color-mix**：在指定色彩空间（`srgb`、`hsl`、`hwb`、`lab`、`oklch`、`lch`、`oklab`）中对两种颜色做线性插值。`oklch` 感知均匀，混合结果最自然。

**light-dark**：解析时计算一次，根据用户系统/浏览器明暗偏好返回对应颜色。与 `prefers-color-scheme` 媒体查询同步，但无需写重复规则。

**color-scheme**：告诉浏览器「此元素支持 light 和/或 dark」，浏览器据此调整内置控件（滚动条、表单控件、文字选中色）的默认配色。

---

## 2. 语法说明

### 2.1 color-mix()

```css
/* 语法：color-mix(in <色彩空间>, <颜色1> <比例?>, <颜色2> <比例?>) */
.mixed {
  color: color-mix(in oklch, #3b82f6 70%, #f97316 30%);
  background: color-mix(in srgb, var(--brand), transparent 50%);
}
```

| 参数 | 说明 |
| --- | --- |
| `in <色彩空间>` | 混合发生的色彩空间：`srgb`（默认）、`hsl`、`hwb`、`lab`、`oklab`、`lch`、`oklch` |
| `<颜色> <比例>` | 比例 0-100%，可省略（默认 50%）；两比例之和无需为 100%，浏览器自动归一化 |

**色彩空间选择**：`oklch`/`oklab` 感知最均匀，推荐；`srgb` 兼容性最好但可能产生「 muddy 」中间色；`hsl`/`hwb` 保持色相但饱和度可能漂移。

### 2.2 light-dark()

```css
/* 语法：light-dark(<亮色>, <暗色>) */
.card {
  background: light-dark(#ffffff, #1e293b);
  color: light-dark(#0f172a, #e2e8f0);
}
```

- 仅在 `color-scheme` 声明支持 dark 时才可能返回暗色值。
- 可嵌套在 `color-mix()` 内部：`color-mix(in oklch, light-dark(#fff, #000), #3b82f6 20%)`。

### 2.3 color-scheme

```css
/* 元素级声明 */
.card {
  color-scheme: light dark;   /* 支持明暗 */
}
.dark-only {
  color-scheme: dark;         /* 仅暗色 */
}
```

| 值 | 说明 |
| --- | --- |
| `normal` | 默认，浏览器自行决定 |
| `light` | 仅亮色方案 |
| `dark` | 仅暗色方案 |
| `light dark` | 都支持，浏览器根据用户偏好选择 |
| `only light` / `only dark` | 强制锁定，禁止用户切换 |

**根元素设置**：`:root { color-scheme: light dark; }` 让全站内置控件（滚动条、表单、选中色）自动适配暗色。

### 2.4 组合范式

```css
:root {
  color-scheme: light dark;
  --brand: #3b82f6;
  --bg: light-dark(#ffffff, #0b1220);
  --text: light-dark(#0f172a, #e2e8f0);
  --border: light-dark(
    color-mix(in oklch, var(--brand), black 15%),
    color-mix(in oklch, var(--brand), white 25%)
  );
}
```

---

## 3. 浏览器兼容性

| 浏览器 | color-mix | light-dark | color-scheme |
| --- | --- | --- | --- |
| Chrome / Edge | 111+（2023） | 123+（2024） | 81+（2020） |
| Safari | 16.2+（2022） | 17.5+（2024） | 15.4+（2022） |
| Firefox | 113+（2023） | 120+（2023） | 96+（2022） |

`color-mix` 与 `color-scheme` 已全绿，`light-dark` 为 2024 年新特性，建议 `@supports` 渐进增强。

---

## 4. 使用场景示例

### 4.1 品牌色变体生成

```css
.btn-primary {
  background: var(--brand);
}
.btn-primary:hover {
  background: color-mix(in oklch, var(--brand), black 15%);
}
.btn-primary:active {
  background: color-mix(in oklch, var(--brand), black 30%);
}
```

### 4.2 暗色模式卡片

```css
.card {
  color-scheme: light dark;
  background: light-dark(#ffffff, #1e293b);
  border: 1px solid light-dark(#e2e8f0, #334155);
}
```

### 4.3 滚动条/表单控件暗色适配

```css
:root {
  color-scheme: light dark;
}
/* 浏览器自动将滚动条、input、select 适配为暗色 */
```

### 4.4 动态透明度背景

```css
.overlay {
  background: color-mix(in srgb, var(--brand), transparent 80%);
}
```

---

## 5. 实际应用案例分析

**场景：设计系统需要支持品牌色动态生成 + 明暗模式。**

旧实现：Sass 预生成 10 级色阶（`lighten($brand, 10%)` 等），暗色模式用 `@media (prefers-color-scheme: dark)` 重写所有颜色，共 200+ 行变量定义。

迁移后：

1. **色阶**：`color-mix(in oklch, var(--brand), white 10%)` 到 `black 90%`，一行生成任意级。
2. **明暗**：`light-dark()` 替代媒体查询，代码量减半。
3. **控件**：`:root { color-scheme: light dark; }` 让原生控件自动适配。

收益：删除 Sass 编译依赖，主题切换零 JS，新增品牌色只需改一个变量。

---

## 6. 最佳实践与常见坑

1. **`light-dark` 必须配合 `color-scheme`**：元素未声明 `color-scheme: dark` 时，`light-dark()` 永远返回亮色值。
2. **色彩空间选 `oklch`**：`srgb` 混合蓝色和黄色会产生不自然的灰色；`oklch` 保持感知均匀。
3. **比例归一化**：`color-mix(in oklch, red 30%, blue 30%)` 实际按 50%/50% 混合（30+30=60，归一化后各 50%）。
4. **不要过度使用 `light-dark`**：大量 `light-dark` 内联会让样式表难以维护；建议提取为 CSS 变量集中管理。
5. **`color-scheme` 影响内置控件**：`select`、`input[type="date"]` 等原生控件会跟随系统主题，需测试确认设计一致性。
6. **与 `@media (prefers-color-scheme)` 共存**：`light-dark()` 是声明式替代，两者可混用但建议逐步迁移到 `light-dark`。

---

## 7. 参考资料

- [CSS Color Module Level 5（W3C）](https://www.w3.org/TR/css-color-5/)
- [MDN：color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
- [MDN：light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [MDN：color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
- 相关文档：[现代颜色（CSS 篇 14）](14-modern-colors.md) ｜ [变量与 calc（CSS 篇 06）](06-variables-calc.md)
