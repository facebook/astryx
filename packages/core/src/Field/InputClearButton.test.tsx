// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file InputClearButton.test.tsx
 * @input Uses vitest, @testing-library/react, the global icon registry
 * @output Unit tests for InputClearButton
 * @position Colocated unit test; covers the accessible name, the click
 *   callback, the decorative close icon, and xstyle forwarding
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {InputClearButton} from './InputClearButton';
import {registerIcons, resetIcons} from '../Icon';
import {declaredValue} from '../__tests__/stylexDeclarations';

const testStyles = stylex.create({
  wide: {width: '999px'},
});

describe('InputClearButton', () => {
  afterEach(() => {
    resetIcons();
  });

  it('uses the label prop as the accessible name', () => {
    render(<InputClearButton label="Clear search" onClick={() => {}} />);
    expect(
      screen.getByRole('button', {name: 'Clear search'}),
    ).toBeInTheDocument();
  });

  it('renders no visible text so the button stays icon-only', () => {
    render(<InputClearButton label="Clear search" onClick={() => {}} />);
    expect(screen.getByRole('button', {name: 'Clear search'}).textContent).toBe(
      '',
    );
  });

  it('calls onClick with the click event when pressed', () => {
    const onClick = vi.fn();
    render(<InputClearButton label="Clear" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0]).toMatchObject({type: 'click'});
  });

  it('renders the close icon from the global icon registry', () => {
    registerIcons({
      close: (
        <svg data-testid="custom-close">
          <path d="M0 0" />
        </svg>
      ),
    });
    render(<InputClearButton label="Clear" onClick={() => {}} />);
    expect(screen.getByTestId('custom-close')).toBeInTheDocument();
  });

  it('hides the close icon from the accessibility tree', () => {
    registerIcons({
      close: (
        <svg data-testid="custom-close">
          <path d="M0 0" />
        </svg>
      ),
    });
    render(<InputClearButton label="Clear" onClick={() => {}} />);
    const iconWrapper = screen.getByTestId('custom-close').closest('span')!;
    expect(iconWrapper).toHaveAttribute('aria-hidden', 'true');
    // The icon contributes nothing to the name — the label is the whole name.
    expect(screen.getByRole('button')).toHaveAccessibleName('Clear');
  });

  it('keeps its own 20px height when no xstyle is given', () => {
    render(<InputClearButton label="Clear" onClick={() => {}} />);
    expect(declaredValue(screen.getByRole('button'), 'height')).toBe('20px');
  });

  it('applies the caller xstyle to the button', () => {
    render(
      <InputClearButton
        label="Clear"
        onClick={() => {}}
        xstyle={testStyles.wide}
      />,
    );
    expect(declaredValue(screen.getByRole('button'), 'width')).toBe('999px');
  });
});
