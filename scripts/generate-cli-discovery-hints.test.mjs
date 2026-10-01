// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  declarationSearchTerm,
  extractComponentName,
  renderDeclarationWithGuidance,
  renderDocWithGuidance,
} from './generate-cli-discovery-hints.mjs';

const COPYRIGHT = '// Copyright (c) Meta Platforms, Inc. and affiliates.';

function docSource(name = 'Button') {
  return `${COPYRIGHT}\n\nconst anatomy = [{name: 'Label'}];\n\nexport const docs = {\n  name: '${name}',\n};\n`;
}

describe('generate-cli-discovery-hints', () => {
  it('reads the component name from the docs export, not nested data', () => {
    expect(extractComponentName(docSource())).toBe('Button');
  });

  it('adds deterministic component guidance after the copyright', () => {
    const once = renderDocWithGuidance(docSource());
    const twice = renderDocWithGuidance(once);

    expect(once).toBe(twice);
    expect(once).toContain('`npx @astryxdesign/cli search "Button"`');
    expect(once.indexOf('Generated CLI guidance')).toBeLessThan(
      once.indexOf('const anatomy'),
    );
  });

  it('updates an existing generated hint after a component rename', () => {
    const before = renderDocWithGuidance(docSource('Button'));
    const after = renderDocWithGuidance(
      before.replace("name: 'Button'", "name: 'ActionButton'"),
    );

    expect(after).toContain('search "ActionButton"');
    expect(after).not.toContain('search "Button"');
    expect(after.match(/Generated CLI guidance/g)).toHaveLength(1);
  });

  it('adds search guidance to declarations without a copyright header', () => {
    const rendered = renderDeclarationWithGuidance(
      'export interface ButtonProps {}\n',
      'Button/Button.d.ts',
    );

    expect(rendered).toMatch(/^\/\*\*/);
    expect(rendered).toContain('`npx @astryxdesign/cli search "Button"`');
  });

  it('uses exact documented names and stable package fallbacks', () => {
    const docs = new Set(['Button', 'useDevWarning']);

    expect(declarationSearchTerm('hooks/useDevWarning.d.ts', docs)).toBe(
      'useDevWarning',
    );
    expect(declarationSearchTerm('theme/syntax/index.d.ts', docs)).toBe(
      'theme',
    );
    expect(declarationSearchTerm('Button/index.d.ts', docs)).toBe('Button');
    expect(declarationSearchTerm('index.d.ts', docs)).toBe('Astryx');
    expect(declarationSearchTerm('BaseProps.d.ts', docs)).toBe('Astryx');
  });
});
