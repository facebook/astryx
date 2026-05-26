// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  createClientPropMarker,
  isClientProp,
  buildPropsWithClientMarkers,
} from './ClientProp';

describe('createClientPropMarker', () => {
  it('creates a marker with the correct shape', () => {
    const marker = createClientPropMarker('onDone');
    expect(marker).toEqual({
      __clientPropMarker: 'client-prop',
      __propName: 'onDone',
    });
  });
});

describe('isClientProp', () => {
  it('returns true for a client prop marker', () => {
    const marker = createClientPropMarker('onDone');
    expect(isClientProp(marker)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isClientProp(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isClientProp(undefined)).toBe(false);
  });

  it('returns false for a plain object', () => {
    expect(isClientProp({foo: 'bar'})).toBe(false);
  });

  it('returns false for a function', () => {
    expect(isClientProp(() => {})).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isClientProp('hello')).toBe(false);
  });
});

describe('buildPropsWithClientMarkers', () => {
  it('passes server props through unchanged', () => {
    const result = buildPropsWithClientMarkers(
      {title: 'Hello', count: 5},
      {onDone: () => {}},
    );
    expect(result.title).toBe('Hello');
    expect(result.count).toBe(5);
  });

  it('replaces client props with markers', () => {
    const result = buildPropsWithClientMarkers(
      {title: 'Hello'},
      {onDone: () => {}},
    );
    expect(isClientProp(result.onDone)).toBe(true);
    expect((result.onDone as {__propName: string}).__propName).toBe('onDone');
  });

  it('always includes an onOpenChange marker', () => {
    const result = buildPropsWithClientMarkers({title: 'Hello'}, {});
    expect(isClientProp(result.onOpenChange)).toBe(true);
    expect((result.onOpenChange as {__propName: string}).__propName).toBe(
      'onOpenChange',
    );
  });

  it('does not include client prop values in the result', () => {
    const fn = () => {};
    const result = buildPropsWithClientMarkers({title: 'Hello'}, {onDone: fn});
    expect(result.onDone).not.toBe(fn);
  });
});
