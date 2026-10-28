// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxChrome.interaction.browser.spec.ts
 * @input The built "Gallery with zoom" Lightbox story on the phone project,
 *   its photos served as test images, real touch input (Chromium CDP /
 *   WebKit's input command) and the interaction harness
 * @output Interaction and animation proofs for Lightbox's controls hiding
 *   as Photos' chrome does: a tap on the photo hides them on Photos'
 *   measured 0.2 s easeInEaseOut fade while the background turns black
 *   after 0.1 s; the next tap (on the photo or beside it) shows them; a
 *   double tap that zooms in hides them and one back to the fitted size
 *   shows them; zoomed, a tap toggles only the controls (the black stays);
 *   a pinch hides them as it passes the fitted size, before the lift; a
 *   mouse click toggles them too, once a double-click can no longer follow,
 *   and a keyboard focus brings them back; the next
 *   photo's caption arrives hidden; a drag to dismiss keeps them hidden while
 *   the black fades with the backdrop, and a cancel brings them back; the
 *   fade keeps changing the screen every frame through a blocked main
 *   thread; under Reduce Motion (design:reduced-motion) the fades are
 *   opacity only and last 200 ms or less; a
 *   storyboard of a tap hiding them; on a video page the controls a photo
 *   hid come back; media that arrive after the viewer mounted still hide
 *   them on a tap
 * @position Interaction tests for Lightbox (browser), beside
 *   LightboxZoom.interaction.browser.spec.ts
 */

import {
  expect,
  test,
  type Browser,
  type Locator,
  type Page,
} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  CONTROL_RGB,
  curveOf,
  drag,
  frames,
  holdAnimations,
  openStory,
  pinch,
  pooledBusyProof,
  releaseAnimations,
  sampleCurve,
  startBusyControl,
  startScreencast,
  timeline,
  touchDriver,
  type TouchDriver,
  type TouchScript,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';
import {regionSignal, signalFrames} from './screenSignal';

const storybook = withStorybook(test);

/** Core Animation's easeInEaseOut, (0.42, 0, 0.58, 1). */
function easeInEaseOut(x: number): number {
  const sample = (t: number, a: number, b: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (sample(mid, 0.42, 0.58) < x) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return sample((lo + hi) / 2, 0, 1);
}

function doubleTap(at: {x: number; y: number}): TouchScript {
  return [
    {t: 0, fingers: [{id: 0, ...at}]},
    {t: 50, fingers: []},
    {t: 170, fingers: [{id: 0, ...at}]},
    {t: 220, fingers: []},
  ];
}

function photoSvg(): string {
  let squares = '';
  for (let y = 0; y < 2000; y += 50) {
    for (let x = 0; x < 3000; x += 50) {
      if ((x + y) % 100 === 0) {
        squares += `<rect x="${x}" y="${y}" width="50" height="50"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="2000" viewBox="0 0 3000 2000" shape-rendering="crispEdges"><rect width="3000" height="2000" fill="#fff"/><g fill="#000">${squares}</g><circle cx="1500" cy="1000" r="250" fill="#d22"/></svg>`;
}

interface Viewer {
  driver: TouchDriver;
  dialog: Locator;
  photo: Locator;
  chrome: Locator;
  /** The viewer's container, whose `::before` is the black. */
  container: Locator;
  /** The black's opacity: the container's `::before`. */
  black: () => Promise<number>;
  centre: {x: number; y: number};
  alpha: (locator: Locator) => Promise<number>;
}

async function openGallery(page: Page): Promise<Viewer> {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg()}),
  );
  await openStory(page, storybook(), 'core-lightbox--gallery-with-zoom');
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: 'Open gallery with zoom'});
  const box = await trigger.boundingBox();
  if (box == null) {
    throw new Error('no trigger');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const photo = dialog.locator('[data-current] img');
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
  const chrome = dialog.locator('[data-lightbox-chrome]').first();
  const container = chrome.locator('xpath=..');
  return {
    driver,
    dialog,
    photo,
    chrome,
    container,
    black: async () =>
      container.evaluate(el =>
        parseFloat(getComputedStyle(el, '::before').opacity),
      ),
    centre: {x: rect.x + rect.width / 2, y: rect.y + rect.height / 2},
    alpha: async locator =>
      locator.evaluate(el => parseFloat(getComputedStyle(el).opacity)),
  };
}

test("the black is the viewer container's own ::before, with no element of its own (INV7)", async ({
  page,
}) => {
  const v = await openGallery(page);
  await expect(v.dialog.locator('[data-lightbox-blackout]')).toHaveCount(0);
  const before = await v.container.evaluate(el => {
    const style = getComputedStyle(el, '::before');
    return {
      content: style.content,
      color: style.backgroundColor,
      opacity: style.opacity,
    };
  });
  expect(before.content).not.toBe('none');
  // The theme's ink for light surfaces (near-black), opaque; the black's own
  // opacity is 0 at rest.
  const [r = 255, g = 255, b = 255, alpha = 1] = (
    before.color.match(/[\d.]+/g) ?? []
  ).map(Number);
  expect(Math.max(r, g, b)).toBeLessThan(40);
  expect(alpha).toBe(1);
  expect(before.opacity).toBe('0');
});

async function hideByTap(v: Viewer, page: Page) {
  await v.driver.tap(v.centre);
  await waitForAnimation(v.chrome);
  await waitForRest(v.chrome);
  await waitForRest(v.container);
  await frames(page, 1);
}

test('a tap on the photo hides the controls on the 0.2 s easeInEaseOut fade, and the background turns black after 0.1 s', async ({
  page,
}, testInfo) => {
  const v = await openGallery(page);
  const lift = await page.evaluate(() => performance.now());
  await v.driver.tap(v.centre);
  const [fade] = await waitForAnimation(v.chrome);
  const held = await holdAnimations(page, v.dialog);
  const times = timeline(200);
  const chrome = curveOf(await sampleCurve(v.chrome, times), 'opacity');
  const black = curveOf(
    await sampleCurve(v.container, times, {pseudoElement: '::before'}),
    'opacity',
  );
  await releaseAnimations(page);
  await writeEvidence(
    'curves/lightbox-chrome-hide',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {lift, fade, held, chrome, black},
        null,
        1,
      ),
    },
    testInfo,
  );
  for (const {t, value} of chrome) {
    expect(value, `chrome at ${t} ms`).toBeCloseTo(
      1 - easeInEaseOut(Math.min(1, t / 200)),
      2,
    );
  }
  for (const {t, value} of black) {
    const expected = t <= 100 ? 0 : easeInEaseOut(Math.min(1, (t - 100) / 100));
    expect(value, `black at ${t} ms`).toBeCloseTo(expected, 2);
  }
  await waitForRest(v.chrome);
  await waitForRest(v.container);
  expect(await v.alpha(v.chrome)).toBe(0);
  expect(await v.black()).toBe(1);
  // Hidden controls take no taps: one on the Close button's spot shows them
  // again instead of closing the viewer unseen.
  const close = await v.dialog
    .getByRole('button', {name: 'Close'})
    .boundingBox();
  if (close == null) {
    throw new Error('no close button');
  }
  // The show is the next animation on the controls, not the hide before it.
  const since = await page.evaluate(() => performance.now());
  await v.driver.tap({
    x: close.x + close.width / 2,
    y: close.y + close.height / 2,
  });
  await waitForAnimation(v.chrome, {since});
  await waitForRest(v.chrome);
  await expect(v.dialog).toBeVisible();
  expect(await v.alpha(v.chrome)).toBe(1);
});

test('the next tap on the photo shows them, the black clearing at once', async ({
  page,
}) => {
  const v = await openGallery(page);
  await hideByTap(v, page);
  await v.driver.tap(v.centre);
  await waitForAnimation(v.chrome);
  await holdAnimations(page, v.dialog);
  const [chrome, black] = await Promise.all([
    sampleCurve(v.chrome, [0, 100, 200]),
    sampleCurve(v.container, [0, 50, 100], {pseudoElement: '::before'}),
  ]);
  await releaseAnimations(page);
  expect(chrome.map(s => s.opacity)).toEqual([
    expect.closeTo(0, 2),
    expect.closeTo(0.5, 2),
    expect.closeTo(1, 2),
  ]);
  // No wait: the black starts clearing with the controls' fade.
  expect(black.map(s => s.opacity)).toEqual([
    expect.closeTo(1, 2),
    expect.closeTo(0.5, 2),
    expect.closeTo(0, 2),
  ]);
});

test('a double tap that zooms in hides them, and one back to the fitted size shows them', async ({
  page,
}) => {
  const v = await openGallery(page);
  await v.driver.play(doubleTap(v.centre));
  await waitForAnimation(v.chrome);
  await waitForRest(v.chrome);
  await waitForRest(v.photo);
  expect(await v.alpha(v.chrome)).toBe(0);
  expect(await v.black()).toBe(1);
  await v.driver.play(doubleTap(v.centre));
  await waitForAnimation(v.chrome);
  await waitForRest(v.chrome);
  await waitForRest(v.photo);
  expect(await v.alpha(v.chrome)).toBe(1);
  expect(await v.black()).toBe(0);
});

test('zoomed, a tap toggles only the controls: the black stays', async ({
  page,
}) => {
  const v = await openGallery(page);
  await v.driver.play(doubleTap(v.centre));
  await waitForAnimation(v.chrome);
  await waitForRest(v.chrome);
  await waitForRest(v.photo);
  expect(await v.black()).toBe(1);
  await v.driver.tap(v.centre);
  await waitForAnimation(v.chrome);
  await waitForRest(v.chrome);
  expect(await v.alpha(v.chrome)).toBe(1);
  expect(await v.black()).toBe(1);
  await v.driver.tap(v.centre);
  await waitForAnimation(v.chrome);
  await waitForRest(v.chrome);
  expect(await v.alpha(v.chrome)).toBe(0);
  expect(await v.black()).toBe(1);
});

test('a pinch hides them as it passes the fitted size, before the lift', async ({
  page,
}) => {
  const v = await openGallery(page);
  let hidingBeforeLift = false;
  await v.driver.play(
    pinch({
      center: v.centre,
      fromDistance: 100,
      toDistance: 200,
      durationMs: 600,
      restMs: 300,
    }),
    {
      onEvent: async step => {
        if (step.type !== 'touchMove' || hidingBeforeLift) {
          return;
        }
        hidingBeforeLift = await v.chrome.evaluate(
          el => el.getAnimations().length > 0,
        );
      },
    },
  );
  expect(hidingBeforeLift).toBe(true);
  await waitForRest(v.chrome);
  expect(await v.alpha(v.chrome)).toBe(0);
  expect(await v.black()).toBe(1);
});

test('with a mouse (a fine pointer), a click on the photo hides the controls once a double-click cannot follow, the next shows them, and a double-click zooms in and hides them (FR43)', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800},
    hasTouch: false,
    isMobile: false,
  });
  try {
    const page = await context.newPage();
    // A fine primary pointer in this context (the interaction config can report
    // a coarse one without touch).
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    await page.route('https://picsum.photos/**', async route =>
      route.fulfill({contentType: 'image/svg+xml', body: photoSvg()}),
    );
    await openStory(page, storybook(), 'core-lightbox--gallery-with-zoom');
    await page.getByRole('button', {name: 'Open gallery with zoom'}).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const photo = dialog.locator('[data-current] img');
    await expect
      .poll(async () =>
        photo.evaluate(el => (el as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    const box = await photo.boundingBox();
    if (box == null) {
      throw new Error('no photo');
    }
    const chrome = dialog.locator('[data-lightbox-chrome]').first();
    const alpha = async () =>
      chrome.evaluate(el => parseFloat(getComputedStyle(el).opacity));
    const centre = {x: box.x + box.width / 2, y: box.y + box.height / 2};
    // Gestures attach for every pointer (spec:AST-094 FR43): a click is the
    // tap's, once a double-click can no longer follow.
    await page.mouse.click(centre.x, centre.y);
    await page.waitForTimeout(150);
    expect(await alpha()).toBe(1);
    await expect.poll(alpha, {timeout: 3000}).toBe(0);
    await expect(dialog).toBeVisible();
    // The next click brings them back.
    await page.mouse.click(centre.x, centre.y);
    await expect.poll(alpha, {timeout: 3000}).toBe(1);
    // A double-click zooms in and hides them, as a double tap does.
    await page.mouse.dblclick(centre.x, centre.y);
    await expect(
      dialog.getByRole('button', {name: 'Zoom'}).first(),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(alpha, {timeout: 3000}).toBe(0);
    await expect(dialog).toBeVisible();
  } finally {
    await context.close();
  }
});

/** A story's viewer in a desktop context (a mouse, no touch), its photo loaded. */
async function openDesktopViewer(
  browser: Browser,
  story: 'core-lightbox--gallery-with-zoom' | 'core-lightbox--with-zoom',
) {
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800},
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg()}),
  );
  await openStory(page, storybook(), story);
  await page
    .getByRole('button', {
      name:
        story === 'core-lightbox--with-zoom'
          ? 'Open with zoom'
          : 'Open gallery with zoom',
    })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const photo =
    story === 'core-lightbox--with-zoom'
      ? dialog.locator('[data-lightbox-media] img').first()
      : dialog.locator('[data-current] img');
  await expect
    .poll(async () =>
      photo.evaluate(el => (el as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const box = await photo.boundingBox();
  if (box == null) {
    throw new Error('no photo');
  }
  const chrome = dialog.locator('[data-lightbox-chrome]').first();
  return {
    context,
    page,
    dialog,
    alpha: async () =>
      chrome.evaluate(el => parseFloat(getComputedStyle(el).opacity)),
    centre: {x: box.x + box.width / 2, y: box.y + box.height / 2},
  };
}

test('with a mouse, a click on the photo followed at once by a page change leaves the next photo its controls', async ({
  browser,
}) => {
  const v = await openDesktopViewer(
    browser,
    'core-lightbox--gallery-with-zoom',
  );
  try {
    await v.page.mouse.click(v.centre.x, v.centre.y);
    await v.page.keyboard.press('ArrowRight');
    await expect(v.dialog.getByText(/^\d+ \/ \d+$/)).toHaveText('2 / 4');
    await v.page.waitForTimeout(700);
    expect(await v.alpha()).toBe(1);
  } finally {
    await v.context.close();
  }
});

test('a keyboard focus on a hidden control brings them back', async ({
  page,
}) => {
  const v = await openGallery(page);
  await hideByTap(v, page);
  // Tab until the keyboard reaches a hidden control: the photo stage takes
  // focus too, for keyboard zoom.
  let onControl = false;
  for (let i = 0; i < 6 && !onControl; i++) {
    await page.keyboard.press('Tab');
    onControl = await page.evaluate(
      () => document.activeElement?.closest('[data-lightbox-chrome]') != null,
    );
  }
  expect(onControl).toBe(true);
  await waitForAnimation(v.chrome);
  await waitForRest(v.chrome);
  expect(await v.alpha(v.chrome)).toBe(1);
});

test('with the controls hidden, a tap where the caption sits shows them', async ({
  page,
}) => {
  // The first photo's caption sits below it, outside the photo's box.
  const v = await openGallery(page);
  await hideByTap(v, page);
  const caption = v.dialog.locator('[data-current] [data-lightbox-caption]');
  const box = await caption.boundingBox();
  if (box == null) {
    throw new Error('no caption');
  }
  const since = await page.evaluate(() => performance.now());
  await v.driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  await waitForAnimation(v.chrome, {since});
  await waitForRest(v.chrome);
  await expect(v.dialog).toBeVisible();
  expect(await v.alpha(v.chrome)).toBe(1);
});

test("the next photo's caption arrives hidden while the controls are", async ({
  page,
}) => {
  const v = await openGallery(page);
  await hideByTap(v, page);
  // Page forward twice: the third photo has a caption; its page mounts
  // while the controls are hidden.
  for (let i = 0; i < 2; i++) {
    await v.driver.play(
      drag(v.centre, {x: v.centre.x - 250, y: v.centre.y}, {durationMs: 200}),
    );
    await waitForRest(
      v.dialog.getByRole('button', {name: 'Zoom'}).locator(':scope > div'),
    );
    await frames(page, 2);
  }
  await expect(v.dialog).toHaveAccessibleName('Beach sunset');
  const caption = v.dialog.locator('[data-current] [data-lightbox-caption]');
  await expect(caption).toHaveText('Golden hour at the beach');
  expect(await v.alpha(caption)).toBe(0);
  expect(await v.alpha(v.chrome)).toBe(0);
});

test('a drag down keeps them hidden while the black fades with the backdrop, and a cancel brings them back with the black', async ({
  page,
}) => {
  const v = await openGallery(page);
  await hideByTap(v, page);
  const readings: {
    t: number;
    chrome: number;
    black: number;
    backdrop: number;
  }[] = [];
  // Pulled down 140 px, then brought back to the start before the lift: a
  // cancel.
  const down = {x: v.centre.x, y: v.centre.y + 140};
  const script = drag(v.centre, down, {durationMs: 400})
    .slice(0, -1)
    .concat(
      drag(down, {x: down.x, y: v.centre.y + 4}, {durationMs: 300, restMs: 150})
        .slice(1)
        .map(f => ({...f, t: f.t + 420})),
    );
  await v.driver.play(script, {
    onEvent: async step => {
      if (step.type !== 'touchMove' || step.t > 400) {
        return;
      }
      await frames(page, 1);
      readings.push({
        t: step.t,
        chrome: await v.alpha(v.chrome),
        black: await v.black(),
        backdrop: await v.dialog.evaluate(el =>
          parseFloat(getComputedStyle(el, '::backdrop').opacity),
        ),
      });
    },
  });
  expect(readings.length).toBeGreaterThan(5);
  for (const r of readings) {
    expect(r.chrome, `controls at ${r.t} ms`).toBe(0);
    expect(r.black, `black at ${r.t} ms`).toBeCloseTo(r.backdrop, 2);
  }
  expect(Math.min(...readings.map(r => r.black))).toBeLessThan(0.9);
  // The cancel springs the black back with the backdrop, and brings the
  // controls back as Photos does.
  await waitForRest(v.container);
  await waitForRest(v.chrome);
  await waitForRest(v.photo);
  await expect(v.dialog).toBeVisible();
  expect(await v.black()).toBe(1);
  expect(await v.alpha(v.chrome)).toBe(1);
});

test('the fade keeps changing the screen every frame while the main thread is blocked', async ({
  page,
}, testInfo) => {
  const v = await openGallery(page);
  const close = await v.dialog
    .getByRole('button', {name: 'Close'})
    .boundingBox();
  if (close == null) {
    throw new Error('no close button');
  }
  // A compositor-only control animation in the same recording: what the
  // compositor presented while the main thread spun, on this machine.
  await startBusyControl(page);
  const cast = await startScreencast(page);
  // Photos' fade lasts 0.2 s, so one blocked window holds only a few frames
  // of the control in WebKit: the controls hide, blocked inside the fade, six
  // times (shown again between), and the runs are judged pooled.
  const runs: {
    block: Awaited<ReturnType<typeof blockMainThread>>;
    restAt: number;
  }[] = [];
  for (let i = 0; i < 6; i++) {
    await v.driver.tap(v.centre);
    const block = await blockMainThread(page, 400, {
      during: v.chrome,
      minProgressMs: 16,
    });
    await waitForRest(v.chrome);
    expect(await v.alpha(v.chrome)).toBe(0);
    runs.push({block, restAt: await page.evaluate(() => performance.now())});
    if (i < 5) {
      // A single tap shows them again once a double tap can no longer follow.
      await v.driver.tap(v.centre);
      await expect.poll(async () => v.alpha(v.chrome), {timeout: 3000}).toBe(1);
    }
  }
  await page.waitForTimeout(100);
  const castFrames = await cast.stop();
  // The Close button's spot: its icon fades, then the background turns black.
  const signal = await regionSignal(page, castFrames, close);
  const control = await trackMarker(page, castFrames, {rgb: CONTROL_RGB});
  // Each run is judged until the spot is within 1 of where that run rests.
  const windows = runs.map(({block, restAt}) => {
    const run = signal.filter(c => c.t >= block.from && c.t <= restAt);
    const final = run.at(-1)?.value ?? 0;
    const settled =
      run.find(c => Math.abs(c.value - final) <= 1)?.t ?? block.to;
    return {from: block.from + 20, to: Math.min(block.to, settled) - 1};
  });
  // A change of the region's mean brightness by more than 0.05 counts, as
  // the signal's own judgment did; settled within 1 of its final value.
  const signalTracked = signalFrames(signal, 5);
  const proof = pooledBusyProof(
    windows.map(window => ({tracked: signalTracked, control, window})),
    {axis: 'y', settledWithin: 5},
  );
  await writeEvidence(
    'busy-main-thread/lightbox-chrome-hide',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {runs, windows, proof, signal, control},
        null,
        1,
      ),
    },
    testInfo,
  );
  for (const window of windows) {
    expect(window.to - window.from).toBeGreaterThan(100);
  }
  // Judged against the control over the six runs pooled: a two-core runner's
  // software compositor and the screencast share the core the block spins
  // on, so every compositor animation presents fewer frames there, the
  // control's too. The fade keeps changing the screen with the control, and
  // a main-thread fade would not.
  expect(proof.verdict.failures).toEqual([]);
  for (const run of proof.runs) {
    expect(run.monotonic).toBe(true);
  }
});

test('under Reduce Motion the fades are opacity only and last 200 ms or less', async ({
  page,
}) => {
  // design:reduced-motion DR2: on a touch screen, a cross-fade of opacity
  // alone, 200 ms or less.
  await page.emulateMedia({reducedMotion: 'reduce'});
  const v = await openGallery(page);
  await v.driver.tap(v.centre);
  await waitForAnimation(v.chrome);
  const held = await holdAnimations(page, v.dialog);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const times = timeline(duration);
  const chrome = await sampleCurve(v.chrome, times);
  const black = curveOf(
    await sampleCurve(v.container, times, {pseudoElement: '::before'}),
    'opacity',
  );
  await releaseAnimations(page);
  expect(duration).toBeLessThanOrEqual(205);
  const alphas = curveOf(chrome, 'opacity').map(c => c.value);
  for (let i = 1; i < alphas.length; i += 1) {
    expect(alphas[i]).toBeLessThanOrEqual(alphas[i - 1] + 1e-3);
  }
  // Nothing moves or scales.
  for (const sample of chrome) {
    expect(sample.transform.translateY).toBeCloseTo(0, 3);
    expect(sample.transform.scaleX).toBeCloseTo(1, 3);
  }
  expect(black.at(-1)?.value ?? 0).toBeCloseTo(1, 2);
  await waitForRest(v.chrome);
  expect(await v.alpha(v.chrome)).toBe(0);
});

test('on a video page the controls a photo hid come back, and a tap beside it closes only once they show', async ({
  page,
}) => {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg()}),
  );
  await page.route(
    'https://interactive-examples.mdn.mozilla.net/**',
    async route => route.abort(),
  );
  await openStory(page, storybook(), 'core-lightbox--gallery-with-video');
  const driver = await touchDriver(page);
  const trigger = await page
    .getByRole('button', {name: 'Open gallery with a video'})
    .boundingBox();
  if (trigger == null) {
    throw new Error('no trigger');
  }
  await driver.tap({
    x: trigger.x + trigger.width / 2,
    y: trigger.y + trigger.height / 2,
  });
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const photo = dialog.locator('[data-current] img');
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
  const chrome = dialog.locator('[data-lightbox-chrome]').first();
  const alpha = async () =>
    chrome.evaluate(el => parseFloat(getComputedStyle(el).opacity));
  await driver.tap({x: rect.x + rect.width / 2, y: rect.y + rect.height / 2});
  await waitForAnimation(chrome);
  await waitForRest(chrome);
  expect(await alpha()).toBe(0);
  // Swipe to the video.
  const y = rect.y + rect.height / 2;
  await driver.play(
    drag(
      {x: rect.x + rect.width * 0.85, y},
      {x: rect.x + rect.width * 0.1, y},
      {
        durationMs: 250,
      },
    ),
  );
  await expect(dialog.locator('[data-current] video')).toHaveCount(1);
  await waitForRest(chrome);
  await frames(page, 2);
  expect(await alpha()).toBe(1);
});

test('media that arrive after the viewer mounted: a tap on the photo still hides the controls', async ({
  page,
}) => {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg()}),
  );
  await openStory(page, storybook(), 'core-lightbox--media-arrives-later');
  const driver = await touchDriver(page);
  const button = page.getByRole('button', {name: 'Open the loaded gallery'});
  await expect(button).toBeEnabled();
  const b = await button.boundingBox();
  if (b == null) {
    throw new Error('no trigger');
  }
  await driver.tap({x: b.x + b.width / 2, y: b.y + b.height / 2});
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const photo = dialog.locator('[data-current] img');
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
  const chrome = dialog.locator('[data-lightbox-chrome]').first();
  await driver.tap({x: rect.x + rect.width / 2, y: rect.y + rect.height / 2});
  await waitForAnimation(chrome);
  await waitForRest(chrome);
  expect(
    await chrome.evaluate(el => parseFloat(getComputedStyle(el).opacity)),
  ).toBe(0);
});

test(
  'storyboard: a tap hides the controls',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const v = await openGallery(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    await v.driver.tap(v.centre);
    await waitForAnimation(v.chrome);
    // The controls' fade and the black after it, held and stepped together.
    const {storyboard} = await animationStoryboard(page, {
      name: 'lightbox-tap-hides-controls',
      clip: {x: 0, y: 0, width: viewport.width, height: viewport.height},
      measure: async () => ({
        controls: +(await v.alpha(v.chrome)).toFixed(2),
        black: +(await v.black()).toFixed(2),
      }),
      columns: 6,
      cellScale: 0.35,
    });
    await storyboard.write(testInfo);
  },
);
