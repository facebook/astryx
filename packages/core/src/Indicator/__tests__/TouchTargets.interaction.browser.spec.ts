// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TouchTargets.interaction.browser.spec.ts
 * @input The built CheckboxInput, RadioList, CheckboxList, Markdown,
 *   TableSelection and MultiSelector stories, real touch input (Chromium CDP /
 *   WebKit's tap) and the interaction harness
 * @output Proofs that on a touch screen a checkbox, a radio option and a
 *   CheckboxList row are as easy to hit as an iOS control without growing
 *   (spec:AST-094 FR42, List FR10): their boxes match a mouse page's, each
 *   offers an invisible hit area (the theme's `--size-touch-target`, 44 px by
 *   default) that stops at half the gap to a neighbour, the point just
 *   outside a control's box belongs to it and a tap there picks it, a
 *   theme's larger value reaches further, a composer's rows (a Markdown task
 *   list, a table's selection column, a MultiSelector option) keep their
 *   pitch, and a mouse gets no hit area
 * @position Real-engine layer of the touch hit areas on CheckboxInput,
 *   RadioListItem and ListItem (utils/touchHitArea.ts); the stylesheet layer
 *   is Indicator/touchTarget.test.tsx
 */

import {
  expect,
  test,
  type Browser,
  type Page,
  type TestInfo,
} from '@playwright/test';
import {
  openStory,
  touchDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** The theme's default touch target (`--size-touch-target`), CSS px. */
const SIZE = 44;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function checkboxGeometry(page: Page) {
  return page
    .getByRole('checkbox')
    .first()
    .evaluate(input => {
      const rect = (el: Element) => {
        const r = el.getBoundingClientRect();
        return {x: r.x, y: r.y, width: r.width, height: r.height};
      };
      const box = input
        .closest('[data-astryx-pressable]')
        ?.querySelector('.astryx-checkbox-indicator');
      const row = input.closest('[data-astryx-pressable]');
      if (box == null || row == null) {
        throw new Error('no checkbox box or row');
      }
      return {input: rect(input), box: rect(box), row: rect(row)};
    });
}

async function radioRows(page: Page): Promise<Rect[]> {
  return page.getByRole('radio').evaluateAll(inputs =>
    inputs.map(input => {
      const row = input.closest('.astryx-item');
      if (row == null) {
        throw new Error('no radio row');
      }
      const r = row.getBoundingClientRect();
      return {x: r.x, y: r.y, width: r.width, height: r.height};
    }),
  );
}

const centre = (r: Rect) => ({x: r.x + r.width / 2, y: r.y + r.height / 2});

/** A hit area's insets on an element, px, as `watchHitArea` writes them. */
async function hitInsets(page: Page, selector: string, index = 0) {
  return page
    .locator(selector)
    .nth(index)
    .evaluate(el => {
      const style = getComputedStyle(el);
      const read = (side: string) =>
        parseFloat(style.getPropertyValue(`--astryx-hit-inset-${side}`)) || 0;
      return {
        top: read('top'),
        right: read('right'),
        bottom: read('bottom'),
        left: read('left'),
      };
    });
}

/** The insets once the hit area's first measurement has landed. */
async function measuredInsets(page: Page, selector: string, index = 0) {
  await expect
    .poll(async () => {
      const insets = await hitInsets(page, selector, index);
      return insets.top + insets.right + insets.bottom + insets.left;
    })
    .toBeGreaterThan(0);
  return hitInsets(page, selector, index);
}

/** Whether the element under a point is inside `selector`'s nth match. */
async function ownsPoint(
  page: Page,
  selector: string,
  index: number,
  point: {x: number; y: number},
) {
  return page.evaluate(
    ({css, n, x, y}) => {
      const host = document.querySelectorAll(css)[n];
      const hit = document.elementFromPoint(x, y);
      return host != null && hit != null && host.contains(hit);
    },
    {css: selector, n: index, ...point},
  );
}

/** The same story with a mouse: the phone's viewport and scale, a fine pointer. */
async function withMouse<T>(
  browser: Browser,
  testInfo: TestInfo,
  run: (mousePage: Page) => Promise<T>,
): Promise<T> {
  const {viewport, deviceScaleFactor} = testInfo.project.use;
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor,
    hasTouch: false,
    isMobile: false,
  });
  try {
    return await run(await context.newPage());
  } finally {
    await context.close();
  }
}

/**
 * Measures with the hit layer on every `selector` match taken away, then
 * gives it back: the same page, so the same text and scale.
 */
async function withoutLayer<T>(
  page: Page,
  selector: string,
  measure: () => Promise<T>,
): Promise<T> {
  const style = await page.addStyleTag({
    content: `${selector}::after { display: none !important; }`,
  });
  try {
    return await measure();
  } finally {
    await style.evaluate(async el => {
      (el as Element).remove();
    });
  }
}

/** A theme that sets the touch target size, in place before the story renders. */
async function themeTouchTarget(page: Page, size: string): Promise<void> {
  // Storybook rewrites the root element's style attribute, so a stylesheet.
  await page.addInitScript(value => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = `:root { --size-touch-target: ${value}; }`;
      document.head.append(style);
    });
  }, size);
}

/** The rows of the story's CheckboxList, as boxes. */
async function checkboxListRows(page: Page): Promise<Rect[]> {
  return page.locator(LIST_ROW).evaluateAll(rows =>
    rows.map(row => {
      const r = row.getBoundingClientRect();
      return {x: r.x, y: r.y, width: r.width, height: r.height};
    }),
  );
}

const CHECKBOX_ROW = '#storybook-root [data-astryx-pressable]';
const RADIO_ROW = '#storybook-root .astryx-item';
const LIST_ROW = '#storybook-root li:has(input[type="checkbox"])';

test.describe('selection controls under a finger', () => {
  test('a labelled checkbox keeps its size under a finger, and a tap just outside its box toggles it (FR42)', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-checkboxinput--default');
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--size-touch-target')
          .trim(),
      ),
    ).toBe(`${SIZE}px`);
    const insets = await measuredInsets(page, CHECKBOX_ROW);
    const finger = await checkboxGeometry(page);
    // The layer adds no layout: the same boxes without it.
    expect(finger).toEqual(
      await withoutLayer(page, CHECKBOX_ROW, async () =>
        checkboxGeometry(page),
      ),
    );
    // The input keeps its drawn size, centred on the box, as the RTL audit's
    // coarse-hit check (D7) holds in both directions.
    expect(finger.input.width).toBeLessThanOrEqual(24.5);
    expect(
      Math.abs(centre(finger.input).x - centre(finger.box).x),
    ).toBeLessThanOrEqual(1);
    // The target reaches the touch target through the invisible hit area.
    expect(
      finger.row.height + insets.top + insets.bottom,
    ).toBeGreaterThanOrEqual(SIZE - 0.5);
    const point = {
      x: Math.round(centre(finger.box).x),
      y: Math.floor(finger.row.y - insets.top / 2),
    };
    expect(point.y).toBeLessThan(finger.row.y);
    expect(await ownsPoint(page, CHECKBOX_ROW, 0, point)).toBe(true);
    const checkbox = page.getByRole('checkbox').first();
    const before = await checkbox.isChecked();
    const driver = await touchDriver(page);
    await driver.tap(point);
    await expect(checkbox).toBeChecked({checked: !before});
  });

  test('RadioList rows keep their geometry under a finger, and a tap in a row’s half of the gap selects it (FR42)', async ({
    page,
  }) => {
    for (const orientation of ['vertical', 'horizontal']) {
      await openStory(page, storybook(), 'core-radiolist--default', {
        orientation,
      });
      await measuredInsets(page, RADIO_ROW);
      const finger = await radioRows(page);
      expect(finger.length).toBeGreaterThan(1);
      expect(finger).toEqual(
        await withoutLayer(page, RADIO_ROW, async () => radioRows(page)),
      );
    }
    await openStory(page, storybook(), 'core-radiolist--default');
    const [first, second] = await radioRows(page);
    const gap = second.y - (first.y + first.height);
    expect(gap).toBeGreaterThan(0);
    const insets = await measuredInsets(page, RADIO_ROW, 1);
    // The two areas meet in the middle of the gap and never overlap.
    expect(insets.top).toBeGreaterThan(0);
    expect(insets.top).toBeLessThanOrEqual(gap / 2 + 0.5);
    const point = {
      x: Math.round(second.x + second.width / 2),
      y: Math.floor(second.y - insets.top / 2),
    };
    expect(await ownsPoint(page, RADIO_ROW, 1, point)).toBe(true);
    // The other half of the gap belongs to the first row.
    expect(
      await ownsPoint(page, RADIO_ROW, 0, {
        x: point.x,
        y: Math.ceil(first.y + first.height + 0.5),
      }),
    ).toBe(true);
    const driver = await touchDriver(page);
    await driver.tap(point);
    await expect(page.getByRole('radio').nth(1)).toBeChecked();
  });

  test('a CheckboxList’s rows keep their geometry under a finger at every density (List FR10)', async ({
    page,
  }) => {
    for (const density of ['compact', 'balanced', 'spacious']) {
      await openStory(page, storybook(), 'core-checkboxlist--default', {
        density,
      });
      const finger = await checkboxListRows(page);
      expect(finger.length).toBeGreaterThan(1);
      expect(finger).toEqual(
        await withoutLayer(page, LIST_ROW, async () => checkboxListRows(page)),
      );
    }
  });

  test('a tap just outside a compact CheckboxList row toggles that row (List FR10’s hit area)', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-checkboxlist--default', {
      density: 'compact',
    });
    const [first] = await checkboxListRows(page);
    const insets = await measuredInsets(page, LIST_ROW, 0);
    expect(first.height + insets.top + insets.bottom).toBeGreaterThan(
      first.height,
    );
    const point = {
      x: Math.round(first.x + first.width / 2),
      y: Math.floor(first.y - Math.max(insets.top, 1) / 2),
    };
    expect(await ownsPoint(page, LIST_ROW, 0, point)).toBe(true);
    const checkbox = page.getByRole('checkbox').first();
    const before = await checkbox.isChecked();
    const driver = await touchDriver(page);
    await driver.tap(point);
    await expect(checkbox).toBeChecked({checked: !before});
  });

  // A label-hidden checkbox is a marker in a composer's row: the composer
  // keeps its row pitch and the marker its 24 px target, so a taller target
  // never reaches into the next row. Each case measures the composer's own
  // rows (a Markdown task list's items, a table's rows), and a theme's touch
  // target size must not reach them either.
  for (const [what, story, scope, rowSelector] of [
    ['a Markdown task list', 'core-markdown--default', '', 'li'],
    [
      'a compact table with a selection column',
      'core-tableselection--compact',
      // The body rows, not the header's select-all row.
      'tbody ',
      'tr',
    ],
  ] as const) {
    test(`${what} keeps its row pitch under a finger`, async ({page}) => {
      await openStory(page, storybook(), story);
      const read = async () =>
        page
          .locator(`#storybook-root ${scope}input[type="checkbox"]`)
          .first()
          .evaluate((input, selector) => {
            const first = input.closest(selector);
            const rows = first?.parentElement
              ? [...first.parentElement.children].filter(row =>
                  row.matches(selector),
                )
              : [];
            const r = input.getBoundingClientRect();
            return {
              input: {width: r.width, height: r.height},
              rows: rows.map(row => {
                const style = getComputedStyle(row);
                const box = row.getBoundingClientRect();
                return {
                  y: box.y,
                  height: box.height,
                  padding:
                    parseFloat(style.paddingTop) +
                    parseFloat(style.paddingBottom),
                  line: parseFloat(style.lineHeight),
                };
              }),
            };
          }, rowSelector);
      const today = await read();
      expect(today.rows.length).toBeGreaterThan(1);
      if (rowSelector === 'li') {
        // Each task item is its text's lines plus its padding: no touch
        // floor, so the pitch is the one `main` has under a finger (a
        // table's rows keep the height the table gives them).
        for (const row of today.rows) {
          expect(row.height).toBeLessThan(SIZE);
          const lines = (row.height - row.padding) / row.line;
          expect(lines).toBeGreaterThanOrEqual(0.95);
          expect(Math.abs(lines - Math.round(lines))).toBeLessThan(0.05);
        }
      }
      expect(today.input.width).toBeLessThanOrEqual(24.5);
      expect(today.input.height).toBeLessThanOrEqual(24.5);
      // A theme's touch target size leaves the composer's rows alone.
      await page.evaluate(() =>
        document.documentElement.style.setProperty(
          '--size-touch-target',
          '60px',
        ),
      );
      const tuned = await read();
      expect(tuned.rows.map(row => row.y)).toEqual(
        today.rows.map(row => row.y),
      );
    });
  }

  test('a MultiSelector option keeps its height under a finger', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-multiselector--default');
    await page.getByRole('combobox').first().tap();
    const option = page.getByRole('option').first();
    await option.waitFor();
    const marker = await option.evaluate(el => {
      const input = el.querySelector('input[type="checkbox"]');
      if (input == null) {
        throw new Error('no checkbox in the option');
      }
      const r = input.getBoundingClientRect();
      return {
        option: el.getBoundingClientRect().height,
        input: {width: r.width, height: r.height},
      };
    });
    expect(marker.option).toBeLessThan(SIZE);
    expect(marker.input.width).toBeLessThanOrEqual(24.5);
    expect(marker.input.height).toBeLessThanOrEqual(24.5);
  });

  test('a theme’s touch target size changes how far the hit area reaches', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-checkboxinput--default');
    const today = await measuredInsets(page, CHECKBOX_ROW);
    // A theme's value, in place before the control mounts and measures.
    await themeTouchTarget(page, '60px');
    await openStory(page, storybook(), 'core-checkboxinput--default');
    const tuned = await measuredInsets(page, CHECKBOX_ROW);
    expect(tuned.top).toBeGreaterThan(today.top);
    expect(tuned.bottom).toBeGreaterThan(today.bottom);
  });

  test('a mouse gets no hit area and keeps the drawn sizes (negative control)', async ({
    browser,
  }, testInfo) => {
    await withMouse(browser, testInfo, async mousePage => {
      await openStory(mousePage, storybook(), 'core-checkboxinput--default');
      expect(
        await mousePage.evaluate(() => matchMedia('(pointer: coarse)').matches),
      ).toBe(false);
      const {input, box, row} = await checkboxGeometry(mousePage);
      expect(input.width).toBeCloseTo(box.width, 0);
      expect(row.height).toBeLessThan(SIZE);
      await mousePage.waitForTimeout(100);
      expect(await hitInsets(mousePage, CHECKBOX_ROW)).toEqual({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });
      expect(
        await mousePage
          .locator(CHECKBOX_ROW)
          .first()
          .evaluate(el => getComputedStyle(el, '::after').content),
      ).toMatch(/^(none|normal)$/);
    });
  });
});
