// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TabBar.interaction.browser.spec.ts
 * @input The built "Lab/TabBar" stories on the harness's phone (touch, so
 *   the touch presentation applies), real touch input (Chromium CDP /
 *   WebKit's input command) and the interaction harness
 * @output Proofs that TabBar's lens moves like UITabBar's on iOS 26.2: a tap
 *   on another tab slides it on UIKit's spring (response 0.4 s, damping
 *   ratio 0.85) to within half a pixel, with the selected copy inside it
 *   counter-moving exactly; a second tap mid-slide turns it around without a
 *   jump; the slide keeps advancing every frame through a blocked main
 *   thread and does no Layout or Paint; Reduce Motion keeps it; choosing the
 *   selected tab reselects and moves nothing; badges change without
 *   animating; a storyboard of the slide
 * @position Interaction proof for lab TabBar (TabBar.tsx, tabBarModel.ts);
 *   shape copied from the harness exemplar,
 *   BottomSheetDetent.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  countBetween,
  holdAnimations,
  markElement,
  openStory,
  releaseAnimations,
  sampleCurve,
  sampleRects,
  springStep,
  startScreencast,
  touchDriver,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** UIKit's lens travel on iOS 26.2 (uikit/tabBar.ts `lensTravel`). */
const LENS_TRAVEL = {response: 0.4, dampingFraction: 0.85};

async function openBar(page: Page, story = 'default') {
  await openStory(page, storybook(), `lab-tabbar--${story}`);
  const driver = await touchDriver(page);
  const bar = page.getByRole('tablist', {name: 'Sections'});
  await expect(bar).toBeVisible();
  return {driver, bar};
}

const tab = (page: Page, name: string | RegExp) =>
  page.getByRole('tab', {name});

/** The centre of a tab's 76 × 54 item, where a finger lands on it. */
async function itemCenter(page: Page, name: string | RegExp) {
  const box = await tab(page, name).locator('span').first().boundingBox();
  if (box == null) {
    throw new Error(`no tab ${String(name)}`);
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

const lensBody = (page: Page) => page.locator('[data-tab-bar-lens-body]');
const lensCopy = (page: Page) => page.locator('[data-tab-bar-copy]');

/** The lens's centre on screen. */
async function lensCenterX(page: Page) {
  const box = await lensBody(page).boundingBox();
  if (box == null) {
    throw new Error('no lens');
  }
  return box.x + box.width / 2;
}

/** A presented translateX, px (the animator drives `translate`). */
const translateX = async (locator: Locator) =>
  locator.evaluate(element => {
    const value = getComputedStyle(element).translate;
    return value === 'none' ? 0 : parseFloat(value);
  });

test('a tap on another tab slides the lens on UIKit’s spring, the selected copy counter-moving', async ({
  page,
}, testInfo) => {
  const {driver} = await openBar(page);
  const from = await itemCenter(page, 'Home');
  const to = await itemCenter(page, 'Browse');
  await driver.tap(to);
  await expect(tab(page, 'Browse')).toHaveAttribute('aria-selected', 'true');
  const body = lensBody(page);
  await waitForAnimation(body);
  await holdAnimations(page);

  const times = Array.from({length: 49}, (_, i) => i * 16.667);
  const bodySamples = await sampleCurve(body, times);
  const copySamples = await sampleCurve(lensCopy(page), times);
  // The body starts where the lens was (over Home) relative to its new
  // resting place (Browse) and springs to 0 from rest.
  const start = from.x - to.x;
  const samples = times.map((t, i) => ({
    t: +t.toFixed(1),
    body: bodySamples[i].transform.translateX,
    copy: copySamples[i].transform.translateX,
    analytic: start * (1 - springStep(LENS_TRAVEL, t)),
  }));
  await releaseAnimations(page, {finish: true});
  await writeEvidence(
    'curves/tabbar-lens-travel',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {start, samples},
        null,
        1,
      ),
    },
    testInfo,
  );

  for (const sample of samples) {
    expect(
      Math.abs(sample.body - sample.analytic),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    // The copy inside undoes the body's travel, so the items stay put.
    expect(
      Math.abs(sample.copy + sample.body),
      JSON.stringify(sample),
    ).toBeLessThan(0.3);
  }
  // UIKit's lens overshoots a little (ζ 0.85) before it settles.
  expect(Math.max(...samples.map(s => s.body))).toBeGreaterThan(0.5);
  await waitForRest(body);
  expect(Math.abs((await lensCenterX(page)) - to.x)).toBeLessThan(0.5);
});

test('a second tap mid-slide turns the lens around from where it is, without a jump', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  const home = await itemCenter(page, 'Home');
  const profile = await itemCenter(page, 'Profile');
  const library = await itemCenter(page, 'Library');
  // Every frame's lens position, sampled in the page while the taps land.
  const sampling = sampleRects(lensBody(page), 1300);
  await driver.tap(profile);
  // Where the second tap finds the lens is read directly: in software-rendered
  // WebKit the page can draw no frame for most of a second around these taps,
  // so the frame samples may skip it.
  await waitForAnimation(lensBody(page), {minProgressMs: 90});
  const turning = await lensCenterX(page);
  await driver.tap(library);
  await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
  const samples = (await sampling).flatMap(sample =>
    sample.box == null
      ? []
      : [{t: sample.t, x: sample.box.x + sample.box.width / 2}],
  );
  // It headed for Profile, turned around before reaching it and came back to
  // Library, never jumping: a jump to either end would cover the whole
  // remaining distance (over 100 px) in one frame. Only consecutive frames
  // are compared, never samples a stall kept apart.
  const steps = samples
    .slice(1)
    .flatMap((sample, i) =>
      sample.t - samples[i].t <= 34 ? [sample.x - samples[i].x] : [],
    );
  expect(
    Math.max(...steps.map(Math.abs)),
    JSON.stringify(samples),
  ).toBeLessThan(60);
  const centers = samples.map(sample => sample.x);
  expect(turning).toBeGreaterThan(library.x + 20);
  expect(Math.max(turning, ...centers)).toBeLessThan(profile.x - 20);
  expect(Math.min(...centers)).toBeGreaterThan(home.x - 1);
  await waitForRest(lensBody(page));
  expect(Math.abs((await lensCenterX(page)) - library.x)).toBeLessThan(0.5);
});

test('choosing the selected tab again reselects and moves nothing', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  await driver.tap(await itemCenter(page, 'Home'));
  await expect(page.getByTestId('reselects')).toHaveText('Reselected 1 times');
  const animations = await lensBody(page).evaluate(
    element => element.getAnimations({subtree: true}).length,
  );
  expect(animations).toBe(0);
  await expect(tab(page, 'Home')).toHaveAttribute('aria-selected', 'true');
});

test('badges appear, change and clear without animating', async ({page}) => {
  const {driver} = await openBar(page, 'badges');
  const badge = page.locator('[data-tab-bar-badge="inbox"]');
  await expect(badge).toHaveCount(0);
  await driver.tap(
    await page
      .getByRole('button', {name: 'Add one'})
      .boundingBox()
      .then(box => {
        if (box == null) {
          throw new Error('no button');
        }
        return {x: box.x + box.width / 2, y: box.y + box.height / 2};
      }),
  );
  await expect(badge).toHaveText('1');
  expect(await badge.evaluate(element => element.getAnimations().length)).toBe(
    0,
  );
  await expect(tab(page, /^Inbox\s*, 1 unread$/)).toBeVisible();
  await page.getByRole('button', {name: 'Add ten'}).click();
  await expect(badge).toHaveText('11');
  // "11" is wider than one digit: the badge grows past its 18.33 px circle.
  const box = await badge.boundingBox();
  expect(box?.height).toBeCloseTo(18.33, 1);
  expect(box?.width ?? 0).toBeGreaterThan(18.5);
  await page.getByRole('button', {name: 'Clear'}).click();
  await expect(badge).toHaveCount(0);
});

test('the slide keeps advancing every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {driver} = await openBar(page);
  const body = lensBody(page);
  const cast = await startScreencast(page);
  await driver.tap(await itemCenter(page, 'Profile'));
  await markElement(body);
  const [slide] = await waitForAnimation(body, {minProgressMs: 16});
  // Blocked by the page itself in the frame that sees the slide running.
  const block = await blockMainThread(page, 600, {during: body});
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, slide.to)},
    {axis: 'x', settledWithin: 2},
  );
  await writeEvidence(
    'busy-main-thread/tabbar-lens-travel',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, slide, proof},
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'tabbar-lens-travel-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: Math.min(block.to, slide.to) + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({x: tracked.find(f => f.t === t)?.box?.x ?? -1}),
  });
  await film.write(testInfo, {block, slide});
  // The harness's verdict: display rate, no stall past two dropped
  // screencast frames, and the frames moving (a loaded machine drops a frame
  // or two; a frozen slide presents none).
  expect(proof.expectedFrames).toBeGreaterThan(5);
  expect(
    proof.verdict.pass,
    `${proof.summary}; ${proof.verdict.failures.join('; ')}`,
  ).toBe(true);
});

test('the slide does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver} = await openBar(page);
  const body = lensBody(page);
  const target = await itemCenter(page, 'Profile');
  let slide = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await driver.tap(target);
    [slide] = await waitForAnimation(body);
    await waitForRest(body);
  });
  // The spring is within a pixel of rest by ~0.55 s; its first frame (the
  // selection's render) may lay out.
  expect(slide.to - slide.from).toBeGreaterThan(500);
  const during = countBetween(trace, slide.from + 80, slide.from + 500);
  const when = trace.events
    .filter(e => e.name === 'Layout' || e.name === 'Paint')
    .map(e => `${e.name}@${Math.round(e.t - slide.from)}`);
  expect(during.Layout ?? 0, JSON.stringify({during, when})).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify({during, when})).toBe(0);
});

test.describe('with Reduce Motion', () => {
  test('the lens still slides, as UIKit’s does', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver} = await openBar(page);
    const to = await itemCenter(page, 'Browse');
    await driver.tap(to);
    const body = lensBody(page);
    await waitForAnimation(body, {minProgressMs: 30});
    // Mid-slide: still travelling, fully opaque (no cross-fade).
    const midway = await body.evaluate(element => ({
      x: parseFloat(getComputedStyle(element).translate) || 0,
      opacity: Number(getComputedStyle(element).opacity),
    }));
    expect(Math.abs(midway.x)).toBeGreaterThan(1);
    expect(midway.opacity).toBe(1);
    await waitForRest(body);
    expect(Math.abs((await lensCenterX(page)) - to.x)).toBeLessThan(0.5);
  });
});

test(
  'storyboard: a tap slides the lens',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, bar} = await openBar(page);
    await driver.tap(await itemCenter(page, 'Profile'));
    await waitForAnimation(lensBody(page));
    const box = await bar.boundingBox();
    if (box == null) {
      throw new Error('no bar');
    }
    const {storyboard} = await animationStoryboard(page, {
      name: 'tabbar-lens-travel',
      clip: {
        x: 0,
        y: box.y - 12,
        width: box.x * 2 + box.width,
        height: box.height + 24,
      },
      times: Array.from({length: 37}, (_, i) => i * 16.667),
      measure: async () => ({x: await translateX(lensBody(page))}),
      columns: 6,
      cellScale: 0.6,
    });
    await storyboard.write(testInfo);
    await releaseAnimations(page, {finish: true});
    const xs = storyboard.frames.map(f => (f.data as {x: number}).x);
    expect(xs[0]).toBeLessThan(-200);
    expect(Math.abs(xs.at(-1) ?? Infinity)).toBeLessThan(2);
  },
);
