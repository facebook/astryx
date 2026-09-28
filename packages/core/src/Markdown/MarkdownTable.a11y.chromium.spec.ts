// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MarkdownTable.a11y.chromium.spec.ts
 * @input Uses the two narrow-width Markdown table stories and a built Storybook
 * @output Real-Chromium geometry and focus evidence for Markdown table columns
 * @position Layout and focus proof for `component:Markdown`'s table clause. A
 *   DOM emulator resolves no layout: it cannot say whether a column floor
 *   survived cell padding, whether a header wrapped or was cut, whether a token
 *   stayed on one line, or which element actually scrolls. Every expectation
 *   here is measured from a shipping engine.
 *
 * Build the Storybook first:
 *
 *   pnpm storybook:build
 *   pnpm exec playwright test MarkdownTable.a11y.chromium.spec.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const OUTPUT = path.resolve('test-results/markdown-table-narrow');

/** Reading widths: two phone-sized columns, a side panel, a roomy document. */
const WIDTHS = [320, 390, 528, 1024] as const;

const SHORT_COLUMNS_STORY = 'core-markdown--table-narrow-short-columns';
const WIDE_CONTENT_STORY = 'core-markdown--table-narrow-wide-content';

/**
 * A token this long with no break opportunity in it — an identifier, a status
 * code, a snake_case value — must render on one line. Tokens carrying their own
 * break opportunities (`-`, `/`, `.` in a URL) may legitimately wrap there, and
 * are not what the fixed defect was about: the regression broke words at
 * arbitrary characters.
 */
const LONG_TOKEN_CHARS = 10;
const UNBREAKABLE_TOKEN = /^[A-Za-z0-9_]+$/;

interface HeaderMetrics {
  text: string;
  clientWidth: number;
  scrollWidth: number;
  contentWidth: number;
  lines: number;
  textOverflow: string;
  whiteSpace: string;
}

interface Metrics {
  scroller: {
    exists: boolean;
    scrollWidth: number;
    clientWidth: number;
    overflowX: string;
    role: string | null;
    label: string | null;
    tabIndex: string | null;
  };
  block: {
    scrollWidth: number;
    clientWidth: number;
    overflowX: string;
    role: string | null;
    tabIndex: string | null;
  };
  groupCount: number;
  headers: HeaderMetrics[];
  brokenTokens: string[];
  chPx: number;
}

let storybook: StaticServer;
const evidence: Record<string, unknown>[] = [];

test.beforeAll(async () => {
  fs.rmSync(OUTPUT, {recursive: true, force: true});
  fs.mkdirSync(OUTPUT, {recursive: true});
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  fs.writeFileSync(
    path.join(OUTPUT, 'manifest.json'),
    `${JSON.stringify({version: 1, measurements: evidence}, null, 2)}\n`,
  );
  await storybook?.close();
});

async function openStory(
  page: Page,
  storyId: string,
  width: number,
): Promise<void> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${storyId}&viewMode=story&args=width:${width}`,
    {waitUntil: 'load'},
  );
  await page
    .locator('#storybook-root table')
    .first()
    .waitFor({state: 'visible'});
  // One frame, so layout for the story's width is settled before measuring.
  await page.evaluate(
    async () =>
      new Promise<void>(resolve => requestAnimationFrame(() => resolve())),
  );
}

async function measure(page: Page, longTokenChars: number): Promise<Metrics> {
  return page.evaluate(
    ({minToken, tokenPattern}: {minToken: number; tokenPattern: string}) => {
      const unbreakable = new RegExp(tokenPattern);
      const root = document.querySelector('#storybook-root') as HTMLElement;
      const block = root.querySelector('.astryx-markdown-table') as HTMLElement;
      const scroller = root.querySelector('.astryx-table-scroll-wrapper');

      const lineCount = (element: Element): number => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const tops = new Set<number>();
        for (const rect of Array.from(range.getClientRects())) {
          if (rect.width > 0 || rect.height > 0) {
            tops.add(Math.round(rect.top));
          }
        }
        return Math.max(tops.size, 1);
      };

      const headers = Array.from(root.querySelectorAll('th')).map(th => {
        const styles = getComputedStyle(th);
        return {
          text: (th.textContent ?? '').trim(),
          clientWidth: th.clientWidth,
          scrollWidth: th.scrollWidth,
          contentWidth:
            th.getBoundingClientRect().width -
            parseFloat(styles.paddingLeft) -
            parseFloat(styles.paddingRight),
          lines: lineCount(th),
          textOverflow: styles.textOverflow,
          whiteSpace: styles.whiteSpace,
        };
      });

      // A long token that renders across more than one line box was broken
      // mid-word. Walk the real text nodes rather than trusting the markup.
      const brokenTokens: string[] = [];
      const body = root.querySelector('tbody');
      if (body != null) {
        const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
        for (
          let node = walker.nextNode();
          node != null;
          node = walker.nextNode()
        ) {
          const value = node.nodeValue ?? '';
          const pattern = /\S+/g;
          let match = pattern.exec(value);
          while (match != null) {
            if (match[0].length >= minToken && unbreakable.test(match[0])) {
              const range = document.createRange();
              range.setStart(node, match.index);
              range.setEnd(node, match.index + match[0].length);
              const tops = new Set<number>();
              for (const rect of Array.from(range.getClientRects())) {
                if (rect.width > 0) {
                  tops.add(Math.round(rect.top));
                }
              }
              if (tops.size > 1) {
                brokenTokens.push(match[0]);
              }
            }
            match = pattern.exec(value);
          }
        }
      }

      // One `ch` in a header cell, measured rather than assumed.
      let chPx = 0;
      const firstHeader = root.querySelector('th');
      if (firstHeader != null) {
        const probe = document.createElement('span');
        probe.style.cssText =
          'position:absolute;visibility:hidden;font:inherit';
        probe.textContent = '0';
        firstHeader.appendChild(probe);
        chPx = probe.getBoundingClientRect().width;
        probe.remove();
      }

      return {
        scroller: {
          exists: scroller != null,
          scrollWidth: scroller?.scrollWidth ?? 0,
          clientWidth: scroller?.clientWidth ?? 0,
          overflowX:
            scroller == null ? '' : getComputedStyle(scroller).overflowX,
          role: scroller?.getAttribute('role') ?? null,
          label: scroller?.getAttribute('aria-label') ?? null,
          tabIndex: scroller?.getAttribute('tabindex') ?? null,
        },
        block: {
          scrollWidth: block.scrollWidth,
          clientWidth: block.clientWidth,
          overflowX: getComputedStyle(block).overflowX,
          role: block.getAttribute('role'),
          tabIndex: block.getAttribute('tabindex'),
        },
        groupCount: root.querySelectorAll('[role="group"]').length,
        headers,
        brokenTokens,
        chPx,
      };
    },
    {minToken: longTokenChars, tokenPattern: UNBREAKABLE_TOKEN.source},
  );
}

/** Every width, both stories: the invariants that must hold everywhere. */
test('Markdown table columns keep their content floor and headers stay readable', async ({
  page,
}) => {
  test.setTimeout(3 * 60 * 1000);
  const failures: string[] = [];

  for (const storyId of [SHORT_COLUMNS_STORY, WIDE_CONTENT_STORY]) {
    for (const width of WIDTHS) {
      await openStory(page, storyId, width);
      const metrics = await measure(page, LONG_TOKEN_CHARS);
      evidence.push({storyId, width, ...metrics});
      // Evidence for review: what the reading column actually looks like.
      await page
        .locator('#storybook-root .astryx-markdown')
        .screenshot({path: path.join(OUTPUT, `${storyId}-${width}.png`)});

      if (!metrics.scroller.exists) {
        failures.push(`${storyId} @${width}: no Table scroll region rendered`);
        continue;
      }

      // Exactly one scroll region, named, and it is Table's own.
      if (metrics.groupCount !== 1) {
        failures.push(
          `${storyId} @${width}: ${metrics.groupCount} role="group" elements, expected 1`,
        );
      }
      if (metrics.scroller.label !== 'Table') {
        failures.push(
          `${storyId} @${width}: scroll region name is ${String(metrics.scroller.label)}`,
        );
      }
      if (metrics.block.role != null || metrics.block.tabIndex != null) {
        failures.push(
          `${storyId} @${width}: Markdown's block still claims role/tabindex`,
        );
      }
      // Markdown's own block never scrolls; Table's region is the scroller.
      if (metrics.block.scrollWidth > metrics.block.clientWidth + 1) {
        failures.push(
          `${storyId} @${width}: Markdown's block overflows (${metrics.block.scrollWidth} > ${metrics.block.clientWidth})`,
        );
      }
      if (metrics.block.overflowX !== 'visible') {
        failures.push(
          `${storyId} @${width}: Markdown's block has overflow-x: ${metrics.block.overflowX}`,
        );
      }

      // Headers wrap; none is cut off or ellipsized.
      for (const header of metrics.headers) {
        if (header.textOverflow === 'ellipsis') {
          failures.push(
            `${storyId} @${width}: header "${header.text}" keeps text-overflow: ellipsis`,
          );
        }
        if (header.whiteSpace === 'nowrap') {
          failures.push(
            `${storyId} @${width}: header "${header.text}" keeps white-space: nowrap`,
          );
        }
        if (header.scrollWidth > header.clientWidth + 1) {
          failures.push(
            `${storyId} @${width}: header "${header.text}" overflows its cell (${header.scrollWidth} > ${header.clientWidth})`,
          );
        }
      }

      // Long identifiers, URLs, and code keep their tokens whole.
      if (metrics.brokenTokens.length > 0) {
        failures.push(
          `${storyId} @${width}: tokens broken mid-word — ${metrics.brokenTokens.join(', ')}`,
        );
      }
    }
  }

  expect(failures).toEqual([]);
});

test('six short columns fit a narrow reading column instead of scrolling', async ({
  page,
}) => {
  for (const width of [390, 528, 1024]) {
    await openStory(page, SHORT_COLUMNS_STORY, width);
    const metrics = await measure(page, LONG_TOKEN_CHARS);
    evidence.push({
      storyId: SHORT_COLUMNS_STORY,
      width,
      fits: true,
      ...metrics,
    });
    expect(
      metrics.scroller.scrollWidth,
      `six short columns should fit at ${width}px`,
    ).toBeLessThanOrEqual(metrics.scroller.clientWidth + 1);
  }
});

test('a wide table scrolls only in the Table scroll region, and by keyboard', async ({
  page,
}) => {
  await openStory(page, WIDE_CONTENT_STORY, 390);
  const metrics = await measure(page, LONG_TOKEN_CHARS);
  evidence.push({
    storyId: WIDE_CONTENT_STORY,
    width: 390,
    keyboard: true,
    ...metrics,
  });

  // The wide table really does overflow, and the overflow is Table's alone.
  expect(metrics.groupCount).toBe(1);
  expect(metrics.block.role).toBeNull();
  expect(metrics.block.tabIndex).toBeNull();
  expect(metrics.scroller.scrollWidth).toBeGreaterThan(
    metrics.scroller.clientWidth,
  );
  expect(metrics.scroller.overflowX).toBe('auto');
  expect(metrics.block.scrollWidth).toBeLessThanOrEqual(
    metrics.block.clientWidth + 1,
  );
  // Focusable only because it scrolls.
  expect(metrics.scroller.tabIndex).toBe('0');

  const scroller = page.locator('.astryx-table-scroll-wrapper');
  await scroller.evaluate(element => {
    (element as HTMLElement).focus({preventScroll: true});
  });
  expect(
    await page.evaluate(() =>
      document.activeElement?.classList.contains('astryx-table-scroll-wrapper'),
    ),
  ).toBe(true);

  const before = await scroller.evaluate(element => element.scrollLeft);
  for (let press = 0; press < 8; press += 1) {
    await page.keyboard.press('ArrowRight');
  }
  await page.waitForFunction(
    previous =>
      (document.querySelector('.astryx-table-scroll-wrapper') as HTMLElement)
        .scrollLeft > previous,
    before,
  );
  const after = await scroller.evaluate(element => element.scrollLeft);
  expect(after).toBeGreaterThan(before);
});

test('a column floor survives the cell padding it sits behind', async ({
  page,
}) => {
  // The floor is a `ch` count on the cell's text box. Border-box padding used
  // to eat it: a 4ch floor delivered about 1.5 characters of text, and the old
  // fixed buckets capped a column at 120px however long its content was.
  // Measure the content box against the floor the renderer asked for.
  await openStory(page, WIDE_CONTENT_STORY, 390);
  const wide = await measure(page, LONG_TOKEN_CHARS);
  evidence.push({
    storyId: WIDE_CONTENT_STORY,
    width: 390,
    paddingCorrect: true,
    ...wide,
  });
  const identifier = wide.headers.find(header => header.text === 'Identifier');
  const longLabel = wide.headers.find(header =>
    header.text.startsWith('Accessibility status'),
  );
  // `D116586407` is ten characters and cannot break: the column carries it.
  expect(identifier?.contentWidth).toBeGreaterThanOrEqual(10 * wide.chPx - 1);
  // A 42-character label floors the column at 21ch (its body floor) and wraps.
  expect(longLabel?.contentWidth).toBeGreaterThanOrEqual(20 * wide.chPx - 1);
  expect(longLabel?.lines).toBeGreaterThan(1);

  await openStory(page, SHORT_COLUMNS_STORY, 390);
  const short = await measure(page, LONG_TOKEN_CHARS);
  evidence.push({
    storyId: SHORT_COLUMNS_STORY,
    width: 390,
    paddingCorrect: true,
    ...short,
  });
  for (const header of short.headers) {
    expect(
      header.contentWidth,
      `header "${header.text}" should keep at least 4ch of text box`,
    ).toBeGreaterThanOrEqual(4 * short.chPx - 1);
  }
});
