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
 *   closes it; a full swipe confirms on the finger (the row runs ahead, the
 *   outermost entry covers the space) and fires, also through a blocked
 *   main thread, and one that backs out closes with the entries pinned or
 *   riding at every frame; storyboards. Under Reduce Motion a release, a
 *   confirm and a back-out land with no travel at the bottom of an opacity
 *   dip (design:reduced-motion DR2). A control in the row (the internal
 *   swipe-reveal seam List's edit mode uses) opens the row on the same settle
 *   spring, and a tap on it while open is the row's dismissing tap.
 * @position Interaction proofs of Item's swipeActions (the shape of
 *   BottomSheetDetent.interaction.browser.spec.ts, the harness exemplar). The
 *   row moves by the individual `translate` property (the compositor
 *   animator), so curves are read from computed `translate`, not `transform`.
 *   The swipe reads each touch's pointer, the same on every device; the
 *   project's touchscreen gives Chromium and WebKit a phone's (a coarse
 *   primary pointer).
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
import {swipeActions} from '../../motion/uikit/swipeActions';

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

async function openRow(page: Page): Promise<OpenRow> {
  await installLongTaskLog(page);
  await openStory(page, storybook(), 'core-item--swipe-actions');
  const driver = await touchDriver(page);
  const row = page.locator('.astryx-item').first();
  const panel = row.locator('[data-swipe-panel="trailing"]');
  // The gesture arrives with the lazily loaded swipe layer.
  await expect(panel).toBeAttached();
  const track = panel.locator(':scope > div').first();
  // The entries are the track's children, each its own moving element.
  const entries = track;
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

/** How far the row opens: the entries' natural widths together. */
const openWidthOf = async (track: Locator) =>
  track.evaluate(node =>
    Array.from(node.children).reduce(
      (width, entry) => width + entry.getBoundingClientRect().width,
      0,
    ),
  );

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
/**
 * `design:reduced-motion` DR1 and DR2 for a change of the row under Reduce
 * Motion, read from the animations running on the row and its parts now: no
 * travel (a value that changes, changes in one step, never between frames),
 * and an opacity-only cross-fade that dips and is over within 200 ms. Then,
 * once it is over, the row is at `to`, fully opaque.
 */
async function expectCrossFade(
  page: Page,
  row: Locator,
  to: number,
): Promise<void> {
  const animations = await row.evaluate(node =>
    document
      .getAnimations()
      .filter(animation => {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        return target != null && node.contains(target);
      })
      .map(animation => {
        const effect = animation.effect as KeyframeEffect;
        return {
          duration: Number(effect.getComputedTiming().duration),
          frames: effect.getKeyframes().map(frame => ({
            offset: frame.computedOffset,
            travel:
              frame.translate != null
                ? String(frame.translate)
                : frame.transform != null
                  ? String(frame.transform)
                  : null,
            opacity: frame.opacity == null ? null : Number(frame.opacity),
          })),
        };
      }),
  );
  for (const {frames} of animations) {
    const moving = frames.filter(frame => frame.travel != null);
    for (let k = 1; k < moving.length; k += 1) {
      if (moving[k].travel !== moving[k - 1].travel) {
        expect(moving[k].offset, JSON.stringify(frames)).toBe(
          moving[k - 1].offset,
        );
      }
    }
  }
  const fades = animations.filter(({frames}) =>
    frames.some(frame => frame.opacity != null && frame.opacity < 0.05),
  );
  expect(fades.length, JSON.stringify(animations)).toBeGreaterThan(0);
  for (const {duration, frames} of fades) {
    // The animator holds the end state a while after the curve; the fade is
    // over at the first keyframe that reaches the final opacity after the
    // dip.
    const final = frames[frames.length - 1].opacity;
    const dip = frames.findIndex(f => f.opacity != null && f.opacity < 0.05);
    const back = frames.findIndex((f, k) => k > dip && f.opacity === final);
    expect(back, JSON.stringify(frames)).toBeGreaterThan(dip);
    expect(frames[back].offset * duration).toBeLessThanOrEqual(200);
  }
  await page.waitForTimeout(260);
  expect(await xOf(row)).toBeCloseTo(to, 0);
  expect(
    await row.evaluate(node => Number(getComputedStyle(node).opacity)),
  ).toBe(1);
}

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
  const openWidth = await openWidthOf(entries);
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
  const openWidth = await openWidthOf(entries);
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

test('under Reduce Motion a held release lands open with no travel: the row steps there at the bottom of an opacity dip', async ({
  page,
}) => {
  // design:reduced-motion: the finger's own drag is direct manipulation, but
  // what its release starts never travels or springs, and cross-fades (DR2).
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, row, entries, start} = await openRow(page);
  const openWidth = await openWidthOf(entries);
  await driver.play(heldDrag(start, -130));
  await expectCrossFade(page, row, -openWidth);
});

test('a close the main thread holds back plays from its start after the block, skipping no travel', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'WebKit starts an animation created just before a block at its last frame time (animator.ts); the iOS simulator rig covers Safari',
  );
  const {driver, row, entries, start} = await openRow(page);
  const openWidth = await openWidthOf(entries);
  await driver.play(heldDrag(start, -130));
  await waitForRest(row);
  // The task that closes the row then blocks for 800 ms, as a frame held back
  // does (iOS holds them during a smooth scroll).
  await page.evaluate(() => {
    window.addEventListener(
      'keydown',
      () => {
        const until = performance.now() + 800;
        while (performance.now() < until) {
          // Busy: the frame that would start the close is held back.
        }
      },
      {once: true},
    );
  });
  await entries.getByRole('button').first().focus();
  await page.keyboard.press('Escape');
  const firstFrame = await row.evaluate(
    async node =>
      new Promise<number>(resolve => {
        requestAnimationFrame(() => {
          const style = getComputedStyle(node);
          resolve(
            (parseFloat(style.translate) || 0) +
              new DOMMatrix(style.transform).e,
          );
        });
      }),
  );
  // The close starts on the frame that commits it, not at the keydown: its
  // first frame is where the row rested, not most of the way home.
  expect(firstFrame).toBeLessThan(-openWidth * 0.9);
  await waitForRest(row);
  expect(await xOf(row)).toBeCloseTo(0, 0);
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

/**
 * Arms a block of the page's main thread for `ms`, 30 ms after the next lift:
 * late enough for the release's motion to have started on the compositor,
 * early enough that its own motion fills the judged window, whatever the
 * runner's latency (a block started from the test lands wherever the runner
 * is). `blockWindow` resolves with the block's page-clock span once it ran.
 */
async function blockAfterLift(page: Page, ms: number) {
  await page.evaluate(duration => {
    addEventListener(
      'touchend',
      () => {
        setTimeout(() => {
          const from = performance.timeOrigin + performance.now();
          const end = performance.now() + duration;
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
  }, ms);
}

async function blockWindow(page: Page): Promise<{from: number; to: number}> {
  return (await (
    await page.waitForFunction(
      () =>
        (window as unknown as {__blockAfterLift?: {from: number; to: number}})
          .__blockAfterLift,
    )
  ).jsonValue()) as {from: number; to: number};
}

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
  await blockAfterLift(page, 700);
  const cast = await startScreencast(page);
  // 180 px of swipe, held, short of the commit point: the row settles back
  // to the open width over about 100 px, a long enough motion to watch.
  await driver.play(
    heldDrag({x: rest.x + 24, y: rest.y + rest.height / 2}, 205),
  );
  const block = await blockWindow(page);
  const motion = await motionOf(row);
  const settle = {from: motion.from, to: motion.from + motion.ms};
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, settle.to)},
    // Within 8 px of its end a critically damped settle moves less than a
    // pixel a frame, finer than the screencast resolves. The judged part of
    // the block is the settle's own motion, not a sliver: 16 frames at least.
    {axis: 'x', settledWithin: 8, minJudgedFrames: 16},
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
  // The harness's verdict (no stall over two dropped frames, nearly every
  // expected frame moved, the judged part long enough), in frames at the
  // screencast's own cadence rather than its delivery rate.
  expect(proof.verdict.failures, proof.summary).toEqual([]);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.monotonic).toBe(true);
});

/** A held drag on `open`'s row past half its panel: it rests open. Resolves with the open width. */
async function restOpen({driver, row, entries, start}: OpenRow) {
  const openWidth = await openWidthOf(entries);
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

test('a control in the row opens its trailing actions on the swipe’s own settle spring, and a tap on it while open closes the row with no click to open it again', async ({
  page,
  browserName,
}, testInfo) => {
  await openStory(page, storybook(), 'core-item--swipe-reveal-control');
  const driver = await touchDriver(page);
  const row = page.locator('.astryx-item').first();
  const panel = row.locator('[data-swipe-panel="trailing"]');
  const control = row.getByRole('button', {name: 'Delete control'});
  // The control renders once the lazily loaded swipe layer has mounted.
  await expect(control).toBeVisible();
  await expect(panel).toBeAttached();
  // The entries are the track's children.
  const openWidth = await openWidthOf(panel.locator(':scope > div').first());
  const centerOf = async () => {
    const box = await control.boundingBox();
    if (box == null) {
      throw new Error('no control');
    }
    return {x: box.x + box.width / 2, y: box.y + box.height / 2};
  };
  await installTimerGate(page);
  await engineTap(page, browserName, driver, await centerOf());
  const motion = await motionOf(row, -openWidth);
  await freezeTimers(page);
  const held = await holdAnimations(page, row);
  const samples: {t: number; value: number}[] = [];
  for (const t of timeline(motion.ms + 50)) {
    await seekAnimations(page, t);
    samples.push({t, value: (await partsOf(row)).root});
  }
  await releaseAnimations(page);
  await thawTimers(page);
  // From rest, toward the panel's width, on the settle spring: the curve a
  // held release past half the panel plays.
  const from = samples[0].value;
  const to = -openWidth;
  const result = compareCurve(
    samples,
    (t: number) => from + (to - from) * springStep(SPRING, t),
    0.5,
  );
  await writeEvidence(
    'curves/item-swipe-reveal',
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
  await expect.poll(async () => xOf(row)).toBeCloseTo(to, 0);
  await expect(panel).not.toHaveAttribute('inert');
  // Open, a touch on the control is the row's dismissing tap: the row closes
  // and the browser makes no click, so nothing opens it again.
  const clicks = await countClicks(control);
  await engineTap(page, browserName, driver, await centerOf());
  await expect.poll(async () => xOf(row)).toBeCloseTo(0, 0);
  await page.waitForTimeout(400);
  expect(await clicks()).toBe(0);
  expect(await xOf(row)).toBeCloseTo(0, 0);
  await expect(panel).toHaveAttribute('inert');
});

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

test('under Reduce Motion a tap on the resting row’s content closes it with no travel, at the bottom of an opacity dip', async ({
  page,
  browserName,
}) => {
  // design:reduced-motion: on a coarse primary pointer a close cross-fades
  // (DR2), opacity only.
  await page.emulateMedia({reducedMotion: 'reduce'});
  const open = await openRow(page);
  const {driver, row, rest} = open;
  await restOpen(open);
  await waitForRest(row);
  const content = {x: rest.x + 60, y: rest.y + rest.height / 2};
  await engineTap(page, browserName, driver, content);
  await expectCrossFade(page, row, 0);
});

test('a scroll that starts on the resting row closes it', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'WebKit’s Linux build cannot scroll from injected touches; Mobile Safari on the simulator covers it',
  );
  await openStory(page, storybook(), 'core-item--swipe-actions');
  const driver = await touchDriver(page);
  // A row low on the page, and room below the list to scroll into.
  await page.evaluate(() => {
    document.body.style.minHeight = '3000px';
  });
  const row = page.locator('.astryx-item').nth(4);
  await expect(row.locator('[data-swipe-panel="trailing"]')).toBeAttached();
  const entries = row.locator('[data-swipe-panel="trailing"] > div');
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

/**
 * Where each part of the trailing side is heading: the last keyframe of its
 * running animation, or its resting value. The root, the outermost entry
 * (its pin and slide toward the row), the other entries (their opacity) and
 * the track's confirm fill (its `::before`, their opacity's complement).
 */
const targetsOf = async (row: Locator) =>
  row.evaluate(node => {
    const track = node.querySelector(
      '[data-swipe-panel="trailing"]',
    )?.firstElementChild;
    const entries = Array.from(track?.children ?? []);
    const inner = entries[0];
    const outer = entries[entries.length - 1];
    const lastFrame = (
      animation: Animation | undefined,
      property: string,
    ): string | undefined => {
      const frames = (
        animation?.effect as KeyframeEffect | undefined
      )?.getKeyframes();
      const last = frames?.[frames.length - 1]?.[property];
      return last == null ? undefined : String(last);
    };
    const heading = (el: Element | undefined, property: string) => {
      if (el == null) {
        return NaN;
      }
      const value =
        el
          .getAnimations()
          .map(animation => lastFrame(animation, property))
          .find(frame => frame != null) ??
        getComputedStyle(el).getPropertyValue(property);
      return parseFloat(value) || 0;
    };
    const fill =
      lastFrame(
        document
          .getAnimations()
          .find(
            animation =>
              (animation.effect as KeyframeEffect | null)?.target === track &&
              (animation.effect as KeyframeEffect | null)?.pseudoElement ===
                '::before',
          ),
        'opacity',
      ) ??
      (track == null
        ? 'NaN'
        : getComputedStyle(track, '::before').getPropertyValue('opacity'));
    return {
      root: heading(node, 'translate'),
      outer: heading(outer, 'translate'),
      inner: heading(inner, 'opacity'),
      fill: parseFloat(fill) || 0,
    };
  });

/** The swipe at which the story's first row confirms a full swipe. */
function confirmPointOf(openWidth: number, rowWidth: number) {
  const confirmAt = rowWidth - swipeActions.confirmInset;
  return openWidth + (confirmAt - openWidth) * swipeActions.confirmFraction;
}

test('a full swipe confirms on the finger: the row runs ahead to the confirmation offset, the outermost entry covers the space, and the release fires it', async ({
  page,
}) => {
  const {driver, row, entries, rest, start} = await openRow(page);
  const rows = page.locator('.astryx-item');
  const before = await rows.count();
  const openWidth = await openWidthOf(entries);
  const outerWidth = await entries.evaluate(
    node =>
      (node.lastElementChild as HTMLElement).getBoundingClientRect().width,
  );
  const confirmAt = confirmPointOf(openWidth, rest.width);
  const confirmedOffset = rest.width - swipeActions.confirmInset;
  // A slow drag to 40 px of swipe past the confirm point (the swipe is the
  // finger's travel past the pan's 25 px), held, then lifted.
  const reach = confirmAt + 40 + swipeActions.hysteresis;
  const script = drag(
    start,
    {x: start.x - reach, y: start.y},
    {durationMs: 1400, hz: 60, restMs: 500},
  );
  const moves = toTouchEvents(script).filter(e => e.type === 'touchMove');
  const seen: {
    short?: Awaited<ReturnType<typeof targetsOf>>;
    past?: Awaited<ReturnType<typeof targetsOf>>;
  } = {};
  let index = 0;
  await driver.play(script, {
    onEvent: async step => {
      if (step.type !== 'touchMove') {
        return;
      }
      const swipe = start.x - step.fingers[0].x - swipeActions.hysteresis;
      index += 1;
      if (seen.short == null && swipe >= confirmAt - 12) {
        seen.short = await targetsOf(row);
      }
      if (index === moves.length) {
        seen.past = await targetsOf(row);
      }
    },
  });
  // Short of the confirm point the row heads for the finger, and the
  // entries look as they always do.
  const {short, past} = seen;
  expect(short).toBeDefined();
  expect(short?.root).toBeGreaterThan(-confirmAt);
  expect(short?.outer).toBeCloseTo(0, 1);
  expect(short?.inner).toBeCloseTo(1, 2);
  expect(short?.fill).toBeCloseTo(0, 2);
  // Past it the row heads ahead of the finger to the confirmation offset,
  // the outermost entry slides past the others to the row's edge, and the
  // others fade.
  expect(past?.root).toBeCloseTo(-confirmedOffset, 0);
  expect(past?.outer).toBeCloseTo(-(openWidth - outerWidth), 0);
  expect(past?.inner).toBeCloseTo(0, 2);
  // Under the fading others the track shows the outermost entry's colour.
  expect(past?.fill).toBeCloseTo(1, 2);
  // Lifted there: Delete fires and the story removes the row.
  await expect(rows).toHaveCount(before - 1);
});

test('a confirmed full swipe slides out on every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {driver, row, rest} = await openRow(page);
  // Toward the leading side (rightward), so the marker chip at the row's
  // top-left corner stays inside the list's clip for the slide-out.
  const openWidth = await openWidthOf(
    row.locator('[data-swipe-panel="leading"] > div').first(),
  );
  const confirmAt = confirmPointOf(openWidth, rest.width);
  await markElement(row);
  await blockAfterLift(page, 700);
  const cast = await startScreencast(page);
  // A fast drag 40 px past the confirm point, lifted at once: confirmed at
  // the lift (the finger's travel decides), while the row still trails far
  // behind on its tracking spring, so the slide-out covers most of the row.
  const from = {x: rest.x + 24, y: rest.y + rest.height / 2};
  await driver.play(
    drag(
      from,
      {x: from.x + confirmAt + 40 + swipeActions.hysteresis, y: from.y},
      {durationMs: 160, hz: 120},
    ),
  );
  const block = await blockWindow(page);
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  // The row fires once its content has left its box. Under the block that
  // waits for the block to end, and the leading entry's spring back then
  // replaces the slide-out, so the slide is judged on the screencast alone:
  // its frames up to the block's end, until it is within 8 px of where the
  // block left it.
  const tracked = (await trackMarker(page, castFrames)).filter(
    f => f.t <= block.to,
  );
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: block.to},
    // The slide-out is quick (it keeps the tracking spring's velocity) and its
    // last 25 px leave the list's clip, so the judged part is shorter than a
    // settle's: 10 frames at least.
    {axis: 'x', settledWithin: 8, minJudgedFrames: 10},
  );
  await writeEvidence(
    'busy-main-thread/item-swipe-full-swipe',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
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
    name: 'item-swipe-full-swipe-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: block.to + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({x: tracked.find(f => f.t === t)?.box?.x ?? -1}),
  });
  await film.write(testInfo, {block});
  // Over more than 100 px of the row's travel, with the harness's verdict
  // judged in frames at the screencast's own cadence.
  const inBlock = tracked
    .filter(f => f.t >= block.from && f.t <= block.to && f.box != null)
    .map(f => f.box?.x as number);
  expect(Math.max(...inBlock) - Math.min(...inBlock)).toBeGreaterThan(100);
  expect(proof.verdict.failures, proof.summary).toEqual([]);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.monotonic).toBe(true);
});

test('backing out of a confirmed full swipe closes the row and fires nothing; the entries stay pinned below the open width and ride the row above it, frame by frame', async ({
  page,
}) => {
  const {driver, row, entries, rest, start} = await openRow(page);
  const rows = page.locator('.astryx-item');
  const before = await rows.count();
  const openWidth = await openWidthOf(entries);
  const confirmAt = confirmPointOf(openWidth, rest.width);
  await installTimerGate(page);
  // Out past the confirm point, then back to 200 px of swipe (past the open
  // width, short of the confirm point), held still, then lifted.
  const h = swipeActions.hysteresis;
  const out = drag(
    start,
    {x: start.x - (confirmAt + 40 + h), y: start.y},
    {durationMs: 900, hz: 60},
  ).slice(0, -1);
  const last = out[out.length - 1];
  const back = drag(
    last.fingers[0],
    {x: start.x - (200 + h), y: start.y},
    {durationMs: 500, hz: 60, restMs: 600},
  ).map(frame => ({...frame, t: frame.t + last.t + 16}));
  await driver.play([...out, ...back.slice(1)]);
  // A swipe that confirmed and backed out closes, whatever its position.
  const motion = await motionOf(row, 0);
  await freezeTimers(page);
  await holdAnimations(page, row);
  const samples: {root: number; track: number; entries: number}[] = [];
  for (const t of timeline(motion.ms, 1000 / 60)) {
    await seekAnimations(page, t);
    samples.push(await partsOf(row));
  }
  await releaseAnimations(page);
  await thawTimers(page);
  // The settle crosses the open width: above it the entries ride the row,
  // below it they are pinned at the outer edge, at every frame.
  let crossed = 0;
  for (const part of samples) {
    const travel = -part.root;
    if (travel > openWidth + 0.5) {
      expect(part.entries).toBeCloseTo(0, 0);
    } else if (travel < openWidth - 0.5) {
      crossed += 1;
      expect(part.track + part.entries).toBeCloseTo(-openWidth, 0);
    }
  }
  expect(samples[0].root).toBeLessThan(-openWidth);
  expect(crossed).toBeGreaterThan(0);
  await expect.poll(async () => xOf(row)).toBeCloseTo(0, 0);
  await expect(rows).toHaveCount(before);
});

test(
  'storyboard: a full swipe confirms, the row runs ahead and the outermost entry covers the space',
  {tag: '@storyboard'},
  async ({page, browserName}, testInfo) => {
    test.skip(
      browserName !== 'chromium',
      'screencast frames are Chromium-only in Playwright',
    );
    const {driver, row, entries, rest, start} = await openRow(page);
    const openWidth = await openWidthOf(entries);
    const confirmAt = confirmPointOf(openWidth, rest.width);
    await markElement(row, {mode: 'outline'});
    const cast = await startScreencast(page);
    const began = Date.now();
    await driver.play(
      drag(
        start,
        {
          x: start.x - (confirmAt + 30 + swipeActions.hysteresis),
          y: start.y,
        },
        {durationMs: 1200, hz: 60, restMs: 400},
      ),
    );
    await page.waitForTimeout(600);
    const castFrames = await cast.stop();
    const tracked = await trackMarker(page, castFrames);
    const film = await castStoryboard(page, castFrames, {
      name: 'item-swipe-full-swipe',
      zero: began,
      from: began,
      to: Date.now(),
      columns: 8,
      cellScale: 0.35,
      // The row's trailing edge: its leading part leaves through the list's
      // clip, which pins the box's left edge.
      data: t => {
        const box = tracked.find(f => f.t === t)?.box;
        return {right: box == null ? -1 : box.x + box.width};
      },
    });
    await film.write(testInfo);
    // The trace: the row's edge runs out to the confirmation offset, ahead
    // of the finger, and on out of the list as Delete fires.
    const rights = tracked
      .filter(f => f.t >= began && f.box != null)
      .map(f => (f.box?.x as number) + (f.box?.width as number));
    expect(Math.min(...rights)).toBeLessThan(
      rest.x + rest.width - (rest.width - swipeActions.confirmInset) + 1,
    );
  },
);

test(
  'storyboard: a full swipe that backs out undoes the look and closes the row',
  {tag: '@storyboard'},
  async ({page, browserName}, testInfo) => {
    test.skip(
      browserName !== 'chromium',
      'screencast frames are Chromium-only in Playwright',
    );
    const {driver, row, entries, rest, start} = await openRow(page);
    const openWidth = await openWidthOf(entries);
    const confirmAt = confirmPointOf(openWidth, rest.width);
    const h = swipeActions.hysteresis;
    const out = drag(
      start,
      {x: start.x - (confirmAt + 40 + h), y: start.y},
      {durationMs: 900, hz: 60},
    ).slice(0, -1);
    const last = out[out.length - 1];
    const back = drag(
      last.fingers[0],
      {x: start.x - (200 + h), y: start.y},
      {durationMs: 600, hz: 60, restMs: 400},
    ).map(frame => ({...frame, t: frame.t + last.t + 16}));
    await markElement(row, {mode: 'outline'});
    const cast = await startScreencast(page);
    const began = Date.now();
    await driver.play([...out, ...back.slice(1)]);
    await page.waitForTimeout(1200);
    const castFrames = await cast.stop();
    const tracked = await trackMarker(page, castFrames);
    const film = await castStoryboard(page, castFrames, {
      name: 'item-swipe-full-swipe-back-out',
      zero: began,
      from: began,
      to: Date.now(),
      columns: 8,
      cellScale: 0.35,
      data: t => {
        const box = tracked.find(f => f.t === t)?.box;
        return {right: box == null ? -1 : box.x + box.width};
      },
    });
    await film.write(testInfo);
    // The trace: out to the confirmation offset, back with the finger, then
    // home on the release.
    const rights = tracked
      .filter(f => f.t >= began && f.box != null)
      .map(f => (f.box?.x as number) + (f.box?.width as number));
    expect(Math.min(...rights)).toBeLessThan(
      rest.x + rest.width - (rest.width - swipeActions.confirmInset) + 1,
    );
    expect(rights.at(-1)).toBeCloseTo(rest.x + rest.width, 0);
  },
);

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
