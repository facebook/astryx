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

/**
 * Lazy-loaded template component registry.
 * Maps slugs to dynamically imported template page components.
 */
const TEMPLATE_COMPONENTS: Record<
  string,
  React.LazyExoticComponent<React.ComponentType>
> = {
  'ai-chat': lazy(
    () => import('../../../../packages/cli/templates/pages/ai-chat/page'),
  ),
  'ai-chat-landing': lazy(
    () =>
      import('../../../../packages/cli/templates/pages/ai-chat-landing/page'),
  ),
  blank: lazy(
    () => import('../../../../packages/cli/templates/pages/blank/page'),
  ),
  'centered-hero': lazy(
    () => import('../../../../packages/cli/templates/pages/centered-hero/page'),
  ),
  'classic-gallery': lazy(
    () =>
      import('../../../../packages/cli/templates/pages/classic-gallery/page'),
  ),
  'contact-form': lazy(
    () => import('../../../../packages/cli/templates/pages/contact-form/page'),
  ),
  dashboard: lazy(
    () => import('../../../../packages/cli/templates/pages/dashboard/page'),
  ),
  'dashboard-portfolio': lazy(
    () =>
      import('../../../../packages/cli/templates/pages/dashboard-portfolio/page'),
  ),
  'detail-page': lazy(
    () => import('../../../../packages/cli/templates/pages/detail-page/page'),
  ),
  documentation: lazy(
    () => import('../../../../packages/cli/templates/pages/documentation/page'),
  ),
  'documentation-design': lazy(
    () =>
      import('../../../../packages/cli/templates/pages/documentation-design/page'),
  ),
  'documentation-technical': lazy(
    () =>
      import('../../../../packages/cli/templates/pages/documentation-technical/page'),
  ),
  editor: lazy(
    () => import('../../../../packages/cli/templates/pages/editor/page'),
  ),
  'file-explorer': lazy(
    () => import('../../../../packages/cli/templates/pages/file-explorer/page'),
  ),
  'form-two-column': lazy(
    () =>
      import('../../../../packages/cli/templates/pages/form-two-column/page'),
  ),
  'gallery-hero': lazy(
    () => import('../../../../packages/cli/templates/pages/gallery-hero/page'),
  ),
  ide: lazy(() => import('../../../../packages/cli/templates/pages/ide/page')),
  library: lazy(
    () => import('../../../../packages/cli/templates/pages/library/page'),
  ),
  login: lazy(
    () => import('../../../../packages/cli/templates/pages/login/page'),
  ),
  'login-card': lazy(
    () => import('../../../../packages/cli/templates/pages/login-card/page'),
  ),
  'login-split': lazy(
    () => import('../../../../packages/cli/templates/pages/login-split/page'),
  ),
  'login-sso': lazy(
    () => import('../../../../packages/cli/templates/pages/login-sso/page'),
  ),
  'mixed-gallery': lazy(
    () => import('../../../../packages/cli/templates/pages/mixed-gallery/page'),
  ),
  'payment-form': lazy(
    () => import('../../../../packages/cli/templates/pages/payment-form/page'),
  ),
  'product-detail': lazy(
    () =>
      import('../../../../packages/cli/templates/pages/product-detail/page'),
  ),
  'product-gallery': lazy(
    () =>
      import('../../../../packages/cli/templates/pages/product-gallery/page'),
  ),
  settings: lazy(
    () => import('../../../../packages/cli/templates/pages/settings/page'),
  ),
  'settings-dialog': lazy(
    () =>
      import('../../../../packages/cli/templates/pages/settings-dialog/page'),
  ),
  'settings-sidebar': lazy(
    () =>
      import('../../../../packages/cli/templates/pages/settings-sidebar/page'),
  ),
  'side-gallery': lazy(
    () => import('../../../../packages/cli/templates/pages/side-gallery/page'),
  ),
  table: lazy(
    () => import('../../../../packages/cli/templates/pages/table/page'),
  ),
  'table-grouped': lazy(
    () => import('../../../../packages/cli/templates/pages/table-grouped/page'),
  ),
  'table-page': lazy(
    () => import('../../../../packages/cli/templates/pages/table-page/page'),
  ),
};

export function TemplateThumbnail({slug}: {slug: string}) {
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
            <XDSTheme theme={neutralTheme}>
              <Component />
            </XDSTheme>
          </Suspense>
        </div>
      )}
    </div>
  );
}
