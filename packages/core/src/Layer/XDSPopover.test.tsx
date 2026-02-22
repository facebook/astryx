/**
 * @file XDSPopover.test.tsx
 * @input Uses vitest, @testing-library/react, XDSPopover component
 * @output Unit tests for XDSPopover component behavior
 * @position Testing; validates XDSPopover.tsx implementation
 *
 * SYNC: When XDSPopover.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSPopover} from './XDSPopover';

// Store original matches to restore later
const originalMatches = HTMLElement.prototype.matches;

// Track popover open state per element
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

// Mock Popover API for jsdom
beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    // Dispatch toggle event
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });

  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  HTMLElement.prototype.matches = originalMatches;
});

describe('XDSPopover', () => {
  it('renders trigger element', () => {
    render(
      <XDSPopover content={<span>Popover content</span>} label="Test popover">
        <button>Open</button>
      </XDSPopover>,
    );
    expect(screen.getByRole('button', {name: 'Open'})).toBeInTheDocument();
  });

  it('sets aria-haspopup on trigger', () => {
    render(
      <XDSPopover content={<span>Content</span>} label="Test">
        <button>Trigger</button>
      </XDSPopover>,
    );
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('sets aria-expanded=false initially', () => {
    render(
      <XDSPopover content={<span>Content</span>} label="Test">
        <button>Trigger</button>
      </XDSPopover>,
    );
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on click and updates aria-expanded', () => {
    render(
      <XDSPopover content={<span>Popover content</span>} label="Test">
        <button>Open</button>
      </XDSPopover>,
    );
    const trigger = screen.getByRole('button', {name: 'Open'});
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders popover content with role=dialog', () => {
    render(
      <XDSPopover content={<span>Hello</span>} label="Greeting">
        <button>Open</button>
      </XDSPopover>,
    );
    // The dialog is inside a popover element — hidden from accessibility tree
    // until shown, but still present in the DOM
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-label', 'Greeting');
  });

  it('calls onToggle when opened', () => {
    const onToggle = vi.fn();
    render(
      <XDSPopover
        content={<span>Content</span>}
        label="Test"
        onToggle={onToggle}>
        <button>Open</button>
      </XDSPopover>,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Open'}));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('does not open when isEnabled is false', () => {
    const onToggle = vi.fn();
    render(
      <XDSPopover
        content={<span>Content</span>}
        label="Test"
        isEnabled={false}
        onToggle={onToggle}>
        <button>Open</button>
      </XDSPopover>,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Open'}));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('renders with data-testid', () => {
    render(
      <XDSPopover
        content={<span>Content</span>}
        label="Test"
        data-testid="my-popover">
        <button>Open</button>
      </XDSPopover>,
    );
    expect(screen.getByTestId('my-popover')).toBeInTheDocument();
  });

  it('renders hover trigger as HoverCard', () => {
    render(
      <XDSPopover trigger="hover" content={<span>Hover content</span>}>
        <button>Hover me</button>
      </XDSPopover>,
    );
    // Hover trigger should render the trigger element
    expect(screen.getByRole('button', {name: 'Hover me'})).toBeInTheDocument();
  });
});
