# @property 自定义属性注册（CSS Properties and Values API）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— `@property` 把 CSS 自定义属性从「字符串通配符」升级为「有类型、可动画、可继承」的注册变量。注册后，颜色过渡不再闪现黑屏、百分比补间不再跳变、自定义属性的值可参与计算与动画——这是 Houdini 三件套中最实用的一件。

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
| [index-01-property.html](../../examples/css/20-property/index-01-property.html) | 颜色过渡无黑屏 + 百分比平滑动画 + 角度旋转 + 长度缩放 + 自动补间 vs 跳变对比 |

---

## 1. 概念解释

### 1.1 @property 是什么

传统 CSS 变量（`--x: red`）本质是**字符串**：

```css
:root { --color: red; }
.target { background: var(--color); }

/* 过渡时浏览器看到的是「字符串 red → 字符串 blue」，不知如何补间 */
.target:hover { --color: blue; transition: --color 1s; }
/* 结果：1 秒后瞬间跳变，中间没有过渡 */
```

`@property` 给变量一个**类型声明**：

```css
@property --color {
  syntax: "<color>";
  inherits: false;
  initial-value: transparent;
}

:root { --color: red; }
.target { background: var(--color); transition: --color 1s; }
.target:hover { --color: blue; }
/* 结果：真正的红→蓝颜色过渡，中间帧由浏览器逐色插值 */
```

注册后的自定义属性从「任意字符串」变成了「类型安全的计算值」，浏览器知道如何对它做**插值**和**计算**。

### 1.2 解决什么问题

| 痛点 | 未注册行为 | @property 注册后 |
| --- | --- | --- |
| 颜色过渡黑屏 | 字符串跳变，浏览器无法补间 | `<color>` 类型 → 正常 RGB 插值 |
| 百分比/长度过渡跳变 | `0% → 100%` 瞬间切换 | `<percentage>` / `<length>` → 数值插值 |
| 角度旋转不平滑 | `0deg → 360deg` 无动画 | `<angle>` → 数值插值 |
| transform 多个值不同步 | 各属性各自动画，错位 | 注册后可用一个变量串联多个 transform 函数 |
| `color-mix()` 参数无法动画 | 参数是字符串 | `<color>` 变量可动画，驱动 color-mix |
| JS 读取 CSS 变量缺少单位 | `getComputedStyle` 返回字符串 | 注册后浏览器解析为结构化值，语义明确 |

### 1.3 底层原理

`@property` 属于 CSS Houdini 的 **Properties and Values API**。它把自定义属性注册进 CSS 解析器的「类型系统」：

```css
@property --x {
  syntax: "<length> | <percentage>";
  inherits: true;
  initial-value: 0px;
}
```

- **syntax**：声明允许的数据类型（见第 2 节类型表）。赋值不合法时，`var(--x)` 使用 `initial-value`。
- **inherits**：是否像普通属性一样继承。设为 `false` 时子元素默认取 `initial-value`，不会从父元素继承。
- **initial-value**：语法校验失败或属性未赋值时的回退值。`syntax` 包含 `<color>` 时必须提供。

浏览器遇到 `transition: --x 1s` 时，检查 `--x` 已注册且有可插值类型，于是按该类型的规则逐帧计算中间值。

---

## 2. 语法说明

### 2.1 基本语法

```css
@property --my-var {
  syntax: "<type>";       /* 必填 */
  inherits: true | false; /* 必填 */
  initial-value: <value>; /* 取决于 syntax */
}
```

### 2.2 常用 syntax 类型

| 类型 | 含义 | 示例 initial-value |
| --- | --- | --- |
| `<length>` | 长度（px、rem、% 不行） | `0px` |
| `<percentage>` | 百分比 | `0%` |
| `<length-percentage>` | 长度或百分比 | `0px` |
| `<number>` | 纯数字 | `0` |
| `<angle>` | 角度（deg、rad、turn） | `0deg` |
| `<time>` | 时间（s、ms） | `0s` |
| `<color>` | 颜色 | `transparent` / `#000` |
| `<transform-function>` | 单个 transform 函数 | `scale(1)` |
| `<transform-list>` | 完整 transform 列表 | `none` |
| `<custom-ident>` | 自定义标识符 | `none` |
| `<image>` | 图像（渐变等） | — |

组合写法：

```css
syntax: "<length> | <percentage>";         /* 长度或百分比 */
syntax: "<color>#";                        /* 逗号分隔的颜色列表 */
syntax: "<length>+";                       /* 空格分隔的多个长度 */
syntax: "small | medium | large";          /* 枚举值（自定义标识符） */
syntax: "*";                               /* 任意值（默认行为，不推荐） */
```

### 2.3 与 var() 的回退值优先级

```css
@property --accent {
  syntax: "<color>";
  inherits: false;
  initial-value: #3b82f6;
}
.element {
  color: var(--accent, red);   /* --accent 未定义或无效时，用 initial-value */
  /* 注意：var 的 fallback 只在「属性完全未定义」时生效；
     @property 的 initial-value 在「语法无效」时也生效 */
}
```

### 2.4 在 JS 中注册

```js
CSS.registerProperty({
  name: "--bg-color",
  syntax: "<color>",
  inherits: false,
  initialValue: "transparent",
});
```

JS 注册优先级与 CSS `@property` 相同；适用于**运行时根据主题动态注册**的场景。

### 2.5 与 transition / animation 的配合

```css
@property --progress {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

.bar {
  --progress: 0%;
  width: var(--progress);      /* 注意：width 本身不是变量，不能 transition --progress 来驱动 */
  /* 正确做法： */
  transition: width 1s;        /* width 自身做动画 */
}
.bar.fill { --progress: 100%; width: var(--progress); }
```

**关键限制**：动画目标是「自定义属性本身」才能用 `transition: --progress 1s`。如果属性值被用在 `width` 等属性上，需要同时注册变量**并**让目标属性引用它——浏览器在动画目标属性时，会逐帧重新计算 `var()`。

---

## 3. 浏览器兼容性

| 浏览器 | 版本 | 发布时间 |
| --- | --- | --- |
| Chrome / Edge | 85+ | 2020-08 |
| Safari | 16.4+ | 2023-03 |
| Firefox | 128+ | 2024-07 |

> Chrome 最早支持（85），Firefox 最晚（128）。2024 年中起全面可用。`@property` 规则本身在不支持的浏览器中会被忽略（CSS 的容错机制），但变量退化为未注册状态，动画效果丢失——需渐进增强。

---

## 4. 使用场景示例

### 场景 1：颜色过渡无黑屏

```css
@property --fill { syntax: "<color>"; inherits: false; initial-value: #334155; }

.chip {
  --fill: #334155;
  background: var(--fill);
  transition: --fill 0.4s ease;
}
.chip:hover { --fill: #22d3ee; }
```

### 场景 2：驱动 color-mix() 参数

```css
@property --mix { syntax: "<percentage>"; inherits: false; initial-value: 0%; }

.gradient-btn {
  --mix: 0%;
  background: color-mix(in oklab, #22d3ee var(--mix), #7c3aed);
  transition: --mix 0.5s ease;
}
.gradient-btn:hover { --mix: 100%; }
```

### 场景 3：transform 串联动画

```css
@property --tx { syntax: "<length>"; inherits: false; initial-value: 0px; }
@property --s  { syntax: "<number>"; inherits: false; initial-value: 1; }

.card {
  --tx: 0px; --s: 1;
  transform: translateX(var(--tx)) scale(var(--s));
  transition: --tx 0.3s ease, --s 0.3s ease;
}
.card.active { --tx: 20px; --s: 1.05; }
```

### 场景 4：角度旋转

```css
@property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }

.spinner {
  --angle: 0deg;
  transform: rotate(var(--angle));
  animation: spin 2s linear infinite;
}
@keyframes spin { to { --angle: 360deg; } }
```

---

## 5. 实际应用案例分析

### 案例：设计系统「主题色过渡」

**背景**：某设计系统支持一键切换主题（亮色/暗色），过渡时长 400ms。原有方案：

```css
/* 改造前：逐属性写 transition */
body {
  background: var(--bg);
  color: var(--fg);
  transition: background 0.4s, color 0.4s, border-color 0.4s, ...
  /* 20+ 个属性要写，漏一个就跳变 */
}
```

问题：每次新增主题相关属性都要记得补 `transition`，漏掉就导致该属性切换时瞬间跳变。

**改造后**：把所有主题色打包成**一个**注册变量驱动的色调旋转：

```css
@property --hue-shift { syntax: "<angle>"; inherits: true; initial-value: 0deg; }

:root {
  --hue-shift: 0deg;
  --primary: hsl(calc(200 + var(--hue-shift)) 80% 50%);
  --surface: hsl(calc(220 + var(--hue-shift)) 20% 95%);
  --text: hsl(calc(220 + var(--hue-shift)) 20% 10%);
  transition: --hue-shift 0.4s ease;   /* 只需 transition 一个变量 */
}

[data-theme="warm"] { --hue-shift: -30deg; }
[data-theme="cool"]  { --hue-shift: 30deg; }
```

**进阶：直接使用多个注册颜色变量**：

```css
@property --primary   { syntax: "<color>"; inherits: true; initial-value: #3b82f6; }
@property --surface   { syntax: "<color>"; inherits: true; initial-value: #f8fafc; }
@property --text      { syntax: "<color>"; inherits: true; initial-value: #0f172a; }

:root { --primary: #3b82f6; --surface: #f8fafc; --text: #0f172a; }

[data-theme="dark"] {
  --primary: #60a5fa;
  --surface: #1e293b;
  --text: #e2e8f0;
}

body {
  background: var(--surface);
  color: var(--text);
  transition: --primary 0.4s, --surface 0.4s, --text 0.4s;
}
```

**收益**：

- 主题切换从「20+ 个属性各自过渡」缩减为「3 个注册变量过渡」；
- 新增主题相关颜色时，只需要注册 + transition 声明，不会漏掉；
- 颜色过渡中间帧由浏览器插值，不会出现未定义的中间色（黑屏）。

---

## 6. 最佳实践与常见坑

1. **initial-value 必须合法**：`syntax: "<color>"` 的 `initial-value` 不能写 `0`（不是颜色），否则整规则被丢弃。写 `transparent` 最安全。
2. **长度 vs 百分比要分开**：`syntax: "<length>"` 不接受 `50%`，需要接受百分比时写 `<length-percentage>`。
3. **transition 目标是变量本身**：想让 `--x` 驱动 `width`，需要 `transition: --x 1s` + `width: var(--x)`，不能只写 `transition: width 1s` 却期望变量变化自动触发——`width` 的 transition 只在 `width` 自身值变化时触发。
4. **inherits 的默认值**：未注册时自定义属性默认继承；注册后 `inherits` 必填。设为 `false` 适合组件局部变量（如 `--progress`），设为 `true` 适合主题变量（如 `--primary`）。
5. **不要在运行时大量 JS 注册**：`CSS.registerProperty` 虽支持，但注册过多属性会增加解析器负担。静态规则用 `@property` 写在 CSS 里。
6. **@property 规则位置**：写在任何规则块外面（与 `@media`、`@layer` 同级），不能嵌套在普通规则内部。
7. **语法校验失败即 fallback**：给 `--x` 赋 `red` 但 syntax 是 `<length>`，则 `var(--x)` 使用 `initial-value`。这种静默回退在调试时容易被忽略——DevTools 会标注 invalid property value。
8. **与 CSS 变量命名空间**：注册 `--my-app-primary` 比注册 `--primary` 更安全，避免与第三方库冲突。

---

## 7. 参考资料

- [MDN: @property](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@property)
- [MDN: CSS.registerProperty](https://developer.mozilla.org/zh-CN/docs/Web/API/CSS/registerProperty_static)
- [Can I use: @property](https://caniuse.com/mdn-css_at-rules_property)
- [W3C: CSS Properties and Values API Level 1](https://drafts.css-houdini.org/css-properties-values-api/)
- [web.dev: Animating CSS custom properties](https://web.dev/articles/at-property)
