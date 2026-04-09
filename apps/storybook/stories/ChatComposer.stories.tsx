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
    Story => (
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
      onSubmit={value => {
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
        onSubmit={value => {
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
      onSubmit={value => console.log('Submit:', value)}
      footerActions={
        <>
          <XDSButton label="GPT-4" variant="ghost" size="md" />
          <XDSButton label="Mic" variant="ghost" size="md" />
        </>
      }
    />
  ),
};

/** With attachment chips and a context toolbar */
export const WithAttachments: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={value => console.log('Submit:', value)}
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
        onSubmit={value => {
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
            <XDSButton label="Attach" variant="ghost" size="md" />
            <XDSButton label="GPT-4o" variant="ghost" size="md" />
          </>
        }
        sendActions={<XDSButton label="Schedule" variant="ghost" size="md" />}
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

/** With many attachments and collapsible drawer */
export const WithManyAttachments: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={value => console.log('Submit:', value)}
      attachments={
        <XDSChatComposerAttachments count={6}>
          <XDSToken label="new_feature_prd.docx" onDismiss={() => {}} />
          <XDSToken label="2026_roadmap.docx" onDismiss={() => {}} />
          <XDSToken label="user_flow.pdf" onDismiss={() => {}} />
          <XDSToken label="launch_plan.docx" onDismiss={() => {}} />
          <XDSToken label="user_feedback.csv" onDismiss={() => {}} />
          <XDSToken label="kpis.csv" onDismiss={() => {}} />
        </XDSChatComposerAttachments>
      }
    />
  ),
};

/** With error status */
export const WithError: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={value => console.log('Submit:', value)}
      status={{
        type: 'error',
        message: 'Failed to send message. Please try again.',
      }}
    />
  ),
};

/** With attachments and status on top */
export const WithAttachmentsAndStatusTop: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={value => console.log('Submit:', value)}
      statusPosition="top"
      attachments={
        <XDSChatComposerAttachments count={3}>
          <XDSToken label="report.pdf" onDismiss={() => {}} />
          <XDSToken label="data.csv" onDismiss={() => {}} />
          <XDSToken label="notes.docx" onDismiss={() => {}} />
        </XDSChatComposerAttachments>
      }
      status={{
        type: 'warning',
        message: 'Large files may take longer to process.',
      }}
    />
  ),
};

/** With status on bottom */
export const WithStatusBottom: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={value => console.log('Submit:', value)}
      status={{
        type: 'error',
        message: 'Failed to send message. Please try again.',
      }}
    />
  ),
};
