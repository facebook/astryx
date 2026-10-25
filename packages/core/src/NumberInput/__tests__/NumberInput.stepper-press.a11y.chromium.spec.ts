// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Real-browser proof that a finger held on a number stepper presses it.
 *
 * iOS Safari selects the nearest text after a finger rests about half a second
 * on content that allows selection: on a stepper that is the field's label,
 * with the edit menu over the field, and the tap that would have stepped is
 * lost. The gesture host turns selection and the touch callout off on the
 * stepper column while a finger is down, the held stepper's lock
 * (`keepsTouch`; `spec:AST-094` FR41, proposed in #8454), and the column takes
 * `touch-action: manipulation`, which keeps panning and pinch-zoom the
 * browser's: a scroll that starts on a stepper still scrolls the page and
 * steps nothing. (Chromium's touch emulation does not select on a long press,
 * so the selection itself is proven on the iOS simulator; this proves the
 * lock the fix relies on and the paths it must not change, including a hold
 * longer than a tap.)
 */

import {expect, test, type Page} from '@playwright/test';
import {holdMotionStill} from '@astryxdesign/a11y-spec/chromium';
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

test('a held finger turns text selection off on the stepper column, which keeps touch-action manipulation', async ({
  page,
}) => {
  await open(page);
  const plus = page.getByRole('button', {name: 'Increment Quantity'});
  const column = plus.locator('..');
  await expect(column).toHaveCSS('touch-action', 'manipulation');
  // The gesture host locks selection on the column while a finger is down
  // (an inline style), and restores it at the lift: the held stepper's lock
  // (`keepsTouch`; `spec:AST-094` FR41, proposed in #8454).
  const lock = async () =>
    column.evaluate(el =>
      (el as HTMLElement).style.getPropertyValue('user-select'),
    );
  expect(await lock()).toBe('');
  const box = await plus.boundingBox();
  if (box == null) {
    throw new Error('the stepper has no box');
  }
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{x: box.x + box.width / 2, y: box.y + box.height / 2}],
  });
  await expect.poll(lock).toBe('none');
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await expect.poll(lock).toBe('');
  // The field itself stays selectable and pannable.
  await expect(page.getByRole('spinbutton', {name: 'Quantity'})).toHaveCSS(
    'touch-action',
    'auto',
  );
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
