// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuActionSheet.interaction.browser.spec.ts
 * @input The built "Presentation / action sheet card" DropdownMenu story on the
 *   phone profile, real touch input, the interaction harness and the alert
 *   entries of the UIKit constants table
 * @output Proofs for the action sheet's iOS 26 presentation on a phone under
 *   a finger (one touch model on every engine):
 *   an alert-style card that presents from scale 1.2 (capped at the viewport
 *   width) and opacity 0 with its
 *   dimming on the alert spring; a finger that lands on one action and lifts
 *   on another runs the one it lifts on, once; a tap outside dismisses it with
 *   a fade alone; storyboards of the present and the dismiss. A mouse keeps the
 *   bottom sheet
 * @position Evidence for DropdownMenu's action-sheet card
 *   (MenuActionSheetCard); the alert motion and the group tracking it reuses
 *   have their own proofs beside AlertDialog
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  compareCurve,
  drag,
  tap,
  freezeTimers,
  installTimerGate,
  openStory,
  releaseAnimations,
  springStep,
  thawTimers,
  timeline,
  touchDriver,
  waitForAnimation,
  withStorybook,
  writeEvidence,
  type Point,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {alertController} from '../../motion/uikit/alert';
import {springs} from '../../motion/uikit/springs';

/** The element's rendered box; a missing one fails the spec. */
async function boxOf(locator: Locator): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
}> {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('the element has no rendered box');
  }
  return box;
}

/** The page's viewport; every spec here sets one. */
function viewportOf(page: Page): {width: number; height: number} {
  const viewport = page.viewportSize();
  if (viewport == null) {
    throw new Error('no viewport');
  }
  return viewport;
}

/** The last sample; an empty series fails the spec. */
function lastOf<T>(values: ReadonlyArray<T>): T {
  if (values.length === 0) {
    throw new Error('no samples');
  }
  return values[values.length - 1];
}

const storybook = withStorybook(test);

function progressOf(spring: {
  mass: number;
  stiffness: number;
  damping: number;
}): (t: number) => number {
  const response = (2 * Math.PI) / Math.sqrt(spring.stiffness / spring.mass);
  const dampingFraction =
    spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass));
  return t => springStep({response, dampingFraction}, t);
}

const present = progressOf(springs.alertPresent);
const dismiss = progressOf(springs.alertDismiss);
const {scaleFrom} = alertController.present;

/**
 * The scale the card presents from: UIKit's 1.2, capped so the scaled card is
 * never wider than the viewport (useAlertMotion's presentScaleFrom).
 */
const presentedFrom = async (card: Locator) =>
  card.evaluate(
    (el, from) =>
      Math.max(
        1,
        Math.min(
          from,
          document.documentElement.clientWidth /
            (el as HTMLElement).offsetWidth,
        ),
      ),
    scaleFrom,
  );
const PRESENT_MS = alertController.present.durationMs;
const DISMISS_MS = alertController.dismiss.durationMs;
const OPACITY_TOLERANCE = 0.004;
const SCALE_TOLERANCE = 0.001;

const centerOf = async (locator: Locator): Promise<Point> => {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
};

interface Opened {
  driver: TouchDriver;
  trigger: Locator;
  card: Locator;
}

/** Opens the story with the sheet closed (the story opens it on load). */
async function openPage(page: Page): Promise<Opened> {
  await openStory(
    page,
    storybook(),
    'core-dropdownmenu--action-sheet-card-presentation',
  );
  await page.evaluate(() => {
    const picked: string[] = [];
    (window as unknown as {__picked: string[]}).__picked = picked;
    // The story reports a pick by logging "<label> clicked"; the spec
    // reads those lines through this page-side capture.
    // eslint-disable-next-line no-console -- see above
    const original = console.log.bind(console);
    // eslint-disable-next-line no-console -- see above
    console.log = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].endsWith(' selected')) {
        picked.push(args[0].replace(' selected', ''));
      }
      original(...args);
    };
  });
  const card = page.getByRole('dialog', {name: 'Project actions'});
  await expect(card).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card).toBeHidden();
  return {
    driver: await touchDriver(page),
    trigger: page.getByRole('button', {name: /Project actions/}),
    card,
  };
}

const picked = async (page: Page) =>
  page.evaluate(() =>
    (window as unknown as {__picked: string[]}).__picked.slice(),
  );

interface CardSample {
  t: number;
  scale: number;
  opacity: number;
  dim: number;
}

/** Holds the open card's latest transition and samples it at each time. */
async function sampleCard(
  page: Page,
  times: ReadonlyArray<number>,
): Promise<{held: number; samples: CardSample[]}> {
  return page.evaluate(ts => {
    const dialog = document.querySelector('dialog[open]');
    if (dialog == null) {
      throw new Error('no open dialog');
    }
    const onDialog = document
      .getAnimations()
      .filter(a => (a.effect as KeyframeEffect | null)?.target === dialog);
    const latest = Math.max(...onDialog.map(a => Number(a.startTime)));
    const held = onDialog.filter(a => Number(a.startTime) === latest);
    for (const animation of held) {
      animation.pause();
    }
    (window as unknown as {__harnessHeld: Animation[]}).__harnessHeld = held;
    const scaleOf = (value: string) =>
      value === 'none' ? 1 : Number(value.split(' ')[0]);
    const samples = ts.map(t => {
      for (const animation of held) {
        animation.currentTime = t;
      }
      const own = getComputedStyle(dialog);
      return {
        t,
        scale: scaleOf(own.scale),
        opacity: Number(own.opacity),
        dim: Number(getComputedStyle(dialog, '::backdrop').opacity),
      };
    });
    return {held: held.length, samples};
  }, times);
}

const channel = (samples: CardSample[], key: 'scale' | 'opacity' | 'dim') =>
  samples.map(s => ({t: s.t, value: s[key]}));

test.describe('under a mouse (a fine primary pointer)', () => {
  test.use({hasTouch: false, isMobile: false});
  test('the action sheet keeps the bottom sheet: no card', async ({page}) => {
    await openStory(
      page,
      storybook(),
      'core-dropdownmenu--action-sheet-card-presentation',
    );
    // The case is a fine pointer's: prove the page reports one.
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    // The story opens its sheet on load: close it, then open it by clicking.
    const opened = page.getByRole('dialog', {name: 'Project actions'});
    await expect(opened).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(opened).toBeHidden();
    const trigger = page.getByRole('button', {name: /Project actions/});
    await trigger.click();
    const sheet = page.getByRole('dialog', {name: 'Project actions'});
    await expect(sheet).toBeVisible();
    await expect(page.locator('[data-astryx-action-sheet-action]')).toHaveCount(
      0,
    );
  });
});

test('presents as a card from scale 1.2 (capped at the viewport width) and opacity 0 with the dimming, on the alert spring', async ({
  page,
}, testInfo) => {
  const {driver, trigger, card} = await openPage(page);
  await driver.tap(await centerOf(trigger));
  await waitForAnimation(card);
  const {held, samples} = await sampleCard(page, timeline(PRESENT_MS));
  expect(held).toBe(3);
  const from = await presentedFrom(card);
  expect(from).toBeGreaterThan(1);
  const scale = compareCurve(
    channel(samples, 'scale'),
    t => from + (1 - from) * present(t),
    SCALE_TOLERANCE,
  );
  const opacity = compareCurve(
    channel(samples, 'opacity'),
    present,
    OPACITY_TOLERANCE,
  );
  const dim = compareCurve(channel(samples, 'dim'), present, OPACITY_TOLERANCE);
  await releaseAnimations(page);
  await writeEvidence(
    'curves/dropdownmenu-action-sheet-present',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {spring: springs.alertPresent, scaleFrom: from, scale, opacity, dim},
        null,
        1,
      ),
    },
    testInfo,
  );
  for (const result of [scale, opacity, dim]) {
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      result.tolerance,
    );
  }
  // Centered on the screen, not docked at the bottom.
  const box = await boxOf(card);
  const viewport = viewportOf(page);
  expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(1);
  expect(box.y + box.height).toBeLessThan(viewport.height - 8);
});

test('a finger held on the card takes no callout or text selection, and the dialog keeps its own base styles', async ({
  page,
}) => {
  const {driver, trigger, card} = await openPage(page);
  await driver.tap(await centerOf(trigger));
  await expect(card).toBeVisible();
  // Input comes back once the presentation completes.
  await page.waitForTimeout(alertController.present.ignoresTouchesForMs + 100);
  const read = async () =>
    card.evaluate(el => {
      const computed = getComputedStyle(el);
      return {
        userSelect:
          computed.getPropertyValue('-webkit-user-select') ||
          computed.userSelect,
        callout: computed.getPropertyValue('-webkit-touch-callout'),
        position: computed.position,
      };
    });
  // Hold a finger on the card's title, away from the actions.
  const box = await card.boundingBox();
  if (box == null) {
    throw new Error('no card box');
  }
  const held: Awaited<ReturnType<typeof read>>[] = [];
  await driver.play(
    tap({x: box.x + box.width / 2, y: box.y + 24}, {holdMs: 400}),
    {
      onEvent: async (_step, index) => {
        if (index === 0) {
          held.push(await read());
        }
      },
    },
  );
  expect(held).toHaveLength(1);
  expect(held[0].userSelect).toBe('none');
  // Only WebKit implements the callout property; elsewhere it reads empty.
  expect(['none', '']).toContain(held[0].callout);
  // The lock adds to the dialog's base; it replaces none of it.
  expect(held[0].position).toBe('fixed');
});

test('the browser never takes a finger on the card for a pan: the card and its fitting content allow pinch-zoom only', async ({
  page,
}) => {
  // Chrome on Android cancels a pointer it pans (pointercancel), which ended
  // the slide between actions. A touch's pan is decided by the touch-action
  // of the elements from the target up to its scroll container.
  const {driver, trigger, card} = await openPage(page);
  await driver.tap(await centerOf(trigger));
  await expect(card).toBeVisible();
  await waitForAnimation(card);
  const chain = await page
    .locator('[data-astryx-action-sheet-action]')
    .first()
    .evaluate(action => {
      const nodes: {touchAction: string; scrolls: boolean; dialog: boolean}[] =
        [];
      for (
        let node: HTMLElement | null = action as HTMLElement;
        node != null;
        node = node.parentElement
      ) {
        const style = getComputedStyle(node);
        nodes.push({
          touchAction: style.touchAction,
          scrolls: /auto|scroll/.test(style.overflowY),
          dialog: node.tagName === 'DIALOG',
        });
        if (node.tagName === 'DIALOG') {
          break;
        }
      }
      return nodes;
    });
  const scroller = chain.findIndex(node => node.scrolls);
  const decides = scroller === -1 ? chain : chain.slice(0, scroller + 1);
  expect(decides.some(node => node.touchAction === 'pinch-zoom')).toBe(true);
  expect(chain.at(-1)).toEqual({
    touchAction: 'pinch-zoom',
    scrolls: expect.any(Boolean),
    dialog: true,
  });
});

test('a finger that lands on one action and lifts on another runs the one it lifts on, once', async ({
  page,
}) => {
  const {driver, trigger, card} = await openPage(page);
  await driver.tap(await centerOf(trigger));
  await expect(card).toBeVisible();
  // Input comes back once the presentation completes.
  await page.waitForTimeout(alertController.present.ignoresTouchesForMs + 100);
  const actions = card.locator('[data-astryx-action-sheet-action]');
  const first = await centerOf(actions.nth(0));
  const third = await centerOf(actions.nth(2));
  const thirdLabel = (await actions.nth(2).textContent())?.trim();
  await driver.play(
    drag(first, third, {holdMs: 120, durationMs: 300, hz: 60, restMs: 80}),
  );
  await expect(card).toBeHidden();
  expect(await picked(page)).toEqual([thirdLabel]);
});

test('a tap outside dismisses it with a fade alone, on the alert spring', async ({
  page,
}, testInfo) => {
  const {driver, trigger, card} = await openPage(page);
  await driver.tap(await centerOf(trigger));
  await expect(card).toBeVisible();
  await page.waitForTimeout(alertController.present.ignoresTouchesForMs + 100);
  const viewport = viewportOf(page);
  await driver.tap({x: 12, y: viewport.height - 12});
  await waitForAnimation(card);
  const {samples} = await sampleCard(page, timeline(DISMISS_MS));
  const opacity = compareCurve(
    channel(samples, 'opacity'),
    t => 1 - dismiss(t),
    OPACITY_TOLERANCE,
  );
  await releaseAnimations(page);
  await writeEvidence(
    'curves/dropdownmenu-action-sheet-dismiss',
    {
      [`${testInfo.project.name}.json`]: JSON.stringify(
        {spring: springs.alertDismiss, opacity},
        null,
        1,
      ),
    },
    testInfo,
  );
  expect(opacity.maxError, JSON.stringify(opacity.worst)).toBeLessThanOrEqual(
    OPACITY_TOLERANCE,
  );
  for (const sample of samples) {
    expect(sample.scale).toBeCloseTo(1, 3);
  }
  await expect(card).toBeHidden();
  expect(await picked(page)).toEqual([]);
});

test(
  'storyboard: the card presents and a tap outside dismisses it',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const {driver, trigger, card} = await openPage(page);
    await installTimerGate(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: viewport.height};
    const measure = async () =>
      page.evaluate(() => {
        const dialog = document.querySelector('dialog[open]');
        if (dialog == null) {
          return {scale: 0, opacity: 0};
        }
        const style = getComputedStyle(dialog);
        return {
          scale: style.scale === 'none' ? 1 : Number(style.scale.split(' ')[0]),
          opacity: Number(style.opacity),
        };
      });
    await driver.tap(await centerOf(trigger));
    await waitForAnimation(card);
    const from = await presentedFrom(card);
    await freezeTimers(page);
    const {storyboard: presentBoard} = await animationStoryboard(page, {
      name: 'dropdownmenu-action-sheet-present',
      clip,
      scope: card,
      measure,
      times: timeline(PRESENT_MS, 1000 / 30),
      columns: 7,
      cellScale: 0.35,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await page.waitForTimeout(
      alertController.present.ignoresTouchesForMs + 100,
    );
    await driver.tap({x: 12, y: viewport.height - 12});
    await waitForAnimation(card);
    await freezeTimers(page);
    const {storyboard: dismissBoard} = await animationStoryboard(page, {
      name: 'dropdownmenu-action-sheet-dismiss',
      clip,
      scope: card,
      measure,
      times: timeline(DISMISS_MS, 1000 / 30),
      columns: 7,
      cellScale: 0.35,
    });
    await releaseAnimations(page, {finish: true});
    await thawTimers(page);
    await presentBoard.write(testInfo);
    await dismissBoard.write(testInfo);
    const scales = presentBoard.frames.map(f => f.data.scale as number);
    expect(scales[0]).toBeCloseTo(from, 2);
    expect(scales.at(-1)).toBeCloseTo(1, 2);
    const fades = dismissBoard.frames.map(f => f.data.opacity as number);
    expect(lastOf(fades)).toBeLessThan(fades[0]);
  },
);
