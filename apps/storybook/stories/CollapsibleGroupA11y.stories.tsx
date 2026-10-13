// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CollapsibleGroupA11y.stories.tsx
 * @input The CollapsibleGroup accordion binding states
 * @output One checked-in story per state for the Chromium accessibility lane; excluded from the visual matrix
 * @position Browser fixtures for component:CollapsibleGroup AR4 (ACCORDION_PATTERN)
 */

import type {Meta, StoryObj} from '@storybook/react';
import {Collapsible, CollapsibleGroup} from '@astryxdesign/core/Collapsible';

const meta = {
  title: 'A11y/CollapsibleGroup Accordion',
  tags: ['no-visual'],
  parameters: {layout: 'padded'},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS = [
  {value: 'profile', label: 'Profile settings'},
  {value: 'privacy', label: 'Privacy settings'},
  {value: 'notifications', label: 'Notification settings'},
] as const;

function Fixture({
  type,
  defaultValue,
  disabled = [],
}: {
  readonly type: 'single' | 'multiple';
  readonly defaultValue: ReadonlyArray<string>;
  readonly disabled?: ReadonlyArray<string>;
}) {
  return (
    <div>
      <CollapsibleGroup
        type={type}
        defaultValue={type === 'single' ? defaultValue[0] : [...defaultValue]}>
        {ITEMS.map(item => (
          <Collapsible
            key={item.value}
            value={item.value}
            trigger={item.label}
            isDisabled={disabled.includes(item.value)}>
            {item.label} content
          </Collapsible>
        ))}
      </CollapsibleGroup>
      <button type="button">After the group</button>
    </div>
  );
}

export const SingleCollapsedMiddle: Story = {
  render: () => <Fixture type="single" defaultValue={['profile']} />,
};

export const SingleExpandedFirst: Story = {
  render: () => <Fixture type="single" defaultValue={['profile']} />,
};

export const MultipleCollapsedLast: Story = {
  render: () => (
    <Fixture type="multiple" defaultValue={['profile', 'privacy']} />
  ),
};

export const SingleDisabledCollapsed: Story = {
  render: () => (
    <Fixture type="single" defaultValue={['profile']} disabled={['privacy']} />
  ),
};
