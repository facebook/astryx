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
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSTextInput} from '@xds/core/TextInput';

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
  BookmarkFilledIcon,
  StarIcon,
  StarFilledIcon,
  SearchIcon,
  MetaLogo,
  WhatsAppLogo,
  ThreadsLogo,
  FacebookLogo,
  DefaultThemeIcon,
  ForestThemeIcon,
  SunsetThemeIcon,
  MidnightThemeIcon,
} from './docsite-icons';
import {
  XDS_THEMES,
  MOCK_CODE,
  TEMPLATES,
  THEME_PICKER_ENTRIES,
  PREVIEW_FONT_PACKS,
  AVATAR_IMAGE,
} from './constants';

import {InlinePublishPanel} from './InlinePublishPanel';
import {SharePopover} from './SharePopover';

const BRAND_LOGOS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  default: DefaultThemeIcon,
  meta: MetaLogo,
  whatsapp: WhatsAppLogo,
  threads: ThreadsLogo,
  facebook: FacebookLogo,
  forest: ForestThemeIcon,
  sunset: SunsetThemeIcon,
  midnight: MidnightThemeIcon,
};

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
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [showThemeBrowse, setShowThemeBrowse] = useState(false);
  const [themeSearch, setThemeSearch] = useState('');
  const [pinnedThemes, setPinnedThemes] = useState(
    () => new Set(THEME_PICKER_ENTRIES.filter(t => t.isPinnedByDefault).map(t => t.key)),
  );
  const togglePin = useCallback((key: string) => {
    setPinnedThemes(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);
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
  const [showAddPopover, setShowAddPopover] = useState(false);
  const [addPopoverPos, setAddPopoverPos] = useState(null as {top: number; left: number} | null);
  const addButtonRef = useRef(null as HTMLButtonElement | null);
  const addPopoverRef = useRef(null as HTMLDivElement | null);
  const sharePopoverRef = useRef(null as HTMLDivElement | null);
  const shareButtonRef = useRef(null as HTMLButtonElement | null);
  const sendPopoverRef = useRef(null as HTMLDivElement | null);

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

  useEffect(() => {
    if (!showAddPopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        addPopoverRef.current &&
        !addPopoverRef.current.contains(e.target as Node)
      ) {
        setShowAddPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddPopover]);

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
          width: 380,
          flexShrink: 0,
          padding: '16px 0 16px 16px',
          display: 'flex',
          backgroundColor: 'transparent',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'none' : 'translateX(-60px)',
          transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms',
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
                {/* Template name — click to copy link */}
                <span
                  style={{cursor: 'pointer', textDecoration: 'none'}}
                  onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      'https://xds.dev/templates/' +
                        templateName.toLowerCase().replace(/\s+/g, '-'),
                    );
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}>
                  <XDSText type="display-2">
                    {templateName}
                  </XDSText>
                </span>

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
                  </div>
                </div>

                {/* CTA buttons */}
                {!showEditor && (
                  <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, position: 'relative'}}>
                    <div style={{display: 'flex', gap: 8}}>
                      <XDSButton
                        variant="primary"
                        label="Start crafting"
                        onClick={onUse}
                        size="lg"
                        style={{flex: 1}}
                      />
                      <XDSTooltip content="Bookmark">
                        <XDSButton
                          label={bookmarkCount.toLocaleString()}
                          variant="secondary"
                          size="lg"
                          isIconOnly
                          icon={
                            <BookmarkIcon
                              fill={bookmarked ? 'currentColor' : 'none'}
                              style={
                                bookmarked
                                  ? {color: 'var(--color-icon-highlight, #3b82f6)'}
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
                    <div ref={addPopoverRef}>
                      <XDSButton
                        ref={addButtonRef}
                        variant="secondary"
                        label="Add to your project"
                        size="lg"
                        style={{width: '100%'}}
                        onClick={() => {
                          if (addButtonRef.current) {
                            const rect = addButtonRef.current.getBoundingClientRect();
                            setAddPopoverPos({top: rect.bottom + 8, left: rect.left});
                          }
                          setShowAddPopover(prev => !prev);
                        }}
                      />
                      {showAddPopover && addPopoverPos && (
                        <SharePopover
                          cliCommand={shareCliCommand}
                          position={addPopoverPos}
                          onClose={() => setShowAddPopover(false)}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Themes — pinned grid */}
                <div style={{marginTop: 32}}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <XDSHeading level={4}>Apply your themes</XDSHeading>
                    <XDSButton
                      variant="ghost"
                      size="sm"
                      label="Browse"
                      onClick={() => setShowThemeBrowse(true)}
                    />
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, 44px)',
                      gap: 8,
                      marginTop: 12,
                    }}>
                    {THEME_PICKER_ENTRIES.filter(
                      t => pinnedThemes.has(t.key),
                    ).map(entry => {
                      const isSelected = selectedTheme === entry.key;
                      const BrandLogo = BRAND_LOGOS[entry.key];
                      return (
                        <XDSTooltip key={entry.key} content={entry.name}>
                          <div
                            onClick={() => setSelectedTheme(entry.key)}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              border: isSelected
                                ? '2px solid var(--color-text-primary, #111)'
                                : '2px solid var(--color-border, #E0E0E0)',
                              backgroundColor: '#fff',
                              transition: 'border-color 0.15s ease',
                            }}>
                            {BrandLogo ? (
                              <BrandLogo width={28} height={28} />
                            ) : (
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  backgroundColor: entry.accent,
                                }}
                              />
                            )}
                          </div>
                        </XDSTooltip>
                      );
                    })}
                  </div>
                </div>

                {/* All themes browse dialog */}
                <XDSDialog
                  isOpen={showThemeBrowse}
                  onOpenChange={open => {
                    setShowThemeBrowse(open);
                    if (!open) setThemeSearch('');
                  }}
                  width={720}>
                  <XDSDialogHeader
                    title="All Themes"
                    onOpenChange={open => {
                      setShowThemeBrowse(open);
                      if (!open) setThemeSearch('');
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                      padding: 16,
                    }}>
                    <XDSTextInput
                      label="Search"
                      isLabelHidden
                      placeholder="Search themes..."
                      value={themeSearch}
                      onChange={setThemeSearch}
                      size="lg"
                      startIcon={SearchIcon}
                    />
                    <div
                      style={{
                        maxHeight: 560,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}>
                      {(['official', 'community'] as const).map(
                        category => {
                          const entries = THEME_PICKER_ENTRIES.filter(
                            t =>
                              t.category === category &&
                              t.name
                                .toLowerCase()
                                .includes(themeSearch.toLowerCase()),
                          );
                          if (entries.length === 0) return null;
                          return (
                            <div key={category}>
                              <XDSText
                                type="supporting"
                                color="secondary"
                                style={{
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  marginBottom: 8,
                                }}>
                                {category}
                              </XDSText>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr 1fr',
                                  gap: 8,
                                }}>
                                {entries.map(entry => {
                                  const isSelected =
                                    selectedTheme === entry.key;
                                  const isPinned = pinnedThemes.has(
                                    entry.key,
                                  );
                                  const p = entry.preview;
                                  return (
                                    <div
                                      key={entry.key}
                                      style={{
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        border: isSelected
                                          ? '2px solid var(--color-text-primary, #111)'
                                          : '2px solid var(--color-border, #E0E0E0)',
                                        cursor: 'pointer',
                                        transition:
                                          'border-color 0.15s ease',
                                      }}>
                                      {/* Mini UI mockup */}
                                      <div
                                        onClick={() => {
                                          setSelectedTheme(entry.key);
                                          setShowThemeBrowse(false);
                                          setThemeSearch('');
                                        }}
                                        style={{
                                          height: 100,
                                          backgroundColor: p.bg,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          overflow: 'hidden',
                                        }}>
                                        <div
                                          style={{
                                            height: 14,
                                            backgroundColor: p.surface,
                                            borderBottom: `1px solid ${p.text}1A`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingInline: 8,
                                            gap: 4,
                                          }}>
                                          <div
                                            style={{
                                              width: 5,
                                              height: 5,
                                              borderRadius: '50%',
                                              backgroundColor:
                                                p.accent,
                                            }}
                                          />
                                          <div
                                            style={{
                                              width: 16,
                                              height: 2,
                                              borderRadius: 1,
                                              backgroundColor: p.text,
                                              opacity: 0.3,
                                            }}
                                          />
                                        </div>
                                        <div
                                          style={{
                                            flex: 1,
                                            padding: 8,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 5,
                                          }}>
                                          <div
                                            style={{
                                              width: '65%',
                                              height: 4,
                                              borderRadius: 2,
                                              backgroundColor: p.text,
                                              opacity: 0.6,
                                            }}
                                          />
                                          <div
                                            style={{
                                              width: '45%',
                                              height: 3,
                                              borderRadius: 1.5,
                                              backgroundColor: p.text,
                                              opacity: 0.25,
                                            }}
                                          />
                                          <div
                                            style={{
                                              width: 28,
                                              height: 10,
                                              borderRadius: 4,
                                              backgroundColor:
                                                p.accent,
                                              marginTop: 'auto',
                                            }}
                                          />
                                        </div>
                                      </div>
                                      {/* Name + logo + pin */}
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent:
                                            'space-between',
                                          padding: '6px 8px',
                                          backgroundColor:
                                            'var(--color-surface, #f5f5f5)',
                                        }}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                          {(() => {
                                            const Logo = BRAND_LOGOS[entry.key];
                                            return Logo ? <Logo width={14} height={14} /> : (
                                              <div style={{width: 14, height: 14, borderRadius: '50%', backgroundColor: entry.accent}} />
                                            );
                                          })()}
                                          <XDSText
                                            type="supporting"
                                            style={{
                                              fontWeight: isSelected
                                                ? 600
                                                : 400,
                                            }}>
                                            {entry.name}
                                          </XDSText>
                                        </div>
                                        <div
                                          onClick={e => {
                                            e.stopPropagation();
                                            togglePin(entry.key);
                                          }}
                                          style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            padding: 2,
                                          }}>
                                          {isPinned ? (
                                            <StarFilledIcon
                                              width={14}
                                              height={14}
                                              style={{
                                                color:
                                                  'var(--color-text-primary, #111)',
                                              }}
                                            />
                                          ) : (
                                            <StarIcon
                                              width={14}
                                              height={14}
                                              style={{
                                                color:
                                                  'var(--color-secondary, #999)',
                                              }}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </XDSDialog>

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
                          border: `2px solid ${selectedFontPack === pack.heading ? 'var(--color-text-primary, #111)' : 'transparent'}`,
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
              onPublish={onBack}
            />
          </div>
        </div>
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
            alignItems: 'center',
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

        {/* More like this + Explore more — only visible in preview mode */}
        {(!showEditor || editorView === 'preview') && (
          <>
            <div style={{padding: '16px 32px 0'}}>
              <XDSHeading level={2}>More like this</XDSHeading>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 16}}>
                {TEMPLATES.filter((_, i) => i !== TEMPLATES.findIndex(tt => tt.name === templateName)).slice(0, 10).map((t, i) => (
                  <XDSCard
                    key={i}
                    padding={0}
                    onClick={() => {
                      const idx = TEMPLATES.indexOf(t);
                      onSelectTemplate?.(idx !== -1 ? idx : i);
                    }}
                    style={{cursor: 'pointer', aspectRatio: '16/10', overflow: 'hidden'}}>
                    <img src={t.src} alt={t.name} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block'}} />
                  </XDSCard>
                ))}
              </div>
            </div>
            <div style={{padding: '32px 32px 40px'}}>
              <XDSHeading level={2}>Explore more</XDSHeading>
              <div style={{display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginTop: 16}}>
                {['website', 'dashboard', 'admin panel', 'settings', 'form layout', 'data table', 'sidebar nav', 'landing page', 'e-commerce', 'documentation', 'profile page'].map(tag => (
                  <XDSToken key={tag} label={tag} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
