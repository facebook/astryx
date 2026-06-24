// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';

const meta: Meta<typeof Skeleton> = {
  title: 'Core/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: 'text',
      description: 'Width (number for px, string for any CSS value)',
    },
    height: {
      control: 'text',
      description: 'Height (number for px, string for any CSS value)',
    },
    radius: {
      control: 'select',
      options: ['none', 0, 1, 2, 3, 4, 'rounded'],
      description: 'Border radius using design tokens',
    },
    index: {
      control: {type: 'number', min: 0, max: 10, step: 1},
      description: 'Index for staggered animation timing',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    width: 200,
    height: 20,
    radius: 3,
    index: 0,
  },
};

export const Shapes: Story = {
  render: () => (
    <HStack gap={4} vAlign="center">
      <Skeleton width={40} height={40} radius="rounded" />
      <Skeleton width={100} height={20} radius={3} />
      <Skeleton width={120} height={32} radius={2} />
      <Skeleton width={80} height={80} radius="none" />
    </HStack>
  ),
};

export const StaggeredList: Story = {
  render: () => (
    <VStack gap={2}>
      <Skeleton width={300} height={16} index={0} />
      <Skeleton width={280} height={16} index={1} />
      <Skeleton width={320} height={16} index={2} />
      <Skeleton width={260} height={16} index={3} />
      <Skeleton width={290} height={16} index={4} />
    </VStack>
  ),
};

export const CardSkeleton: Story = {
  render: () => (
    <Card width={320}>
      <VStack gap={3}>
        {/* Avatar and name row */}
        <HStack gap={3} vAlign="center">
          <Skeleton width={40} height={40} radius="rounded" index={0} />
          <VStack gap={1}>
            <Skeleton width={120} height={14} index={1} />
            <Skeleton width={80} height={12} index={2} />
          </VStack>
        </HStack>
        {/* Content lines */}
        <Skeleton width="100%" height={14} index={3} />
        <Skeleton width="90%" height={14} index={4} />
        <Skeleton width="75%" height={14} index={5} />
      </VStack>
    </Card>
  ),
};

export const TableRowSkeleton: Story = {
  render: () => (
    <VStack gap={2}>
      {[0, 1, 2, 3].map(rowIndex => (
        <HStack key={rowIndex} gap={4} vAlign="center">
          <Skeleton width={50} height={16} index={rowIndex * 4} />
          <Skeleton width={180} height={16} index={rowIndex * 4 + 1} />
          <Skeleton width={100} height={16} index={rowIndex * 4 + 2} />
          <Skeleton width={80} height={16} index={rowIndex * 4 + 3} />
        </HStack>
      ))}
    </VStack>
  ),
};
