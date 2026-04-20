'use client';

import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';

export default function MetadataListHorizontalMetadata() {
  return (
    <XDSMetadataList orientation="horizontal">
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Type">Premium</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Created">Jan 15, 2026</XDSMetadataListItem>
    </XDSMetadataList>
  );
}
