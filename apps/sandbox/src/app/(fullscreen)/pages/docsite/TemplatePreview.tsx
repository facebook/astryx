'use client';

import React, {useState, useEffect, useRef} from 'react';
import {XDSHeading, XDSText} from '@xds/core/Text';
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
  CodeIcon,
  SaveIcon,
  ShareIcon,
  CopyIcon,
  ClaudeIcon,
  VSCodeIcon,
  CursorAIIcon,
} from './docsite-icons';

import {VIEWPORT_WIDTHS, XDS_THEMES, MOCK_CODE} from './constants';
import {BoidsCanvas, type BoidsSimulation} from './BoidsCanvas';

export function TemplatePreview({
  templateName,
  imageSrc,
  onBack: _onBack,
  isGenerating,
  simulation,
  onPublish,
}: {
  templateName: string;
  imageSrc: string;
  onBack: () => void;
  isGenerating: boolean;
  simulation: BoidsSimulation;
  onPublish?: () => void;
}) {
  const [viewportSize, setViewportSize] = useState('desktop');
  const [editorView, setEditorView] = useState('preview');
  const previewRef = useRef(null);
  const [previewSize, setPreviewSize] = useState({w: 0, h: 0});
  const [showCanvas, setShowCanvas] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [sharePopoverPos, setSharePopoverPos] = useState(null as {top: number; left: number} | null);
  const [shareCopied, setShareCopied] = useState(false);
  const shareButtonRef = useRef(null);
  const sharePopoverRef = useRef(null);

  const shareCliCommand = `npx xds template ${templateName.toLowerCase().replace(/\s+/g, '-')} ./my-project`;

  useEffect(() => {
    if (!showSharePopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sharePopoverRef.current &&
        !(sharePopoverRef.current as HTMLElement).contains(e.target as Node)
      ) {
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
          <div
            style={{backgroundColor: 'var(--color-background-body, #f5f5f5)', position: 'relative', zIndex: 10, flexShrink: 0}}>
            <XDSToolbar
              label="Template actions"
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
                <>
                  <XDSTooltip content="Point">
                    <XDSButton
                      label="Point"
                      variant="ghost"
                      isIconOnly
                      icon={<CursorIcon />}
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
                  <XDSTooltip content="Toggle code">
                    <XDSButton
                      label="Toggle code"
                      variant={editorView === 'code' ? 'secondary' : 'ghost'}
                      isIconOnly
                      icon={<CodeIcon />}
                      onClick={() =>
                        setEditorView(
                          editorView === 'preview' ? 'code' : 'preview',
                        )
                      }
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
                    ref={sharePopoverRef}
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
                      <div
                        style={{
                          position: 'fixed',
                          left: (sharePopoverPos as {top: number; left: number}).left,
                          top: (sharePopoverPos as {top: number; left: number}).top,
                          zIndex: 100,
                          width: 340,
                          backgroundColor:
                            'var(--color-background-card, #fff)',
                          borderRadius: 12,
                          boxShadow:
                            '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                          padding: 20,
                        }}>
                        <XDSHeading level={4}>Add to your project</XDSHeading>
                        <div style={{marginTop: 8}}>
                          <XDSText type="body" color="secondary">
                            Copy this snippet and paste it in your terminal to
                            get started.
                          </XDSText>
                        </div>
                        <div
                          style={{
                            position: 'relative',
                            backgroundColor: '#1a1a2e',
                            borderRadius: 10,
                            padding: '14px 16px',
                            paddingRight: 44,
                            marginTop: 12,
                          }}>
                          <code
                            style={{
                              color: '#fff',
                              fontFamily: '"Roboto Mono", monospace',
                              fontSize: 13,
                              lineHeight: 1.5,
                              wordBreak: 'break-all',
                            }}>
                            {shareCliCommand}
                          </code>
                          <div
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                            }}>
                            <XDSButton
                              label={shareCopied ? 'Copied' : 'Copy'}
                              variant="ghost"
                              size="sm"
                              isIconOnly
                              icon={<CopyIcon />}
                              style={{
                                color: shareCopied ? '#4ade80' : '#fff',
                              }}
                              onClick={() => {
                                navigator.clipboard.writeText(shareCliCommand);
                                setShareCopied(true);
                                setTimeout(() => setShareCopied(false), 2000);
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            height: 1,
                            backgroundColor: 'var(--color-divider, #e0e0e0)',
                            margin: '16px 0',
                          }}
                        />
                        <div style={{marginBottom: 8}}>
                          <XDSText
                            type="supporting"
                            weight="semibold"
                            color="secondary">
                            Open in...
                          </XDSText>
                        </div>
                        {[
                          {label: 'Claude Code', Icon: ClaudeIcon},
                          {label: 'VSCode', Icon: VSCodeIcon},
                          {label: 'Cursor', Icon: CursorAIIcon},
                        ].map(item => (
                          <div
                            key={item.label}
                            onClick={() => setShowSharePopover(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '8px 4px',
                              cursor: 'pointer',
                              borderRadius: 8,
                            }}>
                            <item.Icon
                              style={{
                                width: 18,
                                height: 18,
                                flexShrink: 0,
                              }}
                            />
                            <XDSText type="body">{item.label}</XDSText>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <XDSButton
                    label="Publish"
                    variant="primary"
                    size="sm"
                    onClick={() => onPublish?.()}
                  />
                </>
              }
            />
          </div>

          {/* Preview — browser frame + image (hidden when publishing) */}
          <div
            style={{
              backgroundColor: 'var(--color-background-body, #f5f5f5)',
              borderRadius: 0,
              padding: '22px 22px 22px',
              margin: 0,
              display: editorView === 'preview' ? 'flex' : 'none',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flex: 1,
              overflow: 'hidden',
            }}>
            <div
              ref={previewRef}
              style={{
                position: 'relative',
                width:
                  VIEWPORT_WIDTHS[viewportSize] === '100%'
                    ? '100%'
                    : VIEWPORT_WIDTHS[viewportSize],
                maxWidth: '100%',
                backgroundColor: '#fff',
                borderRadius: viewportSize === 'phone' ? 36 : 12,
                border: viewportSize === 'phone' ? '10px solid #fff' : 'none',
                boxShadow:
                  viewportSize === 'phone'
                    ? '0 8px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)'
                    : '0 8px 40px rgba(0,0,0,0.12)',
                overflow: 'hidden',
              }}>
              {/* Browser chrome dots for desktop */}
              {viewportSize === 'desktop' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #f0f0f0',
                  }}>
                  <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                      }}
                    />
                  </div>
                </div>
              )}
              <img
                src={imageSrc}
                alt="Template preview"
                style={{
                  display: 'block',
                  width: '100%',
                  aspectRatio:
                    viewportSize === 'phone' ? '9 / 19.5' : '1920 / 1200',
                  objectFit: 'cover',
                  opacity: isGenerating ? 0 : 1,
                  transition: 'opacity 600ms ease',
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

          {/* Code block */}
          <div
            style={{
              margin: '0 22px 22px',
              backgroundColor: 'var(--color-background-card, #fff)',
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              overflow: 'auto',
              flex: 1,
              display: editorView === 'code' ? 'flex' : 'none',
              flexDirection: 'column' as const,
            }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px 8px 16px',
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
            {/* Code */}
            <div style={{display: 'flex'}}>
              {/* Line numbers */}
              <div
                style={{
                  padding: '12px 12px 12px 16px',
                  borderRight:
                    '1px solid var(--color-divider, rgba(0,0,0,0.1))',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: 14,
                  lineHeight: '20px',
                  color: 'var(--color-text-disabled, #a4b0bc)',
                  textAlign: 'right',
                  userSelect: 'none',
                  minWidth: 45,
                }}>
                {MOCK_CODE.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Code content */}
              <pre
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: 14,
                  lineHeight: '20px',
                  margin: 0,
                  overflow: 'auto',
                  color: 'var(--color-text-primary, #0a1317)',
                }}>
                {MOCK_CODE}
              </pre>
            </div>
          </div>

        </div>
      </div>
  );
}
