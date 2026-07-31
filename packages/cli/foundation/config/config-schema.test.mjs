// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for config-schema — the runtime zod schemas for
 * astryx.config.* and integration manifests. These lock:
 *   - AstryxConfigSchema accepts an empty config and a fully-populated valid one,
 *   - it rejects non-objects (null / number / array) with a readable message,
 *   - .strict() rejects unknown top-level AND nested keys,
 *   - issuesUrl must be a URL, integrations must be string[],
 *   - postCodemod.buildCommand must be a function (the custom `Fn` schema),
 *   - AstryxIntegrationSchema is likewise strict,
 *   - formatZodError renders `label is invalid: path: message; ...`, using
 *     `(root)` for the top-level path.
 */

import {describe, it, expect} from 'vitest';
import {
  AstryxConfigSchema,
  AstryxIntegrationSchema,
  PostCodemodHookSchema,
  XleComponentSchema,
  formatZodError,
} from './config-schema.mjs';

/** Parse and, on failure, return the formatted error string. */
function reason(schema, value, label = 'config') {
  const res = schema.safeParse(value);
  return res.success ? null : formatZodError(label, res.error);
}

describe('AstryxConfigSchema', () => {
  it('accepts an empty config (every field optional)', () => {
    expect(AstryxConfigSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a fully-populated valid config', () => {
    const cfg = {
      integrations: ['@astryxdesign/core'],
      issuesUrl: 'https://github.com/org/repo/issues',
      hooks: {postCodemod: [{name: 'build', buildCommand: () => {}}]},
      experimental: {xle: {components: {Foo: {from: 'pkg', default: true}}}},
    };
    expect(AstryxConfigSchema.safeParse(cfg).success).toBe(true);
  });

  it('rejects null / number / array with a readable message', () => {
    expect(reason(AstryxConfigSchema, null)).toContain('expected object');
    expect(reason(AstryxConfigSchema, 42)).toContain('expected object');
    expect(reason(AstryxConfigSchema, [])).toContain('expected object');
  });

  it('rejects unknown top-level keys (.strict)', () => {
    const msg = reason(AstryxConfigSchema, {bogus: 1});
    expect(msg).toContain('Unrecognized key');
    expect(msg).toContain('bogus');
  });

  it('rejects a bad issuesUrl', () => {
    expect(reason(AstryxConfigSchema, {issuesUrl: 'not-a-url'})).toContain(
      'issuesUrl',
    );
  });

  it('rejects mistyped integrations', () => {
    expect(reason(AstryxConfigSchema, {integrations: 'nope'})).toContain(
      'expected array',
    );
    expect(reason(AstryxConfigSchema, {integrations: [1]})).toContain(
      'integrations.0',
    );
  });

  it('rejects a non-function postCodemod.buildCommand', () => {
    const msg = reason(AstryxConfigSchema, {
      hooks: {postCodemod: [{buildCommand: 'notAFn'}]},
    });
    expect(msg).toContain('buildCommand');
    expect(msg).toContain('Expected function');
  });

  it('rejects unknown nested keys inside experimental.xle.components', () => {
    const msg = reason(AstryxConfigSchema, {
      experimental: {xle: {components: {Foo: {from: 'pkg', bad: 1}}}},
    });
    expect(msg).toContain('Unrecognized key');
  });
});

describe('PostCodemodHookSchema / XleComponentSchema', () => {
  it('PostCodemodHookSchema accepts {buildCommand} and rejects a missing one', () => {
    expect(PostCodemodHookSchema.safeParse({buildCommand: () => {}}).success).toBe(
      true,
    );
    expect(PostCodemodHookSchema.safeParse({}).success).toBe(false);
  });

  it('XleComponentSchema requires `from` and is strict', () => {
    expect(XleComponentSchema.safeParse({from: 'pkg'}).success).toBe(true);
    expect(XleComponentSchema.safeParse({}).success).toBe(false);
    expect(XleComponentSchema.safeParse({from: 'pkg', extra: 1}).success).toBe(
      false,
    );
  });
});

describe('AstryxIntegrationSchema', () => {
  it('accepts an empty manifest and a valid one', () => {
    expect(AstryxIntegrationSchema.safeParse({}).success).toBe(true);
    expect(
      AstryxIntegrationSchema.safeParse({
        components: './c',
        issuesUrl: 'https://example.com/i',
      }).success,
    ).toBe(true);
  });

  it('rejects unknown keys and a bad issuesUrl', () => {
    expect(reason(AstryxIntegrationSchema, {bogus: 1})).toContain(
      'Unrecognized key',
    );
    expect(reason(AstryxIntegrationSchema, {issuesUrl: 'x'})).toContain(
      'issuesUrl',
    );
  });
});

describe('formatZodError', () => {
  it('renders "label is invalid: path: message"', () => {
    const res = AstryxConfigSchema.safeParse({issuesUrl: 'bad'});
    expect(res.success).toBe(false);
    const msg = formatZodError('astryx.config.mjs', res.error);
    expect(msg).toMatch(/^astryx\.config\.mjs is invalid: /);
    expect(msg).toContain('issuesUrl: ');
  });

  it('uses "(root)" for a top-level (empty-path) issue', () => {
    const res = AstryxConfigSchema.safeParse(null);
    expect(formatZodError('config', res.error)).toContain('(root): ');
  });

  it('joins multiple issues with "; "', () => {
    const res = AstryxConfigSchema.safeParse({integrations: [1, 2]});
    const msg = formatZodError('config', res.error);
    expect(msg).toContain('; ');
    expect(msg).toContain('integrations.0');
    expect(msg).toContain('integrations.1');
  });
});
