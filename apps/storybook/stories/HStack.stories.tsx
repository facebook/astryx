import type { Meta, StoryObj } from '@storybook/react';
import { XDSHStack } from '@xds/core/Layout';

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

const meta: Meta<typeof XDSHStack> = {
  title: 'Layout/XDSHStack',
  component: XDSHStack,
  tags: ['autodocs'],
  argTypes: {
    gap: {
      control: 'select',
      options: ['space0', 'space0.5', 'space1', 'space2', 'space3', 'space4', 'space5', 'space6', 'space7'],
      description: 'Spacing token for gap between items',
    },
    vAlign: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Vertical alignment of items',
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Flex wrap behavior',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSHStack>;

export const Default: Story = {
  args: {
    gap: 'space2',
    children: null,
  },
  render: (args) => (
    <XDSHStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSHStack>
  ),
};

export const WithGap: Story = {
  args: {
    gap: 'space4',
  },
  render: (args) => (
    <XDSHStack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </XDSHStack>
  ),
};

export const VerticalAlignCenter: Story = {
  args: {
    gap: 'space4',
    vAlign: 'center',
  },
  render: (args) => (
    <XDSHStack {...args} style={{ height: 120, backgroundColor: '#f1f5f9' }}>
      <Box>Short</Box>
      <Box>
        Tall
        <br />
        Item
      </Box>
      <Box>Short</Box>
    </XDSHStack>
  ),
};

export const VerticalAlignStart: Story = {
  args: {
    gap: 'space4',
    vAlign: 'start',
  },
  render: (args) => (
    <XDSHStack {...args} style={{ height: 120, backgroundColor: '#f1f5f9' }}>
      <Box>Short</Box>
      <Box>
        Tall
        <br />
        Item
      </Box>
      <Box>Short</Box>
    </XDSHStack>
  ),
};

export const VerticalAlignEnd: Story = {
  args: {
    gap: 'space4',
    vAlign: 'end',
  },
  render: (args) => (
    <XDSHStack {...args} style={{ height: 120, backgroundColor: '#f1f5f9' }}>
      <Box>Short</Box>
      <Box>
        Tall
        <br />
        Item
      </Box>
      <Box>Short</Box>
    </XDSHStack>
  ),
};

export const Wrapping: Story = {
  args: {
    gap: 'space2',
    wrap: 'wrap',
  },
  render: (args) => (
    <XDSHStack {...args} style={{ width: 300, backgroundColor: '#f1f5f9', padding: 8 }}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
      <Box>Item 4</Box>
      <Box>Item 5</Box>
    </XDSHStack>
  ),
};

export const AllAlignments: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>vAlign: start</h4>
        <XDSHStack gap="space2" vAlign="start" style={{ height: 80, backgroundColor: '#f1f5f9' }}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSHStack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>vAlign: center</h4>
        <XDSHStack gap="space2" vAlign="center" style={{ height: 80, backgroundColor: '#f1f5f9' }}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSHStack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>vAlign: end</h4>
        <XDSHStack gap="space2" vAlign="end" style={{ height: 80, backgroundColor: '#f1f5f9' }}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSHStack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>vAlign: stretch (default)</h4>
        <XDSHStack gap="space2" vAlign="stretch" style={{ height: 80, backgroundColor: '#f1f5f9' }}>
          <Box>A</Box>
          <Box>
            B<br />B
          </Box>
          <Box>C</Box>
        </XDSHStack>
      </div>
    </div>
  ),
};
