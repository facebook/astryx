// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PageControl.interaction.browser.spec.ts
 * @input The built "Default" and "Many Pages" PageControl stories, real touch
 *   input (Chromium CDP / WebKit's tap path) and the interaction harness
 * @output Proof, against UIPageControl's measurements, that a tap on either
 *   side of the current indicator moves one page that way when the finger
 *   lifts and taps are never coalesced; that a finger travelling 16 px
 *   scrubs, the page switching at the midpoints between indicators; that past
 *   the content's edge of a windowed control the page keeps stepping, faster
 *   the further past; that a held finger shows the platter and dims the other
 *   indicators, and the touched indicator does not transform; that the old
 *   current indicator fades over 0.125 s after a tap and 0.25 s otherwise;
 *   that a windowed control's row slides one slot 50 ms after the change on a
 *   critically damped spring; and that the page can scroll under the control
 * @position Browser proof for the lab PageControl, run by
 *   `pnpm test:interaction`
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  drag,
  holdAnimations,
  releaseAnimations,
  openStory,
  touchDriver,
  touchStoryboard,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** Indicator pitch, px (uikit.pageControl: 9.67 + 8). */
const PITCH = 17.67;

/**
 * Opens a PageControl story. The phone projects have a coarse primary
 * pointer: the touch presentation, on any engine (one touch model; nothing
 * asks for iOS). A block that sets `hasTouch: false` gets a mouse.
 */
async function open(
  page: Page,
  story = 'lab-pagecontrol--default',
  {rtl = false}: {rtl?: boolean} = {},
) {
  if (rtl) {
    await page.goto(
      `${storybook()}/iframe.html?id=${story}&viewMode=story&globals=direction:rtl`,
    );
    await page.getByRole('slider').waitFor();
  } else {
    await openStory(page, storybook(), story);
  }
  const slider = page.getByRole('slider');
  const driver = await touchDriver(page);
  return {slider, driver};
}

/** The centre of page `index`'s indicator, page coordinates. */
async function indicatorCenter(slider: Locator, index: number) {
  return slider.evaluate((el, i) => {
    const dot = el.querySelector(`[data-page="${i}"]`) as HTMLElement;
    const box = dot.getBoundingClientRect();
    return {x: box.left + box.width / 2, y: box.top + box.height / 2};
  }, index);
}

const valueNow = async (slider: Locator) =>
  Number(await slider.getAttribute('aria-valuenow'));

/** Logs every page change with its time (performance.now()) from now on. */
async function logPages(slider: Locator) {
  await slider.evaluate(el => {
    const log: Array<{t: number; page: number}> = [];
    (window as unknown as {pageLog: typeof log}).pageLog = log;
    new MutationObserver(() => {
      log.push({
        t: performance.now(),
        page: Number(el.getAttribute('aria-valuenow')),
      });
    }).observe(el, {attributes: true, attributeFilter: ['aria-valuenow']});
  });
  return () =>
    slider.evaluate(
      () =>
        (window as unknown as {pageLog: Array<{t: number; page: number}>})
          .pageLog,
    );
}

test('a tap on the trailing side of the current indicator moves one page forward, the leading side one back', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  expect(await valueNow(slider)).toBe(3);
  const current = await indicatorCenter(slider, 2);
  await driver.tap({x: current.x + 12, y: current.y});
  await expect.poll(async () => valueNow(slider)).toBe(4);
  await expect(page.getByTestId('page')).toHaveText('Page 4');
  const next = await indicatorCenter(slider, 3);
  await driver.tap({x: next.x - 12, y: next.y});
  await expect.poll(async () => valueNow(slider)).toBe(3);
});

test('the page changes when the finger lifts, not when it lands', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  const current = await indicatorCenter(slider, 2);
  const at = {x: current.x + 12, y: current.y};
  let whileDown = NaN;
  // A finger held 200 ms (a 0.4 px creep, so moves are reported) then lifted.
  await driver.play(
    drag(at, {x: at.x + 0.4, y: at.y}, {durationMs: 200, hz: 10}),
    {
      onEvent: async step => {
        if (step.type === 'touchMove' && Number.isNaN(whileDown)) {
          whileDown = await valueNow(slider);
        }
      },
    },
  );
  expect(whileDown).toBe(3);
  await expect.poll(async () => valueNow(slider)).toBe(4);
});

test('rapid taps are not coalesced: five taps 150 ms apart step five pages (UIKit: each tap steps once)', async ({
  page,
}) => {
  const {slider, driver} = await open(page, 'lab-pagecontrol--many-pages');
  expect(await valueNow(slider)).toBe(26);
  for (let i = 0; i < 5; i++) {
    const current = await indicatorCenter(slider, 25 + i);
    await driver.tap({x: current.x + 12, y: current.y});
    await page.waitForTimeout(100);
  }
  await expect.poll(async () => valueNow(slider)).toBe(31);
});

test('a finger that travels 16 px scrubs: the page is the indicator under it, switching at the midpoints, with no layout read after the scrub begins', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  const centers = await Promise.all(
    [0, 1, 2, 3, 4].map(i => indicatorCenter(slider, i)),
  );
  const from = centers[2];
  const to = {x: centers[4].x + 4, y: from.y};
  // Every layout read the page makes from here on.
  await page.evaluate(() => {
    const counter = window as unknown as {layoutReads: number};
    const read = Element.prototype.getBoundingClientRect;
    counter.layoutReads = 0;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      counter.layoutReads++;
      return read.call(this);
    };
  });
  const seen: Array<{x: number; page: number; reads: number}> = [];
  await driver.play(drag(from, to, {durationMs: 900, hz: 30, restMs: 120}), {
    onEvent: async step => {
      if (step.type === 'touchMove') {
        const x = step.fingers[0].x;
        await page.waitForTimeout(20);
        seen.push({
          x,
          page: (await valueNow(slider)) - 1,
          reads: await page.evaluate(
            () => (window as unknown as {layoutReads: number}).layoutReads,
          ),
        });
      }
    },
  });
  // The scrub reads the control's layout once, as it begins, and never while
  // the finger moves.
  const scrubbing = seen.filter(({x}) => x - from.x >= 16);
  expect(scrubbing.length).toBeGreaterThan(5);
  expect(scrubbing[0].reads).toBeGreaterThan(0);
  expect(scrubbing[scrubbing.length - 1].reads).toBe(scrubbing[0].reads);
  for (const {x, page: shown} of seen) {
    const travel = x - from.x;
    const expected =
      travel < 16
        ? 2
        : Math.max(0, Math.min(4, Math.round((x - centers[0].x) / PITCH)));
    // One sample of slack at a switch point (the page follows the finger
    // within the move that crossed it).
    if (
      Math.abs(((x - centers[0].x) / PITCH) % 1) - 0.5 > 0.06 ||
      travel < 15
    ) {
      expect(shown, `finger at ${x.toFixed(1)}`).toBe(expected);
    }
  }
  expect(seen[seen.length - 1].page).toBe(4);
  // Scrubbing back to page 0.
  await driver.play(
    drag(to, {x: centers[0].x - 6, y: from.y}, {durationMs: 900, restMs: 120}),
  );
  await expect.poll(async () => valueNow(slider)).toBe(1);
});

test('past the edge of a windowed control the page keeps stepping, faster the further past (jog)', async ({
  page,
}) => {
  const {slider, driver} = await open(page, 'lab-pagecontrol--many-pages');
  const box = await slider.boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  const contentEnd = box.x + box.width - 14;
  const current = await indicatorCenter(slider, 25);
  const pages = await logPages(slider);
  // Scrub 40 px past the content's edge and hold there for 1.2 s:
  // 0.173 pages/s per px → about 7 pages a second.
  await driver.play(
    drag(
      current,
      {x: contentEnd + 40, y: current.y},
      {durationMs: 300, hz: 60, restMs: 1200},
    ),
  );
  const log = await pages();
  const held = log.filter(e => e.t >= log[0].t + 400);
  const intervals = held.slice(1).map((e, i) => e.t - held[i].t);
  const median = intervals.sort((a, b) => a - b)[
    Math.floor(intervals.length / 2)
  ];
  expect(median).toBeGreaterThan(110);
  expect(median).toBeLessThan(190);
  expect(log[log.length - 1].page).toBeGreaterThan(30);
  // Far past (100 px): 15 pages a second.
  const far = await logPages(slider);
  const now = await indicatorCenter(slider, (await valueNow(slider)) - 1);
  await driver.play(
    drag(
      now,
      {x: contentEnd + 100, y: now.y},
      {durationMs: 200, hz: 60, restMs: 900},
    ),
  );
  const fast = (await far()).filter((e, i, all) => e.t >= all[0].t + 300);
  const fastIntervals = fast.slice(1).map((e, i) => e.t - fast[i].t);
  const fastMedian = fastIntervals.sort((a, b) => a - b)[
    Math.floor(fastIntervals.length / 2)
  ];
  expect(fastMedian).toBeGreaterThan(50);
  expect(fastMedian).toBeLessThan(85);
});

test('a held finger shows the platter and dims the other indicators after 155 ms; the touched indicator does not transform', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  const target = await indicatorCenter(slider, 3);
  const restingScale = await slider.evaluate(
    el =>
      getComputedStyle(el.querySelector('[data-page="3"]') as HTMLElement)
        .scale,
  );
  const states: Array<{
    t: number;
    interacting: boolean;
    platter: number;
    other: number;
    touchedScale: string;
  }> = [];
  const read = async (t: number) => {
    const state = await slider.evaluate(el => {
      const platter = el.firstElementChild as HTMLElement;
      const other = el.querySelector('[data-page="0"]') as HTMLElement;
      const touched = el.querySelector('[data-page="3"]') as HTMLElement;
      return {
        interacting: el.hasAttribute('data-interacting'),
        platter: Number(getComputedStyle(platter).opacity),
        other: Number(other.style.opacity),
        touchedScale: getComputedStyle(touched).scale,
      };
    });
    states.push({t, ...state});
  };
  await driver.play(
    drag(target, {x: target.x + 0.4, y: target.y}, {durationMs: 400, hz: 20}),
    {
      onEvent: async step => {
        if (step.type === 'touchMove') {
          await read(step.t);
        }
      },
    },
  );
  const early = states.filter(s => s.t < 100);
  const late = states.filter(s => s.t > 260);
  expect(early.every(s => !s.interacting && s.other === 0.48)).toBe(true);
  expect(late.length).toBeGreaterThan(0);
  expect(late.every(s => s.interacting && s.other === 0.25)).toBe(true);
  expect(late.every(s => s.platter > 0.9)).toBe(true);
  // The touched indicator keeps its resting size throughout.
  expect(states.every(s => s.touchedScale === restingScale)).toBe(true);
  // At the lift both return.
  await expect
    .poll(async () =>
      slider.evaluate(el => el.hasAttribute('data-interacting')),
    )
    .toBe(false);
  expect(
    await slider.evaluate(
      el => (el.querySelector('[data-page="0"]') as HTMLElement).style.opacity,
    ),
  ).toBe('0.48');
});

test('the old current indicator fades over 0.125 s after a tap and 0.25 s after any other change, on (0, 0, 0.58, 1)', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  const fadeOf = (index: number) =>
    slider.evaluate((el, i) => {
      const dot = el.querySelector(`[data-page="${i}"]`) as HTMLElement;
      const style = getComputedStyle(dot);
      return {
        duration: style.transitionDuration,
        easing: style.transitionTimingFunction,
      };
    }, index);
  const current = await indicatorCenter(slider, 2);
  await driver.tap({x: current.x + 12, y: current.y});
  await expect.poll(async () => valueNow(slider)).toBe(4);
  expect(await fadeOf(2)).toEqual({
    duration: '0.125s',
    easing: 'cubic-bezier(0, 0, 0.58, 1)',
  });
  expect((await fadeOf(3)).duration).toBe('0.015625s');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => valueNow(slider)).toBe(5);
  expect(await fadeOf(3)).toEqual({
    duration: '0.25s',
    easing: 'cubic-bezier(0, 0, 0.58, 1)',
  });
});

test('a windowed control slides one slot 50 ms after the change, on a critically damped spring', async ({
  page,
}) => {
  const {slider, driver} = await open(page, 'lab-pagecontrol--many-pages');
  // Page 26 of 50 from page 1: the window starts at page 18; page 26 (index
  // 25) is in its last full slot.
  const translateX = () =>
    slider.evaluate(el => {
      const strip = el.children[1] as HTMLElement;
      return Number.parseFloat(getComputedStyle(strip).translate) || 0;
    });
  expect(await translateX()).toBeCloseTo(-18 * PITCH, 0);
  const current = await indicatorCenter(slider, 25);
  await slider.evaluate(el => {
    const strip = el.children[1] as HTMLElement;
    const trace: Array<{t: number; x: number; page: number}> = [];
    (window as unknown as {slide: typeof trace}).slide = trace;
    const start = performance.now();
    const sample = () => {
      trace.push({
        t: performance.now() - start,
        x: Number.parseFloat(getComputedStyle(strip).translate) || 0,
        page: Number(el.getAttribute('aria-valuenow')),
      });
      if (performance.now() - start < 1500) {
        requestAnimationFrame(sample);
      }
    };
    requestAnimationFrame(sample);
  });
  await driver.tap({x: current.x + 12, y: current.y});
  await expect.poll(async () => valueNow(slider)).toBe(27);
  await page.waitForTimeout(600);
  const trace = await slider.evaluate(
    () =>
      (
        window as unknown as {
          slide: Array<{t: number; x: number; page: number}>;
        }
      ).slide,
  );
  const changedAt = trace.find(s => s.page === 27)?.t ?? NaN;
  const moving = trace.filter(s => Math.abs(s.x + 18 * PITCH) > 0.2);
  const startedAt = moving[0]?.t ?? NaN;
  expect(startedAt - changedAt).toBeGreaterThan(30);
  expect(startedAt - changedAt).toBeLessThan(120);
  // Monotonic to the next slot, settled within ~0.35 s of starting.
  const xs = trace.filter(s => s.t >= startedAt).map(s => s.x);
  for (let i = 1; i < xs.length; i++) {
    expect(xs[i]).toBeLessThanOrEqual(xs[i - 1] + 0.01);
  }
  const settled = trace.find(s => Math.abs(s.x + 19 * PITCH) < 0.3);
  expect(settled).toBeDefined();
  expect((settled?.t ?? Infinity) - startedAt).toBeLessThan(350);
  // Page 27 (index 26) grows from its 7.33 px edge size to full: 9.67 px, a
  // 10 px box at scale 0.967.
  expect(
    Number.parseFloat(
      await slider.evaluate(
        el =>
          getComputedStyle(el.querySelector('[data-page="26"]') as HTMLElement)
            .scale,
      ),
    ),
  ).toBeCloseTo(0.967, 3);
});

test('RTL: a scrub toward the left goes forward and the window slides the other way', async ({
  page,
}) => {
  const {slider, driver} = await open(page, 'lab-pagecontrol--many-pages', {
    rtl: true,
  });
  expect(await slider.evaluate(el => getComputedStyle(el).direction)).toBe(
    'rtl',
  );
  const stripX = () =>
    slider.evaluate(el =>
      Number.parseFloat(
        getComputedStyle(el.children[1] as HTMLElement).translate,
      ),
    );
  // Page 26: the window starts at page 18, shifted toward the right in RTL.
  expect(await stripX()).toBeCloseTo(18 * PITCH, 0);
  const current = await indicatorCenter(slider, 25);
  // The next pages sit to the left in RTL. Page 26 is the window's last full
  // slot, so a scrub past it toward the left runs into the content's edge
  // and jogs forward, as it does toward the right in LTR.
  await driver.play(
    drag(
      current,
      {x: current.x - 2 * PITCH - 2, y: current.y},
      {durationMs: 600, restMs: 150},
    ),
  );
  await expect.poll(async () => valueNow(slider)).toBe(27);
  // The window followed one slot, toward the right.
  await expect.poll(stripX, {timeout: 2000}).toBeCloseTo(19 * PITCH, 0);
});

/**
 * At most a jump: `property` holds its start value, then its end value, and
 * never one in between (design:reduced-motion DR1; a cross-fade moves the
 * track at the bottom of its dip).
 */
const holdsOrJumps = (
  keyframes: ReadonlyArray<Record<string, unknown>>,
  property: string,
): boolean => {
  const values = new Set<string>();
  for (const k of keyframes) {
    const v = k[property];
    if (typeof v === 'string' || typeof v === 'number') {
      values.add(String(v));
    }
  }
  return values.size <= 2;
};

test('under Reduce Motion nothing slides or scales, and no fade runs over 200 ms on a coarse pointer (design:reduced-motion DR1, DR2)', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {slider, driver} = await open(page, 'lab-pagecontrol--many-pages');
  // The phone projects have a coarse pointer, the case DR2 covers.
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(true);
  const stripX = () =>
    slider.evaluate(el =>
      Number.parseFloat(
        getComputedStyle(el.children[1] as HTMLElement).translate,
      ),
    );
  const longestFade = () =>
    slider.evaluate(el =>
      Math.max(
        0,
        ...Array.from(el.querySelectorAll<HTMLElement>('[data-page]')).flatMap(
          dot =>
            getComputedStyle(dot)
              .transitionDuration.split(',')
              .map(d =>
                d.trim().endsWith('ms') ? parseFloat(d) : parseFloat(d) * 1000,
              ),
        ),
      ),
    );
  // A tap that moves the window: page 26 to 27.
  const current = await indicatorCenter(slider, 25);
  await driver.tap({x: current.x + 12, y: current.y});
  await expect.poll(async () => valueNow(slider)).toBe(27);
  // Past the window's delay, every animation is an opacity fade of at most
  // 200 ms: no translate or scale travels (DR1).
  await page.waitForTimeout(120);
  const held = await holdAnimations(page, slider);
  for (const a of held) {
    // Nothing travels: the strip and the dots hold, then jump (DR1).
    for (const property of ['translate', 'scale', 'transform']) {
      expect(holdsOrJumps(a.keyframes, property)).toBe(true);
    }
    expect(a.curveEndMs).toBeLessThanOrEqual(200);
  }
  await releaseAnimations(page);
  // The window still keeps the page in view.
  await expect.poll(stripX, {timeout: 2000}).toBeCloseTo(-19 * PITCH, 0);
  expect(await longestFade()).toBeLessThanOrEqual(200);
  // A change that is not a tap (a key) fades the old dot: at most 200 ms.
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => valueNow(slider)).toBe(28);
  expect(await longestFade()).toBeLessThanOrEqual(200);
  // A held finger's platter fades in and out in at most 200 ms too.
  const finger = await indicatorCenter(slider, 27);
  await driver.play(
    drag(finger, {x: finger.x + 1, y: finger.y}, {durationMs: 400, restMs: 0}),
  );
  const platterFade = await slider.evaluate(el =>
    Math.max(
      ...getComputedStyle(el.children[0] as HTMLElement)
        .transitionDuration.split(',')
        .map(d =>
          d.trim().endsWith('ms') ? parseFloat(d) : parseFloat(d) * 1000,
        ),
    ),
  );
  expect(platterFade).toBeGreaterThan(0);
  expect(platterFade).toBeLessThanOrEqual(200);
});

test('busy main thread: a window slide finishes on time through a 600 ms block', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    "WebKit's screencast clock is not the page's (harness README); the simulator clip covers it",
  );
  const {slider, driver} = await open(page, 'lab-pagecontrol--many-pages');
  const current = await indicatorCenter(slider, 25);
  await driver.tap({x: current.x + 12, y: current.y});
  await expect
    .poll(async () =>
      slider.evaluate(
        el => (el.children[1] as HTMLElement).getAnimations().length,
      ),
    )
    .toBeGreaterThan(0);
  // Block the main thread right after the slide starts, for longer than the
  // slide lasts.
  const afterBlock = await slider.evaluate(el => {
    const strip = el.children[1] as HTMLElement;
    const end = performance.now() + 600;
    while (performance.now() < end) {
      // busy
    }
    return {
      x: Number.parseFloat(getComputedStyle(strip).translate),
      running: strip
        .getAnimations()
        .filter(
          a => a.playState === 'running' && Number(a.currentTime ?? 0) < 400,
        ).length,
    };
  });
  // The compositor carried the slide to the next slot during the block.
  expect(afterBlock.x).toBeCloseTo(-19 * PITCH, 0);
  expect(afterBlock.running).toBe(0);
});

test('on an Android phone (no -webkit-touch-callout) a finger scrubs: one touch model, no platform idiom', async ({
  page,
}) => {
  const {slider, driver} = await open(page);
  expect(
    await page.evaluate(() => ({
      coarse: matchMedia('(pointer: coarse)').matches,
      ios: CSS.supports('(-webkit-touch-callout: none)'),
    })),
  ).toEqual({coarse: true, ios: false});
  const from = await indicatorCenter(slider, 2);
  const to = await indicatorCenter(slider, 4);
  await driver.play(drag(from, to, {durationMs: 600, restMs: 150}));
  await expect.poll(async () => valueNow(slider)).toBe(5);
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('a long control is the full row of pages, cropped, every dot at full size', async ({
    page,
  }) => {
    const {slider} = await open(page, 'lab-pagecontrol--many-pages');
    // A mouse: the context's pointer must not still match coarse.
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const facts = await slider.evaluate(el => {
      const dots = Array.from(el.querySelectorAll<HTMLElement>('[data-page]'));
      return {
        count: dots.length,
        scales: new Set(dots.map(d => getComputedStyle(d).scale)).size,
        overflow: getComputedStyle(el).overflow,
        width: el.getBoundingClientRect().width,
      };
    });
    expect(facts).toMatchObject({count: 50, scales: 1, overflow: 'hidden'});
    expect(facts.width).toBeCloseTo(161.3, 0);
  });

  for (const [story, count] of [
    ['lab-pagecontrol--default', 5],
    ['lab-pagecontrol--many-pages', 9],
  ] as const) {
    test(`every indicator paints round, as wide as it is tall (${story}, a mouse)`, async ({
      page,
    }) => {
      const {slider} = await open(page, story);
      // A mouse: the context's pointer must not still match coarse.
      expect(
        await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
      ).toBe(false);
      const dots = await paintedDots(page, slider);
      expect(dots.length).toBeGreaterThanOrEqual(count);
      for (const dot of dots) {
        expect(
          Math.abs(dot.width - dot.height),
          JSON.stringify(dots),
        ).toBeLessThanOrEqual(1);
      }
    });
  }
});

test('the page can scroll under the control (touch-action)', async ({page}) => {
  const {slider} = await open(page);
  expect(await slider.evaluate(el => getComputedStyle(el).touchAction)).toBe(
    'manipulation',
  );
});

/**
 * The painted size of every indicator, in device pixels: the control's
 * screenshot decoded in the page, each dark run across its middle row and the
 * dark run down through that run's centre. Runs cut by the screenshot's edge
 * are left out.
 */
async function paintedDots(page: Page, slider: Locator) {
  const png = await slider.screenshot();
  return page.evaluate(async b64 => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const g = canvas.getContext('2d');
    if (g == null) {
      throw new Error('no 2d context');
    }
    g.drawImage(img, 0, 0);
    const {data, width, height} = g.getImageData(0, 0, img.width, img.height);
    const dark = (x: number, y: number) => data[(y * width + x) * 4] < 200;
    const cy = Math.floor(height / 2);
    const dots: Array<{width: number; height: number}> = [];
    for (let x = 0; x < width;) {
      if (!dark(x, cy)) {
        x++;
        continue;
      }
      let x1 = x;
      while (x1 < width && dark(x1, cy)) {
        x1++;
      }
      const mid = (x + x1) >> 1;
      let y0 = cy;
      while (y0 > 0 && dark(mid, y0 - 1)) {
        y0--;
      }
      let y1 = cy;
      while (y1 < height - 1 && dark(mid, y1 + 1)) {
        y1++;
      }
      if (x > 0 && x1 < width) {
        dots.push({width: x1 - x, height: y1 - y0 + 1});
      }
      x = x1;
    }
    return dots;
  }, png.toString('base64'));
}

for (const [story, count] of [
  ['lab-pagecontrol--default', 5],
  // The window's two outermost dots overhang the control's box by a pixel or
  // two, so the screenshot cuts them.
  ['lab-pagecontrol--many-pages', 8],
] as const) {
  test(`every indicator paints round, as wide as it is tall (${story}, a finger)`, async ({
    page,
  }) => {
    const {slider} = await open(page, story);
    const dots = await paintedDots(page, slider);
    expect(dots.length).toBeGreaterThanOrEqual(count);
    for (const dot of dots) {
      expect(
        Math.abs(dot.width - dot.height),
        JSON.stringify(dots),
      ).toBeLessThanOrEqual(1);
    }
  });
}

test('storyboard: a tap on the trailing side @storyboard', async ({page}) => {
  const {slider, driver} = await open(page);
  const current = await indicatorCenter(slider, 2);
  const at = {x: current.x + 12, y: current.y};
  const box = await slider.boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  const storyboard = await touchStoryboard(
    page,
    driver,
    drag(at, {x: at.x + 0.4, y: at.y}, {durationMs: 100, hz: 20}),
    {
      name: 'page-control-tap',
      clip: {
        x: box.x - 8,
        y: box.y - 8,
        width: box.width + 16,
        height: box.height + 16,
      },
      measure: async () => ({page: await valueNow(slider)}),
    },
  );
  await storyboard.write(test.info());
  const pages = storyboard.frames.map(f => (f.data as {page: number}).page);
  // Page 3 until the lift, page 4 after it.
  expect(pages[0]).toBe(3);
  expect(pages.slice(0, -1).every(p => p === 3)).toBe(true);
  expect(pages[pages.length - 1]).toBe(4);
});

test('storyboard: a scrub across the control @storyboard', async ({page}) => {
  const {slider, driver} = await open(page);
  const from = await indicatorCenter(slider, 2);
  const end = await indicatorCenter(slider, 4);
  const box = await slider.boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  const storyboard = await touchStoryboard(
    page,
    driver,
    drag(from, {x: end.x + 4, y: from.y}, {durationMs: 600, hz: 10}),
    {
      name: 'page-control-scrub',
      clip: {
        x: box.x - 8,
        y: box.y - 8,
        width: box.width + 16,
        height: box.height + 16,
      },
      measure: async () => ({
        page: await valueNow(slider),
        interacting: await slider.evaluate(el =>
          el.hasAttribute('data-interacting'),
        ),
      }),
    },
  );
  await storyboard.write(test.info());
  const pages = storyboard.frames.map(f => (f.data as {page: number}).page);
  // Pages only move forward, one indicator at a time, and end on page 5.
  for (let i = 1; i < pages.length; i++) {
    expect(pages[i] - pages[i - 1]).toBeGreaterThanOrEqual(0);
    expect(pages[i] - pages[i - 1]).toBeLessThanOrEqual(1);
  }
  expect(pages[pages.length - 1]).toBe(5);
});

test('storyboard: the window slides one slot @storyboard', async ({page}) => {
  const {slider, driver} = await open(page, 'lab-pagecontrol--many-pages');
  const current = await indicatorCenter(slider, 25);
  const box = await slider.boundingBox();
  if (box == null) {
    throw new Error('no control');
  }
  await driver.tap({x: current.x + 12, y: current.y});
  // The slide starts 50 ms after the change: hold it once it runs.
  await expect
    .poll(async () =>
      slider.evaluate(
        el => (el.children[1] as HTMLElement).getAnimations().length,
      ),
    )
    .toBeGreaterThan(0);
  const {storyboard} = await animationStoryboard(page, {
    name: 'page-control-window-slide',
    scope: slider,
    clip: {
      x: box.x - 24,
      y: box.y - 8,
      width: box.width + 48,
      height: box.height + 16,
    },
    measure: async () =>
      slider.evaluate(el => ({
        x: Number.parseFloat(
          getComputedStyle(el.children[1] as HTMLElement).translate,
        ),
        grow: Number.parseFloat(
          getComputedStyle(el.querySelector('[data-page="26"]') as HTMLElement)
            .scale,
        ),
      })),
  });
  await storyboard.write(test.info());
  const frames = storyboard.frames.map(
    f => f.data as {x: number; grow: number},
  );
  // The strip moves one slot left without overshoot while the new current
  // indicator grows from its edge size (0.7588) to full.
  for (let i = 1; i < frames.length; i++) {
    expect(frames[i].x).toBeLessThanOrEqual(frames[i - 1].x + 0.01);
    expect(frames[i].grow).toBeGreaterThanOrEqual(frames[i - 1].grow - 0.001);
  }
  expect(frames[frames.length - 1].x).toBeCloseTo(-19 * PITCH, 0);
  expect(frames[0].grow).toBeLessThan(0.9);
  // Full size: 9.67 px, a 10 px box at scale 0.967.
  expect(frames[frames.length - 1].grow).toBeCloseTo(0.967, 2);
});
