# 文本溢出与换行处理（text-overflow / line-clamp / overflow-wrap / word-break）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 文本是界面里最"不守规矩"的内容：后端返回 200 字的标题、用户粘贴一条 300 字符的 URL、英文长单词在窄卡片里撑爆布局。本章系统讲解单行省略、多行省略、长词断行、CJK 混排与 JS 辅助截断，以及 2024 年进入基线的 `text-wrap` 新特性。

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
| [index-01-single-line.html](../../examples/css/10-text-truncation/index-01-single-line.html) | 单行省略多场景实验台：普通块/flex 子项/grid/table/button，`min-width:0` 修复开关 + `scrollWidth` 截断徽标 |
| [index-02-multi-line.html](../../examples/css/10-text-truncation/index-02-multi-line.html) | 1~5 行 line-clamp 滑块实验台：确定性四件套与缺属性对照 |
| [index-03-word-breaking.html](../../examples/css/10-text-truncation/index-03-word-breaking.html) | 长 URL/长英文/中英混排在 overflow-wrap/word-break/hyphens/pre-wrap 各取值下的对照墙 |
| [index-04-real-layout.html](../../examples/css/10-text-truncation/index-04-real-layout.html) | 综合实战：电商卡片 + 多列省略表格 + 文件名中段截断 + 悬浮 tooltip + balance 标题 |

---

## 1. 概念解释

### 1.1 是什么

文本溢出处理由两组能力组成：

- **截断（truncation）**：文本超出盒子时怎么"收口"——`text-overflow: ellipsis` 单行省略号、`-webkit-line-clamp` 多行省略号、以及渐变遮罩（fade）等视觉替代方案。
- **断行（line breaking）**：文本在一行放不下时在哪里换行——`white-space`、`overflow-wrap`、`word-break`、`hyphens` 四个属性共同决定"换行机会（soft wrap opportunity）"出现的位置。

这两组能力解决的是同一个矛盾的两面：**要么让文本换行，要么让文本被裁掉**。理解这一点，就不会在"为什么省略号不出现"的问题上乱试属性。

### 1.2 解决什么问题

- **定宽容器里的不定长内容**：列表标题、表格单元格、面包屑，UI 设计稿永远给的是短文案，真实数据永远超长。
- **flex/grid 布局被长文本撑破**：flex 子项默认 `min-width: auto`，一个长 URL 就能把右侧按钮挤出屏幕——这是本章最高频的线上事故。
- **卡片高度对齐**：商品流里标题 1 行和 3 行的卡片混排导致图片错位，多行省略 + 固定行数让卡片"齐步走"。
- **长 URL / 长英文单词溢出**：西文单词之间只有空格可断，一个 `https://a.b/c/d/e?x=...` 在中文段落里完全没有换行机会，直接溢出容器。
- **可读性与排版质量**：标题折行后只剩一个字挂在第二行（孤字/orphan）、多行标题两侧长短悬殊，`text-wrap: balance/pretty` 专门解决这类"最后一公里"排版问题。

### 1.3 底层原理

#### 1.3.1 省略号出现的三个必要条件

浏览器不会"主动"给你省略号。单行省略必须同时满足三件事，缺一不可，这就是俗称的**省略三件套**：

1. `white-space: nowrap`——禁止换行，文本才有机会"超出"而不是折到下一行；
2. `overflow: hidden`——超出的部分必须被裁掉，`text-overflow` 才能在裁剪边界上做标记；
3. `text-overflow: ellipsis`——在被裁的位置渲染省略号（默认值 `clip` 只是硬切，没有任何提示）。

三者是串联关系：没有 `nowrap`，文本换行，永远不超出；没有 `hidden`，文本直接溢出来把布局冲烂；没有 `ellipsis`，被切的地方像腰斩，用户不知道后面还有内容。

#### 1.3.2 最小内容尺寸（min-content）—— flex/grid 坑的根源

每个文本元素都有一个内在尺寸：

- **max-content**：文本全部排在一行所需的宽度（理想宽度）；
- **min-content**：把所有能断的地方都断开后，元素能缩到的最小宽度。

中文的 min-content 约等于一个汉字宽（任意两字之间都可断）；英文的 min-content 约等于**最长单词**的宽度（单词内部默认不可断）；一条长 URL 的 min-content 可能是几百像素——它由最长的那段无标点字符串决定。

关键推论：**flex/grid 子项的 `min-width` 默认是 `auto`，计算为 min-content**。也就是说 flex 子项"拒绝缩到比最长单词更窄"，哪怕父容器已经放不下。这就是为什么 `flex: 1` + 长 URL 会溢出——必须显式 `min-width: 0`（或 `overflow: hidden` 等非 visible 值，规范上它们同样能解除 auto 下限）才能允许收缩。列方向同理，对应的是 `min-height: 0`。

#### 1.3.3 断行属性的分工

四个属性各管一段，不要混用：

- `white-space`：管**空白符与换行符怎么处理**（合并还是保留）、以及**整体允不允许自动换行**（nowrap/pre）；
- `overflow-wrap`（旧名 `word-wrap`）：单词**整体放不下行尾**时，要不要"破例"在单词内部断；
- `word-break`：要不要在**任意字符之间**都允许断行（更激进，不管单词是否放得下）；
- `hyphens`：断词时是否插入连字符 `-`，依赖浏览器词典与 `lang` 属性。

一句话记忆：**`overflow-wrap` 是"迫不得已才断词"，`word-break: break-all` 是"随时可以断词"**。

#### 1.3.4 多行省略的实现原理

`display: -webkit-box` + `-webkit-box-orient: vertical` + `-webkit-line-clamp: N` 的组合，本质是把元素变成一个**老式 WebKit 弹性盒子（旧 flex 草案的 box）**，按纵向排布文本片段（line box），超出第 N 行的片段被 `overflow: hidden` 裁掉，并在第 N 行末尾绘制省略号。它与现代 flex 不是同一套模型，但属性可以叠加在普通块元素上（元素同时承担 block 布局，文本仍正常排列）。

---

## 2. 语法说明

### 2.1 单行省略三件套与 fade 替代

```css
/* 标准三件套 */
.title {
  white-space: nowrap;      /* ① 不换行 */
  overflow: hidden;         /* ② 裁剪溢出 */
  text-overflow: ellipsis;  /* ③ 裁剪处显示 … */
}

/* 容器还必须有"确定的宽度"：块级默认撑满，flex 子项则要 min-width:0 */
```

`text-overflow` 可取值：

| 取值 | 行为 |
| --- | --- |
| `clip`（默认） | 直接硬切，无任何标记 |
| `ellipsis` | 显示省略号 `…`（U+2026，随文字方向） |
| `<string>` | 用自定义字符串代替省略号（仅 Firefox 支持，不推荐） |
| 双值 `ellipsis ellipsis` | 行首/行尾分别控制（溢出发生在两侧时，如居中内容） |

**fade 渐变遮罩**：省略号在某些设计语言里显得"重"，可用横向渐变让文字"淡出"。它不需要 `nowrap` 之外的特殊属性，但纯 CSS 方案在文本刚好填满时也会显示渐变（可用 JS 检测后再加 class 规避）：

```css
.fade {
  white-space: nowrap;
  overflow: hidden;
  /* 右侧 24px 从透明到背景色的渐变；颜色必须与容器底色一致 */
  -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 24px), transparent);
          mask-image: linear-gradient(90deg, #000 calc(100% - 24px), transparent);
}
```

### 2.2 多行省略：确定性四件套

```css
.clamp-2 {
  display: -webkit-box;              /* ① 旧 webkit box 模型 */
  -webkit-box-orient: vertical;      /* ② 纵向排列行 */
  -webkit-line-clamp: 2;             /* ③ 最多 2 行，超出显示 … */
  overflow: hidden;                  /* ④ 裁掉超出部分（标准 line-clamp 也要求） */
  /* line-clamp: 2; */               /* 标准属性，见 2.3，建议与前缀版同时写 */
}
```

**四个属性缺一会怎样**（示例 02 有对照开关）：

| 缺失属性 | 后果 |
| --- | --- |
| 缺 `display:-webkit-box` | 旧内核完全不截断；标准 `line-clamp` 新内核下仍可工作 |
| 缺 `-webkit-box-orient:vertical` | 默认 horizontal，行被横向排列，效果全乱 |
| 缺 `-webkit-line-clamp` | 不限制行数，普通盒子，无省略号 |
| 缺 `overflow:hidden` | 文本完整显示，省略号可能闪现但内容不裁 |

**与固定行高的关系**：`line-clamp` 限制的是**行盒数量**。若同时写 `max-height`，两者必须协调：`max-height` 应等于 `line-height × 行数`（再检查 padding/border）。`max-height` 给小了，省略号会被裁掉半个；给大了，第 3 行会露出一截空白。稳妥写法是只信赖 line-clamp，把高度交给行高自然撑开；必须锁卡片高度时，用 `line-height * N` 精确计算并加注释。

### 2.3 标准 line-clamp 与 -webkit- 前缀现状

CSS Overflow Module Level 4 把 line-clamp 标准化为独立属性 `line-clamp: <number> | none`，**不再要求** `-webkit-box` 三件套配合：

```css
/* 推荐的现代写法：两套并存，前缀版兜底，标准版覆盖 */
.clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;          /* 标准属性，支持的浏览器以后写的为准 */
  overflow: hidden;
}
```

现状：Chromium 103+、Safari 16+、Firefox 68+ 支持标准 `line-clamp`；但 `-webkit-line-clamp` 自 2010 年起被所有移动内核实现，覆盖率近乎 100%，是事实上的基线。两套同写、前缀在前，是当前最安全的工程实践。

### 2.4 各类容器生效坑速查（错误写法 vs 修复写法）

| 容器 | 错误写法 | 为什么失效 | 修复写法 |
| --- | --- | --- | --- |
| flex 行方向子项 | `.t{flex:1; text-overflow:ellipsis; overflow:hidden; white-space:nowrap}` | 子项 `min-width:auto`=min-content，拒绝收缩，盒子永远比内容宽 | 加 `min-width: 0`（或给子项套一层内层做省略） |
| flex 列方向（多行省略） | 父级固定高，子项 `line-clamp` | 交叉轴/主轴上 `min-height:auto`，内容把容器撑高，没有溢出可裁 | 子项加 `min-height: 0`，必要时父级 `overflow:hidden` |
| grid 子项 | `grid-template-columns: 1fr 1fr` + 长内容 | `1fr` 实际是 `minmax(auto,1fr)`，下限是 min-content，轨道被撑大 | 子项 `min-width:0`；或轨道定义改 `minmax(0,1fr)` |
| table 单元格 | 普通 `table` + td 省略 | 自动表格布局按内容分配列宽，nowrap 内容直接把列撑开 | `table-layout: fixed` + 首行/`col` 定宽 + td 三件套 |
| 绝对定位 | `position:absolute` 只给 right 或什么都不给 | 绝对定位 shrink-to-fit 宽度由内容决定，永不溢出 | 同时给 `left:0;right:0` 或显式 `width` |
| 浮动元素 | `float:left` + 三件套 | 浮动 shrink-to-fit，宽度同样由内容撑开 | 显式 `width`/max-width，或放进定宽父级 |
| `<button>` | 直接给 button 加 nowrap | 多数浏览器 button 默认 `white-space: nowrap`（且内部是匿名 flex 结构） | 显式写三件套；多行省略建议内层包 `<span>` 再 clamp |

### 2.5 长词与换行属性族

```css
/* white-space：空白符策略 */
white-space: normal;    /* 默认：合并连续空白，必要时换行 */
white-space: nowrap;    /* 合并空白，永不换行（省略三件套用） */
white-space: pre;       /* 保留所有空白与换行，不自动折行 */
white-space: pre-wrap;  /* 保留空白与手动换行，同时允许自动折行 */
white-space: pre-line;  /* 合并空白，但保留换行符 */
white-space: break-spaces; /* 同 pre-wrap，且行尾保留的空格也可作为断行点 */

/* overflow-wrap：整词放不下时是否破例断词 */
overflow-wrap: normal;      /* 默认：不在单词内部断 */
overflow-wrap: break-word;  /* 迫不得已时可在任意点断；不影响 min-content 尺寸计算 */
overflow-wrap: anywhere;    /* 同样可任意断；且这些断行点计入 min-content，布局会真的缩窄 */

/* word-break：是否允许在任意字符间断行 */
word-break: normal;     /* 默认：按各语言规则断 */
word-break: break-all;  /* 任意字符间可断——英文阅读体验差，行尾碎词多 */
word-break: keep-all;   /* CJK 字词之间也不断（中文变成"一个词一行"的效果） */
word-break: break-word; /* 非标准历史值，效果约等于 overflow-wrap:anywhere，已废弃 */

/* hyphens：断词连字符 */
hyphens: none;          /* 不连字符 */
hyphens: manual;        /* 仅 &hyphen; / &shy; 提示处断（默认） */
hyphens: auto;          /* 浏览器结合词典自动断；元素必须有正确 lang 属性 */
```

**`break-word` vs `anywhere` 的关键区别**（最容易考、最容易踩）：两者视觉断行行为几乎一样，差别在**布局计算**——`anywhere` 的断行机会参与 min-content 计算，元素可以缩到比最长单词更窄；`break-word` 不参与，min-content 仍是最长单词宽度。后果：在 flex 子项里，`overflow-wrap: break-word` **不能**替代 `min-width: 0` 修复溢出，而 `anywhere` 可以（但代价是布局可能比预期更窄）。

**break-all vs break-word 取舍**：`break-all` 行尾只要放不下就切，段落右边缘整齐但英文被切得支离破碎，阅读性差，适合 URL/代码等"不可读字符串"；中文段落里夹英文单词用 `break-word`（或 `overflow-wrap:anywhere`）更自然——先尝试整词换行，真放不下才断。

**CJK 与西文混排**：中文（CJK）默认任意两字之间都可断；英文按词断。混排时浏览器自动处理，通常无需属性；需要"中文词不断"（如人名、四字成语整体）时用 `word-break: keep-all`。日文中的长音符号、韩文谚文也有各自细则，日常中文业务记住"中文不用管，英文单词才要管"。

**特殊空格**：`&nbsp;`（U+00A0）是**不可断行空格**，多个 `&nbsp;` 连在一起会形成不可断字符串导致溢出（富文本编辑器常见事故）；零宽空格 `&#8203;`（U+2003 为空格，U+200B 才是 ZWSP）相反，它是一个"隐形的建议断行点"，塞在长 URL 的每个 `/` 后可实现优雅断行；`&shy;`（软连字符）同理，但断行时会显示 `-`。

### 2.6 text-wrap：balance 与 pretty（2024 新基线）

```css
text-wrap: wrap;      /* 默认 */
text-wrap: nowrap;    /* 等价 white-space:nowrap 的断行语义 */
text-wrap: balance;   /* 平衡：让多行各行长度尽量均衡，专为短标题设计 */
text-wrap: pretty;    /* 美化：避免段落最后一行只剩一个字（孤行），并做整体优化 */
```

- `balance`：浏览器穷举换行方案，让两行/多行标题的行长差最小。经典效果是标题不再"一行满、第二行挂俩字"。性能上规范建议只用于 ≤6 行文本（浏览器内部对长文本会直接忽略）。
- `pretty`：面向**段落**，代价更高的排版计算，主要规则是防止末行孤字，并优化前几行断行。适合文章正文，不适合高频更新的列表。
- 浏览器成本：两者都在布局阶段增加计算，**不要**给长列表里成百上千段文本全开 balance；标题用 balance、正文用 pretty 是推荐分工。

### 2.7 JS 辅助 API

```js
// 检测是否被截断（单行/多行通用，原理都是 scroll* 比 client* 大）
el.scrollWidth  > el.clientWidth  // 水平方向有溢出 → 单行被省略
el.scrollHeight > el.clientHeight // 垂直方向有溢出 → 多行被 clamp

// 注意：子像素缩放下可能差 0.x，加 1px 容差或用 getBoundingClientRect 对比
```

- **ResizeObserver**：容器宽度响应式变化后，截断状态会变（宽了就不截断了），用 ResizeObserver 重新计算，而不是只算一次。
- **`title` 属性**：原生悬浮显示全文，零成本；代价是延迟约 0.5~1 秒才出现、不可定制样式、触屏无 hover、纯键盘用户无法触发。适合中后台表格这类"效率优先"场景。
- **自定义 tooltip**：截断时才挂载，跟随鼠标定位，注意边界翻转与虚拟列表中的复用。
- **中段截断**：`very-long-filename.min.20240923.bundle.js` → `very-long…bundle.js`，保留首尾信息，需要 JS 二分测量（见场景 6）。
- **数据层按字符截断 + 「…」兜底**：海报/分享图/截图场景（Canvas、html2canvas、服务端绘图）CSS ellipsis 不可靠或不存在，按 `str.slice(0, N) + '…'` 在数据层收口，CJK 按码点（注意 emoji 代理对与组合字符，用 `Array.from(str)` 切）。

---

## 3. 浏览器兼容性

**以下为大致基线**（依据 caniuse / MDN 数据整理，实际支持请以最新 caniuse 为准）：

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `text-overflow: ellipsis` | 1 | 12 | 7 | 1.3 | 全线支持 | 必须三件套齐；旧安卓 2.x 有省略号错位历史问题 |
| `-webkit-line-clamp` 四件套 | 4 | 17 | 68 | 5 | iOS 5+/安卓全线，事实上 100% | 必须四属性齐；Firefox 68 才支持，之前版本多行只能 JS |
| 标准 `line-clamp` | 103 | 103 | 68（带前缀行为） | 16 | iOS 16+ 已较普遍 | 两套并存最稳；老内核忽略标准属性无前缀行 |
| `overflow-wrap: break-word` | 1（`word-wrap`） | 12 | 3.5 | 2 | 全线支持 | 旧名 `word-wrap` 仍是别名；**不影响 min-content** |
| `overflow-wrap: anywhere` | 80 | 80 | 65 | 15.4 | iOS 15.4+，需给老版本兜底 | 影响 min-content，可能让 flex 项缩得过窄 |
| `word-break: break-all/keep-all` | 1 | 12 | 15 | 3 | 全线支持 | `break-word` 历史值非标准，别再写 |
| `hyphens: auto` | 88 | 88 | 6（仅 Linux/部分词典） | 5.1 | iOS 良好；安卓依赖系统词典 | 必须设 `lang`；中文自动断词基本不可用 |
| `mask-image`（fade 遮罩） | 120（标准）/4 前缀 | 120/12 前缀 | 53 | 4（前缀） | 现代内核 OK | 同时写 `-webkit-mask-image`；遮罩色要与底色匹配 |
| `text-wrap: balance` | 114 | 114 | 121 | 17.5 | iOS 17.5+；2024 后机型普遍 | >6 行自动失效；不支持时优雅降级为普通换行 |
| `text-wrap: pretty` | 117 | 117 | 121（部分） | 不支持（2025 仍缺） | 安卓新版 OK，iOS 缺 | 纯增强特性，不支持无副作用 |
| `scrollWidth/scrollHeight` | 1 | 12 | 1 | 1 | 全线支持 | 子像素缩放加容差；`display:none` 时测量为 0 |

> 坑点小结：截断类属性的兼容性整体非常好，90% 的"不生效"问题不是浏览器不支持，而是**条件没凑齐**（三件套/四件套/宽度/min-width:0）。新特性按渐进增强使用，浏览器不认识 `text-wrap` 时只是退回普通换行，无任何破坏。

---

## 4. 使用场景示例

> 每个场景在示例目录中都有对应的可交互页面，此处给出核心代码与逐段注释。

### 场景 1：单行省略 + flex 三栏"左标题右按钮"（列表/导航通用）

```css
.row {
  display: flex;          /* 左标题 + 右操作按钮 */
  align-items: center;
  gap: 12px;
}
.row__title {
  flex: 1;                /* 意图：占满中间剩余宽度 */
  min-width: 0;           /* 关键！解除 min-content 下限，长标题才会被压缩 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row__action {
  flex: none;             /* 按钮绝不被压缩 */
}
```

```html
<div class="row">
  <span class="row__title">一份标题特别特别长的需求文档最终版 v17（请审阅）.docx</span>
  <button class="row__action">下载</button>
</div>
```

**逐段注释**：只写 `flex:1` 时，标题节点的最小宽度等于最长词宽度，弹性算法"不敢"压缩它，于是按钮被挤出容器；`min-width:0` 显式把最小宽度授权为 0，三件套才在真实的收缩后宽度上生效。按钮侧 `flex:none` 是对称保险。

**预期效果**：窗口任意缩窄，标题在可用宽度内显示省略号，下载按钮始终完整贴右。完整演示见 [index-01-single-line.html](../../examples/css/10-text-truncation/index-01-single-line.html)。

### 场景 2：卡片多行省略（标题 2 行 + 描述 3 行，高度锁死）

```css
.card h3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  margin: 0 0 8px;
  /* 故意不写 max-height：让两行行高自然撑起，避免省略号被裁 */
}
.card p {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
  font-size: 14px; line-height: 1.6;   /* 3 行 = 67.2px，需要锁高时按此算 */
  color: #667085;
}
```

**逐段注释**：商品流卡片要求所有卡片等高，图片下方文字区由"标题 2 行 + 描述 3 行"构成确定性高度。四件套缺一不可（示例页可逐个关闭属性对照）；标准 `line-clamp` 与前缀版双写；不要拍脑袋写 `max-height: 66px`，行高、缩放都会让它与行数错位。

**预期效果**：标题无论 5 个字还是 50 个字都占 2 行高度，描述固定 3 行，卡片底部价格栏永远对齐。完整演示见 [index-02-multi-line.html](../../examples/css/10-text-truncation/index-02-multi-line.html)。

### 场景 3：长 URL / 长英文词的断行对照墙

```css
.url-anywhere { overflow-wrap: anywhere; }  /* 可断且参与最小宽度，flex 里能救布局 */
.url-break    { overflow-wrap: break-word; }/* 视觉也断，但 min-content 不变 */
.en-break-all { word-break: break-all; }    /* 行尾一刀切，右边缘整齐但碎词 */
.poem         { white-space: pre-wrap; }    /* 保留用户输入的换行与空格 */
.hyphen       { hyphens: auto; }            /* 英文断词带连字符（需 lang="en"） */
```

```html
<p lang="en" class="hyphen">The most technologically efficient machine…</p>
```

**逐段注释**：同一段超长 URL 在四种取值下行为不同；示例页并排展示并标注每种策略对"最小内容尺寸"的影响。技术正文里的 URL 推荐 `overflow-wrap: anywhere`（或对兼容敏感时 `break-word` + 容器 `min-width:0`）；英文文章正文用 `hyphens:auto` + `lang` 获得出版社级断词；`break-all` 只留给代码/哈希串。

**预期效果**：肉眼对比出"切单词的位置"和"右边缘整齐度"的取舍。完整演示见 [index-03-word-breaking.html](../../examples/css/10-text-truncation/index-03-word-breaking.html)。

### 场景 4：定宽表格多列各自省略

```css
table {
  table-layout: fixed;        /* 关键：列宽由表格/col 决定，不听内容的 */
  width: 100%;
}
th, td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

```html
<table>
  <colgroup><col style="width:30%"><col style="width:40%"><col style="width:30%"></colgroup>
  <thead><tr><th>名称</th><th>链接</th><th>更新时间</th></tr></thead>
  <tbody><tr>
    <td title="2026 年度战略规划（草案-第三轮修订）.pdf">2026 年度战略规划（草案-第三轮修订）.pdf</td>
    <td title="https://…">https://example.com/a/very/long/path?x=1</td>
    <td>2026-09-23</td>
  </tr></tbody>
</table>
```

**逐段注释**：自动表格布局里，浏览器要先看所有行的内容才能算列宽，`nowrap` 长内容会直接撑爆——`table-layout:fixed` 把算法换成"第一行/col 声明即定案"，列宽确定后单元格才有"超出"可言。`title` 属性提供零成本全文悬浮。

**预期效果**：三列严格按 3:4:3 分配，超长内容在各自列内省略，hover 显示完整值。完整演示见 [index-04-real-layout.html](../../examples/css/10-text-truncation/index-04-real-layout.html)。

### 场景 5：截断检测 + 智能 title/tooltip（ResizeObserver）

```js
function updateTruncation(root) {
  document.querySelectorAll('.clamp-target').forEach(function (el) {
    // 容差 1px，规避子像素缩放导致的误报
    var clipped = el.scrollHeight - el.clientHeight > 1 ||
                  el.scrollWidth  - el.clientWidth  > 1;
    el.classList.toggle('is-clipped', clipped);
    // 只在真截断时挂 title，未截断不打扰用户
    if (clipped) el.setAttribute('title', el.textContent.trim());
    else el.removeAttribute('title');
  });
}
var ro = new ResizeObserver(function () { updateTruncation(document); });
ro.observe(document.body);   // 容器宽度变化 → 截断状态变化 → 重算
```

**逐段注释**：不要在初始化时无脑给所有单元格挂 `title`（未截断也弹提示很烦）；用 scroll/client 差值判断真实截断状态。响应式布局下截断是动态的，必须 ResizeObserver 重算。

**预期效果**：只有真的出现省略号的元素 hover 才出全文提示，旋转屏幕/拉宽窗口后徽标自动更新。完整演示见 [index-01-single-line.html](../../examples/css/10-text-truncation/index-01-single-line.html)。

### 场景 6：文件名中段截断（JS 测量实现）

```js
/**
 * 二分法把文本截成 head + … + tail，保证视觉宽度 ≤ maxWidth
 * 为什么二分：逐字符删减在长文本上要测几十上百次，二分最多 log₂N 次
 */
function middleTruncate(el, text, maxWidth) {
  var canvas = middleTruncate.canvas ||
    (middleTruncate.canvas = document.createElement('canvas'));
  var ctx = canvas.getContext('2d');
  ctx.font = getComputedStyle(el).font;   // 字体必须与渲染一致
  var width = function (s) { return ctx.measureText(s).width; };
  if (width(text) <= maxWidth) { el.textContent = text; return; }
  var ell = '…';
  var lo = 0, hi = text.length;
  // 二分"头部保留几个字符"，尾部按剩余宽度取等长
  while (lo < hi) {
    var mid = (lo + hi + 1) >> 1;
    var tail = text.slice(text.length - mid);
    if (width(text.slice(0, mid) + ell + tail) <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  el.textContent = text.slice(0, lo) + ell + text.slice(text.length - lo);
}
```

**逐段注释**：文件扩展名是最重要的信息（`.js`/`.exe`），头部省略会让用户分不清文件类型；中段截断保留首尾。Canvas `measureText` 与 DOM 同字体时宽度一致，免去真实 DOM 反复插删的重排。注意等宽分配头尾只是简化实现，精细版应给尾部预留扩展名的固定宽度。

**预期效果**：`annual-report-2026-final-FINAL-v3(1).pdf` 在 160px 宽度内显示为 `annual-r…(1).pdf`。完整演示见 [index-04-real-layout.html](../../examples/css/10-text-truncation/index-04-real-layout.html)。

---

## 5. 实际应用案例分析

### 案例 1：企业网盘文件列表 —— 五种容器坑的集中爆发

**背景**：文件列表行结构为"图标 + 文件名（flex:1）+ 大小 + 操作按钮组"。测试环境短文件名全部正常，上线后用户反馈：长文件名把按钮挤出屏幕、Firefox 上三行省略不生效、重命名态 `<input>` 里的空格显示异常。

**排查与修复**：

1. **flex 子项溢出**：文件名只写了 `flex:1` + 三件套。根因是 min-content 下限，补 `min-width:0` 修复；按钮组补 `flex:none` 防止极端宽度下被压。
2. **Firefox 多行省略失效**：早期代码用了 `-webkit-box` 四件套，而当时业务要求支持 Firefox ESR 旧版。短期用 JS 方案（按行高×行数设 max-height 裁剪）兜底，浏览器升级后统一切回双写 line-clamp。
3. **button 默认 nowrap**：操作区"更多操作"按钮在窄屏被设计要求折成两行，但 button 自带 `white-space:nowrap`，显式声明 `white-space:normal` 才生效——浏览器 UA 样式优先级经常被忽略。
4. **重命名 input 保留空格**：文件名允许连续空格，input 天然保留；但展示态的普通 span 会合并空格，导致重命名前后视觉跳动，展示态改 `white-space: pre-wrap` 并配合省略策略。
5. **中段截断选型**：文件名先试 CSS 尾部省略，用户调研发现看不到 `.exe` 扩展名引发安全顾虑（分不清可执行文件），改为 Canvas 二分中段截断，并把截断态做成自定义 tooltip（title 在文件列表上延迟太久，影响批量操作效率）。

**结论**：文本截断的 bug 几乎都是"布局上下文"问题而非属性本身问题——先问"这个盒子的宽度由谁决定、它能缩到多窄"，再写三件套。

### 案例 2：内容资讯流 —— 海报分享场景的数据层截断与 balance 上线

**背景**：资讯卡片标题要求最多 2 行；标题同时用于 Canvas 生成的分享海报（服务端 Node 绘制）；设计侧反馈标题折行"第二行经常只有三四个字，很丑"。

**方案选型**：

- Web 端：四件套 + `line-clamp:2` 双写，标题区不写死高度；
- 海报端：Canvas 没有 CSS ellipsis，服务端按**显示宽度**截断（Canvas 同样有 measureText），而不是按字符数拍脑袋——中英混排时 20 个英文字符和 20 个汉字宽度差 3 倍；emoji 用 `Array.from` 切码点，避免切断代理对产出乱码；
- 标题美观：对标题元素加 `text-wrap: balance`，不支持的旧机型自动退回普通换行（纯渐进增强，零副作用）；正文卡片摘要不使用 balance（行数多、列表数量大，布局成本不划算）。

**踩坑**：

1. **字号动态加载**：Web 字体未加载完成时测量得到的是回退字体宽度，截断位置偏短；加 `document.fonts.ready.then(重新测量)` 收口。
2. **虚拟滚动误判**：列表虚拟复用节点，`title` 与截断徽标必须在每次渲染后重算，否则上一行的状态残留到新数据。
3. **balance 与 clamp 叠加**：极少数 Chrome 版本中 balance 会影响 line-clamp 第二行省略号位置，回归测试确认目标版本无问题后上线，保留关闭开关。

**结论**：CSS 截断负责"屏内"，数据层截断负责"屏外"（海报、通知推送、服务端渲染的固定宽图），两条线都要有；balance 这类美化特性以渐进增强方式上线，投入产出比最高。

---

## 6. 最佳实践与常见坑

1. **三件套/四件套写完再排查**：单行省略不出现，按 `nowrap → overflow:hidden → ellipsis → 宽度确定 → min-width:0` 的顺序逐项核对，90% 的问题在这五步内。
2. **flex 行方向永远记得 `min-width:0`**：把它写进团队代码片段模板；同理 grid 用 `minmax(0,1fr)`，列方向 flex 多行省略用 `min-height:0`。
3. **不要用 `width:0;flex:1` 这类 hack 代替 min-width:0**：虽然某些场景视觉相似，但语义错误，会影响内部绝对定位元素的宽度计算。
4. **多行省略不要拍 max-height**：行高乘以行数必须精确，字体加载、缩放、`line-height: normal` 都会让省略号被裁半行；优先只靠 line-clamp 撑高。
5. **`line-clamp` 双写**：`-webkit-line-clamp` 在前覆盖老内核，标准 `line-clamp` 在后面向未来；`display:-webkit-box` 在现代浏览器与普通布局共存良好，不用怕"过时"。
6. **URL 优先 anywhere/break-word，慎用 break-all**：`break-all` 让英文文章阅读体验显著下降；只对哈希、代码、纯 URL 字符串使用。
7. **区分 break-word 与 anywhere 的 min-content**：flex 布局里 `break-word` 救不了溢出（它不缩小最小尺寸），要么 `anywhere` 要么 `min-width:0`。
8. **富文本警惕不可断字符**：`&nbsp;` 连续出现、英文长词、合成 emoji 都会形成不可断串，富文本入库时规范化空格，展示侧兜底 `overflow-wrap:anywhere`。
9. **`hyphens:auto` 必须配 `lang`**：`<html lang="zh-CN">` 下英文段落局部加 `lang="en"`；中文自动断词词典支持极弱，不要指望。
10. **title 只给截断元素**：配合 scrollWidth/scrollHeight 检测 + ResizeObserver，避免未截断内容也弹延迟提示；触屏场景另做长按或 always-visible 的"全文"入口。
11. **JS 字符截断用 `Array.from`**：emoji（代理对）、ZWJ 组合、肤色修饰符直接 `slice` 会切出乱码；海报/推送等数据层截断按码点处理，按显示宽度而非字符数收口。
12. **中段截断保扩展名**：文件名、邮箱、域名优先保留尾部（`.pdf`、`@company.com`），用 Canvas measureText 二分测量。
13. **table 必须 fixed 才能省略**：自动表格布局下列宽听内容的；定宽声明放在 `colgroup` 或首行。
14. **绝对定位/浮动要显式给宽**：shrink-to-fit 盒子宽度由内容决定，永不溢出；`left:0;right:0` 是绝对定位元素的"宽度 100%"惯用法。
15. **balance/pretty 分工**：短标题 balance（≤6 行才有效）、长正文 pretty；别给长列表逐项开启，布局成本随元素数量线性增长。
16. **fade 遮罩注意底色与圆角**：mask 渐变终色必须等于容器底色（透明底上做淡出要用真透明渐变，不能用白色假渐变）；圆角容器记得 `mask` 与圆角一致，否则方角露馅。
17. **可访问性**：被省略的内容对读屏器仍然完整可读（视觉隐藏不影响可访问树），这是 CSS 截断相对 JS 删字符的优势之一；不要用 JS 真删文本只做视觉省略。

---

## 7. 参考资料

- MDN — `text-overflow`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-overflow>
- MDN — `-webkit-line-clamp`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/-webkit-line-clamp>
- MDN — `line-clamp`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/line-clamp>
- MDN — `white-space`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/white-space>
- MDN — `overflow-wrap`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/overflow-wrap>
- MDN — `word-break`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/word-break>
- MDN — `hyphens`：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/hyphens>
- MDN — `text-wrap`（balance/pretty）：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-wrap>
- MDN — `Element.scrollWidth`（截断检测）：<https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollWidth>
- MDN — `ResizeObserver`：<https://developer.mozilla.org/zh-CN/docs/Web/API/ResizeObserver>
- CSS Overflow Module Level 4（line-clamp 标准定义）：<https://drafts.csswg.org/css-overflow-4/#line-clamp>
- CSS Text Module Level 3（断行模型）：<https://drafts.csswg.org/css-text-3/>
- CSS Text Module Level 4（text-wrap）：<https://drafts.csswg.org/css-text-4/>
- caniuse — line-clamp：<https://caniuse.com/css-line-clamp>
- caniuse — text-wrap: balance：<https://caniuse.com/css-text-wrap-balance>
- caniuse — overflow-wrap: anywhere：<https://caniuse.com/mdn-css_properties_overflow-wrap_anywhere>
