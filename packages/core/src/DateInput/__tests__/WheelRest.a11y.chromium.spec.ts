// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file WheelRest.a11y.chromium.spec.ts
 * @input The built TimeInput bottom-sheet story with bounds, and real
 *   Chromium touch input (CDP) on a phone profile
 * @output Browser evidence that a wheel dragged onto a row outside the bounds
 *   comes to rest on the nearest row inside them and commits it
 * @position Real-engine proof for Wheel.tsx's rest rule through real touch
 *   input; Wheel.test.tsx holds the rule itself.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {picker, UIKIT_GESTURES} from '../../motion/uikit';
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

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: {width: 390, height: 844},
  deviceScaleFactor: 3,
});

const sleep = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

async function openHourWheel(page: Page) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-timeinput--bottom-sheet-with-min-max&viewMode=story`,
  );
  const field = page.getByRole('combobox', {name: 'Appointment time'});
  await expect(field).toHaveValue('10:00 AM');
  await field.tap();
  const hours = page.getByRole('listbox', {name: 'Hour'});
  await expect(hours).toBeVisible();
  // Let the sheet finish presenting, so the drag lands on a wheel at rest.
  await sleep(800);
  return {field, hours};
}

/** A slow one-finger drag: no fling, so the wheel rests where it is let go. */
async function drag(page: Page, wheel: Locator, dy: number) {
  const box = await wheel.boundingBox();
  if (box == null) {
    throw new Error('no rendered bounds');
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{x, y, id: 1}],
  });
  // Slow (well under the release velocity floor), so the wheel rests on the
  // row it is let go on rather than coasting.
  const steps = 60;
  for (let i = 1; i <= steps; i++) {
    await sleep(16);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{x, y: y + (dy * i) / steps, id: 1}],
    });
  }
  // Hold still before lifting, so the release carries no velocity.
  await sleep(200);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
}

const selectedHour = (hours: Locator) =>
  hours.locator('[role="option"][aria-selected="true"]');

/** UIPickerView's row pitch. */
const ROW = picker.geometry.rowHeight;

/**
 * A drag begins only once the finger has travelled the pan's hysteresis,
 * which the rows never show, so each drag adds that and a little more and
 * the wheel rests on the intended row.
 */
const SLOP_ALLOWANCE = UIKIT_GESTURES.pan.hysteresis.value + 6;

test('a wheel dragged below the minimum comes to rest on the minimum', async ({
  page,
}) => {
  const {field, hours} = await openHourWheel(page);
  // 10 → 7: three rows down, past 9 AM.
  await drag(page, hours, 3 * ROW + SLOP_ALLOWANCE);

  await expect(selectedHour(hours)).toHaveText('9', {timeout: 3000});
  await expect(field).toHaveValue('9:00 AM');
});

test('a wheel dragged onto a row inside the bounds commits that row', async ({
  page,
}) => {
  const {field, hours} = await openHourWheel(page);
  // 10 → 11: one row up, still inside the bounds.
  await drag(page, hours, -(ROW + SLOP_ALLOWANCE));

  await expect(selectedHour(hours)).toHaveText('11', {timeout: 3000});
  await expect(field).toHaveValue('11:00 AM');
});
