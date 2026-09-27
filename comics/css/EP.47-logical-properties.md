# 漫画 · 第 47 话 逻辑属性进阶：一套代码适配全球语言

> 对应正文：[docs/css/29-logical-properties.md](../../docs/css/29-logical-properties.md) ｜ 原画：[EP.47-logical-properties.svg](./EP.47-logical-properties.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。站点上线阿拉伯语版，`margin-left: 16px` 在 RTL 语言下变成了右边距，边框、对齐全部错位。之前国际化都是写两套 CSS，维护成本翻倍。
- **标签君**：HTML5 结构师，搬出逻辑属性——`inline-start/end`、`block-start/end`、`inline-size/block-size`，让布局自动适配书写方向，一套代码覆盖 LTR、RTL、垂直书写。

## 剧情梗概

CSS 物理属性 left/right/top/bottom 在国际化场景下寸步难行：阿拉伯语右到左、日文竖排从上到下。逻辑属性把「物理方向」替换为「书写方向」——`margin-inline-start` 在 LTR 是左间距、RTL 是右间距，`block-start` 永远是顶部。配合逻辑简写和逻辑单位，一套 CSS 覆盖全球语言。

## 分格解读

### 格1 · 痛点现场

RTL 语言下物理属性全错：`margin-left` 在阿拉伯语下间距出现在右侧，`text-align: left` 在希伯来语下内容右对齐成左对齐。团队被迫维护两套 CSS，新增语言就得重写。

### 格2 · 机制登场

`inline-start/end` 随 `direction` 翻转，LTR 为 left/right，RTL 为 right/left；`block-start/end` 永远等于 top/bottom，不受方向影响；`inline-size/block-size` 替代 width/height，在 vertical-rl 下自动互换。逻辑简写 `margin-inline` 和 `padding-block` 让代码更简洁。

### 格3 · 落地收束

四大场景：RTL 自动适配（阿拉伯语/希伯来语零改动）、垂直书写（中文古籍/日文 manga）、逻辑简写（代码更简洁）、国际化项目（CSS 代码量减少 40%）。Chrome 87+ / Safari 14.1+ / Firefox 66+ 全绿。

## 码叔划重点

1. `inline-start/end` 随书写方向翻转；`block-start/end` 永远等于 top/bottom。
2. 逻辑简写 `margin-inline` / `padding-block` 代码更简洁，推荐优先使用。
3. `text-align: start` 自动适配 LTR/RTL，比 left/right 好——别混用物理与逻辑。

## 自测一题

**问**：在 `writing-mode: vertical-rl` 下，`inline-size` 和 `block-size` 分别等于什么物理属性？

**答**：`vertical-rl` 时，内联轴是垂直方向，块轴是水平方向。因此 `inline-size` = height，`block-size` = width。逻辑属性自动完成映射，无需手动计算。

## 动手实验

- RTL 自动适配 + 垂直书写 + 逻辑简写 + 物理 vs 逻辑对比：[examples/css/29-logical-properties/](../../examples/css/29-logical-properties/index-01-logical-properties.html)

## 下一话预告

第 48 话《File System Access API》——网页编辑器保存就是下载副本？打开文件选择器、保存到本地、读取目录树，浏览器原生支持直接读写本地文件系统。
