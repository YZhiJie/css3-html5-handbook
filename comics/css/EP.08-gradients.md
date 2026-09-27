# 漫画 · 第 8 话 渐变：参数化的绘图语言

> 对应正文：[docs/css/08-gradients.md](../../docs/css/08-gradients.md) ｜ 原画：[EP.08-gradients.svg](./EP.08-gradients.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。想给渐变按钮加 hover 过渡，颜色却瞬间"跳变"，transition 集体失灵。
- **标签君**：HTML5 结构师，画出 linear / radial / conic 三种渐变的等色线示意，并演示纯 CSS 饼图。

## 剧情梗概

渐变不是"背景图"，而是浏览器实时计算的 `<image>` 类型——凡能放图片的地方都能放渐变。像素酱先弄懂三种渐变的插值方向，再用 conic 接力写法画环形进度，最后学会渐变动画的两条正路：动 background-position，或用 @property 注册角度变量。

## 分格解读

### 格1 · 痛点现场

`background-image` 是离散值，`transition` 对它完全无效——hover 换渐变只会瞬间跳变。要"颜色流动"，正确姿势有两条：把渐变画成 200% 宽、动画 `background-position`（可插值的长度值）；或用 `@property` 把角度/百分比注册成自定义属性后写进 keyframes。都不可行时，叠两层渐变用 opacity 交叉淡化。

### 格2 · 机制登场

三种渐变三种等色线：`linear-gradient` 沿渐变轴线插值（垂直于轴的每条线同色）；`radial-gradient` 从中心沿半径插值（等色线是椭圆/圆）；`conic-gradient` 绕中心旋转插值（等色线是射线）。渐变没有固有尺寸，作为背景默认铺满定位区，所以**天然自适应**；hard-stop（两个色标同位置）让插值区间为零，条纹、饼图、格纹的全部秘密都在这里。

### 格3 · 落地收束

conic 饼图的"接力写法"：`conic-gradient(#22d3ee 0 calc(var(--p) * 3.6deg), #1e293b 0)`——第二个色标起点写 0 但被钳制到前一段终点，于是第一色画 0→p%、第二色自动铺满剩余角度；JS 只需 `setProperty('--p', 72)` 一个数字。流动按钮则是"超宽渐变 + position 动画"：观感是渐变在流动，实际只是背景在平移。

## 码叔划重点

1. 渐变是 `<image>` 类型——background / mask / border-image 都能放，无固有尺寸天然自适应。
2. background-image 不可过渡：流动用 200% 超宽渐变动 position，或 @property 注册角度。
3. repeating 周期 = 最后一个色标位置；渐变文字要 background-clip: text 三件套。

## 自测一题

**问**：`conic-gradient(#22d3ee 0 calc(var(--p) * 3.6deg), #1e293b 0)` 里，第二个色标的起点写 0 为什么也能画对饼图？

**答**：色标位置会被"钳制"到前一个色标的终点——起点 0 实际等于前色终点，于是青色画 0→p%、深色从 p% 自动"接力"铺满到 100%。这就是接力写法：JS 只提供一个 0~100 的数字，CSS 负责换算成角度。

## 动手实验

- linear / radial 实验台：角度、色标、hard-stop 条纹：[examples/css/08-gradients/](../../examples/css/08-gradients/index-01-linear-radial.html)
- conic 色轮/饼图 + repeating 条纹、格纹、网格纸：[index-02-conic-repeating.html](../../examples/css/08-gradients/index-02-conic-repeating.html)
- 渐变文字、渐变边框、渐变 + 动画组合：[index-03-gradient-text-border.html](../../examples/css/08-gradients/index-03-gradient-text-border.html)

## 下一话预告

第 9 话《Transform》——不触发重排的变形魔法：translate、rotate、scale 与 3D。
