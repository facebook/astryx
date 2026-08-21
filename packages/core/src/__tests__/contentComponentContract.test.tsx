// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

import {docs as CitationDocs} from '../Citation/Citation.doc.mjs';
import {docs as MarkdownDocs} from '../Markdown/Markdown.doc.mjs';

// `docs` is the ComponentDoc union (single vs multi component); narrow it
// for structural access to either the top-level props or the first
// sub-component's props.
function getProps(docs: unknown): {name: string}[] {
  const doc = docs as {
    props?: {name: string}[];
    components?: {props?: {name: string}[]}[];
  };
  return doc.props || doc.components?.[0]?.props || [];
}

describe('Content Component API Contract Drift (#4163)', () => {
  it('documents Citation title, url, icon source properties', () => {
    const props = getProps(CitationDocs).map(p => p.name);
    expect(props).toContain('title');
    expect(props).toContain('url');
    expect(props).toContain('icon');
  });

  it('documents Markdown components prop', () => {
    const props = getProps(MarkdownDocs).map(p => p.name);
    expect(props).toContain('components');
  });
});
