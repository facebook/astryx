// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ClickableContainer.test.tsx
 * @input Uses vitest, @testing-library/react, user-event, ClickableContainer
 * @output Unit tests for ClickableContainer component behavior
 * @position Testing; validates ClickableContainer.tsx implementation
 *
 * SYNC: When ClickableContainer.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {ClickableContainer} from './ClickableContainer';

describe('ClickableContainer', () => {
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
      <ClickableContainer label="Test" onClick={() => {}}>
        <span>Card content</span>
      </ClickableContainer>,
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders a hidden button for onClick containers', () => {
    render(
      <ClickableContainer label="Test container" onClick={() => {}}>
        <span>Content</span>
      </ClickableContainer>,
    );
    const button = screen.getByRole('button', {name: 'Test container'});
    expect(button).toBeInTheDocument();
  });

  it('renders a hidden link for href containers', () => {
    render(
      <ClickableContainer label="Nav container" href="/settings">
        Content
      </ClickableContainer>,
    );
    const link = screen.getByRole('link', {name: 'Nav container'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('calls onClick when container surface is clicked', () => {
    const handleClick = vi.fn();
    render(
      <ClickableContainer label="Test" onClick={handleClick}>
        <span>Content</span>
      </ClickableContainer>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClick when a nested button is clicked', () => {
    const handleContainerClick = vi.fn();
    const handleButtonClick = vi.fn();
    render(
      <ClickableContainer label="Test" onClick={handleContainerClick}>
        <button type="button" onClick={handleButtonClick}>
          Nested
        </button>
      </ClickableContainer>,
    );
    fireEvent.click(screen.getByText('Nested'));
    expect(handleButtonClick).toHaveBeenCalledTimes(1);
    expect(handleContainerClick).not.toHaveBeenCalled();
  });

  it('hidden button has correct aria-label', () => {
    render(
      <ClickableContainer label="Settings" onClick={() => {}}>
        Content
      </ClickableContainer>,
    );
    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).toHaveAttribute('aria-label', 'Settings');
  });

  it('hidden link passes target attribute', () => {
    render(
      <ClickableContainer
        label="External"
        href="https://example.com"
        target="_blank">
        Content
      </ClickableContainer>,
    );
    const link = screen.getByRole('link', {name: 'External'});
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('disabled button uses aria-disabled instead of native disabled', () => {
    const handleClick = vi.fn();
    render(
      <ClickableContainer label="Disabled" onClick={handleClick} isDisabled>
        Content
      </ClickableContainer>,
    );
    const button = screen.getByRole('button', {name: 'Disabled'});
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
  });

  it('disabled link uses aria-disabled', () => {
    render(
      <ClickableContainer label="Disabled link" href="/settings" isDisabled>
        Content
      </ClickableContainer>,
    );
    const link = screen.getByRole('link', {name: 'Disabled link'});
    expect(link).toHaveAttribute('aria-disabled', 'true');
  });

  it('container has no role or tabIndex', () => {
    const {container} = render(
      <ClickableContainer label="Test" onClick={() => {}}>
        Content
      </ClickableContainer>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('tabindex');
  });

  it('isReadOnly prevents container click', () => {
    const handleClick = vi.fn();
    render(
      <ClickableContainer label="Read only" isReadOnly onClick={handleClick}>
        Content
      </ClickableContainer>,
    );
    fireEvent.click(screen.getByText('Content'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('isReadOnly keeps hidden button focusable', () => {
    render(
      <ClickableContainer label="Read only" isReadOnly onClick={() => {}}>
        Content
      </ClickableContainer>,
    );
    const button = screen.getByRole('button', {name: 'Read only'});
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(button).not.toBeDisabled();
  });

  it('shows disabledMessage tooltip on hover when disabled', async () => {
    render(
      <ClickableContainer
        label="Save"
        isDisabled
        disabledMessage="You need the Editor role">
        Content
      </ClickableContainer>,
    );
    const button = screen.getByRole('button', {name: 'Save'});
    const tooltip = screen.getByRole('tooltip', h);
    expect(tooltip).toHaveTextContent('You need the Editor role');

    // Tooltip ref is on the container div, not the hidden button
    const container = button.parentElement!;
    fireEvent.mouseEnter(container);
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });

    fireEvent.mouseLeave(container);
    await waitFor(() => {
      expect(tooltip).not.toHaveAttribute('popover-open');
    });
  });

  it('links disabledMessage tooltip via aria-describedby on hidden element', () => {
    render(
      <ClickableContainer
        label="Save"
        isDisabled
        disabledMessage="You need the Editor role">
        Content
      </ClickableContainer>,
    );
    const button = screen.getByRole('button', {name: 'Save'});
    const tooltip = screen.getByRole('tooltip', h);
    expect(button.getAttribute('aria-describedby')).toContain(tooltip.id);
  });

  it('does not render tooltip when disabled without disabledMessage', () => {
    render(
      <ClickableContainer label="Save" isDisabled>
        Content
      </ClickableContainer>,
    );
    expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
  });

  it('does not render tooltip when not disabled', () => {
    render(
      <ClickableContainer label="Save" disabledMessage="Reason">
        Content
      </ClickableContainer>,
    );
    expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
  });

  it('forwards ref to container div', () => {
    const ref = vi.fn();
    render(
      <ClickableContainer label="Test" ref={ref} onClick={() => {}}>
        Content
      </ClickableContainer>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
