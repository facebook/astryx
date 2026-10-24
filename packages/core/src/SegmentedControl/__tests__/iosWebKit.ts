// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iosWebKit.ts
 * @input A Playwright page or browser context
 * @output Exports `emulateIosWebKit`: the page's engine answers the touch
 *   presentation resolver's iOS gate as WebKit on iOS does
 * @position Test helper for SegmentedControl's browser specs
 *
 * The iOS touch idiom (utils/touchPresentation.ts) is WebKit on iOS or iPadOS
 * under a coarse pointer, recognized by `CSS.supports('(-webkit-touch-callout:
 * none)')`, which no other engine implements. Chromium and Playwright's WebKit
 * emulate the phone (a coarse pointer, touch) but not that engine, so the iOS
 * cases run with `CSS.supports` answering yes for that one query, installed
 * before any page script. Without it the same phone is the Android case.
 * SegmentedControl gates in script only; a style keyed on the iOS `@supports`
 * query would also need its stylesheet rule rewritten. Real-iOS evidence
 * stays on the simulator.
 */

import type {BrowserContext, Page} from '@playwright/test';

export async function emulateIosWebKit(
  target: Page | BrowserContext,
): Promise<void> {
  await target.addInitScript(() => {
    const native = CSS.supports.bind(CSS);
    const isTouchCallout = (condition: string, value?: string): boolean =>
      value == null
        ? /^\(\s*-webkit-touch-callout\s*:\s*none\s*\)$/.test(condition.trim())
        : condition.trim() === '-webkit-touch-callout' &&
          value.trim() === 'none';
    CSS.supports = (condition: string, value?: string): boolean =>
      isTouchCallout(condition, value) ||
      (value == null ? native(condition) : native(condition, value));
  });
}
