# CSS 锚点定位（Anchor Positioning）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— Anchor Positioning 让任意元素可以「钉」在另一个元素旁边：一句 `position-anchor` 声明依附关系，`anchor()` / `position-area` 决定停靠方位，`position-try` 在空间不足时自动翻转。Tooltip、下拉菜单、气泡卡片、跟随标注这些曾经的「JS 算坐标重灾区」，从此可以纯 CSS 完成。

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
| [index-01-anchor-positioning.html](../../examples/css/21-anchor-positioning/index-01-anchor-positioning.html) | 基础 tooltip + position-area 九宫格 + position-try 防溢出翻转 + anchor-size 等宽菜单 + 滚动跟随与降级 |

---

## 1. 概念解释

### 1.1 锚点定位是什么

锚点定位把「**谁**是参照物」从包含块（containing block）中解放出来：普通绝对定位只能相对最近的定位祖先，而锚点定位允许元素相对**页面上任意一个被命名的元素**（anchor）摆放自己。

```css
/* 参照物：声明自己是一个锚 */
.trigger {
  anchor-name: --tip-anchor;
}

/* 漂浮物：钉在锚的正上方、水平居中 */
.tooltip {
  position: absolute;
  position-anchor: --tip-anchor;   /* 绑定锚 */
  bottom: anchor(top);             /* 我的底边 = 锚的顶边 */
  justify-self: anchor-center;     /* 水平与锚中心对齐 */
}
```

### 1.2 解决什么问题

| 痛点 | 传统方案 | 锚点定位方案 |
| --- | --- | --- |
| Tooltip 跟随目标 | JS getBoundingClientRect + scroll/resize 监听 | 纯 CSS 声明，浏览器自动跟随 |
| 空间不足时翻转 | Popper.js 等库的 flip 中间件 | `position-try` 内置回退链 |
| 菜单宽度对齐触发器 | JS 读取宽度再写内联样式 | `anchor-size(width)` 直接引用 |
| 元素跨 DOM 层级关联 | 移 DOM、传 ref、portal 一把梭 | 名字绑定，与 DOM 结构解耦 |
| 滚动时位置同步 | rAF 节流重算 | 合成器级跟随，无 JS 参与 |

### 1.3 底层原理

锚点定位发生在**布局阶段**：浏览器先完成锚元素的布局，拿到它的精确矩形，再把被定位元素当作「以锚矩形为参照系的绝对定位元素」完成定位。因此：

- **跟随是免费的**：锚移动（滚动、动画、布局变化）→ 下一帧布局时漂浮物自动重算，无需 JS。
- **`position-try` 也是布局期决策**：浏览器依次尝试回退位，选第一个不溢出的位置，一次性定案——所以翻转**没有动画**，是瞬间切换。
- **与 z-index 无关**：锚点定位只管几何位置，不管层叠。弹出层要被所有内容压在下面时，仍需 top layer（Popover / `<dialog>`）解决——这也是它俩被称为「黄金搭档」的原因。

## 2. 语法说明

### 2.1 建立锚：`anchor-name`

```css
.button {
  anchor-name: --menu-btn;   /* 自定义名，须以 -- 开头，类似 CSS 变量 */
}
```

- 一个元素可以声明多个锚名（空格分隔），供不同漂浮物绑定。
- 同一锚名被多个元素声明时，**最后一个**（DOM 序）生效——利用这点可以做「跟随当前激活项」。
- `anchor-scope: --menu-btn` 可限制锚名的可见范围（组件库防名字打架）。

### 2.2 绑定锚：`position-anchor`

```css
.menu {
  position: absolute;            /* 或 fixed；锚点定位只作用于绝对/固定定位元素 */
  position-anchor: --menu-btn;   /* 省略时取 auto：隐式锚（如 popover 的触发按钮） */
}
```

### 2.3 定位方式一：`anchor()` 函数（精细派）

在 `top / right / bottom / left / inset-*` 中使用，返回锚对应边的坐标：

```css
.tooltip {
  position-anchor: --tip;

  bottom: anchor(top);        /* 我的底边贴着锚的顶边 → 出现在锚上方 */
  left: anchor(center);       /* 我的左边 = 锚的水平中心线 */
  translate: -50% 0;          /* 再左移自身一半，实现水平居中 */

  /* 语法：anchor( [锚名]? [top|right|bottom|left|center|<百分比>] , <回退值>? ) */
  /* bottom: anchor(--other top, 100px);  可指定别的锚 + 兜底值 */
}
```

### 2.4 定位方式二：`position-area` 九宫格（直觉派）

把锚的四周想象成 3×3 网格，直接选一个格子入住：

```css
.menu {
  position-anchor: --menu-btn;
  position-area: bottom span-right;   /* 下方格子，并向右延伸对齐 */
  /* 常用值：top / bottom / left / right / center、
             top left、bottom span-right、inline-start block-end …
             支持逻辑方向（block/inline/start/end），自动适配书写模式 */
  margin: 8px;                        /* 用 margin 控制与锚的间距 */
}
```

`position-area` 还会**重排 self-alignment 默认值**：入住 `bottom` 格子后，`justify-self: anchor-center` 就是相对格子的水平居中——多数场景连 `anchor()` 都不用写。

### 2.5 防溢出回退：`position-try`

```css
.tooltip {
  position-area: top;
  position-try: flip-block flip-inline;   /* 放不下就上下翻，再不行左右翻 */

  /* 或命名自定义回退位： */
  /* position-try: --under, --right-side; */
}
/* @position-try --under { position-area: bottom span-right; } */
```

- 回退是**布局期一次定案**：位置切换无过渡动画。
- `position-visibility: anchors-visible`：锚滚出视口时把漂浮物一起隐藏（防止 tooltip 悬空）。

### 2.6 读锚的尺寸：`anchor-size()`

```css
.menu {
  min-width: anchor-size(width);   /* 菜单至少与触发按钮等宽 */
}
```

## 3. 浏览器兼容性

| 浏览器 | 支持版本 | 说明 |
| --- | --- | --- |
| Chrome / Edge | 125+（2024-05） | 首发完整实现 |
| Safari | 26+（2025 秋） | 随 Safari 26 落地 |
| Firefox | 开发中 | 仍需 `layout.css.anchor-positioning` 标志，未默认开启 |

生产环境务必用 `@supports` 分层增强：

```css
/* 降级：静态定位，至少可见可用 */
.tooltip { position: absolute; top: -2em; left: 0; }

/* 增强：支持锚点定位的浏览器用精确停靠 */
@supports (anchor-name: --a) {
  .trigger { anchor-name: --tip; }
  .tooltip { position-anchor: --tip; bottom: anchor(top); top: auto; justify-self: anchor-center; }
}
```

## 4. 使用场景示例

### 4.1 Tooltip：锚正上方居中

```css
[data-tip-anchor] { anchor-name: --tip; }
.tooltip {
  position: absolute;
  position-anchor: --tip;
  bottom: calc(anchor(top) + 8px);
  justify-self: anchor-center;
}
```

### 4.2 下拉菜单：等宽 + 防溢出

```css
.menu-btn { anchor-name: --menu; }
.menu {
  position: absolute;
  position-anchor: --menu;
  position-area: bottom span-right;
  min-width: anchor-size(width);
  position-try: flip-block;
  margin-top: 6px;
}
```

### 4.3 角标/徽标：贴住目标右上角

```css
.badge {
  position-anchor: --avatar;
  position-area: top right;
  translate: 50% -50%;   /* 骑在角落上 */
}
```

### 4.4 多锚协作：连线/标注

一个元素只能有一个 `position-anchor`，但可以用具名 `anchor()` 同时引用多个锚的坐标（左边缘读锚 A、右边缘读锚 B），实现「横跨两个元素之间」的效果。

## 5. 实际应用案例分析

**场景：设计系统的 Tooltip/Popover 组件，替代 Floating UI。**

旧架构：每个 tooltip 挂载时 `createPopper()`，监听 scroll/resize/IntersectionObserver，React 里再包一层 portal 与 effect 清理。组件库的 JS 体积里定位逻辑占了一大块。

迁移后架构：

1. **触发器**渲染时输出 `anchor-name: --tip-N`（N 为实例序号，保证唯一）。
2. **漂浮层**用 Popover API（见 `docs/html/10-popover.md`）拿到 top layer 与 light-dismiss，用 `position-anchor: --tip-N` 完成几何定位，JS 只剩「开关」一件事。
3. **翻转策略**从 JS 中间件变成一句 `position-try: flip-block flip-inline`。
4. 滚动容器再多也不怕——跟随由布局引擎保证，合成器滚动时逐帧正确。

收益：定位 JS 代码清零，滚动时零脚本参与（跟手且无抖动），SSR 输出即有正确结构。代价：Firefox 用户仍走 JS 降级分支——保留一份精简版 Floating UI 作为 polyfill 路径，按 `@supports` 运行时代码分割。

## 6. 最佳实践与常见坑

1. **`anchor()` 只认绝对/固定定位元素**：忘了写 `position: absolute/fixed`，`anchor()` 整体失效且不报错——排查第一步先查 position。
2. **锚必须先布局**：锚元素 `display: none` 或尚未渲染时，漂浮物会掉到回退值/初始位置。条件渲染场景注意「锚先显、漂后开」的顺序。
3. **position-try 翻转无动画**：这是布局期决策，不要在两个位置之间期待过渡。需要「滑动到对面」的效果请用 JS 方案。
4. **`anchor-name` 同名覆盖**：同名锚取 DOM 序最后一个——组件库务必用 `anchor-scope` 圈住作用域，或生成唯一名。
5. **只管几何、不管层叠**：被卡片 `overflow: hidden` 裁切、被其他内容盖住，锚点定位都帮不了你——弹出层请搭配 Popover 的 top layer。
6. **`position: fixed` + 锚 ≠ 跟随滚动**：fixed 漂浮物相对视口定一次位置后**不随页面滚动**；要跟随请用 `position: absolute`（放进与锚同一滚动上下文）。
7. **margin 而非 translate 控间距**：`position-area` 场景下用 margin 表达「离锚 8px」语义最稳；`anchor()` 场景里 `calc(anchor(top) + 8px)` 更直观。
8. **可访问性仍要 JS**：几何定位不解决焦点管理与 aria 关联，tooltip 的 `aria-describedby`、菜单的方向键导航照旧要写。

## 7. 参考资料

- [CSS Anchor Positioning Module Level 1（W3C 规范）](https://www.w3.org/TR/css-anchor-position-1/)
- [MDN：CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [Chrome for Developers：Tether elements to each other with CSS anchor positioning](https://developer.chrome.com/blog/anchor-positioning-api)
- [caniuse：CSS Anchor Positioning](https://caniuse.com/css-anchor-positioning)
- 相关文档：[Popover API（HTML 篇 10）](../html/10-popover.md) ｜ [CSS 进阶技巧：变量与 calc](06-variables-calc.md)
