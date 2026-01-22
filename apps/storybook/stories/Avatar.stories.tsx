import type { Meta, StoryObj } from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import { XDSAvatar } from '@xds/core/Avatar';
import { color, spacing, typography } from '@xds/core/theme/tokens.stylex';

const styles = stylex.create({
  storyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.space6,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.space4,
  },
  heading: {
    margin: `0 0 ${spacing.space2} 0`,
    fontFamily: typography.fontFamilyBody,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: color.positive,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.surface,
  },
  statusDotOffline: {
    backgroundColor: color.textSecondary,
  },
  statusDotBusy: {
    backgroundColor: color.negative,
  },
});

// Simple status indicator component for demos
const StatusDot = ({ status = 'online' }: { status?: 'online' | 'offline' | 'busy' }) => (
  <div
    {...stylex.props(
      styles.statusDot,
      status === 'offline' && styles.statusDotOffline,
      status === 'busy' && styles.statusDotBusy
    )}
  />
);

const meta: Meta<typeof XDSAvatar> = {
  title: 'Components/XDSAvatar',
  component: XDSAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['tiny', 'xsmall', 'small', 'medium', 'large', 16, 20, 24, 32, 36, 40, 48, 60, 64, 72, 96, 128, 144, 180],
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
        true: <StatusDot />,
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
        <XDSAvatar src="https://i.pravatar.cc/150?img=1" name="User 1" size="tiny" />
        <XDSAvatar src="https://i.pravatar.cc/150?img=2" name="User 2" size="xsmall" />
        <XDSAvatar src="https://i.pravatar.cc/150?img=3" name="User 3" size="small" />
        <XDSAvatar src="https://i.pravatar.cc/150?img=4" name="User 4" size="medium" />
        <XDSAvatar src="https://i.pravatar.cc/150?img=5" name="User 5" size="large" />
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
          <XDSAvatar src="https://i.pravatar.cc/150?img=10" name="Test User" size="large" />
        </div>
        <div>
          <p {...stylex.props(styles.heading)}>Invalid src, valid fallbackSrc</p>
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
          status={<StatusDot status="online" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=21"
          name="Offline User"
          size="large"
          status={<StatusDot status="offline" />}
        />
        <XDSAvatar
          src="https://i.pravatar.cc/150?img=22"
          name="Busy User"
          size="large"
          status={<StatusDot status="busy" />}
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
        <XDSAvatar name="AB" size="small" status={<StatusDot />} />
        <XDSAvatar name="CD" size="medium" status={<StatusDot />} />
        <XDSAvatar name="EF" size="large" status={<StatusDot />} />
        <XDSAvatar name="GH" size={72} status={<StatusDot />} />
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
