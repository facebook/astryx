// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {NavIcon} from '@xds/core/NavIcon';
import {
  HomeIcon,
  CubeIcon,
  BoltIcon,
  RocketLaunchIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';

const meta: Meta<typeof NavIcon> = {
  title: 'Core/NavIcon',
  component: NavIcon,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      description: 'Icon element to render inside the circular background',
    },
  },
};

export default meta;
type Story = StoryObj<typeof NavIcon>;

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
      <NavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />
      <NavIcon icon={<CubeIcon style={{width: 16, height: 16}} />} />
      <NavIcon icon={<BoltIcon style={{width: 16, height: 16}} />} />
      <NavIcon icon={<RocketLaunchIcon style={{width: 16, height: 16}} />} />
      <NavIcon icon={<SparklesIcon style={{width: 16, height: 16}} />} />
    </div>
  ),
};
