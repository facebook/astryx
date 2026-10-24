// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ButtonPressRelease.interaction.browser.spec.ts
 * @input The built press feedback Buttons story and the ClickableCard story,
 *   real touch input (Chromium CDP / WebKit's input command), the interaction
 *   harness, and UIButton's release clock and curve from the UIKit constants
 *   table (motion/uikit/button.ts)
 * @output Animation proofs for a control's press release on the
 *   compositor: it follows UIButton's curve on the button's layer and on a
 *   card's `::after` (sampled frame by frame, both engines), keeps fading on
 *   every frame while the main thread is blocked, and does no Layout or
 *   Paint; a storyboard of the release, its trace asserted
 * @position Interaction evidence for utils/pressLayer.stylex.ts (`control`,
 *   `controlOver`) as Button and the cards compose it; the tracking itself is
 *   proven in ButtonPress.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  blockMainThread,
  castStoryboard,
  compareCurve,
  countBetween,
  cubicBezier,
  freezeTimers,
  holdAnimations,
  installTimerGate,
  openStory,
  releaseAnimations,
  seekAnimations,
  startScreencast,
  tap,
  thawTimers,
  timeline,
  touchDriver,
  traceRendering,
  waitForAnimation,
  withStorybook,
  writeEvidence,
  type CastFrame,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {button} from '../../motion/uikit/button';

const storybook = withStorybook(test);

const RELEASE_MS = button.highlight.releaseMs;
const releaseEase = cubicBezier(...button.highlight.releaseCurve);
/** The layer's opacity t ms into the release: the strength, 1 → 0. */
const expectedStrength = (t: number) =>
  1 - releaseEase(Math.min(1, Math.max(0, t / RELEASE_MS)));
/** A held press, then the lift: the release starts at the lift. */
const HOLD_MS = 400;

const BUTTONS = 'core-press-feedback-touch--buttons';
const CARD = 'core-clickablecard--with-on-click';

interface Opened {
  driver: TouchDriver;
  surface: Locator;
  center: {x: number; y: number};
  /** A point on the surface's fill, clear of its label, CSS px. */
  probe: {x: number; y: number};
  /** What the page saw, on its own clock (performance.now()). */
  log: () => Promise<LogEntry[]>;
}

type LogEntry = [kind: string, t: number, value: string | null];

async function openSurface(
  page: Page,
  story: string,
  surface: (page: Page) => Locator,
  probeAt: (box: {width: number; height: number}) => {
    x: number;
    y: number;
  } = box => ({
    x: box.width - 6,
    y: box.height / 2,
  }),
): Promise<Opened> {
  await openStory(page, storybook(), story);
  const driver = await touchDriver(page);
  const element = surface(page);
  await expect(element).toBeVisible();
  const box = await element.boundingBox();
  if (box == null) {
    throw new Error(`${story}: the surface has no box`);
  }
  const offset = probeAt(box);
  await element.evaluate(el => {
    const entries: LogEntry[] = [];
    (window as unknown as {__press: LogEntry[]}).__press = entries;
    for (const type of ['pointerdown', 'pointerup', 'pointercancel', 'click']) {
      document.addEventListener(
        type,
        () => entries.push([type, performance.now(), null]),
        true,
      );
    }
    new MutationObserver(records => {
      for (const record of records) {
        entries.push([
          'press',
          performance.now(),
          (record.target as Element).getAttribute('data-astryx-press'),
        ]);
      }
    }).observe(el, {attributes: true, attributeFilter: ['data-astryx-press']});
  });
  return {
    driver,
    surface: element,
    center: {x: box.x + box.width / 2, y: box.y + box.height / 2},
    probe: {x: Math.round(box.x + offset.x), y: Math.round(box.y + offset.y)},
    log: async () =>
      page.evaluate(() => (window as unknown as {__press: LogEntry[]}).__press),
  };
}

const secondaryButton = (page: Page) =>
  page.getByRole('button', {name: 'Secondary', exact: true});
const card = (page: Page) =>
  page.locator('#storybook-root [data-astryx-pressable]').first();

/** Opacity of a surface's press layer, as the engine presents it. */
const layerOpacity = async (surface: Locator, pseudo: '::before' | '::after') =>
  surface.evaluate(
    (el, which) => Number(getComputedStyle(el, which).opacity),
    pseudo,
  );

for (const [name, story, locate, pseudo] of [
  ['a button', BUTTONS, secondaryButton, '::before'],
  ['a card', CARD, card, '::after'],
] as const) {
  test(`the release of ${name} follows UIButton’s curve, sampled frame by frame`, async ({
    page,
  }, testInfo) => {
    const opened = await openSurface(page, story, locate);
    if (pseudo === '::before') {
      expect(await layerOpacity(opened.surface, pseudo)).toBe(0);
    }
    // Gate the page's timers before the press, so the release timer (which
    // removes the attribute when the clock runs out) holds while seeking.
    await installTimerGate(page);
    await opened.driver.play(tap(opened.center, {holdMs: HOLD_MS}));
    expect(await opened.surface.getAttribute('data-astryx-press')).toBe(
      'fading',
    );
    await freezeTimers(page);
    const held = await holdAnimations(page, opened.surface);
    const release = held.find(
      a => a.kind === 'CSSAnimation' && a.durationMs === RELEASE_MS,
    );
    expect(release, JSON.stringify(held)).toBeDefined();
    const samples: {t: number; value: number}[] = [];
    for (const t of timeline(RELEASE_MS)) {
      await seekAnimations(page, t);
      samples.push({t, value: await layerOpacity(opened.surface, pseudo)});
    }
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    const comparison = compareCurve(samples, expectedStrength, 0.005);
    await writeEvidence(
      `curves/${story}-press-release`,
      {
        [`${testInfo.project.name}.json`]: JSON.stringify(
          {
            releaseMs: RELEASE_MS,
            curve: button.highlight.releaseCurve,
            held,
            samples,
            comparison,
          },
          null,
          2,
        ),
      },
      testInfo,
    );
    expect(samples[0].value).toBeCloseTo(1, 2);
    expect(
      comparison.maxError,
      JSON.stringify(comparison.worst),
    ).toBeLessThanOrEqual(0.005);
    await expect
      .poll(async () => opened.surface.getAttribute('data-astryx-press'))
      .toBeNull();
  });
}

interface PixelFrame {
  readonly t: number;
  /** Mean of the RGB channels at the probe point, 0–255. */
  readonly value: number;
}

/** The probe point's value in every frame, decoded in a scratch page. */
async function samplePixel(
  page: Page,
  frames: ReadonlyArray<CastFrame>,
  probe: {x: number; y: number},
): Promise<PixelFrame[]> {
  const scratch = await page.context().newPage();
  try {
    const out: PixelFrame[] = [];
    for (let i = 0; i < frames.length; i += 12) {
      const batch = frames.slice(i, i + 12);
      const values = await scratch.evaluate(
        async ({items, at}) => {
          const results: number[] = [];
          for (const item of items) {
            const bitmap = await createImageBitmap(
              await (
                await fetch(`data:image/${item.format};base64,${item.data}`)
              ).blob(),
            );
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const context = canvas.getContext('2d');
            if (context == null) {
              throw new Error('no 2d context');
            }
            context.drawImage(bitmap, 0, 0);
            const scale = bitmap.width / item.viewportWidth;
            const px = context.getImageData(
              Math.round(at.x * scale),
              Math.round(at.y * scale),
              1,
              1,
            ).data;
            results.push((px[0] + px[1] + px[2]) / 3);
          }
          return results;
        },
        {
          items: batch.map(f => ({
            data: f.data,
            format: f.format,
            viewportWidth: f.viewportWidth,
          })),
          at: probe,
        },
      );
      values.forEach((value, k) => out.push({t: batch[k].t, value}));
    }
    return out;
  } finally {
    await scratch.close();
  }
}

test('the release of a button keeps fading on every frame while the main thread is blocked', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== 'chromium',
    'screencast frame evidence is Chromium-only in Playwright; the iOS simulator covers Safari',
  );
  const opened = await openSurface(page, BUTTONS, secondaryButton);
  const cast = await startScreencast(page);
  await opened.driver.play(tap(opened.center, {holdMs: HOLD_MS}));
  const [release] = await waitForAnimation(opened.surface, {minProgressMs: 16});
  const block = await blockMainThread(page, 700);
  await page.waitForTimeout(150);
  const frames = await cast.stop();
  const pixels = await samplePixel(page, frames, opened.probe);
  const rest = pixels[0].value;
  const pressed = Math.min(
    ...pixels.filter(p => p.t < release.from).map(p => p.value),
  );
  const strength = (v: number) => (rest - v) / (rest - pressed);
  const end = Math.min(block.to, release.to) - 10;
  const during = pixels.filter(p => p.t > block.from && p.t <= end);
  const strengths = during.map(p => ({
    t: +(p.t - block.from).toFixed(1),
    strength: +strength(p.value).toFixed(3),
  }));
  const intervals = during
    .map((p, i) => (i === 0 ? p.t - block.from : p.t - during[i - 1].t))
    .filter(dt => dt > 0);
  const longestGap = Math.max(
    end - (during.at(-1)?.t ?? block.from),
    ...intervals,
  );
  await writeEvidence(
    'busy-main-thread/button-press-release',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {block, release, rest, pressed, strengths},
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, frames, {
    name: 'button-press-release-busy-main-thread',
    zero: block.from,
    from: release.from - 40,
    to: release.to + 40,
    columns: 6,
    cellScale: 0.45,
    data: t => {
      const p = pixels.find(f => f.t === t);
      return {strength: p == null ? -1 : +strength(p.value).toFixed(3)};
    },
  });
  await film.write(testInfo, {block, release});
  expect(rest - pressed).toBeGreaterThan(10);
  expect(during.length, JSON.stringify(strengths)).toBeGreaterThanOrEqual(
    Math.floor((end - block.from) / (1000 / 60)) - 2,
  );
  expect(longestGap).toBeLessThan(40);
  for (let i = 1; i < strengths.length; i++) {
    expect(strengths[i].strength).toBeLessThanOrEqual(
      strengths[i - 1].strength + 0.01,
    );
  }
  const last = strengths.at(-1);
  expect(last).toBeDefined();
  expect(strengths[0].strength).toBeGreaterThan((last?.strength ?? 1) + 0.2);
});

test('the release of a button does no Layout or Paint per frame', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'rendering traces are Chromium-only');
  const opened = await openSurface(page, BUTTONS, secondaryButton);
  let release = {from: 0, to: 0};
  const trace = await traceRendering(page, async () => {
    await opened.driver.play(tap(opened.center, {holdMs: HOLD_MS}));
    [release] = await waitForAnimation(opened.surface);
    await page.waitForTimeout(RELEASE_MS + 100);
  });
  // The steady part of the release: its first and last frames may commit.
  const during = countBetween(trace, release.from + 30, release.to - 30);
  expect(during.Layout ?? 0, JSON.stringify(during)).toBe(0);
  expect(during.Paint ?? 0, JSON.stringify(during)).toBe(0);
});

test(
  'storyboard: a button released after a hold',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const opened = await openSurface(page, BUTTONS, secondaryButton);
    await installTimerGate(page);
    const box = await opened.surface.boundingBox();
    if (box == null) {
      throw new Error('no button');
    }
    const clip = {
      x: Math.max(0, box.x - 16),
      y: Math.max(0, box.y - 16),
      width: box.width + 32,
      height: box.height + 32,
    };
    await opened.driver.play(tap(opened.center, {holdMs: HOLD_MS}));
    await freezeTimers(page);
    const {storyboard} = await animationStoryboard(page, {
      name: 'button-press-release',
      clip,
      scope: opened.surface,
      times: timeline(RELEASE_MS),
      measure: async () => ({
        opacity: await layerOpacity(opened.surface, '::before'),
        state: await opened.surface.getAttribute('data-astryx-press'),
      }),
      columns: 8,
      cellScale: 0.6,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await storyboard.write(testInfo);
    const opacities = storyboard.frames.map(f => f.data.opacity as number);
    expect(opacities[0]).toBeCloseTo(1, 2);
    expect(opacities.at(-1)).toBeLessThan(0.01);
    for (let i = 1; i < opacities.length; i++) {
      expect(opacities[i]).toBeLessThanOrEqual(opacities[i - 1] + 1e-6);
    }
    storyboard.frames.forEach(f =>
      expect(f.data.opacity as number).toBeCloseTo(expectedStrength(f.t), 2),
    );
  },
);
