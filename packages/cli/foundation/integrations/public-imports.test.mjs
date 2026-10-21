// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Source-level public-import checks run by
 * `astryx doctor integration validate` (and so `integration check --strict`).
 *
 * Each test stands up a small integration package under the repo root (so the
 * repo's own Core is the installed Core) and validates it.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  validateIntegration,
  validateLocalIntegration,
} from '../../api/integration/validate-integration.mjs';
import {readImports} from './public-imports.mjs';
import {subpathDeclaration} from './exports-subpaths.mjs';
import {
  integrationAddComponent,
  integrationAddTemplate,
} from '../../api/integration/add-contribution.mjs';
import {
  integrationCheck,
  strictIssues,
} from '../../api/integration/check/check.mjs';
import {CLI_ROOT} from '../fs/paths.mjs';

const CODES = new Set([
  'component_import_not_exported',
  'component_import_other_package',
  'example_import_not_exported',
  'template_import_not_exported',
  'template_import_outside_root',
  'template_private_import',
]);

let dir;

/** @param {string} file @param {string} text */
function write(file, text) {
  fs.mkdirSync(path.dirname(path.join(dir, file)), {recursive: true});
  fs.writeFileSync(path.join(dir, file), text);
}

/** @param {(pkg: any) => void} edit */
function pkg(edit) {
  const file = path.join(dir, 'package.json');
  const value = JSON.parse(fs.readFileSync(file, 'utf-8'));
  edit(value);
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

const DOC = (
  importPath = '@acme/widgets/components/AcmeWidget',
  example = 'import {AcmeWidget} from \'@acme/widgets/components/AcmeWidget\';\\n\\n<AcmeWidget label=\\"Save\\" />',
) =>
  `export default {
  type: 'component',
  name: 'AcmeWidget',
  displayName: 'Acme Widget',
  import: '${importPath}',
  usage: {description: 'A pressable widget.'},
  props: [{name: 'label', type: 'string', description: 'Text.', required: true}],
  examples: [{label: 'Basic', code: "${example}"}],
};
`;

const BLOCK = () =>
  `export default {
  type: 'block',
  name: 'account-card',
  displayName: 'Account Card',
  description: 'Account Card template.',
  aspectRatio: 1,
};
`;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-public-imports-'));
  write(
    'package.json',
    JSON.stringify({
      name: '@acme/widgets',
      version: '1.0.0',
      type: 'module',
      peerDependencies: {
        '@astryxdesign/core': '>=0.1.0',
        '@astryxdesign/cli': '>=0.1.0',
      },
      exports: {
        './components/AcmeWidget': './components/AcmeWidget.tsx',
        './templates/account-card': './templates/account-card.tsx',
      },
    }),
  );
  write(
    'astryx.integration.mjs',
    "export default {components: './components', templates: './templates'};\n",
  );
  write('components/AcmeWidget.doc.mjs', DOC());
  write(
    'components/AcmeWidget.tsx',
    'export type AcmeWidgetProps = {label: string};\nexport function AcmeWidget({label}: AcmeWidgetProps) {\n  return <button>{label}</button>;\n}\n',
  );
  write('templates/account-card.doc.mjs', BLOCK());
  write(
    'templates/account-card.tsx',
    'import {AcmeWidget} from \'@acme/widgets/components/AcmeWidget\';\nexport default function AccountCard() {\n  return <AcmeWidget label="Account" />;\n}\n',
  );
});

afterEach(() => {
  fs.rmSync(dir, {recursive: true, force: true});
});

/** The public-import findings, listed as notes on validate's result. */
async function found() {
  const result = await validateLocalIntegration(dir);
  return (result.notes ?? []).filter(note => CODES.has(note.code));
}

async function codes() {
  return (await found()).map(issue => issue.code).sort();
}

describe('public imports: clean packages', () => {
  it('passes the known-good package', async () => {
    const result = await validateLocalIntegration(dir);
    expect(result.issues).toEqual([]);
  });

  it('passes a condition object with import (types first) or default', async () => {
    pkg(p => {
      p.exports['./components/AcmeWidget'] = {
        types: './components/AcmeWidget.tsx',
        import: './components/AcmeWidget.tsx',
      };
    });
    expect(await codes()).toEqual([]);
    pkg(p => {
      p.exports['./components/AcmeWidget'] = {
        default: './components/AcmeWidget.tsx',
        import: './missing.js',
      };
    });
    expect(await codes()).toEqual([]);
  });

  it('passes a wildcard that covers the component', async () => {
    pkg(p => {
      delete p.exports['./components/AcmeWidget'];
      p.exports['./components/*'] = './components/*.tsx';
    });
    expect(await codes()).toEqual([]);
  });

  it('reads "exports": null as no exports field', async () => {
    pkg(p => {
      p.exports = null;
    });
    // A doc module loads once per run, so the doc is written before checking.
    write(
      'components/AcmeWidget.doc.mjs',
      DOC('@acme/widgets/components/Missing'),
    );
    const issue = (await found()).find(
      i => i.code === 'component_import_not_exported',
    );
    expect(issue?.message).toContain(
      'no file exists at "./components/Missing"',
    );
    // The template's deep path to its own file still resolves.
    expect((await found()).filter(i => i.code.startsWith('template_'))).toEqual(
      [],
    );
  });

  it('keeps legacy deep paths when package.json has no exports', async () => {
    pkg(p => delete p.exports);
    expect(await codes()).toEqual([]);
  });

  it('flags a deep path with no file when package.json has no exports', async () => {
    pkg(p => delete p.exports);
    write(
      'components/AcmeWidget.doc.mjs',
      DOC('@acme/widgets/components/Missing'),
    );
    const issue = (await found()).find(
      i => i.code === 'component_import_not_exported',
    );
    expect(issue?.message).toContain(
      'no file exists at "./components/Missing"',
    );
  });

  it('lists a deep path into build output not built yet as not checked', async () => {
    pkg(p => {
      delete p.exports;
      p.files = ['dist', 'components', 'templates'];
    });
    write(
      'components/AcmeWidget.doc.mjs',
      DOC(
        '@acme/widgets/dist/AcmeWidget.js',
        "import {AcmeWidget} from '@acme/widgets/dist/AcmeWidget.js';\\n<AcmeWidget />",
      ),
    );
    const result = await validateIntegration(undefined, {cwd: dir});
    expect(
      (result.data.notes ?? []).filter(i => i.code.includes('_not_exported')),
    ).toEqual([]);
    expect(result.data.publicImports?.unchecked).toEqual([
      expect.objectContaining({
        file: 'components/AcmeWidget.doc.mjs',
        specifier: '@acme/widgets/dist/AcmeWidget.js',
        reason: expect.stringContaining('build output'),
      }),
      expect.objectContaining({
        specifier: '@acme/widgets/dist/AcmeWidget.js',
      }),
    ]);
  });

  it('never maps a built .js path to the .tsx source in a fix', async () => {
    pkg(p => delete p.exports);
    write(
      'components/AcmeWidget.doc.mjs',
      DOC('@acme/widgets/components/AcmeWidget.js'),
    );
    const issue = (await found()).find(
      i => i.code === 'component_import_not_exported',
    );
    expect(issue?.message).not.toContain(
      '"./components/AcmeWidget.js": "./components/AcmeWidget.tsx"',
    );
  });

  it('never requires an exports target to exist (build output)', async () => {
    pkg(p => {
      p.exports['./components/AcmeWidget'] = {
        types: './dist/AcmeWidget.d.ts',
        import: './dist/AcmeWidget.js',
      };
    });
    expect(await codes()).toEqual([]);
  });
});

describe('public imports: component doc import', () => {
  it('flags a missing exports key with the entry to add', async () => {
    pkg(p => delete p.exports['./components/AcmeWidget']);
    const issues = await found();
    const issue = issues.find(i => i.code === 'component_import_not_exported');
    expect(issue).not.toHaveProperty('severity');
    expect(issue?.message).toContain(
      '"./components/AcmeWidget": "./components/AcmeWidget.tsx"',
    );
  });

  it('lists its findings only: neither validate nor --strict counts or fails on them', async () => {
    pkg(p => {
      delete p.exports['./components/AcmeWidget'];
    });
    write(
      'templates/account-card.tsx',
      "import {X} from '../components/AcmeWidget';\nexport function A() {\n  return <X />;\n}\n",
    );
    const issues = await found();
    expect(issues.length).toBeGreaterThan(2);
    expect(issues.every(i => !('severity' in i))).toBe(true);
    const validated = await validateLocalIntegration(dir);
    expect(validated.issues.filter(issue => CODES.has(issue.code))).toEqual([]);
    const plain = await integrationCheck({cwd: dir});
    expect(plain.data.errors).toBe(0);
    expect(plain.data.warnings).toBe(0);
    const strict = await integrationCheck({cwd: dir, strict: true});
    expect(strict.data.failed).toBe(false);
    expect(strict.data.failures).toEqual([]);
  });

  it('flags a require-only condition', async () => {
    pkg(p => {
      p.exports['./components/AcmeWidget'] = {
        require: './components/AcmeWidget.tsx',
      };
    });
    const issue = (await found()).find(
      i => i.code === 'component_import_not_exported',
    );
    expect(issue?.message).toContain('only the "require" condition');
  });

  it('names the conditions a types-only entry has', async () => {
    pkg(p => {
      p.exports['./components/AcmeWidget'] = {types: './a.d.ts'};
    });
    const issue = (await found()).find(
      i => i.code === 'component_import_not_exported',
    );
    expect(issue?.message).toContain('only the "types" condition');
    expect(issue?.message).not.toContain('require');
  });

  it('flags a bare-string exports field', async () => {
    pkg(p => {
      p.exports = './components/AcmeWidget.tsx';
    });
    const all = await codes();
    expect(all).toContain('component_import_not_exported');
    expect(all).toContain('template_import_not_exported');
  });

  it('flags a wildcard that does not match', async () => {
    pkg(p => {
      delete p.exports['./components/AcmeWidget'];
      p.exports['./widgets/*'] = './components/*.tsx';
    });
    expect(await codes()).toContain('component_import_not_exported');
  });

  it('points an undeclared import at the subpath already exported', async () => {
    write('components/AcmeWidget.doc.mjs', DOC('@acme/widgets/AcmeWidget'));
    const issue = (await found()).find(
      i => i.code === 'component_import_not_exported',
    );
    expect(issue?.message).toContain(
      "set import: '@acme/widgets/components/AcmeWidget' (already exported)",
    );
  });

  it('flags an import that names another package', async () => {
    write(
      'components/AcmeWidget.doc.mjs',
      DOC('@acme/other/components/AcmeWidget'),
    );
    const issue = (await found()).find(
      i => i.code === 'component_import_other_package',
    );
    expect(issue?.message).toContain(
      "set import: '@acme/widgets/components/AcmeWidget'",
    );
  });
});

describe('public imports: component examples', () => {
  it('flags a subpath exports does not declare', async () => {
    write(
      'components/AcmeWidget.doc.mjs',
      DOC(
        undefined,
        "import {AcmeWidget} from '@acme/widgets/src/AcmeWidget';\\n<AcmeWidget />",
      ),
    );
    expect(await codes()).toEqual(['example_import_not_exported']);
  });

  it('never points an example back at the same undeclared doc import', async () => {
    pkg(p => delete p.exports['./components/AcmeWidget']);
    const issue = (await found()).find(
      i => i.code === 'example_import_not_exported',
    );
    expect(issue?.message).not.toContain('in the example, as the doc');
    expect(issue?.message).toContain(
      'add "./components/AcmeWidget": "./components/AcmeWidget.tsx" to package.json "exports"',
    );
  });

  it('gives the exports entry for a hooks path when the doc import lacks the hook', async () => {
    write(
      'components/useAcmeTheme.ts',
      'export function useAcmeTheme() {\n  return null;\n}\n',
    );
    write(
      'components/AcmeWidget.doc.mjs',
      DOC(
        undefined,
        "import {useAcmeTheme} from '@acme/widgets/components/useAcmeTheme';\\nuseAcmeTheme();",
      ),
    );
    const issue = (await found()).find(
      i => i.code === 'example_import_not_exported',
    );
    expect(issue?.message).not.toContain(
      "import from '@acme/widgets/components/AcmeWidget'",
    );
    expect(issue?.message).toContain(
      'add "./components/useAcmeTheme": "./components/useAcmeTheme.ts" to package.json "exports"',
    );
  });

  it('accepts aliased, type-only and other-package imports', async () => {
    write(
      'components/AcmeWidget.doc.mjs',
      DOC(
        undefined,
        "import {AcmeWidget as W, type AcmeWidgetProps} from '@acme/widgets/components/AcmeWidget';\\nimport {Button} from '@astryxdesign/core/Button';\\nimport x from 'left-pad';\\n<W label=\\\"a\\\" />",
      ),
    );
    expect(await codes()).toEqual([]);
  });

  it('reads named, default, aliased, namespace and type-only imports', () => {
    const statements = readImports(
      "import D, {A as B, type T} from 'p/a';\nimport type {U} from 'p/b';\nimport * as N from 'p/c';\n...\n<D />",
    );
    expect(statements.map(s => s.source)).toEqual(['p/a', 'p/b', 'p/c']);
    expect(statements[0].names).toEqual([
      {imported: 'default', typeOnly: false},
      {imported: 'A', typeOnly: false},
      {imported: 'T', typeOnly: true},
    ]);
    expect(statements[1].names).toEqual([{imported: 'U', typeOnly: true}]);
    expect(statements[2].namespace).toBe(true);
  });
});

describe('public imports: template sources', () => {
  it('flags a relative import that leaves the templates root', async () => {
    write(
      'templates/account-card.tsx',
      'import {AcmeWidget} from \'../components/AcmeWidget\';\nexport default function A() {\n  return <AcmeWidget label="x" />;\n}\n',
    );
    expect(await codes()).toEqual(['template_import_outside_root']);
  });

  it('flags a Core path Core does not export, and accepts a public one', async () => {
    write(
      'templates/account-card.tsx',
      'import {Button} from \'@astryxdesign/core/src/Button/Button\';\nexport default function A() {\n  return <Button label="x" />;\n}\n',
    );
    const issue = (await found()).find(
      i => i.code === 'template_private_import',
    );
    expect(issue?.message).toContain("'@astryxdesign/core/Button'");
    write(
      'templates/account-card.tsx',
      'import {Button} from \'@astryxdesign/core/Button\';\nexport default function A() {\n  return <Button label="x" />;\n}\n',
    );
    expect(await codes()).toEqual([]);
  });

  it('flags a template whose public import exports does not declare', async () => {
    pkg(p => delete p.exports['./templates/account-card']);
    const issue = (await found()).find(
      i => i.code === 'template_import_not_exported',
    );
    expect(issue?.message).toContain(
      '"./templates/account-card": "./templates/account-card.tsx"',
    );
  });
});

describe('subpathDeclaration', () => {
  it('reads each way exports can declare a subpath', () => {
    expect(subpathDeclaration(undefined, './a').state).toBe('no_exports');
    expect(subpathDeclaration('./i.js', './a').state).toBe('root_only');
    expect(subpathDeclaration({import: './i.js'}, './a').state).toBe(
      'root_only',
    );
    expect(subpathDeclaration({'./a': null}, './a').state).toBe('blocked');
    expect(subpathDeclaration({'./a': {require: './a.cjs'}}, './a').state).toBe(
      'not_importable',
    );
    expect(subpathDeclaration({'./*': './src/*.ts'}, './a').state).toBe(
      'declared',
    );
    expect(
      subpathDeclaration(
        {'./*': './src/*.ts', './private/*': null},
        './private/a',
      ).state,
    ).toBe('blocked');
  });
});

describe('derived component imports', () => {
  const NO_IMPORT = `export default {
  type: 'component',
  name: 'AcmeWidget',
  displayName: 'Acme Widget',
  usage: {description: 'A pressable widget.'},
  props: [{name: 'label', type: 'string', description: 'Text.', required: true}],
};
`;

  it('warns when the derived root import is not declared', async () => {
    write('components/AcmeWidget.doc.mjs', NO_IMPORT);
    const issue = (await found()).find(
      i => i.code === 'component_import_not_exported',
    );
    expect(issue?.message).toContain(
      'has no import, so apps are told to import from "@acme/widgets"',
    );
  });
});

describe('fixes for two components in one folder', () => {
  const docFor = (/** @type {string} */ name) => `export default {
  type: 'component',
  name: '${name}',
  displayName: '${name}',
  usage: {description: 'A widget.'},
  props: [],
};
`;

  beforeEach(() => {
    for (const name of ['AcmeAlpha', 'AcmeBeta']) {
      write(`components/${name}.doc.mjs`, docFor(name));
      write(
        `components/${name}.tsx`,
        `export function ${name}() {\n  return null;\n}\n`,
      );
    }
  });

  it('gives each import-less component its own entry, never the root', async () => {
    const fixes = (await found())
      .filter(i => i.code === 'component_import_not_exported')
      .map(i => i.message.split('Fix: ')[1]);
    expect(fixes).toEqual(
      expect.arrayContaining([
        `add "./components/AcmeAlpha": "./components/AcmeAlpha.tsx" to package.json "exports" and set import: '@acme/widgets/components/AcmeAlpha' in the doc.`,
        `add "./components/AcmeBeta": "./components/AcmeBeta.tsx" to package.json "exports" and set import: '@acme/widgets/components/AcmeBeta' in the doc.`,
      ]),
    );
    for (const fix of fixes) expect(fix).not.toContain('".":');
  });
});

describe('type-only imports', () => {
  it('accepts a statement-level import type from a types-only subpath', async () => {
    pkg(p => {
      p.exports['./types'] = {types: './types.d.ts'};
    });
    write('types.d.ts', 'export type AcmeWidgetSize = "sm" | "md";\n');
    write(
      'components/AcmeWidget.doc.mjs',
      DOC(
        undefined,
        "import type {AcmeWidgetSize} from '@acme/widgets/types';\\nimport {AcmeWidget} from '@acme/widgets/components/AcmeWidget';\\n<AcmeWidget />",
      ),
    );
    expect(await codes()).toEqual([]);
  });

  it('still warns on a value import from a types-only subpath, and on an undeclared one', async () => {
    pkg(p => {
      p.exports['./types'] = {types: './types.d.ts'};
    });
    write(
      'components/AcmeWidget.doc.mjs',
      DOC(
        undefined,
        "import {AcmeWidgetSize} from '@acme/widgets/types';\\nimport type {X} from '@acme/widgets/nope';\\n<AcmeWidget />",
      ),
    );
    expect(await codes()).toEqual([
      'example_import_not_exported',
      'example_import_not_exported',
    ]);
  });
});

describe('a fresh scaffold passes the checks', () => {
  for (const exportsMap of [undefined, {'.': './index.js'}]) {
    it(`with ${exportsMap ? 'an' : 'no'} exports map`, async () => {
      fs.rmSync(dir, {recursive: true, force: true});
      fs.mkdirSync(dir);
      write(
        'package.json',
        JSON.stringify({
          name: '@acme/fresh',
          version: '1.0.0',
          type: 'module',
          ...(exportsMap ? {exports: exportsMap} : {}),
        }),
      );
      write('index.js', 'export {};\n');
      await integrationAddComponent('AcmeThing', {cwd: dir});
      await integrationAddTemplate('acme-page', {cwd: dir});
      const check = await integrationCheck({cwd: dir, strict: true});
      expect(check.data.failures).toEqual([]);
    });
  }
});

describe('imports listed as not checked', () => {
  it('lists a template import of Core when Core is not installed', () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-no-core-'));
    try {
      const put = (/** @type {string} */ rel, /** @type {string} */ text) => {
        fs.mkdirSync(path.dirname(path.join(out, rel)), {recursive: true});
        fs.writeFileSync(path.join(out, rel), text);
      };
      put(
        'package.json',
        JSON.stringify({
          name: '@acme/widgets',
          version: '1.0.0',
          type: 'module',
          exports: {'./templates/account-card': './templates/account-card.tsx'},
        }),
      );
      put(
        'astryx.integration.mjs',
        "export default {templates: './templates'};\n",
      );
      put('templates/account-card.doc.mjs', BLOCK());
      put(
        'templates/account-card.tsx',
        "import {Button} from '@astryxdesign/core/src/Button';\nexport default function A() {\n  return <Button />;\n}\n",
      );
      const run = spawnSync(
        process.execPath,
        [
          path.join(CLI_ROOT, 'clients/cli/bin/astryx.mjs'),
          '--json',
          'doctor',
          'integration',
          'validate',
        ],
        {cwd: out, encoding: 'utf-8', timeout: 60_000},
      );
      const {data} = JSON.parse(run.stdout);
      expect(
        data.issues.filter(
          (/** @type {{code: string}} */ i) =>
            i.code === 'template_private_import',
        ),
      ).toEqual([]);
      expect(data.publicImports.unchecked).toEqual([
        expect.objectContaining({
          file: 'templates/account-card.tsx',
          specifier: '@astryxdesign/core/src/Button',
        }),
      ]);
    } finally {
      fs.rmSync(out, {recursive: true, force: true});
    }
  }, 60_000);
});

describe('which Core and which package', () => {
  it("lists Core imports as not checked when the found core is a workspace's own package", async () => {
    // An npm-workspaces monorepo: its own packages/core is @acme/core, and
    // the integration lives in packages/widgets.
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-workspace-'));
    try {
      const put = (/** @type {string} */ rel, /** @type {string} */ text) => {
        fs.mkdirSync(path.dirname(path.join(root, rel)), {recursive: true});
        fs.writeFileSync(path.join(root, rel), text);
      };
      put(
        'package.json',
        JSON.stringify({
          name: 'acme-monorepo',
          private: true,
          workspaces: ['packages/*'],
        }),
      );
      put(
        'packages/core/package.json',
        JSON.stringify({
          name: '@acme/core',
          version: '1.0.0',
          exports: {'.': './index.js'},
        }),
      );
      put(
        'packages/widgets/package.json',
        JSON.stringify({
          name: '@acme/widgets',
          version: '1.0.0',
          type: 'module',
          exports: {'./templates/account-card': './templates/account-card.tsx'},
        }),
      );
      put(
        'packages/widgets/astryx.integration.mjs',
        "export default {templates: './templates'};\n",
      );
      put('packages/widgets/templates/account-card.doc.mjs', BLOCK());
      put(
        'packages/widgets/templates/account-card.tsx',
        "import {Button} from '@astryxdesign/core/Button';\nexport default function A() {\n  return <Button />;\n}\n",
      );
      const result = await validateIntegration(undefined, {
        cwd: path.join(root, 'packages/widgets'),
      });
      expect(
        (result.data.notes ?? []).filter(
          i => i.code === 'template_private_import',
        ),
      ).toEqual([]);
      expect(result.data.publicImports?.unchecked).toEqual([
        expect.objectContaining({
          file: 'templates/account-card.tsx',
          specifier: '@astryxdesign/core/Button',
        }),
      ]);
    } finally {
      fs.rmSync(root, {recursive: true, force: true});
    }
  });

  it('with no package name, runs only the checks that need none and lists the rest as not checked', async () => {
    pkg(p => delete p.name);
    write(
      'templates/account-card.tsx',
      "import {AcmeWidget} from '../components/AcmeWidget';\nimport {X} from '@acme/widgets/nope';\nexport default function C() {\n  return <AcmeWidget label={X} />;\n}\n",
    );
    const result = await validateIntegration(undefined, {cwd: dir});
    expect(await codes()).toEqual(['template_import_outside_root']);
    expect(result.data.publicImports?.status).toBe('checked');
    expect(result.data.publicImports?.unchecked).toContainEqual(
      expect.objectContaining({
        file: 'package.json',
        reason: expect.stringContaining('no "name"'),
      }),
    );
    // Nothing from the public-import check fails `integration check
    // --strict`: no skip, no warning (other checks may report the missing
    // name themselves).
    const {warnings, skipped} = strictIssues('validate', result);
    expect(
      [...warnings, ...skipped].filter(
        each => CODES.has(each.code) || each.code === 'public_imports_skipped',
      ),
    ).toEqual([]);
  });
});
