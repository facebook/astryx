// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';

import {density, fillerIn} from './doc-fluff.mjs';
import {passageWords} from './copied-passages.mjs';

const words = (/** @type {string} */ text) =>
  passageWords(text).map(word => ({word}));

describe('fillerIn', () => {
  it('finds padding phrases in order, the longest one only', () => {
    expect(
      fillerIn(
        'In order to start, it is worth noting that you basically run it. Note that it builds.',
      ),
    ).toEqual(['in order to', 'it is worth noting', 'basically', 'note that']);
  });

  it('leaves inline code, quotes, a noun "note", and ambiguous words alone', () => {
    expect(
      fillerIn(
        'Run `basically --in order to`. Cut "in order to" and “basically”. Add a note that explains it. Copy just this one file; it really is the source.',
      ),
    ).toEqual([]);
  });

  it('sets aside single-quoted text, but not an apostrophe', () => {
    expect(
      fillerIn(
        "Avoid ‘basically’ and ‘obviously’. Don't write 'it is worth noting that' in a guide.",
      ),
    ).toEqual([]);
    expect(fillerIn("Don't pad: it's important to note the order.")).toEqual([
      "it's important to note",
    ]);
  });

  it('lists no phrase that carries meaning in a correct sentence', () => {
    expect(
      fillerIn(
        'It is not simply a wrapper. Every app gets a theme whether or not anyone picks one. Keep in mind the order. Feel free to skip it.',
      ),
    ).toEqual([]);
  });

  it('reads a curly apostrophe like a straight one', () => {
    expect(fillerIn('It’s important to note the order.')).toEqual([
      "it's important to note",
    ]);
  });
});

describe('density', () => {
  it('scores a padded sentence well below a dense one', () => {
    const padded = words(
      'So that is why it is the one that you would want to use if you can.',
    );
    const dense = words(
      'Name each codemod folder after the Core version whose upgrade runs it.',
    );
    expect(density(padded)).toBeLessThan(0.3);
    expect(density(dense)).toBeGreaterThan(0.6);
  });
});
