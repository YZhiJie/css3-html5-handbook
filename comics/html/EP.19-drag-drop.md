# 漫画 · 第 19 话 拖放 API：松手之前的九条事件

> 对应正文：[docs/html/08-drag-drop.md](../../docs/html/08-drag-drop.md) ｜ 原画：[EP.19-drag-drop.svg](./EP.19-drag-drop.svg)

## 登场角色

- **像素酱**：CSS 造型师，用 mousedown + mousemove 手搓看板拖拽，自己管状态、算边界、做幽灵元素；产品又要求"从桌面把图片拖进浏览器上传"——这是鼠标模拟无论如何做不到的。
- **标签君**：HTML5 结构师，本话主角。给卡片加 `draggable="true"`，演示浏览器原生的拖拽影像、命中判定与系统级数据通道。

## 剧情梗概

HTML5 Drag and Drop 是浏览器内置的拖放框架：一个 `draggable` 属性 + 九个 drag 事件 + `dataTransfer` 数据桥。浏览器负责拖拽影像（被拖元素的半透明快照）、命中判定和与操作系统的数据通道（连桌面文件都能拖进来），开发者只声明"谁能拖、谁能收、收下干什么"。代价是事件流反直觉，且移动端全线不支持。

## 分格解读

### 格1 · 痛点现场

鼠标事件模拟拖拽要自己管理拖拽状态、边界计算、命中测试、幽灵元素，触摸端还得重来一遍；而从操作系统拖文件进网页（`DataTransfer.files`）受 OS 级限制，JS 模拟根本不可能。看板流转、列表排序、附件上传这类高频交互值得用原生能力。

### 格2 · 机制登场

拖拽生命周期分两端九个事件：源上 `dragstart → drag（高频）→ dragend`；目标上 `dragenter → dragover（高频）→ drop`，不投放而离开则 `dragleave`。三条铁律：①**dragover 必须 `preventDefault()`**——浏览器默认禁止投放，只有放行才等于声明"此处可收"，少了这行 drop 永远不触发、松手直接回弹；②drop 里通常也要 preventDefault，阻止打开链接等默认行为；③数据只能在 dragstart 用 `setData` 写、drop 用 `getData` 读，dragover 阶段出于安全只能读 `types` 列表。

### 格3 · 落地收束

排序精髓：dragover 高频回调里用 `getBoundingClientRect()` 比较各兄弟卡片几何中心与指针的位置，找到"该插到谁前面"，直接 `insertBefore` 移动真实元素（比拖完再排更流畅）；drop 事件委托在容器上监听，避免落在子元素上。文件拖入：dragover 放行后，drop 里读 `e.dataTransfer.files`，检查 `file.type` 再用 FileReader 读 data URL 预览；`setDragImage()` 可换自定义影像。移动端安卓全线不支持 drag 事件，标准替代是 Pointer Events：`pointerdown` 时 `setPointerCapture`，pointermove 跟幽灵元素 + `elementFromPoint` 找投放区，pointerup 触发业务——把"落点后干什么"抽成独立函数，两条路径复用。

## 码叔划重点

1. draggable=true 才是源；dragover 不 preventDefault，drop 永远不触发——DnD 第一大坑。
2. dataTransfer 是一次性信封：dragstart 写、drop 读，中途只许看 types；files 走系统级通道。
3. 排序在 dragover 里算中心点 insertBefore；移动端不支持原生 DnD，用 Pointer Events 复用同一业务。

## 自测一题

**问**：投放区监听了 drop 并写好了上传逻辑，但松手时卡片总是弹回原位、drop 回调一次都不进，最可能漏了什么？为什么浏览器要这样设计？

**答**：漏了在投放区的 `dragover`（以及通常 `dragenter`）事件里调用 `e.preventDefault()`。浏览器默认把"向页面投放内容"视为危险动作并一律禁止——防止用户误把桌面文件、链接拖进网页触发意外导航或上传；开发者必须在 dragover 上显式放行，浏览器才认为这个元素"愿意接收投放"，drop 事件才会在松手时派发。所以最小可用投放区永远是一对处理器：`dragover` 里 preventDefault（可顺带设 `dropEffect`），`drop` 里再 preventDefault 并读取 `dataTransfer` 执行业务。

## 动手实验

- 事件流日志 + setData/getData + effectAllowed/dropEffect + 自定义影像：[examples/html/08-drag-drop/index-01-drag-events-basics.html](../../examples/html/08-drag-drop/index-01-drag-events-basics.html)
- 拖拽排序列表 + 三列看板跨容器流转：[index-02-sortable-kanban.html](../../examples/html/08-drag-drop/index-02-sortable-kanban.html)
- DataTransfer.files 文件拖放 + FileReader 图片预览：[index-03-file-drop-preview.html](../../examples/html/08-drag-drop/index-03-file-drop-preview.html)

## 下一话预告

第 20 话《多媒体》——不用插件的播放器：source 格式回退、自动播放策略、字幕轨道与 picture 响应式决策。
