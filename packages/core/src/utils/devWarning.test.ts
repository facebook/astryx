// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  devWarn,
  devError,
  warnOnce,
  formatDevMessage,
  __resetDevWarnings,
} from './devWarning';

afterEach(() => {
  __resetDevWarnings();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('formatDevMessage', () => {
  it('keeps the public formatter stable', () => {
    expect(formatDevMessage('Field', 'oops')).toBe('Field: oops');
  });
});

describe('devWarn', () => {
  it('warns with CLI guidance and forwards extra args', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const detail = {a: 1};
    devWarn('Popover', 'no button', detail);
    expect(warn).toHaveBeenCalledWith(
      'Popover: no button\nAstryx CLI: npx @astryxdesign/cli search "Popover"',
      detail,
    );
  });
});

describe('devError', () => {
  it('includes CLI guidance in development', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('boom');
    devError('Table', 'plugin threw:', err);
    expect(error).toHaveBeenCalledWith(
      'Table: plugin threw:\nAstryx CLI: npx @astryxdesign/cli search "Table"',
      err,
    );
  });

  it('keeps production error text unchanged', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const {devError: productionDevError} = await import('./devWarning');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('boom');

    productionDevError('Table', 'plugin threw:', err);

    expect(error).toHaveBeenCalledWith('Table: plugin threw:', err);
  });
});

describe('warnOnce', () => {
  it('fires at most once per key', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnOnce('k', 'Theme', 'runtime injection');
    warnOnce('k', 'Theme', 'runtime injection');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      'Theme: runtime injection\nAstryx CLI: npx @astryxdesign/cli search "Theme"',
    );
  });

  it('fires again for a different key', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnOnce('a', 'Theme', 'one');
    warnOnce('b', 'Theme', 'two');
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
