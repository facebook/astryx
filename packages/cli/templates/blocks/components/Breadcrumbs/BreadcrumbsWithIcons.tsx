// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Breadcrumbs, BreadcrumbItem} from '@xds/core/Breadcrumbs';
import {Icon} from '@xds/core/Icon';
import {HomeIcon, Cog6ToothIcon} from '@heroicons/react/24/outline';

export default function BreadcrumbsWithIcons() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem
        href="/"
        startIcon={<Icon icon={HomeIcon} size="sm" />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem
        href="/settings"
        startIcon={<Icon icon={Cog6ToothIcon} size="sm" />}>
        Settings
      </BreadcrumbItem>
      <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
    </Breadcrumbs>
  );
}
