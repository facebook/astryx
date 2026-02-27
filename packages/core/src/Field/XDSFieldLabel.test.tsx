/**
 * @file XDSFieldLabel.test.tsx
 * @input Uses vitest, @testing-library/react, XDSFieldLabel component
 * @output Unit tests for XDSFieldLabel component behavior
 * @position Testing; validates XDSFieldLabel.tsx implementation
 *
 * SYNC: When XDSFieldLabel.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {StarIcon} from '@heroicons/react/24/outline';
import {XDSFieldLabel} from './XDSFieldLabel';

describe('XDSFieldLabel', () => {
  it('renders label text', () => {
    render(<XDSFieldLabel label="Email" inputID="email-input" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('associates label with input via htmlFor', () => {
    render(<XDSFieldLabel label="Email" inputID="email-input" />);
    const label = screen.getByText('Email').closest('label');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('renders Optional text when isOptional is true', () => {
    render(<XDSFieldLabel label="Name" inputID="name-input" isOptional />);
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });

  it('renders Required text when isRequired is true', () => {
    render(<XDSFieldLabel label="Name" inputID="name-input" isRequired />);
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('shows Optional when both isOptional and isRequired are true', () => {
    render(
      <XDSFieldLabel label="Name" inputID="name-input" isOptional isRequired />,
    );
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
    expect(screen.queryByText(/Required/)).not.toBeInTheDocument();
  });

  it('renders labelIcon when provided', () => {
    render(
      <XDSFieldLabel
        label="Starred"
        inputID="starred-input"
        labelIcon={StarIcon}
      />,
    );
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSFieldLabel ref={ref} label="Name" inputID="name-input" />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLLabelElement));
  });

  it('renders tooltip info icon when labelTooltip prop is provided', () => {
    render(
      <XDSFieldLabel
        label="Help"
        inputID="help-input"
        labelTooltip="This is helpful information"
      />,
    );
    // Two SVGs: the info icon is wrapped in tooltip
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('does not render extra icon when labelTooltip is not provided', () => {
    render(<XDSFieldLabel label="Name" inputID="name-input" />);
    // No SVGs should be present when no icons are provided
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders labelTooltip with Optional indicator together', () => {
    render(
      <XDSFieldLabel
        label="Field"
        inputID="field-input"
        isOptional
        labelTooltip="Help text"
      />,
    );
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
    // Info icon should be present
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});
