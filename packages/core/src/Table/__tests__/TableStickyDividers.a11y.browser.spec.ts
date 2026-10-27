// Copyright (c) Meta Platforms, Inc. and affiliates.
// @pr-a11y scope ^packages/core/src/Table/ ^apps/storybook/stories/TableStickyColumns

/**
 * @file TableStickyDividers.a11y.browser.spec.ts
 * @input Built TableStickyColumns stories in real Chromium and WebKit
 * @output Browser evidence that a pinned column draws each row's divider
 *   itself: the line under it moves with it, matches the row's own divider,
 *   and carries a theme's divider color and an app's row border
 * @position Regression proof for the sticky-columns plugin's pinned dividers
 *
 * With collapsed borders the table paints every border at its cell's static
 * place. A sticky cell moves and its border does not, so the line under a
 * pinned column used to be whichever scrolled cell's border passed beneath it,
 * and was missing where that cell had none.
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

async function mount(page: Page, story: string) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-tablestickycolumns--${story}&viewMode=story`,
  );
  const wrapper = page.locator('.astryx-table-scroll-wrapper').first();
  await expect(wrapper).toBeVisible();
  return wrapper;
}

async function scrollTo(page: Page, left: number) {
  await page.evaluate(x => {
    const wrapper = document.querySelector(
      '.astryx-table-scroll-wrapper',
    ) as HTMLElement;
    wrapper.scrollLeft = x;
  }, left);
  // Two frames: the scroll lands and paints.
  await page.evaluate(
    async () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

type Rgb = [number, number, number];

/**
 * The column of pixels within 3 px of a body row's bottom edge, top to
 * bottom, at an x inside the pinned cell and at an x inside the first
 * unpinned cell visible past it.
 */
async function dividerPixels(
  page: Page,
  row: number,
): Promise<{pinned: Rgb[]; unpinned: Rgb[]}> {
  const points = await page.evaluate(index => {
    const rows = document.querySelectorAll(
      '.astryx-table-scroll-wrapper tbody tr',
    );
    const tr = rows[index] as HTMLElement;
    const pinned = tr.children[0].getBoundingClientRect();
    return {
      y: Math.round(pinned.bottom),
      pinnedX: Math.round(pinned.left + pinned.width / 2),
      unpinnedX: Math.round(pinned.right + 40),
    };
  }, row);
  const sample = async (x: number): Promise<Rgb[]> => {
    const shot = await page.screenshot({
      clip: {x, y: points.y - 3, width: 1, height: 6},
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
        return [];
      }
      context.drawImage(image, 0, 0);
      const data = context.getImageData(0, 0, image.width, image.height).data;
      const column: [number, number, number][] = [];
      for (let i = 0; i < data.length; i += 4) {
        column.push([data[i], data[i + 1], data[i + 2]]);
      }
      return column;
    }, shot.toString('base64'));
  };
  return {
    pinned: await sample(points.pinnedX),
    unpinned: await sample(points.unpinnedX),
  };
}

const near = (a: Rgb, b: Rgb, tolerance = 6) =>
  a.every((channel, i) => Math.abs(channel - b[i]) <= tolerance);
/** Every pixel of one column matches the other's, top to bottom. */
const sameColumn = (a: Rgb[], b: Rgb[], tolerance = 6) =>
  a.length === b.length && a.every((rgb, i) => near(rgb, b[i], tolerance));
/** The darkest pixel of a column: the divider's own color. */
const darkest = (column: Rgb[]): Rgb =>
  column.reduce((best, rgb) =>
    rgb[0] + rgb[1] + rgb[2] < best[0] + best[1] + best[2] ? rgb : best,
  );

test('the divider under a pinned cell matches its row, at rest and scrolled', async ({
  page,
}) => {
  await mount(page, 'pin-start');
  for (const left of [0, 150]) {
    await scrollTo(page, left);
    for (const row of [0, 1, 2]) {
      const {pinned, unpinned} = await dividerPixels(page, row);
      expect(sameColumn(pinned, unpinned), `row ${row} at ${left}px`).toBe(
        true,
      );
      expect(
        darkest(pinned)[0],
        `row ${row} at ${left}px is drawn`,
      ).toBeLessThan(250);
    }
  }
});

test('a pinned cell keeps its divider where the cell scrolled beneath it has none', async ({
  page,
}) => {
  await mount(page, 'pin-start');
  await scrollTo(page, 150);
  const before = await dividerPixels(page, 1);
  await page.evaluate(() => {
    const row = document.querySelectorAll(
      '.astryx-table-scroll-wrapper tbody tr',
    )[1];
    const pinned = row.children[0].getBoundingClientRect();
    for (const cell of Array.from(row.children).slice(1)) {
      const rect = cell.getBoundingClientRect();
      if (rect.left <= pinned.right && rect.right >= pinned.left) {
        (cell as HTMLElement).style.borderBottomColor = 'transparent';
      }
    }
  });
  const after = await dividerPixels(page, 1);
  expect(sameColumn(after.pinned, before.pinned)).toBe(true);
});

test("a theme's divider color and an app's row border carry over to the pinned cells", async ({
  page,
}) => {
  await mount(page, 'pinned-dividers');
  for (const left of [0, 150]) {
    await scrollTo(page, left);
    // Row 1: the theme's blue divider, under the pinned cell as elsewhere.
    const themed = await dividerPixels(page, 0);
    expect(
      sameColumn(themed.pinned, themed.unpinned, 24),
      `themed at ${left}px`,
    ).toBe(true);
    const blue = darkest(themed.pinned);
    expect(blue[2], `themed at ${left}px is blue`).toBeGreaterThan(
      blue[0] + 60,
    );
    // Row 2: the app's red row border wins the collapse; the pinned cell
    // draws it too.
    // Every pixel of the column: a pinned line of the theme's blue over the
    // app's red (the row's border not carried) fails here.
    const app = await dividerPixels(page, 1);
    expect(sameColumn(app.pinned, app.unpinned, 24), `app at ${left}px`).toBe(
      true,
    );
    const red = darkest(app.pinned);
    expect(red[0], `app at ${left}px is red`).toBeGreaterThan(red[2] + 60);
  }
});
