// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, describe, expect, it, vi} from 'vitest';
import {TOUCH_QUERY} from '../utils/touchQueries';
import {holdEntranceInput} from './holdEntranceInput';
import {isInHeldLayer} from './inputHold';

function deferred() {
  let resolve: () => void = () => {};
  let reject: (error: unknown) => void = () => {};
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
}

/** A fake animation: running, and ending at `endTime` (Infinity: endless). */
function fakeAnimation(
  finished: Promise<unknown>,
  {
    endTime = 300,
    playState = 'running',
  }: {endTime?: number; playState?: AnimationPlayState} = {},
): Animation {
  return {
    playState,
    finished,
    effect: {getComputedTiming: () => ({endTime})},
  } as unknown as Animation;
}

/** A layer root in the document whose own animations are `animations`. */
function mountLayer(animations: Animation[]): HTMLElement {
  const layer = document.createElement('div');
  layer.append(document.createElement('button'));
  document.body.append(layer);
  Object.defineProperty(layer, 'getAnimations', {
    configurable: true,
    value: () => animations,
  });
  return layer;
}

/** The primary pointer: a finger (`coarse`) or a mouse. */
function stubPointer(coarse: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: coarse && query === TOUCH_QUERY,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })),
  );
}

const flush = async () => {
  for (let i = 0; i < 4; i += 1) {
    await Promise.resolve();
  }
};

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe('holdEntranceInput', () => {
  it('under a finger, holds the layer until its entrance ends', async () => {
    stubPointer(true);
    const entrance = deferred();
    const layer = mountLayer([fakeAnimation(entrance.promise)]);

    expect(holdEntranceInput(layer)).toBeTypeOf('function');
    expect(isInHeldLayer(layer.firstElementChild)).toBe(true);

    entrance.resolve();
    await flush();
    expect(isInHeldLayer(layer.firstElementChild)).toBe(false);
  });

  it('waits for every animation of the entrance', async () => {
    stubPointer(true);
    const short = deferred();
    const long = deferred();
    const layer = mountLayer([
      fakeAnimation(short.promise, {endTime: 200}),
      fakeAnimation(long.promise, {endTime: 400}),
    ]);

    holdEntranceInput(layer);
    short.resolve();
    await flush();
    expect(isInHeldLayer(layer)).toBe(true);

    long.resolve();
    await flush();
    expect(isInHeldLayer(layer)).toBe(false);
  });

  it('ends the hold when the entrance is canceled (a close midway)', async () => {
    stubPointer(true);
    const entrance = deferred();
    const layer = mountLayer([fakeAnimation(entrance.promise)]);

    holdEntranceInput(layer);
    entrance.reject(new DOMException('canceled', 'AbortError'));
    await flush();
    expect(isInHeldLayer(layer)).toBe(false);
  });

  it('returns a release that ends the hold early', () => {
    stubPointer(true);
    const layer = mountLayer([fakeAnimation(new Promise(() => {}))]);

    const release = holdEntranceInput(layer);
    release?.();
    expect(isInHeldLayer(layer)).toBe(false);
  });

  it('holds nothing with a mouse: the primary pointer is fine', () => {
    stubPointer(false);
    const layer = mountLayer([fakeAnimation(new Promise(() => {}))]);

    expect(holdEntranceInput(layer)).toBeNull();
    expect(isInHeldLayer(layer)).toBe(false);
  });

  it('holds nothing when no entrance runs: none, finished, or endless', () => {
    stubPointer(true);
    const never = new Promise(() => {});
    for (const animations of [
      [],
      [fakeAnimation(Promise.resolve(), {playState: 'finished'})],
      [fakeAnimation(never, {endTime: Infinity})],
    ]) {
      const layer = mountLayer(animations);
      expect(holdEntranceInput(layer)).toBeNull();
      expect(isInHeldLayer(layer)).toBe(false);
    }
  });
});
