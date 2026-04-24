'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';

export default function BreadcrumbItemShowcase() {
  return (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem
        href="/"
        startIcon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          </svg>
        }>
        Home
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/settings">Settings</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/settings/profile">Profile</XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>Edit</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  );
}
