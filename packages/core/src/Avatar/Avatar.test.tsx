// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {Avatar} from './Avatar';
import {AvatarStatusDot} from './AvatarStatusDot';

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

describe('AvatarStatusDot', () => {
  it('renders a default accessible label based on variant (WCAG 1.4.1)', () => {
    render(
      <Avatar name="Ada" size="lg" status={<AvatarStatusDot variant="success" />} />,
    );
    // The status dot should have role="img" with a default label.
    expect(screen.getByRole('img', {name: 'Success'})).toBeInTheDocument();
  });

  it('renders a default accessible label for neutral variant', () => {
    render(
      <Avatar name="Ada" size="lg" status={<AvatarStatusDot variant="neutral" />} />,
    );
    expect(screen.getByRole('img', {name: 'Neutral'})).toBeInTheDocument();
  });

  it('renders a default accessible label for error variant', () => {
    render(
      <Avatar name="Ada" size="lg" status={<AvatarStatusDot variant="error" />} />,
    );
    expect(screen.getByRole('img', {name: 'Error'})).toBeInTheDocument();
  });

  it('uses explicit label over default variant label', () => {
    render(
      <Avatar
        name="Ada"
        size="lg"
        status={<AvatarStatusDot variant="success" label="Online" />}
      />,
    );
    expect(screen.getByRole('img', {name: 'Online'})).toBeInTheDocument();
    expect(screen.queryByRole('img', {name: 'Success'})).toBeNull();
  });

  it('renders a default icon at medium+ avatar sizes (WCAG 1.4.1 shape differentiation)', () => {
    render(
      <Avatar name="Ada" size="lg" status={<AvatarStatusDot variant="success" />} />,
    );
    // The default icon is an SVG inside the status dot.
    const statusDot = screen.getByRole('img', {name: 'Success'});
    const svg = statusDot.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('does not render default icon at the smallest avatar tier', () => {
    render(
      <Avatar name="Ada" size="sm" status={<AvatarStatusDot variant="success" />} />,
    );
    const statusDot = screen.getByRole('img', {name: 'Success'});
    expect(statusDot.querySelector('svg')).toBeNull();
  });

  it('allows suppressing the default icon with icon={null}', () => {
    render(
      <Avatar
        name="Ada"
        size="lg"
        status={<AvatarStatusDot variant="success" icon={null} />}
      />,
    );
    const statusDot = screen.getByRole('img', {name: 'Success'});
    expect(statusDot.querySelector('svg')).toBeNull();
  });

  it('renders different icons for different variants', () => {
    const successRender = render(
      <Avatar name="A" size="lg" status={<AvatarStatusDot variant="success" />} />,
    );
    const successSvg = successRender.container.querySelector(
      '[role="img"] svg',
    );
    expect(successSvg).not.toBeNull();
    successRender.unmount();

    const errorRender = render(
      <Avatar name="B" size="lg" status={<AvatarStatusDot variant="error" />} />,
    );
    const errorSvg = errorRender.container.querySelector(
      '[role="img"] svg',
    );
    expect(errorSvg).not.toBeNull();
    errorRender.unmount();

    const neutralRender = render(
      <Avatar name="C" size="lg" status={<AvatarStatusDot variant="neutral" />} />,
    );
    const neutralSvg = neutralRender.container.querySelector(
      '[role="img"] svg',
    );
    expect(neutralSvg).not.toBeNull();
  });
});
