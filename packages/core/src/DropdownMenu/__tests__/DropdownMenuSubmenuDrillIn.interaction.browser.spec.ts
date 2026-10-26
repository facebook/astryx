// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuSubmenuDrillIn.interaction.browser.spec.ts
 * @input The built Submenu DropdownMenu story on a phone, real touch input
 *   (Chromium CDP / WebKit's input command), the interaction harness, and
 *   UIMenu's sub-menu values from the UIKit constants table
 * @output Interaction proofs for a sub-menu opening in place on a phone, as
 *   UIMenu's does (iOS 26.2): the box grows from its anchored edge on its own
 *   pseudo-elements and the push adds no element beyond the sub-menu's own
 *   rows; the live parent rows recede under the card, inert and hidden from
 *   assistive technology; the header shows the row's label with its chevron
 *   turned down and is named for going back; back plays the card out on
 *   itself, with no copy, and the parent rows come back; Reduce Motion
 *   cross-fades with nothing moving; a finger resting on a sub-menu row does
 *   not drill in and its lift there does (module FR10); the open menu under a
 *   finger has no more
 *   elements than under a mouse (architecture:component-style-authoring
 *   INV7); a storyboard
 * @position Evidence for menuDrillInMotion.ts and useMenuDrillIn as
 *   DropdownMenu drives them
 */

import {expect, test, type Page} from '@playwright/test';
import {
  openStory,
  Storyboard,
  tap,
  touchDriver,
  waitForRest,
  withStorybook,
} from '@astryxdesign/interaction-harness';
import {menu} from '../../motion/uikit/menu';

const storybook = withStorybook(test);

const POPOVER = '[popover]:has([role="menu"])';
const PARENT = '[data-astryx-menu-parent]';
const CARD = '[data-astryx-menu-card]';
const BOX_MOTION = '[data-astryx-menu-box-motion]';

async function center(page: Page, name: string) {
  const box = await page.getByRole('menuitem', {name}).boundingBox();
  if (box == null) {
    throw new Error(`no row ${name}`);
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

/** Open the Submenu story's menu with a tap and let it settle. */
async function openMenu(page: Page) {
  await openStory(page, storybook(), 'core-dropdownmenu--submenu');
  const driver = await touchDriver(page);
  const trigger = page.getByRole('button', {name: 'Actions'});
  const box = await trigger.boundingBox();
  if (box == null) {
    throw new Error('no trigger');
  }
  await driver.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await waitForRest(page.locator(POPOVER).first());
  await settled(page);
  return driver;
}

/** Wait until nothing in the page animates any more. */
async function settled(page: Page) {
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(animation => animation.playState === 'running').length,
      ),
    )
    .toBe(0);
}

/** INV7's measure: every element in the page body. */
const elementCount = async (page: Page) =>
  page.evaluate(() => document.body.querySelectorAll('*').length);

const popoverBox = async (page: Page) =>
  page
    .locator(POPOVER)
    .first()
    .evaluate(el => {
      const r = el.getBoundingClientRect();
      return {top: r.top, bottom: r.bottom, height: r.height};
    });

test('a sub-menu opens in place: the box grows on its own pseudo-elements, and the live parent rows recede under the card', async ({
  page,
}) => {
  const driver = await openMenu(page);
  const before = await popoverBox(page);
  const elementsBefore = await elementCount(page);
  await driver.tap(await center(page, 'Move to'));
  // The box draws itself while it grows: an attribute, no element.
  await expect(page.locator(BOX_MOTION)).toHaveCount(1);
  await settled(page);
  await expect(page.locator(BOX_MOTION)).toHaveCount(0);
  // The only elements the push added are the sub-menu's own: its view.
  const viewElements = await page
    .locator(CARD)
    .evaluate(el => el.querySelectorAll('*').length);
  expect(await elementCount(page)).toBe(elementsBefore + viewElements);
  const after = await popoverBox(page);
  // The box kept one edge: its top when it opened downward, else its bottom.
  const keptTop = Math.abs(after.top - before.top) < 1;
  const keptBottom = Math.abs(after.bottom - before.bottom) < 1;
  expect(keptTop || keptBottom).toBe(true);
  // The parent's rows are the live ones, receded: inert, hidden from
  // assistive technology, at UIMenu's opacity and scale.
  const parent = page.locator(PARENT);
  await expect(parent).toHaveCount(1);
  const state = await parent.evaluate(el => ({
    opacity: getComputedStyle(el).opacity,
    transform: getComputedStyle(el).transform,
    hidden: el.getAttribute('aria-hidden'),
    inert: el.hasAttribute('inert'),
    rows: el.querySelectorAll('[role="menuitem"]').length,
  }));
  expect(Number(state.opacity)).toBeCloseTo(menu.submenuParentOpacity, 3);
  expect(state.transform).toBe(
    `matrix(${menu.submenuParentScale}, 0, 0, ${menu.submenuParentScale}, 0, 0)`,
  );
  expect(state.hidden).toBe('true');
  expect(state.inert).toBe(true);
  expect(state.rows).toBeGreaterThan(0);
  // The header: the row's label, its chevron down, named for going back.
  const header = page.getByRole('menuitem', {name: 'Back to Actions'});
  await expect(header).toHaveText('Move to');
  const turn = await header
    .locator('[data-astryx-menu-submenu-chevron]')
    .evaluate(el => getComputedStyle(el).rotate);
  expect(turn).toBe('90deg');
});

test('a finger resting on a sub-menu row does not drill in; its lift there does (module FR10)', async ({
  page,
}) => {
  const driver = await openMenu(page);
  const moveTo = await center(page, 'Move to');
  // When the finger lifted, and when the sub-menu's card first showed.
  await page.evaluate(() => {
    const log = {liftAt: 0, cardAt: 0};
    (window as unknown as {__fr10: typeof log}).__fr10 = log;
    // The lift's first event: Chromium sends the pointerup ahead of the
    // touchend, and the row acts on the pointerup.
    const markLift = () => {
      log.liftAt ||= performance.now();
    };
    document.addEventListener('pointerup', markLift, true);
    document.addEventListener('touchend', markLift, true);
    new MutationObserver(() => {
      if (
        log.cardAt === 0 &&
        document.querySelector('[data-astryx-menu-card]') != null
      ) {
        log.cardAt = performance.now();
      }
    }).observe(document.body, {subtree: true, childList: true});
  });
  // Rested on the row well past a hover's open delay, then lifted there.
  await driver.play(tap(moveTo, {holdMs: 900}));
  await expect(page.locator(CARD)).toHaveCount(1);
  const log = await page.evaluate(
    () =>
      (window as unknown as {__fr10: {liftAt: number; cardAt: number}}).__fr10,
  );
  expect(log.liftAt).toBeGreaterThan(0);
  // Nothing drilled in while the finger rested: the card came with the lift.
  expect(log.cardAt).toBeGreaterThanOrEqual(log.liftAt);
});

test('back plays the card out on itself, with no copy, and the parent rows come back', async ({
  page,
}) => {
  const driver = await openMenu(page);
  const elementsAtRoot = await elementCount(page);
  await driver.tap(await center(page, 'Move to'));
  await settled(page);
  const elementsDrilled = await elementCount(page);
  await driver.tap(await center(page, 'Back to Actions'));
  // While it plays out the card is the live one: the page never holds more
  // than it did drilled in.
  await expect(page.locator(BOX_MOTION)).toHaveCount(1);
  expect(await elementCount(page)).toBeLessThanOrEqual(elementsDrilled);
  await settled(page);
  await expect(page.locator(BOX_MOTION)).toHaveCount(0);
  expect(await elementCount(page)).toBe(elementsAtRoot);
  await expect(page.locator(PARENT)).toHaveCount(0);
  await expect(page.locator(CARD)).toHaveCount(0);
  await expect(page.getByRole('menuitem', {name: 'Move to'})).toBeVisible();
  await expect(
    page.getByRole('menuitem', {name: 'Back to Actions'}),
  ).toHaveCount(0);
});

test('under Reduce Motion the views cross-fade and nothing moves', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const driver = await openMenu(page);
  await driver.tap(await center(page, 'Move to'));
  // Every property an animation changes along its keyframes: only opacity
  // (and a row's press color) may change; a hold that keeps its value is no
  // motion.
  const moved = await page.evaluate(() =>
    document.getAnimations().flatMap(animation => {
      const effect = animation.effect as KeyframeEffect | null;
      const frames = effect?.getKeyframes() ?? [];
      const changed = new Set<string>();
      for (const frame of frames) {
        for (const [key, value] of Object.entries(frame)) {
          if (
            ['offset', 'computedOffset', 'easing', 'composite'].includes(key)
          ) {
            continue;
          }
          if (frames.some(other => other[key] !== value)) {
            changed.add(key);
          }
        }
      }
      return [...changed].filter(
        key => !['opacity', 'backgroundColor', 'color'].includes(key),
      );
    }),
  );
  expect(moved).toEqual([]);
  await settled(page);
  await expect(
    page.getByRole('menuitem', {name: 'Back to Actions'}),
  ).toBeVisible();
});

test.describe('element counts (architecture:component-style-authoring INV7)', () => {
  test('the open menu under a finger takes no more elements than under a mouse; a sub-menu adds only its own view', async ({
    page,
    browser,
  }, testInfo) => {
    // Under a finger: the card in place.
    const driver = await openMenu(page);
    const coarseOpen = await elementCount(page);
    await driver.tap(await center(page, 'Move to'));
    await settled(page);
    const coarseSubMenu = await elementCount(page);
    // Under a mouse: the flyout.
    const fine = await browser.newContext({
      viewport: page.viewportSize() ?? {width: 402, height: 714},
      hasTouch: false,
      isMobile: false,
    });
    const mousePage = await fine.newPage();
    try {
      await openStory(mousePage, storybook(), 'core-dropdownmenu--submenu');
      expect(
        await mousePage.evaluate(() => matchMedia('(pointer: coarse)').matches),
      ).toBe(false);
      const trigger = mousePage.getByRole('button', {name: 'Actions'});
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await settled(mousePage);
      const fineOpen = await elementCount(mousePage);
      await mousePage.getByRole('menuitem', {name: 'Move to'}).click();
      await expect(
        mousePage.getByRole('menuitem', {name: 'Move to'}),
      ).toHaveAttribute('aria-expanded', 'true');
      await settled(mousePage);
      const fineSubMenu = await elementCount(mousePage);
      testInfo.annotations.push({
        type: 'element counts',
        description: `open: finger ${coarseOpen}, mouse ${fineOpen}; sub-menu open: finger ${coarseSubMenu}, mouse ${fineSubMenu}`,
      });
      expect(coarseOpen).toBeLessThanOrEqual(fineOpen);
      // In place, the sub-menu adds its own view and nothing else: its header
      // and rows (the parent rows stay, receded, and nothing is copied).
      const viewElements = await page
        .locator(CARD)
        .evaluate(el => el.querySelectorAll('*').length);
      expect(coarseSubMenu).toBe(coarseOpen + viewElements);
    } finally {
      await fine.close();
    }
  });
});

test(
  'storyboard: open a sub-menu in place and go back',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    const driver = await openMenu(page);
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const board = new Storyboard(page, {
      name: 'dropdownmenu-submenu-drill-in',
      clip: {x: 0, y: 0, width: viewport.width, height: viewport.height},
      columns: 6,
      cellScale: 0.35,
    });
    const shoot = async (label: string, t: number) =>
      board.capture(label, t, {
        boxMotion: await page.locator(BOX_MOTION).count(),
        elements: await elementCount(page),
      });
    await shoot('open', 0);
    await driver.tap(await center(page, 'Move to'));
    for (const t of [16, 66, 133, 233, 400]) {
      await page.waitForTimeout(t === 16 ? 16 : 50);
      await shoot(`drill +${t}ms`, t);
    }
    await settled(page);
    await shoot('drilled', 600);
    await driver.tap(await center(page, 'Back to Actions'));
    for (const t of [16, 100, 250, 500]) {
      await page.waitForTimeout(t === 16 ? 16 : 80);
      await shoot(`back +${t}ms`, 700 + t);
    }
    await settled(page);
    await shoot('back', 1400);
    await board.write(testInfo);
    expect(board.frames.some(frame => frame.data.boxMotion === 1)).toBe(true);
    expect(board.frames.at(-1)?.data.elements).toBe(
      board.frames[0]?.data.elements,
    );
  },
);
