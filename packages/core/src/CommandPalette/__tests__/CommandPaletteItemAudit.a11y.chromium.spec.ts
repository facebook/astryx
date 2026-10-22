// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteItemAudit.a11y.chromium.spec.ts
 * @input Exact-head CommandPaletteItem stories across semantics, states, themes, direction, and viewport sizes
 * @output Screenshots and fail-closed sensor receipts for the CommandPaletteItem whole-component audit
 * @position Component-owned Night Watch browser evidence; CI runs it only for a CommandPaletteItem audit pull request
 */

import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {expect, test, type Page} from '@playwright/test';
import {holdMotionStill} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const OUTPUT = path.resolve('command-palette-item-audit-evidence');
const WIDE = {width: 1024, height: 768};
const NARROW = {width: 320, height: 720};

type Mode = 'light' | 'dark';
type Direction = 'ltr' | 'rtl';
type Theme = 'neutral' | 'butter';
type Story = 'states' | 'combined-and-long';
type State = 'rest' | 'hover';

type AuditCase = {
  key: string;
  story: Story;
  mode: Mode;
  direction: Direction;
  theme: Theme;
  state: State;
  viewport: {width: number; height: number};
};

type AuditReceipt = {
  passed: boolean;
  expected: Record<string, unknown>;
};

const cases: AuditCase[] = [];
function addPair(
  key: string,
  options: Partial<Omit<AuditCase, 'key' | 'mode'>> = {},
) {
  for (const mode of ['light', 'dark'] as const) {
    cases.push({
      key: `${key}-${mode}`,
      story: options.story ?? 'states',
      mode,
      direction: options.direction ?? 'ltr',
      theme: options.theme ?? 'neutral',
      state: options.state ?? 'rest',
      viewport: options.viewport ?? WIDE,
    });
  }
}

addPair('states-rest');
addPair('states-hover', {state: 'hover'});
addPair('states-custom-theme', {theme: 'butter'});
addPair('states-rtl', {direction: 'rtl'});
addPair('states-narrow', {viewport: NARROW});
addPair('combined-rest', {story: 'combined-and-long'});
addPair('combined-custom-theme', {
  story: 'combined-and-long',
  theme: 'butter',
});
addPair('combined-narrow', {
  story: 'combined-and-long',
  viewport: NARROW,
});

test.describe.configure({mode: 'serial', retries: 0});
let server: StaticServer;
let checkoutSha: string;
let storybookSha: string;

function storyId(item: AuditCase) {
  return `core-commandpaletteitem--${item.story}`;
}

function storyUrl(item: AuditCase) {
  return `${server.origin}/iframe.html?id=${storyId(item)}&viewMode=story&globals=colorMode:${item.mode};astryxTheme:${item.theme};direction:${item.direction}`;
}

async function settle(page: Page) {
  await holdMotionStill(page);
  await page.evaluate(async () => document.fonts.ready);
  await page.waitForTimeout(40);
}

test.beforeAll(async () => {
  fs.rmSync(OUTPUT, {recursive: true, force: true});
  fs.mkdirSync(OUTPUT, {recursive: true});
  checkoutSha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const expected = process.env.ASTRYX_HEAD_SHA;
  if (expected && expected !== checkoutSha) {
    throw new Error(
      `checkout ${checkoutSha} does not match expected head ${expected}`,
    );
  }
  server = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
  const response = await fetch(`${server.origin}/astryx-build-sha.txt`);
  if (!response.ok) {
    throw new Error(`Storybook build has no SHA stamp (${response.status})`);
  }
  storybookSha = (await response.text()).trim();
  if (storybookSha !== checkoutSha) {
    throw new Error(
      `Storybook ${storybookSha} does not match checkout ${checkoutSha}`,
    );
  }
});

test.afterAll(async () => {
  await server?.close();
});

for (const item of cases) {
  test(item.key, async ({browser}) => {
    const context = await browser.newContext({
      viewport: item.viewport,
      colorScheme: item.mode,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(String(error)));
    await page.goto(storyUrl(item), {waitUntil: 'load'});
    await page.locator('#storybook-root').waitFor();

    const listName =
      item.story === 'states'
        ? 'Command item states'
        : 'Combined and long command item states';
    const list = page.getByRole('listbox', {name: listName});
    const options = list.getByRole('option');
    const expectedCount = item.story === 'states' ? 4 : 2;
    const expectedDisabled = item.story === 'states' ? 1 : 0;
    await expect(list).toBeVisible();
    await expect(options).toHaveCount(expectedCount);
    await expect(
      list.locator('[role="option"][aria-selected="true"]'),
    ).toHaveCount(1);
    await expect(
      list.locator('[role="option"][aria-disabled="true"]'),
    ).toHaveCount(expectedDisabled);
    await expect(list.locator('button, a, [tabindex]')).toHaveCount(0);

    if (item.state === 'hover') {
      await options.first().hover();
    }
    await settle(page);

    const observed = await page.evaluate(() => ({
      theme: document
        .querySelector('[data-astryx-theme]')
        ?.getAttribute('data-astryx-theme'),
      mode: document.documentElement.getAttribute('data-theme'),
      direction: getComputedStyle(
        document.querySelector('.astryx-command-palette-item') as HTMLElement,
      ).direction,
      viewport: {width: innerWidth, height: innerHeight},
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      fonts: document.fonts.status,
    }));
    const optionStates = await options.evaluateAll(nodes =>
      nodes.map(node => {
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        return {
          name: node.textContent?.replace(/\s+/g, ' ').trim(),
          selected: node.getAttribute('aria-selected'),
          disabled: node.getAttribute('aria-disabled'),
          backgroundColor: style.backgroundColor,
          color: style.color,
          opacity: style.opacity,
          geometry: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height,
          },
        };
      }),
    );
    const semanticsPass =
      optionStates.length === expectedCount &&
      optionStates.filter(option => option.selected === 'true').length === 1 &&
      optionStates.filter(option => option.disabled === 'true').length ===
        expectedDisabled &&
      optionStates.every(
        option => option.geometry.width > 0 && option.geometry.height > 0,
      );

    const png = await page.screenshot({animations: 'disabled', fullPage: true});
    const image = `${item.key}.png`;
    const receipt = {
      schemaVersion: 1,
      expected: {
        build: checkoutSha,
        storyId: storyId(item),
        mode: item.mode,
        direction: item.direction,
        theme: item.theme,
        state: item.state,
        viewport: item.viewport,
        optionCount: expectedCount,
        disabledCount: expectedDisabled,
        selectedCount: 1,
      },
      observed: {
        build: storybookSha,
        ...observed,
        listRole: await list.getAttribute('role'),
        listName: await list.getAttribute('aria-label'),
        optionStates,
        pageErrors,
      },
      image: {
        file: image,
        sha256: createHash('sha256').update(png).digest('hex'),
        width: png.readUInt32BE(16),
        height: png.readUInt32BE(20),
      },
      checks: {semanticsPass},
      passed:
        storybookSha === checkoutSha &&
        pageErrors.length === 0 &&
        observed.theme === item.theme &&
        observed.mode === item.mode &&
        observed.direction === item.direction &&
        observed.viewport.width === item.viewport.width &&
        observed.viewport.height === item.viewport.height &&
        observed.reducedMotion &&
        !observed.horizontalOverflow &&
        observed.fonts === 'loaded' &&
        semanticsPass,
    };
    fs.writeFileSync(path.join(OUTPUT, image), png);
    fs.writeFileSync(
      path.join(OUTPUT, `${item.key}.sensors.json`),
      `${JSON.stringify(receipt, null, 2)}\n`,
    );

    await context.close();
  });
}

test('manifest is complete', async () => {
  const receiptFiles = fs
    .readdirSync(OUTPUT)
    .filter(file => file.endsWith('.sensors.json'));
  const receipts = receiptFiles.map(
    (file): AuditReceipt =>
      JSON.parse(
        fs.readFileSync(path.join(OUTPUT, file), 'utf8'),
      ) as AuditReceipt,
  );
  const manifest = {
    schemaVersion: 1,
    component: 'core/CommandPaletteItem',
    build: checkoutSha,
    frames: cases.map(item => ({
      key: item.key,
      image: `${item.key}.png`,
      receipt: `${item.key}.sensors.json`,
    })),
  };
  fs.writeFileSync(
    path.join(OUTPUT, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  expect(receiptFiles).toHaveLength(cases.length);
  expect(
    receipts
      .filter(receipt => !receipt.passed)
      .map(receipt => receipt.expected),
  ).toEqual([]);
});
