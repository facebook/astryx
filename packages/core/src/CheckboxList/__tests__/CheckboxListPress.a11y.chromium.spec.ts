// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CheckboxListPress.a11y.chromium.spec.ts
 * @input The CheckboxList Default story in a built Storybook (a layered
 *   stylesheet) and real touch input through CDP
 * @output Real-engine proof that a finger on a CheckboxList row's label and a
 *   finger on its box press the same surface and paint the same pixels (the
 *   row and the box over it)
 * @position Run with `pnpm test:a11y-contract`. Browser layer of the row's
 *   press surface; the jsdom layer is CheckboxList.test.tsx ("CheckboxListItem
 *   press surface").
 */

import {expect, test, type Browser, type Page} from '@playwright/test';
// @ts-expect-error -- pngjs ships no declarations; runtime support is pinned.
import {PNG} from 'pngjs';
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

/** A phone: touch screen, primary pointer coarse. */
const PHONE = {
  viewport: {width: 402, height: 714},
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
} as const;

/** Longer than the content-touch delay a press waits before it paints. */
const HOLD_MS = 300;

type RGB = [number, number, number];
type Point = {x: number; y: number};

interface Row {
  page: Page;
  close: () => Promise<void>;
  /** Where a finger lands on the label, and on the box. */
  label: Point;
  box: Point;
  /** Where the press is read: inside the box, and on the row clear of content. */
  boxSample: Point;
  rowSample: Point;
  press: (at: Point) => Promise<void>;
  lift: (at: Point) => Promise<void>;
}

async function openRow(
  browser: Browser,
  story: string,
  name: string,
): Promise<Row> {
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();
  await page.goto(`${storybook.origin}/iframe.html?id=${story}&viewMode=story`);
  const checkbox = page.getByRole('checkbox', {name});
  await checkbox.waitFor({state: 'attached'});
  const geometry = await checkbox.evaluate(input => {
    const row = input.closest('li');
    const box = row?.querySelector('.astryx-checkbox-indicator');
    const label = Array.from(row?.querySelectorAll('span') ?? []).find(
      span => span.children.length === 0 && span.textContent !== '',
    );
    if (row == null || box == null || label == null) {
      return null;
    }
    const rect = (element: Element) => {
      const r = element.getBoundingClientRect();
      return {x: r.x, y: r.y, width: r.width, height: r.height};
    };
    return {row: rect(row), box: rect(box), label: rect(label)};
  });
  if (geometry == null) {
    throw new Error(`${story} has no row for ${name}`);
  }
  const cdp = await context.newCDPSession(page);
  const {row, box, label} = geometry;
  return {
    page,
    close: async () => context.close(),
    label: {x: label.x + label.width / 2, y: label.y + label.height / 2},
    box: {x: box.x + box.width / 2, y: box.y + box.height / 2},
    boxSample: {x: box.x + box.width / 2, y: box.y + box.height - 5},
    rowSample: {x: row.x + row.width - 12, y: row.y + row.height / 2},
    press: async at => {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{x: at.x, y: at.y, id: 1}],
      });
    },
    lift: async () => {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
    },
  };
}

/** The colour of a 2 × 2 CSS px patch, as presented. */
async function pixel(page: Page, at: Point): Promise<RGB> {
  const png = PNG.sync.read(
    await page.screenshot({
      clip: {
        x: Math.round(at.x) - 1,
        y: Math.round(at.y) - 1,
        width: 2,
        height: 2,
      },
      animations: 'allow',
      caret: 'hide',
    }),
  );
  const sum = [0, 0, 0];
  const count = png.width * png.height;
  for (let i = 0; i < count; i++) {
    sum[0] += png.data[i * 4];
    sum[1] += png.data[i * 4 + 1];
    sum[2] += png.data[i * 4 + 2];
  }
  return sum.map(value => Math.round(value / count)) as RGB;
}

/** Which element carries the press, described by its tag. */
async function pressedSurface(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const pressed = document.querySelector('[data-astryx-press]');
    return pressed == null ? null : pressed.tagName.toLowerCase();
  });
}

const darker = (a: RGB, b: RGB) => a.every((value, i) => value < b[i]);

interface PressRead {
  surface: string | null;
  box: RGB;
  row: RGB;
}

test.describe('CheckboxList row press', () => {
  test('a finger on the label and a finger on the box press the same surface and paint the same pixels', async ({
    browser,
  }) => {
    const reads = new Map<'label' | 'box', PressRead>();
    let rest: {box: RGB; row: RGB} | null = null;
    for (const where of ['label', 'box'] as const) {
      // A fresh page per press: the lift toggles the option.
      const row = await openRow(browser, 'core-checkboxlist--default', 'SMS');
      try {
        rest ??= {
          box: await pixel(row.page, row.boxSample),
          row: await pixel(row.page, row.rowSample),
        };
        await row.press(row[where]);
        await row.page.waitForTimeout(HOLD_MS);
        reads.set(where, {
          surface: await pressedSurface(row.page),
          box: await pixel(row.page, row.boxSample),
          row: await pixel(row.page, row.rowSample),
        });
        await row.lift(row[where]);
      } finally {
        await row.close();
      }
    }
    const onLabel = reads.get('label');
    const onBox = reads.get('box');
    if (rest == null || onLabel == null || onBox == null) {
      throw new Error('the presses were not read');
    }
    // One surface: the row itself, wherever the finger landed.
    expect(onLabel.surface).toBe('li');
    expect(onBox.surface).toBe('li');
    // The row and the box over it are both painted, the same either way.
    expect(darker(onLabel.row, rest.row)).toBe(true);
    expect(darker(onLabel.box, rest.box)).toBe(true);
    expect(onBox.row).toEqual(onLabel.row);
    expect(onBox.box).toEqual(onLabel.box);
  });
});
