import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSChip} from './XDSChip';

describe('XDSChip', () => {
  it('renders with default variant', () => {
    render(<XDSChip>React</XDSChip>);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const {rerender} = render(<XDSChip variant="info">Info</XDSChip>);
    expect(screen.getByText('Info')).toBeInTheDocument();
    rerender(<XDSChip variant="success">Success</XDSChip>);
    expect(screen.getByText('Success')).toBeInTheDocument();
    rerender(<XDSChip variant="error">Error</XDSChip>);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders dismiss button when onDismiss is provided', () => {
    const onDismiss = vi.fn();
    render(<XDSChip onDismiss={onDismiss}>Tag</XDSChip>);
    const button = screen.getByRole('button', {name: 'Remove'});
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('does not render dismiss button without onDismiss', () => {
    render(<XDSChip>Tag</XDSChip>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <XDSChip icon={<span data-testid="icon">#</span>}>With Icon</XDSChip>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLSpanElement | null};
    render(<XDSChip ref={ref}>Test</XDSChip>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
