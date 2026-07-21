// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Clickable.test.tsx
 * @input Uses vitest, @testing-library/react, user-event, Clickable
 * @output Unit tests for Clickable component behavior
 * @position Testing; validates Clickable.tsx implementation
 *
 * SYNC: When Clickable.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Clickable} from './Clickable';

describe('Clickable', () => {
  beforeEach(() => {
    HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
      this.setAttribute('popover-open', '');
    });
    HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
      this.removeAttribute('popover-open');
    });
  });

  const h = {hidden: true} as const;

  it('renders children', () => {
    render(
      <Clickable label="Test" onClick={() => {}}>
        <span>Content</span>
      </Clickable>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as a button when onClick is provided', () => {
    render(
      <Clickable label="Click me" onClick={() => {}}>
        Click
      </Clickable>,
    );
    expect(screen.getByRole('button', {name: 'Click me'})).toBeInTheDocument();
  });

  it('renders as a link when href is provided', () => {
    render(
      <Clickable label="Navigate" href="/settings">
        Settings
      </Clickable>,
    );
    const link = screen.getByRole('link', {name: 'Navigate'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Clickable label="Click me" onClick={handleClick}>
        Click
      </Clickable>,
    );
    await user.click(screen.getByRole('button', {name: 'Click me'}));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('uses aria-disabled instead of native disabled', () => {
    render(
      <Clickable label="Disabled" isDisabled onClick={() => {}}>
        Content
      </Clickable>,
    );
    const button = screen.getByRole('button', {name: 'Disabled'});
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
  });

  it('sets tabIndex -1 when disabled', () => {
    render(
      <Clickable label="Disabled" isDisabled onClick={() => {}}>
        Content
      </Clickable>,
    );
    const button = screen.getByRole('button', {name: 'Disabled'});
    expect(button).toHaveAttribute('tabindex', '-1');
  });

  it('does not fire click when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Clickable label="Disabled" isDisabled onClick={handleClick}>
        Content
      </Clickable>,
    );
    await user.click(screen.getByRole('button', {name: 'Disabled'}));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disabled link uses aria-disabled', () => {
    render(
      <Clickable label="Disabled link" href="/settings" isDisabled>
        Content
      </Clickable>,
    );
    // Disabled links fall back to button per useInteractiveRole
    const button = screen.getByRole('button', {name: 'Disabled link'});
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
  });

  it('disabled link falls back to button role', () => {
    render(
      <Clickable label="Disabled link" href="/settings" isDisabled>
        Content
      </Clickable>,
    );
    // Disabled links fall back to button per useInteractiveRole
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Disabled link'}),
    ).toBeInTheDocument();
  });

  it('isReadOnly prevents click', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Clickable label="Read only" isReadOnly onClick={handleClick}>
        Content
      </Clickable>,
    );
    await user.click(screen.getByRole('button', {name: 'Read only'}));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('isReadOnly keeps element focusable', () => {
    render(
      <Clickable label="Read only" isReadOnly onClick={() => {}}>
        Content
      </Clickable>,
    );
    const button = screen.getByRole('button', {name: 'Read only'});
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('isReadOnly does not show disabled styles', () => {
    render(
      <Clickable label="Read only" isReadOnly onClick={() => {}}>
        Content
      </Clickable>,
    );
    const button = screen.getByRole('button', {name: 'Read only'});
    // Not aria-disabled
    expect(button).not.toHaveAttribute('aria-disabled');
  });

  it('passes target attribute for links', () => {
    render(
      <Clickable label="External" href="https://example.com" target="_blank">
        Content
      </Clickable>,
    );
    const link = screen.getByRole('link', {name: 'External'});
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('shows disabledMessage tooltip on hover when disabled', async () => {
    render(
      <Clickable
        label="Save"
        isDisabled
        disabledMessage="You need the Editor role"
        onClick={() => {}}>
        Content
      </Clickable>,
    );
    const button = screen.getByRole('button', {name: 'Save'});
    const tooltip = screen.getByRole('tooltip', h);
    expect(tooltip).toHaveTextContent('You need the Editor role');

    fireEvent.mouseEnter(button);
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });

    fireEvent.mouseLeave(button);
    await waitFor(() => {
      expect(tooltip).not.toHaveAttribute('popover-open');
    });
  });

  it('links disabledMessage tooltip via aria-describedby', () => {
    render(
      <Clickable
        label="Save"
        isDisabled
        disabledMessage="You need the Editor role"
        onClick={() => {}}>
        Content
      </Clickable>,
    );
    const button = screen.getByRole('button', {name: 'Save'});
    const tooltip = screen.getByRole('tooltip', h);
    expect(button.getAttribute('aria-describedby')).toContain(tooltip.id);
  });

  it('does not render tooltip when disabled without disabledMessage', () => {
    render(
      <Clickable label="Save" isDisabled onClick={() => {}}>
        Content
      </Clickable>,
    );
    expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
  });

  it('does not render tooltip when not disabled', () => {
    render(
      <Clickable label="Save" disabledMessage="Reason" onClick={() => {}}>
        Content
      </Clickable>,
    );
    expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Clickable label="Test" ref={ref} onClick={() => {}}>
        Content
      </Clickable>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});
