// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Badge} from '@astryxdesign/core/Badge';
import {Link} from '@astryxdesign/core/Link';

export default function MetadataListItemShowcase() {
  return (
    <MetadataList title="Project Details">
      <MetadataListItem label="Name">Design System v2</MetadataListItem>
      <MetadataListItem label="Status">
        <Badge label="Active" variant="green" />
      </MetadataListItem>
      <MetadataListItem label="Owner">
        <Link href="#">Alice Johnson</Link>
      </MetadataListItem>
      <MetadataListItem label="Created">January 15, 2025</MetadataListItem>
      <MetadataListItem label="Priority">
        <Badge label="High" variant="red" />
      </MetadataListItem>
      <MetadataListItem label="Repository">
        <Link href="#">github.com/org/design-system</Link>
      </MetadataListItem>
    </MetadataList>
  );
}
