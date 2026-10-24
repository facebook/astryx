// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SpinnerTouch.a11y.chromium.spec.ts
 * @input Built Spinner stories in real Chromium with a coarse (touch) pointer
 *   (CDP screencast and tracing)
 * @output Browser evidence that under a finger on iOS the spinner draws
 *   UIKit's activity indicator and runs it on the compositor: the ring gives
 *   way to eight spokes, the head keeps stepping while a script holds the
 *   main thread, nothing paints per frame, every frame of the cycle matches
 *   UIKit's, and reduced motion keeps the pace; and that a finger anywhere
 *   else (Chromium as an Android phone) keeps the ring. Writes a storyboard
 *   (contact sheet + JSON trace) to test-results/spinner-touch/.
 * @position Chromium proof for Spinner's touch presentation. The iOS gate is
 *   `@supports (-webkit-touch-callout: none)` inside the touch query, which
 *   only WebKit on iOS matches: the iOS tests emulate it in Chromium by
 *   rewriting those rules to a condition Chromium meets
 *   (`emulateIosWebKit`); the real iOS Safari side is a simulator recording
 *   attached to the pull request.
 *
 * SYNC: Keep in step with Spinner.tsx (`spokeFade`, `spokeStyles`) and
 * motion/uikit/progress.ts.
 */

import fs from 'node:fs';
import path from 'node:path';
import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';
import {progress} from '../../motion/uikit/progress';

let storybook: StaticServer;
test.beforeAll(async () => {
  storybook = await serveStorybook(
    process.env.ASTRYX_STORYBOOK_DIR ?? DEFAULT_STORYBOOK_DIR,
  );
});
test.afterAll(async () => {
  await storybook?.close();
});

const EVIDENCE = path.resolve(
  process.env.ASTRYX_MOTION_EVIDENCE ??
    path.join('test-results', 'spinner-touch'),
);
const BLOCK_MS = 700;
const DPR = 3;
const INDICATOR = progress.activityIndicator;
const FRAME_MS = INDICATOR.cycleMs / INDICATOR.framesPerCycle;

test.use({
  viewport: {width: 402, height: 420},
  deviceScaleFactor: DPR,
  hasTouch: true,
  isMobile: true,
});

/** UIKit's weight for a spoke the head reached `framesAgo` frames ago. */
function weight(framesAgo: number): number {
  const alphas = INDICATOR.spokeAlphas;
  return alphas[Math.min(framesAgo, alphas.length - 1)] / INDICATOR.colorAlpha;
}

/** Spoke `index`'s weight in frame `frame` of the cycle, per the table. */
function expectedWeight(index: number, frame: number): number {
  const reached =
    INDICATOR.framesPerSpoke *
    ((index - INDICATOR.headSpokeAtStart + INDICATOR.spokeCount) %
      INDICATOR.spokeCount);
  const framesAgo =
    (frame - reached + INDICATOR.framesPerCycle) % INDICATOR.framesPerCycle;
  return weight(framesAgo);
}

/**
 * Makes Chromium take the iOS gate: every `@supports (-webkit-touch-callout:
 * none)` rule (only WebKit on iOS implements the property) is rewritten to a
 * condition Chromium meets, keeping the touch query inside it, and
 * `CSS.supports` answers the same for script. Everything else is Chromium's.
 */
async function emulateIosWebKit(page: Page) {
  await page.evaluate(() => {
    const original = CSS.supports.bind(CSS);
    CSS.supports = (condition: string, value?: string) =>
      `${condition}${value ?? ''}`.includes('-webkit-touch-callout') ||
      (value === undefined ? original(condition) : original(condition, value));
    const visit = (owner: CSSStyleSheet | CSSGroupingRule) => {
      const rules = owner.cssRules;
      for (let i = 0; i < rules.length; i += 1) {
        const rule = rules[i];
        if (
          rule instanceof CSSSupportsRule &&
          rule.conditionText.includes('-webkit-touch-callout')
        ) {
          const inner = Array.from(rule.cssRules, r => r.cssText).join('\n');
          owner.deleteRule(i);
          owner.insertRule(`@supports (display: block) {${inner}}`, i);
        } else if (rule instanceof CSSGroupingRule) {
          visit(rule);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        visit(sheet);
      } catch {
        // a cross-origin sheet
      }
    }
  });
}

/** The four sizes, on iOS (emulated); every glyph is showing and running. */
async function openSizes(page: Page) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-spinner--sizes&viewMode=story`,
  );
  const spinners = page.locator('.astryx-spinner');
  await expect(spinners).toHaveCount(4);
  await emulateIosWebKit(page);
  await page.waitForFunction(
    () =>
      document.getAnimations().filter(a => a.playState === 'running').length >=
      32,
  );
  return spinners;
}

/** Each spinner's glyph: the last child, holding the eight spokes. */
const glyphOf = (page: Page, index: number) =>
  page.locator('.astryx-spinner').nth(index).locator('> span').last();

test('under a finger on iOS the ring gives way to UIKit’s eight spokes', async ({
  page,
}) => {
  await openSizes(page);
  const state = await page.evaluate(() => ({
    coarse: matchMedia('(pointer: coarse)').matches,
    spinners: Array.from(document.querySelectorAll('.astryx-spinner')).map(
      spinner => {
        const parts = Array.from(spinner.children);
        const glyph = parts[parts.length - 1];
        return {
          visible: parts.map(part => getComputedStyle(part).display),
          spokes: glyph.children.length,
          box: spinner.getBoundingClientRect().width,
        };
      },
    ),
  }));
  expect(state.coarse).toBe(true);
  for (const spinner of state.spinners) {
    // Track svg and rotor hidden, glyph shown.
    expect(spinner.visible).toEqual(['none', 'none', 'block']);
    expect(spinner.spokes).toBe(INDICATOR.spokeCount);
  }
  // The boxes keep their sizes: 14, 20, 24 and 36 px.
  expect(state.spinners.map(s => s.box)).toEqual([14, 20, 24, 36]);
});

test('a finger outside iOS (Chromium as an Android phone) keeps the ring, turning', async ({
  page,
}) => {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-spinner--sizes&viewMode=story`,
  );
  await expect(page.locator('.astryx-spinner')).toHaveCount(4);
  const state = await page.evaluate(() => ({
    coarse: matchMedia('(pointer: coarse)').matches,
    callout: CSS.supports('-webkit-touch-callout', 'none'),
    spinners: Array.from(document.querySelectorAll('.astryx-spinner')).map(
      spinner => {
        const parts = Array.from(spinner.children);
        const rotor = parts[1];
        return {
          visible: parts.map(part => getComputedStyle(part).display),
          rotor: rotor
            .getAnimations()
            .map(a => `${a.playState} ${a.effect?.getTiming().iterations}`),
        };
      },
    ),
  }));
  expect(state.coarse).toBe(true);
  expect(state.callout).toBe(false);
  for (const spinner of state.spinners) {
    // Track svg and rotor shown, the iOS glyph hidden: today's ring.
    expect(spinner.visible).toEqual(['block', 'block', 'none']);
    expect(spinner.rotor).toEqual(['running Infinity']);
  }
});

test('every frame of the cycle matches UIKit’s, and reduced motion keeps the pace', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await openSizes(page);
  const glyph = glyphOf(page, 1);
  const frames = await glyph.evaluate((element, frameMs) => {
    const spokes = Array.from(element.children);
    const animations = spokes.map(spoke => spoke.getAnimations()[0]);
    for (const animation of animations) {
      animation.pause();
    }
    const out: number[][] = [];
    for (let frame = 0; frame < 16; frame += 1) {
      for (const animation of animations) {
        // The document's view of the cycle: every spoke at the same instant.
        animation.currentTime = (frame + 0.5) * frameMs;
      }
      out.push(spokes.map(spoke => Number(getComputedStyle(spoke).opacity)));
    }
    return {
      out,
      durations: animations.map(a => Number(a.effect?.getTiming().duration)),
      easing: animations.map(a => a.effect?.getTiming().easing),
    };
  }, FRAME_MS);
  // Reduced motion leaves the indicator unchanged, as UIKit does.
  expect(new Set(frames.durations)).toEqual(new Set([INDICATOR.cycleMs]));
  expect(new Set(frames.easing)).toEqual(new Set(['linear']));
  frames.out.forEach((opacities, frame) => {
    opacities.forEach((opacity, index) => {
      expect(opacity, `frame ${frame} spoke ${index}`).toBeCloseTo(
        expectedWeight(index, frame),
        3,
      );
    });
  });
  // The head starts at 9 o'clock and is the brightest spoke.
  const first = frames.out[0];
  expect(first.indexOf(Math.max(...first))).toBe(INDICATOR.headSpokeAtStart);
});

test('in RTL the indicator is not mirrored and still steps clockwise, as UIKit does', async ({
  page,
}) => {
  await openSizes(page);
  const glyph = glyphOf(page, 1);
  const heads = await glyph.evaluate((element, frameMs) => {
    (element.closest('[dir]') as HTMLElement).setAttribute('dir', 'rtl');
    const spokes = Array.from(element.children) as HTMLElement[];
    const animations = spokes.map(spoke => spoke.getAnimations()[0]);
    for (const animation of animations) {
      animation.pause();
    }
    const box = element.getBoundingClientRect();
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const out: number[] = [];
    // One spoke every two frames: the head's place on screen at four steps.
    for (const frame of [0, 2, 4, 6]) {
      for (const animation of animations) {
        animation.currentTime = (frame + 0.5) * frameMs;
      }
      const opacities = spokes.map(spoke =>
        Number(getComputedStyle(spoke).opacity),
      );
      const head = spokes[opacities.indexOf(Math.max(...opacities))];
      const capsule = (
        head.querySelector('rect') as Element
      ).getBoundingClientRect();
      const dx = capsule.x + capsule.width / 2 - cx;
      const dy = capsule.y + capsule.height / 2 - cy;
      // Degrees clockwise from 12 o'clock, on screen.
      out.push(Math.round(((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360));
    }
    return {
      direction: getComputedStyle(element).direction,
      transform: getComputedStyle(element).transform,
      out,
    };
  }, FRAME_MS);
  expect(heads.direction).toBe('rtl');
  expect(heads.transform).toBe('none');
  // 9 o'clock, then 10:30, 12 and 1:30: clockwise, as in LTR.
  const expected = [270, 315, 0, 45];
  heads.out.forEach((angle, i) => {
    const error = Math.min(
      Math.abs(angle - expected[i]),
      360 - Math.abs(angle - expected[i]),
    );
    expect(error, `step ${i}: ${angle}°`).toBeLessThanOrEqual(3);
  });
});

/** Holds the main thread with a synchronous loop; returns when it ran. */
async function blockMainThread(page: Page, ms: number) {
  return page.evaluate(duration => {
    const from = performance.timeOrigin + performance.now();
    const end = performance.now() + duration;
    while (performance.now() < end) {
      // hold
    }
    return {from, to: performance.timeOrigin + performance.now()};
  }, ms);
}

interface Frame {
  readonly t: number;
  readonly data: string;
}

async function startScreencast(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  const frames: Frame[] = [];
  cdp.on('Page.screencastFrame', frame => {
    frames.push({
      t: (frame.metadata.timestamp ?? Date.now() / 1000) * 1000,
      data: frame.data,
    });
    cdp
      .send('Page.screencastFrameAck', {sessionId: frame.sessionId})
      .catch(() => {});
  });
  const viewport = page.viewportSize() ?? {width: 402, height: 420};
  await cdp.send('Page.startScreencast', {
    format: 'png',
    maxWidth: viewport.width * DPR,
    maxHeight: viewport.height * DPR,
    everyNthFrame: 1,
  });
  return {
    async stop() {
      await cdp.send('Page.stopScreencast');
      await cdp.detach().catch(() => {});
      return frames;
    },
  };
}

/** A checksum of one box in each frame, decoded in a scratch page. */
async function checksums(
  page: Page,
  frames: ReadonlyArray<Frame>,
  box: {x: number; y: number; width: number; height: number},
): Promise<number[]> {
  const scratch = await page.context().newPage();
  const vw = page.viewportSize()?.width ?? 402;
  try {
    const out: number[] = [];
    for (let i = 0; i < frames.length; i += 10) {
      out.push(
        ...(await scratch.evaluate(
          async ({items, crop, viewportWidth}) => {
            const sums: number[] = [];
            for (const item of items) {
              const bitmap = await createImageBitmap(
                await (await fetch(`data:image/png;base64,${item}`)).blob(),
              );
              const scale = bitmap.width / viewportWidth;
              const w = Math.ceil(crop.width * scale);
              const h = Math.ceil(crop.height * scale);
              const canvas = new OffscreenCanvas(w, h);
              const context = canvas.getContext('2d');
              if (context == null) {
                throw new Error('no 2d context');
              }
              context.drawImage(
                bitmap,
                Math.floor(crop.x * scale),
                Math.floor(crop.y * scale),
                w,
                h,
                0,
                0,
                w,
                h,
              );
              const {data} = context.getImageData(0, 0, w, h);
              let sum = 0;
              for (let p = 0; p < data.length; p += 4) {
                sum =
                  (sum * 31 + data[p] * 3 + data[p + 1] * 5 + data[p + 2]) %
                  1000000007;
              }
              sums.push(sum);
            }
            return sums;
          },
          {
            items: frames.slice(i, i + 10).map(f => f.data),
            crop: box,
            viewportWidth: vw,
          },
        )),
      );
    }
    return out;
  } finally {
    await scratch.close();
  }
}

test('the head keeps stepping while a script holds the main thread', async ({
  page,
}) => {
  await openSizes(page);
  const box = await page.locator('.astryx-spinner').nth(3).boundingBox();
  if (box == null) {
    throw new Error('no spinner box');
  }
  const cast = await startScreencast(page);
  await page.waitForTimeout(300);
  const busy = await blockMainThread(page, BLOCK_MS);
  await page.waitForTimeout(200);
  const frames = await cast.stop();
  const sums = await checksums(page, frames, box);
  const from = busy.from + 20;
  const to = busy.to - 20;
  const inside = frames
    .map((frame, i) => ({t: frame.t, sum: sums[i]}))
    .filter(f => f.t >= from && f.t <= to);
  let changes = 0;
  let longestStill = 0;
  let last = from;
  for (let i = 1; i < inside.length; i += 1) {
    if (inside[i].sum !== inside[i - 1].sum) {
      changes += 1;
      longestStill = Math.max(longestStill, inside[i].t - last);
      last = inside[i].t;
    }
  }
  longestStill = Math.max(longestStill, to - last);
  // A new image every 50 ms, block or no block.
  expect(changes).toBeGreaterThanOrEqual(
    Math.floor(((to - from) / FRAME_MS) * 0.8),
  );
  expect(longestStill).toBeLessThanOrEqual(FRAME_MS + 25);
});

test('stepping paints nothing on the main thread', async ({page, browser}) => {
  await openSizes(page);
  await page.waitForTimeout(200);
  await browser.startTracing(page, {
    categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'],
  });
  await page.waitForTimeout(1000);
  const trace = JSON.parse((await browser.stopTracing()).toString()) as {
    traceEvents: {
      name: string;
      ph: string;
      pid: number;
      tid: number;
      args?: {name?: string};
    }[];
  };
  const mainThreads = new Set(
    trace.traceEvents
      .filter(e => e.ph === 'M' && e.name === 'thread_name')
      .filter(e => e.args?.name === 'CrRendererMain')
      .map(e => `${e.pid}:${e.tid}`),
  );
  const count = (name: string) =>
    trace.traceEvents.filter(
      e => e.name === name && mainThreads.has(`${e.pid}:${e.tid}`),
    ).length;
  expect(count('Paint')).toBe(0);
  expect(count('Layout')).toBe(0);
});

test('storyboard: the 16 frames of a cycle @storyboard', async ({
  page,
}, testInfo) => {
  await openSizes(page);
  const shots: {frame: number; md: string; xl: string; opacities: number[]}[] =
    [];
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      animation.pause();
    }
  });
  for (let frame = 0; frame < INDICATOR.framesPerCycle; frame += 1) {
    const opacities = await page.evaluate(
      ({time}) => {
        for (const animation of document.getAnimations()) {
          animation.currentTime = time;
        }
        const glyph = document.querySelectorAll('.astryx-spinner')[1]
          .lastElementChild as Element;
        return Array.from(glyph.children).map(spoke =>
          Number(getComputedStyle(spoke).opacity),
        );
      },
      {time: (frame + 0.5) * FRAME_MS},
    );
    shots.push({
      frame,
      opacities,
      md: (await page.locator('.astryx-spinner').nth(1).screenshot()).toString(
        'base64',
      ),
      xl: (await page.locator('.astryx-spinner').nth(3).screenshot()).toString(
        'base64',
      ),
    });
  }
  // The trace is the assertion: each frame matches UIKit's table.
  for (const {frame, opacities} of shots) {
    opacities.forEach((opacity, index) => {
      expect(opacity).toBeCloseTo(expectedWeight(index, frame), 3);
    });
  }
  fs.mkdirSync(EVIDENCE, {recursive: true});
  fs.writeFileSync(
    path.join(EVIDENCE, 'spinner-touch-cycle.json'),
    JSON.stringify(
      {
        story: 'core-spinner--sizes (md, xl) under a coarse pointer',
        frameMs: FRAME_MS,
        frames: shots.map(({frame, opacities}) => ({
          frame,
          t: frame * FRAME_MS,
          opacities: opacities.map(o => Math.round(o * 1000) / 1000),
        })),
      },
      null,
      1,
    ),
  );
  const sheet = await page.context().newPage();
  try {
    const png = await sheet.evaluate(
      async rows => {
        const decode = async (item: string) =>
          createImageBitmap(
            await (await fetch(`data:image/png;base64,${item}`)).blob(),
          );
        const md = await Promise.all(rows.map(async r => decode(r.md)));
        const xl = await Promise.all(rows.map(async r => decode(r.xl)));
        const cell = Math.max(xl[0].width, xl[0].height) + 8;
        const canvas = new OffscreenCanvas(rows.length * cell, cell * 2);
        const context = canvas.getContext('2d');
        if (context == null) {
          throw new Error('no 2d context');
        }
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        rows.forEach((_, i) => {
          context.drawImage(
            md[i],
            i * cell + (cell - md[i].width) / 2,
            (cell - md[i].height) / 2,
          );
          context.drawImage(
            xl[i],
            i * cell + (cell - xl[i].width) / 2,
            cell + (cell - xl[i].height) / 2,
          );
        });
        const blob = await canvas.convertToBlob({type: 'image/png'});
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = '';
        for (const byte of bytes) {
          binary += String.fromCharCode(byte);
        }
        return btoa(binary);
      },
      shots.map(({md, xl}) => ({md, xl})),
    );
    fs.writeFileSync(
      path.join(EVIDENCE, 'spinner-touch-cycle.png'),
      Buffer.from(png, 'base64'),
    );
    await testInfo.attach('spinner-touch-cycle.png', {
      path: path.join(EVIDENCE, 'spinner-touch-cycle.png'),
      contentType: 'image/png',
    });
  } finally {
    await sheet.close();
  }
});
