#!/usr/bin/env node

/**
 * @file grade-template.js
 *
 * Grades a template source file against the XDS Template Grading Rubric.
 * See: https://github.com/facebookexperimental/xds/wiki/Contributing-Templates#template-grading-rubric
 *
 * Exports `gradeTemplate(sourcePath, doc, type)` for use in sync-templates.js.
 *
 * Grade scale:
 *   A (90–100) — Exemplary. Copy-paste ready.
 *   B (75–89)  — Good. Minor issues a reviewer would flag but approve.
 *   C (60–74)  — Needs work. Would get "request changes" in review.
 *   D (40–59)  — Poor. Significant rewrites needed.
 *   F (0–39)   — Failing. Actively teaches bad patterns.
 */

const fs = require('fs');

const RAW_HTML_TAGS = new Set([
  'div', 'span', 'button', 'nav', 'aside', 'main', 'section', 'article',
  'header', 'footer', 'figure', 'ul', 'ol', 'li', 'p',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'form', 'input', 'textarea', 'select', 'option', 'label',
  'a', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'dl', 'dt', 'dd', 'hr', 'br', 'pre', 'code', 'blockquote',
  'details', 'summary', 'dialog', 'menu',
  'img', 'picture', 'video', 'audio', 'canvas', 'iframe',
]);

const SVG_ELEMENT_TAGS = new Set([
  'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse',
]);

// ---------------------------------------------------------------------------
// 1. XDS Component Purity (30 pts)
// ---------------------------------------------------------------------------

function countRawHtmlElements(source) {
  const tagRegex = /<([a-z][a-z0-9]*)\b/g;
  let count = 0;
  let match;
  while ((match = tagRegex.exec(source)) !== null) {
    const tag = match[1];
    if (!RAW_HTML_TAGS.has(tag)) continue;

    // Necessary exceptions per rubric
    if (tag === 'img') {
      const ctx = source.slice(match.index, match.index + 300);
      if (/xds[_-]oss/i.test(ctx)) continue;
    }
    if (tag === 'form' && /XDSFormLayout/.test(source)) continue;
    if (tag === 'input') {
      const ctx = source.slice(match.index, match.index + 120);
      if (/type=["']hidden["']/.test(ctx)) continue;
    }
    count++;
  }
  return count;
}

function scoreComponentPurity(rawCount) {
  if (rawCount === 0) return 30;
  if (rawCount <= 2) return 25;
  if (rawCount <= 5) return 15;
  if (rawCount <= 10) return 8;
  if (rawCount <= 20) return 4;
  return 0;
}

// ---------------------------------------------------------------------------
// 2. Icon Purity (15 pts)
// ---------------------------------------------------------------------------

function countRawSvgElements(source) {
  const svgRegex = /<([a-z]+)\b/g;
  let count = 0;
  let match;
  while ((match = svgRegex.exec(source)) !== null) {
    if (SVG_ELEMENT_TAGS.has(match[1])) count++;
  }
  return count;
}

function scoreIconPurity(svgCount) {
  if (svgCount === 0) return 15;
  if (svgCount <= 2) return 10;
  if (svgCount <= 5) return 5;
  return 0;
}

// ---------------------------------------------------------------------------
// 3. Custom CSS (15 pts)
// ---------------------------------------------------------------------------

function countCustomCssDeclarations(source) {
  let count = 0;

  // Properties inside stylex.create() blocks
  let idx = 0;
  const marker = 'stylex.create(';
  while (true) {
    const start = source.indexOf(marker, idx);
    if (start === -1) break;
    const blockStart = start + marker.length;
    let depth = 0;
    let end = blockStart;
    for (; end < source.length; end++) {
      const ch = source[end];
      if (ch === '(' || ch === '{') depth++;
      else if (ch === ')' || ch === '}') {
        depth--;
        if (depth <= 0) break;
      }
    }
    const block = source.slice(blockStart, end);
    for (const line of block.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('//') || t === '}' || t === '},' || t === '{') continue;
      if (/^\w+\s*:\s*[{(]/.test(t)) continue; // style-object name or dynamic fn
      if (/^[a-zA-Z]\w*\s*:/.test(t)) count++;
    }
    idx = end + 1;
  }

  // Inline style={{}} properties
  const styleRegex = /style=\{\{([\s\S]*?)\}\}/g;
  let m;
  while ((m = styleRegex.exec(source)) !== null) {
    count += m[1].split(',').filter(p => p.trim()).length;
  }

  // className= usages
  count += (source.match(/className=/g) || []).length;

  return count;
}

function scoreCustomCss(cssCount) {
  if (cssCount === 0) return 15;
  if (cssCount <= 3) return 12;
  if (cssCount <= 10) return 5;
  if (cssCount <= 20) return 2;
  return 0;
}

// ---------------------------------------------------------------------------
// 4. Layout & Structure (15 pts)
// ---------------------------------------------------------------------------

function scoreLayout(source, type) {
  if (type === 'page') {
    if (/XDSAppShell|XDSLayout|XDSCenter/.test(source)) return 15;
    if (/<div/.test(source)) return 0;
    return 8;
  }
  // Block
  if (/XDSAppShell/.test(source)) return 0;
  const lines = source.split('\n').filter(l => l.trim()).length;
  if (lines >= 20 && lines <= 100) return 15;
  return 10;
}

// ---------------------------------------------------------------------------
// 5. Doc Metadata (10 pts)
// ---------------------------------------------------------------------------

function scoreDocMetadata(doc, type) {
  if (!doc) return 0;
  let score = 10;

  if (!doc.name) score -= 3;
  if (!doc.description) score -= 3;
  if (doc.isReady == null) score -= 1;

  if (type === 'page') {
    if (doc.type !== 'page') score -= 3;
  } else {
    if (doc.type !== 'block') score -= 2;
    if (!doc.aspectRatio) score -= 1;
    if (!doc.componentsUsed || doc.componentsUsed.length === 0) score -= 2;
  }
  return Math.max(0, score);
}

// ---------------------------------------------------------------------------
// 6. Image Handling (5 pts)
// ---------------------------------------------------------------------------

function scoreImageHandling(source) {
  const imgs = source.match(/<img\b[^>]*>/g) || [];
  if (imgs.length === 0) return 5;
  if (imgs.every(tag => /xds[_-]oss/i.test(tag))) return 5;
  if (imgs.some(tag => /placeholder|picsum|unsplash/i.test(tag))) return 2;
  return 0;
}

// ---------------------------------------------------------------------------
// 7. Code Quality (10 pts) — 2 pts each
// ---------------------------------------------------------------------------

function scoreCodeQuality(source) {
  let score = 0;

  // 'use client' directive
  if (/^['"]use client['"];?/m.test(source.trimStart())) score += 2;

  // default export
  if (/export default/.test(source)) score += 2;

  // Self-contained imports (only @xds/core/*, @heroicons/react/*, react, next/*)
  const importFrom = /from\s+['"]([^'"]+)['"]/g;
  let selfContained = true;
  let im;
  while ((im = importFrom.exec(source)) !== null) {
    const pkg = im[1];
    if (
      pkg.startsWith('.') ||
      pkg.startsWith('@xds/core/') ||
      pkg.startsWith('@heroicons/react/') ||
      pkg === 'react' ||
      pkg.startsWith('next/')
    ) continue;
    selfContained = false;
    break;
  }
  if (selfContained) score += 2;

  // Realistic mock data — benefit of the doubt unless obviously lorem/placeholder
  if (!/lorem ipsum/i.test(source)) score += 2;

  // No dead code — benefit of the doubt
  score += 2;

  return score;
}

// ---------------------------------------------------------------------------
// Grade aggregation
// ---------------------------------------------------------------------------

function letterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Grade a template against the XDS rubric.
 *
 * @param {string} sourcePath  Absolute path to the .tsx file
 * @param {object} doc         Parsed template.doc.mjs export
 * @param {'page'|'block'} type
 * @returns {{ grade: string, gradeScore: number }}
 */
function gradeTemplate(sourcePath, doc, type) {
  const source = fs.readFileSync(sourcePath, 'utf-8');

  const rawHtml = countRawHtmlElements(source);
  const rawSvg = countRawSvgElements(source);
  const customCss = countCustomCssDeclarations(source);

  const scores = {
    componentPurity: scoreComponentPurity(rawHtml),
    iconPurity: scoreIconPurity(rawSvg),
    customCss: scoreCustomCss(customCss),
    layout: scoreLayout(source, type),
    docMetadata: scoreDocMetadata(doc, type),
    imageHandling: scoreImageHandling(source),
    codeQuality: scoreCodeQuality(source),
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  return {grade: letterGrade(total), gradeScore: total};
}

module.exports = {gradeTemplate};
