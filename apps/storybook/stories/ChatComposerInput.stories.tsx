import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChatComposer,
  XDSChatComposerInput,
  type XDSChatComposerTrigger,
} from '@xds/core/Chat';
import {createStaticSource} from '@xds/core/Typeahead';
import {XDSBadge} from '@xds/core/Badge';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';
import {useState} from 'react';

const meta: Meta = {
  title: 'Chat/XDSChatComposerInput',
  component: XDSChatComposerInput,
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

const USERS: XDSSearchableItem[] = [
  {id: 'cindy', label: 'Cindy Zhang'},
  {id: 'alex', label: 'Alex Johnson'},
  {id: 'sam', label: 'Sam Rivera'},
  {id: 'jordan', label: 'Jordan Lee'},
  {id: 'taylor', label: 'Taylor Kim'},
  {id: 'morgan', label: 'Morgan Chen'},
];

const COMMANDS: XDSSearchableItem[] = [
  {id: 'summarize', label: 'summarize'},
  {id: 'translate', label: 'translate'},
  {id: 'search', label: 'search'},
  {id: 'code', label: 'code'},
  {id: 'help', label: 'help'},
];

const userSource = createStaticSource(USERS);
const commandSource = createStaticSource(COMMANDS);

const asyncUserSource: XDSSearchSource = {
  search(query: string) {
    return new Promise(resolve => {
      setTimeout(() => {
        const lower = query.toLowerCase();
        resolve(USERS.filter(u => u.label.toLowerCase().includes(lower)));
      }, 300);
    });
  },
  bootstrap() {
    return USERS;
  },
};

// =============================================================================
// Basic input stories
// =============================================================================

/** Standalone input \u2014 no composer shell, just the contentEditable */
export const Standalone: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div>
        <XDSChatComposerInput
          value={value}
          onChange={setValue}
          onSubmit={v => {
            alert(`Submitted: ${v}`);
            setValue('');
          }}
          placeholder="Type a message..."
        />
        <div style={{marginTop: 8, fontSize: 12, color: '#888'}}>
          Value: {JSON.stringify(value)}
        </div>
      </div>
    );
  },
};

/** Custom placeholder */
export const CustomPlaceholder: Story = {
  render: () => (
    <XDSChatComposerInput
      placeholder="Ask me anything about XDS..."
      onSubmit={v => alert(v)}
    />
  ),
};

/** Disabled state */
export const Disabled: Story = {
  render: () => (
    <XDSChatComposerInput
      isDisabled
      placeholder="Input is disabled"
    />
  ),
};

/** Max rows \u2014 scrolls after 3 lines */
export const MaxRows: Story = {
  render: () => (
    <XDSChatComposerInput
      maxRows={3}
      placeholder="Type a long message \u2014 scrolls after 3 lines..."
      onSubmit={v => alert(v)}
    />
  ),
};

/** Message history \u2014 submit a few messages, then ArrowUp/Down to recall */
export const MessageHistory: Story = {
  render: () => {
    const [log, setLog] = useState<string[]>([]);
    return (
      <div>
        <XDSChatComposerInput
          onSubmit={v => setLog(prev => [...prev, v])}
          placeholder="Submit messages, then ArrowUp to recall..."
        />
        {log.length > 0 && (
          <div style={{marginTop: 12, fontSize: 12, fontFamily: 'monospace', color: '#666'}}>
            {log.map((msg, i) => (
              <div key={i}>\u2192 {msg}</div>
            ))}
          </div>
        )}
      </div>
    );
  },
};

/** File drop/paste handler */
export const FileDrop: Story = {
  render: () => {
    const [files, setFiles] = useState<string[]>([]);
    return (
      <div>
        <XDSChatComposerInput
          onSubmit={v => alert(v)}
          onFiles={f => setFiles(prev => [...prev, ...f.map(x => x.name)])}
          placeholder="Drop or paste files here..."
        />
        {files.length > 0 && (
          <div style={{marginTop: 12, fontSize: 12, color: '#666'}}>
            Files: {files.join(', ')}
          </div>
        )}
      </div>
    );
  },
};

// =============================================================================
// Trigger stories
// =============================================================================

/** Static @ mentions \u2014 type @ to see the menu */
export const MentionTrigger: Story = {
  render: () => {
    const [log, setLog] = useState<string[]>([]);
    const mentionTrigger: XDSChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      onSelect: item => ({
        value: `@${item.id}`,
        label: item.label,
        variant: 'blue' as const,
      }),
    };

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <XDSChatComposer
          onSubmit={value => setLog(prev => [...prev, value])}
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
              <div key={i}>\u2192 {msg}</div>
            ))}
          </div>
        )}
      </div>
    );
  },
};

/** Static / commands \u2014 type / to see commands */
export const SlashCommands: Story = {
  render: () => {
    const commandTrigger: XDSChatComposerTrigger = {
      character: '/',
      searchSource: commandSource,
      onSelect: item => ({
        value: `/${item.label}`,
        label: `/${item.label}`,
        variant: 'yellow' as const,
      }),
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

/** Async search source \u2014 type @ to trigger a simulated API search */
export const AsyncSearch: Story = {
  render: () => {
    const asyncTrigger: XDSChatComposerTrigger = {
      character: '@',
      searchSource: asyncUserSource,
      onSelect: item => ({
        value: `@${item.id}`,
        label: item.label,
        variant: 'blue' as const,
      }),
      loadingText: 'Searching users\u2026',
      emptySearchResultsText: 'No users found',
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

/** Multiple triggers \u2014 @ for mentions, / for commands */
export const MultipleTriggers: Story = {
  render: () => {
    const mentionTrigger: XDSChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      onSelect: item => ({
        value: `@${item.id}`,
        label: item.label,
        variant: 'blue' as const,
      }),
    };
    const commandTrigger: XDSChatComposerTrigger = {
      character: '/',
      searchSource: commandSource,
      onSelect: item => ({
        value: `/${item.label}`,
        label: `/${item.label}`,
        variant: 'yellow' as const,
      }),
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

/** Custom item rendering in the trigger menu */
export const CustomRenderItem: Story = {
  render: () => {
    const mentionTrigger: XDSChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
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
        label: item.label,
        variant: 'purple' as const,
        icon: (
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: '#e8d5f5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontWeight: 700,
            }}>
            {item.label.charAt(0)}
          </span>
        ),
      }),
    };

    return (
      <XDSChatComposer
        onSubmit={value => alert(`Sent: ${value}`)}
        input={
          <XDSChatComposerInput
            triggers={[mentionTrigger]}
            placeholder="Type @ \u2014 tokens have icons via badge config..."
          />
        }
      />
    );
  },
};

/** Token color variants \u2014 different badge colors per trigger */
export const TokenVariants: Story = {
  render: () => {
    const mentionTrigger: XDSChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      onSelect: item => ({
        value: `@${item.id}`,
        label: item.label,
        variant: 'blue' as const,
      }),
    };
    const commandTrigger: XDSChatComposerTrigger = {
      character: '/',
      searchSource: commandSource,
      onSelect: item => ({
        value: `/${item.label}`,
        label: `/${item.label}`,
        variant: 'purple' as const,
      }),
    };

    return (
      <XDSChatComposer
        onSubmit={value => alert(`Sent: ${value}`)}
        input={
          <XDSChatComposerInput
            triggers={[mentionTrigger, commandTrigger]}
            placeholder="@ for blue mentions, / for purple commands..."
          />
        }
      />
    );
  },
};


/** Custom render \u2014 full control via render() for rich token content */
export const CustomRender: Story = {
  render: () => {
    const mentionTrigger: XDSChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
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
        render: () => (
          <span
            title={`Click to view ${item.label}'s profile`}
            style={{cursor: 'pointer'}}
            onClick={() => alert(`Profile: ${item.label}`)}>
            <XDSBadge
              variant="blue"
              label={item.label}
              icon={
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: '#c4d4f0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 8,
                    fontWeight: 700,
                  }}>
                  {item.label.charAt(0)}
                </span>
              }
            />
          </span>
        ),
      }),
    };

    return (
      <XDSChatComposer
        onSubmit={value => alert(`Sent: ${value}`)}
        input={
          <XDSChatComposerInput
            triggers={[mentionTrigger]}
            placeholder="Type @ \u2014 tokens are clickable with avatars..."
          />
        }
      />
    );
  },
};
