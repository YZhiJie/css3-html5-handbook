# 漫画 · 第 24 话 现代颜色：oklch / color-mix / light-dark 设计系统的颜色革命

> 对应正文：[docs/css/14-modern-colors.md](../../docs/css/14-modern-colors.md) ｜ 原画：[EP.24-modern-colors.svg](./EP.24-modern-colors.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。被 180+ 硬编码 hex 色 token 折磨——品牌色微调一次，9 级色板逐行重算，暗色模式还要再翻一倍。
- **标签君**：HTML5 结构师，搬出 CSS Color Level 4/5 三件套：oklch 感知均匀、color-mix 精确混色、light-dark 一行双主题。

## 剧情梗概

渐变章（EP.08）讲过多色过渡的视觉魔法，但底层颜色系统仍是 sRGB 时代的产物。像素酱先被 HSL 的感知不均匀折磨——同 L=50% 的黄和蓝，视觉亮度天差地别；再被手动维护的双份色板压垮。标签君引入现代颜色三件套：oklch 用感知均匀的 L/C/H 定义颜色，color-mix 在 oklch 空间混色告别灰暗中间色，light-dark 一行代码终结双份变量。

## 分格解读

### 格1 · 痛点现场

HSL 亮度陷阱：`hsl(60, 100%, 50%)` 纯黄远比 `hsl(240, 100%, 50%)` 纯蓝看起来更亮，但 L 参数都是 50%。手动挑色板：`--blue-50: #eff6ff` 到 `--blue-900`，180+ token 硬编码。暗色模式双份：每个变量都要配一个 `-dark` 后缀。品牌色 `#3b82f6` 换成 `#7c3aed`，全盘重算。

### 格2 · 机制登场

三把新钥匙并排亮相：

- **oklch()**：L（明度 0-100%）C（色度）H（色相 0-360°），Oklab 感知均匀空间，调 L 不发灰、不偏色。
- **color-mix()**：`color-mix(in oklch, A 60%, B)`，在感知空间中线性插值，避免 sRGB 混色的灰暗中间色。
- **light-dark()**：`light-dark(light-color, dark-color)`，配合 `color-scheme: light dark` 一行替代媒体查询。

示例代码：`oklch(65% 0.22 265)` 定义主色，`oklch(from var(--brand) calc(l+0.1) c h)` 自动推导 hover 态。

### 格3 · 落地收束

四区落地：

- **色板生成**：只定义 `--brand: oklch(58% 0.24 265)`，50-900 级通过调 L 和 C 比例自动生成；换品牌色只改 hue。
- **双主题**：`light-dark(oklch(99% 0.01 265), oklch(16% 0.03 265))` 无媒体查询、无变量翻倍，系统切换外观 CSS 自动跟随。
- **状态推导**：hover/active/disabled 全部由相对颜色语法 `calc(l±x)` 自动级联。
- **兼容性**：Chrome 111+ / Safari 15.4+ / Firefox 128+，旧浏览器用 postcss-preset-env 降级为 rgb/hex。

## 码叔划重点

1. oklch 感知均匀：同 L 值的不同色相视觉亮度一致，设计系统色板不再凭感觉。
2. color-mix 在 oklch 空间混色：避免 sRGB 线性插值的灰暗中间色。
3. light-dark() 需配合 color-scheme 声明，一行代码替代整段媒体查询。

## 自测一题

**问**：`oklch(60% 0.25 0deg)` 和 `oklch(60% 0.25 240deg)` 的视觉亮度一致吗？为什么 HSL 做不到这一点？

**答**：一致。Oklch 基于 Oklab 感知均匀颜色空间，L 值与人眼感知亮度线性对应，所以同 L=60% 的红（0°）和蓝（240°）视觉亮度基本相同。HSL 的 L 是数学平均（max+min)/2，未考虑人眼对不同波长光的敏感度差异（视锥细胞对黄绿最敏感、对蓝紫最不敏感），所以同 L 值下黄色看起来远比蓝色亮。

## 动手实验

- oklch vs hsl 感知均匀对比 + color-mix 混色 + light-dark 双主题卡片 + 相对颜色状态推导 + 10 级色板自动生成：[examples/css/14-modern-colors/](../../examples/css/14-modern-colors/index-01-modern-colors.html)

## 下一话预告

第 25 话《滚动驱动动画》——`animation-timeline: scroll()` 与 `view()`，纯 CSS 实现滚动视差与进出场动画，告别 JavaScript 滚动监听。
