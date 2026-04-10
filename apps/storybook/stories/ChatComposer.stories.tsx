import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChatComposer,
  XDSChatComposerAttachments,
  XDSChatComposerInput,
} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSButton} from '@xds/core/Button';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {useState} from 'react';

// Inline icons for story demos (not in the default icon registry)
const AtSignIcon = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </svg>
);
const PaperclipIcon = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const MicIcon = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

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

/** With footer actions (model selector) and mic button */
export const WithFooterActions: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={value => console.log('Submit:', value)}
      footerActions={<XDSButton label="GPT-4" variant="ghost" size="md" />}
      sendActions={
        <XDSButton
          label="Microphone"
          variant="ghost"
          size="md"
          icon={MicIcon}
          iconOnly
        />
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
          <XDSToken label="report.pdf" onRemove={() => {}} />
          <XDSToken label="data.csv" onRemove={() => {}} />
        </XDSChatComposerAttachments>
      }
      headerActions={
        <XDSButton
          label="Attach file"
          variant="ghost"
          size="sm"
          icon={PaperclipIcon}
          iconOnly
        />
      }
      headerContext={
        <XDSProgressBar label="Context window" value={3} isLabelHidden />
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
            <XDSToken label="design-spec.pdf" onRemove={() => {}} />
          </XDSChatComposerAttachments>
        }
        headerActions={
          <>
            <XDSButton
              label="Mention"
              variant="ghost"
              size="sm"
              icon={AtSignIcon}
              iconOnly
            />
            <XDSButton
              label="Attach file"
              variant="ghost"
              size="sm"
              icon={PaperclipIcon}
              iconOnly
            />
          </>
        }
        headerContext={
          <XDSProgressBar label="Context window" value={3} isLabelHidden />
        }
        footerActions={
          <>
            <XDSButton label="Auto" variant="ghost" size="md" />
            <XDSButton label="Settings" variant="ghost" size="md" />
          </>
        }
        sendActions={
          <XDSButton
            label="Microphone"
            variant="ghost"
            size="md"
            icon={MicIcon}
            iconOnly
          />
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

/** With many attachments and collapsible drawer */
export const WithManyAttachments: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={value => console.log('Submit:', value)}
      attachments={
        <XDSChatComposerAttachments count={6}>
          <XDSToken label="new_feature_prd.docx" onRemove={() => {}} />
          <XDSToken label="2026_roadmap.docx" onRemove={() => {}} />
          <XDSToken label="user_flow.pdf" onRemove={() => {}} />
          <XDSToken label="launch_plan.docx" onRemove={() => {}} />
          <XDSToken label="user_feedback.csv" onRemove={() => {}} />
          <XDSToken label="kpis.csv" onRemove={() => {}} />
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
          <XDSToken label="report.pdf" onRemove={() => {}} />
          <XDSToken label="data.csv" onRemove={() => {}} />
          <XDSToken label="notes.docx" onRemove={() => {}} />
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
