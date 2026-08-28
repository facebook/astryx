// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file accessibility-audit.test.mjs
 * Pins the --components contract of the a11y audit CLI. The pr-a11y job
 * derives its component list from the PR analysis and passes it as
 * `--components "$COMPONENTS"`; when a core/src change maps to no component
 * (a shared test file, docs-types.ts, …) that list is EMPTY, and the audit
 * must skip and pass rather than fan out into a full-repo audit that fails
 * on violations the PR never touched. An ABSENT --components flag keeps the
 * a11y-weekly contract: audit all stories.
 */

import {spawnSync} from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(SCRIPTS_DIR, 'accessibility-audit.js');
const BASELINE = path.resolve(SCRIPTS_DIR, '..', 'a11y-baseline.json');

/** Run the audit CLI in a temp cwd; return {status, stdout, stderr, report}. */
function runAudit(args, setup) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-audit-'));
  try {
    setup?.(dir);
    const result = spawnSync(
      process.execPath,
      [SCRIPT, '--output', 'report.json', ...args],
      {cwd: dir, encoding: 'utf8'},
    );
    const reportPath = path.join(dir, 'report.json');
    const report = fs.existsSync(reportPath)
      ? JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      : null;
    return {
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      report,
    };
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
}

function storybookDist(root) {
  return path.join(root, 'apps', 'storybook', 'dist');
}

function writeStorybookIndex(root, value) {
  const dist = storybookDist(root);
  fs.mkdirSync(dist, {recursive: true});
  fs.writeFileSync(
    path.join(dist, 'index.json'),
    typeof value === 'string' ? value : JSON.stringify(value),
  );
}

function writeOneStory(root) {
  const dist = storybookDist(root);
  writeStorybookIndex(root, {
    entries: {
      'core-button--default': {
        type: 'story',
        id: 'core-button--default',
        title: 'Core/Button',
        name: 'Default',
      },
    },
  });
  fs.writeFileSync(
    path.join(dist, 'iframe.html'),
    '<!doctype html><html><body><button>OK</button></body></html>',
  );
}

describe('accessibility-audit --components contract', () => {
  it('audits nothing and passes when --components is explicitly empty', () => {
    // The exact pr-a11y invocation shape for a PR whose analysis found no
    // new or modified components.
    const {status, stdout, report} = runAudit([
      '--components',
      '',
      '--baseline',
      BASELINE,
      '--fail-on-new',
    ]);
    expect(status).toBe(0);
    expect(stdout).toContain('No components to audit');
    expect(report.components).toEqual({});
    expect(report.summary.totalViolations).toBe(0);
    expect(report.summary).toMatchObject({
      expectedStories: 0,
      auditedStories: 0,
      failedStories: 0,
      scanStatus: 'complete',
    });
  });

  it('still audits all stories when the flag is absent (a11y-weekly)', () => {
    // No storybook build exists in the temp cwd, so the all-stories path
    // reports the missing build instead of skipping — absent ≠ empty.
    const {status, stdout, report} = runAudit([]);
    expect(status).toBe(1);
    expect(stdout).not.toContain('No components to audit');
    expect(stdout).toContain('all affected');
    expect(report.error).toBe('Storybook not built');
    expect(report.summary.scanStatus).toBe('crashed');
  });

  it('proceeds to audit when --components names components', () => {
    const {status, stdout, report} = runAudit(['--components', 'Text,Heading']);
    expect(status).toBe(1);
    expect(stdout).not.toContain('No components to audit');
    expect(stdout).toContain('Text, Heading');
    expect(report.error).toBe('Storybook not built');
  });

  it('fails closed when the Storybook index file is missing', () => {
    const {status, report} = runAudit([], root => {
      fs.mkdirSync(path.join(root, 'apps', 'storybook', 'dist'), {
        recursive: true,
      });
    });
    expect(status).toBe(1);
    expect(report.summary).toMatchObject({
      scope: 'full',
      indexStatus: 'missing',
      scanStatus: 'crashed',
      expectedStories: 0,
    });
  });

  it('fails closed when the Storybook index JSON is malformed', () => {
    const {status, report} = runAudit([], root => {
      writeStorybookIndex(root, '{not json');
    });
    expect(status).toBe(1);
    expect(report.summary.indexStatus).toBe('malformed');
    expect(report.summary.scanStatus).toBe('crashed');
  });

  it('fails closed when a full-suite index has zero eligible stories', () => {
    const {status, report} = runAudit([], root => {
      writeStorybookIndex(root, {
        entries: {
          docs: {type: 'docs', id: 'core-button--docs', title: 'Core/Button'},
        },
      });
    });
    expect(status).toBe(1);
    expect(report.error).toBe('Storybook index contains no eligible stories');
    expect(report.summary).toMatchObject({
      indexStatus: 'parsed',
      scanStatus: 'crashed',
      expectedStories: 0,
    });
  });

  it('audits one valid Storybook story, writes a complete report, and closes the server', () => {
    const first = runAudit([], writeOneStory);
    expect(first.status).toBe(0);
    expect(first.report.summary).toMatchObject({
      scope: 'full',
      indexStatus: 'parsed',
      expectedStories: 1,
      auditedStories: 1,
      failedStories: 0,
      resultStories: 1,
      uniqueResultStories: 1,
      scanStatus: 'complete',
      totalViolations: 0,
    });
    expect(first.report.components.Button.storyDetails).toEqual([
      {id: 'core-button--default', story: 'Default', violations: []},
    ]);

    const second = runAudit([], writeOneStory);
    expect(second.status).toBe(0);
    expect(second.report.summary.scanStatus).toBe('complete');
  });

  it('writes a crashed report when scan infrastructure throws', async () => {
    const blocker = http.createServer((_, res) => res.end('busy'));
    await new Promise(resolve => blocker.listen(6007, resolve));
    try {
      const {status, report} = runAudit([], writeOneStory);
      expect(status).toBe(1);
      expect(report.error).toMatch(/EADDRINUSE|address already in use/i);
      expect(report.summary).toMatchObject({
        indexStatus: 'parsed',
        expectedStories: 1,
        auditedStories: 0,
        scanStatus: 'crashed',
      });
    } finally {
      await new Promise(resolve => blocker.close(resolve));
    }
  });
});
