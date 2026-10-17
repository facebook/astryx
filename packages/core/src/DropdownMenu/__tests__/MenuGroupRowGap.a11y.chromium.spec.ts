// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MenuGroupRowGap.a11y.chromium.spec.ts
 * @input The built Storybook "Group beside plain rows" story (plain rows, a
 *   titled group or section, a divider and a last row, in compound and data
 *   mode) and real Chromium.
 * @output Evidence that rows inside a DropdownMenuGroup or a data-mode
 *   section keep the menu's row gap: the space between two grouped rows, and
 *   between the group's heading and its first row, equals the space between
 *   two plain rows.
 * @position Browser proof behind the class checks in DropdownMenu.test.tsx:
 *   jsdom lays nothing out.
 */

import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

let storybook: StaticServer;
const storyId = 'core-dropdownmenu--group-beside-plain-rows';

test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});
test.afterAll(async () => {
  await storybook?.close();
});

/** The vertical space between two rows, read from the rows themselves. */
async function rowGap(page: Page, upper: string, lower: string) {
  const menu = page.getByRole('menu');
  const a = await menu
    .getByRole('menuitem', {name: upper, exact: true})
    .boundingBox();
  const b = await menu
    .getByRole('menuitem', {name: lower, exact: true})
    .boundingBox();
  return b!.y - (a!.y + a!.height);
}

for (const {trigger, group, first, second} of [
  {
    trigger: 'Compound',
    group: 'Version history',
    first: 'Restore this version',
    second: 'Compare with current',
  },
  {trigger: 'Data', group: 'Create', first: 'New file', second: 'New folder'},
]) {
  test(`${trigger}: grouped rows keep the menu's row gap`, async ({page}) => {
    await page.goto(
      `${storybook.origin}/iframe.html?id=${storyId}&viewMode=story`,
    );
    await expect(page.getByTestId('group-rhythm-fixture')).toBeVisible();
    await page.getByRole('button', {name: trigger}).click();
    await expect(page.getByRole('menu')).toBeVisible();

    const plain = await rowGap(page, 'Rename', 'Duplicate');
    expect(plain).toBeCloseTo(2, 1);
    // Two rows inside the group are spaced like two rows outside it.
    expect(await rowGap(page, first, second)).toBeCloseTo(plain, 1);
    // So are the row before the group and the group's heading, and the
    // heading and the group's first row.
    const heading = page
      .getByRole('group', {name: group})
      .getByText(group, {exact: true});
    const headingBox = (await heading.boundingBox())!;
    const before = (await page
      .getByRole('menuitem', {name: 'Duplicate', exact: true})
      .boundingBox())!;
    const firstRow = (await page
      .getByRole('menuitem', {name: first, exact: true})
      .boundingBox())!;
    expect(headingBox.y - (before.y + before.height)).toBeCloseTo(plain, 1);
    expect(firstRow.y - (headingBox.y + headingBox.height)).toBeCloseTo(
      plain,
      1,
    );
    // The group repeats the menu's own gap, by computed style too.
    const gaps = await page.getByRole('group', {name: group}).evaluate(el => ({
      group: getComputedStyle(el).rowGap,
      menu: getComputedStyle(el.closest('[role="menu"]')!).rowGap,
    }));
    expect(gaps.group).toBe(gaps.menu);
  });
}
