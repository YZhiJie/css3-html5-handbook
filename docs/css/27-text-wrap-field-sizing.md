# text-wrap · field-sizing · interpolate-size

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 排版细节三件套：`text-wrap` 控制换行美学、`field-sizing` 让输入框随内容伸缩、`interpolate-size` 解锁 `auto` 动画，全是「小而美」的原生能力。

## 目录

- [1. 概念解释](#1-概念解释)
- [2. 语法说明](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（单文件 HTML，双击即开）：

| 示例文件 | 演示内容 |
| --- | --- |
| [index-01-text-wrap-field-sizing.html](../../examples/css/27-text-wrap-field-sizing/index-01-text-wrap-field-sizing.html) | balance/pretty 对比 + field-sizing 输入框 + interpolate-size 高度动画 |

---

## 1. 概念解释

### 1.1 三个「小而美」的排版痛点

1. **标题换行不均**：`text-align: center` 的标题两行字数悬殊，视觉不平衡。
2. **输入框固定尺寸**：`textarea` 固定 4 行，内容多了要滚动，少了留白。
3. **`auto` 不可动画**：`height: 0 → auto` 无法过渡，`max-height`  hack 有截断风险。

### 1.2 原生解法

| 特性 | 回答的问题 | 关键语法 |
| --- | --- | --- |
| `text-wrap: balance` | 标题多行如何均分？ | `text-wrap: balance` |
| `text-wrap: pretty` | 段落如何避免孤词？ | `text-wrap: pretty` |
| `field-sizing: content` | 输入框如何随内容伸缩？ | `field-sizing: content` |
| `interpolate-size` | `auto` 如何参与动画？ | `interpolate-size: allow-keywords` |

---

## 2. 语法说明

### 2.1 text-wrap：换行美学

```css
/* 标题均分：两行字数尽量相等 */
h2 { text-wrap: balance; }

/* 段落防孤词：最后一行不留单个词 */
p { text-wrap: pretty; }
```

- `balance`：适用于标题、引用块——**限 10 行以内**，超出不生效。
- `pretty`：适用于正文段落——**无行数限制**，代价是略增排版计算。

### 2.2 field-sizing：输入框自适应

```css
textarea {
  field-sizing: content; /* 高度随内容伸缩 */
  min-height: 3lh;       /* 最少 3 行 */
  max-height: 10lh;      /* 最多 10 行 */
}
```

- 仅对 `<textarea>`、`<input type="text">`、`<select>` 生效。
- 替代 JS 监听 `input` + 动态调 `style.height` 的 hack。

### 2.3 interpolate-size：`auto` 动画开关

```css
:root {
  interpolate-size: allow-keywords; /* 全局开启 */
}

.details-content {
  height: 0;
  transition: height 0.3s ease;
}
details[open] .details-content {
  height: auto; /* 现在可以平滑过渡了 */
}
```

- 开启后 `auto`、`min-content`、`max-content`、`fit-content` 均可参与过渡。
- **全局开关**，写在 `:root` 上对所有元素生效。

---

## 3. 浏览器兼容性

| 特性 | Chrome | Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| `text-wrap: balance` | 114+ | 114+ | 121+ | 17.5+ |
| `text-wrap: pretty` | 117+ | 117+ | 121+ | 17.5+ |
| `field-sizing: content` | 123+ | 123+ | 132+ | 18.2+ |
| `interpolate-size` | 129+ | 129+ | 136+ | 18.4+ |

> 均为渐进增强特性：不支持时回退为默认行为，功能无损。

---

## 4. 使用场景示例

### 场景 1：标题均分

```css
.article-title { text-wrap: balance; }
```

「深入理解 CSS 容器查询的原理与实践」——两行均分，视觉平衡。

### 场景 2：评论输入框

```css
.comment-input {
  field-sizing: content;
  min-height: 2lh;
  max-height: 8lh;
}
```

用户打字时输入框自动长高，最多 8 行后出滚动条。

### 场景 3：折叠面板动画

```css
:root { interpolate-size: allow-keywords; }
.panel { height: 0; overflow: hidden; transition: height .3s; }
.panel.open { height: auto; }
```

`height: 0 → auto` 平滑过渡，不再需要 `max-height` hack。

---

## 5. 实际应用案例分析

**博客详情页**：

- 文章标题 `text-wrap: balance`——居中标题两行均分，视觉专业。
- 正文段落 `text-wrap: pretty`——避免最后一行孤词，阅读体验提升。
- 评论区 `textarea` 用 `field-sizing: content`——用户输入时框体自适应，不再固定 4 行。
- 折叠目录用 `interpolate-size`——展开/收起平滑动画，零 JS。

---

## 6. 最佳实践与常见坑

1. **balance 限 10 行**：长段落用 `pretty`，短标题用 `balance`，别搞反。
2. **field-sizing 要配 min/max**：`min-height` 防塌缩、`max-height` 防无限膨胀。
3. **interpolate-size 是全局开关**：写在 `:root` 上影响全站，确认无副作用再开启。
4. **渐进增强**：不支持时回退为默认行为——标题不均分、输入框固定、动画瞬变，功能无损。
5. **性能**：`balance`/`pretty` 增加排版计算，长列表慎用；`field-sizing` 在低端机上频繁输入时可能有轻微重排。

---

## 7. 参考资料

- [MDN — text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap)
- [MDN — field-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing)
- [MDN — interpolate-size](https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size)
- [caniuse — text-wrap: balance](https://caniuse.com/css-text-wrap-balance)
- [caniuse — field-sizing](https://caniuse.com/mdn-css_properties_field-sizing)
