// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function BreadcrumbsSupportingVariant() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Default
        </XDSText>
        <XDSBreadcrumbs>
          <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
          <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
          <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
        </XDSBreadcrumbs>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Supporting
        </XDSText>
        <XDSBreadcrumbs variant="supporting">
          <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
          <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
          <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
        </XDSBreadcrumbs>
      </XDSStack>
    </XDSStack>
  );
}
