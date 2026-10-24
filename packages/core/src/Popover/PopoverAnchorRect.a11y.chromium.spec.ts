// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PopoverAnchorRect.a11y.chromium.spec.ts
 * @input The `Core/Popover` AnchorRect story in a built Storybook, real mouse
 *   and keyboard input.
 * @output Real-engine evidence that a popover anchored on a viewport rectangle
 *   sits beside it as beside a trigger, that the box it anchors on takes no
 *   pointer, that focus returns to the element that had it, and that a
 *   transformed ancestor does not move it off the rectangle.
 * @position Run with `pnpm test:a11y-contract`; jsdom has no layout, no CSS
 *   anchor positioning and no native popover focus return.
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

const STORY = 'core-popover--anchor-rect';

/** Opens the popover beside the row and checks it sits at the row's end. */
async function openBesideRow(page: Page) {
  const row = page.getByRole('link', {name: 'Session row'});
  const opener = page.getByRole('button', {name: 'Group with…'});
  await opener.click();
  const dialog = page.getByRole('dialog', {name: 'Group sessions'});
  await expect(dialog).toBeVisible();
  const rowBox = await row.boundingBox();
  const dialogBox = await dialog.boundingBox();
  if (rowBox == null || dialogBox == null) {
    throw new Error('the row or the popover has no layout box');
  }
  // placement="end", alignment="start": past the row's end edge by the
  // layer's offset, its top level with the row's.
  const rowEnd = rowBox.x + rowBox.width;
  expect(dialogBox.x).toBeGreaterThanOrEqual(rowEnd);
  expect(dialogBox.x - rowEnd).toBeLessThan(16);
  expect(Math.abs(dialogBox.y - rowBox.y)).toBeLessThan(1);
  return {row, rowBox, opener, dialog};
}

test('a popover anchored on a rectangle sits beside it, takes no pointer, and returns focus on Escape', async ({
  page,
}) => {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  const {rowBox, opener, dialog} = await openBesideRow(page);

  // The box the popover anchors on is never hit: the row's center is the row.
  const hit = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.textContent?.trim(),
    [rowBox.x + rowBox.width / 2, rowBox.y + rowBox.height / 2],
  );
  expect(hit).toBe('Session row');
  // Nothing on the page claims to open or control the popup.
  expect(await page.locator('[aria-haspopup], [aria-expanded]').count()).toBe(
    0,
  );

  await expect(page.getByRole('textbox', {name: 'Group name'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('a transformed ancestor does not move the popover off the rectangle', async ({
  page,
}) => {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  // A transform makes a fixed box relative to the ancestor, not the viewport:
  // move the story's column, which holds the row and the popover.
  await page.getByRole('link', {name: 'Session row'}).evaluate(row => {
    const column = row.parentElement;
    if (column == null) {
      throw new Error('the row has no column');
    }
    column.style.transform = 'translate(40px, 24px)';
  });
  await openBesideRow(page);
});
