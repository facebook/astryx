'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';

export default function BreadcrumbsCustomSeparator() {
  return (
    <XDSBreadcrumbs separator="›">
      <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/docs">Docs</XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>API Reference</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  );
}
