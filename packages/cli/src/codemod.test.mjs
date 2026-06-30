// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createCodemod, createConfigCodemod} from './codemod.mjs';

describe('createCodemod', () => {
  it('returns the definition stamped with type: code and isOptional default', () => {
    const transform = file => file.source;
    const result = createCodemod({title: 'Drop foo', transform});
    expect(result.type).toBe('code');
    expect(result.title).toBe('Drop foo');
    expect(result.transform).toBe(transform);
    expect(result.isOptional).toBe(false);
  });

  it('preserves description, fileExtensions, and explicit isOptional', () => {
    const result = createCodemod({
      title: 'Rename',
      description: 'renames things',
      isOptional: true,
      fileExtensions: ['.tsx'],
      transform: () => null,
    });
    expect(result.description).toBe('renames things');
    expect(result.isOptional).toBe(true);
    expect(result.fileExtensions).toEqual(['.tsx']);
  });

  it('throws when title is missing', () => {
    expect(() => createCodemod({transform: () => null})).toThrow(/title/i);
  });

  it('throws when transform is missing', () => {
    expect(() => createCodemod({title: 'x'})).toThrow(/transform/i);
  });

  it('throws when transform is not a function', () => {
    expect(() => createCodemod({title: 'x', transform: 'nope'})).toThrow(
      /transform/i,
    );
  });

  it('throws on unknown keys', () => {
    expect(() =>
      createCodemod({title: 'x', transform: () => null, bogus: true}),
    ).toThrow();
  });
});

describe('createConfigCodemod', () => {
  it('returns the definition stamped with type: config', () => {
    const transform = file => file.source;
    const result = createConfigCodemod({title: 'Config bump', transform});
    expect(result.type).toBe('config');
    expect(result.isOptional).toBe(false);
    expect(result.transform).toBe(transform);
  });

  it('throws when title is missing', () => {
    expect(() => createConfigCodemod({transform: () => null})).toThrow(
      /title/i,
    );
  });

  it('throws when transform is missing or not a function', () => {
    expect(() => createConfigCodemod({title: 'x'})).toThrow(/transform/i);
    expect(() =>
      createConfigCodemod({title: 'x', transform: 42}),
    ).toThrow(/transform/i);
  });

  it('rejects fileExtensions (config codemods target astryx.config.* only)', () => {
    expect(() =>
      createConfigCodemod({
        title: 'x',
        transform: () => null,
        fileExtensions: ['.ts'],
      }),
    ).toThrow();
  });

  it('throws on unknown keys', () => {
    expect(() =>
      createConfigCodemod({title: 'x', transform: () => null, bogus: 1}),
    ).toThrow();
  });
});
