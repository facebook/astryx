import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChatComposer,
  XDSChatComposerInput,
  type XDSChatComposerTrigger,
  type XDSChatComposerTriggerItem,
} from '@xds/core/Chat';
import {useState} from 'react';

const meta: Meta = {
  title: 'Chat/XDSChatComposerInput Triggers',
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
type Story = StoryObj;

// =============================================================================
// Mock data
// =============================================================================

const USERS: XDSChatComposerTriggerItem[] = [
  {id: 'cindy', label: 'Cindy Zhang'},
  {id: 'alex', label: 'Alex Johnson'},
  {id: 'sam', label: 'Sam Rivera'},
  {id: 'jordan', label: 'Jordan Lee'},
  {id: 'taylor', label: 'Taylor Kim'},
  {id: 'morgan', label: 'Morgan Chen'},
];

const COMMANDS: XDSChatComposerTriggerItem[] = [
  {id: 'summarize', label: 'summarize'},
  {id: 'translate', label: 'translate'},
  {id: 'search', label: 'search'},
  {id: 'code', label: 'code'},
  {id: 'help', label: 'help'},
];

// Simulated async search
function searchUsers(query: string): Promise<XDSChatComposerTriggerItem[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const lower = query.toLowerCase();
      resolve(USERS.filter(u => u.label.toLowerCase().includes(lower)));
    }, 300);
  });
}

// =============================================================================
// Stories
// =============================================================================

/** Static @ mentions — type @ to see the menu */
export const MentionTrigger: Story = {
  render: () => {
    const [log, setLog] = useState<string[]>([]);
    const mentionTrigger: XDSChatComposerTrigger = {
      character: '@',
      items: USERS,
      onSelect: item => ({
        value: `@${item.id}`,
        render: () => <span>@{item.label}</span>,
      }),
    };

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <XDSChatComposer
          onSubmit={value => {
            setLog(prev => [...prev, value]);
          }}
          input={
            <XDSChatComposerInput
              triggers={[mentionTrigger]}
              placeholder="Type @ to mention someone..."
            />
          }
        />
        {log.length > 0 && (
          <div style={{fontSize: 12, fontFamily: 'monospace', color: '#666'}}>
            {log.map((msg, i) => (
              <div key={i}>→ {msg}</div>
            ))}
          </div>
        )}
      </div>
    );
  },
};

/** Static / commands — type / to see commands */
export const SlashCommands: Story = {
  render: () => {
    const commandTrigger: XDSChatComposerTrigger = {
      character: '/',
      items: COMMANDS,
      onSelect: item => `/${item.label} `,
    };

    return (
      <XDSChatComposer
        onSubmit={value => alert(`Sent: ${value}`)}
        input={
          <XDSChatComposerInput
            triggers={[commandTrigger]}
            placeholder="Type / for commands..."
          />
        }
      />
    );
  },
};

/** Async search source — type @ to trigger a simulated API search */
export const AsyncSearch: Story = {
  render: () => {
    const asyncTrigger: XDSChatComposerTrigger = {
      character: '@',
      queryItemsAction: searchUsers,
      onSelect: item => ({
        value: `@${item.id}`,
        render: () => <span>@{item.label}</span>,
      }),
    };

    return (
      <XDSChatComposer
        onSubmit={value => alert(`Sent: ${value}`)}
        input={
          <XDSChatComposerInput
            triggers={[asyncTrigger]}
            placeholder="Type @ for async user search (300ms delay)..."
          />
        }
      />
    );
  },
};

/** Multiple triggers — @ for mentions, / for commands */
export const MultipleTriggers: Story = {
  render: () => {
    const mentionTrigger: XDSChatComposerTrigger = {
      character: '@',
      items: USERS,
      onSelect: item => ({
        value: `@${item.id}`,
        render: () => <span>@{item.label}</span>,
      }),
    };
    const commandTrigger: XDSChatComposerTrigger = {
      character: '/',
      items: COMMANDS,
      onSelect: item => `/${item.label} `,
    };

    return (
      <XDSChatComposer
        onSubmit={value => alert(`Sent: ${value}`)}
        input={
          <XDSChatComposerInput
            triggers={[mentionTrigger, commandTrigger]}
            placeholder="Type @ or / ..."
          />
        }
      />
    );
  },
};

/** Custom item rendering */
export const CustomRenderItem: Story = {
  render: () => {
    const mentionTrigger: XDSChatComposerTrigger = {
      character: '@',
      items: USERS,
      renderItem: item => (
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
            }}>
            {item.label.charAt(0)}
          </div>
          <span>{item.label}</span>
        </div>
      ),
      onSelect: item => ({
        value: `@${item.id}`,
        render: () => <span>@{item.label}</span>,
      }),
    };

    return (
      <XDSChatComposer
        onSubmit={value => alert(`Sent: ${value}`)}
        input={
          <XDSChatComposerInput
            triggers={[mentionTrigger]}
            placeholder="Type @ — items have custom avatars..."
          />
        }
      />
    );
  },
};
