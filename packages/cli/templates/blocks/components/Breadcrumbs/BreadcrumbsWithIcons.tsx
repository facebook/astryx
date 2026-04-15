'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';

function HomeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export default function BreadcrumbsWithIcons() {
  return (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem href="/" startIcon={<HomeIcon />}>
        Home
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>Settings</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  );
}
