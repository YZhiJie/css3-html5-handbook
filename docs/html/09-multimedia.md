# 多媒体元素（Video / Audio / Picture）

> 面向前端开发人员的 HTML5 高级特性参考资料 —— 原生视频音频、字幕轨道、自动播放策略与响应式图片，一网打尽。

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
| [index-01-video-attributes.html](../../examples/html/09-multimedia/index-01-video-attributes.html) | video 全属性开关实验台 + source 多格式 + track 字幕 + 加载失败占位 |
| [index-02-js-controls.html](../../examples/html/09-multimedia/index-02-js-controls.html) | 自定义播放器：play/pause/进度/音量/倍速 + 媒体事件流实时日志 |
| [index-03-picture-canvas-audio.html](../../examples/html/09-multimedia/index-03-picture-canvas-audio.html) | picture 响应式与 art direction（SVG data URI，零网络）+ Canvas/captureStream + Web Audio 可视化 |

---

## 1. 概念解释

### 1.1 多媒体元素是什么

HTML5 把浏览器变成了无需插件的播放器：`<video>` 与 `<audio>` 是**带完整播放管线的原生控件**——解码、缓冲、进度、音量、字幕全部内建，JS 通过同一套 HTMLMediaElement 接口控制。`<picture>` 则是图片领域的"响应式决策器"：让浏览器根据**设备条件**（视口宽度、DPR、格式支持）从多个源中挑一张最合适的。

### 1.2 解决什么问题

- **告别 Flash**：统一由浏览器内核解码，性能、电量、安全全面受益；移动端还能利用硬件解码。
- **字幕与无障碍**：`<track>` 让字幕、说明文字、章节成为结构化数据，读屏与搜索引擎都能理解，而不像早期把字幕"烧"进视频画面。
- **流量与清晰度的平衡**：`source` 多格式 + `picture` 多分辨率，让 4K 屏不浪费 1x 图，让不支持 HEVC 的浏览器平滑回退。
- **自动播放的合规化**：浏览器用"自动播放策略"替代一刀切禁止，开发者用 `muted autoplay` 满足"首屏即看"的运营需求。

### 1.3 底层原理

**`source` 的选择顺序是"第一个浏览器宣称支持的"**，而不是"最好的"：浏览器按 `source` 出现顺序遍历，检查 `type` 属性（MIME）与自身解码能力（有的还会参考 `media` 条件），**命中第一个就停止**。因此排列策略是：把最优先的格式放前面，兜底格式放最后。这也是"MP4(H.264) 放前面还是 WebM 放前面"的答案依据——H.264 有硬件解码与专利生态优势，绝大多数站点把 MP4 放第一。

**自动播放策略（Autoplay Policy）**是三端各自实现但方向一致的规则：

- 有声自动播放被禁：`autoplay` 属性只有配 `muted`（或用户与该域名有"媒体参与度"历史）才会生效；
- 静音自动播放几乎全绿：`autoplay muted playsinline` 是短视频信息流的标准姿势；
- 违规调用 `play()` 返回的 Promise 被 reject（`NotAllowedError`），**必须捕获**，否则控制台报未处理异常且静音降级逻辑失效；
- iOS Safari 特殊要求：内联播放必须 `playsinline`，否则全屏接管页面。

**媒体事件流**（理解播放器开发的钥匙）——一次正常播放的典型序列：

```
loadstart → durationchange → loadedmetadata → loadeddata →
canplay → (play) → play → timeupdate* → (pause) → pause →
(ended) → ended
```

- `loadedmetadata`：拿到 `duration/videoWidth`，**进度条初始化的最早时机**；
- `canplay`：当前位置可立即起播；`canplaythrough`：按当前速率可流畅播完（预加载充分）；
- `timeupdate`：约每 250ms 触发一次，是进度条与"剩余时间"的驱动事件；
- `volumechange`：音量与静音变化；`ratechange`：倍速变化；
- `waiting`/`playing`：缓冲从"饿"到"饱"的切换对，用它做 loading 菊花；
- `error`：出错时**在出错的 source 元素上触发**（不在 video 上），这是"加载失败占位"的关键。

**`preload` 三档**：`none`（不预载，点播才拉）、`metadata`（只拉时长/尺寸）、`auto`（尽力预载）。它是**提示而非命令**，浏览器可因省流量策略无视（iOS Safari 长期近似 `none`）。

**`picture` 的决策模型**：`<picture>` 本身不渲染内容，它是一个"源选择器"容器。浏览器从上到下评估每个 `<source>` 的 `media` 与 `type` 条件，命中第一个即用其 `srcset`；全不命中则回退 `<img>`。与 `source`（媒体）不同，图片选择是**一次性、布局时**完成的——用户拉伸窗口时浏览器会重新评估（有迟滞），但它不监听网络变化。`sizes` 属性告诉浏览器"这张图在当前布局下多宽"，配合 `srcset` 的 `w` 描述符，浏览器自己算出最省的候选——这是 DPR × 布局宽的二维决策。

**Web Audio 与媒体元素的关系**：`<video>/<audio>` 是"黑盒播放管线"；Web Audio 是"可编程音频图"（节点图）。两者通过 `AudioContext.createMediaElementSource()` 打通：把媒体元素接进音频图后可接 AnalyserNode 做可视化、GainNode 做音量曲线、FilterNode 做均衡器。注意：**接入后元素自身的输出被重定向到音频图**，最终必须 `connect(audioContext.destination)` 才有声音。

---

## 2. 语法说明

### 2.1 `<video>` / `<audio>` 属性表（两者共用大部分属性）

| 属性 | 作用 | 注意 |
| --- | --- | --- |
| `controls` | 显示原生控制条 | 与自定义控制条二选一（都开会 UI 叠加） |
| `autoplay` | 自动播放 | **必须配 `muted` 才能大概率成功**；有声版本依赖用户参与度 |
| `muted` | 静音 | 独立属性；`video.muted = true` 可 JS 切换 |
| `loop` | 循环播放 | `ended` 事件仍会触发（便于统计） |
| `preload` | `none/metadata/auto` 预载提示 | 提示非命令，移动端常被降级 |
| `poster` | 视频封面 URL | 仅 video；未加载首帧时显示 |
| `playsinline` | iOS 内联播放，不接管全屏 | 移动端自动播放的必要组合 |
| `crossorigin` | 跨域凭据策略 | 画到 canvas / captureStream 跨域资源需 CORS |
| `src` 或 `<source>` 子元素 | 媒体地址 | 多格式必须用 `<source>` 列表 |
| `currentTime`（JS） | 当前播放位置（秒，可写） | 进度条 seek 的落点 |
| `volume`（JS） | 0~1 音量 | iOS Safari 不允许 JS 设音量（跟随系统） |
| `playbackRate`（JS） | 倍速 | 0.0625~16；音频保真取决于实现 |

### 2.2 `<source>` 与格式选择

```html
<!-- 排列顺序 = 优先级：浏览器命中第一个"支持"的即停 -->
<video controls poster="cover.jpg" width="640" playsinline>
  <source src="movie.webm" type="video/webm">       <!-- 开源格式：体积小 -->
  <source src="movie.mp4"  type="video/mp4">        <!-- H.264：硬件解码普及 -->
  <!-- 兜底内容：浏览器连 video 都不认识时才显示（现代浏览器几乎不会） -->
  您的浏览器不支持 video。
</video>
```

`type` 必须写对：它让浏览器**不必下载文件头**就能判断支持性；漏写时浏览器要真的去拉数据再失败，浪费一次请求。`media` 属性可按视口选片（移动端发小码率片）。

### 2.3 `<track>` 字幕轨道

```html
<video controls>
  <source src="doc.mp4" type="video/mp4">
  <!-- kind 五类：subtitles(翻译字幕) captions(含音效描述的字幕，
       服务听障) descriptions(视频内容朗读，服务视障)
       chapters(章节导航) metadata(供 JS 消费，不显示) -->
  <track kind="subtitles" src="zh.vtt" srclang="zh" label="简体中文" default>
  <track kind="subtitles" src="en.vtt" srclang="en" label="English">
</video>
```

VTT 格式要点：首行 `WEBVTT`；时间轴 `00:00:01.000 --> 00:00:04.000`；支持 `line/position/align` 定位与 `<c.className>` 样式标记（配 CSS `::cue`）。**本地双击 file:// 打开时 track 常因 CORS 安全策略加载失败**——这是视频示例用 JS 兜底字幕的原因。

### 2.4 `<picture>` 响应式图片

```html
<picture>
  <!-- art direction：手机上用竖构图裁切，桌面用横构图 -->
  <source media="(max-width: 640px)" srcset="hero-portrait.jpg">
  <!-- 格式渐进：新格式优先，浏览器不支持自动跳过 -->
  <source type="image/avif" srcset="hero.avif">
  <source type="image/webp" srcset="hero.webp">
  <img src="hero.jpg" alt="产品主图"><!-- 必须保留：回退与真正的渲染载体 -->
</picture>
```

`srcset` 的密度描述符与宽度描述符：

```html
<!-- 密度：1x/2x 屏 -->
<img srcset="a.png 1x, a@2x.png 2x" src="a.png" alt="">
<!-- 宽度：sizes 告诉浏览器图的实际显示宽度 -->
<img srcset="a-400.jpg 400w, a-800.jpg 800w, a-1600.jpg 1600w"
     sizes="(max-width: 600px) 100vw, 600px" src="a-800.jpg" alt="">
```

### 2.5 JS 控制与 Web Audio 桥接

```js
const v = document.querySelector('video');
v.play().catch(err => {
  // 自动播放策略拒绝：NotAllowedError —— 降级为静音重试
  if (err.name === 'NotAllowedError') { v.muted = true; v.play().catch(() => {}); }
});
v.pause();
v.currentTime = 30;      // seek
v.playbackRate = 1.5;    // 倍速
v.volume = 0.4;          // iOS 上无效（跟随系统）

// 画中画与全屏
v.requestPictureInPicture?.();

// Web Audio 桥接：媒体元素 → 分析节点 → 输出
const ctx = new AudioContext();
const src = ctx.createMediaElementSource(v);
const analyser = ctx.createAnalyser();
analyser.fftSize = 256;                    // 频域样本数的一半
src.connect(analyser).connect(ctx.destination);
const data = new Uint8Array(analyser.frequencyBinCount);
// 每帧读取频谱 → 驱动 Canvas 柱状图
(function draw() {
  analyser.getByteFrequencyData(data);
  requestAnimationFrame(draw);
})();
```

---

## 3. 浏览器兼容性

> 以下为大致基线（依据 caniuse 与 MDN 数据整理，仅供参考，上线前请以目标用户实测为准）。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `<video>` / `<audio>` 基础 | 4+ | 12+ | 3.5+ | 3.1+ | 全平台支持 | 编解码差异才是主要坑位 |
| MP4/H.264 | 3+ | 12+ | 35+（早前依赖系统） | 3.1+ | 全面支持 | 最通用格式，永远放兜底位 |
| WebM（VP8/VP9） | 6+ / 25+ | 14+ / 14+ | 4+ / 28+ | 14.1+（VP9 部分） | 现代机型良好 | Safari 14.1 起才支持 VP9 |
| `autoplay muted` | 66+（策略） | 79+ | 66+ | 10+ | 移动端一致 | 有声自动播放靠 Media Engagement Index，不可依赖 |
| `playsinline` | 标准化前用 `webkit-playsinline`；现代全支持 | 12+ | 79+（此前 iOS 行为差异） | 10+ | iOS 关键属性 | 缺失时 iOS 自动全屏接管 |
| `preload` 提示 | 4+ | 12+ | 4+ | 3.1+（行为近似 none） | 省流量模式常无视 | 值为"建议"，勿当保证 |
| `poster` | 3+ | 12+ | 3.6+ | 3.1+ | 无问题 | 自动播放成功后瞬间被首帧替换，可能闪一下 |
| `<track>` 字幕 | 23+ | 12+ | 31+ | 6.1+ | 全支持 | **file:// 协议下常加载失败**（CORS），需 http(s) 服务或 JS 兜底 |
| `crossorigin` + canvas 导出 | 13+ | 12+ | 8+ | 5.1+ | 无问题 | 未设置时画跨域视频到 canvas 会"污染"，toDataURL 抛错 |
| `<picture>` | 38+ | 13+ | 38+ | 9.1+ | 全支持 | 必须包含 `<img>` 回退；选择在布局时一次性完成 |
| `srcset`（w 描述符）+ `sizes` | 34+ / 38+ | 12+ / 13+ | 38+ | 6.1+ / 9+ | 全支持 | 忘写 `sizes` 时浏览器默认按 100vw 选图，造成过大流量 |
| `captureStream()` | 53+ | 12+ | 不支持（无进展） | 11+ | 视机型 | Firefox 不支持，必须特性检测 `video.captureStream` |
| `requestPictureInPicture` | 70+ | 79+ | 116+（video PIP 部分） | 16+（系统级入口另算） | Android Chrome 支持 | 一律先特性检测 |
| `createMediaElementSource` 桥接 | 21+（AudioContext 35+ 规范化） | 12+ | 25+ | 14.1+ | iOS 14.5+ 完整 | 桥接后必须 connect(destination)，否则无声；AudioContext 需用户手势 resume |

---

## 4. 使用场景示例

### 场景一：内容站视频正文（多格式 + 字幕 + 失败占位）

**场景描述**：教程站的文章内嵌课程视频，需覆盖多浏览器解码能力、带中文字幕，并在源失效时优雅降级。

```html
<figure class="lesson">
  <video controls preload="metadata" poster="cover.jpg" playsinline crossorigin="anonymous">
    <source src="lesson-720.webm" type="video/webm">
    <source src="lesson-720.mp4"  type="video/mp4">
    <track kind="subtitles" src="lesson-zh.vtt" srclang="zh" label="中文字幕" default>
    抱歉，您的浏览器不支持视频播放。
  </video>
  <figcaption>第 3 课 · Flex 布局实战（时长 12:40）</figcaption>
</figure>

<script>
  const v = document.querySelector('video');
  // error 事件在"出错的那个 source"上触发（不冒泡）——捕获委托逐源监听
  v.addEventListener('error', e => {
    const src = e.target;
    if (src.tagName === 'SOURCE') {
      // 单个源失败：浏览器其实会自动尝试下一个 source，无需干预；
      // 这里记录诊断日志
      console.warn('源失败：', src.src);
    }
  }, true);
  // 兜底：监听 video 元素自身 networkState，所有源都失败时显示占位
  setTimeout(() => {
    if (v.networkState === v.NETWORK_NO_SOURCE) showFallback(v);
  }, 3000);
  function showFallback(v) {
    const ph = document.createElement('div');
    ph.className = 'ph';
    ph.textContent = '视频暂时无法加载，请检查网络后刷新';
    v.replaceWith(ph); // 用占位卡片替换播放器
  }
</script>
```

**逐段注释**：`preload="metadata"` 让进度条有总时长但不预拉整片；`crossorigin` 为将来画到 canvas 留路；`error` 用捕获委托因为不冒泡；`NETWORK_NO_SOURCE` 是"全部 source 都失败"的可靠信号（比 setTimeout 更严谨的实现是轮询或监听每个 source 的 error）。

**预期效果**：现代浏览器播 WebM，老浏览器回退 MP4；源全挂时用户看到占位卡片而非黑框。

### 场景二：电商首页静音自动播放的促销视频

**场景描述**：首屏 banner 需要"一进页面就动"，符合自动播放策略的合法姿势：

```html
<video autoplay muted loop playsinline poster="banner.jpg" id="promo">
  <source src="promo.webm" type="video/webm">
  <source src="promo.mp4" type="video/mp4">
</video>
<button id="unmute" hidden>开启声音</button>

<script>
  const v = document.getElementById('promo');
  // 静音自动播放也可能被极端策略拦截：play() 返回 Promise，必须 catch
  const p = v.play();
  if (p) p.catch(() => { v.poster; /* 保持 poster 即可，无需 JS */ });
  // "开启声音"按钮：用户手势内 unmute 合法 —— 这是策略的出口
  document.getElementById('unmute').hidden = false;
  document.getElementById('unmute').onclick = () => { v.muted = false; };
</script>
```

**逐段注释**：`autoplay muted loop playsinline` 四件套是行业标配；`play()` 的 Promise 拒绝必须处理；解除静音必须发生在用户点击中——把按钮提供给用户，而不是 JS 偷偷开声。

**预期效果**：进页面即无声循环播放；点击按钮后有声音。

### 场景三：自定义播放器（中后台 / 品牌化站点）

**场景描述**：设计规范要求播放器 UI 与产品一致——隐藏原生 controls，用 JS + 媒体 API 完全接管（完整实现见配套示例 index-02）。

```js
// 核心映射：UI 控件 → 媒体属性/方法，事件流 → UI 状态
btn.onclick = () => v.paused ? v.play() : v.pause();          // 播放/暂停
v.addEventListener('timeupdate', () => {                       // 约 4 次/秒
  bar.value = v.currentTime / v.duration * 100 || 0;           // 进度百分比
});
bar.oninput = e => { v.currentTime = e.target.value / 100 * v.duration; }; // 拖动 seek
vol.oninput = e => { v.volume = e.target.value; v.muted = false; };
rate.onchange = e => { v.playbackRate = +e.target.value; };    // 0.5/1/1.5/2
```

**逐段注释**：`timeupdate` 是进度 UI 的心跳；seek 用 `currentTime` 可写性；`volume` 与 `muted` 是两个独立状态（取消静音后 volume 才生效）。

**预期效果**：品牌化控制条，行为与原生播放器一致。

### 场景四：响应式 Banner（picture art direction）

**场景描述**：营销页 banner 在手机与桌面需要**不同构图**（不只是不同分辨率）：

```html
<picture>
  <source media="(max-width: 640px)" srcset="banner-m.jpg">
  <source type="image/avif" srcset="banner.avif">
  <img src="banner.jpg" srcset="banner-2x.jpg 2x" alt="618 大促主视觉" fetchpriority="high">
</picture>
```

**逐段注释**：第一个 source 是"构图决策"（手机用竖版裁切）；第二三个是"格式决策"（AVIF 渐进增强）；`fetchpriority="high"` 提升首屏 LCP 表现。

**预期效果**：手机显示竖构图，桌面显示横构图；支持 AVIF 的浏览器加载更小的图。

---

## 5. 实际应用案例分析

### 案例一：短视频信息流 —— 静音自动播放与流量的平衡

某内容平台的短视频流（类抖音形态）在 Web 端的技术选型与踩坑：

1. **选型**：`autoplay muted loop playsinline` 四件套 + IntersectionObserver 做"视口内才播、滚出即停"。相比"首屏全部起播"，CPU 与电量开销下降约 40%。
2. **踩坑一：未捕获的 NotAllowedError**。部分嵌入式 WebView 禁止静音自动播放，`v.play()` Promise 被 reject 且未 catch，中断了后续渲染管线。修复：所有 play 调用走统一包装函数，reject 时标记"待用户手势"状态，首次点击页面时重放队列。
3. **踩坑二：poster 闪烁**。muted autoplay 生效后，poster → 首帧的切换有一帧黑屏。方案：首帧 ready（`loadeddata` 事件）前叠加一层与 poster 同色的背景，消除感知闪烁。
4. **踩坑三：`loop` 与统计**。运营要求"播完算一次有效播放"，`loop` 循环不重放 `play` 事件但 `ended` 仍触发——用 `ended` 计数即可，别依赖事件重放。

### 案例二：在线教育播放器 —— 自定义 UI、字幕与防挂机

某网课平台的自研播放器把"自定义控制 + 字幕 + 节流"做成了三条经验：

1. **方案选型**：隐藏原生 `controls`，自绘控制条。理由：需要"防挂机"（定时弹出答题）、倍速记忆、章节跳转等业务 UI；原生控制条无法注入。代价是必须自己处理键盘无障碍（Space 播放/暂停、←/→ seek、F 全屏）与 `waiting/playing` 的 loading 态——这对"重造轮子"的成本要有敬畏。
2. **字幕方案**：`<track kind="subtitles">` 声明式字幕为主；但平台需要"字幕关键词高亮跳转"，用 `kind="metadata"` 轨道 + `TextTrack.cues` API 读 cue 数据驱动 JS，两条轨道各司其职。踩坑：file:// 预览时 track 加载失败，团队内部演示统一用本地静态服务器。
3. **进度与续播**：`timeupdate` 每 250ms 上报一次太频繁，改为节流 5 秒 + `pause/ended/visibilitychange` 时强制上报，续播点用 `currentTime` 精确恢复（比 `#t=,120` 媒体片段更可控，因为要叠加服务端进度）。
4. **结论**：媒体开发的难点不在"播出来"，而在**事件流的边界**（error 在 source 上、invalid 式的不冒泡习惯、策略 Promise 拒绝）与**策略约束**（自动播放、iOS 音量）。把边界封装成统一的 Player 门面类，业务侧才不会各踩各的。

---

## 6. 最佳实践与常见坑

1. **自动播放永远配 `muted` + `playsinline`**；`play()` 返回 Promise 必须 `.catch()`，`NotAllowedError` 时降级静音或等待用户手势。
2. **`source` 排列即优先级**：浏览器命中第一个支持的即停；`type` 属性务必写对，省掉无效请求；MP4/H.264 作兜底位。
3. **`error` 事件在出错的 `<source>` 上触发且不冒泡**：用捕获委托监听；"全部源失败"用 `video.networkState === video.NETWORK_NO_SOURCE` 或逐源 error 计数判断，并准备占位 UI。
4. **`preload` 是建议不是命令**：省流量模式/iOS 会降级为 none；"首帧必须立即出现"的场景要靠 `poster` 而不是赌 preload。
5. **进度条初始化等 `loadedmetadata`**：之前 `duration` 是 `NaN`，直接用会算出 NaN%。
6. **本地 file:// 打开时 `<track>` 字幕大概率加载失败**（CORS）——开发预览用本地静态服务器，或 JS 兜底渲染字幕。
7. **画布相关操作先 `crossorigin="anonymous"`**：跨域视频画进 canvas 会污染画布，`captureStream`/`toDataURL` 直接失败；服务端需返回 CORS 头。
8. **`picture` 必须包含 `<img>`**（它是真正的渲染元素）；用 `w` 描述符时必须配 `sizes`，否则浏览器按 100vw 选图浪费流量；`picture` 解决"不同构图/格式"，同一构图的多分辨率用 `img srcset` 就够。
9. **装饰性自动播放视频**：加 `muted loop playsinline`、`aria-hidden="true"`（或空 alt）并避免占据焦点；有意义的视频必须提供 captions（WCAG 1.2.2）。
10. **iOS 上 JS 设 `volume` 无效**（跟随系统），音量 UI 在 iOS 要降级为静音开关；`playbackRate` 音调保持取决于浏览器实现。
11. **`timeupdate` 约 4 次/秒**：驱动 UI 够用，上报埋点要节流；缓冲态用 `waiting`/`playing` 事件对控制 loading。
12. **Web Audio 桥接后必须 `connect(destination)`**，且 `AudioContext` 在用户手势前可能处于 suspended，需 `resume()`；接入 `MediaElementSource` 后元素的直接输出失效，别再指望原生命令控制音量路径。

---

## 7. 参考资料

- MDN · `<video>`：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video
- MDN · `<audio>`：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/audio
- MDN · HTMLMediaElement API：https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLMediaElement
- MDN · 媒体事件参考：https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events
- MDN · 自动播放指南（各浏览器策略）：https://developer.mozilla.org/zh-CN/docs/Web/Media/Autoplay_guide
- MDN · Web Video Text Tracks 格式（WebVTT）：https://developer.mozilla.org/zh-CN/docs/Web/API/WebVTT_API
- MDN · `<picture>`：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/picture
- MDN · 响应式图片：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Responsive_images
- MDN · Web Audio API：https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API
- WHATWG · HTML Living Standard（Media 元素）：https://html.spec.whatwg.org/multipage/media.html
- caniuse · video：https://caniuse.com/video ｜ picture：https://caniuse.com/picture
