// Copyright (c) Meta Platforms, Inc. and affiliates.
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Avatar} from '@astryxdesign/core/Avatar';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  spacingVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const USERS = [
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

const storyStyles = stylex.create({
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

const meta: Meta<typeof AvatarGroup> = {
  title: 'Core/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xsm', 'sm', 'md', 'lg', 'xl'],
      description: 'Size applied to all child avatars',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

/** Basic avatar group showing all members. */
export const Default: Story = {
  render: () => (
    <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => (
        <Avatar key={u.key} src={u.src} name={u.name} />
      ))}
    </AvatarGroup>
  ),
};

/** Sliced to 3 with "+N" overflow indicator. */
export const WithOverflow: Story = {
  render: () => (
    <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => (
        <Avatar key={u.key} src={u.src} name={u.name} />
      ))}
      <AvatarGroupOverflow count={USERS.length - 3} />
    </AvatarGroup>
  ),
};

/** Clickable overflow indicator. */
export const ClickableOverflow: Story = {
  render: () => (
    <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => (
        <Avatar key={u.key} src={u.src} name={u.name} />
      ))}
      <AvatarGroupOverflow
        count={USERS.length - 3}
        onClick={() => alert('Show all participants')}
      />
    </AvatarGroup>
  ),
};

/** Server-side total count (47 participants, only 3 rendered). */
export const ServerSideCount: Story = {
  render: () => (
    <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => (
        <Avatar key={u.key} src={u.src} name={u.name} />
      ))}
      <AvatarGroupOverflow count={44} />
    </AvatarGroup>
  ),
};

/** Per-avatar status dots — just works with compositional API. */
export const WithStatusDots: Story = {
  render: () => (
    <AvatarGroup size="lg">
      <Avatar
        src="https://i.pravatar.cc/150?img=1"
        name="Alice"
        status={<StatusDot variant="success" label="Online" />}
      />
      <Avatar
        src="https://i.pravatar.cc/150?img=2"
        name="Bob"
        status={<StatusDot variant="warning" label="Away" />}
      />
      <Avatar
        src="https://i.pravatar.cc/150?img=3"
        name="Charlie"
        status={<StatusDot variant="error" label="Offline" />}
      />
    </AvatarGroup>
  ),
};

/** All sizes side by side. */
export const AllSizes: Story = {
  render: () => (
    <div {...stylex.props(storyStyles.storyWrapper)}>
      {(['xsm', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
        <div key={size}>
          <h4 {...stylex.props(storyStyles.heading)}>{size}</h4>
          <AvatarGroup size={size}>
            {USERS.slice(0, 3).map(u => (
              <Avatar key={u.key} src={u.src} name={u.name} />
            ))}
            <AvatarGroupOverflow count={USERS.length - 3} />
          </AvatarGroup>
        </div>
      ))}
    </div>
  ),
};

/** Initials fallback when no images provided. */
export const InitialsFallback: Story = {
  render: () => (
    <AvatarGroup size="lg">
      {USERS.slice(0, 4).map(u => (
        <Avatar key={u.key} name={u.name} />
      ))}
      <AvatarGroupOverflow count={1} />
    </AvatarGroup>
  ),
};

/** Single avatar — no overlap applied. */
export const SingleAvatar: Story = {
  render: () => (
    <AvatarGroup size="lg">
      <Avatar src="https://i.pravatar.cc/150?img=1" name="Alice Johnson" />
    </AvatarGroup>
  ),
};

/** Large overflow count (99+). */
export const LargeOverflowCount: Story = {
  render: () => (
    <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => (
        <Avatar key={u.key} src={u.src} name={u.name} />
      ))}
      <AvatarGroupOverflow count={999} />
    </AvatarGroup>
  ),
};

/** Zero overflow count edge case. */
export const ZeroOverflow: Story = {
  render: () => (
    <AvatarGroup size="lg">
      {USERS.slice(0, 3).map(u => (
        <Avatar key={u.key} src={u.src} name={u.name} />
      ))}
      <AvatarGroupOverflow count={0} />
    </AvatarGroup>
  ),
};

/** Narrow container — tests overflow behavior in constrained width. */
export const NarrowContainer: Story = {
  render: () => (
    <div style={{width: 120, border: '1px dashed grey', padding: 8}}>
      <AvatarGroup size="lg">
        {USERS.slice(0, 5).map(u => (
          <Avatar key={u.key} src={u.src} name={u.name} />
        ))}
        <AvatarGroupOverflow count={10} />
      </AvatarGroup>
    </div>
  ),
};

/** Many avatars — 10+ items to verify overlap stacking. */
export const ManyAvatars: Story = {
  render: () => {
    const manyUsers = Array.from({length: 10}, (_, i) => ({
      key: `user-${i}`,
      name: `User ${i + 1}`,
      src: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
    }));
    return (
      <AvatarGroup size="md">
        {manyUsers.map(u => (
          <Avatar key={u.key} src={u.src} name={u.name} />
        ))}
        <AvatarGroupOverflow count={37} />
      </AvatarGroup>
    );
  },
};
