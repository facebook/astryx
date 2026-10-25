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
 *   Layout or Paint; right to left it narrows from the left; under a mouse
 *   every part takes its place at once;
 *   a theme's search.activationMs role times the activation; in the Lifted
 *   story the results rise with the field and the title fades as UIKit's
 *   does (the story stands in for the navigation bar); all of that under a
 *   finger, one touch model on every touch device (an Android finger, with
 *   no iOS signals, plays the same activation), where the close button is
 *   glass; under reduced motion (`design:reduced-motion`) a finger only
 *   cross-fades (no part moves or scales) and a mouse changes at once;
 *   storyboards of the activation and the cancel
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

/**
 * Waits for an animation on `locator` that started after `after` (epoch ms,
 * an earlier animation's `from`): a reversal starts on the first presented
 * frame after the tap, so the move it replaces runs on for those frames.
 */
async function waitForNewAnimation(locator: Locator, after: number) {
  const deadline = Date.now() + 5_000;
  for (;;) {
    const fresh = (await waitForAnimation(locator)).filter(
      a => a.from > after + 1,
    );
    if (fresh.length > 0) {
      return fresh;
    }
    if (Date.now() > deadline) {
      throw new Error('no new animation started');
    }
    await locator.page().waitForTimeout(8);
  }
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

test('in the Lifted story the results rise with the field and the title fades as UIKit’s does', async ({
  page,
}) => {
  const {driver, field} = await openField(page, 'lifted');
  const content = page.locator('[data-search-story-content]');
  const title = page.getByRole('heading', {name: 'Search'});
  await driver.tap(await centerOf(field));
  await waitForAnimation(root(page));
  await holdAnimations(page);
  const ys = await sampleCurve(root(page), times);
  const contents = await sampleCurve(content, times);
  const titles = await sampleCurve(title, times);
  await releaseAnimations(page, {finish: true});
  times.forEach((t, i) => {
    const p = progress(t);
    const sample = {
      t,
      field: ys[i].transform.translateY,
      content: contents[i].transform.translateY,
      title: titles[i].opacity,
    };
    // The results ride with the field: no gap opens under it.
    expect(
      Math.abs(sample.content - sample.field),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    expect(
      Math.abs(sample.title - Math.max(0, 1 - p / 0.35) ** 2),
      JSON.stringify(sample),
    ).toBeLessThan(0.02);
  });
});

test('in the Lifted story a cancel brings the results down with the field and the title back from p = 0.65', async ({
  page,
}) => {
  const {driver, field} = await openField(page, 'lifted');
  const content = page.locator('[data-search-story-content]');
  const title = page.getByRole('heading', {name: 'Search'});
  await driver.tap(await centerOf(field));
  await waitForAnimation(root(page));
  await waitForRest(root(page));
  await waitForRest(content);
  await waitForRest(title);
  await driver.tap(await centerOf(close(page)));
  await waitForAnimation(content);
  await holdAnimations(page);
  const back = await sampleCurve(title, times);
  const down = await sampleCurve(content, times);
  const fieldDown = await sampleCurve(root(page), times);
  await releaseAnimations(page, {finish: true});
  times.forEach((t, i) => {
    const p = progress(t);
    const sample = {
      t,
      title: back[i].opacity,
      content: down[i].transform.translateY,
      field: fieldDown[i].transform.translateY,
    };
    expect(
      Math.abs(sample.content - sample.field),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    expect(
      Math.abs(sample.content + 53 * (1 - p)),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    expect(
      Math.abs(sample.title - Math.min(1, Math.max(0, (p - 0.65) / 0.35))),
      JSON.stringify(sample),
    ).toBeLessThan(0.02);
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
  const [forward] = await waitForAnimation(end(page), {minProgressMs: 150});
  const before = await translateX(end(page));
  expect(before).toBeLessThan(-2);
  expect(before).toBeGreaterThan(-NARROWING + 2);
  await driver.tap(await centerOf(close(page)));
  const [reverse] = await waitForNewAnimation(end(page), forward.from);
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
  const [cancel] = await waitForAnimation(end(page), {minProgressMs: 150});
  const before = await translateX(end(page));
  expect(before).toBeGreaterThan(-NARROWING + 2);
  expect(before).toBeLessThan(-2);
  await driver.tap(await centerOf(field));
  const [again] = await waitForNewAnimation(end(page), cancel.from);
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

test('the waiting close button does not widen the page: nothing scrolls sideways', async ({
  page,
}) => {
  await openField(page);
  // A full-bleed field, as on a phone screen: the root spans the viewport,
  // so the inactive close button (resting 44 px past its place) would end
  // 28 px past the screen's edge.
  // (A phone browser widens its layout viewport to fit what overflows, so
  // the page is compared with the screen's width, read first.)
  const widths = await page.evaluate(() => {
    const screenWidth = window.innerWidth;
    const root = document.querySelector('[role="search"]') as HTMLElement;
    const left = root.getBoundingClientRect().left;
    root.style.width = `${screenWidth}px`;
    root.style.marginInlineStart = `${-left}px`;
    return {
      scroll: document.documentElement.scrollWidth,
      viewport: screenWidth,
      layoutViewport: window.innerWidth,
    };
  });
  expect(widths.scroll, JSON.stringify(widths)).toBeLessThanOrEqual(
    widths.viewport,
  );
});

test('the CSS form of the active pose, painted before hydration, matches the placed pose', async ({
  page,
}) => {
  const {driver, field} = await openField(page);
  await driver.tap(await centerOf(field));
  await expect(root(page)).toHaveAttribute('data-search-field-active', 'true');
  await waitForRest(end(page));
  await waitForRest(middle(page));
  const rects = () =>
    page.evaluate(() => {
      const read = (selector: string) => {
        const rect = (
          document.querySelector(selector) as HTMLElement
        ).getBoundingClientRect();
        return {left: rect.left, right: rect.right};
      };
      return {
        end: read('[data-search-field-end]'),
        middle: read('[data-search-field-middle]'),
      };
    });
  const placed = await rects();
  // As a server render paints it: no placement yet, no held values.
  await page.evaluate(() => {
    const searchRoot = document.querySelector('[role="search"]') as HTMLElement;
    searchRoot.removeAttribute('data-search-field-placed');
    for (const selector of [
      '[data-search-field-end]',
      '[data-search-field-middle]',
    ]) {
      const element = document.querySelector(selector) as HTMLElement;
      for (const animation of element.getAnimations()) {
        animation.cancel();
      }
      element.style.removeProperty('translate');
      element.style.removeProperty('scale');
    }
  });
  const css = await rects();
  for (const part of ['end', 'middle'] as const) {
    expect(Math.abs(css[part].right - placed[part].right), part).toBeLessThan(
      0.5,
    );
    expect(Math.abs(css[part].left - placed[part].left), part).toBeLessThan(
      0.5,
    );
  }
});

test('under a finger the close button is glass', async ({page}) => {
  await openField(page);
  const style = await close(page).evaluate(element => {
    const computed = getComputedStyle(element);
    return {
      backdrop: computed.backdropFilter,
      shadow: computed.boxShadow,
    };
  });
  expect(style.backdrop).toContain('blur');
  expect(style.shadow).not.toBe('none');
});

/**
 * Every property the field's running animations change, and when the last
 * opacity change settles, ms after the animations start (reduced-motion
 * proofs).
 */
async function animatedProperties(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector('[role="search"]') as HTMLElement;
    const SKIP = ['offset', 'computedOffset', 'easing', 'composite'];
    const animations = root.getAnimations({subtree: true});
    const startedAt = Math.min(
      ...animations.map(animation => Number(animation.startTime ?? 0)),
    );
    const properties = new Set<string>();
    let fadeMs = 0;
    for (const animation of animations) {
      const effect = animation.effect as KeyframeEffect | null;
      if (effect == null) {
        continue;
      }
      const frames = effect.getKeyframes();
      const timing = effect.getComputedTiming();
      const start =
        Number(animation.startTime ?? 0) + Number(timing.delay ?? 0);
      const duration = Number(timing.activeDuration ?? 0);
      const timeOf = (i: number) =>
        start + Number(frames[i].computedOffset) * duration;
      for (const key of Object.keys(frames[0] ?? {})) {
        if (SKIP.includes(key)) {
          continue;
        }
        const values = new Set(frames.map(frame => String(frame[key])));
        // A property held at one value does not move anything.
        if (values.size > 1) {
          properties.add(key);
        }
        if (key === 'opacity') {
          // When the opacity reaches the value it ends on, for good.
          const final = String(frames[frames.length - 1].opacity);
          let settles = timeOf(0);
          for (let i = 0; i < frames.length; i++) {
            if (String(frames[i].opacity) !== final) {
              settles = timeOf(Math.min(i + 1, frames.length - 1));
            }
          }
          fadeMs = Math.max(fadeMs, settles - startedAt);
        }
      }
    }
    return {properties: [...properties].sort(), fadeMs};
  });
}

test('on Android (Chromium under a finger, no iOS signals) it plays the same activation, with the glass close button', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Android browsers are Chromium');
  // One touch model on every touch device: nothing here answers iOS's
  // `-webkit-touch-callout`, and the field still plays UIKit's activation.
  expect(
    await page.evaluate(() => CSS.supports('-webkit-touch-callout', 'none')),
  ).toBe(false);
  const {driver, field} = await openField(page);
  await driver.tap(await centerOf(field));
  const [activation] = await waitForAnimation(end(page));
  expect(activation.to - activation.from).toBeCloseTo(ACTIVATION_MS, -1);
  const style = await close(page).evaluate(element => {
    const computed = getComputedStyle(element);
    return {backdrop: computed.backdropFilter, shadow: computed.boxShadow};
  });
  expect(style.backdrop).toContain('blur');
  expect(style.shadow).not.toBe('none');
  await waitForRest(end(page));
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
  test('on a touch screen the activation and the cancel only cross-fade: no part moves or scales', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver, field} = await openField(page);
    await driver.tap(await centerOf(field));
    await waitForAnimation(end(page));
    // design:reduced-motion DR1 and DR2: opacity only, 200 ms or less.
    const activation = await animatedProperties(page);
    expect(activation.properties).toEqual(['opacity']);
    expect(activation.fadeMs).toBeLessThanOrEqual(200);
    await waitForRest(end(page));
    expect(await translateX(end(page))).toBeCloseTo(-NARROWING, 1);
    await waitForRest(close(page));
    await driver.tap(await centerOf(close(page)));
    await waitForAnimation(end(page));
    const cancel = await animatedProperties(page);
    expect(cancel.properties).toEqual(['opacity']);
    expect(cancel.fadeMs).toBeLessThanOrEqual(200);
    await waitForRest(end(page));
    expect(Math.abs(await translateX(end(page)))).toBeLessThan(0.5);
  });

  test.describe('and a mouse', () => {
    test.use({hasTouch: false, isMobile: false});

    test('a click changes every part at once, with no animation', async ({
      page,
    }) => {
      await page.emulateMedia({reducedMotion: 'reduce'});
      await openStory(page, storybook(), 'lab-searchfield--default');
      const field = page.getByRole('searchbox', {name: 'Search'});
      await expect(field).toBeVisible();
      await field.click();
      await expect(root(page)).toHaveAttribute(
        'data-search-field-active',
        'true',
      );
      // design:reduced-motion DR3.
      expect((await animatedProperties(page)).properties).toEqual([]);
      expect(await translateX(end(page))).toBeCloseTo(-NARROWING, 1);
    });
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
    const [forward] = await waitForAnimation(end(page), {minProgressMs: 120});
    await driver.tap(await centerOf(close(page)));
    await waitForNewAnimation(end(page), forward.from);
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
