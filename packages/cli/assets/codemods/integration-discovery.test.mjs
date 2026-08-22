// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {Project} from '../../foundation/config/project.mjs';
import {
  discoverIntegrationCodemods,
  selectIntegrationCodemods,
} from './integration-discovery.mjs';
import {runIntegrationCodemods} from './integration-runner.mjs';

let tmpDir;
let originalCwd;

/**
 * Build a consumer project with an astryx.config.mjs that loads a single
 * integration package, and the integration package itself (manifest +
 * codemods dir). `codemodFiles` maps "<version>/<id>.mjs" -> file body.
 */
function scaffold(codemodFiles) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    `export default { integrations: ['@acme/widgets'] };\n`,
  );

  const pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'widgets');
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `export default { codemods: './codemods' };\n`,
  );

  for (const [rel, body] of Object.entries(codemodFiles)) {
    const full = path.join(pkgDir, 'codemods', rel);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, body);
  }
  return pkgDir;
}

// Resolve the codemod helper module to an absolute file:// URL so codemod
// modules in the temp package can import it without node_modules wiring.
beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-codemod-test-'));
  process.chdir(tmpDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('integration codemod discovery', () => {
  it('discovers a code codemod and runs it for an applicable --from', async () => {
    scaffold({
      '0.2.0/drop-foo.mjs': `
        export default {
          type: 'code',
          title: 'Drop foo',
          transform: (file) => file.source.replace(/foo/g, 'bar'),
        };
      `,
    });

    const project = await Project.load(tmpDir);
    expect(project.loadedIntegrations).toHaveLength(1);

    const byVersion = await discoverIntegrationCodemods(
      project.loadedIntegrations,
    );
    expect([...byVersion.keys()]).toEqual(['0.2.0']);
    const entry = byVersion.get('0.2.0')[0];
    expect(entry.id).toBe('drop-foo');
    expect(entry.type).toBe('code');
    expect(entry.package).toBe('@acme/widgets');

    // Selection: applies upgrading from 0.1.0 -> 0.2.0, not from 0.2.0 -> 0.2.0
    expect(selectIntegrationCodemods(byVersion, '0.1.0', '0.2.0')).toHaveLength(
      1,
    );
    expect(selectIntegrationCodemods(byVersion, '0.2.0', '0.2.0')).toHaveLength(
      0,
    );

    // Run it against a source file.
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir);
    fs.writeFileSync(path.join(srcDir, 'a.ts'), 'const foo = 1;\n');

    const jscodeshift = (await import('jscodeshift')).default;
    const groups = selectIntegrationCodemods(byVersion, '0.1.0', '0.2.0');
    const result = runIntegrationCodemods(groups, {
      apply: true,
      path: './src',
      jscodeshift,
      silent: true,
    });
    expect(result.errors).toHaveLength(0);
    expect(result.totalFilesChanged).toBe(1);
    expect(fs.readFileSync(path.join(srcDir, 'a.ts'), 'utf-8')).toContain(
      'const bar = 1',
    );
  });

  it('discovers and runs a config codemod against astryx.config.*', async () => {
    scaffold({
      '0.2.0/bump-config.mjs': `
        export default {
          type: 'config',
          title: 'Bump config',
          transform: (file) => file.source.replace('consumer-old', 'consumer-new'),
        };
      `,
    });
    // Make the config file a transform target. (Project.load only needs a valid
    // default export; the marker string lives in a comment.)
    fs.writeFileSync(
      path.join(tmpDir, 'astryx.config.mjs'),
      `// consumer-old\nexport default { integrations: ['@acme/widgets'] };\n`,
    );

    const project = await Project.load(tmpDir);
    const byVersion = await discoverIntegrationCodemods(
      project.loadedIntegrations,
    );
    expect(byVersion.get('0.2.0')[0].type).toBe('config');

    const jscodeshift = (await import('jscodeshift')).default;
    const groups = selectIntegrationCodemods(byVersion, '0.1.0', '0.2.0');
    const result = runIntegrationCodemods(groups, {
      apply: true,
      path: './src',
      jscodeshift,
      silent: true,
    });
    expect(result.errors).toHaveLength(0);
    expect(result.totalFilesChanged).toBe(1);
    expect(
      fs.readFileSync(path.join(tmpDir, 'astryx.config.mjs'), 'utf-8'),
    ).toContain('consumer-new');
  });

  it('skips a co-located module with no default export (treats it as a helper)', async () => {
    // CONTRACT CHANGE (issue #4975): a module with no codemod default export is
    // now treated as a co-located helper and skipped, rather than failing the
    // whole integration's discovery. Previously this threw ("no default
    // export = hard error"); that made any integration keeping a named-export
    // helper next to its codemods silently lose ALL of its codemods.
    scaffold({
      '0.2.0/migrate.mjs': `
        export default {
          type: 'code',
          title: 'Migrate',
          transform: (file) => file.source,
        };
      `,
      // Shared transform helper: NAMED exports only, no default export.
      '0.2.0/migrate.transform.mjs': `export const notDefault = 1;\n`,
    });
    const project = await Project.load(tmpDir);
    const byVersion = await discoverIntegrationCodemods(
      project.loadedIntegrations,
    );
    expect(byVersion.get('0.2.0').map(e => e.id)).toEqual(['migrate']);
  });

  it('fails discovery when default export is not a codemod envelope', async () => {
    scaffold({
      '0.2.0/bad.mjs': `export default { title: 'x', transform: () => null };\n`,
    });
    const project = await Project.load(tmpDir);
    // No `type` discriminator -> fails the envelope schema at load.
    await expect(
      discoverIntegrationCodemods(project.loadedIntegrations),
    ).rejects.toThrow(/is invalid/i);
  });

  it('accepts a PLAIN OBJECT codemod envelope (no factory required)', async () => {
    // Proves we dropped factory-identity coupling: a hand-written object that
    // matches the envelope schema is accepted by discovery.
    scaffold({
      '0.2.0/hand-written.mjs': `
        export default {
          type: 'code',
          title: 'Hand written',
          transform: (file) => file.source,
        };
      `,
    });
    const project = await Project.load(tmpDir);
    const byVersion = await discoverIntegrationCodemods(
      project.loadedIntegrations,
    );
    const entry = byVersion.get('0.2.0')[0];
    expect(entry.id).toBe('hand-written');
    expect(entry.type).toBe('code');
    expect(entry.codemod.isOptional).toBe(false); // schema default applied
  });

  it('rejects a malformed codemod envelope at load (missing transform)', async () => {
    scaffold({
      '0.2.0/no-transform.mjs': `export default { type: 'code', title: 'x' };\n`,
    });
    const project = await Project.load(tmpDir);
    await expect(
      discoverIntegrationCodemods(project.loadedIntegrations),
    ).rejects.toThrow(/transform/i);
  });

  it('fails discovery on a duplicate id across versions within a package', async () => {
    scaffold({
      '0.2.0/dup.mjs': `
        export default {type: 'code', title: 'a', transform: () => null};
      `,
      '0.3.0/dup.mjs': `
        export default {type: 'code', title: 'b', transform: () => null};
      `,
    });
    const project = await Project.load(tmpDir);
    await expect(
      discoverIntegrationCodemods(project.loadedIntegrations),
    ).rejects.toThrow(/across versions/i);
  });

  it('skips co-located test and spec files without loading them', async () => {
    scaffold({
      '0.2.0/drop-foo.mjs': `
        export default {
          type: 'code',
          title: 'Drop foo',
          transform: (file) => file.source,
        };
      `,
      // A test under __tests__/ and a spec file beside the codemod. Both import
      // a module that does not exist, so if discovery ever loaded them it would
      // throw — the walk must skip them by path, not just by shape.
      '0.2.0/__tests__/drop-foo.test.mjs': `import 'astryx-no-such-dep-xyz';\n`,
      '0.2.0/drop-foo.spec.mjs': `import 'astryx-no-such-dep-xyz';\n`,
    });
    const project = await Project.load(tmpDir);
    const byVersion = await discoverIntegrationCodemods(
      project.loadedIntegrations,
    );
    expect(byVersion.get('0.2.0').map(e => e.id)).toEqual(['drop-foo']);
  });
});
