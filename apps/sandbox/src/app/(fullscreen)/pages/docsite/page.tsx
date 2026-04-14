'use client';

import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';

import {createSimulation} from './BoidsCanvas';
import type {BoidsSimulation} from './BoidsCanvas';
import {TEMPLATES, XDS_THEMES} from './constants';
import {TemplateCard} from './TemplateCard';
import {AIComposer} from './AIComposer';
import {ChatPanel} from './ChatPanel';
import type {PanelTab, PointedElement} from './ChatPanel';
import {InlinePublishPanel} from './InlinePublishPanel';
import {TemplatePreview} from './TemplatePreview';
import {SharePopover} from './SharePopover';
import {TemplateFullPreview} from './TemplateFullPreview';
import {AppTopNav} from './AppTopNav';
import {DocsView} from './DocsView';
import {ProfileView} from './ProfileView';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
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
} from './docsite-icons';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocsiteLandingTemplate() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial state from URL params
  const initialView = useMemo(() => {
    const v = searchParams.get('view');
    const t = searchParams.get('template');
    const templateIdx = t !== null ? parseInt(t, 10) : null;
    return {view: v, templateIdx: isNaN(templateIdx as number) ? null : templateIdx};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [sharePopoverPos, setSharePopoverPos] = useState(null as {top: number; left: number} | null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef(null);

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

  // Combined preview + editor view for 2nd card (index 1)
  if (previewTarget === 1 && activeView === 'craft') {
    const t = TEMPLATES[1];
    return (
      <TemplateFullPreview
        templateName={t.name}
        imageSrc={t.src}
        onBack={() => {
          setPreviewTarget(null);
        }}
        onUse={() => {}}
        onSelectTemplate={index => {
          setPreviewTarget(index);
        }}
        showChat
        showEditor
      />
    );
  }

  // Customize flow for 2nd card (index 1) — opens with chat tab
  if (useTarget === 1 && activeView === 'craft') {
    const t = TEMPLATES[1];
    return (
      <TemplateFullPreview
        templateName={t.name}
        imageSrc={t.src}
        onBack={() => {
          setUseTarget(null);
          setChatOpen(false);
        }}
        onUse={() => {}}
        onSelectTemplate={index => {
          setPreviewTarget(index);
        }}
        showChat
        showEditor
        defaultTab="chat"
      />
    );
  }

  // Editor flow for Card 3 — flat left panel (layout testing bed)
  if (useTarget === 2 && activeView === 'craft') {
    const t = TEMPLATES[2];
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'var(--color-background-card, #fff)',
        }}>
        <style>
          {'@keyframes editorSlideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }' +
            '@keyframes editorSlideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }' +
            '@keyframes editorFadeIn { from { opacity: 0; } to { opacity: 1; } }' +
            '@keyframes publishFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
            '@keyframes publishToolbarIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }' +
            '.xds-editor-resize-handle { opacity: 0; transition: opacity 150ms ease, background-color 150ms ease; }' +
            '.xds-editor-resize-grip:hover .xds-editor-resize-handle { opacity: 0.6; }' +
            '.xds-editor-resize-grip[data-resizing="true"] .xds-editor-resize-handle { opacity: 1; }'}
        </style>
        {/* Unified header toolbar (hidden when publishing — toolbar moves into right panel) */}
        <div
          style={{
            display: showPublishCard1 ? 'none' : 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-background-card, #fff)',
            borderBottom: '1px solid var(--color-divider, #e0e0e0)',
            flexShrink: 0,
            animation: 'editorSlideDown 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
          {/* Left: back + tabs */}
          <div
            style={{
              width: editorPanelWidth,
              minWidth: 280,
              maxWidth: '50vw',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'stretch',
              alignSelf: 'stretch',
              padding: '0 8px 0 16px',
              borderRight: '1px solid var(--color-divider, #e0e0e0)',
            }}>
            <XDSButton
              label="Back"
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon />}
              isIconOnly
              onClick={handleBackFromUse}
              style={{flexShrink: 0, marginRight: 4, alignSelf: 'center'}}
            />
            {(['configure', 'properties', 'code'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPanelTab(tab)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 8px',
                  background: 'none',
                  border: 'none',
                  borderBottom:
                    panelTab === tab
                      ? '2px solid var(--color-text-primary, #111)'
                      : '2px solid transparent',
                  marginBottom: -1,
                  cursor: 'pointer',
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
          {/* Right: toolbar actions */}
          <div style={{flex: 1, minWidth: 0}}>
            <XDSToolbar
              label="Template actions"
              padding={1}
              startContent={<></>}
              centerContent={
                <XDSSegmentedControl
                  value={editorViewport}
                  onChange={(v: string) => setEditorViewport(v)}
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
                  <XDSTooltip content="Phone">
                    <XDSSegmentedControlItem
                      value="phone"
                      label="Phone"
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
                      variant={isPointing ? 'secondary' : 'ghost'}
                      size="sm"
                      isIconOnly
                      icon={<CursorIcon />}
                      onClick={() => setIsPointing(p => !p)}
                    />
                  </XDSTooltip>
                  <XDSTooltip content="Theme">
                    <XDSDropdownMenu
                      button={{
                        label: 'Theme',
                        variant: 'ghost',
                        size: 'sm',
                        isIconOnly: true,
                        icon: <PaletteIcon />,
                      }}
                      hasChevron={false}
                      items={XDS_THEMES.map(theme => ({
                        label: theme.label,
                        onClick: () => {},
                      }))}
                    />
                  </XDSTooltip>
                  <XDSTooltip content="Toggle theme">
                    <XDSButton
                      label="Toggle theme"
                      variant="ghost"
                      size="sm"
                      isIconOnly
                      icon={<ContrastIcon />}
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
                      size="sm"
                      icon={<SaveIcon />}
                      isIconOnly
                    />
                  </XDSTooltip>
                  <div style={{position: 'relative'}}>
                    <XDSTooltip content="Share">
                      <XDSButton
                        label="Share"
                        variant="secondary"
                        size="sm"
                        isIconOnly
                        icon={<ShareIcon />}
                        ref={shareButtonRef}
                        onClick={() => {
                          setShowSharePopover(prev => {
                            if (!prev && shareButtonRef.current) {
                              const rect = shareButtonRef.current.getBoundingClientRect();
                              const popoverWidth = 340;
                              const popoverHeight = 400;
                              const left = Math.min(
                                Math.max(8, rect.right - popoverWidth),
                                window.innerWidth - popoverWidth - 16,
                              );
                              const top =
                                rect.bottom + 4 + popoverHeight + 16 > window.innerHeight
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
                        cliCommand={`npx xds template ${t.name.toLowerCase().replace(/\s+/g, '-')} ./my-project`}
                        position={sharePopoverPos}
                        onClose={() => setShowSharePopover(false)}
                      />
                    )}
                  </div>
                  <XDSButton
                    label="Publish"
                    variant="primary"
                    size="sm"
                    onClick={() => { setShowPublishCard1(true); setEditorPanelWidth(380); }}
                  />
                </>
              }
            />
          </div>
        </div>
        {/* Content area */}
        <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
          <div
            style={{
              width: editorPanelWidth,
              minWidth: 280,
              maxWidth: '50vw',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column' as const,
              backgroundColor: 'var(--color-background-card, #fff)',
              borderRight: '1px solid var(--color-divider, #e0e0e0)',
              overflow: 'hidden',
              animation: 'editorSlideIn 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
            {showPublishCard1 ? (
              <InlinePublishPanel
                templateName={t.name}
                isVisible={showPublishCard1}
                onBack={() => setShowPublishCard1(false)}
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
          {/* Resize handle (hidden when publishing) */}
          <div
            onMouseDown={showPublishCard1 ? undefined : handleEditorResizeStart}
            data-resizing={isEditorResizing}
            className="xds-editor-resize-grip"
            style={{
              width: showPublishCard1 ? 0 : 12,
              flexShrink: 0,
              cursor: showPublishCard1 ? 'default' : 'col-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              backgroundColor: 'var(--color-background-body, #f5f5f5)',
              overflow: 'hidden',
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
          <div
            style={{flex: 1, display: 'flex', flexDirection: 'column' as const, minWidth: 0, overflow: 'hidden', animation: 'editorFadeIn 600ms ease'}}>
            {showPublishCard1 && (
              <div style={{
                flexShrink: 0,
                animation: 'publishToolbarIn 400ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}>
                <XDSToolbar
                  label="Viewport controls"
                  padding={1}
                  startContent={<></>}
                  centerContent={
                    <XDSSegmentedControl
                      value={editorViewport}
                      onChange={(v: string) => setEditorViewport(v)}
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
                      <XDSTooltip content="Phone">
                        <XDSSegmentedControlItem
                          value="phone"
                          label="Phone"
                          isLabelHidden
                          icon={<PhoneIcon />}
                        />
                      </XDSTooltip>
                    </XDSSegmentedControl>
                  }
                />
              </div>
            )}
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
              hideToolbar
              externalViewportSize={editorViewport}
            />
          </div>
        </div>
      </div>
    );
  }

  // Editor flow for non-2nd cards that went through preview → use
  if (useTarget !== null && useTarget !== 1 && useTarget !== 2 && activeView === 'craft') {
    const t = TEMPLATES[useTarget % TEMPLATES.length];
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'var(--color-background-body, #f5f5f5)',
        }}>
        <style>
          {'@keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }' +
            '@keyframes checkDraw { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }' +
            '.xds-editor-resize-handle { opacity: 0; transition: opacity 150ms ease, background-color 150ms ease; }' +
            '.xds-editor-resize-grip:hover .xds-editor-resize-handle { opacity: 0.6; }' +
            '.xds-editor-resize-grip[data-resizing="true"] .xds-editor-resize-handle { opacity: 1; }'}
        </style>
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
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
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
        </div>
        {/* Resize handle */}
        <div
          onMouseDown={handleEditorResizeStart}
          data-resizing={isEditorResizing}
          className="xds-editor-resize-grip"
          style={{
            width: 12,
            flexShrink: 0,
            cursor: 'col-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            backgroundColor: 'var(--color-background-body, #f5f5f5)',
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
        <div
          style={{flex: 1, display: 'flex', flexDirection: 'column' as const, minWidth: 0, overflow: 'hidden'}}>
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
          />
        </div>
      </div>
    );
  }

  // Preview page for all other cards (two-step: preview → editor)
  if (previewTarget !== null && useTarget === null && activeView === 'craft') {
    const t = TEMPLATES[previewTarget % TEMPLATES.length];
    return (
      <TemplateFullPreview
        templateName={t.name}
        imageSrc={t.src}
        onBack={() => {
          setPreviewTarget(null);
        }}
        onUse={() => {
          setUseTarget(previewTarget);
          setPreviewTarget(null);
          setChatOpen(true);
        }}
        onSelectTemplate={index => {
          setPreviewTarget(index);
        }}
        hideShadows={previewTarget === 2}
      />
    );
  }

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
                padding: '16px 24px',
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
    </div>
  );
}
