#!/usr/bin/env node

/**
 * Test script to verify PR enrichment output with mock data
 */

const fs = require('fs');
const path = require('path');

// Mock analysis data
const mockAnalysis = {
  newComponents: ['DatePicker', 'TimePicker'],
  modifiedComponents: ['Button', 'TextInput'],
  componentStats: {
    DatePicker: {
      esmSize: '4.2KB',
      esmBytes: 4300,
      cjsSize: '4.8KB',
      cjsBytes: 4900,
      linesOfCode: 320,
      fileCount: 4,
      complexity: 12,
      complexityRating: 'Medium',
      exports: ['XDSDatePicker', 'DatePickerProps'],
      propsCount: 12,
      hasTests: true,
      hasStories: true,
    },
    TimePicker: {
      esmSize: '3.1KB',
      esmBytes: 3200,
      cjsSize: '3.5KB',
      cjsBytes: 3600,
      linesOfCode: 180,
      fileCount: 3,
      complexity: 8,
      complexityRating: 'Low',
      exports: ['XDSTimePicker'],
      propsCount: 8,
      hasTests: false,
      hasStories: true,
    },
    Button: {
      esmSize: '2.4KB',
      esmBytes: 2450,
      cjsSize: '2.8KB',
      cjsBytes: 2870,
      linesOfCode: 150,
      fileCount: 2,
      complexity: 6,
      complexityRating: 'Low',
      exports: ['XDSButton', 'ButtonProps'],
      propsCount: 15,
      hasTests: true,
      hasStories: true,
    },
    TextInput: {
      esmSize: '3.0KB',
      esmBytes: 3100,
      cjsSize: '3.4KB',
      cjsBytes: 3500,
      linesOfCode: 210,
      fileCount: 3,
      complexity: 31,
      complexityRating: 'Very High',
      exports: ['XDSTextInput'],
      propsCount: 20,
      hasTests: true,
      hasStories: true,
    },
  },
  baseComponentStats: {
    Button: {
      esmSize: '2.2KB',
      esmBytes: 2250,
      linesOfCode: 130,
      complexityRating: 'Low',
    },
    TextInput: {
      esmSize: '2.9KB',
      esmBytes: 2970,
      linesOfCode: 190,
      complexityRating: 'High',
    },
  },
  totalBundle: {
    esmSize: '45.2KB',
    esmBytes: 46280,
    cjsSize: '52.1KB',
    cjsBytes: 53350,
    gzipSize: '12.4KB',
  },
  bundleDelta: 850,
  analyzedAt: new Date().toISOString(),
};

// Mock a11y report
const mockA11y = {
  components: {
    DatePicker: {
      storiesAudited: 3,
      violations: [],
      storyDetails: [],
    },
    TimePicker: {
      storiesAudited: 2,
      violations: [
        {
          id: 'label',
          impact: 'critical',
          description: 'Form elements must have labels',
        },
      ],
      storyDetails: [],
    },
  },
  summary: {
    componentsAudited: 2,
    totalViolations: 1,
    auditedAt: new Date().toISOString(),
  },
};

// Write mock files
const tmpDir = '/tmp/pr-enrichment-test';
fs.mkdirSync(tmpDir, { recursive: true });

fs.writeFileSync(
  path.join(tmpDir, 'analysis.json'),
  JSON.stringify(mockAnalysis, null, 2)
);

fs.writeFileSync(
  path.join(tmpDir, 'a11y-report.json'),
  JSON.stringify(mockA11y, null, 2)
);

console.log('Mock data written to:', tmpDir);
console.log('\nTo test the comment generator, run:');
console.log(`  node .github/scripts/generate-pr-comment.js \\`);
console.log(`    --analysis ${tmpDir}/analysis.json \\`);
console.log(`    --a11y ${tmpDir}/a11y-report.json \\`);
console.log(`    --run-url "https://github.com/example/xds/actions/runs/12345"`);
console.log('\n--- Sample Output ---\n');

// Now run the generator inline to show output
const analysis = mockAnalysis;
const a11yReport = mockA11y;
const runUrl = 'https://github.com/example/xds/actions/runs/12345';
const storybookUrl = 'https://xds-storybook.example.com';

// --- Emoji threshold helpers (synced with generate-pr-comment.js) ---

const THRESHOLDS = {
  bundleSize: { low: 1024, high: 5120 },
  linesOfCode: { low: 100, high: 500 },
  propsCount: { low: 5, high: 15 },
};

function getBundleSizeEmoji(bytes) {
  if (bytes == null) return '';
  if (bytes < THRESHOLDS.bundleSize.low) return ' ⬇️';
  if (bytes <= THRESHOLDS.bundleSize.high) return ' ➡️';
  return ' ⬆️';
}

function getLOCEmoji(loc) {
  if (loc == null) return '';
  if (loc < THRESHOLDS.linesOfCode.low) return ' ⬇️';
  if (loc <= THRESHOLDS.linesOfCode.high) return ' ➡️';
  return ' ⬆️';
}

function getComplexityEmoji(rating) {
  if (!rating) return '';
  const lower = rating.toLowerCase();
  if (lower === 'low') return ' ⬇️';
  if (lower === 'medium') return ' ➡️';
  return ' ⬆️';
}

function getPropsEmoji(count) {
  if (count == null) return '';
  if (count < THRESHOLDS.propsCount.low) return ' ⬇️';
  if (count <= THRESHOLDS.propsCount.high) return ' ➡️';
  return ' ⬆️';
}

function getBoolEmoji(value) {
  return value ? ' ✅' : ' ❌';
}

function getDeltaEmoji(delta) {
  if (delta == null) return '';
  if (delta > THRESHOLDS.bundleSize.high) return ' ⬆️';
  if (delta > THRESHOLDS.bundleSize.low) return ' ➡️';
  if (delta < 0) return ' ⬇️';
  return ' ➡️';
}

function getComponentHealthEmoji(stats) {
  if (!stats) return '';
  let score = 0;
  let factors = 0;
  if (stats.esmBytes != null) {
    factors++;
    if (stats.esmBytes < THRESHOLDS.bundleSize.low) score += 2;
    else if (stats.esmBytes <= THRESHOLDS.bundleSize.high) score += 1;
  }
  if (stats.complexityRating) {
    factors++;
    const lower = stats.complexityRating.toLowerCase();
    if (lower === 'low') score += 2;
    else if (lower === 'medium') score += 1;
  }
  if (stats.hasTests != null) { factors++; if (stats.hasTests) score += 2; }
  if (stats.hasStories != null) { factors++; if (stats.hasStories) score += 2; }
  if (factors === 0) return '';
  const ratio = score / (factors * 2);
  if (ratio >= 0.75) return ' 🟢';
  if (ratio >= 0.4) return ' 🟡';
  return ' 🔴';
}

// Build component stats section
let componentSection = '';
if (analysis.newComponents && analysis.newComponents.length > 0) {
  componentSection += `### New Components\n\n`;
  for (const comp of analysis.newComponents) {
    const stats = analysis.componentStats[comp] || {};
    const healthEmoji = getComponentHealthEmoji(stats);
    componentSection += `<details>\n<summary><strong>${comp}</strong>${healthEmoji}</summary>\n\n`;
    componentSection += `| Metric | Value |\n|--------|-------|\n`;
    componentSection += `| Bundle Size (ESM) | ${stats.esmSize || 'N/A'}${getBundleSizeEmoji(stats.esmBytes)} |\n`;
    componentSection += `| Bundle Size (CJS) | ${stats.cjsSize || 'N/A'}${getBundleSizeEmoji(stats.cjsBytes)} |\n`;
    componentSection += `| Lines of Code | ${stats.linesOfCode || 'N/A'}${getLOCEmoji(stats.linesOfCode)} |\n`;
    componentSection += `| Source Files | ${stats.fileCount || 'N/A'} |\n`;
    componentSection += `| Complexity | ${stats.complexityRating || 'N/A'} (${stats.complexity || 0})${getComplexityEmoji(stats.complexityRating)} |\n`;
    componentSection += `| Exports | ${stats.exports?.join(', ') || 'N/A'} |\n`;
    componentSection += `| Props Count | ${stats.propsCount || 'N/A'}${getPropsEmoji(stats.propsCount)} |\n`;
    componentSection += `| Has Tests | ${stats.hasTests ? 'Yes' : 'No'}${getBoolEmoji(stats.hasTests)} |\n`;
    componentSection += `| Has Stories | ${stats.hasStories ? 'Yes' : 'No'}${getBoolEmoji(stats.hasStories)} |\n`;
    componentSection += `\n</details>\n\n`;
  }
}

if (analysis.modifiedComponents && analysis.modifiedComponents.length > 0) {
  componentSection += `### Modified Components\n\n`;
  for (const comp of analysis.modifiedComponents) {
    const stats = analysis.componentStats[comp] || {};
    const baseStats = analysis.baseComponentStats?.[comp] || {};
    const healthEmoji = getComponentHealthEmoji(stats);
    componentSection += `<details>\n<summary><strong>${comp}</strong>${healthEmoji}</summary>\n\n`;
    componentSection += `| Metric | Before | After | Delta |\n|--------|--------|-------|-------|\n`;

    const esmDelta = stats.esmBytes && baseStats.esmBytes
      ? (stats.esmBytes - baseStats.esmBytes)
      : null;
    const esmDeltaStr = esmDelta !== null
      ? (esmDelta > 0 ? `+${esmDelta}B` : `${esmDelta}B`) + getDeltaEmoji(esmDelta)
      : 'N/A';

    componentSection += `| Bundle Size (ESM) | ${baseStats.esmSize || 'N/A'} | ${stats.esmSize || 'N/A'}${getBundleSizeEmoji(stats.esmBytes)} | ${esmDeltaStr} |\n`;
    componentSection += `| Lines of Code | ${baseStats.linesOfCode || 'N/A'} | ${stats.linesOfCode || 'N/A'}${getLOCEmoji(stats.linesOfCode)} | - |\n`;
    componentSection += `| Complexity | ${baseStats.complexityRating || 'N/A'} | ${stats.complexityRating || 'N/A'} (${stats.complexity || 0})${getComplexityEmoji(stats.complexityRating)} | - |\n`;
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
  const deltaEmoji = delta > 0 ? ' ⬆️' : delta < 0 ? ' ⬇️' : ' ➡️';
  bundleSection += `**Bundle size ${direction}:**${deltaEmoji} ${delta > 0 ? '+' : ''}${delta} bytes\n\n`;
}

// Build screenshots section
let screenshotSection = '';
const hasAffectedComponents = (analysis.newComponents?.length > 0) || (analysis.modifiedComponents?.length > 0);
if (hasAffectedComponents && runUrl) {
  screenshotSection = `### Component Previews\n\n`;
  screenshotSection += `Component screenshots are available in the [workflow artifacts](${runUrl}).\n\n`;
}

// Build storybook link section
let storybookSection = '';
if (storybookUrl) {
  storybookSection = `### 📚 Storybook Preview\n\n**[View Storybook for this PR](${storybookUrl})**\n\n`;
}

// Build footer with links
let footerLinks = [];
if (storybookUrl) footerLinks.push(`[Storybook](${storybookUrl})`);
if (runUrl) footerLinks.push(`[View full report](${runUrl})`);
const footerLinksStr = footerLinks.length > 0 ? ` | ${footerLinks.join(' | ')}` : '';

// Build the full comment
const body = `## PR Analysis Report

${storybookSection}${componentSection || '_No new or modified components detected._\n\n'}
${bundleSection}
${a11ySection}
${screenshotSection}
---

<sub>Generated by PR Enrichment workflow${footerLinksStr}</sub>
`;

console.log(body);
