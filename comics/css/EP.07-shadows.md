# 漫画 · 第 7 话 阴影：界面的海拔系统

> 对应正文：[docs/css/07-shadows.md](../../docs/css/07-shadows.md) ｜ 原画：[EP.07-shadows.svg](./EP.07-shadows.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。给聊天气泡加了 box-shadow，尾巴尖角处的阴影却"断"了，当场困惑。
- **标签君**：HTML5 结构师，摆出阴影三兄弟的分工表：矩形轮廓、字形轮廓、alpha 剪影各管一摊。

## 剧情梗概

阴影是界面"海拔"的语言。像素酱先弄懂三种阴影的轮廓差异，再学会"接触 + 主体 + 环境"三段式海拔写法，最后掌握性能红线：动画别直接改 box-shadow 值，抬升交给 transform、明暗交给伪元素 opacity，让阴影只在合成阶段动。

## 分格解读

### 格1 · 痛点现场

box-shadow 沿**盒子边框盒的矩形轮廓**投射。气泡的三角尾巴是 `::after` 画在盒子外面的，阴影到矩形边缘就停了——尖角处"漏光"。透明 PNG、SVG 图标、clip-path 裁剪的异形同理，要贴合真实轮廓得用 `filter: drop-shadow()`，它基于元素渲染后的 **alpha 通道**投影，镂空处无阴影、真剪影。

### 格2 · 机制登场

三兄弟分工：`box-shadow` 贴矩形（唯一支持 spread 与 inset）；`text-shadow` 贴字形（无 spread/inset，可叠多层做霓虹）；`drop-shadow` 贴实际 alpha 轮廓（无 spread，小图标随便用）。多层阴影**从上到下绘制、先写的在上层**，所以"细的写前面、粗的写后面"，顺序反了视觉发闷。

### 格3 · 落地收束

海拔三段式：`0 1px 2px` 接触细线 + `0 4px 12px` 主体 + `0 16px 40px` 大而淡的环境阴影。hover 抬升的正确姿势是 `transform: translateY(-4px)` 走合成器，深浅变化用伪元素 opacity 过渡——改 box-shadow 值必然触发逐帧重绘，是低端机掉帧的元凶。`will-change` 只给动画容器用，成片滥用会合成层爆炸。

## 码叔划重点

1. 三种阴影三种轮廓：box-shadow 矩形、text-shadow 字形、drop-shadow 实际 alpha 剪影。
2. 多层阴影先细后粗（先写的在上层）；透明度控制在 6%~14% 不发脏。
3. 动画别直接改 box-shadow 值——必重绘；抬升用 transform，明暗用伪元素 opacity。

## 自测一题

**问**：hover 想让卡片"浮起"，为什么不推荐 `transition: box-shadow`？正确做法是什么？

**答**：box-shadow 值变化必然触发绘制（paint），逐帧重绘在低端机上直接掉帧。正确做法：位移用 `transform: translateY(-4px)`（合成器接管），阴影深浅变化交给承载阴影的伪元素做 `opacity` 过渡；`will-change: transform` 只加在列表容器上，防止合成层爆炸。

## 动手实验

- box-shadow 全参数交互实验台：[examples/css/07-shadows/](../../examples/css/07-shadows/index-01-box-shadow-basics.html)
- 多层阴影材质感：新拟态控件：[index-02-neumorphism.html](../../examples/css/07-shadows/index-02-neumorphism.html)
- text-shadow：霓虹字、浮雕、长投影：[index-03-text-shadow.html](../../examples/css/07-shadows/index-03-text-shadow.html)
- drop-shadow 与 box-shadow 的本质区别：[index-04-drop-shadow.html](../../examples/css/07-shadows/index-04-drop-shadow.html)

## 下一话预告

第 8 话《渐变》——不是背景图，而是一门参数化的矢量绘图语言。
