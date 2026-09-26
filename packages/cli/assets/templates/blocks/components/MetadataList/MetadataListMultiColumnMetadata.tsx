// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Token} from '@astryxdesign/core/Token';
import {HStack} from '@astryxdesign/core/Layout';

export default function MetadataListMultiColumnMetadata() {
  return (
    <MetadataList columns="multi">
      <MetadataListItem label="Name">MetadataList</MetadataListItem>
      <MetadataListItem label="Status">Active</MetadataListItem>
      <MetadataListItem label="Owner">Joey</MetadataListItem>
      <MetadataListItem label="Created">Jan 15, 2026</MetadataListItem>
      <MetadataListItem label="Tags">
        <HStack gap={1}>
          <Token label="component" />
          <Token label="xds" />
        </HStack>
      </MetadataListItem>
      <MetadataListItem label="Priority">Tier 1</MetadataListItem>
    </MetadataList>
  );
}
