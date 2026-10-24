// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LightboxZoomModes.interaction.browser.spec.ts
 * @input The built "With zoom" Lightbox story, its photo served as a
 *   3000 × 2000 test image; the phone project's touch input (Chromium CDP /
 *   WebKit's input command), a desktop context with a mouse, and the
 *   interaction harness
 * @output Proofs for the zoom stage outside plain touch: with a fine pointer
 *   (a desktop) the stage keeps its plain layout (the stretch that fills
 *   the viewer is for a coarse pointer only) and the photo fits as before; under Reduce Motion a double tap reaches its zoom by a cross-fade
 *   (the photo dips out and back in at the new scale) instead of travelling
 * @position Interaction tests for Lightbox (browser), beside
 *   LightboxZoom.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  curveOf,
  frames,
  holdAnimations,
  openStory,
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
  const scales = curveOf(samples, 'scaleX').map(s => s.value);
  const opacity = curveOf(samples, 'opacity').map(s => s.value);
  const end = scales.at(-1) ?? 1;
  // The scale jumps once (at the bottom of the dip); the photo fades out
  // and back in around it.
  expect(end).toBeGreaterThan(1.5);
  for (const scale of scales) {
    expect(Math.min(Math.abs(scale - 1), Math.abs(scale - end))).toBeLessThan(
      0.001,
    );
  }
  expect(Math.min(...opacity)).toBeLessThan(0.1);
  expect(opacity.at(-1)).toBeCloseTo(1, 2);
  await waitForRest(img);
  expect(
    await img.evaluate(el => parseFloat(getComputedStyle(el).scale)),
  ).toBeCloseTo(end, 3);
});
