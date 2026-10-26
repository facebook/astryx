// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetKeyboardInset.interaction.browser.spec.ts
 * @input Playwright, the interaction harness, the Mobile keyboard story, a
 *   stand-in visual viewport the test drives as Mobile Safari reports it (and
 *   as Chrome on Android does, with a VirtualKeyboard object), Gboard's
 *   measured slides (motion/android/keyboard.ts)
 * @output Tests that a fully expanded Tall sheet makes room for the keyboard
 *   at the end of its own body through its functional style (no CSS custom
 *   property of its own), brings the focused field above the keyboard, and
 *   gives the room back when the keyboard goes; in Chrome on Android, that
 *   the field rides Gboard's show up from the report and that through
 *   Gboard's hide the room stays while the content rides down, with both
 *   cleared in one commit at rest
 * @position Browser tests for BottomSheet's use of the keyboard module
 *   (spec:AST-099 FR3, FR4, FR8)
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {cubicBezier} from '../../motion/bezier';
import {keyboard as ANDROID_KEYBOARD} from '../../motion/android/keyboard';
import {
  compareCurve,
  curveOf,
  holdAnimations,
  type HeldAnimation,
  openStory,
  releaseAnimations,
  sampleCurve,
  timeline,
  waitForAnimation,
  waitForRest,
  withStorybook,
} from '@astryxdesign/interaction-harness';

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
      contentTranslate: getComputedStyle(content).translate,
      fieldBottom: element.getBoundingClientRect().bottom,
      scrollHeight: body.scrollHeight,
      scrollTop: body.scrollTop,
      clientHeight: body.clientHeight,
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

/**
 * Chrome on Android: the same driven visual viewport, and a VirtualKeyboard
 * object the guide must leave alone, so the guide reads Chrome's profile and
 * publishes Gboard's slides.
 */
async function installAndroidKeyboard(page: Page) {
  await page.addInitScript(() => {
    const keyboard = Object.assign(new EventTarget(), {
      overlaysContent: false,
      boundingRect: new DOMRect(0, 0, 0, 0),
    });
    Object.defineProperty(navigator, 'virtualKeyboard', {
      configurable: true,
      value: keyboard,
    });
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

// The vertical part of a computed `translate` (`none`, or `Xpx Ypx`).
const translateYOf = (translate: string) =>
  parseFloat(translate.split(' ')[1] ?? '') || 0;

// The content box's ride among what a hold takes on it: the one script
// animation that moves `translate`.
function rideOf(held: ReadonlyArray<HeldAnimation>): HeldAnimation {
  const ride = held.find(
    a => a.kind === 'Animation' && a.keyframes.some(k => 'translate' in k),
  );
  if (ride == null) {
    throw new Error(`no ride among ${JSON.stringify(held)}`);
  }
  return ride;
}

test.describe('Chrome on Android, on Gboard\u2019s slides (spec:AST-099 FR8)', () => {
  test.use({hasTouch: true, isMobile: true});
  test.skip(
    ({browserName}) => browserName !== 'chromium',
    'Chrome\u2019s keyboard profile needs the VirtualKeyboard API',
  );

  // Reports the keyboard's cover and returns the report's time.
  const reportAt = async (page: Page, cover: number) =>
    page.evaluate(c => {
      let at = 0;
      const view = window.visualViewport as unknown as EventTarget;
      view.addEventListener(
        'resize',
        event => {
          at = event.timeStamp;
        },
        {once: true},
      );
      (window as unknown as {__keyboard: (c: number) => void}).__keyboard(c);
      return at;
    }, cover);

  // Opens the sheet with its body scrolled to the end, so the last field's
  // reveal scrolls into the keyboard room.
  async function openAtLastField(page: Page) {
    await installAndroidKeyboard(page);
    await openStory(page, storybook(), 'core-bottomsheet--mobile-keyboard');
    await page.getByRole('button', {name: 'Add a comment'}).click();
    const dialog = page.getByRole('dialog', {name: 'Add a comment'});
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(800);
    const field = dialog.getByRole('textbox').last();
    await field.evaluate(element => {
      let body = element.parentElement;
      while (body != null && getComputedStyle(body).overflowY !== 'auto') {
        body = body.parentElement;
      }
      if (body == null) {
        throw new Error('no scrolling body');
      }
      body.scrollTop = body.scrollHeight;
      body.firstElementChild?.setAttribute('data-sheet-content', '');
    });
    const content = page.locator('[data-sheet-content]');
    const keyboardTop = await page.evaluate(c => window.innerHeight - c, COVER);
    return {field, content, keyboardTop};
  }

  test('the last field rides up on Gboard\u2019s show from the report, dated back to Gboard\u2019s start', async ({
    page,
  }) => {
    const {field, content, keyboardTop} = await openAtLastField(page);
    await field.focus();
    const before = await readBody(field);
    const reported = await reportAt(page, COVER);
    // The body lands at once in the report's event, and the content rides
    // the keyboard's slide up from where it was.
    const landed = await readBody(field);
    const distance = landed.scrollTop - before.scrollTop;
    expect(distance).toBeGreaterThan(100);
    await waitForAnimation(content);
    const start = await content.evaluate(el =>
      Math.max(
        ...el.getAnimations().map(a => Number(a.startTime ?? -Infinity)),
      ),
    );
    expect(
      Math.abs(start - (reported - ANDROID_KEYBOARD.showReportLagMs)),
    ).toBeLessThan(2);
    const ride = rideOf(await holdAnimations(page, content));
    const samples = curveOf(
      await sampleCurve(content, timeline(ride.offsetMs + ride.curveEndMs)),
      'translateY',
    );
    await releaseAnimations(page);
    const ease = cubicBezier(ANDROID_KEYBOARD.showCurve);
    const result = compareCurve(
      samples,
      t =>
        distance *
        (1 -
          ease(
            Math.min(
              1,
              Math.max(0, (t - ride.offsetMs) / ANDROID_KEYBOARD.showMs),
            ),
          )),
      0.5,
    );
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      0.5,
    );
    // At rest: no translate is left, the body did not scroll again, and the
    // field rests above the keyboard.
    await waitForRest(content);
    const rest = await readBody(field);
    expect(translateYOf(rest.contentTranslate)).toBeCloseTo(0, 1);
    expect(rest.scrollTop).toBe(landed.scrollTop);
    expect(rest.fieldBottom).toBeLessThanOrEqual(keyboardTop);
  });

  test('through Gboard\u2019s hide the room stays while the content rides down by the scroll its drop takes back, and both clear in one commit at rest', async ({
    page,
  }) => {
    const {field, content} = await openAtLastField(page);
    await field.focus();
    await reportAt(page, COVER);
    await waitForRest(content);
    await page.waitForTimeout(100);
    const shown = await readBody(field);
    // How far the body is scrolled into the room: the scroll its drop takes
    // back.
    const intoRoom =
      shown.scrollTop - (shown.scrollHeight - shown.room - shown.clientHeight);
    expect(intoRoom).toBeGreaterThan(100);

    // Back: Chrome reports the keyboard gone while the field keeps focus,
    // about 33 ms into Gboard's slide down.
    const reported = await reportAt(page, 0);
    const held = await readBody(field);
    expect(held.room).toBe(shown.room);
    expect(held.scrollTop).toBe(shown.scrollTop);
    await waitForAnimation(content);
    const start = await content.evaluate(el =>
      Math.max(
        ...el.getAnimations().map(a => Number(a.startTime ?? -Infinity)),
      ),
    );
    expect(
      Math.abs(start - (reported - ANDROID_KEYBOARD.hideReportLagMs)),
    ).toBeLessThan(2);
    const ride = rideOf(await holdAnimations(page, content));
    const samples = curveOf(
      await sampleCurve(content, timeline(ride.offsetMs + ride.curveEndMs)),
      'translateY',
    );
    await releaseAnimations(page);
    const ease = cubicBezier(ANDROID_KEYBOARD.hideCurve);
    const result = compareCurve(
      samples,
      t =>
        intoRoom *
        ease(
          Math.min(
            1,
            Math.max(0, (t - ride.offsetMs) / ANDROID_KEYBOARD.hideMs),
          ),
        ),
      0.5,
    );
    expect(result.maxError, JSON.stringify(result.worst)).toBeLessThanOrEqual(
      0.5,
    );

    // At rest, in one commit: the room is gone, the body's scroll gave back
    // what the content rode, no translate is left, and the field is drawn
    // where the ride took it.
    await waitForRest(content);
    await page.waitForTimeout(100);
    const rest = await readBody(field);
    expect(rest.room).toBe(0);
    expect(translateYOf(rest.contentTranslate)).toBeCloseTo(0, 1);
    expect(rest.scrollTop).toBeCloseTo(shown.scrollTop - intoRoom, 0);
    expect(rest.fieldBottom).toBeCloseTo(shown.fieldBottom + intoRoom, 0);
  });
});
