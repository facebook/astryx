// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ContextMenuInteractionModality.test.tsx
 * @input ContextMenu with a sub-menu whose header makes its drilled-in view a
 *   dialog; user-event pointer input
 * @output Proof that ContextMenu starts the shared interaction-modality
 *   tracker, so a view opened by mouse reads pointer input and shows no
 *   keyboard focus ring
 * @position A file of its own: once any component starts the document-level
 *   tracker it stays on for the file, and the bottom-sheet cases in
 *   ContextMenu.test.tsx start it through BottomSheet.
 */

import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ContextMenu} from './ContextMenu';
import {DropdownMenuItem} from '../DropdownMenu/DropdownMenuItem';
import {DropdownMenuSubMenu} from '../DropdownMenu/DropdownMenuSubMenu';
import {
  __resetInteractionModalityForTest,
  getInteractionModality,
} from '../utils/interactionModality';

beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
  });
  __resetInteractionModalityForTest();
});

describe('ContextMenu interaction modality', () => {
  it("records a mouse open, so a regioned sub-menu's drilled-in view opened by mouse reads pointer input", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu
        label="Row actions"
        menuContent={
          <DropdownMenuSubMenu
            label="Labels"
            presentation="drill-in"
            header={<input aria-label="Filter labels" />}>
            <DropdownMenuItem label="Bug" onClick={() => {}} />
          </DropdownMenuSubMenu>
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    const trigger = screen.getByText('Right-click me');
    await user.pointer({keys: '[MouseRight>]', target: trigger});
    fireEvent.contextMenu(trigger);
    await user.click(
      screen.getByRole('menuitem', {name: /Labels/, hidden: true}),
    );
    await screen.findByRole('dialog', {name: /Labels/, hidden: true});
    // Without the tracker the modality stays at its keyboard default, and
    // the view's menu would take focus with the keyboard ring.
    expect(getInteractionModality()).toBe('pointer');
  });
});
