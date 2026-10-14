// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LayerViewportCaps.a11y.chromium.spec.ts
 * @input The built Storybook Layer stories, real Chromium, and a device
 *   safe-area inset emulated through the DevTools protocol
 * @output Evidence for spec:AST-059 FR1-FR3 as shipped: a layer's caps
 *   subtract the larger of the spacing step and the safe-area inset at each
 *   edge, plus a declared bar, not only the env()-less fallback
 * @position Browser proof behind layerViewportInset.build.test.mjs. Chromium
 *   has no dynamic toolbar, so `100vh` and `100dvb` agree here; the safe-area
 *   inset is what the fallback leaves out that Chromium can show.
 */

import {expect, test, type Page} from '@playwright/test';
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

test.use({viewport: {width: 402, height: 714}});

const SPACING = 16;
const BAR = 68;

async function openStory(
  page: Page,
  storyId: string,
  insets: {top: number; left: number; bottom: number; right: number},
) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setSafeAreaInsetsOverride', {insets});
  await page.goto(
    `${storybook.origin}/iframe.html?id=${storyId}&viewMode=story`,
  );
  // Each story's play function opens its layer.
  const layer = page.locator('[popover]:popover-open[id]');
  await expect(layer).toBeVisible();
  await expect(layer).toHaveCount(1);
  return layer;
}

test('the block cap subtracts the bottom safe-area inset and the declared bar (FR1, FR3, FR6)', async ({
  page,
}) => {
  const bottom = 40;
  const layer = await openStory(
    page,
    'core-layer--taller-than-the-viewport-above-a-bar',
    {top: 0, left: 0, bottom, right: 0},
  );
  const box = (await layer.boundingBox())!;
  const viewport = page.viewportSize()!;
  // Gutters: the spacing step at the top, the safe-area inset at the bottom
  // (it is larger), plus the bar.
  const cap = viewport.height - SPACING - (bottom + BAR);
  expect(box.height).toBeCloseTo(cap, 0);
  // The layer ends one gutter above the bar's own safe-area-padded edge.
  expect(box.y + box.height).toBeLessThanOrEqual(
    viewport.height - bottom - BAR + 0.5,
  );
});

test('the inline cap subtracts the side safe-area insets (FR1, FR2)', async ({
  page,
}) => {
  const side = 48;
  const layer = await openStory(page, 'core-layer--explicit-size-near-edge', {
    top: 0,
    left: side,
    bottom: 0,
    right: side,
  });
  const box = (await layer.boundingBox())!;
  const viewport = page.viewportSize()!;
  // The story asks for 352px; the viewport minus the safe-area gutters is
  // 306px, so the cap wins and the layer clears both insets.
  expect(box.width).toBeCloseTo(viewport.width - 2 * side, 0);
  expect(box.x).toBeGreaterThanOrEqual(side - 0.5);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - side + 0.5);
});
