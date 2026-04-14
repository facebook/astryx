'use client';

import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';

import {createSimulation} from './BoidsCanvas';
import type {BoidsSimulation} from './BoidsCanvas';
import {TEMPLATES} from './constants';
import {TemplateCard} from './TemplateCard';
import {AIComposer} from './AIComposer';
import {ChatPanel} from './ChatPanel';
import {InlinePublishPanel} from './InlinePublishPanel';
import {TemplatePreview} from './TemplatePreview';
import {TemplateFullPreview} from './TemplateFullPreview';
import {AppTopNav} from './AppTopNav';
import {DocsView} from './DocsView';
import {ProfileView} from './ProfileView';

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
  const scrollContainerRef = useRef(null);

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

  // Editor flow for non-2nd cards that went through preview → use
  if (useTarget !== null && useTarget !== 1 && activeView === 'craft') {
    const t = TEMPLATES[useTarget % TEMPLATES.length];
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'var(--color-background-body, #f5f5f5)',
        }}>
        <div
          style={{
            width: 380,
            minWidth: 380,
            padding: 16,
            display: 'flex',
            animation: 'slideInLeft 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
          <style>
            {'@keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }' +
              '@keyframes checkDraw { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }'}
          </style>
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
              />
            )}
          </div>
        </div>
        <div
          style={{flex: 1, display: 'flex', flexDirection: 'column' as const}}>
          <TemplatePreview
            templateName={t.name}
            imageSrc={t.src}
            onBack={handleBackFromUse}
            isGenerating={previewGenerating}
            simulation={simRef.current!}
            onPublish={() => setShowPublishCard1(true)}
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
                padding: 16,
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
