// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared lazy-loaded registry of template page components, keyed by slug.
 *
 * Both the templates gallery thumbnails (TemplateThumbnail) and the
 * preview dialog (TemplatePreviewDialog) render the template's real
 * `page.tsx` component, so the lazy import map lives here to keep a
 * single source of truth.
 *
 * SYNC: when a page template is added under
 * packages/core/templates/pages/<slug>/, add a matching entry here.
 */

import {lazy} from 'react';
import type React from 'react';

export const TEMPLATE_COMPONENTS: Record<
  string,
  React.LazyExoticComponent<React.ComponentType>
> = {
  'ai-chat': lazy(
    () => import('../../../../packages/core/templates/pages/ai-chat/page'),
  ),
  'ai-chat-landing': lazy(
    () =>
      import('../../../../packages/core/templates/pages/ai-chat-landing/page'),
  ),
  blank: lazy(
    () => import('../../../../packages/core/templates/pages/blank/page'),
  ),
  'centered-hero': lazy(
    () => import('../../../../packages/core/templates/pages/centered-hero/page'),
  ),
  'classic-gallery': lazy(
    () =>
      import('../../../../packages/core/templates/pages/classic-gallery/page'),
  ),
  'contact-form': lazy(
    () => import('../../../../packages/core/templates/pages/contact-form/page'),
  ),
  dashboard: lazy(
    () => import('../../../../packages/core/templates/pages/dashboard/page'),
  ),
  'dashboard-portfolio': lazy(
    () =>
      import('../../../../packages/core/templates/pages/dashboard-portfolio/page'),
  ),
  'detail-page': lazy(
    () => import('../../../../packages/core/templates/pages/detail-page/page'),
  ),
  documentation: lazy(
    () => import('../../../../packages/core/templates/pages/documentation/page'),
  ),
  'documentation-design': lazy(
    () =>
      import('../../../../packages/core/templates/pages/documentation-design/page'),
  ),
  'documentation-technical': lazy(
    () =>
      import('../../../../packages/core/templates/pages/documentation-technical/page'),
  ),
  editor: lazy(
    () => import('../../../../packages/core/templates/pages/editor/page'),
  ),
  'file-explorer': lazy(
    () => import('../../../../packages/core/templates/pages/file-explorer/page'),
  ),
  'form-two-column': lazy(
    () =>
      import('../../../../packages/core/templates/pages/form-two-column/page'),
  ),
  'gallery-hero': lazy(
    () => import('../../../../packages/core/templates/pages/gallery-hero/page'),
  ),
  ide: lazy(() => import('../../../../packages/core/templates/pages/ide/page')),
  'kanban-board': lazy(
    () => import('../../../../packages/core/templates/pages/kanban-board/page'),
  ),
  library: lazy(
    () => import('../../../../packages/core/templates/pages/library/page'),
  ),
  login: lazy(
    () => import('../../../../packages/core/templates/pages/login/page'),
  ),
  'login-card': lazy(
    () => import('../../../../packages/core/templates/pages/login-card/page'),
  ),
  'login-split': lazy(
    () => import('../../../../packages/core/templates/pages/login-split/page'),
  ),
  'login-sso': lazy(
    () => import('../../../../packages/core/templates/pages/login-sso/page'),
  ),
  'mixed-gallery': lazy(
    () => import('../../../../packages/core/templates/pages/mixed-gallery/page'),
  ),
  'payment-form': lazy(
    () => import('../../../../packages/core/templates/pages/payment-form/page'),
  ),
  'product-detail': lazy(
    () =>
      import('../../../../packages/core/templates/pages/product-detail/page'),
  ),
  'product-gallery': lazy(
    () =>
      import('../../../../packages/core/templates/pages/product-gallery/page'),
  ),
  settings: lazy(
    () => import('../../../../packages/core/templates/pages/settings/page'),
  ),
  'settings-dialog': lazy(
    () =>
      import('../../../../packages/core/templates/pages/settings-dialog/page'),
  ),
  'settings-sidebar': lazy(
    () =>
      import('../../../../packages/core/templates/pages/settings-sidebar/page'),
  ),
  'side-gallery': lazy(
    () => import('../../../../packages/core/templates/pages/side-gallery/page'),
  ),
  'shell-nav': lazy(
    () => import('../../../../packages/core/templates/pages/shell-nav/page'),
  ),
  'shell-side-nav': lazy(
    () =>
      import('../../../../packages/core/templates/pages/shell-side-nav/page'),
  ),
  'shell-top-nav': lazy(
    () => import('../../../../packages/core/templates/pages/shell-top-nav/page'),
  ),
  table: lazy(
    () => import('../../../../packages/core/templates/pages/table/page'),
  ),
  'table-grouped': lazy(
    () => import('../../../../packages/core/templates/pages/table-grouped/page'),
  ),
  'table-page': lazy(
    () => import('../../../../packages/core/templates/pages/table-page/page'),
  ),
  'table-page-chart': lazy(
    () =>
      import('../../../../packages/charts/templates/pages/table-page-chart/page'),
  ),
  'table-page-heatmap-status': lazy(
    () =>
      import('../../../../packages/lab/templates/pages/table-page-heatmap-status/page'),
  ),
  'table-page-shoe-store-heatmap': lazy(
    () =>
      import('../../../../packages/charts/templates/pages/table-page-shoe-store-heatmap/page'),
  ),
};

/** Resolve a template's lazy component by slug, or `undefined` if unknown. */
export function getTemplateComponent(
  slug: string,
): React.LazyExoticComponent<React.ComponentType> | undefined {
  return TEMPLATE_COMPONENTS[slug];
}
