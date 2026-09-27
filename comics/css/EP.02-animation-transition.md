# 漫画 · 第 2 话 动画与过渡：流畅的时间维度

> 对应正文：[docs/css/02-animation-transition.md](../../docs/css/02-animation-transition.md) ｜ 原画：[EP.02-animation-transition.svg](./EP.02-animation-transition.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。给盒子加了"飞入"动画，结果帧率从 60 掉到 28，她决定查清"流畅"到底是谁说了算。
- **码叔**：划重点担当，结尾带走三句性能铁律。

## 剧情梗概

`transition: all` + 动 `left` 让像素酱的动画卡成了幻灯片。顺着渲染流水线四站（Style → Layout → Paint → Composite）往下查，她发现浏览器只给 `transform` 和 `opacity` 开了绿色快车道。最后 transition 与 animation 各归其位：一个管状态补间，一个管主动时间线。

## 分格解读

### 格1 · 痛点现场

两个经典翻车点叠在一起：**动 `left` 属于 Layout 属性，每帧都触发重排**，动画循环时浏览器整帧整帧地重新布局；`transition: all` 则是隐式过渡，颜色、内边距等"无辜属性"也会被拉长，性能不可控。FPS 从 60 跌到 28，人眼立刻感知"卡顿"。

### 格2 · 机制登场

渲染流水线四站：**Style → Layout → Paint → Composite**。属性按触发代价分三档：

- Layout 属性（width/left/top）：重排 + 重绘，代价最高；
- Paint 属性（color/box-shadow）：不重排但要重绘像素；
- **Composite 属性（transform/opacity）**：元素被提升为独立合成层，动画只改层的矩阵，由合成器线程在 GPU 上完成——完全跳过前三站。

这就是"只动 transform 与 opacity"铁律的由来。

### 格3 · 落地收束

两者各司其职：**transition 是"被动响应的补间"**——必须由状态变化触发，适合按钮反馈（hover 上浮 2px + 回弹贝塞尔 `cubic-bezier(.34,1.56,.64,1)`，y > 1 产生过冲手感）；**animation 是"主动执行的时间线"**——`@keyframes` 定义关键帧，可自动播放、无限循环，三点加载动画用同一 keyframes + 负 delay 错相，`alternate` 来回摆动。

## 码叔划重点

1. transition 管状态补间，animation 管可循环可编排的时间线。
2. 只动 `transform` 和 `opacity`；显式列出过渡属性，**禁用 `transition: all`**。
3. `fill-mode: both` 防首尾闪帧；`will-change` 是手术刀不是维生素；永远给 `prefers-reduced-motion` 留退路。

## 自测一题

**问**：为什么侧边栏折叠（240px ⇄ 64px）不能用 `transform: scaleX` 代替 `width` 过渡？

**答**：侧栏参与文档流布局，`scaleX` 只是视觉压缩，右侧内容不会回流腾出空间，等于"盖住"而非"收起"。布局动画不可避免时，正确姿势是：受控地过渡 `width`、把波及面降到最小、文字用 `overflow: hidden` 防换行闪动。

## 动手实验

- transition 全参数实验台 + 贝塞尔曲线可视化：[examples/css/02-animation-transition/](../../examples/css/02-animation-transition/index-01-transition-playground.html)
- @keyframes 八个子属性实验台：[index-02-keyframes-animation.html](../../examples/css/02-animation-transition/index-02-keyframes-animation.html)
- 三种触发方式 + 性能对照 + reduced-motion：[index-03-trigger-performance.html](../../examples/css/02-animation-transition/index-03-trigger-performance.html)

## 下一话预告

一排卡片怎么等高？按钮怎么贴底？长标题为什么把导航挤爆？第 3 话《Flexbox》，一根轴上的声明式布局。
