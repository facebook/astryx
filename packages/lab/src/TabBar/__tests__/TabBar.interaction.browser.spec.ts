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
 *   animating; a storyboard of the slide. Under a mouse (a fine
 *   pointer) the lens slides on the theme's motion instead, which
 *   Reduce Motion replaces as above
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

/** UIKit's lens travel on iOS 26.2 (uikit/tabBar.ts `lensTravel`). */
const LENS_TRAVEL = {response: 0.4, dampingFraction: 0.85};

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
  // Software-rendered WebKit can stall input for hundreds of milliseconds
  // around a tap, so the second tap may reach the page only after the first
  // slide has ended: then it was no second tap mid-slide. Where the lens was
  // when the second tap took effect is read in the page; such a late run is
  // played again (at most three times) and every run's motion is checked.
  for (let attempt = 1; ; attempt += 1) {
    const {driver} = await openBar(page);
    const home = await itemCenter(page, 'Home');
    const profile = await itemCenter(page, 'Profile');
    const library = await itemCenter(page, 'Library');
    // Records the lens's centre in the frame the second tap selects Library.
    await page.evaluate(() => {
      const target = [...document.querySelectorAll('[role="tab"]')].find(
        element => element.textContent?.startsWith('Library'),
      );
      const lens = document.querySelector('[data-tab-bar-lens-body]');
      const observer = new MutationObserver(() => {
        if (target?.getAttribute('aria-selected') === 'true' && lens != null) {
          const box = lens.getBoundingClientRect();
          (window as unknown as {__turnedAt: number}).__turnedAt =
            box.x + box.width / 2;
          observer.disconnect();
        }
      });
      if (target != null) {
        observer.observe(target, {attributeFilter: ['aria-selected']});
      }
    });
    // Every frame's lens position, sampled in the page while the taps land.
    const sampling = sampleRects(lensBody(page), 1300);
    await driver.tap(profile);
    await waitForAnimation(lensBody(page), {minProgressMs: 90});
    await driver.tap(library);
    await expect(tab(page, 'Library')).toHaveAttribute('aria-selected', 'true');
    const turnedAt = await page.evaluate(
      () => (window as unknown as {__turnedAt: number}).__turnedAt,
    );
    const samples = (await sampling).flatMap(sample =>
      sample.box == null
        ? []
        : [{t: sample.t, x: sample.box.x + sample.box.width / 2}],
    );
    // It headed for Profile and came back to Library, never jumping: a jump
    // to either end would cover the whole remaining distance (over 100 px)
    // in one frame. Only consecutive frames are compared, never samples a
    // stall kept apart.
    const steps = samples
      .slice(1)
      .flatMap((sample, i) =>
        sample.t - samples[i].t <= 34 ? [sample.x - samples[i].x] : [],
      );
    expect(
      Math.max(...steps.map(Math.abs)),
      JSON.stringify(samples),
    ).toBeLessThan(60);
    expect(Math.min(...samples.map(sample => sample.x))).toBeGreaterThan(
      home.x - 1,
    );
    await waitForRest(lensBody(page));
    expect(Math.abs((await lensCenterX(page)) - library.x)).toBeLessThan(0.5);
    // Mid-slide: past Library, short of Profile, when the second tap took
    // effect.
    expect(turnedAt).toBeGreaterThan(library.x + 20);
    if (turnedAt < profile.x - 20 || attempt === 3) {
      expect(turnedAt, `attempt ${attempt}`).toBeLessThan(profile.x - 20);
      return;
    }
  }
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
  await openBar(page);
  const styles = await page
    .getByRole('tablist', {name: 'Sections'})
    .evaluate(element => {
      const style = getComputedStyle(element);
      return {
        // iOS Safari reads the prefixed property; WebKit has no other.
        prefixed: style.getPropertyValue('-webkit-user-select'),
        unprefixed: CSS.supports('user-select', 'none')
          ? style.getPropertyValue('user-select')
          : 'none',
      };
    });
  expect(styles).toEqual({prefixed: 'none', unprefixed: 'none'});
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
    await expect(tab(page, 'Browse')).toHaveAttribute('aria-selected', 'true');
    await expectCrossFade(page, since);
    await waitForRest(lensBody(page));
    expect(Math.abs((await lensCenterX(page)) - to.x)).toBeLessThan(0.5);
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
