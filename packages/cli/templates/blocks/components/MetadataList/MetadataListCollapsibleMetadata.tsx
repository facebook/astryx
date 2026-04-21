'use client';

import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';

export default function MetadataListCollapsibleMetadata() {
  return (
    <XDSMetadataList maxNumOfItems={3}>
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Created">Jan 15, 2026</XDSMetadataListItem>
      <XDSMetadataListItem label="Updated">Mar 26, 2026</XDSMetadataListItem>
      <XDSMetadataListItem label="Priority">Tier 1</XDSMetadataListItem>
    </XDSMetadataList>
  );
}
