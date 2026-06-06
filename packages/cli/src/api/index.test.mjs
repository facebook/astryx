// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import * as api from './index.mjs';

// The public @xds/cli/api barrel should re-export every programmatic command
// so consumers (AI agents, build tools) access them consistently.

describe('@xds/cli/api barrel', () => {
  it('re-exports all command functions and XDSError', () => {
    for (const name of [
      'component',
      'docs',
      'discover',
      'template',
      'hook',
    ]) {
      expect(typeof api[name], `expected api.${name} to be a function`).toBe(
        'function',
      );
    }
    expect(typeof api.XDSError).toBe('function');
  });

  it('exposes hook with parity to the other commands', () => {
    // Regression guard: `hook` was previously missing from the barrel even
    // though component/docs/discover/template were all exported.
    expect(api.hook).toBeDefined();
    expect(typeof api.hook).toBe('function');
    // Returns a promise (async), like the other command APIs.
    const result = api.hook(undefined, {cwd: '/nonexistent-xds-path'});
    expect(result).toBeInstanceOf(Promise);
    // Swallow the expected rejection (no @xds/core in this path).
    return result.catch(() => {});
  });
});
