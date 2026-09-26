// Copyright (c) Meta Platforms, Inc. and affiliates.

import {expect, it} from 'vitest';
import type {ComponentIconMap} from '@astryxdesign/core/Icon';
import {defineTheme} from '../theme/defineTheme';

declare module '@astryxdesign/core/Icon' {
  interface ComponentIconSlotMap {
    'test-package-custom-slot': true;
  }
}

it('allows public Icon module augmentation to extend theme slot names', () => {
  const componentIcons: ComponentIconMap = {
    'test-package-custom-slot': 'check',
  };
  const theme = defineTheme({name: 'augmented-icon-slot', componentIcons});

  expect(theme.componentIcons?.['test-package-custom-slot']).toBe('check');
});
