// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ContextMenuOpenFocus.a11y.chromium.spec.ts
 * @input The `Core/ContextMenu` Default story in a built Storybook, a real
 *   mouse right-click, and a CDP touch long press.
 * @output Real-engine proof that a pointer-opened context menu focuses the
 *   menu itself and highlights no row.
 * @position Run with `pnpm test:a11y-contract`; jsdom cannot produce a real
 *   right-click or a held finger.
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

const STORY = 'core-contextmenu--default';
const TRIGGER_TEXT = 'Right-click this area';

async function focusedRole(page: Page): Promise<string | null> {
  return page.evaluate(
    () => document.activeElement?.getAttribute('role') ?? null,
  );
}

async function triggerCenter(page: Page): Promise<{x: number; y: number}> {
  const box = await page.getByText(TRIGGER_TEXT).boundingBox();
  if (box == null) {
    throw new Error('the trigger area has no rendered bounds');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

test('a right-click opens with the menu focused and no row highlighted', async ({
  page,
}) => {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  const center = await triggerCenter(page);
  await page.mouse.click(center.x, center.y, {button: 'right'});
  await expect(page.getByRole('menu')).toBeVisible();
  await expect.poll(async () => focusedRole(page)).toBe('menu');
  // Arrows still work from the menu: the first press lands on the first row.
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', {name: 'Cut'})).toBeFocused();
});

test('a long press opens with the menu focused and no row highlighted', async ({
  page,
}) => {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 1,
  });
  const center = await triggerCenter(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{x: center.x, y: center.y, id: 1}],
  });
  // Read while the finger is still down: the open's focus is what is
  // measured here, not what the lift does afterwards.
  await expect(page.getByRole('menu')).toBeVisible({timeout: 2000});
  await expect.poll(async () => focusedRole(page)).toBe('menu');
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
});
