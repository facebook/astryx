// Copyright (c) Meta Platforms, Inc. and affiliates.
// @pr-a11y scope ^packages/core/src/Avatar/ ^apps/storybook/stories/Avatar

/**
 * @file AvatarForcedColors.a11y.browser.spec.ts
 * @input The built Avatar "Initials Fallback" story in real Chromium, with
 *   forced colors emulated and without
 * @output Browser evidence that, in forced colors, an Avatar's initials take
 *   the color around them: CanvasText by default, GrayText inside a control
 *   that paints itself disabled (`spec:AST-085` FR6), HighlightText inside a
 *   selected one; outside forced colors they keep the theme's color
 * @position Regression proof for Avatar's fallback color
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

/** The initials' color, with `around` painted on the Avatar's own box. */
async function initialsColor(
  page: Page,
  forcedColors: 'active' | 'none',
  around: string | null,
): Promise<{initials: string; reference: string}> {
  await page.emulateMedia({forcedColors});
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-avatar--initials-fallback&viewMode=story`,
  );
  await page.locator('.astryx-avatar-fallback').first().waitFor();
  if (around != null) {
    await page.addStyleTag({content: `.astryx-avatar { ${around} }`});
  }
  return page.evaluate(() => {
    const initials = document.querySelector('.astryx-avatar-fallback');
    // A probe painted with the system color the initials should show.
    const probe = document.createElement('span');
    document.body.append(probe);
    const read = (color: string) => {
      probe.style.color = color;
      return getComputedStyle(probe).color;
    };
    const result = {
      initials: initials == null ? '' : getComputedStyle(initials).color,
      reference: JSON.stringify({
        CanvasText: read('CanvasText'),
        GrayText: read('GrayText'),
        HighlightText: read('HighlightText'),
      }),
    };
    probe.remove();
    return result;
  });
}

test('in forced colors the initials are CanvasText by default', async ({
  page,
}) => {
  const {initials, reference} = await initialsColor(page, 'active', null);
  expect(initials).toBe(JSON.parse(reference).CanvasText);
});

test('in forced colors the initials take GrayText inside a control that paints itself disabled', async ({
  page,
}) => {
  const {initials, reference} = await initialsColor(
    page,
    'active',
    'color: GrayText;',
  );
  expect(initials).toBe(JSON.parse(reference).GrayText);
});

test('in forced colors the initials take HighlightText inside a selected control', async ({
  page,
}) => {
  const {initials, reference} = await initialsColor(
    page,
    'active',
    'forced-color-adjust: none; background: Highlight; color: HighlightText;',
  );
  expect(initials).toBe(JSON.parse(reference).HighlightText);
});

test("outside forced colors the initials keep the theme's color, whatever is around them", async ({
  page,
}) => {
  const plain = await initialsColor(page, 'none', null);
  const around = await initialsColor(page, 'none', 'color: rgb(200, 0, 0);');
  expect(around.initials).toBe(plain.initials);
  expect(plain.initials).not.toBe('rgb(200, 0, 0)');
});
