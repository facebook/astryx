import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSBadge} from './XDSBadge';

describe('XDSBadge', () => {
  it('renders with default variant', () => {
    render(<XDSBadge>Default</XDSBadge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('renders with semantic variants', () => {
    const {rerender} = render(<XDSBadge variant="success">Success</XDSBadge>);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<XDSBadge variant="error">Error</XDSBadge>);
    expect(screen.getByText('Error')).toBeInTheDocument();

    rerender(<XDSBadge variant="warning">Warning</XDSBadge>);
    expect(screen.getByText('Warning')).toBeInTheDocument();

    rerender(<XDSBadge variant="info">Info</XDSBadge>);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('renders with non-semantic color variants', () => {
    const colors = [
      'blue',
      'cyan',
      'gray',
      'green',
      'orange',
      'pink',
      'purple',
      'red',
      'teal',
      'yellow',
    ] as const;

    const {rerender} = render(
      <XDSBadge variant={colors[0]}>{colors[0]}</XDSBadge>,
    );
    expect(screen.getByText(colors[0])).toBeInTheDocument();

    for (const color of colors.slice(1)) {
      rerender(<XDSBadge variant={color}>{color}</XDSBadge>);
      expect(screen.getByText(color)).toBeInTheDocument();
    }
  });

  it('renders as dot when no children provided', () => {
    const {container} = render(<XDSBadge variant="success" />);
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toBe('');
  });

  it('renders with icon', () => {
    render(
      <XDSBadge icon={<span data-testid="icon">*</span>}>With Icon</XDSBadge>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLSpanElement | null};
    render(<XDSBadge ref={ref}>Test</XDSBadge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('spreads additional props', () => {
    render(<XDSBadge data-testid="custom-badge">Test</XDSBadge>);
    expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
  });
});
