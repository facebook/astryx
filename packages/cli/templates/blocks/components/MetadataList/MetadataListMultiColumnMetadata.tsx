// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {XDSToken} from '@xds/core/Token';
import {XDSHStack} from '@xds/core/Layout';

export default function MetadataListMultiColumnMetadata() {
  return (
    <XDSMetadataList columns="multi">
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Created">Jan 15, 2026</XDSMetadataListItem>
      <XDSMetadataListItem label="Tags">
        <XDSHStack gap={1}>
          <XDSToken label="component" />
          <XDSToken label="xds" />
        </XDSHStack>
      </XDSMetadataListItem>
      <XDSMetadataListItem label="Priority">Tier 1</XDSMetadataListItem>
    </XDSMetadataList>
  );
}
