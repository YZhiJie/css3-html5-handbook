# 漫画 · 第 48 话 File System Access API：网页直接读写本地文件

> 对应正文：[docs/html/18-file-system-access.md](../../docs/html/18-file-system-access.md) ｜ 原画：[EP.48-file-system-access.svg](./EP.48-file-system-access.svg)

## 登场角色

- **像素酱**：CSS 造型师，本话主角。网页版 Markdown 编辑器，用户吐槽「保存就是下载副本，不像 VS Code 直接写本地」。打开文件靠 `<input type="file">`，批量处理图片要先上传再下载，体验割裂。
- **标签君**：HTML5 结构师，搬出 File System Access API 三件套——`showOpenFilePicker` 打开文件、`showSaveFilePicker` 保存文件、`showDirectoryPicker` 读写目录，让网页获得原生应用级的文件系统能力。

## 剧情梗概

网页长期被「文件操作」这道墙挡住：保存就是下载副本、打开就是 input 框、无法批量处理目录。File System Access API 打破这道墙——打开文件选择器返回文件句柄，保存直接写入本地磁盘，目录操作支持遍历和创建。配合 IndexedDB 持久化句柄，用户授权一次，后续直接读写。

## 分格解读

### 格1 · 痛点现场

用户抱怨：保存 = 下载副本（不是覆盖原文件）、打开 = input type=file（无法记住上次路径）、无法直接读写本地、无法批量处理文件。竞品原生体验，用户流失。

### 格2 · 机制登场

三件套：`showOpenFilePicker` 打开文件返回 FileSystemFileHandle，`showSaveFilePicker` 保存文件返回句柄，`showDirectoryPicker` 打开目录返回 FileSystemDirectoryHandle。读写通过 `createWritable` 实现，权限通过 `queryPermission/requestPermission` 管理。

### 格3 · 落地收束

四大场景：文本编辑器（打开 .md 文件、Ctrl+S 直接保存）、图片批处理（读取目录树、批量压缩）、权限持久化（句柄存 IndexedDB、下次直接读写）、兼容性注意（Chrome 86+ 全绿、Safari 15.2+ 部分支持、Firefox 不支持）。

## 码叔划重点

1. `showOpenFilePicker` / `showSaveFilePicker` / `showDirectoryPicker` 三件套。
2. 句柄可存 IndexedDB 持久化；权限是临时的，刷新后需重新请求。
3. Chrome 86+ / Safari 15.2+ 支持；Firefox 不支持——必须特性检测。

## 自测一题

**问**：为什么 File System Access API 返回的句柄要存入 IndexedDB，而不是直接存在内存中？

**答**：句柄存内存会在页面刷新后丢失。存入 IndexedDB 后，下次打开页面可以直接读取句柄，调用 `queryPermission` 检查权限是否仍有效——用户无需重新选择文件或目录，实现「记住最近文件」功能。

## 动手实验

- 打开文件 + 保存文件 + 读写目录 + 权限管理：[examples/html/18-file-system-access/](../../examples/html/18-file-system-access/index-01-file-system-access.html)

## 下一话预告

霓虹墨 Neon Ink 漫画剧场至此完结——CSS3 × HTML5 从基础到进阶，48 话覆盖 20+ 核心主题。感谢像素酱、标签君、码叔的一路陪伴，深入阅读与动手实验永不停止。
