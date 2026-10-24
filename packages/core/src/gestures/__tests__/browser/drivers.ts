// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file drivers.ts
 * @input A Playwright page in Chromium or WebKit
 * @output Real engine touch input for the gesture browser proofs: Chromium
 *   through CDP with explicit timestamps, WebKit through its own input
 *   command (real-time pacing); one-finger drags as steps; fixtures bundled
 *   and opened in a blank phone page
 * @position Shared by the browser specs of packages/core/src/gestures
 */

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import type {Page} from '@playwright/test';

export type Point = {x: number; y: number};
export type Finger = Point & {id: number};

/** The fingers down after a step, and when (ms after the gesture's start). */
export interface Step {
  t: number;
  down: Finger[];
}

export interface Driver {
  readonly engine: 'chromium' | 'webkit';
  /** Plays the steps as real touch input; returns the page time of t = 0. */
  play(steps: Step[]): Promise<number>;
  /** A tap through the engine's tap path (WebKit synthesises click only from it). */
  tap(at: Point): Promise<void>;
}

export const sleep = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Each step's change against the previous one: who landed, lifted, moved. */
function diff(previous: Finger[], next: Finger[]) {
  const before = new Set(previous.map(finger => finger.id));
  const after = new Set(next.map(finger => finger.id));
  return {
    landed: next.filter(finger => !before.has(finger.id)),
    lifted: previous.filter(finger => !after.has(finger.id)),
  };
}

export async function chromiumDriver(page: Page): Promise<Driver> {
  const cdp = await page.context().newCDPSession(page);
  const origin = await page.evaluate(() => performance.timeOrigin);
  // The fingers down, across calls: a gesture may span several.
  let down: Finger[] = [];
  const send = async (type: string, points: Finger[], at: number) =>
    cdp.send('Input.dispatchTouchEvent', {
      type: type as 'touchStart',
      touchPoints: points.map(point => ({
        x: point.x,
        y: point.y,
        id: point.id,
      })),
      timestamp: (origin + at) / 1000,
    });
  return {
    engine: 'chromium',
    async play(steps) {
      // CDP stamps every event with the scripted time, so the page sees the
      // script's timing exactly, whatever the dispatch latency.
      const base = Math.ceil(await page.evaluate(() => performance.now())) + 50;
      for (const step of steps) {
        const {landed} = diff(down, step.down);
        // CDP diffs active points against the previous event: a new point
        // is pressed, a missing one released; touchEnd carries none.
        const type =
          landed.length > 0
            ? 'touchStart'
            : step.down.length === 0
              ? 'touchEnd'
              : 'touchMove';
        await send(type, step.down, base + step.t);
        down = step.down;
      }
      return base;
    },
    async tap(at) {
      const base = Math.ceil(await page.evaluate(() => performance.now())) + 50;
      await send('touchStart', [{...at, id: 1}], base);
      await send('touchEnd', [], base + 60);
    },
  };
}

interface WebKitSession {
  send(method: string, params?: Record<string, unknown>): Promise<unknown>;
}

/** Playwright's server-side WebKit page session (a locally launched browser). */
function webkitSession(page: Page): WebKitSession {
  const connection = (
    page as unknown as {_connection?: {toImpl?: (o: unknown) => unknown}}
  )._connection;
  const impl = connection?.toImpl?.(page) as
    {delegate?: {_pageProxySession?: WebKitSession}} | undefined;
  const session = impl?.delegate?._pageProxySession;
  if (session == null) {
    throw new Error('WebKit touch input needs a locally launched browser');
  }
  return session;
}

export function webkitDriver(page: Page): Driver {
  const session = webkitSession(page);
  // WebKit's command applies the event's phase to every point it lists: a
  // start lists only the fingers that land, an end only those that lift, a
  // move every finger down. Integer CSS px; the page sees real time.
  const points = (fingers: Finger[]) =>
    fingers.map(f => ({x: Math.round(f.x), y: Math.round(f.y), id: f.id}));
  // The fingers down, across calls: a gesture may span several.
  let down: Finger[] = [];
  return {
    engine: 'webkit',
    async play(steps) {
      const start = Date.now();
      const base = await page.evaluate(() => performance.now());
      for (const step of steps) {
        const wait = start + step.t - Date.now();
        if (wait > 0) {
          await sleep(wait);
        }
        const {landed, lifted} = diff(down, step.down);
        if (landed.length > 0) {
          await session.send('Input.dispatchTouchEvent', {
            type: 'touchStart',
            touchPoints: points(landed),
          });
        } else if (lifted.length > 0) {
          await session.send('Input.dispatchTouchEvent', {
            type: 'touchEnd',
            touchPoints: points(lifted),
          });
        } else {
          await session.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: points(step.down),
          });
        }
        down = step.down;
      }
      return base;
    },
    async tap(at) {
      await page.touchscreen.tap(Math.round(at.x), Math.round(at.y));
    },
  };
}

/** One finger from `from` to `to` in `count` frames of 16 ms, then a lift. */
export function drag(from: Point, to: Point, count = 12, lift = true): Step[] {
  const steps: Step[] = [{t: 0, down: [{...from, id: 1}]}];
  for (let i = 1; i <= count; i++) {
    const k = i / count;
    steps.push({
      t: i * 16,
      down: [
        {
          x: from.x + (to.x - from.x) * k,
          y: from.y + (to.y - from.y) * k,
          id: 1,
        },
      ],
    });
  }
  if (lift) {
    steps.push({t: (count + 1) * 16, down: []});
  }
  return steps;
}

/** A fixture beside this file, bundled for injection into a blank page. */
export async function bundleFixture(file: string): Promise<string> {
  const result = await build({
    entryPoints: [
      path.join(path.dirname(fileURLToPath(import.meta.url)), file),
    ],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: 'es2022',
    define: {'process.env.NODE_ENV': '"production"'},
  });
  return result.outputFiles[0].text;
}

/** Opens a blank phone page running `bundle`, with the engine's touch driver. */
export async function openFixture(
  page: Page,
  engine: string,
  bundle: string,
): Promise<Driver> {
  // A real navigation first: touch emulation exposes the Touch Events API
  // to documents it creates.
  await page.goto('about:blank');
  await page.setContent(
    '<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><body></body>',
  );
  await page.addScriptTag({content: bundle});
  return engine === 'webkit' ? webkitDriver(page) : chromiumDriver(page);
}

export async function center(page: Page, id: string): Promise<Point> {
  const box = await page.locator(`#${id}`).boundingBox();
  if (box == null) {
    throw new Error(`#${id} has no box`);
  }
  return {
    x: Math.round(box.x + box.width / 2),
    y: Math.round(box.y + box.height / 2),
  };
}
