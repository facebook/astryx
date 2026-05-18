// Copyright (c) Meta Platforms, Inc. and affiliates.

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

  it('renders a hidden button for onClick cards', () => {
    render(
      <XDSClickableCard label="Test card" onClick={() => {}}>
        <span>Content</span>
      </XDSClickableCard>,
    );
    const button = screen.getByRole('button', {name: 'Test card'});
    expect(button).toBeInTheDocument();
  });

  it('renders a hidden link for href cards', () => {
    render(
      <XDSClickableCard label="Nav card" href="/settings">
        Content
      </XDSClickableCard>,
    );
    const link = screen.getByRole('link', {name: 'Nav card'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('calls onClick when card surface is clicked', () => {
    const handleClick = vi.fn();
    render(
      <XDSClickableCard label="Test card" onClick={handleClick}>
        <span>Content</span>
      </XDSClickableCard>,
    );
    // Click the card surface (the text), not the hidden button
    fireEvent.click(screen.getByText('Content'));
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

  it('hidden button has correct aria-label', () => {
    render(
      <XDSClickableCard label="Settings card" onClick={() => {}}>
        Content
      </XDSClickableCard>,
    );
    const button = screen.getByRole('button', {name: 'Settings card'});
    expect(button).toHaveAttribute('aria-label', 'Settings card');
  });

  it('hidden link passes target attribute', () => {
    render(
      <XDSClickableCard label="External" href="https://example.com" target="_blank">
        Content
      </XDSClickableCard>,
    );
    const link = screen.getByRole('link', {name: 'External'});
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('disabled button is disabled', () => {
    const handleClick = vi.fn();
    render(
      <XDSClickableCard label="Disabled" onClick={handleClick} isDisabled>
        Content
      </XDSClickableCard>,
    );
    const button = screen.getByRole('button', {name: 'Disabled'});
    expect(button).toBeDisabled();
  });

  it('disabled link has aria-disabled', () => {
    render(
      <XDSClickableCard label="Disabled link" href="/settings" isDisabled>
        Content
      </XDSClickableCard>,
    );
    const link = screen.getByRole('link', {name: 'Disabled link'});
    expect(link).toHaveAttribute('aria-disabled', 'true');
  });
});
