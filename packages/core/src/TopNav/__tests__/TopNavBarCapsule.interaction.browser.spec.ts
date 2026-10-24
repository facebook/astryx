// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavBarCapsule.interaction.browser.spec.ts
 * @input The built "Touch bar over content" AppShell story on the touch
 *   phone profile (its TopNav in the phone bar: a Profile icon button and the
 *   drawer toggle), the interaction harness, and the iOS 26 bar geometry in
 *   motion/uikit/bars
 * @output Browser proof of the iOS 26 bar buttons under a finger: the
 *   phone bar is 54px tall with its end items on one capsule at its
 *   top, 44px tall and fully rounded, 16px from the shell's side, painted with
 *   the theme's surface and no shadow; two icon buttons are centred where UIKit
 *   centres its 36px cells (4px in from the ends, 16px apart: a 96px
 *   capsule); right to left, the capsule sits at the inline end, 16px from
 *   the shell's left side; Reduce Transparency changes nothing (the
 *   capsule is opaque); a finger
 *   on the toggle still opens the drawer; the buttons keep their names and
 *   order; a mouse keeps today's bar; a still of the bar
 * @position Interaction proof for TopNav.tsx's phone bar, run by
 *   `pnpm test:interaction` (Chromium and WebKit). Touch is one model on
 *   every touch device, so the phone profile's coarse pointer is the touch
 *   case in both engines
 */

import {expect, test, type Page} from '@playwright/test';
import {
  openStory,
  touchDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

/** Opens the story, left to right or right to left. */
async function openBar(
  page: Page,
  {dir = 'ltr'}: {dir?: 'ltr' | 'rtl'} = {},
): Promise<void> {
  if (dir === 'rtl') {
    // Storybook's direction global sets the story's provider direction.
    await page.goto(
      `${storybook()}/iframe.html?id=${STORY}&viewMode=story&globals=direction:rtl`,
    );
    await page.locator('#storybook-root > *').first().waitFor();
  } else {
    await openStory(page, storybook(), STORY);
  }
}

const STORY = 'core-appshell--touch-bar-over-content';

/**
 * `bars.heightPt` and `bars.buttonCapsules`, iOS 26.2: what the phone bar
 * measures with the default tokens it is built from.
 */
const BAR = 54;
const CAPSULE = 44;
const EDGE = 16;
/** Two 36px cells, 4px in from the ends and 16px apart. */
const CELL = 36;
const TWO_IMAGES = 4 + CELL + 16 + CELL + 4;

/** The theme's `--color-background-surface`, computed beside the capsule. */
async function surfaceColor(page: Page): Promise<string> {
  return page.evaluate(() => {
    const capsule = document.querySelector('[data-bar-capsule]');
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--color-background-surface)';
    (capsule?.parentElement ?? document.body).append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  });
}

interface Geometry {
  shellLeft: number;
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
      shellLeft: shell.getBoundingClientRect().left,
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

test('the phone bar is 54px tall with its end items on one capsule', async ({
  page,
}) => {
  await openBar(page);
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
  // The theme's surface, opaque; UIKit's capsule has no shadow.
  expect(g.capsule.background).toBe(await surfaceColor(page));
  expect(g.capsule.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(g.capsule.shadow).toBe('none');
});

test('two icon buttons are centred where UIKit centres its 36px cells', async ({
  page,
}) => {
  await openBar(page);
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
  await openBar(page);
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
  await openBar(page);
  const bar = page.getByRole('banner');
  await test.info().attach('bar-capsule-at-rest', {
    body: await bar.screenshot(),
    contentType: 'image/png',
  });
  await expect(bar).toBeVisible();
});

test('right to left, the capsule sits at the inline end, 16px from the side', async ({
  page,
}) => {
  await openBar(page, {dir: 'rtl'});
  const g = await geometry(page);
  test.info().annotations.push({type: 'rtl', description: JSON.stringify(g)});
  expect(g.capsule.left - g.shellLeft).toBeCloseTo(EDGE, 1);
  expect(g.capsule.height).toBeCloseTo(CAPSULE, 1);
  // The order follows the inline direction: Profile first, at the right.
  expect(g.names).toEqual(['Profile', 'Open navigation']);
  expect(g.centres[0]).toBeGreaterThan(g.centres[1]);
});

test('Reduce Transparency changes nothing: the capsule is opaque', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'prefers-reduced-transparency is emulated through the Chromium protocol',
  );
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setEmulatedMedia', {
    features: [{name: 'prefers-reduced-transparency', value: 'reduce'}],
  });
  await openBar(page);
  expect(
    await page.evaluate(
      () => matchMedia('(prefers-reduced-transparency: reduce)').matches,
    ),
  ).toBe(true);
  const g = await geometry(page);
  expect(g.capsule.background).toBe(await surfaceColor(page));
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('the bar keeps today’s layout: no capsule surface, today’s height', async ({
    page,
  }) => {
    await openBar(page);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const g = await geometry(page);
    test
      .info()
      .annotations.push({type: 'mouse', description: JSON.stringify(g)});
    expect(g.capsule.background).toBe('rgba(0, 0, 0, 0)');
    expect(g.capsule.radius).toBe('0px');
    expect(g.bar.height).not.toBeCloseTo(BAR, 0);
  });
});
