// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for `parseTemplate` — the load-boundary validator run
 * against a `.template.*` module's default export during template discovery.
 * Zod is sealed inside the parser; authors write a plain object stamped with a
 * `type` of `'page'` or `'block'`. Accept/reject set matches the old
 * `TemplateEnvelopeSchema`.
 */

import {describe, it, expect} from 'vitest';
import {parseTemplate} from './parse.mjs';

/** Run parseTemplate and return the thrown message (asserting it throws). */
function reason(value, label = 'template') {
  try {
    parseTemplate(value, label);
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
  throw new Error('expected parseTemplate to throw');
}

describe('parseTemplate (load boundary)', () => {
  it('accepts a stamped page template', () => {
    const parsed = parseTemplate({
      type: 'page',
      name: 'Landing',
      description: 'A landing page.',
    });
    expect(parsed.type).toBe('page');
  });

  it('accepts a block template with optional fields', () => {
    const parsed = parseTemplate({
      type: 'block',
      name: 'Hero',
      description: 'A hero block.',
      category: 'Marketing',
      componentsUsed: ['Button', 'Card'],
      preview: {image: './preview.png', aspectRatio: '16 / 9'},
    });
    expect(parsed.name).toBe('Hero');
    expect(parsed.preview).toEqual({image: './preview.png', aspectRatio: '16 / 9'});
  });

  it('rejects a missing name', () => {
    expect(reason({type: 'page', description: 'x'})).toContain('name');
  });

  it('rejects a missing description', () => {
    expect(reason({type: 'page', name: 'x'})).toContain('description');
  });

  it('rejects an empty-string name', () => {
    expect(reason({type: 'page', name: '', description: 'x'})).toContain('name');
  });

  it('rejects a missing/invalid type', () => {
    expect(() => parseTemplate({name: 'x', description: 'y'})).toThrow();
    expect(() =>
      parseTemplate({type: 'bogus', name: 'x', description: 'y'}),
    ).toThrow();
  });

  it('rejects unknown keys (strict)', () => {
    expect(() =>
      parseTemplate({
        type: 'page',
        name: 'x',
        description: 'y',
        source: './x.tsx',
      }),
    ).toThrow();
  });

  it('rejects inline sourceFile (not supported in v1)', () => {
    expect(() =>
      parseTemplate({
        type: 'page',
        name: 'x',
        description: 'y',
        sourceFile: './x.tsx',
      }),
    ).toThrow();
  });
});
