// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSAvatarStatusDot} from '@xds/core/Avatar';
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

const meta: Meta<typeof XDSAvatar> = {
  title: 'Core/Avatar',
  component: XDSAvatar,
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
        true: <XDSAvatarStatusDot />,
        false: undefined,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSAvatar>;

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
        <XDSAvatar name="TY" size="tiny" />
        <XDSAvatar name="XS" size="xsmall" />
        <XDSAvatar name="SM" size="small" />
        <XDSAvatar name="MD" size="medium" />
        <XDSAvatar name="LG" size="large" />
      </div>
    </div>
  ),
};

export const WithImages: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>With Images (Different Sizes)</h4>
      <div {...stylex.props(styles.row)}>
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=1"
          name="User 1"
          size="tiny"
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=2"
          name="User 2"
          size="xsmall"
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=3"
          name="User 3"
          size="small"
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=4"
          name="User 4"
          size="medium"
        />
        <XDSAvatar
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
        <XDSAvatar name="John Doe" size="medium" />
        <XDSAvatar name="Alice" size="medium" />
        <XDSAvatar name="Bob Smith Johnson" size="medium" />
        <XDSAvatar name="Dr. Sarah Connor" size="medium" />
      </div>
    </div>
  ),
};

export const NoImageNoName: Story = {
  render: () => (
    <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Default Icon (No Image or Name)</h4>
      <div {...stylex.props(styles.row)}>
        <XDSAvatar size="tiny" />
        <XDSAvatar size="xsmall" />
        <XDSAvatar size="small" />
        <XDSAvatar size="medium" />
        <XDSAvatar size="large" />
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
          <XDSAvatar
            src="https://i.pravatar.cc/150?img=10"
            name="Test User"
            size="large"
          />
        </div>
        <div>
          <p {...stylex.props(styles.heading)}>
            Invalid src, valid fallbackSrc
          </p>
          <XDSAvatar
            src="https://invalid-url.example/broken.jpg"
            fallbackSrc="https://i.pravatar.cc/150?img=11"
            name="Test User"
            size="large"
          />
        </div>
        <div>
          <p {...stylex.props(styles.heading)}>Both invalid, has name</p>
          <XDSAvatar
            src="https://invalid-url.example/broken.jpg"
            fallbackSrc="https://also-invalid.example/broken.jpg"
            name="Test User"
            size="large"
          />
        </div>
        <div>
          <p {...stylex.props(styles.heading)}>All invalid, no name</p>
          <XDSAvatar
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
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=20"
          name="Online User"
          size="large"
          status={<XDSAvatarStatusDot variant="success" label="Online" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=21"
          name="Offline User"
          size="large"
          status={<XDSAvatarStatusDot variant="neutral" label="Offline" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=22"
          name="Busy User"
          size="large"
          status={<XDSAvatarStatusDot variant="error" label="Busy" />}
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
        <XDSAvatar
          name="TY"
          size="tiny"
          status={<XDSAvatarStatusDot variant="success" />}
        />
        <XDSAvatar
          name="XS"
          size="xsmall"
          status={<XDSAvatarStatusDot variant="success" />}
        />
        <XDSAvatar
          name="SM"
          size="small"
          status={<XDSAvatarStatusDot variant="success" />}
        />
        <XDSAvatar
          name="MD"
          size="medium"
          status={<XDSAvatarStatusDot variant="success" />}
        />
        <XDSAvatar
          name="LG"
          size="large"
          status={<XDSAvatarStatusDot variant="success" />}
        />
      </div>

      <h4 {...stylex.props(styles.heading)}>Numeric Sizes with Images</h4>
      <div {...stylex.props(styles.row)}>
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=30"
          name="U1"
          size={20}
          status={<XDSAvatarStatusDot variant="success" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=31"
          name="U2"
          size={32}
          status={<XDSAvatarStatusDot variant="success" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=32"
          name="U3"
          size={48}
          status={<XDSAvatarStatusDot variant="error" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=33"
          name="U4"
          size={72}
          status={<XDSAvatarStatusDot variant="neutral" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=34"
          name="U5"
          size={96}
          status={<XDSAvatarStatusDot variant="success" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=35"
          name="U6"
          size={128}
          status={<XDSAvatarStatusDot variant="success" />}
        />
      </div>

      <h4 {...stylex.props(styles.heading)}>All Colors at Medium</h4>
      <div {...stylex.props(styles.row)}>
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=40"
          name="Positive"
          size="medium"
          status={<XDSAvatarStatusDot variant="success" label="Online" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=41"
          name="Neutral"
          size="medium"
          status={<XDSAvatarStatusDot variant="neutral" label="Offline" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=42"
          name="Negative"
          size="medium"
          status={<XDSAvatarStatusDot variant="error" label="Busy" />}
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
        <XDSAvatar name="AB" size="small" status={<XDSAvatarStatusDot />} />
        <XDSAvatar name="CD" size="medium" status={<XDSAvatarStatusDot />} />
        <XDSAvatar name="EF" size="large" status={<XDSAvatarStatusDot />} />
        <XDSAvatar name="GH" size={72} status={<XDSAvatarStatusDot />} />
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
        <XDSAvatar
          name="TY"
          size="tiny"
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          name="XS"
          size="xsmall"
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          name="SM"
          size="small"
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=50"
          name="MD"
          size="medium"
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=51"
          name="LG"
          size="large"
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
      </div>

      <h4 {...stylex.props(styles.heading)}>Numeric Sizes with Images</h4>
      <div {...stylex.props(styles.row)}>
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=30"
          name="U1"
          size={20}
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=31"
          name="U2"
          size={32}
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=32"
          name="U3"
          size={48}
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=33"
          name="U4"
          size={72}
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=34"
          name="U5"
          size={96}
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=35"
          name="U6"
          size={128}
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
      </div>

      <h4 {...stylex.props(styles.heading)}>All Variants with Icons</h4>
      <div {...stylex.props(styles.row)}>
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=52"
          name="Positive"
          size="large"
          status={
            <XDSAvatarStatusDot
              variant="success"
              label="Verified"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=53"
          name="Neutral"
          size="large"
          status={
            <XDSAvatarStatusDot
              variant="neutral"
              label="Pending"
              icon={<CheckIcon />}
            />
          }
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=54"
          name="Negative"
          size="large"
          status={
            <XDSAvatarStatusDot
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
        <XDSAvatar name="16" size={16} />
        <XDSAvatar name="24" size={24} />
        <XDSAvatar name="36" size={36} />
        <XDSAvatar name="48" size={48} />
        <XDSAvatar name="72" size={72} />
        <XDSAvatar name="96" size={96} />
        <XDSAvatar name="128" size={128} />
      </div>
    </div>
  ),
};
