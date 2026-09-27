# 漫画 · 第 20 话 多媒体：无需插件的播放管线

> 对应正文：[docs/html/09-multimedia.md](../../docs/html/09-multimedia.md) ｜ 原画：[EP.20-multimedia.svg](./EP.20-multimedia.svg)

## 登场角色

- **像素酱**：CSS 造型师，给首屏背景视频加了 `autoplay`，本地好好的一上线全黑——`play()` 抛 NotAllowedError 还没捕获；又只放了一个 WebM 源，Safari 用户集体看不到画面。
- **标签君**：HTML5 结构师，本话主角。讲自动播放策略、source 格式选择、媒体事件流、字幕轨道，以及 picture 与 Web Audio。

## 剧情梗概

`<video>` 与 `<audio>` 是带完整播放管线的原生控件：解码、缓冲、进度、音量、字幕全部内建，JS 通过同一套 HTMLMediaElement 接口控制，移动端还能走硬件解码。`<picture>` 则是图片领域的响应式决策器，让浏览器按视口、DPR、格式支持自己挑图。Flash 时代结束，但"出声要守规矩、格式要有回退、状态要跟事件"这三条依然要背。

## 分格解读

### 格1 · 痛点现场

浏览器的自动播放策略：有声自动播放默认被禁，只有配 `muted`（或用户与该域名有媒体参与度历史）才放行；`autoplay muted playsinline` 是短视频信息流的标准姿势，iOS 上没有 playsinline 还会强制全屏接管。违规调用 `play()` 返回的 Promise 会被 reject 成 NotAllowedError——必须 catch，标准降级是静音后重试。

### 格2 · 机制登场

`<source>` 的选择顺序是**第一个浏览器宣称支持的，而不是最好的**：浏览器按顺序检查 MIME type 与解码能力，命中即停，所以优先级格式放前面、MP4/H.264 放最后兜底；type 必须写对，否则浏览器要真下载文件头才知道不支持。媒体事件流是播放器开发的钥匙：`loadedmetadata` 拿到 duration（进度条最早初始化点）→ `canplay` 可起播 → `timeupdate`（约 250ms 一次）驱动进度条 → `waiting/playing` 切换缓冲菊花；注意**出错时 error 事件触发在具体的 source 元素上，不在 video 上**。`<track>` 挂 VTT 字幕（subtitles/captions/chapters 等五类 kind），file:// 下常因 CORS 加载失败。

### 格3 · 落地收束

自定义播放器靠 `currentTime`（seek）、`playbackRate`（倍速）、`volume`（iOS 跟随系统无效），画中画等能力先特性检测。`<picture>` 本身不渲染，它是源选择器：`<source media>` 做 art direction（手机竖裁/桌面横裁）、`type` 做格式渐进（avif→webp→jpg），真正渲染载体与回退永远是内部的 `<img>`；`srcset` 的 `w` 描述符配 `sizes` 告诉浏览器图片的显示宽度，由浏览器按 DPR × 布局宽选最省的候选。想做频谱可视化，用 `createMediaElementSource` 把媒体接进 Web Audio 音频图，经 AnalyserNode 读频域数据——**最后必须 connect(audioContext.destination)，否则声音被重定向后无处输出**；AudioContext 还需用户手势 resume，跨域视频画 canvas 要配 crossorigin 否则画布被污染。

## 码叔划重点

1. 有声自动播放被策略拦：muted playsinline 才全绿，play() 返回的 Promise 必须 catch 降级。
2. source 按顺序命中第一个支持的即停、type 必写、MP4/H.264 兜底；error 事件在 source 上。
3. picture 用 media/type/srcset+sizes 做决策且必留 img；timeupdate 驱动进度，Web Audio 末端接 destination。

## 自测一题

**问**：视频声明了 webm 和 mp4 两个 source，Safari 打不开 webm，为什么通常不会去发请求试一下？如果把 mp4 写在第一个会发生什么？

**答**：因为 `<source>` 的 `type` 属性（如 `video/webm`、`video/mp4`）让浏览器在**不下载任何字节**的情况下就能对照自身解码能力做判断，不支持就直接跳过看下一个 source——这正是 type 必写的原因（漏写时浏览器只能真去拉文件头再失败，白浪费一次请求）。选择规则是"按出现顺序命中第一个支持的即停"，所以把 MP4 写在第一位时，所有支持 H.264 的浏览器（占绝大多数）都会直接选 MP4，后面的 webm 永远轮不到；这样会失去 WebM 在同等画质下体积更小的优势。主流排列是优先格式（webm/av1 等）在前、MP4/H.264 作为通用兜底放最后。

## 动手实验

- video 全属性实验台 + source 多格式 + track 字幕 + 失败占位：[examples/html/09-multimedia/index-01-video-attributes.html](../../examples/html/09-multimedia/index-01-video-attributes.html)
- 自定义播放器：播放/进度/音量/倍速 + 媒体事件流日志：[index-02-js-controls.html](../../examples/html/09-multimedia/index-02-js-controls.html)
- picture 响应式 + Canvas captureStream + Web Audio 频谱可视化：[index-03-picture-canvas-audio.html](../../examples/html/09-multimedia/index-03-picture-canvas-audio.html)

## 下一话预告

第 21 话（HTML 篇完结篇）《原生造好的轮子》——dialog、Popover、inert、template 与资源提示，少写一千行样板代码。
