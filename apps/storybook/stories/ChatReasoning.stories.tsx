import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatReasoning,
  XDSChatToolCalls,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {useState, useEffect} from 'react';

const meta: Meta = {
  title: 'Chat/Reasoning & Tool Calls',
  tags: ['autodocs'],
};
export default meta;

// =============================================================================
// Reasoning Stories
// =============================================================================

export const ReasoningCollapsed: StoryObj = {
  name: 'Reasoning — Collapsed (default)',
  render: () => (
    <div style={{maxWidth: 600}}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            How many valid planting arrangements are possible over 3 years?
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="AI" size="small" />}>
          <XDSChatReasoning duration="12s">
            Let me work through the constraints systematically. The farmer has 3
            fields and rotates wheat, corn, soy. No same crop in adjacent fields
            and no same crop in the same field two years in a row...
          </XDSChatReasoning>
          <XDSMarkdown density="compact">{`There are **42** valid planting arrangements over 3 years.`}</XDSMarkdown>
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  ),
};

export const ReasoningExpanded: StoryObj = {
  name: 'Reasoning — Expanded',
  render: () => (
    <div style={{maxWidth: 600}}>
      <XDSChatReasoning duration="8s" defaultIsExpanded>
        <XDSMarkdown density="compact">{`First, I need to understand the constraints:
1. Three fields, three crops (wheat, corn, soy)
2. No adjacent fields can have the same crop
3. No field can repeat its crop from the previous year

For **Year 1**: 3 × 2 × 2 = 12 arrangements...`}</XDSMarkdown>
      </XDSChatReasoning>
    </div>
  ),
};

export const ReasoningStreaming: StoryObj = {
  name: 'Reasoning — Streaming',
  render: () => {
    const [streaming, setStreaming] = useState(true);
    useEffect(() => {
      const t = setTimeout(() => setStreaming(false), 5000);
      return () => clearTimeout(t);
    }, []);
    return (
      <div style={{maxWidth: 600}}>
        <XDSChatReasoning isStreaming={streaming} label="Thinking">
          Working through the combinatorial constraints...
        </XDSChatReasoning>
        {!streaming && (
          <p style={{marginTop: 8, fontSize: 13, color: '#888'}}>
            (Shimmer stopped after 5s)
          </p>
        )}
      </div>
    );
  },
};

// =============================================================================
// Tool Call Stories
// =============================================================================

export const ToolCallSingle: StoryObj = {
  name: 'Tool Calls — Single (no group chrome)',
  render: () => (
    <div style={{maxWidth: 500}}>
      <XDSChatToolCalls
        calls={[
          {
            name: 'bash',
            label: 'git status',
            status: 'complete',
            duration: '120ms',
          },
        ]}
      />
    </div>
  ),
};

export const ToolCallStatuses: StoryObj = {
  name: 'Tool Calls — All Statuses',
  render: () => (
    <div style={{maxWidth: 500}}>
      <XDSChatToolCalls
        calls={[
          {name: 'searchCode', status: 'pending'},
          {name: 'readFile', status: 'running'},
          {name: 'editFile', status: 'complete', duration: '1.2s'},
          {name: 'bash', status: 'error'},
        ]}
      />
    </div>
  ),
};

export const ToolCallGroup: StoryObj = {
  name: 'Tool Calls — Group (≤3, auto-expanded)',
  render: () => (
    <div style={{maxWidth: 500}}>
      <XDSChatToolCalls
        calls={[
          {
            name: 'searchCode',
            label: 'XDSChatReasoning',
            status: 'complete',
            duration: '340ms',
          },
          {
            name: 'readFile',
            label: 'Chat/XDSChatReasoning.tsx',
            status: 'complete',
            duration: '50ms',
          },
          {
            name: 'editFile',
            label: 'Chat/XDSChatReasoning.test.tsx',
            status: 'complete',
            duration: '85ms',
          },
        ]}
      />
    </div>
  ),
};

export const ToolCallGroupLarge: StoryObj = {
  name: 'Tool Calls — Group (>3, auto-collapsed)',
  render: () => (
    <div style={{maxWidth: 500}}>
      <XDSChatToolCalls
        calls={[
          {
            name: 'bash',
            label: 'git fetch origin main',
            status: 'complete',
            duration: '1.1s',
          },
          {
            name: 'bash',
            label: 'yarn install',
            status: 'complete',
            duration: '3.2s',
          },
          {name: 'searchCode', status: 'complete', duration: '340ms'},
          {name: 'readFile', status: 'complete', duration: '50ms'},
          {name: 'editFile', status: 'complete', duration: '85ms'},
          {
            name: 'bash',
            label: 'yarn test',
            status: 'complete',
            duration: '4.1s',
          },
        ]}
      />
    </div>
  ),
};

export const ToolCallWithDetail: StoryObj = {
  name: 'Tool Calls — With renderDetail',
  render: () => (
    <div style={{maxWidth: 500}}>
      <XDSChatToolCalls
        calls={[
          {
            name: 'searchCode',
            status: 'complete',
            duration: '340ms',
            data: {query: 'XDSChatReasoning', lang: 'ts'},
          },
        ]}
        renderDetail={call => (
          <XDSCodeBlock
            code={JSON.stringify(call.data, null, 2)}
            language="json"
          />
        )}
      />
    </div>
  ),
};

// =============================================================================
// Full Conversation — Navi-style
// =============================================================================

export const FullConversation: StoryObj = {
  name: 'Full Conversation — Reasoning + Tool Calls',
  render: () => (
    <div
      style={{
        height: 600,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 650,
      }}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble>
            Can you find where XDSChatReasoning is defined and add a test?
          </XDSChatMessageBubble>
        </XDSChatMessage>
        <XDSChatMessage
          sender="assistant"
          name="Navi"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatReasoning duration="3s">
            The user wants me to find the XDSChatReasoning component and add a
            test file for it. I should search the codebase first, then read the
            file, then create a test.
          </XDSChatReasoning>
          <XDSChatToolCalls
            calls={[
              {
                name: 'searchCode',
                label: 'XDSChatReasoning',
                status: 'complete',
                duration: '340ms',
              },
              {
                name: 'readFile',
                label: 'Chat/XDSChatReasoning.tsx',
                status: 'complete',
                duration: '50ms',
              },
              {
                name: 'editFile',
                label: 'Chat/XDSChatReasoning.test.tsx',
                status: 'complete',
                duration: '85ms',
              },
            ]}
          />
          <XDSMarkdown density="compact">{`Done! I found \`XDSChatReasoning\` in \`packages/core/src/Chat/\` and added a test file covering:

- Default collapsed render
- Expand/collapse toggle
- Streaming shimmer state
- Duration display
- Custom label`}</XDSMarkdown>
        </XDSChatMessage>
      </XDSChatMessageList>
    </div>
  ),
};
