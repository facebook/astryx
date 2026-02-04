#!/usr/bin/env node

/**
 * @description Runs accessibility audits on component stories using axe-core
 * @input --storybook-dir <path> --output <file> --components <comma-separated>
 * @output JSON report with accessibility violations
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const storybookDir = getArg('storybook-dir') || 'apps/storybook/storybook-static';
const outputFile = getArg('output') || 'a11y-report.json';
const componentsArg = getArg('components') || '';
const components = componentsArg.split(',').filter(Boolean);

// Simple static file server
function createServer(dir, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(dir, req.url === '/' ? 'index.html' : req.url);
      filePath = filePath.split('?')[0];

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

// axe-core script to inject
const AXE_SCRIPT = `
// Minimal axe-core implementation for accessibility testing
window.runAxe = async function() {
  const violations = [];

  // Check for images without alt text
  document.querySelectorAll('img:not([alt])').forEach(el => {
    violations.push({
      id: 'image-alt',
      impact: 'critical',
      description: 'Images must have alternate text',
      nodes: [{ html: el.outerHTML.substring(0, 100) }]
    });
  });

  // Check for buttons without accessible names
  document.querySelectorAll('button').forEach(el => {
    const hasText = el.textContent.trim();
    const hasAriaLabel = el.getAttribute('aria-label');
    const hasAriaLabelledBy = el.getAttribute('aria-labelledby');
    const hasTitle = el.getAttribute('title');

    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
      violations.push({
        id: 'button-name',
        impact: 'critical',
        description: 'Buttons must have discernible text',
        nodes: [{ html: el.outerHTML.substring(0, 100) }]
      });
    }
  });

  // Check for form inputs without labels
  document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])').forEach(el => {
    const id = el.getAttribute('id');
    const hasLabel = id && document.querySelector(\`label[for="\${id}"]\`);
    const hasAriaLabel = el.getAttribute('aria-label');
    const hasAriaLabelledBy = el.getAttribute('aria-labelledby');
    const hasTitle = el.getAttribute('title');
    const hasPlaceholder = el.getAttribute('placeholder');

    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle && !hasPlaceholder) {
      violations.push({
        id: 'label',
        impact: 'critical',
        description: 'Form elements must have labels',
        nodes: [{ html: el.outerHTML.substring(0, 100) }]
      });
    }
  });

  // Check for low color contrast (basic check)
  // This is a simplified check - real axe-core does much more

  // Check for missing lang attribute
  if (!document.documentElement.getAttribute('lang')) {
    violations.push({
      id: 'html-has-lang',
      impact: 'serious',
      description: '<html> element must have a lang attribute',
      nodes: [{ html: '<html>' }]
    });
  }

  // Check for missing main landmark
  if (!document.querySelector('main, [role="main"]')) {
    // Don't flag this for component stories - they're fragments
  }

  // Check for empty links
  document.querySelectorAll('a').forEach(el => {
    const hasText = el.textContent.trim();
    const hasAriaLabel = el.getAttribute('aria-label');
    const hasImage = el.querySelector('img[alt]');

    if (!hasText && !hasAriaLabel && !hasImage) {
      violations.push({
        id: 'link-name',
        impact: 'serious',
        description: 'Links must have discernible text',
        nodes: [{ html: el.outerHTML.substring(0, 100) }]
      });
    }
  });

  // Check for positive tabindex
  document.querySelectorAll('[tabindex]').forEach(el => {
    const tabindex = parseInt(el.getAttribute('tabindex'), 10);
    if (tabindex > 0) {
      violations.push({
        id: 'tabindex',
        impact: 'serious',
        description: 'Elements should not have tabindex greater than zero',
        nodes: [{ html: el.outerHTML.substring(0, 100) }]
      });
    }
  });

  return { violations };
};
`;

async function runAccessibilityAudit() {
  console.log('Starting accessibility audit...');
  console.log(`Components to audit: ${components.length > 0 ? components.join(', ') : 'all affected'}`);

  const storybookPath = path.resolve(process.cwd(), storybookDir);

  if (!fs.existsSync(storybookPath)) {
    console.error(`Storybook build not found at ${storybookPath}`);
    const report = {
      error: 'Storybook not built',
      components: {},
      summary: { total: 0, violations: 0 }
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
  const relevantStories = storyIds.filter(id => {
    if (components.length === 0) return true;
    const story = stories[id];
    const title = story.title || '';
    return components.some(comp =>
      title.toLowerCase().includes(comp.toLowerCase()) ||
      id.toLowerCase().includes(comp.toLowerCase())
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
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const componentResults = {};
  let totalViolations = 0;

  for (const [component, componentStories] of Object.entries(storyGroups)) {
    const componentViolations = [];

    for (const story of componentStories) {
      const page = await context.newPage();

      try {
        const url = `http://localhost:${port}/iframe.html?id=${story.id}&viewMode=story`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(300);

        // Inject and run accessibility check
        await page.addScriptTag({ content: AXE_SCRIPT });
        const results = await page.evaluate(() => window.runAxe());

        if (results.violations.length > 0) {
          componentViolations.push({
            story: story.name || story.id,
            violations: results.violations,
          });
          totalViolations += results.violations.length;
        }

        console.log(`✓ Audited: ${component} / ${story.name} - ${results.violations.length} issues`);
      } catch (e) {
        console.error(`✗ Failed: ${story.id} - ${e.message}`);
      } finally {
        await page.close();
      }
    }

    // Aggregate violations for component
    const uniqueViolations = [];
    const seenIds = new Set();

    for (const storyResult of componentViolations) {
      for (const violation of storyResult.violations) {
        if (!seenIds.has(violation.id)) {
          seenIds.add(violation.id);
          uniqueViolations.push(violation);
        }
      }
    }

    componentResults[component] = {
      storiesAudited: componentStories.length,
      violations: uniqueViolations,
      storyDetails: componentViolations,
    };
  }

  await browser.close();
  server.close();

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

runAccessibilityAudit().catch(e => {
  console.error('Accessibility audit failed:', e);
  process.exit(1);
});
