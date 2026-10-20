// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';

import {linkableStrings, pointersIn} from './stray-pointers.mjs';

describe('pointersIn', () => {
  it('finds a code span that is exactly the command opening one doc', () => {
    expect(
      pointersIn(
        'Read `astryx docs theme`, then `astryx docs layout-spacing`.',
      ),
    ).toEqual(['theme', 'layout-spacing']);
  });

  it('leaves a walkthrough alone: more words, a flag, or a route', () => {
    expect(
      pointersIn(
        'Run `astryx docs theme overview`, `astryx docs --json`, `astryx docs cli/integrations`, or `astryx docs`.',
      ),
    ).toEqual([]);
  });

  it('leaves the bare name and a runner-written command alone', () => {
    expect(
      pointersIn('See astryx docs theme, or `pnpm astryx docs theme`.'),
    ).toEqual([]);
  });
});

describe('linkableStrings', () => {
  it('reads prose, headings, list items and table cells, not the summary or code', () => {
    const strings = linkableStrings({
      name: 'acme',
      description: 'Read `astryx docs theme`.',
      sections: [
        {
          title: 'Use it',
          content: [
            {type: 'prose', text: 'prose'},
            {type: 'heading', level: 3, text: 'heading'},
            {type: 'list', style: 'unordered', items: ['item']},
            {type: 'table', headers: ['head'], rows: [['cell']]},
            {type: 'code', lang: 'bash', code: 'astryx docs theme'},
          ],
        },
      ],
    });
    expect(strings).toEqual([
      {text: 'prose', section: 'Use it'},
      {text: 'heading', section: 'Use it'},
      {text: 'item', section: 'Use it'},
      {text: 'head', section: 'Use it'},
      {text: 'cell', section: 'Use it'},
    ]);
  });
});
