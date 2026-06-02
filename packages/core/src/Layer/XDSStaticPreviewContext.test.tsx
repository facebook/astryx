// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSStaticPreviewContext.test.tsx
 * @input Uses vitest, @testing-library/react, XDSPopover, XDSStaticPreviewProvider
 * @output Unit tests verifying overlays do not open inside a static preview
 * @position Testing; validates XDSStaticPreviewContext.tsx behavior
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {XDSPopover} from '../Popover';
import {XDSStaticPreviewProvider} from './XDSStaticPreviewContext';

const originalMatches = HTMLElement.prototype.matches;
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = originalMatches;
});

describe('XDSStaticPreviewProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the trigger but does not open a controlled popover inside a static preview', () => {
    render(
      <XDSStaticPreviewProvider>
        <XDSPopover
          isOpen
          onOpenChange={() => {}}
          label="Settings"
          content={<span>Popover content</span>}>
          <button type="button">Open</button>
        </XDSPopover>
      </XDSStaticPreviewProvider>,
    );

    // Trigger still renders so the card showcase looks identical.
    expect(screen.getByText('Open')).toBeInTheDocument();
    // showPopover is never called, so the overlay never enters the top layer.
    expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
  });

  it('opens a controlled popover normally outside a static preview', () => {
    render(
      <XDSPopover
        isOpen
        onOpenChange={() => {}}
        label="Settings"
        content={<span>Popover content</span>}>
        <button type="button">Open</button>
      </XDSPopover>,
    );

    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('does not open a popover on user click inside a static preview', () => {
    render(
      <XDSStaticPreviewProvider>
        <XDSPopover label="Settings" content={<span>Popover content</span>}>
          <button type="button">Open</button>
        </XDSPopover>
      </XDSStaticPreviewProvider>,
    );

    fireEvent.click(screen.getByText('Open'));
    expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
  });
});
