// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListRowPressPaths.interaction.browser.spec.ts
 * @input The built List "Interactive" and Press Feedback "Rows" stories, the
 *   interaction harness, and the cell release clock (motion/uikit/list.ts)
 * @output The row press paths beside the main release proofs: a press the
 *   browser takes for a scroll drops the highlight at once (the press
 *   controller's cancel, unchanged by the compositor layer); Reduce
 *   Motion keeps the fade (a fade, not a movement); a mouse press and hover on
 *   a fine pointer leave the press layer out of it
 * @position Interaction evidence for the row press layer (utils/interactionOverlay.stylex.ts `cell`), beside
 *   ListRowPress.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  drag,
  holdAnimations,
  openStory,
  releaseAnimations,
  seekAnimations,
  tap,
  touchDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';
import {list} from '../../motion/uikit/list';

const storybook = withStorybook(test);

const RELEASE_MS: number = list.highlight.releaseMs;

const layerOpacity = async (row: Locator) =>
  row.evaluate(el => Number(getComputedStyle(el, '::before').opacity));

const pressState = async (row: Locator) =>
  row.evaluate(el => el.getAttribute('data-astryx-press'));

async function touchOnly(page: Page) {
  const touch = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches,
  );
  test.skip(!touch, 'the press layer serves a touch screen');
}

test("a press the browser takes for a scroll drops the highlight at once (the controller's cancel, unchanged)", async ({
  page,
}) => {
  await openStory(page, storybook(), 'core-press-feedback-touch--rows');
  await touchOnly(page);
  const driver = await touchDriver(page);
  const row = page
    .locator('[data-astryx-pressable]')
    .filter({hasText: 'Conversation 2'})
    .first();
  await expect(row).toBeVisible();
  const box = await row.boundingBox();
  if (box == null) {
    throw new Error('no row');
  }
  // Every press state the controller writes, and every animation the row's
  // layer starts, with page times.
  await row.evaluate(el => {
    const log: string[] = [];
    (window as unknown as {__pressLog: string[]}).__pressLog = log;
    new MutationObserver(() =>
      log.push(`press:${el.getAttribute('data-astryx-press')}`),
    ).observe(el, {attributeFilter: ['data-astryx-press']});
    el.addEventListener('animationstart', event =>
      log.push(`start:${(event as AnimationEvent).pseudoElement}`),
    );
  });
  const from = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  // Held long enough for the highlight to show, then a vertical pan the
  // scroller takes: the browser cancels the touch for the page.
  await driver.play(
    drag(from, {x: from.x, y: from.y - 80}, {holdMs: 300, durationMs: 160}),
  );
  await expect.poll(async () => pressState(row)).toBeNull();
  const log = await page.evaluate(
    () => (window as unknown as {__pressLog: string[]}).__pressLog,
  );
  // Highlighted while held, then the scroll's cancel removes it outright:
  // no release fade starts, and the row is at rest.
  expect(log, JSON.stringify(log)).toContain('press:on');
  expect(log.at(-1), JSON.stringify(log)).toBe('press:null');
  expect(log, JSON.stringify(log)).not.toContain('press:fading');
  expect(log, JSON.stringify(log)).not.toContain('start:::before');
  expect(await layerOpacity(row)).toBe(0);
});

test('Reduce Motion keeps the release fade: a fade, not a movement', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await openStory(page, storybook(), 'core-list--interactive');
  await touchOnly(page);
  const driver = await touchDriver(page);
  const row = page
    .locator('[data-astryx-pressable]')
    .filter({hasText: 'Sent'})
    .first();
  await expect(row).toBeVisible();
  const box = await row.boundingBox();
  if (box == null) {
    throw new Error('no row');
  }
  await driver.play(
    tap({x: box.x + box.width / 2, y: box.y + box.height / 2}, {holdMs: 300}),
  );
  await holdAnimations(page);
  await seekAnimations(page, 0);
  expect(await layerOpacity(row)).toBeCloseTo(1, 2);
  await seekAnimations(page, RELEASE_MS / 2);
  const midway = await layerOpacity(row);
  expect(midway).toBeGreaterThan(0.05);
  expect(midway).toBeLessThan(0.95);
  await releaseAnimations(page, {finish: true});
  await expect.poll(async () => layerOpacity(row)).toBe(0);
});

test('a mouse press and hover on a fine pointer leave the press layer out of it', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: {width: 1024, height: 768},
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  try {
    await openStory(page, storybook(), 'core-list--interactive');
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const fine = await page.evaluate(
      () => matchMedia('(pointer: fine)').matches,
    );
    expect(fine).toBe(true);
    const row = page
      .locator('[data-astryx-pressable]')
      .filter({hasText: 'Sent'})
      .first();
    const box = await row.boundingBox();
    if (box == null) {
      throw new Error('no row');
    }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    expect(await layerOpacity(row)).toBe(0);
    await page.mouse.down();
    expect(await pressState(row)).toBeNull();
    expect(await layerOpacity(row)).toBe(0);
    await page.mouse.up();
    expect(await pressState(row)).toBeNull();
    expect(await layerOpacity(row)).toBe(0);
  } finally {
    await context.close();
  }
});

test('a fine pointer: a row is as it was, with no press layer and no stacking context (desktop unchanged)', async ({
  browser,
}) => {
  // AST-017 FR55: touch work leaves a fine pointer's rows as they were. The
  // press layer and the stacking context it needs exist under a finger only,
  // so a caller's own `::before` and z-index behave as before.
  const context = await browser.newContext({
    viewport: {width: 1024, height: 768},
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  try {
    const rowBox = async (story: string, selector: string, label: string) => {
      await openStory(page, storybook(), story);
      expect(
        await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
      ).toBe(false);
      const row = page.locator(selector).filter({hasText: label}).first();
      await expect(row).toBeVisible();
      return row.evaluate(el => ({
        before: getComputedStyle(el, '::before').content,
        isolation: getComputedStyle(el).isolation,
      }));
    };
    expect(
      await rowBox('core-list--interactive', '[data-astryx-pressable]', 'Sent'),
    ).toEqual({before: 'none', isolation: 'auto'});
    expect(
      await rowBox(
        'core-treelist--with-content-below',
        '#storybook-root [role="treeitem"] [data-astryx-pressable]',
        'src',
      ),
    ).toEqual({before: 'none', isolation: 'auto'});
  } finally {
    await context.close();
  }
});
