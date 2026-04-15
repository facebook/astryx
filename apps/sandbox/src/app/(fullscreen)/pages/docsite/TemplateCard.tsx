'use client';

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {BookmarkIcon, BookmarkFilledIcon} from './docsite-icons';
import {BoidsCanvas} from './BoidsCanvas';
import type {BoidsSimulation} from './BoidsCanvas';
import {SharePopover} from './SharePopover';

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
  const useButtonRef = useRef<HTMLButtonElement>(null);
  const [showUsePopover, setShowUsePopover] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [usePopoverPos, setUsePopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleUseClick = useCallback(() => {
    if (useButtonRef.current) {
      const rect = useButtonRef.current.getBoundingClientRect();
      setUsePopoverPos({top: rect.bottom + 8, left: rect.left});
    }
    setShowUsePopover(prev => !prev);
  }, []);

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
              transition: 'opacity 300ms ease',
            }}>
            {/* Top-right: bookmark */}
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
            {/* Bottom: info + actions */}
            <div
              onClick={e => e.stopPropagation()}
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
              {/* Template info */}
              <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
                <XDSText type="body" weight="bold" style={{color: '#fff'}}>
                  {name}
                </XDSText>
                <XDSText
                  type="supporting"
                  style={{color: 'rgba(255,255,255,0.7)'}}>
                  Andrea Anderson
                </XDSText>
              </div>
              {/* Action buttons */}
              <div style={{display: 'flex', gap: 8}}>
                <XDSButton
                  ref={useButtonRef}
                  label="Use"
                  variant="secondary"
                  size="sm"
                  style={{backgroundColor: 'var(--color-background-surface)'}}
                  onClick={handleUseClick}
                />
                <XDSButton
                  label="Craft"
                  variant="secondary"
                  size="sm"
                  style={{backgroundColor: 'var(--color-background-surface)'}}
                  onClick={onUse}
                />
              </div>
              {showUsePopover && usePopoverPos && (
                <SharePopover
                  cliCommand={`npx xds template ${name.toLowerCase().replace(/\s+/g, '-')}`}
                  position={usePopoverPos}
                  onClose={() => setShowUsePopover(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </XDSCard>
  );
}
