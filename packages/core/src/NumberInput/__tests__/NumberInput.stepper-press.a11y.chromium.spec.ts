// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Real-browser proof that a finger held on a number stepper presses it.
 *
 * iOS Safari selects the nearest text after a finger rests about half a second
 * on content that allows selection: on a stepper that is the field's label,
 * with the edit menu over the field, and the tap that would have stepped is
 * lost. `spec:AST-094` FR41 suppresses text-selection start and the callout
 * for a stepper's hold-repeat press: the press tracker's selection lock turns
 * them off while a finger is down and back on at the lift. The column takes
 * `touch-action: manipulation`, which keeps panning and pinch-zoom the
 * browser's: a scroll that starts on a stepper still scrolls the page and
 * steps nothing. (Chromium's touch emulation does not select on a long press,
 * so the selection itself is checked on the iOS simulator; this proves the
 * paths a hold must not change, including a hold longer than a tap.)
 */

import {expect, test, type Page} from '@playwright/test';
import {holdMotionStill} from '@astryxdesign/a11y-spec/chromium';
import {PEN_SKIP, webInputDriver} from '@astryxdesign/interaction-harness';
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

test.afterAll(async () => storybook?.close());

test.use({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});

async function open(page: Page): Promise<void> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-numberinput--with-number-steppers&viewMode=story`,
  );
  await holdMotionStill(page);
  await page.getByRole('spinbutton', {name: 'Quantity'}).waitFor();
}

// The gesture host writes it inline for the column's kept press where the
// primary pointer is coarse (`spec:AST-094` FR18); the column declares none.
test('under a finger the stepper column takes touch-action manipulation, and the field stays pannable', async ({
  page,
}) => {
  await open(page);
  const column = page
    .getByRole('button', {name: 'Increment Quantity'})
    .locator('..');
  await expect(column).toHaveCSS('touch-action', 'manipulation');
  await expect(page.getByRole('spinbutton', {name: 'Quantity'})).toHaveCSS(
    'touch-action',
    'auto',
  );
});

// `spec:AST-094` FR41: a stepper's hold-repeat press suppresses text-selection
// start and the callout for that press only, through the press tracker's
// selection lock.
test('a held finger refuses text selection on the stepper column for that press only', async ({
  page,
}) => {
  await open(page);
  const plus = page.getByRole('button', {name: 'Increment Quantity'});
  const column = plus.locator('..');
  // Away from iOS WebKit the lock cancels `selectstart` while a finger is
  // down, and writes no style, so nothing repaints.
  const refuses = async () =>
    column.evaluate(el => {
      const event = new Event('selectstart', {bubbles: true, cancelable: true});
      el.dispatchEvent(event);
      return event.defaultPrevented;
    });
  const style = async () =>
    column.evaluate(el =>
      (el as HTMLElement).style.getPropertyValue('user-select'),
    );
  expect(await refuses()).toBe(false);
  const box = await plus.boundingBox();
  if (box == null) {
    throw new Error('the stepper has no box');
  }
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{x: box.x + box.width / 2, y: box.y + box.height / 2}],
  });
  await expect.poll(refuses).toBe(true);
  expect(await style()).toBe('');
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect.poll(refuses).toBe(false);
});

test('under a fine pointer the stepper column takes touch-action manipulation too, so a finger on a touchscreen laptop presses as on a phone (spec:AST-094 FR18, FR43)', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: {width: 1024, height: 768},
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  await open(page);
  // A fine pointer: this context has no coarse pointer.
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
  const column = page
    .getByRole('button', {name: 'Increment Quantity'})
    .locator('..');
  await expect(column).toHaveCSS('touch-action', 'manipulation');
  await context.close();
});

test('under a fine pointer a pen presses a stepper as a mouse does: a tap steps once and focuses the field, a hold repeats and commits once (spec:AST-094 FR43)', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: {width: 1024, height: 768},
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  await open(page);
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
  // Trusted pen input through the engine, paced on the wall clock.
  const driver = await webInputDriver(page);
  test.skip(!driver.pens, PEN_SKIP);
  const input = page.getByRole('spinbutton');
  const box = await page
    .getByRole('button', {name: 'Increment Quantity'})
    .boundingBox();
  if (box == null) {
    throw new Error('the increment half is not laid out');
  }
  const at = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  const before = Number(await input.inputValue());
  // A tap steps once, on its click, and focuses the field where the primary
  // pointer is fine (`component:NumberInput` FR5).
  await driver.pen([
    {...at, t: 0},
    {...at, t: 80},
  ]);
  await expect(input).toHaveValue(String(before + 1));
  await expect(input).toBeFocused();
  // A hold repeats while the pen stays down and commits at the lift.
  await driver.pen([
    {...at, t: 0},
    {...at, t: 1300},
  ]);
  await expect
    .poll(async () => Number(await input.inputValue()))
    .toBeGreaterThan(before + 3);
  await context.close();
});

test('a vertical drag that starts on a stepper scrolls the page and steps nothing', async ({
  page,
}) => {
  await open(page);
  await page.evaluate(() => {
    document.body.style.minHeight = '3000px';
  });
  const input = page.getByRole('spinbutton', {name: 'Quantity'});
  const box = await page
    .getByRole('button', {name: 'Increment Quantity'})
    .boundingBox();
  if (box == null) {
    throw new Error('the stepper has no box');
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{x, y}],
  });
  for (let step = 1; step <= 12; step += 1) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{x, y: y - 8 * step}],
    });
  }
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect
    .poll(async () => page.evaluate(() => scrollY))
    .toBeGreaterThan(0);
  await expect(input).toHaveAttribute('aria-valuenow', '2');
});

test('a tap on a stepper still steps the value', async ({page}) => {
  await open(page);
  const box = await page
    .getByRole('button', {name: 'Increment Quantity'})
    .boundingBox();
  if (box == null) {
    throw new Error('the stepper has no box');
  }
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(
    page.getByRole('spinbutton', {name: 'Quantity'}),
  ).toHaveAttribute('aria-valuenow', '3');
});

/** Holds a finger on + for 1.6 s, longer than a tap; returns the value after. */
async function holdPlus(page: Page): Promise<number> {
  const input = page.getByRole('spinbutton', {name: 'Quantity'});
  const box = await page
    .getByRole('button', {name: 'Increment Quantity'})
    .boundingBox();
  if (box == null) {
    throw new Error('the stepper has no box');
  }
  const point = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [point],
  });
  await page.waitForTimeout(1600);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => String(getSelection()))).toBe('');
  return Number(await input.getAttribute('aria-valuenow'));
}

test('a finger held 1.6 s selects nothing and keeps stepping', async ({
  page,
}) => {
  // The steppers track the finger: a hold repeats from 0.5 s on one steady
  // ramp and commits once, at the lift; the click after the lift adds
  // nothing.
  await open(page);
  // From 2: steps at 500, 750, 975, 1177.5, 1359.75 and 1523.8 ms, and one
  // more if the lift comes after 1671.4 ms.
  const value = await holdPlus(page);
  expect(value).toBeGreaterThanOrEqual(7);
  expect(value).toBeLessThanOrEqual(9);
});
