// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxZoomTransition.interaction.browser.spec.ts
 * @input The built "Zoom from thumbnails" Lightbox story on the phone
 *   project, its photos served as test images, real touch input (Chromium
 *   CDP / WebKit's input command) and the interaction harness
 * @output Interaction and animation proofs for Lightbox's zoom transition
 *   against UIKit's measured `.zoom` (motion/zoomTransition.ts): the photo
 *   opens out of its thumbnail on the critically damped 0.34 s spring, the
 *   thumbnail hidden while its picture flies; Close zooms back into the
 *   thumbnail of the photo showing, after paging; a drag down lands it in
 *   its thumbnail; the viewer stays open until the photo has landed; no
 *   source opens plainly; the opening keeps moving through a blocked main
 *   thread; Reduce Motion cross-fades in place; a storyboard
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
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** UIKit's opening spring: critically damped, response 0.34 s. */
const OMEGA = (2 * Math.PI) / 0.34;
const progressAt = (ms: number) => {
  const x = (OMEGA * ms) / 1000;
  return 1 - (1 + x) * Math.exp(-x);
};

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

const COLORS: Record<string, string> = {
  '10': '#d22',
  '15': '#2a2',
  '20': '#22d',
  '25': '#d80',
};

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Thumbnails {
  driver: TouchDriver;
  thumbnail: (i: number) => Locator;
  box: (i: number) => Promise<Box>;
}

async function openStoryPage(page: Page): Promise<Thumbnails> {
  await page.route('https://picsum.photos/**', async route => {
    const id = /\/id\/(\d+)\//.exec(route.request().url())?.[1] ?? '10';
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: photoSvg(COLORS[id] ?? '#888'),
    });
  });
  await openStory(page, storybook(), 'core-lightbox--zoom-from-thumbnails');
  const driver = await touchDriver(page);
  const thumbnail = (i: number) =>
    page.locator('#storybook-root button img').nth(i);
  await expect
    .poll(async () =>
      thumbnail(3).evaluate(el => (el as HTMLImageElement).naturalWidth),
    )
    .toBe(3000);
  return {
    driver,
    thumbnail,
    box: async i =>
      thumbnail(i).evaluate(el => {
        const r = el.getBoundingClientRect();
        return {x: r.left, y: r.top, width: r.width, height: r.height};
      }),
  };
}

/** The current photo's box on the page, as it shows now. */
const photoBox = async (photo: Locator): Promise<Box> =>
  photo.evaluate(el => {
    const r = el.getBoundingClientRect();
    return {x: r.left, y: r.top, width: r.width, height: r.height};
  });

async function tap(driver: TouchDriver, locator: Locator) {
  const b = await locator.boundingBox();
  if (b == null) {
    throw new Error('not visible');
  }
  await driver.tap({x: b.x + b.width / 2, y: b.y + b.height / 2});
}

test('the photo opens out of its thumbnail on the 0.34 s critically damped spring', async ({
  page,
}, testInfo) => {
  const s = await openStoryPage(page);
  const thumb = await s.box(0);
  await tap(s.driver, s.thumbnail(0));
  const dialog = page.getByRole('dialog');
  const photo = dialog.locator('[data-current] img');
  const [open] = await waitForAnimation(photo);
  // The thumbnail hides while its picture flies.
  expect(
    await s.thumbnail(0).evaluate(el => getComputedStyle(el).visibility),
  ).toBe('hidden');
  const held = await holdAnimations(page, photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const samples = curveOf(
    await sampleCurve(photo, timeline(duration)),
    'scaleX',
  );
  await releaseAnimations(page);
  // The photo starts at the thumbnail's width and grows to its fitted width.
  const fitted = await photo.evaluate(el => (el as HTMLElement).offsetWidth);
  const startScale = thumb.width / fitted;
  expect(samples[0].value).toBeCloseTo(startScale, 3);
  const result = compareCurve(
    samples,
    t => startScale + (1 - startScale) * progressAt(t),
    0.002,
  );
  await writeEvidence(
    'curves/lightbox-zoom-open',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {open, held, samples, result},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
    0.002,
  );
  await waitForRest(photo);
  const rest = await photoBox(photo);
  expect(rest.width).toBeCloseTo(fitted, 0);
  await expect
    .poll(async () =>
      s.thumbnail(0).evaluate(el => getComputedStyle(el).visibility),
    )
    .toBe('visible');
});

test('Close zooms back into the thumbnail of the photo showing, after paging', async ({
  page,
}) => {
  const s = await openStoryPage(page);
  await tap(s.driver, s.thumbnail(0));
  const dialog = page.getByRole('dialog');
  await waitForRest(dialog.locator('[data-current] img'));
  await tap(s.driver, dialog.getByRole('button', {name: 'Next'}));
  // The pager's track settles on the next photo.
  await waitForRest(
    dialog.getByRole('button', {name: 'Zoom'}).locator(':scope > div'),
  );
  await expect(dialog).toHaveAccessibleName('Mountain lake');
  const photo = dialog.locator('[data-current] img');
  await waitForRest(photo);
  const target = await s.box(1);
  await tap(s.driver, dialog.getByRole('button', {name: 'Close'}));
  await waitForAnimation(photo);
  // The viewer stays open, the page inert, until the photo has landed.
  await expect(dialog).toBeVisible();
  const held = await holdAnimations(page, photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const end = await sampleCurve(photo, [duration]);
  await releaseAnimations(page);
  const fitted = await photo.evaluate(el => (el as HTMLElement).offsetWidth);
  expect(end[0].transform.scaleX * fitted).toBeCloseTo(target.width, 0);
  await expect(dialog).toBeHidden();
  await expect
    .poll(async () =>
      s.thumbnail(1).evaluate(el => getComputedStyle(el).visibility),
    )
    .toBe('visible');
});

test('a photo dragged down lands in its thumbnail', async ({page}) => {
  const s = await openStoryPage(page);
  await tap(s.driver, s.thumbnail(2));
  const dialog = page.getByRole('dialog');
  const photo = dialog.locator('[data-current] img');
  await waitForRest(photo);
  const target = await s.box(2);
  const start = await photoBox(photo);
  const centre = {x: start.x + start.width / 2, y: start.y + start.height / 2};
  await s.driver.play(
    drag(
      centre,
      {x: centre.x, y: centre.y + 120},
      {
        durationMs: 400,
        restMs: 150,
      },
    ),
  );
  await waitForAnimation(photo);
  const held = await holdAnimations(page, photo);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const end = await sampleCurve(photo, [duration]);
  await releaseAnimations(page);
  const fitted = await photo.evaluate(el => (el as HTMLElement).offsetWidth);
  expect(end[0].transform.scaleX * fitted).toBeCloseTo(target.width, 0);
  await expect(dialog).toBeHidden();
  await expect
    .poll(async () =>
      s.thumbnail(2).evaluate(el => getComputedStyle(el).visibility),
    )
    .toBe('visible');
});

test('the opening keeps advancing every frame while the main thread is blocked', async ({
  page,
}, testInfo) => {
  const s = await openStoryPage(page);
  // The closed dialog's photo: a CSS locator (a role query skips it).
  const photo = page.locator('dialog [data-current] img');
  // The marker and the recording start before the tap; the block waits
  // until the photo is opaque (its fade-in ends by ~0.12 s), so the marker
  // on it shows in every frame.
  await markElement(photo, {mode: 'outline'});
  const cast = await startScreencast(page);
  await tap(s.driver, s.thumbnail(0));
  const [open] = await waitForAnimation(photo, {minProgressMs: 140});
  const block = await blockMainThread(page, 150);
  await page.waitForTimeout(100);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, open.to)},
    {axis: 'width', settledWithin: 1},
  );
  await writeEvidence(
    'busy-main-thread/lightbox-zoom-open',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, open, proof},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(proof.medianFrameMs).toBeLessThanOrEqual(
    Math.max(20, cadenceBefore(tracked, block.from) * 1.15),
  );
  expect(proof.longestStallMs).toBeLessThan(40);
  expect(proof.monotonic).toBe(true);
});

test('under Reduce Motion the photo cross-fades in place', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const s = await openStoryPage(page);
  await tap(s.driver, s.thumbnail(0));
  const dialog = page.getByRole('dialog');
  const photo = dialog.locator('[data-current] img');
  await waitForAnimation(photo);
  const held = await holdAnimations(page, photo);
  const samples = await sampleCurve(photo, [0, 60]);
  await releaseAnimations(page);
  expect(held.length).toBeGreaterThan(0);
  // No travel: the photo sits at its fitted size while it fades in.
  expect(samples[0].transform.scaleX).toBeCloseTo(1, 3);
  expect(samples[1].opacity).toBeGreaterThan(samples[0].opacity);
  expect(await page.locator('[data-lightbox-portal]').count()).toBe(0);
  await waitForRest(photo);
  await frames(page, 2);
});
