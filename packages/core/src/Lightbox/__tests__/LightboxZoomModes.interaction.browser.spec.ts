// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxZoomModes.interaction.browser.spec.ts
 * @input The built "With zoom" Lightbox story, its photo served as a
 *   3000 × 2000 test image; the phone project's touch input (Chromium CDP /
 *   WebKit's input command), a desktop context with a mouse, and the
 *   interaction harness
 * @output Proofs for the zoom stage beyond the finger's model: with a fine
 *   pointer (a desktop) the stage keeps its plain layout (the stretch that
 *   fills the viewer is for a coarse pointer only) and the photo fits as
 *   before; under Reduce Motion a double tap reaches its zoom by a
 *   cross-fade (the photo dips out and back in at the new scale) instead of
 *   travelling; with a mouse a zoomed drag stops at the edge instead of
 *   rubber-banding, and a drag released while moving stops where it is (no
 *   coast); under Reduce Motion, + then -
 *   pressed 150 ms apart leave the photo at full opacity, also after
 *   reopening; with zoom off, a tap on the dark area around the photo still
 *   closes the viewer on a touch screen; under Reduce Motion
 *   (design:reduced-motion) a touch zoom fades in 200 ms or less, a keyboard
 *   zoom with a fine pointer completes at once, a pinch released past the
 *   maximum settles with no travel, and a zoomed flick coasts on and
 *   settles at the edge, as does a photo pulled past it (DR2, DEC-2)
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
  curveOf,
  drag,
  flick,
  frames,
  holdAnimations,
  openStory,
  pinch,
  releaseAnimations,
  sampleCurve,
  timeline,
  touchDriver,
  waitForAnimation,
  waitForRest,
  withStorybook,
  type TouchScript,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** Where the photo shows: its transform, size and stage. */
async function readTransform(img: Locator) {
  return img.evaluate(el => {
    const style = getComputedStyle(el);
    const [x = '0', y = '0'] =
      style.translate === 'none' ? [] : style.translate.split(' ');
    const parent = el.parentElement as HTMLElement;
    const stage = parent.getBoundingClientRect();
    return {
      x: parseFloat(x),
      y: parseFloat(y),
      scale: style.scale === 'none' ? 1 : parseFloat(style.scale),
      width: (el as HTMLElement).offsetWidth,
      left: (el as HTMLElement).offsetLeft,
      stage: {
        x: stage.x + parent.clientLeft,
        y: stage.y + parent.clientTop,
        width: parent.clientWidth,
        height: parent.clientHeight,
      },
    };
  });
}

/** The story on a desktop: a fine pointer (a mouse), no touch. */
async function openDesktop(browser: Browser) {
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800},
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  // A fine primary pointer in this context (the interaction config can report
  // a coarse one without touch).
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
  await routePhoto(page);
  await openStory(page, storybook(), 'core-lightbox--with-zoom');
  await page.getByRole('button', {name: 'Open with zoom'}).click();
  const dialog = page.getByRole('dialog', {name: 'Forest path'});
  await expect(dialog).toBeVisible();
  const img = dialog.getByRole('img', {name: 'Forest path'});
  await decoded(img);
  await frames(page, 2);
  return {context, page, img, read: async () => readTransform(img)};
}

async function openPhone(page: Page, size = {width: 3000, height: 2000}) {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: photoSvg(size.width, size.height),
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
  const img = dialog.getByRole('img', {name: 'Forest path'});
  await expect
    .poll(async () => img.evaluate(el => (el as HTMLImageElement).naturalWidth))
    .toBe(size.width);
  await waitForRest(img);
  await frames(page, 2);
  const read = async () => readTransform(img);
  return {driver, img, read};
}

function photoSvg(width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#fff"/><circle cx="${width / 2}" cy="${height / 2}" r="${height / 4}" fill="#d22"/></svg>`;
}

async function routePhoto(page: Page) {
  await page.route('https://picsum.photos/**', async route =>
    route.fulfill({contentType: 'image/svg+xml', body: photoSvg(3000, 2000)}),
  );
}

async function decoded(img: Locator) {
  await expect
    .poll(async () => img.evaluate(el => (el as HTMLImageElement).naturalWidth))
    .toBe(3000);
}

function doubleTap(at: {x: number; y: number}): TouchScript {
  return [
    {t: 0, fingers: [{id: 0, ...at}]},
    {t: 50, fingers: []},
    {t: 170, fingers: [{id: 0, ...at}]},
    {t: 220, fingers: []},
  ];
}

test('with a fine pointer (a desktop) the stage keeps its plain layout: only a coarse pointer stretches it to fill the viewer', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800},
    hasTouch: false,
    isMobile: false,
  });
  try {
    const page = await context.newPage();
    await routePhoto(page);
    await openStory(page, storybook(), 'core-lightbox--with-zoom');
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    await page.getByRole('button', {name: 'Open with zoom'}).click();
    const dialog = page.getByRole('dialog', {name: 'Forest path'});
    await expect(dialog).toBeVisible();
    const stage = dialog.getByRole('button', {name: 'Zoom'});
    const img = dialog.getByRole('img', {name: 'Forest path'});
    await decoded(img);
    await frames(page, 2);
    // The stage and its group keep their plain layout: the stretch that
    // makes the stage fill the viewer applies to a coarse pointer only.
    const layout = await stage.evaluate(el => {
      const own = getComputedStyle(el);
      const group = getComputedStyle(el.parentElement as HTMLElement);
      return {
        stage: [own.alignSelf, own.flexGrow],
        group: [group.alignSelf, group.flexGrow],
      };
    });
    expect(layout.stage[0]).not.toBe('stretch');
    expect(layout.stage[1]).toBe('0');
    expect(layout.group[0]).not.toBe('stretch');
    expect(layout.group[1]).toBe('0');
    // The photo fits inside the viewer, as before.
    const imgBox = await img.boundingBox();
    if (imgBox == null) {
      throw new Error('no photo');
    }
    expect(imgBox.width).toBeLessThanOrEqual(1280);
    expect(imgBox.height).toBeLessThanOrEqual(800);
    expect(imgBox.width / imgBox.height).toBeCloseTo(1.5, 2);
  } finally {
    await context.close();
  }
});

test('under Reduce Motion a double tap cross-fades to its zoom instead of travelling', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await routePhoto(page);
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
  const img = dialog.getByRole('img', {name: 'Forest path'});
  await decoded(img);
  await waitForRest(img);
  await frames(page, 2);
  const rect = await img.boundingBox();
  if (rect == null) {
    throw new Error('no photo');
  }
  await driver.play(
    doubleTap({x: rect.x + rect.width / 2, y: rect.y + rect.height / 2}),
  );
  await waitForAnimation(img);
  const held = await holdAnimations(page, img);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const samples = await sampleCurve(img, timeline(duration));
  await releaseAnimations(page);
  // The photo fades out and back in; the new scale lands while it is
  // transparent (design:reduced-motion DR1: no travel). DR2: on a touch
  // screen, a fade of 200 ms or less.
  const opacity = curveOf(samples, 'opacity').map(s => s.value);
  expect(Math.min(...opacity)).toBeLessThan(0.1);
  expect(duration).toBeLessThanOrEqual(205);
  // The landing is a timed write between the fade out and the fade back in
  // (no animation runs then): wait for the photo to be opaque again.
  await expect
    .poll(async () =>
      img.evaluate(el => parseFloat(getComputedStyle(el).opacity)),
    )
    .toBe(1);
  expect(
    await img.evaluate(el => parseFloat(getComputedStyle(el).scale)),
  ).toBeGreaterThan(1.5);
});

test('with a mouse a zoomed drag stops at the edge instead of rubber-banding', async ({
  browser,
}) => {
  const {context, page, img, read} = await openDesktop(browser);
  try {
    const before = await read();
    const y = before.stage.y + before.stage.height / 2;
    const left = before.stage.x + 100;
    await page.mouse.dblclick(left, y);
    await waitForAnimation(img);
    await waitForRest(img);
    const zoomed = await read();
    expect(zoomed.scale).toBeGreaterThan(1.5);
    // The photo's left edge at the stage's: x is minus the fitted photo's
    // offset in the stage (0 where the stage hugs it).
    const edge = -(zoomed.stage.width - zoomed.width) / 2;
    // Right by 600 px: far past the photo's left edge.
    await page.mouse.move(left, y);
    await page.mouse.down();
    const xs: number[] = [];
    for (let i = 1; i <= 20; i += 1) {
      await page.mouse.move(left + i * 30, y);
      xs.push((await read()).x);
    }
    await page.mouse.up();
    expect(Math.max(...xs)).toBeCloseTo(edge, 1);
    await frames(page, 10);
    expect((await read()).x).toBeCloseTo(edge, 1);
  } finally {
    await context.close();
  }
});

test('with a mouse a drag released while moving stops where it is: no coast', async ({
  browser,
}) => {
  const {context, page, img, read} = await openDesktop(browser);
  try {
    const before = await read();
    const y = before.stage.y + before.stage.height / 2;
    const cx = before.stage.x + before.stage.width / 2;
    await page.mouse.dblclick(cx, y);
    await waitForAnimation(img);
    await waitForRest(img);
    await page.mouse.move(cx, y);
    await page.mouse.down();
    for (let i = 1; i <= 5; i += 1) {
      await page.mouse.move(cx - i * 40, y);
    }
    const lifted = (await read()).x;
    await page.mouse.up();
    await frames(page, 20);
    expect((await read()).x).toBeCloseTo(lifted, 0);
    expect(
      await img.evaluate(
        el => el.getAnimations().filter(a => a.playState === 'running').length,
      ),
    ).toBe(0);
  } finally {
    await context.close();
  }
});

test('under Reduce Motion, + then - pressed 150 ms apart leave the photo at full opacity, also after reopening', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {img} = await openPhone(page);
  const dialog = page.getByRole('dialog', {name: 'Forest path'});
  const opacity = async () =>
    img.evaluate(el => parseFloat(getComputedStyle(el).opacity));
  await dialog.getByRole('button', {name: 'Zoom'}).focus();
  // The second key lands mid-dip of the first one's cross-fade.
  await page.keyboard.press('+');
  await page.waitForTimeout(150);
  await page.keyboard.press('-');
  await page.waitForTimeout(800);
  await waitForRest(img);
  expect(await opacity()).toBeCloseTo(1, 3);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await page.getByRole('button', {name: 'Open with zoom'}).click();
  await expect(dialog).toBeVisible();
  await waitForRest(img);
  await frames(page, 2);
  expect(await opacity()).toBeCloseTo(1, 3);
});

test('with zoom off, a tap on the dark area around the photo closes the viewer on a touch screen', async ({
  page,
}) => {
  await routePhoto(page);
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
  const img = dialog.getByRole('img');
  await decoded(img);
  await frames(page, 2);
  const photo = await img.boundingBox();
  const viewport = page.viewportSize();
  if (photo == null || viewport == null) {
    throw new Error('no photo');
  }
  // Below the photo: the dark area, not a stage stretched over it.
  await driver.tap({
    x: photo.x + photo.width / 2,
    y: Math.min(photo.y + photo.height + 80, viewport.height - 20),
  });
  await expect(dialog).toBeHidden();
});

test('under Reduce Motion a keyboard zoom with a fine pointer completes at once', async ({
  browser,
}) => {
  // design:reduced-motion DR3: on any pointer but a coarse one, at once.
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
    await routePhoto(page);
    await openStory(page, storybook(), 'core-lightbox--with-zoom');
    await page.getByRole('button', {name: 'Open with zoom'}).click();
    const dialog = page.getByRole('dialog', {name: 'Forest path'});
    await expect(dialog).toBeVisible();
    const img = dialog.getByRole('img', {name: 'Forest path'});
    await decoded(img);
    await frames(page, 2);
    await dialog.getByRole('button', {name: 'Zoom'}).focus();
    await page.keyboard.press('+');
    await frames(page, 1);
    const now = await img.evaluate(el => ({
      running: el.getAnimations().filter(a => a.playState === 'running').length,
      scale: parseFloat(getComputedStyle(el).scale),
      opacity: parseFloat(getComputedStyle(el).opacity),
    }));
    expect(now.running).toBe(0);
    expect(now.scale).toBeGreaterThan(1.5);
    expect(now.opacity).toBe(1);
  } finally {
    await context.close();
  }
});

test('under Reduce Motion a pinch released past the maximum settles in place, with no travel', async ({
  page,
}) => {
  // design:reduced-motion DR1–DR2: what a release starts fades; it never
  // moves or scales on its way back.
  await page.emulateMedia({reducedMotion: 'reduce'});
  // A small photo: its maximum zoom (under 4.5x at any pixel ratio) is
  // well within the pinch's 10x.
  const {driver, img, read} = await openPhone(page, {width: 300, height: 200});
  const s = await read();
  const centre = {
    x: s.stage.x + s.stage.width / 2,
    y: s.stage.y + s.stage.height / 2,
  };
  let released = 1;
  await driver.play(
    pinch({
      center: centre,
      fromDistance: 60,
      toDistance: 600,
      durationMs: 400,
      restMs: 80,
    }),
    {
      onEvent: async step => {
        if (step.type === 'touchMove') {
          released = (await read()).scale;
        }
      },
    },
  );
  await waitForAnimation(img);
  const held = await holdAnimations(page, img);
  const duration = Math.max(...held.map(a => a.curveEndMs));
  const opacity = curveOf(
    await sampleCurve(img, timeline(duration)),
    'opacity',
  ).map(x => x.value);
  await releaseAnimations(page);
  // It fades out and back in while the scale lands at the maximum,
  // transparent: no travel back.
  expect(duration).toBeLessThanOrEqual(205);
  expect(Math.min(...opacity)).toBeLessThan(0.1);
  // The scale lands in a timed write while the photo is transparent: wait
  // for it, then for the photo to be opaque again.
  await expect.poll(async () => (await read()).scale).toBeLessThan(released);
  await expect
    .poll(async () =>
      img.evaluate(el => parseFloat(getComputedStyle(el).opacity)),
    )
    .toBe(1);
  expect((await read()).scale).toBeGreaterThan(1.5);
});

/** The photo's box and its stage's, in page px. */
async function edges(img: Locator) {
  return img.evaluate(el => {
    const photo = el.getBoundingClientRect();
    const stage = (el.parentElement as HTMLElement).getBoundingClientRect();
    return {
      photo: {left: photo.left, right: photo.right},
      stage: {left: stage.left, right: stage.right},
    };
  });
}

test('under Reduce Motion a zoomed flick coasts on and settles at the edge, as on iOS', async ({
  page,
}) => {
  // design:reduced-motion DR2 and DEC-2: momentum that continues a throw is
  // the person's own movement, so it coasts and settles at an edge, with no
  // cross-fade.
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, img, read} = await openPhone(page);
  const s = await read();
  const mid = {
    x: s.stage.x + s.stage.width / 2,
    y: s.stage.y + s.stage.height / 2,
  };
  await driver.play(doubleTap(mid));
  await waitForRest(img);
  await frames(page, 2);
  let lifted = Number.NaN;
  await driver.play(flick(mid, {velocity: {x: -1500, y: 0}, durationMs: 80}), {
    onEvent: async step => {
      if (step.type === 'touchEnd') {
        lifted = (await read()).x;
      }
    },
  });
  const opacities = await img.evaluate(
    async el =>
      new Promise<number[]>(resolve => {
        const seen: number[] = [];
        const start = performance.now();
        const tick = (now: number) => {
          seen.push(parseFloat(getComputedStyle(el).opacity));
          if (now - start < 600) {
            requestAnimationFrame(tick);
          } else {
            resolve(seen);
          }
        };
        requestAnimationFrame(tick);
      }),
  );
  await waitForRest(img);
  // It coasted on past where the finger lifted.
  expect((await read()).x).toBeLessThan(lifted - 20);
  // No cross-fade.
  expect(Math.min(...opacities)).toBe(1);
  // It rests with no gap at the stage's edges.
  const {photo, stage} = await edges(img);
  expect(photo.left).toBeLessThanOrEqual(stage.left + 0.5);
  expect(photo.right).toBeGreaterThanOrEqual(stage.right - 0.5);
});

test('under Reduce Motion a zoomed photo pulled past its edge settles back to it', async ({
  page,
}) => {
  // The coast's settle at an edge (DR2): released still past the edge, the
  // photo returns to it instead of staying out.
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, img, read} = await openPhone(page);
  const s = await read();
  const y = s.stage.y + s.stage.height / 2;
  // A double tap near the photo's left edge zooms it with that edge on the
  // stage's.
  await driver.play(doubleTap({x: s.stage.x + 12, y}));
  await waitForRest(img);
  await frames(page, 2);
  const zoomed = await edges(img);
  expect(Math.abs(zoomed.photo.left - zoomed.stage.left)).toBeLessThan(0.5);
  let pastAtLift = Number.NaN;
  const from = {x: s.stage.x + s.stage.width / 2, y};
  await driver.play(
    drag(from, {x: from.x + 160, y}, {durationMs: 500, restMs: 150}),
    {
      onEvent: async step => {
        if (step.type === 'touchEnd') {
          const now = await edges(img);
          pastAtLift = now.photo.left - now.stage.left;
        }
      },
    },
  );
  // The pull took it past the edge (the rubber band gives).
  expect(pastAtLift).toBeGreaterThan(10);
  await waitForRest(img);
  const {photo, stage} = await edges(img);
  expect(photo.left).toBeLessThanOrEqual(stage.left + 0.5);
});
