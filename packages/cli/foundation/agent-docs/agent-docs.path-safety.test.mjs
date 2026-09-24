// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Path-safety regression tests for agent-doc writes.
 *
 * `installAgentDocs(targetDir, {paths})` previously joined each path
 * onto `targetDir` with no validation, so:
 *   - `../OUT.md` wrote outside `targetDir`
 *   - `/tmp/x.md` was silently re-rooted under `targetDir`
 *
 * Auto-detected and preset files were never checked at all, so a `CLAUDE.md`
 * or `.claude/` symlinked out of the project had the block written through
 * it. Every case now throws PathSafetyError before any file is touched.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {installAgentDocs} from './agent-docs.mjs';
import {PathSafetyError} from '../fs/path-safety.mjs';
import {runCli} from '../../test-utils/run-cli.mjs';

const BLOCK = '<!-- ASTRYX:START -->\nmanaged\n<!-- ASTRYX:END -->';

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-agent-docs-paths-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('installAgentDocs path safety', () => {
  it('rejects --agent-docs-path that escapes the target directory', () => {
    const target = path.join(tmpDir, 'project');
    const outside = path.join(tmpDir, 'outside');
    fs.mkdirSync(target, {recursive: true});
    fs.mkdirSync(outside, {recursive: true});

    expect(() =>
      installAgentDocs(target, {paths: ['../OUT.md']}),
    ).toThrow(PathSafetyError);

    expect(fs.existsSync(path.join(tmpDir, 'OUT.md'))).toBe(false);
    expect(fs.readdirSync(outside)).toEqual([]);
  });

  it('rejects an absolute --agent-docs-path with a clear error', () => {
    const target = path.join(tmpDir, 'project');
    fs.mkdirSync(target, {recursive: true});
    const absPath = path.join(tmpDir, 'absolute.md');

    expect(() =>
      installAgentDocs(target, {paths: [absPath]}),
    ).toThrow(/absolute paths are not allowed/i);

    expect(fs.existsSync(absPath)).toBe(false);
  });

  it('rejects deeper traversal segments', () => {
    const target = path.join(tmpDir, 'a', 'b', 'c');
    fs.mkdirSync(target, {recursive: true});

    expect(() =>
      installAgentDocs(target, {paths: ['../../../escaped.md']}),
    ).toThrow(PathSafetyError);

    expect(fs.existsSync(path.join(tmpDir, 'escaped.md'))).toBe(false);
  });
});

describe('installAgentDocs never writes through a symlink out of the project', () => {
  /** A project dir plus a sibling dir outside it. */
  function layout() {
    const project = path.join(tmpDir, 'project');
    const outside = path.join(tmpDir, 'outside');
    fs.mkdirSync(project, {recursive: true});
    fs.mkdirSync(outside, {recursive: true});
    return {project, outside};
  }

  it('refuses an auto-detected file that links outside', () => {
    const {project, outside} = layout();
    const shared = path.join(outside, 'CLAUDE.md');
    fs.writeFileSync(shared, '# Shared\n');
    fs.symlinkSync(shared, path.join(project, 'CLAUDE.md'));

    expect(() => installAgentDocs(project, {renderedBlock: BLOCK})).toThrow(
      /outside the project root/,
    );
    expect(fs.readFileSync(shared, 'utf-8')).toBe('# Shared\n');
  });

  it('refuses a preset file reached through a symlinked directory', () => {
    const {project, outside} = layout();
    fs.symlinkSync(outside, path.join(project, '.claude'));

    expect(() =>
      installAgentDocs(project, {agent: 'claude', renderedBlock: BLOCK}),
    ).toThrow(PathSafetyError);
    expect(fs.readdirSync(outside)).toEqual([]);
  });

  it('refuses an existing preset file that links outside', () => {
    const {project, outside} = layout();
    const shared = path.join(outside, 'rules');
    fs.writeFileSync(shared, 'rules\n');
    fs.symlinkSync(shared, path.join(project, '.cursorrules'));

    expect(() =>
      installAgentDocs(project, {agent: 'cursor', renderedBlock: BLOCK}),
    ).toThrow(PathSafetyError);
    expect(fs.readFileSync(shared, 'utf-8')).toBe('rules\n');
  });

  it('writes nothing when any file of the set escapes', () => {
    const {project, outside} = layout();
    fs.writeFileSync(path.join(project, 'AGENTS.md'), '# Agents\n');
    const shared = path.join(outside, 'CLAUDE.md');
    fs.writeFileSync(shared, '# Shared\n');
    fs.symlinkSync(shared, path.join(project, 'CLAUDE.md'));

    expect(() => installAgentDocs(project, {renderedBlock: BLOCK})).toThrow(
      PathSafetyError,
    );
    expect(fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf-8')).toBe(
      '# Agents\n',
    );
    expect(fs.readFileSync(shared, 'utf-8')).toBe('# Shared\n');
  });

  it('refuses to refresh a managed block that lives outside', () => {
    const {project, outside} = layout();
    const shared = path.join(outside, 'CLAUDE.md');
    fs.writeFileSync(shared, `# Shared\n\n${BLOCK.replace('managed', 'old')}\n`);
    const before = fs.readFileSync(shared, 'utf-8');
    fs.symlinkSync(shared, path.join(project, 'CLAUDE.md'));

    expect(() =>
      installAgentDocs(project, {onlyReplace: true, renderedBlock: BLOCK}),
    ).toThrow(PathSafetyError);
    expect(fs.readFileSync(shared, 'utf-8')).toBe(before);
  });

  it('refuses to strip a duplicate block from a wrapper that links outside', () => {
    const {project, outside} = layout();
    fs.writeFileSync(path.join(project, 'AGENTS.md'), `# Agents\n\n${BLOCK}\n`);
    const shared = path.join(outside, 'CLAUDE.md');
    fs.writeFileSync(shared, `@AGENTS.md\n\n${BLOCK}\n`);
    fs.symlinkSync(shared, path.join(project, 'CLAUDE.md'));

    expect(() => installAgentDocs(project, {renderedBlock: BLOCK})).toThrow(
      PathSafetyError,
    );
    expect(fs.readFileSync(shared, 'utf-8')).toBe(`@AGENTS.md\n\n${BLOCK}\n`);
  });

  it('still refreshes in-project blocks beside an unmarked outside link it skips', () => {
    const {project, outside} = layout();
    fs.writeFileSync(
      path.join(project, 'AGENTS.md'),
      `# Agents\n\n${BLOCK.replace('managed', 'old')}\n`,
    );
    const shared = path.join(outside, 'rules');
    fs.writeFileSync(shared, 'rules\n');
    fs.symlinkSync(shared, path.join(project, '.cursorrules'));

    expect(
      installAgentDocs(project, {onlyReplace: true, renderedBlock: BLOCK}),
    ).toEqual(['AGENTS.md']);
    expect(fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf-8')).toContain(
      'managed',
    );
    expect(fs.readFileSync(shared, 'utf-8')).toBe('rules\n');
  });

  it('writes through a symlink that stays inside the project', () => {
    const {project} = layout();
    fs.writeFileSync(path.join(project, 'AGENTS.md'), '# Agents\n');
    fs.symlinkSync('AGENTS.md', path.join(project, 'CLAUDE.md'));

    expect(installAgentDocs(project, {renderedBlock: BLOCK})).toEqual([
      'AGENTS.md',
      'CLAUDE.md',
    ]);
    const content = fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf-8');
    expect(content.split('<!-- ASTRYX:START -->')).toHaveLength(2);
  });
});

describe('init --features agents with an agent doc linked outside the project', () => {
  it('writes nothing outside, reports path-safety, and exits 1 in both modes', async () => {
    const project = path.join(tmpDir, 'project');
    const outside = path.join(tmpDir, 'outside');
    fs.mkdirSync(project, {recursive: true});
    fs.mkdirSync(outside, {recursive: true});
    fs.writeFileSync(path.join(project, 'package.json'), '{"name":"app"}\n');
    const shared = path.join(outside, 'CLAUDE.md');
    fs.writeFileSync(shared, '# Shared\n');
    fs.symlinkSync(shared, path.join(project, 'CLAUDE.md'));

    const json = await runCli(['init', '--features', 'agents', '--json'], project);
    expect(json.status).toBe(1);
    const env = JSON.parse(json.stdout);
    expect(env.type).toBe('init.run');
    expect(env.data.docsError).toMatchObject({kind: 'path-safety'});

    const text = await runCli(['init', '--features', 'agents'], project);
    expect(text.status).toBe(1);

    expect(fs.readFileSync(shared, 'utf-8')).toBe('# Shared\n');
  }, 30_000);
});
