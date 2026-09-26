// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Round-trip tests for the XLE printers (print.mjs). The lexer has no
 * string-escape mechanism, so the printer must pick a delimiter the string
 * doesn't contain — otherwise a valid expression (e.g. a Button label with an
 * apostrophe) re-serializes into text that no longer parses. These lock that
 * contract for both compact and outline surfaces.
 */

import {describe, it, expect} from 'vitest';
import {parse} from './parse.mjs';
import {toCompact, toOutline} from './print.mjs';

/** Parse an expression, print it back, re-parse, and return the KV value. */
function kvOf(ast, key) {
  const attr = ast.roots[0].attrs.find(a => a.kind === 'kv' && a.key === key);
  return attr ? attr.value : undefined;
}

describe('print round-trip — strings with embedded quotes', () => {
  it('KV value with an apostrophe re-parses identically (compact)', () => {
    const doc = parse(`B[label="Don't panic"]`, {form: 'compact'});
    const round = parse(toCompact(doc), {form: 'compact'});
    expect(kvOf(round, 'label')).toBe("Don't panic");
  });

  it('KV value with an apostrophe re-parses identically (outline)', () => {
    const doc = parse(`B[label="Don't panic"]`, {form: 'compact'});
    const round = parse(toOutline(doc), {form: 'outline'});
    expect(kvOf(round, 'label')).toBe("Don't panic");
  });

  it('payload with double quotes re-parses identically (compact)', () => {
    const doc = parse(`Tx'She said "hi"'`, {form: 'compact'});
    const round = parse(toCompact(doc), {form: 'compact'});
    expect(round.roots[0].payload).toBe('She said "hi"');
  });

  it('payload with double quotes re-parses identically (outline)', () => {
    const doc = parse(`Tx'She said "hi"'`, {form: 'compact'});
    const round = parse(toOutline(doc), {form: 'outline'});
    expect(round.roots[0].payload).toBe('She said "hi"');
  });

  it('plain values are still emitted unquoted', () => {
    const doc = parse(`B[variant=primary]`, {form: 'compact'});
    expect(toCompact(doc)).toContain('variant=primary');
  });
});
