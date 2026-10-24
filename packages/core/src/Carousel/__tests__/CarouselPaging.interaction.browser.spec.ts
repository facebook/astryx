// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CarouselPaging.interaction.browser.spec.ts
 * @input The built "Paging" and "Paging (Loop)" Carousel stories, real touch
 *   input (Chromium CDP / WebKit's input command) and the interaction harness
 * @output Proof that a paging Carousel on a touch screen pages like a UIKit
 *   paging scroll view: the pager owns horizontal pans (touch-action), a slow
 *   drag past half a page and a fast flick each move exactly one page, a
 *   vertical drag leaves the pages alone, the Next button plays
 *   setContentOffset(animated:)'s curve, looping keeps going forward, a
 *   settle keeps advancing through a blocked main thread, a drag changes only
 *   the track's style (no React render), and storyboards of a swipe and of
 *   the loop's wrap
 * @position Browser proof for Carousel `hasPaging` (useCarouselPaging +
 *   hooks/usePager.ts), run by `pnpm test:interaction`
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  busyWindowProof,
  compareCurve,
  curveOf,
  drag,
  flick,
  holdAnimations,
  markElement,
  openStory,
  releaseAnimations,
  sampleCurve,
  startScreencast,
  timeline,
  touchDriver,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

interface OpenCarousel {
  driver: TouchDriver;
  scroller: Locator;
  track: Locator;
  /** One page plus the gap, px. */
  stride: number;
  /** A point on the pages: their vertical middle, near the trailing edge. */
  grab: {x: number; y: number};
  width: number;
}

/**
 * Makes the page's engine answer like WebKit on iOS: no Playwright engine is
 * Mobile Safari, and the iOS idiom keys on `-webkit-touch-callout`, which
 * only WebKit on iOS implements. With a coarse pointer (the phone projects),
 * the Carousel then pages with the shared pager, as on an iPhone.
 */
function asIosWebKit() {
  const supports = CSS.supports.bind(CSS);
  const callout = (text: string) =>
    text.replace(/\s/g, '') === '(-webkit-touch-callout:none)';
  CSS.supports = (property: string, value?: string): boolean =>
    value === undefined
      ? callout(property) || supports(property)
      : property === '-webkit-touch-callout' || supports(property, value);
}

async function openPaging(
  page: Page,
  story = 'core-carousel--paging',
  {ios = true}: {ios?: boolean} = {},
): Promise<OpenCarousel> {
  if (ios) {
    await page.addInitScript(asIosWebKit);
  }
  await openStory(page, storybook(), story);
  const driver = await touchDriver(page);
  const region = page.getByRole('region').first();
  const scroller = region.locator('> div').first();
  const track = scroller.locator('> div').first();
  const geometry = await scroller.evaluate(el => {
    const box = el.getBoundingClientRect();
    const trackEl = el.firstElementChild as HTMLElement;
    const gap = parseFloat(getComputedStyle(trackEl).columnGap) || 0;
    return {
      x: box.x,
      y: box.y,
      width: el.clientWidth,
      height: box.height,
      gap,
    };
  });
  return {
    driver,
    scroller,
    track,
    stride: geometry.width + geometry.gap,
    width: geometry.width,
    grab: {
      x: geometry.x + geometry.width * 0.8,
      y: geometry.y + geometry.height / 2,
    },
  };
}

const trackX = async (track: Locator) =>
  track.evaluate(el => {
    const value = getComputedStyle(el).translate;
    return value === 'none' ? 0 : parseFloat(value);
  });

/** The title of the page under the viewport's centre. */
const pageOnScreen = async (scroller: Locator) =>
  scroller.evaluate(el => {
    const box = el.getBoundingClientRect();
    const hit = document.elementFromPoint(
      box.x + box.width / 2,
      box.y + box.height / 2,
    );
    return hit?.closest('[aria-roledescription="slide"]')?.querySelector('h3')
      ?.textContent;
  });

test('the pager owns horizontal pans; nothing scrolls natively', async ({
  page,
}) => {
  const {scroller} = await openPaging(page);
  const style = await scroller.evaluate(el => ({
    touchAction: getComputedStyle(el).touchAction,
    overflowX: getComputedStyle(el).overflowX,
  }));
  expect(style.touchAction).toBe('pan-y pinch-zoom');
  expect(style.overflowX).toBe('clip');
});

test('a slow drag past half a page and a fast flick each move exactly one page', async ({
  page,
}) => {
  const {driver, scroller, track, stride, width, grab} = await openPaging(page);
  expect(await pageOnScreen(scroller)).toBe('Plan');
  // 60 % of a page at under 300 px/s, then still: the nearest page.
  await driver.play(
    drag(
      grab,
      {x: grab.x - 0.6 * width, y: grab.y},
      {durationMs: 1000, restMs: 120},
    ),
  );
  await waitForRest(track);
  expect(await trackX(track)).toBeCloseTo(-stride, 0);
  expect(await pageOnScreen(scroller)).toBe('Pack');
  // A hard flick from rest: still one page.
  await driver.play(
    flick(grab, {velocity: {x: -3000, y: 0}, durationMs: 80, hz: 120}),
  );
  await waitForRest(track);
  expect(await trackX(track)).toBeCloseTo(-2 * stride, 0);
  expect(await pageOnScreen(scroller)).toBe('Go');
});

test('a vertical drag leaves the pages alone', async ({page}) => {
  const {driver, track, grab} = await openPaging(page);
  await driver.play(
    drag(grab, {x: grab.x - 20, y: grab.y - 120}, {durationMs: 300}),
  );
  await page.waitForTimeout(100);
  expect(await trackX(track)).toBeCloseTo(0, 0);
});

test("the Next button plays setContentOffset(animated:)'s curve", async ({
  page,
}) => {
  const {driver, track, stride} = await openPaging(page);
  const next = page.getByRole('button', {name: 'Scroll right'});
  const box = await next.boundingBox();
  if (box == null) {
    throw new Error('no Next button');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  await waitForAnimation(track);
  const held = await holdAnimations(page, track);
  const end = Math.max(...held.map(a => a.curveEndMs));
  expect(end).toBeGreaterThan(290);
  expect(end).toBeLessThan(310);
  const samples = curveOf(
    await sampleCurve(track, timeline(end)),
    'translateX',
  );
  const result = compareCurve(
    samples,
    t => (-stride * (1 - Math.cos(Math.PI * Math.min(1, t / 300)))) / 2,
    0.5,
  );
  expect(result.maxError).toBeLessThan(0.5);
  await releaseAnimations(page);
});

test('with hasLoop, swiping past the last page keeps going forward', async ({
  page,
}) => {
  const {driver, scroller, track, width, grab} = await openPaging(
    page,
    'core-carousel--paging-loop',
  );
  const titles: (string | null | undefined)[] = [];
  for (let i = 0; i < 6; i++) {
    await driver.play(
      flick(grab, {velocity: {x: -1500, y: 0}, durationMs: 100, hz: 120}),
    );
    await waitForRest(track);
    titles.push(await pageOnScreen(scroller));
  }
  expect(titles).toEqual(['Pack', 'Go', 'Share', 'Remember', 'Plan', 'Pack']);
  // And back across the seam the other way.
  await driver.play(
    flick(
      {x: grab.x - width * 0.6, y: grab.y},
      {velocity: {x: 1500, y: 0}, durationMs: 100, hz: 120},
    ),
  );
  await waitForRest(track);
  expect(await pageOnScreen(scroller)).toBe('Plan');
});

test('in a scrolling page: a vertical drag scrolls the page, a horizontal one pages, a 35° one moves neither', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'injected touches do not scroll natively in Linux WebKit (harness README)',
  );
  const {driver, scroller, track, stride, width, grab} = await openPaging(
    page,
    'core-carousel--paging-in-long-page',
  );
  const scrollY = async () => page.evaluate(() => window.scrollY);
  // Steep (vertical): the page scrolls, the pages stay.
  await driver.play(
    drag(
      grab,
      {x: grab.x - 10, y: grab.y - 150},
      {durationMs: 400, restMs: 120},
    ),
  );
  await page.waitForTimeout(300);
  const scrolled = await scrollY();
  expect(scrolled).toBeGreaterThan(80);
  expect(await trackX(track)).toBeCloseTo(0, 0);
  // Horizontal: one page, the page holds still.
  const box = await scroller.boundingBox();
  if (box == null) {
    throw new Error('no scroller');
  }
  const mid = {x: box.x + box.width * 0.8, y: box.y + box.height / 2};
  await driver.play(
    drag(
      mid,
      {x: mid.x - 0.6 * width, y: mid.y},
      {durationMs: 600, restMs: 120},
    ),
  );
  await waitForRest(track);
  expect(await trackX(track)).toBeCloseTo(-stride, 0);
  expect(await scrollY()).toBeCloseTo(scrolled, 0);
  // 35° from horizontal: neither the pages nor the page move (UIKit: a
  // horizontal pager in a sheet moves neither at 35° and 45°).
  const angle = (35 * Math.PI) / 180;
  await driver.play(
    drag(
      mid,
      {x: mid.x - 160 * Math.cos(angle), y: mid.y - 160 * Math.sin(angle)},
      {durationMs: 500, restMs: 120},
    ),
  );
  await page.waitForTimeout(300);
  expect(await trackX(track)).toBeCloseTo(-stride, 0);
  expect(await scrollY()).toBeCloseTo(scrolled, 0);
});

test('outside iOS (an Android phone) the pages snap natively, one per flick', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'injected touches do not scroll natively in Linux WebKit (harness README)',
  );
  const {driver, scroller, track, stride, width, grab} = await openPaging(
    page,
    'core-carousel--paging',
    {ios: false},
  );
  const styles = await scroller.evaluate(el => {
    const style = getComputedStyle(el);
    return {
      overflowX: style.overflowX,
      snap: style.scrollSnapType,
      coarse: matchMedia('(pointer: coarse)').matches,
      ios: CSS.supports('(-webkit-touch-callout: none)'),
    };
  });
  expect(styles).toEqual({
    overflowX: 'auto',
    snap: 'x mandatory',
    coarse: true,
    ios: false,
  });
  await driver.play(flick(grab, {velocity: {x: -1200, y: 0}, durationMs: 100}));
  await expect
    .poll(async () => scroller.evaluate(el => el.scrollLeft), {timeout: 3000})
    .toBeCloseTo(stride, 0);
  // The pager never moved the track.
  expect(await trackX(track)).toBe(0);
  expect(width).toBeGreaterThan(0);
});

test("under Reduce Motion the settle and Next keep UIKit's motion (iOS keeps paging)", async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, track, grab} = await openPaging(page);
  await driver.play(flick(grab, {velocity: {x: -1500, y: 0}, durationMs: 100}));
  await waitForAnimation(track);
  const settle = await holdAnimations(page, track);
  expect(Math.max(...settle.map(a => a.curveEndMs))).toBeGreaterThan(150);
  expect(settle.every(a => a.keyframes.every(k => !('opacity' in k)))).toBe(
    true,
  );
  await releaseAnimations(page);
  await waitForRest(track);
  await page.getByRole('button', {name: 'Scroll right'}).click();
  await waitForAnimation(track);
  const next = await holdAnimations(page, track);
  const end = Math.max(...next.map(a => a.curveEndMs));
  expect(end).toBeGreaterThan(290);
  expect(end).toBeLessThan(310);
  await releaseAnimations(page);
});

test('a drag writes only styles: no render, no layout change in the tree', async ({
  page,
}) => {
  const {driver, scroller, width, grab} = await openPaging(page);
  await scroller.evaluate(el => {
    const records: string[] = [];
    (window as unknown as {mutations: string[]}).mutations = records;
    new MutationObserver(list => {
      for (const m of list) {
        const target = m.target as HTMLElement;
        const role =
          target === el.firstElementChild
            ? 'track'
            : (target.getAttribute('aria-roledescription') ?? target.tagName);
        records.push(`${m.type}:${m.attributeName ?? ''}:${role}`);
      }
    }).observe(el, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
  });
  await driver.play(
    drag(
      grab,
      {x: grab.x - 0.3 * width, y: grab.y},
      {durationMs: 500, restMs: 120},
    ),
  );
  const mutations = await page.evaluate(
    () => (window as unknown as {mutations: string[]}).mutations,
  );
  // The track's translate (per move) and the slides' layers and placement
  // (at the drag's start and at rest); nothing else.
  expect(mutations.length).toBeGreaterThan(10);
  for (const m of mutations) {
    expect(m).toMatch(/^attributes:style:(track|slide)$/);
  }
});

test('a settle keeps advancing every frame through a blocked main thread', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    "WebKit's screencast clock is not the page's, so a 0.3 s settle cannot be placed inside the block; Mobile Safari on the iOS simulator is the WebKit evidence",
  );
  const {driver, scroller, width, grab} = await openPaging(page);
  const second = page.locator('[aria-roledescription="slide"]').nth(1);
  await markElement(second, {inset: 8});
  // 100 ms after the finger lifts, block the main thread for 800 ms.
  await scroller.evaluate(el => {
    el.addEventListener(
      'touchend',
      () => {
        setTimeout(() => {
          const from = performance.timeOrigin + performance.now();
          const end = performance.now() + 800;
          while (performance.now() < end) {
            // busy
          }
          (window as unknown as {busy: unknown}).busy = {
            from,
            to: performance.timeOrigin + performance.now(),
            spins: 0,
          };
        }, 100);
      },
      {once: true, passive: true},
    );
  });
  const cast = await startScreencast(page);
  await page.waitForTimeout(300);
  await driver.play(
    flick(grab, {velocity: {x: -1200, y: 0}, durationMs: 80, hz: 120}),
  );
  await page.waitForTimeout(1300);
  const busy = await page.evaluate(
    () =>
      (window as unknown as {busy: {from: number; to: number; spins: number}})
        .busy,
  );
  const tracked = await trackMarker(page, await cast.stop());
  // The settle lasts about 0.33 s from the lift: judge the block's first 200 ms.
  const spanned = {...busy, to: busy.from + 200};
  const proof = busyWindowProof(tracked, spanned, {
    axis: 'x',
    settledWithin: 1,
  });
  test.info().annotations.push({
    type: 'busy window',
    description: JSON.stringify({...proof, window: undefined}),
  });
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.longestStallMs).toBeLessThan(40);
  expect(width).toBeGreaterThan(0);
});

for (const [name, story, velocity] of [
  ['swipe', 'core-carousel--paging', -1200],
  ['loop-wrap', 'core-carousel--paging-loop', 1200],
] as const) {
  test(`storyboard: ${name} @storyboard`, async ({page}) => {
    const {driver, scroller, track, grab, width} = await openPaging(
      page,
      story,
    );
    const from = velocity < 0 ? grab : {x: grab.x - width * 0.6, y: grab.y};
    await driver.play(
      flick(from, {velocity: {x: velocity, y: 0}, durationMs: 80, hz: 120}),
    );
    await waitForAnimation(track);
    const box = await scroller.boundingBox();
    if (box == null) {
      throw new Error('no scroller');
    }
    const {storyboard} = await animationStoryboard(page, {
      name: `carousel-paging-${name}`,
      scope: track,
      clip: {x: box.x, y: box.y, width: box.width, height: box.height},
      measure: async () => ({x: await trackX(track)}),
    });
    await storyboard.write(test.info());
    const xs = storyboard.frames.map(f => (f.data as {x: number}).x);
    // Each frame is nearer the page than the one before; UIKit's paging
    // settle (damping ratio 0.86) may overshoot the page by a pixel or two.
    const last = xs[xs.length - 1];
    for (let i = 1; i < xs.length; i++) {
      expect(Math.abs(xs[i] - last)).toBeLessThanOrEqual(
        Math.abs(xs[i - 1] - last) + 2,
      );
    }
    await releaseAnimations(page);
  });
}
