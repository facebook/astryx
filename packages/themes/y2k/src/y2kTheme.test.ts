// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {generateThemeCSS} from '@astryxdesign/core/theme';
import {y2kTheme} from './y2kTheme';

describe('y2k secondary ComplexSelector', () => {
  it('keeps the hover fill off a disabled trigger in either form', () => {
    expect(generateThemeCSS(y2kTheme).component).toMatch(
      /:hover:not\(:has\(> ?:is\(:disabled, ?\[aria-disabled="true"\]\)\)\)/,
    );
  });
});
