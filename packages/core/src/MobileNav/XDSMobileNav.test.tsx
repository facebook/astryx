/**
 * @file XDSMobileNav.test.tsx
 * @input Uses vitest, @testing-library/react, XDSMobileNav component
 * @output Unit tests for XDSMobileNav component behavior
 * @position Testing; validates XDSMobileNav.tsx implementation
 *
 * SYNC: When XDSMobileNav.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSMobileNav} from './XDSMobileNav';

describe('XDSMobileNav', () => {
  it('renders when isOpen is true', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}}>
        <span>Nav content</span>
      </XDSMobileNav>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nav content')).toBeInTheDocument();
  });

  it('does not render dialog as visible when isOpen is false', () => {
    render(
      <XDSMobileNav isOpen={false} onClose={() => {}} data-testid="mobile-nav">
        <span>Nav content</span>
      </XDSMobileNav>,
    );
    // The overlay exists but is hidden via visibility:hidden
    const overlay = screen.getByTestId('mobile-nav');
    expect(overlay).toBeInTheDocument();
  });

  it('calls onClose on Escape key', () => {
    const handleClose = vi.fn();
    render(
      <XDSMobileNav isOpen={true} onClose={handleClose}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    fireEvent.keyDown(document, {key: 'Escape'});
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on backdrop click', () => {
    const handleClose = vi.fn();
    render(
      <XDSMobileNav
        isOpen={true}
        onClose={handleClose}
        data-testid="mobile-nav">
        <span>Content</span>
      </XDSMobileNav>,
    );

    // The backdrop is the first child with aria-hidden="true"
    const backdrop = screen
      .getByTestId('mobile-nav')
      .querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on drawer content click', () => {
    const handleClose = vi.fn();
    render(
      <XDSMobileNav isOpen={true} onClose={handleClose}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    fireEvent.click(screen.getByText('Content'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders close button', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    const closeButton = screen.getByRole('button', {name: /close/i});
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <XDSMobileNav isOpen={true} onClose={handleClose}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    const closeButton = screen.getByRole('button', {name: /close/i});
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders title when provided', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}} title="Navigation">
        <span>Content</span>
      </XDSMobileNav>,
    );

    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('forwards data-testid', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}} data-testid="custom-nav">
        <span>Content</span>
      </XDSMobileNav>,
    );

    expect(screen.getByTestId('custom-nav')).toBeInTheDocument();
  });

  it('sets aria-modal on dialog', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('sets aria-label from title', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}} title="My Nav">
        <span>Content</span>
      </XDSMobileNav>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'My Nav');
  });

  it('defaults aria-label to Navigation when no title', () => {
    render(
      <XDSMobileNav isOpen={true} onClose={() => {}}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-label',
      'Navigation',
    );
  });

  it('does not call onClose on Escape when closed', () => {
    const handleClose = vi.fn();
    render(
      <XDSMobileNav isOpen={false} onClose={handleClose}>
        <span>Content</span>
      </XDSMobileNav>,
    );

    fireEvent.keyDown(document, {key: 'Escape'});
    expect(handleClose).not.toHaveBeenCalled();
  });
});
