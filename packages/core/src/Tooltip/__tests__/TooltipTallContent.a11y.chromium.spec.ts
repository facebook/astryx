// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TooltipTallContent.a11y.chromium.spec.ts
 * @input The `Core/Tooltip` TallContent and Default stories in a built
 *   Storybook and real mouse input.
 * @output Real-engine proof that a tooltip taller than the room above and
 *   below its trigger never covers the trigger: it opens beside the trigger
 *   when there is room there, or on the side with more room otherwise, stays
 *   open under a still pointer (WCAG 2.2 1.4.13 Content on Hover or Focus,
 *   persistent), and scrolls its overflow inside a box that stays hoverable.
 * @position Run with `pnpm test:a11y-contract`. Which position option an
 *   engine picks, and whether the box then covers the trigger, is layout only
 *   a real engine produces.
 *
 * SYNC: Fixture lives in /apps/storybook/stories/Tooltip.stories.tsx
 *   (TallContent).
 */

import {expect, test, type Page} from '@playwright/test';
import {holdMotionStill} from '@astryxdesign/a11y-spec/chromium';
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

interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

function overlaps(a: Box, b: Box): boolean {
  return (
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  );
}

async function rect(page: Page, selector: string): Promise<Box> {
  return page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (el == null) {
      throw new Error(`${sel} is not in the document`);
    }
    const r = el.getBoundingClientRect();
    return {top: r.top, bottom: r.bottom, left: r.left, right: r.right};
  }, selector);
}

/** The story's trigger; Storybook's own buttons share the iframe. */
const TRIGGER = '#storybook-root button';
const TOOLTIP = '[role="tooltip"]';

/**
 * Count every open and close of the tooltip from here on, and record its box
 * in every frame it is open: a frame callback runs before that frame's paint,
 * so a frame that would paint the tooltip over its trigger is seen.
 */
async function watchTooltip(page: Page) {
  await page.evaluate(sel => {
    const w = window as unknown as {
      __toggles: number;
      __frames: Box[];
    };
    w.__toggles = 0;
    w.__frames = [];
    document.addEventListener(
      'toggle',
      event => {
        if ((event.target as Element).matches(sel)) {
          w.__toggles += 1;
        }
      },
      true,
    );
    const record = () => {
      const el = document.querySelector(sel);
      if (el?.matches(':popover-open')) {
        const r = el.getBoundingClientRect();
        w.__frames.push({
          top: r.top,
          bottom: r.bottom,
          left: r.left,
          right: r.right,
        });
      }
      requestAnimationFrame(record);
    };
    requestAnimationFrame(record);
  }, TOOLTIP);
}

/** The boxes recorded since frame `from`. */
async function framesFrom(page: Page, from = 0): Promise<Box[]> {
  return page.evaluate(
    start => (window as unknown as {__frames: Box[]}).__frames.slice(start),
    from,
  );
}

/**
 * Open the TallContent story at a viewport, scroll the trigger's centre to
 * `triggerY`, rest the pointer on the trigger and wait for the tooltip.
 * Returns how many times the tooltip toggled.
 */
async function hoverTallTrigger(
  page: Page,
  viewport: {width: number; height: number},
  triggerY: number,
  args = '',
) {
  await page.setViewportSize(viewport);
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-tooltip--tall-content&viewMode=story${args ? `&args=${args}` : ''}`,
  );
  await holdMotionStill(page);
  const trigger = page.getByRole('button', {name: 'Hover for details'});
  await expect(trigger).toBeVisible();
  await page.evaluate(
    ([sel, y]) => {
      const el = document.querySelector(sel as string) as HTMLElement;
      const r = el.getBoundingClientRect();
      window.scrollBy(0, r.top + r.height / 2 - (y as number));
    },
    [TRIGGER, triggerY],
  );
  await watchTooltip(page);
  const t = await rect(page, TRIGGER);
  await page.mouse.move((t.left + t.right) / 2, (t.top + t.bottom) / 2);
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toBeVisible();
  return {tooltip, trigger: t};
}

/**
 * Sample the open tooltip under a resting pointer: it stays open, never covers
 * the trigger, and stays inside the viewport. A resting hand still jitters, so
 * the pointer moves by one pixel between samples without leaving the trigger;
 * an engine only re-targets hover on pointer movement.
 */
async function expectStillAndClear(
  page: Page,
  trigger: Box,
  viewport: {width: number; height: number},
  fromFrame = 0,
) {
  const cx = (trigger.left + trigger.right) / 2;
  const cy = (trigger.top + trigger.bottom) / 2;
  let last: Box | null = null;
  for (let i = 0; i < 12; i++) {
    await page.mouse.move(cx + (i % 2), cy);
    await page.waitForTimeout(150);
    await expect(page.getByRole('tooltip')).toBeVisible();
    const s = await rect(page, TOOLTIP);
    expect(overlaps(s, trigger), `sample ${i} covers the trigger`).toBe(false);
    expect(s.top).toBeGreaterThanOrEqual(0);
    expect(s.left).toBeGreaterThanOrEqual(0);
    expect(s.bottom).toBeLessThanOrEqual(viewport.height);
    expect(s.right).toBeLessThanOrEqual(viewport.width);
    if (last != null) {
      expect(s).toEqual(last);
    }
    last = s;
  }
  // Opened once, never closed.
  expect(
    await page.evaluate(
      () => (window as unknown as {__toggles: number}).__toggles,
    ),
  ).toBe(1);
  // No frame, the first included, painted it over the trigger.
  const frames = await framesFrom(page, fromFrame);
  expect(frames.length).toBeGreaterThan(0);
  for (const [i, frame] of frames.entries()) {
    expect(overlaps(frame, trigger), `frame ${i} covers the trigger`).toBe(
      false,
    );
  }
  return last as Box;
}

/** The box scrolls its overflow, and the pointer can move in and scroll it. */
async function expectScrollsInside(page: Page) {
  const metrics = await page.evaluate(sel => {
    const el = document.querySelector(sel) as HTMLElement;
    return {scrollHeight: el.scrollHeight, clientHeight: el.clientHeight};
  }, TOOLTIP);
  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);

  const s = await rect(page, TOOLTIP);
  await page.mouse.move((s.left + s.right) / 2, (s.top + s.bottom) / 2, {
    steps: 4,
  });
  await page.mouse.wheel(0, 400);
  await expect
    .poll(async () =>
      page.evaluate(
        sel => (document.querySelector(sel) as HTMLElement).scrollTop,
        TOOLTIP,
      ),
    )
    .toBeGreaterThan(0);
  await page.waitForTimeout(300);
  await expect(page.getByRole('tooltip')).toBeVisible();
}

test('desktop: a tall tooltip opens beside its trigger and stays open', async ({
  page,
}) => {
  const viewport = {width: 1280, height: 720};
  const {trigger} = await hoverTallTrigger(page, viewport, 360);
  const s = await expectStillAndClear(page, trigger, viewport);
  // Beside the trigger, on the inline axis.
  expect(s.left >= trigger.right || s.right <= trigger.left).toBe(true);
  await expectScrollsInside(page);
});

test('phone: with no room beside, it opens below when below has more room', async ({
  page,
}) => {
  const viewport = {width: 390, height: 700};
  const {trigger} = await hoverTallTrigger(page, viewport, 200);
  const s = await expectStillAndClear(page, trigger, viewport);
  expect(s.top).toBeGreaterThanOrEqual(trigger.bottom);
  await expectScrollsInside(page);
});

test('phone: with no room beside, it opens above when above has more room', async ({
  page,
}) => {
  const viewport = {width: 390, height: 700};
  const {trigger} = await hoverTallTrigger(page, viewport, 500);
  const s = await expectStillAndClear(page, trigger, viewport);
  expect(s.bottom).toBeLessThanOrEqual(trigger.top);
  await expectScrollsInside(page);
});

test('a tooltip that fits above still opens above, unscrolled', async ({
  page,
}) => {
  await page.setViewportSize({width: 900, height: 600});
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-tooltip--tall-content&viewMode=story&args=content:A+short+tooltip`,
  );
  await holdMotionStill(page);
  const trigger = page.getByRole('button', {name: 'Hover for details'});
  await trigger.scrollIntoViewIfNeeded();
  await trigger.hover();
  await expect(page.getByRole('tooltip')).toBeVisible();
  const t = await rect(page, TRIGGER);
  const s = await rect(page, TOOLTIP);
  expect(s.bottom).toBeLessThanOrEqual(t.top);
  const metrics = await page.evaluate(sel => {
    const el = document.querySelector(sel) as HTMLElement;
    return {scrollHeight: el.scrollHeight, clientHeight: el.clientHeight};
  }, TOOLTIP);
  expect(metrics.scrollHeight).toBe(metrics.clientHeight);
});

test('a wheel over a tooltip that fits still scrolls the page', async ({
  page,
}) => {
  const viewport = {width: 900, height: 600};
  await hoverTallTrigger(page, viewport, 300, 'content:A+short+tooltip');
  const s = await rect(page, TOOLTIP);
  // The hover bridge keeps it open while the pointer is on its surface.
  await page.mouse.move((s.left + s.right) / 2, (s.top + s.bottom) / 2, {
    steps: 4,
  });
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 300);
  await expect
    .poll(async () => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(before);
  // It has no scroll range of its own, and it is still open.
  const metrics = await page.evaluate(sel => {
    const el = document.querySelector(sel) as HTMLElement;
    return {scrollHeight: el.scrollHeight, clientHeight: el.clientHeight};
  }, TOOLTIP);
  expect(metrics.scrollHeight).toBe(metrics.clientHeight);
  await expect(page.getByRole('tooltip')).toBeVisible();
});

test('content that grows while the tooltip is open never leaves it over its trigger', async ({
  page,
}) => {
  const viewport = {width: 1280, height: 720};
  const {trigger} = await hoverTallTrigger(
    page,
    viewport,
    360,
    'content:A+short+tooltip',
  );
  // It fits above, unscrolled.
  const s = await rect(page, TOOLTIP);
  expect(s.bottom).toBeLessThanOrEqual(trigger.top);
  // Record the tooltip's box from a ResizeObserver created now, after the
  // runtime's own: observers run in creation order after layout and before
  // paint, so this one sees the geometry the frame paints.
  await page.evaluate(sel => {
    const el = document.querySelector(sel) as HTMLElement;
    const w = window as unknown as {__settled: Box[]};
    w.__settled = [];
    const observer = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      w.__settled.push({
        top: r.top,
        bottom: r.bottom,
        left: r.left,
        right: r.right,
      });
    });
    observer.observe(el);
    if (el.firstElementChild) {
      observer.observe(el.firstElementChild);
    }
  }, TOOLTIP);
  // Let the observer deliver its initial report first.
  await page.evaluate(
    async () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  // Sixty more lines arrive while the pointer rests on the trigger.
  await page.evaluate(sel => {
    const content = document.querySelector(sel)?.firstElementChild;
    for (let i = 1; i <= 60; i++) {
      const line = document.createElement('div');
      line.textContent = `Line ${i} that arrived while the tooltip was open`;
      content?.appendChild(line);
    }
  }, TOOLTIP);
  await page.waitForTimeout(100);
  const settled = await page.evaluate(
    () => (window as unknown as {__settled: Box[]}).__settled,
  );
  // The first entry is the observer's initial report, before the growth.
  expect(settled.length).toBeGreaterThan(1);
  for (const [i, frame] of settled.entries()) {
    expect(overlaps(frame, trigger), `frame ${i} covers the trigger`).toBe(
      false,
    );
  }
  // A frame callback runs before the observers that settle a resize, so only
  // frames after the growth settled are compared here.
  await expectStillAndClear(
    page,
    trigger,
    viewport,
    (await framesFrom(page)).length,
  );
  await expectScrollsInside(page);
});

test('a held-open tooltip whose host moves keeps its trigger clear', async ({
  page,
}) => {
  await page.setViewportSize({width: 1280, height: 720});
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-tooltip--tall-content-moving-host&viewMode=story`,
  );
  await holdMotionStill(page);
  await watchTooltip(page);
  const trigger = page.getByRole('button', {name: 'Tall tooltip trigger'});
  await expect(page.getByRole('tooltip')).toBeVisible();
  const t = await trigger.boundingBox();
  if (t == null) {
    throw new Error('the trigger has no layout box');
  }
  const triggerBox = {
    top: t.y,
    bottom: t.y + t.height,
    left: t.x,
    right: t.x + t.width,
  };
  await page.evaluate(sel => {
    const el = document.querySelector(sel) as HTMLElement & {__first?: true};
    el.__first = true;
  }, TOOLTIP);
  expect(overlaps(await rect(page, TOOLTIP), triggerBox)).toBe(false);

  const start = (await framesFrom(page)).length;
  await page.getByRole('button', {name: "Move the tooltip's host"}).click();
  // The layer was hosted elsewhere and remounted as a new element.
  await expect
    .poll(async () =>
      page.evaluate(sel => {
        const el = document.querySelector(sel) as HTMLElement & {
          __first?: true;
        };
        return el != null && el.__first !== true;
      }, TOOLTIP),
    )
    .toBe(true);
  await page.waitForTimeout(200);
  const moved = await framesFrom(page, start);
  expect(moved.length).toBeGreaterThan(0);
  for (const [i, frame] of moved.entries()) {
    expect(overlaps(frame, triggerBox), `frame ${i} covers the trigger`).toBe(
      false,
    );
  }
  expect(overlaps(await rect(page, TOOLTIP), triggerBox)).toBe(false);
});

test('a trigger that moves in layout while its tooltip is open, without resizing or scrolling, is kept clear', async ({
  page,
}) => {
  await page.setViewportSize({width: 1280, height: 720});
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-tooltip--tall-content&viewMode=story&args=content:A+short+tooltip`,
  );
  await holdMotionStill(page);
  const trigger = page.getByRole('button', {name: 'Hover for details'});
  await expect(trigger).toBeVisible();
  // The trigger's top at 650px, near the bottom of a 720px viewport.
  await page.evaluate(sel => {
    const el = document.querySelector(sel) as HTMLElement;
    window.scrollBy(0, el.getBoundingClientRect().top - 650);
  }, TRIGGER);
  // Opened from the keyboard, so no pointer is involved.
  await trigger.focus();
  await expect(page.getByRole('tooltip')).toBeVisible();
  // Its content becomes 368px tall: it still fits above the trigger.
  await page.evaluate(sel => {
    const content = document.querySelector(sel)?.firstElementChild;
    for (let i = 1; i <= 17; i++) {
      const line = document.createElement('div');
      line.textContent = `Line ${i}`;
      content?.appendChild(line);
    }
  }, TOOLTIP);
  await page.waitForTimeout(200);
  const before = await rect(page, TRIGGER);
  expect(overlaps(await rect(page, TOOLTIP), before)).toBe(false);
  const scrollY = await page.evaluate(() => window.scrollY);

  // The same-size trigger moves up to 340px in layout. Nothing resizes or
  // scrolls; now the tooltip fits neither above nor below it.
  await page.evaluate(sel => {
    (document.querySelector(sel) as HTMLElement).style.marginBlockStart =
      '-620px';
  }, TRIGGER);
  await page.waitForTimeout(300);
  const after = await rect(page, TRIGGER);
  expect(Math.round(after.top)).toBe(Math.round(before.top) - 310);
  expect(after.bottom - after.top).toBe(before.bottom - before.top);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  await expect(page.getByRole('tooltip')).toBeVisible();
  expect(overlaps(await rect(page, TOOLTIP), after)).toBe(false);
});
