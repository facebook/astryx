// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const SEPARATORS = [
  {char: '›', label: 'Chevron'},
  {char: '→', label: 'Arrow'},
  {char: '·', label: 'Dot'},
];

export default function BreadcrumbsCustomSeparator() {
  return (
    <XDSStack direction="vertical" gap={4}>
      {SEPARATORS.map(({char, label}) => (
        <XDSStack key={label} direction="vertical" gap={1}>
          <XDSText type="supporting" color="secondary">
            {label}
          </XDSText>
          <XDSBreadcrumbs separator={char}>
            <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
            <XDSBreadcrumbItem href="/docs">Docs</XDSBreadcrumbItem>
            <XDSBreadcrumbItem isCurrent>API Reference</XDSBreadcrumbItem>
          </XDSBreadcrumbs>
        </XDSStack>
      ))}
    </XDSStack>
  );
}
