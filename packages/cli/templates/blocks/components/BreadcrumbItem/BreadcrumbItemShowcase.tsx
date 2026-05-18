// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ComponentProps} from 'react';
import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

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
    <XDSVStack gap={4}>
      <XDSVStack gap={1}>
        <XDSText type="supporting" color="secondary">
          With start icon
        </XDSText>
        <XDSBreadcrumbs>
          <XDSBreadcrumbItem href="/" startIcon={<HomeIcon />}>
            Home
          </XDSBreadcrumbItem>
          <XDSBreadcrumbItem href="/docs">Docs</XDSBreadcrumbItem>
          <XDSBreadcrumbItem isCurrent>Components</XDSBreadcrumbItem>
        </XDSBreadcrumbs>
      </XDSVStack>

      <XDSVStack gap={1}>
        <XDSText type="supporting" color="secondary">
          As current page (non-link)
        </XDSText>
        <XDSBreadcrumbs>
          <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
          <XDSBreadcrumbItem href="/settings">Settings</XDSBreadcrumbItem>
          <XDSBreadcrumbItem isCurrent>Profile</XDSBreadcrumbItem>
        </XDSBreadcrumbs>
      </XDSVStack>

      <XDSVStack gap={1}>
        <XDSText type="supporting" color="secondary">
          Supporting variant
        </XDSText>
        <XDSBreadcrumbs variant="supporting">
          <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
          <XDSBreadcrumbItem href="/admin">Admin</XDSBreadcrumbItem>
          <XDSBreadcrumbItem href="/admin/users">Users</XDSBreadcrumbItem>
          <XDSBreadcrumbItem isCurrent>Permissions</XDSBreadcrumbItem>
        </XDSBreadcrumbs>
      </XDSVStack>

      <XDSVStack gap={1}>
        <XDSText type="supporting" color="secondary">
          With onClick handler (no href)
        </XDSText>
        <XDSBreadcrumbs>
          <XDSBreadcrumbItem onClick={() => {}}>Dashboard</XDSBreadcrumbItem>
          <XDSBreadcrumbItem onClick={() => {}}>Projects</XDSBreadcrumbItem>
          <XDSBreadcrumbItem isCurrent>Project Alpha</XDSBreadcrumbItem>
        </XDSBreadcrumbs>
      </XDSVStack>
    </XDSVStack>
  );
}
