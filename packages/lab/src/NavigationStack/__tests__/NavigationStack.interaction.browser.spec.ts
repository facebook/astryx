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

import {
  expect,
  test,
  type Browser,
  type Locator,
  type Page,
} from '@playwright/test';
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
 * A page under a real mouse: no touch and no mobile viewport, so script and
 * CSS both read a fine pointer. (The phone project's own page stays coarse
 * for CSS whatever script is told.) Close its context when done.
 */
async function newFinePage(browser: Browser) {
  const context = await browser.newContext({
    hasTouch: false,
    isMobile: false,
    viewport: {width: 402, height: 714},
  });
  return {context, page: await context.newPage()};
}

/**
 * Opens a story. `standalone` makes the page a home-screen web app
 * (`navigator.standalone`), where no browser back swipe owns the screen
 * edge, so the stack's own edge swipe runs. `pointer: 'mouse'` needs a page
 * from `newFinePage`, and fails before any check if the page reads coarse.
 */
async function openStack(
  page: Page,
  story:
    | 'settings'
    | 'pushed'
    | 'carousel'
    | 'declines-pops'
    | 'large-title'
    | 'search'
    | 'search-keeps-active',
  {
    standalone = false,
    pointer = 'touch',
  }: {standalone?: boolean; pointer?: 'touch' | 'mouse'} = {},
) {
  // One touch model (AST-094): touch behaviour keys on a coarse primary
  // pointer, on every engine. Under a finger, script reads coarse whatever
  // the engine emulates (the input is the emulated finger); under a mouse
  // the page itself is fine (newFinePage).
  if (pointer === 'touch') {
    await page.addInitScript(() => {
      const matchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query: string) =>
        query.replace(/\s/g, '') === '(pointer:coarse)'
          ? matchMedia('(min-width: 0px)')
          : matchMedia(query);
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
  if (pointer === 'mouse') {
    expect(
      await page.evaluate(
        () =>
          matchMedia('(pointer: fine)').matches &&
          !matchMedia('(pointer: coarse)').matches,
      ),
      'a page under a mouse reads a fine pointer (newFinePage)',
    ).toBe(true);
  }
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

/** One frame of `traceBars`: each screen's card and bar x, the back button. */
interface BarFrame {
  t: number;
  cards: Record<string, number>;
  bars: Record<string, number>;
  /** Effective opacity (own times every ancestor's) of the back button. */
  back: {platter: number; chevron: number} | null;
  /** Whether an animation drives a card or a bar in this frame. */
  animating: boolean;
}

/**
 * Starts sampling, every frame, each card's and bar's x relative to the
 * stack and the back button's effective opacities; the returned function
 * stops and returns them. A layer's x is its computed `translate` (the
 * cards and bars sit at the stack's leading edge, checked when the trace
 * starts), so a frame reads no layout. Under load, in a frame that comes a
 * few milliseconds late, WebKit evaluates two layers that animate on one
 * clock about a millisecond apart (boxes and translates alike): `animating`
 * says which frames an animation drives.
 */
async function traceBars(page: Page): Promise<() => Promise<BarFrame[]>> {
  await page.evaluate(() => {
    const w = window as unknown as {__bars: unknown[]; __barsStop: boolean};
    w.__bars = [];
    w.__barsStop = false;
    const stack = document.querySelector('[data-testid="navigation-stack"]');
    const effective = (element: Element) => {
      let opacity = 1;
      for (
        let node: Element | null = element;
        node != null && node !== document.documentElement;
        node = node.parentElement
      ) {
        opacity *= Number(getComputedStyle(node).opacity);
      }
      return opacity;
    };
    const translateX = (element: Element) => {
      const value = getComputedStyle(element).translate;
      return value === 'none' ? 0 : parseFloat(value);
    };
    const read = (selector: string, attribute: string) => {
      const out: Record<string, number> = {};
      for (const element of document.querySelectorAll<HTMLElement>(selector)) {
        const key = element.getAttribute(attribute);
        if (key != null) {
          out[key] = translateX(element);
        }
      }
      return out;
    };
    // A layer at rest sits at the stack's edge: its box is its translate.
    const left = stack?.getBoundingClientRect().left ?? 0;
    for (const element of document.querySelectorAll(
      '[data-navigation-screen], [data-navigation-bar]',
    )) {
      if (element.getAnimations().length > 0) {
        continue;
      }
      const offset =
        element.getBoundingClientRect().left - left - translateX(element);
      if (Math.abs(offset) > 0.5) {
        throw new Error(`a layer sits ${offset} px from the stack's edge`);
      }
    }
    const t0 = performance.now();
    const tick = () => {
      const button = document.querySelector('[data-navigation-back]');
      const chevron = button?.firstElementChild ?? null;
      w.__bars.push({
        t: performance.now() - t0,
        cards: read('[data-navigation-screen]', 'data-navigation-screen'),
        bars: read('[data-navigation-bar]', 'data-navigation-bar'),
        back:
          button == null || chevron == null
            ? null
            : {platter: effective(button), chevron: effective(chevron)},
        animating: [
          ...document.querySelectorAll(
            '[data-navigation-screen], [data-navigation-bar]',
          ),
        ].some(element =>
          element.getAnimations().some(a => a.playState === 'running'),
        ),
      });
      if (!w.__barsStop) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
  return async () =>
    page.evaluate(() => {
      const w = window as unknown as {__bars: unknown[]; __barsStop: boolean};
      w.__barsStop = true;
      return w.__bars;
    }) as Promise<BarFrame[]>;
}

/** The first frame at which `key`'s card has left where it started. */
const firstMove = (frames: BarFrame[], key: string) => {
  const start = frames.find(f => f.cards[key] != null)?.cards[key];
  return frames.find(
    f => f.cards[key] != null && Math.abs(f.cards[key] - (start ?? 0)) > 0.5,
  );
};

/**
 * The time (ms) at which the screens' push or pop spring (critically damped,
 * 0.3 s, starting at navigation.pushVelocity widths/s) reaches `progress`:
 * the screens' own clock, read from where a card is, so a check keyed to it
 * holds however late an engine shows the first frame.
 */
const screensClock = (progress: number) => {
  const omega = (2 * Math.PI) / 0.3;
  const at = (s: number) =>
    1 - (1 + (omega - 8.773) * s) * Math.exp(-omega * s);
  let lo = 0;
  let hi = 2;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid) < progress) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return ((lo + hi) / 2) * 1000;
};

/** Critically damped from rest: progress of a spring of `response` s. */
const crit = (response: number, ms: number) => {
  if (ms <= 0) {
    return 0;
  }
  const u = ((2 * Math.PI) / response) * (ms / 1000);
  return 1 - (1 + u) * Math.exp(-u);
};

/** The incoming card's, the covered bar's and its cut box's x and boxes. */
interface CutLayers {
  card: number;
  bar: number;
  cut: number;
  cardBox: {left: number; right: number};
  cutBox: {left: number; right: number};
}

const cutLayers = (page: Page, covered: string, incoming: string) =>
  page.evaluate(
    ([coveredKey, incomingKey]): CutLayers | null => {
      const x = (element: Element) => {
        const value = getComputedStyle(element).translate;
        return value === 'none' ? 0 : parseFloat(value);
      };
      const cardElement = document.querySelector(
        `[data-navigation-screen="${incomingKey}"]`,
      );
      const barElement = document.querySelector(
        `[data-navigation-bar="${coveredKey}"]`,
      );
      const cutElement = barElement?.firstElementChild;
      if (cardElement == null || barElement == null || cutElement == null) {
        return null;
      }
      const cardBox = cardElement.getBoundingClientRect();
      const cutBox = cutElement.getBoundingClientRect();
      return {
        card: x(cardElement),
        bar: x(barElement),
        cut: x(cutElement),
        cardBox: {left: cardBox.left, right: cardBox.right},
        cutBox: {left: cutBox.left, right: cutBox.right},
      };
    },
    [covered, incoming] as const,
  );

/**
 * How far the covered bar's cut is from the incoming card's leading edge at
 * `mid`, from the layers' animated `translate`, with each edge's static part
 * read at `rest`, when box and translate agree. Mid-animation WebKit can hand
 * back one layer's box a frame behind its animation and not the other's (in
 * a burst of animation frames), so the boxes alone can disagree by a pixel
 * or two while the layers move as one on the compositor.
 */
const cutGap = (
  mid: CutLayers | null,
  rest: CutLayers | null,
  direction: 'ltr' | 'rtl',
): number => {
  if (mid == null || rest == null) {
    return Infinity;
  }
  const cardEdge = direction === 'rtl' ? 'right' : 'left';
  const cutEdge = direction === 'rtl' ? 'left' : 'right';
  const cardStatic = rest.cardBox[cardEdge] - rest.card;
  const cutStatic = rest.cutBox[cutEdge] - rest.bar - rest.cut;
  return Math.abs(cutStatic + mid.bar + mid.cut - (cardStatic + mid.card));
};

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

test('a push’s bar: the new bar slides in with its screen, the covered one rides its parallax, the chevron fades in a beat later', async ({
  page,
}) => {
  const {driver, width} = await openStack(page, 'settings');
  const stop = await traceBars(page);
  await driver.tap(await rowCenter(page, 'General'));
  await page.waitForTimeout(900);
  const frames = await stop();
  const start = firstMove(frames, 'screen-General');
  expect(start).toBeDefined();
  const during = frames.filter(
    f => f.t >= (start?.t ?? 0) && f.cards['screen-General'] > 0.5,
  );
  expect(during.length).toBeGreaterThan(5);
  for (const f of during) {
    // UIKit's bar copy is part of its screen: it moves with the card (one
    // clock and spring; within 1 % of the width, as engines sample rects).
    expect(
      Math.abs(f.bars['screen-General'] - f.cards['screen-General']),
      JSON.stringify(f),
    ).toBeLessThan(width * 0.01);
    expect(
      Math.abs(f.bars.root - f.cards.root),
      JSON.stringify(f),
    ).toBeLessThan(width * 0.01);
    // The glass platter is there from the first frame.
    expect(f.back?.platter ?? 0, JSON.stringify(f)).toBeGreaterThan(0.99);
  }
  // The chevron (springs.navigationBackButton 0.4 s) starts 60 ms after the
  // screens start moving (navigation.backChevronPushDelayMs), on their
  // clock: read it from where the pushed card is.
  for (const f of during) {
    const ms = screensClock(1 - f.cards['screen-General'] / width);
    const expected = crit(0.4, ms - 60);
    expect(
      Math.abs((f.back?.chevron ?? 0) - expected),
      JSON.stringify({ms: Math.round(ms), ...f.back, expected}),
    ).toBeLessThan(0.1);
  }
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

  // The edge pan is attached to the whole stack, an element reaching beyond
  // the edge band, so an in-band touch decides at FR19's 10 px
  // (`spec:AST-094` FR18, DEC-22); once it has begun, the card is the
  // finger's travel past that point: 1:1.
  const tracking = travel.filter(t => t.card > 1 && t.finger < width * 0.6);
  expect(tracking.length).toBeGreaterThan(5);
  for (const t of tracking) {
    expect(Math.abs(t.card - (t.finger - 10))).toBeLessThan(2);
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

test('brought back past its start, the screen follows with resistance, then springs back as UIKit’s does', async ({
  page,
}) => {
  // UIKit lab batch 62 (iOS 26.2): a back swipe scrubbed out and brought back
  // past its start at ~310 pt/s, lifted 10.7 pt of finger after the screen
  // crossed its start. UIKit's screen stood at −6.89 pt at the lift, reached
  // −14.21 pt 50 ms later, was within 0.5 pt of rest ~0.23 s after the lift
  // and never went past it.
  const {driver, width, left} = await openStack(page, 'pushed', {
    standalone: true,
  });
  const top = card(page, 'screen-About');
  const start = {x: left + 4, y: 400};
  const far = left + width * 0.4;
  const sampler = async () =>
    page.evaluate(() => {
      const w = window as unknown as {
        __samples: {t: number; x: number}[];
        __liftAt: number | null;
        __atLift: number | null;
      };
      w.__samples = [];
      w.__liftAt = null;
      w.__atLift = null;
      const element = document.querySelector<HTMLElement>(
        '[data-navigation-screen="screen-About"]',
      );
      const read = () => {
        const x = parseFloat(
          element == null ? '' : getComputedStyle(element).translate,
        );
        return Number.isFinite(x) ? x : 0;
      };
      // At the lift, before the stack sees it: where the last move put it.
      for (const type of ['touchend', 'pointerup']) {
        addEventListener(
          type,
          () => {
            if (w.__liftAt == null) {
              w.__liftAt = performance.now();
              w.__atLift = read();
            }
          },
          {capture: true},
        );
      }
      const tick = () => {
        w.__samples.push({t: performance.now(), x: read()});
        if (w.__samples.length < 600) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    });
  const samples = async () =>
    page.evaluate(() => {
      const w = window as unknown as {
        __samples: {t: number; x: number}[];
        __liftAt: number | null;
        __atLift: number | null;
      };
      return {xs: w.__samples, liftAt: w.__liftAt, atLift: w.__atLift};
    });
  // The drag out, without its lift.
  const out = (to: number, durationMs: number) => {
    const frames = [...drag(start, {x: to, y: 400}, {durationMs})];
    frames.pop();
    return frames;
  };

  // Where the screen's start is in finger coordinates: the swipe begins
  // after its threshold, so the screen sits that far behind the finger.
  // A slow swipe to a quarter, held still, then lifted (it springs back).
  await sampler();
  const near = left + width * 0.25;
  const hold = out(near, 900);
  const held = hold[hold.length - 1];
  for (let i = 1; i <= 8; i++) {
    hold.push({t: held.t + i * 16.7, fingers: [{id: 0, x: near, y: 400}]});
  }
  hold.push({t: held.t + 8 * 16.7 + 4, fingers: []});
  await driver.play(hold);
  await waitForRest(top);
  const calibration = await samples();
  const offset =
    near - Math.max(...calibration.xs.map(sample => sample.x)) - start.x;

  // Batch 62's path: back past the start at ~310 px/s, lifted 10.7 px of
  // finger after the screen crossed it.
  await sampler();
  const frames = out(far, 450);
  const last = frames[frames.length - 1];
  const from = last.fingers[0].x;
  const liftX = start.x + offset - 10.7;
  const steps = Math.ceil((from - liftX) / 5.2);
  for (let i = 1; i <= steps; i++) {
    frames.push({
      t: last.t + i * 16.7,
      fingers: [{id: 0, x: Math.max(liftX, from - i * 5.2), y: 400}],
    });
  }
  frames.push({t: last.t + steps * 16.7 + 4, fingers: []});
  await driver.play(frames);
  await waitForRest(top);
  const {xs, liftAt, atLift} = await samples();
  const after = xs.filter(sample => sample.t > (liftAt ?? Infinity));
  const peak = after.reduce(
    (low, sample) => (sample.x < low.x ? sample : low),
    {t: 0, x: Infinity},
  );
  const settledAt = after.find(
    (sample, i) =>
      sample.t > peak.t && after.slice(i).every(rest => Math.abs(rest.x) < 0.5),
  )?.t;
  const detail = JSON.stringify({
    offset,
    atLift,
    peak: {x: peak.x, ms: peak.t - (liftAt ?? 0)},
    settledMs: settledAt == null ? null : settledAt - (liftAt ?? 0),
    after: after.slice(0, 24).map(sample => Math.round(sample.x * 10) / 10),
  });
  // Within ~1 pt of UIKit's at the lift and at the peak; settled as soon.
  expect(atLift ?? 0, detail).toBeGreaterThan(-6.89 - 1);
  expect(atLift ?? 0, detail).toBeLessThan(-6.89 + 1);
  expect(peak.x, detail).toBeGreaterThan(-14.21 - 1);
  expect(peak.x, detail).toBeLessThan(-14.21 + 1);
  expect(peak.t - (liftAt ?? 0), detail).toBeGreaterThan(20);
  expect(peak.t - (liftAt ?? 0), detail).toBeLessThan(85);
  // UIKit's: within 0.5 pt of rest ~0.25 s after the lift, never past it.
  expect((settledAt ?? Infinity) - (liftAt ?? 0), detail).toBeLessThan(340);
  expect(Math.max(...after.map(sample => sample.x)), detail).toBeLessThan(0.5);
  expect(Math.abs(await translateX(top))).toBeLessThan(0.5);
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
  // The harness verdict judges per presented frame against the measured
  // cadence (a stall, the frames that moved, a window with nothing to
  // judge); no absolute frame interval or count is asserted here.
  expect(proof.verdict.failures, proof.summary).toEqual([]);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.changed).toBeGreaterThanOrEqual(proof.frames - 3);
});

// With a mouse the bars are opaque: the incoming one covers the old title.
// Under a finger iOS 26's bars are clear (NavigationStackScrollEdge's proofs)
// and the incoming screen cuts the old title instead (the next test).
test('with a mouse, the incoming bar covers the old title while the main thread is blocked', async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {context, page} = await newFinePage(browser);
  try {
    await openStack(page, 'settings', {pointer: 'mouse'});
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    // A marker at the trailing end of the root's title: the pushed screen's
    // opaque bar slides over it on the compositor.
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
    const row = await rowCenter(page, 'General');
    await page.mouse.click(row.x, row.y);
    await waitForAnimation(card(page, 'screen-General'), {minProgressMs: 16});
    const block = await blockMainThread(page, 900);
    await page.waitForTimeout(150);
    const frames = await cast.stop();
    const tracked = await trackMarker(page, frames);
    const trace = JSON.stringify(
      tracked.map(f => [Math.round(f.t - block.from), f.box?.x ?? null]),
    );
    const during = tracked.filter(f => f.t > block.from && f.t < block.to - 20);
    // Seen while blocked, then covered before the block ends.
    expect(
      during.some(f => f.box != null),
      trace,
    ).toBe(true);
    expect(during.at(-1)?.box ?? null, trace).toBeNull();
  } finally {
    await context.close();
  }
});

/**
 * How much of bar `key` its clip box shows inside the stack, as a fraction of
 * the stack's width (0: cut away, 1: whole), rounded to 0.01.
 */
async function readCut(page: Page, key: string) {
  return page.evaluate(k => {
    const stack = document
      .querySelector('[data-testid="navigation-stack"]')
      ?.getBoundingClientRect();
    const box = document
      .querySelector(`[data-navigation-bar="${k}"]`)
      ?.firstElementChild?.getBoundingClientRect();
    if (stack == null || box == null) {
      return {shown: -1};
    }
    const shown =
      Math.max(
        0,
        Math.min(box.right, stack.right) - Math.max(box.left, stack.left),
      ) / stack.width;
    return {shown: Math.round(shown * 100) / 100};
  }, key);
}

// Under a finger iOS 26's bars are clear: the bar a card covers is cut at
// that card's leading edge instead, so the incoming screen still hides the
// title it slides over, also while the main thread is blocked.
test('under a finger, the incoming screen cuts the old title while the main thread is blocked', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright (WebKit: the iOS simulator rig)',
  );
  const {driver} = await openStack(page, 'settings');
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(true);
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
  await waitForAnimation(card(page, 'screen-General'), {minProgressMs: 16});
  const block = await blockMainThread(page, 900);
  await page.waitForTimeout(150);
  const frames = await cast.stop();
  const tracked = await trackMarker(page, frames);
  const trace = JSON.stringify(
    tracked.map(f => [Math.round(f.t - block.from), f.box?.x ?? null]),
  );
  const during = tracked.filter(f => f.t > block.from && f.t < block.to - 20);
  // Seen while blocked, then cut before the block ends.
  expect(
    during.some(f => f.box != null),
    trace,
  ).toBe(true);
  expect(during.at(-1)?.box ?? null, trace).toBeNull();
});

test('under a finger the cut rides the incoming card’s leading edge', async ({
  page,
}) => {
  const {driver} = await openStack(page, 'settings');
  await driver.tap(await rowCenter(page, 'General'));
  await waitForAnimation(card(page, 'screen-General'), {minProgressMs: 16});
  // Mid-push the root's bar shows only left of the incoming card: the cut
  // and the card's edge move on one spring.
  const mid = await cutLayers(page, 'root', 'screen-General');
  await waitForRest(card(page, 'screen-General'));
  const rest = await cutLayers(page, 'root', 'screen-General');
  expect(mid).not.toBeNull();
  expect(rest).not.toBeNull();
  expect(cutGap(mid, rest, 'ltr')).toBeLessThan(2);
  expect(await readCut(page, 'root')).toEqual({shown: 0});
  expect(await readCut(page, 'screen-General')).toEqual({shown: 1});
});

test('under a finger in a right-to-left stack, the cut mirrors', async ({
  page,
}) => {
  const {driver} = await openStack(page, 'settings');
  await page
    .getByTestId('navigation-stack')
    .evaluate(element => element.setAttribute('dir', 'rtl'));
  await driver.tap(await rowCenter(page, 'General'));
  await waitForAnimation(card(page, 'screen-General'), {minProgressMs: 16});
  // The incoming card enters from the left: the root's bar shows only right
  // of its trailing edge.
  const mid = await cutLayers(page, 'root', 'screen-General');
  await waitForRest(card(page, 'screen-General'));
  const rest = await cutLayers(page, 'root', 'screen-General');
  expect(mid).not.toBeNull();
  expect(rest).not.toBeNull();
  expect(cutGap(mid, rest, 'rtl')).toBeLessThan(2);
  expect(await readCut(page, 'root')).toEqual({shown: 0});
  expect(await readCut(page, 'screen-General')).toEqual({shown: 1});
});

test('a pointer that turns fine after a push leaves the revealed bar whole', async ({
  page,
}) => {
  // A tablet that picks up a trackpad: the push runs under a finger (the
  // root's bar cut away), then the pointer is fine and Back pops at once.
  const {driver} = await openStack(page, 'settings');
  await driver.tap(await rowCenter(page, 'General'));
  await waitForRest(card(page, 'screen-General'));
  expect(await readCut(page, 'root')).toEqual({shown: 0});
  await page.evaluate(() => {
    const matchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query: string) =>
      query.replace(/\s/g, '') === '(pointer:coarse)'
        ? matchMedia('(max-width: 0px)')
        : matchMedia(query);
  });
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
  await page.locator('[data-navigation-back]').click();
  await expect(card(page, 'screen-General')).toHaveCount(0);
  await waitForRest(card(page, 'root'));
  expect(await readCut(page, 'root')).toEqual({shown: 1});
});

test('under a finger, Back reveals the covered bar whole', async ({page}) => {
  const {driver} = await openStack(page, 'settings');
  await driver.tap(await rowCenter(page, 'General'));
  await waitForRest(card(page, 'screen-General'));
  expect(await readCut(page, 'root')).toEqual({shown: 0});
  const back = await page.locator('[data-navigation-back]').boundingBox();
  if (back == null) {
    throw new Error('no back button');
  }
  await driver.tap({x: back.x + back.width / 2, y: back.y + back.height / 2});
  await expect(card(page, 'screen-General')).toHaveCount(0);
  await waitForRest(card(page, 'root'));
  expect(await readCut(page, 'root')).toEqual({shown: 1});
});

test('under a mouse the back swipes stay off: Back is the bar’s button', async ({
  browser,
}) => {
  // A fine pointer: touch work costs nothing and nothing swipes, even in a
  // home-screen app.
  const {context, page} = await newFinePage(browser);
  try {
    const {left, width} = await openStack(page, 'pushed', {
      standalone: true,
      pointer: 'mouse',
    });
    const top = card(page, 'screen-About');
    const before = await top.boundingBox();
    // A mouse drag from the edge, then one across the content.
    for (const [from, to] of [
      [left + 4, left + width * 0.7],
      [left + width * 0.3, left + width * 0.95],
    ]) {
      await page.mouse.move(from, 400);
      await page.mouse.down();
      await page.mouse.move(to, 400, {steps: 30});
      await page.mouse.up();
    }
    await page.waitForTimeout(400);
    expect((await top.boundingBox())?.x).toBeCloseTo(before?.x ?? NaN, 0);
    await page.locator('[data-navigation-back]').last().click();
    await expect(top).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test('a finger swipes back on an engine that is not iOS WebKit (one touch model)', async ({
  page,
}) => {
  const {driver, left, width} = await openStack(page, 'pushed');
  // Neither Playwright engine implements -webkit-touch-callout (iOS WebKit
  // only): the swipe does not depend on it.
  expect(
    await page.evaluate(() => CSS.supports('-webkit-touch-callout', 'none')),
  ).toBe(false);
  await driver.play(
    drag(
      {x: left + width * 0.3, y: 420},
      {x: left + width * 0.9, y: 420},
      {durationMs: 300},
    ),
  );
  await expect(card(page, 'screen-About')).toHaveCount(0);
});

test.describe('the bars ride with their screens, as UIKit’s', () => {
  test('a programmatic pop rides the revealed bar in from its parallax and the leaving one out', async ({
    page,
  }) => {
    const {driver, width} = await openStack(page, 'settings');
    await driver.tap(await rowCenter(page, 'General'));
    await waitForRest(card(page, 'screen-General'));
    const stop = await traceBars(page);
    await page.locator('[data-navigation-back]').click();
    await page.waitForTimeout(900);
    const frames = await stop();
    const moving = frames.filter(
      f =>
        f.cards['screen-General'] != null &&
        f.cards['screen-General'] > 0.5 &&
        f.cards.root < -0.5,
    );
    expect(moving.length).toBeGreaterThan(5);
    for (const f of moving) {
      expect(
        Math.abs(f.bars['screen-General'] - f.cards['screen-General']),
        JSON.stringify(f),
      ).toBeLessThan(width * 0.01);
      expect(
        Math.abs(f.bars.root - f.cards.root),
        JSON.stringify(f),
      ).toBeLessThan(width * 0.01);
      // The chevron fades out at once on the 0.4 s spring, on the screens'
      // clock; the platter stays until the screen has left.
      const ms = screensClock(f.cards['screen-General'] / width);
      expect(f.back?.platter ?? 0, JSON.stringify(f)).toBeGreaterThan(0.99);
      expect(
        Math.abs((f.back?.chevron ?? 0) - (1 - crit(0.4, ms))),
        JSON.stringify({ms: Math.round(ms), ...f.back}),
      ).toBeLessThan(0.1);
    }
    expect(frames.at(-1)?.back ?? null).toBeNull();
  });

  test('a back swipe holds the revealed bar still while the top one follows the finger', async ({
    page,
  }) => {
    const {driver, width, left} = await openStack(page, 'pushed');
    const stop = await traceBars(page);
    await driver.play(
      drag(
        {x: left + width * 0.3, y: 420},
        {x: left + width * 0.7, y: 420},
        {durationMs: 1000, restMs: 300},
      ),
    );
    await page.waitForTimeout(1200);
    const frames = await stop();
    const swiping = frames.filter(f => (f.cards['screen-About'] ?? 0) > 0.5);
    expect(swiping.filter(f => !f.animating).length).toBeGreaterThan(10);
    for (const f of swiping) {
      // Within a pixel while the finger drives both layers; through the
      // release's spring back, the other bar proofs' 1 % of the width (in
      // a late frame WebKit evaluates two layers on one clock about a
      // millisecond apart).
      expect(
        Math.abs(f.bars['screen-About'] - f.cards['screen-About']),
        JSON.stringify(f),
      ).toBeLessThan(f.animating ? width * 0.01 : 1);
      // UIKit's revealed title stays centred while its screen slides in.
      expect(
        Math.abs(f.bars['screen-General']),
        JSON.stringify(f),
      ).toBeLessThan(0.5);
      // The back button does not follow a finger: full opacity throughout.
      expect(f.back?.chevron ?? 0, JSON.stringify(f)).toBeGreaterThan(0.99);
    }
  });

  test('with a mouse, each bar is opaque and stacks over the one it covers', async ({
    browser,
  }) => {
    const {context, page} = await newFinePage(browser);
    try {
      await openStack(page, 'settings', {pointer: 'mouse'});
      expect(
        await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
      ).toBe(false);
      const row = await rowCenter(page, 'General');
      await page.mouse.click(row.x, row.y);
      await waitForRest(card(page, 'screen-General'));
      const bars = await page.evaluate(() =>
        [...document.querySelectorAll('[data-navigation-bar]')].map(bar => ({
          key: bar.getAttribute('data-navigation-bar'),
          // Each layer paints its opaque background on its own element (the
          // search hand-off fades it).
          background: getComputedStyle(
            bar.querySelector('[data-navigation-bar-background]') ?? bar,
          ).backgroundColor,
        })),
      );
      expect(bars.map(bar => bar.key)).toEqual(['root', 'screen-General']);
      for (const bar of bars) {
        // An rgb() colour has no alpha; rgba(…, 0) would let the title show.
        expect(bar.background, JSON.stringify(bar)).toMatch(/^rgb\(/);
      }
    } finally {
      await context.close();
    }
  });

  test('under a finger each bar is clear, and the covered one cut away at rest', async ({
    page,
  }) => {
    const {driver} = await openStack(page, 'settings');
    await driver.tap(await rowCenter(page, 'General'));
    await waitForRest(card(page, 'screen-General'));
    const bars = await page.evaluate(() =>
      [...document.querySelectorAll('[data-navigation-bar-background]')].map(
        background => getComputedStyle(background).backgroundColor,
      ),
    );
    expect(bars).toEqual(['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)']);
    // iOS 26: the covered screen's bar is cut at the top card's leading
    // edge (here at rest, so nothing of it shows); the top bar is whole.
    expect(await readCut(page, 'root')).toEqual({shown: 0});
    expect(await readCut(page, 'screen-General')).toEqual({shown: 1});
  });
});

test.describe('edge cases (review findings)', () => {
  test('a keyboard Back returns focus to the row that pushed', async ({
    browser,
  }) => {
    const {context, page} = await newFinePage(browser);
    try {
      await openStack(page, 'settings', {pointer: 'mouse'});
      const general = page.getByRole('button', {name: 'General'}).first();
      await general.focus();
      await page.keyboard.press('Enter');
      await waitForRest(card(page, 'screen-General'));
      await page.locator('[data-navigation-back]').focus();
      await page.keyboard.press('Enter');
      await expect(card(page, 'screen-General')).toHaveCount(0);
      await waitForRest(card(page, 'root'));
      // Focus is on the General row itself, not left on the page body.
      await expect
        .poll(async () =>
          page.evaluate(() => {
            const active = document.activeElement;
            return active == null || active === document.body
              ? 'body'
              : (active
                  .closest('li, button, [role="button"]')
                  ?.textContent?.trim() ?? active.tagName);
          }),
        )
        .toBe('General');
    } finally {
      await context.close();
    }
  });

  test('after a keyboard push the focused title shows the focus indicator', async ({
    browser,
  }) => {
    const {context, page} = await newFinePage(browser);
    try {
      await openStack(page, 'settings', {pointer: 'mouse'});
      await page.getByRole('button', {name: 'General'}).first().focus();
      await page.keyboard.press('Enter');
      await waitForRest(card(page, 'screen-General'));
      const title = page.locator('[data-navigation-bar="screen-General"] h2');
      await expect(title).toBeFocused();
      const ring = await title.evaluate(element => {
        const style = getComputedStyle(element);
        return {
          visible: element.matches(':focus-visible'),
          outline: style.outlineStyle,
          width: parseFloat(style.outlineWidth),
          shadow: style.boxShadow,
        };
      });
      expect(ring.visible).toBe(true);
      // An outline or a ring shadow: something shows where focus is.
      expect(
        (ring.outline !== 'none' && ring.width > 0) || ring.shadow !== 'none',
        JSON.stringify(ring),
      ).toBe(true);
    } finally {
      await context.close();
    }
  });

  test('after a tap push the focused title shows no focus ring', async ({
    page,
  }) => {
    const {driver} = await openStack(page, 'settings');
    await driver.tap(await rowCenter(page, 'General'));
    await waitForRest(card(page, 'screen-General'));
    const title = page.locator('[data-navigation-bar="screen-General"] h2');
    await expect(title).toBeFocused();
    // Programmatic focus after pointer input keeps the pointer's modality
    // (interaction-modality INV1): no ring.
    expect(
      await title.evaluate(element => element.matches(':focus-visible')),
    ).toBe(false);
  });

  test('after a pop the screen underneath keeps its content and its bar', async ({
    page,
  }) => {
    const {driver} = await openStack(page, 'pushed');
    await page.locator('[data-navigation-back]').click();
    await waitForRest(card(page, 'screen-General'));
    await expect(card(page, 'screen-About')).toHaveCount(0);
    // General is on top; the root lies under it, ready for a back swipe.
    const root = await card(page, 'root').evaluate(
      element => getComputedStyle(element).contentVisibility,
    );
    expect(root).not.toBe('hidden');
    await expect(page.locator('[data-navigation-bar="root"]')).toHaveCount(1);
    void driver;
  });

  test('a push during a running push slides the new screen in', async ({
    page,
  }) => {
    const {driver, width} = await openStack(page, 'settings');
    await driver.tap(await rowCenter(page, 'General'));
    await page.waitForTimeout(80);
    const stop = await traceBars(page);
    const about = await page
      .locator('[data-navigation-screen="screen-General"]')
      .getByRole('button', {name: 'About'})
      .boundingBox();
    if (about == null) {
      throw new Error('no About row');
    }
    await driver.tap({
      x: about.x + about.width / 2,
      y: about.y + about.height / 2,
    });
    await page.waitForTimeout(700);
    const frames = await stop();
    const first = frames.find(f => f.cards['screen-About'] != null);
    // A lone push starts the card off screen: so does one that interrupts.
    expect(
      first?.cards['screen-About'] ?? 0,
      JSON.stringify(first),
    ).toBeGreaterThan(width * 0.5);
    // Under a finger both end at rest: the screen below is cut away (the
    // root's bar is no longer rendered) and the top bar is whole.
    await waitForRest(card(page, 'screen-About'));
    expect(await page.locator('[data-navigation-bar="root"]').count()).toBe(0);
    expect(await readCut(page, 'screen-General')).toEqual({shown: 0});
    expect(await readCut(page, 'screen-About')).toEqual({shown: 1});
  });

  test('a sideways drag on a strip that can still scroll scrolls it instead of popping', async ({
    page,
    browserName,
  }) => {
    const {driver} = await openStack(page, 'carousel');
    const strip = page.getByTestId('carousel');
    await strip.evaluate(element => {
      element.scrollLeft = 300;
    });
    const box = await strip.boundingBox();
    if (box == null) {
      throw new Error('no strip');
    }
    await driver.play(
      drag(
        {x: box.x + 40, y: box.y + box.height / 2},
        {x: box.x + 200, y: box.y + box.height / 2},
        {durationMs: 400, restMs: 100},
      ),
    );
    await page.waitForTimeout(800);
    // Desktop WebKit does not scroll for an emulated touch drag; Chromium
    // does, so there the strip's own scroll shows too.
    if (browserName === 'chromium') {
      expect(await strip.evaluate(element => element.scrollLeft)).toBeLessThan(
        250,
      );
    }
    await expect(card(page, 'screen-General')).toHaveCount(1);
    expect(await translateX(card(page, 'screen-General'))).toBe(0);
  });

  test('a released swipe the app declines springs back', async ({page}) => {
    const {driver, width, left} = await openStack(page, 'declines-pops');
    await driver.play(
      drag(
        {x: left + width * 0.2, y: 420},
        {x: left + width * 0.8, y: 420},
        {durationMs: 300},
      ),
    );
    await page.waitForTimeout(900);
    await expect(card(page, 'screen-General')).toHaveCount(1);
    expect(
      Math.abs(await translateX(card(page, 'screen-General'))),
    ).toBeLessThan(0.5);
  });

  test('a screen contains overscroll only while it overflows', async ({
    page,
  }) => {
    await openStack(page, 'settings');
    // The screen's scroller (under the overlaid bar) is the card's child.
    const contain = async () =>
      card(page, 'root').evaluate(
        element =>
          getComputedStyle(element.firstElementChild ?? element)
            .overscrollBehaviorY,
      );
    // Four rows in a full-height stack: nothing to scroll, so a scroll
    // chains to the page as usual.
    expect(await contain()).toBe('auto');
    await page.setViewportSize({width: 400, height: 200});
    await expect.poll(contain).toBe('contain');
  });
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
  // The story's own first motion leaves its layers promoted for the
  // animator's linger (half a second after it ends). Demoting one is a style
  // pass and a Layout of its own: the root bar title's landed about 400 ms
  // into a push started at once, at the window's edge. Start the push once
  // none is left.
  await expect
    .poll(() =>
      page.evaluate(
        () => document.querySelectorAll('[style*="will-change"]').length,
      ),
    )
    .toBe(0);
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

/** The press layer's presented opacity on a list row (its ::before). */
const rowHighlight = async (page: Page, name: string) =>
  page
    .getByRole('button', {name})
    .first()
    .evaluate(control => {
      const row = control.closest('[data-astryx-pressable="cell"]');
      if (row == null) {
        return -1;
      }
      // At rest a row paints no press layer (no generated box), so nothing
      // is highlighted; the layer exists only while pressed, fading or held.
      const layer = getComputedStyle(row, '::before');
      return layer.content === 'none' ? 0 : Number(layer.opacity);
    });

test.describe('the row that pushed', () => {
  test('stays selected under the pushed screen, then deselects linearly over the pop’s first 350 ms', async ({
    page,
  }) => {
    const {driver} = await openStack(page, 'settings');
    await driver.tap(await rowCenter(page, 'General'));
    const top = card(page, 'screen-General');
    await waitForAnimation(top);
    await waitForRest(top);
    const held = await rowHighlight(page, 'General');
    expect(held).toBeGreaterThan(0);

    await page.locator('[data-navigation-back]').last().click();
    await waitForAnimation(top);
    await holdAnimations(page);
    const at = async (ms: number) => {
      await page.evaluate(t => {
        const list =
          (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ??
          [];
        for (const animation of list) {
          const end = Number(
            animation.effect?.getComputedTiming().endTime ?? Infinity,
          );
          animation.currentTime = Math.min(t, end - 0.5);
        }
      }, ms);
      return rowHighlight(page, 'General');
    };
    // UIKit's in-transition deselect: linear over 0.35 s from the pop's
    // start, on the same clock as the cards.
    for (const ms of [0, 87.5, 175, 262.5]) {
      expect(Math.abs((await at(ms)) - held * (1 - ms / 350))).toBeLessThan(
        0.03 * held + 0.01,
      );
    }
    await releaseAnimations(page, {finish: true});
  });

  test('a cancelled back swipe selects the row again', async ({page}) => {
    const {driver, width, left} = await openStack(page, 'settings', {
      standalone: true,
    });
    await driver.tap(await rowCenter(page, 'General'));
    const top = card(page, 'screen-General');
    await waitForAnimation(top);
    await waitForRest(top);
    const held = await rowHighlight(page, 'General');
    let lowest = held;
    // A slow approach to 32 % of the width: p + 0.35·v̄ stays short of half,
    // so the pop cancels and the cards spring back.
    await driver.play(
      drag(
        {x: left + 4, y: 400},
        {x: left + width * 0.32, y: 400},
        {durationMs: 2000, hz: 60},
      ),
      {
        onEvent: async () => {
          lowest = Math.min(lowest, await rowHighlight(page, 'General'));
        },
      },
    );
    await waitForRest(top);
    // The swipe scrubbed the row toward deselected; the cancel brings it back
    // to selected, and the row is still held under the screen.
    expect(lowest).toBeLessThan(held * 0.85);
    expect(Math.abs(await translateX(top))).toBeLessThan(0.5);
    await expect.poll(() => rowHighlight(page, 'General')).toBeCloseTo(held, 2);
    expect(
      await page
        .getByRole('button', {name: 'General'})
        .first()
        .evaluate(control =>
          control
            .closest('[data-astryx-pressable="cell"]')
            ?.getAttribute('data-astryx-press'),
        ),
    ).toBe('held');
  });

  test('a finished back swipe deselects the row on the cards’ spring, from the swipe’s velocity', async ({
    page,
  }) => {
    const {driver, width, left} = await openStack(page, 'settings', {
      standalone: true,
    });
    await driver.tap(await rowCenter(page, 'General'));
    const top = card(page, 'screen-General');
    await waitForAnimation(top);
    await waitForRest(top);
    const held = await rowHighlight(page, 'General');
    // A quick drag to 45 %: the release finishes the pop at the finger's
    // speed.
    await driver.play(
      drag(
        {x: left + 4, y: 400},
        {x: left + width * 0.45, y: 400},
        {durationMs: 180, hz: 60},
      ),
    );
    await waitForAnimation(top);
    await holdAnimations(page);
    // Row and cards ride one spring: the highlight stays at
    // held · (1 − progress) while the pop finishes.
    for (const ms of [0, 40, 80, 140, 220]) {
      await page.evaluate(t => {
        const list =
          (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ??
          [];
        for (const animation of list) {
          const end = Number(
            animation.effect?.getComputedTiming().endTime ?? Infinity,
          );
          animation.currentTime = Math.min(t, end - 0.5);
        }
      }, ms);
      const progress = (await translateX(top)) / width;
      const highlight = await rowHighlight(page, 'General');
      expect(
        Math.abs(highlight - held * (1 - progress)),
        JSON.stringify({ms, progress, highlight, held}),
      ).toBeLessThan(0.05 * held + 0.01);
    }
    await releaseAnimations(page, {finish: true});
    await expect(top).toHaveCount(0);
    await expect.poll(() => rowHighlight(page, 'General')).toBe(0);
  });

  test('under Reduce Motion the row fades out in the animator’s 200 ms cross-fade, without a jump', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver} = await openStack(page, 'settings');
    await driver.tap(await rowCenter(page, 'General'));
    const top = card(page, 'screen-General');
    await waitForAnimation(top);
    await waitForRest(top);
    const held = await rowHighlight(page, 'General');
    expect(held).toBeGreaterThan(0);
    await page.locator('[data-navigation-back]').last().click();
    await waitForAnimation(top);
    await holdAnimations(page);
    // Reduced Motion is the animator's (design:reduced-motion DR2): under a
    // finger the deselect is an opacity fade of 200 ms, with no jump.
    const samples: number[] = [];
    for (const ms of [0, 50, 100, 150, 199]) {
      await page.evaluate(t => {
        const list =
          (window as unknown as {__harnessHeld?: Animation[]}).__harnessHeld ??
          [];
        for (const animation of list) {
          const end = Number(
            animation.effect?.getComputedTiming().endTime ?? Infinity,
          );
          animation.currentTime = Math.min(t, end - 0.5);
        }
      }, ms);
      samples.push(await rowHighlight(page, 'General'));
    }
    const at = JSON.stringify({held, samples});
    expect(samples[0], at).toBeGreaterThan(held * 0.9);
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i], at).toBeLessThanOrEqual(samples[i - 1] + 0.01);
      // A fade, not a cut: no 50 ms step takes most of the highlight.
      expect(samples[i - 1] - samples[i], at).toBeLessThan(held * 0.7);
    }
    expect(samples.at(-1) ?? NaN, at).toBeLessThan(held * 0.1 + 0.01);
    await releaseAnimations(page, {finish: true});
  });

  test('a back swipe scrubs the deselect with its progress', async ({page}) => {
    const {driver, width, left} = await openStack(page, 'settings', {
      standalone: true,
    });
    await driver.tap(await rowCenter(page, 'General'));
    const top = card(page, 'screen-General');
    await waitForAnimation(top);
    await waitForRest(top);
    const held = await rowHighlight(page, 'General');
    const pairs: {p: number; highlight: number}[] = [];
    await driver.play(
      drag(
        {x: left + 4, y: 400},
        {x: left + width * 0.4, y: 400},
        {
          durationMs: 2000,
        },
      ),
      {
        onEvent: async () => {
          const p = (await translateX(top)) / width;
          if (p > 0.05 && p < 0.35) {
            pairs.push({p, highlight: await rowHighlight(page, 'General')});
          }
        },
      },
    );
    expect(pairs.length).toBeGreaterThan(5);
    for (const pair of pairs) {
      expect(Math.abs(pair.highlight - held * (1 - pair.p))).toBeLessThan(
        0.05 * held + 0.01,
      );
    }
  });
});

test.describe('with Reduce Motion', () => {
  test('a push never dims the covered screen', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {driver} = await openStack(page, 'settings');
    const dimmed = await page.evaluate(() => {
      const w = window as unknown as {__dim: number[]; __dimStop: boolean};
      w.__dim = [];
      w.__dimStop = false;
      const dim = document.querySelector(
        '[data-navigation-screen="root"]',
      )?.lastElementChild;
      const tick = () => {
        if (dim != null) {
          w.__dim.push(Number(getComputedStyle(dim).opacity));
        }
        if (!w.__dimStop) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
      return dim != null;
    });
    expect(dimmed).toBe(true);
    await driver.tap(await rowCenter(page, 'General'));
    await page.waitForTimeout(800);
    const samples = await page.evaluate(() => {
      const w = window as unknown as {__dim: number[]; __dimStop: boolean};
      w.__dimStop = true;
      return w.__dim;
    });
    expect(samples.length).toBeGreaterThan(10);
    // UIKit's cross-fade has no dimming: the 10 % shade belongs to the slide.
    expect(Math.max(...samples), JSON.stringify(samples)).toBeLessThan(0.01);
  });

  test('under a mouse a push completes at once', async ({browser}) => {
    const {context, page} = await newFinePage(browser);
    try {
      await page.emulateMedia({reducedMotion: 'reduce'});
      await openStack(page, 'settings', {pointer: 'mouse'});
      await page.getByRole('button', {name: 'General'}).first().click();
      const top = card(page, 'screen-General');
      await expect(top).toHaveCount(1);
      // design:reduced-motion DR3: a fine pointer changes at once.
      const first = await top.evaluate(
        element =>
          new Promise<{x: string; opacity: number}>(resolve =>
            requestAnimationFrame(() =>
              resolve({
                x: getComputedStyle(element).translate,
                opacity: Number(getComputedStyle(element).opacity),
              }),
            ),
          ),
      );
      expect(first.x === 'none' || parseFloat(first.x) === 0).toBe(true);
      expect(first.opacity).toBe(1);
    } finally {
      await context.close();
    }
  });

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
  const barText = page.locator('[data-navigation-bar="root"] h2');
  await expect(
    page.getByRole('heading', {level: 1, name: 'Settings'}),
  ).toBeVisible();
  // The title's offset inside its bar, which the rise moves.
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
  await expect(barText).not.toHaveAttribute('aria-hidden');

  await rootCard.evaluate(element =>
    (element.firstElementChild as HTMLElement).scrollTo({top: 0}),
  );
  await expect
    .poll(async () => (await read()).opacity, {timeout: 3000})
    .toBe(0);
  await expect(barText).toHaveAttribute('aria-hidden', 'true');
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
      // The stack's one back button (its control wraps the button).
      backOpacity: opacity(
        document.querySelector('[data-navigation-back]')?.parentElement,
      ),
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

  /** Activates General's search, then leaves it mid-search (About, Done). */
  async function leaveGeneralMidSearch(page: Page, driver: TouchDriver) {
    await driver.tap(await rowCenter(page, 'General'));
    await waitForRest(card(page, 'screen-General'));
    await card(page, 'screen-General')
      .getByRole('searchbox', {name: 'Search'})
      .click();
    await expect
      .poll(async () => (await readSearch(page, 'screen-General')).contentY)
      .toBeLessThan(-40);
    await driver.tap(await rowCenter(page, 'About'));
    await waitForRest(card(page, 'screen-About'));
    await driver.tap(await rowCenter(page, 'Done'));
    await expect(card(page, 'screen-General')).toHaveCount(0);
    // The pop to the root has run: the root is uncovered and at rest.
    await expect(card(page, 'screen-About')).toHaveCount(0);
    await waitForRest(card(page, 'root'));
  }

  test('a screen left mid-search and pushed again starts at rest, with its back button', async ({
    page,
  }) => {
    const {driver} = await openStack(page, 'search');
    await leaveGeneralMidSearch(page, driver);
    // The app ended that search as the screen left: pushed again, it is at
    // rest, its back button and bar showing.
    await driver.tap(await rowCenter(page, 'General'));
    await waitForRest(card(page, 'screen-General'));
    const v = await readSearch(page, 'screen-General');
    expect(Math.abs(v.contentY), JSON.stringify(v)).toBeLessThan(0.5);
    expect(Math.abs(v.largeY), JSON.stringify(v)).toBeLessThan(0.5);
    // The bar's background is back (a stale search record kept it cleared).
    await expect
      .poll(
        async () =>
          (await readSearch(page, 'screen-General')).backgroundOpacity,
      )
      .toBeGreaterThan(0.99);
    await expect
      .poll(() =>
        page
          .locator('[data-navigation-back]')
          .evaluate(e =>
            Number(getComputedStyle(e.parentElement ?? e).opacity),
          ),
      )
      .toBeGreaterThan(0.99);
  });

  test('on a pushed screen nothing in the bar covers the active field, and the covered bar is back after Cancel', async ({
    page,
  }) => {
    const {driver} = await openStack(page, 'search');
    await driver.tap(await rowCenter(page, 'General'));
    const top = card(page, 'screen-General');
    await waitForRest(top);
    await top.getByRole('searchbox', {name: 'Search'}).click();
    const field = top.locator('[data-search-field-active]');
    const stackBox = await page.getByTestId('navigation-stack').boundingBox();
    await expect
      .poll(async () =>
        Math.abs(((await field.boundingBox())?.y ?? 0) - (stackBox?.y ?? 0)),
      )
      .toBeLessThan(2);
    await waitForRest(top.locator('[data-navigation-search] + div'));
    // No other bar layer over the field's row shows: the covered screen's
    // bar is parked at the parallax, right over the row the field rose into.
    const covering = await page.evaluate(() => {
      const box = document
        .querySelector(
          '[data-navigation-screen="screen-General"] [data-search-field-active]',
        )
        ?.getBoundingClientRect();
      if (box == null) {
        return ['no field'];
      }
      return [...document.querySelectorAll('[data-navigation-bar]')]
        .filter(bar => {
          const r = bar.getBoundingClientRect();
          return (
            bar.getAttribute('data-navigation-bar') !== 'screen-General' &&
            r.right > box.left &&
            r.left < box.right &&
            r.bottom > box.top &&
            r.top < box.bottom &&
            Number(getComputedStyle(bar).opacity) > 0.01
          );
        })
        .map(bar => bar.getAttribute('data-navigation-bar'));
    });
    expect(covering).toEqual([]);
    // After Cancel the covered bar shows again (a pop reveals it).
    await top.getByRole('button', {name: 'Cancel'}).click();
    await expect
      .poll(() =>
        page
          .locator('[data-navigation-bar="root"]')
          .evaluate(element => Number(getComputedStyle(element).opacity)),
      )
      .toBe(1);
  });

  test('no back swipe while the top screen is searching', async ({page}) => {
    const {driver, left, width} = await openStack(page, 'search');
    await driver.tap(await rowCenter(page, 'General'));
    await waitForRest(card(page, 'screen-General'));
    await card(page, 'screen-General')
      .getByRole('searchbox', {name: 'Search'})
      .click();
    await expect
      .poll(async () => (await readSearch(page, 'screen-General')).contentY)
      .toBeLessThan(-40);
    const before = await card(page, 'screen-General').boundingBox();
    await driver.play(
      drag(
        {x: left + width * 0.3, y: 520},
        {x: left + width * 0.95, y: 520},
        {durationMs: 300},
      ),
    );
    await page.waitForTimeout(500);
    // The bar is the field's (its back button is gone): nothing pops.
    await expect(card(page, 'screen-General')).toHaveCount(1);
    expect((await card(page, 'screen-General').boundingBox())?.x).toBeCloseTo(
      before?.x ?? NaN,
      0,
    );
  });

  test('a screen pushed again still searching gets the bar at once', async ({
    page,
  }) => {
    const {driver} = await openStack(page, 'search-keeps-active');
    await leaveGeneralMidSearch(page, driver);
    // This app keeps General's search: pushed again, its large title and
    // content are already lifted with the field into the bar.
    await driver.tap(await rowCenter(page, 'General'));
    await waitForRest(card(page, 'screen-General'));
    const field = card(page, 'screen-General').locator(
      '[data-search-field-active]',
    );
    const stackBox = await page.getByTestId('navigation-stack').boundingBox();
    await expect
      .poll(async () =>
        Math.abs(((await field.boundingBox())?.y ?? 0) - (stackBox?.y ?? 0)),
      )
      .toBeLessThan(2);
    const v = await readSearch(page, 'screen-General');
    expect(v.contentY, JSON.stringify(v)).toBeLessThan(-40);
    expect(v.largeOpacity, JSON.stringify(v)).toBeLessThan(0.05);
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
    await expect(page.locator('[data-navigation-back]')).toBeVisible();
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
    const field = rootCard.getByRole('searchbox', {name: 'Search'});
    // One activation and cancel on this page first: WebKit stops presenting
    // frames for about half a second when a page's first composited
    // animation starts, which would swallow the measured rise.
    await field.click();
    await page.waitForTimeout(600);
    await rootCard.getByRole('button', {name: 'Cancel'}).click();
    await expect
      .poll(async () => (await readSearch(page, 'root')).contentY)
      .toBeCloseTo(0, 0);
    await field.click();
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
    // No jump: no move after the cancel is faster than the rise's own
    // fastest (per ms, so a long frame is no jump).
    const rate = (a: {t: number; y: number}, b: {t: number; y: number}) =>
      Math.abs(b.y - a.y) / Math.max(1, b.t - a.t);
    const fastest = Math.max(
      ...before.slice(1).map((sample, i) => rate(before[i], sample)),
    );
    after.slice(0, 8).forEach((sample, i) => {
      const previous = i === 0 ? turn : after[i - 1];
      expect(rate(previous, sample), detail).toBeLessThan(
        fastest * 1.15 + 0.05,
      );
    });
    // The turn is added to the curve on screen (as the field's is): the bar
    // keeps its velocity, carries on a little as it slows, and turns back
    // well short of the top.
    expect(Math.min(...after.map(sample => sample.y)), detail).toBeGreaterThan(
      -0.85 * lift,
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

  test('under Reduce Motion the hand-off is the animator’s: no travel, in place within 200 ms', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await openStack(page, 'search');
    const rootCard = card(page, 'root');
    const lift = await liftOf(page);
    await rootCard.getByRole('searchbox', {name: 'Search'}).click();
    // design:reduced-motion DR1/DR2: under a finger nothing travels; the
    // change completes within the 200 ms cross-fade.
    await page.waitForTimeout(260);
    const state = await readSearch(page, 'root');
    expect(state.contentY, JSON.stringify(state)).toBeCloseTo(-lift, 0);
    expect(state.largeOpacity, JSON.stringify(state)).toBeLessThan(0.02);
    expect(state.backgroundOpacity, JSON.stringify(state)).toBeLessThan(0.02);
  });

  test('under a mouse the bar takes its active place at once, as the field does', async ({
    browser,
  }) => {
    const {context, page} = await newFinePage(browser);
    try {
      // A fine pointer: the hand-off is touch behaviour.
      await openStack(page, 'search', {pointer: 'mouse'});
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
    } finally {
      await context.close();
    }
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
  const barText = page.locator('[data-navigation-bar="root"] h2');
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

/** The bar title's opacity, every frame for `ms`. */
async function sampleTitleOpacity(page: Page, bar: string, ms: number) {
  return page.evaluate(
    ({bar, ms}) =>
      new Promise<number[]>(resolve => {
        const samples: number[] = [];
        const start = performance.now();
        const tick = () => {
          const title = document.querySelector(
            `[data-navigation-bar="${bar}"] h2`,
          );
          samples.push(
            title == null ? NaN : Number(getComputedStyle(title).opacity),
          );
          if (performance.now() - start < ms) {
            requestAnimationFrame(tick);
          } else {
            resolve(samples);
          }
        };
        requestAnimationFrame(tick);
      }),
    {bar, ms},
  );
}

test('popping back to a large title two levels down shows it without the bar title', async ({
  page,
}) => {
  const {driver} = await openStack(page, 'large-title');
  await driver.tap(await rowCenter(page, 'General'));
  await waitForRest(card(page, 'screen-General'));
  await driver.tap(await rowCenter(page, 'About'));
  await waitForRest(card(page, 'screen-About'));
  // The root is two levels down now (not rendered); Done returns to it.
  await driver.tap(await rowCenter(page, 'Done'));
  const samples = await sampleTitleOpacity(page, 'root', 500);
  // Its large title never scrolled: the bar's title stays hidden throughout.
  expect(Math.max(...samples), JSON.stringify(samples)).toBeLessThan(0.05);
});

test('a large-title screen pushed again starts with its large title, not the bar’s', async ({
  page,
}) => {
  const {driver} = await openStack(page, 'large-title');
  await driver.tap(await rowCenter(page, 'Display'));
  await waitForRest(card(page, 'screen-Display'));
  await card(page, 'screen-Display').evaluate(element =>
    (element.firstElementChild as HTMLElement).scrollTo({top: 300}),
  );
  await expect
    .poll(() =>
      page
        .locator('[data-navigation-bar="screen-Display"] h2')
        .evaluate(e => Number(getComputedStyle(e).opacity)),
    )
    .toBe(1);
  await page.locator('[data-navigation-back]').last().click();
  await expect(card(page, 'screen-Display')).toHaveCount(0);

  // Mounted again, the card starts at the top with its large title showing.
  await driver.tap(await rowCenter(page, 'Display'));
  const samples = await sampleTitleOpacity(page, 'screen-Display', 400);
  expect(Math.max(...samples), JSON.stringify(samples)).toBeLessThan(0.05);
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
  const barText = page.locator('[data-navigation-bar="root"] h2');
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
  // Counted at the screencast's own cadence, the median interval between the
  // frames it delivered here (never faster than 60 Hz): a loaded runner's
  // cast delivers fewer frames than the display presents. A frozen title
  // delivers none, and fails the floor below.
  const gaps = during
    .slice(1)
    .map((item, i) => item.t - during[i].t)
    .sort((a, b) => a - b);
  const cadence = Math.max(16.7, gaps[Math.floor(gaps.length / 2)] ?? Infinity);
  const expected = Math.floor((end - block.from) / cadence);
  expect(expected, JSON.stringify(during)).toBeGreaterThan(5);
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
