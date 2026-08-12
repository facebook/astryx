// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file InputClearButton.test.tsx
 * @input Uses vitest, @testing-library/react, InputClearButton, Icon, theme
 * @output Unit tests for the shared clear-button primitive
 * @position Testing; validates InputClearButton.tsx — the single home for the
 *   clearable input family's clear (✕) affordance and its theme target.
 *
 * SYNC: When InputClearButton.tsx changes, update tests to match new behavior.
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {InputClearButton} from './InputClearButton';
import {Icon} from '../Icon';
import {defineTheme} from '../theme/defineTheme';
import {generateThemeCSS} from '../theme/generateThemeRules';

function generateThemeTestCSS(theme: Parameters<typeof generateThemeCSS>[0]) {
  const {prose, component} = generateThemeCSS(theme);
  return [prose, component].filter(Boolean).join('\n\n');
}

const getGlyph = (): HTMLElement => {
  const button = screen.getByRole('button', {name: 'Clear'});
  const icon = button.querySelector('.astryx-icon');
  if (icon == null) {
    throw new Error('clear glyph not found');
  }
  return icon as HTMLElement;
};

describe('InputClearButton', () => {
  it('renders a real button with the given accessible label', () => {
    render(<InputClearButton label="Clear" onClick={() => {}} />);
    const button = screen.getByRole('button', {name: 'Clear'});
    expect(button.tagName).toBe('BUTTON');
  });

  it('fires onClick with the native event when pressed', () => {
    const onClick = vi.fn();
    render(<InputClearButton label="Clear" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0]).toBeInstanceOf(Object);
  });

  it('renders the astryx-input-clear-icon target on the glyph', () => {
    // One canonical target on the icon element itself — so a theme restyles
    // the clear glyph across the whole input family from a single place.
    render(<InputClearButton label="Clear" onClick={() => {}} />);
    const glyph = getGlyph();
    expect(glyph).toHaveClass('astryx-input-clear-icon');
    expect(glyph).toHaveClass('astryx-icon');
  });

  it('matches a standalone inherit/sm close icon aside from the target class', () => {
    // The glyph inherits the ghost button's color; aside from the target class
    // it is exactly a close/sm/inherit Icon, so the default look is defined
    // once here rather than per input.
    render(<InputClearButton label="Clear" onClick={() => {}} />);
    const glyph = getGlyph();

    const {container} = render(<Icon icon="close" size="sm" color="inherit" />);
    const refIcon = container.querySelector('.astryx-icon') as HTMLElement;

    const styleClasses = (el: HTMLElement) =>
      el.className
        .split(' ')
        .filter(c => c !== 'astryx-input-clear-icon')
        .sort();

    expect(styleClasses(glyph)).toEqual(styleClasses(refIcon));
  });

  it('merges an extra iconClassName beside the canonical target', () => {
    // Consumers that shipped a component-specific target before the family
    // converged pass it through here to keep emitting it for a deprecation
    // window.
    render(
      <InputClearButton
        label="Clear"
        onClick={() => {}}
        iconClassName="astryx-date-input-clear-icon"
      />,
    );
    const glyph = getGlyph();
    expect(glyph).toHaveClass('astryx-input-clear-icon');
    expect(glyph).toHaveClass('astryx-date-input-clear-icon');
  });

  it('exposes input-clear-icon so a theme reaches the glyph color, size, and hover', () => {
    const theme = defineTheme({
      name: 'input-clear-icon-test',
      components: {
        'input-clear-icon': {
          base: {
            width: '12px',
            height: '12px',
            fontSize: '12px',
            color: 'var(--color-icon-secondary)',
            ':hover': {color: 'var(--color-icon-primary)'},
          },
        },
      },
    });
    const css = generateThemeTestCSS(theme);
    expect(css).toContain('.astryx-input-clear-icon {');
    expect(css).toContain('width: 12px');
    expect(css).toContain('.astryx-input-clear-icon:hover {');
    expect(css).toContain('color: var(--color-icon-primary)');
  });
});
