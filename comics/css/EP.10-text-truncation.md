# 漫画 · 第 10 话 文本截断：给不守规矩的文字收口

> 对应正文：[docs/css/10-text-truncation.md](../../docs/css/10-text-truncation.md) ｜ 原画：[EP.10-text-truncation.svg](./EP.10-text-truncation.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。文件列表里一个超长文件名把"下载"按钮顶出了屏幕，省略号三件套写齐也不出现，一度怀疑浏览器针对她。
- **标签君**：HTML5 结构师，掏出 min-content 原理图说明 flex 子项为什么"拒绝收缩"，并演示多行省略与长词断行的分工。

## 剧情梗概

文本是界面里最不守规矩的内容：设计稿永远是短标题，真实数据永远超长。像素酱按教程写了 `text-overflow: ellipsis` 却毫无效果，最后发现问题不在属性，而在布局——盒子根本没被压缩。本话讲清省略号出现的必要条件、flex/grid 的 min-content 下限、多行截断四件套，以及长 URL 该在哪里断行。

## 分格解读

### 格1 · 痛点现场

`.title { flex: 1 }` 的弹性项里塞了一个超长文件名，右侧按钮被直接顶出容器。根因是 flex 子项的 `min-width` 默认值为 `auto`，计算为 **min-content**——"缩到不能再缩的宽度"，对英文/URL 来说等于最长单词的宽度。弹性算法不敢压缩它，于是内容溢出，省略号永远没有出场机会。

### 格2 · 机制登场

单行省略必须同时凑齐三件事：`white-space: nowrap`（禁止换行，文本才有机会"超出"）、`overflow: hidden`（超出被裁，省略号才有地方画）、`text-overflow: ellipsis`（在裁剪边界渲染 …）。而 flex 行里还要补第四行：`min-width: 0` 显式解除 min-content 下限，盒子被真正压窄后，三件套才在收缩后的宽度上生效。grid 轨道对应的写法是 `minmax(0, 1fr)`，列方向 flex 则用 `min-height: 0`。

### 格3 · 落地收束

商品流卡片要求等高：标题无论 5 个字还是 50 个字都占 2 行，靠 `-webkit-box + box-orient:vertical + line-clamp:2 + overflow:hidden` 四件套，标准属性 `line-clamp: 2` 双写兜底。长 URL 断行注意区分：`overflow-wrap: anywhere` 的断行点**计入 min-content**，能让 flex 项真正缩窄；`break-word` 视觉上也断，但最小宽度不变，救不了 flex 溢出。`word-break: break-all` 切得最碎，只留给 URL、哈希、代码这类不可读字符串。

## 码叔划重点

1. 单行三件套：nowrap + overflow:hidden + ellipsis，少一个省略号都不出现。
2. flex/grid 子项先写 `min-width:0`（或 `minmax(0,1fr)`），盒子被压窄才谈截断。
3. 多行 line-clamp 四件套与标准属性双写；URL 用 anywhere，break-all 只给代码。

## 自测一题

**问**：flex 行里标题写了 `flex:1` + 省略三件套，省略号还是不出现，按钮依旧被顶飞，为什么？一行修复是什么？

**答**：flex 子项 `min-width` 默认是 `auto`（= min-content），长文件名让它的最小宽度等于最长单词，弹性算法拒绝把它压到更窄，内容没有溢出到"被裁剪"的状态，三件套自然无效。修复：给标题加 `min-width: 0`（grid 用 `minmax(0,1fr)`，列方向用 `min-height:0`）。排查顺序：nowrap → overflow:hidden → ellipsis → 宽度确定 → min-width:0，90% 的问题在这五步内。

## 动手实验

- 单行省略多场景实验台（普通块/flex/grid/table/button + min-width:0 修复开关）：[examples/css/10-text-truncation/index-01-single-line.html](../../examples/css/10-text-truncation/index-01-single-line.html)
- 1~5 行 line-clamp 滑块实验台（缺属性对照）：[index-02-multi-line.html](../../examples/css/10-text-truncation/index-02-multi-line.html)
- 长 URL / 长英文 / 中英混排断行对照墙：[index-03-word-breaking.html](../../examples/css/10-text-truncation/index-03-word-breaking.html)
- 综合实战：电商卡片 + 省略表格 + 文件名中段截断 + 智能 tooltip：[index-04-real-layout.html](../../examples/css/10-text-truncation/index-04-real-layout.html)

## 下一话预告

第 11 话《CSS 进阶技巧》——CSS 篇收官：aspect-ratio、object-fit、sticky、scroll-snap、clip-path 一箱散装高频军火。
