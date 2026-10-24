// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Real-browser proof of where focus goes when a number stepper is pressed.
 *
 * A finger on a stepper steps the value and leaves focus where it was, as
 * UIStepper (which never becomes first responder) does: focusing the field
 * would bring up the on-screen keyboard on a phone. A mouse click still moves
 * focus to the field, so the arrow keys and the wheel keep stepping. Touches
 * are real touch input (Chromium's touch emulation), not synthetic DOM events.
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

async function open(page: Page): Promise<void> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-numberinput--with-number-steppers&viewMode=story`,
  );
  await holdMotionStill(page);
  await page.getByRole('spinbutton', {name: 'Quantity'}).waitFor();
}

async function center(page: Page, name: string) {
  const box = await page.getByRole('button', {name}).boundingBox();
  if (box == null) {
    throw new Error(`${name} has no box`);
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

const focusedRole = async (page: Page) =>
  page.evaluate(() => document.activeElement?.getAttribute('role') ?? null);

test.describe('on a touch screen', () => {
  test.use({
    viewport: {width: 390, height: 844},
    hasTouch: true,
    isMobile: true,
  });

  test('a tap on a stepper steps the value and leaves the field unfocused', async ({
    page,
  }) => {
    await open(page);
    const input = page.getByRole('spinbutton', {name: 'Quantity'});
    await expect(input).toHaveValue('2');

    const increment = await center(page, 'Increment Quantity');
    await page.touchscreen.tap(increment.x, increment.y);
    await expect(input).toHaveAttribute('aria-valuenow', '3');
    expect(await focusedRole(page)).not.toBe('spinbutton');

    const decrement = await center(page, 'Decrement Quantity');
    await page.touchscreen.tap(decrement.x, decrement.y);
    await page.touchscreen.tap(decrement.x, decrement.y);
    await expect(input).toHaveAttribute('aria-valuenow', '1');
    expect(await focusedRole(page)).not.toBe('spinbutton');
  });

  test('a tap while the field is being edited keeps it focused and steps from the draft', async ({
    page,
  }) => {
    await open(page);
    const input = page.getByRole('spinbutton', {name: 'Quantity'});
    const field = await input.boundingBox();
    if (field == null) {
      throw new Error('the field has no box');
    }
    await page.touchscreen.tap(field.x + 20, field.y + field.height / 2);
    await expect(input).toBeFocused();
    await input.fill('7.5');

    const increment = await center(page, 'Increment Quantity');
    await page.touchscreen.tap(increment.x, increment.y);
    await expect(input).toHaveAttribute('aria-valuenow', '8');
    await expect(input).toBeFocused();
  });
});

test.describe('with a mouse', () => {
  test('a click on a stepper steps the value and focuses the field', async ({
    page,
  }) => {
    await open(page);
    const input = page.getByRole('spinbutton', {name: 'Quantity'});
    await page.getByRole('button', {name: 'Increment Quantity'}).click();
    await expect(input).toHaveAttribute('aria-valuenow', '3');
    await expect(input).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(input).toHaveAttribute('aria-valuenow', '4');
  });
});
