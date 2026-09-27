# 容器查询（Container Queries）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 容器查询把响应式的决策权从"浏览器视口"下放到"组件容器"：同一张卡片放进侧栏竖排、放进主区横排，组件自己说了算。媒体查询回答"屏幕多宽"，容器查询回答"我占了多少空间"。

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
| [index-01-container-queries.html](../../examples/css/12-container-queries/index-01-container-queries.html) | 容器查询基础语法 + 卡片组件自适应 + 容器嵌套 + 容器单位 |

---

## 1. 概念解释

### 1.1 容器查询是什么

**容器查询（Container Queries）** 允许一个元素根据**其直接祖先容器**的尺寸（而非整个视口）来应用样式。它把响应式从"全局断点"推向"组件级断点"。

媒体查询的模型：

```
视口 1200px ──→ @media (min-width: 1200px) { .card { ... } }
              所有 .card 同时响应，不管它们实际装在哪儿
```

容器查询的模型：

```
侧边栏 300px 里的 .card ──→ 竖排（图标在上，文字在下）
主区域 900px 里的 .card  ──→ 横排（图标在左，文字在右）
同一个 .card 组件，在不同容器中自动切换布局
```

### 1.2 解决什么问题

- **组件复用**：设计系统中的卡片、列表项、仪表盘小组件需要在多种布局上下文中保持可用。
- **解除视口依赖**：侧边栏折叠展开、多栏布局的列宽变化，不影响主内容区组件的响应规则。
- **自包含的组件**：组件自带"布局策略"，消费者只需把它放进容器，无需额外写媒体查询。

### 1.3 底层原理

浏览器在布局阶段为标记了 `container-type` 的元素建立**容器框（container box）**。后代元素中的 `@container` 规则在样式计算时，查询最近匹配的容器框的**逻辑尺寸**（默认是内联尺寸 = 宽度）。

关键点：

1. **容器必须是尺寸容器**：`container-type: inline-size`（水平方向）或 `size`（水平和垂直）。普通元素不会自动成为容器。
2. **查询的是容器的逻辑尺寸**：默认按 `writing-mode` 下的内联轴（通常即宽度）。
3. **容器单位 `cqw/cqh/cqi/cqb`**：`1cqw` = 容器宽度的 1%，`1cqi` = 容器内联尺寸的 1%（受书写模式影响）。

---

## 2. 语法说明

### 2.1 声明容器：`container-type` 与 `container-name`

```css
/* 让元素成为水平方向上的尺寸容器 */
.card-wrapper {
  container-type: inline-size;
}

/* 同时命名容器（推荐，避免后代误匹配） */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* 简写 */
.card-wrapper {
  container: card / inline-size;
}
```

| 值 | 含义 |
| --- | --- |
| `normal` | 默认值，不是尺寸容器，但可作为样式查询容器 |
| `size` | 水平和垂直方向都是尺寸容器（后代可用 `cqw`/`cqh`） |
| `inline-size` | 仅内联轴（通常宽度）是尺寸容器，最常用 |
| `block-size` | 仅块轴（通常高度）是尺寸容器 |

`container-name` 用于限定 `@container` 只匹配特定名称的容器，防止组件嵌套时外层容器干扰内层。

### 2.2 查询容器：`@container`

```css
@container (min-width: 400px) {
  .card { flex-direction: row; }
}

@container card (min-width: 400px) {
  .card { flex-direction: row; }
}

@container card (400px <= width < 700px) {
  .card { flex-direction: row; gap: 16px; }
}
```

语法与媒体查询几乎一致，可用 `and`、`or`、`not`，支持范围语法 `400px <= width < 700px`。

### 2.3 容器单位

| 单位 | 含义 |
| --- | --- |
| `cqw` | 容器宽度的 1% |
| `cqh` | 容器高度的 1% |
| `cqi` | 容器内联尺寸的 1%（`writing-mode: horizontal-tb` 时 = `cqw`） |
| `cqb` | 容器块尺寸的 1% |
| `cqmin` | `min(cqi, cqb)` |
| `cqmax` | `max(cqi, cqb)` |

典型用法：卡片标题字号随容器宽度缩放，但比 `clamp()` 更精准——它缩放的是**容器**宽度而非视口宽度。

```css
@container (min-width: 300px) {
  .card__title { font-size: clamp(1rem, 3cqi + 0.5rem, 1.5rem); }
}
```

### 2.4 样式查询（Style Queries）

```css
@container style(--theme: dark) {
  .card { background: #1e293b; color: #f8fafc; }
}
```

查询容器的**计算样式值**，而非尺寸。2024 年起在 Chromium 和 Firefox 中逐步支持，Safari 尚不支持（需谨慎）。

---

## 3. 浏览器兼容性

- **Chrome / Edge**：105+（2022-09）
- **Firefox**：110+（2023-02）
- **Safari**：16+（2022-09）

容器单位 `cqw/cqh/cqi/cqb` 与 `@container` 同时期落地。样式查询（Style Queries）支持度较低，生产环境建议渐进增强。

---

## 4. 使用场景示例

### 场景 1：卡片组件 —— 同一组件在侧栏与主区自动切换

```html
<div class="layout">
  <aside class="sidebar">
    <div class="card-wrapper">
      <article class="card">...</article>
    </div>
  </aside>
  <main class="main">
    <div class="card-wrapper">
      <article class="card">...</article>
    </div>
  </main>
</div>
```

```css
.card-wrapper { container: card / inline-size; }

.card {
  display: flex; flex-direction: column;
  gap: 12px; padding: 16px;
}

@container card (min-width: 400px) {
  .card { flex-direction: row; align-items: center; }
}
```

### 场景 2：仪表盘网格 —— 网格单元大小不一，每个单元内部组件自适应

```css
.dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.panel { container: panel / inline-size; }

@container panel (min-width: 400px) {
  .stat { display: grid; grid-template-columns: 1fr 1fr; }
}
```

### 场景 3：导航栏 —— 容器窄时只显示图标，宽时图标+文字

```css
.nav { container: nav / inline-size; display: flex; gap: 8px; }
.nav__label { display: none; }

@container nav (min-width: 600px) {
  .nav__label { display: inline; }
}
```

---

## 5. 实际应用案例分析

### 案例：设计系统卡片组件 —— 从"消费者写媒体查询"到"组件自带断点"

**背景**：某中后台设计系统的 `InfoCard` 组件被用在仪表盘、侧边栏、弹窗、抽屉等多种场景中。之前每张页面都要写媒体查询覆盖卡片的布局，导致样式碎片化。

**改造前**：

```css
/* 页面 A：仪表盘 */
@media (min-width: 768px) {
  .dashboard .info-card { flex-direction: row; }
}

/* 页面 B：侧边栏 */
@media (min-width: 1200px) {
  .sidebar .info-card { flex-direction: row; }
}
```

问题：断点数值是"猜"的——侧边栏里的卡片在 1200px 视口下可能只有 240px 宽，媒体查询误判。

**改造后**：

```css
/* 组件层 */
.info-card__wrapper { container: info-card / inline-size; }

.info-card {
  display: flex; flex-direction: column; gap: 12px;
}

@container info-card (min-width: 320px) {
  .info-card { flex-direction: row; }
}

@container info-card (min-width: 500px) {
  .info-card { flex-direction: row; gap: 24px; }
  .info-card__media { flex: 0 0 160px; }
}
```

页面消费者只需 `<div class="info-card__wrapper"><InfoCard /></div>`，无需关心断点。弹窗里 400px 宽自动横排，侧边栏 200px 宽自动竖排，都正确。

**收益**：

- 断点从 7 处页面媒体查询收敛到 2 处组件容器查询；
- 新增页面时零样式覆盖；
- 视觉走查时只需调组件一处。

---

## 6. 最佳实践与常见坑

1. **给容器命名**：`container: card / inline-size`，防止组件嵌套时外层容器干扰内层查询。
2. **不要在容器自身上应用 `container-type`**：`container-type` 应用于**包裹组件的容器**，而非组件根元素本身，否则尺寸计算会递归。
3. **尺寸容器需要明确的尺寸**：容器必须是正常块级/弹性/网格盒子，且不能是 `display: contents`；如果容器宽度由内容撑开，查询可能不稳定——建议配合 `min-width: 0` 或明确的网格轨道。
4. **与 Flex/Grid 的配合**：Flex 子项默认 `flex-shrink: 1`，容器可能缩到比预期小；给容器加 `min-width: 0` 让子项正常收缩。
5. **容器单位 vs clamp() 的选择**：`clamp()` 按视口缩放，适合全局排版；`cqw/cqi` 按容器缩放，适合组件内元素。两者可组合：`font-size: clamp(0.875rem, 2cqi + 0.5rem, 1.25rem)`。
6. **样式查询尚不成熟**：截至 2024，Safari 不支持 `@container style(...)`，若需跨浏览器，用 CSS 自定义属性 + 媒体查询回退。

---

## 7. 参考资料

- [MDN: CSS Container Queries](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_container_queries)
- [Can I use: CSS Container Queries](https://caniuse.com/css-container-queries)
- [CSS Spec: CSS Containment Module Level 3](https://drafts.csswg.org/css-contain-3/)
- [web.dev: Container queries land in all browsers](https://web.dev/articles/cq-stable)
