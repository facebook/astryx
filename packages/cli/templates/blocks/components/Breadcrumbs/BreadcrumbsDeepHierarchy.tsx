'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';

export default function BreadcrumbsDeepHierarchy() {
  return (
    <XDSBreadcrumbs>
      <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
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
