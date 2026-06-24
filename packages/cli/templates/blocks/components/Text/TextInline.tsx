// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Text} from '@astryxdesign/core/Text';

export default function TextInline() {
  return (
    <Text type="body" display="block">Design tokens are{' '}
      <Text type="code">themeable</Text>
      {' '}and shared across every surface.
          </Text>
  );
}
