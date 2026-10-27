// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DialogTouchEntrance.interaction.browser.spec.ts
 * @input The built Dialog stories "Purpose Info" and "Scrolling Content" and
 *   the AlertDialog story "Delete", real touch input through the interaction
 *   harness in its phone context, and a mouse there and on a fine-pointer
 *   page
 * @output Browser evidence for spec:AST-094 FR35 on Dialog: under a finger, a
 *   tap or a drag that lands while the dialog is still entering closes
 *   nothing, runs no action, moves no focus and scrolls nothing, and the
 *   dialog finishes entering and stays open; keys stay live and the content
 *   stays in the accessibility tree meanwhile; an alert's entrance holds its
 *   action alike. With a mouse, a click during the entrance acts as before,
 *   on a touch screen too: the hold decides by each event's pointer.
 * @position Browser proof for Dialog's entrance hold (Dialog.tsx, through the
 *   Layer module's holdEntranceInput); the hold itself is proven in
 *   Layer/__tests__/inputHold.interaction.browser.spec.ts
 *
 * Each case holds the entrance where it is (holdAnimations), so every touch
 * lands while the dialog is still entering whatever the machine's speed;
 * releasing it lets the entrance finish.
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  drag,
  frames,
  holdAnimations,
  openStory,
  releaseAnimations,
  touchDriver,
  withStorybook,
  type TouchDriver,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

type Point = {x: number; y: number};

const INFO = 'core-dialog--purpose-info';
const SCROLLING = 'core-dialog--scrolling-content';
const ALERT = 'core-alertdialog--delete';

/** A point on the backdrop: the top of the viewport, above the dialog. */
const BACKDROP: Point = {x: 201, y: 6};

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

const openDialogs = (page: Page) => page.locator('dialog[open]');

/** Waits until the open dialog's entrance is running, then holds it there. */
async function holdEntrance(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      document
        .querySelector('dialog[open]')
        ?.getAnimations()
        .some(animation => animation.playState === 'running') ?? false,
  );
  const held = await holdAnimations(page, openDialogs(page));
  expect(held.length, 'the dialog is still entering').toBeGreaterThan(0);
}

/** Lets the held entrance play to its end. */
async function finishEntrance(page: Page): Promise<void> {
  await releaseAnimations(page);
  await openDialogs(page).evaluate(async dialog => {
    await Promise.all(
      dialog
        .getAnimations()
        .map(async animation => animation.finished.catch(() => undefined)),
    );
  });
  await frames(page);
}

/** Opens the story's dialog with a tap and holds its entrance midway. */
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
 * Plays a drag twice. Chromium can drop the first scroll gesture after a
 * top-layer element opens, so a single drag would prove nothing about the
 * hold.
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
  test('a tap on the backdrop while the dialog enters closes nothing, and once it has entered the same tap closes it', async ({
    page,
  }) => {
    const driver = await openMidEntrance(page, INFO, 'Open Info Modal');

    await driver.tap(BACKDROP);
    await frames(page);
    await expect(openDialogs(page)).toHaveCount(1);

    await finishEntrance(page);
    await expect(page.getByRole('dialog', {name: 'Information'})).toBeVisible();

    await driver.tap(BACKDROP);
    await expect(openDialogs(page)).toHaveCount(0);
  });

  test('a tap on an action while the dialog enters runs nothing and moves no focus', async ({
    page,
  }) => {
    const driver = await openMidEntrance(page, INFO, 'Open Info Modal');
    const action = page.getByRole('button', {name: 'Got it'});
    // Focus starts inside the dialog, where opening it put it.
    expect(
      await openDialogs(page).evaluate(dialog =>
        dialog.contains(document.activeElement),
      ),
    ).toBe(true);
    const focused = await focusedElement(page);

    await driver.tap(await centerOf(action));
    await frames(page);
    await expect(openDialogs(page)).toHaveCount(1);
    expect(await focusedElement(page)).toBe(focused);

    await finishEntrance(page);
    await expect(openDialogs(page)).toHaveCount(1);

    await driver.tap(await centerOf(action));
    await expect(openDialogs(page)).toHaveCount(0);
  });

  test('a drag while the dialog enters scrolls nothing, and once it has entered the same drag scrolls its content', async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'webkit',
      'needs native scrolling from injected touches (the WebKit driver has none)',
    );
    const driver = await openMidEntrance(
      page,
      SCROLLING,
      'Open Scrolling Modal',
    );
    // The dialog's own scroller: its content area.
    const content = await openDialogs(page).evaluateHandle(dialog => {
      for (const element of dialog.querySelectorAll('*')) {
        const {overflowY} = getComputedStyle(element);
        if (
          (overflowY === 'auto' || overflowY === 'scroll') &&
          element.scrollHeight > element.clientHeight
        ) {
          return element;
        }
      }
      throw new Error('the dialog has no scrolling content');
    });
    const box = await content.asElement()?.boundingBox();
    if (box == null) {
      throw new Error('the content did not render');
    }
    const x = Math.round(box.x + box.width / 2);
    const up = drag(
      {x, y: Math.round(box.y + box.height * 0.8)},
      {x, y: Math.round(box.y + box.height * 0.2)},
      // A rest before the lift: no fling outlives the pan.
      {durationMs: 200, restMs: 150},
    );
    const scrollTop = async () =>
      content.evaluate(element => element.scrollTop);

    await dragTwice(page, driver, up);
    expect(await scrollTop()).toBe(0);
    await expect(openDialogs(page)).toHaveCount(1);

    await finishEntrance(page);
    await dragTwice(page, driver, up);
    expect(await scrollTop()).toBeGreaterThan(0);
  });

  test("a tap on an alert's action while it enters runs nothing, and once it has entered the same tap runs it", async ({
    page,
  }) => {
    const driver = await openMidEntrance(page, ALERT, 'Delete item');
    const action = page.getByRole('button', {name: 'Delete', exact: true});

    await driver.tap(await centerOf(action));
    await frames(page);
    await expect(openDialogs(page)).toHaveCount(1);

    await finishEntrance(page);
    await expect(openDialogs(page)).toHaveCount(1);

    await driver.tap(await centerOf(action));
    await expect(openDialogs(page)).toHaveCount(0);
  });

  test('keys and assistive technology stay live while the dialog enters', async ({
    page,
  }) => {
    await openMidEntrance(page, INFO, 'Open Info Modal');

    // The content stays in the accessibility tree, action included.
    const tree = await page
      .getByRole('dialog', {name: 'Information'})
      .ariaSnapshot();
    expect(tree).toContain('button "Got it"');

    // A key acts at once: Escape closes the dialog mid-entrance.
    await page.keyboard.press('Escape');
    await expect(openDialogs(page)).toHaveCount(0);
  });
});

test.describe('with a mouse on a touch screen', () => {
  test('a click on the backdrop while the dialog enters closes it, as before: only a finger is held', async ({
    page,
  }) => {
    await openMidEntrance(page, INFO, 'Open Info Modal');
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
      'the primary pointer is a finger',
    ).toBe(true);

    await page.mouse.click(BACKDROP.x, BACKDROP.y);
    await expect(openDialogs(page)).toHaveCount(0);
  });

  test('a mouse press with no movement first, on an action while the dialog enters, runs it, as before', async ({
    page,
  }) => {
    // Under Reduce Motion the dialog only fades in, so its action stays where
    // the mouse rests.
    await page.emulateMedia({reducedMotion: 'reduce'});
    await openStory(page, storybook(), INFO);
    const opener = page.getByRole('button', {name: 'Open Info Modal'});
    // A first presentation, which a mouse opens and a key closes: from it on
    // the page's input hold knows the latest pointer.
    await opener.click();
    await expect(openDialogs(page)).toHaveCount(1);
    await finishEntrance(page);
    const action = await centerOf(page.getByRole('button', {name: 'Got it'}));
    await page.keyboard.press('Escape');
    await expect(openDialogs(page)).toHaveCount(0);
    // The mouse comes to rest where the action appears; a key opens the
    // dialog again.
    await page.mouse.move(action.x - 40, action.y);
    await page.mouse.move(action.x, action.y, {steps: 4});
    // What each click lands on, heard first, before any hold.
    await page.evaluate(() => {
      const clicks: string[] = [];
      (window as unknown as {__clicks: string[]}).__clicks = clicks;
      window.addEventListener(
        'click',
        event => {
          const target = event.target as Element;
          clicks.push(target.closest('button')?.textContent?.trim() ?? '');
        },
        {capture: true},
      );
    });
    await opener.focus();
    await page.keyboard.press('Enter');
    await holdEntrance(page);

    // A press where the mouse already is, with no movement first: it lands on
    // the action (after the key's own click on the opener).
    await page.mouse.down();
    await page.mouse.up();
    await expect
      .poll(async () =>
        page.evaluate(
          () => (window as unknown as {__clicks: string[]}).__clicks,
        ),
      )
      .toEqual(['Open Info Modal', 'Got it']);
    await expect(openDialogs(page)).toHaveCount(0);
  });
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('a click on the backdrop while the dialog enters closes it, as before', async ({
    page,
  }) => {
    await openStory(page, storybook(), INFO);
    await page.getByRole('button', {name: 'Open Info Modal'}).click();
    await holdEntrance(page);

    await page.mouse.click(BACKDROP.x, BACKDROP.y);
    await expect(openDialogs(page)).toHaveCount(0);
  });
});
