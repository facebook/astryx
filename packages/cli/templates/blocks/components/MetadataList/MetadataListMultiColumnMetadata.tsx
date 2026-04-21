'use client';

import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {XDSToken} from '@xds/core/Token';

export default function MetadataListMultiColumnMetadata() {
  return (
    <XDSMetadataList columns="multi">
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Created">Jan 15, 2026</XDSMetadataListItem>
      <XDSMetadataListItem label="Tags">
        <span style={{display: 'flex', gap: 4}}>
          <XDSToken label="component" />
          <XDSToken label="xds" />
        </span>
      </XDSMetadataListItem>
      <XDSMetadataListItem label="Priority">Tier 1</XDSMetadataListItem>
    </XDSMetadataList>
  );
}
