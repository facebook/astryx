// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  Suspense,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';
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
    // Templates render transparent (content-only, no XDSAppShell), so the
    // thumbnail host supplies the page background — use the app surface color.
    backgroundColor: 'var(--color-background-surface)',
    contentVisibility: 'auto',
    containIntrinsicSize: 'auto 300px 187px',
  },
  scaler: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: `${100 / FIXED_SCALE}%`,
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

export function TemplateThumbnail({slug}: {slug: string}) {
  const {mode} = useThemeMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderWidth, setRenderWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setRenderWidth(containerRef.current.offsetWidth / FIXED_SCALE);
    }
  }, []);

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
    <div ref={containerRef} {...stylex.props(styles.container)} inert>
      {renderWidth > 0 && isVisible && (
        <div
          {...stylex.props(styles.scaler)}
          style={{width: renderWidth, transform: `scale(${FIXED_SCALE})`}}>
          <Suspense
            fallback={
              <div {...stylex.props(styles.skeleton)}>
                <XDSSkeleton width="100%" height="100%" />
              </div>
            }>
            <XDSTheme theme={neutralTheme} mode={mode}>
              <Component />
            </XDSTheme>
          </Suspense>
        </div>
      )}
    </div>
  );
}
