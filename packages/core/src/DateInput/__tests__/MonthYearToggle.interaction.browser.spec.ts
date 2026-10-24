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
 *   fade keeps advancing every frame through a blocked main thread; under
 *   Reduced Motion the wheels cross-fade in at most 200 ms and the chevron
 *   dips instead of turning (design:reduced-motion); in RTL the chevron points
 *   left and turns to point down; a tapped day takes its selection with no
 *   transition; once the sheet settles the hidden wheels are laid out at
 *   opacity 0 (DateInput and DateTimeInput), so the toggle's commit only
 *   changes opacity; a storyboard of the toggle. They run under a finger in
 *   Chromium (as on Android) and WebKit alike; with a mouse today's swap
 *   values survive, and under Reduced Motion the toggle changes at once.
 * @position Interaction tests of TouchDateField.tsx, TouchDateTimeField.tsx and
 *   MonthPager.tsx (`*.interaction.browser.spec.ts`, run by
 *   `pnpm test:interaction`)
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
  seekAnimations,
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
import {SHEET_SETTLE_MS} from '../useWheelsWarmUp';
import {datePicker} from '../../motion/uikit/datePicker';
import {timing} from '../../motion/uikit/timing';

const storybook = withStorybook(test);

const TOGGLE_MS = datePicker.calendar.monthYearToggle.fadeMs;
const ease = cubicBezier(...timing.curves.easeInOut);

const STORY = 'core-dateinput--bottom-sheet-calendar';
const DTI_STORY = 'core-datetimeinput--bottom-sheet-with-time-increment';

async function openCalendar(
  page: Page,
  {rtl = false, story = STORY}: {rtl?: boolean; story?: string} = {},
) {
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
    await openStory(page, storybook(), story);
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

/** Every running animation under `root`: its animated properties and duration. */
async function runningAnimations(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate(root =>
      root.getAnimations({subtree: true}).map(animation => {
        const effect = animation.effect as KeyframeEffect;
        return {
          properties: [
            ...new Set(
              effect
                .getKeyframes()
                .flatMap(frame =>
                  Object.keys(frame).filter(
                    key =>
                      ![
                        'offset',
                        'easing',
                        'composite',
                        'computedOffset',
                      ].includes(key),
                  ),
                ),
            ),
          ],
          duration: Number(effect.getTiming().duration),
        };
      }),
    );
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
    t => -90 + 90 * ease(Math.min(1, t / TOGGLE_MS)),
    2,
  );
  await releaseAnimations(page, {finish: true});
  expect(fit.pass, JSON.stringify(fit.worst)).toBe(true);
  expect(turnFit.pass, JSON.stringify(turnFit.worst)).toBe(true);
});

test('DateTimeInput: the calendar and the wheels cross-fade on UIKit’s 0.25 s ease-in-ease-out, the chevron turning with them', async ({
  page,
}) => {
  await openStory(page, storybook(), DTI_STORY);
  const driver = await touchDriver(page);
  const tapCenter = async (selector: string) => {
    const box = await page.locator(selector).first().boundingBox();
    if (box == null) {
      throw new Error(`no ${selector}`);
    }
    await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  };
  await tapCenter('button[aria-label^="Open "]');
  const wheels = page.locator('[data-date-surface="wheels"]').first();
  await expect(wheels).toBeAttached();
  await waitForRest(
    page.getByRole('dialog').locator('.astryx-bottom-sheet').first(),
  );
  await tapCenter('button[aria-label$="Choose month and year"]');
  await waitForAnimation(wheels);
  await holdAnimations(page);
  const times = timeline(TOGGLE_MS, 1000 / 60);
  const fade = curveOf(await sampleCurve(wheels, times), 'opacity');
  const fit = compareCurve(fade, t => ease(Math.min(1, t / TOGGLE_MS)), 0.02);
  const chevron = page
    .locator('button[aria-label$="Choose month and year"] .astryx-icon')
    .first();
  const turn = curveOf(await sampleCurve(chevron, times), 'rotate');
  const turnFit = compareCurve(
    turn,
    t => -90 + 90 * ease(Math.min(1, t / TOGGLE_MS)),
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
  // A theme's retune of the toggle's role stretches the fade to 2 s, so the
  // second tap lands mid-fade deterministically instead of racing a 250 ms
  // fade; the turnaround does not depend on the length.
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      '--motion-date-picker-calendar-month-year-toggle-fade-ms',
      '2000ms',
    ),
  );
  await driver.tap(titleAt);
  await wheels.evaluate(
    async element =>
      new Promise<void>(resolve => {
        const check = () => {
          if (Number(getComputedStyle(element).opacity) > 0.3) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      }),
  );
  // Every frame's opacity, with the page's clock, from here on.
  await wheels.evaluate(element => {
    const log: [number, number][] = [];
    (window as unknown as {fade: typeof log}).fade = log;
    const t0 = performance.now();
    const tick = () => {
      log.push([
        performance.now() - t0,
        Number(getComputedStyle(element).opacity),
      ]);
      if (performance.now() - t0 < 3000) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  });
  await driver.tap(titleAt);
  await page.waitForTimeout(2600);
  const fade = await page.evaluate(
    () => (window as unknown as {fade: [number, number][]}).fade,
  );
  const values = fade.map(([, opacity]) => opacity);
  const peak = Math.max(...values);
  const peakAt = values.indexOf(peak);
  // The first fade never finished: the second tap caught it part way in.
  expect(peak).toBeGreaterThan(0.3);
  expect(peak).toBeLessThan(0.95);
  // From there it only falls back to 0: never up to 1, never a jump. The
  // fall is bounded per millisecond, so a dropped frame is not a jump.
  for (let i = peakAt + 1; i < fade.length; i += 1) {
    const [time, opacity] = fade[i];
    const [lastTime, last] = fade[i - 1];
    expect(opacity).toBeLessThanOrEqual(last + 1e-6);
    expect((last - opacity) / Math.max(1, time - lastTime)).toBeLessThan(0.004);
  }
  expect(fade.at(-1)?.[1]).toBe(0);
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
  // screen. This guards the compositor path once a fade is on screen, which
  // a CSS fade passes too; the next case is what the animator changes.
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

test('Reduced Motion: the wheels cross-fade in at most 200 ms and the chevron dips instead of turning', async ({
  page,
}) => {
  // design:reduced-motion DR1/DR2 on a touch screen: opacity only (and the
  // discrete `visibility` that follows it), 200 ms or less, from the policy's
  // keys (motion/reducedMotion.ts); the chevron's turn applies at the middle
  // of its dip.
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, wheels, titleAt} = await openCalendar(page);
  await driver.tap(titleAt);
  const panel = await runningAnimations(page, '[data-panel="wheels"]');
  expect(panel.map(animation => animation.properties).flat()).toContain(
    'opacity',
  );
  for (const animation of panel) {
    for (const property of animation.properties) {
      expect(['opacity', 'visibility']).toContain(property);
    }
    expect(animation.duration).toBeLessThanOrEqual(200);
  }
  // The chevron dips; its turn is a zero-length transition at the dip's
  // middle, an instant change rather than travel.
  const chevron = (
    await runningAnimations(page, '[data-title="month-year"] .astryx-icon')
  ).filter(animation => animation.duration > 0);
  expect(chevron.length).toBeGreaterThan(0);
  for (const animation of chevron) {
    expect(animation.properties).toEqual(['opacity']);
    expect(animation.duration).toBeLessThanOrEqual(200);
  }
  const turn = await page
    .locator('[data-title="month-year"] .astryx-icon')
    .first()
    .evaluate(element => {
      const style = getComputedStyle(element);
      return {duration: style.transitionDuration, delay: style.transitionDelay};
    });
  expect(turn).toEqual({duration: '0s', delay: '0.1s'});
  await waitForRest(wheels);
});

test('in RTL the chevron points left, and turns to point down', async ({
  page,
}) => {
  const {driver, wheels, titleAt} = await openCalendar(page, {rtl: true});
  // Where the chevron's glyph (drawn pointing down) points on screen: its
  // transform (the turn, mirrored under RTL) applied to +y.
  const pointing = async () =>
    page.evaluate(() => {
      const icon = document.querySelector<HTMLElement>(
        '[data-title="month-year"] .astryx-icon',
      );
      if (icon == null) {
        throw new Error('no chevron');
      }
      const value = getComputedStyle(icon).transform;
      const matrix = new DOMMatrix(value === 'none' ? undefined : value);
      const p = matrix.transformPoint(new DOMPoint(0, 1));
      const q = matrix.transformPoint(new DOMPoint(0, 0));
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

/** The computed state of the hidden wheels panel and its fade. */
async function wheelsState(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate(element => {
      const style = getComputedStyle(element);
      return {
        visibility: style.visibility,
        opacity: style.opacity,
        inert: (element as HTMLElement).inert,
        ariaHidden: element.getAttribute('aria-hidden'),
        transitionProperty: style.transitionProperty,
        transitionDuration: style.transitionDuration,
        transitionTimingFunction: style.transitionTimingFunction,
        inlineOpacity: (element as HTMLElement).style.opacity,
      };
    });
}

for (const [name, story, selector] of [
  ['DateInput', STORY, '[data-panel="wheels"]'],
  ['DateTimeInput', DTI_STORY, '[data-date-surface="wheels"]'],
] as const) {
  test(`${name}: once the sheet settles, the hidden wheels are laid out at opacity 0, still inert`, async ({
    page,
  }) => {
    // Their cylinders' layers then exist before the title is tapped, so the
    // toggle's commit only changes opacity and Mobile Safari has nothing to
    // build inside the fade's first frames.
    if (story === STORY) {
      await openCalendar(page);
    } else {
      await openStory(page, storybook(), story);
      const driver = await touchDriver(page);
      const opener = page.getByRole('button', {name: /^Open /}).first();
      const box = await opener.boundingBox();
      if (box == null) {
        throw new Error('no opener');
      }
      await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
    }
    await expect(page.locator(selector)).toBeAttached();
    await expect
      .poll(async () => (await wheelsState(page, selector)).visibility, {
        timeout: SHEET_SETTLE_MS + 2000,
      })
      .toBe('visible');
    const state = await wheelsState(page, selector);
    expect(state.opacity).toBe('0');
    expect(state.inert).toBe(true);
    expect(state.ariaHidden).toBe('true');
  });
}

type CommitLog = {
  frame: number;
  panel: string;
  attribute: string | null;
  present: boolean;
  opacity: number;
  visibility: string;
  wheelsOpacity: number;
  pointerEvents: string;
}[];

for (const [name, story, titleSelector, panelSelector, panelKey] of [
  ['DateInput', STORY, '[data-title="month-year"]', '[data-panel]', 'panel'],
  [
    'DateTimeInput',
    DTI_STORY,
    'button[aria-label$="Choose month and year"]',
    '[data-date-surface]',
    'dateSurface',
  ],
] as const) {
  test(`${name}: the toggle's commit flips no inherited property on the panels; they swap inert when the fade ends`, async ({
    page,
  }) => {
    // `inert` and `pointer-events` are inherited: flipping either restyles a
    // panel's whole subtree. The toggle's commit changes the panels' classes
    // and `aria-hidden` only, a shield takes touches during the fade, and the
    // panels swap `inert` on the fade's end, when nothing moves.
    await openStory(page, storybook(), story);
    const driver = await touchDriver(page);
    const tapCenter = async (selector: string) => {
      const box = await page.locator(selector).first().boundingBox();
      if (box == null) {
        throw new Error(`no ${selector}`);
      }
      await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
    };
    await tapCenter('button[aria-label^="Open "]');
    const wheels = page
      .locator(`${panelSelector.slice(0, -1)}="wheels"]`)
      .first();
    await expect
      .poll(async () => wheels.evaluate(e => getComputedStyle(e).visibility), {
        timeout: SHEET_SETTLE_MS + 2000,
      })
      .toBe('visible');
    await page.evaluate(
      ({selector, key}) => {
        const state = {
          frames: 0,
          log: [] as CommitLog,
          shielded: null as boolean | null,
        };
        (window as unknown as {toggleCommit: typeof state}).toggleCommit =
          state;
        const tick = () => {
          state.frames += 1;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        const panels = [...document.querySelectorAll<HTMLElement>(selector)];
        const observer = new MutationObserver(records => {
          if (state.shielded == null) {
            // One frame into the fade: a touch on the panels' middle meets
            // the shield, not a control inside either panel.
            state.shielded = false;
            requestAnimationFrame(() => {
              const box = panels[0].getBoundingClientRect();
              const hit = document.elementFromPoint(
                box.left + box.width / 2,
                box.top + box.height / 2,
              );
              state.shielded =
                hit != null && !panels.some(panel => panel.contains(hit));
            });
          }
          for (const record of records) {
            const target = record.target as HTMLElement;
            const style = getComputedStyle(target);
            const wheelsPanel = panels.find(
              panel => panel.dataset[key] === 'wheels',
            );
            state.log.push({
              frame: state.frames,
              panel: target.dataset[key] ?? '',
              attribute: record.attributeName,
              present:
                record.attributeName != null &&
                target.hasAttribute(record.attributeName),
              opacity: Number(style.opacity),
              visibility: style.visibility,
              wheelsOpacity:
                wheelsPanel == null
                  ? NaN
                  : Number(getComputedStyle(wheelsPanel).opacity),
              pointerEvents: style.pointerEvents,
            });
          }
        });
        for (const panel of panels) {
          observer.observe(panel, {
            attributes: true,
            attributeFilter: ['class', 'inert', 'aria-hidden'],
          });
        }
      },
      {selector: panelSelector, key: panelKey},
    );
    await tapCenter(titleSelector);
    await waitForRest(wheels);
    await page.waitForTimeout(150);
    const {log, shielded} = await page.evaluate(
      () =>
        (
          window as unknown as {
            toggleCommit: {log: CommitLog; shielded: boolean | null};
          }
        ).toggleCommit,
    );
    expect(shielded).toBe(true);
    const commitFrame = log.find(entry => entry.attribute === 'class')?.frame;
    expect(commitFrame, JSON.stringify(log)).toBeDefined();
    for (const change of log.filter(
      entry => entry.attribute === 'class' && entry.frame === commitFrame,
    )) {
      expect(change.pointerEvents).toBe('auto');
    }
    // The outgoing calendar leaves assistive technology with the toggle.
    const hidden = log.find(
      entry =>
        entry.panel === 'calendar' &&
        entry.attribute === 'aria-hidden' &&
        entry.present,
    );
    expect(hidden?.frame, JSON.stringify(log)).toBe(commitFrame);
    // The incoming wheels go live when the fade ends, with the swap.
    const live = log.find(
      entry =>
        entry.panel === 'wheels' &&
        entry.attribute === 'inert' &&
        !entry.present,
    );
    expect(live, JSON.stringify(log)).toBeDefined();
    expect(live!.frame).toBeGreaterThan(commitFrame! + 2);
    // The outgoing calendar turns inert once the cross-fade has ended: faded
    // to 0 or hidden, or (the layer beneath, which stays visible under a
    // finger) fully covered by the wheels at opacity 1; never part way.
    const inert = log.find(
      entry =>
        entry.panel === 'calendar' &&
        entry.attribute === 'inert' &&
        entry.present,
    );
    expect(inert, JSON.stringify(log)).toBeDefined();
    expect(
      inert!.opacity === 0 ||
        inert!.visibility === 'hidden' ||
        inert!.wheelsOpacity === 1,
      JSON.stringify(inert),
    ).toBe(true);
    expect(inert!.frame).toBeGreaterThan(commitFrame! + 2);
  });
}

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('under Reduced Motion the toggle changes at once', async ({page}) => {
    // design:reduced-motion DR3: no animated property with a mouse.
    await page.emulateMedia({reducedMotion: 'reduce'});
    await openStory(page, storybook(), STORY);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    await page
      .getByRole('button', {name: /calendar/i})
      .first()
      .click();
    await expect(page.locator('[data-panel="wheels"]').first()).toBeAttached();
    const state = await wheelsState(page, '[data-panel="wheels"]');
    expect(state.transitionDuration).toBe('0s');
    const turn = await page
      .locator('[data-title="month-year"] .astryx-icon')
      .first()
      .evaluate(element => getComputedStyle(element).transitionDuration);
    expect(turn).toBe('0s');
  });

  test('today’s swap values survive: a linear opacity fade on --duration-fast', async ({
    page,
  }) => {
    await openStory(page, storybook(), STORY);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    await page
      .getByRole('button', {name: /calendar/i})
      .first()
      .click();
    const wheels = page.locator('[data-panel="wheels"]').first();
    await expect(wheels).toBeAttached();
    const state = await wheelsState(page, '[data-panel="wheels"]');
    const fast = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--duration-fast')
        .trim(),
    );
    expect(state.transitionProperty).toBe('opacity, visibility');
    expect(state.transitionTimingFunction).toBe('linear');
    expect(state.visibility).toBe('hidden');
    expect(fast).not.toBe('');
    const durationMs = (value: string) =>
      value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
    expect(durationMs(state.transitionDuration)).toBeCloseTo(
      durationMs(fast),
      3,
    );
  });
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
