// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Real-browser proof that a finger held on a number stepper presses it.
 *
 * iOS Safari selects the nearest text after a finger rests about half a second
 * on content that allows selection: on a stepper that is the field's label,
 * with the edit menu over the field, and the tap that would have stepped is
 * lost. The stepper column opts out of selection and of the touch callout,
 * and takes `touch-action: manipulation`, which keeps panning and pinch-zoom
 * the browser's: a scroll that starts on a stepper still scrolls the page and
 * steps nothing. Chromium can observe only part of the fix: its computed
 * `user-select` (from the unprefixed declaration) and `touch-action`, and the
 * paths the fix must not change, including a hold longer than a tap. It does
 * not select on a long press and ignores `-webkit-touch-callout`, so the
 * prefixed declarations iOS Safari reads are pinned in NumberInput.test.tsx and
 * the selection itself is proven on the iOS simulator.
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

test('the stepper column opts out of text selection and double-tap zoom', async ({
  page,
}) => {
  await open(page);
  const column = page
    .getByRole('button', {name: 'Increment Quantity'})
    .locator('..');
  await expect(column).toHaveCSS('user-select', 'none');
  await expect(column).toHaveCSS('touch-action', 'manipulation');
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

test('a finger held 1.6 s, longer than a tap, selects nothing', async ({
  page,
}) => {
  // Without the fix iOS Safari selects the field's label here, and past 1.5 s
  // (UIKit's tap maximum) it makes no click, so nothing steps. Chromium does
  // not select on a long press and still clicks once after it: this pins what
  // both engines share (no selection, never more than that one click); the
  // iOS outcome is shown on the simulator.
  await open(page);
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
  expect(['2', '3']).toContain(await input.getAttribute('aria-valuenow'));
});
