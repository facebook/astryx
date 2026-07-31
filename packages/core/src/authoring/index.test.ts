// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  createIntegration,
  createPageTemplate,
  createBlockTemplate,
  createComponentDoc,
  createFunctionDoc,
  createDoc,
} from './index';

describe('authoring factories', () => {
  it('createIntegration returns its argument unchanged', () => {
    const input = {components: './c', templates: './t'};
    expect(createIntegration(input)).toBe(input);
  });

  it('createPageTemplate / createBlockTemplate stamp the template type', () => {
    expect(createPageTemplate({name: 'P', description: 'd'}).type).toBe('page');
    expect(createBlockTemplate({name: 'B', description: 'd'}).type).toBe(
      'block',
    );
  });

  it('createPageTemplate preserves authored fields', () => {
    const t = createPageTemplate({name: 'P', description: 'd', category: 'x'});
    expect(t).toMatchObject({
      name: 'P',
      description: 'd',
      category: 'x',
      type: 'page',
    });
  });

  it('doc factories stamp the doc kind', () => {
    expect(createComponentDoc({name: 'Button', props: []}).type).toBe(
      'component',
    );
    expect(
      createFunctionDoc({name: 'useX', params: [], returns: []}).type,
    ).toBe('function');
    expect(createDoc({name: 'Topic'}).type).toBe('generic');
  });

  it('doc factories do not mutate the input object', () => {
    const input = {name: 'Button', props: []};
    const out = createComponentDoc(input);
    expect(out).not.toBe(input);
    expect(input).not.toHaveProperty('type');
  });
});
