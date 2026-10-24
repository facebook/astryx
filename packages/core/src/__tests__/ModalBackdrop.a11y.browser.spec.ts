// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ModalBackdrop.a11y.browser.spec.ts
 * @input The Dialog, AlertDialog, Drawer, MobileNav and BottomSheet stories
 *   in a built Storybook, opened with real taps on a phone-sized touch
 *   viewport, in light and dark mode, with the base tokens and with the
 *   neutral theme
 * @output Browser evidence for the modal dim: every modal `::backdrop`
 *   computes to `--color-background-backdrop` (iOS's dimming colour with the base
 *   tokens, black at 20 % / 48 %; the theme's own dim under a bundled theme)
 *   and none of them blurs the page behind it; screenshots of an open Dialog
 *   per mode for the pull request
 * @position Cross-browser proof for the shared modal dim; jsdom drops
 *   `backdrop-filter` and paints nothing, so __tests__/modalBackdrop.test.tsx
 *   can only pin the declared colour. WebKit here is desktop WebKit under
 *   Playwright, not iOS Safari.
 *
 * SYNC: When a component gains a modal ::backdrop, add it to MODALS.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
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

/** Each modal surface that dims the page, and the tap that opens it. */
const MODALS = [
  {name: 'Dialog', story: 'core-dialog--default', opener: 'Open Modal'},
  {
    name: 'AlertDialog',
    story: 'core-alertdialog--delete',
    opener: 'Delete item',
  },
  {name: 'Drawer', story: 'core-drawer--scrim', opener: 'With scrim'},
  {
    name: 'MobileNav',
    story: 'core-mobilenav--default',
    opener: 'Open Navigation',
  },
  {
    name: 'BottomSheet',
    story: 'core-bottomsheet--showcase',
    opener: 'Open sheet',
  },
] as const;

type Mode = 'light' | 'dark';

/** The dim with the base tokens: the iOS dimming colour. */
const BASE_DIM: Record<Mode, string> = {
  light: 'rgba(0, 0, 0, 0.2)',
  dark: 'rgba(0, 0, 0, 0.48)',
};

async function openModal(
  page: Page,
  modal: (typeof MODALS)[number],
  mode: Mode,
  theme: 'none' | 'neutral',
): Promise<void> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${modal.story}&viewMode=story&globals=colorMode:${mode};astryxTheme:${theme}`,
  );
  await page.getByRole('button', {name: modal.opener}).first().tap();
  await expect(page.locator('dialog[open]').last()).toBeVisible();
}

/** The open modal's ::backdrop as the browser computes it. */
async function readBackdrop(
  page: Page,
): Promise<{color: string; filter: string}> {
  return page
    .locator('dialog[open]')
    .last()
    .evaluate(dialog => {
      const style = getComputedStyle(dialog, '::backdrop');
      return {
        color: style.backgroundColor,
        filter:
          style.backdropFilter ??
          (style as unknown as {webkitBackdropFilter?: string})
            .webkitBackdropFilter ??
          'none',
      };
    });
}

for (const modal of MODALS) {
  for (const mode of ['light', 'dark'] as const) {
    test(`${modal.name} dims with the iOS dimming colour in ${mode} mode, unblurred`, async ({
      page,
    }) => {
      await openModal(page, modal, mode, 'none');
      const backdrop = await readBackdrop(page);
      expect(backdrop.color).toBe(BASE_DIM[mode]);
      expect(backdrop.filter).toBe('none');
    });
  }

  test(`${modal.name} keeps the neutral theme's own dim, unblurred`, async ({
    page,
  }) => {
    await openModal(page, modal, 'light', 'neutral');
    const backdrop = await readBackdrop(page);
    // neutral dims with black at 50 %, the value its overlay already had.
    expect(backdrop.color).toBe('rgba(0, 0, 0, 0.5)');
    expect(backdrop.filter).toBe('none');
  });
}

test('the media scrim keeps --color-overlay', async ({page}) => {
  // Overlay's dark scrim keeps text legible over media; it is not a modal
  // dim and keeps the overlay colour.
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-overlay--bottom-strip&viewMode=story&globals=colorMode:light;astryxTheme:none`,
  );
  const scrim = page.locator('.astryx-overlay-scrim').first();
  await expect(scrim).toBeAttached();
  expect(
    await scrim.evaluate(element => getComputedStyle(element).backgroundColor),
  ).toBe('rgba(1, 18, 40, 0.4)');
});

const EVIDENCE = process.env.MODAL_BACKDROP_EVIDENCE_DIR ?? '';
test('evidence: an open Dialog over a page, per mode', async ({
  page,
}, testInfo) => {
  test.skip(EVIDENCE === '', 'evidence capture runs on request');
  fs.mkdirSync(EVIDENCE, {recursive: true});
  for (const mode of ['light', 'dark'] as const) {
    await openModal(page, MODALS[0], mode, 'none');
    // The page under the dim, with the open dialog: the viewport, no chrome.
    await page.screenshot({
      path: path.join(EVIDENCE, `${testInfo.project.name}-dialog-${mode}.png`),
      animations: 'disabled',
    });
  }
});
