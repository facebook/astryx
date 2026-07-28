// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file tools.tsx
 * @input Uses assistant-ui tool part contracts and Astryx disclosure/content components
 * @output Exports ToolFallback, ToolGroup, and compound tool group parts
 * @position Ready renderer layer for assistant tool execution
 */

import {memo, type ReactNode} from 'react';
import type {ToolCallMessagePartComponent} from '@assistant-ui/react';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {
  Collapsible,
  type CollapsibleProps,
} from '@astryxdesign/core/Collapsible';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';

function stringify(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function statusLabel(status: {type: string}): string {
  switch (status.type) {
    case 'running':
      return 'Running';
    case 'complete':
      return 'Complete';
    case 'incomplete':
      return 'Incomplete';
    case 'requires-action':
      return 'Needs approval';
    default:
      return status.type;
  }
}

const ToolFallbackImpl: ToolCallMessagePartComponent = ({
  toolName,
  args,
  result,
  status,
}) => {
  const isRunning = status.type === 'running';
  const resultText = result === undefined ? null : stringify(result);
  return (
    <Collapsible
      defaultIsOpen={isRunning}
      trigger={
        <HStack align="center" gap={1} justify="between" width="100%">
          <HStack align="center" gap={1}>
            <Icon color="secondary" icon="wrench" size="sm" />
            <Text type="label">{toolName}</Text>
          </HStack>
          <Badge
            label={statusLabel(status)}
            variant={isRunning ? 'info' : 'neutral'}
          />
        </HStack>
      }>
      <VStack gap={2}>
        <CodeBlock
          code={stringify(args)}
          language="json"
          maxHeight={320}
          size="sm"
          title="Arguments"
          width="100%"
        />
        {resultText != null && (
          <CodeBlock
            code={resultText}
            language="plaintext"
            maxHeight={400}
            size="sm"
            title="Result"
            width="100%"
          />
        )}
        {status.type === 'incomplete' && (
          <Banner
            status="error"
            title="The tool did not complete successfully."
          />
        )}
      </VStack>
    </Collapsible>
  );
};

export const ToolFallback = memo(ToolFallbackImpl);
ToolFallback.displayName = 'ToolFallback';

export interface ToolGroupProps extends Omit<
  CollapsibleProps,
  'children' | 'trigger'
> {
  children: ReactNode;
  count?: number;
  isRunning?: boolean;
  label?: string;
}

export function ToolGroup({
  children,
  count,
  isRunning = false,
  label = 'Tool calls',
  ...props
}: ToolGroupProps) {
  const countLabel = count == null ? '' : ` (${count})`;
  return (
    <Collapsible
      {...props}
      defaultIsOpen={isRunning}
      trigger={
        <HStack align="center" gap={1}>
          <Icon
            color={isRunning ? 'accent' : 'secondary'}
            icon="wrench"
            size="sm"
          />
          <Text type="label">
            {label}
            {countLabel}
          </Text>
        </HStack>
      }>
      <VStack gap={2}>{children}</VStack>
    </Collapsible>
  );
}

export const ToolGroupRoot = ToolGroup;

export function ToolGroupTrigger({
  active,
  count,
}: {
  active?: boolean;
  count?: number;
}) {
  return (
    <HStack align="center" gap={1}>
      <Icon color={active ? 'accent' : 'secondary'} icon="wrench" size="sm" />
      <Text type="label">Tool calls{count == null ? '' : ` (${count})`}</Text>
    </HStack>
  );
}

export function ToolGroupContent({children}: {children: ReactNode}) {
  return <VStack gap={2}>{children}</VStack>;
}
