// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxZoom.interaction.browser.spec.ts
 * @input The built "With zoom" Lightbox story on the phone project, its
 *   photo served as a 3000 × 2000 test image, real touch input (Chromium CDP
 *   / WebKit's input command) and the interaction harness
 * @output Interaction and animation proofs for Lightbox's zoom stage against
 *   UIKit's measured zooming (motion/uikit/zoomMedia.ts): a pinch keeps the
 *   photo point under the fingers and leaves the page unzoomed, while a
 *   pinch on the controls still zooms the page; past the limits the zoom
 *   gives way by UIKit's law and returns on its eased curve; Photos'
 *   aspect-fill double tap and the return; a zoomed pan tracks, rubber-bands
 *   at the edges and coasts; a tap beside the photo closes; the settle keeps
 *   moving through a blocked main thread with no Layout or Paint per frame;
 *   the zoomed photo is redrawn sharp; storyboards of the pinch and the
 *   double tap
 * @position Interaction tests for Lightbox (browser); the shape follows
 *   BottomSheet/__tests__/BottomSheetDetent.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  compareCurve,
  countBetween,
  cubicBezier,
  curveOf,
  drag,
  flick,
  frames,
  freezeTimers,
  holdAnimations,
  installLongTaskLog,
  installTimerGate,
  markElement,
  openStory,
  PARTIAL_LIFT_SKIP,
  pinch,
  readLongTasks,
  releaseAnimations,
  sampleCurve,
  startScreencast,
  timeline,
  touchDriver,
  touchStoryboard,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type TouchDriver,
  type TouchFrame,
  type TouchScript,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

// UIKit's measured zoom (motion/uikit/zoomMedia.ts), restated so a change to
// the table has to be made here too.
const EASE_IN_OUT = cubicBezier(0.42, 0, 0.58, 1);
const settleMs = (from: number, to: number) =>
  Math.min(400, 100 + 300 * Math.abs(Math.log(to / from)));

/**
 * A test photo: a checkerboard of 50 px squares (sharp edges to judge the
 * redraw) with a red disc at its centre. SVG, so it has an intrinsic size and
 * draws its edges at any zoom; the squares are drawn one by one, since a
 * `<pattern>` goes through a tile image whose seams some engines blur.
 */
function photoSvg(width: number, height: number): string {
  let squares = '';
  for (let y = 0; y < height; y += 50) {
    for (let x = 0; x < width; x += 50) {
      if ((x + y) % 100 === 0) {
        squares += `<rect x="${x}" y="${y}" width="50" height="50"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges"><rect width="${width}" height="${height}" fill="#fff"/><g fill="#000">${squares}</g><circle cx="${width / 2}" cy="${height / 2}" r="${height / 8}" fill="#d22"/></svg>`;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PhotoState {
  /** The stage, in page coordinates. */
  stage: Box;
  /** The photo's fitted box, in stage coordinates. */
  fit: Box;
  /** The zoom stage's transform: offset from the fitted box, and scale. */
  x: number;
  y: number;
  scale: number;
}

interface OpenViewer {
  driver: TouchDriver;
  dialog: Locator;
  stage: Locator;
  photo: Locator;
  state: () => Promise<PhotoState>;
}

// A plain evaluate (no auto-wait): it must work mid-animation.
async function readState(photo: Locator): Promise<PhotoState> {
  return photo.evaluate(element => {
    const img = element as HTMLImageElement;
    const stage = img.parentElement as HTMLElement;
    const rect = stage.getBoundingClientRect();
    const style = getComputedStyle(img);
    const [tx = '0px', ty = '0px'] =
      style.translate === 'none' ? [] : style.translate.split(' ');
    const scale = style.scale === 'none' ? 1 : parseFloat(style.scale);
    return {
      stage: {
        x: rect.left + stage.clientLeft,
        y: rect.top + stage.clientTop,
        width: stage.clientWidth,
        height: stage.clientHeight,
      },
      fit: {
        x: img.offsetLeft,
        y: img.offsetTop,
        width: img.offsetWidth,
        height: img.offsetHeight,
      },
      x: parseFloat(tx),
      y: parseFloat(ty),
      scale,
    };
  });
}

/** The fitted-photo point shown under the page point `at`. */
function photoPointAt(state: PhotoState, at: {x: number; y: number}) {
  return {
    u: (at.x - state.stage.x - state.fit.x - state.x) / state.scale,
    v: (at.y - state.stage.y - state.fit.y - state.y) / state.scale,
  };
}

/** Where the fitted-photo point (u, v) shows, in page coordinates. */
function pagePointOf(state: PhotoState, u: number, v: number) {
  return {
    x: state.stage.x + state.fit.x + state.x + u * state.scale,
    y: state.stage.y + state.fit.y + state.y + v * state.scale,
  };
}

async function openViewer(
  page: Page,
  photo: {width: number; height: number} = {width: 3000, height: 2000},
): Promise<OpenViewer> {
  await installLongTaskLog(page);
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: photoSvg(photo.width, photo.height),
    }),
  );
  await openStory(page, storybook(), 'core-lightbox--with-zoom');
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: 'Open with zoom'});
  const box = await trigger.boundingBox();
  if (box == null) {
    throw new Error('no trigger');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  const dialog = page.getByRole('dialog', {name: 'Forest path'});
  await expect(dialog).toBeVisible();
  const stage = dialog.getByRole('button', {name: 'Zoom'});
  const img = dialog.getByRole('img', {name: 'Forest path'});
  await expect
    .poll(async () => img.evaluate(el => (el as HTMLImageElement).naturalWidth))
    .toBe(photo.width);
  await frames(page, 2);
  return {
    driver,
    dialog,
    stage,
    photo: img,
    state: async () => readState(img),
  };
}

function doubleTap(at: {x: number; y: number}): TouchScript {
  return [
    {t: 0, fingers: [{id: 0, ...at}]},
    {t: 50, fingers: []},
    {t: 170, fingers: [{id: 0, ...at}]},
    {t: 220, fingers: []},
  ];
}

const pageScale = async (page: Page) =>
  page.evaluate(() => window.visualViewport?.scale ?? 1);

test('the stage fills the phone screen and fits the photo', async ({page}) => {
  const {state} = await openViewer(page);
  const s = await state();
  const viewport = page.viewportSize() ?? {width: 0, height: 0};
  expect(s.stage.width).toBe(viewport.width);
  expect(s.stage.height).toBe(viewport.height);
  expect(s.fit.width).toBe(viewport.width);
  expect(s.fit.height).toBeCloseTo((viewport.width * 2000) / 3000, 0);
  expect(s.fit.y).toBeCloseTo((viewport.height - s.fit.height) / 2, 0);
  expect([s.x, s.y, s.scale]).toEqual([0, 0, 1]);
});

test('a pinch keeps the photo point under the fingers, and the page does not zoom', async ({
  page,
}) => {
  const {driver, state} = await openViewer(page);
  const before = await state();
  const centre = {x: 150, y: before.stage.y + before.stage.height / 2 + 30};
  // The photo point under the centroid when the pinch begins (past its 8 px
  // threshold the fingers have already moved a little).
  let anchor: {u: number; v: number} | null = null;
  // Spread and move: the centroid travels 40 px right and 20 px up.
  const spread = pinch({
    center: centre,
    fromDistance: 80,
    toDistance: 260,
    durationMs: 400,
  });
  const moved: TouchScript = spread.map(frame => {
    const p = Math.min(1, frame.t / 400);
    return {
      t: frame.t,
      fingers: frame.fingers.map(f => ({
        ...f,
        x: f.x + 40 * p,
        y: f.y - 20 * p,
      })),
    };
  });
  const errors: number[] = [];
  const scales: number[] = [];
  let moves = 0;
  // The centroid of the touches the page received (the engine may round a
  // scripted position), which is what the stage follows.
  await page.evaluate(() => {
    document.addEventListener(
      'touchmove',
      event => {
        (window as unknown as {__touches: {x: number; y: number}[]}).__touches =
          [...event.touches].map(touch => ({
            x: touch.clientX,
            y: touch.clientY,
          }));
      },
      {capture: true, passive: true},
    );
  });
  await driver.play(moved, {
    onEvent: async step => {
      if (step.type !== 'touchMove' || step.fingers.length < 2) {
        return;
      }
      moves++;
      const s = await state();
      const received = await page.evaluate(
        () =>
          (window as unknown as {__touches?: {x: number; y: number}[]})
            .__touches ?? [],
      );
      const centroid =
        received.length === 2
          ? {
              x: (received[0].x + received[1].x) / 2,
              y: (received[0].y + received[1].y) / 2,
            }
          : {
              x: (step.fingers[0].x + step.fingers[1].x) / 2,
              y: (step.fingers[0].y + step.fingers[1].y) / 2,
            };
      if (anchor == null) {
        if (s.scale !== 1) {
          anchor = photoPointAt(s, centroid);
        }
        return;
      }
      const shown = pagePointOf(s, anchor.u, anchor.v);
      errors.push(Math.hypot(shown.x - centroid.x, shown.y - centroid.y));
      scales.push(s.scale);
    },
  });
  expect(moves).toBeGreaterThan(10);
  expect(errors.length).toBeGreaterThan(5);
  // UIKit keeps the point within 1 pt; one event of lag is allowed here.
  expect(Math.max(...errors), JSON.stringify(errors)).toBeLessThan(2);
  // The zoom grew with the fingers and kept no momentum after the lift.
  expect(scales.every((s, i) => i === 0 || s >= scales[i - 1] - 0.001)).toBe(
    true,
  );
  await frames(page, 3);
  const lifted = await state();
  await page.waitForTimeout(300);
  const later = await state();
  expect(later.scale).toBeCloseTo(lifted.scale, 3);
  expect(later.scale).toBeGreaterThan(2.5);
  expect(await pageScale(page)).toBe(1);
});

test('a pinch on the controls still zooms the page', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'native pinch-zoom from scripted touches is Chromium-only',
  );
  const {driver, dialog} = await openViewer(page);
  const close = dialog.getByRole('button', {name: 'Close'});
  const box = await close.boundingBox();
  if (box == null) {
    throw new Error('no close button');
  }
  await driver.play(
    pinch({
      center: {x: box.x + box.width / 2, y: box.y + box.height / 2},
      fromDistance: 30,
      toDistance: 200,
      durationMs: 400,
    }),
  );
  await expect.poll(async () => pageScale(page)).toBeGreaterThan(1.5);
});

test('past the minimum the zoom gives way, then returns on the eased curve', async ({
  page,
}, testInfo) => {
  const {driver, photo, state} = await openViewer(page);
  const before = await state();
  const centre = {x: 201, y: before.stage.y + before.stage.height / 2};
  let shown = 1;
  let pinchScale = 1;
  await driver.play(
    pinch({
      center: centre,
      fromDistance: 300,
      toDistance: 100,
      durationMs: 300,
      restMs: 100,
    }),
    {
      onEvent: async step => {
        if (step.type === 'touchMove' && step.fingers.length === 2) {
          shown = (await state()).scale;
          pinchScale = Math.abs(step.fingers[1].x - step.fingers[0].x);
        }
      },
    },
  );
  // The recognizer's scale is relative to the span when the pinch began
  // (past its 8 px hysteresis); UIKit's law maps it to the shown zoom.
  const recognizerScale = pinchScale / (300 - 8);
  expect(shown).toBeCloseTo(1 / (2 - recognizerScale), 2);
  const [settle] = await waitForAnimation(photo);
  const held = await holdAnimations(page, photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const samples = curveOf(
    await sampleCurve(photo, timeline(duration)),
    'scaleX',
  );
  await releaseAnimations(page);
  const from = samples[0].value;
  const expectedMs = settleMs(from, 1);
  const expected = (t: number) =>
    from + (1 - from) * EASE_IN_OUT(Math.min(1, t / expectedMs));
  const result = compareCurve(samples, expected, 0.003);
  await writeEvidence(
    'curves/lightbox-zoom-past-minimum',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {settle, held, samples, result},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(from).toBeCloseTo(shown, 2);
  expect(duration).toBeGreaterThanOrEqual(expectedMs - 1);
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.003,
  );
  await waitForRest(photo);
  const rest = await state();
  expect([rest.x, rest.y, rest.scale]).toEqual([0, 0, 1]);
});

test("past the maximum the zoom gives way by UIKit's law and settles about the last centroid", async ({
  page,
}) => {
  // A 600 × 400 photo on a 3× phone: its maximum is low (6 × the zoom that
  // shows its pixels 1:1 is 2.985, above the aspect-fill zoom), so one pinch
  // passes it.
  const {driver, photo, state} = await openViewer(page, {
    width: 600,
    height: 400,
  });
  const before = await state();
  const dpr = await page.evaluate(() => window.devicePixelRatio);
  const max = Math.max(
    before.stage.height / before.fit.height,
    (6 * 600) / (before.fit.width * dpr),
  );
  const centre = {x: 220, y: before.stage.y + before.stage.height / 2};
  let last = before;
  let span = 0;
  await driver.play(
    pinch({
      center: centre,
      fromDistance: 70,
      toDistance: 330,
      durationMs: 400,
      restMs: 100,
    }),
    {
      onEvent: async step => {
        if (step.type === 'touchMove' && step.fingers.length === 2) {
          last = await state();
          span = Math.abs(step.fingers[1].x - step.fingers[0].x);
        }
      },
    },
  );
  const recognizerScale = span / (70 + 8);
  expect(recognizerScale).toBeGreaterThan(max);
  expect(last.scale).toBeCloseTo(max * (2 - max / recognizerScale), 2);
  // The photo point under the last centroid stays there through the settle.
  const anchor = photoPointAt(last, centre);
  await waitForAnimation(photo);
  await waitForRest(photo);
  const rest = await state();
  expect(rest.scale).toBeCloseTo(max, 3);
  const shown = pagePointOf(rest, anchor.u, anchor.v);
  // Unless the stage's edge stopped it (it keeps the photo inside).
  const clampedX =
    rest.x === 0 ||
    Math.abs(rest.x - (rest.stage.width - rest.fit.width * rest.scale)) < 0.5;
  if (!clampedX) {
    expect(shown.x).toBeCloseTo(centre.x, 0);
  }
  expect(await pageScale(page)).toBe(1);
});

test('a double tap zooms until the photo fills the screen, the tapped point to the centre', async ({
  page,
}, testInfo) => {
  const {driver, photo, stage, state} = await openViewer(page);
  const before = await state();
  const at = {x: 120, y: before.stage.y + before.stage.height / 2};
  const tapped = photoPointAt(before, at);
  await driver.play(doubleTap(at));
  const [zoom] = await waitForAnimation(photo);
  const held = await holdAnimations(page, photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const samples = curveOf(
    await sampleCurve(photo, timeline(duration)),
    'scaleX',
  );
  await releaseAnimations(page);
  const fill = before.stage.height / before.fit.height;
  const expectedMs = settleMs(1, fill);
  const expected = (t: number) =>
    1 + (fill - 1) * EASE_IN_OUT(Math.min(1, t / expectedMs));
  const result = compareCurve(samples, expected, 0.005);
  await writeEvidence(
    'curves/lightbox-double-tap-zoom',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {zoom, held, samples, result},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.005,
  );
  await waitForRest(photo);
  const zoomed = await state();
  expect(zoomed.scale).toBeCloseTo(fill, 3);
  const shown = pagePointOf(zoomed, tapped.u, tapped.v);
  expect(shown.x).toBeCloseTo(zoomed.stage.x + zoomed.stage.width / 2, 0);
  expect(zoomed.fit.y + zoomed.y).toBeCloseTo(0, 0);
  await expect(stage).toHaveAttribute('aria-pressed', 'true');
  // Again: back to the fitted size.
  await driver.play(doubleTap({x: 300, y: at.y}));
  await waitForAnimation(photo);
  await waitForRest(photo);
  const fitted = await state();
  expect([fitted.x, fitted.y, fitted.scale]).toEqual([0, 0, 1]);
  await expect(stage).toHaveAttribute('aria-pressed', 'false');
});

test('a double tap near the edge stops at the edge', async ({page}) => {
  const {driver, photo, state} = await openViewer(page);
  const before = await state();
  await driver.play(
    doubleTap({x: 12, y: before.stage.y + before.stage.height / 2}),
  );
  await waitForAnimation(photo);
  await waitForRest(photo);
  const zoomed = await state();
  expect(zoomed.fit.x + zoomed.x).toBeCloseTo(0, 1);
});

test('a zoomed pan tracks the finger, rubber-bands past the edge and returns', async ({
  page,
}) => {
  const {driver, photo, state} = await openViewer(page);
  const before = await state();
  const mid = {x: 201, y: before.stage.y + before.stage.height / 2};
  await driver.play(doubleTap(mid));
  await waitForAnimation(photo);
  await waitForRest(photo);
  const zoomed = await state();
  // Room to the left edge: the photo's left edge is this far off screen.
  const room = -(zoomed.fit.x + zoomed.x);
  const overshoot = 120;
  const xs: number[] = [];
  await driver.play(
    drag(
      mid,
      {x: mid.x + room + overshoot + 10, y: mid.y},
      {durationMs: 500, restMs: 150},
    ),
    {
      onEvent: async step => {
        if (step.type === 'touchMove') {
          xs.push((await state()).x);
        }
      },
    },
  );
  // 1:1 until the edge (after the 10 px hysteresis), then UIScrollView's
  // rubber band over the stage width: (1 − 1 ÷ (x·0.55 ÷ d + 1))·d.
  const d = zoomed.stage.width;
  const banded = (1 - 1 / ((overshoot * 0.55) / d + 1)) * d;
  expect(xs.at(-1)).toBeCloseTo(zoomed.x + room + banded, 0);
  await waitForRest(photo);
  const back = await state();
  expect(back.fit.x + back.x).toBeCloseTo(0, 1);
  expect(back.scale).toBeCloseTo(zoomed.scale, 6);
});

test('a zoomed flick coasts and stops at the far edge', async ({page}) => {
  const {driver, photo, state} = await openViewer(page);
  const before = await state();
  const mid = {x: 201, y: before.stage.y + before.stage.height / 2};
  await driver.play(doubleTap(mid));
  await waitForAnimation(photo);
  await waitForRest(photo);
  const zoomed = await state();
  const script = flick(mid, {
    velocity: {x: -1500, y: 0},
    durationMs: 80,
    hz: 120,
  });
  let released = zoomed;
  await driver.play(script, {
    onEvent: async step => {
      if (step.type === 'touchMove') {
        released = await state();
      }
    },
  });
  await frames(page, 6);
  const coasting = await state();
  // The photo kept moving after the lift.
  expect(coasting.x).toBeLessThan(released.x - 5);
  await waitForRest(photo, {timeout: 8_000});
  const rest = await state();
  // At the right edge: the photo's right edge on the stage's.
  expect(rest.fit.x + rest.x + rest.fit.width * rest.scale).toBeCloseTo(
    rest.stage.width,
    0,
  );
});

test('a finger landing on a coasting photo stops it where it shows', async ({
  page,
}) => {
  const {driver, photo, state} = await openViewer(page);
  const before = await state();
  const mid = {x: 201, y: before.stage.y + before.stage.height / 2};
  await driver.play(doubleTap(mid));
  await waitForAnimation(photo);
  await waitForRest(photo);
  await driver.play(
    flick(mid, {velocity: {x: -900, y: 0}, durationMs: 80, hz: 120}),
  );
  await page.waitForTimeout(120);
  // A finger lands mid-coast, rests 250 ms and lifts without moving.
  const reads: PhotoState[] = [];
  await driver.play(
    [
      {t: 0, fingers: [{id: 0, x: 120, y: mid.y}]},
      {t: 250, fingers: []},
    ],
    {
      onEvent: async () => {
        reads.push(await state());
      },
    },
  );
  // Read at the touch-down and at the lift.
  expect(reads).toHaveLength(2);
  const [{x: caughtX}, {x: heldX, stage, fit, scale}] = reads;
  // The coast stopped at once, where it showed, short of the edge.
  expect(heldX).toBeCloseTo(caughtX, 1);
  expect(heldX).toBeGreaterThan(stage.width - fit.width * scale - fit.x + 20);
  // Inside the stage, the lift with no drag leaves it there.
  await page.waitForTimeout(250);
  expect((await state()).x).toBeCloseTo(heldX, 1);
});

test('a finger left down after a pinch keeps panning without a jump', async ({
  page,
}) => {
  const {driver, photo, state} = await openViewer(page);
  test.skip(!driver.partialLifts, PARTIAL_LIFT_SKIP);
  const before = await state();
  const mid = {x: 201, y: before.stage.y + before.stage.height / 2};
  await driver.play(doubleTap(mid));
  await waitForAnimation(photo);
  await waitForRest(photo);
  // Two fingers spread and drift left together, then the right one lifts
  // and the left one drags on 60 px.
  const script: TouchFrame[] = [];
  for (let i = 0; i <= 12; i++) {
    const p = i / 12;
    script.push({
      t: i * 16,
      fingers: [
        {id: 0, x: 170 - 30 * p, y: mid.y},
        {id: 1, x: 250 - 10 * p, y: mid.y},
      ],
    });
  }
  script.push({t: 13 * 16, fingers: [{id: 0, x: 140, y: mid.y}]});
  for (let i = 1; i <= 12; i++) {
    script.push({
      t: (13 + i) * 16,
      fingers: [{id: 0, x: 140 - 5 * i, y: mid.y}],
    });
  }
  script.push({t: 26 * 16 + 150, fingers: []});
  const xs: {type: string; x: number}[] = [];
  await driver.play(script, {
    onEvent: async step => {
      // A touchmove nothing has cancelled yet reaches the page with the next
      // frame (Chromium aligns them to it): read once it has.
      await frames(page, 1);
      xs.push({type: step.type, x: (await state()).x});
    },
  });
  const lift = xs.findIndex(e => e.type === 'touchEnd');
  const lastMove = xs.map(e => e.type).lastIndexOf('touchMove');
  expect(lift).toBeGreaterThan(0);
  // No jump when the second finger lifts, then 1:1 with the finger left.
  expect(Math.abs(xs[lift].x - xs[lift - 1].x)).toBeLessThan(1);
  expect(xs[lift].x - xs[lastMove].x).toBeCloseTo(60, 0);
});

test('a tap beside the photo closes the viewer; a tap on it does not', async ({
  page,
}) => {
  const {driver, dialog, state} = await openViewer(page);
  const s = await state();
  const beside = [
    {t: 0, fingers: [{id: 0, x: 201, y: s.stage.y + 60}]},
    {t: 50, fingers: []},
  ];
  // A tap on the photo hides the controls (LightboxChrome spec)…
  await driver.play([
    {t: 0, fingers: [{id: 0, x: 201, y: s.stage.y + s.stage.height / 2}]},
    {t: 50, fingers: []},
  ]);
  await page.waitForTimeout(500);
  await expect(dialog).toBeVisible();
  // …so the first tap beside it brings them back, and the next one closes.
  await driver.play(beside);
  await page.waitForTimeout(500);
  await expect(dialog).toBeVisible();
  await driver.play(beside);
  await expect(dialog).toBeHidden();
});

test('the double-tap zoom keeps advancing every frame while the main thread is blocked', async ({
  page,
}, testInfo) => {
  const {driver, photo, state} = await openViewer(page);
  const before = await state();
  await markElement(photo, {mode: 'outline'});
  const cast = await startScreencast(page);
  await driver.play(
    doubleTap({x: 201, y: before.stage.y + before.stage.height / 2}),
  );
  const [zoom] = await waitForAnimation(photo, {minProgressMs: 16});
  const block = await blockMainThread(page, 500);
  await page.waitForTimeout(100);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, zoom.to)},
    {axis: 'height', settledWithin: 1},
  );
  await writeEvidence(
    'busy-main-thread/lightbox-double-tap-zoom',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          zoom,
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
    name: 'lightbox-double-tap-zoom-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: Math.min(block.to, zoom.to) + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({h: tracked.find(f => f.t === t)?.box?.height ?? -1}),
  });
  await film.write(testInfo, {block, zoom});
  expect(proof.medianFrameMs).toBeLessThan(20);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.longestStallMs).toBeLessThan(40);
  expect(proof.monotonic).toBe(true);
});

test('the zoom settles and the pinch do no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver, photo, state} = await openViewer(page);
  const before = await state();
  let zoom = {from: 0, to: 0};
  let pinchWindow = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await driver.play(
      doubleTap({x: 201, y: before.stage.y + before.stage.height / 2}),
    );
    [zoom] = await waitForAnimation(photo);
    await waitForRest(photo);
    const start = Date.now();
    await driver.play(
      pinch({
        center: {x: 201, y: before.stage.y + before.stage.height / 2},
        fromDistance: 100,
        toDistance: 180,
        durationMs: 400,
        restMs: 100,
      }),
    );
    pinchWindow = {from: start, to: Date.now()};
  });
  const during = countBetween(trace, zoom.from + 50, zoom.to - 50);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
  // While the fingers move: no layout (a style write per event, composited).
  const moving = countBetween(
    trace,
    pinchWindow.from + 100,
    pinchWindow.to - 150,
  );
  expect(moving.Layout ?? 0, JSON.stringify(moving)).toBe(0);
  expect(trace.longTasks).toEqual([]);
});

test('the zoomed photo is redrawn sharp', async ({page}, testInfo) => {
  // A 5:1 panorama: the double tap's aspect fill zooms it about 8.9×, so a
  // photo left at its fitted raster would smear each edge over ~9 pixels.
  const {driver, photo, state} = await openViewer(page, {
    width: 3000,
    height: 600,
  });
  const before = await state();
  await driver.play(
    doubleTap({x: 201, y: before.stage.y + before.stage.height / 2}),
  );
  await waitForAnimation(photo);
  await waitForRest(photo);
  await frames(page, 10);
  // Rows of device pixels across the checkerboard: count the pixels caught
  // between black and white at each edge. A photo scaled up from its fitted
  // raster smears each edge over several pixels; a redraw at the new zoom
  // keeps it to one or two (the edge's sub-pixel position and the engine's
  // filtering).
  const zoomed = await state();
  const y = Math.round(zoomed.stage.y + zoomed.stage.height * 0.3);
  // The whole viewport, decoded in a scratch page like the harness's marker
  // tracking (a clipped capture of the top layer is not the presented frame).
  const shot = await page.screenshot({scale: 'device'});
  await writeEvidence(
    'sharpness/lightbox-zoomed',
    {[`${testInfo.project.name}.png`]: shot},
    testInfo,
  );
  const dpr = await page.evaluate(() => window.devicePixelRatio);
  const scratch = await page.context().newPage();
  // One checkerboard period of rows, from a third of the way down; the row
  // that crosses the most edges lies inside a row of squares, not on the
  // boundary between two.
  const rows = await scratch.evaluate(
    async ({base64, from, count}) => {
      const blob = await (
        await fetch(`data:image/png;base64,${base64}`)
      ).blob();
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      if (context == null) {
        throw new Error('no 2d context');
      }
      context.drawImage(bitmap, 0, 0);
      const out: number[][] = [];
      for (let row = from; row < from + count; row++) {
        const data = context.getImageData(0, row, bitmap.width, 1).data;
        const values: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          values.push((data[i] + data[i + 1] + data[i + 2]) / 3);
        }
        out.push(values);
      }
      return out;
    },
    {
      base64: shot.toString('base64'),
      from: Math.round(y * dpr),
      count: Math.ceil(((100 * zoomed.fit.width) / 3000) * zoomed.scale * dpr),
    },
  );
  await scratch.close();
  const measureRow = (gray: number[]) => {
    let edges = 0;
    let smeared = 0;
    let run = 0;
    let side: 'dark' | 'light' | null = null;
    for (const value of gray) {
      if (value > 40 && value < 215) {
        run++;
        continue;
      }
      const next = value <= 40 ? 'dark' : 'light';
      if (side != null && next !== side) {
        edges++;
        smeared = Math.max(smeared, run);
      }
      side = next;
      run = 0;
    }
    return {edges, smeared};
  };
  const {edges, smeared} = rows
    .map(measureRow)
    .reduce((best, next) => (next.edges > best.edges ? next : best));
  await writeEvidence(
    'sharpness/lightbox-zoomed',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          scale: zoomed.scale,
          edges,
          smeared,
          y,
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(zoomed.scale).toBeGreaterThan(8);
  expect(edges).toBeGreaterThanOrEqual(4);
  expect(
    smeared,
    `widest edge ${smeared} device px at zoom ${zoomed.scale}`,
  ).toBeLessThanOrEqual(2);
});

test(
  'storyboard: pinch to zoom and the return from past the minimum',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, photo, state} = await openViewer(page);
    await installTimerGate(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: viewport.height};
    const s = await state();
    const centre = {x: 180, y: s.stage.y + s.stage.height / 2};
    const measure = async () => {
      const now = await state();
      return {
        scale: +now.scale.toFixed(3),
        x: +now.x.toFixed(1),
        y: +now.y.toFixed(1),
      };
    };
    const spread = await touchStoryboard(
      page,
      driver,
      pinch({
        center: centre,
        fromDistance: 80,
        toDistance: 260,
        durationMs: 300,
        hz: 30,
        restMs: 100,
      }),
      {name: 'lightbox-pinch-zoom', clip, measure, columns: 5, cellScale: 0.4},
    );
    const squeeze = await touchStoryboard(
      page,
      driver,
      pinch({
        center: centre,
        fromDistance: 300,
        toDistance: 70,
        durationMs: 300,
        hz: 30,
        restMs: 100,
      }),
      {
        name: 'lightbox-pinch-past-minimum',
        clip,
        measure,
        columns: 5,
        cellScale: 0.4,
      },
    );
    await waitForAnimation(photo);
    await freezeTimers(page);
    const {storyboard: settle} = await animationStoryboard(page, {
      name: 'lightbox-return-from-past-minimum',
      clip,
      scope: photo,
      measure,
      columns: 6,
      cellScale: 0.35,
    });
    await spread.write(testInfo);
    await squeeze.write(testInfo);
    await settle.write(testInfo);
  },
);

test(
  'storyboard: double tap to fill and back',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, photo, state} = await openViewer(page);
    await installTimerGate(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: viewport.height};
    const s = await state();
    const measure = async () => {
      const now = await state();
      return {scale: +now.scale.toFixed(3), x: +now.x.toFixed(1)};
    };
    await driver.play(doubleTap({x: 120, y: s.stage.y + s.stage.height / 2}));
    await waitForAnimation(photo);
    await freezeTimers(page);
    const {storyboard: zoomIn} = await animationStoryboard(page, {
      name: 'lightbox-double-tap-zoom-in',
      clip,
      scope: photo,
      measure,
      columns: 6,
      cellScale: 0.35,
    });
    await zoomIn.write(testInfo);
    expect(await readLongTasks(page, {from: 0, to: Date.now()})).toBeDefined();
  },
);
