// Copyright (c) Meta Platforms, Inc. and affiliates.
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSAvatarGroup, XDSAvatarGroupOverflow} from '@xds/core/AvatarGroup';
import {XDSAvatar} from '@xds/core/Avatar';
import {spacingVars, typographyVars} from '@xds/core/theme/tokens.stylex';

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

const meta: Meta<typeof XDSAvatarGroup> = {
  title: 'Core/AvatarGroup',
  component: XDSAvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['tiny', 'xsmall', 'small', 'medium', 'large'],
      description: 'Size applied to all child avatars',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSAvatarGroup>;

/** Basic avatar group showing all members. */
export const Default: Story = {
  render: () => (
    <XDSAvatarGroup size="medium">
      {USERS.slice(0, 3).map(u => (
        <XDSAvatar key={u.key} src={u.src} name={u.name} />
      ))}
    </XDSAvatarGroup>
  ),
};

/** Sliced to 3 with "+N" overflow indicator. */
export const WithOverflow: Story = {
  render: () => (
    <XDSAvatarGroup size="medium">
      {USERS.slice(0, 3).map(u => (
        <XDSAvatar key={u.key} src={u.src} name={u.name} />
      ))}
      <XDSAvatarGroupOverflow count={USERS.length - 3} />
    </XDSAvatarGroup>
  ),
};

/** Clickable overflow indicator. */
export const ClickableOverflow: Story = {
  render: () => (
    <XDSAvatarGroup size="medium">
      {USERS.slice(0, 3).map(u => (
        <XDSAvatar key={u.key} src={u.src} name={u.name} />
      ))}
      <XDSAvatarGroupOverflow
        count={USERS.length - 3}
        onClick={() => alert('Show all participants')}
      />
    </XDSAvatarGroup>
  ),
};

/** Server-side total count (47 participants, only 3 rendered). */
export const ServerSideCount: Story = {
  render: () => (
    <XDSAvatarGroup size="medium">
      {USERS.slice(0, 3).map(u => (
        <XDSAvatar key={u.key} src={u.src} name={u.name} />
      ))}
      <XDSAvatarGroupOverflow count={44} />
    </XDSAvatarGroup>
  ),
};

/** Per-avatar status dots — just works with compositional API. */
export const WithStatusDots: Story = {
  render: () => (
    <XDSAvatarGroup size="medium">
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=1"
        name="Alice"
        statusDot={{color: 'positive'}}
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=2"
        name="Bob"
        statusDot={{color: 'warning'}}
      />
      <XDSAvatar
        src="https://i.pravatar.cc/150?img=3"
        name="Charlie"
        statusDot={{color: 'negative'}}
      />
    </XDSAvatarGroup>
  ),
};

/** All sizes side by side. */
export const AllSizes: Story = {
  render: () => (
    <div {...stylex.props(storyStyles.storyWrapper)}>
      {(['tiny', 'xsmall', 'small', 'medium', 'large'] as const).map(size => (
        <div key={size}>
          <h4 {...stylex.props(storyStyles.heading)}>{size}</h4>
          <XDSAvatarGroup size={size}>
            {USERS.slice(0, 3).map(u => (
              <XDSAvatar key={u.key} src={u.src} name={u.name} />
            ))}
            <XDSAvatarGroupOverflow count={USERS.length - 3} />
          </XDSAvatarGroup>
        </div>
      ))}
    </div>
  ),
};

/** Initials fallback when no images provided. */
export const InitialsFallback: Story = {
  render: () => (
    <XDSAvatarGroup size="medium">
      {USERS.slice(0, 4).map(u => (
        <XDSAvatar key={u.key} name={u.name} />
      ))}
      <XDSAvatarGroupOverflow count={1} />
    </XDSAvatarGroup>
  ),
};
