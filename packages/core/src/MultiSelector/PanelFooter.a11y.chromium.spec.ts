// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PanelFooter.a11y.chromium.spec.ts
 * @input The `Core/MultiSelector` PanelFooter story in a built Storybook.
 * @output Real-engine proof of the footer's place in the panel's Tab order:
 *   Tab from the search field reaches the footer's control with the panel
 *   still open, Shift+Tab walks back, Tab past the footer closes the panel,
 *   Escape inside it closes the panel, and a press on it toggles nothing.
 * @position Run with `pnpm test:a11y-contract`; a DOM emulator treats the
 *   popover layer as hidden, so it cannot walk real Tab order through it.
 */

import {expect, test} from '@playwright/test';
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

test('the footer continues the panel Tab order and Tab past it closes the panel', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-multiselector--panel-footer&viewMode=story`,
  );
  const search = page.getByRole('combobox');
  const listbox = page.getByRole('listbox');
  const door = page.getByRole('button', {name: 'Manage labels'});
  await expect(search).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(door).toBeFocused();
  await expect(listbox).toBeVisible();

  await page.keyboard.press('Shift+Tab');
  await expect(search).toBeFocused();
  await expect(listbox).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(door).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(listbox).toBeHidden();
  await expect(door).toBeHidden();
});

test('Escape inside the footer closes the panel; a press on it toggles nothing', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-multiselector--panel-footer&viewMode=story`,
  );
  const listbox = page.getByRole('listbox');
  const door = page.getByRole('button', {name: 'Manage labels'});
  await expect(page.getByRole('combobox')).toBeFocused();

  await door.click();
  await expect(page.getByTestId('manage-count')).toHaveText('1');
  await expect(listbox).toBeVisible();
  await expect(page.getByRole('option', {name: 'Bug'})).toHaveAttribute(
    'aria-selected',
    'true',
  );

  await door.focus();
  await page.keyboard.press('Escape');
  await expect(listbox).toBeHidden();
});
