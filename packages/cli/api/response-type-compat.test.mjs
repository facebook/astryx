// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import {afterEach, describe, it} from 'vitest';

const require = createRequire(import.meta.url);
const TSC_BIN = require.resolve('typescript/bin/tsc');
const REPO = path.resolve(import.meta.dirname, '..', '..', '..');
const CLI = path.join(REPO, 'packages', 'cli');
const tempDirs = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

describe('additive response type compatibility', () => {
  it('accepts pre-feature response shapes with exactOptionalPropertyTypes', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-response-compat-'));
    tempDirs.push(dir);
    const declarations = path.join(dir, 'dts');

    execFileSync(
      process.execPath,
      [
        TSC_BIN,
        '--project',
        path.join(CLI, 'tsconfig.api-dts.json'),
        '--outDir',
        declarations,
      ],
      {cwd: REPO, stdio: 'pipe'},
    );

    fs.writeFileSync(
      path.join(dir, 'fixture.ts'),
      `import type {ComponentListResponse} from './dts/packages/cli/api/component/component.type.mjs';
import type {IntegrationComponentConflictResponse} from './dts/packages/cli/api/integration/authoring-checks.type.mjs';

const conflicts: IntegrationComponentConflictResponse = {
  type: 'integration.component-conflicts',
  data: {name: null, version: null, conflicts: [], issues: []},
};
const fullList: ComponentListResponse = {
  type: 'component.list',
  data: {
    detail: 'full',
    components: {
      Legacy: [{
        name: 'Legacy',
        displayName: 'Legacy',
        usage: {description: 'Legacy component.'},
        props: [],
      }],
    },
  },
};
void conflicts;
void fullList;
`,
    );
    fs.writeFileSync(
      path.join(dir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          exactOptionalPropertyTypes: true,
          noEmit: true,
          skipLibCheck: true,
          types: ['node'],
          typeRoots: [path.join(REPO, 'node_modules', '@types')],
          paths: {
            '@astryxdesign/cli/authoring': [
              path.join(declarations, 'packages', 'cli', 'authoring', 'index.d.mts'),
            ],
          },
        },
        files: [path.join(dir, 'fixture.ts')],
      }),
    );

    try {
      execFileSync(
        process.execPath,
        [TSC_BIN, '--project', path.join(dir, 'tsconfig.json')],
        {cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']},
      );
    } catch (error) {
      const output = `${error?.stdout ?? ''}${error?.stderr ?? ''}`;
      throw new Error(output || String(error), {cause: error});
    }
  }, 30_000);
});
