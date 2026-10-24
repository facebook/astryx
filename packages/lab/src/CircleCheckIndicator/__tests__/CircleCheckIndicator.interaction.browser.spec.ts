// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CircleCheckIndicator.interaction.browser.spec.ts
 * @input The built Lab CircleCheckIndicator "Mapped Checkbox List" story (a
 *   theme maps the circle to `checkbox`), real touch input (Chromium CDP /
 *   WebKit's tap) and the interaction harness
 * @output Proofs that under a finger the circle changes in the frame the
 *   selection lands, as iOS's selection marks do (motion/uikit/selection.ts):
 *   no transition is created, the first style computed after the change is
 *   the final one, and every animation frame of a tap shows the circle wholly
 *   empty or wholly filled (storyboard); the row keeps its checkbox semantics;
 *   a mouse keeps the theme's fade (the negative control)
 * @position Real-engine layer of CircleCheckIndicator; the stylesheet layer
 *   is circleCheck.test.tsx
 */

import {expect, test, type Page} from '@playwright/test';
import {
  castStoryboard,
  frames,
  openStory,
  startScreencast,
  touchDriver,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

const STORY = 'lab-circlecheckindicator--mapped-checkbox-list';

/** What the page saw in the microtask after the circle's class changed. */
interface CircleRead {
  first: string;
  transitions: {property: string; duration: number}[];
}

/** The circle of the row labelled `name`. */
const CIRCLE = '.astryx-circle-check-indicator';

async function watchCircle(page: Page, name: string): Promise<void> {
  await page.getByRole('checkbox', {name}).evaluate(
    (input, {selector, key}) => {
      const circle = input
        .closest('li, .astryx-item')
        ?.querySelector<HTMLElement>(selector);
      if (circle == null) {
        throw new Error(`no circle for ${key}`);
      }
      const reads = ((
        window as unknown as Record<string, unknown>
      ).__c06circles ??= {}) as Record<string, unknown>;
      const observer = new MutationObserver(() => {
        if (reads[key] != null) {
          return;
        }
        reads[key] = {
          first: getComputedStyle(circle).backgroundColor,
          transitions: circle
            .getAnimations()
            .filter(animation => 'transitionProperty' in animation)
            .map(animation => ({
              property: (animation as CSSTransition).transitionProperty,
              duration: Number(animation.effect?.getTiming().duration ?? 0),
            })),
        };
        observer.disconnect();
      });
      observer.observe(circle, {attributes: true, attributeFilter: ['class']});
    },
    {selector: CIRCLE, key: name},
  );
}

async function readCircle(page: Page, name: string): Promise<CircleRead> {
  await page.waitForFunction(
    key =>
      ((window as unknown as Record<string, Record<string, unknown>>)
        .__c06circles ?? {})[key] != null,
    name,
  );
  return page.evaluate(
    key =>
      (window as unknown as Record<string, Record<string, CircleRead>>)
        .__c06circles[key],
    name,
  );
}

async function circleColour(page: Page, name: string): Promise<string> {
  return page.getByRole('checkbox', {name}).evaluate((input, selector) => {
    const circle = input.closest('li, .astryx-item')?.querySelector(selector);
    if (circle == null) {
      throw new Error('no circle');
    }
    return getComputedStyle(circle).backgroundColor;
  }, CIRCLE);
}

async function centreOf(page: Page, name: string) {
  const box = await page.getByRole('checkbox', {name}).evaluate(input => {
    const row = input.closest('li, .astryx-item');
    if (row == null) {
      throw new Error('no row');
    }
    const r = row.getBoundingClientRect();
    return {x: r.x + r.width / 2, y: r.y + r.height / 2};
  });
  return {x: Math.round(box.x), y: Math.round(box.y)};
}

/** The circle's background on every animation frame for `ms`. */
async function traceCircle(
  page: Page,
  name: string,
  ms: number,
): Promise<{t: number; colour: string}[]> {
  return page.getByRole('checkbox', {name}).evaluate(
    async (input, {selector, ms}) => {
      const circle = input.closest('li, .astryx-item')?.querySelector(selector);
      if (circle == null) {
        throw new Error('no circle');
      }
      const samples: {t: number; colour: string}[] = [];
      const end = performance.now() + ms;
      return new Promise<{t: number; colour: string}[]>(resolve => {
        const tick = () => {
          samples.push({
            t: Date.now(),
            colour: getComputedStyle(circle).backgroundColor,
          });
          if (performance.now() < end) {
            requestAnimationFrame(tick);
          } else {
            resolve(samples);
          }
        };
        requestAnimationFrame(tick);
      });
    },
    {selector: CIRCLE, ms},
  );
}

test.describe('CircleCheckIndicator under a finger', () => {
  test('a tap fills the circle in the frame the selection lands, and the row stays a checkbox', async ({
    page,
  }) => {
    await openStory(page, storybook(), STORY);
    await watchCircle(page, 'Mountains');
    const driver = await touchDriver(page);
    await driver.tap(await centreOf(page, 'Mountains'));
    await expect(page.getByRole('checkbox', {name: 'Mountains'})).toBeChecked();
    const read = await readCircle(page, 'Mountains');
    expect(read.transitions).toEqual([]);
    await page.waitForTimeout(600);
    expect(read.first).toBe(await circleColour(page, 'Mountains'));
  });

  test('every frame of a tap shows the circle wholly empty or wholly filled @storyboard', async ({
    page,
  }, testInfo) => {
    await openStory(page, storybook(), STORY);
    const driver = await touchDriver(page);
    const at = await centreOf(page, 'Mountains');
    const before = await circleColour(page, 'Mountains');
    const cast = await startScreencast(page);
    await frames(page, 4);
    const tapAt = Date.now();
    const [trace] = await Promise.all([
      traceCircle(page, 'Mountains', 500),
      driver.tap(at),
    ]);
    const shot = await cast.stop();
    const after = trace.at(-1)?.colour;
    const nearest = (t: number) =>
      trace.reduce((best, sample) =>
        Math.abs(sample.t - t) < Math.abs(best.t - t) ? sample : best,
      );
    // The evidence is written first, so a failing run shows its blend.
    const storyboard = await castStoryboard(page, shot, {
      name: 'circle-check-tap',
      zero: tapAt,
      cellScale: 0.5,
      columns: 4,
      data: t => ({circle: nearest(t).colour}),
    });
    await storyboard.write(testInfo, {
      claim:
        'under a finger the circle fills in one frame (motion/uikit/selection.ts)',
      before,
      after,
    });
    expect(after).not.toBe(before);
    for (const sample of trace) {
      expect([before, after], `the circle at ${sample.t - tapAt} ms`).toContain(
        sample.colour,
      );
    }
  });

  test('a mouse keeps the theme’s fade (negative control)', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: {width: 1024, height: 768},
      hasTouch: false,
      isMobile: false,
    });
    const page = await context.newPage();
    try {
      await openStory(page, storybook(), STORY);
      await watchCircle(page, 'Mountains');
      const at = await centreOf(page, 'Mountains');
      await page.mouse.move(at.x, at.y);
      await page.waitForTimeout(400);
      await page.mouse.click(at.x, at.y);
      const read = await readCircle(page, 'Mountains');
      expect(
        read.transitions.some(
          ({property, duration}) =>
            property === 'background-color' && duration > 0,
        ),
      ).toBe(true);
      await page.waitForTimeout(600);
      expect(read.first).not.toBe(await circleColour(page, 'Mountains'));
    } finally {
      await context.close();
    }
  });
});

test.describe('CircleCheckIndicator in forced colors', () => {
  test('the ring falls back to a 1px system-coloured border, and the check stays visible', async ({
    page,
  }) => {
    /** The circle and check of the first row whose checkbox is `checked`. */
    const read = async (checked: boolean) =>
      page.evaluate(
        ({want, circleSelector}) => {
          const input = Array.from(
            document.querySelectorAll<HTMLInputElement>(
              '#storybook-root input[type="checkbox"]',
            ),
          ).find(el => el.checked === want);
          const row = input?.closest('li, .astryx-item');
          const circle = row?.querySelector<HTMLElement>(circleSelector);
          const check = row?.querySelector<SVGElement>(
            '.astryx-circle-check-indicator-check',
          );
          if (circle == null || check == null) {
            return null;
          }
          const ring = getComputedStyle(circle);
          const mark = getComputedStyle(check);
          return {
            borderStyle: ring.borderTopStyle,
            borderWidth: ring.borderTopWidth,
            boxShadow: ring.boxShadow,
            checkDisplay: mark.display,
            checkVisibility: mark.visibility,
          };
        },
        {want: checked, circleSelector: CIRCLE},
      );
    await openStory(page, storybook(), STORY);
    // Default: the empty circle's ring is the inset shadow, with no border.
    const normal = await read(false);
    expect(normal).not.toBeNull();
    expect(normal?.borderStyle).toBe('none');
    expect(normal?.boxShadow).toContain('inset');
    // Forced colors drops shadows: the ring comes back as a 1px border.
    await page.emulateMedia({forcedColors: 'active'});
    const forced = await read(false);
    expect(forced?.borderStyle).toBe('solid');
    expect(forced?.borderWidth).toBe('1px');
    // A checked circle still shows its check.
    const checked = await read(true);
    expect(checked).not.toBeNull();
    expect(checked?.checkDisplay).not.toBe('none');
    expect(checked?.checkVisibility).toBe('visible');
  });
});
