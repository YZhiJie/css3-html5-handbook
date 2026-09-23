# 拖放 API

> HTML5 Drag and Drop 让元素拖拽成为浏览器原生能力：`draggable` 一个属性 + 一套 drag 事件流 + `dataTransfer` 数据桥。列表排序、看板流转、从桌面拖文件进网页，都是它的主场。但事件流"反直觉"（dragover 不 preventDefault 一切白搭）、移动端全线不支持，也让它成为踩坑重灾区。本章覆盖完整事件流、dataTransfer 全家桶、排序与跨容器看板实战、文件拖放与图片预览、自定义拖拽影像与移动端 Pointer Events 替代方案。

## 目录

- [1. 概念解释](#1-概念解释--是什么解决什么问题底层原理)
- [2. 语法说明](#2-语法说明--完整语法属性参数表代码片段)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（双击即可运行，零依赖）：

| 示例 | 说明 | 路径 |
| --- | --- | --- |
| 事件流与 dataTransfer 基础 | 全事件日志 + setData/getData + 自定义拖拽影像 | ../../examples/html/08-drag-drop/index-01-drag-events-basics.html |
| 排序与跨容器看板 | 拖拽排序列表 + 三列看板跨容器流转 | ../../examples/html/08-drag-drop/index-02-sortable-kanban.html |
| 文件拖放与图片预览 | DataTransfer.files + FileReader 预览 | ../../examples/html/08-drag-drop/index-03-file-drop-preview.html |

## 1. 概念解释 —— 是什么、解决什么问题、底层原理

### 1.1 是什么

HTML5 DnD 是浏览器内置的**拖放交互框架**：给元素加 `draggable="true"`，它就可以被拖起来；任何元素都可以通过监听 drag 系列事件成为"投放目标"。拖拽过程中携带的数据（文本、URL、甚至拖进来的文件）统一由 `DragEvent.dataTransfer` 承载。

它与"鼠标事件模拟拖拽"（mousedown + mousemove + mouseup 自己算坐标）的区别：

| 维度 | 原生 DnD | 鼠标事件模拟 |
| --- | --- | --- |
| 实现代价 | 监听几个事件即可 | 自己管理拖拽状态/边界/命中 |
| 拖拽影像 | 浏览器自动生成半透明快照 | 自己做"幽灵元素"跟随 |
| 拖拽系统文件 | **支持**（DataTransfer.files） | 不可能（OS 级限制） |
| 与系统交互 | 可跨窗口/跨应用拖文本 | 不支持 |
| 移动端 | **不支持** | Pointer Events 全平台可用 |

### 1.2 解决什么问题

排序、分派、归组是中后台的高频交互：任务在看板列之间流转、字段在表单设计器里拖入画布、附件从桌面拖进浏览器。原生 DnD 把"拖"这个动作标准化：**浏览器负责拖拽影像、命中判定与系统级数据通道**，开发者只需要声明"谁能拖、谁能收、收下干什么"。

### 1.3 底层原理与事件流（核心）

拖拽生命周期分两端，共 9 个事件：

```
被拖元素（源）：
  dragstart → drag（高频，类似 mousemove） → dragend（成功失败都触发）

投放目标（目）：
  dragenter（进入） → dragover（悬停，高频） → drop（松手）
  dragleave（离开）                     ↑ 离开而不 drop
```

三条铁律：

1. **`dragover` 必须 `preventDefault()`**：浏览器默认把"投放"当危险动作禁止（防止误拖破坏页面），只有对 dragover 调用 preventDefault 才等于声明"我这里允许投放"——**没有这一行，drop 永远不触发，松手浏览器直接回弹**。这是 DnD 第一大坑。
2. **`drop` 里通常也要 `preventDefault()`**：阻止浏览器默认行为（如把拖的是链接时直接打开它）。
3. **数据只能在 `dragstart` 写、`drop` 读**：dataTransfer 是"一次性信封"，dragover/dragenter 阶段出于安全只能读 `types` 列表，不能读内容（防止页面偷看用户拖过敏感数据）。

**命中判定**：drop 目标是"指针下方最上层响应 dragover 的元素"，不是被拖元素。所以投放区内部有子元素时，drop 事件可能落在子元素上——用 `event delegation`（在容器上统一监听）或 `pointer-events: none` 处理。

**拖拽影像**：默认是被拖元素的半透明快照；`setDragImage()` 可换成任意图片或离屏渲染的元素快照。快照在 dragstart 同步生成，之后修改原元素不影响影像。

## 2. 语法说明 —— 完整语法、属性/参数表、代码片段

### 2.1 draggable 属性

```html
<!-- 显式声明可拖：div/span/img 等默认不可拖，必须加 -->
<div draggable="true">可以拖我</div>
<!-- a[href] 与 img 默认可拖（draggable="auto"），也支持拖拽链接/图片到别处 -->
<a href="https://example.com" draggable="true">链接</a>
```

注意：文本选中状态下文字也可以"拖"（浏览器把选区当拖拽数据），需要排除干扰时可对容器加 `user-select: none`。

### 2.2 事件与 dataTransfer API 表

| 事件 | 触发对象 | 高频 | 关键动作 |
| --- | --- | --- | --- |
| `dragstart` | 被拖元素 | 否 | `setData()` 写数据；`setDragImage()`；设置 `effectAllowed` |
| `drag` | 被拖元素 | **是** | 尽量别做重活，节流 |
| `dragenter` | 目标 | 进入一次 | 高亮投放区 |
| `dragover` | 目标 | **是** | **必须 preventDefault()**；设置 `dropEffect`；计算插入位置 |
| `dragleave` | 目标 | 离开一次 | 取消高亮（注意子元素抖动坑） |
| `drop` | 目标 | 松手一次 | preventDefault()；`getData()`；执行业务 |
| `dragend` | 被拖元素 | 松手一次 | 清理拖拽态；用 `dropEffect` 判断是否成功 |

| dataTransfer 成员 | 说明 |
| --- | --- |
| `setData(type, text)` | dragstart 时写入；常用类型 `text/plain`、`text/uri-list`、自定义 `application/x-xxx` |
| `getData(type)` | drop 时读取；其他阶段读到空串 |
| `types` | 只读数组；dragover 阶段用它判断"拖的是什么"（文件拖入时含 `Files`） |
| `effectAllowed` | 源允许的效果：copy/move/link/组合/all/none |
| `dropEffect` | 目标声明的效果；键盘 Shift/Ctrl 可在 copy/move 间切换，最终效果取二者交集 |
| `setDragImage(img, x, y)` | 自定义拖拽影像（img 可以是页面里的 `<img>`、`<canvas>`） |
| `files` | FileList；从桌面拖文件进来时的入口 |
| `items` | DataTransferItemList；可遍历类型、用于异步读取（如粘贴板/目录） |

### 2.3 最小可运行骨架

```js
// 源：拖动开始时把卡片 id 放进信封
card.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', e.currentTarget.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
});

// 目标：dragover 放行是必要条件
column.addEventListener('dragover', (e) => {
  e.preventDefault();                        // ← 没有这行 drop 永远不触发！
  e.dataTransfer.dropEffect = 'move';
});

// 目标：松手取数据
column.addEventListener('drop', (e) => {
  e.preventDefault();                        // 阻止浏览器默认（如打开链接/下载文件）
  const id = e.dataTransfer.getData('text/plain');
  column.appendChild(document.querySelector('[data-id="' + id + '"]'));
});
```

### 2.4 插入位置计算（排序的精髓）

```js
// 在 dragover 里计算"该插到哪个元素前面"：几何中心判断
const afterEl = getDragAfterElement(column, e.clientY);
function getDragAfterElement(container, y) {
  // 选出"中心点在鼠标下方"的所有兄弟里最靠近鼠标的那个
  return [...container.querySelectorAll('.card:not(.dragging)')]
    .reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;   // 鼠标在中心点之下 → offset > 0
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: -Infinity }).element;
}
// drop 时：container.insertBefore(draggingEl, afterEl)
```

### 2.5 文件拖放与预览

```js
dropzone.addEventListener('dragover', (e) => e.preventDefault()); // 同样必须放行
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;              // 从桌面拖进来的文件
  [...files].forEach((file) => {
    if (!file.type.startsWith('image/')) return showTip('仅支持图片');
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };  // data URL 直接可预览
    reader.readAsDataURL(file);
  });
});
```

### 2.6 移动端替代：Pointer Events 思路

```js
// 移动端 Safari/Android 不触发 drag 事件系列，需要 Pointer Events 自建拖拽：
el.addEventListener('pointerdown', (e) => {
  el.setPointerCapture(e.pointerId);      // 捕获指针：移动/抬起都派发给 el
  // 之后监听 pointermove 移动"幽灵元素"，pointerup 落点做命中测试（document.elementFromPoint）
});
```

思路：pointerdown 创建跟随指针的克隆元素 → pointermove 更新位置 + elementFromPoint 找投放区 → pointerup 落点触发与 drop 相同的业务函数。**把"落点后的业务"抽成独立函数**，让原生 DnD 与 Pointer 两条路径复用，是兼容两端的标准做法。

## 3. 浏览器兼容性

> 以下版本为基于 caniuse 的**大致基线**，仅供参考，关键场景请以实测为准。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| 基础 DnD（事件 + dataTransfer） | 4 | 12 | 3.5 | 3.1 | **iOS Safari 仅 iPadOS 11+ 支持部分能力；Android 全线不支持** | 移动端必须 Pointer Events 替代 |
| 文件拖入（dataTransfer.files） | 4 | 12 | 3.6 | 3.1 | iPadOS 13+ 可用 | 移动端基本不可用 |
| setDragImage | 4 | 12 | 3.5 | 3.1 | 同上 | Safari 对未渲染完成的 canvas 影像可能忽略 |
| 自定义类型 setData | 4 | 12 | 3.5 | 3.1 | 同上 | 部分旧安卓 WebView 只认 text/plain |
| dragleave 子元素误触发 | 有（历史差异） | 有 | 有 | 更明显 | — | 子元素间移动会连发 leave/enter，用 counter 或 CSS 处理 |
| iPadOS 触控拖放 | — | — | — | 11+（部分） | 13+ 较完整 | 依赖 `draggable` + touch 长按，体验与桌面不同 |

## 4. 使用场景示例

### 4.1 场景一：事件流演示 + dataTransfer 数据传递

**场景描述**：把一个卡片拖进投放区，日志面板实时打印 7 个事件的生命周期；展示 setData/getData、effectAllowed/dropEffect 的联动。

```js
card.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', card.dataset.id);  // 写入"信封"
  e.dataTransfer.setData('application/x-card', JSON.stringify({ id: card.dataset.id, name: card.textContent }));
  e.dataTransfer.effectAllowed = 'copyMove';              // 源声明允许 copy 或 move
  log('dragstart：数据已装入信封');
});
zone.addEventListener('dragover', (e) => {
  e.preventDefault();                                     // 放行投放
  e.dataTransfer.dropEffect = 'copy';                     // 目标选择 copy（与源取交集）
  zone.classList.add('over');
});
zone.addEventListener('drop', (e) => {
  e.preventDefault();
  const data = JSON.parse(e.dataTransfer.getData('application/x-card'));
  log('drop：收到 ' + data.name + '（id=' + data.id + '），dropEffect=' + e.dataTransfer.dropEffect);
});
```

**预期效果**：拖动卡片时日志依次出现 dragstart → drag(高频) → dragenter → dragover(高频) → drop → dragend；投放区悬停高亮；未 preventDefault 的对照区松手直接回弹。见 [示例 1](../../examples/html/08-drag-drop/index-01-drag-events-basics.html)。

### 4.2 场景二：拖拽排序列表

**场景描述**：列表项在同一个容器内上下排序，拖动时其余项自动"腾位"，松手完成插入。

```js
list.addEventListener('dragover', (e) => {
  e.preventDefault();
  const after = getDragAfterElement(list, e.clientY);   // 2.4 节的中心点算法
  if (after == null) list.appendChild(draggingEl);      // 拖到底部：直接追加
  else list.insertBefore(draggingEl, after);            // 否则插到目标前
});
```

**预期效果**：被拖项实时跟随腾位（用"直接移动真实元素"的技巧，dragover 高频触发也流畅）；松手后打印最终顺序。见 [示例 2](../../examples/html/08-drag-drop/index-02-sortable-kanban.html) 的列表区。

### 4.3 场景三：跨容器看板（待办 / 进行中 / 完成）

**场景描述**：三列看板，卡片可跨列拖动也可列内排序——任务管理工具的核心交互。

```js
// 事件委托：三列共用一套监听，不用给每列绑三遍
document.querySelectorAll('.column').forEach((col) => {
  col.addEventListener('dragover', (e) => {
    e.preventDefault();
    const after = getDragAfterElement(col, e.clientY);
    const card = document.querySelector('.dragging');
    if (after == null) col.querySelector('.cards').appendChild(card);
    else col.querySelector('.cards').insertBefore(card, after);
  });
});
// drop 里无需再移动（dragover 已实时归位），只需更新计数与业务状态
```

**预期效果**：卡片拖动全程"影子归位"，三列计数实时变化；松手后展示各列任务分布。见 [示例 2](../../examples/html/08-drag-drop/index-02-sortable-kanban.html)。

### 4.4 场景四：文件拖放与图片预览

**场景描述**：把桌面上的图片文件拖进页面，读取 `DataTransfer.files`，用 FileReader 生成预览并展示文件元信息——附件上传组件的通用雏形。

```js
document.addEventListener('dragover', (e) => e.preventDefault()); // 全窗口放行
document.addEventListener('drop', (e) => {
  e.preventDefault();
  if (!e.dataTransfer.files.length) return;          // 拖的不是文件（比如页面内文本）
  [...e.dataTransfer.files].forEach((file) => {
    const ok = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => addCard({ name: file.name, size: file.size, type: file.type, url: ok ? reader.result : null });
    reader.readAsDataURL(file);                      // 读成 data URL，img 可直接显示
  });
});
```

**预期效果**：拖入图片立即显示缩略图 + 名称/类型/大小；拖入非图片文件显示占位卡片与提示；支持一次拖入多个文件。见 [示例 3](../../examples/html/08-drag-drop/index-03-file-drop-preview.html)。

### 4.5 场景五：setDragImage 自定义拖拽影像

**场景描述**：默认快照太朴素，用离屏 canvas 画一个带圆角与文字的"徽章"作为拖拽影像，体验立刻精致。

```js
card.addEventListener('dragstart', (e) => {
  const c = document.createElement('canvas');       // 离屏画布当影像源
  c.width = 160; c.height = 40;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2563eb';                        // 画圆角底 + 文字
  ctx.beginPath(); ctx.roundRect(0, 0, 160, 40, 10); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif';
  ctx.fillText('拖拽中：' + card.textContent, 12, 25);
  e.dataTransfer.setDragImage(c, 80, 20);           // 影像中心对准指针
});
```

**预期效果**：拖动时跟随指针的不再是半透明原元素，而是蓝色徽章。见 [示例 1](../../examples/html/08-drag-drop/index-01-drag-events-basics.html) 的"自定义影像"开关。

## 5. 实际应用案例分析

### 5.1 项目协作看板工具（Trello 类）：排序、跨列流转与移动端降级

**背景**：某团队自研任务看板，三列（待办/进行中/已完成）上百张卡片，桌面用原生 DnD，随后被要求支持 iPad 与手机。

**方案选型**：桌面走原生 DnD（dragover 实时归位 + 中心点插入算法）；移动端走 Pointer Events 自实现（克隆幽灵元素 + elementFromPoint 命中）。关键决策是**把"落点业务函数"（moveCard(cardId, toColumn, beforeId)）抽成唯一入口**，两套交互最终都调它，业务与交互解耦。

**踩坑分析**：
1. **dragover 里appendChild 引发的事件风暴**——移动卡片导致 dragleave/enter 在新旧容器间疯狂互发。解法：dragging 中的卡片加 `pointer-events: none`（不参与命中），且只在"插入位置变化"时才操作 DOM。
2. **drop 后数据丢失**——drop 里 getData 读自定义类型在 Firefox 拿到空串（类型名带了非法字符）。规范后自定义类型只用小写字母加连字符，同时回退读 text/plain。
3. **列表过长拖不动**——长列 dragging 时视口不滚动，用户拖到底也看不到下面的卡。补了"dragover 时按指针贴近边缘自动滚动容器"的逻辑（requestAnimationFrame 匀速滚动）。
4. **iPad 上的怪异行为**——iPadOS 对原生 DnD 支持不完整，最终 iPad 与手机统一走 Pointer Events，桌面才用原生 DnD，按 `matchMedia('(pointer: coarse)')` 分流。

### 5.2 中后台表单设计器：组件拖入画布 + 占位提示

**背景**：低代码表单设计器，左侧组件库（输入框/下拉/日期…）拖入右侧画布生成表单项，画布内还可拖动调序。

**方案选型**：拖入用原生 DnD（dragstart 写入组件 type，画布 dragover 显示"插入横条"占位符）；画布内调序复用 4.2 的算法。占位符是一个 4px 高的渐变横条元素，insertBefore 到目标位置，比"整块半透明"更不容易引起布局跳动。

**踩坑分析**：
1. **拖入文本被浏览器当文本**——用户从 Word 拖文字进画布直接插入了富文本。在画布 drop 里校验 `e.dataTransfer.types` 不含目标类型时忽略，并 `preventDefault` 阻断默认插入。
2. **拖拽影像遮挡画布**——组件库图标较小，快照几乎看不清；用 setDragImage 换成 48px 的"组件名徽章"后可用性明显提升。
3. **iframe 场景失效**——设计器嵌在 iframe 中时，拖到 iframe 边界会中断事件流；最终画布页与宿主同域部署，并在宿主层转发 dragover。

## 6. 最佳实践与常见坑

1. **dragover 不 preventDefault 一切白搭**：这是 DnD 第一坑，drop 永远不触发、松手回弹；每个投放区都必须写。
2. **drop 也要 preventDefault**：否则拖链接/文本时浏览器执行默认行为（打开/导航），刚做完的业务直接被冲掉。
3. **数据只能在 dragstart 写、drop 读**：dragover 阶段读 getData 是空串，需要预判"拖的是什么"只能看 `dataTransfer.types`。
4. **用事件委托监听投放区**：目标区里的子元素会让 drop 落在子元素上；统一在容器监听 + 按需向上找，避免给每个子元素绑事件。
5. **dragleave 误触发**：指针扫过子元素会连发 leave/enter 导致高亮闪烁；用 counter 计数或直接在 dragover 里维护高亮（推荐后者，状态自洽）。
6. **drag 高频事件里别做重活**：drag/dragover 每几十毫秒触发一次，DOM 操作只在"位置变化"时执行；排序场景直接移动真实元素比克隆幽灵更简单流畅。
7. **被拖元素加 pointer-events:none / dragging 类**：既避免命中自身，也方便样式（降透明度）与逻辑过滤。
8. **effectAllowed 与 dropEffect 取交集**：源设 copy 目标设 move 时浏览器按 none 处理（Safari 行为不一致），两端约定一致最稳。
9. **移动端不支持，用 Pointer Events 替代**：pointerdown/move/up + setPointerCapture + elementFromPoint；业务落点函数与原生 DnD 共用。
10. **文件拖放注意 types 判断**：先判断 `e.dataTransfer.types.includes('Files')` 再处理 files，避免页面内拖文本被误当文件。
11. **自定义类型命名规范**：用 `application/x-` 前缀 + 小写字母连字符，Firefox 对非法字符类型会静默丢弃。
12. **拖拽结束统一清理状态**：dragend 里移除 dragging 类、清空高亮；drop 与 dragend 都可能不触发（拖出窗口松手），清理逻辑别只写在 drop 里。

## 7. 参考资料

- MDN — HTML 拖放 API 总览：<https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API>
- MDN — 拖放操作（事件流与 dataTransfer 详解）：<https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations>
- MDN — DataTransfer 对象：<https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer>
- MDN — File 与 FileReader（文件预览）：<https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader>
- MDN — Pointer Events（移动端替代）：<https://developer.mozilla.org/zh-CN/docs/Web/API/Pointer_events>
- WHATWG HTML 标准 — 拖放章节：<https://html.spec.whatwg.org/multipage/dnd.html#dnd>
- caniuse — Drag and Drop 兼容性数据：<https://caniuse.com/dragndrop>
- caniuse — Pointer Events 兼容性数据：<https://caniuse.com/pointer>
