import type { Meta, StoryObj } from '@storybook/react';
import { XDSHStack, XDSVStack, XDSStackItem } from '@xds/core/Layout';

// Demo box component for visibility
const Box = ({ children, color = '#3b82f6' }: { children: React.ReactNode; color?: string }) => (
  <div
    style={{
      backgroundColor: color,
      color: 'white',
      padding: '16px 24px',
      borderRadius: '8px',
      fontWeight: 500,
      height: '100%',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof XDSStackItem> = {
  title: 'Layout/XDSStackItem',
  component: XDSStackItem,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['static', 'fill', 'fill2x', 'fill3x'],
      description: 'Size behavior within the stack',
    },
    crossAlignSelf: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Override cross-axis alignment for this item',
    },
    element: {
      control: 'select',
      options: ['div', 'section', 'article', 'aside', 'span'],
      description: 'HTML element to render',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSStackItem>;

export const Default: Story = {
  args: {
    size: 'static',
    children: null,
  },
  render: (args) => (
    <XDSHStack gap="space2" style={{ width: 500, backgroundColor: '#f1f5f9', padding: 8 }}>
      <XDSStackItem {...args}>
        <Box>Stack Item</Box>
      </XDSStackItem>
      <Box color="#64748b">Other Item</Box>
    </XDSHStack>
  ),
};

export const FillSize: Story = {
  render: () => (
    <XDSHStack gap="space2" style={{ width: 500, backgroundColor: '#f1f5f9', padding: 8 }}>
      <XDSStackItem size="static">
        <Box color="#64748b">Static</Box>
      </XDSStackItem>
      <XDSStackItem size="fill">
        <Box>Fill (grows to fill remaining space)</Box>
      </XDSStackItem>
      <XDSStackItem size="static">
        <Box color="#64748b">Static</Box>
      </XDSStackItem>
    </XDSHStack>
  ),
};

export const ProportionalFill: Story = {
  render: () => (
    <XDSVStack gap="space4">
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>Equal Fill (1:1:1)</h4>
        <XDSHStack gap="space2" style={{ width: 500, backgroundColor: '#f1f5f9', padding: 8 }}>
          <XDSStackItem size="fill">
            <Box>fill</Box>
          </XDSStackItem>
          <XDSStackItem size="fill">
            <Box>fill</Box>
          </XDSStackItem>
          <XDSStackItem size="fill">
            <Box>fill</Box>
          </XDSStackItem>
        </XDSHStack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>Proportional (1:2)</h4>
        <XDSHStack gap="space2" style={{ width: 500, backgroundColor: '#f1f5f9', padding: 8 }}>
          <XDSStackItem size="fill">
            <Box>fill (1 part)</Box>
          </XDSStackItem>
          <XDSStackItem size="fill2x">
            <Box color="#10b981">fill2x (2 parts)</Box>
          </XDSStackItem>
        </XDSHStack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>Proportional (1:2:3)</h4>
        <XDSHStack gap="space2" style={{ width: 500, backgroundColor: '#f1f5f9', padding: 8 }}>
          <XDSStackItem size="fill">
            <Box>fill</Box>
          </XDSStackItem>
          <XDSStackItem size="fill2x">
            <Box color="#10b981">fill2x</Box>
          </XDSStackItem>
          <XDSStackItem size="fill3x">
            <Box color="#8b5cf6">fill3x</Box>
          </XDSStackItem>
        </XDSHStack>
      </div>
    </XDSVStack>
  ),
};

export const CrossAlignSelf: Story = {
  render: () => (
    <XDSHStack gap="space2" style={{ height: 150, backgroundColor: '#f1f5f9', padding: 8 }}>
      <XDSStackItem crossAlignSelf="start">
        <Box>start</Box>
      </XDSStackItem>
      <XDSStackItem crossAlignSelf="center">
        <Box color="#10b981">center</Box>
      </XDSStackItem>
      <XDSStackItem crossAlignSelf="end">
        <Box color="#8b5cf6">end</Box>
      </XDSStackItem>
      <XDSStackItem crossAlignSelf="stretch">
        <Box color="#f59e0b">stretch</Box>
      </XDSStackItem>
    </XDSHStack>
  ),
};

export const PolymorphicElement: Story = {
  render: () => (
    <XDSHStack gap="space2" style={{ width: 500, backgroundColor: '#f1f5f9', padding: 8 }}>
      <XDSStackItem element="section" size="fill">
        <Box>section element</Box>
      </XDSStackItem>
      <XDSStackItem element="article" size="fill">
        <Box color="#10b981">article element</Box>
      </XDSStackItem>
      <XDSStackItem element="aside" size="static">
        <Box color="#8b5cf6">aside element</Box>
      </XDSStackItem>
    </XDSHStack>
  ),
};

export const CommonLayoutPattern: Story = {
  render: () => (
    <XDSVStack gap="space4">
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>Header Layout</h4>
        <XDSHStack gap="space2" style={{ width: 600, backgroundColor: '#f1f5f9', padding: 8 }}>
          <XDSStackItem size="static">
            <Box color="#64748b">Logo</Box>
          </XDSStackItem>
          <XDSStackItem size="fill">
            <Box>Navigation</Box>
          </XDSStackItem>
          <XDSStackItem size="static">
            <Box color="#64748b">Actions</Box>
          </XDSStackItem>
        </XDSHStack>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontFamily: 'system-ui' }}>Sidebar Layout</h4>
        <XDSHStack gap="space2" style={{ width: 600, height: 200, backgroundColor: '#f1f5f9', padding: 8 }}>
          <XDSStackItem size="static" style={{ width: 150 }}>
            <Box color="#64748b">Sidebar</Box>
          </XDSStackItem>
          <XDSStackItem size="fill">
            <Box>Main Content</Box>
          </XDSStackItem>
        </XDSHStack>
      </div>
    </XDSVStack>
  ),
};
