// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChatLayoutScrollButton.a11y.chromium.spec.ts
 * @input Uses the ChatLayout scroll-affordance story and a built Storybook
 * @output Keyboard and pixel evidence for the hidden/visible/re-hidden scroll
 *   affordance, and for the pill tracking the theme's element-size token
 * @position Real-Chromium evidence for the 2026-09-23 ChatLayout audit. jsdom
 *   has no cascade and no sequential focus model, so neither the hidden state's
 *   removal from the tab order nor the pill's containment of its own Button is
 *   observable in the unit lane.
 *
 * Two claims are proven here, both against the shipped public API:
 *
 * 1. The default affordance is hidden at rest, becomes visible when the reader
 *    scrolls away from the newest message, and hides again on activation. It is
 *    keyboard reachable exactly while it is visible, because focus landing on
 *    something that paints nothing has no visible indicator (WCAG 2.2 SC 2.4.7).
 * 2. The pill's height follows `--size-element-md`, so a theme that retunes the
 *    element scale cannot make it clip the Button it wraps. Butter resolves that
 *    token to 40px where Neutral resolves it to 32px, so the two shipped themes
 *    are the natural before/after — no hand-built arm is needed for the token
 *    claim. The regression arm below restores the old literal to show what the
 *    fix prevents, and declares its exact delta.
 */

import {createHash} from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {expect, test, type Locator, type Page} from '@playwright/test';
import {holdMotionStill} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const OUTPUT = path.resolve('test-results/chat-layout-audit-evidence');
const STORY_ID = 'core-chatlayout--scroll-affordance-states';

/** The pill wrapper: the element whose visibility and height are the claims. */
const PILL = '.astryx-chat-layout-scroll-button > div';

type Shot = {
  file: string;
  sha256: string;
  width: number;
  height: number;
};

type Receipt = {
  /** What this frame is evidence of. */
  state: string;
  storyId: string;
  theme: string;
  colorMode: string;
  direction: string;
  viewport: {width: number; height: number};
  devicePixelRatio: number;
  /** Semantic state that uniquely identifies the intended render. */
  rendered: Record<string, unknown>;
  /** Visible subject geometry, so a zero-box decoy cannot pass as the subject. */
  geometry: {selectorCount: number; width: number; height: number};
  settled: {fontsReady: boolean; pageErrors: number};
  image: Shot;
};

const receipts: Receipt[] = [];
const pageErrors: string[] = [];
let storybook: StaticServer;
let browserVersion = 'unknown';

test.beforeAll(async () => {
  // Do NOT wipe: Playwright restarts the worker after a failing test, which
  // re-runs this hook. Wiping here would delete the frames the earlier tests
  // already banked, which is exactly when the evidence matters most.
  fs.mkdirSync(OUTPUT, {recursive: true});
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  const manifestPath = path.join(OUTPUT, 'manifest.json');
  const previous = fs.existsSync(manifestPath)
    ? (JSON.parse(fs.readFileSync(manifestPath, 'utf8')).frames ?? [])
    : [];
  const merged = [...previous, ...receipts].filter(
    (frame, index, all) =>
      all.findIndex(other => other.state === frame.state) === index,
  );
  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        version: 1,
        component: 'core/ChatLayout',
        headSha:
          process.env.ASTRYX_HEAD_SHA ??
          process.env.GITHUB_SHA ??
          'local-working-copy',
        checkoutSha: process.env.GITHUB_SHA ?? 'local-working-copy',
        browser: browserVersion,
        frames: merged,
      },
      null,
      2,
    )}\n`,
  );
  await storybook?.close();
});

async function openStory(
  page: Page,
  {theme = 'neutral', colorMode = 'light'} = {},
): Promise<Locator> {
  page.on('pageerror', error => pageErrors.push(String(error)));
  browserVersion = page.context().browser()?.version() ?? 'unknown';
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY_ID}&viewMode=story` +
      `&globals=colorMode:${colorMode};astryxTheme:${theme}`,
  );
  const root = page.locator('.astryx-chat-layout');
  await root.waitFor({state: 'visible'});
  await holdMotionStill(page);
  await page.evaluate(async () => document.fonts.ready);
  return root;
}

/** The scroll container settles at the bottom on first fill. */
async function distanceFromBottom(root: Locator): Promise<number> {
  return root.evaluate(
    element => element.scrollHeight - element.clientHeight - element.scrollTop,
  );
}

/** How far this fixture can scroll at all. The states below need real range. */
async function scrollRange(root: Locator): Promise<number> {
  return root.evaluate(element => element.scrollHeight - element.clientHeight);
}

/** Scroll to the top, which is the furthest the reader can get from newest. */
async function scrollToTop(root: Locator): Promise<void> {
  await root.evaluate(element => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event('scroll'));
  });
}

/**
 * Can the affordance take focus at all? This is the mechanism under test:
 * `visibility: hidden` removes an element from sequential focus navigation AND
 * refuses programmatic focus, which `opacity: 0` does neither of. A CSS locator
 * is used rather than a role query because a hidden button is not in the
 * accessibility tree and a role query would not resolve it.
 */
async function affordanceAcceptsFocus(page: Page): Promise<boolean> {
  return page
    .locator('.astryx-chat-layout-scroll-button button')
    .evaluate(element => {
      // preventScroll: focusing must not move the scroll position, or the
      // probe would change the very state the next assertion reads.
      (element as HTMLElement).focus({preventScroll: true});
      return document.activeElement === element;
    });
}

/**
 * Tab forward from `from` and report whether focus ever lands inside the
 * affordance, plus the sequence it walked. Reachability is the user-level
 * property; the number of intervening stops is not part of the contract, so
 * this sweeps rather than asserting one exact stop.
 */
async function tabSweep(
  page: Page,
  from: Locator,
  presses: number,
): Promise<{reached: boolean; sequence: string[]}> {
  await from.focus();
  const sequence: string[] = [];
  for (let index = 0; index < presses; index += 1) {
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (active == null || active === document.body) {
        return {label: 'body', onAffordance: false};
      }
      const name =
        active.getAttribute('aria-label') ??
        (active.textContent ?? '').trim().slice(0, 32);
      return {
        label: `${active.tagName.toLowerCase()}${name ? `:${name}` : ''}`,
        onAffordance:
          active.closest('.astryx-chat-layout-scroll-button') != null,
      };
    });
    sequence.push(stop.label);
    if (stop.onAffordance) {
      return {reached: true, sequence};
    }
  }
  return {reached: false, sequence};
}

async function pillVisibility(page: Page): Promise<string> {
  return page
    .locator(PILL)
    .evaluate(element => getComputedStyle(element).visibility);
}

async function capture(
  page: Page,
  state: string,
  rendered: Record<string, unknown>,
) {
  const pill = page.locator(PILL);
  const box = await pill.boundingBox();
  if (box == null) {
    throw new Error(`${state}: the pill has no layout box`);
  }
  const bytes = await page.locator('.astryx-chat-layout').screenshot({
    animations: 'disabled',
  });
  const file = `chat-layout-${state}.png`;
  fs.writeFileSync(path.join(OUTPUT, file), bytes);
  const dimensions = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio,
  }));
  receipts.push({
    state,
    storyId: STORY_ID,
    theme: await page.evaluate(
      () =>
        document
          .querySelector('[data-astryx-theme]')
          ?.getAttribute('data-astryx-theme') ?? 'neutral',
    ),
    colorMode: await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    ),
    direction: await page
      .locator('.astryx-chat-layout')
      .evaluate(element => getComputedStyle(element).direction),
    viewport: {width: dimensions.width, height: dimensions.height},
    devicePixelRatio: dimensions.dpr,
    rendered,
    geometry: {
      selectorCount: await page.locator(PILL).count(),
      width: Math.round(box.width),
      height: Math.round(box.height),
    },
    settled: {fontsReady: true, pageErrors: pageErrors.length},
    image: {
      file,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      width: Math.round(dimensions.width),
      height: Math.round(dimensions.height),
    },
  });
}

test('the scroll affordance is keyboard reachable exactly while it is visible', async ({
  page,
}) => {
  const root = await openStory(page);
  const before = page.getByRole('button', {name: 'Before chat', exact: true});
  const pill = page.locator(PILL);
  const SWEEP = 6;

  // ---- hidden: the resting state, where the defect lived -------------------
  // Precondition: the fixture must actually overflow, or "hidden at rest" and
  // "visible when scrolled up" would both pass without proving anything.
  expect(
    await scrollRange(root),
    'the fixture must overflow by more than the 100px button threshold',
  ).toBeGreaterThan(150);
  expect(await distanceFromBottom(root)).toBeLessThan(2);
  await expect(pill).toHaveCSS('visibility', 'hidden');

  expect(
    await affordanceAcceptsFocus(page),
    'a control that paints nothing must refuse focus (WCAG 2.2 SC 2.4.7)',
  ).toBe(false);
  const restSweep = await tabSweep(page, before, SWEEP);
  expect(
    restSweep.reached,
    `Tab reached the hidden affordance: ${restSweep.sequence.join(' -> ')}`,
  ).toBe(false);
  await capture(page, 'rest-hidden', {
    pillVisibility: await pillVisibility(page),
    affordanceAcceptsFocus: false,
    reachedByTabWithin: `not within ${SWEEP} presses`,
    tabSequence: restSweep.sequence,
    distanceFromBottomPx: await distanceFromBottom(root),
  });

  // ---- visible: the reader scrolls away from the newest message ------------
  await scrollToTop(root);
  await expect(pill).toHaveCSS('visibility', 'visible');
  expect(await distanceFromBottom(root)).toBeGreaterThan(100);

  expect(
    await affordanceAcceptsFocus(page),
    'the visible affordance must keep its keyboard access',
  ).toBe(true);
  const visibleSweep = await tabSweep(page, before, SWEEP);
  expect(
    visibleSweep.reached,
    `Tab never reached the visible affordance: ${visibleSweep.sequence.join(' -> ')}`,
  ).toBe(true);
  await expect(
    page.getByRole('button', {name: 'Scroll to bottom'}),
  ).toHaveAccessibleName('Scroll to bottom');
  await capture(page, 'scrolled-up-visible', {
    pillVisibility: await pillVisibility(page),
    affordanceAcceptsFocus: true,
    reachedByTabWithin: `${visibleSweep.sequence.length} of ${SWEEP} presses`,
    tabSequence: visibleSweep.sequence,
    accessibleName: 'Scroll to bottom',
    distanceFromBottomPx: await distanceFromBottom(root),
  });

  // ---- re-hidden: activating it returns to the bottom ----------------------
  // Focus is already on the affordance from the sweep above.
  await page.keyboard.press('Enter');
  await expect(pill).toHaveCSS('visibility', 'hidden', {timeout: 5000});
  expect(
    await affordanceAcceptsFocus(page),
    'after returning to the bottom the affordance must refuse focus again',
  ).toBe(false);
  const returnedSweep = await tabSweep(page, before, SWEEP);
  expect(
    returnedSweep.reached,
    `Tab reached the re-hidden affordance: ${returnedSweep.sequence.join(' -> ')}`,
  ).toBe(false);
  await capture(page, 'returned-hidden', {
    pillVisibility: await pillVisibility(page),
    affordanceAcceptsFocus: false,
    reachedByTabWithin: `not within ${SWEEP} presses`,
    tabSequence: returnedSweep.sequence,
    activatedWith: 'Enter',
    distanceFromBottomPx: await distanceFromBottom(root),
  });

  expect(pageErrors).toEqual([]);
});

test('the pill tracks the theme element-size token instead of a fixed 32px', async ({
  page,
}) => {
  // Butter resolves --size-element-md to 40px; Neutral resolves it to 32px.
  // Both are shipped themes, so this is a real theme pair, not a mutated arm.
  const sizes: Record<string, {token: string; pill: number; button: number}> =
    {};

  for (const theme of ['neutral', 'butter']) {
    const root = await openStory(page, {theme});
    await scrollToTop(root);
    const pill = page.locator(PILL);
    await expect(pill).toHaveCSS('visibility', 'visible');

    const token = await pill.evaluate(element =>
      getComputedStyle(element).getPropertyValue('--size-element-md').trim(),
    );
    const pillHeight = (await pill.boundingBox())?.height ?? 0;
    const buttonHeight =
      (await page.getByRole('button', {name: 'Scroll to bottom'}).boundingBox())
        ?.height ?? 0;

    sizes[theme] = {
      token,
      pill: Math.round(pillHeight),
      button: Math.round(buttonHeight),
    };

    // The pill clips its own content (`overflow: hidden`), so it must be at
    // least as tall as the Button it wraps in every theme. Neutral also shrinks
    // its md Button to `calc(--size-element-md - 8px)`, so the two are equal
    // only where a theme leaves the Button at the full token height.
    expect(
      sizes[theme].pill,
      `${theme}: the pill must not be shorter than the Button it clips`,
    ).toBeGreaterThanOrEqual(sizes[theme].button);
    await capture(page, `token-size-${theme}`, {
      theme,
      sizeElementMd: token,
      pillHeightPx: sizes[theme].pill,
      buttonHeightPx: sizes[theme].button,
      clippedPx: Math.max(0, sizes[theme].button - sizes[theme].pill),
    });
  }

  // The themes must actually disagree, or the pair proves nothing. Butter
  // resolves the token to 40px and leaves its md Button at the full token
  // height; Neutral resolves it to 32px and shrinks the Button by 8px.
  expect(sizes.butter.token).not.toBe(sizes.neutral.token);
  expect(sizes.butter.pill).toBeGreaterThan(sizes.neutral.pill);
  expect(sizes.butter.button).toBeGreaterThan(sizes.neutral.button);

  // ---- regression arm -----------------------------------------------------
  // ARM: pre-fix literal
  // BASE: this head
  // DELTA: one injected rule restoring the removed literal on the pill —
  //        `height: 32px; max-width: 32px` — and nothing else.
  // UNRELATED DELTA: none
  const root = await openStory(page, {theme: 'butter'});
  await scrollToTop(root);
  await page.addStyleTag({
    content: `${PILL} { height: 32px !important; max-width: 32px !important; }`,
  });
  const clippedPill = (await page.locator(PILL).boundingBox())?.height ?? 0;
  const clippedButton =
    (await page.getByRole('button', {name: 'Scroll to bottom'}).boundingBox())
      ?.height ?? 0;
  await capture(page, 'token-size-butter-prefix-literal', {
    theme: 'butter',
    arm: 'pre-fix literal (height: 32px; max-width: 32px)',
    pillHeightPx: Math.round(clippedPill),
    buttonHeightPx: Math.round(clippedButton),
    clippedPx: Math.round(clippedButton - clippedPill),
  });

  // What the fix prevents: under Butter the old literal left the Button taller
  // than the pill that clips it.
  expect(Math.round(clippedButton)).toBeGreaterThan(Math.round(clippedPill));
  expect(pageErrors).toEqual([]);
});
