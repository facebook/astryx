// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {projectMarkdownFootnotes} from './footnoteProjection';
import {projectMarkdownHeadings} from './headingProjection';
import {parseMarkdownAst} from './parser';

function project(source: string) {
  const root = parseMarkdownAst(source, {footnotes: 'github'});
  const headings = projectMarkdownHeadings(root.children);
  return projectMarkdownFootnotes(root.children, headings);
}

describe('Markdown footnote projection', () => {
  it('numbers definitions by first rendered reference and links repeats', () => {
    const projection = project(
      [
        'Second[^b], first[^a], second again[^b].',
        '',
        '[^a]: A.',
        '',
        '[^b]: B.',
      ].join('\n'),
    );

    expect(
      projection.orderedDefinitions.map(definition => ({
        identifier: definition.node.identifier,
        number: definition.number,
        references: definition.references.length,
      })),
    ).toEqual([
      {identifier: 'b', number: 1, references: 2},
      {identifier: 'a', number: 2, references: 1},
    ]);
    expect(
      projection.orderedDefinitions[0].references.map(
        reference => reference.id,
      ),
    ).toEqual(['footnote-reference-b', 'footnote-reference-b-1']);
  });

  it('reserves every heading id before footnote ids', () => {
    const projection = project(
      [
        '# Footnote note',
        '',
        '# Footnote reference note',
        '',
        'Text[^!].',
        '',
        '[^!]: Note.',
      ].join('\n'),
    );
    const definition = projection.orderedDefinitions[0];

    expect(definition.id).toBe('footnote-note-1');
    expect(definition.references[0].id).toBe('footnote-reference-note-1');
  });

  it('allocates every definition before any reference and suffixes cross-base collisions', () => {
    const projection = project(
      [
        'First[^a], second[^reference-a].',
        '',
        '[^a]: A.',
        '',
        '[^reference-a]: B.',
      ].join('\n'),
    );

    expect(
      projection.orderedDefinitions.map(definition => ({
        id: definition.id,
        references: definition.references.map(reference => reference.id),
      })),
    ).toEqual([
      {id: 'footnote-a', references: ['footnote-reference-a-1']},
      {
        id: 'footnote-reference-a',
        references: ['footnote-reference-reference-a'],
      },
    ]);
  });

  it('omits unresolved and unreferenced definitions', () => {
    const projection = project(
      ['Unresolved[^missing].', '', '[^unused]: Hidden.'].join('\n'),
    );

    expect(projection.orderedDefinitions).toEqual([]);
    expect(projection.references.size).toBe(0);
    expect(projection.definitions.size).toBe(0);
  });
});
