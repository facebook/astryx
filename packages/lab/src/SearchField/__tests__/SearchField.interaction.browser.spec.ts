// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SearchField.interaction.browser.spec.ts
 * @input The built "Lab/SearchField" stories on the harness's phone (touch,
 *   so the touch presentation applies), real touch input (Chromium CDP /
 *   WebKit's input command) and the interaction harness
 * @output Proofs that SearchField activates and cancels like UIKit's search
 *   bar on iOS 26.2: a tap narrows the field and slides the glass close
 *   button in on UIKit's 383 ms ease-in-ease-out, every part on one clock,
 *   within half a pixel; the lift rides the same clock; the close button
 *   cancels on the same clock, sliding out at full opacity; a cancel
 *   mid-activation turns around from where the parts are; the activation
 *   keeps advancing every frame through a blocked main thread and does no
 *   Layout or Paint; Reduce Motion keeps the travel; right to left it
 *   narrows from the left; under a mouse every part takes its place at once;
 *   a theme's search.activationMs role times the activation; storyboards of
 *   the activation and the cancel
 * @position Interaction proof for lab SearchField (SearchField.tsx,
 *   searchFieldModel.ts); shape copied from the harness exemplar,
 *   BottomSheetDetent.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  countBetween,
  cubicBezier,
  holdAnimations,
  markElement,
  openStory,
  phone,
  releaseAnimations,
  sampleCurve,
  startScreencast,
  touchDriver,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

// The first page of a fresh WebKit worker stops presenting frames for about
// a second after its first composited animation starts (the engine setting up
// compositing), long enough to swallow a 383 ms activation. One throwaway
// activation pays that cost before the proofs run.
test.beforeAll(async ({browser, browserName}) => {
  if (browserName !== 'webkit') {
    return;
  }
  const context = await browser.newContext(phone);
  const page = await context.newPage();
  await openStory(page, storybook(), 'lab-searchfield--default');
  const field = page.getByRole('searchbox', {name: 'Search'});
  const box = await field.boundingBox();
  if (box != null) {
    await (
      await touchDriver(page)
    ).tap({
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    });
    await page.waitForTimeout(2000);
  }
  await context.close();
});

/** UIKit's search activation on iOS 26.2 (uikit/search.ts). */
const ACTIVATION_MS = 383.3;
const ease = cubicBezier(0.42, 0, 0.58, 1);
/** The close button and the gap before it: what the field gives up, px. */
const NARROWING = 55;
/** How far past its place the close button starts, px. */
const CLOSE_TRAVEL = 44;

const times = Array.from({length: 25}, (_, i) => i * 16.667);
const progress = (t: number) => ease(Math.min(1, t / ACTIVATION_MS));

async function openField(page: Page, story = 'default') {
  await openStory(page, storybook(), `lab-searchfield--${story}`);
  const driver = await touchDriver(page);
  const field = page.getByRole('searchbox', {name: 'Search'});
  await expect(field).toBeVisible();
  // Installs the harness's page helpers before the tap: on a cold WebKit
  // page, installing them after it could outlast the 383 ms activation.
  await waitForRest(page.locator('[data-search-field-end]'));
  return {driver, field};
}

const root = (page: Page) => page.getByRole('search');
const end = (page: Page) => page.locator('[data-search-field-end]');
const middle = (page: Page) => page.locator('[data-search-field-middle]');
const close = (page: Page) => page.locator('[data-search-field-close]');

async function centerOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

/** The field's resting width, px (the stretchable middle spans it less the two rounded ends). */
async function restWidth(page: Page) {
  const box = await page
    .locator('[data-search-field-end]')
    .evaluate(element => (element.parentElement as HTMLElement).offsetWidth);
  return box;
}

/**
 * Records, in the page, when the next animation on `locator` starts: a
 * frame callback that reads its animations until one has a start time, then
 * stops, so the frames after it run no script. Resolve the returned getter
 * after the activation for its window on the page's epoch clock.
 */
async function recordActivationStart(locator: Locator) {
  await locator.evaluate(element => {
    const store = window as unknown as {__searchFieldStart?: number | null};
    store.__searchFieldStart = null;
    const tick = () => {
      const animation = element.getAnimations()[0];
      if (animation != null && animation.startTime != null) {
        store.__searchFieldStart =
          performance.timeOrigin + Number(animation.startTime);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return async () => {
    const from = await locator
      .page()
      .evaluate(
        () =>
          (window as unknown as {__searchFieldStart?: number | null})
            .__searchFieldStart ?? null,
      );
    if (from == null) {
      throw new Error('the activation never started');
    }
    return {from, to: from + ACTIVATION_MS};
  };
}

/** A presented translateX, px (the animator drives `translate`). */
const translateX = async (locator: Locator) =>
  locator.evaluate(element => {
    const value = getComputedStyle(element).translate;
    return value === 'none' ? 0 : parseFloat(value);
  });

test('a tap activates on UIKit’s clock: the field narrows and the close button slides in', async ({
  page,
}, testInfo) => {
  const {driver, field} = await openField(page);
  const width = await restWidth(page);
  await driver.tap(await centerOf(field));
  // Catch the curve first: a slow assertion before it could outlast 383 ms.
  await waitForAnimation(end(page));
  await holdAnimations(page);
  await expect(root(page)).toHaveAttribute('data-search-field-active', 'true');

  const ends = await sampleCurve(end(page), times);
  const middles = await sampleCurve(middle(page), times);
  const closes = await sampleCurve(close(page), times);
  const samples = times.map((t, i) => ({
    t: +t.toFixed(1),
    endX: ends[i].transform.translateX,
    middleScale: middles[i].transform.scaleX,
    closeX: closes[i].transform.translateX,
    closeOpacity: closes[i].opacity,
    analytic: {
      endX: -NARROWING * progress(t),
      middleScale: 1 - (NARROWING / (width - 44)) * progress(t),
      closeX: CLOSE_TRAVEL * (1 - progress(t)),
      closeOpacity: progress(t),
    },
  }));
  await releaseAnimations(page, {finish: true});
  await writeEvidence(
    'curves/searchfield-activation',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {width, samples},
        null,
        1,
      ),
    },
    testInfo,
  );

  for (const sample of samples) {
    const {analytic} = sample;
    expect(
      Math.abs(sample.endX - analytic.endX),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    expect(
      Math.abs(sample.middleScale - analytic.middleScale) * (width - 44),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    expect(
      Math.abs(sample.closeX - analytic.closeX),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    expect(
      Math.abs(sample.closeOpacity - analytic.closeOpacity),
      JSON.stringify(sample),
    ).toBeLessThan(0.01);
  }
  await waitForRest(end(page));
  expect(await translateX(end(page))).toBeCloseTo(-NARROWING, 1);
  await expect(close(page)).toBeVisible();
});

test('a lifted field rises on the same clock', async ({page}) => {
  const {driver, field} = await openField(page, 'lifted');
  await driver.tap(await centerOf(field));
  await waitForAnimation(root(page));
  await holdAnimations(page);
  const ys = await sampleCurve(root(page), times);
  const ends = await sampleCurve(end(page), times);
  await releaseAnimations(page, {finish: true});
  times.forEach((t, i) => {
    const sample = {
      t,
      y: ys[i].transform.translateY,
      endX: ends[i].transform.translateX,
    };
    expect(
      Math.abs(sample.y + 53 * progress(t)),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    // One clock: the rise and the narrowing are at the same point of the curve.
    expect(
      Math.abs(sample.y / 53 - sample.endX / NARROWING),
      JSON.stringify(sample),
    ).toBeLessThan(0.01);
  });
});

test('the close button cancels on the same clock, sliding out at full opacity', async ({
  page,
}, testInfo) => {
  const {driver, field} = await openField(page);
  await driver.tap(await centerOf(field));
  await waitForAnimation(end(page));
  await waitForRest(end(page));
  await waitForRest(close(page));
  await field.fill('pe');

  await driver.tap(await centerOf(close(page)));
  await waitForAnimation(end(page));
  await holdAnimations(page);
  await expect(root(page)).not.toHaveAttribute('data-search-field-active');
  await expect(field).toHaveValue('');
  await expect(field).not.toBeFocused();
  const ends = await sampleCurve(end(page), times);
  const closes = await sampleCurve(close(page), times);
  const samples = times.map((t, i) => ({
    t: +t.toFixed(1),
    endX: ends[i].transform.translateX,
    closeX: closes[i].transform.translateX,
    closeOpacity: closes[i].opacity,
  }));
  await releaseAnimations(page, {finish: true});
  await writeEvidence(
    'curves/searchfield-cancel',
    {[`${testInfo.project.name}.json`]: JSON.stringify({samples}, null, 1)},
    testInfo,
  );
  times.forEach((t, i) => {
    const sample = samples[i];
    expect(
      Math.abs(sample.endX + NARROWING * (1 - progress(t))),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    expect(
      Math.abs(sample.closeX - CLOSE_TRAVEL * progress(t)),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    // Full opacity while it slides; removed at the end.
    expect(sample.closeOpacity, JSON.stringify(sample)).toBe(
      t < ACTIVATION_MS - 0.5 ? 1 : 0,
    );
  });
  // Gone once it has slid out: transparent, untouchable, out of the
  // accessibility tree.
  await waitForRest(close(page));
  expect(
    await close(page).evaluate(element => ({
      opacity: getComputedStyle(element).opacity,
      pointerEvents: getComputedStyle(element).pointerEvents,
      hidden: element.getAttribute('aria-hidden'),
    })),
  ).toEqual({opacity: '0', pointerEvents: 'none', hidden: 'true'});
});

test('a cancel mid-activation turns around from where the parts are, without a jump', async ({
  page,
}) => {
  const {driver, field} = await openField(page);
  await driver.tap(await centerOf(field));
  await waitForAnimation(end(page), {minProgressMs: 150});
  const before = await translateX(end(page));
  expect(before).toBeLessThan(-2);
  expect(before).toBeGreaterThan(-NARROWING + 2);
  await driver.tap(await centerOf(close(page)));
  const [reverse] = await waitForAnimation(end(page));
  await holdAnimations(page);
  await expect(root(page)).not.toHaveAttribute('data-search-field-active');
  const samples = await sampleCurve(end(page), times);
  await releaseAnimations(page, {finish: true});
  const xs = samples.map(sample => sample.transform.translateX);
  // It starts between rest and the narrowed end (not back at either), at
  // least as far along as before the second tap, and widens back to rest on
  // a shorter share of the clock.
  expect(xs[0]).toBeLessThanOrEqual(before + 0.5);
  expect(xs[0]).toBeGreaterThan(-NARROWING);
  for (let i = 1; i < xs.length; i++) {
    expect(xs[i]).toBeGreaterThanOrEqual(xs[i - 1] - 0.01);
  }
  expect(reverse.to - reverse.from).toBeLessThan(ACTIVATION_MS);
  await waitForRest(end(page));
  expect(Math.abs(await translateX(end(page)))).toBeLessThan(0.5);
});

test('a tap on the field during the cancel re-activates from where the parts are', async ({
  page,
}) => {
  const {driver, field} = await openField(page);
  await driver.tap(await centerOf(field));
  await waitForAnimation(end(page));
  await waitForRest(end(page));
  await waitForRest(close(page));
  await driver.tap(await centerOf(close(page)));
  await waitForAnimation(end(page), {minProgressMs: 150});
  const before = await translateX(end(page));
  expect(before).toBeGreaterThan(-NARROWING + 2);
  expect(before).toBeLessThan(-2);
  await driver.tap(await centerOf(field));
  const [again] = await waitForAnimation(end(page));
  await holdAnimations(page);
  const samples = await sampleCurve(end(page), times);
  await releaseAnimations(page, {finish: true});
  await expect(root(page)).toHaveAttribute('data-search-field-active', 'true');
  const xs = samples.map(sample => sample.transform.translateX);
  // From where the cancel had brought it, narrowing again, monotonically,
  // on the remaining share of the clock.
  expect(xs[0]).toBeGreaterThanOrEqual(before - 0.5);
  expect(xs[0]).toBeLessThan(0);
  for (let i = 1; i < xs.length; i++) {
    expect(xs[i]).toBeLessThanOrEqual(xs[i - 1] + 0.01);
  }
  expect(again.to - again.from).toBeLessThan(ACTIVATION_MS);
  await waitForRest(end(page));
  expect(await translateX(end(page))).toBeCloseTo(-NARROWING, 1);
  // The close button is back, past the time the cancel would have ended.
  await page.waitForTimeout(ACTIVATION_MS);
  await waitForRest(close(page));
  expect(
    await close(page).evaluate(element =>
      Number(getComputedStyle(element).opacity),
    ),
  ).toBe(1);
  expect(await translateX(close(page))).toBeCloseTo(0, 1);
});

// Polling a page whose input has focus repaints its document every frame in
// Chromium (the harness's waits read styles), so the next two proofs never
// poll while the activation runs: the page blocks itself once the activation
// has started, and the trace waits a fixed time.
test('the activation keeps advancing every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  // The lifted field's rise: a 53 px travel on one element that nothing
  // passes over (the close button slides over the field's trailing end,
  // which would hide a marker there). Judged from 60 ms in, past the
  // curve's slowest start, to 320 ms, before its slowest end.
  const {driver, field} = await openField(page, 'lifted');
  const lifted = root(page);
  await markElement(lifted);
  const target = await centerOf(field);
  const started = await recordActivationStart(lifted);
  const cast = await startScreencast(page);
  await driver.tap(target);
  const block = await blockMainThread(page, 600, {
    during: lifted,
    minProgressMs: 60,
  });
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const slide = await started();
  const tracked = await trackMarker(page, castFrames);
  const judged = {from: block.from, to: Math.min(block.to, slide.from + 320)};
  const proof = busyWindowProof(tracked, judged, {
    axis: 'y',
    settledWithin: 1,
  });
  await writeEvidence(
    'busy-main-thread/searchfield-activation',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, slide, proof},
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'searchfield-activation-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: Math.min(block.to, slide.to) + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({y: tracked.find(f => f.t === t)?.box?.y ?? -1}),
  });
  await film.write(testInfo, {block, slide});
  expect(proof.verdict.failures).toEqual([]);
  expect(proof.expectedFrames).toBeGreaterThan(10);
  expect(proof.medianFrameMs).toBeLessThan(20);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 1);
  expect(proof.longestStallMs).toBeLessThan(40);
});

test('the activation does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver, field} = await openField(page);
  const target = await centerOf(field);
  const started = await recordActivationStart(close(page));
  const trace = await traceRendering(page, async () => {
    await driver.tap(target);
    await page.waitForTimeout(ACTIVATION_MS + 200);
  });
  const slide = await started();
  expect(slide.to - slide.from).toBeGreaterThan(300);
  // The activation's first frame (the commit that activates) may lay out.
  // At the curve's end the animator writes the end values once (and Chromium
  // repaints the document once); its clock starts at the commit, a few frames
  // before the animation's start time, so that write lands up to ~50 ms
  // before `slide.to`. Judge the frames before it.
  const during = countBetween(trace, slide.from + 40, slide.to - 70);
  const when = trace.events
    .filter(e => e.name === 'Layout' || e.name === 'Paint')
    .map(e => `${e.name}@${Math.round(e.t - slide.from)}`);
  expect(during.Layout ?? 0, JSON.stringify({during, when})).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify({during, when})).toBe(0);
});

test('right to left: the field narrows from the left and the close button slides in from there', async ({
  page,
}) => {
  const {driver, field} = await openField(page, 'right-to-left');
  await driver.tap(await centerOf(field));
  const [activation] = await waitForAnimation(end(page));
  await holdAnimations(page);
  const mid = activation.from + (activation.to - activation.from) / 2;
  const samples = await sampleCurve(close(page), [
    0,
    (mid - activation.from) * 0.5,
  ]);
  await releaseAnimations(page, {finish: true});
  // The close button starts past its place on the left (negative x) and
  // moves right, toward it.
  expect(samples[0].transform.translateX).toBeCloseTo(-CLOSE_TRAVEL, 0);
  expect(samples[1].transform.translateX).toBeGreaterThan(-CLOSE_TRAVEL);
  expect(samples[1].transform.translateX).toBeLessThan(0);
  await waitForRest(end(page));
  // The trailing end is on the left: it moves right by what the field
  // gives up.
  expect(await translateX(end(page))).toBeCloseTo(NARROWING, 1);
  expect(await translateX(close(page))).toBeCloseTo(0, 1);
});

test('a theme’s activation clock (the search.activationMs role) times the activation', async ({
  page,
}) => {
  const {driver, field} = await openField(page);
  // A theme writes the role's variable on its scope; it inherits from here.
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      '--motion-search-activation-ms',
      '600ms',
    ),
  );
  await driver.tap(await centerOf(field));
  const [activation] = await waitForAnimation(end(page));
  await waitForRest(end(page));
  expect(activation.to - activation.from).toBeGreaterThan(595);
  expect(activation.to - activation.from).toBeLessThan(605);
  expect(await translateX(end(page))).toBeCloseTo(-NARROWING, 1);
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('a click puts every part at its end at once, with no animation', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'lab-searchfield--default');
    const field = page.getByRole('searchbox', {name: 'Search'});
    await expect(field).toBeVisible();
    await field.click();
    await expect(root(page)).toHaveAttribute(
      'data-search-field-active',
      'true',
    );
    const running = await page.evaluate(
      () =>
        document
          .querySelector('[role="search"]')
          ?.getAnimations({subtree: true}).length ?? 0,
    );
    expect(running).toBe(0);
    expect(await translateX(end(page))).toBeCloseTo(-NARROWING, 1);
    expect(await translateX(close(page))).toBeCloseTo(0, 1);
    await close(page).click();
    await expect(root(page)).not.toHaveAttribute('data-search-field-active');
    expect(await translateX(end(page))).toBeCloseTo(0, 1);
  });
});

test.describe('with Reduce Motion', () => {
  test('the field still narrows and the button still slides, with no cross-fade', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver, field} = await openField(page);
    await driver.tap(await centerOf(field));
    await waitForAnimation(end(page), {minProgressMs: 120});
    const midway = await page.evaluate(() => {
      const read = (selector: string) => {
        const element = document.querySelector(selector) as HTMLElement;
        const style = getComputedStyle(element);
        return {
          x: style.translate === 'none' ? 0 : parseFloat(style.translate),
          opacity: Number(style.opacity),
        };
      };
      return {
        end: read('[data-search-field-end]'),
        root: read('[role="search"]'),
      };
    });
    expect(midway.end.x).toBeLessThan(-1);
    expect(midway.end.x).toBeGreaterThan(-NARROWING + 1);
    expect(midway.root.opacity).toBe(1);
    expect(midway.end.opacity).toBe(1);
    await waitForRest(end(page));
    expect(await translateX(end(page))).toBeCloseTo(-NARROWING, 1);
  });
});

test(
  'storyboard: a tap activates the field',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, field} = await openField(page);
    await driver.tap(await centerOf(field));
    await waitForAnimation(end(page));
    const box = await root(page).boundingBox();
    if (box == null) {
      throw new Error('no field');
    }
    const {storyboard} = await animationStoryboard(page, {
      name: 'searchfield-activation',
      clip: {
        x: 0,
        y: box.y - 12,
        width: box.x * 2 + box.width,
        height: box.height + 24,
      },
      times: Array.from({length: 25}, (_, i) => i * 16.667),
      measure: async () => ({
        endX: await translateX(end(page)),
        closeX: await translateX(close(page)),
      }),
      columns: 5,
      cellScale: 0.6,
    });
    await storyboard.write(testInfo);
    await releaseAnimations(page, {finish: true});
    const frames = storyboard.frames.map(
      f => f.data as {endX: number; closeX: number},
    );
    expect(Math.abs(frames[0].endX)).toBeLessThan(0.5);
    expect(frames[0].closeX).toBeGreaterThan(CLOSE_TRAVEL - 0.5);
    expect(frames.at(-1)?.endX ?? 0).toBeLessThan(-NARROWING + 0.5);
    expect(Math.abs(frames.at(-1)?.closeX ?? Infinity)).toBeLessThan(0.5);
  },
);

test(
  'storyboard: the close button cancels',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, field} = await openField(page, 'active-with-query');
    await expect(field).toHaveValue('ap');
    await driver.tap(await centerOf(close(page)));
    await waitForAnimation(end(page));
    const box = await root(page).boundingBox();
    if (box == null) {
      throw new Error('no field');
    }
    const {storyboard} = await animationStoryboard(page, {
      name: 'searchfield-cancel',
      clip: {
        x: 0,
        y: box.y - 12,
        width: box.x * 2 + box.width,
        height: box.height + 24,
      },
      times: Array.from({length: 25}, (_, i) => i * 16.667),
      measure: async () => ({
        endX: await translateX(end(page)),
        closeX: await translateX(close(page)),
      }),
      columns: 5,
      cellScale: 0.6,
    });
    await storyboard.write(testInfo);
    await releaseAnimations(page, {finish: true});
    const frames = storyboard.frames.map(
      f => f.data as {endX: number; closeX: number},
    );
    expect(frames[0].endX).toBeLessThan(-NARROWING + 0.5);
    expect(Math.abs(frames.at(-1)?.endX ?? Infinity)).toBeLessThan(0.5);
    expect(frames.at(-1)?.closeX ?? 0).toBeGreaterThan(CLOSE_TRAVEL - 0.5);
  },
);

test(
  'storyboard: a cancel mid-activation turns around',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, field} = await openField(page);
    await driver.tap(await centerOf(field));
    await waitForAnimation(end(page), {minProgressMs: 120});
    await driver.tap(await centerOf(close(page)));
    await waitForAnimation(end(page));
    const box = await root(page).boundingBox();
    if (box == null) {
      throw new Error('no field');
    }
    const {storyboard} = await animationStoryboard(page, {
      name: 'searchfield-cancel-mid-activation',
      clip: {
        x: 0,
        y: box.y - 12,
        width: box.x * 2 + box.width,
        height: box.height + 24,
      },
      times: Array.from({length: 19}, (_, i) => i * 16.667),
      measure: async () => ({
        endX: await translateX(end(page)),
        closeX: await translateX(close(page)),
      }),
      columns: 5,
      cellScale: 0.6,
    });
    await storyboard.write(testInfo);
    await releaseAnimations(page, {finish: true});
    const frames = storyboard.frames.map(
      f => f.data as {endX: number; closeX: number},
    );
    // It starts part-way, not at either end, and widens back to rest.
    expect(frames[0].endX).toBeLessThan(-0.5);
    expect(frames[0].endX).toBeGreaterThan(-NARROWING + 0.5);
    expect(Math.abs(frames.at(-1)?.endX ?? Infinity)).toBeLessThan(0.5);
  },
);
