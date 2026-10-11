// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuRadioCheck.a11y.chromium.spec.ts
 * @input The `Core/DropdownMenu` RadioGroupCheckMark story in a built
 *   Storybook, real mouse and keyboard input.
 * @output Real-engine proof that a radio group with `indicator="check"` draws,
 *   with the default check indicator, a visible check at the inline end of its
 *   chosen row and no mark on the other rows, and keeps its menuitemradio
 *   semantics.
 * @position Run with `pnpm test:a11y-contract`; jsdom has no layout to show
 *   where the mark sits.
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

const STORY = 'core-dropdownmenu--radio-group-check-mark';
const TRIGGER = '#storybook-root [aria-haspopup="menu"]';
const MARK = '.astryx-dropdown-menu-radio';

async function openMenu(page: Page) {
  await page.locator(TRIGGER).click();
  await expect(page.getByRole('menu')).toBeVisible();
}

test('the chosen row carries a visible check at its inline end; the others draw no mark', async ({
  page,
}) => {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  await openMenu(page);
  const chosen = page.getByRole('menuitemradio', {name: '25 rows'});
  await expect(chosen).toHaveAttribute('aria-checked', 'true');
  const mark = chosen.locator(MARK);
  await expect(mark).toBeVisible();
  const label = await chosen.getByText('25 rows').boundingBox();
  const markBox = await mark.boundingBox();
  const rowBox = await chosen.boundingBox();
  if (label == null || markBox == null || rowBox == null) {
    throw new Error('the chosen row has no rendered bounds');
  }
  // The mark sits after the label, against the row's inline end.
  expect(markBox.x).toBeGreaterThan(label.x + label.width);
  expect(rowBox.x + rowBox.width - (markBox.x + markBox.width)).toBeLessThan(
    24,
  );
  for (const name of ['10 rows', '50 rows']) {
    const row = page.getByRole('menuitemradio', {name});
    await expect(row).toHaveAttribute('aria-checked', 'false');
    await expect(row.locator(MARK)).toHaveCount(0);
  }
  // The unmarked rows' labels start where the marked row's does.
  const other = await page
    .getByRole('menuitemradio', {name: '10 rows'})
    .getByText('10 rows')
    .boundingBox();
  expect(Math.abs((other?.x ?? 0) - label.x)).toBeLessThan(1);
});

test('choosing another row with the keyboard moves the check', async ({
  page,
}) => {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  await page.locator(TRIGGER).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeVisible();
  // Enter opens on the first row; ArrowDown twice reaches "50 rows".
  await expect(
    page.getByRole('menuitemradio', {name: '10 rows'}),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('menuitemradio', {name: '50 rows'}),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeHidden();
  await openMenu(page);
  const chosen = page.getByRole('menuitemradio', {name: '50 rows'});
  await expect(chosen).toHaveAttribute('aria-checked', 'true');
  await expect(chosen.locator(MARK)).toBeVisible();
  await expect(
    page.getByRole('menuitemradio', {name: '25 rows'}).locator(MARK),
  ).toHaveCount(0);
});
