/**
 * @file XDSLink.test.tsx
 * @input Uses vitest, @testing-library/react, XDSLink component
 * @output Unit tests for XDSLink component behavior
 * @position Testing; validates XDSLink.tsx implementation
 *
 * SYNC: When XDSLink.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSLink} from './XDSLink';

describe('XDSLink', () => {
  it('renders children as link text', () => {
    render(
      <XDSLink label="Click me" href="/test">
        Click me
      </XDSLink>,
    );
    expect(screen.getByRole('link', {name: 'Click me'})).toBeInTheDocument();
  });

  it('renders with href attribute', () => {
    render(
      <XDSLink label="Link" href="/destination">
        Link
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/destination');
  });

  it('renders with aria-label from label prop', () => {
    render(
      <XDSLink label="Accessible label" href="/test">
        Visible text
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'Accessible label',
    );
  });

  it('renders with different variants', () => {
    const {rerender} = render(
      <XDSLink label="Default" href="/test" variant="default">
        Default
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <XDSLink label="Subtle" href="/test" variant="subtle">
        Subtle
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <XDSLink label="Inherit" href="/test" variant="inherit">
        Inherit
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('applies hasUnderline style when true', () => {
    render(
      <XDSLink label="Underlined" href="/test" hasUnderline>
        Underlined Link
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('applies isDisabled state correctly', () => {
    render(
      <XDSLink label="Disabled Link" href="/test" isDisabled>
        Disabled Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabIndex', '-1');
  });

  it('renders external link with icon and target="_blank"', () => {
    render(
      <XDSLink label="External" href="https://example.com" isExternalLink>
        External Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    // Check for the icon (SVG element)
    expect(link.querySelector('svg')).toBeInTheDocument();
  });

  it('renders external link with existing rel merged', () => {
    render(
      <XDSLink
        label="External"
        href="https://example.com"
        isExternalLink
        rel="sponsored">
        External Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('renders with custom target without isExternalLink', () => {
    render(
      <XDSLink label="Target" href="/test" target="_parent">
        Parent Link
      </XDSLink>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_parent');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn(e => e.preventDefault());
    render(
      <XDSLink label="Click me" href="/test" onClick={handleClick}>
        Click me
      </XDSLink>,
    );

    await user.click(screen.getByRole('link'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <XDSLink label="Test" href="/test" ref={ref}>
        Test
      </XDSLink>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
  });

  it('renders standalone link', () => {
    render(
      <XDSLink label="Standalone Link" href="/standalone" isStandalone>
        Standalone Link
      </XDSLink>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders link with tooltip', () => {
    render(
      <XDSLink label="Settings" href="/settings" tooltip="Configure settings">
        Settings
      </XDSLink>,
    );
    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).toBeInTheDocument();
  });
});
