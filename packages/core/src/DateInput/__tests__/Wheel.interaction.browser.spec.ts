// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Wheel.interaction.browser.spec.ts
 * @input The built "Internal/Wheel" story (the Wheel alone, so the proofs
 *   hold whatever rules the sheets add to their columns), real touch input
 *   (Chromium CDP / WebKit's input command), the interaction harness, and the
 *   Wheel's own physics as the oracle of UIKit's measured picker
 * @output Interaction and animation proofs for the touch picker wheel, which
 *   a finger gets on every engine: a flick coasts
 *   on UIKit's curve onto the row UIKit's projection picks and commits it on
 *   arrival; the coast keeps advancing every frame through a blocked main
 *   thread; it does no Layout or Paint per frame; a finger landing on the
 *   coasting wheel stops it where it is and the wheel then eases onto the
 *   nearest row; a storyboard of a flick and its coast; under reduced motion
 *   (design:reduced-motion DR2), a flick that still coasts as momentum with
 *   its rows flat, and a tap that cross-fades onto its row (nothing
 *   travels, in 200 ms or less) and lands it on the compositor through a
 *   blocked main thread. Under a mouse, a drag scrolls today's column onto
 *   a row.
 * @position Browser proof for DateInput/PickerWheel.tsx and the Wheel switch,
 *   run by
 *   `pnpm test:interaction`; jsdom runs no animations, and wheelPhysics.test.ts
 *   holds the oracle itself to the UIKit recordings
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  CONTROL_RGB,
  compareCurve,
  countBetween,
  curveOf,
  flick,
  freezeTimers,
  holdAnimations,
  installTimerGate,
  markElement,
  openStory,
  releaseAnimations,
  releaseVelocity,
  sampleCurve,
  startBusyControl,
  startCompositorTrace,
  startScreencast,
  tap,
  thawTimers,
  timeline,
  touchDriver,
  touchStoryboard,
  toTouchEvents,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {UIKIT_GESTURES} from '../../motion/uikit';
import {WHEEL_ROW_PITCH} from '../wheelLook';
import {planRelease, type WheelLayout} from '../wheelPhysics';

const storybook = withStorybook(test);

const ROW = WHEEL_ROW_PITCH;
const MINUTES: WheelLayout = {rowHeight: ROW, rowCount: 60};
const HYSTERESIS = UIKIT_GESTURES.pan.hysteresis.value;
/** A flick up the minute wheel: the rows run on towards higher minutes. */
const FLICK_VELOCITY = 900;
/** The busy-main-thread proof's block: spec:AST-094 FR5's verification. */
const BLOCK_MS = 1000;
/**
 * The rows the busy proof's strip markers sit on, three rows apart in three
 * colours: two markers of one colour are nine rows apart, never both in
 * sight, and neighbours' reaches overlap by over three rows.
 */
const STRIP_MARKER_ROWS = Array.from({length: 20}, (_, i) => 2 + 3 * i);
const STRIP_MARKER_RGB = [
  [255, 0, 255],
  [255, 255, 0],
  [255, 140, 0],
] as const;
/** How far from the band a strip marker is judged, px: inside the column. */
const STRIP_MARKER_REACH = 92;
/** The shortest stretch of the block one marker is judged over, ms. */
const MIN_REACH_MS = 150;

interface OpenWheel {
  driver: TouchDriver;
  field: Locator;
  minutes: Locator;
  strip: Locator;
  /** Where a finger lands to flick: low on the minute column. */
  start: {x: number; y: number};
}

async function openWheel(page: Page): Promise<OpenWheel> {
  await openStory(page, storybook(), 'internal-wheel--minutes');
  const driver = await touchDriver(page);
  const field = page.getByRole('textbox', {name: 'Committed minute'});
  await expect(field).toHaveValue('00');
  const minutes = page.getByRole('listbox', {name: 'Minute'});
  await expect(minutes).toBeVisible();
  await page.waitForTimeout(600);
  // The touch column: a finger gets it on every engine.
  await expect(page.locator('[data-wheel]')).toHaveCount(1);
  const column = await minutes.boundingBox();
  if (column == null) {
    throw new Error('no minute column');
  }
  return {
    driver,
    field,
    minutes,
    strip: minutes.locator('[data-wheel-strip]'),
    start: {
      x: Math.round(column.x + column.width / 2),
      y: Math.round(column.y + column.height * 0.8),
    },
  };
}

/** The flick's script, and the offset the rows show at its lift. */
function flickUp(start: {x: number; y: number}) {
  const script = flick(start, {
    velocity: {x: 0, y: -FLICK_VELOCITY},
    durationMs: 100,
    hz: 120,
  });
  const events = toTouchEvents(script);
  const moves = events.filter(e => e.type === 'touchMove');
  const last = moves[moves.length - 1];
  const travel = start.y - (last?.fingers[0]?.y ?? start.y);
  // Minute 00 is under the band; the pan begins past its hysteresis, which
  // the rows never show.
  return {script, offsetAtLift: travel - HYSTERESIS};
}

/**
 * The busy-main-thread proof needs a coast as long as the script's release
 * makes it. Where the page sees real dispatch times (WebKit here), the release
 * velocity is the engine's own and can fall under the velocity floor, and the
 * screencast's cadence varies with load. For Mobile Safari there is an iOS
 * simulator capture of a coast through a 530 ms block; no real device, and
 * no 1 s block there.
 */
const SCRIPTED_RELEASE_SKIP =
  'the coast needs the scripted release velocity, which only an engine replaying the script timestamps gives (README: engine limits); Mobile Safari has an iOS simulator capture through a 530 ms block instead';

/** The y of a `translateY(…px)` keyframe. */
function translateYOf(transform: string): number {
  const match = /translateY\((-?[\d.]+)px\)/.exec(transform);
  if (match == null) {
    throw new Error(`not a translateY keyframe: ${transform}`);
  }
  return Number(match[1]);
}

type WheelAnimation = Awaited<ReturnType<typeof waitForAnimation>>[number];

/**
 * The strip's own animation among those under it (each row also animates its
 * tip and fade): the one whose keyframes are all translations.
 */
function stripAnimationOf(animations: WheelAnimation[]): WheelAnimation {
  const strip = animations.find(
    animation =>
      (animation.keyframes ?? []).length > 0 &&
      (animation.keyframes ?? []).every(
        frame =>
          frame.opacity == null &&
          typeof frame.transform === 'string' &&
          frame.transform.startsWith('translateY('),
      ),
  );
  if (strip == null) {
    throw new Error('no strip animation');
  }
  return strip;
}

/** The strip's translation is minus the wheel's offset. */
/** The strip's running coast, from and to on the page clock, read without
 * its keyframes. */
async function stripCoastTiming(
  strip: Locator,
): Promise<{from: number; to: number}> {
  await expect
    .poll(
      async () =>
        strip.evaluate(element =>
          element
            .getAnimations()
            .some(a => a.playState === 'running' && a.startTime != null),
        ),
      {timeout: 5_000},
    )
    .toBe(true);
  return strip.evaluate(element => {
    const animation = element
      .getAnimations()
      .find(a => a.playState === 'running' && a.startTime != null);
    const effect = animation?.effect as KeyframeEffect | null | undefined;
    const timing = effect?.getComputedTiming();
    const start = performance.timeOrigin + Number(animation?.startTime ?? 0);
    const delay = timing?.delay ?? 0;
    const active = Number(timing?.activeDuration ?? 0);
    // The curve's end, as the harness reads it: the first of the frames
    // that hold the strip's last position (the arrival commits there).
    const frames = effect?.getKeyframes() ?? [];
    let first = frames.length - 1;
    while (
      first > 0 &&
      String(frames[first - 1].transform) === String(frames[first].transform)
    ) {
      first -= 1;
    }
    const linear = (effect?.getTiming().easing ?? 'linear') === 'linear';
    const end = linear ? (frames[first]?.computedOffset ?? 1) * active : active;
    return {from: start + delay, to: start + delay + end};
  });
}

const stripOffset = async (strip: Locator) =>
  strip.evaluate(element => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return -matrix.m42;
  });

test('a flick coasts on UIKit’s curve onto the row it projects, and commits it on arrival', async ({
  page,
  browserName,
}, testInfo) => {
  const {driver, field, strip, start} = await openWheel(page);
  const {script, offsetAtLift} = flickUp(start);
  expect(releaseVelocity(script).y).toBeCloseTo(-FLICK_VELOCITY, -1);
  await driver.play(script);
  const coast = stripAnimationOf(await waitForAnimation(strip));
  const held = await holdAnimations(page, strip);
  const motion = held.find(animation => animation.kind === 'Animation');
  if (motion == null) {
    throw new Error(`no coast held: ${JSON.stringify(held)}`);
  }
  const samples = curveOf(
    await sampleCurve(strip, timeline(motion.curveEndMs)),
    'translateY',
  ).map(sample => ({t: sample.t, value: -sample.value}));
  await releaseAnimations(page);

  const from = samples[0].value;
  const rest = samples[samples.length - 1].value;
  // The engine computes the release velocity from the touch timestamps it
  // delivers, which the 120 Hz script's 8.3 ms steps reach only to the
  // millisecond, so the velocity is fitted (and held near the scripted one)
  // and the whole release is then UIKit's plan for it: the row projected,
  // the coast's rate re-solved to stop there at the stop speed.
  // (WebKit dispatches the script in real time, and its velocity can land
  // far from the scripted one: there only the curve's shape is judged.)
  let fittedVelocity = FLICK_VELOCITY;
  let best = Infinity;
  const [low, high] = browserName === 'chromium' ? [0.8, 1.2] : [0.25, 2];
  for (let v = FLICK_VELOCITY * low; v < FLICK_VELOCITY * high; v += 1) {
    const candidate = planRelease(from, v, MINUTES).curve;
    const error = compareCurve(
      samples,
      t => candidate.value(t / 1000),
      1e9,
    ).maxError;
    if (error < best) {
      best = error;
      fittedVelocity = v;
    }
  }
  const plan = planRelease(from, fittedVelocity, MINUTES);
  const expected = (t: number) => plan.curve.value(t / 1000);
  const result = compareCurve(samples, expected, 0.75);
  await writeEvidence(
    'curves/wheel-coast',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          coast,
          motion,
          offsetAtLift,
          from,
          rest,
          plan: {
            kind: plan.kind,
            index: plan.index,
            duration: plan.curve.duration,
          },
          fittedVelocity,
          comparison: result,
        },
        null,
        2,
      ),
    },
    testInfo,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.75,
  );
  // WebKit's input has integer CSS px and its own timing: within a few px.
  expect(Math.abs(from - offsetAtLift)).toBeLessThan(
    browserName === 'chromium' ? 2 : 24,
  );
  if (browserName === 'chromium') {
    expect(
      Math.abs(fittedVelocity - FLICK_VELOCITY) / FLICK_VELOCITY,
    ).toBeLessThan(0.05);
  }
  // The last sample is half a millisecond before the end.
  expect(Math.abs(rest - plan.index * ROW)).toBeLessThan(0.5);
  if (browserName === 'chromium') {
    // UIKit's coast takes about 2.2 s from 900 pt/s.
    expect(motion.curveEndMs).toBeGreaterThan(1800);
    expect(motion.curveEndMs).toBeLessThan(2700);
  }
  // Committed on arrival, not before.
  await waitForRest(strip);
  await expect(field).toHaveValue(
    String(Math.round(rest / ROW)).padStart(2, '0'),
  );
});

test('the coast keeps advancing every frame while the main thread is blocked', async ({
  page,
}, testInfo) => {
  const {driver, strip, start} = await openWheel(page);
  test.skip(!driver.scriptedTimestamps, SCRIPTED_RELEASE_SKIP);
  // Markers riding the strip itself, every few rows in three colours. They move
  // with the coast and never turn or fade as the rows do, so their steps are
  // the coast's own, and they are placed before the flick, so the block meets
  // them already on screen.
  await strip.evaluate(
    (element, {rows, rowHeight, colours}) => {
      rows.forEach((row, i) => {
        const marker = document.createElement('div');
        marker.dataset.busyMarker = String(row);
        const [r, g, b] = colours[i % colours.length];
        Object.assign(marker.style, {
          position: 'absolute',
          insetInlineStart: '8px',
          insetBlockStart: `${row * rowHeight + (rowHeight - 16) / 2}px`,
          inlineSize: '16px',
          blockSize: '16px',
          backgroundColor: `rgb(${r}, ${g}, ${b})`,
          zIndex: '2147483647',
          pointerEvents: 'none',
        });
        element.append(marker);
      });
    },
    {rows: STRIP_MARKER_ROWS, rowHeight: ROW, colours: STRIP_MARKER_RGB},
  );
  // A compositor-only control in the page's top edge, recorded in the same
  // frames: the coast is judged against what this machine presented.
  const control = await startBusyControl(page);
  const {script} = flickUp(start);
  const cast = await startScreencast(page);
  // The compositor's own record of the frames it presents: a frame the
  // screencast skips under load is not a stall (busyWindowProof).
  const compositor = await startCompositorTrace(page);
  await driver.play(script);
  const coast = stripAnimationOf(
    await waitForAnimation(strip, {minProgressMs: 16}),
  );
  // Read the coast the page is playing (WebKit's real-time input gives it its
  // own release velocity): where the strip is at each moment, from its
  // keyframes.
  const points = (coast.keyframes ?? []).map(frame => ({
    t: Number(frame.computedOffset ?? frame.offset) * coast.durationMs,
    offset: -translateYOf(String(frame.transform)),
  }));
  const rest = points[points.length - 1].offset;
  const when = (distance: number) =>
    points.find(point => rest - point.offset <= distance)?.t ??
    coast.durationMs;
  // A 1 s block, as spec:AST-094 FR5's proof names, ending while the coast is
  // still over a row from rest.
  const blockTo = when(1.25 * ROW);
  const blockFrom = blockTo - BLOCK_MS;
  expect(blockFrom, 'the coast runs the whole block').toBeGreaterThan(0);
  await page.waitForTimeout(Math.max(0, coast.from + blockFrom - Date.now()));
  const block = await blockMainThread(page, BLOCK_MS);
  await page.waitForTimeout(150);
  const presented = await compositor.stop();
  const castFrames = await cast.stop();
  const tracks: Awaited<ReturnType<typeof trackMarker>>[] = [];
  for (const rgb of STRIP_MARKER_RGB) {
    tracks.push(await trackMarker(page, castFrames, {rgb}));
  }
  const controlFrames = await trackMarker(page, castFrames, {
    rgb: CONTROL_RGB,
  });
  await control.remove();
  // Each marker is judged while it is within reach of the band, inside the
  // column; neighbours' reaches overlap, so a marker in sight for only a
  // sliver of the block is left out where its neighbour covers that time.
  const end = Math.min(block.to, coast.to);
  const at = (offset: number) =>
    coast.from +
    (points.find(point => point.offset >= offset)?.t ?? coast.durationMs);
  const reaches = STRIP_MARKER_ROWS.map((row, i) => ({
    row,
    track: i % STRIP_MARKER_RGB.length,
    from: Math.max(block.from, at(row * ROW - STRIP_MARKER_REACH)),
    to: Math.min(end, at(row * ROW + STRIP_MARKER_REACH)),
  })).filter(reach => reach.to - reach.from >= MIN_REACH_MS);
  // Together the judged reaches cover the whole block.
  let covered = block.from;
  for (const reach of reaches) {
    expect(reach.from, 'the markers cover the block').toBeLessThanOrEqual(
      covered,
    );
    covered = Math.max(covered, reach.to);
  }
  expect(covered, 'the markers cover the block').toBeGreaterThanOrEqual(end);
  const proofs = reaches.map(({track, from, to}) =>
    busyWindowProof(
      tracks[track],
      {from, to},
      {presented, control: controlFrames},
    ),
  );
  await writeEvidence(
    'busy-main-thread/wheel-coast',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          coast,
          reaches,
          proofs,
          frames: tracks[0].map((f, i) => ({
            t: +(f.t - block.from).toFixed(1),
            y: tracks.map(track => track[i]?.box?.y ?? null),
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'wheel-coast-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: end + 40,
    columns: 8,
    cellScale: 0.35,
    data: t =>
      Object.fromEntries(
        tracks.map((track, i) => [
          `y${i}`,
          track.find(f => f.t === t)?.box?.y ?? -1,
        ]),
      ),
  });
  await film.write(testInfo, {block, coast});
  // Judged against the control: the coast moved on every frame the control
  // moved, and its longest stall is no longer than the control's. On the
  // coast's slowing tail it moves under one cast step a frame, so a run of
  // unchanged frames that a single step ends counts as moved there; a frozen
  // coast ends its run in a catch-up of many steps, or never moves while the
  // control does.
  for (const proof of proofs) {
    expect(proof.verdict.failures, proof.summary).toEqual([]);
    expect(proof.control?.moved).toBeGreaterThanOrEqual(4);
    expect(proof.monotonic).toBe(true);
  }
});

test('the coast does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver, strip, start} = await openWheel(page);
  const {script} = flickUp(start);
  let coast = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await driver.play(script);
    // The strip's own timing only: describing every row's baked keyframes
    // (waitForAnimation) is itself a DevTools task of nearly 50 ms on the
    // page's main thread, which the long-task check would count.
    coast = await stripCoastTiming(strip);
    await waitForRest(strip);
  });
  const during = countBetween(trace, coast.from + 50, coast.to - 50);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
  expect(trace.longTasks).toEqual([]);
});

test('a finger landing on the coasting wheel stops it where it is, then it eases onto the nearest row', async ({
  page,
}) => {
  const {driver, field, strip, start} = await openWheel(page);
  await driver.play(flickUp(start).script);
  const coast = stripAnimationOf(
    await waitForAnimation(strip, {minProgressMs: 16}),
  );
  const coastEnd = -translateYOf(String(coast.keyframes?.at(-1)?.transform));
  await page.waitForTimeout(300);
  // Land and hold still: the wheel stops at once, between rows.
  const hold = tap(start, {holdMs: 300});
  let caught = NaN;
  let held = NaN;
  let step = 0;
  await driver.play(hold, {
    onEvent: async () => {
      if (step++ === 0) {
        await page.waitForTimeout(50);
        caught = await stripOffset(strip);
        await page.waitForTimeout(150);
        held = await stripOffset(strip);
      }
    },
  });
  expect(held).toBeCloseTo(caught, 0);
  // It was caught mid-run, short of where the coast was heading.
  expect(caught).toBeLessThan(coastEnd - ROW / 2);
  // Lifted without moving: no tap on the touched row, a snap to the nearest.
  await waitForRest(strip);
  const rested = await stripOffset(strip);
  expect(rested % ROW).toBe(0);
  expect(Math.abs(rested - caught)).toBeLessThanOrEqual(ROW / 2);
  await expect(field).toHaveValue(String(rested / ROW).padStart(2, '0'));
});

test(
  'storyboard: a flick and its coast onto a row',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, minutes, strip, start} = await openWheel(page);
    const box = await minutes.boundingBox();
    if (box == null) {
      throw new Error('no minute column');
    }
    const clip = {
      x: Math.max(0, box.x - 160),
      y: box.y - 20,
      width: Math.min(402, box.width + 320),
      height: box.height + 40,
    };
    const measure = async () => ({offset: await stripOffset(strip)});
    const {script} = flickUp(start);
    // The wheel ends a motion from a timer; gate the page's timers so the
    // held coast is not finished behind the filmstrip's back.
    await installTimerGate(page);
    const flickBoard = await touchStoryboard(page, driver, script, {
      name: 'wheel-flick',
      clip,
      measure,
      columns: 6,
      cellScale: 0.5,
    });
    await waitForAnimation(strip);
    await freezeTimers(page);
    const {storyboard: coastBoard} = await animationStoryboard(page, {
      name: 'wheel-coast',
      clip,
      scope: strip,
      measure,
      columns: 8,
      cellScale: 0.5,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await flickBoard.write(testInfo);
    await coastBoard.write(testInfo);
    // The trace is the assertion; the sheets are the evidence.
    const offsets = coastBoard.frames.map(f => f.data.offset as number);
    expect(offsets.every((o, i) => i === 0 || o >= offsets[i - 1] - 0.5)).toBe(
      true,
    );
    const last = offsets.at(-1) ?? NaN;
    expect(Math.abs(last - Math.round(last / ROW) * ROW)).toBeLessThan(0.5);
    // It decelerates: each frame covers no more than the one before.
    const steps = offsets.slice(1).map((o, i) => o - offsets[i]);
    expect(steps.every((s, i) => i === 0 || s <= steps[i - 1] + 0.5)).toBe(
      true,
    );
  },
);

/** Records every animation under `column`, every frame: its animated properties, length, transforms and keyframe offsets. */
async function recordAnimations(column: Locator) {
  await column.evaluate(element => {
    const seen = new Map<
      Animation,
      {
        props: string[];
        duration: number;
        transforms: string[];
        offsets: number[];
      }
    >();
    (window as unknown as {wheelAnimations: typeof seen}).wheelAnimations =
      seen;
    const sample = () => {
      for (const animation of document.getAnimations()) {
        const effect = animation.effect;
        if (!(effect instanceof KeyframeEffect)) {
          continue;
        }
        const target = effect.target;
        if (
          target == null ||
          !element.contains(target) ||
          seen.has(animation)
        ) {
          continue;
        }
        const props = new Set<string>();
        const transforms: string[] = [];
        const offsets: number[] = [];
        for (const frame of effect.getKeyframes()) {
          offsets.push(frame.computedOffset);
          for (const key of Object.keys(frame)) {
            if (
              !['offset', 'computedOffset', 'easing', 'composite'].includes(key)
            ) {
              props.add(key);
            }
          }
          if (frame.transform != null) {
            transforms.push(String(frame.transform));
          }
        }
        seen.set(animation, {
          props: [...props],
          duration: Number(effect.getTiming().duration),
          transforms,
          offsets,
        });
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  return async () =>
    column.page().evaluate(() => [
      ...(
        window as unknown as {
          wheelAnimations: Map<
            unknown,
            {
              props: string[];
              duration: number;
              transforms: string[];
              offsets: number[];
            }
          >;
        }
      ).wheelAnimations.values(),
    ]);
}

test('under reduced motion, a flick still coasts as momentum, its rows flat', async ({
  page,
}) => {
  // design:reduced-motion DR2: the momentum that continues a throw is direct
  // movement, not a transition, so it coasts as scrolling does; only the
  // rows' tip gives way to their fade.
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, field, minutes, start} = await openWheel(page);
  const read = await recordAnimations(minutes);
  await driver.play(flickUp(start).script);
  await expect(field).not.toHaveValue('00', {timeout: 4000});
  const seen = await read();
  // The strip coasts: a translation longer than any cross-fade.
  const coasts = seen.filter(
    animation =>
      animation.props.includes('transform') &&
      animation.transforms.some(transform =>
        transform.startsWith('translateY'),
      ),
  );
  expect(coasts.length).toBeGreaterThan(0);
  expect(
    Math.max(...coasts.map(animation => animation.duration)),
  ).toBeGreaterThan(200);
  // No row tips: every row stays upright and full size.
  for (const animation of seen) {
    for (const transform of animation.transforms) {
      expect(transform).not.toMatch(/rotateX\((?!0deg)|scale\((?!1\))/);
    }
  }
});

test('under reduced motion, a tap cross-fades onto its row: nothing travels, in 200 ms or less', async ({
  page,
}) => {
  // design:reduced-motion DR2: a transition the wheel starts, here a tap's
  // turn, fades in 200 ms or less and moves nothing on screen: the rows land
  // at the fade's midpoint, a step while the drawing is faded out.
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, field, minutes} = await openWheel(page);
  const read = await recordAnimations(minutes);
  const box = await minutes.boundingBox();
  if (box == null) {
    throw new Error('no minute column');
  }
  // Two rows below the band: minute 02.
  await driver.tap({
    x: Math.round(box.x + box.width / 2),
    y: Math.round(box.y + box.height / 2 + 2 * ROW),
  });
  await expect(field).toHaveValue('02', {timeout: 3000});
  const seen = await read();
  const fades = seen.filter(
    animation => !animation.props.includes('transform'),
  );
  expect(fades.length).toBeGreaterThan(0);
  for (const fade of fades) {
    expect(fade.props).toEqual(['opacity']);
    expect(fade.duration).toBeLessThanOrEqual(200);
  }
  const fadeMs = Math.max(...fades.map(fade => fade.duration));
  for (const landing of seen.filter(animation =>
    animation.props.includes('transform'),
  )) {
    // The origin held, then the destination: two values, no travel...
    const [origin, held, landed, end] = landing.transforms;
    expect(landing.transforms).toHaveLength(4);
    expect(held).toBe(origin);
    expect(end).toBe(landed);
    // ...stepping at the fade's midpoint.
    expect(landing.offsets[1]).toBe(landing.offsets[2]);
    expect(landing.offsets[1] * landing.duration).toBeCloseTo(fadeMs / 2, 0);
  }
});

test('under reduced motion, a tap lands its row on the compositor while the main thread is blocked', async ({
  page,
  browserName,
}) => {
  // design:reduced-motion DR2 with spec:AST-094 FR5: the rows land at the
  // fade's midpoint on the compositor, so a main thread blocked across it
  // never brings the fade back in on the old row.
  test.skip(
    browserName !== 'chromium',
    'the screencast proof runs on Chromium; WebKit runs the landing case above',
  );
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, field, minutes, strip} = await openWheel(page);
  const box = await minutes.boundingBox();
  if (box == null) {
    throw new Error('no minute column');
  }
  const target = minutes.getByRole('option', {name: '01'});
  await markElement(target);
  const chip = page.locator('[data-harness-marker-chip]');
  const from = await chip.boundingBox();
  const cast = await startScreencast(page);
  // The row below the band, minute 01, in sight before and after (today’s
  // rows fade toward the edges). The block starts once the tap’s
  // cross-fade plays on the compositor, and covers its midpoint and its end.
  await driver.tap({
    x: Math.round(box.x + box.width / 2),
    y: Math.round(box.y + box.height / 2 + ROW),
  });
  const fade = (await waitForAnimation(strip, {minProgressMs: 16})).find(
    animation => animation.durationMs <= 200,
  );
  if (fade == null) {
    throw new Error('no cross-fade');
  }
  const block = await blockMainThread(page, 700);
  await page.waitForTimeout(150);
  const frames = await cast.stop();
  await expect(field).toHaveValue('01', {timeout: 3000});
  const to = await chip.boundingBox();
  if (from == null || to == null) {
    throw new Error('no marker');
  }
  expect(Math.abs(to.y - from.y), 'the row moved to the band').toBeGreaterThan(
    ROW / 2,
  );
  // The screencast sends a frame for each change on screen: the fade coming
  // back in from its midpoint, while the main thread is still blocked. Each
  // frame of it with the row in sight has the row at the band.
  const fadeMs = 200;
  const tracked = await trackMarker(page, frames);
  const fadingIn = tracked.filter(
    frame =>
      frame.box != null &&
      frame.t >= fade.from + fadeMs / 2 + 10 &&
      frame.t < block.to,
  );
  const timeline = tracked
    .map(
      frame =>
        `+${Math.round(frame.t - block.from)}:${frame.box == null ? '-' : Math.round(frame.box.y)}`,
    )
    .join(' ');
  expect(
    fadingIn.length,
    `frames with the row in sight (${timeline})`,
  ).toBeGreaterThan(0);
  for (const frame of fadingIn) {
    expect(
      Math.abs((frame.box?.y ?? Infinity) - to.y),
      `the row at +${Math.round(frame.t - block.from)} ms, at rest y ${Math.round(to.y)} (${timeline})`,
    ).toBeLessThan(3);
  }
});

test.describe('under a mouse', () => {
  // A desktop: today's column.
  test.use({hasTouch: false, isMobile: false});

  test('a drag scrolls today’s column onto a row and commits it', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'one engine is enough for the fine-pointer path, which is main’s column',
    );
    await openStory(page, storybook(), 'internal-wheel--minutes');
    // A mouse case runs under a fine primary pointer: the page agrees.
    expect(
      await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const field = page.getByRole('textbox', {name: 'Committed minute'});
    await expect(field).toHaveValue('00');
    const minutes = page.getByRole('listbox', {name: 'Minute'});
    await expect(minutes).toBeVisible();
    // Today's column, not the touch one.
    await expect(page.locator('[data-wheel]')).toHaveCount(0);
    await page.waitForTimeout(600);
    const row = await minutes
      .locator('[role="option"]')
      .first()
      .evaluate(el => el.getBoundingClientRect().height);
    const box = await minutes.boundingBox();
    if (box == null) {
      throw new Error('no minute column');
    }
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    // Up three rows and a little: the content follows the hand.
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 30; i++) {
      await page.waitForTimeout(16);
      await page.mouse.move(x, y - ((3 * row + 8) * i) / 30);
    }
    await page.waitForTimeout(200);
    await page.mouse.up();
    // The column snaps onto a row and commits it.
    await expect(field).not.toHaveValue('00', {timeout: 5000});
    await expect
      .poll(
        async () =>
          minutes.evaluate((el, pitch) => {
            const rows = el.scrollTop / pitch;
            return Math.abs(rows - Math.round(rows));
          }, row),
        {timeout: 5000},
      )
      .toBeLessThan(0.05);
  });
});
