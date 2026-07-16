#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * Test script to verify PR enrichment output with mock data
 */

const fs = require('node:fs');
const path = require('node:path');
const { buildA11ySection } = require('./lib/a11y-format');

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
    },
    TextInput: {
      esmSize: '2.9KB',
      esmBytes: 2970,
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

// Mock a11y report — includes new axe-core fields (helpUrl, tags, storyCount, etc.)
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
          help: 'Form elements must have labels',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label',
          tags: ['cat.forms', 'wcag2a', 'wcag412', 'TTv5', 'TT6.a'],
          storyCount: 2,
          totalNodes: 3,
          stories: ['Default', 'WithSeconds'],
          nodes: [
            { html: '<input type="text" class="astryx-time-input">', target: ['.astryx-time-input'] },
          ],
        },
        {
          id: 'color-contrast',
          impact: 'serious',
          description: 'Elements must meet minimum color contrast ratio thresholds',
          help: 'Elements must have sufficient color contrast',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast',
          tags: ['cat.color', 'wcag2aa', 'wcag143'],
          storyCount: 1,
          totalNodes: 2,
          stories: ['Disabled'],
          nodes: [
            { html: '<span class="astryx-time-label">Hours</span>', target: ['.astryx-time-label'] },
          ],
        },
      ],
      storyDetails: [],
    },
    Button: {
      storiesAudited: 5,
      violations: [
        {
          id: 'button-name',
          impact: 'critical',
          description: 'Buttons must have discernible text',
          help: 'Buttons must have discernible text',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/button-name',
          tags: ['cat.name-role-value', 'wcag2a', 'wcag412'],
          storyCount: 3,
          totalNodes: 5,
          stories: ['IconOnly', 'Loading', 'Minimal'],
          nodes: [
            { html: '<button class="astryx-button">', target: ['.astryx-button'] },
          ],
        },
      ],
      storyDetails: [],
    },
  },
  summary: {
    componentsAudited: 3,
    totalViolations: 4,
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

// Build the full comment
const body = `## PR Analysis Report

${componentSection || '_No new or modified components detected._\n\n'}
${bundleSection}
${a11ySection}
---

<sub>Generated by PR Enrichment workflow${runUrl ? ` | [View full report](${runUrl})` : ''}</sub>
`;

console.log(body);
