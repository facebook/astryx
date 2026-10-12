// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TokenizerEndLane.a11y.chromium.spec.ts
 * @input `Core/Tokenizer` and `Core/PowerSearch` stories in a built Storybook.
 * @output Real-engine proof that tokens, the overflow count and the input's
 *   text box never paint under the end lane (clear-all and busy indicator),
 *   across field widths, both writing directions and both overflow modes.
 * @position Run with `pnpm test:a11y-contract`. The lane is absolutely
 *   positioned, so whether a token reaches it depends on how rows wrap at a
 *   given width, which only a shipping layout engine can show.
 */

import {expect, test, type Page} from '@playwright/test';
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

type Direction = 'ltr' | 'rtl';

async function open(
  page: Page,
  id: string,
  direction: Direction,
  args = '',
): Promise<void> {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${id}&viewMode=story&globals=direction:${direction}${args ? `&args=${args}` : ''}`,
    {waitUntil: 'load'},
  );
  await page
    .locator('button[aria-label="Clear all"]')
    .first()
    .waitFor({state: 'attached'});
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/**
 * Sets the story's sizing container to `width` and, for every field with a
 * visible clear-all lane, returns each visible box that intersects the lane:
 * tokens, the "+N more" count, and the input's content box (where its text
 * and caret paint).
 */
async function overlapsAt(page: Page, width: number): Promise<string[]> {
  return page.evaluate(async width => {
    // The story decorator's fixed-width box; the layer mode's popover takes
    // its width from the in-flow field inside it.
    const host = document.querySelector<HTMLElement>(
      '#storybook-root [style*="width"]',
    );
    if (!host) {
      throw new Error('No sizing container in the story');
    }
    host.style.width = `${width}px`;
    for (let frame = 0; frame < 4; frame++) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    const isShown = (el: Element) =>
      el.checkVisibility({visibilityProperty: true}) &&
      !el.closest('[aria-hidden="true"]');
    const lanes = [
      ...document.querySelectorAll('button[aria-label="Clear all"]'),
    ]
      .filter(isShown)
      .map(clear => clear.parentElement)
      .filter(lane => lane?.parentElement != null) as HTMLElement[];
    if (lanes.length === 0) {
      throw new Error('No clear-all lane is visible');
    }

    return lanes.flatMap((lane, fieldIndex) => {
      const field = lane.parentElement as HTMLElement;
      const boxes: {name: string; rect: DOMRect}[] = [];
      field.querySelectorAll('.astryx-token').forEach((token, index) => {
        if (isShown(token)) {
          boxes.push({
            name: `token ${index}`,
            rect: token.getBoundingClientRect(),
          });
        }
      });
      field.querySelectorAll('span').forEach(span => {
        if (/^\+\d+ more$/.test(span.textContent ?? '') && isShown(span)) {
          boxes.push({
            name: 'overflow count',
            rect: span.getBoundingClientRect(),
          });
        }
      });
      const input = field.querySelector<HTMLInputElement>('[role="combobox"]');
      if (input && isShown(input) && getComputedStyle(input).opacity !== '0') {
        const style = getComputedStyle(input);
        const rect = input.getBoundingClientRect();
        const left = rect.left + parseFloat(style.paddingLeft);
        const right = rect.right - parseFloat(style.paddingRight);
        if (right > left) {
          boxes.push({
            name: 'input text box',
            rect: new DOMRect(left, rect.top, right - left, rect.height),
          });
        }
      }

      const laneRect = lane.getBoundingClientRect();
      return boxes.flatMap(({name, rect}) => {
        const x =
          Math.min(rect.right, laneRect.right) -
          Math.max(rect.left, laneRect.left);
        const y =
          Math.min(rect.bottom, laneRect.bottom) -
          Math.max(rect.top, laneRect.top);
        return x > 0.5 && y > 0.5
          ? [
              `${width}px field ${fieldIndex}: ${name} overlaps the end lane by ${x.toFixed(1)}px`,
            ]
          : [];
      });
    });
  }, width);
}

async function sweep(page: Page, from: number, to: number): Promise<string[]> {
  const found: string[] = [];
  for (let width = from; width <= to; width += 4) {
    found.push(...(await overlapsAt(page, width)));
  }
  return found;
}

/**
 * The same sweep with a search in flight at every width. The busy Spinner joins
 * the lane only while a search runs, so each width is measured while the
 * combobox reports `aria-busy`, typing again whenever the last search settled.
 */
async function sweepWhileBusy(
  page: Page,
  from: number,
  to: number,
): Promise<string[]> {
  const search = page.getByRole('combobox');
  const found: string[] = [];
  for (let width = from; width <= to; width += 4) {
    for (;;) {
      if ((await search.getAttribute('aria-busy')) !== 'true') {
        await search.press('a');
        await expect(search).toHaveAttribute('aria-busy', 'true');
      }
      const overlaps = await overlapsAt(page, width);
      if ((await search.getAttribute('aria-busy')) === 'true') {
        found.push(...overlaps);
        break;
      }
    }
  }
  return found;
}

for (const direction of ['ltr', 'rtl'] as const) {
  test.describe(direction, () => {
    test('PowerSearch tokens (custom renderToken) wrap before the end lane', async ({
      page,
    }) => {
      await open(page, 'core-powersearch--near-full-token-row', direction);
      expect(await sweep(page, 160, 640)).toEqual([]);
    });

    test('a token wider than the row truncates short of the end lane', async ({
      page,
    }) => {
      await open(page, 'core-tokenizer--long-token-end-lane', direction);
      expect(await sweep(page, 160, 400)).toEqual([]);
    });

    test('default Tokenizer tokens wrap before the end lane', async ({
      page,
    }) => {
      await open(
        page,
        'core-tokenizer--with-preselected',
        direction,
        'hasClear:!true',
      );
      expect(await sweep(page, 160, 400)).toEqual([]);
    });

    test('tokens stay clear of the lane while a search is busy', async ({
      page,
    }) => {
      await open(page, 'core-tokenizer--loading', direction);
      await page.getByRole('combobox').focus();
      expect(await sweepWhileBusy(page, 200, 400)).toEqual([]);
    });

    for (const mode of ['overflow-inline', 'overflow-layer']) {
      test(`${mode}: blurred and focused tokens stay clear of the end lane`, async ({
        page,
      }) => {
        await open(page, `core-powersearch--${mode}`, direction);
        // Blurred: only the inline mode keeps its lane on the page.
        if (mode === 'overflow-inline') {
          expect(await sweep(page, 320, 640)).toEqual([]);
        }
        // The field's own corner, clear of every token: the click a person
        // makes to start typing, which expands both modes.
        await page
          .locator('.astryx-tokenizer')
          .first()
          .click({position: {x: 1, y: 1}});
        await expect(page.getByRole('combobox')).toBeFocused();
        expect(await sweep(page, 320, 640)).toEqual([]);
      });
    }
  });
}
