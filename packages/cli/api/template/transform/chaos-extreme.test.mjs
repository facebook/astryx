// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Chaos tests, tier 2 — the hostile ones.
 *
 * `chaos.test.mjs` covers degenerate but plausible inputs. This file assumes an
 * ACTIVELY hostile author: injection payloads in component names, transforms
 * that violate the engine's own contract, sources built to confuse scope
 * resolution, and inputs sized to break the parser. Two invariants are asserted
 * throughout:
 *
 *   1. SAFETY — the engine either emits valid TSX or returns the input
 *      untouched. It never throws and never emits broken source.
 *   2. HONESTY — if a wrapper appears in the output, it is imported, it is the
 *      component the author asked for, and it wraps the module's real default
 *      export (not some same-named function hiding in a nested scope).
 *
 * @position api/template/transform — adversarial counterpart to chaos.test.mjs.
 */

import {describe, it, expect} from 'vitest';
import jscodeshift from 'jscodeshift';
import {applyTemplateTransforms, isTransformApplicable} from './apply.mjs';
import {parseAppShell} from '../../../authoring/app-shell/parse.mjs';

const CORE = '@astryxdesign/core';
const META = '@xds/meta';

const tpl = (over = {}) => ({type: 'page', id: 'x', package: CORE, ...over});

const PAGE = `export default function Page() { return <X />; }`;

/** Run a single transform over `source`. */
function run(
  source,
  transform,
  {template = tpl(), pkg = META, onWarn, js = jscodeshift} = {},
) {
  return applyTemplateTransforms(source, {
    filePath: '/t/page.tsx',
    template,
    transforms: [{package: pkg, transform}],
    jscodeshift: js,
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

/**
 * Invariant 1 (SAFETY): either the source is untouched (and nothing was
 * reported as applied) or it is valid TSX.
 */
function assertSafe(result, original) {
  if (result.source === original) {
    expect(result.transformedBy).toEqual([]);
    return;
  }
  assertParses(result.source);
}

/**
 * Invariant 2 (HONESTY): a wrapper element that appears in the output must have
 * a binding — a wrap can never emit a component the module doesn't import.
 */
function assertWrapperBound(source, name) {
  const used = new RegExp(`<${name}[\\s>/]`).test(source);
  if (!used) return;
  expect(source).toMatch(new RegExp(`import[^\\n]*\\b${name}\\b[^\\n]*from`));
}

describe('hostile: default-export identifier resolution', () => {
  it('does not wrap a same-named function hiding in a nested scope', () => {
    // `export default Page` resolves to the IMPORTED Page. A `const Page` inside
    // an unrelated function is not the module's default export and must not be
    // rewritten (doing so silently wraps the wrong component while reporting
    // success).
    const src = `import Page from './external';
function helper() {
  const Page = () => <Inner />;
  return Page;
}
export default Page;
`;
    const res = run(src, wrapT());
    expect(res.source).toBe(src);
    expect(res.transformedBy).toEqual([]);
  });

  it('does not wrap a same-named declarator from a nested block scope', () => {
    const src = `import Page from './external';
function setup() {
  {
    const Page = () => <Inner />;
    use(Page);
  }
}
export default Page;
`;
    const res = run(src, wrapT());
    expect(res.source).toBe(src);
    expect(res.transformedBy).toEqual([]);
  });

  it('still wraps the real module-level component when a decoy shares its name', () => {
    const src = `function helper() { const Page = () => <Decoy />; return Page; }
function Page() { return <Real />; }
export default Page;
`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(source).toMatch(/<W>\s*<Real \/>\s*<\/W>/);
    expect(source).not.toMatch(/<W>\s*<Decoy/);
    assertParses(source);
  });

  it('does not wrap when the default export is an imported binding', () => {
    const src = `import Page from './external';\nexport default Page;`;
    const res = run(src, wrapT());
    expect(res.source).toBe(src);
    expect(res.transformedBy).toEqual([]);
  });

  it('does not wrap a same-named class method', () => {
    const src = `import Page from './external';
class Screen {
  Page() { return <Inner />; }
}
export default Page;
`;
    const res = run(src, wrapT());
    expect(res.source).toBe(src);
    expect(res.transformedBy).toEqual([]);
  });
});

describe('hostile: the wrap-implies-import invariant', () => {
  it('does not wrap when `from` is empty (would emit an un-imported component)', () => {
    const res = run(PAGE, {wrap: {component: 'W', from: ''}});
    expect(res.source).toBe(PAGE);
    expect(res.transformedBy).toEqual([]);
  });

  it('does not wrap when `component` is empty', () => {
    const res = run(PAGE, {wrap: {component: '', from: META}});
    expect(res.source).toBe(PAGE);
    expect(res.transformedBy).toEqual([]);
  });

  it('does not wrap when `from` is missing entirely', () => {
    const res = run(PAGE, {wrap: {component: 'W'}});
    expect(res.source).toBe(PAGE);
    expect(res.transformedBy).toEqual([]);
  });

  it('does not partially apply a stack when one entry has no module', () => {
    // Either the whole stack lands (both imported) or nothing does — never a
    // half-wrapped page with a dangling component.
    const res = run(PAGE, {
      wrap: [
        {component: 'Outer', from: META},
        {component: 'Inner', from: ''},
      ],
    });
    assertSafe(res, PAGE);
    assertWrapperBound(res.source, 'Outer');
    assertWrapperBound(res.source, 'Inner');
  });

  it('binds the wrapper in every successful single wrap', () => {
    const {source} = run(PAGE, wrapT());
    assertWrapperBound(source, 'W');
    assertParses(source);
  });
});

describe('hostile: component-name injection', () => {
  // The parser rejects all of these at author time; the engine is the backstop
  // for direct callers, so it must never turn one into emitted syntax.
  const PAYLOADS = [
    'W attr="x"',
    'W onClick={boom()}',
    'W>',
    'W/>',
    'W<X',
    'W;',
    'W ',
    ' W',
    'W-X',
    '1Bad',
    'W.X',
    'default',
    'W\n',
    '<script>',
    '{}',
  ];

  for (const component of PAYLOADS) {
    it(`never emits injected syntax for ${JSON.stringify(component)}`, () => {
      const warnings = [];
      const res = run(
        PAGE,
        {wrap: {component, from: META}},
        {onWarn: m => warnings.push(m)},
      );
      assertSafe(res, PAGE);
      expect(res.source).not.toContain('onClick={boom()}');
      expect(res.source).not.toContain('attr="x"');
      expect(res.source).not.toContain('<script>');
    });
  }

  it('treats an injected module specifier as data, not syntax', () => {
    const res = run(PAGE, {
      wrap: {component: 'W', from: `x'; import evil from 'evil`},
    });
    assertSafe(res, PAGE);
    // The payload may survive as an (escaped) string literal — what matters is
    // that it never becomes a second import statement or a new binding.
    const bindings = jscodeshift
      .withParser('tsx')(res.source)
      .find(jscodeshift.ImportDeclaration)
      .paths()
      .flatMap(p => (p.node.specifiers ?? []).map(s => s.local?.name));
    expect(bindings).not.toContain('evil');
  });
});

describe('hostile: binding collisions roll back cleanly', () => {
  const CASES = {
    'a local const': `const W = 1;\n${PAGE}`,
    'a local function': `function W() {}\n${PAGE}`,
    'a local class': `class W {}\n${PAGE}`,
    'a local let': `let W;\n${PAGE}`,
    'an import from another module': `import {W} from '@other';\n${PAGE}`,
    'a type-only import': `import type {W} from '@other';\n${PAGE}`,
  };

  for (const [what, src] of Object.entries(CASES)) {
    it(`rolls back when the wrapper collides with ${what}`, () => {
      const warnings = [];
      const res = run(src, wrapT(), {onWarn: m => warnings.push(m)});
      assertSafe(res, src);
      // Whatever it decided, it must never double-declare the binding.
      expect(count(res.source, /^(import|const|let|class|function)\b[^\n]*\bW\b/gm))
        .toBeLessThanOrEqual(1);
    });
  }

  it('rolls back when the wrapper name is the component function name', () => {
    const warnings = [];
    const res = run(
      PAGE,
      {wrap: {component: 'Page', from: META}},
      {onWarn: m => warnings.push(m)},
    );
    expect(res.source).toBe(PAGE);
    expect(res.transformedBy).toEqual([]);
    expect(warnings).toHaveLength(1);
  });
});

describe('hostile: malformed engine input', () => {
  it('never throws on a missing template context', () => {
    expect(() =>
      applyTemplateTransforms(PAGE, {
        filePath: '/t/page.tsx',
        template: undefined,
        transforms: [{package: META, transform: wrapT()}],
        jscodeshift,
      }),
    ).not.toThrow();
  });

  it('never throws on a null template context', () => {
    expect(() =>
      applyTemplateTransforms(PAGE, {
        filePath: '/t/page.tsx',
        template: null,
        transforms: [{package: META, transform: wrapT()}],
        jscodeshift,
      }),
    ).not.toThrow();
  });

  it('treats a template with no fields as non-matching', () => {
    expect(isTransformApplicable({package: META, transform: wrapT()}, {})).toBe(
      false,
    );
  });

  const GARBAGE = {
    'number wrap': 42,
    'string wrap': 'W',
    'boolean wrap': true,
    'empty array wrap': [],
    'array of nulls': [null],
    'object without component': [{from: META}],
    'nested array': [[{component: 'W', from: META}]],
  };

  for (const [what, wrap] of Object.entries(GARBAGE)) {
    it(`never throws on ${what}`, () => {
      const warnings = [];
      let res;
      expect(() => {
        res = run(PAGE, {wrap}, {onWarn: m => warnings.push(m)});
      }).not.toThrow();
      assertSafe(res, PAGE);
    });
  }

  it('warns instead of throwing when jscodeshift itself explodes', () => {
    const warnings = [];
    const exploding = {
      withParser() {
        throw new Error('boom');
      },
    };
    const res = run(PAGE, wrapT(), {js: exploding, onWarn: m => warnings.push(m)});
    expect(res.source).toBe(PAGE);
    expect(res.transformedBy).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('boom');
  });

  it('does not mutate the transform object it is handed', () => {
    const transform = {
      description: 'shell',
      wrap: {component: 'W', from: META, props: {surface: 'internal'}},
    };
    const snapshot = JSON.parse(JSON.stringify(transform));
    run(PAGE, transform);
    expect(transform).toEqual(snapshot);
  });

  it('works with a deeply frozen transform', () => {
    const deepFreeze = o => {
      Object.values(o).forEach(v => {
        if (v && typeof v === 'object') deepFreeze(v);
      });
      return Object.freeze(o);
    };
    const transform = deepFreeze({
      wrap: [
        {component: 'A', from: META, props: {config: {mode: 'x'}}},
        {component: 'B', from: META},
      ],
    });
    let res;
    expect(() => {
      res = run(PAGE, transform);
    }).not.toThrow();
    expect(res.transformedBy).toEqual([META]);
    assertParses(res.source);
  });
});

describe('hostile: shared state and isolation', () => {
  it('gives identical results for the same input across 50 runs', () => {
    const transform = wrapT({props: {surface: 'internal'}});
    const first = run(PAGE, transform).source;
    for (let i = 0; i < 50; i++) {
      expect(run(PAGE, transform).source).toBe(first);
    }
  });

  it('keeps 50 different sources independent under one shared transform', () => {
    const transform = wrapT();
    const sources = Array.from(
      {length: 50},
      (_, i) => `export default function Page() { return <C${i} />; }`,
    );
    const outputs = sources.map(s => run(s, transform).source);
    outputs.forEach((out, i) => {
      expect(out).toContain(`<C${i} />`);
      // No leakage from any other source in the batch.
      expect(count(out, /<C\d+ \/>/g)).toBe(1);
      assertParses(out);
    });
  });
});

describe('hostile: scale', () => {
  it('survives 1000 levels of JSX nesting', () => {
    let inner = '<Leaf />';
    for (let i = 0; i < 1000; i++) inner = `<Box>${inner}</Box>`;
    const src = `export default function Page() { return (${inner}); }`;
    let res;
    expect(() => {
      res = run(src, wrapT());
    }).not.toThrow();
    assertSafe(res, src);
  }, 60000);

  it('wraps 300 early returns', () => {
    const branches = Array.from(
      {length: 300},
      (_, i) => `  if (s === ${i}) return <B${i} />;`,
    ).join('\n');
    const src = `export default function Page({s}) {\n${branches}\n  return <Last />;\n}`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(count(source, /<W>/g)).toBe(301);
    assertParses(source);
  }, 60000);

  it('renders 300 props on one wrapper', () => {
    const props = {};
    for (let i = 0; i < 300; i++) props['p' + i] = i;
    const {source, transformedBy} = run(PAGE, wrapT({props}));
    expect(transformedBy).toEqual([META]);
    expect(source).toMatch(/p299=\{299\}/);
    assertParses(source);
  }, 60000);

  it('carries a 500KB string prop', () => {
    const huge = 'a'.repeat(500_000);
    const {source, transformedBy} = run(PAGE, wrapT({props: {blob: huge}}));
    expect(transformedBy).toEqual([META]);
    expect(source).toContain(huge);
    assertParses(source);
  }, 60000);

  it('survives a 5000-deep prop object', () => {
    let value = {leaf: true};
    for (let i = 0; i < 5000; i++) value = {n: value};
    let res;
    expect(() => {
      res = run(PAGE, wrapT({props: {deep: value}}));
    }).not.toThrow();
    assertSafe(res, PAGE);
  }, 60000);

  it('composes 100 integrations into one page', () => {
    const transforms = Array.from({length: 100}, (_, i) => ({
      package: `@p${i}/x`,
      transform: {wrap: {component: `W${i}`, from: `@p${i}/x`}},
    }));
    const {source, transformedBy} = applyTemplateTransforms(PAGE, {
      filePath: '/t/page.tsx',
      template: tpl(),
      transforms,
      jscodeshift,
    });
    expect(transformedBy).toHaveLength(100);
    // Last applied is outermost.
    expect(source.indexOf('<W99>')).toBeLessThan(source.indexOf('<W0>'));
    assertParses(source);
  }, 60000);
});

describe('hostile: text fidelity', () => {
  it('preserves emoji, CJK, RTL and zero-width characters in JSX text', () => {
    const text = 'Hello 👋🏽 世界 مرحبا \u200bzero\u200dwidth';
    const src = `export default function Page() { return <p>${text}</p>; }`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    expect(source).toContain(text);
    assertParses(source);
  });

  it('preserves HTML entities in JSX text', () => {
    const src = `export default function Page() { return <p>a&nbsp;b&amp;c</p>; }`;
    const {source} = run(src, wrapT());
    expect(source).toContain('a&nbsp;b&amp;c');
    assertParses(source);
  });

  it('preserves a unicode string prop value', () => {
    const {source} = run(PAGE, wrapT({props: {label: '日本語 🎌 rtl:مرحبا'}}));
    expect(source).toContain('日本語 🎌 rtl:مرحبا');
    assertParses(source);
  });

  it('handles a source with no trailing newline and tab indentation', () => {
    const src = `export default function Page() {\n\treturn <X />;\n}`;
    const {source, transformedBy} = run(src, wrapT());
    expect(transformedBy).toEqual([META]);
    assertParses(source);
  });

  it('keeps the directive prologue first when there are no imports', () => {
    const src = `'use client';\n\n${PAGE}`;
    const {source} = run(src, wrapT());
    expect(source.trimStart().startsWith("'use client'")).toBe(true);
    assertParses(source);
  });

  it('handles two stacked directives', () => {
    const src = `'use client';\n'use strict';\n${PAGE}`;
    const {source} = run(src, wrapT());
    expect(source.trimStart().startsWith("'use client'")).toBe(true);
    assertParses(source);
  });

  it('handles a comment between the directive and the code', () => {
    const src = `'use client';\n// setup\n${PAGE}`;
    const {source} = run(src, wrapT());
    expect(source).toContain('// setup');
    assertParses(source);
  });
});

describe('hostile: appliesTo scoping edges', () => {
  const entry = appliesTo => ({
    package: META,
    transform: {appliesTo, wrap: {component: 'W', from: META}},
  });

  it('treats an empty packages array as matching nothing', () => {
    expect(isTransformApplicable(entry({packages: []}), tpl())).toBe(false);
  });

  it('treats an empty include array as matching nothing', () => {
    expect(isTransformApplicable(entry({include: []}), tpl())).toBe(false);
  });

  it('treats an empty exclude array as matching everything', () => {
    expect(isTransformApplicable(entry({exclude: []}), tpl())).toBe(true);
  });

  it('lets exclude beat include', () => {
    const e = entry({include: ['*'], exclude: ['x']});
    expect(isTransformApplicable(e, tpl({id: 'x'}))).toBe(false);
    expect(isTransformApplicable(e, tpl({id: 'y'}))).toBe(true);
  });

  it('escapes regex metacharacters in globs', () => {
    const e = entry({include: ['a.b']});
    expect(isTransformApplicable(e, tpl({id: 'a.b'}))).toBe(true);
    // `.` must not behave as a wildcard.
    expect(isTransformApplicable(e, tpl({id: 'axb'}))).toBe(false);
  });

  it('does not let a glob anchor loosely', () => {
    const e = entry({include: ['login']});
    expect(isTransformApplicable(e, tpl({id: 'login-v2'}))).toBe(false);
    expect(isTransformApplicable(e, tpl({id: 'admin/login'}))).toBe(false);
  });

  it('matches ids containing slashes with a wildcard', () => {
    const e = entry({include: ['marketing/*']});
    expect(isTransformApplicable(e, tpl({id: 'marketing/pricing'}))).toBe(true);
    expect(isTransformApplicable(e, tpl({id: 'admin/pricing'}))).toBe(false);
  });

  it('never applies to the owner package, even with an explicit include', () => {
    const e = {
      package: CORE,
      transform: {
        appliesTo: {include: ['*'], packages: [CORE]},
        wrap: {component: 'W', from: META},
      },
    };
    expect(isTransformApplicable(e, tpl({package: CORE}))).toBe(false);
  });
});

describe('hostile: prototype pollution', () => {
  it('does not pollute Object.prototype through a __proto__ prop name', () => {
    const props = JSON.parse('{"__proto__": {"polluted": true}}');
    const res = run(PAGE, wrapT({props}));
    assertSafe(res, PAGE);
    expect({}.polluted).toBeUndefined();
  });

  it('does not pollute through a __proto__ key inside an object prop', () => {
    const props = JSON.parse('{"config": {"__proto__": {"polluted2": true}}}');
    const res = run(PAGE, wrapT({props}));
    assertSafe(res, PAGE);
    expect({}.polluted2).toBeUndefined();
  });

  it('does not treat constructor/prototype prop names as special', () => {
    const res = run(PAGE, wrapT({props: {constructor: 'a', prototype: 'b'}}));
    assertSafe(res, PAGE);
    expect(typeof {}.constructor).toBe('function');
  });
});

describe('hostile: fuzz matrix', () => {
  // Every source crossed with every transform: 15 x 7 runs, each asserting the
  // two invariants. Cheap insurance against a combination nobody thought about.
  const SOURCES = [
    PAGE,
    '',
    '   ',
    '// only a comment',
    `'use client';`,
    `export default 1;`,
    `export default {};`,
    `export default function Page() {}`,
    `export default function Page() { return null; }`,
    `export default () => <X />;`,
    `const P = () => <X />;\nexport default P;`,
    `export default function Page() { return <><A /><B /></>; }`,
    `export default function Page() { return cond ? <A /> : <B />; }`,
    `import {W} from '@xds/meta';\n${PAGE}`,
    `export default function Page( { return <X <<< ;`,
  ];

  const TRANSFORMS = [
    wrapT(),
    wrapT({importKind: 'default'}),
    wrapT({props: {a: 1, b: 'x', c: true, d: null, e: {f: [1, 2]}}}),
    {wrap: [{component: 'A', from: '@m'}, {component: 'B', from: '@m'}]},
    {wrap: []},
    {wrap: {component: 'W', from: ''}},
    {appliesTo: {types: ['block']}, wrap: {component: 'W', from: META}},
  ];

  for (const [si, src] of SOURCES.entries()) {
    for (const [ti, transform] of TRANSFORMS.entries()) {
      it(`source ${si} x transform ${ti} holds both invariants`, () => {
        let res;
        expect(() => {
          res = run(src, transform, {onWarn: () => {}});
        }).not.toThrow();
        assertSafe(res, src);
        // Only names this transform could have introduced — several fixtures
        // already render an unimported <A/>/<B/> of their own.
        const wraps = Array.isArray(transform.wrap)
          ? transform.wrap
          : [transform.wrap];
        for (const w of wraps) {
          const name = w?.component;
          if (!name || new RegExp(`<${name}[\\s>/]`).test(src)) continue;
          assertWrapperBound(res.source, name);
        }
      });
    }
  }
});

describe('hostile: the load boundary rejects what the engine guards against', () => {
  const bad = shell => () => parseAppShell(shell);

  it('throws (does not hang) on a circular props object', () => {
    const circular = {};
    circular.self = circular;
    expect(bad({component: 'W', from: META, props: {config: circular}})).toThrow();
  }, 15000);

  it('rejects injection payloads in component', () => {
    for (const component of ['W attr="x"', 'W>', 'W.X', 'W-X', '<script>', '']) {
      expect(bad({component, from: META})).toThrow();
    }
  });

  it('rejects an empty module specifier', () => {
    expect(bad({component: 'W', from: ''})).toThrow();
  });

  it('rejects NaN and non-JSON prop values', () => {
    expect(bad({component: 'W', from: META, props: {x: NaN}})).toThrow();
    expect(bad({component: 'W', from: META, props: {x: () => {}}})).toThrow();
    expect(bad({component: 'W', from: META, props: {x: Symbol('s')}})).toThrow();
    expect(bad({component: 'W', from: META, props: {x: undefined}})).toThrow();
  });

  it('rejects the engine-internal wrap shape (not an authored concept)', () => {
    expect(bad({wrap: {component: 'W', from: META}})).toThrow();
    expect(bad({wrap: []})).toThrow();
  });

  it('rejects unknown keys', () => {
    expect(bad({component: 'W', from: META, unknown: true})).toThrow();
    expect(bad({component: 'W', from: META, appliesTo: {types: ['page']}})).toThrow();
  });

  it('rejects a prop name that would split into two attributes', () => {
    expect(bad({component: 'W', from: META, props: {'bad key': 'x'}})).toThrow();
  });
});
