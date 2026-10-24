// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavClose.a11y.chromium.spec.ts
 * @input The built MobileNav "Default" story and real Chromium touch input in
 *   a phone context
 * @output Browser evidence that closing the drawer works like a UIKit
 *   dismissal: the dialog stays modal, inert and rendered while the drawer
 *   slides out and the scrim fades to the end; nothing takes a tap during
 *   the slide-out, neither the leaving drawer nor the page; the dialog
 *   closes and focus returns to the opener when the slide-out ends; and the
 *   page takes taps again after that. Under reduced motion it closes at once.
 * @position Chromium proof for MobileNav's close path (MobileNav.tsx); the
 *   jsdom layer is MobileNavCloseVisibility / MobileNavCloseEdgeCases /
 *   MobileNavFocus
 *
 * UIKit ignores touches for the whole of a dismissal, on the presenting view
 * and on the one leaving, and gives input back when it completes (measured on
 * iOS 26.2: taps 0.1 s and 0.25 s into a sheet or full-screen dismissal are
 * dropped before reaching any window).
 */

import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

let storybook: StaticServer;
test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});
test.afterAll(async () => {
  await storybook?.close();
});

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: {width: 402, height: 714},
  deviceScaleFactor: 1,
});

interface LoggedEvent {
  type: 'click' | 'focus' | 'open';
  /** performance.now() in the page, ms. */
  t: number;
  /** The event's target is inside the dialog (or is the dialog). */
  inDialog?: boolean;
  /** The event's target is the dialog itself: its backdrop. */
  onBackdrop?: boolean;
  /** The event's target is inside the drawer panel. */
  inDrawer?: boolean;
  /** The focused element's accessible name, for focus events. */
  name?: string | null;
  /** The dialog's `open` attribute, for open events. */
  open?: boolean;
}

/**
 * Opens the drawer from its button with a tap, waits for the slide-in, and
 * starts logging clicks, focus moves and the dialog's `open` attribute.
 */
async function openNav(page: Page) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-mobilenav--default&viewMode=story`,
  );
  const opener = page.getByRole('button', {name: 'Open Navigation'});
  // A tap focuses the button in Chromium; focusing it first makes the opener
  // explicit for the focus-return assertions.
  await opener.focus();
  await opener.tap();
  const nav = page.getByRole('dialog');
  await expect(nav).toBeVisible();
  const drawer = nav.locator('[tabindex="-1"]').first();
  await drawer.evaluate(async element => {
    await Promise.all(element.getAnimations().map(async a => a.finished));
  });
  const box = await drawer.boundingBox();
  const viewport = page.viewportSize();
  if (box == null || viewport == null) {
    throw new Error('the drawer did not render');
  }
  const durationMs = await drawer.evaluate(element => {
    const value = getComputedStyle(element).transitionDuration.split(',')[0];
    return value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
  });
  await page.evaluate(() => {
    const events: LoggedEvent[] = [];
    (window as unknown as {__events: LoggedEvent[]}).__events = events;
    const dialog = document.querySelector('dialog');
    if (dialog == null) {
      throw new Error('no dialog');
    }
    new MutationObserver(() => {
      events.push({
        type: 'open',
        t: performance.now(),
        open: dialog.hasAttribute('open'),
      });
    }).observe(dialog, {attributes: true, attributeFilter: ['open']});
    document.addEventListener(
      'click',
      event => {
        const target = event.target as Element;
        // Keep the story's nav links from navigating the frame.
        if (target.closest('a')) {
          event.preventDefault();
        }
        events.push({
          type: 'click',
          t: performance.now(),
          inDialog: target.closest('dialog') != null,
          onBackdrop: target === dialog,
          inDrawer: target.closest('dialog [tabindex="-1"]') != null,
        });
      },
      true,
    );
    document.addEventListener(
      'focusin',
      event => {
        const target = event.target as HTMLElement;
        events.push({
          type: 'focus',
          t: performance.now(),
          name: target.getAttribute('aria-label') ?? target.textContent,
        });
      },
      true,
    );
  });
  // The backdrop is the strip the drawer leaves free.
  const strip =
    box.x > 0.5
      ? {from: 0, to: box.x}
      : {from: box.x + box.width, to: viewport.width};
  const backdrop = {x: (strip.from + strip.to) / 2, y: viewport.height / 2};
  return {nav, drawer, durationMs, backdrop};
}

const loggedEvents = async (page: Page) =>
  page.evaluate(
    () => (window as unknown as {__events: LoggedEvent[]}).__events,
  );

const now = async (page: Page) => page.evaluate(() => performance.now());

/** The dialog's state at this instant. */
const state = async (page: Page) =>
  page.evaluate(() => {
    const dialog = document.querySelector('dialog');
    const drawer = dialog?.querySelector<HTMLElement>('[tabindex="-1"]');
    return {
      modal: dialog?.matches(':modal') ?? false,
      drawerInert: drawer?.inert ?? false,
      scrim:
        dialog == null ? null : +getComputedStyle(dialog, '::backdrop').opacity,
      focusInDrawer: drawer != null && drawer.contains(document.activeElement),
      focusOnOpener:
        document.activeElement?.getAttribute('aria-label') ===
        'Open Navigation',
    };
  });

test('the dialog stays modal while the drawer slides out, then closes and returns focus', async ({
  page,
}) => {
  const {durationMs, backdrop} = await openNav(page);
  expect(durationMs).toBeGreaterThan(100);

  await page.touchscreen.tap(backdrop.x, backdrop.y);
  const closeTapped = await now(page);
  await page.waitForTimeout(durationMs * 0.5);
  const midway = await state(page);
  await page.waitForTimeout(durationMs * 0.5 + 200);

  // Midway: still the modal dialog holding the page, the drawer inert, the
  // scrim part of the way out, and focus on neither the drawer nor the opener
  // (Chromium parks it on the dialog element once the drawer goes inert).
  expect(midway.modal).toBe(true);
  expect(midway.drawerInert).toBe(true);
  expect(midway.scrim).toBeGreaterThan(0);
  expect(midway.scrim).toBeLessThan(1);
  expect(midway.focusInDrawer).toBe(false);
  expect(midway.focusOnOpener).toBe(false);

  // The dialog closed when the slide-out ended, not before...
  const events = await loggedEvents(page);
  const closed = events.find(e => e.type === 'open' && e.open === false);
  expect(closed).toBeDefined();
  expect((closed?.t ?? 0) - closeTapped).toBeGreaterThanOrEqual(
    durationMs - 30,
  );
  // ...and focus went back to the opener once it had.
  const returned = events.find(
    e => e.type === 'focus' && e.name === 'Open Navigation',
  );
  expect(returned).toBeDefined();
  // Same task as the close; the observer logs the close a microtask later.
  expect(returned?.t ?? 0).toBeGreaterThanOrEqual((closed?.t ?? Infinity) - 2);
  expect((await state(page)).modal).toBe(false);
});

test('a tap on the leaving drawer does nothing', async ({page}) => {
  const {nav, durationMs} = await openNav(page);
  const link = nav.getByRole('link', {name: 'Projects'});

  await nav.getByRole('button', {name: /close navigation/i}).tap();
  // Tap where the link is right now, early in the slide-out.
  const box = await link.boundingBox();
  if (box == null) {
    throw new Error('no link box');
  }
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(durationMs + 200);

  // The close button's own click is the only click on the drawer.
  const events = await loggedEvents(page);
  expect(events.filter(e => e.type === 'click' && e.inDrawer)).toHaveLength(1);
});

test('the page takes taps again only once the slide-out has ended', async ({
  page,
}) => {
  const {durationMs, backdrop} = await openNav(page);

  await page.touchscreen.tap(backdrop.x, backdrop.y);
  await page.waitForTimeout(durationMs * 0.75);
  // Late in the slide-out: dropped, like a tap in a UIKit dismissal.
  await page.touchscreen.tap(backdrop.x, backdrop.y);
  await page.waitForTimeout(durationMs * 0.25 + 200);
  // After it: the page takes it.
  await page.touchscreen.tap(backdrop.x, backdrop.y);

  const events = await loggedEvents(page);
  const closed = events.find(e => e.type === 'open' && e.open === false);
  expect(closed).toBeDefined();
  const clicks = events.filter(e => e.type === 'click');
  const pageClicks = clicks.filter(e => !e.inDialog);
  // The page got exactly one click: the one after the close. The late tap
  // reached only the dialog's backdrop (which can only ask to close again),
  // never the page and never the drawer.
  expect(pageClicks).toHaveLength(1);
  expect(pageClicks[0].t).toBeGreaterThan(closed?.t ?? Infinity);
  expect(clicks.some(e => e.inDrawer)).toBe(false);
  expect(clicks.filter(e => e.inDialog).every(e => e.onBackdrop)).toBe(true);
});

test.describe('with reduced motion', () => {
  test('the drawer closes at once and focus returns', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    const {backdrop} = await openNav(page);

    await page.touchscreen.tap(backdrop.x, backdrop.y);
    const closeTapped = await now(page);
    await page.waitForTimeout(200);

    const events = await loggedEvents(page);
    const closed = events.find(e => e.type === 'open' && e.open === false);
    expect(closed).toBeDefined();
    expect((closed?.t ?? Infinity) - closeTapped).toBeLessThan(100);
    expect(
      events.some(e => e.type === 'focus' && e.name === 'Open Navigation'),
    ).toBe(true);
  });
});
