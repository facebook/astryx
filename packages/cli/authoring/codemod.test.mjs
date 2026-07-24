// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  createCodemod,
  createConfigCodemod,
  CodemodEnvelopeSchema,
} from './codemod.mjs';

// createCodemod/createConfigCodemod are now stamp-only: they inject the `type`
// discriminator and return the definition otherwise unchanged, performing NO
// runtime validation. Validation happens at the LOAD boundary (discovery runs
// the default export through CodemodEnvelopeSchema), so the rejection cases
// that used to assert factory throws now assert the envelope schema rejects.

describe('createCodemod (stamp-only)', () => {
  it('stamps type: code and returns the def otherwise unchanged', () => {
    const transform = file => file.source;
    const result = createCodemod({title: 'Drop foo', transform});
    expect(result.type).toBe('code');
    expect(result.title).toBe('Drop foo');
    expect(result.transform).toBe(transform);
    // Stamp-only: it does NOT apply schema defaults (e.g. isOptional).
    expect(result.isOptional).toBeUndefined();
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
    expect(result.type).toBe('code');
  });

  it('does NOT validate — returns an invalid def stamped, unchanged', () => {
    const result = createCodemod({transform: () => null});
    expect(result.type).toBe('code');
    expect(result.title).toBeUndefined();
  });
});

describe('createConfigCodemod (stamp-only)', () => {
  it('stamps type: config', () => {
    const transform = file => file.source;
    const result = createConfigCodemod({title: 'Config bump', transform});
    expect(result.type).toBe('config');
    expect(result.transform).toBe(transform);
  });
});

describe('CodemodEnvelopeSchema (load-boundary validation)', () => {
  it('accepts a stamped code codemod (incl. defaults)', () => {
    const parsed = CodemodEnvelopeSchema.parse(
      createCodemod({title: 'Drop foo', transform: () => null}),
    );
    expect(parsed.type).toBe('code');
    expect(parsed.isOptional).toBe(false); // schema default applied at load
  });

  it('accepts a PLAIN OBJECT envelope (no factory required)', () => {
    const parsed = CodemodEnvelopeSchema.parse({
      type: 'code',
      title: 'Hand-written',
      transform: () => null,
    });
    expect(parsed.title).toBe('Hand-written');
  });

  it('accepts a stamped config codemod', () => {
    const parsed = CodemodEnvelopeSchema.parse(
      createConfigCodemod({title: 'Bump', transform: () => null}),
    );
    expect(parsed.type).toBe('config');
  });

  it('rejects a missing title', () => {
    expect(() =>
      CodemodEnvelopeSchema.parse({type: 'code', transform: () => null}),
    ).toThrow(/title/i);
  });

  it('rejects a missing transform', () => {
    expect(() =>
      CodemodEnvelopeSchema.parse({type: 'code', title: 'x'}),
    ).toThrow(/transform/i);
  });

  it('rejects a non-function transform', () => {
    expect(() =>
      CodemodEnvelopeSchema.parse({type: 'code', title: 'x', transform: 'nope'}),
    ).toThrow(/transform/i);
  });

  it('rejects a missing/invalid type discriminator', () => {
    expect(() =>
      CodemodEnvelopeSchema.parse({title: 'x', transform: () => null}),
    ).toThrow();
    expect(() =>
      CodemodEnvelopeSchema.parse({
        type: 'bogus',
        title: 'x',
        transform: () => null,
      }),
    ).toThrow();
  });

  it('rejects unknown keys (strict)', () => {
    expect(() =>
      CodemodEnvelopeSchema.parse({
        type: 'code',
        title: 'x',
        transform: () => null,
        bogus: true,
      }),
    ).toThrow();
  });

  it('rejects fileExtensions on a config codemod', () => {
    expect(() =>
      CodemodEnvelopeSchema.parse({
        type: 'config',
        title: 'x',
        transform: () => null,
        fileExtensions: ['.ts'],
      }),
    ).toThrow();
  });
});
