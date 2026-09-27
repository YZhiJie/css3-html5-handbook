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
│   ├── css/                # CSS3 十三大主题
│   └── html/               # HTML5 十大主题
├── examples/               # 可运行示例（与文档一一对应）
│   ├── css/
│   └── html/
└── comics/                 # 漫画剧场（「霓虹墨」风格，全 26 话）
    ├── style-guide.md      # 漫画美术风格规范
    ├── manifest.json       # 话数清单（校验器依据）
    ├── check-comics.mjs    # SVG 良构 / MD 行数 / 链接一致性校验
    ├── samples/            # 三张风格定妆稿（SVG，不参与编号）
    ├── css/                # CSS 篇 EP.01–11、EP.22–26（SVG + 讲解 MD）
    └── html/               # HTML 篇 EP.12–21（SVG + 讲解 MD）
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

## 如何使用

1. **阅读文档**：从上方导航表进入任意主题文档，按「概念 → 语法 → 兼容性 → 场景 → 案例 → 最佳实践」的顺序学习。
2. **运行示例**：进入对应 `examples/` 目录，双击任意 `index-*.html` 即可在浏览器中查看效果。
3. **需要本地服务器的特例**（均在示例文件头部注明）：
   - `06-web-workers`：已采用 Blob 内联 Worker，双击即可运行；多文件写法需 `http-server` 等静态服务。
   - `07-geolocation`：浏览器要求 `https` 或 `localhost`，示例提供 Mock 模式演示。
   - `09-multimedia`：本地音视频文件建议通过 `localhost` 访问以避免自动播放策略限制。

## 编写规范

- 文档固定七节结构：概念解释 / 语法说明 / 浏览器兼容性 / 使用场景示例 / 实际应用案例分析 / 最佳实践与常见坑 / 参考资料。
- 示例代码全部内联于单文件 HTML，附详细中文注释；文件头注明知识点、运行方式与效果说明。
- 兼容性数据基于 [caniuse](https://caniuse.com/) 的大致基线，关键差异在文档中单独标注。

## 版本记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.5.0 | 2026-09-28 | CSS 篇扩展：新增滚动驱动动画（15）与 :has() 选择器（16）两章，配套漫画 EP.25–26，全 26 话 |
| v1.4.0 | 2026-09-27 | CSS 篇扩展：新增现代颜色（14）一章，配套漫画 EP.24，全 24 话 |
| v1.3.0 | 2026-09-27 | CSS 篇扩展：新增容器查询（12）与层叠层（13）两章，配套漫画 EP.22–23，全 23 话 |
| v1.2.0 | 2026-09-27 | 「霓虹墨」漫画剧场全 21 话量产完成：CSS 篇 EP.01–11 + HTML 篇 EP.12–21，每话含 SVG 原画与讲解 MD，附话数清单与质量校验器 |
| v1.1.0 | 2026-09-27 | 新增「霓虹墨」漫画风格规范 + 三张定妆稿（样板页/角色表/配色构图）与 Spark Web 设计系统，漫画剧场量产启动 |
| v1.0.0 | 2026-09-23 | 全部 18 个主题完成：CSS3 九大主题 + HTML5 九大主题，18 篇深度文档 + 61 个可运行示例 + 速查表 |
| v0.1.0 | 2026-09-23 | 项目骨架：目录结构、导航文档、git 初始化 |
