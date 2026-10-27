// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SwitchPointer.interaction.browser.spec.ts
 * @input The Switch stories in a context with no touch screen (a fine
 *   primary pointer), driven by a real mouse.
 * @output Browser proofs that Switch's gestures work for a mouse and a pen
 *   (`spec:AST-094` FR43): a drag flips it by the flip rule (Switch FR6), a
 *   press slid off and released outside leaves it alone (the
 *   reversible-toggle exception is a finger's), a click toggles once, a right
 *   click does nothing, and the switch keeps its desktop presentation (FR13).
 *   The pen is the harness's real engine pen (Chromium only).
 * @position Beside Switch.interaction.browser.spec.ts, which proves the
 *   touch presentation under a finger.
 */

import {expect, test, type Browser, type Page} from '@playwright/test';
import {
  openStory,
  PEN_SKIP,
  webInputDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** The md track is 40 × 24 and its off thumb 16 × 16: the flip distance. */
const FLIP_DISTANCE = 40 - 16;

interface MouseSwitch {
  page: Page;
  close: () => Promise<void>;
  /** The thumb's center, client px. */
  center: {x: number; y: number};
  isChecked: () => Promise<boolean>;
  /** How many `change` events the input has sent since opening. */
  changes: () => Promise<number>;
}

/**
 * The Default story in a context with no touch screen, so the primary
 * pointer is not coarse. (Contexts made here inherit the project's phone
 * options unless they are named.)
 */
async function openMouseSwitch(
  browser: Browser,
  storyId = 'core-switch--default',
): Promise<MouseSwitch> {
  const context = await browser.newContext({
    viewport: {width: 480, height: 320},
    screen: {width: 480, height: 320},
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  });
  const page = await context.newPage();
  await openStory(page, storybook(), storyId);
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
  await page.evaluate(() => {
    const w = window as unknown as {__changes: number};
    w.__changes = 0;
    document
      .querySelector('#storybook-root [role="switch"]')!
      .addEventListener('change', () => {
        w.__changes++;
      });
  });
  const thumb = await page
    .locator('#storybook-root .astryx-switch-thumb')
    .first()
    .boundingBox();
  if (thumb == null) {
    throw new Error('the switch has no thumb');
  }
  const input = page.locator('#storybook-root').getByRole('switch').first();
  return {
    page,
    close: async () => context.close(),
    center: {x: thumb.x + thumb.width / 2, y: thumb.y + thumb.height / 2},
    isChecked: async () => input.isChecked(),
    changes: async () =>
      page.evaluate(() => (window as unknown as {__changes: number}).__changes),
  };
}

/** A mouse drag through `points`, pressed at the first and released at the last. */
async function mouseDrag(
  page: Page,
  points: ReadonlyArray<{x: number; y: number}>,
): Promise<void> {
  const [first, ...rest] = points;
  await page.mouse.move(first.x, first.y);
  await page.mouse.down();
  for (const point of rest) {
    await page.mouse.move(point.x, point.y, {steps: 8});
  }
  await page.mouse.up();
  // The release's click window (the switch's own click, or the guard).
  await page.waitForTimeout(350);
}

test.describe('Switch under a mouse (spec:AST-094 FR43)', () => {
  test('a drag past the flip distance flips the switch, and the release commits it off the switch too (Switch FR6)', async ({
    browser,
  }) => {
    const sw = await openMouseSwitch(browser);
    try {
      const {x, y} = sw.center;
      // Past the flip, then on past the switch onto its label: the browser
      // sends the input no click for a release that far.
      await mouseDrag(sw.page, [
        {x, y},
        {x: x + FLIP_DISTANCE + 6, y},
        {x: x + 90, y},
      ]);
      expect(await sw.isChecked()).toBe(true);
      expect(await sw.changes()).toBe(1);
    } finally {
      await sw.close();
    }
  });

  test('a drag past the flip distance and back to where it pressed commits nothing: the browser’s click on the input is swallowed', async ({
    browser,
  }) => {
    const sw = await openMouseSwitch(browser);
    try {
      const {x, y} = sw.center;
      await mouseDrag(sw.page, [
        {x, y},
        {x: x + FLIP_DISTANCE + 6, y},
        {x: x - 4, y},
      ]);
      expect(await sw.isChecked()).toBe(false);
      expect(await sw.changes()).toBe(0);
    } finally {
      await sw.close();
    }
  });

  test('a press slid off and released outside without a flip leaves the switch alone: the reversible-toggle exception is a finger’s (Switch FR6)', async ({
    browser,
  }) => {
    const sw = await openMouseSwitch(browser);
    try {
      const {x, y} = sw.center;
      await mouseDrag(sw.page, [
        {x, y},
        {x, y: y + 40},
        {x, y: y + 120},
      ]);
      expect(await sw.isChecked()).toBe(false);
      expect(await sw.changes()).toBe(0);
    } finally {
      await sw.close();
    }
  });

  test('a press released just off the switch, still inside UIControl’s touch slop, with no flip, leaves the switch alone: no browser click comes, and the switch adds none', async ({
    browser,
  }) => {
    const sw = await openMouseSwitch(browser);
    try {
      const {x, y} = sw.center;
      await mouseDrag(sw.page, [
        {x, y},
        {x, y: y + 20},
        {x, y: y + 40},
      ]);
      expect(await sw.isChecked()).toBe(false);
      expect(await sw.changes()).toBe(0);
    } finally {
      await sw.close();
    }
  });

  test('a click toggles once and a right click does nothing', async ({
    browser,
  }) => {
    const sw = await openMouseSwitch(browser);
    try {
      const {x, y} = sw.center;
      await sw.page.mouse.click(x, y);
      await sw.page.waitForTimeout(350);
      expect(await sw.isChecked()).toBe(true);
      expect(await sw.changes()).toBe(1);
      await sw.page.mouse.click(x, y, {button: 'right'});
      await sw.page.keyboard.press('Escape');
      await sw.page.waitForTimeout(350);
      expect(await sw.isChecked()).toBe(true);
      expect(await sw.changes()).toBe(1);
    } finally {
      await sw.close();
    }
  });

  test('the switch keeps horizontal touch moves for its drag under any primary pointer, so a touchscreen laptop’s finger drags it as on a phone (spec:AST-094 FR18, FR43)', async ({
    browser,
  }) => {
    const sw = await openMouseSwitch(browser);
    try {
      const touchAction = await sw.page.evaluate(
        () =>
          getComputedStyle(
            document.querySelector('#storybook-root [role="switch"]')!
              .parentElement!,
          ).touchAction,
      );
      expect(touchAction).toBe('pan-y pinch-zoom');
    } finally {
      await sw.close();
    }
  });

  test('a pen drag past the flip distance flips the switch, and the release commits it off the switch too (Switch FR6)', async ({
    browser,
  }) => {
    const sw = await openMouseSwitch(browser);
    try {
      const driver = await webInputDriver(sw.page);
      test.skip(!driver.pens, PEN_SKIP);
      const {x, y} = sw.center;
      await driver.pen([
        {x, y, t: 0},
        {x: x + 10, y, t: 60},
        {x: x + 20, y, t: 120},
        {x: x + FLIP_DISTANCE + 6, y, t: 180},
        {x: x + 60, y, t: 240},
        {x: x + 90, y, t: 300},
      ]);
      await sw.page.waitForTimeout(350);
      expect(await sw.isChecked()).toBe(true);
      expect(await sw.changes()).toBe(1);
    } finally {
      await sw.close();
    }
  });

  test('a pen slid off and released outside without a flip leaves the switch alone, as a mouse does (Switch FR6)', async ({
    browser,
  }) => {
    const sw = await openMouseSwitch(browser);
    try {
      const driver = await webInputDriver(sw.page);
      test.skip(!driver.pens, PEN_SKIP);
      const {x, y} = sw.center;
      await driver.pen([
        {x, y, t: 0},
        {x, y: y + 20, t: 60},
        {x, y: y + 60, t: 120},
        {x, y: y + 120, t: 180},
      ]);
      await sw.page.waitForTimeout(350);
      expect(await sw.isChecked()).toBe(false);
      expect(await sw.changes()).toBe(0);
    } finally {
      await sw.close();
    }
  });

  test('through a drag the switch keeps its desktop presentation: no lift and no motion of its own on the thumb (FR13)', async ({
    browser,
  }) => {
    const sw = await openMouseSwitch(browser);
    try {
      const {x, y} = sw.center;
      await sw.page.mouse.move(x, y);
      await sw.page.mouse.down();
      await sw.page.mouse.move(x + 12, y, {steps: 4});
      await sw.page.waitForTimeout(200);
      const thumb = await sw.page.evaluate(() => {
        const t = document.querySelector<HTMLElement>(
          '#storybook-root .astryx-switch-thumb',
        )!;
        return {
          inline: [t.style.translate, t.style.scale, t.style.opacity],
          scale: getComputedStyle(t).scale,
          animations: t.getAnimations().length,
        };
      });
      await sw.page.mouse.up();
      expect(thumb.inline).toEqual(['', '', '']);
      expect(thumb.scale).toBe('none');
      expect(thumb.animations).toBe(0);
    } finally {
      await sw.close();
    }
  });
});
