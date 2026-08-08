// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for `parseAppShell` — the load-boundary validator for an
 * integration's `appShell` module. Zod is sealed inside the parser; these
 * exercise the public contract (validated value out / readable error thrown).
 */

import {describe, it, expect} from 'vitest';
import {parseAppShell} from './parse.mjs';

/** Run parseAppShell and return the thrown message (asserting it throws). */
function reason(value, label = 'app shell') {
  try {
    parseAppShell(value, label);
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
  throw new Error('expected parseAppShell to throw');
}

describe('parseAppShell (load boundary)', () => {
  it('accepts a minimal shell', () => {
    const parsed = parseAppShell({component: 'MetaAppFrame', from: '@xds/meta'});
    expect(parsed.component).toBe('MetaAppFrame');
    expect(parsed.from).toBe('@xds/meta');
  });

  it('accepts importKind, props and a description', () => {
    const parsed = parseAppShell({
      component: 'Frame',
      from: '@xds/meta',
      importKind: 'default',
      props: {surface: 'internal', density: 2, compact: true},
      description: 'internal shell: nav, search, and the standard app chrome',
    });
    expect(parsed.importKind).toBe('default');
    expect(parsed.description).toContain('internal shell');
  });

  it('requires a component', () => {
    expect(reason({from: '@xds/meta'})).toContain('component');
  });

  it('requires a from — the shell always imports itself', () => {
    expect(reason({component: 'MetaAppFrame'})).toContain('from');
    expect(reason({component: 'MetaAppFrame', from: ''})).toContain('from');
  });

  it('rejects a non-identifier component name', () => {
    expect(reason({component: 'Foo.Bar', from: '@m'})).toContain('component');
    expect(reason({component: 'has space', from: '@m'})).toContain('component');
    expect(reason({component: 'X attr="y"', from: '@m'})).toContain('component');
  });

  it('rejects unknown keys (strict)', () => {
    expect(
      reason({component: 'X', from: '@xds/meta', bogus: true}),
    ).toContain('Unrecognized key');
  });

  it('rejects a wrap key — stacking is not an authored concept', () => {
    expect(
      reason({wrap: {component: 'X', from: '@m'}}),
    ).toContain('Unrecognized key');
  });

  it('accepts object and array prop values (JSON-shaped)', () => {
    expect(() =>
      parseAppShell({
        component: 'X',
        from: '@m',
        props: {
          config: {theme: 'dark', density: 3, nested: {a: [1, 2, {b: true}]}},
          tabs: ['a', 'b'],
          empty: {},
          nothing: null,
        },
      }),
    ).not.toThrow();
  });

  it('accepts hyphenated prop names (data-*/aria-*)', () => {
    expect(() =>
      parseAppShell({
        component: 'X',
        from: '@m',
        props: {'data-testid': 'frame', 'aria-label': 'shell'},
      }),
    ).not.toThrow();
  });

  it('rejects an invalid prop name (would split into multiple attributes)', () => {
    expect(reason({component: 'X', from: '@m', props: {'bad key': 'v'}})).toContain(
      'props',
    );
  });

  it('rejects a non-JSON prop value (function)', () => {
    expect(
      reason({component: 'X', from: '@m', props: {onReady: () => {}}}),
    ).toContain('props');
  });

  it('rejects a non-serializable value nested inside an object prop', () => {
    expect(
      reason({component: 'X', from: '@m', props: {config: {onChange: () => {}}}}),
    ).toContain('props');
  });

  it('rejects a non-object module export', () => {
    expect(reason(null)).toBeTruthy();
    expect(reason(42)).toBeTruthy();
    expect(reason([{component: 'X', from: '@m'}])).toBeTruthy();
  });
});
