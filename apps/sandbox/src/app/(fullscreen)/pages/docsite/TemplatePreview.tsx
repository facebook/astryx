'use client';

import React, {useState, useEffect, useRef} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
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
}) {
  const [internalViewportSize, setViewportSize] = useState('desktop');
  const viewportSize = externalViewportSize ?? internalViewportSize;
  const previewRef = useRef(null);
  const [previewSize, setPreviewSize] = useState({w: 0, h: 0});
  const [showCanvas, setShowCanvas] = useState(false);
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
      }}>
      {/* Bordered container: toolbar + preview/code/publish */}
      <div
        style={{
          flex: 1,
          overflow: 'visible',
          padding: 0,
          display: 'flex',
          flexDirection: 'column' as const,
          minHeight: 0,
        }}>
          {/* Toolbar */}
          {!hideToolbar && <div
            style={{
              backgroundColor: 'var(--color-background-body, #f5f5f5)',
              position: 'relative',
              zIndex: 10,
              flexShrink: 0,
            }}>
            <XDSToolbar
              label="Template actions"
              padding={1}
              startContent={<></>}
              centerContent={
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
              }
              endContent={
                isPublishing ? undefined : (
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
                  <XDSTooltip content="Toggle theme">
                    <XDSButton
                      label="Toggle theme"
                      variant="ghost"
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
                      icon={<SaveIcon />}
                      isIconOnly
                      onClick={() => {}}
                    />
                  </XDSTooltip>
                  <div
                    style={{position: 'relative'}}>
                    <XDSTooltip content="Share">
                      <XDSButton
                        label="Share"
                        variant="ghost"
                        isIconOnly
                        icon={<ShareIcon />}
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
                    </XDSTooltip>
                    {showSharePopover && sharePopoverPos && (
                      <SharePopover
                        cliCommand={shareCliCommand}
                        position={sharePopoverPos}
                        onClose={() => setShowSharePopover(false)}
                      />
                    )}
                  </div>
                  <XDSButton
                    label="Publish"
                    variant="primary"
                    size="sm"
                    onClick={() => onPublish?.()}
                  />
                </>
                )
              }
            />
          </div>}

          {/* Preview — full-bleed image */}
          <div
            ref={previewRef}
            style={{
              position: 'relative',
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: viewportSize === 'phone' ? 'flex-start' : 'stretch',
              backgroundColor: 'var(--color-background-body, #f5f5f5)',
              padding: viewportSize === 'phone' ? 24 : 16,
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
            <img
              src={imageSrc}
              alt="Template preview"
              style={{
                display: 'block',
                width: viewportSize === 'phone' ? 375 : '100%',
                minHeight: viewportSize === 'phone' ? undefined : '100%',
                aspectRatio: viewportSize === 'phone' ? '9 / 19.5' : undefined,
                objectFit: 'cover',
                borderRadius: viewportSize === 'phone' ? 36 : 12,
                boxShadow: viewportSize === 'phone'
                  ? '0 8px 40px rgba(0,0,0,0.15)'
                  : '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
                opacity: isGenerating ? 0 : 1,
                transition: 'width 300ms ease, border-radius 300ms ease, box-shadow 300ms ease, opacity 600ms ease',
              }}
            />
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
