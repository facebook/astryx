// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {Command} from 'commander';
import {registerDocs} from './docs.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-docs-test-'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
  vi.restoreAllMocks();
});

function createProgram() {
  const program = new Command();
  program.exitOverride(); // Throw instead of calling process.exit
  registerDocs(program);
  return program;
}

describe('registerDocs', () => {
  it('lists available topics when no topic given', async () => {
    const program = createProgram();
    await program.parseAsync(['node', 'astryx', 'docs']);

    const output = console.log.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('principles');
    expect(output).toContain('tokens');
    expect(output).not.toContain('shadcn-compatibility');
  });

  it('errors for unknown topic', async () => {
    const program = createProgram();
    vi.spyOn(process, 'exit').mockImplementation(code => {
      throw new Error(`exit ${code}`);
    });

    await expect(
      program.parseAsync(['node', 'astryx', 'docs', 'nonexistent']),
    ).rejects.toThrow('exit 1');

    const errorOutput = console.error.mock.calls.map(c => c[0]).join('\n');
    expect(errorOutput).toContain('Unknown topic');
  });
});

describe('hyphenated doc filenames', () => {
  it('lists hyphenated topics like getting-started', async () => {
    const program = createProgram();
    await program.parseAsync(['node', 'astryx', 'docs']);

    const output = console.log.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('getting-started');
  });

  it('loads a hyphenated topic by name', async () => {
    const program = createProgram();
    await program.parseAsync(['node', 'astryx', 'docs', 'getting-started']);

    const output = console.log.mock.calls.map(c => c[0]).join('\n');
    expect(output.length).toBeGreaterThan(0);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('returns docs.index via API for hyphenated topic', async () => {
    const {docs: docsApi} = await import('../../../api/docs/docs.mjs');
    const result = await docsApi('getting-started');
    expect(result.type).toBe('docs.index');
    expect(result.data.description).toBeDefined();
    expect(result.data.sections.length).toBeGreaterThan(0);
  });
});

describe('migration docs', () => {
  it('lists the migration topic', async () => {
    const program = createProgram();
    await program.parseAsync(['node', 'astryx', 'docs']);

    const output = console.log.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('migration');
    expect(output).toContain('Tailwind');
  });

  it('loads migration docs by topic name', async () => {
    const program = createProgram();
    await program.parseAsync(['node', 'astryx', 'docs', 'migration']);

    const output = console.log.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Migration Guide');
    expect(output).toContain('Recommended Order');
    expect(output).toContain('Map shadcn and Radix Primitives');
  });
});

describe('progressive reads', () => {
  const SLOW = 60_000;
  /** @param {string} out */
  const widest = out => Math.max(...out.split('\n').map(line => line.length));

  it('lists every topic on one line each', async () => {
    const {status, stdout} = await runCli(['docs']);
    expect(status).toBe(0);
    expect(stdout).toMatch(/^principles +\S/m);
    expect(widest(stdout)).toBeLessThanOrEqual(120);
  }, SLOW);

  it("prints a topic's section index with the keys to read by", async () => {
    const {status, stdout} = await runCli(['docs', 'theme']);
    expect(status).toBe(0);
    expect(stdout).toMatch(/^quick-start +Quick Start/m);
    expect(stdout).toContain('docs theme <section>');
    expect(stdout).toContain('docs theme --detail full');
    expect(widest(stdout)).toBeLessThanOrEqual(120);
  }, SLOW);

  it('prints one section by its key', async () => {
    const {status, stdout} = await runCli(['docs', 'theme', 'quick-start']);
    expect(status).toBe(0);
    expect(stdout).toMatch(/^## Quick Start/m);
  }, SLOW);

  it('prints the whole topic only for --detail full', async () => {
    const index = await runCli(['docs', 'theme']);
    const full = await runCli(['--detail', 'full', 'docs', 'theme']);
    expect(full.status).toBe(0);
    expect(full.stdout).toMatch(/^## Quick Start/m);
    expect(full.stdout.length).toBeGreaterThan(index.stdout.length * 3);
    expect(widest(full.stdout.replace(/```[\s\S]*?```/g, ''))).toBeLessThanOrEqual(
      120,
    );
  }, SLOW);

  it('returns the matching envelopes as JSON', async () => {
    const envelope = async args => JSON.parse((await runCli([...args, '--json'])).stdout);
    expect((await envelope(['docs', 'theme'])).type).toBe('docs.index');
    expect((await envelope(['--detail', 'full', 'docs', 'theme'])).type).toBe(
      'docs.detail',
    );
    expect((await envelope(['docs', 'theme', 'quick-start'])).type).toBe(
      'docs.detail.section',
    );
  }, SLOW);
});
