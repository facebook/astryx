// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zoomFromSource.test.ts
 * @input zoomFromSource with a stub zoom stage, a source and a container in
 *   jsdom
 * @output Pins architecture:layer-runtime INV15 for the zoom: the photo grows
 *   out of its source, and shrinks back into it, through the shared rect
 *   morph on the zoom stage's own animator, and the source's copy through a
 *   rect morph of its own, on the same spring and the same presented start
 * @position Unit test for zoomFromSource.ts
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {createAnimator} from '../motion/animator';
import {createRectMorph, type RectMorph} from '../motion/rectMorph';
import type * as RectMorphModule from '../motion/rectMorph';
import type {ZoomStage} from './useZoomCore';
import {zoomFromSource} from './zoomFromSource';

vi.mock('../motion/rectMorph', async importOriginal => {
  const actual = await importOriginal<typeof RectMorphModule>();
  return {
    ...actual,
    // Every morph made is the real one, its present and dismiss watched.
    createRectMorph: vi.fn(
      (...args: Parameters<typeof actual.createRectMorph>) => {
        const morph = actual.createRectMorph(...args);
        vi.spyOn(morph, 'present');
        vi.spyOn(morph, 'dismiss');
        return morph;
      },
    ),
  };
});

type Box = {x: number; y: number; width: number; height: number};

function placed<T extends HTMLElement>(element: T, box: Box): T {
  element.getBoundingClientRect = () => ({
    ...box,
    left: box.x,
    top: box.y,
    right: box.x + box.width,
    bottom: box.y + box.height,
    toJSON: () => box,
  });
  return element;
}

const SOURCE: Box = {x: 20, y: 40, width: 100, height: 100};
const FITTED: Box = {x: 0, y: 250, width: 400, height: 300};

function setup() {
  const container = placed(document.createElement('div'), {
    x: 0,
    y: 0,
    width: 400,
    height: 800,
  });
  document.body.append(container);
  const source = placed(document.createElement('img'), SOURCE);
  source.src = '/thumbnail.jpg';
  document.body.append(source);
  const photo = document.createElement('img');
  container.append(photo);
  // The stage's own animator, which pinch, pan and settle share.
  const animator = createAnimator(photo);
  const morph = vi.mocked(createRectMorph)(photo, {animator});
  vi.mocked(createRectMorph).mockClear();
  const stage = {
    fittedBox: () => FITTED,
    shownBox: () => FITTED,
    morph: () => ({morph, photo}),
    play: vi.fn(),
    rest: vi.fn(),
  } as unknown as ZoomStage;
  return {container, source, photo, morph, stage};
}

afterEach(() => {
  document.body.replaceChildren();
  vi.mocked(createRectMorph).mockClear();
});

describe('zoomFromSource through the shared rect morph (INV15)', () => {
  it('grows the photo out of its source on the stage’s morph, and the source’s copy on one of its own', () => {
    const {container, source, morph, stage} = setup();
    const opening = zoomFromSource({
      kind: 'open',
      source,
      container,
      stage,
      fades: [],
      src: '/photo.jpg',
    });
    expect(opening).not.toBeNull();
    const present = vi.mocked(morph.present);
    expect(present).toHaveBeenCalledTimes(1);
    const [path, spring, options] = present.mock.calls[0];
    // From the source's width and the photo's aspect, centred on the source,
    // to the photo's fitted box, each axis scaled alike.
    expect(path.scale).toBe('uniform');
    expect(path.box).toEqual(FITTED);
    expect(path.rectAt(0)).toEqual({x: 20, y: 52.5, width: 100, height: 75});
    expect(path.rectAt(1)).toEqual(FITTED);
    expect(options?.start).toBe('presented');
    // The source's copy: a rect morph of its own, laid out on the source.
    const portal = container.querySelector<HTMLElement>(
      '[data-lightbox-portal]',
    );
    expect(portal).not.toBeNull();
    const made = vi.mocked(createRectMorph).mock.calls;
    expect(made.map(([element]) => element)).toEqual([portal]);
    const copy = vi.mocked(createRectMorph).mock.results[0].value as RectMorph;
    const [copyPath, copySpring, copyOptions] = vi.mocked(copy.present).mock
      .calls[0];
    expect(copyPath.box).toEqual(SOURCE);
    expect(copyPath.rectAt(0)).toEqual(SOURCE);
    expect(copySpring).toBe(spring);
    expect(copyOptions?.start).toBe('presented');
  });

  it('shrinks the photo back into its source on the stage’s morph, the photo itself as the target', () => {
    const {container, source, photo, morph, stage} = setup();
    const closing = zoomFromSource({
      kind: 'close',
      source,
      container,
      stage,
      fades: [],
      src: '/photo.jpg',
    });
    expect(closing).not.toBeNull();
    const dismiss = vi.mocked(morph.dismiss);
    expect(dismiss).toHaveBeenCalledTimes(1);
    const [path, , options] = dismiss.mock.calls[0];
    expect(options.target).toBe(photo);
    expect(path.rectAt(0)).toEqual({x: 20, y: 52.5, width: 100, height: 75});
    const copy = vi.mocked(createRectMorph).mock.results[0].value as RectMorph;
    expect(vi.mocked(copy.dismiss)).toHaveBeenCalledTimes(1);
  });
});
