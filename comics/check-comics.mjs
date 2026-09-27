#!/usr/bin/env node
/**
 * comics/check-comics.mjs
 * CSS3 × HTML5 漫画剧场零依赖校验器：
 *  1. manifest.json 可解析、EP 编号唯一且连续（EP.01..EP.46）
 *  2. manifest 登记的 svg/md/正文 doc/examples 目录全部存在
 *  3. comics/css 与 comics/html 下实际存在的 .svg/.md 与 manifest 双向一致（无孤儿、无缺登记）
 *     （samples/ 与 comics 根目录文件不参与校验）
 *  4. 每个 SVG：xmlns 正确、viewBox 为 0 0 1200 840、<text> 可见文本无裸 <>&
 *     且本机有 xmllint 时做 XML 良构校验
 *  5. 每篇讲解 MD：行数 45-100、含「码叔划重点」「自测」小节、
 *     引用的 ../../docs 正文与 ../../examples 目录存在、链接本话原画 SVG
 * 退出码：0 全绿；1 有错误（warning 不影响退出码）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const comicsDir = path.join(root, "comics");

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ---------- 1. manifest ----------
const manifestPath = path.join(comicsDir, "manifest.json");
if (!fs.existsSync(manifestPath)) fail("缺少 comics/manifest.json");
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch (e) {
  fail(`manifest.json 解析失败：${e.message}`);
}

if (manifest) {
  const eps = manifest.episodes ?? [];
  if (eps.length !== 46) fail(`manifest 应有 46 话，实际 ${eps.length} 话`);

  const seen = new Set();
  eps.forEach((item, i) => {
    const expectEp = `EP.${String(i + 1).padStart(2, "0")}`;
    if (item.ep !== expectEp)
      fail(`第 ${i + 1} 条 ep 应为 ${expectEp}，实际 ${item.ep}`);
    if (seen.has(item.ep)) fail(`ep 编号重复：${item.ep}`);
    seen.add(item.ep);

    const svgPath = path.join(comicsDir, `${item.comic}.svg`);
    const mdPath = path.join(comicsDir, `${item.comic}.md`);
    const docPath = path.join(root, item.doc);
    if (!fs.existsSync(svgPath))
      fail(`${item.ep} 缺少 SVG：comics/${item.comic}.svg`);
    if (!fs.existsSync(mdPath))
      fail(`${item.ep} 缺少讲解 MD：comics/${item.comic}.md`);
    if (!fs.existsSync(docPath)) fail(`${item.ep} 对应正文不存在：${item.doc}`);
    if (item.example && !fs.existsSync(path.join(root, item.example))) {
      fail(`${item.ep} 对应示例目录不存在：${item.example}`);
    }
  });

  // ---------- 3. 双向一致性：扫描磁盘（仅 css/ html/ 两个子目录） ----------
  const registered = new Set(eps.map((e) => e.comic));
  const walk = (dir) => {
    const out = [];
    for (const name of fs.readdirSync(dir)) {
      if (name.startsWith(".")) continue;
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) out.push(...walk(full));
      else out.push(full);
    }
    return out;
  };
  for (const sub of ["css", "html"]) {
    const subDir = path.join(comicsDir, sub);
    if (!fs.existsSync(subDir)) continue;
    for (const file of walk(subDir)) {
      if (!/\.(svg|md)$/.test(file)) continue;
      const rel = path.relative(comicsDir, file).replace(/\\/g, "/");
      const key = rel.replace(/\.(svg|md)$/, "");
      if (!registered.has(key))
        fail(`磁盘文件未登记进 manifest：comics/${rel}`);
    }
  }

  // ---------- 4/5. 逐话内容校验 ----------
  const hasXmllint =
    spawnSync("xmllint", ["--version"], { encoding: "utf8" }).status === 0;
  if (!hasXmllint)
    warn("未找到 xmllint，跳过 SVG XML 良构校验（其余检查照常）");

  for (const item of eps) {
    const tag = item.ep;
    const svgPath = path.join(comicsDir, `${item.comic}.svg`);
    const mdPath = path.join(comicsDir, `${item.comic}.md`);
    if (!fs.existsSync(svgPath) || !fs.existsSync(mdPath)) continue;

    const svg = fs.readFileSync(svgPath, "utf8");
    if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(svg))
      fail(`${tag} SVG 缺少正确 xmlns`);
    if (!/viewBox="0 0 1200 840"/.test(svg))
      fail(`${tag} SVG viewBox 不是 0 0 1200 840`);
    if (!svg.includes(item.ep)) fail(`${tag} SVG 中未出现徽章编号 ${item.ep}`);

    // <text> 可见文本中禁止裸 < > &（剥掉嵌套标签后检查文本节点）
    const textBlocks = [
      ...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g),
    ].map((m) => m[1]);
    textBlocks.forEach((block, idx) => {
      const visible = block.replace(/<[^>]+>/g, "");
      if (/[<>]/.test(visible))
        fail(
          `${tag} 第 ${idx + 1} 个 text 含裸尖括号：${visible.slice(0, 30)}`,
        );
      if (
        visible.includes("&") &&
        !/&(amp|lt|gt|quot|apos|#\d+);/.test(visible)
      ) {
        fail(`${tag} 第 ${idx + 1} 个 text 含裸 & ：${visible.slice(0, 30)}`);
      }
    });

    if (hasXmllint) {
      const r = spawnSync("xmllint", ["--noout", svgPath], {
        encoding: "utf8",
      });
      if (r.status !== 0)
        fail(
          `${tag} xmllint 良构校验失败：${(r.stderr || "").trim().slice(0, 200)}`,
        );
    }

    const md = fs.readFileSync(mdPath, "utf8");
    const lines = md.split("\n").length;
    if (lines < 45 || lines > 100)
      fail(`${tag} 讲解 MD 行数 ${lines} 超出 45-100 区间`);
    if (!md.includes("码叔划重点"))
      fail(`${tag} 讲解 MD 缺少「码叔划重点」小节`);
    if (!md.includes("自测")) fail(`${tag} 讲解 MD 缺少「自测」小节`);
    const docLinks = [
      ...md.matchAll(/\]\((\.\.\/\.\.\/docs\/[^)#]+\.md)/g),
    ].map((m) => m[1]);
    if (docLinks.length === 0) fail(`${tag} 讲解 MD 未引用 ../../docs 正文`);
    for (const link of docLinks) {
      const target = path.resolve(path.dirname(mdPath), link);
      if (!fs.existsSync(target)) fail(`${tag} 正文相对链接失效：${link}`);
    }
    const exLinks = [
      ...md.matchAll(/\]\((\.\.\/\.\.\/examples\/[^)#]*?)\/?(?:\)|#)/g),
    ].map((m) => m[1]);
    for (const link of exLinks) {
      const target = path.resolve(path.dirname(mdPath), link);
      if (!fs.existsSync(target)) fail(`${tag} 示例相对链接失效：${link}`);
    }
    if (!md.includes(`./${path.basename(item.comic)}.svg`))
      fail(`${tag} 讲解 MD 未链接本话原画 SVG`);
  }
}

// ---------- 输出 ----------
console.log("──────────────────────────────────────");
console.log("  CSS3 × HTML5 漫画剧场 · 质量校验");
console.log("──────────────────────────────────────");
warnings.forEach((w) => console.log(`⚠️  WARN  ${w}`));
errors.forEach((e) => console.log(`❌ FAIL  ${e}`));
if (errors.length === 0) {
  const count = manifest ? manifest.episodes.length : 0;
  console.log(
    `✅ PASS  ${count} 话 SVG+讲解 MD、manifest 双向一致、链接与规范检查全部通过（${warnings.length} 条 warning）`,
  );
  process.exit(0);
} else {
  console.log(
    `💥 共 ${errors.length} 个错误，请修复后重跑 node comics/check-comics.mjs`,
  );
  process.exit(1);
}
