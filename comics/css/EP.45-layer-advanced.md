# 漫画 · 第 45 话 @layer 进阶：嵌套层、匿名层与 revert-layer

> 对应正文：[docs/css/28-layer-advanced.md](../../docs/css/28-layer-advanced.md) ｜ 原画：[EP.45-layer-advanced.svg](./EP.45-layer-advanced.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。基础 @layer 用熟了，但大型项目里 base 层内还要分 reset/tokens/typography、第三方库 CSS 没进层、组件覆盖后想回退到 base——基础层叠层不够用了。
- **标签君**：HTML5 结构师，搬出进阶三件套——嵌套层让层内再分层、匿名层包裹第三方 CSS、revert-layer 精确撤销某一层覆盖。

## 剧情梗概

EP.23 解决了「层叠顺序可控」，但真实项目复杂度升级：设计系统要分层、Ant Design 产物要隔离、覆盖后要回退。像素酱学会三件进阶武器——`@layer base { @layer reset { } }` 嵌套层分组管理、`@layer { }` 匿名层包裹第三方、`revert-layer` 回退到上一层而非浏览器默认。大型项目的层叠战争终于消停。

## 分格解读

### 格1 · 痛点现场

三个新痛点：base 层内还要再分 reset/tokens/typography；第三方库（如 Ant Design）没有 @layer，直接插进层叠打乱顺序；组件覆盖了 base 的颜色，想回退到 base 而不是浏览器默认。

### 格2 · 机制登场

嵌套层 `@layer base { @layer reset { } }` 形成树状层叠，顺序 = 父层顺序 + 子层声明顺序；匿名层 `@layer { }` 不带名字，排在所有命名层之后，用于包裹第三方 CSS；`revert-layer` 把属性回退到上一层，而不是浏览器默认（revert）或初始值（initial）。

### 格3 · 落地收束

四大场景：嵌套层分组（大型设计系统分层）、匿名层包裹第三方（隔离不污染）、revert-layer（精确撤销覆盖）、第三方库覆盖（antd 固定在底层，components 永远覆盖）。无需 !important 或特异性战争。

## 码叔划重点

1. 嵌套层顺序 = 父层顺序 + 子层声明顺序；最多两层，三层可读性急剧下降。
2. 匿名层只用于包裹第三方 CSS；业务代码必须进命名层，否则无法追加。
3. revert-layer 回退到上一层，revert 回退到浏览器默认——别搞混。

## 自测一题

**问**：为什么匿名层不能用于业务代码，只能包裹第三方 CSS？

**答**：匿名层没有名字，后续无法用 `@layer` 引用追加内容。业务代码需要不断迭代（今天加按钮、明天加卡片），必须进命名层才能持续追加；第三方库产物是静态的，一次性包裹即可。

## 动手实验

- 嵌套层演示 + 匿名层包裹 + revert-layer 回退 + 第三方库覆盖：[examples/css/28-layer-advanced/](../../examples/css/28-layer-advanced/index-01-layer-advanced.html)

## 下一话预告

第 46 话《Service Worker 缓存策略》——地铁上打不开页面？Cache First 静态资源、Network First API、Stale While Revalidate 列表，三大策略让应用离线可用、秒开。
