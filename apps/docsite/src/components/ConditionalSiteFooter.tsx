// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Renders the site footer everywhere except immersive template preview
 * routes (/templates/<slug>). Those pages are fixed-height, single-scroll
 * preview windows where a trailing legal footer would force the document
 * itself to scroll. The templates gallery (/templates) keeps the footer.
 */

import {usePathname} from 'next/navigation';
import {SiteFooter} from './SiteFooter';

export function ConditionalSiteFooter() {
  const pathname = usePathname();
  const isTemplatePreview = /^\/templates\/.+/.test(pathname ?? '');

  if (isTemplatePreview) {
    return null;
  }

  return <SiteFooter />;
}
