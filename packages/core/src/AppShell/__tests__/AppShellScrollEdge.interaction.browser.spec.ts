// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AppShellScrollEdge.interaction.browser.spec.ts
 * @input The built "Touch bar over content" AppShell story (height
 *   "auto", touch phone profile), programmatic and real-touch scrolling,
 *   and the interaction harness
 * @output Interaction and animation proofs for the iOS 26 scroll edge effect
 *   under AppShell's pinned header, under a finger: a scroll the program
 *   drives switches it at once (off while the content sits 10px or less
 *   under the bar, on beyond, both ways); a finger dragging the page fades it
 *   in and back out; for a finger's scroll the fade follows UIKit's measured
 *   appear and disappear springs when seeked, keeps playing through a
 *   blocked main thread, does no Layout or Paint, is a cross-fade of at most
 *   200 ms under Reduce Motion, and turns around from where it is when the
 *   content comes back mid-fade; Reduce Transparency makes it an opaque
 *   band; the layer is hidden from assistive technology; a mouse keeps
 *   today's opaque bar; a storyboard of the fade in and out
 * @position Browser proof for AppShell.tsx's touch bar and
 *   motion/useScrollEdgeEffect.ts, run by `pnpm test:interaction`; jsdom
 *   scrolls nothing and runs no animations. Touch is one model on every
 *   touch device, so the phone profile here (a coarse pointer) is the touch
 *   case in both engines. A finger's scroll is a synthetic finger resting
 *   on the content while the page scrolls (the shared gesture host reads it
 *   as the finger's), or a real-touch drag in Chromium. WebKit here is
 *   desktop WebKit under Playwright; iOS Safari is the simulator run.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  compareCurve,
  countBetween,
  drag,
  frames,
  holdAnimations,
  openStory,
  releaseAnimations,
  sampleCurve,
  springStep,
  startScreencast,
  timeline,
  touchDriver,
  traceRendering,
  waitForAnimation,
  waitForRest,
  withStorybook,
  type CastFrame,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

const STORY = 'core-appshell--touch-bar-over-content';
/** `bars.scrollEdgeEffect.appear` and `.disappear`, as response and damping. */
const APPEAR = {response: 0.2, dampingFraction: 1};
const DISAPPEAR = {response: 0.35, dampingFraction: 1};
/** Far enough that the tiles fill the space under the header. */
const UNDER = 120;

interface Shell {
  layer: Locator;
  header: Locator;
  /**
   * The shell's top edge on the page, px. Storybook pads every story, so the
   * header pins (and content starts passing under it) only once the page
   * has scrolled this far.
   */
  top: number;
}

async function openShell(page: Page): Promise<Shell> {
  await openStory(page, storybook(), STORY);
  const header = page.getByRole('banner');
  const layer = header.locator(':scope > [aria-hidden="true"]');
  await expect(layer).toBeAttached();
  expect(
    await page.evaluate(() =>
      document
        .querySelector('[data-scroll-owner]')
        ?.getAttribute('data-scroll-owner'),
    ),
  ).toBe('document');
  const top = await page.evaluate(() => {
    const shell = document.querySelector('[data-scroll-owner]');
    return (shell?.getBoundingClientRect().top ?? 0) + window.scrollY;
  });
  return {layer, header, top};
}

async function scrollToY(page: Page, y: number): Promise<number> {
  return page.evaluate(top => {
    window.scrollTo(0, top);
    return window.scrollY;
  }, y);
}

/**
 * Scrolls the page while a finger rests on the content, then lifts it two
 * frames later (after the observer has reported): the shared gesture host
 * reads the scroll as the finger's, so the effect fades.
 */
async function fingerScrollToY(page: Page, y: number): Promise<number> {
  return page.evaluate(top => {
    const target = document.querySelector('[role="main"]') ?? document.body;
    const touch = {identifier: 7, clientX: 100, clientY: 400, target};
    const fire = (type: string, touches: (typeof touch)[]) => {
      const event = new Event(type, {bubbles: true, cancelable: true});
      Object.defineProperty(event, 'changedTouches', {value: [touch]});
      Object.defineProperty(event, 'touches', {value: touches});
      target.dispatchEvent(event);
    };
    fire('touchstart', [touch]);
    window.scrollTo(0, top);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => fire('touchend', [])),
    );
    return window.scrollY;
  }, y);
}

async function presentedOpacity(layer: Locator): Promise<number> {
  return layer.evaluate(element => Number(getComputedStyle(element).opacity));
}

/** Scrolls, lets the observer report, and waits for the fade to finish. */
async function settleAt(page: Page, layer: Locator, y: number) {
  const scrollY = await scrollToY(page, y);
  await frames(page, 3);
  await waitForRest(layer);
  return {scrollY, opacity: await presentedOpacity(layer)};
}

test('a scroll the program drives switches the effect at once: off through 10px, on beyond, both ways', async ({
  page,
}) => {
  const {layer, top} = await openShell(page);
  // Content under the pinned bar, px → the effect's opacity at rest.
  const steps: [number, number][] = [
    [-top, 0],
    [5, 0],
    [10, 0],
    [11, 1],
    [40, 1],
    [10, 0],
    [-top, 0],
  ];
  const seen: {under: number; scrollY: number; opacity: number}[] = [];
  for (const [under, expected] of steps) {
    const reading = await settleAt(page, layer, top + under);
    seen.push({under, ...reading});
    expect(reading.opacity, `${under}px under the bar`).toBe(expected);
    // At once: the WebKit workaround (no fade starts on the program's
    // scroll; on iOS 26.2 one would blank the bar's items).
    expect(
      await layer.evaluate(element => element.getAnimations().length),
    ).toBe(0);
  }
  // A script scrolls the page in whole px here, so 10 → 11 brackets UIKit's
  // switch (off at 10.0, on from 10.25); the sentinel's edge rule puts it at
  // exactly 10 (AppShellScrollEdge.test.tsx and useScrollEdgeEffect.ts).
  test.info().annotations.push({
    type: 'switch',
    description: JSON.stringify(seen),
  });
});

test('a finger dragging the page under the bar fades the effect in, and back out', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'native scrolling from injected touches is Chromium-only (harness README)',
  );
  const {layer} = await openShell(page);
  const driver = await touchDriver(page);
  const readings: {phase: string; scrollY: number; opacity: number}[] = [];
  const read = async (phase: string) => {
    readings.push({
      phase,
      scrollY: await page.evaluate(() => window.scrollY),
      opacity: await presentedOpacity(layer),
    });
  };
  // Up 60px, resting before the lift (no fling).
  await driver.play(
    drag({x: 200, y: 520}, {x: 200, y: 460}, {durationMs: 300, restMs: 450}),
    {
      onEvent: async step => {
        if (step.type === 'touchEnd') {
          await read('finger resting, about to lift');
        }
      },
    },
  );
  await waitForRest(layer);
  await read('after the lift');
  // Back down past the rest offset.
  await driver.play(
    drag({x: 200, y: 300}, {x: 200, y: 420}, {durationMs: 300, restMs: 600}),
  );
  await waitForRest(layer);
  await read('back at rest');
  test.info().annotations.push({
    type: 'drag',
    description: JSON.stringify(readings),
  });
  expect(readings[0].scrollY).toBeGreaterThan(10);
  // The finger is still down: the fade ran during the drag (0.294 s spring,
  // 450 ms of rest), so it is all but complete.
  expect(readings[0].opacity).toBeGreaterThan(0.95);
  expect(readings[1].opacity).toBe(1);
  expect(readings[2].scrollY).toBeLessThanOrEqual(10);
  expect(readings[2].opacity).toBe(0);
});

test('a finger’s scroll fades on UIKit’s measured appear and disappear springs', async ({
  page,
}) => {
  const {layer, top} = await openShell(page);
  const compareFade = async (
    to: number,
    oracle: (t: number) => number,
    lengthMs: number,
  ) => {
    await fingerScrollToY(page, to);
    await waitForAnimation(layer);
    await holdAnimations(page, layer);
    const samples = await sampleCurve(layer, timeline(lengthMs, 1000 / 120));
    // Resume rather than jump to the end: the animator's own clock keeps
    // running while the harness holds the animation, so the next fade must
    // start after this one has really ended.
    await releaseAnimations(page);
    await waitForRest(layer);
    await page.waitForTimeout(lengthMs);
    return compareCurve(
      samples.map(s => ({t: s.t, value: s.opacity})),
      oracle,
      // Keyframes sampled within 0.05 px-equivalent; opacity rounds to 1/255
      // in the computed style of some engines.
      0.006,
    );
  };
  const appear = await compareFade(
    top + UNDER,
    t => springStep(APPEAR, t),
    300,
  );
  const disappear = await compareFade(
    0,
    t => 1 - springStep(DISAPPEAR, t),
    520,
  );
  test.info().annotations.push({
    type: 'curves',
    description: JSON.stringify({
      appear: {max: appear.maxError, rms: appear.rmsError},
      disappear: {max: disappear.maxError, rms: disappear.rmsError},
    }),
  });
  expect(appear.pass, `appear worst ${JSON.stringify(appear.worst)}`).toBe(
    true,
  );
  expect(
    disappear.pass,
    `disappear worst ${JSON.stringify(disappear.worst)}`,
  ).toBe(true);
});

/**
 * One pixel per frame: the colour at `point` (CSS px) of each screencast
 * frame, decoded in a scratch page so Node needs no image decoder.
 */
async function pixelPerFrame(
  page: Page,
  cast: ReadonlyArray<CastFrame>,
  point: {x: number; y: number},
): Promise<{t: number; rgb: [number, number, number]}[]> {
  const scratch = await page.context().newPage();
  try {
    const out: {t: number; rgb: [number, number, number]}[] = [];
    for (let i = 0; i < cast.length; i += 12) {
      const batch = cast.slice(i, i + 12);
      const values = await scratch.evaluate(
        async ({items, at}) => {
          const result: [number, number, number][] = [];
          for (const item of items) {
            const blob = await (
              await fetch(`data:image/${item.format};base64,${item.data}`)
            ).blob();
            const bitmap = await createImageBitmap(blob);
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const context = canvas.getContext('2d');
            if (context == null) {
              throw new Error('no 2d context');
            }
            context.drawImage(bitmap, 0, 0);
            const scale = bitmap.width / item.viewportWidth;
            const [r, g, b] = context.getImageData(
              Math.round(at.x * scale),
              Math.round(at.y * scale),
              1,
              1,
            ).data;
            result.push([r, g, b]);
          }
          return result;
        },
        {items: batch, at: point},
      );
      values.forEach((rgb, j) => out.push({t: batch[j].t, rgb}));
    }
    return out;
  } finally {
    await scratch.close();
  }
}

test('the fade keeps playing through a blocked main thread', async ({page}) => {
  const {layer, top} = await openShell(page);
  // A point over the first tile, high in the header where the veil is
  // strong: the fade shows there as the tile washing towards the bar colour.
  const point = {x: 100, y: 12};
  const cast = await startScreencast(page);
  await fingerScrollToY(page, top + UNDER);
  const [fade] = await waitForAnimation(layer);
  const busy = await blockMainThread(page, 220);
  await page.waitForTimeout(400);
  const pixels = await pixelPerFrame(page, await cast.stop(), point);
  const during = pixels.filter(p => p.t > busy.from && p.t < busy.to);
  const distinct = new Set(during.map(p => p.rgb.join(','))).size;
  test.info().annotations.push({
    type: 'busy window',
    description: JSON.stringify({
      fade,
      busy,
      framesDuringBlock: during.length,
      distinctColoursDuringBlock: distinct,
      during: during.map(p => ({t: Math.round(p.t - busy.from), rgb: p.rgb})),
    }),
  });
  // A main-thread fade would present nothing new while the thread is held.
  expect(during.length).toBeGreaterThanOrEqual(4);
  expect(distinct).toBeGreaterThanOrEqual(4);
  // Monotonic: the tile only ever washes towards the veil (its red channel,
  // low on the blue tile, rises).
  const reds = during.map(p => p.rgb[0]);
  expect(reds.every((r, i) => i === 0 || r >= reds[i - 1] - 1)).toBe(true);
});

test('no Layout or Paint runs while the effect fades', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'tracing is a Chromium protocol');
  const {layer, top} = await openShell(page);
  let started = 0;
  const trace = await traceRendering(page, async () => {
    await fingerScrollToY(page, top + UNDER);
    const [fade] = await waitForAnimation(layer);
    started = fade.from;
    await page.waitForTimeout(400);
  });
  // The steady middle of the 0.294 s fade: its first frame may commit.
  const counts = countBetween(trace, started + 50, started + 250);
  test.info().annotations.push({
    type: 'rendering',
    description: JSON.stringify(counts),
  });
  expect(counts.Layout ?? 0).toBe(0);
  expect(counts.Paint ?? 0).toBe(0);
});

// design:reduced-motion DR2: under Reduce Motion a coarse pointer's
// cross-fade is opacity only and at most 200 ms.
test('Reduce Motion fades the effect in at most 200 ms', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {layer, top} = await openShell(page);
  await fingerScrollToY(page, top + UNDER);
  await waitForAnimation(layer);
  await holdAnimations(page, layer);
  const samples = await sampleCurve(layer, [50, 100, 200]);
  await releaseAnimations(page, {finish: true});
  const at = (t: number) =>
    samples.find(sample => sample.t === t)?.opacity ?? Number.NaN;
  // A fade, not a jump: partway at 50 ms…
  expect(at(50)).toBeGreaterThan(0.05);
  expect(at(50)).toBeLessThan(0.95);
  // …and done by 200 ms (UIKit's own 0.294 s spring is not).
  expect(at(200)).toBeGreaterThan(0.99);
  expect(springStep(APPEAR, 200)).toBeLessThan(0.99);
});

test('Reduce Transparency makes the effect an opaque band ending at the bar', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'prefers-reduced-transparency is emulated through the Chromium protocol',
  );
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setEmulatedMedia', {
    features: [{name: 'prefers-reduced-transparency', value: 'reduce'}],
  });
  const {layer, header, top} = await openShell(page);
  await settleAt(page, layer, top + UNDER);
  const geometry = await layer.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      mask: style.maskImage,
      opacity: style.opacity,
      height: element.getBoundingClientRect().height,
    };
  });
  const headerHeight = await header.evaluate(
    element => element.getBoundingClientRect().height,
  );
  expect(geometry.mask).toBe('none');
  expect(geometry.opacity).toBe('1');
  expect(geometry.height).toBeCloseTo(headerHeight, 1);
});

test('the effect is hidden from assistive technology', async ({page}) => {
  const {layer, top} = await openShell(page);
  await settleAt(page, layer, top + UNDER);
  const hidden = await page.evaluate(() => {
    const shell = document.querySelector('[data-scroll-owner]');
    const decorative = [
      ...document.querySelectorAll(
        '[role="banner"] > [aria-hidden="true"], [data-scroll-owner] > [aria-hidden="true"]',
      ),
    ];
    return {
      count: decorative.length,
      allHidden: decorative.every(
        element => element.getAttribute('aria-hidden') === 'true',
      ),
      focusable: decorative.some(
        element =>
          element.matches('a, button, input, [tabindex]') ||
          element.querySelector('a, button, input, [tabindex]') != null,
      ),
      sentinelInShell: shell?.firstElementChild?.getAttribute('aria-hidden'),
    };
  });
  expect(hidden.count).toBe(2);
  expect(hidden.allHidden).toBe(true);
  expect(hidden.focusable).toBe(false);
  expect(hidden.sentinelInShell).toBe('true');
  await expect(page.getByRole('banner')).toBeVisible();
});

test('a finger bringing the content back mid-fade turns the fade around from where it is', async ({
  page,
}) => {
  const {layer, top} = await openShell(page);
  // Content under the bar starts the appear spring; three frames in, the
  // content comes back to rest, and the disappear spring takes over from the
  // opacity the effect has, without a jump either way.
  const trace = await page.evaluate(
    async ({start, back}) => {
      const element = document.querySelector(
        '[role="banner"] > [aria-hidden="true"]',
      ) as HTMLElement;
      const opacity = () => Number(getComputedStyle(element).opacity);
      const frame = async () =>
        new Promise<number>(resolve => requestAnimationFrame(resolve));
      // A finger rests on the content through both scrolls: the finger's.
      const target = document.querySelector('[role="main"]') ?? document.body;
      const touch = {identifier: 7, clientX: 100, clientY: 400, target};
      const fire = (type: string, touches: (typeof touch)[]) => {
        const event = new Event(type, {bubbles: true, cancelable: true});
        Object.defineProperty(event, 'changedTouches', {value: [touch]});
        Object.defineProperty(event, 'touches', {value: touches});
        target.dispatchEvent(event);
      };
      fire('touchstart', [touch]);
      window.scrollTo(0, start);
      // Wait for the fade to start, then let it run three frames.
      for (let i = 0; i < 60 && element.getAnimations().length === 0; i++) {
        await frame();
      }
      for (let i = 0; i < 3; i++) {
        await frame();
      }
      const before = opacity();
      window.scrollTo(0, back);
      const after: number[] = [];
      for (let i = 0; i < 45; i++) {
        await frame();
        after.push(opacity());
      }
      fire('touchend', []);
      return {before, after};
    },
    {start: top + UNDER, back: top},
  );
  test.info().annotations.push({
    type: 'interruption',
    description: JSON.stringify(trace),
  });
  // Turned around mid-flight: neither off nor fully on.
  expect(trace.before).toBeGreaterThan(0.05);
  expect(trace.before).toBeLessThan(0.95);
  // No jump: the next frames continue from there (still rising for a frame
  // or two until the observer reports, never past 1)…
  expect(Math.max(...trace.after)).toBeLessThan(0.99);
  expect(Math.abs(trace.after[0] - trace.before)).toBeLessThan(0.3);
  // …then it falls monotonically to 0 on the disappear spring.
  const peak = trace.after.indexOf(Math.max(...trace.after));
  const fall = trace.after.slice(peak);
  expect(fall.every((o, i) => i === 0 || o <= fall[i - 1] + 0.002)).toBe(true);
  expect(trace.after.at(-1)).toBeLessThan(0.01);
  await waitForRest(layer);
});

test('a finger’s scroll fades the effect; the program’s then switches it at once', async ({
  page,
}) => {
  const {layer, top} = await openShell(page);
  await fingerScrollToY(page, top + UNDER);
  await waitForAnimation(layer);
  await waitForRest(layer);
  expect(await presentedOpacity(layer)).toBe(1);
  // A status-bar tap or a scrollTo: no finger on the content.
  await scrollToY(page, top);
  await frames(page, 3);
  expect(await layer.evaluate(element => element.getAnimations().length)).toBe(
    0,
  );
  expect(await presentedOpacity(layer)).toBe(0);
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('the bar stays opaque and no effect runs', async ({page}) => {
    await openStory(page, storybook(), STORY);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const header = page.getByRole('banner');
    const bar = await header.evaluate(element => {
      const layer = element.querySelector(':scope > [aria-hidden="true"]');
      return {
        background: getComputedStyle(element).backgroundColor,
        layerDisplay: layer == null ? 'none' : getComputedStyle(layer).display,
      };
    });
    expect(bar.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(bar.layerDisplay).toBe('none');
  });
});

test(
  'storyboard: the effect fading in and out',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {layer, top} = await openShell(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: 140};
    const measure = async () => ({opacity: await presentedOpacity(layer)});
    await fingerScrollToY(page, top + UNDER);
    await waitForAnimation(layer);
    const {storyboard: appearBoard} = await animationStoryboard(page, {
      name: 'appshell-scroll-edge-appear',
      clip,
      scope: layer,
      measure,
      columns: 6,
      cellScale: 0.5,
    });
    // Resume rather than jump to the end (see the curve test).
    await releaseAnimations(page);
    await waitForRest(layer);
    await page.waitForTimeout(300);
    // Back to 9px under the bar: still under it, so the fade-out shows
    // over the tiles at the header's bottom edge.
    await fingerScrollToY(page, top + 9);
    await waitForAnimation(layer);
    const {storyboard: disappearBoard} = await animationStoryboard(page, {
      name: 'appshell-scroll-edge-disappear',
      clip,
      scope: layer,
      measure,
      columns: 6,
      cellScale: 0.5,
    });
    await releaseAnimations(page, {finish: true});
    await appearBoard.write(testInfo);
    await disappearBoard.write(testInfo);
    // The trace is the assertion; the sheets are the evidence.
    const ins = appearBoard.frames.map(f => f.data.opacity as number);
    const outs = disappearBoard.frames.map(f => f.data.opacity as number);
    expect(ins[0]).toBeLessThan(0.05);
    expect(ins.every((o, i) => i === 0 || o >= ins[i - 1] - 0.002)).toBe(true);
    expect(ins.at(-1)).toBeGreaterThan(0.99);
    expect(outs[0]).toBeGreaterThan(0.95);
    expect(outs.every((o, i) => i === 0 || o <= outs[i - 1] + 0.002)).toBe(
      true,
    );
    expect(outs.at(-1)).toBeLessThan(0.01);
  },
);
