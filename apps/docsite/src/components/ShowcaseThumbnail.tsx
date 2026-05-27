// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import React, {
  lazy,
  Suspense,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSText} from '@xds/core/Text';
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';

const FIXED_SCALE = 0.5;

const styles = stylex.create({
  container: {
    width: '100%',
    aspectRatio: '16/10',
    overflow: 'hidden',
    position: 'relative' as const,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    contentVisibility: 'auto',
    containIntrinsicSize: 'auto 300px 187px',
  },
  scaler: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '200%',
    transformOrigin: 'top left',
    pointerEvents: 'none' as const,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

class ShowcaseErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {hasError: boolean}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  render() {
    if (this.state.hasError) {
      return (
        <div {...stylex.props(styles.errorFallback)}>
          <XDSText type="supporting" color="secondary">
            Preview unavailable
          </XDSText>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Dynamically import a showcase block component.
 * Uses webpack's dynamic import with a template literal that includes
 * enough static path for webpack to create a chunk group.
 */
function lazyShowcase(category: string, dirName: string) {
  return lazy(
    () =>
      import(
        /* webpackChunkName: "showcase-[request]" */
        `../../../../packages/cli/templates/blocks/${category}/${dirName}`
      ),
  );
}

const componentCache = new Map<
  string,
  React.LazyExoticComponent<React.ComponentType>
>();

function getShowcaseComponent(
  category: string,
  dirName: string,
): React.LazyExoticComponent<React.ComponentType> {
  const key = `${category}/${dirName}`;
  const cached = componentCache.get(key);
  if (cached != null) {
    return cached;
  }
  const component = lazyShowcase(category, dirName);
  componentCache.set(key, component);
  return component;
}

export function ShowcaseThumbnail({
  dirName,
  category,
}: {
  dirName: string;
  category: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderWidth, setRenderWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setRenderWidth(containerRef.current.offsetWidth / FIXED_SCALE);
    }
  }, []);

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

  const Component = getShowcaseComponent(category, dirName);

  return (
    <div ref={containerRef} {...stylex.props(styles.container)} inert>
      {renderWidth > 0 && isVisible && (
        <div
          {...stylex.props(styles.scaler)}
          style={{width: renderWidth, transform: `scale(${FIXED_SCALE})`}}>
          <ShowcaseErrorBoundary>
            <Suspense
              fallback={
                <div {...stylex.props(styles.skeleton)}>
                  <XDSSkeleton width="100%" height="100%" />
                </div>
              }>
              <XDSTheme theme={neutralTheme}>
                <Component />
              </XDSTheme>
            </Suspense>
          </ShowcaseErrorBoundary>
        </div>
      )}
    </div>
  );
}
