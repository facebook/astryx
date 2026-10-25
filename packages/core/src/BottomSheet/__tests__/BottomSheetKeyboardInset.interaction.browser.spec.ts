// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetKeyboardInset.interaction.browser.spec.ts
 * @input Playwright, the interaction harness, the Mobile keyboard story, a
 *   stand-in visual viewport the test drives as Mobile Safari reports it
 * @output Tests that a fully expanded Tall sheet makes room for the keyboard
 *   at the end of its own body through its functional style (no CSS custom
 *   property of its own), brings the focused field above the keyboard, and
 *   gives the room back when the keyboard goes
 * @position Browser tests for BottomSheet's use of the keyboard module
 *   (spec:AST-099 FR3, FR4)
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {openStory, withStorybook} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

// The cover Mobile Safari reports on an iPhone 17 Pro (keyboard, accessory
// bar and the floating address bar).
const COVER = 337;

/**
 * Replaces `window.visualViewport` before the page loads with one the test
 * drives: `__keyboard(cover)` shrinks it from the bottom and fires one
 * `resize`, as Mobile Safari does.
 */
async function installKeyboard(page: Page) {
  await page.addInitScript(() => {
    // Mobile Safari has no keyboard geometry API.
    Reflect.deleteProperty(Navigator.prototype, 'virtualKeyboard');
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

const report = async (page: Page, cover: number) =>
  page.evaluate(
    c => (window as unknown as {__keyboard: (c: number) => void}).__keyboard(c),
    cover,
  );

/** The room at the end of the field's scrolling body, and where the field is. */
const readBody = async (field: Locator) =>
  field.evaluate(element => {
    let body = element.parentElement;
    while (body != null) {
      const overflow = getComputedStyle(body).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') {
        break;
      }
      body = body.parentElement;
    }
    if (body == null) {
      throw new Error('no scrolling body');
    }
    const content = body.firstElementChild ?? body;
    const roomOf = (box: Element) =>
      parseFloat(getComputedStyle(box, '::after').blockSize) || 0;
    return {
      room: Math.max(roomOf(body), roomOf(content)),
      style: body.getAttribute('style') ?? '',
      contentStyle: content.getAttribute('style') ?? '',
      fieldBottom: element.getBoundingClientRect().bottom,
      scrollHeight: body.scrollHeight,
    };
  });

/**
 * Keeps the content box at the body's height while its fields overflow it, as
 * Firefox lays it out: it resolves the content's `min-height: min-content` as
 * `auto` in the block axis.
 */
const keepContentBoxAtBodyHeight = async (field: Locator) =>
  field.evaluate(element => {
    let body = element.parentElement;
    while (body != null && getComputedStyle(body).overflowY !== 'auto') {
      body = body.parentElement;
    }
    (body?.firstElementChild as HTMLElement | null)?.style.setProperty(
      'min-height',
      '0',
      'important',
    );
  });

test('a Tall sheet makes room for the keyboard at the end of its body, through its own style', async ({
  page,
}) => {
  await installKeyboard(page);
  await openStory(page, storybook(), 'core-bottomsheet--mobile-keyboard');
  await page.getByRole('button', {name: 'Add a comment'}).click();
  const dialog = page.getByRole('dialog', {name: 'Add a comment'});
  await expect(dialog).toBeVisible();
  // Let the sheet settle fully expanded.
  await page.waitForTimeout(800);
  const field = dialog.getByRole('textbox').last();
  await field.focus();
  await report(page, COVER);
  await expect
    .poll(async () => (await readBody(field)).room, {timeout: 2000})
    .toBeGreaterThan(0);
  const shown = await readBody(field);
  // No CSS custom property of the sheet's own carries the keyboard (FR3).
  expect(shown.style).not.toContain('--_sheet-keyboard-inset');
  expect(shown.contentStyle).not.toContain('--_sheet-keyboard-inset');
  // The last field is scrolled above the keyboard within the sheet (FR4).
  const keyboardTop = await page.evaluate(c => window.innerHeight - c, COVER);
  await expect
    .poll(async () => (await readBody(field)).fieldBottom, {timeout: 2000})
    .toBeLessThanOrEqual(keyboardTop);

  // The keyboard goes: the room goes with it.
  await field.blur();
  await report(page, 0);
  await expect
    .poll(async () => (await readBody(field)).room, {timeout: 2000})
    .toBe(0);
});

test('the last field scrolls above the keyboard where the content box keeps the body\u2019s height, as in Firefox', async ({
  page,
}) => {
  await installKeyboard(page);
  await openStory(page, storybook(), 'core-bottomsheet--mobile-keyboard');
  await page.getByRole('button', {name: 'Add a comment'}).click();
  const dialog = page.getByRole('dialog', {name: 'Add a comment'});
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(800);
  const field = dialog.getByRole('textbox').last();
  await keepContentBoxAtBodyHeight(field);
  await field.focus();
  await report(page, COVER);
  await expect
    .poll(async () => (await readBody(field)).room, {timeout: 2000})
    .toBeGreaterThan(0);
  // The room comes after the content's own fields, so the body can scroll the
  // last of them above the keyboard.
  const keyboardTop = await page.evaluate(c => window.innerHeight - c, COVER);
  await expect
    .poll(async () => (await readBody(field)).fieldBottom, {timeout: 2000})
    .toBeLessThanOrEqual(keyboardTop);
});
