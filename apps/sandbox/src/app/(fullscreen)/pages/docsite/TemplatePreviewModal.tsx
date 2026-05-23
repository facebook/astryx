// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import React, {useState, useRef, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSPopover} from '@xds/core/Popover';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSToken} from '@xds/core/Token';
import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {
  AVATAR_IMAGE,
  XDS_DESIGN_AVATAR,
  THEME_PICKER_ENTRIES,
  basePath,
} from './constants';
import {SharePopoverContent} from './SharePopover';
import {
  BookmarkIcon,
  BookmarkFilledIcon,
  StarIcon,
  StarFilledIcon,
  SearchIcon,
  ThreadsLogo,
  FacebookLogo,
  DefaultThemeIcon,
  ForestThemeIcon,
  SunsetThemeIcon,
  MidnightThemeIcon,
} from './docsite-icons';

const BRAND_LOGOS: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  default: DefaultThemeIcon,
  threads: ThreadsLogo,
  facebook: FacebookLogo,
  forest: ForestThemeIcon,
  sunset: SunsetThemeIcon,
  midnight: MidnightThemeIcon,
};

const popoverStyles = stylex.create({
  themeBrowse: {
    zIndex: 100,
  },
});

const tokenStyles = stylex.create({
  outline: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border-strong, #999)',
  },
  pill: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border-strong, #999)',
  },
});

export type TemplatePreviewItem = {
  name: string;
  img: string;
  slug?: string;
  author: string;
  description?: string;
  themeImages?: Record<string, string>;
};

export type MoreLikeThisItem = {
  name: string;
  img: string;
  slug?: string;
  key: string | number;
  themeImages?: Record<string, string>;
};

export function TemplatePreviewModal({
  isOpen,
  onClose,
  item,
  onStartCrafting,
  isBookmarked,
  onBookmarkToggle,
  moreLikeThis,
  onMoreLikeThisClick,
  exploreTags,
  onExploreTagClick,
  componentTags,
  onComponentTagClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: TemplatePreviewItem | null;
  onStartCrafting?: () => void;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  moreLikeThis?: MoreLikeThisItem[];
  onMoreLikeThisClick?: (item: MoreLikeThisItem) => void;
  exploreTags?: string[];
  onExploreTagClick?: (tag: string) => void;
  componentTags?: string[];
  onComponentTagClick?: (tag: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [themeBrowseOpen, setThemeBrowseOpen] = useState(false);
  const [themeSearch, setThemeSearch] = useState('');
  const [showAddPopover, setShowAddPopover] = useState(false);
  const [pinnedThemes, setPinnedThemes] = useState(
    () =>
      new Set(
        THEME_PICKER_ENTRIES.filter(t => t.isPinnedByDefault).map(t => t.key),
      ),
  );
  const [transitioning, setTransitioning] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const themeFilters: Record<string, string> = {
    neutral: 'saturate(0.3)',
    brutalist: 'contrast(1.2) saturate(0.5)',
    threads: 'saturate(0.8) contrast(1.1)',
    facebook: 'sepia(0.1) saturate(1.3) hue-rotate(190deg)',
    matcha: 'sepia(0.2) saturate(1.2) hue-rotate(80deg)',
    midnight: 'invert(0.88) hue-rotate(180deg)',
    daily: 'sepia(0.1) saturate(1.1) hue-rotate(10deg)',
  };
  const previewFilter = themeFilters[selectedTheme] ?? undefined;

  const togglePin = useCallback((key: string) => {
    setPinnedThemes(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  if (!item) {
    return null;
  }

  const themedImg = item.themeImages?.[selectedTheme] ?? item.img;
  const hasThemedImage =
    item.themeImages != null && selectedTheme in item.themeImages;

  const description =
    item.description ??
    `A ready-to-use ${item.name.toLowerCase()} template built with XDS components. Customize it with your own content and theme to match your brand.`;

  const shimmerBg =
    'linear-gradient(90deg, var(--color-background-muted, #f0f0f0) 0%, var(--color-background-surface, #fafafa) 50%, var(--color-background-muted, #f0f0f0) 100%)';

  return (
    <XDSDialog
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) {
          onClose();
          setPreviewLoaded(false);
        }
      }}
      width="90vw"
      maxHeight="90vh"
      purpose="info"
      style={
        {
          padding: 0,
          overflow: 'visible',
          maxWidth: 1600,
          '--xds-dialog-padding': '0px',
        } satisfies React.CSSProperties
      }>
      <div style={{position: 'absolute', top: 0, right: -40, zIndex: 1}}>
        <XDSCard padding={0} style={{borderRadius: '50%'}}>
          <XDSButton
            label="Close"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<span style={{fontSize: 16, lineHeight: 1}}>✕</span>}
            onClick={onClose}
          />
        </XDSCard>
      </div>
      <div ref={scrollRef} style={{overflowY: 'auto'}}>
        <div style={{display: 'flex', minHeight: 0, padding: '0 32px'}}>
          {/* Left — Preview image */}
          <XDSVStack
            gap={3}
            style={{flex: 1, minWidth: 0, padding: '32px 32px 32px 0'}}>
            <div
              style={{
                flex: 1,
                aspectRatio: '16 / 10',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid var(--color-border, #e0e0e0)',
                filter: hasThemedImage ? undefined : previewFilter,
                transition: 'filter 300ms ease',
                ...(!previewLoaded
                  ? {
                      background: shimmerBg,
                      backgroundSize: '800px 100%',
                      animation: 'craftShimmer 1.6s ease-in-out infinite',
                    }
                  : {
                      backgroundColor: 'var(--color-background-muted, #f9f9f9)',
                    }),
              }}>
              {item.slug ? (
                <iframe
                  src={`${basePath}/templates/${item.slug}/?embed=1`}
                  title={item.name}
                  onLoad={() => setPreviewLoaded(true)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    opacity: transitioning || !previewLoaded ? 0 : 1,
                    transition: 'opacity 250ms ease',
                  }}
                />
              ) : (
                <img
                  src={themedImg}
                  alt={`${item.name} — ${selectedTheme}`}
                  onLoad={() => setPreviewLoaded(true)}
                  style={{
                    width: '100%',
                    display: 'block',
                    opacity: transitioning ? 0 : 1,
                    transition: 'opacity 250ms ease',
                    animation: transitioning
                      ? 'none'
                      : 'previewFadeIn 300ms ease',
                  }}
                />
              )}
            </div>
          </XDSVStack>

          {/* Right — Details panel */}
          <XDSVStack style={{width: 360, flexShrink: 0, padding: '32px 0'}}>
            <div
              style={{
                opacity: transitioning ? 0 : 1,
                transition: 'opacity 250ms ease',
                animation: transitioning ? 'none' : 'previewFadeIn 300ms ease',
              }}>
              <XDSText type="display-2">{item.name}</XDSText>

              <div style={{marginTop: 8}}>
                <XDSText type="body" color="secondary">
                  {description}
                </XDSText>
              </div>

              {/* Author */}
              <XDSHStack gap={3} vAlign="center" style={{marginTop: 16}}>
                <XDSAvatar
                  name={item.author}
                  size={36}
                  src={
                    item.author === 'XDS Design'
                      ? XDS_DESIGN_AVATAR
                      : AVATAR_IMAGE
                  }
                />
                <XDSVStack gap={0}>
                  <XDSText type="supporting" color="secondary">
                    Crafted by
                  </XDSText>
                  <XDSText type="body" style={{fontWeight: 600, fontSize: 16}}>
                    {item.author}
                  </XDSText>
                </XDSVStack>
              </XDSHStack>
            </div>

            {/* CTA buttons */}
            <XDSVStack gap={2} style={{marginTop: 32, position: 'relative'}}>
              <XDSButton
                variant="primary"
                label="Start crafting"
                size="lg"
                style={{width: '100%'}}
                onClick={() => {
                  onStartCrafting?.();
                  onClose();
                }}
              />
              <div style={{display: 'flex', gap: 8, width: '100%'}}>
                <XDSButton
                  variant="secondary"
                  label="Use in your product"
                  size="lg"
                  style={{flex: 1}}
                  onClick={() => setShowAddPopover(!showAddPopover)}
                />
                <XDSTooltip content="Bookmark">
                  <XDSButton
                    label={isBookmarked ? '893' : '892'}
                    variant="secondary"
                    size="lg"
                    isIconOnly
                    icon={
                      isBookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />
                    }
                    onClick={onBookmarkToggle}
                  />
                </XDSTooltip>
              </div>
              {showAddPopover && (
                <XDSCard
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 8,
                    zIndex: 10,
                  }}>
                  <SharePopoverContent
                    cliCommand={`npx xds template ${item.name.toLowerCase().replace(/\s+/g, '-')} ./my-project`}
                    onClose={() => setShowAddPopover(false)}
                  />
                </XDSCard>
              )}
            </XDSVStack>

            {/* Themes — pinned grid */}
            <div style={{marginTop: 24}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <XDSText type="body" style={{fontWeight: 600}}>
                  Apply your themes
                </XDSText>
                <XDSPopover
                  label="Browse themes"
                  placement="below"
                  alignment="end"
                  width={480}
                  isOpen={themeBrowseOpen}
                  onOpenChange={open => {
                    setThemeBrowseOpen(open);
                    if (!open) {
                      setThemeSearch('');
                    }
                  }}
                  xstyle={popoverStyles.themeBrowse}
                  content={
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      }}>
                      <div
                        tabIndex={0}
                        style={{
                          position: 'absolute',
                          opacity: 0,
                          width: 0,
                          height: 0,
                          overflow: 'hidden',
                        }}
                      />
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
                          gap: 16,
                        }}>
                        {(['official', 'community'] as const).map(category => {
                          const entries = THEME_PICKER_ENTRIES.filter(
                            e =>
                              e.category === category &&
                              e.name
                                .toLowerCase()
                                .includes(themeSearch.toLowerCase()),
                          );
                          if (entries.length === 0) {
                            return null;
                          }
                          return (
                            <div key={category}>
                              <div style={{marginBottom: 8}}>
                                <XDSText type="supporting" color="secondary">
                                  {category.charAt(0).toUpperCase() +
                                    category.slice(1)}
                                </XDSText>
                              </div>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr 1fr',
                                  gap: 8,
                                }}>
                                {entries.map(entry => {
                                  const isSelected =
                                    selectedTheme === entry.key;
                                  const isPinned = pinnedThemes.has(entry.key);
                                  const p = entry.preview;
                                  return (
                                    <div
                                      key={entry.key}
                                      style={{
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: isSelected
                                          ? '1.5px solid var(--color-accent)'
                                          : '1px solid var(--color-border-emphasized)',
                                        transition: 'border-color 0.15s ease',
                                      }}>
                                      <div
                                        onClick={() => {
                                          setSelectedTheme(entry.key);
                                          setThemeBrowseOpen(false);
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
                                              backgroundColor: p.accent,
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
                                              backgroundColor: p.accent,
                                              marginTop: 'auto',
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: '6px 8px',
                                          backgroundColor:
                                            'var(--color-surface, #f5f5f5)',
                                        }}>
                                        <div
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                          }}>
                                          {(() => {
                                            const Logo = BRAND_LOGOS[entry.key];
                                            return Logo ? (
                                              <Logo width={14} height={14} />
                                            ) : (
                                              <div
                                                style={{
                                                  width: 14,
                                                  height: 14,
                                                  borderRadius: '50%',
                                                  backgroundColor: entry.accent,
                                                }}
                                              />
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
                        })}
                      </div>
                    </div>
                  }>
                  <XDSButton label="Browse" variant="ghost" size="sm" />
                </XDSPopover>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, 44px)',
                  gap: 8,
                  marginTop: 16,
                }}>
                {THEME_PICKER_ENTRIES.filter(e => pinnedThemes.has(e.key)).map(
                  entry => {
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
                              ? '1.5px solid var(--color-accent)'
                              : '1px solid var(--color-border-emphasized)',
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
                  },
                )}
              </div>
            </div>
          </XDSVStack>
        </div>

        {/* More like this */}
        {moreLikeThis && moreLikeThis.length > 0 && (
          <div style={{padding: '0 32px'}}>
            <XDSHeading level={3}>More like this</XDSHeading>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                marginTop: 16,
              }}>
              {moreLikeThis.map(mlItem => (
                <XDSCard
                  key={mlItem.key}
                  padding={0}
                  onClick={() => {
                    if (onMoreLikeThisClick) {
                      setTransitioning(true);
                      setTimeout(() => {
                        onMoreLikeThisClick(mlItem);
                        scrollRef.current?.scrollTo({top: 0});
                        setTimeout(() => setTransitioning(false), 50);
                      }, 250);
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    aspectRatio: '16/10',
                    overflow: 'hidden',
                  }}>
                  {mlItem.slug ? (
                    <iframe
                      src={`${basePath}/templates/${mlItem.slug}/?embed=1`}
                      title={mlItem.name}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        display: 'block',
                        pointerEvents: 'none',
                        opacity: transitioning ? 0 : 1,
                        transition: 'opacity 250ms ease',
                      }}
                    />
                  ) : (
                    <img
                      src={mlItem.themeImages?.[selectedTheme] ?? mlItem.img}
                      alt={mlItem.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top',
                        display: 'block',
                        opacity: transitioning ? 0 : 1,
                        transition: 'opacity 250ms ease',
                        animation: transitioning
                          ? 'none'
                          : 'previewFadeIn 300ms ease',
                      }}
                    />
                  )}
                </XDSCard>
              ))}
            </div>
          </div>
        )}

        {/* Explore more */}
        {exploreTags && exploreTags.length > 0 && (
          <div style={{padding: '32px 32px 0'}}>
            <XDSHeading level={3}>Explore more</XDSHeading>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 16,
                opacity: transitioning ? 0 : 1,
                transition: 'opacity 250ms ease',
                animation: transitioning ? 'none' : 'previewFadeIn 300ms ease',
              }}>
              {exploreTags.map(tag => (
                <XDSToken
                  key={tag}
                  label={tag}
                  xstyle={tokenStyles.pill}
                  style={{backgroundColor: 'transparent', cursor: 'pointer'}}
                  onClick={() => onExploreTagClick?.(tag)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Component used */}
        {componentTags && componentTags.length > 0 && (
          <div style={{padding: '32px 32px 32px'}}>
            <XDSHeading level={3}>Component used</XDSHeading>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 16,
                opacity: transitioning ? 0 : 1,
                transition: 'opacity 250ms ease',
                animation: transitioning ? 'none' : 'previewFadeIn 300ms ease',
              }}>
              {componentTags.map(c => (
                <XDSToken
                  key={c}
                  label={c}
                  xstyle={tokenStyles.outline}
                  style={{backgroundColor: 'transparent', cursor: 'pointer'}}
                  onClick={() => onComponentTagClick?.(c)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </XDSDialog>
  );
}
