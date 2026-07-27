// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
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

  // --- Name tooltip (tooltip?: string | boolean) ---
  describe('name tooltip', () => {
    const originalShowPopover = HTMLElement.prototype.showPopover;
    const originalHidePopover = HTMLElement.prototype.hidePopover;

    beforeEach(() => {
      // jsdom does not implement the Popover API the tooltip layer uses.
      HTMLElement.prototype.showPopover = vi.fn();
      HTMLElement.prototype.hidePopover = vi.fn();
    });

    afterEach(() => {
      HTMLElement.prototype.showPopover = originalShowPopover;
      HTMLElement.prototype.hidePopover = originalHidePopover;
    });

    it('shows the name in a tooltip by default', () => {
      render(<Avatar name="Ada Lovelace" />);
      const tooltip = screen.getByRole('tooltip', {hidden: true});
      expect(tooltip).toHaveTextContent('Ada Lovelace');
    });

    it('shows a custom string tooltip instead of the name', () => {
      render(<Avatar name="alovelace" tooltip="Ada Lovelace, Mathematician" />);
      const tooltip = screen.getByRole('tooltip', {hidden: true});
      expect(tooltip).toHaveTextContent('Ada Lovelace, Mathematician');
      expect(tooltip).not.toHaveTextContent('alovelace');
    });

    it('renders no tooltip when tooltip={false}', () => {
      render(<Avatar name="Ada Lovelace" tooltip={false} />);
      expect(screen.queryByRole('tooltip', {hidden: true})).toBeNull();
    });

    it('renders no tooltip for a decorative avatar (no name/alt)', () => {
      render(<Avatar src="https://example.com/x.jpg" />);
      expect(screen.queryByRole('tooltip', {hidden: true})).toBeNull();
    });

    it('renders no tooltip when tooltip is true/default but name is empty', () => {
      render(<Avatar name="   " alt="Profile photo" data-testid="a" />);
      // A whitespace-only name yields nothing to show, and the default tooltip
      // uses `name` (not `alt`), so there is no tooltip.
      expect(screen.queryByRole('tooltip', {hidden: true})).toBeNull();
      // The accessible name still comes from alt, unaffected.
      expect(
        screen.getByRole('img', {name: 'Profile photo'}),
      ).toBeInTheDocument();
    });

    it('still shows a custom string tooltip when there is no name', () => {
      render(<Avatar tooltip="Anonymous user" data-testid="a" />);
      const tooltip = screen.getByRole('tooltip', {hidden: true});
      expect(tooltip).toHaveTextContent('Anonymous user');
    });

    it('makes the root focusable while a tooltip is attached', () => {
      render(<Avatar name="Ada Lovelace" data-testid="a" />);
      expect(screen.getByTestId('a')).toHaveAttribute('tabindex', '0');
    });

    it('does not add a tab stop when the tooltip is disabled', () => {
      render(<Avatar name="Ada Lovelace" tooltip={false} data-testid="a" />);
      expect(screen.getByTestId('a')).not.toHaveAttribute('tabindex');
    });

    it('keeps the accessible name on the root regardless of the tooltip', () => {
      const {rerender} = render(<Avatar name="Ada Lovelace" />);
      expect(
        screen.getByRole('img', {name: 'Ada Lovelace'}),
      ).toBeInTheDocument();

      rerender(<Avatar name="Ada Lovelace" tooltip={false} />);
      expect(
        screen.getByRole('img', {name: 'Ada Lovelace'}),
      ).toBeInTheDocument();

      rerender(<Avatar name="alovelace" tooltip="Ada Lovelace, Eng" />);
      // alt||name still drives the accessible name — not the custom tooltip.
      expect(screen.getByRole('img', {name: 'alovelace'})).toBeInTheDocument();

      rerender(<Avatar name="alovelace" alt="Ada's profile photo" />);
      expect(
        screen.getByRole('img', {name: "Ada's profile photo"}),
      ).toBeInTheDocument();
    });

    it('does not describe the root with the default name tooltip (no double-announce)', () => {
      render(<Avatar name="Ada Lovelace" data-testid="a" />);
      // The default name tooltip is visual-only: its text duplicates the root
      // aria-label, so we deliberately do NOT wire aria-describedby (OQ-4).
      expect(screen.getByTestId('a')).not.toHaveAttribute('aria-describedby');
    });

    it('describes the root with a custom string tooltip (matches Button)', () => {
      render(
        <Avatar
          name="alovelace"
          tooltip="Ada Lovelace, Mathematician"
          data-testid="a"
        />,
      );
      const root = screen.getByTestId('a');
      const describedBy = root.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      // aria-describedby points at the rendered tooltip layer.
      const tooltip = screen.getByRole('tooltip', {hidden: true});
      expect(tooltip.id).toBeTruthy();
      expect(describedBy).toContain(tooltip.id);
    });

    it('composes a consumer aria-describedby with the custom tooltip description', () => {
      render(
        <>
          <span id="extra-desc">extra description</span>
          <Avatar
            name="alovelace"
            tooltip="Ada Lovelace, Eng"
            aria-describedby="extra-desc"
            data-testid="a"
          />
        </>,
      );
      const describedBy = screen
        .getByTestId('a')
        .getAttribute('aria-describedby');
      expect(describedBy).toContain('extra-desc');
    });

    it('preserves a consumer aria-describedby with the default name tooltip', () => {
      render(
        <>
          <span id="extra-desc">extra description</span>
          <Avatar
            name="Ada Lovelace"
            aria-describedby="extra-desc"
            data-testid="a"
          />
        </>,
      );
      // Default name tooltip does not touch aria-describedby, so the consumer
      // value passes through untouched.
      expect(screen.getByTestId('a')).toHaveAttribute(
        'aria-describedby',
        'extra-desc',
      );
    });

    it('forwards the consumer ref to the root while a tooltip is attached', () => {
      const ref = {current: null as HTMLDivElement | null};
      render(<Avatar name="Ada Lovelace" ref={ref} data-testid="a" />);
      expect(ref.current).toBe(screen.getByTestId('a'));
    });
  });
});
