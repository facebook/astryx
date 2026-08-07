// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guardrail tests for the @astryxdesign/core postinstall nudge (layer 1).
 *
 * The marker check mirrors the CLI's single source of truth (core can't import
 * the CLI). Tests that it detects the marker across EVERY agent-doc location
 * (incl. Hermes) + legacy markers, that the nudge decision matrix is correct,
 * and that core's mirror has not drifted from the CLI's leaf.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  isAstryxInitialized,
  shouldNudge,
  AGENT_DOC_PATHS,
  MARKERS,
} from '../scripts/postinstall.mjs';
// Dev-only, monorepo-relative: core must not depend on the CLI at runtime (the
// CLI peer-depends on core), but the test can read the leaf to pin the mirror.
import * as cliLeaf from '../../cli/foundation/agent-docs/agent-doc-state.mjs';

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

describe('core postinstall — no drift from the CLI leaf', () => {
  // Core cannot import the CLI at runtime, so it hand-mirrors the agent-doc
  // locations and markers. These pin the copy to the original: adding a preset
  // path or a marker on one side and not the other fails here instead of
  // silently making the two layers disagree about "is this project set up?".
  it('mirrors the CLI leaf agent-doc paths exactly', () => {
    expect(AGENT_DOC_PATHS).toEqual(cliLeaf.AGENT_DOC_PATHS);
  });

  it('mirrors the CLI leaf init markers exactly', () => {
    expect(MARKERS).toEqual(cliLeaf.INIT_MARKERS);
  });

  it('agrees with the CLI leaf on a real project', () => {
    write('AGENTS.md', `# doc\n${MARKER}\nbody`);
    expect(isAstryxInitialized(tmp)).toBe(cliLeaf.isAstryxInitialized(tmp));
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
