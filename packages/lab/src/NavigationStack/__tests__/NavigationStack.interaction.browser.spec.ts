// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NavigationStack.interaction.browser.spec.ts
 * @input The built "Lab/NavigationStack" stories on the harness's phone, real
 *   touch input (Chromium CDP / WebKit's input command) and the interaction
 *   harness
 * @output Proofs that NavigationStack moves like UINavigationController on
 *   iOS 26.2: a push follows UIKit's push spring (critically damped, 0.3 s,
 *   starting at 8.773 widths/s) to within half a pixel, with the card
 *   underneath at 0.3 of its speed; the back swipe tracks the finger 1:1 from
 *   the leading edge and from the content, finishes or springs back by
 *   UIKit's release rule, and a flick finishes from near the edge; a push
 *   keeps advancing every frame through a blocked main thread and does no
 *   Layout or Paint; Reduce Motion cross-fades; storyboards of a push and of
 *   a released swipe.
 * @position Interaction proof for lab NavigationStack (NavigationStack.tsx,
 *   navigationTransition.ts); shape copied from the harness exemplar,
 *   BottomSheetDetent.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  castStoryboard,
  countBetween,
  cubicBezier,
  drag,
  flick,
  holdAnimations,
  markElement,
  openStory,
  releaseAnimations,
  sampleRects,
  startScreencast,
  touchDriver,
  touchStoryboard,
  traceRendering,
  trackMarker,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** UIKit's push spring on iOS 26.2: critically damped, response 0.3 s. */
const OMEGA = (2 * Math.PI) / 0.3;
/** Its starting speed, widths per second. */
const PUSH_VELOCITY = 8.773;

interface Stack {
  driver: TouchDriver;
  stack: Locator;
  width: number;
  left: number;
  /** The bar title of the screen on top. */
  topTitle: () => Promise<string | null>;
}

/**
 * Opens a story. `standalone` makes the page a home-screen web app
 * (`navigator.standalone`), where no browser back swipe owns the screen
 * edge, so the stack's own edge swipe runs.
 */
async function openStack(
  page: Page,
  story: 'settings' | 'pushed' | 'large-title' | 'search',
  {
    standalone = false,
    idiom = 'ios',
  }: {standalone?: boolean; idiom?: 'ios' | 'default'} = {},
) {
  if (idiom === 'ios') {
    // The back swipes are iOS-only (useTouchIdiom: a coarse pointer in an
    // engine with -webkit-touch-callout, which only iOS WebKit implements).
    // Neither Playwright engine is iOS WebKit, so the engine test answers as
    // Mobile Safari would; the pointer stays the emulated finger.
    await page.addInitScript(() => {
      const supports = CSS.supports.bind(CSS);
      CSS.supports = ((...args: [string] | [string, string]) =>
        args.join(':').includes('-webkit-touch-callout')
          ? true
          : supports(...(args as [string, string]))) as typeof CSS.supports;
    });
  }
  if (standalone) {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'standalone', {
        configurable: true,
        get: () => true,
      });
    });
  }
  await openStory(page, storybook(), `lab-navigationstack--${story}`);
  const driver = await touchDriver(page);
  const stack = page.getByTestId('navigation-stack');
  await expect(stack).toBeVisible();
  const box = await stack.boundingBox();
  if (box == null) {
    throw new Error('no stack');
  }
  return {
    driver,
    stack,
    width: box.width,
    left: box.x,
    topTitle: async () =>
      page.evaluate(() => {
        const top = document.querySelector('[data-navigation-top]');
        const key = top?.getAttribute('data-navigation-screen');
        const bars = [...document.querySelectorAll('h2')];
        // The top screen's bar title is the one not inert.
        const live = bars.find(h => h.closest('[inert]') == null);
        return key == null ? null : (live?.textContent ?? null);
      }),
  } satisfies Stack;
}

/** A card's presented translateX, px (the animator drives `translate`). */
const translateX = async (card: Locator) =>
  card.evaluate(element => {
    const value = getComputedStyle(element).translate;
    return value === 'none' ? 0 : parseFloat(value);
  });

const card = (page: Page, key: string) =>
  page.locator(`[data-navigation-screen="${key}"]`);

const rowCenter = async (page: Page, name: string) => {
  const box = await page.getByRole('button', {name}).first().boundingBox();
  if (box == null) {
    throw new Error(`no row ${name}`);
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
};

test('a push follows UIKit’s push spring, the card underneath at 0.3 of its speed', async ({
  page,
}, testInfo) => {
  const {driver, width} = await openStack(page, 'settings');
  await driver.tap(await rowCenter(page, 'General'));
  const top = card(page, 'screen-General');
  const under = card(page, 'root');
  await waitForAnimation(top);
  await holdAnimations(page);

  const times = Array.from({length: 31}, (_, i) => i * 16.667);
  const samples: {t: number; top: number; under: number; analytic: number}[] =
    [];
  for (const t of times) {
    await page.evaluate(ms => {
      const held =
        (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ??
        [];
      for (const animation of held) {
        const end = Number(
          animation.effect?.getComputedTiming().endTime ?? Infinity,
        );
        animation.currentTime = Math.min(ms, end - 0.5);
      }
    }, t);
    const s = t / 1000;
    // x(t) = (x0 + (v0 + ω·x0)·t)·e^(−ωt), from x0 = W at v0 = −8.773 W/s.
    const analytic =
      (width + (-PUSH_VELOCITY * width + OMEGA * width) * s) *
      Math.exp(-OMEGA * s);
    samples.push({
      t: +t.toFixed(1),
      top: await translateX(top),
      under: await translateX(under),
      analytic,
    });
  }
  await releaseAnimations(page, {finish: true});
  await writeEvidence(
    'curves/navigationstack-push',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {width, samples},
        null,
        1,
      ),
    },
    testInfo,
  );

  for (const sample of samples) {
    expect(
      Math.abs(sample.top - sample.analytic),
      JSON.stringify(sample),
    ).toBeLessThan(0.5);
    // The card underneath: x = −0.3 W · (1 − p), p = top / W.
    expect(sample.under).toBeCloseTo(
      -0.3 * width * (1 - sample.top / width),
      0,
    );
  }
  // It starts fast (UIKit's starting velocity, not from rest) and lands.
  expect(samples[1].top).toBeLessThan(width * 0.92);
  expect(samples.at(-1)?.top ?? Infinity).toBeLessThan(0.5);
});

test('a push’s bar: the new title appears in place, the covered one slides away, the chevron fades in', async ({
  page,
}) => {
  const {driver, width} = await openStack(page, 'settings');
  await driver.tap(await rowCenter(page, 'General'));
  const top = card(page, 'screen-General');
  await waitForAnimation(top);
  await holdAnimations(page);
  // Critically damped from rest (springs.navigationCoveredTitle 0.178 s,
  // springs.navigationBackButton 0.4 s), fitted to iOS 26.2's frames.
  const crit = (response: number, ms: number) => {
    const u = ((2 * Math.PI) / response) * (ms / 1000);
    return 1 - (1 + u) * Math.exp(-u);
  };
  for (const t of [33.3, 100, 200]) {
    const read = await page.evaluate(ms => {
      const held =
        (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ??
        [];
      for (const animation of held) {
        const end = Number(
          animation.effect?.getComputedTiming().endTime ?? Infinity,
        );
        animation.currentTime = Math.min(ms, end - 0.5);
      }
      const x = (el: Element | null) => {
        const value = el == null ? 'none' : getComputedStyle(el).translate;
        return value === 'none' ? 0 : parseFloat(value);
      };
      const bar = (key: string) =>
        document.querySelector(`[data-navigation-bar="${key}"]`);
      return {
        topTitle: x(bar('screen-General')?.querySelector('h2') ?? null),
        underTitle: x(bar('root')?.querySelector('h2') ?? null),
        back: Number(
          getComputedStyle(bar('screen-General')?.firstElementChild as Element)
            .opacity,
        ),
      };
    }, t);
    expect(read.topTitle).toBe(0);
    expect(read.underTitle).toBeCloseTo(-0.3 * width * crit(0.178, t), 0);
    expect(Math.abs(read.back - crit(0.4, t))).toBeLessThan(0.03);
  }
  await releaseAnimations(page, {finish: true});
});

test('the back swipe from the leading edge tracks the finger and pops past half', async ({
  page,
}) => {
  const {driver, width, left, topTitle} = await openStack(page, 'pushed', {
    standalone: true,
  });
  expect(await topTitle()).toBe('About');
  const top = card(page, 'screen-About');
  const y = 400;
  const travel: {finger: number; card: number}[] = [];
  const script = drag(
    {x: left + 4, y},
    {x: left + width * 0.65, y},
    {durationMs: 600, restMs: 150},
  );
  await driver.play(script, {
    onEvent: async step => {
      const finger = step.fingers[0]?.x;
      if (finger != null) {
        travel.push({finger: finger - (left + 4), card: await translateX(top)});
      }
    },
  });
  await waitForRest(card(page, 'screen-General'));
  await expect.poll(topTitle).toBe('General');
  await expect(top).toHaveCount(0);

  // Once the edge pan has begun (15 px hysteresis), the card is the finger's
  // travel past it: 1:1.
  const tracking = travel.filter(t => t.card > 1 && t.finger < width * 0.6);
  expect(tracking.length).toBeGreaterThan(5);
  for (const t of tracking) {
    expect(Math.abs(t.card - (t.finger - 15))).toBeLessThan(2);
  }
});

test('a slow back swipe released short of half springs back', async ({
  page,
}) => {
  const {driver, width, left, topTitle} = await openStack(page, 'pushed', {
    standalone: true,
  });
  const top = card(page, 'screen-About');
  // A slow approach: little velocity at the lift, so p + 0.35·v stays short.
  await driver.play(
    drag(
      {x: left + 4, y: 400},
      {x: left + width * 0.32, y: 400},
      {
        durationMs: 2000,
        hz: 60,
      },
    ),
  );
  await waitForRest(top);
  expect(await topTitle()).toBe('About');
  expect(Math.abs(await translateX(top))).toBeLessThan(0.5);
});

test('moving back before the lift cancels the pop', async ({page}) => {
  const {driver, width, left, topTitle} = await openStack(page, 'pushed', {
    standalone: true,
  });
  const top = card(page, 'screen-About');
  const out = [
    ...drag(
      {x: left + 4, y: 400},
      {x: left + width * 0.45, y: 400},
      {
        durationMs: 450,
      },
    ),
  ];
  // Continue the same finger back 40 px before lifting.
  const lift = out.pop();
  const last = out[out.length - 1];
  const x0 = last.fingers[0].x;
  for (let i = 1; i <= 8; i++) {
    out.push({t: last.t + i * 16.7, fingers: [{id: 0, x: x0 - i * 5, y: 400}]});
  }
  out.push({t: (lift?.t ?? last.t) + 8 * 16.7 + 4, fingers: []});
  await driver.play(out);
  await waitForRest(top);
  expect(await topTitle()).toBe('About');
});

test('a fast swipe that pauses before the lift still finishes (the velocity does not decay)', async ({
  page,
}) => {
  const {driver, width, left, topTitle} = await openStack(page, 'pushed', {
    standalone: true,
  });
  await driver.play(
    drag(
      {x: left + 4, y: 400},
      {x: left + width * 0.42, y: 400},
      {
        durationMs: 400,
        restMs: 300,
      },
    ),
  );
  await waitForRest(card(page, 'screen-General'));
  await expect.poll(topTitle).toBe('General');
});

test('a flick from near the edge finishes the pop', async ({page}) => {
  const {driver, left, topTitle} = await openStack(page, 'pushed', {
    standalone: true,
  });
  // ~60 px of travel at ~1200 px/s: p + 0.35·v is well past half.
  await driver.play(flick({x: left + 6, y: 400}, {velocity: {x: 1200, y: 0}}));
  await waitForRest(card(page, 'screen-General'));
  await expect.poll(topTitle).toBe('General');
});

test('in a browser tab the leading screen edge stays the browser’s', async ({
  page,
}) => {
  // Not a home-screen app: a swipe from the edge band is the browser's back
  // swipe (AST-094 FR22), so the stack neither tracks nor pops.
  const {driver, width, left, topTitle} = await openStack(page, 'pushed');
  const top = card(page, 'screen-About');
  let moved = 0;
  await driver.play(
    drag(
      {x: left + 4, y: 400},
      {x: left + width * 0.7, y: 400},
      {
        durationMs: 400,
        restMs: 120,
      },
    ),
    {
      onEvent: async () => {
        moved = Math.max(moved, Math.abs(await translateX(top)));
      },
    },
  );
  await page.waitForTimeout(300);
  expect(moved).toBe(0);
  expect(await topTitle()).toBe('About');
});

test('a sideways drag in the content pops (iOS 26’s full-width back swipe)', async ({
  page,
}) => {
  const {driver, width, left, topTitle} = await openStack(page, 'pushed');
  await driver.play(
    drag(
      {x: left + width * 0.3, y: 500},
      {x: left + width * 0.98, y: 500},
      {
        durationMs: 500,
        restMs: 150,
      },
    ),
  );
  await waitForRest(card(page, 'screen-General'));
  await expect.poll(topTitle).toBe('General');
});

test('a push keeps advancing every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {driver} = await openStack(page, 'settings');
  const top = card(page, 'screen-General');
  const cast = await startScreencast(page);
  await driver.tap(await rowCenter(page, 'General'));
  // Below the bar, which overlays the screens.
  await markElement(top, {inset: 60});
  const [push] = await waitForAnimation(top, {minProgressMs: 16});
  const block = await blockMainThread(page, 600);
  await page.waitForTimeout(150);
  const castFrames = await cast.stop();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(
    tracked,
    {from: block.from, to: Math.min(block.to, push.to)},
    // The screencast resolves whole CSS pixels at both ends of the spring's
    // sub-pixel tail: the last frame can round one pixel away from a tail
    // frame that is still within a pixel of rest, so "settled" is 2 px.
    {axis: 'x', settledWithin: 2},
  );
  await writeEvidence(
    'busy-main-thread/navigationstack-push',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, push, proof},
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'navigationstack-push-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: Math.min(block.to, push.to) + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({x: tracked.find(f => f.t === t)?.box?.x ?? -1}),
  });
  await film.write(testInfo, {block, push});
  expect(proof.expectedFrames).toBeGreaterThan(5);
  expect(proof.medianFrameMs).toBeLessThan(20);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
  expect(proof.longestStallMs).toBeLessThan(40);
});

test('the covered title is removed on time while the main thread is blocked', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {driver} = await openStack(page, 'settings');
  // The root's bar title slides away under a push and is removed 0.54 s in
  // (navigation.coveredTitleRemovedMs); a marker at its trailing end (clear
  // of the pushed screen's back button) goes with it.
  await page.locator('[data-navigation-bar="root"] h2').evaluate(title => {
    const element = title as HTMLElement;
    element.style.position = 'relative';
    const chip = document.createElement('div');
    chip.setAttribute('aria-hidden', 'true');
    chip.style.cssText =
      'position:absolute;top:4px;right:0;width:10px;height:10px;background:rgb(255,0,255);pointer-events:none;';
    element.append(chip);
  });
  const cast = await startScreencast(page);
  await driver.tap(await rowCenter(page, 'General'));
  const [push] = await waitForAnimation(card(page, 'screen-General'), {
    minProgressMs: 16,
  });
  // Blocked well past the removal: the removal must not wait for it.
  const block = await blockMainThread(page, 900);
  await page.waitForTimeout(150);
  const frames = await cast.stop();
  const tracked = await trackMarker(page, frames);
  const removeAt = push.from + 540;
  expect(block.to).toBeGreaterThan(removeAt + 150);
  const before = tracked.filter(
    f => f.t > push.from + 50 && f.t < removeAt - 50,
  );
  expect(before.length).toBeGreaterThan(3);
  expect(
    before.every(f => f.box != null),
    JSON.stringify(
      before.map(f => [Math.round(f.t - push.from), f.box?.x ?? null]),
    ),
  ).toBe(true);
  // The screencast sends a frame only when the screen changes, so the last
  // frame before the block ends is the screen as the block leaves it: it
  // must come from after the removal and show no title.
  const last = tracked.filter(f => f.t < block.to - 20).at(-1);
  const trace = JSON.stringify(
    tracked.map(f => [Math.round(f.t - push.from), f.box?.x ?? null]),
  );
  expect(last?.box ?? null, trace).toBeNull();
  expect(last?.t ?? 0, trace).toBeGreaterThan(removeAt - 10);
});

test('on Android the back swipes stay off: the system back owns both edges', async ({
  page,
}) => {
  // As an Android phone: a finger, and no -webkit-touch-callout. Even in a
  // home-screen app neither the edge swipe nor the content swipe pops.
  const {driver, left, width} = await openStack(page, 'pushed', {
    standalone: true,
    idiom: 'default',
  });
  const top = card(page, 'screen-About');
  const before = await top.boundingBox();
  await driver.play(
    drag(
      {x: left + 4, y: 400},
      {x: left + width * 0.7, y: 400},
      {durationMs: 500, restMs: 100},
    ),
  );
  await driver.play(
    drag(
      {x: left + width * 0.3, y: 400},
      {x: left + width * 0.95, y: 400},
      {durationMs: 500, restMs: 100},
    ),
  );
  await page.waitForTimeout(400);
  expect((await top.boundingBox())?.x).toBeCloseTo(before?.x ?? NaN, 0);
  // Back is the bar's button.
  await page.locator('[data-navigation-back]').last().click();
  await expect(top).toHaveCount(0);
});

test('a push does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  await openStack(page, 'settings');
  const top = card(page, 'screen-General');
  // A programmatic click: a finger's press would add the row's own press
  // fade, which is not the push.
  const row = page.getByRole('button', {name: 'General'}).first();
  let push = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await row.evaluate(element => (element as HTMLElement).click());
    [push] = await waitForAnimation(top);
    await waitForRest(top);
  });
  // The motion: the push spring is within a pixel of rest by ~0.4 s (the
  // animations themselves run longer: the animator holds end states). The
  // landing (focus moves to the new title) comes after it and may paint.
  expect(push.to - push.from).toBeGreaterThan(380);
  const during = countBetween(trace, push.from + 80, push.from + 380);
  const when = trace.events
    .filter(e => e.name === 'Layout' || e.name === 'Paint')
    .map(e => `${e.name}@${Math.round(e.t - push.from)}`);
  expect(during.Layout ?? 0, JSON.stringify({during, when})).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify({during, when})).toBe(0);
});

test.describe('with Reduce Motion', () => {
  test('a push cross-fades in place instead of sliding', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver} = await openStack(page, 'settings');
    await driver.tap(await rowCenter(page, 'General'));
    const top = card(page, 'screen-General');
    await waitForAnimation(top);
    const midway = await top.evaluate(element => ({
      x: getComputedStyle(element).translate,
      opacity: Number(getComputedStyle(element).opacity),
    }));
    await waitForRest(top);
    // No travel: the incoming screen is already where it lands, fading in.
    expect(midway.x === 'none' || parseFloat(midway.x) === 0).toBe(true);
    expect(midway.opacity).toBeLessThan(1);
    expect(await translateX(top)).toBe(0);
  });
});

test('a large title scrolls under the bar, which then shows the title; scrolling back hides it again', async ({
  page,
}) => {
  await openStack(page, 'large-title');
  const rootCard = card(page, 'root');
  const barText = page.locator('[data-navigation-bar="root"] h2 > span');
  await expect(
    page.getByRole('heading', {level: 1, name: 'Settings'}),
  ).toBeVisible();
  // The text's offset inside the bar title, which the rise moves.
  const read = async () =>
    barText.evaluate(element => ({
      opacity: Number(getComputedStyle(element).opacity),
      top:
        element.getBoundingClientRect().top -
        (element.parentElement as HTMLElement).getBoundingClientRect().top,
    }));
  const hidden = await read();
  expect(hidden.opacity).toBe(0);

  // Scrolled under the bar (the scroll itself is the browser's): the bar's
  // title rises into place as it fades in.
  await rootCard.evaluate(element =>
    (element.firstElementChild as HTMLElement).scrollTo({top: 300}),
  );
  await expect
    .poll(async () => (await read()).opacity, {timeout: 3000})
    .toBe(1);
  // It rose 15 px into place (navigation.inlineTitleRise).
  expect(hidden.top - (await read()).top).toBeCloseTo(15, 0);
  await expect(barText.locator('..')).not.toHaveAttribute('aria-hidden');

  await rootCard.evaluate(element =>
    (element.firstElementChild as HTMLElement).scrollTo({top: 0}),
  );
  await expect
    .poll(async () => (await read()).opacity, {timeout: 3000})
    .toBe(0);
  await expect(barText.locator('..')).toHaveAttribute('aria-hidden', 'true');
});

test('a pushed large title rides in with its screen', async ({page}) => {
  const {driver} = await openStack(page, 'large-title');
  await driver.tap(await rowCenter(page, 'General'));
  const top = card(page, 'screen-General');
  await waitForAnimation(top);
  await waitForRest(top);
  // The pushed screen here is inline; the root's large title stays with the
  // root card, under it and to the left.
  const rootTitle = page.getByRole('heading', {level: 1, name: 'Settings'});
  const box = await rootTitle.boundingBox();
  const rootBox = await card(page, 'root').boundingBox();
  expect(box && rootBox && Math.abs(box.x - rootBox.x)).toBeLessThan(2);
});

/** UIKit's search activation curve, cubic-bezier(0.42, 0, 0.58, 1). */
const activationEase = cubicBezier(0.42, 0, 0.58, 1);
const ACTIVATION_MS = 383.3;
const barItemOpacity = (p: number) => Math.min(1, Math.max(0, 1 - p / 0.35));
const largeTitleReturn = (q: number) =>
  Math.min(1, Math.max(0, (q - 0.65) / 0.35));

/**
 * Lets every held animation finish. One that cannot finish (an endless
 * holding animation) plays on instead, so the rest still finish.
 */
const finishHeld = (page: Page) =>
  page.evaluate(() => {
    const scope = window as unknown as {__harnessHeld?: Animation[]};
    for (const animation of scope.__harnessHeld ?? []) {
      try {
        animation.finish();
      } catch {
        animation.play();
      }
    }
    scope.__harnessHeld = [];
  });

/**
 * WebKit's Linux build stops rendering frames while a SearchField's input
 * has focus (SearchField alone does it too), so nothing started from rest
 * can begin. Ending editing resumes the frames (the search stays active), by
 * which time the motions, timed from the commit, are over. Resolves whether
 * frames were flowing, i.e. whether the motion can be sampled.
 */
const resumeFramesIfStalled = async (page: Page): Promise<boolean> => {
  const hasFrames = await page.evaluate(
    () =>
      new Promise<boolean>(resolve => {
        const timer = setTimeout(() => resolve(false), 250);
        requestAnimationFrame(() => {
          clearTimeout(timer);
          resolve(true);
        });
      }),
  );
  if (!hasFrames) {
    await page.evaluate(() =>
      (document.activeElement as HTMLElement | null)?.blur(),
    );
  }
  return hasFrames;
};

/** Whether the page presents for a finger (`pointer: coarse`). */
const isTouchPresentation = (page: Page) =>
  page.evaluate(() => matchMedia('(pointer: coarse)').matches);

/** Seeks every held animation to `ms` from its start. */
const seekHeld = (page: Page, ms: number) =>
  page.evaluate(t => {
    const held =
      (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ?? [];
    for (const animation of held) {
      const end = Number(
        animation.effect?.getComputedTiming().endTime ?? Infinity,
      );
      animation.currentTime = Math.min(t, end - 0.5);
    }
  }, ms);

/** The search motion's parts on screen `key`. */
const readSearch = (page: Page, key: string) =>
  page.evaluate(k => {
    const card = document.querySelector(`[data-navigation-screen="${k}"]`);
    const scroller = card?.firstElementChild as HTMLElement;
    const title = scroller.querySelector('h1');
    const field = scroller.querySelector('[data-navigation-search]');
    const content = field?.nextElementSibling ?? null;
    const bar = document.querySelector(`[data-navigation-bar="${k}"]`);
    const background = bar?.parentElement?.firstElementChild ?? null;
    const y = (element: Element | null) => {
      if (element == null) {
        return NaN;
      }
      const value = getComputedStyle(element).translate;
      return value === 'none' ? 0 : parseFloat(value.split(' ')[1] ?? '0');
    };
    const opacity = (element: Element | null | undefined) =>
      element == null ? NaN : Number(getComputedStyle(element).opacity);
    return {
      largeY: y(title),
      largeOpacity: opacity(title),
      contentY: y(content),
      backOpacity: opacity(bar?.firstElementChild),
      backgroundOpacity: opacity(background),
    };
  }, key);

const centerOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('not on screen');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
};

test.describe('search in the bar', () => {
  // A WebKit page stops presenting frames for about a second when its first
  // composited animation starts (the engine setting up compositing), long
  // enough to swallow a 383 ms activation. One throwaway activation on the
  // same page pays that cost before the proof reopens the story.
  test.beforeEach(async ({page, browserName}) => {
    if (browserName !== 'webkit') {
      return;
    }
    await openStory(page, storybook(), 'lab-navigationstack--search');
    await page.getByRole('searchbox', {name: 'Search'}).first().click();
    await page.waitForTimeout(1500);
  });

  test('activating hands the bar to the field: the content rides up with it, the large title fades as (1 − p / 0.35)²', async ({
    page,
  }) => {
    await openStack(page, 'search');
    const rootCard = card(page, 'root');
    const field = rootCard.getByRole('searchbox', {name: 'Search'});
    await expect(field).toBeVisible();
    const lift = await page.evaluate(() => {
      const stack = document
        .querySelector('[data-testid="navigation-stack"]')
        ?.getBoundingClientRect();
      const wrapper = document
        .querySelector(
          '[data-navigation-screen="root"] [data-navigation-search]',
        )
        ?.getBoundingClientRect();
      return Math.round((wrapper?.top ?? 0) - (stack?.top ?? 0));
    });
    expect(lift).toBeGreaterThan(44);

    const isTouch = await isTouchPresentation(page);
    // The field activates on focus (a click here: the bar's handover, not the
    // gesture, is under test).
    await field.click();
    const canSample = isTouch && (await resumeFramesIfStalled(page));
    const content = rootCard.locator('[data-navigation-search] + div');
    if (canSample) {
      await waitForAnimation(content);
      await holdAnimations(page);
      for (const ms of [0, 60, 120, 190, 260, 340]) {
        await seekHeld(page, ms);
        const v = await readSearch(page, 'root');
        const p = activationEase(Math.min(1, ms / ACTIVATION_MS));
        const at = JSON.stringify({ms, p, ...v});
        expect(Math.abs(v.contentY + lift * p), at).toBeLessThan(1.5);
        expect(Math.abs(v.largeY + lift * p), at).toBeLessThan(1.5);
        expect(
          Math.abs(v.largeOpacity - barItemOpacity(p) ** 2),
          at,
        ).toBeLessThan(0.03);
        expect(
          Math.abs(v.backgroundOpacity - barItemOpacity(p)),
          at,
        ).toBeLessThan(0.03);
      }
      await finishHeld(page);
    }
    // With a mouse the field and the bar take their places at once, as
    // SearchField does; either way they end in the bar's row.
    await expect
      .poll(async () => (await readSearch(page, 'root')).contentY)
      .toBeCloseTo(-lift, 0);
    const searchRoot = rootCard.locator('[data-search-field-active]');
    const stackBox = await page.getByTestId('navigation-stack').boundingBox();
    await expect
      .poll(async () =>
        Math.abs(
          ((await searchRoot.boundingBox())?.y ?? 0) - (stackBox?.y ?? 0),
        ),
      )
      .toBeLessThan(2);
    // The bar takes none of the field's taps.
    const hit = await page.evaluate(
      ({x, y}) =>
        document
          .elementFromPoint(x, y)
          ?.closest('[data-search-field-active]') != null,
      await centerOf(field),
    );
    expect(hit).toBe(true);
  });

  test('on a pushed screen the back button fades by 1 − p / 0.35, and a cancel brings it back at once', async ({
    page,
  }) => {
    const {driver} = await openStack(page, 'search');
    await driver.tap(await rowCenter(page, 'General'));
    const top = card(page, 'screen-General');
    await waitForAnimation(top);
    await waitForRest(top);
    const content = top.locator('[data-navigation-search] + div');
    const isTouch = await isTouchPresentation(page);

    await top.getByRole('searchbox', {name: 'Search'}).click();
    const canSample = isTouch && (await resumeFramesIfStalled(page));
    if (canSample) {
      await waitForAnimation(content);
      await holdAnimations(page);
      for (const ms of [0, 40, 80, 120, 160]) {
        await seekHeld(page, ms);
        const v = await readSearch(page, 'screen-General');
        const p = activationEase(ms / ACTIVATION_MS);
        expect(
          Math.abs(v.backOpacity - barItemOpacity(p)),
          JSON.stringify({ms, p, ...v}),
        ).toBeLessThan(0.03);
      }
      await finishHeld(page);
    }
    await expect
      .poll(async () => (await readSearch(page, 'screen-General')).backOpacity)
      .toBe(0);

    // Once the activation's parts have settled (their animations retired).
    await expect
      .poll(() => content.evaluate(element => element.getAnimations().length))
      .toBe(0);
    await top.getByRole('button', {name: 'Cancel'}).click();
    if (isTouch) {
      await waitForAnimation(content);
      await holdAnimations(page);
      for (const ms of [0, 120, 240, 300, 360]) {
        await seekHeld(page, ms);
        const v = await readSearch(page, 'screen-General');
        const q = activationEase(ms / ACTIVATION_MS);
        const at = JSON.stringify({ms, q, ...v});
        expect(v.backOpacity, at).toBe(1);
        expect(Math.abs(v.largeOpacity - largeTitleReturn(q)), at).toBeLessThan(
          0.04,
        );
      }
      await finishHeld(page);
    }
    await expect
      .poll(async () => (await readSearch(page, 'screen-General')).contentY)
      .toBeCloseTo(0, 0);
    await expect(
      page.locator(
        '[data-navigation-bar="screen-General"] [data-navigation-back]',
      ),
    ).toBeVisible();
  });

  /** How far the root's field rises into the bar's row, px. */
  const liftOf = (page: Page) =>
    page.evaluate(() => {
      const stack = document
        .querySelector('[data-testid="navigation-stack"]')
        ?.getBoundingClientRect();
      const wrapper = document
        .querySelector(
          '[data-navigation-screen="root"] [data-navigation-search]',
        )
        ?.getBoundingClientRect();
      return Math.round((wrapper?.top ?? 0) - (stack?.top ?? 0));
    });

  test('a cancel mid-activation turns the bar around from where it is', async ({
    page,
  }) => {
    await openStack(page, 'search');
    const rootCard = card(page, 'root');
    test.skip(
      !(await isTouchPresentation(page)),
      'with a mouse the field takes its place at once',
    );
    const lift = await liftOf(page);
    await rootCard.getByRole('searchbox', {name: 'Search'}).click();
    test.skip(
      !(await resumeFramesIfStalled(page)),
      'no frames to sample in this engine',
    );
    await waitForAnimation(rootCard.locator('[data-navigation-search] + div'));
    // Per frame, in real time (a held animation would not move the
    // animator's own clock): Cancel 150 ms into the rise.
    const trace = await page.evaluate(async () => {
      const card = document.querySelector('[data-navigation-screen="root"]');
      const field = card?.querySelector('[data-navigation-search]');
      const content = field?.nextElementSibling as HTMLElement;
      const cancel = [...(field?.querySelectorAll('button') ?? [])].find(
        button =>
          button.textContent?.trim() === 'Cancel' ||
          button.getAttribute('aria-label') === 'Cancel',
      );
      const y = () => {
        const value = getComputedStyle(content).translate;
        return value === 'none' ? 0 : parseFloat(value.split(' ')[1] ?? '0');
      };
      const out: {t: number; y: number; cancelled: boolean}[] = [];
      const start = performance.now();
      let cancelled = false;
      await new Promise<void>(resolve => {
        const tick = () => {
          const t = performance.now() - start;
          out.push({t, y: y(), cancelled});
          if (!cancelled && t >= 150) {
            cancelled = true;
            cancel?.click();
          }
          if (t < 1000) {
            requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(tick);
      });
      return out;
    });
    const before = trace.filter(sample => !sample.cancelled);
    const after = trace.filter(sample => sample.cancelled);
    const turn = before[before.length - 1];
    const detail = JSON.stringify(
      trace.map(sample => [Math.round(sample.t), Math.round(sample.y)]),
    );
    // Partway up when the cancel lands.
    expect(turn.y, detail).toBeLessThan(-0.15 * lift);
    expect(turn.y, detail).toBeGreaterThan(-0.9 * lift);
    // No jump: no step after the cancel is larger than the rise's own
    // fastest step, and the bar doesn't run on to the top first.
    const step = Math.max(
      ...before.slice(1).map((sample, i) => Math.abs(sample.y - before[i].y)),
    );
    after.slice(0, 8).forEach((sample, i) => {
      const previous = i === 0 ? turn : after[i - 1];
      expect(Math.abs(sample.y - previous.y), detail).toBeLessThan(step + 2);
    });
    expect(Math.min(...after.map(sample => sample.y)), detail).toBeGreaterThan(
      turn.y - 2 * step - 2,
    );
    // And it comes all the way back.
    expect(after[after.length - 1].y, detail).toBeCloseTo(0, 0);
    await expect
      .poll(async () => (await readSearch(page, 'root')).largeOpacity)
      .toBeCloseTo(1, 2);
  });

  test('the bar side keeps moving while the main thread is blocked', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
    );
    await openStack(page, 'search');
    test.skip(
      !(await isTouchPresentation(page)),
      'with a mouse the field takes its place at once',
    );
    const rootCard = card(page, 'root');
    const content = rootCard.locator('[data-navigation-search] + div');
    await markElement(content);
    const cast = await startScreencast(page);
    await rootCard.getByRole('searchbox', {name: 'Search'}).click();
    const [rise] = await waitForAnimation(content, {minProgressMs: 16});
    const block = await blockMainThread(page, 600);
    await page.waitForTimeout(150);
    const frames = await cast.stop();
    const tracked = await trackMarker(page, frames);
    const proof = busyWindowProof(
      tracked,
      {from: block.from, to: Math.min(block.to, rise.to)},
      {axis: 'y', settledWithin: 2},
    );
    expect(proof.expectedFrames, JSON.stringify(proof)).toBeGreaterThan(5);
    expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
    expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
    expect(proof.longestStallMs).toBeLessThan(40);
  });

  test('under Reduce Motion the bar keeps the same travel (UIKit keeps it)', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await openStack(page, 'search');
    test.skip(
      !(await isTouchPresentation(page)),
      'with a mouse the field takes its place at once',
    );
    const rootCard = card(page, 'root');
    const lift = await liftOf(page);
    await rootCard.getByRole('searchbox', {name: 'Search'}).click();
    test.skip(
      !(await resumeFramesIfStalled(page)),
      'no frames to sample in this engine',
    );
    await waitForAnimation(rootCard.locator('[data-navigation-search] + div'));
    await holdAnimations(page);
    for (const ms of [60, 190, 300]) {
      await seekHeld(page, ms);
      const v = await readSearch(page, 'root');
      const p = activationEase(ms / ACTIVATION_MS);
      expect(
        Math.abs(v.contentY + lift * p),
        JSON.stringify({ms, p, ...v}),
      ).toBeLessThan(1.5);
    }
    await finishHeld(page);
  });

  test('outside iOS the bar takes its active place at once, as the field does', async ({
    page,
  }) => {
    // As an Android phone: a finger, and no -webkit-touch-callout.
    await openStack(page, 'search', {idiom: 'default'});
    const rootCard = card(page, 'root');
    const lift = await liftOf(page);
    await rootCard.getByRole('searchbox', {name: 'Search'}).click();
    // No motion: two frames later the bar already shows the active pose.
    await page.evaluate(
      () =>
        new Promise(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const state = await readSearch(page, 'root');
    expect(state.contentY).toBeCloseTo(-lift, 0);
    expect(state.largeY).toBeCloseTo(-lift, 0);
    expect(state.largeOpacity).toBe(0);
    expect(state.backgroundOpacity).toBe(0);
  });

  test('a field that hides when scrolling scrolls away under the bar with the content', async ({
    page,
  }) => {
    await openStack(page, 'search');
    const wrapper = card(page, 'root').locator('[data-navigation-search]');
    const top = async () => (await wrapper.boundingBox())?.y ?? NaN;
    const before = await top();
    await card(page, 'root').evaluate(element =>
      (element.firstElementChild as HTMLElement).scrollTo({top: 120}),
    );
    await expect.poll(top).toBeCloseTo(before - 120, 0);
  });
});

/**
 * Mean luminance (0–255) of a CSS-px box in each screencast frame, decoded
 * in a scratch page (like trackMarker).
 */
async function boxLuminance(
  page: Page,
  frames: Awaited<
    ReturnType<Awaited<ReturnType<typeof startScreencast>>['stop']>
  >,
  box: {x: number; y: number; width: number; height: number},
): Promise<{t: number; luminance: number}[]> {
  const scratch = await page.context().newPage();
  try {
    const out: {t: number; luminance: number}[] = [];
    for (let i = 0; i < frames.length; i += 12) {
      const batch = frames.slice(i, i + 12);
      const values = await scratch.evaluate(
        async ({items, rect}) => {
          const results: number[] = [];
          for (const item of items) {
            const blob = await (
              await fetch(`data:image/${item.format};base64,${item.data}`)
            ).blob();
            const bitmap = await createImageBitmap(blob);
            const scale = bitmap.width / item.viewportWidth;
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const context = canvas.getContext('2d');
            if (context == null) {
              throw new Error('no 2d context');
            }
            context.drawImage(bitmap, 0, 0);
            const {data} = context.getImageData(
              Math.round(rect.x * scale),
              Math.round(rect.y * scale),
              Math.max(1, Math.round(rect.width * scale)),
              Math.max(1, Math.round(rect.height * scale)),
            );
            let sum = 0;
            for (let o = 0; o < data.length; o += 4) {
              sum +=
                0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
            }
            results.push(sum / (data.length / 4));
          }
          return results;
        },
        {items: batch, rect: box},
      );
      batch.forEach((frame, k) => out.push({t: frame.t, luminance: values[k]}));
    }
    return out;
  } finally {
    await scratch.close();
  }
}

test('a back swipe carries the large titles: each rides its own screen', async ({
  page,
}) => {
  const {driver, width, left} = await openStack(page, 'large-title');
  await driver.tap(await rowCenter(page, 'General'));
  const top = card(page, 'screen-General');
  await waitForAnimation(top);
  await waitForRest(top);
  const rootTitle = page.getByRole('heading', {level: 1, name: 'Settings'});
  const topTitle = page.locator('[data-navigation-bar="screen-General"] h2');
  const read = async () => {
    const [rootBox, rootCardBox, topBox, topCardBox] = await Promise.all([
      rootTitle.boundingBox(),
      card(page, 'root').boundingBox(),
      topTitle.boundingBox(),
      top.boundingBox(),
    ]);
    return {
      root: (rootBox?.x ?? NaN) - (rootCardBox?.x ?? NaN),
      top: (topBox?.x ?? NaN) - (topCardBox?.x ?? NaN),
      p: (topCardBox?.x ?? 0) / width,
    };
  };
  const rest = await read();
  const samples: Awaited<ReturnType<typeof read>>[] = [];
  // A slow sideways drag in the content (iOS 26's back swipe), released
  // short of half so it springs back.
  await driver.play(
    drag(
      {x: left + 80, y: 420},
      {x: left + 80 + width * 0.3, y: 420},
      {durationMs: 1500, hz: 60},
    ),
    {
      onEvent: async () => {
        samples.push(await read());
      },
    },
  );
  const moving = samples.filter(sample => sample.p > 0.05);
  expect(moving.length).toBeGreaterThan(5);
  for (const sample of moving) {
    const at = JSON.stringify({sample, rest});
    // The root's large title rides the root card (its parallax), the pushed
    // screen's title rides the top card.
    expect(Math.abs(sample.root - rest.root), at).toBeLessThan(1.5);
    expect(Math.abs(sample.top - rest.top), at).toBeLessThan(1.5);
  }
  await waitForRest(top);
});

test('under Reduce Motion the bar title cross-fades in place, without the rise', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await openStack(page, 'large-title');
  const barText = page.locator('[data-navigation-bar="root"] h2 > span');
  await card(page, 'root').evaluate(element =>
    (element.firstElementChild as HTMLElement).scrollTo({top: 300}),
  );
  const samples = await sampleRects(barText, 900);
  await expect
    .poll(async () =>
      barText.evaluate(e => Number(getComputedStyle(e).opacity)),
    )
    .toBe(1);
  // Where the shown title rests (hidden, it sits 15 px lower for the rise).
  const rest = await barText.boundingBox();
  const fading = samples.filter(
    sample => sample.opacity > 0.05 && sample.opacity < 0.95,
  );
  // A fade, not a jump…
  expect(fading.length, JSON.stringify(samples)).toBeGreaterThan(2);
  // …in place: every visible frame is already at the resting position.
  for (const sample of samples.filter(item => item.opacity > 0.05)) {
    expect(
      Math.abs((sample.box?.y ?? NaN) - (rest?.y ?? NaN)),
      JSON.stringify(samples),
    ).toBeLessThan(0.5);
  }
});

test('the bar title’s handover keeps running while the main thread is blocked', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  await openStack(page, 'large-title');
  const barText = page.locator('[data-navigation-bar="root"] h2 > span');
  const box = await barText.boundingBox();
  expect(box).not.toBeNull();
  const cast = await startScreencast(page);
  await card(page, 'root').evaluate(element =>
    (element.firstElementChild as HTMLElement).scrollTo({top: 300}),
  );
  const [fade] = await waitForAnimation(barText, {minProgressMs: 16});
  const block = await blockMainThread(page, 600);
  await page.waitForTimeout(150);
  const frames = await cast.stop();
  // The title's box covers its rest place and the 15 px it rises from.
  const region = {
    x: box?.x ?? 0,
    y: (box?.y ?? 0) - 2,
    width: box?.width ?? 0,
    height: (box?.height ?? 0) + 19,
  };
  const series = await boxLuminance(page, frames, region);
  // Frames keep coming while blocked, and the title keeps changing (fading
  // in and rising) on them until it is nearly at rest.
  const end = Math.min(block.to, fade.from + 350);
  const during = series.filter(item => item.t >= block.from && item.t <= end);
  const expected = Math.floor((end - block.from) / 16.7);
  expect(expected).toBeGreaterThan(5);
  expect(during.length, JSON.stringify(during)).toBeGreaterThanOrEqual(
    expected - 2,
  );
  let changed = 0;
  for (let i = 1; i < during.length; i += 1) {
    if (Math.abs(during[i].luminance - during[i - 1].luminance) > 0.05) {
      changed += 1;
    }
  }
  expect(changed, JSON.stringify(during)).toBeGreaterThanOrEqual(
    during.length - 4,
  );
});

test('storyboard: a push', {tag: '@storyboard'}, async ({page}, testInfo) => {
  const {driver, width} = await openStack(page, 'settings');
  await driver.tap(await rowCenter(page, 'General'));
  const top = card(page, 'screen-General');
  await waitForAnimation(top);
  const viewport = page.viewportSize() ?? {width: 402, height: 714};
  const {storyboard} = await animationStoryboard(page, {
    name: 'navigationstack-push',
    clip: {x: 0, y: 0, width: viewport.width, height: viewport.height},
    // The spring is at rest by ~0.45 s; the animator holds end states after.
    times: Array.from({length: 28}, (_, i) => i * 16.667),
    measure: async () => ({
      top: await translateX(top),
      under: await translateX(card(page, 'root')),
    }),
    columns: 8,
    cellScale: 0.35,
  });
  await releaseAnimations(page, {finish: true});
  await storyboard.write(testInfo);
  const frames = storyboard.frames.map(
    f => f.data as {top: number; under: number},
  );
  expect(frames.length).toBeGreaterThan(5);
  expect(frames[0].top).toBeCloseTo(width, 0);
  expect(
    frames.every((f, i) => i === 0 || f.top <= frames[i - 1].top + 0.5),
    JSON.stringify(frames.map(f => Math.round(f.top))),
  ).toBe(true);
  expect(frames.at(-1)?.top ?? Infinity).toBeLessThan(1);
});

test(
  'storyboard: a back swipe released past half',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, width, left, topTitle} = await openStack(page, 'pushed', {
      standalone: true,
    });
    const top = card(page, 'screen-About');
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const storyboard = await touchStoryboard(
      page,
      driver,
      drag(
        {x: left + 4, y: 400},
        {x: left + width * 0.65, y: 400},
        {
          durationMs: 300,
          hz: 30,
          restMs: 120,
        },
      ),
      {
        name: 'navigationstack-edge-pop',
        clip: {x: 0, y: 0, width: viewport.width, height: viewport.height},
        measure: async () => ({top: await translateX(top)}),
        columns: 6,
        cellScale: 0.4,
      },
    );
    await storyboard.write(testInfo);
    await expect.poll(topTitle).toBe('General');
    const frames = storyboard.frames.map(f => f.data as {top: number});
    expect(Math.max(...frames.map(f => f.top))).toBeGreaterThan(width * 0.5);
  },
);
