// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {XDSIcon} from '@xds/core/Icon';
import {HomeIcon} from '@heroicons/react/24/outline';

export default function BreadcrumbsDeepHierarchy() {
  return (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem
        href="/"
        startIcon={<XDSIcon icon={HomeIcon} size="sm" />}>
        Home
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/products">Products</XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/products/electronics">
        Electronics
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem href="/products/electronics/phones">
        Phones
      </XDSBreadcrumbItem>
      <XDSBreadcrumbItem isCurrent>iPhone 15 Pro</XDSBreadcrumbItem>
    </XDSBreadcrumbs>
  );
}
