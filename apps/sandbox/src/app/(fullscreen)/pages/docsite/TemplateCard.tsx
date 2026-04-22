'use client';

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';
import {XDSPopover} from '@xds/core/Popover';
import {BookmarkIcon, BookmarkFilledIcon} from './docsite-icons';
import {CraftingCat} from './CraftingCat';
import {SharePopoverContent} from './SharePopover';
import {basePath} from './constants';

export function TemplateCard({
  src,
  slug,
  name,
  isSelected: _isSelected,
  onSelect: _onSelect,
  isGenerating,
  onMoreLikeThis: _onMoreLikeThis,
  onUse,
  onPreview,
  cardSize: _cardSize = 'medium',
  isCached = false,
  onIframeLoad,
}: {
  src: string;
  slug?: string;
  name: string;
  isSelected?: boolean;
  onSelect?: () => void;
  isGenerating: boolean;
  onMoreLikeThis?: () => void;
  onUse: () => void;
  onPreview: () => void;
  cardSize?: 'xlarge' | 'large' | 'medium' | 'small';
  isCached?: boolean;
  onIframeLoad?: (slug: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showUsePopover, setShowUsePopover] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [iframeScale, setIframeScale] = useState(0.25);
  const [loadIframe, setLoadIframe] = useState(isCached);
  const iframeWrapperRef = useRef<HTMLDivElement>(null);

  const updateIframeScale = useCallback(() => {
    if (iframeWrapperRef.current) {
      setIframeScale(iframeWrapperRef.current.offsetWidth / 1920);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    updateIframeScale();
    const el = iframeWrapperRef.current;
    if (!el) return;

    const resizeObs = new ResizeObserver(updateIframeScale);
    resizeObs.observe(el);

    return () => resizeObs.disconnect();
  }, [slug, updateIframeScale]);

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
        onMouseEnter={() => {
          setHovered(true);
          if (slug && !loadIframe) {
            setLoadIframe(true);
            onIframeLoad?.(slug);
          }
        }}
        onMouseLeave={() => setHovered(false)}
        onClick={onPreview}>
        {/* Preview layer — live iframe when slug is provided, static image otherwise */}
        {slug ? (
          <div
            ref={iframeWrapperRef}
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1920 / 1205',
              overflow: 'hidden',
              opacity: isGenerating ? 0 : 1,
              transition: 'opacity 600ms ease',
            }}>
            {!loadIframe && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background:
                    'linear-gradient(90deg, var(--color-background-muted, #f0f0f0) 0%, var(--color-background-surface, #fafafa) 50%, var(--color-background-muted, #f0f0f0) 100%)',
                  backgroundSize: '800px 100%',
                  animation: 'craftShimmer 1.6s ease-in-out infinite',
                }}
              />
            )}
            {loadIframe && (
              <iframe
                src={`${basePath}/templates/${slug}/?embed=1`}
                title={name}
                loading="lazy"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 1920,
                  height: 1205,
                  border: 'none',
                  transform: `scale(${iframeScale})`,
                  transformOrigin: 'top left',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        ) : (
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
        )}
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
                <XDSHeading level={3} style={{color: '#fff'}}>
                  {name}
                </XDSHeading>
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
