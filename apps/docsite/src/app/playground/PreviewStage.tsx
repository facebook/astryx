// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PreviewStage.tsx
 * @input viewport size, fullscreen flag, iframe ref
 * @output Responsive preview frame hosting the /playground-preview iframe
 * @position Playground right panel — preview surface.
 *
 * Keeps a SINGLE iframe element mounted across viewport + fullscreen changes
 * (only the wrapper styles change) so the parent's postMessage channel to the
 * preview never resets. Desktop = fill; Phone = a fixed 375px-wide frame
 * (content reflows natively at mobile width, no scaling). Mirrors the Nest
 * craft editor's viewport behavior and dimensions.
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {Minimize2} from 'lucide-react';

export type Viewport = 'desktop' | 'phone';

// iPhone 17 logical viewport (402 × 874 CSS px, ~9:19.5).
const PHONE_WIDTH = 402;
const PHONE_HEIGHT = 874;

const s = stylex.create({
  area: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    overflow: 'hidden',
    paddingInline: 'var(--spacing-4)',
    paddingBlockEnd: 'var(--spacing-4)',
    paddingBlockStart: 0,
  },
  areaCenter: {
    alignItems: 'center',
  },
  fullscreen: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    paddingInline: 0,
    paddingBlockEnd: 0,
  },
  // In fullscreen the card chrome (radius, border, shadow) is stripped so the
  // preview reads as a bare, edge-to-edge surface. The element stays mounted to
  // preserve the single iframe + its postMessage channel.
  cardFullscreen: {
    borderRadius: 0,
    borderWidth: 0,
    boxShadow: 'none',
  },
  card: {
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    transitionProperty: 'width, height',
    transitionDuration: 'var(--duration-medium, 410ms)',
    transitionTimingFunction:
      'var(--ease-standard, cubic-bezier(0.24, 1, 0.4, 1))',
  },
  iframe: {
    border: 'none',
    width: '100%',
    height: '100%',
    display: 'block',
    // Transparent so the iframe's own themed body color shows (not the
    // docsite/astryx body color). The selected theme paints inside the iframe.
    backgroundColor: 'transparent',
  },
  // Let pointer events pass through to window while the panel is being resized,
  // so dragging over the iframe doesn't stall the drag.
  iframeInert: {
    pointerEvents: 'none',
  },
  exitButtonCard: {
    position: 'absolute',
    top: 'var(--spacing-4)',
    right: 'var(--spacing-4)',
    zIndex: 51,
    boxShadow: 'var(--shadow-med)',
  },
});

interface PreviewStageProps {
  viewport: Viewport;
  isFullscreen: boolean;
  onExitFullscreen: () => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  /** Disable iframe pointer events (e.g. while the panel is being resized). */
  isInteractionDisabled?: boolean;
}

export function PreviewStage({
  viewport,
  isFullscreen,
  onExitFullscreen,
  iframeRef,
  isInteractionDisabled = false,
}: PreviewStageProps) {
  const isPhone = !isFullscreen && viewport === 'phone';
  const width = isPhone ? PHONE_WIDTH : '100%';
  const height = isPhone ? PHONE_HEIGHT : '100%';

  return (
    <div
      {...stylex.props(
        s.area,
        isPhone && s.areaCenter,
        isFullscreen && s.fullscreen,
      )}>
      {isFullscreen && (
        <XDSCard padding={0} xstyle={s.exitButtonCard}>
          <XDSButton
            label="Exit fullscreen"
            tooltip="Exit fullscreen"
            variant="ghost"
            size="sm"
            isIconOnly
            icon={<Minimize2 size={16} />}
            onClick={onExitFullscreen}
          />
        </XDSCard>
      )}
      <XDSCard
        padding={0}
        xstyle={[s.card, isFullscreen && s.cardFullscreen]}
        style={{width, height}}>
        <iframe
          ref={iframeRef}
          src="/playground-preview"
          sandbox="allow-scripts allow-same-origin"
          title="Preview"
          {...stylex.props(s.iframe, isInteractionDisabled && s.iframeInert)}
        />
      </XDSCard>
    </div>
  );
}
