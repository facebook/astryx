// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file thread.tsx
 * @input Uses assistant-ui thread/message/composer state and Astryx Chat components
 * @output Exports the complete Thread ready composition and its message/composer parts
 * @position Primary runtime adapter for @astryxdesign/assistant-ui
 *
 * assistant-ui's ThreadViewport is the sole scroll owner. This composition
 * intentionally does not nest Astryx ChatLayout, which owns a separate
 * auto-scroll hook and would compete with ThreadViewport.
 */

import {
  createContext,
  useContext,
  useMemo,
  type ComponentType,
  type FC,
  type PropsWithChildren,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ErrorPrimitive,
  groupPartByType,
  MessagePrimitive,
  ThreadPrimitive,
  type ToolCallMessagePartComponent,
  useAuiState,
  useComposer,
  useComposerRuntime,
  useThread,
  useThreadRuntime,
} from '@assistant-ui/react';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {
  ChatComposer,
  ChatComposerDrawer,
  ChatComposerInput,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSendButton,
} from '@astryxdesign/core/Chat';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Text} from '@astryxdesign/core/Text';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {VStack} from '@astryxdesign/core/VStack';
import {
  colorVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from './attachment';
import {
  DirectiveText,
  File,
  Image,
  MarkdownText,
  MessageTiming,
  QuoteBlock,
  Reasoning,
  Sources,
} from './content';
import {FollowUpSuggestions} from './follow-up-suggestions';
import {ToolFallback, ToolGroup} from './tools';

export type ThreadGroupPart = MessagePrimitive.GroupedParts.GroupPart;

export interface ThreadComponents {
  AssistantMessage?: ComponentType;
  UserMessage?: ComponentType;
  Welcome?: ComponentType;
  Composer?: ComponentType;
  ToolFallback?: ToolCallMessagePartComponent;
  ToolGroup?: ComponentType<PropsWithChildren<{group: ThreadGroupPart}>>;
  ReasoningGroup?: ComponentType<PropsWithChildren<{group: ThreadGroupPart}>>;
}

export interface ThreadProps {
  components?: ThreadComponents;
  label?: string;
  welcomeTitle?: string;
  welcomeDescription?: string;
}

const EMPTY_COMPONENTS: ThreadComponents = {};
const ThreadComponentsContext =
  createContext<ThreadComponents>(EMPTY_COMPONENTS);

const styles = stylex.create({
  viewport: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    marginInline: 'auto',
  },
  messages: {
    flex: 1,
    paddingInline: spacingVars['--spacing-4'],
    paddingBlockStart: spacingVars['--spacing-4'],
    paddingBlockEnd: spacingVars['--spacing-8'],
  },
  footer: {
    position: 'sticky',
    bottom: 0,
    zIndex: 1,
    width: '100%',
    paddingInline: spacingVars['--spacing-4'],
    paddingBlockEnd: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-surface'],
    borderStartStartRadius: radiusVars['--radius-container'],
    borderStartEndRadius: radiusVars['--radius-container'],
  },
  welcome: {
    paddingInline: spacingVars['--spacing-4'],
  },
  scrollButton: {
    alignSelf: 'center',
  },
});

export const Thread: FC<ThreadProps> = ({
  components = EMPTY_COMPONENTS,
  label = 'Conversation',
  welcomeTitle = 'How can I help?',
  welcomeDescription = 'Ask a question, attach context, or choose a suggested prompt.',
}) => {
  const context = useMemo(() => components, [components]);
  return (
    <ThreadComponentsContext value={context}>
      <ThreadRoot
        label={label}
        welcomeDescription={welcomeDescription}
        welcomeTitle={welcomeTitle}
      />
    </ThreadComponentsContext>
  );
};

const ThreadRoot: FC<{
  label: string;
  welcomeTitle: string;
  welcomeDescription: string;
}> = ({label, welcomeTitle, welcomeDescription}) => {
  const isEmpty = useThread(state => state.messages.length === 0);
  const isRunning = useThread(state => state.isRunning);
  const {
    Welcome = () => (
      <ThreadWelcome description={welcomeDescription} title={welcomeTitle} />
    ),
    Composer = ThreadComposer,
  } = useContext(ThreadComponentsContext);

  return (
    <ThreadPrimitive.Root asChild>
      <VStack gap={0} height="100%" minHeight={0}>
        <VisuallyHidden as="h2">{label}</VisuallyHidden>
        <ThreadPrimitive.Viewport
          autoScroll
          turnAnchor="top"
          {...stylex.props(styles.viewport)}>
          <VStack
            gap={3}
            justify={isEmpty ? 'center' : 'start'}
            minHeight="100%"
            xstyle={styles.content}>
            {isEmpty ? (
              <Welcome />
            ) : (
              <ChatMessageList
                density="balanced"
                isStreaming={isRunning}
                xstyle={styles.messages}>
                <ThreadPrimitive.Messages
                  components={{
                    UserMessage: ThreadMessageUser,
                    AssistantMessage: ThreadMessageAssistant,
                    UserEditComposer: EditComposer,
                  }}
                />
              </ChatMessageList>
            )}
            <ThreadPrimitive.ViewportFooter asChild>
              <VStack gap={2} xstyle={styles.footer}>
                <ThreadScrollToBottom />
                {!isRunning && <FollowUpSuggestions />}
                <Composer />
              </VStack>
            </ThreadPrimitive.ViewportFooter>
          </VStack>
        </ThreadPrimitive.Viewport>
      </VStack>
    </ThreadPrimitive.Root>
  );
};

export interface ThreadWelcomeProps {
  title?: string;
  description?: string;
}

export function ThreadWelcome({
  title = 'How can I help?',
  description = 'Ask a question or attach context to get started.',
}: ThreadWelcomeProps) {
  return (
    <VStack align="center" gap={3} xstyle={styles.welcome}>
      <EmptyState
        description={description}
        headingLevel={1}
        icon={<Icon color="accent" icon="info" size="lg" />}
        title={title}
      />
      <FollowUpSuggestions />
    </VStack>
  );
}

export const ThreadScrollToBottom: FC = () => (
  <ThreadPrimitive.ScrollToBottom asChild>
    <IconButton
      icon={<Icon icon="arrowDown" size="sm" />}
      label="Scroll to bottom"
      size="sm"
      tooltip="Scroll to bottom"
      variant="secondary"
      xstyle={styles.scrollButton}
    />
  </ThreadPrimitive.ScrollToBottom>
);

function BranchPicker() {
  return (
    <BranchPickerPrimitive.Root asChild hideWhenSingleBranch>
      <HStack align="center" gap={0.5}>
        <BranchPickerPrimitive.Previous asChild>
          <IconButton
            icon={<Icon icon="chevronLeft" size="xsm" />}
            label="Previous branch"
            size="sm"
            tooltip="Previous branch"
            variant="ghost"
          />
        </BranchPickerPrimitive.Previous>
        <Text color="secondary" type="supporting">
          <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
        </Text>
        <BranchPickerPrimitive.Next asChild>
          <IconButton
            icon={<Icon icon="chevronRight" size="xsm" />}
            label="Next branch"
            size="sm"
            tooltip="Next branch"
            variant="ghost"
          />
        </BranchPickerPrimitive.Next>
      </HStack>
    </BranchPickerPrimitive.Root>
  );
}

function CopyAction() {
  return (
    <ActionBarPrimitive.Copy asChild>
      <IconButton
        icon={
          <>
            <MessagePrimitive.If copied={false}>
              <Icon icon="copy" size="sm" />
            </MessagePrimitive.If>
            <MessagePrimitive.If copied>
              <Icon color="success" icon="checkDouble" size="sm" />
            </MessagePrimitive.If>
          </>
        }
        label="Copy message"
        size="sm"
        tooltip="Copy message"
        variant="ghost"
      />
    </ActionBarPrimitive.Copy>
  );
}

function RetryAction() {
  return (
    <ActionBarPrimitive.Reload asChild>
      <IconButton
        icon={<Icon icon="arrowsUpDown" size="sm" />}
        label="Retry message"
        size="sm"
        tooltip="Retry message"
        variant="ghost"
      />
    </ActionBarPrimitive.Reload>
  );
}

function EditAction() {
  return (
    <ActionBarPrimitive.Edit asChild>
      <IconButton
        icon={<Icon icon="wrench" size="sm" />}
        label="Edit message"
        size="sm"
        tooltip="Edit message"
        variant="ghost"
      />
    </ActionBarPrimitive.Edit>
  );
}

function MessageFooter({role}: {role: 'assistant' | 'user'}) {
  return (
    <ChatMessageMetadata
      footer={
        <HStack align="center" gap={1}>
          <BranchPicker />
          <ActionBarPrimitive.Root asChild autohide="not-last" hideWhenRunning>
            <HStack align="center" gap={0.5}>
              <CopyAction />
              <MessageTiming />
              <MessagePrimitive.If last>
                {role === 'assistant' ? <RetryAction /> : <EditAction />}
              </MessagePrimitive.If>
            </HStack>
          </ActionBarPrimitive.Root>
        </HStack>
      }
    />
  );
}

const groupAssistantParts = groupPartByType({
  reasoning: ['group-reasoning'],
  'tool-call': ['group-tools'],
});

function AssistantMessageParts() {
  const {
    ToolFallback: ToolFallbackComponent = ToolFallback,
    ToolGroup: ToolGroupComponent,
    ReasoningGroup: ReasoningGroupComponent,
  } = useContext(ThreadComponentsContext);

  return (
    <MessagePrimitive.GroupedParts groupBy={groupAssistantParts}>
      {({part, children}) => {
        switch (part.type) {
          case 'group-reasoning':
            return ReasoningGroupComponent != null ? (
              <ReasoningGroupComponent group={part}>
                {children}
              </ReasoningGroupComponent>
            ) : (
              <VStack gap={2}>{children}</VStack>
            );
          case 'group-tools':
            return ToolGroupComponent != null ? (
              <ToolGroupComponent group={part}>{children}</ToolGroupComponent>
            ) : (
              <ToolGroup
                count={part.indices.length}
                isRunning={part.status.type === 'running'}>
                {children}
              </ToolGroup>
            );
          case 'text':
            return <MarkdownText {...part} />;
          case 'reasoning':
            return <Reasoning {...part} />;
          case 'image':
            return <Image {...part} />;
          case 'file':
            return <File {...part} />;
          case 'source':
            return <Sources {...part} />;
          case 'tool-call':
            return part.toolUI ?? <ToolFallbackComponent {...part} />;
          case 'data':
            return part.dataRendererUI;
          case 'indicator':
            return <Spinner aria-label="Assistant is working" size="sm" />;
          default:
            return null;
        }
      }}
    </MessagePrimitive.GroupedParts>
  );
}

function UserMessageParts() {
  return (
    <MessagePrimitive.Parts>
      {({part}) => {
        switch (part.type) {
          case 'text':
            return <DirectiveText {...part} />;
          case 'image':
            return <Image {...part} />;
          case 'file':
            return <File {...part} />;
          default:
            return null;
        }
      }}
    </MessagePrimitive.Parts>
  );
}

function MessageError() {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root>
        <Banner status="error" title={<ErrorPrimitive.Message />} />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
}

export function UserMessage() {
  return (
    <MessagePrimitive.Root>
      <ChatMessage density="balanced" sender="user">
        <UserMessageAttachments />
        <ChatMessageBubble metadata={<MessageFooter role="user" />}>
          <MessagePrimitive.Quote>
            {quote => <QuoteBlock {...quote} />}
          </MessagePrimitive.Quote>
          <UserMessageParts />
        </ChatMessageBubble>
      </ChatMessage>
    </MessagePrimitive.Root>
  );
}

export function AssistantMessage() {
  return (
    <MessagePrimitive.Root>
      <ChatMessage
        avatar={<Icon color="accent" icon="info" size="md" />}
        density="balanced"
        sender="assistant">
        <ChatMessageBubble
          metadata={<MessageFooter role="assistant" />}
          variant="ghost">
          <MessagePrimitive.Quote>
            {quote => <QuoteBlock {...quote} />}
          </MessagePrimitive.Quote>
          <AssistantMessageParts />
          <MessageError />
        </ChatMessageBubble>
      </ChatMessage>
    </MessagePrimitive.Root>
  );
}

function ThreadMessageUser() {
  const {UserMessage: UserMessageComponent = UserMessage} = useContext(
    ThreadComponentsContext,
  );
  return <UserMessageComponent />;
}

function ThreadMessageAssistant() {
  const {AssistantMessage: AssistantMessageComponent = AssistantMessage} =
    useContext(ThreadComponentsContext);
  return <AssistantMessageComponent />;
}

export function ThreadComposer() {
  const composer = useComposerRuntime();
  const thread = useThreadRuntime();
  const attachmentCount = useComposer(state => state.attachments.length);
  const canSend = useComposer(state => state.canSend);
  const text = useComposer(state => state.text);
  const isRunning = useThread(state => state.isRunning);
  const isDisabled = useAuiState(state => state.composer.isEditing);

  const composerNode = (
    <ChatComposer
      density="balanced"
      drawer={
        attachmentCount > 0 ? (
          <ChatComposerDrawer count={attachmentCount} label="Attachments">
            <ComposerAttachments />
          </ChatComposerDrawer>
        ) : undefined
      }
      input={
        <ChatComposerInput
          isDisabled={isDisabled}
          label="Message assistant"
          maxRows={8}
          onChange={value => composer.setText(value)}
          onFiles={files =>
            files.forEach(file => void composer.addAttachment(file))
          }
          placeholder="Send a message…"
          value={text}
        />
      }
      isDisabled={isDisabled}
      isStopShown={isRunning}
      onChange={value => composer.setText(value)}
      onStop={() => thread.cancelRun()}
      onSubmit={() => composer.send()}
      placeholder="Send a message…"
      sendActions={<ComposerAddAttachment isDisabled={isDisabled} />}
      sendButton={
        <ChatSendButton
          isDisabled={!canSend}
          isStopShown={isRunning}
          onSend={() => composer.send()}
          onStop={() => thread.cancelRun()}
        />
      }
      value={text}
    />
  );

  return <>{composerNode}</>;
}

export function EditComposer() {
  const composer = useComposerRuntime();
  const text = useComposer(state => state.text);
  const canSend = useComposer(state => state.canSend);
  return (
    <MessagePrimitive.Root>
      <ChatMessage density="balanced" sender="user">
        <ChatComposer
          footerActions={
            <Button
              label="Cancel"
              onClick={() => composer.cancel()}
              size="sm"
              variant="secondary"
            />
          }
          input={
            <ChatComposerInput
              label="Edit message"
              maxRows={8}
              onChange={value => composer.setText(value)}
              value={text}
            />
          }
          onChange={value => composer.setText(value)}
          onSubmit={() => composer.send()}
          sendButton={
            <Button
              icon={<Icon icon="check" size="sm" />}
              isDisabled={!canSend}
              label="Update message"
              size="sm"
              type="submit"
              variant="primary"
            />
          }
          value={text}
        />
      </ChatMessage>
    </MessagePrimitive.Root>
  );
}
