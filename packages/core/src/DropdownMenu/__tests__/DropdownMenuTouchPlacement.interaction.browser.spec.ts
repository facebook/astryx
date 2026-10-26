// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuTouchPlacement.interaction.browser.spec.ts
 * @input The built Default DropdownMenu story on the harness's phone profile
 *   (compact, coarse pointer), real touch input, the interaction harness and
 *   UIMenu's values from the UIKit constants table
 * @output Placement proofs for the compact touch presentation (one touch
 *   model on every engine): the menu covers its trigger, top-aligned and
 *   centered on it; it stays UIKit's screen margin off the viewport's sides,
 *   plus each LayerProvider inline inset on the side it names (right to left
 *   included);
 *   a trigger in the lower half opens it upward, bottom-aligned; in a short
 *   viewport it stays on screen and scrolls; the finger that opened it over
 *   its first row picks only after UIMenu's handoff distance. A mouse keeps
 *   the menu below its trigger
 * @position Evidence for DropdownMenu's placement over its trigger (and
 *   MoreMenu's); the motion and the press model have their own specs
 *
 * The trigger is moved with a relative offset (a layout shift, not a
 * transform) to put it near an edge or in the lower half.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  drag,
  frames,
  openStory,
  touchDriver,
  waitForRest,
  withStorybook,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';
import {menu} from '../../motion/uikit/menu';
import {UIKIT_GESTURES} from '../../motion/uikit/gestures';

/** The page's viewport; every spec here sets one. */
function viewportOf(page: Page): {width: number; height: number} {
  const viewport = page.viewportSize();
  if (viewport == null) {
    throw new Error('no viewport');
  }
  return viewport;
}

const storybook = withStorybook(test);

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function openStoryWithTrigger(
  page: Page,
  offset: {x: number; y: number} = {x: 0, y: 0},
): Promise<{driver: TouchDriver; trigger: Locator; popover: Locator}> {
  await openStory(page, storybook(), 'core-dropdownmenu--default');
  const trigger = page.getByRole('button', {name: 'Actions'});
  await trigger.evaluate((node, {x, y}) => {
    const el = node as HTMLElement;
    el.style.position = 'relative';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }, offset);
  await page.evaluate(() => {
    const picked: string[] = [];
    (window as unknown as {__picked: string[]}).__picked = picked;
    // The story reports a pick by logging "<label> clicked"; the spec
    // reads those lines through this page-side capture.
    // eslint-disable-next-line no-console -- see above
    const original = console.log.bind(console);
    // eslint-disable-next-line no-console -- see above
    console.log = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].endsWith(' clicked')) {
        picked.push(args[0].replace(' clicked', ''));
      }
      original(...args);
    };
  });
  return {
    driver: await touchDriver(page),
    trigger,
    popover: page.locator('[popover]:has([role="menu"])').first(),
  };
}

const boxOf = async (locator: Locator): Promise<Box> => {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('no box');
  }
  return box;
};

const centerOf = (box: Box) => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

const picked = async (page: Page) =>
  page.evaluate(() =>
    (window as unknown as {__picked: string[]}).__picked.slice(),
  );

async function openWithTap(
  page: Page,
  driver: TouchDriver,
  trigger: Locator,
  popover: Locator,
) {
  await driver.tap(centerOf(await boxOf(trigger)));
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await waitForRest(popover);
  await frames(page, 2);
}

// The story centers its trigger; these move it into the upper half, where
// the menu opens downward from the trigger's top.
const UPPER = -150;

test.describe('under a mouse (a fine primary pointer) on a phone-size screen', () => {
  test.use({hasTouch: false, isMobile: false});
  test('the menu stays below its trigger, not pinned to the sides', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-dropdownmenu--default');
    // The case is a fine pointer's: prove the page reports one.
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const trigger = page.getByRole('button', {name: 'Actions'});
    const popover = page.locator('[popover]:has([role="menu"])').first();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitForRest(popover);
    const t = await boxOf(trigger);
    const m = await boxOf(popover);
    expect(m.y).toBeGreaterThanOrEqual(t.y + t.height - 1);
    expect(
      await popover.evaluate(el => el.style.getPropertyValue('justify-self')),
    ).toBe('');
  });
});

test('on a phone the menu covers its trigger, top-aligned and centered on it', async ({
  page,
}) => {
  const {driver, trigger, popover} = await openStoryWithTrigger(page, {
    x: 0,
    y: UPPER,
  });
  await openWithTap(page, driver, trigger, popover);
  const t = await boxOf(trigger);
  const m = await boxOf(popover);
  expect(m.y).toBeCloseTo(t.y, 0);
  expect(centerOf(m).x).toBeCloseTo(centerOf(t).x, 0);
});

test('near the viewport\u2019s sides it stays UIKit\u2019s screen margin off them', async ({
  page,
}) => {
  const viewport = viewportOf(page);
  for (const side of ['left', 'right'] as const) {
    // A trigger 4 px inside the viewport's side, as UIKit's edge buttons.
    const {trigger: probe} = await openStoryWithTrigger(page, {
      x: 0,
      y: UPPER,
    });
    const home = await boxOf(probe);
    const {driver, trigger, popover} = await openStoryWithTrigger(page, {
      x:
        side === 'left'
          ? 4 - home.x
          : viewport.width - 4 - (home.x + home.width),
      y: UPPER,
    });
    const t = await boxOf(trigger);
    await openWithTap(page, driver, trigger, popover);
    const m = await boxOf(popover);
    if (side === 'left') {
      expect(t.x).toBeLessThan(menu.screenMargin);
      expect(m.x).toBeCloseTo(menu.screenMargin, 0);
    } else {
      expect(t.x + t.width).toBeGreaterThan(viewport.width - menu.screenMargin);
      expect(m.x + m.width).toBeCloseTo(viewport.width - menu.screenMargin, 0);
    }
    expect(m.y).toBeCloseTo(t.y, 0);
  }
});

test('right to left, each LayerProvider inline inset keeps the menu off the side it names', async ({
  page,
}) => {
  const viewport = viewportOf(page);
  // A bar on the inline-start side, which is the right one right to left.
  const INSET = 40;
  for (const side of ['left', 'right'] as const) {
    await openStory(page, storybook(), 'core-dropdownmenu--default');
    await page.evaluate(inset => {
      // Right to left everywhere a direction is set, the story's own
      // wrappers included.
      document.documentElement.dir = 'rtl';
      for (const element of document.querySelectorAll('[dir]')) {
        element.setAttribute('dir', 'rtl');
      }
      document.documentElement.style.setProperty(
        '--astryx-layer-inset-inline-start',
        `${inset}px`,
      );
    }, INSET);
    const trigger = page.getByRole('button', {name: 'Actions'});
    expect(await trigger.evaluate(el => getComputedStyle(el).direction)).toBe(
      'rtl',
    );
    const home = await boxOf(trigger);
    // The trigger 4 px inside the side, in the upper half.
    const dx =
      side === 'left' ? 4 - home.x : viewport.width - 4 - (home.x + home.width);
    await trigger.evaluate(
      (node, {x, y}) => {
        const el = node as HTMLElement;
        el.style.position = 'relative';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
      },
      {x: dx, y: UPPER},
    );
    const popover = page.locator('[popover]:has([role="menu"])').first();
    await openWithTap(page, await touchDriver(page), trigger, popover);
    const m = await boxOf(popover);
    if (side === 'right') {
      // The inline-start side: the screen margin and the bar's inset.
      expect(m.x + m.width).toBeCloseTo(
        viewport.width - menu.screenMargin - INSET,
        0,
      );
    } else {
      // The inline-end side, with no inset: the screen margin alone.
      expect(m.x).toBeCloseTo(menu.screenMargin, 0);
    }
  }
});

test('a trigger in the lower half opens it upward, bottom-aligned with the trigger', async ({
  page,
}) => {
  const viewport = viewportOf(page);
  const {driver, trigger, popover} = await openStoryWithTrigger(page, {
    x: 0,
    y: Math.round(viewport.height / 4),
  });
  const t = await boxOf(trigger);
  expect(centerOf(t).y).toBeGreaterThan(viewport.height * menu.openUpwardBelow);
  await openWithTap(page, driver, trigger, popover);
  const m = await boxOf(popover);
  expect(m.y + m.height).toBeCloseTo(t.y + t.height, 0);
  expect(centerOf(m).x).toBeCloseTo(centerOf(t).x, 0);
});

test('in a short viewport (a phone in landscape) the covering menu stays on screen and scrolls', async ({
  page,
}) => {
  await page.setViewportSize({width: 844, height: 390});
  await openStory(
    page,
    storybook(),
    'core-dropdownmenu--tall-content-overflow',
  );
  // The story opens its long menu on load.
  const popover = page.locator('[popover]:has([role="menu"])').first();
  await expect(popover).toBeVisible();
  await waitForRest(popover);
  await frames(page, 2);
  const m = await boxOf(popover);
  // UIKit's 8 pt screen margin at both block edges (no safe area here).
  expect(m.y).toBeGreaterThanOrEqual(8 - 1);
  expect(m.y + m.height).toBeLessThanOrEqual(390 - 8 + 1);
  // Its rows past the room are reached by scrolling the menu.
  const menu = page.getByRole('menu');
  expect(await menu.evaluate(el => el.scrollHeight > el.clientHeight + 1)).toBe(
    true,
  );
});

test('the finger that opened the menu over its first row picks only after UIMenu\u2019s handoff distance', async ({
  page,
}) => {
  const {driver, trigger, popover} = await openStoryWithTrigger(page, {
    x: 0,
    y: UPPER,
  });
  const press = centerOf(await boxOf(trigger));
  // Held past the hold-open delay: the menu opens over the trigger, so the
  // finger now rests on its first row. A 6 px move then a lift picks nothing.
  await driver.play(
    drag(
      press,
      {x: press.x, y: press.y + UIKIT_GESTURES.menuPress.handoff.value - 4},
      {holdMs: 300, durationMs: 100, hz: 60, restMs: 80},
    ),
  );
  await frames(page, 2);
  expect(await picked(page)).toEqual([]);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const row = page.getByRole('menuitem', {name: 'Edit'});
  const rowBox = await boxOf(row);
  expect(press.y).toBeGreaterThan(rowBox.y);
  expect(press.y).toBeLessThan(rowBox.y + rowBox.height);
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-astryx-menu-exit]')).toHaveCount(0);
  // The same press moved past the distance: the row under the lift acts.
  const lift = {
    x: press.x,
    y: press.y + UIKIT_GESTURES.menuPress.handoff.value + 4,
  };
  await driver.play(
    drag(press, lift, {holdMs: 300, durationMs: 100, hz: 60, restMs: 80}),
  );
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  const underLift = rowBox.y + rowBox.height > lift.y ? 'Edit' : 'Duplicate';
  expect(await picked(page)).toEqual([underLift]);
  void popover;
});
