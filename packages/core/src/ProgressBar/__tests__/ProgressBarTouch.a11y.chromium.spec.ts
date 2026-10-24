// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ProgressBarTouch.a11y.chromium.spec.ts
 * @input Built ProgressBar stories in real Chromium with a coarse (touch)
 *   pointer (Web Animations seeking, CDP screencast)
 * @output Browser evidence that under a finger on iOS a determinate value
 *   change runs the way UIProgressView's setProgress(_:animated: true) does:
 *   linear, 1 s per whole track of the change, retargeted from where the fill
 *   is drawn with the model change's duration, never narrower than two track
 *   heights above zero, transparent at zero, and still moving while a script
 *   holds the main thread; and that a finger anywhere else (Chromium as an
 *   Android phone) keeps the theme's timing and no minimum. Writes a
 *   storyboard (contact sheet + JSON trace) to test-results/progress-bar-touch/.
 * @position Chromium proof for ProgressBar's touch presentation. The iOS gate
 *   is `@supports (-webkit-touch-callout: none)` inside the touch query,
 *   which only WebKit on iOS matches: the iOS tests emulate it in Chromium
 *   (`emulateIosWebKit`); the real iOS Safari side is a simulator recording
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
    path.join('test-results', 'progress-bar-touch'),
);
const STORY = 'core-progressbar--default';
const VIEW = progress.progressView;
const DPR = 3;

test.use({
  viewport: {width: 402, height: 200},
  deviceScaleFactor: DPR,
  hasTouch: true,
  isMobile: true,
});

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

/** The default story at `value`, on iOS (emulated) unless `ios` is false. */
async function open(page: Page, value: number, {ios = true} = {}) {
  await page.goto(`${storybook.origin}/iframe.html?id=${STORY}&viewMode=story`);
  await expect(page.getByRole('progressbar')).toBeVisible();
  expect(
    await page.evaluate(() => matchMedia('(pointer: coarse)').matches),
  ).toBe(true);
  if (ios) {
    await emulateIosWebKit(page);
  }
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

test('a finger outside iOS (Chromium as an Android phone) keeps the theme\u2019s timing and no minimum', async ({
  page,
}) => {
  await open(page, 10, {ios: false});
  const theme = await page.evaluate(() => ({
    callout: CSS.supports('-webkit-touch-callout', 'none'),
    ...(() => {
      const fill = document.querySelector('[role="progressbar"]')
        ?.firstElementChild as Element;
      const style = getComputedStyle(fill);
      return {
        duration: style.transitionDuration,
        easing: style.transitionTimingFunction,
      };
    })(),
  }));
  expect(theme.callout).toBe(false);
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
  await open(page, 0);
  await page.evaluate(() => {
    document.documentElement.dir = 'rtl';
  });
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
// Indeterminate: iOS Safari's own `<progress>` with no value
// -----------------------------------------------------------------------------

const INDETERMINATE = 'core-progressbar--indeterminate';
const WEB = progress.indeterminateWebProgress;

/** The indeterminate story, on iOS (emulated) unless `ios` is false. */
async function openIndeterminate(
  page: Page,
  dir: 'ltr' | 'rtl' = 'ltr',
  {ios = true} = {},
) {
  await page.goto(
    `${storybook.origin}/iframe.html?id=${INDETERMINATE}&viewMode=story`,
  );
  await expect(page.getByRole('progressbar')).toBeVisible();
  if (ios) {
    await emulateIosWebKit(page);
  }
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

test('indeterminate: a finger outside iOS (Chromium as an Android phone) keeps the 40% slide', async ({
  page,
}) => {
  await openIndeterminate(page, 'ltr', {ios: false});
  expect(
    await page.evaluate(() => [
      matchMedia('(pointer: coarse)').matches,
      CSS.supports('-webkit-touch-callout', 'none'),
    ]),
  ).toEqual([true, false]);
  const normal = await sampleIndeterminate(page, [0]);
  expect(normal.timing.duration).toBe(1500);
  expect(normal.timing.easing).toBe('ease-in-out');
  expect(normal.samples[0].right - normal.samples[0].left).toBeCloseTo(0.4, 2);
  await page.emulateMedia({reducedMotion: 'reduce'});
  await openIndeterminate(page, 'ltr', {ios: false});
  const reduced = await sampleIndeterminate(page, [0]);
  // Today's reduced-motion slowdown, not Safari's pulse.
  expect(reduced.timing.duration).toBe(3000);
  expect(reduced.samples[0].right - reduced.samples[0].left).toBeCloseTo(
    0.4,
    2,
  );
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
    const [low, high] = WEB.reducedMotionAlpha;
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
    await openIndeterminate(page, 'ltr', {ios: false});
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
    await openIndeterminate(page, 'ltr', {ios: false});
    const reduced = await sampleIndeterminate(page, [0]);
    expect(reduced.timing.duration).toBe(3000);
  });
});
