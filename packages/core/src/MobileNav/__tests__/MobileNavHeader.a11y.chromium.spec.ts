// Copyright (c) Meta Platforms, Inc. and affiliates.
// @pr-a11y always

/**
 * @file MobileNavHeader.a11y.chromium.spec.ts
 * @input The built MobileNav Tall Header story (a title over a search
 *   field) in a phone context
 * @output Browser evidence that the header row grows with its content: the
 *   row is taller than one bar and the header content stays inside it, so
 *   nothing spills onto the first nav item
 * @position Chromium proof for MobileNav's `header` row (`minHeight` in
 *   MobileNav.tsx); the jsdom layer is MobileNav.test.tsx
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

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: {width: 402, height: 714},
  deviceScaleFactor: 1,
});

test('a two-row header stays inside its row and pushes the first item down', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-mobilenav-tall-header--default&viewMode=story`,
  );
  await page.getByRole('button', {name: 'Open Navigation'}).tap();
  const nav = page.getByRole('dialog');
  await expect(nav).toBeVisible();
  const drawer = nav.locator('[tabindex="-1"]').first();
  await drawer.evaluate(async element => {
    await Promise.all(element.getAnimations().map(async a => a.finished));
  });

  const content = nav.getByTestId('tall-header');
  const row = content.locator('xpath=..');
  const rowBox = await row.boundingBox();
  const contentBox = await content.boundingBox();
  const firstItem = await nav
    .getByRole('link', {name: 'Dashboard'})
    .boundingBox();
  if (rowBox == null || contentBox == null || firstItem == null) {
    throw new Error('the drawer did not render');
  }

  // One bar is 48 px; a title over a search field is taller than that.
  expect(contentBox.height).toBeGreaterThan(48);
  expect(rowBox.height).toBeGreaterThanOrEqual(contentBox.height - 0.5);
  // The content sits inside the row, top and bottom.
  expect(contentBox.y).toBeGreaterThanOrEqual(rowBox.y - 0.5);
  expect(contentBox.y + contentBox.height).toBeLessThanOrEqual(
    rowBox.y + rowBox.height + 0.5,
  );
  // And the nav items start below the header, not under it.
  expect(firstItem.y).toBeGreaterThanOrEqual(contentBox.y + contentBox.height);
});
