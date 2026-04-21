'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSTheme, defineTheme} from '@xds/core/theme';
import type {ThemeMode} from '@xds/core/theme';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSDivider} from '@xds/core/Divider';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';

const naviTheme = defineTheme({
  name: 'navi',
  typography: {scale: {base: 14, ratio: 1.2}},
  motion: {fast: 150, medium: 350, slow: 800, ratio: 0.75},
  radius: {base: 8, multiplier: 1},
  tokens: {
    '--color-accent': 'light-dark(#171717, #ededed)',
    '--color-accent-muted':
      'light-dark(rgba(0,0,0,0.06), rgba(255,255,255,0.1))',
    '--color-on-accent': 'light-dark(#fafafa, #171717)',
    '--color-neutral': 'light-dark(rgba(0,0,0,0.06), rgba(255,255,255,0.14))',
    '--color-background-body': 'light-dark(#ffffff, #121212)',
    '--color-background-surface': 'light-dark(#ffffff, #121212)',
    '--color-background-card': 'light-dark(#ffffff, #121212)',
    '--color-background-popover': 'light-dark(#ffffff, #1a1a1a)',
    '--color-background-muted':
      'light-dark(rgba(0,0,0,0.04), rgba(255,255,255,0.06))',
    '--color-background-inverted': 'light-dark(#171717, #ededed)',
    '--color-overlay': 'light-dark(rgba(0,0,0,0.15), rgba(0,0,0,0.6))',
    '--color-overlay-hover':
      'light-dark(rgba(0,0,0,0.04), rgba(255,255,255,0.05))',
    '--color-overlay-pressed':
      'light-dark(rgba(0,0,0,0.08), rgba(255,255,255,0.1))',
    '--color-text-primary': 'light-dark(#141414, #ededed)',
    '--color-text-secondary': 'light-dark(#737373, #8c8c8c)',
    '--color-text-disabled': 'light-dark(#a3a3a3, #525252)',
    '--color-text-accent': 'light-dark(#171717, #ededed)',
    '--color-on-dark': 'light-dark(#ffffff, #ffffff)',
    '--color-on-light': 'light-dark(#000000, #000000)',
    '--color-icon-primary': 'light-dark(#141414, #ededed)',
    '--color-icon-secondary': 'light-dark(#737373, #8c8c8c)',
    '--color-icon-accent': 'light-dark(#171717, #ededed)',
    '--color-icon-disabled': 'light-dark(#a3a3a3, #525252)',
    '--color-border': 'light-dark(rgba(0,0,0,0.08), rgba(255,255,255,0.08))',
    '--color-border-emphasized': 'light-dark(#d4d4d4, #333333)',
    '--color-skeleton': 'light-dark(#d4d4d4, #404040)',
    '--color-shadow': 'light-dark(rgba(0,0,0,0.06), rgba(0,0,0,0.3))',
    '--color-tint-hover': 'light-dark(black, white)',
  },
  components: {
    card: {
      base: {
        borderColor: 'light-dark(rgba(0,0,0,0.08), rgba(255,255,255,0.08))',
        backgroundColor: 'light-dark(#ffffff, #121212)',
      },
    },
    button: {
      'variant:secondary': {
        backgroundColor: 'light-dark(#ffffff, #121212)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'light-dark(rgba(0,0,0,0.12), rgba(255,255,255,0.12))',
      },
    },
  },
});

const SESSIONS = [
  {id: '1', title: 'React performance tips', time: '2 min ago', active: true},
  {id: '2', title: 'SQL query optimization', time: '1 hour ago', active: false},
  {
    id: '3',
    title: 'TypeScript generics help',
    time: '3 hours ago',
    active: false,
  },
  {id: '4', title: 'CSS Grid vs Flexbox', time: 'Yesterday', active: false},
  {id: '5', title: 'Python data pipeline', time: 'Yesterday', active: false},
  {id: '6', title: 'GraphQL schema design', time: '2 days ago', active: false},
];

const MESSAGES: Array<{
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'code' | 'list';
}> = [
  {
    role: 'user',
    content:
      'How do I memoize a component in React to avoid unnecessary re-renders?',
  },
  {
    role: 'assistant',
    content:
      "There are a few ways to optimize re-renders in React. The most common approach is using `React.memo()` for functional components. Here's an example:",
  },
  {
    role: 'assistant',
    content: `import React, { memo } from 'react';

interface Props {
  name: string;
  count: number;
}

const ExpensiveList = memo(function ExpensiveList({ name, count }: Props) {
  const items = Array.from({ length: count }, (_, i) => (
    <li key={i}>{name} — item {i + 1}</li>
  ));

  return <ul>{items}</ul>;
});`,
    type: 'code',
  },
  {
    role: 'assistant',
    content:
      'Here are the key strategies for preventing unnecessary re-renders:',
  },
  {
    role: 'assistant',
    content: `1. **React.memo()** — wraps a component so it only re-renders when its props change (shallow comparison by default)
2. **useMemo()** — memoizes expensive computed values inside a component
3. **useCallback()** — memoizes callback functions to maintain referential equality
4. **Lifting state down** — move state closer to where it's used so fewer components re-render`,
    type: 'list',
  },
  {
    role: 'assistant',
    content:
      "Keep in mind that `React.memo` uses shallow comparison. If you pass objects or arrays as props, you'll need to ensure they maintain referential equality using `useMemo` or `useCallback`. Premature optimization can add complexity — only memoize when you've measured a real performance issue.",
  },
  {
    role: 'user',
    content:
      'What about using `useMemo` vs `useCallback`? When should I pick one over the other?',
  },
  {
    role: 'assistant',
    content:
      'The difference is simple: `useMemo` memoizes a **value**, while `useCallback` memoizes a **function**. In fact, `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`. Use `useMemo` when you have an expensive computation that produces a value, and `useCallback` when you need to pass a stable function reference to a child component wrapped in `React.memo`.',
  },
];

function CodeBlock({children}: {children: string}) {
  return (
    <div {...stylex.props(styles.codeBlock)}>
      <div {...stylex.props(styles.codeHeader)}>
        <XDSText type="supporting" color="secondary">
          tsx
        </XDSText>
        <XDSButton label="Copy" variant="ghost" size="sm" />
      </div>
      <pre {...stylex.props(styles.codePre)}>
        <code {...stylex.props(styles.codeText)}>{children}</code>
      </pre>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  type = 'text',
}: {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'code' | 'list';
}) {
  const isUser = role === 'user';

  if (type === 'code') {
    return (
      <div {...stylex.props(styles.messageRow, styles.messageRowAssistant)}>
        <div {...stylex.props(styles.messageBubble, styles.assistantBubble)}>
          <CodeBlock>{content}</CodeBlock>
        </div>
      </div>
    );
  }

  return (
    <div
      {...stylex.props(
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAssistant,
      )}>
      <div
        {...stylex.props(
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        )}>
        {type === 'list' ? (
          <div {...stylex.props(styles.listContent)}>
            {content.split('\n').map((line, i) => (
              <XDSText key={i} type="body">
                {line}
              </XDSText>
            ))}
          </div>
        ) : (
          <XDSText type="body">{content}</XDSText>
        )}
      </div>
    </div>
  );
}

export default function NaviThemePage() {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [searchValue, setSearchValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [activeSession, setActiveSession] = useState('1');

  return (
    <XDSTheme theme={naviTheme} mode={mode}>
      <div {...stylex.props(styles.root)}>
        {/* Sidebar */}
        <div {...stylex.props(styles.sidebar)}>
          <div {...stylex.props(styles.sidebarHeader)}>
            <XDSHStack gap={8} vAlign="center">
              <XDSHeading level={4}>Navi</XDSHeading>
              <XDSBadge label="AI" variant="info" />
            </XDSHStack>
            <XDSButton label="New chat" variant="secondary" size="sm" />
          </div>

          <div {...stylex.props(styles.sidebarSearch)}>
            <XDSTextInput
              label="Search"
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search conversations…"
            />
          </div>

          <div {...stylex.props(styles.sessionList)}>
            {SESSIONS.map(session => (
              <button
                key={session.id}
                {...stylex.props(
                  styles.sessionItem,
                  activeSession === session.id && styles.sessionItemActive,
                )}
                onClick={() => setActiveSession(session.id)}>
                <XDSText type="body" weight="bold">
                  {session.title}
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  {session.time}
                </XDSText>
              </button>
            ))}
          </div>

          <div {...stylex.props(styles.sidebarFooter)}>
            <XDSDivider />
            <div {...stylex.props(styles.modeToggle)}>
              <XDSSwitch
                label="Dark mode"
                value={mode === 'dark'}
                onChange={v => setMode(v ? 'dark' : 'light')}
              />
            </div>
          </div>
        </div>

        {/* Main area */}
        <div {...stylex.props(styles.main)}>
          {/* Header */}
          <div {...stylex.props(styles.header)}>
            <XDSHStack gap={3} vAlign="center">
              <XDSHeading level={5}>React performance tips</XDSHeading>
              <div {...stylex.props(styles.statusDot)} />
              <XDSText type="supporting" color="secondary">
                Online
              </XDSText>
            </XDSHStack>
            <XDSHStack gap={8} vAlign="center">
              <XDSAvatar name="You" size="small" />
              <XDSBadge label="GPT-4" />
            </XDSHStack>
          </div>

          {/* Chat area */}
          <div {...stylex.props(styles.chatArea)}>
            <div {...stylex.props(styles.messagesContainer)}>
              {MESSAGES.map((msg, i) => (
                <MessageBubble
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  type={msg.type}
                />
              ))}
            </div>
          </div>

          {/* Input bar */}
          <div {...stylex.props(styles.inputBar)}>
            <div {...stylex.props(styles.inputWrapper)}>
              <XDSTextInput
                label="Message"
                value={inputValue}
                onChange={setInputValue}
                placeholder="Ask anything…"
              />
              <XDSButton label="Send" variant="primary" size="md" />
            </div>
            <XDSText type="supporting" color="secondary">
              Navi may produce inaccurate information. Verify important details.
            </XDSText>
          </div>
        </div>
      </div>
    </XDSTheme>
  );
}

const SIDEBAR_WIDTH = 300;

const styles = stylex.create({
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    minWidth: SIDEBAR_WIDTH,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 16px 8px',
  },
  sidebarSearch: {
    padding: '8px 16px',
  },
  sessionList: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px',
  },
  sessionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 150ms',
    ':hover': {
      backgroundColor: 'var(--color-overlay-hover)',
    },
  },
  sessionItemActive: {
    backgroundColor: 'var(--color-accent-muted)',
  },
  sidebarFooter: {
    padding: '8px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  modeToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderBottom: '1px solid var(--color-border)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#22c55e',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 0',
  },
  messagesContainer: {
    maxWidth: 768,
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  messageRow: {
    display: 'flex',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '10px 16px',
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'var(--color-background-muted)',
    borderBottomLeftRadius: 4,
  },
  listContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  codeBlock: {
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
  },
  codeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  codePre: {
    margin: 0,
    padding: 12,
    overflowX: 'auto',
    backgroundColor: 'var(--color-background-popover)',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-text-primary)',
  },
  inputBar: {
    padding: '12px 24px 16px',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
    width: '100%',
    maxWidth: 768,
  },
});
