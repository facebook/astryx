// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for the doc-section auto-linker.
 *
 * Run: pnpm -F @astryxdesign/docsite test
 */

import {describe, it, expect} from 'vitest';
import {linkifyDocSections} from '../components/docs/docsLinkify';
import type {DocSection} from '../generated/docsRegistry';

const NAMES = ['Button', 'Card', 'Theme'];

function sectionWith(...content: DocSection['content']): DocSection[] {
  return [{title: 'Overview', content}];
}

describe('linkifyDocSections', () => {
  it('links component names in prose as monospace links', () => {
    const out = linkifyDocSections(
      sectionWith({type: 'prose', text: 'Wrap the app in Theme.'}),
      NAMES,
    );
    expect(out[0].content[0].text).toBe(
      'Wrap the app in [`Theme`](/components/Theme).',
    );
  });

  it('links component names in list items', () => {
    const out = linkifyDocSections(
      sectionWith({type: 'list', items: ['Use Button here', 'no names here']}),
      NAMES,
    );
    expect(out[0].content[0].items).toEqual([
      'Use [`Button`](/components/Button) here',
      'no names here',
    ]);
  });

  it('links component names in table cells but not table headers', () => {
    const out = linkifyDocSections(
      sectionWith({
        type: 'table',
        headers: ['Button', 'Notes'],
        rows: [['Card', 'plain']],
      }),
      NAMES,
    );
    expect(out[0].content[0].headers).toEqual(['Button', 'Notes']);
    expect(out[0].content[0].rows).toEqual([
      ['[`Card`](/components/Card)', 'plain'],
    ]);
  });

  it('leaves heading and code blocks untouched', () => {
    const out = linkifyDocSections(
      sectionWith(
        {type: 'heading', text: 'Button basics', level: 3},
        {type: 'code', lang: 'tsx', code: '<Button />'},
      ),
      NAMES,
    );
    expect(out[0].content[0].text).toBe('Button basics');
    expect(out[0].content[1].code).toBe('<Button />');
  });

  it('leaves section titles untouched', () => {
    const out = linkifyDocSections(
      [{title: 'Button anatomy', content: []}],
      NAMES,
    );
    expect(out[0].title).toBe('Button anatomy');
  });

  it('does not mutate the input sections', () => {
    const input = sectionWith({type: 'prose', text: 'Use Button.'});
    const snapshot = JSON.parse(JSON.stringify(input));
    linkifyDocSections(input, NAMES);
    expect(input).toEqual(snapshot);
  });

  it('returns the input unchanged when there are no component names', () => {
    const input = sectionWith({type: 'prose', text: 'Use Button.'});
    expect(linkifyDocSections(input, [])).toEqual(input);
  });

  it('leaves names that authors already wrote as code spans alone', () => {
    const out = linkifyDocSections(
      sectionWith({type: 'prose', text: 'Wrap the app in `<Theme>`.'}),
      NAMES,
    );
    expect(out[0].content[0].text).toBe('Wrap the app in `<Theme>`.');
  });
});
