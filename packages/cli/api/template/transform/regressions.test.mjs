// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression unit tests — one minimal, documented test per bug the chaos
 * suite (and the live demo) surfaced. These pin the exact behavior so a future
 * reimplementation of the engine can't silently reintroduce a known defect.
 *
 * Each `it` names the finding and the commit-worthy invariant it guards.
 */

import {describe, it, expect} from 'vitest';
import jscodeshift from 'jscodeshift';
import {fixDirectiveCorruption} from '../../../assets/codemods/runner.mjs';
import {ensureImport, wrapDefaultExportReturn} from './jsx.mjs';
import {applyTemplateTransforms} from './apply.mjs';
import {parseAppShell} from '../../../authoring/app-shell/parse.mjs';

const CORE = '@astryxdesign/core';
const META = '@xds/meta';

/** Run a helper mutation and return the printed source (engine post-processing applied). */
function edit(src, mutate) {
  const j = jscodeshift.withParser('tsx');
  const root = j(src);
  mutate(j, root);
  return fixDirectiveCorruption(root.toSource({quote: 'single'}));
}

/** Run one wrap transform through the full engine. */
function wrap(src, extra = {}, opts = {}) {
  return applyTemplateTransforms(src, {
    filePath: '/t/page.tsx',
    template: {type: 'page', id: 'x', package: CORE},
    transforms: [{package: META, transform: {wrap: {component: 'W', from: META, ...extra}}}],
    jscodeshift,
    ...opts,
  });
}

const assertParses = src =>
  expect(() => jscodeshift.withParser('tsx')(src)).not.toThrow();
const count = (src, re) => (src.match(re) ?? []).length;

describe('regression: #1 return-statement parentheses leak into JSX children', () => {
  // `return (<X/>)` marked the argument parenthesized; recast reprinted the
  // parens inside the wrapper, where they render as literal `(` `)` text.
  it('emits no parentheses around the wrapped child', () => {
    const out = edit(
      `export default function Page() {\n  return (\n    <X />\n  );\n}\n`,
      (j, root) => wrapDefaultExportReturn(j, root, [{component: 'W'}]),
    );
    expect(out).not.toContain('>(');
    expect(out).not.toContain('/>)');
    expect(out).not.toContain('(<X');
    expect(out).toMatch(/<W>\s*<X \/>\s*<\/W>/);
    assertParses(out);
  });
});

describe("regression: #2 'use client' directive dropped / double-semicolon", () => {
  // Splicing program.body made recast drop the directive; the fix then exposed
  // recast's `'use client';;` double-print, cleaned by fixDirectiveCorruption.
  it('preserves a single directive and inserts the import after it', () => {
    const out = edit(`'use client';\nexport const y = 1;\n`, (j, root) =>
      ensureImport(j, root, {from: '@m', named: ['A']}),
    );
    expect(count(out, /'use client';/g)).toBe(1);
    expect(out).not.toContain("'use client';;");
    expect(out).toMatch(/^'use client';\s*\nimport \{\s*A\s*\} from '@m';/);
    assertParses(out);
  });
});

describe('regression: #3 only the last return was wrapped', () => {
  // The original loop wrapped only direct body returns and could touch nested
  // callback returns. Now: wrap every return owned by the component; never a
  // nested callback's.
  it('wraps all early returns of the component', () => {
    const {source} = wrap(
      `export default function Page({loading}) {\n  if (loading) return <Spinner />;\n  return <Main />;\n}\n`,
    );
    expect(count(source, /<W>/g)).toBe(2);
    assertParses(source);
  });

  it('never wraps a return inside a nested callback', () => {
    const {source} = wrap(
      `export default function Page({items}) {\n  return <ul>{items.map((i) => { return <li key={i} />; })}</ul>;\n}\n`,
    );
    expect(count(source, /<W>/g)).toBe(1);
    expect(source).not.toMatch(/<W>\s*<li/);
    assertParses(source);
  });
});

describe('regression: #4 wrapper import self-collision → duplicate binding', () => {
  // The wrapper was already imported (as a default) from the same module; a
  // naive add produced a duplicate `W` binding. Now the existing local is reused.
  it('reuses an existing default import instead of duplicating the binding', () => {
    const {source, transformedBy} = wrap(
      `import W from '@xds/meta';\nexport default function Page() { return <X />; }\n`,
      {importKind: 'named'},
    );
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('<W>');
    expect(count(source, /from '@xds\/meta'/g)).toBe(1);
    assertParses(source);
  });
});

describe('regression: #6 namespace import cannot accept merged specifiers', () => {
  // `import * as Meta from 'm'` can't be combined with named/default specifiers;
  // merging into it produced invalid syntax. Now a separate import is emitted.
  it('emits a separate import rather than corrupting a namespace import', () => {
    const {source, transformedBy} = wrap(
      `import * as Meta from '@xds/meta';\nexport default function Page() { return <X />; }\n`,
    );
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('import * as Meta from');
    expect(source).toMatch(/import \{\s*W\s*\} from '@xds\/meta'/);
    assertParses(source);
  });
});

describe('regression: #5 adversarial props', () => {
  // (a) A string with both quote kinds can't be a JSX attribute string; it must
  // go through an expression container. (b) An invalid attribute name silently
  // split into two attrs — now rejected at parse and skipped in the builder.
  it('renders a quote-containing string prop via an expression container', () => {
    const {source, transformedBy} = wrap(
      `export default function Page() { return <X />; }`,
      {props: {title: `a "b" 'c'`}},
    );
    expect(transformedBy).toEqual([META]);
    expect(source).toMatch(/title=\{/);
    assertParses(source);
  });

  it('rejects an invalid prop name at the load boundary', () => {
    expect(() =>
      parseAppShell({component: 'W', from: META, props: {'bad key': 'v'}}),
    ).toThrow(/props/);
  });

  it('skips an invalid prop name in the builder without corrupting output', () => {
    const {source} = wrap(`export default function Page() { return <X />; }`, {
      props: {'bad key': 'x', good: 'y'},
    });
    expect(source).not.toContain('bad key');
    expect(source).not.toMatch(/\bbad\b/);
    expect(source).toMatch(/good='y'/);
    assertParses(source);
  });
});

describe('regression: #7 `export default Name` matched a nested same-named function', () => {
  // The declaration lookup was not scope-aware, so a `const Page` inside an
  // unrelated function satisfied `export default Page` — which here resolves to
  // an import. The engine wrapped that private helper and reported success
  // while the module's real default export went out untouched.
  it('ignores a same-named declaration that is not module-level', () => {
    const src = `import Page from './external';
function helper() {
  const Page = () => <Inner />;
  return Page;
}
export default Page;
`;
    const {source, transformedBy} = wrap(src);
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
  });

  it('still resolves a module-level declaration', () => {
    const {source, transformedBy} = wrap(
      `const Page = () => <Real />;\nexport default Page;\n`,
    );
    expect(transformedBy).toEqual([META]);
    expect(source).toMatch(/<W>\s*<Real \/>\s*<\/W>/);
    assertParses(source);
  });
});

describe('regression: #8 a wrap with no module emitted an un-imported component', () => {
  // `ensureImport` no-ops on an empty module specifier, but the wrap had already
  // been applied by then — emitting `<W>` with nothing importing W. That output
  // parses, so the validation gate had no reason to reject it. The spec is now
  // checked before anything is rewritten.
  it('leaves the source untouched when `from` is empty', () => {
    const src = `export default function Page() { return <X />; }`;
    const {source, transformedBy} = wrap(src, {from: ''});
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
  });

  it('leaves the source untouched when the component is not an identifier', () => {
    const src = `export default function Page() { return <X />; }`;
    const {source, transformedBy} = wrap(src, {component: 'W attr="x"'});
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
  });
});

describe('regression: #9 a colliding local binding produced a duplicate declaration', () => {
  // Adding `import {W} from 'm'` to a module that already declares `const W`
  // double-declares W. jscodeshift parses with error recovery, so the validation
  // gate accepted it and the broken source was emitted. Bindability is now
  // checked up front and a conflict aborts the whole transform.
  it('rolls back and warns instead of double-declaring the wrapper', () => {
    const warnings = [];
    const src = `const W = 1;\nexport default function Page() { return <X />; }`;
    const {source, transformedBy} = wrap(src, {}, {onWarn: m => warnings.push(m)});
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/already bound/);
  });

  it('still reuses a binding that comes from the same module', () => {
    const {source, transformedBy} = wrap(
      `import {W} from '@xds/meta';\nexport default function Page() { return <X />; }`,
    );
    expect(transformedBy).toEqual([META]);
    expect(count(source, /from '@xds\/meta'/g)).toBe(1);
    assertParses(source);
  });
});

describe('regression: #10 a missing template context threw out of the engine', () => {
  // `isTransformApplicable` read `template.package` before checking that a
  // context was passed at all, turning a malformed call into a crash rather
  // than a skip.
  it('skips instead of throwing when the template context is absent', () => {
    for (const template of [undefined, null]) {
      expect(() =>
        applyTemplateTransforms(`export default function P() { return <X/>; }`, {
          filePath: '/t/p.tsx',
          template,
          transforms: [
            {package: META, transform: {wrap: {component: 'W', from: META}}},
          ],
          jscodeshift,
        }),
      ).not.toThrow();
    }
  });
});
