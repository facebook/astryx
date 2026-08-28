#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @description Runs accessibility audits on component stories using axe-core
 * @input --storybook-dir <path> --output <file> --components <comma-separated>
 *   --baseline <path> (compare violations against a checked-in baseline)
 *   --fail-on-new (exit 1 when violations not present in the baseline exist)
 *   --update-baseline (rewrite the baseline file from this run's report)
 * @output JSON report with accessibility violations; with --baseline, a gate
 *   summary (new / baselined / resolved) on stdout and a non-zero exit code
 *   when --fail-on-new finds regressions. Diff logic lives in
 *   lib/a11y-baseline.js. Pages are scanned with animations held at their end
 *   state.
 */

const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {
  buildBaseline,
  diffAgainstBaseline,
  formatDiffSummary,
} = require('./lib/a11y-baseline');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const storybookDir = getArg('storybook-dir') || 'apps/storybook/dist';
const outputFile = getArg('output') || 'a11y-report.json';
const componentsArg = getArg('components');
const components = (componentsArg || '').split(',').filter(Boolean);
// --components present but EMPTY means the caller derived an explicit empty
// audit set (pr-a11y on a PR whose core/src changes map to no component —
// e.g. a shared test file). Audit nothing and pass. Only an ABSENT flag
// means "all stories" (the a11y-weekly contract).
const emptyComponentSet = componentsArg !== null && components.length === 0;
const baselineFile = getArg('baseline');
const failOnNew = hasFlag('fail-on-new');
const updateBaseline = hasFlag('update-baseline');

// Held at the end state before every scan, the way the visual gate does it
// (visual-gate/lib/capture.mjs). axe blends an element's opacity into the
// foreground color, so a scan that lands mid-transition measures a frame no
// user is expected to read: Markdown's streaming fade reported contrast of
// 1.63 on text whose resting color is #171717, on ~1 run in 6.
const FREEZE_CSS = `
*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}
`;

// Rules to disable — these are Storybook-context false positives, not component issues
const DISABLED_RULES = [
  'html-has-lang',        // Storybook controls <html>, not the component
  'document-title',       // iframe has no <title>, irrelevant for components
  'landmark-one-main',    // component stories are fragments, not full pages
  'page-has-heading-one', // same — not a full page
  'region',               // content doesn't need to be in landmarks in story isolation
];

// Simple static file server
function createServer(dir, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(dir, req.url === '/' ? 'index.html' : req.url);
      filePath = filePath.split('?')[0];

      // Prevent path traversal — ensure resolved path stays within served directory
      const resolved = path.resolve(filePath);
      if (!resolved.startsWith(path.resolve(dir))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      const ext = path.extname(filePath);
      const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
      };

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        res.end(data);
      });
    });

    server.listen(port, () => {
      console.log(`Storybook server running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Get stories from storybook
async function getStories(storybookPath) {
  const storiesJsonPath = path.join(storybookPath, 'index.json');

  try {
    const content = fs.readFileSync(storiesJsonPath, 'utf8');
    const data = JSON.parse(content);
    return data.entries || data.stories || {};
  } catch (e) {
    console.error('Could not read stories index:', e.message);
    return {};
  }
}

async function runAccessibilityAudit() {
  console.log('Starting accessibility audit...');

  if (emptyComponentSet) {
    console.log('No components to audit (--components is empty) — skipping.');
    const report = {
      components: {},
      summary: { componentsAudited: 0, totalViolations: 0 },
    };
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    return report;
  }

  console.log(`Components to audit: ${components.length > 0 ? components.join(', ') : 'all affected'}`);

  const storybookPath = path.resolve(process.cwd(), storybookDir);

  if (!fs.existsSync(storybookPath)) {
    console.error(`Storybook build not found at ${storybookPath}`);
    const report = {
      error: 'Storybook not built',
      components: {},
      summary: { total: 0, violations: 0 },
    };
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    return report;
  }

  // Start server
  const port = 6007;
  const server = await createServer(storybookPath, port);

  // Get stories
  const stories = await getStories(storybookPath);
  const storyIds = Object.keys(stories);

  console.log(`Found ${storyIds.length} stories`);

  // Filter stories for relevant components
  const relevantStories = storyIds.filter((id) => {
    // Skip docs pages
    if (id.endsWith('--docs')) return false;

    if (components.length === 0) return true;
    const story = stories[id];
    const title = story.title || '';

    // Titles are like "Core/XDSButton" or "Layout/XDSCard"
    const titleParts = title.split('/');
    const componentPart = titleParts.length > 1 ? titleParts[1] : titleParts[0];
    const normalizedComponent = componentPart.replace(/^XDS/i, '').toLowerCase();

    return components.some(
      (comp) => normalizedComponent === comp.toLowerCase()
    );
  });

  // Group stories by component
  const storyGroups = {};
  for (const storyId of relevantStories) {
    const story = stories[storyId];
    const component = (story.title || '').split('/').pop() || storyId;
    if (!storyGroups[component]) {
      storyGroups[component] = [];
    }
    storyGroups[component].push({ id: storyId, ...story });
  }

  console.log(`Auditing ${Object.keys(storyGroups).length} components`);

  const browser = await chromium.launch();
  const componentResults = {};
  let totalViolations = 0;

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      reducedMotion: 'reduce',
    });

    for (const [component, componentStories] of Object.entries(storyGroups)) {
      const componentViolations = [];

      for (const story of componentStories) {
        const page = await context.newPage();

        try {
          const url = `http://localhost:${port}/iframe.html?id=${story.id}&viewMode=story`;
          // Higher timeout to accommodate axe-core's heavier DOM analysis
          await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
          await page.addStyleTag({ content: FREEZE_CSS }).catch(() => {});
          // Brief wait for any post-load rendering before axe-core scans the DOM
          await page.waitForTimeout(500);

          // Run axe-core accessibility analysis
          const results = await new AxeBuilder({ page })
            .disableRules(DISABLED_RULES)
            .analyze();

          if (results.violations.length > 0) {
            componentViolations.push({
              story: story.name || story.id,
              violations: results.violations,
            });
            totalViolations += results.violations.length;
          }

          console.log(
            `✓ Audited: ${component} / ${story.name} - ${results.violations.length} issues`
          );
        } catch (e) {
          console.error(`✗ Failed: ${story.id} - ${e.message}`);
          // Record the failure but continue
          componentViolations.push({
            story: story.name || story.id,
            error: e.message,
            violations: [],
          });
        } finally {
          await page.close();
        }
      }

      // Aggregate violations for component — preserve counts and story context
      const violationMap = new Map();

      for (const storyResult of componentViolations) {
        for (const violation of storyResult.violations) {
          if (!violationMap.has(violation.id)) {
            violationMap.set(violation.id, {
              id: violation.id,
              impact: violation.impact,
              description: violation.description,
              help: violation.help,
              helpUrl: violation.helpUrl,
              tags: violation.tags,
              storyCount: 0,
              totalNodes: 0,
              stories: [],
              nodes: [],
            });
          }
          const agg = violationMap.get(violation.id);
          agg.storyCount++;
          agg.totalNodes += violation.nodes.length;
          agg.stories.push(storyResult.story);
          // Keep first 3 nodes for display (cap to avoid bloat)
          if (agg.nodes.length < 3) {
            agg.nodes.push(
              ...violation.nodes.slice(0, 3 - agg.nodes.length).map((n) => ({
                html: n.html.substring(0, 200),
                target: n.target,
              }))
            );
          }
        }
      }

      componentResults[component] = {
        storiesAudited: componentStories.length,
        violations: Array.from(violationMap.values()),
        storyDetails: componentViolations,
      };
    }
  } finally {
    await browser.close();
    server.close();
  }

  const report = {
    components: componentResults,
    summary: {
      componentsAudited: Object.keys(componentResults).length,
      totalViolations,
      auditedAt: new Date().toISOString(),
    },
  };

  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
  console.log(`\nAudit complete: ${totalViolations} total violations found`);
  console.log(`Report written to ${outputFile}`);

  return report;
}

// Read the baseline file; a missing file behaves as an empty baseline so
// every current violation counts as new.
function loadBaselineFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Baseline file not found at ${filePath} — treating as empty`);
    return { version: 1, entries: [] };
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Compare the report against the checked-in baseline (or rewrite it with
// --update-baseline). Returns the exit code for the process.
function applyBaselineGate(report) {
  if (!baselineFile) return 0;

  if (updateBaseline) {
    // Merge-aware: entries for components outside this (possibly
    // --components-scoped) run are preserved.
    const existing = fs.existsSync(baselineFile)
      ? JSON.parse(fs.readFileSync(baselineFile, 'utf8'))
      : null;
    fs.writeFileSync(
      baselineFile,
      JSON.stringify(buildBaseline(report, { existing }), null, 2) + '\n'
    );
    console.log(`Baseline written to ${baselineFile}`);
    return 0;
  }

  const baseline = loadBaselineFile(baselineFile);
  const diff = diffAgainstBaseline(report, baseline);
  console.log(formatDiffSummary(diff, { baselinePath: baselineFile }));

  if (diff.newViolations.length > 0 && failOnNew) {
    console.error(
      `\nFailing: ${diff.newViolations.length} accessibility violation(s) not in baseline.`
    );
    return 1;
  }
  return 0;
}

runAccessibilityAudit()
  .then((report) => {
    const code = applyBaselineGate(report);
    if (code !== 0) process.exitCode = code;
  })
  .catch((e) => {
    console.error('Accessibility audit failed:', e);
    process.exit(1);
  });
