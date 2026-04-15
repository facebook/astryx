'use client';

import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {XDSHeading} from '@xds/core/Text';

export default function MetadataListWithTitleAndShowMore() {
  return (
    <XDSMetadataList
      title={<XDSHeading level={4}>Details</XDSHeading>}
      maxNumOfItems={3}>
      <XDSMetadataListItem label="Name">Value</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Created">Jan 2026</XDSMetadataListItem>
      <XDSMetadataListItem label="Updated">Mar 2026</XDSMetadataListItem>
    </XDSMetadataList>
  );
}
