// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file headingLinks.a11y.chromium.spec.ts
 * @input Heading-link copy-button Storybook story in real Chromium
 * @output Reveal, copy, no-navigation, modality, theme, and screenshot evidence
 * @position Browser proof for module:Markdown/headingLinks
 *
 * Build Storybook first:
 *
 *   pnpm storybook:build
 *   pnpm exec playwright test headingLinks.a11y.chromium.spec.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const STORY = 'core-markdown-plugins-heading-links--overview';
const OUTPUT = path.resolve('test-results/markdown-heading-links');
let storybook: StaticServer;
const evidence: Record<string, unknown> = {};

test.beforeAll(async () => {
  fs.rmSync(OUTPUT, {recursive: true, force: true});
  fs.mkdirSync(OUTPUT, {recursive: true});
  evidence.headSha = process.env.ASTRYX_HEAD_SHA ?? null;
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  fs.writeFileSync(
    path.join(OUTPUT, 'manifest.json'),
    `${JSON.stringify({version: 1, ...evidence}, null, 2)}\n`,
  );
  await storybook?.close();
});

async function openStory(
  page: Page,
  globals = 'astryxTheme:neutral;colorMode:light;direction:ltr',
): Promise<void> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY}&viewMode=story&globals=${globals}`,
    {waitUntil: 'load'},
  );
  await page.locator('#heading-links-ltr h1').waitFor({state: 'visible'});
  await page
    .locator('#heading-links-ltr[data-heading-links-play-complete="true"]')
    .waitFor();
}

async function copyButtonOpacity(page: Page): Promise<number> {
  return page
    .getByRole('button', {name: 'Copy link to Linkable headings'})
    .evaluate(element => Number(getComputedStyle(element).opacity));
}

async function blurActiveElement(page: Page): Promise<void> {
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  });
}

test('heading copy buttons are honest, discoverable, and stable in every required state', async ({
  browser,
  page,
}) => {
  test.setTimeout(3 * 60 * 1000);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: storybook.origin,
  });
  await openStory(page);

  const root = page.locator('#heading-links-ltr');
  const heading = page.getByRole('heading', {name: 'Linkable headings'});
  const copyButton = root.getByRole('button', {
    name: 'Copy link to Linkable headings',
  });
  const row = heading.locator('..');

  await expect(heading).toHaveAttribute(
    'id',
    'heading-links-ltr--linkable-headings',
  );
  await expect(copyButton).toHaveAttribute('type', 'button');
  await expect(copyButton).not.toHaveAttribute('href', /.+/u);
  expect(await copyButton.evaluate(element => element.tagName)).toBe('BUTTON');
  expect(await heading.locator('button').count()).toBe(0);
  expect(await root.locator('a[href^="#heading-links-ltr"]').count()).toBe(0);

  await blurActiveElement(page);
  await page.mouse.move(0, 0);
  await expect(copyButton).not.toBeFocused();
  expect(
    await row.evaluate(element => ({
      focusWithin: element.matches(':focus-within'),
      hover: element.matches(':hover'),
    })),
  ).toEqual({focusWithin: false, hover: false});
  await expect.poll(async () => copyButtonOpacity(page)).toBe(0);
  evidence.restOpacity = await copyButtonOpacity(page);
  await root.screenshot({path: path.join(OUTPUT, 'light-rest.png')});

  await heading.hover();
  await expect.poll(async () => copyButtonOpacity(page)).toBe(1);
  evidence.headingHoverOpacity = await copyButtonOpacity(page);
  await root.screenshot({path: path.join(OUTPUT, 'light-heading-hover.png')});

  const authoredHeading = page.getByRole('heading', {name: 'Read the guide'});
  const authoredLink = authoredHeading.getByRole('link', {name: 'guide'});
  const authoredCopyButton = authoredHeading
    .locator('..')
    .getByRole('button', {name: 'Copy link to Read the guide'});
  await page.mouse.move(1200, 800);
  await authoredLink.focus();
  await expect(authoredLink).toBeFocused();
  await expect
    .poll(async () =>
      authoredCopyButton.evaluate(element =>
        Number(getComputedStyle(element).opacity),
      ),
    )
    .toBe(1);
  evidence.focusWithinOpacity = await authoredCopyButton.evaluate(element =>
    Number(getComputedStyle(element).opacity),
  );

  await page.mouse.move(1200, 800);
  await page.keyboard.press('Tab');
  await expect(authoredCopyButton).toBeFocused();
  await expect
    .poll(async () =>
      authoredCopyButton.evaluate(element =>
        Number(getComputedStyle(element).opacity),
      ),
    )
    .toBe(1);
  evidence.keyboardTabOpacity = await authoredCopyButton.evaluate(element =>
    Number(getComputedStyle(element).opacity),
  );

  await copyButton.focus();
  await expect(copyButton).toBeFocused();
  await expect.poll(async () => copyButtonOpacity(page)).toBe(1);
  evidence.keyboardFocusOpacity = await copyButtonOpacity(page);
  await root.screenshot({path: path.join(OUTPUT, 'light-focus.png')});
  const restGlyphWidth = await copyButton
    .locator('[aria-hidden="true"]')
    .first()
    .evaluate(element => element.getBoundingClientRect().width);

  const canonicalUrl = new URL(
    '#heading-links-ltr--linkable-headings',
    page.url(),
  ).href;
  const locationBeforeCopy = page.url();
  const scrollBeforeCopy = await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
  }));
  await page.evaluate(() => {
    (
      window as typeof window & {__headingLinksNoReload?: string}
    ).__headingLinksNoReload = 'alive';
  });
  await copyButton.click();
  await expect(page).toHaveURL(locationBeforeCopy);
  expect(
    await page.evaluate(() => ({x: window.scrollX, y: window.scrollY})),
  ).toEqual(scrollBeforeCopy);
  await expect(copyButton).toHaveAccessibleName('Link copied');
  await expect(copyButton.locator('.astryx-icon')).toHaveCount(1);
  const copiedGlyphWidth = await copyButton
    .locator('[aria-hidden="true"]')
    .first()
    .evaluate(element => element.getBoundingClientRect().width);
  expect(copiedGlyphWidth).toBe(restGlyphWidth);
  evidence.glyphWidths = {rest: restGlyphWidth, copied: copiedGlyphWidth};
  evidence.desktopClipboard = await page.evaluate(async () =>
    navigator.clipboard.readText(),
  );
  expect(evidence.desktopClipboard).toBe(canonicalUrl);
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & {__headingLinksNoReload?: string})
          .__headingLinksNoReload,
    ),
  ).toBe('alive');
  await root.screenshot({path: path.join(OUTPUT, 'light-copied.png')});
  await expect(copyButton).toHaveAccessibleName(
    'Copy link to Linkable headings',
    {timeout: 3000},
  );
  await expect(copyButton).toHaveText('#');

  await page.evaluate(async () => navigator.clipboard.writeText('sentinel'));
  await copyButton.click({modifiers: ['Control']});
  expect(await page.evaluate(async () => navigator.clipboard.readText())).toBe(
    'sentinel',
  );
  await copyButton.dispatchEvent('contextmenu');
  expect(await page.evaluate(async () => navigator.clipboard.readText())).toBe(
    'sentinel',
  );
  await expect(page).toHaveURL(locationBeforeCopy);

  await page.emulateMedia({forcedColors: 'active'});
  await blurActiveElement(page);
  await page.mouse.move(1200, 800);
  await expect.poll(async () => copyButtonOpacity(page)).toBe(0);
  evidence.forcedColorsRestOpacity = await copyButtonOpacity(page);
  await copyButton.focus();
  await expect.poll(async () => copyButtonOpacity(page)).toBe(1);
  evidence.forcedColorsFocusOpacity = await copyButtonOpacity(page);
  await root.screenshot({path: path.join(OUTPUT, 'forced-colors-focus.png')});

  await page.emulateMedia({forcedColors: 'none', reducedMotion: 'reduce'});
  evidence.reducedMotionDuration = await copyButton.evaluate(
    element => getComputedStyle(element).transitionDuration,
  );
  expect(evidence.reducedMotionDuration).toBe('0s');

  await openStory(page, 'astryxTheme:neutral;colorMode:dark;direction:ltr');
  const darkRoot = page.locator('#heading-links-ltr');
  const darkHeading = page.getByRole('heading', {name: 'Linkable headings'});
  await darkHeading.hover();
  await expect.poll(async () => copyButtonOpacity(page)).toBe(1);
  evidence.darkColor = await page
    .getByRole('button', {name: 'Copy link to Linkable headings'})
    .evaluate(element => getComputedStyle(element).color);
  await darkRoot.screenshot({path: path.join(OUTPUT, 'dark-hover.png')});

  const rtlHeading = page.getByRole('heading', {
    name: 'عنوان قابل للربط',
  });
  const rtlCopyButton = page.getByRole('button', {
    name: 'Copy link to عنوان قابل للربط',
  });
  await rtlHeading.hover();
  const [rtlHeadingBox, rtlButtonBox] = await Promise.all([
    rtlHeading.boundingBox(),
    rtlCopyButton.boundingBox(),
  ]);
  if (rtlHeadingBox == null || rtlButtonBox == null) {
    throw new Error('RTL heading and copy button must have layout boxes');
  }
  expect(rtlButtonBox.x).toBeLessThan(rtlHeadingBox.x);
  evidence.rtl = {heading: rtlHeadingBox, button: rtlButtonBox};

  const touchContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: {width: 390, height: 844},
  });
  await touchContext.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: storybook.origin,
  });
  const touchPage = await touchContext.newPage();
  await openStory(touchPage);
  const touchRoot = touchPage.locator('#heading-links-ltr');
  const touchCopyButton = touchRoot.getByRole('button', {
    name: 'Copy link to Linkable headings',
  });
  evidence.touchOpacity = await copyButtonOpacity(touchPage);
  expect(evidence.touchOpacity).toBe(1);
  await expect(touchCopyButton).toHaveText('#');
  const touchTarget = await touchCopyButton.boundingBox();
  if (touchTarget == null) {
    throw new Error('Touch copy button must have a layout box');
  }
  expect(touchTarget.width).toBeGreaterThanOrEqual(44);
  expect(touchTarget.height).toBeGreaterThanOrEqual(44);
  evidence.touchTarget = touchTarget;
  await touchRoot.screenshot({path: path.join(OUTPUT, 'touch-rest.png')});

  const touchCanonicalUrl = new URL(
    '#heading-links-ltr--linkable-headings',
    touchPage.url(),
  ).href;
  const touchLocationBeforeCopy = touchPage.url();
  const touchScrollBeforeCopy = await touchPage.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
  }));
  await touchPage.evaluate(() => {
    (
      window as typeof window & {__headingLinksNoReload?: string}
    ).__headingLinksNoReload = 'alive';
  });
  await touchCopyButton.tap();
  await expect(touchPage).toHaveURL(touchLocationBeforeCopy);
  expect(
    await touchPage.evaluate(() => ({x: window.scrollX, y: window.scrollY})),
  ).toEqual(touchScrollBeforeCopy);
  await expect(touchCopyButton).toHaveAccessibleName('Link copied');
  evidence.touchClipboard = await touchPage.evaluate(async () =>
    navigator.clipboard.readText(),
  );
  expect(evidence.touchClipboard).toBe(touchCanonicalUrl);
  expect(
    await touchPage.evaluate(
      () =>
        (window as typeof window & {__headingLinksNoReload?: string})
          .__headingLinksNoReload,
    ),
  ).toBe('alive');
  await touchRoot.screenshot({path: path.join(OUTPUT, 'touch-copied.png')});
  await touchContext.close();
});
