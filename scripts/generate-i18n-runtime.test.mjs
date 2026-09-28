// Copyright (c) Meta Platforms, Inc. and affiliates.

import {spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {
  createRuntimeCatalog,
  createRuntimeCatalogs,
  getGeneratedModuleName,
  renderRuntimeCatalogModule,
} from './generate-i18n-runtime.mjs';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

describe('generator CLI', () => {
  it('runs when invoked through a symlinked repository path', () => {
    const temp = mkdtempSync(path.join(tmpdir(), 'astryx-i18n-cli-'));
    const linkedRepo = path.join(temp, 'repo');
    symlinkSync(REPO_ROOT, linkedRepo, 'dir');
    try {
      const result = spawnSync(
        process.execPath,
        [path.join(linkedRepo, 'scripts/generate-i18n-runtime.mjs'), '--check'],
        {cwd: linkedRepo, encoding: 'utf8'},
      );
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain('authored locale catalogs produce');
    } finally {
      rmSync(temp, {recursive: true, force: true});
    }
  });
});

describe('createRuntimeCatalog', () => {
  it('keeps runtime messages and drops translator metadata', () => {
    const runtimeCatalog = createRuntimeCatalog({
      '@astryx.button.submit': {
        defaultMessage: 'Submit',
        description: 'Visible label for the primary submit button.',
      },
      '@astryx.pagination.page': {
        defaultMessage: 'Page {page, number}',
        description: 'Accessible page label.',
        screenshot: 'translator-only-context.png',
      },
    });

    expect(runtimeCatalog).toEqual({
      '@astryx.button.submit': 'Submit',
      '@astryx.pagination.page': 'Page {page, number}',
    });
    expect(JSON.stringify(runtimeCatalog)).not.toContain('description');
    expect(JSON.stringify(runtimeCatalog)).not.toContain('translator-only');
  });

  it('rejects entries without a runtime message', () => {
    expect(() =>
      createRuntimeCatalog({
        '@astryx.button.submit': {description: 'Translator context only.'},
      }),
    ).toThrow('missing string "defaultMessage"');
  });
});

describe('createRuntimeCatalogs', () => {
  it('uses the string-map shape for real and pseudo locales', () => {
    const catalogs = createRuntimeCatalogs({
      'en.json': {
        '@astryx.button.submit': {
          defaultMessage: 'Submit',
          description: 'Visible submit label.',
        },
      },
      'fr-FR.json': {
        '@astryx.button.submit': {
          defaultMessage: 'Envoyer',
          description: 'Visible submit label.',
        },
      },
    });

    expect(Object.keys(catalogs)).toEqual([
      'en.json',
      'fr-FR.json',
      'pseudo.json',
    ]);
    expect(catalogs['fr-FR.json']['@astryx.button.submit']).toBe('Envoyer');
    expect(catalogs['pseudo.json']['@astryx.button.submit']).toBe('⟦Šúƀɱíţ⟧');
    expect(JSON.stringify(catalogs)).not.toContain('description');
  });
});

describe('generated module names', () => {
  it('places generated modules beside the i18n runtime with an explicit suffix', () => {
    expect(getGeneratedModuleName('fr-FR.json')).toBe('fr-FR.generated.ts');
    expect(getGeneratedModuleName('pseudo.json')).toBe('pseudo.generated.ts');
  });

  it('rejects non-JSON source filenames', () => {
    expect(() => getGeneratedModuleName('fr-FR.ts')).toThrow(
      'Expected a JSON locale filename',
    );
  });
});

describe('renderRuntimeCatalogModule', () => {
  it('emits a default-exported string map tied to its rich source', async () => {
    const output = await renderRuntimeCatalogModule(
      {'@astryx.button.submit': 'Submit'},
      'fr-FR.json',
    );

    expect(output).toContain('const runtimeCatalog');
    expect(output).toContain('export default runtimeCatalog');
    expect(output).toContain('packages/core/locales/fr-FR.json');
    expect(output).toContain("'@astryx.button.submit': 'Submit'");
    expect(output).not.toContain('defaultMessage');
  });
});
