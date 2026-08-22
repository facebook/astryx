// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {colorVars} from '@astryxdesign/core/theme/tokens.stylex';
import {ChatUnreadDivider} from './ChatUnreadDivider';

// StyleX injects atomic rules into the document; scan them so we can assert
// which token a rendered element's color resolves from.
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

describe('ChatUnreadDivider', () => {
  it('renders a separator', () => {
    render(<ChatUnreadDivider />);
    expect(screen.getByRole('separator')).toBeTruthy();
  });

  it('shows the default label', () => {
    render(<ChatUnreadDivider />);
    expect(screen.getByText('New')).toBeTruthy();
    expect(screen.getByRole('separator').getAttribute('aria-label')).toBe(
      'New messages below',
    );
  });

  it('shows a custom label', () => {
    render(<ChatUnreadDivider label="Unread" />);
    expect(screen.getByText('Unread')).toBeTruthy();
    expect(screen.getByRole('separator').getAttribute('aria-label')).toBe(
      'Unread messages below',
    );
  });

  it('applies the stable class name', () => {
    render(<ChatUnreadDivider data-testid="divider" />);
    expect(screen.getByTestId('divider').className).toContain(
      'astryx-chat-unread-divider',
    );
  });

  it('colors the label with the error text token', () => {
    // WHY: --color-error is a FILL token; #5019 (PR #5025) darkened its
    // dark-mode value for white-on-error fills, which drops it below WCAG AA
    // as TEXT on the chat background. Text needs the dedicated text token
    // --color-text-red, the pairing FieldStatus and ChatComposer already use.
    render(<ChatUnreadDivider />);
    const label = screen.getByText('New');
    const css = injectedCss();
    // StyleX emits one atomic class per property+value pair; the label must
    // carry a class whose rule sets `color` to the text-red var() reference.
    const hasTextRedColor = label.className
      .split(/\s+/)
      .filter(Boolean)
      .some(c =>
        new RegExp(
          '\\.' +
            escapeRegExp(c) +
            // boundary: class-name prefixes collide without it
            '(?![a-zA-Z0-9_-])[^{]*\\{[^}]*color:\\s*' +
            escapeRegExp(colorVars['--color-text-red']),
        ).test(css),
      );
    expect(hasTextRedColor).toBe(true);
  });
});
