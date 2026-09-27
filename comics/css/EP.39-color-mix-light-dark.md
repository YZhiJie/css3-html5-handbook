# 漫画 · 第 39 话 color-mix 与 light-dark：浏览器原生调色盘

> 对应正文：[docs/css/25-color-mix-light-dark.md](../../docs/css/25-color-mix-light-dark.md) ｜ 原画：[EP.39-color-mix-light-dark.svg](./EP.39-color-mix-light-dark.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。Sass 变量 `$light10: lighten($brand, 10%)` 写了 10 级色阶，暗色模式又复制 200 行媒体查询覆盖，换品牌色要重新编译整套，表单控件在暗色下突兀发白。
- **标签君**：HTML5 结构师，搬出三把原生钥匙——`color-mix()` 浏览器端混色、`light-dark()` 单声明双色、`color-scheme` 让原生控件自动适配。

## 剧情梗概

像素酱被「调色靠编译、暗色靠覆盖」折磨：预处理器生成的色阶是死值，运行时改品牌色完全做不到；媒体查询写两套颜色，代码量翻倍还容易漏。标签君引入 `color-mix(in oklch, var(--brand), white 20%)`——一个变量实时派生整套色阶；`light-dark(#fff, #0b1220)` 一句替代整段媒体查询；`:root { color-scheme: light dark }` 连滚动条和表单控件都自动换装。像素酱发现 JS 只改一个 `--brand`，全站色阶实时更新。

## 分格解读

### 格1 · 痛点现场

传统方案依赖预处理器：`lighten()`/`darken()` 在编译期算死，浏览器端无法动态调整；暗色模式靠 `prefers-color-scheme` 媒体查询逐条覆盖，200 行变量写两遍。叠加痛苦：编译依赖、控件突兀、JS 切 class 闪屏、动态主题完全做不到。

### 格2 · 机制登场

`color-mix(in oklch, #7c3aed, white 20%)` 在指定色彩空间按比例混色，oklch 感知最均匀；`light-dark(#fff, #0b1220)` 根据系统偏好自动二选一，但**必须**配合 `color-scheme: light dark` 声明，否则永远返回亮色值。

### 格3 · 落地收束

四大场景：品牌色阶生成（一个变量派生 10 级）、暗色模式（代码量减半）、控件适配（滚动条/表单/选中色自动换装）、动态主题（JS 改一个变量全站联动）。记住边界：**srgb 混合可能发灰**，追求感知均匀一律用 oklch。

## 码叔划重点

1. color-mix(in oklch, ...) 感知最均匀；srgb 混合可能产生 muddy 中间色。
2. light-dark() 需配合 color-scheme: light dark，否则永远返回亮色值。
3. :root { color-scheme: light dark } 让滚动条/表单控件自动适配暗色。

## 自测一题

**问**：为什么 `light-dark()` 单独使用时永远返回第一个颜色（亮色值）？

**答**：`light-dark()` 的判定依据是元素计算后的 `color-scheme` 值，而不是系统偏好本身。若未在 `:root` 或祖先声明 `color-scheme: light dark`，元素只支持 light 方案，`light-dark()` 自然永远选亮色。正确姿势：`:root { color-scheme: light dark }` 声明双支持，函数才会响应系统暗色偏好。

## 动手实验

- 四色彩空间混合对比 + light-dark 主题卡片 + color-scheme 原生控件 + 品牌色 5 级变体：[examples/css/25-color-mix-light-dark/](../../examples/css/25-color-mix-light-dark/index-01-color-mix-light-dark.html)

## 下一话预告

第 40 话《details 与 summary 进阶》——`name` 属性互斥手风琴零 JS、`::details-content` 高度平滑动画、`interpolate-size: allow-keywords` 解锁 auto 过渡，原生折叠面板让 15KB 组件库退役。
