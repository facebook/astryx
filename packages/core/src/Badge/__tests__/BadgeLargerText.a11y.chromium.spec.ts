// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BadgeLargerText.a11y.chromium.spec.ts
 * @input The `Core/Badge` Larger Text story in a built Storybook, in Chromium,
 *   under the neutral theme and under Butter (whose badges set their own
 *   height).
 * @output Real-layout proof that a badge is never shorter than one line of its
 *   own text and never narrower than it is tall: at the default size its
 *   geometry is exactly what it was before those two minimums (the theme's
 *   height, Butter's own 30px included), and when its text grows (here by
 *   raising the supporting text size on a wrapper, as a theme following the
 *   reader's iOS text size does) the pill grows with the label, still contains
 *   it, and a one-character count stays a circle.
 * @position Run with `pnpm test:a11y-contract`. Line boxes and box sizes need
 *   a real layout engine; jsdom has neither.
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
test.afterAll(async () => {
  await storybook?.close();
});

interface BadgeBox {
  label: string;
  width: number;
  height: number;
  lineHeight: number;
  labelTop: number;
  labelBottom: number;
  top: number;
  bottom: number;
}

async function badgesIn(page: Page, size: string): Promise<BadgeBox[]> {
  return page.getByTestId(`badge-row-${size}`).evaluate(row =>
    [...row.querySelectorAll<HTMLElement>('.astryx-badge')].map(badge => {
      const box = badge.getBoundingClientRect();
      const label = badge.lastElementChild as HTMLElement;
      const labelBox = label.getBoundingClientRect();
      return {
        label: label.textContent ?? '',
        width: box.width,
        height: box.height,
        lineHeight: Number.parseFloat(getComputedStyle(badge).lineHeight),
        labelTop: labelBox.top,
        labelBottom: labelBox.bottom,
        top: box.top,
        bottom: box.bottom,
      };
    }),
  );
}

/**
 * Each badge's size in the row, with and without the two minimums this
 * change adds: the "without" pass sets them back to what they were before
 * (`min-height` unset, `min-width: 0`) on the element itself.
 */
async function withAndWithoutMinimums(page: Page, size: string) {
  return page.getByTestId(`badge-row-${size}`).evaluate(row =>
    [...row.querySelectorAll<HTMLElement>('.astryx-badge')].map(badge => {
      const measure = () => {
        const box = badge.getBoundingClientRect();
        return {width: box.width, height: box.height};
      };
      const withMinimums = measure();
      badge.style.minHeight = 'auto';
      badge.style.minWidth = '0px';
      const without = measure();
      badge.style.removeProperty('min-height');
      badge.style.removeProperty('min-width');
      return {label: badge.textContent ?? '', withMinimums, without};
    }),
  );
}

/** The neutral theme's badge height: its `--spacing-5`. */
async function spacing5(page: Page): Promise<number> {
  return page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.height = 'var(--spacing-5)';
    document.body.append(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return height;
  });
}

const THEMES = [
  {name: 'neutral', badgeHeight: spacing5},
  // Butter's own badge height (themes/butter/src/butterTheme.ts,
  // `components.badge.base.height`).
  {name: 'butter', badgeHeight: async () => 30},
];

for (const {name, badgeHeight} of THEMES) {
  test.describe(`a badge and its text, ${name} theme`, () => {
    test.beforeEach(async ({page}) => {
      await page.goto(
        `${storybook.origin}/iframe.html?id=core-badge--larger-text&viewMode=story&globals=astryxTheme:${name}`,
      );
      await expect(page.getByTestId('badge-row-default')).toBeVisible();
    });

    test('keeps its exact geometry and the theme height at the default text size', async ({
      page,
    }) => {
      const height = await badgeHeight(page);
      for (const badge of await withAndWithoutMinimums(page, 'default')) {
        // The new minimums do not bind at the default size …
        expect(badge.withMinimums.width, badge.label).toBeCloseTo(
          badge.without.width,
          2,
        );
        expect(badge.withMinimums.height, badge.label).toBeCloseTo(
          badge.without.height,
          2,
        );
        // … so the badge is as tall as its theme says.
        expect(badge.withMinimums.height, badge.label).toBeCloseTo(height, 1);
      }
    });

    for (const size of ['1.25rem', '2.5rem']) {
      test(`grows with its label at ${size} text, contains it, and a count stays a circle`, async ({
        page,
      }) => {
        const badges = await badgesIn(page, size);
        for (const badge of badges) {
          // At least one line of its own text tall …
          expect(badge.height, badge.label).toBeGreaterThanOrEqual(
            badge.lineHeight - 0.5,
          );
          // … so the label stays inside the pill …
          expect(badge.labelTop, badge.label).toBeGreaterThanOrEqual(
            badge.top - 0.5,
          );
          expect(badge.labelBottom, badge.label).toBeLessThanOrEqual(
            badge.bottom + 0.5,
          );
          // … and never narrower than it is tall.
          expect(badge.width, badge.label).toBeGreaterThanOrEqual(
            badge.height - 0.5,
          );
        }
        // The one-character count is widened to its height and no further: a
        // circle where its padding and digit are narrower than the line (it
        // was a tall capsule before), its own width where they are wider.
        const count = (await withAndWithoutMinimums(page, size)).find(
          badge => badge.label === '3',
        );
        expect(count).toBeDefined();
        if (count) {
          expect(count.withMinimums.width).toBeCloseTo(
            Math.max(count.withMinimums.height, count.without.width),
            1,
          );
        }
      });
    }
  });
}
