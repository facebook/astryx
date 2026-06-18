// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Breadcrumbs, BreadcrumbItem} from '@xds/core/Breadcrumbs';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function BreadcrumbsSupportingVariant() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Default
        </Text>
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
          <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
        </Breadcrumbs>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Supporting
        </Text>
        <Breadcrumbs variant="supporting">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
          <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
        </Breadcrumbs>
      </Stack>
    </Stack>
  );
}
