// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SkeletonTouch.a11y.chromium.spec.ts
 * @input Built Skeleton stories in real Chromium, with a coarse (touch)
 *   pointer and with a mouse
 * @output Browser evidence that under a finger a Skeleton rests still at the
 *   pulse's top step, as SwiftUI's redacted placeholder does, and paints
 *   nothing over time, while with a mouse its pulse is unchanged.
 * @position Chromium proof for Skeleton's touch presentation; the iOS Safari
 *   side is a simulator recording attached to the pull request.
 *
 * SYNC: Keep in step with Skeleton.tsx (`styles.animate`).
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

const STORY = 'core-skeleton--default';

async function open(page: Page, globals = '') {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY}&viewMode=story${globals ? `&globals=${globals}` : ''}`,
  );
  await page.waitForSelector('.astryx-skeleton');
  // Past the pulse's start delay (1 s plus the stagger).
  await page.waitForTimeout(1600);
}

/** Each placeholder's running animations and opacity, sampled twice. */
async function placeholders(page: Page) {
  return page.evaluate(async () => {
    const all = Array.from(document.querySelectorAll('.astryx-skeleton'));
    const read = () => all.map(el => Number(getComputedStyle(el).opacity));
    const first = read();
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      count: all.length,
      animations: all.map(el => el.getAnimations().length),
      first,
      second: read(),
    };
  });
}

test.describe('under a finger', () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: {width: 402, height: 600},
  });

  test('every placeholder rests still at the pulse\u2019s top step', async ({
    page,
  }) => {
    await open(page);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(true);
    const {count, animations, first, second} = await placeholders(page);
    expect(count).toBeGreaterThan(0);
    expect(animations.every(n => n === 0)).toBe(true);
    for (let i = 0; i < count; i += 1) {
      // The pulse's top step: SwiftUI's placeholder weight on white.
      expect(first[i]).toBeCloseTo(0.925, 3);
      expect(second[i]).toBe(first[i]);
    }
  });

  test('in dark mode it rests still at the same top step', async ({page}) => {
    await open(page, 'colorMode:dark');
    const {count, animations, first, second} = await placeholders(page);
    // Dark mode applies (the fill is the theme's own dark skeleton color,
    // which this contract leaves to the palette).
    const scheme = await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    );
    expect(scheme).toBe('dark');
    expect(count).toBeGreaterThan(0);
    expect(animations.every(n => n === 0)).toBe(true);
    for (let i = 0; i < count; i += 1) {
      expect(first[i]).toBeCloseTo(0.925, 3);
      expect(second[i]).toBe(first[i]);
    }
  });

  test('reduced motion changes nothing: still at the top step', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await open(page);
    const {count, animations, first, second} = await placeholders(page);
    expect(count).toBeGreaterThan(0);
    expect(animations.every(n => n === 0)).toBe(true);
    for (let i = 0; i < count; i += 1) {
      expect(first[i]).toBeCloseTo(0.925, 3);
      expect(second[i]).toBe(first[i]);
    }
  });

  test('forced colors are unchanged: GrayText at full opacity, still', async ({
    page,
  }) => {
    await page.emulateMedia({forcedColors: 'active'});
    await open(page);
    const {count, animations, first, second} = await placeholders(page);
    expect(count).toBeGreaterThan(0);
    expect(animations.every(n => n === 0)).toBe(true);
    for (let i = 0; i < count; i += 1) {
      expect(first[i]).toBe(1);
      expect(second[i]).toBe(1);
    }
  });
});

test.describe('with a mouse or trackpad', () => {
  test.use({hasTouch: false, isMobile: false});

  test('the pulse is unchanged', async ({page}) => {
    await open(page);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const {count, animations} = await placeholders(page);
    expect(count).toBeGreaterThan(0);
    expect(animations.every(n => n === 1)).toBe(true);
    // The pulse moves the opacity: each placeholder's animation, held at a
    // twentieth and at eleven twentieths of its cycle (past its delay, so a
    // slow machine still in the start delay cannot read two equal rests).
    const [early, late] = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('.astryx-skeleton'));
      const held = (share: number) =>
        all.map(el => {
          const [animation] = el.getAnimations();
          animation.pause();
          const timing = animation.effect?.getTiming();
          const delay = timing?.delay ?? 0;
          const duration =
            Number(animation.effect?.getComputedTiming().duration) || 0;
          animation.currentTime = delay + duration * share;
          return Number(getComputedStyle(el).opacity);
        });
      return [held(0.05), held(0.55)];
    });
    expect(early.every((value, i) => value !== late[i])).toBe(true);
  });

  test('reduced motion still stops the pulse at its 0.25 rest', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await open(page);
    // A fine primary pointer in this context, before any check.
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const {count, animations, first, second} = await placeholders(page);
    expect(count).toBeGreaterThan(0);
    expect(animations.every(n => n === 0)).toBe(true);
    for (let i = 0; i < count; i += 1) {
      expect(first[i]).toBeCloseTo(0.25, 3);
      expect(second[i]).toBe(first[i]);
    }
  });
});
