// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListInputReorder.a11y.chromium.spec.ts
 * @input The checked-in Lab/ListInput › Tag Options story, a built Storybook,
 *   real Chromium touch input (CDP) and keys on a phone viewport
 * @output Browser evidence that on a touch screen a keyboard move slides the
 *   records it swaps rather than jumping them in one frame (UIKit's motion is
 *   the same on every touch screen), and that with a mouse the records take
 *   their places without travel
 * @position Chromium proof for ListInput's reorder, which runs on core List's
 *   reorder session (List/useListReorder.ts)
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

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: {width: 390, height: 844},
  deviceScaleFactor: 3,
});

const sleep = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

const HANDLE = '[data-list-input-row] button[data-astryx-list-reorder]';

/** Records whose row (the record's <li>) is moving in the next frame. */
async function movingRecords(page: Page) {
  return page.evaluate(
    async () =>
      new Promise<number>(resolve =>
        requestAnimationFrame(() =>
          resolve(
            Array.from(document.querySelectorAll('[data-list-input-row]'))
              .map(record => record.closest('li'))
              .filter(
                (row): row is HTMLLIElement =>
                  row != null &&
                  row
                    .getAnimations()
                    .some(animation => animation.playState === 'running'),
              ).length,
          ),
        ),
      ),
  );
}
const STORY = 'lab-listinput--tag-options';

test('on a touch screen a keyboard move slides the two records it swaps', async ({
  page,
}) => {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  const handle = page.locator(HANDLE).first();
  await expect(handle).toBeVisible();
  await handle.scrollIntoViewIfNeeded();
  const order = async () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-list-input-row]')).map(row =>
        row.getAttribute('data-list-input-row'),
      ),
    );
  const before = await order();
  await page.keyboard.press('Shift');
  await handle.focus();
  await page.keyboard.press('ArrowDown');
  const moving = await movingRecords(page);
  expect(moving).toBeGreaterThanOrEqual(2);
  await sleep(600);
  const after = await order();
  expect(after[1]).toBe(before[0]);
  expect(after[0]).toBe(before[1]);
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('a keyboard move takes its place without travel', async ({page}) => {
    await page.goto(
      `${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`,
    );
    const handle = page.locator(HANDLE).first();
    await expect(handle).toBeVisible();
    await handle.scrollIntoViewIfNeeded();
    const coarse = await page.evaluate(
      () => matchMedia('(pointer: coarse)').matches,
    );
    expect(coarse).toBe(false);
    await page.keyboard.press('Shift');
    await handle.focus();
    await page.keyboard.press('ArrowDown');
    expect(await movingRecords(page)).toBe(0);
  });
});
