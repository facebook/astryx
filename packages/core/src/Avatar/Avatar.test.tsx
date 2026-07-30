// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  describe('status in the accessible name (WCAG 4.1.2)', () => {
    // The avatar root is role="img", which prunes descendant semantics —
    // a label inside the status subtree is never announced on its own.
    // Avatar composes the status element's `label` into its own name.
    it('composes the status label into the accessible name for image avatars', () => {
      render(
        <Avatar
          name="Ada Lovelace"
          src="https://example.com/ada.jpg"
          status={<AvatarStatusDot variant="success" label="Online" />}
        />,
      );
      expect(
        screen.getByRole('img', {name: 'Ada Lovelace, Online'}),
      ).toBeInTheDocument();
    });

    it('composes the status label into the accessible name for initials avatars', () => {
      render(
        <Avatar
          name="Ada Lovelace"
          status={<AvatarStatusDot variant="error" label="Busy" />}
        />,
      );
      const avatar = screen.getByRole('img', {name: 'Ada Lovelace, Busy'});
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveTextContent('AL');
    });

    it('composes the status label with alt when alt overrides name', () => {
      render(
        <Avatar
          name="Ada"
          alt="Ada Lovelace, profile photo"
          status={<AvatarStatusDot label="Online" />}
        />,
      );
      expect(
        screen.getByRole('img', {name: 'Ada Lovelace, profile photo, Online'}),
      ).toBeInTheDocument();
    });

    it('keeps the plain name when there is no status', () => {
      render(<Avatar name="Ada Lovelace" data-testid="a" />);
      expect(screen.getByTestId('a')).toHaveAttribute(
        'aria-label',
        'Ada Lovelace',
      );
    });

    it('keeps the plain name when the status dot has no label', () => {
      render(
        <Avatar
          name="Ada Lovelace"
          data-testid="a"
          status={<AvatarStatusDot variant="success" />}
        />,
      );
      expect(screen.getByTestId('a')).toHaveAttribute(
        'aria-label',
        'Ada Lovelace',
      );
    });

    it('keeps the plain name for custom status nodes without a label prop', () => {
      render(<Avatar name="Ada Lovelace" data-testid="a" status={<span />} />);
      expect(screen.getByTestId('a')).toHaveAttribute(
        'aria-label',
        'Ada Lovelace',
      );
    });

    it('announces a labelled status even on an otherwise decorative avatar', () => {
      // A labelled status is meaningful information on its own — the avatar
      // must not stay aria-hidden and swallow it.
      render(
        <Avatar data-testid="a" status={<AvatarStatusDot label="Online" />} />,
      );
      const el = screen.getByTestId('a');
      expect(el).toHaveAttribute('role', 'img');
      expect(el).toHaveAttribute('aria-label', 'Online');
      expect(el).not.toHaveAttribute('aria-hidden');
    });

    it('stays decorative with an unlabelled status and no name', () => {
      render(<Avatar data-testid="a" status={<AvatarStatusDot />} />);
      const el = screen.getByTestId('a');
      expect(el).toHaveAttribute('aria-hidden', 'true');
      expect(el).not.toHaveAttribute('aria-label');
    });
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
