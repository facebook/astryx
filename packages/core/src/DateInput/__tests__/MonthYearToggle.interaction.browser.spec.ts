// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MonthYearToggle.interaction.browser.spec.ts
 * @input The built "Bottom Sheet Calendar" DateInput story, real touch input
 *   and the interaction harness
 * @output Interaction proofs for the calendar's month/year toggle on
 *   UIDatePicker's clock (motion/uikit/datePicker.ts
 *   `calendar.monthYearToggle`): the wheels fade in on UIKit's 0.25 s
 *   ease-in-ease-out and the title's chevron turns a quarter turn on the same
 *   curve; a second tap mid-fade turns the fade around from where it is; the
 *   fade keeps advancing every frame through a blocked main thread; Reduced
 *   Motion keeps both; in RTL the chevron points left and turns to point
 *   down; a tapped day takes its selection with no transition; a storyboard
 *   of the toggle
 * @position Interaction tests of TouchDateField.tsx and MonthScroller.tsx
 *   (`*.interaction.browser.spec.ts`, run by `pnpm test:interaction`)
 */

import {expect, test, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  busyWindowProof,
  compareCurve,
  cubicBezier,
  curveOf,
  freezeTimers,
  holdAnimations,
  installTimerGate,
  markElement,
  openStory,
  releaseAnimations,
  sampleCurve,
  startScreencast,
  thawTimers,
  timeline,
  touchDriver,
  waitForAnimation,
  waitForRest,
  withStorybook,
  writeEvidence,
  type CastFrame,
  type TrackedFrame,
} from '@astryxdesign/interaction-harness';
import {datePicker} from '../../motion/uikit/datePicker';
import {timing} from '../../motion/uikit/timing';

const storybook = withStorybook(test);

const TOGGLE_MS = datePicker.calendar.monthYearToggle.fadeMs;
const ease = cubicBezier(...timing.curves.easeInOut);

const STORY = 'core-dateinput--bottom-sheet-calendar';

async function openCalendar(page: Page, {rtl = false} = {}) {
  if (rtl) {
    // The Storybook toolbar's direction global, as the URL sets it.
    await page.goto(
      `${storybook()}/iframe.html?id=${STORY}&viewMode=story&globals=direction:rtl`,
    );
    await page
      .locator('#storybook-root > *')
      .first()
      .waitFor({state: 'attached'});
    await page.evaluate(async () => document.fonts.ready);
  } else {
    await openStory(page, storybook(), STORY);
  }
  const driver = await touchDriver(page);
  const opener = page.getByRole('button', {name: /calendar/i}).first();
  const box = await opener.boundingBox();
  if (box == null) {
    throw new Error('no opener');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  const sheet = page
    .getByRole('dialog')
    .locator('.astryx-bottom-sheet')
    .first();
  await waitForRest(sheet);
  const title = page.locator('[data-title="month-year"]');
  const titleBox = await title.boundingBox();
  if (titleBox == null) {
    throw new Error('no title');
  }
  return {
    driver,
    sheet,
    wheels: page.locator('[data-panel="wheels"]').first(),
    titleAt: {
      x: titleBox.x + titleBox.width / 2,
      y: titleBox.y + titleBox.height / 2,
    },
  };
}

test('the wheels fade in and the chevron turns on UIKit’s 0.25 s ease-in-ease-out', async ({
  page,
}) => {
  const {driver, wheels, titleAt} = await openCalendar(page);
  await driver.tap(titleAt);
  await waitForAnimation(wheels);
  await holdAnimations(page);
  const times = timeline(TOGGLE_MS, 1000 / 60);
  const fade = curveOf(await sampleCurve(wheels, times), 'opacity');
  const fit = compareCurve(fade, t => ease(Math.min(1, t / TOGGLE_MS)), 0.02);
  const chevron = page
    .locator('[data-title="month-year"] .astryx-icon')
    .first();
  const turn = curveOf(await sampleCurve(chevron, times), 'rotate');
  const turnFit = compareCurve(
    turn,
    t => 90 * ease(Math.min(1, t / TOGGLE_MS)),
    2,
  );
  await releaseAnimations(page, {finish: true});
  expect(fit.pass, JSON.stringify(fit.worst)).toBe(true);
  expect(turnFit.pass, JSON.stringify(turnFit.worst)).toBe(true);
});

test('a second tap mid-fade turns the fade around from where it is', async ({
  page,
}) => {
  const {driver, wheels, titleAt} = await openCalendar(page);
  // The wheels' opacity every frame, from the page's own clock.
  await wheels.evaluate(element => {
    const log: [number, number][] = [];
    (window as unknown as {fade: typeof log}).fade = log;
    const t0 = performance.now();
    const tick = () => {
      log.push([
        performance.now() - t0,
        Number(getComputedStyle(element).opacity),
      ]);
      if (performance.now() - t0 < 1500) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
  await driver.tap(titleAt);
  // The second tap once the fade is visibly under way, not on a fixed delay.
  await wheels.evaluate(
    async element =>
      new Promise<void>(resolve => {
        const check = () => {
          if (Number(getComputedStyle(element).opacity) > 0.1) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      }),
  );
  await driver.tap(titleAt);
  await page.waitForTimeout(1200);
  const fade = await page.evaluate(
    () => (window as unknown as {fade: [number, number][]}).fade,
  );
  const values = fade.map(([, opacity]) => opacity);
  const peak = Math.max(...values);
  const peakAt = values.indexOf(peak);
  // The first fade never finished: the second tap caught it part way in.
  expect(peak).toBeGreaterThan(0.05);
  expect(peak).toBeLessThan(0.95);
  // From there it only falls, frame by frame, back to 0: no jump to 1 or 0.
  const after = values.slice(peakAt);
  for (let i = 1; i < after.length; i += 1) {
    expect(after[i]).toBeLessThanOrEqual(after[i - 1] + 1e-6);
    expect(after[i - 1] - after[i]).toBeLessThan(0.2);
  }
  expect(after.at(-1)).toBe(0);
});

/**
 * The chip's mean green channel in every frame: magenta over whatever is
 * beneath, so it moves with the panel's opacity.
 */
async function chipShades(
  page: Page,
  frames: ReadonlyArray<CastFrame>,
  rect: {x: number; y: number; width: number; height: number},
): Promise<{t: number; green: number}[]> {
  const scratch = await page.context().newPage();
  try {
    const out: {t: number; green: number}[] = [];
    for (let i = 0; i < frames.length; i += 12) {
      const batch = frames.slice(i, i + 12);
      const greens = await scratch.evaluate(
        async ({items, box}) => {
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
            // The chip's middle, clear of its anti-aliased edge.
            const x = Math.round((box.x + box.width / 4) * scale);
            const y = Math.round((box.y + box.height / 4) * scale);
            const w = Math.max(1, Math.round((box.width / 2) * scale));
            const h = Math.max(1, Math.round((box.height / 2) * scale));
            const {data} = context.getImageData(x, y, w, h);
            let sum = 0;
            for (let o = 1; o < data.length; o += 4) {
              sum += data[o];
            }
            results.push(sum / (data.length / 4));
          }
          return results;
        },
        {
          items: batch.map(f => ({
            data: f.data,
            format: f.format,
            viewportWidth: f.viewportWidth,
          })),
          box: rect,
        },
      );
      greens.forEach((green, k) => out.push({t: batch[k].t, green}));
    }
    return out;
  } finally {
    await scratch.close();
  }
}

test('the wheels keep fading in every frame through a blocked main thread', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName === 'webkit',
    "WebKit's screencast clock is not the page's (frames arrive ~100 ms off), so a 0.25 s fade cannot be placed inside the block; Mobile Safari on the iOS simulator is this proof's WebKit evidence",
  );
  const {driver, wheels, titleAt} = await openCalendar(page);
  // A magenta chip on the wheels' panel: its colour on screen is the fade.
  await markElement(wheels, {inset: 8, size: 24});
  const chip = page.locator('[data-harness-marker-chip]').first();
  const rect = await chip.boundingBox();
  if (rect == null) {
    throw new Error('no chip');
  }
  const cast = await startScreencast(page);
  await page.waitForTimeout(300);
  await driver.tap(titleAt);
  // The page blocks itself once the fade has run 32 ms: started, and on
  // screen. This passes on this CSS fade and on an animator-driven one alike:
  // it guards the fade's compositor path, not WebKit's hand-off (a block in
  // the frame that hands a new animation to the compositor delays it on
  // both, as Core Animation starts an animation at its commit). Mobile Safari
  // on the iOS simulator is the WebKit evidence.
  const busy = await blockMainThread(page, 600, {
    during: wheels,
    minProgressMs: 32,
  });
  await page.waitForTimeout(600);
  const shades = await chipShades(page, await cast.stop(), rect);
  const before = shades[0]?.green;
  const end = shades.at(-1)?.green;
  if (before == null || end == null || before - end < 50) {
    throw new Error('the chip did not show the fade');
  }
  // Opacity in thousandths, as a position the busy proof can judge.
  const tracked: TrackedFrame[] = shades.map(s => ({
    t: s.t,
    box: {
      x: (1000 * (before - s.green)) / (before - end),
      y: 0,
      width: 0,
      height: 0,
    },
    pixels: 1,
  }));
  const started = busy.from - 32;
  const spanned = {...busy, to: Math.min(busy.to, started + TOGGLE_MS)};
  expect(spanned.to - spanned.from).toBeGreaterThan(150);
  const proof = busyWindowProof(tracked, spanned, {
    axis: 'x',
    settledWithin: 10,
  });
  await writeEvidence(
    'busy-main-thread/month-year-toggle-fade',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          busy,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - started).toFixed(1),
            opacity: +((f.box?.x ?? 0) / 1000).toFixed(3),
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  testInfo.annotations.push({
    type: 'busy-main-thread',
    description: proof.summary,
  });
  expect(proof.verdict.failures, proof.summary).toEqual([]);
});

test('Reduced Motion keeps the fade and the turn: neither travels', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, wheels, titleAt} = await openCalendar(page);
  await driver.tap(titleAt);
  await waitForAnimation(wheels);
  await holdAnimations(page);
  const times = timeline(TOGGLE_MS, 1000 / 60);
  const fade = curveOf(await sampleCurve(wheels, times), 'opacity');
  const fit = compareCurve(fade, t => ease(Math.min(1, t / TOGGLE_MS)), 0.02);
  const chevron = page
    .locator('[data-title="month-year"] .astryx-icon')
    .first();
  const turn = curveOf(await sampleCurve(chevron, times), 'rotate');
  const turnFit = compareCurve(
    turn,
    t => 90 * ease(Math.min(1, t / TOGGLE_MS)),
    2,
  );
  await releaseAnimations(page, {finish: true});
  expect(fit.pass, JSON.stringify(fit.worst)).toBe(true);
  expect(turnFit.pass, JSON.stringify(turnFit.worst)).toBe(true);
});

test('in RTL the chevron points left, and turns to point down', async ({
  page,
}) => {
  const {driver, wheels, titleAt} = await openCalendar(page, {rtl: true});
  // Where the chevron's glyph (drawn pointing right) points on screen: the
  // mirror's transform times the turn's, applied to +x.
  const pointing = async () =>
    page.evaluate(() => {
      const icon = document.querySelector<HTMLElement>(
        '[data-title="month-year"] .astryx-icon',
      );
      const mirror = icon?.parentElement;
      if (icon == null || mirror == null) {
        throw new Error('no chevron');
      }
      const matrix = (el: Element) => {
        const value = getComputedStyle(el).transform;
        return new DOMMatrix(value === 'none' ? undefined : value);
      };
      const p = matrix(mirror)
        .multiply(matrix(icon))
        .transformPoint(new DOMPoint(1, 0));
      const q = matrix(mirror)
        .multiply(matrix(icon))
        .transformPoint(new DOMPoint(0, 0));
      return {x: +(p.x - q.x).toFixed(3), y: +(p.y - q.y).toFixed(3)};
    });
  await expect(page.locator('[dir="rtl"]').first()).toBeAttached();
  expect(await pointing()).toEqual({x: -1, y: 0});
  await driver.tap(titleAt);
  await waitForRest(wheels);
  await page.waitForTimeout(TOGGLE_MS + 100);
  expect(await pointing()).toEqual({x: 0, y: 1});
});

test('a tapped day takes its selection at once', async ({page}) => {
  const {driver} = await openCalendar(page);
  const day = page.getByRole('button', {name: /October 20, 2026/});
  const box = await day.boundingBox();
  if (box == null) {
    throw new Error('no day');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  // No transition on the day: nothing is animating once the tap is handled.
  const running = await day.evaluate(
    element => element.getAnimations({subtree: true}).length,
  );
  expect(running).toBe(0);
  await expect(page.getByRole('gridcell', {selected: true})).toContainText(
    '20',
  );
});

test(
  'storyboard: the month/year toggle',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, sheet, wheels, titleAt} = await openCalendar(page);
    await installTimerGate(page);
    await driver.tap(titleAt);
    await waitForAnimation(wheels);
    await freezeTimers(page);
    const {storyboard} = await animationStoryboard(page, {
      name: 'month-year-toggle',
      clip: sheet,
      times: timeline(TOGGLE_MS, 1000 / 30),
      columns: 5,
      cellScale: 0.35,
      measure: async () => ({
        opacity: +(
          await wheels.evaluate(el => Number(getComputedStyle(el).opacity))
        ).toFixed(3),
      }),
    });
    await storyboard.write(testInfo);
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
  },
);
