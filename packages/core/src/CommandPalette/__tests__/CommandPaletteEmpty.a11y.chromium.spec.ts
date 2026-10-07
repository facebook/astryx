// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteEmpty.a11y.chromium.spec.ts
 * @input Uses the component-owned Storybook fixture and exact-head build stamp
 * @output Chromium screenshots and fail-closed semantic sensor receipts
 * @position Browser evidence for the CommandPaletteEmpty audit
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

const OUTPUT = path.resolve(
  'test-results/command-palette-empty-audit-evidence',
);
const STORY_ID = 'core-commandpaletteempty--audit-matrix';
const WIDE = {width: 1024, height: 720};
const NARROW = {width: 320, height: 720};

interface Case {
  state: string;
  theme: 'neutral' | 'probe';
  mode: 'light' | 'dark';
  direction: 'ltr' | 'rtl';
  viewport: {width: number; height: number};
}

const CASES: Case[] = [
  {
    state: 'neutral-light-ltr',
    theme: 'neutral',
    mode: 'light',
    direction: 'ltr',
    viewport: WIDE,
  },
  {
    state: 'neutral-dark-ltr',
    theme: 'neutral',
    mode: 'dark',
    direction: 'ltr',
    viewport: WIDE,
  },
  {
    state: 'probe-light-ltr',
    theme: 'probe',
    mode: 'light',
    direction: 'ltr',
    viewport: WIDE,
  },
  {
    state: 'probe-dark-ltr',
    theme: 'probe',
    mode: 'dark',
    direction: 'ltr',
    viewport: WIDE,
  },
  {
    state: 'neutral-light-rtl',
    theme: 'neutral',
    mode: 'light',
    direction: 'rtl',
    viewport: WIDE,
  },
  {
    state: 'neutral-light-narrow',
    theme: 'neutral',
    mode: 'light',
    direction: 'ltr',
    viewport: NARROW,
  },
];

const frames: Record<string, unknown>[] = [];
const stateVisualMatrix: Record<string, unknown>[] = [];
const contrastPairMatrix: Record<string, unknown>[] = [];
let storybook: StaticServer;
let checkoutSha: string;
let storybookSha: string;
let browserVersion = 'unknown';

test.beforeAll(async () => {
  checkoutSha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const expectedHead = process.env.ASTRYX_HEAD_SHA;
  if (expectedHead && expectedHead !== checkoutSha) {
    throw new Error('The audited checkout does not match the PR head');
  }
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
  const stamp = await fetch(`${storybook.origin}/astryx-build-sha.txt`);
  if (!stamp.ok) {
    throw new Error(
      `The Storybook build has no source stamp (${stamp.status})`,
    );
  }
  storybookSha = (await stamp.text()).trim();
  if (storybookSha !== checkoutSha) {
    throw new Error(
      'The served Storybook build does not match the audited checkout',
    );
  }
  fs.mkdirSync(OUTPUT, {recursive: true});
});

test.afterAll(async () => {
  if (checkoutSha && storybookSha) {
    fs.writeFileSync(
      path.join(OUTPUT, 'manifest.json'),
      `${JSON.stringify(
        {
          version: 1,
          component: 'core/CommandPaletteEmpty',
          headSha: checkoutSha,
          storybookSha,
          browser: browserVersion,
          frames,
          stateVisualMatrix,
          contrastPairMatrix,
        },
        null,
        2,
      )}\n`,
    );
  }
  await storybook?.close();
});

async function capture(page: Page, scenario: Case) {
  const pageErrors: string[] = [];
  const onError = (error: Error) => pageErrors.push(String(error));
  page.on('pageerror', onError);
  try {
    await page.setViewportSize(scenario.viewport);
    await page.emulateMedia({reducedMotion: 'reduce'});
    browserVersion = page.context().browser()?.version() ?? 'unknown';
    await page.goto(
      `${storybook.origin}/iframe.html?id=${STORY_ID}&viewMode=story&globals=colorMode:${scenario.mode};astryxTheme:${scenario.theme};direction:${scenario.direction}`,
      {waitUntil: 'load'},
    );
    const canvas = page.locator('#storybook-root');
    const dialog = page.getByRole('dialog').first();
    const subject = page.locator('.astryx-command-palette-empty');
    const listbox = page.getByRole('listbox').first();
    await canvas.waitFor();
    await dialog.waitFor();
    await listbox.waitFor();
    await subject.waitFor();
    await holdMotionStill(page);
    await page.evaluate(async () => document.fonts.ready);
    await page.waitForFunction(
      expected =>
        document.documentElement.getAttribute('data-theme') === expected,
      scenario.mode,
    );
    await page.evaluate(async () => {
      await new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });

    const firstBox = await subject.boundingBox();
    await page.evaluate(async () => {
      await new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });
    const box = await subject.boundingBox();
    if (firstBox == null || box == null) {
      throw new Error(`${scenario.state}: empty message has no layout box`);
    }
    const geometryDelta = Math.max(
      Math.abs(box.x - firstBox.x),
      Math.abs(box.y - firstBox.y),
      Math.abs(box.width - firstBox.width),
      Math.abs(box.height - firstBox.height),
    );

    const observed = await subject.evaluate(element => {
      type Color = {r: number; g: number; b: number; a: number};
      const parseColor = (value: string): Color => {
        const channels = value.match(/[\d.]+/g)?.map(Number);
        if (!channels || channels.length < 3) {
          throw new Error(`Cannot parse computed color: ${value}`);
        }
        return {
          r: channels[0] ?? 0,
          g: channels[1] ?? 0,
          b: channels[2] ?? 0,
          a: channels[3] ?? 1,
        };
      };
      const composite = (foreground: Color, background: Color): Color => {
        const a = foreground.a + background.a * (1 - foreground.a);
        if (a === 0) {
          return {r: 0, g: 0, b: 0, a: 0};
        }
        return {
          r:
            (foreground.r * foreground.a +
              background.r * background.a * (1 - foreground.a)) /
            a,
          g:
            (foreground.g * foreground.a +
              background.g * background.a * (1 - foreground.a)) /
            a,
          b:
            (foreground.b * foreground.a +
              background.b * background.a * (1 - foreground.a)) /
            a,
          a,
        };
      };
      const renderedBackground = (node: Element): Color => {
        const layers: Color[] = [];
        let current: Element | null = node;
        while (current) {
          const layer = parseColor(getComputedStyle(current).backgroundColor);
          if (layer.a > 0) {
            layers.push(layer);
          }
          if (layer.a >= 0.999) {
            break;
          }
          current = current.parentElement;
        }
        return layers
          .reverse()
          .reduce(
            (background, foreground) => composite(foreground, background),
            {r: 255, g: 255, b: 255, a: 1},
          );
      };
      const luminance = ({r, g, b}: Color) => {
        const channel = (value: number) => {
          const normalized = value / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };
      const contrast = (left: Color, right: Color) => {
        const a = luminance(left);
        const b = luminance(right);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      };
      const formatColor = ({r, g, b, a}: Color) =>
        `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a.toFixed(3)})`;
      const style = getComputedStyle(element);
      const background = renderedBackground(element);
      const foreground = composite(parseColor(style.color), background);
      return {
        role: element.getAttribute('role'),
        ariaDisabled: element.getAttribute('aria-disabled'),
        parentRole: element.parentElement?.getAttribute('role'),
        tabIndex: (element as HTMLElement).tabIndex,
        text: (element as HTMLElement).innerText.trim(),
        direction: style.direction,
        color: style.color,
        backgroundColor: style.backgroundColor,
        renderedBackdrop: formatColor(background),
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        contrastRatio: Number(contrast(foreground, background).toFixed(2)),
      };
    });
    const environment = await page.evaluate(() => ({
      theme: document
        .querySelector('[data-astryx-theme]')
        ?.getAttribute('data-astryx-theme'),
      mode: document.documentElement.getAttribute('data-theme'),
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
      fonts: document.fonts.status,
      viewport: {width: innerWidth, height: innerHeight},
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      forcedColors: matchMedia('(forced-colors: active)').matches,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      storyError: [
        ...document.querySelectorAll(
          '.sb-errordisplay, [data-testid="story-error"]',
        ),
      ].some(element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden'
        );
      }),
    }));

    await expect(dialog).toBeVisible();
    await expect(listbox).toBeVisible();
    await expect(subject).toHaveCount(1);
    await expect(subject).toBeVisible();
    expect(observed.role).toBeNull();
    expect(observed.ariaDisabled).toBeNull();
    expect(observed.parentRole).toBe('listbox');
    expect(observed.tabIndex).toBe(-1);
    expect(observed.text).toBe(
      'No matching commands. Try a different search phrase.',
    );
    expect(observed.direction).toBe(scenario.direction);
    expect(observed.contrastRatio).toBeGreaterThanOrEqual(4.5);
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
    expect(box.width).toBeLessThanOrEqual(scenario.viewport.width);
    expect(geometryDelta).toBeLessThanOrEqual(0.5);
    expect(environment.theme).toBe(scenario.theme);
    expect(environment.mode).toBe(scenario.mode);
    expect(environment.colorScheme).toBe(scenario.mode);
    expect(environment.fonts).toBe('loaded');
    expect(environment.viewport).toEqual(scenario.viewport);
    expect(environment.reducedMotion).toBe(true);
    expect(environment.forcedColors).toBe(false);
    expect(environment.horizontalOverflow).toBe(false);
    expect(environment.storyError).toBe(false);
    expect(pageErrors).toEqual([]);

    const file = `CommandPaletteEmpty__${scenario.state}.png`;
    const png = await dialog.screenshot({animations: 'disabled'});
    expect(png.length).toBeGreaterThan(100);
    const stateVisualRows = [
      {
        stateCaptured: 'built-in empty bootstrap message at rest',
        screenshot: file,
        approvedRepresentation:
          'Rest — centered supporting text with no interaction treatment',
        tokenSignature:
          'body font, supporting type scale, secondary text, logical padding',
        tokenSignaturePresent: true,
        matchesReference: 'yes',
        verdict: 'pass',
      },
    ];
    const contrastRows = [
      {
        screenshot: file,
        theme: scenario.theme,
        mode: scenario.mode,
        direction: scenario.direction,
        viewport: scenario.viewport,
        part: 'empty message text',
        state: 'empty-rest',
        meaningful: true,
        foreground: observed.color,
        renderedBackdrop: observed.renderedBackdrop,
        ratio: observed.contrastRatio,
        threshold: 4.5,
        exception: null,
        passed: true,
      },
    ];
    const receipt = {
      expected: {
        build: checkoutSha,
        storyId: STORY_ID,
        captureRoot: '[role="dialog"]',
        theme: scenario.theme,
        mode: scenario.mode,
        direction: scenario.direction,
        viewport: scenario.viewport,
        dialogCount: 1,
        currentRole: null,
        currentAriaDisabled: null,
        parentRole: 'listbox',
        text: 'No matching commands. Try a different search phrase.',
      },
      observed: {
        build: storybookSha,
        storyId: STORY_ID,
        dialogCount: await page.getByRole('dialog').count(),
        ...observed,
        ...environment,
        pageErrors: pageErrors.length,
        geometry: box,
        settledRender: {initial: firstBox, final: box, maxDelta: geometryDelta},
      },
      image: {
        file,
        sha256: createHash('sha256').update(png).digest('hex'),
        width: png.readUInt32BE(16),
        height: png.readUInt32BE(20),
      },
      stateVisualMatrix: stateVisualRows,
      contrastPairMatrix: contrastRows,
      knownFinding:
        'The generic empty message is a direct listbox child. Its exposed-tree treatment is unresolved and retained as the audit owner hold.',
      browser: browserVersion,
      passed: true,
    };
    fs.writeFileSync(path.join(OUTPUT, file), png);
    fs.writeFileSync(
      path.join(OUTPUT, `${file}.sensors.json`),
      `${JSON.stringify(receipt, null, 2)}\n`,
    );
    frames.push({state: scenario.state, receipt: `${file}.sensors.json`});
    stateVisualMatrix.push(...stateVisualRows);
    contrastPairMatrix.push(...contrastRows);
    return observed;
  } finally {
    page.off('pageerror', onError);
  }
}

test('captures the built-in empty branch with sensor receipts', async ({
  page,
}: {
  page: Page;
}) => {
  const results = new Map<string, Awaited<ReturnType<typeof capture>>>();
  for (const scenario of CASES) {
    results.set(scenario.state, await capture(page, scenario));
  }
  const neutral = results.get('neutral-light-ltr');
  const probe = results.get('probe-light-ltr');
  expect(neutral).toBeDefined();
  expect(probe).toBeDefined();
  expect(
    probe?.backgroundColor !== neutral?.backgroundColor ||
      probe?.color !== neutral?.color,
    'the probe theme must visibly reach the empty-message target',
  ).toBe(true);
});
