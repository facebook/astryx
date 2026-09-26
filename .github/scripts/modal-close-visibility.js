#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * @description Asserts native-dialog close/render ordering in a real browser
 * @input --storybook-dir <path> [--port <n>]
 * @output One line per target; exit 1 if a close/render invariant fails
 *
 * Two opposite ordering bugs live at this boundary:
 *
 * 1. A modal <dialog> that is `display: none` while still `:modal` blocks every
 *    pointer event on the document, and Safari 26.1 did not release that block
 *    when close() finally ran (#4290). It must still be rendered when close()
 *    starts.
 * 2. A fixed panel that stays rendered after close() leaves the top layer can
 *    paint back inside a transformed ancestor for one frame (#5549). It must be
 *    hidden before the next paint after close().
 *
 * Neither ordering exists in jsdom: it runs no CSS transition and has no top
 * layer. Chromium is enough to observe both invariants; the browser-specific
 * failure that first exposed each one is not needed to see the ordering fail.
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
  {
    component: 'Drawer',
    story: 'lab-drawer--showcase',
    openButton: 'Open inspector',
    // Reproduces the real failure condition: after close() releases the top
    // layer, this becomes the containing block for the fixed panel.
    transformAncestor: true,
    mustBeHiddenAfterClose: true,
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
  window.__postCloseFrames = [];
  const close = HTMLDialogElement.prototype.close;
  HTMLDialogElement.prototype.close = function (...args) {
    const dialog = this;
    window.__closeDisplays.push(getComputedStyle(dialog).display);
    const result = close.apply(dialog, args);
    // Sample immediately before the next paint. Drawer must have committed its
    // hide by this point; otherwise the non-top-layer panel can paint against a
    // transformed ancestor for one frame.
    requestAnimationFrame(() => {
      const rect = dialog.getBoundingClientRect();
      window.__postCloseFrames.push({
        display: getComputedStyle(dialog).display,
        open: dialog.open,
        x: Math.round(rect.x),
        width: Math.round(rect.width),
      });
    });
    return result;
  };
}

async function probe(page, target) {
  await page.addInitScript(recordCloseDisplay);
  await page.goto(
    `http://localhost:${port}/iframe.html?id=${target.story}&viewMode=story`,
    { waitUntil: 'networkidle', timeout: 15000 }
  );

  if (target.transformAncestor) {
    await page.evaluate(() => {
      const root = document.querySelector('#storybook-root');
      if (!(root instanceof HTMLElement)) {
        throw new Error('Storybook root not found');
      }
      root.style.transform = 'translateZ(0)';
    });
  }

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
  if (target.mustBeHiddenAfterClose) {
    await page.waitForFunction(() => window.__postCloseFrames.length > 0, null, {
      timeout: 5000,
    });
  }

  return page.evaluate(() => ({
    closeDisplays: window.__closeDisplays,
    postCloseFrames: window.__postCloseFrames,
  }));
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
        const { closeDisplays, postCloseFrames } = await probe(page, target);
        const hiddenAtClose = closeDisplays.filter((d) => d === 'none');
        const paintedAfterClose = target.mustBeHiddenAfterClose
          ? postCloseFrames.filter((frame) => frame.display !== 'none')
          : [];

        if (hiddenAtClose.length > 0) {
          failures++;
          console.error(
            `✗ ${target.component}: close() ran at display: none (${closeDisplays.join(', ')})`
          );
        } else if (paintedAfterClose.length > 0) {
          failures++;
          console.error(
            `✗ ${target.component}: painted after close() outside the top layer — ${JSON.stringify(paintedAfterClose)}`
          );
        } else {
          const postClose = target.mustBeHiddenAfterClose
            ? '; hidden before the next paint'
            : '';
          console.log(
            `✓ ${target.component}: close() ran at display: ${closeDisplays.join(', ')}${postClose}`
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
      `\nFailing: ${failures} native-dialog close/render ordering check(s) — see #4290 and #5549.`
    );
    return 1;
  }
  console.log('\nAll native-dialog close/render ordering checks passed.');
  return 0;
}

run()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((e) => {
    console.error('Native-dialog close visibility guard failed:', e);
    process.exit(1);
  });
