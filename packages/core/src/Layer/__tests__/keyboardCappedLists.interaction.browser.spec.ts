// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardCappedLists.interaction.browser.spec.ts
 * @input The Selector, MultiSelector and Typeahead stories, and a stand-in
 *   software keyboard that drives `window.visualViewport`
 * @output Proves each component's list, as its layer's only content, ends
 *   10 px above the keyboard once the keyboard caps its layer: the list's own
 *   height limit folds in the layer's block-size cap (spec:AST-059 FR9). A
 *   list under a search field is not covered: the field's row still pushes
 *   it about 45 px past the capped layer
 * @position Layer runtime: browser proof of the keyboard cap inside the
 *   composing components; the cap itself is proven by the Popover keyboard
 *   spec
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  openStory,
  waitForRest,
  withStorybook,
} from '@astryxdesign/interaction-harness';
import {LAYER_KEYBOARD_CLEARANCE_PX} from '../layerKeyboardClearance';
import {keyboardNotification} from '../../motion/uikit/timing';

const storybook = withStorybook(test);

// How far above the open list's end the stand-in keyboard's top comes: each
// list runs under it, whatever its length.
const UNDER = 60;

/**
 * Replaces `window.visualViewport` before the page loads with one the test
 * drives: `__keyboard(cover)` shrinks it from the bottom and fires one
 * `resize`, as Mobile Safari does. The keyboard module measures it wherever
 * a visual viewport exists (spec:AST-099 FR6).
 */
async function installKeyboard(page: Page) {
  await page.addInitScript(() => {
    const viewport = Object.assign(new EventTarget(), {
      height: window.innerHeight,
      width: window.innerWidth,
      offsetTop: 0,
      offsetLeft: 0,
      pageTop: 0,
      pageLeft: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      get: () => viewport,
    });
    (window as unknown as {__keyboard: (cover: number) => void}).__keyboard =
      cover => {
        viewport.height = window.innerHeight - cover;
        viewport.dispatchEvent(new Event('resize'));
      };
  });
}

/** Raises the stand-in keyboard to `cover` and waits until it has arrived. */
async function raiseKeyboard(page: Page, cover: number) {
  await page.evaluate(
    value =>
      (window as unknown as {__keyboard: (cover: number) => void}).__keyboard(
        value,
      ),
    cover,
  );
  await page.waitForTimeout(keyboardNotification.durationMs + 100);
}

/**
 * Where the list's visible part ends: the bottom of the scroll container it
 * scrolls in (itself, or the dropdown around it).
 */
const visibleEnd = async (list: Locator) =>
  list.evaluate(element => {
    let node: Element | null = element;
    while (node != null && node !== document.body) {
      const overflow = getComputedStyle(node).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') {
        return node.getBoundingClientRect().bottom;
      }
      node = node.parentElement;
    }
    return element.getBoundingClientRect().bottom;
  });

/** The line the list must end above: the keyboard's top, less the clearance. */
const limitOf = async (page: Page) =>
  page.evaluate(
    clearance =>
      (window.visualViewport?.height ?? window.innerHeight) - clearance,
    LAYER_KEYBOARD_CLEARANCE_PX,
  );

const cases: {
  name: string;
  story: string;
  open: (page: Page) => Promise<Locator>;
}[] = [
  {
    name: 'Selector',
    story: 'core-selector--default',
    open: async page => {
      await page.locator('button[aria-haspopup="listbox"]').first().click();
      return page.getByRole('listbox');
    },
  },
  {
    name: 'MultiSelector',
    story: 'core-multiselector--default',
    open: async page => {
      await page.locator('button[aria-haspopup="listbox"]').first().click();
      return page.getByRole('listbox');
    },
  },
  {
    name: 'Typeahead',
    story: 'core-typeahead--default',
    open: async page => {
      const input = page.getByRole('combobox');
      await input.click();
      await input.fill('e');
      return page.getByRole('listbox');
    },
  },
];

for (const {name, story, open} of cases) {
  test(`${name}'s list ends ${LAYER_KEYBOARD_CLEARANCE_PX} px above the keyboard once the keyboard caps its layer`, async ({
    page,
  }) => {
    await installKeyboard(page);
    await openStory(page, storybook(), story);
    const list = await open(page);
    await expect(list).toBeVisible();
    const layer = page.locator('[popover]').filter({has: list}).first();
    await waitForRest(layer);
    // A keyboard whose top comes UNDER px above the open list's end.
    const before = await visibleEnd(list);
    const innerHeight = await page.evaluate(() => window.innerHeight);
    await raiseKeyboard(
      page,
      innerHeight - (Math.min(before, innerHeight) - UNDER),
    );
    await waitForRest(layer);
    expect(await visibleEnd(list)).toBeLessThanOrEqual(
      (await limitOf(page)) + 1,
    );
  });
}
