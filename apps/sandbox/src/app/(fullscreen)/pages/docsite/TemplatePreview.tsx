'use client';

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSTooltip} from '@xds/core/Tooltip';

import {
  DesktopIcon,
  PhoneIcon,
  CursorIcon,
  PaletteIcon,
  ContrastIcon,
  SaveIcon,
  ShareIcon,
  ShareOutIcon,
  FullscreenIcon,
  MoonIcon,
  LinkIcon,
  CheckIcon,
} from './docsite-icons';
import {SharePopover} from './SharePopover';

import {VIEWPORT_WIDTHS, XDS_THEMES} from './constants';
import {BoidsCanvas, type BoidsSimulation} from './BoidsCanvas';

import type {PointedElement} from './ChatPanel';

export function TemplatePreview({
  templateName,
  imageSrc,
  onBack: _onBack,
  isGenerating,
  simulation,
  onPublish,
  isPointing,
  onPointingChange,
  onElementPointed,
  hideToolbar = false,
  externalViewportSize,
  isPublishing = false,
  isFullPreview = false,
  onFullPreviewChange,
  previewBackground,
}: {
  templateName: string;
  imageSrc: string;
  onBack: () => void;
  isGenerating: boolean;
  simulation: BoidsSimulation;
  onPublish?: () => void;
  isPointing?: boolean;
  onPointingChange?: (pointing: boolean) => void;
  onElementPointed?: (el: PointedElement) => void;
  hideToolbar?: boolean;
  externalViewportSize?: string;
  isPublishing?: boolean;
  isFullPreview?: boolean;
  onFullPreviewChange?: (full: boolean) => void;
  previewBackground?: string;
}) {
  const [internalViewportSize, setViewportSize] = useState('desktop');
  const viewportSize = externalViewportSize ?? internalViewportSize;
  const previewRef = useRef(null);
  const [previewSize, setPreviewSize] = useState({w: 0, h: 0});
  const [showCanvas, setShowCanvas] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleSave = useCallback(() => {
    setSaveState('saving');
    setTimeout(() => setSaveState('saved'), 1200);
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [sharePopoverPos, setSharePopoverPos] = useState(null as {top: number; left: number} | null);
  const shareButtonRef = useRef(null);

  const shareCliCommand = `npx xds template ${templateName.toLowerCase().replace(/\s+/g, '-')} ./my-project`;

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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => setIsScrolled(el.scrollTop > 8);
    el.addEventListener('scroll', handleScroll, {passive: true});
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isGenerating && previewRef.current) {
      const rect = (previewRef.current as HTMLElement).getBoundingClientRect();
      setPreviewSize({w: rect.width, h: rect.height});
      setShowCanvas(true);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating && showCanvas) {
      const id = setTimeout(() => setShowCanvas(false), 800);
      return () => clearTimeout(id);
    }
  }, [isGenerating, showCanvas]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        overflow: 'visible',
        paddingTop: 0,
        position: 'relative' as const,
      }}>
      {/* Toolbar — outside overflow:hidden so dropdowns aren't clipped */}
      {!hideToolbar && <div
            style={{
              background: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              paddingTop: 8,
              display: 'flex',
              justifyContent: 'center',
            }}>
            <div style={{
              backgroundColor: isScrolled ? 'var(--color-background-card, #fff)' : (previewBackground ?? 'var(--color-background-card, #fff)'),
              borderRadius: 'var(--radius-container, 12px)',
              border: 'none',
              display: 'inline-flex',
              padding: '4px 0',
              boxShadow: isScrolled ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              transition: 'background-color 200ms ease, box-shadow 300ms ease',
            }}>
            <XDSToolbar
              label="Template actions"
              padding={0}
              centerContent={
                isPublishing ? (
                <>
                  <XDSSegmentedControl
                    value={viewportSize}
                    onChange={setViewportSize}
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
                </>
                ) : (
                <>
                  <XDSTooltip content="Point">
                    <XDSButton
                      label="Point"
                      variant={isPointing ? 'secondary' : 'ghost'}
                      isIconOnly
                      icon={<CursorIcon />}
                      onClick={() => onPointingChange?.(!isPointing)}
                    />
                  </XDSTooltip>
                  <XDSTooltip content="Theme">
                    <XDSDropdownMenu
                      button={{
                        label: 'Theme',
                        variant: 'ghost',
                        isIconOnly: true,
                        icon: <PaletteIcon />,
                      }}
                      hasChevron={false}
                      items={XDS_THEMES.map(t => ({
                        label: t.label,
                        onClick: () => {},
                      }))}
                    />
                  </XDSTooltip>
                  <XDSTooltip content={isDarkMode ? "Dark mode" : "Light mode"}>
                    <XDSButton
                      label={isDarkMode ? "Dark mode" : "Light mode"}
                      variant="ghost"
                      isIconOnly
                      icon={isDarkMode ? <MoonIcon /> : <ContrastIcon />}
                      onClick={() => setIsDarkMode(prev => !prev)}
                    />
                  </XDSTooltip>
                  <XDSSegmentedControl
                    value={viewportSize}
                    onChange={setViewportSize}
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
                  <XDSTooltip content="Preview">
                    <XDSButton
                      label="Preview"
                      variant="ghost"
                      isIconOnly
                      icon={<FullscreenIcon />}
                      onClick={() => onFullPreviewChange?.(true)}
                    />
                  </XDSTooltip>
                  {saveState === 'saved' ? (
                    <XDSTooltip content={linkCopied ? "Copied!" : "Copy link"}>
                      <XDSButton
                        label={linkCopied ? "Copied" : "Copy link"}
                        variant="ghost"
                        icon={linkCopied ? <CheckIcon color="var(--color-icon-primary, #111)" /> : <LinkIcon />}
                        isIconOnly
                        onClick={handleCopyLink}
                      />
                    </XDSTooltip>
                  ) : saveState === 'saving' ? (
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32}}>
                      <XDSSpinner size="sm" />
                    </div>
                  ) : (
                    <XDSTooltip content="Save">
                      <XDSButton
                        label="Save"
                        variant="ghost"
                        icon={<SaveIcon />}
                        isIconOnly
                        onClick={handleSave}
                      />
                    </XDSTooltip>
                  )}
                  <XDSButton
                    label="Submit"
                    variant="secondary"
                    size="sm"
                    onClick={() => onPublish?.()}
                  />
                  <div
                    style={{position: 'relative'}}>
                    <XDSButton
                      label="Use"
                      variant="primary"
                      size="sm"
                      ref={shareButtonRef}
                      onClick={() => {
                        setShowSharePopover(prev => {
                          if (!prev && shareButtonRef.current) {
                            const rect =
                              (shareButtonRef.current as HTMLElement).getBoundingClientRect();
                            const popoverWidth = 340;
                            const popoverHeight = 400;
                            const left = Math.min(
                              Math.max(8, rect.right - popoverWidth),
                              window.innerWidth - popoverWidth - 16,
                            );
                            const top =
                              rect.bottom + 4 + popoverHeight + 16 >
                              window.innerHeight
                                ? rect.top - popoverHeight - 4
                                : rect.bottom + 4;
                            setSharePopoverPos({top, left});
                          }
                          return !prev;
                        });
                      }}
                    />
                    {showSharePopover && sharePopoverPos && (
                      <SharePopover
                        cliCommand={shareCliCommand}
                        position={sharePopoverPos}
                        onClose={() => setShowSharePopover(false)}
                      />
                    )}
                  </div>
                </>
                )
              }
            />
            </div>
          </div>}

      {/* Bordered container: preview/code/publish */}
      <div
        style={{
          flex: 1,
          overflow: previewBackground ? 'visible' : 'hidden',
          padding: 0,
          display: 'flex',
          flexDirection: 'column' as const,
          minHeight: 0,
          position: 'relative' as const,
        }}>
          {/* Exit preview button — shown in full preview mode */}
          {isFullPreview && (
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 20,
            }}>
              <XDSButton
                label="Exit preview"
                variant="secondary"
                size="sm"
                onClick={() => onFullPreviewChange?.(false)}
              />
            </div>
          )}

          {/* Preview — full-bleed image */}
          <div
            ref={(el) => {
              (previewRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
              (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }}
            style={{
              position: 'relative',
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              backgroundColor: previewBackground ?? 'var(--color-background-surface, #fff)',
              padding: isFullPreview ? 0 : (viewportSize === 'phone' ? 24 : (previewBackground ? '64px 16px 16px 16px' : '64px 16px 16px 0')),
              cursor: isPointing ? 'crosshair' : undefined,
              transition: 'background-color 300ms ease, padding 300ms ease',
            }}
            onClick={isPointing ? (e: React.MouseEvent) => {
              const target = e.target as HTMLElement;
              const rect = target.getBoundingClientRect();
              onElementPointed?.({
                tagName: target.tagName,
                componentName: target.dataset.component,
                rect: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
              });
              onPointingChange?.(false);
            } : undefined}>
            <div style={{
              width: viewportSize === 'phone' ? 375 : '100%',
              borderRadius: viewportSize === 'phone' ? 36 : (isFullPreview ? 0 : 'var(--radius-container, 12px)'),
              border: previewBackground ? 'none' : (isFullPreview ? 'none' : '1px solid var(--color-divider, #e0e0e0)'),
              boxShadow: previewBackground && !isFullPreview ? 'rgba(0, 0, 0, 0.08) 0px 1px 3px, rgba(0, 0, 0, 0.06) 0px 4px 12px' : 'none',
              overflow: 'hidden',
              flexShrink: 0,
              margin: isFullPreview ? 0 : 'auto 0',
              transition: 'width 300ms ease, border-radius 300ms ease',
            }}>
              <img
                src={imageSrc}
                alt="Template preview"
                style={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: viewportSize === 'phone' ? '9 / 19.5' : undefined,
                  objectFit: viewportSize === 'phone' ? 'cover' : undefined,
                  opacity: isGenerating ? 0 : 1,
                  transition: 'opacity 600ms ease',
                }}
              />
            </div>
            {showCanvas && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: isGenerating ? 1 : 0,
                  transition: 'opacity 600ms ease',
                }}>
                <BoidsCanvas
                  width={previewSize.w}
                  height={previewSize.h}
                  simulation={simulation}
                />
              </div>
            )}
          </div>

        </div>
      </div>
  );
}
