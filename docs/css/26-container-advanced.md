# @container 进阶（Style Queries · 容器单位 · 组合技）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 基础容器查询回答「容器有多宽」，进阶三件套回答更多：style queries 查「容器是什么状态」，容器单位让组件内部随容器缩放，与 @scope 组合实现真正的组件级样式自治。

前置阅读：[docs/css/12-container-queries.md](12-container-queries.md)（容器查询基础）、[docs/css/19-scope.md](19-scope.md)（@scope 作用域）。

## 目录

- [1. 概念解释](#1-概念解释)
- [2. 语法说明](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（单文件 HTML，双击即开）：

| 示例文件 | 演示内容 |
| --- | --- |
| [index-01-container-advanced.html](../../examples/css/26-container-advanced/index-01-container-advanced.html) | style queries 主题切换 + 容器单位排版 + 嵌套命名容器 + @container × @scope 组合 |

---

## 1. 概念解释

### 1.1 基础容器查询的边界

基础章解决了「按容器尺寸换布局」，但组件自治还有两个缺口：

1. **查不了状态**：卡片在「暗色侧栏」里该换配色——这是**容器的样式状态**，不是尺寸。尺寸查询做不到。
2. **缩放不精准**：想让标题字号随容器宽度平滑变化，用 `vw` 会被视口绑架，得用**容器单位**。

### 1.2 进阶三件套

| 能力 | 回答的问题 | 关键语法 |
| --- | --- | --- |
| **Style Queries** | 容器的 CSS 自定义属性是什么值？ | `@container style(--theme: dark)` |
| **容器单位** | 组件内部元素如何随容器缩放？ | `cqw / cqh / cqi / cqb / cqmin / cqmax` |
| **命名嵌套** | 嵌套容器里查的是哪一层？ | `container-name` + `@container 名字` |

---

## 2. 语法说明

### 2.1 Style Queries：按容器样式查样式

```css
/* 容器：普通元素即可，不需要 container-type: inline-size */
.sidebar {
  --theme: dark;
}

/* 后代：查最近祖先的自定义属性值 */
@container style(--theme: dark) {
  .card {
    background: #1e293b;
    color: #e2e8f0;
  }
}
```

关键点：

- **查询对象是自定义属性（`--*`）的值**，不能查普通属性（`style(background: red)` 无效）。
- 容器**无需声明 `container-type`**——所有元素默认都是 style 查询容器（`container-type: normal` 的默认行为）。
- 未设置的自定义属性回退到初始值（guaranteed-invalid 或 `inherits` 注册值），`style(--theme: dark)` 不匹配未定义状态。

### 2.2 容器单位全家族

| 单位 | 含义 | 典型用途 |
| --- | --- | --- |
| `cqw` | 容器宽度的 1% | 水平方向尺寸 |
| `cqh` | 容器高度的 1% | 垂直方向尺寸 |
| `cqi` | 容器**内联**尺寸 1%（随 writing-mode） | 横向排版（推荐） |
| `cqb` | 容器**块向**尺寸 1% | 纵向排版 |
| `cqmin` | `min(cqi, cqb)` | 取小边，防溢出 |
| `cqmax` | `max(cqi, cqb)` | 取大边，铺满 |

```css
.card h3 {
  /* 容器宽 400px 时字号 = 20px，容器宽 800px 时 = 40px */
  font-size: clamp(16px, 5cqi, 40px);
}
```

**单位参照的是「最近的尺寸容器」**——没有容器时回退到小视口单位（`cqi` → `vi`）。

### 2.3 命名容器与嵌套规则

```css
.outer { container: outer / inline-size; }
.inner { container: inner / inline-size; }

/* 不点名：查最近的任意尺寸容器（.inner） */
@container (min-width: 300px) { ... }

/* 点名：跳过 .inner 直接查 .outer */
@container outer (min-width: 600px) { ... }
```

组合条件与范围语法同样可用：`@container card (400px <= width <= 800px)`。

### 2.4 与 @scope 组合

```css
/* 组件样式封装在作用域内，断点由容器查询提供 */
@scope (.card) to (.card *) {
  :scope { display: grid; gap: 2cqi; }
}
@container card (min-width: 480px) {
  @scope (.card) {
    :scope { grid-template-columns: 120px 1fr; }
  }
}
```

`@container` 管「何时变」，`@scope` 管「影响谁」——组件真正实现「装哪美哪」。

---

## 3. 浏览器兼容性

| 特性 | Chrome | Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| 尺寸容器查询 | 105+ | 105+ | 110+ | 16.0+ |
| 容器单位 | 105+ | 105+ | 110+ | 16.0+ |
| **Style Queries**（自定义属性） | 111+ | 111+ | **不支持（2026 初仍标记开发中）** | 18.0+ |

> Style Queries 是三者中兼容性最弱的，生产环境用 `@supports` 或渐进增强。

---

## 4. 使用场景示例

### 场景 1：暗色侧栏自适应（Style Queries）

```css
.sidebar-dark { --theme: dark; }
.sidebar-light { --theme: light; }

@container style(--theme: dark) {
  .user-card { background: #1e293b; border-color: #334155; }
}
```

同一个 `.user-card`，拖进暗色侧栏自动换深色皮肤——不需要给卡片传 class。

### 场景 2：流式组件排版（容器单位）

```css
.card { container-type: inline-size; }
.card h3 { font-size: clamp(15px, 4.5cqi, 28px); }
.card p  { font-size: clamp(12px, 3cqi, 16px); }
```

卡片放大缩小时，内部文字比例始终协调——`clamp` 兜底极值。

### 场景 3：嵌套仪表盘（命名容器）

```css
.dashboard { container: dashboard / inline-size; }
.widget    { container: widget / inline-size; }

/* widget 自己变布局查 widget；widget 换配色查 dashboard 宽度 */
@container widget (min-width: 400px) { .widget-inner { flex-direction: row; } }
@container dashboard (max-width: 800px) { .widget-inner { border-radius: 8px; } }
```

---

## 5. 实际应用案例分析

**设计系统卡片组件**：一张「文章卡片」要同时服务三处——首页瀑布流（容器约 360px）、详情页侧栏（约 280px）、搜索页横排列表（约 720px）。

- 尺寸断点：`@container card (min-width: 500px)` 切横排（封面左、文字右）。
- 状态适配：运营位有时套暗色背景——容器加 `--theme: dark`，卡片用 style query 换配色，业务方零感知。
- 排版缩放：标题 `font-size: clamp(16px, 5cqi, 24px)`，任何容器宽度下比例自然。

结果：组件零 props 零 class 约定，样式策略全部自包含。

---

## 6. 最佳实践与常见坑

1. **style queries 只认自定义属性**：把组件状态设计成 `--theme`、`--density` 等自定义属性开关，普通属性查不了。
2. **容器单位必须有容器**：没有尺寸容器时 `cqi` 退化为视口单位，组件在「裸奔」场景下会失控——组件根元素或其包裹层始终声明 `container-type`。
3. **命名防串台**：嵌套场景永远写 `@container 名字 (条件)`，不点名的查询会命中最近的容器，层级一深就乱。
4. **cqi 优先于 cqw**：国际化页面考虑竖排 writing-mode，`cqi/cqb` 是逻辑方向，比物理方向 `cqw/cqh` 健壮。
5. **Style Queries 渐进增强**：Firefox 未支持时，用 `@supports` 包一层并提供 class 回退方案。

---

## 7. 参考资料

- [MDN — CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [MDN — Container query length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length#container_query_length_units)
- [CSS Containment Module Level 3 — Style Queries](https://drafts.csswg.org/css-contain-3/#style-container)
- [caniuse — CSS Container Queries (Size)](https://caniuse.com/css-container-queries)
- [caniuse — CSS Container Style Queries](https://caniuse.com/css-container-queries-style)
