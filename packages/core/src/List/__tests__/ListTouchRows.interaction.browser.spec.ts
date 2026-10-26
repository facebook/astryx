// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListTouchRows.interaction.browser.spec.ts
 * @input The built List stories in the touch phone context (primary pointer
 *   coarse) and the row heights from the UIKit constants table
 *   (motion/uikit/list.ts)
 * @output Layout proofs for List rows under a finger: a one-line row is
 *   UIKit's table row height, a row with a description its subtitle height;
 *   a compact list and Markdown's task list keep main's pitch; a list with
 *   markers keeps its rows, each marker on its text; a storyboard of the
 *   two
 * @position Interaction evidence for ListItem's touch row heights
 *   (listRow.stylex.ts) under a finger (./touchStory.ts); an Android case gets
 *   the same heights and a mouse case keeps today's
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {Storyboard, withStorybook} from '@astryxdesign/interaction-harness';
import {list} from '../../motion/uikit/list';
import {openStory} from './touchStory';

const storybook = withStorybook(test);

async function rowHeights(page: Page): Promise<number[]> {
  // The story's rows (Storybook's own hidden error page has list items too).
  return page
    .locator('#storybook-root li')
    .evaluateAll(rows =>
      rows.map(row => Math.round(row.getBoundingClientRect().height)),
    );
}

const isTouch = async (page: Page) =>
  page.evaluate(() => matchMedia('(pointer: coarse)').matches);

const CASES = [
  {
    story: 'core-list--interactive',
    what: 'a one-line row is UIKit’s table row height',
    height: list.metrics.rowHeight,
  },
  {
    story: 'core-list--basic',
    what: 'a row with a description is UIKit’s subtitle row height',
    height: list.metrics.subtitleRowHeight,
  },
] as const;

test('under a finger, spacious density keeps its padding over the same minimum', async ({
  page,
}) => {
  await openStory(page, storybook(), 'core-list--spacious');
  test.skip(
    !(await isTouch(page)),
    'this engine reports a fine primary pointer; the touch heights apply under (pointer: coarse)',
  );
  const rows = await page.locator('#storybook-root li').evaluateAll(elements =>
    elements.map(el => {
      const style = getComputedStyle(el);
      return {
        height: el.getBoundingClientRect().height,
        paddingTop: style.paddingTop,
        minHeight: style.minHeight,
      };
    }),
  );
  expect(rows.length).toBeGreaterThan(0);
  for (const row of rows) {
    // Its rows have descriptions: the subtitle minimum, which spacious
    // padding already exceeds, so the row keeps its own taller height.
    expect(row.minHeight).toBe(`${list.metrics.subtitleRowHeight}px`);
    expect(row.paddingTop).toBe('12px');
    expect(row.height).toBeGreaterThanOrEqual(list.metrics.subtitleRowHeight);
  }
});

test('under a finger, a list with markers keeps its rows and each marker on its text', async ({
  page,
}) => {
  await openStory(page, storybook(), 'core-list--bulleted-list');
  test.skip(!(await isTouch(page)), 'touch rows apply under a finger only');
  const rows = page.locator('#storybook-root li');
  await expect(rows.first()).toBeVisible();
  const measured = await rows.evaluateAll(items =>
    items.map(item => {
      const marker = item
        .querySelector(':scope > span:first-child')
        ?.getBoundingClientRect();
      const text = [...item.querySelectorAll('*')]
        .find(
          el =>
            el.childElementCount === 0 &&
            (el.textContent ?? '').trim().length > 1,
        )
        ?.getBoundingClientRect();
      return {
        height: Math.round(item.getBoundingClientRect().height),
        minHeight: getComputedStyle(item).minHeight,
        offset:
          marker == null || text == null
            ? null
            : marker.top + marker.height / 2 - (text.top + text.height / 2),
      };
    }),
  );
  const summary = JSON.stringify(measured);
  expect(measured.length, summary).toBeGreaterThan(0);
  for (const row of measured) {
    // Running text, not a table: no table-row floor applies.
    expect(['52px', '62px'], summary).not.toContain(row.minHeight);
    expect(row.height, summary).toBeLessThan(52);
    expect(row.offset, summary).not.toBeNull();
    expect(Math.abs(row.offset ?? 99), summary).toBeLessThan(2);
  }
});

/**
 * A dense list's rows, top to bottom: each row's height and its pitch (from
 * its top to the next row's top), to the half pixel.
 */
async function pitches(
  rows: Locator,
): Promise<{heights: number[]; pitches: number[]}> {
  return rows.evaluateAll(items => {
    const boxes = items.map(item => item.getBoundingClientRect());
    const half = (value: number) => Math.round(value * 2) / 2;
    return {
      heights: boxes.map(box => half(box.height)),
      pitches: boxes.slice(1).map((box, i) => half(box.top - boxes[i].top)),
    };
  });
}

/**
 * The dense lists and main's pitch for them on this phone, under a finger and
 * with a mouse (measured on main's Storybook in Chromium, Oct 25 2026; WebKit
 * gives the same rows). A dense list keeps its density: both stay main's.
 */
const DENSE = [
  {
    story: 'core-list--compact',
    what: 'a compact list',
    rows: (page: Page) => page.locator('#storybook-root li'),
    main: {touch: 33, mouse: 29},
  },
  {
    story: 'core-markdown--default',
    what: "Markdown's task list (a compact CheckboxList)",
    rows: (page: Page) =>
      page
        .getByText('Parser', {exact: true})
        .locator('xpath=ancestor::ul[1]/li'),
    main: {touch: 34, mouse: 30},
  },
] as const;

for (const {story, what, rows, main} of DENSE) {
  test(`under a finger, ${what} keeps its density: main's row pitch`, async ({
    browser,
    page,
  }, testInfo) => {
    await openStory(page, storybook(), story);
    test.skip(!(await isTouch(page)), 'touch rows apply under a finger only');
    const touch = await pitches(rows(page));
    // The same page with a mouse: the phone's viewport and scale, a fine
    // pointer.
    const {viewport, deviceScaleFactor} = testInfo.project.use;
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor,
      hasTouch: false,
      isMobile: false,
    });
    try {
      const mousePage = await context.newPage();
      await openStory(mousePage, storybook(), story);
      expect(await isTouch(mousePage)).toBe(false);
      const mouse = await pitches(rows(mousePage));
      const summary = JSON.stringify({touch, mouse, main});
      expect(touch.pitches.length, summary).toBeGreaterThan(0);
      for (const pitch of touch.pitches) {
        expect(pitch, summary).toBe(main.touch);
      }
      for (const pitch of mouse.pitches) {
        expect(pitch, summary).toBe(main.mouse);
      }
    } finally {
      await context.close();
    }
  });
}

test('Android: rows take the same heights (one touch model)', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Android is Chromium');
  for (const {story, height} of CASES) {
    await openStory(page, storybook(), story);
    expect(await isTouch(page)).toBe(true);
    const heights = await rowHeights(page);
    expect(heights.length).toBeGreaterThan(0);
    for (const value of heights) {
      expect(value).toBeGreaterThanOrEqual(height);
    }
  }
});

test("a mouse: rows keep today's heights (touch work costs nothing under a fine pointer)", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: false,
    isMobile: false,
    viewport: {width: 900, height: 700},
  });
  const page = await context.newPage();
  try {
    for (const {story, height} of CASES) {
      await openStory(page, storybook(), story);
      expect(
        await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
      ).toBe(false);
      const rows = await page
        .locator('#storybook-root li')
        .evaluateAll(elements =>
          elements.map(el => ({
            height: el.getBoundingClientRect().height,
            minHeight: getComputedStyle(el).minHeight,
          })),
        );
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.minHeight).not.toBe(`${height}px`);
        expect(row.height).toBeLessThan(height);
      }
    }
  } finally {
    await context.close();
  }
});

for (const {story, what, height} of CASES) {
  test(`under a finger, ${what}`, async ({page}) => {
    await openStory(page, storybook(), story);
    test.skip(
      !(await isTouch(page)),
      'this engine reports a fine primary pointer; the touch heights apply under (pointer: coarse)',
    );
    const heights = await rowHeights(page);
    expect(heights.length).toBeGreaterThan(0);
    for (const h of heights) {
      expect(h).toBe(height);
    }
  });
}

test('storyboard: List rows under a finger @storyboard', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'One engine is enough for the record',
  );
  const storyboard = new Storyboard(page, {
    name: 'list-touch-rows',
    columns: 2,
    cellScale: 0.6,
  });
  for (const {story} of CASES) {
    await openStory(page, storybook(), story);
    // One clip size for every cell of the sheet.
    await page.setViewportSize({width: 402, height: 714});
    await storyboard.capture(story, 0, {rows: await rowHeights(page)});
  }
  await storyboard.write(testInfo);
});
