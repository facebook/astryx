// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

import {docs as CodeBlockDocs} from '../CodeBlock/CodeBlock.doc.mjs';
import {docs as StackDocs} from '../Stack/Stack.doc.mjs';
import {docs as ToolbarDocs} from '../Toolbar/Toolbar.doc.mjs';

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

describe('Structural Component API Contract Drift (#4163)', () => {
  it('documents CodeBlock highlightMode prop', () => {
    const props = getProps(CodeBlockDocs).map(p => p.name);
    expect(props).toContain('highlightMode');
  });

  it('documents Toolbar dividers prop', () => {
    const props = getProps(ToolbarDocs).map(p => p.name);
    expect(props).toContain('dividers');
  });

  it('documents Stack direction and base props', () => {
    const props = getProps(StackDocs).map(p => p.name);
    expect(props).toContain('direction');
    expect(props).toContain('gap');
    expect(props).toContain('padding');
    expect(props).toContain('width');
    expect(props).toContain('height');
  });
});
