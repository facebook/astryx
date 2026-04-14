'use client';

import React, {useState} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {PlusIcon, SendIcon, SidebarIcon, ArrowLeftIcon} from './docsite-icons';
import LogoNav from './LogoNav';
import {ShimmerText} from './ShimmerText';

export function ChatPanel({
  isGenerating,
  onSend,
  activeView,
  setActiveView,
  templateName,
  onBack,
}: {
  isGenerating: boolean;
  onSend?: () => void;
  activeView: 'craft' | 'explore' | 'docs' | 'profile';
  setActiveView: (view: 'craft' | 'explore' | 'docs' | 'profile') => void;
  templateName?: string;
  onBack?: () => void;
}) {
  const [prompt, setPrompt] = useState('');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        width: '100%',
      }}>
      {/* Header: logo or back+title */}
      {!templateName && (
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
      {templateName && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '16px 16px 0',
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
              style={{flexShrink: 0}}
            />
          )}
          <XDSHeading level={1} style={{lineHeight: 1}}>
            {templateName}
          </XDSHeading>
        </div>
      )}

      {/* Chat thread */}
      <div style={{flex: 1, padding: 16, overflow: 'auto'}}>
        {/* User message */}
        <div
          style={{
            backgroundColor: 'var(--color-background-body, #f1f4f7)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}>
          <XDSText type="body">
            Can you customize this template by adding a divider line under the
            header and use a card for the lists
          </XDSText>
        </div>
        {/* AI shimmer response */}
        <div style={{padding: '0 4px'}}>
          <ShimmerText isActive={isGenerating} />
        </div>
      </div>

      {/* Composer pinned to bottom */}
      <div
        style={{
          padding: templateName ? 0 : 12,
          borderTop: templateName
            ? '1px solid var(--color-divider, #e0e0e0)'
            : 'none',
        }}>
        <div
          style={{
            borderRadius: templateName ? 0 : 20,
            backgroundColor: 'var(--color-background-card, white)',
            border: templateName ? 'none' : '1px solid var(--color-divider)',
            borderTop: templateName
              ? '1px solid var(--color-divider)'
              : undefined,
            boxShadow: templateName ? 'none' : 'var(--shadow-high)',
            padding: 8,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 8,
          }}>
          <div style={{display: 'flex', alignItems: 'center', padding: 8}}>
            <input
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
                fontSize: 14,
              }}
              placeholder="What would you like to customize?"
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
    </div>
  );
}
