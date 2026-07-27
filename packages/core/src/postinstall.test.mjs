// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guardrail tests for the @astryxdesign/core postinstall nudge (layer 1).
 *
 * The marker check mirrors the CLI's single source of truth (core can't import
 * the CLI). Tests that it detects the marker across EVERY agent-doc location
 * (incl. Hermes) + legacy markers, and that the nudge decision matrix is correct.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {isAstryxInitialized, shouldNudge} from '../scripts/postinstall.mjs';

const MARKER = '<!-- ASTRYX:START -->';

let tmp;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-core-postinstall-'));
});
afterEach(() => {
  fs.rmSync(tmp, {recursive: true, force: true});
});
function write(rel, body) {
  const p = path.join(tmp, rel);
  fs.mkdirSync(path.dirname(p), {recursive: true});
  fs.writeFileSync(p, body);
}

describe('core postinstall — isAstryxInitialized (mirrors CLI contract)', () => {
  it('is false in an empty project', () => {
    expect(isAstryxInitialized(tmp)).toBe(false);
  });

  it.each(['AGENTS.md', 'CLAUDE.md', '.claude/CLAUDE.md', '.cursorrules', '.hermes.md', 'HERMES.md'])(
    'detects the marker in %s',
    file => {
      write(file, `# doc\n${MARKER}\nbody`);
      expect(isAstryxInitialized(tmp)).toBe(true);
    },
  );

  it('detects the legacy XDS marker', () => {
    write('AGENTS.md', '<!-- XDS:START -->');
    expect(isAstryxInitialized(tmp)).toBe(true);
  });
});

describe('core postinstall — shouldNudge', () => {
  const DEP = '/proj/node_modules/@astryxdesign/core/scripts/postinstall.mjs';
  const NPX = '/Users/x/.npm/_npx/a1/node_modules/@astryxdesign/core/scripts/postinstall.mjs';
  const REPO = '/repo/packages/core/scripts/postinstall.mjs';

  it('nudges for a real dependency install when not set up', () => {
    expect(shouldNudge({scriptPath: DEP, npmCommand: 'install', isSetUp: false})).toBe(true);
  });
  it('quiet in the monorepo/source', () => {
    expect(shouldNudge({scriptPath: REPO, npmCommand: 'install', isSetUp: false})).toBe(false);
  });
  it('quiet during npx transient install (_npx path)', () => {
    expect(shouldNudge({scriptPath: NPX, npmCommand: 'install', isSetUp: false})).toBe(false);
  });
  it('quiet during npx (npm_command=exec)', () => {
    expect(shouldNudge({scriptPath: DEP, npmCommand: 'exec', isSetUp: false})).toBe(false);
  });
  it('quiet once set up', () => {
    expect(shouldNudge({scriptPath: DEP, npmCommand: 'install', isSetUp: true})).toBe(false);
  });
});
