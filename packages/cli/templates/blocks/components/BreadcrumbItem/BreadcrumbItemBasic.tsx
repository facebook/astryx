// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';

export default function BreadcrumbItemBasic() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Profile</BreadcrumbItem>
    </Breadcrumbs>
  );
}
