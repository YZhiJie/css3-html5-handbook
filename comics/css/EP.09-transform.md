# 漫画 · 第 9 话 Transform：不惊动文档流的几何魔法

> 对应正文：[docs/css/09-transform.md](../../docs/css/09-transform.md) ｜ 原画：[EP.09-transform.svg](./EP.09-transform.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。用 `left` 写位移动画，长列表一滑动就掉帧，被码叔一句"你每帧都在重排"点醒。
- **标签君**：HTML5 结构师，画出两条变换链的矩阵差异，并协助拼装 3D 翻转卡的三层结构。

## 剧情梗概

`transform` 是唯一"不惊动文档流"的几何工具：位移、旋转、缩放、倾斜都只作用在最终绘制结果上，元素的布局盒纹丝不动。像素酱先搞懂为什么 `transform` 动画只走合成器，再弄清函数顺序为什么影响结果，最后用 perspective → preserve-3d → backface-visibility 三件套搭出一张会翻面的卡片。

## 分格解读

### 格1 · 痛点现场

动画 `left: 0 → 200px` 时，浏览器每一帧都要重走 Layout → Paint → Composite 整条流水线；而动画 `transform: translateX(200px)` 时，元素被提升为合成层，位移只是合成器线程上的一次矩阵更新，主线程即使卡住动画依然流畅。性能优化第一课：`left` 换 `translateX`，`width` 换 `scaleX`。

### 格2 · 机制登场

每个变换函数都对应一个矩阵，浏览器把函数序列**从左到右依次相乘**。矩阵乘法不可交换：先 `translateX(80px)` 再 `rotate(45deg)`，是沿原 X 轴走完再原地转；先旋转再平移，X 轴已经被带斜，元素会沿斜向推出。`transform-origin` 是旋转与缩放的基准点（默认盒子中心），而 `translate` 的百分比基于**自身**尺寸——这正是 `left:50% + translate(-50%,-50%)` 无宽高精确居中的原理。

### 格3 · 落地收束

3D 翻转卡需要三层各司其职：**舞台**（父元素）写 `perspective: 900px` 提供近大远小，全部子面共享一个灭点；**中间层**写 `transform-style: preserve-3d`，否则默认 `flat` 会把正反两面拍扁叠在一起；**每个面**写 `backface-visibility: hidden`，背面预翻 `rotateY(180deg)`，悬停时中间层整体转 180°，正面隐去、背面显现。注意 `overflow:hidden`、`filter`、`opacity<1` 会强制打平 preserve-3d——3D 失效先查祖先链上的这批属性。

## 码叔划重点

1. transform 不碰文档流：位移后元素仍占原位，动画只走合成器，主线程卡顿也不掉帧。
2. 函数从左到右依次相乘、顺序敏感；拼 3D 口诀是"先转正、再推出"。
3. 三件套：父 perspective、中 preserve-3d、面 backface-visibility:hidden；overflow:hidden 会打平 3D。

## 自测一题

**问**：为什么 `rotate(45deg) translateX(80px)` 和 `translateX(80px) rotate(45deg)` 的最终位置不一样？

**答**：变换函数从左到右依次应用，且每个函数都在"当前坐标系"里生效。先旋转后，元素自身的 X 轴已经倾斜 45°，此时 `translateX(80px)` 是沿斜向推出；先平移时 X 轴还是水平的。本质是矩阵乘法不可交换：A·B ≠ B·A。排查复合变换可用 `getComputedStyle(el).transform` 读最终矩阵逐项核对。

## 动手实验

- 2D 变换实验台：translate/rotate/scale/skew + matrix 对照 + transform-origin：[examples/css/09-transform/index-01-2d-transforms.html](../../examples/css/09-transform/index-01-2d-transforms.html)
- 3D 翻转卡片：perspective / preserve-3d / backface-visibility 全流程：[index-02-3d-flip-card.html](../../examples/css/09-transform/index-02-3d-flip-card.html)
- 3D 立方体 + 轮播 + translateZ 层深视差：[index-03-3d-cube-carousel.html](../../examples/css/09-transform/index-03-3d-cube-carousel.html)

## 下一话预告

第 10 话《文本截断》——长 URL 撑爆 flex 行、省略号死活不出现？三件套与 `min-width:0` 前来救场。
