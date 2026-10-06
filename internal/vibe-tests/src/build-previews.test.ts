// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression coverage for standalone vibe preview generation
 * @position internal/vibe-tests/src/build-previews.test.ts
 * @output Clean-install dependency and four-target preview build evidence
 */

import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';

const VIBE_DIR = path.resolve(import.meta.dirname, '..');
const RESULTS_DIR = path.join(VIBE_DIR, 'results');
const BUILD_PREVIEWS = path.join(import.meta.dirname, 'build-previews.ts');
const TSX_CLI = fileURLToPath(import.meta.resolve('tsx/cli'));
const temporaryPaths: string[] = [];

function temporary(prefix: string): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryPaths.push(directory);
  return directory;
}

function createIteration(target: string, source: string): string {
  const iterationId = `.build-previews-test-${crypto.randomUUID()}`;
  const iterationDir = path.join(RESULTS_DIR, iterationId);
  const resultsDir = path.join(iterationDir, 'results');
  fs.mkdirSync(resultsDir, {recursive: true});
  fs.writeFileSync(
    path.join(iterationDir, 'manifest.json'),
    `${JSON.stringify({config: {target}}, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(resultsDir, 'fixture.tsx'), source);
  temporaryPaths.push(iterationDir);
  return iterationId;
}

function runBuild(iterations: string[], outDir: string) {
  return spawnSync(
    process.execPath,
    [
      TSX_CLI,
      BUILD_PREVIEWS,
      '--iterations',
      iterations.join(','),
      '--prompts',
      'fixture',
      '--out',
      outDir,
    ],
    {
      cwd: VIBE_DIR,
      encoding: 'utf8',
      env: {...process.env, CI: 'true'},
    },
  );
}

afterEach(() => {
  while (temporaryPaths.length > 0) {
    fs.rmSync(temporaryPaths.pop()!, {recursive: true, force: true});
  }
});

describe('preview build package boundary', () => {
  it('declares every tool imported by the preview pipeline', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(VIBE_DIR, 'package.json'), 'utf8'),
    ) as {devDependencies?: Record<string, string>};

    expect(Object.keys(packageJson.devDependencies ?? {})).toEqual(
      expect.arrayContaining([
        '@stylexjs/unplugin',
        '@vitejs/plugin-react',
        'playwright',
        'vite',
        'vite-plugin-singlefile',
      ]),
    );
  });

  it('builds one clean fixture for every preview target', () => {
    const source = `export default function Fixture() {
  return <main>Preview fixture</main>;
}\n`;
    const targets = ['astryx', 'astryx-tailwind', 'baseline', 'html'];
    const iterations = targets.map(target => createIteration(target, source));
    const outDir = temporary('build-previews-success-');

    const result = runBuild(iterations, outDir);

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    for (const target of targets) {
      expect(
        fs.existsSync(path.join(outDir, 'fixture', `${target}.html`)),
      ).toBe(true);
    }
    const manifest = JSON.parse(
      fs.readFileSync(path.join(outDir, 'manifest.json'), 'utf8'),
    ) as Record<string, Record<string, string>>;
    expect(Object.keys(manifest.fixture).sort()).toEqual(targets.sort());
  }, 120_000);

  it('fails the command when a requested preview has no output', () => {
    const iteration = createIteration(
      'astryx',
      `import Missing from 'preview-build-missing-package';
export default function Fixture() {
  return <Missing />;
}\n`,
    );
    const outDir = temporary('build-previews-failure-');

    const result = runBuild([iteration], outDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'Preview generation failed for 1 requested cell',
    );
    expect(result.stderr).toContain(
      'fixture/astryx: build failed or produced no output',
    );
    const manifest = JSON.parse(
      fs.readFileSync(path.join(outDir, 'manifest.json'), 'utf8'),
    ) as Record<string, Record<string, string>>;
    expect(manifest.fixture?.astryx).toBeUndefined();
  }, 120_000);
});
