// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  integrationAdd,
  integrationAddAgentDoc,
  integrationAddCodemod,
  integrationAddComponent,
  integrationAddDoc,
  integrationAddTemplate,
} from './add-contribution.mjs';
import {validateLocalIntegration} from './validate-integration.mjs';

let tmpDir;

/**
 * @param {{manifest?: string, files?: string[], includeFiles?: boolean, name?: string, exports?: unknown}} [opts]
 */
function setup({
  manifest = 'export default {};\n',
  files = ['dist'],
  includeFiles = true,
  name = '@acme/integration',
  exports,
} = {}) {
  /** @type {{name: string, version: string, files?: string[], exports?: unknown}} */
  const pkg = {name, version: '1.0.0'};
  if (includeFiles) pkg.files = files;
  if (exports !== undefined) pkg.exports = exports;
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    `${JSON.stringify(pkg, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(tmpDir, 'astryx.integration.mjs'), manifest);
}

/** Create a bare package dir with no manifest (first-add scenario). */
function setupBare({files, includeFiles = true} = {}) {
  /** @type {{name: string, version: string, files?: string[]}} */
  const pkg = {name: '@acme/integration', version: '1.0.0'};
  if (includeFiles) pkg.files = files ?? ['dist'];
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    `${JSON.stringify(pkg, null, 2)}\n`,
  );
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-add-contrib-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

// ── COMPONENT ───────────────────────────────────────────────────────

describe('integrationAdd component', () => {
  it('writes doc + source, patches root, and appends to files array', async () => {
    setup();
    const result = await integrationAdd('component', 'MyWidget', {cwd: tmpDir});

    expect(result.type).toBe('integration.add');
    expect(result.data.kind).toBe('component');
    expect(result.data.name).toBe('MyWidget');
    expect(result.data.root).toEqual({path: './components', created: true});
    expect(result.data.written).toBe(true);
    expect(result.data.dryRun).toBe(false);
    expect(result.data.files).toContain('components/MyWidget.doc.mjs');
    expect(result.data.files).toContain('components/MyWidget.tsx');
    expect(result.data.files).toContain('astryx.integration.mjs');

    // Doc file is valid
    const doc = fs.readFileSync(
      path.join(tmpDir, 'components/MyWidget.doc.mjs'),
      'utf-8',
    );
    expect(doc).toContain("type: 'component'");
    expect(doc).toContain("name: 'MyWidget'");
    expect(doc).toContain('props: []');

    // Source file exists
    expect(fs.existsSync(path.join(tmpDir, 'components/MyWidget.tsx'))).toBe(
      true,
    );

    // Manifest updated
    const manifestContent = fs.readFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'utf-8',
    );
    expect(manifestContent).toContain("components: './components'");

    // package.json files updated
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.files).toContain('components');
    expect(pkg.files).toContain('astryx.integration.mjs');

    // Doctor validates cleanly
    const validation = await validateLocalIntegration(tmpDir);
    const componentErrors = validation.issues.filter(
      i => i.code === 'invalid_component',
    );
    expect(componentErrors).toEqual([]);
  });

  it('publishes and documents the generated component in an existing exports map', async () => {
    setup({exports: {'.': './index.mjs'}});

    await integrationAddComponent('MyWidget', {cwd: tmpDir});

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.exports).toEqual({
      '.': './index.mjs',
      './components/MyWidget.tsx': './components/MyWidget.tsx',
    });
    expect(
      fs.readFileSync(
        path.join(tmpDir, 'components/MyWidget.doc.mjs'),
        'utf-8',
      ),
    ).toContain('import: "@acme/integration/components/MyWidget.tsx"');
  });

  it('does not create exports when the package has no exports map', async () => {
    setup();

    await integrationAddComponent('MyWidget', {cwd: tmpDir});

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.exports).toBeUndefined();
  });

  it('refuses an existing conflicting component export before writing files', async () => {
    setup({
      exports: {
        '.': './index.mjs',
        './components/MyWidget.tsx': './different.tsx',
      },
    });

    await expect(
      integrationAddComponent('MyWidget', {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_INTEGRATION_EXPORT_CONFLICT'});
    expect(fs.existsSync(path.join(tmpDir, 'components'))).toBe(false);
  });

  it('dry-runs without writing', async () => {
    setup();
    const result = await integrationAdd('component', 'MyWidget', {
      cwd: tmpDir,
      dryRun: true,
    });
    expect(result.data.written).toBe(false);
    expect(result.data.dryRun).toBe(true);
    expect(result.data.root).toEqual({path: './components', created: true});
    expect(fs.existsSync(path.join(tmpDir, 'components'))).toBe(false);
  });

  it('creates the manifest on first add', async () => {
    setupBare();
    const result = await integrationAdd('component', 'MyWidget', {cwd: tmpDir});
    expect(result.data.root.created).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'astryx.integration.mjs'))).toBe(
      true,
    );
  });

  it('refuses to overwrite an existing doc file', async () => {
    setup();
    fs.mkdirSync(path.join(tmpDir, 'components'), {recursive: true});
    fs.writeFileSync(
      path.join(tmpDir, 'components/MyWidget.doc.mjs'),
      'existing',
    );
    await expect(
      integrationAdd('component', 'MyWidget', {cwd: tmpDir}),
    ).rejects.toThrow(/Refusing to overwrite/);
  });

  it('refuses to overwrite an existing source file', async () => {
    setup();
    fs.mkdirSync(path.join(tmpDir, 'components'), {recursive: true});
    fs.writeFileSync(path.join(tmpDir, 'components/MyWidget.tsx'), 'existing');
    await expect(
      integrationAdd('component', 'MyWidget', {cwd: tmpDir}),
    ).rejects.toThrow(/Refusing to overwrite/);
  });

  it('rejects a lowercase name', async () => {
    setup();
    await expect(
      integrationAdd('component', 'myWidget', {cwd: tmpDir}),
    ).rejects.toThrow(/PascalCase/);
  });

  // ── MUTATION TESTS: same-stem pair ──────────────────────────────

  it('mutation: doc alone (no .tsx) causes a validate-contributions error', async () => {
    setup();
    await integrationAdd('component', 'MyWidget', {cwd: tmpDir});
    // Remove the .tsx — keep the doc
    fs.rmSync(path.join(tmpDir, 'components/MyWidget.tsx'));
    const validation = await validateLocalIntegration(tmpDir);
    const componentErrors = validation.issues.filter(
      i => i.code === 'invalid_component',
    );
    expect(componentErrors.length).toBeGreaterThan(0);
  });

  it('mutation: source alone (no .doc) is invisible to discovery', async () => {
    setup();
    await integrationAdd('component', 'MyWidget', {cwd: tmpDir});
    // Remove the doc — keep the tsx
    fs.rmSync(path.join(tmpDir, 'components/MyWidget.doc.mjs'));
    const validation = await validateLocalIntegration(tmpDir);
    // No error because the component is simply invisible — it was never discovered
    const componentErrors = validation.issues.filter(
      i => i.code === 'invalid_component',
    );
    expect(componentErrors).toEqual([]);
    expect(
      validation.issues.some(
        issue => issue.code === 'source_without_component_doc',
      ),
    ).toBe(true);
    // The component is not discoverable without metadata.
    const {discoverIntegrationComponents} =
      await import('../../foundation/discovery/component-discovery.mjs');
    const {loadManifestObject} =
      await import('../../foundation/integrations/integrations.mjs');
    const {assertWithin} = await import('../../foundation/fs/path-safety.mjs');
    const manifest = await loadManifestObject(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'test',
      {fresh: true},
    );
    const compsRoot = assertWithin(manifest.components, tmpDir, {
      label: 'test',
    });
    const records = discoverIntegrationComponents({
      name: '@acme/integration',
      components: compsRoot,
      __spec: '@acme/integration',
      __packageDir: tmpDir,
      __manifestFile: path.join(tmpDir, 'astryx.integration.mjs'),
    });
    expect(records.some(r => r.name === 'MyWidget')).toBe(false);
  });
});

// ── FILES ALLOWLIST MUTATION ────────────────────────────────────────

describe('package.json files allowlist', () => {
  it('never creates a files field when absent', async () => {
    setup({includeFiles: false});
    await integrationAdd('component', 'MyWidget', {cwd: tmpDir});
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.files).toBeUndefined();
  });

  it('appends root and manifest to existing files array', async () => {
    setup({files: ['dist']});
    await integrationAdd('component', 'MyWidget', {cwd: tmpDir});
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.files).toEqual(['dist', 'components', 'astryx.integration.mjs']);
  });

  it('does not duplicate entries already in files', async () => {
    setup({files: ['dist', 'components', 'astryx.integration.mjs']});
    await integrationAdd('component', 'MyWidget', {cwd: tmpDir});
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.files).toEqual(['dist', 'components', 'astryx.integration.mjs']);
  });
});

// ── DOC TOPIC ───────────────────────────────────────────────────────

describe('integrationAdd doc', () => {
  it('writes a valid generic topic with receipt', async () => {
    setup();
    const result = await integrationAdd('doc', 'my-guide', {cwd: tmpDir});

    expect(result.data.kind).toBe('doc');
    expect(result.data.name).toBe('my-guide');
    expect(result.data.root).toEqual({path: './docs', created: true});
    expect(result.data.files).toContain('docs/my-guide.doc.mjs');

    const doc = fs.readFileSync(
      path.join(tmpDir, 'docs/my-guide.doc.mjs'),
      'utf-8',
    );
    expect(doc).toContain("type: 'generic'");
    expect(doc).toContain("name: 'my-guide'");

    const validation = await validateLocalIntegration(tmpDir);
    const docErrors = validation.issues.filter(i => i.code === 'invalid_doc');
    expect(docErrors).toEqual([]);
  });

  it('includes replaces in the generated doc', async () => {
    setup();
    const result = await integrationAdd('doc', 'my-tokens', {
      cwd: tmpDir,
      replaces: 'tokens',
    });
    const doc = fs.readFileSync(
      path.join(tmpDir, 'docs/my-tokens.doc.mjs'),
      'utf-8',
    );
    expect(doc).toContain("replaces: 'tokens'");
    expect(doc).not.toContain('extends:');
  });

  it('includes extends in the generated doc', async () => {
    setup();
    const result = await integrationAdd('doc', 'extra-tokens', {
      cwd: tmpDir,
      extends: 'tokens',
    });
    const doc = fs.readFileSync(
      path.join(tmpDir, 'docs/extra-tokens.doc.mjs'),
      'utf-8',
    );
    expect(doc).toContain("extends: 'tokens'");
    expect(doc).not.toContain('replaces:');
  });

  it('rejects replaces + extends together', async () => {
    setup();
    await expect(
      integrationAdd('doc', 'my-tokens', {
        cwd: tmpDir,
        replaces: 'tokens',
        extends: 'tokens',
      }),
    ).rejects.toThrow(/not both/);
  });

  it.each([
    ['my--guide', 'My Guide'],
    ['a-_-b', 'A B'],
    ['___', '___'],
  ])(
    'accepts topic name %s without crashing title generation',
    async (name, title) => {
      setup();
      await integrationAdd('doc', name, {cwd: tmpDir});
      expect(
        fs.readFileSync(path.join(tmpDir, 'docs', `${name}.doc.mjs`), 'utf-8'),
      ).toContain(`title: '${title}'`);
    },
  );

  it('rejects an unsafe replacement topic before writing source', async () => {
    setup();
    await expect(
      integrationAdd('doc', 'my-guide', {
        cwd: tmpDir,
        replaces: "topic'; process.exit(1); //",
      }),
    ).rejects.toThrow(/--replaces/);
    expect(fs.existsSync(path.join(tmpDir, 'docs'))).toBe(false);
  });
});

// ── TEMPLATE ────────────────────────────────────────────────────────

describe('integrationAdd template', () => {
  it('writes a valid page template with receipt', async () => {
    setup();
    const result = await integrationAdd('template', 'my-widget', {
      cwd: tmpDir,
    });

    expect(result.data.kind).toBe('template');
    expect(result.data.name).toBe('my-widget');
    expect(result.data.root).toEqual({path: './templates', created: true});
    expect(result.data.files).toContain('templates/my-widget.template.mjs');
    expect(result.data.files).toContain('templates/my-widget.tsx');

    const spec = fs.readFileSync(
      path.join(tmpDir, 'templates/my-widget.template.mjs'),
      'utf-8',
    );
    expect(spec).toContain("type: 'page'");
    expect(spec).toContain("name: 'my-widget'");

    expect(fs.existsSync(path.join(tmpDir, 'templates/my-widget.tsx'))).toBe(
      true,
    );

    const manifest = fs.readFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'utf-8',
    );
    expect(manifest).toContain("templates: './templates'");
  });

  it('publishes generated template source in an existing exports map', async () => {
    setup({exports: './index.mjs'});

    await integrationAddTemplate('my-widget', {cwd: tmpDir, type: 'page'});

    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.exports).toEqual({
      '.': './index.mjs',
      './templates/my-widget.tsx': './templates/my-widget.tsx',
    });
  });

  it('supports block type', async () => {
    setup();
    const result = await integrationAdd('template', 'my-card', {
      cwd: tmpDir,
      templateType: 'block',
    });
    const spec = fs.readFileSync(
      path.join(tmpDir, 'templates/my-card.template.mjs'),
      'utf-8',
    );
    expect(spec).toContain("type: 'block'");
  });

  it('rejects an invalid template type', async () => {
    setup();
    await expect(
      integrationAdd('template', 'my-widget', {
        cwd: tmpDir,
        templateType: /** @type {any} */ ('invalid'),
      }),
    ).rejects.toThrow(/must be "page" or "block"/);
  });
});

// ── CODEMOD ─────────────────────────────────────────────────────────

describe('integrationAdd codemod', () => {
  it('writes a valid identity codemod under the version folder', async () => {
    setup();
    const result = await integrationAdd('codemod', 'rename-widget', {
      cwd: tmpDir,
      to: '1.0.0',
    });

    expect(result.data.kind).toBe('codemod');
    expect(result.data.name).toBe('rename-widget');
    expect(result.data.root).toEqual({path: './codemods', created: true});
    expect(result.data.files).toContain('codemods/1.0.0/rename-widget.mjs');

    const codemod = fs.readFileSync(
      path.join(tmpDir, 'codemods/1.0.0/rename-widget.mjs'),
      'utf-8',
    );
    expect(codemod).toContain("type: 'code'");
    expect(codemod).toContain('transform(file, api)');
    expect(codemod).toContain('return file.source');

    const manifest = fs.readFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'utf-8',
    );
    expect(manifest).toContain("codemods: './codemods'");
  });

  it('requires --to as valid semver', async () => {
    setup();
    await expect(
      integrationAdd('codemod', 'rename-widget', {cwd: tmpDir}),
    ).rejects.toThrow(/--to is required/);
    await expect(
      integrationAdd('codemod', 'rename-widget', {
        cwd: tmpDir,
        to: 'v1',
      }),
    ).rejects.toThrow(/exact semver/);
  });

  it('accepts an exact semver prerelease target', async () => {
    setup();
    const result = await integrationAdd('codemod', 'rename-widget', {
      cwd: tmpDir,
      to: '1.0.0-beta.1',
    });
    expect(result.data.files).toContain(
      'codemods/1.0.0-beta.1/rename-widget.mjs',
    );
  });
});

// ── AGENT-DOC ───────────────────────────────────────────────────────

describe('integrationAdd agent-doc', () => {
  it('adds a line to agentDocs.append and verifies', async () => {
    setup();
    const result = await integrationAdd(
      'agent-doc',
      'This integration provides MyWidget.',
      {cwd: tmpDir},
    );

    expect(result.data.kind).toBe('agent-doc');
    expect(result.data.name).toBe('This integration provides MyWidget.');
    expect(result.data.root).toBeNull();
    expect(result.data.files).toContain('astryx.integration.mjs');

    const manifest = fs.readFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'utf-8',
    );
    expect(manifest).toContain('This integration provides MyWidget.');
    expect(manifest).toContain('agentDocs');
    expect(manifest).toContain('append');
  });

  it('converges: adding the same line twice is idempotent', async () => {
    setup();
    await integrationAdd('agent-doc', 'A line.', {cwd: tmpDir});
    const result = await integrationAdd('agent-doc', 'A line.', {
      cwd: tmpDir,
    });
    expect(result.data.written).toBe(false);
    expect(result.data.files).toEqual([]);
  });

  it('appends to existing lines', async () => {
    setup({
      manifest:
        "export default {\n  agentDocs: {\n    append: ['Line one.'],\n  },\n};\n",
    });
    await integrationAdd('agent-doc', 'Line two.', {cwd: tmpDir});
    const manifest = fs.readFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'utf-8',
    );
    expect(manifest).toContain('Line one.');
    expect(manifest).toContain('Line two.');
  });

  it('creates the manifest when none exists', async () => {
    setupBare();
    await integrationAdd('agent-doc', 'A line.', {cwd: tmpDir});
    expect(fs.existsSync(path.join(tmpDir, 'astryx.integration.mjs'))).toBe(
      true,
    );
    const manifest = fs.readFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'utf-8',
    );
    expect(manifest).toContain('A line.');
  });

  it('rejects a blank line', async () => {
    setup();
    await expect(
      integrationAdd('agent-doc', '   ', {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  });

  it('adds the manifest to an existing package files allowlist', async () => {
    setup({files: ['dist']});
    await integrationAdd('agent-doc', 'A line.', {cwd: tmpDir});
    const pkg = JSON.parse(
      fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'),
    );
    expect(pkg.files).toEqual(['dist', 'astryx.integration.mjs']);
  });

  it('refuses invalid existing agent-doc state instead of deleting it', async () => {
    const manifest =
      "export default {agentDocs: {append: [' line with spaces ']}};\n";
    setup({manifest});
    await expect(
      integrationAdd('agent-doc', 'A new line.', {cwd: tmpDir}),
    ).rejects.toThrow(/Cannot update agentDocs/);
    expect(
      fs.readFileSync(path.join(tmpDir, 'astryx.integration.mjs'), 'utf-8'),
    ).toBe(manifest);
  });

  it('preserves comments attached to existing agent-doc state', async () => {
    setup({
      manifest:
        "export default {\n  // Keep this owner note.\n  agentDocs: {append: ['Line one.']},\n};\n",
    });
    await integrationAdd('agent-doc', 'Line two.', {cwd: tmpDir});
    const manifest = fs.readFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'utf-8',
    );
    expect(manifest).toContain('// Keep this owner note.');
    expect(manifest).toContain('Line one.');
    expect(manifest).toContain('Line two.');
  });

  it('refuses non-static agent-doc state without changing it', async () => {
    const manifest =
      "const docs = {append: ['Line one.']};\nexport default {agentDocs: docs};\n";
    setup({manifest});
    await expect(
      integrationAdd('agent-doc', 'Line two.', {cwd: tmpDir}),
    ).rejects.toThrow(/not a static object literal/);
    expect(
      fs.readFileSync(path.join(tmpDir, 'astryx.integration.mjs'), 'utf-8'),
    ).toBe(manifest);
  });

  it('refuses a runtime-computed manifest without changing it', async () => {
    const manifest =
      "function makeManifest() { return {agentDocs: {append: ['Line one.']}}; }\nexport default makeManifest();\n";
    setup({manifest});
    await expect(
      integrationAdd('agent-doc', 'Line two.', {cwd: tmpDir}),
    ).rejects.toThrow(/default export is not a static object literal/);
    expect(
      fs.readFileSync(path.join(tmpDir, 'astryx.integration.mjs'), 'utf-8'),
    ).toBe(manifest);
  });

  it('dry-run predicts the same files as the real write', async () => {
    setup({files: ['dist']});
    const plan = await integrationAdd('agent-doc', 'A line.', {
      cwd: tmpDir,
      dryRun: true,
    });
    const written = await integrationAdd('agent-doc', 'A line.', {cwd: tmpDir});
    expect(written.data.files).toEqual(plan.data.files);
  });

  it('dry-run predicts without writing', async () => {
    setup();
    const before = fs.readFileSync(
      path.join(tmpDir, 'astryx.integration.mjs'),
      'utf-8',
    );
    const result = await integrationAdd('agent-doc', 'A line.', {
      cwd: tmpDir,
      dryRun: true,
    });
    expect(result.data.written).toBe(false);
    expect(result.data.dryRun).toBe(true);
    expect(
      fs.readFileSync(path.join(tmpDir, 'astryx.integration.mjs'), 'utf-8'),
    ).toBe(before);
  });
});

// ── CROSS-KIND: custom root preservation ────────────────────────────

describe('custom root preservation', () => {
  it('uses an existing custom root from the manifest', async () => {
    setup({manifest: "export default {\n  components: './src/ui',\n};\n"});
    const result = await integrationAdd('component', 'MyWidget', {
      cwd: tmpDir,
    });
    expect(result.data.root.path).toBe('./src/ui');
    expect(fs.existsSync(path.join(tmpDir, 'src/ui/MyWidget.doc.mjs'))).toBe(
      true,
    );
  });
});

describe('public per-kind APIs', () => {
  it('exposes narrow functions for every non-theme contribution kind', async () => {
    setup();
    const results = await Promise.all([
      integrationAddComponent('MyWidget', {cwd: tmpDir, dryRun: true}),
      integrationAddDoc('my-guide', {cwd: tmpDir, dryRun: true}),
      integrationAddTemplate('my-page', {
        cwd: tmpDir,
        dryRun: true,
        type: 'page',
      }),
      integrationAddCodemod('rename-widget', {
        cwd: tmpDir,
        dryRun: true,
        to: '1.0.0',
      }),
      integrationAddAgentDoc('Use MyWidget.', {cwd: tmpDir, dryRun: true}),
    ]);

    expect(results.map(result => result.data.kind)).toEqual([
      'component',
      'doc',
      'template',
      'codemod',
      'agent-doc',
    ]);
  });
});

describe('public dispatcher', () => {
  it('delegates theme authoring to the theme-specific implementation', async () => {
    setup();
    const result = await integrationAdd('theme', 'ocean', {cwd: tmpDir});
    expect(result.data).toMatchObject({kind: 'theme', name: 'ocean'});
    expect(result.data.files).toContain('themes/ocean/oceanTheme.ts');
  });

  it('refuses a kind-specific option on the wrong kind', async () => {
    setup();
    await expect(
      integrationAdd('component', 'MyWidget', {
        cwd: tmpDir,
        to: '1.0.0',
      }),
    ).rejects.toThrow(/does not apply/);
    expect(fs.existsSync(path.join(tmpDir, 'components'))).toBe(false);
  });

  it('names every supported kind when the kind is unknown', async () => {
    setup();
    await expect(
      integrationAdd(/** @type {any} */ ('plugin'), 'thing', {cwd: tmpDir}),
    ).rejects.toThrow(/component, doc, template, codemod, agent-doc, or theme/);
  });
});
