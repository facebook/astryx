// Copyright (c) Meta Platforms, Inc. and affiliates.
// @pr-a11y always

/**
 * @file WheelRest.a11y.chromium.spec.ts
 * @input The built TimeInput bottom-sheet story with bounds; real Chromium
 *   touch input (CDP) on a phone profile, and a mouse on a desktop one
 * @output Browser evidence that a wheel dragged onto a row outside the bounds
 *   comes to rest on the nearest row inside them and commits it, on the touch
 *   column under a finger and on today's column under a mouse; that a
 *   downward drag on the touch column leaves the sheet where it is; that the
 *   touch sheet draws its wheels as one picker while today's stay separate;
 *   and that today's column under Reduce Motion fades its rows without
 *   tipping them
 * @position Real-engine proof for the rest rule: on the touch column, real
 *   touch input through the gesture system; on today's column, native
 *   scrolling, CSS snapping and the browser's own end-of-scroll signal. None
 *   of it is in jsdom. Wheel.test.tsx and PickerWheel.test.tsx hold the rule.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';
import {UIKIT_GESTURES} from '../../motion/uikit';
import {WHEEL_ROW_PITCH} from '../wheelLook';

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
/** A mouse case runs under a fine primary pointer: the page agrees. */
async function expectFinePointer(page: Page) {
  expect(
    await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
}

async function drag(page: Page, wheel: Locator, dy: number, steps = 30) {
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

/** The touch column's row pitch: today's row. */
const ROW = WHEEL_ROW_PITCH;
/**
 * A drag begins only once the finger has travelled the pan's hysteresis,
 * which the rows never show, so each drag adds that and a little more and
 * the wheel rests on the intended row.
 */
const SLOP_ALLOWANCE = UIKIT_GESTURES.pan.hysteresis.value + 6;
// Slow (well under the release velocity floor), so the wheel rests on the
// row it is let go on rather than coasting.
const SLOW_STEPS = 60;

test('a downward drag on a wheel moves its rows and leaves the sheet where it is', async ({
  page,
}) => {
  const {hours} = await openHourWheel(page);
  const sheet = page.locator('.astryx-bottom-sheet').first();
  // The sheet's top on screen, every frame through the drag.
  await sheet.evaluate(element => {
    const tops: number[] = [];
    (window as unknown as {sheetTops: number[]}).sheetTops = tops;
    const sample = () => {
      tops.push(element.getBoundingClientRect().top);
      if (tops.length < 240) {
        requestAnimationFrame(sample);
      }
    };
    requestAnimationFrame(sample);
  });
  const restingBefore = await hours.getAttribute('aria-activedescendant');
  // Down: the rows move toward the earlier hours.
  await drag(page, hours, 2 * ROW + SLOP_ALLOWANCE, SLOW_STEPS);
  const tops = await page.evaluate(
    () => (window as unknown as {sheetTops: number[]}).sheetTops,
  );
  expect(tops.length).toBeGreaterThan(30);
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(1);
  await expect(hours).not.toHaveAttribute(
    'aria-activedescendant',
    restingBefore ?? '',
  );
});

test('the time wheels draw as one picker, with one band across them', async ({
  page,
}) => {
  await openHourWheel(page);
  await expect(page.locator('[data-wheel]')).toHaveCount(3);
  await expect(page.locator('[data-wheel-band]')).toHaveCount(1);
});

test('a wheel dragged below the minimum comes to rest on the minimum', async ({
  page,
}) => {
  const {field, hours} = await openHourWheel(page);
  // The touch column: a finger gets it on every engine.
  await expect(page.locator('[data-wheel]').first()).toBeVisible();
  // 10 → 7: three rows down, past 9 AM.
  await drag(page, hours, 3 * ROW + SLOP_ALLOWANCE, SLOW_STEPS);

  await expect(selectedHour(hours)).toHaveText('9', {timeout: 3000});
  await expect(field).toHaveValue('9:00 AM');
});

test('a wheel dragged onto a row inside the bounds commits that row', async ({
  page,
}) => {
  const {field, hours} = await openHourWheel(page);
  // 10 → 11: one row up, still inside the bounds.
  await drag(page, hours, -(ROW + SLOP_ALLOWANCE), SLOW_STEPS);

  await expect(selectedHour(hours)).toHaveText('11', {timeout: 3000});
  await expect(field).toHaveValue('11:00 AM');
});

test('under reduced motion an arrow key step lands under its cross-fade, never at full opacity', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {field, hours} = await openHourWheel(page);
  await hours.focus();
  // Every frame from before the key until well after the 200 ms dip: where
  // the committed row (10) is drawn and how opaque its rows are (the scroller
  // or the touch column's rows, whichever holds the options).
  const frames = hours.evaluate(
    async column =>
      new Promise<{at: number; opacity: number}[]>(resolve => {
        const seen: {at: number; opacity: number}[] = [];
        const row = column.querySelector<HTMLElement>(
          '[role="option"][aria-selected="true"]',
        );
        const faded = row?.parentElement ?? column;
        const sample = () => {
          seen.push({
            at: Math.round(
              (row?.getBoundingClientRect().top ?? 0) -
                column.getBoundingClientRect().top,
            ),
            opacity: Number(getComputedStyle(faded).opacity),
          });
          if (seen.length < 45) {
            requestAnimationFrame(sample);
          } else {
            resolve(seen);
          }
        };
        requestAnimationFrame(sample);
      }),
  );
  await sleep(50);
  await page.keyboard.press('ArrowDown');
  const seen = await frames;

  // The rows never move while they are fully visible: they land under the
  // dip (design:reduced-motion DR2), then fade back in on 11.
  const start = seen[0].at;
  const moved = seen.find(frame => frame.at !== start);
  expect(moved, JSON.stringify(seen)).toBeDefined();
  expect(moved?.opacity, JSON.stringify(seen)).toBeLessThan(1);
  expect(seen.at(-1)?.opacity).toBe(1);
  await expect(selectedHour(hours)).toHaveText('11');
  await expect(field).toHaveValue('11:00 AM');
});

test.describe('under a mouse', () => {
  // A desktop: today's column, in the sheet the story asks for.
  test.use({
    hasTouch: false,
    isMobile: false,
    viewport: {width: 1280, height: 800},
    deviceScaleFactor: 1,
  });

  /**
   * A slow mouse drag: a drag starts past its slop, and the release carries
   * no velocity, so the column snaps to the row it is let go on.
   */
  async function mouseDrag(page: Page, wheel: Locator, dy: number) {
    const box = await wheel.boundingBox();
    if (box == null) {
      throw new Error('no rendered bounds');
    }
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const steps = 30;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= steps; i++) {
      await sleep(16);
      await page.mouse.move(x, y + (dy * i) / steps);
    }
    await sleep(200);
    await page.mouse.up();
  }

  /** Today's row height, and the mouse's slop with room to spare. */
  async function rowOf(hours: Locator) {
    return hours
      .locator('[role="option"]')
      .first()
      .evaluate(el => el.getBoundingClientRect().height);
  }
  const MOUSE_SLOP_ALLOWANCE = 8;

  async function openHourWheelWithMouse(page: Page) {
    await page.goto(
      `${storybook.origin}/iframe.html?id=core-timeinput--bottom-sheet-with-min-max&viewMode=story`,
    );
    const field = page.getByRole('combobox', {name: 'Appointment time'});
    await expect(field).toHaveValue('10:00 AM');
    await field.click();
    const hours = page.getByRole('listbox', {name: 'Hour'});
    await expect(hours).toBeVisible();
    // Today's column, not the touch one.
    await expect(page.locator('[data-wheel]')).toHaveCount(0);
    await sleep(800);
    return {field, hours};
  }

  test('a wheel dragged below the minimum comes to rest on the minimum', async ({
    page,
  }) => {
    const {field, hours} = await openHourWheelWithMouse(page);
    // 10 → 7: the content follows the hand, three rows down, past 9 AM.
    await mouseDrag(
      page,
      hours,
      3 * (await rowOf(hours)) + MOUSE_SLOP_ALLOWANCE,
    );

    await expect(selectedHour(hours)).toHaveText('9', {timeout: 3000});
    await expect(field).toHaveValue('9:00 AM');
  });

  test('a wheel dragged onto a row inside the bounds commits that row', async ({
    page,
  }) => {
    const {field, hours} = await openHourWheelWithMouse(page);
    // 10 → 11: one row up, still inside the bounds.
    await mouseDrag(
      page,
      hours,
      -((await rowOf(hours)) + MOUSE_SLOP_ALLOWANCE),
    );

    await expect(selectedHour(hours)).toHaveText('11', {timeout: 3000});
    await expect(field).toHaveValue('11:00 AM');
  });

  test('the time wheels stay separate scrolling columns, with no shared band', async ({
    page,
  }) => {
    await openHourWheelWithMouse(page);
    await expectFinePointer(page);
    await expect(page.locator('[data-wheel-band]')).toHaveCount(0);
    await expect(page.locator('[data-wheel]')).toHaveCount(0);
  });

  test('the DateTimeInput time wheels keep their gutter', async ({page}) => {
    await page.goto(
      `${storybook.origin}/iframe.html?id=core-datetimeinput--default&args=presentation:bottom-sheet&viewMode=story`,
    );
    await expectFinePointer(page);
    await page.getByRole('combobox').first().click();
    await page.getByRole('radio', {name: 'Time'}).click();
    const hour = page.getByRole('listbox', {name: 'Hour'});
    await expect(hour).toBeVisible();
    await expect(page.locator('[data-wheel]')).toHaveCount(0);
    // Each column's box, left to right: today's columns sit a gutter apart,
    // so their bands never touch.
    const boxes = await page
      .locator('[data-panel="time"] [role="listbox"]')
      .evaluateAll(lists =>
        lists
          .map(list => list.getBoundingClientRect())
          .map(box => ({left: box.left, right: box.right}))
          .sort((a, b) => a.left - b.left),
      );
    expect(boxes.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < boxes.length; i++) {
      expect(boxes[i].left - boxes[i - 1].right).toBeGreaterThanOrEqual(8);
    }
  });

  test('under Reduce Motion, the rows fade toward the edges without tipping', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {hours} = await openHourWheelWithMouse(page);
    await expectFinePointer(page);
    // Two rows above the band (8 AM): dimmed, and flat.
    const label = hours.locator('[role="option"]').nth(8).locator('span');
    const {opacity, transform} = await label.evaluate(el => {
      const style = getComputedStyle(el);
      return {opacity: Number(style.opacity), transform: style.transform};
    });
    expect(opacity).toBeLessThan(0.95);
    expect(transform).toBe('none');
  });
});
