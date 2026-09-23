# Canvas 绘图

> HTML5 `<canvas>` 是浏览器内建的"画布"位图绘制 API，是数据可视化、游戏、图像处理、粒子特效等场景的基石。本章覆盖 2D 上下文、坐标系与高清屏适配、路径与样式、变换、像素操作、动画循环、状态管理、离屏渲染与交互命中检测。

## 目录

- [1. 概念解释](#1-概念解释)
- [2. 语法说明](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（双击即可运行，零依赖）：

| 示例 | 说明 | 路径 |
| --- | --- | --- |
| 动画时钟 | 指针 + 刻度自绘，rAF 动画循环 | ../../examples/html/03-canvas/index-01-clock.html |
| 粒子背景 | 连线粒子 + 鼠标交互 | ../../examples/html/03-canvas/index-02-particles.html |
| 动态柱状图 | 数据驱动 + 缓动动画过渡 | ../../examples/html/03-canvas/index-03-barchart.html |
| 鼠标涂鸦板 | 路径记录 + pointer 事件 + 清屏/撤销 | ../../examples/html/03-canvas/index-04-doodle.html |

## 1. 概念解释 —— 是什么、解决什么问题、底层原理

### 1.1 是什么

`<canvas>` 是 HTML5 引入的一个**位图绘制元素**。它本身只是画布，没有任何绘制能力；真正干活的是通过 `canvas.getContext('2d')` 获取的 **CanvasRenderingContext2D** 对象（2D 上下文），以及 WebGL 使用的 WebGL 上下文（本章只讲 2D）。

```html
<canvas id="cv" width="600" height="400"></canvas>
```

```javascript
// 获取 2D 上下文：所有绘制 API 都挂在这个对象上
const ctx = document.getElementById('cv').getContext('2d');
ctx.fillRect(10, 10, 100, 50); // 画一个实心矩形
```

### 1.2 解决什么问题

- **HTML/CSS 无法表达的图形**：任意路径、圆弧、贝塞尔曲线、逐像素处理、动态粒子等。
- **性能**：一旦图形复杂（成千上万的点/粒子），用 DOM + CSS 会产生大量元素与重排；Canvas 直接在位图上作画，绘制成本与图形数量近似线性，且不参与 DOM 布局。
- **像素级控制**：`getImageData/putImageData` 可以读写每个像素，实现滤镜、抠图、马赛克等图像处理。

### 1.3 底层原理

- Canvas 在浏览器中对应一块**即时模式（Immediate Mode）位图**：你调用的每个绘制 API 都是"立刻把像素画到这块内存位图上"，画完即忘——浏览器不会保留"画过一个矩形"这个对象。这与 SVG 的**保留模式（Retained Mode）**相反：SVG 里每个图形都是 DOM 节点，浏览器持续跟踪并可在修改属性后自动重绘。
- 即时模式的直接推论：**动画必须自己重绘整帧**（清屏 → 重画所有内容），因此需要 `requestAnimationFrame` 驱动的渲染循环。
- 绘制发生在 GPU 加速的层上（现代浏览器对 Canvas 有硬件加速），但 2D 上下文 API 本身是同步的光栅化调用，频繁的 `save/restore`、状态切换会带来状态机开销。

### 1.4 坐标系与 devicePixelRatio 高清屏适配（关键坑）

Canvas 默认坐标系：**原点 (0,0) 在左上角，x 向右，y 向下**，单位是"位图像素"（注意不是 CSS 像素）。

`<canvas width="300" height="150">` 中，`width/height` 属性定义的是**绘图表面（backing store）的物理像素数**；而 CSS 里设置的宽高定义的是**显示尺寸**。当两者不一致时，位图会被拉伸。

问题在于：Retina/高分屏的 `devicePixelRatio (dpr) = 2 或 3`，1 个 CSS 像素对应 2~3 个物理像素。如果 canvas 的绘图表面只有 300×150，在 dpr=2 的屏幕上会被拉伸成模糊的 600×300——这就是"Canvas 在 Mac/手机上发虚"的经典原因。

**标准适配方案（三步）**：

```javascript
const dpr = window.devicePixelRatio || 1;          // 1. 取设备像素比
const cssWidth = 600, cssHeight = 400;             // 设计用的 CSS 尺寸
canvas.width = cssWidth * dpr;                     // 2. 绘图表面放大 dpr 倍
canvas.height = cssHeight * dpr;
canvas.style.width = cssWidth + 'px';              // 3. CSS 显示尺寸保持原样
canvas.style.height = cssHeight + 'px';
ctx.scale(dpr, dpr);                               // 之后所有绘制仍用 CSS 坐标
```

第 4 步 `ctx.scale(dpr, dpr)` 是关键：它让后续所有绘制坐标继续以"CSS 像素"为单位，浏览器在光栅化时自动乘以 dpr 输出高清像素。**注意 scale 应在所有绘制前调用一次**；若使用 `save/restore`，restore 会把 scale 一起还原，每帧重建变换时需重新执行。

## 2. 语法说明 —— 完整语法、属性/参数表、代码片段

### 2.1 元素与上下文

| API | 说明 |
| --- | --- |
| `canvas.width / canvas.height` | 绘图表面物理像素数；**修改任意一个都会清空画布并重置状态（含变换）** |
| `canvas.getContext('2d')` | 获取 2D 上下文；重复调用返回同一实例 |
| `canvas.toDataURL(type, q)` | 导出为 base64 图片（默认 PNG），可触发下载 |
| `canvas.toBlob(cb, type, q)` | 异步导出 Blob，适合大图 |

### 2.2 路径绘制

路径是"指令队列"：`beginPath()` 开启新路径，之后的 move/line/arc 只是入队，直到 `fill()/stroke()` 才真正光栅化。

| API | 说明 |
| --- | --- |
| `beginPath()` | 开始一条新路径（**画多个不相干图形前必须调用**，否则上一次路径会残留并重复描边） |
| `moveTo(x, y)` | 抬笔移动到某点，不画线 |
| `lineTo(x, y)` | 从当前点画直线到 (x, y) |
| `arc(x, y, r, start, end, anticlockwise)` | 圆弧；角度用**弧度**，`Math.PI` 即 180° |
| `arcTo(x1, y1, x2, y2, r)` | 经过控制点的圆角弧，常用于圆角矩形 |
| `rect(x, y, w, h)` | 向路径中添加矩形子路径 |
| `quadraticCurveTo(cx, cy, x, y)` | 二次贝塞尔（1 个控制点） |
| `bezierCurveTo(c1x, c1y, c2x, c2y, x, y)` | 三次贝塞尔（2 个控制点），曲线造型主力 |
| `closePath()` | 用直线闭合子路径（回到本子路径起点） |
| `fill()` / `stroke()` | 填充 / 描边当前路径 |
| `roundRect(x, y, w, h, r)` | 原生圆角矩形（较新 API，旧浏览器需手写） |

### 2.3 样式

| 属性/方法 | 说明 |
| --- | --- |
| `fillStyle` / `strokeStyle` | 填充/描边样式，支持颜色、渐变对象、pattern |
| `lineWidth` | 线宽（默认 1） |
| `lineCap` | 线端样式：`butt`(默认) / `round` / `square` |
| `lineJoin` | 转角样式：`miter`(默认) / `round` / `bevel` |
| `setLineDash([a, b])` + `lineDashOffset` | 虚线样式与偏移（可用于"描边生长"动画） |
| `shadowColor / shadowBlur / shadowOffsetX / shadowOffsetY` | 阴影；**阴影绘制开销大，慎用于逐帧动画** |
| `globalAlpha` | 全局透明度 0~1 |
| `globalCompositeOperation` | 合成模式：`source-over`(默认)、`destination-out`(挖空)、`lighter`(叠加发光) 等 |

创建线性/径向渐变：

```javascript
// 线性渐变：从 (0,0) 到 (0,100)，颜色沿这条线段插值
const g = ctx.createLinearGradient(0, 0, 0, 100);
g.addColorStop(0, '#3b82f6'); // 0% 处颜色
g.addColorStop(1, '#8b5cf6'); // 100% 处颜色
ctx.fillStyle = g;

// 径向渐变：两个圆之间的插值，常做光晕/球体
const rg = ctx.createRadialGradient(50, 50, 5, 50, 50, 60);
```

### 2.4 变换与状态

| API | 说明 |
| --- | --- |
| `translate(x, y)` | 平移坐标原点；旋转前先 translate 到旋转中心是标准套路 |
| `rotate(rad)` | 绕**当前原点**顺时针旋转 |
| `scale(sx, sy)` | 缩放（也影响 lineWidth） |
| `save()` | 压栈当前全部状态（变换、样式、裁剪区） |
| `restore()` | 弹栈恢复 |
| `setTransform(a,b,c,d,e,f)` / `resetTransform()` | 直接设置/重置变换矩阵 |
| `clearRect(x, y, w, h)` | 清除区域为透明；**清屏必须用它**（fillRect 白色会盖住透明底） |

变换叠加：`ctx.rotate(Math.PI / 6)` 让坐标轴旋转 30°，之后画的所有内容都随之旋转。绘制"表针"的经典写法：`save → translate(中心) → rotate(角度) → 画竖线 → restore`。

### 2.5 文本与图像

```javascript
ctx.font = 'bold 16px "PingFang SC", sans-serif'; // 与 CSS font 简写语法一致
ctx.textAlign = 'center';       // 水平对齐：left/center/right
ctx.textBaseline = 'middle';    // 垂直基线：top/middle/alphabetic(默认)/bottom
ctx.fillText('你好 Canvas', 100, 50);
const w = ctx.measureText('你好 Canvas').width; // 测量文本宽度，用于自适应布局
```

`drawImage(img, dx, dy, dw, dh)` 可将 `<img>`、另一个 `<canvas>`（离屏画布）、`<video>` 帧绘制到当前画布，是离屏渲染与图像处理的基础。

### 2.6 像素操作

```javascript
// getImageData 返回 ImageData：data 是 RGBA 字节数组，每 4 个字节一个像素
const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const d = imgData.data;
for (let i = 0; i < d.length; i += 4) {
  const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114; // 加权灰度
  d[i] = d[i + 1] = d[i + 2] = gray; // R=G=B 即灰度图
}
ctx.putImageData(imgData, 0, 0); // 写回画布
```

思想总结：**Canvas 本质是一块可读写的 RGBA 缓冲区**。任何"滤镜/马赛克/抠图"都可以归结为"遍历像素 → 修改 RGBA → 写回"。注意：受同源策略限制，画过跨域图片的画布会被"污染（tainted）"，此时调用 `getImageData/toDataURL` 会抛异常。

### 2.7 动画循环与帧率

```javascript
let last = performance.now();
function frame(now) {
  const dt = (now - last) / 1000; // 距上一帧的秒数
  last = now;
  update(dt);  // 按真实时间步进，保证不同刷新率下速度一致
  render();    // 清屏 + 重绘整帧
  requestAnimationFrame(frame); // 注册下一帧
}
requestAnimationFrame(frame);   // 启动循环
```

`requestAnimationFrame (rAF)` 相比 `setTimeout` 的优势：与显示器刷新同步（通常 60/120fps）、页面不可见时自动暂停（省电）、由浏览器统一调度减少抖动。**做动画必须用 dt（时间步长）驱动位移**，否则 60Hz 和 120Hz 屏幕上动画速度差一倍。

## 3. 浏览器兼容性

> 以下为大致基线（数据参考 caniuse，绘制 API 主体自 2012 年前后即已稳定），使用前请以 caniuse 实时数据为准。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `<canvas>` 元素 + 2D 上下文 | 4+ | 12+ | 3.6+ | 3.1+ | iOS Safari 3.2+ / Android WebView 全支持 | 基础能力极稳定，可放心使用 |
| `requestAnimationFrame` | 24+ | 12+ | 23+ | 6.1+ | 同内核版本 | 旧版 IE9- 不支持，需 polyfill |
| `createLinearGradient / createRadialGradient` | 4+ | 12+ | 3.6+ | 3.1+ | 全支持 | Safari 对渐变端点重合会绘制异常 |
| `setLineDash` 虚线 | 23+ | 12+ | 27+ | 7+ | iOS 7+ / Android 4.4+ | 旧 Android WebView 不支持，需检测回退 |
| `ellipse` 椭圆 | 31+ | 12+ | 48+ | 9+ | iOS 9+ | Firefox 48 才支持，稍晚 |
| `roundRect` 原生圆角矩形 | 99+ | 99+ | 112+ | 16+ | 较新 | 太新，生产建议手写圆角函数 |
| `getImageData / putImageData` | 4+ | 12+ | 3.6+ | 3.1+ | 全支持 | 画过跨域图后画布被污染会抛 SecurityError |
| `OffscreenCanvas`（离屏 + Worker） | 69+ | 79+ | 105+ | 16.4+ | iOS 16.4+ | 较新；传统 `document.createElement('canvas')` 离屏则全兼容 |
| `toDataURL / toBlob` | 4+ | 12+ | 3.6+ | 3.1+ | 全支持 | toDataURL 大图同步阻塞主线程 |

**总备注**：Canvas 2D 属于"上古已稳定"API，兼容性基本不是问题；真正需要注意的是 `OffscreenCanvas`、`roundRect` 等新成员，以及高分屏 dpr 适配这一"所有浏览器都存在"的普适问题。

## 4. 使用场景示例

### 4.1 场景一：动画时钟（刻度 + 时分秒针自绘）

**场景描述**：用纯 Canvas 绘制一个模拟时钟，展示路径、变换（translate+rotate）、rAF 动画循环与 dpr 适配的综合运用。

**完整代码**（节选核心，完整可运行版见 [../../examples/html/03-canvas/index-01-clock.html](../../examples/html/03-canvas/index-01-clock.html)）：

```javascript
// ===== 高清屏适配：位图放大 dpr 倍，CSS 尺寸不变，坐标系 scale 回来 =====
const dpr = window.devicePixelRatio || 1;
canvas.width = size * dpr;
canvas.height = size * dpr;
canvas.style.width = size + 'px';
ctx.scale(dpr, dpr);

function drawHand(angle, length, width, color) {
  ctx.save();
  ctx.translate(size / 2, size / 2); // 把原点移到表盘中心
  ctx.rotate(angle);                 // 绕中心旋转；0 弧度指向 12 点方向再调整
  ctx.beginPath();
  ctx.moveTo(0, 10);                 // 针尾略过中心，视觉更真实
  ctx.lineTo(0, -length);            // 沿 -y 方向画针身（初始朝上）
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';             // 圆头针更精致
  ctx.stroke();
  ctx.restore();                     // 恢复变换，避免影响后续绘制
}

function render() {
  const now = new Date();
  const sec = now.getSeconds() + now.getMilliseconds() / 1000; // 秒带小数 → 平滑扫动
  const min = now.getMinutes() + sec / 60;
  const hr  = (now.getHours() % 12) + min / 60;
  // 2π 分 60 份 → 每秒 6°；从 12 点方向起算需整体减 90°（-π/2）
  drawHand((sec / 60) * Math.PI * 2, R * 0.75, 2, '#ef4444');
  drawHand((min / 60) * Math.PI * 2, R * 0.55, 4, '#1f2937');
  drawHand((hr  / 12) * Math.PI * 2, R * 0.40, 6, '#111827');
}

(function loop() { render(); requestAnimationFrame(loop); })();
```

**逐段注释**：`dpr` 三步适配解决高分屏模糊；`translate` 先把原点搬到表盘中心，`rotate` 才能绕中心转；角度公式 `(value / total) * 2π` 把时间量映射为弧度，减 `π/2` 是因为 0 弧度在 3 点方向；秒针带上毫秒小数实现"扫秒"而非"跳秒"。

**预期效果**：圆形表盘 + 60 根刻度（5 的倍数加粗），红秒针平滑扫动，黑分针/时针缓慢走动，任意高分屏下锐利不虚。

### 4.2 场景二：粒子背景（连线粒子 + 鼠标交互）

**场景描述**：经典"科技感"背景——N 个粒子随机漂移，距离近的粒子间画连线，鼠标靠近时连线增强并把粒子推开。见 [../../examples/html/03-canvas/index-02-particles.html](../../examples/html/03-canvas/index-02-particles.html)。

```javascript
for (let i = 0; i < particles.length; i++) {
  const p = particles[i];
  // 移动：x += vx * dt，碰到边界速度取反（反弹）
  p.x += p.vx * dt; p.y += p.vy * dt;
  if (p.x < 0 || p.x > W) p.vx *= -1;
  if (p.y < 0 || p.y > H) p.vy *= -1;

  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();
}

// 双重循环计算两两距离，小于阈值时按距离画连线（越近越不透明）
for (let i = 0; i < particles.length; i++) {
  for (let j = i + 1; j < particles.length; j++) {
    const dx = particles[i].x - particles[j].x;
    const dy = particles[i].y - particles[j].y;
    const dist = Math.hypot(dx, dy);
    if (dist < 120) {
      ctx.strokeStyle = `rgba(56,189,248,${1 - dist / 120})`;
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(particles[j].x, particles[j].y);
      ctx.stroke();
    }
  }
}
```

**逐段注释**：粒子是"位置 + 速度"的简单物理模型，`dt` 保证不同刷新率速度一致；连线透明度用 `1 - dist/阈值` 做线性衰减，产生自然的"聚拢感"；两两距离是 O(n²)，粒子数建议 ≤150，并可先做"粗筛"（行分桶/网格）优化。

**预期效果**：深蓝背景上光点缓慢漂移并互相连线，鼠标划过时附近连线被"点亮"且粒子被轻推，形成可交互的星空网格。

### 4.3 场景三：动态柱状图（数据驱动 + 缓动动画过渡）

**场景描述**：数据可视化最常见图形。点击"换一组数据"，柱子用缓动函数从旧高度过渡到新高度，演示"数值插值"动画思想。见 [../../examples/html/03-canvas/index-03-barchart.html](../../examples/html/03-canvas/index-03-barchart.html)。

```javascript
// 每根柱子持有 from/to/current 三个值，动画就是在 current 上向 to 插值
bars.forEach((b, i) => {
  // easeOutCubic：先快后慢的缓动，动画观感比线性自然得多
  const t = Math.min(1, elapsed / DURATION);
  const ease = 1 - Math.pow(1 - t, 3);
  b.current = b.from + (b.to - b.from) * ease;
});
// 绘制：柱宽 = (画布宽 - 边距) / 数量 * 0.6，高度 = current / 最大值 * 可用高度
```

**逐段注释**：动画的本质是**在两个数值间随时间插值**；`easeOutCubic = 1-(1-t)³` 是最常用的缓出曲线；柱宽按"可用宽度 ÷ 根数 × 0.6"计算，留出间隙，数据量变化时布局自动适应。

**预期效果**：八根蓝色渐变柱 + 顶部数值 + 底部类目标签；点击按钮后柱子以先快后慢的节奏长到新高度，Y 轴刻度同步刷新。

### 4.4 场景四：鼠标涂鸦板（路径记录 + 撤销重做）

**场景描述**：自由绘图工具。演示 pointer 事件、`moveTo/lineTo` 增量绘制、以及"把每笔存成数据、撤销时重放"的状态管理思想。见 [../../examples/html/03-canvas/index-04-doodle.html](../../examples/html/03-canvas/index-04-doodle.html)。

```javascript
// 每一笔 = { 点数组, 颜色, 线宽 }；撤销/重做只需操作数组再整帧重放
canvas.addEventListener('pointerdown', e => {
  drawing = true;
  strokes.push({ color: curColor, width: curWidth, points: [getPos(e)] });
  canvas.setPointerCapture(e.pointerId); // 拖出画布也能继续收到 move
});
canvas.addEventListener('pointermove', e => {
  if (!drawing) return;
  const s = strokes[strokes.length - 1];
  const pos = getPos(e);
  s.points.push(pos);
  // 增量绘制：只画"上一段线"而不重放整笔，性能好；撤销时才整帧重放
  ctx.beginPath();
  ctx.moveTo(...s.points[s.points.length - 2]);
  ctx.lineTo(...pos);
  ctx.stroke();
});
```

**逐段注释**：用 `pointerdown/move/up` 而非 mouse 事件，可同时兼容鼠标/触屏/手写笔；`getPos` 内部要把 `clientX/Y` 减去画布偏移量，才是画布内坐标；**"存数据 + 重放"是 Canvas 撤销功能的通用解法**，比逐帧 `getImageData` 存快照省内存得多。

**预期效果**：画布上按住拖动即画线（圆头、平滑），可切换 5 种颜色与 3 种线宽，撤销/重做/清空按钮均实时生效。

## 5. 实际应用案例分析

### 5.1 案例：数据可视化大屏中的 Canvas 混合方案

某政务/工业监控大屏需要在 4K 分辨率下同时渲染：地图轮廓（GeoJSON，数万顶点）、上千条流动弧线、数百个实时跳动的数据点。若全部用 SVG/DOM 实现，节点数爆炸导致内存占用高、交互时重排卡顿。

**选型与分层**：

1. **静态层（Canvas）**：地图、网格、装饰环等不变内容画进一张离屏 Canvas，仅在 resize 时重绘一次，主循环里用 `drawImage` 一次性贴上——避免每帧重复绘制数万条路径。
2. **动态层（Canvas）**：流动弧线、脉冲点在独立 canvas 上每帧重绘；两层叠放，互不干扰。
3. **交互层（SVG/DOM）**：tooltip、可点击的热区用少量 DOM/SVG 元素叠加——浏览器免费获得事件系统与 CSS 样式，弥补 Canvas 事件能力弱的短板。

**踩坑记录**：

- 4K 大屏 dpr 问题：不适配 dpr 时整屏发虚；适配后又因 `width*2` 的位图过大导致低端核显掉帧——最终按"最大 dpr=2 封顶"折中（`Math.min(devicePixelRatio, 2)`）。
- O(n²) 连线计算在 1000 粒子时掉到 30fps：引入**空间网格分桶**，只比较相邻格子内的粒子，帧率回到 58fps+。
- 页面隐藏时 rAF 自动暂停，但 WebSocket 数据仍在堆积：恢复可见时用"直接跳到最新数据"而非"重放所有历史帧"，避免瞬时抽风。

### 5.2 案例：在线图片编辑器中的像素处理

某电商详情页工具需要前端完成"一键变亮/去雾/马赛克"。技术路线即第 2.6 节的像素思想：

- 把图片 `drawImage` 到离屏 Canvas，`getImageData` 拿到 RGBA 数组；
- 亮度 = 每通道加偏移；去雾 = 对比度拉伸（按直方图重映射）；马赛克 = 按 8×8 块取均值再整体写回；
- 用 `putImageData` 写回工作画布；导出用 `toBlob('image/jpeg', 0.9)` 上传。

**踩坑记录**：跨域图片必须让图床返回 CORS 头并对 `<img>` 设置 `crossOrigin="anonymous"`，否则画布被污染，`getImageData` 直接抛 `SecurityError`；大图逐像素循环耗时明显，解决方案是把处理放到 `OffscreenCanvas` + Web Worker，主线程保持流畅。

## 6. 最佳实践与常见坑

1. **永远做 dpr 适配**：`canvas.width = cssSize * dpr` + `ctx.scale(dpr, dpr)`，否则 Retina 屏必糊；dpr 封顶 2 控制大屏位图体积。
2. **改 `width/height` 属性会清空画布并重置所有状态**（含变换与样式）。resize 后要重建 dpr 变换，不要以为样式还在。
3. **画多个图形前 `beginPath()`**：路径是累积的，忘记 beginPath 会导致旧路径被重复 fill/stroke，颜色"串色"。
4. **清屏用 `clearRect`**，别用 `fillRect` 白色（会破坏透明底），也别依赖 `closePath`（那是闭合路径不是清屏）。
5. **动画用 `requestAnimationFrame` 并按 `dt`（时间步长）驱动**：位置 += 速度 × dt，才能在不同刷新率下速度一致；不要用 setInterval（不与刷新同步、后台照跑）。
6. **用 `save/restore` 包裹局部变换**：rotate/scale/translate 是全局累积的，忘了 restore 会让后续绘制"歪掉"；样式同理。
7. **静态内容放离屏 Canvas**，主循环 `drawImage` 贴图；避免每帧重复绘制成千上万条路径，这是大屏/游戏卡顿的头号原因。
8. **阴影与 `filter` 开销大**：逐帧给大量对象加 shadowBlur 会显著掉帧，可用预渲染"光晕贴图 + drawImage"替代。
9. **Canvas 没有事件系统**：需要命中检测时自己算（`isPointInPath` / `isPointInStroke` / 距离公式），或对交互密集区域改用 SVG/DOM。
10. **文本缩放别用 scale**：`ctx.scale(2,2)` 放大文字会虚；直接调大 `ctx.font` 再绘制。
11. **像素操作注意画布污染**：跨域图片必须 CORS + `crossOrigin`，否则 `getImageData/toDataURL` 抛异常。
12. **控制粒子/对象数量**：两两连线是 O(n²)，超预算时用空间分桶（网格）优化，或限制总数。

## 7. 参考资料

- MDN Canvas 教程：<https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial>
- MDN CanvasRenderingContext2D API：<https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D>
- MDN `requestAnimationFrame`：<https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame>
- MDN 优化 Canvas 性能：<https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Optimizing_canvas>
- MDN 像素操作（Image manipulations）：<https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas>
- WHATWG HTML 规范 · canvas：<https://html.spec.whatwg.org/multipage/canvas.html>
- caniuse · Canvas：<https://caniuse.com/canvas>
- caniuse · requestAnimationFrame：<https://caniuse.com/requestanimationframe>
