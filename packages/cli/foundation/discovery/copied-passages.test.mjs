// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';

import {
  PASSAGE_WORDS,
  passageWords,
  proseWords,
  sharedPassages,
} from './copied-passages.mjs';

const words = (/** @type {string} */ text) =>
  passageWords(text).map(word => ({word, section: null}));

describe('passageWords', () => {
  it('sets aside case, links, and Markdown emphasis', () => {
    expect(
      passageWords('Use **`Button`** for {@link component:Button} actions.'),
    ).toEqual(['use', 'button', 'for', 'actions.']);
  });
});

describe('proseWords', () => {
  it('reads prose with its section, and skips code, references, and names', () => {
    const doc = {
      type: 'generic',
      name: 'acme-guide',
      title: 'Acme guide',
      description: 'Intro words.',
      sections: [
        {
          title: 'Setup',
          content: [
            {type: 'prose', text: 'Install it.'},
            {type: 'code', lang: 'sh', code: 'npm install acme'},
            {type: 'reference', ref: 'generic:other'},
            {type: 'list', items: ['First step.']},
          ],
        },
      ],
    };
    expect(proseWords(doc)).toEqual([
      {word: 'intro', section: null},
      {word: 'words.', section: null},
      {word: 'install', section: 'Setup'},
      {word: 'it.', section: 'Setup'},
      {word: 'first', section: 'Setup'},
      {word: 'step.', section: 'Setup'},
    ]);
  });
});

describe('sharedPassages', () => {
  const passage = Array.from(
    {length: PASSAGE_WORDS + 5},
    (_, i) => `w${i}`,
  ).join(' ');

  it('finds the longest shared run', () => {
    expect(
      sharedPassages(words(`a b ${passage} c`), words(`x ${passage} y`)),
    ).toEqual([{start: 2, length: PASSAGE_WORDS + 5}]);
  });

  it('ignores a run shorter than the passage size', () => {
    const short = passage
      .split(' ')
      .slice(0, PASSAGE_WORDS - 1)
      .join(' ');
    expect(
      sharedPassages(words(`a ${short} b`), words(`c ${short} d`)),
    ).toEqual([]);
  });
});
