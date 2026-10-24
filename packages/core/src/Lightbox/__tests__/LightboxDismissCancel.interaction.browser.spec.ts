// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxDismissCancel.interaction.browser.spec.ts
 * @input The built "Default" Lightbox story on the phone project, its photo
 *   served as a 3000 × 2000 test image, real touch input (Chromium CDP /
 *   WebKit's input command) and the interaction harness
 * @output Proofs for the drags that do NOT dismiss, against Photos' measured
 *   cancel (motion/uikit/zoomMedia.ts `dismiss`): released moving up,
 *   brought back within 10 pt of the start, or a slow short drag released
 *   below the threshold, the viewer stays open, the photo springs back to
 *   the fitted size on the cancel springs (position 877.63 / 59.25, size
 *   955.23 / 61.81, critically damped) and the backdrop and controls return
 *   to full; the cancel keeps moving through a blocked main thread; a
 *   storyboard of a cancelled drag
 * @position Interaction tests for Lightbox (browser), beside
 *   LightboxDismiss.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  blockMainThread,
  busyWindowProof,
  compareCurve,
  curveOf,
  drag,
  holdAnimations,
  markElement,
  openStory,
  releaseAnimations,
  sampleCurve,
  startScreencast,
  timeline,
  touchDriver,
  touchStoryboard,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type TouchDriver,
  type TouchScript,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** The pan's begin threshold: travel before it is the finger's alone. */
const THRESHOLD = 10;
/** Photos' cancel springs (stiffness, mass 1, critically damped). */
const CANCEL_POSITION_K = 877.63;
const CANCEL_SIZE_K = 955.23;

/**
 * A critically damped spring towards 0 from `from` with velocity `v0`
 * (units/s), at `ms` milliseconds.
 */
function criticallyDamped(stiffness: number, from: number, v0 = 0) {
  const omega = Math.sqrt(stiffness);
  return (ms: number) => {
    const t = ms / 1000;
    return (from + (v0 + omega * from) * t) * Math.exp(-omega * t);
  };
}

/**
 * The recording's own median frame interval just before the block (ms).
 * Linux WebKit composites in software and can present below 60 Hz on a
 * loaded machine; the block must not slow the motion past that pace.
 */
function cadenceBefore(frames: ReadonlyArray<{t: number}>, at: number): number {
  const times = frames
    .map(f => f.t)
    .filter(t => t < at && t >= at - 400)
    .sort((a, b) => a - b);
  const gaps = times
    .slice(1)
    .map((t, i) => t - times[i])
    .sort((a, b) => a - b);
  return gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : 1000 / 60;
}

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

interface Viewer {
  driver: TouchDriver;
  dialog: Locator;
  photo: Locator;
  centre: {x: number; y: number};
  photoState: () => Promise<{x: number; y: number; scale: number}>;
  backdropAlpha: () => Promise<number>;
  closeAlpha: () => Promise<number>;
}

async function openViewer(page: Page): Promise<Viewer> {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg(3000, 2000)}),
  );
  await openStory(page, storybook(), 'core-lightbox--default');
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: 'Open lightbox'});
  const box = await trigger.boundingBox();
  if (box == null) {
    throw new Error('no trigger');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const photo = dialog.locator('img').first();
  await expect
    .poll(async () =>
      photo.evaluate(el => (el as HTMLImageElement).naturalWidth),
    )
    .toBe(3000);
  await waitForRest(photo);
  const rect = await photo.boundingBox();
  if (rect == null) {
    throw new Error('no photo');
  }
  return {
    driver,
    dialog,
    photo,
    centre: {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2},
    photoState: async () =>
      photo.evaluate(el => {
        const style = getComputedStyle(el);
        const [x = '0', y = '0'] =
          style.translate === 'none' ? [] : style.translate.split(' ');
        return {
          x: parseFloat(x),
          y: parseFloat(y),
          scale: style.scale === 'none' ? 1 : parseFloat(style.scale),
        };
      }),
    backdropAlpha: async () =>
      dialog.evaluate(el =>
        parseFloat(getComputedStyle(el, '::backdrop').opacity),
      ),
    closeAlpha: async () =>
      dialog
        .locator('[data-lightbox-chrome]')
        .first()
        .evaluate(el => parseFloat(getComputedStyle(el).opacity)),
  };
}

/** Down by `dy`, then quickly back up by `up`: released moving up. */
function pullThenFlickUp(
  from: {x: number; y: number},
  dy: number,
  up: number,
): TouchScript {
  const down = {x: from.x, y: from.y + dy};
  return drag(from, down, {durationMs: 400})
    .slice(0, -1)
    .concat(
      drag(down, {x: down.x, y: down.y - up}, {durationMs: 60})
        .slice(1)
        .map(f => ({...f, t: f.t + 420})),
    );
}

/** Down by `dy`, then back to `travel` past the pan's threshold, held still. */
function pullThenReturn(
  from: {x: number; y: number},
  dy: number,
  travel: number,
): TouchScript {
  const down = {x: from.x, y: from.y + dy};
  return drag(from, down, {durationMs: 300})
    .slice(0, -1)
    .concat(
      drag(
        down,
        {x: down.x, y: from.y + THRESHOLD + travel},
        {durationMs: 300, restMs: 150},
      )
        .slice(1)
        .map(f => ({...f, t: f.t + 320})),
    );
}

/** The held return's translateY and scale curves, and how long it runs. */
async function heldReturn(page: Page, photo: Locator) {
  const held = await holdAnimations(page, photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const samples = await sampleCurve(photo, timeline(duration));
  await releaseAnimations(page);
  return {
    held,
    duration,
    y: curveOf(samples, 'translateY'),
    scale: curveOf(samples, 'scaleX'),
  };
}

/** The viewer stays open, the photo at rest at the fitted size, all faded back. */
async function expectRestored(v: Viewer) {
  await waitForRest(v.photo);
  await expect(v.dialog).toBeVisible();
  expect(await v.photoState()).toEqual({x: 0, y: 0, scale: 1});
  await expect.poll(v.backdropAlpha).toBeCloseTo(1, 2);
  await expect.poll(v.closeAlpha).toBeCloseTo(1, 2);
}

test('released moving up, the photo springs back on the cancel springs and the viewer stays open', async ({
  page,
}, testInfo) => {
  const v = await openViewer(page);
  await v.driver.play(pullThenFlickUp(v.centre, 150, 60));
  const [ret] = await waitForAnimation(v.photo);
  const back = await heldReturn(page, v.photo);
  // The size returns from rest; the position carries the finger's upward
  // velocity, read from the first two samples (one unknown), and the rest of
  // the curve must follow the cancel spring.
  const size = compareCurve(
    back.scale,
    t => 1 + criticallyDamped(CANCEL_SIZE_K, back.scale[0].value - 1)(t),
    0.002,
  );
  const omega = Math.sqrt(CANCEL_POSITION_K);
  const [s0, s1] = back.y;
  const t1 = (s1.t - s0.t) / 1000;
  const v0 =
    (s1.value * Math.exp(omega * t1) - s0.value) / t1 - omega * s0.value;
  const position = compareCurve(
    back.y,
    t => criticallyDamped(CANCEL_POSITION_K, s0.value, v0)(t - s0.t),
    0.75,
  );
  await writeEvidence(
    'curves/lightbox-dismiss-cancel-up',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {ret, back, v0, size, position},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(back.y[0].value).toBeGreaterThan(40);
  expect(back.scale[0].value).toBeLessThan(0.99);
  expect(size.maxError, JSON.stringify(size.worst)).toBeLessThanOrEqual(0.002);
  expect(position.maxError, JSON.stringify(position.worst)).toBeLessThanOrEqual(
    0.75,
  );
  await expectRestored(v);
});

test('brought back within 10 pt of the start and held still, it springs back from rest', async ({
  page,
}, testInfo) => {
  const v = await openViewer(page);
  await v.driver.play(pullThenReturn(v.centre, 120, 4));
  const [ret] = await waitForAnimation(v.photo);
  const back = await heldReturn(page, v.photo);
  const position = compareCurve(
    back.y,
    criticallyDamped(CANCEL_POSITION_K, back.y[0].value),
    0.25,
  );
  await writeEvidence(
    'curves/lightbox-dismiss-cancel-return',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {ret, back, position},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(back.y[0].value).toBeGreaterThan(2);
  expect(position.maxError, JSON.stringify(position.worst)).toBeLessThanOrEqual(
    0.25,
  );
  await expectRestored(v);
});

test('a slow short drag released below the threshold springs back', async ({
  page,
}, testInfo) => {
  const v = await openViewer(page);
  // 8 pt past the pan's threshold, slowly, held still: below the 10 pt a
  // release needs to dismiss.
  await v.driver.play(
    drag(
      v.centre,
      {x: v.centre.x, y: v.centre.y + THRESHOLD + 8},
      {durationMs: 600, restMs: 150},
    ),
  );
  const [ret] = await waitForAnimation(v.photo);
  const back = await heldReturn(page, v.photo);
  const position = compareCurve(
    back.y,
    criticallyDamped(CANCEL_POSITION_K, back.y[0].value),
    0.25,
  );
  await writeEvidence(
    'curves/lightbox-dismiss-cancel-short',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {ret, back, position},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(back.y[0].value).toBeGreaterThan(4);
  expect(position.maxError, JSON.stringify(position.worst)).toBeLessThanOrEqual(
    0.25,
  );
  await expectRestored(v);
});

test('the cancel keeps moving every frame while the main thread is blocked', async ({
  page,
}, testInfo) => {
  const v = await openViewer(page);
  await markElement(v.photo, {mode: 'outline'});
  const cast = await startScreencast(page);
  await v.driver.play(pullThenFlickUp(v.centre, 150, 60));
  const [ret] = await waitForAnimation(v.photo, {minProgressMs: 16});
  const block = await blockMainThread(page, 600);
  await page.waitForTimeout(100);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, ret.to)},
    {axis: 'y', settledWithin: 1},
  );
  await writeEvidence(
    'busy-main-thread/lightbox-dismiss-cancel',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, ret, proof},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(proof.medianFrameMs).toBeLessThanOrEqual(
    Math.max(20, cadenceBefore(tracked, block.from) * 1.15),
  );
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.longestStallMs).toBeLessThan(40);
  expect(proof.monotonic).toBe(true);
  await expectRestored(v);
});

test(
  'storyboard: a cancelled drag',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const v = await openViewer(page);
    const down = {x: v.centre.x, y: v.centre.y + 150};
    const script: TouchScript = drag(v.centre, down, {
      durationMs: 300,
      hz: 20,
    })
      .slice(0, -1)
      .concat(
        drag(down, {x: down.x, y: down.y - 120}, {durationMs: 150, hz: 20})
          .slice(1)
          .map(f => ({...f, t: f.t + 320})),
      );
    const board = await touchStoryboard(page, v.driver, script, {
      name: 'lightbox-drag-cancel',
      measure: async () => {
        const s = await v.photoState();
        return {
          y: +s.y.toFixed(1),
          scale: +s.scale.toFixed(3),
          backdrop: +(await v.backdropAlpha()).toFixed(2),
        };
      },
      columns: 5,
      cellScale: 0.35,
    });
    await board.write(testInfo);
  },
);
