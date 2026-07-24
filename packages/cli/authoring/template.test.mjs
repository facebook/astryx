// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  createPageTemplate,
  createBlockTemplate,
  TemplateEnvelopeSchema,
} from './template.mjs';

// createPageTemplate/createBlockTemplate are now stamp-only: they inject the
// `type` discriminant and return the def otherwise unchanged, with NO runtime
// validation. Validation happens at the LOAD boundary (integration template
// discovery runs the default export through TemplateEnvelopeSchema), so the
// rejection cases that used to assert factory throws now assert the envelope
// schema rejects the same shapes.

describe('createPageTemplate (stamp-only)', () => {
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

  it('does NOT validate — returns an invalid def stamped, unchanged', () => {
    const t = createPageTemplate({description: 'x'});
    expect(t.type).toBe('page');
    expect(t.name).toBeUndefined();
  });
});

describe('createBlockTemplate (stamp-only)', () => {
  it('returns the def with type "block" injected', () => {
    const t = createBlockTemplate({
      name: 'Hero',
      description: 'A hero block.',
    });
    expect(t.type).toBe('block');
    expect(t.name).toBe('Hero');
  });
});

describe('TemplateEnvelopeSchema (load-boundary validation)', () => {
  it('accepts a stamped page template', () => {
    const parsed = TemplateEnvelopeSchema.parse(
      createPageTemplate({name: 'Landing', description: 'A landing page.'}),
    );
    expect(parsed.type).toBe('page');
  });

  it('accepts a PLAIN OBJECT envelope (no factory required)', () => {
    const parsed = TemplateEnvelopeSchema.parse({
      type: 'block',
      name: 'Hero',
      description: 'A hero block.',
    });
    expect(parsed.name).toBe('Hero');
  });

  it('rejects a missing name', () => {
    expect(() =>
      TemplateEnvelopeSchema.parse({type: 'page', description: 'x'}),
    ).toThrow(/name/);
  });

  it('rejects a missing description', () => {
    expect(() =>
      TemplateEnvelopeSchema.parse({type: 'page', name: 'x'}),
    ).toThrow(/description/);
  });

  it('rejects an empty-string name', () => {
    expect(() =>
      TemplateEnvelopeSchema.parse({type: 'page', name: '', description: 'x'}),
    ).toThrow(/name/);
  });

  it('rejects a missing/invalid type', () => {
    expect(() =>
      TemplateEnvelopeSchema.parse({name: 'x', description: 'y'}),
    ).toThrow();
    expect(() =>
      TemplateEnvelopeSchema.parse({type: 'bogus', name: 'x', description: 'y'}),
    ).toThrow();
  });

  it('rejects unknown keys (strict)', () => {
    expect(() =>
      TemplateEnvelopeSchema.parse({
        type: 'page',
        name: 'x',
        description: 'y',
        source: './x.tsx',
      }),
    ).toThrow();
  });

  it('rejects inline sourceFile (not supported in v1)', () => {
    expect(() =>
      TemplateEnvelopeSchema.parse({
        type: 'page',
        name: 'x',
        description: 'y',
        sourceFile: './x.tsx',
      }),
    ).toThrow();
  });
});
