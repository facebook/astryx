// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetScrollLock.a11y.browser.spec.ts
 * @input The `Core/BottomSheetSwitcher` stories in a built Storybook, and
 *   real Chromium/WebKit wheel input.
 * @output Browser evidence for the CSS page-scroll lock of a modal sheet:
 *   engaged exactly while a sheet dialog is modal (through a handoff and
 *   under another modal dialog), with no inline styles on `<body>` and the
 *   scroll offset never moved; the same on a page whose `<body>` owns the
 *   viewport scroll; nothing locked for a non-modal flow.
 * @position Cross-browser proof; jsdom evaluates neither `:modal` nor
 *   `:has()`, so the unit tests can only read the lock's precondition.
 *   WebKit here is desktop WebKit under Playwright: it tells how the engine
 *   reads the rule, not how iOS hardware scrolls by touch; that remains a
 *   device check.
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
async function mountScrollable(
  page: Page,
  story = 'hug-content',
  pageCss = '',
) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-bottomsheetswitcher--${story}&viewMode=story`,
  );
  // The story's play function opens the flow; start from closed.
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.evaluate(css => {
    if (css) {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }
    const spacer = document.createElement('div');
    spacer.id = 'spacer';
    spacer.style.height = '3000px';
    document.body.appendChild(spacer);
    window.scrollTo(0, 300);
  }, pageCss);
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

  // Through a handoff a sheet dialog stays modal; the lock never lapses.
  await page.getByRole('button', {name: 'Continue', exact: true}).click();
  await expect(
    page.getByRole('dialog', {name: 'Notification frequency'}),
  ).toBeVisible();
  expect(await rootOverflow(page)).toBe('hidden');
  expect(await wheelDown(page)).toBe(300);
  await page.waitForTimeout(900);
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

/**
 * Pages whose `<body>` owns the viewport scroll: the root's overflow is
 * `visible`, so the browser scrolls the viewport through `<body>`'s values.
 * Freezing the root would stop that propagation, make `<body>` a
 * viewport-tall scroller of its own, and clamp the page to its top.
 */
for (const [shape, css] of [
  [
    'html, body { height: 100% } body { overflow-x: hidden }',
    'html, body { height: 100%; margin: 0 } body { overflow-x: hidden }',
  ],
  [
    'body { height: 100vh; overflow-y: auto }',
    'body { height: 100vh; margin: 0; overflow-y: auto }',
  ],
] as const) {
  test(`keeps the page's offset on a page styled ${shape}`, async ({page}) => {
    await mountScrollable(page, 'hug-content', css);
    // The viewport, not <body>, is the scroller before the flow opens.
    expect(await page.evaluate(() => document.body.scrollTop)).toBe(0);

    await openFlow(page);
    const locked = await page.evaluate(() => ({
      scrollY: window.scrollY,
      bodyScrollTop: document.body.scrollTop,
      rootOverflow: getComputedStyle(document.documentElement).overflow,
      bodyOverflow: getComputedStyle(document.body).overflow,
      bodyInline: document.body.getAttribute('style') ?? '',
    }));
    // The page did not jump to its top and <body> did not become its own
    // scroller; <body>, whose overflow the viewport uses, is what froze.
    expect(locked.scrollY).toBe(300);
    expect(locked.bodyScrollTop).toBe(0);
    expect(locked.rootOverflow).toBe('visible');
    expect(locked.bodyOverflow).toBe('hidden');
    expect(locked.bodyInline).toBe('');
    expect(await wheelDown(page)).toBe(300);

    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0, {timeout: 3000});
    expect(await page.evaluate(() => window.scrollY)).toBe(300);
    expect(await wheelDown(page)).toBeGreaterThan(300);
  });
}

test('a non-modal flow locks nothing', async ({page}) => {
  await mountScrollable(page, 'no-scrim');
  await openFlow(page);
  expect(await rootOverflow(page)).toBe('visible');
  expect(await wheelDown(page)).toBeGreaterThan(300);
});
