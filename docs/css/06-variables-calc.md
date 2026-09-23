# 变量与计算（Custom Properties & calc）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 自定义属性让 CSS 有了"运行时"，`calc()` 系列函数让样式有了"计算器"，两者组合是现代主题系统与响应式布局的地基。

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
| [index-01-variable-basics.html](../../examples/css/06-variables-calc/index-01-variable-basics.html) | 自定义属性基础：作用域、继承、JS `setProperty` 联动 |
| [index-02-fluid-typography.html](../../examples/css/06-variables-calc/index-02-fluid-typography.html) | `calc()/min()/max()/clamp()` 流体排版与安全间距 |
| [index-03-theme-switcher.html](../../examples/css/06-variables-calc/index-03-theme-switcher.html) | 主题切换实战：`data-theme` + `localStorage` 记忆 |
| [index-04-property-registration.html](../../examples/css/06-variables-calc/index-04-property-registration.html) | `@property` 注册类型 + 变量驱动的动画与滑杆 |

---

## 1. 概念解释

### 1.1 是什么

**CSS 自定义属性**（Custom Properties，俗称 CSS 变量）是由作者定义的"实体"，在整篇文档中反复使用。声明以 `--` 开头，通过 `var()` 函数取值。它与传统预处理变量（Sass `$var`）的本质区别是：**它参与层叠、会被继承、可以在运行时被 JS 修改**——预处理变量在编译期就消失了，CSS 变量是活的。

**计算函数家族**：`calc()`（四则运算）、`min()`（取最小）、`max()`（取最大）、`clamp(MIN, VAL, MAX)`（夹逼）。它们让不同单位之间可以互相运算（如 `100% - 240px`），这是媒体查询做不到的"连续适配"。

### 1.2 解决什么问题

- **样式值集中管理**：品牌色、间距、圆角、字号收敛到 `:root` 一处，改一处全站生效，消灭"魔法数字"。
- **运行时主题**：换肤只需替换十几个变量（改 `data-theme` 属性即可），而不是切换多套 class 或重发整包 CSS。
- **JS/CSS 通信通道**：JS 通过 `setProperty()` 写一个变量，所有引用它的样式自动重算，无需逐个改内联样式。
- **流体适配**：`clamp(1rem, 2.5vw + 0.5rem, 1.75rem)` 让字号随视口连续缩放，替代无数个媒体查询断点。
- **类型化动画**：`@property` 注册后，原本只能"离散跳变"的自定义属性可以参与过渡与动画（如渐变角度插值）。

### 1.3 底层原理

**继承与层叠**：自定义属性和普通属性一样沿 DOM 树向下继承，子元素取"最近祖先"上的值。利用这一特性，在 `data-theme="dark"` 的容器上重定义 `--bg`，其全部后代自动换肤——**主题切换的本质就是利用继承的作用域覆盖**。

**惰性求值与"invalid at computed-value time"**：`var()` 是引用而非拷贝，浏览器在计算样式阶段才代入值。若引用了一个未定义的变量且没有回退值，属性会退化为"未设值"（继承或初始值），而不是报错——这就是为什么必须善用 `var(--x, fallback)`。

**`@property` 与注册类型**：未注册的自定义属性对浏览器来说只是"字符串"，无法插值。`@property`（CSS Properties and Values API）声明语法类型（`<color>`、`<length>`、`<number>` 等）与初始值后，浏览器知道了它的类型，于是：① 可参与 transition/animation 的逐帧插值；② 类型不匹配时回退到初始值；③ 可被 `getComputedStyle` 返回规范化值。

**`calc()` 的求值规则**：运算符两侧要求类型兼容——`+`/`-` 两侧必须是同类型（`px` 减 `px`），`*`/`/` 一侧必须是无单位数。除数不能为 0。现代浏览器已支持在 `calc()` 中直接引用变量做混合单位运算。

**性能心智模型**：变量变更会触发引用它的元素重新计算样式（recalc styles），作用域越大重算面越广；把高频变化的变量挂在"尽可能小的子树根"上，是变量性能优化的核心。

---

## 2. 语法说明

### 2.1 自定义属性

```css
:root {
  --brand: #4361ee;          /* 值可以是颜色、数字、字符串、甚至整条声明 */
  --gap: 16px;
  --shadow: 0 4px 12px rgba(0,0,0,.15);   /* 整段值也能成为变量 */
}
.card {
  color: var(--brand);                       /* 基本用法 */
  margin: var(--gap, 8px);                   /* 带回退值：--gap 未定义时用 8px */
  box-shadow: var(--shadow);                 /* 整段值注入 */
  background: linear-gradient(var(--deg, 90deg), #eee, #fff);
}
```

要点：

- 声明以 `--` 开头，**区分大小写**（`--Color` 与 `--color` 是两个变量）；
- 作用域即 DOM 继承作用域：写在 `:root` 全局可用，写在 `.card` 只有其后代可用；
- `var(变量名, 回退值)` 的回退值支持嵌套：`var(--a, var(--b, 0))`；
- 变量可以做**二次引用拼接**：`--gap-lg: calc(var(--gap) * 2);`

### 2.2 JS 读写

```js
// 写：setProperty 作用于指定元素及其后代（继承生效范围）
document.documentElement.style.setProperty('--brand', '#e84118');
el.style.setProperty('--deg', '135deg');

// 读：getComputedStyle 返回"计算后"的值
const v = getComputedStyle(document.documentElement).getPropertyValue('--brand'); // "#e84118"

// 删除内联变量，让继承恢复
el.style.removeProperty('--deg');
```

### 2.3 `@property` 注册

```css
/* syntax 决定类型与插值能力；inherits 决定是否继承 */
@property --deg {
  syntax: '<angle>';        /* <color> <length> <number> <percentage> <angle> ... 或 "+" 列表 / "*" 任意 */
  initial-value: 90deg;     /* 必须与 syntax 类型匹配 */
  inherits: false;          /* false：每个元素独立，动画互不干扰 */
}
```

### 2.4 计算函数

| 函数 | 语法 | 语义 | 典型用途 |
| --- | --- | --- | --- |
| `calc()` | `calc(表达式)` | 四则混合运算，单位可混算 | `width: calc(100% - 240px)` |
| `min()` | `min(a, b, …)` | 取最小（受限于上限） | `width: min(100%, 1200px)` 大屏封顶 |
| `max()` | `max(a, b, …)` | 取最大（受限于下限） | `padding: max(24px, 4vw)` 小屏兜底 |
| `clamp()` | `clamp(MIN, VAL, MAX)` | 等价 `max(MIN, min(VAL, MAX))` | 流体字号、流体间距一步到位 |

```css
/* 流体标题：视口每变 1%，字号按斜率变化，且被 [1.5rem, 3rem] 夹住 */
h1 { font-size: clamp(1.5rem, 1rem + 2.5vw, 3rem); }

/* 安全间距：小屏不少于 16px，大屏随视口增长但不超过 48px */
.section { padding: clamp(1rem, 4vw, 3rem); }

/* 混合单位：弹性主列减去固定侧栏，无需媒体查询 */
.layout-main { width: calc(100% - var(--sidebar-w, 240px)); }
```

### 2.5 主题切换套路

```css
:root { --bg:#fff; --ink:#222; }               /* 亮色为默认 */
[data-theme="dark"] { --bg:#121826; --ink:#e6e9f0; }  /* 覆盖同一组变量 */
body { background: var(--bg); color: var(--ink); }    /* 只引用变量，不关心主题 */
```

HTML 上只需 `document.documentElement.dataset.theme = 'dark'`，配合 `localStorage.setItem('theme', 'dark')` 与 `prefers-color-scheme` 媒体查询即可构成完整方案（见示例 03）。

---

## 3. 浏览器兼容性

**以下为大致基线**（依据 caniuse 数据整理，实际支持请以最新 caniuse 为准）：

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| CSS 自定义属性 `var()` | 49 | 15 | 31 | 9.6 | iOS 9.3+ / Android WebView 49+ | 老版 IE/Edge Legacy 完全不支持，需构建期降级 |
| `@property` 注册 | 85 | 85 | 128 | 16.4 | Android WebView 85+ / iOS 16.4+ | Firefox 2024 年才补齐；不支持时优雅降级为"字符串变量"，动画退化成跳变 |
| `calc()` | 26（旧 `calc(100% - 10px)` 需空格） | 12 | 16 | 7 | 全线支持 | 运算符两侧**必须有空格**（负号除外），`calc(100%-10px)` 解析失败 |
| `min()` / `max()` | 79 | 79 | 75 | 11.1 | iOS 11.3+ | 老内核可用 `min()`/`max()` 嵌套 `calc()` 的写法逐步替代 |
| `clamp()` | 79 | 79 | 75 | 13.1 | iOS 13.4+ | 流体排版首选；不支持时提供固定字号回退行 |
| JS `setProperty` / `getPropertyValue` | 49 | 15 | 31 | 9.6 | 随内核跟进 | 读未定义变量返回空字符串而非报错，注意判空 |
| 环境变量 `env(safe-area-inset-*)` | 69 | 79 | 65 | 11 | 刘海屏适配必备 | 需配合 `viewport-fit=cover` 才有非零值 |

> 坑点小结：变量本身兼容性已经"绿透"，真正的分水岭在 `@property`（动画插值场景）——生产中应把"注册类型"视为渐进增强，把"变量换肤"视为基础能力。

---

## 4. 使用场景示例

> 每个场景在示例目录中都有对应的可交互页面，此处给出核心代码与逐段注释。

### 场景 1：变量作用域与继承实验（组件化思维训练）

```css
/* 全局默认：:root 挂载，所有后代可继承 */
:root { --accent: #4361ee; --radius: 8px; }

/* 局部覆盖：只在 .card 子树内生效，出了卡片自动还原 */
.card { --accent: #e84118; border-radius: var(--radius); }
.card .tag { background: var(--accent); }   /* 红色 —— 吃到局部覆盖 */
.tag { background: var(--accent); }          /* 蓝色 —— 在卡片外，用回全局 */
```

```js
// JS 只写一行，两个作用域的表现立刻分开：
document.querySelector('.card').style.setProperty('--accent', '#10ac84');
// 卡片内变绿，卡片外仍为品牌蓝 —— 继承边界可视化
```

**预期效果**：拖动滑杆修改"局部/全局"变量，页面不同区域颜色分层变化，直观看到继承边界。完整演示见 [index-01-variable-basics.html](../../examples/css/06-variables-calc/index-01-variable-basics.html)。

### 场景 2：`clamp()` 流体排版与安全间距（内容站/营销页）

```css
/* 流体标题：把"最小字号 + 斜率"写进中间表达式，
   比纯 5vw 更可控 —— 窄屏不会小到看不清，宽屏不会大得出格 */
.hero h1 {
  font-size: clamp(1.75rem, 1.2rem + 2.6vw, 3.5rem);
  line-height: 1.15;               /* 大字号行高收紧，视觉更稳 */
}

/* 段落宽度：min(上限, 百分比) 保证超大屏可读行长 */
.hero p { max-width: min(42rem, 92vw); }

/* 区块间距：小屏兜底 24px，大屏最多 64px */
.section { padding-block: clamp(1.5rem, 6vw, 4rem); }
```

**预期效果**：拖动浏览器窗口宽度，标题与间距连续平滑缩放、触底/触顶后锁定，全程零媒体查询。完整演示见 [index-02-fluid-typography.html](../../examples/css/06-variables-calc/index-02-fluid-typography.html)。

### 场景 3：暗色模式主题切换（任意 Web 应用）

```css
:root {
  --bg: #ffffff; --surface: #f4f6fb; --ink: #1c2430; --brand: #4361ee;
  color-scheme: light;             /* 让滚动条/表单控件跟随亮色 */
}
[data-theme="dark"] {
  --bg: #10151f; --surface: #1a2233; --ink: #e6e9f0; --brand: #7f9cf5;
  color-scheme: dark;
}
body { background: var(--bg); color: var(--ink); transition: background .3s; }
```

```js
// 三段式：初始化读缓存 → 系统偏好兜底 → 手动切换写缓存
const saved = localStorage.getItem('theme');
if (saved) {
  document.documentElement.dataset.theme = saved;
} else if (matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.dataset.theme = 'dark';
}
toggleBtn.onclick = () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;      // 换肤 = 改一个属性
  localStorage.setItem('theme', next);                // 记住选择
};
```

**预期效果**：点击开关整站换色；刷新后记住上次选择；未选择时跟随系统。完整演示见 [index-03-theme-switcher.html](../../examples/css/06-variables-calc/index-03-theme-switcher.html)。

### 场景 4：`@property` 让变量参与动画（渐变旋转/进度环）

```css
/* 注册角度类型：浏览器知道它是 <angle>，才能逐帧插值 */
@property --deg {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
.gradient-ring {
  background: conic-gradient(from var(--deg), #4361ee, #10ac84, #f9ca24, #4361ee);
  animation: spin 3s linear infinite;   /* 未注册时此动画只会"跳变" */
}
@keyframes spin { to { --deg: 360deg; } }
```

```js
// 注册后 JS 修改变量也能触发过渡：
ring.style.setProperty('--deg', '180deg');   // 平滑转动到 180deg
```

**预期效果**：锥形渐变边框匀速旋转；拖动滑杆改变角度时渐变平滑跟随。完整演示见 [index-04-property-registration.html](../../examples/css/06-variables-calc/index-04-property-registration.html)。

### 场景 5：侧栏宽度由变量驱动（中后台布局）

```css
:root { --sidebar: 240px; }
.layout { display: grid; grid-template-columns: var(--sidebar) 1fr; }
.layout.collapsed { --sidebar: 64px; }    /* 折叠态只是换一个变量值 */
/* 引用方无需知道折叠逻辑，grid 自动重排并可通过 transition 平滑 */
.layout { transition: grid-template-columns .25s; }
```

**预期效果**：点击折叠按钮，侧栏在 240px 与 64px 间平滑过渡，主列实时跟随。完整演示见 [index-02-fluid-typography.html](../../examples/css/06-variables-calc/index-02-fluid-typography.html) 的布局区。

---

## 5. 实际应用案例分析

### 案例 1：电商大促营销页 —— `clamp()` 流体排版替代 12 个媒体查询断点

**背景**：某电商大促专题页需覆盖 320px～2560px 设备，设计稿给出 5 套字号标注。早期实现写了 12 个媒体查询，改一次设计要同步十几个断点，且 720px～1024px 之间视觉"跳变"明显。

**方案选型**：

- 把设计稿的"最小/最大视口 + 最小/最大字号"代入线性公式生成斜率：`font-size: clamp(MINrem, a rem + b vw, MAXrem)`；
- 间距系统同样用 `clamp(1rem, 0.5rem + 2vw, 2.5rem)` 收敛为"流体 8pt 栅格"；
- 仅在**布局结构**变化处（单列→双列）保留 2 个媒体查询。

**踩坑与分析**：

1. **Safari 12 上 `clamp` 不可用**：构建工具为 `clamp()` 生成一条 `font-size: 2rem;` 的回退声明在前、`clamp()` 在后，不支持时自动回退。
2. **移动端横竖屏切换"字号突变"**：因为 `vw` 随横屏暴涨。解法是在公式中混入 `vmin` 或对横屏做专项 clamp。
3. **运营在富文本里塞了行内 style 固定字号**，流体系统局部失效。随后在富文本容器上用 `:where()` 重置 + CSS 变量注入（`--fs-base`）统一接管。
4. **性能**：变量集中在 `:root`，页面滚动零变量写入，无 recalc 风暴；动态部分（倒计时颜色）只把变量挂在计时器组件根节点上。

**结论**：排版类连续适配交给 `clamp()`，结构性断点交给媒体查询，两者分工而不是替代。

### 案例 2：中后台系统 —— 变量驱动的设计令牌（Design Tokens）+ `@property` 渐进增强

**背景**：某中后台平台 40+ 页面，暗色模式与"品牌定制"需求并存：不同租户要求主题色可配置。旧方案是构建期打包 N 套 CSS，租户一多体积爆炸。

**方案选型**：

- 建立"基础层→语义层→组件层"三级变量：`--blue-600` → `--brand` → `--btn-bg`；换肤只动语义层；
- 租户色值通过登录接口下发，JS `setProperty('--brand', tenantColor)` 一次写入；
- `color-scheme` 与表单控件联动，避免暗色下输入框"白块"突兀；
- 圆角/阴影风格开关用 `@property` 注册 `<length>`/`<color>`，让"紧凑模式→舒适模式"可以平滑过渡。

**踩坑与分析**：

1. **Firefox < 128 不支持 `@property`**：注册失败的属性退化为普通字符串变量，过渡瞬间跳变但功能无损——因此所有 `@property` 只用于增强动画，不承载核心功能。
2. **租户色对比度失控**：用户传了接近白色的主色，按钮文字看不清。上线了对比度校验：后端计算 WCAG 对比度，不达标时自动换用深色文字变量 `--on-brand`。
3. **SSR 闪烁（FOUC）**：主题脚本必须内联在 `<head>`、先于样式渲染执行，否则暗色用户每次刷新都"白闪"。
4. **第三方弹窗挂到 body 外**：继承不到业务容器的变量，统一把主题变量定义在 `html:root` 而非应用容器上。

**结论**：变量体系的价值在"分层"，`@property` 是锦上添花；上线顺序应该是先语义层、后动画增强。

---

## 6. 最佳实践与常见坑

1. **变量名语义化、分三级**：原子色板（`--blue-600`）只进设计令牌层，业务代码只引用语义变量（`--brand`、`--ink`），换肤成本最低。
2. **`var()` 必须带回退值**（尤其公共组件库）：`var(--brand, #4361ee)` 保证组件被单独取用时不会因为缺变量而"透明失效"。
3. **`calc()` 运算符两侧留空格**：`calc(100%-20px)` 是非法的（会被当成 `100%` 后跟单位 `-20px`），这是经典报错。
4. **变量区分大小写**：`--PrimaryColor` 与 `--primaryColor` 是两个变量，团队应统一命名规范（推荐 kebab-case 全小写）。
5. **未注册变量不能参与过渡/动画**：动画里出现"闪变"不是 bug 而是机制——需要插值就用 `@property` 注册类型。
6. **`@property` 的 `initial-value` 必填且类型匹配**：缺省会导致整条注册失效；`syntax: '*'` 可接受任意值但失去插值能力。
7. **不要把变量挂在高频更新的节点上**：如跟随鼠标改 `--x` 时应挂在容器而非 `:root`，缩小样式重算范围；更高频的场景改用 transform 直接操作。
8. **`clamp(MIN, VAL, MAX)` 参数顺序不能反**：它内部是 `max(MIN, min(VAL, MAX))`，写成 `clamp(MAX, VAL, MIN)` 逻辑完全错乱。
9. **`min()`/`max()` 里的"最小/最大"是数值意义**：`min(100%, 1200px)` 表示"宽屏时封顶 1200px"，别被函数名误导。
10. **暗色模式避免纯黑纯白**：`#000`/`#fff` 对比过强易疲劳，用 `#10151f`/`#e6e9f0` 一类的"软黑软白"；同时记得设置 `color-scheme` 让原生控件跟随。
11. **主题初始化脚本内联到 `<head>`**：防止 FOUC（先亮后暗的闪屏），并在渲染前读取 `localStorage` 与 `prefers-color-scheme`。
12. **用 `@supports` 检测再增强**：`@supports (color: color-mix(in srgb, red, blue))` 等检测与变量体系搭配，保证老内核可用性。

---

## 7. 参考资料

- MDN — 使用 CSS 自定义属性：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties>
- MDN — `var()`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/var>
- MDN — `@property`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/@property>
- MDN — `calc()`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/calc>
- MDN — `clamp()`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/clamp>
- MDN — `min()` / `max()`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/min>
- MDN — CSS Properties and Values API：<https://developer.mozilla.org/en-US/docs/Web/API/CSS_Properties_and_Values_API>
- CSS Custom Properties 规范（CSS Variables Level 1）：<https://www.w3.org/TR/css-variables-1/>
- CSS Values and Units Level 4 规范（calc 家族）：<https://drafts.csswg.org/css-values-4/#math-function>
- caniuse — CSS Variables：<https://caniuse.com/css-variables>
- caniuse — `@property`：<https://caniuse.com/mdn-css_at-rules_property>
- 流体排版计算器（生成 clamp 公式）：<https://utopia.fyi/type/calculator/>
