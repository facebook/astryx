// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuTouchPlacement.interaction.browser.spec.ts
 * @input The built Default DropdownMenu story on the harness's phone profile
 *   (compact, coarse pointer), real touch input, the interaction harness and
 *   UIMenu's values from the UIKit constants table
 * @output Placement proofs for the phone presentation: the menu covers its
 *   trigger, top-aligned and centered on it; it stays UIKit's screen margin
 *   off the viewport's sides; a trigger in the lower half opens it upward,
 *   bottom-aligned; the finger that opened it over its first row picks only
 *   after UIMenu's handoff distance
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
      {x: press.x, y: press.y + menu.scrubHandoffPx - 4},
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
  const lift = {x: press.x, y: press.y + menu.scrubHandoffPx + 4};
  await driver.play(
    drag(press, lift, {holdMs: 300, durationMs: 100, hz: 60, restMs: 80}),
  );
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  const underLift = rowBox.y + rowBox.height > lift.y ? 'Edit' : 'Duplicate';
  expect(await picked(page)).toEqual([underLift]);
  void popover;
});
