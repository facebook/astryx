// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetNativeModal.a11y.browser.spec.ts
 * @input The `Core/BottomSheetSwitcher` stories in a built Storybook, and
 *   real Chromium/WebKit wheel, keyboard, and pointer input.
 * @output Browser evidence for what the native modal dialog and one CSS rule
 *   do for a sheet, without script: page scroll locked exactly while a sheet
 *   dialog is modal (through a handoff and under another modal dialog), Tab
 *   kept inside the active sheet, Escape and the backdrop dismissing by
 *   purpose, focus returned to the opener, and one steady scrim through a
 *   handoff.
 * @position Cross-browser proof; jsdom evaluates neither `:modal` nor
 *   `:has()`, so BottomSheetSwitcher.test.tsx can only read the lock's
 *   precondition. WebKit here is desktop WebKit under Playwright: it tells
 *   how the engine reads the rule, not how iOS hardware scrolls by touch.
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

test.use({viewport: {width: 390, height: 844}, hasTouch: true});

const OPENER = 'Set up notifications';

/**
 * Open a switcher story with the flow closed and the page made scrollable:
 * a tall spacer below the story, scrolled part way down, so a lock that
 * fails would show as a change in `scrollY`.
 */
async function mountScrollable(page: Page, story = 'hug-content') {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-bottomsheetswitcher--${story}&viewMode=story`,
  );
  // The story's play function opens the flow; start from closed.
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.evaluate(() => {
    const spacer = document.createElement('div');
    spacer.id = 'spacer';
    spacer.style.height = '3000px';
    document.body.appendChild(spacer);
    window.scrollTo(0, 300);
  });
  expect(await page.evaluate(() => window.scrollY)).toBe(300);
}

async function rootOverflow(page: Page): Promise<string> {
  return page.evaluate(
    () => getComputedStyle(document.documentElement).overflow,
  );
}

async function wheelDown(page: Page): Promise<number> {
  // Over the top of the viewport: the backdrop when a modal sheet is open,
  // the page otherwise.
  await page.mouse.move(195, 80);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(250);
  return page.evaluate(() => window.scrollY);
}

/**
 * Open the flow from its opener without scrolling the page: a pointer click
 * would first scroll the opener into view, and the lock tests need the page
 * to stay where it was scrolled. The opener is focused first, as a real
 * activation would leave it, so focus return has somewhere to go.
 */
async function openFlow(page: Page) {
  await page.evaluate(name => {
    const opener = Array.from(document.querySelectorAll('button')).find(
      button => button.textContent?.trim() === name,
    );
    opener?.focus({preventScroll: true});
    opener?.click();
  }, OPENER);
  await expect(page.getByRole('dialog', {name: OPENER})).toBeVisible();
  await page.waitForTimeout(500);
}

test('a modal sheet locks page scroll by CSS, through a handoff, under another modal dialog, and only while a sheet dialog is modal', async ({
  page,
}) => {
  await mountScrollable(page);
  expect(await rootOverflow(page)).toBe('visible');
  // The page scrolls before the flow opens.
  expect(await wheelDown(page)).toBeGreaterThan(300);
  await page.evaluate(() => window.scrollTo(0, 300));

  await openFlow(page);
  expect(await rootOverflow(page)).toBe('hidden');
  expect(await wheelDown(page)).toBe(300);
  // No script pinned the body.
  expect(
    await page.evaluate(() => document.body.style.position || 'none'),
  ).toBe('none');

  // Through a handoff two sheet dialogs are open; the lock never lapses.
  await page.getByRole('button', {name: 'Continue', exact: true}).click();
  await expect(page.locator('dialog[open]')).toHaveCount(2);
  expect(await rootOverflow(page)).toBe('hidden');
  expect(await wheelDown(page)).toBe(300);
  await expect(page.locator('dialog[open]')).toHaveCount(1, {timeout: 3000});
  expect(await rootOverflow(page)).toBe('hidden');

  // Another modal dialog on top (what a Core Dialog opened from a step is):
  // the sheet beneath stays `:modal`, so the lock holds while it is open and
  // after it closes.
  await page.evaluate(() => {
    const probe = document.createElement('dialog');
    probe.id = 'probe';
    probe.textContent = 'probe';
    document.body.appendChild(probe);
    probe.showModal();
  });
  expect(await rootOverflow(page)).toBe('hidden');
  expect(await wheelDown(page)).toBe(300);
  await page.evaluate(() => {
    const probe = document.getElementById('probe') as HTMLDialogElement;
    probe.close();
    probe.remove();
  });
  expect(await rootOverflow(page)).toBe('hidden');

  // Scroll inside the sheet does not chain to the page.
  const body = page.getByRole('dialog').getByRole('group');
  if ((await body.count()) > 0) {
    await body.first().hover();
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => window.scrollY)).toBe(300);
  }

  // Closing releases the lock only once the last dialog has left the top
  // layer, after its exit motion.
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0, {timeout: 3000});
  expect(await rootOverflow(page)).toBe('visible');
  expect(await page.evaluate(() => window.scrollY)).toBe(300);
  expect(await wheelDown(page)).toBeGreaterThan(300);
});

test('a non-modal flow locks nothing', async ({page}) => {
  await mountScrollable(page, 'no-scrim');
  await openFlow(page);
  expect(await rootOverflow(page)).toBe('visible');
  expect(await wheelDown(page)).toBeGreaterThan(300);
});

test('Tab stays inside the active sheet of a modal flow', async ({page}) => {
  await mountScrollable(page);
  await openFlow(page);
  await page.getByRole('button', {name: 'Continue', exact: true}).click();
  await page.waitForTimeout(900);
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    const where = await page.evaluate(() => {
      const active = document.activeElement;
      if (active == null || active === document.body) {
        return 'body';
      }
      const dialog = active.closest('dialog');
      return dialog == null
        ? 'page'
        : dialog.hasAttribute('inert')
          ? 'retained'
          : 'active';
    });
    expect(where, `after ${index + 1} Tab presses`).not.toBe('page');
    expect(where, `after ${index + 1} Tab presses`).not.toBe('retained');
  }
});

test('Escape and a backdrop tap dismiss an info flow and return focus to the opener', async ({
  page,
}) => {
  await mountScrollable(page);
  const opener = page.getByRole('button', {name: OPENER});
  await openFlow(page);
  await page.getByRole('button', {name: 'Continue', exact: true}).click();
  await page.waitForTimeout(900);

  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0, {timeout: 3000});
  await expect(opener).toBeFocused();

  await openFlow(page);
  await page.mouse.click(195, 60);
  await expect(page.locator('dialog[open]')).toHaveCount(0, {timeout: 3000});
  await expect(opener).toBeFocused();
});

test('one steady scrim through a handoff: no dip and no double dim', async ({
  page,
}) => {
  await mountScrollable(page);
  await openFlow(page);
  const samples = await page.evaluate(
    async () =>
      new Promise<number[]>(resolve => {
        const dims: number[] = [];
        const start = performance.now();
        const tick = () => {
          let combined = 1;
          for (const dialog of document.querySelectorAll('dialog[open]')) {
            if (!dialog.matches(':modal')) {
              continue;
            }
            const style = getComputedStyle(dialog, '::backdrop');
            const match = /rgba?\(([^)]+)\)/.exec(style.backgroundColor);
            const parts = match
              ? match[1].split(/[,/]\s*|\s+/).filter(Boolean)
              : [];
            const alpha = parts.length === 4 ? Number(parts[3]) : 1;
            combined *= 1 - alpha * Number(style.opacity);
          }
          dims.push(Number((1 - combined).toFixed(3)));
          if (performance.now() - start < 1100) {
            requestAnimationFrame(tick);
          } else {
            resolve(dims);
          }
        };
        Array.from(
          document.querySelectorAll<HTMLButtonElement>(
            'dialog[open]:not([inert]) button',
          ),
        )
          .find(button => button.textContent?.trim() === 'Continue')
          ?.click();
        requestAnimationFrame(tick);
      }),
  );
  expect(samples.length).toBeGreaterThan(20);
  const steady = samples[0];
  expect(steady).toBeGreaterThan(0.3);
  for (const dim of samples) {
    expect(dim).toBeGreaterThanOrEqual(steady * 0.9);
    expect(dim).toBeLessThanOrEqual(steady * 1.05);
  }
});
