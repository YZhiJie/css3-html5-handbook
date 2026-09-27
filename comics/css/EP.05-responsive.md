# 漫画 · 第 5 话 响应式：一套代码，适配无穷屏幕

> 对应正文：[docs/css/05-responsive.md](../../docs/css/05-responsive.md) ｜ 原画：[EP.05-responsive.svg](./EP.05-responsive.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。页面在手机上被缩成蚂蚁字，气得跳脚——罪魁祸首是缺失的 viewport meta。
- **标签君**：HTML5 结构师，搬出"响应式五层次"金字塔，并演示同一张卡片放进侧栏、主区都能自动适配的容器查询。

## 剧情梗概

响应式的本质是"一套代码适配无穷的浏览环境"。像素酱先补上 viewport meta 这块地基，再学会移动优先的媒体查询姿势，最后用 clamp() 把字号从"逐档跳变"升级成"连续流动"，用容器查询让组件"自带布局策略"。

## 分格解读

### 格1 · 痛点现场

没写 viewport meta 时，移动浏览器假定页面是 980px 宽的"桌面页"：先按 980px 渲染，再整体缩小塞进屏幕——字小如蚂蚁，手指点不准，一切响应式都无从谈起。`width=device-width` 把布局视口设为设备逻辑宽度，`initial-scale=1` 取消初始缩放，这是响应式的第一行代码。

### 格2 · 机制登场

现代响应式是五个层次的叠加：viewport meta 定像素基准 → 媒体查询按设备切换 → clamp() 让字号连续流动 → 容器查询按组件容器宽度响应 → 逻辑属性与 srcset 管方向与资源。写法上坚持**移动优先**：基础样式给手机，宽了再用 `min-width` 增强；断点不照搬设备宽度表，而是插在"当前设计开始变丑"的地方。

### 格3 · 落地收束

`clamp(1.5rem, 4vw + 1rem, 3rem)` 一行替代五档断点：字号随视口线性增长，两端被钳住——窄屏触底 1.5rem 不至于看不清，大屏封顶 3rem 不至于失控。容器查询则让组件自带布局策略：同一张卡片，放进 360px 的侧栏自动竖排，放进 720px 的主区自动横排，放哪都对。

## 码叔划重点

1. 先写 viewport meta——没有它，移动端一切响应式都无从谈起。
2. 移动优先：基础样式给手机，宽了再 min-width 增强；断点插在"开始变丑"处，不照搬设备表。
3. 移动端 100vh 会被地址栏坑，用 100dvh；hover 效果包进 `(hover: hover)`，别在触屏上空等。

## 自测一题

**问**：手机上 `height: 100vh` 的全屏 Banner 为什么总"高出一截"？该换哪个单位？

**答**：移动端地址栏收放会改变可视高度，而 100vh 按"最大视口"计算，包含被地址栏遮住的部分。换 `100dvh`（动态视口高度，实时跟随地址栏）即可；需要钉死两端时用 `svh`（最小）/`lvh`（最大）。

## 动手实验

- 媒体查询断点策略 + 视口单位 + clamp 流体排版：[examples/css/05-responsive/](../../examples/css/05-responsive/index-01-media-queries.html)
- 容器查询组件化响应 + 逻辑属性与国际化：[index-02-container-queries.html](../../examples/css/05-responsive/index-02-container-queries.html)
- 响应式图片与常用响应式布局模式：[index-03-fluid-images-layout.html](../../examples/css/05-responsive/index-03-fluid-images-layout.html)

## 下一话预告

第 6 话《变量与 calc》——CSS 的"运行时"与"计算器"，改主题色不再全局搜索替换。
