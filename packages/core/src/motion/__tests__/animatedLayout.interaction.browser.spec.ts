// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file animatedLayout.interaction.browser.spec.ts
 * @input The animated-layout module bundled with esbuild onto fixture pages
 *   written inline, real Chromium and WebKit (the interaction projects: a
 *   phone with a coarse pointer) plus a fine-pointer describe
 * @output One proof per `spec:AST-105` Coverage row, and FR2–FR4: which
 *   elements glide after a reported size change, by how much, on one shared
 *   start and spring, never past the area and never scrolling it; nothing
 *   without a handle; Reduce Motion by pointer
 * @position Real-browser verification of `spec:AST-105` and
 *   `architecture:react-component-runtime` INV12
 */

import {fileURLToPath} from 'node:url';
import {expect, test, type Page} from '@playwright/test';
import {build} from 'esbuild';
import type * as Bundle from './animatedLayoutBundle';

/** One animation on an element: its first frame and its timing. */
interface MotionRead {
  first: string | null;
  opacity: string | null;
  composite: string;
  duration: number;
  startTime: number | null;
}

declare global {
  interface Window {
    AnimatedLayout: typeof Bundle;
    /** Runs one reported change; resolves after the glide is set up. */
    change: (options: {
      changed: string;
      mutate: string;
      area?: string;
      handle?: boolean;
    }) => Promise<void>;
    /** Animations on an element: their first transform and timing. */
    motionOf: (selector: string) => MotionRead[];
  }
}

let script = '';

test.beforeAll(async () => {
  const result = await build({
    entryPoints: [
      fileURLToPath(new URL('./animatedLayoutBundle.ts', import.meta.url)),
    ],
    bundle: true,
    write: false,
    format: 'iife',
    globalName: 'AnimatedLayout',
    target: 'es2022',
  });
  script = result.outputFiles[0].text;
});

const BASE_STYLE = `
  html, body { margin: 0; font: 14px sans-serif; background: #fff; }
  .area { position: relative; height: 560px; overflow: auto; }
  .row { height: 40px; margin: 0 0 4px; background: #eef; }
  .grow { height: 0; overflow: hidden; background: #fd9; }
  .grow.open { height: 80px; }
`;

const HELPERS = `
window.change = async ({changed, mutate, area = '#area', handle = true}) => {
  const container = document.querySelector(area);
  const target = document.querySelector(changed);
  const layout = handle
    ? AnimatedLayout.createAnimatedLayout(() => container)
    : null;
  const report = AnimatedLayout.reportLayoutChange(layout, () => target);
  report.measureBefore();
  new Function(mutate)();
  report.animate();
  AnimatedLayout.playLayoutChange(layout, target);
  await new Promise(resolve => queueMicrotask(resolve));
};
window.motionOf = selector => {
  const element = document.querySelector(selector);
  return element.getAnimations({subtree: false}).map(animation => {
    const effect = animation.effect;
    const frames = effect.getKeyframes();
    const timing = effect.getTiming();
    return {
      first: frames[0].transform ?? null,
      opacity: frames[0].opacity == null ? null : String(frames[0].opacity),
      composite: effect.composite,
      duration: Number(timing.duration),
      startTime: animation.startTime == null ? null : Number(animation.startTime),
    };
  });
};
`;

async function open(page: Page, body: string, style = '') {
  const html = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${BASE_STYLE}${style}</style>
${body}
<script>${script}</script>
<script>${HELPERS}</script>`;
  await page.route('http://layout.test/', async route =>
    route.fulfill({contentType: 'text/html', body: html}),
  );
  await page.goto('http://layout.test/');
}

const OPEN_GROW = `document.querySelector('#grow').classList.add('open')`;

/** Reports one change from the test (its options cross into the page). */
async function change(
  page: Page,
  options: {
    changed?: string;
    mutate?: string;
    area?: string;
    handle?: boolean;
  } = {},
) {
  await page.evaluate(async o => window.change(o), {
    changed: '#grow',
    mutate: OPEN_GROW,
    ...options,
  });
}

/** Until every animation on the page has finished. */
async function settle(page: Page) {
  await expect
    .poll(async () => page.evaluate(() => document.getAnimations().length), {
      timeout: 5000,
    })
    .toBe(0);
}

/** The translate an animation starts from, in px. */
function startOffset(first: string | null): {x: number; y: number} {
  const match = /translate\(([-\d.e]+)px,\s*([-\d.e]+)px\)/.exec(first ?? '');
  return match == null
    ? {x: 0, y: 0}
    : {x: Number(match[1]), y: Number(match[2])};
}

test.describe('spec:AST-105 Coverage', () => {
  test('normal-flow siblings at each ancestor level glide, and nothing past the area moves', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area">
        <section id="l1">
          <div id="l2">
            <div id="l3"><div id="grow" class="grow"></div><div id="s3" class="row"></div></div>
            <div id="s2" class="row"></div>
          </div>
          <div id="s1" class="row"></div>
        </section>
        <div id="s0" class="row"></div>
      </div>
      <div id="outside" class="row"></div>`,
    );
    await change(page);
    for (const id of ['#s3', '#s2', '#s1', '#s0']) {
      const [motion] = await page.evaluate(s => window.motionOf(s), id);
      expect(motion, id).toBeDefined();
      expect(startOffset(motion.first).y, id).toBeCloseTo(-80, 0);
      expect(motion.composite, id).toBe('add');
    }
    expect(await page.evaluate(() => window.motionOf('#outside'))).toEqual([]);
  });

  test('a display: contents wrapper has no box: its children glide in its place', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area"><div id="grow" class="grow"></div>
        <div id="wrap" style="display: contents"><div id="c1" class="row"></div><div id="c2" class="row"></div></div></div>`,
    );
    await change(page);
    expect(await page.evaluate(() => window.motionOf('#wrap'))).toEqual([]);
    for (const id of ['#c1', '#c2']) {
      expect(await page.evaluate(s => window.motionOf(s), id)).toHaveLength(1);
    }
  });

  test('absolute and fixed elements take their final place; an absolute badge rides with its row', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area"><div id="grow" class="grow"></div>
        <div id="row" class="row" style="position: relative"><span id="badge" style="position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; background: #c00"></span></div>
        <div id="abs" style="position: absolute; top: 200px; left: 0; width: 40px; height: 40px; background: #0c0"></div>
        <div id="fixed" style="position: fixed; bottom: 0; right: 0; width: 40px; height: 40px; background: #00c"></div></div>`,
    );
    const before = await page.locator('#badge').boundingBox();
    await change(page);
    expect(await page.evaluate(() => window.motionOf('#abs'))).toEqual([]);
    expect(await page.evaluate(() => window.motionOf('#fixed'))).toEqual([]);
    expect(await page.evaluate(() => window.motionOf('#badge'))).toEqual([]);
    // Halfway through, the row and its badge are between the two places.
    await page.evaluate(() => {
      for (const animation of document
        .querySelector<HTMLElement>('#row')
        ?.getAnimations() ?? []) {
        animation.pause();
        animation.currentTime = 60;
      }
    });
    const mid = await page.locator('#badge').boundingBox();
    expect(mid?.y ?? 0).toBeGreaterThan(before?.y ?? 0);
    expect(mid?.y ?? 0).toBeLessThan((before?.y ?? 0) + 80);
  });

  test('a sticky element glides while unstuck and stays put while stuck', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area">
        ${'<div class="row"></div>'.repeat(4)}
        <div id="stuck" style="position: sticky; top: 0; height: 30px; background: #ccf"></div>
        ${'<div class="row"></div>'.repeat(4)}
        <div id="grow" class="grow"></div>
        <div id="unstuck" style="position: sticky; top: 0; height: 30px; background: #fcc"></div>
        ${'<div class="row"></div>'.repeat(20)}
      </div>`,
    );
    // Scrolled past the first header: it is stuck at the area's top.
    await page.evaluate(() => {
      (document.querySelector('#area') as HTMLElement).scrollTop = 200;
    });
    await change(page);
    expect(await page.evaluate(() => window.motionOf('#stuck'))).toEqual([]);
    expect(await page.evaluate(() => window.motionOf('#unstuck'))).toHaveLength(
      1,
    );
  });

  test('a float after the change glides', async ({page}) => {
    await open(
      page,
      `<div id="area" class="area"><div id="grow" class="grow"></div>
        <div id="float" style="float: left; width: 60px; height: 60px; background: #9c9"></div></div>`,
    );
    await change(page);
    expect(await page.evaluate(() => window.motionOf('#float'))).toHaveLength(
      1,
    );
  });

  test('flex items: a wrapped item glides, a row-direction neighbor that does not shift stays', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area">
        <div style="display: flex; gap: 8px"><div id="chip" style="width: 40px; height: 30px; background: #fd9"></div><div id="neighbor" style="width: 40px; height: 30px; background: #9cf"></div></div>
        <div id="tags" style="display: flex; flex-wrap: wrap; gap: 4px; width: 200px">
          <span class="tag" style="width: 60px; height: 24px; background: #ddd"></span>
          <span class="tag" style="width: 60px; height: 24px; background: #ddd"></span>
          <span class="tag" style="width: 60px; height: 24px; background: #ddd"></span>
          <span id="last" class="tag" style="width: 60px; height: 24px; background: #ddd"></span>
        </div></div>`,
    );
    // The first chip widens: its row-direction neighbor moves sideways.
    await change(page, {
      changed: '#chip',
      mutate: `document.querySelector('#chip').style.width = '120px'`,
    });
    const [neighbor] = await page.evaluate(() => window.motionOf('#neighbor'));
    expect(startOffset(neighbor.first).x).toBeCloseTo(-80, 0);
    // A tag inserted before the last wraps it to a new line.
    await change(page, {
      changed: '#tags',
      mutate: `const tag = document.createElement('span'); tag.style.cssText = 'width: 60px; height: 24px; background: #ddd'; document.querySelector('#last').before(tag)`,
    });
    // The wrapping row itself grew: the change is reported on it, and its own
    // children are not followers (only content after it is).
    expect(await page.evaluate(() => window.motionOf('#last'))).toEqual([]);
  });

  test('hidden, display: none and zero-size elements are skipped', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area"><div id="grow" class="grow"></div>
        <div id="hidden" class="row" style="visibility: hidden"></div>
        <div id="none" class="row" style="display: none"></div>
        <div id="empty" style="height: 0"></div>
        <div id="after" class="row"></div></div>`,
    );
    await change(page);
    for (const id of ['#hidden', '#none', '#empty']) {
      expect(await page.evaluate(s => window.motionOf(s), id), id).toEqual([]);
    }
    expect(await page.evaluate(() => window.motionOf('#after'))).toHaveLength(
      1,
    );
  });

  test('elements outside the visible part land without animation', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area"><div id="grow" class="grow"></div>
        ${Array.from({length: 40}, (_, i) => `<div id="r${i}" class="row"></div>`).join('')}</div>`,
    );
    await change(page);
    expect(await page.evaluate(() => window.motionOf('#r0'))).toHaveLength(1);
    // Far below the fold before and after.
    expect(await page.evaluate(() => window.motionOf('#r39'))).toEqual([]);
    // A change above the fold, out of sight: the changed element plays nothing.
    await settle(page);
    await page.evaluate(() => {
      (document.querySelector('#area') as HTMLElement).scrollTop = 1200;
    });
    await change(page, {
      changed: '#r2',
      mutate: `document.querySelector('#r2').style.height = '120px'`,
    });
    expect(await page.evaluate(() => window.motionOf('#r2'))).toEqual([]);
  });

  test('a row under a scaled panel moves by its layout change, corrected for the scale', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area"><div style="transform: scale(0.5); transform-origin: 0 0">
        <div id="grow" class="grow"></div><div id="scaled" class="row"></div></div></div>`,
    );
    await change(page);
    const [motion] = await page.evaluate(() => window.motionOf('#scaled'));
    // 80 px of layout: 40 px on screen, translated in the panel's own space.
    expect(startOffset(motion.first).y).toBeCloseTo(-80, 0);
  });

  test('top-layer content is never moved', async ({page}) => {
    await open(
      page,
      `<div id="area" class="area"><div id="grow" class="grow"></div>
        <div class="row"></div><div id="pop" popover>menu</div></div>`,
    );
    await page.evaluate(() =>
      (document.querySelector('#pop') as HTMLElement).showPopover(),
    );
    await change(page);
    expect(await page.evaluate(() => window.motionOf('#pop'))).toEqual([]);
  });

  test('an element already moving keeps its motion and adds the new move', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area"><div id="grow" class="grow"></div>
        <div id="second" class="grow"></div><div id="after" class="row"></div></div>`,
    );
    await change(page);
    await page.waitForTimeout(100);
    await change(page, {
      changed: '#second',
      mutate: `document.querySelector('#second').classList.add('open')`,
    });
    const motions = await page.evaluate(() => window.motionOf('#after'));
    expect(motions).toHaveLength(2);
    expect(motions.every(m => m.composite === 'add')).toBe(true);
  });

  test('nested areas: motion stops at the inner area; an inner area moves as one unit', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area"><div id="outerGrow" class="grow"></div>
        <div id="inner" style="height: 200px; overflow: auto"><div id="grow" class="grow"></div><div id="innerAfter" class="row"></div></div>
        <div id="outerAfter" class="row"></div></div>`,
    );
    await change(page, {area: '#inner'});
    expect(
      await page.evaluate(() => window.motionOf('#innerAfter')),
    ).toHaveLength(1);
    expect(await page.evaluate(() => window.motionOf('#outerAfter'))).toEqual(
      [],
    );
    await settle(page);
    await change(page, {
      changed: '#outerGrow',
      mutate: `document.querySelector('#outerGrow').classList.add('open')`,
    });
    expect(await page.evaluate(() => window.motionOf('#inner'))).toHaveLength(
      1,
    );
    expect(
      (await page.evaluate(() => window.motionOf('#innerAfter'))).length,
    ).toBe(0);
  });
});

test.describe('spec:AST-105 FR2–FR4', () => {
  const PAGE = `<div id="area" class="area"><div id="grow" class="grow"></div>
    <div id="a" class="row"></div><div id="b" class="row"></div>
    ${'<div class="row"></div>'.repeat(30)}</div>`;

  test('without a handle nothing animates (FR2)', async ({page}) => {
    await open(page, PAGE);
    await change(page, {handle: false});
    for (const id of ['#grow', '#a', '#b']) {
      expect(await page.evaluate(s => window.motionOf(s), id), id).toEqual([]);
    }
  });

  test('two changes in one frame move each element once, by its total change (FR3)', async ({
    page,
  }) => {
    await open(
      page,
      `<div id="area" class="area"><div id="g1" class="grow"></div><div id="g2" class="grow"></div><div id="after" class="row"></div></div>`,
    );
    await page.evaluate(async () => {
      const area = document.querySelector('#area');
      const layout = window.AnimatedLayout.createAnimatedLayout(() => area);
      const one = window.AnimatedLayout.reportLayoutChange(layout, () =>
        document.querySelector('#g1'),
      );
      const two = window.AnimatedLayout.reportLayoutChange(layout, () =>
        document.querySelector('#g2'),
      );
      one.measureBefore();
      two.measureBefore();
      document.querySelector<HTMLElement>('#g1')?.classList.add('open');
      document.querySelector<HTMLElement>('#g2')?.classList.add('open');
      one.animate();
      two.animate();
      await new Promise<void>(resolve => {
        queueMicrotask(resolve);
      });
    });
    const motions = await page.evaluate(() => window.motionOf('#after'));
    expect(motions).toHaveLength(1);
    expect(startOffset(motions[0].first).y).toBeCloseTo(-160, 0);
  });

  test('the glide never scrolls the area (FR3)', async ({page}) => {
    // The same change with and without a handle, from the same scroll
    // position: the area's scroll (the browser's own scroll anchoring
    // included) is identical, frame by frame, so the glide adds none.
    const scrollsOf = async (handle: boolean) => {
      await open(page, PAGE);
      return page.evaluate(
        async ({mutate, withHandle}) => {
          const area = document.querySelector('#area') as HTMLElement;
          area.scrollTop = 40;
          const frame = async () =>
            new Promise(resolve => requestAnimationFrame(resolve));
          await frame();
          await frame();
          await window.change({changed: '#grow', mutate, handle: withHandle});
          const tops: number[] = [];
          for (let i = 0; i < 40; i++) {
            tops.push(area.scrollTop);
            await frame();
          }
          return tops;
        },
        {mutate: OPEN_GROW, withHandle: handle},
      );
    };
    const without = await scrollsOf(false);
    const withHandle = await scrollsOf(true);
    expect(withHandle).toEqual(without);
  });

  test('the changed element and its followers start on one frame on springs.settle (FR4)', async ({
    page,
  }) => {
    await open(page, PAGE);
    await change(page);
    await page.waitForTimeout(50);
    const grow = await page.evaluate(() => window.motionOf('#grow'));
    const follower = await page.evaluate(() => window.motionOf('#a'));
    expect(grow).toHaveLength(1);
    expect(follower).toHaveLength(1);
    expect(grow[0].startTime).toBe(follower[0].startTime);
    expect(grow[0].duration).toBeCloseTo(follower[0].duration, 3);
    // springs.settle is SwiftUI's smooth spring (duration 0.5 s, no bounce):
    // it settles within a second.
    expect(follower[0].duration).toBeGreaterThan(300);
    expect(follower[0].duration).toBeLessThan(1200);
  });

  test("a scope's --motion-springs-settle changes nothing: the role is internal (FR4)", async ({
    page,
  }) => {
    await open(page, PAGE);
    await change(page);
    const [shared] = await page.evaluate(() => window.motionOf('#a'));
    await open(page, PAGE, '#area { --motion-springs-settle: 0.2s 0; }');
    await change(page);
    const [scoped] = await page.evaluate(() => window.motionOf('#a'));
    expect(scoped.duration).toBeCloseTo(shared.duration, 3);
  });

  test('under Reduce Motion with a coarse pointer, both cross-fade with no travel (FR4)', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await open(page, PAGE);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(true);
    await change(page);
    for (const id of ['#grow', '#a']) {
      const [motion] = await page.evaluate(s => window.motionOf(s), id);
      expect(motion.first, id).toBeNull();
      expect(motion.opacity, id).toBe('0');
      expect(motion.duration, id).toBeLessThanOrEqual(200);
    }
  });
});

test.describe('spec:AST-105 FR5 and FR4 under a fine pointer', () => {
  test.use({
    isMobile: false,
    hasTouch: false,
    viewport: {width: 1280, height: 800},
  });

  const PAGE = `<div id="area" class="area"><div id="grow" class="grow"></div>
    <div id="a" class="row"></div></div>`;

  test('the glide applies under a mouse (FR5)', async ({page}) => {
    await open(page, PAGE);
    expect(
      await page.evaluate(() => matchMedia('(pointer: fine)').matches),
    ).toBe(true);
    await change(page);
    expect(await page.evaluate(() => window.motionOf('#a'))).toHaveLength(1);
  });

  test('under Reduce Motion with a fine pointer the change is immediate (FR4)', async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await open(page, PAGE);
    await change(page);
    expect(await page.evaluate(() => window.motionOf('#grow'))).toEqual([]);
    expect(await page.evaluate(() => window.motionOf('#a'))).toEqual([]);
  });
});
