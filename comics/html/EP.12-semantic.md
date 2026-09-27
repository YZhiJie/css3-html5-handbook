# 漫画 · 第 12 话 语义化标签：让机器读懂你的页面

> 对应正文：[docs/html/01-semantic.md](../../docs/html/01-semantic.md) ｜ 原画：[EP.12-semantic.svg](./EP.12-semantic.svg)

## 登场角色

- **像素酱**：CSS 造型师，HTML 篇第一话就被拉来接手祖传页面——满屏 `<div class="box1">`，她想找正文区，搜索引擎和读屏器也想。
- **标签君**：HTML5 结构师，本话主角。掏出一张"标签 → ARIA 角色"映射表，证明好标签名本身就是文档。

## 剧情梗概

HTML5 之前，页面结构全靠 `<div class="header">` 这类私人命名表达，机器完全看不懂。语义化标签把"这是什么内容"写进了标签名：`header/nav/main/article/section/aside/footer` 在无障碍树里自动成为地标，搜索引擎能定位正文，屏幕阅读器能带着用户在区块间跳转。标签君还顺手用 `details/summary` 零 JS 写了个手风琴。

## 分格解读

### 格1 · 痛点现场

`<div>` 和 `<span>` 是无语义的通用容器，只承担布局和样式钩子。`class="header"` 只有作者自己看得懂——爬虫无法区分导航与正文，读屏器列不出可跳转的地标，半年后队友回看代码，结构与样式缠绕在一起不敢重构。

### 格2 · 机制登场

每个语义元素在无障碍树中自带一个隐式 ARIA 角色：页面级 `header → banner`、`nav → navigation`、`main → main`、`aside → complementary`、`footer → contentinfo`。写原生标签等于免费拿到 role **外加**键盘行为（比如 `summary` 可聚焦、Enter/Space 开合）；事后用 `div + role + tabindex + keydown` 补救总会漏掉一环。这就是 ARIA 第一规则：能用原生就别用 ARIA。

### 格3 · 落地收束

一个语义完整的页面骨架：`header(+nav) → main(article > section) + aside → footer`，地标地图一次成型。行内标签各司其职：`details/summary` 零 JS 手风琴、`time datetime` 给日期机器可读格式、`figure/figcaption` 把图和说明绑成可整体搬移的单元、`mark/strong/em` 视觉相近但语义不同。多个 `nav/aside` 记得用 `aria-label` 区分；`<main>` 每页最多一个；标题按字面 h1→h2→h3 递进——曾经的"分段大纲算法"从未被任何浏览器实现，已从规范废弃。

## 码叔划重点

1. div/span 是无语义通用容器；结构标签名即含义，SEO 与读屏器直接读出角色。
2. 语义标签 ≈ 免费 ARIA role 加键盘行为——能用原生就别用 ARIA 补救。
3. main 每页唯一；标题按字面 h1→h2→h3 递进不跳级，大纲算法从未实现。

## 自测一题

**问**：把 `<div class="nav">` 改成 `<nav>`，页面视觉没有任何变化，收益到底在哪？

**答**：收益在无障碍树和机器可读性。`<nav>` 隐式角色是 `navigation`，屏幕阅读器会把它列为可跳转地标，用户不必逐行听完整页；搜索引擎也能把导航链接与正文区分开。此外语义元素常附带原生交互（`details` 的开合、`summary` 的键盘激活），这些都是 `div + class` 无法提供的。多个 nav 时再配 `aria-label="主导航"` 区分用途。

## 动手实验

- 文档结构标签 + 地标导航可视化 + div 滥用反模式对比：[examples/html/01-semantic/index-01-landmark-structure.html](../../examples/html/01-semantic/index-01-landmark-structure.html)
- details/summary 手风琴、time、figure、mark、strong/em/b/i 语义对比：[index-02-inline-semantic.html](../../examples/html/01-semantic/index-02-inline-semantic.html)
- 标题大纲分析器：实时扫描 DOM 输出语义体检报告：[index-03-outline-analyzer.html](../../examples/html/01-semantic/index-03-outline-analyzer.html)

## 下一话预告

第 13 话《表单》——把校验下沉给浏览器：输入类型、约束管线与 Constraint Validation API。
