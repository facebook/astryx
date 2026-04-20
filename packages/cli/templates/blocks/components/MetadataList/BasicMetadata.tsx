'use client';

import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';

export default function BasicMetadata() {
  return (
    <XDSMetadataList>
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
    </XDSMetadataList>
  );
}
