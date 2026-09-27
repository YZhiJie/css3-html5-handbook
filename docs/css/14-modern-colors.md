# 现代颜色（Modern Colors）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— `oklch()` 提供感知均匀的颜色空间，`color-mix()` 让混色在任意色彩空间中精确可控，`light-dark()` 实现一套代码双主题自适应。它们共同构成了 CSS 颜色系统的下一次飞跃。

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
| [index-01-modern-colors.html](../../examples/css/14-modern-colors/index-01-modern-colors.html) | oklch 色域演示 + color-mix 混色 + light-dark 双主题 + 渐变与透明 + 色板生成 |

---

## 1. 概念解释

### 1.1 现代颜色是什么

CSS 传统颜色函数（`rgb()`、`hsl()`、`hex`）基于 sRGB 色彩空间，存在两个根本缺陷：

- **感知不均匀**：HSL 中 `hsl(120 100% 50%)`（纯绿）和 `hsl(60 100% 50%)`（纯黄）的「视觉亮度」差异巨大，但亮度参数都是 50%。
- **色域受限**：sRGB 只能覆盖约 35% 的可见色域，高饱和的品红、翠绿在屏幕上无法准确还原。

CSS Color Module Level 4/5 引入了三大利器：

| 函数 | 核心能力 | 解决的痛点 |
| --- | --- | --- |
| `oklch()` | 在 Oklab 感知均匀颜色空间中用 **L（明度）C（色度）H（色相）** 定义颜色 | HSL 亮度不均匀、色相环上相同步长视觉效果差异大 |
| `color-mix()` | 在指定颜色空间中按百分比混合两种颜色 | 手工计算中间色不准确、不同空间混色结果不可预期 |
| `light-dark()` | 根据系统/浏览器主题偏好自动返回亮色或暗色值 | 维护两套颜色变量、媒体查询 `prefers-color-scheme` 冗余 |

### 1.2 解决什么问题

- **设计系统色板生成**：从主色出发，通过调整 L/C 生成协调的浅色/深色变体，而非凭感觉挑 hex。
- **暗色模式零成本适配**：`light-dark(white, black)` 一行代码替代 `@media (prefers-color-scheme: dark)` 整段逻辑。
- **无障碍对比度可控**：Oklab 的 L 值与人眼感知亮度线性相关，`L=0.6` 的两种颜色对比度可预期，便于满足 WCAG。
- **广色域显示支持**：Display P3、Rec.2020 等宽色域屏幕可展示 sRGB 无法表达的饱和色。

### 1.3 底层原理

**Oklab / Oklch 颜色空间**：由 Björn Ottosson 提出，经过 CIECAM16 改进，在数学上近似「人眼感知均匀」。关键特性：

- **L（Lightness）**：0（黑）到 1（白）或 0% 到 100%，与 perceived brightness 线性对应。
- **C（Chroma）**：色度，0 为灰，无理论上限（实际受色域约束）。
- **H（Hue）**：色相，0°=红，120°=绿，240°=蓝，360° 循环。
- **a/b 轴**：Oklab 的直角坐标，a 轴红-绿，b 轴黄-蓝；Oklch 是 Oklab 的极坐标形式。

**color-mix() 的混合逻辑**：在指定色彩空间（默认 `oklab`）中做线性插值。混合两个颜色的 L/C/H 分量，而非直接插值 RGB 通道——这样避免了 sRGB 中线性插值导致的灰暗中间色。

**light-dark() 的解析时机**：在值计算阶段根据 `color-scheme`（或系统偏好）二选一，本质上是一个条件表达式，不影响层叠优先级。

---

## 2. 语法说明

### 2.1 oklch()

```css
/* 现代语法（推荐） */
oklch( lightness  chroma  hue [/ alpha] )

/* 示例 */
oklch(65% 0.25 250);           /* 高饱和蓝 */
oklch(0.8 0.1 150 / 0.5);      /* 半透明薄荷绿，L=0.8(80%) */
oklch(50% none 0deg);          /* 纯灰，色度为 none */
oklch(70% 0.3 0deg);           /* Display P3 广色域红 */
```

参数说明：

| 参数 | 类型 | 范围 | 说明 |
| --- | --- | --- | --- |
| `lightness` | `<number>` 或 `<percentage>` | 0–1 或 0%–100% | 明度，0 纯黑，1 纯白 |
| `chroma` | `<number>` | 0–0.4+（典型） | 色度，sRGB 内一般 ≤ 0.37，广色域可更高 |
| `hue` | `<angle>` | 0deg–360deg | 色相，支持 deg/grad/rad/turn |
| `alpha` | `<number>` 或 `<percentage>` | 0–1 或 0%–100% | 可选，透明度 |

> **none 关键字**：`chroma: none` 表示无色相（灰色），`hue: none` 在 C=0 时默认。`none` 在插值时按 0 处理。

### 2.2 color-mix()

```css
color-mix(in <color-space>, <color1> <percentage>, <color2> <percentage>)

/* 示例 */
color-mix(in oklch, oklch(60% 0.2 250), oklch(80% 0.15 150));      /* 1:1 混合 */
color-mix(in oklch, blue 70%, white);                               /* 70% 蓝 + 30% 白 */
color-mix(in srgb, #ff0000, #0000ff);                               /* sRGB 空间混合（偏灰暗） */
color-mix(in oklab, var(--primary) 60%, var(--secondary) 40%);      /* 变量混合 */
```

可用色彩空间：`srgb`、`srgb-linear`、`display-p3`、`a98-rgb`、`prophoto-rgb`、`rec2020`、`lab`、`oklab`、`lch`、`oklch`、`xyz`、`xyz-d50`、`xyz-d65`、`hsl`、`hwb`。默认 `oklab`。

**百分比规则**：若只指定一个百分比，另一个自动补全为 100%−p。若都省略，默认各 50%。

### 2.3 light-dark()

```css
light-dark(<light-color>, <dark-color>)

/* 示例 */
color: light-dark(#1e293b, #f1f5f9);           /* 亮主题深字，暗主题浅字 */
background: light-dark(white, #0b1220);        /* 亮白暗黑 */
border-color: light-dark(oklch(80% 0.02 250), oklch(40% 0.02 250));
```

生效条件：元素或根节点设置了 `color-scheme: light dark;`，或浏览器系统偏好匹配。

```css
:root {
  color-scheme: light dark;  /* 启用 light-dark() 支持 */
}

body {
  background: light-dark(#ffffff, #0b1220);
  color: light-dark(#0f172a, #e2e8f0);
}
```

### 2.4 其他相关新函数

```css
/* 相对颜色：基于已有颜色调整单个通道 */
color: oklch(from oklch(60% 0.2 250) l c 180deg);   /* 只改色相为 180°（补色） */
color: oklch(from var(--primary) calc(l + 0.15) c h); /* 只提亮 15% */

/* 颜色对比：对比度计算（Level 5，实验性） */
color-contrast(white vs black, #1e293b, #334155);     /* 选与 white 对比度最高的 */
```

---

## 3. 浏览器兼容性

| 特性 | Chrome | Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| `oklch()` | 111+（2023-03） | 111+ | 128+（2024-07） | 15.4+（2022-03） |
| `color-mix()` | 111+ | 111+ | 128+ | 16.2+（2023-06） |
| `light-dark()` | 123+（2024-03） | 123+ | 128+ | 17.2+（2024-06） |
| `color()` 广色域 | 111+ | 111+ | 128+ | 13.1+ |
| 相对颜色 `from` | 111+ | 111+ | 128+ | 16.2+ |

> 2024 年下半年起全面可用。Firefox 128 是分水岭（2024-07），此前需 `postcss-preset-env` 或 `colorjs.io` 降级。Safari 支持最早最稳。

---

## 4. 使用场景示例

### 场景 1：设计系统色板（从主色自动生成）

```css
:root {
  --brand: oklch(55% 0.22 270);           /* 主品牌色 */
  --brand-50:  oklch(from var(--brand) 97% calc(c * 0.1) h);
  --brand-100: oklch(from var(--brand) 92% calc(c * 0.2) h);
  --brand-200: oklch(from var(--brand) 85% calc(c * 0.35) h);
  --brand-300: oklch(from var(--brand) 75% calc(c * 0.55) h);
  --brand-400: oklch(from var(--brand) 65% calc(c * 0.75) h);
  --brand-500: var(--brand);
  --brand-600: oklch(from var(--brand) 45% calc(c * 1.05) h);
  --brand-700: oklch(from var(--brand) 38% calc(c * 1.0) h);
  --brand-800: oklch(from var(--brand) 30% calc(c * 0.85) h);
  --brand-900: oklch(from var(--brand) 22% calc(c * 0.6) h);
}
```

**为什么用 Oklch**：调整 L（明度）时，色相和饱和度的视觉感知保持稳定；HSL 中调 `lightness` 会让颜色「发粉」或「发灰」。

### 场景 2：暗色模式一行适配

```css
:root {
  color-scheme: light dark;

  --bg:    light-dark(oklch(99% 0.01 250), oklch(18% 0.02 250));
  --text:  light-dark(oklch(25% 0.03 250), oklch(92% 0.02 250));
  --panel: light-dark(oklch(96% 0.01 250), oklch(24% 0.03 250));
  --border:light-dark(oklch(85% 0.01 250), oklch(35% 0.03 250));
}

body {
  background: var(--bg);
  color: var(--text);
}
```

对比传统方案（需 2×N 个变量 + 媒体查询），`light-dark()` 把变量数减半，语义更直接。

### 场景 3：hover/active 状态色自动生成

```css
.btn-primary {
  background: var(--brand);
}
.btn-primary:hover {
  background: oklch(from var(--brand) calc(l + 0.08) c h);  /* 提亮 8% */
}
.btn-primary:active {
  background: oklch(from var(--brand) calc(l - 0.06) c h);  /* 压暗 6% */
}
```

无需为每个状态硬编码 hex，设计系统变更时自动级联。

### 场景 4：半透明遮罩与渐变混色

```css
.overlay {
  background: color-mix(in oklch, var(--brand) 15%, transparent);
}
.gradient-mix {
  background: linear-gradient(
    135deg,
    var(--brand),
    color-mix(in oklch, var(--brand) 40%, oklch(70% 0.25 30))
  );
}
```

---

## 5. 实际应用案例分析

### 案例：从 hex 色板迁移到 Oklch 设计系统

**背景**：某 SaaS 产品的设计系统维护了 180+ 个颜色 token，全部硬编码 hex。每次品牌色微调，需要设计师手动重新生成 9 级色板，前端逐行替换。

**迁移前**：

```css
:root {
  --blue-50: #eff6ff;   --blue-100: #dbeafe;  --blue-200: #bfdbfe;
  --blue-300: #93c5fd;  --blue-400: #60a5fa;  --blue-500: #3b82f6;
  --blue-600: #2563eb;  --blue-700: #1d4ed8;  --blue-800: #1e40af;
  /* ... 同理 red/green/amber/slate 各 9 级，共 180+ token */
}
```

痛点：

- 品牌主色 `#3b82f6` 换成 `#7c3aed` 时，9 级色板需全部重算；
- 暗色模式需额外维护 `dark-blue-50`…`dark-blue-900`，token 数翻倍；
- 设计师与前端对「同一色相的 200 色」认知不一致，反复校对。

**迁移后**：

```css
:root {
  color-scheme: light dark;

  /* 只需定义 5 个语义色 + 1 个品牌参数 */
  --brand-hue: 270;
  --brand-chroma: 0.22;

  --color-brand: oklch(55% var(--brand-chroma) var(--brand-hue));

  --color-bg:       light-dark(oklch(99% 0.01 var(--brand-hue)), oklch(16% 0.03 var(--brand-hue)));
  --color-surface:  light-dark(oklch(97% 0.01 var(--brand-hue)), oklch(22% 0.04 var(--brand-hue)));
  --color-text:     light-dark(oklch(22% 0.03 var(--brand-hue)), oklch(94% 0.02 var(--brand-hue)));
  --color-muted:    light-dark(oklch(55% 0.05 var(--brand-hue)), oklch(65% 0.04 var(--brand-hue)));
  --color-border:   light-dark(oklch(85% 0.01 var(--brand-hue)), oklch(35% 0.03 var(--brand-hue)));

  /* 交互状态自动推导 */
  --color-brand-hover: oklch(from var(--color-brand) calc(l + 0.08) c h);
  --color-brand-active: oklch(from var(--color-brand) calc(l - 0.06) c h);
  --color-brand-subtle: color-mix(in oklch, var(--color-brand) 12%, var(--color-bg));
}
```

**收益**：

- Token 数从 180+ 降至 12 个语义变量；
- 品牌色换 hue（如 270→200）只需改一行 `--brand-hue`；
- 暗色模式零额外 token，`light-dark()` 自动处理；
- hover/active/subtle 色由算法生成，设计师只需确认主色。

---

## 6. 最佳实践与常见坑

1. **Oklch 的 C 值不是饱和度**：`chroma` 与 `saturation` 不同，C 的上限取决于色域和色相。在 sRGB 内，多数 hue 的 C 上限约 0.37；写 `oklch(60% 0.5 120)` 浏览器会压缩到色域边界，结果不可预期。建议先用工具（oklch.com）查看目标色域的可行 C 值。
2. **light-dark() 必须配合 color-scheme**：如果根节点没写 `color-scheme: light dark;`，`light-dark()` 永远返回第一个参数（亮色值）。这是最常见的「暗色模式不生效」原因。
3. **color-mix() 的空间选择影响结果**：同一对颜色在 `srgb` 和 `oklch` 中混色结果差异显著。设计系统中混色统一用 `oklch`（感知均匀），特殊效果（如霓虹发光叠加）可尝试 `srgb-linear`。
4. **相对颜色的 calc() 限制**：`oklch(from ... calc(l + 0.15) ...)` 中，`calc()` 内不能引用 CSS 自定义属性（Level 5 限制），只能写常量。需要动态调整时，改用 `color-mix()` 与 `white`/`black` 混合。
5. **广色域与回退**：在支持 Display P3 的屏幕上，`oklch(70% 0.3 0deg)` 会比 sRGB 红更鲜艳；但在 sRGB 屏幕上浏览器会自动 gamut-map（色域映射）到最近的可显示色。无需手动写回退，但设计验收时需在两类屏幕上确认。
6. **DevTools 支持**：Chrome DevTools 样式面板会直接显示 `oklch()` 值，点击色块可在 hex/rgb/hsl/oklch 间切换。Safari 的 Web Inspector 对 `color-mix()` 会展开显示计算后的最终颜色。
7. **渐变中的 hue 插值**：默认 `oklch` 渐变在长弧跨越（如 0°→300°）时可能走「长路径」经过大量中间色相。可显式指定 `in oklch shorter hue` 或 `longer hue` 控制插值方向。
8. **PostCSS 降级**：如需支持 Firefox <128 或旧版 Chrome，使用 `postcss-preset-env`（stage 3）自动将 `oklch()`/`color-mix()` 降级为 `rgb()`/`#hex`。注意降级后的颜色会丢失广色域信息。

---

## 7. 参考资料

- [MDN: oklch()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/color_value/oklch)
- [MDN: color-mix()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/color_value/color-mix)
- [MDN: light-dark()](https://developer.mozilla.org/zh-CN/docs/Web/CSS/color_value/light-dark)
- [CSS Color Module Level 5 Spec](https://drafts.csswg.org/css-color-5/)
- [oklch.com — 可视化调色工具](https://oklch.com)
- [web.dev: OKLCH in CSS](https://web.dev/articles/oklch-in-css)
- [Evil Martians: OKLCH color picker](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
