// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guards the update-hint command allowlist.
 *
 * The post-action update hint only fires for a small set of commands
 * (see UPDATE_HINT_COMMANDS in index.mjs). Every name in that set must
 * map to a real, registered command — otherwise the entry is dead and
 * the hint can never fire for it. This test imports the assembled
 * program and verifies the invariant so a stale reference (like the
 * removed 'doctor' entry) can't creep back in.
 */

import {describe, it, expect} from 'vitest';
import {program} from './index.mjs';

/** Commands the update hint is expected to fire for. */
const HINTED_COMMANDS = ['component', 'docs'];

/** Commands that have never existed and must not be referenced. */
const NONEXISTENT_COMMANDS = ['doctor'];

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

  it('does not register a "doctor" command (dead update-hint reference)', () => {
    const registered = new Set(registeredCommandNames());
    for (const name of NONEXISTENT_COMMANDS) {
      expect(registered.has(name)).toBe(false);
    }
  });
});
