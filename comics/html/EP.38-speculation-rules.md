# 漫画 · 第 38 话 Speculation Rules：点击前页面已备好

> 对应正文：[docs/html/13-speculation-rules.md](../../docs/html/13-speculation-rules.md) ｜ 原画：[EP.38-speculation-rules.svg](./EP.38-speculation-rules.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。被 MPA 站点「点击后白屏等待」折磨：DNS→TCP→TLS→TTFB→解析→渲染，LCP 500ms+，用户流失率飙升。
- **标签君**：HTML5 结构师，搬出 Speculation Rules 双件套——`prerender` 后台完整渲染整页、`document_rule` 自动探测可视区链接并按 `eagerness` 三档控制触发时机。

## 剧情梗概

像素酱发现 `rel="prefetch"` 只下载 HTML 文档，JS 不执行、图片不下载，用户感知仍是「加载中」。标签君引入 `<script type="speculationrules">`：`prerender` 在隐藏进程中完整渲染下一页（含 JS/CSS/图片），点击激活时 LCP ≈ 0ms；`document_rule` 自动探测可视区链接，无需维护 URL 列表；`eagerness` 三档（conservative/moderate/eager）平衡速度与资源消耗。配合 View Transitions 跨页转场，纯 MPA 架构获得超越多数 SPA 的导航体验。

## 分格解读

### 格1 · 痛点现场

MPA 导航等待链：click → DNS → TCP → TLS → TTFB → 解析 → 渲染 → LCP 500ms+。`rel="prefetch"` 只拉文档，JS 不执行、图片不下载，感知仍是加载中。不知道用户会点哪个链接，全站 prefetch 浪费带宽；SPA 框架太重不想引入。

### 格2 · 机制登场

推测规则双件套：`prerender` 预渲染（`<script type="speculationrules">` 配置 list 或 document 规则，后台在隐藏进程中完整渲染整页，JS/CSS/图片全部就绪，点击激活 LCP ≈ 0ms）、`document_rule` 自动探测（`href_matches` 匹配 URL 模式 + `eagerness` 三档控制触发时机，`moderate` 在链接进入可视区时触发）。

### 格3 · 落地收束

四大实战场景：电商商品列表（document_rule + moderate，卡片进入可视区即预渲染）、博客「下一篇」（prefetch + list rule，仅预获取 HTML 降低 TTFB）、eagerness 三档对比（conservative=hover 触发、moderate=可视区触发、eager=加载完立即触发）、与 View Transitions 配合（prerender 让页面已渲染 + VT 让切换有动画，MPA 超越 SPA）。Chrome 123+ 独占，Safari/Firefox 渐进增强。

## 码叔划重点

1. `prerender` 后台完整渲染整页（JS/CSS/图片），点击激活 LCP ≈ 0ms。
2. `document_rule` 自动探测可视区链接；`eagerness` 三档控触发时机，全站推荐 moderate。
3. 敏感页面必须排除；需 localhost/https；与 View Transitions 配合实现瞬时导航 + 动画。

## 自测一题

**问**：`eagerness: eager` 与 `eagerness: moderate` 的区别是什么？全站使用 eager 有什么问题？

**答**：`eager` 在页面加载完立即预渲染所有匹配链接，资源消耗巨大；`moderate` 在链接进入可视区时才触发，更平衡。全站用 eager 会同时启动大量隐藏渲染进程，内存和电量消耗激增，移动端尤其危险。

## 动手实验

- list rule 预获取 + document_rule 自动链接预渲染 + eagerness 三档对比 + prerender 状态检测：[examples/html/13-speculation-rules/](../../examples/html/13-speculation-rules/index-01-speculation-rules.html)

## 下一话预告

敬请期待下一批次——更多前沿 CSS / HTML 特性持续解锁中！
