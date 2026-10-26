// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TabBar.interaction.browser.spec.ts
 * @input The built "Lab/TabBar" stories on the harness's phone (touch, so
 *   the touch presentation applies), real touch input (Chromium CDP /
 *   WebKit's input command) and the interaction harness; the iOS cases run
 *   on the harness's phone (a coarse pointer, any engine: one touch
 *   model), the mouse cases without touch
 *   without it
 * @output Proofs that TabBar's lens moves like UITabBar's on iOS 26.2: a tap
 *   on another tab slides it on UIKit's spring (response 0.4 s, damping
 *   ratio 0.85) to within half a pixel, with the selected copy inside it
 *   counter-moving exactly; a second tap mid-slide turns it around without a
 *   jump; the slide keeps advancing every frame through a blocked main
 *   thread and does no Layout or Paint; under Reduce Motion a touch screen's
 *   tap cross-fades it and a click moves it at once (design:reduced-motion);
 *   choosing the
 *   selected tab reselects and moves nothing; badges change without
 *   animating; a storyboard of the slide; under a finger, UITabBar's press
 *   tracking (the lift and flex on landing, the chase, the commit on lift
 *   with its edge cases, a declined change settling back, right to left).
 *   Under a mouse (a fine pointer) a press is a plain
 *   tap and the lens slides on the theme's motion instead, which Reduce
 *   Motion drops
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

/**
 * A mouse case's own guard: its context's primary pointer is fine (a context
 * without touch can still match a coarse pointer in the interaction config).
 */
async function expectFinePointer(page: Page) {
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    'the primary pointer is fine',
  ).toBe(false);
}
/**
 * The opacity of an element's `::before` at each of `times` (ms into the
 * held curves), as sampleCurve reads an element's: the lens's lifted glass is
 * its clip's `::before`.
 */
async function samplePseudoOpacity(locator: Locator, times: number[]) {
  return locator.evaluate((element, ts) => {
    const held =
      (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ?? [];
    return ts.map(t => {
      for (const animation of held) {
        const end = Number(
          animation.effect?.getComputedTiming().endTime ?? Infinity,
        );
        animation.currentTime = Math.min(t, end - 0.001);
      }
      return Number(getComputedStyle(element, '::before').opacity);
    });
  }, times);
}

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

/**
 * Opens a TabBar story on the harness's phone: a coarse primary pointer, so
 * the touch presentation applies, whatever the engine (one touch model).
 */
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
  // Software-rendered WebKit can stall input for hundreds of milliseconds
  // around a tap, so the second finger may reach the page only after the
  // first slide has ended: then it was no second tap mid-slide. Where the
  // lens was when the second finger landed is read in the page; such a late
  // run is played again (at most three times) and every run's motion is
  // checked.
  for (let attempt = 1; ; attempt += 1) {
    const {driver} = await openBar(page);
    const home = await itemCenter(page, 'Home');
    const profile = await itemCenter(page, 'Profile');
    const library = await itemCenter(page, 'Library');
    // Records the lens's centre as each finger lands: under a finger the
    // lens turns for the second finger the moment it lands.
    await page.evaluate(() => {
      const lens = document.querySelector('[data-tab-bar-lens-body]');
      const landings: number[] = [];
      (window as unknown as {__landings: number[]}).__landings = landings;
      window.addEventListener(
        'touchstart',
        () => {
          const box = lens?.getBoundingClientRect();
          if (box != null) {
            landings.push(box.x + box.width / 2);
          }
        },
        {capture: true},
      );
    });
    // Every frame's lens position, sampled in the page while the taps land.
    const sampling = sampleRects(lensBody(page), 1300);
    await driver.tap(profile);
    // Well past Library on its way to Profile.
    await waitForAnimation(lensBody(page), {minProgressMs: 150});
    await driver.tap(library);
    await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
    const turnedAt = await page.evaluate(
      () => (window as unknown as {__landings: number[]}).__landings[1],
    );
    const samples = (await sampling).flatMap(sample =>
      sample.box == null
        ? []
        : [{t: sample.t, x: sample.box.x + sample.box.width / 2}],
    );
    // It headed for Profile and came back to Library, never jumping: a jump
    // to either end would cover the whole remaining distance (over 100 px)
    // in one frame. (A frame the second tap makes long, as it reports the
    // first tap to the app, can cover 60.) Only consecutive frames are
    // compared, never samples a stall kept apart.
    const steps = samples
      .slice(1)
      .flatMap((sample, i) =>
        sample.t - samples[i].t <= 34 ? [sample.x - samples[i].x] : [],
      );
    expect(
      Math.max(...steps.map(Math.abs)),
      JSON.stringify(samples),
    ).toBeLessThan(90);
    expect(Math.min(...samples.map(sample => sample.x))).toBeGreaterThan(
      home.x - 1,
    );
    await waitForRest(lensBody(page));
    expect(Math.abs((await lensCenterX(page)) - library.x)).toBeLessThan(0.5);
    // Mid-slide: past Library, short of Profile, when the second finger
    // landed.
    expect(turnedAt).toBeGreaterThan(library.x + 5);
    if (turnedAt < profile.x - 20 || attempt === 3) {
      expect(turnedAt, `attempt ${attempt}`).toBeLessThan(profile.x - 20);
      return;
    }
  }
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
  const samples = (await sampling).flatMap(sample =>
    sample.box == null
      ? []
      : [{t: sample.t, x: sample.box.x + sample.box.width / 2}],
  );
  const centers = samples.map(sample => sample.x);
  // Only consecutive frames are compared, never samples a stall kept apart
  // (software-rendered WebKit can present no frame for a while around a
  // touch).
  const steps = samples
    .slice(1)
    .flatMap((sample, i) =>
      sample.t - samples[i].t <= 34 ? [sample.x - samples[i].x] : [],
    );
  expect(
    Math.max(...steps.map(Math.abs)),
    JSON.stringify(samples),
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

test('with no tab selected, a finger chooses the tab under it', async ({
  page,
}) => {
  const {driver} = await openBar(page, 'no-selection');
  await expect(page.getByRole('tab', {selected: true})).toHaveCount(0);
  const browse = await itemCenter(page, 'Browse');
  await driver.tap(browse);
  await expect(tab(page, 'Browse')).toHaveAttribute('aria-selected', 'true');
});

test('a tap reports its choice once, and a mouse click chooses through the browser', async ({
  page,
}) => {
  const {driver} = await openBar(page, 'removed-on-lift');
  const read = () =>
    page.evaluate(
      () => (window as unknown as {__tabBarChanges: string[]}).__tabBarChanges,
    );
  await page.evaluate(() => {
    (window as unknown as {__tabBarChanges: string[]}).__tabBarChanges = [];
  });
  // Under a finger the lift reports, and the click the browser sends after
  // it must not report again (`spec:AST-094` FR21).
  await driver.tap(await itemCenter(page, 'Library'));
  await page.waitForTimeout(400);
  expect((await read()).filter(entry => entry === 'library')).toEqual([
    'library',
  ]);
});

test('a bar removed as the finger lifts reports nothing after it is gone', async ({
  page,
}) => {
  const {driver} = await openBar(page, 'removed-on-lift');
  await page.evaluate(() => {
    (window as unknown as {__tabBarChanges: string[]}).__tabBarChanges = [];
  });
  await driver.tap(await itemCenter(page, 'Library'));
  await expect(page.getByText('Removed')).toBeVisible();
  await page.waitForTimeout(400);
  // The lift reports from its own event, so the choice may arrive before
  // the app removes the bar in that event, never after.
  const log = await page.evaluate(
    () => (window as unknown as {__tabBarChanges: string[]}).__tabBarChanges,
  );
  expect(log.at(-1)).toBe('(removed)');
  expect(log.filter(entry => entry !== '(removed)')).toEqual(
    log.length > 1 ? ['library'] : [],
  );
});

test('the bar sets no page-level stacking rank: its layers order inside it', async ({
  page,
}) => {
  await openBar(page);
  const root = await page.getByTestId('tab-bar').evaluate(element => {
    const style = getComputedStyle(element);
    return {zIndex: style.zIndex, isolation: style.isolation};
  });
  expect(root).toEqual({zIndex: 'auto', isolation: 'isolate'});
});

test('a held finger never starts text selection on the bar', async ({page}) => {
  const {driver, bar} = await openBar(page);
  const read = () =>
    bar.evaluate(element => {
      const style = getComputedStyle(element);
      return {
        // iOS Safari reads the prefixed property; WebKit has no other.
        prefixed: style.getPropertyValue('-webkit-user-select'),
        unprefixed: CSS.supports('user-select', 'none')
          ? style.getPropertyValue('user-select')
          : 'none',
      };
    });
  // The lock belongs to the hold: the gesture host sets it on the elements
  // a held finger presses and takes it off at the lift, so the bar carries
  // nothing of its own at rest.
  let held: {prefixed: string; unprefixed: string} | null = null;
  const point = await itemCenter(page, 'Home');
  await driver.play(tapScript(point, {holdMs: 300}), {
    onEvent: async (_step, index) => {
      if (index === 0) {
        held = await read();
      }
    },
  });
  expect(held).toEqual({prefixed: 'none', unprefixed: 'none'});
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
      const glass = await samplePseudoOpacity(
        page.locator('[data-tab-bar-lens-clip]'),
        times,
      );
      samples = times.map((t, i) => ({
        t: +t.toFixed(1),
        flex: flex[i].transform.scaleX,
        liftX: body[i].transform.scaleX,
        liftY: body[i].transform.scaleY,
        glass: glass[i],
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

test('the lift reports its choice from its own event, the settle already started (react-component-runtime INV2)', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  const browse = await itemCenter(page, 'Browse');
  await page.evaluate(() => {
    const w = window as unknown as {
      __lift: {
        frames: number;
        atLift: number;
        atChoice: number;
        settling: boolean;
      };
    };
    w.__lift = {frames: 0, atLift: -1, atChoice: -1, settling: false};
    const tick = () => {
      w.__lift.frames += 1;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    window.addEventListener(
      'touchend',
      () => {
        w.__lift.atLift = w.__lift.frames;
      },
      {capture: true},
    );
    const tab = [...document.querySelectorAll('[role="tab"]')].find(element =>
      element.textContent?.includes('Browse'),
    );
    const body = document.querySelector('[data-tab-bar-lens-body]');
    new MutationObserver(() => {
      if (tab?.getAttribute('aria-selected') === 'true') {
        w.__lift.atChoice = w.__lift.frames;
        w.__lift.settling = (body?.getAnimations().length ?? 0) > 0;
      }
    }).observe(tab as Element, {attributeFilter: ['aria-selected']});
  });
  await driver.play(tapScript(browse, {holdMs: 200}));
  await expect(tab(page, 'Browse')).toHaveAttribute('aria-selected', 'true');
  const lift = await page.evaluate(
    () =>
      (
        window as unknown as {
          __lift: {
            frames: number;
            atLift: number;
            atChoice: number;
            settling: boolean;
          };
        }
      ).__lift,
  );
  // Chosen in the lift's own task: no frame between the lift and the choice.
  expect(lift.atLift).toBeGreaterThanOrEqual(0);
  expect(lift.atChoice).toBe(lift.atLift);
  // The settle was running when the app heard the choice.
  expect(lift.settling).toBe(true);
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
  // The choice reaches the app from the lift itself and restarts the lens's
  // travel from its new resting place; hold the curves after that, so no
  // held animation is one the animator has since replaced.
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

test('when the app keeps the old selection, the lens settles back onto it', async ({
  page,
}) => {
  const {driver} = await openBar(page, 'keeps-selection');
  const home = await itemCenter(page, 'Home');
  const profile = await itemCenter(page, 'Profile');
  await driver.play(drag(home, profile, {durationMs: 500, restMs: 300}));
  // The lift chose Profile; the app kept Home.
  await page.waitForTimeout(150);
  await expect(tab(page, 'Home')).toHaveAttribute('aria-selected', 'true');
  await expect(tab(page, 'Profile')).toHaveAttribute('aria-selected', 'false');
  await waitForRest(page.getByRole('tablist'));
  expect(Math.abs((await lensCenterX(page)) - home.x)).toBeLessThan(0.5);
  expect(await scaleOf(lensBody(page))).toEqual({x: 1, y: 1});
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
    {
      axis: 'x',
      settledWithin: 2,
      // Screencast throughput, not the animation: no display-rate bound.
      maxMedianFrameMs: Infinity,
    },
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
  // The harness's verdict: no stall past two dropped screencast frames,
  // and the frames moving (a loaded machine drops a frame
  // or two; a frozen slide presents none).
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

/** The document's timeline now, to read only the animations a change starts. */
const timelineNow = (page: Page) =>
  page.evaluate(() => Number(document.timeline.currentTime ?? 0));

/**
 * Every animation running in the document (CSS transitions included) that
 * started at or after `since`, as design:reduced-motion's checks read it: the
 * properties its keyframes interpolate (a value that only jumps, at one
 * offset, moves nothing on screen), and when its curve reaches its end value
 * (the animator holds the end after it).
 */
async function runningAnimations(page: Page, since = 0) {
  return page.evaluate(since => {
    const meta = ['offset', 'computedOffset', 'easing', 'composite'];
    return document
      .getAnimations()
      .filter(
        animation =>
          animation.startTime == null ||
          Number(animation.startTime) >= since - 50,
      )
      .map(animation => {
        const effect = animation.effect as KeyframeEffect;
        const frames = effect.getKeyframes();
        const keys = [
          ...new Set(frames.flatMap(frame => Object.keys(frame))),
        ].filter(key => !meta.includes(key));
        const value = (frame: ComputedKeyframe, key: string) =>
          String(frame[key]);
        const interpolated = keys.filter(key =>
          frames.some(
            (frame, index) =>
              index > 0 &&
              frame.computedOffset !== frames[index - 1].computedOffset &&
              value(frame, key) !== value(frames[index - 1], key),
          ),
        );
        const last = frames[frames.length - 1];
        let end = frames.length - 1;
        while (
          end > 0 &&
          keys.every(key => value(frames[end - 1], key) === value(last, key))
        ) {
          end -= 1;
        }
        const timing = effect.getTiming();
        return {
          properties: interpolated,
          endsMs:
            Number(timing.delay ?? 0) +
            (frames[end]?.computedOffset ?? 0) * Number(timing.duration),
        };
      });
  }, since);
}

/**
 * design:reduced-motion DR2, on a touch screen: the change cross-fades, every
 * animation it starts changes opacity only and ends within 200 ms.
 */
async function expectCrossFade(page: Page, since = 0) {
  await expect
    .poll(
      async () =>
        (await runningAnimations(page, since)).some(
          animation =>
            animation.properties.includes('opacity') && animation.endsMs > 0,
        ),
      {message: 'no cross-fade', timeout: 2000},
    )
    .toBe(true);
  assertCrossFade(await runningAnimations(page, since));
}

/** design:reduced-motion DR2 on animations already read. */
function assertCrossFade(
  animations: Awaited<ReturnType<typeof runningAnimations>>,
) {
  expect(
    animations.some(
      animation =>
        animation.properties.includes('opacity') && animation.endsMs > 0,
    ),
    `no cross-fade: ${JSON.stringify(animations)}`,
  ).toBe(true);
  assertOpacityOnly(animations);
}

/**
 * design:reduced-motion DR2 on animations already read, the fade itself not
 * required: every one changes opacity only and ends within 200 ms.
 */
function assertOpacityOnly(
  animations: Awaited<ReturnType<typeof runningAnimations>>,
) {
  for (const animation of animations) {
    expect(
      animation.properties.filter(property => property !== 'opacity'),
      JSON.stringify(animations),
    ).toEqual([]);
    expect(animation.endsMs, JSON.stringify(animations)).toBeLessThanOrEqual(
      200,
    );
  }
}

/** design:reduced-motion DR3, under a mouse: nothing animates. */
async function expectNoMotion(page: Page, since = 0) {
  await page.waitForTimeout(150);
  const animations = await runningAnimations(page, since);
  expect(
    animations.filter(animation => animation.properties.length > 0),
    JSON.stringify(animations),
  ).toEqual([]);
}

/** A tab's label: its weight tells the selected look from the plain one. */
const labelWeight = (page: Page, name: string) =>
  tab(page, name)
    .locator(':scope > span > span')
    .nth(1)
    .evaluate(element => getComputedStyle(element).fontWeight);

test('at rest the selected tab draws its own look; the copy of the items rides in the lens only while it slides', async ({
  page,
}) => {
  const {driver} = await openBar(page);
  // At rest each item is drawn once, the selected one in its selected look.
  await expect(lensCopy(page)).toHaveCount(0);
  expect(await labelWeight(page, 'Home')).toBe('600');
  expect(await labelWeight(page, 'Browse')).not.toBe('600');
  await driver.tap(await itemCenter(page, 'Browse'));
  // While the lens slides, the selected look rides inside it…
  await expect(lensCopy(page)).toHaveCount(1);
  expect(await labelWeight(page, 'Browse')).not.toBe('600');
  // …and once it rests the copy goes and the tab draws it again.
  await waitForRest(lensBody(page));
  await expect(lensCopy(page)).toHaveCount(0);
  expect(await labelWeight(page, 'Browse')).toBe('600');
  expect(await labelWeight(page, 'Home')).not.toBe('600');
});

test.describe('with Reduce Motion (design:reduced-motion)', () => {
  test('on a touch screen a tap cross-fades the lens: opacity only, within 200 ms', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver} = await openBar(page);
    const to = await itemCenter(page, 'Browse');
    const since = await timelineNow(page);
    await driver.tap(to);
    // The fade starts with the touch; the selection follows the lift a few
    // frames later.
    await expectCrossFade(page, since);
    await expect(tab(page, 'Browse')).toHaveAttribute('aria-selected', 'true');
    assertOpacityOnly(await runningAnimations(page, since));
    await waitForRest(lensBody(page));
    expect(Math.abs((await lensCenterX(page)) - to.x)).toBeLessThan(0.5);
  });

  test('a press neither lifts nor flexes, and a drag’s release cross-fades the settle', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'only Chromium’s touches can be read mid-script',
    );
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver} = await openBar(page);
    const home = await itemCenter(page, 'Home');
    const library = await itemCenter(page, 'Library');
    let held: unknown = null;
    await driver.play(tapScript(home, {holdMs: 200}), {
      onEvent: async step => {
        if (step.type === 'touchStart') {
          await page.waitForTimeout(120);
          held = {
            lens: await scaleOf(lensBody(page)),
            bar: await scaleOf(page.getByRole('tablist')),
          };
        }
      },
    });
    expect(held).toEqual({lens: {x: 1, y: 1}, bar: {x: 1, y: 1}});
    // The lens follows the finger through the drag (direct manipulation); the
    // settle its release starts is a transition, so it cross-fades (DR2).
    let released = 0;
    await driver.play(drag(home, library, {durationMs: 400, restMs: 300}), {
      onEvent: async step => {
        if (step.type === 'touchEnd') {
          released = await timelineNow(page);
        }
      },
    });
    // The fade starts with the input; what it changes follows a few
    // frames later.
    await expectCrossFade(page, released);
    await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
    assertOpacityOnly(await runningAnimations(page, released));
  });
});

/** The lens's CSS slide under a mouse: its duration and running transitions. */
const cssSlide = async (page: Page) =>
  page.locator('[data-tab-bar-lens]').evaluate(element => ({
    duration: getComputedStyle(element).transitionDuration,
    transitions: element
      .getAnimations()
      .filter(animation => animation instanceof CSSTransition).length,
  }));

/**
 * Under a mouse the lens slides in CSS on the theme's motion, and its body,
 * which the animator moves under a finger, never animates.
 */
async function expectCssSlide(page: Page, {isRunning = true} = {}) {
  expect((await cssSlide(page)).duration).not.toBe('0s');
  if (isRunning) {
    await expect.poll(async () => (await cssSlide(page)).transitions).toBe(1);
  }
  expect(
    await lensBody(page).evaluate(element => element.getAnimations().length),
  ).toBe(0);
}

test.describe('touch work costs nothing under a fine pointer', () => {
  test.describe('under a mouse', () => {
    test.use({hasTouch: false, isMobile: false});

    test('a click chooses a tab, where the gesture host attaches nothing', async ({
      page,
    }) => {
      await expectFinePointer(page);
      await openBar(page);
      // `spec:AST-094` FR19/FR24: under a fine pointer no recognizer attaches,
      // so the tab activates from the browser's own click.
      await tab(page, 'Library').click();
      await expect(tab(page, 'Library')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(tab(page, 'Home')).toHaveAttribute('aria-selected', 'false');
      // And from the keyboard, the other route a fine pointer leaves.
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      await expect(tab(page, 'Browse')).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    test('with Reduce Motion a click moves the lens at once', async ({
      page,
    }) => {
      await expectFinePointer(page);
      await page.emulateMedia({reducedMotion: 'reduce'});
      await openStory(page, storybook(), 'lab-tabbar--default');
      await expect(page.getByRole('tablist', {name: 'Sections'})).toBeVisible();
      const since = await timelineNow(page);
      await tab(page, 'Browse').click();
      await expect(tab(page, 'Browse')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expectNoMotion(page, since);
    });

    test('a click draws no copy of the items', async ({page}) => {
      await expectFinePointer(page);
      await openStory(page, storybook(), 'lab-tabbar--default');
      await expect(page.getByRole('tablist', {name: 'Sections'})).toBeVisible();
      await tab(page, 'Browse').click();
      await expect(tab(page, 'Browse')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      // The selected look moves to the tab at once; the lens slides under it.
      expect(await labelWeight(page, 'Browse')).toBe('600');
      await expect(lensCopy(page)).toHaveCount(0);
      await page.waitForTimeout(400);
      await expect(lensCopy(page)).toHaveCount(0);
    });

    test('the bar sets no selection or callout override of its own', async ({
      page,
    }) => {
      await expectFinePointer(page);
      await openStory(page, storybook(), 'lab-tabbar--default');
      const capsule = page.getByRole('tablist', {name: 'Sections'});
      await expect(capsule).toBeVisible();
      // Under a finger the gesture host owns them while a finger is down;
      // under a mouse desktop selection is unchanged.
      expect(
        await capsule.evaluate(element => getComputedStyle(element).userSelect),
      ).not.toBe('none');
    });

    test('a click slides the lens on the theme’s motion', async ({page}) => {
      await expectFinePointer(page);
      await openStory(page, storybook(), 'lab-tabbar--default');
      await expect(page.getByRole('tablist', {name: 'Sections'})).toBeVisible();
      await tab(page, 'Browse').click();
      await expect(tab(page, 'Browse')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expectCssSlide(page);
    });
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
