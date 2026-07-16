#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @description Runs accessibility audits on component stories using axe-core
 * @input --storybook-dir <path> --output <file> --components <comma-separated>
 * @output JSON report with accessibility violations
 */

const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const storybookDir = getArg('storybook-dir') || 'apps/storybook/dist';
const outputFile = getArg('output') || 'a11y-report.json';
const componentsArg = getArg('components') || '';
const components = componentsArg.split(',').filter(Boolean);

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
    return;
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
    });

    for (const [component, componentStories] of Object.entries(storyGroups)) {
      const componentViolations = [];

      for (const story of componentStories) {
        const page = await context.newPage();

        try {
          const url = `http://localhost:${port}/iframe.html?id=${story.id}&viewMode=story`;
          // Higher timeout to accommodate axe-core's heavier DOM analysis
          await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
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
}

runAccessibilityAudit().catch((e) => {
  console.error('Accessibility audit failed:', e);
  process.exit(1);
});
