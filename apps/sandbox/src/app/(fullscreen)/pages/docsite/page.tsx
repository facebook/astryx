'use client';

import * as stylex from '@stylexjs/stylex';
import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {useSearchParams} from 'next/navigation';

import {
  TEMPLATES,
  AVATAR_IMAGE,
  XDS_DESIGN_AVATAR,
  FILTER_COLUMNS,
  PROFILE_CRAFT_ITEMS,
  THEME_PICKER_ENTRIES,
  basePath,
} from './constants';
import type {ThemePickerEntry} from './constants';
import {TemplateCard} from './TemplateCard';
import {AIComposer} from './AIComposer';
import {COMPONENT_PREVIEW_LIST} from './ComponentPreviews';

import {ChatPanel} from './ChatPanel';
import type {PanelTab, PointedElement} from './ChatPanel';
import {InlinePublishPanel} from './InlinePublishPanel';
import {TemplatePreview} from './TemplatePreview';
import {SharePopoverContent} from './SharePopover';
import {TemplatePreviewModal} from './TemplatePreviewModal';
import {AppTopNav} from './AppTopNav';
import {DocsView} from './DocsView';
import {ThemeEditorView} from './ThemeEditorView';
import {ProfileView} from './ProfileView';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSDivider} from '@xds/core/Divider';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSToken} from '@xds/core/Token';
import {XDSIcon} from '@xds/core/Icon';
import {XDSLink} from '@xds/core/Link';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSPopover} from '@xds/core/Popover';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSToolbar} from '@xds/core/Toolbar';

import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {
  ArrowLeftIcon,
  SearchIcon,
  PaletteIcon,
  ContrastIcon,
  MoonIcon,
  VerifiedIcon,
  FilterIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
} from './docsite-icons';

const popoverStyles = stylex.create({
  filterDropdown: {
    padding: 8,
  },
});

function SearchableFilterDropdown({
  label,
  items,
  selectedFilters,
  onToggle,
  verifiedItems,
}: {
  label: string;
  items: string[];
  selectedFilters: Set<string>;
  onToggle: (item: string) => void;
  verifiedItems?: Set<string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = items.filter(item =>
    item.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <XDSPopover
      label={label}
      placement="below"
      alignment="start"
      width={280}
      isOpen={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (!open) setSearch('');
      }}
      xstyle={popoverStyles.filterDropdown}
      content={
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
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
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onChange={setSearch}
            size="lg"
            startIcon={SearchIcon}
          />
          <div style={{maxHeight: 280, overflowY: 'auto', margin: '0 -8px'}}>
            {filtered.length === 0 ? (
              <div style={{padding: '12px 16px'}}>
                <XDSText type="body" color="secondary">
                  No results
                </XDSText>
              </div>
            ) : (
              <XDSList density="spacious">
                {filtered.map(item => (
                  <XDSListItem
                    key={item}
                    label={item}
                    isSelected={selectedFilters.has(item)}
                    onClick={() => onToggle(item)}
                    endContent={
                      verifiedItems?.has(item) ? (
                        <XDSIcon icon={VerifiedIcon} size="sm" color="accent" />
                      ) : undefined
                    }
                  />
                ))}
              </XDSList>
            )}
          </div>
        </div>
      }>
      <XDSButton
        label={label}
        variant="ghost"
        size="sm"
        endContent={<XDSIcon icon="chevronDown" size="sm" color="inherit" />}
      />
    </XDSPopover>
  );
}

// ---------------------------------------------------------------------------
// ThemeCard — mirrors TemplateCard layout for visual consistency
// ---------------------------------------------------------------------------

function ThemeCard({
  theme,
  index,
  onCustomize,
  onEdit,
}: {
  theme: ThemePickerEntry;
  index: number;
  onCustomize: () => void;
  onEdit: (theme: ThemePickerEntry) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div
      style={{
        animation: `craftCardFadeIn 400ms ${index * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
      }}>
      <XDSCard padding={0}>
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onCustomize}>
          {theme.preview.img ? (
            <img
              src={`${basePath}/docsite/${theme.preview.img}`}
              alt={theme.name}
              style={{
                display: 'block',
                width: '100%',
                aspectRatio: '1920 / 1205',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                aspectRatio: '1920 / 1205',
                backgroundColor: theme.preview.bg,
                padding: '6% 7%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontFamily: theme.preview.font ?? 'system-ui, sans-serif',
                overflow: 'hidden',
              }}>
              {/* Brand name + accent dot */}
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: theme.preview.radius ?? 4,
                    backgroundColor: theme.preview.accent,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: theme.preview.text,
                    lineHeight: 1,
                  }}>
                  {theme.name}
                </span>
              </div>
              {/* Color palette */}
              <div style={{display: 'flex', gap: '3%'}}>
                {[
                  {color: theme.preview.accent, label: 'Accent'},
                  {color: theme.preview.bg, label: 'Background'},
                  {color: theme.preview.surface, label: 'Surface'},
                  {color: theme.preview.text, label: 'Text'},
                ].map(swatch => (
                  <div key={swatch.label} style={{flex: 1}}>
                    <div
                      style={{
                        aspectRatio: '1',
                        borderRadius: theme.preview.radius ?? 8,
                        backgroundColor: swatch.color,
                        border:
                          swatch.color === theme.preview.bg
                            ? `1px solid ${theme.preview.surface}`
                            : 'none',
                      }}
                    />
                    <div
                      style={{
                        fontSize: 7,
                        color: theme.preview.text,
                        opacity: 0.5,
                        marginTop: 3,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                      {swatch.label}
                    </div>
                  </div>
                ))}
              </div>
              {/* Font + description */}
              <div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 300,
                    color: theme.preview.text,
                    lineHeight: 1,
                    opacity: 0.8,
                  }}>
                  Aa
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: theme.preview.text,
                    opacity: 0.4,
                    marginTop: 2,
                  }}>
                  {(theme.preview.font ?? 'System UI').split(',')[0].trim()}
                </div>
              </div>
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--color-overlay, rgba(0,0,0,0.5))',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 300ms ease',
            }}>
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
              }}
              onClick={e => e.stopPropagation()}>
              <XDSButton
                label="Bookmark"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={bookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
                style={{color: '#fff'}}
                onClick={() => setBookmarked(prev => !prev)}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 16,
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}>
              <XDSStack direction="vertical" gap={0}>
                <XDSHeading level={3} style={{color: '#fff'}}>
                  {theme.name}
                </XDSHeading>
                {theme.description && (
                  <XDSText
                    type="supporting"
                    style={{color: 'rgba(255,255,255,0.7)'}}>
                    {theme.description}
                  </XDSText>
                )}
              </XDSStack>
              <XDSStack direction="horizontal" gap={2}>
                <XDSButton
                  label="Use"
                  variant="secondary"
                  size="sm"
                  style={{backgroundColor: 'var(--color-background-surface)'}}
                  onClick={e => {
                    e.stopPropagation();
                    onCustomize();
                  }}
                />
                <XDSButton
                  label="Craft"
                  variant="secondary"
                  size="sm"
                  style={{backgroundColor: 'var(--color-background-surface)'}}
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(theme);
                  }}
                />
              </XDSStack>
            </div>
          </div>
        </div>
      </XDSCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocsiteLandingPage() {
  return (
    <Suspense fallback={null}>
      <DocsiteLandingTemplate />
    </Suspense>
  );
}

function DocsiteLandingTemplate() {
  const searchParams = useSearchParams();
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [previewTheme, setPreviewTheme] = useState('default');

  const previewImageFilter = useMemo(() => {
    const filters: string[] = [];
    if (previewMode === 'dark') {
      filters.push('invert(0.88)', 'hue-rotate(180deg)');
    }
    const themeFilters: Record<string, string> = {
      neutral: 'saturate(0.3)',
      brutalist: 'contrast(1.2) saturate(0.5)',
      matcha: 'sepia(0.2) saturate(1.2) hue-rotate(80deg)',
      daily: 'sepia(0.1) saturate(1.1) hue-rotate(10deg)',
    };
    if (themeFilters[previewTheme]) {
      filters.push(themeFilters[previewTheme]);
    }
    return filters.length > 0 ? filters.join(' ') : undefined;
  }, [previewMode, previewTheme]);

  // Read initial state from URL params
  const initialView = useMemo(() => {
    const v = searchParams.get('view');
    const t = searchParams.get('template');
    const q = searchParams.get('q');
    const page = searchParams.get('page');
    const tab = searchParams.get('tab');
    const craft = searchParams.get('craft');
    const used = searchParams.get('used');
    const settings = searchParams.get('settings');
    const collection = searchParams.get('collection');
    const templateIdx = t !== null ? parseInt(t, 10) : null;

    // Tab values like "theme", "components", "templates" are tabs within the
    // craft view, not standalone pages. Map them so ?page=theme opens the craft
    // view with the correct tab pre-selected.
    const CRAFT_TABS = ['all', 'templates', 'components'];
    const isCraftTab = page !== null && CRAFT_TABS.includes(page);

    const component = searchParams.get('component');
    let docsComponent: string | null = null;
    if (page === 'docs') {
      if (tab === 'whats-new' || tab === 'getting-started') {
        docsComponent = tab;
      } else if (component) {
        docsComponent = component;
      }
    }

    return {
      view: v,
      templateIdx: isNaN(templateIdx as number) ? null : templateIdx,
      query: q,
      page: isCraftTab
        ? ('craft' as const)
        : (page as 'craft' | 'explore' | 'docs' | 'profile' | 'theme' | null),
      craftTab: isCraftTab ? page : null,
      tab:
        tab && ['Crafted', 'Used', 'Bookmarks'].includes(tab)
          ? (tab as 'Crafted' | 'Used' | 'Bookmarks')
          : null,
      craft,
      used,
      settings: settings === '1',
      collection,
      docsComponent,
    };
  }, [searchParams]);

  const [activeView, setActiveView] = useState(
    (initialView.page ?? 'craft') as
      | 'craft'
      | 'explore'
      | 'docs'
      | 'profile'
      | 'theme',
  );
  const [docsComponent, setDocsComponent] = useState<string | null>(
    initialView.docsComponent,
  );
  const [profileTab, setProfileTab] = useState<
    'Crafted' | 'Used' | 'Bookmarks'
  >(initialView.tab ?? 'Crafted');
  const [profileCraftName, setProfileCraftName] = useState<string | null>(
    initialView.craft,
  );
  const [profileUsedName, setProfileUsedName] = useState<string | null>(
    initialView.used,
  );
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(
    initialView.settings,
  );
  const [profileCollectionName, setProfileCollectionName] = useState<
    string | null
  >(initialView.collection);
  const [craftTitle, setCraftTitle] = useState<string | null>(
    initialView.query,
  );
  const [isProfileResults, setIsProfileResults] = useState(false);
  const [isCraftResults, setIsCraftResults] = useState(false);
  const [craftStatusFilter, setCraftStatusFilter] = useState('all');
  const [craftLoading, setCraftLoading] = useState(false);
  const [craftExiting, setCraftExiting] = useState(false);
  const [resultFilters, setResultFilters] = useState<Set<string>>(
    () => new Set(),
  );
  const handleToggleResultFilter = useCallback((filter: string) => {
    setResultFilters(prev => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  }, []);
  const craftLoadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleBackFromResults = useCallback(() => {
    setCraftExiting(true);
    setCraftLoading(true);
    setResultFilters(new Set());
    setIsProfileResults(false);
    setIsCraftResults(false);
    setCraftStatusFilter('all');
    if (craftLoadingTimer.current) clearTimeout(craftLoadingTimer.current);
    craftLoadingTimer.current = setTimeout(() => {
      setCraftTitle(null);
      setCraftLoading(false);
      setCraftExiting(false);
      craftLoadingTimer.current = null;
    }, 600);
  }, []);
  const handleTokenClick = useCallback((label: string) => {
    setPreviewTarget(null);
    setCraftTitle(label);
    setIsProfileResults(false);
    setCraftLoading(true);
    if (craftLoadingTimer.current) clearTimeout(craftLoadingTimer.current);
    craftLoadingTimer.current = setTimeout(() => {
      setCraftLoading(false);
      craftLoadingTimer.current = null;
    }, 900);
  }, []);
  const loadedIframesRef = useRef<Set<string>>(new Set());
  const handleIframeLoad = useCallback((slug: string) => {
    loadedIframesRef.current.add(slug);
  }, []);
  const [selected, setSelected] = useState(new Set());
  const [templateFilter, setTemplateFilter] = useState<
    'all' | 'official' | string
  >('all');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    () => new Set(),
  );
  const [sortOption, setSortOption] = useState('trending');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialView.craftTab ?? 'all');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [generatingSource, setGeneratingSource] = useState(
    null as number | null,
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState(
    initialView.view === 'preview' ? initialView.templateIdx : null,
  );
  const [useTarget, setUseTarget] = useState(
    initialView.view === 'editor' ? initialView.templateIdx : null,
  );
  const [previewGenerating, setPreviewGenerating] = useState(false);
  const [showPublishCard1, setShowPublishCard1] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>('configure');
  const [isPointing, setIsPointing] = useState(false);
  const [pointedElement, setPointedElement] = useState<PointedElement>(null);
  const [editorPanelWidth, setEditorPanelWidth] = useState(380);
  const [isEditorResizing, setIsEditorResizing] = useState(false);
  const [_editorViewport, _setEditorViewport] = useState('desktop');
  const [fullPreview, setFullPreview] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [card4Bookmarked, setCard4Bookmarked] = useState(false);
  const [themePreviewKey, setThemePreviewKey] = useState<string | null>(null);
  const [themeEditorImage, setThemeEditorImage] = useState<string | null>(null);
  const [themeEditorInitial, setThemeEditorInitial] = useState<{
    accent: string;
    font?: string;
    radius?: number;
  } | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<{
    name: string;
    img: string;
    key: string;
    themeImages?: Record<string, string>;
  } | null>(null);
  const [editorVariantImage, setEditorVariantImage] = useState<string | null>(
    null,
  );
  const [chatReply, setChatReply] = useState<string | null>(null);

  const handleEditorResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsEditorResizing(true);
      const startX = e.clientX;
      const startWidth = editorPanelWidth;

      const onMouseMove = (ev: MouseEvent) => {
        const maxWidth = Math.floor(window.innerWidth / 2);
        const newWidth = Math.min(
          Math.max(startWidth + (ev.clientX - startX), 280),
          maxWidth,
        );
        setEditorPanelWidth(newWidth);
      };
      const onMouseUp = () => {
        setIsEditorResizing(false);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [editorPanelWidth],
  );

  const isPopstateRef = useRef(false);
  const prevUrlRef = useRef('');

  // Sync URL when view state changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (previewTarget !== null) {
      params.set('view', 'preview');
      params.set('template', String(previewTarget));
    } else if (useTarget !== null) {
      params.set('view', 'editor');
      params.set('template', String(useTarget));
    } else if (craftTitle) {
      params.set('q', craftTitle);
    } else if (activeView === 'craft' && activeTab !== 'all') {
      params.set('page', activeTab);
    } else if (activeView !== 'craft') {
      params.set('page', activeView);
      if (activeView === 'docs') {
        if (
          docsComponent === 'whats-new' ||
          docsComponent === 'getting-started'
        ) {
          params.set('tab', docsComponent);
        } else if (docsComponent !== null) {
          params.set('component', docsComponent);
        }
      } else if (activeView === 'profile') {
        if (profileCraftName) {
          params.set('tab', 'Crafted');
          params.set('craft', profileCraftName);
        } else if (profileUsedName) {
          params.set('tab', 'Used');
          params.set('used', profileUsedName);
        } else if (profileCollectionName) {
          params.set('tab', 'Bookmarks');
          params.set('collection', profileCollectionName);
        } else if (profileTab !== 'Crafted') {
          params.set('tab', profileTab);
        }
        if (profileSettingsOpen) {
          params.set('settings', '1');
        }
      }
    }

    const qs = params.toString();
    if (qs === window.location.search.slice(1)) return;
    const url = `${basePath}/pages/docsite/${qs ? '?' + qs : ''}`;

    if (isPopstateRef.current) {
      isPopstateRef.current = false;
      prevUrlRef.current = qs;
      return;
    }

    const prevParams = new URLSearchParams(prevUrlRef.current);
    const prevPage = prevParams.get('page');
    const prevComponent = prevParams.get('component');
    const prevTab = prevParams.get('tab');
    const prevView = prevParams.get('view');
    const curPage = params.get('page');
    const curComponent = params.get('component');
    const curTab = params.get('tab');
    const curView = params.get('view');

    const isSignificant =
      curView !== prevView ||
      curPage !== prevPage ||
      curComponent !== prevComponent ||
      (curPage === 'docs' && curTab !== prevTab);

    if (isSignificant) {
      window.history.pushState(null, '', url);
    } else {
      window.history.replaceState(window.history.state, '', url);
    }
    prevUrlRef.current = qs;
  }, [
    previewTarget,
    useTarget,
    craftTitle,
    activeView,
    activeTab,
    docsComponent,
    profileTab,
    profileCraftName,
    profileUsedName,
    profileSettingsOpen,
    profileCollectionName,
  ]);

  useEffect(() => {
    const onPopState = () => {
      isPopstateRef.current = true;
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      const view = params.get('view');
      const template = params.get('template');
      const q = params.get('q');

      if (view === 'preview' && template !== null) {
        setPreviewTarget(parseInt(template, 10));
        setUseTarget(null);
      } else if (view === 'editor' && template !== null) {
        setUseTarget(parseInt(template, 10));
        setPreviewTarget(null);
      } else if (q) {
        setCraftTitle(q);
        setPreviewTarget(null);
        setUseTarget(null);
      } else {
        setPreviewTarget(null);
        setUseTarget(null);
        setCraftTitle(null);
        const CRAFT_TABS = ['all', 'templates', 'components'];
        if (page && CRAFT_TABS.includes(page)) {
          setActiveView('craft');
          setActiveTab(page);
        } else if (page === 'docs') {
          setActiveView('docs');
          const tab = params.get('tab');
          const component = params.get('component');
          if (tab === 'whats-new' || tab === 'getting-started') {
            setDocsComponent(tab);
          } else if (component) {
            setDocsComponent(component);
          } else {
            setDocsComponent(null);
          }
        } else if (page === 'profile' || page === 'theme') {
          setActiveView(page);
        } else {
          setActiveView('craft');
          setActiveTab('all');
        }
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const prevViewRef = useRef(activeView);
  const skipViewResetRef = useRef(false);
  useEffect(() => {
    if (prevViewRef.current === activeView) return;
    prevViewRef.current = activeView;
    if (skipViewResetRef.current) {
      skipViewResetRef.current = false;
      return;
    }
    setPreviewTarget(null);
    setUseTarget(null);
    setChatOpen(false);
    setCraftTitle(null);
    setResultFilters(new Set());
    if (activeView !== 'docs') {
      setDocsComponent(null);
    }
  }, [activeView]);
  const timerRef = useRef(null as ReturnType<typeof setTimeout> | null);
  const previewTimerRef = useRef(null as ReturnType<typeof setTimeout> | null);
  useEffect(() => {
    const mobileMql = window.matchMedia('(max-width: 768px)');
    const tabletMql = window.matchMedia(
      '(min-width: 769px) and (max-width: 1280px)',
    );
    setIsMobile(mobileMql.matches);
    setIsTablet(tabletMql.matches);

    const mobileHandler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    const tabletHandler = (e: MediaQueryListEvent) => setIsTablet(e.matches);
    mobileMql.addEventListener('change', mobileHandler);
    tabletMql.addEventListener('change', tabletHandler);
    return () => {
      mobileMql.removeEventListener('change', mobileHandler);
      tabletMql.removeEventListener('change', tabletHandler);
    };
  }, []);

  useEffect(() => {
    const el = document.getElementById('docsite-scroll');
    if (!el) return;
    const onScroll = () => setIsHeaderCollapsed(el.scrollTop > 170);
    el.addEventListener('scroll', onScroll, {passive: true});
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const handleMoreLikeThis = useCallback(
    (index: number) => {
      if (generatingSource !== null) return;
      setGeneratingSource(index);
      setChatOpen(true);
      timerRef.current = setTimeout(() => {
        setGeneratingSource(null);
        timerRef.current = null;
      }, 5000);
    },
    [generatingSource],
  );

  const handleUse = useCallback(
    (index: number) => {
      viewBeforeEditorRef.current = activeView;
      setPreviewTarget(null);
      setUseTarget(index);
      setPanelTab('configure');
      setChatOpen(true);
    },
    [activeView],
  );

  const viewBeforeEditorRef = useRef<
    'craft' | 'explore' | 'docs' | 'profile' | 'theme'
  >('craft');
  const handleBackFromUse = useCallback(() => {
    setUseTarget(null);
    setChatOpen(false);
    setShowPublishCard1(false);
    setEditorVariantImage(null);
    setChatReply(null);
    const returnTo = viewBeforeEditorRef.current;
    if (returnTo !== 'craft') {
      skipViewResetRef.current = true;
      setActiveView(returnTo);
    }
  }, []);

  const handlePreview = useCallback((index: number) => {
    setPreviewTarget(index);
  }, []);

  const layoutVariantMap: Record<string, string> = {
    hero: `${basePath}/docsite/card4-hero-default.png`,
    split: `${basePath}/docsite/card4-split-default.png`,
    grid: `${basePath}/docsite/card4-grid-default.png`,
    carousel: `${basePath}/docsite/card4-carousel-default.png`,
    preview: `${basePath}/docsite/card4-preview-default.png`,
    settings: `${basePath}/docsite/card4-preview-default.png`,
    default: `${basePath}/docsite/card4-preview-default.png`,
  };

  const handlePreviewSend = useCallback(
    (prompt?: string) => {
      if (previewGenerating) return;

      const lower = (prompt ?? '').toLowerCase();
      const matchedKey = Object.keys(layoutVariantMap).find(key =>
        lower.includes(key),
      );

      setPreviewGenerating(true);
      previewTimerRef.current = setTimeout(() => {
        if (matchedKey) {
          setEditorVariantImage(layoutVariantMap[matchedKey]);
          const label =
            matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1);
          setChatReply(
            `Done! I've switched the template to the ${label} layout. Let me know if you'd like any other changes.`,
          );
        } else {
          setChatReply(
            "I've updated the template based on your request. Let me know if you'd like further changes.",
          );
        }
        setPreviewGenerating(false);
        previewTimerRef.current = null;
      }, 1500);
    },
    [previewGenerating],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (craftLoadingTimer.current) clearTimeout(craftLoadingTimer.current);
    };
  }, []);

  const isGenerating = generatingSource !== null;

  const templateAuthors = useMemo(() => {
    const authors = Array.from(new Set(TEMPLATES.map(t => t.author)));
    return authors.sort((a, b) => {
      if (a === 'XDS Design') return -1;
      if (b === 'XDS Design') return 1;
      return a.localeCompare(b);
    });
  }, []);

  const handleToggleFilter = useCallback((filter: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters(new Set());
  }, []);

  const handleProfileAction = useCallback(
    (action: 'craft' | 'bookmarked' | 'used' | 'settings') => {
      if (action === 'settings') {
        setIsSettingsOpen(true);
      } else if (action === 'craft') {
        setPreviewTarget(null);
        setCraftTitle('My Craft');
        setIsCraftResults(true);
        setIsProfileResults(true);
        setCraftStatusFilter('all');
        setCraftLoading(true);
        if (craftLoadingTimer.current) clearTimeout(craftLoadingTimer.current);
        craftLoadingTimer.current = setTimeout(() => {
          setCraftLoading(false);
          craftLoadingTimer.current = null;
        }, 900);
      } else {
        const label = action === 'bookmarked' ? 'Bookmarked' : 'Used';
        setPreviewTarget(null);
        setCraftTitle(label);
        setIsProfileResults(true);
        setIsCraftResults(false);
        setCraftLoading(true);
        if (craftLoadingTimer.current) clearTimeout(craftLoadingTimer.current);
        craftLoadingTimer.current = setTimeout(() => {
          setCraftLoading(false);
          craftLoadingTimer.current = null;
        }, 900);
      }
    },
    [],
  );

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.map((t, i) => ({...t, originalIndex: i})).filter(t => {
      if (templateFilter === 'all') return true;
      if (templateFilter === 'official') return t.isOfficial;
      return t.author.toLowerCase().includes(templateFilter.toLowerCase());
    });
  }, [templateFilter]);

  const craftStatusCounts = useMemo(
    () => ({
      published: PROFILE_CRAFT_ITEMS.filter(i => i.status === 'Published')
        .length,
      draft: PROFILE_CRAFT_ITEMS.filter(i => i.status === 'Draft').length,
      review: PROFILE_CRAFT_ITEMS.filter(i => i.status === 'In Review').length,
    }),
    [],
  );

  const filteredCraftItems = useMemo(() => {
    if (craftStatusFilter === 'all') return PROFILE_CRAFT_ITEMS;
    return PROFILE_CRAFT_ITEMS.filter(
      item => item.status === craftStatusFilter,
    );
  }, [craftStatusFilter]);

  // Editor flow — same layout for all cards
  if (useTarget !== null && activeView === 'craft') {
    const isBlankCanvas = useTarget === -1;
    const t = isBlankCanvas
      ? {
          name: 'Untitled',
          src: '',
          size: 'medium' as const,
          author: '',
          isOfficial: false,
        }
      : TEMPLATES[useTarget % TEMPLATES.length];
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'var(--color-background-surface, #fff)',
        }}>
        <style>
          {'@keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }' +
            '@keyframes checkDraw { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }' +
            '.xds-editor-resize-handle { opacity: 0; transition: opacity 150ms ease, background-color 150ms ease; }' +
            '.xds-editor-resize-grip:hover .xds-editor-resize-handle { opacity: 0.6; }' +
            '.xds-editor-resize-grip[data-resizing="true"] .xds-editor-resize-handle { opacity: 1; }'}
        </style>
        {!fullPreview && (
          <div
            style={{
              width: editorPanelWidth,
              minWidth: 280,
              maxWidth: '50vw',
              flexShrink: 0,
              padding: 16,
              paddingRight: 0,
              display: 'flex',
              animation: 'slideInLeft 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
            <div
              style={{
                flex: 1,
                backgroundColor: 'var(--color-background-card, #fff)',
                borderRadius: 16,
                border: '1px solid var(--color-divider, #e0e0e0)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column' as const,
              }}>
              {/* Persistent tab bar — hidden when publishing */}
              {!showPublishCard1 && (
                <XDSStack direction="vertical" gap={0} style={{flexShrink: 0}}>
                  <XDSStack
                    direction="horizontal"
                    gap={0}
                    vAlign="center"
                    style={{paddingLeft: 8, paddingTop: 8, paddingRight: 8}}>
                    <XDSButton
                      label="Back"
                      variant="ghost"
                      size="sm"
                      icon={<ArrowLeftIcon />}
                      isIconOnly
                      onClick={handleBackFromUse}
                    />
                    <XDSTabList
                      value={panelTab}
                      onChange={v =>
                        setPanelTab(v as 'configure' | 'properties' | 'code')
                      }
                      size="md"
                      layout="fill">
                      <XDSTab value="configure" label="Craft" />
                      <XDSTab value="code" label="Code" />
                      <XDSTab value="properties" label="Properties" />
                    </XDSTabList>
                  </XDSStack>
                  <XDSDivider variant="strong" />
                </XDSStack>
              )}
              {showPublishCard1 ? (
                <InlinePublishPanel
                  templateName={t.name}
                  isVisible={showPublishCard1}
                  onBack={() => setShowPublishCard1(false)}
                  onPublish={handleBackFromUse}
                />
              ) : (
                <ChatPanel
                  isGenerating={previewGenerating}
                  onSend={handlePreviewSend}
                  reply={chatReply}
                  activeView={activeView}
                  setActiveView={setActiveView}
                  templateName={t.name}
                  onBack={handleBackFromUse}
                  activeTab={panelTab}
                  onTabChange={setPanelTab}
                  pointedElement={pointedElement}
                  hideHeader
                />
              )}
            </div>
          </div>
        )}
        {/* Resize handle */}
        {!fullPreview && (
          <div
            onMouseDown={handleEditorResizeStart}
            data-resizing={isEditorResizing}
            className="xds-editor-resize-grip"
            style={{
              width: 16,
              flexShrink: 0,
              cursor: 'col-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              backgroundColor: 'transparent',
              marginRight: 0,
            }}>
            <div
              className="xds-editor-resize-handle"
              style={{
                width: 3,
                height: 32,
                borderRadius: 2,
                backgroundColor: isEditorResizing
                  ? 'var(--color-icon-primary, #111)'
                  : 'var(--color-border-strong, #ccc)',
              }}
            />
          </div>
        )}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as const,
            minWidth: 0,
            overflow: 'visible',
            marginLeft: -16,
            paddingLeft: 16,
          }}>
          <TemplatePreview
            templateName={t.name}
            imageSrc={editorVariantImage ?? t.src}
            slug={editorVariantImage ? undefined : t.slug}
            onBack={handleBackFromUse}
            isGenerating={previewGenerating}
            onPublish={() => {
              setShowPublishCard1(true);
              setEditorPanelWidth(380);
            }}
            isPointing={isPointing}
            onPointingChange={setIsPointing}
            onElementPointed={el => {
              setPointedElement(el);
              setPanelTab('properties');
            }}
            isPublishing={showPublishCard1}
            isFullPreview={fullPreview}
            onFullPreviewChange={setFullPreview}
            hideToolbar={fullPreview}
            previewBackground={undefined}
          />
        </div>
      </div>
    );
  }

  // All card previews are handled as a bottom drawer overlay on the craft grid below.

  if (activeView === 'theme') {
    return (
      <ThemeEditorView
        activeView={activeView}
        setActiveView={setActiveView}
        initialImage={themeEditorImage}
        initialTheme={themeEditorInitial}
        onImageConsumed={() => {
          setThemeEditorImage(null);
          setThemeEditorInitial(null);
        }}
      />
    );
  }

  if (activeView === 'docs') {
    return (
      <DocsView
        setActiveView={setActiveView}
        selectedComponent={docsComponent}
        onComponentChange={setDocsComponent}
      />
    );
  }

  if (activeView === 'profile') {
    return (
      <ProfileView
        activeView={activeView}
        setActiveView={setActiveView}
        onStartCrafting={() => {
          viewBeforeEditorRef.current = 'profile';
          skipViewResetRef.current = true;
          setActiveView('craft');
          setUseTarget(-1);
          setPanelTab('configure');
          setChatOpen(true);
        }}
        profileTab={profileTab}
        onTabChange={setProfileTab}
        profileCraftName={profileCraftName}
        onCraftPreviewChange={setProfileCraftName}
        profileUsedName={profileUsedName}
        onUsedPreviewChange={setProfileUsedName}
        profileSettingsOpen={profileSettingsOpen}
        onSettingsChange={setProfileSettingsOpen}
        profileCollectionName={profileCollectionName}
        onCollectionChange={setProfileCollectionName}
      />
    );
  }

  return (
    <XDSAppShell
      variant="surface"
      height="fill"
      style={{} as React.CSSProperties}
      topNav={
        <AppTopNav
          activeView={activeView}
          setActiveView={setActiveView}
          scrollContainerRef={scrollContainerRef}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          templateFilter={templateFilter}
          onTemplateFilterChange={setTemplateFilter}
          templateAuthors={templateAuthors}
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
          onClearFilters={handleClearFilters}
          sortOption={sortOption}
          onSortChange={setSortOption}
          isFilterOpen={isFilterOpen}
          onFilterOpenChange={setIsFilterOpen}
          craftTitle={craftTitle}
        />
      }>
      <div
        style={{
          display: 'flex',
          height: '100%',
          overflow: 'hidden',
        }}>
        {/* Chat panel */}
        <div
          style={{
            width: chatOpen ? 400 : 0,
            minWidth: chatOpen ? 400 : 0,
            overflow: 'hidden',
            transition:
              'width var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), min-width var(--duration-medium, 410ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
            borderRight: 'none',
            backgroundColor: 'var(--color-background-surface, white)',
          }}>
          {chatOpen && (
            <ChatPanel
              isGenerating={isGenerating || previewGenerating}
              onSend={undefined}
              activeView={activeView}
              setActiveView={setActiveView}
            />
          )}
        </div>

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column' as const,
          }}>
          <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
            <div
              id="docsite-scroll"
              ref={scrollContainerRef}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '0 24px 140px',
              }}>
              <style>{`
                @keyframes craftShimmer {
                  0% { background-position: -400px 0; }
                  100% { background-position: 400px 0; }
                }
                @keyframes craftCardFadeIn {
                  from { opacity: 0; transform: translateY(12px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes craftTitleSlideIn {
                  from { opacity: 0; transform: translateX(-16px); }
                  to { opacity: 1; transform: translateX(0); }
                }
                @keyframes previewFadeIn {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
              {craftTitle && (
                <div
                  style={{
                    maxWidth: 2000,
                    margin: '0 auto 16px',
                    paddingTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    ...(craftExiting
                      ? {
                          opacity: 0,
                          transform: 'translateX(-16px)',
                          transition:
                            'opacity 300ms ease, transform 300ms ease',
                        }
                      : {
                          animation:
                            'craftTitleSlideIn 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }),
                  }}>
                  {!isProfileResults && (
                    <XDSButton
                      label="Back"
                      variant="ghost"
                      size="lg"
                      icon={<ArrowLeftIcon />}
                      isIconOnly
                      onClick={handleBackFromResults}
                      style={{marginLeft: -8}}
                    />
                  )}
                  <XDSText type="display-1">{craftTitle}</XDSText>
                </div>
              )}
              {craftTitle && !craftLoading && isCraftResults && (
                <div
                  style={{
                    maxWidth: 2000,
                    margin: '0 auto 20px',
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap' as const,
                    animation:
                      'craftTitleSlideIn 400ms 100ms cubic-bezier(0.16, 1, 0.3, 1) both',
                  }}>
                  {[
                    {
                      value: 'all',
                      label: `All (${PROFILE_CRAFT_ITEMS.length})`,
                    },
                    {
                      value: 'Published',
                      label: `Published (${craftStatusCounts.published})`,
                    },
                    {
                      value: 'Draft',
                      label: `Draft (${craftStatusCounts.draft})`,
                    },
                    {
                      value: 'In Review',
                      label: `In Review (${craftStatusCounts.review})`,
                    },
                  ].map(tab => (
                    <XDSButton
                      key={tab.value}
                      label={tab.label}
                      variant={
                        craftStatusFilter === tab.value
                          ? 'primary'
                          : 'secondary'
                      }
                      size="sm"
                      onClick={() => setCraftStatusFilter(tab.value)}
                    />
                  ))}
                </div>
              )}
              {craftTitle && !craftLoading && !isCraftResults && (
                <div
                  style={{
                    maxWidth: 2000,
                    margin: '0 auto 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    animation:
                      'craftTitleSlideIn 400ms 100ms cubic-bezier(0.16, 1, 0.3, 1) both',
                  }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginLeft: -8,
                      marginRight: -8,
                    }}>
                    {FILTER_COLUMNS.map(col => (
                      <SearchableFilterDropdown
                        key={col.heading}
                        label={col.heading}
                        items={col.items}
                        selectedFilters={resultFilters}
                        onToggle={handleToggleResultFilter}
                      />
                    ))}
                    <SearchableFilterDropdown
                      label="Author"
                      items={templateAuthors}
                      selectedFilters={resultFilters}
                      onToggle={handleToggleResultFilter}
                      verifiedItems={new Set(['XDS Design'])}
                    />
                    <div
                      style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}>
                      <XDSText
                        type="supporting"
                        color="secondary"
                        style={{whiteSpace: 'nowrap'}}>
                        Showing {filteredTemplates.length} screens
                      </XDSText>
                      <XDSToolbar
                        label="View controls"
                        size="sm"
                        startContent={
                          <>
                            <XDSButton
                              label={
                                previewMode === 'dark'
                                  ? 'Light mode'
                                  : 'Dark mode'
                              }
                              variant="ghost"
                              size="sm"
                              isIconOnly
                              icon={
                                previewMode === 'dark' ? (
                                  <ContrastIcon />
                                ) : (
                                  <MoonIcon />
                                )
                              }
                              onClick={() =>
                                setPreviewMode(
                                  previewMode === 'dark' ? 'light' : 'dark',
                                )
                              }
                            />
                            <XDSDropdownMenu
                              button={{
                                label:
                                  previewTheme.charAt(0).toUpperCase() +
                                  previewTheme.slice(1),
                                variant: 'ghost',
                                size: 'sm',
                                icon: <PaletteIcon />,
                              }}
                              menuWidth={160}
                              items={[
                                {
                                  label: 'Default',
                                  onClick: () => setPreviewTheme('default'),
                                },
                                {
                                  label: 'Neutral',
                                  onClick: () => setPreviewTheme('neutral'),
                                },
                                {
                                  label: 'Brutalist',
                                  onClick: () => setPreviewTheme('brutalist'),
                                },
                                {
                                  label: 'Matcha',
                                  onClick: () => setPreviewTheme('matcha'),
                                },
                                {
                                  label: 'Daily',
                                  onClick: () => setPreviewTheme('daily'),
                                },
                              ]}
                            />
                          </>
                        }
                      />
                      <XDSDropdownMenu
                        button={{
                          label:
                            sortOption === 'trending'
                              ? 'Trending'
                              : sortOption === 'newest'
                                ? 'Newest'
                                : 'Oldest',
                          variant: 'ghost',
                          size: 'sm',
                        }}
                        items={[
                          {
                            label: 'Trending',
                            onClick: () => setSortOption('trending'),
                          },
                          {
                            label: 'Newest',
                            onClick: () => setSortOption('newest'),
                          },
                          {
                            label: 'Oldest',
                            onClick: () => setSortOption('oldest'),
                          },
                        ]}
                      />
                    </div>
                  </div>
                  {resultFilters.size > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}>
                      {Array.from(resultFilters).map(f => (
                        <XDSToken
                          key={f}
                          label={f}
                          size="sm"
                          onRemove={() => handleToggleResultFilter(f)}
                        />
                      ))}
                      <XDSText type="supporting">
                        <XDSLink
                          label="Clear all"
                          color="secondary"
                          onClick={() => setResultFilters(new Set())}>
                          Clear all
                        </XDSLink>
                      </XDSText>
                    </div>
                  )}
                </div>
              )}

              {/* Hero heading */}
              {!craftTitle && (
                <div
                  style={{
                    maxWidth: 2000,
                    margin: '0 auto',
                    paddingTop: 48,
                    paddingBottom: 32,
                    textAlign: 'center',
                  }}>
                  <XDSText type="display-1">Craft what you imagine.</XDSText>
                </div>
              )}

              {/* Tab row — scrolls away, AppTopNav takes over */}
              {!craftTitle && (
                <div
                  style={{
                    maxWidth: 2000,
                    margin: '0 auto',
                    paddingBottom: 24,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                  }}>
                  <div />
                  <XDSTabList
                    value={activeTab}
                    onChange={setActiveTab}
                    size="sm">
                    <XDSTab value="all" label="All" />
                    <XDSTab value="templates" label="Templates" />
                    <XDSTab value="theme" label="Theme" />
                    <XDSTab value="components" label="Components" />
                  </XDSTabList>
                  <div style={{justifySelf: 'end', display: 'flex', gap: 4}}>
                    {activeTab !== 'theme' && (
                      <>
                        <XDSButton
                          label="Filter"
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          icon={<FilterIcon />}
                          onClick={() => setIsFilterOpen(!isFilterOpen)}
                        />
                        <XDSDropdownMenu
                          button={{
                            label:
                              sortOption === 'trending'
                                ? 'Trending'
                                : sortOption === 'newest'
                                  ? 'Newest'
                                  : 'Oldest',
                            variant: 'ghost',
                            size: 'sm',
                          }}
                          items={[
                            {
                              label: 'Trending',
                              onClick: () => setSortOption('trending'),
                            },
                            {
                              label: 'Newest',
                              onClick: () => setSortOption('newest'),
                            },
                            {
                              label: 'Oldest',
                              onClick: () => setSortOption('oldest'),
                            },
                          ]}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Filter panel — sticky, independent of tab row */}
              {!craftTitle && isFilterOpen && activeTab !== 'theme' && (
                <div
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 9,
                    backgroundColor: 'var(--color-background-surface, #fff)',
                    marginInline: -24,
                    paddingInline: 24,
                    boxShadow: isHeaderCollapsed
                      ? '0 1px 3px rgba(0,0,0,0.08)'
                      : 'none',
                    transition: 'box-shadow 200ms ease',
                  }}>
                  <div
                    style={{
                      maxWidth: 2000,
                      margin: '0 auto',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 24,
                      padding: '24px 8px',
                    }}>
                    <div>
                      <XDSText
                        type="supporting"
                        color="secondary"
                        style={{marginBottom: 12, display: 'block'}}>
                        Author
                      </XDSText>
                      <div style={{marginLeft: -8, marginRight: -8}}>
                        <XDSList density="compact">
                          <XDSListItem
                            label="All"
                            isSelected={templateFilter === 'all'}
                            onClick={() => setTemplateFilter('all')}
                          />
                          <XDSListItem
                            label="XDS Official"
                            isSelected={templateFilter === 'official'}
                            onClick={() => setTemplateFilter('official')}
                          />
                        </XDSList>
                      </div>
                    </div>
                    {FILTER_COLUMNS.map(col => (
                      <div key={col.heading}>
                        <XDSText
                          type="supporting"
                          color="secondary"
                          style={{marginBottom: 12, display: 'block'}}>
                          {col.heading}
                        </XDSText>
                        <div style={{marginLeft: -8, marginRight: -8}}>
                          <XDSList density="compact">
                            {col.items.map(item => (
                              <XDSListItem
                                key={item}
                                label={item}
                                isSelected={activeFilters.has(item)}
                                onClick={() => handleToggleFilter(item)}
                              />
                            ))}
                          </XDSList>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active filter chips */}
              {!craftTitle &&
                activeFilters.size > 0 &&
                activeTab !== 'theme' && (
                  <div
                    style={{
                      maxWidth: 2000,
                      margin: '0 auto 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}>
                    {Array.from(activeFilters).map(filter => (
                      <XDSToken
                        key={filter}
                        label={filter}
                        onRemove={() => handleToggleFilter(filter)}
                      />
                    ))}
                    <XDSText type="supporting">
                      <XDSLink
                        label="Clear all"
                        color="secondary"
                        onClick={handleClearFilters}>
                        Clear all
                      </XDSLink>
                    </XDSText>
                  </div>
                )}

              {/* Theme tab content */}
              {!craftTitle && activeTab === 'theme' && (
                <div
                  style={{
                    maxWidth: 2000,
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? '1fr'
                      : isTablet
                        ? 'repeat(2, 1fr)'
                        : 'repeat(3, 1fr)',
                    gap: 16,
                  }}>
                  {[...THEME_PICKER_ENTRIES]
                    .sort((a, b) => {
                      const imgOrder = [
                        'forest',
                        'daily',
                        'midnight',
                        'sunset',
                      ];
                      const ai = a.preview.img
                        ? imgOrder.indexOf(a.key)
                        : imgOrder.length;
                      const bi = b.preview.img
                        ? imgOrder.indexOf(b.key)
                        : imgOrder.length;
                      return (
                        (ai === -1 ? imgOrder.length : ai) -
                        (bi === -1 ? imgOrder.length : bi)
                      );
                    })
                    .map((theme, i) => (
                      <ThemeCard
                        key={theme.key}
                        theme={theme}
                        index={i}
                        onCustomize={() => setThemePreviewKey(theme.key)}
                        onEdit={(t: ThemePickerEntry) => {
                          setThemeEditorInitial({
                            accent: t.preview.accent,
                            font: t.preview.font,
                            radius: t.preview.radius,
                          });
                          setThemeEditorImage(
                            t.preview.img
                              ? `${basePath}/docsite/${t.preview.img}`
                              : null,
                          );
                          setActiveView('theme');
                        }}
                      />
                    ))}
                </div>
              )}

              {/* Template grid */}
              {(craftTitle || activeTab !== 'theme') &&
                (craftLoading ? (
                  <div
                    style={{
                      maxWidth: 2000,
                      margin: '0 auto',
                      display: 'grid',
                      gridTemplateColumns: isMobile
                        ? '1fr'
                        : isTablet
                          ? 'repeat(2, 1fr)'
                          : 'repeat(3, 1fr)',
                      gap: 16,
                    }}>
                    {Array.from({length: 8}).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          borderRadius: 16,
                          overflow: 'hidden',
                          animation: `craftCardFadeIn 400ms ${i * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                        }}>
                        <div
                          style={{
                            aspectRatio: '4 / 3',
                            background:
                              'linear-gradient(90deg, var(--color-background-muted, #f0f0f0) 0%, var(--color-background-surface, #fafafa) 50%, var(--color-background-muted, #f0f0f0) 100%)',
                            backgroundSize: '800px 100%',
                            animation: 'craftShimmer 1.6s ease-in-out infinite',
                            borderRadius: '16px 16px 0 0',
                          }}
                        />
                        <div
                          style={{
                            padding: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                          }}>
                          <div
                            style={{
                              height: 14,
                              width: '60%',
                              borderRadius: 6,
                              background:
                                'linear-gradient(90deg, var(--color-background-muted, #f0f0f0) 0%, var(--color-background-surface, #fafafa) 50%, var(--color-background-muted, #f0f0f0) 100%)',
                              backgroundSize: '800px 100%',
                              animation:
                                'craftShimmer 1.6s ease-in-out infinite',
                            }}
                          />
                          <div
                            style={{
                              height: 10,
                              width: '40%',
                              borderRadius: 6,
                              background:
                                'linear-gradient(90deg, var(--color-background-muted, #f0f0f0) 0%, var(--color-background-surface, #fafafa) 50%, var(--color-background-muted, #f0f0f0) 100%)',
                              backgroundSize: '800px 100%',
                              animation:
                                'craftShimmer 1.6s ease-in-out infinite',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isCraftResults ? (
                  <div
                    style={{
                      maxWidth: 2000,
                      margin: '0 auto',
                      display: 'grid',
                      gridTemplateColumns: isMobile
                        ? '1fr'
                        : isTablet
                          ? 'repeat(2, 1fr)'
                          : 'repeat(3, 1fr)',
                      gap: 16,
                    }}>
                    {filteredCraftItems.map((item, i) => (
                      <XDSCard
                        key={item.name}
                        padding={0}
                        style={{
                          overflow: 'hidden',
                          animation: `craftCardFadeIn 400ms ${i * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                        }}>
                        <div
                          style={{
                            aspectRatio: '16 / 9',
                            overflow: 'hidden',
                            backgroundColor:
                              'var(--color-background-muted, #f0f0f0)',
                          }}>
                          <img
                            src={item.img}
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'top',
                              display: 'block',
                            }}
                          />
                        </div>
                        <div style={{padding: 16}}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                            }}>
                            <XDSText type="body" weight="bold">
                              {item.name}
                            </XDSText>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-control)',
                                whiteSpace: 'nowrap' as const,
                                flexShrink: 0,
                                backgroundColor:
                                  item.status === 'Published'
                                    ? '#ECFDF3'
                                    : item.status === 'In Review'
                                      ? '#FFFAEB'
                                      : '#F2F4F7',
                                color:
                                  item.status === 'Published'
                                    ? '#027A48'
                                    : item.status === 'In Review'
                                      ? '#B54708'
                                      : '#667085',
                              }}>
                              {item.status}
                            </span>
                          </div>
                          <div style={{marginTop: 4}}>
                            <XDSText type="supporting" color="secondary">
                              {item.type}
                            </XDSText>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 16,
                              marginTop: 12,
                            }}>
                            <div>
                              <XDSText type="supporting" color="secondary">
                                {item.used} uses
                              </XDSText>
                            </div>
                            <div>
                              <XDSText type="supporting" color="secondary">
                                {item.views} views
                              </XDSText>
                            </div>
                            <div style={{marginLeft: 'auto'}}>
                              <XDSText type="supporting" color="secondary">
                                {new Date(item.lastUpdated).toLocaleDateString(
                                  'en-US',
                                  {month: 'short', day: 'numeric'},
                                )}
                              </XDSText>
                            </div>
                          </div>
                        </div>
                      </XDSCard>
                    ))}
                    {filteredCraftItems.length === 0 && (
                      <div
                        style={{
                          gridColumn: '1 / -1',
                          padding: 32,
                          textAlign: 'center' as const,
                        }}>
                        <XDSText type="body" color="secondary">
                          No items match this filter.
                        </XDSText>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    key={activeTab}
                    style={{
                      maxWidth: 2000,
                      margin: '0 auto',
                      display: 'grid',
                      gridTemplateColumns: isMobile
                        ? '1fr'
                        : isTablet
                          ? 'repeat(2, 1fr)'
                          : 'repeat(3, 1fr)',
                      gap: 16,
                    }}>
                    {activeTab === 'components'
                      ? COMPONENT_PREVIEW_LIST.map(
                          ({key, label, preview}, i) => (
                            <XDSCard
                              key={key}
                              padding={0}
                              style={{
                                animation: `craftCardFadeIn 400ms ${i * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                              }}>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  height: '100%',
                                }}>
                                <div
                                  style={{
                                    padding: '32px 20px',
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor:
                                      'var(--color-background-body)',
                                  }}>
                                  {preview}
                                </div>
                                <div
                                  style={{
                                    padding: '12px 16px',
                                    borderTop:
                                      '1px solid var(--color-border-emphasized)',
                                    backgroundColor:
                                      'var(--color-background-body)',
                                  }}>
                                  <XDSText type="body" weight="bold">
                                    {label}
                                  </XDSText>
                                </div>
                              </div>
                            </XDSCard>
                          ),
                        )
                      : filteredTemplates.flatMap((template, i) => {
                          const items = [
                            <div
                              key={`${template.name}-${template.originalIndex}`}
                              style={{
                                animation: `craftCardFadeIn 400ms ${i * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                                filter: previewImageFilter,
                                transition: 'filter 300ms ease',
                              }}>
                              <TemplateCard
                                src={template.src}
                                slug={template.slug}
                                name={template.name}
                                isSelected={selected.has(
                                  template.originalIndex,
                                )}
                                isGenerating={
                                  isGenerating &&
                                  generatingSource !== template.originalIndex
                                }
                                cardSize={template.size}
                                isCached={
                                  !!template.slug &&
                                  loadedIframesRef.current.has(template.slug)
                                }
                                onIframeLoad={handleIframeLoad}
                                onSelect={() =>
                                  setSelected(prev => {
                                    const next = new Set(prev);
                                    if (next.has(template.originalIndex)) {
                                      next.delete(template.originalIndex);
                                    } else {
                                      next.add(template.originalIndex);
                                    }
                                    return next;
                                  })
                                }
                                onMoreLikeThis={() =>
                                  handleMoreLikeThis(template.originalIndex)
                                }
                                onUse={() => handleUse(template.originalIndex)}
                                onPreview={() =>
                                  handlePreview(template.originalIndex)
                                }
                              />
                            </div>,
                          ];
                          if (activeTab === 'all' && i === 0) {
                            items.unshift(
                              ...THEME_PICKER_ENTRIES.filter(
                                t => t.key === 'daily' || t.key === 'forest',
                              ).map((t, ti) => (
                                <ThemeCard
                                  key={`theme-${t.key}`}
                                  theme={t}
                                  index={ti}
                                  onCustomize={() => setThemePreviewKey(t.key)}
                                  onEdit={(t: ThemePickerEntry) => {
                                    setThemeEditorInitial({
                                      accent: t.preview.accent,
                                      font: t.preview.font,
                                      radius: t.preview.radius,
                                    });
                                    setThemeEditorImage(
                                      t.preview.img
                                        ? `${basePath}/docsite/${t.preview.img}`
                                        : null,
                                    );
                                    setActiveView('theme');
                                  }}
                                />
                              )),
                            );
                          }
                          if (activeTab === 'all' && i === 7) {
                            const picks = COMPONENT_PREVIEW_LIST.filter(c =>
                              ['slider', 'switch', 'progressbar'].includes(
                                c.key,
                              ),
                            );
                            items.push(
                              ...picks.map((comp, ci) => (
                                <XDSCard
                                  key={`comp-${comp.key}`}
                                  padding={0}
                                  style={{
                                    animation: `craftCardFadeIn 400ms ${(i + ci + 1) * 60}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                                  }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      height: '100%',
                                    }}>
                                    <div
                                      style={{
                                        padding: '32px 20px',
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor:
                                          'var(--color-background-body)',
                                      }}>
                                      {comp.preview}
                                    </div>
                                    <div
                                      style={{
                                        padding: '12px 16px',
                                        borderTop:
                                          '1px solid var(--color-border-emphasized)',
                                        backgroundColor:
                                          'var(--color-background-body)',
                                      }}>
                                      <XDSText type="body" weight="bold">
                                        {comp.label}
                                      </XDSText>
                                    </div>
                                  </div>
                                </XDSCard>
                              )),
                            );
                          }
                          return items;
                        })}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      {!chatOpen && (
        <AIComposer
          tabMode={activeTab === 'theme' ? 'theme' : 'template'}
          onThemeMode={() => setActiveView('theme')}
        />
      )}
      {/* Bottom drawer overlay */}
      {previewTarget !== null &&
        (() => {
          const t =
            TEMPLATES[
              typeof previewTarget === 'number'
                ? previewTarget % TEMPLATES.length
                : 0
            ];
          if (!t) return null;
          const isLandingPage = t.name === 'Landing Page';
          const settingsVariants = [
            {
              img: `${basePath}/docsite/card4-preview-default.png`,
              name: 'Landing Page',
              key: 'preview',
              themeImages: {
                default: `${basePath}/docsite/card4-preview-default.png`,
                matcha: `${basePath}/docsite/card4-preview-meta.png`,
                daily: `${basePath}/docsite/card4-preview-daily.png`,
                threads: `${basePath}/docsite/card4-preview-daily.png`,
              },
            },
            {
              img: `${basePath}/docsite/card4-hero-default.png`,
              name: 'Hero Layout',
              key: 'hero',
              themeImages: {
                default: `${basePath}/docsite/card4-hero-default.png`,
                matcha: `${basePath}/docsite/card4-hero-meta.png`,
                daily: `${basePath}/docsite/card4-hero-daily.png`,
                threads: `${basePath}/docsite/card4-hero-daily.png`,
              },
            },
            {
              img: `${basePath}/docsite/card4-split-default.png`,
              name: 'Split Layout',
              key: 'split',
              themeImages: {
                default: `${basePath}/docsite/card4-split-default.png`,
                matcha: `${basePath}/docsite/card4-split-meta.png`,
                daily: `${basePath}/docsite/card4-split-daily.png`,
                threads: `${basePath}/docsite/card4-split-daily.png`,
              },
            },
            {
              img: `${basePath}/docsite/card4-grid-default.png`,
              name: 'Grid Layout',
              key: 'grid',
              themeImages: {
                default: `${basePath}/docsite/card4-grid-default.png`,
                matcha: `${basePath}/docsite/card4-grid-meta.png`,
                daily: `${basePath}/docsite/card4-grid-daily.png`,
                threads: `${basePath}/docsite/card4-grid-daily.png`,
              },
            },
            {
              img: `${basePath}/docsite/card4-carousel-default.png`,
              name: 'Carousel Layout',
              key: 'carousel',
              themeImages: {
                default: `${basePath}/docsite/card4-carousel-default.png`,
                matcha: `${basePath}/docsite/card4-carousel-meta.png`,
                daily: `${basePath}/docsite/card4-carousel-daily.png`,
                threads: `${basePath}/docsite/card4-carousel-daily.png`,
              },
            },
          ];
          const activeVariantKey = selectedVariant?.key ?? 'preview';
          const moreLikeThisImages = isLandingPage
            ? settingsVariants.filter(v => v.key !== activeVariantKey)
            : TEMPLATES.map((tmpl, i) => ({
                img: tmpl.src,
                slug: tmpl.slug,
                name: tmpl.name,
                key: i,
              }))
                .filter(item => item.key !== previewTarget)
                .slice(0, 4);
          const activeSettingsVariant = isLandingPage
            ? (settingsVariants.find(v => v.key === activeVariantKey) ??
              settingsVariants[0])
            : null;
          return (
            <TemplatePreviewModal
              isOpen={true}
              onClose={() => {
                setPreviewTarget(null);
                setSelectedVariant(null);
              }}
              item={{
                name: activeSettingsVariant?.name ?? t.name,
                img: activeSettingsVariant?.img ?? t.src,
                slug: isLandingPage ? undefined : t.slug,
                author: t.author,
                ...(activeSettingsVariant
                  ? {themeImages: activeSettingsVariant.themeImages}
                  : undefined),
              }}
              onStartCrafting={() => {
                viewBeforeEditorRef.current = activeView;
                setUseTarget(previewTarget);
                setPanelTab('configure');
                setChatOpen(true);
              }}
              isBookmarked={card4Bookmarked}
              onBookmarkToggle={() => setCard4Bookmarked(prev => !prev)}
              moreLikeThis={moreLikeThisImages}
              onMoreLikeThisClick={mlItem => {
                if (typeof mlItem.key === 'number') {
                  setPreviewTarget(mlItem.key);
                  setSelectedVariant(null);
                } else {
                  setSelectedVariant({
                    name: mlItem.name,
                    img: mlItem.img,
                    key: String(mlItem.key),
                    themeImages: mlItem.themeImages,
                  });
                }
              }}
              exploreTags={[
                'website',
                'dashboard',
                'admin panel',
                'settings',
                'form layout',
                'data table',
                'sidebar nav',
                'landing page',
                'e-commerce',
                'documentation',
                'profile page',
              ]}
              onExploreTagClick={handleTokenClick}
              componentTags={[
                'XDSAppShell',
                'XDSTopNav',
                'XDSVStack',
                'XDSHStack',
                'XDSHeading',
                'XDSText',
                'XDSButton',
                'XDSCard',
                'XDSBadge',
                'XDSAvatar',
              ]}
              onComponentTagClick={handleTokenClick}
            />
          );
        })()}
      {/* Theme preview modal */}
      {themePreviewKey !== null &&
        (() => {
          const t = THEME_PICKER_ENTRIES.find(e => e.key === themePreviewKey);
          if (!t) return null;
          const r = t.preview.radius ?? 8;
          const font = t.preview.font ?? 'system-ui, sans-serif';
          return (
            <XDSDialog
              isOpen={true}
              onOpenChange={open => {
                if (!open) setThemePreviewKey(null);
              }}
              width="90vw"
              maxHeight="90vh"
              purpose="info"
              style={
                {
                  padding: 0,
                  overflow: 'visible',
                  maxWidth: 900,
                  '--xds-dialog-padding': '0px',
                } as React.CSSProperties
              }>
              <div
                style={{position: 'absolute', top: 0, right: -40, zIndex: 1}}>
                <XDSCard padding={0} style={{borderRadius: '50%'}}>
                  <XDSButton
                    label="Close"
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    icon={<span style={{fontSize: 16, lineHeight: 1}}>✕</span>}
                    onClick={() => setThemePreviewKey(null)}
                  />
                </XDSCard>
              </div>
              <div style={{overflowY: 'auto', maxHeight: '85vh'}}>
                <div
                  style={{
                    display: 'flex',
                    gap: 32,
                    padding: 32,
                    fontFamily: font,
                  }}>
                  {/* Left — brand moodboard */}
                  <div style={{flex: 1, minWidth: 0}}>
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 24,
                      }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: r,
                          backgroundColor: t.preview.accent,
                        }}
                      />
                      <XDSHeading level={2}>{t.name}</XDSHeading>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 10px',
                          borderRadius: 'var(--radius-control)',
                          backgroundColor: 'var(--color-background-muted)',
                          color: 'var(--color-text-secondary)',
                        }}>
                        {t.category === 'official' ? 'Official' : 'Community'}
                      </span>
                    </div>
                    {t.description && (
                      <XDSText
                        type="body"
                        color="secondary"
                        style={{marginBottom: 24}}>
                        {t.description}
                      </XDSText>
                    )}
                    {/* Color palette */}
                    <XDSText
                      type="label"
                      color="secondary"
                      style={{marginBottom: 12, display: 'block'}}>
                      Colors
                    </XDSText>
                    <div style={{display: 'flex', gap: 12, marginBottom: 28}}>
                      {[
                        {
                          color: t.preview.accent,
                          label: 'Accent',
                          hex: t.preview.accent,
                        },
                        {
                          color: t.preview.bg,
                          label: 'Background',
                          hex: t.preview.bg,
                        },
                        {
                          color: t.preview.surface,
                          label: 'Surface',
                          hex: t.preview.surface,
                        },
                        {
                          color: t.preview.text,
                          label: 'Text',
                          hex: t.preview.text,
                        },
                      ].map(swatch => (
                        <div
                          key={swatch.label}
                          style={{flex: 1, textAlign: 'center'}}>
                          <div
                            style={{
                              aspectRatio: '1',
                              borderRadius: r,
                              backgroundColor: swatch.color,
                              border:
                                swatch.color.toUpperCase() === '#FFFFFF'
                                  ? '1px solid var(--color-border-default)'
                                  : 'none',
                              marginBottom: 6,
                            }}
                          />
                          <XDSText type="supporting" style={{display: 'block'}}>
                            {swatch.label}
                          </XDSText>
                          <XDSText
                            type="supporting"
                            color="secondary"
                            style={{display: 'block', fontSize: 10}}>
                            {swatch.hex}
                          </XDSText>
                        </div>
                      ))}
                    </div>
                    {/* Typography */}
                    <XDSText
                      type="label"
                      color="secondary"
                      style={{marginBottom: 12, display: 'block'}}>
                      Typography
                    </XDSText>
                    <div
                      style={{
                        padding: 20,
                        borderRadius: r,
                        backgroundColor: 'var(--color-background-muted)',
                        marginBottom: 28,
                      }}>
                      <div
                        style={{
                          fontSize: 48,
                          fontWeight: 300,
                          lineHeight: 1,
                          marginBottom: 8,
                        }}>
                        Aa
                      </div>
                      <XDSText type="body" color="secondary">
                        {font.split(',')[0].trim()}
                      </XDSText>
                      <div
                        style={{
                          marginTop: 12,
                          fontSize: 13,
                          lineHeight: 1.6,
                          opacity: 0.6,
                        }}>
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ
                        <br />
                        abcdefghijklmnopqrstuvwxyz
                        <br />
                        0123456789
                      </div>
                    </div>
                    {/* Radius */}
                    <XDSText
                      type="label"
                      color="secondary"
                      style={{marginBottom: 12, display: 'block'}}>
                      Border Radius
                    </XDSText>
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-end',
                        marginBottom: 28,
                      }}>
                      {[r * 0.5, r, r * 1.5, r * 2].map((rv, i) => (
                        <div key={i} style={{textAlign: 'center'}}>
                          <div
                            style={{
                              width: 40 + i * 8,
                              height: 40 + i * 8,
                              borderRadius: rv,
                              backgroundColor:
                                i === 1
                                  ? t.preview.accent
                                  : 'var(--color-background-muted)',
                              border:
                                i !== 1
                                  ? '1px solid var(--color-border-default)'
                                  : 'none',
                            }}
                          />
                          <XDSText
                            type="supporting"
                            color="secondary"
                            style={{
                              display: 'block',
                              marginTop: 4,
                              fontSize: 10,
                            }}>
                            {Math.round(rv)}px
                          </XDSText>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Right — actions */}
                  <div style={{width: 220, flexShrink: 0, paddingTop: 8}}>
                    <XDSButton
                      label="Customize theme"
                      onClick={() => {
                        setThemePreviewKey(null);
                        setActiveView('theme');
                      }}
                      style={{width: '100%', marginBottom: 12}}
                    />
                    <XDSButton
                      label="Close"
                      variant="secondary"
                      onClick={() => setThemePreviewKey(null)}
                      style={{width: '100%', marginBottom: 24}}
                    />
                    {/* More themes */}
                    <XDSText
                      type="label"
                      color="secondary"
                      style={{marginBottom: 12, display: 'block'}}>
                      More themes
                    </XDSText>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}>
                      {THEME_PICKER_ENTRIES.filter(
                        e => e.key !== themePreviewKey,
                      )
                        .slice(0, 4)
                        .map(other => (
                          <div
                            key={other.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '8px 10px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'background-color 150ms',
                            }}
                            onClick={() => setThemePreviewKey(other.key)}
                            onMouseEnter={e =>
                              (e.currentTarget.style.backgroundColor =
                                'var(--color-background-muted)')
                            }
                            onMouseLeave={e =>
                              (e.currentTarget.style.backgroundColor =
                                'transparent')
                            }>
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: other.preview.radius ?? 4,
                                backgroundColor: other.preview.accent,
                                flexShrink: 0,
                              }}
                            />
                            <XDSText type="body" style={{fontSize: 13}}>
                              {other.name}
                            </XDSText>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </XDSDialog>
          );
        })()}
      {/* Settings dialog */}
      <XDSDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        width={560}
        purpose="form">
        <XDSStack direction="vertical" gap={4} style={{padding: '8px 0'}}>
          <XDSStack direction="horizontal" hAlign="between" vAlign="center">
            <XDSStack direction="vertical" gap={1}>
              <XDSText type="body" style={{fontWeight: 600}}>
                Dark mode
              </XDSText>
              <XDSText type="supporting" color="secondary">
                Switch between light and dark appearance
              </XDSText>
            </XDSStack>
            <XDSButton
              label={previewMode === 'dark' ? 'On' : 'Off'}
              variant="secondary"
              size="sm"
              onClick={() =>
                setPreviewMode(previewMode === 'dark' ? 'light' : 'dark')
              }
            />
          </XDSStack>
          <XDSDivider variant="strong" />
          <XDSStack direction="horizontal" hAlign="between" vAlign="center">
            <XDSStack direction="vertical" gap={1}>
              <XDSText type="body" style={{fontWeight: 600}}>
                Theme
              </XDSText>
              <XDSText type="supporting" color="secondary">
                Choose a visual theme for previews
              </XDSText>
            </XDSStack>
            <XDSDropdownMenu
              button={{
                label:
                  previewTheme.charAt(0).toUpperCase() + previewTheme.slice(1),
                variant: 'secondary',
                size: 'sm',
              }}
              items={[
                {label: 'Default', onClick: () => setPreviewTheme('default')},
                {label: 'Neutral', onClick: () => setPreviewTheme('neutral')},
                {
                  label: 'Brutalist',
                  onClick: () => setPreviewTheme('brutalist'),
                },
                {label: 'Matcha', onClick: () => setPreviewTheme('matcha')},
                {label: 'Daily', onClick: () => setPreviewTheme('daily')},
              ]}
            />
          </XDSStack>
          <XDSDivider variant="strong" />
          <XDSStack direction="horizontal" hAlign="between" vAlign="center">
            <XDSStack direction="vertical" gap={1}>
              <XDSText type="body" style={{fontWeight: 600}}>
                Default sort
              </XDSText>
              <XDSText type="supporting" color="secondary">
                How templates are ordered by default
              </XDSText>
            </XDSStack>
            <XDSDropdownMenu
              button={{
                label:
                  sortOption === 'trending'
                    ? 'Trending'
                    : sortOption === 'newest'
                      ? 'Newest'
                      : 'Oldest',
                variant: 'secondary',
                size: 'sm',
              }}
              items={[
                {label: 'Trending', onClick: () => setSortOption('trending')},
                {label: 'Newest', onClick: () => setSortOption('newest')},
                {label: 'Oldest', onClick: () => setSortOption('oldest')},
              ]}
            />
          </XDSStack>
        </XDSStack>
      </XDSDialog>
    </XDSAppShell>
  );
}
