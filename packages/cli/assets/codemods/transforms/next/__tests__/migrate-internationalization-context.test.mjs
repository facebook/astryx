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

/** The printer wraps long attribute lists; compare with whitespace folded. */
const folded = (/** @type {string} */ text) => text.replace(/\s+/g, ' ');

describe('migrate-internationalization-context', () => {
  it('rewrites a context value from a variable to the provider, prop by prop', () => {
    const input = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
const app = <InternationalizationContext value={i18n}><App /></InternationalizationContext>;`;
    const output = apply(input);
    expect(folded(output)).toContain(
      '<InternationalizationProvider locale={i18n.locale} dir={i18n.direction} messages={i18n.messages} overrides={i18n.overrides}><App /></InternationalizationProvider>',
    );
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
    expect(output).toContain(
      "<InternationalizationProvider locale={'fr'} dir={direction} messages={catalogs}>",
    );
    expect(output).toContain('</InternationalizationProvider>');
    expect(output).not.toContain('overrides=');
  });

  it('leaves a translate key behind a TODO rather than dropping it', () => {
    const input = `import {InternationalizationContext} from '@astryxdesign/core/i18n';
const app = <InternationalizationContext value={{locale: 'en', translate: myTranslate}}><App /></InternationalizationContext>;`;
    const output = apply(input);
    expect(output).toContain("locale={'en'}");
    expect(output).toContain(
      'TODO(astryx upgrade): InternationalizationProvider has no `translate` input',
    );
    expect(output).toContain('translate: myTranslate');
  });

  it('keeps the context import when the file still reads the context', () => {
    const input = `import {InternationalizationContext, InternationalizationProvider} from '@astryxdesign/core/i18n';
import {useContext} from 'react';
function Wrapped({children}) {
  const ambient = useContext(InternationalizationContext);
  return <InternationalizationContext value={{...ambient, locale: 'de'}}>{children}</InternationalizationContext>;
}`;
    const output = apply(input);
    expect(output).toContain('useContext(InternationalizationContext)');
    expect(output).toMatch(
      /import \{InternationalizationContext, InternationalizationProvider\} from '@astryxdesign\/core\/i18n';/,
    );
    // A spread cannot be mapped to props; it stays behind the TODO.
    expect(output).toContain("locale={'de'}");
    expect(output).toContain('...ambient');
  });

  it('handles a namespace import and an alias', () => {
    const input = `import * as i18n from '@astryxdesign/core/i18n';
import {InternationalizationContext as Ctx} from '@astryxdesign/core/i18n';
const a = <i18n.InternationalizationContext value={v}><A /></i18n.InternationalizationContext>;
const b = <Ctx value={w}><B /></Ctx>;`;
    const output = folded(apply(input));
    expect(output).toContain(
      '<i18n.InternationalizationProvider locale={v.locale} dir={v.direction} messages={v.messages} overrides={v.overrides}><A /></i18n.InternationalizationProvider>',
    );
    expect(output).toContain(
      '<InternationalizationProvider locale={w.locale} dir={w.direction} messages={w.messages} overrides={w.overrides}><B /></InternationalizationProvider>',
    );
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
});
