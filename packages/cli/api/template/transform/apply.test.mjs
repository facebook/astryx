// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for the template-transform engine. Exercises the declarative
 * wrap (with its auto-import), the validation safety net, and scope/owner
 * filtering against a real jscodeshift instance.
 */

import {describe, it, expect} from 'vitest';
import jscodeshift from 'jscodeshift';
import {
  applyTemplateTransforms,
  applyTransformContext,
  buildDeclarativeTransform,
  isTransformApplicable,
  runTransformOnSource,
} from './apply.mjs';

const PAGE = `'use client';

import {Layout, LayoutContent} from '@astryxdesign/core';
import {Text} from '@astryxdesign/core';

export default function Page() {
  return (
    <Layout
      content={
        <LayoutContent>
          <Text type="large">New Page</Text>
        </LayoutContent>
      }
    />
  );
}
`;

const ARROW_PAGE = `import {Layout} from '@astryxdesign/core';

const Page = () => <Layout />;

export default Page;
`;

const CORE = '@astryxdesign/core';
const META = '@xds/meta';

/** Build the standard ctx for a core page template. */
function pageCtx(overrides = {}) {
  return {
    filePath: '/tmp/page.tsx',
    template: {type: 'page', id: 'blank', package: CORE},
    jscodeshift,
    ...overrides,
  };
}

/** Convenience: one loaded transform entry. */
function entry(pkg, transform) {
  return {package: pkg, transform};
}

const wrapWith = (component, extra = {}) =>
  entry(META, {wrap: {component, from: META, ...extra}});

const parses = src => () => jscodeshift.withParser('tsx')(src);
const countMatches = (src, re) => (src.match(re) ?? []).length;

describe('isTransformApplicable', () => {
  const t = {wrap: {component: 'AppFrame', from: META}};

  it('applies a page-scoped transform to a page from another package', () => {
    expect(
      isTransformApplicable(entry(META, t), {type: 'page', id: 'x', package: CORE}),
    ).toBe(true);
  });

  it('excludes the transform owner’s own templates', () => {
    expect(
      isTransformApplicable(entry(META, t), {type: 'page', id: 'x', package: META}),
    ).toBe(false);
  });

  it('defaults to page-only scope (skips blocks)', () => {
    expect(
      isTransformApplicable(entry(META, t), {type: 'block', id: 'x', package: CORE}),
    ).toBe(false);
  });

  it('honors an explicit block scope', () => {
    const blockT = {appliesTo: {types: ['block']}, wrap: {component: 'AppFrame', from: META}};
    expect(
      isTransformApplicable(entry(META, blockT), {
        type: 'block',
        id: 'x',
        package: CORE,
      }),
    ).toBe(true);
  });

  it('returns false when there is no wrap', () => {
    expect(
      isTransformApplicable(entry(META, {}), {type: 'page', id: 'x', package: CORE}),
    ).toBe(false);
  });

  const wrapT = {wrap: {component: 'W', from: META}};
  const tmpl = (over = {}) => ({type: 'page', id: 'dashboard', package: CORE, ...over});

  it('scopes to packages when set', () => {
    const t = {...wrapT, appliesTo: {packages: [CORE]}};
    expect(isTransformApplicable(entry(META, t), tmpl({package: CORE}))).toBe(true);
    expect(
      isTransformApplicable(entry(META, t), tmpl({package: '@acme/x'})),
    ).toBe(false);
  });

  it('honors include globs', () => {
    const t = {...wrapT, appliesTo: {include: ['dashboard', 'marketing/*']}};
    expect(isTransformApplicable(entry(META, t), tmpl({id: 'dashboard'}))).toBe(true);
    expect(
      isTransformApplicable(entry(META, t), tmpl({id: 'marketing/hero'})),
    ).toBe(true);
    expect(isTransformApplicable(entry(META, t), tmpl({id: 'login'}))).toBe(false);
  });

  it('honors exclude globs (over include)', () => {
    const t = {
      ...wrapT,
      appliesTo: {include: ['*'], exclude: ['blank', 'internal/*']},
    };
    expect(isTransformApplicable(entry(META, t), tmpl({id: 'dashboard'}))).toBe(true);
    expect(isTransformApplicable(entry(META, t), tmpl({id: 'blank'}))).toBe(false);
    expect(
      isTransformApplicable(entry(META, t), tmpl({id: 'internal/tool'})),
    ).toBe(false);
  });
});

describe('wrap', () => {
  it('wraps the default-export JSX and adds the wrapper import', () => {
    const {source, transformedBy} = applyTemplateTransforms(
      PAGE,
      pageCtx({transforms: [wrapWith('AppFrame')]}),
    );
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('<AppFrame>');
    expect(source).toContain('</AppFrame>');
    expect(source).toMatch(/import\s*\{\s*AppFrame\s*\}\s*from\s*['"]@xds\/meta['"]/);
    // Original content is preserved inside the wrapper.
    expect(source).toContain('<Layout');
    expect(source).toContain('New Page');
    // Output is still parseable.
    expect(() => jscodeshift.withParser('tsx')(source)).not.toThrow();
  });

  it('wraps an arrow function with an expression body', () => {
    const {source, transformedBy} = applyTemplateTransforms(
      ARROW_PAGE,
      pageCtx({
        filePath: '/tmp/arrow.tsx',
        transforms: [wrapWith('AppFrame')],
      }),
    );
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('<AppFrame>');
    expect(source).toContain('<Layout');
  });

  it('renders string / number / boolean props correctly', () => {
    const {source} = applyTemplateTransforms(
      PAGE,
      pageCtx({
        transforms: [
          wrapWith('AppFrame', {props: {surface: 'internal', density: 2, compact: true}}),
        ],
      }),
    );
    expect(source).toMatch(/surface=['"]internal['"]/);
    expect(source).toMatch(/density=\{2\}/);
    // boolean true renders as a bare attribute (no ={true})
    expect(source).toMatch(/compact(\s|\/|>)/);
    expect(source).not.toMatch(/compact=\{true\}/);
  });

  it('supports a default import for the wrapper', () => {
    const {source} = applyTemplateTransforms(
      PAGE,
      pageCtx({transforms: [wrapWith('Frame', {importKind: 'default'})]}),
    );
    expect(source).toMatch(/import\s+Frame\s+from\s+['"]@xds\/meta['"]/);
    expect(source).toContain('<Frame>');
  });

  it('is idempotent — re-applying does not double-wrap', () => {
    const ctx = pageCtx({transforms: [wrapWith('AppFrame')]});
    const once = applyTemplateTransforms(PAGE, ctx);
    const twice = applyTemplateTransforms(once.source, ctx);
    expect(twice.source).toBe(once.source);
    expect(twice.transformedBy).toEqual([]);
    // Exactly one wrapper opening tag.
    expect(once.source.match(/<AppFrame>/g)?.length).toBe(1);
  });

  it('does not leak the return-statement parentheses into JSX children', () => {
    // `return (<JSX/>)` marks the argument as parenthesized; a naive wrap
    // reprints those parens inside the wrapper, where they become literal text.
    const {source} = applyTemplateTransforms(
      PAGE,
      pageCtx({transforms: [wrapWith('AppFrame')]}),
    );
    expect(source).not.toContain('>(');
    expect(source).not.toContain('/>)');
    expect(source).not.toContain('(<Layout');
    // The wrapped child is the element itself, not parenthesized text.
    expect(source).toMatch(/<AppFrame[^>]*>\s*<Layout/);
  });

  it('leaves source untouched when there is no default export to wrap', () => {
    const noDefault = `export const foo = 1;\n`;
    const {source, transformedBy} = applyTemplateTransforms(
      noDefault,
      pageCtx({transforms: [wrapWith('AppFrame')]}),
    );
    expect(source).toBe(noDefault);
    expect(transformedBy).toEqual([]);
  });
});

describe('multi-component wrap (stack)', () => {
  it('wraps in a stack outermost-first and imports each wrapper', () => {
    const {source, transformedBy} = applyTemplateTransforms(
      PAGE,
      pageCtx({
        transforms: [
          entry(META, {
            wrap: [
              {component: 'MetaProvider', from: META},
              {component: 'AppFrame', from: META, props: {surface: 'internal'}},
            ],
          }),
        ],
      }),
    );
    expect(transformedBy).toEqual([META]);
    // Provider is outside AppFrame is outside the original Layout.
    expect(source.indexOf('<MetaProvider>')).toBeLessThan(
      source.indexOf('<AppFrame'),
    );
    expect(source.indexOf('<AppFrame')).toBeLessThan(source.indexOf('<Layout'));
    expect(source).toMatch(/surface='internal'/);
    expect(source).toContain('MetaProvider');
    expect(source).toContain('AppFrame');
    expect(parses(source)).not.toThrow();
  });

  it('merges same-module wrappers into one import line', () => {
    const {source} = applyTemplateTransforms(
      PAGE,
      pageCtx({
        transforms: [
          entry(META, {
            wrap: [
              {component: 'Outer', from: META},
              {component: 'Inner', from: META},
            ],
          }),
        ],
      }),
    );
    expect(countMatches(source, /from '@xds\/meta'/g)).toBe(1);
    expect(source).toMatch(/Outer/);
    expect(source).toMatch(/Inner/);
    expect(parses(source)).not.toThrow();
  });

  it('supports per-wrapper importKind (default + named)', () => {
    const {source} = applyTemplateTransforms(
      PAGE,
      pageCtx({
        transforms: [
          entry(META, {
            wrap: [
              {component: 'Provider', from: '@xds/meta', importKind: 'default'},
              {component: 'Shell', from: '@xds/meta/shell'},
            ],
          }),
        ],
      }),
    );
    expect(source).toMatch(/import Provider from '@xds\/meta'/);
    expect(source).toMatch(/import \{\s*Shell\s*\} from '@xds\/meta\/shell'/);
    expect(parses(source)).not.toThrow();
  });

  it('is idempotent for a stack (guarded by the outermost wrapper)', () => {
    const t = {
      wrap: [
        {component: 'A', from: '@m'},
        {component: 'B', from: '@m'},
      ],
    };
    const ctx = pageCtx({transforms: [entry(META, t)]});
    const once = applyTemplateTransforms(PAGE, ctx);
    const twice = applyTemplateTransforms(once.source, ctx);
    expect(twice.source).toBe(once.source);
    expect(twice.transformedBy).toEqual([]);
    expect(countMatches(once.source, /<A>/g)).toBe(1);
    expect(countMatches(once.source, /<B>/g)).toBe(1);
  });

  it('applies the full stack to every early return', () => {
    const src = `export default function Page({loading}) {
  if (loading) return <Spinner />;
  return <Main />;
}
`;
    const {source} = applyTemplateTransforms(
      src,
      pageCtx({
        filePath: '/tmp/p.tsx',
        transforms: [
          entry(META, {
            wrap: [
              {component: 'A', from: '@m'},
              {component: 'B', from: '@m'},
            ],
          }),
        ],
      }),
    );
    expect(countMatches(source, /<A>/g)).toBe(2);
    expect(countMatches(source, /<B>/g)).toBe(2);
    expect(parses(source)).not.toThrow();
  });

  it('rolls back the whole stack if any wrapper collides on import', () => {
    const warnings = [];
    const src = `import {B} from '@collide';\nexport default function Page() { return <X />; }`;
    const {source, transformedBy} = applyTemplateTransforms(src, {
      filePath: '/tmp/p.tsx',
      template: {type: 'page', id: 'x', package: CORE},
      transforms: [
        entry(META, {
          wrap: [
            {component: 'A', from: '@m'},
            {component: 'B', from: '@m'},
          ],
        }),
      ],
      jscodeshift,
      onWarn: m => warnings.push(m),
    });
    expect(source).toBe(src);
    expect(transformedBy).toEqual([]);
    expect(warnings).toHaveLength(1);
  });
});

describe('duplicate imports', () => {
  const PAGE_ALREADY_IMPORTS_WRAPPER = `import {Layout} from '@astryxdesign/core';
import {MetaAppFrame} from '@xds/meta';

export default function Page() {
  return <Layout />;
}
`;

  const PAGE_NAME_COLLIDES_OTHER_MODULE = `import {Layout} from '@astryxdesign/core';
import {MetaAppFrame} from '@other/pkg';

export default function Page() {
  return <Layout />;
}
`;

  it('does not duplicate the wrapper import when already imported from the same module', () => {
    const {source, transformedBy} = applyTemplateTransforms(
      PAGE_ALREADY_IMPORTS_WRAPPER,
      pageCtx({transforms: [wrapWith('MetaAppFrame')]}),
    );
    expect(transformedBy).toEqual([META]);
    expect(source).toContain('<MetaAppFrame>');
    // Exactly one import from the wrapper module — no second line, no dup binding.
    expect((source.match(/from '@xds\/meta'/g) ?? []).length).toBe(1);
    expect((source.match(/MetaAppFrame/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(() => jscodeshift.withParser('tsx')(source)).not.toThrow();
  });

  it('rolls back + warns when the wrapper name is already imported from a different module', () => {
    const warnings = [];
    const {source, transformedBy} = applyTemplateTransforms(
      PAGE_NAME_COLLIDES_OTHER_MODULE,
      pageCtx({
        transforms: [wrapWith('MetaAppFrame')],
        onWarn: m => warnings.push(m),
      }),
    );
    // A second `MetaAppFrame` binding would be invalid; the safety net rejects
    // it and the source is emitted untransformed.
    expect(source).toBe(PAGE_NAME_COLLIDES_OTHER_MODULE);
    expect(transformedBy).toEqual([]);
    expect(warnings).toHaveLength(1);
  });

  it('merges into an existing import from the same module (other names present)', () => {
    const page = `import {Layout} from '@astryxdesign/core';
import {metaTokens} from '@xds/meta';

export default function Page() {
  return <Layout />;
}
`;
    const {source} = applyTemplateTransforms(
      page,
      pageCtx({transforms: [wrapWith('MetaAppFrame')]}),
    );
    // Merged into the single @xds/meta import, not a second line.
    expect((source.match(/from '@xds\/meta'/g) ?? []).length).toBe(1);
    expect(source).toMatch(/metaTokens/);
    expect(source).toMatch(/MetaAppFrame/);
    expect(() => jscodeshift.withParser('tsx')(source)).not.toThrow();
  });
});

describe('composition + scope', () => {
  it('composes multiple integrations in order (outermost last)', () => {
    const {source, transformedBy} = applyTemplateTransforms(
      PAGE,
      pageCtx({
        transforms: [
          entry('@a/one', {wrap: {component: 'Inner', from: '@a/one'}}),
          entry('@b/two', {wrap: {component: 'Outer', from: '@b/two'}}),
        ],
      }),
    );
    expect(transformedBy).toEqual(['@a/one', '@b/two']);
    expect(source).toContain('<Inner>');
    expect(source).toContain('<Outer>');
    // Outer wraps Inner (applied second, so it is outermost).
    expect(source.indexOf('<Outer>')).toBeLessThan(source.indexOf('<Inner>'));
  });

  it('skips a page-only transform for a block template', () => {
    const {source, transformedBy} = applyTemplateTransforms(
      PAGE,
      pageCtx({
        template: {type: 'block', id: 'hero', package: CORE},
        transforms: [wrapWith('AppFrame')],
      }),
    );
    expect(source).toBe(PAGE);
    expect(transformedBy).toEqual([]);
  });

  it('skips the owner’s own templates', () => {
    const {source, transformedBy} = applyTemplateTransforms(
      PAGE,
      pageCtx({
        template: {type: 'page', id: 'x', package: META},
        transforms: [wrapWith('AppFrame')],
      }),
    );
    expect(source).toBe(PAGE);
    expect(transformedBy).toEqual([]);
  });
});

describe('buildDeclarativeTransform', () => {
  it('returns null when there is no wrap', () => {
    expect(buildDeclarativeTransform({})).toBeNull();
  });
});

describe('applyTransformContext (show/copy seam)', () => {
  const applicable = [entry(META, {wrap: {component: 'AppFrame', from: META}})];
  const template = {type: 'page', id: 'blank', package: CORE};

  it('passes through when ctx is undefined', () => {
    const r = applyTransformContext(PAGE, '/tmp/page.tsx', undefined);
    expect(r.source).toBe(PAGE);
    expect(r.transformedBy).toEqual([]);
  });

  it('passes through when there are no transforms', () => {
    const r = applyTransformContext(PAGE, '/tmp/page.tsx', {
      transforms: [],
      jscodeshift,
      template,
    });
    expect(r.source).toBe(PAGE);
    expect(r.transformedBy).toEqual([]);
  });

  it('passes through when jscodeshift is null (dependency missing)', () => {
    const r = applyTransformContext(PAGE, '/tmp/page.tsx', {
      transforms: applicable,
      jscodeshift: null,
      template,
    });
    expect(r.source).toBe(PAGE);
    expect(r.transformedBy).toEqual([]);
  });

  it('applies when the context is fully populated', () => {
    const r = applyTransformContext(PAGE, '/tmp/page.tsx', {
      transforms: applicable,
      jscodeshift,
      template,
    });
    expect(r.transformedBy).toEqual([META]);
    expect(r.source).toContain('<AppFrame>');
  });

  it('calls onAlter with the alterations and leaves the source uncommented', () => {
    /** @type {any[]} */
    const calls = [];
    const r = applyTransformContext(PAGE, '/tmp/page.tsx', {
      transforms: applicable,
      jscodeshift,
      template,
      onAlter: a => calls.push(a),
    });
    expect(r.transformedBy).toEqual([META]);
    // Source is NOT annotated with a comment.
    expect(r.source).not.toContain('Adapted by');
    expect(r.source.startsWith("'use client'")).toBe(true);
    // onAlter fired once with rich detail.
    expect(calls).toHaveLength(1);
    expect(calls[0][0].package).toBe(META);
    expect(calls[0][0].wrappers).toEqual(['AppFrame']);
  });

  it('reports every applying integration to onAlter, in order', () => {
    const two = [
      entry('@a/one', {wrap: {component: 'Inner', from: '@a/one'}}),
      entry('@b/two', {wrap: {component: 'Outer', from: '@b/two'}}),
    ];
    /** @type {any[]} */
    const calls = [];
    applyTransformContext(PAGE, '/tmp/page.tsx', {
      transforms: two,
      jscodeshift,
      template,
      onAlter: a => calls.push(a),
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].map((/** @type {any} */ a) => a.package)).toEqual([
      '@a/one',
      '@b/two',
    ]);
  });

  it('does not call onAlter when nothing applied', () => {
    /** @type {any[]} */
    const calls = [];
    const r = applyTransformContext(PAGE, '/tmp/page.tsx', {
      transforms: [entry(META, {wrap: {component: 'AppFrame', from: META}})],
      jscodeshift,
      // owner-excluded: template package === META -> nothing applies
      template: {type: 'page', id: 'x', package: META},
      onAlter: a => calls.push(a),
    });
    expect(r.transformedBy).toEqual([]);
    expect(r.source).toBe(PAGE);
    expect(calls).toHaveLength(0);
  });
});

describe('applyTemplateTransforms — alterations detail', () => {
  it('returns wrappers and description for each applied integration', () => {
    const {alterations} = applyTemplateTransforms(PAGE, {
      filePath: '/tmp/page.tsx',
      template: {type: 'page', id: 'blank', package: CORE},
      transforms: [
        entry(META, {
          description: 'Wraps pages in the Meta shell.',
          wrap: [
            {component: 'MetaProvider', from: META},
            {component: 'AppFrame', from: META},
          ],
        }),
      ],
      jscodeshift,
    });
    expect(alterations).toHaveLength(1);
    expect(alterations[0].package).toBe(META);
    expect(alterations[0].wrappers).toEqual(['MetaProvider', 'AppFrame']);
    expect(alterations[0].description).toBe('Wraps pages in the Meta shell.');
  });
});

describe('runTransformOnSource (safety net)', () => {
  it('reports changed:false for an unchanged transform', () => {
    const res = runTransformOnSource(PAGE, {
      filePath: '/tmp/page.tsx',
      transform: (file) => file.source,
      jscodeshift,
    });
    expect(res.changed).toBe(false);
    expect(res.error).toBeUndefined();
  });

  it('blocks unparseable output and returns the original source', () => {
    const res = runTransformOnSource(PAGE, {
      filePath: '/tmp/page.tsx',
      transform: () => 'this is <<< not valid tsx',
      jscodeshift,
    });
    expect(res.changed).toBe(false);
    expect(res.source).toBe(PAGE);
    expect(res.error).toBeTruthy();
  });

  it('captures a thrown transform as an error', () => {
    const res = runTransformOnSource(PAGE, {
      filePath: '/tmp/page.tsx',
      transform: () => {
        throw new Error('kaboom');
      },
      jscodeshift,
    });
    expect(res.changed).toBe(false);
    expect(res.error).toContain('kaboom');
  });
});
