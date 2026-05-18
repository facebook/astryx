// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSButtonGroup} from '@xds/core/ButtonGroup';
import {XDSButton} from '@xds/core/Button';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSIcon} from '@xds/core/Icon';
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

const meta: Meta<typeof XDSButtonGroup> = {
  title: 'Core/Buttons/ButtonGroup',
  component: XDSButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    orientation: {control: 'select', options: ['horizontal', 'vertical']},
    size: {control: 'select', options: ['sm', 'md', 'lg']},
  },
};

export default meta;
type Story = StoryObj<typeof XDSButtonGroup>;

const iconSize = {width: 16, height: 16} as const;

/** Basic horizontal button group with text buttons. */
export const Horizontal: Story = {
  render: () => (
    <XDSButtonGroup label="Clipboard actions">
      <XDSButton
        label="Copy"
        icon={<ClipboardDocumentIcon style={iconSize} />}
      />
      <XDSButton label="Cut" icon={<ScissorsIcon style={iconSize} />} />
      <XDSButton label="Paste" icon={<ClipboardIcon style={iconSize} />} />
    </XDSButtonGroup>
  ),
};

/** Vertical button group. */
export const Vertical: Story = {
  render: () => (
    <XDSButtonGroup label="Actions" orientation="vertical">
      <XDSButton label="Copy" />
      <XDSButton label="Cut" />
      <XDSButton label="Paste" />
    </XDSButtonGroup>
  ),
};

/** Icon-only button group for compact toolbars. */
export const IconOnly: Story = {
  render: () => (
    <XDSButtonGroup label="Text formatting">
      <XDSIconButton
        label="Bold"
        icon={<XDSIcon icon={BoldIcon} size="sm" />}
      />
      <XDSIconButton
        label="Italic"
        icon={<XDSIcon icon={ItalicIcon} size="sm" />}
      />
      <XDSIconButton
        label="Underline"
        icon={<XDSIcon icon={UnderlineIcon} size="sm" />}
      />
    </XDSButtonGroup>
  ),
};

/** Undo/redo pair with ghost variant. */
export const GhostPair: Story = {
  render: () => (
    <XDSButtonGroup label="History">
      <XDSButton
        label="Undo"
        variant="ghost"
        icon={<ArrowUturnLeftIcon style={iconSize} />}
        isIconOnly
      />
      <XDSButton
        label="Redo"
        variant="ghost"
        icon={<ArrowUturnRightIcon style={iconSize} />}
        isIconOnly
      />
    </XDSButtonGroup>
  ),
};

/** All three sizes side by side. */
export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSButtonGroup label="Small actions" size="sm">
        <XDSButton label="Copy" />
        <XDSButton label="Paste" />
      </XDSButtonGroup>
      <XDSButtonGroup label="Medium actions" size="md">
        <XDSButton label="Copy" />
        <XDSButton label="Paste" />
      </XDSButtonGroup>
      <XDSButtonGroup label="Large actions" size="lg">
        <XDSButton label="Copy" />
        <XDSButton label="Paste" />
      </XDSButtonGroup>
    </div>
  ),
};

/** Primary variant button group. */
export const PrimaryVariant: Story = {
  render: () => (
    <XDSButtonGroup label="Save options">
      <XDSButton label="Save" variant="primary" />
      <XDSButton
        label="Save options"
        variant="primary"
        icon={<ChevronDownIcon style={iconSize} />}
        isIconOnly
      />
    </XDSButtonGroup>
  ),
};

/** Two-button group (common split button pattern). */
export const SplitButton: Story = {
  render: () => (
    <XDSButtonGroup label="Merge options">
      <XDSButton label="Merge pull request" variant="primary" />
      <XDSButton
        label="More merge options"
        variant="primary"
        icon={<ChevronDownIcon style={iconSize} />}
        isIconOnly
      />
    </XDSButtonGroup>
  ),
};

/** Mixed button and icon button children. */
export const Mixed: Story = {
  render: () => (
    <XDSButtonGroup label="Edit actions">
      <XDSButton label="Edit" />
      <XDSIconButton
        label="More options"
        icon={<ChevronDownIcon style={iconSize} />}
      />
    </XDSButtonGroup>
  ),
};
