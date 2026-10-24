// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ItemSwipeActions.interaction.browser.spec.ts
 * @input The built "Swipe Actions" Item story, real touch input (Chromium
 *   CDP / WebKit's input command), the interaction harness and the UIKit
 *   constants table (motion/uikit/swipeActions.ts)
 * @output Interaction and animation proofs for a row's swipe actions: the row
 *   trails the finger on UIKit's tracking spring and catches up when it
 *   stops; the settle after a held release is UIKit's spring sampled frame by
 *   frame, with the panel's window, track and entries in step with the row
 *   at every sample; a flick hands its presentation velocity to the settle;
 *   a finger that lands on a settling row catches it without a jump; the
 *   settle keeps advancing through a blocked main thread; the drag and the
 *   settle do no Layout or Paint per frame; a tap on a resting row's own
 *   content closes it and clicks nothing, and a scroll that starts on it
 *   closes it; a storyboard of the drag and the settle. Outside iOS
 *   (Chromium as an Android phone) the row keeps its own swipe: it follows
 *   the finger one for one and settles on CSS's ease-out over 200 ms, at
 *   once under Reduce Motion, and a tap on its open content clicks it.
 * @position Interaction proofs of Item's swipeActions (the shape of
 *   BottomSheetDetent.interaction.browser.spec.ts, the harness exemplar). The
 *   row moves by the individual `translate` property (the compositor
 *   animator), so curves are read from computed `translate`, not `transform`.
 *   The swipe is UIKit's only on WebKit on iOS (useTouchIdiom): `openRow`
 *   emulates that engine (`-webkit-touch-callout`, C07's emulateIosWebKit)
 *   unless a test asks for the Android phone.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  busyWindowProof,
  castStoryboard,
  compareCurve,
  countBetween,
  drag,
  flick,
  freezeTimers,
  holdAnimations,
  installLongTaskLog,
  installTimerGate,
  markElement,
  openStory,
  readLongTasks,
  releaseAnimations,
  sampleRects,
  seekAnimations,
  springStep,
  startScreencast,
  tap,
  thawTimers,
  timeline,
  touchDriver,
  toTouchEvents,
  touchStoryboard,
  traceRendering,
  trackMarker,
  withStorybook,
  waitForAnimation,
  waitForRest,
  writeEvidence,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {cubicBezier} from '../../motion/bezier';
import {swipeActions} from '../../motion/uikit/swipeActions';
import {DEFAULT_SWIPE} from '../swipeRelease';

const storybook = withStorybook(test);

/**
 * The tracking and settle spring, as Core Animation renders it: overdamped on
 * paper (mass 2, stiffness 200, damping 100), critically damped in effect at
 * ω₀ = √(stiffness ÷ mass).
 */
const OMEGA = Math.sqrt(
  swipeActions.settle.stiffness / swipeActions.settle.mass,
);
const SPRING = {response: (2 * Math.PI) / OMEGA, dampingFraction: 1};

interface OpenRow {
  driver: TouchDriver;
  row: Locator;
  panel: Locator;
  track: Locator;
  entries: Locator;
  /** The row's resting box. */
  rest: {x: number; y: number; width: number; height: number};
  /** Where a finger lands to drag toward the trailing side (leftward). */
  start: {x: number; y: number};
}

/**
 * WebKit on iOS, from the first script on (C07's emulateIosWebKit):
 * `CSS.supports` answers yes for `-webkit-touch-callout`, so the idiom reads
 * `ios` when the page hydrates. The finger is the project's (a phone).
 */
async function emulateIosWebKit(page: Page) {
  await page.addInitScript(() => {
    const original = CSS.supports.bind(CSS);
    CSS.supports = (condition: string, value?: string) =>
      `${condition}${value ?? ''}`.includes('-webkit-touch-callout') ||
      (value === undefined ? original(condition) : original(condition, value));
  });
}

async function openRow(
  page: Page,
  {ios = true}: {ios?: boolean} = {},
): Promise<OpenRow> {
  await installLongTaskLog(page);
  if (ios) {
    await emulateIosWebKit(page);
  }
  await openStory(page, storybook(), 'core-item--swipe-actions');
  const driver = await touchDriver(page);
  const row = page.locator('.astryx-item').first();
  const panel = row.locator('[data-swipe-panel="trailing"]');
  // The gesture arrives with the lazily loaded swipe layer.
  await expect(panel).toBeAttached();
  const track = panel.locator(':scope > div').first();
  const entries = track.locator(':scope > div').first();
  const rest = await row.boundingBox();
  if (rest == null) {
    throw new Error('no row');
  }
  return {
    driver,
    row,
    panel,
    track,
    entries,
    rest,
    start: {x: rest.x + rest.width - 24, y: rest.y + rest.height / 2},
  };
}

/** The x of an element's `translate` (0 when it has none). */
const xOf = async (locator: Locator) =>
  locator.evaluate(node => parseFloat(getComputedStyle(node).translate) || 0);

/** The four moving parts' x at once (one evaluate: also while timers are frozen). */
const partsOf = async (row: Locator) =>
  row.evaluate(node => {
    const x = (el: Element | null) =>
      el == null ? NaN : parseFloat(getComputedStyle(el).translate) || 0;
    const panel = node.querySelector('[data-swipe-panel="trailing"]');
    const track = panel?.firstElementChild ?? null;
    return {
      root: x(node),
      panel: x(panel),
      track: x(track),
      entries: x(track?.firstElementChild ?? null),
    };
  });

/**
 * The settle the row is running: when it started (page clock, epoch ms) and
 * how long it moves. The animator holds a finished curve's end state a while
 * longer (so a blocked main thread cannot drop it), so the motion ends at the
 * first keyframe that reaches the final value, not at the animation's end.
 */
async function motionOf(
  row: Locator,
  target?: number,
): Promise<{from: number; ms: number}> {
  // The settle toward `target`, not a tracking spring still running when the
  // lift has been sent but not yet handled (WebKit dispatches in real time).
  if (target != null) {
    await expect
      .poll(async () =>
        row.evaluate(node => {
          const animation = node.getAnimations()[0];
          const frames = (
            animation?.effect as KeyframeEffect | undefined
          )?.getKeyframes();
          return frames == null
            ? null
            : parseFloat(String(frames[frames.length - 1].translate));
        }),
      )
      .toBeCloseTo(target, 0);
  }
  await waitForAnimation(row);
  return row.evaluate(node => {
    const animation = node.getAnimations()[0];
    const effect = animation.effect as KeyframeEffect;
    const duration = Number(effect.getComputedTiming().duration);
    const frames = effect.getKeyframes();
    const last = String(frames[frames.length - 1].translate);
    const end = frames.find(frame => String(frame.translate) === last);
    return {
      from: performance.timeOrigin + Number(animation.startTime),
      ms: (end?.computedOffset ?? 1) * duration,
    };
  });
}

/**
 * A slow drag by `dx` (negative: toward the trailing side) that comes to rest
 * before the lift:
 * the finger creeps a tenth of a pixel a frame for its last 20 frames, so
 * UIKit's velocity filter (which never decays on its own) reads nearly zero,
 * and the row has caught up with the finger when it lifts.
 */
function heldDrag(from: {x: number; y: number}, dx: number) {
  const moving = drag(
    from,
    {x: from.x + dx, y: from.y},
    {durationMs: 400, hz: 60},
  );
  const lift = moving[moving.length - 1];
  const last = moving[moving.length - 2];
  const frames = moving.slice(0, -1);
  for (let i = 1; i <= 20; i += 1) {
    frames.push({
      t: last.t + i * (1000 / 60),
      fingers: [{id: 0, x: from.x + dx + (Math.sign(dx) * i) / 10, y: from.y}],
    });
  }
  // Hold still a while longer, so the tracking spring has settled too.
  frames.push({t: frames[frames.length - 1].t + 900, fingers: lift.fingers});
  return frames;
}

test('the row trails the finger on the tracking spring and catches up when it stops', async ({
  page,
}) => {
  const {driver, row, start} = await openRow(page);
  const dx = 140;
  const script = drag(
    start,
    {x: start.x - dx, y: start.y},
    {durationMs: 400, hz: 60, restMs: 1100},
  );
  const moves = toTouchEvents(script).filter(e => e.type === 'touchMove');
  const lastMove = moves.length - 1;
  const samples: {finger: number; row: number}[] = [];
  let caughtUp = NaN;
  let index = 0;
  const started = Date.now();
  await driver.play(script, {
    onEvent: async step => {
      if (step.type !== 'touchMove') {
        return;
      }
      const finger = start.x - (step.fingers[0]?.x ?? start.x);
      samples.push({finger, row: -(await xOf(row))});
      if (index++ === lastMove) {
        // The finger has stopped: give the spring most of the rest (within
        // 0.05 px of the finger after a second).
        await page.waitForTimeout(1000);
        caughtUp = -(await xOf(row));
      }
    },
  });
  // The swipe is the finger's travel past UIKit's 25 px threshold. While
  // the finger moves the row trails it, never ahead and never backwards...
  const swipe = (finger: number) =>
    Math.max(0, finger - swipeActions.hysteresis);
  expect(samples.every(s => s.row <= swipe(s.finger) + 0.5)).toBe(true);
  expect(
    samples.every((s, i) => i === 0 || s.row >= samples[i - 1].row - 0.5),
  ).toBe(true);
  // ...visibly: a 1:1 drag would never be this far behind.
  expect(samples.some(s => swipe(s.finger) - s.row > 10)).toBe(true);
  // When the finger stops, the row catches up with it.
  expect(caughtUp).toBeCloseTo(swipe(dx), 0);
  await waitForRest(row);
  expect(await readLongTasks(page, {from: started, to: Date.now()})).toEqual(
    [],
  );
});

test('the settle after a held release is UIKit’s spring, frame by frame, with the panel in step', async ({
  page,
}, testInfo) => {
  const {driver, row, entries, start} = await openRow(page);
  const openWidth = await entries.evaluate(
    node => node.getBoundingClientRect().width,
  );
  await installTimerGate(page);
  // 105 px of swipe, held: past half the panel, so the row settles open.
  await driver.play(heldDrag(start, -130));
  const motion = await motionOf(row, -openWidth);
  // Sampling takes real time: hold the page's timers too, or the animator
  // retires the held animation at the curve's end mid-sampling.
  await freezeTimers(page);
  const held = await holdAnimations(page, row);
  const samples: {
    t: number;
    root: number;
    panel: number;
    track: number;
    entries: number;
  }[] = [];
  for (const t of timeline(motion.ms + 50)) {
    await seekAnimations(page, t);
    samples.push({t, ...(await partsOf(row))});
  }
  await releaseAnimations(page);
  await thawTimers(page);
  const from = samples[0].root;
  const to = -openWidth;
  // Released at rest: the settle starts from the row's place at zero
  // velocity (the tracking spring had settled), toward the open width.
  const expected = (t: number) => from + (to - from) * springStep(SPRING, t);
  const result = compareCurve(
    samples.map(s => ({t: s.t, value: s.root})),
    expected,
    0.5,
  );
  await writeEvidence(
    'curves/item-swipe-settle',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {spring: SPRING, openWidth, held, comparison: result, samples},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.5,
  );
  expect(samples.at(-1)?.root).toBeCloseTo(to, 0);
  // Every part on one clock: the window cancels the row, the track moves
  // with it, the entries stay pinned (sampling error of the baked keyframes
  // only).
  const pinned = samples[0].track + samples[0].entries;
  for (const s of samples) {
    expect(Math.abs(s.root + s.panel)).toBeLessThanOrEqual(0.2);
    expect(Math.abs(s.track - s.root)).toBeLessThanOrEqual(0.2);
    expect(Math.abs(s.track + s.entries - pinned)).toBeLessThanOrEqual(0.2);
  }
});

test('a flick hands the row’s velocity to the settle', async ({
  page,
}, testInfo) => {
  const {driver, row, entries, start} = await openRow(page);
  const openWidth = await entries.evaluate(
    node => node.getBoundingClientRect().width,
  );
  // A quick throw toward the trailing side: about 55 px of swipe, short of
  // half the panel, still moving at 1000 px/s when it lifts. The release
  // projects past half the panel, so the row opens; the settle starts with
  // the row's own velocity, which the tracking spring had built up.
  await installTimerGate(page);
  await driver.play(
    flick(start, {velocity: {x: -1000, y: 0}, durationMs: 80, hz: 120}),
  );
  const motion = await motionOf(row, -openWidth);
  await freezeTimers(page);
  await holdAnimations(page, row);
  const samples: {t: number; value: number}[] = [];
  for (const t of timeline(motion.ms + 50, 1000 / 120)) {
    await seekAnimations(page, t);
    samples.push({t, value: await xOf(row)});
  }
  await releaseAnimations(page);
  await thawTimers(page);
  const target = -openWidth;
  // The critically damped family: x(t) = target + (A + B·t)·e^(−ωt), with
  // A the distance left at t = 0 and B = v0 + ω·A. Fit A and B by least
  // squares (both: an engine's seek granularity shifts the first sample).
  let saa = 0;
  let sab = 0;
  let sbb = 0;
  let sya = 0;
  let syb = 0;
  for (const {t, value} of samples) {
    const s = t / 1000;
    const a = Math.exp(-OMEGA * s);
    const b = s * a;
    const y = value - target;
    saa += a * a;
    sab += a * b;
    sbb += b * b;
    sya += y * a;
    syb += y * b;
  }
  const det = saa * sbb - sab * sab;
  const d0 = (sya * sbb - syb * sab) / det;
  const slope = (syb * saa - sya * sab) / det;
  const v0 = slope - OMEGA * d0;
  const fitted = (t: number) => {
    const s = t / 1000;
    return target + (d0 + slope * s) * Math.exp(-OMEGA * s);
  };
  const result = compareCurve(samples, fitted, 0.75);
  await writeEvidence(
    'curves/item-swipe-flick-settle',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {omega: OMEGA, v0, d0, target, comparison: result, samples},
        null,
        1,
      ),
    },
    testInfo,
  );
  // The whole settle is that spring...
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.75,
  );
  // ...starting with the row already moving toward open (leftward), as
  // UIKit hands the presentation velocity to the settle; a settle from rest
  // would start at 0.
  expect(v0).toBeLessThan(-100);
  expect(samples.at(-1)?.value).toBeCloseTo(target, 0);
});

test('under Reduce Motion the row still follows the finger and settles on the same spring', async ({
  page,
}) => {
  // UIKit keeps this motion under Reduce Motion (same springs, measured), so
  // the row does too: no cross-fade, no jump.
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, row, entries, start} = await openRow(page);
  const openWidth = await entries.evaluate(
    node => node.getBoundingClientRect().width,
  );
  await installTimerGate(page);
  await driver.play(heldDrag(start, -130));
  const motion = await motionOf(row, -openWidth);
  await freezeTimers(page);
  await holdAnimations(page, row);
  const samples: {t: number; value: number; opacity: number}[] = [];
  for (const t of timeline(motion.ms + 50)) {
    await seekAnimations(page, t);
    samples.push({
      t,
      value: await xOf(row),
      opacity: await row.evaluate(node =>
        Number(getComputedStyle(node).opacity),
      ),
    });
  }
  await releaseAnimations(page);
  await thawTimers(page);
  const from = samples[0].value;
  const to = -openWidth;
  const result = compareCurve(
    samples,
    t => from + (to - from) * springStep(SPRING, t),
    0.5,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.5,
  );
  expect(samples.every(sample => sample.opacity === 1)).toBe(true);
});

test('a finger that lands on a settling row catches it where it is', async ({
  page,
}) => {
  const {driver, row, start} = await openRow(page);
  await driver.play(
    flick(start, {velocity: {x: -1000, y: 0}, durationMs: 80, hz: 120}),
  );
  await waitForAnimation(row, {minProgressMs: 40});
  // Watch every frame while a second touch lands on the moving row and
  // drags it back toward closed.
  const from = {x: start.x - 80, y: start.y};
  const [rects] = await Promise.all([
    sampleRects(row, 700),
    driver.play(
      drag(from, {x: from.x + 120, y: from.y}, {durationMs: 300, hz: 60}),
    ),
  ]);
  const xs = rects.map(r => r.box?.x ?? NaN);
  const steps = xs.slice(1).map((x, i) => Math.abs(x - xs[i]));
  // The row is caught from where it was presented: no frame jumps, and none
  // moves faster than the settle itself did (about 1000 px/s, 17 px a frame
  // at 60 Hz, with a frame of slack).
  expect(Math.max(...steps)).toBeLessThan(35);
  await waitForRest(row);
});

test('the settle keeps advancing every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {driver, row, rest} = await openRow(page);
  // Toward the leading side (rightward): the marker chip sits at the row's
  // top-left corner, which a leftward slide would carry out of the list's
  // clip.
  await markElement(row);
  // The page blocks its main thread for 700 ms, 30 ms after the lift: late
  // enough for the settle to have started on the compositor, early enough
  // that its own motion fills the judged window, whatever the runner's
  // latency (a block started from the test lands wherever the runner is).
  await page.evaluate(ms => {
    addEventListener(
      'touchend',
      () => {
        setTimeout(() => {
          const from = performance.timeOrigin + performance.now();
          const end = performance.now() + ms;
          while (performance.now() < end) {
            // spin
          }
          Object.assign(window, {
            __blockAfterLift: {
              from,
              to: performance.timeOrigin + performance.now(),
            },
          });
        }, 30);
      },
      {once: true, capture: true},
    );
  }, 700);
  const cast = await startScreencast(page);
  // 180 px of swipe, held, short of the commit point: the row settles back
  // to the open width over about 100 px, a long enough motion to watch.
  await driver.play(
    heldDrag({x: rest.x + 24, y: rest.y + rest.height / 2}, 205),
  );
  const block = (await (
    await page.waitForFunction(
      () =>
        (window as unknown as {__blockAfterLift?: {from: number; to: number}})
          .__blockAfterLift,
    )
  ).jsonValue()) as {from: number; to: number};
  const motion = await motionOf(row);
  const settle = {from: motion.from, to: motion.from + motion.ms};
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, settle.to)},
    // Within 8 px of its end a critically damped settle moves less than a
    // pixel a frame, finer than the screencast resolves.
    {axis: 'x', settledWithin: 8},
  );
  await writeEvidence(
    'busy-main-thread/item-swipe-settle',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          settle,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - block.from).toFixed(1),
            x: f.box?.x ?? null,
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'item-swipe-settle-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: Math.min(block.to, settle.to) + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({x: tracked.find(f => f.t === t)?.box?.x ?? -1}),
  });
  await film.write(testInfo, {block, settle});
  // The judged part of the block is the settle's own motion, not a sliver.
  expect(proof.expectedFrames).toBeGreaterThan(15);
  expect(proof.medianFrameMs).toBeLessThan(20);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.longestStallMs).toBeLessThan(40);
  expect(proof.monotonic).toBe(true);
});

/** A held drag on `open`'s row past half its panel: it rests open. Resolves with the open width. */
async function restOpen({driver, row, entries, start}: OpenRow) {
  const openWidth = await entries.evaluate(
    node => (node as HTMLElement).offsetWidth,
  );
  await driver.play(heldDrag(start, -130));
  await expect.poll(async () => xOf(row)).toBeCloseTo(-openWidth, 0);
  return openWidth;
}

/**
 * A tap through the engine's own tap path where clicks are concerned: WebKit's
 * Linux build synthesises a click only from its tap gesture, not from injected
 * touch events (the gesture system's browser tests note the same).
 */
async function engineTap(
  page: Page,
  browserName: string,
  driver: TouchDriver,
  at: {x: number; y: number},
) {
  if (browserName === 'webkit') {
    await page.touchscreen.tap(Math.round(at.x), Math.round(at.y));
  } else {
    await driver.play(tap(at));
  }
}

/**
 * Records every press paint (`data-astryx-press`) written on `row` or inside
 * it from now on; returns how many there have been.
 */
async function recordPresses(row: Locator) {
  await row.evaluate(node => {
    const log: string[] = [];
    Object.assign(window, {__rowPresses: log});
    new MutationObserver(records => {
      for (const record of records) {
        const value = (record.target as Element).getAttribute(
          'data-astryx-press',
        );
        if (value != null) {
          log.push(value);
        }
      }
    }).observe(node, {
      attributes: true,
      attributeFilter: ['data-astryx-press'],
      subtree: true,
    });
  });
  return async () =>
    row
      .page()
      .evaluate(
        () =>
          (window as unknown as {__rowPresses: string[]}).__rowPresses.length,
      );
}

/** Counts the clicks that reach `row` (capture, before the row's own handlers). */
async function countClicks(row: Locator) {
  await row.evaluate(node => {
    const counter = {clicks: 0};
    Object.assign(window, {__rowClicks: counter});
    node.addEventListener(
      'click',
      () => {
        counter.clicks += 1;
      },
      true,
    );
  });
  return async () =>
    row
      .page()
      .evaluate(
        () =>
          (window as unknown as {__rowClicks: {clicks: number}}).__rowClicks
            .clicks,
      );
}

test('a tap on the resting row’s own content closes it, with no press paint, and no click reaches the row', async ({
  page,
  browserName,
}) => {
  const open = await openRow(page);
  const {driver, row, rest} = open;
  await restOpen(open);
  const clicks = await countClicks(row);
  const presses = await recordPresses(row);
  // On the row's own content, clear of the open panel at its trailing end.
  const content = {x: rest.x + 60, y: rest.y + rest.height / 2};
  await engineTap(page, browserName, driver, content);
  await expect.poll(async () => xOf(row)).toBeCloseTo(0, 0);
  await page.waitForTimeout(400);
  expect(await clicks()).toBe(0);
  // UIKit's cell never sees that touch: nothing highlighted the row.
  expect(await presses()).toBe(0);
  // The same tap on the closed row is the row's own, and paints its press.
  await engineTap(page, browserName, driver, content);
  await expect.poll(clicks).toBe(1);
  await expect.poll(presses).toBeGreaterThan(0);
});

test('outside iOS (Chromium as an Android phone) a tap on an open row’s content clicks the row and leaves it open', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'the Android phone is Chromium');
  const open = await openRow(page, {ios: false});
  const {driver, row, rest} = open;
  const openWidth = await restOpen(open);
  const clicks = await countClicks(row);
  const content = {x: rest.x + 60, y: rest.y + rest.height / 2};
  await engineTap(page, browserName, driver, content);
  await expect.poll(clicks).toBe(1);
  await page.waitForTimeout(400);
  expect(await xOf(row)).toBeCloseTo(-openWidth, 0);
});

test('a scroll that starts on the resting row closes it', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'WebKit’s Linux build cannot scroll from injected touches; Mobile Safari on the simulator covers it',
  );
  await emulateIosWebKit(page);
  await openStory(page, storybook(), 'core-item--swipe-actions');
  const driver = await touchDriver(page);
  // A row low on the page, and room below the list to scroll into.
  await page.evaluate(() => {
    document.body.style.minHeight = '3000px';
  });
  const row = page.locator('.astryx-item').nth(4);
  await expect(row.locator('[data-swipe-panel="trailing"]')).toBeAttached();
  const entries = row.locator('[data-swipe-panel="trailing"] > div > div');
  const rest = await row.boundingBox();
  if (rest == null) {
    throw new Error('no row');
  }
  await restOpen({
    driver,
    row,
    entries,
    panel: row.locator('[data-swipe-panel="trailing"]'),
    track: row.locator('[data-swipe-panel="trailing"] > div'),
    rest,
    start: {x: rest.x + rest.width - 24, y: rest.y + rest.height / 2},
  });
  // Up from the row's own content: the page scrolls, and the row closes.
  const from = {x: rest.x + 60, y: rest.y + rest.height / 2};
  await driver.play(
    drag(from, {x: from.x, y: from.y - 200}, {durationMs: 300, hz: 60}),
  );
  await expect
    .poll(async () => page.evaluate(() => scrollY))
    .toBeGreaterThan(50);
  await expect.poll(async () => xOf(row)).toBeCloseTo(0, 0);
});

test('the drag and the settle do no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver, row, start} = await openRow(page);
  let motion = {from: 0, ms: 0};
  let dragWindow = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    const begun = Date.now();
    await driver.play(heldDrag(start, -130));
    dragWindow = {from: begun + 250, to: begun + 450};
    motion = await motionOf(row);
    await waitForRest(row);
  });
  // The steady part of the drag (after the claim) and of the settle: their
  // first and last frames may commit, and the row lands (one render) when
  // the settle ends.
  const during = countBetween(
    trace,
    motion.from + 50,
    motion.from + motion.ms - 50,
  );
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
  const dragging = countBetween(trace, dragWindow.from, dragWindow.to);
  expect(dragging.Layout ?? 0, JSON.stringify(dragging)).toBe(0);
  expect(trace.longTasks).toEqual([]);
});

test(
  'storyboard: drag the row open and let it settle',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, row, start, rest} = await openRow(page);
    await installTimerGate(page);
    const clip = {
      x: 0,
      y: Math.max(0, rest.y - 8),
      width: page.viewportSize()?.width ?? 402,
      height: rest.height + 16,
    };
    const measure = async () => ({x: await xOf(row)});
    const dragBoard = await touchStoryboard(
      page,
      driver,
      drag(
        start,
        {x: start.x - 130, y: start.y},
        {durationMs: 200, hz: 30, restMs: 150},
      ),
      {
        name: 'item-swipe-drag',
        clip,
        measure,
        columns: 4,
        cellScale: 0.6,
      },
    );
    await waitForAnimation(row);
    await freezeTimers(page);
    const {storyboard: settleBoard} = await animationStoryboard(page, {
      name: 'item-swipe-settle',
      clip,
      scope: row,
      measure,
      columns: 6,
      cellScale: 0.6,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await dragBoard.write(testInfo);
    await settleBoard.write(testInfo);
    // The trace is the assertion; the sheets are the evidence.
    const dragXs = dragBoard.frames.map(f => f.data.x as number);
    expect(dragXs.every((x, i) => i === 0 || x <= dragXs[i - 1] + 0.5)).toBe(
      true,
    );
    const settleXs = settleBoard.frames.map(f => f.data.x as number);
    expect(settleXs.at(-1)).toBeLessThan(-60);
  },
);

test(
  'storyboard: a short drag springs back',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, row, rest} = await openRow(page);
    await installTimerGate(page);
    const clip = {
      x: 0,
      y: Math.max(0, rest.y - 8),
      width: page.viewportSize()?.width ?? 402,
      height: rest.height + 16,
    };
    // 30 px of swipe toward the leading side, come to rest: short of half
    // the panel, so the row springs back.
    await driver.play(
      heldDrag({x: rest.x + 24, y: rest.y + rest.height / 2}, 55),
    );
    await waitForAnimation(row);
    await freezeTimers(page);
    const {storyboard} = await animationStoryboard(page, {
      name: 'item-swipe-spring-back',
      clip,
      scope: row,
      measure: async () => ({x: await xOf(row)}),
      times: timeline((await motionOf(row, 0)).ms + 50, 1000 / 30),
      columns: 6,
      cellScale: 0.6,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await storyboard.write(testInfo);
    const xs = storyboard.frames.map(f => f.data.x as number);
    expect(xs.every((x, i) => i === 0 || x <= xs[i - 1] + 0.5)).toBe(true);
    expect(xs.at(-1)).toBeCloseTo(0, 0);
  },
);

test(
  'storyboard: a tap on the open row’s content closes it',
  {tag: '@storyboard'},
  async ({page, browserName}, testInfo) => {
    const open = await openRow(page);
    const {driver, row, rest} = open;
    await restOpen(open);
    await installTimerGate(page);
    const clip = {
      x: 0,
      y: Math.max(0, rest.y - 8),
      width: page.viewportSize()?.width ?? 402,
      height: rest.height + 16,
    };
    await engineTap(page, browserName, driver, {
      x: rest.x + 60,
      y: rest.y + rest.height / 2,
    });
    await waitForAnimation(row);
    await freezeTimers(page);
    const {storyboard} = await animationStoryboard(page, {
      name: 'item-swipe-tap-closes',
      clip,
      scope: row,
      measure: async () => ({x: await xOf(row)}),
      times: timeline((await motionOf(row, 0)).ms + 50, 1000 / 30),
      columns: 6,
      cellScale: 0.6,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await storyboard.write(testInfo);
    const xs = storyboard.frames.map(f => f.data.x as number);
    // From open to closed without a step back: the settle spring, from rest.
    expect(xs[0]).toBeLessThan(-100);
    expect(xs.every((x, i) => i === 0 || x >= xs[i - 1] - 0.5)).toBe(true);
    expect(xs.at(-1)).toBeCloseTo(0, 0);
  },
);

test(
  'storyboard: a flick opens the row and a finger catches it mid-settle',
  {tag: '@storyboard'},
  async ({page, browserName}, testInfo) => {
    test.skip(
      browserName !== 'chromium',
      'screencast frames are Chromium-only in Playwright',
    );
    const {driver, row, start} = await openRow(page);
    await markElement(row, {mode: 'outline'});
    const cast = await startScreencast(page);
    const began = Date.now();
    await driver.play(
      flick(start, {velocity: {x: -1000, y: 0}, durationMs: 80, hz: 120}),
    );
    await waitForAnimation(row, {minProgressMs: 60});
    const from = {x: start.x - 80, y: start.y};
    await driver.play(
      drag(from, {x: from.x + 120, y: from.y}, {durationMs: 300, hz: 60}),
    );
    await waitForRest(row);
    const castFrames = await cast.stop();
    const tracked = await trackMarker(page, castFrames);
    const film = await castStoryboard(page, castFrames, {
      name: 'item-swipe-flick-and-catch',
      zero: began,
      from: began,
      to: Date.now(),
      columns: 8,
      cellScale: 0.35,
      data: t => ({x: tracked.find(f => f.t === t)?.box?.x ?? -1}),
    });
    await film.write(testInfo);
    // The trace is the assertion: no frame jumps across the catch.
    const xs = tracked
      .filter(f => f.t >= began && f.box != null)
      .map(f => f.box?.x as number);
    const steps = xs.slice(1).map((x, i) => Math.abs(x - xs[i]));
    expect(xs.length).toBeGreaterThan(10);
    expect(Math.max(...steps)).toBeLessThan(35);
  },
);

test('outside iOS (Chromium as an Android phone) the row follows the finger one for one', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'the Android phone is Chromium');
  const {driver, row, start} = await openRow(page, {ios: false});
  expect(
    await page.evaluate(() => CSS.supports('(-webkit-touch-callout: none)')),
  ).toBe(false);
  // At every touchmove, after the gesture has handled it: the finger's x and
  // the row's.
  await row.evaluate(node => {
    const log: {x: number; row: number}[] = [];
    Object.assign(window, {__moves: log});
    addEventListener(
      'touchmove',
      event => {
        log.push({
          x: event.touches[0].clientX,
          row: parseFloat(getComputedStyle(node).translate) || 0,
        });
      },
      {passive: true},
    );
  });
  await driver.play(heldDrag(start, -100));
  const moves = await page.evaluate(
    () => (window as unknown as {__moves: {x: number; row: number}[]}).__moves,
  );
  // Past the claim, the row is at the finger's travel since it landed.
  const claimed = moves.filter(m => start.x - m.x >= 10);
  expect(claimed.length).toBeGreaterThan(10);
  for (const m of claimed) {
    expect(Math.abs(m.row - (m.x - start.x))).toBeLessThanOrEqual(0.5);
  }
});

test("outside iOS (Chromium as an Android phone) a held release settles on CSS's ease-out over 200 ms, and at once under Reduce Motion", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'the Android phone is Chromium');
  const {driver, row, start} = await openRow(page, {ios: false});
  await installTimerGate(page);
  // 60 px, held: short of half the panel, so the row settles closed.
  await driver.play(heldDrag(start, -60));
  const motion = await motionOf(row, 0);
  expect(motion.ms).toBeGreaterThan(DEFAULT_SWIPE.settleMs - 20);
  expect(motion.ms).toBeLessThan(DEFAULT_SWIPE.settleMs + 20);
  await freezeTimers(page);
  await holdAnimations(page, row);
  const samples: {t: number; value: number}[] = [];
  for (const t of timeline(motion.ms + 30)) {
    await seekAnimations(page, t);
    samples.push({t, value: (await partsOf(row)).root});
  }
  await releaseAnimations(page);
  await thawTimers(page);
  const from = samples[0].value;
  const ease = cubicBezier(DEFAULT_SWIPE.settleCurve);
  const result = compareCurve(
    samples,
    t => from * (1 - ease(Math.min(1, t / DEFAULT_SWIPE.settleMs))),
    0.5,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.5,
  );
  await waitForRest(row);

  // Reduce Motion: as before, the release lands at once.
  await page.emulateMedia({reducedMotion: 'reduce'});
  await driver.play(heldDrag(start, -60));
  await expect.poll(async () => xOf(row)).toBe(0);
  expect(
    await row.evaluate(
      node =>
        node
          .getAnimations()
          .filter(a =>
            (a.effect as KeyframeEffect)
              .getKeyframes()
              .some(frame => 'translate' in frame),
          ).length,
    ),
  ).toBe(0);
});
