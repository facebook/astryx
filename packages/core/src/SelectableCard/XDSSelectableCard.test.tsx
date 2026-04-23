import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSSelectableCard} from './XDSSelectableCard';

describe('XDSSelectableCard', () => {
  it('renders children', () => {
    render(
      <XDSSelectableCard label="Test" isSelected={false} onChange={() => {}}>
        <span>Card content</span>
      </XDSSelectableCard>,
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('calls onChange with toggled value on click', () => {
    const handleChange = vi.fn();
    render(
      <XDSSelectableCard label="Test" isSelected={false} onChange={handleChange}>
        Content
      </XDSSelectableCard>,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when deselecting', () => {
    const handleChange = vi.fn();
    render(
      <XDSSelectableCard label="Test" isSelected={true} onChange={handleChange}>
        Content
      </XDSSelectableCard>,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('has correct ARIA attributes when selected', () => {
    render(
      <XDSSelectableCard label="Plan A" isSelected={true} onChange={() => {}}>
        Content
      </XDSSelectableCard>,
    );
    const card = screen.getByRole('checkbox');
    expect(card).toHaveAttribute('aria-checked', 'true');
    expect(card).toHaveAttribute('aria-label', 'Plan A');
  });

  it('has correct ARIA attributes when unselected', () => {
    render(
      <XDSSelectableCard label="Plan B" isSelected={false} onChange={() => {}}>
        Content
      </XDSSelectableCard>,
    );
    const card = screen.getByRole('checkbox');
    expect(card).toHaveAttribute('aria-checked', 'false');
  });

  it('handles disabled state', () => {
    const handleChange = vi.fn();
    render(
      <XDSSelectableCard
        label="Disabled"
        isSelected={false}
        onChange={handleChange}
        isDisabled
      >
        Content
      </XDSSelectableCard>,
    );
    const card = screen.getByRole('checkbox');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(card);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('toggles on Enter key', () => {
    const handleChange = vi.fn();
    render(
      <XDSSelectableCard label="Test" isSelected={false} onChange={handleChange}>
        Content
      </XDSSelectableCard>,
    );
    fireEvent.keyDown(screen.getByRole('checkbox'), {key: 'Enter'});
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('toggles on Space key', () => {
    const handleChange = vi.fn();
    render(
      <XDSSelectableCard label="Test" isSelected={true} onChange={handleChange}>
        Content
      </XDSSelectableCard>,
    );
    fireEvent.keyDown(screen.getByRole('checkbox'), {key: ' '});
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});
