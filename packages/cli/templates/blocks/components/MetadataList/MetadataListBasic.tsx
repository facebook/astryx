'use client';

import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';

export default function MetadataListBasic() {
  return (
    <XDSMetadataList>
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
    </XDSMetadataList>
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: MetadataListBasic,
};
