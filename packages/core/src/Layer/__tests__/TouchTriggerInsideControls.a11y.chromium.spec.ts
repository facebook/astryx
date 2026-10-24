// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TouchTriggerInsideControls.a11y.chromium.spec.ts
 * @input The `Core/Tooltip` Touch Triggers Inside Controls story in a built
 *   Storybook, driven by real Chromium touch input (CDP) in a phone-sized
 *   viewport.
 * @output Real-engine proof that a tap on a hover-layer trigger sitting inside
 *   a control goes to the control alone: a truncated Link follows its href (the
 *   story prints the fragment it went to) and a ClickableCard opens once, with
 *   no truncation or name tooltip, while a truncated label in running text
 *   still opens its tooltip on a tap. Writes a storyboard (contact sheet + JSON
 *   trace) of the card tap to
 *   test-results/touch-trigger-inside-controls/.
 * @position Run with `pnpm test:a11y-contract`. Which element a real tap
 *   lands on, and where its click goes, needs a real engine; the unit suites
 *   (useTouchTrigger.test.ts, Tooltip.test.tsx, HoverCard.test.tsx) cover the
 *   rule on synthetic events.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  expect,
  test,
  type CDPSession,
  type Locator,
  type Page,
} from '@playwright/test';
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

// Playwright empties test-results/ at the start of every run, so evidence
// meant to outlive the run goes where ASTRYX_INTERACTION_EVIDENCE points.
const EVIDENCE = path.resolve(
  process.env.ASTRYX_INTERACTION_EVIDENCE ??
    path.join('test-results', 'touch-trigger-inside-controls'),
);

test.use({hasTouch: true, isMobile: true, viewport: {width: 390, height: 844}});

const STORY = 'core-tooltip--touch-triggers-inside-controls';
const TOOLTIP = '.astryx-tooltip:popover-open';

interface Finger {
  down(x: number, y: number): Promise<void>;
  up(): Promise<void>;
}

async function openStory(page: Page): Promise<Finger> {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  await expect(page.getByTestId('card-opens')).toHaveText(
    'Card opened 0 times',
  );
  await expect(page.getByTestId('link-followed')).toHaveText(
    'Link followed: not yet',
  );
  // A truncated Text mounts its tooltip once it has measured the overflow,
  // and that tooltip describes the text. Every trigger is armed before a tap.
  for (const target of [linkLabel(page), cardId(page), runningText(page)]) {
    await expect(target).toHaveAttribute('aria-describedby', /\S/);
  }
  await expect(cardAvatar(page)).toHaveAttribute('tabindex', '0');
  const cdp: CDPSession = await page.context().newCDPSession(page);
  return {
    down: async (x, y) => {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{x, y}],
      });
    },
    up: async () => {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      });
    },
  };
}

async function centerOf(target: Locator): Promise<[number, number]> {
  const box = await target.boundingBox();
  if (box == null) {
    throw new Error('the trigger has no layout box');
  }
  return [
    Math.round(box.x + box.width / 2),
    Math.round(box.y + box.height / 2),
  ];
}

async function tap(page: Page, finger: Finger, target: Locator) {
  const [x, y] = await centerOf(target);
  await finger.down(x, y);
  await page.waitForTimeout(60);
  await finger.up();
}

/** The truncated label of the story's Link: the Text inside the anchor. */
const linkLabel = (page: Page) =>
  page.locator('a[href="#quarterly-report"] .astryx-text');
/** The truncated ID on the card (its Text, not the tooltip's copy). */
const cardId = (page: Page) =>
  page.locator('.astryx-text', {hasText: /^deployment-8f3a2c91/});
/** The static name avatar on the card. */
const cardAvatar = (page: Page) => page.getByRole('img', {name: 'Jane Doe'});
/** The truncated label in running text, inside no control. */
const runningText = (page: Page) =>
  page.locator('.astryx-text', {hasText: /^A long note/});

test.describe('a tap on a hover-layer trigger inside a control', () => {
  test('every trigger in the story is really truncated', async ({page}) => {
    await openStory(page);
    for (const target of [linkLabel(page), cardId(page), runningText(page)]) {
      const overflow = await target.evaluate(
        element => element.scrollWidth - element.clientWidth,
      );
      expect(overflow).toBeGreaterThan(0);
    }
  });

  test('a truncated link follows its href and opens no tooltip', async ({
    page,
  }) => {
    const finger = await openStory(page);
    await tap(page, finger, linkLabel(page));
    await expect
      .poll(async () => page.evaluate(() => location.hash))
      .toBe('#quarterly-report');
    // The story prints where the link went, which is what a video of this tap
    // shows.
    await expect(page.getByTestId('link-followed')).toHaveText(
      'Link followed: #quarterly-report',
    );
    await page.waitForTimeout(300);
    await expect(page.locator(TOOLTIP)).toHaveCount(0);
  });

  test('a truncated ID on a clickable card opens the card once and no tooltip', async ({
    page,
  }) => {
    const finger = await openStory(page);
    await tap(page, finger, cardId(page));
    await expect(page.getByTestId('card-opens')).toHaveText(
      'Card opened 1 time',
    );
    await page.waitForTimeout(300);
    await expect(page.locator(TOOLTIP)).toHaveCount(0);
  });

  test('a name avatar on a clickable card opens the card and no tooltip', async ({
    page,
  }) => {
    const finger = await openStory(page);
    await tap(page, finger, cardAvatar(page));
    await expect(page.getByTestId('card-opens')).toHaveText(
      'Card opened 1 time',
    );
    await page.waitForTimeout(300);
    await expect(page.locator(TOOLTIP)).toHaveCount(0);
  });

  test('a truncated label in running text still opens its tooltip', async ({
    page,
  }) => {
    const finger = await openStory(page);
    await tap(page, finger, runningText(page));
    await expect(page.locator(TOOLTIP)).toHaveCount(1);
    await expect(page.locator(TOOLTIP)).toContainText(
      'A long note that does not fit on one line of this narrow box',
    );
  });
});

test('storyboard: a tap on the card ID, frame by frame @storyboard', async ({
  page,
}, testInfo) => {
  const finger = await openStory(page);
  const stage = page.getByTestId('touch-stage');
  const state = async () =>
    page.evaluate(selector => {
      const opens = document.querySelector('[data-testid="card-opens"]');
      return {
        tooltipOpen: document.querySelectorAll(selector).length > 0,
        cardOpens: Number(/\d+/.exec(opens?.textContent ?? '')?.[0] ?? -1),
      };
    }, TOOLTIP);

  const frames: {label: string; t: number; png: string}[] = [];
  const trace: {
    label: string;
    t: number;
    tooltipOpen: boolean;
    cardOpens: number;
  }[] = [];
  const shoot = async (label: string, origin: number) => {
    const t = Math.round(performance.now() - origin);
    trace.push({label, t, ...(await state())});
    frames.push({label, t, png: (await stage.screenshot()).toString('base64')});
  };

  const [x, y] = await centerOf(cardId(page));
  const start = performance.now();
  await shoot('before', start);
  await finger.down(x, y);
  await shoot('finger down', start);
  await finger.up();
  const lift = performance.now();
  for (const after of [16, 100, 300]) {
    const wait = after - (performance.now() - lift);
    if (wait > 0) {
      await page.waitForTimeout(wait);
    }
    await shoot(`lift +${after} ms`, lift);
  }

  fs.mkdirSync(EVIDENCE, {recursive: true});
  fs.writeFileSync(
    path.join(EVIDENCE, 'tap-card-id.json'),
    JSON.stringify({story: STORY, target: 'card ID', frames: trace}, null, 1),
  );
  const sheet = await page.context().newPage();
  try {
    const png = await sheet.evaluate(async items => {
      const decoded = await Promise.all(
        items.map(async item =>
          createImageBitmap(
            await (await fetch(`data:image/png;base64,${item.png}`)).blob(),
          ),
        ),
      );
      const w = Math.max(...decoded.map(bitmap => bitmap.width));
      const h = Math.max(...decoded.map(bitmap => bitmap.height));
      const caption = 18;
      const canvas = new OffscreenCanvas(
        decoded.length * (w + 8) + 8,
        h + caption + 16,
      );
      const context = canvas.getContext('2d');
      if (context == null) {
        throw new Error('no 2d context');
      }
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#000';
      context.font = '12px sans-serif';
      decoded.forEach((bitmap, i) => {
        const left = 8 + i * (w + 8);
        context.fillText(items[i].label, left, 14);
        context.drawImage(bitmap, left, caption + 8);
      });
      const blob = await canvas.convertToBlob({type: 'image/png'});
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (const byte of bytes) {
        binary += String.fromCharCode(byte);
      }
      return btoa(binary);
    }, frames);
    fs.writeFileSync(
      path.join(EVIDENCE, 'tap-card-id.png'),
      Buffer.from(png, 'base64'),
    );
    await testInfo.attach('tap-card-id.png', {
      path: path.join(EVIDENCE, 'tap-card-id.png'),
      contentType: 'image/png',
    });
  } finally {
    await sheet.close();
  }

  // The trace is the assertion (written first, so a failing run still leaves
  // its evidence): no frame shows a tooltip, and the card opens exactly once,
  // after the finger lifts.
  expect(trace.map(frame => frame.tooltipOpen)).toEqual(trace.map(() => false));
  expect(trace.map(frame => frame.cardOpens)).toEqual([0, 0, 1, 1, 1]);
});
