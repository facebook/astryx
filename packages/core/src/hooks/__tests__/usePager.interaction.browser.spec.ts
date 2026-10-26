// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file usePager.interaction.browser.spec.ts
 * @input The pager and the paging math bundled with esbuild onto a fixture
 *   page (a 402 px viewport over five pages); real touch input (Chromium CDP
 *   with scripted timestamps, WebKit's input command); the interaction
 *   harness's curve sampling, screencast, busy-main-thread, trace and
 *   storyboard instruments; Chromium and WebKit on the phone profile
 * @output Proof that the pager pages like a UIKit paging scroll view on the
 *   compositor: a slow drag past half a page settles on the next page on
 *   UIKit's paging curve; a flick pages exactly one page and its settle starts
 *   from the release velocity; the end rubber-bands and returns; goTo plays
 *   setContentOffset(animated:)'s curve; a settle keeps advancing every frame
 *   through an 800 ms main-thread block; no Layout or Paint while it settles;
 *   storyboards of each motion with asserted traces
 * @position Browser proof for hooks/usePager.ts, run by `pnpm test:interaction`
 */

import {fileURLToPath} from 'node:url';
import {
  animationStoryboard,
  busyWindowProof,
  compareCurve,
  countBetween,
  curveOf,
  drag,
  flick,
  holdAnimations,
  markElement,
  path,
  releaseAnimations,
  sampleCurve,
  startScreencast,
  timeline,
  toTouchEvents,
  touchDriver,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  writeEvidence,
} from '@astryxdesign/interaction-harness';
import {expect, test, type Locator, type Page} from '@playwright/test';
import {build} from 'esbuild';
import type * as PagerBundle from './pagerBundle';

declare global {
  interface Window {
    Pager: typeof PagerBundle;
    pager: ReturnType<typeof PagerBundle.createPager>;
    pagerLog: string[];
    cancelledMoves: boolean[];
    /** Each move's position, and where the touch started (CSS px). */
    moves: [number, number][];
    touchStart: [number, number];
  }
}

let script = '';

test.beforeAll(async () => {
  const result = await build({
    entryPoints: [fileURLToPath(new URL('./pagerBundle.ts', import.meta.url))],
    bundle: true,
    write: false,
    format: 'iife',
    globalName: 'Pager',
    target: 'es2022',
  });
  script = result.outputFiles[0].text;
});

/** The phone profile's page width: one page. */
const PAGE = 402;
const COUNT = 5;
const TOP = 80;
const HEIGHT = 300;

async function open(
  page: Page,
  {rtl = false, startIndex = 1, tall = false} = {},
) {
  const pages = Array.from(
    {length: COUNT},
    (_, i) =>
      `<div class="page" style="background: hsl(${i * 70} 60% 70%)"><span>${i}</span></div>`,
  ).join('');
  const html = `<!doctype html><html dir="${rtl ? 'rtl' : 'ltr'}"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html, body { margin: 0; background: #fff; font: 600 48px system-ui; }
  #viewport { position: absolute; top: ${TOP}px; left: 0; width: ${PAGE}px; height: ${HEIGHT}px; overflow: hidden; }
  #track { display: flex; height: 100%; }
  .page { flex: 0 0 100%; height: 100%; display: grid; place-items: center; }
  ${tall ? 'body { height: 3000px; }' : ''}
</style>
<div id="viewport"><div id="track">${pages}</div></div>
<script>${script}</script>
<script>
  window.pagerLog = [];
  // Whether each move reached the page cancelled (read after every listener).
  window.cancelledMoves = [];
  window.moves = [];
  addEventListener('touchstart', e => { window.touchStart = [e.touches[0].clientX, e.touches[0].clientY]; }, {passive: true});
  addEventListener('touchmove', e => { window.cancelledMoves.push(e.defaultPrevented); window.moves.push([e.touches[0].clientX, e.touches[0].clientY]); }, {passive: true});
  window.pager = Pager.createPager({
    count: ${COUNT},
    defaultIndex: ${startIndex},
    // Notes whether the settle was already running on its curve when the
    // page was reported.
    onIndexChange: (i, reason) => window.pagerLog.push('index:' + i + ':' + reason +
      (document.getAnimations().some(a => a.playState === 'running' && a.startTime != null && a.currentTime > 20) ? ':moving' : '')),
    onSettle: (i, previous) => window.pagerLog.push('settle:' + i + ':' + previous),
  });
  window.pager.attach(document.getElementById('viewport'), document.getElementById('track'));
</script></html>`;
  await page.route('http://pager.test/', async route =>
    route.fulfill({contentType: 'text/html', body: html}),
  );
  await page.goto('http://pager.test/');
  return {
    track: page.locator('#track'),
    driver: await touchDriver(page),
  };
}

const log = async (page: Page) => page.evaluate(() => window.pagerLog);

/** The computed user-select (WebKit reports it only prefixed). */
const userSelectOf = (el: Element) => {
  const style = getComputedStyle(el) as CSSStyleDeclaration & {
    webkitUserSelect?: string;
  };
  return style.userSelect || (style.webkitUserSelect ?? '');
};

/** The track's presented x (from the `translate` the pager drives). */
const trackX = async (track: Locator) =>
  track.evaluate(el => {
    const value = getComputedStyle(el).translate;
    return value === 'none' ? 0 : parseFloat(value);
  });

/**
 * The pager's release velocity for a script: the shared tracker read as a
 * scroll view reads it (a pan's `scrollVelocity()`), x only.
 */
async function releaseVelocities(
  page: Page,
  steps: ReturnType<typeof toTouchEvents>,
) {
  return page.evaluate(events => {
    const tracker = new window.Pager.VelocityTracker();
    let current = 0;
    for (const event of events) {
      if (event.type === 'touchEnd' || event.type === 'touchCancel') {
        // Read at the lift's time, as the recognizer reads it (the
        // stillness reset).
        current = tracker.scrollVelocity(event.t).x;
        break;
      }
      const finger = event.changed[0];
      tracker.add(finger.x, finger.y, event.t);
      if (event.type === 'touchMove') {
        current = tracker.scrollVelocity(event.t).x;
      }
    }
    return {current};
  }, steps);
}

/**
 * A slow 300 px drag `degrees` up from leftward (300 px/s along it): at 35°
 * and 45° its horizontal part passes half a page, so the pager that takes it
 * settles on the next page.
 */
function angled(degrees: number) {
  const rad = (degrees * Math.PI) / 180;
  const from = {x: 340, y: TOP + HEIGHT / 2};
  return drag(
    from,
    {x: from.x - 300 * Math.cos(rad), y: from.y - 300 * Math.sin(rad)},
    {durationMs: 1000},
  );
}

for (const degrees of [35, 45]) {
  test(`in a scrolling page, a ${degrees}° drag is the pager's: it pages, its moves are cancelled from the pan's start at 10 pt, and the page stays at scrollY 0`, async ({
    page,
  }) => {
    const {track, driver} = await open(page, {tall: true});
    await driver.play(angled(degrees));
    await waitForRest(track);
    expect(await page.evaluate(() => window.pager.index)).toBe(2);
    const {cancelled, moves, start} = await page.evaluate(() => ({
      cancelled: window.cancelledMoves,
      moves: window.moves,
      start: window.touchStart,
    }));
    expect(cancelled.length).toBeGreaterThan(3);
    // Nothing is claimed before the pan begins at its 10 pt hysteresis; every
    // move from the first one past it is. (Chromium holds back moves inside
    // its own touch slop, so its first move may already be past 10 pt.)
    // Mobile Safari claims a slow drag for the page at about 10–11 px, so on
    // the iOS 26.2 simulator a drag steeper than about 27° scrolls the page
    // instead (25° pages, 30° and 35° scroll), where UIKit pages up to 45°.
    const past = moves.findIndex(
      ([x, y]) =>
        Math.max(Math.abs(x - start[0]), Math.abs(y - start[1])) >= 10,
    );
    expect(past).toBeGreaterThanOrEqual(0);
    expect(cancelled.slice(0, past).some(Boolean)).toBe(false);
    expect(cancelled.slice(past).every(Boolean)).toBe(true);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
}

test("in a scrolling page, a 50° drag is the page's: the page scrolls, the pager stays and no move is cancelled", async ({
  page,
  browserName,
}) => {
  const {track, driver} = await open(page, {tall: true});
  await driver.play(angled(50));
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.pager.index)).toBe(1);
  expect(await trackX(track)).toBeCloseTo(-PAGE, 1);
  expect((await page.evaluate(() => window.cancelledMoves)).some(Boolean)).toBe(
    false,
  );
  if (browserName === 'chromium') {
    // Injected touches scroll natively only in Chromium (harness README).
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  }
});

/** The track's settle as a curve of translateX samples (ms, px). */
async function heldSettle(page: Page, track: Locator) {
  await waitForAnimation(track);
  const held = await holdAnimations(page, track);
  expect(held.length).toBeGreaterThan(0);
  return curveOf(
    await sampleCurve(
      track,
      timeline(Math.max(...held.map(a => a.curveEndMs))),
    ),
    'translateX',
  );
}

/** solvePaging from `start` at `velocity` onto page 2, at 60 Hz. */
async function pagingOracle(page: Page, start: number, velocity: number) {
  return page.evaluate(
    ({from, v}) => {
      const curve = window.Pager.solvePaging({from, velocity: v, to: 804});
      return Array.from({length: 60}, (_, i) => curve.at(i / 60));
    },
    {from: start, v: velocity},
  );
}

const at = (oracle: number[], t: number) =>
  oracle[Math.min(oracle.length - 1, Math.round((t * 60) / 1000))];

test("a slow drag past half a page, well under the 225 px/s floor, settles on the next page from rest on UIKit's paging curve", async ({
  page,
}) => {
  const {track, driver} = await open(page);
  // 60 % of a page at 100 px/s, lifted while moving: under the floor in
  // either engine, so the settle starts at rest.
  await driver.play(
    drag(
      {x: 320, y: 200},
      {x: 320 - 0.6 * PAGE, y: 200},
      {durationMs: 2400, restMs: 0},
    ),
  );
  const samples = await heldSettle(page, track);
  expect(await page.evaluate(() => window.pager.index)).toBe(2);
  const oracle = await pagingOracle(page, -samples[0].value, 0);
  const result = compareCurve(samples, t => -at(oracle, t), 1);
  await writeEvidence(
    'pager/slow-drag-settle',
    {'curve.json': JSON.stringify({samples, result}, null, 2)},
    test.info(),
  );
  expect(result.maxError).toBeLessThan(1);
  await releaseAnimations(page);
  await waitForRest(track);
  expect(await trackX(track)).toBeCloseTo(-2 * PAGE, 0);
});

// UIKit keeps the release velocity through a silent rest (recorded, iOS
// 26.2: 600 pt/s, then no touch event for up to 397 ms before the lift kept
// 0.55 to 0.61 pt/ms). The shared release filter reads 0 after 40 ms of
// silence instead (spec:AST-100 FR2), and the pager reads the filter. A held
// finger sends no events here either.
test('a drag held still for 200 ms before the lift settles from rest: the release filter reads 0 after 40 ms of silence (spec:AST-100 FR2)', async ({
  page,
}) => {
  const {track, driver} = await open(page);
  // 60 % of a page at 600 px/s (far above the floor in either engine), then
  // held still for 200 ms.
  const script = drag(
    {x: 320, y: 200},
    {x: 320 - 0.6 * PAGE, y: 200},
    {durationMs: 402, restMs: 200},
  );
  const velocities = await releaseVelocities(page, toTouchEvents(script));
  expect(velocities.current).toBe(0);
  await driver.play(script);
  const samples = await heldSettle(page, track);
  expect(await page.evaluate(() => window.pager.index)).toBe(2);
  const rest = await pagingOracle(page, -samples[0].value, 0);
  const result = compareCurve(samples, t => -at(rest, t), 1);
  await writeEvidence(
    'pager/held-drag-settle',
    {'curve.json': JSON.stringify({samples, result}, null, 2)},
    test.info(),
  );
  expect(result.maxError).toBeLessThan(1);
  await releaseAnimations(page);
  await waitForRest(track);
  expect(await trackX(track)).toBeCloseTo(-2 * PAGE, 0);
});

test('callbacks: the new page once the settle is moving, the settle when the track rests', async ({
  page,
}) => {
  const {track, driver} = await open(page);
  // 60 % of a page at 600 px/s, lifted while moving.
  await driver.play(
    drag(
      {x: 320, y: 200},
      {x: 320 - 0.6 * PAGE, y: 200},
      {durationMs: 402, restMs: 0},
    ),
  );
  // Reported a couple of frames into the settle, so the owner's render of
  // the new page cannot hold up its hand-off to the compositor.
  await expect
    .poll(async () => (await log(page))[0])
    .toBe('index:2:drag:moving');
  await waitForRest(track);
  await page.waitForTimeout(50);
  expect(await log(page)).toEqual(['index:2:drag:moving', 'settle:2:1']);
});

test('a flick pages exactly one page, and the settle starts from the release velocity', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'WebKit sees real dispatch times, not the scripted ones the velocity oracle replays (harness README)',
  );
  const {track, driver} = await open(page);
  const throwScript = flick(
    {x: 320, y: 200},
    {velocity: {x: -1500, y: 0}, durationMs: 80, hz: 120},
  );
  const velocities = await releaseVelocities(page, toTouchEvents(throwScript));
  await driver.play(throwScript);
  await waitForAnimation(track);
  expect(await page.evaluate(() => window.pager.index)).toBe(2);
  const held = await holdAnimations(page, track);
  const samples = curveOf(
    await sampleCurve(
      track,
      timeline(Math.max(...held.map(a => a.curveEndMs))),
    ),
    'translateX',
  );
  const from = -samples[0].value;
  const oracle = await page.evaluate(
    ({start, current}) => {
      // The pan's x velocity is the finger's; the content moves the other way.
      const settle = window.Pager.pagingSettleVelocity(-current);
      const curve = window.Pager.solvePaging({
        from: start,
        velocity: settle,
        to: 804,
      });
      return {
        settle,
        values: Array.from({length: 60}, (_, i) => curve.at(i / 60)),
      };
    },
    {start: from, ...velocities},
  );
  expect(oracle.settle).toBeGreaterThan(900);
  const result = compareCurve(
    samples,
    t => -oracle.values[Math.min(59, Math.round((t * 60) / 1000))],
    1.5,
  );
  await writeEvidence(
    'pager/flick-settle',
    {
      'curve.json': JSON.stringify(
        {samples, settle: oracle.settle, result},
        null,
        2,
      ),
    },
    test.info(),
  );
  expect(result.maxError).toBeLessThan(1.5);
  await releaseAnimations(page);
  await waitForRest(track);
  // One page, however hard the throw.
  expect(await trackX(track)).toBeCloseTo(-2 * PAGE, 0);
});

test('past the first page the track rubber-bands with d = the page width, then returns', async ({
  page,
}) => {
  const {track, driver} = await open(page, {startIndex: 0});
  const finger = 290;
  let shown = NaN;
  const moves = toTouchEvents(
    drag(
      {x: 60, y: 200},
      {x: 60 + finger + 10, y: 200},
      {durationMs: 600, restMs: 120},
    ),
  ).filter(e => e.type === 'touchMove').length;
  let seen = 0;
  await driver.play(
    drag(
      {x: 60, y: 200},
      {x: 60 + finger + 10, y: 200},
      {durationMs: 600, restMs: 120},
    ),
    {
      onEvent: async step => {
        if (step.type === 'touchMove' && ++seen === moves) {
          await page.evaluate(
            async () =>
              new Promise(r =>
                requestAnimationFrame(() => requestAnimationFrame(r)),
              ),
          );
          shown = await trackX(track);
        }
      },
    },
  );
  const expected = await page.evaluate(
    f => window.Pager.rubberBand(f, 402),
    finger,
  );
  // 10 px of the finger went to the pan's threshold.
  expect(shown).toBeGreaterThan(expected - 3);
  expect(shown).toBeLessThan(expected + 3);
  await waitForRest(track);
  expect(await trackX(track)).toBeCloseTo(0, 0);
  expect(await log(page)).toEqual(['settle:0:0']);
});

// spec:AST-094 FR37: a release whose velocity points back toward the start
// cancels, whatever the travel (UIKit takes the nearest page).
test('a drag 70 % of the way to the next page that turns back and lifts while moving back settles on its start page', async ({
  page,
}) => {
  const {track, driver} = await open(page);
  const x0 = 320;
  // Forward 70 % of a page, then back 30 px in the last 180 ms, lifted
  // while moving back.
  await driver.play(
    path(
      p =>
        p <= 0.85
          ? {x: x0 - (0.7 * PAGE * p) / 0.85, y: 200}
          : {x: x0 - 0.7 * PAGE + (30 * (p - 0.85)) / 0.15, y: 200},
      {durationMs: 1200, restMs: 0},
    ),
  );
  await releaseAnimations(page);
  await waitForRest(track);
  expect(await page.evaluate(() => window.pager.index)).toBe(1);
  expect(await trackX(track)).toBeCloseTo(-PAGE, 0);
  expect(await log(page)).toEqual(['settle:1:1']);
});

// spec:AST-094 FR6: a new target keeps the current velocity.
test('a goTo that retargets a running goTo keeps its velocity: the new curve starts at the speed the old one had', async ({
  page,
}) => {
  const {track} = await open(page, {startIndex: 0});
  await page.evaluate(() => window.pager.goTo(3));
  await waitForAnimation(track);
  const {before, after} = await page.evaluate(async () => {
    const el = document.getElementById('track') as HTMLElement;
    // The keyframes' slope at `time` (ms into the animation), px/s: the
    // animator plays a curve as linear segments between samples.
    const slope = (animation: Animation, time: number) => {
      const effect = animation.effect as KeyframeEffect;
      const frames = effect.getKeyframes();
      const duration = Number(effect.getComputedTiming().duration);
      const at = Math.min(Math.max(time / duration, 0), 1);
      for (let i = 1; i < frames.length; i++) {
        const a = frames[i - 1];
        const b = frames[i];
        if (at <= b.computedOffset || i === frames.length - 1) {
          const span = (b.computedOffset - a.computedOffset) * duration;
          return span > 0
            ? ((parseFloat(String(b.translate)) -
                parseFloat(String(a.translate))) /
                span) *
                1000
            : 0;
        }
      }
      return 0;
    };
    const running = el.getAnimations()[0];
    await new Promise<void>(resolve => {
      const tick = () => {
        if (Number(running.currentTime) > 90) {
          resolve();
        } else {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    });
    const speed = slope(running, Number(running.currentTime));
    window.pager.goTo(4);
    const next = el.getAnimations().find(a => a !== running);
    return {before: speed, after: next ? slope(next, 0) : Number.NaN};
  });
  expect(Math.abs(before)).toBeGreaterThan(1000);
  expect(after / before).toBeGreaterThan(0.85);
  expect(after / before).toBeLessThan(1.15);
  await waitForRest(track);
  expect(await trackX(track)).toBeCloseTo(-4 * PAGE, 0);
});

test('goTo plays setContentOffset(animated:): 0.3 s on a sinusoidal ease', async ({
  page,
}) => {
  const {track} = await open(page, {startIndex: 0});
  await page.evaluate(() => window.pager.goTo(3));
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
    t => (-3 * PAGE * (1 - Math.cos(Math.PI * Math.min(1, t / 300)))) / 2,
    0.5,
  );
  expect(result.maxError).toBeLessThan(0.5);
  await releaseAnimations(page);
  expect(await log(page)).toEqual(['index:3:goTo']);
});

/**
 * At most a jump: `property` holds its start value, then its end value, and
 * never one in between (design:reduced-motion DR1; a cross-fade moves the
 * track at the bottom of its dip).
 */
const holdsOrJumps = (
  keyframes: ReadonlyArray<Record<string, unknown>>,
  property: string,
): boolean => {
  const values = new Set<string>();
  for (const k of keyframes) {
    const v = k[property];
    if (typeof v === 'string' || typeof v === 'number') {
      values.add(String(v));
    }
  }
  return values.size <= 2;
};

test('under Reduce Motion the settle and goTo do not travel: an opacity cross-fade of at most 200 ms on a coarse pointer (design:reduced-motion DR2)', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {track, driver} = await open(page);
  expect(
    await page.evaluate(() => ({
      reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
      coarse: matchMedia('(pointer: coarse)').matches,
    })),
  ).toEqual({reduce: true, coarse: true});
  const crossFadesOnly = (
    animations: Awaited<ReturnType<typeof holdAnimations>>,
  ) => {
    expect(animations.length).toBeGreaterThan(0);
    for (const a of animations) {
      // Nothing travels: the track holds, then jumps under the fade (DR1).
      expect(holdsOrJumps(a.keyframes, 'translate')).toBe(true);
      expect(holdsOrJumps(a.keyframes, 'transform')).toBe(true);
      expect(a.curveEndMs).toBeLessThanOrEqual(200);
    }
  };
  // The drag follows the finger; after the lift the settle cross-fades.
  await driver.play(
    flick({x: 320, y: 200}, {velocity: {x: -1500, y: 0}, durationMs: 80}),
  );
  await waitForAnimation(track);
  crossFadesOnly(await holdAnimations(page, track));
  await releaseAnimations(page);
  await expect
    .poll(async () => page.evaluate(() => window.pager.isSettling))
    .toBe(false);
  expect(await page.evaluate(() => window.pager.index)).toBe(2);
  // goTo cross-fades too.
  await page.evaluate(() => window.pager.goTo(4));
  await waitForAnimation(track);
  crossFadesOnly(await holdAnimations(page, track));
  await releaseAnimations(page);
  await expect
    .poll(async () => page.evaluate(() => window.pager.isSettling))
    .toBe(false);
  expect(await page.evaluate(() => window.pager.index)).toBe(4);
});

test(`a still finger catches a settle ${85} ms after it lands, selects no text, and the lift settles on the nearest page`, async ({
  page,
}) => {
  const {track, driver} = await open(page, {startIndex: 0});
  await page.evaluate(() => window.pager.goTo(3));
  await waitForAnimation(track);
  const reads: {x: number; userSelect: string}[] = [];
  let step = 0;
  await driver.play(
    // A finger held still for 600 ms (a 0.6 px creep, reported every 100 ms).
    drag({x: 200, y: 200}, {x: 200.6, y: 200}, {durationMs: 600, hz: 10}),
    {
      onEvent: async event => {
        if (event.type === 'touchMove' && (step++ === 2 || step === 5)) {
          reads.push(
            await track.evaluate(el => ({
              x: parseFloat(getComputedStyle(el).translate) || 0,
              // WebKit reports user-select only prefixed.
              userSelect:
                getComputedStyle(el).userSelect ||
                ((
                  getComputedStyle(el) as CSSStyleDeclaration & {
                    webkitUserSelect?: string;
                  }
                ).webkitUserSelect ??
                  ''),
            })),
          );
        }
      },
    },
  );
  // Held: the same place at 300 and 600 ms, short of page 3, no selection.
  expect(reads).toHaveLength(2);
  expect(reads[1].x).toBeCloseTo(reads[0].x, 1);
  expect(reads[0].x).toBeGreaterThan(-3 * PAGE);
  expect(reads[0].x).toBeLessThan(0);
  expect(reads[0].userSelect).toBe('none');
  // The lift settles on the page nearest to where it was held.
  const nearest = Math.round(-reads[1].x / PAGE);
  await waitForRest(track);
  expect(await trackX(track)).toBeCloseTo(-nearest * PAGE, 0);
  expect(await track.evaluate(userSelectOf)).not.toBe('none');
});

test('a settle keeps advancing every frame through an 800 ms main-thread block', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    "WebKit's screencast clock is not the page's (frames arrive ~100 ms off), so a 0.3 s motion cannot be placed inside the block; the animator's own WebKit proof covers compositor playback, and Mobile Safari on the iOS simulator is this proof's WebKit evidence",
  );
  await open(page, {startIndex: 0});
  const marker = page.locator('.page').nth(1);
  await markElement(marker, {inset: 8});
  const cast = await startScreencast(page);
  // Let the screencast deliver a few frames before anything moves.
  await page.waitForTimeout(300);
  // A goTo of one page (0.3 s whatever the distance), and an 800 ms block
  // scheduled from the page 90 ms in: WebKit hands a new animation to its
  // compositor two or three rendering updates after it starts (animator.ts,
  // known limits), and a harness round trip would eat most of the motion.
  const started = await page.evaluate(() => {
    window.pager.goTo(1);
    setTimeout(() => {
      const from = performance.timeOrigin + performance.now();
      const end = performance.now() + 800;
      let spins = 0;
      while (performance.now() < end) {
        spins += 1;
      }
      (window as unknown as {busy: unknown}).busy = {
        from,
        to: performance.timeOrigin + performance.now(),
        spins,
      };
    }, 90);
    return performance.timeOrigin + performance.now();
  });
  await page.waitForTimeout(1200);
  const busy = await page.evaluate(
    () =>
      (window as unknown as {busy: {from: number; to: number; spins: number}})
        .busy,
  );
  const tracked = await trackMarker(page, await cast.stop());
  // Judge the part of the block the motion spans: it ends about 0.3 s after
  // the call (a frame later when it starts at the next commit).
  const spanned = {...busy, to: Math.min(busy.to, started + 300)};
  test.info().annotations.push({
    type: 'marker x per frame (ms from the call)',
    description: JSON.stringify(
      tracked.map(f => [Math.round(f.t - started), f.box?.x ?? null]),
    ),
  });
  expect(spanned.to - spanned.from).toBeGreaterThan(150);
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
  // And it lands while the thread is still blocked, and holds its end state
  // (page 1's marker at its inset from the viewport's left edge).
  const late = tracked.filter(
    f => f.box != null && f.t > started + 340 && f.t < busy.to,
  );
  expect(late.length).toBeGreaterThan(0);
  for (const frame of late) {
    expect(Math.abs((frame.box?.x ?? 0) - 8)).toBeLessThan(1.5);
  }
});

test('no Layout or Paint while it settles', async ({page, browserName}) => {
  test.skip(
    browserName === 'webkit',
    'Playwright exposes no rendering trace for WebKit',
  );
  const {track} = await open(page, {startIndex: 0});
  let started = 0;
  const trace = await traceRendering(page, async () => {
    started = await page.evaluate(() => {
      window.pager.goTo(2);
      return performance.timeOrigin + performance.now();
    });
    await waitForAnimation(track);
    await page.waitForTimeout(400);
  });
  // The steady part of the 0.3 s motion: its first and last frames may commit.
  const during = countBetween(trace, started + 60, started + 240);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
  expect(trace.longTasks).toEqual([]);
});

for (const [name, run] of [
  [
    'release-at-rest',
    async (page: Page, driver: Awaited<ReturnType<typeof touchDriver>>) =>
      driver.play(
        drag(
          {x: 320, y: 200},
          {x: 320 - 0.6 * PAGE, y: 200},
          {durationMs: 1000, restMs: 120},
        ),
      ),
  ],
  [
    'flick',
    async (page: Page, driver: Awaited<ReturnType<typeof touchDriver>>) =>
      driver.play(
        flick(
          {x: 320, y: 200},
          {velocity: {x: -1500, y: 0}, durationMs: 80, hz: 120},
        ),
      ),
  ],
  [
    'return-to-page',
    async (page: Page, driver: Awaited<ReturnType<typeof touchDriver>>) =>
      driver.play(
        drag(
          {x: 320, y: 200},
          {x: 320 - 0.3 * PAGE, y: 200},
          {durationMs: 1000, restMs: 120},
        ),
      ),
  ],
  [
    'goto',
    async (page: Page) => {
      await page.evaluate(() => window.pager.goTo(3));
    },
  ],
] as const) {
  test(`storyboard: ${name} @storyboard`, async ({page}) => {
    const {track, driver} = await open(page);
    await run(page, driver);
    await waitForAnimation(track);
    const {storyboard} = await animationStoryboard(page, {
      name: `pager-${name}`,
      scope: track,
      clip: {x: 0, y: TOP, width: PAGE, height: HEIGHT},
      measure: async () => ({x: await trackX(track)}),
    });
    await storyboard.write(test.info());
    const xs = storyboard.frames.map(f => (f.data as {x: number}).x);
    // Monotonic toward its page, landing on it (the last frame is half a
    // millisecond inside the curve's end, within the last step).
    const end = xs[xs.length - 1];
    const off = Math.abs(end % PAGE);
    expect(Math.min(off, PAGE - off)).toBeLessThan(1.5);
    for (let i = 1; i < xs.length; i++) {
      expect(
        Math.sign(xs[i] - xs[i - 1]) * Math.sign(end - xs[0]),
      ).toBeGreaterThanOrEqual(0);
    }
    await releaseAnimations(page);
  });
}
