# Speculation Rules 推测规则

> 面向前端开发人员的 HTML5 高级特性参考资料 —— `<script type="speculationrules">` 让浏览器在后台**推测性地预渲染（prerender）或预获取（prefetch）**即将访问的页面，实现「点击即展示」的瞬时导航体验。与 [View Transitions 进阶（CSS 篇 24）](../css/24-view-transitions-advanced.md) 天然搭档：Speculation Rules 负责「让下一页提前准备好」，View Transitions 负责「切换时有动画」，两者叠加让 MPA 多页站获得超越 SPA 的体验。

## 目录

- [1. 概念解释 —— 是什么、解决什么问题、底层原理](#1-概念解释)
- [2. 语法说明 —— 完整语法、属性/参数表、代码片段](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（**需在 `http://localhost` 运行**，file:// 双击不生效）：

| 示例文件 | 演示内容 |
| --- | --- |
| [index-01-speculation-rules.html](../../examples/html/13-speculation-rules/index-01-speculation-rules.html) | list rule 预获取 + document_rule 自动链接预渲染 + eagerness 三档对比 + prerender 状态检测 |

---

## 1. 概念解释

### 1.1 Speculation Rules 是什么

传统性能优化中，`rel="prefetch"` 只能预获取 HTML 文档本身，而 **prerender** 可以在后台完整渲染整个页面（包括执行 JS、下载子资源、构建 DOM），让下一页在用户点击前就处于「已渲染完毕」状态。

Speculation Rules API 用 JSON 配置告诉浏览器「哪些 URL 应该提前准备」：

```html
<script type="speculationrules">
{
  "prerender": [{
    "source": "list",
    "urls": ["/about", "/contact"]
  }]
}
</script>
```

### 1.2 解决什么问题

| 痛点 | 传统方案 | Speculation Rules 方案 |
| --- | --- | --- |
| 点击链接后白屏等待 | `<link rel="prefetch">` 只拉文档 | prerender 后台完整渲染整页 |
| 不知道用户会点哪个 | 全站 prefetch 浪费带宽 | `document_rule` 自动探测可视区链接，按需推测 |
| SPA 首屏快、MPA 切换慢 | 被迫引入前端路由框架 | MPA + prerender + View Transitions = 原生瞬时导航 |
| 预渲染太激进消耗资源 | 无分级控制 | `eagerness` 三档（conservative / moderate / eager）精细控制 |

### 1.3 底层原理

浏览器在独立隐藏的渲染进程中预渲染目标页面：

1. **预获取（prefetch）**：仅下载 HTML 文档，不执行脚本、不渲染。
2. **预渲染（prerender）**：完整加载并渲染页面，包括 JS 执行、CSS 计算、图片解码；预渲染页拥有独立的生命周期和内存隔离。
3. **激活（activation）**：用户实际导航到该 URL 时，浏览器将预渲染的页面「提升」为当前活动页，瞬间呈现（LCP ≈ 0ms）。

**资源管理**：浏览器自动限制预渲染数量（通常 1–3 个），超出时按 LRU 淘汰；预渲染页不会触发 `requestAnimationFrame` 等可见性相关 API，避免无谓消耗。

---

## 2. 语法说明

### 2.1 基本结构

```html
<script type="speculationrules">
{
  "prerender": [...],
  "prefetch": [...]
}
</script>
```

- `prerender`：后台完整渲染页面（含 JS/CSS/图片）。
- `prefetch`：仅预获取 HTML 文档。

### 2.2 list rule：显式 URL 列表

```json
{
  "prerender": [{
    "source": "list",
    "urls": ["/products/1", "/products/2", "/products/3"]
  }]
}
```

- 适合目标 URL 明确且有限的场景（如电商商品详情页、文章详情页）。
- 列表项必须是**同站同源** URL。

### 2.3 document_rule：自动探测页面链接

```json
{
  "prerender": [{
    "source": "document",
    "where": {
      "and": [
        { "href_matches": "/products/*" },
        { "selector_matches": "a[rel~=prerender]" }
      ]
    },
    "eagerness": "moderate"
  }]
}
```

| 字段 | 说明 |
| --- | --- |
| `href_matches` | URL 模式匹配（支持通配符 `*`） |
| `selector_matches` | 仅匹配符合 CSS 选择器的链接元素 |
| `eagerness` | 触发积极度（见下节） |

### 2.4 eagerness 三档

| 档位 | 触发时机 | 适用场景 |
| --- | --- | --- |
| `conservative` | 鼠标悬停（hover）或指针按下时 | 保守策略，移动端也适用（hover 退化为 touchstart） |
| `moderate` | 链接进入可视区（viewport）时 | 平衡策略，提前准备但不过度激进 |
| `eager` | 页面加载完立即执行 | 适合极小站点或极重要的下一页 |

### 2.5 完整范式

```html
<script type="speculationrules">
{
  "prerender": [
    {
      "source": "document",
      "where": {
        "and": [
          { "href_matches": "/*" },
          { "not": { "href_matches": "/admin/*" } }
        ]
      },
      "eagerness": "moderate"
    }
  ],
  "prefetch": [
    {
      "source": "list",
      "urls": ["/api/health"]
    }
  ]
}
</script>
```

---

## 3. 浏览器兼容性

| 浏览器 | 支持版本 | 说明 |
| --- | --- | --- |
| Chrome / Edge | 121+（prefetch）/ 123+（prerender） | 全功能 |
| Safari | 暂不支持 | 2024 年宣布评估中 |
| Firefox | 暂不支持 | Mozilla 标准立场：值得原型验证 |

> prerender 为 Chromium 独占特性。不支持时浏览器静默忽略 speculationrules 脚本，不影响页面功能。

---

## 4. 使用场景示例

### 4.1 电商商品列表页预渲染详情

```html
<script type="speculationrules">
{
  "prerender": [{
    "source": "document",
    "where": {
      "and": [
        { "href_matches": "/product/*" },
        { "selector_matches": ".product-card a" }
      ]
    },
    "eagerness": "moderate"
  }]
}
</script>
```

商品卡片进入可视区即触发后台预渲染，用户点击后瞬间展示详情页。

### 4.2 博客文章「下一篇」预获取

```html
<script type="speculationrules">
{
  "prefetch": [{
    "source": "list",
    "urls": ["/posts/next-article"]
  }]
}
</script>
```

仅预获取 HTML，不执行 JS，适合内容型站点降低下一页 TTFB。

### 4.3 全站 moderate 自动探测

```html
<script type="speculationrules">
{
  "prerender": [{
    "source": "document",
    "where": { "href_matches": "/*" },
    "eagerness": "moderate"
  }]
}
</script>
```

所有同站链接进入可视区即预渲染。注意控制范围，避免预渲染管理后台等敏感页面。

### 4.4 排除特定路径

```json
{
  "prerender": [{
    "source": "document",
    "where": {
      "and": [
        { "href_matches": "/*" },
        { "not": { "href_matches": "/logout" } },
        { "not": { "href_matches": "/admin/*" } },
        { "not": { "selector_matches": "[data-no-speculate]" } }
      ]
    },
    "eagerness": "conservative"
  }]
}
```

---

## 5. 实际应用案例分析

**场景：内容型 MPA 博客，希望列表页→详情页达到 SPA 级体验。**

方案：

1. **列表页植入 Speculation Rules**：`document_rule` + `href_matches: /post/*` + `eagerness: moderate`，文章卡片进入可视区即后台预渲染。
2. **全站开启 View Transitions**：`@view-transition { navigation: auto; }` + 共享元素 `view-transition-name: post-cover-<id>`。
3. **用户点击文章**：由于页面已被 prerender，激活瞬间完成；View Transitions 接管视觉过渡，封面图从列表位置平滑放大到详情页头图位置。

体验：列表页点击文章→封面图放大→详情页已完全渲染，LCP 接近 0ms，视觉过渡自然。返回列表时执行反向动画。

收益：纯 MPA 架构，无前端路由、无打包体积增加，获得超越多数 SPA 的导航体验。

---

## 6. 最佳实践与常见坑

1. **必须在 http://localhost 或 https 下生效**：file:// 协议不支持 prerender/prefetch，示例文件头部已注明。
2. **同站同源限制**：只能预渲染/预获取同域名下的 URL，跨域链接会被浏览器静默忽略。
3. **eagerness 别用 eager 做全站**：eager 会在页面加载完立即预渲染所有匹配链接，资源消耗巨大；全站推荐 `moderate` 或 `conservative`。
4. **敏感页面必须排除**：登录、注销、支付、管理后台等页面若被预渲染可能导致安全问题或状态异常——用 `not` + `href_matches` 排除。
5. **预渲染页生命周期限制**：预渲染页不会触发 `pageshow`/`focus` 等事件，依赖这些逻辑的代码需在激活后重新初始化；可通过 `performance.getEntriesByType('navigation')[0].activationStart` 检测是否为预渲染激活。
6. **内存与电量**：每个预渲染页等于一个隐藏标签页，移动端应更保守（推荐 `conservative`）。
7. **与 Service Worker 协同**：若已使用 SW 缓存，Speculation Rules 的 prefetch 会与 SW 策略叠加，确保不会重复下载已缓存资源。
8. **调试**：Chrome DevTools → Application → Background services → Speculative loads 可查看预渲染状态与成功率。

---

## 7. 参考资料

- [Speculation Rules API（W3C WICG）](https://wicg.github.io/nav-speculation/speculation-rules.html)
- [MDN：Speculation Rules](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)
- [web.dev：使用 Speculation Rules 实现即时导航](https://developer.chrome.com/docs/web-platform/prerender-pages)
- [web.dev：eagerness 与 document rules](https://developer.chrome.com/docs/web-platform/speculation-rules-improvements)
- 相关文档：[View Transitions 进阶（CSS 篇 24）](../css/24-view-transitions-advanced.md) ｜ [Web Workers（HTML 篇 06）](06-web-workers.md)
