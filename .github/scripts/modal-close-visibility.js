#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @description Asserts a modal <dialog> is still rendered when close() runs
 * @input --storybook-dir <path> [--port <n>]
 * @output One line per target; exit 1 if any close() ran at display: none
 *
 * A modal <dialog> that is `display: none` while still `:modal` blocks every
 * pointer event on the document, and browsers are not required to release that
 * block when close() finally runs — Safari 26.1 did not, leaving a page that
 * looked normal and answered nothing (#4290). The drawer must therefore still
 * be rendered at the moment it is told to close.
 *
 * That ordering only exists in a browser: it is produced by a `display`
 * transition with `allow-discrete`, which jsdom neither runs nor exposes, so
 * the unit suite passes whether or not the invariant holds. Chromium is enough
 * to observe it — the ordering is the bug, and the Safari version it was
 * reported against is not needed to see it go wrong.
 */

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const storybookDir = getArg('storybook-dir') || 'apps/storybook/dist';
const port = Number(getArg('port') || 6009);

const TARGETS = [
  {
    component: 'MobileNav',
    story: 'core-mobilenav--default',
    openButton: 'Open Navigation',
  },
];

const CONTENT_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function createServer(dir, listenPort) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const filePath = path
        .join(dir, req.url === '/' ? 'index.html' : req.url)
        .split('?')[0];

      const resolved = path.resolve(filePath);
      if (!resolved.startsWith(path.resolve(dir))) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      fs.readFile(resolved, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type':
            CONTENT_TYPES[path.extname(resolved)] || 'text/plain',
        });
        res.end(data);
      });
    });

    server.listen(listenPort, () => resolve(server));
  });
}

// Records the computed `display` of every dialog at the instant it is closed.
function recordCloseDisplay() {
  window.__closeDisplays = [];
  const close = HTMLDialogElement.prototype.close;
  HTMLDialogElement.prototype.close = function (...args) {
    window.__closeDisplays.push(getComputedStyle(this).display);
    return close.apply(this, args);
  };
}

async function probe(page, target) {
  await page.addInitScript(recordCloseDisplay);
  await page.goto(
    `http://localhost:${port}/iframe.html?id=${target.story}&viewMode=story`,
    { waitUntil: 'networkidle', timeout: 15000 }
  );

  await page.getByRole('button', { name: target.openButton }).click();
  await page.waitForFunction(
    () => document.querySelector('dialog')?.matches(':modal') === true,
    null,
    { timeout: 5000 }
  );

  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.__closeDisplays.length > 0, null, {
    timeout: 5000,
  });

  return page.evaluate(() => window.__closeDisplays);
}

async function run() {
  const dir = path.resolve(process.cwd(), storybookDir);
  if (!fs.existsSync(dir)) {
    console.error(`Storybook build not found at ${dir}`);
    return 1;
  }

  const server = await createServer(dir, port);
  const browser = await chromium.launch();
  let failures = 0;

  try {
    const context = await browser.newContext({
      viewport: { width: 430, height: 860 },
    });

    for (const target of TARGETS) {
      const page = await context.newPage();
      try {
        const displays = await probe(page, target);
        const hidden = displays.filter((d) => d === 'none');
        if (hidden.length > 0) {
          failures++;
          console.error(
            `✗ ${target.component}: close() ran at display: none (${displays.join(', ')})`
          );
        } else {
          console.log(
            `✓ ${target.component}: close() ran at display: ${displays.join(', ')}`
          );
        }
      } catch (e) {
        failures++;
        console.error(`✗ ${target.component}: probe failed — ${e.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (failures > 0) {
    console.error(
      `\nFailing: ${failures} modal(s) closed while not rendered — see #4290.`
    );
    return 1;
  }
  console.log('\nAll modals were still rendered when close() ran.');
  return 0;
}

run()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((e) => {
    console.error('Modal close visibility guard failed:', e);
    process.exit(1);
  });
