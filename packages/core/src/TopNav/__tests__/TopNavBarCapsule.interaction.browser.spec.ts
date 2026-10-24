// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavBarCapsule.interaction.browser.spec.ts
 * @input The built "Touch bar over content" AppShell story on the touch
 *   phone profile (its TopNav in the phone bar: a Profile icon button and the
 *   drawer toggle), the interaction harness, and the iOS 26 bar geometry in
 *   motion/uikit/bars
 * @output Browser proof of the iOS 26 bar buttons on a touch screen: the
 *   phone bar is 54px tall with its end items on one glass capsule at its
 *   top, 44px tall and fully rounded, 16px from the shell's side, painted with
 *   the glass token and no shadow; two icon buttons are centred where UIKit
 *   centres its 36px cells (4px in from the ends, 16px apart: a 96px
 *   capsule); a finger on the toggle still opens the drawer; the buttons keep
 *   their names and order; a still of the bar
 * @position Interaction proof for TopNav.tsx's phone bar, run by
 *   `pnpm test:interaction` (Chromium and WebKit)
 */

import {expect, test, type Page} from '@playwright/test';
import {
  openStory,
  touchDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

const STORY = 'core-appshell--touch-bar-over-content';

/** `bars.heightPt` and `bars.buttonCapsules`, iOS 26.2. */
const BAR = 54;
const CAPSULE = 44;
const EDGE = 16;
/** Two 36px cells, 4px in from the ends and 16px apart. */
const CELL = 36;
const TWO_IMAGES = 4 + CELL + 16 + CELL + 4;

interface Geometry {
  shellRight: number;
  bar: {top: number; height: number};
  capsule: {
    left: number;
    right: number;
    top: number;
    width: number;
    height: number;
    radius: string;
    background: string;
    shadow: string;
  };
  /** Each button's centre, from the capsule's left edge. */
  centres: number[];
  names: string[];
}

async function geometry(page: Page): Promise<Geometry> {
  return page.evaluate(() => {
    const banner = document.querySelector('[role="banner"]') as HTMLElement;
    const shell = (banner.closest('.astryx-app-shell') ??
      banner.parentElement) as HTMLElement;
    const bar = banner.querySelector('[role="navigation"]') as HTMLElement;
    const capsule = bar.querySelector('[data-bar-capsule]') as HTMLElement;
    const c = capsule.getBoundingClientRect();
    const style = getComputedStyle(capsule);
    const buttons = Array.from(capsule.querySelectorAll('button'));
    return {
      shellRight: shell.getBoundingClientRect().right,
      bar: {
        top: bar.getBoundingClientRect().top,
        height: bar.getBoundingClientRect().height,
      },
      capsule: {
        left: c.left,
        right: c.right,
        top: c.top,
        width: c.width,
        height: c.height,
        radius: style.borderTopLeftRadius,
        background: style.backgroundColor,
        shadow: style.boxShadow,
      },
      centres: buttons.map(b => {
        const r = b.getBoundingClientRect();
        return r.left + r.width / 2 - c.left;
      }),
      names: buttons.map(
        b => b.getAttribute('aria-label') ?? b.textContent ?? '',
      ),
    };
  });
}

test('the phone bar is 54px tall with its end items on one glass capsule', async ({
  page,
}) => {
  await openStory(page, storybook(), STORY);
  const g = await geometry(page);
  test
    .info()
    .annotations.push({type: 'geometry', description: JSON.stringify(g)});
  expect(g.bar.height).toBeCloseTo(BAR, 1);
  // The capsule rides the bar's top edge, 44px tall, a full pill.
  expect(g.capsule.top).toBeCloseTo(g.bar.top, 1);
  expect(g.capsule.height).toBeCloseTo(CAPSULE, 1);
  expect(g.capsule.radius).toBe('22px');
  // 16px from the shell's side.
  expect(g.shellRight - g.capsule.right).toBeCloseTo(EDGE, 1);
  // The glass token (the surface at 85 %); UIKit's glass has no shadow.
  // A color-mix() resolves to a color() value in both engines.
  expect(g.capsule.background).toBe('color(srgb 1 1 1 / 0.85)');
  expect(g.capsule.shadow).toBe('none');
});

test('two icon buttons are centred where UIKit centres its 36px cells', async ({
  page,
}) => {
  await openStory(page, storybook(), STORY);
  const g = await geometry(page);
  expect(g.names).toEqual(['Profile', 'Open navigation']);
  expect(g.capsule.width).toBeCloseTo(TWO_IMAGES, 0);
  // Centres 22px and 74px from the capsule's start.
  expect(g.centres[0]).toBeCloseTo(4 + CELL / 2, 0);
  expect(g.centres[1]).toBeCloseTo(4 + CELL + 16 + CELL / 2, 0);
});

test('a finger on the toggle in the capsule opens the drawer', async ({
  page,
}) => {
  await openStory(page, storybook(), STORY);
  const toggle = page.getByRole('button', {name: 'Open navigation'});
  const box = await toggle.boundingBox();
  if (box == null) {
    throw new Error('the toggle has no box');
  }
  const finger = await touchDriver(page);
  await finger.tap({x: box.x + box.width / 2, y: box.y + box.height / 2});
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
});

test('still: the bar at rest', {tag: '@storyboard'}, async ({page}) => {
  await openStory(page, storybook(), STORY);
  const bar = page.getByRole('banner');
  await test.info().attach('bar-capsule-at-rest', {
    body: await bar.screenshot(),
    contentType: 'image/png',
  });
  await expect(bar).toBeVisible();
});
