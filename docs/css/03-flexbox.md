# 弹性布局 Flexbox（Flexible Box Layout）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— Flexbox 是 CSS 的一维布局系统：让容器有能力"改变子项的宽度/高度（乃至顺序）"，以便最好地填充可用空间，是现代页面中导航栏、工具条、卡片行、表单排布的默认首选。

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
| [index-01-axis-alignment.html](../../examples/css/03-flexbox/index-01-axis-alignment.html) | 主轴/交叉轴交互面板：direction、justify-*、align-*、wrap 实时切换 |
| [index-02-flex-grow-shrink-basis.html](../../examples/css/03-flexbox/index-02-flex-grow-shrink-basis.html) | flex 三属性与简写陷阱：`flex:1` vs `flex:auto`、`min-width:auto` 溢出与修复 |
| [index-03-holy-grail-sticky-footer.html](../../examples/css/03-flexbox/index-03-holy-grail-sticky-footer.html) | 圣杯布局 + 粘性页脚（内容长短可切换） |
| [index-04-nav-cards-form.html](../../examples/css/03-flexbox/index-04-nav-cards-form.html) | 实战三合体：响应式导航栏、等高分栏卡片、表单行 |

---

## 1. 概念解释

### 1.1 是什么

Flexbox（弹性盒子布局，CSS Flexible Box Layout Module Level 1）是一种**一维**布局模型：元素沿**一根轴**（水平或垂直）排列，容器可以把剩余空间按比例分配给子项，也可以把子项压缩、拉伸、对齐、换行、重排。

给容器设置 `display: flex` 或 `display: inline-flex` 后，它就成为**弹性容器（flex container）**，其直接子元素自动成为**弹性项目（flex item）**——注意 Flex 的作用范围只有"一层"：孙元素不会成为 flex item，除非孙元素的父级本身也是 flex 容器。

### 1.2 解决什么问题

在 Flexbox 出现之前，前端只能用浮动（float）+ 清除浮动、行内块（inline-block）+ 空白符 hack、表格（display: table）或绝对定位来排布界面，以下问题长期无解或代价高昂：

- **垂直居中**：未知高度的元素垂直居中曾需要 `position + transform` 或表格技巧；Flex 里 `align-items: center` 一行解决。
- **等高布局**：浮动布局中各列高度互不相干，需要人为补背景或 JS 测量；Flex 子项默认 `align-items: stretch` 天然等高。
- **剩余空间分配**：让某列"占满剩余宽度"曾是 `width: calc(100% - 200px)` 的算术游戏；Flex 用 `flex: 1` 表达"意图"而非"数值"。
- **内容不定长的一维排列**：标签数量不固定的标签栏、按钮组，用 Flex 排列 + `gap` 控距即可，无需关心最后一个元素的 margin。
- **顺序与源码解耦**：`order` 让移动端把主内容提前、视觉上后置成为可能（对 SEO/读屏友好）。

一句话总结：**Flex 把"怎么排"从计算问题变成了声明问题**。

### 1.3 底层原理

#### 1.3.1 两根轴：主轴与交叉轴

Flex 的一切属性都以"轴"为坐标系。容器通过 `flex-direction` 指定**主轴（main axis）**方向，与之垂直的方向就是**交叉轴（cross axis）**：

| flex-direction | 主轴方向 | 交叉轴方向 | 主轴起点 |
| --- | --- | --- | --- |
| `row`（默认） | 水平，从左到右 | 垂直，从上到下 | 左 |
| `row-reverse` | 水平，从右到左 | 垂直 | 右 |
| `column` | 垂直，从上到下 | 水平 | 上 |
| `column-reverse` | 垂直，从下到上 | 水平 | 下 |

两个关键推论：

1. `justify-content` 永远作用于**主轴**，`align-items/align-self/align-content` 永远作用于**交叉轴**。把 `flex-direction` 从 `row` 改成 `column` 后，这两个属性的"分工对象"随之对调——这是"垂直居中写 align 还是 justify"困惑的根源。
2. 逻辑属性视角：主轴方向与书写模式（`writing-mode`/`direction`）相关。`row` 在从右向左的语言里就是"从右到左"，因此需要与物理方向无关的样式时，优先用 start/end 而非 left/right 心智。

#### 1.3.2 Flex 格式化上下文

`display: flex` 会让容器建立一个新的 **flex formatting context**：

- 子项的 `float`、`clear` 失效；`vertical-align` 失效（对齐交给 align-\* 系列）；
- 子项的外边距**不再折叠**（普通流中相邻 margin 会合并，Flex 内逐项排布、不合并）；
- 容器自身作为块级盒参与外部布局，`inline-flex` 则表现为行内块；
- 容器内的匿名文本（如纯文本节点）会被包成匿名 flex item 参与布局；绝对定位（`position: absolute`）的子元素**脱离 flex 布局**，其包含块若恰是该容器，则按容器的内边距盒对齐，可用 `inset` 精确定位。

#### 1.3.3 弹性分配算法（理解一切弹性现象的钥匙）

浏览器对每个 flex line（每个"行/列"）执行如下主轴尺寸求解过程：

1. **确定基准尺寸（flex base size）**：按 `flex-basis`（`auto` 时取 width/height，仍为 `auto` 时取内容的 max-content）作为起点；
2. **识别假想主尺寸（hypothetical main size）**：把基准尺寸用 `min-width`/`max-width`（即 flex item 的 min/max 属性，注意默认 `min-width: auto`）钳制后的结果；
3. **计算剩余/不足空间**：`剩余空间 = 容器主尺寸 − Σ各项假想主尺寸 − Σ边框外边距 − gap`；
4. **弹性因子分配**：
   - 剩余空间为正 → 各项按 `flex-grow` 权重瓜分剩余空间；
   - 剩余空间为负（溢出）→ 按 `flex-shrink` 权重 × 基准尺寸加权收缩（大项目多收缩，避免小项目被压没了）；
5. **冻结（freeze）**：分配过程中若某项被自己的 min/max 钳制（"violated min/max"），先冻结该项、把剩余弹性因子从总和中扣除，再对剩余项目重新分配——这就是"某一项卡在 min-content 导致其他项被压缩到变形"现象的算法来源。

理解这套流程后，`flex: 1` 与 `flex: auto` 的区别（见 2.3）、`min-width: auto` 溢出坑（见 2.2 末尾）都不再是"背口诀"，而是算法的自然结果。

#### 1.3.4 自动最小尺寸（automatic minimum size）——Flex 第一大坑

规范规定：flex item 的 `min-width`/`min-height` 初始值不是 `0`，而是 **`auto`**。当该项 `overflow` 为 `visible` 时，`auto` 解析为**内容最小尺寸（content-based minimum size）**——近似等于 `min-content`。

后果：一个装着长单词、长 URL 或固定宽度表格的弹性项目，**永远不会被压缩到比它内容的 min-content 更小**。在窄屏下整行溢出，而 `flex-shrink: 1` 看起来"不生效"。经典修复是给该项（或其内容承载层）加：

```css
.f-item { min-width: 0; }   /* 允许压缩到 0，配合 overflow: hidden / ellipsis */
```

跨轴方向同理有 `min-height: auto`：容器是 `column` 方向、且子项内容超高时同样会出现"压不下去"的溢出，修复方式一致（`min-height: 0` 或给中间层 `overflow: hidden`）。

---

## 2. 语法说明

### 2.1 容器属性（作用于 `display: flex` 的元素）

| 属性 | 可选值 | 说明 |
| --- | --- | --- |
| `display` | `flex` / `inline-flex` | 容器块级化 / 行内块化，子项自动成为 flex item |
| `flex-direction` | `row` / `row-reverse` / `column` / `column-reverse` | 主轴方向，决定"一行"是横排还是竖排 |
| `flex-wrap` | `nowrap`（默认）/ `wrap` / `wrap-reverse` | 是否允许换行；`nowrap` 时子项会被强制压缩（配合 shrink） |
| `flex-flow` | `<flex-direction> \|\| <flex-wrap>` | 上述两项的简写，如 `flex-flow: column wrap` |
| `justify-content` | `flex-start` / `flex-end` / `center` / `space-between` / `space-around` / `space-evenly` | **主轴**对齐与剩余空间分配方式 |
| `align-items` | `stretch`（默认）/ `flex-start` / `flex-end` / `center` / `baseline` | **交叉轴**对齐（每一行内） |
| `align-content` | `flex-start` / `flex-end` / `center` / `stretch` / `space-between` / `space-around` / `space-evenly` | **多行之间**的分配；**仅当产生多行（wrap 生效）时才有意义**，单行时"看起来没效果" |
| `gap` / `row-gap` / `column-gap` | `<length-percentage>` | 项目间距，替代"末项去 margin"的老技巧；`gap: 12px 8px` = 行距 列距 |

`justify-content` 三种 space 的差别（常被混淆）：

- `space-between`：两端贴边，**间隙只在项目之间**；
- `space-around`：每个项目两侧有等宽间隙，因此**两端间隙 = 中间间隙的一半**；
- `space-evenly`：**所有间隙（含两端）完全相等**。

### 2.2 项目属性（作用于 flex item）

| 属性 | 可选值 | 说明 |
| --- | --- | --- |
| `order` | `<integer>`（默认 0） | 改变视觉顺序，值小的在前；仅改视觉不影响 DOM 顺序与 Tab 焦点次序（可访问性需自行权衡） |
| `flex-grow` | `<number>`（默认 0） | 剩余空间分配权重；0 表示不参与增长 |
| `flex-shrink` | `<number>`（默认 1） | 溢出时的收缩权重；0 表示禁止收缩（会溢出） |
| `flex-basis` | `auto`（默认）/ `<length>` / `<percentage>` / `content` | 分配前的基准主尺寸；`auto` 回落到 width/height，`content` 强制按内容测量 |
| `flex` | 见 2.3 | 三属性简写 |
| `align-self` | `auto`（默认，继承容器的 align-items）/ `stretch` / `flex-start` / `flex-end` / `center` / `baseline` | 单个项目"特立独行"的交叉轴对齐 |

`align-items: baseline` 的妙用：让一组元素按**文字基线**对齐——表单行里"label 与输入框"对齐、图文中"标题与徽标"对齐，用 `stretch/center` 都会显得歪，baseline 才是排版正确的对齐方式。

### 2.3 `flex` 简写与陷阱（重点）

`flex: <grow> <shrink> <basis>`，但有四个高频简写与其展开值必须烂熟于心：

| 写法 | 展开值 | 含义 |
| --- | --- | --- |
| `flex: initial` | `0 1 auto` | 默认：不放大、可收缩、按内容定基准 |
| `flex: auto` | `1 1 auto` | 既可放大也可收缩，**基准 = 内容尺寸** |
| `flex: none` | `0 0 auto` | 完全不弹：不放大不收缩，尺寸由内容决定（适合按钮、图标等"刚性"元素） |
| `flex: 1` | `1 1 0%` | 可放大可收缩，**基准 = 0** |

**`flex: 1` 与 `flex: auto` 的区别**（高频面试题，本质是 basis 起点 different）：

- `flex: 1`（basis 0%）：三项的"初始份额"都是 0，剩余空间按 grow **完全均分** → 各列**宽度相等**，与内容多少无关。做等分栏、均分按钮用这个。
- `flex: auto`（basis auto）：初始份额 = 各自内容尺寸，剩余空间再均分 → **内容多者更宽**。做"内容驱动宽度的工具栏"用这个。

```css
/* 三列内容分别是 "1" "标题很长很长很长" "短" */
.a { flex: 1;    }  /* 三列等宽：basis 全为 0，grow 均分一切空间 */
.b { flex: auto; }  /* 内容长的列更宽：先按内容占位，再均分剩余 */
```

另一个隐蔽陷阱：**简写会重置未写的属性**。`flex: 1` 等价于 `1 1 0%`——它把 `flex-basis` 从 `auto` 改写为 `0%`；如果你之前单独声明过 `flex-basis: 200px`，再写 `flex: 1` 会悄悄覆盖它。反过来，若只想改 grow 而保留 basis，应写完整值：

```css
.item {
  flex: 0 1 240px;  /* 明确写全三值，避免简写副作用 */
  flex-grow: 2;     /* 单独微调时使用长属性 */
}
```

**`min-width: auto` 溢出坑**（详见 1.3.4）：任何期望"可以被压缩 + 省略号截断"的 flex item，都需要 `min-width: 0`。典型翻车场景：

```css
/* 翻车：长标题把右侧按钮挤出容器 */
.bar    { display: flex; }
.title  { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* 修复：min-width: 0 让 title 允许收缩到内容以下 */
.title  { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

### 2.4 gap 与老式间距方案

`gap` 在 Flex 中等价于"项目之间插入固定轨道"，不作用于首尾之外：

```css
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;      /* 行间距 8px，列间距 12px */
}
/* 不再需要：.tags > * + * { margin-left: 12px } 及其换行首列的豁免逻辑 */
```

在 `gap` 全面可用之前，社区普遍用 `.item:not(:last-child) { margin-right }` 或负 margin + padding 包裹的方案，二者在**换行**场景都会出现"行首多余间距"问题——`gap` 从语言层面解决了它，新项目一律优先 `gap`。

---

## 3. 浏览器兼容性

> ⚠️ 以下为**大致基线**（依据 caniuse 整理，供选型参考，精确版本以 caniuse.com 的 flexbox 条目为准）。

| 浏览器 | 起始版本 | 备注 |
| --- | --- | --- |
| Chrome | 29（2013-08） | 21–28 需 `-webkit-` 前缀（新版语法）；≤20 为 2009 年旧语法 `box-flex`，忽略 |
| Edge | 12 | Chromium 化（79+）后与 Chrome 行为一致 |
| Firefox | 28 | 22 起支持但含部分旧实现，28 起稳定 |
| Safari | 9 | 6.1–8 需 `-webkit-` 前缀 |
| iOS Safari | 9 | 同 Safari |
| Android Browser / WebView | 4.4+（`-webkit-`），62+ 无前缀 | 国内厂商浏览器内核普遍追随 Chromium，基线可按 Chrome 60+ 对待 |

移动端简述：Flex 是移动端兼容性最好的现代布局方案，iOS 9 / Android 4.4（均 2013–2015 年）之后全量可用，如今业务中无需任何前缀与降级。

子特性坑点备注：

| 子特性 | 大致基线 | 坑点 |
| --- | --- | --- |
| flex 容器 `gap` | Chrome 84+ / Edge 84+ / Firefox 63+ / Safari 14.1+（iOS 14.5+） | 2020 年才补齐！老项目里 `gap` 不生效多半是内核过旧，可用 margin 方案兜底 |
| `flex-basis: content` | Firefox 62+ / Chrome 84+ | Safari 早期按 `auto` 处理，两者语义接近但不同，跨端慎用 |
| `position: sticky` 与 flex | 各家 2019 年后稳定 | sticky 元素作为 flex item 时，需容器允许滚动且无 `overflow: hidden` 祖先 |

---

## 4. 使用场景示例

> 以下每个场景都对应一个可直接双击运行的示例文件，请结合交互面板观察属性变化。

### 4.1 场景一：响应式导航栏（logo + 菜单 + 操作按钮）

**场景描述**：logo 靠左、主菜单居中、登录按钮靠右；窄屏时菜单换行到第二行。对应示例 [index-04-nav-cards-form.html](../../examples/css/03-flexbox/index-04-nav-cards-form.html)。

```html
<nav class="nav">
  <a class="logo" href="#">LOGO</a>
  <ul class="menu">          <!-- 主菜单：占据中间剩余空间 -->
    <li><a href="#">首页</a></li>
    <li><a href="#">商品</a></li>
    <li><a href="#">关于</a></li>
  </ul>
  <div class="actions"><button>登录</button></div>
</nav>
```

```css
.nav {
  display: flex;
  align-items: center;     /* 交叉轴居中：三块内容高度不一时垂直居中对齐 */
  gap: 16px;               /* 块与块之间的统一间距，替代零散 margin */
  flex-wrap: wrap;         /* 窄屏放不下时允许换行，避免溢出 */
  padding: 12px 20px;
}
.logo { flex: none; }             /* 刚性元素：不放大不收缩 */
.menu {
  flex: 1;                        /* 占据中间所有剩余空间（basis 0 均分思想） */
  display: flex;                  /* 菜单本身也是 flex 容器：嵌套是常规操作 */
  justify-content: center;        /* 菜单项在自身空间内居中 */
  gap: 4px;
  list-style: none;
  margin: 0; padding: 0;
}
.actions { flex: none; }
```

**预期效果**：宽屏时菜单严格居中（左右被 logo 与按钮夹持的剩余空间均分）；拖窄窗口，菜单项换行而不是把按钮挤出去。原理：`.menu` 的 `flex: 1` 基准为 0，容器剩余空间全部给它，再由它内部的 `justify-content: center` 居中。

### 4.2 场景二：圣杯布局（Holy Grail：头 + 两侧栏 + 主体 + 尾）

**场景描述**：经典三栏页面骨架——顶栏、底栏全宽；中间三列，主列在 HTML 源码中**写在最前**（利于 SEO/读屏），但视觉上位于中间；两侧栏固定宽度，主列自适应。对应示例 [index-03-holy-grail-sticky-footer.html](../../examples/css/03-flexbox/index-03-holy-grail-sticky-footer.html)。

```html
<div class="page">
  <header>顶栏</header>
  <main>
    <article class="main">主内容（源码第一）</article>
    <aside class="left">左栏 180px</aside>
    <aside class="right">右栏 240px</aside>
  </main>
  <footer>底栏</footer>
</div>
```

```css
.page  { display: flex; flex-direction: column; min-height: 100vh; }
main   { display: flex; flex: 1; }        /* flex:1 让中段吃掉视口剩余高度 → 页脚贴底 */
.main  { flex: 1;  min-width: 0; order: 2; }  /* 主列自适应；min-width:0 允许被两侧栏压缩 */
.left  { flex: 0 0 180px; order: 1; }     /* basis 180px 且不弹：定宽左栏 */
.right { flex: 0 0 240px; order: 3; }     /* order 控制视觉次序，与源码解耦 */
```

**预期效果**：无论内容多短，页脚都钉在视口底部；主列宽度 = 容器 − 两侧栏，源码里它却排在第一个。移动端只需 `flex-direction: column` + 重设 `order` 即可单列堆叠。

### 4.3 场景三：粘性页脚（Sticky Footer）

**场景描述**：内容不足一屏时页脚贴底，超过一屏时页脚正常跟在内容后。对应示例 [index-03-holy-grail-sticky-footer.html](../../examples/css/03-flexbox/index-03-holy-grail-sticky-footer.html)。

```css
body {
  display: flex;
  flex-direction: column;  /* 主轴垂直：子项纵向排列 */
  min-height: 100vh;       /* 至少一屏高——注意不是 height，超长内容要能撑开 */
}
.content { flex: 1; }      /* 中段吃掉全部剩余高度，页脚被推到底部 */
```

```html
<!-- 关键 HTML：只有三个直接子元素，content 之外的都自然贴底 -->
<body>
  <header>…</header>
  <main class="content">内容不足一屏时，页脚仍然贴底</main>
  <footer>© 页脚</footer>
</body>
```

**预期效果**：切换示例页中的"短内容 / 长内容"，观察页脚两种状态下的表现。老方案（绝对定位 + calc 补 padding）已被这三行彻底取代。

### 4.4 场景四：等高分栏卡片（按钮永远贴底）

**场景描述**：一排卡片内容长短不一，但要求卡片等高、且"详情"按钮统一贴在卡片底部。对应示例 [index-04-nav-cards-form.html](../../examples/css/03-flexbox/index-04-nav-cards-form.html)。

```css
.cards { display: flex; gap: 16px; }
.card  {
  flex: 1;                    /* 每张卡等分宽度 */
  display: flex;              /* 卡片自身也是 flex 容器 */
  flex-direction: column;     /* 内部纵向排：标题/描述/按钮 */
}
.card p { flex: 1; }          /* 描述段吃掉剩余高度 → 把按钮压到底部 */
```

**预期效果**：三张卡片高度一致（外层 `align-items` 默认 `stretch`），描述文字多少只影响中段留白，按钮底线对齐。这是"margin-top: auto 推底法"的替代写法，两者效果相同——`margin-top: auto` 的好处是无需指定哪个元素吃高度。

### 4.5 场景五：表单行（label 基线对齐 + 自适应输入框）

**场景描述**：一行内放 label、输入框与提示文字，label 与输入框**文字基线**对齐，输入框占满剩余宽度。对应示例 [index-04-nav-cards-form.html](../../examples/css/03-flexbox/index-04-nav-cards-form.html)。

```css
.row {
  display: flex;
  align-items: baseline;     /* 基线对齐：label 字号与 input 不同也不歪 */
  gap: 8px;
}
.row label  { flex: none; }  /* label 刚性 */
.row input  { flex: 1; min-width: 0; }  /* 占满剩余；min-width:0 防内容撑破 */
```

**预期效果**：把 label 字号改大/改小，两者文字仍然精确对齐在同一条基线上——这是 `align-items: center` 做不到的排版正确性。

---

## 5. 实际应用案例分析

### 5.1 案例一：中后台管理系统的应用框架（侧栏 + 顶栏 + 内容区）

**产品场景**：Admin 后台的经典框架——左侧固定导航（可折叠为 64px 图标条），右侧上方是顶栏（面包屑 + 用户菜单），下方是内容区（内部滚动），整体页面**不出现浏览器滚动条**。

**方案选型**：选择 Flex 而非 Grid 的原因——框架是"一维嵌套"结构：先纵向分（顶栏/主体），主体再横向分（侧栏/内容），每层都只有一根轴在起作用，Flex 的嵌套心智最简单；内容区还需要"内部滚动 + 长列表压缩"这类弹性行为。

```css
.app        { display: flex; flex-direction: column; height: 100vh; }
.app-body   { display: flex; flex: 1; min-height: 0; }  /* min-height:0 是 column 方向的
                                                           自动最小尺寸坑：不加则内容
                                                           撑破 100vh 出现双滚动条 */
.sidenav    { flex: 0 0 220px; transition: flex-basis .2s; }
.sidenav.mini { flex-basis: 64px; }       /* 折叠动画只动 basis，无需测宽 */
.content    { flex: 1; min-width: 0; overflow-y: auto; }
```

**踩坑分析**：

1. **双滚动条**：最初 `.app-body` 忘写 `min-height: 0`，长表格把整个 app 撑到 `100vh` 之外，页面级与内容区同时滚动。根因即 1.3.4 的 `min-height: auto`，修复后布局瞬间稳定。
2. **面包屑被压缩**：顶栏左侧长面包屑 + 右侧用户菜单，窗口缩窄时按钮被挤出。给面包屑加 `min-width: 0; overflow: hidden; text-overflow: ellipsis;` 后，右侧按钮始终可见。
3. **侧栏折叠动画**：动画 `width` 会触发整行 relayout 抖动，改为对 `flex-basis` 过渡，浏览器直接在弹性分配中重排，表现一致且代码更少。
4. **经验值**：`flex: none`（图标）、`flex: 0 0 Npx`（定宽侧栏）、`flex: 1; min-width: 0`（自适应主体）三件套覆盖了框架 90% 的需求。

### 5.2 案例二：电商商品卡片行（营销页"限时秒杀"横滑模块）

**产品场景**：首页秒杀楼层：左侧"秒杀"竖排标签块固定宽度，右侧 4~5 张商品卡片一行铺开；卡片含图、两行标题（截断）、价格与抢购按钮，要求**所有按钮底线对齐**、在低端机（旧内核 WebView）上正常。

**方案选型**：外层用 Flex（楼层是典型一维排列），卡片内部也用 Flex 纵排。没有用 Grid 的原因：本项目需要兼容某个 2019 年出厂、内核停留在 Chromium 70 的合作方 WebView——Flex 的兼容下限远低于 Grid 的部分子特性（彼时 Grid 已可用但 `gap` 尚未在 Flex 中可用，混合心智成本高，干脆统一 Flex）。

```css
.floor    { display: flex; gap: 10px; }
.seckill  { flex: none; width: 120px; }           /* 标签块刚性定宽 */
.goods    { flex: 1; min-width: 0; }              /* 商品卡均分剩余宽度 */
.goods-in { display: flex; flex-direction: column; height: 100%; }
.goods-title { min-height: 2.8em;                 /* 固定两行高度，标题不满两行
                                                      也能保证价格区起始位置一致 */
              display: -webkit-box;                /* 老内核两行截断仍是 -webkit-box 方案 */
              -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.goods-buy { margin-top: auto; }                   /* 关键：auto margin 把按钮推到底，
                                                      标题行数差异被留白吸收 */
```

**踩坑分析**：

1. **按钮不齐**：初版让描述 `flex: 1` 吃高度，但图片在不同 DPR 下渲染高度有 1~2px 差异，按钮仍有错位；改为 `margin-top: auto` + 图片固定宽高比（`aspect-ratio` 的老内核替代方案是 padding-top 占位）后彻底对齐。
2. **两行截断**：老 WebView 不支持 `-webkit-line-clamp` 的规范写法（需配合 display: -webkit-box），且不能与 flex 容器的 `min-height` 冲突——用固定 `min-height` 占位兜底。
3. **Flex `gap` 缺席**：Chromium 70 的 Flex 不支持 `gap`（84 才支持），该模块退化为 `margin-right + :last-child 去距`，并在升级内核后统一回收为 `gap`——兼容策略要按"子特性基线"而非"特性基线"制定。

---

## 6. 最佳实践与常见坑

1. **永远记住两根轴**：`justify-*` 管主轴、`align-*` 管交叉轴；`flex-direction: column` 时两者对调。写样式前先默念"主轴在哪"，能避免绝大多数"居中不生效"。
2. **`min-width: 0` / `min-height: 0` 是救命符**：flex item 默认最小尺寸是内容尺寸（automatic minimum size）。任何"要被压缩""要出省略号""要内部滚动"的子项，都要显式 `min-*: 0`（或在其上包一层 `overflow: hidden`）。
3. **分清 `flex: 1` 与 `flex: auto`**：等分用 `flex: 1`（basis 0），按内容分配用 `flex: auto`（basis auto）；不确定时写全 `flex: 1 1 0%` 或 `flex: 0 0 240px`，杜绝简写歧义。
4. **刚性元素用 `flex: none`**：按钮、图标、logo 等不应被拉伸/压缩的元素显式声明 `flex: none`，否则在极端宽度下会被压缩变形。
5. **间距一律 `gap`**（基线允许时）：不要再用 `:not(:last-child)` margin 技巧，换行场景它必然出问题；老内核需要兼容时才降级为 margin 方案，并集中封装在一个工具类里便于日后回收。
6. **`align-content` 只在多行时有意义**：单行 flex 容器设置它是无效的；看到"不生效"先确认 `flex-wrap` 是否产生了多行。
7. **`order` 改视觉不改语义**：读屏与 Tab 焦点仍按 DOM 顺序走，不要用 `order` 大幅度重排内容性元素；结构重排请改 DOM，`order` 留给"源码顺序有语义、视觉需要重排"的场景（如移动端把正文提前）。
8. **嵌套优于堆 hack**：一维问题拆成多层一维（外层纵向、内层横向）天然清晰，比在一个容器里用 `order`、负 margin 拼命腾挪更可维护。
9. **`flex-wrap: wrap` 是廉价的响应式**：标签栏、按钮组、卡片行加一行 `wrap + gap`，就能获得"放不下就换行"的保底响应式，再按需叠加媒体查询。
10. **别用 Flex 模拟二维表格布局**：行列都需要严格对齐的结构（日历、数据网格、页面骨架），交给 Grid；强行用 Flex + 固定高度做"伪网格"，维护时每一行都要改。

---

## 7. 参考资料

- MDN — Flexbox 中文教程：<https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Flexbox>
- MDN — `flex` 属性参考：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex>
- MDN — Flexbox 完整属性索引：<https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout>
- CSS 规范 — CSS Flexible Box Layout Module Level 1：<https://www.w3.org/TR/css-flexbox-1/>
- 规范草案（最新进展）：<https://drafts.csswg.org/css-flexbox-1/>
- caniuse — Flexbox 兼容性数据：<https://caniuse.com/?search=flexbox>
- caniuse — flexbox gap 兼容性数据：<https://caniuse.com/?search=flex%20gap>
- 交互式学习游戏 Flexbox Froggy（青蛙过河，24 关掌握 justify/align）：<https://flexboxfroggy.com/#zh-cn>
- Philip Walton — Flexbox 旧语法与新语法对照（排查老代码必备）：<https://philipwalton.com/articles/normalizing-cross-browser-flexbox-bugs/>
- 本文配套示例目录：[examples/css/03-flexbox/](../../examples/css/03-flexbox/index-01-axis-alignment.html)
