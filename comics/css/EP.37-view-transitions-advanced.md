# 漫画 · 第 37 话 View Transitions 进阶：跨页转场与工程化

> 对应正文：[docs/css/24-view-transitions-advanced.md](../../docs/css/24-view-transitions-advanced.md) ｜ 原画：[EP.37-view-transitions-advanced.svg](./EP.37-view-transitions-advanced.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。被 MPA 站点「点击链接白屏闪切」困扰，又被 20 个卡片各写一组伪元素动画规则搞到崩溃。
- **标签君**：HTML5 结构师，搬出三把进阶钥匙——`@view-transition` 跨页自动转场、`view-transition-class` 批量复用、`active-view-transition-type` 类型化控制。

## 剧情梗概

像素酱的基础 View Transitions 在 SPA 里玩得很溜，但 MPA 多页站还是白屏闪切；20 个卡片各写一组 `::view-transition-old/new`，动画规则爆炸；不同转场（展开/收起/删除）共用一套动画，视觉语义混乱。标签君引入进阶三件套：CSS 一行 `@view-transition { navigation: auto }` 让 MPA 获得 SPA 级转场；`view-transition-class: zoom` 批量复用动画规则；`active-view-transition-type(expand)` 按转场类型匹配不同动画。像素酱发现纯 MPA 架构已能超越多数 SPA 的体验。

## 分格解读

### 格1 · 痛点现场

MPA 站点切换像 PPT：A 页点击链接→白屏→B 页。为了转场效果被迫引入前端路由框架，打包体积激增。20 个卡片各写一组伪元素规则，维护成本极高。不同转场类型（展开/收起/删除）没有区分机制，全是同一套淡入淡出。

### 格2 · 机制登场

三把钥匙：跨页自动转场（`@view-transition { navigation: auto }` 一行开启，同站导航自动拍快照补间）、`view-transition-class` 批量复用（`.item { view-transition-class: zoom }` + `::view-transition-group(*.zoom)` 一条规则批量命中）、`active-view-transition-type` 类型化控制（`expand` 用圆形扩散、`collapse` 用圆形收缩、删除用缩小消失）。

### 格3 · 落地收束

四大进阶场景：MPA 跨页转场（两页都需声明 `@view-transition`）、view-transition-class 批量复用（动画规则不再重复）、active-view-transition-type 按类型区分动画、滚动与手势联动（scroll-snap + VT 配合，手势驱动草案级）。Chrome 126+ 独占，Safari/Firefox 渐进增强。

## 码叔划重点

1. `@view-transition { navigation: auto }` 开启 MPA 跨页转场，两页都需声明。
2. `view-transition-class` 批量复用动画规则；`view-transition-name` 仍须全局唯一。
3. `active-view-transition-type()` 按转场类型区分动画，expand/collapse/删除各用各的。

## 自测一题

**问**：MPA 站 A 页声明了 `@view-transition { navigation: auto }`，B 页没有声明。用户从 A 点击链接到 B，会发生 view transition 吗？

**答**：不会。跨页转场要求新旧页面都声明 `@view-transition { navigation: auto }`，否则浏览器不会启动转场机制。这是最常见的「明明配置了却不起效」的坑。

## 动手实验

- view-transition-class 批量复用 + active-view-transition-type 类型化 + MPA 跨页提示 + 滚动联动：[examples/css/24-view-transitions-advanced/](../../examples/css/24-view-transitions-advanced/index-01-view-transitions-advanced.html)

## 下一话预告

第 38 话《Speculation Rules》——`<script type="speculationrules">` 让浏览器在后台预渲染下一页，点击时 LCP ≈ 0ms，与 View Transitions 配合实现「瞬时导航 + 动画」的 MPA 终极体验。
