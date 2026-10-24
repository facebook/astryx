// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxDismiss.interaction.browser.spec.ts
 * @input The built Lightbox stories on the phone project, their photos
 *   served as a 3000 × 2000 test image, real touch input (Chromium CDP /
 *   WebKit's input command) and the interaction harness
 * @output Interaction and animation proofs for Lightbox's drag to dismiss
 *   against Photos' measured one (motion/uikit/zoomMedia.ts `dismiss`): the
 *   photo follows the finger and shrinks by the travel while the backdrop
 *   and, faster, the controls fade; a release moving down sends the photo on
 *   the dismissal's spring and closes the viewer; a pull flicked back up or
 *   brought back to the start springs back on the cancel springs; a zoomed
 *   photo's vertical drag pans it; a gallery dismisses too; the dismissal
 *   keeps moving through a blocked main thread; Reduce Motion fades the
 *   photo out in place; a storyboard of the drag
 * @position Interaction tests for Lightbox (browser), beside
 *   LightboxZoom.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  blockMainThread,
  busyWindowProof,
  compareCurve,
  curveOf,
  drag,
  frames,
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

// Photos' measured drag to dismiss (motion/uikit/zoomMedia.ts), restated so
// a change to the table has to be made here too.
const SCALE_K = 4.91e-6;
const BACKDROP_K = 1.35e-5;
const CHROME_PER_PT = 0.00533;
const CHROME_START = 17.8;
/** The pan's begin threshold: travel before it is the finger's alone. */
const THRESHOLD = 10;

/** A critically damped spring from `from` to `to`, at rest at the start. */
function criticallyDamped(stiffness: number, from: number, to: number) {
  const omega = Math.sqrt(stiffness);
  return (ms: number) => {
    const t = ms / 1000;
    return to + (from - to) * (1 + omega * t) * Math.exp(-omega * t);
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
  close: Locator;
  /** The photo's box centre on the page. */
  centre: {x: number; y: number};
  /** The photo's zoom-stage transform. */
  photoState: () => Promise<{x: number; y: number; scale: number}>;
  backdropAlpha: () => Promise<number>;
  /** The opacity of the controls' layer (the Close button's). */
  closeAlpha: () => Promise<number>;
}

const STORIES = {
  plain: {id: 'core-lightbox--default', trigger: 'Open lightbox'},
  zoom: {id: 'core-lightbox--with-zoom', trigger: 'Open with zoom'},
  gallery: {
    id: 'core-lightbox--gallery-with-zoom',
    trigger: 'Open gallery with zoom',
  },
} as const;

async function openViewer(
  page: Page,
  story: keyof typeof STORIES = 'plain',
): Promise<Viewer> {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg(3000, 2000)}),
  );
  await openStory(page, storybook(), STORIES[story].id);
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: STORIES[story].trigger});
  const box = await trigger.boundingBox();
  if (box == null) {
    throw new Error('no trigger');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const photo =
    story === 'gallery'
      ? dialog.locator('[data-current] img')
      : dialog.locator('img').first();
  await expect
    .poll(async () =>
      photo.evaluate(el => (el as HTMLImageElement).naturalWidth),
    )
    .toBe(3000);
  await frames(page, 2);
  const rect = await photo.boundingBox();
  if (rect == null) {
    throw new Error('no photo');
  }
  const close = dialog.getByRole('button', {name: 'Close'});
  return {
    driver,
    dialog,
    photo,
    close,
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

/** A slow drag down by `dy`, held still before the lift. */
function pullDown(from: {x: number; y: number}, dy: number): TouchScript {
  return drag(
    from,
    {x: from.x, y: from.y + dy},
    {durationMs: 500, restMs: 150},
  );
}

test('a drag down carries the photo and shrinks it by the travel, as the backdrop and controls fade', async ({
  page,
}, testInfo) => {
  const v = await openViewer(page);
  const rows: {
    travel: number;
    scale: number;
    backdrop: number;
    chrome: number;
    dy: number;
  }[] = [];
  await v.driver.play(pullDown(v.centre, 155), {
    onEvent: async step => {
      if (step.type !== 'touchMove') {
        return;
      }
      await frames(page, 1);
      const travel = step.changed[0].y - v.centre.y - THRESHOLD;
      if (travel <= 0) {
        return;
      }
      const s = await v.photoState();
      rows.push({
        travel,
        scale: s.scale,
        dy: s.y,
        backdrop: await v.backdropAlpha(),
        chrome: await v.closeAlpha(),
      });
    },
  });
  await writeEvidence(
    'curves/lightbox-drag-to-dismiss',
    {[`${testInfo.project.name}.json`]: JSON.stringify(rows, null, 1)},
    testInfo,
  );
  expect(rows.length).toBeGreaterThan(10);
  const photoHeight = await v.photo.evaluate(
    el => (el as HTMLElement).offsetHeight,
  );
  for (const row of rows) {
    // The travel the photo shows: its centre's offset (it shrinks about it).
    const t = row.dy - ((1 - row.scale) * photoHeight) / 2;
    // It follows the finger 1:1 (a read may trail it by one move).
    expect(Math.abs(t - row.travel)).toBeLessThan(6);
    expect(row.scale).toBeCloseTo(1 - SCALE_K * t * t, 3);
    // The fades are read after the photo: a read may see them up to two
    // moves behind it (12 px of travel; WebKit dispatches slower).
    const backdrop = (travel: number) =>
      Math.min(1, 1 - BACKDROP_K * Math.max(0, travel) ** 2);
    const chrome = (travel: number) =>
      Math.min(1, Math.max(0, 1 - CHROME_PER_PT * (travel - CHROME_START)));
    expect(row.backdrop).toBeLessThanOrEqual(backdrop(t - 12) + 0.005);
    expect(row.backdrop).toBeGreaterThanOrEqual(backdrop(t) - 0.005);
    expect(row.chrome).toBeLessThanOrEqual(chrome(t - 12) + 0.005);
    expect(row.chrome).toBeGreaterThanOrEqual(chrome(t) - 0.005);
  }
});

test("a release moving down sends the photo on the dismissal's spring and closes the viewer", async ({
  page,
}, testInfo) => {
  const v = await openViewer(page);
  await v.driver.play(pullDown(v.centre, 110));
  const [exit] = await waitForAnimation(v.photo);
  const held = await holdAnimations(page, v.photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const samples = curveOf(
    await sampleCurve(v.photo, timeline(duration)),
    'translateY',
  );
  await releaseAnimations(page);
  const from = samples[0].value;
  const to = samples[samples.length - 1].value;
  // x(t) = to + (A + B·t)·e^(−ωt), A = from − to; B carries the release
  // velocity (B = v₀ + ωA), fitted by least squares.
  const omega = Math.sqrt(918.09);
  let num = 0;
  let den = 0;
  for (const {t, value} of samples) {
    const ts = t / 1000;
    const basis = ts * Math.exp(-omega * ts);
    num += basis * (value - to - (from - to) * Math.exp(-omega * ts));
    den += basis * basis;
  }
  const b = den > 0 ? num / den : 0;
  const spring = (ms: number) => {
    const ts = ms / 1000;
    return to + (from - to + b * ts) * Math.exp(-omega * ts);
  };
  const result = compareCurve(samples, spring, 1);
  await writeEvidence(
    'curves/lightbox-dismiss-exit',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {exit, held, samples, result},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(1);
  expect(to).toBeGreaterThan(from + 200);
  await expect(v.dialog).toBeHidden();
});

test('a pull flicked back up springs back on the cancel springs', async ({
  page,
}, testInfo) => {
  const v = await openViewer(page);
  const down = {x: v.centre.x, y: v.centre.y + 150};
  const script: TouchScript = drag(v.centre, down, {durationMs: 400})
    .slice(0, -1)
    .concat(
      drag(down, {x: down.x, y: down.y - 60}, {durationMs: 60})
        .slice(1)
        .map(f => ({
          ...f,
          t: f.t + 420,
        })),
    );
  await v.driver.play(script);
  const [ret] = await waitForAnimation(v.photo);
  const held = await holdAnimations(page, v.photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const samples = curveOf(
    await sampleCurve(v.photo, timeline(duration)),
    'scaleX',
  );
  await releaseAnimations(page);
  const result = compareCurve(
    samples,
    criticallyDamped(955.23, samples[0].value, 1),
    0.002,
  );
  await writeEvidence(
    'curves/lightbox-dismiss-cancel',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {ret, held, samples, result},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(samples[0].value).toBeLessThan(0.99);
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.002,
  );
  await waitForRest(v.photo);
  expect(await v.photoState()).toEqual({x: 0, y: 0, scale: 1});
  await expect(v.dialog).toBeVisible();
  await expect.poll(v.backdropAlpha).toBeCloseTo(1, 2);
  await expect.poll(v.closeAlpha).toBeCloseTo(1, 2);
});

test('a pull brought back to where it started springs back', async ({page}) => {
  const v = await openViewer(page);
  const down = {x: v.centre.x, y: v.centre.y + 120};
  const script = drag(v.centre, down, {durationMs: 300})
    .slice(0, -1)
    .concat(
      drag(
        down,
        {x: down.x, y: v.centre.y + THRESHOLD + 4},
        {durationMs: 300, restMs: 150},
      )
        .slice(1)
        .map(f => ({...f, t: f.t + 320})),
    );
  await v.driver.play(script);
  await frames(page, 30);
  await waitForRest(v.photo);
  expect(await v.photoState()).toEqual({x: 0, y: 0, scale: 1});
  await expect(v.dialog).toBeVisible();
});

test("a zoomed photo's vertical drag pans it and never dismisses", async ({
  page,
}) => {
  const v = await openViewer(page, 'zoom');
  await v.driver.play([
    {t: 0, fingers: [{id: 0, ...v.centre}]},
    {t: 50, fingers: []},
    {t: 170, fingers: [{id: 0, ...v.centre}]},
    {t: 220, fingers: []},
  ]);
  await waitForAnimation(v.photo);
  await waitForRest(v.photo);
  const zoomed = await v.photoState();
  expect(zoomed.scale).toBeGreaterThan(1.5);
  await v.driver.play(pullDown(v.centre, 80));
  await waitForRest(v.photo);
  const after = await v.photoState();
  expect(after.scale).toBeCloseTo(zoomed.scale, 3);
  await expect(v.dialog).toBeVisible();
  expect(await v.backdropAlpha()).toBeCloseTo(1, 2);
});

test('a gallery photo dismisses with a drag down', async ({page}) => {
  const v = await openViewer(page, 'gallery');
  await v.driver.play(pullDown(v.centre, 120));
  await expect(v.dialog).toBeHidden();
});

test('the dismissal keeps moving every frame while the main thread is blocked', async ({
  page,
}, testInfo) => {
  const v = await openViewer(page);
  await markElement(v.photo, {mode: 'outline'});
  const cast = await startScreencast(page);
  await v.driver.play(pullDown(v.centre, 110));
  const [exit] = await waitForAnimation(v.photo, {minProgressMs: 16});
  const block = await blockMainThread(page, 400);
  await page.waitForTimeout(100);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, exit.to)},
    {axis: 'y', settledWithin: 1},
  );
  await writeEvidence(
    'busy-main-thread/lightbox-dismiss',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, exit, proof},
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
});

test('under Reduce Motion the dismissal fades the photo out in place', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const v = await openViewer(page);
  await v.driver.play(pullDown(v.centre, 110));
  await waitForAnimation(v.photo);
  const held = await holdAnimations(page, v.photo);
  const samples = await sampleCurve(v.photo, [0, 50]);
  await releaseAnimations(page);
  // The travel lands at the end; meanwhile the photo fades where it was.
  expect(samples[0].transform.translateY).toBeCloseTo(
    samples[1].transform.translateY,
    1,
  );
  expect(samples[1].opacity).toBeLessThan(samples[0].opacity);
  expect(held.length).toBeGreaterThan(0);
  await expect(v.dialog).toBeHidden();
});

test(
  'storyboard: drag to dismiss',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const v = await openViewer(page);
    const board = await touchStoryboard(
      page,
      v.driver,
      drag(
        v.centre,
        {x: v.centre.x + 20, y: v.centre.y + 160},
        {
          durationMs: 300,
          hz: 20,
          restMs: 100,
        },
      ),
      {
        name: 'lightbox-drag-to-dismiss',
        measure: async () => {
          const s = await v.photoState();
          return {
            scale: +s.scale.toFixed(3),
            backdrop: +(await v.backdropAlpha()).toFixed(2),
          };
        },
        columns: 4,
        cellScale: 0.35,
      },
    );
    await board.write(testInfo);
  },
);
