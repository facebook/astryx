// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MenuButtonA11y.stories.tsx
 * @input The DropdownMenu and MoreMenu menu-button binding states
 * @output One checked-in story per state for the Chromium accessibility lane; excluded from the visual matrix
 * @position Browser fixtures for component:DropdownMenu AR4 and component:MoreMenu AR1 (MENU_BUTTON_PATTERN)
 */

import type {Meta, StoryObj} from '@storybook/react';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';

const meta = {
  title: 'A11y/Menu Button',
  tags: ['no-visual'],
  parameters: {layout: 'padded'},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  {label: 'Rename'},
  {label: 'Duplicate'},
  {label: 'Archive', isDisabled: true},
  {label: 'Delete'},
];

function After() {
  return <button type="button">After the menu</button>;
}

export const DropdownButtonClosed: Story = {
  render: () => (
    <div>
      <DropdownMenu
        button={{label: 'Actions'}}
        items={items}
        presentation="popover"
      />
      <After />
    </div>
  ),
};

export const DropdownButtonOpen: Story = {
  render: () => (
    <div>
      <DropdownMenu
        button={{label: 'Actions'}}
        items={items}
        presentation="popover"
        isMenuOpen
        onOpenChange={() => {}}
      />
      <After />
    </div>
  ),
};

export const DropdownRenderTriggerClosed: Story = {
  render: () => (
    <div>
      <DropdownMenu
        items={items}
        presentation="popover"
        renderTrigger={({ref, ...props}) => (
          <button type="button" ref={ref} {...props}>
            Row actions
          </button>
        )}
      />
      <After />
    </div>
  ),
};

export const DropdownButtonDisabled: Story = {
  render: () => (
    <div>
      <DropdownMenu
        button={{label: 'Actions', isDisabled: true}}
        items={items}
        presentation="popover"
      />
      <After />
    </div>
  ),
};

export const MoreMenuClosed: Story = {
  render: () => (
    <div>
      <MoreMenu label="More options" items={items} presentation="popover" />
      <After />
    </div>
  ),
};
