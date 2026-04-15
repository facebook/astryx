'use client';

import {XDSMetadataList} from '@xds/core/MetadataList';

export default function MetadataListShowcase() {
  return <XDSMetadataList items={[{label: 'Status', value: 'Active'}]} />;
}
