// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatMessageMetadata} from './ChatMessageMetadata';
import {colorVars} from '../theme/tokens.stylex';

describe('ChatMessageMetadata', () => {
  it('renders metadata content', () => {
    render(
      <ChatMessageMetadata
        timestamp="12:00"
        status="read"
        data-testid="meta"
      />,
    );
    expect(screen.getByTestId('meta')).toBeTruthy();
  });

  it('forwards rest props (data-*, aria-*, id) to the root element', () => {
    render(
      <ChatMessageMetadata
        timestamp="12:00"
        data-testid="meta"
        data-custom="x"
        id="meta-1"
      />,
    );
    const root = screen.getByTestId('meta');
    expect(root).toHaveAttribute('data-custom', 'x');
    expect(root).toHaveAttribute('id', 'meta-1');
  });

  describe('error status color', () => {
    // StyleX injects atomic rules into the document; scan them so we can
    // assert which token the rendered class resolves to.
    function injectedCss(): string {
      let out = '';
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            out += rule.cssText + '\n';
          }
        } catch {
          // ignore cross-origin sheets
        }
      }
      out += Array.from(document.querySelectorAll('style'))
        .map(s => s.textContent || '')
        .join('\n');
      return out;
    }

    function escapeRegExp(s: string): string {
      return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    it('colors the error status text with the red TEXT token, not the error fill token', () => {
      // --color-error is a FILL token tuned for error surfaces; after #5019
      // darkened it for dark mode, using it for TEXT drops below AA contrast.
      // Error-colored text must use the dedicated text token --color-text-red
      // (the pairing FieldStatus and ChatComposer already use).
      const {container} = render(<ChatMessageMetadata status="error" />);
      const statusEl = container.querySelector('[class*="statusError"]');
      expect(statusEl).not.toBeNull();
      const css = injectedCss();
      const classes = (statusEl!.getAttribute('class') || '')
        .split(/\s+/)
        .filter(Boolean);
      // Some class on the element must carry `color: var(--color-text-red…)`.
      // The (?![a-zA-Z0-9_-]) boundary keeps a class name from matching a
      // longer class it merely prefixes.
      const hasTextRedColor = classes.some(c =>
        new RegExp(
          '\\.' +
            escapeRegExp(c) +
            '(?![a-zA-Z0-9_-])[^{]*\\{[^}]*color: ' +
            escapeRegExp(colorVars['--color-text-red']),
        ).test(css),
      );
      expect(hasTextRedColor).toBe(true);
    });
  });
});
