import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChatComposer,
  XDSChatComposerAttachments,
  XDSChatComposerInput,
} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {useState} from 'react';

const meta: Meta<typeof XDSChatComposer> = {
  title: 'Chat/XDSChatComposer',
  component: XDSChatComposer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{width: 600, padding: 40}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof XDSChatComposer>;

// =============================================================================
// Stories
// =============================================================================

/** Simplest usage — just onSubmit */
export const Simplest: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={(value) => {
        console.log('Submit:', value);
        alert(`Sent: ${value}`);
      }}
    />
  ),
};

/** With streaming state and stop button */
export const WithStreaming: Story = {
  render: () => {
    const [isStreaming, setIsStreaming] = useState(true);
    return (
      <XDSChatComposer
        onSubmit={(value) => {
          console.log('Submit:', value);
          setIsStreaming(true);
        }}
        isStreaming={isStreaming}
        onStop={() => {
          console.log('Stopped');
          setIsStreaming(false);
        }}
      />
    );
  },
};

/** With footer actions (model selector, mic button) */
export const WithFooterActions: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={(value) => console.log('Submit:', value)}
      footerActions={
        <>
          <XDSButton label="GPT-4" variant="ghost" size="sm" />
          <XDSButton label="Mic" variant="ghost" size="sm" />
        </>
      }
    />
  ),
};

/** With attachment chips and a context toolbar */
export const WithAttachments: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={(value) => console.log('Submit:', value)}
      attachments={
        <XDSChatComposerAttachments>
          <XDSToken label="report.pdf" onDismiss={() => {}} />
          <XDSToken label="data.csv" onDismiss={() => {}} />
        </XDSChatComposerAttachments>
      }
      contextToolbar={
        <XDSToolbar size="sm">
          <XDSButton label="Add context" variant="ghost" size="sm" />
        </XDSToolbar>
      }
    />
  ),
};

/** Full featured — all slots populated */
export const FullFeatured: Story = {
  render: () => {
    const [isStreaming, setIsStreaming] = useState(false);
    return (
      <XDSChatComposer
        onSubmit={(value) => {
          console.log('Submit:', value);
          setIsStreaming(true);
          setTimeout(() => setIsStreaming(false), 3000);
        }}
        isStreaming={isStreaming}
        onStop={() => setIsStreaming(false)}
        placeholder="Ask me anything..."
        attachments={
          <XDSChatComposerAttachments>
            <XDSToken label="design-spec.pdf" onDismiss={() => {}} />
          </XDSChatComposerAttachments>
        }
        contextToolbar={
          <XDSToolbar size="sm">
            <XDSButton label="@workspace" variant="ghost" size="sm" />
          </XDSToolbar>
        }
        footerActions={
          <>
            <XDSButton label="Attach" variant="ghost" size="sm" />
            <XDSButton label="GPT-4o" variant="ghost" size="sm" />
          </>
        }
        sendActions={
          <XDSButton label="Schedule" variant="ghost" size="sm" />
        }
      />
    );
  },
};

/** Disabled state */
export const Disabled: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={() => {}}
      isDisabled
      placeholder="Composer is disabled"
    />
  ),
};

/** With error status */
export const WithError: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={(value) => console.log('Submit:', value)}
      status={{
        type: 'error',
        message: 'Failed to send message. Please try again.',
      }}
    />
  ),
};
