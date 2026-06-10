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

// ============= STYLES =============

// Responsive breakpoint: below this width we collapse to a single
// full-width chat column and move the artifact into a full-screen dialog.
//
// This is a CONTAINER query (not a viewport media query) keyed off the
// template root's inline size — so the split-pane collapses based on the
// width actually given to the template (e.g. a constrained preview pane,
// an embedded panel, or a narrow column), not the browser viewport. A
// viewport media query mis-fires when the template is rendered in a
// container narrower than the viewport: the desktop split-pane would show
// with a fixed-width chat that crushes the artifact into a sliver.
// 768px keeps the split-pane at tablet-and-up container widths.
const MOBILE = '@container artifact (max-width: 767px)';

const styles = stylex.create({
  // Root wrapper — pins the template to the viewport height so the
  // inner XDSLayout's height="fill" has something concrete to fill
  // against. Templates render inside the sandbox preview iframe
  // whose <body> is auto-sized; without an explicit viewport-size
  // root, height:100% chains collapse to content height and the
  // chat/artifact panels don't fill the screen. 100dvh handles
  // mobile address-bar resizing correctly.
  root: {
    height: '100dvh',
    width: '100%',
    // Establish a container so the MOBILE breakpoint below resolves
    // against THIS element's width (the space the template is given),
    // not the browser viewport. Named 'artifact' to scope the query.
    containerType: 'inline-size',
    containerName: 'artifact',
  },
  artifactPanel: {
    flex: 1,
    overflow: 'hidden',
    // Column so the toolbar header stacks above the scrolling section body.
    flexDirection: 'column',
    // Hidden on phones — the artifact lives in a full-screen dialog there.
    display: {
      default: 'flex',
      [MOBILE]: 'none',
    },
  },
  // The resize handle only makes sense in the desktop split-pane.
  resizeHandle: {
    display: {
      default: 'flex',
      [MOBILE]: 'none',
    },
  },
  // In-message artifact card — a clickable reference to the document that
  // opens the artifact panel (desktop) or full-screen dialog (mobile). Sits
  // just below the assistant bubble that produced it. A maxWidth cap keeps it
  // from stretching arbitrarily wide; breathing room separates it from the
  // bubble above.
  //
  // NOTE: making this card span the full message column (to match the bubble
  // width) is NOT possible with plain component usage — XDSChatMessage's
  // custom-content slot is a flex column with align-items:flex-start and no
  // stretchable full-width context, so alignSelf:stretch / width:100% collapse
  // the card. Tracked as a component gap; see linked issues.
  artifactCard: {
    maxWidth: 360,
    marginBlockStart: spacingVars['--spacing-2'],
  },
  artifactScroll: {
    flex: 1,
    overflowY: 'auto',
  },
  // XDSChatLayout fills the chat column's height so its sticky composer docks
  // at the bottom. (xstyle rather than an inline style for consistency.)
  chatLayoutFill: {
    height: '100%',
  },
  // Caps prose line length for readability, but stays start-aligned so the
  // body text lines up with the XDSToolbar header above it. Centering this
  // (marginInline: 'auto') is what broke alignment: on panels wider than
  // ~752px the auto margins pushed the body inward while the full-bleed
  // toolbar header stayed at the card's inline padding, so the title and the
  // body no longer shared a left edge. marginInlineEnd: 'auto' keeps the cap
  // working (block shrinks to 720) while pinning the start edge to the inset.
  articleBody: {
    maxWidth: 720,
    // Center the document column within the panel. (This means at wide panel
    // widths the body's left edge no longer aligns with the full-bleed header
    // — an accepted tradeoff in favor of a centered, readable column.)
    marginInline: 'auto',
  },
});

// Chat panel width is driven by the resize handle on desktop, but must become
// full-width on phones. An inline `style` would win over a media query, so the
// width is applied via a dynamic StyleX style whose default is the dragged size
// and whose MOBILE value forces 100%.
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

// When the artifact panel is closed (desktop), the chat fills the whole row.
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

/**
 * The code view toggle — replaces the old Preview/Markdown tab pair. Pressed
 * (solid icon) when the raw Markdown source is showing. Shared by the desktop
 * toolbar and the mobile dialog header so both stay in sync.
 */
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
 * Full action cluster for the artifact header: version menu, code toggle,
 * copy, and share. Shared by the desktop toolbar and the mobile dialog header
 * so both expose the same actions. Pass `onClose` to append a close button
 * (desktop, which has no other close affordance); omit it in the mobile dialog
 * where XDSDialogHeader already renders a close button.
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
  // Returns a fragment (not a wrapping XDSHStack) so each control is a DIRECT
  // child of the toolbar's endContent slot. The toolbar applies its own gap
  // between slot children, and — critically — its edge compensation only fires
  // for a ghost button that is the slot's direct last child (it detects
  // `:has(> [data-xds-edge-comp]:last-child)`). A wrapper would hide the ghost
  // close button from that selector, so the close button wouldn't get the
  // negative-margin pull that optically aligns it to the inset.
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
 * Mobile artifact actions for the dialog header. The code/markdown toggle
 * stays an inline XDSToggleButton — identical to the desktop toolbar so its
 * pressed state behaves the same — while the secondary actions (version, copy,
 * share) collapse into a more-options overflow menu. The dialog's own close
 * button (via XDSDialogHeader's onOpenChange) sits after these.
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
          // Mirrors the desktop toolbar's secondary actions. The version
          // control is a dropdown (v2 / v1) on desktop; here it's a titled
          // section with the same selectable versions.
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

/**
 * Scrollable artifact body — formatted document or raw markdown source.
 * Rendered as an XDSSection (the page-region primitive) so, when placed inside
 * the artifact's XDSCard, it shares the card's inline padding context and lines
 * up with the XDSToolbar header above it. flex:1 + overflowY:auto make it the
 * scroll area within the panel/dialog.
 */
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

/**
 * In-message artifact reference — a clickable card showing the document
 * icon, title, and a "Document" label. Rendered inside the assistant
 * message that produced the artifact; clicking it opens the artifact panel
 * (desktop) or full-screen dialog (mobile), mirroring the "View document"
 * controls.
 */
function ArtifactCard({onOpen}: {onOpen: () => void}) {
  return (
    <XDSClickableCard
      label={`Open ${ARTIFACT_TITLE}`}
      onClick={onOpen}
      variant="muted"
      padding={3}
      xstyle={styles.artifactCard}>
      <XDSHStack gap={3} vAlign="center" width="100%">
        <XDSIcon icon={DocumentTextIcon} size="md" color="secondary" />
        {/* size="fill" makes the title block take the leftover space, pushing
            the chevron to the trailing edge — the XDS-native way to do this
            (vs. a manual flex:1 style). */}
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
  // Controls the mobile artifact dialog. On desktop the artifact is always
  // visible in the split-pane, so this only matters below the MOBILE breakpoint.
  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);
  // Desktop only: whether the artifact panel is shown. Closing it (via the X
  // in the artifact toolbar) collapses the panel + resize handle so the chat
  // expands to full width; a "View document" button in the chat header brings
  // it back. Starts open since the conversation just produced an artifact.
  const [isArtifactOpen, setIsArtifactOpen] = useState(true);
  // Measured at click time: full-screen dialog (mobile) vs side panel (desktop).
  const rootRef = useRef<HTMLElement>(null);
  const chatResize = useXDSResizable({
    defaultSize: 420,
    // Comfortable floor so message bubbles never get cramped — 280 let the
    // column squeeze the conversation. 360 keeps multi-line bubbles readable.
    minSizePx: 360,
    // Wide draggable range so the chat panel can grow substantially on desktop.
    // Only relevant >= 768px — below that the handle is hidden and the chat is
    // full-width (artifact lives in a dialog), so there is no conflict.
    maxSizePx: 720,
    autoSaveId: 'ai-chat-artifact-panel',
  });

  // Open the artifact from anywhere (in-message card, reopen button). The
  // artifact has two mutually-exclusive surfaces by breakpoint: a right-side
  // panel on desktop and a full-screen dialog on mobile. We pick the right
  // one at click time by measuring the template root's width — the layout
  // collapse is a CONTAINER query (keyed off this element, not the viewport),
  // so the viewport could disagree when the template is rendered in a
  // constrained pane. Measuring the actual container keeps the open surface
  // in sync with the layout. Runs only in event handlers (post-hydration),
  // so there's no SSR mismatch. Without this, opening on desktop would pop
  // the full-screen dialog over the side panel.
  const openArtifact = () => {
    const width = rootRef.current?.offsetWidth ?? 9999;
    if (width <= 767) {
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
              {/* Chat Panel — resizable width on desktop while the artifact is
                open; fills the row when the artifact is closed; full-width on
                mobile. */}
              <XDSVStack
                height="100%"
                xstyle={
                  isArtifactOpen
                    ? dynamicStyles.chatPanelWidth(chatResize.size)
                    : chatFullWidth.fill
                }>
                {/* No chat header / reopen bar. The artifact's only entry point
                  is the in-message ArtifactCard (which opens the side panel on
                  desktop or the full-screen dialog on mobile). */}
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
                      {/* In-message artifact reference — click to open the
                        document panel (desktop) or full-screen dialog
                        (mobile). */}
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

              {/* Resize handle + artifact panel — desktop split-pane. Hidden on
                phones (artifact opens as a full-screen dialog there), and
                removed entirely
                when the user closes the artifact on desktop so the chat fills
                the row. */}
              {isArtifactOpen && (
                <>
                  <XDSResizeHandle
                    direction="horizontal"
                    resizable={chatResize.props}
                    hasDivider
                    label="Resize chat panel"
                    xstyle={styles.resizeHandle}
                  />

                  {/* Canonical "toolbar as card header" composition (see the
                    ToolbarEdgeCompensation showcase): an XDSCard holds the
                    XDSToolbar header + an XDSSection body. The card's padding
                    context is what makes the toolbar's edge compensation align
                    its content with the section body below. transparent =
                    context without visible card chrome. */}
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

                    {/* Artifact Body */}
                    <ArtifactBody showMarkdown={showMarkdown} />
                  </XDSCard>
                </>
              )}
            </XDSHStack>
          </XDSLayoutContent>
        }
      />

      {/* Mobile artifact view — full-screen takeover. Uses XDSDialog's
          built-in `fullscreen` variant (fills the viewport, intended for
          document viewers) rather than custom CSS to reshape a standard
          centered dialog. Dismissed via the header close button, Escape, or
          backdrop (purpose="info"). */}
      <XDSDialog
        isOpen={isArtifactDialogOpen}
        onOpenChange={setIsArtifactDialogOpen}
        purpose="info"
        variant="fullscreen">
        {/* Canonical fullscreen-dialog structure: an XDSLayout whose header
            slot holds the XDSDialogHeader and whose content slot holds the
            document. ArtifactBody renders a VStack, so it needs XDSLayoutContent
            to establish the bounded, scrollable content region — without it the
            fullscreen dialog can't scroll on mobile/tablet. padding={0} because
            ArtifactBody's own XDSSection already supplies the document inset
            (matching the desktop split-pane, which also wraps it edge-to-edge). */}
        <XDSLayout
          header={
            <XDSDialogHeader
              title={ARTIFACT_TITLE}
              subtitle={ARTIFACT_SUBTITLE}
              hasDivider
              onOpenChange={setIsArtifactDialogOpen}
              endContent={
                /* All actions (version, markdown, copy, share) collapse into a
                   more-options menu so the narrow header shows only the menu +
                   the dialog's built-in close button (via onOpenChange). */
                <MobileArtifactActions
                  showMarkdown={showMarkdown}
                  onToggleMarkdown={setShowMarkdown}
                />
              }
            />
          }
          content={
            <XDSLayoutContent padding={0}>
              <ArtifactBody showMarkdown={showMarkdown} />
            </XDSLayoutContent>
          }
        />
      </XDSDialog>
    </XDSVStack>
  );
}
