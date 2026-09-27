# dialog 元素：原生模态与非模态对话框

> 面向前端开发人员的 HTML5 高级特性参考资料 —— `<dialog>` 是浏览器原生的对话框元素：`showModal()` 一句进入 top layer、自动焦点圈禁、Esc 关闭、背景惰性化（inert）；`::backdrop` 纯 CSS 定制遮罩。配合 Popover（轻量浮层）与 `@starting-style`（进出场动画），过去需要一个组件库的「弹窗三件套」，如今零依赖完成。

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
| [index-01-dialog.html](../../examples/html/12-dialog/index-01-dialog.html) | showModal/show 对比 + form method="dialog" 返回值 + ::backdrop 定制 + 进出场动画 + closedby 轻关 |

---

## 1. 概念解释

### 1.1 dialog 是什么

`<dialog>` 是 HTML 原生对话框元素，自带两种打开方式：

```html
<dialog id="confirm">
  <p>确定删除这条记录吗？</p>
  <button id="ok">确定</button>
</dialog>
```

```js
const dlg = document.getElementById('confirm');
dlg.showModal();  // 模态：页面其余部分惰性化，Esc 可关
dlg.show();       // 非模态：页面仍可交互
dlg.close('ok');  // 关闭并记录返回值
```

### 1.2 解决什么问题

| 痛点 | 传统方案 | `<dialog>` 方案 |
| --- | --- | --- |
| 遮罩层、z-index 层级战争 | 手动 fixed 全屏遮罩 + z-index: 9999 | `showModal()` 自动进 top layer，永远在最上 |
| 焦点跑到弹窗后面 | 手写 focus trap 监听 Tab | 模态自动焦点圈禁 |
| Esc 关闭、点遮罩关闭 | 全局 keydown / click 监听 | Esc 原生支持；`closedby="any"` 点外部即关 |
| 背景内容可被读屏器/键盘访问 | 手动给主内容加 aria-hidden + inert | 模态打开时页面自动 inert |
| 弹窗开启动画 | JS 加类 + 时序控制 | `@starting-style` + `allow-discrete` 纯 CSS |

### 1.3 底层原理

- **Top layer**：`showModal()` 把元素放进浏览器渲染树最顶层的独立层，不受 `z-index`、`transform` 父级截断影响——与 Popover 同一层，后开的在上。
- **Inert 页面**：模态打开期间，文档其余部分被标记为惰性（inert）：不可点击、不可聚焦、读屏器跳过。这是「模态」语义的正确实现，不是「盖一层透明布」。
- **`::backdrop` 伪元素**：top layer 中每个元素身后跟着一个全屏 backdrop，默认透明，可直接写 CSS 定制颜色/模糊。
- **焦点模型**：打开时焦点自动移到弹窗内第一个可聚焦元素（或 `autofocus` 指定项），Tab 键在弹窗内循环；关闭后焦点**自动还给**触发元素——无障碍开箱即用。

## 2. 语法说明

### 2.1 三个核心方法与属性

```js
const dlg = document.querySelector('dialog');

dlg.showModal();      // 模态打开（top layer + inert 页面 + Esc 关闭）
dlg.show();           // 非模态打开（普通定位，无遮罩无圈禁）
dlg.close('result');  // 关闭；可选返回值写入 dlg.returnValue
dlg.open;             // boolean：当前是否打开
dlg.returnValue;      // 上次 close('xxx') 传入的值
```

### 2.2 事件

```js
dlg.addEventListener('close', () => {
  console.log(dlg.returnValue);   // 读返回值
});
dlg.addEventListener('cancel', (e) => {
  // 用户按了 Esc —— 可 e.preventDefault() 拦截（如表单未保存）
});
```

- `cancel`：仅模态下 Esc 触发，随后默认执行 close；拦截即可实现「未保存确认」。
- `close`：任何方式关闭后触发（Esc、close()、form method="dialog" 提交）。

### 2.3 form method="dialog"：声明式返回值

```html
<dialog id="confirm">
  <form method="dialog">
    <p>确定删除？</p>
    <button value="yes">确定</button>
    <button value="no" formnovalidate>取消</button>
  </form>
</dialog>
```

点击按钮 = 关闭对话框，按钮的 `value` 自动写入 `returnValue`。**零 JS** 完成「确认/取消」分流：

```js
document.getElementById('confirm').addEventListener('close', (e) => {
  if (e.target.returnValue === 'yes') doDelete();
});
```

### 2.4 closedby：轻关闭（light dismiss）

```html
<dialog closedby="any">     <!-- 点弹窗外部任意处即关 -->
<dialog closedby="closerequest"> <!-- 仅 Esc/系统关闭请求（桌面默认） -->
<dialog closedby="none">    <!-- 只能代码关闭（强制确认场景） -->
```

- 属性写在 HTML 上；对应 JS 属性 `dlg.closedBy`。
- 注意：这是较新特性（见兼容性表），旧浏览器需要手动监听 backdrop 点击模拟。

### 2.5 ::backdrop 与进出场动画

```css
dialog::backdrop {
  background: rgb(0 0 0 / .55);
  backdrop-filter: blur(4px);
}

/* 进出场三件套（配合 @starting-style，详见 CSS 篇 22） */
dialog[open] {
  opacity: 1; translate: 0 0;
  transition: opacity .25s, translate .25s,
              overlay .25s allow-discrete, display .25s allow-discrete;
}
dialog:not([open]) { opacity: 0; translate: 0 16px; }
@starting-style {
  dialog[open] { opacity: 0; translate: 0 16px; }
}
```

**关键点**：backdrop 本身也可过渡（`transition` 写在 `dialog::backdrop` 上，离场同样要 `allow-discrete`）。

### 2.6 dialog 与 popover 的分工

| 维度 | `<dialog>` + showModal() | popover 属性 |
| --- | --- | --- |
| 语义 | 对话框（需用户决策/确认） | 浮层（菜单、提示、卡片） |
| 页面惰性 | 是（inert） | 否 |
| 焦点圈禁 | 是 | 否 |
| Esc 关闭 | 默认支持 | 默认支持 |
| 轻关闭（点外部） | `closedby="any"` | 默认（`popover="auto"`） |
| 互斥 | 多个模态可叠（后进先出） | auto 型同级互斥 |

经验法则：**打断用户流程要答案 → dialog；顺手展示补充信息 → popover**。

## 3. 浏览器兼容性

| 浏览器 | `<dialog>` 基础 | `closedby` 属性 | 说明 |
| --- | --- | --- | --- |
| Chrome / Edge | 37+ / 79+ | 134+（2025-04） | `closedby="any"` 为桌面模态补齐轻关闭 |
| Safari | 15.4+（2022-03） | 26+ | 基础能力已稳 |
| Firefox | 98+（2022-04） | 140+ | 基础能力已稳 |

基础三件套（showModal/::backdrop/form method="dialog"）2022 年起全绿；`closedby` 是新增量，用前做能力检测：

```js
if (!('closedBy' in HTMLDialogElement.prototype)) {
  // 退化：手动监听 backdrop 点击
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();   // 点在 dialog 矩形外时 target 是 dialog 本体
  });
}
```

## 4. 使用场景示例

### 4.1 确认对话框（零 JS 分流）

```html
<button id="delBtn">删除</button>
<dialog id="delDlg">
  <form method="dialog">
    <p>删除后不可恢复，确定？</p>
    <button value="confirm">确定</button>
    <button value="cancel" formnovalidate>取消</button>
  </form>
</dialog>
<script>
  delBtn.onclick = () => delDlg.showModal();
  delDlg.addEventListener('close', () => {
    if (delDlg.returnValue === 'confirm') console.log('已删除');
  });
</script>
```

### 4.2 拦截 Esc（表单未保存）

```js
dlg.addEventListener('cancel', (e) => {
  if (formDirty) {
    e.preventDefault();
    shake(dlg);   // 提示用户「有未保存内容」
  }
});
```

### 4.3 非模态抽屉（show）

```js
drawer.show();   // 页面仍可交互，适合「侧边设置面板」
```

### 4.4 点外部关闭（轻关闭）

```html
<dialog closedby="any">…</dialog>
```

不支持时退化方案见 3.3 节。

### 4.5 动画进出场

见 2.5 节三件套；叠加 `::backdrop` 过渡可实现「遮罩淡入 + 弹窗上浮」的完整体验。

## 5. 实际应用案例分析

**场景：后台系统的「删除确认 + 批量操作结果」弹窗。**

旧实现：自研 Modal 组件——React portal 挂到 body、手动维护 z-index 栈、focus trap 80 行、Esc/遮罩点击监听、`aria-hidden` 同步主内容、入场动画 setTimeout 加类。总计 400+ 行，仍偶发「焦点漏到背景」「两个弹窗遮罩叠错序」。

迁移后：

1. **结构**：`<dialog>` + `form method="dialog"`，确认/取消分流零 JS。
2. **层级与惰性**：`showModal()` 自动 top layer + inert，focus trap 删除。
3. **动画**：`@starting-style` 三件套替代 setTimeout 加类（见 CSS 篇 22）。
4. **轻关闭**：结果提示类弹窗用 `closedby="any"`；危险操作类用 `closedby="none"` 强制点按钮。

收益：组件代码 400 → 60 行；无障碍审计一次通过（焦点、读屏、Esc 全部原生）；遮罩叠序 bug 清零。

## 6. 最佳实践与常见坑

1. **`showModal()` 才能进 top layer**：用 `show()` 又想要遮罩层级是常见误用——非模态没有 backdrop，也不惰性化页面。
2. **默认样式要重置**：`<dialog>` 自带 UA 样式（黑色边框、自动 margin 居中、固定 `max-width`），先 `padding/border/margin` 清零再写自己的。
3. **关闭后滚动位置**：模态打开时浏览器锁定页面滚动（`overflow: hidden` 效果），无需手动锁 body。
4. **重复 showModal 会抛错**：已 open 的 dialog 再调 `showModal()` 抛 `InvalidStateError`，先判断 `dlg.open`。
5. **`cancel` 与 `close` 的顺序**：Esc → 先 `cancel`（可拦截）后 `close`；拦截 `cancel` 则 `close` 不触发。
6. **别忘 `:not([open])` 离场态**：只做入场动画时，关闭瞬间会闪没——三件套缺一不可（CSS 篇 22 详述）。
7. **popover 与 dialog 混用**：弹窗内再弹提示用 popover（不占模态栈）；弹窗内再弹确认用第二个 dialog——后开的在上，Esc 先关顶层。
8. **SSR/框架集成**：dialog 的 open 状态是 DOM 属性驱动的（`open` attribute），React/Vue 里直接操作 DOM API 即可，避免用状态双向同步 `open` 造成打架。

## 7. 参考资料

- [HTML Standard：the dialog element（WHATWG）](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)
- [MDN：&lt;dialog&gt;](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [MDN：closedby 属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#closedby)
- [web.dev：Building a dialog component](https://web.dev/articles/building/a-dialog-component)
- 相关文档：[Popover（HTML 篇 10）](10-popover.md) ｜ [@starting-style 入场动画（CSS 篇 22）](../css/22-starting-style.md) ｜ [表单增强（HTML 篇 02）](02-forms.md)
