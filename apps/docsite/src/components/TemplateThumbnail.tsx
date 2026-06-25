// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Suspense, useRef, useState, useEffect, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {useThemeMode} from '../app/providers';
import {TEMPLATE_COMPONENTS} from './templateComponents';

const FIXED_SCALE = 0.5;

const styles = stylex.create({
  container: {
    width: '100%',
    aspectRatio: '16/10',
    overflow: 'hidden',
    position: 'relative' as const,
    borderRadius: 'var(--radius-container)',
    // Templates render transparent (content-only, no AppShell), so the
    // thumbnail host supplies the page background — use the app surface color.
    backgroundColor: 'var(--color-background-surface)',
    contentVisibility: 'auto',
    containIntrinsicSize: 'auto 300px 187px',
  },
  scaler: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    transformOrigin: 'top left',
    pointerEvents: 'none' as const,
    overflow: 'hidden',
  },
  skeleton: {
    width: '100%',
    height: '100%',
  },
  errorFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-muted)',
  },
});

export function TemplateThumbnail({
  slug,
  aspectRatio,
  renderWidth: fixedRenderWidth,
  borderRadius,
}: {
  slug: string;
  /** Crop window aspect ratio (CSS aspect-ratio). Defaults to '16/10'. */
  aspectRatio?: string;
  /**
   * Width (px) to render the template at before scaling it to fit the tile.
   * Default (undefined) renders at 2× the tile width (scale 0.5) — a zoomed-in
   * slice. Pass a desktop width (e.g. 1100) to render the FULL page composition
   * and shrink it to fit, so the whole page shows rather than a top-left corner.
   */
  renderWidth?: number;
  /**
   * Override the container's corner radius (CSS border-radius). Pass '0' when the
   * thumbnail is already framed/clipped by a rounded parent, so the default
   * --radius-container doesn't nest a second, mismatched radius inside it.
   */
  borderRadius?: string;
}) {
  const {mode} = useThemeMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileWidth, setTileWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setTileWidth(containerRef.current.offsetWidth);
    }
  }, []);

  // Render width: a fixed desktop width (full-page miniature) when provided,
  // else 2× the tile width (the legacy zoomed-in slice).
  const renderWidth =
    fixedRenderWidth != null ? fixedRenderWidth : tileWidth / FIXED_SCALE;
  // Scale so the rendered width fits the tile width.
  const scale = renderWidth > 0 ? tileWidth / renderWidth : FIXED_SCALE;

  // Intersection observer: track visibility for Activity mode
  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      {rootMargin: '200px'},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Measure container width to compute render width
  useEffect(() => {
    updateWidth();
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateWidth]);

  const Component = TEMPLATE_COMPONENTS[slug];
  if (!Component) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      {...stylex.props(styles.container)}
      style={
        aspectRatio || borderRadius
          ? {
              ...(aspectRatio ? {aspectRatio} : {}),
              ...(borderRadius ? {borderRadius} : {}),
            }
          : undefined
      }
      inert>
      {tileWidth > 0 && isVisible && (
        <div
          {...stylex.props(styles.scaler)}
          style={{
            width: renderWidth,
            height: `${100 / scale}%`,
            transform: `scale(${scale})`,
          }}>
          <Suspense
            fallback={
              <div {...stylex.props(styles.skeleton)}>
                <Skeleton width="100%" height="100%" />
              </div>
            }>
            <Theme theme={neutralTheme} mode={mode}>
              <Component />
            </Theme>
          </Suspense>
        </div>
      )}
    </div>
  );
}
