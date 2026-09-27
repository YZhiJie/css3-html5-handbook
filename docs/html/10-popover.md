# Popover API（原生弹出层）

> 面向前端开发人员的 HTML5 高级特性参考资料 —— Popover API 把「弹出层」变成 HTML 的一个原生属性：给元素加上 `popover`，用 `popovertarget` 声明式绑定触发按钮，浏览器自动提供**顶层渲染（top layer）、点击外部关闭（light dismiss）、Esc 关闭、焦点管理**。菜单、Tooltip、Toast、通知中心——这些曾经必须依赖第三方库的组件，现在零 JS 起步。

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
| [index-01-popover.html](../../examples/html/10-popover/index-01-popover.html) | 声明式菜单 + manual 模态 + 进出场动画 + 锚点定位搭档 + JS API 与 toggle 事件 |

---

## 1. 概念解释

### 1.1 Popover 是什么

Popover 是一个**全局 HTML 属性**，把任意元素变成「弹出层」：

```html
<button popovertarget="menu">打开菜单</button>
<div id="menu" popover>
  <p>我是弹出层：顶层渲染、点外部关闭、Esc 关闭，全部自带。</p>
</div>
```

不需要一行 JS：按钮与弹出层通过 `popovertarget` 声明式关联，浏览器负责开关。

### 1.2 解决什么问题

| 痛点 | 传统方案 | Popover 方案 |
| --- | --- | --- |
| 被父级 overflow/z-index 裁切 | portal 移 DOM 到 body | top layer 天然突破一切层叠上下文 |
| 点击外部关闭 | 全局监听 click + contains 判断 | `popover="auto"` 自带 light dismiss |
| Esc 键关闭 | keydown 监听 + 状态清理 | 内建行为 |
| 焦点管理 | 手动 focus/trap/还原 | 打开自动聚焦、关闭焦点还原 |
| 遮罩层 | 手动渲染 div.overlay | `::backdrop` 伪元素 |

### 1.3 底层原理：top layer

打开中的 popover 会被浏览器提升到 **top layer（顶层）**——一个位于普通文档渲染层之上的特殊层：

- **无视 z-index**：top layer 内部按「打开顺序」堆叠，普通页面里再大的 `z-index: 999999` 也压不住它；反过来，popover 之间比的是谁先打开。
- **无视 overflow:hidden / transform**：不受祖先的裁切与层叠上下文限制——这正是组件库过去要用 portal 解决的核心问题。
- **专属 `::backdrop`**：每个 popover 可带自己的半透明背板（默认透明，样式自控）。

代价：几何位置仍需自己解决（popover 默认出现在视口附近居中）——这正是它与 **CSS 锚点定位**（见 [docs/css/21-anchor-positioning.md](../css/21-anchor-positioning.md)）组成黄金搭档的原因：一个管层叠与行为，一个管位置。

## 2. 语法说明

### 2.1 三种模式：`popover` 属性

| 值 | light dismiss | Esc 关闭 | 打开时关闭其他 auto | `::backdrop` 默认 | 典型用途 |
| --- | --- | --- | --- | --- | --- |
| `auto`（=`popover` 空值） | ✅ 点外部关闭 | ✅ | ✅（非祖先链上的） | 透明 | 菜单、下拉、通知卡片 |
| `manual` | ❌ | ❌ | ❌ | 透明 | 需显式按钮关闭的模态、Toast 队列 |
| `hint` | ✅ | ✅ | 只关其他 hint | 透明 | 悬停 tooltip（可与 auto 菜单共存） |

### 2.2 声明式触发：`popovertarget` / `popovertargetaction`

```html
<button popovertarget="m1">切换</button>
<button popovertarget="m1" popovertargetaction="show">只开</button>
<button popovertarget="m1" popovertargetaction="hide">只关</button>
<div id="m1" popover>…</div>
```

### 2.3 JS API 与事件

```js
const el = document.querySelector('#m1');
el.showPopover();              // 打开
el.hidePopover();              // 关闭
el.togglePopover();            // 切换（可传 boolean 强制目标状态）

el.addEventListener('beforetoggle', (e) => {
  // 即将切换：e.oldState / e.newState ∈ "open" | "closed"
  // 动画编排的黄金时机
});
el.addEventListener('toggle', (e) => {
  // 已切换完成
});
```

### 2.4 CSS 钩子

```css
/* 打开态样式 */
[popover]:popover-open { /* … */ }

/* 背板（manual 模式常配） */
[popover]::backdrop { background: rgb(0 0 0 / .4); }

/* 进出场动画三件套：display/overlay 离散动画 + @starting-style */
[popover] {
  transition: opacity .25s, translate .25s,
              display .25s allow-discrete, overlay .25s allow-discrete;
  opacity: 0; translate: 0 8px;
}
[popover]:popover-open { opacity: 1; translate: 0 0; }
@starting-style {
  [popover]:popover-open { opacity: 0; translate: 0 8px; }
}
```

## 3. 浏览器兼容性

| 浏览器 | 支持版本 | 说明 |
| --- | --- | --- |
| Chrome / Edge | 114+（2023-06） | 首发 |
| Safari | 17+（2023-09） | 跟随 |
| Firefox | 125+（2024-04） | 补齐，自此进入 Baseline |

`popover="hint"` 与 `interesttarget` 等扩展特性较新（2025 起陆续落地），使用前查 caniuse。

## 4. 使用场景示例

### 4.1 零 JS 菜单

```html
<button popovertarget="nav">菜单</button>
<nav id="nav" popover>
  <a href="/profile">个人资料</a>
  <a href="/settings">设置</a>
</nav>
```

点按钮开、点外部关、Esc 关——全部内建。

### 4.2 manual 模态 + 背板

```html
<div id="confirm" popover="manual">
  <p>确定删除？</p>
  <button popovertarget="confirm" popovertargetaction="hide">取消</button>
  <button id="ok">确定</button>
</div>
<style>
  #confirm::backdrop { background: rgb(0 0 0 / .45); }
</style>
```

### 4.3 Toast 通知（manual + JS）

```js
function toast(text) {
  const el = document.createElement('div');
  el.popover = 'manual';
  el.textContent = text;
  document.body.append(el);
  el.showPopover();
  setTimeout(() => { el.hidePopover(); el.remove(); }, 3000);
}
```

### 4.4 与锚点定位搭档：贴边弹出

```css
#avatar-btn { anchor-name: --avatar; }
#user-card {
  popover-behavior: auto;   /* HTML: popover 属性 */
  position: absolute;
  position-anchor: --avatar;
  position-area: bottom span-left;
  margin-top: 8px;
}
```

## 5. 实际应用案例分析

**场景：把产品的「通知中心」从组件库实现迁到原生 Popover。**

旧实现：React 组件 + portal 到 `document.body` + 自写 `useClickOutside` + `useEscapeKey` + focus trap + z-index 治理（全局维护一份「层叠常量表」）。代码约 400 行，还有边角 bug：快速连开两个弹层时外部点击监听互相干扰。

迁移后：

1. 触发按钮加 `popovertarget="notifications"`，面板加 `popover="auto"`——**开关、light dismiss、Esc、焦点还原全部删除**。
2. 定位交给锚点定位：`position-anchor` + `position-area: bottom span-left` + `position-try: flip-block`，原 JS 定位逻辑清零。
3. 动画用 `@starting-style` + `allow-discrete` 三件套，`beforetoggle` 事件留给「拉取未读数」这类真正的业务逻辑。
4. 保留下来的 JS 只剩约 30 行：数据获取与标记已读。

收益：行为正确性由浏览器背书（焦点、Esc、层级再无边角 bug），代码量降一个数量级。`<dialog>` 留给真正需要阻断流程的强模态——两者的分工见下表。

| 需求 | 选谁 |
| --- | --- |
| 菜单/下拉/悬浮卡片/tooltip | `popover`（非模态，不阻断页面） |
| 删除确认/支付等必须用户表态 | `<dialog showModal()>`（模态，页面惰性化） |

## 6. 最佳实践与常见坑

1. **top layer 没有 z-index 战争**：popover 之间按打开顺序堆叠，想「后来的在下面」做不到——需要精细堆叠控制时改用 `manual` 自己管开关顺序。
2. **`auto` 的「链式关闭」**：打开一个 auto popover 会关掉**不在同一祖先链**上的其他 auto——菜单里再开子菜单要用嵌套 DOM（子菜单写在父菜单内部）才能共存，这也是 `hint` 存在的意义。
3. **light dismiss 是「点击」不是「悬停离开」**：hover 触发的 tooltip 别指望移出自动关，配合 `hint` 或手动控制。
4. **动画必须处理 display 跳变**：popover 开关本质是 `display: none` 切换，缺了 `allow-discrete` + `@starting-style` 这套组合拳，过渡会直接失效。
5. **别重复造 Esc/外点监听**：`auto` 模式已内建；写了双份会导致「按一次 Esc 关两层」这类诡异 bug。
6. **`::backdrop` 每个 popover 独立**：manual 排队弹多个时背板会叠加变深——Toast 场景一般不开背板。
7. **位置默认在视口居中附近**：`popover` 不自带「贴着按钮」的定位，贴边请用锚点定位，别写死 `top/left` 像素值。
8. **SSR 友好但仍要渐进增强**：声明式 `popovertarget` 在 JS 失效时也能工作（浏览器原生行为），这是它对比组件库方案的隐藏福利。

## 7. 参考资料

- [MDN：Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [HTML 规范：the popover attribute](https://html.spec.whatwg.org/multipage/popover.html)
- [web.dev：Introducing the popover API](https://web.dev/blog/introducing-popover-api)
- [caniuse：popover](https://caniuse.com/mdn-api_htmlelement_popover)
- 相关文档：[CSS 锚点定位（CSS 篇 21）](../css/21-anchor-positioning.md) ｜ [@starting-style 与 allow-discrete 过渡动画](../css/02-animation-transition.md)
