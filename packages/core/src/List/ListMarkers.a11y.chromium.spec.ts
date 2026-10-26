// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListMarkers.a11y.chromium.spec.ts
 * @input Built Storybook's long List and nested Markdown counter examples
 * @output Rendered proof that counters, item text, and nested lists stay
 *   aligned: counters on one line, ending on one edge, never clipped, and
 *   Markdown's text where a short list puts it
 * @position Core browser regression; no declaration snapshots or committed images
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
test.afterAll(async () => storybook?.close());

/** A list's rows: each counter's marker box, in page coordinates. */
interface MarkerBox {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
}

/** Paints every counter red and everything else transparent. */
const COUNTERS_ONLY = `
  #storybook-root, #storybook-root * { color: transparent !important; }
  #storybook-root ol > li > :first-child { color: rgb(255, 0, 0) !important; }
`;

/** Takes the lists' inline clip away, to tell a clipped counter from a whole one. */
const UNCLIPPED = '#storybook-root ol { overflow: visible !important; }';

/** Where a counter's ink starts and ends, in page pixels. */
interface Ink {
  readonly start: number;
  readonly end: number;
}

/**
 * The inline extent of each counter's ink: the red pixels within a band
 * reaching from its marker toward the inline start, wide enough for any
 * counter that hangs past it, and stopping just past the marker's end so it
 * never takes in the row's own content. The page decodes the screenshot.
 */
async function inkOf(
  page: Page,
  screenshot: Buffer,
  boxes: ReadonlyArray<MarkerBox>,
  dir: 'ltr' | 'rtl',
): Promise<Ink[]> {
  return page.evaluate(
    async ({png, rows, rtl}) => {
      const image = new Image();
      image.src = `data:image/png;base64,${png}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', {willReadFrequently: true});
      if (context == null) {
        throw new Error('no 2d canvas');
      }
      context.drawImage(image, 0, 0);
      const {data, width} = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      return rows.map(box => {
        let start = Infinity;
        let end = -Infinity;
        const from = Math.max(
          0,
          Math.floor(rtl ? box.left - 2 : box.left - 48),
        );
        const to = Math.min(
          width,
          Math.ceil(rtl ? box.right + 48 : box.right + 2),
        );
        for (let y = Math.floor(box.top); y < Math.ceil(box.bottom); y++) {
          for (let x = from; x < to; x++) {
            const i = (y * width + x) * 4;
            if (data[i] - Math.max(data[i + 1], data[i + 2]) > 80) {
              start = Math.min(start, x);
              end = Math.max(end, x + 1);
            }
          }
        }
        return {start, end};
      });
    },
    {png: screenshot.toString('base64'), rows: boxes, rtl: dir === 'rtl'},
  );
}

/** Each list's marker boxes, outermost list first, in page coordinates. */
async function markerBoxes(page: Page): Promise<MarkerBox[][]> {
  return page.locator('#storybook-root ol').evaluateAll(lists =>
    lists.map(list =>
      Array.from(list.children, item => {
        const marker = item.firstElementChild;
        if (marker == null) {
          throw new Error('missing marker');
        }
        const box = marker.getBoundingClientRect();
        return {
          top: box.top + window.scrollY,
          bottom: box.bottom + window.scrollY,
          left: box.left + window.scrollX,
          right: box.right + window.scrollX,
        };
      }),
    ),
  );
}

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
            elements.map(list => {
              let depth = 0;
              for (let up = list.parentElement; up; up = up.parentElement) {
                if (up.tagName === 'OL' || up.tagName === 'UL') {
                  depth += 1;
                }
              }
              const items = Array.from(list.children).map(item => {
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
                  numerals: getComputedStyle(marker).fontVariantNumeric,
                  gap: rtl ? m.left - c.right : c.left - m.right,
                  nestedStart:
                    nested == null ? null : rtl ? nested.right : nested.left,
                };
              });
              return {depth, items};
            }),
          );
        expect(lists.length).toBeGreaterThan(0);
        for (const {items} of lists) {
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
          expect(lists[0].items).toHaveLength(2);
          for (const item of lists[0].items) {
            expect(item.firstLineOffset).not.toBeNull();
            expect(
              Math.abs(item.firstLineOffset ?? Infinity),
            ).toBeLessThanOrEqual(1);
          }
        } else if (story === 'core-list--long-number-markers') {
          expect(lists[0].items).toHaveLength(3);
        } else {
          expect(lists[0].items).toHaveLength(5);
          const nested = lists[0].items
            .map(item => item.nestedStart)
            .filter(value => value != null);
          expect(nested).toHaveLength(3);
          expect(Math.max(...nested) - Math.min(...nested)).toBeLessThanOrEqual(
            1,
          );
          expect(lists.some(({items}) => items.length === 8)).toBe(true);
          // spec:AST-061 FR11: a list whose counters reach `12.` starts its
          // text where a list of one short counter does, as RichText's native
          // markers leave it: the wide counters hang toward the start.
          const outer = lists
            .filter(({depth}) => depth === 0)
            .map(({items}) => items[0].textStart);
          expect(outer).toHaveLength(2);
          expect(Math.abs(outer[0] - outer[1])).toBeLessThanOrEqual(1);
        }
        await page.screenshot({
          path: testInfo.outputPath(`${story}-${width}-${mode}-${dir}.png`),
        });

        // The counters' own ink: each ends on the list's one counter edge, as
        // native outside markers do, and each is whole: lifting the lists'
        // inline clip shows no more of it.
        const boxes = await markerBoxes(page);
        await page.addStyleTag({content: COUNTERS_ONLY});
        const clipped = await page.screenshot({fullPage: true});
        await page.addStyleTag({content: UNCLIPPED});
        const whole = await page.screenshot({fullPage: true});
        for (const [index, list] of boxes.entries()) {
          const ink = await inkOf(page, clipped, list, dir);
          expect(ink, `list ${index}: whole counters`).toEqual(
            await inkOf(page, whole, list, dir),
          );
          for (const {start, end} of ink) {
            expect(Number.isFinite(start) && Number.isFinite(end)).toBe(true);
          }
          const edges = ink.map(({start, end}) =>
            dir === 'rtl' ? start : end,
          );
          expect(
            Math.max(...edges) - Math.min(...edges),
            `list ${index}: counters end together`,
          ).toBeLessThanOrEqual(1);
        }
        // Every digit is one width, so numbers line up digit by digit.
        for (const {items} of lists) {
          for (const item of items) {
            expect(item.numerals).toContain('tabular-nums');
          }
        }
      });
    }
  }
}
