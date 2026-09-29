// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  createIncrementalState,
  parseMarkdown,
  parseMarkdownIncremental,
  trimStreamingArtifacts,
} from './parser';

describe('incremental Markdown footnotes', () => {
  it('converges with a full parse across every character boundary', () => {
    const source = [
      'Before[^one] and again[^one].',
      '',
      '[^one]: First line.',
      '  continuation',
      '',
      '  second paragraph',
      '',
      'After.',
    ].join('\n');
    const state = createIncrementalState<false, true>();
    let actual = parseMarkdownIncremental('', state, {
      footnotes: 'github',
    });

    for (let end = 1; end <= source.length; end++) {
      actual = parseMarkdownIncremental(source.slice(0, end), state, {
        footnotes: 'github',
      });
      expect(Array.isArray(actual)).toBe(true);
    }

    expect(actual).toEqual(parseMarkdown(source, {footnotes: 'github'}));
  });

  it('keeps indented tail definitions aligned with a full parse', () => {
    const source = 'Paragraph[^a].\n\n [^a]: Definition.';
    const actual = parseMarkdownIncremental(
      source,
      createIncrementalState<false, true>(),
      {footnotes: 'github', isFinal: true},
    );

    expect(actual).toEqual(parseMarkdown(source, {footnotes: 'github'}));
    expect(actual.at(-1)?.type).toBe('footnoteDefinition');
  });

  it('keeps complete footnote markers visible in the streaming tail', () => {
    const definition = 'Body[^a].\n\n[^a]: Definition.';
    expect(trimStreamingArtifacts(definition, {footnotes: 'github'})).toBe(
      definition,
    );
    expect(
      trimStreamingArtifacts('Body[^a].\n\n[^a', {footnotes: 'github'}),
    ).toBe('Body[^a].\n\n');
  });

  it('does not promote a streamed list-item declaration to document scope', () => {
    const source = [
      'Reference[^nested].',
      '',
      '- list item',
      '',
      '  [^nested]: Nested declaration.',
      '',
      'Tail.',
    ].join('\n');
    const state = createIncrementalState<false, true>();
    let actual = parseMarkdownIncremental('', state, {footnotes: 'github'});

    for (let end = 1; end <= source.length; end++) {
      actual = parseMarkdownIncremental(source.slice(0, end), state, {
        footnotes: 'github',
      });
    }

    expect(actual).toEqual(parseMarkdown(source, {footnotes: 'github'}));
    expect(JSON.stringify(actual)).not.toContain('"type":"footnoteReference"');
  });

  it('invalidates settled references when a later definition arrives', () => {
    const state = createIncrementalState<false, true>();
    const before = 'Settled[^later].\n\nTail';
    const unresolved = parseMarkdownIncremental(before, state, {
      footnotes: 'github',
    });
    expect(unresolved[0]).toEqual({
      type: 'paragraph',
      children: [{type: 'text', content: 'Settled[^later].'}],
    });

    const resolved = parseMarkdownIncremental(
      `${before}\n\n[^later]: Arrived.`,
      state,
      {footnotes: 'github'},
    );
    expect(resolved).toEqual(
      parseMarkdown(`${before}\n\n[^later]: Arrived.`, {
        footnotes: 'github',
      }),
    );
    expect(resolved[0]).toMatchObject({
      children: [
        {type: 'text', content: 'Settled'},
        {type: 'footnoteReference', identifier: 'later'},
        {type: 'text', content: '.'},
      ],
    });
  });

  it('keeps an open multiline definition in the mutable suffix', () => {
    const state = createIncrementalState<false, true>();
    parseMarkdownIncremental(
      'Intro.\n\n[^note]: First.\n\n  second paragraph',
      state,
      {footnotes: 'github'},
    );

    expect(state.settledText).toBe('Intro.');
    expect(state.settledBlocks).toEqual([
      {type: 'paragraph', children: [{type: 'text', content: 'Intro.'}]},
    ]);
  });

  it('invalidates cached nodes when the footnote mode changes', () => {
    const state = createIncrementalState();
    const source = 'Text[^a].\n\n[^a]: Note.\n\nTail';
    const literal = parseMarkdownIncremental(source, state);
    expect(literal[0]).toMatchObject({
      children: [{type: 'text', content: 'Text[^a].'}],
    });

    const enabledState = state as unknown as ReturnType<
      typeof createIncrementalState<false, true>
    >;
    const enabled = parseMarkdownIncremental(source, enabledState, {
      footnotes: 'github',
    });
    expect(enabled).toEqual(parseMarkdown(source, {footnotes: 'github'}));
  });
});
