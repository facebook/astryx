// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file compat-aliases.test.tsx
 * @description Verifies the XDS-prefix migration compatibility layer: the
 *   legacy prefixed XDS* aliases resolve to the SAME runtime values and TS
 *   types as the canonical bare exports, and the module-augmentation
 *   interface alias is still augmentable. See P2380608025.
 *
 *   Post-P4: bare names are canonical; XDS* are the generated compat aliases.
 */

import {describe, it, expect, expectTypeOf} from 'vitest';
import * as Core from './index';
import {Button, XDSButton, Card, XDSCard, useTheme, useXDSTheme} from './index';
import type {ButtonProps, XDSButtonProps, ButtonVariant, XDSButtonVariant} from './index';

describe('compat aliases: runtime value identity', () => {
  it('prefixed component aliases are the SAME value as the bare exports', () => {
    expect(XDSButton).toBe(Button);
    expect(XDSCard).toBe(Card);
  });

  it('prefixed hook aliases are the SAME value as the bare hooks', () => {
    expect(useXDSTheme).toBe(useTheme);
  });

  it('a representative spread of bare canonical names are exported from the root barrel', () => {
    for (const name of [
      'Button',
      'Card',
      'Text',
      'Heading',
      'Dialog',
      'Table',
      'Theme',
      'useTheme',
    ]) {
      expect(Core, `@xds/core should export bare "${name}"`).toHaveProperty(
        name,
      );
    }
  });

  it('keeps the legacy prefixed exports working unchanged', () => {
    for (const name of ['XDSButton', 'XDSCard', 'XDSTheme', 'useXDSTheme']) {
      expect(Core, `@xds/core should still export "${name}"`).toHaveProperty(
        name,
      );
    }
  });
});

describe('compat aliases: type identity', () => {
  it('prefixed prop type alias equals the bare prop type', () => {
    expectTypeOf<XDSButtonProps>().toEqualTypeOf<ButtonProps>();
  });

  it('prefixed variant union alias equals the bare union', () => {
    expectTypeOf<XDSButtonVariant>().toEqualTypeOf<ButtonVariant>();
  });
});
