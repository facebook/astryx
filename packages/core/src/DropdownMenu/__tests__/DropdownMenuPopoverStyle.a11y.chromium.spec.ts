// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuPopoverStyle.a11y.chromium.spec.ts
 * @input The built DropdownMenu "Popover style" story in real Chromium
 * @output Browser evidence that `popoverXstyle` reaches the box a viewer sees:
 *   the popover surface that paints the menu's background takes the caller's
 *   corner radius over the theme's, while the menu inside it stays
 *   transparent
 * @position Real-engine proof for component:DropdownMenu FR15; jsdom applies
 *   no theme stylesheet, so it cannot show which element paints
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

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

test('popoverXstyle rounds the box that paints the menu, not the transparent menu inside it', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-dropdownmenu--popover-style&viewMode=story`,
  );
  await page.getByRole('button', {name: 'More'}).click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();

  const paint = await menu.evaluate(el => {
    const surface = el.closest('.astryx-popover');
    if (surface == null) {
      throw new Error('no popover surface around the menu');
    }
    const surfaceStyle = getComputedStyle(surface);
    return {
      surfaceRadius: surfaceStyle.borderTopLeftRadius,
      surfaceBackground: surfaceStyle.backgroundColor,
      menuBackground: getComputedStyle(el).backgroundColor,
    };
  });

  // The surface is the painted box: an opaque background, and the caller's
  // radius rather than the theme's container radius.
  expect(paint.surfaceBackground).not.toBe(TRANSPARENT);
  expect(paint.surfaceRadius).toBe('24px');
  // The menu inside paints nothing, which is why `xstyle` cannot round it.
  expect(paint.menuBackground).toBe(TRANSPARENT);
});
