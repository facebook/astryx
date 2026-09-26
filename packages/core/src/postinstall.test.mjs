// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guardrail tests for the @astryxdesign/core postinstall nudge (layer 1).
 *
 * Core cannot import the CLI, so it ships scripts/agent-doc-state.mjs — a
 * GENERATED, byte-for-byte copy of the CLI's dependency-free leaf. These tests
 * cover the behaviour core depends on (marker detection across EVERY agent-doc
 * location, legacy markers, the nudge decision matrix) and pin the copy to its
 * source by BYTES, so semantic drift is impossible rather than merely unlikely.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
// Core's own package-local contract copy — what actually runs at install time.
import {
  isAstryxInitialized,
  shouldNudge,
  AGENT_DOC_PATHS,
  INIT_MARKERS,
  SETUP_NUDGE,
} from '../scripts/agent-doc-state.mjs';
// Dev-only, monorepo-relative: core must not depend on the CLI at runtime (the
// CLI peer-depends on core), but the test can read the source and the generator.
import * as cliLeaf from '../../cli/foundation/agent-docs/agent-doc-state.mjs';
import {
  renderCoreCopy,
  checkCorePackaging,
  CORE_TARGET,
  CORE_TARGET_REL,
  CLI_SOURCE_REL,
} from '../../../scripts/generate-setup-contract.mjs';

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

describe('core postinstall — isAstryxInitialized (shared contract)', () => {
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

describe('core postinstall — one authoritative source, no drift', () => {
  // The previous guard compared two hand-edited constant lists, so a change to
  // the PREDICATE (or to shouldNudge) could still make the two layers disagree
  // about "is this project set up?" while the test stayed green. Core's copy is
  // now generated from the CLI leaf, so the guard is byte equality: nothing in
  // the contract — paths, markers, predicate or nudge decision — can diverge.
  it('is byte-identical to what the generator produces from the CLI leaf', () => {
    expect(fs.readFileSync(CORE_TARGET, 'utf-8')).toBe(renderCoreCopy());
  });

  it('names its source, so an editor of the copy is sent to the right file', () => {
    const copy = fs.readFileSync(CORE_TARGET, 'utf-8');
    expect(copy).toContain('GENERATED FILE');
    expect(copy).toContain(CLI_SOURCE_REL);
  });

  it(`publishes ${CORE_TARGET_REL} in core's tarball`, () => {
    // A copy core does not ship is a copy core's postinstall cannot import.
    expect(checkCorePackaging()).toBeNull();
  });

  it('exposes the same contract values as the CLI leaf', () => {
    expect(AGENT_DOC_PATHS).toEqual(cliLeaf.AGENT_DOC_PATHS);
    expect(INIT_MARKERS).toEqual(cliLeaf.INIT_MARKERS);
    expect(SETUP_NUDGE).toBe(cliLeaf.SETUP_NUDGE);
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
  it('quiet with no arguments at all', () => {
    expect(shouldNudge({})).toBe(false);
  });
  it('is the same decision the CLI layer makes', () => {
    for (const scriptPath of [DEP, NPX, REPO]) {
      for (const npmCommand of ['install', 'exec']) {
        for (const isSetUp of [true, false]) {
          expect(shouldNudge({scriptPath, npmCommand, isSetUp})).toBe(
            cliLeaf.shouldNudge({scriptPath, npmCommand, isSetUp}),
          );
        }
      }
    }
  });
});
