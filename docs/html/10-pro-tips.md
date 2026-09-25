# HTML5 实用能力补充（现代交互元素与资源优化）

> 面向前端开发人员的 HTML5 高级特性参考资料 —— `<dialog>`、Popover、`inert`、`<template>` 等"浏览器原生造好的轮子"，加上图片懒加载、资源提示与移动端键盘增强，少写一千行样板代码。

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
| [index-01-dialog-modal.html](../../examples/html/10-pro-tips/index-01-dialog-modal.html) | `<dialog>` 模态（showModal + method=dialog + ESC + ::backdrop + 焦点陷阱实测 + 返回值 + 点遮罩关闭）与非模态 show 侧栏 |
| [index-02-popover-inert.html](../../examples/html/10-pro-tips/index-02-popover-inert.html) | Popover API 三种触发方式 + :popover-open 动画 + light dismiss；`inert` 模态锁背景整页失焦演示；含不支持提示 |
| [index-03-template-render.html](../../examples/html/10-pro-tips/index-03-template-render.html) | `<template>`+cloneNode 渲染列表、innerHTML 的 XSS 对比（createTextNode 转义）、data-* 事件委托、语义小标签补遗 |
| [index-04-resource-hints.html](../../examples/html/10-pro-tips/index-04-resource-hints.html) | lazy/decoding/fetchpriority/宽高防 CLS 可视化、五类资源提示速查卡、inputmode/enterkeyhint、:-webkit-autofill、hidden 的坑 |

---

## 1. 概念解释

### 1.1 这一章在补什么

前九章覆盖了语义骨架、表单、画布、存储、多媒体等"大块头"能力。本章补的是另一类高频但零散的能力——它们的共同特征是：**过去需要大量 JS 手写、如今浏览器原生内建**。

1. **弹层三件套**：`<dialog>`（模态/非模态对话框）、**Popover API**（临时浮层）、`inert`（整棵子树"禁用"）；
2. **模板与数据**：`<template>` 惰性片段 + `cloneNode`、`data-*`/`dataset`；
3. **资源优化**：`loading/decoding/fetchpriority`、`width/height` 防 CLS、`<link rel>` 资源提示家族、`rel="noopener"`；
4. **移动端输入增强**：`inputmode`、`enterkeyhint`、`:-webkit-autofill`；
5. **语义小标签与隐藏**：`<mark>/<small>/<abbr>/<kbd>/<samp>`、`hidden` 的真实语义。

### 1.2 解决什么问题

- **消灭"手写模态框"的三座大山**：遮罩层、背景滚动锁、**焦点陷阱（focus trap）**。一个成熟的自定义模态要处理 Tab 循环、焦点归还、ESC、`aria-modal`、滚动条补偿……`<dialog>` 把这些全部内建，且实现质量与读屏器适配由浏览器保证。
- **消灭"手写浮层"的定位与关闭逻辑**：Tooltip、气泡菜单、下拉建议过去依赖第三方库（Popper/floating-ui 之流做定位，还要手写"点外面关闭"）。Popover API 提供顶层（top layer）渲染与 **light dismiss**（点外部/ESC 自动关）。
- **安全地渲染列表**：`innerHTML +=` 拼接用户数据是存储型 XSS 的头号入口；`<template>` + `cloneNode` + `textContent` 让"结构与数据分离"零成本。
- **把性能预算花在刀刃上**：懒加载、异步解码、优先级提示、预连接——首屏 LCP 与总流量同时受益，且大多只需写对属性。
- **移动端少敲键**：`inputmode="numeric"` 直接弹数字键盘，`enterkeyhint="search"` 让回车键变成"搜索"，转化漏斗的每一步都更短。

### 1.3 底层原理

**顶层（Top Layer）**是理解 dialog 与 popover 的钥匙：浏览器维护一个**脱离普通文档流层叠上下文**的特殊渲染层，置顶于所有 `z-index` 之上（你写 `z-index:999999` 也盖不住它）。`showModal()` 打开的 dialog 与 `showPopover()` 打开的浮层都进入顶层。这意味着：再也不会出现"弹框被父容器 `overflow:hidden` 裁掉""被别的 stacking context 盖住"的经典 bug。

**`<dialog>` 的焦点管理是规范级行为**：`showModal()` 打开时，浏览器按以下顺序决定初始焦点——dialog 内带 `autofocus` 的元素 → 第一个可聚焦元素 → dialog 本身。关闭时焦点**自动归还**到触发它的按钮。打开期间 Tab 被限制在 dialog 内部循环（焦点陷阱），背景内容对辅助技术不可见（等价于 aria-modal）。ESC 键触发 `cancel` 事件然后关闭（触发 `close` 事件）。`show()`（非模态）则不提供上述任何一项——它只是"在顶层显示一个普通框"，焦点不陷阱、ESC 不关闭，适合做侧栏通知、可共存的调色板等。

**`close(returnValue)` 与 `method="dialog"`**：模态内的表单若写 `<form method="dialog">`，点提交按钮**不会发生网络提交**，而是关闭对话框，并把提交按钮的 `value`（或文本）写入 `dialog.returnValue`。随后触发的 `close` 事件里即可读到——这是"确认/取消"二态对话框无需任何状态变量的原生方案。

**`::backdrop`** 伪元素代表模态背后的遮罩层，可独立设背景色、模糊（`backdrop-filter`）、透明度动画。它只在 `showModal()` 时存在；`show()` 没有遮罩。

**Popover 的生命周期**：`popover` 属性（或 `[popover]`，无值等同于 `auto`）让元素默认 `display:none`；`showPopover()` 后进入顶层并匹配 `:popover-open`，可做进场动画；light dismiss 条件包括：点击浮层外部、按 ESC、打开另一个 auto 浮层。`popovertarget="<id>"` + `popovertargetaction="show|hide|toggle"` 让一个按钮零 JS 控制浮层。手动模式（JS 调 `showPopover/hidePopover/togglePopover`）适合需要数据请求后再开的场景。`auto` 与 `manual` 的关键区别：auto 浮层支持 light dismiss 且同一时刻只允许一组（打开新的会关掉旧的），manual 必须代码显式关闭、可同时并存——嵌套菜单用 auto（子菜单打开时父菜单保持），Toast 堆叠用 manual。

**`inert` 的语义是"整块子树从交互世界与可访问性树移除"**：加上后，内部所有控件不可点击、不可聚焦（Tab 跳过）、链接无效，辅助技术也读不到；它还会阻止 `find-in-page` 命中与文本选择。模态打开时给页面主容器加 `inert`，一行属性替代"手动锁住几十个焦点元素"的旧方案。注意它不是视觉隐藏——元素照常显示，只是"哑了"。

**`<template>` 的惰性**：`<template>` 的内容不进入普通 DOM，而存在于一个独立的 `DocumentFragment`（`template.content`）中——不渲染、脚本不执行、图片不加载、表单不参与提交。需要时 `template.content.cloneNode(true)` 深拷贝一份插入文档，它才"活过来"。配合 `createTextNode`/`textContent` 填充用户数据，文本永远是文本，不可能被解析成 `<img onerror>`——这是与 `innerHTML` 的本质安全差异。

**资源提示的决策链**：浏览器加载一个页面要经历 DNS → TCP/TLS → 请求 → 响应 → 解析 → 渲染。`dns-prefetch` 只提前做域名解析；`preconnect` 提前做完 DNS+TCP+TLS（成本更高，最多对 3~4 个关键域使用）；`preload` 强制提前拉取当前页**确定要用**的资源（字体、LCP 图）；`prefetch` 低优先级拉取**下一页可能用**的资源；`modulepreload` 预取并解析/编译 ES 模块。误用代价：`preload` 没被使用的资源在 Console 报警且白耗流量；`prefetch` 在移动端可能浪费用户套餐；`preconnect` 过量会占用连接池反伤性能。

**`loading="lazy"` 与 `decoding="async"`**：懒加载让图片/iframe 推迟到接近视口才请求；浏览器原生实现比 IntersectionObserver 手搓方案更省（知道布局、能在打印等场景正确处理）。`decoding="async"` 提示浏览器在后台线程解码图像，避免大块图片解码卡住主线程。两者都是"提示"，浏览器有权忽略。

**宽高属性防 CLS**：现代浏览器在 `<img width height>` 已知时，会用两值算出**默认宽高比**（aspect-ratio），在图片未加载前预留正确尺寸的盒子——CSS 里再用 `height:auto; max-width:100%` 即可响应式。这是消灭累积布局偏移（CLS）成本最低的手段。

**`hidden` 与 `display:none` 的坑**：`[hidden]` 的 UA 样式就是 `display:none`，但它只是一个普通 CSS 规则——任何作者样式（如工具类 `.flex { display:flex }`）都能覆盖它，导致 `hidden` "失效"。可靠写法是补一条 `[hidden]{display:none!important}` 或改用 `inert` 思路/显式类。另注意 HTML5.2 后 `hidden="until-found"` 可用于"展开前对页内搜索隐藏"的折叠内容。

**`inputmode` 与 `enterkeyhint` 不改变值类型，只改键盘**：这是与 `type="number"` 的关键区别——`type="number"` 会让浏览器做数值语义处理（且可能拒绝字母、有上下箭头、国际化问题多），而 `inputmode="decimal"` 的输入框仍是普通文本、值是字符串，但虚拟键盘带小数点。手机号、验证码、金额等场景优先 `inputmode`。

---

## 2. 语法说明

### 2.1 `<dialog>` 属性/方法/事件

| 类别 | 名称 | 作用 | 注意 |
| --- | --- | --- | --- |
| 方法 | `showModal()` | 模态打开：进顶层、加遮罩、陷阱焦点、ESC 可关 | 已打开再调抛 `InvalidStateError` |
| 方法 | `show()` | 非模态打开：无遮罩、不陷阱焦点、ESC 不关 | 可同时开多个 |
| 方法 | `close(value?)` | 关闭，可写入 `returnValue` | 非 ESC 关闭的标准出口 |
| 属性 | `open` | 是否打开（只读反映状态，IDL 可写但不推荐直接操作） | 直接加 `open` 属性 ≠ showModal（无遮罩无焦点管理） |
| 属性 | `returnValue` | 最近一次 `close(value)` 或 method=dialog 提交的值 | 字符串 |
| 事件 | `cancel` | 按 ESC 触发（可 `preventDefault` 阻止关闭） | 仅模态 |
| 事件 | `close` | 任何方式关闭后触发 | 在此读 returnValue |
| CSS | `::backdrop` | 模态遮罩伪元素 | 仅 showModal 有 |

```html
<dialog id="d">
  <form method="dialog">
    <label>昵称 <input autofocus name="nick" required></label>
    <menu>
      <button value="cancel">取消</button>
      <button id="ok" value="ok" formmethod="dialog">确认</button>
    </menu>
  </form>
</dialog>
<button id="open">打开对话框</button>
<script>
  const d = document.getElementById('d');
  document.getElementById('open').onclick = () => d.showModal();
  d.addEventListener('close', () => {
    // method=dialog 提交时 returnValue = 提交按钮的 value
    console.log('结果：', d.returnValue); // "ok" 或 "cancel"
  });
  // 点遮罩关闭：监听 click，目标必须是 dialog 本身（遮罩区域）
  // 注意：这是社区惯例而非规范行为，且可能误关（框内选区拖到框外松手）
  d.addEventListener('click', e => { if (e.target === d) d.close('backdrop'); });
</script>
<style>
  dialog::backdrop { background: rgba(10,15,22,.55); backdrop-filter: blur(2px); }
  dialog[open] { animation: pop .18s ease-out; } /* 进场动画 */
  @keyframes pop { from { transform: translateY(12px) scale(.98); opacity: 0; } }
</style>
```

### 2.2 Popover API

| 类别 | 名称 | 作用 |
| --- | --- | --- |
| 属性 | `popover` / `popover="auto"` | 声明浮层（默认隐藏，可 light dismiss） |
| 属性 | `popover="manual"` | 手动浮层：不响应外部点击/ESC，可多个并存 |
| 属性 | `popovertarget="id"` | 按钮绑定浮层（无需 JS） |
| 属性 | `popovertargetaction="toggle\|show\|hide"` | 按钮动作，默认 toggle |
| 方法 | `showPopover()` / `hidePopover()` / `togglePopover()` | JS 控制；对未打开者 hide 会抛错 |
| CSS | `:popover-open` | 打开状态（进场动画挂载点） |
| CSS | `::backdrop` | 浮层同样可拥有遮罩（少用） |
| 事件 | `toggle` | 打开/关闭切换后触发，`e.newState === 'open'\|'closed'` |
| 事件 | `beforetoggle` | 切换前触发，可 `preventDefault`（较新浏览器） |

```html
<button popovertarget="tip" popovertargetaction="toggle">帮助</button>
<div id="tip" popover>快捷键：按 <kbd>Esc</kbd> 可关闭我</div>

<div id="menu" popover="manual">手动模式：只能用代码关闭</div>
<script>
  menu.addEventListener('toggle', e => console.log(e.newState));
  // 数据到达后再开：
  // menu.showPopover();
</script>
<style>
  #tip { border: 0; border-radius: 10px; padding: 10px 14px; }
  #tip:popover-open { animation: fade .15s ease-out; }
  @keyframes fade { from { opacity: 0; transform: translateY(-4px); } }
</style>
```

### 2.3 `inert`

```html
<!-- 模态打开期间：背景整页不可交互、不可聚焦、对读屏器隐藏 -->
<main id="app" inert>
  <a href="...">链接</a><button>按钮</button><input>
</main>
<dialog id="d">...</dialog>
<script>
  const app = document.getElementById('app');
  document.getElementById('open').onclick = () => { d.showModal(); app.inert = true; };
  d.addEventListener('close', () => { app.inert = false; });
</script>
```

小技巧：不支持 `inert` 的老浏览器可加载 Google 的 `wicg-inert` polyfill（约 2KB），或退化为"打开期间给背景容器加 `tabindex=-1` 遍历 + `aria-hidden`"。

### 2.4 `<template>` + cloneNode 与安全填充

```html
<template id="card-tpl">
  <li class="card">
    <h3 class="title"></h3>
    <p class="desc"></p>
    <button class="del" data-action="delete" data-id="">删除</button>
  </li>
</template>
<ul id="list"></ul>
<script>
  const tpl = document.getElementById('card-tpl');
  function render(item) {
    const node = tpl.content.cloneNode(true);          // 深拷贝惰性片段
    node.querySelector('.title').textContent = item.title; // 文本节点赋值 → 天然防 XSS
    node.querySelector('.desc').textContent = item.desc;
    node.querySelector('.del').dataset.id = item.id;      // data-id 写入 dataset
    document.getElementById('list').append(node);
  }
  // 事件委托：利用 data-action / data-id，一个监听器管整个列表
  document.getElementById('list').addEventListener('click', e => {
    const btn = e.target.closest('[data-action="delete"]');
    if (btn) console.log('删除 id =', btn.dataset.id);
  });
</script>
```

`<slot>` 思路简述：`<slot>` 是 Web Components/Shadow DOM 的内容分发槽——组件在模板中留 `<slot name="x">`，使用方传 `<span slot="x">` 即自动投影到槽位。`<template>` 是"结构复用"，slot 是"占位填充"，二者在自定义元素里组合使用。

### 2.5 图片/资源属性与资源提示

```html
<!-- 图片四件套：懒加载 + 异步解码 + 优先级 + 预留尺寸防 CLS -->
<img src="x.avif" width="800" height="450" alt=""
     loading="lazy" decoding="async" fetchpriority="low">

<!-- LCP 主图：反过来，要尽早加载 -->
<img src="hero.avif" width="1200" height="600" alt="主视觉"
     fetchpriority="high" decoding="async">

<!-- 资源提示家族 -->
<link rel="dns-prefetch" href="//cdn.example.com">   <!-- 仅 DNS -->
<link rel="preconnect"  href="https://cdn.example.com" crossorigin> <!-- DNS+TCP+TLS -->
<link rel="preload"     href="/font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="prefetch"    href="/next-page-data.json">  <!-- 下一页可能用 -->
<link rel="modulepreload" href="/app.mjs">            <!-- 预取+编译模块 -->

<!-- 新开标签页安全：防 reverse tabnabbing -->
<a href="https://ext.com" target="_blank" rel="noopener noreferrer">外链</a>
```

| 提示 | 做什么 | 何时用 | 误用代价 |
| --- | --- | --- | --- |
| `dns-prefetch` | 提前解析域名 | 第三方域很多、只想廉价预热 | 几乎无（但收益也最小） |
| `preconnect` | DNS+TCP+TLS 全握手 | 3~4 个关键第三方域（字体/API/CDN） | 过多占用连接、未用即浪费 |
| `preload` | 强制提前拉当前页资源 | 字体、LCP 图、关键 CSS/JS | 未使用的资源 Console 报警+白耗流量 |
| `prefetch` | 低优先级拉下一页资源 | 高概率的下一步导航 | 移动端浪费流量与电量 |
| `modulepreload` | 预取并解析编译 ESM | 启动即依赖的模块链 | 同 preload |

`fetchpriority` 取值 `high|low|auto`：LCP 图/关键区块用 high，首屏外图片用 low，其余默认。`loading` 只接受 `lazy|eager`；首屏图切勿 lazy（会拖慢 LCP）。

### 2.6 data-* / dataset 与语义小标签

```html
<article data-id="42" data-role="admin" data-published-at="2026-09-01">
  <h3><mark>限时</mark>活动公告</h3>
  <p>活动时间见<abbr title="Frequently Asked Questions">FAQ</abbr>页；
     提交后按 <kbd>Ctrl</kbd>+<kbd>S</kbd> 保存，
     服务器返回 <samp>200 OK</samp>。</p>
  <small>最终解释权归主办方所有（小字：法律/版权类附属声明）</small>
</article>
<script>
  const el = document.querySelector('article');
  el.dataset.id;             // "42"（注意：永远是字符串！）
  el.dataset.role;           // "admin"，data-published-at → dataset.publishedAt
  el.dataset.newFlag = '1';  // 写回 → data-new-flag="1"
</script>
```

| 标签 | 语义 | 典型场景 | 易混点 |
| --- | --- | --- | --- |
| `<mark>` | 因**当前语境**而标记（高亮） | 搜索结果关键词、引用中标注 | 不是"永久重要"——那是 `<strong>` |
| `<small>` | 附属细则（side comments） | 版权、免责、脚注 | 不是"单纯变小"，无语义别用 |
| `<abbr>` | 缩写/首字母缩略 | `<abbr title="HyperText…">HTML</abbr>` | 配 `title` 才有展开提示 |
| `<kbd>` | 用户输入（键盘/语音/菜单命令） | 快捷键文档 | 组合键每个键各包一个 kbd |
| `<samp>` | 计算机/程序的输出 | 错误码、终端输出 | 与 `<code>`（代码本身）区分 |

### 2.7 inputmode / enterkeyhint / autofill

```html
<input inputmode="numeric"   enterkeyhint="next"   placeholder="6 位验证码" autocomplete="one-time-code">
<input inputmode="decimal"   enterkeyhint="done"   placeholder="金额">
<input inputmode="tel"       enterkeyhint="send"   placeholder="手机号" autocomplete="tel">
<input inputmode="email"     enterkeyhint="search" placeholder="邮箱"   autocomplete="email">
<style>
  /* 自动填充默认黄底：统一品牌外观（-webkit-text-fill-color 连文字色一起覆盖） */
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #fff inset;
    -webkit-text-fill-color: #22303f;
    caret-color: #22303f;
    transition: background-color 9999s ease-in-out 0s; /* 兼容老内核的延迟技巧 */
  }
</style>
```

`inputmode` 常用值：`none/text/decimal/numeric/tel/search/email/url`。`enterkeyhint`：`enter/done/go/next/previous/search/send`。桌面浏览器无虚拟键盘，这两个属性不可见——示例页只能给文字说明，需真机验证。

---

## 3. 浏览器兼容性

> 以下为大致基线（依据 caniuse 与 MDN 数据整理，仅供参考，上线前请以目标用户实测为准）。Popover、`inert` 等新特性标注 2024 基线与降级策略。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `<dialog>` show/close | 37+ | 79+ | 98+ | 15.4+ | iOS 15.4+/安卓 Chrome 全覆盖 | Firefox/Safari 跟进晚，老版本需 polyfill |
| `showModal` + 焦点陷阱 | 37+ | 79+ | 98+ | 15.4+ | 同上 | 直接写 `open` 属性没有模态语义，务必走方法 |
| `::backdrop` | 37+ | 79+ | 103+ | 15.4+ | 现代机型良好 | Firefox 较早版本支持不全 |
| Popover API（**2024 基线**） | 114+ | 114+ | 125+ | 17+（2024 秋） | iOS 17+ / 安卓 Chrome 114+ | 基线前必须特性检测 `HTMLElement.prototype.showPopover`，降级为绝对定位 + 手写点外关闭 |
| `popover` manual 模式 / toggle 事件 | 114+ | 114+ | 125+ | 17+ | 同上 | `beforetoggle` 的 preventDefault 更晚，别依赖 |
| `inert`（**2023 基线**） | 102+ | 102+ | 112+ | 15.6+ | iOS 15.6+ | 老浏览器用 wicg-inert polyfill；注意它连辅助树一起移除 |
| `<template>` + cloneNode | 26+ | 13+ | 22+ | 8+ | 全平台支持 | 无实质坑；IE 时代才需要降级 |
| `loading="lazy"`（img/iframe） | 77+/77+ | 79+ | 75+ | 15.4+（iframe 16.4+） | 现代机型良好 | 首屏/LCP 图不要 lazy；打印场景浏览器会强制全量加载 |
| `decoding="async"` | 65+ | 79+ | 68+ | 11.1+ | 良好 | 提示性质，不保证行为 |
| `fetchpriority` | 101+ | 101+ | 132+（部分早前） | 17.2+ | 安卓良好，iOS 17.2+ | 不支持时静默忽略，天然可渐进增强 |
| 宽高防 CLS（aspect-ratio 推导） | 79+ | 79+ | 71+ | 14.1+ | 良好 | 记得 CSS 配 `height:auto` |
| `preload` | 50+ | 17+ | 56+（`as` 支持晚） | 11.1+ | 良好 | 字体 preload 必须带 `crossorigin`（即使同域） |
| `modulepreload` | 66+ | 79+ | 115+ | 17+ | 现代良好 | Firefox 早期忽略，等同 prefetch |
| `dns-prefetch` / `preconnect` | 全支持 / 46+ | 全支持 / 79+ | 全支持 / 90+（晚） | 全支持 / 11.1+ | 良好 | preconnect 控制在 3~4 个以内 |
| `rel="noopener"` | 49+（默认行为自 88） | 79+ | 52+ | 12.1+ | 良好 | 现代浏览器 target=_blank 默认 noopener，但显式写更稳 |
| `inputmode` | 66+ | 79+ | 95+（早前有倒退） | 12.2+ | 移动端价值最大 | 与 type=number 的语义差异要讲给团队 |
| `enterkeyhint` | 77+ | 79+ | 94+ | 13.4+ | 安卓键盘普遍生效 | 部分第三方键盘不响应 |
| `:-webkit-autofill` | 全内核（含 Chromium/WebKit） | 同 | 支持（`:-moz-autofill` 前缀另算） | 支持 | 一致 | 不能改普通 background，需内阴影 hack；Firefox 写 `:autofill` |
| `hidden` | 6+ | 12+ | 4+ | 5.1+ | 全支持 | **会被作者的 display 规则覆盖**，必要时 `[hidden]{display:none!important}` |
| `hidden="until-found"` | 102+ | 102+ | 不支持 | 16+ | 视机型 | 用于折叠内容可被页内搜索命中，未支持前用 hidden 兜底 |

---

## 4. 使用场景示例

### 场景一：中后台"确认 + 表单"模态对话框

**场景描述**：删除前需要用户填原因并二次确认。用 `<dialog method="dialog">` 零状态变量拿到确认结果，ESC 与遮罩点击作为取消路径。

```html
<dialog id="confirm" aria-labelledby="ct">
  <h3 id="ct">确认删除该订单？</h3>
  <form method="dialog">
    <label>删除原因（必填）
      <select name="reason" required autofocus>
        <option value="">请选择…</option>
        <option value="dup">重复下单</option>
        <option value="err">信息填错</option>
      </select>
    </label>
    <menu>
      <button value="cancel">取消</button>
      <button value="confirm" class="danger">确认删除</button>
    </menu>
  </form>
</dialog>
<button id="del">删除订单</button>
<script>
  const dlg = document.getElementById('confirm');
  document.getElementById('del').onclick = () => dlg.showModal();
  // 点遮罩关闭：target === dialog 才成立（点内部元素 target 是内部元素）
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close('cancel'); });
  dlg.addEventListener('close', () => {
    if (dlg.returnValue === 'confirm' && dlg.querySelector('select').value) {
      console.log('执行删除，原因：', dlg.querySelector('select').value);
    }
  });
</script>
```

**逐段注释**：`method="dialog"` 让表单提交变成"关框并回传按钮 value"，没有网络请求；`required` 仍然生效——没选原因时点确认无法关闭，浏览器内建校验气泡照常工作；`autofocus` 在 dialog 内语义为"打开时初始焦点落此"；遮罩点击判断 `e.target === dlg` 是社区惯例，要知晓"框内开始拖选、框外松手"可能误触，重要操作可只认按钮与 ESC。

**预期效果**：打开后焦点落在下拉框；Tab 只在框内循环；ESC 等于取消；未选原因时确认被拦截；关闭后日志打印结果。

### 场景二：帮助气泡 + 嵌套菜单（Popover）配合 inert 锁背景

**场景描述**：页面有"帮助说明"气泡（声明式触发）、"更多操作"下拉菜单（手动 JS 异步填充），打开一个全屏确认层时用 `inert` 让背景彻底失活。

```html
<button popovertarget="help" popovertargetaction="toggle">操作帮助</button>
<div id="help" popover>点页面任意处或按 <kbd>Esc</kbd> 关闭（light dismiss）</div>

<button id="more">更多操作 ▾</button>
<div id="menu" popover="manual">
  <button popovertarget="sub" popovertargetaction="show">新建 ▸</button>
  <button data-act="rename">重命名</button>
  <div id="sub" popover="auto"><button>文件夹</button><button>文档</button></div>
</div>

<main id="page">
  <a href="#">背景链接（模态打开后不可 Tab 到）</a>
  <input placeholder="背景输入框">
</main>
<dialog id="blocker"><form method="dialog"><button>我知道了</button></form></dialog>

<script>
  const menu = document.getElementById('menu');
  document.getElementById('more').onclick = async () => {
    if (menu.matches(':popover-open')) { menu.hidePopover(); return; }
    menu.showPopover(); // 真实项目可先 await fetch 再开
  };
  const dlg = document.getElementById('blocker');
  const page = document.getElementById('page');
  document.addEventListener('toggle', e => {
    if (e.target === dlg) page.inert = (e.newState === 'open');
  }, true); // toggle 不冒泡，用捕获
</script>
```

**逐段注释**：帮助气泡用纯声明式（`popovertarget`），零 JS；主菜单用 manual 因为要先取数据且不希望点菜单外部就关闭；子菜单用 auto，挂在父浮层内可形成嵌套层级；`inert` 的切换挂在 dialog 的 `toggle`/`close` 时机——本例用捕获阶段的 `toggle` 委托（该事件不冒泡）。不支持 Popover 时要特性检测并降级（如 `details/summary` 或绝对定位面板）。

**预期效果**：帮助气泡点外部即关；全屏框打开时背景链接/输入框全部不可达，Tab 键跳过它们。

### 场景三：搜索结果列表（template 安全渲染 + dataset 委托）

**场景描述**：用户输入关键词后渲染结果列表，标题中高亮命中词，数据来自接口（含不可信内容），必须防 XSS。

```html
<template id="row-tpl">
  <li class="row" data-id="">
    <h4 class="t"></h4>
    <p class="u"></p>
    <button data-action="open">打开</button>
  </li>
</template>
<ul id="rows"></ul>
<script>
  const tpl = document.getElementById('row-tpl');
  function render(rows, keyword) {
    const frag = document.createDocumentFragment(); // 一次性插入，减少回流
    for (const r of rows) {
      const node = tpl.content.cloneNode(true);
      const li = node.querySelector('.row');
      li.dataset.id = r.id;
      // 安全策略：原文一律走 textContent；高亮 mark 单独、安全地切分
      const t = node.querySelector('.t');
      const idx = r.title.indexOf(keyword);
      if (keyword && idx >= 0) {
        t.append(r.title.slice(0, idx));
        const m = document.createElement('mark');
        m.textContent = r.title.slice(idx, idx + keyword.length);
        t.append(m, r.title.slice(idx + keyword.length));
      } else {
        t.textContent = r.title;
      }
      node.querySelector('.u').textContent = r.url; // 即使值是 <img onerror=...> 也只显示为文本
      frag.append(node);
    }
    document.getElementById('rows').replaceChildren(frag);
  }
  document.getElementById('rows').addEventListener('click', e => {
    const b = e.target.closest('[data-action="open"]');
    if (b) location.hash = b.closest('.row').dataset.id;
  });
  render([{id:'1', title:'季度报告', url:'/q'}, {id:'2', title:'<img src=x onerror=alert(1)>', url:'/x'}], '报告');
</script>
```

**逐段注释**：`innerHTML` 会把第二条数据里的 `<img onerror>` 解析成可执行标签；`textContent/createTextNode` 永远只产生文本节点，XSS 从根上不可能。高亮 `<mark>` 也是先创建元素再把文本塞进去，字符串拼接只用于我们自己写的静态标签名。`DocumentFragment` 批量挂载只触发一次布局。事件委托让动态增删行无需重复绑定。

**预期效果**：列表正常渲染；恶意数据原样显示为文字而不执行；点任意"打开"按钮通过 dataset 拿到 id。

### 场景四：营销落地页资源组合拳

**场景描述**：首屏 LCP 主图必须快，长页面的十几张配图不能抢首屏带宽，第三方字体/统计域需要预热。

```html
<head>
  <!-- 第三方域：1 个 preconnect（关键）+ 1 个 dns-prefetch（廉价兜底） -->
  <link rel="preconnect" href="https://fonts.example.com" crossorigin>
  <link rel="dns-prefetch" href="//track.example.com">
  <!-- 首屏字体：preload 强制提前，as/font + crossorigin 一个都不能少 -->
  <link rel="preload" href="/brand.woff2" as="font" type="font/woff2" crossorigin>
  <!-- 预测用户大概率点"价格"页：低优先级预取其数据 -->
  <link rel="prefetch" href="/api/pricing.json">
</head>
<body>
  <!-- LCP 图：高优先级 + 立即加载 + 预留 1200x630 的盒子防 CLS -->
  <img src="hero.avif" width="1200" height="630" fetchpriority="high"
       decoding="async" alt="大促主视觉">
  <!-- 首屏外：懒加载 + 低优先级；宽高仍要写，占位盒照样防 CLS -->
  <img src="scene1.avif" width="600" height="400" loading="lazy"
       decoding="async" fetchpriority="low" alt="场景图 1">
  <!-- 第三方外链：新标签页打开且不带出处控制权 -->
  <a href="https://partner.example.com" target="_blank" rel="noopener noreferrer">合作伙伴 →</a>
</body>
```

**逐段注释**：同一件事的两面——LCP 资源（hero 图、关键字体）用 preconnect/preload/fetchpriority=high 往前推；非关键资源用 lazy/low 往后压。字体 preload 的 `crossorigin` 是硬性要求（字体按 CORS 模式获取，漏写会导致下载两次）。`noreferrer` 在现代浏览器与 `noopener` 效果重叠，写上兼容旧环境并顺带不发送 Referer。

**预期效果**：首屏只竞争关键资源，配图随滚动逐个进场，页面无跳动；外链无法通过 `window.opener` 篡改原页面。

---

## 5. 实际应用案例分析

### 案例一：中后台弹窗体系从自研迁移到 dialog + popover + inert

某 SaaS 管理后台早期基于自研组件库实现弹窗，历史代码里弹层相关逻辑超过 1500 行：遮罩单例、滚动锁（还要算滚动条宽度补偿防抖动）、焦点陷阱（遍历可聚焦选择器、处理 iframe/Shadow DOM 漏网）、ESC 队列、z-index 战争。迁移过程与踩坑：

1. **分层选型**：需要"用户必须响应"的确认框/表单框 → `<dialog showModal>`；不需要打断的筛选气泡、字段说明、更多菜单 → Popover。最大的认知转变是"不是所有浮在上面的东西都是模态"——90% 的历史弹窗其实只需要 popover。
2. **焦点陷阱白捡**：迁移后客服反馈的"Tab 跑到遮罩后面把列表删了"的 P1 事故直接消失——showModal 的焦点限制是浏览器行为，不存在选择器漏写。唯一注意点：打开前手动保存 `document.activeElement` 只在非模态/老 polyfill 场景需要，模态关闭会自动归还焦点。
3. **点遮罩关闭的争议**：产品要求"点遮罩等同取消"，团队按 `e.target===dialog` 实现后收到误触投诉——用户在框内拖选长文本，鼠标移到框外松手会命中遮罩。最终方案：记录 mousedown 与 mouseup 都发生在遮罩上才关闭。
4. **背景锁从 overflow 切换为 inert**：旧方案给 body 加 `overflow:hidden`，但页面里有"弹层中再开抽屉、抽屉独立滚动"的需求，锁滚状态机经常泄漏（关框后页面滚不动）。改为给主内容容器切换 `inert` 后语义正确、无样式副作用；Safari 15.6 以下小比例用户用 wicg-inert 兜住。
5. **Popover 降级**：企业客户有少量 Chromium 110 内嵌浏览器，特性检测不通过时把声明式按钮映射到 `details/summary` 风格的绝对定位面板，并在控制台提示版本——绝不静默失败。

### 案例二：营销落地页的资源优化排障

某大促落地页 Lighthouse LCP 长期 3.8s，排查与优化：

1. **首屏 hero 图被自己懒加载了**：团队为了"统一最佳实践"给全站图片加了 `loading="lazy"`，LCP 图反而推迟到布局后才发现。改为 hero 图 `fetchpriority="high"`、去掉 lazy，LCP 直降 1.4s。
2. **preload 滥用报警**：页面 preload 了 6 个 JS 包，其中 4 个是第二屏交互才用的——Console 里 "preloaded but not used" 警告一片，移动端弱网下首屏反而更慢。收敛到 1 个字体 + 1 个 LCP 图。
3. **CLS 的元凶是无尺寸广告位**：运营位图片由 CMS 回填、模板里没写 width/height。推动 CMS 输出宽高属性，CSS 统一 `img{height:auto;max-width:100%}`，CLS 从 0.28 降到 0.02。
4. **第三方统计域拖慢首包**：对统计域只做 `dns-prefetch`（它不该参与首屏竞争），对字体 CDN 做 `preconnect`；二者不混用——preconnect 是有握手成本的。
5. **表单键盘转化**：留资表单手机号框由 `type="number"` 改为 `inputmode="tel"`（type=number 在某些安卓机型会吞掉前导 0 且出现上下箭头），回车键 `enterkeyhint="send"`，留资完成率移动端提升约 6%（灰度对照）。
6. **结论**：资源优化 80% 的收益来自"把对的资源放到对的时机"，而这些几乎全是 HTML 属性层面的决策，不需要框架与基建配合。

---

## 6. 最佳实践与常见坑

1. **模态一律走 `showModal()`，不要手写 `open` 属性**：直接加 open 只有显示效果，没有遮罩、焦点陷阱、ESC 与 aria-modal，等于花架子。
2. **`method="dialog"` 优先于自管状态**：确认/取消结果通过 `returnValue` 拿；`required/pattern` 等校验在 dialog 表单里照常工作，别绕开。
3. **点遮罩关闭要防误触**：`e.target===dialog` 之外，至少处理"按下在框内、松手在框外"；破坏性操作（删除、支付）建议只认按钮和 ESC。
4. **焦点与归还**：初始焦点用框内 `autofocus` 精确指定（默认落到第一个可聚焦元素可能是"取消"）；模态关闭自动归还焦点，非模态与 polyfill 场景自己保存 `activeElement`。
5. **dialog 与 popover 按打断程度选型**：必须响应 → dialog 模态；临时信息/菜单/提示 → popover。popover 的 auto/manual 区分：要 light dismiss 用 auto，要多浮层并存或代码全权控制（Toast）用 manual。
6. **Popover 必须做特性检测**：`'showPopover' in HTMLElement.prototype`，不达标降级为绝对定位面板或 `details/summary`，并给出页面内提示；切勿假设 2024 基线等于企业内网环境。
7. **模态锁背景优先 `inert`**：比 `overflow:hidden` 锁滚语义更完整（连键盘与读屏器一起挡住）；注意元素仍可见，需要视觉变暗可同时加遮罩或降低透明度。
8. **渲染用户数据永远 `textContent/createTextNode`**：`innerHTML +=` 是 XSS 直通车；需要富文本时走白名单消毒（如 DOMPurify）。列表渲染用 `<template>` + `DocumentFragment` 批量插入。
9. **图片四件套按位置决策**：首屏/LCP 图——禁 lazy、`fetchpriority="high"`；首屏外——`loading="lazy" fetchpriority="low"`；全部图片写 width/height 防 CLS，CSS 配 `height:auto`。
10. **资源提示宁少勿滥**：preconnect ≤3~4 个关键域；preload 只放当前页确定使用的资源（字体必须带 crossorigin）；prefetch 慎用于移动流量；上线后用 Network 面板核查"preloaded but not used"警告。
11. **外链加 `rel="noopener noreferrer"`**：防 reverse tabnabbing（新页面经 `window.opener` 把原页跳走）；现代浏览器默认 noopener，但显式声明兼容旧环境。
12. **`[hidden]` 会被 display 工具类覆盖**：组件样式里写了 `.flex{display:flex}` 时 hidden 失效，全局补 `[hidden]{display:none!important}` 或切换类时排除；要"语义禁用而非隐藏"用 `inert`。
13. **移动端输入用 `inputmode` 而非滥用 `type="number"`**：验证码 numeric、金额 decimal、电话 tel；配 `enterkeyhint` 与正确的 `autocomplete`（`one-time-code/tel/email`），键盘体验必须真机验收。
14. **自动填充样式用 `:-webkit-autofill`（Firefox 再写 `:autofill`）**：用内阴影"染"背景、`-webkit-text-fill-color` 染文字；不要试图 JS 拦截 autofill，浏览器会主动对抗。
15. **语义小标签各司其职**：`mark` 是语境高亮（搜索命中）不是永久强调（strong）；`small` 是附属细则不是字号工具；`abbr` 配 title；`kbd` 表用户输入、`samp` 表系统输出、`code` 表代码。
16. **dataset 永远是字符串**：`data-id="42"` 读出来是 `"42"`，比较与计算前显式 `Number()`；`data-*` 适合放展示级配置，复杂状态仍应存在 JS 数据层而非 DOM。

---

## 7. 参考资料

- MDN · `<dialog>`：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/dialog
- MDN · HTMLDialogElement：https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLDialogElement
- MDN · Popover API：https://developer.mozilla.org/zh-CN/docs/Web/API/Popover_API
- MDN · `inert` 属性：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/inert
- MDN · `<template>`：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/template
- MDN · `data-*` 自定义属性：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/data-*
- MDN · 图片懒加载 `loading`：https://developer.mozilla.org/zh-CN/docs/Web/Performance/Lazy_loading
- MDN · `fetchpriority`：https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/fetchPriority
- MDN · 资源提示（preload/prefetch/preconnect 等）：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes/rel
- MDN · `inputmode`：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/inputmode
- MDN · `enterkeyhint`：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/enterkeyhint
- MDN · `hidden` 与 until-found：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/hidden
- MDN · 语义小标签（mark/small/abbr/kbd/samp）：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element
- web.dev · 资源优先级与 LCP 优化：https://web.dev/articles/fetch-priority
- web.dev · 优化 CLS：https://web.dev/articles/optimize-cls
- caniuse · dialog：https://caniuse.com/dialog ｜ popover：https://caniuse.com/mdn-api_htmlelement_popover ｜ inert：https://caniuse.com/mdn-api_htmlelement_inert
