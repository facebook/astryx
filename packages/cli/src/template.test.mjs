// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {createPageTemplate, createBlockTemplate} from './template.mjs';

describe('createPageTemplate', () => {
  it('returns the def with type "page" injected', () => {
    const t = createPageTemplate({
      name: 'Landing',
      description: 'A landing page.',
    });
    expect(t).toEqual({
      name: 'Landing',
      description: 'A landing page.',
      type: 'page',
    });
  });

  it('preserves optional fields', () => {
    const t = createPageTemplate({
      name: 'Landing',
      description: 'A landing page.',
      category: 'Marketing',
      componentsUsed: ['Button', 'Card'],
      preview: {image: './preview.png', aspectRatio: '16 / 9'},
    });
    expect(t.category).toBe('Marketing');
    expect(t.componentsUsed).toEqual(['Button', 'Card']);
    expect(t.preview).toEqual({image: './preview.png', aspectRatio: '16 / 9'});
    expect(t.type).toBe('page');
  });

  it('throws when name is missing', () => {
    expect(() => createPageTemplate({description: 'x'})).toThrow(/name/);
  });

  it('throws when description is missing', () => {
    expect(() => createPageTemplate({name: 'x'})).toThrow(/description/);
  });

  it('throws when name is an empty string', () => {
    expect(() => createPageTemplate({name: '', description: 'x'})).toThrow(
      /name/,
    );
  });

  it('hard-errors on unknown keys', () => {
    expect(() =>
      createPageTemplate({name: 'x', description: 'y', source: './x.tsx'}),
    ).toThrow();
  });

  it('rejects inline sourceFile (not supported in v1)', () => {
    expect(() =>
      createPageTemplate({name: 'x', description: 'y', sourceFile: './x.tsx'}),
    ).toThrow();
  });
});

describe('createBlockTemplate', () => {
  it('returns the def with type "block" injected', () => {
    const t = createBlockTemplate({
      name: 'Hero',
      description: 'A hero block.',
    });
    expect(t.type).toBe('block');
    expect(t.name).toBe('Hero');
  });

  it('throws when required fields are missing', () => {
    expect(() => createBlockTemplate({name: 'Hero'})).toThrow(/description/);
    expect(() => createBlockTemplate({description: 'x'})).toThrow(/name/);
  });

  it('hard-errors on unknown keys', () => {
    expect(() =>
      createBlockTemplate({name: 'x', description: 'y', bogus: 1}),
    ).toThrow();
  });
});
