// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TouchTargets.interaction.browser.spec.ts
 * @input The built CheckboxInput and RadioList Default stories, real touch
 *   input (Chromium CDP / WebKit's tap) and the interaction harness
 * @output Proofs that on a touch screen a checkbox and a radio option are as
 *   easy to hit as an iOS control (44 pt, `list.metrics.controlSize`): the
 *   checkbox's input is at least 44 × 44 px and centred on its box, its row at
 *   least 44 px; each radio row is at least 44 px and the rows touch; a tap
 *   at the edge of those targets picks the option; a mouse keeps the drawn
 *   sizes (the control)
 * @position Real-engine layer of Indicator/touchTarget.stylex.ts; the
 *   stylesheet layer is Indicator/touchTarget.test.tsx
 */

import {expect, test, type Page} from '@playwright/test';
import {
  openStory,
  touchDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';
import {list} from '../../motion/uikit/list';

const storybook = withStorybook(test);

const SIZE = list.metrics.controlSize;

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
    const {input, box, row} = await checkboxGeometry(page);
    expect(input.width).toBeGreaterThanOrEqual(SIZE);
    expect(input.height).toBeGreaterThanOrEqual(SIZE);
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
