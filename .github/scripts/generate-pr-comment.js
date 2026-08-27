#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @description Generates and posts PR comment with analysis results
 * @input --analysis <file> --a11y <file> --visual <file> --storybook-url <url> --run-url <url>
 * @output Formatted markdown comment body to stdout
 */

const fs = require('node:fs');
const { buildA11ySection } = require('./lib/a11y-format');
const { buildVisualSection } = require('./lib/visual-format');
// Report-file strings render as literal inline text, report numbers as
// numbers — the comment's structure comes only from this file's literals.
const { inline, num } = require('./lib/report-text');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const analysisFile = getArg('analysis') || 'analysis.json';
const a11yFile = getArg('a11y') || 'a11y-report.json';
const visualFile = getArg('visual');
const runUrl = getArg('run-url') || '';
const prNumber = getArg('pr-number') || '';
const storybookUrl = getArg('storybook-url') || '';
const sandboxUrl = getArg('sandbox-url') || '';

// Read analysis results
let analysis = { newComponents: [], modifiedComponents: [], componentStats: {}, totalBundle: {} };
let a11yReport = { components: {} };
try {
  analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
} catch (e) {
  console.error('Warning: Could not read analysis file:', e.message);
}

try {
  a11yReport = JSON.parse(fs.readFileSync(a11yFile, 'utf8'));
} catch (e) {
  console.error('Warning: Could not read a11y report:', e.message);
}

// Build a Storybook deep link URL for a component
// Story titles like "Core/XDSButton" become path "/docs/core-xdsbutton--docs"
function getStorybookLink(storybookBaseUrl, storyTitle) {
  if (!storybookBaseUrl || !storyTitle) return null;
  // storyTitle may be a single string or an array when multiple story files match
  const title = Array.isArray(storyTitle) ? storyTitle[0] : storyTitle;
  if (!title) return null;
  // Storybook converts "Core/XDSButton" to "core-xdsbutton" as the story ID
  // prefix. Story ids only ever contain [a-z0-9_-]; the title came from a
  // report file, so drop anything outside that alphabet before it lands in
  // the href.
  const storyPath = title.toLowerCase().replace(/\//g, '-').replace(/[^a-z0-9_-]/g, '');
  return `${storybookBaseUrl}?path=/docs/${storyPath}--docs`;
}

// Build an external link that opens in a new tab
function extLink(text, url) {
  return `<a href="${String(url).replace(/"/g, '%22')}" target="_blank" rel="noopener noreferrer">${text}</a>`;
}

// Build component stats section
let componentSection = '';
if (analysis.newComponents && analysis.newComponents.length > 0) {
  componentSection += `### New Components\n\n`;
  for (const comp of analysis.newComponents) {
    const stats = analysis.componentStats[comp] || {};
    const sbLink = getStorybookLink(storybookUrl, stats.storyTitle);
    const sbBadge = sbLink ? ` · ${extLink('View in Storybook', sbLink)}` : '';
    const pkgBadge = stats.package ? ` <sub>(${inline(stats.package)})</sub>` : '';
    componentSection += `<details>\n<summary><strong>${inline(comp)}</strong>${pkgBadge}${sbBadge}</summary>\n\n`;
    componentSection += `| Metric | Value |\n|--------|-------|\n`;
    componentSection += `| Bundle Size (ESM) | ${inline(stats.esmSize) || 'N/A'} |\n`;
    componentSection += `| Bundle Size (CJS) | ${inline(stats.cjsSize) || 'N/A'} |\n`;
    componentSection += `| Lines of Code | ${inline(stats.linesOfCode) || 'N/A'} |\n`;
    componentSection += `| Source Files | ${inline(stats.fileCount) || 'N/A'} |\n`;
    componentSection += `| Complexity | ${inline(stats.complexityRating) || 'N/A'} (${num(stats.complexity)}) |\n`;
    componentSection += `| Exports | ${stats.exports?.map(inline).join(', ') || 'N/A'} |\n`;
    componentSection += `| Props Count | ${inline(stats.propsCount) || 'N/A'} |\n`;
    componentSection += `| Has Tests | ${stats.hasTests ? 'Yes' : 'No'} |\n`;
    componentSection += `| Has Stories | ${stats.hasStories ? 'Yes' : 'No'} |\n`;
    componentSection += `\n</details>\n\n`;
  }
}

if (analysis.modifiedComponents && analysis.modifiedComponents.length > 0) {
  componentSection += `### Modified Components\n\n`;
  for (const comp of analysis.modifiedComponents) {
    const stats = analysis.componentStats[comp] || {};
    const baseStats = analysis.baseComponentStats?.[comp] || {};
    const sbLink = getStorybookLink(storybookUrl, stats.storyTitle);
    const sbBadge = sbLink ? ` · ${extLink('View in Storybook', sbLink)}` : '';

    // Check if this modified directory has new exports
    const newExports = analysis.newExports || [];
    const compExports = stats.exports || [];
    const newInComp = compExports.filter(e => newExports.includes(e));
    const newBadge = newInComp.length > 0 ? ` · 🆕 ${newInComp.map(inline).join(', ')}` : '';
    const pkgBadge = stats.package ? ` <sub>(${inline(stats.package)})</sub>` : '';

    componentSection += `<details>\n<summary><strong>${inline(comp)}</strong>${pkgBadge}${sbBadge}${newBadge}</summary>\n\n`;
    componentSection += `| Metric | Before | After | Delta |\n|--------|--------|-------|-------|\n`;

    const esmDelta = Number.isFinite(Number(stats.esmBytes)) && Number.isFinite(Number(baseStats.esmBytes))
      ? (Number(stats.esmBytes) - Number(baseStats.esmBytes))
      : null;
    const esmDeltaStr = esmDelta !== null
      ? (esmDelta > 0 ? `+${esmDelta}B` : `${esmDelta}B`)
      : 'N/A';

    componentSection += `| Bundle Size (ESM) | ${inline(baseStats.esmSize) || 'N/A'} | ${inline(stats.esmSize) || 'N/A'} | ${esmDeltaStr} |\n`;
    componentSection += `| Lines of Code | ${inline(baseStats.linesOfCode) || 'N/A'} | ${inline(stats.linesOfCode) || 'N/A'} | - |\n`;
    componentSection += `| Complexity | ${inline(baseStats.complexityRating) || 'N/A'} | ${inline(stats.complexityRating) || 'N/A'} (${num(stats.complexity)}) | - |\n`;
    componentSection += `\n</details>\n\n`;
  }
}

// Build accessibility section using shared module
const a11ySection = buildA11ySection(a11yReport);

// Visual regression is optional: the pr-visual job is skipped when no
// components changed, and absent entirely on older runs.
let visualVerdict = null;
if (visualFile) {
  try {
    visualVerdict = JSON.parse(fs.readFileSync(visualFile, 'utf8'));
  } catch {
    visualVerdict = null;
  }
}
const visualSection = buildVisualSection(
  visualVerdict,
  getArg('visual-report-url'),
  getArg('visual-image-url'),
);

// Build bundle size section — one row per package the PR actually touched.
let bundleSection = '### Bundle Size Summary\n\n';
// Prefer the multi-package list; fall back to the legacy single-core shape so
// an older analysis.json still renders.
const bundlePackages =
  analysis.bundlePackages && analysis.bundlePackages.length > 0
    ? analysis.bundlePackages
    : analysis.totalBundle
      ? [{ package: '@astryxdesign/core', ...analysis.totalBundle }]
      : [];

if (bundlePackages.length > 0) {
  bundleSection += `| Package | Size (ESM) | Size (CJS) | Gzipped |\n`;
  bundleSection += `|---------|------------|------------|----------|\n`;
  for (const b of bundlePackages) {
    bundleSection += `| ${inline(b.package)} | ${inline(b.esmSize) || 'N/A'} | ${inline(b.cjsSize) || 'N/A'} | ${inline(b.gzipSize) || 'N/A'} |\n`;
  }
  bundleSection += `\n`;
} else {
  bundleSection += '_No component packages changed._\n\n';
}

if (analysis.bundleDelta) {
  const delta = num(analysis.bundleDelta);
  const direction = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'unchanged';
  bundleSection += `**Bundle size ${direction}:** ${delta > 0 ? '+' : ''}${delta} bytes\n\n`;
}

// Build storybook link section
let storybookSection = '';
if (storybookUrl) {
  storybookSection = `### 📚 Storybook Preview

**${extLink('View Storybook for this PR', storybookUrl)}**
_GitHub Pages may take up to a minute to hydrate after deploy._

`;
}

// Build sandbox link section
let sandboxSection = '';
if (sandboxUrl) {
  sandboxSection = `### 🧪 Sandbox Preview

**${extLink('View Sandbox for this PR', sandboxUrl)}**
_GitHub Pages may take up to a minute to hydrate after deploy._

`;
}

// Build footer with links
let footerLinks = [];
if (storybookUrl) footerLinks.push(extLink('Storybook', storybookUrl));
if (sandboxUrl) footerLinks.push(extLink('Sandbox', sandboxUrl));
if (runUrl) footerLinks.push(extLink('View full report', runUrl));
const footerLinksStr = footerLinks.length > 0 ? ` | ${footerLinks.join(' | ')}` : '';

// A one-line caveat shown when the analysis fell back to the approximate
// two-dot diff. The file list may include base-only churn and, worse, may
// miss a component the PR actually changed (if that change also exists on
// base), so consumers should not treat the component list as exact.
const diffModeCaveat =
  analysis.diffMode === 'two-dot'
    ? '> ⚠️ **Approximate analysis** - the diff could not be resolved to a merge base, so a two-dot fallback was used. The component list may include base-only changes or miss a component whose change also landed on base.\n\n'
    : '';

// Build the full comment
const body = `## PR Analysis Report

${diffModeCaveat}${storybookSection}${sandboxSection}${componentSection || '_No new or modified components detected._\n\n'}
${bundleSection}
${a11ySection}
${visualSection}---

<sub>Generated by PR Enrichment workflow${footerLinksStr}</sub>
`;

// Output to stdout
console.log(body);
