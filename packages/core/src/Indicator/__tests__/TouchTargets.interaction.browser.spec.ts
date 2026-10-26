// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TouchTargets.interaction.browser.spec.ts
 * @input The built CheckboxInput and RadioList Default stories, real touch
 *   input (Chromium CDP / WebKit's tap) and the interaction harness
 * @output Proofs that on a touch screen a checkbox and a radio option are as
 *   easy to hit as an iOS control (the theme's `--size-touch-target`, 44 pt
 *   by default, Apple's control size): the checkbox's input is at least
 *   44 × 44 px and centred on its box, its row at least 44 px; a
 *   CheckboxList's rows that toggle are at least 44 px in every density
 *   (balanced ones keep 52 px and take a larger theme target); each radio row
 *   is at least 44 px and the rows touch; a tap at the edge of those targets
 *   picks the option; a theme's value tunes every target, and 24px keeps
 *   the old touch layout; a list whose gap already gives each option 44 px
 *   keeps its spacing; a composer's rows (a
 *   Markdown task list, a table's selection column, a MultiSelector option)
 *   keep their pitch; a mouse keeps the drawn sizes (the control)
 * @position Real-engine layer of Indicator/touchTarget.stylex.ts; the
 *   stylesheet layer is Indicator/touchTarget.test.tsx
 */

import {expect, test, type Page} from '@playwright/test';
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

test.describe('selection controls under a finger', () => {
  test('a checkbox’s target is at least 44 × 44 px, centred on its box, in a row at least 44 px tall', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-checkboxinput--default');
    // The page resolves the token to its default.
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--size-touch-target')
          .trim(),
      ),
    ).toBe(`${SIZE}px`);
    const {input, box, row} = await checkboxGeometry(page);
    expect(input.width).toBeGreaterThanOrEqual(SIZE);
    expect(input.height).toBeGreaterThanOrEqual(SIZE);
    // Centred on the box, as the RTL audit's coarse-hit check (D7) holds in
    // both directions: on the box's inline-start side the target reaches
    // 10 px past the row (the decision's requirement 5, noted).
    expect(Math.abs(centre(input).x - centre(box).x)).toBeLessThanOrEqual(1);
    expect(Math.abs(centre(input).y - centre(box).y)).toBeLessThanOrEqual(1);
    expect(row.height).toBeGreaterThanOrEqual(SIZE);
    // A finger 9 px above the 24 px box still lands on the checkbox.
    const driver = await touchDriver(page);
    await driver.tap({x: Math.round(centre(box).x), y: Math.round(box.y - 9)});
    await expect(page.getByRole('checkbox').first()).toBeChecked();
  });

  test('each radio row is at least 44 px tall and the rows touch', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-radiolist--default');
    const rows = await radioRows(page);
    expect(rows.length).toBeGreaterThan(1);
    for (const row of rows) {
      expect(row.height).toBeGreaterThanOrEqual(SIZE);
    }
    for (let i = 1; i < rows.length; i++) {
      expect(
        Math.abs(rows[i].y - (rows[i - 1].y + rows[i - 1].height)),
      ).toBeLessThanOrEqual(0.5);
    }
    // A finger 3 px inside the top of the second row picks that option.
    const driver = await touchDriver(page);
    await driver.tap({
      x: Math.round(rows[1].x + rows[1].width / 2),
      y: Math.round(rows[1].y + 3),
    });
    await expect(page.getByRole('radio').nth(1)).toBeChecked();
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

  test('the theme’s touch target size tunes every target', async ({page}) => {
    // A dense theme lowers the metric; it is set here on the controls'
    // container, which every target inherits it from.
    await openStory(page, storybook(), 'core-checkboxinput--default');
    await page
      .getByRole('checkbox')
      .first()
      .evaluate(input =>
        input
          .closest('[data-astryx-pressable]')
          ?.parentElement?.style.setProperty('--size-touch-target', '36px'),
      );
    const checkbox = await checkboxGeometry(page);
    expect(checkbox.input.width).toBeCloseTo(36, 0);
    expect(checkbox.input.height).toBeCloseTo(36, 0);
    expect(checkbox.row.height).toBeCloseTo(36, 0);
    await openStory(page, storybook(), 'core-radiolist--default');
    await page
      .getByRole('radiogroup')
      .evaluate(group =>
        group.parentElement?.style.setProperty('--size-touch-target', '36px'),
      );
    for (const row of await radioRows(page)) {
      expect(row.height).toBeCloseTo(36, 0);
    }
  });

  test('a compact CheckboxList’s rows are at least the touch target under a finger, and a mouse keeps them compact', async ({
    page,
    browser,
  }) => {
    // A standalone CheckboxList is a touch target whatever its density
    // (requirement 2 of the target-size decision).
    const rowHeights = async (target: Page) =>
      target
        .locator('#storybook-root li')
        .evaluateAll(rows =>
          rows.map(row => row.getBoundingClientRect().height),
        );
    await openStory(page, storybook(), 'core-checkboxlist--default', {
      density: 'compact',
    });
    const finger = await rowHeights(page);
    expect(finger.length).toBeGreaterThan(1);
    for (const height of finger) {
      expect(height).toBeGreaterThanOrEqual(SIZE - 0.5);
    }
    const context = await browser.newContext({
      viewport: {width: 1024, height: 768},
      hasTouch: false,
      isMobile: false,
    });
    try {
      const mousePage = await context.newPage();
      await openStory(mousePage, storybook(), 'core-checkboxlist--default', {
        density: 'compact',
      });
      expect(
        await mousePage.evaluate(() => matchMedia('(pointer: coarse)').matches),
      ).toBe(false);
      for (const height of await rowHeights(mousePage)) {
        expect(height).toBeLessThan(SIZE);
      }
    } finally {
      await context.close();
    }
  });

  test('a balanced CheckboxList’s rows keep 52 px under a finger and take a larger theme touch target', async ({
    page,
  }) => {
    // Every density is a touch target (requirement 2); the size is the
    // theme's (requirement 4), and List's 52 px row holds at the default.
    const rowHeights = async () =>
      page
        .locator('#storybook-root li')
        .evaluateAll(rows =>
          rows.map(row => row.getBoundingClientRect().height),
        );
    await openStory(page, storybook(), 'core-checkboxlist--default');
    const atDefault = await rowHeights();
    expect(atDefault.length).toBeGreaterThan(1);
    for (const height of atDefault) {
      expect(height).toBeGreaterThanOrEqual(52 - 0.5);
    }
    await page
      .locator('#storybook-root ul')
      .first()
      .evaluate(list =>
        list.parentElement?.style.setProperty('--size-touch-target', '60px'),
      );
    for (const height of await rowHeights()) {
      expect(height).toBeGreaterThanOrEqual(60 - 0.5);
    }
  });

  test('a theme that sets the touch target to 24px keeps the old touch layout', async ({
    page,
  }) => {
    // The escape the changeset names (spec:AST-017 FR3): a labelled checkbox
    // is back to a 24 px row and target with its box at the row's top, and
    // a vertical RadioList keeps its 32 px pitch (24 px rows, 8 px gap).
    const applyOldSize = async () =>
      page.evaluate(() =>
        document.documentElement.style.setProperty(
          '--size-touch-target',
          '24px',
        ),
      );
    await openStory(page, storybook(), 'core-checkboxinput--default');
    await applyOldSize();
    const checkbox = await checkboxGeometry(page);
    expect(checkbox.input.width).toBeCloseTo(24, 0);
    expect(checkbox.input.height).toBeCloseTo(24, 0);
    expect(checkbox.row.height).toBeCloseTo(24, 0);
    await openStory(page, storybook(), 'core-radiolist--default');
    await applyOldSize();
    const centers = await page.getByRole('radio').evaluateAll(inputs =>
      inputs.map(input => {
        const circle = input.parentElement?.querySelector(
          '.astryx-radio-indicator',
        );
        if (circle == null) {
          throw new Error('no radio circle');
        }
        const r = circle.getBoundingClientRect();
        return r.y + r.height / 2;
      }),
    );
    expect(centers.length).toBeGreaterThan(2);
    for (let i = 1; i < centers.length; i++) {
      expect(centers[i] - centers[i - 1]).toBeCloseTo(32, 0);
    }
  });

  test('a list whose gap already gives each option 44 px keeps its spacing under a finger', async ({
    page,
    browser,
  }) => {
    // A theme with a wide gap: a 24 px option and a 24 px gap already make a
    // 48 px pitch. Under a finger each row takes half the gap above and below
    // as its target, so the options keep the spacing a mouse sees (the list
    // adds half a gap at each end, keeping its first and last targets inside
    // it).
    const circles = async (target: Page) => {
      await openStory(target, storybook(), 'core-radiolist--default');
      await target
        .getByRole('radiogroup')
        .evaluate(group =>
          group.parentElement?.style.setProperty('--spacing-2', '24px'),
        );
      return target.getByRole('radio').evaluateAll(inputs =>
        inputs.map(input => {
          const circle = input.parentElement?.querySelector(
            '.astryx-radio-indicator',
          );
          if (circle == null) {
            throw new Error('no radio circle');
          }
          const r = circle.getBoundingClientRect();
          return Math.round((r.y + r.height / 2) * 2) / 2;
        }),
      );
    };
    const context = await browser.newContext({
      viewport: page.viewportSize() ?? {width: 402, height: 874},
      hasTouch: false,
      isMobile: false,
    });
    try {
      const mousePage = await context.newPage();
      await openStory(mousePage, storybook(), 'core-radiolist--default');
      expect(
        await mousePage.evaluate(() => matchMedia('(pointer: coarse)').matches),
      ).toBe(false);
      const pitches = (ys: number[]) => ys.slice(1).map((y, i) => y - ys[i]);
      const mouse = await circles(mousePage);
      const finger = await circles(page);
      expect(mouse.length).toBeGreaterThan(2);
      expect(pitches(finger)).toEqual(pitches(mouse));
      const rows = await radioRows(page);
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i].height).toBeGreaterThanOrEqual(SIZE);
        expect(
          Math.abs(rows[i].y - (rows[i - 1].y + rows[i - 1].height)),
        ).toBeLessThanOrEqual(0.5);
      }
    } finally {
      await context.close();
    }
  });

  test('a mouse keeps the drawn sizes (negative control)', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: {width: 1024, height: 768},
      hasTouch: false,
      isMobile: false,
    });
    const page = await context.newPage();
    try {
      await openStory(page, storybook(), 'core-checkboxinput--default');
      // A fine-pointer case proves nothing under a coarse primary pointer.
      expect(
        await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
      ).toBe(false);
      const {input, box, row} = await checkboxGeometry(page);
      expect(input.width).toBeCloseTo(box.width, 0);
      expect(input.height).toBeCloseTo(box.height, 0);
      expect(row.height).toBeLessThan(SIZE);
      await openStory(page, storybook(), 'core-radiolist--default');
      const rows = await radioRows(page);
      expect(rows[0].height).toBeLessThan(SIZE);
      expect(rows[1].y - (rows[0].y + rows[0].height)).toBeGreaterThan(0);
    } finally {
      await context.close();
    }
  });
});
