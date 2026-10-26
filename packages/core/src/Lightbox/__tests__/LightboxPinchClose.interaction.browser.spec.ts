// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxPinchClose.interaction.browser.spec.ts
 * @input The built "Zoom from thumbnails" Lightbox story on the phone
 *   project, its photos served as test images, real touch input (Chromium
 *   CDP / WebKit's input command) and the interaction harness
 * @output Interaction and animation proofs for Photos' pinch to close: a
 *   pinch that starts at the fitted size shrinks the photo with the
 *   recognizer's scale, about the fingers, while the backdrop fades by
 *   Photos' table and the controls fade linearly; released at 0.91 it closes
 *   into the thumbnail; released at 0.966 it springs back on the 0.238 s
 *   critically damped spring; a pinch reopened by 0.1 springs back, one
 *   reopened by 0.02 still closes (zoomMedia.pinchClose's rule); a pinch
 *   that starts zoomed gives way below the fitted size and never closes; the
 *   close keeps changing the screen every frame through a blocked main
 *   thread; under Reduce Motion (design:reduced-motion) the close fades the
 *   photo out in place and a release at 0.966 returns to the fitted size by
 *   a fade, each in 200 ms or less; a storyboard of a pinch closing.
 *   Every case runs under a finger (a coarse pointer), in Chromium and
 *   WebKit alike
 * @position Interaction tests for Lightbox (browser), beside
 *   LightboxDismiss.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  blockMainThread,
  compareCurve,
  curveOf,
  frameStats,
  frames,
  holdAnimations,
  openStory,
  pinch,
  releaseAnimations,
  sampleCurve,
  startScreencast,
  timeline,
  touchDriver,
  touchStoryboard,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type TouchDriver,
  type TouchScript,
} from '@astryxdesign/interaction-harness';
import {cadenceOutside, regionSignal} from './screenSignal';

const storybook = withStorybook(test);

/** The pinch recognizer begins past this much change in span, px. */
const HYSTERESIS = 8;

/** Photos' backdrop opacity against the pinch's scale (b30d–l). */
const BACKDROP: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [0.95, 0.98],
  [0.9, 0.95],
  [0.87, 0.93],
  [0.85, 0.9],
  [0.82, 0.86],
  [0.8, 0.81],
  [0.77, 0.76],
  [0.75, 0.7],
  [0.72, 0.64],
  [0.69, 0.58],
  [0.67, 0.51],
  [0.64, 0.44],
  [0.62, 0.38],
  [0.59, 0.31],
  [0.56, 0.26],
  [0.54, 0.2],
  [0.51, 0.15],
  [0.49, 0.11],
  [0.46, 0.08],
  [0.43, 0.05],
  [0.41, 0.02],
];

function backdropFor(scale: number): number {
  if (scale >= 1) {
    return 1;
  }
  for (let i = 1; i < BACKDROP.length; i++) {
    const [s0, a0] = BACKDROP[i - 1];
    const [s1, a1] = BACKDROP[i];
    if (scale >= s1) {
      return a1 + ((a0 - a1) * (scale - s1)) / (s0 - s1);
    }
  }
  return 0;
}

function photoSvg(color: string): string {
  let squares = '';
  for (let y = 0; y < 2000; y += 50) {
    for (let x = 0; x < 3000; x += 50) {
      if ((x + y) % 100 === 0) {
        squares += `<rect x="${x}" y="${y}" width="50" height="50"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="2000" viewBox="0 0 3000 2000" shape-rendering="crispEdges"><rect width="3000" height="2000" fill="#fff"/><g fill="#000">${squares}</g><circle cx="1500" cy="1000" r="250" fill="${color}"/></svg>`;
}

interface Viewer {
  driver: TouchDriver;
  dialog: Locator;
  photo: Locator;
  centre: {x: number; y: number};
  thumbnailWidth: number;
  scale: () => Promise<number>;
  photoCentre: () => Promise<{x: number; y: number}>;
  alpha: (locator: Locator) => Promise<number>;
  backdropAlpha: () => Promise<number>;
}

async function openViewer(page: Page): Promise<Viewer> {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg('#d22')}),
  );
  await openStory(page, storybook(), 'core-lightbox--zoom-from-thumbnails');
  const driver = await touchDriver(page);
  const thumbnail = page.locator('#storybook-root button img').first();
  await expect
    .poll(async () =>
      thumbnail.evaluate(el => (el as HTMLImageElement).naturalWidth),
    )
    .toBe(3000);
  const box = await thumbnail.boundingBox();
  if (box == null) {
    throw new Error('no thumbnail');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const photo = dialog.locator('[data-current] img');
  // It zooms out of the thumbnail when its picture is decoded in time, or
  // opens plainly: either way it comes to rest at the fitted size.
  await expect
    .poll(async () =>
      photo.evaluate(el => (el as HTMLImageElement).naturalWidth),
    )
    .toBe(3000);
  await waitForRest(photo);
  await frames(page, 2);
  const rect = await photo.boundingBox();
  if (rect == null) {
    throw new Error('no photo');
  }
  return {
    driver,
    dialog,
    photo,
    centre: {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2},
    thumbnailWidth: box.width,
    scale: async () =>
      photo.evaluate(el => {
        const value = getComputedStyle(el).scale;
        return value === 'none' ? 1 : parseFloat(value);
      }),
    photoCentre: async () =>
      photo.evaluate(el => {
        const r = el.getBoundingClientRect();
        return {x: r.left + r.width / 2, y: r.top + r.height / 2};
      }),
    alpha: async locator =>
      locator.evaluate(el => parseFloat(getComputedStyle(el).opacity)),
    backdropAlpha: async () =>
      dialog.evaluate(el =>
        parseFloat(getComputedStyle(el, '::backdrop').opacity),
      ),
  };
}

/** A pinch in from `from` to `to` px apart, then out to `back`, lifted. */
function pinchInOut(
  center: {x: number; y: number},
  from: number,
  to: number,
  back: number,
): TouchScript {
  const inward = pinch({
    center,
    fromDistance: from,
    toDistance: to,
    durationMs: 300,
  });
  const outward = pinch({
    center,
    fromDistance: to,
    toDistance: back,
    durationMs: 200,
  });
  return inward
    .slice(0, -1)
    .concat(outward.slice(1).map(f => ({...f, t: f.t + 320})));
}

test('a pinch at the fitted size shrinks the photo with the fingers as the backdrop and controls fade', async ({
  page,
}, testInfo) => {
  const v = await openViewer(page);
  const chrome = v.dialog.locator('[data-lightbox-chrome]').first();
  const rows: {
    recognizer: number;
    scale: number;
    backdrop: number;
    chrome: number;
    dx: number;
  }[] = [];
  const moved = {x: v.centre.x + 30, y: v.centre.y + 60};
  // Squeeze from 300 to 170 px while the centroid travels 30, 60 px.
  const script: TouchScript = pinch({
    center: v.centre,
    fromDistance: 300,
    toDistance: 170,
    durationMs: 500,
    restMs: 200,
  }).map((frame, i, all) => {
    const p = i / (all.length - 1);
    return {
      ...frame,
      fingers: frame.fingers.map(f => ({
        ...f,
        x: f.x + (moved.x - v.centre.x) * p,
        y: f.y + (moved.y - v.centre.y) * p,
      })),
    };
  });
  await v.driver.play(script, {
    onEvent: async step => {
      if (step.type !== 'touchMove' || step.fingers.length !== 2) {
        return;
      }
      await frames(page, 1);
      const span = Math.hypot(
        step.fingers[1].x - step.fingers[0].x,
        step.fingers[1].y - step.fingers[0].y,
      );
      const recognizer = span / (300 - HYSTERESIS);
      if (recognizer >= 1) {
        return;
      }
      const centroid = {
        x: (step.fingers[0].x + step.fingers[1].x) / 2,
      };
      const centre = await v.photoCentre();
      rows.push({
        recognizer,
        scale: await v.scale(),
        backdrop: await v.backdropAlpha(),
        chrome: await v.alpha(chrome),
        dx: centre.x - centroid.x,
      });
    },
  });
  await writeEvidence(
    'curves/lightbox-pinch-close',
    {[`${testInfo.project.name}.json`]: JSON.stringify(rows, null, 1)},
    testInfo,
  );
  expect(rows.length).toBeGreaterThan(8);
  for (const row of rows) {
    // No resistance: the photo's scale is the recognizer's (a read may
    // trail it by one move).
    expect(Math.abs(row.scale - row.recognizer)).toBeLessThan(0.03);
    expect(Math.abs(row.backdrop - backdropFor(row.scale))).toBeLessThan(0.02);
    expect(
      Math.abs(row.chrome - Math.max(0, 1 - 5.9 * (1 - row.scale))),
    ).toBeLessThan(0.02);
    // The photo follows the centroid (it was centred under it).
    expect(Math.abs(row.dx)).toBeLessThan(4);
  }
  // Lifted at 0.58: it closes.
  await expect(v.dialog).toBeHidden();
});

test('released at 0.91 it closes into its thumbnail', async ({page}) => {
  const v = await openViewer(page);
  // 300 → 265 px: the recognizer reads 0.91.
  await v.driver.play(
    pinch({
      center: v.centre,
      fromDistance: 300,
      toDistance: 265,
      durationMs: 300,
      restMs: 150,
    }),
  );
  await waitForAnimation(v.photo);
  const held = await holdAnimations(page, v.photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const end = await sampleCurve(v.photo, [duration]);
  await releaseAnimations(page);
  const fitted = await v.photo.evaluate(el => (el as HTMLElement).offsetWidth);
  expect(end[0].transform.scaleX * fitted).toBeCloseTo(v.thumbnailWidth, 0);
  await expect(v.dialog).toBeHidden();
});

test('released at 0.966 it springs back on the 0.238 s critically damped spring', async ({
  page,
}, testInfo) => {
  const v = await openViewer(page);
  // 300 → 282 px: the recognizer reads 0.966.
  await v.driver.play(
    pinch({
      center: v.centre,
      fromDistance: 300,
      toDistance: 282,
      durationMs: 300,
      restMs: 150,
    }),
  );
  const [back] = await waitForAnimation(v.photo);
  const held = await holdAnimations(page, v.photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const samples = curveOf(
    await sampleCurve(v.photo, timeline(duration)),
    'scaleX',
  );
  await releaseAnimations(page);
  const from = samples[0].value;
  const omega = (2 * Math.PI) / 0.238;
  const expected = (ms: number) => {
    const x = (omega * ms) / 1000;
    return 1 + (from - 1) * (1 + x) * Math.exp(-x);
  };
  const result = compareCurve(samples, expected, 0.002);
  await writeEvidence(
    'curves/lightbox-pinch-spring-back',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {back, held, samples, result},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(from).toBeLessThan(0.98);
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.002,
  );
  await waitForRest(v.photo);
  await expect(v.dialog).toBeVisible();
  expect(await v.scale()).toBe(1);
  expect(await v.backdropAlpha()).toBeCloseTo(1, 2);
});

test('reopened by 0.1 it springs back; reopened by 0.02, it still closes', async ({
  page,
}) => {
  const v = await openViewer(page);
  // In to 0.6, out to 0.7: back.
  await v.driver.play(pinchInOut(v.centre, 300, 175, 204));
  await waitForRest(v.photo);
  await expect(v.dialog).toBeVisible();
  expect(await v.scale()).toBe(1);
  // In to 0.6, out to 0.62: closes.
  await v.driver.play(pinchInOut(v.centre, 300, 175, 181));
  await expect(v.dialog).toBeHidden();
});

test('a pinch that starts zoomed gives way below the fitted size and never closes', async ({
  page,
}) => {
  const v = await openViewer(page);
  await v.driver.tap(v.centre);
  await page.waitForTimeout(120);
  await v.driver.tap(v.centre);
  await waitForRest(v.photo);
  const zoomed = await v.scale();
  expect(zoomed).toBeGreaterThan(1.5);
  // 300 → 60 px: a fifth of the zoomed scale, well under the fitted size.
  await v.driver.play(
    pinch({
      center: v.centre,
      fromDistance: 300,
      toDistance: 60,
      durationMs: 400,
      restMs: 150,
    }),
  );
  await frames(page, 2);
  // It gave way (UIKit's law keeps it above the raw scale), the backdrop never
  // faded, and the release returns it to the fitted size.
  expect(await v.scale()).toBeGreaterThan((zoomed * 60) / 300);
  expect(await v.backdropAlpha()).toBeCloseTo(1, 2);
  await waitForRest(v.photo);
  await expect(v.dialog).toBeVisible();
  expect(await v.scale()).toBe(1);
});

test('the close keeps moving every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  const v = await openViewer(page);
  const rect = await v.photo.boundingBox();
  if (rect == null) {
    throw new Error('no photo');
  }
  const cast = await startScreencast(page);
  // 300 → 265 px: the recognizer reads 0.91, which closes.
  await v.driver.play(
    pinch({
      center: v.centre,
      fromDistance: 300,
      toDistance: 265,
      durationMs: 300,
    }),
  );
  // Blocked inside the page one frame into the close (the helper waits there
  // for it), so nearly all of the close falls in the block. Not sooner: a
  // block must find the close already on the compositor, and an animation is
  // there only a frame after it starts (at 0 ms Chromium's is still pending;
  // at 1 ms WebKit's start time has resolved but its layers are not flushed),
  // or nothing can move during the block.
  const block = await blockMainThread(page, 400, {
    during: v.photo,
    minProgressMs: 16,
  });
  await page.waitForTimeout(100);
  const castFrames = await cast.stop();
  const signal = await regionSignal(page, castFrames, rect);
  // Judged from the block's start until the screen settles (the photo and
  // the backdrop gone): a spring's sub-pixel tail changes nothing on screen.
  const final = signal.at(-1)?.value ?? 0;
  const settled =
    signal.find(c => c.t >= block.from && Math.abs(c.value - final) <= 1)?.t ??
    block.to;
  const window = {
    from: block.from + 20,
    to: Math.min(block.to, settled) - 1,
  };
  const stats = frameStats(signal, window, 0.05);
  const cadence = cadenceOutside(castFrames, block);
  // At the recording's own pace (Linux WebKit composites in software on the
  // CPU the blocked main thread spins on: 1.5 times that pace there).
  const pace = cadence * (browserName === 'webkit' ? 1.5 : 1.15);
  const expected = Math.floor((window.to - window.from) / pace);
  await writeEvidence(
    'busy-main-thread/lightbox-pinch-close',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, window, cadence, expected, stats, signal},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(window.to - window.from).toBeGreaterThan(100);
  expect(stats.medianFrameMs).toBeLessThanOrEqual(Math.max(20, pace));
  expect(stats.changed).toBeGreaterThanOrEqual(expected - 2);
  expect(stats.longestStallMs).toBeLessThan(cadence * 2.5);
  await expect(v.dialog).toBeHidden();
});

test('under Reduce Motion a release at 0.966 returns to the fitted size by a fade, not a spring', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const v = await openViewer(page);
  // 300 → 282 px: the recognizer reads 0.966, which springs back.
  await v.driver.play(
    pinch({
      center: v.centre,
      fromDistance: 300,
      toDistance: 282,
      durationMs: 300,
      restMs: 150,
    }),
  );
  await waitForAnimation(v.photo);
  const released = await v.scale();
  const held = await holdAnimations(page, v.photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const samples = await sampleCurve(v.photo, timeline(duration));
  await releaseAnimations(page);
  const scales = curveOf(samples, 'scaleX');
  const opacity = curveOf(samples, 'opacity');
  // design:reduced-motion DR2: a return the component starts at the lift
  // cross-fades, opacity only, in 200 ms or less.
  expect(duration).toBeLessThanOrEqual(205);
  expect(released).toBeLessThan(0.98);
  // No travel: the photo shows at the scale the fingers left it or at the
  // fitted size, never in between, and dips out and back in between them.
  for (const sample of scales) {
    const atRelease = Math.abs(sample.value - released) < 0.002;
    const atFit = Math.abs(sample.value - 1) < 0.002;
    expect(atRelease || atFit, `scale ${sample.value} at ${sample.t} ms`).toBe(
      true,
    );
  }
  expect(Math.min(...opacity.map(s => s.value))).toBeLessThan(0.5);
  await waitForRest(v.photo);
  await expect(v.dialog).toBeVisible();
  expect(await v.scale()).toBe(1);
  expect(
    await v.photo.evaluate(el => parseFloat(getComputedStyle(el).opacity)),
  ).toBe(1);
  expect(await v.backdropAlpha()).toBeCloseTo(1, 2);
});

test('under Reduce Motion the pinch close fades the photo out in place', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const v = await openViewer(page);
  // 300 → 240 px: the recognizer reads 0.8, which closes.
  await v.driver.play(
    pinch({
      center: v.centre,
      fromDistance: 300,
      toDistance: 240,
      durationMs: 300,
      restMs: 150,
    }),
  );
  await waitForAnimation(v.photo);
  const released = await v.scale();
  const held = await holdAnimations(page, v.photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const samples = await sampleCurve(v.photo, timeline(duration));
  await releaseAnimations(page);
  const scales = curveOf(samples, 'scaleX').slice(0, -1);
  const opacity = curveOf(samples, 'opacity');
  // design:reduced-motion DR2: a fade of 200 ms or less.
  expect(duration).toBeLessThanOrEqual(205);
  // No travel: the scale holds where the fingers left it while the photo
  // fades to nothing; the viewer then closes.
  expect(released).toBeLessThan(0.9);
  for (const sample of scales) {
    expect(sample.value).toBeCloseTo(released, 3);
  }
  expect(opacity[0].value).toBeGreaterThan(0.9);
  expect(opacity.at(-1)?.value ?? 1).toBeLessThan(0.05);
  await expect(v.dialog).toBeHidden();
});

test(
  'storyboard: a pinch in closes into the thumbnail',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const v = await openViewer(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    // Photographed after every touch event: the photo shrinks with the
    // fingers as the backdrop fades, and closes at the lift.
    const board = await touchStoryboard(
      page,
      v.driver,
      pinch({
        center: v.centre,
        fromDistance: 300,
        toDistance: 200,
        durationMs: 300,
        restMs: 100,
      }),
      {
        name: 'lightbox-pinch-to-close',
        clip: {x: 0, y: 0, width: viewport.width, height: viewport.height},
        measure: async () => ({
          scale: +(await v.scale()).toFixed(2),
          backdrop: +(await v.backdropAlpha()).toFixed(2),
        }),
        columns: 6,
        cellScale: 0.35,
      },
    );
    await board.write(testInfo);
  },
);
