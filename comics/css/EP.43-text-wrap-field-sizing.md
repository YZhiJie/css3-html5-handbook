# 漫画 · 第 43 话 text-wrap · field-sizing · interpolate-size：排版细节三件套

> 对应正文：[docs/css/27-text-wrap-field-sizing.md](../../docs/css/27-text-wrap-field-sizing.md) ｜ 原画：[EP.43-text-wrap-field-sizing.svg](./EP.43-text-wrap-field-sizing.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。居中标题折成 14:2 两行像被狗啃、textarea 固定 4 行内容一多就出滚动条、`height: auto` 动画直接跳变——三个「小而美」的排版细节逼疯了她，只能靠 max-height hack 和 JS 监听 input 硬补。
- **标签君**：HTML5 结构师，搬出三个原生属性：`text-wrap` 管换行策略、`field-sizing` 让输入框随内容伸缩、`interpolate-size` 解开 auto 不可动画的世纪封印。

## 剧情梗概

UI 的质感往往死在细节上：标题换行字数不均、输入框要么挤要么空、折叠面板高度动画跳变。过去这三件事都要写 JS 或 hack 来补，代码丑还脆弱。本话像素酱学会三件原生武器——`text-wrap: balance` 让标题两行字数尽量相等、`field-sizing: content` 让 textarea 随内容自动长高、`interpolate-size: allow-keywords` 让 `height: 0 → auto` 平滑过渡，全部零 JS。

## 分格解读

### 格1 · 痛点现场

三个小而美的痛：标题两行 14:2 字数严重不均；textarea 固定行数，内容多了出滚动条、少了留大片空白；`height: auto` 无法过渡，只能用 max-height hack 截断或写 50 行 JS 解决 1 行的事。

### 格2 · 机制登场

`text-wrap: balance` 均分标题（限 10 行以内）、`text-wrap: pretty` 防孤词（无行数限制）；`field-sizing: content` 让 textarea/input/select 随内容伸缩，配 min/max-height 兜底；`interpolate-size: allow-keywords` 写在 `:root` 上，auto、min-content、max-content 等关键字尺寸全部可动画。

### 格3 · 落地收束

四大场景：标题均分（视觉平衡专业）、输入框自适应（内容多自动长高、封顶 max-height）、auto 平滑过渡（折叠面板零 JS）、渐进增强（不支持时自动回退默认行为，无副作用）。Chrome 114+ / Safari 17.5+ / Firefox 121+ 已全绿。

## 码叔划重点

1. balance 均分标题限 10 行；pretty 防孤词无行数限制，长段落用 pretty。
2. field-sizing: content 只认 textarea/input/select；min/max-height 必须兜底。
3. interpolate-size: allow-keywords 是全局开关，写在 :root 上全站生效。

## 自测一题

**问**：为什么 `text-wrap: balance` 要限制 10 行以内，而 `pretty` 没有行数限制？

**答**：balance 需要浏览器对每一行尝试多种断行组合并评分，计算量随行数指数级增长，10 行是规范定的性能上限；pretty 只做「最后一行不留孤词」的局部调整，代价与行数线性相关，所以不限行数。实务上：标题/引用用 balance，正文段落用 pretty。

## 动手实验

- text-wrap 三策略对比 + field-sizing 自适应输入框 + interpolate-size 折叠面板：[examples/css/27-text-wrap-field-sizing/](../../examples/css/27-text-wrap-field-sizing/index-01-text-wrap-field-sizing.html)

## 下一话预告

第 44 话《Web Components 入门》——React 组件 Vue 用不了、Vue 组件 React 用不了？浏览器原生组件化三件套：template 惰性模板、slot 插槽分发、customElements.define 自定义元素，零依赖跨框架复用。
