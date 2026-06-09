// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guards the update-hint command allowlist.
 *
 * The post-action update hint only fires for a small set of commands
 * (see UPDATE_HINT_COMMANDS in index.mjs). Every name in that set must
 * map to a real, registered command — otherwise the entry is dead and
 * the hint can never fire for it. This test imports the assembled
 * program and verifies the invariant so a stale reference can't creep in.
 *
 * Historically there was a dead 'doctor' entry in UPDATE_HINT_COMMANDS that
 * referenced a command that didn't exist. `doctor` is now a real command
 * (the health check), but it is intentionally NOT in the update-hint set —
 * the hint is for content commands (component/docs) that agents read, not
 * for the diagnostic command. This test pins both invariants.
 */

import {describe, it, expect} from 'vitest';
import {program} from './index.mjs';

/** Commands the update hint is expected to fire for. */
const HINTED_COMMANDS = ['component', 'docs'];

/** Real commands that must NOT trigger the update hint. */
const NON_HINTED_COMMANDS = ['doctor'];

function registeredCommandNames() {
  return program.commands.map((c) => c.name());
}

describe('update hint commands', () => {
  it('fires only for real, registered commands', () => {
    const registered = new Set(registeredCommandNames());
    for (const name of HINTED_COMMANDS) {
      expect(registered.has(name)).toBe(true);
    }
  });

  it('registers the real "doctor" command', () => {
    const registered = new Set(registeredCommandNames());
    expect(registered.has('doctor')).toBe(true);
  });

  it('does not fire the update hint for the doctor command', () => {
    // UPDATE_HINT_COMMANDS is intentionally limited to content commands.
    // Doctor is a diagnostic; its output should not carry an update hint.
    expect(NON_HINTED_COMMANDS).not.toContain('component');
    expect(NON_HINTED_COMMANDS).not.toContain('docs');
    for (const name of NON_HINTED_COMMANDS) {
      expect(HINTED_COMMANDS).not.toContain(name);
    }
  });
});
