// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetDetent.interaction.browser.spec.ts
 * @input The built "Snap points" BottomSheet story, real touch input
 *   (Chromium CDP / WebKit's input command), the interaction harness and the
 *   UIKit constants table (the parameters the oracle springs use)
 * @output Interaction and animation proofs for releasing the sheet: the drag
 *   follows the finger and a slow release settles on the nearest detent; a
 *   flick dismisses; the settle is UIKit's release spring, sampled frame by
 *   frame against an independent spring oracle, starting at the finger's
 *   velocity (critically damped below `sheet.release.fastSpeed`, 80 % damped
 *   above); a finger catches the settling sheet where it is; the settle keeps
 *   advancing every frame through a blocked main thread; it does no Layout or
 *   Paint per frame; storyboards of the drag, the settle and a flick.
 * @position The exemplar for `*.interaction.browser.spec.ts`: component lanes
 *   copy this shape. Each test names the instrument it uses from
 *   @astryxdesign/interaction-harness, so the evidence layer is explicit.
 *
 * The sheet moves on the `translate` property while a gesture or its release
 * runs (the motion foundation's animator; its resting position is the
 * element's `transform`), so curves are sampled from both (`sampleTravel`).
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  compareCurve,
  countBetween,
  drag,
  flick,
  frames,
  freezeTimers,
  holdAnimations,
  installInputLog,
  installLongTaskLog,
  installTimerGate,
  markElement,
  openStory,
  readInputLog,
  readLongTasks,
  releaseAnimations,
  releaseVelocity,
  seekAnimations,
  springStep,
  startScreencast,
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
  type InputRecord,
  type TimedValue,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {sheet as sheetTable} from '../../motion/uikit/sheet';
import {springs} from '../../motion/uikit/springs';

const storybook = withStorybook(test);

interface OpenSheet {
  driver: TouchDriver;
  sheet: Locator;
  /** Top of the sheet at its tall detent and at the half-viewport detent, CSS px. */
  tallTop: number;
  halfTop: number;
  handle: {x: number; y: number};
}

async function openSheet(page: Page): Promise<OpenSheet> {
  await installLongTaskLog(page);
  await installInputLog(page);
  await openStory(page, storybook(), 'core-bottomsheet--snap-points');
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: 'Open nearby places'});
  const box = await trigger.boundingBox();
  if (box == null) {
    throw new Error('no trigger');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  const sheet = page
    .getByRole('dialog', {name: 'Nearby places'})
    .locator('.astryx-bottom-sheet')
    .first();
  await expect(sheet).toBeVisible();
  await waitForRest(sheet);
  const rect = await sheet.boundingBox();
  if (rect == null) {
    throw new Error('no sheet');
  }
  const viewport = page.viewportSize();
  if (viewport == null) {
    throw new Error('no viewport');
  }
  return {
    driver,
    sheet,
    tallTop: rect.y,
    // snapPoints={[0.5]}: the extra stop shows half the viewport.
    halfTop: viewport.height * 0.5,
    handle: {x: rect.x + rect.width / 2, y: rect.y + 12},
  };
}

// A plain evaluate, not boundingBox(): it must also work while the page's timers are frozen.
const sheetTop = async (sheet: Locator) =>
  sheet.evaluate(el => el.getBoundingClientRect().y);

const SLOW_DRAG_MS = 400;

/**
 * A slow drag that rests 150 ms before the lift. UIKit's velocity filter
 * keeps the last moving speed through a rest (a still finger sends no
 * events), so the release carries `dy / 0.4 s` (`slowDragSpeed`).
 */
function slowDragTo(from: {x: number; y: number}, dy: number) {
  return drag(
    from,
    {x: from.x, y: from.y + dy},
    {durationMs: SLOW_DRAG_MS, hz: 60, restMs: 150},
  );
}
const slowDragSpeed = (dy: number) => (dy * 1000) / SLOW_DRAG_MS;

/**
 * The sheet's vertical translation at each time (ms from the held
 * animations' start): its `translate` (the release spring) plus its
 * `transform` (the resting detent). Hold the animations first.
 */
async function sampleTravel(
  sheet: Locator,
  times: ReadonlyArray<number>,
): Promise<TimedValue[]> {
  return sheet.evaluate((element, ts) => {
    const held =
      (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ?? [];
    if (held.length === 0) {
      throw new Error('sampleTravel: no held animations');
    }
    return ts.map(t => {
      for (const animation of held) {
        const end = Number(
          animation.effect?.getComputedTiming().endTime ?? Infinity,
        );
        animation.currentTime = Math.min(t, end - 0.5);
      }
      const style = getComputedStyle(element);
      const translate =
        style.translate === 'none'
          ? 0
          : Number.parseFloat(style.translate.split(' ')[1] ?? '0');
      const transform =
        style.transform === 'none' ? 0 : new DOMMatrix(style.transform).m42;
      return {t, value: translate + transform};
    });
  }, times);
}

/**
 * The velocity UIKit reports at the lift (px/s) for the touch the page
 * received last: 0.2 × the newest event's instantaneous speed + 0.8 × the
 * one before, never decaying through a rest (UIPanGestureRecognizer, measured
 * on the iOS 26.2 simulator). From the events' own timestamps and positions,
 * so it holds in WebKit too, whose input carries real dispatch times and
 * whole-pixel positions rather than the script's.
 */
function uikitReleaseVelocity(records: ReadonlyArray<InputRecord>): number {
  const touch = records.filter(
    r =>
      r.pointerType === 'touch' &&
      (r.type === 'pointerdown' || r.type === 'pointermove') &&
      r.y != null,
  );
  const samples = touch.slice(
    touch.map(r => r.type).lastIndexOf('pointerdown'),
  );
  const speed = (a: InputRecord, b: InputRecord) =>
    b.timeStamp > a.timeStamp
      ? (((b.y as number) - (a.y as number)) / (b.timeStamp - a.timeStamp)) *
        1000
      : 0;
  const n = samples.length;
  if (n < 2) {
    return 0;
  }
  if (n === 2) {
    return speed(samples[0], samples[1]);
  }
  return (
    0.2 * speed(samples[n - 2], samples[n - 1]) +
    0.8 * speed(samples[n - 3], samples[n - 2])
  );
}

/**
 * UIKit's release spring for a settle from `from` to `to` (px) that starts at
 * `velocity` px/s, from the harness's own spring math (independent of the
 * code under test) and the constants table's parameters.
 */
function uikitRelease(from: number, to: number, velocity: number) {
  const spring =
    Math.abs(velocity) >= sheetTable.release.fastSpeed
      ? springs.sheetReleaseFast
      : springs.sheetDetent;
  const initialVelocity = to === from ? 0 : velocity / (to - from);
  return (t: number) =>
    from +
    (to - from) *
      springStep(
        {
          response: spring.response,
          dampingFraction: spring.dampingRatio,
          initialVelocity,
        },
        t,
      );
}

/** Holds the release's animation and compares it with UIKit's spring. */
async function compareRelease(
  page: Page,
  sheet: Locator,
  velocity: number,
): Promise<{
  result: ReturnType<typeof compareCurve>;
  samples: TimedValue[];
  from: number;
  to: number;
}> {
  const [settle] = await waitForAnimation(sheet);
  await holdAnimations(page, sheet);
  const samples = await sampleTravel(sheet, timeline(settle.durationMs));
  const from = samples[0].value;
  const to = samples[samples.length - 1].value;
  const result = compareCurve(samples, uikitRelease(from, to, velocity), 0.5);
  await releaseAnimations(page);
  return {result, samples, from, to};
}

test('a slow drag follows the finger and settles on the nearest detent', async ({
  page,
}) => {
  const {driver, sheet, tallTop, halfTop, handle} = await openSheet(page);
  // Two thirds of the way to the half detent: nearer to it than to tall.
  const dy = Math.round((halfTop - tallTop) * 0.66);
  const script = slowDragTo(handle, dy);
  const lastMove =
    toTouchEvents(script).filter(e => e.type === 'touchMove').length - 1;
  const tracked: {top: number; finger: number}[] = [];
  let moves = 0;
  let restingTop = NaN;
  const started = Date.now();
  await driver.play(script, {
    onEvent: async step => {
      if (step.type !== 'touchMove') {
        return;
      }
      // A frame after each move, so the page has handled it (Chromium hands
      // touch moves over on the next animation frame), and once more after
      // the last move: the finger rests 150 ms before lifting.
      await frames(page, 1);
      tracked.push({
        top: await sheetTop(sheet),
        finger: step.changed[0].y - handle.y,
      });
      if (moves++ === lastMove) {
        await frames(page, 1);
        restingTop = await sheetTop(sheet);
      }
    },
  });
  // 1:1 with the finger at every move, no pull toward a detent (within the
  // pixel WebKit rounds touch positions to).
  for (const {top, finger} of tracked) {
    expect(Math.abs(top - tallTop - finger)).toBeLessThanOrEqual(1);
  }
  expect(restingTop).toBeCloseTo(tallTop + dy, 0);
  await waitForRest(sheet);
  expect(await sheetTop(sheet)).toBeCloseTo(halfTop, 0);
  // No long task from the gesture or the settle (the story's own load is excluded).
  expect(await readLongTasks(page, {from: started, to: Date.now()})).toEqual(
    [],
  );
});

test('pulled up past the tallest detent, the sheet holds', async ({page}) => {
  const {driver, sheet, tallTop, handle} = await openSheet(page);
  const tops: number[] = [];
  await driver.play(
    drag(handle, {x: handle.x, y: handle.y - 120}, {durationMs: 400, hz: 60}),
    {
      onEvent: async step => {
        if (step.type === 'touchMove') {
          tops.push(await sheetTop(sheet));
        }
      },
    },
  );
  // UIKit's sheet doesn't stretch past its largest detent (iOS 26.2): no
  // move lifts it, and the lift leaves nothing to settle.
  expect(tops.length).toBeGreaterThan(10);
  for (const top of tops) {
    expect(top).toBeCloseTo(tallTop, 0);
  }
  await frames(page, 2);
  expect(await sheet.evaluate(el => el.getAnimations().length)).toBe(0);
  expect(await sheetTop(sheet)).toBeCloseTo(tallTop, 0);
});

test('the dim follows the sheet: at once under the finger, in lockstep with the release', async ({
  page,
}) => {
  const {driver, sheet, tallTop, halfTop, handle} = await openSheet(page);
  const dialog = page.getByRole('dialog', {name: 'Nearby places'});
  const viewportHeight = page.viewportSize()?.height ?? 0;
  // UIKit's dim: full at the shortest detent and above, linear in the sheet's
  // top below it, clear when the top reaches the bottom of the screen.
  const dimAt = (top: number) =>
    Math.min(
      1,
      Math.max(0, (viewportHeight - top) / (viewportHeight - halfTop)),
    );
  const backdropOpacity = async () =>
    dialog.evaluate(el => Number(getComputedStyle(el, '::backdrop').opacity));
  // Down to the half detent first.
  await driver.play(slowDragTo(handle, Math.round((halfTop - tallTop) * 0.8)));
  await waitForRest(sheet);
  expect(await sheetTop(sheet)).toBeCloseTo(halfTop, 0);
  expect(await backdropOpacity()).toBeCloseTo(1, 2);
  // 100 px below it, slowly: the dim follows every move at once.
  const fromHalf = {x: handle.x, y: halfTop + 12};
  const tracked: {top: number; dim: number}[] = [];
  await driver.play(
    drag(
      fromHalf,
      {x: fromHalf.x, y: fromHalf.y + 100},
      {durationMs: 400, hz: 60, restMs: 150},
    ),
    {
      onEvent: async step => {
        if (step.type === 'touchMove') {
          await frames(page, 1);
          tracked.push({
            top: await sheetTop(sheet),
            dim: await backdropOpacity(),
          });
        }
      },
    },
  );
  expect(tracked.at(-1)?.top).toBeGreaterThan(halfTop + 90);
  for (const {top, dim} of tracked) {
    expect(dim).toBeCloseTo(dimAt(top), 2);
  }
  // Released at 250 px/s, short of halfway to gone: back to the half detent,
  // the dim riding the same spring, each moment's dim the one for where the
  // sheet is.
  await holdAnimations(page, dialog);
  for (const t of [0, 33, 83, 150, 250, 400]) {
    await seekAnimations(page, t);
    const top = await sheetTop(sheet);
    expect(await backdropOpacity(), `t=${t} top=${top}`).toBeCloseTo(
      dimAt(top),
      2,
    );
  }
});

test('a downward flick lands on the next detent, and from there dismisses', async ({
  page,
}) => {
  const {driver, sheet, halfTop, handle} = await openSheet(page);
  // 2000 px/s for 80 ms from the tall detent: 160 + 2000 × 0.114 = 388 px
  // projected, nearest the half detent (UIKit sends a medium/large sheet
  // flicked this way from large to medium).
  const fromTall = flick(handle, {
    velocity: {x: 0, y: 2000},
    durationMs: 80,
    hz: 120,
  });
  expect(releaseVelocity(fromTall).y).toBeCloseTo(2000, -1);
  await driver.play(fromTall);
  await waitForRest(sheet);
  expect(await sheetTop(sheet)).toBeCloseTo(halfTop, 0);
  // The same flick from the half detent projects past halfway to gone.
  await driver.play(
    flick(
      {x: handle.x, y: halfTop + 12},
      {velocity: {x: 0, y: 2000}, durationMs: 80, hz: 120},
    ),
  );
  await expect(page.getByRole('dialog', {name: 'Nearby places'})).toBeHidden();
});

test('the settle is the UIKit release spring, sampled frame by frame', async ({
  page,
}, testInfo) => {
  const {driver, sheet, tallTop, halfTop, handle} = await openSheet(page);
  const dy = Math.round((halfTop - tallTop) * 0.66);
  await readInputLog(page, {clear: true});
  await driver.play(slowDragTo(handle, dy));
  // The critically damped detent spring from where the finger left the
  // sheet, handed the drag's speed, which survives the rest before the lift.
  const velocity = uikitReleaseVelocity(await readInputLog(page));
  expect(Math.abs(velocity / slowDragSpeed(dy) - 1)).toBeLessThan(
    driver.scriptedTimestamps ? 0.01 : 0.1,
  );
  const {result, samples, to} = await compareRelease(page, sheet, velocity);
  await writeEvidence(
    'curves/bottomsheet-settle',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {spring: springs.sheetDetent, velocity, samples, comparison: result},
        null,
        2,
      ),
    },
    testInfo,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.5,
  );
  expect(to).toBeCloseTo(halfTop - tallTop, 0);
});

for (const {name, speed, travel} of [
  // Released after a slow pull, below the speed that switches springs: the
  // critically damped spring, handed the finger's velocity.
  {name: 'a moderate throw', speed: 600, travel: 0.4},
  // Above sheet.release.fastSpeed: the 80 % damped spring.
  {name: 'a fast throw', speed: 1500, travel: 0.25},
]) {
  test(`${name} hands its velocity to the release spring`, async ({
    page,
  }, testInfo) => {
    const {driver, sheet, tallTop, halfTop, handle} = await openSheet(page);
    // A pull toward the half detent, then a constant-speed throw at `speed`
    // for the last 100 ms: it projects past halfway, so it lands there.
    const pull = Math.round((halfTop - tallTop) * travel);
    const throwDistance = (speed * 100) / 1000;
    const start = {x: handle.x, y: handle.y};
    const script = drag(
      start,
      {x: start.x, y: start.y + pull + throwDistance},
      {
        durationMs: 100 + (pull / throwDistance) * 100,
        hz: 120,
      },
    );
    expect(releaseVelocity(script).y).toBeCloseTo(speed, -1);
    await readInputLog(page, {clear: true});
    await driver.play(script);
    // What the page measured: `speed` in Chromium, whose input carries the
    // script's timestamps and sub-pixel positions; within 10 % in WebKit,
    // whose input carries real dispatch times and whole pixels.
    const velocity = uikitReleaseVelocity(await readInputLog(page));
    expect(Math.abs(velocity - speed) / speed).toBeLessThan(
      driver.scriptedTimestamps ? 0.01 : 0.1,
    );
    const {result, samples, from, to} = await compareRelease(
      page,
      sheet,
      velocity,
    );
    await writeEvidence(
      `curves/bottomsheet-release-${speed}`,
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {speed, velocity, from, to, samples, comparison: result},
          null,
          2,
        ),
      },
      testInfo,
    );
    expect(to).toBeCloseTo(halfTop - tallTop, 0);
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      0.5,
    );
    // The hand-off is what the curve shows: a spring started at rest would
    // trail it by several px within the first 16 ms.
    const atRest = uikitRelease(from, to, 0);
    const at16 = samples.find(s => s.t >= 16) ?? samples[1];
    expect(Math.abs(at16.value - atRest(at16.t))).toBeGreaterThan(3);
  });
}

test('a finger catches the settling sheet where it is', async ({page}) => {
  const {driver, sheet, tallTop, halfTop, handle} = await openSheet(page);
  const target = halfTop - tallTop;
  // A moderate throw toward the half detent; catch it ~100 ms into the settle.
  const pull = Math.round(target * 0.4);
  await driver.play(
    drag(handle, {x: handle.x, y: handle.y + pull + 60}, {durationMs: 200}),
  );
  await waitForAnimation(sheet, {minProgressMs: 90});
  // How far the settle moves in a frame right now, then where it is.
  const before = await sheetTop(sheet);
  await frames(page, 1);
  const caughtAt = await sheetTop(sheet);
  const perFrame = Math.abs(caughtAt - before);
  expect(caughtAt).toBeGreaterThan(tallTop + pull);
  expect(caughtAt).toBeLessThan(halfTop - 1);
  // Press where the handle is now, hold still for 150 ms, then pull up 40 px.
  const handleNow = {x: handle.x, y: caughtAt + 12};
  let pressed = NaN;
  let held = NaN;
  const tops: number[] = [];
  await driver.play(
    drag(
      handleNow,
      {x: handleNow.x, y: handleNow.y - 40},
      {durationMs: 200, holdMs: 150, hz: 60},
    ),
    {
      onEvent: async (step, index) => {
        if (index === 0) {
          await frames(page, 1);
          pressed = await sheetTop(sheet);
          await page.waitForTimeout(80);
          held = await sheetTop(sheet);
        } else if (step.type === 'touchMove') {
          await frames(page, 1);
          tops.push(await sheetTop(sheet));
        }
      },
    },
  );
  // Caught where it was: no jump at the press beyond the frame or two the
  // settle moved between the read and the press ...
  expect(Math.abs(pressed - caughtAt)).toBeLessThanOrEqual(2 * perFrame + 1);
  // ... and it stays there while the finger holds still,
  expect(Math.abs(held - pressed)).toBeLessThan(0.5);
  // then follows the pull.
  expect(tops[tops.length - 1]).toBeCloseTo(pressed - 40, -1);
});

test('the settle keeps advancing every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  const {driver, sheet, tallTop, halfTop, handle} = await openSheet(page);
  await markElement(sheet);
  const cast = await startScreencast(page);
  await driver.play(slowDragTo(handle, Math.round((halfTop - tallTop) * 0.66)));
  // The settle must be running (and composited) before the block: an
  // animation cannot start while the main thread is held.
  const [settle] = await waitForAnimation(sheet, {minProgressMs: 16});
  const block = await blockMainThread(page, 700);
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  // Judge the part of the block during which the settle still moves more
  // than the screencast resolves per frame. Chromium's frames resolve 1 px;
  // WebKit's 2 px, every ~11 ms, so its judging stops 10 px from the end,
  // where this spring (ω 18.3/s, so about 0.2 × the remaining distance a
  // frame) slows under 2 px a frame.
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, settle.to)},
    {settledWithin: browserName === 'webkit' ? 10 : 1},
  );
  await writeEvidence(
    'busy-main-thread/bottomsheet-settle',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          settle,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - block.from).toFixed(1),
            y: f.box?.y ?? null,
            h: f.box?.height ?? null,
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'bottomsheet-settle-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: Math.min(block.to, settle.to) + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({y: tracked.find(f => f.t === t)?.box?.y ?? -1}),
  });
  await film.write(testInfo, {block, settle});
  expect(proof.medianFrameMs).toBeLessThan(20);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.longestStallMs).toBeLessThan(40);
  expect(proof.monotonic).toBe(true);
});

test('the settle does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver, sheet, tallTop, halfTop, handle} = await openSheet(page);
  let settle = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await driver.play(
      slowDragTo(handle, Math.round((halfTop - tallTop) * 0.66)),
    );
    [settle] = await waitForAnimation(sheet);
    await waitForRest(sheet);
  });
  // The steady part of the settle: its first and last frames may commit.
  const during = countBetween(trace, settle.from + 50, settle.to - 50);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
  expect(trace.longTasks).toEqual([]);
});

test(
  'storyboard: drag to the half detent and settle',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, sheet, tallTop, halfTop, handle} = await openSheet(page);
    // Gate the page's timers from here on, so the settle's completion timer can
    // be held with its animation while the filmstrip is photographed.
    await installTimerGate(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: viewport.height};
    const dy = Math.round((halfTop - tallTop) * 0.66);
    const measure = async () => ({top: await sheetTop(sheet)});
    const dragBoard = await touchStoryboard(
      page,
      driver,
      drag(
        handle,
        {x: handle.x, y: handle.y + dy},
        {durationMs: 200, hz: 30, restMs: 150},
      ),
      {
        name: 'bottomsheet-drag-to-detent',
        clip,
        measure,
        columns: 5,
        cellScale: 0.4,
      },
    );
    await waitForAnimation(sheet);
    await freezeTimers(page);
    const {storyboard: settleBoard} = await animationStoryboard(page, {
      name: 'bottomsheet-settle',
      clip,
      scope: sheet,
      measure,
      columns: 7,
      cellScale: 0.4,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await dragBoard.write(testInfo);
    await settleBoard.write(testInfo);
    // The trace is the assertion; the sheets are the evidence.
    const dragTops = dragBoard.frames.map(f => f.data.top as number);
    expect(
      dragTops.every((top, i) => i === 0 || top >= dragTops[i - 1] - 0.5),
    ).toBe(true);
    const settleTops = settleBoard.frames.map(f => f.data.top as number);
    expect(
      settleTops.every((top, i) => i === 0 || top >= settleTops[i - 1] - 0.5),
    ).toBe(true);
    expect(settleTops.at(-1)).toBeCloseTo(halfTop, 0);
  },
);

test(
  'storyboard: a fast throw settles on the 80 % damped spring',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, sheet, tallTop, halfTop, handle} = await openSheet(page);
    await installTimerGate(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: viewport.height};
    const pull = Math.round((halfTop - tallTop) * 0.25);
    await driver.play(
      drag(
        handle,
        {x: handle.x, y: handle.y + pull + 150},
        {
          durationMs: 100 + (pull / 150) * 100,
          hz: 120,
        },
      ),
    );
    await waitForAnimation(sheet);
    await freezeTimers(page);
    const {storyboard} = await animationStoryboard(page, {
      name: 'bottomsheet-fast-throw-settle',
      clip,
      scope: sheet,
      measure: async () => ({top: await sheetTop(sheet)}),
      columns: 8,
      cellScale: 0.35,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await storyboard.write(testInfo);
    const tops = storyboard.frames.map(f => f.data.top as number);
    // An 80 % damped spring overshoots the detent (by ~1.5 % of the travel
    // for a release from rest; more with the throw's velocity), then settles.
    expect(Math.max(...tops)).toBeGreaterThan(halfTop + 0.5);
    expect(tops.at(-1)).toBeCloseTo(halfTop, 0);
  },
);
