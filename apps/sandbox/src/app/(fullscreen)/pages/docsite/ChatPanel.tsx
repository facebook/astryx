'use client';

import * as stylex from '@stylexjs/stylex';
import React, {useState} from 'react';
import {XDSButton} from '@xds/core/Button';
import {
  XDSChatComposer,
  XDSChatComposerInput,
  XDSChatMessage,
  XDSChatMessageBubble,
} from '@xds/core/Chat';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSDivider} from '@xds/core/Divider';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {XDSText} from '@xds/core/Text';
import {ArrowLeftIcon} from './docsite-icons';
import {ShimmerText} from './ShimmerText';
import {MOCK_CODE} from './constants';

const composerStyles = stylex.create({
  border: {
    border: '1px solid var(--color-border)',
  },
});

export type PanelTab = 'configure' | 'properties' | 'code';

export type PointedElement = {
  tagName: string;
  componentName?: string;
  rect?: {x: number; y: number; width: number; height: number};
} | null;

export function ChatPanel({
  isGenerating,
  onSend,
  activeView: _activeView,
  setActiveView: _setActiveView,
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
  const tab = activeTab ?? 'configure';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        width: '100%',
      }}>
      {/* Tab bar (editor mode only) */}
      {!hideHeader && templateName && onTabChange && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px 0 16px',
            borderBottom: 'none',
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
              <XDSText type="body" color={tab === t ? 'primary' : 'secondary'}>
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
            <div style={{marginBottom: 16}}>
              <XDSChatMessage sender="user">
                <XDSChatMessageBubble>
                  Can you customize this template by adding a divider line under
                  the header and use a card for the lists
                </XDSChatMessageBubble>
              </XDSChatMessage>
            </div>
            <div style={{padding: '0 4px'}}>
              <ShimmerText isActive={isGenerating} />
            </div>
          </div>

          <div
            style={{
              padding: 12,
              // Override shadow tokens so the composer body inherits none
              '--shadow-low': 'none',
              '--shadow-med': 'none',
            } as React.CSSProperties}>
            <XDSChatComposer
              onSubmit={() => {
                onSend?.();
                setPrompt('');
              }}
              value={prompt}
              onChange={setPrompt}
              placeholder="Ask for changes"
              input={<XDSChatComposerInput placeholder="Ask for changes" />}
              xstyle={composerStyles.border}
              style={{
                '--shadow-low': 'none',
                '--shadow-med': 'none',
              } as React.CSSProperties}
            />
          </div>
        </>
      )}

      {/* Properties tab */}
      {templateName && onTabChange && tab === 'properties' && (
        <div style={{flex: 1, padding: 16, overflow: 'auto'}}>
          {pointedElement ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                gap: 16,
              }}>
              <div>
                <XDSText type="supporting" color="secondary">
                  Element
                </XDSText>
                <XDSText type="body" style={{fontWeight: 600, marginTop: 4}}>
                  {'<'}
                  {pointedElement.tagName.toLowerCase()}
                  {'>'}
                  {pointedElement.componentName && (
                    <span
                      style={{
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
              <XDSDivider />
              <XDSMetadataList title="Layout">
                <XDSMetadataListItem label="Width">
                  {pointedElement.rect
                    ? `${Math.round(pointedElement.rect.width)}px`
                    : '—'}
                </XDSMetadataListItem>
                <XDSMetadataListItem label="Height">
                  {pointedElement.rect
                    ? `${Math.round(pointedElement.rect.height)}px`
                    : '—'}
                </XDSMetadataListItem>
              </XDSMetadataList>
              <XDSDivider />
              <XDSMetadataList title="Styles">
                <XDSMetadataListItem label="Background">
                  #ffffff
                </XDSMetadataListItem>
                <XDSMetadataListItem label="Border radius">
                  12px
                </XDSMetadataListItem>
                <XDSMetadataListItem label="Padding">16px</XDSMetadataListItem>
                <XDSMetadataListItem label="Font size">
                  14px
                </XDSMetadataListItem>
              </XDSMetadataList>
            </div>
          ) : (
            <XDSEmptyState
              title="No element selected"
              description="Click the Point tool in the toolbar, then click an element in the preview"
              isCompact
            />
          )}
        </div>
      )}

      {/* Code tab */}
      {templateName && onTabChange && tab === 'code' && (
        <div style={{flex: 1, minHeight: 0, overflow: 'auto'}}>
          <XDSCodeBlock
            code={MOCK_CODE}
            language="typescript"
            title="useUser.ts"
            hasLineNumbers
          />
        </div>
      )}
    </div>
  );
}
