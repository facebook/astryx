// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';

import {
  XDSHStack,
  XDSVStack,
  XDSLayout,
  XDSLayoutContent,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {
  XDSChatComposer,
  XDSChatComposerInput,
  XDSChatLayout,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {useXDSResizable, XDSResizeHandle} from '@xds/core/Resizable';

import {
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  AtSymbolIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';

// ============= STYLES =============

const styles = stylex.create({
  artifactPanel: {
    flex: 1,
    overflow: 'hidden',
  },
  artifactHeader: {
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
    borderBottom: '1px solid',
    borderBottomColor: colorVars['--color-border'],
  },
  artifactContent: {
    flex: 1,
    overflowY: 'auto',
    padding: spacingVars['--spacing-8'],
  },
  articleBody: {
    maxWidth: 720,
    marginInline: 'auto',
  },
  tabRow: {
    paddingInline: spacingVars['--spacing-4'],
    borderBottom: '1px solid',
    borderBottomColor: colorVars['--color-border'],
  },
});

// ============= ARTIFACT CONTENT =============

const ARTIFACT_TITLE = 'Getting Started with Design Systems';

const ARTIFACT_CONTENT = `## Introduction

A design system is a collection of reusable components, guided by clear standards, that can be assembled together to build any number of applications. It serves as the single source of truth for an organization\u2019s UI patterns and ensures consistency across products.

## Core Principles

### 1. Consistency

Every component should look and behave the same way regardless of context. Users build mental models around familiar patterns \u2014 breaking those patterns creates friction.

### 2. Composability

Components should be designed as building blocks. A good design system provides primitives that can be composed into more complex interfaces without introducing custom overrides.

### 3. Accessibility

Accessibility isn\u2019t an afterthought \u2014 it\u2019s a foundational requirement. Every component must support keyboard navigation, screen readers, and sufficient color contrast ratios.

## Component Architecture

The foundation of any design system is its component architecture. Components should be:

- **Self-contained** \u2014 encapsulating their own styles, logic, and documentation
- **Configurable** \u2014 exposing a clear prop API for customization
- **Themeable** \u2014 respecting design tokens for colors, spacing, and typography

## Token System

Design tokens are the atomic values that define visual properties:

| Category | Examples |
|----------|----------|
| Color | Background, text, border, accent |
| Spacing | Margins, padding, gaps |
| Typography | Font size, weight, line height |
| Shape | Border radius, shadows |

## Next Steps

1. Audit your existing UI for recurring patterns
2. Define your token vocabulary
3. Build foundational components (Button, Input, Card)
4. Document usage guidelines and examples
5. Establish a contribution workflow for your team`;

// ============= MAIN COMPONENT =============

export default function AIChatArtifactTemplate() {
  const [artifactTab, setArtifactTab] = useState('document');
  const [composerMode, setComposerMode] = useState('ask');
  const chatResize = useXDSResizable({
    defaultSize: 380,
    minSizePx: 280,
    maxSizePx: 520,
    autoSaveId: 'ai-chat-artifact-panel',
  });

  return (
    <XDSLayout
      height="fill"
      content={
        <XDSLayoutContent padding={0}>
          <XDSHStack height="100%">
            {/* Chat Panel */}
            <XDSVStack height="100%" style={{width: chatResize.size}}>
              <XDSChatLayout
                style={{height: '100%'}}
                composer={
                  <XDSChatComposer
                    onSubmit={() => {}}
                    placeholder={
                      composerMode === 'ask'
                        ? 'Ask anything...'
                        : 'Describe your edit...'
                    }
                    input={<XDSChatComposerInput />}
                    headerActions={
                      <>
                        <XDSButton
                          label="Mention"
                          variant="ghost"
                          size="sm"
                          icon={<XDSIcon icon={AtSymbolIcon} size="sm" />}
                          isIconOnly
                        />
                        <XDSButton
                          label="Attach"
                          variant="ghost"
                          size="sm"
                          icon={<XDSIcon icon={PaperClipIcon} size="sm" />}
                          isIconOnly
                        />
                      </>
                    }
                    footerActions={
                      <XDSDropdownMenu
                        button={{
                          label: composerMode === 'ask' ? 'Ask' : 'Edit',
                          variant: 'ghost',
                          size: 'sm',
                        }}
                        items={[
                          {
                            label: 'Ask',
                            onClick: () => setComposerMode('ask'),
                          },
                          {
                            label: 'Edit',
                            onClick: () => setComposerMode('edit'),
                          },
                        ]}
                      />
                    }
                  />
                }>
                <XDSChatMessageList>
                  <XDSChatSystemMessage variant="divider">
                    Today
                  </XDSChatSystemMessage>

                  {/* User request */}
                  <XDSChatMessage sender="user">
                    <XDSChatMessageBubble
                      metadata={
                        <XDSChatMessageMetadata
                          timestamp={
                            <XDSTimestamp
                              value="2026-05-12T14:30:00"
                              format="time"
                            />
                          }
                        />
                      }>
                      Write me a guide about getting started with design
                      systems. Cover the core principles, component
                      architecture, and token systems.
                    </XDSChatMessageBubble>
                  </XDSChatMessage>

                  {/* Assistant response */}
                  <XDSChatMessage
                    sender="assistant"
                    avatar={<XDSAvatar name="AI" size="small" />}>
                    <XDSChatMessageBubble variant="ghost" name="AI">
                      <XDSMarkdown density="compact">
                        {`I've created a comprehensive guide on design systems. It covers the core principles of consistency, composability, and accessibility, along with sections on component architecture and the token system.\n\nThe document is displayed in the artifact panel \u2014 you can review it there. Want me to expand any section or adjust the tone?`}
                      </XDSMarkdown>
                    </XDSChatMessageBubble>
                    <XDSChatMessageMetadata
                      timestamp={
                        <XDSTimestamp
                          value="2026-05-12T14:30:45"
                          format="time"
                        />
                      }
                    />
                  </XDSChatMessage>

                  {/* User follow-up */}
                  <XDSChatMessage sender="user">
                    <XDSChatMessageBubble
                      metadata={
                        <XDSChatMessageMetadata
                          timestamp={
                            <XDSTimestamp
                              value="2026-05-12T14:32:00"
                              format="time"
                            />
                          }
                        />
                      }>
                      This is great. Can you add a section about next steps at
                      the end?
                    </XDSChatMessageBubble>
                  </XDSChatMessage>

                  {/* Assistant confirmation */}
                  <XDSChatMessage
                    sender="assistant"
                    avatar={<XDSAvatar name="AI" size="small" />}>
                    <XDSChatMessageBubble variant="ghost">
                      <XDSMarkdown density="compact">
                        {`Done! I've added a "Next Steps" section with actionable items for getting started. The artifact has been updated \u2014 you can see the changes in the panel.`}
                      </XDSMarkdown>
                    </XDSChatMessageBubble>
                    <XDSChatMessageMetadata
                      timestamp={
                        <XDSTimestamp
                          value="2026-05-12T14:32:30"
                          format="time"
                        />
                      }
                    />
                  </XDSChatMessage>
                </XDSChatMessageList>
              </XDSChatLayout>
            </XDSVStack>

            {/* Resize Handle */}
            <XDSResizeHandle
              direction="horizontal"
              resizable={chatResize.props}
              hasDivider
              label="Resize chat panel"
            />

            {/* Artifact Panel */}
            <XDSVStack height="100%" xstyle={styles.artifactPanel}>
              {/* Artifact Header */}
              <XDSHStack
                gap={3}
                vAlign="center"
                hAlign="between"
                xstyle={styles.artifactHeader}>
                <XDSHStack gap={3} vAlign="center">
                  <XDSIcon
                    icon={DocumentTextIcon}
                    size="sm"
                    color="secondary"
                  />
                  <XDSVStack gap={0}>
                    <XDSText type="label" weight="semibold">
                      {ARTIFACT_TITLE}
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      Document \u00b7 Updated just now
                    </XDSText>
                  </XDSVStack>
                </XDSHStack>

                <XDSHStack gap={2} vAlign="center">
                  <XDSDropdownMenu
                    button={{
                      label: 'v2',
                      variant: 'ghost',
                      size: 'sm',
                    }}
                    items={[{label: 'v2 (current)'}, {label: 'v1'}]}
                  />
                  <XDSButton
                    label="Copy"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon={ClipboardDocumentIcon} size="sm" />}
                    isIconOnly
                  />
                  <XDSButton
                    label="Share"
                    variant="ghost"
                    size="sm"
                    icon={<XDSIcon icon={ShareIcon} size="sm" />}
                    isIconOnly
                  />
                </XDSHStack>
              </XDSHStack>

              {/* Artifact Tabs */}
              <XDSHStack vAlign="center" xstyle={styles.tabRow}>
                <XDSTabList value={artifactTab} onChange={setArtifactTab}>
                  <XDSTab value="document" label="Preview" />
                  <XDSTab value="markdown" label="Markdown" />
                </XDSTabList>
              </XDSHStack>

              {/* Artifact Body */}
              <div {...stylex.props(styles.artifactContent)}>
                <XDSVStack gap={2} xstyle={styles.articleBody}>
                  {artifactTab === 'document' ? (
                    <>
                      <XDSHeading level={1}>{ARTIFACT_TITLE}</XDSHeading>
                      <XDSMarkdown>{ARTIFACT_CONTENT}</XDSMarkdown>
                    </>
                  ) : (
                    <XDSText type="code">
                      {`# ${ARTIFACT_TITLE}\n${ARTIFACT_CONTENT}`}
                    </XDSText>
                  )}
                </XDSVStack>
              </div>
            </XDSVStack>
          </XDSHStack>
        </XDSLayoutContent>
      }
    />
  );
}
