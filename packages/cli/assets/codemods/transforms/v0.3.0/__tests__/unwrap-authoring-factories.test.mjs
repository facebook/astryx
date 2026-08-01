// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source, path = 'test.ts') {
  const {default: transform} = await import('../unwrap-authoring-factories.mjs');
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const result = transform({source, path}, api);
  return result ?? source;
}

describe('unwrap-authoring-factories', () => {
  it('unwraps createConfig without stamping a type, dropping the import', async () => {
    const input = `import {createConfig} from '@astryxdesign/core/config';
export default createConfig({integrations: ['@acme/widgets']});
`;
    const output = await applyTransform(input);
    expect(output).not.toContain('createConfig');
    expect(output).toContain("export default {");
    expect(output).toContain("integrations: ['@acme/widgets']");
    expect(output).not.toContain('type:');
  });

  it('unwraps createIntegration without a discriminant', async () => {
    const input = `import {createIntegration} from '@astryxdesign/core/authoring';
export default createIntegration({components: './src'});
`;
    const output = await applyTransform(input);
    expect(output).not.toContain('createIntegration');
    expect(output).toContain("components: './src'");
    expect(output).not.toContain('type:');
  });

  const DOC_CASES = [
    ['createComponentDoc', 'component'],
    ['createFunctionDoc', 'function'],
    ['createDoc', 'generic'],
    ['createPageTemplate', 'page'],
    ['createBlockTemplate', 'block'],
    ['createCodemod', 'code'],
    ['createConfigCodemod', 'config'],
  ];

  for (const [factory, kind] of DOC_CASES) {
    it(`${factory} stamps type: '${kind}' and drops the import`, async () => {
      const input = `import {${factory}} from '@astryxdesign/core/authoring';
export default ${factory}({name: 'X', description: 'd'});
`;
      const output = await applyTransform(input);
      expect(output).not.toContain(factory);
      expect(output).toContain(`type: '${kind}'`);
      expect(output).toContain("name: 'X'");
    });
  }

  it('follows an import alias', async () => {
    const input = `import {createDoc as mkDoc} from '@astryxdesign/cli/doc';
export default mkDoc({name: 'Theming', description: 'How theming works.'});
`;
    const output = await applyTransform(input);
    expect(output).not.toContain('mkDoc');
    expect(output).not.toContain('createDoc');
    expect(output).toContain("type: 'generic'");
  });

  it('keeps sibling type imports, removing only the factory specifier', async () => {
    const input = `import {createComponentDoc, type ComponentDoc} from '@astryxdesign/core/authoring';
const doc: ComponentDoc = createComponentDoc({name: 'Widget', props: []});
export default doc;
`;
    const output = await applyTransform(input);
    expect(output).not.toContain('createComponentDoc');
    expect(output).toContain('ComponentDoc');
    expect(output).toContain("from '@astryxdesign/core/authoring'");
    expect(output).toContain("type: 'component'");
  });

  it('wraps a non-object argument with a spread to preserve the stamp', async () => {
    const input = `import {createComponentDoc} from '@astryxdesign/core/authoring';
export default createComponentDoc(baseDoc);
`;
    const output = await applyTransform(input);
    expect(output).not.toContain('createComponentDoc');
    expect(output).toContain('...baseDoc');
    expect(output).toContain("type: 'component'");
  });

  it('overwrites an existing type property with the correct discriminant', async () => {
    const input = `import {createComponentDoc} from '@astryxdesign/core/authoring';
export default createComponentDoc({type: 'wrong', name: 'Widget', props: []});
`;
    const output = await applyTransform(input);
    expect(output).toContain("type: 'component'");
    expect(output).not.toContain("type: 'wrong'");
  });

  it('is a no-op when no authoring factory is imported', async () => {
    const input = `import {Button} from '@astryxdesign/core';
export default Button;
`;
    const {default: transform} = await import(
      '../unwrap-authoring-factories.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const result = transform({source: input, path: 'test.ts'}, api);
    expect(result).toBeUndefined();
  });
});
