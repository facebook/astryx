// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ComponentProps} from 'react';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

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
    <VStack gap={4}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          With start icon
        </Text>
        <Breadcrumbs>
          <BreadcrumbItem href="/" startIcon={<HomeIcon />}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
          <BreadcrumbItem isCurrent>Components</BreadcrumbItem>
        </Breadcrumbs>
      </VStack>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          As current page (non-link)
        </Text>
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
          <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
        </Breadcrumbs>
      </VStack>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          Supporting variant
        </Text>
        <Breadcrumbs variant="supporting">
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/admin">Admin</BreadcrumbItem>
          <BreadcrumbItem href="/admin/users">Users</BreadcrumbItem>
          <BreadcrumbItem isCurrent>Permissions</BreadcrumbItem>
        </Breadcrumbs>
      </VStack>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          With onClick handler (no href)
        </Text>
        <Breadcrumbs>
          <BreadcrumbItem onClick={() => {}}>Dashboard</BreadcrumbItem>
          <BreadcrumbItem onClick={() => {}}>Projects</BreadcrumbItem>
          <BreadcrumbItem isCurrent>Project Alpha</BreadcrumbItem>
        </Breadcrumbs>
      </VStack>
    </VStack>
  );
}
