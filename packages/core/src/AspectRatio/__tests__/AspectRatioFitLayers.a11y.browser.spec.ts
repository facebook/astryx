// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AspectRatioFitLayers.a11y.browser.spec.ts
 * @input reset.css, Tailwind's preflight.css, and the markup AspectRatio renders
 * @output Browser evidence that `fit` fills the box on the documented setups
 * @position AspectRatio integration proof. Which rule sizes the child is a
 *   cascade-layer question, and only a shipping engine resolves the cascade.
 */

import * as fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {expect, test, type Page} from '@playwright/test';

const RESET_CSS = fs.readFileSync(
  fileURLToPath(new URL('../../reset.css', import.meta.url)),
  'utf8',
);
const PREFLIGHT_CSS = fs.readFileSync(
  fileURLToPath(import.meta.resolve('tailwindcss/preflight.css')),
  'utf8',
);

// The layer order each setup guide declares, and the layer preflight goes in.
const TAILWIND_SETUPS = [
  {
    name: 'Tailwind v4',
    order:
      '@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;',
    preflightLayer: 'base',
  },
  {
    name: 'Tailwind v3',
    order: '@layer reset, tw-preflight, astryx-base, astryx-theme;',
    preflightLayer: 'tw-preflight',
  },
];

// A 100×100 image in a 320px-wide 16:9 box: filling the box makes it 320×180.
const IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'/%3E";

// What AspectRatio renders for `fit`, with its container and content-slot
// styles inlined (in the component they are StyleX classes).
function aspectRatioMarkup(fit: 'cover' | 'contain', mediaClass = '') {
  return `<div style="width: 320px">
    <div style="position: relative; width: 100%; overflow: clip; aspect-ratio: 16 / 9">
      <div data-astryx-aspect-ratio-override="${fit}"
        style="position: absolute; top: 0; inset-inline-start: 0; width: 100%; height: 100%">
        <img id="media" class="${mediaClass}" alt="" src="${IMAGE}">
      </div>
    </div>
  </div>`;
}

async function measureMedia(page: Page, html: string, styles: string[]) {
  await page.setContent(html);
  for (const content of styles) {
    await page.addStyleTag({content});
  }
  await page.waitForFunction(
    () => (document.getElementById('media') as HTMLImageElement).complete,
  );
  return page.evaluate(() => {
    const media = document.getElementById('media');
    if (!media) {
      throw new Error('missing media');
    }
    const box = media.getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      objectFit: getComputedStyle(media).objectFit,
    };
  });
}

for (const setup of TAILWIND_SETUPS) {
  for (const fit of ['cover', 'contain'] as const) {
    test(`fit="${fit}" fills the box on the ${setup.name} setup`, async ({
      page,
    }) => {
      const media = await measureMedia(page, aspectRatioMarkup(fit), [
        setup.order,
        `@layer ${setup.preflightLayer} { ${PREFLIGHT_CSS} }`,
        RESET_CSS,
      ]);
      expect(media).toEqual({width: 320, height: 180, objectFit: fit});
    });
  }
}

test('fit fills the box with only the reset loaded', async ({page}) => {
  const media = await measureMedia(page, aspectRatioMarkup('cover'), [
    RESET_CSS,
  ]);
  expect(media).toEqual({width: 320, height: 180, objectFit: 'cover'});
});

test('a utility class on the child still wins over fit', async ({page}) => {
  const media = await measureMedia(page, aspectRatioMarkup('cover', 'h-10'), [
    TAILWIND_SETUPS[0].order,
    `@layer base { ${PREFLIGHT_CSS} }`,
    RESET_CSS,
    '@layer utilities { .h-10 { height: 40px; } }',
  ]);
  expect(media).toEqual({width: 320, height: 40, objectFit: 'cover'});
});
