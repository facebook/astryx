'use client';

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSToken} from '@xds/core/Token';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSTooltip} from '@xds/core/Tooltip';

import {
  ArrowLeftIcon,
  DesktopIcon,
  PhoneIcon,
  CodeIcon,
  CursorIcon,
  PaletteIcon,
  ContrastIcon,
  SaveIcon,
  ShareIcon,
  PlusIcon,
  SendIcon,
  LinkIcon,
  CheckIcon,
  HeartIcon,
  BookmarkIcon,
} from './docsite-icons';
import {
  XDS_THEMES,
  MOCK_CODE,
  TEMPLATES,
  PREVIEW_COLOR_PALETTES,
  PREVIEW_FONT_PACKS,
  AVATAR_IMAGE,
} from './constants';
import {InlinePublishPanel} from './InlinePublishPanel';
import {SharePopover} from './SharePopover';

export function TemplateFullPreview({
  templateName,
  imageSrc,
  onBack,
  onUse,
  onSelectTemplate,
  showChat = false,
  showEditor = false,
  defaultTab = 'properties',
  hideShadows = false,
}: {
  templateName: string;
  imageSrc: string;
  onBack: () => void;
  onUse: () => void;
  onSelectTemplate?: (index: number) => void;
  showChat?: boolean;
  showEditor?: boolean;
  defaultTab?: 'properties' | 'chat';
  hideShadows?: boolean;
}) {
  const [viewMode, setViewMode] = useState('desktop' as 'desktop' | 'mobile');
  const [editorView, setEditorView] = useState(
    'preview' as 'preview' | 'code',
  );
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(
    PREVIEW_COLOR_PALETTES[0].name as string | null,
  );
  const [selectedFontPack, setSelectedFontPack] = useState(
    PREVIEW_FONT_PACKS[0].heading as string | null,
  );
  const [panelTab, setPanelTab] = useState(
    defaultTab as 'properties' | 'chat',
  );
  const [chatInput, setChatInput] = useState('');
  const [codeContent, setCodeContent] = useState(MOCK_CODE);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [showSendPopover, setShowSendPopover] = useState(false);
  const [sendPopoverPos, setSendPopoverPos] = useState(
    null as {top: number; left: number} | null,
  );
  const [sharePopoverPos, setSharePopoverPos] = useState(
    null as {top: number; left: number} | null,
  );
  const [shareCopied, setShareCopied] = useState(false);
  const [sendCopied, setSendCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1645);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(892);
  const [panelWidth, setPanelWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const sharePopoverRef = useRef(null as HTMLDivElement | null);
  const shareButtonRef = useRef(null as HTMLButtonElement | null);
  const sendPopoverRef = useRef(null as HTMLDivElement | null);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = panelWidth;

    const onMouseMove = (ev: MouseEvent) => {
      const maxWidth = Math.floor(window.innerWidth / 2);
      const newWidth = Math.min(Math.max(startWidth + (ev.clientX - startX), 280), maxWidth);
      setPanelWidth(newWidth);
    };
    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [panelWidth]);

  const shareCliCommand = `npx xds template ${templateName.toLowerCase().replace(/\s+/g, '-')} ./my-project`;

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
  }, []);

  useEffect(() => {
    if (!showSharePopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sharePopoverRef.current &&
        !sharePopoverRef.current.contains(e.target as Node)
      ) {
        setShowSharePopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSharePopover]);

  useEffect(() => {
    if (!showSendPopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sendPopoverRef.current &&
        !sendPopoverRef.current.contains(e.target as Node)
      ) {
        setShowSendPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSendPopover]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'visible',
        backgroundColor: 'var(--color-background-body, #f5f5f5)',
      }}>
      {/* LEFT PANEL — details sidebar */}
      <div
        style={{
          width: panelWidth,
          minWidth: 280,
          maxWidth: '50vw',
          flexShrink: 0,
          padding: '16px 0 16px 16px',
          display: 'flex',
          backgroundColor: 'transparent',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'none' : 'translateX(-60px)',
          transition: isResizing
            ? 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms'
            : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, width 150ms ease',
        }}>
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--color-background-card, #fff)',
            borderRadius: 16,
            boxShadow: hideShadows ? 'none' : '0 4px 24px rgba(0,0,0,0.08)',
            padding: showChat ? '16px 32px 32px' : '24px 32px 32px',
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column' as const,
          }}>
          {/* Details / Chat content — hidden when publish is visible */}
          <div
            style={{
              display: showPublishModal ? 'none' : 'flex',
              flexDirection: 'column' as const,
              flex: 1,
            }}>
            {/* Back button + tabs on same row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: showChat ? 32 : 8,
                paddingBottom: 0,
                borderBottom: showChat
                  ? '1px solid var(--color-divider, #e0e0e0)'
                  : 'none',
              }}>
              <XDSTooltip content="Craft">
                <XDSButton
                  label="Craft"
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeftIcon />}
                  isIconOnly={!!showChat}
                  onClick={onBack}
                  style={{marginLeft: -8, flexShrink: 0}}
                />
              </XDSTooltip>
              {showChat && (
                <div style={{display: 'flex', flex: 1}}>
                  {(['properties', 'chat'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPanelTab(tab)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        background: 'none',
                        border: 'none',
                        borderBottom:
                          panelTab === tab
                            ? '2px solid var(--color-text-primary, #111)'
                            : '2px solid transparent',
                        marginBottom: -1,
                        cursor: 'pointer',
                        textAlign: 'center' as const,
                        transition: 'border-color 150ms ease',
                      }}>
                      <XDSText
                        type="body"
                        color={panelTab === tab ? 'primary' : 'secondary'}>
                        {tab === 'properties' ? 'Details' : 'Chat'}
                      </XDSText>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat tab content */}
            {showChat && panelTab === 'chat' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column' as const,
                  flex: 1,
                  minHeight: 0,
                }}>
                {/* Chat messages area */}
                <div style={{flex: 1, overflowY: 'auto' as const}}>
                  {/* Welcome message bubble */}
                  <div
                    style={{
                      backgroundColor: 'var(--color-background-body, #f1f4f7)',
                      borderRadius: 12,
                      padding: 12,
                    }}>
                    <XDSText type="body">
                      Hi! I can help you customize this template. Try asking me
                      to change colors, layout, or content.
                    </XDSText>
                  </div>
                </div>

                {/* Composer pinned to bottom */}
                <div
                  style={{
                    borderTop: '1px solid var(--color-divider, #e0e0e0)',
                    padding: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    margin: '0 -32px -32px -32px',
                    paddingInline: 32,
                    paddingBottom: 32,
                  }}>
                  <XDSButton
                    label="Attach"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<PlusIcon />}
                  />
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="What should we build?"
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: 14,
                      color: 'inherit',
                    }}
                  />
                  <XDSButton
                    label="Send"
                    variant="primary"
                    size="sm"
                    isIconOnly
                    icon={<SendIcon />}
                    style={{borderRadius: 9999}}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Template name */}
                <XDSText type="display-2">{templateName}</XDSText>

                {/* Description */}
                <div style={{marginTop: 8}}>
                  <XDSText type="body" color="secondary">
                    Buttons are clickable elements that are used to trigger
                    actions. They communicate calls to action to the user and
                    allow users to interact with pages in a variety of ways.
                    Button labels express what action will occur when the user
                    interacts with it.
                  </XDSText>
                </div>

                {/* Author section */}
                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    flexDirection: 'row' as const,
                    alignItems: 'center',
                    gap: 12,
                  }}>
                  <XDSAvatar
                    name="Andrea Anderson"
                    size={36}
                    src={AVATAR_IMAGE}
                  />
                  <div
                    style={{display: 'flex', flexDirection: 'column', gap: 0}}>
                    <XDSText type="supporting" color="secondary">
                      Crafted by
                    </XDSText>
                    <XDSText
                      type="body"
                      style={{fontWeight: 600, fontSize: 16}}>
                      Andrea Anderson
                    </XDSText>
                  </div>
                </div>

                {/* Stats buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 16,
                    marginLeft: -8,
                    marginRight: -8,
                  }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                    <XDSTooltip content="Copy link">
                      <XDSButton
                        label="Link"
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        icon={
                          linkCopied ? (
                            <CheckIcon
                              style={{
                                strokeDasharray: 24,
                                strokeDashoffset: 0,
                                animation: 'checkDraw 0.3s ease-out',
                              }}
                            />
                          ) : (
                            <LinkIcon />
                          )
                        }
                        onClick={() => {
                          void navigator.clipboard.writeText(
                            'https://xds.dev/templates/' +
                              templateName.toLowerCase().replace(/\s+/g, '-'),
                          );
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }}
                      />
                    </XDSTooltip>
                    <div
                      ref={sendPopoverRef}
                      style={{position: 'relative' as const}}>
                      <XDSTooltip content="Share">
                        <XDSButton
                          label="Share"
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          icon={<ShareIcon />}
                          onClick={() => {
                            setShowSendPopover(prev => {
                              if (!prev && sendPopoverRef.current) {
                                const rect =
                                  sendPopoverRef.current.getBoundingClientRect();
                                const popoverWidth = 340;
                                const popoverHeight = 400;
                                const left = Math.min(
                                  Math.max(8, rect.left),
                                  window.innerWidth - popoverWidth - 16,
                                );
                                const top =
                                  rect.bottom + 4 + popoverHeight + 16 >
                                  window.innerHeight
                                    ? rect.top - popoverHeight - 4
                                    : rect.bottom + 4;
                                setSendPopoverPos({top, left});
                              }
                              return !prev;
                            });
                          }}
                        />
                      </XDSTooltip>
                      {showSendPopover && sendPopoverPos && (
                        <SharePopover
                          cliCommand={shareCliCommand}
                          position={sendPopoverPos}
                          onClose={() => setShowSendPopover(false)}
                        />
                      )}
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                    <XDSTooltip content="Like">
                      <XDSButton
                        label={likeCount.toLocaleString()}
                        variant="ghost"
                        size="sm"
                        style={{color: 'var(--color-text-secondary, #65676B)'}}
                        icon={
                          <HeartIcon
                            fill={liked ? 'currentColor' : 'none'}
                            style={liked ? {color: '#e5484d'} : undefined}
                          />
                        }
                        onClick={() => {
                          setLiked(prev => !prev);
                          setLikeCount(prev => (liked ? prev - 1 : prev + 1));
                        }}
                      />
                    </XDSTooltip>
                    <XDSTooltip content="Bookmark">
                      <XDSButton
                        label={bookmarkCount.toLocaleString()}
                        variant="ghost"
                        size="sm"
                        style={{color: 'var(--color-text-secondary, #65676B)'}}
                        icon={
                          <BookmarkIcon
                            fill={bookmarked ? 'currentColor' : 'none'}
                            style={
                              bookmarked
                                ? {
                                    color:
                                      'var(--color-icon-highlight, #3b82f6)',
                                  }
                                : undefined
                            }
                          />
                        }
                        onClick={() => {
                          setBookmarked(prev => !prev);
                          setBookmarkCount(prev =>
                            bookmarked ? prev - 1 : prev + 1,
                          );
                        }}
                      />
                    </XDSTooltip>
                  </div>
                </div>

                {/* CTA button */}
                {!showEditor && (
                  <div style={{marginTop: 16}}>
                    <XDSButton
                      variant="primary"
                      label="Start crafting"
                      onClick={onUse}
                      size="lg"
                      style={{width: '100%'}}
                    />
                  </div>
                )}

                {/* Themes */}
                <div style={{marginTop: 32}}>
                  <XDSHeading level={4}>Themes</XDSHeading>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                      marginTop: 8,
                    }}>
                    {PREVIEW_COLOR_PALETTES.map(palette => (
                      <div
                        key={palette.name}
                        onClick={() => setSelectedPalette(palette.name)}
                        style={{
                          cursor: 'pointer',
                          border: `2px solid ${selectedPalette === palette.name ? 'var(--color-accent, #0066FF)' : 'transparent'}`,
                          borderRadius: 14,
                          overflow: 'hidden',
                          transition: 'border-color 0.15s ease',
                        }}>
                        <XDSCard padding={0}>
                          <div
                            style={{
                              display: 'flex',
                              overflow: 'hidden',
                              height: 48,
                            }}>
                            {palette.colors.map((color, i) => (
                              <div
                                key={i}
                                style={{
                                  flex: 1,
                                  backgroundColor: color,
                                }}
                              />
                            ))}
                          </div>
                        </XDSCard>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Font packs — removed */}
                <div style={{marginTop: 32, display: 'none'}}>
                  <XDSHeading level={4}>Font packs</XDSHeading>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                      marginTop: 8,
                    }}>
                    {PREVIEW_FONT_PACKS.map(pack => (
                      <div
                        key={pack.heading}
                        onClick={() => setSelectedFontPack(pack.heading)}
                        style={{
                          cursor: 'pointer',
                          border: `2px solid ${selectedFontPack === pack.heading ? 'var(--color-accent, #0066FF)' : 'transparent'}`,
                          borderRadius: 14,
                          overflow: 'hidden',
                          transition: 'border-color 0.15s ease',
                        }}>
                        <XDSCard padding={2}>
                          <div style={{fontFamily: pack.heading}}>
                            <XDSText
                              type="body"
                              style={{fontWeight: 600, fontSize: 16}}>
                              Heading
                            </XDSText>
                          </div>
                          <div style={{fontFamily: pack.paragraph}}>
                            <XDSText type="supporting" color="secondary">
                              Paragraph text
                            </XDSText>
                          </div>
                        </XDSCard>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Component used */}
                <div style={{marginTop: 32}}>
                  <XDSHeading level={3}>Component used</XDSHeading>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap' as const,
                      gap: 8,
                      marginTop: 8,
                    }}>
                    <XDSToken label="XDSAppShell" />
                    <XDSToken label="XDSTopNav" />
                    <XDSToken label="XDSVStack" />
                    <XDSToken label="XDSHStack" />
                    <XDSToken label="XDSHeading" />
                    <XDSToken label="XDSText" />
                    <XDSToken label="XDSButton" />
                    <XDSToken label="XDSCard" />
                    <XDSToken label="XDSBadge" />
                    <XDSToken label="XDSAvatar" />
                  </div>
                </div>

                {/* Keywords */}
                <div style={{marginTop: 32}}>
                  <XDSHeading level={3}>Keywords</XDSHeading>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap' as const,
                      gap: 4,
                      marginTop: 8,
                    }}>
                    <XDSToken label="Dashboard" size="sm" />
                    <XDSToken label="Admin" size="sm" />
                    <XDSToken label="Layout" size="sm" />
                    <XDSToken label="Navigation" size="sm" />
                    <XDSToken label="Settings" size="sm" />
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Inline publish panel — shown when publish is active */}
          <div
            style={{
              display: showPublishModal ? 'flex' : 'none',
              flexDirection: 'column' as const,
              flex: 1,
            }}>
            <InlinePublishPanel
              templateName={templateName}
              isVisible={showPublishModal}
              onBack={() => setShowPublishModal(false)}
            />
          </div>
        </div>
      </div>

      {/* Resize handle */}
      <style>{`
        .xds-resize-handle { opacity: 0; transition: opacity 150ms ease, background-color 150ms ease; }
        .xds-resize-grip:hover .xds-resize-handle { opacity: 0.6; }
        .xds-resize-grip[data-resizing="true"] .xds-resize-handle { opacity: 1; }
      `}</style>
      <div
        onMouseDown={handleResizeStart}
        data-resizing={isResizing}
        className="xds-resize-grip"
        style={{
          width: 8,
          flexShrink: 0,
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}>
        <div
          className="xds-resize-handle"
          style={{
            width: 3,
            height: 32,
            borderRadius: 2,
              backgroundColor: isResizing
              ? 'var(--color-icon-primary, #111)'
              : 'var(--color-border-strong, #ccc)',
          }}
        />
      </div>

      {/* RIGHT PANEL — preview area */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: 'var(--color-background-body, #f5f5f5)',
          display: 'flex',
          flexDirection: 'column' as const,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'none' : 'translateX(40px)',
          transition:
            'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
        {/* Editor toolbar */}
        <div style={{backgroundColor: 'var(--color-background-body, #f5f5f5)', borderBottom: 'none'}}>
          {showEditor ? (
            <XDSToolbar
              label="Template actions"
              padding={1}
              dividers={[]}
              startContent={<></>}
              centerContent={
                <XDSSegmentedControl
                  value={viewMode}
                  onChange={(v: string) =>
                    setViewMode(v as 'desktop' | 'mobile')
                  }
                  label="Viewport size"
                  size="sm">
                  <XDSTooltip content="Desktop">
                    <XDSSegmentedControlItem
                      value="desktop"
                      label="Desktop"
                      isLabelHidden
                      icon={<DesktopIcon />}
                    />
                  </XDSTooltip>
                  <XDSTooltip content="Mobile">
                    <XDSSegmentedControlItem
                      value="mobile"
                      label="Mobile"
                      isLabelHidden
                      icon={<PhoneIcon />}
                    />
                  </XDSTooltip>
                </XDSSegmentedControl>
              }
              endContent={
                <>
                  <XDSTooltip content="Point">
                    <XDSButton
                      label="Point"
                      variant="ghost"
                      isIconOnly
                      icon={<CursorIcon />}
                    />
                  </XDSTooltip>
                  <XDSTooltip content="Theme">
                    <XDSDropdownMenu
                      button={{
                        label: 'Theme',
                        variant: 'ghost',
                        isIconOnly: true,
                        icon: <PaletteIcon />,
                      }}
                      hasChevron={false}
                      items={XDS_THEMES.map(t => ({
                        label: t.label,
                        onClick: () => {},
                      }))}
                    />
                  </XDSTooltip>
                  <XDSTooltip content="Toggle theme">
                    <XDSButton
                      label="Toggle theme"
                      variant="ghost"
                      isIconOnly
                      icon={<ContrastIcon />}
                    />
                  </XDSTooltip>
                  <XDSTooltip content="Toggle code">
                    <XDSButton
                      label="Toggle code"
                      variant={editorView === 'code' ? 'secondary' : 'ghost'}
                      isIconOnly
                      icon={<CodeIcon />}
                      onClick={() =>
                        setEditorView(
                          editorView === 'preview' ? 'code' : 'preview',
                        )
                      }
                    />
                  </XDSTooltip>
                  <div
                    style={{
                      width: 1,
                      height: 20,
                      backgroundColor: 'var(--color-border-strong, #999)',
                      margin: '0 4px',
                      flexShrink: 0,
                    }}
                  />
                  <XDSTooltip content="Save">
                    <XDSButton
                      label="Save"
                      variant="ghost"
                      icon={<SaveIcon />}
                      isIconOnly
                      onClick={() => {}}
                    />
                  </XDSTooltip>
                  <div
                    ref={sharePopoverRef}
                    style={{position: 'relative' as const}}>
                    <XDSTooltip content="Share">
                      <XDSButton
                        label="Share"
                        variant="ghost"
                        isIconOnly
                        icon={<ShareIcon />}
                        ref={shareButtonRef}
                        onClick={() => {
                          setShowSharePopover(prev => {
                            if (!prev && shareButtonRef.current) {
                              const rect =
                                shareButtonRef.current.getBoundingClientRect();
                              const popoverWidth = 340;
                              const popoverHeight = 400;
                              const left = Math.min(
                                Math.max(8, rect.right - popoverWidth),
                                window.innerWidth - popoverWidth - 16,
                              );
                              const top =
                                rect.bottom + 4 + popoverHeight + 16 >
                                window.innerHeight
                                  ? rect.top - popoverHeight - 4
                                  : rect.bottom + 4;
                              setSharePopoverPos({top, left});
                            }
                            return !prev;
                          });
                        }}
                      />
                    </XDSTooltip>
                    {showSharePopover && sharePopoverPos && (
                      <SharePopover
                        cliCommand={shareCliCommand}
                        position={sharePopoverPos}
                        onClose={() => setShowSharePopover(false)}
                      />
                    )}
                  </div>
                  <XDSButton
                    label="Publish"
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPublishModal(true)}
                  />
                </>
              }
            />
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px 24px',
              }}>
              <XDSSegmentedControl
                value={viewMode}
                onChange={(v: string) => setViewMode(v as 'desktop' | 'mobile')}
                label="Viewport size"
                size="sm">
                <XDSSegmentedControlItem
                  value="desktop"
                  label="Desktop"
                  isLabelHidden
                  icon={<DesktopIcon />}
                />
                <XDSSegmentedControlItem
                  value="mobile"
                  label="Mobile"
                  isLabelHidden
                  icon={<PhoneIcon />}
                />
              </XDSSegmentedControl>
            </div>
          )}
        </div>

        {/* Preview — browser frame + image */}
        <div
          style={{
            backgroundColor: 'var(--color-background-body, #f5f5f5)',
            padding: '22px 22px 22px',
            display: !showEditor || editorView === 'preview' ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flex: 1,
            overflow: 'auto',
          }}>
          <div
            style={{
              width: viewMode === 'mobile' ? 375 : '100%',
              maxWidth: viewMode === 'mobile' ? 375 : 1200,
              aspectRatio: viewMode === 'mobile' ? '9 / 19.5' : '16 / 10',
              backgroundColor: '#fff',
              borderRadius: viewMode === 'mobile' ? 36 : 12,
              border: viewMode === 'mobile' ? '10px solid #fff' : 'none',
              boxShadow:
                viewMode === 'mobile'
                  ? '0 8px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)'
                  : '0 8px 40px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              transition:
                'width 0.3s ease, aspect-ratio 0.3s ease, border-radius 0.3s ease',
            }}>
            {/* Device chrome */}
            {viewMode === 'desktop' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: '#fff',
                  borderBottom: '1px solid #f0f0f0',
                }}>
                <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                    }}
                  />
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                    }}
                  />
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                    }}
                  />
                </div>
              </div>
            ) : null}
            <img
              src={imageSrc}
              alt={templateName}
              style={{
                width: '100%',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* Code block */}
        <div
          style={{
            margin: '0 22px',
            border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
            borderRadius: 8,
            backgroundColor: 'var(--color-background-muted, rgba(0,0,0,0.03))',
            overflow: 'hidden',
            flex: 1,
            display: showEditor && editorView === 'code' ? 'flex' : 'none',
            flexDirection: 'column' as const,
            minHeight: 0,
          }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px 8px 16px',
            }}>
            <span
              style={{
                fontFamily: '"Roboto Mono", monospace',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--color-text-secondary, #4e606f)',
              }}>
              typescript — useUser.ts
            </span>
          </div>
          <div style={{display: 'flex', flex: 1, minHeight: 0}}>
            <div
              style={{
                padding: '12px 12px 12px 16px',
                borderRight: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                fontFamily: '"Roboto Mono", monospace',
                fontSize: 14,
                lineHeight: '20px',
                color: 'var(--color-text-disabled, #a4b0bc)',
                textAlign: 'right',
                userSelect: 'none',
                minWidth: 45,
              }}>
              {codeContent.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={codeContent}
              onChange={e => setCodeContent(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontFamily: '"Roboto Mono", monospace',
                fontSize: 14,
                lineHeight: '20px',
                margin: 0,
                overflow: 'auto',
                color: 'var(--color-text-primary, #0a1317)',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                whiteSpace: 'pre',
                tabSize: 2,
              }}
            />
          </div>
        </div>

        {/* Similar templates — only visible in preview mode */}
        {(!showEditor || editorView === 'preview') && (
          <div
            style={{
              width: '100%',
              padding: '24px 32px 32px',
              boxSizing: 'border-box' as const,
              marginTop: 'auto',
              textAlign: 'center' as const,
            }}>
            <XDSHeading level={3}>Similar templates</XDSHeading>
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 12,
                overflowX: 'auto' as const,
                justifyContent: 'center',
              }}>
              {TEMPLATES.slice(0, 4).map((t, i) => (
                <div
                  key={i}
                  onClick={() => onSelectTemplate?.(i)}
                  style={{
                    flex: '0 0 280px',
                    aspectRatio: '1920 / 1200',
                    border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                    backgroundColor: 'var(--color-background-card, #fff)',
                    borderRadius: 8,
                    boxShadow: hideShadows ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}>
                  <img
                    src={t.src}
                    alt={t.name}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
