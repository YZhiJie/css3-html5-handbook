# 漫画 · 第 30 话 @property：给变量上户口

> 对应正文：[docs/css/20-property.md](../../docs/css/20-property.md) ｜ 原画：[EP.30-property.svg](./EP.30-property.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。给主题切换加颜色过渡，`transition: --c 1s` 写完满心欢喜，结果颜色 1 秒后瞬间跳变——又退回 JS 逐帧改值的老路。
- **标签君**：HTML5 结构师，搬出 `@property`——变量注册进类型系统后，浏览器知道怎么补间，颜色、角度、百分比、长度全部可动画。

## 剧情梗概

变量章（EP.06）讲了 `var()` 的运行时替换，动画章（EP.02）讲了 transition/keyframes，但两者结合时有个暗坑：未注册变量是字符串，动画只能跳变。本话用 `@property` 把两块拼图咬合——syntax 声明类型、inherits 控制继承、initial-value 兜底，变量从此进入浏览器的插值系统。

## 分格解读

### 格1 · 痛点现场

未注册变量在浏览器眼里是字符串：`red → blue`、`0% → 100%`、`0deg → 360deg`，前后两个字符串之间没有「中间帧」，动画退化为延迟跳变。想要平滑效果只能回退到 rAF + JS 手写插值。

### 格2 · 机制登场

`@property --c { syntax: "<color>"; inherits: false; initial-value: transparent; }` 三件套把变量注册进类型系统。syntax 支持 color/length/number/percentage/angle/time 等；赋值不合法时静默回退到 initial-value；JS 侧可用 `CSS.registerProperty` 动态注册。

### 格3 · 落地收束

四大实战场景：颜色过渡无黑屏（主题切换逐色插值）、color-mix 参数动画（渐变混合比例平滑推移）、transform 多变量串联（--tx/--s/--rot 各自动画，一条 transition 控三维）、锥形渐变进度环（角度变量驱动纯 CSS 充能动画）。

## 码叔划重点

1. syntax / inherits / initial-value 三件套注册后，变量才可被浏览器插值动画。
2. transition 目标是变量本身：transition: --x，引用它的属性随变量逐帧重算。
3. 赋值不合法静默回退 initial-value——调试时看 DevTools 的 invalid 标记。

## 自测一题

**问**：`transition: width 1s; width: var(--w);` 配合 `--w: 100px → 200px` 的变化，能实现平滑动画吗？为什么？

**答**：不能。`transition: width` 监听的是 **width 计算值的变化**，而 `--w` 未注册时只是字符串替换，width 从 100px 变 200px 是一次性跳变（字符串替换不算可过渡的计算值变化）。正确姿势：先 `@property --w { syntax: "<length>"; }` 注册，再写 `transition: --w 1s`——动画目标是变量本身，width 引用 var(--w) 随变量逐帧重算。

## 动手实验

- 注册 vs 未注册对比 + color-mix 参数 + transform 串联 + 锥形渐变进度环：[examples/css/20-property/](../../examples/css/20-property/index-01-property.html)

## 系列结语

「现代 CSS 架构」三部曲完结：层叠层（EP.23）管优先级、嵌套（EP.28）管书写结构、@scope（EP.29）管作用域隔离，@property（EP.30）让变量系统真正可动画——四件装备，覆盖了现代组件化样式的四大支柱。
