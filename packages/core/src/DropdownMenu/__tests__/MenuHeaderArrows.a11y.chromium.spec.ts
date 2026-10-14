// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MenuHeaderArrows.a11y.chromium.spec.ts
 * @input The built Storybook "Header And Footer" story (a filter field above
 *   the rows) and real Chromium with a real keyboard.
 * @output Evidence for component:DropdownMenu FR17: ArrowDown in the header's
 *   text field moves to the first row, and ArrowUp on the first row returns
 *   to the field, with what was typed and the filtered rows intact; Shift
 *   with an arrow stays in the field.
 * @position Browser proof behind the jsdom header field arrows suite: real
 *   key events, real caret and real focus.
 */

import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

let storybook: StaticServer;
const storyId = 'core-dropdownmenu--header-and-footer';

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});
test.afterAll(async () => {
  await storybook?.close();
});

async function openByKeyboard(page: Page) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${storyId}&viewMode=story`,
  );
  const trigger = page.getByRole('button', {name: 'Labels'});
  await trigger.focus();
  await page.keyboard.press('Enter');
  // A keyboard open lands on the first row.
  await expect(page.getByRole('menuitem', {name: 'Bug'})).toBeFocused();
}

test('ArrowUp on the first row goes to the field and ArrowDown comes back, through a filter', async ({
  page,
}) => {
  await openByKeyboard(page);
  const field = page.getByRole('textbox', {name: 'Filter labels'});

  await page.keyboard.press('ArrowUp');
  await expect(field).toBeFocused();

  await page.keyboard.type('d');
  await expect(page.getByRole('menuitem')).toHaveText([
    'Documentation',
    'Design',
    'Move to',
  ]);
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('menuitem', {name: 'Documentation'}),
  ).toBeFocused();

  await page.keyboard.press('ArrowUp');
  await expect(field).toBeFocused();
  await expect(field).toHaveValue('d');
  // The caret stayed where typing left it.
  expect(
    await field.evaluate(el => (el as HTMLInputElement).selectionStart),
  ).toBe(1);
});

test('Shift with an arrow stays in the field', async ({page}) => {
  await openByKeyboard(page);
  const field = page.getByRole('textbox', {name: 'Filter labels'});
  await page.keyboard.press('ArrowUp');
  await page.keyboard.type('bug');
  await page.keyboard.press('Shift+ArrowUp');
  await page.keyboard.press('Shift+ArrowDown');
  await expect(field).toBeFocused();
  await expect(page.getByRole('menuitem', {name: 'Bug'})).not.toBeFocused();
});
