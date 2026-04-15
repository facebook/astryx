'use client';

import * as stylex from '@stylexjs/stylex';
import React, {Suspense, useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';

import {createSimulation} from './BoidsCanvas';
import type {BoidsSimulation} from './BoidsCanvas';
import {TEMPLATES, XDS_THEMES, AVATAR_IMAGE, THEME_PICKER_ENTRIES, basePath} from './constants';
import {TemplateCard} from './TemplateCard';
import {AIComposer} from './AIComposer';
import {ChatPanel} from './ChatPanel';
import type {PanelTab, PointedElement} from './ChatPanel';
import {InlinePublishPanel} from './InlinePublishPanel';
import {TemplatePreview} from './TemplatePreview';
import {SharePopover} from './SharePopover';
import {AppTopNav} from './AppTopNav';
import {DocsView} from './DocsView';
import {ProfileView} from './ProfileView';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSToken} from '@xds/core/Token';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSPopover} from '@xds/core/Popover';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSTooltip} from '@xds/core/Tooltip';
import {
  ArrowLeftIcon,
  DesktopIcon,
  PhoneIcon,
  CursorIcon,
  PaletteIcon,
  ContrastIcon,
  SaveIcon,
  ShareIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  StarIcon,
  StarFilledIcon,
  SearchIcon,
  LinkIcon,
  MetaLogo,
  WhatsAppLogo,
  ThreadsLogo,
  FacebookLogo,
  DefaultThemeIcon,
  ForestThemeIcon,
  SunsetThemeIcon,
  MidnightThemeIcon,
} from './docsite-icons';

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

const tokenStyles = stylex.create({
  outline: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border-emphasized)',
  },
  pill: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border-emphasized)',
    borderRadius: 9999,
  },
});

const popoverStyles = stylex.create({
  themeBrowse: {
    padding: 16,
  },
});

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocsiteLandingPage() {
  return (
    <Suspense>
      <DocsiteLandingTemplate />
    </Suspense>
  );
}

function DocsiteLandingTemplate() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial state from URL params
  const initialView = useMemo(() => {
    const v = searchParams.get('view');
    const t = searchParams.get('template');
    const templateIdx = t !== null ? parseInt(t, 10) : null;
    return {view: v, templateIdx: isNaN(templateIdx as number) ? null : templateIdx};
  }, [searchParams]);

  const [activeView, setActiveView] = useState(
    'craft' as 'craft' | 'explore' | 'docs' | 'profile',
  );
  const [selected, setSelected] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [generatingSource, setGeneratingSource] = useState(null as number | null);
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
  const [editorViewport, setEditorViewport] = useState('desktop');
  const [fullPreview, setFullPreview] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [sharePopoverPos, setSharePopoverPos] = useState(null as {top: number; left: number} | null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef(null);
  const [card4SelectedOption, setCard4SelectedOption] = useState('default');
  const [card4ThemeBrowse, setCard4ThemeBrowse] = useState(false);
  const [card4Bookmarked, setCard4Bookmarked] = useState(false);
  const card4ScrollRef = useRef<HTMLDivElement>(null);
  const card4AddButtonRef = useRef<HTMLButtonElement>(null);
  const card4AddPopoverRef = useRef<HTMLDivElement>(null);
  const [card4ShowAddPopover, setCard4ShowAddPopover] = useState(false);
  const [card4AddPopoverPos, setCard4AddPopoverPos] = useState(null as {top: number; left: number} | null);
  const [card4ThemeSearch, setCard4ThemeSearch] = useState('');
  const [card4PinnedThemes, setCard4PinnedThemes] = useState(
    () => new Set(THEME_PICKER_ENTRIES.filter(t => t.isPinnedByDefault).map(t => t.key)),
  );
  const toggleCard4Pin = useCallback((key: string) => {
    setCard4PinnedThemes(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleEditorResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditorResizing(true);
    const startX = e.clientX;
    const startWidth = editorPanelWidth;

    const onMouseMove = (ev: MouseEvent) => {
      const maxWidth = Math.floor(window.innerWidth / 2);
      const newWidth = Math.min(Math.max(startWidth + (ev.clientX - startX), 280), maxWidth);
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
  }, [editorPanelWidth]);

  useEffect(() => {
    if (!showSharePopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      const popover = document.querySelector('[data-share-popover]');
      if (popover && !popover.contains(e.target as Node)) {
        setShowSharePopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSharePopover]);

  // Sync URL when view state changes
  useEffect(() => {
    let path = '/pages/docsite/';
    if (previewTarget !== null) {
      path += '?view=preview&template=' + previewTarget;
    } else if (useTarget !== null) {
      path += '?view=editor&template=' + useTarget;
    }
    router.replace(path, {scroll: false});
  }, [previewTarget, useTarget, router]);

  // Reset preview/editor state when switching views
  useEffect(() => {
    setPreviewTarget(null);
    setUseTarget(null);
    setChatOpen(false);
  }, [activeView]);
  const timerRef = useRef(null as ReturnType<typeof setTimeout> | null);
  const previewTimerRef = useRef(null as ReturnType<typeof setTimeout> | null);
  const simRef = useRef(null as BoidsSimulation | null);
  const simAnimRef = useRef(0 as number);

  if (!simRef.current) {
    simRef.current = createSimulation();
  }

  // Single update loop for the shared simulation
  const simRunning = generatingSource !== null || previewGenerating;
  useEffect(() => {
    if (!simRunning) {
      cancelAnimationFrame(simAnimRef.current);
      return;
    }
    function tick() {
      simRef.current!.update();
      simAnimRef.current = requestAnimationFrame(tick);
    }
    simAnimRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(simAnimRef.current);
  }, [simRunning]);

  useEffect(() => {
    const mobileMql = window.matchMedia('(max-width: 768px)');
    const tabletMql = window.matchMedia(
      '(min-width: 769px) and (max-width: 1024px)',
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

  const handleUse = useCallback((index: number) => {
    setPreviewTarget(null);
    setUseTarget(index);
    setPanelTab('configure');
    setChatOpen(true);
  }, []);

  const handleBackFromUse = useCallback(() => {
    setUseTarget(null);
    setChatOpen(false);
    setShowPublishCard1(false);
  }, []);

  const handlePreview = useCallback((index: number) => {
    setPreviewTarget(index);
  }, []);

  const handlePreviewSend = useCallback(() => {
    if (previewGenerating) return;
    setPreviewGenerating(true);
    previewTimerRef.current = setTimeout(() => {
      setPreviewGenerating(false);
      previewTimerRef.current = null;
    }, 5000);
  }, [previewGenerating]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  const isGenerating = generatingSource !== null;

  // Editor flow — same layout for all cards
  if (useTarget !== null && activeView === 'craft') {
    const t = TEMPLATES[useTarget % TEMPLATES.length];
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: useTarget !== 3 ? 'var(--color-background-body)' : 'var(--color-background-surface, #fff)',
        }}>
        <style>
          {'@keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }' +
            '@keyframes checkDraw { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }' +
            '.xds-editor-resize-handle { opacity: 0; transition: opacity 150ms ease, background-color 150ms ease; }' +
            '.xds-editor-resize-grip:hover .xds-editor-resize-handle { opacity: 0.6; }' +
            '.xds-editor-resize-grip[data-resizing="true"] .xds-editor-resize-handle { opacity: 1; }'}
        </style>
        {!fullPreview && <div
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
              border: useTarget !== 3 ? 'none' : '1px solid var(--color-divider, #e0e0e0)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column' as const,
            }}>
            {/* Persistent tab bar — hidden when publishing */}
            {!showPublishCard1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px 0 16px',
                borderBottom: '1px solid var(--color-divider, #e0e0e0)',
                flexShrink: 0,
              }}>
              <XDSButton
                label="Back"
                variant="ghost"
                size="sm"
                icon={<ArrowLeftIcon />}
                isIconOnly
                onClick={handleBackFromUse}
                style={{flexShrink: 0, marginRight: 4}}
              />
              {(['configure', 'properties', 'code'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setPanelTab(tab)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
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
                    {tab === 'configure'
                      ? 'Craft'
                      : tab === 'properties'
                        ? 'Properties'
                        : 'Code'}
                  </XDSText>
                </button>
              ))}
            </div>
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
        </div>}
        {/* Resize handle */}
        {!fullPreview && <div
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
            marginRight: useTarget !== 3 ? -16 : 0,
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
        </div>}
        <div
          style={{flex: 1, display: 'flex', flexDirection: 'column' as const, minWidth: 0, overflow: 'visible'}}>
          <TemplatePreview
            templateName={t.name}
            imageSrc={t.src}
            onBack={handleBackFromUse}
            isGenerating={previewGenerating}
            simulation={simRef.current!}
            onPublish={() => { setShowPublishCard1(true); setEditorPanelWidth(380); }}
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
            previewBackground={useTarget !== 3 ? 'var(--color-background-body)' : undefined}
          />
        </div>
      </div>
    );
  }

  // All card previews are handled as a bottom drawer overlay on the craft grid below.

  if (activeView === 'docs') {
    return <DocsView activeView={activeView} setActiveView={setActiveView} />;
  }

  if (activeView === 'profile') {
    return (
      <ProfileView activeView={activeView} setActiveView={setActiveView} />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
        backgroundColor: 'var(--color-background-surface, white)',
      }}>
      <AppTopNav
        activeView={activeView}
        setActiveView={setActiveView}
        scrollContainerRef={scrollContainerRef}
      />
      <div
        style={{
          display: 'flex',
          flex: 1,
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
            {/* Masonry Grid */}
            <div
              ref={scrollContainerRef}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px 24px 140px',
              }}>
              <div
                style={{
                  maxWidth: 2000,
                  margin: '0 auto',
                  display: 'grid',
                  gridTemplateColumns: isMobile
                    ? '1fr'
                    : isTablet
                      ? 'repeat(2, 1fr)'
                      : 'repeat(4, 1fr)',
                  gap: 16,
                  gridAutoRows: '1fr',
                }}>
                {TEMPLATES.map((template, i) => (
                  <div key={`${template.name}-${i}`}>
                    <TemplateCard
                      src={template.src}
                      name={template.name}
                      isSelected={selected.has(i)}
                      isGenerating={isGenerating && generatingSource !== i}
                      cardSize={template.size}
                      onSelect={() =>
                        setSelected(prev => {
                          const next = new Set(prev);
                          if (next.has(i)) {
                            next.delete(i);
                          } else {
                            next.add(i);
                          }
                          return next;
                        })
                      }
                      onMoreLikeThis={() => handleMoreLikeThis(i)}
                      onUse={() => handleUse(i)}
                      onPreview={() => handlePreview(i)}
                      simulation={simRef.current!}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!chatOpen && <AIComposer />}

      {/* Bottom drawer overlay */}
      {previewTarget !== null && (() => {
        const t = TEMPLATES[previewTarget % TEMPLATES.length];
        const isMeta = previewTarget === 3 && card4SelectedOption === 'meta';
        const moreLikeThisImages = TEMPLATES
          .map((tmpl, i) => ({src: tmpl.src, name: tmpl.name, description: `${tmpl.name} template`, originalIndex: i}))
          .filter(item => item.originalIndex !== previewTarget)
          .slice(0, 4);
        return (
          <>
            <style>{`
              @keyframes card4DrawerSlideUp {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes card4BackdropFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
            {/* Backdrop */}
            <div
              onClick={() => setPreviewTarget(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(2px)',
                animation: 'card4BackdropFadeIn 300ms ease',
              }}
            />
            {/* Drawer */}
            <div style={{
              position: 'fixed', inset: 0, margin: 'auto', zIndex: 101,
              width: '90vw', maxWidth: 1200, height: 'fit-content', maxHeight: '90vh',
              backgroundColor: 'var(--color-background-card, #fff)',
              borderRadius: 16,
              boxShadow: '0 8px 60px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column',
              animation: 'card4DrawerSlideUp 400ms cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'visible',
            }}>
              {/* Floating close button — outside modal, top-right with 8px gap */}
              <div style={{position: 'absolute', top: 0, right: -44, zIndex: 1}}>
                <XDSButton
                  label="Close"
                  variant="secondary"
                  size="sm"
                  isIconOnly
                  icon={<span style={{fontSize: 16, lineHeight: 1}}>✕</span>}
                  onClick={() => setPreviewTarget(null)}
                  style={{borderRadius: '50%', width: 36, height: 36, backgroundColor: '#fff', color: '#111', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.2)'}}
                />
              </div>

              {/* Scrollable content */}
              <div ref={card4ScrollRef} style={{overflowY: 'auto', borderRadius: 16}}>
                {/* Main content: image left + details right */}
                <div style={{display: 'flex', minHeight: 0, padding: '0 24px'}}>
                  {/* Left — Preview image + thumbnails */}
                  <div style={{flex: 1, minWidth: 0, padding: '24px 24px 24px 0', display: 'flex', flexDirection: 'column', gap: 12}}>
                    <div style={{flex: 1, aspectRatio: '16 / 10', backgroundColor: 'var(--color-background-muted, #f9f9f9)', borderRadius: 12, overflowY: 'auto', overflowX: 'hidden', border: '1px solid var(--color-border, #e0e0e0)'}}>
                      <img
                        src={isMeta ? `${basePath}/templates/card4-preview-meta.png` : t.src}
                        alt={t.name}
                        style={{width: '100%', display: 'block'}}
                      />
                    </div>
                  </div>

                  {/* Right — Details panel */}
                  <div style={{width: 360, flexShrink: 0, padding: '24px 0', display: 'flex', flexDirection: 'column'}}>
                    {/* Title */}
                    <XDSText type="display-2">{t.name}</XDSText>

                    {/* Description */}
                    <div style={{marginTop: 8}}>
                      <XDSText type="body" color="secondary">
                        A ready-to-use {t.name.toLowerCase()} template built with XDS components. Customize it with your own content and theme to match your brand.
                      </XDSText>
                    </div>

                    {/* Author */}
                    <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 12}}>
                      <XDSAvatar name="Andrea Anderson" size={36} src={AVATAR_IMAGE} />
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                        <XDSText type="supporting" color="secondary">Crafted by</XDSText>
                        <XDSText type="body" style={{fontWeight: 600, fontSize: 16}}>Andrea Anderson</XDSText>
                      </div>
                    </div>

                    {/* CTA buttons */}
                    <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, position: 'relative'}}>
                      <XDSButton
                        variant="primary"
                        label="Start crafting"
                        size="lg"
                        style={{width: '100%'}}
                        onClick={() => {
                          setUseTarget(previewTarget);
                          setPreviewTarget(null);
                          setPanelTab('configure');
                          setChatOpen(true);
                        }}
                      />
                      <div style={{display: 'flex', gap: 8}} ref={card4AddPopoverRef}>
                        <XDSButton
                          ref={card4AddButtonRef}
                          variant="secondary"
                          label="Use in your product"
                          size="lg"
                          style={{flex: 1}}
                          onClick={() => {
                            if (card4AddButtonRef.current) {
                              const rect = card4AddButtonRef.current.getBoundingClientRect();
                              setCard4AddPopoverPos({top: rect.bottom + 8, left: rect.left});
                            }
                            setCard4ShowAddPopover(prev => !prev);
                          }}
                        />
                        <XDSTooltip content="Bookmark">
                          <XDSButton
                            label={card4Bookmarked ? '893' : '892'}
                            variant="secondary"
                            size="lg"
                            isIconOnly
                            icon={card4Bookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
                            onClick={() => setCard4Bookmarked(prev => !prev)}
                          />
                        </XDSTooltip>
                        {card4ShowAddPopover && card4AddPopoverPos && (
                          <SharePopover
                            cliCommand={`npx xds template ${t.name.toLowerCase().replace(/\s+/g, '-')} ./my-project`}
                            position={card4AddPopoverPos}
                            onClose={() => setCard4ShowAddPopover(false)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Themes — pinned grid */}
                    <div style={{marginTop: 24}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <XDSText type="body" style={{fontWeight: 600}}>Apply your themes</XDSText>
                        <XDSPopover
                          label="Browse themes"
                          placement="below"
                          alignment="end"
                          width={480}
                          isOpen={card4ThemeBrowse}
                          onOpenChange={open => { setCard4ThemeBrowse(open); if (!open) setCard4ThemeSearch(''); }}
                          xstyle={popoverStyles.themeBrowse}
                          content={
                            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
                              <div tabIndex={0} style={{position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden'}} />
                              <XDSTextInput
                                label="Search"
                                isLabelHidden
                                placeholder="Search themes..."
                                value={card4ThemeSearch}
                                onChange={setCard4ThemeSearch}
                                size="lg"
                                startIcon={SearchIcon}
                              />
                              <div style={{maxHeight: 560, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16}}>
                                {(['official', 'community'] as const).map(category => {
                                  const entries = THEME_PICKER_ENTRIES.filter(
                                    e => e.category === category && e.name.toLowerCase().includes(card4ThemeSearch.toLowerCase()),
                                  );
                                  if (entries.length === 0) return null;
                                  return (
                                    <div key={category}>
                                      <div style={{marginBottom: 8}}>
                                        <XDSText type="supporting" color="secondary">
                                          {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </XDSText>
                                      </div>
                                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8}}>
                                        {entries.map(entry => {
                                          const isSelected = card4SelectedOption === entry.key;
                                          const isPinned = card4PinnedThemes.has(entry.key);
                                          const p = entry.preview;
                                          return (
                                            <div
                                              key={entry.key}
                                              style={{
                                                borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                                                border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border-emphasized)',
                                                transition: 'border-color 0.15s ease',
                                              }}>
                                              <div
                                                onClick={() => { setCard4SelectedOption(entry.key); setCard4ThemeBrowse(false); setCard4ThemeSearch(''); }}
                                                style={{height: 100, backgroundColor: p.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                                                <div style={{height: 14, backgroundColor: p.surface, borderBottom: `1px solid ${p.text}1A`, display: 'flex', alignItems: 'center', paddingInline: 8, gap: 4}}>
                                                  <div style={{width: 5, height: 5, borderRadius: '50%', backgroundColor: p.accent}} />
                                                  <div style={{width: 16, height: 2, borderRadius: 1, backgroundColor: p.text, opacity: 0.3}} />
                                                </div>
                                                <div style={{flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 5}}>
                                                  <div style={{width: '65%', height: 4, borderRadius: 2, backgroundColor: p.text, opacity: 0.6}} />
                                                  <div style={{width: '45%', height: 3, borderRadius: 1.5, backgroundColor: p.text, opacity: 0.25}} />
                                                  <div style={{width: 28, height: 10, borderRadius: 4, backgroundColor: p.accent, marginTop: 'auto'}} />
                                                </div>
                                              </div>
                                              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: 'var(--color-surface, #f5f5f5)'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                                  {(() => {
                                                    const Logo = BRAND_LOGOS[entry.key];
                                                    return Logo ? <Logo width={14} height={14} /> : (
                                                      <div style={{width: 14, height: 14, borderRadius: '50%', backgroundColor: entry.accent}} />
                                                    );
                                                  })()}
                                                  <XDSText type="supporting" style={{fontWeight: isSelected ? 600 : 400}}>{entry.name}</XDSText>
                                                </div>
                                                <div
                                                  onClick={e => { e.stopPropagation(); toggleCard4Pin(entry.key); }}
                                                  style={{cursor: 'pointer', display: 'flex', padding: 2}}>
                                                  {isPinned ? (
                                                    <StarFilledIcon width={14} height={14} style={{color: 'var(--color-text-primary, #111)'}} />
                                                  ) : (
                                                    <StarIcon width={14} height={14} style={{color: 'var(--color-secondary, #999)'}} />
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
                          <button
                            role="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              font: 'inherit',
                            }}>
                            <XDSText type="supporting" color="secondary">Browse</XDSText>
                          </button>
                        </XDSPopover>
                      </div>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 44px)', gap: 8, marginTop: 16}}>
                        {THEME_PICKER_ENTRIES.filter(e => card4PinnedThemes.has(e.key)).map(entry => {
                          const isSelected = card4SelectedOption === entry.key;
                          const BrandLogo = BRAND_LOGOS[entry.key];
                          return (
                            <XDSTooltip key={entry.key} content={entry.name}>
                              <div
                                onClick={() => setCard4SelectedOption(entry.key)}
                                style={{
                                  width: 44, height: 44, borderRadius: 10,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                  border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border-emphasized)',
                                  backgroundColor: '#fff',
                                  transition: 'border-color 0.15s ease',
                                }}>
                                {BrandLogo ? (
                                  <BrandLogo width={28} height={28} />
                                ) : (
                                  <div style={{width: 24, height: 24, borderRadius: '50%', backgroundColor: entry.accent}} />
                                )}
                              </div>
                            </XDSTooltip>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* More like this */}
                <div style={{padding: '0 24px'}}>
                  <XDSHeading level={3}>More like this</XDSHeading>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16}}>
                    {moreLikeThisImages.map((img) => (
                      <XDSCard
                        key={img.originalIndex}
                        padding={0}
                        onClick={() => {
                          setPreviewTarget(img.originalIndex);
                          card4ScrollRef.current?.scrollTo({top: 0, behavior: 'smooth'});
                        }}
                        style={{cursor: 'pointer', aspectRatio: '16/10', overflow: 'hidden'}}>
                        <img src={img.src} alt={img.name} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block'}} />
                      </XDSCard>
                    ))}
                  </div>
                </div>

                {/* Explore more */}
                <div style={{padding: '24px 24px 0'}}>
                  <XDSHeading level={3}>Explore more</XDSHeading>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16}}>
                    {['website', 'dashboard', 'admin panel', 'settings', 'form layout', 'data table', 'sidebar nav', 'landing page', 'e-commerce', 'documentation', 'profile page'].map(tag => (
                      <XDSToken key={tag} label={tag} xstyle={tokenStyles.pill} style={{backgroundColor: 'transparent'}} />
                    ))}
                  </div>
                </div>

                {/* Component used */}
                <div style={{padding: '24px 24px 24px'}}>
                  <XDSHeading level={3}>Component used</XDSHeading>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16}}>
                    {['XDSAppShell', 'XDSTopNav', 'XDSVStack', 'XDSHStack', 'XDSHeading', 'XDSText', 'XDSButton', 'XDSCard', 'XDSBadge', 'XDSAvatar'].map(c => (
                      <XDSToken key={c} label={c} xstyle={tokenStyles.outline} style={{backgroundColor: 'transparent'}} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
