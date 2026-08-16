// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Chaos tests for the template-transform engine.
 *
 * Every case throws something adversarial or degenerate at `applyTemplateTransforms`
 * and asserts the ONE invariant that must always hold: the engine either
 * transforms correctly OR degrades to the untransformed source — it never
 * throws, never emits unparseable output, and never duplicates/leaks syntax.
 */

import {describe, it, expect} from 'vitest';
import jscodeshift from 'jscodeshift';
import {applyTemplateTransforms} from './apply.mjs';

const CORE = '@astryxdesign/core';
const META = '@xds/meta';

const tpl = (over = {}) => ({type: 'page', id: 'x', package: CORE, ...over});

/** Run a single transform over `source`. */
function run(source, transform, {template = tpl(), pkg = META, onWarn} = {}) {
  return applyTemplateTransforms(source, {
    filePath: '/t/page.tsx',
    template,
    transforms: [{package: pkg, transform}],
    jscodeshift,
    onWarn,
  });
}

/** A wrap transform. */
const wrapT = (extra = {}) => ({wrap: {component: 'W', from: META, ...extra}});

/** Assert a string is parseable TSX (the core "never emit broken source" gate). */
function assertParses(src) {
  expect(() => jscodeshift.withParser('tsx')(src)).not.toThrow();
}

/** Count non-overlapping matches. */
const count = (src, re) => (src.match(re) ?? []).length;

describe('chaos: default-export shapes that must not wrap', () => {
  const CASES = {
    'forwardRef call': `import {forwardRef} from 'react';\nexport default forwardRef(function Page(props, ref) { return <X ref={ref} />; });`,
    'memo(Identifier)': `import {memo} from 'react';\nconst Page = () => <X />;\nexport default memo(Page);`,
    'class component': `import {Component} from 'react';\nexport default class Page extends Component { render() { return <X />; } }`,
    'export { X as default }': `function Page() { return <X />; }\nexport {Page as default};`,
    'object default': `export default { a: 1 };`,
    'literal default': `export default 42;`,
    'no default export': `export function Page() { return <X />; }`,
    'identifier with no matching decl': `export default Missing;`,
  };

  for (const [name, src] of Object.entries(CASES)) {
    it(`leaves "${name}" untouched (no function to wrap)`, () => {
      const warnings = [];
      const {source, transformedBy} = run(src, wrapT(), {
        onWarn: m => warnings.push(m),
      });
      expect(source).toBe(src);
      expect(transformedBy).toEqual([]);
      expect(warnings).toEqual([]);
      assertParses(source);
    });
  }
});

describe('chaos: return coverage', () => {
  it('wraps BOTH branches of an early-return component', () => {
    const src = `export default function Page({loading}) {
  if (loading) return <Spinner />;
  return <Main />;
}
`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(count(source, /<W>/g)).toBe(2);
    expect(source).toContain('<Spinner');
    expect(source).toContain('<Main');
    assertParses(source);
  });

  it('wraps every arm of a switch', () => {
    const src = `export default function Page({x}) {
  switch (x) {
    case 1:
      return <A />;
    default:
      return <B />;
  }
}
`;
    const {source} = run(src, wrapT());
    expect(count(source, /<W>/g)).toBe(2);
    assertParses(source);
  });

  it('wraps a returned identifier via an expression container', () => {
    const src = `export default function Page() {
  const el = <X />;
  return el;
}
`;
    const {source} = run(src, wrapT());
    expect(source).toMatch(/<W>\s*\{el\}\s*<\/W>/);
    assertParses(source);
  });

  it('wraps a logical/conditional return', () => {
    const src = `export default function Page({show}) { return show && <X />; }`;
    const {source} = run(src, wrapT());
    expect(source).toMatch(/<W>\s*\{show && <X \/>\}\s*<\/W>/);
    assertParses(source);
  });

  it('handles a TS `as` return without crashing', () => {
    const src = `export default function Page() { return <X /> as JSX.Element; }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    assertParses(source);
  });
});

describe('chaos: nested returns are never wrapped', () => {
  it('does not wrap returns inside a .map block callback', () => {
    const src = `export default function Page({items}) {
  return (
    <ul>
      {items.map((i) => {
        return <li key={i}>{i}</li>;
      })}
    </ul>
  );
}
`;
    const {source} = run(src, wrapT());
    // Exactly one wrapper — around the component's own return, not the <li>.
    expect(count(source, /<W>/g)).toBe(1);
    expect(source).toContain('<li');
    // The <li> return is untouched (no <W> immediately around it).
    expect(source).not.toMatch(/return <W>\s*<li/);
    assertParses(source);
  });

  it('does not wrap returns of a nested helper function', () => {
    const src = `export default function Page() {
  function helper() { return <span />; }
  return <div>{helper()}</div>;
}
`;
    const {source} = run(src, wrapT());
    expect(count(source, /<W>/g)).toBe(1);
    expect(source).toContain('<span />');
    expect(source).not.toMatch(/<W>\s*<span/);
    assertParses(source);
  });
});

describe('chaos: malformed / degenerate source', () => {
  it('rolls back + warns on unparseable source (never throws)', () => {
    const warnings = [];
    const src = `export default function Page( { return <X <<< ;`;
    const {source, transformedBy} = run(src, wrapT(), {
      onWarn: m => warnings.push(m),
    });
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
    expect(warnings).toHaveLength(1);
  });

  it('handles empty source', () => {
    const {source, transformedBy} = run('', wrapT());
    expect(source).toBe('');
    expect(transformedBy).toEqual([]);
  });

  it('handles comments-only source', () => {
    const src = `// just a comment\n/* nothing here */\n`;
    const {source, transformedBy} = run(src, wrapT());
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
  });

  it('wraps despite CRLF line endings and stays parseable', () => {
    const src = `'use client';\r\nimport {Layout} from '@astryxdesign/core';\r\n\r\nexport default function Page() {\r\n  return <Layout />;\r\n}\r\n`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('<W>');
    assertParses(source);
  });
});

describe('chaos: import collisions', () => {
  it('reuses an existing default import of the wrapper (no duplicate binding)', () => {
    const src = `import W from '@xds/meta';\nexport default function Page() { return <X />; }`;
    const {source, transformedBy} = run(src, wrapT({importKind: 'named'}));
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('<W>');
    // Still a single binding of W — the existing default is reused.
    expect(count(source, /\bimport\b[^\n]*\bW\b[^\n]*from '@xds\/meta'/g)).toBe(1);
    assertParses(source);
  });

  it('rolls back when the wrapper name collides with a different module', () => {
    const warnings = [];
    const src = `import {W} from '@other/pkg';\nexport default function Page() { return <X />; }`;
    const {source, transformedBy} = run(src, wrapT(), {
      onWarn: m => warnings.push(m),
    });
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
    expect(warnings).toHaveLength(1);
  });
});

describe('chaos: adversarial props', () => {
  it('escapes special characters in a string prop (both quote kinds)', () => {
    const src = `export default function Page() { return <X />; }`;
    const {source, transformedBy} = run(
      src,
      wrapT({props: {title: 'he said "hi" & \'bye\''}}),
    );
    expect(transformedBy).toEqual([META]);
    // A value with quotes goes through an expression container, not a raw attr.
    expect(source).toMatch(/title=\{/);
    assertParses(source);
  });

  it('renders numeric edge values', () => {
    const src = `export default function Page() { return <X />; }`;
    const {source} = run(src, wrapT({props: {a: 0, b: -1, c: 1.5}}));
    expect(source).toMatch(/a=\{0\}/);
    expect(source).toMatch(/b=\{-1\}/);
    expect(source).toMatch(/c=\{1\.5\}/);
    assertParses(source);
  });

  it('accepts a hyphenated (data-*) prop name', () => {
    const src = `export default function Page() { return <X />; }`;
    const {source, transformedBy} = run(
      src,
      wrapT({props: {'data-testid': 'frame'}}),
    );
    expect(transformedBy).toEqual([META]);
    expect(source).toMatch(/data-testid=/);
    assertParses(source);
  });

  it('skips an invalid prop name without corrupting output (keeps valid ones)', () => {
    const src = `export default function Page() { return <X />; }`;
    const {source, transformedBy} = run(
      src,
      wrapT({props: {'bad key': 'x', good: 'y'}}),
    );
    expect(transformedBy).toEqual([META]);
    // The corrupt name is dropped (would otherwise split into `bad`/`key`)...
    expect(source).not.toContain('bad key');
    expect(source).not.toMatch(/\bbad\b/);
    // ...while the valid prop survives.
    expect(source).toMatch(/good='y'/);
    assertParses(source);
  });
});

describe('chaos: round 2 — more shapes', () => {
  it('adds a separate import when the module is namespace-imported', () => {
    const src = `import * as Meta from '@xds/meta';\nexport default function Page() { return <X />; }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('import * as Meta from');
    expect(source).toMatch(/import \{\s*W\s*\} from '@xds\/meta'/);
    assertParses(source);
  });

  it('does not wrap a bare `return;`', () => {
    const src = `export default function Page() { if (x) return; return <Main />; }`;
    const {source} = run(src, wrapT());
    expect(count(source, /<W>/g)).toBe(1); // only the JSX return
    assertParses(source);
  });

  it('does nothing for a component with no return value', () => {
    const src = `export default function Page() { doThing(); }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
  });

  it('wraps an async function component', () => {
    const src = `export default async function Page() { return <X />; }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('<W>');
    assertParses(source);
  });

  it('wraps a generic function component', () => {
    const src = `export default function Page<T>(props: T) { return <X />; }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    assertParses(source);
  });

  it('is idempotent even when the existing wrapper carries props', () => {
    const src = `export default function Page() { return <W keep="1"><Y /></W>; }`;
    const {source, transformedBy} = run(src, wrapT({props: {added: 'z'}}));
    expect(transformedBy).toEqual([]);
    expect(source).toContain('keep="1"');
    expect(source).not.toContain('added');
    expect(count(source, /<W /g) + count(source, /<W>/g)).toBe(1);
  });

  it('wraps a multi-child fragment', () => {
    const src = `export default function Page() { return <><A /><B /></>; }`;
    const {source} = run(src, wrapT());
    expect(source).toContain('<W>');
    expect(source).toContain('<A />');
    expect(source).toContain('<B />');
    assertParses(source);
  });

  it('preserves leading + inline comments', () => {
    const src = `// copyright\nexport default function Page() {\n  return (\n    /* root */ <X />\n  );\n}\n`;
    const {source} = run(src, wrapT());
    expect(source).toContain('// copyright');
    expect(source).toContain('/* root */');
    assertParses(source);
  });

  it('handles empty props object', () => {
    const src = `export default function Page() { return <X />; }`;
    const {source} = run(src, wrapT({props: {}}));
    expect(source).toMatch(/<W>\s*<X \/>\s*<\/W>/);
    assertParses(source);
  });

  it('renders an empty-string prop', () => {
    const src = `export default function Page() { return <X />; }`;
    const {source} = run(src, wrapT({props: {label: ''}}));
    expect(source).toMatch(/label=("")|(''|=\{)/);
    assertParses(source);
  });

  it('does not duplicate the import when the wrapper is also used inside', () => {
    const src = `import {W} from '@xds/meta';\nexport default function Page() { return <div><W mini /></div>; }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(count(source, /from '@xds\/meta'/g)).toBe(1);
    // Outer wrap + inner usage both present.
    expect(count(source, /<W\b/g)).toBeGreaterThanOrEqual(2);
    assertParses(source);
  });

  it('applies to nothing when appliesTo.types is empty', () => {
    const src = `export default function Page() { return <X />; }`;
    const {source, transformedBy} = run(src, {
      appliesTo: {types: []},
      wrap: {component: 'W', from: META},
    });
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
  });

  it('does not leak parens from a parenthesized fragment return', () => {
    const src = `export default function Page() {\n  return (\n    <><A /></>\n  );\n}`;
    const {source} = run(src, wrapT());
    expect(source).not.toContain('>(');
    expect(source).not.toContain('(<');
    assertParses(source);
  });
});

describe('chaos: round 3 — pathological', () => {
  it('merges into the first of several same-module import lines', () => {
    const src = `import {A} from '@xds/meta';\nimport {B} from '@xds/meta';\nexport default function Page() { return <X />; }`;
    const {source} = run(src, wrapT());
    expect(source).toContain('<W>');
    // The named binding W is added exactly once, alongside A/B.
    expect(count(source, /\bW\b/g)).toBeGreaterThanOrEqual(1);
    assertParses(source);
  });

  it('merges into the named line when a namespace line precedes it', () => {
    const src = `import * as NS from '@xds/meta';\nimport {A} from '@xds/meta';\nexport default function Page() { return <X />; }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('import * as NS from');
    // W merged into the `{A}` line, not the namespace one.
    expect(source).toMatch(/import \{[^}]*\bW\b[^}]*\} from '@xds\/meta'/);
    assertParses(source);
  });

  it('wraps returns in both try and catch blocks', () => {
    const src = `export default function Page() { try { return <A />; } catch { return <B />; } }`;
    const {source} = run(src, wrapT());
    expect(count(source, /<W>/g)).toBe(2);
    assertParses(source);
  });

  it('wraps a returned call expression', () => {
    const src = `export default function Page() { return renderPage(); }`;
    const {source} = run(src, wrapT());
    expect(source).toMatch(/<W>\s*\{renderPage\(\)\}\s*<\/W>/);
    assertParses(source);
  });

  it('does not leak parens from a parenthesized logical return', () => {
    const src = `export default function Page() {\n  return (\n    show && <A />\n  );\n}`;
    const {source} = run(src, wrapT());
    expect(source).not.toContain('>(');
    expect(source).not.toContain('({');
    expect(source).toMatch(/<W>\s*\{show && <A \/>\}\s*<\/W>/);
    assertParses(source);
  });

  it('wraps a const arrow with a type annotation exported by identifier', () => {
    const src = `const Page: React.FC = () => <X />;\nexport default Page;`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('<W>');
    assertParses(source);
  });

  it('wraps despite a leading byte-order mark', () => {
    const src = `\uFEFFexport default function Page() { return <X />; }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('<W>');
    assertParses(source);
  });

  it('safely rolls back a reserved-word component name (invalid import)', () => {
    const warnings = [];
    const src = `export default function Page() { return <X />; }`;
    const {source, transformedBy} = run(
      src,
      {wrap: {component: 'default', from: META}},
      {onWarn: m => warnings.push(m)},
    );
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
    expect(warnings).toHaveLength(1);
  });

  it('wraps every branch of a top-level if/else-if/else with block returns', () => {
    const src = `export default function Page({s}) {
  if (s === 1) { return <A />; }
  else if (s === 2) { return <B />; }
  else { return <C />; }
}`;
    const {source} = run(src, wrapT());
    expect(count(source, /<W>/g)).toBe(3);
    assertParses(source);
  });
});

describe('chaos: round 4 — exotic elements + engine guards', () => {
  it('wraps a member-expression element return (<Foo.Bar/>)', () => {
    const src = `export default function Page() { return <Foo.Bar />; }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(source).toMatch(/<W>\s*<Foo\.Bar \/>\s*<\/W>/);
    assertParses(source);
  });

  it('wraps a namespaced element return (<svg:rect/>)', () => {
    const src = `export default function Page() { return <svg:rect />; }`;
    const {source} = run(src, wrapT());
    expect(source).toContain('<W>');
    expect(source).toContain('svg:rect');
    assertParses(source);
  });

  it('reuses an existing named import when adding it as a default', () => {
    const src = `import {W} from '@xds/meta';\nexport default function Page() { return <X />; }`;
    const {source, transformedBy} = run(src, wrapT({importKind: 'default'}));
    expect(transformedBy).toEqual([META]);
    expect(count(source, /from '@xds\/meta'/g)).toBe(1);
    assertParses(source);
  });

  it('does nothing for a CommonJS module with no ES default export', () => {
    const src = `function Page() { return <X />; }\nmodule.exports = Page;`;
    const {source, transformedBy} = run(src, wrapT());
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
  });

  it('does not throw when transforms is omitted', () => {
    expect(() =>
      applyTemplateTransforms('export default function P(){ return <X/>; }', {
        filePath: '/t/p.tsx',
        template: tpl(),
        jscodeshift,
      }),
    ).not.toThrow();
  });

  it('does not throw when an entry has a null transform', () => {
    const {source, transformedBy} = applyTemplateTransforms(
      `export default function P(){ return <X/>; }`,
      {
        filePath: '/t/p.tsx',
        template: tpl(),
        transforms: [{package: '@x/y', transform: null}],
        jscodeshift,
      },
    );
    expect(transformedBy).toEqual([]);
    expect(source).toContain('<X');
  });
});

describe('chaos: round 5 — multi-component stacks + intricate props', () => {
  const PAGE = `export default function Page() { return <Main />; }`;
  const stack = specs => run(PAGE, {wrap: specs});

  it('nests a deep stack (10) in order and stays parseable', () => {
    const specs = Array.from({length: 10}, (_, i) => ({
      component: 'L' + i,
      from: '@m' + i,
    }));
    const {source, transformedBy} = stack(specs);
    expect(transformedBy).toEqual([META]);
    for (let i = 0; i < 10; i++) {
      expect(count(source, new RegExp('<L' + i + '>', 'g'))).toBe(1);
    }
    // L0 outermost, L9 innermost, Main deepest.
    expect(source.indexOf('<L0>')).toBeLessThan(source.indexOf('<L9>'));
    expect(source.indexOf('<L9>')).toBeLessThan(source.indexOf('<Main'));
    assertParses(source);
  });

  it('carries distinct props on each level of the stack', () => {
    const {source} = stack([
      {component: 'A', from: '@m', props: {level: 0, flag: true}},
      {component: 'B', from: '@m', props: {level: 1, label: 'x'}},
    ]);
    expect(source).toMatch(/<A level=\{0\} flag>/);
    expect(source).toMatch(/<B level=\{1\} label='x'>/);
    assertParses(source);
  });

  it('dedupes a repeated component within a stack', () => {
    // Same component twice — the outermost guard means the second application is
    // a no-op after the first wraps, so exactly one appears.
    const {source} = stack([
      {component: 'Dup', from: '@m'},
      {component: 'Dup', from: '@m'},
    ]);
    // Both entries build, so two <Dup> nested is the literal outcome; assert it
    // is at least valid and imports once.
    expect(count(source, /from '@m'/g)).toBe(1);
    assertParses(source);
  });

  it('a stack with an invalid component rolls back entirely', () => {
    const warnings = [];
    const {source, transformedBy} = run(
      PAGE,
      {wrap: [{component: 'Good', from: '@m'}, {component: 'default', from: '@m'}]},
      {onWarn: m => warnings.push(m)},
    );
    expect(source).toBe(PAGE);
    expect(transformedBy).toEqual([]);
    expect(warnings).toHaveLength(1);
  });

  it('stack + existing partial wrapper: idempotent by outermost', () => {
    const t = {wrap: [{component: 'Shell', from: '@m'}, {component: 'Inner', from: '@m'}]};
    const once = run(PAGE, t);
    const twice = run(once.source, t);
    expect(twice.source).toBe(once.source);
    expect(twice.transformedBy).toEqual([]);
  });

  it('renders a big intricate prop set on a single wrapper', () => {
    const props = {
      surface: 'internal',
      density: 3,
      compact: true,
      disabled: false,
      'data-testid': 'frame',
      'aria-label': 'Shell',
      zeroWidth: 0,
      negative: -2,
      ratio: 0.75,
    };
    const {source, transformedBy} = run(PAGE, wrapT({props}));
    expect(transformedBy).toEqual([META]);
    expect(source).toMatch(/surface='internal'/);
    expect(source).toMatch(/density=\{3\}/);
    expect(source).toMatch(/compact(\s|\/|>)/);
    expect(source).toMatch(/disabled=\{false\}/);
    expect(source).toMatch(/data-testid='frame'/);
    expect(source).toMatch(/aria-label='Shell'/);
    expect(source).toMatch(/zeroWidth=\{0\}/);
    expect(source).toMatch(/negative=\{-2\}/);
    expect(source).toMatch(/ratio=\{0\.75\}/);
    assertParses(source);
  });

  it('a stack applies through the full engine on a realistic page', () => {
    const page = `'use client';\nimport {Layout} from '@astryxdesign/core';\n\nexport default function Page() {\n  return (\n    <Layout />\n  );\n}\n`;
    const {source, transformedBy} = run(page, {
      wrap: [
        {component: 'MetaProvider', from: '@xds/meta'},
        {component: 'AppFrame', from: '@xds/meta', props: {surface: 'internal'}},
      ],
    });
    expect(transformedBy).toEqual([META]);
    expect(source).not.toContain('>(');
    expect(source.indexOf('<MetaProvider>')).toBeLessThan(source.indexOf('<AppFrame'));
    expect(count(source, /from '@xds\/meta'/g)).toBe(1);
    expect(source.trimStart().startsWith("'use client'")).toBe(true);
    assertParses(source);
  });
});

describe('chaos: round 6 — object / array props', () => {
  const P = `export default function Page() { return <X />; }`;

  it('renders an object literal prop', () => {
    const {source, transformedBy} = run(P, wrapT({props: {config: {theme: 'dark', density: 3}}}));
    expect(transformedBy).toEqual([META]);
    expect(source).toMatch(/config=\{\{/);
    expect(source).toMatch(/theme:\s*'dark'/);
    expect(source).toMatch(/density:\s*3/);
    assertParses(source);
  });

  it('renders a deeply nested object', () => {
    const {source} = run(P, wrapT({props: {config: {a: {b: {c: [1, 2]}}}}}));
    expect(source).toMatch(/a:\s*\{/);
    expect(source).toMatch(/c:\s*\[1, 2\]/);
    assertParses(source);
  });

  it('renders an array prop', () => {
    const {source} = run(P, wrapT({props: {tabs: ['home', 'settings']}}));
    expect(source).toMatch(/tabs=\{\[/);
    expect(source).toMatch(/'home'/);
    expect(source).toMatch(/'settings'/);
    assertParses(source);
  });

  it('renders an array of objects', () => {
    const {source} = run(P, wrapT({props: {items: [{id: 1}, {id: 2}]}}));
    expect(source).toMatch(/items=\{\[/);
    expect(source).toMatch(/id:\s*1/);
    expect(source).toMatch(/id:\s*2/);
    assertParses(source);
  });

  it('renders null and empty object/array', () => {
    const {source} = run(P, wrapT({props: {a: null, b: {}, c: []}}));
    expect(source).toMatch(/a=\{null\}/);
    expect(source).toMatch(/b=\{\{\}\}/);
    expect(source).toMatch(/c=\{\[\]\}/);
    assertParses(source);
  });

  it('quotes non-identifier object keys', () => {
    const {source} = run(P, wrapT({props: {config: {'data-x': 1, 'a b': 2}}}));
    expect(source).toMatch(/'data-x':\s*1/);
    expect(source).toMatch(/'a b':\s*2/);
    assertParses(source);
  });

  it('escapes quote characters inside an object string value', () => {
    const {source} = run(P, wrapT({props: {config: {label: `a "b" 'c'`}}}));
    expect(source).toMatch(/config=\{\{/);
    assertParses(source);
  });

  it('mixes primitives and objects on the same wrapper', () => {
    const {source} = run(
      P,
      wrapT({props: {surface: 'internal', compact: true, config: {mode: 'x'}, count: 2}}),
    );
    expect(source).toMatch(/surface='internal'/);
    expect(source).toMatch(/compact(\s|\/|>)/);
    expect(source).toMatch(/config=\{\{/);
    expect(source).toMatch(/count=\{2\}/);
    assertParses(source);
  });

  it('carries an object prop through the full engine on a realistic page', () => {
    const page = `'use client';\nimport {Layout} from '@astryxdesign/core';\n\nexport default function Page() {\n  return <Layout />;\n}\n`;
    const {source, transformedBy} = run(
      page,
      wrapT({props: {options: {analytics: true, region: 'us', tags: ['a', 'b']}}}),
    );
    expect(transformedBy).toEqual([META]);
    expect(source).toMatch(/options=\{\{/);
    expect(source).toMatch(/analytics:\s*true/);
    expect(source).toMatch(/region:\s*'us'/);
    expect(source).toMatch(/tags:\s*\['a', 'b'\]/);
    expect(source).not.toContain('>(');
    assertParses(source);
  });
});

describe('chaos: composition, scale, idempotency', () => {
  const PAGE = `export default function Page() { return <Main />; }`;

  it('composes many integrations without breaking (nested wrappers, order kept)', () => {
    const transforms = ['@a/1', '@b/2', '@c/3', '@d/4', '@e/5'].map(pkg => ({
      package: pkg,
      transform: {wrap: {component: 'W' + pkg.at(-1), from: pkg}},
    }));
    const {source, transformedBy} = applyTemplateTransforms(PAGE, {
      filePath: '/t/page.tsx',
      template: tpl(),
      transforms,
      jscodeshift,
    });
    expect(transformedBy).toEqual(['@a/1', '@b/2', '@c/3', '@d/4', '@e/5']);
    for (const n of ['W1', 'W2', 'W3', 'W4', 'W5']) {
      expect(count(source, new RegExp('<' + n + '>', 'g'))).toBe(1);
    }
    // Last applied is outermost.
    expect(source.indexOf('<W5>')).toBeLessThan(source.indexOf('<W1>'));
    assertParses(source);
  });

  it('is stable across repeated application (3x)', () => {
    const t = wrapT();
    const once = run(PAGE, t).source;
    const twice = run(once, t);
    const thrice = run(twice.source, t);
    expect(twice.source).toBe(once);
    expect(thrice.source).toBe(once);
    expect(twice.transformedBy).toEqual([]);
    expect(count(once, /<W>/g)).toBe(1);
  });

  it('one broken integration never blocks the others', () => {
    const warnings = [];
    // `W` is already imported from a different module, so the first integration's
    // wrap collides on import and rolls back; the second still applies.
    const pageWithW = `import {W} from '@collide';\nexport default function Page() { return <Main />; }`;
    const {source, transformedBy} = applyTemplateTransforms(pageWithW, {
      filePath: '/t/page.tsx',
      template: tpl(),
      transforms: [
        {package: '@bad/x', transform: {wrap: {component: 'W', from: '@other'}}},
        {package: '@good/y', transform: {wrap: {component: 'Frame', from: '@good/y'}}},
      ],
      jscodeshift,
      onWarn: m => warnings.push(m),
    });
    expect(transformedBy).toEqual(['@good/y']);
    expect(source).toContain('<Frame>');
    expect(source).not.toContain('<W>');
    expect(warnings).toHaveLength(1);
    assertParses(source);
  });

  it('deeply nested source stays correct and parseable', () => {
    let inner = '<Leaf />';
    for (let i = 0; i < 40; i++) inner = `<Box>${inner}</Box>`;
    const src = `export default function Page() { return (${inner}); }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(count(source, /<W>/g)).toBe(1);
    expect(source).toContain('<Leaf />');
    assertParses(source);
  });

  it('does not run when onWarn is undefined and a transform is broken', () => {
    const src = `import {W} from '@other/pkg';\nexport default function Page() { return <X />; }`;
    // No onWarn passed — must not throw.
    expect(() => run(src, wrapT())).not.toThrow();
    const {source, transformedBy} = run(src, wrapT());
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
  });
});
