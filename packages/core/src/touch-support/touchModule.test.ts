// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchModule.test.ts
 * @input touchModule and the internal `internal/touch` entry
 * @output INV13's module checks: the module gathers the gesture core, frozen;
 *   the internal entry exposes that same module; importing it attaches no
 *   window or document listeners, so a page with only a fine pointer runs
 *   none (`spec:AST-094` FR19, FR24)
 * @position Unit tests of packages/core/src/touch-support
 *   (architecture:react-component-runtime INV13)
 */

import {afterEach, describe, expect, it, vi} from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('touchModule', () => {
  it('gathers the gesture core, frozen', async () => {
    const {touchModule} = await import('./touchModule');
    expect(Object.isFrozen(touchModule)).toBe(true);
    for (const member of [
      'GestureArena',
      'GestureRecognizer',
      'TapGestureRecognizer',
      'LongPressGestureRecognizer',
    ]) {
      expect(typeof touchModule[member as keyof typeof touchModule]).toBe(
        'function',
      );
    }
  });

  it('is the module the internal entry exposes', async () => {
    const {touchModule} = await import('./touchModule');
    const entry = await import('../internal/touch');
    expect(entry.touchModule).toBe(touchModule);
  });

  it('attaches no window or document listeners when it loads', async () => {
    vi.resetModules();
    const onWindow = vi.spyOn(window, 'addEventListener');
    const onDocument = vi.spyOn(document, 'addEventListener');
    await import('../internal/touch');
    expect(onWindow).not.toHaveBeenCalled();
    expect(onDocument).not.toHaveBeenCalled();
  });
});
