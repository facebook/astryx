// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useRef, useState} from 'react';

import {
  XDSLayout,
  XDSLayoutContent,
  XDSVStack,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {
  XDSChatComposer,
  XDSChatComposerDrawer,
  XDSChatComposerInput,
  XDSChatDictationButton,
  XDSChatLayout,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
  useXDSChatDictation,
  type XDSChatComposerInputHandle,
  type XDSChatComposerTrigger,
} from '@xds/core/Chat';
import {XDSMarkdown} from '@xds/core/Markdown';
import {
  createStaticSource,
  XDSTypeaheadItem,
  type XDSSearchableItem,
} from '@xds/core/Typeahead';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSButton} from '@xds/core/Button';
import {XDSToken} from '@xds/core/Token';
import {XDSCard} from '@xds/core/Card';
import {XDSGrid} from '@xds/core/Grid';
import {XDSIcon} from '@xds/core/Icon';

import {XDSDropdownMenu, XDSDropdownMenuItem} from '@xds/core/DropdownMenu';
import {
  Cog6ToothIcon,
  AtSymbolIcon,
  SparklesIcon,
  PencilSquareIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  ClockIcon,
  PaperClipIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

const TOKEN_MODES: Record<string, string> = {
  sensitive: '/sensitive',
  deep: '/deep-mode',
};

// Suggestion prompts per category
const CATEGORY_SUGGESTIONS: Record<
  string,
  Array<{heading: string; body: string; prompt: string}>
> = {
  writing: [
    {
      heading: 'Draft a professional email',
      body: 'Compose a clear, polished email for any audience',
      prompt: 'Help me draft a professional email',
    },
    {
      heading: 'Improve my writing',
      body: 'Enhance the clarity, tone, and flow of my text',
      prompt: 'Review and improve the following text:',
    },
    {
      heading: 'Create a project proposal',
      body: 'Write a proposal with goals, timeline, and deliverables',
      prompt: 'Help me write a project proposal for',
    },
    {
      heading: 'Summarize a document',
      body: 'Condense a long document into key takeaways',
      prompt: 'Summarize the following document into key points:',
    },
  ],
  coding: [
    {
      heading: 'Debug my code',
      body: 'Find and fix issues in a code snippet',
      prompt: 'Help me debug the following code:',
    },
    {
      heading: 'Write a function',
      body: 'Generate a well-typed function with error handling',
      prompt: 'Write a function that',
    },
    {
      heading: 'Explain this code',
      body: 'Break down complex code into understandable pieces',
      prompt: 'Explain what the following code does:',
    },
    {
      heading: 'Review my pull request',
      body: 'Check for bugs, performance, and best practices',
      prompt: 'Review this code for bugs and improvements:',
    },
  ],
  research: [
    {
      heading: 'Compare options',
      body: 'Analyze pros and cons of different approaches',
      prompt: 'Compare the pros and cons of',
    },
    {
      heading: 'Explain a concept',
      body: 'Break down a complex topic in simple terms',
      prompt: 'Explain the concept of',
    },
    {
      heading: 'Find best practices',
      body: 'Research standards and recommended approaches',
      prompt: 'What are the best practices for',
    },
    {
      heading: 'Summarize findings',
      body: 'Compile research into a structured overview',
      prompt: 'Summarize the key findings on',
    },
  ],
  creative: [
    {
      heading: 'Brainstorm ideas',
      body: 'Generate creative concepts for a project',
      prompt: 'Brainstorm ideas for',
    },
    {
      heading: 'Write a story',
      body: 'Create an engaging narrative with characters',
      prompt: 'Write a short story about',
    },
    {
      heading: 'Design a concept',
      body: 'Explore product or visual design ideas',
      prompt: 'Help me design a concept for',
    },
    {
      heading: 'Create a tagline',
      body: 'Craft a memorable phrase for a brand or product',
      prompt: 'Create a catchy tagline for',
    },
  ],
};

// Shared category definitions used by both toggle group and mode menu
const CATEGORIES = [
  {key: 'writing', label: 'Writing', icon: PencilSquareIcon},
  {key: 'coding', label: 'Coding', icon: CodeBracketIcon},
  {key: 'research', label: 'Research', icon: MagnifyingGlassIcon},
  {key: 'creative', label: 'Creative', icon: LightBulbIcon},
] as const;

// Mode options for the dropdown (categories + special modes)
const MODE_OPTIONS = [
  {key: 'auto', label: 'Auto', icon: SparklesIcon},
  ...CATEGORIES,
  {key: 'sensitive', label: 'Sensitive', icon: LockClosedIcon},
  {key: 'deep', label: 'Deep Mode', icon: ClockIcon},
] as const;

// ============= TRIGGER DATA =============

const MENTION_ITEMS: XDSSearchableItem<{role: string}>[] = [
  {id: 'cindy', label: 'Cindy Zhang', auxiliaryData: {role: 'Design Systems'}},
  {id: 'alex', label: 'Alex Johnson', auxiliaryData: {role: 'Frontend'}},
  {id: 'sam', label: 'Sam Rivera', auxiliaryData: {role: 'Backend'}},
  {id: 'jordan', label: 'Jordan Lee', auxiliaryData: {role: 'Product'}},
  {id: 'taylor', label: 'Taylor Kim', auxiliaryData: {role: 'Design'}},
  {
    id: 'morgan',
    label: 'Morgan Chen',
    auxiliaryData: {role: 'Infrastructure'},
  },
];

const COMMAND_ITEMS: XDSSearchableItem<{description: string}>[] = [
  {
    id: 'summarize',
    label: 'summarize',
    auxiliaryData: {description: 'Summarize the conversation'},
  },
  {
    id: 'translate',
    label: 'translate',
    auxiliaryData: {description: 'Translate text to another language'},
  },
  {
    id: 'search',
    label: 'search',
    auxiliaryData: {description: 'Search the web or documents'},
  },
  {
    id: 'code',
    label: 'code',
    auxiliaryData: {description: 'Generate or explain code'},
  },
  {
    id: 'help',
    label: 'help',
    auxiliaryData: {description: 'Show available commands'},
  },
];

const mentionSource = createStaticSource(MENTION_ITEMS);
const commandSource = createStaticSource(COMMAND_ITEMS);

const mentionTrigger: XDSChatComposerTrigger = {
  character: '@',
  searchSource: mentionSource,
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

const composerTriggers = [mentionTrigger, commandTrigger];

// ============= MESSAGE TYPES =============

type ChatMessage =
  | {
      id: number;
      role: 'user';
      text: string;
      attachments?: string[];
      sentAt: Date;
    }
  | {id: number; role: 'assistant'; text: string; isStreaming?: boolean}
  | {id: number; role: 'system'; text: string};

const SIMULATED_RESPONSE =
  'Thanks for your message! I’m looking into this now.\n\nHere’s what I found so far:\n\n1. **First**, I reviewed the relevant context from the attached files\n2. **Next**, I cross-referenced with the latest documentation\n3. **Finally**, I have a few recommendations\n\nLet me know if you’d like me to dive deeper into any of these areas, or if you have follow-up questions.';

// ============= SIDENAV =============

// ============= MAIN COMPONENT =============

export default function AIChatTemplate() {
  const [view, setView] = useState<'landing' | 'chat'>('landing');
  const [mode, setMode] = useState<string | null>('auto');
  const [category, setCategory] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<string[]>([
    'project_brief.pdf',
    'wireframes_v2.fig',
    'api_spec.yaml',
    'user_research.csv',
    'brand_guidelines.pdf',
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerInputRef = useRef<XDSChatComposerInputHandle>(null);
  const shouldFocusComposerRef = useRef(false);
  const streamRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const dictation = useXDSChatDictation({inputRef: composerInputRef});
  const activeMode = MODE_OPTIONS.find(m => m.key === mode) ?? MODE_OPTIONS[0];
  const suggestions = category ? CATEGORY_SUGGESTIONS[category] : null;

  // ---------------------------------------------------------------------------
  // Streaming
  // ---------------------------------------------------------------------------

  const streamResponse = useCallback((responseText: string) => {
    const msgId = Date.now();
    setIsStreaming(true);
    setMessages(prev => [
      ...prev,
      {id: msgId, role: 'assistant', text: '', isStreaming: true},
    ]);

    let i = 0;
    streamRef.current = setInterval(() => {
      i += 2 + Math.floor(Math.random() * 4);
      if (i >= responseText.length) {
        clearInterval(streamRef.current);
        setMessages(prev =>
          prev.map(m =>
            m.id === msgId ? {...m, text: responseText, isStreaming: false} : m,
          ),
        );
        setIsStreaming(false);
        return;
      }
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId ? {...m, text: responseText.slice(0, i)} : m,
        ),
      );
    }, 30);
  }, []);

  const handleStop = useCallback(() => {
    clearInterval(streamRef.current);
    setIsStreaming(false);
    setMessages(prev =>
      prev.map(m =>
        m.role === 'assistant' && m.isStreaming
          ? {...m, isStreaming: false}
          : m,
      ),
    );
  }, []);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(
    (value: string) => {
      if (!value.trim()) {
        return;
      }

      const userMsg: ChatMessage = {
        id: Date.now(),
        role: 'user',
        text: value,
        attachments: attachments.length > 0 ? [...attachments] : undefined,
        sentAt: new Date(),
      };

      if (view === 'landing') {
        setMessages([
          {id: userMsg.id - 1, role: 'system', text: 'Today'},
          userMsg,
        ]);
        setAttachments([]);
        setView('chat');
        setTimeout(() => streamResponse(SIMULATED_RESPONSE), 600);
      } else {
        setMessages(prev => [...prev, userMsg]);
        setTimeout(() => streamResponse(SIMULATED_RESPONSE), 600);
      }
    },
    [view, attachments, streamResponse],
  );

  const replaceWithSuggestion = (prompt: string) => {
    const input = composerInputRef.current;
    if (!input) {
      return;
    }
    input.focus();
    // Select all existing content so insertText replaces it
    const sel = window.getSelection();
    if (sel && document.activeElement) {
      sel.selectAllChildren(document.activeElement);
    }
    input.insertText(prompt);
    // Dispatch input event to trigger emitChange and clear placeholder
    document.activeElement?.dispatchEvent(new Event('input', {bubbles: true}));
  };

  // ---------------------------------------------------------------------------
  // Composer (shared between landing and chat views)
  // ---------------------------------------------------------------------------

  const insertMentionToken = (item: (typeof MENTION_ITEMS)[number]) => {
    composerInputRef.current?.focus();
    // Move cursor to end so token is appended
    const sel = window.getSelection();
    if (sel && document.activeElement) {
      sel.selectAllChildren(document.activeElement);
      sel.collapseToEnd();
    }
    composerInputRef.current?.insertToken({
      value: `@${item.id}`,
      label: item.label,
      variant: 'blue',
    });
    document.activeElement?.dispatchEvent(new Event('input', {bubbles: true}));
  };

  const insertModeToken = (label: string) => {
    composerInputRef.current?.focus();
    composerInputRef.current?.insertToken({
      value: label,
      label,
      variant: 'orange',
    });
    // Dispatch input event to trigger emitChange and clear placeholder
    document.activeElement?.dispatchEvent(new Event('input', {bubbles: true}));
  };

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      multiple
      style={{display: 'none'}}
      onChange={e => {
        const files = Array.from(e.target.files ?? []);
        setAttachments(prev => [...prev, ...files.map(f => f.name)]);
        e.target.value = '';
      }}
    />
  );

  const renderComposer = ({
    inputMinHeight,
    extraFooterActions = null,
  }: {
    inputMinHeight: string;
    extraFooterActions?: React.ReactNode;
  }) => (
    <XDSChatComposer
      onSubmit={handleSubmit}
      onStop={handleStop}
      isStopShown={isStreaming}
      placeholder="Ask anything"
      input={
        <XDSChatComposerInput
          handleRef={composerInputRef}
          triggers={composerTriggers}
          style={{minHeight: inputMinHeight}}
        />
      }
      drawer={
        attachments.length > 0 ? (
          <XDSChatComposerDrawer count={attachments.length}>
            {attachments.map(name => (
              <XDSToken
                key={name}
                label={name}
                onRemove={() =>
                  setAttachments(prev => prev.filter(n => n !== name))
                }
              />
            ))}
          </XDSChatComposerDrawer>
        ) : undefined
      }
      headerActions={
        <>
          <XDSDropdownMenu
            button={{
              label: 'Reference',
              variant: 'ghost',
              size: 'sm',
              icon: <XDSIcon icon={AtSymbolIcon} size="sm" />,
              isIconOnly: true,
            }}
            hasChevron={false}
            menuWidth={240}>
            {MENTION_ITEMS.map(item => (
              <XDSDropdownMenuItem
                key={item.id}
                label={item.label}
                description={item.auxiliaryData?.role}
                onClick={() => insertMentionToken(item)}
              />
            ))}
          </XDSDropdownMenu>
          <XDSButton
            label="Attach"
            variant="ghost"
            size="sm"
            icon={<XDSIcon icon={PaperClipIcon} size="sm" />}
            isIconOnly
            onClick={() => fileInputRef.current?.click()}
          />
        </>
      }
      footerActions={
        <>
          <XDSDropdownMenu
            button={{
              label: activeMode.label,
              variant: 'ghost',
              size: 'md',
              icon: <XDSIcon icon={activeMode.icon} size="sm" />,
              children: activeMode.label,
            }}
            menuWidth={200}
            isMenuOpen={isModeMenuOpen}
            onOpenChange={(isOpen: boolean) => {
              setIsModeMenuOpen(isOpen);
              if (!isOpen && shouldFocusComposerRef.current) {
                shouldFocusComposerRef.current = false;
                // Delay focus until after menu restores focus to its trigger button
                setTimeout(() => {
                  composerInputRef.current?.focus();
                }, 50);
              }
            }}
            items={MODE_OPTIONS.flatMap(opt => {
              const item = {
                label: opt.label,
                icon: opt.icon,
                onClick: () => {
                  const tokenLabel = TOKEN_MODES[opt.key];
                  if (tokenLabel) {
                    insertModeToken(tokenLabel);
                    shouldFocusComposerRef.current = true;
                  } else {
                    setMode(opt.key);
                  }
                },
              };
              return opt.key === 'sensitive'
                ? [{type: 'divider' as const}, item]
                : [item];
            })}
          />
          {extraFooterActions}
        </>
      }
      sendActions={<XDSChatDictationButton dictation={dictation} />}
    />
  );

  // ---------------------------------------------------------------------------
  // Chat view
  // ---------------------------------------------------------------------------

  if (view === 'chat') {
    return (
      <XDSLayout
        height="fill"
        content={
          <XDSLayoutContent padding={0}>
            <XDSChatLayout
              style={{height: '100%'}}
              composer={
                <>
                  {fileInput}
                  {renderComposer({inputMinHeight: '44px'})}
                </>
              }>
              <XDSChatMessageList>
                {messages.map(msg => {
                  if (msg.role === 'system') {
                    return (
                      <XDSChatSystemMessage key={msg.id} variant="divider">
                        {msg.text}
                      </XDSChatSystemMessage>
                    );
                  }
                  if (msg.role === 'user') {
                    return (
                      <XDSChatMessage key={msg.id} sender="user">
                        {msg.attachments && msg.attachments.length > 0 && (
                          <XDSHStack gap={1} style={{flexWrap: 'wrap'}}>
                            {msg.attachments.map(f => (
                              <XDSToken key={f} label={f} />
                            ))}
                          </XDSHStack>
                        )}
                        <XDSChatMessageBubble
                          metadata={
                            <XDSChatMessageMetadata
                              timestamp={
                                <XDSTimestamp
                                  value={msg.sentAt.getTime()}
                                  format="time"
                                />
                              }
                            />
                          }>
                          {msg.text}
                        </XDSChatMessageBubble>
                      </XDSChatMessage>
                    );
                  }
                  return (
                    <XDSChatMessage key={msg.id} sender="assistant">
                      <XDSMarkdown density="compact">{msg.text}</XDSMarkdown>
                      {!msg.isStreaming && msg.text && (
                        <XDSChatMessageMetadata
                          timestamp={
                            <XDSTimestamp value={msg.id} format="time" />
                          }
                        />
                      )}
                    </XDSChatMessage>
                  );
                })}
              </XDSChatMessageList>
            </XDSChatLayout>
          </XDSLayoutContent>
        }
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Landing view
  // ---------------------------------------------------------------------------

  return (
    <XDSLayout
      height="fill"
      contentWidth={720}
      padding={6}
      content={
        <XDSLayoutContent>
          <XDSVStack gap={8} vAlign="center" style={{minHeight: '100%'}}>
            {/* Greeting */}
            <XDSVStack gap={1}>
              <XDSHStack gap={2} vAlign="center">
                <XDSIcon icon={SparklesIcon} size="md" color="accent" />
                <XDSText type="large" as="h2">
                  Hi, Andrew
                </XDSText>
              </XDSHStack>
              <XDSText type="display-2" as="h1">
                Where should we start?
              </XDSText>
            </XDSVStack>

            {/* Composer */}
            {fileInput}
            {renderComposer({
              inputMinHeight: '84px',
              extraFooterActions: (
                <XDSDropdownMenu
                  button={{
                    label: 'Settings',
                    variant: 'ghost',
                    size: 'md',
                    icon: <XDSIcon icon={Cog6ToothIcon} size="sm" />,
                    children: 'Settings',
                  }}
                  menuWidth={200}
                  items={[
                    {label: 'Preferences', onClick: () => {}},
                    {label: 'Keyboard shortcuts', onClick: () => {}},
                    {label: 'About', onClick: () => {}},
                  ]}
                />
              ),
            })}

            {/* Category toggle buttons */}
            <XDSVStack gap={6} style={{paddingInline: 'var(--spacing-3)'}}>
              <XDSToggleButtonGroup
                label="Category"
                value={category}
                onChange={setCategory}
                size="lg">
                {CATEGORIES.map(cat => (
                  <XDSToggleButton
                    key={cat.key}
                    value={cat.key}
                    label={cat.label}
                    icon={<XDSIcon icon={cat.icon} size="sm" />}
                  />
                ))}
              </XDSToggleButtonGroup>

              {/* Suggestion cards */}
              {suggestions && (
                <XDSGrid columns={{minWidth: 280}} gap={3}>
                  {suggestions.map(suggestion => (
                    <XDSCard
                      variant="muted"
                      key={suggestion.heading}
                      padding={3}
                      style={{cursor: 'pointer'}}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        replaceWithSuggestion(suggestion.prompt);
                        setMode(category);
                      }}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          replaceWithSuggestion(suggestion.prompt);
                          setMode(category);
                        }
                      }}>
                      <XDSVStack gap={0.5}>
                        <XDSHeading level={4}>{suggestion.heading}</XDSHeading>
                        <XDSText type="body" color="secondary" size="xsm">
                          {suggestion.body}
                        </XDSText>
                      </XDSVStack>
                    </XDSCard>
                  ))}
                </XDSGrid>
              )}
            </XDSVStack>
          </XDSVStack>
        </XDSLayoutContent>
      }
    />
  );
}
