// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ProgressBarMotion.a11y.chromium.spec.ts
 * @input Built ProgressBar stories in real Chromium (CDP screencast, tracing)
 * @output Browser evidence that a determinate value change moves the fill on
 *   the compositor: it keeps moving while a script holds the main thread,
 *   lays out and paints nothing per frame, and its leading edge lands on the
 *   value (mirrored in RTL). Writes a storyboard (contact sheet + JSON trace)
 *   to test-results/progress-bar-motion/.
 * @position Chromium proof for ProgressBar's sliding fill; the iOS Safari side
 *   of the same proof is a simulator recording attached to the pull request.
 *
 * SYNC: Keep in step with ProgressBar.tsx (`styles.fill`, `styles.track`).
 */

import fs from 'node:fs';
import path from 'node:path';
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

// Playwright empties test-results/ at the start of every run, so evidence
// meant to outlive the run goes where ASTRYX_MOTION_EVIDENCE points.
const EVIDENCE = path.resolve(
  process.env.ASTRYX_MOTION_EVIDENCE ??
    path.join('test-results', 'progress-bar-motion'),
);
const STORY = 'core-progressbar--default';
const BLOCK_MS = 700;
const DPR = 2;

test.use({viewport: {width: 402, height: 200}, deviceScaleFactor: DPR});

async function open(page: Page, value: number) {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  await expect(page.getByRole('progressbar')).toBeVisible();
  await setValue(page, value);
  // Let any transition from the story's own value finish.
  await page.waitForTimeout(800);
}

/** Re-renders the story with a new value and resolves once it rendered. */
async function setValue(page: Page, value: number) {
  await page.evaluate(
    async ({storyId, updatedArgs}) =>
      new Promise<void>(resolve => {
        const channel = (
          window as unknown as {
            __STORYBOOK_ADDONS_CHANNEL__: {
              emit: (event: string, payload: unknown) => void;
              once: (event: string, handler: () => void) => void;
            };
          }
        ).__STORYBOOK_ADDONS_CHANNEL__;
        channel.once('storyRendered', () => resolve());
        channel.emit('updateStoryArgs', {storyId, updatedArgs});
        setTimeout(resolve, 1500);
      }),
    {storyId: STORY, updatedArgs: {value}},
  );
}

/**
 * Sets a new value and, once the fill's transition has started and one more
 * frame has been presented, holds the main thread: the pattern of a progress
 * update followed by the work it reports on. Returns the block's start and
 * end (epoch ms).
 */
async function setValueThenBlock(page: Page, value: number, ms: number) {
  return page.evaluate(
    async ({storyId, updatedArgs, duration}) =>
      new Promise<{from: number; to: number}>(resolve => {
        const channel = (
          window as unknown as {
            __STORYBOOK_ADDONS_CHANNEL__: {
              emit: (event: string, payload: unknown) => void;
              once: (event: string, handler: () => void) => void;
            };
          }
        ).__STORYBOOK_ADDONS_CHANNEL__;
        const onStart = (event: Event) => {
          const bar = document.querySelector('[role="progressbar"]');
          if (bar == null || !bar.contains(event.target as Node)) {
            return;
          }
          document.removeEventListener('transitionstart', onStart, true);
          requestAnimationFrame(() =>
            setTimeout(() => {
              const from = performance.timeOrigin + performance.now();
              const end = performance.now() + duration;
              while (performance.now() < end) {
                // hold
              }
              resolve({from, to: performance.timeOrigin + performance.now()});
            }),
          );
        };
        document.addEventListener('transitionstart', onStart, true);
        channel.emit('updateStoryArgs', {storyId, updatedArgs});
      }),
    {storyId: STORY, updatedArgs: {value}, duration: ms},
  );
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
  const viewport = page.viewportSize() ?? {width: 402, height: 200};
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

async function trackBox(page: Page): Promise<Box> {
  const box = await page.getByRole('progressbar').boundingBox();
  if (box == null) {
    throw new Error('no track box');
  }
  return box;
}

/**
 * The fill's leading edge in each frame, in CSS px from the track's start:
 * along the track's middle row, the last pixel that still has the fill's
 * color (sampled at the track's start, where the fill always is once p > 0).
 */
async function leadingEdges(
  page: Page,
  frames: ReadonlyArray<Frame>,
  track: Box,
): Promise<number[]> {
  const scratch = await page.context().newPage();
  const viewportWidth = page.viewportSize()?.width ?? 402;
  try {
    const out: number[] = [];
    for (let i = 0; i < frames.length; i += 10) {
      const batch = frames.slice(i, i + 10).map(f => f.data);
      out.push(
        ...(await scratch.evaluate(
          async ({items, box, vw}) => {
            const result: number[] = [];
            for (const item of items) {
              const bitmap = await createImageBitmap(
                await (await fetch(`data:image/png;base64,${item}`)).blob(),
              );
              const scale = bitmap.width / vw;
              const w = Math.round(box.width * scale);
              const canvas = new OffscreenCanvas(w, 1);
              const context = canvas.getContext('2d');
              if (context == null) {
                throw new Error('no 2d context');
              }
              const y = Math.round((box.y + box.height / 2) * scale);
              context.drawImage(
                bitmap,
                Math.round(box.x * scale),
                y,
                w,
                1,
                0,
                0,
                w,
                1,
              );
              const {data} = context.getImageData(0, 0, w, 1);
              // The fill's color, a few pixels in from the start; the track's
              // color at the far end.
              const at = (x: number) => [
                data[x * 4],
                data[x * 4 + 1],
                data[x * 4 + 2],
              ];
              const fill = at(Math.round(6 * scale));
              const rest = at(w - Math.round(6 * scale));
              const near = (c: number[], d: number[]) =>
                Math.abs(c[0] - d[0]) +
                  Math.abs(c[1] - d[1]) +
                  Math.abs(c[2] - d[2]) <
                Math.abs(c[0] - rest[0]) +
                  Math.abs(c[1] - rest[1]) +
                  Math.abs(c[2] - rest[2]);
              let edge = 0;
              for (let x = 0; x < w; x += 1) {
                if (near(at(x), fill)) {
                  edge = x + 1;
                }
              }
              result.push(edge / scale);
            }
            return result;
          },
          {items: batch, box: track, vw: viewportWidth},
        )),
      );
    }
    return out;
  } finally {
    await scratch.close();
  }
}

test('the fill keeps moving to a new value while a script holds the main thread', async ({
  page,
}) => {
  await open(page, 10);
  const track = await trackBox(page);
  const cast = await startScreencast(page);
  await page.waitForTimeout(300);
  const busy = await setValueThenBlock(page, 90, BLOCK_MS);
  await page.waitForTimeout(300);
  const frames = await cast.stop();
  const edges = await leadingEdges(page, frames, track);
  const start = track.width * 0.1;
  const target = track.width * 0.9;
  // Inside the block, a frame clear of each edge.
  const inside = frames
    .map((frame, i) => ({t: frame.t, edge: edges[i]}))
    .filter(f => f.t >= busy.from + 20 && f.t <= busy.to - 20);
  // The transition (the theme's `--duration-medium`) is shorter than the
  // block, so the fill must make its whole trip inside it: frame after frame
  // through distinct positions…
  const positions = new Set(inside.map(f => Math.round(f.edge)));
  expect(positions.size).toBeGreaterThanOrEqual(5);
  // …and arrives before the block ends (the transition is shorter than it).
  const last = inside[inside.length - 1].edge;
  expect(Math.abs(last - target)).toBeLessThan(2);
  // It never runs backwards.
  for (let i = 1; i < inside.length; i += 1) {
    expect(inside[i].edge).toBeGreaterThanOrEqual(inside[i - 1].edge - 1);
  }
  expect(inside[0].edge).toBeLessThan(target - (target - start) * 0.2);
});

test('moving the fill lays out and paints nothing per frame', async ({
  page,
  browser,
}) => {
  await open(page, 20);
  await browser.startTracing(page, {
    categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'],
  });
  await setValue(page, 80);
  await page.waitForTimeout(800);
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
  // The update itself may lay out and paint once; a width transition then
  // lays out and repaints every frame until it ends (about 18 times here).
  expect(count('Layout')).toBeLessThanOrEqual(2);
  expect(count('Paint')).toBeLessThanOrEqual(2);
});

test('the leading edge sits at the value, mirrored in RTL', async ({page}) => {
  for (const dir of ['ltr', 'rtl'] as const) {
    await open(page, 0);
    await page.evaluate(d => {
      document.documentElement.dir = d;
    }, dir);
    for (const value of [0, 25, 60, 100]) {
      await setValue(page, value);
      await page.waitForTimeout(700);
      const {track, fill} = await page.evaluate(() => {
        const bar = document.querySelector('[role="progressbar"]');
        const child = bar?.firstElementChild;
        if (bar == null || child == null) {
          throw new Error('no progressbar');
        }
        const r = (e: Element) => {
          const b = e.getBoundingClientRect();
          return {left: b.left, right: b.right, width: b.width};
        };
        return {track: r(bar), fill: r(child)};
      });
      // The fill spans the track and is moved back by the unfilled share.
      expect(fill.width).toBeCloseTo(track.width, 1);
      const filled = (track.width * value) / 100;
      if (dir === 'ltr') {
        expect(fill.right - track.left, `${dir} ${value}`).toBeCloseTo(
          filled,
          0,
        );
      } else {
        expect(track.right - fill.left, `${dir} ${value}`).toBeCloseTo(
          filled,
          0,
        );
      }
    }
  }
});

test('storyboard: the fill moving from 20% to 80% @storyboard', async ({
  page,
}, testInfo) => {
  await open(page, 20);
  const track = await trackBox(page);
  const cast = await startScreencast(page);
  await page.waitForTimeout(200);
  await setValue(page, 80);
  await page.waitForTimeout(700);
  const frames = await cast.stop();
  const edges = await leadingEdges(page, frames, track);
  // The trace is the assertion: the edge moves forward only, from 20% to
  // 80%, with no jump bigger than a quarter of the travel between frames.
  const travel = track.width * 0.6;
  expect(edges[0]).toBeCloseTo(track.width * 0.2, 0);
  expect(edges[edges.length - 1]).toBeCloseTo(track.width * 0.8, 0);
  for (let i = 1; i < edges.length; i += 1) {
    expect(edges[i]).toBeGreaterThanOrEqual(edges[i - 1] - 1);
    expect(edges[i] - edges[i - 1]).toBeLessThan(travel / 4);
  }
  const moving = frames
    .map((frame, i) => ({t: frame.t, edge: edges[i], data: frame.data}))
    .filter(
      (f, i) =>
        i === 0 ||
        Math.abs(f.edge - edges[i - 1]) > 0.25 ||
        i === edges.length - 1,
    );
  fs.mkdirSync(EVIDENCE, {recursive: true});
  fs.writeFileSync(
    path.join(EVIDENCE, 'progress-bar-fill-move.json'),
    JSON.stringify(
      {
        story: STORY,
        from: 20,
        to: 80,
        trackWidth: track.width,
        frames: moving.map(f => ({
          t: Math.round(f.t - moving[0].t),
          edge: Math.round(f.edge * 10) / 10,
        })),
      },
      null,
      1,
    ),
  );
  // The contact sheet: the track in every frame where the fill moved.
  const sheet = await page.context().newPage();
  try {
    const png = await sheet.evaluate(
      async ({items, box, vw}) => {
        const decoded = await Promise.all(
          items.map(async item =>
            createImageBitmap(
              await (await fetch(`data:image/png;base64,${item}`)).blob(),
            ),
          ),
        );
        const scale = decoded[0].width / vw;
        const pad = 6 * scale;
        const w = Math.round(box.width * scale + pad * 2);
        const h = Math.round(box.height * scale + pad * 2);
        const canvas = new OffscreenCanvas(w, decoded.length * h);
        const context = canvas.getContext('2d');
        if (context == null) {
          throw new Error('no 2d context');
        }
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        decoded.forEach((bitmap, i) => {
          context.drawImage(
            bitmap,
            Math.round(box.x * scale - pad),
            Math.round(box.y * scale - pad),
            w,
            h,
            0,
            i * h,
            w,
            h,
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
      {
        items: moving.map(f => f.data),
        box: track,
        vw: page.viewportSize()?.width ?? 402,
      },
    );
    fs.writeFileSync(
      path.join(EVIDENCE, 'progress-bar-fill-move.png'),
      Buffer.from(png, 'base64'),
    );
    await testInfo.attach('progress-bar-fill-move.png', {
      path: path.join(EVIDENCE, 'progress-bar-fill-move.png'),
      contentType: 'image/png',
    });
  } finally {
    await sheet.close();
  }
});
