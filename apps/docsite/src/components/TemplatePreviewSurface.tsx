// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * TemplatePreviewSurface — the live preview "window" for one template.
 *
 * Renders the template's real page.tsx component (shared
 * TEMPLATE_COMPONENTS map) at true scale inside the framed, internally-
 * scrollable surface (see TemplatePreviewSurface.module.css `.frame`).
 * Used by the preview dialog (TemplatePreviewDialog).
 */

import {Suspense} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';
import {useThemeMode} from '../app/providers';
import {getTemplateComponent} from './templateComponents';
import css from './TemplatePreviewSurface.module.css';

const styles = stylex.create({
  emptyState: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-8)',
  },
  skeleton: {
    width: '100%',
    height: '100%',
  },
});

export function TemplatePreviewSurface({slug}: {slug: string}) {
  const {mode} = useThemeMode();
  const Component = getTemplateComponent(slug);

  return (
    <div className={css.frame}>
      {Component ? (
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
      ) : (
        <div {...stylex.props(styles.emptyState)}>
          <XDSText type="body" color="secondary">
            A live preview isn&rsquo;t available for this template yet.
          </XDSText>
        </div>
      )}
    </div>
  );
}
