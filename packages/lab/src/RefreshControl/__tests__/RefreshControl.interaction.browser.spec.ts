// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RefreshControl.interaction.browser.spec.ts
 * @input The built RefreshControl stories, real touch input (Chromium CDP /
 *   WebKit's input command) and the interaction harness
 * @output Interaction and animation proofs for the pull to refresh: the pull
 *   follows UIKit's measured mapping and settles back below the trigger; past
 *   the trigger the refresh starts with the finger down and the content
 *   settles onto the 60 px inset; the settle follows the scroll view's
 *   bounce spring and the end UIKit's 0.3 s ease-in-out (seeked Web
 *   Animations); the settle keeps moving through a blocked main thread and
 *   does no Layout or Paint per frame, and the pull rasters nothing per move; a short list still pulls; on the page
 *   the document's top edge belongs to the pull; a pull pushed back hands the
 *   finger to native scrolling; a pull while refreshing settles back onto the
 *   inset; a finger catching the settle resumes it without a jump; under
 *   Reduce Motion (design:reduced-motion) a release and the end only fade,
 *   within 200 ms, even with the theme's motion lengthened, and the trigger
 *   does not turn the spinner; with a mouse or trackpad the pull and the top
 *   edge stay the browser's; storyboards of the pull, the settle and the end.
 *
 * The control follows the touch presentation (a coarse primary pointer, one
 * touch model on iOS and Android alike). The harness's touch contexts report
 * a coarse pointer in both engines, so every proof runs as a phone (in
 * Chromium, as an Android phone's engine); the fine-pointer proof reports a
 * fine one (`primaryPointer`).
 * @position Interaction tests of packages/lab/src/RefreshControl, on the shape
 *   of the BottomSheetDetent exemplar
 *
 * The oracles are UIKit's numbers, written here independently of the code
 * under test: a 10 px pan hysteresis, 60 px one to one, then UIScrollView's
 * rubber band on the excess (c = 0.55, d = the scroller's height); the
 * trigger at max(73, 0.198 × d) px of overscroll; the settle on SwiftUI-style
 * response 0.5 s,
 * damping 1 (the scroll table's bounce); the end over 300 ms on
 * cubic-bezier(0.42, 0, 0.58, 1).
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  compareCurve,
  countBetween,
  cubicBezier,
  drag,
  frames,
  freezeTimers,
  installLongTaskLog,
  installTimerGate,
  markElement,
  openStory,
  path,
  readLongTasks,
  releaseAnimations,
  rubberBand,
  springStep,
  startScreencast,
  thawTimers,
  timeline,
  touchDriver,
  touchStoryboard,
  toTouchEvents,
  traceRendering,
  trackMarker,
  withStorybook,
  writeEvidence,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

const HYSTERESIS = 10;
const HEIGHT = 60;

/** UIKit's trigger distance for a scroll view `dimension` tall. */
const triggerFor = (dimension: number) => Math.max(73, 0.198 * dimension);

/** UIKit's refresh pull: overscroll shown for `travel` px of finger travel. */
function uikitPull(travel: number, dimension: number): number {
  const u = travel - HYSTERESIS;
  if (u <= 0) {
    return 0;
  }
  return u <= HEIGHT ? u : HEIGHT + rubberBand(u - HEIGHT, dimension);
}

interface Opened {
  driver: TouchDriver;
  /** The pulled content (RefreshControl's root). */
  content: Locator;
  /** Where the finger lands: on the list, near the top of the screen. */
  start: {x: number; y: number};
  /** The scroll owner's height: the rubber band's dimension. */
  dimension: number;
}

async function openRefresh(
  page: Page,
  story = 'lab-refreshcontrol--in-a-scroll-area',
  args: Record<string, string> = {},
): Promise<Opened> {
  await installLongTaskLog(page);
  await openStory(page, storybook(), story, args);
  const driver = await touchDriver(page);
  const content = page.locator('.astryx-refresh-control').first();
  await expect(content).toBeVisible();
  const dimension = await content.evaluate(element => {
    for (let node = element.parentElement; node; node = node.parentElement) {
      const overflow = getComputedStyle(node).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') {
        return node.clientHeight;
      }
    }
    return window.innerHeight;
  });
  return {driver, content, start: {x: 200, y: 160}, dimension};
}

/** The content's presented translation, px (works while animations are held). */
const shownPull = (content: Locator) =>
  content.evaluate(element => {
    const value = getComputedStyle(element).translate;
    if (value === 'none' || value === '') {
      return 0;
    }
    return parseFloat(value.split(/\s+/)[1] ?? '0');
  });

const isBusy = (content: Locator) =>
  content.evaluate(element => element.getAttribute('aria-busy') === 'true');

/**
 * Waits for an animation of the content itself (not the spinner's endless
 * spin inside it) and returns its active interval on the page clock. With
 * `afterRefresh`, only once the refresh has ended (the end of a refresh);
 * with `hold`, it is paused where it was found, ready for sampling.
 */
async function waitForSettle(
  content: Locator,
  {
    minProgressMs = 1,
    afterRefresh = false,
    hold = false,
    timeout = 6000,
  }: {
    minProgressMs?: number;
    afterRefresh?: boolean;
    hold?: boolean;
    timeout?: number;
  } = {},
): Promise<{from: number; to: number}> {
  return content.evaluate(
    (element, options) =>
      new Promise<{from: number; to: number}>((resolve, reject) => {
        const deadline = performance.now() + options.timeout;
        const tick = () => {
          const running = element
            .getAnimations()
            .filter(
              a =>
                a.playState === 'running' &&
                a.startTime != null &&
                Number(a.currentTime ?? 0) >= options.minProgressMs,
            );
          const ready =
            running.length > 0 &&
            (!options.afterRefresh ||
              element.getAttribute('aria-busy') !== 'true');
          if (ready) {
            if (options.hold) {
              for (const animation of running) {
                animation.pause();
              }
              (
                window as unknown as {__harnessHeld?: Animation[]}
              ).__harnessHeld = running;
            }
            const timing = running[0].effect?.getComputedTiming();
            const from =
              performance.timeOrigin +
              Number(running[0].startTime) +
              Number(timing?.delay ?? 0);
            resolve({from, to: from + Number(timing?.activeDuration ?? 0)});
            return;
          }
          if (performance.now() > deadline) {
            reject(new Error('waitForSettle: no animation on the content'));
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      }),
    {minProgressMs, afterRefresh, hold, timeout},
  );
}

/** Resolves once the content itself holds still (the spinner may spin on). */
async function waitForContentRest(
  content: Locator,
  timeout = 6000,
): Promise<void> {
  await content.evaluate(
    (element, ms) =>
      new Promise<void>((resolve, reject) => {
        const deadline = performance.now() + ms;
        let last = '';
        let still = 0;
        const tick = () => {
          const translate = getComputedStyle(element).translate;
          const moving = element
            .getAnimations()
            .some(a => a.playState === 'running');
          still = !moving && translate === last ? still + 1 : 0;
          last = translate;
          if (still >= 2) {
            resolve();
            return;
          }
          if (performance.now() > deadline) {
            reject(
              new Error(`waitForContentRest: still moving (${translate})`),
            );
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      }),
    timeout,
  );
}

/** A slow pull that rests before the lift (release velocity 0). */
function slowPull(from: {x: number; y: number}, dy: number, restMs = 150) {
  return drag(
    from,
    {x: from.x, y: from.y + dy},
    {durationMs: Math.max(200, dy * 5), hz: 60, restMs},
  );
}

/** Samples a held animation's presented translation at each time. */
async function sampleTranslate(
  content: Locator,
  times: readonly number[],
): Promise<{t: number; value: number}[]> {
  return content.evaluate(
    (element, ts) => {
      const held =
        (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ??
        [];
      return ts.map(t => {
        for (const animation of held) {
          const end = Number(
            animation.effect?.getComputedTiming().endTime ?? Infinity,
          );
          animation.currentTime = Math.min(t, end - 0.5);
        }
        const value = getComputedStyle(element).translate;
        return {
          t,
          value:
            value === 'none' || value === ''
              ? 0
              : parseFloat(value.split(/\s+/)[1] ?? '0'),
        };
      });
    },
    [...times],
  );
}

/** Reads the shown pull after every move of a script, while the finger is down. */
async function playReading(
  page: Page,
  driver: TouchDriver,
  content: Locator,
  script: ReturnType<typeof drag>,
  onLastMove?: () => Promise<void>,
): Promise<{travel: number; shown: number}[]> {
  const startY = script[0].fingers[0].y;
  const moves = toTouchEvents(script).filter(e => e.type === 'touchMove');
  const readings: {travel: number; shown: number}[] = [];
  let index = 0;
  await driver.play(script, {
    onEvent: async step => {
      if (step.type !== 'touchMove') {
        return;
      }
      await frames(page, 1);
      const y = step.changed[0]?.y ?? step.fingers[0]?.y ?? startY;
      readings.push({travel: y - startY, shown: await shownPull(content)});
      if (index === moves.length - 1) {
        await onLastMove?.();
      }
      index++;
    },
  });
  return readings;
}

test('a pull follows UIKit’s mapping and settles back below the trigger', async ({
  page,
}) => {
  const {driver, content, start, dimension} = await openRefresh(page);
  const readings = await playReading(
    page,
    driver,
    content,
    slowPull(start, 76),
  );
  // Every reading sits on UIKit's curve for its finger travel (the page may
  // lag the finger by a frame: compare with the travel's neighbours).
  const last = readings.at(-1);
  expect(last?.shown ?? NaN).toBeCloseTo(uikitPull(76, dimension), 0);
  for (const {travel, shown} of readings) {
    expect(shown).toBeLessThanOrEqual(uikitPull(travel, dimension) + 1);
  }
  expect(Math.max(...readings.map(r => r.shown))).toBeLessThan(
    triggerFor(dimension),
  );
  await waitForContentRest(content);
  expect(await shownPull(content)).toBeCloseTo(0, 1);
  expect(await isBusy(content)).toBe(false);
});

test('past the trigger the refresh starts with the finger down, then settles onto the inset', async ({
  page,
}) => {
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  let busyWhileDown = false;
  await playReading(
    page,
    driver,
    content,
    slowPull(start, 300, 200),
    async () => {
      busyWhileDown = await isBusy(content);
    },
  );
  expect(busyWhileDown).toBe(true);
  await waitForContentRest(content);
  expect(await shownPull(content)).toBeCloseTo(HEIGHT, 0);
  expect(await isBusy(content)).toBe(true);
});

test('the settle onto the inset follows the scroll view’s bounce spring', async ({
  page,
}, testInfo) => {
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  await driver.play(slowPull(start, 300, 200));
  await waitForSettle(content, {hold: true});
  const times = timeline(700);
  const samples = await sampleTranslate(content, times);
  await releaseAnimations(page);
  const from = samples[0].value;
  // scroll.bounce: {duration 0.5, bounce 0} = response 0.5 s, damping 1.
  const oracle = (t: number) =>
    from + (HEIGHT - from) * springStep({response: 0.5, dampingFraction: 1}, t);
  const result = compareCurve(samples, oracle, 1);
  await writeEvidence(
    'curves/refresh-settle',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {samples, result},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(1);
  expect(samples.at(-1)?.value).toBeCloseTo(HEIGHT, 0);
});

test('the end slides the content up over 0.3 s on UIKit’s ease-in-out', async ({
  page,
}, testInfo) => {
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '2500',
  });
  await driver.play(slowPull(start, 300, 200));
  await waitForContentRest(content);
  expect(await shownPull(content)).toBeCloseTo(HEIGHT, 0);
  // The refresh ends 2.5 s after the trigger.
  await waitForSettle(content, {afterRefresh: true, hold: true});
  const samples = await sampleTranslate(content, timeline(300));
  await releaseAnimations(page);
  const ease = cubicBezier(0.42, 0, 0.58, 1);
  const oracle = (t: number) => HEIGHT * (1 - ease(Math.min(1, t / 300)));
  const result = compareCurve(samples, oracle, 0.75);
  await writeEvidence(
    'curves/refresh-end',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {samples, result},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.75,
  );
  await waitForContentRest(content);
  expect(await shownPull(content)).toBeCloseTo(0, 1);
});

test('the title fades out with the end over 0.3 s on UIKit’s ease-in-out, as UIRefreshControl’s label does', async ({
  page,
}) => {
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '2500',
  });
  await driver.play(slowPull(start, 300, 200));
  await waitForContentRest(content);
  await waitForSettle(content, {afterRefresh: true, hold: true});
  // UIKit fades the label 1 → 0 over 0.3 s as the end starts (iOS 26.2).
  const samples = await content.evaluate(
    (element, ts) => {
      const title = element.querySelector(
        ':scope > :last-child > div > span:last-child',
      );
      if (title == null) {
        return [];
      }
      const held = title.getAnimations();
      for (const animation of held) {
        animation.pause();
      }
      return ts.map(t => {
        for (const animation of held) {
          const end = Number(
            animation.effect?.getComputedTiming().endTime ?? Infinity,
          );
          animation.currentTime = Math.min(t, end - 0.5);
        }
        return {t, value: Number(getComputedStyle(title).opacity)};
      });
    },
    [...timeline(300)],
  );
  await releaseAnimations(page);
  expect(samples.length).toBeGreaterThan(0);
  const ease = cubicBezier(0.42, 0, 0.58, 1);
  const oracle = (t: number) => 1 - ease(Math.min(1, t / 300));
  const result = compareCurve(samples, oracle, 0.02);
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.02,
  );
});

test('the end shrinks the spinner to almost nothing as it turns half a turn, over 0.3 s on UIKit’s ease-in-out', async ({
  page,
}) => {
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '2500',
  });
  await driver.play(slowPull(start, 300, 200));
  await waitForContentRest(content);
  await waitForSettle(content, {afterRefresh: true, hold: true});
  // UIKit replaces the spin with a 0.3 s transform from identity to scale
  // 0.001 turned by π − 0.01 (179.43°) on (0.42, 0, 0.58, 1) (iOS 26.2).
  const samples = await content.evaluate(
    (element, ts) => {
      const spinner = element.querySelector(':scope > :last-child span');
      if (spinner == null) {
        return [];
      }
      const held = spinner.getAnimations();
      for (const animation of held) {
        animation.pause();
      }
      return ts.map(t => {
        for (const animation of held) {
          const end = Number(
            animation.effect?.getComputedTiming().endTime ?? Infinity,
          );
          animation.currentTime = Math.min(t, end - 0.5);
        }
        const style = getComputedStyle(spinner);
        return {
          t,
          scale: parseFloat(style.scale === 'none' ? '1' : style.scale),
          rotate: parseFloat(style.rotate === 'none' ? '0' : style.rotate),
        };
      });
    },
    [...timeline(300)],
  );
  await releaseAnimations(page);
  expect(samples.length).toBeGreaterThan(0);
  const ease = cubicBezier(0.42, 0, 0.58, 1);
  const at = (t: number) => ease(Math.min(1, t / 300));
  const scale = compareCurve(
    samples.map(({t, scale: value}) => ({t, value})),
    t => 1 + (0.001 - 1) * at(t),
    0.01,
  );
  const rotate = compareCurve(
    samples.map(({t, rotate: value}) => ({t, value})),
    t => 179.43 * at(t),
    1,
  );
  expect(scale.maxError, JSON.stringify(scale.worst)).toBeLessThanOrEqual(0.01);
  expect(rotate.maxError, JSON.stringify(rotate.worst)).toBeLessThanOrEqual(1);
});

test('the settle keeps moving every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  await markElement(content);
  const cast = await startScreencast(page);
  await driver.play(slowPull(start, 300, 200));
  // The settle must be running (and composited) before the block: an
  // animation cannot start while the main thread is held.
  const settle = await waitForSettle(content, {minProgressMs: 16});
  const block = await blockMainThread(page, 400);
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, settle.to)},
    {settledWithin: 3},
  );
  await writeEvidence(
    'busy-main-thread/refresh-settle',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          settle,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - settle.from).toFixed(1),
            y: f.box?.y ?? null,
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  // The screencast resolves whole CSS pixels: judge until 3 px from rest.
  // Its delivery rate is the screencast's, not the animation's: no bound on
  // the median frame.
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.longestStallMs).toBeLessThan(40);
});

test('the settle does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  let settle = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await driver.play(slowPull(start, 300, 200));
    settle = await waitForSettle(content);
    // A fixed wait: polling the content's style every frame would itself
    // recalculate style.
    await page.waitForTimeout(900);
  });
  // The steady part of the settle, until it is within a pixel of rest (its
  // first frame may commit).
  const during = countBetween(trace, settle.from + 50, settle.from + 600);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
  expect(trace.longTasks).toEqual([]);
});

/**
 * Traces the page while `body` runs, on every thread, and returns each traced
 * event's name, thread and time (epoch ms).
 */
async function traceAllThreads(page: Page, body: () => Promise<unknown>) {
  const cdp = await page.context().newCDPSession(page);
  const raw: {name: string; ph: string; ts: number; tid: number}[] = [];
  cdp.on('Tracing.dataCollected', ({value}) => {
    raw.push(...(value as unknown as typeof raw));
  });
  const complete = new Promise<void>(resolve =>
    cdp.once('Tracing.tracingComplete', () => resolve()),
  );
  await cdp.send('Tracing.start', {
    transferMode: 'ReportEvents',
    traceConfig: {
      includedCategories: [
        'devtools.timeline',
        'disabled-by-default-devtools.timeline',
        'cc',
        'blink.user_timing',
      ],
      excludedCategories: ['*'],
    },
  });
  const anchor = await page.evaluate(
    () => performance.timeOrigin + performance.mark('refresh-trace').startTime,
  );
  await body();
  await cdp.send('Tracing.end');
  await complete;
  await cdp.detach().catch(() => {});
  const mark = raw.find(e => e.name === 'refresh-trace');
  if (mark == null) {
    throw new Error('traceAllThreads: the anchor mark was not traced');
  }
  return raw
    .filter(e => e.ph !== 'E')
    .map(e => ({
      name: e.name,
      main: e.tid === mark.tid,
      t: anchor + (e.ts - mark.ts) / 1000,
    }));
}

test('the pull rasters nothing per move: it writes transforms, and the reveal reaches only composited layers', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  // When the pull first moves the content and when it triggers, without
  // reading any style (a MutationObserver on the content only).
  await content.evaluate(element => {
    const marks = {firstMove: 0, trigger: 0};
    (window as unknown as {__marks: typeof marks}).__marks = marks;
    new MutationObserver(records => {
      const now = performance.timeOrigin + performance.now();
      for (const record of records) {
        if (
          record.attributeName === 'style' &&
          marks.firstMove === 0 &&
          element.style.getPropertyValue('translate') !== ''
        ) {
          marks.firstMove = now;
        }
        if (
          record.attributeName === 'aria-busy' &&
          marks.trigger === 0 &&
          element.getAttribute('aria-busy') === 'true'
        ) {
          marks.trigger = now;
        }
      }
    }).observe(element, {
      attributes: true,
      attributeFilter: ['style', 'aria-busy'],
    });
  });
  // The indicator's parts with a compositor layer for their opacity: each
  // rasters once, when it first shows.
  const layers = await content.evaluate(
    element =>
      [...element.querySelectorAll(':scope > :last-child *')].filter(part =>
        getComputedStyle(part).willChange.includes('opacity'),
      ).length,
  );
  let lift = 0;
  const events = await traceAllThreads(page, async () => {
    await driver.play(slowPull(start, 300, 200));
    lift = await page.evaluate(
      () => performance.timeOrigin + performance.now(),
    );
  });
  const marks = await page.evaluate(
    () =>
      (window as unknown as {__marks: {firstMove: number; trigger: number}})
        .__marks,
  );
  expect(marks.firstMove).toBeGreaterThan(0);
  expect(marks.trigger).toBeGreaterThan(marks.firstMove + 200);
  const count = (name: string, from: number, to: number, main = false) =>
    events.filter(
      e => e.name === name && e.t > from && e.t < to && (!main || e.main),
    ).length;
  // The reveal, from the second frame of the pull (the first promotes the
  // content and the band) to the frame before the trigger; then the band,
  // pulled past the trigger until the lift.
  const reveal = {from: marks.firstMove + 50, to: marks.trigger - 20};
  const band = {from: marks.trigger + 100, to: lift - 250};
  const detail = JSON.stringify({
    layers,
    reveal: {
      raster: count('RasterTask', reveal.from, reveal.to),
      layout: count('Layout', reveal.from, reveal.to, true),
    },
    band: {
      raster: count('RasterTask', band.from, band.to),
      layout: count('Layout', band.from, band.to, true),
    },
  });
  // Before, every move re-rastered the spokes and the title (one raster per
  // frame); now each composited part rasters once, as it first shows.
  expect(
    count('RasterTask', reveal.from, reveal.to),
    detail,
  ).toBeLessThanOrEqual(layers);
  expect(count('RasterTask', band.from, band.to), detail).toBe(0);
  // No layout per move either (the trigger's own render, between the two
  // windows, is not a move).
  expect(count('Layout', reveal.from, reveal.to, true), detail).toBe(0);
  expect(count('Layout', band.from, band.to, true), detail).toBe(0);
});

test('a list shorter than the screen still pulls and refreshes', async ({
  page,
}) => {
  const {driver, content, start} = await openRefresh(
    page,
    'lab-refreshcontrol--short-list',
    {refreshMs: '6000'},
  );
  await driver.play(slowPull(start, 300, 200));
  await waitForContentRest(content);
  expect(await isBusy(content)).toBe(true);
  expect(await shownPull(content)).toBeCloseTo(HEIGHT, 0);
});

test('on the page, the document’s top edge belongs to the pull near the top only', async ({
  page,
}) => {
  const {driver, content, start} = await openRefresh(
    page,
    'lab-refreshcontrol--on-the-page',
    {refreshMs: '6000', rows: '80'},
  );
  const rootOverscroll = () =>
    page.evaluate(
      () => getComputedStyle(document.documentElement).overscrollBehaviorY,
    );
  expect(await rootOverscroll()).toBe('none');
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await expect.poll(rootOverscroll).toBe('auto');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(rootOverscroll).toBe('none');
  const started = await page.evaluate(
    () => performance.timeOrigin + performance.now(),
  );
  await driver.play(slowPull(start, 300, 200));
  await waitForContentRest(content);
  expect(await isBusy(content)).toBe(true);
  expect(await shownPull(content)).toBeCloseTo(HEIGHT, 0);
  // No long task from the pull, the trigger or the settle.
  expect(
    await readLongTasks(page, {
      from: started,
      to: await page.evaluate(() => performance.timeOrigin + performance.now()),
    }),
  ).toEqual([]);
});

test('a pull pushed back past its start hands the finger to native scrolling', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'native scrolling from injected touches is Chromium-only (WebKit: the iOS simulator rig)',
  );
  const {driver, content, start} = await openRefresh(page);
  const scrollTop = () =>
    page
      .locator('.astryx-scrollable-area')
      .first()
      .evaluate(el => el.scrollTop);
  // Down 50 px, then up 250 px, in one touch.
  const at = (progress: number) =>
    progress < 0.25
      ? {x: start.x, y: start.y + 50 * (progress / 0.25)}
      : {x: start.x, y: start.y + 50 - 250 * ((progress - 0.25) / 0.75)};
  await driver.play(path(at, {durationMs: 900, hz: 60, restMs: 150}));
  await waitForContentRest(content);
  expect(await shownPull(content)).toBeCloseTo(0, 1);
  expect(await isBusy(content)).toBe(false);
  expect(await scrollTop()).toBeGreaterThan(50);
});

test('a drag that began as a scroll pulls once the content reaches the top, in the same touch', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'native scrolling from injected touches is Chromium-only (WebKit: the iOS simulator rig)',
  );
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  const scroller = page.locator('.astryx-scrollable-area').first();
  const scrollTop = () => scroller.evaluate(el => el.scrollTop);
  await scroller.evaluate(el => {
    el.scrollTop = 80;
  });
  await expect.poll(scrollTop).toBe(80);
  // Down 450 px in one touch: the first 80 px scroll the content to its top
  // natively, and the rest pulls past the trigger.
  await driver.play(slowPull(start, 450, 200));
  await waitForContentRest(content);
  expect(await scrollTop()).toBe(0);
  expect(await isBusy(content)).toBe(true);
  expect(await shownPull(content)).toBeCloseTo(HEIGHT, 0);
});

test('a pull while refreshing stretches from the inset and settles back onto it', async ({
  page,
}) => {
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  await driver.play(slowPull(start, 300, 200));
  await waitForContentRest(content);
  expect(await shownPull(content)).toBeCloseTo(HEIGHT, 0);
  let deepest = 0;
  await playReading(
    page,
    driver,
    content,
    slowPull(start, 200, 200),
    async () => {
      deepest = await shownPull(content);
    },
  );
  // The second pull starts from the inset, not from the top.
  expect(deepest).toBeGreaterThan(HEIGHT + 60);
  await waitForContentRest(content);
  expect(await shownPull(content)).toBeCloseTo(HEIGHT, 0);
  expect(await isBusy(content)).toBe(true);
});

test('a finger catching the settle holds it where it is, then pulls on from there', async ({
  page,
}) => {
  const {driver, content, start} = await openRefresh(page);
  await driver.play(slowPull(start, 76, 150));
  // The settle back to the top is running: catch it 100 ms in.
  await waitForSettle(content);
  await page.waitForTimeout(100);
  const caught = await shownPull(content);
  expect(caught).toBeGreaterThan(5);
  const readings = await playReading(
    page,
    driver,
    content,
    drag(
      start,
      {x: start.x, y: start.y + 30},
      {durationMs: 300, hz: 60, restMs: 100},
    ),
  );
  // No jump at the catch: the first reading is where the settle stood, and
  // the pull goes on from there.
  expect(Math.abs(readings[0].shown - caught)).toBeLessThan(6);
  expect(readings.at(-1)?.shown ?? 0).toBeGreaterThan(caught);
  await waitForContentRest(content);
  expect(await shownPull(content)).toBeCloseTo(0, 1);
});

/** The primary pointer the page reports: coarse (a touch screen) or fine. */
async function primaryPointer(page: Page, kind: 'coarse' | 'fine') {
  await page.addInitScript(coarse => {
    const native = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      const pointer = /^\(\s*pointer\s*:\s*(coarse|fine|none)\s*\)$/.exec(
        query.trim(),
      );
      if (pointer == null) {
        return native(query);
      }
      // A static list: the primary pointer never changes in a test.
      const list = {
        matches: (pointer[1] === 'coarse') === coarse,
        media: query,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent: () => false,
      };
      return list as unknown as MediaQueryList;
    };
  }, kind === 'coarse');
}

interface RecordedAnimation {
  part: 'content' | 'band' | 'spinner' | 'title' | 'other';
  properties: string[];
  /** How long the animated values change, ms (the held end excluded). */
  movingMs: number;
  /**
   * Whether anything but opacity passes through values in between (travel);
   * a value that lands at once (two keyframes at one offset) does not.
   */
  travels: boolean;
  /** Repeats forever (the spinner's spin, outside the record). */
  endless: boolean;
  /** When it was created (`performance.now()`). */
  at: number;
}

/**
 * Records every animation the page creates on the refresh control from now
 * on, and when the refresh's busy state clears.
 */
async function recordAnimations(page: Page) {
  await page.evaluate(() => {
    const log: unknown[] = [];
    const record = window as unknown as {
      __animations: unknown[];
      __endedAt: number | null;
    };
    record.__animations = log;
    record.__endedAt = null;
    const content = document.querySelector('.astryx-refresh-control');
    if (content != null) {
      new MutationObserver(() => {
        if (!content.hasAttribute('aria-busy') && record.__endedAt == null) {
          record.__endedAt = performance.now();
        }
      }).observe(content, {attributes: true, attributeFilter: ['aria-busy']});
    }
    const native = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      const animation = native.call(this, keyframes, options);
      const content = document.querySelector('.astryx-refresh-control');
      const band = content?.querySelector(':scope > :last-child > div');
      const part =
        this === content
          ? 'content'
          : this === band
            ? 'band'
            : band != null && this === band.firstElementChild
              ? 'spinner'
              : band != null && this === band.lastElementChild
                ? 'title'
                : 'other';
      const effect = animation.effect as KeyframeEffect | null;
      const frames = effect?.getKeyframes() ?? [];
      const skip = new Set(['offset', 'computedOffset', 'easing', 'composite']);
      const properties = [
        ...new Set(
          frames.flatMap(f => Object.keys(f).filter(k => !skip.has(k))),
        ),
      ];
      const timing = effect?.getComputedTiming();
      const duration = Number(timing?.duration ?? 0);
      const last = frames.at(-1);
      let movingMs = 0;
      for (let i = frames.length - 1; i > 0; i--) {
        if (properties.some(p => frames[i - 1][p] !== last?.[p])) {
          movingMs = Number(frames[i].computedOffset) * duration;
          break;
        }
      }
      const travels = properties
        .filter(p => p !== 'opacity')
        .some(p =>
          frames.some((frame, i) => {
            const next = frames[i + 1];
            return (
              next != null &&
              frame[p] !== next[p] &&
              Number(next.computedOffset) > Number(frame.computedOffset) &&
              !/^step/.test(String(frame.easing ?? 'linear'))
            );
          }),
        );
      log.push({
        part,
        properties,
        movingMs,
        travels,
        endless: timing?.iterations === Infinity,
        at: performance.now(),
      });
      return animation;
    };
  });
}

const recordedAnimations = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as {__animations: RecordedAnimation[]}).__animations,
  );

/** The animations created once the refresh's busy state cleared: the end's. */
const recordedEnd = (page: Page) =>
  page.evaluate(() => {
    const record = window as unknown as {
      __animations: RecordedAnimation[];
      __endedAt: number | null;
    };
    const endedAt = record.__endedAt ?? Infinity;
    return record.__animations.filter(a => a.at >= endedAt);
  });

/**
 * The record's failures among recorded transitions (spins excluded): travel,
 * or values still changing after 200 ms.
 */
function reducedMotionFailures(log: readonly RecordedAnimation[]) {
  return log.filter(
    a => a.part !== 'other' && !a.endless && (a.travels || a.movingMs > 200),
  );
}

test('under Reduce Motion a release cross-fades onto the inset: opacity only, within 200 ms', async ({
  page,
}) => {
  // design:reduced-motion DR1, DR2: a transition a touch release starts
  // fades, opacity only, in 200 ms or less; nothing moves.
  await page.emulateMedia({reducedMotion: 'reduce'});
  await primaryPointer(page, 'coarse');
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  await recordAnimations(page);
  await driver.play(slowPull(start, 300, 200));
  await waitForContentRest(content);
  expect(await shownPull(content)).toBeCloseTo(HEIGHT, 1);
  const log = await recordedAnimations(page);
  expect(reducedMotionFailures(log), JSON.stringify(log)).toEqual([]);
  // A change with no cross-fade fails too.
  expect(
    log.some(a => a.part === 'content' && a.properties.includes('opacity')),
    JSON.stringify(log),
  ).toBe(true);
});

test('under Reduce Motion the end cross-fades on a touch screen, even with the theme’s motion lengthened', async ({
  page,
}) => {
  // design:reduced-motion DR2 (coarse pointer) and DR4: no theme value
  // restores travel or a longer animation.
  await page.emulateMedia({reducedMotion: 'reduce'});
  await primaryPointer(page, 'coarse');
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '1500',
  });
  await page.evaluate(() => {
    const root = document.documentElement.style;
    root.setProperty('--motion-refresh-control-end-ms', '2000ms');
    root.setProperty('--motion-refresh-control-exit-ms', '2000ms');
  });
  await recordAnimations(page);
  await driver.play(slowPull(start, 300, 200));
  await expect.poll(() => isBusy(content), {timeout: 8000}).toBe(false);
  await page.waitForTimeout(100);
  await waitForContentRest(content);
  expect(await shownPull(content)).toBeCloseTo(0, 1);
  const log = await recordedEnd(page);
  expect(reducedMotionFailures(log), JSON.stringify(log)).toEqual([]);
  expect(
    log.some(a => a.part === 'content' && a.properties.includes('opacity')),
    JSON.stringify(log),
  ).toBe(true);
});

test('the end plays the theme’s refreshControl.endMs: the touch layer registers its table before animating', async ({
  page,
}) => {
  // Motion tables register nothing on import (core's registry rule); the
  // refresh control's touch layer registers its own before its first
  // animation, so a theme's value reaches the end.
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '1500',
  });
  await page.evaluate(() => {
    document.documentElement.style.setProperty(
      '--motion-refresh-control-end-ms',
      '600ms',
    );
  });
  await recordAnimations(page);
  await driver.play(slowPull(start, 300, 200));
  await expect.poll(() => isBusy(content), {timeout: 8000}).toBe(false);
  await page.waitForTimeout(100);
  await waitForContentRest(content);
  const log = await recordedEnd(page);
  const slide = log.find(
    a => a.part === 'content' && a.properties.includes('translate'),
  );
  expect(slide, JSON.stringify(log)).toBeDefined();
  expect(Math.abs((slide?.movingMs ?? 0) - 600)).toBeLessThan(20);
});

test('under Reduce Motion the trigger does not turn the spinner', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await primaryPointer(page, 'coarse');
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  await recordAnimations(page);
  await driver.play(slowPull(start, 300, 200));
  await waitForContentRest(content);
  const log = await recordedAnimations(page);
  expect(
    log.filter(
      a =>
        a.part === 'spinner' && !a.endless && a.properties.includes('rotate'),
    ),
    JSON.stringify(log),
  ).toEqual([]);
  expect(reducedMotionFailures(log), JSON.stringify(log)).toEqual([]);
});

test('with a mouse or trackpad the pull and the top edge stay the browser’s', async ({
  browser,
}) => {
  // A context with no touch screen: CSS and script both read a fine primary
  // pointer (the phone contexts report a coarse one).
  const context = await browser.newContext({
    viewport: {width: 402, height: 714},
    hasTouch: false,
    isMobile: false,
  });
  try {
    const page = await context.newPage();
    await openStory(page, storybook(), 'lab-refreshcontrol--on-the-page', {
      refreshMs: '6000',
    });
    const pointer = await page.evaluate(() => ({
      coarse: matchMedia('(pointer: coarse)').matches,
      fine: matchMedia('(pointer: fine)').matches,
    }));
    expect(pointer).toEqual({coarse: false, fine: true});
    const content = page.locator('.astryx-refresh-control').first();
    await expect(content).toBeVisible();
    const rootOverscroll = () =>
      page.evaluate(
        () => getComputedStyle(document.documentElement).overscrollBehaviorY,
      );
    expect(await rootOverscroll()).toBe('auto');
    // A mouse dragged down from the top of the page pulls nothing.
    await page.mouse.move(200, 160);
    await page.mouse.down();
    const shown: number[] = [];
    for (let step = 1; step <= 20; step++) {
      await page.mouse.move(200, 160 + step * 15);
      shown.push(await shownPull(content));
    }
    await page.mouse.up();
    await page.waitForTimeout(300);
    expect(Math.max(...shown.map(Math.abs))).toBe(0);
    expect(await isBusy(content)).toBe(false);
    expect(await shownPull(content)).toBe(0);
    expect(await rootOverscroll()).toBe('auto');
  } finally {
    await context.close();
  }
});

/**
 * The indicator band's top, px below the scroll view's top: the band holding
 * the spinner (the spinner itself turns, so its box grows with the angle).
 */
const spinnerTop = (content: Locator) =>
  content.evaluate(element => {
    const spinner = element.querySelector(
      ':scope > :last-child span',
    )?.parentElement;
    let scroller = element.parentElement;
    while (
      scroller != null &&
      !/auto|scroll/.test(getComputedStyle(scroller).overflowY)
    ) {
      scroller = scroller.parentElement;
    }
    const top = scroller?.getBoundingClientRect().top ?? 0;
    return (spinner?.getBoundingClientRect().top ?? NaN) - top;
  });

test('the spinner stays at the top of the scroll view while the content is pulled and settles, as UIRefreshControl’s does', async ({
  page,
}) => {
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  const readings: {shown: number; spinner: number}[] = [];
  await driver.play(slowPull(start, 300, 150), {
    onEvent: async step => {
      if (step.type !== 'touchMove') {
        return;
      }
      await frames(page, 1);
      readings.push({
        shown: await shownPull(content),
        spinner: await spinnerTop(content),
      });
    },
  });
  await waitForContentRest(content);
  const revealed = readings.filter(r => r.shown >= HEIGHT + 10);
  const shown = revealed.map(r => r.shown);
  const spinner = revealed.map(r => r.spinner);
  // The content travelled while the spinner held still.
  expect(Math.max(...shown) - Math.min(...shown)).toBeGreaterThan(40);
  expect(Math.max(...spinner) - Math.min(...spinner)).toBeLessThanOrEqual(1);
  // Settled onto the inset, it is where it was during the pull.
  expect(await shownPull(content)).toBeCloseTo(HEIGHT, 0);
  expect(
    Math.abs((await spinnerTop(content)) - spinner[0]),
  ).toBeLessThanOrEqual(1);
});

/**
 * Samples the content's presented translation every frame from `from`
 * ('lift': the finger's lift, 'end': the refresh's end) and blocks the main
 * thread for `blockMs` right after it, before the next frame, as a busy app
 * would: in its own task after the lift, or in the commit that ends the busy
 * state.
 */
async function sampleAfter(
  content: Locator,
  from: 'lift' | 'end',
  blockMs: number,
): Promise<void> {
  await content.evaluate(
    (element, {from, blockMs}) => {
      const shown = () => {
        const value = getComputedStyle(element).translate;
        return value === 'none' || value === ''
          ? 0
          : parseFloat(value.split(/\s+/)[1] ?? '0');
      };
      const samples: number[] = [];
      (window as unknown as {__after: number[]}).__after = samples;
      const block = () => {
        const until = performance.now() + blockMs;
        while (performance.now() < until) {
          // A busy app.
        }
      };
      const sample = () => {
        samples.push(shown());
        if (samples.length < 90) {
          requestAnimationFrame(sample);
        }
      };
      const begin = () => {
        samples.push(shown());
        requestAnimationFrame(sample);
      };
      if (from === 'lift') {
        addEventListener(
          'touchend',
          () => {
            begin();
            setTimeout(block, 0);
          },
          {once: true},
        );
      } else {
        const observer = new MutationObserver(() => {
          if (element.getAttribute('aria-busy') !== 'true') {
            observer.disconnect();
            begin();
            block();
          }
        });
        observer.observe(element, {
          attributes: true,
          attributeFilter: ['aria-busy'],
        });
      }
    },
    {from, blockMs},
  );
}

/** How far the first moving frame went, as a share of the whole travel. */
async function firstStep(page: Page, to: number): Promise<number> {
  const samples = await page.evaluate(
    () => (window as unknown as {__after: number[]}).__after,
  );
  const from = samples[0];
  const moved = samples.find(value => Math.abs(value - from) > 0.5);
  expect(moved, JSON.stringify(samples)).toBeDefined();
  return Math.abs((moved ?? from) - from) / Math.abs(to - from);
}

test('the settle starts where its curve starts, even when the page is busy right after the lift', async ({
  page,
}) => {
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '6000',
  });
  await sampleAfter(content, 'lift', 250);
  await driver.play(slowPull(start, 300, 150));
  await page.waitForTimeout(1200);
  // The spring's first frames cover a few percent of the way; a settle that
  // started before the block would show up most of the way down.
  expect(await firstStep(page, HEIGHT)).toBeLessThanOrEqual(0.25);
});

test('the end slides from its start, even when the page is busy as the refresh ends', async ({
  page,
}) => {
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '1200',
  });
  await sampleAfter(content, 'end', 250);
  await driver.play(slowPull(start, 300, 150));
  await waitForSettle(content, {afterRefresh: true});
  await page.waitForTimeout(800);
  expect(await firstStep(page, 0)).toBeLessThanOrEqual(0.25);
});

test(
  'storyboard: pull past the trigger, settle onto the inset, end',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, content, start} = await openRefresh(page, undefined, {
      refreshMs: '1200',
    });
    await installTimerGate(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {
      x: 0,
      y: 0,
      width: viewport.width,
      height: Math.min(320, viewport.height),
    };
    const measure = async () => ({
      pull: await shownPull(content),
      busy: await isBusy(content),
    });
    const pullBoard = await touchStoryboard(
      page,
      driver,
      drag(
        start,
        {x: start.x, y: start.y + 300},
        {durationMs: 600, hz: 30, restMs: 150},
      ),
      {
        name: 'refresh-pull-to-trigger',
        clip,
        measure,
        columns: 6,
        cellScale: 0.4,
      },
    );
    await waitForSettle(content);
    await freezeTimers(page);
    // The film runs to the latest curve end among the held animations; it
    // starts at the trigger turn, which began before the lift.
    const {storyboard: settleBoard} = await animationStoryboard(page, {
      name: 'refresh-settle-onto-inset',
      clip,
      scope: content,
      measure,
      columns: 7,
      cellScale: 0.4,
    });
    await releaseAnimations(page);
    await thawTimers(page);
    await waitForSettle(content, {afterRefresh: true});
    await freezeTimers(page);
    const {storyboard: endBoard} = await animationStoryboard(page, {
      name: 'refresh-end',
      clip,
      scope: content,
      times: timeline(300),
      measure,
      columns: 7,
      cellScale: 0.4,
    });
    await releaseAnimations(page);
    await thawTimers(page);
    await pullBoard.write(testInfo);
    await settleBoard.write(testInfo);
    await endBoard.write(testInfo);
    // The traces are the assertions; the sheets are the evidence.
    // One frame per scripted event; the last is the lift, after which the
    // settle has started back.
    const pulls = pullBoard.frames.slice(0, -1).map(f => f.data.pull as number);
    expect(pulls.every((v, i) => i === 0 || v >= pulls[i - 1] - 0.5)).toBe(
      true,
    );
    expect(pullBoard.frames.some(f => f.data.busy === true)).toBe(true);
    const settles = settleBoard.frames.map(f => f.data.pull as number);
    expect(settles.at(-1)).toBeCloseTo(HEIGHT, 0);
    const ends = endBoard.frames.map(f => f.data.pull as number);
    expect(ends.every((v, i) => i === 0 || v <= ends[i - 1] + 0.5)).toBe(true);
    expect(ends.at(-1)).toBeCloseTo(0, 0);
  },
);

// -----------------------------------------------------------------------------
// The indicator's spin (opacity steps on the compositor)
// -----------------------------------------------------------------------------

/**
 * For each frame, which of the eight spokes is the darkest (the gradient's
 * head), sampled at the middle of each spoke (10 pt from the center), and
 * each spoke's darkness there.
 */
async function spinHeads(
  page: Page,
  castFrames: readonly {t: number; data: string}[],
  glyph: {x: number; y: number; width: number; height: number},
): Promise<{t: number; head: number; contrast: number; dark: number[]}[]> {
  const scratch = await page.context().newPage();
  try {
    const viewport = page.viewportSize() ?? {width: 402, height: 874};
    return await scratch.evaluate(
      async ({items, box, width}) => {
        const out: {
          t: number;
          head: number;
          contrast: number;
          dark: number[];
        }[] = [];
        for (const item of items) {
          const bitmap = await createImageBitmap(
            await (await fetch(`data:image/png;base64,${item.data}`)).blob(),
          );
          const scale = bitmap.width / width;
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          const context = canvas.getContext('2d');
          if (context == null) {
            throw new Error('no 2d context');
          }
          context.drawImage(bitmap, 0, 0);
          const cx = (box.x + box.width / 2) * scale;
          const cy = (box.y + box.height / 2) * scale;
          const dark: number[] = [];
          for (let k = 0; k < 8; k += 1) {
            const angle = (k * Math.PI) / 4;
            const x = Math.round(cx + 10 * scale * Math.sin(angle));
            const y = Math.round(cy - 10 * scale * Math.cos(angle));
            const {data} = context.getImageData(x - 1, y - 1, 3, 3);
            let sum = 0;
            for (let i = 0; i < data.length; i += 4) {
              sum += data[i] + data[i + 1] + data[i + 2];
            }
            dark.push(765 - sum / (data.length / 4));
          }
          const max = Math.max(...dark);
          const sorted = [...dark].sort((a, b) => b - a);
          out.push({
            t: item.t,
            head: dark.indexOf(max),
            contrast: max - sorted[1],
            dark,
          });
        }
        return out;
      },
      {
        items: castFrames.map(f => ({t: f.t, data: f.data})),
        box: glyph,
        width: viewport.width,
      },
    );
  } finally {
    await scratch.close();
  }
}

test('the spin steps clockwise every eighth of a second while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '8000',
  });
  await driver.play(slowPull(start, 300, 200));
  await expect.poll(() => isBusy(content)).toBe(true);
  // Past the trigger turn and the gradient's spring (both about 3 s).
  await page.waitForTimeout(3600);
  const glyph = await content
    .locator(':scope > div:last-child > div > span')
    .first()
    .boundingBox();
  if (glyph == null) {
    throw new Error('no indicator');
  }
  const cast = await startScreencast(page);
  await page.waitForTimeout(150);
  const block = await blockMainThread(page, 700);
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const heads = await spinHeads(page, castFrames, glyph);
  // A frame may catch the 0.1 ms ramp between two steps (the head then
  // barely stands out): judge the frames where it clearly does.
  const inside = heads.filter(
    f => f.t >= block.from + 20 && f.t <= block.to - 20 && f.contrast > 15,
  );
  const steps: {t: number; from: number; to: number}[] = [];
  for (let i = 1; i < inside.length; i += 1) {
    if (inside[i].head !== inside[i - 1].head) {
      steps.push({
        t: inside[i].t,
        from: inside[i - 1].head,
        to: inside[i].head,
      });
    }
  }
  await writeEvidence(
    'busy-main-thread/refresh-spin',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, glyph, steps, heads: inside},
        null,
        1,
      ),
    },
    testInfo,
  );
  // The head is clearly the darkest spoke in nearly every frame.
  const judged = heads.filter(
    f => f.t >= block.from + 20 && f.t <= block.to - 20,
  );
  expect(inside.length).toBeGreaterThanOrEqual(judged.length - 2);
  // About every 125 ms, always one spoke clockwise.
  expect(steps.length).toBeGreaterThanOrEqual(4);
  for (const step of steps) {
    expect((step.from + 1) % 8, JSON.stringify(step)).toBe(step.to);
  }
  for (let i = 1; i < steps.length; i += 1) {
    expect(steps[i].t - steps[i - 1].t).toBeGreaterThan(90);
    expect(steps[i].t - steps[i - 1].t).toBeLessThan(160);
  }
});

test('the cross-fade and the spin do no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '8000',
  });
  await driver.play(slowPull(start, 300, 200));
  await expect.poll(() => isBusy(content)).toBe(true);
  const glyph = content.locator(':scope > div:last-child > div > span').first();
  // While the transient copy fades out over the stepping spokes, once the
  // content holds still (the pull itself repaints: the content's translate).
  await waitForSettle(content);
  const copyCount = () => glyph.evaluate(element => element.children.length);
  expect(await copyCount()).toBe(9);
  const during = await traceRendering(page, async () => {
    await page.waitForTimeout(600);
  });
  // The copy was still fading the whole time.
  expect(await copyCount()).toBe(9);
  expect(during.layout, JSON.stringify(during.counts)).toBe(0);
  expect(during.paint, JSON.stringify(during.counts)).toBe(0);
  // Then the spin alone, once the copy is gone: eight steps.
  await expect
    .poll(() => glyph.evaluate(element => element.children.length), {
      timeout: 8000,
    })
    .toBe(8);
  await page.waitForTimeout(200);
  const after = await traceRendering(page, async () => {
    await page.waitForTimeout(1000);
  });
  expect(after.layout, JSON.stringify(after.counts)).toBe(0);
  expect(after.paint, JSON.stringify(after.counts)).toBe(0);
});

test('at the trigger each spoke cross-fades into the gradient: UIKit\u2019s two images summed', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Chromium screenshot proof');
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '8000',
  });
  await driver.play(slowPull(start, 300, 200));
  await expect.poll(() => isBusy(content)).toBe(true);
  await page.waitForTimeout(1200);
  const glyph = content.locator(':scope > div:last-child > div > span').first();
  // Hold everything 0.755 s after the trigger: the copy's fade at the
  // gradient spring's midpoint (w = 0.5), the spokes' steps at step 6, the
  // trigger turn finished.
  const held = await glyph.evaluate(element => {
    const kinds: string[] = [];
    for (const animation of element.getAnimations({subtree: true})) {
      animation.pause();
      const timing = animation.effect?.getTiming();
      if ((animation.effect as KeyframeEffect).target === element) {
        animation.finish();
        kinds.push('turn');
      } else if (timing?.iterations === Infinity) {
        animation.currentTime = 755;
        kinds.push('spin');
      } else {
        animation.currentTime = 755;
        kinds.push('cross-fade');
      }
    }
    return {
      kinds,
      children: element.children.length,
      copySpokes: element.lastElementChild?.children.length ?? 0,
      color: getComputedStyle(element.firstElementChild as Element)
        .backgroundColor,
    };
  });
  // The eight spokes and the transient copy of them, each element with its
  // one animation: eight steps and one fade.
  expect(held.children).toBe(9);
  expect(held.copySpokes).toBe(8);
  expect(held.kinds.filter(k => k === 'spin')).toHaveLength(8);
  expect(held.kinds.filter(k => k === 'cross-fade')).toHaveLength(1);
  const shot = await glyph.screenshot();
  const ink = (held.color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const alphas = await page.evaluate(
    async ({png, color}) => {
      const bitmap = await createImageBitmap(
        await (await fetch(`data:image/png;base64,${png}`)).blob(),
      );
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      if (context == null) {
        throw new Error('no 2d context');
      }
      context.drawImage(bitmap, 0, 0);
      const {data, width} = context.getImageData(
        0,
        0,
        bitmap.width,
        bitmap.height,
      );
      const scale = bitmap.width / 30;
      const c = bitmap.width / 2;
      const out: number[] = [];
      for (let p = 0; p < 8; p += 1) {
        const a = (p * Math.PI) / 4;
        const x = Math.round(c + 10 * scale * Math.sin(a));
        const y = Math.round(c - 10 * scale * Math.cos(a));
        let sum = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            sum += data[i] + data[i + 1] + data[i + 2];
            n += 3;
          }
        }
        const level = sum / n;
        const gray = (color[0] + color[1] + color[2]) / 3;
        // The page is white: level = 255 - alpha * (255 - ink).
        out.push((255 - level) / (255 - gray));
      }
      return out;
    },
    {png: shot.toString('base64'), color: ink},
  );
  // Each spoke at 1 - w + w × its instance's alpha (spoke p holds instance
  // (p - 6) mod 8 at step 6): the copy at 1 - w over the stepping spoke,
  // UIKit's sum of its two images.
  const w = 0.5;
  alphas.forEach((alpha, p) => {
    const instance = 0.08 * ((p + 2) % 8);
    const sum = 1 - w + w * instance;
    expect(
      Math.abs(alpha - sum),
      `spoke ${p}: ${alpha.toFixed(3)}`,
    ).toBeLessThan(0.03);
  });
  // The brightest spoke (instance 7, at spoke 5) shows the sum, not normal
  // blending's 0.64.
  expect(alphas[5]).toBeGreaterThan(0.74);
});

test('the cross-fade keeps moving while the main thread is blocked right after the trigger', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '8000',
  });
  const cast = await startScreencast(page);
  await driver.play(slowPull(start, 300, 200));
  // Blocked from the page itself as soon as the trigger has mounted the
  // copy, so the block covers the start of its fade.
  const {block, glyph} = await content.evaluate(async element => {
    const spinner = element.querySelector(
      ':scope > div:last-child > div > span',
    ) as Element;
    while (spinner.children.length < 9) {
      await new Promise(requestAnimationFrame);
    }
    // A few frames after the lift, so the settle it starts has committed,
    // then from a task of its own: a block that holds a pending commit makes
    // the compositor wait for it before drawing on, a startup gap that is
    // not the cross-fade's.
    for (let i = 0; i < 3; i += 1) {
      await new Promise(requestAnimationFrame);
    }
    await new Promise(resolve => setTimeout(resolve, 0));
    const rect = spinner.getBoundingClientRect();
    const from = performance.timeOrigin + performance.now();
    const end = performance.now() + 700;
    while (performance.now() < end) {
      // Hold the main thread.
    }
    return {
      block: {from, to: performance.timeOrigin + performance.now()},
      glyph: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
    };
  });
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  // The glyph's whole ink, frame by frame: the turn moves the spokes but not
  // how much they cover, so only the fade changes it.
  const scratch = await page.context().newPage();
  const viewport = page.viewportSize() ?? {width: 402, height: 874};
  const inks = await scratch
    .evaluate(
      async ({items, box, width}) => {
        const out: {t: number; ink: number}[] = [];
        for (const item of items) {
          const bitmap = await createImageBitmap(
            await (await fetch(`data:image/png;base64,${item.data}`)).blob(),
          );
          const scale = bitmap.width / width;
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          const context = canvas.getContext('2d');
          if (context == null) {
            throw new Error('no 2d context');
          }
          context.drawImage(bitmap, 0, 0);
          const pad = 2;
          const x = Math.floor((box.x - pad) * scale);
          const y = Math.floor((box.y - pad) * scale);
          const side = Math.ceil((box.width + 2 * pad) * scale);
          const {data} = context.getImageData(x, y, side, side);
          let ink = 0;
          for (let i = 0; i < data.length; i += 4) {
            ink += 765 - (data[i] + data[i + 1] + data[i + 2]);
          }
          out.push({t: item.t, ink: ink / (scale * scale * 765)});
        }
        return out;
      },
      {
        items: castFrames.map(f => ({t: f.t, data: f.data})),
        box: glyph,
        width: viewport.width,
      },
    )
    .finally(() => scratch.close());
  const inside = inks.filter(
    f => f.t >= block.from + 20 && f.t <= block.to - 20,
  );
  // The screencast's own cadence, from the frames around the block.
  const around = inks.filter(
    f => f.t >= block.from - 300 && f.t <= block.to + 150,
  );
  const intervals = around
    .slice(1)
    .map((f, i) => f.t - around[i].t)
    .sort((a, b) => a - b);
  const cadenceMs = intervals[Math.floor(intervals.length / 2)] ?? 16.7;
  const expectedFrames = Math.floor((block.to - block.from - 40) / cadenceMs);
  // The copy fades every frame, so every presented frame shows less ink
  // than the one before it.
  let changed = 0;
  let longestStill = 0;
  let last = block.from + 20;
  for (let i = 1; i < inside.length; i += 1) {
    if (inside[i].ink < inside[i - 1].ink - 0.05) {
      changed += 1;
      longestStill = Math.max(longestStill, inside[i].t - last);
      last = inside[i].t;
    }
  }
  longestStill = Math.max(longestStill, block.to - 20 - last);
  await writeEvidence(
    'busy-main-thread/refresh-trigger',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, glyph, cadenceMs, expectedFrames, changed, frames: inside},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(inside.length).toBeGreaterThanOrEqual(expectedFrames - 2);
  expect(changed, JSON.stringify(inside)).toBeGreaterThanOrEqual(
    inside.length - 3,
  );
  expect(longestStill).toBeLessThanOrEqual(3 * cadenceMs);
});

test('under Reduce Motion the gradient cross-fades in on a touch screen: opacity only, within 200 ms', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Chromium proof');
  // design:reduced-motion DR2: the trigger's cross-fade from the revealed
  // spokes to the stepping ones is the shared fade, opacity only, in 200 ms
  // or less on a touch screen.
  await page.emulateMedia({reducedMotion: 'reduce'});
  await primaryPointer(page, 'coarse');
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '8000',
  });
  await recordAnimations(page);
  await driver.play(slowPull(start, 300, 200));
  await expect.poll(() => isBusy(content)).toBe(true);
  await page.waitForTimeout(400);
  const log = await recordedAnimations(page);
  // The transient copy of the spokes inside the spinner fades out over them.
  const fades = log.filter(a => a.part === 'other' && !a.endless);
  expect(fades.length, JSON.stringify(log)).toBeGreaterThanOrEqual(1);
  for (const fade of fades) {
    expect(fade.properties, JSON.stringify(fade)).toEqual(['opacity']);
    expect(fade.travels).toBe(false);
    expect(fade.movingMs).toBeLessThanOrEqual(200);
  }
  expect(reducedMotionFailures(log), JSON.stringify(log)).toEqual([]);
});

test(
  'storyboard: the spin, one turn of the gradient',
  {tag: '@storyboard'},
  async ({page, browserName}, testInfo) => {
    test.skip(browserName !== 'chromium', 'Chromium storyboard');
    const {driver, content, start} = await openRefresh(page, undefined, {
      refreshMs: '8000',
    });
    await driver.play(slowPull(start, 300, 200));
    await expect.poll(() => isBusy(content)).toBe(true);
    const glyph = content
      .locator(':scope > div:last-child > div > span')
      .first();
    // Once the trigger's cross-fade is over and its copy gone.
    await expect
      .poll(() => glyph.evaluate(element => element.children.length), {
        timeout: 8000,
      })
      .toBe(8);
    // Hold the glyph's animations, then show each eighth of a turn mid-hold.
    await glyph.evaluate(element => {
      for (const animation of element.getAnimations({subtree: true})) {
        animation.pause();
      }
    });
    const shots: Buffer[] = [];
    for (let step = 0; step < 8; step += 1) {
      await glyph.evaluate(
        (element, t) => {
          for (const animation of element.getAnimations({subtree: true})) {
            const iterations = animation.effect?.getTiming().iterations;
            // The turn repeats; the gradient's spring has settled.
            if (iterations === Infinity) {
              animation.currentTime = t;
            }
          }
        },
        step * 125 + 62,
      );
      shots.push(await glyph.screenshot());
    }
    const sheet = await page.context().newPage();
    try {
      const png = await sheet.evaluate(
        async items => {
          const decoded = await Promise.all(
            items.map(async item =>
              createImageBitmap(
                await (await fetch(`data:image/png;base64,${item}`)).blob(),
              ),
            ),
          );
          const w = decoded[0].width + 8;
          const canvas = new OffscreenCanvas(
            w * decoded.length,
            decoded[0].height + 8,
          );
          const context = canvas.getContext('2d');
          if (context == null) {
            throw new Error('no 2d context');
          }
          context.fillStyle = '#fff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          decoded.forEach((bitmap, i) =>
            context.drawImage(bitmap, i * w + 4, 4),
          );
          const blob = await canvas.convertToBlob({type: 'image/png'});
          const bytes = new Uint8Array(await blob.arrayBuffer());
          let binary = '';
          for (const byte of bytes) {
            binary += String.fromCharCode(byte);
          }
          return btoa(binary);
        },
        shots.map(shot => shot.toString('base64')),
      );
      await writeEvidence(
        'storyboards/refresh-spin',
        {[`${testInfo.project.name}.png`]: Buffer.from(png, 'base64')},
        testInfo,
      );
    } finally {
      await sheet.close();
    }
  },
);
