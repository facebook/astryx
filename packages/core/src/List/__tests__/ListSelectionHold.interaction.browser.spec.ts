// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListSelectionHold.interaction.browser.spec.ts
 * @input The built List "Selection Hold" story (buttons and a slider standing
 *   in for a navigation stack), real touch input, the interaction harness,
 *   and the in-transition deselect clock (motion/uikit/list.ts)
 * @output Interaction and animation proofs for a row kept selected through a
 *   push: the tapped row stays selected after its press would have faded; a
 *   pop deselects it on UIKit's 350 ms linear curve, then the row's control
 *   has focus; a scrub sets the highlight from the progress and a cancel
 *   selects the row again at once; the deselect keeps advancing while the
 *   main thread is blocked, with no Layout or Paint; a storyboard of the
 *   deselect
 * @position Interaction evidence for utils/selectionHold.ts on Item rows
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  castStoryboard,
  compareCurve,
  countBetween,
  holdAnimations,
  openStory,
  releaseAnimations,
  seekAnimations,
  startScreencast,
  timeline,
  touchDriver,
  traceRendering,
  waitForAnimation,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';
import {list} from '../../motion/uikit/list';
import {
  blockBehindBeacon,
  installBeacon,
  samplePixel,
  sampleVideo,
} from './rowPixels';

const storybook = withStorybook(test);

const STORY = 'core-list--selection-hold';
const POP_MS = list.deselect.navigationPopMs;
/** Highlight = 1 − progress; the in-transition deselect is linear. */
const expectedHighlight = (t: number) =>
  1 - Math.min(1, Math.max(0, t / POP_MS));

const row = (page: Page) =>
  page.locator('[data-astryx-pressable]').filter({hasText: 'Sent'}).first();

const layerOpacity = async (target: Locator) =>
  target.evaluate(el => Number(getComputedStyle(el, '::before').opacity));

const pressState = async (target: Locator) =>
  target.evaluate(el => el.getAttribute('data-astryx-press'));

/** Taps "Sent" with a finger: the activation pushes, and the row is held. */
async function push(page: Page) {
  await openStory(page, storybook(), STORY);
  const target = row(page);
  await expect(target).toBeVisible();
  const box = await target.boundingBox();
  if (box == null) {
    throw new Error('no row');
  }
  const driver = await touchDriver(page);
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  await expect(page.getByTestId('pushed-screen')).toBeVisible();
  return {
    target,
    probe: {
      x: Math.round(box.x + box.width - 3),
      y: Math.round(box.y + box.height / 2),
    },
  };
}

test('the tapped row stays selected while the pushed screen covers it', async ({
  page,
}) => {
  const {target} = await push(page);
  // Well past the press's own release clock: the hold keeps it selected.
  await page.waitForTimeout(list.highlight.releaseMs + 300);
  expect(await pressState(target)).toBe('held');
  expect(await layerOpacity(target)).toBe(1);
});

test('a pop deselects the row on the in-transition curve, then its control has focus', async ({
  page,
}, testInfo) => {
  const {target} = await push(page);
  await page.getByRole('button', {name: 'Back'}).click();
  const held = await holdAnimations(page, target);
  // The deselect on the row's layer. (The motion foundation keeps a
  // pseudo-element's animation in effect past the curve, holding its end
  // value until script runs: only the first POP_MS are the curve.)
  const deselect = held.find(a => a.target?.startsWith('li'));
  expect(deselect, JSON.stringify(held)).toBeDefined();
  const samples: {t: number; value: number}[] = [];
  for (const t of timeline(POP_MS)) {
    await seekAnimations(page, t);
    samples.push({t, value: await layerOpacity(target)});
  }
  await releaseAnimations(page, {finish: true});
  const comparison = compareCurve(samples, expectedHighlight, 0.01);
  await writeEvidence(
    'curves/list-selection-hold-pop',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {popMs: POP_MS, held, samples, comparison},
        null,
        2,
      ),
    },
    testInfo,
  );
  expect(
    comparison.maxError,
    JSON.stringify(comparison.worst),
  ).toBeLessThanOrEqual(0.01);
  // The pop completed: the row is deselected and its own control has focus,
  // where a screen reader lands back.
  await expect.poll(async () => pressState(target)).toBeNull();
  expect(await layerOpacity(target)).toBe(0);
  expect(await target.evaluate(el => el.contains(document.activeElement))).toBe(
    true,
  );
});

test('a scrub sets the highlight from the progress; a cancel selects the row again at once', async ({
  page,
}) => {
  const {target} = await push(page);
  await page.getByLabel('Pop progress').fill('0.4');
  await expect.poll(async () => layerOpacity(target)).toBeCloseTo(0.6, 2);
  await page.getByLabel('Pop progress').fill('0.7');
  await expect.poll(async () => layerOpacity(target)).toBeCloseTo(0.3, 2);
  await page.getByRole('button', {name: 'Cancel pop'}).click();
  // Back to selected once the cancel settles, and still held for the next pop.
  await expect.poll(async () => layerOpacity(target)).toBe(1);
  expect(await pressState(target)).toBe('held');
  await page.getByRole('button', {name: 'Back'}).click();
  await expect.poll(async () => pressState(target)).toBeNull();
});

test('the deselect keeps advancing on every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright',
  );
  const {target, probe} = await push(page);
  const cast = await startScreencast(page);
  await page.waitForTimeout(100);
  await page.getByRole('button', {name: 'Back'}).click();
  const [started] = await waitForAnimation(target, {minProgressMs: 16});
  // The curve's own window (the animation holds its end value past it).
  const deselect = {from: started.from, to: started.from + POP_MS};
  const block = await blockMainThread(page, 600);
  await page.waitForTimeout(150);
  const frames = await cast.stop();
  const pixels = await samplePixel(page, frames, probe);
  const selected = pixels[0].value;
  const after = pixels.at(-1)?.value ?? 255;
  const highlight = (v: number) => (after - v) / (after - selected);
  const end = Math.min(block.to, deselect.to) - 10;
  const during = pixels.filter(p => p.t > block.from && p.t <= end);
  const highlights = during.map(p => ({
    t: +(p.t - block.from).toFixed(1),
    highlight: +highlight(p.value).toFixed(3),
  }));
  await writeEvidence(
    'busy-main-thread/list-selection-hold-pop',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, deselect, selected, after, highlights},
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, frames, {
    name: 'list-selection-hold-pop-busy-main-thread',
    zero: block.from,
    from: deselect.from - 40,
    to: deselect.to + 40,
    columns: 8,
    cellScale: 0.45,
    data: t => {
      const p = pixels.find(f => f.t === t);
      return {highlight: p == null ? -1 : +highlight(p.value).toFixed(3)};
    },
  });
  await film.write(testInfo, {block, deselect});
  // Selected before the pop, deselected after.
  expect(after - selected).toBeGreaterThan(10);
  // Frames kept coming through the block, each one further along.
  expect(during.length, JSON.stringify(highlights)).toBeGreaterThanOrEqual(
    Math.floor((end - block.from) / (1000 / 60)) - 2,
  );
  for (let i = 1; i < highlights.length; i++) {
    expect(highlights[i].highlight).toBeLessThanOrEqual(
      highlights[i - 1].highlight + 0.01,
    );
  }
  const last = highlights.at(-1);
  expect(last).toBeDefined();
  expect(highlights[0].highlight).toBeGreaterThan((last?.highlight ?? 1) + 0.3);
});

test('WebKit: the deselect keeps advancing while the main thread is blocked (video)', async ({
  browser,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'webkit',
    'the Chromium screencast test covers Chromium',
  );
  const size = {width: 402, height: 714};
  const context = await browser.newContext({
    viewport: size,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    recordVideo: {dir: testInfo.outputPath('video'), size},
  });
  const page = await context.newPage();
  const {target, probe} = await push(page);
  await installBeacon(page);
  await page.waitForTimeout(300);
  await page.getByRole('button', {name: 'Back'}).click();
  await waitForAnimation(target, {minProgressMs: 1});
  await blockBehindBeacon(page, 600);
  await page.waitForTimeout(500);
  const video = page.video();
  await context.close();
  const path = await video?.path();
  expect(path).toBeTruthy();
  const samples = await sampleVideo(path as string, probe, size);
  const blocked = samples.filter(s => s.beacon === 'blocked');
  const deselected = Math.max(
    ...samples.filter(s => s.beacon === 'after').map(s => s.value),
  );
  // Judged while the deselect moves: the Linux WebKit build hands an
  // animation that ends inside a block back to the value the main thread last
  // committed until script runs (see ListRowPress's WebKit proof; iOS Safari
  // holds the end value), so the frames are judged up to that drop.
  const dropAt = blocked.findIndex(
    (s, i) => i > 0 && s.value < blocked[i - 1].value - 1,
  );
  const moving = dropAt === -1 ? blocked : blocked.slice(0, dropAt);
  const distinct = moving
    .map(s => Math.round(s.value))
    .filter((v, i, all) => i === 0 || v !== all[i - 1]);
  await writeEvidence(
    'busy-main-thread/list-selection-hold-pop-webkit',
    {'webkit.json': JSON.stringify({deselected, blocked, distinct}, null, 1)},
    testInfo,
  );
  expect(blocked.length).toBeGreaterThan(0);
  // The row kept getting lighter while script could not run, to within a
  // frame of its deselected color.
  expect(distinct.length, JSON.stringify(distinct)).toBeGreaterThanOrEqual(3);
  for (let i = 1; i < distinct.length; i++) {
    expect(distinct[i]).toBeGreaterThan(distinct[i - 1]);
  }
  expect(distinct.at(-1) ?? 0).toBeGreaterThanOrEqual(deselected - 4);
});

test('the deselect does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {target} = await push(page);
  let deselect = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await page.getByRole('button', {name: 'Back'}).click();
    const [started] = await waitForAnimation(target);
    // The curve's own window (the animation holds its end value past it).
    deselect = {from: started.from, to: started.from + POP_MS};
    await page.waitForTimeout(POP_MS + 100);
  });
  const during = countBetween(trace, deselect.from + 30, deselect.to - 30);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
});

test(
  'storyboard: a held row deselected by a pop',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {target} = await push(page);
    const box = await target.boundingBox();
    if (box == null) {
      throw new Error('no row');
    }
    await page.getByRole('button', {name: 'Back'}).click();
    const {storyboard} = await animationStoryboard(page, {
      name: 'list-selection-hold-pop',
      clip: {x: 0, y: box.y - 8, width: 402, height: box.height + 16},
      scope: target,
      times: [0, 50, 100, 175, 250, 300, POP_MS],
      columns: 7,
      cellScale: 0.5,
      measure: async () => ({opacity: await layerOpacity(target)}),
    });
    await releaseAnimations(page, {finish: true});
    await storyboard.write(testInfo);
  },
);
