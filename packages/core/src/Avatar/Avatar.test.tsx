// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {Avatar} from './Avatar';

describe('Avatar', () => {
  it('exposes role="img" with the name as accessible name', () => {
    render(<Avatar name="Ada Lovelace" data-testid="a" />);
    expect(screen.getByRole('img', {name: 'Ada Lovelace'})).toBeInTheDocument();
  });

  it('uses alt over name for the accessible name', () => {
    render(<Avatar name="Ada" alt="Ada Lovelace, profile photo" />);
    expect(
      screen.getByRole('img', {name: 'Ada Lovelace, profile photo'}),
    ).toBeInTheDocument();
  });

  it('is decorative (presentation + aria-hidden) when it has no name or alt (obs-9)', () => {
    render(<Avatar data-testid="a" />);
    const el = screen.getByTestId('a');
    // No meaningful name → not announced as a generic "Avatar".
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).not.toHaveAttribute('aria-label');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('does not double-announce: the inner img is decorative when the wrapper is named', () => {
    render(<Avatar name="Ada" src="https://example.com/ada.jpg" />);
    const wrapper = screen.getByRole('img', {name: 'Ada'});
    const innerImg = wrapper.querySelector('img');
    expect(innerImg).not.toBeNull();
    // The inner <img> carries an empty alt so it isn't announced separately.
    expect(innerImg).toHaveAttribute('alt', '');
  });

  it('renders fallback initials through the themeable font-size var, not a bare px literal', () => {
    render(<Avatar name="Ada Lovelace" size="sm" data-testid="a" />);
    const initials = screen.getByText('AL');
    // The seam: the dynamic font size resolves to the Avatar-scoped var (with
    // the proportional `size × 0.4` default baked in as the fallback), so a
    // theme can re-scope it per size. A regression to a bare px literal would
    // break theming.
    const style = initials.getAttribute('style') ?? '';
    expect(style).toContain('var(--_avatar-fallback-font-size,');
    // Default still reproduces the proportional scale (sm = 24 × 0.4 = 9.6px).
    expect(style).toMatch(/var\(--_avatar-fallback-font-size,\s*9\.6\d*px\)/);
  });

  it('retries a new src after a previous src failed to load', () => {
    const {rerender} = render(
      <Avatar name="Ada" src="https://example.com/broken.jpg" />,
    );
    const wrapper = screen.getByRole('img', {name: 'Ada'});
    fireEvent.error(wrapper.querySelector('img')!);
    // Broken image falls back to initials.
    expect(wrapper.querySelector('img')).toBeNull();
    expect(wrapper).toHaveTextContent('A');

    // A different src must get a fresh load attempt, not the stale error.
    rerender(<Avatar name="Ada" src="https://example.com/ada.jpg" />);
    const img = wrapper.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', 'https://example.com/ada.jpg');
  });

  it('retries a new fallbackSrc after a previous fallbackSrc failed to load', () => {
    const {rerender} = render(
      <Avatar name="Ada" fallbackSrc="https://example.com/broken.jpg" />,
    );
    const wrapper = screen.getByRole('img', {name: 'Ada'});
    fireEvent.error(wrapper.querySelector('img')!);
    expect(wrapper.querySelector('img')).toBeNull();

    rerender(<Avatar name="Ada" fallbackSrc="https://example.com/ada.jpg" />);
    const img = wrapper.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('src', 'https://example.com/ada.jpg');
  });
});
