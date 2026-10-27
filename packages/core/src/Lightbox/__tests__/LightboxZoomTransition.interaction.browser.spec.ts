// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxZoomTransition.interaction.browser.spec.ts
 * @input The built "Zoom from thumbnails" Lightbox story on the phone
 *   project, its photos served as test images, real touch input (Chromium
 *   CDP / WebKit's input command) and the interaction harness
 * @output Interaction and animation proofs for Lightbox's zoom transition
 *   against UIKit's measured `.zoom` (Lightbox/zoomTransition.ts): the photo
 *   opens out of its thumbnail on the critically damped 0.34 s spring, the
 *   thumbnail hidden while its picture flies; Close zooms back into the
 *   thumbnail of the photo showing, after paging; a drag down lands it in
 *   its thumbnail; the viewer stays open until the photo has landed; no
 *   source opens plainly; the opening keeps moving through a blocked main
 *   thread; an Escape mid-opening brings the photo back and the thumbnail
 *   shows again and stays; a tap beside the photo, a double tap or a drag
 *   down that lands while the viewer is still entering is held and the
 *   viewer finishes opening and stays, while keys stay live (spec:AST-094
 *   FR35); Reduce Motion (design:reduced-motion) fades in
 *   place in 200 ms or less on a touch screen, shows at once with a mouse,
 *   and never
 *   hides the thumbnail; a close during the opening turns it around from
 *   where it shows; while the photo lands an Escape stays the viewer's;
 *   a viewer unmounted on close gives the thumbnail back; a plain image
 *   opener zooms; a storyboard of the opening
 * @position Interaction tests for Lightbox (browser), beside
 *   LightboxZoom.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
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
  seekAnimations,
  startScreencast,
  timeline,
  touchDriver,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type TouchDriver,
  type TouchScript,
} from '@astryxdesign/interaction-harness';
import {cadenceOutside} from './screenSignal';

const storybook = withStorybook(test);

/** UIKit's opening spring: critically damped, response 0.34 s. */
const OMEGA = (2 * Math.PI) / 0.34;
const progressAt = (ms: number) => {
  const x = (OMEGA * ms) / 1000;
  return 1 - (1 + x) * Math.exp(-x);
};

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

// The second photo's page is already mounted beside the first, where the
// pager has to move to; the third's page mounts with the opening, its photo
// without a laid-out size until its picture applies.
for (const i of [1, 2]) {
  test(`photo ${i + 1} opens out of its own thumbnail, on the page it opens at`, async ({
    page,
  }) => {
    const s = await openStoryPage(page);
    const thumb = await s.box(i);
    await tap(s.driver, s.thumbnail(i));
    const dialog = page.getByRole('dialog');
    const photo = dialog.locator('[data-current] img');
    await waitForAnimation(photo);
    await holdAnimations(page);
    await seekAnimations(page, 0);
    // Its first frame sits on the thumbnail it opens from: centred on it, at
    // its width, not a page or more away.
    const start = await photoBox(photo);
    const centre = (b: Box) => ({x: b.x + b.width / 2, y: b.y + b.height / 2});
    expect(Math.abs(centre(start).x - centre(thumb).x)).toBeLessThan(2);
    expect(Math.abs(centre(start).y - centre(thumb).y)).toBeLessThan(2);
    expect(Math.abs(start.width - thumb.width)).toBeLessThan(2);
    await releaseAnimations(page);
    await waitForRest(photo);
    // It lands at its fitted size in the middle of the viewport, showing the
    // photo of the thumbnail it opened from.
    const rest = await photoBox(photo);
    const viewport = page.viewportSize()!;
    expect(Math.abs(centre(rest).x - viewport.width / 2)).toBeLessThan(2);
    const idOf = (src: string | null) => /\/id\/(\d+)\//.exec(src ?? '')?.[1];
    expect(idOf(await photo.getAttribute('src'))).toBe(
      idOf(await s.thumbnail(i).getAttribute('src')),
    );
  });
}

test('the opening plays whole when its first frame comes late: delayed, never skipped', async ({
  page,
}) => {
  const s = await openStoryPage(page);
  const thumb = await s.box(0);
  // The first frame after the dialog opens takes 150 ms, as WebKit's does
  // while it builds the new top layer (60–180 ms measured in iOS Safari). A
  // frame log records the photo's scale in every frame once the dialog is open.
  await page.evaluate(() => {
    const log: {t: number; scale: string}[] = [];
    (window as unknown as {__frames: typeof log}).__frames = log;
    let blockEnd = 0;
    (window as unknown as {__blockEnd: () => number}).__blockEnd = () =>
      blockEnd;
    const showModal = HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      showModal.call(this);
      requestAnimationFrame(() => {
        const end = performance.now() + 150;
        while (performance.now() < end) {
          // The late first frame.
        }
        blockEnd = performance.now();
      });
    };
    const frame = (time: number) => {
      const img = document.querySelector<HTMLElement>(
        'dialog[open] [data-current] img',
      );
      if (img != null) {
        log.push({t: time, scale: getComputedStyle(img).scale});
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  await tap(s.driver, s.thumbnail(0));
  const photo = page.getByRole('dialog').locator('[data-current] img');
  await waitForAnimation(photo);
  await waitForRest(photo);
  const fitted = await photo.evaluate(el => (el as HTMLElement).offsetWidth);
  const startScale = thumb.width / fitted;
  const {log, blockEnd} = await page.evaluate(() => ({
    log: (window as unknown as {__frames: {t: number; scale: string}[]})
      .__frames,
    blockEnd: (window as unknown as {__blockEnd: () => number}).__blockEnd(),
  }));
  const scaleOf = (v: string) => (v === 'none' ? 1 : parseFloat(v));
  const after = log.find(f => f.t >= blockEnd);
  if (after == null) {
    throw new Error(
      `no frame after the late one: ${JSON.stringify(log.slice(0, 6))}`,
    );
  }
  // The first frame after the late one still shows the opening's start (two
  // frames of progress at most), and the photo grows from there.
  const limit = startScale + (1 - startScale) * progressAt(34);
  expect(
    scaleOf(after.scale),
    JSON.stringify({startScale, blockEnd, log: log.slice(0, 6)}),
  ).toBeLessThanOrEqual(limit);
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
  browserName,
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
  // At the recording's own pace outside the block (Linux WebKit composites
  // in software on the CPU the blocked main thread spins on: 1.5 times that
  // pace there).
  const cadence = cadenceOutside(tracked, block);
  expect(proof.medianFrameMs).toBeLessThanOrEqual(
    Math.max(20, cadence * (browserName === 'webkit' ? 1.5 : 1.15)),
  );
  expect(proof.longestStallMs).toBeLessThan(cadence * 2.5);
  expect(proof.monotonic).toBe(true);
});

/** Two taps 160 ms apart, as a finger double-taps. */
function doubleTap(at: {x: number; y: number}): TouchScript {
  return [
    {t: 0, fingers: [{id: 0, ...at}]},
    {t: 60, fingers: []},
    {t: 160, fingers: [{id: 0, ...at}]},
    {t: 220, fingers: []},
  ];
}

/**
 * Opens photo 0 from its thumbnail and keeps its opening running (its
 * animations held mid-flight), so input lands during the entrance.
 */
async function openHeldMidEntrance(page: Page) {
  const s = await openStoryPage(page);
  await tap(s.driver, s.thumbnail(0));
  const dialog = page.getByRole('dialog');
  const photo = dialog.locator('[data-current] img');
  await waitForAnimation(photo);
  await holdAnimations(page, photo);
  const box = await photoBox(photo);
  const centre = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  return {s, dialog, photo, centre};
}

/** The entrance resumes and ends: the viewer stays open, the photo fitted. */
async function expectEnteredAndOpen(
  page: Page,
  dialog: Locator,
  photo: Locator,
) {
  // Past the double-tap wait, after which a tap beside the photo closes it.
  await page.waitForTimeout(500);
  await releaseAnimations(page);
  await waitForRest(photo);
  await expect(dialog).toBeVisible();
  const fitted = await photo.evaluate(el => (el as HTMLElement).offsetWidth);
  expect((await photoBox(photo)).width).toBeCloseTo(fitted, 0);
}

test('a tap beside the photo during the opening is held: it finishes opening and stays (spec:AST-094 FR35)', async ({
  page,
}) => {
  const {s, dialog, photo} = await openHeldMidEntrance(page);
  const stage = await dialog.boundingBox();
  if (stage == null) {
    throw new Error('no dialog box');
  }
  // The dark area above the photo, where a tap closes an open viewer.
  await s.driver.tap({x: stage.x + stage.width / 2, y: stage.y + 24});
  // Keys stay live: Tab moves focus within the dialog. The content stays in
  // the accessibility tree: neither the controls nor the photo showing sit
  // in an inert subtree (pages off screen are inert in any gallery).
  await page.keyboard.press('Tab');
  expect(await dialog.evaluate(d => d.contains(document.activeElement))).toBe(
    true,
  );
  expect(
    await dialog
      .getByRole('button', {name: 'Close'})
      .evaluate(el => el.closest('[inert]') == null),
  ).toBe(true);
  expect(await photo.evaluate(el => el.closest('[inert]') == null)).toBe(true);
  await expectEnteredAndOpen(page, dialog, photo);
});

test('a double tap during the opening is held: the photo enters at its fitted size, not zoomed', async ({
  page,
}) => {
  const {s, dialog, photo, centre} = await openHeldMidEntrance(page);
  await s.driver.play(doubleTap(centre));
  await expectEnteredAndOpen(page, dialog, photo);
});

test('a drag down during the opening is held: nothing follows it and the viewer stays', async ({
  page,
}) => {
  const {s, dialog, photo, centre} = await openHeldMidEntrance(page);
  await s.driver.play(
    drag(centre, {x: centre.x, y: centre.y + 220}, {durationMs: 300}),
  );
  await expectEnteredAndOpen(page, dialog, photo);
});

test('an Escape mid-opening returns the photo, and its thumbnail shows again and stays', async ({
  page,
}) => {
  const s = await openStoryPage(page);
  await tap(s.driver, s.thumbnail(0));
  const dialog = page.getByRole('dialog');
  const photo = dialog.locator('[data-current] img');
  await waitForAnimation(photo);
  await frames(page, 4);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  // Hidden while its picture flies, the thumbnail shows once the photo is
  // back in it, and stays shown.
  await page.waitForTimeout(500);
  expect(
    await s.thumbnail(0).evaluate(el => getComputedStyle(el).visibility),
  ).toBe('visible');
});

test('while the photo lands, an arrow key does not page the closed viewer', async ({
  page,
}) => {
  const s = await openStoryPage(page);
  await tap(s.driver, s.thumbnail(0));
  const photo = page.locator('dialog [data-current] img');
  await waitForAnimation(photo);
  await waitForRest(photo);
  const opened = await photo.getAttribute('src');
  // Escape starts the landing; the arrow arrives while the photo flies back.
  // The viewer keeps the photo it opened: no page, no onIndexChange.
  await page.keyboard.press('Escape');
  await page.keyboard.press('ArrowRight');
  expect(await photo.getAttribute('src')).toBe(opened);
  await expect
    .poll(async () =>
      page.locator('dialog').evaluate(el => (el as HTMLDialogElement).open),
    )
    .toBe(false);
  expect(await photo.getAttribute('src')).toBe(opened);
});

test('under Reduce Motion the thumbnail never hides', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const s = await openStoryPage(page);
  // The thumbnail's visibility on every frame, through the open and close.
  await s.thumbnail(0).evaluate(el => {
    const seen = new Set<string>();
    (window as unknown as {seenVisibility: Set<string>}).seenVisibility = seen;
    const tick = () => {
      seen.add(getComputedStyle(el).visibility);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await tap(s.driver, s.thumbnail(0));
  const dialog = page.getByRole('dialog');
  const photo = dialog.locator('[data-current] img');
  await waitForAnimation(photo);
  await waitForRest(photo);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await frames(page, 4);
  expect(
    await page.evaluate(() => [
      ...(window as unknown as {seenVisibility: Set<string>}).seenVisibility,
    ]),
  ).toEqual(['visible']);
});

test('a close during the opening turns it around from where it shows: no jump, never opaque again', async ({
  page,
}) => {
  const s = await openStoryPage(page);
  await page.evaluate(() => {
    const w = window as unknown as {alphas: number[]};
    w.alphas = [];
    const tick = () => {
      const dialog = document.querySelector('dialog');
      // Only while it shows: a closed dialog's backdrop reads its rest value.
      if (dialog?.open === true) {
        w.alphas.push(
          parseFloat(getComputedStyle(dialog, '::backdrop').opacity),
        );
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await tap(s.driver, s.thumbnail(0));
  const dialog = page.getByRole('dialog');
  const photo = dialog.locator('[data-current] img');
  await waitForAnimation(photo);
  await frames(page, 1);
  const at = await page.evaluate(
    () => (window as unknown as {alphas: number[]}).alphas.length,
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  const alphas = await page.evaluate(
    () => (window as unknown as {alphas: number[]}).alphas,
  );
  const shown = alphas[at - 1];
  expect(shown).toBeLessThan(0.98);
  // The close turns the opening around from where it shows and carries its
  // speed, as a spring reversed in flight does: the backdrop goes on from
  // there without a jump (a step no larger than two of the opening's, as
  // the key press may land between two samples), may rise a little before it
  // falls, then only falls, never reaches opaque, and ends clear.
  const after = alphas.slice(at);
  const step = Math.max(
    ...alphas.slice(1, at).map((alpha, i) => Math.abs(alpha - alphas[i])),
  );
  expect(Math.abs(after[0] - shown)).toBeLessThanOrEqual(2 * step + 0.02);
  // One rise at most (the opening's speed), then it only falls.
  const peak = after.indexOf(Math.max(...after));
  for (let k = peak + 1; k < after.length; k += 1) {
    expect(after[k]).toBeLessThanOrEqual(after[k - 1] + 0.005);
  }
  expect(Math.max(...after)).toBeLessThan(1);
  expect(after.at(-1) ?? 1).toBeLessThan(0.1);
});

test('while a closing photo zooms back, an Escape does not reach the dialog behind it', async ({
  page,
}) => {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg('#d22')}),
  );
  await openStory(page, storybook(), 'core-lightbox--inside-a-dialog');
  await page.getByRole('button', {name: 'Open dialog'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.getByRole('button', {name: 'Open Forest path'}).click();
  const viewer = page.getByRole('dialog', {name: 'Forest path'});
  await expect(viewer).toBeVisible();
  await waitForRest(viewer.locator('img').first());
  await frames(page, 2);
  await page.keyboard.press('Escape');
  await frames(page, 3);
  // The photo is still landing: this Escape is the viewer's, and ignored.
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await page.waitForTimeout(300);
  await expect(page.getByRole('dialog')).toHaveCount(1);
});

test('a viewer the page unmounts on close gives the thumbnail back after a drag down', async ({
  page,
}) => {
  await page.route('https://picsum.photos/**', async route => {
    const id = /\/id\/(\d+)\//.exec(route.request().url())?.[1] ?? '10';
    await route.fulfill({
      contentType: 'image/svg+xml',
      body: photoSvg(COLORS[id] ?? '#888'),
    });
  });
  await openStory(page, storybook(), 'core-lightbox--mounted-while-open');
  const driver = await touchDriver(page);
  const thumbnail = page.getByRole('button', {name: 'Open Forest path'});
  await tap(driver, thumbnail);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const photo = dialog.locator('[data-current] img');
  await waitForRest(photo);
  await frames(page, 2);
  const box = await photo.boundingBox();
  if (box == null) {
    throw new Error('no photo');
  }
  const centre = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  await driver.play(
    drag(centre, {x: centre.x, y: centre.y + 120}, {durationMs: 300}),
  );
  await expect(dialog).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(
    await thumbnail
      .locator('img')
      .evaluate(el => getComputedStyle(el).visibility),
  ).toBe('visible');
});

test('a photo opened from a plain image zooms out of it', async ({page}) => {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg('#d22')}),
  );
  await openStory(page, storybook(), 'core-lightbox--gallery');
  const driver = await touchDriver(page);
  // The Gallery story opens from <img> elements with a click handler and no
  // sourceFor: a plain image is never the focused element.
  const thumbnail = page.locator('#storybook-root img[style*="cover"]').nth(1);
  await expect
    .poll(async () =>
      thumbnail.evaluate(el => (el as HTMLImageElement).naturalWidth),
    )
    .toBe(3000);
  await tap(driver, thumbnail);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect
    .poll(async () => page.locator('[data-lightbox-portal]').count(), {
      timeout: 400,
      intervals: [16],
    })
    .toBeGreaterThan(0);
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
  // design:reduced-motion DR2: on a touch screen, a fade of 200 ms or less.
  expect(Math.max(...held.map(a => a.curveEndMs))).toBeLessThanOrEqual(205);
  // No travel: the photo sits at its fitted size while it fades in.
  expect(samples[0].transform.scaleX).toBeCloseTo(1, 3);
  expect(samples[1].opacity).toBeGreaterThan(samples[0].opacity);
  expect(await page.locator('[data-lightbox-portal]').count()).toBe(0);
  await waitForRest(photo);
  await frames(page, 2);
});

test('under Reduce Motion with a mouse the photo shows at once', async ({
  browser,
}) => {
  // design:reduced-motion DR3: any pointer but a coarse one, at once.
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800},
    hasTouch: false,
    isMobile: false,
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    // A fine primary pointer in this context (the interaction config can report
    // a coarse one without touch).
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    await page.route('https://picsum.photos/**', async route => {
      const id = /\/id\/(\d+)\//.exec(route.request().url())?.[1] ?? '10';
      await route.fulfill({
        contentType: 'image/svg+xml',
        body: photoSvg(COLORS[id] ?? '#888'),
      });
    });
    await openStory(page, storybook(), 'core-lightbox--zoom-from-thumbnails');
    const thumbnail = page.locator('#storybook-root button img').first();
    await expect
      .poll(async () =>
        thumbnail.evaluate(el => (el as HTMLImageElement).naturalWidth),
      )
      .toBe(3000);
    await thumbnail.click();
    const photo = page.getByRole('dialog').locator('[data-current] img');
    await expect(photo).toBeVisible();
    await frames(page, 1);
    const now = await photo.evaluate(el => ({
      running: el.getAnimations().filter(a => a.playState === 'running').length,
      opacity: parseFloat(getComputedStyle(el).opacity),
    }));
    expect(now.running).toBe(0);
    expect(now.opacity).toBe(1);
    expect(await page.locator('[data-lightbox-portal]').count()).toBe(0);
  } finally {
    await context.close();
  }
});

test(
  'storyboard: zoom from a thumbnail',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const s = await openStoryPage(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    await tap(s.driver, s.thumbnail(0));
    const photo = page.getByRole('dialog').locator('[data-current] img');
    await waitForAnimation(photo);
    // Every running animation, held and stepped together: the photo, the
    // thumbnail's portal, the backdrop and the controls.
    const {storyboard} = await animationStoryboard(page, {
      name: 'lightbox-zoom-from-thumbnail',
      clip: {x: 0, y: 0, width: viewport.width, height: viewport.height},
      measure: async () => {
        const b = await photoBox(photo);
        return {width: +b.width.toFixed(1)};
      },
      columns: 6,
      cellScale: 0.35,
    });
    await storyboard.write(testInfo);
  },
);
