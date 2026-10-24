// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Wheel.interaction.browser.spec.ts
 * @input The built TimeInput "BottomSheetWithMinMax" story, real touch input
 *   (Chromium CDP / WebKit's input command), the interaction harness, and the
 *   Wheel's own physics as the oracle of UIKit's measured picker
 * @output Interaction and animation proofs for the touch picker wheel, which
 *   a finger gets on every engine: a flick coasts
 *   on UIKit's curve onto the row UIKit's projection picks and commits it on
 *   arrival; the coast keeps advancing every frame through a blocked main
 *   thread; it does no Layout or Paint per frame; a finger landing on the
 *   coasting wheel stops it where it is and the wheel then eases onto the
 *   nearest row; a storyboard of a flick and its coast; under reduced motion,
 *   a flick that cross-fades onto its row (design:reduced-motion: opacity
 *   only, 200 ms or less). Under a mouse, a drag scrolls today's column onto
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
import {planRelease, type WheelLayout} from '../wheelPhysics';

const storybook = withStorybook(test);

const ROW = 32;
const MINUTES: WheelLayout = {rowHeight: ROW, rowCount: 60};
const HYSTERESIS = UIKIT_GESTURES.pan.hysteresis.value;
/** A flick up the minute wheel: the rows run on towards higher minutes. */
const FLICK_VELOCITY = 900;

interface OpenWheel {
  driver: TouchDriver;
  field: Locator;
  minutes: Locator;
  strip: Locator;
  /** Where a finger lands to flick: low on the minute column. */
  start: {x: number; y: number};
}

async function openWheel(page: Page): Promise<OpenWheel> {
  await openStory(
    page,
    storybook(),
    'core-timeinput--bottom-sheet-with-min-max',
  );
  const driver = await touchDriver(page);
  const field = page.getByRole('combobox', {name: 'Appointment time'});
  await expect(field).toHaveValue('10:00 AM');
  const box = await field.boundingBox();
  if (box == null) {
    throw new Error('no field');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  const minutes = page.getByRole('listbox', {name: 'Minute'});
  await expect(minutes).toBeVisible();
  const dialog = page.getByRole('dialog', {name: 'Appointment time'});
  await waitForRest(dialog.locator('.astryx-bottom-sheet').first()).catch(
    () => {},
  );
  await page.waitForTimeout(600);
  // The touch column: a finger gets it on every engine.
  await expect(page.locator('[data-wheel]')).toHaveCount(3);
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
 * screencast's cadence varies with load. The iOS simulator capture proves the
 * coast through a block in Mobile Safari.
 */
const SCRIPTED_RELEASE_SKIP =
  'the coast needs the scripted release velocity, which only an engine replaying the script timestamps gives (README: engine limits); the iOS simulator capture proves it in Mobile Safari';

/** The y of a `translateY(…px)` keyframe. */
function translateYOf(transform: string): number {
  const match = /translateY\((-?[\d.]+)px\)/.exec(transform);
  if (match == null) {
    throw new Error(`not a translateY keyframe: ${transform}`);
  }
  return Number(match[1]);
}

/** The strip's translation is minus the wheel's offset. */
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
  const [coast] = await waitForAnimation(strip);
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
    `10:${String(Math.round(rest / ROW)).padStart(2, '0')} AM`,
  );
});

test('the coast keeps advancing every frame while the main thread is blocked', async ({
  page,
}, testInfo) => {
  const {driver, minutes, strip, start} = await openWheel(page);
  test.skip(!driver.scriptedTimestamps, SCRIPTED_RELEASE_SKIP);
  const {script} = flickUp(start);
  const cast = await startScreencast(page);
  await driver.play(script);
  const [coast] = await waitForAnimation(strip, {minProgressMs: 16});
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
  // The row the coast ends on, on the cylinder below the band: block while
  // it rises from four rows below the band to just over one, in sight and
  // moving every frame the whole time.
  const blockFrom = when(4 * ROW);
  const blockTo = when(1.25 * ROW);
  expect(blockTo - blockFrom, 'the block covers the coast').toBeGreaterThan(
    200,
  );
  const marked = minutes.getByRole('option', {
    name: String(Math.round(rest / ROW)).padStart(2, '0'),
  });
  // The dimmed copy's rows are 44.7 % opaque, which washes out the marker
  // chip's colour; this one row is drawn opaque for the evidence.
  await marked.evaluate(element => {
    (element as HTMLElement).style.opacity = '1';
  });
  await markElement(marked);
  await page.waitForTimeout(Math.max(0, coast.from + blockFrom - Date.now()));
  const block = await blockMainThread(page, Math.round(blockTo - blockFrom));
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, coast.to)},
    {settledWithin: 1},
  );
  await writeEvidence(
    'busy-main-thread/wheel-coast',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          coast,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - block.from).toFixed(1),
            y: f.box?.y ?? null,
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
    to: Math.min(block.to, coast.to) + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({y: tracked.find(f => f.t === t)?.box?.y ?? -1}),
  });
  await film.write(testInfo, {block, coast});
  // The harness's verdict: a new position on at least 90 % of the window's
  // frame intervals, no stall over three of them, a median interval of at
  // most 20 ms; a frozen coast shows one stall the length of the block.
  expect(
    proof.verdict.pass,
    `${proof.summary}; ${proof.verdict.failures.join('; ')}`,
  ).toBe(true);
  expect(proof.monotonic).toBe(true);
  // Every frame the compositor presented while the main thread was blocked
  // shows the coast moved. A frame the runner never drew is never presented,
  // so a dropped frame (software compositing on a busy runner) proves nothing
  // either way; a coast that stops shows presented frames that did not move,
  // or none at all, which the verdict above rejects.
  expect(proof.moved, proof.summary).toBe(proof.frames);
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
    [coast] = await waitForAnimation(strip);
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
  const [coast] = await waitForAnimation(strip, {minProgressMs: 16});
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
  await expect(field).toHaveValue(
    `10:${String(rested / ROW).padStart(2, '0')} AM`,
  );
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

test('under reduced motion, a flick cross-fades onto its row: opacity only, 200 ms or less', async ({
  page,
}) => {
  // design:reduced-motion DR1/DR2: the release of a touch drag starts a
  // transition that changes opacity only and finishes in 200 ms or less.
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, field, minutes, start} = await openWheel(page);
  // Every animation under the minute column, every frame, as the record's
  // verification reads them: its animated properties and its length.
  await minutes.evaluate(column => {
    const seen = new Map<Animation, {props: string[]; duration: number}>();
    (window as unknown as {wheelAnimations: typeof seen}).wheelAnimations =
      seen;
    const sample = () => {
      for (const animation of document.getAnimations()) {
        const effect = animation.effect;
        if (!(effect instanceof KeyframeEffect)) {
          continue;
        }
        const target = effect.target;
        if (target == null || !column.contains(target) || seen.has(animation)) {
          continue;
        }
        const props = new Set<string>();
        for (const frame of effect.getKeyframes()) {
          for (const key of Object.keys(frame)) {
            if (
              !['offset', 'computedOffset', 'easing', 'composite'].includes(key)
            ) {
              props.add(key);
            }
          }
        }
        seen.set(animation, {
          props: [...props],
          duration: Number(effect.getTiming().duration),
        });
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await driver.play(flickUp(start).script);
  await expect(field).not.toHaveValue('10:00 AM', {timeout: 3000});
  const seen = await page.evaluate(() => [
    ...(
      window as unknown as {
        wheelAnimations: Map<unknown, {props: string[]; duration: number}>;
      }
    ).wheelAnimations.values(),
  ]);
  expect(seen.length).toBeGreaterThan(0);
  for (const animation of seen) {
    expect(animation.props).toEqual(['opacity']);
    expect(animation.duration).toBeLessThanOrEqual(200);
  }
});

test.describe('under a mouse', () => {
  // A desktop: today's column, in the sheet the story asks for.
  test.use({hasTouch: false, isMobile: false});

  test('a drag scrolls today’s column onto a row and commits it', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'one engine is enough for the fine-pointer path, which is main’s column',
    );
    await openStory(
      page,
      storybook(),
      'core-timeinput--bottom-sheet-with-min-max',
    );
    // A mouse case runs under a fine primary pointer: the page agrees.
    expect(
      await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const field = page.getByRole('combobox', {name: 'Appointment time'});
    await expect(field).toHaveValue('10:00 AM');
    await field.click();
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
    await expect(field).not.toHaveValue('10:00 AM', {timeout: 5000});
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
