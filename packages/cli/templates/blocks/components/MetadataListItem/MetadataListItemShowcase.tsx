'use client';

import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {XDSBadge} from '@xds/core/Badge';
import {XDSLink} from '@xds/core/Link';

export default function MetadataListItemShowcase() {
  return (
    <XDSMetadataList title="Project Details">
      <XDSMetadataListItem label="Name">Design System v2</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">
        <XDSBadge label="Active" variant="green" />
      </XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">
        <XDSLink href="#">Alice Johnson</XDSLink>
      </XDSMetadataListItem>
      <XDSMetadataListItem label="Created">January 15, 2025</XDSMetadataListItem>
      <XDSMetadataListItem label="Priority">
        <XDSBadge label="High" variant="red" />
      </XDSMetadataListItem>
      <XDSMetadataListItem label="Repository">
        <XDSLink href="#">github.com/org/design-system</XDSLink>
      </XDSMetadataListItem>
    </XDSMetadataList>
  );
}
