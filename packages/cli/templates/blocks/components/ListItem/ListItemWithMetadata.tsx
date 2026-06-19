// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSText} from '@xds/core/Text';

export default function ListItemWithMetadata() {
  return (
    <XDSList header="Inbox" density="compact" hasDividers>
      <XDSListItem
        label="Launch checklist"
        description="3 tasks still need an owner"
        startContent={<XDSIcon icon="check" size="sm" color="success" />}
        endContent={<XDSBadge label="3" variant="blue" />}
        isSelected
        onClick={() => {}}
      />
      <XDSListItem
        label="Security review"
        description="Waiting on approval"
        startContent={<XDSIcon icon="warning" size="sm" color="warning" />}
        endContent={<XDSText color="secondary">Yesterday</XDSText>}
        onClick={() => {}}
      />
      <XDSListItem
        label="Old incident report"
        description="Archived and read-only"
        startContent={<XDSIcon icon="copy" size="sm" color="secondary" />}
        endContent={<XDSText color="secondary">Apr 12</XDSText>}
        isDisabled
      />
    </XDSList>
  );
}
