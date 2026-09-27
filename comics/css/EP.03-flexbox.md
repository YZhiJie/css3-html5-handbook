# 漫画 · 第 3 话 Flexbox：一根轴的声明式布局

> 对应正文：[docs/css/03-flexbox.md](../../docs/css/03-flexbox.md) ｜ 原画：[EP.03-flexbox.svg](./EP.03-flexbox.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。工具栏里的长标题把按钮挤出容器，`flex: 1` 看起来"失灵"了。
- **标签君**：HTML5 结构师，在场帮忙看骨架，确认问题出在弹性分配而不是结构。

## 剧情梗概

长标题压不下去、按钮被挤出容器——这不是 bug，是 flex item 的自动最小尺寸在起作用。像素酱补上 `min-width: 0` 这张"救命符"，又顺手分清了 `flex: 1` 与 `flex: auto` 这对孪生兄弟。

## 分格解读

### 格1 · 痛点现场

`.title` 明明写了 `flex: 1; overflow: hidden;`，却压不到内容以下。原因：**flex item 的 `min-width` 初始值不是 0，而是 `auto`**——当 overflow 为 visible 时解析为内容最小尺寸（约等于 min-content）。装着长标题、长 URL 的项目永远缩不下去，整行溢出。修复：给要被压缩的子项加 `min-width: 0`。

### 格2 · 机制登场

Flex 的一切以"轴"为坐标系：`flex-direction` 指定**主轴**，与之垂直的是**交叉轴**。`justify-content` 永远管主轴，`align-items` 永远管交叉轴。把方向从 `row` 改成 `column` 后，两个属性的分工对象**随之对调**——这是"垂直居中到底写 align 还是 justify"困惑的根源。写样式前先默念一遍："主轴在哪？"

### 格3 · 落地收束

`flex: 1` 展开是 `1 1 0%`——基准为 0，剩余空间完全均分，**三列永远等宽**；`flex: auto` 展开是 `1 1 auto`——先按内容占位再均分剩余，**内容多者更宽**。一个做等分栏，一个做内容驱动的工具栏。另外记住：按钮、图标这类不该被拉伸压缩的"刚性元素"显式声明 `flex: none`（即 `0 0 auto`）。

## 码叔划重点

1. justify 管主轴，align 管交叉轴；`flex-direction: column` 时两者对调。
2. 要压缩的子项写 `min-width: 0`，省略号才能登场——Flex 第一大坑（column 方向同理是 `min-height: 0`）。
3. 等分 `flex: 1`，按内容 `flex: auto`，刚性元素 `flex: none`；间距一律 `gap`，别再用 `:not(:last-child)` margin 技巧。

## 自测一题

**问**：三列内容分别是 "1"、"标题很长很长很长"、"短"，`.a { flex: 1 }` 和 `.b { flex: auto }` 的表现有何不同？

**答**：`flex: 1`（basis 0）三项初始份额都是 0，剩余空间按 grow 完全均分，三列等宽；`flex: auto`（basis auto）初始份额等于各自内容宽度，剩余空间再均分，内容长的列更宽。本质区别在 `flex-basis` 的起点。

## 动手实验

- 主轴/交叉轴交互面板（direction、justify、align、wrap 实时切换）：[examples/css/03-flexbox/](../../examples/css/03-flexbox/index-01-axis-alignment.html)
- flex 三属性与 `flex:1` vs `flex:auto` 陷阱：[index-02-flex-grow-shrink-basis.html](../../examples/css/03-flexbox/index-02-flex-grow-shrink-basis.html)
- 圣杯布局 + 粘性页脚：[index-03-holy-grail-sticky-footer.html](../../examples/css/03-flexbox/index-03-holy-grail-sticky-footer.html)

## 下一话预告

一维排不下的二维对齐怎么办？第 4 话《Grid》：先分格，再落子，`1fr` 居然也有不听指挥的时候。
