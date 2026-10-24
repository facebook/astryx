// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SelectionMarks.interaction.browser.spec.ts
 * @input The built CheckboxList and RadioList Default stories, real touch
 *   input (Chromium CDP / WebKit's tap) and the interaction harness
 * @output Proofs that under a finger a checkbox or radio mark changes in the
 *   frame the selection lands, as iOS's selection marks do
 *   (motion/uikit/selection.ts): no transition is created and the first style
 *   the page computes after the change is the final one, for a checkbox, for
 *   both radios of a moving choice, and under Reduce Motion; a mouse keeps the
 *   theme's transition (the negative control); the presented frames of a tap
 *   show no colour between the two states (storyboard); and a main thread
 *   blocked right after the change keeps showing the whole mark.
 * @position Real-engine layer of the touch mark change; the stylesheet layer
 *   is Indicator/selectionMotion.test.ts.
 */

import {expect, test, type Page} from '@playwright/test';
// @ts-expect-error -- pngjs ships no declarations; runtime support is pinned.
import {PNG} from 'pngjs';
import {
  blockMainThread,
  castStoryboard,
  frames,
  openStory,
  startScreencast,
  touchDriver,
  withStorybook,
  writeEvidence,
  type CastFrame,
} from '@astryxdesign/interaction-harness';

const storybook = withStorybook(test);

type RGB = [number, number, number];

/** What the page saw in the microtask after the mark's class changed. */
interface MarkRead {
  /** The first background colour computed after the change. */
  first: string;
  /** Animations on the mark right after that computation. */
  animations: {property: string; duration: number}[];
}

const MARK = {
  checkbox: '.astryx-checkbox-indicator',
  radio: '.astryx-radio-indicator',
} as const;

/**
 * Watches the mark of the option named `name`: when React writes its new
 * state, the observer (a microtask, before any frame) computes its style once
 * and records the colour and any transition that computation started.
 */
async function watchMark(
  page: Page,
  role: 'checkbox' | 'radio',
  name: string,
): Promise<void> {
  await page.getByRole(role, {name}).evaluate(
    (input, {selector, key}) => {
      // The option's row: a CheckboxList `li`, a RadioList item.
      const row = input.closest('.astryx-item, li');
      const mark = row?.querySelector<HTMLElement>(selector);
      if (mark == null) {
        throw new Error(`no mark for ${key}`);
      }
      const reads = ((
        window as unknown as Record<string, unknown>
      ).__c06marks ??= {}) as Record<string, unknown>;
      const observer = new MutationObserver(() => {
        if (reads[key] != null) {
          return;
        }
        const first = getComputedStyle(mark).backgroundColor;
        reads[key] = {
          first,
          animations: mark.getAnimations().map(animation => ({
            property:
              (animation as CSSTransition).transitionProperty ??
              animation.constructor.name,
            duration: Number(animation.effect?.getTiming().duration ?? 0),
          })),
        };
        observer.disconnect();
      });
      observer.observe(mark, {attributes: true, attributeFilter: ['class']});
    },
    {selector: MARK[role], key: `${role}:${name}`},
  );
}

async function readMark(
  page: Page,
  role: 'checkbox' | 'radio',
  name: string,
): Promise<MarkRead> {
  const key = `${role}:${name}`;
  await page.waitForFunction(
    k =>
      ((window as unknown as Record<string, Record<string, unknown>>)
        .__c06marks ?? {})[k] != null,
    key,
  );
  return page.evaluate(
    k =>
      (window as unknown as Record<string, Record<string, MarkRead>>)
        .__c06marks[k],
    key,
  );
}

/** The mark's colour once everything has settled. */
async function settledColour(
  page: Page,
  role: 'checkbox' | 'radio',
  name: string,
): Promise<string> {
  await page.waitForTimeout(600);
  return page.getByRole(role, {name}).evaluate((input, selector) => {
    const mark = input.closest('.astryx-item, li')?.querySelector(selector);
    if (mark == null) {
      throw new Error('no mark');
    }
    return getComputedStyle(mark).backgroundColor;
  }, MARK[role]);
}

async function centreOf(page: Page, name: string, role: 'checkbox' | 'radio') {
  const box = await page.getByRole(role, {name}).evaluate((input, selector) => {
    const mark = input.closest('.astryx-item, li')?.querySelector(selector);
    if (mark == null) {
      throw new Error('no mark');
    }
    const r = mark.getBoundingClientRect();
    return {x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width};
  }, MARK[role]);
  return box;
}

/** The colour at a CSS px point of the page as presented now. */
async function pagePixel(page: Page, at: {x: number; y: number}): Promise<RGB> {
  const png = PNG.sync.read(
    await page.screenshot({
      clip: {x: Math.round(at.x), y: Math.round(at.y), width: 1, height: 1},
      scale: 'css',
      animations: 'allow',
    }),
  );
  return [png.data[0], png.data[1], png.data[2]];
}

interface DecodedFrame {
  /** Mean colour of a 3 × 3 CSS px patch around the sample point. */
  readonly colour: RGB;
  /** The frame cut down to `crop`, as a PNG frame (for a storyboard cell). */
  readonly cropped: CastFrame | null;
}

/**
 * Decodes screencast frames in a scratch page, whatever their format
 * (Chromium sends PNG, WebKit JPEG): the colour at a CSS px point of each,
 * and with `crop`, the frame cut down to that box.
 */
async function decodeFrames(
  page: Page,
  shot: ReadonlyArray<CastFrame>,
  at: {x: number; y: number},
  crop?: {x: number; y: number; width: number; height: number},
): Promise<DecodedFrame[]> {
  const scratch = await page.context().newPage();
  try {
    const decoded = await scratch.evaluate(
      async ({cast, point, box}) => {
        const out: {colour: number[]; png: string | null}[] = [];
        for (const frame of cast) {
          const bitmap = await createImageBitmap(
            await (
              await fetch(`data:image/${frame.format};base64,${frame.data}`)
            ).blob(),
          );
          const scale = bitmap.width / frame.viewportWidth;
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const context = canvas.getContext('2d');
          if (context == null) {
            throw new Error('no 2d context');
          }
          context.drawImage(bitmap, 0, 0);
          const patch = context.getImageData(
            Math.round((point.x - 1) * scale),
            Math.round((point.y - 1) * scale),
            Math.max(1, Math.round(3 * scale)),
            Math.max(1, Math.round(3 * scale)),
          ).data;
          const sum = [0, 0, 0];
          for (let i = 0; i < patch.length; i += 4) {
            sum[0] += patch[i];
            sum[1] += patch[i + 1];
            sum[2] += patch[i + 2];
          }
          const count = patch.length / 4;
          let png: string | null = null;
          if (box != null) {
            const cut = document.createElement('canvas');
            cut.width = Math.round(box.width * scale);
            cut.height = Math.round(box.height * scale);
            cut
              .getContext('2d')
              ?.drawImage(
                canvas,
                Math.round(box.x * scale),
                Math.round(box.y * scale),
                cut.width,
                cut.height,
                0,
                0,
                cut.width,
                cut.height,
              );
            const url = cut.toDataURL('image/png');
            png = url.slice(url.indexOf(',') + 1);
          }
          out.push({colour: sum.map(v => Math.round(v / count)), png});
        }
        return out;
      },
      {cast: shot, point: at, box: crop ?? null},
    );
    return decoded.map(({colour, png}, i) => ({
      colour: colour as RGB,
      cropped:
        png == null ? null : {...shot[i], format: 'png' as const, data: png},
    }));
  } finally {
    await scratch.close();
  }
}

/**
 * Within `tolerance` levels per channel. The press overlay over the box
 * fades out after the lift, darkening a mark by a few levels on the way:
 * that is the press, not the mark changing. WebKit's frames are JPEG, which
 * moves a flat colour by a few levels more.
 */
const near = (a: RGB, b: RGB, tolerance: number) =>
  a.every((v, i) => Math.abs(v - b[i]) <= tolerance);
const same = (a: RGB, b: RGB) => near(a, b, 2);
/** Further than this from both ends is a blend between the two states. */
const PRESS_TOLERANCE = 20;

test.describe('selection marks under a finger', () => {
  test('a tap changes a checkbox mark in the frame the selection lands', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-checkboxlist--default');
    const driver = await touchDriver(page);
    await watchMark(page, 'checkbox', 'SMS');
    const at = await centreOf(page, 'SMS', 'checkbox');
    await driver.tap(at);
    const read = await readMark(page, 'checkbox', 'SMS');
    await expect(page.getByRole('checkbox', {name: 'SMS'})).toBeChecked();
    // No transition was started, and the first colour the page computed is
    // the one the mark keeps.
    expect(read.animations).toEqual([]);
    expect(read.first).toBe(await settledColour(page, 'checkbox', 'SMS'));
  });

  test('a tap moves a radio choice in one frame, on both circles', async ({
    page,
  }) => {
    await openStory(page, storybook(), 'core-radiolist--default');
    const driver = await touchDriver(page);
    await driver.tap(await centreOf(page, 'Email', 'radio'));
    await expect(page.getByRole('radio', {name: 'Email'})).toBeChecked();
    await frames(page, 2);
    await watchMark(page, 'radio', 'Email');
    await watchMark(page, 'radio', 'SMS');
    await driver.tap(await centreOf(page, 'SMS', 'radio'));
    const selected = await readMark(page, 'radio', 'SMS');
    const deselected = await readMark(page, 'radio', 'Email');
    await expect(page.getByRole('radio', {name: 'SMS'})).toBeChecked();
    expect(selected.animations).toEqual([]);
    expect(deselected.animations).toEqual([]);
    expect(selected.first).toBe(await settledColour(page, 'radio', 'SMS'));
    expect(deselected.first).toBe(await settledColour(page, 'radio', 'Email'));
  });

  test('Reduce Motion keeps the one-frame change', async ({page}) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await openStory(page, storybook(), 'core-checkboxlist--default');
    const driver = await touchDriver(page);
    await watchMark(page, 'checkbox', 'Email');
    await driver.tap(await centreOf(page, 'Email', 'checkbox'));
    const read = await readMark(page, 'checkbox', 'Email');
    expect(read.animations).toEqual([]);
    expect(read.first).toBe(await settledColour(page, 'checkbox', 'Email'));
  });

  test('a mouse keeps the theme’s transition (negative control)', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: {width: 1024, height: 768},
      hasTouch: false,
      isMobile: false,
    });
    const page = await context.newPage();
    try {
      await openStory(page, storybook(), 'core-checkboxlist--default');
      await watchMark(page, 'checkbox', 'SMS');
      const at = await centreOf(page, 'SMS', 'checkbox');
      const sample = {x: at.x - at.w / 2 + 3, y: at.y};
      // Hover first, so the frames below hold the click alone.
      await page.mouse.move(at.x, at.y);
      await page.waitForTimeout(400);
      const cast = await startScreencast(page);
      await frames(page, 2);
      await page.mouse.click(at.x, at.y);
      const read = await readMark(page, 'checkbox', 'SMS');
      await page.waitForTimeout(400);
      const shot = await cast.stop();
      const themeMs = await page.evaluate(() => {
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue('--duration-fast')
          .trim();
        return value.endsWith('ms')
          ? parseFloat(value)
          : parseFloat(value) * 1000;
      });
      expect(themeMs).toBeGreaterThan(0);
      expect(read.animations).toContainEqual({
        property: 'background-color',
        duration: themeMs,
      });
      expect(read.first).not.toBe(await settledColour(page, 'checkbox', 'SMS'));
      // The instrument sees a blend when there is one: the theme's fade
      // presents frames between the two states.
      const colours = (await decodeFrames(page, shot, sample)).map(
        frame => frame.colour,
      );
      const before = colours[0];
      const after = colours[colours.length - 1];
      const between = colours.filter(
        c =>
          !near(c, before, PRESS_TOLERANCE) && !near(c, after, PRESS_TOLERANCE),
      );
      expect(between.length).toBeGreaterThan(0);
    } finally {
      await context.close();
    }
  });

  test('the frames of a tap show no colour between the two states @storyboard', async ({
    page,
  }, testInfo) => {
    await openStory(page, storybook(), 'core-checkboxlist--default');
    const driver = await touchDriver(page);
    const at = await centreOf(page, 'SMS', 'checkbox');
    // Sample inside the box, clear of the check glyph.
    const sample = {x: at.x - at.w / 2 + 3, y: at.y};
    const list = await page.getByRole('group').first().boundingBox();
    if (list == null) {
      throw new Error('no list');
    }
    const cast = await startScreencast(page);
    await frames(page, 4);
    const tapAt = Date.now();
    await driver.tap(at);
    await expect(page.getByRole('checkbox', {name: 'SMS'})).toBeChecked();
    await page.waitForTimeout(400);
    const shot = await cast.stop();
    expect(shot.length).toBeGreaterThan(1);
    const clip = {
      x: Math.max(0, Math.floor(list.x) - 8),
      y: Math.max(0, Math.floor(list.y) - 8),
      width: Math.ceil(list.width) + 16,
      height: Math.ceil(list.height) + 16,
    };
    const decoded = await decodeFrames(page, shot, sample, clip);
    const colours = decoded.map(frame => frame.colour);
    const before = colours[0];
    const after = colours[colours.length - 1];
    const between = colours.filter(
      c =>
        !near(c, before, PRESS_TOLERANCE) && !near(c, after, PRESS_TOLERANCE),
    );
    // The evidence is written first, so a failing run shows its blend.
    const storyboard = await castStoryboard(
      page,
      decoded.map((frame, i) => frame.cropped ?? shot[i]),
      {
        name: 'checkbox-mark-tap',
        zero: tapAt,
        cellScale: 1,
        columns: 4,
        data: t => {
          const i = shot.findIndex(f => f.t === t);
          return {box: i < 0 ? '' : `rgb(${colours[i].join(',')})`};
        },
      },
    );
    await storyboard.write(testInfo, {
      claim:
        'under a finger the mark changes in one frame (motion/uikit/selection.ts)',
      sample,
      before,
      after,
      blendFrames: between.length,
    });
    expect(same(before, after)).toBe(false);
    // Every presented frame shows one state or the other, never a blend.
    expect(between).toEqual([]);
  });

  test('a main thread blocked right after the change shows the whole mark', async ({
    page,
  }, testInfo) => {
    await openStory(page, storybook(), 'core-checkboxlist--default');
    const driver = await touchDriver(page);
    const at = await centreOf(page, 'Push notification', 'checkbox');
    const sample = {x: at.x - at.w / 2 + 3, y: at.y};
    const restColour = await pagePixel(page, sample);
    await driver.tap(at);
    await expect(
      page.getByRole('checkbox', {name: 'Push notification'}),
    ).toBeChecked();
    // The change has been presented; now the app does 500 ms of work.
    await frames(page, 1);
    const cast = await startScreencast(page);
    const busy = await blockMainThread(page, 500);
    await frames(page, 2);
    const shot = await cast.stop();
    const inBlock = shot.filter(f => f.t >= busy.from && f.t <= busy.to);
    const colours = (
      await decodeFrames(page, inBlock.length > 0 ? inBlock : shot, sample)
    ).map(frame => frame.colour);
    // Whatever the block lets through shows the checked mark, whole.
    for (const colour of colours) {
      expect(near(colour, restColour, PRESS_TOLERANCE)).toBe(false);
      expect(near(colour, colours[0], 8)).toBe(true);
    }
    await writeEvidence(
      'selection-marks/busy-after-change',
      {
        'trace.json': JSON.stringify(
          {busy, frames: shot.length, inBlock: inBlock.length, colours},
          null,
          2,
        ),
      },
      testInfo,
    );
  });
});
