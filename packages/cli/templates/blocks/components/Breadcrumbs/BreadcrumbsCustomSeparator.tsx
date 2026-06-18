// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Breadcrumbs, BreadcrumbItem} from '@xds/core/Breadcrumbs';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

const SEPARATORS = [
  {char: '›', label: 'Chevron'},
  {char: '→', label: 'Arrow'},
  {char: '·', label: 'Dot'},
];

export default function BreadcrumbsCustomSeparator() {
  return (
    <Stack direction="vertical" gap={4}>
      {SEPARATORS.map(({char, label}) => (
        <Stack key={label} direction="vertical" gap={1}>
          <Text type="supporting" color="secondary">
            {label}
          </Text>
          <Breadcrumbs separator={char}>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
            <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
          </Breadcrumbs>
        </Stack>
      ))}
    </Stack>
  );
}
