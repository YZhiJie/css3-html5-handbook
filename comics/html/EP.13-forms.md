# 漫画 · 第 13 话 表单：浏览器是第一道质检员

> 对应正文：[docs/html/02-forms.md](../../docs/html/02-forms.md) ｜ 原画：[EP.13-forms.svg](./EP.13-forms.svg)

## 登场角色

- **像素酱**：CSS 造型师，被拉去写注册页——邮箱、手机号、URL 各写一套正则，还忘了移动端键盘，测试同学在手机上输入邮箱时连 `@` 都找不到。
- **标签君**：HTML5 结构师，本话主角。演示"规则声明给浏览器"的约束校验管线，只在两次密码一致这类业务规则上才动手写 JS。

## 剧情梗概

HTML5 表单增强把"输入对不对"下沉到了浏览器：语义化输入类型负责控件与移动键盘，声明式属性负责规则，Constraint Validation API 负责让 JS 读取与介入同一套校验引擎。像素酱删掉半屏正则后，表单反而更好用——错误提示统一、键盘自动适配、密码管理器也认识字段了。

## 分格解读

### 格1 · 痛点现场

纯手写校验有三重成本：每种字段一套正则样板、错误提示全靠自己拼、移动端键盘与字段不匹配（`type="text"` 输入邮箱时键盘没有 `@`，输验证码时弹出全字母键盘）。这些逻辑每个项目都在重写，而且浏览器本来就免费提供。

### 格2 · 机制登场

提交表单时，浏览器走一条约束校验管线：先收集控件，依次检查 `typeMismatch → valueMissing → tooLong → rangeUnderflow/Overflow → stepMismatch → patternMismatch → 自定义约束`；任一失败就阻止提交、聚焦第一个非法控件并弹出原生气泡，同时触发不冒泡的 `invalid` 事件（全表单监听要用捕获阶段委托）。结果挂在每个控件的 `validity` 对象上，9 个布尔标志精确告诉你失败原因。

### 格3 · 落地收束

`type="email/url/tel/number/date/range/color"` 一键得到合适控件、合适键盘和内建校验；`inputmode="numeric"`、`enterkeyhint="go"` 进一步微调移动端体验。业务级校验（两次密码一致）用 `setCustomValidity(消息)` 把控件置为 `customError`，注意条件恢复后**必须传空串复位**。想完全自定义错误 UI，就给表单加 `novalidate` 接管提交时机——它只跳过自动拦截，`checkValidity()` 等 API 照常工作。样式上用 `:user-invalid/:user-valid`，用户交互后才变色，避免空表单一进页面就全红。

## 码叔划重点

1. type 不只是控件名：移动端键盘、原生校验、自动填充三件事都由它决定。
2. 规则声明给浏览器：required/pattern/min/max 提交自动拦截，JS 只管业务规则。
3. novalidate 只接管提交时机；setCustomValidity 修复后必须传空串复位。

## 自测一题

**问**：表单加了 `novalidate` 后，`form.checkValidity()` 为什么仍然返回 false？这是 bug 吗？

**答**：不是 bug，正是 novalidate 的设计意图。`novalidate` 只关闭"提交时浏览器自动拦截并弹气泡"这一步，并不关闭校验引擎——控件的 `validity` 状态、`checkValidity()/reportValidity()` 全部照常计算。因此自定义验证方案的标准套路是：`novalidate` 接管提交 → JS 调 `checkValidity()` 读结果 → 按自己的样式和位置渲染错误；需要原生气泡时再调 `reportValidity()`。

## 动手实验

- 输入类型全家桶 + datalist + output + fieldset/legend + label 关联：[examples/html/02-forms/index-01-input-types.html](../../examples/html/02-forms/index-01-input-types.html)
- Constraint Validation API：validity 实时面板 + setCustomValidity + novalidate 自定义验证：[index-02-validation-api.html](../../examples/html/02-forms/index-02-validation-api.html)
- :valid/:invalid 与 :user-valid/:user-invalid 体验差异 + autocomplete：[index-03-user-valid-pseudo.html](../../examples/html/02-forms/index-03-user-valid-pseudo.html)

## 下一话预告

第 14 话《Canvas》——一块即时模式位图：时钟、粒子、柱状图与高清屏适配的标准三步。
