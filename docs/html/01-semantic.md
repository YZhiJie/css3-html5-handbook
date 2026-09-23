# 语义化标签（Semantic HTML）

> 面向前端开发人员的 HTML5 高级特性参考资料 —— 语义化标签让 HTML 从"一堆 div"变成"机器可读的文档结构"，是 SEO、无障碍与可维护性的共同地基。

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
| [index-01-landmark-structure.html](../../examples/html/01-semantic/index-01-landmark-structure.html) | 文档结构标签 + 地标导航可视化 + div 滥用反模式对比 |
| [index-02-inline-semantic.html](../../examples/html/01-semantic/index-02-inline-semantic.html) | details/summary 手风琴、time、figure、mark、strong/em/b/i 语义对比 |
| [index-03-outline-analyzer.html](../../examples/html/01-semantic/index-03-outline-analyzer.html) | 标题大纲分析器：实时扫描 DOM 输出语义体检报告 |

---

## 1. 概念解释

### 1.1 语义化标签是什么

语义化标签（Semantic Elements）是指**标签名本身就描述了内容的含义与角色**的元素：`<header>` 表示"页头/导语"、`<nav>` 表示"导航区"、`<article>` 表示"独立成篇的内容"。与之相对，`<div>` 与 `<span>` 是**无语义的通用容器**——它们只负责布局与样式钩子，对机器而言不携带任何"这是什么"的信息。

在 HTML5 之前，页面结构几乎全靠 `<div class="header">`、`<div class="nav">` 这类"class 命名约定"表达。问题在于：class 只有作者自己看得懂，浏览器、搜索引擎爬虫、屏幕阅读器全都无法理解。HTML5 引入一批结构标签，把这种"私人文档"升级为"公共协议"。

### 1.2 解决什么问题

- **机器可读**：搜索引擎能识别页面主体内容（`<main>`/`<article>`），而不是把导航、页脚等噪音也当作正文抓取，利于 SEO 与摘要生成。
- **无障碍导航**：屏幕阅读器把 `header/nav/main/aside/footer` 映射为**地标（Landmark）**，视障用户可以用快捷键在地标间跳转，而无需逐行听完整页内容。`<main>` 还提供了"跳到主内容"的原生锚点。
- **可维护性**：`<article>` 里再嵌 `<section>`，半年后回看代码，结构一目了然；统一的标签约定也让团队协作、自动化测试（如按 `role` 定位元素）更稳定。
- **减少 class 噪音**：结构由标签承载后，class 可以专注于真正的样式语义（如 `.card`、`.highlight`），而不是兼职当结构说明。
- **原生交互能力**：`<details>/<summary>` 不写一行 JS 就能实现手风琴；`<time datetime>` 让日期成为机器可解析的数据。

### 1.3 底层原理

**语义 = 默认无障碍语义映射**。每个 HTML 元素在无障碍树（Accessibility Tree）中都有一个隐式的 ARIA 角色，例如：

| 元素 | 隐式 ARIA 角色 |
| --- | --- |
| `<header>`（不属于 `<article>`/`<aside>`/`<nav>`/`<section>` 祖先时） | `banner` |
| `<nav>` | `navigation` |
| `<main>` | `main` |
| `<aside>` | `complementary` |
| `<footer>`（同 header 的限制条件） | `contentinfo` |
| `<article>` | `article` |
| `<section>`（带可访问名称时） | `region` |
| `<figure>` | `figure` |
| `<time>` | `time` |
| `<details>` | 与内部开关状态相关的Disclosure 结构 |

理解这张映射表非常关键：**用语义标签 ≈ 免费获得 role**；反过来，给一个 `<div role="navigation">` 补 role 是"事后补救"，而直接写 `<nav>` 是"一次到位"。优先用原生标签，是因为原生标签除了 role 还附带键盘行为（`<details>` 的展开收起、`<summary>` 的 Enter/Space 激活），手写 `div + role + tabindex + keydown` 很容易漏掉某一环。

**文档大纲算法（Outline Algorithm）的现状**：HTML4 时代，文档层级只由 `h1~h6` 决定。HTML5 曾设计过一套"分段内容"大纲算法——`<article>/<section>/<aside>/<nav>` 各自开一个新的大纲段，段内 `h1` 相当于重置层级，理论支持"每个 section 都从 h1 开始"的写法。但该算法**从未被任何主流浏览器或辅助技术完整实现**：屏幕阅读器实际读到的标题层级始终等于字面的 `h1~h6` 级别。因此 HTML 与 ARIA 规范已在后续版本将其标记为**废弃（W3C HTML 推荐标准中已移除）**。现实结论是：**不要依赖"section 降级标题"的想象，老老实实用 h1→h2→h3 逐级递进、不跳级**；`<section>` 应通过内部标题配合 ARIA `role="region"` 获得可访问名称，而不是指望大纲算法。

**浏览器的兼容策略**：HTML5 早期，IE8 及以下不认识新标签，无法设置样式，需要 `document.createElement('header')` 这类"shiv"补丁；现代浏览器（IE10 时代起全部主流内核）原生支持所有语义标签，无需任何 polyfill。

---

## 2. 语法说明

### 2.1 文档结构标签

| 标签 | 语义 / 用途 | 使用限制与注意 |
| --- | --- | --- |
| `<header>` | 介绍性内容：标题、logo、搜索框、导航组 | 页面级 header（body 直接子级）→ `banner` 地标；嵌在 article/section 内则是普通分组容器，**不会**成为地标 |
| `<nav>` | 主要导航链接块 | 页面中可出现多个（主导航、面包屑、分页）；不重要的链接堆（如页脚备案链接）**不必**包 nav |
| `<main>` | 页面唯一的主内容区 | **每页最多一个**（若用隐藏的 `hidden` 则可有多个备用）；直接子级置于 body，不能放在 article/aside/nav/header/footer 内 |
| `<article>` | 独立成篇、脱离上下文仍完整的内容：文章、评论、商品卡片、帖子弹窗 | 可嵌套（文章内含评论 article） |
| `<section>` | 主题分组，通常带一个标题 | 判断标准：**这个分组需要出现在目录（outline）里吗？** 需要就用 section，不需要就用 div；纯样式分组禁止用 section |
| `<aside>` | 与主内容弱相关的内容：侧栏、广告、术语注释、相关推荐 | 页面级 aside → `complementary` 地标 |
| `<footer>` | 页脚：版权、备案、联系方式、相关文档 | 与 header 一样有"是否成为 contentinfo 地标"的嵌套限制 |

**合法嵌套关系速查**（常被忽略的规则）：

- `<main>` 不能是 `<article>/<aside>/<footer>/<header>/<nav>` 的后代；
- `<header>/<footer>` 不要嵌在另一个 `<header>/<footer>` 内部（HTML 校验规则），也不要放进 `<address>`；
- `<address>` 只用于"联系人信息"，不能包文章正文；
- `<a>` 与 `<button>` 内不能出现交互元素，但 `<article>` 可以整体被 `<a>` 包裹（HTML5 允许块级链接）。

```html
<!-- 一个语义完整的页面骨架：每个区块的"角色"由标签自解释 -->
<body>
  <header>              <!-- 页面级 header → banner 地标 -->
    <h1>站点名称</h1>
    <nav aria-label="主导航"><!-- aria-label 区分多个 nav，屏幕阅读器会读出 -->
      <a href="/">首页</a>
    </nav>
  </header>

  <main>                <!-- 唯一主内容区，跳转链接的目标 -->
    <article>           <!-- 一篇独立内容 -->
      <header><h2>文章标题</h2></header>   <!-- article 内的 header 不再是 banner -->
      <section aria-labelledby="sec-1">
        <h3 id="sec-1">章节名</h3>          <!-- 注意：字面层级 h2→h3，不依赖大纲算法 -->
        <p>正文……</p>
      </section>
      <section>             <!-- 相关文章：与正文弱相关，也可以用 aside -->
        <h3>相关阅读</h3>
      </section>
      <footer>发布时间、作者</footer>
    </article>
    <aside>侧栏：目录 / 广告 / 推荐</aside>
  </main>

  <footer>              <!-- 页面级 footer → contentinfo 地标 -->
    <address>联系邮箱：<a href="mailto:hi@example.com">hi@example.com</a></address>
    <p><small>© 2026 Example Inc.</small></p>
  </footer>
</body>
```

### 2.2 内容分组与行内语义标签

| 标签 | 语义 / 用途 | 典型示例 |
| --- | --- | --- |
| `<figure>` / `<figcaption>` | 自包含的"图/代码/图表/引文"单元及其说明；figcaption 必须是 figure 的**第一个或最后一个**子元素 | 截图 + 说明文字；代码块 + 标题 |
| `<time>` | 机器可读的日期时间；`datetime` 属性写入标准格式 | `<time datetime="2026-09-23T10:00+08:00">今天上午 10 点</time>` |
| `<details>` / `<summary>` | 原生展开收起组件；`open` 属性控制状态，`toggle` 事件监听变化；`name` 属性（同名互斥）实现排他手风琴 | FAQ 列表、折叠面板 |
| `<address>` | 当前文档/文章相关的**联系人**信息 | 文章作者联系方式、页脚客服信息 |
| `<mark>` | 与当前用户**当前关注点**相关的高亮 | 搜索关键词命中高亮 |
| `<strong>` | **重要性强调**，严重程度递增；屏幕阅读器可能加重重音 | 警告语："**请勿**刷新页面" |
| `<em>` | **语气重读**（stress emphasis），重音落在被标词上 | "我不是'说'过吗" vs "我不是说过'吗'" |
| `<b>` | 无额外重要性的**实用性提醒**（关键词、产品名、导语加粗），不改变语气 | 摘要里的关键词 |
| `<i>` | 科技术语、外文短语、思想/船名等**替代语气或分类性文本** | *E. coli*（拉丁学名）、法语词 * déjà vu * |
| `<small>` | 附属细则：版权、免责声明 | 页脚 `<small>© …</small>` |
| `<s>` / `<del>` / `<ins>` | 不再准确的内容 / 编辑性删除 / 编辑性插入 | 价格划线用 `<s>`，修订记录用 `<del><ins>` |

```html
<!-- time：人读的是"昨天 20:30"，机器读的是带时区的标准时间 -->
<p>发布于 <time datetime="2026-09-22T20:30:00+08:00">昨天 20:30</time></p>

<!-- figure：图与说明绑定成一个可整体引用/搬移的单元 -->
<figure>
  <img src="chart.svg" alt="2026 年 Q3 销售趋势：环比增长 18%">
  <figcaption>图 1 · Q3 销售趋势（数据来源：内部报表）</figcaption>
</figure>

<!-- 三种"加粗/斜体"的语义分野：视觉相近，含义完全不同 -->
<p>
  <strong>注意：</strong>提交后不可撤销。          <!-- 重要性：真的重要 -->
  这次发布是<em>灰度</em>放量。                    <!-- 语气重读：重音在"灰度" -->
  我们将启用 <b>Kraken</b> 排队引擎。              <!-- 无重要性，仅关键词加粗 -->
  内部代号 <i>Kraken</i> 源自北欧神话。            <!-- 分类性/术语：斜体而非强调 -->
</p>
```

### 2.3 与 ARIA 的关系

规则优先级可记为口诀：**"能用原生就别用 ARIA"（First Rule of ARIA）**。语义标签自带 role 与键盘行为；ARIA 用于原生表达不了的场景（如自定义 Tree、给 `role="region"` 的 section 命名）。给 `<div role="article">` 加 role 属于重复建设，还给浏览器增加了额外解析负担。

---

## 3. 浏览器兼容性

> 以下为大致基线（依据 caniuse 与 MDN 数据整理，仅供参考，上线前请以目标用户实测为准）。

| 特性 | Chrome | Edge | Firefox | Safari | 移动端简述 | 坑点备注 |
| --- | --- | --- | --- | --- | --- | --- |
| 基础结构标签 header/nav/main/article/section/aside/footer | 5+（main 为 8+） | 12+ | 4+（main 为 5+） | 5+（main 为 5.1+） | 全平台内核已普及，无兼容问题 | `<main>` 在 IE 中曾被/html5shiv 处理；现代项目可无视 |
| `<figure>` / `<figcaption>` | 8+ | 12+ | 4+ | 5.1+ | 同上 | 默认自带 `margin: 1em 40px`，重置样式时容易漏 |
| `<time datetime>` | 33+（早期版本不识别） | 12+ | 4+ | 5.1+ | 无问题 | 对 SEO 的加成有限，不要神化；格式非法时仍渲染但无机器语义 |
| `<details>` / `<summary>` | 12+ | 12+ | 49+（更早版本需 flag） | 6+ | 全部支持 | 早期 Safari 对 summary 内块级子元素样式支持差；`name` 互斥属性：Chrome 120+ / Safari 17.2+ / Firefox 130+，旧浏览器忽略后变为"多开"而非报错 |
| `details` 的 `toggle` 事件 | 36+ | 12+ | 49+ | 9+ | 无问题 | 事件不冒泡（在 details 元素本身触发），委托监听需用捕获或逐个绑定 |
| `<mark>` | 6+ | 12+ | 4+ | 5.1+ | 无问题 | 默认黄底黑字，暗色主题需重置颜色 |
| `<address>` | 1+ | 12+ | 1+ | 1+ | 无问题 | 默认斜体，且默认是块级；包入 footer 会失去 contentinfo 语义的是 footer 不是 address |
| 地标映射（banner/contentinfo 等） | 33+ | 12+ | 63+（早期映射不完整） | 8+ | iOS VoiceOver / Android TalkBack 均按 ARIA 映射朗读 | 不同屏幕阅读器对 `<header>` 嵌套限制的处理略有差异，验收时以实测为准 |
| HTML5 分段大纲算法 | **从未实现** | **从未实现** | **从未实现** | **从未实现** | — | 已被 W3C 从规范中废弃；标题层级一律按字面 h1~h6 处理 |

---

## 4. 使用场景示例

### 场景一：内容站文章页的语义骨架

**场景描述**：资讯/博客类页面是语义化标签的主战场——一屏内混杂文章正文、侧栏推荐、评论列表，搜索引擎与"听"页面的用户都依赖结构区分主次。

```html
<body>
  <header class="site-header">
    <a class="logo" href="/">前端周刊</a>
    <nav aria-label="站内导航"><!-- 与页脚导航区分，必须命名 -->
      <a href="/css">CSS</a><a href="/html">HTML</a>
    </nav>
  </header>

  <main id="content">
    <article class="post">
      <header>
        <h1>语义化标签实战指南</h1>
        <p>作者 · <time datetime="2026-09-23">2026 年 9 月 23 日</time></p>
      </header>
      <p>正文第一段……<mark>语义化</mark>是全文关键词高亮。</p>
      <figure>
        <img src="cover.svg" alt="文章封面：文档大纲示意图">
        <figcaption>图 1 · 从 div 池到语义树的重构过程</figcaption>
      </figure>
      <section aria-labelledby="comments-title">
        <h2 id="comments-title">评论区</h2>
        <article class="comment"><!-- 每条评论也是独立内容，用 article -->
          <p>学到了！</p>
          <footer><time datetime="2026-09-23T09:00">9 小时前</time></footer>
        </article>
      </section>
    </article>
    <aside aria-label="相关推荐">右侧推荐位</aside><!-- 弱相关 → aside -->
  </main>

  <footer class="site-footer">
    <p><small>© 2026 前端周刊</small></p>
  </footer>
</body>
```

**逐段注释**：`header/nav/main/aside/footer` 构成四个地标，屏幕阅读器 rotor 面板可直接跳转；`article` 嵌套 `article` 表达"文章含评论"；评论时间用 `<time>` 提供机器可读格式；`aside` 有 `aria-label`，否则多个 complementary 地标无法区分。

**预期效果**：结构标签不改变视觉（配合样式后正常排版），但在无障碍树中生成完整地标地图，SEO 抓取器能精确定位正文区块。

### 场景二：零 JS 的 FAQ 手风琴

**场景描述**：常见问题页需要折叠面板。用 `<details>` 系列原生实现，比手写 div+click 更少代码、天然可键盘操作，且 JS 失效时仍可用。

```html
<section aria-labelledby="faq-title">
  <h2 id="faq-title">常见问题</h2>
  <!-- name 相同 → 浏览器自动排他：打开一个自动收起其他（老浏览器退化为可多开） -->
  <details name="faq" open>
    <summary>如何退款？</summary>
    <p>订单页选择"申请退款"，1~3 个工作日到账。</p>
  </details>
  <details name="faq">
    <summary>支持哪些支付方式？</summary>
    <p>支持微信、支付宝与银行卡。</p>
  </details>
</section>
```

**逐段注释**：`open` 控制默认展开；`summary` 是唯一合法的"标题"子元素，同时是键盘焦点元素；`name` 分组实现排他（详见配套示例 index-02）；`toggle` 事件可用于展开时懒加载图片。

**预期效果**：点击或按 Enter/Space 切换展开，箭头图标由浏览器绘制（可用 CSS 自定义 marker），零脚本。

### 场景三：商品卡片列表（电商）

**场景描述**：商品列表页中，每张卡片是可独立理解的内容单元，且整卡可点。

```html
<ul class="goods">
  <li>
    <article class="card"><!-- 每张卡独立成篇：脱离列表仍能理解 -->
      <a href="/p/1001" aria-label="无线机械键盘，售价 299 元，查看详情">
        <img src="kb.svg" alt="">
        <h3>无线机械键盘</h3>
      </a>
      <p><s>¥399</s> <strong>¥299</strong><!-- 划线价用 s，现价是重要信息用 strong --></p>
      <footer><small>已售 1.2 万</small></footer>
    </article>
  </li>
</ul>
```

**逐段注释**：整卡链接把标题与价格合进 `aria-label`，避免屏幕阅读器把卡片内所有文本读成"一坨链接"；装饰图 `alt=""` 让读屏直接跳过；`<s>` 与 `<strong>` 的选择体现语义差异而非视觉效果。

**预期效果**：读屏用户听到"链接：无线机械键盘，售价 299 元……"而不是冗长拼贴；划线价与现价语义分明。

### 场景四：中后台系统的页面骨架与"跳过导航"

**场景描述**：中后台页面顶部导航与工具栏占屏幕一半，键盘用户每换页都要 Tab 过几十个链接，需要"跳到主内容"。

```html
<body>
  <a class="skip-link" href="#main">跳到主内容</a><!-- 键盘第一个可达元素 -->
  <header>
    <nav aria-label="后台导航">…十几个菜单项…</nav>
  </header>
  <main id="main" tabindex="-1"><!-- tabindex=-1 使其可被 JS/锚点聚焦但不在 Tab 序列 -->
    <h1>订单管理</h1>
    <section aria-labelledby="filter-t"><h2 id="filter-t">筛选</h2>…</section>
  </main>
</body>
```

**逐段注释**：skip-link 默认藏在屏幕外、`:focus` 时滑入，是 WCAG 2.4.1 的标准做法；`main` 加 `tabindex="-1"` 让点击锚点后焦点真正落到主内容，后续 Tab 从这里继续。

**预期效果**：打开页面按一次 Tab，出现"跳到主内容"，回车直达 `<h1>`，Tab 成本从 O(菜单数) 降为 1。

---

## 5. 实际应用案例分析

### 案例一：内容站（资讯/博客）从 div 池重构为语义骨架 —— SEO 与可访问性双收益

某资讯站改版前，整页约 40 个 div，正文与推荐位、页脚混杂在同级容器里。重构动作与结论：

1. **选型**：不引入任何框架层改动，仅替换结构标签 + 修正标题层级（原来正文标题是 `div.h2` 模拟，改为真实 `h2/h3`）。成本约 2 人日。
2. **踩坑一：标题层级塌陷**。原来靠 CSS 把"看起来小"的 h1 当装饰用，重构时发现全文有 3 个 h1。修正原则：**每页一个 h1（页面主题），之后逐级递进**；站点名用包裹在页面 h1 外的 `<p>/<span>` 或放在 header 中弱化。
3. **踩坑二：`section` 爆炸**。开发者学会 section 后把每个样式块都写成 section，页面出现十几个无标题的 region 地标，屏幕阅读器 rotor 反而被噪音淹没。修正标准：**没有标题、不进目录的分组一律退回 div**。
4. **收益**：抓取日志显示正文段落被更完整地收录，站内"精选摘要"命中数上升；VoiceOver 用户从"听完 3 分钟才到正文"变为"两跳到 main"。该案例的结论是——语义化的收益里，**无障碍的确定性远高于 SEO 的不确定性**，团队应以前者为验收口径。

### 案例二：中后台设计系统的"语义基座" —— 把结构写进组件库

某 B 端 React 组件库把语义约束固化进组件：`Page` 组件强制渲染 `<main>`；`Page.Header` 渲染 header 并自动挂 `aria-label`；`Collapse` 组件底层直接用 `<details>`（保留受控逻辑用 `open` + `toggle` 事件同步 state）。

1. **方案选型**：对比过 div+role+ARIA 手工方案，最终选择原生 `details`，理由是键盘交互、屏幕阅读器联动免费获得，`::details-content` 未普及前的动画限制用 CSS grid 行高过渡近似解决——**用组件化把"语义正确"变成默认值**，业务侧不背记忆负担。
2. **踩坑一：details 动画**。`<details>` 内容展开是瞬时的，团队用 `interpolate-size: allow-keywords`（Chrome 129+）+ 降级（不支持时保持瞬时展开）处理。
3. **踩坑二：name 互斥兼容性**。`name` 属性要求 Chrome 120+/Safari 17.2+，业务方抱怨"旧浏览器手风琴能多开"，最终策略是：互斥是增强体验，多开不算 bug，不为此引 JS。
4. **结论**：把语义化做成**架构资产**而非单页技巧——一个正确封装的组件，比一篇规范文档更能约束住 40 个业务仓库。

---

## 6. 最佳实践与常见坑

1. **每页恰好一个 `<main>`，且它是 body 的直接子级**（或包含于一个 div 包装中但不得在地标元素内）；SPA 路由切换时注意不要累积出多个 main。
2. **`<header>/<footer>` 只有"不在 article/section/aside/nav 之内"时才是 banner/contentinfo 地标**——文章内的 header 只是普通分组，别指望它进地标菜单。
3. **`<section>` 必须有标题才有意义**；无标题分组用 `<div>`。判断口诀："需要出现在目录里吗？"
4. **标题层级按字面 h1→h2→h3 递进，不跳级**；大纲算法已被废弃，"section 内 h1 重置"的写法在屏幕阅读器中不会降级。
5. **多个 `<nav>`、多个 `<aside>` 必须用 `aria-label` 命名**（如"主导航""面包屑"），否则读屏菜单里全叫 navigation。
6. **`<strong>`（重要性）与 `<em>`（语气）不要混用为纯视觉加粗/斜体**；无语义的加粗用 `<b>` 或直接 `font-weight`，术语斜体用 `<i>`。选错标签会误导读屏用户的轻重判断。
7. **`<time>` 必须写合法的 `datetime` 值**（`YYYY-MM-DD`、`HH:mm`、含时区的 RFC3339 等），非法值等于没写；展示文案随意，机器值严格。
8. **`<details>` 的 `toggle` 事件不冒泡**，事件委托要用捕获阶段（`addEventListener('toggle', fn, true)`）或逐个绑定；`name` 互斥在旧浏览器静默退化为多开，需按"渐进增强"验收。
9. **不要用 `<section>`/`<article>` 替代布局容器**——栅格列、间距盒子等纯样式节点仍是 div 的本职；语义标签用错了比不用更糟（产生错误地标）。
10. **`<figure>` 默认有 `margin: 1em 40px`**，CSS Reset 时容易漏掉导致对不齐；`figcaption` 必须是第一个或最后一个子元素。
11. **装饰性图片 `alt=""`**（不是省略 alt），让读屏跳过；有含义的图必须写 alt，figcaption 不能替代 alt。
12. **整卡可点用 `<a>` 包裹卡片内容并写 `aria-label`**，避免"链接内塞满整段文本"的读屏灾难；不要用 JS 给 div 绑 click 冒充按钮。

---

## 7. 参考资料

- MDN · HTML 元素参考（语义化分区元素）：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element
- MDN · 文档与网站结构（结构化语义）：https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure
- MDN · `<details>`：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/details
- MDN · HTML 中的日期与时间格式：https://developer.mozilla.org/zh-CN/docs/Web/HTML/Date_and_time_formats
- MDN · ARIA 地标（Landmark Regions）：https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/landmark_role
- W3C · HTML Living Standard（Sections 分组内容）：https://html.spec.whatwg.org/multipage/sections.html
- W3C · WAI-ARIA Authoring Practices（地标与结构）：https://www.w3.org/WAI/ARIA/apg/
- HTML5 大纲算法废弃说明（Web Hypertext Application Technology Working Group 相关讨论）：https://github.com/whatwg/html/issues/83
- caniuse · details 元素：https://caniuse.com/details
- caniuse · main 元素：https://caniuse.com/mdn-html_elements_main
