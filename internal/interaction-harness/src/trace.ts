// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file trace.ts
 * @input Uses a Playwright `Page` (Chromium: CDP `Tracing`) and the page's
 *   PerformanceObserver for long tasks
 * @output `traceRendering` — counts of the main thread's rendering work
 *   (Layout, Paint, UpdateLayoutTree, PrePaint, …) between two marks — and
 *   `installLongTaskLog` / `readLongTasks`.
 * @position The "no Layout/Paint during a transform/opacity animation" proof.
 *   A compositor animation costs the main thread nothing per frame; one that
 *   animates a layout property, or writes styles from JavaScript each frame,
 *   shows a Layout (and usually a Paint) per frame. Chromium only: WebKit
 *   exposes no comparable trace to Playwright.
 *
 * Counting is scoped to the renderer main thread that ran the page's own
 * `performance.mark` calls, and to the time between the start and end marks,
 * so other pages, the browser process and setup work are excluded.
 *
 * With `{invalidations: true}` the trace also records why each style
 * recalculation happened, which elements animations ran on and whether they
 * ran on the compositor, and when script ran. `countBetween` can then leave
 * out the one rendering pass Chrome makes on its own for a compositor
 * animation (its start time arriving from the compositor, late on a loaded
 * machine): a pass whose style recalculations all have the reason
 * `Animation`, on elements whose animations run on the compositor, with no
 * script since the previous pass. Anything the page causes (a style write, a
 * layout read, an animation the compositor cannot run) is still counted.
 *
 * SYNC: Keep RENDERING_EVENTS equal to the README's list.
 */

import type {CDPSession, Page} from '@playwright/test';

/** Trace events that run page script: a listener, a timer, a frame callback. */
const PAGE_SCRIPT_EVENTS = new Set([
  'EventDispatch',
  'FunctionCall',
  'TimerFire',
  'FireAnimationFrame',
  'FireIdleCallback',
]);

/** Main-thread trace events that are rendering work, by their trace names. */
export const RENDERING_EVENTS = [
  'UpdateLayoutTree', // style recalculation
  'Layout',
  'PrePaint',
  'Paint',
  'Layerize',
  'UpdateLayer',
  'ScrollLayer',
  'HitTest',
] as const;

export interface RenderingTrace {
  /** Count per trace event name inside the window, on the page's main thread. */
  readonly counts: Readonly<Record<string, number>>;
  /** Shorthand for the four that matter most. */
  readonly layout: number;
  readonly paint: number;
  readonly styleRecalc: number;
  readonly prePaint: number;
  /** Window length, ms. */
  readonly durationMs: number;
  /**
   * The page's own main-thread tasks longer than 50 ms inside the window (long
   * tasks), epoch ms. A task that ran a DevTools command (a `page.evaluate`)
   * is one only if page script ran inside it (an event listener, a timer, a
   * frame callback it set off); otherwise it is in `devtoolsTasks`.
   */
  readonly longTasks: readonly {
    readonly start: number;
    readonly durationMs: number;
  }[];
  /**
   * Main-thread tasks longer than 50 ms inside the window that ran a DevTools
   * command and no page script, epoch ms: a harness read inside the body
   * (`waitForAnimation` describing every animation's keyframes) or
   * `blockMainThread(page, ms)` without `during`.
   */
  readonly devtoolsTasks: readonly {
    readonly start: number;
    readonly durationMs: number;
  }[];
  /** Every counted rendering event with its epoch-ms time, for sub-window counts. */
  readonly events: readonly {readonly name: string; readonly t: number}[];
  /** The window, epoch ms on the page's clock. */
  readonly window: {readonly from: number; readonly to: number};
  /**
   * With `invalidations`: each style recalculation Chrome scheduled, with its
   * reason (`Animation`, `Inline CSS style declaration was mutated`, …) and
   * the element's trace node id, epoch ms.
   */
  readonly styleInvalidations?: readonly {
    readonly t: number;
    readonly reason: string;
    readonly nodeId?: number;
  }[];
  /**
   * With `invalidations`: the elements animations ran on, and whether each
   * of them ran on the compositor (Chrome reported no reason it could not).
   */
  readonly animations?: readonly {
    readonly nodeId: number;
    readonly composited: boolean;
  }[];
  /**
   * With `invalidations`: when script started on the main thread (function
   * calls, animation frame callbacks, timers, event dispatch), epoch ms.
   */
  readonly scripts?: readonly number[];
}

export interface TraceRenderingOptions {
  /**
   * Also record style recalculation reasons, the animations and whether they
   * ran on the compositor, and script, for
   * `countBetween(…, {skipCompositorAnimationUpdates: true})`.
   */
  invalidations?: boolean;
}

export interface CountBetweenOptions {
  /**
   * Leave out a rendering pass Chrome makes on its own for compositor
   * animations: every style recalculation since the previous pass has the
   * reason `Animation` and is on an element whose animations run on the
   * compositor, and no script ran in between. Needs a trace recorded with
   * `{invalidations: true}`.
   */
  skipCompositorAnimationUpdates?: boolean;
}

// Rendering events closer than this belong to one pass (one frame's style,
// layout and paint); passes are a frame apart.
const PASS_GAP_MS = 4;

/**
 * The times of the rendering events that belong to passes Chrome made on its
 * own for compositor animations (see `CountBetweenOptions`).
 */
function compositorAnimationUpdates(trace: RenderingTrace): Set<number> {
  const {styleInvalidations, animations, scripts} = trace;
  if (styleInvalidations == null || animations == null || scripts == null) {
    throw new Error(
      'countBetween: skipCompositorAnimationUpdates needs traceRendering(…, {invalidations: true})',
    );
  }
  const composited = new Set<number>();
  const notComposited = new Set<number>();
  for (const animation of animations) {
    (animation.composited ? composited : notComposited).add(animation.nodeId);
  }
  const events = [...trace.events].sort((a, b) => a.t - b.t);
  const skipped = new Set<number>();
  let previousEnd = -Infinity;
  let i = 0;
  while (i < events.length) {
    let j = i;
    while (
      j + 1 < events.length &&
      events[j + 1].t - events[j].t <= PASS_GAP_MS
    ) {
      j += 1;
    }
    const start = events[i].t;
    const end = events[j].t;
    const causes = styleInvalidations.filter(
      inv => inv.t > previousEnd && inv.t <= end,
    );
    const isAnimationUpdate =
      causes.length > 0 &&
      causes.every(
        inv =>
          inv.reason === 'Animation' &&
          inv.nodeId != null &&
          composited.has(inv.nodeId) &&
          !notComposited.has(inv.nodeId),
      ) &&
      !scripts.some(t => t > previousEnd && t <= start);
    if (isAnimationUpdate) {
      for (let k = i; k <= j; k += 1) {
        skipped.add(events[k].t);
      }
    }
    previousEnd = end;
    i = j + 1;
  }
  return skipped;
}

/** Counts rendering events by name inside `[from, to]` (epoch ms). */
export function countBetween(
  trace: RenderingTrace,
  from: number,
  to: number,
  {skipCompositorAnimationUpdates = false}: CountBetweenOptions = {},
): Record<string, number> {
  const skipped = skipCompositorAnimationUpdates
    ? compositorAnimationUpdates(trace)
    : new Set<number>();
  const counts: Record<string, number> = {};
  for (const e of trace.events) {
    if (e.t >= from && e.t <= to && !skipped.has(e.t)) {
      counts[e.name] = (counts[e.name] ?? 0) + 1;
    }
  }
  return counts;
}

interface TraceEvent {
  name: string;
  cat: string;
  ph: string;
  ts: number;
  dur?: number;
  pid: number;
  tid: number;
  args?: Record<string, unknown>;
}

/**
 * Traces the page while `body` runs and counts the rendering work its main
 * thread did between a start mark (placed just before `body`) and an end mark
 * (just after). The harness's animation recorder and `waitForRest` stand down
 * meanwhile, so a body may wait with either and add no frame of its own.
 */
export async function traceRendering(
  page: Page,
  body: () => Promise<unknown>,
  {invalidations = false}: TraceRenderingOptions = {},
): Promise<RenderingTrace> {
  const cdp: CDPSession = await page.context().newCDPSession(page);
  const events: TraceEvent[] = [];
  cdp.on('Tracing.dataCollected', ({value}) => {
    events.push(...(value as unknown as TraceEvent[]));
  });
  const complete = new Promise<void>(resolve =>
    cdp.once('Tracing.tracingComplete', () => resolve()),
  );
  await cdp.send('Tracing.start', {
    transferMode: 'ReportEvents',
    traceConfig: {
      includedCategories: [
        'devtools.timeline',
        'disabled-by-default-devtools.timeline',
        'blink.user_timing',
        'toplevel',
        ...(invalidations
          ? ['disabled-by-default-devtools.timeline.invalidationTracking']
          : []),
      ],
      excludedCategories: ['*'],
    },
  });
  const tag = `harness-${Math.random().toString(36).slice(2, 8)}`;
  const mark = (name: string) =>
    page.evaluate(
      n => performance.timeOrigin + performance.mark(n).startTime,
      name,
    );
  // The harness's animation recorder (curves.ts) runs a callback every frame,
  // which makes each frame a main-thread one where Blink restyles every running
  // animation's target (and lays out an anchored one), and it reads the page's
  // animations, which flushes style: exactly what this counts. It stands down
  // while this flag is set, a recorder the body itself starts included, and
  // resumes once the trace ends.
  const standDown = (on: boolean) =>
    page.evaluate(value => {
      const w = window as unknown as {
        __harnessRenderingTrace?: boolean;
        __harnessAnimations?: {resume?: () => void};
      };
      w.__harnessRenderingTrace = value;
      if (!value) {
        w.__harnessAnimations?.resume?.();
      }
    }, on);
  await standDown(true);
  let fromEpoch: number;
  let toEpoch: number;
  try {
    fromEpoch = await mark(`${tag}:start`);
    await body();
    toEpoch = await mark(`${tag}:end`);
  } finally {
    // Its catch-up read lands after the end mark, outside the counted window.
    // A failure here would hide the body's own error, which is the one to see.
    await standDown(false).catch(() => {});
  }
  await cdp.send('Tracing.end');
  await complete;
  await cdp.detach().catch(() => {});

  const start = events.find(e => e.name === `${tag}:start`);
  const end = events.find(e => e.name === `${tag}:end`);
  if (start == null || end == null) {
    throw new Error('traceRendering: the window marks were not traced');
  }
  const onMain = (e: TraceEvent) =>
    e.pid === start.pid &&
    e.tid === start.tid &&
    e.ts >= start.ts &&
    e.ts <= end.ts;
  // Trace time (µs, monotonic) -> epoch ms, anchored on the start mark.
  const toEpochMs = (ts: number) => fromEpoch + (ts - start.ts) / 1000;
  const counts: Record<string, number> = {};
  const counted: {name: string; t: number}[] = [];
  for (const e of events) {
    if (!onMain(e) || e.ph === 'E') {
      continue;
    }
    if ((RENDERING_EVENTS as readonly string[]).includes(e.name)) {
      counts[e.name] = (counts[e.name] ?? 0) + 1;
      counted.push({name: e.name, t: toEpochMs(e.ts)});
    }
  }
  const extra: {
    -readonly [
      K in 'styleInvalidations' | 'animations' | 'scripts'
    ]?: RenderingTrace[K];
  } = {};
  if (invalidations) {
    const data = (e: TraceEvent) =>
      ((e.args as {data?: Record<string, unknown>} | undefined)?.data ??
        {}) as Record<string, unknown>;
    const asyncId = (e: TraceEvent) =>
      (e as TraceEvent & {id2?: {local?: string}; id?: string}).id2?.local ??
      (e as TraceEvent & {id?: string}).id ??
      '';
    const animationNode = new Map<string, number>();
    const animationComposited = new Map<string, boolean>();
    for (const e of events) {
      if (e.name !== 'Animation' || e.pid !== start.pid) {
        continue;
      }
      const d = data(e);
      if (typeof d.nodeId === 'number') {
        animationNode.set(asyncId(e), d.nodeId);
      }
      if (typeof d.compositeFailed === 'number') {
        const id = asyncId(e);
        animationComposited.set(
          id,
          (animationComposited.get(id) ?? true) && d.compositeFailed === 0,
        );
      }
    }
    extra.animations = [...animationNode].map(([id, nodeId]) => ({
      nodeId,
      composited: animationComposited.get(id) ?? false,
    }));
    extra.styleInvalidations = events
      .filter(e => onMain(e) && e.name === 'StyleRecalcInvalidationTracking')
      .map(e => {
        const d = data(e);
        return {
          t: toEpochMs(e.ts),
          reason: String(d.reason ?? ''),
          nodeId: typeof d.nodeId === 'number' ? d.nodeId : undefined,
        };
      });
    extra.scripts = events
      .filter(
        e =>
          onMain(e) &&
          [
            'FunctionCall',
            'FireAnimationFrame',
            'TimerFire',
            'EventDispatch',
          ].includes(e.name),
      )
      .map(e => toEpochMs(e.ts));
  }
  // A task that ran a DevTools command received it over the DevTools
  // session's pipe; page script it set off shows as its listener, timer or
  // frame callback.
  const main = events.filter(e => onMain(e) && e.ph !== 'E');
  const longTasks: {start: number; durationMs: number}[] = [];
  const devtoolsTasks: {start: number; durationMs: number}[] = [];
  for (const task of main) {
    if (task.name !== 'RunTask' || (task.dur ?? 0) <= 50_000) {
      continue;
    }
    const end = task.ts + (task.dur ?? 0);
    const inside = main.filter(
      e => e !== task && e.ts >= task.ts && e.ts <= end,
    );
    const devtools = inside.some(
      e =>
        e.name === 'Receive mojo message' &&
        (
          e.args?.chrome_mojo_event_info as
            {mojo_interface_tag?: unknown} | undefined
        )?.mojo_interface_tag === 'blink.mojom.DevToolsSession',
    );
    const pageScript = inside.some(e => PAGE_SCRIPT_EVENTS.has(e.name));
    (devtools && !pageScript ? devtoolsTasks : longTasks).push({
      start: toEpochMs(task.ts),
      durationMs: (task.dur ?? 0) / 1000,
    });
  }
  return {
    counts,
    layout: counts.Layout ?? 0,
    paint: counts.Paint ?? 0,
    styleRecalc: counts.UpdateLayoutTree ?? 0,
    prePaint: counts.PrePaint ?? 0,
    durationMs: (end.ts - start.ts) / 1000,
    longTasks,
    devtoolsTasks,
    events: counted,
    window: {from: fromEpoch, to: toEpoch},
    ...extra,
  };
}

/**
 * Records when the compositor presents each frame, for `busyWindowProof`'s
 * `presented`: a Chromium trace of `Display::FrameDisplayed`, on the page
 * clock. Start it with the screencast, before the block, and stop it after.
 * Engines without a CDP trace (WebKit) resolve `stop()` to [], and the
 * verdict then judges the screencast alone. It runs its own trace, so not
 * inside `traceRendering`.
 */
export async function startCompositorTrace(
  page: Page,
): Promise<{stop(): Promise<number[]>}> {
  let cdp: CDPSession;
  try {
    cdp = await page.context().newCDPSession(page);
  } catch {
    return {stop: async () => []};
  }
  const events: TraceEvent[] = [];
  cdp.on('Tracing.dataCollected', ({value}) => {
    events.push(...(value as unknown as TraceEvent[]));
  });
  const complete = new Promise<void>(resolve =>
    cdp.once('Tracing.tracingComplete', () => resolve()),
  );
  await cdp.send('Tracing.start', {
    transferMode: 'ReportEvents',
    traceConfig: {
      includedCategories: [
        'disabled-by-default-display.framedisplayed',
        'blink.user_timing',
      ],
      excludedCategories: ['*'],
    },
  });
  const tag = `harness-compositor-${Math.random().toString(36).slice(2, 8)}`;
  const epoch = await page.evaluate(
    n => performance.timeOrigin + performance.mark(n).startTime,
    tag,
  );
  return {
    async stop() {
      await cdp.send('Tracing.end');
      await complete;
      await cdp.detach().catch(() => {});
      const mark = events.find(e => e.name === tag);
      if (mark == null) {
        throw new Error('startCompositorTrace: the clock mark was not traced');
      }
      // Trace time (µs, monotonic) -> epoch ms, anchored on the mark.
      return events
        .filter(e => e.name === 'Display::FrameDisplayed')
        .map(e => epoch + (e.ts - mark.ts) / 1000)
        .sort((a, b) => a - b);
    },
  };
}

const LONG_TASK_SCRIPT = `(() => {
  if (window.__harnessLongTasks || typeof PerformanceObserver === 'undefined') return;
  const tasks = [];
  window.__harnessLongTasks = tasks;
  try {
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) tasks.push({start: performance.timeOrigin + entry.startTime, durationMs: entry.duration, name: entry.name});
    }).observe({type: 'longtask', buffered: true});
  } catch {}
})()`;

/**
 * Records every long task (> 50 ms) the page runs (install before navigation;
 * Chromium), through the Long Tasks API. That sees the tasks of the page's own
 * event loop: a timer, an event handler, `blockMainThread(page, ms, {during})`.
 * A DevTools `page.evaluate`, such as `blockMainThread(page, ms)` without
 * `during`, is not one of them and is never recorded here; `traceRendering`
 * reports it in `devtoolsTasks`, apart from the page's `longTasks`.
 */
export async function installLongTaskLog(page: Page): Promise<void> {
  await page.addInitScript(LONG_TASK_SCRIPT);
}

export interface LongTask {
  /** Epoch ms. */
  readonly start: number;
  readonly durationMs: number;
  readonly name: string;
}

/** Long tasks recorded since navigation, optionally only those overlapping a window. */
export async function readLongTasks(
  page: Page,
  range?: {from: number; to: number},
): Promise<LongTask[]> {
  const tasks = await page.evaluate(
    () =>
      (window as unknown as {__harnessLongTasks?: LongTask[]})
        .__harnessLongTasks ?? [],
  );
  return range == null
    ? tasks
    : tasks.filter(
        t => t.start < range.to && t.start + t.durationMs > range.from,
      );
}
