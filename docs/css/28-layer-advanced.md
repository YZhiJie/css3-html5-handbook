# @layer 进阶：嵌套层、匿名层与 revert-layer

> 面向前端开发人员的 CSS3 高级特性参考资料 —— @layer 基础（EP.23）解决了「层叠顺序可控」，进阶则解决「多人协作与第三方样式博弈」：嵌套层让大型项目分组管理、匿名层兼容旧库、revert-layer 精确撤销某一层。

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
| [index-01-layer-advanced.html](../../examples/css/28-layer-advanced/index-01-layer-advanced.html) | 嵌套层 + 匿名层 + revert-layer + 第三方库覆盖实战 |

---

## 1. 概念解释

### 1.1 为什么需要进阶 @layer

基础 @layer 解决了「样式分层」：base < components < utilities。但真实项目里还有三堵墙：

1. **大型项目层内再分层**：base 里还要分 reset、tokens、typography；components 里还要分 ui、business。
2. **第三方库不想进你的层**：老库、CDN 引入的 CSS 没有 @layer，直接插进你的层叠会打乱顺序。
3. **只想撤销某一层**：组件库覆盖了 base 的颜色，你想让它回到 base，而不是回到浏览器默认。

### 1.2 底层原理

@layer 进阶三板斧：

- **嵌套层（nested layers）**：`@layer base.reset` 或 `@layer base { @layer reset { ... } }`，形成树状层叠，顺序 = 父层顺序 + 子层声明顺序。
- **匿名层（anonymous layers）**：不带名字的 `@layer { ... }`，按出现顺序排在所有命名层之后，可插入任意位置，用于包裹第三方 CSS。
- **revert-layer**：`color: revert-layer` 把属性回退到「上一层」的值，而不是浏览器默认（revert）或初始值（initial）。

---

## 2. 语法说明

### 2.1 嵌套层

```css
/* 声明嵌套层：base 内再分 reset、tokens、typography */
@layer base {
  @layer reset {
    * { margin: 0; padding: 0; }
  }
  @layer tokens {
    :root { --brand: #7c3aed; }
  }
  @layer typography {
    body { font-family: system-ui; }
  }
}

/* components 层内再分 ui 与 business */
@layer components {
  @layer ui {
    .btn { padding: 8px 16px; }
  }
  @layer business {
    .user-card { border: 1px solid; }
  }
}
```

嵌套层顺序规则：

- 先按父层顺序：base < components < utilities
- 同父层内按子层声明顺序：reset < tokens < typography

### 2.2 匿名层

```css
/* 命名层 */
@layer base { ... }
@layer components { ... }

/* 匿名层：排在所有命名层之后 */
@layer {
  /* 包裹第三方库 CSS */
  .third-party-btn { color: red; }
}

/* 再声明命名层，会排在匿名层之后 */
@layer utilities { ... }
```

匿名层特点：无名、不可被后续 `@layer` 引用追加内容、顺序取决于声明位置。

### 2.3 revert-layer

```css
@layer base {
  .card { color: #333; background: white; }
}

@layer components {
  .card {
    color: revert-layer;        /* 回退到 base 层的 #333 */
    background: revert-layer;   /* 回退到 base 层的 white */
  }
}
```

与 revert 的区别：

| 值 | 回退目标 |
| --- | --- |
| `revert` | 浏览器默认样式（user agent stylesheet） |
| `revert-layer` | 上一层（@layer 顺序中的前一层） |
| `initial` | 属性初始值（如 color 为 canvastext） |
| `unset` | 继承属性→inherit，非继承→initial |

---

## 3. 浏览器兼容性

- **Chrome / Edge**：99+（2022-03，@layer 基础）；112+（2023-04，revert-layer）
- **Firefox**：97+（2022-02，@layer 基础）；114+（2023-06，revert-layer）
- **Safari**：15.4+（2022-03，@layer 基础）；16.4+（2023-03，revert-layer）

嵌套层与匿名层随 @layer 基础一起落地，revert-layer 稍晚。生产环境可放心使用。

---

## 4. 使用场景示例

### 场景 1：大型设计系统分层

```css
@layer base, components, utilities;

@layer base {
  @layer reset, tokens, typography;
  @layer reset { /* normalize */ }
  @layer tokens { :root { --primary: #06b6d4; } }
  @layer typography { h1 { font-size: 2rem; } }
}

@layer components {
  @layer ui, business;
  @layer ui { .btn { ... } }
  @layer business { .user-card { ... } }
}

@layer utilities {
  .text-center { text-align: center; }
}
```

### 场景 2：包裹第三方库（匿名层）

```css
@layer base, components, utilities;

@layer base { ... }
@layer components { ... }

/* 第三方库放匿名层，排在 components 之后、utilities 之前 */
@layer {
  /* 这里粘贴第三方 CSS */
  .legacy-btn { background: gray; }
}

@layer utilities { ... }
```

### 场景 3：精确撤销组件覆盖

```css
@layer base {
  .alert { color: #333; border: 1px solid #ddd; }
}

@layer components {
  .alert {
    color: revert-layer;    /* 不想覆盖颜色，回退到 base */
    border: 2px solid red;  /* 只覆盖边框 */
  }
}
```

---

## 5. 实际应用案例分析

### 案例：中后台项目引入 Ant Design 5 + 自定义组件

**背景**：项目用 Ant Design 5（CSS-in-JS 产物无 @layer），同时有自定义组件库，双方样式经常互相覆盖。

**改造前**：

```css
/* 全局样式，顺序不可控 */
.ant-btn { ... }
.my-btn { ... }
/* 特异性战争：.my-btn 需要 0-2-0 才能压过 .ant-btn */
```

**改造后**：

```css
@layer antd, components, utilities;

/* 用 PostCSS 把 Ant Design 产物包进 @layer antd */
@layer antd {
  /* antd 产物 */
}

@layer components {
  @layer ui, business;
  @layer ui { .btn { ... } }
  @layer business { .user-card { ... } }
}

@layer utilities {
  .mt-4 { margin-top: 16px; }
}
```

**收益**：

- Ant Design 固定在 antd 层，components 层永远能覆盖；
- 自定义组件内部再分 ui/business，业务组件不会污染基础 UI；
- utilities 工具类始终最高优先级，用于微调。

---

## 6. 最佳实践与常见坑

1. **先声明层顺序，再写内容**：`@layer base, components, utilities;` 放在文件顶部，后续层内容可分散在多个文件。
2. **嵌套层不要过深**：推荐最多两层（父层 + 子层），三层以上可读性急剧下降。
3. **匿名层只用于包裹第三方**：业务代码必须进命名层，否则后续无法追加。
4. **revert-layer 不是 revert**：想回退到浏览器默认用 revert，想回退到上一层用 revert-layer。
5. **@layer 与 !important 的关系**：!important 反转层顺序（utilities !important > base !important），但层内仍按特异性。
6. **未进 @layer 的样式优先级最高**：不在任何层里的样式（包括内联 style）优先级高于所有层，小心第三方库直接写内联。

---

## 7. 参考资料

- [MDN: @layer](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@layer)
- [Can I use: CSS Cascade Layers](https://caniuse.com/css-cascade-layers)
- [CSS Spec: CSS Cascading and Inheritance Level 5](https://drafts.csswg.org/css-cascade-5/)
- [web.dev: Cascade layers](https://web.dev/articles/cascade-layers)
