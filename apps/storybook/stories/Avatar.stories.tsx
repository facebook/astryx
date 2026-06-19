// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Avatar} from '@xds/core/Avatar';
import {AvatarStatusDot} from '@xds/core/Avatar';
import {spacingVars, typographyVars} from '@xds/core/theme/tokens.stylex';
import {CheckIcon} from '@heroicons/react/24/solid';

const styles = stylex.create({
  storyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-6'],
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-4'],
  },
  heading: {
    margin: `0 0 ${spacingVars['--spacing-2']} 0`,
    fontFamily: typographyVars['--font-family-body'],
  },
});

const meta: Meta<typeof Avatar> = {
  title: 'Core/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: [
        'tiny',
        'xsmall',
        'small',
        'medium',
        'large',
        16,
        20,
        24,
        32,
        36,
        40,
        48,
        60,
        64,
        72,
        96,
        128,
        144,
        180,
      ],
      description: 'Size of the avatar',
    },
    src: {
      control: 'text',
      description: 'Primary image source URL',
    },
    fallbackSrc: {
      control: 'text',
      description: 'Fallback image when primary fails',
    },
    name: {
      control: 'text',
      description: 'User name for initials and alt text',
    },
    alt: {
      control: 'text',
      description: 'Alt text (falls back to name)',
    },
    status: {
      control: 'boolean',
      description: 'Show status indicator dot',
      mapping: {
        true: <AvatarStatusDot />,
        false: undefined,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    size: 'medium',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    name: 'Jane Smith',
    size: 'medium',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Named Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="TY" size="tiny" />
        <Avatar name="XS" size="xsmall" />
        <Avatar name="SM" size="small" />
        <Avatar name="MD" size="medium" />
        <Avatar name="LG" size="large" />
      </div>
    </div>
  ),
};

export const WithImages: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>With Images (Different Sizes)</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar
          src="https://i.pravatar.cc/150?img=1"
          name="User 1"
          size="tiny"
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=2"
          name="User 2"
          size="xsmall"
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=3"
          name="User 3"
          size="small"
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=4"
          name="User 4"
          size="medium"
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=5"
          name="User 5"
          size="large"
        />
      </div>
    </div>
  ),
};

export const InitialsFallback: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Initials Fallback</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="John Doe" size="medium" />
        <Avatar name="Alice" size="medium" />
        <Avatar name="Bob Smith Johnson" size="medium" />
        <Avatar name="Dr. Sarah Connor" size="medium" />
      </div>
    </div>
  ),
};

export const NoImageNoName: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Default Icon (No Image or Name)</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar size="tiny" />
        <Avatar size="xsmall" />
        <Avatar size="small" />
        <Avatar size="medium" />
        <Avatar size="large" />
      </div>
    </div>
  ),
};

export const FallbackChain: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Fallback Chain Demo</h4>
      <div {...stylex.props(styles.row)}>
        <div>
          <p {...stylex.props(styles.heading)}>Valid src</p>
          <Avatar
            src="https://i.pravatar.cc/150?img=10"
            name="Test User"
            size="large"
          />
        </div>
        <div>
          <p {...stylex.props(styles.heading)}>
            Invalid src, valid fallbackSrc
          </p>
          <Avatar
            src="https://invalid-url.example/broken.jpg"
            fallbackSrc="https://i.pravatar.cc/150?img=11"
            name="Test User"
            size="large"
          />
        </div>
        <div>
          <p {...stylex.props(styles.heading)}>Both invalid, has name</p>
          <Avatar
            src="https://invalid-url.example/broken.jpg"
            fallbackSrc="https://also-invalid.example/broken.jpg"
            name="Test User"
            size="large"
          />
        </div>
        <div>
          <p {...stylex.props(styles.heading)}>All invalid, no name</p>
          <Avatar
            src="https://invalid-url.example/broken.jpg"
            size="large"
          />
        </div>
      </div>
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>With Status Indicators</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar
          src="https://i.pravatar.cc/150?img=20"
          name="Online User"
          size="large"
          status={<AvatarStatusDot variant="success" label="Online" />}
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=21"
          name="Offline User"
          size="large"
          status={<AvatarStatusDot variant="neutral" label="Offline" />}
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=22"
          name="Busy User"
          size="large"
          status={<AvatarStatusDot variant="error" label="Busy" />}
        />
      </div>
    </div>
  ),
};

export const StatusAcrossAllSizes: Story = {
  name: 'Status Dot Across All Sizes',
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>
        Status dot scales proportionally with avatar size
      </h4>

      <h4 {...stylex.props(styles.heading)}>Named Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar
          name="TY"
          size="tiny"
          status={<AvatarStatusDot variant="success" />}
        />
        <Avatar
          name="XS"
          size="xsmall"
          status={<AvatarStatusDot variant="success" />}
        />
        <Avatar
          name="SM"
          size="small"
          status={<AvatarStatusDot variant="success" />}
        />
        <Avatar
          name="MD"
          size="medium"
          status={<AvatarStatusDot variant="success" />}
        />
        <Avatar
          name="LG"
          size="large"
          status={<AvatarStatusDot variant="success" />}
        />
      </div>

      <h4 {...stylex.props(styles.heading)}>Numeric Sizes with Images</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar
          src="https://i.pravatar.cc/150?img=30"
          name="U1"
          size={20}
          status={<AvatarStatusDot variant="success" />}
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=31"
          name="U2"
          size={32}
          status={<AvatarStatusDot variant="success" />}
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=32"
          name="U3"
          size={48}
          status={<AvatarStatusDot variant="error" />}
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=33"
          name="U4"
          size={72}
          status={<AvatarStatusDot variant="neutral" />}
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=34"
          name="U5"
          size={96}
          status={<AvatarStatusDot variant="success" />}
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=35"
          name="U6"
          size={128}
          status={<AvatarStatusDot variant="success" />}
        />
      </div>

      <h4 {...stylex.props(styles.heading)}>All Colors at Medium</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar
          src="https://i.pravatar.cc/150?img=40"
          name="Positive"
          size="medium"
          status={<AvatarStatusDot variant="success" label="Online" />}
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=41"
          name="Neutral"
          size="medium"
          status={<AvatarStatusDot variant="neutral" label="Offline" />}
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=42"
          name="Negative"
          size="medium"
          status={<AvatarStatusDot variant="error" label="Busy" />}
        />
      </div>
    </div>
  ),
};

export const StatusWithSizes: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Status with Different Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="AB" size="small" status={<AvatarStatusDot />} />
        <Avatar name="CD" size="medium" status={<AvatarStatusDot />} />
        <Avatar name="EF" size="large" status={<AvatarStatusDot />} />
        <Avatar name="GH" size={72} status={<AvatarStatusDot />} />
      </div>
    </div>
  ),
};

export const StatusWithIcon: Story = {
  name: 'Status Dot with Icon',
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>
        Icon inside status dot (hidden at tiny sizes where there isn't room)
      </h4>

      <h4 {...stylex.props(styles.heading)}>Named Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar
          name="TY"
          size="tiny"
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          name="XS"
          size="xsmall"
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          name="SM"
          size="small"
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=50"
          name="MD"
          size="medium"
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=51"
          name="LG"
          size="large"
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
      </div>

      <h4 {...stylex.props(styles.heading)}>Numeric Sizes with Images</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar
          src="https://i.pravatar.cc/150?img=30"
          name="U1"
          size={20}
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=31"
          name="U2"
          size={32}
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=32"
          name="U3"
          size={48}
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=33"
          name="U4"
          size={72}
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=34"
          name="U5"
          size={96}
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=35"
          name="U6"
          size={128}
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
      </div>

      <h4 {...stylex.props(styles.heading)}>All Variants with Icons</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar
          src="https://i.pravatar.cc/150?img=52"
          name="Positive"
          size="large"
          status={
            <AvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=53"
          name="Neutral"
          size="large"
          status={
            <AvatarStatusDot
              variant="neutral"
              label="Pending"
              icon={<CheckIcon />}
            />
          }
        />
        <Avatar
          src="https://i.pravatar.cc/150?img=54"
          name="Negative"
          size="large"
          status={
            <AvatarStatusDot
              variant="error"
              label="Rejected"
              icon={<CheckIcon />}
            />
          }
        />
      </div>
    </div>
  ),
};

export const NumericSizes: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Numeric Pixel Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="16" size={16} />
        <Avatar name="24" size={24} />
        <Avatar name="36" size={36} />
        <Avatar name="48" size={48} />
        <Avatar name="72" size={72} />
        <Avatar name="96" size={96} />
        <Avatar name="128" size={128} />
      </div>
    </div>
  ),
};
