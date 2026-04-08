import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChatComposer,
  XDSChatComposerInput,
  type XDSChatComposerTrigger,
} from '@xds/core/Chat';
import {createStaticSource} from '@xds/core/Typeahead';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTypeaheadItem} from '@xds/core/Typeahead';
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

const USERS: XDSSearchableItem<{role: string}>[] = [
  {id: 'cindy', label: 'Cindy Zhang', auxiliaryData: {role: 'Design Systems'}},
  {id: 'alex', label: 'Alex Johnson', auxiliaryData: {role: 'Frontend'}},
  {id: 'sam', label: 'Sam Rivera', auxiliaryData: {role: 'Backend'}},
  {id: 'jordan', label: 'Jordan Lee', auxiliaryData: {role: 'Product'}},
  {id: 'taylor', label: 'Taylor Kim', auxiliaryData: {role: 'Design'}},
  {id: 'morgan', label: 'Morgan Chen', auxiliaryData: {role: 'Infrastructure'}},
];

const COMMANDS: XDSSearchableItem<{description: string}>[] = [
  {id: 'summarize', label: 'summarize', auxiliaryData: {description: 'Summarize the conversation'}},
  {id: 'translate', label: 'translate', auxiliaryData: {description: 'Translate text to another language'}},
  {id: 'search', label: 'search', auxiliaryData: {description: 'Search the web or documents'}},
  {id: 'code', label: 'code', auxiliaryData: {description: 'Generate or explain code'}},
  {id: 'help', label: 'help', auxiliaryData: {description: 'Show available commands'}},
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

/** Controlled value — shows the serialized value below */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <XDSChatComposer
          onSubmit={v => {
            alert(`Submitted: ${v}`);
            setValue('');
          }}
          value={value}
          onChange={setValue}
          input={
            <XDSChatComposerInput
              value={value}
              onChange={setValue}
              placeholder="Type a message..."
            />
          }
        />
        <div style={{fontSize: 12, fontFamily: 'monospace', color: '#888'}}>
          Value: {JSON.stringify(value)}
        </div>
      </div>
    );
  },
};

/** Custom placeholder */
export const CustomPlaceholder: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={v => alert(v)}
      input={
        <XDSChatComposerInput placeholder="Ask me anything about XDS..." />
      }
    />
  ),
};

/** Disabled state */
export const Disabled: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={() => {}}
      isDisabled
      input={
        <XDSChatComposerInput isDisabled placeholder="Input is disabled" />
      }
    />
  ),
};

/** Max rows — scrolls after 3 lines */
export const MaxRows: Story = {
  render: () => (
    <XDSChatComposer
      onSubmit={v => alert(v)}
      input={
        <XDSChatComposerInput
          maxRows={3}
          placeholder="Type a long message — scrolls after 3 lines..."
        />
      }
    />
  ),
};

/** Message history — submit a few messages, then ArrowUp/Down to recall */
export const MessageHistory: Story = {
  render: () => {
    const [log, setLog] = useState<string[]>([]);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <XDSChatComposer
          onSubmit={v => setLog(prev => [...prev, v])}
          input={
            <XDSChatComposerInput
              placeholder="Submit messages, then ArrowUp to recall..."
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

/** File paste handler */
export const FilePaste: Story = {
  render: () => {
    const [files, setFiles] = useState<string[]>([]);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <XDSChatComposer
          onSubmit={v => alert(v)}
          input={
            <XDSChatComposerInput
              onFiles={f => setFiles(prev => [...prev, ...f.map(x => x.name)])}
              placeholder="Paste files here (Ctrl+V)..."
            />
          }
        />
        {files.length > 0 && (
          <div style={{fontSize: 12, color: '#666'}}>
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

/** Static @ mentions — type @ to see the menu */
export const MentionTrigger: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [log, setLog] = useState<string[]>([]);
    const mentionTrigger: XDSChatComposerTrigger = {
      character: '@',
      searchSource: userSource,
      renderItem: item => (
        <XDSTypeaheadItem
          item={item}
          description={(item.auxiliaryData as {role: string})?.role}
        />
      ),
      onSelect: item => ({
        value: `@${item.id}`,
        label: item.label,
        variant: 'blue' as const,
      }),
    };

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <XDSChatComposer
          onSubmit={v => {
            setLog(prev => [...prev, v]);
            setValue('');
          }}
          input={
            <XDSChatComposerInput
              value={value}
              onChange={setValue}
              triggers={[mentionTrigger]}
              placeholder="Type @ to mention someone..."
            />
          }
        />
        <div style={{fontSize: 12, fontFamily: 'monospace', color: '#888'}}>
          Value: {JSON.stringify(value)}
        </div>
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
      searchSource: commandSource,
      renderItem: item => (
        <XDSTypeaheadItem
          item={item}
          description={(item.auxiliaryData as {description: string})?.description}
        />
      ),
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

/** Async search source — type @ to trigger a simulated API search */
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
      loadingText: 'Searching users…',
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

/** Multiple triggers — @ for mentions, / for commands */
export const MultipleTriggers: Story = {
  render: () => {
    const [value, setValue] = useState('');
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
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <XDSChatComposer
          onSubmit={v => {
            alert(`Sent: ${v}`);
            setValue('');
          }}
          input={
            <XDSChatComposerInput
              value={value}
              onChange={setValue}
              triggers={[mentionTrigger, commandTrigger]}
              placeholder="Type @ or / ..."
            />
          }
        />
        <div style={{fontSize: 12, fontFamily: 'monospace', color: '#888'}}>
          Value: {JSON.stringify(value)}
        </div>
      </div>
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
        <XDSTypeaheadItem
          item={item}
          description={(item.auxiliaryData as {role: string})?.role}
          icon={
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: '#e8d5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: '#7c3aed',
              }}>
              {item.label.charAt(0)}
            </div>
          }
        />
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
              color: '#7c3aed',
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
            placeholder="Type @ — tokens have icons via badge config..."
          />
        }
      />
    );
  },
};

/** Token color variants — different badge colors per trigger */
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


/** Custom render — full control via render() for rich token content */
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
            placeholder="Type @ — tokens are clickable with avatars..."
          />
        }
      />
    );
  },
};

/** Grouped menu items — items with auxiliaryData.group render under headings */
export const GroupedItems: Story = {
  render: () => {
    const groupedUsers = createStaticSource([
      {id: 'cindy', label: 'Cindy Zhang', auxiliaryData: {group: 'Design', role: 'Design Systems'}},
      {id: 'taylor', label: 'Taylor Kim', auxiliaryData: {group: 'Design', role: 'Product Design'}},
      {id: 'alex', label: 'Alex Johnson', auxiliaryData: {group: 'Engineering', role: 'Frontend'}},
      {id: 'sam', label: 'Sam Rivera', auxiliaryData: {group: 'Engineering', role: 'Backend'}},
      {id: 'morgan', label: 'Morgan Chen', auxiliaryData: {group: 'Engineering', role: 'Infrastructure'}},
      {id: 'jordan', label: 'Jordan Lee', auxiliaryData: {group: 'Product', role: 'Product Manager'}},
    ] as XDSSearchableItem[]);

    const mentionTrigger: XDSChatComposerTrigger = {
      character: '@',
      searchSource: groupedUsers,
      renderItem: item => (
        <XDSTypeaheadItem
          item={item}
          description={(item.auxiliaryData as {role?: string})?.role}
        />
      ),
      onSelect: item => ({
        value: `@${item.id}`,
        label: item.label,
        variant: 'blue' as const,
      }),
    };

    return (
      <XDSChatComposer
        onSubmit={value => alert(`Sent: ${value}`)}
        input={
          <XDSChatComposerInput
            triggers={[mentionTrigger]}
            placeholder="Type @ to see grouped mentions..."
          />
        }
      />
    );
  },
};
