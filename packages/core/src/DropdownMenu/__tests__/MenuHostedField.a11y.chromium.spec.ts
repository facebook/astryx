// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MenuHostedField.a11y.chromium.spec.ts
 * @input The `Core/DropdownMenu` HostedField story in a built Storybook and
 *   real keyboard and mouse input.
 * @output Real-engine proof that a field and a button a menu hosts beside its
 *   rows keep their own keys while the rows keep the menu's.
 * @position Run with `pnpm test:a11y-contract`.
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

const STORY = 'core-dropdownmenu--hosted-field';
const TRIGGER = '#storybook-root [aria-haspopup="menu"]';

async function openMenu(page: Page) {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  await page.locator(TRIGGER).click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  // A pointer open focuses the menu itself; let that land first.
  await expect(menu).toBeFocused();
}

test('typing into a hosted field stays in the field', async ({page}) => {
  await openMenu(page);
  const field = page.getByRole('textbox', {name: 'Filter labels'});
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.type('bu g');
  await expect(field).toHaveValue('bu g');
  await expect(field).toBeFocused();
  // Mid-text, the caret keys are the field's.
  await page.keyboard.press('Home');
  await expect(field).toBeFocused();
  await expect
    .poll(async () =>
      field.evaluate(el => (el as HTMLInputElement).selectionStart),
    )
    .toBe(0);
  // From the end of the text, ArrowDown moves on to the first row.
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', {name: 'Bug'})).toBeFocused();
});

test('Enter and Space press a hosted button', async ({page}) => {
  await openMenu(page);
  await page.getByRole('button', {name: 'Create label'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('created')).toHaveText('1');
  await page.keyboard.press(' ');
  await expect(page.getByTestId('created')).toHaveText('2');
  await expect(page.getByRole('menu')).toBeVisible();
});
