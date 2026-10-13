// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Package-boundary coverage for the supported
 * `@astryxdesign/cli/host` runtime and type surface.
 */

import {describe, expect, it} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import {createRequire} from 'node:module';
import * as os from 'node:os';
import * as path from 'node:path';
import process from 'node:process';
import {fileURLToPath, URL} from 'node:url';

const CLI = fileURLToPath(new URL('..', import.meta.url));
const TSC = createRequire(import.meta.url).resolve('typescript/bin/tsc');

const FIXTURE = `
import {
  runHostedCli,
  type HostedCliOptions,
  type HostedPackageSetMode,
} from '@astryxdesign/cli/host';

const options: HostedCliOptions = {
  cwd: '/caller',
  roots: ['/packages/current', '/packages/fallback'],
  argv: ['docs', 'tokens', '--json'],
  integrations: ['@acme/ui'],
  projectCliAlreadyHandled: true,
  handlers: {
    '@acme/ui': {
      discover: async () => ({
        schemaVersion: 1,
        source: {
          name: 'Acme',
          generatedAt: '2026-01-01T00:00:00.000Z',
          complete: true,
        },
        packages: [],
      }),
    },
  },
  stdout: {write: chunk => chunk.length},
  stderr: {write: chunk => chunk.length},
};

async function inspectResult(): Promise<number> {
  const result = await runHostedCli(options);
  const mode: HostedPackageSetMode = result.plan.mode;
  return mode === 'incompatible' ? 1 : result.status;
}

void inspectResult();
`;

describe('@astryxdesign/cli/host', () => {
  it('resolves its public runtime and type contract from a consumer', async () => {
    const runtime = await import('@astryxdesign/cli/host');
    expect(Object.keys(runtime)).toEqual(['runHostedCli']);

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-host-types-'));
    try {
      const scope = path.join(dir, 'node_modules', '@astryxdesign');
      fs.mkdirSync(scope, {recursive: true});
      fs.symlinkSync(CLI, path.join(scope, 'cli'), 'dir');
      fs.writeFileSync(path.join(dir, 'fixture.ts'), FIXTURE);
      fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}\n');
      fs.writeFileSync(
        path.join(dir, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            strict: true,
            noEmit: true,
            skipLibCheck: false,
            lib: ['ES2022', 'DOM'],
            types: [],
          },
          files: ['fixture.ts'],
        }),
      );
      const result = spawnSync(process.execPath, [TSC, '-p', dir], {
        encoding: 'utf-8',
        timeout: 60_000,
      });
      expect(result.stdout + result.stderr).toBe('');
      expect(result.status).toBe(0);
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  });
});
