# 漫画 · 第 23 话 层叠层：@layer 终结 !important 战争

> 对应正文：[docs/css/13-cascade-layers.md](../../docs/css/13-cascade-layers.md) ｜ 原画：[EP.23-cascade-layers.svg](./EP.23-cascade-layers.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。引入 UI 框架后覆盖样式越写越具体，`!important` 满天飞，DevTools 里找不到谁在生效。
- **标签君**：HTML5 结构师，搬出 `@layer` 五层架构，让"reset < base < components < utilities < 未分层"的优先级关系清晰可预期。

## 剧情梗概

选择器章（EP.01）讲了特异性三元组，但特异性只是层叠的第三层。像素酱先被 `!important` 军备竞赛折磨——框架用 `!important`，业务用更具体的选择器 + `!important`，最后 DOM 一改全盘崩。标签君引入 `@layer`，把样式分层：层顺序比特异性更强，低层 `!important` 也赢不了高层普通规则。

## 分格解读

### 格1 · 痛点现场

框架 `.btn { background: blue !important; }`，业务覆盖 `.page .btn { background: red !important; }`，再覆盖 `#app .page .btn { background: green !important; }`。特异性从 (0,1,0) 涨到 (1,2,0)，最终只能靠 `!important` 硬刚。DOM 结构一变，覆盖链断裂。

### 格2 · 机制登场

`@layer reset, base, components, utilities;` 声明层序，层块内写规则。层叠决胜顺序变为：来源 → 层 → 特异性 → 出现顺序。关键洞察：**层 > 特异性**——`utilities` 层的 `.class` 能覆盖 `base` 层的 `#id !important`。未分层规则优先级最高，用于页面特有覆盖。

### 格3 · 落地收束

五层架构可视化：reset → base → components → utilities → 未分层。覆盖示例：`overrides` 层的普通规则覆盖 `utilities` 层的 `!important`（因为层序更晚）。`!important` 逆序规则：分层中 `base !important` > `utilities !important`，防止工具层封死下层。嵌套层 `@layer framework { @layer reset {} }` 和 `@import "tw.css" layer(tw)` 让第三方框架无缝接入。

## 码叔划重点

1. 层声明顺序即优先级：先声明的层 < 后声明的层，未分层规则最高。
2. 层顺序比特异性更强：低层 `#id !important` 也赢不了高层 `.class`。
3. 分层规则中 `!important` 按层逆序——滥用 `!important` 时层叠层也救不了你。

## 自测一题

**问**：`@layer base { .a { color: red !important; } }` 和 `@layer utilities { .a { color: green; } }`，`.a` 最终是什么颜色？为什么？

**答**：红色。因为 `base` 层中的 `!important` 在层逆序中优先级高于 `utilities` 层的普通规则。层叠层中 `!important` 的行为与普通层叠相反：先声明的层 `!important` > 后声明的层 `!important` > 后声明的层普通规则 > 先声明的层普通规则。

## 动手实验

- 五层架构 + 层覆盖演示 + 嵌套层 + !important 逆序 + 层可视化：[examples/css/13-cascade-layers/](../../examples/css/13-cascade-layers/index-01-cascade-layers.html)

## 下一话预告

第 24 话《现代颜色》——`oklch()` 感知均匀、`color-mix()` 混色、`light-dark()` 双主题，设计系统的颜色革命。
