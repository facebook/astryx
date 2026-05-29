// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {
  HomeIcon,
  CubeIcon,
  BoltIcon,
  RocketLaunchIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';

const meta: Meta<typeof XDSNavIcon> = {
  title: 'Core/NavIcon',
  component: XDSNavIcon,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      description: 'Icon element to render inside the circular background',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSNavIcon>;

export const Default: Story = {
  args: {
    icon: <HomeIcon style={{width: 16, height: 16}} />,
  },
};

export const WithCubeIcon: Story = {
  args: {
    icon: <CubeIcon style={{width: 16, height: 16}} />,
  },
};

export const WithBoltIcon: Story = {
  args: {
    icon: <BoltIcon style={{width: 16, height: 16}} />,
  },
};

export const Gallery: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSNavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />
      <XDSNavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
      <XDSNavIcon icon={<BoltIcon style={{width: 16, height: 16}} />} />
      <XDSNavIcon icon={<RocketLaunchIcon style={{width: 16, height: 16}} />} />
      <XDSNavIcon icon={<SparklesIcon style={{width: 16, height: 16}} />} />
    </div>
  ),
};
