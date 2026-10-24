// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SpinnerMotion.a11y.chromium.spec.ts
 * @input Built Spinner stories in real Chromium (CDP screencast and tracing)
 * @output Browser evidence that the ring turns on the compositor: it keeps
 *   turning while a script holds the main thread, paints nothing per frame,
 *   turns clockwise at a constant rate once per period, and keeps every ring
 *   on the page in phase. Writes a storyboard (contact sheet + JSON trace) to
 *   test-results/spinner-motion/.
 * @position Chromium proof for Spinner's rotor; the iOS Safari side of the
 *   same proof is a simulator recording attached to the pull request.
 *
 * SYNC: Keep the timings here equal to Spinner.tsx (`styles.rotor`).
 */

import fs from 'node:fs';
import path from 'node:path';
import {expect, test, type Locator, type Page} from '@playwright/test';
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
// meant to outlive the run goes where ASTRYX_MOTION_EVIDENCE points.
const EVIDENCE = path.resolve(
  process.env.ASTRYX_MOTION_EVIDENCE ??
    path.join('test-results', 'spinner-motion'),
);
const BLOCK_MS = 700;
const DPR = 2;

test.use({viewport: {width: 402, height: 420}, deviceScaleFactor: DPR});

/**
 * The rotor: the first hidden span in the box. The touch glyph comes after it
 * (and is not displayed under a fine pointer).
 */
const rotorOf = (spinner: Locator) =>
  spinner.locator('span[aria-hidden="true"]').first();

/** The four sizes, sm → xl, each with its rotor. */
async function openSizes(page: Page) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=core-spinner--sizes&viewMode=story`,
  );
  const spinners = page.locator('.astryx-spinner');
  await expect(spinners).toHaveCount(4);
  // Every rotor is running and has been pinned to the timeline origin.
  await page.waitForFunction(() => {
    const animations = document.getAnimations();
    return (
      animations.length >= 4 &&
      animations.every(a => a.playState === 'running' && a.startTime === 0)
    );
  });
  return spinners;
}

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
  /** Presentation time, epoch ms. */
  readonly t: number;
  readonly data: string;
}

/** Compositor frames, captured off the main thread. */
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

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A checksum of each box in each frame, decoded in a scratch page. */
async function checksums(
  page: Page,
  frames: ReadonlyArray<Frame>,
  boxes: ReadonlyArray<Box>,
): Promise<number[][]> {
  const scratch = await page.context().newPage();
  const viewportWidth = page.viewportSize()?.width ?? 402;
  try {
    const out: number[][] = [];
    for (let i = 0; i < frames.length; i += 10) {
      const batch = frames.slice(i, i + 10).map(f => f.data);
      out.push(
        ...(await scratch.evaluate(
          async ({items, crops, vw}) => {
            const result: number[][] = [];
            for (const item of items) {
              const blob = await (
                await fetch(`data:image/png;base64,${item}`)
              ).blob();
              const bitmap = await createImageBitmap(blob);
              const scale = bitmap.width / vw;
              const sums: number[] = [];
              for (const box of crops) {
                const w = Math.ceil(box.width * scale);
                const h = Math.ceil(box.height * scale);
                const canvas = new OffscreenCanvas(w, h);
                const context = canvas.getContext('2d');
                if (context == null) {
                  throw new Error('no 2d context');
                }
                context.drawImage(
                  bitmap,
                  Math.floor(box.x * scale),
                  Math.floor(box.y * scale),
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
              result.push(sums);
            }
            return result;
          },
          {items: batch, crops: boxes, vw: viewportWidth},
        )),
      );
    }
    return out;
  } finally {
    await scratch.close();
  }
}

/** The rotor's angle in degrees, read from its computed matrix. */
function angleOf(transform: string): number {
  const match = /matrix\(([^)]+)\)/.exec(transform);
  if (match == null) {
    return 0;
  }
  const [a, b] = match[1].split(',').map(Number);
  const degrees = (Math.atan2(b, a) * 180) / Math.PI;
  return (degrees + 360) % 360;
}

test('the ring keeps turning while a script holds the main thread', async ({
  page,
}) => {
  const spinners = await openSizes(page);
  const boxes: Box[] = [];
  for (let i = 0; i < 4; i += 1) {
    const box = await spinners.nth(i).boundingBox();
    if (box == null) {
      throw new Error('no spinner box');
    }
    boxes.push(box);
  }
  const cast = await startScreencast(page);
  await page.waitForTimeout(300);
  const busy = await blockMainThread(page, BLOCK_MS);
  await page.waitForTimeout(200);
  const frames = await cast.stop();
  const sums = await checksums(page, frames, boxes);

  // Judge the block's inside, a frame clear of each edge.
  const from = busy.from + 20;
  const to = busy.to - 20;
  const inside = frames
    .map((frame, i) => ({t: frame.t, sums: sums[i]}))
    .filter(f => f.t >= from && f.t <= to);
  const expected = Math.floor((to - from) / (1000 / 60));
  // The compositor keeps presenting frames at display rate…
  expect(inside.length).toBeGreaterThanOrEqual(Math.floor(expected * 0.85));
  // …and every ring moves in nearly every one of them.
  for (let ring = 0; ring < 4; ring += 1) {
    let changed = 0;
    let longestStall = 0;
    let last = from;
    for (let i = 1; i < inside.length; i += 1) {
      if (inside[i].sums[ring] !== inside[i - 1].sums[ring]) {
        changed += 1;
        longestStall = Math.max(longestStall, inside[i].t - last);
        last = inside[i].t;
      }
    }
    longestStall = Math.max(longestStall, to - last);
    expect(changed, `ring ${ring} frames changed`).toBeGreaterThanOrEqual(
      Math.floor((inside.length - 1) * 0.9),
    );
    expect(longestStall, `ring ${ring} longest stall`).toBeLessThanOrEqual(50);
  }
});

test('turning paints nothing on the main thread', async ({page, browser}) => {
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
  // Four rings turning for a second: a paint animation repainted every frame
  // (330 paints here before the rotor); a transform animation paints none.
  expect(count('Paint')).toBe(0);
  expect(count('Layout')).toBe(0);
});

test('the arc turns clockwise at a constant rate, once per period', async ({
  page,
}) => {
  const spinners = await openSizes(page);
  const rotor = rotorOf(spinners.first());
  const samples = await rotor.evaluate(element => {
    const [animation] = element.getAnimations();
    animation.pause();
    const duration = Number(animation.effect?.getTiming().duration);
    const out: {t: number; transform: string}[] = [];
    for (let i = 0; i <= 8; i += 1) {
      // Inside the period at both ends: 0, P/8 … P − 1 ms.
      const t = i === 8 ? duration - 1 : (duration * i) / 8;
      animation.currentTime = t;
      out.push({t, transform: getComputedStyle(element).transform});
    }
    return {
      duration,
      cssDuration: getComputedStyle(element).animationDuration,
      easing: animation.effect?.getTiming().easing,
      out,
    };
  });
  // The period is the `--duration-slow-min` token the theme resolves.
  expect(samples.duration).toBeGreaterThan(0);
  expect(Number.parseFloat(samples.cssDuration) * 1000).toBeCloseTo(
    samples.duration,
    3,
  );
  expect(samples.easing).toBe('linear');
  // Angle = 360 × t / P, clockwise (positive in CSS), at every sample.
  for (const {t, transform} of samples.out) {
    const expected = ((360 * t) / samples.duration) % 360;
    const actual = angleOf(transform);
    const error = Math.min(
      Math.abs(actual - expected),
      360 - Math.abs(actual - expected),
    );
    expect(error, `angle at ${t.toFixed(1)} ms`).toBeLessThan(0.5);
  }
});

test('reduced motion slows the ring to 3 s per turn, as before, still clockwise and still turning', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const spinners = await openSizes(page);
  const rotor = spinners.first().locator('span[aria-hidden="true"]');
  const samples = await rotor.evaluate(element => {
    const [animation] = element.getAnimations();
    animation.pause();
    const duration = Number(animation.effect?.getTiming().duration);
    const out: {t: number; transform: string}[] = [];
    for (let i = 0; i < 4; i += 1) {
      const t = (duration * i) / 4;
      animation.currentTime = t;
      out.push({t, transform: getComputedStyle(element).transform});
    }
    return {
      duration,
      iterations: animation.effect?.getTiming().iterations,
      out,
    };
  });
  // The reduced-motion period this component had before the change: slowed,
  // never frozen (`Spinner.tsx`, `animationDuration` under the media query).
  expect(samples.duration).toBe(3000);
  expect(samples.iterations).toBe(Infinity);
  for (const {t, transform} of samples.out) {
    const expected = (360 * t) / samples.duration;
    const actual = angleOf(transform);
    const error = Math.min(
      Math.abs(actual - expected),
      360 - Math.abs(actual - expected),
    );
    expect(error, `angle at ${t} ms`).toBeLessThan(0.5);
  }
});

test('every ring on the page turns in phase', async ({page}) => {
  await openSizes(page);
  const angles = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        '.astryx-spinner > span[aria-hidden="true"]:has(> svg)',
      ),
    ).map(rotor => {
      const [animation] = rotor.getAnimations();
      return {
        startTime: animation.startTime,
        currentTime: animation.currentTime,
      };
    }),
  );
  expect(angles).toHaveLength(4);
  for (const angle of angles) {
    expect(angle.startTime).toBe(0);
    expect(angle.currentTime).toBe(angles[0].currentTime);
  }
});

test('storyboard: one revolution, frame by frame @storyboard', async ({
  page,
}, testInfo) => {
  const spinners = await openSizes(page);
  const xl = spinners.nth(3);
  const rotor = rotorOf(xl);
  const duration = await rotor.evaluate(element => {
    for (const animation of document.getAnimations()) {
      animation.pause();
    }
    return Number(element.getAnimations()[0].effect?.getTiming().duration);
  });
  const step = 1000 / 60;
  const frames: {t: number; angle: number; png: string}[] = [];
  for (let t = 0; t < duration; t += step) {
    const transform = await rotor.evaluate((element, time) => {
      element.getAnimations()[0].currentTime = time;
      return getComputedStyle(element).transform;
    }, t);
    const png = (await xl.screenshot()).toString('base64');
    frames.push({t: Math.round(t * 10) / 10, angle: angleOf(transform), png});
  }
  // The trace is the assertion: the angle advances by the same step every
  // frame, so the ring never stalls, jumps or reverses inside a period.
  const perFrame = (360 * step) / duration;
  for (let i = 1; i < frames.length; i += 1) {
    const delta = (frames[i].angle - frames[i - 1].angle + 360) % 360;
    expect(delta).toBeCloseTo(perFrame, 1);
  }
  fs.mkdirSync(EVIDENCE, {recursive: true});
  fs.writeFileSync(
    path.join(EVIDENCE, 'spinner-ring-cycle.json'),
    JSON.stringify(
      {
        story: 'core-spinner--sizes (xl)',
        duration,
        frames: frames.map(({t, angle}) => ({t, angle})),
      },
      null,
      1,
    ),
  );
  // The contact sheet: every frame of the revolution, in order.
  const sheet = await page.context().newPage();
  try {
    const png = await sheet.evaluate(
      async items => {
        const decoded = await Promise.all(
          items.map(async item =>
            createImageBitmap(
              await (await fetch(`data:image/png;base64,${item}`)).blob(),
            ),
          ),
        );
        const w = decoded[0].width;
        const h = decoded[0].height;
        const cols = 12;
        const rows = Math.ceil(decoded.length / cols);
        const canvas = new OffscreenCanvas(
          cols * (w + 4) + 4,
          rows * (h + 4) + 4,
        );
        const context = canvas.getContext('2d');
        if (context == null) {
          throw new Error('no 2d context');
        }
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        decoded.forEach((bitmap, i) => {
          context.drawImage(
            bitmap,
            4 + (i % cols) * (w + 4),
            4 + Math.floor(i / cols) * (h + 4),
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
      frames.map(f => f.png),
    );
    fs.writeFileSync(
      path.join(EVIDENCE, 'spinner-ring-cycle.png'),
      Buffer.from(png, 'base64'),
    );
    await testInfo.attach('spinner-ring-cycle.png', {
      path: path.join(EVIDENCE, 'spinner-ring-cycle.png'),
      contentType: 'image/png',
    });
  } finally {
    await sheet.close();
  }
});
