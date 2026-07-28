// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file navigation.tsx
 * @input Uses assistant-ui thread/navigation primitives and Astryx navigation components
 * @output Exports thread list, modal, sidebar, model selector, and trigger popover adapters
 * @position Ready navigation and shell layer for @astryxdesign/assistant-ui
 */

import type {FC, PropsWithChildren, ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  AssistantModalPrimitive,
  ComposerPrimitive,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from '@assistant-ui/react';
import {Button} from '@astryxdesign/core/Button';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {SideNav, SideNavHeading} from '@astryxdesign/core/SideNav';
import {StackItem} from '@astryxdesign/core/Stack';
import {VStack} from '@astryxdesign/core/VStack';
import {
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {Select, type SelectOption} from './primitives';
import {Thread} from './thread';
import {TooltipIconButton} from './tooltip-icon-button';

const styles = stylex.create({
  threadListItem: {
    minWidth: 0,
    width: '100%',
  },
  modalAnchor: {
    position: 'fixed',
    insetInlineEnd: spacingVars['--spacing-4'],
    bottom: spacingVars['--spacing-4'],
    zIndex: 1,
  },
  modalContent: {
    width: 400,
    maxWidth: 'calc(100vw - 32px)',
    height: 600,
    maxHeight: 'calc(100dvh - 96px)',
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-surface'],
    boxShadow: shadowVars['--shadow-high'],
  },
  sidebar: {
    minWidth: 0,
    height: '100%',
  },
  assistantPanel: {
    width: 400,
    maxWidth: '50%',
    minWidth: 320,
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
  },
});

export const ThreadListItem: FC = () => (
  <ThreadListItemPrimitive.Root asChild>
    <HStack align="center" gap={1} xstyle={styles.threadListItem}>
      <ThreadListItemPrimitive.Trigger asChild>
        <Button label="Open thread" size="sm" variant="ghost" width="100%">
          <ThreadListItemPrimitive.Title fallback="New thread" />
        </Button>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemPrimitive.Archive asChild>
        <IconButton
          icon={<Icon icon="arrowDown" size="xsm" />}
          label="Archive thread"
          size="sm"
          tooltip="Archive thread"
          variant="ghost"
        />
      </ThreadListItemPrimitive.Archive>
      <ThreadListItemPrimitive.Delete asChild>
        <IconButton
          icon={<Icon color="error" icon="close" size="xsm" />}
          label="Delete thread"
          size="sm"
          tooltip="Delete thread"
          variant="ghost"
        />
      </ThreadListItemPrimitive.Delete>
    </HStack>
  </ThreadListItemPrimitive.Root>
);

export const ThreadList: FC = () => (
  <ThreadListPrimitive.Root asChild>
    <VStack gap={1}>
      <ThreadListPrimitive.New asChild>
        <Button
          icon={<Icon icon="arrowUp" size="sm" />}
          label="New thread"
          size="sm"
          variant="secondary"
          width="100%"
        />
      </ThreadListPrimitive.New>
      <ThreadListPrimitive.Items components={{ThreadListItem}} />
    </VStack>
  </ThreadListPrimitive.Root>
);

export interface AssistantModalProps {
  thread?: ReactNode;
  label?: string;
}

export const AssistantModal: FC<AssistantModalProps> = ({
  thread = <Thread />,
  label = 'Toggle assistant',
}) => (
  <AssistantModalPrimitive.Root>
    <AssistantModalPrimitive.Anchor {...stylex.props(styles.modalAnchor)}>
      <AssistantModalPrimitive.Trigger asChild>
        <TooltipIconButton size="lg" tooltip={label} variant="primary">
          <Icon icon="info" size="md" />
        </TooltipIconButton>
      </AssistantModalPrimitive.Trigger>
    </AssistantModalPrimitive.Anchor>
    <AssistantModalPrimitive.Content
      sideOffset={16}
      {...stylex.props(styles.modalContent)}>
      {thread}
    </AssistantModalPrimitive.Content>
  </AssistantModalPrimitive.Root>
);

export const AssistantSidebar: FC<
  PropsWithChildren<{assistant?: ReactNode}>
> = ({children, assistant = <Thread />}) => (
  <HStack gap={0} height="100%" xstyle={styles.sidebar}>
    <StackItem isScrollable size="fill">
      {children}
    </StackItem>
    <StackItem isScrollable xstyle={styles.assistantPanel}>
      {assistant}
    </StackItem>
  </HStack>
);

export const ThreadListSidebar: FC<
  PropsWithChildren<{heading?: string; resizable?: boolean}>
> = ({children, heading = 'Assistant', resizable = true}) => (
  <HStack gap={0} height="100%">
    <SideNav
      header={<SideNavHeading heading={heading} />}
      resizable={resizable}
      topContent={
        <ThreadListPrimitive.New asChild>
          <Button
            label="New thread"
            size="sm"
            variant="secondary"
            width="100%"
          />
        </ThreadListPrimitive.New>
      }>
      <ThreadList />
    </SideNav>
    <StackItem isScrollable size="fill">
      {children}
    </StackItem>
  </HStack>
);

export interface ModelOption extends SelectOption {
  provider?: string;
}

export interface ModelSelectorProps {
  models: ModelOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
}

export function ModelSelector({
  models,
  value,
  onValueChange,
  label = 'Model',
}: ModelSelectorProps) {
  return (
    <Select
      label={label}
      onValueChange={onValueChange}
      options={models.map(model => ({
        value: model.value,
        label: model.label,
        description: model.provider ?? model.description,
      }))}
      size="sm"
      value={value}
    />
  );
}

/**
 * Direct assistant-ui trigger-popover behavior exposed from the adapter
 * package. Consumers compose its slots with Astryx Button/List primitives.
 */
export const ComposerTriggerPopover: {
  Root: typeof ComposerPrimitive.Unstable_TriggerPopoverRoot;
  Popover: typeof ComposerPrimitive.Unstable_TriggerPopover;
  Back: typeof ComposerPrimitive.Unstable_TriggerPopoverBack;
  Categories: typeof ComposerPrimitive.Unstable_TriggerPopoverCategories;
  CategoryItem: typeof ComposerPrimitive.Unstable_TriggerPopoverCategoryItem;
  Items: typeof ComposerPrimitive.Unstable_TriggerPopoverItems;
  Item: typeof ComposerPrimitive.Unstable_TriggerPopoverItem;
} = {
  Root: ComposerPrimitive.Unstable_TriggerPopoverRoot,
  Popover: ComposerPrimitive.Unstable_TriggerPopover,
  Back: ComposerPrimitive.Unstable_TriggerPopoverBack,
  Categories: ComposerPrimitive.Unstable_TriggerPopoverCategories,
  CategoryItem: ComposerPrimitive.Unstable_TriggerPopoverCategoryItem,
  Items: ComposerPrimitive.Unstable_TriggerPopoverItems,
  Item: ComposerPrimitive.Unstable_TriggerPopoverItem,
};
