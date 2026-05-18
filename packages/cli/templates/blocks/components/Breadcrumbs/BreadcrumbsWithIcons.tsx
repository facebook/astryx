// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {XDSIcon} from '@xds/core/Icon';
import {HomeIcon, Cog6ToothIcon} from '@heroicons/react/24/outline';

export default function BreadcrumbsWithIcons() {
  return (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem
        href="/"
        startIcon={<XDSIcon icon={HomeIcon} size="sm" />}>
        Home
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem
        href="/settings"
        startIcon={<XDSIcon icon={Cog6ToothIcon} size="sm" />}>
        Settings
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>Profile</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  );
}
