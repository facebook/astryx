import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSBadge} from './XDSBadge';

describe('XDSBadge', () => {
  it('renders with default variant', () => {
    render(<XDSBadge label="Default" />);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const {rerender} = render(<XDSBadge variant="success" label="Success" />);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<XDSBadge variant="error" label="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();

    rerender(<XDSBadge variant="warning" label="Warning" />);
    expect(screen.getByText('Warning')).toBeInTheDocument();

    rerender(<XDSBadge variant="info" label="Info" />);
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
      <XDSBadge variant={colors[0]} label={colors[0]} />,
    );
    expect(screen.getByText(colors[0])).toBeInTheDocument();

    for (const color of colors.slice(1)) {
      rerender(<XDSBadge variant={color} label={color} />);
      expect(screen.getByText(color)).toBeInTheDocument();
    }
  });

  it('applies xds class name with non-semantic variant', () => {
    const {container} = render(
      <XDSBadge variant="purple" label="Tag" />,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('xds-badge');
    expect(root.className).toContain('purple');
  });

  it('renders as dot with shape="dot"', () => {
    render(<XDSBadge variant="success" shape="dot" label="Online" />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('dot shape has accessible label via visually hidden text', () => {
    render(
      <XDSBadge
        variant="error"
        shape="dot"
        label="3 unread"
        data-testid="dot-badge"
      />,
    );
    const badge = screen.getByTestId('dot-badge');
    expect(screen.getByText('3 unread')).toBeInTheDocument();
    expect(badge.textContent).toBe('3 unread');
  });

  it('dot shape suppresses icon', () => {
    render(
      <XDSBadge
        label="Status"
        icon={<span data-testid="icon">*</span>}
        shape="dot"
        data-testid="dot-badge"
      />,
    );
    const badge = screen.getByTestId('dot-badge');
    expect(badge.querySelector('[data-testid="icon"]')).toBeNull();
  });

  it('includes shape in xdsClassName', () => {
    const {container} = render(
      <XDSBadge variant="info" label="New" shape="dot" />,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('dot');
  });

  it('renders with icon', () => {
    render(
      <XDSBadge icon={<span data-testid="icon">*</span>} label="With Icon" />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLSpanElement | null};
    render(<XDSBadge ref={ref} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('spreads additional props', () => {
    render(<XDSBadge data-testid="custom-badge" label="Test" />);
    expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
  });

  it('renders xds-* class names for theme targeting', () => {
    const {container} = render(<XDSBadge variant="success" label="Active" />);
    const root = container.firstElementChild!;
    expect(root.className).toContain('xds-badge');
    expect(root.className).toContain('success');
  });
});
