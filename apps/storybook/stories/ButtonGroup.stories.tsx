// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {
  ClipboardDocumentIcon,
  ScissorsIcon,
  ClipboardIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Core/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: {control: 'select', options: ['horizontal', 'vertical']},
    size: {control: 'select', options: ['sm', 'md', 'lg']},
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

const iconSize = {width: 16, height: 16} as const;

/** Basic horizontal button group with text buttons. */
export const Horizontal: Story = {
  render: () => (
    <ButtonGroup label="Clipboard actions">
      <Button label="Copy" icon={<ClipboardDocumentIcon style={iconSize} />} />
      <Button label="Cut" icon={<ScissorsIcon style={iconSize} />} />
      <Button label="Paste" icon={<ClipboardIcon style={iconSize} />} />
    </ButtonGroup>
  ),
};

/** Vertical button group. */
export const Vertical: Story = {
  render: () => (
    <ButtonGroup label="Actions" orientation="vertical">
      <Button label="Copy" />
      <Button label="Cut" />
      <Button label="Paste" />
    </ButtonGroup>
  ),
};

/** Icon-only button group for compact toolbars. */
export const IconOnly: Story = {
  render: () => (
    <ButtonGroup label="Text formatting">
      <IconButton label="Bold" icon={<Icon icon={BoldIcon} size="sm" />} />
      <IconButton label="Italic" icon={<Icon icon={ItalicIcon} size="sm" />} />
      <IconButton
        label="Underline"
        icon={<Icon icon={UnderlineIcon} size="sm" />}
      />
    </ButtonGroup>
  ),
};

/** Undo/redo pair with ghost variant. */
export const GhostPair: Story = {
  render: () => (
    <ButtonGroup label="History">
      <Button
        label="Undo"
        variant="ghost"
        icon={<ArrowUturnLeftIcon style={iconSize} />}
        isIconOnly
      />
      <Button
        label="Redo"
        variant="ghost"
        icon={<ArrowUturnRightIcon style={iconSize} />}
        isIconOnly
      />
    </ButtonGroup>
  ),
};

/** All three sizes side by side. */
export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <ButtonGroup label="Small actions" size="sm">
        <Button label="Copy" />
        <Button label="Paste" />
      </ButtonGroup>
      <ButtonGroup label="Medium actions" size="md">
        <Button label="Copy" />
        <Button label="Paste" />
      </ButtonGroup>
      <ButtonGroup label="Large actions" size="lg">
        <Button label="Copy" />
        <Button label="Paste" />
      </ButtonGroup>
    </div>
  ),
};

/** Primary variant button group. */
export const PrimaryVariant: Story = {
  render: () => (
    <ButtonGroup label="Save options">
      <Button label="Save" variant="primary" />
      <Button
        label="Save options"
        variant="primary"
        icon={<ChevronDownIcon style={iconSize} />}
        isIconOnly
      />
    </ButtonGroup>
  ),
};

/** Two-button group (common split button pattern). */
export const SplitButton: Story = {
  render: () => (
    <ButtonGroup label="Merge options">
      <Button label="Merge pull request" variant="primary" />
      <Button
        label="More merge options"
        variant="primary"
        icon={<ChevronDownIcon style={iconSize} />}
        isIconOnly
      />
    </ButtonGroup>
  ),
};

/** Mixed button and icon button children. */
export const Mixed: Story = {
  render: () => (
    <ButtonGroup label="Edit actions">
      <Button label="Edit" />
      <IconButton
        label="More options"
        icon={<ChevronDownIcon style={iconSize} />}
      />
    </ButtonGroup>
  ),
};

/**
 * Members that render their own layer compose correctly, including as the
 * trailing member.
 *
 * A DropdownMenu renders `trigger + popover`, and a tooltip'd Button renders
 * `button + tooltip layer`. Those layers are real (invisible) DOM siblings, so
 * the trailing radius is keyed off a group-item marker rather than
 * `:last-child` — otherwise the layer would steal the slot and the last button
 * would keep square outer corners (#2508).
 *
 * The outer corners of each group below should be rounded.
 */
export const WithLayerRenderingMembers: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <ButtonGroup label="Approve action">
        <Button label="Allow once" variant="primary" />
        <DropdownMenu
          hasChevron={false}
          button={{
            label: 'Allow options',
            variant: 'primary',
            isIconOnly: true,
            icon: <Icon icon="chevronDown" />,
          }}
          items={[{label: 'Allow for 30 minutes'}, {label: 'Always allow'}]}
        />
      </ButtonGroup>

      <ButtonGroup label="Text formatting">
        <IconButton label="Bold" icon={<BoldIcon style={iconSize} />} />
        <IconButton label="Italic" icon={<ItalicIcon style={iconSize} />} />
        <IconButton
          label="Underline"
          icon={<UnderlineIcon style={iconSize} />}
          tooltip="Underline"
        />
      </ButtonGroup>
    </div>
  ),
};
