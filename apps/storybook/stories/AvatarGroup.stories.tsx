// Copyright (c) Meta Platforms, Inc. and affiliates.
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSAvatarGroup} from '@xds/core/AvatarGroup';
import {spacingVars, typographyVars} from '@xds/core/theme/tokens.stylex';

const AVATARS = [
  {name: 'Alice Johnson', src: 'https://i.pravatar.cc/150?img=1', key: 'alice'},
  {name: 'Bob Smith', src: 'https://i.pravatar.cc/150?img=2', key: 'bob'},
  {
    name: 'Charlie Davis',
    src: 'https://i.pravatar.cc/150?img=3',
    key: 'charlie',
  },
  {name: 'Diana Lee', src: 'https://i.pravatar.cc/150?img=4', key: 'diana'},
  {name: 'Eve Park', src: 'https://i.pravatar.cc/150?img=5', key: 'eve'},
];

const styles = stylex.create({
  storyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
  },
  heading: {
    margin: `0 0 ${spacingVars['--spacing-2']} 0`,
    fontFamily: typographyVars['--font-family-body'],
  },
});

const meta: Meta<typeof XDSAvatarGroup> = {
  title: 'Core/AvatarGroup',
  component: XDSAvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    maxVisibleCount: {
      control: 'number',
      description: 'Maximum visible avatars before overflow',
    },
    overflowCount: {
      control: 'number',
      description: 'Additional count for overflow indicator',
    },
    size: {
      control: 'select',
      options: ['tiny', 'xsmall', 'small', 'medium', 'large'],
      description: 'Size applied to all child avatars',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSAvatarGroup>;

export const Default: Story = {
  args: {
    avatars: AVATARS.slice(0, 3),
    size: 'medium',
  },
};

export const WithMax: Story = {
  args: {
    avatars: AVATARS,
    maxVisibleCount: 3,
    size: 'medium',
  },
};

export const WithOverflowCount: Story = {
  args: {
    avatars: AVATARS.slice(0, 3),
    maxVisibleCount: 3,
    overflowCount: 44,
    size: 'medium',
  },
};

export const WithClickableOverflow: Story = {
  args: {
    avatars: AVATARS,
    maxVisibleCount: 3,
    size: 'medium',
    onClickOverflow: () => alert('Show all participants'),
  },
};

export const AllSizes: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      {(['tiny', 'xsmall', 'small', 'medium', 'large'] as const).map(size => (
        <div key={size}>
          <h4 {...stylex.props(styles.heading)}>{size}</h4>
          <XDSAvatarGroup avatars={AVATARS} maxVisibleCount={3} size={size} />
        </div>
      ))}
    </div>
  ),
};

export const InitialsFallback: Story = {
  args: {
    avatars: AVATARS.map(({name, key}) => ({name, key})),
    maxVisibleCount: 4,
    size: 'medium',
  },
};
