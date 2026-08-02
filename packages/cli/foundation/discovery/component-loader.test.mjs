// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for mergeTranslation — overlaying translation docs onto base docs.
 *
 * Covers the hook param/return description merge (HookTranslationDoc) added so
 * dense translations of hook params/returns are actually consumed, plus a
 * regression guard for the existing component prop-description merge.
 */

import {describe, it, expect} from 'vitest';
import {mergeTranslation} from './component-loader.mjs';

/** Minimal HookDoc-shaped fixture with params + returns. */
function hookDocs() {
  return {
    name: 'useFocusTrap',
    usage: {description: 'English description.'},
    params: [
      {name: 'options', type: 'UseFocusTrapOptions', description: 'Config object.', required: true},
      {name: 'options.isActive', type: 'boolean', description: 'Whether active.', required: true},
      {name: 'options.onEscape', type: '() => void', description: 'Escape callback.', required: false},
    ],
    returns: [
      {name: 'containerRef', type: 'React.RefObject<HTMLElement | null>', description: 'Ref to attach.'},
      {name: 'focusFirst', type: '() => void', description: 'Focuses first element.'},
    ],
  };
}

describe('mergeTranslation — hook param/return descriptions', () => {
  it('overrides param and return descriptions by name, preserving other fields', () => {
    const merged = mergeTranslation(hookDocs(), {
      paramDescriptions: {
        options: 'Cfg.',
        'options.onEscape': 'Esc cb.',
      },
      returnDescriptions: {
        containerRef: 'Attach ref.',
      },
    });

    // Translated params get the compressed description.
    const options = merged.params.find(p => p.name === 'options');
    expect(options.description).toBe('Cfg.');
    expect(options.type).toBe('UseFocusTrapOptions');
    expect(options.required).toBe(true);

    // Untranslated param keeps original description.
    const isActive = merged.params.find(p => p.name === 'options.isActive');
    expect(isActive.description).toBe('Whether active.');
    expect(isActive.required).toBe(true);

    // Translated return.
    const containerRef = merged.returns.find(r => r.name === 'containerRef');
    expect(containerRef.description).toBe('Attach ref.');
    expect(containerRef.type).toBe('React.RefObject<HTMLElement | null>');

    // Untranslated return unchanged.
    const focusFirst = merged.returns.find(r => r.name === 'focusFirst');
    expect(focusFirst.description).toBe('Focuses first element.');
  });

  it('overrides a nested (dotted) param name correctly', () => {
    const merged = mergeTranslation(hookDocs(), {
      paramDescriptions: {'options.isActive': 'Active?'},
    });

    const isActive = merged.params.find(p => p.name === 'options.isActive');
    expect(isActive.description).toBe('Active?');
    expect(isActive.type).toBe('boolean');

    // Sibling params untouched.
    expect(merged.params.find(p => p.name === 'options').description).toBe('Config object.');
  });

  it('leaves params/returns untouched when translation has no param/return descriptions', () => {
    const base = hookDocs();
    const merged = mergeTranslation(base, {usage: {description: 'Dense desc.'}});

    expect(merged.params).toEqual(base.params);
    expect(merged.returns).toEqual(base.returns);
    expect(merged.usage.description).toBe('Dense desc.');
  });
});

describe('mergeTranslation — component prop descriptions (regression)', () => {
  it('overrides prop descriptions by name, leaving others unchanged', () => {
    const docs = {
      name: 'Button',
      usage: {description: 'English.'},
      props: [
        {name: 'variant', type: 'string', description: 'The variant.'},
        {name: 'disabled', type: 'boolean', description: 'Disabled state.'},
      ],
    };

    const merged = mergeTranslation(docs, {
      usage: {description: 'Dense.'},
      propDescriptions: {variant: 'Vrnt.'},
    });

    expect(merged.usage.description).toBe('Dense.');
    expect(merged.props.find(p => p.name === 'variant').description).toBe('Vrnt.');
    expect(merged.props.find(p => p.name === 'disabled').description).toBe('Disabled state.');
  });
});
