// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SegmentedWidth.a11y.chromium.spec.ts
 * @input The `Core/SegmentedControl` Default story in a built Storybook, real
 *   clicks (desktop) and taps (phone)
 * @output Real-engine proof that selecting a segment never moves or resizes
 *   any segment, and that assistive technology still reads each title once
 * @position Run with `pnpm test:a11y-contract`. Layout layer of
 *   SegmentedControlItem's title twin (jsdom has no layout); the jsdom layer is
 *   SegmentedControl.test.tsx.
 *
 * The selected title is semibold and an unselected one medium, so a title
 * sized to its own text grows and shrinks with the selection. Each title now
 * shares its grid cell with an aria-hidden twin at the selected weight.
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

const STORY = 'core-segmentedcontrol--default';

const CONTEXTS = {
  desktop: {viewport: {width: 1024, height: 768}},
  phone: {
    viewport: {width: 402, height: 714},
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
} as const;

for (const [name, options] of Object.entries(CONTEXTS)) {
  test(`${name}: selecting a segment never moves or resizes a segment`, async ({
    browser,
  }) => {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    await page.goto(
      `${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`,
    );
    const group = page.getByRole('radiogroup', {name: 'View mode'});
    await expect(group).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const boxes = async () =>
      group.evaluate(track =>
        [...track.querySelectorAll<HTMLElement>('[role="radio"]')].map(
          radio => {
            const box = radio.getBoundingClientRect();
            return {value: radio.dataset.value, x: box.x, width: box.width};
          },
        ),
      );
    const atRest = await boxes();
    expect(atRest).toHaveLength(3);
    for (const value of ['list', 'table', 'grid']) {
      const radio = group.locator(`[data-value="${value}"]`);
      if (name === 'phone') {
        await radio.tap();
      } else {
        await radio.click();
      }
      await expect(radio).toHaveAttribute('aria-checked', 'true');
      const now = await boxes();
      for (const [i, box] of now.entries()) {
        expect(
          Math.abs(box.x - atRest[i].x) < 0.01 &&
            Math.abs(box.width - atRest[i].width) < 0.01,
          `${box.value} moved when ${value} was selected: ${JSON.stringify({
            before: atRest[i],
            after: box,
          })}`,
        ).toBe(true);
      }
    }
    // The twin is invisible to assistive technology: one name per radio.
    await expect(group).toMatchAriaSnapshot(`
      - radiogroup "View mode":
        - radio "Grid" [checked]
        - radio "List"
        - radio "Table"
    `);
    await context.close();
  });
}
