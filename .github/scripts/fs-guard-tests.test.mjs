import {describe, expect, it} from 'vitest';

import {fsGuardTests} from './fs-guard-tests.mjs';

const sources = {
  'packages/core/src/Button/Button.test.tsx':
    "import {Button} from './Button';",
  'packages/core/src/Button/Button.tsx': 'export function Button() {}',
  'packages/core/src/serverSafe.test.ts': "import fs from 'node:fs';",
  'packages/cli/test/doc-quality.test.mjs':
    "import {guides} from '../foundation/discovery.mjs';",
  'packages/cli/foundation/discovery.mjs':
    "import {read} from './io.js';\nexport const guides = read();",
  'packages/cli/foundation/io.ts': "import {readFileSync} from 'fs';",
  'scripts/topics.test.mjs':
    'const load = name => import(`./topics/${name}.mjs`);',
  'scripts/plain.test.mjs': "import {sum} from './sum.mjs';",
  'scripts/sum.mjs': 'export const sum = (a, b) => a + b;',
  'scripts/literal.test.mjs': "const mod = await import('./sum.mjs');",
  'packages/core/src/motion/springRows.test.ts':
    "import {execFileSync} from 'node:child_process';",
  'packages/cli/test/readme-gen.test.mjs':
    "const {spawnSync} = require('child_process');",
  'packages/core/src/AspectRatio/AspectRatio.test.tsx':
    "const {readFileSync} = await import('fs');",
  'packages/core/src/theme/onMediaTokens.test.ts':
    'const fs = await import("fs/promises");',
  'scripts/node-prefix.test.cjs': "const fs = require('node:fs/promises');",
  'scripts/create-require.test.mjs':
    "const load = createRequire(import.meta.url);\nconst cp = load('child_process');",
  'scripts/actual.test.ts': "const real = await vi.importActual('fs');",
  'scripts/glob.test.ts':
    "const stories = import.meta.glob('./stories/*.tsx');",
  'scripts/named-like.test.mjs': "import {fsLike} from 'fs-extra-like';",
};

const guards = () =>
  fsGuardTests(Object.keys(sources), file => {
    if (!(file in sources)) throw new Error(`untracked ${file}`);
    return sources[file];
  });

describe('fsGuardTests', () => {
  it('lists a test that reads the file system itself', () => {
    expect(guards()).toContain('packages/core/src/serverSafe.test.ts');
  });

  it('lists a test that reads sources through a helper it imports, .js naming .ts', () => {
    expect(guards()).toContain('packages/cli/test/doc-quality.test.mjs');
  });

  it('lists a test that imports a computed path', () => {
    expect(guards()).toContain('scripts/topics.test.mjs');
  });

  it('lists a test that runs a script in a child process, which reads what it likes', () => {
    expect(guards()).toContain('packages/core/src/motion/springRows.test.ts');
    expect(guards()).toContain('packages/cli/test/readme-gen.test.mjs');
  });

  it.each([
    'packages/core/src/AspectRatio/AspectRatio.test.tsx',
    'packages/core/src/theme/onMediaTokens.test.ts',
    'scripts/node-prefix.test.cjs',
    'scripts/create-require.test.mjs',
    'scripts/actual.test.ts',
    'scripts/glob.test.ts',
  ])('lists %s, which names a file module in another spelling', file => {
    expect(guards()).toContain(file);
  });

  it('leaves out tests whose imports read no files', () => {
    expect(guards()).not.toContain('scripts/named-like.test.mjs');
    expect(guards()).not.toContain('packages/core/src/Button/Button.test.tsx');
    expect(guards()).not.toContain('scripts/plain.test.mjs');
    expect(guards()).not.toContain('scripts/literal.test.mjs');
  });

  it('lists only tests', () => {
    expect(guards().every(file => /\.test\./.test(file))).toBe(true);
  });
});
