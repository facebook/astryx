// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Helper-level unit tests for the wrap + ensure-import AST primitives.
 * These exercise the many shapes a template's default export can take and the
 * import merge/insert rules directly against jscodeshift, so the higher-level
 * engine tests can stay focused on orchestration.
 */

import {describe, it, expect} from 'vitest';
import jscodeshift from 'jscodeshift';
import {fixDirectiveCorruption} from '../../../assets/codemods/runner.mjs';
import {ensureImport, wrapDefaultExportReturn} from './jsx.mjs';

/**
 * Parse, run a mutator, and return the printed source — post-processed with the
 * same `fixDirectiveCorruption` the engine applies before emitting, so these
 * helper-level assertions reflect the source that actually ships (recast
 * double-prints a directive's semicolon when inserting near it).
 */
function run(src, mutate) {
  const j = jscodeshift.withParser('tsx');
  const root = j(src);
  const changed = mutate(j, root);
  return {changed, out: fixDirectiveCorruption(root.toSource({quote: 'single'}))};
}

const wrap = (component, props) => (j, root) =>
  wrapDefaultExportReturn(j, root, [{component, props}]);

const parses = src => () => jscodeshift.withParser('tsx')(src);

describe('wrapDefaultExportReturn — default-export shapes', () => {
  it('wraps a function declaration return', () => {
    const {changed, out} = run(
      `export default function Page() { return <X a="1" />; }`,
      wrap('W'),
    );
    expect(changed).toBe(true);
    expect(out).toMatch(/<W>\s*<X a="1" \/>\s*<\/W>/);
    expect(parses(out)).not.toThrow();
  });

  it('wraps an anonymous default function', () => {
    const {changed, out} = run(
      `export default function () { return <X />; }`,
      wrap('W'),
    );
    expect(changed).toBe(true);
    expect(out).toContain('<W>');
  });

  it('wraps an arrow with an expression body', () => {
    const {changed, out} = run(`export default () => <X />;`, wrap('W'));
    expect(changed).toBe(true);
    expect(out).toMatch(/<W>\s*<X \/>\s*<\/W>/);
  });

  it('wraps an arrow with a block body', () => {
    const {changed, out} = run(
      `export default () => { return <X />; };`,
      wrap('W'),
    );
    expect(changed).toBe(true);
    expect(out).toContain('<W>');
  });

  it('wraps via `export default Identifier` → const arrow', () => {
    const {changed, out} = run(
      `const Page = () => <X />;\nexport default Page;`,
      wrap('W'),
    );
    expect(changed).toBe(true);
    expect(out).toContain('<W>');
  });

  it('wraps via `export default Identifier` → function declaration', () => {
    const {changed, out} = run(
      `function Page() { return <X />; }\nexport default Page;`,
      wrap('W'),
    );
    expect(changed).toBe(true);
    expect(out).toContain('<W>');
  });

  it('returns false when there is no default export', () => {
    const {changed, out} = run(`export const y = 1;`, wrap('W'));
    expect(changed).toBe(false);
    expect(out).not.toContain('<W>');
  });

  it('is idempotent: does not re-wrap an already-wrapped return', () => {
    const {changed, out} = run(
      `export default function Page() { return <W><X /></W>; }`,
      wrap('W'),
    );
    expect(changed).toBe(false);
    expect((out.match(/<W>/g) ?? []).length).toBe(1);
  });
});

describe('wrapDefaultExportReturn — return argument shapes', () => {
  it('wraps a fragment', () => {
    const {changed, out} = run(
      `export default function Page() { return <><X /></>; }`,
      wrap('W'),
    );
    expect(changed).toBe(true);
    expect(out).toContain('<W>');
    expect(out).toContain('<>');
    expect(parses(out)).not.toThrow();
  });

  it('does not leak parentheses from a parenthesized return', () => {
    const {out} = run(
      `export default function Page() {\n  return (\n    <X />\n  );\n}`,
      wrap('W'),
    );
    expect(out).not.toContain('>(');
    expect(out).not.toContain('/>)');
    expect(parses(out)).not.toThrow();
  });

  it('wraps a non-JSX expression in an expression container', () => {
    const {changed, out} = run(
      `export default function Page() { return cond ? <A /> : <B />; }`,
      wrap('W'),
    );
    expect(changed).toBe(true);
    expect(out).toMatch(/<W>\s*\{cond \? <A \/> : <B \/>\}\s*<\/W>/);
    expect(parses(out)).not.toThrow();
  });
});

describe('wrapDefaultExportReturn — props', () => {
  it('renders string, number, and boolean props', () => {
    const {out} = run(
      `export default function Page() { return <X />; }`,
      wrap('W', {surface: 'internal', density: 2, compact: true, off: false}),
    );
    expect(out).toMatch(/surface='internal'/);
    expect(out).toMatch(/density=\{2\}/);
    expect(out).toMatch(/compact(\s|\/|>)/);
    expect(out).not.toMatch(/compact=\{true\}/);
    expect(out).toMatch(/off=\{false\}/);
    expect(parses(out)).not.toThrow();
  });
});

describe('ensureImport — insertion', () => {
  it('inserts at the top when there are no imports', () => {
    const {changed, out} = run(`export const y = 1;\n`, (j, root) =>
      ensureImport(j, root, {from: '@m', named: ['A']}),
    );
    expect(changed).toBe(true);
    expect(out).toMatch(/^import \{\s*A\s*\} from '@m';/);
  });

  it('inserts after a leading directive prologue', () => {
    const {out} = run(`'use client';\nexport const y = 1;\n`, (j, root) =>
      ensureImport(j, root, {from: '@m', named: ['A']}),
    );
    expect(out.trimStart().startsWith("'use client'")).toBe(true);
    expect(out).toMatch(/'use client';\s*\nimport \{\s*A\s*\} from '@m';/);
  });

  it('inserts after the last existing import', () => {
    const {out} = run(
      `import {Layout} from '@astryxdesign/core';\nexport const y = 1;\n`,
      (j, root) => ensureImport(j, root, {from: '@m', named: ['A']}),
    );
    expect(out).toMatch(
      /import \{Layout\} from '@astryxdesign\/core';\s*\nimport \{\s*A\s*\} from '@m';/,
    );
  });
});

describe('ensureImport — merge + dedupe', () => {
  it('merges a named specifier into an existing import from the same module', () => {
    const {changed, out} = run(
      `import {A} from '@m';\n`,
      (j, root) => ensureImport(j, root, {from: '@m', named: ['B']}),
    );
    expect(changed).toBe(true);
    expect((out.match(/from '@m'/g) ?? []).length).toBe(1);
    expect(out).toMatch(/A/);
    expect(out).toMatch(/B/);
  });

  it('is a no-op when the named specifier is already present', () => {
    const {changed, out} = run(
      `import {A} from '@m';\n`,
      (j, root) => ensureImport(j, root, {from: '@m', named: ['A']}),
    );
    expect(changed).toBe(false);
    expect((out.match(/\bA\b/g) ?? []).length).toBe(1);
  });

  it('adds a default specifier when the module import has none', () => {
    const {changed, out} = run(
      `import {A} from '@m';\n`,
      (j, root) => ensureImport(j, root, {from: '@m', default: 'D'}),
    );
    expect(changed).toBe(true);
    expect(out).toMatch(/import D\s*,\s*\{\s*A\s*\} from '@m'/);
  });

  it('is a no-op when a default specifier is already present', () => {
    const {changed} = run(
      `import D from '@m';\n`,
      (j, root) => ensureImport(j, root, {from: '@m', default: 'D2'}),
    );
    // A different default name is NOT added (one default per module).
    expect(changed).toBe(false);
  });

  it('creates a new default + named import when the module is absent', () => {
    const {out} = run(`export const y = 1;\n`, (j, root) =>
      ensureImport(j, root, {from: '@m', default: 'D', named: ['A']}),
    );
    expect(out).toMatch(/import D\s*,\s*\{\s*A\s*\} from '@m'/);
  });

  it('creates a type-only import when requested', () => {
    const {out} = run(`export const y = 1;\n`, (j, root) =>
      ensureImport(j, root, {from: '@m', named: ['T'], typeOnly: true}),
    );
    expect(out).toMatch(/import type \{\s*T\s*\} from '@m'/);
  });

  it('is a no-op when nothing is requested', () => {
    const {changed} = run(`export const y = 1;\n`, (j, root) =>
      ensureImport(j, root, {from: '@m'}),
    );
    expect(changed).toBe(false);
  });
});
