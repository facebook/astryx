import type { Meta, StoryObj } from '@storybook/react';
import { XDSSkeleton } from '@xds/core/Skeleton';
import { XDSHStack, XDSVStack, XDSCard } from '@xds/core/Layout';

const meta: Meta<typeof XDSSkeleton> = {
  title: 'Core/XDSSkeleton',
  component: XDSSkeleton,
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
      options: ['none', 'inner', 'content', 'element', 'container', 'rounded'],
      description: 'Border radius using design tokens',
    },
    index: {
      control: { type: 'number', min: 0, max: 10, step: 1 },
      description: 'Index for staggered animation timing',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSSkeleton>;

export const Default: Story = {
  args: {
    width: 200,
    height: 20,
    radius: 'container',
    index: 0,
  },
};

export const Shapes: Story = {
  render: () => (
    <XDSHStack gap="space4" vAlign="center">
      <XDSSkeleton width={40} height={40} radius="rounded" />
      <XDSSkeleton width={100} height={20} radius="container" />
      <XDSSkeleton width={120} height={32} radius="element" />
      <XDSSkeleton width={80} height={80} radius="none" />
    </XDSHStack>
  ),
};

export const StaggeredList: Story = {
  render: () => (
    <XDSVStack gap="space2">
      <XDSSkeleton width={300} height={16} index={0} />
      <XDSSkeleton width={280} height={16} index={1} />
      <XDSSkeleton width={320} height={16} index={2} />
      <XDSSkeleton width={260} height={16} index={3} />
      <XDSSkeleton width={290} height={16} index={4} />
    </XDSVStack>
  ),
};

export const CardSkeleton: Story = {
  render: () => (
    <XDSCard width={320}>
      <XDSVStack gap="space3">
        {/* Avatar and name row */}
        <XDSHStack gap="space3" vAlign="center">
          <XDSSkeleton width={40} height={40} radius="rounded" index={0} />
          <XDSVStack gap="space1">
            <XDSSkeleton width={120} height={14} index={1} />
            <XDSSkeleton width={80} height={12} index={2} />
          </XDSVStack>
        </XDSHStack>
        {/* Content lines */}
        <XDSSkeleton width="100%" height={14} index={3} />
        <XDSSkeleton width="90%" height={14} index={4} />
        <XDSSkeleton width="75%" height={14} index={5} />
      </XDSVStack>
    </XDSCard>
  ),
};

export const TableRowSkeleton: Story = {
  render: () => (
    <XDSVStack gap="space2">
      {[0, 1, 2, 3].map((rowIndex) => (
        <XDSHStack key={rowIndex} gap="space4" vAlign="center">
          <XDSSkeleton width={50} height={16} index={rowIndex * 4} />
          <XDSSkeleton width={180} height={16} index={rowIndex * 4 + 1} />
          <XDSSkeleton width={100} height={16} index={rowIndex * 4 + 2} />
          <XDSSkeleton width={80} height={16} index={rowIndex * 4 + 3} />
        </XDSHStack>
      ))}
    </XDSVStack>
  ),
};
