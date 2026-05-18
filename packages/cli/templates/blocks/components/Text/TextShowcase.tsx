// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

export default function TextShowcase() {
  return (
    <XDSStack direction="vertical" gap={2}>
      <XDSText type="body">Body: The bulk of content</XDSText>
      <XDSText type="large">Large: Emphasized content</XDSText>
      <XDSText type="label">Label: Form and chart labels</XDSText>
      <XDSText type="supporting">Supporting: Helper text</XDSText>
      <XDSText type="code">Code: const x = 42;</XDSText>
    </XDSStack>
  );
}
