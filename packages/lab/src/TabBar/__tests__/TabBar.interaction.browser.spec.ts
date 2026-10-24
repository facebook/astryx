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
 *   animating; a storyboard of the slide; minimize on scroll: 66 px into a
 *   finger's downward scroll the bar collapses into its circle (the lens
 *   travelling and shrinking into it on UIKit's springs, through a blocked
 *   main thread), scrolling up mid-page and a script's scroll to the top
 *   leave it minimized, the top and a tap on the circle expand it, and the
 *   minimized bar lets the page take touches outside the circle; the bottom
 *   accessory moves down inline beside the circle and back on UIKit's
 *   springs, and its content takes taps in both places
 * @position Interaction proof for lab TabBar (TabBar.tsx, tabBarModel.ts);
 *   shape copied from the harness exemplar,
 *   BottomSheetDetent.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import type {TouchDriver} from '@astryxdesign/interaction-harness';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  countBetween,
  drag,
  holdAnimations,
  markElement,
  merge,
  openStory,
  PARTIAL_LIFT_SKIP,
  releaseAnimations,
  sampleCurve,
  sampleRects,
  springStep,
  startScreencast,
  tap as tapScript,
  touchDriver,
  touchStoryboard,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withFinger,
  withStorybook,
  writeEvidence,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** UIKit's lens travel on iOS 26.2 (uikit/tabBar.ts `lensTravel`). */
const LENS_TRAVEL = {response: 0.4, dampingFraction: 0.85};
/** The lift (`lift`), the flex while pressed and after (`flexPress`, `flexRelease`). */
const LIFT = {response: 0.25, dampingFraction: 1};
const FLEX_PRESS = {response: 0.314, dampingFraction: 0.625};
const FLEX_RELEASE = {response: 0.36, dampingFraction: 0.6};
const FLEX_SCALE = 1.0488;
/** The lifted lens's scale: the resting lens grown by 8 px on every side. */
async function liftedScale(page: Page) {
  const width = await lensBody(page).evaluate(
    element => (element as HTMLElement).offsetWidth,
  );
  return {x: (width + 16) / width, y: 70 / 54};
}

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

/** A presented scale (the animator drives `scale`). */
const scaleOf = async (locator: Locator) =>
  locator.evaluate(element => {
    const value = getComputedStyle(element).scale;
    if (value === 'none') {
      return {x: 1, y: 1};
    }
    const [x, y = x] = value.split(' ').map(Number);
    return {x, y};
  });

/** The capsule's left edge on screen, before its flex (its root is unscaled). */
async function capsuleLeft(page: Page) {
  return page.getByRole('tablist').evaluate(element => {
    const root = element.parentElement?.getBoundingClientRect();
    return (root?.left ?? 0) + (element as HTMLElement).offsetLeft;
  });
}

test('a selection made with the keys slides the lens on UIKit’s spring, the selected copy counter-moving', async ({
  page,
}, testInfo) => {
  await openBar(page);
  const from = await itemCenter(page, 'Home');
  const to = await itemCenter(page, 'Browse');
  await tab(page, 'Home').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
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
  // Well past Library on its way to Profile. Where the second tap finds it
  // is read directly: in software-rendered WebKit the page can draw no frame
  // for most of a second around these taps, so the frame samples may skip it.
  await waitForAnimation(lensBody(page), {minProgressMs: 150});
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
  // remaining distance (over 100 px) in one frame. (A frame the second tap
  // makes long, as it reports the first tap to the app, can cover 60.) Only
  // consecutive frames are compared, never samples a stall kept apart.
  const steps = samples
    .slice(1)
    .flatMap((sample, i) =>
      sample.t - samples[i].t <= 34 ? [sample.x - samples[i].x] : [],
    );
  expect(
    Math.max(...steps.map(Math.abs)),
    JSON.stringify(samples),
  ).toBeLessThan(90);
  const centers = samples.map(sample => sample.x);
  expect(turning).toBeGreaterThan(library.x + 5);
  expect(Math.max(turning, ...centers)).toBeLessThan(profile.x - 20);
  expect(Math.min(...centers)).toBeGreaterThan(home.x - 1);
  await waitForRest(lensBody(page));
  expect(Math.abs((await lensCenterX(page)) - library.x)).toBeLessThan(0.5);
});

test('a finger landing before the last lift reaches the app keeps the lens heading for it', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  const profile = await itemCenter(page, 'Profile');
  const library = await itemCenter(page, 'Library');
  const sampling = sampleRects(lensBody(page), 1400);
  // A tap on Profile, then a finger held on Library from 20 ms after that
  // lift: inside the frames before the tap's choice reaches the app, which
  // then moves the lens's resting place under the held finger.
  await driver.play([
    {t: 0, fingers: [{id: 0, ...profile}]},
    {t: 60, fingers: []},
    {t: 80, fingers: [{id: 1, ...library}]},
    {t: 580, fingers: []},
  ]);
  await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
  const centers = (await sampling)
    .filter(sample => sample.box != null)
    .map(sample => (sample.box?.x ?? 0) + (sample.box?.width ?? 0) / 2);
  const steps = centers.slice(1).map((x, i) => x - centers[i]);
  expect(
    Math.max(...steps.map(Math.abs)),
    JSON.stringify(centers),
  ).toBeLessThan(90);
  // The lens turned back for the held finger and never reached Profile.
  expect(Math.max(...centers), JSON.stringify(centers)).toBeLessThan(
    profile.x - 30,
  );
  await waitForRest(lensBody(page));
  expect(Math.abs((await lensCenterX(page)) - library.x)).toBeLessThan(0.5);
});

test('a tap on the selected tab reselects it: the lens lifts and settles back', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  const home = await itemCenter(page, 'Home');
  await driver.tap(home);
  await expect(page.getByTestId('reselects')).toHaveText('Reselected 1 times');
  await expect(tab(page, 'Home')).toHaveAttribute('aria-selected', 'true');
  await waitForRest(page.getByRole('tablist'));
  expect(Math.abs((await lensCenterX(page)) - home.x)).toBeLessThan(0.5);
  expect(await scaleOf(lensBody(page))).toEqual({x: 1, y: 1});
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

test('a finger landing lifts the lens and flexes the bar on UIKit’s springs, the lens heading for the finger', async ({
  page,
}, testInfo) => {
  const {driver} = await openBar(page);
  const home = await itemCenter(page, 'Home');
  const browse = await itemCenter(page, 'Browse');
  const capsule = page.getByRole('tablist');
  const LIFTED = await liftedScale(page);
  const times = Array.from({length: 31}, (_, i) => i * 16.667);
  let samples: {
    t: number;
    flex: number;
    liftX: number;
    liftY: number;
    glass: number;
    x: number;
  }[] = [];
  await driver.play(tapScript(browse, {holdMs: 1200}), {
    onEvent: async (_step, index) => {
      if (index !== 0) {
        return;
      }
      await waitForAnimation(capsule);
      await holdAnimations(page);
      const flex = await sampleCurve(capsule, times);
      const body = await sampleCurve(lensBody(page), times);
      const glass = await sampleCurve(
        page.locator('[data-tab-bar-lens-glass]'),
        times,
      );
      samples = times.map((t, i) => ({
        t: +t.toFixed(1),
        flex: flex[i].transform.scaleX,
        liftX: body[i].transform.scaleX,
        liftY: body[i].transform.scaleY,
        glass: glass[i].opacity,
        x: body[i].transform.translateX,
      }));
      await releaseAnimations(page);
    },
  });
  await writeEvidence(
    'curves/tabbar-press',
    {[`${testInfo.project.name}.json`]: JSON.stringify(samples, null, 1)},
    testInfo,
  );
  const travel = browse.x - home.x;
  for (const s of samples) {
    const lift = springStep(LIFT, s.t);
    const where = JSON.stringify(s);
    expect(
      Math.abs(s.flex - (1 + (FLEX_SCALE - 1) * springStep(FLEX_PRESS, s.t))),
      where,
    ).toBeLessThan(0.002);
    expect(Math.abs(s.liftX - (1 + (LIFTED.x - 1) * lift)), where).toBeLessThan(
      0.005,
    );
    expect(Math.abs(s.liftY - (1 + (LIFTED.y - 1) * lift)), where).toBeLessThan(
      0.005,
    );
    expect(Math.abs(s.glass - lift), where).toBeLessThan(0.01);
    expect(
      Math.abs(s.x - travel * springStep(LENS_TRAVEL, s.t)),
      where,
    ).toBeLessThan(0.5);
  }
  // The lift commits Browse.
  await expect(tab(page, 'Browse')).toHaveAttribute('aria-selected', 'true');
});

test('the lift settles the lens and relaxes the lift and the flex on UIKit’s springs', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  const browse = await itemCenter(page, 'Browse');
  const capsule = page.getByRole('tablist');
  const LIFTED = await liftedScale(page);
  // Held long enough for the press springs to settle.
  await driver.play(tapScript(browse, {holdMs: 1200}));
  // The choice reaches the app three frames after the lift and restarts the
  // lens's travel from its new resting place; hold the curves after that, so
  // no held animation is one the animator has since replaced.
  await expect(tab(page, 'Browse')).toHaveAttribute('aria-selected', 'true');
  await waitForAnimation(capsule);
  await holdAnimations(page);
  const times = Array.from({length: 37}, (_, i) => i * 16.667);
  const flex = await sampleCurve(capsule, times);
  const body = await sampleCurve(lensBody(page), times);
  await releaseAnimations(page, {finish: true});
  times.forEach((t, i) => {
    const where = JSON.stringify({t, flex: flex[i].transform.scaleX});
    expect(
      Math.abs(
        flex[i].transform.scaleX -
          (FLEX_SCALE + (1 - FLEX_SCALE) * springStep(FLEX_RELEASE, t)),
      ),
      where,
    ).toBeLessThan(0.002);
    expect(
      Math.abs(
        body[i].transform.scaleX -
          (LIFTED.x + (1 - LIFTED.x) * springStep(LIFT, t)),
      ),
      where,
    ).toBeLessThan(0.005);
  });
  await waitForRest(lensBody(page));
  expect(Math.abs((await lensCenterX(page)) - browse.x)).toBeLessThan(0.5);
});

test('a drag chases the finger and the lift commits the item nearest it', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  const home = await itemCenter(page, 'Home');
  const profile = await itemCenter(page, 'Profile');
  const left = await capsuleLeft(page);
  const lags: number[] = [];
  let atRest = Infinity;
  const script = drag(home, profile, {durationMs: 600, restMs: 400});
  await driver.play(script, {
    onEvent: async (step, index) => {
      const finger = step.fingers[0]?.x;
      if (finger == null) {
        return;
      }
      // The body's offset is in the capsule's own coordinates, from Home.
      const lens = (await translateX(lensBody(page))) + (home.x - left);
      lags.push(finger - left - lens);
      if (index === script.length - 2) {
        await page.waitForTimeout(350);
        atRest =
          finger -
          left -
          ((await translateX(lensBody(page))) + (home.x - left));
      }
    },
  });
  // The lens trails a moving finger but keeps up with it, and catches up
  // once it rests.
  const moving = lags.slice(3, -2);
  expect(Math.max(...moving)).toBeGreaterThan(1);
  expect(Math.max(...moving.map(Math.abs))).toBeLessThan(40);
  expect(Math.abs(atRest)).toBeLessThan(1);
  await expect(tab(page, 'Profile')).toHaveAttribute('aria-selected', 'true');
  await waitForRest(page.getByRole('tablist'));
  expect(Math.abs((await lensCenterX(page)) - profile.x)).toBeLessThan(0.5);
});

test('a second finger landing mid-drag never moves the lens or changes the choice', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  test.skip(!driver.partialLifts, PARTIAL_LIFT_SKIP);
  const home = await itemCenter(page, 'Home');
  const browse = await itemCenter(page, 'Browse');
  const profile = await itemCenter(page, 'Profile');
  const first = withFinger(
    drag(home, browse, {durationMs: 500, restMs: 300}),
    1,
  );
  const second = withFinger(tapScript(profile, {holdMs: 100}), 2, 250);
  // While both fingers are down, the lens stays with the first.
  let farthest = -Infinity;
  let twoFingers = 0;
  await driver.play(merge(first, second), {
    onEvent: async step => {
      if (step.fingers.length < 2) {
        return;
      }
      twoFingers += 1;
      farthest = Math.max(farthest, await lensCenterX(page));
    },
  });
  expect(twoFingers).toBeGreaterThan(0);
  expect(farthest).toBeLessThan(browse.x + 9);
  await expect(tab(page, 'Browse')).toHaveAttribute('aria-selected', 'true');
  await waitForRest(page.getByRole('tablist'));
  expect(Math.abs((await lensCenterX(page)) - browse.x)).toBeLessThan(0.5);
});

test('right to left, a drag runs from the first tab leftward and commits where it lifts', async ({
  page,
}) => {
  const {driver} = await openBar(page, 'right-to-left');
  const library = await itemCenter(page, 'Library');
  const profile = await itemCenter(page, 'Profile');
  // The later tab sits to the left.
  expect(profile.x).toBeLessThan(library.x);
  await driver.play(drag(library, profile, {durationMs: 500, restMs: 300}));
  await expect(tab(page, 'Profile')).toHaveAttribute('aria-selected', 'true');
  await waitForRest(page.getByRole('tablist'));
  expect(Math.abs((await lensCenterX(page)) - profile.x)).toBeLessThan(0.5);
});

test('a lift over a disabled tab leaves the selection, and the lens settles back', async ({
  page,
}) => {
  const {driver} = await openBar(page, 'disabled-tab');
  const home = await itemCenter(page, 'Home');
  const browse = await itemCenter(page, 'Browse');
  await driver.play(drag(home, browse, {durationMs: 400, restMs: 200}));
  // (UIKit's own drag commits a disabled tab; a tap does not. Neither does
  // here.)
  await expect(tab(page, 'Home')).toHaveAttribute('aria-selected', 'true');
  await expect(tab(page, 'Browse')).toHaveAttribute('aria-disabled', 'true');
  await expect
    .poll(async () => Math.abs((await lensCenterX(page)) - home.x), {
      timeout: 3000,
    })
    .toBeLessThan(0.5);
});

test('a lift between two items commits the nearer one (an exact tie goes to the leading one: tabBarModel.test.ts)', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  const library = await itemCenter(page, 'Library');
  const browse = await itemCenter(page, 'Browse');
  const midpoint = (library.x + browse.x) / 2;
  await driver.play(tapScript({x: midpoint + 3, y: library.y}, {holdMs: 120}));
  await expect(tab(page, 'Browse')).toHaveAttribute('aria-selected', 'true');
  await driver.play(tapScript({x: midpoint - 3, y: library.y}, {holdMs: 120}));
  await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
});

test('a drag that leaves the bar upward still commits where it lifts', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  const home = await itemCenter(page, 'Home');
  const library = await itemCenter(page, 'Library');
  const across = [...drag(home, library, {durationMs: 300})];
  const lift = across.pop();
  const last = across[across.length - 1];
  const up = Array.from({length: 10}, (_, i) => ({
    t: last.t + (i + 1) * 16.7,
    fingers: [{id: 0, x: library.x, y: library.y - (i + 1) * 8}],
  }));
  const end = up[up.length - 1].t + 16.7;
  await driver.play([...across, ...up, {t: end, fingers: lift?.fingers ?? []}]);
  await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
});

test('past the last item the lens rubber-bands about 8 px beyond it, and the lift commits the last item', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  const home = await itemCenter(page, 'Home');
  const profile = await itemCenter(page, 'Profile');
  const left = await capsuleLeft(page);
  const script = drag(
    home,
    {x: profile.x + 60, y: profile.y},
    {
      durationMs: 500,
      restMs: 900,
    },
  );
  let past = NaN;
  await driver.play(script, {
    onEvent: async (_step, index) => {
      if (index === script.length - 2) {
        await page.waitForTimeout(800);
        const lens = (await translateX(lensBody(page))) + (home.x - left);
        past = lens - (profile.x - left);
      }
    },
  });
  // UIKit: a finger 60 pt past the last item leaves the lens 7.98 pt past it.
  expect(past).toBeGreaterThan(7.4);
  expect(past).toBeLessThan(8.5);
  await expect(tab(page, 'Profile')).toHaveAttribute('aria-selected', 'true');
});

test('a vertical drag that starts on the bar never scrolls the page', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'native scrolling from injected touches is Chromium-only in Playwright',
  );
  const {driver} = await openBar(page);
  const library = await itemCenter(page, 'Library');
  const before = await page.evaluate(() => window.scrollY);
  await driver.play(
    drag(library, {x: library.x, y: library.y - 300}, {durationMs: 300}),
  );
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
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

test('a press, its lift, flex and travel, does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const {driver} = await openBar(page);
  const capsule = page.getByRole('tablist');
  const target = await itemCenter(page, 'Profile');
  let press = {from: 0, to: 0};
  // Held for 700 ms: the lens travels, lifts and the bar flexes with no
  // render at all. Counted while every curve is moving: the first frame
  // composites the layers, and each animation's end may repaint once as its
  // layer is folded back (the lift ends at ~0.39 s).
  const trace = await traceRendering(page, async () => {
    const playing = driver.play(tapScript(target, {holdMs: 700}));
    [press] = await waitForAnimation(capsule);
    await playing;
    await waitForRest(capsule);
  });
  const during = countBetween(trace, press.from + 50, press.from + 340);
  const when = trace.events
    .filter(e => e.name === 'Layout' || e.name === 'Paint')
    .map(e => `${e.name}@${Math.round(e.t - press.from)}`);
  expect(during.Layout ?? 0, JSON.stringify({during, when})).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify({during, when})).toBe(0);
  await expect(tab(page, 'Profile')).toHaveAttribute('aria-selected', 'true');
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
  'storyboard: a selection from rest slides the lens (a touch first moves it under the finger: see the press storyboard)',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {bar} = await openBar(page);
    await tab(page, 'Home').focus();
    for (let i = 0; i < 3; i += 1) {
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.press('Enter');
    await expect(tab(page, 'Profile')).toHaveAttribute('aria-selected', 'true');
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

test(
  'storyboard: a finger lands, drags across the bar and lifts',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, bar} = await openBar(page);
    const home = await itemCenter(page, 'Home');
    const browse = await itemCenter(page, 'Browse');
    const box = await bar.boundingBox();
    if (box == null) {
      throw new Error('no bar');
    }
    const storyboard = await touchStoryboard(
      page,
      driver,
      drag(home, browse, {durationMs: 400, hz: 20, holdMs: 250, restMs: 250}),
      {
        name: 'tabbar-press-drag',
        clip: {
          x: 0,
          y: box.y - 16,
          width: box.x * 2 + box.width,
          height: box.height + 32,
        },
        measure: async () => ({
          x: await translateX(lensBody(page)),
          lift: (await scaleOf(lensBody(page))).x,
          flex: (await scaleOf(bar)).x,
        }),
        columns: 5,
        cellScale: 0.6,
      },
    );
    await storyboard.write(testInfo);
    await expect(tab(page, 'Browse')).toHaveAttribute('aria-selected', 'true');
    const frames = storyboard.frames.map(
      f => f.data as {lift: number; flex: number},
    );
    // Lifted and flexed while the finger is down.
    expect(Math.max(...frames.map(f => f.lift))).toBeGreaterThan(1.1);
    expect(Math.max(...frames.map(f => f.flex))).toBeGreaterThan(1.03);
  },
);

// =============================================================================
// Minimize on scroll
// =============================================================================

/** uikit/tabBar.ts: `minimizeDistance`, `minimizedSize`, the collapse springs. */
const MINIMIZE_DISTANCE = 66;
const MINIMIZED_SIZE = 48;
const COLLAPSE_TRAVEL = {response: 0.4, dampingFraction: 0.85};
const COLLAPSE_SIZE = {response: 0.6, dampingFraction: 0.85};

const isMinimized = (page: Page) =>
  page
    .getByRole('tablist')
    .evaluate(element => element.hasAttribute('data-tab-bar-minimized'));
const pageScroll = (page: Page) => page.evaluate(() => window.scrollY);
const circle = (page: Page) => page.locator('[data-tab-bar-circle]');

/**
 * A finger dragging the page content by `dy` px (positive scrolls the page
 * down), then resting so nothing coasts. Where injected touches scroll
 * natively (Chromium) the page scrolls itself; in WebKit, whose injected
 * touches do not scroll, the page is scrolled by the finger's travel after
 * each move while the finger is down, which the bar reads the same way.
 */
async function scrollByFinger(
  page: Page,
  driver: TouchDriver,
  dy: number,
  {settle = true}: {settle?: boolean} = {},
) {
  const from = {x: 200, y: dy > 0 ? 520 : 160};
  const to = {x: from.x, y: from.y - dy};
  const script = drag(from, to, {
    durationMs: Math.max(160, Math.abs(dy) * 3),
    restMs: settle ? 150 : 0,
  });
  if (driver.drivesNativeGestures) {
    await driver.play(script);
  } else {
    let lastY = from.y;
    await driver.play(script, {
      realtime: false,
      onEvent: async step => {
        const finger = step.changed[0];
        if (step.type !== 'touchMove' || finger == null) {
          return;
        }
        const delta = lastY - finger.y;
        lastY = finger.y;
        await page.evaluate(by => window.scrollBy(0, by), delta);
      },
    });
  }
  if (settle) {
    await page.waitForTimeout(200);
  }
}

async function minimizeBar(page: Page, driver: TouchDriver) {
  await scrollByFinger(page, driver, 200);
  await expect.poll(() => isMinimized(page)).toBe(true);
}

test.describe('minimize on scroll', () => {
  test('a finger scrolling the page down minimizes the bar 66 px into the scroll, not before', async ({
    page,
  }) => {
    const {driver} = await openBar(page, 'minimize-on-scroll');
    await scrollByFinger(page, driver, 45);
    const first = await pageScroll(page);
    expect(first).toBeGreaterThan(10);
    expect(first).toBeLessThan(MINIMIZE_DISTANCE);
    expect(await isMinimized(page)).toBe(false);
    await scrollByFinger(page, driver, 60);
    expect(await pageScroll(page)).toBeGreaterThanOrEqual(MINIMIZE_DISTANCE);
    await expect.poll(() => isMinimized(page)).toBe(true);
  });

  test('scrolling back up mid-page leaves it minimized; reaching the top expands it', async ({
    page,
  }) => {
    const {driver} = await openBar(page, 'minimize-on-scroll');
    await scrollByFinger(page, driver, 300);
    await expect.poll(() => isMinimized(page)).toBe(true);
    await scrollByFinger(page, driver, -120);
    expect(await pageScroll(page)).toBeGreaterThan(0);
    expect(await isMinimized(page)).toBe(true);
    await scrollByFinger(page, driver, -400);
    expect(await pageScroll(page)).toBe(0);
    await expect.poll(() => isMinimized(page)).toBe(false);
  });

  test('a script scrolling the page to the top leaves it minimized', async ({
    page,
  }) => {
    const {driver} = await openBar(page, 'minimize-on-scroll');
    await minimizeBar(page, driver);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    expect(await pageScroll(page)).toBe(0);
    expect(await isMinimized(page)).toBe(true);
  });

  test('a tap on the circle expands the bar, keeping the tab and the scroll', async ({
    page,
  }) => {
    const {driver} = await openBar(page, 'minimize-on-scroll');
    await minimizeBar(page, driver);
    await waitForRest(lensBody(page));
    const scrolled = await pageScroll(page);
    const box = await circle(page).boundingBox();
    if (box == null) {
      throw new Error('no circle');
    }
    expect(box.width).toBeCloseTo(MINIMIZED_SIZE, 0);
    await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
    await expect.poll(() => isMinimized(page)).toBe(false);
    expect(await pageScroll(page)).toBe(scrolled);
    await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
  });

  test('minimized, the circle alone stands for the bar: the selected tab, collapsed; the keys expand it onto that tab', async ({
    page,
  }) => {
    const {driver} = await openBar(page, 'minimize-on-scroll');
    await minimizeBar(page, driver);
    const button = page.getByRole('button', {name: 'Library'});
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    // The tabs are inert: out of reach of assistive technology and focus.
    const tabsInert = () =>
      page
        .getByRole('tablist')
        .evaluate(list =>
          [...list.querySelectorAll<HTMLElement>('[role="tab"]')].map(
            element => element.inert,
          ),
        );
    expect(await tabsInert()).toEqual([true, true, true, true]);
    await button.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => isMinimized(page)).toBe(false);
    await expect(tab(page, 'Library')).toBeFocused();
    expect(await tabsInert()).toEqual([false, false, false, false]);
  });

  test('minimized, the page takes the touches outside the circle', async ({
    page,
  }) => {
    const {driver} = await openBar(page, 'minimize-on-scroll');
    const profile = await itemCenter(page, 'Profile');
    await minimizeBar(page, driver);
    const hit = await page.evaluate(({x, y}) => {
      const element = document.elementFromPoint(x, y);
      return {
        inBar: element?.closest('[role="tablist"]') != null,
        onCircle: element?.closest('[data-tab-bar-circle]') != null,
      };
    }, profile);
    expect(hit).toEqual({inBar: false, onCircle: false});
  });

  test('collapsing carries the lens into the circle on UIKit’s springs while the platter contracts', async ({
    page,
  }, testInfo) => {
    const {driver} = await openBar(page, 'minimize-on-scroll');
    const body = lensBody(page);
    const restBox = await body.boundingBox();
    const circleBox = await circle(page).boundingBox();
    if (restBox == null || circleBox == null) {
      throw new Error('no lens or circle');
    }
    const travel =
      circleBox.x + circleBox.width / 2 - (restBox.x + restBox.width / 2);
    const endScale = MINIMIZED_SIZE / restBox.width;
    await scrollByFinger(page, driver, 200);
    await waitForAnimation(body);
    await holdAnimations(page);
    const times = Array.from({length: 61}, (_, i) => i * 16.667);
    const bodySamples = await sampleCurve(body, times);
    const samples = times.map((t, i) => ({
      t: +t.toFixed(1),
      x: bodySamples[i].transform.translateX,
      scaleX: bodySamples[i].transform.scaleX,
      opacity: bodySamples[i].opacity,
      analyticX: travel * springStep(COLLAPSE_TRAVEL, t),
      analyticScaleX: 1 + (endScale - 1) * springStep(COLLAPSE_SIZE, t),
    }));
    await releaseAnimations(page, {finish: true});
    await writeEvidence(
      'curves/tabbar-collapse',
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {travel, endScale, samples},
          null,
          1,
        ),
      },
      testInfo,
    );
    for (const sample of samples) {
      expect(
        Math.abs(sample.x - sample.analyticX),
        JSON.stringify(sample),
      ).toBeLessThan(0.5);
      expect(
        Math.abs(sample.scaleX - sample.analyticScaleX),
        JSON.stringify(sample),
      ).toBeLessThan(0.005);
    }
    // The lens ends inside the circle, faded out; the platter's pieces have
    // become the circle.
    expect(samples.at(-1)?.opacity ?? 1).toBeLessThan(0.05);
    const pieces = await page
      .locator('[data-tab-bar-platter] > div')
      .evaluateAll(elements =>
        elements.map(element => {
          const rect = element.getBoundingClientRect();
          return {left: rect.left, right: rect.right};
        }),
      );
    const left = Math.min(...pieces.map(piece => piece.left));
    const right = Math.max(...pieces.map(piece => piece.right));
    expect(right - left).toBeCloseTo(MINIMIZED_SIZE, 0);
    expect(left).toBeCloseTo(circleBox.x, 0);
  });

  test('the collapse keeps advancing every frame while the main thread is blocked', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
    );
    const {driver} = await openBar(page, 'minimize-on-scroll');
    const end = page.locator('[data-tab-bar-platter-end]');
    await markElement(end);
    const cast = await startScreencast(page);
    // Just past the trigger, then block as soon as the collapse is running.
    await driver.play(
      drag({x: 200, y: 520}, {x: 200, y: 420}, {durationMs: 300, restMs: 150}),
    );
    const [collapse] = await waitForAnimation(end, {minProgressMs: 16});
    // Blocked by the page itself in the frame that sees the collapse running.
    const block = await blockMainThread(page, 600, {during: end});
    await page.waitForTimeout(150);
    const castFrames = await cast.stop();
    const tracked = await trackMarker(page, castFrames);
    const proof = busyWindowProof(
      tracked,
      {from: block.from, to: Math.min(block.to, collapse.to)},
      {axis: 'x', settledWithin: 2},
    );
    // The harness's verdict (a loaded machine drops a screencast frame or
    // two; a frozen collapse presents none).
    expect(proof.expectedFrames).toBeGreaterThan(5);
    expect(
      proof.verdict.pass,
      `${proof.summary}; ${proof.verdict.failures.join('; ')}`,
    ).toBe(true);
  });
});

test(
  'storyboard: the bar collapses into its circle, and a tap on the circle expands it',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, bar} = await openBar(page, 'minimize-on-scroll');
    const box = await bar.boundingBox();
    if (box == null) {
      throw new Error('no bar');
    }
    const clip = {
      x: 0,
      y: box.y - 12,
      width: box.x * 2 + box.width,
      height: box.height + 24,
    };
    const times = Array.from({length: 25}, (_, i) => i * 33.333);
    // Crosses the trigger near the end of the drag, so the storyboard holds
    // the collapse from its first frames.
    await scrollByFinger(page, driver, 100, {settle: false});
    await expect.poll(() => isMinimized(page)).toBe(true);
    const {storyboard: collapse} = await animationStoryboard(page, {
      name: 'tabbar-collapse',
      clip,
      times,
      columns: 5,
      cellScale: 0.6,
    });
    await collapse.write(testInfo);
    await releaseAnimations(page, {finish: true});
    const target = await circle(page).boundingBox();
    if (target == null) {
      throw new Error('no circle');
    }
    await driver.tap({
      x: target.x + target.width / 2,
      y: target.y + target.height / 2,
    });
    await expect.poll(() => isMinimized(page)).toBe(false);
    const {storyboard: expand} = await animationStoryboard(page, {
      name: 'tabbar-expand',
      clip,
      times,
      columns: 5,
      cellScale: 0.6,
    });
    await expand.write(testInfo);
    await releaseAnimations(page, {finish: true});
  },
);

// =============================================================================
// Bottom accessory
// =============================================================================

/** uikit/tabBar.ts: the accessory's springs. */
const ACCESSORY_COLLAPSE = {response: 0.405, dampingFraction: 0.745};
const ACCESSORY_EXPAND = {response: 0.329, dampingFraction: 0.731};

const accessory = (page: Page) => page.locator('[data-tab-bar-accessory]');

test.describe('bottom accessory', () => {
  test('moves down inline beside the circle on UIKit’s spring, and back up when the bar expands', async ({
    page,
  }, testInfo) => {
    const {driver, bar} = await openBar(page, 'bottom-accessory');
    const barBox = await bar.boundingBox();
    const above = await accessory(page).boundingBox();
    if (barBox == null || above == null) {
      throw new Error('no bar or accessory');
    }
    // Above the bar, as wide as it, 8 px over it.
    expect(above.x).toBeCloseTo(barBox.x, 0);
    expect(above.width).toBeCloseTo(barBox.width, 0);
    expect(barBox.y - (above.y + above.height)).toBeCloseTo(8, 0);
    expect(above.height).toBeCloseTo(48, 0);

    await scrollByFinger(page, driver, 100, {settle: false});
    await expect(accessory(page)).toHaveAttribute(
      'data-tab-bar-accessory',
      'inline',
    );
    await waitForAnimation(accessory(page));
    await holdAnimations(page);
    const times = Array.from({length: 46}, (_, i) => i * 16.667);
    const collapse = await sampleCurve(accessory(page), times);
    await releaseAnimations(page, {finish: true});
    const inline = await accessory(page).boundingBox();
    if (inline == null) {
      throw new Error('no accessory');
    }
    // Inline: 8 px after the 48 px circle, 7 px from the bar's trailing end.
    expect(inline.x - barBox.x).toBeCloseTo(63, 0);
    expect(inline.x + inline.width).toBeCloseTo(barBox.x + barBox.width - 7, 0);
    // It started where it was above the bar and sprang into place.
    const dx = above.x - inline.x;
    const dy = above.y - inline.y;
    const samples = times.map((t, i) => ({
      t: +t.toFixed(1),
      x: collapse[i].transform.translateX,
      y: collapse[i].transform.translateY,
      analyticX: dx * (1 - springStep(ACCESSORY_COLLAPSE, t)),
      analyticY: dy * (1 - springStep(ACCESSORY_COLLAPSE, t)),
    }));
    await writeEvidence(
      'curves/tabbar-accessory',
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {dx, dy, samples},
          null,
          1,
        ),
      },
      testInfo,
    );
    for (const sample of samples) {
      expect(
        Math.abs(sample.x - sample.analyticX),
        JSON.stringify(sample),
      ).toBeLessThan(0.5);
      expect(
        Math.abs(sample.y - sample.analyticY),
        JSON.stringify(sample),
      ).toBeLessThan(0.5);
    }

    // Back up on the expand spring (a tap on the circle expands at once),
    // once the collapse would have ended on its own: finish() above skipped
    // the page's animations to their end, not the animator's clock.
    await page.waitForTimeout(1000);
    const target = await circle(page).boundingBox();
    if (target == null) {
      throw new Error('no circle');
    }
    await driver.tap({
      x: target.x + target.width / 2,
      y: target.y + target.height / 2,
    });
    await expect(accessory(page)).toHaveAttribute(
      'data-tab-bar-accessory',
      'expanded',
    );
    await waitForAnimation(accessory(page));
    await holdAnimations(page);
    const expand = await sampleCurve(accessory(page), times);
    await releaseAnimations(page, {finish: true});
    times.forEach((t, i) => {
      expect(
        Math.abs(
          expand[i].transform.translateX +
            dx * (1 - springStep(ACCESSORY_EXPAND, t)),
        ),
        JSON.stringify({t, x: expand[i].transform.translateX}),
      ).toBeLessThan(0.5);
    });
    const back = await accessory(page).boundingBox();
    expect(back?.x ?? 0).toBeCloseTo(above.x, 0);
    expect(back?.y ?? 0).toBeCloseTo(above.y, 0);
  });

  test('its content takes taps above the bar and inline, never choosing a tab', async ({
    page,
  }) => {
    const {driver} = await openBar(page, 'bottom-accessory');
    const play = () => page.getByRole('button', {name: /^(Play|Pause)$/});
    const tapPlay = async () => {
      const box = await play().boundingBox();
      if (box == null) {
        throw new Error('no play button');
      }
      await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
    };
    await tapPlay();
    await expect(page.getByRole('button', {name: 'Pause'})).toBeVisible();
    await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
    await minimizeBar(page, driver);
    // Inline, the content drops its secondary control.
    await expect(page.getByRole('button', {name: 'Next'})).toHaveCount(0);
    await waitForRest(accessory(page));
    await tapPlay();
    await expect(page.getByRole('button', {name: 'Play'})).toBeVisible();
    expect(await isMinimized(page)).toBe(true);
    await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
  });
});

test(
  'storyboard: the bottom accessory moves inline as the bar collapses, and back',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, bar} = await openBar(page, 'bottom-accessory');
    const box = await bar.boundingBox();
    if (box == null) {
      throw new Error('no bar');
    }
    const clip = {
      x: 0,
      y: box.y - 72,
      width: box.x * 2 + box.width,
      height: box.height + 84,
    };
    const times = Array.from({length: 20}, (_, i) => i * 33.333);
    await scrollByFinger(page, driver, 100, {settle: false});
    await expect.poll(() => isMinimized(page)).toBe(true);
    const {storyboard: collapse} = await animationStoryboard(page, {
      name: 'tabbar-accessory-collapse',
      clip,
      times,
      columns: 5,
      cellScale: 0.6,
    });
    await collapse.write(testInfo);
    await releaseAnimations(page, {finish: true});
    const target = await circle(page).boundingBox();
    if (target == null) {
      throw new Error('no circle');
    }
    await driver.tap({
      x: target.x + target.width / 2,
      y: target.y + target.height / 2,
    });
    await expect.poll(() => isMinimized(page)).toBe(false);
    const {storyboard: expand} = await animationStoryboard(page, {
      name: 'tabbar-accessory-expand',
      clip,
      times,
      columns: 5,
      cellScale: 0.6,
    });
    await expand.write(testInfo);
    await releaseAnimations(page, {finish: true});
  },
);

/** uikit/tabBar.ts: the search field's morph and its starting squash. */
const SEARCH_MORPH = {response: 0.244, dampingFraction: 1.108};
const SEARCH_SQUASH = -3424;
/** Inline beside the circle, and active (spanning the screen but for cancel). */
const INLINE_FIELD = {start: 67, inset: 7};
const ACTIVE_FIELD = {start: -13, width: 330};

const searchCircle = (page: Page) => page.locator('[data-tab-bar-search]');
const searchHost = (page: Page) => page.locator('[data-tab-bar-search-field]');
const searchField = (page: Page) => searchHost(page).locator('> div');
/** The field glass's trailing cap: it carries the width's change. */
const searchFieldEnd = (page: Page) =>
  searchField(page).locator('> div[aria-hidden] > div').nth(2);

/**
 * A damped spring's offset from rest `t` ms after it starts `d0` px away,
 * moving at `v0` px/s (closed form; under-, over- and critically damped).
 */
function springOffset(
  {
    response,
    dampingFraction: zeta,
  }: {response: number; dampingFraction: number},
  d0: number,
  v0: number,
  t: number,
) {
  const s = t / 1000;
  const w = (2 * Math.PI) / response;
  if (Math.abs(zeta - 1) < 1e-9) {
    return Math.exp(-w * s) * (d0 + (v0 + w * d0) * s);
  }
  if (zeta < 1) {
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return (
      Math.exp(-zeta * w * s) *
      (d0 * Math.cos(wd * s) + ((v0 + zeta * w * d0) / wd) * Math.sin(wd * s))
    );
  }
  const root = w * Math.sqrt(zeta * zeta - 1);
  const r1 = -zeta * w + root;
  const r2 = -zeta * w - root;
  const c2 = (v0 - r1 * d0) / (r2 - r1);
  return (d0 - c2) * Math.exp(r1 * s) + c2 * Math.exp(r2 * s);
}

async function tapSearch(page: Page, driver: TouchDriver) {
  const box = await searchCircle(page).boundingBox();
  if (box == null) {
    throw new Error('no search circle');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
}

test.describe('search tab', () => {
  test('the tabs share a narrower capsule and the search circle sits 8 px after it, as UIKit lays them out', async ({
    page,
  }) => {
    const {bar} = await openBar(page, 'search-tab');
    const capsule = await bar.boundingBox();
    const search = await searchCircle(page).boundingBox();
    const viewport = page.viewportSize();
    if (capsule == null || search == null || viewport == null) {
      throw new Error('no bar');
    }
    // 402 pt wide: the capsule (21, 290) and the circle (319, 62 × 62).
    const room = viewport.width - 2 * 21;
    expect(capsule.x).toBeCloseTo(21, 0);
    expect(capsule.width).toBeCloseTo(room - 70, 0);
    expect(search.x - (capsule.x + capsule.width)).toBeCloseTo(8, 0);
    expect(search.width).toBeCloseTo(62, 0);
    expect(search.height).toBeCloseTo(62, 0);
    expect(search.y).toBeCloseTo(capsule.y, 0);
    // It is the tablist's last tab.
    await expect(page.getByRole('tab').last()).toHaveAccessibleName('Search');
  });

  test('a tap on it selects it and raises its field, the bar collapsing to a circle with the tab it came from; cancel returns there', async ({
    page,
    browserName,
  }) => {
    const {driver} = await openBar(page, 'search-tab');
    const box = await searchCircle(page).boundingBox();
    if (box == null) {
      throw new Error('no search circle');
    }
    const at = {x: box.x + box.width / 2, y: box.y + box.height / 2};
    if (browserName === 'chromium') {
      // A finger held on the search circle never presses the lens. (Only
      // Chromium's touches can be read mid-script; WebKit's scripted hold
      // reads as a long press, which fires no click.)
      const playing = driver.play(tapScript(at, {holdMs: 200}));
      await page.waitForTimeout(100);
      expect((await scaleOf(lensBody(page))).x).toBeCloseTo(1, 3);
      await playing;
    } else {
      await driver.tap(at);
    }

    // Selected and active at once: the search circle is now the field's
    // cancel button.
    await expect(page.getByRole('button', {name: 'Cancel'})).toBeVisible();
    await expect.poll(() => isMinimized(page)).toBe(true);
    await expect(searchHost(page)).toHaveAttribute(
      'data-tab-bar-search-field',
      'active',
    );
    // The tap focused the field itself (iOS raises the keyboard for that).
    await expect(page.getByRole('searchbox', {name: 'Search'})).toBeFocused();
    // The circle holds Home, the tab the search tab was chosen from.
    await expect(circle(page).locator('svg')).toHaveCount(1);
    await waitForRest(searchField(page));
    const field = await searchField(page).boundingBox();
    const viewport = page.viewportSize();
    if (field == null || viewport == null) {
      throw new Error('no field');
    }
    expect(field.x).toBeCloseTo(8, 0);
    expect(field.width).toBeCloseTo(viewport.width - 8 - 48 - 8 - 8, 0);

    await page.getByRole('button', {name: 'Cancel'}).click();
    await expect(tab(page, 'Home')).toHaveAttribute('aria-selected', 'true');
    await expect.poll(() => isMinimized(page)).toBe(false);
    await expect(searchHost(page)).toHaveAttribute(
      'data-tab-bar-search-field',
      'inline',
    );
    await expect
      .poll(() =>
        searchHost(page).evaluate(element => (element as HTMLElement).inert),
      )
      .toBe(true);
  });

  test('the field moves and widens on UIKit’s spring, squashing as it starts', async ({
    page,
  }, testInfo) => {
    const {driver} = await openBar(page, 'search-tab');
    await tapSearch(page, driver);
    await expect(searchHost(page)).toHaveAttribute(
      'data-tab-bar-search-field',
      'active',
    );
    // Held as soon as the tap commits: in software-rendered WebKit the first
    // frame of this many glass layers can take a second.
    await holdAnimations(page);
    const times = Array.from({length: 31}, (_, i) => i * 16.667);
    const moved = await sampleCurve(searchField(page), times);
    const widened = await sampleCurve(searchFieldEnd(page), times);
    await releaseAnimations(page, {finish: true});
    const host = await searchHost(page).boundingBox();
    if (host == null) {
      throw new Error('no field host');
    }
    // From its inline place (67 px into the bar, 7 px from its end) to the
    // active one (8 px from the screen's edge, 330 px wide on this screen).
    const dx = INLINE_FIELD.start - ACTIVE_FIELD.start;
    const dw = host.width - (host.width + 44);
    const samples = times.map((t, i) => ({
      t: +t.toFixed(1),
      x: moved[i].transform.translateX,
      analyticX: dx * (1 - springStep(SEARCH_MORPH, t)),
      end: widened[i].transform.translateX,
      analyticEnd: springOffset(SEARCH_MORPH, dw, SEARCH_SQUASH, t),
    }));
    await writeEvidence(
      'curves/tabbar-search',
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {dx, dw, samples},
          null,
          1,
        ),
      },
      testInfo,
    );
    for (const sample of samples) {
      expect(
        Math.abs(sample.x - sample.analyticX),
        JSON.stringify(sample),
      ).toBeLessThan(0.5);
      expect(
        Math.abs(sample.end - sample.analyticEnd),
        JSON.stringify(sample),
      ).toBeLessThan(0.5);
    }
    // The squash: the width first shrinks below where it started.
    expect(Math.min(...samples.map(sample => sample.end))).toBeLessThan(
      dw - 10,
    );
  });

  test('minimized, both circles stay and the accessory ends 8 px before the search circle', async ({
    page,
  }) => {
    const {driver, bar} = await openBar(page, 'search-tab');
    const barBox = await bar.boundingBox();
    const search = await searchCircle(page).boundingBox();
    if (barBox == null || search == null) {
      throw new Error('no bar');
    }
    await minimizeBar(page, driver);
    const glass = searchCircle(page).locator('> span').first();
    await waitForRest(glass);
    await waitForRest(accessory(page));
    const shrunk = await glass.boundingBox();
    const inline = await accessory(page).boundingBox();
    if (shrunk == null || inline == null) {
      throw new Error('no glass');
    }
    // The search circle shrinks to 48 about its centre (326, 798 on iOS).
    expect(shrunk.width).toBeCloseTo(MINIMIZED_SIZE, 0);
    expect(shrunk.x + shrunk.width / 2).toBeCloseTo(
      search.x + search.width / 2,
      0,
    );
    expect(shrunk.y + shrunk.height / 2).toBeCloseTo(
      search.y + search.height / 2,
      0,
    );
    // The accessory sits between the circles: 63 px into the bar, ending
    // 8 px before the search circle (84 → 318 on iOS, 234 wide).
    expect(inline.x - barBox.x).toBeCloseTo(63, 0);
    expect(shrunk.x - (inline.x + inline.width)).toBeCloseTo(8, 0);
  });
});

test(
  'storyboard: the search tab raises its field as the bar collapses, and cancel brings the tabs back',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, bar} = await openBar(page, 'search-tab');
    const box = await bar.boundingBox();
    if (box == null) {
      throw new Error('no bar');
    }
    const clip = {
      x: 0,
      y: box.y - 72,
      width: box.x * 2 + box.width + 62,
      height: box.height + 84,
    };
    const times = Array.from({length: 20}, (_, i) => i * 33.333);
    await tapSearch(page, driver);
    await expect(searchHost(page)).toHaveAttribute(
      'data-tab-bar-search-field',
      'active',
    );
    const {storyboard: raise} = await animationStoryboard(page, {
      name: 'tabbar-search-activate',
      clip,
      times,
      columns: 5,
      cellScale: 0.6,
    });
    await raise.write(testInfo);
    await releaseAnimations(page, {finish: true});
    await page.getByRole('button', {name: 'Cancel'}).click();
    await expect.poll(() => isMinimized(page)).toBe(false);
    const {storyboard: cancel} = await animationStoryboard(page, {
      name: 'tabbar-search-cancel',
      clip,
      times,
      columns: 5,
      cellScale: 0.6,
    });
    await cancel.write(testInfo);
    await releaseAnimations(page, {finish: true});
  },
);

test.describe('More tab', () => {
  test('six tabs: the bar shows the first four and More at the five-tab layout, as UIKit does', async ({
    page,
  }) => {
    await openBar(page, 'more-tab');
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(5);
    await expect(tabs.last()).toHaveAccessibleName('More');
    // iOS 26.2 on a 402 pt screen: five 77 pt items at x 25, 93.75, 162.5,
    // 231.25 and 300.
    const viewport = page.viewportSize();
    const lefts: number[] = [];
    for (let index = 0; index < 5; index += 1) {
      const box = await tabs.nth(index).locator('span').first().boundingBox();
      if (box == null) {
        throw new Error('no item');
      }
      // Within the item-width fit's 1 px (tabBar.ts `itemWidth`).
      expect(Math.abs(box.width - 77)).toBeLessThan(1);
      lefts.push(box.x);
    }
    if (viewport?.width === 402) {
      [25, 93.75, 162.5, 231.25, 300].forEach((x, index) => {
        expect(Math.abs(lefts[index] - x)).toBeLessThan(1);
      });
    }
  });

  test('a section chosen in More opens inside it, More staying selected; More again returns to the list', async ({
    page,
  }) => {
    const {driver} = await openBar(page, 'more-tab');
    const more = await itemCenter(page, 'More');
    await driver.tap(more);
    await expect(tab(page, 'More')).toHaveAttribute('aria-selected', 'true');
    const settings = page.getByRole('button', {name: /Settings/});
    await expect(settings).toBeVisible();
    await settings.click();
    await expect(page.getByRole('heading', {name: 'Settings'})).toBeVisible();
    await expect(tab(page, 'More')).toHaveAttribute('aria-selected', 'true');
    await waitForRest(page.getByRole('tablist'));
    expect(Math.abs((await lensCenterX(page)) - more.x)).toBeLessThan(0.5);
    await driver.tap(more);
    await expect(page.getByRole('heading', {name: 'More'})).toBeVisible();
  });
});

/** uikit/tabBar.ts: the ride above the keyboard. */
const SEARCH_RISE = {response: 0.274, dampingFraction: 1.056};
const SEARCH_KEYBOARD_GAP = 8;
const KEYBOARD = 335;

/**
 * Replaces `window.visualViewport` before the page loads with one the test
 * drives (as the search field's own proofs do): `__keyboard(cover)` shrinks
 * it from the bottom and fires one `resize`, as Mobile Safari does.
 */
async function installKeyboard(page: Page) {
  await page.addInitScript(() => {
    const viewport = Object.assign(new EventTarget(), {
      height: window.innerHeight,
      width: window.innerWidth,
      offsetTop: 0,
      offsetLeft: 0,
      pageTop: 0,
      pageLeft: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      get: () => viewport,
    });
    (window as unknown as {__keyboard: (cover: number) => void}).__keyboard =
      cover => {
        viewport.height = window.innerHeight - cover;
        viewport.dispatchEvent(new Event('resize'));
      };
  });
}

const keyboard = async (page: Page, cover: number) =>
  page.evaluate(
    c => (window as unknown as {__keyboard: (c: number) => void}).__keyboard(c),
    cover,
  );

const cancelCircle = (page: Page) =>
  page.locator('[data-tab-bar-search-cancel]');

test.describe('search tab, active', () => {
  test('the field rides 8 px above the keyboard on UIKit’s spring, the cancel button with it', async ({
    page,
  }, testInfo) => {
    await installKeyboard(page);
    const {driver} = await openBar(page, 'search-tab');
    await tapSearch(page, driver);
    await expect(searchHost(page)).toHaveAttribute(
      'data-tab-bar-search-field',
      'active',
    );
    const before = await searchHost(page).boundingBox();
    if (before == null) {
      throw new Error('no field host');
    }
    await keyboard(page, KEYBOARD);
    await waitForAnimation(searchHost(page));
    await holdAnimations(page);
    const times = Array.from({length: 31}, (_, i) => i * 16.667);
    const ride = await sampleCurve(searchHost(page), times);
    const circle = await sampleCurve(cancelCircle(page), times);
    await releaseAnimations(page, {finish: true});
    const viewport = page.viewportSize();
    const after = await searchHost(page).boundingBox();
    if (viewport == null || after == null) {
      throw new Error('no viewport');
    }
    // At rest its bottom is 8 px above the keyboard's top.
    expect(after.y + after.height).toBeCloseTo(
      viewport.height - KEYBOARD - SEARCH_KEYBOARD_GAP,
      0,
    );
    const lift = after.y - before.y;
    const samples = times.map((t, i) => ({
      t: +t.toFixed(1),
      y: ride[i].transform.translateY,
      circleY: circle[i].transform.translateY,
      analytic: lift * springStep(SEARCH_RISE, t),
    }));
    await writeEvidence(
      'curves/tabbar-search-ride',
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {lift, samples},
          null,
          1,
        ),
      },
      testInfo,
    );
    for (const sample of samples) {
      expect(
        Math.abs(sample.y - sample.analytic),
        JSON.stringify(sample),
      ).toBeLessThan(0.5);
      // The cancel button rides with it, on the same curve.
      expect(
        Math.abs(sample.circleY - sample.y),
        JSON.stringify(sample),
      ).toBeLessThan(0.5);
    }
    // The cancel button rests 8 px from the screen's edge, level with the field.
    const cancel = await cancelCircle(page)
      .locator('> span')
      .first()
      .boundingBox();
    if (cancel == null) {
      throw new Error('no cancel');
    }
    expect(cancel.x + cancel.width).toBeCloseTo(viewport.width - 8, 0);
    expect(cancel.y + cancel.height / 2).toBeCloseTo(
      after.y + after.height / 2,
      0,
    );
  });

  test('the cancel button cancels search: back to the tab it came from, the field riding down with the keyboard', async ({
    page,
  }) => {
    await installKeyboard(page);
    const {driver} = await openBar(page, 'search-tab');
    await tapSearch(page, driver);
    await keyboard(page, KEYBOARD);
    await waitForRest(searchHost(page));
    const cancel = page.getByRole('button', {name: 'Cancel'});
    await expect(cancel).toBeVisible();
    const box = await cancel.boundingBox();
    if (box == null) {
      throw new Error('no cancel');
    }
    await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
    await expect(tab(page, 'Home')).toHaveAttribute('aria-selected', 'true');
    await expect(searchHost(page)).toHaveAttribute(
      'data-tab-bar-search-field',
      'inline',
    );
    await keyboard(page, 0);
    await expect
      .poll(async () => (await translate(searchHost(page)))[1], {timeout: 3000})
      .toBeCloseTo(0, 0);
    // The circle is the bar's search tab again.
    await expect(tab(page, 'Search')).toBeVisible();
  });
});

/** The presented `translate`, px: [x, y]. */
async function translate(locator: Locator) {
  return locator.evaluate(element => {
    const value = getComputedStyle(element).translate;
    if (value === 'none') {
      return [0, 0];
    }
    const [x, y] = value.split(' ').map(part => parseFloat(part) || 0);
    return [x ?? 0, y ?? 0];
  });
}

test(
  'storyboard: the search field rides up with the keyboard, its cancel button with it, and back down on cancel',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    await installKeyboard(page);
    const {driver} = await openBar(page, 'search-tab');
    const viewport = page.viewportSize();
    if (viewport == null) {
      throw new Error('no viewport');
    }
    const clip = {
      x: 0,
      y: viewport.height - KEYBOARD - 90,
      width: viewport.width,
      height: KEYBOARD + 90,
    };
    const times = Array.from({length: 20}, (_, i) => i * 33.333);
    await tapSearch(page, driver);
    await keyboard(page, KEYBOARD);
    await waitForAnimation(searchHost(page));
    const {storyboard: rise} = await animationStoryboard(page, {
      name: 'tabbar-search-ride-up',
      clip,
      times,
      columns: 5,
      cellScale: 0.5,
    });
    await rise.write(testInfo);
    await releaseAnimations(page, {finish: true});
    await page.waitForTimeout(800);
    const cancel = await cancelCircle(page).boundingBox();
    if (cancel == null) {
      throw new Error('no cancel');
    }
    await driver.tap({
      x: cancel.x + cancel.width / 2,
      y: cancel.y + cancel.height / 2,
    });
    await expect(tab(page, 'Home')).toHaveAttribute('aria-selected', 'true');
    await keyboard(page, 0);
    await waitForAnimation(searchHost(page));
    const {storyboard: fall} = await animationStoryboard(page, {
      name: 'tabbar-search-ride-down',
      clip: {...clip, y: viewport.height - KEYBOARD - 90},
      times,
      columns: 5,
      cellScale: 0.5,
    });
    await fall.write(testInfo);
    await releaseAnimations(page, {finish: true});
  },
);
