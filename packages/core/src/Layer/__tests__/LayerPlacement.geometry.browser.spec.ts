// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LayerPlacement.geometry.browser.spec.ts
 * @input The built `Core/Layer` "Placement evidence" story, real Chromium and
 *   WebKit, and `CSS.supports` stubbed before the page loads to take anchor
 *   positioning away
 * @output Browser evidence that a layer lands against its trigger, flips at a
 *   viewport edge, and follows scroll — on the engine's own anchor path and on
 *   the measured and anchor-flip paths
 * @position Cross-browser proof for useLayer's placement paths
 *   (`Layer/layerPlacement.ts`). What this proves: the geometry each path
 *   produces on these two engines. What it does not prove: what a shipping
 *   iOS Safari does; the measured path is exercised here by removing
 *   `position-area` from an engine that has it.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

let storybook: StaticServer;
test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});
test.afterAll(async () => {
  await storybook?.close();
});

type Engine = 'native' | 'anchor-flip' | 'measured';

/** Take one or both halves of anchor positioning away before the page runs. */
async function shapeEngine(page: Page, engine: Engine) {
  if (engine === 'native') {
    return;
  }
  await page.addInitScript(
    missing => {
      const supports = CSS.supports.bind(CSS);
      CSS.supports = (property: string, value?: string) => {
        if (missing.includes(property)) {
          return false;
        }
        return value === undefined
          ? supports(property)
          : supports(property, value);
      };
    },
    engine === 'measured'
      ? ['position-area', 'position-try-fallbacks']
      : ['position-try-fallbacks'],
  );
}

async function mount(page: Page, engine: Engine) {
  await shapeEngine(page, engine);
  await page.setViewportSize({width: 800, height: 600});
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-layer--placement-evidence&viewMode=story`,
  );
  await expect(page.getByRole('button', {name: 'Bottom edge'})).toBeVisible();
}

/** Viewport-relative edges of one element (`getBoundingClientRect`). */
async function box(locator: Locator) {
  return locator.evaluate(el => {
    const r = el.getBoundingClientRect();
    return {top: r.top, left: r.left, right: r.right, bottom: r.bottom};
  });
}

function triggerOf(page: Page, label: string) {
  return page.getByRole('button', {name: label, exact: true});
}

function cardOf(page: Page, label: string) {
  return page.getByTestId(`${label} layer`);
}

/** The engine's own answer, so the expected path is read, not assumed. */
async function expectedPath(page: Page, engine: Engine): Promise<string> {
  if (engine !== 'native') {
    return engine;
  }
  return page.evaluate(() => {
    const area = CSS.supports(
      'position-area',
      'self-block-start span-self-inline-end',
    );
    const flip = CSS.supports('position-try-fallbacks', 'flip-block');
    return !area ? 'measured' : !flip ? 'anchor-flip' : 'anchor';
  });
}

async function openLayer(page: Page, label: string) {
  await page.getByRole('button', {name: label, exact: true}).click();
  const layer = page.locator(`[popover]:has([data-testid="${label} layer"])`);
  await expect(layer).toBeVisible();
  return layer;
}

const GUTTER = 16;
const OFFSET = 4;

for (const engine of ['native', 'anchor-flip', 'measured'] as const) {
  test.describe(`${engine} engine`, () => {
    test('a layer asked for below at the bottom edge opens above, inside the viewport', async ({
      page,
    }) => {
      await mount(page, engine);
      const layer = await openLayer(page, 'Bottom edge');
      await expect(layer).toHaveAttribute(
        'data-astryx-layer-placement',
        await expectedPath(page, engine),
      );
      if (engine !== 'native') {
        // Both measuring paths read the viewport gutter back from the
        // element; a path that did not carry it would flip against 0.
        await expect(layer).toHaveCSS('scroll-margin-top', `${GUTTER}px`);
      }
      const trigger = await box(triggerOf(page, 'Bottom edge'));
      const card = await box(cardOf(page, 'Bottom edge'));
      // Above the trigger, with the 4px clearance kept through the flip.
      expect(trigger.top - card.bottom).toBeGreaterThanOrEqual(OFFSET - 1);
      expect(trigger.top - card.bottom).toBeLessThanOrEqual(OFFSET + 1);
      // Start-aligned: the start edges line up.
      expect(Math.abs(card.left - trigger.left)).toBeLessThanOrEqual(1);
      expect(card.top).toBeGreaterThanOrEqual(GUTTER - 1);
      expect(card.bottom).toBeLessThanOrEqual(600 - GUTTER + 1);
    });

    test('a layer asked for above at the top edge opens below', async ({
      page,
    }) => {
      await mount(page, engine);
      await openLayer(page, 'Top edge');
      const trigger = await box(triggerOf(page, 'Top edge'));
      const card = await box(cardOf(page, 'Top edge'));
      expect(card.top - trigger.bottom).toBeGreaterThanOrEqual(OFFSET - 1);
      expect(card.top - trigger.bottom).toBeLessThanOrEqual(OFFSET + 1);
      // Centered on the trigger.
      const triggerMid = (trigger.left + trigger.right) / 2;
      const cardMid = (card.left + card.right) / 2;
      expect(Math.abs(cardMid - triggerMid)).toBeLessThanOrEqual(1);
    });

    test('a layer asked for start at the start edge opens at the end', async ({
      page,
    }) => {
      await mount(page, engine);
      await openLayer(page, 'Start edge');
      const trigger = await box(triggerOf(page, 'Start edge'));
      const card = await box(cardOf(page, 'Start edge'));
      expect(card.left - trigger.right).toBeGreaterThanOrEqual(OFFSET - 1);
      expect(card.left - trigger.right).toBeLessThanOrEqual(OFFSET + 1);
    });

    test('an open layer follows its trigger when the page scrolls', async ({
      page,
    }) => {
      await mount(page, engine);
      await openLayer(page, 'Top edge');
      const before = await box(cardOf(page, 'Top edge'));
      await page.evaluate(() => window.scrollTo(0, 10));
      await expect
        .poll(async () => (await box(cardOf(page, 'Top edge'))).top)
        .toBeCloseTo(before.top - 10, 0);
      const trigger = await box(triggerOf(page, 'Top edge'));
      const card = await box(cardOf(page, 'Top edge'));
      expect(card.top - trigger.bottom).toBeGreaterThanOrEqual(OFFSET - 1);
      expect(card.top - trigger.bottom).toBeLessThanOrEqual(OFFSET + 1);
    });
  });
}
