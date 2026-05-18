// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSToken} from '@xds/core/Token';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TokenClickable() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Click a token to view details
      </XDSText>
      <XDSStack direction="horizontal" gap={2} wrap="wrap">
        <XDSToken label="Bug" color="red" onClick={() => {}} />
        <XDSToken label="Feature" color="blue" onClick={() => {}} />
        <XDSToken label="Enhancement" color="green" onClick={() => {}} />
        <XDSToken label="Documentation" color="gray" onClick={() => {}} />
      </XDSStack>
    </XDSStack>
  );
}
