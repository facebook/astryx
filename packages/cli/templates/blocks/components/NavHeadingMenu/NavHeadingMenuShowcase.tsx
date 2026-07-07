// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {NavHeadingMenu, NavHeadingMenuItem} from '@astryxdesign/core/NavMenu';
import {Card} from '@astryxdesign/core/Card';
import {
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function NavHeadingMenuShowcase() {
  return (
    <Card padding={2}>
      <NavHeadingMenu>
        <NavHeadingMenuItem
          icon={ChartBarIcon}
          label="Analytics"
          description="Dashboards and reports"
          href="#"
        />
        <NavHeadingMenuItem
          icon={DocumentTextIcon}
          label="Documents"
          description="Files and shared docs"
          href="#"
        />
        <NavHeadingMenuItem icon={Cog6ToothIcon} label="Settings" href="#" />
      </NavHeadingMenu>
    </Card>
  );
}
