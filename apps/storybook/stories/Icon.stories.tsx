import type {Meta, StoryObj} from '@storybook/react';
import {XDSIcon} from '@xds/core/Icon';
import {
  HomeIcon,
  HeartIcon,
  StarIcon,
  BellIcon,
  UserIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

const meta: Meta<typeof XDSIcon> = {
  title: 'Core/XDSIcon',
  component: XDSIcon,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
      description: 'Hero Icon component to render',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'disabled',
        'accent',
        'positive',
        'negative',
        'warning',
        'inherit',
      ],
      description: 'Color variant',
    },
    size: {
      control: 'select',
      options: ['xsm', 'sm', 'md', 'lg'],
      description: 'Icon size',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSIcon>;

export const Default: Story = {
  args: {
    icon: HomeIcon,
    color: 'primary',
    size: 'md',
  },
};

export const Primary: Story = {
  args: {
    icon: HomeIcon,
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    icon: HomeIcon,
    color: 'secondary',
  },
};

export const Accent: Story = {
  args: {
    icon: HeartIcon,
    color: 'accent',
  },
};

export const Positive: Story = {
  args: {
    icon: CheckCircleIcon,
    color: 'positive',
  },
};

export const Negative: Story = {
  args: {
    icon: XCircleIcon,
    color: 'negative',
  },
};

export const Warning: Story = {
  args: {
    icon: ExclamationTriangleIcon,
    color: 'warning',
  },
};

export const ExtraSmall: Story = {
  args: {
    icon: StarIcon,
    size: 'xsm',
  },
};

export const Small: Story = {
  args: {
    icon: StarIcon,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    icon: StarIcon,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    icon: StarIcon,
    size: 'lg',
  },
};

export const SolidIcon: Story = {
  args: {
    icon: HeartIconSolid,
    color: 'negative',
    size: 'lg',
  },
};

export const AllColors: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <XDSIcon icon={HomeIcon} color="primary" />
      <XDSIcon icon={UserIcon} color="secondary" />
      <XDSIcon icon={CogIcon} color="tertiary" />
      <XDSIcon icon={BellIcon} color="disabled" />
      <XDSIcon icon={HeartIcon} color="accent" />
      <XDSIcon icon={CheckCircleIcon} color="positive" />
      <XDSIcon icon={XCircleIcon} color="negative" />
      <XDSIcon icon={ExclamationTriangleIcon} color="warning" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <XDSIcon icon={StarIcon} size="xsm" />
      <XDSIcon icon={StarIcon} size="sm" />
      <XDSIcon icon={StarIcon} size="md" />
      <XDSIcon icon={StarIcon} size="lg" />
    </div>
  ),
};

export const OutlineVsSolid: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
        <XDSIcon icon={HeartIcon} size="lg" color="negative" />
        <span style={{fontSize: '12px', color: '#666'}}>Outline</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
        <XDSIcon icon={HeartIconSolid} size="lg" color="negative" />
        <span style={{fontSize: '12px', color: '#666'}}>Solid</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
        <XDSIcon icon={StarIcon} size="lg" color="warning" />
        <span style={{fontSize: '12px', color: '#666'}}>Outline</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
        <XDSIcon icon={StarIconSolid} size="lg" color="warning" />
        <span style={{fontSize: '12px', color: '#666'}}>Solid</span>
      </div>
    </div>
  ),
};

export const InheritColor: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
      <span
        style={{
          color: 'blue',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
        <XDSIcon icon={HomeIcon} color="inherit" size="sm" />
        Blue text
      </span>
      <span
        style={{
          color: 'green',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
        <XDSIcon icon={CheckCircleIcon} color="inherit" size="sm" />
        Green text
      </span>
      <span
        style={{
          color: 'red',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
        <XDSIcon icon={XCircleIcon} color="inherit" size="sm" />
        Red text
      </span>
    </div>
  ),
};
