#!/usr/bin/env node

/**
 * @description Generates and posts PR comment with analysis results
 * @input --analysis <file> --a11y <file> --screenshots <file> --run-url <url>
 * @output Formatted markdown comment body to stdout
 */

const fs = require('fs');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const analysisFile = getArg('analysis') || 'analysis.json';
const a11yFile = getArg('a11y') || 'a11y-report.json';
const screenshotsFile = getArg('screenshots') || 'screenshots/screenshots.json';
const runUrl = getArg('run-url') || '';

// Read analysis results
let analysis = { newComponents: [], modifiedComponents: [], componentStats: {}, totalBundle: {} };
let a11yReport = { components: {} };
let screenshotsData = { screenshots: [], storybookUrl: null };

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

try {
  screenshotsData = JSON.parse(fs.readFileSync(screenshotsFile, 'utf8'));
} catch (e) {
  console.error('Warning: Could not read screenshots manifest:', e.message);
}

// Build component stats section
let componentSection = '';
if (analysis.newComponents && analysis.newComponents.length > 0) {
  componentSection += `### New Components\n\n`;
  for (const comp of analysis.newComponents) {
    const stats = analysis.componentStats[comp] || {};
    componentSection += `<details>\n<summary><strong>${comp}</strong></summary>\n\n`;
    componentSection += `| Metric | Value |\n|--------|-------|\n`;
    componentSection += `| Bundle Size (ESM) | ${stats.esmSize || 'N/A'} |\n`;
    componentSection += `| Bundle Size (CJS) | ${stats.cjsSize || 'N/A'} |\n`;
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
    componentSection += `<details>\n<summary><strong>${comp}</strong></summary>\n\n`;
    componentSection += `| Metric | Before | After | Delta |\n|--------|--------|-------|-------|\n`;

    const esmDelta = stats.esmBytes && baseStats.esmBytes
      ? (stats.esmBytes - baseStats.esmBytes)
      : null;
    const esmDeltaStr = esmDelta !== null
      ? (esmDelta > 0 ? `+${esmDelta}B` : `${esmDelta}B`)
      : 'N/A';

    componentSection += `| Bundle Size (ESM) | ${baseStats.esmSize || 'N/A'} | ${stats.esmSize || 'N/A'} | ${esmDeltaStr} |\n`;
    componentSection += `\n</details>\n\n`;
  }
}

// Build accessibility section
let a11ySection = '### Accessibility Audit\n\n';
const totalViolations = Object.values(a11yReport.components || {})
  .reduce((sum, comp) => sum + (comp.violations?.length || 0), 0);

if (totalViolations === 0) {
  a11ySection += '**Status:** No accessibility violations detected.\n\n';
} else {
  a11ySection += `**Status:** ${totalViolations} accessibility violation(s) found.\n\n`;
  for (const [compName, compReport] of Object.entries(a11yReport.components || {})) {
    if (compReport.violations?.length > 0) {
      a11ySection += `<details>\n<summary><strong>${compName}</strong> - ${compReport.violations.length} issue(s)</summary>\n\n`;
      for (const violation of compReport.violations) {
        a11ySection += `- **${violation.impact}**: ${violation.description}\n`;
        a11ySection += `  - Rule: \`${violation.id}\`\n`;
      }
      a11ySection += `\n</details>\n\n`;
    }
  }
}

// Build bundle size section
let bundleSection = '### Bundle Size Summary\n\n';
bundleSection += `| Package | Size (ESM) | Size (CJS) | Gzipped |\n`;
bundleSection += `|---------|------------|------------|----------|\n`;
bundleSection += `| @xds/core | ${analysis.totalBundle?.esmSize || 'N/A'} | ${analysis.totalBundle?.cjsSize || 'N/A'} | ${analysis.totalBundle?.gzipSize || 'N/A'} |\n\n`;

if (analysis.bundleDelta) {
  const delta = analysis.bundleDelta;
  const direction = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'unchanged';
  bundleSection += `**Bundle size ${direction}:** ${delta > 0 ? '+' : ''}${delta} bytes\n\n`;
}

// Build screenshots/previews section with Storybook links
let screenshotSection = '';
const hasAffectedComponents = (analysis.newComponents?.length > 0) || (analysis.modifiedComponents?.length > 0);
const screenshots = screenshotsData.screenshots || [];

if (hasAffectedComponents) {
  screenshotSection = `### Component Previews\n\n`;

  if (screenshots.length > 0) {
    // Group screenshots by component title
    const byComponent = {};
    for (const shot of screenshots) {
      const compName = shot.title?.split('/').pop() || shot.title || 'Unknown';
      if (!byComponent[compName]) {
        byComponent[compName] = [];
      }
      byComponent[compName].push(shot);
    }

    screenshotSection += `| Component | Story | Storybook Link |\n`;
    screenshotSection += `|-----------|-------|----------------|\n`;

    for (const [compName, shots] of Object.entries(byComponent)) {
      for (const shot of shots) {
        const storyName = shot.name || shot.storyId;
        const link = shot.storybookLink
          ? `[View in Storybook](${shot.storybookLink})`
          : 'N/A';
        screenshotSection += `| ${compName} | ${storyName} | ${link} |\n`;
      }
    }

    screenshotSection += `\n`;
  }

  if (runUrl) {
    screenshotSection += `Screenshots are available in the [workflow artifacts](${runUrl}).\n\n`;
  }
}

// Build the full comment
const body = `## PR Analysis Report

${componentSection || '_No new or modified components detected._\n\n'}
${bundleSection}
${a11ySection}
${screenshotSection}
---

<sub>Generated by PR Enrichment workflow${runUrl ? ` | [View full report](${runUrl})` : ''}</sub>
`;

// Output to stdout
console.log(body);
