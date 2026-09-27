# View Transitions 进阶

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 在 SPA 单页 `startViewTransition` 基础上，View Transitions 进阶专题覆盖 MPA 跨页转场（`@view-transition { navigation: auto }`）、`view-transition-class` 批量复用动画、`view-transition-name` 作用域与重复名陷阱、`active-view-transition-type()` 类型化转场，以及手势驱动与滚动联动场景。与 [View Transitions 基础（CSS 篇 17）](17-view-transitions.md) 配合阅读，构成从入门到工程化的完整链路。

## 目录

- [1. 概念解释 —— 是什么、解决什么问题、底层原理](#1-概念解释)
- [2. 语法说明 —— 完整语法、属性/参数表、代码片段](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（单文件 HTML，双击即开；MPA 跨页示例需在 localhost 访问）：

| 示例文件 | 演示内容 |
| --- | --- |
| [index-01-view-transitions-advanced.html](../../examples/css/24-view-transitions-advanced/index-01-view-transitions-advanced.html) | view-transition-class 批量复用 + active-view-transition-type 类型化 + MPA 跨页提示 + 滚动联动手势 |

---

## 1. 概念解释

### 1.1 View Transitions 进阶是什么

基础篇（CSS 篇 17）已覆盖 SPA 场景：`document.startViewTransition(callback)` 在单页内通过拍快照实现 DOM 变化过渡。进阶专题解决「跨页面」「批量复用」「类型化控制」「手势联动」四类工程化需求。

| 能力 | 基础篇 | 进阶篇 |
| --- | --- | --- |
| 触发方式 | JS 调用 `startViewTransition` | CSS `@view-transition { navigation: auto }` 自动触发 |
| 适用范围 | 单页 SPA | MPA 多页、同站导航 |
| 动画复用 | 逐个元素写 `::view-transition-old/new` | `view-transition-class` 批量挂载同一套动画 |
| 类型区分 | 无 | `active-view-transition-type()` 按转场类型应用不同动画 |
| 手势联动 | 无 | 与滚动位置、手势进度联动 |

### 1.2 解决什么问题

- **MPA 页面切换像 PPT**：传统多页站点击链接后白屏闪切，体验远不如 SPA。跨页 View Transitions 让浏览器在 A 页和 B 页之间自动拍快照做补间，无需任何 JS 框架。
- **重复动画代码爆炸**：20 个卡片都需要「放大进入」动画，基础篇要写 20 组伪元素规则。`view-transition-class` 让同一类元素共享一套动画定义。
- **不同转场需要不同动画**：列表→详情用「放大」、暗色切换用「圆形扩散」、删除用「缩小消失」。`active-view-transition-type()` 让浏览器知道「现在是什么转场」，从而匹配对应的 CSS 动画。
- **滚动驱动转场**：用户滚动到某区域时触发 view transition，让滚动与视觉过渡无缝衔接。

### 1.3 底层原理

**跨页转场**：用户点击同站链接后，浏览器在卸载旧页面前抓取当前渲染快照，加载新页面后抓取新快照，在两快照之间执行与 SPA 相同的伪元素补间动画。

**伪元素树扩展**：

```
::view-transition                            ← 根
  ::view-transition-group(root)               ← 默认根组
  ::view-transition-group(card)               ← 命名元素组
    ::view-transition-image-pair(card)         ← 旧+新快照对
      ::view-transition-old(card)              ← 旧状态位图
      ::view-transition-new(card)              ← 新状态位图
```

**view-transition-class**：在元素上声明 `view-transition-class: zoom`，浏览器自动给该元素的过渡组挂上 `::view-transition-group(*.zoom)`，CSS 中一条规则即可批量命中所有带 `.zoom` 的组。

**active-view-transition-type**：开发者通过 `document.startViewTransition({ type: 'slide-left' })` 或 CSS `@view-transition { type: slide-left }` 声明转场类型，CSS 中 `:active-view-transition-type(slide-left)` 伪类匹配时生效。

---

## 2. 语法说明

### 2.1 跨页转场声明（CSS）

```css
/* 同站导航自动触发 view transition */
@view-transition {
  navigation: auto;
}
```

- `navigation: auto`：浏览器自动为**同站同源**的常规导航（`<a href>`、location、history）触发跨页转场。
- 仅支持主文档导航；iframe、跨域、下载、302 重定向等场景不触发。
- 可配合 `navigation-timing` 控制新旧页面生命周期（默认浏览器自动管理）。

### 2.2 view-transition-class 批量复用

```css
/* 元素声明 */
.thumb {
  view-transition-name: thumb-1;
  view-transition-class: zoom;   /* 挂分类 */
}

/* CSS 一条规则命中所有 zoom 类 */
::view-transition-group(*.zoom) {
  animation: zoom-in 0.4s cubic-bezier(0.2, 0, 0.2, 1);
}
::view-transition-old(*.zoom),
::view-transition-new(*.zoom) {
  animation: none;   /* 用组级动画，不单独淡入淡出 */
}
```

- `view-transition-class` 类似元素的「动画标签」，一个元素可声明多个（空格分隔）。
- `::view-transition-group(*.class)` 的 `*` 是通配，表示「任意名字但 class 匹配」。

### 2.3 active-view-transition-type 类型化转场

```js
// JS 触发时指定类型
document.startViewTransition({
  type: 'slide-left',
  update: () => renderNewPage()
});
```

```css
/* 仅当当前转场类型为 slide-left 时生效 */
@supports selector(:active-view-transition-type(slide-left)) {
  :active-view-transition-type(slide-left) {
    /* 根级动画：整页向左滑 */
    ::view-transition-group(root) {
      animation: slide-left 0.35s ease;
    }
  }
}

/* 类型化根动画通用写法 */
@supports selector(:active-view-transition-type(*)) {
  :active-view-transition-type(*) {
    ::view-transition-group(root) {
      animation-duration: 0.3s;
    }
  }
}
```

- `type` 支持自定义字符串标识，方便按业务语义区分转场。
- `@supports selector(...)` 做特性检测，避免不支持该选择器的浏览器报错。

### 2.4 view-transition-name 作用域与唯一性

```css
/* 每个 view-transition-name 在同一时刻必须全局唯一 */
.card { view-transition-name: card; }   /* 错误：20 张卡片同名 */

/* 正确：动态命名或 class 批量处理 */
.card { view-transition-class: card-zoom; }
```

- 同一时刻 DOM 中不能有两个元素的 `view-transition-name` 相同（重复名会导致 transition 失败回退到无动画）。
- 列表场景推荐 `view-transition-class` 代替逐个命名，或仅在「共享元素」场景下给唯一元素命名。

### 2.5 滚动联动手势驱动

```js
// 滚动到某阈值后触发转场
const vt = document.startViewTransition({
  type: 'expand',
  update: () => card.classList.add('expanded')
});
// 可结合 ScrollTimeline 控制进度（规范仍在演进，需关注最新草案）
```

---

## 3. 浏览器兼容性

| 浏览器 | 基础支持 | 跨页 MPA | view-transition-class | active-view-transition-type |
| --- | --- | --- | --- | --- |
| Chrome / Edge | 111+（2023） | 126+（2024） | 126+ | 126+ |
| Safari | 暂不支持 | 暂不支持 | 暂不支持 | 暂不支持 |
| Firefox | 暂不支持 | 暂不支持 | 暂不支持 | 暂不支持 |

> 当前（2024–2025）View Transitions 进阶特性为 Chromium 独占。Safari 与 Firefox 正在实现中，建议通过 `@supports` 做渐进增强。

```css
@supports (view-transition-name: root) {
  /* 浏览器支持基础 VT */
}
@supports selector(:active-view-transition-type(zoom)) {
  /* 浏览器支持类型化 VT */
}
```

---

## 4. 使用场景示例

### 4.1 MPA 同站跨页转场

```css
/* 全站 CSS（如 base.css） */
@view-transition {
  navigation: auto;
}

/* 所有页面共享的转场动画 */
::view-transition-group(root) {
  animation: fade-slide 0.35s ease;
}
@keyframes fade-slide {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

A 页点击 `<a href="/b">` 跳转到 B 页，浏览器自动在两张页面之间执行 `fade-slide`。

### 4.2 view-transition-class 批量卡片动画

```css
/* 所有卡片共用 zoom 动画 */
.item {
  view-transition-name: item-1;   /* 每个仍要唯一名 */
  view-transition-class: zoom;    /* 但动画规则可复用 */
}

::view-transition-group(*.zoom) {
  animation: zoom-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

> 注意：`view-transition-name` 仍需唯一，`view-transition-class` 解决的是「动画规则复用」问题。

### 4.3 active-view-transition-type 按类型区分动画

```js
// 列表→详情：放大
document.startViewTransition({ type: 'expand', update: showDetail });
// 返回：缩小
document.startViewTransition({ type: 'collapse', update: showList });
```

```css
:active-view-transition-type(expand) ::view-transition-group(root) {
  animation: zoom-in 0.4s ease;
}
:active-view-transition-type(collapse) ::view-transition-group(root) {
  animation: zoom-out 0.3s ease;
}
```

### 4.4 滚动吸附联动转场

```css
@view-transition {
  navigation: auto;
}

/* 配合 scroll-snap 实现「翻页即转场」 */
.page {
  scroll-snap-align: start;
  view-transition-name: page;
}
```

---

## 5. 实际应用案例分析

**场景：电商商品列表 → 详情页的 MPA 站点。**

旧实现：列表页点击商品后白屏闪切到详情页；返回按钮再闪切回来。用户体验断层，像 2010 年的网站。

进阶实现：

1. **全局声明**：`@view-transition { navigation: auto; }` 一行开启全站跨页转场。
2. **商品图共享**：列表页和详情页中同一商品的封面图使用相同 `view-transition-name: product-<id>`，浏览器自动做「图片从列表位置放大到详情页」的补间。
3. **返回列表**：详情页返回时浏览器自动执行反向动画（放大→缩小回原位）。
4. **兜底**：Safari/Firefox 用户无感知退化到普通导航。

收益：MPA 站获得 SPA 级转场体验，无需引入任何前端路由框架。

---

## 6. 最佳实践与常见坑

1. **跨页转场仅限同站同源**：`navigation: auto` 不会对跨域链接、`<a download>`、`target="_blank"`、302 重定向触发转场。
2. **view-transition-name 必须唯一**：两个元素同时存在且同名，整个 view transition 会静默失败（回退到无动画）。列表项建议用 `view-transition-class` 做动画复用，仅在「共享元素」场景给唯一元素命名。
3. **view-transition-class 与 name 的区别**：`class` 不替代 `name` 的唯一性约束，它只决定「哪套动画规则命中该元素」。
4. **MPA 转场需要两页都声明**：A 页和 B 页都需要 `@view-transition { navigation: auto; }`，否则浏览器不会在导航时启动转场。
5. **active-view-transition-type 需特性检测**：用 `@supports selector(:active-view-transition-type(x))` 包裹，防止旧版 Chrome 报错。
6. **滚动驱动场景规范仍在演进**：Scroll-driven View Transitions 目前为草案级，生产环境建议关注 Chrome 版本发布说明。
7. **性能与内存**：跨页转场会同时保留旧页面和新页面的渲染快照，内存占用增加；复杂页面应控制动画时长（建议 ≤ 400ms）。
8. **无障碍**：转场动画应遵循 `prefers-reduced-motion`，为减少动画偏好用户关闭或简化过渡。

---

## 7. 参考资料

- [CSS View Transitions Module Level 2（W3C 草案）](https://www.w3.org/TR/css-view-transitions-2/)
- [MDN：View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [web.dev：View Transitions 跨页导航](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document)
- [web.dev：view-transition-class](https://developer.chrome.com/docs/css-ui/view-transition-class)
- [web.dev：active-view-transition-type](https://developer.chrome.com/docs/css-ui/active-view-transition-type)
- 相关文档：[View Transitions 基础（CSS 篇 17）](17-view-transitions.md) ｜ [滚动吸附（CSS 篇 23）](23-scroll-snap.md) ｜ [CSS 嵌套（CSS 篇 18）](18-css-nesting.md)
