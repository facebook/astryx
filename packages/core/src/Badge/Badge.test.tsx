// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Badge} from './Badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge label="Default" />);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('renders with semantic variants', () => {
    const {rerender} = render(<Badge variant="success" label="Success" />);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<Badge variant="error" label="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();

    rerender(<Badge variant="warning" label="Warning" />);
    expect(screen.getByText('Warning')).toBeInTheDocument();

    rerender(<Badge variant="info" label="Info" />);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('renders with non-semantic color variants', () => {
    const colors = [
      'blue',
      'cyan',
      'green',
      'orange',
      'pink',
      'purple',
      'red',
      'teal',
      'yellow',
    ] as const;

    const {rerender} = render(
      <Badge variant={colors[0]} label={colors[0]} />,
    );
    expect(screen.getByText(colors[0])).toBeInTheDocument();

    for (const color of colors.slice(1)) {
      rerender(<Badge variant={color} label={color} />);
      expect(screen.getByText(color)).toBeInTheDocument();
    }
  });

  it('applies astryx class name with non-semantic variant', () => {
    const {container} = render(<Badge variant="purple" label="Tag" />);
    const root = container.firstElementChild!;
    expect(root.className).toContain('astryx-badge');
    expect(root.className).toContain('purple');
  });

  it('renders with icon', () => {
    render(
      <Badge icon={<span data-testid="icon">*</span>} label="With Icon" />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLSpanElement | null};
    render(<Badge ref={ref} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('spreads additional props', () => {
    render(<Badge data-testid="custom-badge" label="Test" />);
    expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
  });

  it('renders astryx-* class names for theme targeting', () => {
    const {container} = render(<Badge variant="success" label="Active" />);
    const root = container.firstElementChild!;
    expect(root.className).toContain('astryx-badge');
    expect(root.className).toContain('success');
  });
});
