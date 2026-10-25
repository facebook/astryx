// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TabPressPointer.interaction.browser.spec.ts
 * @input Uses @playwright/test and the interaction harness (a built
 *   Storybook)
 * @output Proves a Tab's hover and press layer under a fine and a coarse
 *   primary pointer
 * @position Interaction proof for packages/core/src/TabList/Tab.tsx
 *
 * Tab's press layer has a hover branch and a coarse-pointer rule, which
 * StyleX makes exclusive. The outcome on every pointer: a fine pointer paints the hover and the
 * pressed overlay; a coarse pointer leaves the colour layer transparent on
 * press (the touch press paints as an image instead). Chromium only: it
 * holds a finger through the DevTools protocol.
 */

import {expect, test, type Page} from '@playwright/test';
import {openStory, withStorybook} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/** The "Projects" tab: not the story's current one. */
function projectsTab(page: Page) {
  return page.locator('button', {hasText: 'Projects'}).first();
}

/** The tab's colour layer (its first aria-hidden span) and the pointer. */
async function tabState(
  page: Page,
): Promise<{colour: string; coarse: boolean; hover: boolean}> {
  return projectsTab(page).evaluate(element => {
    const layer = element.querySelector('span[aria-hidden="true"]');
    return {
      colour: layer == null ? '' : getComputedStyle(layer).backgroundColor,
      coarse: matchMedia('(pointer: coarse)').matches,
      hover: matchMedia('(hover: hover)').matches,
    };
  });
}

/** A finger held on the tab's centre; returns the lift. */
async function holdFinger(page: Page): Promise<() => Promise<void>> {
  const box = await projectsTab(page).boundingBox();
  if (box == null) {
    throw new Error('the Projects tab has no box');
  }
  const point = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [point],
  });
  return async () => {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  };
}

test.describe('Tab press layer by pointer', () => {
  test.skip(
    ({browserName}) => browserName !== 'chromium',
    'Chromium holds a finger through the DevTools protocol',
  );

  test.describe('fine pointer with hover', () => {
    test.use({isMobile: false, hasTouch: false});
    test('paints the hover and the pressed overlay', async ({page}) => {
      await openStory(page, storybook(), 'core-tablist--default');
      await projectsTab(page).hover();
      const hovered = await tabState(page);
      expect(hovered.coarse).toBe(false);
      expect(hovered.hover).toBe(true);
      // The layer's colour transitions in: wait for it to land.
      await expect
        .poll(async () => (await tabState(page)).colour)
        .not.toBe(TRANSPARENT);
      await page.mouse.down();
      await expect
        .poll(async () => (await tabState(page)).colour)
        .not.toBe(TRANSPARENT);
      await page.mouse.up();
    });
  });

  test('coarse pointer: the colour layer stays transparent on press', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-tablist--default');
    const lift = await holdFinger(page);
    const pressed = await tabState(page);
    expect(pressed.coarse).toBe(true);
    // Past any colour transition, it is still transparent.
    await page.waitForTimeout(400);
    expect((await tabState(page)).colour).toBe(TRANSPARENT);
    await lift();
  });
});
