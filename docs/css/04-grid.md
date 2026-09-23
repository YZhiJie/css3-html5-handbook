# 网格布局 Grid（CSS Grid Layout）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— Grid 是 CSS 的二维布局系统：同时在行与列两个维度上划分轨道，让"先设计页面骨架、再把内容放进格子"的排版方式第一次成为可能。

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
| [index-01-track-units.html](../../examples/css/04-grid/index-01-track-units.html) | 轨道尺寸：fr、minmax、auto-fit vs auto-fill 交互对比 |
| [index-02-areas-lines-span.html](../../examples/css/04-grid/index-02-areas-lines-span.html) | grid-template-areas 页面骨架 + 网格线定位与 span |
| [index-03-alignment-subgrid.html](../../examples/css/04-grid/index-03-alignment-subgrid.html) | place-\* 对齐体系 + 嵌套网格与子网格 subgrid |
| [index-04-responsive-gallery.html](../../examples/css/04-grid/index-04-responsive-gallery.html) | 无媒体查询响应式卡片画廊 + 密集流 auto-flow: dense |

---

## 1. 概念解释

### 1.1 是什么

Grid（CSS Grid Layout Module Level 1/2）是 CSS 的**二维**布局系统。容器通过 `display: grid` 声明后，可以用 `grid-template-columns` / `grid-template-rows` 把容器划分成**行 × 列**的轨道（track）矩阵，格子之间形成**网格线（grid line）**，项目可以占据一个或多个"行列交叉"出来的矩形区域（grid area）。

与 Flexbox 的本质区别一句话：**Flexbox 是"内容驱动的流式排列"，Grid 是"布局驱动的结构切分"**。Flex 关心"这一串东西怎么排"；Grid 关心"这块屏幕怎么分"，内容放进分好的格子里。

### 1.2 解决什么问题

- **真正的二维布局**：页面骨架（顶栏/侧栏/主区/底栏）、杂志排版、数据看板——行列需要**跨行跨列对齐**的结构，Flex 只能靠嵌套模拟且对不齐，Grid 原生支持。
- **轨道级控制**：`1fr`、`minmax(200px, 1fr)`、`repeat(auto-fill, minmax(220px, 1fr))` 直接表达"最小 220px、放得下几列放几列"这类响应式意图，**不需要媒体查询**。
- **骨架即文档**：`grid-template-areas` 用一串字符串画出页面地图（`"header header" "nav main"`），看一眼就知道布局长什么样。
- **项目自由落位**：任何项目可用网格线编号（含负数倒数线）与 `span` 摆到任意矩形区域，与 DOM 顺序解耦。
- **跨子树对齐（subgrid）**：嵌套网格可以让子网格沿用父网格的轨道，解决"卡片标题不在一条线上"这类跨容器对齐难题。

### 1.3 底层原理

#### 1.3.1 网格的构成要素

以 `grid-template-columns: 100px 1fr 1fr; grid-template-rows: 60px auto;` 为例：

```
 列线1   列线2      列线3      列线4
  ↓        ↓          ↓          ↓
 ┌──────┬──────────┬──────────┐ ─ 行线1
 │      │          │          │
 ├──────┼──────────┼──────────┤ ─ 行线2
 │      │          │          │
 └──────┴──────────┴──────────┘ ─ 行线3
   100px     1fr        1fr
```

- **网格轨道（track）**：相邻两条平行网格线之间的空间，即"一行"或"一列"。
- **网格线（line）**：划分轨道的线，从 1 开始编号（也接受 0 行为特殊）；**负数从末尾倒数**（-1 = 最后一条线），行列数量增长时负数线始终指向"最后一列/行之后"，这是"永远贴右下角"的写法。
- **网格单元（cell）**：相邻行线 × 相邻列线围成的最小格子。
- **网格区域（area）**：若干 cell 组成的矩形，可用命名区域引用。

#### 1.3.2 显式网格与隐式网格

- **显式网格（explicit grid）**：`grid-template-columns/rows` 划定的部分，数量与尺寸由代码确定；
- **隐式网格（implicit grid）**：当项目数量超过显式轨道数、或项目定位超出显式范围时，浏览器**自动补出来的轨道**，尺寸由 `grid-auto-rows` / `grid-auto-columns` 控制（默认 `auto`，即按内容），排列方向由 `grid-auto-flow` 决定。

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 显式：3 列 */
  grid-auto-rows: 120px;                 /* 隐式行一律 120px —— 项目多了也不乱 */
}
```

这解释了"为什么列表项超过列数会自动掉到下一行"：超出的项目落进隐式轨道。不设置 `grid-auto-rows` 时隐式行高按内容自适应，等高画廊就会"参差不齐"——给 `grid-auto-rows` 一个定值或配合 `aspect-ratio` 即可恢复整齐。

#### 1.3.3 fr 单位与轨道尺寸求解

`fr`（fraction，份数）表示"剩余空间的分配份数"，但**不是简单的等分**。轨道尺寸算法要点：

1. 先处理绝对尺寸与 `minmax()` 中的固定下限；
2. `fr` 拿到的是**扣除固定轨道、gap 与定值轨道之后**的剩余空间；
3. 关键细节：`fr` 轨道的最小尺寸默认是 `auto`——即**不小于其内容的 min-content**。若某格子里塞了超长单词，`1fr` 会先被内容顶大，其他 fr 轨道跟着缩水，造成"明明写的 1fr 1fr 却不等宽"。修复方式是显式写 `minmax(0, 1fr)`，把下限钳到 0；
4. `minmax(min, max)` 定义轨道尺寸区间，浏览器在区间内求解（auto 关键字在 min 位 ≈ min-content，在 max 位 ≈ max-content）。

#### 1.3.4 auto-fit 与 auto-fill 的区别

两者都出现在 `repeat()` 第一个参数，配合 `minmax()` 实现"列宽不小于 X、能塞几列塞几列"：

- `auto-fill`：**优先造空轨道**——放不下更多项目时，把剩余空间留给看不见的空列；
- `auto-fit`：**折叠空轨道**——数量确定后，空轨道塌缩为 0，剩余空间分给实轨道（表现为项目行被拉伸铺满）。

容器内只有 3 个项目、一行能装 6 列时：`auto-fill` 下 3 张卡片右侧有 3 列空白轨道占位（卡片不拉伸）；`auto-fit` 下空轨道被折叠，3 张卡片被拉宽铺满整行。做"列表页固定最小列宽"用 auto-fill，做"卡片组永远铺满"用 auto-fit。

#### 1.3.5 子网格 subgrid 一句话原理

嵌套网格默认是"独立布局"：子网格的轨道与父网格互不相干。`subgrid`（Grid Level 2）允许子网格**沿用父网格指定维度上的轨道定义**（尺寸、命名线全部继承），从而让不同父项里的"卡片头"落在同一条父轨道线上，实现跨子树对齐。它只能"透传"一或两个维度（`grid-template-rows: subgrid`），另一维度仍需自定义。

---

## 2. 语法说明

### 2.1 容器属性

| 属性 | 可选值 | 说明 |
| --- | --- | --- |
| `display` | `grid` / `inline-grid` | 建立 grid formatting context，子项成为 grid item |
| `grid-template-columns` | `<track-list>` | 显式列轨道，如 `120px 1fr 2fr` |
| `grid-template-rows` | `<track-list>` | 显式行轨道，如 `64px auto 1fr` |
| `grid-template-areas` | 字符串行 | 命名区域地图，`"head head" "nav main"`；`.` 表示空格子 |
| `grid-template` | `<rows> / <columns>` 或 areas 组合 | 三者简写，如 `grid-template: auto 1fr / 200px 1fr` |
| `grid-auto-rows` / `grid-auto-columns` | `<track-size>` | 隐式轨道尺寸，默认 `auto` |
| `grid-auto-flow` | `row`（默认）/ `column` / `row dense` / `column dense` | 自动放置算法方向；`dense` 回填空洞 |
| `grid` | 极简写法 | 一般不建议，可读性差 |
| `gap` / `row-gap` / `column-gap` | `<length-percentage>` | 轨道间距，别名 `grid-gap`（已弃用但常见于老代码） |
| `place-items` | `<align-items> / <justify-items>` | 项目在格子内的对齐 |
| `place-content` | `<align-content> / <justify-content>` | 整个网格在容器内的对齐 |

`<track-size>` 的完整词汇表：

| 值 | 含义 |
| --- | --- |
| `100px` / `10em` | 固定长度 |
| `25%` | 容器宽度的百分比（注意含 gap 时易溢出，慎用） |
| `1fr` | 剩余空间的 1 份 |
| `min-content` | 内容最小宽（最长单词） |
| `max-content` | 内容不换行的理想宽 |
| `auto` | min 位 ≈ min-content；max 位 ≈ "弹性、吸收剩余空间" |
| `minmax(200px, 1fr)` | 尺寸被约束在 [200px, 1fr] 区间 |
| `fit-content(300px)` | 等价 `minmax(auto, min(max-content, 300px))`，"最多 300px，内容小则更小" |

### 2.2 repeat() 与响应式三件套

```css
/* 固定次数 */
grid-template-columns: repeat(3, 1fr);
/* 重复模式 */
grid-template-columns: repeat(2, 100px 1fr);   /* 100px 1fr 100px 1fr */
/* 自动填充：列宽 ≥240px，能放几列放几列 —— 免媒体查询的核心 */
grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
grid-template-columns: repeat(auto-fit,  minmax(240px, 1fr));
```

### 2.3 项目定位（网格线与 span）

每个 grid item 可用四条线定位，语法为 `grid-row-start / grid-row-end / grid-column-start / grid-column-end` 及其简写：

| 写法 | 含义 |
| --- | --- |
| `grid-column: 1 / 3;` | 从列线 1 到列线 3，跨 2 列 |
| `grid-column: 1 / span 2;` | 从列线 1 起跨 2 列（推荐，无需知道终点线号） |
| `grid-column: 2 / -1;` | 从列线 2 到最后一条列线（负数倒数） |
| `grid-area: 1 / 2 / 3 / 4;` | 行起 / 列起 / 行终 / 列终，一次定位四条线 |
| `grid-area: header;` | 落入 `grid-template-areas` 命名的区域 |
| `grid-row: 2; grid-column: 3;` | 单线简写：起始线 2，自动只占 1 格 |

定位铁律：项目允许重叠（故意叠放可做叠加排版），但**区域必须是矩形**——`grid-area` 无法表达 L 形。

### 2.4 对齐体系（三组六个属性）

| 作用对象 | 交叉轴（块向）/ 行内轴 | 说明 |
| --- | --- | --- |
| 格子内的项目（items） | `align-items` / `justify-items` | 每个 item 在**自己格子内**怎么放，简写 `place-items` |
| 整个网格（content） | `align-content` / `justify-content` | 轨道总尺寸小于容器时，**整个网格**怎么分配空隙 |
| 单个项目（self） | `align-self` / `justify-self` | 单个 item 覆盖容器级 items 设置 |

取值词汇与 Flex 一致（`start/end/center/stretch/baseline/space-between...`），记忆技巧：**align 一律管垂直（块轴）、justify 一律管水平（内联轴）**——Grid 里这两组不再随方向变化（不像 flex-direction 会交换主轴），这是 Grid 心智比 Flex 更稳的地方。

```css
.grid {
  display: grid;
  place-items: center;      /* 格子内水平垂直都居中，最常用的一行居中代码 */
}
```

### 2.5 嵌套网格与 subgrid

```css
/* 父：两列卡片 */
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* 子：卡片内部沿用父网格的列轨道 → 两张卡的"标题"必然同宽同位 */
.card {
  display: grid;
  grid-template-columns: subgrid;   /* 列方向透传父轨道 */
  grid-column: span 2;              /* 子网格需先声明自己跨父网格几列 */
  grid-template-rows: auto 1fr auto; /* 行方向仍可自定义 */
}
```

要点：使用 `subgrid` 的维度必须**先跨**足够的轨道（`grid-column: span 2`），否则无从"继承"；未声明 subgrid 的维度可以自由定义轨道；subgrid 内的项目同样可用父轨道的命名线。

---

## 3. 浏览器兼容性

> ⚠️ 以下为**大致基线**（依据 caniuse 整理，精确版本以 caniuse.com 的 css-grid 条目为准）。

| 浏览器 | 起始版本 | 备注 |
| --- | --- | --- |
| Chrome | 57（2017-03） | 57 起为无前缀的规范实现；更早的 29–56 为旧实验语法，忽略 |
| Edge | 16（2017-10） | Edge 12–15 只有 IE 的 `-ms-grid` 旧实现，不可按现代 Grid 使用；79+ 与 Chrome 一致 |
| Firefox | 52（2017-03） | 52 起 Windows 平台默认开启，规范实现 |
| Safari | 10.1（2017-03） | 10.1–11 需注意个别子特性差异；iOS Safari 10.3 起 |
| iOS Safari | 10.3 | 同 Safari 基线 |
| Android Browser / WebView | 57+ | 随 Chromium 内核；国内厂商内核基线可按 Chrome 70+ 估算 |

移动端简述：2017 年三大内核同月落地现代 Grid（Chrome 57 / Firefox 52 / Safari 10.1），此后稳定迭代；如今除"极老 WebView 合作项目"外可放心作为默认二维方案。

子特性坑点备注：

| 子特性 | 大致基线 | 坑点 |
| --- | --- | --- |
| **subgrid**（单独标注） | Firefox 71+（2019-12）/ Safari 16+（2022-09）/ Chrome 117+ / Edge 117+（2023-09）；iOS Safari 16+ | 兼容性**显著晚于 Grid 本体 5 年+**，Safari 反而早于 Chrome 两年支持；生产使用必须有 `@supports (grid-template-rows: subgrid)` 渐进降级 |
| Flex 之外轨道动画（fr/网格模板过渡） | Chrome 107+ / Firefox 66+ / Safari 16+ | 老内核对 `grid-template-*` 过渡直接跳变，动画仅作增强 |
| `masonry`（瀑布流，Grid L3） | 仅实验性 flag | 尚未标准化，勿用于生产 |
| `grid-gap` 别名 | 与 Grid 同期 | `gap` 才是规范名，新代码统一写 `gap` |

---

## 4. 使用场景示例

### 4.1 场景一：无媒体查询的响应式卡片（auto-fit + minmax）

**场景描述**：商品/文章卡片列表，要求"每张卡片最窄 240px，能放几列放几列"，从手机到 4K 屏一行代码响应。对应示例 [index-01-track-units.html](../../examples/css/04-grid/index-01-track-units.html) 与 [index-04-responsive-gallery.html](../../examples/css/04-grid/index-04-responsive-gallery.html)。

```css
.cards {
  display: grid;
  gap: 16px;
  /* 逐词翻译：重复(自动适配列数, [最小240px, 最大1份]) */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
```

```html
<!-- 项目数量任意：3 个也行、30 个也行，列数由浏览器按容器宽度求解 -->
<ul class="cards">
  <li>卡片 1</li><li>卡片 2</li><li>卡片 3</li>
  <!-- 无需任何 col-span / width 类，也无需媒体查询 -->
</ul>
```

**预期效果**：拖动窗口宽度，列数在 1/2/3/4 间自动增减，每张卡片不窄于 240px；把 `auto-fit` 换成 `auto-fill`，项目不足时右侧会保留空轨道（卡片不拉伸）——两者差异在示例页有并排对照。

### 4.2 场景二：grid-template-areas 页面骨架（后台系统）

**场景描述**：中后台页面骨架：顶栏通栏、左侧导航、右侧内容区 + 底部状态栏；移动端要求导航折叠到顶部下方。对应示例 [index-02-areas-lines-span.html](../../examples/css/04-grid/index-02-areas-lines-span.html)。

```css
.layout {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 220px 1fr;         /* 侧栏定宽，主区自适应 */
  grid-template-rows: 64px 1fr 32px;        /* 顶栏 / 主体 / 状态栏 */
  grid-template-areas:                      /* ASCII 地图：一眼看懂页面结构 */
    "header header"
    "nav    main"
    "status status";
}
.layout > header { grid-area: header; }  /* 按名字落位，不关心行号 */
.layout > nav    { grid-area: nav;    }
.layout > main   { grid-area: main;   }
.layout > footer { grid-area: status; }  /* 命名可以与标签语义不同 */

@media (max-width: 720px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-rows: 64px auto 1fr 32px;
    grid-template-areas:
      "header"
      "nav"
      "main"
      "status";                            /* 单列堆叠：只改地图，选择器零改动 */
  }
}
```

**预期效果**：宽屏四块各就各位，`min-height: 100vh` + `1fr` 行保证状态栏贴底；窄屏变单列，**所有落位规则无需修改**——areas 把"结构"与"布局"解耦了。

### 4.3 场景三：网格线定位与 span（杂志式图片排版）

**场景描述**：画廊中部分图占 2×2、部分横跨 2 列，形成杂志感节奏。对应示例 [index-02-areas-lines-span.html](../../examples/css/04-grid/index-02-areas-lines-span.html)。

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 140px;              /* 隐式行定高：配合跨行才整齐 */
  gap: 12px;
}
.gallery .wide   { grid-column: span 2; }        /* 横跨 2 列，行自动放置 */
.gallery .tall   { grid-row: span 2; }           /* 纵跨 2 行 */
.gallery .hero   { grid-column: 1 / 3; grid-row: 1 / 3; }  /* 精确线号：占 2×2 */
.gallery .corner { grid-column: -2 / -1; grid-row: -3 / -1; } /* 负数线：贴右下角 */
```

**预期效果**：hero 图占据左上 2×2 区域，普通图自动流入剩余格子；`corner` 始终钉在网格右下角（负数线不随轨道数变化）。若自动放置留下难看的空洞，加 `grid-auto-flow: dense` 让算法回填（示例 04 有开关演示）。

### 4.4 场景四：subgrid 跨卡片对齐（表单/卡片组）

**场景描述**：两列卡片，每张卡片内部有"标题 / 描述 / 按钮区"三段，要求**所有卡片的标题区等高、按钮区贴底对齐**——嵌套独立网格做不到跨卡对齐，subgrid 可以。对应示例 [index-03-alignment-subgrid.html](../../examples/css/04-grid/index-03-alignment-subgrid.html)。

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.card {
  display: grid;
  grid-row: span 2;
  grid-template-rows: subgrid;   /* 行轨道沿用父网格 → 跨卡片的行对齐 */
  gap: 8px;
}
.card h3    { min-height: 2.6em; }   /* 兜底：不支持 subgrid 的浏览器仍有保底观感 */
.card .foot { align-self: end; }     /* 按钮区贴子网格最后一行 */
```

**预期效果**：支持 subgrid 的浏览器（Firefox 71+ / Safari 16+ / Chrome 117+）中，两张卡片的第一行高度严格同步——哪怕 A 卡标题一行、B 卡标题两行，第二行的起始线完全一致；不支持时回退为普通嵌套网格 + `min-height` 兜底，布局依旧可用。

---

## 5. 实际应用案例分析

### 5.1 案例一：电商列表页（商品网格 + 筛选栏 + 详情骨架）

**产品场景**：电商商品列表页：顶部筛选栏（分类 chips 横向滚动 + 排序按钮）、中部商品卡片网格（≥240px 自适应列数）、底部分页；点击商品进入详情页，详情页为"左图右参数"骨架，移动端上下堆叠。

**方案选型**：商品网格用 `repeat(auto-fill, minmax(240px, 1fr))`——列表页需要"列数随宽度伸缩"且**数量不可预知**，auto-fill 保证项目不满一行时不被拉伸变形（auto-fit 会把 2 张卡片拉成巨图，视觉上反而廉价）；详情页骨架用 `grid-template-areas`：

```css
.detail {
  display: grid;
  grid-template-columns: minmax(320px, 42%) 1fr;
  grid-template-areas: "gallery info" "desc desc";
  gap: 24px;
}
.detail-media { grid-area: gallery; }
.detail-info  { grid-area: info; }
.detail-desc  { grid-area: desc; }    /* 图文详情通栏，宽度与上面两块同网格 */

@media (max-width: 760px) {
  .detail { grid-template-columns: 1fr; grid-template-areas: "gallery" "info" "desc"; }
}
```

**踩坑分析**：

1. **1fr 不等宽**：商品标题里出现超长 SKU 字符串（无空格），所在列被 min-content 顶大，右列变窄。修复：卡片内标题容器 `min-width: 0` + 截断；轨道改 `minmax(0, 1fr)`。这对应 1.3.3 的 fr 最小尺寸规则，是 Grid 版的"Flex min-width:auto 坑"。
2. **筛选栏 chips**：横向滚动 chips 用 Flex（一维），外层容器与卡片网格用 Grid——**同一页面混合使用是常态**，选型看每一块是"一维流"还是"二维结构"。
3. **分页条贴底**：列表项过少时分页条上浮贴着卡片，改为页面级 Grid 骨架 `grid-template-rows: auto 1fr auto` 让分页区吃 `auto` 行贴底，与 Flex sticky footer 同理。

### 5.2 案例二：运营数据看板（Dashboard）

**产品场景**：数据看板：顶部 4 个 KPI 卡通栏；中部一张 2×2 大图表 + 侧边排行榜样式小卡；下部表格区；各卡片头部（图标+标题+数值）需水平对齐，且窗口缩放时图表块比例稳定。

**方案选型**：看板是典型二维结构——不同块**跨行跨列**（大图占 2 行），Grid areas + 线定位混合使用：

```css
.board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto repeat(2, 260px) auto;
  grid-template-areas:
    "kpi    kpi    kpi    kpi"
    "chart  chart  chart  rank"
    "chart  chart  chart  rank"
    "table  table  table  table";
  gap: 16px;
}
.board > .kpis  { grid-area: kpi;   display: grid; place-items: center; }
.board > .chart { grid-area: chart; }
.board > .rank  { grid-area: rank; }
.board > .table { grid-area: table; }
/* KPI 四小卡：auto-fit 一行代码自适应窄屏折行 */
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
```

**踩坑分析**：

1. **卡片头错位**：四类卡片各自独立渲染，标题基线不齐。方案一是抽公共组件统一行高（工程解）；方案二是卡片头用 subgrid 与看板列轨道对齐（布局解，需 `@supports` 探测）。团队最终选方案一——subgrid 基线（Chrome 117+，2023-09）晚于该看板的最低支持目标（Chrome 100）。
2. **图表高度抖动**：图表库按容器高度初始化，`1fr` 行随内容变化引发 resize 循环。将图表行高从 `1fr` 改为定值行（`260px`，窄屏媒体查询下调），容器尺寸稳定后抖动消失——**Grid 轨道尺寸要为"不可再缩的内容"留定值**。
3. **窄屏重排**：看板地图在 ≤960px 时改为单列（KPI → chart → rank → table），得益于 areas 只改一处字符串；若用线定位则要给每个块重写 4 条线号，**areas 的可维护性优势在响应式重排时最明显**。

---

## 6. 最佳实践与常见坑

1. **fr ≠ 等分**：`1fr` 的下限是内容 min-content，内容差异会导致"写了 1fr 1fr 却不等宽"；要严格等分写 `repeat(n, minmax(0, 1fr))`。
2. **百分比轨道慎用**：`50%` 按"含 gap 的容器宽"解析，多列 + gap 时总和超 100% 直接溢出；优先 `fr`（fr 分配的是扣除 gap 后的剩余空间）。
3. **auto-fill vs auto-fit 按语义选**：项目数量少时 auto-fit 会把卡片拉满一行（可能变形），列表页要"列宽稳定"用 auto-fill，横幅要"永远铺满"用 auto-fit；不确定就都试一遍再定。
4. **隐式轨道必须设尺寸**：只要项目数量动态（列表、画廊），就写 `grid-auto-rows`（或让项目用 `aspect-ratio`），否则隐式行按内容自适应，"等高网格"会随机参差。
5. **项目区域必须矩形**：`grid-area` 定不出 L 形；需要"凹角"效果时拆成两个项目或用负 margin/叠加（线定位允许重叠是合法能力，可做叠字排版）。
6. **响应式重排优先 areas，自由落位才用线号**：`grid-template-areas` 改一个字符串就能重排整页；线号定位适合"个别元素特殊位置"（负数线贴角、span 跨块），两者混用没问题，但别把整页都写死线号。
7. **subgrid 记得 span + 降级**：使用 `subgrid` 的维度必须先 `grid-column/row: span n`；且必须包 `@supports (grid-template-rows: subgrid)` 给老浏览器（Chrome <117）留嵌套网格 + min-height 的兜底。
8. **别用 Grid 干一维的活**：单行按钮组、标签 chips、面包屑，Flex 更简单；同样，别用 Flex 模拟二维网格——选型先问"几根轴"（详见 6.9 决策树）。
9. **Grid vs Flex 决策树**：
   - 内容沿一个方向流动、数量不定 → **Flex**；
   - 行列都要对齐 / 骨架先行 / 需要跨行跨列 → **Grid**；
   - 一维但需要"格子化等分"（如固定 N 列卡片）→ 两者皆可，`repeat(auto-fit, minmax())` 让 Grid 更省媒体查询；
   - 整页框架 → 外层 Grid（或 Grid 嵌 Flex），区块内部各自选择。
10. **命名一切**：给常用线命名（`grid-template-columns: [main-start] 1fr [aside-start] 300px [main-end aside-end] 1fr [main-end]`）或用 areas 命名，比"第 3 条线"可读得多；重构时改轨道定义即可，落位代码不用动。
11. **检查父容器的溢出链**：Grid 容器内出现意外滚动条时，逐层检查 `min-width/min-height`（与 Flex 同源的自动最小尺寸问题在 grid item 上同样存在，修复方式一致：`min-width: 0`）。

---

## 7. 参考资料

- MDN — Grid 中文教程（概念/关系/布局三篇）：<https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Grids>
- MDN — CSS Grid Layout 模块总览：<https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout>
- MDN — `grid-template-areas` 参考：<https://developer.mozilla.org/zh-CN/docs/Web/CSS/grid-template-areas>
- MDN — subgrid 概念与用法：<https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid>
- CSS 规范 — CSS Grid Layout Module Level 1：<https://www.w3.org/TR/css-grid-1/>
- CSS 规范 — Level 2（subgrid）：<https://www.w3.org/TR/css-grid-2/>
- 规范草案（最新进展）：<https://drafts.csswg.org/css-grid-1/>
- caniuse — css-grid 兼容性数据：<https://caniuse.com/css-grid>
- caniuse — subgrid 兼容性数据：<https://caniuse.com/css-subgrid>
- 交互式学习游戏 Grid Garden（种菜 28 关掌握线定位）：<https://cssgridgarden.com/#zh-cn>
- Jen Simmons — Grid 实验与 Labs：<https://labs.jensimmons.com/>
- 本文配套示例目录：[examples/css/04-grid/](../../examples/css/04-grid/index-01-track-units.html)
