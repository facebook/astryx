// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ProgressBarTouch.a11y.chromium.spec.ts
 * @input Built ProgressBar stories in real Chromium with a coarse (touch)
 *   pointer (Web Animations seeking, CDP screencast)
 * @output Browser evidence that under a finger (a coarse primary pointer, on
 *   every touch device; Chromium as a phone here) a determinate value
 *   change runs the way UIProgressView's setProgress(_:animated: true) does:
 *   linear, 1 s per whole track of the change, retargeted from where the fill
 *   is drawn with the model change's duration, never narrower than two track
 *   heights above zero, transparent at zero, and still moving while a script
 *   holds the main thread; and that a mouse or trackpad keeps the theme's
 *   timing and no minimum. Writes a storyboard (contact sheet + JSON trace)
 *   to test-results/progress-bar-touch/.
 * @position Chromium proof for ProgressBar's touch presentation. Mobile
 *   Safari and Chrome on Android are simulator and emulator recordings
 *   attached to the pull request.
 *
 * SYNC: Keep in step with ProgressBar.tsx (`styles.fill`, `fillEmpty`) and
 * motion/uikit/progress.ts (`progressView`).
 */

import fs from 'node:fs';
import path from 'node:path';
import {expect, test, type Page} from '@playwright/test';
import {
  DEFAULT_STORYBOOK_DIR,
  serveStorybook,
  type StaticServer,
} from '@astryxdesign/a11y-spec/storybook';
import {progressBar} from '../../motion/uikit/progressBar';

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
    path.join('test-results', 'progress-bar-touch'),
);
const STORY = 'core-progressbar--default';
const VIEW = progressBar.progressView;
const DPR = 3;

test.use({
  viewport: {width: 402, height: 200},
  deviceScaleFactor: DPR,
  hasTouch: true,
  isMobile: true,
});

/** The default story at `value`, under a finger unless `coarse` is false. */
async function open(
  page: Page,
  value: number,
  {coarse = true, globals = ''} = {},
) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${STORY}&viewMode=story${globals ? `&globals=${globals}` : ''}`,
  );
  await expect(page.getByRole('progressbar')).toBeVisible();
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(coarse);
  await setValue(page, value);
  await page.waitForTimeout(1200);
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
 * Sets a new value and pauses the fill's transition the moment it is created,
 * so its timing can be read and seeked. Resolves with the number of
 * transitions on the fill.
 */
async function changeAndPause(page: Page, value: number) {
  return page.evaluate(
    async ({storyId, updatedArgs}) =>
      new Promise<number>((resolve, reject) => {
        const onRun = (event: Event) => {
          const bar = document.querySelector('[role="progressbar"]');
          const fill = bar?.firstElementChild;
          if (fill == null || event.target !== fill) {
            return;
          }
          document.removeEventListener('transitionrun', onRun, true);
          const animations = fill.getAnimations();
          for (const animation of animations) {
            animation.pause();
          }
          resolve(animations.length);
        };
        document.addEventListener('transitionrun', onRun, true);
        (
          window as unknown as {
            __STORYBOOK_ADDONS_CHANNEL__: {
              emit: (event: string, payload: unknown) => void;
            };
          }
        ).__STORYBOOK_ADDONS_CHANNEL__.emit('updateStoryArgs', {
          storyId,
          updatedArgs,
        });
        setTimeout(() => reject(new Error('no transition started')), 3000);
      }),
    {storyId: STORY, updatedArgs: {value}},
  );
}

/** Leading edge of the fill, in px from the track's start, and its opacity. */
async function edge(page: Page) {
  return page.evaluate(() => {
    const track = document.querySelector('[role="progressbar"]') as Element;
    const fill = track.firstElementChild as Element;
    return {
      edge:
        fill.getBoundingClientRect().right - track.getBoundingClientRect().left,
      width: track.getBoundingClientRect().width,
      opacity: Number(getComputedStyle(fill).opacity),
    };
  });
}

test('a value change runs linearly for 1 s per whole track of the change', async ({
  page,
}) => {
  await open(page, 10);
  await changeAndPause(page, 90);
  const samples = await page.evaluate(() => {
    const track = document.querySelector('[role="progressbar"]') as Element;
    const fill = track.firstElementChild as Element;
    const [transition] = fill.getAnimations();
    const duration = Number(transition.effect?.getTiming().duration);
    const out: {t: number; edge: number}[] = [];
    for (let i = 0; i <= 8; i += 1) {
      const t = (duration * i) / 8;
      transition.currentTime = Math.min(t, duration - 0.01);
      out.push({
        t,
        edge:
          fill.getBoundingClientRect().right -
          track.getBoundingClientRect().left,
      });
    }
    return {
      duration,
      easing: transition.effect?.getTiming().easing,
      width: track.getBoundingClientRect().width,
      out,
    };
  });
  expect(samples.duration).toBeCloseTo(0.8 * VIEW.wholeTrackMs, 3);
  // The transition's own curve is linear (UIView.animate, curveLinear).
  expect(samples.easing).toBe('linear');
  for (const {t, edge: at} of samples.out) {
    const expected =
      samples.width *
      (0.1 + (0.8 * Math.min(t, samples.duration)) / samples.duration);
    expect(at, `edge at ${t} ms`).toBeCloseTo(expected, 0);
  }
});

test('with a mouse or trackpad the theme\u2019s timing and no minimum stay: touch work costs nothing under a fine pointer', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: {width: 402, height: 200},
    deviceScaleFactor: 3,
    hasTouch: false,
    isMobile: false,
  });
  const page = await context.newPage();
  await open(page, 10, {coarse: false});
  // A fine primary pointer in this context, before any check.
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(false);
  const theme = await page.evaluate(() => {
    const fill = document.querySelector('[role="progressbar"]')
      ?.firstElementChild as Element;
    const style = getComputedStyle(fill);
    return {
      duration: style.transitionDuration,
      easing: style.transitionTimingFunction,
    };
  });
  await changeAndPause(page, 90);
  const change = await page.evaluate(() => {
    const fill = document.querySelector('[role="progressbar"]')
      ?.firstElementChild as Element;
    const [transition] = fill.getAnimations();
    return {
      duration: Number(transition.effect?.getTiming().duration),
      easing: String(transition.effect?.getTiming().easing),
    };
  });
  // The theme's `--duration-medium` and `--ease-standard`, not UIKit's
  // linear 0.8 s.
  const themeMs =
    Number.parseFloat(theme.duration) *
    (theme.duration.endsWith('ms') ? 1 : 1000);
  expect(change.duration).toBeCloseTo(themeMs, 0);
  expect(change.duration).not.toBeCloseTo(0.8 * VIEW.wholeTrackMs, 0);
  expect(change.easing).toBe(theme.easing);
  expect(change.easing).not.toBe('linear');
  // At 1% the fill is 1% of the track, with no two-track-height minimum.
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      animation.finish();
    }
  });
  await setValue(page, 1);
  await page.waitForTimeout(800);
  const box = await page.evaluate(() => {
    const track = document.querySelector('[role="progressbar"]') as Element;
    const fill = track.firstElementChild as Element;
    return {
      edge:
        fill.getBoundingClientRect().right - track.getBoundingClientRect().left,
      width: track.getBoundingClientRect().width,
    };
  });
  expect(box.edge).toBeCloseTo(box.width * 0.01, 0);
  await context.close();
});

test('a change mid-flight starts from where the fill is drawn, timed by the model change', async ({
  page,
}) => {
  await open(page, 10);
  await changeAndPause(page, 90);
  // Hold the first change halfway (50% drawn), then retarget to 30%.
  await page.evaluate(() => {
    const fill = document.querySelector('[role="progressbar"]')
      ?.firstElementChild as Element;
    const [transition] = fill.getAnimations();
    transition.currentTime =
      Number(transition.effect?.getTiming().duration) / 2;
  });
  const before = await edge(page);
  expect(before.edge / before.width).toBeCloseTo(0.5, 2);
  await changeAndPause(page, 30);
  const retarget = await page.evaluate(() => {
    const track = document.querySelector('[role="progressbar"]') as Element;
    const fill = track.firstElementChild as Element;
    // A retarget replaces the running transition with a new one.
    const animations = fill.getAnimations();
    const transition = animations[animations.length - 1];
    transition.currentTime = 0;
    return {
      duration: Number(transition.effect?.getTiming().duration),
      start:
        fill.getBoundingClientRect().right - track.getBoundingClientRect().left,
      width: track.getBoundingClientRect().width,
    };
  });
  // Starts from the drawn 50%, not from the old value…
  expect(retarget.start / retarget.width).toBeCloseTo(0.5, 2);
  // …for 90 → 30 on the model: 0.6 of the track, 600 ms.
  expect(retarget.duration).toBeCloseTo(0.6 * VIEW.wholeTrackMs, 3);
});

test('a change back to the value it just left keeps the model change\u2019s duration', async ({
  page,
}) => {
  await open(page, 10);
  await changeAndPause(page, 90);
  // Hold the first change halfway, then send it back to 10%: CSS shortens
  // a transition that reverses to its own start value, which would halve
  // this return.
  await page.evaluate(() => {
    const fill = document.querySelector('[role="progressbar"]')
      ?.firstElementChild as Element;
    const [transition] = fill.getAnimations();
    transition.currentTime =
      Number(transition.effect?.getTiming().duration) / 2;
  });
  await changeAndPause(page, 10);
  const duration = await page.evaluate(() => {
    const fill = document.querySelector('[role="progressbar"]')
      ?.firstElementChild as Element;
    const animations = fill.getAnimations();
    return Number(
      animations[animations.length - 1].effect?.getTiming().duration,
    );
  });
  // 90 → 10 on the model: 0.8 of the track, 800 ms.
  expect(duration).toBeCloseTo(0.8 * VIEW.wholeTrackMs, 3);
});

test('under reduced motion a new value lands at once under a finger too', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await open(page, 20);
  // Read the fill in the same task React commits the new value: a running
  // transition shows up there, before any frame could finish it.
  const state = await page.evaluate(
    async ({storyId}) =>
      new Promise<{running: number; edge: number}>(resolve => {
        const track = document.querySelector('[role="progressbar"]') as Element;
        const fill = track.firstElementChild as HTMLElement;
        const observer = new MutationObserver(() => {
          observer.disconnect();
          const t = track.getBoundingClientRect();
          resolve({
            running: fill.getAnimations().length,
            edge: (fill.getBoundingClientRect().right - t.left) / t.width,
          });
        });
        observer.observe(fill, {attributes: true, attributeFilter: ['style']});
        (
          window as unknown as {
            __STORYBOOK_ADDONS_CHANNEL__: {
              emit: (event: string, payload: unknown) => void;
            };
          }
        ).__STORYBOOK_ADDONS_CHANNEL__.emit('updateStoryArgs', {
          storyId,
          updatedArgs: {value: 80},
        });
      }),
    {storyId: STORY},
  );
  expect(state.running).toBe(0);
  expect(state.edge).toBeCloseTo(0.8, 2);
});

test('never narrower than two track heights above zero, transparent at zero', async ({
  page,
}) => {
  await open(page, 0);
  const trackHeight = await page.evaluate(
    () =>
      (
        document.querySelector('[role="progressbar"]') as Element
      ).getBoundingClientRect().height,
  );
  const minimum = VIEW.minimumFillHeights * trackHeight;
  const empty = await edge(page);
  expect(empty.opacity).toBe(VIEW.emptyFillAlpha);
  expect(empty.edge).toBeCloseTo(minimum, 1);
  await setValue(page, 1);
  await page.waitForTimeout(400);
  const tiny = await edge(page);
  expect(tiny.opacity).toBe(1);
  expect(tiny.edge).toBeCloseTo(minimum, 1);
  await setValue(page, 50);
  await page.waitForTimeout(800);
  const half = await edge(page);
  expect(half.edge).toBeCloseTo(half.width / 2, 0);
});

test('in RTL the minimum and the motion mirror', async ({page}) => {
  // The story's own direction: a real RTL region (Storybook keeps every
  // story inside its own \`dir\`).
  await open(page, 0, {globals: 'direction:rtl'});
  const measure = async () =>
    page.evaluate(() => {
      const track = document.querySelector('[role="progressbar"]') as Element;
      const fill = track.firstElementChild as Element;
      const t = track.getBoundingClientRect();
      const f = fill.getBoundingClientRect();
      // Visible length from the track's right (start) edge.
      return {length: t.right - Math.max(f.left, t.left), height: t.height};
    });
  await setValue(page, 1);
  await page.waitForTimeout(400);
  const tiny = await measure();
  expect(tiny.length).toBeCloseTo(VIEW.minimumFillHeights * tiny.height, 1);
  await changeAndPause(page, 81);
  const half = await page.evaluate(() => {
    const track = document.querySelector('[role="progressbar"]') as Element;
    const fill = track.firstElementChild as Element;
    const [transition] = fill.getAnimations();
    transition.currentTime =
      Number(transition.effect?.getTiming().duration) / 2;
    const t = track.getBoundingClientRect();
    return {
      length: t.right - Math.max(fill.getBoundingClientRect().left, t.left),
      width: t.width,
      duration: Number(transition.effect?.getTiming().duration),
    };
  });
  // 1 → 81 is 0.8 of the track: 800 ms. It leaves from the drawn minimum,
  // so halfway sits midway between that and 81%, measured from the right.
  expect(half.duration).toBeCloseTo(0.8 * VIEW.wholeTrackMs, 3);
  expect(half.length).toBeCloseTo((tiny.length + 0.81 * half.width) / 2, 0);
});

test('in forced colors under a finger the fill is sized to the value, its outline whole, in either direction', async ({
  page,
}) => {
  // architecture:theme-tokens INV11: forced colors keep the fill's shape with
  // a CanvasText outline, and the track clips what it holds, so the fill is
  // sized to the value there (still at least two track heights above zero)
  // rather than slid along the track.
  await page.emulateMedia({forcedColors: 'active'});
  for (const {globals, fromLeft} of [
    {globals: '', fromLeft: true},
    {globals: 'direction:rtl', fromLeft: false},
  ]) {
    await open(page, 0, {globals});
    for (const value of [1, 50]) {
      await setValue(page, value);
      await page.waitForTimeout(900);
      const {track, fill, height} = await page.evaluate(() => {
        const bar = document.querySelector('[role="progressbar"]') as Element;
        const child = bar.firstElementChild as Element;
        const t = bar.getBoundingClientRect();
        const f = child.getBoundingClientRect();
        return {
          track: {left: t.left, right: t.right},
          fill: {left: f.left, right: f.right},
          height: t.height,
        };
      });
      const label = `${globals || 'ltr'} ${value}%`;
      const expected = Math.max(
        ((track.right - track.left) * value) / 100,
        VIEW.minimumFillHeights * height,
      );
      if (fromLeft) {
        expect(fill.left - track.left, label).toBeCloseTo(0, 0);
        expect(fill.right - fill.left, label).toBeCloseTo(expected, 0);
      } else {
        expect(track.right - fill.right, label).toBeCloseTo(0, 0);
        expect(fill.right - fill.left, label).toBeCloseTo(expected, 0);
      }
    }
  }
});

test('the fill keeps moving while a script holds the main thread', async ({
  page,
}) => {
  await open(page, 10);
  const frames: {t: number; edge: number}[] = [];
  const cdp = await page.context().newCDPSession(page);
  const raw: {t: number; data: string}[] = [];
  cdp.on('Page.screencastFrame', frame => {
    raw.push({
      t: (frame.metadata.timestamp ?? Date.now() / 1000) * 1000,
      data: frame.data,
    });
    cdp
      .send('Page.screencastFrameAck', {sessionId: frame.sessionId})
      .catch(() => {});
  });
  const box = await page.getByRole('progressbar').boundingBox();
  if (box == null) {
    throw new Error('no track');
  }
  await cdp.send('Page.startScreencast', {
    format: 'png',
    maxWidth: 402 * DPR,
    maxHeight: 200 * DPR,
    everyNthFrame: 1,
  });
  await page.waitForTimeout(300);
  // A value change, one presented frame, then 700 ms of script.
  const busy = await page.evaluate(
    async ({storyId}) =>
      new Promise<{from: number; to: number}>(resolve => {
        const onStart = (event: Event) => {
          const bar = document.querySelector('[role="progressbar"]');
          if (bar == null || !bar.contains(event.target as Node)) {
            return;
          }
          document.removeEventListener('transitionstart', onStart, true);
          requestAnimationFrame(() =>
            setTimeout(() => {
              const from = performance.timeOrigin + performance.now();
              const end = performance.now() + 700;
              while (performance.now() < end) {
                // hold
              }
              resolve({from, to: performance.timeOrigin + performance.now()});
            }),
          );
        };
        document.addEventListener('transitionstart', onStart, true);
        (
          window as unknown as {
            __STORYBOOK_ADDONS_CHANNEL__: {
              emit: (event: string, payload: unknown) => void;
            };
          }
        ).__STORYBOOK_ADDONS_CHANNEL__.emit('updateStoryArgs', {
          storyId,
          updatedArgs: {value: 90},
        });
      }),
    {storyId: STORY},
  );
  await page.waitForTimeout(300);
  await cdp.send('Page.stopScreencast');
  await cdp.detach().catch(() => {});
  // Leading edge per frame, along the track's middle row.
  const scratch = await page.context().newPage();
  try {
    for (let i = 0; i < raw.length; i += 10) {
      const edges = await scratch.evaluate(
        async ({items, track}) => {
          const out: number[] = [];
          for (const item of items) {
            const bitmap = await createImageBitmap(
              await (await fetch(`data:image/png;base64,${item}`)).blob(),
            );
            const scale = bitmap.width / 402;
            const w = Math.round(track.width * scale);
            const canvas = new OffscreenCanvas(w, 1);
            const context = canvas.getContext('2d');
            if (context == null) {
              throw new Error('no 2d context');
            }
            context.drawImage(
              bitmap,
              Math.round(track.x * scale),
              Math.round((track.y + track.height / 2) * scale),
              w,
              1,
              0,
              0,
              w,
              1,
            );
            const {data} = context.getImageData(0, 0, w, 1);
            const at = (x: number) => [
              data[x * 4],
              data[x * 4 + 1],
              data[x * 4 + 2],
            ];
            const fill = at(Math.round(4 * scale));
            const rest = at(w - Math.round(4 * scale));
            const d = (a: number[], b: number[]) =>
              Math.abs(a[0] - b[0]) +
              Math.abs(a[1] - b[1]) +
              Math.abs(a[2] - b[2]);
            let edgeAt = 0;
            for (let x = 0; x < w; x += 1) {
              if (d(at(x), fill) < d(at(x), rest)) {
                edgeAt = x + 1;
              }
            }
            out.push(edgeAt / scale);
          }
          return out;
        },
        {items: raw.slice(i, i + 10).map(f => f.data), track: box},
      );
      edges.forEach((e, k) => frames.push({t: raw[i + k].t, edge: e}));
    }
  } finally {
    await scratch.close();
  }
  const inside = frames.filter(
    f => f.t >= busy.from + 20 && f.t <= busy.to - 20,
  );
  const positions = new Set(inside.map(f => Math.round(f.edge)));
  // Linear for 800 ms: it is still moving through the whole 700 ms block.
  expect(positions.size).toBeGreaterThanOrEqual(20);
  for (let i = 1; i < inside.length; i += 1) {
    expect(inside[i].edge).toBeGreaterThanOrEqual(inside[i - 1].edge - 1);
  }
});

test('storyboard: 10% to 90% under a finger @storyboard', async ({
  page,
}, testInfo) => {
  await open(page, 10);
  await changeAndPause(page, 90);
  const step = 1000 / 60;
  const shots: {t: number; edge: number; png: string}[] = [];
  const duration = await page.evaluate(() => {
    const fill = document.querySelector('[role="progressbar"]')
      ?.firstElementChild as Element;
    const [transition] = fill.getAnimations();
    return Number(transition.effect?.getTiming().duration);
  });
  for (let t = 0; t <= duration; t += step * 3) {
    const at = await page.evaluate(
      time => {
        const track = document.querySelector('[role="progressbar"]') as Element;
        const fill = track.firstElementChild as Element;
        const [transition] = fill.getAnimations();
        transition.currentTime = time;
        return (
          fill.getBoundingClientRect().right -
          track.getBoundingClientRect().left
        );
      },
      Math.min(t, duration - 0.01),
    );
    const png = (await page.getByRole('progressbar').screenshot()).toString(
      'base64',
    );
    shots.push({t: Math.round(t * 10) / 10, edge: at, png});
  }
  fs.mkdirSync(EVIDENCE, {recursive: true});
  fs.writeFileSync(
    path.join(EVIDENCE, 'progress-bar-touch-move.json'),
    JSON.stringify(
      {
        story: STORY,
        from: 10,
        to: 90,
        duration,
        frames: shots.map(({t, edge: e}) => ({
          t,
          edge: Math.round(e * 10) / 10,
        })),
      },
      null,
      1,
    ),
  );
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
        const h = decoded[0].height + 6;
        const canvas = new OffscreenCanvas(w, decoded.length * h);
        const context = canvas.getContext('2d');
        if (context == null) {
          throw new Error('no 2d context');
        }
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        decoded.forEach((bitmap, i) => context.drawImage(bitmap, 0, i * h + 3));
        const blob = await canvas.convertToBlob({type: 'image/png'});
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = '';
        for (const byte of bytes) {
          binary += String.fromCharCode(byte);
        }
        return btoa(binary);
      },
      shots.map(s => s.png),
    );
    fs.writeFileSync(
      path.join(EVIDENCE, 'progress-bar-touch-move.png'),
      Buffer.from(png, 'base64'),
    );
    await testInfo.attach('progress-bar-touch-move.png', {
      path: path.join(EVIDENCE, 'progress-bar-touch-move.png'),
      contentType: 'image/png',
    });
  } finally {
    await sheet.close();
  }
  // The trace is the assertion (checked after it is written, so a failing
  // run still leaves its storyboard): equal steps of travel per equal time.
  const deltas = shots.slice(1).map((s, i) => s.edge - shots[i].edge);
  for (const delta of deltas.slice(0, -1)) {
    expect(delta).toBeCloseTo(deltas[0], 0);
  }
});

// -----------------------------------------------------------------------------
// Indeterminate: iOS Safari's own `<progress>` with no value, under a finger
// -----------------------------------------------------------------------------

const INDETERMINATE = 'core-progressbar--indeterminate';
const WEB = progressBar.indeterminateWebProgress;
// The reduced-motion pulse's alphas: Safari's shape and pace, at alphas that
// hold AST-020's 3:1 for the accent, success and error fills (Safari's own
// 0.30 to 0.60 reach only 1.52:1 to 2.42:1).
const PULSE_ALPHA = [0.74, 1] as const;

/** The indeterminate story, in this context's pointer. */
async function openIndeterminate(page: Page, dir: 'ltr' | 'rtl' = 'ltr') {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${INDETERMINATE}&viewMode=story`,
  );
  await expect(page.getByRole('progressbar')).toBeVisible();
  // The story's own root sets `dir`; flip the closest one, as an app would.
  await page.evaluate(d => {
    const track = document.querySelector('[role="progressbar"]') as Element;
    (track.closest('[dir]') ?? document.documentElement).setAttribute('dir', d);
  }, dir);
  await page.waitForTimeout(300);
}

/**
 * Pauses the indeterminate fill's animation and reads the segment (left and
 * right edges as track fractions) and its opacity at each time (ms).
 */
async function sampleIndeterminate(page: Page, times: number[]) {
  return page.evaluate(at => {
    const track = document.querySelector('[role="progressbar"]') as Element;
    const fill = track.firstElementChild as Element;
    const [animation] = fill.getAnimations();
    animation.pause();
    const t = track.getBoundingClientRect();
    return {
      timing: {
        name: (animation as CSSAnimation).animationName,
        duration: Number(animation.effect?.getTiming().duration),
        // A CSS animation's timing function applies per keyframe, so read
        // the declared value rather than the effect's (always linear).
        easing: getComputedStyle(fill).animationTimingFunction,
        direction: animation.effect?.getTiming().direction,
      },
      samples: at.map(time => {
        animation.currentTime = time;
        const f = fill.getBoundingClientRect();
        return {
          time,
          left: (f.left - t.left) / t.width,
          right: (f.right - t.left) / t.width,
          opacity: Number(getComputedStyle(fill).opacity),
        };
      }),
    };
  }, times);
}

/** The indeterminate bar's track color, as computed. */
async function trackColor(page: Page) {
  return page.evaluate(
    () =>
      getComputedStyle(
        document.querySelector('[role="progressbar"]') as Element,
      ).backgroundColor,
  );
}

test('indeterminate: the sweep runs over the track under a finger', async ({
  page,
}) => {
  const TRANSPARENT = 'rgba(0, 0, 0, 0)';
  await openIndeterminate(page);
  const track = await trackColor(page);
  expect(track).not.toBe(TRANSPARENT);
  await openIndeterminate(page, 'rtl');
  expect(await trackColor(page)).toBe(track);
  // Only Safari's reduced-motion pulse draws over the page instead.
  await page.emulateMedia({reducedMotion: 'reduce'});
  await openIndeterminate(page);
  expect(await trackColor(page)).toBe(TRANSPARENT);
});

test('indeterminate: a quarter of the track sweeps linearly end to end, 1 s each way', async ({
  page,
}) => {
  await openIndeterminate(page);
  const {timing, samples} = await sampleIndeterminate(
    page,
    [0, 250, 500, 750, 999, 1250, 1500, 1999],
  );
  expect(timing.duration).toBe(WEB.sweepMs);
  expect(timing.easing).toBe('linear');
  expect(timing.direction).toBe('alternate');
  const travel = 1 - WEB.segmentFraction;
  for (const {time, left, right, opacity} of samples) {
    expect(right - left, `width at ${time}`).toBeCloseTo(
      WEB.segmentFraction,
      2,
    );
    // Back and forth: out over one sweep, home over the next.
    const phase = (time % (2 * WEB.sweepMs)) / WEB.sweepMs;
    const along = phase <= 1 ? phase : 2 - phase;
    expect(left, `left at ${time}`).toBeCloseTo(travel * along, 2);
    expect(left).toBeGreaterThanOrEqual(-0.001);
    expect(right).toBeLessThanOrEqual(1.001);
    expect(opacity).toBe(1);
  }
});

test('indeterminate: in RTL the sweep starts from the right', async ({
  page,
}) => {
  await openIndeterminate(page, 'rtl');
  const {samples} = await sampleIndeterminate(page, [0, 500, 999]);
  const travel = 1 - WEB.segmentFraction;
  expect(samples[0].right).toBeCloseTo(1, 2);
  expect(samples[1].right).toBeCloseTo(1 - travel / 2, 2);
  expect(samples[2].left).toBeCloseTo(0, 2);
});

for (const dir of ['ltr', 'rtl'] as const) {
  test(`indeterminate with reduced motion: the whole bar pulses, no travel (${dir})`, async ({
    page,
  }) => {
    await page.emulateMedia({reducedMotion: 'reduce'});
    await openIndeterminate(page, dir);
    const {timing, samples} = await sampleIndeterminate(
      page,
      [0, 500, 999, 1500],
    );
    expect(timing.duration).toBe(WEB.reducedMotionPulseMs);
    expect(timing.easing).toBe('linear');
    expect(timing.direction).toBe('alternate');
    // Safari's pulse shape and pace, at alphas that hold AST-020's 3:1.
    const [low, high] = PULSE_ALPHA;
    const expected = [low, (low + high) / 2, high, (low + high) / 2];
    // The bar is the fill at that alpha over the page: no track color.
    expect(
      await page.evaluate(
        () =>
          getComputedStyle(
            document.querySelector('[role="progressbar"]') as Element,
          ).backgroundColor,
      ),
    ).toBe('rgba(0, 0, 0, 0)');
    samples.forEach(({time, left, right, opacity}, i) => {
      expect(left, `left at ${time}`).toBeCloseTo(0, 3);
      expect(right, `right at ${time}`).toBeCloseTo(1, 3);
      expect(opacity, `opacity at ${time}`).toBeCloseTo(expected[i], 2);
    });
  });
}

test('indeterminate with reduced motion: the pulse holds 3:1 against the page for accent, success and error, light and dark (AST-020)', async ({
  page,
}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  const variants = ['accent', 'success', 'warning', 'error', 'neutral'];
  // The fills that hold 3:1 in both modes. Measured at the pulse's faintest
  // (Chromium): warning 1.35:1 light (6.23:1 dark), neutral 2.23:1 light and
  // 1.62:1 dark, below 3:1 because of their own colors, so no claim covers
  // them; the annotations record every ratio.
  const held = new Set(['accent', 'success', 'error']);
  for (const mode of ['light', 'dark'] as const) {
    await page.goto(
      `${storybook.origin}/iframe.html?id=core-progressbar--indeterminate-variants&viewMode=story&globals=colorMode:${mode}`,
    );
    await expect(page.getByRole('progressbar')).toHaveCount(variants.length);
    const ratios = await page.evaluate(() => {
      const rgb = (color: string) =>
        (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const lum = ([r, g, b]: number[]) => {
        const f = (c: number) => {
          const v = c / 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      return Array.from(document.querySelectorAll('[role="progressbar"]')).map(
        track => {
          const fill = track.firstElementChild as Element;
          // The alphas the pulse actually runs between, from its keyframes.
          const alphas = fill
            .getAnimations()
            .flatMap(
              animation =>
                (animation.effect as KeyframeEffect | null)?.getKeyframes() ??
                [],
            )
            .map(frame => frame.opacity)
            .filter(opacity => opacity != null)
            .map(Number);
          if (alphas.length === 0) {
            throw new Error('no pulse');
          }
          // The page behind the bar: the nearest ancestor that paints.
          let node: Element | null = track.parentElement;
          let page = 'rgb(255, 255, 255)';
          while (node != null) {
            const bg = getComputedStyle(node).backgroundColor;
            if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
              page = bg;
              break;
            }
            node = node.parentElement;
          }
          const back = rgb(page);
          const ink = rgb(getComputedStyle(fill).backgroundColor);
          return Math.min(
            ...alphas.map(alpha => {
              const mix = ink.map((c, i) => c * alpha + back[i] * (1 - alpha));
              const [a, b] = [lum(mix), lum(back)].sort((x, y) => y - x);
              return (a + 0.05) / (b + 0.05);
            }),
          );
        },
      );
    });
    variants.forEach((variant, i) => {
      test.info().annotations.push({
        type: 'contrast',
        description: `${mode} ${variant}: ${ratios[i].toFixed(2)}:1 at the pulse's faintest`,
      });
      if (held.has(variant)) {
        expect(ratios[i], `${mode} ${variant} pulse`).toBeGreaterThanOrEqual(3);
      }
    });
  }
});

test('indeterminate: the segment keeps moving while a script holds the main thread', async ({
  page,
}) => {
  await openIndeterminate(page);
  const box = await page.getByRole('progressbar').boundingBox();
  if (box == null) {
    throw new Error('no track');
  }
  const cdp = await page.context().newCDPSession(page);
  const raw: {t: number; data: string}[] = [];
  cdp.on('Page.screencastFrame', frame => {
    raw.push({
      t: (frame.metadata.timestamp ?? Date.now() / 1000) * 1000,
      data: frame.data,
    });
    cdp
      .send('Page.screencastFrameAck', {sessionId: frame.sessionId})
      .catch(() => {});
  });
  await cdp.send('Page.startScreencast', {
    format: 'png',
    maxWidth: 402 * DPR,
    maxHeight: 200 * DPR,
    everyNthFrame: 1,
  });
  await page.waitForTimeout(300);
  const busy = await page.evaluate(
    async () =>
      new Promise<{from: number; to: number}>(resolve => {
        requestAnimationFrame(() =>
          setTimeout(() => {
            const from = performance.timeOrigin + performance.now();
            const end = performance.now() + 700;
            while (performance.now() < end) {
              // hold
            }
            resolve({from, to: performance.timeOrigin + performance.now()});
          }),
        );
      }),
  );
  await page.waitForTimeout(200);
  await cdp.send('Page.stopScreencast');
  await cdp.detach().catch(() => {});
  const inside = raw.filter(f => f.t >= busy.from + 20 && f.t <= busy.to - 20);
  // The segment's left edge per frame, along the track's middle row.
  const scratch = await page.context().newPage();
  let lefts: number[];
  try {
    lefts = await scratch.evaluate(
      async ({items, track}) => {
        const out: number[] = [];
        for (const item of items) {
          const bitmap = await createImageBitmap(
            await (await fetch(`data:image/png;base64,${item}`)).blob(),
          );
          const scale = bitmap.width / 402;
          const w = Math.round(track.width * scale);
          const canvas = new OffscreenCanvas(w, 1);
          const context = canvas.getContext('2d');
          if (context == null) {
            throw new Error('no 2d context');
          }
          context.drawImage(
            bitmap,
            Math.round(track.x * scale),
            Math.round((track.y + track.height / 2) * scale),
            w,
            1,
            0,
            0,
            w,
            1,
          );
          const {data} = context.getImageData(0, 0, w, 1);
          // The darkest run is the segment.
          let first = -1;
          let darkest = 255 * 3;
          for (let x = 0; x < w; x += 1) {
            darkest = Math.min(
              darkest,
              data[x * 4] + data[x * 4 + 1] + data[x * 4 + 2],
            );
          }
          for (let x = 0; x < w; x += 1) {
            if (
              data[x * 4] + data[x * 4 + 1] + data[x * 4 + 2] <
              darkest + 60
            ) {
              first = x;
              break;
            }
          }
          out.push(first / scale);
        }
        return out;
      },
      {items: inside.map(f => f.data), track: box},
    );
  } finally {
    await scratch.close();
  }
  expect(inside.length).toBeGreaterThanOrEqual(30);
  expect(new Set(lefts.map(Math.round)).size).toBeGreaterThanOrEqual(20);
});

test.describe('indeterminate with a mouse or trackpad', () => {
  test.use({hasTouch: false, isMobile: false});

  test('keeps its 40% slide, 1.5 s eased, and the reduced-motion slowdown', async ({
    page,
  }) => {
    await openIndeterminate(page, 'ltr');
    expect(
      await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
    ).toBe(false);
    const normal = await sampleIndeterminate(page, [0]);
    expect(normal.timing.duration).toBe(1500);
    expect(normal.timing.easing).toBe('ease-in-out');
    expect(normal.samples[0].right - normal.samples[0].left).toBeCloseTo(
      0.4,
      2,
    );
    await page.emulateMedia({reducedMotion: 'reduce'});
    await openIndeterminate(page, 'ltr');
    const reduced = await sampleIndeterminate(page, [0]);
    expect(reduced.timing.duration).toBe(3000);
    // The slide runs over the track, as on main.
    expect(await trackColor(page)).not.toBe('rgba(0, 0, 0, 0)');
  });
});
