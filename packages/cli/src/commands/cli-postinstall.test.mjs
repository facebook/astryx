// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guardrail tests for the @astryxdesign/cli postinstall nudge (layer 2).
 *
 * Tests the pure decision matrix (shouldNudge) — nudges for a real dependency
 * install when not set up; stays quiet in the monorepo/source, during npx's
 * transient fetch (path _npx or npm_command=exec), and once set up.
 */

import {describe, it, expect} from 'vitest';
import {shouldNudge} from '../../scripts/postinstall.mjs';

const DEP = '/proj/node_modules/@astryxdesign/cli/scripts/postinstall.mjs'; // real dep install
const NPX = '/Users/x/.npm/_npx/a1b2/node_modules/@astryxdesign/cli/scripts/postinstall.mjs';
const REPO = '/repo/packages/cli/scripts/postinstall.mjs'; // monorepo/source

describe('cli postinstall — shouldNudge', () => {
  it('nudges for a real dependency install when not set up', () => {
    expect(shouldNudge({scriptPath: DEP, npmCommand: 'install', isSetUp: false})).toBe(true);
  });

  it('quiet in the monorepo/source (not under node_modules)', () => {
    expect(shouldNudge({scriptPath: REPO, npmCommand: 'install', isSetUp: false})).toBe(false);
  });

  it('quiet during npx transient install (path contains _npx)', () => {
    expect(shouldNudge({scriptPath: NPX, npmCommand: 'install', isSetUp: false})).toBe(false);
  });

  it('quiet during npx (npm_command=exec) — avoids double-nudge before init', () => {
    expect(shouldNudge({scriptPath: DEP, npmCommand: 'exec', isSetUp: false})).toBe(false);
  });

  it('quiet once the project is already set up', () => {
    expect(shouldNudge({scriptPath: DEP, npmCommand: 'install', isSetUp: true})).toBe(false);
  });

  it('quiet with no script path (defensive)', () => {
    expect(shouldNudge({})).toBe(false);
  });
});
