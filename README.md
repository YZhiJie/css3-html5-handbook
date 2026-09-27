# CSS3 & HTML5 高级特性实战手册

> 一套系统整理 CSS3 与 HTML5 高级常用知识点的开源参考资料：**深度文档 + 可直接运行示例** 双轨呈现，面向有一定基础的前端开发人员。

## 项目定位

- **参考资料**：每个知识点覆盖「概念解释 → 语法说明 → 浏览器兼容性 → 多场景示例 → 实战案例 → 最佳实践」完整链路。
- **学习资源**：全部示例均为单文件 HTML，**双击即可在浏览器中运行**，无需构建工具与网络依赖。
- **速查手册**：`cheatsheet.md` 提供高频语法速查，适合开发中快速定位。

## 目录结构

```
css3-html5-handbook/
├── README.md               # 项目导航（本文件）
├── cheatsheet.md           # 高频语法速查表
├── design-system.md        # Spark 设计系统（Web 界面用：色彩/字体/组件/动效 token）
├── docs/                   # 深度文档（每主题一篇）
│   ├── css/                # CSS3 二十大主题
│   └── html/               # HTML5 十七大主题
├── examples/               # 可运行示例（与文档一一对应）
│   ├── css/
│   └── html/
└── comics/                 # 漫画剧场（「霓虹墨」风格，全 46 话）
    ├── style-guide.md      # 漫画美术风格规范
    ├── manifest.json       # 话数清单（校验器依据）
    ├── check-comics.mjs    # SVG 良构 / MD 行数 / 链接一致性校验
    ├── samples/            # 三张风格定妆稿（SVG，不参与编号）
    ├── css/                # CSS 篇 EP.01–11、EP.22–31、EP.33、EP.35、EP.37、EP.39、EP.41、EP.43、EP.45（SVG + 讲解 MD）
    └── html/               # HTML 篇 EP.12–21、EP.32、EP.34、EP.36、EP.38、EP.40、EP.42、EP.44、EP.46（SVG + 讲解 MD）
```

## 内容导航

### CSS3 篇

| 编号 | 主题 | 文档 | 示例 |
| --- | --- | --- | --- |
| 01 | 高级选择器 | [docs/css/01-selectors.md](docs/css/01-selectors.md) | [examples/css/01-selectors/](examples/css/01-selectors/) |
| 02 | 动画与过渡 | [docs/css/02-animation-transition.md](docs/css/02-animation-transition.md) | [examples/css/02-animation-transition/](examples/css/02-animation-transition/) |
| 03 | 弹性布局 Flexbox | [docs/css/03-flexbox.md](docs/css/03-flexbox.md) | [examples/css/03-flexbox/](examples/css/03-flexbox/) |
| 04 | 网格布局 Grid | [docs/css/04-grid.md](docs/css/04-grid.md) | [examples/css/04-grid/](examples/css/04-grid/) |
| 05 | 响应式设计 | [docs/css/05-responsive.md](docs/css/05-responsive.md) | [examples/css/05-responsive/](examples/css/05-responsive/) |
| 06 | 变量与计算 | [docs/css/06-variables-calc.md](docs/css/06-variables-calc.md) | [examples/css/06-variables-calc/](examples/css/06-variables-calc/) |
| 07 | 阴影效果 | [docs/css/07-shadows.md](docs/css/07-shadows.md) | [examples/css/07-shadows/](examples/css/07-shadows/) |
| 08 | 渐变背景 | [docs/css/08-gradients.md](docs/css/08-gradients.md) | [examples/css/08-gradients/](examples/css/08-gradients/) |
| 09 | 变换 Transform | [docs/css/09-transform.md](docs/css/09-transform.md) | [examples/css/09-transform/](examples/css/09-transform/) |
| 10 | 文本截断 | [docs/css/10-text-truncation.md](docs/css/10-text-truncation.md) | [examples/css/10-text-truncation/](examples/css/10-text-truncation/) |
| 11 | CSS 进阶技巧 | [docs/css/11-pro-tips.md](docs/css/11-pro-tips.md) | [examples/css/11-pro-tips/](examples/css/11-pro-tips/) |
| 12 | 容器查询 | [docs/css/12-container-queries.md](docs/css/12-container-queries.md) | [examples/css/12-container-queries/](examples/css/12-container-queries/) |
| 13 | 层叠层 | [docs/css/13-cascade-layers.md](docs/css/13-cascade-layers.md) | [examples/css/13-cascade-layers/](examples/css/13-cascade-layers/) |
| 14 | 现代颜色 | [docs/css/14-modern-colors.md](docs/css/14-modern-colors.md) | [examples/css/14-modern-colors/](examples/css/14-modern-colors/) |
| 15 | 滚动驱动动画 | [docs/css/15-scroll-driven-animations.md](docs/css/15-scroll-driven-animations.md) | [examples/css/15-scroll-driven-animations/](examples/css/15-scroll-driven-animations/) |
| 16 | :has() 选择器 | [docs/css/16-has-selector.md](docs/css/16-has-selector.md) | [examples/css/16-has-selector/](examples/css/16-has-selector/) |
| 17 | View Transitions | [docs/css/17-view-transitions.md](docs/css/17-view-transitions.md) | [examples/css/17-view-transitions/](examples/css/17-view-transitions/) |
| 18 | CSS 嵌套 | [docs/css/18-css-nesting.md](docs/css/18-css-nesting.md) | [examples/css/18-css-nesting/](examples/css/18-css-nesting/) |
| 19 | @scope 作用域 | [docs/css/19-scope.md](docs/css/19-scope.md) | [examples/css/19-scope/](examples/css/19-scope/) |
| 20 | @property 注册 | [docs/css/20-property.md](docs/css/20-property.md) | [examples/css/20-property/](examples/css/20-property/) |
| 21 | 锚点定位 | [docs/css/21-anchor-positioning.md](docs/css/21-anchor-positioning.md) | [examples/css/21-anchor-positioning/](examples/css/21-anchor-positioning/) |
| 22 | @starting-style 入场动画 | [docs/css/22-starting-style.md](docs/css/22-starting-style.md) | [examples/css/22-starting-style/](examples/css/22-starting-style/) |
| 23 | 滚动吸附 | [docs/css/23-scroll-snap.md](docs/css/23-scroll-snap.md) | [examples/css/23-scroll-snap/](examples/css/23-scroll-snap/) |
| 24 | View Transitions 进阶 | [docs/css/24-view-transitions-advanced.md](docs/css/24-view-transitions-advanced.md) | [examples/css/24-view-transitions-advanced/](examples/css/24-view-transitions-advanced/) |
| 25 | color-mix 与 light-dark | [docs/css/25-color-mix-light-dark.md](docs/css/25-color-mix-light-dark.md) | [examples/css/25-color-mix-light-dark/](examples/css/25-color-mix-light-dark/) |
| 26 | @container 进阶 | [docs/css/26-container-advanced.md](docs/css/26-container-advanced.md) | [examples/css/26-container-advanced/](examples/css/26-container-advanced/) |
| 27 | text-wrap 与 field-sizing | [docs/css/27-text-wrap-field-sizing.md](docs/css/27-text-wrap-field-sizing.md) | [examples/css/27-text-wrap-field-sizing/](examples/css/27-text-wrap-field-sizing/) |
| 28 | @layer 进阶 | [docs/css/28-layer-advanced.md](docs/css/28-layer-advanced.md) | [examples/css/28-layer-advanced/](examples/css/28-layer-advanced/) |

### HTML5 篇

| 编号 | 主题 | 文档 | 示例 |
| --- | --- | --- | --- |
| 01 | 语义化标签 | [docs/html/01-semantic.md](docs/html/01-semantic.md) | [examples/html/01-semantic/](examples/html/01-semantic/) |
| 02 | 表单增强 | [docs/html/02-forms.md](docs/html/02-forms.md) | [examples/html/02-forms/](examples/html/02-forms/) |
| 03 | Canvas 绘图 | [docs/html/03-canvas.md](docs/html/03-canvas.md) | [examples/html/03-canvas/](examples/html/03-canvas/) |
| 04 | SVG 图形 | [docs/html/04-svg.md](docs/html/04-svg.md) | [examples/html/04-svg/](examples/html/04-svg/) |
| 05 | Web 存储 | [docs/html/05-web-storage.md](docs/html/05-web-storage.md) | [examples/html/05-web-storage/](examples/html/05-web-storage/) |
| 06 | Web Workers | [docs/html/06-web-workers.md](docs/html/06-web-workers.md) | [examples/html/06-web-workers/](examples/html/06-web-workers/) |
| 07 | 地理定位 | [docs/html/07-geolocation.md](docs/html/07-geolocation.md) | [examples/html/07-geolocation/](examples/html/07-geolocation/) |
| 08 | 拖放 API | [docs/html/08-drag-drop.md](docs/html/08-drag-drop.md) | [examples/html/08-drag-drop/](examples/html/08-drag-drop/) |
| 09 | 多媒体元素 | [docs/html/09-multimedia.md](docs/html/09-multimedia.md) | [examples/html/09-multimedia/](examples/html/09-multimedia/) |
| 10 | Popover | [docs/html/10-popover.md](docs/html/10-popover.md) | [examples/html/10-popover/](examples/html/10-popover/) |
| 11 | Observer 三件套 | [docs/html/11-observers.md](docs/html/11-observers.md) | [examples/html/11-observers/](examples/html/11-observers/) |
| 12 | dialog 元素 | [docs/html/12-dialog.md](docs/html/12-dialog.md) | [examples/html/12-dialog/](examples/html/12-dialog/) |
| 13 | Speculation Rules | [docs/html/13-speculation-rules.md](docs/html/13-speculation-rules.md) | [examples/html/13-speculation-rules/](examples/html/13-speculation-rules/) |
| 14 | details 与 summary 进阶 | [docs/html/14-details-advanced.md](docs/html/14-details-advanced.md) | [examples/html/14-details-advanced/](examples/html/14-details-advanced/) |
| 15 | Web Locks API | [docs/html/15-web-locks.md](docs/html/15-web-locks.md) | [examples/html/15-web-locks/](examples/html/15-web-locks/) |
| 16 | Web Components 入门 | [docs/html/16-web-components.md](docs/html/16-web-components.md) | [examples/html/16-web-components/](examples/html/16-web-components/) |
| 17 | Service Worker 缓存策略 | [docs/html/17-service-worker-cache.md](docs/html/17-service-worker-cache.md) | [examples/html/17-service-worker-cache/](examples/html/17-service-worker-cache/) |

## 漫画剧场 · 霓虹墨 Neon Ink

> 像素酱、标签君与码叔主演的三格技术漫画：每话 = 一张可无损缩放的 SVG 原画 + 一篇讲解（剧情梗概 / 分格解读 / 码叔划重点 / 自测题 / 动手实验）。

### CSS 篇（EP.01–11）

| 话数 | 标题 | 原画 | 讲解 |
| --- | --- | --- | --- |
| EP.01 | 选择器 | [SVG](comics/css/EP.01-selectors.svg) | [讲解](comics/css/EP.01-selectors.md) |
| EP.02 | 动画与过渡 | [SVG](comics/css/EP.02-animation-transition.svg) | [讲解](comics/css/EP.02-animation-transition.md) |
| EP.03 | Flexbox | [SVG](comics/css/EP.03-flexbox.svg) | [讲解](comics/css/EP.03-flexbox.md) |
| EP.04 | Grid | [SVG](comics/css/EP.04-grid.svg) | [讲解](comics/css/EP.04-grid.md) |
| EP.05 | 响应式 | [SVG](comics/css/EP.05-responsive.svg) | [讲解](comics/css/EP.05-responsive.md) |
| EP.06 | 变量与 calc | [SVG](comics/css/EP.06-variables-calc.svg) | [讲解](comics/css/EP.06-variables-calc.md) |
| EP.07 | 阴影 | [SVG](comics/css/EP.07-shadows.svg) | [讲解](comics/css/EP.07-shadows.md) |
| EP.08 | 渐变 | [SVG](comics/css/EP.08-gradients.svg) | [讲解](comics/css/EP.08-gradients.md) |
| EP.09 | Transform | [SVG](comics/css/EP.09-transform.svg) | [讲解](comics/css/EP.09-transform.md) |
| EP.10 | 文本截断 | [SVG](comics/css/EP.10-text-truncation.svg) | [讲解](comics/css/EP.10-text-truncation.md) |
| EP.11 | CSS 进阶技巧 | [SVG](comics/css/EP.11-pro-tips.svg) | [讲解](comics/css/EP.11-pro-tips.md) |

### HTML 篇（EP.12–21）

| 话数 | 标题 | 原画 | 讲解 |
| --- | --- | --- | --- |
| EP.12 | 语义化标签 | [SVG](comics/html/EP.12-semantic.svg) | [讲解](comics/html/EP.12-semantic.md) |
| EP.13 | 表单 | [SVG](comics/html/EP.13-forms.svg) | [讲解](comics/html/EP.13-forms.md) |
| EP.14 | Canvas | [SVG](comics/html/EP.14-canvas.svg) | [讲解](comics/html/EP.14-canvas.md) |
| EP.15 | SVG | [SVG](comics/html/EP.15-svg.svg) | [讲解](comics/html/EP.15-svg.md) |
| EP.16 | Web Storage | [SVG](comics/html/EP.16-web-storage.svg) | [讲解](comics/html/EP.16-web-storage.md) |
| EP.17 | Web Workers | [SVG](comics/html/EP.17-web-workers.svg) | [讲解](comics/html/EP.17-web-workers.md) |
| EP.18 | 地理定位 | [SVG](comics/html/EP.18-geolocation.svg) | [讲解](comics/html/EP.18-geolocation.md) |
| EP.19 | 拖放 API | [SVG](comics/html/EP.19-drag-drop.svg) | [讲解](comics/html/EP.19-drag-drop.md) |
| EP.20 | 多媒体元素 | [SVG](comics/html/EP.20-multimedia.svg) | [讲解](comics/html/EP.20-multimedia.md) |
| EP.21 | HTML 进阶技巧（完结篇） | [SVG](comics/html/EP.21-pro-tips.svg) | [讲解](comics/html/EP.21-pro-tips.md) |
| EP.22 | 容器查询 | [SVG](comics/css/EP.22-container-queries.svg) | [讲解](comics/css/EP.22-container-queries.md) |
| EP.23 | 层叠层 | [SVG](comics/css/EP.23-cascade-layers.svg) | [讲解](comics/css/EP.23-cascade-layers.md) |
| EP.24 | 现代颜色 | [SVG](comics/css/EP.24-modern-colors.svg) | [讲解](comics/css/EP.24-modern-colors.md) |
| EP.25 | 滚动驱动动画 | [SVG](comics/css/EP.25-scroll-driven-animations.svg) | [讲解](comics/css/EP.25-scroll-driven-animations.md) |
| EP.26 | :has() 选择器 | [SVG](comics/css/EP.26-has-selector.svg) | [讲解](comics/css/EP.26-has-selector.md) |
| EP.27 | View Transitions | [SVG](comics/css/EP.27-view-transitions.svg) | [讲解](comics/css/EP.27-view-transitions.md) |
| EP.28 | CSS 嵌套 | [SVG](comics/css/EP.28-css-nesting.svg) | [讲解](comics/css/EP.28-css-nesting.md) |
| EP.29 | @scope 作用域 | [SVG](comics/css/EP.29-scope.svg) | [讲解](comics/css/EP.29-scope.md) |
| EP.30 | @property 注册 | [SVG](comics/css/EP.30-property.svg) | [讲解](comics/css/EP.30-property.md) |
| EP.31 | 锚点定位 | [SVG](comics/css/EP.31-anchor-positioning.svg) | [讲解](comics/css/EP.31-anchor-positioning.md) |
| EP.32 | Popover | [SVG](comics/html/EP.32-popover.svg) | [讲解](comics/html/EP.32-popover.md) |
| EP.33 | @starting-style | [SVG](comics/css/EP.33-starting-style.svg) | [讲解](comics/css/EP.33-starting-style.md) |
| EP.34 | Observer 三件套 | [SVG](comics/html/EP.34-observers.svg) | [讲解](comics/html/EP.34-observers.md) |
| EP.35 | 滚动吸附 | [SVG](comics/css/EP.35-scroll-snap.svg) | [讲解](comics/css/EP.35-scroll-snap.md) |
| EP.36 | dialog 元素 | [SVG](comics/html/EP.36-dialog.svg) | [讲解](comics/html/EP.36-dialog.md) |
| EP.37 | View Transitions 进阶 | [SVG](comics/css/EP.37-view-transitions-advanced.svg) | [讲解](comics/css/EP.37-view-transitions-advanced.md) |
| EP.38 | Speculation Rules | [SVG](comics/html/EP.38-speculation-rules.svg) | [讲解](comics/html/EP.38-speculation-rules.md) |
| EP.39 | color-mix 与 light-dark | [SVG](comics/css/EP.39-color-mix-light-dark.svg) | [讲解](comics/css/EP.39-color-mix-light-dark.md) |
| EP.40 | details 与 summary 进阶 | [SVG](comics/html/EP.40-details-advanced.svg) | [讲解](comics/html/EP.40-details-advanced.md) |
| EP.41 | @container 进阶 | [SVG](comics/css/EP.41-container-advanced.svg) | [讲解](comics/css/EP.41-container-advanced.md) |
| EP.42 | Web Locks API | [SVG](comics/html/EP.42-web-locks.svg) | [讲解](comics/html/EP.42-web-locks.md) |
| EP.43 | text-wrap 与 field-sizing | [SVG](comics/css/EP.43-text-wrap-field-sizing.svg) | [讲解](comics/css/EP.43-text-wrap-field-sizing.md) |
| EP.44 | Web Components 入门 | [SVG](comics/html/EP.44-web-components.svg) | [讲解](comics/html/EP.44-web-components.md) |
| EP.45 | @layer 进阶 | [SVG](comics/css/EP.45-layer-advanced.svg) | [讲解](comics/css/EP.45-layer-advanced.md) |
| EP.46 | Service Worker 缓存 | [SVG](comics/html/EP.46-service-worker-cache.svg) | [讲解](comics/html/EP.46-service-worker-cache.md) |

## 如何使用

1. **阅读文档**：从上方导航表进入任意主题文档，按「概念 → 语法 → 兼容性 → 场景 → 案例 → 最佳实践」的顺序学习。
2. **运行示例**：进入对应 `examples/` 目录，双击任意 `index-*.html` 即可在浏览器中查看效果。
3. **需要本地服务器的特例**（均在示例文件头部注明）：
   - `06-web-workers`：已采用 Blob 内联 Worker，双击即可运行；多文件写法需 `http-server` 等静态服务。
   - `07-geolocation`：浏览器要求 `https` 或 `localhost`，示例提供 Mock 模式演示。
   - `09-multimedia`：本地音视频文件建议通过 `localhost` 访问以避免自动播放策略限制。
   - `13-speculation-rules`：prerender/prefetch 需 `http://localhost` 或 `https`，file:// 双击不生效。

## 编写规范

- 文档固定七节结构：概念解释 / 语法说明 / 浏览器兼容性 / 使用场景示例 / 实际应用案例分析 / 最佳实践与常见坑 / 参考资料。
- 示例代码全部内联于单文件 HTML，附详细中文注释；文件头注明知识点、运行方式与效果说明。
- 兼容性数据基于 [caniuse](https://caniuse.com/) 的大致基线，关键差异在文档中单独标注。

## 版本记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.15.0 | 2026-09-28 | CSS/HTML 篇扩展：新增 @layer 进阶（28）与 Service Worker 缓存策略（17）两章，配套漫画 EP.45–46，全 46 话 |
| v1.14.0 | 2026-09-28 | CSS/HTML 篇扩展：新增 text-wrap 与 field-sizing（27）与 Web Components 入门（16）两章，配套漫画 EP.43–44，全 44 话 |
| v1.13.0 | 2026-09-28 | CSS/HTML 篇扩展：新增 @container 进阶（26）与 Web Locks API（15）两章，配套漫画 EP.41–42，全 42 话；新增漫画全文阅读器 reader.html |
| v1.12.0 | 2026-09-28 | CSS/HTML 篇扩展：新增 color-mix 与 light-dark（25）与 details 进阶（14）两章，配套漫画 EP.39–40，全 40 话 |
| v1.11.0 | 2026-09-28 | CSS/HTML 篇扩展：新增 View Transitions 进阶（24）与 Speculation Rules（13）两章，配套漫画 EP.37–38，全 38 话 |
| v1.10.0 | 2026-09-28 | CSS/HTML 篇扩展：新增滚动吸附（23）与 dialog 元素（12）两章，配套漫画 EP.35–36，全 36 话 |
| v1.9.0 | 2026-09-28 | CSS/HTML 篇扩展：新增 @starting-style 入场动画（22）与 Observer 三件套（11）两章，配套漫画 EP.33–34，全 34 话 |
| v1.8.0 | 2026-09-28 | CSS/HTML 篇扩展：新增锚点定位（21）与 Popover（10）两章，配套漫画 EP.31–32，全 32 话 |
| v1.7.0 | 2026-09-28 | CSS 篇扩展：新增 @scope 作用域（19）与 @property 注册（20）两章，配套漫画 EP.29–30，全 30 话 |
| v1.6.0 | 2026-09-28 | CSS 篇扩展：新增 View Transitions（17）与 CSS 嵌套（18）两章，配套漫画 EP.27–28，全 28 话 |
| v1.5.0 | 2026-09-28 | CSS 篇扩展：新增滚动驱动动画（15）与 :has() 选择器（16）两章，配套漫画 EP.25–26，全 26 话 |
| v1.4.0 | 2026-09-27 | CSS 篇扩展：新增现代颜色（14）一章，配套漫画 EP.24，全 24 话 |
| v1.3.0 | 2026-09-27 | CSS 篇扩展：新增容器查询（12）与层叠层（13）两章，配套漫画 EP.22–23，全 23 话 |
| v1.2.0 | 2026-09-27 | 「霓虹墨」漫画剧场全 21 话量产完成：CSS 篇 EP.01–11 + HTML 篇 EP.12–21，每话含 SVG 原画与讲解 MD，附话数清单与质量校验器 |
| v1.1.0 | 2026-09-27 | 新增「霓虹墨」漫画风格规范 + 三张定妆稿（样板页/角色表/配色构图）与 Spark Web 设计系统，漫画剧场量产启动 |
| v1.0.0 | 2026-09-23 | 全部 18 个主题完成：CSS3 九大主题 + HTML5 九大主题，18 篇深度文档 + 61 个可运行示例 + 速查表 |
| v0.1.0 | 2026-09-23 | 项目骨架：目录结构、导航文档、git 初始化 |
