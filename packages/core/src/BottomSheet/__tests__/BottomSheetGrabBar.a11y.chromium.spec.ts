// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetGrabBar.a11y.chromium.spec.ts
 * @input Built BottomSheet stories in a phone-sized Chromium
 * @output Browser evidence that the grab bar's fade ends above the first line
 *   of a sheet at the default padding, that its opaque part still backs the
 *   pill, and that the content still starts at the sheet's top edge, scrolls
 *   beneath the bar and keeps its height
 * @position Chromium proof for the floating grab bar's backdrop
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

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: {width: 390, height: 844},
});

type Reading = {
  barTop: number;
  barBottom: number;
  // Measured from the bar's top edge, as painted.
  opaqueEnd: number;
  fadeEnd: number;
  pillBottom: number;
  firstLineTop: number | null;
  contentTop: number;
  overflow: number;
};

async function open(page: Page, story: string) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-bottomsheet--${story}&viewMode=story`,
  );
  await page.locator('#storybook-root').waitFor();
  await page.waitForTimeout(500);
  // Most stories open the sheet from a trigger; a few start open.
  if ((await page.locator('dialog[open]').count()) === 0) {
    await page.locator('#storybook-root button').first().tap();
  }
  await expect(page.locator('dialog[open]')).toBeVisible();
  await page.waitForTimeout(800); // the entrance
}

// The grab bar, the first line of the caller's content, and the scrolling
// area's overflow, all read from the sheet as it is painted.
async function read(page: Page): Promise<Reading> {
  return page.evaluate(() => {
    const dialog = document.querySelector('dialog[open]');
    if (dialog == null) {
      throw new Error('no open sheet');
    }
    // The grab bar floats over the body: absolutely placed, hidden from
    // assistive technology, painting the surface as a fading band.
    const bar = Array.from(
      dialog.querySelectorAll<HTMLElement>('[aria-hidden="true"]'),
    ).find(element => {
      const style = getComputedStyle(element);
      return (
        style.position === 'absolute' &&
        style.backgroundImage.includes('gradient')
      );
    });
    const viewport = dialog.querySelector<HTMLElement>('[data-scroll-axis]');
    const content = dialog.querySelector<HTMLElement>('[data-scroll-content]');
    if (bar == null || viewport == null || content == null) {
      throw new Error('the sheet has no grab bar, scroll area or content');
    }
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    let firstLineTop: number | null = null;
    for (let node = walker.nextNode(); node != null; node = walker.nextNode()) {
      if ((node.textContent ?? '').trim() === '') {
        continue;
      }
      const range = document.createRange();
      range.selectNodeContents(node);
      const box = range.getBoundingClientRect();
      if (box.height > 0) {
        firstLineTop = box.top;
        break;
      }
    }
    const barBox = bar.getBoundingClientRect();
    // The backdrop's stops, read from the painted gradient: the first stop is
    // where the opaque surface ends, the last where the fade does (a stop
    // with no position sits at the end of the band).
    const image = getComputedStyle(bar).backgroundImage;
    const inner = image.slice(image.indexOf('(') + 1, image.lastIndexOf(')'));
    const stops: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === '(') {
        depth++;
      } else if (inner[i] === ')') {
        depth--;
      } else if (inner[i] === ',' && depth === 0) {
        stops.push(inner.slice(start, i).trim());
        start = i + 1;
      }
    }
    stops.push(inner.slice(start).trim());
    const rootFont = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    const at = (stop: string, fallback: number) => {
      const match = stop.match(/(-?[\d.]+)(px|%|rem)$/);
      if (match == null) {
        return fallback;
      }
      const value = Number(match[1]);
      return match[2] === '%'
        ? (barBox.height * value) / 100
        : match[2] === 'rem'
          ? value * rootFont
          : value;
    };
    const pillHeight = Number.parseFloat(
      getComputedStyle(bar, '::before').height,
    );
    return {
      barTop: barBox.top,
      barBottom: barBox.bottom,
      opaqueEnd: at(stops[0] ?? '', 0),
      fadeEnd: at(stops[stops.length - 1] ?? '', barBox.height),
      pillBottom: (barBox.height + pillHeight) / 2,
      firstLineTop,
      contentTop: content.getBoundingClientRect().top,
      overflow: viewport.scrollHeight - viewport.clientHeight,
    };
  });
}

// At the theme's default padding, the first line starts where that padding
// ends; the fade must be over by then.
for (const story of ['showcase', 'tall-sheet']) {
  test(`the grab bar's fade ends above the first line: ${story}`, async ({
    page,
  }) => {
    await open(page, story);
    const reading = await read(page);
    test.info().annotations.push({
      type: 'reading',
      description: JSON.stringify(reading),
    });
    expect(reading.firstLineTop).not.toBeNull();
    expect(reading.firstLineTop!).toBeGreaterThanOrEqual(
      reading.barTop + reading.fadeEnd,
    );
    // The opaque part still backs the pill, so scrolled text never runs
    // through it.
    expect(reading.opaqueEnd).toBeGreaterThanOrEqual(reading.pillBottom);
  });
}

// Sheets whose height follows their content. A detent-sized sheet (Snap
// Points With Peek) is not one of them: its height is the detent's, so
// whether its content fits depends on the machine's font metrics.
for (const story of [
  'text-only-fitting',
  'showcase',
  'hug-height',
  'nested-popover',
]) {
  test(`a sheet whose content fits does not scroll: ${story}`, async ({
    page,
  }) => {
    // The bar reserves no layout space, so a sheet whose content fits stays
    // the size of its content and does not scroll.
    await open(page, story);
    const reading = await read(page);
    test.info().annotations.push({
      type: 'reading',
      description: JSON.stringify(reading),
    });
    expect(reading.overflow).toBeLessThanOrEqual(1);
  });
}

test('scrolled content still passes beneath the grab bar', async ({page}) => {
  // The content starts at the sheet's top edge and rides up under the bar
  // once the sheet scrolls, instead of stopping at its bottom edge.
  await open(page, 'text-only');
  await page.evaluate(() => {
    const viewport = document.querySelector<HTMLElement>(
      'dialog[open] [data-scroll-axis]',
    );
    if (viewport != null) {
      viewport.scrollTop = 200;
    }
  });
  await page.waitForTimeout(100);
  const reading = await read(page);
  test
    .info()
    .annotations.push({type: 'reading', description: JSON.stringify(reading)});
  expect(reading.contentTop).toBeLessThan(reading.barTop);
});
