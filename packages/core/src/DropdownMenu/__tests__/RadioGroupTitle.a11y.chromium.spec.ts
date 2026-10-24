// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioGroupTitle.a11y.chromium.spec.ts
 * @input The built Storybook "Radio group with a title" story and real
 *   Chromium's accessibility tree.
 * @output Evidence that a DropdownMenuRadioGroup with a `title` is one group
 *   with one name: the heading shows as a group heading, the radios sit in a
 *   single group named by it, and the heading is not a row.
 * @position Browser proof behind the jsdom title suite in
 *   DropdownMenuSelectable.test.tsx: what a screen reader is handed.
 */

import {expect, test} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

let storybook: StaticServer;
const storyId = 'core-dropdownmenu--radio-group-with-title';

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});
test.afterAll(async () => {
  await storybook?.close();
});

test('a titled radio set is one group named by its visible heading', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${storyId}&viewMode=story`,
  );
  await expect(page.getByTestId('radio-title-fixture')).toBeVisible();
  await page.getByRole('button', {name: 'Filter'}).click();
  const menu = page.getByRole('menu', {name: 'Filter'});
  await expect(menu).toBeVisible();

  // The menu exposes exactly one group, named once, holding both radios.
  await expect(menu).toMatchAriaSnapshot(`
    - menu "Filter":
      - menuitemcheckbox "Show drafts" [checked]
      - separator
      - group "Hidden files":
        - text: Hidden files
        - menuitemradio "Hide hidden files" [checked]
        - menuitemradio "Show hidden files"
  `);
  const groups = menu.getByRole('group');
  await expect(groups).toHaveCount(1);
  await expect(groups).toHaveAccessibleName('Hidden files');
  await expect(menu.getByText('Hidden files', {exact: true})).toBeVisible();

  // The heading is not a stop: arrows go from the checkbox row to the first
  // radio, and a pick works as in any radio group.
  await menu.getByRole('menuitemcheckbox', {name: 'Show drafts'}).focus();
  await page.keyboard.press('ArrowDown');
  await expect(
    menu.getByRole('menuitemradio', {name: 'Hide hidden files'}),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('hidden')).toHaveText('show');
});
