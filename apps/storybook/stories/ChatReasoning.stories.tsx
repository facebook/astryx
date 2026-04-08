import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatReasoning,
  XDSChatToolCall,
  XDSChatToolCallGroup,
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
            and no same crop in the same field two years in a row. For year 1 I
            need to count valid permutations where no two adjacent fields share
            a crop. Then for each subsequent year, each field must differ from
            its previous value AND its neighbors...
          </XDSChatReasoning>
          <XDSMarkdown density="compact">{`There are **42** valid planting arrangements over 3 years.

Here's the breakdown:
- Year 1: 6 valid arrangements (3! permutations minus adjacent constraints)
- Year 2: ~4 valid options per Year 1 config
- Year 3: further constrained by Year 2

The key insight is that the non-adjacency constraint and the year-over-year constraint interact multiplicatively.`}</XDSMarkdown>
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

For **Year 1**, the fields are in a line so "adjacent" means neighbors. With 3 crops and 3 fields: the first field has 3 options, second has 2 (≠ first), third has 1 (≠ second). That gives 3 × 2 × 1 = 6 arrangements.

Wait — the third field only can't match the second (its only neighbor), so it has 2 options, not 1. So: 3 × 2 × 2 = 12... but some of these have field 1 = field 3 which is allowed since they're not adjacent.

Actually, let me reconsider...`}</XDSMarkdown>
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
            (Shimmer stopped after 5s — simulating streaming end)
          </p>
        )}
      </div>
    );
  },
};

// =============================================================================
// Tool Call Stories
// =============================================================================

export const ToolCallStatuses: StoryObj = {
  name: 'Tool Call — All Statuses',
  render: () => (
    <div style={{maxWidth: 500}}>
      <XDSChatToolCall name="searchCode" status="pending" />
      <XDSChatToolCall name="readFile" status="running" />
      <XDSChatToolCall name="editFile" status="complete" duration="1.2s" />
      <XDSChatToolCall name="bash" status="error">
        <XDSCodeBlock
          code={
            "Error: ENOENT: no such file or directory, open '/tmp/missing.ts'"
          }
          language="text"
        />
      </XDSChatToolCall>
    </div>
  ),
};

export const ToolCallWithContent: StoryObj = {
  name: 'Tool Call — Expandable',
  render: () => (
    <div style={{maxWidth: 500}}>
      <XDSChatToolCall name="searchCode" status="complete" duration="340ms">
        <XDSCodeBlock
          code={JSON.stringify(
            {query: 'XDSChatReasoning', language: 'typescript', limit: 10},
            null,
            2,
          )}
          language="json"
        />
      </XDSChatToolCall>
    </div>
  ),
};

export const ToolCallGroup: StoryObj = {
  name: 'Tool Call Group',
  render: () => (
    <div style={{maxWidth: 500}}>
      <XDSChatToolCallGroup>
        <XDSChatToolCall name="searchCode" status="complete" duration="340ms" />
        <XDSChatToolCall name="readFile" status="complete" duration="120ms" />
        <XDSChatToolCall name="editFile" status="complete" duration="85ms" />
      </XDSChatToolCallGroup>
    </div>
  ),
};

export const ToolCallGroupCollapsed: StoryObj = {
  name: 'Tool Call Group — Collapsed',
  render: () => (
    <div style={{maxWidth: 500}}>
      <XDSChatToolCallGroup defaultIsExpanded={false}>
        <XDSChatToolCall name="searchCode" status="complete" duration="340ms" />
        <XDSChatToolCall name="readFile" status="complete" duration="120ms" />
        <XDSChatToolCall name="editFile" status="complete" duration="85ms" />
      </XDSChatToolCallGroup>
    </div>
  ),
};

export const SingleToolCallInGroup: StoryObj = {
  name: 'Tool Call Group — Single (no chrome)',
  render: () => (
    <div style={{maxWidth: 500}}>
      <XDSChatToolCallGroup>
        <XDSChatToolCall name="bash" status="complete" duration="2.1s" />
      </XDSChatToolCallGroup>
    </div>
  ),
};

// =============================================================================
// Full Conversation
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
          <XDSChatToolCallGroup>
            <XDSChatToolCall
              name="searchCode"
              status="complete"
              duration="340ms">
              <XDSCodeBlock
                code={'Found: packages/core/src/Chat/XDSChatReasoning.tsx'}
                language="text"
              />
            </XDSChatToolCall>
            <XDSChatToolCall
              name="readFile"
              status="complete"
              duration="50ms"
            />
            <XDSChatToolCall
              name="editFile"
              status="complete"
              duration="85ms"
            />
          </XDSChatToolCallGroup>
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
