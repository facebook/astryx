// Copyright (c) Meta Platforms, Inc. and affiliates.
// @pr-a11y scope ^packages/core/src/Table/ ^packages/core/src/motion/ ^apps/storybook/stories/TableRowExpansion

/**
 * @file TableRowGlide.a11y.browser.spec.ts
 * @input Built TableRowExpansion stories in real Chromium and WebKit
 * @output Browser evidence for the row-expansion glide (component:Table FR14,
 *   FR15): with an `animatedLayout` handle the rows after a detail panel
 *   glide and each divider moves with its row, pinned cells included, the
 *   columns keep their widths, and an open panel draws its divider; without
 *   a handle the rows change at once
 * @position Regression proof for useTableRowExpansion's animatedLayout
 *   adoption and glidingDivider.ts
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

async function mount(page: Page, story: string, args = '') {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-tablerowexpansion--${story}&viewMode=story${args}`,
  );
  await expect(page.locator('[data-expansion-toggle]').first()).toBeVisible();
}

/**
 * Toggles a row and holds every animation `ms` into its run, so the frame
 * can be read.
 */
async function toggleAndHold(page: Page, index: number, ms: number) {
  return page.evaluate(
    async ({index, ms}) => {
      (
        document.querySelectorAll('[data-expansion-toggle]')[index] as
          HTMLElement | undefined
      )?.click();
      await new Promise(resolve => requestAnimationFrame(resolve));
      const rows = document
        .getAnimations()
        .filter(
          animation =>
            (animation.effect as KeyframeEffect | null)?.target?.nodeName ===
            'TR',
        );
      for (const animation of document.getAnimations()) {
        animation.pause();
        animation.currentTime = ms;
      }
      return rows.length;
    },
    {index, ms},
  );
}

/** The darkest pixel within 3 px of `y` at `x`. */
async function darkestNear(page: Page, x: number, y: number) {
  const shot = await page.screenshot({
    clip: {x, y: y - 3, width: 1, height: 7},
    scale: 'css',
  });
  return page.evaluate(async b64 => {
    const image = new Image();
    image.src = `data:image/png;base64,${b64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (context == null) {
      return 255;
    }
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, image.width, image.height).data;
    let darkest = 255;
    for (let i = 0; i < data.length; i += 4) {
      darkest = Math.min(darkest, data[i], data[i + 1], data[i + 2]);
    }
    return darkest;
  }, shot.toString('base64'));
}

/** Where a body row's divider is now, under its pinned and an unpinned cell. */
async function rowBottom(page: Page, index: number) {
  return page.evaluate(i => {
    const row = document.querySelectorAll(
      '.astryx-table-scroll-wrapper tbody tr',
    )[i] as HTMLElement;
    const pinned = row.children[0].getBoundingClientRect();
    const last = row.children[row.children.length - 1].getBoundingClientRect();
    return {
      y: Math.round(pinned.bottom),
      pinnedX: Math.round(pinned.left + pinned.width / 2),
      unpinnedX: Math.round((pinned.right + last.right) / 2),
    };
  }, index);
}

const columnWidths = async (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('thead th')]
      .map(th => Math.round(th.getBoundingClientRect().width))
      .join('/'),
  );

test('without a handle the rows change at once', async ({page}) => {
  await mount(page, 'gliding-rows-long-table', '&args=glide:!false');
  expect(await toggleAndHold(page, 1, 90)).toBe(0);
});

test('mid-glide each divider moves with its row, pinned cells included', async ({
  page,
}) => {
  await mount(page, 'gliding-rows');
  for (const [action, row] of [
    ['opening', 2],
    ['closing', 1],
  ] as const) {
    expect(await toggleAndHold(page, 0, 90), action).toBeGreaterThan(0);
    // The row after the panel, where it shows now (its glide included).
    // Between two device pixels a 1 px line is antialiased, and a pinned
    // (composited) cell can draw it fainter, so this asks for a line, not
    // its full colour: a divider left behind leaves nothing here (255).
    const {y, pinnedX, unpinnedX} = await rowBottom(page, row);
    expect(
      await darkestNear(page, pinnedX, y),
      `${action}, pinned`,
    ).toBeLessThan(254);
    expect(
      await darkestNear(page, unpinnedX, y),
      `${action}, unpinned`,
    ).toBeLessThan(254);
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) {
        animation.finish();
      }
    });
    await page.waitForTimeout(100);
  }
});

test('the columns keep their widths through a glide', async ({page}) => {
  await mount(page, 'gliding-rows');
  // A table its columns do not fill, so they share the spare width.
  await page.evaluate(() => {
    let box = document.querySelector<HTMLElement>(
      '.astryx-table-scroll-wrapper',
    );
    for (let i = 0; i < 6 && box != null; i++, box = box.parentElement) {
      box.style.maxWidth = 'none';
    }
    const table = document.querySelector('table');
    if (table != null) {
      table.style.width = '1200px';
    }
  });
  const before = await columnWidths(page);
  expect(await toggleAndHold(page, 0, 90)).toBeGreaterThan(0);
  expect(await columnWidths(page)).toBe(before);
});

test('an open panel draws the divider its row hands down', async ({page}) => {
  await mount(page, 'gliding-rows');
  await page.locator('[data-expansion-toggle]').first().click();
  await page.waitForTimeout(800);
  const {y, unpinnedX} = await page.evaluate(() => {
    const panel = document
      .querySelector('tr[data-expansion-panel]')
      ?.getBoundingClientRect();
    return {
      y: Math.round(panel?.bottom ?? 0),
      unpinnedX: Math.round(((panel?.left ?? 0) + (panel?.right ?? 0)) / 2),
    };
  });
  expect(await darkestNear(page, unpinnedX, y)).toBeLessThan(245);
});
