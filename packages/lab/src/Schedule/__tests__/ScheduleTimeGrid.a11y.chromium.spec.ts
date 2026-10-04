// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ScheduleTimeGrid.a11y.chromium.spec.ts
 * @input The built Lab/Schedule week and day stories in real Chromium, with the
 *   classic space-taking scrollbars Playwright's headless default hides
 * @output Receipted geometry, initial-scroll, overlap-layout, and keyboard-reach
 *   evidence for the Schedule time grid
 * @position Browser binding for the Schedule time-grid contract. jsdom lays out
 *   nothing, so scrollbar width, sticky alignment, scroll offsets, and the
 *   paint rectangles of simultaneous events are checkable only here.
 *
 * Every element lookup below works from text, computed style, and geometry
 * rather than from class names, so the same assertions run unchanged against
 * a build that predates the contract (producing the red evidence) and against
 * one that implements it.
 */

import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const OUTPUT = path.resolve('test-results/schedule-time-grid-evidence');
const WEEKLY = 'lab-schedule--weekly';
const WEEKLY_FIXED_HEIGHT = 'lab-schedule--weekly-fixed-height';
const DAY = 'lab-schedule--day';
const OVERLAPPING = 'lab-schedule--overlapping-events';
const WIDE = {width: 1280, height: 900};
const NARROW = {width: 760, height: 700};
// One hour of the week/day stories; the contract's lead context is one hour.
const HOUR_HEIGHT = 100;

// Linux Chromium paints classic 15px scrollbars once Playwright's
// `--hide-scrollbars` is dropped: the Windows / "always show scroll bars"
// case this geometry contract exists for.
test.use({launchOptions: {ignoreDefaultArgs: ['--hide-scrollbars']}});

interface Box {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

interface TimeGridReading {
  readonly direction: 'ltr' | 'rtl';
  readonly scroller: {
    readonly box: Box;
    readonly scrollTop: number;
    readonly scrollLeft: number;
    readonly scrollHeight: number;
    readonly clientHeight: number;
    readonly scrollWidth: number;
    readonly clientWidth: number;
    readonly verticalScrollbarWidth: number;
  } | null;
  readonly headerCells: ReadonlyArray<Box>;
  readonly bodyColumns: ReadonlyArray<Box>;
  readonly hourLabels: ReadonlyArray<{
    readonly text: string;
    readonly left: number;
  }>;
  readonly nowLine: {readonly topInContent: number} | null;
  readonly firstColumnTopInContent: number | null;
  readonly horizontalScrollerCount: number;
  readonly pageOverflows: boolean;
}

interface Receipt {
  readonly test: string;
  readonly story: string;
  readonly viewport: {readonly width: number; readonly height: number};
  readonly direction: 'ltr' | 'rtl';
  readonly browser: string;
  readonly checkout: string;
  readonly head: string;
  readonly measured: unknown;
  readonly screenshot: string;
}

let storybook: StaticServer;
let checkoutSha = '';
const receipts: Receipt[] = [];

test.beforeAll(async () => {
  checkoutSha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  fs.mkdirSync(OUTPUT, {recursive: true});
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  fs.writeFileSync(
    path.join(OUTPUT, 'receipts.json'),
    `${JSON.stringify(receipts, null, 2)}\n`,
  );
  await storybook?.close();
});

function storyUrl(id: string, globals?: string): string {
  const query = globals == null ? '' : `&globals=${globals}`;
  return `${storybook.origin}/iframe.html?id=${id}&viewMode=story${query}`;
}

async function openStory(
  page: Page,
  id: string,
  viewport: {width: number; height: number},
  globals?: string,
): Promise<void> {
  await page.setViewportSize(viewport);
  await page.goto(storyUrl(id, globals), {waitUntil: 'load'});
  await page.locator('.astryx-schedule').waitFor();
  // Fonts and the first layout pass settle before anything is measured.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
}

/**
 * Reads the painted time grid by what it is, not by how it is classed: the
 * scroll owner is the first element whose block axis overflows, header cells
 * hold the day headings, body columns are the stacks of empty hour slots, and
 * the now-line is the two-pixel rule.
 */
function readTimeGrid(page: Page): Promise<TimeGridReading> {
  return page.evaluate((hourHeight): TimeGridReading => {
    const toBox = (rect: DOMRect) => ({
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
    const root = document.querySelector<HTMLElement>('.astryx-schedule');
    if (root == null) {
      throw new Error('No Schedule root in the story');
    }
    const direction: 'ltr' | 'rtl' =
      getComputedStyle(root).direction === 'rtl' ? 'rtl' : 'ltr';
    const all = [...root.querySelectorAll<HTMLElement>('*')];
    const scrollsOn = (element: HTMLElement, axis: 'x' | 'y') => {
      const style = getComputedStyle(element);
      const overflow = axis === 'x' ? style.overflowX : style.overflowY;
      const excess =
        axis === 'x'
          ? element.scrollWidth - element.clientWidth
          : element.scrollHeight - element.clientHeight;
      return (overflow === 'auto' || overflow === 'scroll') && excess > 1;
    };
    const scrollerElement =
      all.find(element => scrollsOn(element, 'y')) ?? null;
    const scrollerBox = scrollerElement?.getBoundingClientRect();
    const inScroller = (element: Element) =>
      scrollerElement != null && scrollerElement.contains(element);

    const headerCells = [...root.querySelectorAll<HTMLElement>('h3')]
      .map(heading => heading.parentElement)
      .filter((cell): cell is HTMLElement => cell != null)
      .map(cell => toBox(cell.getBoundingClientRect()));

    const isEmptyBox = (element: HTMLElement) =>
      element.children.length === 0 && element.textContent?.trim() === '';
    const slots = all.filter(element => {
      if (!inScroller(element) || !isEmptyBox(element)) {return false;}
      const rect = element.getBoundingClientRect();
      return Math.abs(rect.height - hourHeight) <= 2 && rect.width > 20;
    });
    const columnsByLeft = new Map<number, Box>();
    for (const slot of slots) {
      const rect = slot.getBoundingClientRect();
      const key = Math.round(rect.left);
      const existing = columnsByLeft.get(key);
      if (existing == null) {
        columnsByLeft.set(key, toBox(rect));
      } else {
        columnsByLeft.set(key, {
          ...existing,
          top: Math.min(existing.top, rect.top),
          bottom: Math.max(existing.bottom, rect.bottom),
        });
      }
    }
    const bodyColumns = [...columnsByLeft.values()].sort((a, b) =>
      direction === 'rtl' ? b.left - a.left : a.left - b.left,
    );
    const sortedHeaderCells = [...headerCells].sort((a, b) =>
      direction === 'rtl' ? b.left - a.left : a.left - b.left,
    );

    const hourLabels = all
      .filter(
        element =>
          inScroller(element) &&
          element.children.length === 0 &&
          /^\d{1,2}(:\d{2})?\s?(AM|PM)$/i.test(
            element.textContent?.trim() ?? '',
          ),
      )
      .map(element => ({
        text: element.textContent?.trim() ?? '',
        left: element.getBoundingClientRect().left,
      }));

    const nowLineElement = all.find(element => {
      if (!inScroller(element) || !isEmptyBox(element)) {return false;}
      const style = getComputedStyle(element);
      return (
        style.position === 'absolute' &&
        style.borderTopWidth === '2px' &&
        element.getBoundingClientRect().height <= 2
      );
    });
    const contentTop = (element: Element) =>
      scrollerElement == null || scrollerBox == null
        ? null
        : element.getBoundingClientRect().top -
          scrollerBox.top +
          scrollerElement.scrollTop;
    const firstSlotOfFirstColumn = slots
      .map(slot => ({slot, rect: slot.getBoundingClientRect()}))
      .filter(
        ({rect}) =>
          bodyColumns[0] != null &&
          Math.round(rect.left) === Math.round(bodyColumns[0].left),
      )
      .sort((a, b) => a.rect.top - b.rect.top)[0]?.slot;

    const horizontalScrollerCount = all.filter(element =>
      scrollsOn(element, 'x'),
    ).length;

    return {
      direction,
      scroller:
        scrollerElement == null || scrollerBox == null
          ? null
          : {
              box: toBox(scrollerBox),
              scrollTop: scrollerElement.scrollTop,
              scrollLeft: scrollerElement.scrollLeft,
              scrollHeight: scrollerElement.scrollHeight,
              clientHeight: scrollerElement.clientHeight,
              scrollWidth: scrollerElement.scrollWidth,
              clientWidth: scrollerElement.clientWidth,
              verticalScrollbarWidth:
                scrollerElement.offsetWidth - scrollerElement.clientWidth,
            },
      headerCells: sortedHeaderCells,
      bodyColumns,
      hourLabels,
      nowLine:
        nowLineElement == null
          ? null
          : {topInContent: contentTop(nowLineElement) ?? Number.NaN},
      firstColumnTopInContent:
        firstSlotOfFirstColumn == null
          ? null
          : contentTop(firstSlotOfFirstColumn),
      horizontalScrollerCount,
      pageOverflows:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    };
  }, HOUR_HEIGHT);
}

function columnDeltas(reading: TimeGridReading) {
  return reading.headerCells.map((cell, index) => {
    const column = reading.bodyColumns[index];
    return {
      index,
      header: [Math.round(cell.left), Math.round(cell.right)],
      body:
        column == null
          ? null
          : [Math.round(column.left), Math.round(column.right)],
      deltaLeft: column == null ? null : Math.abs(cell.left - column.left),
      deltaRight: column == null ? null : Math.abs(cell.right - column.right),
    };
  });
}

function setScrollLeft(page: Page, value: number): Promise<void> {
  return page.evaluate(scrollLeft => {
    const root = document.querySelector<HTMLElement>('.astryx-schedule');
    const scroller = [...(root?.querySelectorAll<HTMLElement>('*') ?? [])].find(
      element => {
        const style = getComputedStyle(element);
        return (
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          element.scrollHeight - element.clientHeight > 1
        );
      },
    );
    if (scroller != null) {scroller.scrollLeft = scrollLeft;}
  }, value);
}

function setScrollTop(page: Page, value: number): Promise<void> {
  return page.evaluate(scrollTop => {
    const root = document.querySelector<HTMLElement>('.astryx-schedule');
    const scroller = [...(root?.querySelectorAll<HTMLElement>('*') ?? [])].find(
      element => {
        const style = getComputedStyle(element);
        return (
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          element.scrollHeight - element.clientHeight > 1
        );
      },
    );
    if (scroller != null) {scroller.scrollTop = scrollTop;}
  }, value);
}

async function record(
  page: Page,
  name: string,
  story: string,
  direction: 'ltr' | 'rtl',
  measured: unknown,
): Promise<void> {
  const viewport = page.viewportSize() ?? WIDE;
  const file = `${name}.png`;
  await page.screenshot({path: path.join(OUTPUT, file), fullPage: false});
  receipts.push({
    test: name,
    story,
    viewport,
    direction,
    browser: page.context().browser()?.version() ?? 'unknown',
    checkout: checkoutSha,
    head: process.env.ASTRYX_HEAD_SHA ?? checkoutSha,
    measured,
    screenshot: file,
  });
  console.log(`[schedule-time-grid] ${name}: ${JSON.stringify(measured)}`);
}

test.describe('scroll geometry', () => {
  for (const direction of ['ltr', 'rtl'] as const) {
    test(`header and body columns share one geometry with classic scrollbars (${direction})`, async ({
      page,
    }) => {
      await openStory(
        page,
        WEEKLY_FIXED_HEIGHT,
        WIDE,
        direction === 'rtl' ? 'direction:rtl' : undefined,
      );
      const reading = await readTimeGrid(page);
      const deltas = columnDeltas(reading);
      await record(
        page,
        `geometry-classic-scrollbar-${direction}`,
        WEEKLY_FIXED_HEIGHT,
        direction,
        {
          scrollbarWidth: reading.scroller?.verticalScrollbarWidth,
          horizontalScrollers: reading.horizontalScrollerCount,
          deltas,
        },
      );

      expect(
        reading.scroller,
        'the time grid has a block-axis scroll owner',
      ).not.toBeNull();
      expect(reading.headerCells).toHaveLength(7);
      expect(reading.bodyColumns).toHaveLength(7);
      // The scrollbar must be a real, space-taking one for this evidence to
      // mean anything; the launch option above is what provides it.
      expect(
        reading.scroller?.verticalScrollbarWidth ?? 0,
      ).toBeGreaterThanOrEqual(8);
      for (const delta of deltas) {
        expect(
          delta.deltaLeft,
          `column ${delta.index} inline-start edge`,
        ).toBeLessThanOrEqual(1);
        expect(
          delta.deltaRight,
          `column ${delta.index} inline-end edge`,
        ).toBeLessThanOrEqual(1);
      }
      expect(reading.pageOverflows, 'no whole-page overflow').toBe(false);
    });
  }

  test('a narrow viewport scrolls header, gutter, and columns as one owner', async ({
    page,
  }) => {
    await openStory(page, WEEKLY, NARROW);
    const before = await readTimeGrid(page);
    await setScrollLeft(page, 160);
    await page.waitForTimeout(50);
    const after = await readTimeGrid(page);
    const deltas = columnDeltas(after);
    const labelDrift = after.hourLabels.map((label, index) => ({
      text: label.text,
      drift: Math.abs(
        label.left - (before.hourLabels[index]?.left ?? Number.NaN),
      ),
    }));
    await record(
      page,
      'geometry-narrow-horizontal-scroll',
      WEEKLY,
      after.direction,
      {
        horizontalScrollersBefore: before.horizontalScrollerCount,
        scrollLeftApplied: after.scroller?.scrollLeft,
        deltas,
        labelDrift,
        pageOverflows: after.pageOverflows,
      },
    );

    expect(
      after.scroller?.scrollLeft ?? 0,
      'the owner actually scrolled',
    ).toBeGreaterThan(100);
    expect(
      before.horizontalScrollerCount,
      'exactly one inline-axis scroll owner',
    ).toBe(1);
    for (const delta of deltas) {
      expect(
        delta.deltaLeft,
        `column ${delta.index} inline-start edge after scroll`,
      ).toBeLessThanOrEqual(1);
      expect(
        delta.deltaRight,
        `column ${delta.index} inline-end edge after scroll`,
      ).toBeLessThanOrEqual(1);
    }
    expect(labelDrift.length).toBeGreaterThan(0);
    for (const label of labelDrift) {
      expect(
        label.drift,
        `hour label ${label.text} stays pinned`,
      ).toBeLessThanOrEqual(1);
    }
    expect(after.pageOverflows, 'no whole-page overflow').toBe(false);
  });
});

test.describe('initial time position', () => {
  async function expectedInitialScrollTop(page: Page) {
    const reading = await readTimeGrid(page);
    const {scroller, nowLine, firstColumnTopInContent} = reading;
    if (
      scroller == null ||
      nowLine == null ||
      firstColumnTopInContent == null
    ) {
      return {reading, expected: null, max: null};
    }
    const max = scroller.scrollHeight - scroller.clientHeight;
    // Sticky rows above the columns occupy the top of the viewport, so the
    // one-hour lead is measured from the column's own top, not the scroller's.
    const lead = nowLine.topInContent - firstColumnTopInContent - HOUR_HEIGHT;
    const expected = Math.min(max, Math.max(0, lead));
    return {reading, expected, max};
  }

  test('a week containing today opens one hour before now', async ({page}) => {
    // 22:00Z is 15:00 in the story's America/Los_Angeles week (07:00–19:00).
    await page.clock.install({time: new Date('2026-05-13T22:00:00Z')});
    await openStory(page, WEEKLY, WIDE);
    const {reading, expected, max} = await expectedInitialScrollTop(page);
    await record(page, 'initial-scroll-week-today', WEEKLY, reading.direction, {
      scrollTop: reading.scroller?.scrollTop,
      expected,
      max,
      nowLineTopInContent: reading.nowLine?.topInContent,
      columnTopInContent: reading.firstColumnTopInContent,
    });
    expect(expected, 'the now-line is painted').not.toBeNull();
    expect(
      Math.abs((reading.scroller?.scrollTop ?? 0) - (expected ?? 0)),
    ).toBeLessThanOrEqual(2);

    // The position is set once per range open: a clock tick, a resize, and a
    // re-render leave the person's own scroll alone.
    await setScrollTop(page, 123);
    await page.clock.pauseAt(new Date('2026-05-13T22:05:00Z'));
    await page.clock.runFor(61_000);
    await page.evaluate(() => {
      // A theme change re-renders every block without changing the range.
      (
        window as unknown as {
          __STORYBOOK_ADDONS_CHANNEL__: {
            emit: (event: string, payload: unknown) => void;
          };
        }
      ).__STORYBOOK_ADDONS_CHANNEL__.emit('updateGlobals', {
        globals: {colorMode: 'dark'},
      });
    });
    await page.setViewportSize({width: 1180, height: 820});
    await page.waitForTimeout(200);
    const afterTick = await readTimeGrid(page);
    await record(
      page,
      'initial-scroll-week-today-after-tick',
      WEEKLY,
      afterTick.direction,
      {
        scrollTop: afterTick.scroller?.scrollTop,
      },
    );
    expect(afterTick.scroller?.scrollTop).toBe(123);
  });

  test('a day containing today opens one hour before now', async ({page}) => {
    // 20:00Z is 13:00 in the story's America/Los_Angeles day (00:00–24:00).
    await page.clock.install({time: new Date('2026-05-13T20:00:00Z')});
    await openStory(page, DAY, WIDE);
    const {reading, expected, max} = await expectedInitialScrollTop(page);
    await record(page, 'initial-scroll-day-today', DAY, reading.direction, {
      scrollTop: reading.scroller?.scrollTop,
      expected,
      max,
    });
    expect(expected).not.toBeNull();
    expect(
      Math.abs((reading.scroller?.scrollTop ?? 0) - (expected ?? 0)),
    ).toBeLessThanOrEqual(2);
  });

  test('near midnight the position clamps to the end of the grid', async ({
    page,
  }) => {
    // 06:50Z is 23:50 the previous evening in America/Los_Angeles.
    await page.clock.install({time: new Date('2026-05-14T06:50:00Z')});
    await openStory(page, DAY, WIDE);
    const {reading, expected, max} = await expectedInitialScrollTop(page);
    await record(
      page,
      'initial-scroll-day-near-midnight',
      DAY,
      reading.direction,
      {
        scrollTop: reading.scroller?.scrollTop,
        expected,
        max,
      },
    );
    expect(expected).not.toBeNull();
    expect(expected).toBe(max);
    expect(
      Math.abs((reading.scroller?.scrollTop ?? 0) - (expected ?? 0)),
    ).toBeLessThanOrEqual(2);
  });

  test('a range without today opens at its configured start', async ({
    page,
  }) => {
    await page.clock.install({time: new Date('2026-06-01T17:00:00Z')});
    await openStory(page, OVERLAPPING, WIDE);
    const reading = await readTimeGrid(page);
    await record(
      page,
      'initial-scroll-not-today',
      OVERLAPPING,
      reading.direction,
      {
        scrollTop: reading.scroller?.scrollTop,
        nowLine: reading.nowLine,
      },
    );
    expect(reading.nowLine).toBeNull();
    expect(reading.scroller?.scrollTop ?? 0).toBe(0);
  });
});

interface BlockReading {
  readonly title: string;
  readonly box: Box;
  readonly columnIsolation: string;
}

function readBlocks(
  page: Page,
  titles: ReadonlyArray<string>,
): Promise<BlockReading[]> {
  return page.evaluate((wanted): BlockReading[] => {
    const root = document.querySelector<HTMLElement>('.astryx-schedule');
    if (root == null) {throw new Error('No Schedule root in the story');}
    const leaves = [...root.querySelectorAll<HTMLElement>('*')].filter(
      element =>
        element.children.length === 0 &&
        wanted.includes(element.textContent?.trim() ?? ''),
    );
    const seen = new Set<HTMLElement>();
    const blocks: Array<{title: string; box: Box; columnIsolation: string}> =
      [];
    for (const leaf of leaves) {
      let block: HTMLElement | null = leaf;
      while (block != null && getComputedStyle(block).position !== 'absolute') {
        block = block.parentElement;
      }
      if (block == null || seen.has(block)) {
        continue;
      }
      // The hidden read-only grid repeats titles inside aria-labels, never as
      // text nodes, so a text leaf is always a painted block.
      seen.add(block);
      const rect = block.getBoundingClientRect();
      blocks.push({
        title: leaf.textContent?.trim() ?? '',
        box: {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        },
        columnIsolation:
          block.parentElement == null
            ? ''
            : getComputedStyle(block.parentElement).isolation,
      });
    }
    return blocks;
  }, titles);
}

function inlineOverlap(a: Box, b: Box): number {
  return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
}

function blockOverlap(a: Box, b: Box): number {
  const horizontal = inlineOverlap(a, b);
  const vertical = Math.max(
    0,
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top),
  );
  return horizontal * vertical;
}

test.describe('overlap layout', () => {
  const simultaneousGroups: ReadonlyArray<{name: string; titles: string[]}> = [
    {name: 'two-tie', titles: ['Pair review', 'Pair review']},
    {
      name: 'three',
      titles: ['Interview loop 1', 'Interview loop 2', 'Interview loop 3'],
    },
    {
      name: 'five',
      titles: [
        'Office hours A',
        'Office hours B',
        'Office hours C',
        'Office hours D',
        'Office hours E',
      ],
    },
  ];
  const chain = ['Standup', 'Design sync', 'Retro'];
  const contained = ['Workshop', 'Coffee chat'];

  test('simultaneous events sit side by side and never cover one another', async ({
    page,
  }) => {
    await openStory(page, OVERLAPPING, WIDE);
    const titles = [
      ...simultaneousGroups.flatMap(group => group.titles),
      ...chain,
      ...contained,
      'Quick check-in',
    ];
    const blocks = await readBlocks(page, titles);
    const byTitle = (title: string) =>
      blocks.filter(block => block.title === title);

    const groupResults = simultaneousGroups.map(group => {
      const members = group.titles.flatMap(title => byTitle(title));
      const unique = [...new Set(members)];
      const pairs: Array<{a: string; b: string; coveredPercent: number}> = [];
      for (let i = 0; i < unique.length; i += 1) {
        for (let j = i + 1; j < unique.length; j += 1) {
          const a = unique[i];
          const b = unique[j];
          const smaller = Math.min(
            a.box.width * a.box.height,
            b.box.width * b.box.height,
          );
          pairs.push({
            a: a.title,
            b: b.title,
            coveredPercent:
              smaller === 0
                ? 0
                : Math.round((blockOverlap(a.box, b.box) / smaller) * 100),
          });
        }
      }
      return {
        name: group.name,
        found: unique.length,
        expected: group.titles.length,
        widths: unique.map(block => Math.round(block.box.width)),
        pairs,
        isolation: unique.map(block => block.columnIsolation),
      };
    });
    const chainBlocks = chain.map(title => byTitle(title)[0]).filter(Boolean);
    const containedBlocks = contained
      .map(title => byTitle(title)[0])
      .filter(Boolean);
    const quarter = byTitle('Quick check-in')[0];
    const measured = {
      groups: groupResults,
      chain:
        chainBlocks.length === 3
          ? {
              standupVsDesignSyncPercent: Math.round(
                (blockOverlap(chainBlocks[0].box, chainBlocks[1].box) /
                  Math.min(
                    chainBlocks[0].box.width * chainBlocks[0].box.height,
                    chainBlocks[1].box.width * chainBlocks[1].box.height,
                  )) *
                  100,
              ),
              designSyncVsRetroPercent: Math.round(
                (blockOverlap(chainBlocks[1].box, chainBlocks[2].box) /
                  Math.min(
                    chainBlocks[1].box.width * chainBlocks[1].box.height,
                    chainBlocks[2].box.width * chainBlocks[2].box.height,
                  )) *
                  100,
              ),
            }
          : null,
      contained:
        containedBlocks.length === 2
          ? {
              coffeeChatCoveredPercent: Math.round(
                (blockOverlap(containedBlocks[0].box, containedBlocks[1].box) /
                  (containedBlocks[1].box.width *
                    containedBlocks[1].box.height)) *
                  100,
              ),
            }
          : null,
      quarterHourHeight:
        quarter == null ? null : Math.round(quarter.box.height),
    };
    await record(page, 'overlap-side-by-side', OVERLAPPING, 'ltr', measured);

    for (const group of groupResults) {
      expect(group.found, `${group.name}: every event is painted`).toBe(
        group.expected,
      );
      for (const width of group.widths) {
        expect(
          width,
          `${group.name}: a block keeps a perceivable width`,
        ).toBeGreaterThanOrEqual(16);
      }
      for (const pair of group.pairs) {
        expect(
          pair.coveredPercent,
          `${group.name}: ${pair.a} vs ${pair.b} covered`,
        ).toBeLessThanOrEqual(2);
      }
      for (const isolation of group.isolation) {
        expect(
          isolation,
          `${group.name}: the column isolates its paint order`,
        ).toBe('isolate');
      }
    }
    expect(measured.chain).not.toBeNull();
    expect(measured.chain?.standupVsDesignSyncPercent).toBeLessThanOrEqual(2);
    expect(measured.chain?.designSyncVsRetroPercent).toBeLessThanOrEqual(2);
    expect(measured.contained).not.toBeNull();
    expect(measured.contained?.coffeeChatCoveredPercent).toBeLessThanOrEqual(2);
    expect(measured.quarterHourHeight ?? 0).toBeGreaterThanOrEqual(20);
  });
});

test.describe('keyboard reach', () => {
  test('Tab reaches the time grid after the header controls', async ({
    page,
  }) => {
    await openStory(page, WEEKLY, WIDE);
    const sequence: Array<{
      tag: string;
      role: string | null;
      label: string | null;
      text: string;
      insideTimeGrid: boolean;
    }> = [];
    for (let press = 0; press < 12; press += 1) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement | null;
        if (element == null || element === document.body) {
          return {
            tag: 'body',
            role: null,
            label: null,
            text: '',
            insideTimeGrid: false,
          };
        }
        const root = document.querySelector('.astryx-schedule');
        const headerRow =
          root?.querySelector('h2')?.closest('div')?.parentElement ?? null;
        const insideTimeGrid =
          root != null &&
          root.contains(element) &&
          !(headerRow != null && headerRow.contains(element));
        return {
          tag: element.tagName.toLowerCase(),
          role: element.getAttribute('role'),
          label: element.getAttribute('aria-label'),
          text: (element.textContent ?? '').trim().slice(0, 40),
          insideTimeGrid,
        };
      });
      sequence.push(focused);
      if (focused.insideTimeGrid || focused.tag === 'body') {break;}
    }
    await record(page, 'keyboard-reach', WEEKLY, 'ltr', {sequence});
    expect(
      sequence.some(stop => stop.insideTimeGrid),
      'a keyboard user can reach the time grid (its scroll owner or an event)',
    ).toBe(true);
  });
});
