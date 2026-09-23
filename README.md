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
├── docs/                   # 深度文档（每主题一篇）
│   ├── css/                # CSS3 九大主题
│   └── html/               # HTML5 九大主题
└── examples/               # 可运行示例（与文档一一对应）
    ├── css/
    └── html/
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
| v0.1.0 | 2026-09-23 | 项目骨架：目录结构、导航文档、git 初始化 |
