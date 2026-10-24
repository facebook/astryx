// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AppShellMainKeyboard.a11y.browser.spec.ts
 * @input The `Core/AppShell` stories in a built Storybook, and real Chromium
 *   and WebKit keyboard input.
 * @output Browser evidence that the main region of a `fill` shell is reachable
 *   from the keyboard while it scrolls overflowing content (AST-025 FR12): Tab
 *   reaches it when nothing inside is focusable and Page Down then scrolls it;
 *   Tab entry moves on to its first link when there is one; a main region
 *   that fits stays out of the tab order.
 * @position Cross-browser proof; jsdom has no layout, so AppShell.test.tsx can
 *   only assert the tab stop against mocked geometry.
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

test.use({viewport: {width: 1280, height: 720}});

async function openStory(page: Page, story: string) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-appshell--${story}&viewMode=story`,
  );
  await expect(page.getByRole('main')).toBeVisible();
}

/**
 * Presses Tab from the top of a freshly opened story until focus reaches
 * `isTarget`, or gives up after `limit` presses. Returns how many presses it
 * took, or -1.
 */
async function tabUntil(
  page: Page,
  isTarget: () => boolean,
  limit = 60,
): Promise<number> {
  for (let presses = 1; presses <= limit; presses += 1) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(isTarget)) {
      return presses;
    }
  }
  return -1;
}

test('Tab reaches an overflowing main region with nothing focusable in it, and Page Down scrolls it', async ({
  page,
}) => {
  await openStory(page, 'long-content');
  const main = page.getByRole('main');
  await expect(main).toHaveAttribute('tabindex', '0');

  const presses = await tabUntil(
    page,
    () => document.activeElement?.getAttribute('role') === 'main',
  );
  expect(presses).toBeGreaterThan(0);

  await page.keyboard.press('PageDown');
  await expect
    .poll(async () => main.evaluate(element => element.scrollTop))
    .toBeGreaterThan(100);
});

test('Tab entry moves on to the first link of an overflowing main region, and Shift+Tab skips the region', async ({
  page,
}) => {
  await openStory(page, 'long-content');
  const toMain = await tabUntil(
    page,
    () => document.activeElement?.getAttribute('role') === 'main',
  );
  expect(toMain).toBeGreaterThan(0);

  // A fresh load, so Tab starts from the top again.
  await openStory(page, 'long-content');
  await page.getByRole('main').evaluate(main => {
    const link = document.createElement('a');
    link.href = '#details';
    link.textContent = 'Details';
    main.prepend(link);
  });
  // The press that entered main now lands on its first link: no extra stop.
  const toLink = await tabUntil(
    page,
    () => document.activeElement?.textContent === 'Details',
  );
  expect(toLink).toBe(toMain);

  await page.keyboard.press('Shift+Tab');
  expect(
    await page.evaluate(() => document.activeElement?.getAttribute('role')),
  ).not.toBe('main');
});

test('a main region that fits stays out of the tab order', async ({page}) => {
  await openStory(page, 'playground');
  const main = page.getByRole('main');
  await expect(main).toHaveAttribute('tabindex', '-1');

  const presses = await tabUntil(
    page,
    () => document.activeElement?.getAttribute('role') === 'main',
    40,
  );
  expect(presses).toBe(-1);
});
