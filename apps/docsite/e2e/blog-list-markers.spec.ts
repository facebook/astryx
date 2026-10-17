// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file blog-list-markers.spec.ts
 * @input Production docsite's 0.7.0 release post and its 26-item migration list
 * @output Real-browser proof that number markers stay on one line and never
 *   overlap their labels, with short numbered and bulleted lists unchanged
 * @position Docsite browser regression for markers that jsdom cannot lay out
 */

import {createHash} from 'node:crypto';
import * as fs from 'node:fs/promises';
import {expect, test} from '@playwright/test';

for (const {width, dir, colorScheme} of [
  {width: 1280, dir: 'ltr', colorScheme: 'light'},
  {width: 390, dir: 'ltr', colorScheme: 'light'},
  {width: 1280, dir: 'rtl', colorScheme: 'dark'},
  {width: 390, dir: 'rtl', colorScheme: 'dark'},
] as const) {
  test(`release list markers stay intact (${width}px, ${dir}, ${colorScheme})`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({width, height: 900});
    await page.emulateMedia({colorScheme, reducedMotion: 'reduce'});
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto('/blog/astryx-v0-7-0');
    await page.evaluate(d => {
      document.documentElement.dir = d;
    }, dir);
    await page.evaluate(() => document.fonts.ready);

    const migrations = page.locator('ol').filter({
      hasText: 'Phone typography starts at 16px',
    });
    await expect(migrations.locator(':scope > li')).toHaveCount(26);

    // Capture the exact portion reported by readers before asserting, so a
    // pre-fix run also records useful before evidence.
    await migrations.locator(':scope > li').nth(20).scrollIntoViewIfNeeded();
    const imagePath = testInfo.outputPath(
      `migration-markers-${width}-${dir}-${colorScheme}.png`,
    );
    const sensors = await migrations.evaluate(el => {
      const root = document.documentElement;
      const rect = el.getBoundingClientRect();
      return {
        theme: root.dataset.astryxTheme,
        colorScheme: getComputedStyle(root).colorScheme,
        background: getComputedStyle(document.body).backgroundColor,
        direction: getComputedStyle(el).direction,
        viewport: {
          width: innerWidth,
          height: innerHeight,
          dpr: devicePixelRatio,
        },
        media: {
          dark: matchMedia('(prefers-color-scheme: dark)').matches,
          reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
          forcedColors: matchMedia('(forced-colors: active)').matches,
          coarsePointer: matchMedia('(pointer: coarse)').matches,
          hover: matchMedia('(hover: hover)').matches,
        },
        fonts: document.fonts.status,
        state: {
          count: el.children.length,
          reportedItem: (el.children[21] as HTMLElement).innerText,
        },
        geometry: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
      };
    });
    expect(sensors.theme).toBe('astryx');
    expect(sensors.direction).toBe(dir);
    expect(sensors.viewport).toEqual({width, height: 900, dpr: 1});
    expect(sensors.media.dark).toBe(colorScheme === 'dark');
    expect(sensors.media.reducedMotion).toBe(true);
    expect(sensors.media.forcedColors).toBe(false);
    expect(sensors.fonts).toBe('loaded');
    expect(sensors.state.count).toBe(26);
    expect(sensors.state.reportedItem).toContain(
      'Phone typography starts at 16px',
    );
    expect(sensors.geometry.width).toBeGreaterThan(0);
    expect(sensors.geometry.height).toBeGreaterThan(0);
    expect(pageErrors).toEqual([]);
    const image = await page.screenshot({path: imagePath});
    await fs.writeFile(
      `${imagePath}.sensors.json`,
      JSON.stringify(
        {
          build: process.env.MARKER_EVIDENCE_BUILD ?? 'local production build',
          page: '/blog/astryx-v0-7-0',
          expected: {theme: 'astryx', dir, width, colorScheme, itemCount: 26},
          observed: sensors,
          image: {
            path: imagePath,
            width: image.readUInt32BE(16),
            height: image.readUInt32BE(20),
            sha256: createHash('sha256').update(image).digest('hex'),
          },
        },
        null,
        2,
      ),
    );

    // The marker is an empty span whose ::before draws the CSS counter.
    // Check its real line box and the space it reserves, not just a CSS rule:
    // nowrap alone would still let long numbers paint across the label.
    const geometry = await migrations
      .locator(':scope > li')
      .evaluateAll(items =>
        items.map(item => {
          const marker = item.firstElementChild;
          const label = marker?.nextElementSibling;
          if (marker == null || label == null) {
            throw new Error('missing marker or label');
          }
          const markerBox = marker.getBoundingClientRect();
          const labelBox = label.getBoundingClientRect();
          return {
            height: markerBox.height,
            lineHeight: Number.parseFloat(getComputedStyle(marker).lineHeight),
            gap:
              getComputedStyle(item).direction === 'rtl'
                ? markerBox.left - labelBox.right
                : labelBox.left - markerBox.right,
            width: markerBox.width,
            scrollWidth: marker.scrollWidth,
          };
        }),
      );
    expect(geometry).toHaveLength(26);
    for (const marker of geometry) {
      expect(marker.height).toBeLessThanOrEqual(marker.lineHeight + 1);
      expect(marker.scrollWidth).toBeLessThanOrEqual(marker.width + 1);
      expect(marker.gap).toBeGreaterThan(0);
    }

    // The three short upgrade steps still have one-line counters, and the
    // adjacent bulleted lists still draw a dot rather than a number.
    const steps = page.locator('ol').filter({hasText: 'Pin Core and the CLI'});
    await expect(steps.locator(':scope > li')).toHaveCount(3);
    const shortMarker = steps.locator(':scope > li > span:first-child').first();
    const shortGeometry = await shortMarker.evaluate(el => ({
      width: el.getBoundingClientRect().width,
      minimum: Number.parseFloat(getComputedStyle(el).minWidth),
    }));
    expect(shortGeometry.width).toBe(geometry[0].width);
    expect(shortGeometry.width).toBeGreaterThanOrEqual(shortGeometry.minimum);
    expect(shortGeometry.width).toBeLessThanOrEqual(shortGeometry.minimum + 1);
    const bullet = page
      .locator('ul')
      .filter({hasText: 'Core spacing uses rem'})
      .locator(':scope > li > span:first-child > span')
      .first();
    await expect(bullet).toBeVisible();
  });
}
