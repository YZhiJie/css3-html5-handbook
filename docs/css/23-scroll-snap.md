# 滚动吸附 Scroll Snap

> 面向前端开发人员的 CSS3 高级特性参考资料 —— Scroll Snap 让「滚动到某处自动停稳在预定位置」成为纯 CSS 能力：容器声明 `scroll-snap-type`，子项声明 `scroll-snap-align`，浏览器接管惯性、方向与落点计算。轮播图、卡片流、整屏翻页、时间轴选择器，从此告别 JS 滚动监听与手写惯性算法。

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
| [index-01-scroll-snap.html](../../examples/css/23-scroll-snap/index-01-scroll-snap.html) | 水平卡片流 + 整屏翻页 + 图片轮播 + mandatory/proximity 对比 + scroll-padding 避让固定头 |

---

## 1. 概念解释

### 1.1 Scroll Snap 是什么

Scroll Snap 是一组 CSS 属性，让滚动容器在滚动结束时**自动吸附到预设的「吸附点」**：

```css
.gallery {
  overflow-x: auto;
  scroll-snap-type: x mandatory;   /* 容器：水平方向，强制吸附 */
}
.gallery > * {
  scroll-snap-align: center;       /* 子项：以中心作为吸附点 */
}
```

用户松手（或惯性滚动衰减）后，浏览器会把容器**平滑地停**在最近的吸附点上，而不是停在两个卡片中间的尴尬位置。

### 1.2 解决什么问题

| 痛点 | 传统方案 | Scroll Snap 方案 |
| --- | --- | --- |
| 轮播图停在两张图中间 | scroll 事件 + debounce + `scrollTo` 计算落点 | `scroll-snap-type: x mandatory` 一行 |
| 移动端卡片流滑动手感差 | 引入 swiper 库（几十 KB + 大量触摸事件处理） | 原生吸附 + 浏览器原生惯性 |
| 整屏翻页需精确控制滚动 | 拦截 wheel/touchmove 手动翻页 | `y mandatory` + 每屏 `align: start` |
| 固定头部遮挡吸附后的内容 | JS 补偿偏移 | `scroll-padding-top` 纯 CSS |
| JS 禁用时轮播完全失效 | —— | 纯 CSS，天然优雅降级 |

### 1.3 底层原理

- **吸附点（snap positions）**：由子项的 `scroll-snap-align` 决定。`center` 表示「子项中心对齐容器吸附口中心」，`start` 表示「子项起始边对齐吸附口起始边」。
- **吸附口（snapport）**：容器的可视滚动区域，可以用 `scroll-padding` 向内收缩——固定头部场景的关键。
- **mandatory vs proximity**：滚动结束后，浏览器计算「如果不吸附，停在哪」。`mandatory` **强制**吸附到最近吸附点；`proximity` 只在「停点离吸附点足够近」（阈值由浏览器定）时才吸附。
- **滚动仍在主线程**：吸附由滚动引擎直接完成，不经过 JS 回调，因此 60fps 手感与原生一致；`scroll-snap-stop: always` 可以在快速甩动时强制逐项停靠（如日期选择器不能跳月）。

## 2. 语法说明

### 2.1 容器属性：scroll-snap-type

```css
.scroller {
  scroll-snap-type: x mandatory;
  /*            方向 ┘      └ 严格度 */
}
```

| 值 | 含义 |
| --- | --- |
| `none`（默认） | 不吸附 |
| `x` / `y` | 仅水平 / 仅垂直方向吸附 |
| `block` / `inline` | 按书写模式的块轴 / 行内轴 |
| `both` | 两个方向都吸附 |
| `mandatory` | 滚动结束后**必须**吸附到某个吸附点 |
| `proximity` | 停点离吸附点较近时才吸附（阈值由 UA 决定） |

**必须同时指定方向与严格度**才有意义（`scroll-snap-type: x` 单独写等价于 `none` 之前的默认值行为，实际规范中缺省严格度是 `none`，不会吸附）。

### 2.2 子项属性：scroll-snap-align

```css
.card {
  scroll-snap-align: center;      /* 单值：两轴同用 */
  scroll-snap-align: start end;   /* 双值：block轴 inline轴 */
}
```

| 值 | 含义 |
| --- | --- |
| `none` | 该项不提供吸附点 |
| `start` | 子项起始边对齐吸附口起始边 |
| `center` | 中心对中心 |
| `end` | 结束边对结束边 |

### 2.3 子项属性：scroll-snap-stop

```css
.month {
  scroll-snap-stop: always;   /* 快速甩动时也必须在本项停一下 */
}
```

- `normal`（默认）：快速滚动可以**越过**本吸附点直接停到更远的吸附点。
- `always`：强制停靠——适合「逐月/逐页」语义，防止一甩跳过三个月。

### 2.4 避让偏移：scroll-padding 与 scroll-margin

```css
/* 容器：吸附口向内收缩，给固定头部留位 */
.scroller {
  scroll-padding-top: 72px;   /* 固定头高 72px */
}

/* 子项：该项的吸附点外扩，留呼吸感 */
.card {
  scroll-margin: 12px;
}
```

- `scroll-padding` 写在**容器**上，收缩吸附口；`scroll-margin` 写在**子项**上，扩张该项的吸附边界。
- 这组属性同时影响 `scrollIntoView()`、锚点跳转、键盘分页——一处声明，处处生效。

### 2.5 完整范式（水平卡片流）

```css
.card-row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 16px;   /* 首尾卡片也能完整居中 */
  overscroll-behavior-x: contain; /* 可选：防止链式滚动穿透 */
  scrollbar-width: none;          /* 可选：隐藏滚动条 */
}
.card-row > .card {
  flex: 0 0 78%;
  scroll-snap-align: center;
  scroll-snap-stop: always;
}
```

## 3. 浏览器兼容性

| 浏览器 | 支持版本 | 说明 |
| --- | --- | --- |
| Chrome / Edge | 69+（2018） | 全功能 |
| Safari | 11+（部分）/ 14.1+（`scroll-padding` 等全量） | iOS 11+ 可用，旧版需 `-webkit-` 前缀场景已基本消失 |
| Firefox | 68+（2019） | 全功能 |

Scroll Snap 是**早已全绿**的成熟特性，可直接用于生产；不支持的古董浏览器退化为普通滚动（功能可用，只是不吸附）。

```css
/* 可选：能力检测 */
@supports (scroll-snap-type: x mandatory) {
  .card-row { scroll-snap-type: x mandatory; }
}
```

## 4. 使用场景示例

### 4.1 水平卡片流（移动端常见）

```css
.h-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 20px;
}
.h-scroll > article {
  flex: 0 0 76%;
  scroll-snap-align: center;
}
```

### 4.2 整屏翻页（landing page）

```css
.pages {
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
}
.pages > section {
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;   /* 一屏一停，不连跳 */
}
```

### 4.3 图片轮播（纯 CSS）

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;          /* 锚点跳转也平滑 */
}
.carousel > img {
  width: 100%;
  flex: none;
  scroll-snap-align: center;
}
```

配合 `<a href="#slide-2">` 锚点链接，连「第 N 张」导航都可以零 JS。

### 4.4 mandatory 与 proximity 的选择

```css
/* 列表高度不一、内容优先：proximity 不挡路 */
.article-list {
  scroll-snap-type: y proximity;
}
.article-list h2 {
  scroll-snap-align: start;   /* 滚到标题附近时轻轻吸住 */
}
```

### 4.5 固定头部避让

```css
.doc {
  overflow-y: auto;
  scroll-snap-type: y proximity;
  scroll-padding-top: 64px;   /* 固定导航高 64px */
}
.doc h2 {
  scroll-snap-align: start;
}
```

## 5. 实际应用案例分析

**场景：电商 App 的「商品图集 + 规格选择器」。**

旧实现：引入 swiper 库处理图片横滑；规格选择器（尺码/颜色横排）用 JS 监听 `touchend` + 惯性模拟 + `scrollTo` 校正落点，共 300+ 行触摸逻辑；快速甩动经常停在两个尺码中间，点击区域错位引发客诉。

迁移后：

1. **图集**：`scroll-snap-type: x mandatory` + 每图 `align: center`，原生惯性，删库。
2. **规格选择器**：每个尺码 `align: center` + `scroll-snap-stop: always`——快速甩动逐项停靠，永不错位。
3. **当前项高亮**：`IntersectionObserver`（root 设为选择器容器，threshold 0.6）替代 scroll 数学计算，与吸附天然对齐。

收益：触摸处理代码清零、低端机帧率从 40 回升到 60、甩动错位 bug 清零。

## 6. 最佳实践与常见坑

1. **mandatory 陷阱——内容高于视口时滚不到**：`y mandatory` 的整屏翻页里，如果某一屏内容**超过 100vh**，中间部分可能永远无法停留（滚过去就被吸回来）。解法：内容不定高时用 `proximity`，或只给「屏首」元素设吸附点。
2. **`scroll-padding` 与固定头/尾**：吸附后内容被固定导航挡住，几乎必踩——一律给容器补 `scroll-padding-top`。
3. **首尾卡片贴边**：flex 横滑首尾两张无法居中——容器加 `scroll-padding-inline`，或首尾补一个 `flex: 0 0 Npx` 的占位伪元素。
4. **`scroll-snap-stop: always` 别滥用**：它让快速滚动「每一步都停」，长列表会明显感觉「滚不动」。只在语义上必须逐项的场景用（日历月、整屏页）。
5. **与 `scroll-behavior: smooth` 的搭配**：smooth 影响锚点跳转与 `scrollTo`，吸附影响松手落点，两者正交可叠加；但「正在 smooth 滚动时用户触摸」会打断动画，属正常行为。
6. **键盘与无障碍**：吸附容器保持原生 `Tab`/方向键滚动能力；给子项加 `tabindex` 或链接语义时，`scroll-padding`/`scroll-margin` 同样作用于聚焦滚动，别忘设。
7. **嵌套滚动**：横滑卡片流嵌在竖滚页面里，给横滑容器加 `overscroll-behavior-x: contain`，防止横向滑到底后「链式」带动页面竖滚。
8. **不要混用 JS 校正**：`scroll` 事件里再 `scrollTo` 会与浏览器吸附打架，出现「抖动」。要么纯 CSS，要么 `scroll-snap-type: none` 后完全 JS 接管，别两头发力。

## 7. 参考资料

- [CSS Scroll Snap Module Level 1（W3C）](https://www.w3.org/TR/css-scroll-snap-1/)
- [MDN：CSS Scroll Snap](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap)
- [MDN：scroll-snap-type](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type)
- [web.dev：CSS Scroll Snap](https://web.dev/articles/css-scroll-snap)
- 相关文档：[Observer 三件套（HTML 篇 11）](../html/11-observers.md) ｜ [动画与过渡（CSS 篇 02）](02-animation-transition.md) ｜ [滚动驱动动画（CSS 篇 15）](15-scroll-driven-animations.md)
