// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListReorderTouch.interaction.browser.spec.ts
 * @input The built List reorder stories, real touch input (Chromium CDP /
 *   WebKit's input command) through the interaction harness, and the claim
 *   delay from the UIKit constants table (motion/uikit/reorder.ts)
 * @output Interaction proofs for a reorderable List under a finger
 *   (spec:AST-103 verification): a hold on a handle then a drag moves the row
 *   and the drop settles it into its new place; a flick on a handle scrolls
 *   and moves nothing; a cancelled drag puts the row back; with Reduce Motion
 *   the drop takes its place without travel; and a flush row's handle stays
 *   inside the list
 * @position Interaction evidence for List's reorder (List/listReorderEngine.tsx,
 *   List/ListReorderTouch.ts, List/ListReorderHandle.tsx) in the touch phone
 *   context (./touchStory.ts)
 */

import {expect, test, type Page} from '@playwright/test';
import {
  flick,
  holdThenDrag,
  touchDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';
import {reorder} from '../../motion/uikit/reorder';
import {openStory} from './touchStory';

const storybook = withStorybook(test);

/** Past the claim delay: the hold claims the drag. */
const HOLD_MS = reorder.claim.delayMs + 150;
/** Long enough for any drop's spring to settle. */
const SETTLE_MS = reorder.settle.maxDuration * 1000 + 300;

const isTouch = async (page: Page) =>
  page.evaluate(() => matchMedia('(pointer: coarse)').matches);

/** The story's row labels, in order. */
async function labels(page: Page): Promise<string[]> {
  return page
    .locator('#storybook-root li')
    .evaluateAll(rows => rows.map(row => row.textContent?.trim() ?? ''));
}

/** The centre of `label`'s handle and the height of its row. */
async function handleOf(page: Page, label: string) {
  const handle = page.getByRole('button', {name: `Reorder ${label}`});
  await expect(handle).toBeVisible();
  const box = await handle.boundingBox();
  const row = await handle
    .locator('xpath=ancestor::li[1]')
    .evaluate(element => element.getBoundingClientRect().height);
  if (box == null) {
    throw new Error(`no handle for ${label}`);
  }
  return {
    at: {x: box.x + box.width / 2, y: box.y + box.height / 2},
    rowHeight: row,
  };
}

/** The layout top of each row, by label, once nothing animates. */
async function settledTops(page: Page): Promise<Record<string, number>> {
  return page.locator('#storybook-root li').evaluateAll(rows => {
    const tops: Record<string, number> = {};
    for (const row of rows) {
      tops[row.textContent?.trim() ?? ''] = Math.round(
        row.getBoundingClientRect().top,
      );
    }
    return tops;
  });
}

test.describe('under a finger', () => {
  test.beforeEach(async ({page}) => {
    await openStory(page, storybook(), 'core-list--reorderable');
    test.skip(
      !(await isTouch(page)),
      'this engine reports a fine primary pointer; the touch hold applies under (pointer: coarse)',
    );
  });

  test('a hold on a handle then a drag moves the row, and the drop settles it into its new place', async ({
    page,
  }) => {
    const before = await settledTops(page);
    const {at, rowHeight} = await handleOf(page, 'Inbox');
    const driver = await touchDriver(page);
    await driver.play(
      holdThenDrag(
        at,
        {x: at.x, y: at.y + rowHeight * 2},
        {holdMs: HOLD_MS, durationMs: 400, restMs: 120},
      ),
    );
    await page.waitForTimeout(SETTLE_MS);
    expect(await labels(page)).toEqual([
      'Sent',
      'Drafts',
      'Inbox',
      'Archive',
      'Spam',
      'Trash',
    ]);
    // Settled: the dropped row sits in the third place, nothing moving.
    const after = await settledTops(page);
    expect(after.Inbox).toBe(before.Drafts);
    expect(
      await page
        .locator('#storybook-root li')
        .evaluateAll(rows =>
          rows.some(row =>
            row
              .getAnimations({subtree: true})
              .some(animation => animation.playState === 'running'),
          ),
        ),
    ).toBe(false);
  });

  test('a cancelled drag puts the row back and moves nothing', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'the cancel is a touchcancel through Chromium CDP',
    );
    const before = await settledTops(page);
    const {at, rowHeight} = await handleOf(page, 'Inbox');
    const driver = await touchDriver(page);
    // The drag without its lift: the finger stays down.
    const script = holdThenDrag(
      at,
      {x: at.x, y: at.y + rowHeight * 2},
      {holdMs: HOLD_MS, durationMs: 400, restMs: 120},
    );
    await driver.play(script.slice(0, -1));
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchCancel',
      touchPoints: [],
    });
    await page.waitForTimeout(SETTLE_MS);
    expect(await labels(page)).toEqual([
      'Inbox',
      'Sent',
      'Drafts',
      'Archive',
      'Spam',
      'Trash',
    ]);
    expect((await settledTops(page)).Inbox).toBe(before.Inbox);
  });

  test('with Reduce Motion the drop takes its place without travel', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const before = await settledTops(page);
    const {at, rowHeight} = await handleOf(page, 'Inbox');
    const driver = await touchDriver(page);
    await driver.play(
      holdThenDrag(
        at,
        {x: at.x, y: at.y + rowHeight * 2},
        {holdMs: HOLD_MS, durationMs: 400, restMs: 120},
      ),
    );
    // Two frames after the lift: already in place, nothing travelling.
    await page.evaluate(
      async () =>
        new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    expect(await labels(page)).toEqual([
      'Sent',
      'Drafts',
      'Inbox',
      'Archive',
      'Spam',
      'Trash',
    ]);
    expect((await settledTops(page)).Inbox).toBe(before.Drafts);
    expect(
      await page
        .locator('#storybook-root li')
        .evaluateAll(rows =>
          rows.some(row =>
            row
              .getAnimations({subtree: true})
              .some(animation => animation.playState === 'running'),
          ),
        ),
    ).toBe(false);
  });
});

test('a flick on a handle scrolls the page and moves nothing', async ({
  page,
}) => {
  await openStory(page, storybook(), 'core-list--reorder-long-list');
  test.skip(
    !(await isTouch(page)),
    'this engine reports a fine primary pointer; the touch hold applies under (pointer: coarse)',
  );
  const order = await labels(page);
  const {at} = await handleOf(page, 'Item 8');
  const driver = await touchDriver(page);
  const scrolled = await page.evaluate(() => window.scrollY);
  await driver.play(flick(at, {velocity: {x: 0, y: -1500}}));
  await page.waitForTimeout(SETTLE_MS);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(scrolled);
  expect(await labels(page)).toEqual(order);
});

test('a flush row keeps its handle inside the list', async ({page}) => {
  await openStory(page, storybook(), 'core-list--reorder-flush');
  const handle = page.getByRole('button', {name: 'Reorder Inbox'});
  await expect(handle).toBeVisible();
  const [handleBox, listBox] = await Promise.all([
    handle.boundingBox(),
    page.locator('#storybook-root ul').first().boundingBox(),
  ]);
  if (handleBox == null || listBox == null) {
    throw new Error('no handle or list');
  }
  expect(handleBox.x + handleBox.width).toBeLessThanOrEqual(
    listBox.x + listBox.width + 0.5,
  );
});
