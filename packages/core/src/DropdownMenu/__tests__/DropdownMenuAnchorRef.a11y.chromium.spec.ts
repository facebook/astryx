// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuAnchorRef.a11y.chromium.spec.ts
 * @input The `Core/DropdownMenu` AnchorRef story in a built Storybook: a
 *   search row whose Filter menu names the row as its `anchorRef`; real mouse
 *   and keyboard input.
 * @output Real-engine proof that the menu is placed and sized against the
 *   row, with its inline end on the row's, while the trigger keeps the
 *   toggle, the press model, the keyboard open and focus return, and a press
 *   elsewhere in the row still dismisses the menu.
 * @position Run with `pnpm test:a11y-contract`; jsdom has no layout and no
 *   popover focus return.
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

const STORY = 'core-dropdownmenu--anchor-ref';

async function mount(page: Page) {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  await expect(page.getByTestId('search-row')).toBeVisible();
}

function trigger(page: Page) {
  return page.getByRole('button', {name: 'Filter'});
}

async function box(page: Page, locator: ReturnType<Page['locator']>) {
  const rect = await locator.boundingBox();
  if (rect == null) {
    throw new Error('no rendered bounds');
  }
  return rect;
}

test("the menu sits under the row, its inline end on the row's, at the row's width", async ({
  page,
}) => {
  await mount(page);
  await trigger(page).click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  const row = await box(page, page.getByTestId('search-row'));
  const surface = await box(page, menu);
  const button = await box(page, trigger(page));
  // Below the row, not merely below the trigger.
  expect(surface.y).toBeGreaterThanOrEqual(row.y + row.height - 1);
  // The inline end lines up with the row's, past the trigger's.
  expect(
    Math.abs(surface.x + surface.width - (row.x + row.width)),
  ).toBeLessThan(1.5);
  expect(row.x + row.width - (button.x + button.width)).toBeGreaterThan(4);
  // The default width is the anchor's.
  expect(Math.abs(surface.width - row.width)).toBeLessThan(1.5);
});

test('a press on the field in the row dismisses the menu; the trigger toggles it', async ({
  page,
}) => {
  await mount(page);
  const menu = page.getByRole('menu');
  await trigger(page).click();
  await expect(menu).toBeVisible();
  const field = page.getByRole('textbox', {name: 'Search'});
  await field.click();
  await expect(menu).toBeHidden();
  await expect(field).toBeFocused();

  await trigger(page).click();
  await expect(menu).toBeVisible();
  await trigger(page).click();
  await expect(menu).toBeHidden();
  await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
});

test('a keyboard open lands on the first row; Escape returns focus to the trigger', async ({
  page,
}) => {
  await mount(page);
  await trigger(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitem', {name: 'Everything'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(trigger(page)).toBeFocused();
});

test('Shift+Tab from the menu continues from the trigger, not from the row the menu is anchored to', async ({
  page,
}) => {
  // The row is the popover's invoker, but Tab closes the menu and returns
  // focus to the trigger first, so the browser moves on from the trigger: to
  // the field before it, which sits inside the row.
  await mount(page);
  await trigger(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitem', {name: 'Everything'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(page.getByRole('textbox', {name: 'Search'})).toBeFocused();
});

test('a mouse press on the trigger opens the menu; a release on a row acts on it', async ({
  page,
}) => {
  await mount(page);
  const start = await box(page, trigger(page));
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  const row = await box(page, page.getByRole('menuitem', {name: 'Mine'}));
  await page.mouse.move(row.x + row.width / 2, row.y + row.height / 2, {
    steps: 5,
  });
  await page.mouse.up();
  await expect(page.getByTestId('showing')).toHaveText('Showing: Mine');
  await expect(menu).toBeHidden();
});
