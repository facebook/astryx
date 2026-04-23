import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSClickableCard} from './XDSClickableCard';

describe('XDSClickableCard', () => {
  it('renders children', () => {
    render(
      <XDSClickableCard label="Test card" onClick={() => {}}>
        <span>Card content</span>
      </XDSClickableCard>,
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('calls onClick when card surface is clicked', () => {
    const handleClick = vi.fn();
    render(
      <XDSClickableCard label="Test card" onClick={handleClick}>
        <span>Content</span>
      </XDSClickableCard>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClick when a nested button is clicked', () => {
    const handleCardClick = vi.fn();
    const handleButtonClick = vi.fn();
    render(
      <XDSClickableCard label="Test card" onClick={handleCardClick}>
        <button onClick={handleButtonClick}>Nested</button>
      </XDSClickableCard>,
    );
    fireEvent.click(screen.getByText('Nested'));
    expect(handleButtonClick).toHaveBeenCalledTimes(1);
    // Card's onClick should NOT fire because click was on a nested interactive
    expect(handleCardClick).not.toHaveBeenCalled();
  });

  it('has correct ARIA attributes', () => {
    render(
      <XDSClickableCard label="Settings card" onClick={() => {}}>
        Content
      </XDSClickableCard>,
    );
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Settings card');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('uses role="link" when href is provided', () => {
    render(
      <XDSClickableCard label="Nav card" href="/settings">
        Content
      </XDSClickableCard>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    const handleClick = vi.fn();
    render(
      <XDSClickableCard label="Disabled" onClick={handleClick} isDisabled>
        Content
      </XDSClickableCard>,
    );
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    expect(card).toHaveAttribute('tabindex', '-1');
    fireEvent.click(card);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('responds to Enter key', () => {
    const handleClick = vi.fn();
    render(
      <XDSClickableCard label="Test" onClick={handleClick}>
        Content
      </XDSClickableCard>,
    );
    fireEvent.keyDown(screen.getByRole('button'), {key: 'Enter'});
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('responds to Space key', () => {
    const handleClick = vi.fn();
    render(
      <XDSClickableCard label="Test" onClick={handleClick}>
        Content
      </XDSClickableCard>,
    );
    fireEvent.keyDown(screen.getByRole('button'), {key: ' '});
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
