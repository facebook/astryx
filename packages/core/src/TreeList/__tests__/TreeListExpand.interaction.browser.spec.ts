// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TreeListExpand.interaction.browser.spec.ts
 * @input The built TreeList story, real touch input (Chromium CDP / WebKit's
 *   input command), the interaction harness, and the outline spring from the
 *   UIKit constants table (motion/uikit/list.ts)
 * @output Interaction and animation proofs for a TreeList row's expand and
 *   collapse on a touch screen: the children slide out from under the parent
 *   as one block inside the group's clip, the rows below move with them and
 *   the chevron turns, all on the outline spring, sampled frame by frame; a
 *   collapse slides them back and removes them with no jump; the rows below
 *   keep moving while the main thread is blocked, with no Layout or Paint; a
 *   storyboard of the expand
 * @position Interaction evidence for TreeList/useTreeExpansionMotion.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  compareCurve,
  countBetween,
  holdAnimations,
  markElement,
  openStory,
  releaseAnimations,
  seekAnimations,
  startScreencast,
  timeline,
  touchDriver,
  trackMarker,
  traceRendering,
  waitForAnimation,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';
import {
  blockBehindBeacon,
  installBeacon,
  sampleVideoPoints,
} from '../../List/__tests__/rowPixels';
import {solveSpring, toSpring} from '../../motion/spring';
import {list} from '../../motion/uikit/list';

const storybook = withStorybook(test);

const STORY = 'core-treelist--basic';
const SPRING = toSpring(list.update.outlineSpring);
/** The spring's progress (0 → 1) t ms after it starts. */
const progress = (t: number) =>
  solveSpring(SPRING, {from: 0, to: 1}).value(t / 1000);
/** Where it settles: every sampled curve is judged up to here. */
const SETTLE_MS =
  solveSpring(SPRING, {from: 0, to: 1}).settleTime(0.001) * 1000;

/** A tree row by its item id (an ancestor row contains its label too). */
const treeItem = (page: Page, id: string) =>
  page.locator(`[role="treeitem"][data-tree-id="${id}"]`);

/** The toggle of the "components" folder, its group, a child and a row below. */
function parts(page: Page) {
  const parent = treeItem(page, 'components');
  return {
    parent,
    // Its own toggle, group and chevron: not a descendant row's.
    toggle: parent.locator(':scope > :not([role="group"]) [data-tree-toggle]'),
    group: parent.locator(':scope > [role="group"]'),
    chevron: parent.locator(
      ':scope > :not([role="group"]) [data-tree-chevron]',
    ),
    child: treeItem(page, 'button'),
    below: treeItem(page, 'app'),
  };
}

/** The `y` of an element's `translate`, as the engine presents it. */
const translateY = async (element: Locator) =>
  element.evaluate(el => {
    const value = getComputedStyle(el).translate;
    if (value === 'none' || value === '') {
      return 0;
    }
    const [, y = '0px'] = value.split(' ');
    return Number.parseFloat(y);
  });

/** The additive `rotate` on the chevron, degrees. */
const rotation = async (element: Locator) =>
  element.evaluate(el => {
    const value = getComputedStyle(el).rotate;
    return value === 'none' || value === '' ? 0 : Number.parseFloat(value);
  });

async function tapToggle(page: Page) {
  const {toggle} = parts(page);
  const box = await toggle.boundingBox();
  if (box == null) {
    throw new Error('no toggle');
  }
  const driver = await touchDriver(page);
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
}

async function open(page: Page) {
  await openStory(page, storybook(), STORY);
  const touch = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches,
  );
  test.skip(!touch, 'the expansion moves on a touch screen only');
  await expect(parts(page).below).toBeVisible();
}

test('expand: the children slide out from under the parent, the rows below move with them, the chevron turns, on the outline spring', async ({
  page,
}, testInfo) => {
  await open(page);
  const {group, child, below, chevron} = parts(page);
  const belowBefore = (await below.boundingBox())?.y ?? 0;
  await tapToggle(page);
  await expect(child).toBeVisible();
  const held = await holdAnimations(page);
  expect(held.length, JSON.stringify(held)).toBeGreaterThan(0);
  const height = await group.evaluate(el => (el as HTMLElement).offsetHeight);
  expect(await group.evaluate(el => getComputedStyle(el).overflow)).toBe(
    'clip',
  );
  const samples: {t: number; child: number; below: number; chevron: number}[] =
    [];
  for (const t of timeline(SETTLE_MS)) {
    await seekAnimations(page, t);
    samples.push({
      t,
      child: await translateY(child),
      below: await translateY(below),
      chevron: await rotation(chevron),
    });
  }
  await releaseAnimations(page, {finish: true});
  // The block and the rows below travel the group's height together; the
  // chevron turns the quarter turn; one spring for all three.
  const offset = (t: number) => -height * (1 - progress(t));
  const turn = (t: number) => -90 * (1 - progress(t));
  const childCurve = compareCurve(
    samples.map(s => ({t: s.t, value: s.child})),
    offset,
    0.5,
  );
  const belowCurve = compareCurve(
    samples.map(s => ({t: s.t, value: s.below})),
    offset,
    0.5,
  );
  const chevronCurve = compareCurve(
    samples.map(s => ({t: s.t, value: s.chevron})),
    turn,
    0.5,
  );
  await writeEvidence(
    'curves/tree-list-expand',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          spring: list.update.outlineSpring,
          height,
          samples,
          childCurve,
          belowCurve,
          chevronCurve,
        },
        null,
        2,
      ),
    },
    testInfo,
  );
  expect(samples[0].child).toBeCloseTo(-height, 0);
  expect(childCurve.maxError, JSON.stringify(childCurve.worst)).toBeLessThan(
    0.5,
  );
  expect(belowCurve.maxError, JSON.stringify(belowCurve.worst)).toBeLessThan(
    0.5,
  );
  expect(
    chevronCurve.maxError,
    JSON.stringify(chevronCurve.worst),
  ).toBeLessThan(0.5);
  // At rest: the clip is gone, nothing is translated, the row below sits a
  // group's height lower than before.
  await expect
    .poll(async () => group.evaluate(el => getComputedStyle(el).overflow))
    .not.toBe('clip');
  expect(await translateY(below)).toBe(0);
  expect(((await below.boundingBox())?.y ?? 0) - belowBefore).toBeCloseTo(
    height,
    0,
  );
});

test('collapse: the children slide back under the parent, then leave, with no jump', async ({
  page,
}) => {
  await open(page);
  const {group, child, below} = parts(page);
  const belowCollapsed = (await below.boundingBox())?.y ?? 0;
  await tapToggle(page);
  await expect(child).toBeVisible();
  await expect.poll(async () => translateY(below)).toBe(0);
  await expect
    .poll(async () => group.evaluate(el => getComputedStyle(el).overflow))
    .not.toBe('clip');
  const height = await group.evaluate(el => (el as HTMLElement).offsetHeight);

  await tapToggle(page);
  // Still rendered while it slides away, but out of reach.
  await expect(group).toHaveAttribute('inert', '');
  await holdAnimations(page);
  await seekAnimations(page, SETTLE_MS / 3);
  const midway = await translateY(below);
  expect(midway).toBeLessThan(-1);
  expect(midway).toBeGreaterThan(-height + 1);
  await releaseAnimations(page, {finish: true});
  // Gone, and the row below sits where it sat before the expand: the commit
  // that removed the children took the translate back with it.
  await expect(group).toHaveCount(0);
  expect(await translateY(below)).toBe(0);
  expect((await below.boundingBox())?.y ?? 0).toBeCloseTo(belowCollapsed, 0);
});

test('the rows below keep moving on every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright',
  );
  await open(page);
  const {below} = parts(page);
  const unmark = await markElement(below);
  const cast = await startScreencast(page);
  await page.waitForTimeout(100);
  await tapToggle(page);
  await waitForAnimation(below, {minProgressMs: 16});
  const block = await blockMainThread(page, 300);
  await page.waitForTimeout(200);
  const frames = await cast.stop();
  await unmark();
  const tracked = await trackMarker(page, frames);
  const proof = busyWindowProof(tracked, block, {
    axis: 'y',
    settledWithin: 1,
  });
  await writeEvidence(
    'busy-main-thread/tree-list-expand',
    {[`${testInfo.project.name}.json`]: JSON.stringify(proof, null, 1)},
    testInfo,
  );
  // Frames kept coming through the block, each one further down.
  expect(proof.changed, JSON.stringify(proof)).toBeGreaterThanOrEqual(3);
  expect(proof.monotonic, JSON.stringify(proof)).toBe(true);
  expect(proof.longestStallMs, JSON.stringify(proof)).toBeLessThan(40);
});

test('WebKit: the rows below keep moving while the main thread is blocked (video)', async ({
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
  await open(page);
  const {group, below} = parts(page);
  // The height the rows below travel: expand once, read it, collapse again.
  await tapToggle(page);
  await expect.poll(async () => translateY(below)).toBe(0);
  const height = await group.evaluate(el => (el as HTMLElement).offsetHeight);
  await tapToggle(page);
  await expect(group).toHaveCount(0);
  // The row below carries a marker chip; probes every 4 px along its path
  // read where the chip is in each recorded frame.
  await markElement(below);
  const chip = await page.evaluate(() => {
    const el = document.querySelector('[data-harness-marker-chip]');
    const box = el?.getBoundingClientRect();
    return box == null
      ? null
      : {x: box.x + box.width / 2, y: box.y + box.height / 2};
  });
  if (chip == null) {
    throw new Error('no marker chip');
  }
  const probes = Array.from({length: Math.floor(height / 4) + 1}, (_, k) => ({
    x: Math.round(chip.x),
    y: Math.round(chip.y + k * 4),
  }));
  await installBeacon(page);
  await page.waitForTimeout(300);
  await tapToggle(page);
  await waitForAnimation(below, {minProgressMs: 1});
  await blockBehindBeacon(page, 300);
  await page.waitForTimeout(400);
  const video = page.video();
  await context.close();
  const path = await video?.path();
  expect(path).toBeTruthy();
  const samples = await sampleVideoPoints(path as string, probes, size);
  /** Where the chip is: the mean probe index it covers, in px down its path. */
  const position = (marker: ReadonlyArray<boolean>) => {
    const hits = marker.flatMap((hit, k) => (hit ? [k] : []));
    return hits.length === 0
      ? null
      : (hits.reduce((a, b) => a + b, 0) / hits.length) * 4;
  };
  const blocked = samples
    .filter(s => s.beacon === 'blocked')
    .map(s => ({t: s.t, y: position(s.marker)}))
    .filter((s): s is {t: number; y: number} => s.y != null);
  const distinct = blocked
    .map(s => Math.round(s.y))
    .filter((v, i, all) => i === 0 || v !== all[i - 1]);
  await writeEvidence(
    'busy-main-thread/tree-list-expand-webkit',
    {'webkit.json': JSON.stringify({height, blocked, distinct}, null, 1)},
    testInfo,
  );
  // The row kept moving down while script could not run.
  expect(distinct.length, JSON.stringify(distinct)).toBeGreaterThanOrEqual(3);
  for (let i = 1; i < distinct.length; i++) {
    expect(distinct[i]).toBeGreaterThan(distinct[i - 1]);
  }
});

test('the expand does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  await open(page);
  const {parent, below} = parts(page);
  // Expanded from the keyboard (an iPad's): the same motion, with no press
  // feedback of the toggle's own in the trace.
  await parent.focus();
  let window = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await page.keyboard.press('ArrowRight');
    const [started] = await waitForAnimation(below);
    window = {from: started.from, to: started.from + SETTLE_MS};
    await page.waitForTimeout(SETTLE_MS + 100);
  });
  const during = countBetween(trace, window.from + 30, window.to - 30);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
});

test(
  'storyboard: a TreeList row expanding on a touch screen',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    await open(page);
    await tapToggle(page);
    const {storyboard} = await animationStoryboard(page, {
      name: 'tree-list-expand',
      clip: {x: 0, y: 0, width: 402, height: 340},
      times: [0, 33, 67, 100, 150, 200, 267, Math.round(SETTLE_MS)],
      columns: 8,
      cellScale: 0.45,
    });
    await releaseAnimations(page, {finish: true});
    await storyboard.write(testInfo);
  },
);
