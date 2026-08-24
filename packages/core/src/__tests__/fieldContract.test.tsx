// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

import {docs as FieldDocs} from '../Field/Field.doc.mjs';

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

describe('Field Component API Contract Drift (#4163)', () => {
  it('documents Field labelID and isGroupLabel props', () => {
    const props = getProps(FieldDocs).map(p => p.name);
    expect(props).toContain('labelID');
    expect(props).toContain('isGroupLabel');
  });
});
