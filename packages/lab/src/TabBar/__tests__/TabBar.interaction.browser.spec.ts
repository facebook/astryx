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
 *   minimized bar lets the page take touches outside the circle
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
  openStory,
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
