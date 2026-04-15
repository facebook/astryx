'use client';

import React, {useState, useEffect, useRef} from 'react';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSText} from '@xds/core/Text';
import {
  LinkIcon,
  UploadIcon,
  HeartIcon,
  BookmarkIcon,
  TerminalIcon,
  ClaudeIcon,
  VSCodeIcon,
  CursorAIIcon,
} from './docsite-icons';
import {BoidsCanvas} from './BoidsCanvas';
import type {BoidsSimulation} from './BoidsCanvas';

export function TemplateCard({
  src,
  name,
  isSelected: _isSelected,
  onSelect: _onSelect,
  isGenerating,
  onMoreLikeThis: _onMoreLikeThis,
  onUse,
  onPreview,
  simulation,
  cardSize: _cardSize = 'medium',
}: {
  src: string;
  name: string;
  isSelected?: boolean;
  onSelect?: () => void;
  isGenerating: boolean;
  onMoreLikeThis?: () => void;
  onUse: () => void;
  onPreview: () => void;
  simulation: BoidsSimulation;
  cardSize?: 'xlarge' | 'large' | 'medium' | 'small';
}) {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef(null as HTMLDivElement | null);
  const [size, setSize] = useState({w: 0, h: 0});
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    if (isGenerating && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSize({w: rect.width, h: rect.height});
      setShowCanvas(true);
    }
  }, [isGenerating]);

  // Keep canvas mounted briefly after generating ends for fade-out
  useEffect(() => {
    if (!isGenerating && showCanvas) {
      const id = setTimeout(() => setShowCanvas(false), 800);
      return () => clearTimeout(id);
    }
  }, [isGenerating, showCanvas]);

  return (
    <XDSCard padding={0}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onPreview}>
        {/* Image layer — always present */}
        <img
          src={src}
          alt={name}
          style={{
            display: 'block',
            width: '100%',
            height: 400,
            objectFit: 'cover' as const,
            objectPosition: 'top',
            opacity: isGenerating ? 0 : 1,
            transition: 'opacity 600ms ease',
          }}
        />
        {/* Canvas layer — overlaid, fades in/out */}
        {showCanvas && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isGenerating ? 1 : 0,
              transition: 'opacity 600ms ease',
            }}>
            <BoidsCanvas
              width={size.w}
              height={size.h}
              simulation={simulation}
            />
          </div>
        )}
        {!isGenerating && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--color-overlay, rgba(0,0,0,0.5))',
              opacity: hovered ? 1 : 0,
              transition:
                'opacity var(--duration-fast, 175ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
            }}>
            {/* Top-right: action buttons */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onClick={e => e.stopPropagation()}>
              <XDSButton
                label="Link"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<LinkIcon />}
                style={{color: '#fff'}}
                onClick={() => {}}
              />
              <XDSButton
                label="Export"
                variant="ghost"
                size="sm"
                isIconOnly
                icon={<UploadIcon />}
                style={{color: '#fff'}}
                onClick={() => {}}
              />
              <div style={{display: 'flex', alignItems: 'center', gap: 2}}>
                <XDSButton
                  label="Like"
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<HeartIcon />}
                  style={{color: '#fff'}}
                  onClick={() => {}}
                />
                <span style={{color: '#fff', fontSize: 12, fontWeight: 500}}>1,645</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 2}}>
                <XDSButton
                  label="Bookmark"
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<BookmarkIcon />}
                  style={{color: '#fff'}}
                  onClick={() => {}}
                />
                <span style={{color: '#fff', fontSize: 12, fontWeight: 500}}>892</span>
              </div>
            </div>
            {/* Bottom: template info + actions */}
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '24px 12px 12px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                transform: hovered ? 'translateY(0)' : 'translateY(16px)',
                opacity: hovered ? 1 : 0,
                transition:
                  'transform var(--duration-fast, 175ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1)), opacity var(--duration-fast, 175ms) var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
              }}>
              {/* Template info */}
              <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <XDSText type="body" style={{color: '#fff', fontWeight: 700}}>
                  {name}
                </XDSText>
                <XDSText type="supporting" style={{color: 'rgba(255,255,255,0.7)'}}>
                  Andrea Anderson
                </XDSText>
              </div>
              {/* Action buttons */}
              <div style={{display: 'flex', gap: 4}}>
                <XDSDropdownMenu
                  button={{
                    label: 'Use',
                    variant: 'secondary',
                    size: 'sm',
                    style: {backgroundColor: 'var(--color-background-surface)'},
                  }}
                  hasChevron={false}
                  menuWidth={220}
                  items={[
                    {
                      label: 'Copy CLI Command...',
                      icon: TerminalIcon,
                      onClick: () => {},
                    },
                    {type: 'divider'},
                    {label: 'Claude Code', icon: ClaudeIcon, onClick: () => {}},
                    {label: 'VSCode', icon: VSCodeIcon, onClick: () => {}},
                    {label: 'Cursor', icon: CursorAIIcon, onClick: () => {}},
                  ]}
                />
                <XDSButton
                  label="Craft"
                  variant="secondary"
                  size="sm"
                  style={{backgroundColor: 'var(--color-background-surface)'}}
                  onClick={onUse}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </XDSCard>
  );
}
