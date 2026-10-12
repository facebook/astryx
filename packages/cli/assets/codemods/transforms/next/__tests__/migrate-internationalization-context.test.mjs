// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import jscodeshift from 'jscodeshift';
import transform from '../migrate-internationalization-context.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../../../../../..');

const j = jscodeshift.withParser('tsx');
const api = {jscodeshift: j, stats: () => {}, report: () => {}};

/** @param {string} source */
function apply(source) {
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

/**
 * The printer wraps long attribute lists and places the TODO comment before
 * the attribute it annotates; compare with whitespace folded and comments
 * removed.
 */
const folded = (/** @type {string} */ text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/ >/g, '>');

const TRANSLATE_TODO = 'InternationalizationProvider has no `translate` input';
const EXPRESSION_TODO = 'Not rewritten here: the value is an expression';

describe('migrate-internationalization-context', () => {
  it('rewrites a variable value to the provider, field by field, with a TODO for its translate', () => {
    const input = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
const app = <InternationalizationContext value={i18n}><App /></InternationalizationContext>;`;
    const output = apply(input);
    expect(folded(output)).toContain(
      'locale={i18n.locale} dir={i18n.direction} messages={i18n.messages}><App /></InternationalizationProvider>',
    );
    expect(output).not.toContain('overrides=');
    expect(output).toContain(TRANSLATE_TODO);
    expect(output).toContain('pass the value’s `overrides`');
    expect(output).toContain(
      "import {InternationalizationProvider} from '@astryxdesign/core/i18n';",
    );
    expect(output).not.toContain('InternationalizationContext');
  });

  it('maps an inline object key by key, keeping only the keys it has, and the .Provider form', () => {
    const input = `import {InternationalizationContext} from '@astryxdesign/core';
const app = (
  <InternationalizationContext.Provider value={{locale: 'fr', direction, messages: catalogs}}>
    <App />
  </InternationalizationContext.Provider>
);`;
    const output = apply(input);
    expect(folded(output)).toContain(
      "<InternationalizationProvider locale={'fr'} dir={direction} messages={catalogs}>",
    );
    expect(output).toContain('</InternationalizationProvider>');
    expect(output).toContain(TRANSLATE_TODO);
    expect(output).not.toContain('overrides=');
  });

  it("keeps a literal's translate key beside the TODO rather than dropping it", () => {
    const input = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
const app = <InternationalizationContext value={{locale: 'en', translate: myTranslate}}><App /></InternationalizationContext>;`;
    const output = apply(input);
    expect(output).toContain("locale={'en'}");
    expect(output).toContain(TRANSLATE_TODO);
    expect(output).toContain('translate: myTranslate');
  });

  it('leaves a call or a spread unchanged behind a TODO that says why', () => {
    const input = `import {InternationalizationContext, InternationalizationProvider} from '@astryxdesign/core/i18n';
import {useContext} from 'react';
function Wrapped({children}) {
  const ambient = useContext(InternationalizationContext);
  return <InternationalizationContext value={{...ambient, locale: 'de'}}>{children}</InternationalizationContext>;
}
const app = <InternationalizationContext value={makeI18n()}><App /></InternationalizationContext>;`;
    const output = apply(input);
    expect(folded(output)).toContain(
      "<InternationalizationContext value={{...ambient, locale: 'de'}}>",
    );
    expect(folded(output)).toContain(
      '<InternationalizationContext value={makeI18n()}>',
    );
    expect(output).not.toContain('<InternationalizationProvider');
    expect(output.match(new RegExp(EXPRESSION_TODO, 'g'))).toHaveLength(2);
    expect(output).toContain('useContext(InternationalizationContext)');
    expect(output).toContain(
      "import {InternationalizationContext, InternationalizationProvider} from '@astryxdesign/core/i18n';",
    );
  });

  it('reuses an aliased provider import and handles a namespace and an aliased context', () => {
    const input = `import * as i18n from '@astryxdesign/core/i18n';
import {InternationalizationContext as Ctx, InternationalizationProvider as IP} from '@astryxdesign/core/i18n';
const a = <i18n.InternationalizationContext value={v}><A /></i18n.InternationalizationContext>;
const b = <Ctx value={w}><B /></Ctx>;`;
    const output = folded(apply(input));
    expect(output).toContain(
      '<i18n.InternationalizationProvider locale={v.locale} dir={v.direction} messages={v.messages}',
    );
    expect(output).toContain('<IP locale={w.locale} dir={w.direction}');
    expect(output).toContain('</IP>');
    expect(output).not.toContain('<InternationalizationProvider');
    expect(output).toContain(
      "import {InternationalizationProvider as IP} from '@astryxdesign/core/i18n';",
    );
  });

  it('resolves block scopes: a block-level local shadows, and a use beside one is still rewritten', () => {
    const input = `import {InternationalizationContext as Ctx} from '@astryxdesign/core/i18n';
let out;
{
  const Ctx = MyOwnContext;
  out = <Ctx value={v}><A /></Ctx>;
}
function F({flag}) {
  if (flag) {
    const Ctx = Other;
    return <Ctx value={v}><A /></Ctx>;
  }
  for (const Ctx of contexts) {
    out = <Ctx value={v}><C /></Ctx>;
  }
  try {
    run();
  } catch (Ctx) {
    out = <Ctx value={v}><D /></Ctx>;
  }
  return <Ctx value={w}><B /></Ctx>;
}`;
    const output = folded(apply(input));
    // The four shadowed uses (block, if block, loop head, catch) stay as written.
    expect(output.match(/<Ctx value=\{v\}>/g)).toHaveLength(4);
    expect(output).toContain('<Ctx value={v}><A /></Ctx>; }');
    // The one unshadowed use is rewritten.
    expect(output).toContain(
      '<InternationalizationProvider locale={w.locale} dir={w.direction} messages={w.messages}><B /></InternationalizationProvider>',
    );
    // The context import stays: the file still names Ctx.
    expect(output).toMatch(
      /import \{ ?InternationalizationContext as Ctx, InternationalizationProvider ?\} from '@astryxdesign\/core\/i18n';/,
    );
  });

  it('counts a var anywhere in the function and a named class expression as shadows', () => {
    const input = `import {InternationalizationContext as Ctx} from '@astryxdesign/core/i18n';
function F({flag}) {
  if (flag) { var Ctx = Other; }
  return <Ctx value={w}><A /></Ctx>;
}
function G(list) {
  for (var Ctx of list) {}
  return <Ctx value={w}><B /></Ctx>;
}
const Shell = class Ctx {
  render() { return <Ctx value={v}><C /></Ctx>; }
};
const ok = <Ctx value={x}><D /></Ctx>;`;
    const output = folded(apply(input));
    expect(output.match(/<Ctx value=\{w\}>/g)).toHaveLength(2);
    expect(output).toContain('<Ctx value={v}><C /></Ctx>');
    expect(output).toContain(
      '<InternationalizationProvider locale={x.locale} dir={x.direction} messages={x.messages}><D /></InternationalizationProvider>',
    );
  });

  it('imports the provider under a free alias when the module already binds that name', () => {
    const wrapper = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
function InternationalizationProvider({children}) {
  return <InternationalizationContext value={i18n}>{children}</InternationalizationContext>;
}`;
    const output = folded(apply(wrapper));
    expect(output).toContain(
      "import {InternationalizationProvider as InternationalizationProvider2} from '@astryxdesign/core/i18n';",
    );
    expect(output).toContain(
      '<InternationalizationProvider2 locale={i18n.locale} dir={i18n.direction} messages={i18n.messages}>{children}</InternationalizationProvider2>',
    );
    expect(output).toContain(
      'function InternationalizationProvider({children})',
    );
    const ownImport = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
import {InternationalizationProvider} from './provider';
const app = <InternationalizationContext value={i18n}><App /></InternationalizationContext>;`;
    const output2 = folded(apply(ownImport));
    expect(output2).toContain(
      "import {InternationalizationProvider as InternationalizationProvider2} from '@astryxdesign/core/i18n';",
    );
    expect(output2).toContain(
      "import {InternationalizationProvider} from './provider';",
    );
    expect(output2).toContain(
      '<InternationalizationProvider2 locale={i18n.locale}',
    );
  });

  it('does not count a type specifier of the provider as its import', () => {
    const input = `import {InternationalizationContext, type InternationalizationProvider} from '@astryxdesign/core/i18n';
const app = <InternationalizationContext value={i18n}><App /></InternationalizationContext>;
export type P = typeof InternationalizationProvider;`;
    const output = folded(apply(input));
    expect(output).toContain(
      '<InternationalizationProvider2 locale={i18n.locale}',
    );
    expect(output).toMatch(
      /InternationalizationProvider as InternationalizationProvider2.*from '@astryxdesign\/core\/i18n'/,
    );
  });

  it('leaves an element behind the TODO when a local shadows the provider at the edit site, or when its value is spread in', () => {
    const input = `import {InternationalizationContext, InternationalizationProvider} from '@astryxdesign/core/i18n';
function Shadowing() {
  const InternationalizationProvider = makeLocalProvider();
  return <InternationalizationContext value={i18n}><A /></InternationalizationContext>;
}
const spread = <InternationalizationContext {...props}><B /></InternationalizationContext>;`;
    const output = folded(apply(input));
    expect(output).toContain(
      '<InternationalizationContext value={i18n}><A /></InternationalizationContext>',
    );
    expect(output).toContain(
      '<InternationalizationContext {...props}><B /></InternationalizationContext>',
    );
    expect(output.match(new RegExp(EXPRESSION_TODO, 'g'))).toBeNull();
    const raw = apply(input);
    expect(raw).toContain(
      'a local named `InternationalizationProvider` shadows the provider import at this site',
    );
    expect(raw.match(new RegExp(EXPRESSION_TODO, 'g'))).toHaveLength(1);
  });

  it('sees a private method parameter, a static block and a namespace body as scopes', () => {
    const input = `import {InternationalizationContext as Ctx} from '@astryxdesign/core/i18n';
class Shell {
  #render(Ctx) { return <Ctx value={v}><A /></Ctx>; }
  static { const Ctx = Other; Shell.out = <Ctx value={v}><B /></Ctx>; }
  render() { return <Ctx value={w}><C /></Ctx>; }
}
namespace Local {
  const Ctx = Other;
  export const out = <Ctx value={v}><D /></Ctx>;
}
namespace Exported {
  export const Ctx = Other;
  export const out = <Ctx value={v}><F /></Ctx>;
}
namespace Aliased {
  import Ctx = Other.Context;
  export const out = <Ctx value={v}><G /></Ctx>;
}
namespace Declared {
  declare function Ctx(props: {value: unknown}): null;
  export const out = <Ctx value={v}><H /></Ctx>;
}
export const ok = <Ctx value={x}><E /></Ctx>;`;
    const output = folded(apply(input));
    expect(output.match(/<Ctx value=\{v\}>/g)).toHaveLength(6);
    expect(output).toContain(
      '<InternationalizationProvider locale={w.locale} dir={w.direction} messages={w.messages}><C /></InternationalizationProvider>',
    );
    expect(output).toContain(
      '<InternationalizationProvider locale={x.locale} dir={x.direction} messages={x.messages}><E /></InternationalizationProvider>',
    );
  });

  it('leaves a shadowed name and a type-only import alone', () => {
    const shadowed = `import {InternationalizationContext as Ctx} from '@astryxdesign/core/i18n';
function Row({Ctx}) {
  return <Ctx value={v}><A /></Ctx>;
}
function Other() {
  const Ctx = MyContext;
  return <Ctx value={v}><B /></Ctx>;
}`;
    expect(
      transform({source: shadowed, path: 'test.tsx'}, api),
    ).toBeUndefined();
    const typeOnly = `import type {InternationalizationContextValue} from '@astryxdesign/core/i18n';
import {type InternationalizationContext as CtxType} from '@astryxdesign/core/i18n';
const InternationalizationContext = createContext<InternationalizationContextValue>(fallback);
const app = <InternationalizationContext value={v}><App /></InternationalizationContext>;
export type Shape = typeof CtxType;`;
    expect(
      transform({source: typeOnly, path: 'test.tsx'}, api),
    ).toBeUndefined();
  });

  it('leaves a file alone that only reads the context, or names an unrelated context', () => {
    const reader = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
import {useContext} from 'react';
const locale = () => useContext(InternationalizationContext).locale;`;
    expect(transform({source: reader, path: 'test.tsx'}, api)).toBeUndefined();
    const unrelated = `import {InternationalizationContext} from './my-i18n';
const app = <InternationalizationContext value={v}><App /></InternationalizationContext>;`;
    expect(
      transform({source: unrelated, path: 'test.tsx'}, api),
    ).toBeUndefined();
  });

  it('rewrites a variable value into output that typechecks against the real i18n types', () => {
    // The variable's inferred type has every required field and no `overrides`.
    const input = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
const i18n = {
  locale: 'fr',
  direction: 'ltr' as const,
  messages: {},
  translate: (key: string) => key,
};
export const app = <InternationalizationContext value={i18n}><div /></InternationalizationContext>;`;
    const output = apply(input);
    const dir = mkdtempSync(path.join(tmpdir(), 'astryx-i18n-codemod-'));
    const typecheck = (/** @type {string} */ source) => {
      writeFileSync(path.join(dir, 'case.tsx'), source);
      writeFileSync(
        path.join(dir, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            strict: true,
            noEmit: true,
            jsx: 'react-jsx',
            module: 'esnext',
            moduleResolution: 'bundler',
            target: 'es2022',
            skipLibCheck: true,
            paths: {
              '@astryxdesign/core/i18n': [
                path.join(repoRoot, 'packages/core/src/i18n/index.ts'),
              ],
            },
            typeRoots: [path.join(repoRoot, 'node_modules/@types')],
            types: ['node', 'react'],
          },
          files: ['case.tsx'],
        }),
      );
      try {
        execFileSync(
          process.execPath,
          [path.join(repoRoot, 'node_modules/typescript/bin/tsc'), '-p', dir],
          {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']},
        );
        return '';
      } catch (error) {
        return String(/** @type {any} */ (error).stdout ?? error);
      }
    };
    expect(typecheck(output)).toBe('');
    // The test bites: reading `overrides` off this variable is TS2339.
    const naive = output.replace(
      'messages={i18n.messages}',
      'messages={i18n.messages} overrides={i18n.overrides}',
    );
    expect(typecheck(naive)).toContain('TS2339');
  }, 60_000);

  it('leaves the consumer shape in the wild alone: read the ambient value, re-mount the provider', () => {
    // Every use of the context outside Astryx that a code search found (two
    // internal consumers, one public) has this shape; the transform over
    // their files returned no change, and this fixture is that shape.
    const input = `import {useContext, useMemo, type ReactNode} from 'react';
import {InternationalizationContext, InternationalizationProvider} from '@astryxdesign/core/i18n';
export function WithRowWording({children}: {children: ReactNode}) {
  const i18n = useContext(InternationalizationContext);
  const overrides = useMemo(
    () => ({...i18n.overrides, en: {...ROW_WORDING, ...i18n.overrides?.en}}),
    [i18n.overrides],
  );
  return (
    <InternationalizationProvider
      locale={i18n.locale}
      messages={i18n.messages}
      dir={i18n.direction}
      overrides={overrides}>
      {children}
    </InternationalizationProvider>
  );
}`;
    expect(transform({source: input, path: 'test.tsx'}, api)).toBeUndefined();
  });

  it('leaves an empty literal behind the TODO on its value attribute, never as text', () => {
    const input = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
const app = (
  <div>
    <InternationalizationContext value={{}}>
      <App />
    </InternationalizationContext>
  </div>
);`;
    const output = apply(input);
    expect(folded(output)).toContain(
      '<InternationalizationContext value={{}}>',
    );
    expect(output).toContain(TRANSLATE_TODO);
    expect(output).not.toContain('<InternationalizationProvider');
    // The comment sits inside the opening tag, not between the tags as text.
    expect(output).toMatch(/<InternationalizationContext\s+\/\* TODO/);
  });

  it('removes an Astryx import declaration it empties, keeping its comments and the directive', () => {
    const input = `'use client';
// Copyright (c) Example.
import {InternationalizationContext} from '@astryxdesign/core';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
const app = <InternationalizationContext value={i18n}><App /></InternationalizationContext>;`;
    const output = apply(input);
    expect(output).not.toContain("from '@astryxdesign/core';");
    expect(output).not.toMatch(/^import ['"]@astryxdesign\/core['"];/m);
    expect(output).toContain(
      "import {InternationalizationProvider} from '@astryxdesign/core/i18n';",
    );
    expect(output).toContain('// Copyright (c) Example.');
    expect(output).toMatch(/^'use client';\n/);
    expect(output).not.toContain(';;');
    expect(folded(output)).toContain(
      '<InternationalizationProvider locale={i18n.locale}',
    );
  });

  it('is idempotent', () => {
    const input = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
const a = <InternationalizationContext value={i18n}><A /></InternationalizationContext>;
const b = <InternationalizationContext value={{locale: 'en', translate: t}}><B /></InternationalizationContext>;
const c = <InternationalizationContext value={makeI18n()}><C /></InternationalizationContext>;`;
    const once = apply(input);
    expect(transform({source: once, path: 'test.tsx'}, api)).toBeUndefined();
  });
});
