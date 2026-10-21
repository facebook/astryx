// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Astryx's own docs write commands bare, and nothing tells a reader to
 * run the unscoped name through npx (RUNNER_COMMAND_ALLOWLIST says where a
 * runner is allowed, and why).
 *
 * TODO(doctor-runner-check): replace the matcher below with the Doctor lane's
 * runnerCommandsIn() once it lands, keeping RUNNER_COMMAND_ALLOWLIST.
 */

import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {RUNNER_COMMAND_ALLOWLIST} from '../foundation/discovery/runner-allowlist.mjs';

const REPO = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const DOWNLOAD = String.raw`(?:npx|pnpm\s+dlx|yarn\s+dlx|bunx|bun\s+x|npm\s+exec)`;
const PROJECT = String.raw`(?:pnpm\s+exec|pnpm|yarn)`;
/** npx (or another download runner) with the unscoped name. */
const UNSCOPED = new RegExp(
  String.raw`(?<![\w@/-])${DOWNLOAD}\s+astryx(?![\w@/-])`,
  'gu',
);
/** Any runner in front of an Astryx command. */
const RUNNER = new RegExp(
  String.raw`(?<![\w@/-])(?:${DOWNLOAD}\s+(?:astryx|@astryxdesign/cli(?:@[\w.-]+)?)(?![\w/-])|${PROJECT}\s+astryx\s+[a-z][\w-]*)`,
  'gu',
);

const files = execFileSync(
  'git',
  ['ls-files', 'packages/core', 'packages/cli', 'README.md'],
  {cwd: REPO, encoding: 'utf8'},
)
  .split('\n')
  .filter(file => /\.(?:[cm]?[jt]sx?|md)$/u.test(file))
  .filter(file => !RUNNER_COMMAND_ALLOWLIST.skip.some(re => re.test(file)));

/** @param {string} file @param {RegExp} re */
function hits(file, re) {
  const text = fs.readFileSync(path.join(REPO, file), 'utf8');
  return text
    .split('\n')
    .flatMap((line, i) =>
      [...line.matchAll(re)].map(m => `${file}:${i + 1}: ${m[0]}`),
    );
}

describe('runner commands in Astryx docs', () => {
  it('never runs the unscoped name through npx', () => {
    expect(files.length).toBeGreaterThan(100);
    expect(files.flatMap(file => hits(file, UNSCOPED))).toEqual([]);
  });

  it('writes commands bare in docs, except the named runner examples', () => {
    const docs = files.filter(
      file =>
        (file.endsWith('.doc.mjs') || file === 'packages/core/docs.mjs') &&
        !(file in RUNNER_COMMAND_ALLOWLIST.runnerExamples),
    );
    expect(docs.length).toBeGreaterThan(100);
    expect(docs.flatMap(file => hits(file, RUNNER))).toEqual([]);
  });

  it('names only files that exist', () => {
    for (const file of Object.keys(RUNNER_COMMAND_ALLOWLIST.runnerExamples)) {
      expect(fs.existsSync(path.join(REPO, file)), file).toBe(true);
    }
  });
});
