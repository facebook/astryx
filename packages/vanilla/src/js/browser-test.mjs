// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @input Built Vanilla Astryx assets, demos, templates, and Chromium.
 * @output Browser assertions plus screenshots and a machine-readable report.
 * @position End-to-end validation for the no-build Vanilla Astryx package.
 */

import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {ASTRYX_VANILLA_CDN_PLACEHOLDER} from '../../../cli/api/template/html/html.mjs';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const evidenceDir = process.argv[2] || '/tmp/astryx-vanilla-browser-evidence';
const mime = new Map([
  ['.css', 'text/css'],
  ['.html', 'text/html'],
  ['.js', 'application/javascript'],
  ['.mjs', 'application/javascript'],
]);

async function serveFile(request, response) {
  const url = new URL(request.url, 'http://127.0.0.1');
  const renderedSource = new Map([
    ['/demo-test.html', 'demo/index.html'],
    ['/detail-test.html', 'templates/detail-page.html'],
  ]).get(url.pathname);
  if (renderedSource) {
    const source = await readFile(
      path.join(packageRoot, renderedSource),
      'utf8',
    );
    response.writeHead(200, {'content-type': 'text/html'});
    response.end(source.replaceAll(ASTRYX_VANILLA_CDN_PLACEHOLDER, '/dist'));
    return;
  }
  if (url.pathname === '/esm-test.html') {
    response.writeHead(200, {'content-type': 'text/html'});
    response.end(`<!doctype html><html><body><script type="module">
      import {initializeAstryx, toast} from '/dist/astryx-vanilla.mjs';
      window.esmAPI = {initializeAstryx, toast};
      window.esmReady = true;
    </script></body></html>`);
    return;
  }
  const relative =
    decodeURIComponent(url.pathname).replace(/^\/+/, '') ||
    'examples/gallery-interactive.html';
  const file = path.resolve(packageRoot, relative);
  if (!file.startsWith(`${packageRoot}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    response.writeHead(200, {
      'content-type':
        mime.get(path.extname(file)) || 'application/octet-stream',
    });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
}

const server = http.createServer(
  (request, response) => void serveFile(request, response),
);
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const {port} = server.address();
const baseURL = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({headless: true});
const page = await browser.newPage({viewport: {width: 1280, height: 1100}});
const errors = [];
page.on('console', message => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});
page.on('pageerror', error => errors.push(`page: ${error.message}`));
const checks = [];
const contrastResults = [];
const visualResults = [];

async function check(name, task) {
  await task();
  checks.push(name);
}

try {
  await page.goto(`${baseURL}/examples/gallery-interactive.html`, {
    waitUntil: 'networkidle',
  });
  await page.waitForFunction(() =>
    Boolean(window.AstryxVanilla && window.astryx?.toast),
  );

  await check(
    'Dialog opens by mouse, closes with Escape, and restores focus',
    async () => {
      await page.click('#dialog-trigger');
      assert.equal(
        await page.locator('#gallery-dialog').evaluate(dialog => dialog.open),
        true,
      );
      assert.equal(
        await page.evaluate(() => document.activeElement?.id),
        'gallery-dialog-title',
      );
      await page.keyboard.press('Escape');
      assert.equal(
        await page.locator('#gallery-dialog').evaluate(dialog => dialog.open),
        false,
      );
      assert.equal(
        await page.evaluate(() => document.activeElement?.id),
        'dialog-trigger',
      );
    },
  );

  await check(
    'DropdownMenu supports mouse open, arrow keys, and Escape focus return',
    async () => {
      await page.click('#menu-trigger');
      assert.equal(
        await page.locator('#gallery-menu').getAttribute('data-ax-open'),
        'true',
      );
      assert.match(
        await page.evaluate(() => document.activeElement?.textContent),
        /Edit project/,
      );
      await page.keyboard.press('ArrowDown');
      assert.match(
        await page.evaluate(() => document.activeElement?.textContent),
        /Duplicate project/,
      );
      await page.keyboard.press('Escape');
      assert.equal(
        await page.locator('#gallery-menu').getAttribute('data-ax-open'),
        'false',
      );
      assert.equal(
        await page.evaluate(() => document.activeElement?.id),
        'menu-trigger',
      );
    },
  );

  await check(
    'TabList uses roving focus and switches panels with arrow keys',
    async () => {
      await page.focus('#gallery-tab-overview');
      await page.keyboard.press('ArrowRight');
      assert.equal(
        await page
          .locator('#gallery-tab-activity')
          .getAttribute('aria-selected'),
        'true',
      );
      assert.equal(
        await page
          .locator('#gallery-panel-overview')
          .evaluate(panel => panel.hidden),
        true,
      );
      assert.equal(
        await page
          .locator('#gallery-panel-activity')
          .evaluate(panel => panel.hidden),
        false,
      );
    },
  );

  await check(
    'Collapsible toggles native state and enhancement state',
    async () => {
      await page.click('#gallery-collapsible > summary');
      assert.equal(
        await page
          .locator('#gallery-collapsible')
          .evaluate(details => details.open),
        true,
      );
      await page.waitForFunction(
        () =>
          document.querySelector('#gallery-collapsible')?.dataset.axOpen ===
          'true',
      );
      assert.equal(
        await page.locator('#gallery-collapsible').getAttribute('data-ax-open'),
        'true',
      );
    },
  );

  await check('Tooltip opens on hover and keyboard focus', async () => {
    await page.hover('#tooltip-trigger');
    await page.waitForFunction(
      () =>
        document.querySelector('[data-ax-tooltip-content]')?.hidden === false,
    );
    await page.mouse.move(0, 0);
    await page.waitForFunction(
      () =>
        document.querySelector('[data-ax-tooltip-content]')?.hidden === true,
    );
    await page.focus('#tooltip-trigger');
    await page.waitForFunction(
      () =>
        document.querySelector('[data-ax-tooltip-content]')?.hidden === false,
    );
    await page.keyboard.press('Escape');
    await page.waitForFunction(
      () =>
        document.querySelector('[data-ax-tooltip-content]')?.hidden === true,
    );
  });

  await check(
    'window.astryx.toast and data hooks create dismissible toasts',
    async () => {
      await page.evaluate(() =>
        window.astryx.toast('API toast', {duration: 0}),
      );
      await page.click('#toast-trigger');
      assert.equal(await page.locator('[data-ax-toast-item]').count(), 2);
      await page.locator('[data-ax-toast-dismiss]').first().click();
      await page.waitForTimeout(300);
      assert.equal(await page.locator('[data-ax-toast-item]').count(), 1);
    },
  );

  await check(
    'SideNav collapse and theme/mode controls update semantic state',
    async () => {
      await page.click('#side-nav-trigger');
      assert.equal(
        await page.locator('#gallery-side-nav').evaluate(nav => nav.hidden),
        true,
      );
      assert.equal(
        await page.locator('#side-nav-trigger').getAttribute('aria-expanded'),
        'false',
      );
      await page.click('#side-nav-trigger');
      await page.selectOption('[data-ax-theme-switch]', 'butter');
      assert.equal(
        await page.locator('html').getAttribute('data-astryx-theme'),
        'butter',
      );
      await page.click('[data-ax-mode-toggle]');
      assert.equal(
        await page.locator('html').getAttribute('data-theme'),
        'dark',
      );
    },
  );

  await check(
    'MutationObserver enhances markup inserted after load',
    async () => {
      await page.click('#insert-dynamic');
      await page.waitForFunction(
        () =>
          document
            .querySelector('#dynamic-menu-trigger')
            ?.getAttribute('aria-expanded') === 'false',
      );
      await page.click('#dynamic-menu-trigger');
      assert.equal(
        await page.locator('#dynamic-menu').getAttribute('data-ax-open'),
        'true',
      );
      await page.keyboard.press('Escape');
    },
  );

  await mkdir(evidenceDir, {recursive: true});
  for (const theme of ['neutral', 'butter', 'y2k']) {
    await page.selectOption('[data-ax-theme-switch]', theme);
    await page.screenshot({
      path: path.join(evidenceDir, `gallery-${theme}-dark.png`),
      fullPage: true,
    });
  }

  await check(
    'Status badges meet 4.5:1 contrast in every demo theme',
    async () => {
      await page.goto(`${baseURL}/demo-test.html`, {waitUntil: 'networkidle'});
      for (const theme of ['neutral', 'butter', 'y2k']) {
        for (const mode of ['light', 'dark']) {
          const results = await page.evaluate(
            ({mode: nextMode, theme: nextTheme}) => {
              document.documentElement.dataset.astryxTheme = nextTheme;
              document.documentElement.dataset.theme = nextMode;

              function parseColor(value) {
                const parts = value.match(/[\d.]+/g)?.map(Number) ?? [];
                return {
                  r: parts[0] ?? 0,
                  g: parts[1] ?? 0,
                  b: parts[2] ?? 0,
                  a: parts[3] ?? 1,
                };
              }
              function composite(foreground, background) {
                const alpha = foreground.a + background.a * (1 - foreground.a);
                if (alpha === 0) return {r: 0, g: 0, b: 0, a: 0};
                return {
                  r:
                    (foreground.r * foreground.a +
                      background.r * background.a * (1 - foreground.a)) /
                    alpha,
                  g:
                    (foreground.g * foreground.a +
                      background.g * background.a * (1 - foreground.a)) /
                    alpha,
                  b:
                    (foreground.b * foreground.a +
                      background.b * background.a * (1 - foreground.a)) /
                    alpha,
                  a: alpha,
                };
              }
              function effectiveBackground(element) {
                const background = parseColor(
                  getComputedStyle(element).backgroundColor,
                );
                if (background.a >= 0.999) return background;
                const parent = element.parentElement;
                return composite(
                  background,
                  parent
                    ? effectiveBackground(parent)
                    : {r: 255, g: 255, b: 255, a: 1},
                );
              }
              function luminance(color) {
                const channel = value => {
                  const normalized = value / 255;
                  return normalized <= 0.04045
                    ? normalized / 12.92
                    : ((normalized + 0.055) / 1.055) ** 2.4;
                };
                return (
                  0.2126 * channel(color.r) +
                  0.7152 * channel(color.g) +
                  0.0722 * channel(color.b)
                );
              }
              function contrast(foreground, background) {
                const high = Math.max(
                  luminance(foreground),
                  luminance(background),
                );
                const low = Math.min(
                  luminance(foreground),
                  luminance(background),
                );
                return (high + 0.05) / (low + 0.05);
              }

              return ['info', 'success', 'warning', 'error'].map(variant => {
                const badge = document.querySelector(`.ax-badge--${variant}`);
                const style = getComputedStyle(badge);
                const foreground = parseColor(style.color);
                const background = effectiveBackground(badge);
                return {
                  variant,
                  ratio: contrast(foreground, background),
                  foreground: style.color,
                  background: style.backgroundColor,
                };
              });
            },
            {mode, theme},
          );
          for (const result of results) {
            assert.ok(
              result.ratio >= 4.5,
              `${theme}/${mode} ${result.variant} badge contrast is ${result.ratio.toFixed(2)}:1`,
            );
            contrastResults.push({
              ...result,
              mode,
              ratio: Number(result.ratio.toFixed(2)),
              theme,
            });
          }
        }
      }
    },
  );

  await check(
    'Tab underline and Collapsible chevron render in every theme and mode',
    async () => {
      await page.goto(`${baseURL}/detail-test.html`, {
        waitUntil: 'networkidle',
      });
      for (const theme of ['neutral', 'butter', 'y2k']) {
        for (const mode of ['light', 'dark']) {
          const result = await page.evaluate(
            ({mode: nextMode, theme: nextTheme}) => {
              document.documentElement.dataset.astryxTheme = nextTheme;
              document.documentElement.dataset.theme = nextMode;
              const tab = getComputedStyle(
                document.querySelector('.ax-tab[aria-selected="true"]'),
                '::after',
              );
              const chevron = getComputedStyle(
                document.querySelector('.ax-collapsible__trigger'),
                '::after',
              );
              return {
                tab: {
                  background: tab.backgroundColor,
                  content: tab.content,
                  height: tab.height,
                  width: tab.width,
                },
                chevron: {
                  color: chevron.color,
                  content: chevron.content,
                },
              };
            },
            {mode, theme},
          );
          assert.notEqual(result.tab.content, 'none');
          assert.notEqual(result.tab.height, '0px');
          assert.notEqual(result.tab.width, '0px');
          assert.notEqual(result.chevron.content, 'none');
          visualResults.push({...result, mode, theme});
          await page.screenshot({
            path: path.join(evidenceDir, `detail-${theme}-${mode}.png`),
            fullPage: true,
          });
        }
      }
    },
  );

  await check(
    'Dialog opened from DropdownMenu restores focus to the menu trigger',
    async () => {
      await page.click('[data-ax-dropdown-trigger="order-actions"]');
      await page.click('[data-ax-dialog-open="fulfill-dialog"]');
      assert.equal(
        await page.locator('#fulfill-dialog').evaluate(dialog => dialog.open),
        true,
      );
      await page
        .locator('#fulfill-dialog [data-ax-dialog-close]')
        .first()
        .click();
      assert.equal(
        await page.evaluate(() =>
          document.activeElement?.matches(
            '[data-ax-dropdown-trigger="order-actions"]',
          ),
        ),
        true,
      );
    },
  );

  await check(
    'Standalone ESM bundle imports and exports the public API',
    async () => {
      const esmPage = await browser.newPage();
      await esmPage.goto(`${baseURL}/esm-test.html`);
      await esmPage.waitForFunction(() => window.esmReady === true);
      assert.equal(
        await esmPage.evaluate(() => typeof window.esmAPI.initializeAstryx),
        'function',
      );
      assert.equal(
        await esmPage.evaluate(() => typeof window.esmAPI.toast),
        'function',
      );
      await esmPage.close();
    },
  );

  assert.deepEqual(errors, []);
  const report = {
    baseURL,
    checks,
    consoleErrors: errors,
    contrastResults,
    visualResults,
    browser: await browser.version(),
  };
  await writeFile(
    path.join(evidenceDir, 'browser-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
