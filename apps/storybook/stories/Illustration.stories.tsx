import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSIllustrationNoResults,
  XDSIllustrationEmptyInbox,
  XDSIllustrationEmptyFolder,
  XDSIllustrationError,
  XDSIllustrationSuccess,
} from '@xds/core/Illustration';

const meta: Meta<typeof XDSIllustrationNoResults> = {
  title: 'Core/XDSIllustration',
  component: XDSIllustrationNoResults,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Illustration size',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSIllustrationNoResults>;

export const NoResults: Story = {
  render: args => <XDSIllustrationNoResults {...args} />,
  args: {
    size: 'md',
  },
};

export const EmptyInbox: Story = {
  render: args => <XDSIllustrationEmptyInbox {...args} />,
  args: {
    size: 'md',
  },
};

export const EmptyFolder: Story = {
  render: args => <XDSIllustrationEmptyFolder {...args} />,
  args: {
    size: 'md',
  },
};

export const Error: Story = {
  render: args => <XDSIllustrationError {...args} />,
  args: {
    size: 'md',
  },
};

export const Success: Story = {
  render: args => <XDSIllustrationSuccess {...args} />,
  args: {
    size: 'md',
  },
};

export const AllIllustrations: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
      <div style={{textAlign: 'center'}}>
        <XDSIllustrationNoResults size="md" />
        <div style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
          No Results
        </div>
      </div>
      <div style={{textAlign: 'center'}}>
        <XDSIllustrationEmptyInbox size="md" />
        <div style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
          Empty Inbox
        </div>
      </div>
      <div style={{textAlign: 'center'}}>
        <XDSIllustrationEmptyFolder size="md" />
        <div style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
          Empty Folder
        </div>
      </div>
      <div style={{textAlign: 'center'}}>
        <XDSIllustrationError size="md" />
        <div style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
          Error
        </div>
      </div>
      <div style={{textAlign: 'center'}}>
        <XDSIllustrationSuccess size="md" />
        <div style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
          Success
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '32px', alignItems: 'end'}}>
      <div style={{textAlign: 'center'}}>
        <XDSIllustrationNoResults size="sm" />
        <div style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
          sm (48px)
        </div>
      </div>
      <div style={{textAlign: 'center'}}>
        <XDSIllustrationNoResults size="md" />
        <div style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
          md (80px)
        </div>
      </div>
      <div style={{textAlign: 'center'}}>
        <XDSIllustrationNoResults size="lg" />
        <div style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
          lg (120px)
        </div>
      </div>
    </div>
  ),
};
