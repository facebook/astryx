// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  anatomyDescription,
  anatomyNameSegments,
} from '../components/component-detail/anatomyHelpers';

describe('anatomy description', () => {
  it('marks a required element with a bold lead-in on its description', () => {
    expect(
      anatomyDescription({
        name: 'Avatar children',
        required: true,
        description: 'Avatar elements that form the overlapping row.',
      }),
    ).toBe('**Required:** Avatar elements that form the overlapping row.');
  });

  it('leaves an optional element description untouched', () => {
    expect(
      anatomyDescription({
        name: 'Overflow indicator',
        required: false,
        description: 'A "+N" circle at the end showing hidden count.',
      }),
    ).toBe('A "+N" circle at the end showing hidden count.');
  });

  it('emits the lead-in alone when a required element has no description', () => {
    expect(
      anatomyDescription({name: 'Photo', required: true, description: ''}),
    ).toBe('**Required:**');
  });

  it('keeps the lead-in adjacent to descriptions authored across lines', () => {
    // Doc files write descriptions as wrapped template literals, so the raw
    // string can lead with a newline and indentation.
    expect(
      anatomyDescription({
        name: 'Status dot',
        required: true,
        description: '\n  A small indicator in the bottom-right corner.\n',
      }),
    ).toBe('**Required:** A small indicator in the bottom-right corner.');
  });
});

describe('anatomy name segments', () => {
  it('offers a break after a solidus, which CSS does not', () => {
    // Field: "Optional/Required" is 132px in a 108px content box and has no
    // break opportunity, so it came out as "Optional/Requ" / "ired indicator".
    expect(anatomyNameSegments('Optional/Required indicator')).toEqual([
      'Optional/',
      'Required indicator',
    ]);
  });

  it('leaves a name the browser can already wrap as one piece', () => {
    // A hyphen is a break opportunity, so "Scroll-to-bottom" wraps correctly.
    expect(anatomyNameSegments('Scroll-to-bottom button')).toEqual([
      'Scroll-to-bottom button',
    ]);
    expect(anatomyNameSegments('Status dot')).toEqual(['Status dot']);
  });

  it('splits every solidus in a name', () => {
    expect(anatomyNameSegments('a/b/c')).toEqual(['a/', 'b/', 'c']);
  });
});
