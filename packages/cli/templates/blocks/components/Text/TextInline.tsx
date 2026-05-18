// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSText} from '@xds/core/Text';

export default function TextInline() {
  return (
    <XDSText type="body" display="block">
      Design tokens are{' '}
      <XDSText type="code">themeable</XDSText>
      {' '}and shared across every surface.
    </XDSText>
  );
}
