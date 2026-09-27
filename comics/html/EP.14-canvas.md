# 漫画 · 第 14 话 Canvas：即时模式位图

> 对应正文：[docs/html/03-canvas.md](../../docs/html/03-canvas.md) ｜ 原画：[EP.14-canvas.svg](./EP.14-canvas.svg)

## 登场角色

- **像素酱**：CSS 造型师，第一次用 canvas 画时钟，桌面浏览器好好的，一上 Retina 屏指针和数字全糊了，她以为是字体问题。
- **标签君**：HTML5 结构师，讲清 canvas 的 `width` 属性（物理像素）与 CSS 尺寸（显示尺寸）的区别，并演示 dpr 适配三步。

## 剧情梗概

`<canvas>` 本身只是一块画布，真正干活的是 `getContext('2d')` 返回的 2D 上下文。它是**即时模式**位图：每个绘制调用立刻把像素写进内存，画完即忘——浏览器不保留"这里有个圆"这个对象。因此动画必须由 `requestAnimationFrame` 驱动，每帧清屏、重画全部内容。本话还解决最高频的线上坑：高分屏发虚。

## 分格解读

### 格1 · 痛点现场

`<canvas width="300" height="150">` 定义的是**绘图表面的物理像素数**，CSS 宽高定义的是**显示尺寸**。Retina/手机的 `devicePixelRatio` 是 2 或 3，300×150 的位图被拉伸到 600×300 显示，线条和文字自然发虚。这与 CSS 矢量图形完全不同——位图一旦被放大就模糊。

### 格2 · 机制登场

即时模式的工作循环：`requestAnimationFrame` 等屏幕刷新信号 → `clearRect` 清空位图 → 重画当前帧的全部图形，循环往复。路径本身是"指令队列"：`beginPath` 之后的 `moveTo/lineTo/arc/bezierCurveTo` 只是入队，直到 `fill()/stroke()` 才真正光栅化；画多个不相干图形前不调 `beginPath`，上一条路径会残留并被重复描边。

### 格3 · 落地收束

高清适配标准三步：①`canvas.width/height = CSS 尺寸 × dpr` 放大绘图表面；②`canvas.style.width/height` 保持 CSS 尺寸不变；③`ctx.scale(dpr, dpr)` 后继续用 CSS 坐标绘制（scale 要在所有绘制前调用，`restore` 会把它一起还原）。典型场景：rAF 动画时钟、连线粒子背景、数据驱动的缓动柱状图、pointer 事件涂鸦板——图形数量大、要逐像素控制时，Canvas 比海量 DOM 省得多。

## 码叔划重点

1. canvas 只是画布，2d 上下文才握画笔；即时模式画完即忘，动画每帧整屏重画。
2. 高清三步：表面 ×dpr、style 保持 CSS 尺寸、ctx.scale(dpr,dpr) 后再按 CSS 坐标绘制。
3. beginPath 画新图形前必调，否则旧路径残留重复描边；修改 width/height 会清空画布并重置状态。

## 自测一题

**问**：dpr 适配时只把 `canvas.width` 放大了 2 倍但忘了 `ctx.scale(2,2)`，画面会出现什么现象？为什么？

**答**：所有图形都只画在画布左上角的四分之一区域，尺寸也缩小成一半。因为放大的是**绘图表面**（位图变成 600×300），而坐标系仍以物理像素为单位——你按设计稿画的 `fillRect(0,0,100,50)` 只落在 600×300 位图的左上角，CSS 又把整块位图缩回 300×150 显示，于是图形变小且聚在左上。`ctx.scale(dpr,dpr)` 的作用正是把坐标系整体放大，让后续绘制继续以"CSS 像素"为单位，浏览器光栅化时自动乘以 dpr。

## 动手实验

- 动画时钟：指针刻度自绘 + rAF 动画循环：[examples/html/03-canvas/index-01-clock.html](../../examples/html/03-canvas/index-01-clock.html)
- 粒子背景：连线粒子 + 鼠标交互：[index-02-particles.html](../../examples/html/03-canvas/index-02-particles.html)
- 动态柱状图：数据驱动 + 缓动动画过渡：[index-03-barchart.html](../../examples/html/03-canvas/index-03-barchart.html)
- 鼠标涂鸦板：路径记录 + pointer 事件 + 清屏/撤销：[index-04-doodle.html](../../examples/html/03-canvas/index-04-doodle.html)

## 下一话预告

第 15 话《SVG》——画完即忘的反面：图形即 DOM，无限缩放、可绑事件、还能描边生长。
