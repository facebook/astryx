// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {expect, test} from '@playwright/test';
import {themeBuildFamily} from '../../../api/theme/build/build.mjs';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const fixture = path.join(packageRoot, 'test/fixtures/theme-family');
const members = [
  'ocean.mjs',
  'ocean-deep.mjs',
  'ocean-midnight.mjs',
  'ocean-calm.mjs',
];
let project: string;
let server: http.Server | undefined;
let baseURL: string;

declare global {
  interface Window {
    __firstPaintAccent?: string | null;
  }
}

function contentType(file: string): string {
  if (file.endsWith('.html')) {
    return 'text/html; charset=utf-8';
  }
  if (file.endsWith('.css')) {
    return 'text/css; charset=utf-8';
  }
  if (file.endsWith('.js') || file.endsWith('.mjs')) {
    return 'text/javascript; charset=utf-8';
  }
  if (file.endsWith('.json')) {
    return 'application/json; charset=utf-8';
  }
  return 'application/octet-stream';
}

test.beforeAll(async () => {
  project = fs.mkdtempSync(
    path.join(packageRoot, '.tmp-theme-family-browser-'),
  );
  fs.cpSync(fixture, project, {recursive: true});
  await themeBuildFamily(members, {familyKey: 'ocean-family'}, {cwd: project});
  fs.cpSync(
    path.join(project, 'ocean-family'),
    path.join(project, 'relocated-family'),
    {
      recursive: true,
      dereference: false,
      verbatimSymlinks: true,
    },
  );
  fs.writeFileSync(
    path.join(project, 'relocated-main.mjs'),
    fs
      .readFileSync(path.join(project, 'main.mjs'), 'utf8')
      .replaceAll('ocean-family/current', 'relocated-family/current'),
  );
  fs.writeFileSync(
    path.join(project, 'relocated.html'),
    fs
      .readFileSync(path.join(project, 'index.html'), 'utf8')
      .replaceAll('ocean-family/current', 'relocated-family/current')
      .replace('./main.mjs', './relocated-main.mjs'),
  );
  fs.writeFileSync(
    path.join(project, 'rejected-wrapper.css'),
    `@import './missing-parent.css';\n@scope ([data-astryx-theme="ocean-deep"]) { :scope { --child-only: applied; } }\n`,
  );
  fs.writeFileSync(
    path.join(project, 'blank.html'),
    '<!doctype html><html><head></head><body></body></html>',
  );

  const activeServer = http.createServer((request, response) => {
    const pathname = decodeURIComponent(
      new URL(request.url ?? '/', 'http://example.test').pathname,
    );
    let file = path.resolve(project, `.${pathname}`);
    if (!file.startsWith(`${project}${path.sep}`) && file !== project) {
      response.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file)) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      'content-type': contentType(file),
      'cache-control': 'no-store',
    });
    fs.createReadStream(file).pipe(response);
  });
  server = activeServer;
  await new Promise<void>(resolve =>
    activeServer.listen(0, '127.0.0.1', resolve),
  );
  const address = activeServer.address();
  if (!address || typeof address === 'string') {
    throw new Error('No server port.');
  }
  baseURL = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  const activeServer = server;
  if (activeServer) {
    await new Promise<void>((resolve, reject) =>
      activeServer.close(error => (error ? reject(error) : resolve())),
    );
  }
  fs.rmSync(project, {recursive: true, force: true});
});

test('native family CSS is correct on first paint and every attribute-only switch', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({width: 600, height: 720});
  const errors: string[] = [];
  const stylesheetRequests: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (request.resourceType() === 'stylesheet') {
      stylesheetRequests.push(request.url());
    }
  });
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const card = document.querySelector<HTMLElement>(
        '[data-member="switchable"]',
      );
      window.__firstPaintAccent = card
        ? getComputedStyle(card).getPropertyValue('--color-accent').trim()
        : null;
    });
  });

  await page.goto(`${baseURL}/index.html`, {waitUntil: 'networkidle'});
  expect(errors).toEqual([]);
  expect(stylesheetRequests).toHaveLength(1);
  expect(await page.evaluate(() => window.__firstPaintAccent)).toBe('#0077b6');

  const switchable = page.locator('[data-member="switchable"]');
  const sibling = page.locator('[data-member="sibling"]');
  const nested = page.locator('[data-member="nested"]');
  const accent = async (locator: typeof switchable) =>
    locator.evaluate(element =>
      getComputedStyle(element).getPropertyValue('--color-accent').trim(),
    );
  expect(await accent(switchable)).toBe('#0077b6');
  expect(await accent(sibling)).toBe('#023e8a');
  expect(await accent(nested)).toBe('#0077b6');
  expect(
    await sibling.evaluate(element => getComputedStyle(element).colorScheme),
  ).toBe('light dark');
  expect(
    await nested.evaluate(element => getComputedStyle(element).colorScheme),
  ).not.toBe('light dark');

  const siblingButton = sibling.locator('button');
  expect(
    await siblingButton.evaluate(
      element => getComputedStyle(element).borderWidth,
    ),
  ).toBe('2px');
  expect(
    await siblingButton.evaluate(
      element => getComputedStyle(element).paddingLeft,
    ),
  ).toBe('20px');
  expect(
    await sibling.evaluate(element =>
      getComputedStyle(element).getPropertyValue('--radius-container').trim(),
    ),
  ).toBe('20px');
  await siblingButton.hover();
  expect(
    await siblingButton.evaluate(
      element => getComputedStyle(element).outlineColor,
    ),
  ).toBe('rgb(2, 62, 138)');

  const beforeSwitchRequests = stylesheetRequests.length;
  await page.locator('select').selectOption('ocean-deep');
  await expect.poll(() => accent(switchable)).toBe('#023e8a');
  expect(stylesheetRequests).toHaveLength(beforeSwitchRequests);
  const samples = await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>('[data-demo-root]');
    const card = document.querySelector<HTMLElement>(
      '[data-member="switchable"]',
    );
    if (!root || !card) {
      throw new Error('Theme family example roots are missing.');
    }
    root.dataset.astryxTheme = 'ocean-midnight';
    const values: string[] = [];
    for (let index = 0; index < 4; index++) {
      await new Promise(requestAnimationFrame);
      values.push(
        getComputedStyle(card)
          .getPropertyValue('--color-background-surface')
          .trim(),
      );
    }
    return values;
  });
  expect(new Set(samples)).toEqual(new Set(['#020b12']));
  expect(stylesheetRequests).toHaveLength(beforeSwitchRequests);

  await page
    .locator('[data-demo-root]')
    .evaluate(element => element.setAttribute('data-astryx-media', 'dark'));
  await expect
    .poll(() =>
      switchable.evaluate(element =>
        getComputedStyle(element)
          .getPropertyValue('--color-background-surface')
          .trim(),
      ),
    )
    .toBe('#06293a');

  await page.screenshot({
    path: testInfo.outputPath('theme-family-raw-link.png'),
    fullPage: true,
  });

  const relocatedCurrent = path.join(project, 'relocated-family', 'current');
  expect(path.isAbsolute(fs.readlinkSync(relocatedCurrent))).toBe(false);
  expect(fs.realpathSync(relocatedCurrent)).toContain(
    path.join(project, 'relocated-family', 'generations'),
  );
  fs.rmSync(path.join(project, 'ocean-family'), {
    recursive: true,
    force: true,
  });
  stylesheetRequests.length = 0;
  await page.goto(`${baseURL}/relocated.html`, {waitUntil: 'networkidle'});
  expect(errors).toEqual([]);
  expect(stylesheetRequests).toHaveLength(1);
  const relocated = page.locator('[data-member="switchable"]');
  expect(await accent(relocated)).toBe('#0077b6');
});

test('the rejected per-member wrapper exposes partial CSS when its parent is missing', async ({
  page,
}) => {
  await page.goto(`${baseURL}/blank.html`, {waitUntil: 'networkidle'});
  const result = await page.evaluate(async href => {
    document.head
      .querySelectorAll('link[rel="stylesheet"]')
      .forEach(link => link.remove());
    document.body.innerHTML =
      '<main data-astryx-theme="ocean-deep" id="root">Child</main>';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    const failed = new Promise<boolean>(resolve => {
      link.addEventListener('load', () => resolve(false), {once: true});
      link.addEventListener('error', () => resolve(true), {once: true});
    });
    document.head.append(link);
    const linkFailed = await failed;
    const root = document.querySelector('#root');
    if (!root) {
      throw new Error('Rejected wrapper root is missing.');
    }
    const childValue = getComputedStyle(root)
      .getPropertyValue('--child-only')
      .trim();
    return {linkFailed, childValue};
  }, `${baseURL}/rejected-wrapper.css`);

  expect(result).toEqual({linkFailed: true, childValue: 'applied'});
});
