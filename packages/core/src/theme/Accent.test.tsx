// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterEach, vi} from 'vitest';
import {render, cleanup} from '@testing-library/react';
import React from 'react';
import {Accent} from './Accent';
import {deriveAccentFamily} from './expandColorScale';

/** All stylex-injected CSS rules currently in the document (CSSOM). */
function injectedCSS(): string {
  return Array.from(document.styleSheets)
    .flatMap(sheet => Array.from(sheet.cssRules))
    .map(rule => rule.cssText)
    .join('\n');
}

describe('Accent', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders children', () => {
    const {getByText} = render(
      <Accent color="#FDBA74">
        <span>hello</span>
      </Accent>,
    );
    expect(getByText('hello')).toBeTruthy();
  });

  it('declares the five accent-family tokens with HCT-derived values', () => {
    const {container} = render(
      <Accent color="#FDBA74">
        <span>child</span>
      </Accent>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    const family = deriveAccentFamily('#FDBA74');
    const inlineStyle = wrapper.getAttribute('style') ?? '';
    const css = injectedCSS();

    for (const [token, value] of Object.entries(family)) {
      // Value flows onto the wrapper element (stylex dynamic style)...
      expect(inlineStyle).toContain(value);
      // ...and the token name is declared in the compiled rule.
      expect(css).toContain(token);
    }
  });

  it('warns and applies no overrides for an invalid color', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const {container, getByText} = render(
        <Accent color="tomato">
          <span>still here</span>
        </Accent>,
      );
      expect(getByText('still here')).toBeTruthy();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('#RRGGBB'));
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.getAttribute('style') ?? '').toBe('');
    } finally {
      warn.mockRestore();
    }
  });
});
