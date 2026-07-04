// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Link.test.tsx
 * @input Uses vitest, @testing-library/react, Link component
 * @output Unit tests for Link component behavior
 * @position Testing; validates Link.tsx implementation
 *
 * SYNC: When Link.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Link} from './Link';
import {LinkProvider} from './LinkProvider';

function CustomLink({
  children,
  ref,
  ...props
}: React.ComponentPropsWithRef<'a'>) {
  return (
    <a ref={ref} data-custom-link {...props}>
      {children}
    </a>
  );
}

describe('Link', () => {
  it('renders children as link text', () => {
    render(<Link href="/test">Click me</Link>);
    expect(screen.getByRole('link', {name: 'Click me'})).toBeInTheDocument();
  });

  it('renders with href attribute', () => {
    render(<Link href="/destination">Link</Link>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/destination');
  });

  it('renders as a button when href is undefined', () => {
    render(<Link>Action</Link>);
    expect(screen.getByRole('button', {name: 'Action'})).toBeInTheDocument();
  });

  it('renders as a button when href is explicitly undefined', () => {
    render(<Link href={undefined}>Action</Link>);
    expect(screen.getByRole('button', {name: 'Action'})).toBeInTheDocument();
  });

  it('button fallback fires onClick', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Link onClick={handleClick}>Click me</Link>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('button fallback supports isDisabled', () => {
    render(<Link isDisabled>Disabled Action</Link>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('button fallback has type="button"', () => {
    render(<Link>Action</Link>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('button fallback supports aria-label via label prop', () => {
    render(
      <Link label="Close dialog">
        <span aria-hidden="true">✕</span>
      </Link>,
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Close dialog',
    );
  });

  it('does not render aria-label when label is omitted', () => {
    render(<Link href="/test">Visible text</Link>);
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-label');
  });

  it('renders aria-label when label prop is provided', () => {
    render(
      <Link label="Accessible label" href="/test">
        <span aria-hidden="true">🏠</span>
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'Accessible label',
    );
  });

  it('renders with different color values', () => {
    const {rerender} = render(
      <Link href="/test" color="accent">
        Accent
      </Link>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <Link href="/test" color="secondary">
        Secondary
      </Link>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <Link href="/test" color="inherit">
        Inherit
      </Link>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('defaults the inner text type to body', () => {
    render(<Link href="/test">Body link</Link>);
    expect(screen.getByText('Body link')).toHaveClass('astryx-text', 'body');
  });

  it('forwards type="inherit" so the link adopts the surrounding text type', () => {
    render(
      <Link href="/test" type="inherit">
        Inline link
      </Link>,
    );
    // The inner Text renders with the `inherit` type, so font-size/line-height
    // inherit from the surrounding text rather than imposing the body type.
    const text = screen.getByText('Inline link');
    expect(text).toHaveClass('astryx-text', 'inherit');
    expect(text).not.toHaveClass('body');
  });

  it('applies hasUnderline style when true', () => {
    render(
      <Link href="/test" hasUnderline>
        Underlined Link
      </Link>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('applies isDisabled state correctly', () => {
    render(
      <Link href="/test" isDisabled>
        Disabled Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabIndex', '-1');
  });

  it('renders external link with icon and target="_blank"', () => {
    render(
      <Link href="https://example.com" isExternalLink>
        External Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('svg')).toBeInTheDocument();
  });

  it('announces the new-tab context via screen-reader text (obs-4)', () => {
    render(
      <Link href="https://example.com" isExternalLink>
        Docs
      </Link>,
    );
    // The link's accessible name includes the new-tab hint (the icon is
    // decorative).
    expect(
      screen.getByRole('link', {name: 'Docs (opens in new tab)'}),
    ).toBeInTheDocument();
  });

  it('supports a custom newTabLabel for localization', () => {
    render(
      <Link
        href="https://example.com"
        isExternalLink
        newTabLabel="(new window)">
        Docs
      </Link>,
    );
    expect(
      screen.getByRole('link', {name: 'Docs (new window)'}),
    ).toBeInTheDocument();
  });

  it('does not add new-tab text to non-external links', () => {
    render(<Link href="/internal">Internal</Link>);
    expect(screen.getByRole('link', {name: 'Internal'})).toBeInTheDocument();
  });

  it('renders external link with existing rel merged', () => {
    render(
      <Link href="https://example.com" isExternalLink rel="sponsored">
        External Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('renders with custom target without isExternalLink', () => {
    render(
      <Link href="/test" target="_parent">
        Parent Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_parent');
  });

  it('adds safe rel tokens for explicit target="_blank"', () => {
    render(
      <Link href="/test" target="_blank">
        Blank Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves existing rel tokens for explicit target="_blank"', () => {
    render(
      <Link href="/test" target="_blank" rel="sponsored noopener">
        Blank Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn((e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
    });
    render(
      <Link href="/test" onClick={handleClick}>
        Click me
      </Link>,
    );

    await user.click(screen.getByRole('link'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Link href="/test" ref={ref}>
        Test
      </Link>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
  });

  it('renders standalone link', () => {
    render(
      <Link href="/standalone" isStandalone>
        Standalone Link
      </Link>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders link with tooltip', () => {
    render(
      <Link href="/settings" tooltip="Configure settings">
        Settings
      </Link>,
    );
    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).toBeInTheDocument();
  });

  it('renders custom component when as is provided', () => {
    render(
      <Link href="/custom" as={CustomLink}>
        Custom Link
      </Link>,
    );
    const link = screen.getByRole('link', {name: 'Custom Link'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/custom');
  });

  it('renders custom component from LinkProvider', () => {
    render(
      <LinkProvider component={CustomLink}>
        <Link href="/provider">Provider Link</Link>
      </LinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Provider Link'});
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('as prop overrides LinkProvider', () => {
    function AnotherLink({
      children,
      ref,
      ...props
    }: React.ComponentPropsWithRef<'a'>) {
      return (
        <a ref={ref} data-another-link {...props}>
          {children}
        </a>
      );
    }
    render(
      <LinkProvider component={AnotherLink}>
        <Link href="/override" as={CustomLink}>
          Override Link
        </Link>
      </LinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Override Link'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });

  it('renders astryx-* class names for theme targeting', () => {
    render(
      <Link href="/test" color="secondary">
        Themed Link
      </Link>,
    );
    const link = screen.getByRole('link', {name: 'Themed Link'});
    expect(link.className).toContain('astryx-link');
    expect(link.className).toContain('secondary');
  });
});
