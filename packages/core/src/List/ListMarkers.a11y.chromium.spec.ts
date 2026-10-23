// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListMarkers.a11y.chromium.spec.ts
 * @input Built Storybook's long List and nested Markdown counter examples
 * @output Rendered proof that counters, item text, and nested lists stay aligned
 * @position Core browser regression; no declaration snapshots or committed images
 */

import {expect, test} from '@playwright/test';
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
test.afterAll(async () => storybook?.close());

for (const {width, mode} of [
  {width: 1280, mode: 'light'},
  {width: 390, mode: 'dark'},
] as const) {
  for (const dir of ['ltr', 'rtl'] as const) {
    for (const story of [
      'core-list--long-number-markers',
      'core-list--numbered-first-line',
      'core-markdown--long-number-markers',
    ]) {
      test(`${story}: shared counter column (${width}px, ${mode}, ${dir})`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({width, height: 900});
        await page.goto(
          `${storybook.origin}/iframe.html?id=${story}&viewMode=story&globals=direction:${dir};colorMode:${mode}`,
        );
        await expect(page.locator('#storybook-root ol').first()).toBeVisible();
        await expect
          .poll(async () =>
            page.evaluate(
              () => getComputedStyle(document.documentElement).colorScheme,
            ),
          )
          .toBe(mode);
        await page.evaluate(async () => document.fonts.ready);
        const lists = await page
          .locator('#storybook-root ol')
          .evaluateAll(elements =>
            elements.map(list =>
              Array.from(list.children).map(item => {
                const marker = item.firstElementChild;
                const content = marker?.nextElementSibling;
                if (marker == null || content == null) {
                  throw new Error('missing marker or content');
                }
                const m = marker.getBoundingClientRect();
                const c = content.getBoundingClientRect();
                const rtl = getComputedStyle(item).direction === 'rtl';
                const nested = content
                  .querySelector('ol')
                  ?.getBoundingClientRect();
                const label = content.querySelector(':scope > span > span');
                const labelRect = label?.getBoundingClientRect();
                const labelLine =
                  label == null
                    ? 0
                    : Number.parseFloat(getComputedStyle(label).lineHeight);
                const firstLineOffset =
                  labelRect == null
                    ? null
                    : m.top +
                      Number.parseFloat(getComputedStyle(marker).lineHeight) /
                        2 -
                      (labelRect.top + labelLine / 2);
                return {
                  direction: getComputedStyle(item).direction,
                  firstLineOffset,
                  textStart: rtl ? c.right : c.left,
                  markerHeight: m.height,
                  lineHeight: Number.parseFloat(
                    getComputedStyle(marker).lineHeight,
                  ),
                  markerWidth: m.width,
                  markerScrollWidth: marker.scrollWidth,
                  gap: rtl ? m.left - c.right : c.left - m.right,
                  nestedStart:
                    nested == null ? null : rtl ? nested.right : nested.left,
                };
              }),
            ),
          );
        expect(lists.length).toBeGreaterThan(0);
        for (const items of lists) {
          const starts = items.map(item => item.textStart);
          expect(Math.max(...starts) - Math.min(...starts)).toBeLessThanOrEqual(
            1,
          );
          for (const item of items) {
            expect(item.direction).toBe(dir);
            expect(item.markerHeight).toBeLessThanOrEqual(item.lineHeight + 1);
            expect(item.markerScrollWidth).toBeLessThanOrEqual(
              item.markerWidth + 1,
            );
            expect(item.gap).toBeGreaterThan(0);
          }
        }
        if (story === 'core-list--numbered-first-line') {
          expect(lists[0]).toHaveLength(2);
          for (const item of lists[0]) {
            expect(item.firstLineOffset).not.toBeNull();
            expect(
              Math.abs(item.firstLineOffset ?? Infinity),
            ).toBeLessThanOrEqual(1);
          }
        } else if (story === 'core-list--long-number-markers') {
          expect(lists[0]).toHaveLength(3);
        } else {
          expect(lists[0]).toHaveLength(5);
          const nested = lists[0]
            .map(item => item.nestedStart)
            .filter(value => value != null);
          expect(nested).toHaveLength(3);
          expect(Math.max(...nested) - Math.min(...nested)).toBeLessThanOrEqual(
            1,
          );
          expect(lists.some(items => items.length === 8)).toBe(true);
        }
        await page.screenshot({
          path: testInfo.outputPath(`${story}-${width}-${mode}-${dir}.png`),
        });
      });
    }
  }
}
