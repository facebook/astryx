// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MonthScrollerSteps.interaction.browser.spec.ts
 * @input The built "Default" DateInput story, shown in a bottom sheet, the
 *   arrows clicked from the page, real mouse and trackpad input and the
 *   interaction harness
 * @output Interaction proofs for the month scroller's steps: a second arrow
 *   step clicked late in the first one's smooth scroll still brings the
 *   scroller to rest on the month the title names, and after the month and
 *   year wheels close a trackpad scroll still pages to the next month
 * @position Interaction tests of MonthScroller.tsx
 *   (`*.interaction.browser.spec.ts`, run by `pnpm test:interaction`)
 */

import {expect, test, type Locator, type Page} from '@playwright/test';
import {openStory, withStorybook} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);
const STORY = 'core-dateinput--default';
const ARGS = {presentation: 'bottom-sheet'};

/** Waits until the scroller's offset has not moved for ten frames. */
async function waitForRest(viewport: Locator): Promise<number> {
  return viewport.evaluate(
    async element =>
      new Promise<number>(resolve => {
        let last = element.scrollLeft;
        let still = 0;
        const check = () => {
          const now = element.scrollLeft;
          still = now === last ? still + 1 : 0;
          last = now;
          if (still >= 10) {
            resolve(now);
          } else {
            requestAnimationFrame(check);
          }
        };
        requestAnimationFrame(check);
      }),
  );
}

/** The month the scroller rests on, as the pane's own grid names it. */
async function monthAtRest(viewport: Locator): Promise<string> {
  return viewport.evaluate(element => {
    const box = element.getBoundingClientRect();
    const middle = box.left + box.width / 2;
    for (const grid of element.querySelectorAll<HTMLElement>('[role="grid"]')) {
      const r = grid.getBoundingClientRect();
      if (r.left <= middle && r.right >= middle) {
        return grid.getAttribute('aria-label') ?? '';
      }
    }
    return '';
  });
}

async function openCalendar(page: Page) {
  await openStory(page, storybook(), STORY, ARGS);
  await page
    .getByRole('button', {name: /calendar/i})
    .first()
    .click();
  const viewport = page.locator('[data-scroller="months"]');
  await expect(viewport).toBeVisible();
  await waitForRest(viewport);
  return viewport;
}

test.use({hasTouch: false, isMobile: false});

/**
 * The first step's smooth scroll is still running when the second arrow is
 * clicked, late in it: WebKit ends the retargeted scroll part-way, and the
 * scroller has to finish the second step rather than round back to the
 * first one's month. The second step lands once the first scroll has covered
 * 95 % of a month, where WebKit's cut always strands the scroller on the
 * first arrow's month. Both arrows are clicked from the page: the second in
 * its own task, as a click arrives, posted from the first frame that reaches
 * the share; that task measures the share it runs at. A click sent from the
 * test runner instead could arrive after the first scroll had ended.
 */
const SHARE = 0.95;

test('a second arrow step late in the first one’s scroll (95 %) rests on the month the title names', async ({
  page,
}) => {
  const viewport = await openCalendar(page);
  const title = page.getByRole('button', {name: /Choose month and year/});
  const start = await monthAtRest(viewport);
  expect(start).not.toBe('');
  const atSecondStep = await viewport.evaluate(
    async (element, wanted) =>
      new Promise<number>(resolve => {
        const arrow = (name: string) => {
          const button = document.querySelector<HTMLButtonElement>(
            `button[aria-label="${name}"]`,
          );
          if (button == null) {
            throw new Error(`no ${name} button`);
          }
          return button;
        };
        const next = arrow('Next month');
        const previous = arrow('Previous month');
        const from = element.scrollLeft;
        const travelled = () =>
          Math.abs(element.scrollLeft - from) / element.clientWidth;
        const secondStep = new MessageChannel();
        secondStep.port1.onmessage = () => {
          const at = travelled();
          previous.click();
          resolve(at);
        };
        const check = () => {
          if (travelled() >= wanted - 0.002) {
            secondStep.port2.postMessage(null);
          } else {
            requestAnimationFrame(check);
          }
        };
        next.click();
        requestAnimationFrame(check);
      }),
    SHARE,
  );
  // The second step ran inside the first one's scroll, past the share.
  expect(atSecondStep).toBeGreaterThanOrEqual(SHARE - 0.01);
  expect(atSecondStep).toBeLessThan(1);
  await waitForRest(viewport);
  // Past the scroller's own settle correction too.
  await page.waitForTimeout(600);
  await waitForRest(viewport);
  await expect(title).toHaveAccessibleName(new RegExp(start));
  expect(await monthAtRest(viewport)).toBe(start);
});

/**
 * Closing the month and year wheels re-asserts the month shown, a steer that
 * moves nothing. A trackpad scroll after it is the user's: it pages to the
 * next month and stays there, the title following.
 */
test('after the month and year wheels close, a trackpad scroll to the next month stays there', async ({
  page,
}) => {
  const viewport = await openCalendar(page);
  const toggle = page.getByRole('button', {name: /Choose month and year/});
  const start = await monthAtRest(viewport);
  expect(start).not.toBe('');
  const toggleBox = await toggle.boundingBox();
  if (toggleBox == null) {
    throw new Error('no month and year toggle');
  }
  const clickToggle = async () =>
    page.mouse.click(
      toggleBox.x + toggleBox.width / 2,
      toggleBox.y + toggleBox.height / 2,
    );
  await clickToggle();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await clickToggle();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await waitForRest(viewport);

  const box = await viewport.boundingBox();
  if (box == null) {
    throw new Error('no month scroller');
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  // A horizontal swipe of 70 % of a month, as a trackpad sends it.
  for (let step = 0; step < 7; step++) {
    await page.mouse.wheel(box.width * 0.1, 0);
  }
  await waitForRest(viewport);
  // Past the scroller's own settle correction too.
  await page.waitForTimeout(600);
  await waitForRest(viewport);
  const next = await monthAtRest(viewport);
  expect(next).not.toBe(start);
  await expect(toggle).toHaveAccessibleName(new RegExp(next));
});
