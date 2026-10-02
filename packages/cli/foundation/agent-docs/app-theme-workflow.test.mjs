// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {generateCompressedIndex} from './agent-docs.mjs';

describe('generated agent docs app-theme workflow', () => {
  it('keeps the add, extend, and eject guidance together', () => {
    const result = generateCompressedIndex('1.0.0');

    expect(result).toContain('theme add <slug>');
    expect(result).toContain('generated app module');
    expect(result).toContain('Extend that theme');
    expect(result).toContain('theme eject <slug>` only to fork source');
    expect(result).toContain('Never override --color-');
  });
});
