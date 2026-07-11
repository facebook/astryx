#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @description Generates and posts PR comment with analysis results
 * @input --analysis <file> --a11y <file> --storybook-url <url> --run-url <url>
 * @output Formatted markdown comment body to stdout
 */

const fs = require('node:fs');
const { buildA11ySection } = require('./lib/a11y-format');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const analysisFile = getArg('analysis') || 'analysis.json';
const a11yFile = getArg('a11y') || 'a11y-report.json';
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
  // Storybook converts "Core/XDSButton" to "core-xdsbutton" as the story ID prefix
  const storyPath = title.toLowerCase().replace(/\//g, '-');
  return `${storybookBaseUrl}?path=/docs/${storyPath}--docs`;
}

// Build an external link that opens in a new tab
function extLink(text, url) {
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
}

// Build component stats section
let componentSection = '';
if (analysis.newComponents && analysis.newComponents.length > 0) {
  componentSection += `### New Components\n\n`;
  for (const comp of analysis.newComponents) {
    const stats = analysis.componentStats[comp] || {};
    const sbLink = getStorybookLink(storybookUrl, stats.storyTitle);
    const sbBadge = sbLink ? ` · ${extLink('View in Storybook', sbLink)}` : '';
    componentSection += `<details>\n<summary><strong>${comp}</strong>${sbBadge}</summary>\n\n`;
    componentSection += `| Metric | Value |\n|--------|-------|\n`;
    componentSection += `| Bundle Size (ESM) | ${stats.esmSize || 'N/A'} |\n`;
    componentSection += `| Bundle Size (CJS) | ${stats.cjsSize || 'N/A'} |\n`;
    componentSection += `| Lines of Code | ${stats.linesOfCode || 'N/A'} |\n`;
    componentSection += `| Source Files | ${stats.fileCount || 'N/A'} |\n`;
    componentSection += `| Complexity | ${stats.complexityRating || 'N/A'} (${stats.complexity || 0}) |\n`;
    componentSection += `| Exports | ${stats.exports?.join(', ') || 'N/A'} |\n`;
    componentSection += `| Props Count | ${stats.propsCount || 'N/A'} |\n`;
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
    const newBadge = newInComp.length > 0 ? ` · 🆕 ${newInComp.join(', ')}` : '';

    componentSection += `<details>\n<summary><strong>${comp}</strong>${sbBadge}${newBadge}</summary>\n\n`;
    componentSection += `| Metric | Before | After | Delta |\n|--------|--------|-------|-------|\n`;

    const esmDelta = stats.esmBytes && baseStats.esmBytes
      ? (stats.esmBytes - baseStats.esmBytes)
      : null;
    const esmDeltaStr = esmDelta !== null
      ? (esmDelta > 0 ? `+${esmDelta}B` : `${esmDelta}B`)
      : 'N/A';

    componentSection += `| Bundle Size (ESM) | ${baseStats.esmSize || 'N/A'} | ${stats.esmSize || 'N/A'} | ${esmDeltaStr} |\n`;
    componentSection += `| Lines of Code | ${baseStats.linesOfCode || 'N/A'} | ${stats.linesOfCode || 'N/A'} | - |\n`;
    componentSection += `| Complexity | ${baseStats.complexityRating || 'N/A'} | ${stats.complexityRating || 'N/A'} (${stats.complexity || 0}) | - |\n`;
    componentSection += `\n</details>\n\n`;
  }
}

// Build accessibility section using shared module
const a11ySection = buildA11ySection(a11yReport);

// Build bundle size section
let bundleSection = '### Bundle Size Summary\n\n';
bundleSection += `| Package | Size (ESM) | Size (CJS) | Gzipped |\n`;
bundleSection += `|---------|------------|------------|----------|\n`;
bundleSection += `| @astryxdesign/core | ${analysis.totalBundle?.esmSize || 'N/A'} | ${analysis.totalBundle?.cjsSize || 'N/A'} | ${analysis.totalBundle?.gzipSize || 'N/A'} |\n\n`;

if (analysis.bundleDelta) {
  const delta = analysis.bundleDelta;
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

// Build the full comment
const body = `## PR Analysis Report

${storybookSection}${sandboxSection}${componentSection || '_No new or modified components detected._\n\n'}
${bundleSection}
${a11ySection}
---

<sub>Generated by PR Enrichment workflow${footerLinksStr}</sub>
`;

// Output to stdout
console.log(body);
