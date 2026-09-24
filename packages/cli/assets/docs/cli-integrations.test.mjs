// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {docs as integrationGuide} from './cli-integrations.doc.mjs';
import {doc as integrationSchema} from '../../authoring/integration/integration.doc.mjs';
import {doc as templateSchema} from '../../authoring/doctypes/template/template.doc.mjs';

function guideText() {
  return integrationGuide.sections
    .flatMap(section => section.content)
    .flatMap(block => {
      if (block.type === 'prose') return [block.text];
      if (block.type === 'code') return [block.label ?? '', block.code];
      if (block.type === 'list') return block.items;
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
      'astryx --json template --list --package @astryxdesign/core',
      'astryx template shell-side-nav --package @astryxdesign/core',
      'astryx template acme-app-shell --package @acme/navigation',
      'templates/acme-app-shell.template.mjs',
      'AcmeSideNav',
      'AcmeTopNav',
      '<Card>Product content</Card>',
      'fail closed',
      'configured later wins',
      'wins over an autolinked one',
      'listed later in package.json dependencies',
      'valid siblings',
      'Without `replaces`',
      '@astryxdesign/cli >=0.7.0',
      'templates and doc topics are withheld',
      '`template.list` JSON response',
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
