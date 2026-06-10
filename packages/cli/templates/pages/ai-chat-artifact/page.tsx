// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@xds/core/theme/tokens.stylex';

import {
  XDSHStack,
  XDSVStack,
  XDSStackItem,
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
import {XDSCard} from '@xds/core/Card';
import {XDSClickableCard} from '@xds/core/ClickableCard';
import {XDSSection} from '@xds/core/Section';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSButton} from '@xds/core/Button';
import {XDSToggleButton} from '@xds/core/ToggleButton';
import {XDSIcon} from '@xds/core/Icon';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSToolbar} from '@xds/core/Toolbar';
import {useXDSResizable, XDSResizeHandle} from '@xds/core/Resizable';

import {
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  AtSymbolIcon,
  PaperClipIcon,
  CodeBracketIcon,
  XMarkIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

// Collapse the split-pane to a single chat column at/below this width. Single
// source of truth shared by the CSS container query and the JS check in
// openArtifact, so the two can't drift. A container query (not a viewport one)
// so it reacts to the width the template is actually given, e.g. inside a
// constrained preview pane.
const MOBILE_MAX_WIDTH = 767;
const MOBILE = `@container artifact (max-width: ${MOBILE_MAX_WIDTH}px)`;

const styles = stylex.create({
  root: {
    height: '100dvh',
    width: '100%',
    containerType: 'inline-size',
    containerName: 'artifact',
  },
  artifactPanel: {
    flex: 1,
    overflow: 'hidden',
    flexDirection: 'column',
    display: {
      default: 'flex',
      [MOBILE]: 'none',
    },
  },
  resizeHandle: {
    display: {
      default: 'flex',
      [MOBILE]: 'none',
    },
  },
  // Only the top margin remains here — the width cap uses the maxWidth prop.
  artifactCard: {
    marginBlockStart: spacingVars['--spacing-2'],
  },
  artifactScroll: {
    flex: 1,
    overflowY: 'auto',
  },
  chatLayoutFill: {
    height: '100%',
  },
  articleBody: {
    maxWidth: 720,
    marginInline: 'auto',
  },
});

// Width comes from the resize handle on desktop and forces full-width on
// mobile. A dynamic style (not inline) so the MOBILE override can win.
const dynamicStyles = stylex.create({
  chatPanelWidth: (size: number | string) => ({
    width: {
      default: typeof size === 'number' ? `${size}px` : size,
      [MOBILE]: '100%',
    },
    flexShrink: {
      default: 0,
      [MOBILE]: 1,
    },
  }),
});

const chatFullWidth = stylex.create({
  fill: {
    flex: 1,
    width: '100%',
    minWidth: 0,
  },
});

// ============= ARTIFACT CONTENT =============

const ARTIFACT_TITLE = 'Getting Started with Design Systems';

const ARTIFACT_SUBTITLE = 'Document \u00b7 Updated just now';

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

// ============= ARTIFACT SUBVIEWS =============

/** Toggle between the formatted document and its raw Markdown source. */
function MarkdownToggle({
  showMarkdown,
  onToggleMarkdown,
}: {
  showMarkdown: boolean;
  onToggleMarkdown: (next: boolean) => void;
}) {
  return (
    <XDSToggleButton
      label="Toggle markdown view"
      size="sm"
      isIconOnly
      icon={<XDSIcon icon={CodeBracketIcon} size="sm" />}
      isPressed={showMarkdown}
      onPressedChange={onToggleMarkdown}
    />
  );
}

/**
 * Artifact header actions: version menu, markdown toggle, copy, share. Pass
 * `onClose` to append a close button (desktop only; the mobile dialog has its
 * own). Returns a fragment so each control is a direct child of the toolbar's
 * endContent slot, which the toolbar relies on for gap and edge alignment.
 */
function ArtifactActions({
  showMarkdown,
  onToggleMarkdown,
  onClose,
}: {
  showMarkdown: boolean;
  onToggleMarkdown: (next: boolean) => void;
  onClose?: () => void;
}) {
  return (
    <>
      <XDSDropdownMenu
        button={{
          label: 'v2',
          variant: 'ghost',
          size: 'sm',
        }}
        items={[{label: 'v2 (current)'}, {label: 'v1'}]}
      />
      <MarkdownToggle
        showMarkdown={showMarkdown}
        onToggleMarkdown={onToggleMarkdown}
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
      {onClose != null && (
        <XDSButton
          label="Close document"
          variant="ghost"
          size="sm"
          icon={<XDSIcon icon={XMarkIcon} size="sm" />}
          isIconOnly
          onClick={onClose}
        />
      )}
    </>
  );
}

/**
 * Mobile variant of the artifact actions: the markdown toggle stays inline and
 * the secondary actions (version, copy, share) collapse into an overflow menu.
 */
function MobileArtifactActions({
  showMarkdown,
  onToggleMarkdown,
}: {
  showMarkdown: boolean;
  onToggleMarkdown: (next: boolean) => void;
}) {
  return (
    <XDSHStack gap={1} vAlign="center">
      <MarkdownToggle
        showMarkdown={showMarkdown}
        onToggleMarkdown={onToggleMarkdown}
      />
      <XDSMoreMenu
        label="Document actions"
        size="sm"
        items={[
          {
            type: 'section',
            title: 'Version',
            items: [
              {label: 'v2 (current)', onClick: () => {}},
              {label: 'v1', onClick: () => {}},
            ],
          },
          {type: 'divider'},
          {label: 'Copy', icon: ClipboardDocumentIcon},
          {label: 'Share', icon: ShareIcon},
        ]}
      />
    </XDSHStack>
  );
}

/** Scrollable artifact body — formatted document or raw markdown source. */
function ArtifactBody({showMarkdown}: {showMarkdown: boolean}) {
  return (
    <XDSSection variant="transparent" xstyle={styles.artifactScroll}>
      <XDSVStack gap={2} xstyle={styles.articleBody}>
        {showMarkdown ? (
          <XDSText type="code">
            {`# ${ARTIFACT_TITLE}\n${ARTIFACT_CONTENT}`}
          </XDSText>
        ) : (
          <>
            <XDSHeading level={1}>{ARTIFACT_TITLE}</XDSHeading>
            <XDSMarkdown>{ARTIFACT_CONTENT}</XDSMarkdown>
          </>
        )}
      </XDSVStack>
    </XDSSection>
  );
}

/** In-message clickable card that opens the artifact panel/dialog. */
function ArtifactCard({onOpen}: {onOpen: () => void}) {
  return (
    <XDSClickableCard
      label={`Open ${ARTIFACT_TITLE}`}
      onClick={onOpen}
      variant="muted"
      padding={3}
      maxWidth={360}
      xstyle={styles.artifactCard}>
      <XDSHStack gap={3} vAlign="center" width="100%">
        <XDSIcon icon={DocumentTextIcon} size="md" color="secondary" />
        <XDSStackItem size="fill">
          <XDSVStack gap={0}>
            <XDSText type="label" weight="semibold">
              {ARTIFACT_TITLE}
            </XDSText>
            <XDSText type="supporting" color="secondary">
              Document
            </XDSText>
          </XDSVStack>
        </XDSStackItem>
        <XDSIcon icon={ChevronRightIcon} size="sm" color="secondary" />
      </XDSHStack>
    </XDSClickableCard>
  );
}

// ============= MAIN COMPONENT =============

export default function AIChatArtifactTemplate() {
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [composerMode, setComposerMode] = useState('ask');
  // Mobile-only: the artifact opens as a full-screen dialog.
  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);
  // Desktop-only: whether the side panel is shown (closeable via its toolbar).
  const [isArtifactOpen, setIsArtifactOpen] = useState(true);
  const rootRef = useRef<HTMLElement>(null);
  const chatResize = useXDSResizable({
    defaultSize: 420,
    minSizePx: 360,
    maxSizePx: 720,
    autoSaveId: 'ai-chat-artifact-panel',
  });

  // Pick the artifact surface at click time: the layout collapse is a container
  // query, so measure the root (same MOBILE_MAX_WIDTH) rather than the viewport
  // to stay in sync.
  const openArtifact = () => {
    const width = rootRef.current?.offsetWidth ?? Infinity;
    if (width <= MOBILE_MAX_WIDTH) {
      setIsArtifactDialogOpen(true);
    } else {
      setIsArtifactOpen(true);
    }
  };

  return (
    <XDSVStack ref={rootRef} xstyle={styles.root}>
      <XDSLayout
        height="fill"
        content={
          <XDSLayoutContent padding={0}>
            <XDSHStack height="100%">
              {/* Chat panel — resizable on desktop, full-width on mobile. */}
              <XDSVStack
                height="100%"
                xstyle={
                  isArtifactOpen
                    ? dynamicStyles.chatPanelWidth(chatResize.size)
                    : chatFullWidth.fill
                }>
                <XDSChatLayout
                  xstyle={styles.chatLayoutFill}
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
                      <XDSChatMessageBubble variant="ghost">
                        <XDSMarkdown density="compact">
                          {`I've created a comprehensive guide on design systems. It covers the core principles of consistency, composability, and accessibility, along with sections on component architecture and the token system.\n\nOpen the document below to review it. Want me to expand any section or adjust the tone?`}
                        </XDSMarkdown>
                      </XDSChatMessageBubble>
                      <ArtifactCard onOpen={openArtifact} />
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

              {/* Desktop split-pane: resize handle + artifact panel. */}
              {isArtifactOpen && (
                <>
                  <XDSResizeHandle
                    direction="horizontal"
                    resizable={chatResize.props}
                    hasDivider
                    label="Resize chat panel"
                    xstyle={styles.resizeHandle}
                  />

                  {/* Toolbar-as-card-header: the card's padding context lets the
                    toolbar align with the section body below. */}
                  <XDSCard
                    variant="transparent"
                    height="100%"
                    xstyle={styles.artifactPanel}>
                    <XDSToolbar
                      label="Artifact actions"
                      dividers={['bottom']}
                      startContent={
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
                              {ARTIFACT_SUBTITLE}
                            </XDSText>
                          </XDSVStack>
                        </XDSHStack>
                      }
                      endContent={
                        <ArtifactActions
                          showMarkdown={showMarkdown}
                          onToggleMarkdown={setShowMarkdown}
                          onClose={() => setIsArtifactOpen(false)}
                        />
                      }
                    />

                    <ArtifactBody showMarkdown={showMarkdown} />
                  </XDSCard>
                </>
              )}
            </XDSHStack>
          </XDSLayoutContent>
        }
      />

      {/* Mobile artifact view — full-screen takeover via XDSDialog's
          `fullscreen` variant. */}
      <XDSDialog
        isOpen={isArtifactDialogOpen}
        onOpenChange={setIsArtifactDialogOpen}
        purpose="info"
        variant="fullscreen">
        <XDSLayout
          header={
            <XDSDialogHeader
              title={ARTIFACT_TITLE}
              subtitle={ARTIFACT_SUBTITLE}
              hasDivider
              onOpenChange={setIsArtifactDialogOpen}
              endContent={
                <MobileArtifactActions
                  showMarkdown={showMarkdown}
                  onToggleMarkdown={setShowMarkdown}
                />
              }
            />
          }
          content={
            // XDSLayoutContent establishes the bounded, scrollable region;
            // padding={0} since ArtifactBody's XDSSection supplies the inset.
            <XDSLayoutContent padding={0}>
              <ArtifactBody showMarkdown={showMarkdown} />
            </XDSLayoutContent>
          }
        />
      </XDSDialog>
    </XDSVStack>
  );
}
