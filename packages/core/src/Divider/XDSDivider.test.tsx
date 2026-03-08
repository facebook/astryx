/**
 * @file XDSDivider.test.tsx
 * @input Uses vitest, @testing-library/react, XDSDivider component
 * @output Unit tests for XDSDivider component behavior
 * @position Testing; validates XDSDivider.tsx implementation
 *
 * SYNC: When XDSDivider.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSDivider} from './XDSDivider';

describe('XDSDivider', () => {
  it('renders horizontal by default', () => {
    render(<XDSDivider data-testid="divider" />);
    const element = screen.getByTestId('divider');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('role', 'separator');
    expect(element).toHaveAttribute('aria-orientation', 'horizontal');
    // Without label, should have 1 child (single line)
    const children = Array.from(element.children);
    expect(children.length).toBe(1);
  });

  it('renders vertical when specified', () => {
    render(<XDSDivider orientation="vertical" data-testid="divider" />);
    const element = screen.getByTestId('divider');
    expect(element).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('renders with label', () => {
    render(<XDSDivider label="Section" />);
    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  it('renders label centered with lines on both sides', () => {
    render(<XDSDivider label="Center" data-testid="divider" />);
    const divider = screen.getByTestId('divider');
    expect(divider).toBeInTheDocument();
    expect(screen.getByText('Center')).toBeInTheDocument();
    // Should have 3 children: line, label, line
    const children = Array.from(divider.children);
    expect(children.length).toBe(3);
  });

  it('applies isFullBleed styles', () => {
    render(<XDSDivider isFullBleed data-testid="divider" />);
    const element = screen.getByTestId('divider');
    expect(element).toBeInTheDocument();
    // isFullBleed is applied via stylex, we verify component renders without error
  });

  it('applies subtle variant by default', () => {
    render(<XDSDivider data-testid="divider" />);
    const element = screen.getByTestId('divider');
    expect(element).toBeInTheDocument();
  });

  it('applies strong variant when specified', () => {
    render(<XDSDivider variant="strong" data-testid="divider" />);
    const element = screen.getByTestId('divider');
    expect(element).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSDivider ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('passes through additional props', () => {
    render(<XDSDivider data-testid="divider" aria-label="Content separator" />);
    const element = screen.getByTestId('divider');
    expect(element).toHaveAttribute('aria-label', 'Content separator');
  });

  it('renders with ReactNode as label', () => {
    render(
      <XDSDivider
        label={<span data-testid="custom-label">Custom</span>}
        data-testid="divider"
      />,
    );
    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
  });

  it('renders vertical divider with label', () => {
    render(
      <XDSDivider
        orientation="vertical"
        label="Vertical"
        data-testid="divider"
      />,
    );
    const divider = screen.getByTestId('divider');
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByText('Vertical')).toBeInTheDocument();
  });

  it('renders xds-* class names for theme targeting', () => {
    render(
      <XDSDivider
        variant="strong"
        orientation="vertical"
        data-testid="divider"
      />,
    );
    const root = screen.getByTestId('divider');
    expect(root.className).toContain('xds-divider');
    expect(root.className).toContain('strong');
    expect(root.className).toContain('vertical');
  });
});
