import type { Meta, StoryObj } from '@storybook/react';
import { XDSVStack } from '@xds/core/Layout';

// Demo box component for visibility
const Box = ({ children, color = '#3b82f6' }: { children: React.ReactNode; color?: string }) => (
  <div
    style={{
      backgroundColor: color,
      color: 'white',
      padding: '16px 24px',
      borderRadius: '8px',
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof XDSVStack> = {
  title: 'Layout/XDSVStack',
  component: XDSVStack,
  tags: ['autodocs'],
  argTypes: {
    gap: {
      control: 'select',
      options: ['space0', 'space0.5', 'space1', 'space2', 'space3', 'space4', 'space5', 'space6', 'space7'],
      description: 'Spacing token for gap between items',
    },
    hAlign: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Horizontal alignment of items',
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Flex wrap behavior',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSVStack>;

export const Default: Story = {
  args: {
    gap: 'space2',
    children: null,
  },
  render: (args) => (
    <XDSVStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSVStack>
  ),
};

export const WithGap: Story = {
  args: {
    gap: 'space4',
  },
  render: (args) => (
    <XDSVStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSVStack>
  ),
};

export const HorizontalAlignCenter: Story = {
  args: {
    gap: 'space4',
    hAlign: 'center',
  },
  render: (args) => (
    <XDSVStack {...args} style={{ width: 300, backgroundColor: '#f1f5f9' }}>
      <Box>Short</Box>
      <Box>Medium Item</Box>
      <Box>Short</Box>
    </XDSVStack>
  ),
};

export const HorizontalAlignStart: Story = {
  args: {
    gap: 'space4',
    hAlign: 'start',
  },
  render: (args) => (
    <XDSVStack {...args} style={{ width: 300, backgroundColor: '#f1f5f9' }}>
      <Box>Short</Box>
      <Box>Medium Item</Box>
      <Box>Short</Box>
    </XDSVStack>
  ),
};

export const HorizontalAlignEnd: Story = {
  args: {
    gap: 'space4',
    hAlign: 'end',
  },
  render: (args) => (
    <XDSVStack {...args} style={{ width: 300, backgroundColor: '#f1f5f9' }}>
      <Box>Short</Box>
      <Box>Medium Item</Box>
      <Box>Short</Box>
    </XDSVStack>
  ),
};

export const Wrapping: Story = {
  args: {
    gap: 'space2',
    wrap: 'wrap',
  },
  render: (args) => (
    <XDSVStack {...args} style={{ height: 150, backgroundColor: '#f1f5f9', padding: 8 }}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
      <Box>Item 4</Box>
      <Box>Item 5</Box>
    </XDSVStack>
  ),
};

export const AllAlignments: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>hAlign: start</h4>
        <XDSVStack gap="space2" hAlign="start" style={{ width: 150, backgroundColor: '#f1f5f9', padding: 8 }}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </XDSVStack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>hAlign: center</h4>
        <XDSVStack gap="space2" hAlign="center" style={{ width: 150, backgroundColor: '#f1f5f9', padding: 8 }}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </XDSVStack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>hAlign: end</h4>
        <XDSVStack gap="space2" hAlign="end" style={{ width: 150, backgroundColor: '#f1f5f9', padding: 8 }}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </XDSVStack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>hAlign: stretch</h4>
        <XDSVStack gap="space2" hAlign="stretch" style={{ width: 150, backgroundColor: '#f1f5f9', padding: 8 }}>
          <Box>A</Box>
          <Box>BB</Box>
          <Box>CCC</Box>
        </XDSVStack>
      </div>
    </div>
  ),
};
