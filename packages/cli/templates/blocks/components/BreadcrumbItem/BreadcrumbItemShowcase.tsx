'use client';

import type {ComponentProps} from 'react';
import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';

function HomeIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
      />
    </svg>
  );
}

export default function BreadcrumbItemShowcase() {
  return (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem href="/" startIcon={<HomeIcon />}>
        Home
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/settings">Settings</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/settings/profile">Profile</XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>Edit</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  );
}
