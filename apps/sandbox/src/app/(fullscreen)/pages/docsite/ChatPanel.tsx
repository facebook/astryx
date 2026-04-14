'use client';

import React, {useState} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {PlusIcon, SendIcon, SidebarIcon, ArrowLeftIcon, GridIcon, SparklesIcon, StopIcon, ChevronDownIcon} from './docsite-icons';
import LogoNav from './LogoNav';
import {ShimmerText} from './ShimmerText';
import {MOCK_CODE} from './constants';

export type PanelTab = 'configure' | 'properties' | 'code';

export type PointedElement = {
  tagName: string;
  componentName?: string;
  rect?: {x: number; y: number; width: number; height: number};
} | null;

export function ChatPanel({
  isGenerating,
  onSend,
  activeView,
  setActiveView,
  templateName,
  onBack,
  activeTab,
  onTabChange,
  pointedElement,
  hideHeader = false,
}: {
  isGenerating: boolean;
  onSend?: () => void;
  activeView: 'craft' | 'explore' | 'docs' | 'profile';
  setActiveView: (view: 'craft' | 'explore' | 'docs' | 'profile') => void;
  templateName?: string;
  onBack?: () => void;
  activeTab?: PanelTab;
  onTabChange?: (tab: PanelTab) => void;
  pointedElement?: PointedElement;
  hideHeader?: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  const [codeContent, setCodeContent] = useState(MOCK_CODE);
  const tab = activeTab ?? 'configure';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        width: '100%',
      }}>
      {/* Header: logo or back+title */}
      {!hideHeader && !templateName && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            flexShrink: 0,
          }}>
          <LogoNav activeView={activeView} setActiveView={setActiveView} />
          <XDSButton
            label="Toggle sidebar"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<SidebarIcon />}
          />
        </div>
      )}
      {/* Tab bar (editor mode only) */}
      {!hideHeader && templateName && onTabChange && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px 0 16px',
            borderBottom: '1px solid var(--color-divider, #e0e0e0)',
            flexShrink: 0,
          }}>
          {onBack && (
            <XDSButton
              label="Back"
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon />}
              isIconOnly
              onClick={onBack}
              style={{flexShrink: 0, marginRight: 4}}
            />
          )}
          {(['configure', 'properties', 'code'] as const).map(t => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'none',
                border: 'none',
                borderBottom:
                  tab === t
                    ? '2px solid var(--color-text-primary, #111)'
                    : '2px solid transparent',
                marginBottom: -1,
                cursor: 'pointer',
                textAlign: 'center' as const,
                transition: 'border-color 150ms ease',
              }}>
              <XDSText
                type="body"
                color={tab === t ? 'primary' : 'secondary'}>
                {t === 'configure'
                  ? 'Craft'
                  : t === 'properties'
                    ? 'Properties'
                    : 'Code'}
              </XDSText>
            </button>
          ))}
        </div>
      )}

      {/* Configure tab (or default when no tabs) */}
      {(!templateName || !onTabChange || tab === 'configure') && (
        <>
          <div style={{flex: 1, padding: 16, overflow: 'auto'}}>
            <div
              style={{
                backgroundColor: 'var(--color-background-body, #f1f4f7)',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}>
              <XDSText type="body">
                Can you customize this template by adding a divider line under
                the header and use a card for the lists
              </XDSText>
            </div>
            <div style={{padding: '0 4px'}}>
              <ShimmerText isActive={isGenerating} />
            </div>
          </div>

          <div
            style={{
              padding: templateName ? 12 : 12,
            }}>
            <div
              style={{
                borderRadius: 16,
                backgroundColor: 'var(--color-background-card, white)',
                border: '1px solid var(--color-divider, #e0e0e0)',
                padding: 8,
                display: 'flex',
                flexDirection: 'column' as const,
                gap: 8,
              }}>
              <div
                style={{display: 'flex', alignItems: 'center', padding: 8}}>
                <input
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontFamily: 'inherit',
                    fontSize: 14,
                  }}
                  placeholder="Ask for changes"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  paddingInlineStart: 4,
                  paddingTop: 4,
                }}>
                <XDSButton
                  label="Attach"
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<PlusIcon />}
                />
                <XDSButton
                  label="Send"
                  variant="primary"
                  size="sm"
                  isIconOnly
                  icon={<SendIcon />}
                  style={{borderRadius: 9999}}
                  onClick={onSend}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Properties tab */}
      {templateName && onTabChange && tab === 'properties' && (
        <div style={{flex: 1, padding: 16, overflow: 'auto'}}>
          {pointedElement ? (
            <div style={{display: 'flex', flexDirection: 'column' as const, gap: 16}}>
              <div>
                <XDSText type="supporting" color="secondary">
                  Element
                </XDSText>
                <XDSText type="body" style={{fontWeight: 600, marginTop: 4}}>
                  {'<'}{pointedElement.tagName.toLowerCase()}{'>'}
                  {pointedElement.componentName && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: 'var(--color-text-secondary, #65676B)',
                      fontWeight: 400,
                    }}>
                      {pointedElement.componentName}
                    </span>
                  )}
                </XDSText>
              </div>
              <div style={{height: 1, backgroundColor: 'var(--color-divider, #e0e0e0)'}} />
              <div>
                <XDSText type="supporting" color="secondary" style={{marginBottom: 8}}>
                  Layout
                </XDSText>
                {[
                  {label: 'Width', value: pointedElement.rect ? `${Math.round(pointedElement.rect.width)}px` : '—'},
                  {label: 'Height', value: pointedElement.rect ? `${Math.round(pointedElement.rect.height)}px` : '—'},
                ].map(row => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                    }}>
                    <XDSText type="body" color="secondary">{row.label}</XDSText>
                    <XDSText type="body" style={{fontFamily: '"Roboto Mono", monospace', fontSize: 13}}>{row.value}</XDSText>
                  </div>
                ))}
              </div>
              <div style={{height: 1, backgroundColor: 'var(--color-divider, #e0e0e0)'}} />
              <div>
                <XDSText type="supporting" color="secondary" style={{marginBottom: 8}}>
                  Styles
                </XDSText>
                {[
                  {label: 'Background', value: '#ffffff'},
                  {label: 'Border radius', value: '12px'},
                  {label: 'Padding', value: '16px'},
                  {label: 'Font size', value: '14px'},
                ].map(row => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                    }}>
                    <XDSText type="body" color="secondary">{row.label}</XDSText>
                    <XDSText type="body" style={{fontFamily: '"Roboto Mono", monospace', fontSize: 13}}>{row.value}</XDSText>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 8,
                opacity: 0.5,
              }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                <path d="M13 13l6 6" />
              </svg>
              <XDSText type="body" color="secondary" style={{textAlign: 'center' as const}}>
                Click the Point tool in the toolbar, then click an element in the preview
              </XDSText>
            </div>
          )}
        </div>
      )}

      {/* Code tab */}
      {templateName && onTabChange && tab === 'code' && (
        <div style={{flex: 1, display: 'flex', flexDirection: 'column' as const, minHeight: 0}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px 8px 16px',
              flexShrink: 0,
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
                borderRight:
                  '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                fontFamily: '"Roboto Mono", monospace',
                fontSize: 13,
                lineHeight: '20px',
                color: 'var(--color-text-disabled, #a4b0bc)',
                textAlign: 'right' as const,
                userSelect: 'none' as const,
                minWidth: 36,
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
                fontSize: 13,
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
      )}
    </div>
  );
}
