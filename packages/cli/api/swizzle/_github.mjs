// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file GitHub utilities for Astryx CLI
 *
 * Shared helpers for interacting with the GitHub CLI (`gh`).
 */

import {execFileSync} from 'node:child_process';

/**
 * Check if `gh` CLI is installed and authenticated.
 * Returns true if ready, false otherwise.
 */
export function checkGhCli() {
  try {
    execFileSync('gh', ['auth', 'status'], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}
