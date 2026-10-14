// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PanelFooter.a11y.chromium.spec.ts
 * @input The `Core/MultiSelector` PanelFooter and PanelFooterWithoutSearch
 *   stories in a built Storybook.
 * @output Real-engine proof that a panel with a footer is a modal dialog
 *   (`component:MultiSelector` FR11, AR1): the dialog's role, modality and
 *   name and the trigger's wiring; Tab and Shift+Tab cycle through the
 *   search field, the listbox when it takes a stop, and the footer, wrapping
 *   at both ends; focus moves into the listbox on open without search;
 *   Escape returns focus to the trigger; a press on the footer toggles
 *   nothing.
 * @position Run with `pnpm test:a11y-contract`; a DOM emulator treats the
 *   popover layer as hidden, so it cannot walk real Tab order through it.
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

async function mount(page: Page, story: string): Promise<void> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-multiselector--${story}&viewMode=story`,
  );
}

test('the panel is a modal dialog named by the label, and the trigger names it', async ({
  page,
}) => {
  await mount(page, 'panel-footer');
  const dialog = page.getByRole('dialog', {name: 'Labels'});
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  for (const part of [
    page.getByRole('combobox'),
    page.getByRole('listbox'),
    page.getByRole('button', {name: 'Manage labels'}),
  ]) {
    await expect(dialog.locator(part)).toHaveCount(1);
  }
  const trigger = page.getByRole('button', {name: /^Labels/});
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  const controlsDialog = await trigger.evaluate(element => {
    const target = document.getElementById(
      element.getAttribute('aria-controls') ?? '',
    );
    return target?.querySelector('[role="dialog"]') != null;
  });
  expect(controlsDialog).toBe(true);
});

test('Tab and Shift+Tab cycle through the search field and the footer and wrap', async ({
  page,
}) => {
  await mount(page, 'panel-footer');
  const search = page.getByRole('combobox');
  const listbox = page.getByRole('listbox');
  const door = page.getByRole('button', {name: 'Manage labels'});
  await expect(search).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(door).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(search).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(door).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(search).toBeFocused();
  await expect(listbox).toBeVisible();
});

test('Escape inside the footer closes the panel and returns focus to the trigger; a press on it toggles nothing', async ({
  page,
}) => {
  await mount(page, 'panel-footer');
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
  await expect(page.getByRole('button', {name: /^Labels/})).toBeFocused();
});

test('without search, focus moves into the listbox, which owns the keys, and Tab wraps through the footer', async ({
  page,
}) => {
  await mount(page, 'panel-footer-without-search');
  const trigger = page.getByRole('combobox', {name: 'Labels'});
  await trigger.click();
  const listbox = page.getByRole('listbox');
  const door = page.getByRole('button', {name: 'Manage labels'});
  await expect(listbox).toBeFocused();
  await expect(trigger).not.toHaveAttribute('aria-activedescendant');

  // The listbox reports the highlighted option and Enter toggles it.
  await page.keyboard.press('ArrowDown');
  const highlighted = await listbox.getAttribute('aria-activedescendant');
  expect(highlighted).toBeTruthy();
  await page.keyboard.press('Enter');
  await expect(page.locator(`[id="${highlighted}"]`)).toHaveAttribute(
    'aria-selected',
    'true',
  );

  await page.keyboard.press('Tab');
  await expect(door).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(listbox).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(listbox).toBeHidden();
  await expect(trigger).toBeFocused();
});
