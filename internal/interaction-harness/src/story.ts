// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file story.ts
 * @input Uses a Playwright `Page` and test object, and the a11y-spec package's
 *   static server over a built Storybook
 * @output `phone` (the touch-phone browser context every interaction proof
 *   runs in), `withStorybook` (serve the built Storybook for a spec file), and
 *   `openStory` (load one story and wait until it has rendered).
 * @position Stories are the reproduction path, as for every other browser
 *   check in this repository: a scenario used for verification is checked in,
 *   not built in a one-off page.
 *
 * The phone is an iPhone 17 Pro in Safari: 402 × 874 pt screen, 402 × 714 pt
 * visible page with the toolbars shown, 3 device pixels per point, touch,
 * mobile viewport rules. Measured on the iOS 26.2 simulator
 * (`innerWidth`/`innerHeight`, `screen`, `devicePixelRatio`).
 *
 * SYNC: Keep `phone` equal to the projects in playwright.interaction.config.ts.
 */

import type {Page, TestType} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

export const phone = {
  viewport: {width: 402, height: 714},
  screen: {width: 402, height: 874},
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
} as const;

/**
 * Serves the built Storybook for the spec file's tests (`ASTRYX_STORYBOOK_DIR`
 * overrides the default `apps/storybook/dist`). Returns its origin getter.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any fixture set
export function withStorybook(test: TestType<any, any>): () => string {
  let server: StaticServer | undefined;
  test.beforeAll(async () => {
    server = await serveStorybook(
      process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
    );
  });
  test.afterAll(async () => {
    await server?.close();
  });
  return () => {
    if (server == null) {
      throw new Error(
        'withStorybook: the Storybook server is not running (call inside a test)',
      );
    }
    return server.origin;
  };
}

/** How openStory opens a story beyond its id and args. */
export interface OpenStoryOptions {
  /**
   * false sets `globals=touchSupport:off`: the story renders without
   * TouchSupport (apps/storybook/.storybook/touchSupport.ts), to check a
   * component's plain behavior. @default true
   */
  readonly touchSupport?: boolean;
}

/** Loads a story in the page and waits for its first render, its fonts and two frames. */
export async function openStory(
  page: Page,
  origin: string,
  storyId: string,
  args?: Readonly<Record<string, string>>,
  {touchSupport = true}: OpenStoryOptions = {},
): Promise<void> {
  const params = new URLSearchParams({id: storyId, viewMode: 'story'});
  /** Storybook globals, as `key:value` pairs joined by `;`. */
  const globals: string[] = [];
  if (!touchSupport) {
    globals.push('touchSupport:off');
  }
  if (globals.length > 0) {
    params.set('globals', globals.join(';'));
  }
  if (args != null) {
    params.set(
      'args',
      Object.entries(args)
        .map(([k, v]) => `${k}:${v}`)
        .join(';'),
    );
  }
  await page.goto(`${origin}/iframe.html?${params.toString()}`);
  await page
    .locator('#storybook-root > *')
    .first()
    .waitFor({state: 'attached'});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>(resolve =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
}

/** Resolves after `count` animation frames have been presented in the page. */
export async function frames(page: Page, count = 2): Promise<void> {
  await page.evaluate(
    n =>
      new Promise<void>(resolve => {
        let left = n;
        const tick = () =>
          --left <= 0 ? resolve() : requestAnimationFrame(tick);
        requestAnimationFrame(tick);
      }),
    count,
  );
}
