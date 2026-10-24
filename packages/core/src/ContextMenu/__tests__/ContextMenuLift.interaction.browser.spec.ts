// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ContextMenuLift.interaction.browser.spec.ts
 * @input The built "Touch / long press" ContextMenu story, real touch input
 *   (Chromium CDP / WebKit's input command), the interaction harness, the
 *   context-menu constants and springs
 * @output Interaction and animation proofs for the lift presentation: a held
 *   card lifts to UIKit's size about its center over the theme's backdrop
 *   colour with the theme's shadow, the card itself still showing under its
 *   copy, with the menu 16 px below it and
 *   centered; a card near the bottom gets its menu above; a card at the left
 *   edge lifts 16 px in with its menu flush; the copy grows on from the
 *   press, and the backdrop fades in, on springs.contextMenuLift frame by
 *   frame; the menu enters from a blur on morphSpring; closing returns the
 *   copy and clears the backdrop; the copy keeps growing on every frame
 *   through a blocked main thread; under Reduce Motion the card does not grow
 *   and the copy lifts on a critically damped spring; a storyboard of the
 *   lift
 * @position Interaction specs of packages/core/src/ContextMenu, beside
 *   ContextMenuLongPress.interaction.browser.spec.ts (the press timeline)
 */

import {expect, test, type Page} from '@playwright/test';
import {
  animationStoryboard,
  busyWindowProof,
  castStoryboard,
  holdAnimations,
  openStory,
  releaseAnimations,
  seekAnimations,
  startScreencast,
  tap,
  timeline,
  touchDriver,
  trackMarker,
  withStorybook,
  writeEvidence,
  type BusyWindow,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {solveSpring, toSpring} from '../../motion/spring';
import {contextMenu, springs} from '../../motion/uikit';
import {emulateIosWebKit} from './emulateIosWebKit';

const storybook = withStorybook(test);
const {menuDisplayMs} = contextMenu.press;
const {menuGap, screenInset, verticalMargin} = contextMenu.lift;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LiftStory {
  driver: TouchDriver;
  center: {x: number; y: number};
}

/**
 * Opens the story; `moveCard` gets the card's box and returns the offset
 * (CSS px) to move it by, for the placement cases.
 */
async function openLiftStory(
  page: Page,
  moveCard?: (
    box: Box,
    viewport: {width: number; height: number},
  ) => {
    dx: number;
    dy: number;
  },
): Promise<LiftStory> {
  // The lift is the iOS idiom's: Chromium and desktop WebKit take it here
  // through the emulated gate (emulateIosWebKit.ts).
  await emulateIosWebKit(page);
  await openStory(page, storybook(), 'core-contextmenu--touch-long-press');
  const trigger = page.getByTestId('touch-context-menu');
  let box = await trigger.boundingBox();
  if (box == null) {
    throw new Error('no trigger');
  }
  if (moveCard != null) {
    const viewport = page.viewportSize();
    if (viewport == null) {
      throw new Error('no viewport');
    }
    const {dx, dy} = moveCard(box, viewport);
    await trigger.evaluate(
      (el, offset) => {
        const host = el as HTMLElement;
        host.style.position = 'relative';
        host.style.left = `${offset.dx}px`;
        host.style.top = `${offset.dy}px`;
      },
      {dx, dy},
    );
    box = await trigger.boundingBox();
    if (box == null) {
      throw new Error('no trigger');
    }
  }
  return {
    driver: await touchDriver(page),
    center: {x: box.x + box.width / 2, y: box.y + box.height / 2},
  };
}

/** The card, its lifted copy, the menu's popover and the backdrop, now. */
async function readLift(page: Page) {
  return page.evaluate(() => {
    const rect = (el: Element | null | undefined) => {
      if (el == null) {
        return null;
      }
      const r = el.getBoundingClientRect();
      return {x: r.x, y: r.y, width: r.width, height: r.height};
    };
    const card = document.querySelector('[data-testid="touch-context-menu"]');
    const backdrop = document.querySelector(
      '[data-astryx-context-menu-lift] > span',
    );
    return {
      card: rect(card),
      cardOpacity: card == null ? null : getComputedStyle(card).opacity,
      preview: rect(
        document.querySelector('[data-astryx-context-menu-preview]'),
      ),
      menu: rect(document.querySelector('[role="menu"]')?.closest('[popover]')),
      backdropColor:
        backdrop == null ? null : getComputedStyle(backdrop).backgroundColor,
      shadow: (() => {
        const layer = document.querySelector(
          '[data-astryx-context-menu-shadow]',
        );
        if (layer == null) {
          return null;
        }
        const style = getComputedStyle(layer);
        return {opacity: Number(style.opacity), boxShadow: style.boxShadow};
      })(),
      backdropOpacity:
        backdrop == null ? null : Number(getComputedStyle(backdrop).opacity),
      layerOpen:
        document
          .querySelector('[data-astryx-context-menu-lift]')
          ?.matches(':popover-open') ?? false,
    };
  });
}

/**
 * Marks every element matching `selector` (the component creates them) for
 * the screencast tracker: an inset outline in the harness's marker colour.
 */
async function markSelector(page: Page, selector: string) {
  await page.evaluate(sel => {
    const style = document.createElement('style');
    style.textContent = `${sel}{outline:6px solid rgb(255,0,255) !important;outline-offset:-6px !important;}`;
    document.head.append(style);
  }, selector);
}

/**
 * Holds the main thread `ms` long, `afterMs` after the next touch lands (a
 * timer set in the touch's own task, so it runs on the page's clock). Returns
 * a reader for the window it held, epoch ms.
 */
async function blockAfterTouch(
  page: Page,
  afterMs: number,
  ms: number,
): Promise<() => Promise<BusyWindow>> {
  await page.evaluate(
    ({at, length}) => {
      addEventListener(
        'touchstart',
        () => {
          setTimeout(() => {
            const from = performance.timeOrigin + performance.now();
            const end = performance.now() + length;
            while (performance.now() < end) {
              // Held: no task, frame or event runs.
            }
            (window as unknown as {__busy: BusyWindow}).__busy = {
              from,
              to: performance.timeOrigin + performance.now(),
            };
          }, at);
        },
        {once: true, capture: true, passive: true},
      );
    },
    {at: afterMs, length: ms},
  );
  return async () =>
    page.evaluate(() => (window as unknown as {__busy: BusyWindow}).__busy);
}

/** A finger held until the menu shows, then lifted (the menu stays). */
async function liftAndSettle(page: Page, {driver, center}: LiftStory) {
  await driver.play(tap(center, {holdMs: menuDisplayMs + 100}));
  await expect(page.getByRole('menu', {name: 'Photo actions'})).toBeVisible();
  // The lift settles within about half a second.
  await page.waitForTimeout(800);
  return readLift(page);
}

test('a held card lifts to UIKit’s size about its center over the theme’s dim and shadow, the card still under it, its menu 16 px below and centered', async ({
  page,
}) => {
  const story = await openLiftStory(page);
  // Closed, the lift layer takes no room and no touches.
  await expect(page.locator('[data-astryx-context-menu-lift]')).toBeHidden();
  const lift = await liftAndSettle(page, story);
  const {card, preview, menu} = lift;
  if (card == null || preview == null || menu == null) {
    throw new Error(JSON.stringify(lift));
  }
  const detail = JSON.stringify(lift);
  // 200 × 120 lifts by 26 pt on its longer side: 226 × 135.6.
  expect(preview.width, detail).toBeCloseTo(226, 0);
  expect(preview.height, detail).toBeCloseTo(135.6, 0);
  expect(preview.x + preview.width / 2, detail).toBeCloseTo(
    card.x + card.width / 2,
    0,
  );
  expect(preview.y + preview.height / 2, detail).toBeCloseTo(
    card.y + card.height / 2,
    0,
  );
  expect(lift.cardOpacity, detail).toBe('1');
  // The theme's modal dim (`--color-background-backdrop`; this story's theme
  // sets its own), fully faded in.
  // An rgb() colour is opaque; an rgba() one carries its alpha last.
  const dimAlpha = /^rgba\((?:[^,]+,){3}\s*([\d.]+)\)$/u.exec(
    lift.backdropColor ?? '',
  );
  expect(lift.backdropColor, detail).toMatch(/^rgba?\(/u);
  expect(Number(dimAlpha?.[1] ?? 1), detail).toBeGreaterThan(0);
  // The theme's high shadow, faded in under the copy.
  expect(lift.shadow?.opacity, detail).toBeCloseTo(1, 2);
  expect(lift.shadow?.boxShadow, detail).not.toBe('none');
  expect(lift.backdropOpacity, detail).toBeCloseTo(1, 2);
  expect(menu.y, detail).toBeCloseTo(preview.y + preview.height + menuGap, 0);
  expect(menu.x + menu.width / 2, detail).toBeCloseTo(
    preview.x + preview.width / 2,
    0,
  );
});

test('a card near the bottom gets its menu above, and its copy stays 20 px clear of the bottom', async ({
  page,
}) => {
  const story = await openLiftStory(page, (box, viewport) => ({
    dx: 0,
    // The card's bottom 10 px from the viewport's.
    dy: viewport.height - 10 - (box.y + box.height),
  }));
  const lift = await liftAndSettle(page, story);
  const {preview, menu} = lift;
  if (preview == null || menu == null) {
    throw new Error(JSON.stringify(lift));
  }
  const viewport = page.viewportSize();
  const detail = JSON.stringify({lift, viewport});
  expect(preview.y + preview.height, detail).toBeCloseTo(
    (viewport?.height ?? NaN) - verticalMargin,
    0,
  );
  expect(menu.y + menu.height, detail).toBeCloseTo(preview.y - menuGap, 0);
});

test('a card at the left edge lifts 16 px in, and its menu is flush with it', async ({
  page,
}) => {
  const story = await openLiftStory(page, box => ({dx: 4 - box.x, dy: 0}));
  const lift = await liftAndSettle(page, story);
  const {preview, menu} = lift;
  if (preview == null || menu == null) {
    throw new Error(JSON.stringify(lift));
  }
  const detail = JSON.stringify(lift);
  expect(preview.x, detail).toBeCloseTo(screenInset, 0);
  expect(menu.x, detail).toBeCloseTo(screenInset, 0);
});

test('the copy grows on from the press, and the backdrop fades in, on springs.contextMenuLift, frame by frame', async ({
  page,
}, testInfo) => {
  const {driver, center} = await openLiftStory(page);
  const playing = driver.play(tap(center, {holdMs: menuDisplayMs + 600}));
  const preview = page.locator('[data-astryx-context-menu-preview]');
  await expect(preview).toBeAttached({timeout: 5_000});
  await holdAnimations(page);
  const samples: {t: number; scale: number; backdrop: number}[] = [];
  for (const t of timeline(450)) {
    await seekAnimations(page, t);
    samples.push({
      t,
      ...(await page.evaluate(() => {
        const copy = document.querySelector(
          '[data-astryx-context-menu-preview]',
        );
        const backdrop = document.querySelector(
          '[data-astryx-context-menu-lift] > span',
        );
        const scale = copy == null ? 'none' : getComputedStyle(copy).scale;
        return {
          scale: scale === 'none' ? 1 : Number.parseFloat(scale),
          backdrop:
            backdrop == null ? NaN : Number(getComputedStyle(backdrop).opacity),
        };
      })),
    });
  }
  await releaseAnimations(page);
  await playing;
  const from = samples[0].scale;
  const scale = solveSpring(toSpring(springs.contextMenuLift), {
    from,
    to: 1.13,
  });
  const fade = solveSpring(toSpring(springs.contextMenuLift), {from: 0, to: 1});
  const errors = samples.map(s => ({
    t: s.t,
    widthErrorPx: Math.abs(s.scale - scale.value(s.t / 1000)) * 200,
    // Opacity stops at 1: the spring's 1.5% overshoot (UIKit's alpha peaks
    // at 1.0145 too) presents as 1.
    backdropError: Math.abs(s.backdrop - Math.min(1, fade.value(s.t / 1000))),
  }));
  await writeEvidence(
    'curves/contextmenu-lift',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {from, samples, errors},
        null,
        1,
      ),
    },
    testInfo,
  );
  // The press left the card at about 1.06 (UIKit: 1.0618 at 733 ms).
  expect(from).toBeGreaterThan(1.04);
  expect(from).toBeLessThan(1.07);
  expect(Math.max(...errors.map(e => e.widthErrorPx))).toBeLessThan(0.3);
  expect(Math.max(...errors.map(e => e.backdropError))).toBeLessThan(0.01);
  // It overshoots, as UIKit's does (226.39 pt at +279 ms).
  expect(Math.max(...samples.map(s => s.scale))).toBeGreaterThan(1.13);
});

test('the menu enters from a blur, on morphSpring, and settles sharp', async ({
  page,
}) => {
  const {driver, center} = await openLiftStory(page);
  const playing = driver.play(tap(center, {holdMs: menuDisplayMs + 600}));
  await expect(page.getByRole('menu', {name: 'Photo actions'})).toBeVisible();
  await holdAnimations(page);
  const read = async (t: number) => {
    await seekAnimations(page, t);
    return page.evaluate(() => {
      const popover = document
        .querySelector('[role="menu"]')
        ?.closest('[popover]');
      if (popover == null) {
        return null;
      }
      const style = getComputedStyle(popover);
      const blur = /blur\(([\d.]+)px\)/u.exec(style.filter);
      return {
        opacity: Number(style.opacity),
        blur: blur == null ? 0 : Number(blur[1]),
      };
    });
  };
  const start = await read(0);
  const middle = await read(100);
  const end = await read(600);
  await releaseAnimations(page);
  await playing;
  const curve = solveSpring(toSpring(contextMenu.lift.morphSpring), {
    from: 0,
    to: 1,
  });
  const detail = JSON.stringify({start, middle, end});
  expect(start?.opacity, detail).toBeCloseTo(0, 2);
  expect(start?.blur, detail).toBeCloseTo(contextMenu.lift.menuEntranceBlur, 1);
  expect(middle?.opacity, detail).toBeCloseTo(curve.value(0.1), 1);
  expect(end?.opacity, detail).toBeCloseTo(1, 2);
  expect(end?.blur, detail).toBeCloseTo(0, 1);
});

test('closing returns the copy to the card and clears the backdrop', async ({
  page,
}) => {
  const story = await openLiftStory(page);
  await liftAndSettle(page, story);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu', {name: 'Photo actions'})).toBeHidden();
  await page.waitForTimeout(900);
  const after = await readLift(page);
  const detail = JSON.stringify(after);
  expect(after.preview, detail).toBeNull();
  expect(after.layerOpen, detail).toBe(false);
  expect(after.cardOpacity, detail).toBe('1');
});

test('a tap on the backdrop closes the menu and reaches nothing under it', async ({
  page,
}) => {
  const story = await openLiftStory(page);
  const lift = await liftAndSettle(page, story);
  if (lift.card == null) {
    throw new Error(JSON.stringify(lift));
  }
  await page.evaluate(() => {
    const w = window as unknown as {__clicked?: string[]};
    w.__clicked = [];
    document.addEventListener(
      'click',
      event => {
        const target = event.target as Element;
        w.__clicked?.push(
          target.closest('[data-astryx-context-menu-lift]')
            ? 'backdrop'
            : target.closest('[data-testid="touch-context-menu"]')
              ? 'card'
              : target.tagName.toLowerCase(),
        );
      },
      {capture: true},
    );
  });
  // On the card's own spot, under the backdrop, clear of the copy's edge.
  await story.driver.play(
    tap({x: lift.card.x + 10, y: lift.card.y + lift.card.height + 8}),
  );
  await expect(page.getByRole('menu', {name: 'Photo actions'})).toBeHidden();
  const clicked = await page.evaluate(
    () => (window as unknown as {__clicked?: string[]}).__clicked ?? [],
  );
  expect(clicked.filter(target => target !== 'backdrop')).toEqual([]);
});

test('outside the iOS idiom (Chromium’s own finger, as on Android) nothing lifts: the menu opens at 500 ms under the finger, with no copy, dim or shadow', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Android’s fallback runs in Chromium (its engine), without the iOS shim',
  );
  await openStory(page, storybook(), 'core-contextmenu--touch-long-press');
  const trigger = page.getByTestId('touch-context-menu');
  const box = await trigger.boundingBox();
  if (box == null) {
    throw new Error('no trigger');
  }
  const center = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  const driver = await touchDriver(page);
  await driver.play(tap(center, {holdMs: 600}));
  const menu = page.getByRole('menu', {name: 'Photo actions'});
  await expect(menu).toBeVisible();
  const state = await page.evaluate(() => ({
    layer: document.querySelector('[data-astryx-context-menu-lift]') != null,
    preview:
      document.querySelector('[data-astryx-context-menu-preview]') != null,
    cardScale: getComputedStyle(
      document.querySelector('[data-testid="touch-context-menu"]') as Element,
    ).scale,
  }));
  const menuBox = await menu.boundingBox();
  expect(state).toEqual({layer: false, preview: false, cardScale: 'none'});
  // Under the finger: the menu opens at the press point.
  expect(menuBox).not.toBeNull();
  expect(Math.abs((menuBox?.x ?? 0) - center.x)).toBeLessThan(24);
  expect(Math.abs((menuBox?.y ?? 0) - center.y)).toBeLessThan(24);
});

test('the lift keeps moving while the main thread is blocked: the copy grows on every frame', async ({
  page,
  browserName,
}, testInfo) => {
  // Measured: Linux WebKit's compositor stalls with its main thread (no
  // frames for most of a block, the copy frozen). iOS Safari keeps the copy
  // growing through the block: the simulator recording.
  test.skip(
    browserName !== 'chromium',
    'Linux WebKit’s compositor stalls with its main thread; iOS Safari is the simulator recording',
  );
  const {driver, center} = await openLiftStory(page);
  await markSelector(page, '[data-astryx-context-menu-preview]');
  // Blocked from 20 ms after the menu's moment, while the copy grows.
  const busyWindow = await blockAfterTouch(page, menuDisplayMs + 20, 350);
  const cast = await startScreencast(page);
  await driver.play(tap(center, {holdMs: menuDisplayMs + 900}));
  const castFrames = await cast.stop();
  const block = await busyWindow();
  const tracked = await trackMarker(page, castFrames);
  const proof = busyWindowProof(tracked, block, {
    axis: 'width',
    settledWithin: 1,
  });
  await writeEvidence(
    'busy-main-thread/contextmenu-lift',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {
          block,
          proof,
          frames: tracked.map(f => ({
            t: +(f.t - block.from).toFixed(1),
            w: f.box?.width ?? null,
          })),
        },
        null,
        1,
      ),
    },
    testInfo,
  );
  const film = await castStoryboard(page, castFrames, {
    name: 'contextmenu-lift-busy-main-thread',
    zero: block.from,
    from: block.from - 40,
    to: block.to + 40,
    columns: 8,
    cellScale: 0.35,
    data: t => ({w: tracked.find(f => f.t === t)?.box?.width ?? -1}),
  });
  await film.write(testInfo, {block});
  // Frames kept coming at display rate and the copy kept growing.
  expect(proof.medianFrameMs).toBeLessThan(20);
  expect(proof.frames).toBeGreaterThanOrEqual(proof.expectedFrames - 2);
  expect(proof.monotonic).toBe(true);
  expect(proof.longestStallMs).toBeLessThan(4 * (1000 / 60) + 4);
  expect((proof.last ?? 0) - (proof.first ?? 0)).toBeGreaterThanOrEqual(4);
});

test('under Reduce Motion the card does not grow under the finger, and the copy lifts on a critically damped spring, without overshoot', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const {driver, center} = await openLiftStory(page);
  const playing = driver.play(tap(center, {holdMs: menuDisplayMs + 600}));
  const preview = page.locator('[data-astryx-context-menu-preview]');
  await expect(preview).toBeAttached({timeout: 5_000});
  await holdAnimations(page);
  const times = timeline(600);
  const scales: number[] = [];
  for (const t of times) {
    await seekAnimations(page, t);
    scales.push(
      await preview.evaluate(el => {
        const scale = getComputedStyle(el).scale;
        return scale === 'none' ? 1 : Number.parseFloat(scale);
      }),
    );
  }
  await releaseAnimations(page);
  await playing;
  const curve = solveSpring(toSpring(springs.menuReducedMotion), {
    from: 1,
    to: 1.13,
  });
  const detail = JSON.stringify(scales);
  // No press growth: the copy starts at the card's own size, and settles at
  // the lift scale without going past it.
  expect(scales[0], detail).toBeCloseTo(1, 3);
  expect(Math.max(...scales), detail).toBeLessThanOrEqual(1.13 + 1e-3);
  expect(
    scales.every((v, i) => i === 0 || v >= scales[i - 1] - 1e-4),
    detail,
  ).toBe(true);
  expect(scales.at(-1), detail).toBeCloseTo(1.13, 2);
  for (const [i, t] of times.entries()) {
    expect(Math.abs(scales[i] - curve.value(t / 1000)), detail).toBeLessThan(
      0.003,
    );
  }
});

test(
  'storyboard: the lift, from the menu’s moment',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, center} = await openLiftStory(page);
    const playing = driver.play(tap(center, {holdMs: menuDisplayMs + 900}));
    await expect(
      page.locator('[data-astryx-context-menu-preview]'),
    ).toBeAttached({timeout: 5_000});
    const viewport = page.viewportSize();
    const {storyboard} = await animationStoryboard(page, {
      name: 'contextmenu-lift',
      clip: {
        x: 0,
        y: Math.max(0, center.y - 120),
        width: viewport?.width ?? 402,
        height: 360,
      },
      times: timeline(450, 1000 / 30),
      measure: async () =>
        page.evaluate(() => {
          const copy = document.querySelector(
            '[data-astryx-context-menu-preview]',
          );
          const backdrop = document.querySelector(
            '[data-astryx-context-menu-lift] > span',
          );
          return {
            width: copy?.getBoundingClientRect().width.toFixed(1) ?? '-',
            backdrop:
              backdrop == null
                ? '-'
                : Number(getComputedStyle(backdrop).opacity).toFixed(3),
          };
        }),
      columns: 5,
      cellScale: 0.5,
    });
    await releaseAnimations(page);
    await playing;
    await storyboard.write(testInfo);
    const widths = storyboard.frames.map(f => Number(f.data.width));
    expect(widths.at(-1)).toBeCloseTo(226, 0);
  },
);
