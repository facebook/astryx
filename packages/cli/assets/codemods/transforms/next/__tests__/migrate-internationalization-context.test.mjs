// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import jscodeshift from 'jscodeshift';
import transform from '../migrate-internationalization-context.mjs';

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
      'locale={i18n.locale} dir={i18n.direction} messages={i18n.messages}',
    );
    expect(folded(output)).toContain(
      'overrides={i18n.overrides}><App /></InternationalizationProvider>',
    );
    expect(output).toContain(TRANSLATE_TODO);
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
      "import { InternationalizationProvider as IP } from '@astryxdesign/core/i18n';",
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

  it('is idempotent', () => {
    const input = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
const a = <InternationalizationContext value={i18n}><A /></InternationalizationContext>;
const b = <InternationalizationContext value={{locale: 'en', translate: t}}><B /></InternationalizationContext>;
const c = <InternationalizationContext value={makeI18n()}><C /></InternationalizationContext>;`;
    const once = apply(input);
    expect(transform({source: once, path: 'test.tsx'}, api)).toBeUndefined();
  });
});
