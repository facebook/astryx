// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {docs as replacementGuide} from './replace-a-core-template.doc.mjs';
import {doc as integrationSchema} from '../../../authoring/integration/integration.doc.mjs';
import {doc as templateSchema} from '../../../authoring/doctypes/template/template.doc.mjs';

function guideText() {
  return replacementGuide.sections
    .flatMap(section => section.content)
    .flatMap(block => {
      if (block.type === 'prose') return [block.text];
      if (block.type === 'code') return [block.label ?? '', block.code];
      if (block.type === 'list') return block.items;
      if (block.type === 'table') return block.rows.flat();
      return [];
    })
    .join('\n');
}

describe('integration template replacement docs', () => {
  it('documents the complete author and consumer contract', () => {
    const text = guideText();

    for (const required of [
      "replaces: 'shell-side-nav'",
      'acme-app-shell',
      'templates/acme-app-shell.doc.mjs',
      'npx astryx --json template --list --package @astryxdesign/core',
      'npx astryx template shell-side-nav --package @astryxdesign/core',
      '"@astryxdesign/cli": ">=0.7.0"',
      'replaces_needs_cli',
      'drops that template and hides your doc topics',
      'wins over one that is only installed',
      'the one listed later wins',
      "listed later in the app's package.json dependencies",
      'is safe by default',
      'missing_template_replacement_target',
      'invalid_template_replacement',
      'ambiguous_template_replacement',
    ]) {
      expect(text, required).toContain(required);
    }
  });

  it('declares a replacement on the template, never in the manifest', () => {
    expect(guideText()).not.toContain('templateReplacements');
    expect(
      integrationSchema.fields.some(field => /replac/i.test(field.name)),
    ).toBe(false);

    const field = templateSchema.fields.find(
      candidate => candidate.name === 'replaces',
    );
    expect(field).toMatchObject({type: 'string'});
    expect(field.description).toContain('Integration templates only');
    expect(field.description).toContain('--package @astryxdesign/core');
    expect(field.description).toContain('0.7.0');
  });
});
