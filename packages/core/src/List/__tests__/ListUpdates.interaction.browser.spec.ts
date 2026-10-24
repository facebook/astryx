// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListUpdates.interaction.browser.spec.ts
 * @input The built List "Animated Changes" story in the touch phone context,
 *   the interaction harness and the table spring from the UIKit constants
 *   table (motion/uikit/list.ts)
 * @output Interaction and animation proofs for a List with `hasAnimatedChanges`:
 *   after a removal the rows below start where they were and slide up on the
 *   table spring; after an insert the new row fades in and the rows below
 *   slide down; a reorder moves rows to their new places; content below the
 *   list moves with its rows; the rows keep
 *   moving while the main thread is blocked, with no Layout or Paint; a
 *   storyboard of a removal
 * @position Interaction evidence for List/useListUpdateMotion.ts
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
  trackMarker,
  traceRendering,
  waitForAnimation,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';
import {solveSpring, toSpring} from '../../motion/spring';
import {list} from '../../motion/uikit/list';
import {blockBehindBeacon, installBeacon, sampleVideoPoints} from './rowPixels';

const storybook = withStorybook(test);

const STORY = 'core-list--animated-changes';
const SPRING = toSpring(list.update.tableSpring);
const progress = (t: number) =>
  solveSpring(SPRING, {from: 0, to: 1}).value(t / 1000);
const SETTLE_MS =
  solveSpring(SPRING, {from: 0, to: 1}).settleTime(0.001) * 1000;

const row = (page: Page, label: string) =>
  page.locator('#storybook-root li').filter({hasText: label}).first();

const translateY = async (element: Locator) =>
  element.evaluate(el => {
    const value = getComputedStyle(el).translate;
    if (value === 'none' || value === '') {
      return 0;
    }
    const [, y = '0px'] = value.split(' ');
    return Number.parseFloat(y);
  });

const opacity = async (element: Locator) =>
  element.evaluate(el => Number(getComputedStyle(el).opacity));

async function open(page: Page) {
  await openStory(page, storybook(), STORY);
  const touch = await page.evaluate(
    () => matchMedia('(pointer: coarse)').matches,
  );
  test.skip(!touch, 'list changes move on a touch screen only');
  await expect(row(page, 'Spam')).toBeVisible();
}

async function press(page: Page, name: string) {
  await page.getByRole('button', {name}).click();
}

test('a removal: the rows below start where they were and slide up on the table spring', async ({
  page,
}, testInfo) => {
  await open(page);
  const drafts = row(page, 'Drafts');
  const layoutTop = async () =>
    drafts.evaluate(el => (el as HTMLElement).offsetTop);
  const before = await layoutTop();
  await press(page, 'Remove the second row');
  await expect(row(page, 'Sent')).toHaveCount(0);
  await holdAnimations(page);
  const after = await layoutTop();
  const gap = await drafts.evaluate(el => {
    const previous = el.previousElementSibling as HTMLElement | null;
    return previous == null
      ? 0
      : (el as HTMLElement).offsetTop - previous.offsetTop;
  });
  const samples: {t: number; value: number}[] = [];
  for (const t of timeline(SETTLE_MS)) {
    await seekAnimations(page, t);
    samples.push({t, value: await translateY(drafts)});
  }
  await releaseAnimations(page, {finish: true});
  const expected = (t: number) => gap * (1 - progress(t));
  const comparison = compareCurve(samples, expected, 0.5);
  await writeEvidence(
    'curves/list-update-removal',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {spring: list.update.tableSpring, gap, samples, comparison},
        null,
        2,
      ),
    },
    testInfo,
  );
  // On screen at its old place first: one row lower than its new layout.
  expect(samples[0].value).toBeCloseTo(gap, 0);
  // Layout moved it up by one row; the motion put it back on screen.
  expect(before - after).toBeCloseTo(gap, 0);
  expect(comparison.maxError, JSON.stringify(comparison.worst)).toBeLessThan(
    0.5,
  );
  await expect.poll(async () => translateY(drafts)).toBe(0);
});

test('an insert: the new row fades in and the rows below slide down', async ({
  page,
}) => {
  await open(page);
  await press(page, 'Insert a row second');
  const inserted = row(page, 'Folder 1');
  await expect(inserted).toBeVisible();
  await holdAnimations(page);
  await seekAnimations(page, 0);
  expect(await opacity(inserted)).toBeCloseTo(0, 2);
  const sent = row(page, 'Sent');
  const start = await translateY(sent);
  expect(start).toBeLessThan(-1);
  await seekAnimations(page, SETTLE_MS / 4);
  const mid = await opacity(inserted);
  expect(mid).toBeGreaterThan(0.2);
  expect(mid).toBeLessThan(1);
  expect(await translateY(sent)).toBeGreaterThan(start);
  await releaseAnimations(page, {finish: true});
  await expect.poll(async () => opacity(inserted)).toBe(1);
  await expect.poll(async () => translateY(sent)).toBe(0);
});

test('a reorder: each row slides from its old place to its new one', async ({
  page,
}) => {
  await open(page);
  const spam = row(page, 'Spam');
  const inbox = row(page, 'Inbox');
  await press(page, 'Move the last row first');
  await holdAnimations(page);
  await seekAnimations(page, 0);
  // Spam starts four rows down (where it was) and Inbox one row up.
  expect(await translateY(spam)).toBeGreaterThan(1);
  expect(await translateY(inbox)).toBeLessThan(-1);
  await releaseAnimations(page, {finish: true});
  await expect.poll(async () => translateY(spam)).toBe(0);
  await expect.poll(async () => translateY(inbox)).toBe(0);
});

test('content below the list moves with its rows and lands with no jump', async ({
  page,
}) => {
  await open(page);
  const button = page.getByRole('button', {name: 'Insert a row second'});
  const spam = row(page, 'Spam');
  const rest = (await button.boundingBox())?.y ?? 0;
  await press(page, 'Remove the second row');
  await expect(row(page, 'Sent')).toHaveCount(0);
  await holdAnimations(page);
  await seekAnimations(page, 0);
  const gap = rest - ((await button.boundingBox())?.y ?? 0);
  // Layout moved it up by a row; on screen it starts where it was.
  expect(await translateY(button)).toBeGreaterThan(1);
  expect(Math.abs(gap)).toBeLessThan(1);
  // In step with the last row.
  await seekAnimations(page, SETTLE_MS / 4);
  expect(await translateY(button)).toBeCloseTo(await translateY(spam), 1);
  await releaseAnimations(page, {finish: true});
  await expect.poll(async () => translateY(button)).toBe(0);
});

test('the rows keep moving on every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright',
  );
  await open(page);
  const drafts = row(page, 'Drafts');
  const unmark = await markElement(drafts);
  const cast = await startScreencast(page);
  await page.waitForTimeout(100);
  await press(page, 'Remove the second row');
  await waitForAnimation(drafts, {minProgressMs: 16});
  const block = await blockMainThread(page, 300);
  await page.waitForTimeout(250);
  const frames = await cast.stop();
  await unmark();
  const tracked = await trackMarker(page, frames);
  const proof = busyWindowProof(tracked, block, {axis: 'y', settledWithin: 1});
  await writeEvidence(
    'busy-main-thread/list-update-removal',
    {[`${testInfo.project.name}.json`]: JSON.stringify(proof, null, 1)},
    testInfo,
  );
  expect(proof.changed, JSON.stringify(proof)).toBeGreaterThanOrEqual(3);
  expect(proof.monotonic, JSON.stringify(proof)).toBe(true);
  expect(proof.longestStallMs, JSON.stringify(proof)).toBeLessThan(40);
});

test('WebKit: the rows keep moving while the main thread is blocked (video)', async ({
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
  const drafts = row(page, 'Drafts');
  const gap = await drafts.evaluate(el => {
    const previous = el.previousElementSibling as HTMLElement | null;
    return previous == null
      ? 0
      : (el as HTMLElement).offsetTop - previous.offsetTop;
  });
  await markElement(drafts);
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
  // Probes every 4 px up the row's path: it slides up by one row.
  const probes = Array.from({length: Math.floor(gap / 4) + 1}, (_, k) => ({
    x: Math.round(chip.x),
    y: Math.round(chip.y - k * 4),
  }));
  await installBeacon(page);
  await page.waitForTimeout(300);
  await press(page, 'Remove the second row');
  await waitForAnimation(drafts, {minProgressMs: 1});
  await blockBehindBeacon(page, 300);
  await page.waitForTimeout(400);
  const video = page.video();
  await context.close();
  const path = await video?.path();
  expect(path).toBeTruthy();
  const samples = await sampleVideoPoints(path as string, probes, size);
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
    'busy-main-thread/list-update-removal-webkit',
    {'webkit.json': JSON.stringify({gap, blocked, distinct}, null, 1)},
    testInfo,
  );
  // The row kept moving up while script could not run.
  expect(distinct.length, JSON.stringify(distinct)).toBeGreaterThanOrEqual(3);
  for (let i = 1; i < distinct.length; i++) {
    expect(distinct[i]).toBeGreaterThan(distinct[i - 1]);
  }
});

test('a removal does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  await open(page);
  const drafts = row(page, 'Drafts');
  let window = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await press(page, 'Remove the second row');
    const [started] = await waitForAnimation(drafts);
    window = {from: started.from, to: started.from + SETTLE_MS};
    await page.waitForTimeout(SETTLE_MS + 100);
  });
  const during = countBetween(trace, window.from + 30, window.to - 30);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
});

test(
  'storyboard: a row removed from a list on a touch screen',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    await open(page);
    await press(page, 'Remove the second row');
    const {storyboard} = await animationStoryboard(page, {
      name: 'list-update-removal',
      clip: {x: 0, y: 0, width: 402, height: 420},
      times: [0, 33, 67, 100, 150, 200, 300, Math.round(SETTLE_MS)],
      columns: 8,
      cellScale: 0.45,
    });
    await releaseAnimations(page, {finish: true});
    await storyboard.write(testInfo);
  },
);
