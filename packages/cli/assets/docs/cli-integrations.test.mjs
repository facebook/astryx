// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {docs as integrationGuide} from './cli-integrations.doc.mjs';
import {doc as integrationSchema} from '../../authoring/integration/integration.doc.mjs';

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
      'templateReplacements',
      'acme-app-shell',
      'shell-side-nav',
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
      'Without `templateReplacements`',
      '@astryxdesign/cli >=0.5.3',
      '@astryxdesign/cli >=0.7.0',
      '`template.list` JSON response',
      '`__proto__` is unsupported and reserved',
      "`{'__proto__': 'shell-side-nav'}` literal",
      'special prototype-setter form',
      'does not change the prototype',
      'creates no own key',
      'computed-property syntax or deserialization are rejected',
    ]) {
      expect(text, required).toContain(required);
    }
  });

  it('keeps the generated schema doc aligned with the public type', () => {
    const field = integrationSchema.fields.find(
      candidate => candidate.name === 'templateReplacements',
    );

    expect(field).toMatchObject({
      type: 'Record<string, string>',
      example: "{'acme-app-shell': 'shell-side-nav'}",
    });
    expect(field.description).toContain('exact integration template id');
    expect(field.description).toContain('--package @astryxdesign/core');
    expect(field.description).toContain('fail closed');
    expect(field.description).toContain(
      'explicit configuration wins over autolinking',
    );
    expect(field.description).toContain('CLIs from 0.5.3 onward');
    expect(field.description).toContain('Versions 0.5.2 and earlier');
    expect(field.description).toContain(
      'Replacement selection starts in 0.7.0',
    );
    expect(field.description).toContain('`__proto__` is unsupported');
    expect(field.description).toContain('special prototype-setter form');
    expect(field.description).toContain('does not change the prototype');
    expect(field.description).toContain('creates no own key');
    expect(field.description).toContain(
      'computed-property syntax or deserialization are rejected',
    );
  });
});
