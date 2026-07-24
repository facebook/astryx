// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('Avatar — interactivity (Button trichotomy)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a link when `href` is set (default LinkComponent is <a>)', () => {
    render(<Avatar name="Ada Lovelace" href="/users/ada" />);
    const link = screen.getByRole('link', {name: 'Ada Lovelace'});
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/users/ada');
    // The static img semantics are gone — it's a control now.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('forwards target/rel on the link', () => {
    render(
      <Avatar
        name="Ada"
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
      />,
    );
    const link = screen.getByRole('link', {name: 'Ada'});
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders a <button type="button"> when `onClick` is set (no href)', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Avatar name="Ada" onClick={handleClick} />);
    const button = screen.getByRole('button', {name: 'Ada'});
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    await user.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('href wins over onClick (link, not button)', () => {
    render(<Avatar name="Ada" href="/ada" onClick={() => {}} />);
    expect(screen.getByRole('link', {name: 'Ada'})).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('stays a static element (no href, no onClick) — non-breaking default', () => {
    render(<Avatar name="Ada" />);
    expect(screen.getByRole('img', {name: 'Ada'})).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('stamps the data-avatar-item marker on the interactive link', () => {
    render(<Avatar name="Ada" href="/ada" />);
    expect(screen.getByRole('link', {name: 'Ada'})).toHaveAttribute(
      'data-avatar-item',
    );
  });

  it('stamps the data-avatar-item marker on the interactive button', () => {
    render(<Avatar name="Ada" onClick={() => {}} />);
    expect(screen.getByRole('button', {name: 'Ada'})).toHaveAttribute(
      'data-avatar-item',
    );
  });

  it('does not stamp data-avatar-item on a static avatar', () => {
    render(<Avatar name="Ada" data-testid="a" />);
    expect(screen.getByTestId('a')).not.toHaveAttribute('data-avatar-item');
  });

  it('carries a focus-visible ring class on the interactive element', () => {
    // The interactive element applies the shared focus-visible accent ring via
    // its StyleX class. We assert the element is focusable and receives focus.
    render(<Avatar name="Ada" onClick={() => {}} />);
    const button = screen.getByRole('button', {name: 'Ada'});
    button.focus();
    expect(button).toHaveFocus();
    // className carries the avatar theming target so themes can style it.
    expect(button.className).toContain('astryx-avatar');
  });

  it('warns in dev when interactive without an accessible name (href)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Avatar href="/somewhere" />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('interactive avatar'),
    );
  });

  it('warns in dev when interactive without an accessible name (onClick)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Avatar onClick={() => {}} />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('interactive avatar'),
    );
  });

  it('does not warn when interactive with a name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Avatar name="Ada" href="/ada" />);
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn for a static avatar without a name (decorative is fine)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Avatar data-testid="a" />);
    expect(warn).not.toHaveBeenCalled();
  });
});
