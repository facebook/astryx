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
let server: http.Server;
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

  server = http.createServer((request, response) => {
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
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('No server port.');
  }
  baseURL = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close(error => (error ? reject(error) : resolve())),
  );
  fs.rmSync(project, {recursive: true, force: true});
});

test('native family CSS is correct on first paint and every attribute-only switch', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({width: 600, height: 720});
  const errors: string[] = [];
  const familyCSSRequests: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (request.url().endsWith('/ocean-family.css')) {
      familyCSSRequests.push(request.url());
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
  expect(familyCSSRequests).toHaveLength(1);
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
  await siblingButton.hover();
  expect(
    await siblingButton.evaluate(
      element => getComputedStyle(element).outlineColor,
    ),
  ).toBe('rgb(2, 62, 138)');

  const beforeSwitchRequests = familyCSSRequests.length;
  await page.locator('select').selectOption('ocean-deep');
  await expect.poll(() => accent(switchable)).toBe('#023e8a');
  expect(familyCSSRequests).toHaveLength(beforeSwitchRequests);
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
  expect(familyCSSRequests).toHaveLength(beforeSwitchRequests);

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
});
