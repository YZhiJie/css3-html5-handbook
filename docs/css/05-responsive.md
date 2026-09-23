# 响应式设计（媒体查询 / 视口单位 / 容器查询 / 响应式图片）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 响应式的本质是"**一套代码适配无穷的浏览环境**"：从 320px 的手机到 5120px 的带鱼屏，从 LTR 的中文到 RTL 的阿拉伯语。现代答案的层次是：媒体查询管"设备"，容器查询管"组件"，视口单位与 clamp 管"流"，逻辑属性管"方向"。

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
| [index-01-media-queries.html](../../examples/css/05-responsive/index-01-media-queries.html) | 媒体查询与断点策略 + 视口单位 + clamp 流体排版 |
| [index-02-container-queries.html](../../examples/css/05-responsive/index-02-container-queries.html) | 容器查询组件化响应 + 逻辑属性与国际化 |
| [index-03-fluid-images-layout.html](../../examples/css/05-responsive/index-03-fluid-images-layout.html) | 响应式图片（srcset/sizes/picture 模拟）+ 常用响应式布局模式 |

---

## 1. 概念解释

### 1.1 响应式设计是什么

同一份 HTML/CSS，根据**浏览环境的约束**（视口宽度、方向、分辨率、用户偏好、甚至组件容器宽度）自动调整布局与呈现。三大支柱演进为五个层次：

1. **viewport meta**：先让"CSS 像素 = 设备逻辑像素"，否则移动端会按 980px 虚拟视口缩放渲染，一切响应式都无从谈起。
2. **媒体查询**：按**设备/视口**特征切换样式——页面级响应的开关。
3. **视口单位 + clamp()**：让字号/间距随视口**连续流动**，而不是逐级跳变。
4. **容器查询**：按**组件所在容器**的宽度切换样式——组件级响应，是"组件化时代"的媒体查询。
5. **逻辑属性 + 响应式图片**：方向自适应（国际化）与资源自适应（网络/屏幕），补齐内容与数据层。

### 1.2 解决什么问题

- **一份代码多端适配**：维护 1 套响应式页面远比维护 3 套（PC/WAP/M 站）便宜，URL 统一也利于分享与 SEO。
- **组件可复用**：过去"卡片在侧栏里应该竖排、在主区里横排"只能靠页面级媒体查询hack；容器查询让组件**自带布局策略**，放进哪里都对。
- **排版永不失控**：`clamp()` 让标题在 320px 屏是 1.5rem、在 4K 屏是 3rem，中间连续过渡，不需要写 5 档断点。
- **多语言/多方向**：逻辑属性让同一套样式在阿拉伯语（RTL）界面自动镜像，不再写两份 `margin-left/right`。

### 1.3 底层原理

1. **CSS 像素与设备像素**：`window.devicePixelRatio`（DPR）= 物理像素 ÷ 逻辑像素。iPhone DPR=3 时，1px CSS = 3×3 物理像素。响应式图片的 `srcset` 本质是"给不同 DPR/视口提供不同分辨率的同一张图"。
2. **viewport meta 的机制**：没有它，移动浏览器假定页面是 980px 宽的"桌面页"，先渲染再整体缩小——`width=device-width` 把布局视口设为设备逻辑宽度，`initial-scale=1` 取消初始缩放。
3. **媒体查询的求值时机**：浏览器在**每帧渲染前**求值，视口变化（旋转窗口、拖拽窗口）实时触发规则切换；`min-width`/`max-width` 的比较基于**布局视口**而非物理像素。
4. **视口单位家族**：`vw/vh` 是布局视口的 1%；移动端地址栏伸缩导致 `vh` 不稳定（100vh 包含被地址栏遮住的部分）→ 新单位 `dvh`（动态）、`svh`（最小，地址栏展开时）、`lvh`（最大，收起时）按"地址栏状态"重新定义高度基准。
5. **容器查询原理**：`container-type: inline-size` 让元素成为"查询容器"，其**内容布局与子树样式**可按容器自身 inline-size 求值；容器的大小由**外部布局**决定，内部响应——与媒体查询的"外响应内"方向正好相反，两者组合才完整。
6. **内容驱动断点**：断点不该照搬设备宽度表（iPhone 14/15/16…列不完），而应该在**当前设计在某个宽度"开始变丑"的地方**插断点——从最小屏开始写样式，撑不住时才加 `min-width` 查询。

---

## 2. 语法说明

### 2.1 viewport meta

```html
<!-- 移动端标配：布局视口 = 设备逻辑宽度，初始缩放 1，禁止用户缩放（无障碍不建议禁） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

| 参数 | 说明 |
| --- | --- |
| `width=device-width` | 布局视口宽度 = 设备逻辑像素宽（也可写固定值，仅特殊场景） |
| `initial-scale` | 初始缩放，1 = 1 CSS px = 1 逻辑 px |
| `maximum-scale` / `user-scalable` | 限制缩放——**无障碍红线**：低视力用户依赖缩放，不要禁 |
| `viewport-fit=cover` | 刘海屏安全区扩展，配合 `env(safe-area-inset-*)` 使用 |

### 2.2 媒体查询

```css
/* 移动优先（推荐）：基础样式 = 手机，宽了再增强 */
.grid { display: grid; gap: 12px; }                    /* 手机：单列 */
@media (min-width: 48em) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 80em) { .grid { grid-template-columns: repeat(4, 1fr); } }

/* Level 4 区间语法（现代）：更接近数学表达 */
@media (400px <= width <= 800px) { .drawer { position: fixed; } }

/* 其他常用特征 */
@media (orientation: landscape) { }        /* 横屏 */
@media (hover: hover) and (pointer: fine) { .btn:hover { … } } /* 仅真鼠标设备启用 hover */
@media (prefers-color-scheme: dark) { }    /* 深色模式 */
@media (prefers-reduced-motion: reduce) { }/* 减弱动态 */
@media (min-resolution: 2dppx) { }         /* 2x 及以上屏（高清图兜底场景） */
```

### 2.3 视口单位与 clamp()

```css
/* 单位家族：vw=视口宽1%，vh/dvh/svh/lvh=四种高度基准，vmin/vmax=短/长边 */
.hero { height: 100dvh; }   /* 动态视口高：地址栏收放时实时跟随，移动端首选 */

/* clamp(最小值, 首选值, 最大值) —— 流体排版一行搞定 */
h1 { font-size: clamp(1.5rem, 4vw + 1rem, 3rem); }
/* 首选值 4vw+1rem：随视口线性增长；被两端钳制，永不小于 1.5rem、大于 3rem */
```

### 2.4 容器查询

```css
/* ① 声明容器：inline-size 追踪容器"行内方向"尺寸 */
.card-area { container-type: inline-size; container-name: card-area; }

/* ② 查询容器：@container 内的规则按"最近的命名容器"求值 */
@container card-area (min-width: 480px) {
  .card { display: flex; gap: 16px; }   /* 容器够宽 → 横排卡 */
  .card img { width: 160px; }
}
/* 容器单位 cqw/cqh/cqi：容器宽/高的 1%（类似 vw，但以容器为基准） */
.card h3 { font-size: clamp(1rem, 6cqi, 1.5rem); }
```

### 2.5 逻辑属性

```css
/* 物理属性（left/right）→ 逻辑属性（inline 轴 = 文字流方向；block 轴 = 块堆叠方向） */
.item {
  margin-inline-start: 12px;   /* LTR=左，RTL=右：一套代码自动镜像 */
  padding-block: 8px;          /* 上下 */
  inset-inline-start: 0;       /* 逻辑方向的 left/right 定位 */
  text-align: start;           /* 起始对齐，代替 left */
}
[dir="rtl"] .item { /* 通常什么都不用写——逻辑属性已自动镜像 */ }
```

### 2.6 响应式图片

```html
<!-- srcset + sizes：同一张图的多个分辨率，浏览器按"视口×DPR"自选 -->
<img
  srcset="photo-480.svg 480w, photo-960.svg 960w, photo-1440.svg 1440w"
  sizes="(min-width: 1024px) 33vw, 100vw"
  src="photo-960.svg" alt="产品图">
<!-- sizes 告诉浏览器"这张图最终会以多宽显示"：≥1024px 视口时占三分之一宽，否则全宽 -->

<!-- picture：art direction——不同视口"裁不同构图"，甚至换格式（avif/webp 兜底链） -->
<picture>
  <source media="(min-width: 800px)" srcset="wide.svg">
  <source media="(min-width: 400px)" srcset="square.svg">
  <img src="narrow.svg" alt="Banner"> <!-- 兜底：最老环境也能显示 -->
</picture>
```

---

## 3. 浏览器兼容性

> 以下为大致基线（依据 caniuse 数据整理，仅作选型参考，上线前请以实际目标用户环境为准）。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| viewport meta | 全版本 | 12+ | 全版本 | 全版本 | 移动浏览器核心机制 | 只对移动/模拟器生效；桌面忽略 |
| 媒体查询（min/max） | 全版本 | 12+ | 全版本 | 全版本 | 基础能力 | 值带单位（`min-width:0` 可省单位但建议写全） |
| Level 4 区间语法 `(400px <= width)` | 104 | 104 | 102 | 16.4 | 较新 WebView 可用 | 旧浏览器整条规则丢弃；渐进使用 |
| `vw / vh` | 全版本 | 12+ | 全版本 | 全版本 | 可用但 **100vh 有地址栏坑** | iOS Safari 的 100vh 含被地址栏遮挡区域 |
| `dvh / svh / lvh` | 108 | 108 | 101 | 15.4 | 现代 WebView 可用 | 旧系统回退 `100vh` + JS 修正方案 |
| `clamp() / min() / max()` | 79 | 79 | 75 | 13.1 | 2020 年后设备基本全覆盖 | 表达式内可混用单位；除法要求除数为纯数字 |
| 容器查询 `@container` | 105 | 105 | 110 | 16 | iOS 16+ / Android Chrome 105+ | **响应式组件的新基线**；老环境需媒体查询降级 |
| `container-type / cqw 单位` | 105 | 105 | 110 | 16 | 同上 | 声明 container-type 后容器**成为独立布局上下文**（size 型还会固定高度） |
| 逻辑属性 `margin-inline` 等 | 87 | 87 | 66 | 14.1 | 现代移动内核可用 | 老环境需物理属性回退（PostCSS 插件可自动处理） |
| `srcset / sizes` | 34 | 79 | 38 | 9 | 移动端普遍支持 | 依赖 `sizes` 声明准确，否则选图偏大/偏小 |
| `picture / source` | 38 | 79 | 38 | 9.1 | 普遍支持 | `source` 的 `media` 与 CSS 媒体查询语义一致 |

---

## 4. 使用场景示例

### 4.1 场景一：移动优先的卡片栅格（媒体查询标准范式）

**场景描述**：商品列表手机单列、平板两列、桌面四列——从窄到宽逐步增强。

```css
/* 基础样式即"最窄可用"：手机单列，无需任何查询 */
.product-grid {
  display: grid;
  grid-template-columns: 1fr;   /* 手机：单列 */
  gap: 12px;
}
/* 断点用 em（相对用户字号），48em ≈ 768px @ 16px */
@media (min-width: 48em) {
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
}
@media (min-width: 80em) {
  .product-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
}
/* 桌面端才有的 hover 效果，包一层 hover 媒体特性防止触屏"粘滞" */
@media (hover: hover) {
  .product-card:hover { transform: translateY(-4px); }
}
```

**逐段注释**：基础层不写任何查询——这是移动优先的核心；断点在"两列放不下/四列放不下"的临界处插入；`em` 断点跟随用户浏览器字号，缩放行为更一致。

**预期效果**：拖窄窗口列数减少、拖宽增加；触屏设备不出现悬停残留。

### 4.2 场景二：clamp() 流体标题（零断点排版）

**场景描述**：营销页大标题在 320px~2560px 之间连续缩放，不写一档媒体查询。

```css
.hero-title {
  /* 数学：首选值 = 1rem 固定 + 5vw 流动；范围 [2rem, 4.5rem] */
  font-size: clamp(2rem, 5vw + 1rem, 4.5rem);
  line-height: 1.15;            /* 大字号压紧行高 */
}
.hero-sub {
  font-size: clamp(0.95rem, 0.5vw + 0.85rem, 1.25rem); /* 副标题波动更小 */
}
```

**预期效果**：窗口从手机拖到 4K，标题平滑放大；两端被钳制，极端屏宽下不失控。

### 4.3 场景三：容器查询驱动的自适应卡片

**场景描述**：同一张用户卡组件，放进侧栏（约 260px）自动竖排，放进主内容区（约 700px）自动横排——组件自己知道该怎么办。

```css
/* 容器声明 */
.demo-wrap { container-type: inline-size; }

/* 组件默认（窄容器）：竖排 */
.profile { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.profile .avatar { width: 72px; height: 72px; }

/* 容器宽 ≥ 420px：切换横排，头像变方图 */
@container (min-width: 420px) {
  .profile { flex-direction: row; text-align: left; }
  .profile .avatar { width: 120px; height: 120px; border-radius: 14px; }
}
```

**逐段注释**：查询条件不是视口而是**容器宽度**——同一个组件在页面任何位置都自动选对布局；`container-type: inline-size` 的元素其**高度仍由内容决定**（只有 inline 轴被锁定追踪），日常组件首选它而不是 `size`。

**预期效果**：拖动容器宽度，卡片在"竖排头像居中"与"横排左对齐"之间平滑切换，视口宽度无关。

### 4.4 场景四：响应式图片（srcset + sizes / picture）

**场景描述**：首屏 banner 桌面用宽幅构图、手机用方形构图；产品图按视口与 DPR 自动选分辨率。

```html
<!-- 构图自适应：不同断点换不同裁切 -->
<picture>
  <source media="(min-width: 800px)" srcset="banner-wide.svg">
  <img src="banner-square.svg" alt="夏季大促">
</picture>

<!-- 分辨率自适应：浏览器按 sizes 声明 × DPR 挑最小的够用文件 -->
<img
  srcset="shoe-400.svg 400w, shoe-800.svg 800w, shoe-1600.svg 1600w"
  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
  src="shoe-800.svg" alt="跑鞋">
```

**逐段注释**：`sizes` 是"提前告诉浏览器这张图显示多宽"（否则浏览器只能按 100vw 猜，必选偏大文件）；`picture` 的 source 从上到下匹配第一个命中的 `media`，`img` 永远是兜底。

**预期效果**：宽屏加载宽幅 banner 与高分辨率图，窄屏/低 DPR 设备只下载小文件——省流量且清晰。

### 4.5 场景五：逻辑属性 RTL 适配

```css
.breadcrumb { display: flex; gap: 8px; padding-inline-start: 4px; }
.breadcrumb .sep { margin-inline: 4px; }
/* html dir="rtl"（如阿拉伯语）时以上全部自动镜像，无需额外规则 */
```

**预期效果**：把示例页 `<html dir="rtl">` 后，间距、对齐、图标位置整体镜像，零重复代码。

---

## 5. 实际应用案例分析

### 案例一：电商首页改版——"内容驱动断点 + 容器查询"落地

**需求**：首页包含轮播、楼层商品网格、侧边购物车、页脚；要求 320px~4K 全覆盖，且楼层组件要在运营拖拽的任意栏宽下可用。

**方案选型**：

- **页面骨架**用移动优先媒体查询 + 少量区间语法，断点仅 3 档（48em/64em/80em），全部由"设计稿在何处开始破版"反推，而不是设备型号表。
- **楼层组件**（商品网格/秒杀条/榜单卡）内部全部改用**容器查询**：运营把同一组件拖进半宽栏或全宽栏，布局自动适配，不再需要"组件 × 栏宽"的组合媒体查询。
- **字号/间距**用 `clamp()` + CSS 变量（`--space: clamp(8px, 2vw, 20px)`），全局只有 1 个流体参数，换主题只改变量。
- **图片**：商品图统一 `srcset(400/800/1200w) + sizes`；banner 用 `picture` 区分宽幅/方形构图；骨架屏用 `aspect-ratio` 固定占位，杜绝加载抖动（CLS）。

**踩坑记录**：

1. **100vh 首屏被地址栏吃掉**：移动端首屏 banner 用 `height: 100vh` 底部按钮被遮。解法：`100dvh` 并保留 `100vh` 作回退（老系统忽略 dvh）。
2. **容器查询后"高度塌陷"**：某卡片容器误用 `container-type: size`，高度不再由内容撑开。解法：size 只用于"高度也参与查询"的场景，组件默认一律 `inline-size`。
3. **断点竞态**：楼层内容器查询与页面媒体查询叠加，出现"页面是两列、组件以为自己是宽容器"的过度横排。解法：约定"**布局归属**"——页面级断点只管栏宽分布，组件内部呈现全权交给容器查询，禁止组件里再写视口查询。
4. **RTL 客诉**：中东站图标箭头（`→`）没有镜像。解法：方向性图标用 CSS 逻辑属性定位 + `transform: scaleX(-1)` 配合 `:dir()`/`[dir]` 选择器翻转，文本类箭头换用逻辑字符或 SVG。

### 案例二：中后台工作台——多面板自适应与视口单位治理

**需求**：数据工作台左侧导航、中间表格、右侧详情三面板；1440px 以下详情收起为抽屉，表格列在窄屏自动降级。

**方案选型**：三栏用 `grid-template-columns: auto minmax(0, 1fr) clamp(280px, 24vw, 380px)`（详情栏宽度流体但被钳制）；窄屏收起用一条媒体查询切换 grid 区域；表格窄屏降级用"卡片化"（每行变一张卡，字段名用伪元素标注）；高度全部 `dvh` 化（`calc(100dvh - header高)`）替代 `100vh` + JS 计算的旧方案。

**踩坑记录**：

1. **minmax(0,1fr) 必写**：1fr 默认 min-width:auto，表格内容长会把中间栏撑爆。显式 `minmax(0, 1fr)` 是 grid 中后台布局的安全带。
2. **大屏字号失控**：4K 显示器上 16px 表格字太小，盲目全局放大又破坏紧凑感。解法：根元素 `font-size: clamp(14px, 0.35vw + 12px, 18px)`，全站 em/rem 跟随，密度面板用户可手动覆盖。
3. **报表大屏与工作台冲突**：同一套大屏组件塞进工作台侧栏后溢出。解法：大屏组件内部也容器查询化，侧栏放自动降密度（隐藏次要指标）。

---

## 6. 最佳实践与常见坑

1. **viewport meta 是第一行响应式代码**：缺了它，移动端一切媒体查询都在 980px 虚拟视口上失效；同时**不要**设置 `user-scalable=no`（无障碍红线）。
2. **移动优先**：基础样式写最窄屏，`min-width` 向上增强；与桌面优先相比，CSS 更短、移动端不用下载用不到的规则。
3. **断点跟着内容走**：在"开始变丑"的宽度插断点（拖窗口实测），常用 3~5 档足够；不要为每台设备建断点。
4. **100vh 的地址栏陷阱**：移动端全屏区块用 `min-height: 100vh; min-height: 100dvh;` 双写（新单位覆盖、旧单位兜底）。
5. **clamp() 的首选值要带"固定底座"**：`4vw + 1rem` 比 `4vw` 好——小屏不至于过小，公式两端再钳制， fluids 才可控。
6. **容器查询优先 `inline-size`**：`size` 会切断容器高度的内容自适应，只在确实要按高度查询时使用；容器名 + `@container name (…)` 防止跨组件误匹配。
7. **hover 一律包 `@media (hover: hover)`**：触屏没有真正的 hover，不包会出现"点一次粘住"的假死感。
8. **`sizes` 声明要真实**：srcset 的省流量效果完全依赖 sizes 的准确性；布局改版时同步更新，否则浏览器会下载过大的图。
9. **逻辑属性替换物理属性**：新代码直接写 `margin-inline-start / padding-block / inset-inline`，RTL 需求零成本；老项目可用 PostCSS logical 插件自动转换。
10. **图片必须有占位**：`width/height` 属性或 `aspect-ratio` 固定宽高比，避免图片加载完成时页面跳动（CLS 是 Core Web Vitals 硬指标）。
11. **测试矩阵**：DevTools 设备模拟器 + 真机各一台 + 拖拽窗口极限（300px 与 4000px）+ 系统深色模式/减弱动态 + `dir="rtl"` 预览，一个都别省。
12. **别用 JS 算响应式**：凡是用 `resize` 监听改布局的地方，90% 可以用媒体查询/容器查询/clamp 表达；剩下的交给 ResizeObserver。

---

## 7. 参考资料

- MDN — 视口概念：https://developer.mozilla.org/zh-CN/docs/Web/CSS/Viewport_concepts
- MDN — 使用媒体查询：https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_media_queries/Using_media_queries
- MDN — `clamp()`：https://developer.mozilla.org/zh-CN/docs/Web/CSS/clamp
- MDN — CSS 容器查询：https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_containment/Container_queries
- MDN — CSS 逻辑属性与值：https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_logical_properties_and_values
- MDN — 响应式图片：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Responsive_images
- web.dev — 响应式设计课程：https://web.dev/learn/design
- web.dev — 动态视口单位（dvh/svh/lvh）：https://web.dev/learn/design/viewport-units
- CSS 规范 — CSS Conditional Rules（媒体/容器查询）：https://drafts.csswg.org/css-conditional-3/
- caniuse — Container Queries：https://caniuse.com/css-container-queries
- caniuse — viewport units (dvh/svh/lvh)：https://caniuse.com/viewport-unit-variants
