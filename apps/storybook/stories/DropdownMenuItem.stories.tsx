// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuItem.stories.tsx
 * @input Uses one open pointer menu containing every DropdownMenuItem content and state branch
 * @output Component-owned rendered evidence for action, link, destructive, disabled, and supporting-content rows
 * @position Storybook evidence; keeps the closed public state inventory reachable from one bounded fixture
 */

import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within} from 'storybook/test';
import {DropdownMenu, DropdownMenuItem} from '@astryxdesign/core/DropdownMenu';
import {
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof DropdownMenuItem> = {
  title: 'Core/DropdownMenuItem',
  component: DropdownMenuItem,
  tags: ['autodocs', 'visual-theme-matrix'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One pointer-menu row for an action or destination. The parent menu owns keyboard navigation; the row owns activation, disabled state, optional destination semantics, content layout, and its theme target.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenuItem>;

export const ItemStates: Story = {
  render: () => (
    <DropdownMenu
      button={{label: 'Open item evidence'}}
      menuWidth={280}
      presentation="popover">
      <DropdownMenuItem
        data-testid="default-row"
        icon={PencilIcon}
        label="Edit project"
        onClick={() => {}}
      />
      <DropdownMenuItem
        data-testid="supporting-row"
        icon={DocumentDuplicateIcon}
        label="Duplicate project"
        description="Create an editable copy"
        endContent={<span aria-hidden="true">⌘D</span>}
        hasCloseOnSelect={false}
        onClick={() => {}}
      />
      <DropdownMenuItem
        data-testid="destructive-row"
        icon={TrashIcon}
        label="Delete project"
        variant="destructive"
        onClick={() => {}}
      />
      <DropdownMenuItem
        data-testid="disabled-row"
        label="Archive unavailable"
        isDisabled
        onClick={() => {}}
      />
      <DropdownMenuItem
        data-testid="link-row"
        icon={Cog6ToothIcon}
        label="Project settings"
        href="/settings"
      />
    </DropdownMenu>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', {name: 'Open item evidence'}),
    );
    const menu = await within(document.body).findByRole('menu');
    const scope = within(menu);
    await expect(scope.getAllByRole('menuitem')).toHaveLength(5);
    await expect(
      scope.getByRole('menuitem', {name: 'Archive unavailable'}),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      scope.getByRole('menuitem', {name: 'Project settings'}),
    ).toHaveAttribute('href', '/settings');
  },
};
