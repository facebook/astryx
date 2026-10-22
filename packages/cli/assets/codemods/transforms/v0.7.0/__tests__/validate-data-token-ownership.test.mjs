// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterAll, describe, expect, it} from 'vitest';
import transform, {
  ENTRY_DIR_LIMIT,
  FILE_BYTE_LIMIT,
  coreSourceBuildConfig,
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
const VITE_SOURCE_BUILD = `import {astryxStylex} from '@astryxdesign/build/vite';
export default {plugins: [...astryxStylex()]};
`;
/** Core compiled from source: the app's Vite config loads the build. */
const coreSourceBuilt = (extra = {}) =>
  repo({
    'package.json': {dependencies: CORE, devDependencies: BUILD},
    'vite.config.ts': VITE_SOURCE_BUILD,
    'src/main.tsx': "import {Theme} from '@astryxdesign/core/theme';\n",
    ...extra,
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

describe('validate-data-token-ownership: source-build evidence', () => {
  const at = (root, rel = 'src/a.tsx') =>
    coreSourceBuildConfig(path.join(root, rel));

  it('names the app build config that loads @astryxdesign/build', () => {
    expect(at(coreSourceBuilt())).toBe('vite.config.ts');
    for (const [name, contents] of [
      ['babel.config.js', "const {babel} = require('@astryxdesign/build');\n"],
      [
        'postcss.config.js',
        "module.exports = {plugins: {'@astryxdesign/build/postcss': {}}};\n",
      ],
      [
        'next.config.mjs',
        "import {withAstryx} from '@astryxdesign/build/next';\n",
      ],
      ['.babelrc', '{"plugins": [["@astryxdesign/build/babel", {}]]}'],
    ]) {
      const root = repo({
        'package.json': {dependencies: CORE, devDependencies: BUILD},
        [name]: contents,
      });
      expect(at(root)).toBe(name);
    }
  });

  it('accepts the build package declared at a workspace root above the app', () => {
    const root = repo({
      'package.json': {devDependencies: BUILD},
      'apps/web/package.json': {dependencies: CORE},
      'apps/web/vite.config.ts': VITE_SOURCE_BUILD,
    });
    expect(at(root, 'apps/web/src/a.tsx')).toBe('vite.config.ts');
  });

  it('finds no evidence in a prebuilt app', () => {
    expect(at(prebuilt())).toBeNull();
  });

  it('finds no evidence without a build config, whatever the dependencies say', () => {
    const root = repo({
      'package.json': {dependencies: CORE, devDependencies: BUILD},
    });
    expect(at(root)).toBeNull();
  });

  it('finds no evidence when the config loads the build but no package declares it', () => {
    const root = repo({
      'package.json': {dependencies: CORE},
      'vite.config.ts': VITE_SOURCE_BUILD,
    });
    expect(at(root)).toBeNull();
  });

  it('finds no evidence outside an app that declares Core', () => {
    const root = repo({
      'package.json': {devDependencies: BUILD},
      'vite.config.ts': VITE_SOURCE_BUILD,
    });
    expect(at(root)).toBeNull();
  });

  it('reads only the app folder, not a workspace root config', () => {
    const root = repo({
      'package.json': {devDependencies: BUILD},
      'babel.config.js': "const {babel} = require('@astryxdesign/build');\n",
      'apps/web/package.json': {dependencies: CORE},
    });
    expect(at(root, 'apps/web/src/a.tsx')).toBeNull();
  });

  it('ignores a build declared outside the repository', () => {
    const outer = repo({'package.json': {devDependencies: BUILD}});
    const inner = path.join(outer, 'nested');
    fs.mkdirSync(path.join(inner, '.git'), {recursive: true});
    fs.writeFileSync(
      path.join(inner, 'package.json'),
      JSON.stringify({dependencies: CORE}),
    );
    fs.writeFileSync(path.join(inner, 'vite.config.ts'), VITE_SOURCE_BUILD);
    expect(at(inner, 'src/a.tsx')).toBeNull();
  });

  it('ignores a commented-out build reference', () => {
    const root = repo({
      'package.json': {dependencies: CORE, devDependencies: BUILD},
      'vite.config.ts': `// import {astryxStylex} from '@astryxdesign/build/vite';
/* plugins: [astryxStylex()] from '@astryxdesign/build/vite' */
export default {};
`,
    });
    expect(at(root)).toBeNull();
  });

  it('treats a symlinked or oversized config as no evidence', () => {
    // `.babelrc` has no entry extension, so only the config check reads it.
    const BABELRC = '{"plugins": [["@astryxdesign/build/babel", {}]]}';
    const target = repo({'.babelrc': BABELRC});
    const linked = repo({
      'package.json': {dependencies: CORE, devDependencies: BUILD},
    });
    fs.symlinkSync(
      path.join(target, '.babelrc'),
      path.join(linked, '.babelrc'),
    );
    expect(at(linked)).toBeNull();

    const big = repo({
      'package.json': {dependencies: CORE, devDependencies: BUILD},
      '.babelrc': BABELRC + ' '.repeat(FILE_BYTE_LIMIT),
    });
    expect(at(big)).toBeNull();
    fs.writeFileSync(path.join(big, '.babelrc'), BABELRC);
    expect(at(big)).toBe('.babelrc');
  });

  it.skipIf(process.platform === 'win32' || process.getuid?.() === 0)(
    'treats an unreadable config as no evidence',
    () => {
      const root = coreSourceBuilt();
      const config = path.join(root, 'vite.config.ts');
      fs.chmodSync(config, 0o000);
      try {
        expect(at(root)).toBeNull();
      } finally {
        fs.chmodSync(config, 0o644);
      }
    },
  );

  it('treats an app entry that loads prebuilt Core CSS as prebuilt, mixed source packages included', () => {
    for (const [rel, contents] of [
      ['src/main.tsx', LOADS_PREBUILT_CORE],
      ['src/app/globals.css', "@import '@astryxdesign/core/astryx.css';\n"],
      [
        'index.html',
        '<link href="/node_modules/@astryxdesign/core/dist/astryx.css">',
      ],
    ]) {
      const root = coreSourceBuilt({
        'package.json': {
          dependencies: {...CORE, '@astryxdesign/lab': '0.7.3'},
          devDependencies: BUILD,
        },
        [rel]: contents,
      });
      expect(at(root)).toBeNull();
    }
  });

  it('treats a symlinked, oversized or crowded entry folder as prebuilt', () => {
    const target = repo({'main.tsx': LOADS_PREBUILT_CORE});
    const linked = coreSourceBuilt();
    fs.symlinkSync(
      path.join(target, 'main.tsx'),
      path.join(linked, 'src/entry.tsx'),
    );
    expect(at(linked)).toBeNull();

    const big = coreSourceBuilt({
      'src/huge.css': '.a{}'.repeat(FILE_BYTE_LIMIT / 4 + 1),
    });
    expect(at(big)).toBeNull();

    const crowded = coreSourceBuilt();
    for (let i = 0; i <= ENTRY_DIR_LIMIT; i++) {
      fs.writeFileSync(path.join(crowded, 'src', `f${i}.txt`), '');
    }
    expect(at(crowded)).toBeNull();
  });

  it('finds no evidence for prebuilt apps whose stylesheet arrives indirectly, from a hidden folder, or through a symlinked folder', () => {
    const viaDependency = repo({
      'package.json': {
        dependencies: {...CORE, 'ui-kit': '1.0.0'},
        devDependencies: BUILD,
      },
      'node_modules/ui-kit/index.js': LOADS_PREBUILT_CORE,
      'src/main.tsx': "import 'ui-kit';\n",
    });
    expect(at(viaDependency)).toBeNull();

    const hidden = repo({
      'package.json': {dependencies: CORE, devDependencies: BUILD},
      '.storybook/preview.ts': LOADS_PREBUILT_CORE,
    });
    expect(at(hidden)).toBeNull();

    const shared = repo({
      'styles/base.css': "@import '@astryxdesign/core/astryx.css';\n",
    });
    const symlinked = repo({
      'package.json': {dependencies: CORE, devDependencies: BUILD},
    });
    fs.symlinkSync(path.join(shared, 'styles'), path.join(symlinked, 'styles'));
    expect(at(symlinked)).toBeNull();
  });

  it('answers from the current files on every call', () => {
    const root = coreSourceBuilt();
    expect(at(root)).toBe('vite.config.ts');
    fs.writeFileSync(
      path.join(root, 'src/styles.css'),
      "@import '@astryxdesign/core/astryx.css';\n",
    );
    expect(at(root)).toBeNull();
    fs.rmSync(path.join(root, 'src/styles.css'));
    expect(at(root)).toBe('vite.config.ts');
    fs.rmSync(path.join(root, 'vite.config.ts'));
    expect(at(root)).toBeNull();
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
        /has no guaranteed default: Core compiles from source here \(vite\.config\.ts loads @astryxdesign\/build\).*dataVars.*astryx\.css.*resolveThemeToken/s,
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
      'vite.config.ts': VITE_SOURCE_BUILD,
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
        'vite.config.ts': VITE_SOURCE_BUILD,
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
