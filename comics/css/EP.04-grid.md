# 漫画 · 第 4 话 Grid：先分格，再落子

> 对应正文：[docs/css/04-grid.md](../../docs/css/04-grid.md) ｜ 原画：[EP.04-grid.svg](./EP.04-grid.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。写了两列 `1fr 1fr`，左列却被一条超长 SKU 编码顶成 3:1。
- **标签君**：HTML5 结构师，用 `grid-template-areas` 演示"ASCII 地图即页面骨架"。

## 剧情梗概

`1fr 1fr` 不等分，根因和 Flex 的 `min-width: auto` 同源——fr 轨道的下限默认是内容的 min-content。像素酱用 `minmax(0, 1fr)` 钳住下限，再用 `repeat(auto-fit, minmax(240px, 1fr))` 画出了一条零媒体查询的响应式画廊。

## 分格解读

### 格1 · 痛点现场

无空格的 SKU 字符串没有断行点，min-content 就是整串宽度。**fr 轨道的最小尺寸默认是 auto（不小于内容 min-content）**，于是"写好的 1fr 1fr"被内容顶成了 3:1。这与 Flex 的自动最小尺寸坑同源，Grid 里的修复方式是把轨道写成 `minmax(0, 1fr)`，或给内容容器加 `min-width: 0` + 截断。

### 格2 · 机制登场

Grid 是**二维**布局：`grid-template-columns/rows` 划分行 × 列轨道，项目落进格子。`grid-template-areas` 用一串字符串画出页面地图——`"header header" "nav main" "status status"` 看一眼就知道布局长什么样；窄屏重排只需改这一个字符串，所有落位规则零改动。网格线从 1 编号，负数从末尾倒数（-1 = 最后一条线），`span N` 表示跨 N 格。

### 格3 · 落地收束

`repeat(auto-fit, minmax(240px, 1fr))` 逐词翻译：重复（自动适配列数，每列最小 240px、最大 1 份）。**auto-fit 折叠空轨道**，项目被拉宽铺满整行；**auto-fill 保留空轨道**，列宽稳定但不拉伸——列表页用 auto-fill，横幅用 auto-fit。另外项目数量动态时记得设 `grid-auto-rows`，否则隐式行按内容自适应，"等高画廊"会参差不齐。

## 码叔划重点

1. Flex 管一维流，Grid 管二维格；选型先问"几根轴"。
2. 1fr 下限是 min-content，严格等分写 `minmax(0, 1fr)`。
3. auto-fit 折叠空轨铺满，auto-fill 保留空轨列宽稳；动态行数记得设 `grid-auto-rows`。

## 自测一题

**问**：容器里只有 3 张卡片、一行能装 6 列时，`auto-fill` 与 `auto-fit` 各是什么表现？

**答**：`auto-fill` 优先造空轨道——右侧留 3 列看不见的空列占位，卡片不拉伸；`auto-fit` 把空轨道折叠为 0，剩余空间分给实轨道，3 张卡片拉宽铺满整行。做"列宽稳定"的列表页用 auto-fill，做"永远铺满"的横幅用 auto-fit。

## 动手实验

- 轨道尺寸：fr、minmax、auto-fit vs auto-fill 对比：[examples/css/04-grid/](../../examples/css/04-grid/index-01-track-units.html)
- areas 页面骨架 + 网格线定位与 span：[index-02-areas-lines-span.html](../../examples/css/04-grid/index-02-areas-lines-span.html)
- 无媒体查询响应式画廊 + dense 密集流：[index-04-responsive-gallery.html](../../examples/css/04-grid/index-04-responsive-gallery.html)

## 下一话预告

同一套页面，手机上是单列、桌面端是三栏——第 5 话《响应式布局》，媒体查询与移动优先的正确姿势。
