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
 *   does no Layout or Paint per frame; a short list still pulls; on the page
 *   the document's top edge belongs to the pull; a pull pushed back hands the
 *   finger to native scrolling; a pull while refreshing settles back onto the
 *   inset; a finger catching the settle resumes it without a jump; Reduce
 *   Motion changes nothing (as UIKit, iOS 26.2); off iOS the pull and the top
 *   edge stay the browser's; storyboards of the pull, the settle and the end.
 *
 * The control follows the iOS idiom only (`useTouchIdiom`: a coarse pointer
 * on WebKit for iOS). Neither Playwright engine is iOS WebKit and CSS cannot
 * be told otherwise, so the iOS proofs make the page's JavaScript read as iOS
 * (`asIos`); the fallback proof leaves Chromium as it is, an Android phone's
 * engine under a touch screen.
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

/**
 * Makes the page's JavaScript read as iOS WebKit, the engine half of the
 * touch idiom (`CSS.supports('(-webkit-touch-callout: none)')`). The phone
 * profile already gives the coarse pointer.
 */
function asIos(): void {
  const supports = CSS.supports.bind(CSS);
  Object.defineProperty(CSS, 'supports', {
    configurable: true,
    value: (conditionOrProperty: string, value?: string) =>
      value === undefined
        ? conditionOrProperty === '(-webkit-touch-callout: none)' ||
          supports(conditionOrProperty)
        : supports(conditionOrProperty, value),
  });
}

async function openRefresh(
  page: Page,
  story = 'lab-refreshcontrol--in-a-scroll-area',
  args: Record<string, string> = {},
  {idiom = 'ios'}: {idiom?: 'ios' | 'default'} = {},
): Promise<Opened> {
  await installLongTaskLog(page);
  if (idiom === 'ios') {
    await page.addInitScript(asIos);
  }
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
  expect(proof.medianFrameMs).toBeLessThan(20);
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

test('under Reduce Motion the pull, the trigger and the settle are unchanged, as UIKit’s', async ({
  page,
}) => {
  // UIRefreshControl adds the same animations with the same parameters with
  // Reduce Motion on, with or without Prefer Cross-Fade (iOS 26.2).
  await page.emulateMedia({reducedMotion: 'reduce'});
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
  await waitForSettle(content, {hold: true});
  const samples = await sampleTranslate(content, timeline(700));
  await releaseAnimations(page);
  const from = samples[0].value;
  const oracle = (t: number) =>
    from + (HEIGHT - from) * springStep({response: 0.5, dampingFraction: 1}, t);
  const result = compareCurve(samples, oracle, 1);
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(1);
});

test('off iOS (Chromium as an Android phone) the pull and the top edge stay the browser’s', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Android’s engine is Chromium');
  const {driver, content, start} = await openRefresh(
    page,
    'lab-refreshcontrol--on-the-page',
    {refreshMs: '6000'},
    {idiom: 'default'},
  );
  // Chrome keeps its own pull to refresh on the document.
  const rootOverscroll = () =>
    page.evaluate(
      () => getComputedStyle(document.documentElement).overscrollBehaviorY,
    );
  expect(await rootOverscroll()).toBe('auto');
  const readings = await playReading(
    page,
    driver,
    content,
    slowPull(start, 300, 200),
  );
  expect(Math.max(...readings.map(r => Math.abs(r.shown)))).toBe(0);
  await page.waitForTimeout(300);
  expect(await isBusy(content)).toBe(false);
  expect(await shownPull(content)).toBe(0);
  expect(await rootOverscroll()).toBe('auto');
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
    const {storyboard: settleBoard} = await animationStoryboard(page, {
      name: 'refresh-settle-onto-inset',
      clip,
      scope: content,
      times: timeline(700),
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
 * head), sampled at the middle of each spoke (10 pt from the center).
 */
async function spinHeads(
  page: Page,
  castFrames: readonly {t: number; data: string}[],
  glyph: {x: number; y: number; width: number; height: number},
): Promise<{t: number; head: number; contrast: number}[]> {
  const scratch = await page.context().newPage();
  try {
    const viewport = page.viewportSize() ?? {width: 402, height: 874};
    return await scratch.evaluate(
      async ({items, box, width}) => {
        const out: {t: number; head: number; contrast: number}[] = [];
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
    .locator(':scope > div > span')
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

test('the spin does no Layout or Paint per step', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver, content, start} = await openRefresh(page, undefined, {
    refreshMs: '8000',
  });
  await driver.play(slowPull(start, 300, 200));
  await expect.poll(() => isBusy(content)).toBe(true);
  await page.waitForTimeout(3600);
  const trace = await traceRendering(page, async () => {
    // A fixed wait: eight steps of the spin.
    await page.waitForTimeout(1000);
  });
  expect(trace.layout, JSON.stringify(trace.counts)).toBe(0);
  expect(trace.paint, JSON.stringify(trace.counts)).toBe(0);
});

test('at the trigger the gradient cross-fades in, the two sets summing to UIKit\u2019s alpha', async ({
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
  const glyph = content.locator(':scope > div > span').first();
  // Hold the glyph at the gradient spring's midpoint (g = 0.5 at 0.755 s of
  // its 4 s), the trigger turn finished and the spin mid-step 0.
  const held = await glyph.evaluate(element => {
    const kinds: string[] = [];
    for (const animation of element.getAnimations({subtree: true})) {
      animation.pause();
      const timing = animation.effect?.getTiming();
      if ((animation.effect as KeyframeEffect).target === element) {
        animation.finish();
        kinds.push('turn');
      } else if (timing?.iterations === Infinity) {
        animation.currentTime = 62;
        kinds.push('spin');
      } else {
        animation.currentTime = 755;
        kinds.push('spring');
      }
    }
    return {
      kinds,
      fill: getComputedStyle(element.querySelector('svg') as Element).fill,
    };
  });
  expect(held.kinds.filter(k => k === 'spring')).toHaveLength(2);
  expect(held.kinds.filter(k => k === 'spin')).toHaveLength(8);
  const shot = await glyph.screenshot();
  const fill = (held.fill.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
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
        const ink = (color[0] + color[1] + color[2]) / 3;
        // The page is white: level = 255 - alpha * (255 - ink).
        out.push((255 - level) / (255 - ink));
      }
      return out;
    },
    {png: shot.toString('base64'), color: fill},
  );
  // The revealed spokes at 1 - g plus the stepping spoke at g times its
  // instance's alpha (spoke p holds instance p at step 0): plus-lighter's
  // sum, where normal blending would take away (1 - g) g a.
  const g = 0.5;
  alphas.forEach((alpha, p) => {
    const instance = 0.08 * p;
    const sum = 1 - g + g * instance;
    expect(
      Math.abs(alpha - sum),
      `spoke ${p}: ${alpha.toFixed(3)}`,
    ).toBeLessThan(0.03);
  });
  // The brightest spoke shows the sum, not normal blending's 0.64.
  expect(alphas[7]).toBeGreaterThan(0.74);
});

test('reduced motion leaves the drawing as it is (UIKit\u2019s reduced-motion refresh is unmeasured)', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Chromium proof');
  const read = async () => {
    const {driver, content, start} = await openRefresh(page, undefined, {
      refreshMs: '8000',
    });
    await driver.play(slowPull(start, 300, 200));
    await expect.poll(() => isBusy(content)).toBe(true);
    const glyph = content.locator(':scope > div > span').first();
    return glyph.evaluate(element =>
      element
        .getAnimations({subtree: true})
        .filter(a => (a.effect as KeyframeEffect).target !== element)
        .map(a => ({
          layer:
            ((a.effect as KeyframeEffect).target as Element).parentElement ===
            element,
          duration: Math.round(Number(a.effect?.getTiming().duration)),
          iterations: Number(a.effect?.getTiming().iterations),
          state: a.playState,
        })),
    );
  };
  const normal = await read();
  await page.emulateMedia({reducedMotion: 'reduce'});
  const reduced = await read();
  // The gradient's two layers spring in on the same curve (nothing travels,
  // so the animator plays the opacity spring as is), and the eight spokes
  // step on their 8 s iterations.
  const layers = (list: typeof normal) =>
    list.filter(t => t.layer).map(t => t.duration);
  expect(layers(reduced)).toHaveLength(2);
  expect(layers(reduced)).toEqual(layers(normal));
  expect(
    reduced.filter(
      t => !t.layer && t.duration === 8000 && t.iterations === Infinity,
    ),
  ).toHaveLength(8);
  expect(reduced.every(t => t.state === 'running')).toBe(true);
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
    await page.waitForTimeout(4200);
    const glyph = content.locator(':scope > div > span').first();
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
