// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DrawerTouchEntrance.interaction.browser.spec.ts
 * @input The built Drawer stories "Showcase" (modal, with a scrim) and "Row
 *   Inspector" (non-modal), real touch input through the interaction harness
 *   in its phone context, and a mouse there and on a fine-pointer page
 * @output Browser evidence for spec:AST-094 FR35 on Drawer: under a finger, a
 *   tap or a drag that lands while the drawer is still sliding in closes
 *   nothing, runs no action, moves no focus and scrolls nothing, and the
 *   drawer finishes sliding in and stays open; keys stay live and the content
 *   stays in the accessibility tree meanwhile. With a mouse, a click during
 *   the slide-in acts as before, on a touch screen too: the hold decides by
 *   each event's pointer.
 * @position Browser proof for Drawer's entrance hold (useDrawerDialogPresence,
 *   through the Layer module's holdEntranceInput); the hold itself is proven
 *   in Layer/__tests__/inputHold.interaction.browser.spec.ts
 *
 * Each case holds the slide-in where it is (holdAnimations), so every touch
 * lands while the drawer is still entering whatever the machine's speed;
 * releasing it lets the slide-in finish. On the phone the drawer leaves a
 * 56 px strip of the page (or its scrim) at the start edge.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  drag,
  frames,
  holdAnimations,
  openStory,
  releaseAnimations,
  seekAnimations,
  touchDriver,
  withStorybook,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

type Point = {x: number; y: number};

const MODAL = 'core-drawer--showcase';
const NON_MODAL = 'core-drawer--row-inspector';

/** A point in the strip the drawer leaves free: the scrim, or the page. */
const STRIP: Point = {x: 20, y: 357};

const OPEN = 'dialog[open], dialog:popover-open';

async function centerOf(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('the element did not render');
  }
  return {
    x: Math.round(box.x + box.width / 2),
    y: Math.round(box.y + box.height / 2),
  };
}

const openDrawers = (page: Page) => page.locator(OPEN);

/** Waits until the open drawer's slide-in is running, then holds it there. */
async function holdEntrance(page: Page): Promise<void> {
  await page.waitForFunction(
    selector =>
      document
        .querySelector(selector)
        ?.getAnimations()
        .some(animation => animation.playState === 'running') ?? false,
    OPEN,
  );
  const held = await holdAnimations(page, openDrawers(page));
  expect(held.length, 'the drawer is still sliding in').toBeGreaterThan(0);
}

/**
 * Moves the held slide-in to 30 ms before its end: the panel is nearly in
 * place, so a control inside it is on screen, and the drawer is still
 * entering.
 */
async function seekNearEnd(page: Page): Promise<void> {
  const endMs = await openDrawers(page).evaluate(drawer =>
    Math.max(
      ...drawer
        .getAnimations()
        .map(animation =>
          Number(animation.effect?.getComputedTiming().endTime ?? 0),
        ),
    ),
  );
  await seekAnimations(page, endMs - 30);
}

/** Lets the held slide-in play to its end. */
async function finishEntrance(page: Page): Promise<void> {
  await releaseAnimations(page);
  await openDrawers(page).evaluate(async drawer => {
    await Promise.all(
      drawer
        .getAnimations()
        .map(async animation => animation.finished.catch(() => undefined)),
    );
  });
  await frames(page);
}

/** Opens the story's drawer with a tap and holds its slide-in midway. */
async function openMidEntrance(
  page: Page,
  story: string,
  opener: string,
): Promise<TouchDriver> {
  await openStory(page, storybook(), story);
  const driver = await touchDriver(page);
  await driver.tap(await centerOf(page.getByRole('button', {name: opener})));
  await holdEntrance(page);
  return driver;
}

/**
 * Plays a drag twice. Chromium drops the first scroll gesture after a page
 * loads or a top-layer element opens (measured here: unheld, the first drag
 * after the drawer opens scrolls nothing, the second scrolls 303 px), so a
 * single drag would prove nothing about the hold.
 */
async function dragTwice(
  page: Page,
  driver: TouchDriver,
  script: Parameters<TouchDriver['play']>[0],
): Promise<void> {
  for (let i = 0; i < 2; i++) {
    await driver.play(script);
    await frames(page, 4);
  }
}

/** What has focus: its tag and accessible name. */
const focusedElement = async (page: Page) =>
  page.evaluate(() => {
    const element = document.activeElement;
    if (element == null) {
      return 'none';
    }
    const name =
      element.getAttribute('aria-label') ?? element.textContent?.trim() ?? '';
    return `${element.tagName.toLowerCase()}:${name.slice(0, 40)}`;
  });

test.describe('under a finger (spec:AST-094 FR35)', () => {
  test('a tap on the scrim while the drawer slides in closes nothing, and once it is in the same tap closes it', async ({
    page,
  }) => {
    const driver = await openMidEntrance(page, MODAL, 'Open inspector');

    await driver.tap(STRIP);
    await frames(page);
    await expect(openDrawers(page)).toHaveCount(1);

    await finishEntrance(page);
    await expect(
      page.getByRole('dialog', {name: 'Deployment details'}),
    ).toBeVisible();

    await driver.tap(STRIP);
    await expect(openDrawers(page)).toHaveCount(0);
  });

  test('a tap on its close button while the drawer slides in runs nothing and moves no focus', async ({
    page,
  }) => {
    const driver = await openMidEntrance(page, MODAL, 'Open inspector');
    await seekNearEnd(page);
    const close = openDrawers(page).getByRole('button', {name: 'Close'});
    const target = await centerOf(close);
    expect(target.x, 'the close button is on screen').toBeLessThan(
      page.viewportSize()?.width ?? 0,
    );
    // Focus starts inside the drawer, on its content area.
    expect(
      await openDrawers(page).evaluate(drawer =>
        drawer.contains(document.activeElement),
      ),
    ).toBe(true);
    const focused = await focusedElement(page);

    await driver.tap(target);
    await frames(page);
    await expect(openDrawers(page)).toHaveCount(1);
    expect(await focusedElement(page)).toBe(focused);

    await finishEntrance(page);
    await expect(openDrawers(page)).toHaveCount(1);

    await driver.tap(await centerOf(close));
    await expect(openDrawers(page)).toHaveCount(0);
  });

  test('a drag or a tap on the page while a non-modal drawer slides in reaches nothing, and once it is in a tap reaches the page', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'webkit',
      'needs native scrolling from injected touches (the WebKit driver has none)',
    );
    await openStory(page, storybook(), NON_MODAL);
    // A page that scrolls behind the drawer, which leaves it interactive.
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.style.height = '300vh';
      document.body.append(spacer);
    });
    const driver = await touchDriver(page);
    const up = drag(
      {x: STRIP.x, y: 600},
      {x: STRIP.x, y: 250},
      // A rest before the lift: no fling outlives the pan.
      {durationMs: 200, restMs: 150},
    );
    const scrollY = async () => page.evaluate(() => window.scrollY);
    // Unheld, the same drag scrolls the page (see dragTwice).
    await dragTwice(page, driver, up);
    expect(await scrollY()).toBeGreaterThan(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await frames(page, 2);

    await driver.tap(
      await centerOf(page.getByRole('button', {name: 'Open drawer'})),
    );
    await holdEntrance(page);
    // The page's own clicks: those that reach it and bubble.
    await page.evaluate(() => {
      const clicks: string[] = [];
      (window as unknown as {__pageClicks: string[]}).__pageClicks = clicks;
      document.addEventListener('click', event => {
        const target = event.target as Element;
        if (target.closest('dialog') == null) {
          clicks.push(target.tagName.toLowerCase());
        }
      });
    });
    const pageClicks = async () =>
      page.evaluate(
        () => (window as unknown as {__pageClicks: string[]}).__pageClicks,
      );

    await dragTwice(page, driver, up);
    expect(await scrollY()).toBe(0);
    await driver.tap(STRIP);
    await frames(page);
    expect(await pageClicks()).toEqual([]);
    await expect(openDrawers(page)).toHaveCount(1);

    // Once the drawer is in, input reaches the page again.
    await finishEntrance(page);
    await driver.tap(STRIP);
    await expect.poll(async () => (await pageClicks()).length).toBe(1);
  });

  test('keys and assistive technology stay live while the drawer slides in', async ({
    page,
  }) => {
    await openMidEntrance(page, MODAL, 'Open inspector');

    // The content stays in the accessibility tree, close button included.
    const tree = await page
      .getByRole('dialog', {name: 'Deployment details'})
      .ariaSnapshot();
    expect(tree).toContain('button "Close"');

    // A key acts at once: Escape closes the drawer mid-slide.
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('dialog', {name: 'Deployment details'}),
    ).toBeHidden();
  });
});

test.describe('with a mouse on a touch screen', () => {
  test('a click on the scrim while the drawer slides in closes it, as before: only a finger is held', async ({
    page,
  }) => {
    await openMidEntrance(page, MODAL, 'Open inspector');
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
      'the primary pointer is a finger',
    ).toBe(true);

    await page.mouse.click(STRIP.x, STRIP.y);
    await expect(
      page.getByRole('dialog', {name: 'Deployment details'}),
    ).toBeHidden();
  });
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('a click on the scrim while the drawer slides in closes it, as before', async ({
    page,
  }) => {
    await openStory(page, storybook(), MODAL);
    await page.getByRole('button', {name: 'Open inspector'}).click();
    await holdEntrance(page);

    await page.mouse.click(STRIP.x, STRIP.y);
    await expect(
      page.getByRole('dialog', {name: 'Deployment details'}),
    ).toBeHidden();
  });
});
