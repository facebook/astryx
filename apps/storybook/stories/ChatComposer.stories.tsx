// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  ChatComposer,
  ChatComposerDrawer,
  ChatSendButton,
} from '@astryxdesign/core/Chat';
import {Token} from '@astryxdesign/core/Token';
import {Button} from '@astryxdesign/core/Button';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {List, ListItem} from '@astryxdesign/core/List';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
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

const meta: Meta<typeof ChatComposer> = {
  title: 'Core/ChatComposer',
  component: ChatComposer,
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
type Story = StoryObj<typeof ChatComposer>;

// =============================================================================
// Stories
// =============================================================================

/** Simplest usage — just onSubmit */
export const Simplest: Story = {
  render: () => (
    <ChatComposer
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
      <ChatComposer
        onSubmit={value => {
          console.log('Submit:', value);
          setIsStreaming(true);
        }}
        isStopShown={isStreaming}
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
    <ChatComposer
      onSubmit={value => console.log('Submit:', value)}
      footerActions={<Button label="GPT-4" variant="ghost" size="md" />}
      sendActions={
        <Button
          label="Microphone"
          variant="ghost"
          size="md"
          icon={MicIcon}
          isIconOnly
        />
      }
    />
  ),
};

/** With attachment chips and a context toolbar */
export const WithAttachments: Story = {
  render: () => (
    <ChatComposer
      onSubmit={value => console.log('Submit:', value)}
      drawer={
        <ChatComposerDrawer>
          <Token label="report.pdf" onRemove={() => {}} />
          <Token label="data.csv" onRemove={() => {}} />
        </ChatComposerDrawer>
      }
      headerActions={
        <Button
          label="Attach file"
          variant="ghost"
          size="sm"
          icon={PaperclipIcon}
          isIconOnly
        />
      }
      headerContext={
        <ProgressBar label="Context window" value={3} isLabelHidden />
      }
    />
  ),
};

/** Full featured — all slots populated */
export const FullFeatured: Story = {
  render: () => {
    const [isStreaming, setIsStreaming] = useState(false);
    return (
      <ChatComposer
        onSubmit={value => {
          console.log('Submit:', value);
          setIsStreaming(true);
          setTimeout(() => setIsStreaming(false), 3000);
        }}
        isStopShown={isStreaming}
        onStop={() => setIsStreaming(false)}
        placeholder="Ask me anything..."
        drawer={
          <ChatComposerDrawer>
            <Token label="design-spec.pdf" onRemove={() => {}} />
          </ChatComposerDrawer>
        }
        headerActions={
          <>
            <Button
              label="Mention"
              variant="ghost"
              size="sm"
              icon={AtSignIcon}
              isIconOnly
            />
            <Button
              label="Attach file"
              variant="ghost"
              size="sm"
              icon={PaperclipIcon}
              isIconOnly
            />
          </>
        }
        headerContext={
          <ProgressBar label="Context window" value={3} isLabelHidden />
        }
        footerActions={
          <>
            <Button label="Auto" variant="ghost" size="md" />
            <Button label="Settings" variant="ghost" size="md" />
          </>
        }
        sendActions={
          <Button
            label="Microphone"
            variant="ghost"
            size="md"
            icon={MicIcon}
            isIconOnly
          />
        }
      />
    );
  },
};

/** Disabled state */
export const Disabled: Story = {
  render: () => (
    <ChatComposer
      onSubmit={() => {}}
      isDisabled
      placeholder="Composer is disabled"
    />
  ),
};

/** With many attachments and collapsible drawer */
export const WithManyAttachments: Story = {
  render: () => (
    <ChatComposer
      onSubmit={value => console.log('Submit:', value)}
      drawer={
        <ChatComposerDrawer count={6}>
          <Token label="new_feature_prd.docx" onRemove={() => {}} />
          <Token label="2026_roadmap.docx" onRemove={() => {}} />
          <Token label="user_flow.pdf" onRemove={() => {}} />
          <Token label="launch_plan.docx" onRemove={() => {}} />
          <Token label="user_feedback.csv" onRemove={() => {}} />
          <Token label="kpis.csv" onRemove={() => {}} />
        </ChatComposerDrawer>
      }
    />
  ),
};

/** With error status */
export const WithError: Story = {
  render: () => (
    <ChatComposer
      onSubmit={value => console.log('Submit:', value)}
      status={{
        type: 'error',
        message: 'Failed to send message. Please try again.',
      }}
    />
  ),
};

/** With status on top */
export const WithStatusTop: Story = {
  render: () => (
    <ChatComposer
      onSubmit={value => console.log('Submit:', value)}
      statusPosition="top"
      status={{
        type: 'warning',
        message: 'Context window is 90% full.',
      }}
    />
  ),
};

/** With status on bottom */
export const WithStatusBottom: Story = {
  render: () => (
    <ChatComposer
      onSubmit={value => console.log('Submit:', value)}
      status={{
        type: 'error',
        message: 'Failed to send message. Please try again.',
      }}
    />
  ),
};

/** Default send button — reads from composer context automatically */
export const DefaultSendButton: Story = {
  render: () => (
    <ChatComposer
      onSubmit={value => {
        console.log('Submit:', value);
        alert(`Sent: ${value}`);
      }}
      placeholder="Type to enable the send button..."
    />
  ),
};

/** Custom send button via sendButton slot */
export const CustomSendButton: Story = {
  render: () => (
    <ChatComposer
      onSubmit={value => console.log('Submit:', value)}
      sendButton={
        <ChatSendButton size="sm" onSend={() => alert('Custom send!')} />
      }
    />
  ),
};

/** Send/stop toggle — type text and submit to start streaming, click stop to end */
export const SendStopToggle: Story = {
  render: () => {
    const [isStreaming, setIsStreaming] = useState(false);
    return (
      <ChatComposer
        onSubmit={value => {
          console.log('Submit:', value);
          setIsStreaming(true);
          setTimeout(() => setIsStreaming(false), 5000);
        }}
        isStopShown={isStreaming}
        onStop={() => {
          console.log('Stopped');
          setIsStreaming(false);
        }}
        placeholder="Send a message to start streaming..."
      />
    );
  },
};

/** Drawer with a feedback prompt, warning badge, and selectable options */
export const Feedback: Story = {
  render: () => {
    const options = [
      {key: 'A', label: 'Yes'},
      {
        key: 'B',
        label: 'Yes, and don\u2019t ask again for `git add` commands',
      },
      {key: 'C', label: 'No, and tell me what to do differently'},
    ];

    const [selected, setSelected] = useState<string | null>(null);

    return (
      <ChatComposer
        onSubmit={value => {
          console.log('Submit:', value, '| Answer:', selected);
          alert(`Sent: "${value}"\nAnswer: ${selected}`);
        }}
        drawer={
          <ChatComposerDrawer count={1} label="User feedback requested">
            <div style={{width: '100%'}}>
              <List>
                <ListItem
                  label={
                    <Text weight="bold">Do you want to proceed?</Text>
                  }
                />
                {options.map(opt => (
                  <ListItem
                    key={opt.key}
                    label={opt.label}
                    startContent={
                      <Badge
                        variant={selected === opt.key ? 'info' : 'neutral'}
                        label={opt.key}
                      />
                    }
                    isSelected={selected === opt.key}
                    onClick={() => setSelected(opt.key)}
                  />
                ))}
              </List>
            </div>
          </ChatComposerDrawer>
        }
      />
    );
  },
};
