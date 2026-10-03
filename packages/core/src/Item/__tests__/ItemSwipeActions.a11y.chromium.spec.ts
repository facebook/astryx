// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ItemSwipeActions.a11y.chromium.spec.ts
 * @input The checked-in Core/Item › Swipe Actions story, a built Storybook and
 *   real Chromium touch input
 * @output Pixel proof that a swipeable row paints none of its panel at rest,
 *   reveals it under a touch drag, paints none again when the drag comes back
 *   to its start without lifting, and, released short of the commit point,
 *   shrinks the panel with the row instead of dropping it
 * @position Browser-only regression test for Item's swipeActions. jsdom can
 *   hold the declared rule but not the paint: a zero-width panel is still as
 *   wide as its padding, so only real pixels prove the resting row is clean.
 */

import {expect, test} from '@playwright/test';
// @ts-expect-error -- pngjs ships no declarations; runtime support is pinned.
import {PNG} from 'pngjs';
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

// The gesture is touch only: Chromium accepts dispatched touch points only on
// a context that has a touchscreen.
test.use({hasTouch: true});

type Rgb = [number, number, number];

/** The leading panel sits at the inline start: in this LTR story, the left edge. */
const EDGE_BAND_PX = 8;
/** Per-channel distance beyond which two pixels are different colours. */
const DISTINCT = 24;

interface Shot {
  width: number;
  height: number;
  data: Uint8Array;
}

function decode(buffer: Buffer): Shot {
  const png = PNG.sync.read(buffer);
  return {width: png.width, height: png.height, data: png.data};
}

function pixel(shot: Shot, x: number, y: number): Rgb {
  const i = (y * shot.width + x) * 4;
  return [shot.data[i], shot.data[i + 1], shot.data[i + 2]];
}

function isDistinct(a: Rgb, b: Rgb): boolean {
  return (
    Math.abs(a[0] - b[0]) > DISTINCT ||
    Math.abs(a[1] - b[1]) > DISTINCT ||
    Math.abs(a[2] - b[2]) > DISTINCT
  );
}

/**
 * How many pixels in the row's leading edge band are not the row's own
 * background. The background is sampled at the row's bottom-right corner,
 * which holds neither text nor the panel.
 */
function paintedAtEdge(buffer: Buffer): number {
  const shot = decode(buffer);
  const ground = pixel(shot, shot.width - 2, shot.height - 2);
  let count = 0;
  for (let y = 0; y < shot.height; y += 1) {
    for (let x = 0; x < Math.min(EDGE_BAND_PX, shot.width); x += 1) {
      if (isDistinct(pixel(shot, x, y), ground)) {
        count += 1;
      }
    }
  }
  return count;
}

test('paints no panel at rest, reveals it under a touch drag, and hides it again after the release', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-item--swipe-actions&viewMode=story`,
    {waitUntil: 'load'},
  );
  const row = page.locator('.astryx-item').first();
  await expect(row).toBeVisible();
  // The clipping container wraps the row; the panel is its decorative child.
  const container = row.locator('xpath=..');
  const panel = container.locator('[aria-hidden="true"]').first();
  await expect(panel).toBeAttached();

  // At rest: hidden, and the row's leading edge is nothing but its own
  // background — no sliver of the panel's padding box.
  await expect(panel).toBeHidden();
  expect(paintedAtEdge(await container.screenshot())).toBe(0);

  const box = await container.boundingBox();
  if (box == null) {
    throw new Error('the swipeable row has no box');
  }
  const y = box.y + box.height / 2;
  const startX = box.x + 24;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{x: startX, y}],
  });
  // Past the axis lock and clearly horizontal, short of the commit point.
  for (const dx of [6, 14, 28, 44, 60]) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{x: startX + dx, y}],
    });
  }

  // Under the drag: the panel is shown and its tone fills the revealed edge.
  await expect(panel).toBeVisible();
  await expect
    .poll(async () => paintedAtEdge(await container.screenshot()))
    .toBeGreaterThan(0);

  // Back to the start and past it without lifting: the row is home and the
  // panel is a zero-width box again, so nothing of it paints — not the sliver
  // a padded box at `width: 0` would leave at the edge while the finger is
  // still down.
  for (const dx of [40, 20, 4, -6]) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{x: startX + dx, y}],
    });
  }
  await expect(panel).toBeHidden();
  await expect
    .poll(async () => paintedAtEdge(await container.screenshot()))
    .toBe(0);

  // Out again, then released short of the commit point.
  for (const dx of [10, 30, 50, 60]) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{x: startX + dx, y}],
    });
  }
  await expect(panel).toBeVisible();
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });

  // The spring back: the row slides home over its clock and the panel's width
  // runs on the same one, so mid-flight the revealed gap is still the panel.
  // Sampled a few frames in, before the row is home.
  const midFlight = await container.evaluate(
    async (node, args) =>
      new Promise<{rowX: number; panelWidth: number}>(resolve => {
        setTimeout(() => {
          const rowEl = node.querySelector(args.rowSelector) as HTMLElement;
          const panelEl = node.querySelector(args.panelSelector) as HTMLElement;
          const matrix = new DOMMatrix(getComputedStyle(rowEl).transform);
          resolve({
            rowX: Math.abs(matrix.e),
            panelWidth: parseFloat(getComputedStyle(panelEl).width),
          });
        }, 70);
      }),
    {rowSelector: '.astryx-item', panelSelector: '[aria-hidden="true"]'},
  );
  expect(midFlight.rowX).toBeGreaterThan(4);
  expect(Math.abs(midFlight.panelWidth - midFlight.rowX)).toBeLessThanOrEqual(
    6,
  );

  // Settled: hidden again, with nothing left at the edge.
  await expect(panel).toBeHidden();
  await expect
    .poll(async () => paintedAtEdge(await container.screenshot()))
    .toBe(0);
});
