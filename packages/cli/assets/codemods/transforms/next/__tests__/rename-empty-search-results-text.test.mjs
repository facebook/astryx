// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import transform from '../rename-empty-search-results-text.mjs';
import manifest from '../index.mjs';

async function applyTransform(source) {
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  return transform({source, path: 'test.tsx'}, api) ?? source;
}

describe('rename-empty-search-results-text', () => {
  it('is staged in the next-release manifest', () => {
    expect(manifest.map(entry => entry.name)).toContain(
      'rename-empty-search-results-text',
    );
  });

  describe('JSX props', () => {
    it('renames the prop on Tokenizer, Typeahead, and BaseTypeahead', async () => {
      const output =
        await applyTransform(`import {BaseTypeahead, Tokenizer, Typeahead} from '@astryxdesign/core';
const a = <Tokenizer label="People" emptySearchResultsText="Nobody found" />;
const b = <Typeahead label="Fruit" emptySearchResultsText={copy.empty} />;
const c = <BaseTypeahead emptySearchResultsText={'None'} />;`);

      expect(output).toContain(
        '<Tokenizer label="People" emptySearchText="Nobody found" />',
      );
      expect(output).toContain(
        '<Typeahead label="Fruit" emptySearchText={copy.empty} />',
      );
      expect(output).toContain("<BaseTypeahead emptySearchText={'None'} />");
      expect(output).not.toContain('emptySearchResultsText');
    });

    it('follows aliases, namespaces, and subpath default imports', async () => {
      const output =
        await applyTransform(`import {Tokenizer as People} from '@astryxdesign/core';
import * as Astryx from '@astryxdesign/core';
import Typeahead from '@astryxdesign/core/Typeahead';
const a = <People emptySearchResultsText="x" />;
const b = <Astryx.BaseTypeahead emptySearchResultsText="y" />;
const c = <Typeahead emptySearchResultsText="z" />;`);

      expect(output).not.toContain('emptySearchResultsText');
      expect(output.match(/emptySearchText=/g)).toHaveLength(3);
    });

    it('drops the old prop when emptySearchText is already set, since it already won', async () => {
      const output =
        await applyTransform(`import {Typeahead} from '@astryxdesign/core';
const a = <Typeahead emptySearchResultsText="Old copy" emptySearchText="New copy" />;`);

      expect(output).toContain('emptySearchText="New copy"');
      expect(output).not.toContain('Old copy');
    });

    it('keeps the old value as a fallback when emptySearchText may be null or undefined', async () => {
      const output =
        await applyTransform(`import {Typeahead} from '@astryxdesign/core';
const a = <Typeahead emptySearchResultsText="Old copy" emptySearchText={props.emptySearchText} />;
const b = <Typeahead emptySearchResultsText={oldCopy} emptySearchText={maybe ? 'x' : undefined} />;`);

      expect(output).toContain(
        'emptySearchText={props.emptySearchText ?? "Old copy"}',
      );
      expect(output).toContain(
        "emptySearchText={(maybe ? 'x' : undefined) ?? oldCopy}",
      );
      expect(output).not.toContain('emptySearchResultsText');
    });

    it('keeps the old value as a fallback on a trigger whose emptySearchText may be nullish', async () => {
      const output =
        await applyTransform(`import {ChatComposerInput} from '@astryxdesign/core';
const t = {char: '@', searchSource, onSelect, emptySearchResultsText: 'Old', emptySearchText: copy};
const a = <ChatComposerInput triggers={[t]} />;`);

      expect(output).toContain("emptySearchText: copy ?? 'Old'");
      expect(output).not.toContain('emptySearchResultsText');
    });

    it('marks a prop that follows a spread for manual migration instead of renaming it', async () => {
      const output =
        await applyTransform(`import {Tokenizer} from '@astryxdesign/core';
const a = <Tokenizer {...rest} emptySearchResultsText="Nobody" />;`);

      expect(output).toContain('TODO(astryx upgrade)');
      expect(output).toContain('emptySearchResultsText="Nobody"');
      expect(await applyTransform(output)).toBe(output);
    });

    it('marks a prop that precedes a spread too, since the spread may forward emptySearchText as undefined', async () => {
      const output =
        await applyTransform(`import {Tokenizer} from '@astryxdesign/core';
const a = <Tokenizer emptySearchResultsText="Nobody" {...rest} />;`);

      expect(output).toContain('TODO(astryx upgrade)');
      expect(output).toContain('emptySearchResultsText="Nobody" {...rest}');
    });

    it('adds the spread TODO once, even inside export const, on repeated runs', async () => {
      const once =
        await applyTransform(`import {Tokenizer} from '@astryxdesign/core';
export const a = <Tokenizer {...rest} emptySearchResultsText="Nobody" />;`);
      const twice = await applyTransform(once);

      expect(once.match(/TODO\(astryx upgrade\)/g)).toHaveLength(1);
      expect(twice).toBe(once);
    });

    it('reports triggers it cannot see into instead of leaving the removed key silent', async () => {
      const output =
        await applyTransform(`import {ChatComposerInput} from '@astryxdesign/core';
import {useMemo} from 'react';
const base = {char: '@', searchSource, onSelect, emptySearchResultsText: 'A'};
const all = [base];
function A() {
  const triggers = useMemo(() => [base], []);
  return <ChatComposerInput triggers={triggers} />;
}
function B() {
  return <ChatComposerInput triggers={all} />;
}`);

      expect(output.match(/this upgrade cannot read/g)).toHaveLength(2);
      expect(output).toContain("emptySearchResultsText: 'A'");
      expect(await applyTransform(output)).toBe(output);
    });

    it('leaves other packages, other components, and shadowed names alone', async () => {
      const source = `import {MobileTokenizer} from '@astryxdesign/lab';
import {Selector} from '@astryxdesign/core';
import {Tokenizer} from './my-tokenizer';
const a = <MobileTokenizer emptySearchResultsText="kept" />;
const b = <Selector emptySearchResultsText="kept" />;
const c = <Tokenizer emptySearchResultsText="kept" />;`;
      expect(await applyTransform(source)).toBe(source);
    });

    it('is idempotent', async () => {
      const once =
        await applyTransform(`import {Tokenizer} from '@astryxdesign/core';
const a = <Tokenizer emptySearchResultsText="Nobody found" />;`);
      expect(await applyTransform(once)).toBe(once);
    });
  });

  describe('ChatComposerInput trigger objects', () => {
    it('renames the key on triggers written inline', async () => {
      const output =
        await applyTransform(`import {ChatComposerInput} from '@astryxdesign/core';
const a = (
  <ChatComposerInput
    triggers={[
      {char: '@', searchSource, onSelect, emptySearchResultsText: 'Nobody found'},
    ]}
  />
);`);

      expect(output).toContain("emptySearchText: 'Nobody found'");
      expect(output).not.toContain('emptySearchResultsText');
    });

    it('renames the key on a same-file const the triggers prop names', async () => {
      const output =
        await applyTransform(`import {ChatComposerInput} from '@astryxdesign/core';
const mention = {char: '@', searchSource, onSelect, emptySearchResultsText: 'Nobody'};
const triggers = [{char: '/', searchSource, onSelect, 'emptySearchResultsText': 'No commands'}];
const a = <ChatComposerInput triggers={triggers} />;
const b = <ChatComposerInput triggers={[mention]} />;`);

      expect(output).toContain("emptySearchText: 'Nobody'");
      expect(output).toContain("'emptySearchText': 'No commands'");
      expect(output).not.toContain('emptySearchResultsText');
    });

    it('marks objects typed through a type-only import instead of renaming them', async () => {
      // A type-only import proves only the type position (AST-040 FR1).
      const output =
        await applyTransform(`import type {ChatComposerTrigger} from '@astryxdesign/core';
export const mention: ChatComposerTrigger = {char: '@', searchSource, onSelect, emptySearchResultsText: 'A'};
export const all: ChatComposerTrigger[] = [{char: '/', searchSource, onSelect, emptySearchResultsText: 'B'}];
export const cast = {char: '#', searchSource, onSelect, emptySearchResultsText: 'C'} satisfies ChatComposerTrigger;`);

      expect(output.match(/typed through a\s+type-only import/g)).toHaveLength(
        3,
      );
      expect(output).toContain("emptySearchResultsText: 'A'");
      expect(output).toContain("emptySearchResultsText: 'B'");
      expect(output).toContain("emptySearchResultsText: 'C'");
      expect(output).not.toContain("emptySearchText: '");
      expect(await applyTransform(output)).toBe(output);
    });

    it('renames a typed object that the runtime triggers prop also reaches', async () => {
      const output =
        await applyTransform(`import {ChatComposerInput} from '@astryxdesign/core';
import type {ChatComposerTrigger} from '@astryxdesign/core';
const mention: ChatComposerTrigger = {char: '@', searchSource, onSelect, emptySearchResultsText: 'A'};
const a = <ChatComposerInput triggers={[mention]} />;`);

      expect(output).toContain("emptySearchText: 'A'");
      expect(output).not.toContain('TODO');
    });

    it('drops the old key when a reached trigger already sets emptySearchText to a value that is never nullish', async () => {
      const output =
        await applyTransform(`import {ChatComposerInput} from '@astryxdesign/core';
const t = {char: '@', searchSource, onSelect, emptySearchResultsText: 'Old', emptySearchText: 'New'};
const a = <ChatComposerInput triggers={t} />;`);

      expect(output).toContain("emptySearchText: 'New'");
      expect(output).not.toContain("'Old'");
    });

    it('marks a trigger with a spread for manual migration instead of renaming it', async () => {
      const output =
        await applyTransform(`import type {ChatComposerTrigger} from '@astryxdesign/core';
const t: ChatComposerTrigger = {...base, emptySearchResultsText: 'Nobody'};`);

      expect(output).toContain('TODO(astryx upgrade)');
      expect(output).toContain("emptySearchResultsText: 'Nobody'");
      expect(await applyTransform(output)).toBe(output);
    });

    it('flags an object key it cannot attribute instead of leaving it silent, and reports a non-const triggers value', async () => {
      const output =
        await applyTransform(`import {ChatComposerInput} from '@astryxdesign/core';
const copy = {emptySearchResultsText: 'kept'};
let mutable = [{emptySearchResultsText: 'kept'}];
const a = <ChatComposerInput triggers={mutable} />;`);

      expect(output).toContain("emptySearchResultsText: 'kept'");
      expect(output).not.toContain('emptySearchText:');
      expect(
        output.match(/could not tell where this object is used/g),
      ).toHaveLength(2);
      expect(output.match(/this upgrade cannot read/g)).toHaveLength(1);
      expect(await applyTransform(output)).toBe(output);
    });

    it('flags a same-file object spread onto Tokenizer', async () => {
      const output =
        await applyTransform(`import {Tokenizer} from '@astryxdesign/core';
const shared = {emptySearchResultsText: 'No people match'};
const a = <Tokenizer {...shared} />;`);

      expect(output).toContain("emptySearchResultsText: 'No people match'");
      expect(output).toContain('could not tell where this object is used');
      expect(await applyTransform(output)).toBe(output);
    });

    it('reports an untyped trigger imported from another module', async () => {
      const output =
        await applyTransform(`import {ChatComposerInput} from '@astryxdesign/core';
import {mention} from './triggers';
const a = <ChatComposerInput triggers={[mention]} />;`);

      expect(output).toContain('this upgrade cannot read');
      expect(await applyTransform(output)).toBe(output);
    });

    it('leaves a file with no runtime core import alone', async () => {
      const source = `import {MobileTokenizer} from '@astryxdesign/lab';
const copy = {emptySearchResultsText: 'kept'};
const a = <MobileTokenizer {...copy} />;`;
      expect(await applyTransform(source)).toBe(source);
    });
  });
});
