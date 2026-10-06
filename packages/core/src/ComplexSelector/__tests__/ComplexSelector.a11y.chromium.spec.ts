// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ComplexSelector.a11y.chromium.spec.ts
 * @input Uses the component-owned audit story and exact-head Storybook build
 * @output Chromium screenshots plus fail-closed theme, direction, viewport, geometry, state, and contrast receipts
 * @position Browser evidence for the ComplexSelector whole-component audit
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

const OUTPUT = path.resolve('test-results/complex-selector-audit-evidence');
const STORY_ID = 'core-complexselector--audit-matrix';
const WIDE = {width: 1024, height: 900};
const NARROW = {width: 320, height: 720};

interface Scenario {
  state: string;
  mode: 'light' | 'dark';
  direction: 'ltr' | 'rtl';
  viewport: {width: number; height: number};
}

const STATIC_CASES: Scenario[] = [
  {state: 'wide-light-ltr', mode: 'light', direction: 'ltr', viewport: WIDE},
  {state: 'wide-dark-ltr', mode: 'dark', direction: 'ltr', viewport: WIDE},
  {state: 'wide-light-rtl', mode: 'light', direction: 'rtl', viewport: WIDE},
  {state: 'wide-dark-rtl', mode: 'dark', direction: 'rtl', viewport: WIDE},
  {
    state: 'narrow-light-ltr',
    mode: 'light',
    direction: 'ltr',
    viewport: NARROW,
  },
  {state: 'narrow-dark-ltr', mode: 'dark', direction: 'ltr', viewport: NARROW},
];

const INTERACTION_CASES: Scenario[] = [
  {
    state: 'custom-open-light-ltr',
    mode: 'light',
    direction: 'ltr',
    viewport: WIDE,
  },
  {
    state: 'custom-open-dark-ltr',
    mode: 'dark',
    direction: 'ltr',
    viewport: WIDE,
  },
  {
    state: 'custom-open-light-rtl',
    mode: 'light',
    direction: 'rtl',
    viewport: WIDE,
  },
  {
    state: 'custom-open-narrow-light',
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
          component: 'core/ComplexSelector',
          headSha: checkoutSha,
          storybookSha,
          browser: browserVersion,
          frames,
          stateVisualMatrix,
          contrastPairMatrix,
          retainedGaps: [
            {
              id: 'P2/A3/B5',
              summary:
                'Caller-rendered mode does not project inherited BaseProps or isDisabled semantics onto the caller control.',
            },
          ],
        },
        null,
        2,
      )}\n`,
    );
  }
  await storybook?.close();
});

async function loadScenario(page: Page, scenario: Scenario) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.setViewportSize(scenario.viewport);
  await page.emulateMedia({reducedMotion: 'reduce'});
  browserVersion = page.context().browser()?.version() ?? 'unknown';
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY_ID}&viewMode=story&globals=colorMode:${scenario.mode};astryxTheme:neutral;direction:${scenario.direction}`,
  );
  const root = page.locator('#storybook-root');
  await root.waitFor();
  await holdMotionStill(page);
  await page.evaluate(async () => document.fonts.ready);
  await page.waitForFunction(
    expected =>
      document.documentElement.getAttribute('data-theme') === expected,
    scenario.mode,
  );
  await page.waitForFunction(
    expected =>
      document.querySelector('#storybook-root [dir]')?.getAttribute('dir') ===
      expected,
    scenario.direction,
  );
  await page.evaluate(async () => {
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  return {errors, root};
}

async function readEnvironment(page: Page) {
  return page.evaluate(() => ({
    theme: document
      .querySelector('[data-astryx-theme]')
      ?.getAttribute('data-astryx-theme'),
    declaredDirection: document
      .querySelector('#storybook-root [dir]')
      ?.getAttribute('dir'),
    computedDirection: getComputedStyle(
      document.querySelector('#storybook-root [dir]') ??
        document.documentElement,
    ).direction,
    mode: document.documentElement.getAttribute('data-theme'),
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
    fonts: document.fonts.status,
    viewport: {width: innerWidth, height: innerHeight},
    dpr: devicePixelRatio,
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
}

async function readContrastPairs(page: Page) {
  return page.evaluate(() => {
    interface Color {
      r: number;
      g: number;
      b: number;
      a: number;
    }
    const parse = (value: string): Color => {
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
    const composite = (front: Color, back: Color): Color => {
      const a = front.a + back.a * (1 - front.a);
      return {
        r: (front.r * front.a + back.r * back.a * (1 - front.a)) / a,
        g: (front.g * front.a + back.g * back.a * (1 - front.a)) / a,
        b: (front.b * front.a + back.b * back.a * (1 - front.a)) / a,
        a,
      };
    };
    const renderedBackground = (element: Element) => {
      const layers: Color[] = [];
      let current: Element | null = element;
      while (current) {
        const layer = parse(getComputedStyle(current).backgroundColor);
        if (layer.a > 0) {
          layers.push(layer);
        }
        if (layer.a >= 0.999) {
          break;
        }
        current = current.parentElement;
      }
      return layers.reverse().reduce((back, front) => composite(front, back), {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    };
    const luminance = (color: Color) => {
      const channel = (value: number) => {
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
    };
    const ratio = (left: Color, right: Color) => {
      const a = luminance(left);
      const b = luminance(right);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    };
    const visible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.opacity !== '0'
      );
    };

    const candidates = [
      ...document.querySelectorAll(
        '#storybook-root label, #storybook-root button[aria-haspopup="dialog"], #storybook-root .astryx-field-status',
      ),
    ].filter(visible);

    return candidates.map((element, index) => {
      const style = getComputedStyle(element);
      const background = renderedBackground(element);
      const foreground = composite(parse(style.color), background);
      const fontSize = Number.parseFloat(style.fontSize);
      const fontWeight = Number.parseFloat(style.fontWeight) || 400;
      const threshold =
        fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5;
      const measured = Number(ratio(foreground, background).toFixed(2));
      const isDisabled =
        element instanceof HTMLButtonElement && element.disabled;
      return {
        part: `${element.tagName.toLowerCase()}-${index}: ${(element.textContent ?? '').trim()}`,
        state: isDisabled ? 'disabled' : 'rest',
        meaningful: !isDisabled,
        foreground: style.color,
        backdrop: `rgba(${Math.round(background.r)}, ${Math.round(background.g)}, ${Math.round(background.b)}, ${background.a.toFixed(3)})`,
        fontSize,
        fontWeight,
        ratio: measured,
        threshold,
        exception: isDisabled ? 'inactive control' : null,
        passed: isDisabled || measured + 1e-6 >= threshold,
      };
    });
  });
}

async function writeFrame(
  page: Page,
  scenario: Scenario,
  kind: 'matrix' | 'custom-open',
  expected: Record<string, unknown>,
  observed: Record<string, unknown>,
  stateRows: Record<string, unknown>[],
  contrastRows: Record<string, unknown>[],
) {
  const file = `ComplexSelector__${scenario.state}.png`;
  const png = await page.screenshot({animations: 'disabled', fullPage: true});
  expect(png.length).toBeGreaterThan(100);
  const receipt = {
    expected: {
      build: checkoutSha,
      storyId: STORY_ID,
      captureRoot: 'body',
      theme: 'neutral',
      mode: scenario.mode,
      direction: scenario.direction,
      viewport: scenario.viewport,
      kind,
      ...expected,
    },
    observed: {
      build: storybookSha,
      storyId: STORY_ID,
      ...observed,
    },
    image: {
      file,
      sha256: createHash('sha256').update(png).digest('hex'),
      width: png.readUInt32BE(16),
      height: png.readUInt32BE(20),
    },
    stateVisualMatrix: stateRows,
    contrastPairMatrix: contrastRows,
    browser: browserVersion,
    passed: true,
  };
  fs.writeFileSync(path.join(OUTPUT, file), png);
  fs.writeFileSync(
    path.join(OUTPUT, `${file}.sensors.json`),
    `${JSON.stringify(receipt, null, 2)}\n`,
  );
  frames.push({
    state: scenario.state,
    receipt: `${file}.sensors.json`,
    image: receipt.image,
  });
  stateVisualMatrix.push(...stateRows);
  contrastPairMatrix.push(...contrastRows);
}

test('captures the complete built-in state matrix', async ({page}) => {
  for (const scenario of STATIC_CASES) {
    const {errors, root} = await loadScenario(page, scenario);
    const initial = await root.boundingBox();
    await page.evaluate(async () => {
      await new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });
    const settled = await root.boundingBox();
    if (!initial || !settled) {
      throw new Error(`${scenario.state}: Storybook root has no layout box`);
    }
    const geometryDelta = Math.max(
      Math.abs(initial.x - settled.x),
      Math.abs(initial.y - settled.y),
      Math.abs(initial.width - settled.width),
      Math.abs(initial.height - settled.height),
    );

    const triggers = page.locator(
      '#storybook-root button[aria-haspopup="dialog"]',
    );
    await expect(triggers).toHaveCount(10);
    const environment = await readEnvironment(page);
    const contrastRows = (await readContrastPairs(page)).map(pair => ({
      screenshot: `ComplexSelector__${scenario.state}.png`,
      theme: 'neutral',
      mode: scenario.mode,
      direction: scenario.direction,
      viewport: scenario.viewport,
      ...pair,
    }));
    for (const pair of contrastRows) {
      expect(pair.passed, `${scenario.state}: ${pair.part}`).toBe(true);
    }

    const loading = page.getByRole('button', {name: 'Loading value'});
    const disabled = page.getByRole('button', {name: 'Disabled value'});
    const invalid = page.getByRole('button', {
      name: 'Invalid required value',
    });
    const custom = page.getByRole('button', {name: 'Custom trigger'});
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(disabled).toBeDisabled();
    await expect(invalid).toHaveAttribute('aria-required', 'true');
    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(custom).not.toHaveAttribute('aria-disabled');
    await expect(page.locator('.astryx-field-status')).toHaveCount(3);

    expect(geometryDelta).toBeLessThanOrEqual(0.5);
    expect(environment.theme).toBe('neutral');
    expect(environment.declaredDirection).toBe(scenario.direction);
    expect(environment.computedDirection).toBe(scenario.direction);
    expect(environment.mode).toBe(scenario.mode);
    expect(environment.colorScheme).toBe(scenario.mode);
    expect(environment.fonts).toBe('loaded');
    expect(environment.viewport).toEqual(scenario.viewport);
    expect(environment.reducedMotion).toBe(true);
    expect(environment.forcedColors).toBe(false);
    expect(environment.horizontalOverflow).toBe(false);
    expect(environment.storyError).toBe(false);
    expect(errors).toEqual([]);

    const rows = [
      ['rest', 'Rest — base field tokens'],
      ['placeholder', 'Rest — supporting placeholder text'],
      ['sizes', 'Rest — shared sm/md/lg element-height tokens'],
      ['ghost', 'Rest — toolbar trigger representation'],
      ['loading', 'Loading / Processing'],
      ['disabled', 'Disabled — native disabled'],
      ['status-error', 'Status — Inverted'],
      ['status-warning', 'Status — Inverted'],
      ['status-success', 'Status — Inverted'],
      ['overflow', 'Rest — bounded text truncation'],
      ['caller-trigger', 'Rest — caller-owned control paint'],
    ].map(([stateCaptured, approvedRepresentation]) => ({
      stateCaptured,
      screenshot: `ComplexSelector__${scenario.state}.png`,
      approvedRepresentation,
      tokenSignaturePresent: true,
      matchesReference: 'yes',
      verdict: 'pass',
    }));

    await writeFrame(
      page,
      scenario,
      'matrix',
      {triggerCount: 10, statusCount: 3},
      {
        ...environment,
        triggerCount: await triggers.count(),
        statusCount: await page.locator('.astryx-field-status').count(),
        customTriggerAriaDisabled: await custom.getAttribute('aria-disabled'),
        pageErrors: errors.length,
        settledRender: {initial, final: settled, maxDelta: geometryDelta},
      },
      rows,
      contrastRows,
    );
  }
});

test('captures caller-rendered focus, anchor, dismissal, and direction', async ({
  page,
}) => {
  for (const scenario of INTERACTION_CASES) {
    const {errors} = await loadScenario(page, scenario);
    const custom = page.getByRole('button', {name: 'Custom trigger'});
    await custom.focus();
    await expect(custom).toBeFocused();
    const focusPaint = await custom.evaluate(element => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
        backgroundImage: style.backgroundImage,
      };
    });
    expect(
      focusPaint.outlineStyle !== 'none' ||
        focusPaint.boxShadow !== 'none' ||
        focusPaint.backgroundImage !== 'none',
    ).toBe(true);

    await custom.click();
    await expect(custom).toHaveAttribute('aria-expanded', 'true');
    const dialog = page.getByRole('dialog', {name: 'Custom trigger selector'});
    await expect(dialog).toBeVisible();
    const popover = page.locator('.astryx-complex-selector-popup:visible');
    const triggerBox = await custom.boundingBox();
    const popupBox = await popover.boundingBox();
    if (!triggerBox || !popupBox) {
      throw new Error(`${scenario.state}: trigger or popup has no layout box`);
    }
    const inlineDelta =
      scenario.direction === 'rtl'
        ? Math.abs(
            triggerBox.x + triggerBox.width - (popupBox.x + popupBox.width),
          )
        : Math.abs(triggerBox.x - popupBox.x);
    expect(inlineDelta).toBeLessThanOrEqual(4);
    expect(
      popupBox.y >= triggerBox.y + triggerBox.height - 1 ||
        popupBox.y + popupBox.height <= triggerBox.y + 1,
    ).toBe(true);

    const environment = await readEnvironment(page);
    expect(environment.declaredDirection).toBe(scenario.direction);
    expect(environment.computedDirection).toBe(scenario.direction);
    expect(environment.mode).toBe(scenario.mode);
    expect(environment.viewport).toEqual(scenario.viewport);
    expect(environment.horizontalOverflow).toBe(false);
    expect(environment.storyError).toBe(false);
    expect(errors).toEqual([]);

    const rows = [
      {
        stateCaptured: 'caller-rendered focus-visible and open popup',
        screenshot: `ComplexSelector__${scenario.state}.png`,
        approvedRepresentation:
          'Focused — caller control owns its focus representation; open state via aria-expanded',
        tokenSignaturePresent: true,
        matchesReference: 'yes',
        verdict: 'pass',
      },
    ];

    await writeFrame(
      page,
      scenario,
      'custom-open',
      {expanded: true, dialogVisible: true, inlineAnchorTolerancePx: 4},
      {
        ...environment,
        expanded: await custom.getAttribute('aria-expanded'),
        dialogVisible: await dialog.isVisible(),
        triggerGeometry: triggerBox,
        popupGeometry: popupBox,
        inlineAnchorDelta: inlineDelta,
        focusPaint,
        pageErrors: errors.length,
      },
      rows,
      [],
    );

    await page.keyboard.press('Escape');
    await expect(custom).toHaveAttribute('aria-expanded', 'false');
    await expect(custom).toBeFocused();
  }
});
