// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ChatComposerDrawer} from './ChatComposerDrawer';

describe('ChatComposerDrawer', () => {
  it('links the toggle to the drawer content via aria-controls', () => {
    render(
      <ChatComposerDrawer count={2} label="Attachments">
        <span>Drawer content</span>
      </ChatComposerDrawer>,
    );

    const toggle = screen.getByRole('button', {name: /Attachments/});
    const controlsId = toggle.getAttribute('aria-controls');
    // aria-controls must be present and point at the real content region.
    expect(controlsId).toBeTruthy();
    const region = document.getElementById(controlsId as string);
    expect(region).not.toBeNull();
    expect(region).toContainElement(screen.getByText('Drawer content'));
  });

  it('keeps aria-controls resolvable while collapsed (content stays mounted)', () => {
    render(
      <ChatComposerDrawer count={2} label="Attachments" defaultIsCollapsed>
        <span>Drawer content</span>
      </ChatComposerDrawer>,
    );

    const toggle = screen.getByRole('button', {name: /Attachments/});
    const controlsId = toggle.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    const region = document.getElementById(controlsId as string);
    expect(region).not.toBeNull();
    expect(region).toContainElement(screen.getByText('Drawer content'));
  });

  it('toggles aria-expanded when the toggle is activated', () => {
    render(
      <ChatComposerDrawer count={2} label="Attachments">
        <span>Drawer content</span>
      </ChatComposerDrawer>,
    );

    const toggle = screen.getByRole('button', {name: /Attachments/});
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggle);
    expect(screen.getByRole('button', {name: /Attachments/})).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    fireEvent.click(screen.getByRole('button', {name: /Attachments/}));
    expect(screen.getByRole('button', {name: /Attachments/})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
