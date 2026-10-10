// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MenuHostedControls.a11y.chromium.spec.ts
 * @input The `Core/DropdownMenu` HostedControls story in a built Storybook, a
 *   real mouse, and CDP touch on a phone-sized viewport.
 * @output Real-engine proof that a checkbox and a button a menu hosts beside
 *   its rows keep the browser's own press while the rows keep the press model.
 * @position Run with `pnpm test:a11y-contract`; jsdom cannot show what a
 *   cancelled finger `pointerdown` and a swallowed click do to a real control.
 */

import {expect, test, type Page, type CDPSession} from '@playwright/test';
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

const STORY = 'core-dropdownmenu--hosted-controls';
const TRIGGER = '#storybook-root [aria-haspopup="menu"]';

async function center(
  page: Page,
  locator: ReturnType<Page['locator']>,
): Promise<{x: number; y: number}> {
  const box = await locator.boundingBox();
  if (box == null) {
    throw new Error('no rendered bounds');
  }
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

async function tap(cdp: CDPSession, p: {x: number; y: number}) {
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{x: p.x, y: p.y, id: 1}],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
}

test('a mouse click on a hosted button acts, and a row still acts on release', async ({
  page,
}) => {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  await page.locator(TRIGGER).click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();

  await page.getByRole('button', {name: 'Create label'}).click();
  await expect(page.getByTestId('created')).toHaveText('1');
  await expect(menu).toBeVisible();

  // A press that lands on a row is still the model's: dragged from Bug to
  // Feature, the release acts on Feature and closes the menu.
  const bug = await center(page, page.getByRole('menuitem', {name: 'Bug'}));
  const feature = await center(
    page,
    page.getByRole('menuitem', {name: 'Feature'}),
  );
  await page.mouse.move(bug.x, bug.y);
  await page.mouse.down();
  await page.mouse.move(feature.x, feature.y, {steps: 4});
  await page.mouse.up();
  await expect(menu).toBeHidden();
});

test('a finger tap on a hosted checkbox toggles it, and the menu stays open', async ({
  page,
}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', {
    enabled: true,
    maxTouchPoints: 2,
  });
  await tap(cdp, await center(page, page.locator(TRIGGER)));
  await expect(page.getByRole('menu')).toBeVisible();

  const checkbox = page.getByRole('checkbox', {name: 'Show archived'});
  await expect(checkbox).not.toBeChecked();
  await tap(cdp, await center(page, checkbox));
  await expect(checkbox).toBeChecked();
  await expect(page.getByRole('menu')).toBeVisible();
});
