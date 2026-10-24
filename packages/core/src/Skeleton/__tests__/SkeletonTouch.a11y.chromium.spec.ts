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

async function open(page: Page) {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
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

  test('a resting placeholder lays out and paints nothing', async ({
    page,
    browser,
  }) => {
    await open(page);
    await browser.startTracing(page, {
      categories: [
        'devtools.timeline',
        'disabled-by-default-devtools.timeline',
      ],
    });
    await page.waitForTimeout(800);
    const trace = JSON.parse((await browser.stopTracing()).toString()) as {
      traceEvents: {
        name: string;
        ph: string;
        pid: number;
        tid: number;
        args?: {name?: string};
      }[];
    };
    const mainThreads = new Set(
      trace.traceEvents
        .filter(e => e.ph === 'M' && e.name === 'thread_name')
        .filter(e => e.args?.name === 'CrRendererMain')
        .map(e => `${e.pid}:${e.tid}`),
    );
    const count = (name: string) =>
      trace.traceEvents.filter(
        e => e.name === name && mainThreads.has(`${e.pid}:${e.tid}`),
      ).length;
    expect(count('Paint')).toBe(0);
    expect(count('Layout')).toBe(0);
  });
});

test.describe('with a mouse or trackpad', () => {
  test.use({hasTouch: false, isMobile: false});

  test('the pulse is unchanged', async ({page}) => {
    await open(page);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const {count, animations, first, second} = await placeholders(page);
    expect(count).toBeGreaterThan(0);
    expect(animations.every(n => n === 1)).toBe(true);
    // The pulse moves the opacity between samples.
    expect(first.some((value, i) => value !== second[i])).toBe(true);
  });
});
