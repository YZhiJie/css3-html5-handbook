# 渐变背景（linear-gradient / radial-gradient / conic-gradient）

> 面向前端开发人员的 CSS3 高级特性参考资料 —— 渐变不是"背景图"，而是一种**由浏览器实时计算的 `<image>` 类型**：它可以出现在任何接受图片的地方（background、border-image、mask、list-style-image），配合 hard-stop 可以画出条纹、饼图、格纹——本质上是一门"参数化矢量绘图语言"。

## 目录

- [1. 概念解释 —— 是什么、解决什么问题、底层原理](#1-概念解释)
- [2. 语法说明 —— 完整语法、属性/参数表、代码片段](#2-语法说明)
- [3. 浏览器兼容性](#3-浏览器兼容性)
- [4. 使用场景示例](#4-使用场景示例)
- [5. 实际应用案例分析](#5-实际应用案例分析)
- [6. 最佳实践与常见坑](#6-最佳实践与常见坑)
- [7. 参考资料](#7-参考资料)

配套可运行示例（单文件 HTML，双击即开）：

| 示例文件 | 演示内容 |
| --- | --- |
| [index-01-linear-radial.html](../../examples/css/08-gradients/index-01-linear-radial.html) | linear / radial 实验台：角度、色标、hard-stop 条纹、径向形状与位置 |
| [index-02-conic-repeating.html](../../examples/css/08-gradients/index-02-conic-repeating.html) | conic 色轮/饼图/角度盘 + repeating-* 条纹、格纹、网格纸 |
| [index-03-gradient-text-border.html](../../examples/css/08-gradients/index-03-gradient-text-border.html) | 渐变文字、渐变边框（两种方案）、渐变 + 动画组合 |

---

## 1. 概念解释

### 1.1 渐变是什么

CSS 渐变是 `background-image` 合法取值之一，属于 **`<image>` 数据类型**——与 `url(...)` 平级。这意味着凡是能放图片的属性都能放渐变：`background-image`、`border-image`、`mask-image`、`-webkit-background-clip: text` 的底图、甚至 `list-style-image`。三种基础渐变：

- **`linear-gradient()`**：颜色沿一条**渐变轴线**线性插值，垂直于轴的每条线都是同一颜色（等色线）。
- **`radial-gradient()`**：颜色从**中心点**向外沿半径插值，等色线是椭圆/圆。
- **`conic-gradient()`**：颜色绕**中心点**旋转插值，等色线是射线（角度），是色轮、饼图、角度盘的原料。

三者都支持 `repeating-*` 变体：色标序列在超出终点后被**周期性平铺**，一条语句画出条纹、同心圆、射线格。

### 1.2 解决什么问题

- **零图片的装饰**：条纹、网格纸、格纹、徽章底纹，过去要切图，现在一行 CSS，且**随容器缩放不失真、可随主题变量变色**。
- **数据可视化**：`conic-gradient` 用一个属性画出饼图/环形进度，不需要 SVG/Canvas；配合 CSS 变量可被 JS 实时驱动。
- **高级文字与边框**：`background-clip: text` 让文字填充渐变；双层背景法/border-image 让边框渐变——都是图片做不到的"按需重算"。
- **氛围与层次**：营销页大背景的"环境光"、玻璃拟态的高光、暗色模式下的深色渐层，全是渐变的舞台。

### 1.3 底层原理

1. **渐变在绘制阶段光栅化**：浏览器根据盒子尺寸把渐变参数渲染成像素。它**没有固有尺寸**，作为背景时默认铺满 `background positioning area`——这就是"渐变天然自适应"的原因；也正因如此，**尺寸变化时会重新光栅化**，给大面积渐变做动画（改角度/位置）是 paint 密集操作。
2. **色标（color stop）插值模型**：渐变线上每个位置的颜色由相邻色标线性插值；**hard-stop**（两个色标位置相同，如 `red 50%, blue 50%`）让插值区间长度为 0，形成锐利分界——条纹、饼图的全部秘密。
3. **渐变盒与默认方向**：`linear-gradient` 的默认轴线是"从上到下"；指定角度时 `0deg` 指向上、**顺时针**增大（`90deg` 指向右）。关键词方向（`to right`）在非正方形盒子里会**调整轴线过中心**以到达对边中点，与 `45deg` 并不等价（常见误区）。
4. **`background-clip: text` 的机制**：把背景绘制区域裁剪成**文字字形**。必须配合 `-webkit-text-fill-color: transparent`（或 `color: transparent`）让文字本身透出底下的背景。这一特性长期以 `-webkit-` 前缀形态存在，2023 年起各浏览器才支持无前缀标准写法。
5. **渐变动画的两条正路**：`background-image` 不可过渡（image 是离散值），所以动画渐变要么动 `background-position`（把渐变画得比容器大，如 200%），要么用 `@property` 把"角度/百分比"注册为**可插值的自定义属性**再写进 keyframes（现代浏览器）。
6. **`repeating` 的数学**：把色标序列沿渐变线以"最后一个色标位置"为周期镜像平铺。因此**最后一个色标位置就是条纹周期**，`repeating-linear-gradient(#000 0 10px, #fff 10px 20px)` 即 20px 周期的黑白条纹。

---

## 2. 语法说明

### 2.1 linear-gradient

```css
/* 完整形态：<方向> 后跟 >=2 个 <色标> */
background-image: linear-gradient(<方向>, <色标1>, <色标2>, …);

/* 色标 = 颜色 [位置]；位置可省略（自动均分），可双位置简写 */
linear-gradient(90deg, #ff9a9e 0%, #fecfef 50%, #f6d365 100%);
linear-gradient(to right, red 0 30%, blue 30% 100%); /* 双位置：0~30% 全红 */
```

| 方向写法 | 含义 | 备注 |
| --- | --- | --- |
| 省略 | `to bottom` | 默认从上到下 |
| `to top / right / bottom / left` | 到对边 | 轴线过中心 |
| `to top right` | 到对角 | **轴先转 45° 再平移使角点落在轴上**，色带比 `45deg` 略宽 |
| `<angle>` | 0deg=向上，顺时针 | `90deg`=向右，`180deg`=向下 |

### 2.2 radial-gradient

```css
/* <形状> <尺寸> at <位置>，可全省略（默认 ellipse farthest-corner at center） */
background-image: radial-gradient(<形状>? <尺寸>? at <位置>?, <色标>…);

radial-gradient(circle 80px at 30% 30%, #fff 0%, transparent 70%); /* 高光 */
radial-gradient(ellipse at center, #1e3c72, #2a5298);
```

| 形状 | 说明 |
| --- | --- |
| `ellipse`（默认） | 匹配盒子宽高比 |
| `circle` | 正圆 |

| 尺寸关键字 | 半径延伸到 |
| --- | --- |
| `farthest-corner`（默认） | 离中心最远的角 |
| `farthest-side` | 离中心最远的边 |
| `closest-corner` / `closest-side` | 最近的角 / 边（做局部光斑常用） |

### 2.3 conic-gradient

```css
/* from <起始角> at <中心>，色标按角度插值 */
background-image: conic-gradient(from 0deg at 50% 50%, <色标>…);

conic-gradient(red 0 90deg, yellow 90deg 180deg, green 180deg 270deg, blue 270deg); /* 四等分饼图 */
conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000); /* 色轮 */
```

### 2.4 repeating 系列（条纹 / 格纹 / 网格纸）

```css
/* 条纹：周期 20px（最后一个色标的位置即周期） */
background: repeating-linear-gradient(45deg,
  #4361ee 0 12px, #fff 12px 24px);

/* 同心圆环（径向）与射线盘（锥形） */
background: repeating-radial-gradient(circle at 50% 50%, #fff 0 10px, #eee 10px 20px);
background: repeating-conic-gradient(from 0deg, #eee 0 15deg, #fff 15deg 30deg);

/* 网格纸：两层正交条纹叠加（第一层在上） */
background:
  repeating-linear-gradient(#e5ebf5 0 1px, transparent 1px 24px),
  repeating-linear-gradient(90deg, #e5ebf5 0 1px, transparent 1px 24px),
  #fff;
```

### 2.5 渐变文字 / 渐变边框

```css
/* 渐变文字：底图裁剪到字形 + 文字填充色透明 */
.grad-text {
  background-image: linear-gradient(90deg, #f72585, #4361ee);
  -webkit-background-clip: text;       /* 老写法仍是兼容性最好的（Safari 仅认前缀） */
  background-clip: text;               /* 标准写法，Chrome 120+/FF 49+ */
  -webkit-text-fill-color: transparent;/* 让字形透出底图；老 Safari 只认带前缀的这个 */
  color: transparent;                  /* 兜底 */
}

/* 渐变边框方案 A：双层背景法（推荐，圆角友好） */
.grad-border {
  border: 2px solid transparent;
  border-radius: 12px;
  background:
    linear-gradient(#fff, #fff) padding-box,  /* 内层：内容区背景（实色） */
    linear-gradient(135deg, #f72585, #4361ee) border-box; /* 外层：边框区渐变 */
}

/* 渐变边框方案 B：border-image（注意不支持 border-radius） */
.grad-border-bi {
  border: 4px solid;
  border-image: linear-gradient(135deg, #f72585, #4361ee) 1;
}
```

---

## 3. 浏览器兼容性

> 以下为大致基线（依据 caniuse 数据整理，仅作选型参考，上线前请以实际目标用户环境为准）。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| `linear-gradient` / `radial-gradient` | 26（无前缀） | 12 | 16 | 6.1 | 主流移动内核全部可用 | 2013 年前的老内核需 `-webkit-` 且语法为旧式（`left, red, blue`） |
| `repeating-linear/radial-gradient` | 26 | 12 | 16 | 6.1 | 同上 | 周期取"最后一个色标位置"，色标写成百分比在 repeating 中要格外小心 |
| `conic-gradient` | 69 | 79 | 83 | 12.1 | iOS 12.4+/Android Chrome 69+ 可用 | 相对年轻：老国产内核（X5 旧版）不支持，饼图类关键功能需降级方案 |
| `repeating-conic-gradient` | 69 | 79 | 83 | 12.1 | 同上 | 同上 |
| `background-clip: text` | 120（无前缀） | 120 | 49 | 14（`-webkit-` 可用至更早） | 移动端普遍支持前缀写法 | **生产建议"前缀+标准"双写**；text-fill-color 也要带前缀写 |
| `border-image` 渐变 | 16 | 12 | 15 | 6 | 可用 | **不支持 border-radius**——圆角卡片请用双层背景法 |
| `@property`（渐变动画用） | 85 | 85 | 128 | 16.4 | 较新的 WebView 可用 | Firefox 128 才支持；不支持时 keyframes 里该变量不插值（表现为跳变），需可接受的降级 |

---

## 4. 使用场景示例

### 4.1 场景一：按钮与徽章的渐变底色（带 hover 位移）

**场景描述**：营销页主按钮，渐变底 + 悬停时渐变"流动"，不重绘图片、不换图。

```css
.btn-grad {
  padding: 12px 32px; border: 0; border-radius: 999px; color: #fff;
  cursor: pointer;
  /* 渐变宽度做成 200%：静止时只露出左半段，为位移动画留出"跑道" */
  background-image: linear-gradient(90deg, #f72585, #7209b7, #4361ee, #4cc9f0);
  background-size: 200% 100%;
  background-position: 0% 50%;
  transition: background-position .6s ease;   /* background-position 可插值 */
}
.btn-grad:hover { background-position: 100% 50%; }
```

**逐段注释**：`background-image` 本身不可过渡，但 `background-position` 是长度值可以插值——把渐变拉宽到 200%，悬停把窗口从左端滑到右端，观感是"渐变在流动"，实际只是背景在平移。

**预期效果**：悬停时颜色从粉紫流向蓝青，600ms 完成，移开平滑回位。

### 4.2 场景二：hard-stop 条纹——进度条底纹与警示带

**场景描述**：施工警示斜纹、表单禁用条纹、加载中的"斑马线"，全部一行渐变。

```css
.hazard {
  height: 14px; border-radius: 7px;
  /* 双位置色标：#f94144 占 0~12px，#fff 占 12~24px；45° 斜纹，周期 24px */
  background: repeating-linear-gradient(45deg,
    #f94144 0 12px, #fff 12px 24px);
}
.zebra {
  /* 透明+浅灰交替：覆盖在白色底上就是禁用/加载纹理 */
  background: repeating-linear-gradient(-45deg,
    transparent 0 8px, rgba(0,0,0,.06) 8px 16px);
}
```

**预期效果**：锐利无模糊的斜条纹；改角度即改纹理方向，改两个长度即改条纹粗细与周期。

### 4.3 场景三：conic 饼图与环形进度（纯 CSS 数据可视化）

**场景描述**：预算占比饼图、上传进度环，用 CSS 变量驱动角度，JS 只改一个数。

```html
<div class="pie" style="--p: 72"></div>
<style>
  .pie {
    width: 140px; aspect-ratio: 1; border-radius: 50%;
    /* 角度 = 变量 × 3.6deg：JS 只需提供 0~100 的数字，CSS 负责换算 */
    background: conic-gradient(#4361ee 0 calc(var(--p) * 3.6deg), #e9edf5 0);
    /* "接力写法"：第二个色标起点写 0，实际被钳制到前一段终点，
       于是第一色画 0→p%，第二色自动画 p%→100%（360deg） */
    display: grid; place-items: center;
  }
  .pie::after {           /* 中心挖洞 → 环形进度（donut） */
    content: ""; width: 60%; aspect-ratio: 1; border-radius: 50%;
    background: #fff;      /* 遮住中心即成环 */
  }
</style>
```

**逐段注释**：`conic-gradient(#4361ee 0 calc(var(--p)*3.6deg), #e9edf5 0)` 是经典"接力"技巧——第二个色标起始位置写 0 但实际被钳制到前一段终点，于是第一色画 0→p%、第二色画 p%→100%。中心用伪元素盖圆变成环。JS 只需 `el.style.setProperty('--p', 72)`。

**预期效果**：一个 72% 的环形进度条；改 `--p` 即改占比，无需重绘任何图像。

### 4.4 场景四：网格纸与点阵背景（编辑器/图表底纹）

**场景描述**：中后台画布、白板应用的网格底，两层正交条纹叠加。

```css
.grid-paper {
  background:
    /* 横线：1px 线 + 23px 透明，构成 24px 周期 */
    repeating-linear-gradient(#dbe4f3 0 1px, transparent 1px 24px),
    /* 竖线：90deg 同参数 */
    repeating-linear-gradient(90deg, #dbe4f3 0 1px, transparent 1px 24px),
    #fdfefe;
}
.dot-grid {
  /* 点阵：radial-gradient 画一个 2px 圆点，background-size 平铺 */
  background: radial-gradient(circle, #c7d2e8 1.5px, transparent 1.6px) 0 0 / 22px 22px;
}
```

**预期效果**：细网格纸与蓝点阵；`background-size` 即平铺周期，主题换色只需改变量。

### 4.5 场景五：渐变文字大标题

```css
.hero-title {
  font-size: clamp(2rem, 6vw, 4rem); font-weight: 800;
  background-image: linear-gradient(120deg, #f72585 10%, #7209b7 45%, #4361ee 90%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
}
```

**预期效果**：标题文字内部呈渐变；注意提供 `color` 兜底，在极老浏览器中文字至少可见（会退化为 `color: transparent` 时不可见，故兜底应写在支持查询里，见坑 6.4）。

---

## 5. 实际应用案例分析

### 案例一：电商大促会场"氛围渐变"体系（营销页）

**需求**：会场页需要大面积渐变氛围背景 + 多个模块色带，设计稿每月换主题色，要求不改图片、不发新切图。

**方案选型**：主题色抽成 CSS 变量（`--grad-a/--grad-b/--grad-c`），所有渐变引用变量；页面顶部氛围用 `radial-gradient` 多层叠加（两三层"光斑"营造空间感），模块分隔用 `linear-gradient` 的透明→色→透明"柔光带"。切主题 = 换一组变量值。

**踩坑记录**：

1. **大面积渐变动画掉电**：氛围层最初对 `background-position` 做 infinite 动画，低端安卓上 paint 占比过高。解法：把动画光斑**拆成独立的绝对定位伪元素**（尺寸有限），只动 `transform: translate()` 走合成器，母体渐变静止。
2. **文字压渐变可读性差**：浅色渐变上白字对比度不足 3:1。解法：在渐变上再叠一层"局部压暗"渐变（`linear-gradient(rgba(0,0,0,.35), transparent)`）保证文字区亮度可控，并用对比度工具校验。
3. **老 WebView 的 conic 饼图空白**：某入口页在 X5 老内核下饼图区域整块空白。解法：饼图组件增加 `@supports (background: conic-gradient(red, blue))` 检测，不支持时回退为 SVG 弧形（`stroke-dasharray`），逻辑同源（同一个 `--p` 变量）。

### 案例二：中后台低代码画布的网格与选区（B 端）

**需求**：画布需要网格纸底纹、选框"蚂蚁线"动画、字段块渐变描边高亮。

**方案选型**：网格纸用 4.4 的双层 repeating 方案（缩放画布时只需改 `background-size`）；"蚂蚁线"用 `border: 1px dashed` + 动画 `background-position` 的条纹实现（dash 周期移动）；字段块高亮用双层背景法渐变描边，选中态切换 `--grad-a/--grad-b` 变量。

**踩坑记录**：

1. **网格与内容对齐**：画布平移是 `transform`，但底纹是背景不会跟着动，出现"网格错位感"。解法：把网格层做成画布容器的伪元素并与内容同 transform，或接受"网格即视口坐标系"的产品约定（Figma 式）。
2. **蚂蚁线性能**：对整页网格做 position 动画每帧重绘全画布。解法：蚂蚁线只用于**选框**（小尺寸），并限制动画区域（`will-change: background-position` 的收益有限，最终改为每帧位移 `transform` 的条纹内层元素）。
3. **打印/截图丢失渐变**：导出 PDF 时部分内核丢弃 repeating 渐变。解法：导出管线走 DOM → Canvas 截图（渐变先被光栅化），避免依赖打印样式。

---

## 6. 最佳实践与常见坑

1. **`background-image` 不可过渡**：渐变切换是瞬时跳变。要"颜色流动"用 `background-position` + 超宽渐变，或 `@property` 注册角度变量后动画该变量；都不行就叠两层渐变用 `opacity` 交叉淡化。
2. **`to right` ≠ `90deg`？** 在正方形里等价；在长方形里 `to right` 的轴线被调整过以到达对边中点，色带更宽。语义化方向用关键词、精确控制用角度，不要混着"微调"。
3. **repeating 的周期 = 最后一个色标位置**：写成 `repeating-linear-gradient(red 0 10px, blue 20px)` 周期是 20px；若把最后一个写成 `100%`，周期就变成整条渐变线——条纹瞬间"消失"成单色。
4. **渐变文字必须三件套**：`background-clip: text` + `text-fill-color: transparent` + 前缀双写；并且用 `@supports` 包裹 `color: transparent`，否则老浏览器上文字直接"消失"（比降级成纯色更糟）。
5. **渐变边框首选双层背景法**：`border-image` 不认 `border-radius`，圆角卡片会被切成直角；双层背景法（padding-box 实色 + border-box 渐变）圆角完美，唯一注意 `border` 要 `transparent` 且先声明。
6. **别给大面积渐变做动画**：渐变在 paint 阶段光栅化，改角度/尺寸/位置每帧重绘。要动效就把它拆成小尺寸独立层动 `transform`，母层保持静止。
7. **hard-stop 消除条纹模糊边**：两色交界出现 1px 灰带（抗锯齿插值）时，把后一色标起点往前写一点点（`blue 50%, red calc(50% + .5px)`）或直接用双位置色标。
8. **变量化主题色**：渐变里的颜色抽成 CSS 变量再组合，一处换肤全站生效；同时方便暗色模式用同一批变量重新赋值。
9. **饼图/进度环的降级**：`conic-gradient` 在老内核缺失，用 `@supports` 回退 SVG `stroke-dasharray` 方案，数据源保持同一个变量。
10. **多层渐变的书写顺序**：`background` 简写里**先写的层在视觉上层**；叠加网格纸时"横线层写前面、竖线层写后面"只是为了交叉点颜色一致，语义上先写你想显眼的层。
11. **性能测量**：DevTools → Performance 看 paint 条；大面积渐变 + 高频动画的页面，重点排查 `background-position/size` 的逐帧变更。

---

## 7. 参考资料

- MDN — `linear-gradient()`：https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/linear-gradient
- MDN — `radial-gradient()`：https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/radial-gradient
- MDN — `conic-gradient()`：https://developer.mozilla.org/zh-CN/docs/Web/CSS/gradient/conic-gradient
- MDN — 使用 CSS 渐变（教程）：https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_images/Using_CSS_gradients
- MDN — `background-clip`：https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-clip
- MDN — `@property`：https://developer.mozilla.org/zh-CN/docs/Web/CSS/@property
- CSS 规范 — CSS Images Module Level 3（渐变定义）：https://drafts.csswg.org/css-images-3/#gradients
- CSS-Tricks — A Complete Guide to CSS Gradients：https://css-tricks.com/gradients/
- caniuse — CSS Conic Gradients：https://caniuse.com/css-conic-gradients
- caniuse — background-clip: text：https://caniuse.com/background-clip-text
