// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChatLayoutScrollButtonSurface.a11y.chromium.spec.ts
 * @input Uses the ChatLayout scroll-button states story and a built Storybook
 * @output Rendered evidence that the documented theming target reaches the
 *   element painting the pill, plus the audited state frames and their receipts
 * @position Real-Chromium evidence for the 2026-09-23 ChatLayoutScrollButton
 *   audit. Frames land under the component-audit evidence directory that CI
 *   already uploads, in a `scroll-button/` subdirectory so this manifest never
 *   merges with the sibling ChatLayout manifest.
 *
 * The claim under test is `architecture:component-theming-surface` INV4:
 * "A target belongs on a stable visible element that paints theme-controlled
 * output—not an event wrapper, speculative internal structure, or a node
 * created only for layout plumbing."
 *
 * This is not observable in the unit lane and not observable to the probe-reach
 * gate either. jsdom resolves no cascade, so it cannot say which element paints.
 * The gate's reach check asks whether a target's override lands on the element
 * carrying the class, and it does — that element simply is not the one a reader
 * sees. Only a real engine can be asked the question that matters: does styling
 * the documented target change the pill?
 *
 * The pill is identified structurally, as the button's parent element, so every
 * measurement below is independent of where the class currently sits.
 */

import {createHash} from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {expect, test, type Locator, type Page} from '@playwright/test';
import {holdMotionStill} from '@astryxdesign/a11y-spec/chromium';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';

const OUTPUT = path.resolve(
  'test-results/chat-layout-audit-evidence/scroll-button',
);
const STORY_ID = 'core-chatlayout--scroll-button-states';

/** The rendered configurations the story stages, in capture order. */
const STATES = [
  'hidden',
  'visible-collapsed',
  'visible-labelled',
  'visible-long-label',
] as const;

type State = (typeof STATES)[number];

type Shot = {
  file: string;
  sha256: string;
  /** Decoded from the PNG's own IHDR — the image's pixels, not the viewport. */
  width: number;
  height: number;
};

type Receipt = {
  state: string;
  storyId: string;
  theme: string;
  colorMode: string;
  direction: string;
  /** The window, recorded in its own row so it can never be read as the image. */
  viewport: {width: number; height: number};
  devicePixelRatio: number;
  rendered: Record<string, unknown>;
  geometry: {selectorCount: number; width: number; height: number};
  settled: {fontsReady: boolean; pageErrors: number};
  image: Shot;
};

const receipts: Receipt[] = [];
const pageErrors: string[] = [];
let storybook: StaticServer;
let browserVersion = 'unknown';

test.beforeAll(async () => {
  // Do NOT wipe: Playwright restarts the worker after a failing test and
  // re-runs this hook, which would delete the frames already banked — exactly
  // when a failing audit needs them most.
  fs.mkdirSync(OUTPUT, {recursive: true});
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});

test.afterAll(async () => {
  const manifestPath = path.join(OUTPUT, 'manifest.json');
  const previous = fs.existsSync(manifestPath)
    ? (JSON.parse(fs.readFileSync(manifestPath, 'utf8')).frames ?? [])
    : [];
  const merged = [...previous, ...receipts].filter(
    (frame, index, all) =>
      all.findIndex(other => other.state === frame.state) === index,
  );
  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        version: 1,
        component: 'core/ChatLayoutScrollButton',
        headSha:
          process.env.ASTRYX_HEAD_SHA ??
          process.env.GITHUB_SHA ??
          'local-working-copy',
        checkoutSha: process.env.GITHUB_SHA ?? 'local-working-copy',
        browser: browserVersion,
        frames: merged,
      },
      null,
      2,
    )}\n`,
  );
  await storybook?.close();
});

async function openStory(
  page: Page,
  {theme = 'neutral', colorMode = 'light'} = {},
): Promise<void> {
  page.on('pageerror', error => pageErrors.push(String(error)));
  browserVersion = page.context().browser()?.version() ?? 'unknown';
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY_ID}&viewMode=story` +
      `&globals=colorMode:${colorMode};astryxTheme:${theme}`,
  );
  await page.locator(`[data-scroll-button-state="hidden"]`).waitFor();
  await holdMotionStill(page);
  await page.evaluate(async () => document.fonts.ready);
}

function instance(page: Page, state: State): Locator {
  return page.locator(`[data-scroll-button-state="${state}"]`);
}

/**
 * Read one staged instance: which element carries the public target, whether
 * that element is the one painting the pill, and what each of them paints.
 *
 * The pill is `button.parentElement` — the element that clips the Button and
 * carries the surface a reader sees. Naming it structurally rather than by
 * class is the whole point: the question is *where the class is*, so the
 * measurement cannot be allowed to depend on the answer.
 */
async function readInstance(page: Page, state: State) {
  return instance(page, state).evaluate(host => {
    const button = host.querySelector('button');
    const pill = button?.parentElement ?? null;
    const themed = host.querySelector('.astryx-chat-layout-scroll-button');
    const root = host.firstElementChild;

    const describe = (element: Element | null) => {
      if (element == null) {
        return null;
      }
      const styles = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        backgroundColor: styles.backgroundColor,
        boxShadow: styles.boxShadow,
        borderRadius: styles.borderTopLeftRadius,
        visibility: styles.visibility,
        width: Math.round(box.width),
        height: Math.round(box.height),
      };
    };

    return {
      targetCount: host.querySelectorAll('.astryx-chat-layout-scroll-button')
        .length,
      /** Is the public target on the element that paints the pill? */
      targetIsPill: themed != null && themed === pill,
      /** Or is it on the component's outermost layout node? */
      targetIsRoot: themed != null && themed === root,
      themed: describe(themed),
      pill: describe(pill),
      root: describe(root),
      button: (() => {
        if (button == null) {
          return null;
        }
        const box = button.getBoundingClientRect();
        const label = button.querySelector('span, p, div');
        return {
          width: Math.round(box.width),
          height: Math.round(box.height),
          accessibleName: button.getAttribute('aria-label'),
          textOverflowing:
            label != null ? label.scrollWidth > label.clientWidth + 1 : false,
        };
      })(),
    };
  });
}

/** `rgba(r, g, b, 0)` and `transparent` both mean "this element paints no fill". */
function isTransparent(color: string): boolean {
  return color === 'transparent' || /,\s*0\)$/.test(color);
}

/**
 * Read a PNG's real pixel dimensions out of its IHDR header.
 *
 * These are ELEMENT screenshots, so their size is the subject's box, not the
 * window's. The viewport keeps its own receipt row; publishing it as the image
 * size would be a false claim about the bytes on disk.
 */
function pngShot(file: string, bytes: Buffer): Shot {
  return {
    file,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

async function capture(
  page: Page,
  state: State,
  frameName: string,
  rendered: Record<string, unknown>,
  {theme = 'neutral', colorMode = 'light'} = {},
): Promise<Receipt> {
  const host = instance(page, state);
  const box = await host.boundingBox();
  if (box == null) {
    throw new Error(`${frameName}: the staged instance has no layout box`);
  }
  const bytes = await host.screenshot({animations: 'disabled'});
  const file = `chat-layout-scroll-button__${frameName}.png`;
  fs.writeFileSync(path.join(OUTPUT, file), bytes);

  const window = await page.evaluate(() => ({
    width: globalThis.innerWidth,
    height: globalThis.innerHeight,
    dpr: globalThis.devicePixelRatio,
  }));

  const receipt: Receipt = {
    state: frameName,
    storyId: STORY_ID,
    theme: await page.evaluate(
      () =>
        document
          .querySelector('[data-astryx-theme]')
          ?.getAttribute('data-astryx-theme') ?? 'neutral',
    ),
    colorMode: await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    ),
    direction: await host.evaluate(
      element => getComputedStyle(element).direction,
    ),
    viewport: {width: window.width, height: window.height},
    devicePixelRatio: window.dpr,
    rendered: {
      requestedTheme: theme,
      requestedColorMode: colorMode,
      ...rendered,
    },
    geometry: {
      selectorCount: await host.count(),
      width: Math.round(box.width),
      height: Math.round(box.height),
    },
    settled: {fontsReady: true, pageErrors: pageErrors.length},
    image: pngShot(file, bytes),
  };
  receipts.push(receipt);
  return receipt;
}

test('the documented theming target sits on the element that paints the pill', async ({
  page,
}) => {
  await openStory(page);
  const state: State = 'visible-collapsed';
  const reading = await readInstance(page, state);

  // The frame is banked BEFORE the assertions, so a failing run still publishes
  // the picture of what it found.
  await capture(page, state, 'target-placement-neutral', {
    targetIsPill: reading.targetIsPill,
    targetIsRoot: reading.targetIsRoot,
    themed: reading.themed,
    pill: reading.pill,
  });

  expect(reading.targetCount, 'exactly one element carries the target').toBe(1);

  // INV4, read directly: the target is on the painting element, and that
  // element is the pill rather than the full-width row that centres it.
  expect(
    reading.targetIsPill,
    'architecture:component-theming-surface INV4 — the public target must sit ' +
      'on the element that paints the pill, not on the layout node that centres it',
  ).toBe(true);

  expect(
    isTransparent(reading.themed?.backgroundColor ?? 'transparent'),
    'the themed element must paint a fill a theme can replace',
  ).toBe(false);
  expect(
    reading.themed?.boxShadow,
    'the themed element must own the pill elevation',
  ).not.toBe('none');

  // A target on the centring row is as wide as the dock; a target on the pill
  // is as wide as the pill. The numbers separate the two without naming either.
  expect(reading.themed?.width).toBe(reading.pill?.width);
  expect(reading.themed?.height).toBe(reading.pill?.height);

  expect(pageErrors).toEqual([]);
});

test('a theme that styles the documented target repaints the pill', async ({
  page,
}) => {
  const state: State = 'visible-collapsed';

  // The probe theme exists precisely to answer this: it styles every declared
  // target with a loud generated colour, so "did the override reach the pixels
  // a reader sees" is an equality test rather than a judgement.
  await openStory(page, {theme: 'neutral'});
  const neutral = await readInstance(page, state);
  await capture(page, state, 'theme-reach-neutral', {
    pillBackground: neutral.pill?.backgroundColor,
    rootBackground: neutral.root?.backgroundColor,
  });

  await openStory(page, {theme: 'probe'});
  const probe = await readInstance(page, state);
  await capture(
    page,
    state,
    'theme-reach-probe',
    {
      pillBackground: probe.pill?.backgroundColor,
      rootBackground: probe.root?.backgroundColor,
      targetIsPill: probe.targetIsPill,
    },
    {theme: 'probe'},
  );

  expect(
    probe.pill?.backgroundColor,
    'the probe theme must actually change the surface the reader sees; an ' +
      'unchanged pill means the override landed somewhere else',
  ).not.toBe(neutral.pill?.backgroundColor);

  // ---- regression arm -----------------------------------------------------
  // ARM: pre-fix target placement
  // BASE: this head, probe theme, same page
  // DELTA: the target class is moved from the pill back up to the component's
  //        outer layout node — one `classList` move, and nothing else.
  // UNRELATED DELTA: none
  const armMoved = await instance(page, state).evaluate(host => {
    const root = host.firstElementChild;
    const themed = host.querySelector('.astryx-chat-layout-scroll-button');
    if (root == null || themed == null || themed === root) {
      return false;
    }
    themed.classList.remove('astryx-chat-layout-scroll-button');
    root.classList.add('astryx-chat-layout-scroll-button');
    return true;
  });
  expect(
    armMoved,
    'the arm must actually relocate the target, or it proves nothing',
  ).toBe(true);

  const arm = await readInstance(page, state);
  await capture(
    page,
    state,
    'theme-reach-probe-prefix-placement',
    {
      arm: 'pre-fix placement (target on the outer layout node)',
      pillBackground: arm.pill?.backgroundColor,
      rootBackground: arm.root?.backgroundColor,
      rootWidth: arm.root?.width,
      pillWidth: arm.pill?.width,
    },
    {theme: 'probe'},
  );

  // What the fix prevents: the theme colour lands on the invisible centring
  // row — painting a band the width of the dock — while the pill a reader
  // actually sees keeps the colour the theme asked to replace.
  expect(arm.pill?.backgroundColor).toBe(neutral.pill?.backgroundColor);
  expect(arm.root?.backgroundColor).not.toBe(neutral.root?.backgroundColor);
  expect(arm.root?.width).toBeGreaterThan(arm.pill?.width ?? 0);

  expect(pageErrors).toEqual([]);
});

test('every audited state renders in light and dark, and the target meets WCAG 2.5.8', async ({
  page,
}) => {
  for (const colorMode of ['light', 'dark'] as const) {
    await openStory(page, {colorMode});
    for (const state of STATES) {
      const reading = await readInstance(page, state);
      await capture(
        page,
        state,
        `${state}__${colorMode}`,
        {
          pillVisibility: reading.pill?.visibility,
          pillWidth: reading.pill?.width,
          pillHeight: reading.pill?.height,
          buttonWidth: reading.button?.width,
          buttonHeight: reading.button?.height,
          accessibleName: reading.button?.accessibleName,
          labelTextOverflowing: reading.button?.textOverflowing,
        },
        {colorMode},
      );

      if (state === 'visible-collapsed') {
        // WCAG 2.2 SC 2.5.8 (AA): a 24x24 CSS-px square fits inside the
        // target. Measured rather than derived from the size token, because
        // the token is a theme dial and the criterion is not.
        expect(
          reading.button?.width ?? 0,
          `${colorMode}: the collapsed target must fit a 24px square`,
        ).toBeGreaterThanOrEqual(24);
        expect(
          reading.button?.height ?? 0,
          `${colorMode}: the collapsed target must fit a 24px square`,
        ).toBeGreaterThanOrEqual(24);
      }
    }
  }

  expect(pageErrors).toEqual([]);
});
