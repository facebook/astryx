// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BadgeLargerText.a11y.chromium.spec.ts
 * @input The `Core/Badge` Larger Text story in a built Storybook, in Chromium.
 * @output Real-layout proof that a badge is never shorter than one line of its
 *   own text: at the default size it keeps the theme's height exactly, and
 *   when its text grows (here by raising the supporting text size on a
 *   wrapper, as a theme following the reader's iOS text size does) the pill
 *   grows with the label and still contains it.
 * @position Run with `pnpm test:a11y-contract`. Line boxes and box heights
 *   need a real layout engine; jsdom has neither.
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

test.describe('a badge and its text', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      `${storybook.origin}/iframe.html?id=core-badge--larger-text&viewMode=story`,
    );
    await expect(page.getByTestId('badge-row-default')).toBeVisible();
  });

  test('keeps the theme height at the default text size', async ({page}) => {
    const spacing5 = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.height = 'var(--spacing-5)';
      document.body.append(probe);
      const height = probe.getBoundingClientRect().height;
      probe.remove();
      return height;
    });
    for (const badge of await badgesIn(page, 'default')) {
      expect(badge.height, badge.label).toBeCloseTo(spacing5, 1);
    }
  });

  for (const size of ['1.25rem', '2.5rem']) {
    test(`grows with its label at ${size} text and still contains it`, async ({
      page,
    }) => {
      for (const badge of await badgesIn(page, size)) {
        // At least one line of its own text tall …
        expect(badge.height, badge.label).toBeGreaterThanOrEqual(
          badge.lineHeight - 0.5,
        );
        // … so the label stays inside the pill.
        expect(badge.labelTop, badge.label).toBeGreaterThanOrEqual(
          badge.top - 0.5,
        );
        expect(badge.labelBottom, badge.label).toBeLessThanOrEqual(
          badge.bottom + 0.5,
        );
      }
    });
  }
});
