// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInputStepperLook.interaction.browser.spec.ts
 * @input The built "With Number Steppers" NumberInput story on a phone-sized
 *   touch screen (and once with a mouse), real touch input and the
 *   interaction harness
 * @output Proofs for the steppers' touch presentation, against UIStepper's
 *   measured shape (motion/uikit/stepper.ts `look`): one 94 x 32 capsule
 *   beside the field at its inline end, − on the left and + on the right in
 *   both writing directions, a 1 x 24 divider, 13pt glyphs with 1.67pt
 *   strokes; the same control at every field size; at the maximum the +
 *   glyph takes the divider colour and the + half does nothing; the touched
 *   half darkens in the touch-down frame and only that half; taps and a slide across the divider step the right half; with a
 *   mouse the column stays in the field; storyboards of the control
 * @position NumberInput's touch-presentation proofs, beside
 *   NumberInputStepperHold.interaction.browser.spec.ts (the press timing)
 */

import {expect, test, type Page} from '@playwright/test';
import {
  frames,
  Storyboard,
  touchDriver,
  withStorybook,
  type Point,
  type TouchFrame,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);
const STORY = 'core-numberinput--with-number-steppers';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Layout {
  field: Box;
  control: Box;
  minus: Box;
  plus: Box;
  divider: {width: string; height: string; top: string; left: string};
  glyphs: {w: number; h: number; stroke: string | null}[];
  chevrons: string[];
}

async function open(
  page: Page,
  globals: Record<string, string> = {},
  args: Record<string, string> = {},
): Promise<void> {
  const params = new URLSearchParams({id: STORY, viewMode: 'story'});
  const join = (pairs: Record<string, string>) =>
    Object.entries(pairs)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  if (Object.keys(globals).length > 0) {
    params.set('globals', join(globals));
  }
  if (Object.keys(args).length > 0) {
    params.set('args', join(args));
  }
  await page.goto(`${storybook()}/iframe.html?${params.toString()}`);
  await page.getByRole('spinbutton', {name: 'Quantity'}).waitFor();
  await frames(page, 2);
}

const readLayout = async (page: Page): Promise<Layout> =>
  page.evaluate(() => {
    const box = (el: Element) => {
      const r = el.getBoundingClientRect();
      return {x: r.x, y: r.y, w: r.width, h: r.height};
    };
    const plus = document.querySelector('[aria-label^="Increment"]');
    const minus = document.querySelector('[aria-label^="Decrement"]');
    if (plus == null || minus == null) {
      throw new Error('no steppers');
    }
    const control = plus.parentElement as HTMLElement;
    const field = control.parentElement as HTMLElement;
    const after = getComputedStyle(control, '::after');
    return {
      field: box(field),
      control: box(control),
      minus: box(minus),
      plus: box(plus),
      divider: {
        width: after.width,
        height: after.height,
        top: after.top,
        left: after.left,
      },
      glyphs: [minus, plus].map(half => {
        const svg = half.querySelector('svg[viewBox="0 0 13 13"]');
        const r = svg?.getBoundingClientRect();
        return {
          w: r?.width ?? 0,
          h: r?.height ?? 0,
          stroke:
            svg?.querySelector('path')?.getAttribute('stroke-width') ?? null,
        };
      }),
      chevrons: [minus, plus].map(
        half => getComputedStyle(half.firstElementChild as Element).display,
      ),
    };
  });

const center = (b: Box): Point => ({x: b.x + b.w / 2, y: b.y + b.h / 2});

const pressed = async (page: Page) =>
  page.evaluate(() =>
    ['Decrement', 'Increment'].map(name => {
      const half = document.querySelector(`[aria-label^="${name}"]`);
      return half == null ? null : getComputedStyle(half).backgroundImage;
    }),
  );

/** Moves from `from` to `to` between `t0` and `t1` at 60 Hz. */
function moves(from: Point, to: Point, t0: number, t1: number): TouchFrame[] {
  const count = Math.max(1, Math.round(((t1 - t0) / 1000) * 60));
  return Array.from({length: count}, (_, i) => {
    const p = (i + 1) / count;
    return {
      t: t0 + (t1 - t0) * p,
      fingers: [
        {
          id: 0,
          x: from.x + (to.x - from.x) * p,
          y: from.y + (to.y - from.y) * p,
        },
      ],
    };
  });
}

/**
 * Turns the page's own panning off. Chromium's touch emulation takes even a
 * sideways drag on a page that cannot pan sideways, cancelling the press;
 * Mobile Safari keeps such a touch on the page (the simulator evidence). With
 * panning off, the slide across the divider is seen in either engine.
 */
const keepTouchInPage = async (page: Page) =>
  page.evaluate(() => {
    document.documentElement.style.touchAction = 'none';
  });

const valueOf = async (page: Page) =>
  Number(
    await page
      .getByRole('spinbutton', {name: 'Quantity'})
      .getAttribute('aria-valuenow'),
  );

test('on a touch screen the steppers are one 94 × 32 capsule beside the field', async ({
  page,
}) => {
  await open(page);
  const layout = await readLayout(page);
  expect(layout.control.w).toBeCloseTo(94, 0);
  expect(layout.control.h).toBeCloseTo(32, 0);
  // 8px past the field's inline end, centred on it.
  expect(layout.control.x - (layout.field.x + layout.field.w)).toBeCloseTo(
    8,
    0,
  );
  expect(layout.control.y + layout.control.h / 2).toBeCloseTo(
    layout.field.y + layout.field.h / 2,
    0,
  );
  // − on the left, + on the right, 47px each.
  expect(layout.minus.x).toBeCloseTo(layout.control.x, 0);
  expect(layout.plus.x).toBeCloseTo(layout.control.x + 47, 0);
  expect(layout.minus.w).toBeCloseTo(47, 0);
  expect(layout.plus.w).toBeCloseTo(47, 0);
  expect(layout.divider).toEqual({
    width: '1px',
    height: '24px',
    top: '4px',
    left: '46.5px',
  });
  expect(layout.glyphs).toEqual([
    {w: 13, h: 13, stroke: '1.67'},
    {w: 13, h: 13, stroke: '1.67'},
  ]);
  expect(layout.chevrons).toEqual(['none', 'none']);
});

test('in a right-to-left page the capsule sits at the inline end and keeps − on the left', async ({
  page,
}) => {
  await open(page, {direction: 'rtl'});
  const layout = await readLayout(page);
  expect(layout.field.x - (layout.control.x + layout.control.w)).toBeCloseTo(
    8,
    0,
  );
  expect(layout.minus.x).toBeLessThan(layout.plus.x);
  expect(layout.minus.x).toBeCloseTo(layout.control.x, 0);
});

test('the touched half darkens in the touch-down frame, and only that half', async ({
  page,
}) => {
  await open(page);
  const layout = await readLayout(page);
  const driver = await touchDriver(page);
  const states: (string | null)[][] = [await pressed(page)];
  await driver.play(
    [
      {t: 0, fingers: [{id: 0, ...center(layout.plus)}]},
      {t: 200, fingers: []},
    ],
    {
      onEvent: async step => {
        await frames(page, 1);
        states.push([step.type, ...(await pressed(page))]);
      },
    },
  );
  const [rest, down, up] = states;
  expect(rest).toEqual(['none', 'none']);
  expect(down[0]).toBe('touchStart');
  expect(down[1]).toBe('none');
  expect(down[2]).not.toBe('none');
  expect(up).toEqual(['touchEnd', 'none', 'none']);
});

test('a tap on the left half steps down, on the right half up', async ({
  page,
}) => {
  await open(page);
  const layout = await readLayout(page);
  const driver = await touchDriver(page);
  await driver.tap(center(layout.minus));
  await expect.poll(async () => valueOf(page)).toBe(1);
  await driver.tap(center(layout.plus));
  await expect.poll(async () => valueOf(page)).toBe(2);
});

test('a slide across the divider carries the repeat to the other half', async ({
  page,
}) => {
  await open(page);
  await keepTouchInPage(page);
  const layout = await readLayout(page);
  const driver = await touchDriver(page);
  const minus = center(layout.minus);
  const plus = center(layout.plus);
  const seen: number[] = [];
  const watching = (async () => {
    for (let i = 0; i < 40; i += 1) {
      const value = await valueOf(page);
      if (seen.at(-1) !== value) {
        seen.push(value);
      }
      await page.waitForTimeout(40);
    }
  })();
  await driver.play([
    {t: 0, fingers: [{id: 0, ...minus}]},
    ...moves(minus, plus, 600, 700),
    {t: 1600, fingers: []},
  ]);
  await watching;
  // − at 0.5 s (2 → 1), then + on the same beat at 1 and 1.5 s.
  expect(seen).toEqual([2, 1, 2, 3]);
});

test('at every field size the capsule stays 94 × 32, centred on the field', async ({
  page,
}) => {
  // UIStepper is 32pt tall whatever surrounds it; the field keeps its own
  // height (28, 32, 36).
  const heights = {sm: 28, md: 32, lg: 36} as const;
  for (const [size, height] of Object.entries(heights)) {
    await open(page, {}, {size});
    const layout = await readLayout(page);
    expect(layout.field.h, size).toBeCloseTo(height, 0);
    expect(layout.control.w, size).toBeCloseTo(94, 0);
    expect(layout.control.h, size).toBeCloseTo(32, 0);
    expect(layout.control.y + layout.control.h / 2, size).toBeCloseTo(
      layout.field.y + layout.field.h / 2,
      0,
    );
    expect(
      layout.control.x - (layout.field.x + layout.field.w),
      size,
    ).toBeCloseTo(8, 0);
  }
});

test('at the maximum the + glyph takes the divider colour and the + half does nothing', async ({
  page,
}) => {
  await open(page, {}, {value: '10'});
  const layout = await readLayout(page);
  const colors = await page.evaluate(() => {
    const control = document.querySelector('[aria-label^="Increment"]')
      ?.parentElement as HTMLElement;
    return {
      plus: getComputedStyle(
        control.querySelector('[aria-label^="Increment"]') as Element,
      ).color,
      minus: getComputedStyle(
        control.querySelector('[aria-label^="Decrement"]') as Element,
      ).color,
      divider: getComputedStyle(control, '::after').backgroundColor,
    };
  });
  expect(colors.plus).toBe(colors.divider);
  expect(colors.minus).not.toBe(colors.divider);
  const driver = await touchDriver(page);
  await driver.tap(center(layout.plus));
  await page.waitForTimeout(300);
  expect(await valueOf(page)).toBe(10);
  expect(await pressed(page)).toEqual(['none', 'none']);
});

test('with a mouse the column stays inside the field', async ({browser}) => {
  const context = await browser.newContext({
    viewport: {width: 402, height: 714},
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  await open(page);
  const layout = await readLayout(page);
  expect(layout.control.w).toBeCloseTo(16, 0);
  expect(layout.control.x + layout.control.w).toBeCloseTo(
    layout.field.x + layout.field.w - 1,
    0,
  );
  expect(layout.plus.y).toBeLessThan(layout.minus.y);
  expect(layout.glyphs.map(g => g.w)).toEqual([0, 0]);
  await context.close();
});

test(
  'storyboard: the touch control at rest, pressed, held and slid',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    for (const mode of ['light', 'dark'] as const) {
      await open(page, {colorMode: mode});
      await keepTouchInPage(page);
      const layout = await readLayout(page);
      const clip = {
        x: Math.floor(layout.field.x - 8),
        y: Math.floor(layout.field.y - 36),
        width: Math.ceil(
          layout.control.x + layout.control.w + 8 - (layout.field.x - 8),
        ),
        height: Math.ceil(layout.field.h + 44),
      };
      const board = new Storyboard(page, {
        name: `numberinput-stepper-control-${mode}`,
        clip,
        columns: 5,
        cellScale: 1,
      });
      const driver = await touchDriver(page);
      const data = async () => ({
        value: await valueOf(page),
        pressed: (await pressed(page)).map(image =>
          image === 'none' ? '-' : 'on',
        ),
      });
      await board.capture('rest', -1, await data());
      const minus = center(layout.minus);
      const plus = center(layout.plus);
      const started = Date.now();
      const playing = driver.play([
        {t: 0, fingers: [{id: 0, ...plus}]},
        ...moves(plus, minus, 1100, 1200),
        {t: 1800, fingers: []},
      ]);
      for (const [at, label] of [
        [150, '+ pressed'],
        [700, '+ steps at 0.5 s'],
        [1400, 'slid onto −'],
        [1700, '− steps on the beat'],
      ] as const) {
        await page.waitForTimeout(Math.max(0, at - (Date.now() - started)));
        await board.capture(label, at, await data());
      }
      await playing;
      await page.waitForTimeout(150);
      await board.capture('lifted', 1950, await data());
      await board.write(testInfo);
      const values = board.frames.map(f => f.data.value);
      const paints = board.frames.map(f =>
        (f.data.pressed as string[]).join(' '),
      );
      // + steps at 0.5 and 1 s, the finger slides at 1.1 s, − steps at 1.5 s.
      expect(values).toEqual([2, 2, 3, 4, 3, 3]);
      expect(paints).toEqual(['- -', '- on', '- on', 'on -', 'on -', '- -']);
    }
  },
);
