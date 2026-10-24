// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListTouchRows.interaction.browser.spec.ts
 * @input The built List stories in the touch phone context (primary pointer
 *   coarse) and the row heights from the UIKit constants table
 *   (motion/uikit/list.ts)
 * @output Layout proofs for List rows on a touch screen: a one-line row is
 *   UIKit's table row height, a row with a description its subtitle height,
 *   a compact row the platform's control size, dividers included; a
 *   storyboard of the three
 * @position Interaction evidence for ListItem's touch row heights
 *   (listRow.stylex.ts)
 */

import {expect, test, type Page} from '@playwright/test';
import {
  openStory,
  Storyboard,
  withStorybook,
} from '@astryxdesign/interaction-harness';
import {list} from '../../motion/uikit/list';

const storybook = withStorybook(test);

async function rowHeights(page: Page): Promise<number[]> {
  // The story's rows (Storybook's own hidden error page has list items too).
  return page
    .locator('#storybook-root li')
    .evaluateAll(rows =>
      rows.map(row => Math.round(row.getBoundingClientRect().height)),
    );
}

const isTouch = async (page: Page) =>
  page.evaluate(() => matchMedia('(pointer: coarse)').matches);

const CASES = [
  {
    story: 'core-list--interactive',
    what: 'a one-line row is UIKit’s table row height',
    height: list.metrics.rowHeight,
  },
  {
    story: 'core-list--basic',
    what: 'a row with a description is UIKit’s subtitle row height',
    height: list.metrics.subtitleRowHeight,
  },
  {
    story: 'core-list--compact',
    what: 'a compact row, divider included, is the platform’s control size',
    height: list.metrics.controlSize,
  },
] as const;

for (const {story, what, height} of CASES) {
  test(`on a touch screen, ${what}`, async ({page}) => {
    await openStory(page, storybook(), story);
    test.skip(
      !(await isTouch(page)),
      'this engine reports a fine primary pointer; the touch heights apply under (pointer: coarse)',
    );
    const heights = await rowHeights(page);
    expect(heights.length).toBeGreaterThan(0);
    for (const h of heights) {
      expect(h).toBe(height);
    }
  });
}

test('storyboard: List rows on a touch screen @storyboard', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'One engine is enough for the record',
  );
  const storyboard = new Storyboard(page, {
    name: 'list-touch-rows',
    columns: 3,
    cellScale: 0.6,
  });
  for (const {story} of CASES) {
    await openStory(page, storybook(), story);
    // One clip size for every cell of the sheet.
    await page.setViewportSize({width: 402, height: 714});
    await storyboard.capture(story, 0, {rows: await rowHeights(page)});
  }
  await storyboard.write(testInfo);
});
