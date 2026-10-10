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

      expect(output).toContain('<Tokenizer label="People" emptySearchText="Nobody found" />');
      expect(output).toContain('<Typeahead label="Fruit" emptySearchText={copy.empty} />');
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

    it('renames the key on objects typed as ChatComposerTrigger', async () => {
      const output =
        await applyTransform(`import type {ChatComposerTrigger} from '@astryxdesign/core';
export const mention: ChatComposerTrigger = {char: '@', searchSource, onSelect, emptySearchResultsText: 'A'};
export const all: ChatComposerTrigger[] = [{char: '/', searchSource, onSelect, emptySearchResultsText: 'B'}];
export const cast = {char: '#', searchSource, onSelect, emptySearchResultsText: 'C'} satisfies ChatComposerTrigger;`);

      expect(output).toContain("emptySearchText: 'A'");
      expect(output).toContain("emptySearchText: 'B'");
      expect(output).toContain("emptySearchText: 'C'");
      expect(output).not.toContain('emptySearchResultsText');
    });

    it('drops the old key when the trigger already sets emptySearchText', async () => {
      const output =
        await applyTransform(`import type {ChatComposerTrigger} from '@astryxdesign/core';
const t: ChatComposerTrigger = {char: '@', searchSource, onSelect, emptySearchResultsText: 'Old', emptySearchText: 'New'};`);

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

    it('leaves objects that are not triggers alone', async () => {
      const source = `import {ChatComposerInput} from '@astryxdesign/core';
const copy = {emptySearchResultsText: 'kept'};
let mutable = [{emptySearchResultsText: 'kept'}];
const a = <ChatComposerInput triggers={mutable} />;`;
      expect(await applyTransform(source)).toBe(source);
    });
  });
});
