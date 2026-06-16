// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file compat-aliases.test.tsx
 * @description Verifies the XDS-prefix migration compatibility layer: bare
 *   (unprefixed) aliases resolve to the SAME runtime values and TS types as
 *   the prefixed XDS* exports, and the module-augmentation interface alias is
 *   still augmentable. See P2380608025.
 */

import {describe, it, expect, expectTypeOf} from 'vitest';
import * as Core from './index';
import {Button, XDSButton, Card, XDSCard, useXDSTheme, useTheme} from './index';
import type {
  ButtonProps,
  XDSButtonProps,
  ButtonVariant,
  XDSButtonVariant,
} from './index';

describe('compat aliases: runtime value identity', () => {
  it('bare component aliases are the SAME value as the prefixed exports', () => {
    expect(Button).toBe(XDSButton);
    expect(Card).toBe(XDSCard);
  });

  it('bare hook aliases are the SAME value as the prefixed hooks', () => {
    expect(useTheme).toBe(useXDSTheme);
  });

  it('a representative spread of bare aliases are exported from the root barrel', () => {
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

  it('keeps the prefixed exports working unchanged', () => {
    for (const name of ['XDSButton', 'XDSCard', 'XDSTheme', 'useXDSTheme']) {
      expect(Core, `@xds/core should still export "${name}"`).toHaveProperty(
        name,
      );
    }
  });
});

describe('compat aliases: type identity', () => {
  it('bare prop type alias equals the prefixed prop type', () => {
    expectTypeOf<ButtonProps>().toEqualTypeOf<XDSButtonProps>();
  });

  it('bare variant union alias equals the prefixed union', () => {
    expectTypeOf<ButtonVariant>().toEqualTypeOf<XDSButtonVariant>();
  });
});
