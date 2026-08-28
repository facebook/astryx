// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, type CSSProperties, type ReactNode} from 'react';

import {AvatarStatusDot} from '@astryxdesign/core/Avatar';
import {
  ChatComposer,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
  ChatToolCalls,
} from '@astryxdesign/core/Chat';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {DropdownMenu, DropdownMenuItem} from '@astryxdesign/core/DropdownMenu';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Step, Stepper} from '@astryxdesign/core/Stepper';
import {
  proportional,
  Table,
  type TableColumn,
  useTableRowStatus,
} from '@astryxdesign/core/Table';

interface StatusRow extends Record<string, unknown> {
  id: string;
  name: string;
  status: 'success' | 'warning' | 'error' | 'blue' | 'gray';
}

const STATUS_ROWS: StatusRow[] = [
  {id: 'ready', name: 'Ready', status: 'success'},
  {id: 'review', name: 'Needs review', status: 'warning'},
  {id: 'failed', name: 'Failed', status: 'error'},
  {id: 'running', name: 'Running', status: 'blue'},
  {id: 'paused', name: 'Paused', status: 'gray'},
];

const STATUS_COLUMNS: TableColumn<StatusRow>[] = [
  {key: 'name', header: 'Row status', width: proportional(1)},
];

const SECTION_STYLE: CSSProperties = {
  paddingTop: 20,
  borderTop: '1px solid var(--color-border)',
};

const GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: 12,
};

function Section({title, children}: {title: string; children: ReactNode}) {
  return (
    <section style={SECTION_STYLE}>
      <h3 style={{fontSize: 13, margin: '0 0 12px'}}>{title}</h3>
      {children}
    </section>
  );
}

function CategoryHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header
      style={{
        padding: 16,
        borderRadius: 12,
        background: 'var(--color-background-muted)',
      }}>
      <h2 style={{fontSize: 18, margin: '0 0 4px'}}>{title}</h2>
      <p
        style={{
          margin: 0,
          color: 'var(--color-text-secondary)',
          fontSize: 12,
          lineHeight: 1.5,
        }}>
        {description}
      </p>
    </header>
  );
}

export function NeutralContrastComponents() {
  const getRowStatus = useCallback(
    (row: StatusRow) => ({color: row.status, label: row.name}),
    [],
  );
  const rowStatus = useTableRowStatus<StatusRow>({getStatus: getRowStatus});
  return (
    <div style={{display: 'grid', gap: 24}}>
      <div>
        <h2 style={{fontSize: 20, margin: '0 0 6px'}}>
          Additional component coverage
        </h2>
        <p
          style={{
            margin: 0,
            color: 'var(--color-text-secondary)',
            fontSize: 12,
            lineHeight: 1.5,
          }}>
          Components below cover color relationships that do not yet have a
          dedicated audit section above.
        </p>
      </div>

      <CategoryHeading
        title="Semantic status and feedback"
        description="Success, warning, error, and accent treatments used for status, progress, and procedural feedback."
      />
      <Section title="Status indicators">
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          {(['accent', 'success', 'warning', 'error', 'neutral'] as const).map(
            variant => (
              <span
                key={variant}
                style={{display: 'inline-flex', alignItems: 'center', gap: 5}}>
                <StatusDot variant={variant} label={variant} />
                <small>{variant}</small>
              </span>
            ),
          )}
          <AvatarStatusDot variant="success" label="Online" />
          <AvatarStatusDot variant="neutral" label="Away" />
          <AvatarStatusDot variant="error" label="Busy" />
        </div>
      </Section>

      <CategoryHeading
        title="Actions and procedures"
        description="Destructive actions and procedural feedback across different component structures and surfaces."
      />
      <Section title="Stepper and destructive menu">
        <div style={{display: 'grid', gap: 16}}>
          <Stepper activeStep={1} orientation="horizontal">
            <Step step={0} label="Passed" status="success" />
            <Step step={1} label="Review" status="warning" />
            <Step step={2} label="Blocked" status="error" />
          </Stepper>
          <DropdownMenu button={{label: 'Open contrast menu'}}>
            <DropdownMenuItem label="Rename" onClick={() => {}} />
            <DropdownMenuItem
              label="Delete theme"
              variant="destructive"
              onClick={() => {}}
            />
          </DropdownMenu>
        </div>
      </Section>

      <CategoryHeading
        title="Data and communication"
        description="Status colors used inside dense data, code, chat, and messaging contexts."
      />
      <Section title="Table row status and syntax colors">
        <div style={{display: 'grid', gap: 16}}>
          <Table
            data={STATUS_ROWS}
            columns={STATUS_COLUMNS}
            idKey="id"
            density="compact"
            plugins={{rowStatus}}
          />
          <CodeBlock
            language="typescript"
            title="theme.ts"
            code={`const palette = {
  success: '#098123',
  warning: '#f6d168',
  error: '#ca3f3e',
};`}
          />
        </div>
      </Section>

      <Section title="Chat status surfaces">
        <div style={{display: 'grid', gap: 14}}>
          <ChatComposer
            onSubmit={() => {}}
            status={{type: 'warning', message: 'Approaching the token limit'}}
          />
          <ChatComposer
            onSubmit={() => {}}
            status={{type: 'error', message: 'Message could not be sent'}}
          />
          <ChatMessage sender="user">
            <ChatMessageBubble
              metadata={<ChatMessageMetadata status="error" />}>
              Failed message metadata
            </ChatMessageBubble>
          </ChatMessage>
          <ChatToolCalls
            calls={[
              {
                name: 'edit',
                target: 'neutralTheme.ts',
                status: 'complete',
                additions: 24,
                deletions: 8,
              },
              {
                name: 'test',
                target: 'contrast suite',
                status: 'error',
                errorMessage: 'Example failure state',
              },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
