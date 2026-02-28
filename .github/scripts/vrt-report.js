#!/usr/bin/env node

/**
 * Process Playwright VRT results and generate a PR comment.
 *
 * Reads the Playwright JSON report and categorizes results into:
 * - new: stories with no baseline (auto-generated on merge)
 * - passed: screenshots match baselines
 * - changed: screenshots differ from baselines
 * - errors: stories that failed to render
 *
 * Usage: node vrt-report.js --results <playwright-results.json> --snapshots-dir <dir>
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const resultsFile = getArg('results');
const snapshotsDir = getArg('snapshots-dir');
const runUrl = getArg('run-url') || '';
const diffArtifactUrl = getArg('diff-artifact-url') || '';

// If no results file, generate report from test output
if (!resultsFile) {
  console.error('Usage: node vrt-report.js --results <file> --snapshots-dir <dir>');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

const categories = {
  passed: [],
  changed: [],
  newStory: [],
  errors: [],
};

for (const suite of results.suites || []) {
  for (const spec of suite.specs ||) {
    const title = spec.title;
    const test = spec.tests?.[0];
    const result = test?.results?.[0];

    if (!result) continue;

    if (result.status === 'passed') {
      categories.passed.push(title);
    } else if (result.status === 'failed') {
      // Check if it's a "missing snapshot" error vs actual diff
      const errorMsg = result.error?.message || '';
      if (errorMsg.includes('A snapshot doesn\'t exist') ||
          errorMsg.includes('missing snapshot')) {
        categories.newStory.push(title);
      } else if (errorMsg.includes('Screenshot comparison failed')) {
        categories.changed.push(title);
      } else {
        categories.errors.push({ title, error: errorMsg.slice(0, 200) });
      }
    }
  }
}

// Also handle flat specs (non-nested)
for (const spec of results.specs || []) {
  const title = spec.title;
  const test = spec.tests?.[0];
  const result = test?.results?.[0];

  if (!result) continue;

  if (result.status === 'passed') {
    categories.passed.push(title);
  } else if (result.status === 'failed') {
    const errorMsg = result.error?.message || '';
    if (errorMsg.includes('A snapshot doesn\'t exist') ||
        errorMsg.includes('missing snapshot')) {
      categories.newStory.push(title);
    } else if (errorMsg.includes('Screenshot comparison failed')) {
      categories.changed.push(title);
    } else {
      categories.errors.push({ title, error: errorMsg.slice(0, 200) });
    }
  }
}

// Generate markdown report
const lines = [];

const total = categories.passed.length + categories.changed.length +
              categories.newStory.length + categories.errors.length;

if (categories.changed.length === 0 && categories.errors.length === 0) {
  lines.push('### ✅ Visual Regression — All Good');
  lines.push('');
  lines.push(`${categories.passed.length} screenshots match baselines.`);
  if (categories.newStory.length > 0) {
    lines.push(`${categories.newStory.length} new stories will get baselines when merged.`);
  }
} else {
  lines.push('### ⚠️ Visual Regression — Changes Detected');
  lines.push('');
  lines.push(`Tested ${total} stories against baselines.`);
}

if (categories.changed.length > 0) {
  lines.push('');
  lines.push(`#### 🔄 Changed (${categories.changed.length})`);
  lines.push('');
  lines.push('These stories look different from their baselines. Review the diffs to confirm the changes are intentional.');
  lines.push('');
  for (const title of categories.changed) {
    lines.push(`- \`${title}\``);
  }
  if (diffArtifactUrl) {
    lines.push('');
    lines.push(`[📸 View diff images](${diffArtifactUrl})`);
  }
  lines.push('');
  lines.push('> To accept these changes, comment `/update-baselines` on this PR.');
}

if (categories.newStory.length > 0) {
  lines.push('');
  lines.push(`#### 🆕 New Stories (${categories.newStory.length})`);
  lines.push('');
  lines.push('These stories don\'t have baselines yet. Baselines will be auto-generated when this PR merges.');
  lines.push('');
  for (const title of categories.newStory) {
    lines.push(`- \`${title}\``);
  }
}

if (categories.errors.length > 0) {
  lines.push('');
  lines.push(`#### ❌ Errors (${categories.errors.length})`);
  lines.push('');
  for (const { title, error } of categories.errors) {
    lines.push(`- \`${title}\`: ${error}`);
  }
}

if (categories.passed.length > 0 && (categories.changed.length > 0 || categories.newStory.length > 0)) {
  lines.push('');
  lines.push(`<details><summary>✅ Passed (${categories.passed.length})</summary>`);
  lines.push('');
  for (const title of categories.passed) {
    lines.push(`- \`${title}\``);
  }
  lines.push('</details>');
}

console.log(lines.join('\n'));
