// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NumberInputStepperLook.interaction.browser.spec.ts
 * @input The built "With Number Steppers" NumberInput story on a phone-sized
 *   touch screen (a coarse pointer, as on iOS and Android) and with a mouse,
 *   real touch input and the interaction harness
 * @output Proofs for the steppers' touch presentation, against UIStepper's
 *   measured shape (motion/uikit/stepper.ts `look`): one 94 px wide capsule
 *   beside the field at its inline end, at the field size's element height
 *   (md: UIKit's 32), − at the inline start and + at the inline end
 *   (mirrored in a right-to-left page), a divider 4 px from the top and the
 *   bottom, 13pt glyphs with 1.67pt strokes; at the maximum the +
 *   glyph takes the divider colour and the + half does nothing; the touched
 *   half darkens in the touch-down frame and only that half; taps and a
 *   slide across the divider step the right half; with a mouse the column
 *   stays in the field; storyboards of the control
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
const STATUS_STORY = 'core-numberinput--error-status';

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

/** Opens the story: under a finger in the phone profile, or with a mouse in a desktop context. */
/**
 * A tap steps on the browser's click after its lift (`spec:AST-094` FR11).
 * Playwright's WebKit (Linux build) dispatched no click for an injected tap
 * on this story, so a proof that needs the click runs in Chromium and on the
 * iOS simulator.
 */
const WEBKIT_TAP_CLICK_SKIP =
  "Playwright's WebKit dispatches no click after an injected tap on this story (measured), and a tap steps on its click (spec:AST-094 FR11); proven in Chromium and on the iOS simulator";

async function open(
  page: Page,
  globals: Record<string, string> = {},
  args: Record<string, string> = {},
  {story = STORY}: {story?: string} = {},
): Promise<void> {
  const params = new URLSearchParams({id: story, viewMode: 'story'});
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
  await page.getByRole('spinbutton').first().waitFor();
  await frames(page, 2);
}

/**
 * Sets the open story's args through Storybook's preview channel: URL args
 * keep only what the story's argTypes declare, and `width` is not one.
 */
async function setArgs(
  page: Page,
  story: string,
  args: Record<string, unknown>,
): Promise<void> {
  await page.evaluate(
    ([id, json]) => {
      const channel = (
        window as unknown as {
          __STORYBOOK_ADDONS_CHANNEL__?: {
            emit: (event: string, payload: unknown) => void;
          };
        }
      ).__STORYBOOK_ADDONS_CHANNEL__;
      if (channel == null) {
        throw new Error('no Storybook preview channel');
      }
      channel.emit('updateStoryArgs', {
        storyId: id,
        updatedArgs: JSON.parse(json) as unknown,
      });
    },
    [story, JSON.stringify(args)],
  );
  await frames(page, 3);
  await frames(page, 2);
}

interface Boxes {
  fieldBox: {left: number; right: number};
  inputBox: {left: number; right: number};
  input: {width: number};
  steppers: {left: number; right: number; position: string};
  status: {left: number; right: number} | null;
}

/** The Field box, the input box, the input, the steppers and an attached status. */
const readBoxes = async (page: Page): Promise<Boxes> =>
  page.evaluate(() => {
    const edges = (el: Element) => {
      const r = el.getBoundingClientRect();
      return {left: r.left, right: r.right};
    };
    const input = document.querySelector('[role="spinbutton"]');
    const plus = document.querySelector('[aria-label^="Increment"]');
    if (input == null || plus == null) {
      throw new Error('no stepper field');
    }
    const steppers = plus.parentElement as HTMLElement;
    const inputBox = input.parentElement as HTMLElement;
    let fieldBox: Element | null = inputBox;
    while (fieldBox != null && fieldBox.querySelector('label') == null) {
      fieldBox = fieldBox.parentElement;
    }
    if (fieldBox == null) {
      throw new Error('no Field box');
    }
    const status = (input.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .map(id => (id === '' ? null : document.getElementById(id)))
      .find(el => el != null && el.closest('label') == null);
    return {
      fieldBox: edges(fieldBox),
      inputBox: edges(inputBox),
      input: {width: input.getBoundingClientRect().width},
      steppers: {
        ...edges(steppers),
        position: getComputedStyle(steppers).position,
      },
      status: status == null ? null : edges(status),
    };
  });

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
        // Each half's glyph: a ::before box masked with UIKit's vector glyph.
        const glyph = getComputedStyle(half, '::before');
        const drawn = glyph.content !== 'none' && glyph.content !== 'normal';
        const mask =
          glyph.getPropertyValue('mask-image') ||
          glyph.getPropertyValue('-webkit-mask-image');
        const stroke = /stroke-width(?:=|%3D)(?:'|%27)([\d.]+)/.exec(mask);
        return {
          w: drawn ? Number.parseFloat(glyph.width) : 0,
          h: drawn ? Number.parseFloat(glyph.height) : 0,
          stroke: drawn ? (stroke?.[1] ?? null) : null,
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

/** The committed value (aria-valuenow). */
const valueOf = async (page: Page) =>
  Number(
    await page
      .getByRole('spinbutton', {name: 'Quantity'})
      .getAttribute('aria-valuenow'),
  );

/** The value the field shows: a press's own while it lasts. */
const shownOf = async (page: Page) =>
  Number(await page.getByRole('spinbutton', {name: 'Quantity'}).inputValue());

test('under a finger the steppers are one 94 × 32 capsule beside the field', async ({
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

test('in a right-to-left page the capsule sits at the inline end and mirrors: + at the inline end (left), − at the inline start', async ({
  page,
}) => {
  await open(page, {direction: 'rtl'});
  const layout = await readLayout(page);
  expect(layout.field.x - (layout.control.x + layout.control.w)).toBeCloseTo(
    8,
    0,
  );
  expect(layout.plus.x).toBeLessThan(layout.minus.x);
  expect(layout.plus.x).toBeCloseTo(layout.control.x, 0);
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
  test.skip(driver.engine === 'webkit', WEBKIT_TAP_CLICK_SKIP);
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
      const value = await shownOf(page);
      if (seen.at(-1) !== value) {
        seen.push(value);
      }
      await page.waitForTimeout(40);
    }
  })();
  await driver.play([
    {t: 0, fingers: [{id: 0, ...minus}]},
    ...moves(minus, plus, 600, 700),
    {t: 1100, fingers: []},
  ]);
  await watching;
  // − at 0.5 s (2 → 1), then + on the same ramp at 750 and 975 ms; one
  // commit, at the lift.
  expect(seen).toEqual([2, 1, 2, 3]);
  expect(await valueOf(page)).toBe(3);
});

test('under a finger each half of the capsule keeps its own size, 47 × 32, with no touch-target growth', async ({
  page,
}) => {
  await open(page);
  const layout = await readLayout(page);
  expect(layout.plus.w).toBeCloseTo(47, 0);
  expect(layout.plus.h).toBeCloseTo(32, 0);
  const hits = await page.evaluate(
    ({control}) => {
      const capsule = document.querySelector(
        '[aria-label^="Increment"]',
      )?.parentElement;
      const at = (x: number, y: number) => {
        const element = document.elementFromPoint(x, y);
        return element != null && capsule?.contains(element) === true;
      };
      const x = control.x + control.w * 0.75;
      return {
        inside: at(x, control.y + control.h / 2),
        above: at(x, control.y - 2),
        below: at(x, control.y + control.h + 2),
      };
    },
    {control: layout.control},
  );
  expect(hits).toEqual({inside: true, above: false, below: false});
});

for (const direction of ['ltr', 'rtl'] as const) {
  test(`a pressed half keeps the capsule's rounded outer corners (${direction})`, async ({
    page,
  }) => {
    await open(page, {direction});
    const radii = await page.evaluate(() => {
      const read = (selector: string) => {
        const half = document.querySelector(selector);
        if (half == null) {
          throw new Error(`no ${selector}`);
        }
        const style = getComputedStyle(half);
        return [
          style.borderTopLeftRadius,
          style.borderTopRightRadius,
          style.borderBottomRightRadius,
          style.borderBottomLeftRadius,
        ].join(' ');
      };
      return {
        minus: read('[aria-label^="Decrement"]'),
        plus: read('[aria-label^="Increment"]'),
      };
    });
    // Each half rounds its outer corners: − at the inline start, + at the
    // inline end, so they swap sides in a right-to-left page (the browser
    // clamps 9999px to half the height: a capsule).
    const start = '9999px 0px 0px 9999px';
    const end = '0px 9999px 9999px 0px';
    expect(radii).toEqual(
      direction === 'ltr'
        ? {minus: start, plus: end}
        : {minus: end, plus: start},
    );
  });
}

test("at each field size the capsule takes the size's element height (28, 32, 36), 94 wide, centred on the field", async ({
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
    expect(layout.control.h, size).toBeCloseTo(height, 0);
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

test("under forced colors the glyphs, the divider and the capsule's edge stay visible", async ({
  page,
}) => {
  // Windows High Contrast and the like: backgrounds turn Canvas.
  await page.emulateMedia({forcedColors: 'active'});
  await open(page, {}, {value: '10'});
  const colors = await page.evaluate(() => {
    const control = document.querySelector('[aria-label^="Increment"]')
      ?.parentElement as HTMLElement;
    const plus = control.querySelector('[aria-label^="Increment"]') as Element;
    const minus = control.querySelector('[aria-label^="Decrement"]') as Element;
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'Canvas';
    document.body.append(probe);
    const canvas = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return {
      canvas,
      minusGlyph: getComputedStyle(minus, '::before').backgroundColor,
      plusGlyph: getComputedStyle(plus, '::before').backgroundColor,
      divider: getComputedStyle(control, '::after').backgroundColor,
      edge: getComputedStyle(control).outlineStyle,
    };
  });
  expect(colors.minusGlyph).not.toBe(colors.canvas);
  expect(colors.divider).not.toBe(colors.canvas);
  // + is at its bound: GrayText, apart from the live glyph's CanvasText.
  expect(colors.plusGlyph).not.toBe(colors.canvas);
  expect(colors.plusGlyph).not.toBe(colors.minusGlyph);
  expect(colors.edge).toBe('solid');
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

test('in a field too narrow for the control the steppers stay in its box', async ({
  page,
}) => {
  // A quantity field sized to 96 px (the checkout-wizard template) cannot hold
  // the control (94 px and a gap) beside a usable box: the column stays inside.
  await open(page);
  for (const width of [96, '96px']) {
    await setArgs(page, STORY, {width});
    // In the box, with no positioning of its own (no touch-target growth).
    await expect
      .poll(async () => (await readBoxes(page)).steppers.position)
      .toBe('static');
    const boxes = await readBoxes(page);
    expect(boxes.input.width).toBeGreaterThanOrEqual(40);
    expect(boxes.steppers.right).toBeLessThanOrEqual(
      boxes.fieldBox.right + 0.5,
    );
  }
  // Wide enough again, the control is back beside the box.
  await setArgs(page, STORY, {width: 240});
  await expect
    .poll(async () => (await readBoxes(page)).steppers.position)
    .toBe('absolute');
});

test('an attached status ends where the input box ends, clear of the control', async ({
  page,
}) => {
  await open(page, {}, {}, {story: STATUS_STORY});
  await setArgs(page, STATUS_STORY, {hasNumberSteppers: true});
  const boxes = await readBoxes(page);
  expect(boxes.steppers.position).toBe('absolute');
  if (boxes.status == null) {
    throw new Error('no attached status');
  }
  expect(Math.abs(boxes.status.right - boxes.inputBox.right)).toBeLessThan(1);
  expect(boxes.steppers.left).toBeGreaterThan(boxes.status.right);
  expect(boxes.steppers.right).toBeLessThanOrEqual(boxes.fieldBox.right + 0.5);
});

test('with a mouse every base style survives the touch styles (computed)', async ({
  browser,
}) => {
  // Without the touch key the touch styles must change nothing: each default is
  // a value, never null, which would erase a style merged before it.
  const context = await browser.newContext({
    viewport: {width: 402, height: 714},
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  await open(page);
  // A mouse: this context has no coarse pointer.
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
  const computed = await page.evaluate(() => {
    const plus = document.querySelector(
      'button[aria-label^="Increment"]',
    ) as HTMLElement;
    const column = plus.parentElement as HTMLElement;
    const wrapper = column.parentElement as HTMLElement;
    const icons = [plus, plus.nextElementSibling as HTMLElement].map(half => {
      const svg = half.querySelector('svg');
      return getComputedStyle(svg?.parentElement as Element).display;
    });
    const css = (el: Element, prop: string) =>
      getComputedStyle(el).getPropertyValue(prop);
    return {
      icons,
      columnPosition: css(column, 'position'),
      columnBackground: css(column, 'background-color'),
      afterContent: getComputedStyle(column, '::after').content,
      wrapperMargin: css(wrapper, 'margin-inline-end'),
    };
  });
  expect(computed).toEqual({
    // Icon's own inline-flex, blockified as the button's flex item (an erased
    // display would fall back to inline and compute as block).
    icons: ['flex', 'flex'],
    columnPosition: 'static',
    columnBackground: 'rgba(0, 0, 0, 0)',
    afterContent: 'none',
    wrapperMargin: '0px',
  });
  await context.close();
});

test('with a mouse the column stays inside the field', async ({browser}) => {
  const context = await browser.newContext({
    viewport: {width: 402, height: 714},
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  await open(page);
  // A mouse: this context has no coarse pointer.
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
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

/** Starts one take's clock on the page: the moment of its first touch. */
const armTouchClock = async (page: Page) =>
  page.evaluate(() => {
    const take = window as unknown as {takeDown?: number | null};
    take.takeDown = null;
    document.addEventListener(
      'touchstart',
      () => {
        take.takeDown ??= performance.now();
      },
      {capture: true, passive: true},
    );
  });

/**
 * Waits on the page's own clock until `at` ms after the take's first touch,
 * so the host's load cannot move a moment onto the next step.
 */
const untilPage = async (page: Page, at: number) =>
  page.evaluate(
    async after =>
      new Promise<void>(resolve => {
        const take = window as unknown as {takeDown?: number | null};
        const tick = () => {
          if (
            take.takeDown != null &&
            performance.now() - take.takeDown >= after
          ) {
            resolve();
          } else {
            requestAnimationFrame(tick);
          }
        };
        tick();
      }),
    at,
  );

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
        value: await shownOf(page),
        pressed: (await pressed(page)).map(image =>
          image === 'none' ? '-' : 'on',
        ),
      });
      await board.capture('rest', -1, await data());
      const minus = center(layout.minus);
      const plus = center(layout.plus);
      await armTouchClock(page);
      const playing = driver.play([
        {t: 0, fingers: [{id: 0, ...plus}]},
        ...moves(plus, minus, 780, 840),
        {t: 1250, fingers: []},
      ]);
      for (const [at, label] of [
        [150, '+ pressed'],
        [620, '+ steps at 0.5 s'],
        [900, 'slid onto −'],
        [1080, '− steps on the beat'],
      ] as const) {
        await untilPage(page, at);
        await board.capture(label, at, await data());
      }
      await playing;
      await page.waitForTimeout(150);
      await board.capture('lifted', 1400, await data());
      await board.write(testInfo);
      const values = board.frames.map(f => Number(f.data.value));
      const paints = board.frames.map(f =>
        (f.data.pressed as string[]).join(' '),
      );
      // + steps at 500 and 750 ms, the finger slides at 0.8 s, − steps at 975
      // and 1177.5 ms.
      expect(values).toEqual([2, 2, 3, 4, 3, 2]);
      expect(paints).toEqual(['- -', '- on', '- on', 'on -', 'on -', '- -']);
    }
  },
);
