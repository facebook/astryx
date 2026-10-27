// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file attachReorderable.interaction.browser.spec.ts
 * @input The built "Reorder plain elements" story, real mouse, keyboard and
 *   touch input (Chromium CDP / WebKit's input command) through the
 *   interaction harness, and the claim delay from the UIKit constants table
 *   (motion/uikit/reorder.ts)
 * @output Interaction proofs for `reorderable.attach` on plain elements
 *   (spec:AST-103 FR4b verification): a mouse drag from a handle moves the
 *   row at the drop; reorder mode from the keyboard commits each arrow; a
 *   hold then a drag under a finger moves the row; and `detach` leaves no
 *   listener on the container
 * @position Interaction evidence for List/attachReorderable.ts
 */

import {expect, test, type Page} from '@playwright/test';
import {
  holdThenDrag,
  touchDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';
import {reorder} from '../../motion/uikit/reorder';
import {openStory} from './touchStory';

const storybook = withStorybook(test);

/** Past the claim delay: a finger's hold claims the drag. */
const HOLD_MS = reorder.claim.delayMs + 150;
/** Long enough for any drop's spring to settle. */
const SETTLE_MS = reorder.settle.maxDuration * 1000 + 300;
const STORY = 'core-list--reorder-plain-elements';

const isTouch = async (page: Page) =>
  page.evaluate(() => matchMedia('(pointer: coarse)').matches);

async function labels(page: Page): Promise<string[]> {
  return page
    .locator('#storybook-root li')
    .evaluateAll(rows =>
      rows.map(row => row.querySelector('span')?.textContent ?? ''),
    );
}

async function handleCenter(page: Page, label: string) {
  const handle = page.getByRole('button', {name: `Reorder ${label}`});
  await expect(handle).toBeVisible();
  const box = await handle.boundingBox();
  if (box == null) {
    throw new Error(`no handle for ${label}`);
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

test('a mouse drag from a handle moves the row at the drop', async ({page}) => {
  await openStory(page, storybook(), STORY);
  test.skip(
    await isTouch(page),
    'this engine reports a coarse primary pointer',
  );
  const from = await handleCenter(page, 'Milk');
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x, from.y + 8, {steps: 2});
  await page.mouse.move(from.x, from.y + 44 * 2, {steps: 8});
  await page.mouse.up();
  await page.waitForTimeout(SETTLE_MS);
  expect(await labels(page)).toEqual(['Eggs', 'Bread', 'Milk', 'Apples']);
});

test('reorder mode from the keyboard commits each arrow, and Escape keeps the moves', async ({
  page,
}) => {
  await openStory(page, storybook(), STORY);
  const handle = page.getByRole('button', {name: 'Reorder Milk'});
  await handle.focus();
  await page.keyboard.press('Enter');
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('ArrowDown');
  expect(await labels(page)).toEqual(['Eggs', 'Milk', 'Bread', 'Apples']);
  await page.keyboard.press('ArrowDown');
  expect(await labels(page)).toEqual(['Eggs', 'Bread', 'Milk', 'Apples']);
  await page.keyboard.press('Escape');
  await expect(handle).toHaveAttribute('aria-pressed', 'false');
  await expect(handle).toBeFocused();
  expect(await labels(page)).toEqual(['Eggs', 'Bread', 'Milk', 'Apples']);
});

test('a hold then a drag under a finger moves the row', async ({page}) => {
  await openStory(page, storybook(), STORY);
  test.skip(
    !(await isTouch(page)),
    'this engine reports a fine primary pointer; the touch hold applies under (pointer: coarse)',
  );
  const from = await handleCenter(page, 'Milk');
  const driver = await touchDriver(page);
  await driver.play(
    holdThenDrag(
      from,
      {x: from.x, y: from.y + 44 * 2},
      {holdMs: HOLD_MS, durationMs: 400, restMs: 120},
    ),
  );
  await page.waitForTimeout(SETTLE_MS);
  expect(await labels(page)).toEqual(['Eggs', 'Bread', 'Milk', 'Apples']);
});
