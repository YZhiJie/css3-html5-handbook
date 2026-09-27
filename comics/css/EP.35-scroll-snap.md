# 漫画 · 第 35 话 滚动吸附：松手即停稳

> 对应正文：[docs/css/23-scroll-snap.md](../../docs/css/23-scroll-snap.md) ｜ 原画：[EP.35-scroll-snap.svg](./EP.35-scroll-snap.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。轮播图 scroll 事件 + debounce + `scrollTo` 手动校正落点，移动端还得引 swiper 库模拟触摸惯性，低端机卡成 PPT。
- **标签君**：HTML5 结构师，搬出 Scroll Snap 双件套——容器 `scroll-snap-type` 定方向与严格度，子项 `scroll-snap-align` 给吸附点，浏览器原生接管。

## 剧情梗概

像素酱被「滚动停在两张图中间」折磨：JS 监听 scroll 算落点，手感永远差一口气；快速甩动一滑到底，固定头还把落点内容挡住。标签君引入 Scroll Snap——`mandatory` 强制吸附、`proximity` 就近轻吸、`stop: always` 逐项停靠、`scroll-padding` 收缩吸附口避让固定头。像素酱发现连轮播圆点导航都能用锚点零 JS 完成。

## 分格解读

### 格1 · 痛点现场

传统方案命令式校正：scroll 事件里 debounce，算最近卡片位置再 `scrollTo`。叠加痛苦：停在两张图中间、一甩跳过三张、固定头遮落点、低端机掉帧、JS 禁用完全失效。

### 格2 · 机制登场

容器 `scroll-snap-type: x mandatory` 声明方向与严格度，子项 `scroll-snap-align: center` 声明吸附点。滚动结束浏览器自动算最近落点并平滑吸附；`scroll-snap-stop: always` 让快速甩动也逐项停靠。

### 格3 · 落地收束

四大场景：水平卡片流（首尾靠 `scroll-padding-inline` 居中）、整屏翻页（`stop: always` 不连跳）、纯 CSS 轮播（锚点 + smooth）、mandatory 与 proximity 的分寸。记住边界：**内容不定高时用 proximity**，否则高过一屏的内容会被「锁死」滚不到。

## 码叔划重点

1. 容器 scroll-snap-type 定方向与严格度，子项 scroll-snap-align 给吸附点。
2. mandatory 强制吸附；内容不定高时用 proximity，否则中间内容滚不到。
3. 固定头遮落点：容器补 scroll-padding-top，scrollIntoView 同样生效。

## 自测一题

**问**：为什么 `y mandatory` 的整屏翻页里，某一屏内容超过 100vh 会出问题？

**答**：mandatory 要求滚动结束必须吸附到某个吸附点。内容高过一屏时，中间部分距离任何吸附点都太远，浏览器会把它「吸回」最近吸附点——中间内容永远无法停留阅读。解法：改用 `proximity`，或只给屏首标题设吸附点。

## 动手实验

- 卡片流 + 整屏翻页 + 纯 CSS 轮播 + mandatory/proximity 对比 + scroll-padding 避让：[examples/css/23-scroll-snap/](../../examples/css/23-scroll-snap/index-01-scroll-snap.html)

## 下一话预告

第 36 话《dialog 元素》——`showModal()` 一句进入 top layer：页面自动惰性化、焦点圈禁、Esc 关闭、`::backdrop` 定制遮罩，弹窗三件套零依赖完成。
