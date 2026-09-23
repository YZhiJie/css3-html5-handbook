# 高频语法速查表

> 与 `docs/` 深度文档配套的速查手册：每个主题只保留最常用的语法模板与结论，开发中快速定位用。深入原理请进入对应文档。

## CSS 速查

### 1. 高级选择器

```css
/* 属性选择器 */
[href^="https"]   { }  /* 以 https 开头 */
[href$=".pdf"]    { }  /* 以 .pdf 结尾 */
[class*="btn"]    { }  /* 包含 btn */
[data-state~="active"] { } /* 含独立单词 active */

/* 结构伪类：nth 公式（an+b），奇偶可用 odd/even */
li:nth-child(3n + 1) { }
li:nth-last-child(-n + 3) { }   /* 最后三个 */

/* 逻辑组合：is 取最高优先级，where 恒为 0，has 向上选择父级 */
:is(h1, h2, h3) { }
:where(article p) { margin-block: 0; }
.card:has(img) { padding: 0; }          /* 含 img 的卡片 */
li:has(+ li) { margin-bottom: 8px; }    /* 后面还有兄弟的项 */

/* 伪元素 */
.icon::before { content: "→"; }
input::placeholder { color: #999; }
```

### 2. 动画与过渡

```css
/* 过渡：property duration timing-function delay */
.btn { transition: transform .3s cubic-bezier(.22,1,.36,1), opacity .2s; }
.btn:hover { transform: translateY(-2px); }

/* 关键帧动画 */
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: none; }
}
.tip { animation: slide-in .4s ease-out both; }
.tip.paused { animation-play-state: paused; }

/* 性能三原则：只动 transform / opacity；长列表用 IntersectionObserver 触发；
   尊重系统减弱动态偏好 */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

### 3. Flexbox

```css
.container {
  display: flex;
  flex-direction: row;          /* 主轴方向 */
  flex-wrap: wrap;              /* 换行 */
  justify-content: space-between; /* 主轴对齐 */
  align-items: center;          /* 交叉轴对齐 */
  gap: 12px;
}
.item { flex: 1 1 0; }          /* 等分：grow=1 shrink=1 basis=0 */
.item-fixed { flex: 0 0 200px; } /* 固定宽不伸缩 */

/* 文本溢出省略：flex 子项务必加 min-width: 0 */
.ellipsis { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 经典配方：粘性页脚 */
body { min-height: 100svh; display: flex; flex-direction: column; }
main { flex: 1; }
```

### 4. Grid

```css
/* 响应式卡片：无媒体查询自动换列 */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

/* 页面骨架：命名区域 */
.page {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
.page > header { grid-area: header; }

/* 网格线定位与跨度 */
.item { grid-column: 1 / span 2; grid-row: 2; }

/* 子网格：让子元素对齐父网格轨道（需要 @supports 检测） */
@supports (grid-template-columns: subgrid) {
  .row { display: grid; grid-column: 1 / -1; grid-template-columns: subgrid; }
}
```

### 5. 响应式设计

```html
<!-- 必备 viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

```css
/* 移动优先：min-width 向上增强 */
.grid { grid-template-columns: 1fr; }
@media (min-width: 768px)  { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(4, 1fr); } }

/* 流体排版：clamp(最小, 首选, 最大) */
h1 { font-size: clamp(1.5rem, 4vw + 1rem, 3rem); }

/* 容器查询：组件随容器而非视口变化 */
.card-wrap { container-type: inline-size; }
@container (min-width: 480px) {
  .card { display: flex; }
}

/* 视口单位：移动端优先用 svh/dvh，避免地址栏伸缩跳动 */
.hero { min-height: 100svh; }
```

### 6. 变量与计算

```css
:root {
  --brand: #2563eb;
  --gap: 12px;
  --header-h: 64px;
}
.page { padding-top: calc(var(--header-h) + var(--gap)); }

/* 主题切换：根元素属性覆盖即可全局生效 */
[data-theme="dark"] { --brand: #60a5fa; }

/* 注册变量类型，使其可过渡/可动画 */
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
```

```js
// JS 读写变量
el.style.setProperty('--brand', '#2563eb');
const gap = getComputedStyle(document.documentElement).getPropertyValue('--gap');
```

### 7. 阴影

```css
/* 卡片：两层组合（近实 + 远虚） */
.card { box-shadow: 0 1px 2px rgb(0 0 0 / .06), 0 8px 24px rgb(0 0 0 / .12); }
/* 悬浮态：y 偏移与模糊同步增大 */
.card:hover { box-shadow: 0 2px 4px rgb(0 0 0 / .08), 0 16px 40px rgb(0 0 0 / .18); }
/* 内阴影 */
.input { box-shadow: inset 0 2px 4px rgb(0 0 0 / .1); }
/* 文字霓虹：多层同色叠加 */
.neon { text-shadow: 0 0 6px #0ff, 0 0 18px #0ff; }
/* 不规则图形（PNG/SVG/气泡）用 filter，跟随透明轮廓 */
.bubble { filter: drop-shadow(0 6px 12px rgb(0 0 0 / .25)); }
```

### 8. 渐变

```css
/* 线性：角度或方向关键词 */
.banner { background: linear-gradient(135deg, #2563eb, #7c3aed); }
/* 径向 */
.spot  { background: radial-gradient(circle at 30% 30%, #fff, #2563eb 70%); }
/* 锥形：色轮 / 饼图 */
.pie   { background: conic-gradient(#2563eb 0 25%, #22c55e 25% 60%, #ef4444 60%); }
/* repeating 硬停靠条纹 */
.stripes { background: repeating-linear-gradient(45deg, #eee 0 10px, #ddd 10px 20px); }
/* 渐变文字 */
.grad-text {
  background: linear-gradient(90deg, #2563eb, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

### 9. Transform

```css
/* 2D：函数从右往左应用 */
.badge { transform: translate(-50%, -50%) rotate(45deg); }
/* 3D 翻转卡片 */
.scene { perspective: 1000px; }
.card3d { transform-style: preserve-3d; transition: transform .6s; }
.scene:hover .card3d { transform: rotateY(180deg); }
.face { backface-visibility: hidden; }
.face.back { transform: rotateY(180deg); }
/* 绝对定位居中 */
.center { position: absolute; inset: 0; margin: auto; width: max-content; height: max-content; }
```

## HTML 速查

### 1. 语义化骨架

```html
<body>
  <header>…<nav aria-label="主导航">…</nav></header>
  <main>
    <article>
      <h1>…</h1>
      <section>…</section>
      <figure><img src="…" alt="…"><figcaption>图注</figcaption></figure>
      <time datetime="2026-09-23">2026 年 9 月 23 日</time>
    </article>
    <aside>相关内容</aside>
  </main>
  <footer>…</footer>
</body>
<!-- 原生手风琴 -->
<details><summary>点击展开</summary>内容</details>
```

### 2. 表单增强

```html
<form novalidate id="signup">
  <label for="email">邮箱 <input id="email" name="email" type="email" required
        autocomplete="email" placeholder="you@example.com"></label>
  <input type="text" name="phone" pattern="1[3-9]\d{9}" title="11 位手机号">
  <input list="cities" name="city">
  <datalist id="cities">
    <option value="北京">
    <option value="上海">
  </datalist>
  <output name="score">0</output>
  <button type="submit">提交</button>
</form>
```

```js
// 约束校验 API
form.noValidate = true; // 关闭原生气泡，改用自定义提示
form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    form.reportValidity();          // 或逐字段 setCustomValidity('原因') 后提示
  }
});
// input.validity: valueMissing / typeMismatch / patternMismatch / tooShort …
```

### 3. Canvas

```js
// 初始化（含高清屏适配——必做）
const canvas = document.querySelector('canvas');
const dpr = window.devicePixelRatio || 1;
const { width: cw, height: ch } = canvas.getBoundingClientRect();
canvas.width = cw * dpr; canvas.height = ch * dpr; // 物理像素
const ctx = canvas.getContext('2d');
ctx.scale(dpr, dpr);                               // 逻辑坐标继续用 CSS 尺寸

// 动画循环
function draw(t) { /* 清屏 → 重绘 */ requestAnimationFrame(draw); }
requestAnimationFrame(draw);
```

### 4. SVG

```html
<!-- viewBox 定义逻辑坐标系，随容器等比缩放 -->
<svg viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="星星">
  <path d="M12 2l3 6.5 7 .8-5 4.8 1.3 7-6.3-3.5L5.7 21 7 14 2 9.3l7-.8z"/>
</svg>
<!-- 描边动画：dasharray 总长 + dashoffset 归零 -->
<style>
  .draw { stroke-dasharray: 100; stroke-dashoffset: 100; animation: draw 1s forwards; }
  @keyframes draw { to { stroke-dashoffset: 0; } }
</style>
<!-- 图标系统：symbol 定义 + use 引用 -->
<symbol id="icon-star" viewBox="0 0 24 24">…</symbol>
<svg><use href="#icon-star"/></svg>
```

### 5. Web 存储

```js
localStorage.setItem('key', JSON.stringify(value));   // 必须手动序列化
const v = JSON.parse(localStorage.getItem('key') ?? 'null');
localStorage.removeItem('key');                        // sessionStorage 同一套 API

// 跨标签页同步：同源其他标签页写入时触发（本页不触发）
window.addEventListener('storage', (e) => {
  console.log(e.key, e.newValue, e.oldValue);
});
// 安全红线：不存 token 等敏感信息（XSS 可读），只存偏好/草稿类数据
```

### 6. Web Workers

```js
// Blob 内联 Worker：file:// 双击可用的唯一可靠写法
const code = `self.onmessage = (e) => self.postMessage(e.data * 2);`;
const worker = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
worker.onmessage = (e) => console.log(e.data);
worker.postMessage(21);
worker.terminate(); // 用完释放

// 大数据零拷贝：转移 ArrayBuffer 所有权（转移后主线程不可再用）
worker.postMessage(buffer, [buffer]);
```

### 7. 地理定位

```js
navigator.geolocation.getCurrentPosition(
  (pos) => console.log(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
  (err) => console.log(err.code), // 1 拒绝授权 2 不可用 3 超时
  { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
);
// 约束：仅 https / localhost 可用；需用户授权；持续追踪用 watchPosition + clearWatch
```

### 8. 拖放 API

```js
// 三要素：draggable + dragover 阻止默认 + drop 取数据
dragEl.draggable = true;
dragEl.addEventListener('dragstart', (e) =>
  e.dataTransfer.setData('text/plain', dragEl.dataset.id));
zone.addEventListener('dragover', (e) => e.preventDefault()); // 没有这句 drop 不触发
zone.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
});

// 文件拖放
zone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file?.type.startsWith('image/')) {
    img.src = URL.createObjectURL(file); // 预览
  }
});
```

### 9. 多媒体

```html
<!-- video：多格式 source 按序尝试，poster 占位，playsinline 允许 iOS 行内播放 -->
<video controls muted playsinline preload="metadata" poster="cover.jpg" width="640">
  <source src="movie.webm" type="video/webm">
  <source src="movie.mp4"  type="video/mp4">
  <track src="zh.vtt" kind="subtitles" srclang="zh" label="中文" default>
  您的浏览器不支持 video。
</video>
<!-- 响应式图片：按条件切换资源（art direction） -->
<picture>
  <source media="(min-width: 800px)" srcset="wide.jpg">
  <img src="crop.jpg" alt="说明文字" loading="lazy">
</picture>
```

```js
// 自动播放策略：必须 muted 才可靠自动播放
video.play().catch(() => { /* 被策略拒绝，引导用户手动点击 */ });
```

## 兼容性底线速记

| 特性 | 可放心使用 | 需降级/检测 |
| --- | --- | --- |
| Flexbox、Grid、transition/transform、canvas、SVG、localStorage、拖放、地理定位、video/audio | Chrome 57+ / Safari 10.1+ 时代起全面可用 | — |
| `:is/:not`、`gap`(flex)、`clamp()` | 主流浏览器 2021+ | 老项目留 fallback |
| `:has()`、`@property`、`subgrid`、容器查询、`dvh/svh` | 2023+ 现代浏览器 | 用 `@supports` 检测后再启用 |
| SMIL 动画、Shared Worker | 逐渐边缘化 | 优先 CSS/JS 动画与 Dedicated Worker |
