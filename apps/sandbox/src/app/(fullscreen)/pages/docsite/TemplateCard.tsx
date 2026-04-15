'use client';

import React, {useState, useEffect} from 'react';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';
import {XDSPopover} from '@xds/core/Popover';
import {BookmarkIcon, BookmarkFilledIcon} from './docsite-icons';
import {CraftingCat} from './CraftingCat';
import {SharePopoverContent} from './SharePopover';

export function TemplateCard({
  src,
  name,
  isSelected: _isSelected,
  onSelect: _onSelect,
  isGenerating,
  onMoreLikeThis: _onMoreLikeThis,
  onUse,
  onPreview,
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
  cardSize?: 'xlarge' | 'large' | 'medium' | 'small';
}) {
  const [hovered, setHovered] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showUsePopover, setShowUsePopover] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (isGenerating) {
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
            aspectRatio: '1920 / 1205',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isGenerating ? 1 : 0,
              transition: 'opacity 600ms ease',
            }}>
            <CraftingCat />
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
              <XDSStack direction="vertical" gap={0}>
                <XDSText type="body" weight="bold" style={{color: '#fff'}}>
                  {name}
                </XDSText>
                <XDSText
                  type="supporting"
                  style={{color: 'rgba(255,255,255,0.7)'}}>
                  Andrea Anderson
                </XDSText>
              </XDSStack>
              {/* Action buttons */}
              <XDSStack direction="horizontal" gap={2}>
                <XDSPopover
                  label="Add to project"
                  isOpen={showUsePopover}
                  onOpenChange={setShowUsePopover}
                  placement="above"
                  alignment="start"
                  width={340}
                  content={
                    <SharePopoverContent
                      cliCommand={`npx xds template ${name.toLowerCase().replace(/\s+/g, '-')}`}
                      onClose={() => setShowUsePopover(false)}
                    />
                  }>
                  <XDSButton
                    label="Use"
                    variant="secondary"
                    size="sm"
                    style={{backgroundColor: 'var(--color-background-surface)'}}
                  />
                </XDSPopover>
                <XDSButton
                  label="Craft"
                  variant="secondary"
                  size="sm"
                  style={{backgroundColor: 'var(--color-background-surface)'}}
                  onClick={onUse}
                />
              </XDSStack>
            </div>
          </div>
        )}
      </div>
    </XDSCard>
  );
}
