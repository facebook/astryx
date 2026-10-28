// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NavigationStackScrollEdge.interaction.browser.spec.ts
 * @input The built "Scrolling" NavigationStack story on the touch phone
 *   profile (screens long enough to scroll under the bar), programmatic and
 *   real-touch scrolling, and the interaction harness
 * @output Interaction proofs for the iOS 26 look of NavigationStack's bar
 *   under a finger: the bar paints no background and no hairline; each
 *   screen's veil is off while its content sits 10px or less under the bar
 *   and on beyond, both ways, at once for a scroll the program drives; a push
 *   brings the new screen's own veil (off) while the scrolled screen keeps
 *   its own, and a pop returns to it still on; a finger scrolling the screen
 *   fades the veil in; the veil and its sentinel are hidden from assistive
 *   technology; a mouse keeps the bar's surface and hairline and runs no
 *   veil; a storyboard of the fade
 * @position Interaction proof for NavigationStack.tsx's bar look and core's
 *   motion/useScrollEdgeEffect.ts in a scroll container, run by
 *   `pnpm test:interaction`. Touch is one model on every touch device, so
 *   the phone profile's coarse pointer is the touch case in both engines; a
 *   finger's scroll is a finger resting on the content while the screen
 *   scrolls, or a real touch drag in Chromium. The fade's curve and its
 *   busy-main-thread behaviour are proven for the same hook by
 *   packages/core/src/AppShell/__tests__/AppShellScrollEdge.interaction.browser.spec.ts
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {
  animationStoryboard,
  drag,
  frames,
  openStory,
  releaseAnimations,
  touchDriver,
  waitForAnimation,
  waitForRest,
  withStorybook,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

const STORY = 'lab-navigationstack--scrolling';

const card = (page: Page, screen: string) =>
  page.locator(`[data-navigation-screen="${screen}"]`);
const veil = (page: Page, screen: string) =>
  card(page, screen).locator(':scope > [data-navigation-scroll-edge]');
const scroller = (page: Page, screen: string) =>
  card(page, screen).locator(':scope > :first-child');

async function presentedOpacity(layer: Locator): Promise<number> {
  return layer.evaluate(element => Number(getComputedStyle(element).opacity));
}

/** Scrolls a screen, lets the observer report, waits for the fade to end. */
async function settleAt(page: Page, screen: string, top: number) {
  await scroller(page, screen).evaluate((element, y) => {
    element.scrollTop = y;
  }, top);
  await frames(page, 3);
  await waitForRest(veil(page, screen));
  return presentedOpacity(veil(page, screen));
}

/**
 * Scrolls a screen while a finger rests on its content, then lifts it two
 * frames later (after the observer has reported): the shared gesture host
 * reads the scroll as the finger's, so the veil fades.
 */
async function fingerScrollTo(page: Page, screen: string, top: number) {
  await scroller(page, screen).evaluate((element, y) => {
    const target = element.lastElementChild ?? element;
    const touch = {identifier: 7, clientX: 100, clientY: 400, target};
    const fire = (type: string, touches: (typeof touch)[]) => {
      const event = new Event(type, {bubbles: true, cancelable: true});
      Object.defineProperty(event, 'changedTouches', {value: [touch]});
      Object.defineProperty(event, 'touches', {value: touches});
      target.dispatchEvent(event);
    };
    fire('touchstart', [touch]);
    element.scrollTop = y;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => fire('touchend', [])),
    );
  }, top);
}

async function openStack(page: Page) {
  await openStory(page, storybook(), STORY);
  await expect(page.getByTestId('navigation-stack')).toBeVisible();
  await expect(veil(page, 'root')).toBeAttached();
}

test('the bar paints no background and no hairline under a finger', async ({
  page,
}) => {
  await openStack(page);
  const background = await page
    .getByTestId('navigation-stack')
    .evaluate(stack => {
      const bar = stack.firstElementChild as HTMLElement;
      const style = getComputedStyle(bar.firstElementChild as HTMLElement);
      return {
        color: style.backgroundColor,
        border: style.borderBottomWidth,
      };
    });
  expect(background).toEqual({color: 'rgba(0, 0, 0, 0)', border: '0px'});
});

test('a scroll the program drives switches a screen’s veil at once: off through 10px, on beyond, both ways', async ({
  page,
}) => {
  await openStack(page);
  const steps: [number, number][] = [
    [0, 0],
    [5, 0],
    [10, 0],
    [11, 1],
    [200, 1],
    [10, 0],
    [0, 0],
  ];
  const seen: {top: number; opacity: number}[] = [];
  for (const [top, expected] of steps) {
    const opacity = await settleAt(page, 'root', top);
    seen.push({top, opacity});
    expect(opacity, `${top}px under the bar`).toBe(expected);
    // At once: the WebKit workaround (no fade on the program's scroll).
    expect(
      await veil(page, 'root').evaluate(
        element => element.getAnimations().length,
      ),
    ).toBe(0);
  }
  test
    .info()
    .annotations.push({type: 'switch', description: JSON.stringify(seen)});
});

test('a push brings the new screen’s own veil; a pop returns to the scrolled screen’s', async ({
  page,
}) => {
  await openStack(page);
  expect(await settleAt(page, 'root', 300)).toBe(1);
  await page.getByRole('button', {name: /Message 9\b/}).click();
  await expect(card(page, 'screen-Message 9')).toHaveAttribute(
    'data-navigation-top',
    'true',
  );
  await waitForRest(card(page, 'screen-Message 9'));
  await waitForRest(veil(page, 'screen-Message 9'));
  // The new screen sits at its top: its own veil is off. The covered screen
  // keeps its own, on.
  expect(await presentedOpacity(veil(page, 'screen-Message 9'))).toBe(0);
  expect(await presentedOpacity(veil(page, 'root'))).toBe(1);
  await page.getByRole('button', {name: 'Inbox'}).click();
  await expect(card(page, 'root')).toHaveAttribute(
    'data-navigation-top',
    'true',
  );
  await waitForRest(card(page, 'root'));
  expect(await presentedOpacity(veil(page, 'root'))).toBe(1);
});

test('a finger scrolling the screen fades the veil in', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'native scrolling from injected touches is Chromium-only (harness README)',
  );
  await openStack(page);
  const driver = await touchDriver(page);
  await driver.play(
    drag({x: 200, y: 560}, {x: 200, y: 460}, {durationMs: 300, restMs: 450}),
  );
  await waitForRest(veil(page, 'root'));
  const top = await scroller(page, 'root').evaluate(
    element => element.scrollTop,
  );
  expect(top).toBeGreaterThan(10);
  expect(await presentedOpacity(veil(page, 'root'))).toBe(1);
});

test('the veil and its sentinel are hidden from assistive technology', async ({
  page,
}) => {
  await openStack(page);
  const hidden = await card(page, 'root').evaluate(element => {
    const layer = element.querySelector('[data-navigation-scroll-edge]');
    const sentinel = element.querySelector(
      '[data-navigation-scroll-edge-sentinel]',
    );
    return {
      layer: layer?.getAttribute('aria-hidden'),
      sentinel: sentinel?.getAttribute('aria-hidden'),
      pointer: layer == null ? null : getComputedStyle(layer).pointerEvents,
    };
  });
  expect(hidden).toEqual({layer: 'true', sentinel: 'true', pointer: 'none'});
});

test.describe('with a mouse', () => {
  test.use({hasTouch: false, isMobile: false});

  test('the bar keeps its surface and hairline and runs no veil', async ({
    page,
  }) => {
    await openStack(page);
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const background = await page
      .getByTestId('navigation-stack')
      .evaluate(stack => {
        const bar = stack.firstElementChild as HTMLElement;
        const style = getComputedStyle(bar.firstElementChild as HTMLElement);
        return {color: style.backgroundColor, border: style.borderBottomWidth};
      });
    expect(background.color).not.toBe('rgba(0, 0, 0, 0)');
    expect(background.border).toBe('1px');
    await scroller(page, 'root').evaluate(element => {
      element.scrollTop = 200;
    });
    await frames(page, 5);
    expect(
      await veil(page, 'root').evaluate(element => ({
        display: getComputedStyle(element).display,
        running: element.getAnimations().length,
      })),
    ).toEqual({display: 'none', running: 0});
  });
});

test(
  'storyboard: a screen’s veil fading in',
  {tag: '@storyboard'},
  async ({page}, testInfo) => {
    await openStack(page);
    const layer = veil(page, 'root');
    const viewport = page.viewportSize() ?? {width: 402, height: 714};
    const clip = {x: 0, y: 0, width: viewport.width, height: 120};
    await fingerScrollTo(page, 'root', 120);
    await waitForAnimation(layer);
    const {storyboard} = await animationStoryboard(page, {
      name: 'navigation-stack-scroll-edge-appear',
      clip,
      scope: layer,
      measure: async () => ({opacity: await presentedOpacity(layer)}),
      columns: 6,
      cellScale: 0.5,
    });
    await releaseAnimations(page, {finish: true});
    await storyboard.write(testInfo);
    const ins = storyboard.frames.map(f => f.data.opacity as number);
    expect(ins[0]).toBeLessThan(0.05);
    expect(ins.every((o, i) => i === 0 || o >= ins[i - 1] - 0.002)).toBe(true);
    expect(ins.at(-1)).toBeGreaterThan(0.99);
  },
);
