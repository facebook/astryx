// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {rtlStyles} from '@astryxdesign/core/utils';

// A chevron and an arrow point along the reading direction, so they have to
// flip under RTL. A dot does not.
const SEPARATORS = [
  {char: '›', label: 'Chevron', isDirectional: true},
  {char: '→', label: 'Arrow', isDirectional: true},
  {char: '·', label: 'Dot', isDirectional: false},
];

export default function BreadcrumbsCustomSeparator() {
  return (
    <Stack direction="vertical" gap={4}>
      {SEPARATORS.map(({char, label, isDirectional}) => (
        <Stack key={label} direction="vertical" gap={1}>
          <Text type="supporting" color="secondary">
            {label}
          </Text>
          <Breadcrumbs
            separator={
              isDirectional ? (
                <span {...stylex.props(rtlStyles.mirror)}>{char}</span>
              ) : (
                char
              )
            }>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
            <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
          </Breadcrumbs>
        </Stack>
      ))}
    </Stack>
  );
}
