// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterAll, describe, expect, it} from 'vitest';
import transform, {
  dataDefaultsMayBeMissing,
} from '../validate-data-token-ownership.mjs';
import {runCodemods} from '../../../runner.mjs';
import {upgrade} from '../../../../../api/upgrade/upgrade.mjs';

const SLOW = 30_000;
const tempRoots = [];

/**
 * A repository with files at the given relative paths. Objects are written as
 * JSON.
 * @param {Record<string, string | object>} files
 */
function repo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-data-token-'));
  tempRoots.push(root);
  fs.mkdirSync(path.join(root, '.git'));
  for (const [rel, contents] of Object.entries(files)) {
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(
      file,
      typeof contents === 'string' ? contents : JSON.stringify(contents),
    );
  }
  return root;
}

const CORE = {'@astryxdesign/core': '0.7.3'};
const BUILD = {'@astryxdesign/build': '0.7.3'};
const LOADS_PREBUILT_CORE = `import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
`;

/** Prebuilt: loads astryx.css, no source build. */
const prebuilt = () =>
  repo({
    'package.json': {dependencies: CORE},
    'src/main.tsx': LOADS_PREBUILT_CORE,
  });
/** Core compiled from source: the build package and no prebuilt Core CSS. */
const coreSourceBuilt = () =>
  repo({
    'package.json': {dependencies: CORE, devDependencies: BUILD},
    'src/main.tsx': "import {Theme} from '@astryxdesign/core/theme';\n",
  });

afterAll(() => {
  for (const root of tempRoots) fs.rmSync(root, {recursive: true, force: true});
});

async function run(source, file) {
  const jscodeshift = (await import('jscodeshift')).default;
  const parser =
    file.endsWith('.ts') || file.endsWith('.tsx') ? 'tsx' : 'babel';
  const api = {
    jscodeshift: jscodeshift.withParser(parser),
    stats: () => {},
    report: () => {},
  };
  return transform({source, path: file}, api);
}

const DIRECT_USES = [
  `const fill = 'var(--color-data-categorical-green)';`,
  'const fill = `var(--color-data-categorical-green)`;',
  `const border = '1px solid var(--color-data-categorical-green)';`,
  'const border = `${width}px solid var(--color-data-categorical-green)`;',
];

describe('validate-data-token-ownership: data-default availability', () => {
  it('treats an app that loads prebuilt Core CSS as covered', () => {
    expect(dataDefaultsMayBeMissing(path.join(prebuilt(), 'src/a.tsx'))).toBe(
      false,
    );
  });

  it('treats an app with no source build as covered, even without a visible astryx.css import', () => {
    const root = repo({'package.json': {dependencies: CORE}});
    expect(dataDefaultsMayBeMissing(path.join(root, 'src/a.tsx'))).toBe(false);
  });

  it('flags Core compiled from source with no prebuilt Core CSS', () => {
    expect(
      dataDefaultsMayBeMissing(path.join(coreSourceBuilt(), 'src/a.tsx')),
    ).toBe(true);
  });

  it('treats a source-built non-Core package beside prebuilt Core CSS as covered', () => {
    const root = repo({
      'package.json': {
        dependencies: {...CORE, '@astryxdesign/lab': '0.7.3'},
        devDependencies: BUILD,
      },
      'src/styles.css': "@import '@astryxdesign/core/astryx.css';\n",
    });
    expect(dataDefaultsMayBeMissing(path.join(root, 'src/a.tsx'))).toBe(false);
  });

  it('treats a prebuilt app under a workspace root that declares the build as covered', () => {
    const root = repo({
      'package.json': {devDependencies: BUILD},
      'apps/web/package.json': {dependencies: CORE},
      'apps/web/src/main.tsx': LOADS_PREBUILT_CORE,
    });
    expect(
      dataDefaultsMayBeMissing(path.join(root, 'apps/web/src/a.tsx')),
    ).toBe(false);
  });

  it('treats an app whose build sits below a shared root stylesheet as covered', () => {
    const root = repo({
      'styles/base.css': "@import '@astryxdesign/core/astryx.css';\n",
      'apps/web/package.json': {dependencies: CORE, devDependencies: BUILD},
    });
    expect(
      dataDefaultsMayBeMissing(path.join(root, 'apps/web/src/a.tsx')),
    ).toBe(false);
  });

  it('flags a workspace app when the root build compiles Core and nothing loads prebuilt Core CSS', () => {
    const root = repo({
      'package.json': {devDependencies: BUILD},
      'apps/web/package.json': {dependencies: CORE},
      'apps/web/src/main.tsx': 'export {};\n',
    });
    expect(
      dataDefaultsMayBeMissing(path.join(root, 'apps/web/src/a.tsx')),
    ).toBe(true);
  });

  it('ignores a build declared outside the repository', () => {
    const outer = repo({'package.json': {devDependencies: BUILD}});
    const inner = path.join(outer, 'nested');
    fs.mkdirSync(path.join(inner, '.git'), {recursive: true});
    fs.writeFileSync(
      path.join(inner, 'package.json'),
      JSON.stringify({dependencies: CORE}),
    );
    expect(dataDefaultsMayBeMissing(path.join(inner, 'src/a.tsx'))).toBe(false);
  });

  it('treats a symlinked source file as unknown, not as proof of a source build', () => {
    const target = repo({'main.tsx': LOADS_PREBUILT_CORE});
    const root = repo({
      'package.json': {dependencies: CORE, devDependencies: BUILD},
    });
    fs.mkdirSync(path.join(root, 'src'));
    fs.symlinkSync(
      path.join(target, 'main.tsx'),
      path.join(root, 'src/main.tsx'),
    );
    expect(dataDefaultsMayBeMissing(path.join(root, 'src/a.tsx'))).toBe(false);
  });

  it.skipIf(process.platform === 'win32' || process.getuid?.() === 0)(
    'treats an unreadable source file as unknown, not as proof of a source build',
    () => {
      const root = repo({
        'package.json': {dependencies: CORE, devDependencies: BUILD},
        'src/main.tsx': LOADS_PREBUILT_CORE,
      });
      const entry = path.join(root, 'src/main.tsx');
      fs.chmodSync(entry, 0o000);
      try {
        expect(dataDefaultsMayBeMissing(path.join(root, 'src/a.tsx'))).toBe(
          false,
        );
      } finally {
        fs.chmodSync(entry, 0o644);
      }
    },
  );

  it('does not count node_modules or dot folders as loading prebuilt Core CSS', () => {
    const root = repo({
      'package.json': {dependencies: CORE, devDependencies: BUILD},
      'node_modules/x/index.js': LOADS_PREBUILT_CORE,
      '.cache/a.js': LOADS_PREBUILT_CORE,
    });
    expect(dataDefaultsMayBeMissing(path.join(root, 'src/a.tsx'))).toBe(true);
  });
});

describe('validate-data-token-ownership: transform', () => {
  it('passes fallback-less uses where prebuilt Core CSS is loaded', async () => {
    const root = prebuilt();
    for (const source of DIRECT_USES) {
      expect(
        await run(source, path.join(root, 'src/chart.tsx')),
      ).toBeUndefined();
    }
    expect(
      await run(
        '.bar { fill: var(--color-data-categorical-blue); }',
        path.join(root, 'src/chart.css'),
      ),
    ).toBeUndefined();
  });

  it('fails direct string and static-template uses where Core is source-built', async () => {
    const root = coreSourceBuilt();
    for (const source of DIRECT_USES) {
      await expect(
        run(source, path.join(root, 'src/chart.tsx')),
      ).rejects.toThrow(
        /has no guaranteed default: Core compiles from source.*astryx\.css.*dataVars.*resolveThemeToken/s,
      );
    }
  });

  it('names the first use in the file, whatever kind of literal holds it', async () => {
    const root = coreSourceBuilt();
    const source = `export function Bar({width}) {
  const border = \`\${width}px solid var(--color-data-categorical-green)\`;
  return <rect fill="var(--color-data-categorical-red)" style={{border}} />;
}`;
    await expect(run(source, path.join(root, 'src/Bar.tsx'))).rejects.toThrow(
      /Direct var\(--color-data-categorical-green\) at line 2/,
    );
  });

  it('fails raw stylesheet uses where Core is source-built', async () => {
    const root = coreSourceBuilt();
    await expect(
      run(
        '.bar {\n  fill: var(--color-data-categorical-green);\n}',
        path.join(root, 'src/chart.css'),
      ),
    ).rejects.toThrow(
      /Raw var\(--color-data-categorical-green\) without a fallback at line 2 has no guaranteed default/,
    );
  });

  it('leaves fallbacks, dataVars access, and comments unchanged', async () => {
    const root = coreSourceBuilt();
    const source = `
// var(--color-data-categorical-green)
const fallback = 'var(--color-data-categorical-green, #008000)';
const fill = dataVars['--color-data-categorical-green'];
`;
    expect(await run(source, path.join(root, 'src/chart.tsx'))).toBeUndefined();
    expect(
      await run(
        `/* var(--color-data-categorical-green) */
.bar { fill: var(--color-data-categorical-green, #008000); }`,
        path.join(root, 'src/chart.css'),
      ),
    ).toBeUndefined();
  });

  it('fails on stale generated theme CSS with root data defaults in either mode', async () => {
    const source = `/* @generated by \`astryx theme build\` */
@layer astryx-base {
  :root { --color-data-categorical-green: #008000; }
}`;
    for (const root of [prebuilt(), coreSourceBuilt()]) {
      await expect(
        run(source, path.join(root, 'src/theme.css')),
      ).rejects.toThrow(/Rebuild it with `astryx theme build`/);
    }
  });

  it('does not claim ownership of hand-authored CSS or sparse theme overrides', async () => {
    const root = coreSourceBuilt();
    expect(
      await run(
        ':root { --color-data-categorical-green: #008000; }',
        path.join(root, 'src/app.css'),
      ),
    ).toBeUndefined();
    expect(
      await run(
        `/* @generated by \`astryx theme build\` */
@scope ([data-astryx-theme="ocean"]) {
  :scope { --color-data-categorical-green: #008000; }
}`,
        path.join(root, 'src/theme.css'),
      ),
    ).toBeUndefined();
  });
});

describe('validate-data-token-ownership: runner', () => {
  const RAW_USE =
    "export const fill = 'var(--color-data-categorical-green)';\n";
  const PROTECTED = {
    '.gitattributes': 'src/vendor/** linguist-generated=true\n',
    'src/app.tsx': RAW_USE,
    'src/generated.tsx': `/* @generated */\n${RAW_USE}`,
    'src/vendor/chart.tsx': RAW_USE,
  };

  async function runValidator(root) {
    const {default: transforms} = await import('../index.mjs');
    return runCodemods([{version: '0.7.0', transforms}], {
      apply: true,
      path: path.join(root, 'src'),
      root,
      codemod: 'validate-data-token-ownership',
      skipCodemods: new Set(),
      silent: true,
    });
  }

  it('reports no errors and changes nothing where prebuilt Core CSS is loaded, protected files included', async () => {
    const root = repo({
      'package.json': {dependencies: CORE},
      'src/main.tsx': LOADS_PREBUILT_CORE,
      ...PROTECTED,
    });
    const result = await runValidator(root);
    expect(result.errors).toEqual([]);
    expect(result.protectedFiles).toEqual([]);
    expect(result.changedFiles).toEqual([]);
  });

  it('reports every raw use as an error where Core is source-built, protected files included, writing nothing', async () => {
    const root = repo({
      'package.json': {dependencies: CORE, devDependencies: BUILD},
      ...PROTECTED,
    });
    const result = await runValidator(root);
    expect(result.errors.map(error => error.file).sort()).toEqual([
      'src/app.tsx',
      'src/generated.tsx',
      'src/vendor/chart.tsx',
    ]);
    expect(result.protectedFiles).toEqual([]);
    expect(result.changedFiles).toEqual([]);
  });

  /** @param {Record<string, string | object>} extra */
  function installedProject(extra) {
    const root = repo({...PROTECTED, ...extra});
    const coreDir = path.join(root, 'node_modules', '@astryxdesign', 'core');
    fs.mkdirSync(coreDir, {recursive: true});
    fs.writeFileSync(
      path.join(coreDir, 'package.json'),
      JSON.stringify({name: '@astryxdesign/core', version: '0.7.0'}),
    );
    return root;
  }

  it(
    'completes `astryx upgrade --apply` where prebuilt Core CSS is loaded',
    async () => {
      const root = installedProject({
        'package.json': {dependencies: CORE},
        'src/main.tsx': LOADS_PREBUILT_CORE,
      });
      const res = await upgrade(
        {from: '0.6.9', codemod: 'validate-data-token-ownership', apply: true},
        {cwd: root},
      );
      expect(res.data.complete).toBe(true);
      expect(res.data.errors ?? []).toEqual([]);
    },
    SLOW,
  );

  it(
    'fails `astryx upgrade --apply` where Core is source-built',
    async () => {
      const root = installedProject({
        'package.json': {dependencies: CORE, devDependencies: BUILD},
      });
      await expect(
        upgrade(
          {
            from: '0.6.9',
            codemod: 'validate-data-token-ownership',
            apply: true,
          },
          {cwd: root},
        ),
      ).rejects.toMatchObject({code: 'ERR_CODEMOD_FAILED'});
    },
    SLOW,
  );
});
