# 高级选择器（Advanced Selectors）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 选择器是 CSS 的"寻址系统"，写好选择器是写出可维护样式表的第一步。

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
| [index-01-attribute-structural.html](../../examples/css/01-selectors/index-01-attribute-structural.html) | 属性选择器 + 结构伪类交互速查 |
| [index-02-logical-pseudo.html](../../examples/css/01-selectors/index-02-logical-pseudo.html) | `:not` / `:is` / `:where` / `:has` 差异对比 |
| [index-03-pseudo-elements.html](../../examples/css/01-selectors/index-03-pseudo-elements.html) | `::before` / `::after` / `::marker` / `::placeholder` |
| [index-04-specificity-cascade.html](../../examples/css/01-selectors/index-04-specificity-cascade.html) | 组合器 + 优先级计算实时演算 |

---

## 1. 概念解释

### 1.1 选择器是什么

选择器（Selector）是 CSS 中用于"选中"文档树中一个或多个元素的模式（pattern）。浏览器把选择器编译成匹配引擎，遍历 DOM 树，把"命中的元素"与"规则块中的声明"关联起来。可以把它类比成数据库查询语言：HTML 是表，选择器是 `WHERE` 条件，声明块是要写入的字段值。

### 1.2 解决什么问题

- **精确定位**：不依赖额外 class 就能选中"以特定前缀开头的链接""偶数行表格""不含子元素的卡片"。
- **解耦结构与样式**：属性选择器、结构伪类让样式可以基于"语义属性"和"文档位置"生效，HTML 无需为样式添加噪音 class。
- **状态驱动 UI**：`:checked` + 兄弟组合器可以在纯 CSS 下实现开关、手风琴、Tab，减少 JS。
- **逻辑组合**：`:is()`/`:where()`/`:has()` 让"父选择器"（多年不可能）成为现实，样式表的表达能力从"树的下方向上匹配"扩展到"按内容匹配祖先"。

### 1.3 底层原理

**从右向左匹配**：浏览器解析复合选择器时，先找最右侧的"关键选择器"（key selector），再向上验证祖先/兄弟链是否满足。例如 `div .card a:hover`，浏览器先收集所有处于 hover 的 `<a>`，再逐个向上检查是否有 `.card` 祖先、`.card` 之上是否有 `div`。这也解释了为什么"关键选择器写得越宽，性能开销越大"。

**优先级（Specificity）是一个三元组** `(A, B, C)`：

- A：ID 选择器个数；
- B：类选择器、属性选择器、伪类（`:not()` 本身不计入，但**括号里最复杂的参数计入**；`:is()`/`:has()` 同理取参数中的最大值；`:where()` 一律为 0）个数；
- C：元素选择器、伪元素（`::before` 等）个数。

比较规则是逐位比较：`(1,0,0) > (0,99,99)`。内联样式相当于第四位（A 之上），`!important` 再高一级。通配符 `*`、组合器（`>`、`+`、`~`、空格）和 `:where()` 本身**不产生任何优先级**。

**层叠（Cascade）顺序**：当多条规则命中同一元素同一属性时，按以下顺序决胜——

1. 来源与重要性：用户代理样式 < 用户样式 < 作者样式（`!important` 反转：作者 `!important` > 用户 `!important`）；
2. 层（@layer，可选）；
3. 优先级三元组；
4. 出现顺序：后者覆盖前者。

**伪类与伪元素的区别**：伪类（单冒号 `:`）选中"处于某种状态的元素"，它仍然是一个真实元素；伪元素（双冒号 `::`）创建"不存在于 DOM 树中的虚拟元素"，如 `::before` 生成的内容盒子。CSS2 时代两者都写单冒号，CSS3 规范用双冒号区分，但 `:before`/`:after`/`:first-line`/`:first-letter` 为兼容保留单冒号写法。

---

## 2. 语法说明

### 2.1 属性选择器（Attribute Selectors）

语法均为 `[attr 运算符 value]`，`value` 可加引号（含空格或特殊字符时必须加）。

| 语法 | 匹配规则 | 示例命中 | 示例不命中 |
| --- | --- | --- | --- |
| `[attr]` | 存在该属性即可 | `[disabled]` → 任何带 disabled 的元素 | 无该属性 |
| `[attr="v"]` | 完全等于 v | `[type="text"]` | `type="Text"`（属性值区分大小写，属性名不区分） |
| `[attr~="v"]` | 属性值是空格分隔的单词列表，其中之一等于 v | `[class~="btn"]` 命中 `class="btn primary"` | `class="btns"` |
| `[attr^="v"]` | 以 v 开头 | `[href^="https://"]` | `href="http://"` |
| `[attr$="v"]` | 以 v 结尾 | `[href$=".pdf"]` | `href="a.PDF"`（默认区分大小写） |
| `[attr*="v"]` | 包含子串 v | `[href*="github"]` | 不含该子串 |
| `[attr|="v"]` | 等于 v，或以 `v-` 开头（语言/命名空间场景） | `[lang|="zh"]` 命中 `zh`、`zh-CN` | `zhx` |
| `[attr*="v" i]` | 追加 `i` 标志：不区分大小写 | `[href$=".pdf" i]` 命中 `.PDF` | — |
| `[attr*="v" s]` | 追加 `s` 标志：强制区分大小写 | — | — |

```css
/* 选中所有外链并加"外站"提示图标：^= 限定协议前缀 */
a[href^="http"]:not([href*="mysite.com"])::after {
  content: " ↗";
}

/* 选中下载链接：$= 匹配扩展名，i 标志忽略大小写 */
a[href$=".pdf" i] { color: #c0392b; }
```

### 2.2 结构伪类（Structural Pseudo-classes）

| 伪类 | 匹配规则 | 备注 |
| --- | --- | --- |
| `:first-child` | 是其父元素的第一个子元素 | 不关心元素类型 |
| `:last-child` | 是其父元素的最后一个子元素 | 常用于去掉列表末项分隔线 |
| `:only-child` | 是其父元素唯一子元素 | — |
| `:nth-child(an+b)` | 是第 an+b 个子元素（按所有兄弟计数） | `odd`/`even` 等价 `2n+1`/`2n` |
| `:nth-last-child(an+b)` | 从后往前数第 an+b 个子元素 | 处理"最后 N 个" |
| `:first-of-type` | 同类型兄弟中的第一个 | 按**标签名**计数，不是按所有兄弟 |
| `:last-of-type` | 同类型兄弟中的最后一个 | — |
| `:only-of-type` | 同类型兄弟中唯一的一个 | — |
| `:nth-of-type(an+b)` | 同类型兄弟中的第 an+b 个 | — |
| `:nth-last-of-type(an+b)` | 从后往前数的第 an+b 个同类型兄弟 | — |
| `:empty` | 没有任何子节点（文本节点也不行） | 空白字符会使其失效 |
| `:root` | 文档根元素（HTML 中即 `<html>`） | 优先级高于 `html` 选择器 |

`:nth-child(an+b)` 参数是线性表达式 `an+b`，`n` 从 0 开始递增，结果为正整数时命中对应位置的兄弟。常用取值：

```css
li:nth-child(2n)      /* 偶数位：2,4,6…（斑马纹） */
li:nth-child(-n+3)    /* 前 3 个：n=0→3, n=1→2, n=2→1 */
li:nth-child(n+4)     /* 第 4 个起：n=0→4, n=1→5…（隐藏"更多"后面的项） */
li:nth-last-child(-n+3) /* 最后 3 个 */
li:nth-child(3n+1)    /* 每 3 个中的第 1 个：1,4,7… */
```

**易混点**：`:nth-child` 按所有兄弟计数，`:nth-of-type` 只按同标签计数。例如 `<h2> <p> <p> <h2> <p>` 中，`p:nth-child(2)` 命中第一个 `<p>`（它是全体的第 2 个孩子），而 `p:nth-of-type(2)` 命中第二个 `<p>`。

### 2.3 逻辑伪类（Logical Pseudo-classes）

| 伪类 | 语法 | 优先级贡献 | 关键特性 |
| --- | --- | --- | --- |
| `:not(...)` | 接受选择器列表（Level 4 起支持多个参数） | 括号内**最复杂**的参数计入 B/C 位 | 否定匹配；不支持伪元素 |
| `:is(...)` | 接受"宽容选择器列表" | 括号内最复杂参数计入 | 任一参数命中即命中；列表中非法项被**宽容忽略** |
| `:where(...)` | 同 `:is` | **恒为 0** | 用于"零优先级"兜底样式，方便后续覆盖 |
| `:has(...)` | `父:has(相对选择器)` | 括号内最复杂参数计入 | "父选择器/向前看"：按后代/兄弟内容选中祖先 |

```css
/* :is 让多条前缀合并成一条；优先级取括号内最高的 section */
:is(section, article, aside) h1 { font-size: 2rem; }

/* :where 写"可被轻易覆盖"的默认值：优先级 0，一行普通类选择器即可覆盖 */
:where(img, video) { max-width: 100%; }

/* :has 实现父级响应子内容：有无效输入的表单块整体标红 */
.form-group:has(input:invalid) { border-color: #e74c3c; }

/* :has + 兄弟组合器：有标题的卡片，其后面的段落变灰 */
.card:has(h3) + p { color: #888; }
```

### 2.4 伪元素（Pseudo-elements）

| 伪元素 | 作用 | 典型用法 |
| --- | --- | --- |
| `::before` | 在元素内容前生成虚拟盒子（默认行内） | 装饰图形、图标、计数器；必须配合 `content` |
| `::after` | 在元素内容后生成虚拟盒子 | 清除浮动、角标、引号 |
| `::marker` | 列表项标记盒（圆点/序号） | 自定义 `li` 的标记颜色、字体、内容 |
| `::placeholder` | 输入框占位文本 | 改占位颜色（注意需加厂商前缀的旧浏览器） |
| `::selection` | 被用户选中的文本 | 定制高亮背景与文字色 |
| `::first-line` / `::first-letter` | 首行 / 首字 | 杂志排版的首字下沉 |

```css
/* ::before/::after 的 content 是必填项，为空字符串也会创建盒子 */
.badge::after {
  content: attr(data-count);        /* attr() 可以读取元素自身属性作为内容 */
  display: inline-block;
  min-width: 1.2em;
  border-radius: 999px;
  background: #e74c3c;
}

/* ::marker 只支持部分属性：color、font、content、white-space 等 */
li::marker { color: #6c5ce7; content: "▸ "; }
```

### 2.5 组合器（Combinators）

| 组合器 | 语法 | 含义 |
| --- | --- | --- |
| 后代组合器 | `A B`（空格） | B 是 A 的任意层级后代 |
| 子组合器 | `A > B` | B 是 A 的**直接**子元素 |
| 相邻兄弟组合器 | `A + B` | B 紧跟在 A 后面的**同层**元素 |
| 通用兄弟组合器 | `A ~ B` | B 是 A 之后**同层**的所有兄弟（不必相邻） |
| 列组合器（实验） | `A || B` | 表格等内部按"列"匹配，兼容性差，暂不推荐 |

```css
/* :checked 状态驱动兄弟元素 —— 纯 CSS 开关的核心套路 */
.switch input:checked + .slider { background: #2ecc71; }
/* ~ 联动更远的手风琴面板 */
.faq input:checked ~ .panel { max-height: 200px; }
```

### 2.6 优先级计算速查

| 选择器 | (A, B, C) |
| --- | --- |
| `*`、组合器 | (0, 0, 0) |
| `li`、`::after` | (0, 0, 1) |
| `.card`、`[type="text"]`、`:hover` | (0, 1, 0) |
| `#nav` | (1, 0, 0) |
| `:is(.a, #b)` | (1, 0, 0)（取参数最大） |
| `:where(.a, #b)` | (0, 0, 0) |
| `:not(#b)` | (1, 0, 0) |
| `:has(> .x.y)` | (0, 2, 0) |

---

## 3. 浏览器兼容性

**以下为大致基线**（依据 caniuse 数据整理，实际支持请以最新 caniuse 为准）：

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| 属性选择器 `^=` `$=` `*=` | 10 | 12 | 3.5 | 3.2 | iOS/Android 全线支持 | 属性值默认区分大小写；`i`/`s` 标志见下行 |
| 属性选择器大小写标志 `i`/`s` | 49 / 65 | 79 / 79 | 47 / 71 | 9 / 9 | 移动端随内核跟进 | 老旧 WebView 需降级为统一大小写后匹配 |
| `:nth-child` / `:nth-of-type` 系列 | 4 | 12 | 3.5 | 3.2 | 全线支持 | `nth-child(an+b)` 中 `of S` 语法支持较晚（见下） |
| `:not()` 多参数/复杂参数 | 88 | 88 | 84 | 9（仅简单）/ 88（复杂） | 移动端随内核 | 老版本只接受单一简单选择器，写 `:not(a):not(b)` 降级 |
| `:is()`（含 `:matches` 旧名） | 88 | 88 | 78 | 14 | iOS 14+ | `:where` 同步；`:is` 内参数取"最复杂"优先级易被忽略 |
| `:where()` | 88 | 88 | 78 | 14 | iOS 14+ | 优先级为 0，被"任何"普通选择器覆盖，重置样式利器 |
| `:has()` | 105 | 105 | 121 | 15.4 | Android WebView 105+ / iOS 15.4+ | 曾多年未实现；Safari 最早落地。不可在 `:has` 内再嵌 `:has`（规范禁止，部分实现放宽） |
| `::before` / `::after` | 4（旧 -webkit-） | 12 | 3.5 | 3.2 | 全线支持 | `content` 为必填；替换元素（img/input 空框）不生效 |
| `::marker` | 86 | 86 | 68 | 12.1 | 移动端随内核 | 仅支持 color/font/content 等少数属性；`display:none` 的 li 无标记 |
| `::placeholder` | 57（旧 `-webkit-input-placeholder`） | 79 | 51 | 10.1 | iOS/Android 现代内核 OK | 需同时写 `-webkit-input-placeholder` 兼容老内核；占位符颜色对比度勿过低（无障碍） |
| `::selection` | 62（旧带前缀更早） | 79 | 62 | 16.4 | iOS 16.4+ | 长期 Safari 不支持，2023 起补齐；仅允许颜色类属性 |
| 通用兄弟组合器 `~` | 4 | 12 | 3.5 | 3.2 | 全线支持 | 只能向后匹配，无"前兄弟"选择器（`:has` 可曲线实现） |

> 坑点小结：`:has` 是本篇唯一需要考虑"可用性检测"的粗粒度特性，可用 `@supports selector(:has(a))` 包裹渐进增强。

---

## 4. 使用场景示例

> 每个场景在示例目录中都有对应的可交互页面，此处给出核心代码与逐段注释。

### 场景 1：用属性选择器区分外链与文件下载（营销页/内容站）

```html
<a href="https://example.com/page">站外链接</a>
<a href="/files/report.pdf">下载报表</a>
```

```css
/* 场景 1：外链自动加角标 —— href 以 http 开头且不含本站域名 */
a[href^="http"]:not([href*="mysite.com"])::after {
  content: " ↗";                     /* 用 content 输出视觉提示，不污染 HTML */
  font-size: 0.8em;
  color: #7f8c8d;                    /* 弱化处理，避免喧宾夺主 */
}

/* 下载链接按扩展名上色：i 标志兜住 ".PDF"/".Pdf" 等写法 */
a[href$=".pdf" i] { color: #c0392b; }
a[href$=".zip" i] { color: #8e44ad; }
```

**预期效果**：站外链接自动带 `↗`，PDF 链接红色、ZIP 链接紫色，HTML 无需任何额外 class。完整演示见 [index-01-attribute-structural.html](../../examples/css/01-selectors/index-01-attribute-structural.html)。

### 场景 2：表格斑马纹 + 悬停高亮 + 末行修正（中后台数据表）

```css
/* 偶数行淡灰底：2n 等价 even，避免逐行手写 class */
tbody tr:nth-child(2n) { background: #f7f9fb; }

/* 悬停行高亮：只作用于 tbody，不干扰表头 */
tbody tr:hover { background: #eef4ff; }

/* 最后一行不显示底部分隔线：last-child 精确命中 */
tbody tr:last-child td { border-bottom: none; }
```

**预期效果**：行间距清晰、悬停反馈即时、边线收口干净，全部由结构伪类驱动，新增/删除行无需改样式。完整演示见 [index-01-attribute-structural.html](../../examples/css/01-selectors/index-01-attribute-structural.html)。

### 场景 3：`:has` 实现表单校验的整体反馈（注册页）

```css
/* 每个表单组：默认灰边 */
.form-group { border: 2px solid #dfe6e9; border-radius: 8px; }

/* 组内一旦出现非法输入，整组红框 + 提示显现。
   :has 让"父级感知子级状态"成为可能，此前必须 JS 添加 class */
.form-group:has(input:invalid) {
  border-color: #e74c3c;
}
.form-group .hint { display: none; color: #e74c3c; }
.form-group:has(input:invalid) .hint { display: block; }

/* :focus-within 联动：聚焦时无论合法与否给蓝色描边 */
.form-group:focus-within { box-shadow: 0 0 0 3px rgba(52,152,219,.25); }
```

**预期效果**：输入非法邮箱时整组立刻变红并显示提示文字，修正后恢复，零 JS。完整演示见 [index-02-logical-pseudo.html](../../examples/css/01-selectors/index-02-logical-pseudo.html)。

### 场景 4：`::marker` + `::before` 计数器实现任务清单（待办/文档目录）

```css
/* 自定义有序列表标记的颜色与内容 */
ol.steps li::marker { color: #0984e3; font-weight: 700; }

/* ::before 计数器：不改动 HTML 结构即可生成"第 X 步" */
ol.steps { counter-reset: step; }          /* 在父级初始化计数器 */
ol.steps li { counter-increment: step; }   /* 每个列表项 +1 */
ol.steps li::before {
  content: "第 " counter(step) " 步";      /* counter() 读取当前值 */
  display: inline-block;
  margin-right: 8px;
  padding: 2px 10px;
  background: #0984e3;
  color: #fff;
  border-radius: 999px;
  font-size: 0.75rem;
}
```

**预期效果**：列表自动编号，标记圆点换成品牌色胶囊徽章，中间插入新条目时编号自动重排。完整演示见 [index-03-pseudo-elements.html](../../examples/css/01-selectors/index-03-pseudo-elements.html)。

### 场景 5：优先级可视化演算（教学/排查工具）

```html
<!-- data-attrs 记录选择器片段，JS 拆分后计算 (A,B,C) 并实时渲染 -->
<div class="demo-rule" data-selector="#nav .item:hover">…</div>
```

```css
/* 演算页把每条规则的优先级画成三段柱：A/B/C 各一格 */
.spec-bar { display: flex; gap: 4px; }
.spec-bar span[data-tier="a"] { background: #e17055; }
.spec-bar span[data-tier="b"] { background: #0984e3; }
.spec-bar span[data-tier="c"] { background: #00b894; }
```

**预期效果**：在页面中切换不同选择器，柱状条实时显示 `(A,B,C)` 高度对比，直观理解"为什么 ID 永远压过类"。完整演示见 [index-04-specificity-cascade.html](../../examples/css/01-selectors/index-04-specificity-cascade.html)。

---

## 5. 实际应用案例分析

### 案例 1：电商列表页 —— 用结构伪类替代“写死的角标 class”（促销页）

**背景**：某电商首页促销区块，设计稿要求"商品卡网格中，第 1 张大图 + 第 7、8、9 张打'爆款'角标 + 所有卡片 hover 抬升"。早期实现由后端模板给第 N 张卡输出 `<i class="hot">` 标签，运营调整商品顺序后角标错位。

**方案选型**：

- 角标位置属于"布局语义"而非"数据语义"，改用 `:nth-child` 表达：`.grid .card:nth-child(3n) .price::after`；
- 大图卡用 `:first-child` 固定，与数据顺序解耦；
- hover 抬升用 `.card:hover` 统一处理，减少 30+ 行内联 style。

**踩坑与分析**：

1. **运营插入一张"广告卡"后角标全体偏移**：`:nth-child` 按所有兄弟计数，插卡后 3n 序列错位。解法是把广告卡移出该网格（独立广告位），或改用 `:nth-of-type` + 给广告卡换标签，让计数基准稳定。
2. **空数据行渲染了空 `li`，`:empty` 清理残留边框**：后端偶发输出空白节点，`li:empty { display:none }` 兜底。注意模板若输出换行/空格文本节点，`:empty` 会失效——需要模板保证零空白输出。
3. **`::after` 角标遮挡点击**：给伪元素 `pointer-events: none`，避免装饰层拦截点击。

**结论**：结构性装饰交给伪类/伪元素，业务性标签（如"秒杀""满减"）仍由数据驱动，两者边界要分清。

### 案例 2：中后台设计系统 —— `:where` 与 `:is` 构建低侵入重置样式（B 端表单）

**背景**：某中后台组件库的全局样式长期被业务侧抱怨"压不住"：库内用 `.my-input` 设置默认边框，业务用 `input` 一行选择器想改，优先级反而不够。

**方案选型**：组件库重置层统一用 `:where()` 包裹，把"默认值"的优先级降到 0：

```css
/* 组件库重置：任何业务样式都能覆盖，不再需要 !important */
:where(.my-input, input[type="text"]) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 6px 10px;
}
```

对多级容器内的一致性样式（标题字号等），用 `:is()` 合并选择器减少体积，但**要意识到它取最大优先级**：

```css
/* 明确知道要"压住"普通类选择器时才用 :is */
:is(.panel, .drawer, .modal) :is(h2, h3) { margin: 0 0 12px; }
```

**踩坑与分析**：

1. **团队误把 `:is` 当 `:where` 用**，默认样式又"变强"了。规范上给出口诀：**要覆盖用 `:where`，要合并用 `:is`**。
2. **`:has` 用于"字段联动显隐"**：`.form-row:has(#channel:checked[value=wx]) .wx-field { display:flex }`，替代了一批简单联动 JS；但复杂联动（异步校验、跨表单）仍留给 JS，避免 CSS 承担状态机。
3. **兼容性兜底**：目标包含旧版 Safari 时，用 `@supports selector(:where(a))` 检测，不支持则输出一份普通 class 版本的重置，构建脚本统一注入。

**结论**：设计系统的"默认层"必须零优先级，把优先级弹药留给业务覆盖层，是长周期可维护性的关键。

---

## 6. 最佳实践与常见坑

1. **关键选择器从右往左想性能**：`ul li a span` 这类长链要避免，越靠右越具体、链条越短越好；能加一个 class 就别写四层后代。
2. **`:nth-child` 与 `:nth-of-type` 别混用**：前者按"所有兄弟"计数，后者按"同标签"计数。混合标签容器（如 `h2+p+h2+p`）里结果完全不同。
3. **`:empty` 极度严格**：一个空格、一个换行文本节点都会使其失效，配合服务端模板输出时确保零空白。
4. **`:not()` 的优先级坑**：`:not(#foo)` 的优先级是 (1,0,0)，比 `:not(.foo)` 高得多；写否定条件时尽量用低优先级参数。
5. **`:is()`/`:has()` 取"最复杂参数"的优先级**：`:is(#a, .b)` 整条规则按 ID 级计算，想让默认样式低优先级时改用 `:where`。
6. **伪元素必须写 `content`**：`::before`/`::after` 没有 `content`（哪怕是空字符串）就不会生成盒子；替换元素（`img`、`input`）上不生效。
7. **`::marker` 属性支持有限**：只能改 color、font、content 等；想要复杂标记请回到 `::before` + `list-style:none` 自绘。
8. **组合器只能"向后看"**：`+` 与 `~` 都选不到"前面的兄弟"；需要前向感知时用 `:has()`（如 `li:has(+ .active)`）或调整 DOM 顺序。
9. **`!important` 是逃生舱不是常规武器**：优先级失控时优先考虑重构选择器（降 ID、用 `:where` 重置层），全局搜索确认 `!important` 数量不增长。
10. **`@supports selector(...)` 做能力检测**：对 `:has` 这类新特性，用 `@supports selector(:has(*))` 包裹增强样式，保证老浏览器优雅降级。
11. **避免用选择器承载"数据状态"**：业务状态（如 `data-status="paid"`）用属性选择器可以，但高频联动状态建议 JS 写到 `class`/`data-*` 上、CSS 只读，避免选择器过深难以追踪。
12. **无障碍注意**：`::placeholder` 颜色对比度别低于 4.5:1；纯 CSS 隐藏内容用 `display:none` 会移出可访问树，视觉隐藏请用 `clip` 方案。

---

## 7. 参考资料

- MDN — 选择器总览：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_selectors>
- MDN — Specificity（优先级）：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity>
- MDN — 伪类参考：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-classes>
- MDN — 伪元素参考：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-elements>
- MDN — `:has()` 详解：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/:has>
- CSS Selectors Level 4 规范（W3C）：<https://www.w3.org/TR/selectors-4/>
- CSS Selectors Level 4 规范（CSSWG Draft，更新更快）：<https://drafts.csswg.org/selectors-4/>
- CSS Cascade Level 5 规范（层叠与 `:has` 交互）：<https://drafts.csswg.org/css-cascade-5/>
- caniuse — CSS `:has()`：<https://caniuse.com/css-has>
- caniuse — CSS `:is()` and `:where()`：<https://caniuse.com/css-matches-pseudo>
- caniuse — `::marker`：<https://caniuse.com/mdn-css_selectors_marker>
